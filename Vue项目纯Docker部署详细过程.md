# Vue3 纯 Docker 部署详细过程

## 项目结构准备

```
my-vue-app/
├── public/
├── src/
├── package.json
├── vite.config.ts
├── Dockerfile            ← 新建
├── nginx.conf            ← 新建（容器内 Nginx 配置）
├── .dockerignore         ← 新建
└── .gitlab-ci.yml        ← 新建
```

---

## 第一步：创建 `.dockerignore`

防止不必要文件进入构建上下文，加速构建。

```
node_modules
dist
.git
.gitignore
*.md
.vscode
.env*.local
```

---

## 第二步：创建容器内 `nginx.conf`

这是 **Docker 容器内部** 的 Nginx 配置，不是宿主机的。

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由支持
    # Vue Router history 模式刷新会 404，这里让所有路径回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存（Vite 打包带 hash，可以长期缓存）
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip on;
        gzip_types text/css application/javascript application/json image/svg+xml;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

---

## 第三步：创建 `Dockerfile`（多阶段构建）

```dockerfile
# =============================================
# 阶段1：构建（Node 环境打包）
# =============================================
FROM node:20-alpine AS builder
WORKDIR /app

# 先复制 package 文件，利用 Docker 缓存层
# 只有 package.json 变了才重新 npm ci
COPY package.json package-lock.json ./
RUN npm ci

# 再复制源码并打包
COPY . .
RUN npm run build
# 产物在 /app/dist/

# =============================================
# 阶段2：运行（Nginx 托管静态文件）
# =============================================
FROM nginx:1.25-alpine AS runner

# 删除 Nginx 默认欢迎页
RUN rm -rf /usr/share/nginx/html/*

# 从 builder 阶段复制打包产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 为什么用两阶段构建？

| | 单阶段 | 两阶段构建 |
|--|-------|----------|
| 最终镜像包含 | Node.js + npm + node_modules + 源码 + dist | 只有 Nginx + dist |
| 镜像大小 | ~1GB | ~30MB |
| 安全性 | 暴露源码和依赖 | 只有生产文件 |

---

## 第四步：本地测试

```bash
# 构建镜像
docker build -t my-vue-app:test .

# 运行容器
docker run -d -p 8080:80 --name vue-test my-vue-app:test

# 浏览器打开 http://localhost:8080 验证

# 测试完清理
docker stop vue-test && docker rm vue-test
```

---

## 第五步：创建 `.gitlab-ci.yml`

```yaml
# ====== 全局变量 ======
variables:
  IMAGE_NAME: $CI_REGISTRY_IMAGE     # GitLab 自动提供
  DEPLOY_SERVER: "47.xxx.xxx.xxx"    # 你的阿里云服务器 IP

# ====== 阶段定义 ======
stages:
  - build
  - deploy

# ====== 阶段1：构建并推送 Docker 镜像 ======
build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind                 # Docker in Docker
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    # 构建镜像，打两个 tag
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHORT_SHA -t $IMAGE_NAME:latest .
    # 推送到 GitLab 镜像仓库
    - docker push $IMAGE_NAME:$CI_COMMIT_SHORT_SHA
    - docker push $IMAGE_NAME:latest
    - echo "✅ 镜像构建完成"
  only:
    - main

# ====== 阶段2：SSH 到服务器部署 ======
deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - mkdir -p ~/.ssh
    - echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - ssh-keyscan -H $DEPLOY_SERVER >> ~/.ssh/known_hosts
  script:
    - |
      ssh root@$DEPLOY_SERVER << 'EOF'
        echo "====== 开始部署 ======"

        # 1. 登录镜像仓库
        docker login -u gitlab-ci-token -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

        # 2. 拉取最新镜像
        docker pull $IMAGE_NAME:latest

        # 3. 停止并删除旧容器
        docker stop vue-app || true
        docker rm vue-app || true

        # 4. 启动新容器
        docker run -d \
          --name vue-app \
          -p 8080:80 \
          --restart always \
          $IMAGE_NAME:latest

        # 5. 清理旧镜像
        docker image prune -f

        echo "✅ 部署完成"
      EOF
  only:
    - main
```

---

## 第六步：配置 GitLab CI/CD Variables

GitLab → 项目 → **Settings → CI/CD → Variables**：

| Variable | 值 | 说明 |
|----------|---|------|
| `SSH_PRIVATE_KEY` | 服务器 SSH 私钥内容 | Protected + Masked |

> `CI_REGISTRY`、`CI_REGISTRY_USER`、`CI_REGISTRY_PASSWORD` GitLab **自动注入**，无需手动设置。

---

## 第七步：配置宿主机 Nginx 反代

服务器上 `/etc/nginx/conf.d/vue-app.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.cn;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
nginx -t && nginx -s reload
```

---

## 完整请求链路

```
用户浏览器
    ↓ 请求 https://your-domain.cn/about
宿主机 Nginx(:80)
    ↓ proxy_pass
Docker 容器 Nginx(:8080 → 容器内 :80)
    ↓ try_files
    ├── /about 文件不存在
    └── 回退到 /index.html
    ↓
返回 index.html → Vue Router 接管 → 渲染 /about 页面
    ↓
浏览器加载 /assets/js/app-xxx.js（同样走这条链路）
```

---

## 完整执行时序

```
开发者 git push main
      ↓
GitLab 读取 .gitlab-ci.yml
      ↓
┌── build stage ───────────────────────────────────┐
│  Runner 启动 docker:24 容器                       │
│  ↓                                                │
│  执行 docker build .                              │
│  ↓ 读取 Dockerfile                                │
│  ├── FROM node:20-alpine                          │
│  ├── npm ci                                       │
│  ├── npm run build        → 生成 dist/            │
│  ├── FROM nginx:alpine                            │
│  ├── COPY dist → nginx    → 30MB 精简镜像          │
│  ↓                                                │
│  执行 docker push         → 推送到 GitLab Registry │
└──────────────────────────────────────────────────┘
      ↓
┌── deploy stage ──────────────────────────────────┐
│  Runner 启动 alpine 容器                          │
│  ↓                                                │
│  SSH 到阿里云服务器                                │
│  ├── docker pull          → 拉取最新镜像           │
│  ├── docker stop/rm       → 停掉旧容器             │
│  └── docker run           → 启动新容器             │
└──────────────────────────────────────────────────┘
      ↓
✅ 用户访问看到最新版本
```

---

## CI 和 Dockerfile 的关系

| | `.gitlab-ci.yml` | `Dockerfile` |
|--|-----------------|-------------|
| 角色 | 流水线编排（总调度） | 镜像构建说明书 |
| 谁触发 | git push 自动触发 | CI 里的 `docker build` 触发 |
| 运行在哪 | GitLab Runner 上 | Docker 引擎中 |
| 类比 | 工厂流水线排程表 | 一个产品的生产图纸 |

> **CI 是流水线，Dockerfile 是流水线上某一道工序的操作手册。**
