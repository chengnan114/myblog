# Vue3 + Docker CI/CD 部署方案

## CI 文件和 Dockerfile 的执行关系

**先执行 CI 文件（`.gitlab-ci.yml`），CI 过程中调用 Dockerfile。**

它们是包含关系，不是并列关系：

```
.gitlab-ci.yml 是"总指挥"
      ↓
在某个 stage 的 script 里执行 docker build
      ↓
docker build 才会读取 Dockerfile 并执行
```

> CI 是流水线，Dockerfile 是流水线上某一道工序的操作手册。

---

## 整体架构

```
Next.js（SSR 动态渲染）：
  Docker 容器内 = Node.js server.js
  宿主机 Nginx → 反代到容器 :3000

Vue3 SPA（纯静态）：
  Docker 容器内 = Nginx（托管 dist/ 静态文件）
  宿主机 Nginx → 反代到容器 :80
```

---

## 方案一：纯 Docker 部署（不用 CDN）

### Dockerfile

```dockerfile
# ---- 阶段1：构建 ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
# 产物在 /app/dist/

# ---- 阶段2：Nginx 托管 ----
FROM nginx:alpine AS runner
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 容器内 `nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由：所有路径回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### `.gitlab-ci.yml`

```yaml
variables:
  IMAGE_NAME: registry.gitlab.com/your-group/your-project
  DEPLOY_SERVER: "47.xxx.xxx.xxx"

stages:
  - build
  - deploy

# ---- 构建 Docker 镜像 ----
build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHORT_SHA -t $IMAGE_NAME:latest .
    - docker push $IMAGE_NAME:$CI_COMMIT_SHORT_SHA
    - docker push $IMAGE_NAME:latest
  only:
    - main

# ---- 部署到服务器 ----
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
        docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
        docker pull $IMAGE_NAME:latest
        docker stop vue-app || true
        docker rm vue-app || true
        docker run -d \
          --name vue-app \
          -p 8080:80 \
          --restart always \
          $IMAGE_NAME:latest
        echo "✅ 部署完成"
      EOF
  only:
    - main
```

### 宿主机 Nginx 反代

```nginx
server {
    listen 80;
    server_name your-domain.cn;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 请求流程

```
用户 → 宿主机 Nginx(:80) → Docker 容器 Nginx(:8080) → 返回静态文件
```

---

## 方案二：Docker + CDN（推荐）

静态资源分离走 CDN，Docker 只负责 index.html。

### `.gitlab-ci.yml`

```yaml
variables:
  IMAGE_NAME: registry.gitlab.com/your-group/your-project
  OSS_BUCKET: "my-vue-cdn"
  OSS_ENDPOINT: "oss-cn-hangzhou.aliyuncs.com"
  DEPLOY_SERVER: "47.xxx.xxx.xxx"

stages:
  - build
  - upload-cdn
  - deploy

# ---- 阶段1：打包 ----
build:
  stage: build
  image: node:20-alpine
  script:
    - npm ci
    - npm run build    # vite.config.ts 中 base 已设为 CDN 地址
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

# ---- 阶段2：上传静态资源到 OSS ----
upload-cdn:
  stage: upload-cdn
  image: alpine:latest
  dependencies:
    - build
  script:
    - apk add --no-cache curl
    - curl -o ossutil https://gosspublic.alicdn.com/ossutil/v2/2.0.3-beta.09041200/ossutil-2.0.3-beta.09041200-linux-amd64
    - chmod +x ossutil && mv ossutil /usr/local/bin/
    - |
      cat > ~/.ossutilconfig << EOF
      [default]
      accessKeyId=${ACCESS_KEY_ID}
      accessKeySecret=${ACCESS_KEY_SECRET}
      endpoint=${OSS_ENDPOINT}
      EOF
    - ossutil cp -r dist/assets/ oss://${OSS_BUCKET}/assets/ --update --meta "Cache-Control:public,max-age=31536000"
    - echo "✅ 静态资源已上传到 OSS"
  only:
    - main

# ---- 阶段3：构建 Docker 镜像 & 部署 ----
deploy:
  stage: deploy
  image: docker:24
  services:
    - docker:24-dind
  dependencies:
    - build
  script:
    # 删除 assets（已上传到 OSS）
    - rm -rf dist/assets/
    # 构建精简版镜像（只有 index.html）
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHORT_SHA -t $IMAGE_NAME:latest .
    - docker push $IMAGE_NAME:latest
    # SSH 部署
    - apk add --no-cache openssh-client
    - mkdir -p ~/.ssh
    - echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - ssh-keyscan -H $DEPLOY_SERVER >> ~/.ssh/known_hosts
    - |
      ssh root@$DEPLOY_SERVER << 'ENDSSH'
        docker pull $IMAGE_NAME:latest
        docker stop vue-app || true
        docker rm vue-app || true
        docker run -d --name vue-app -p 8080:80 --restart always $IMAGE_NAME:latest
        echo "✅ 部署完成"
      ENDSSH
  only:
    - main
```

### 请求流程

```
用户访问 https://your-domain.cn
      ↓
宿主机 Nginx → Docker 容器 Nginx → 返回 index.html
      ↓
浏览器解析 index.html，请求静态资源：
  https://cdn.your-domain.cn/assets/js/app-a1b2c3.js
      ↓
CDN 边缘节点 → 回源 OSS → 返回文件
```

---

## 详细执行时序

```
git push 到 main 分支
      ↓
┌─ GitLab 读取 .gitlab-ci.yml → 启动 Pipeline ───────┐
│                                                      │
│  Stage 1: build                                      │
│  ├── CI Runner 启动 node:20-alpine 容器              │
│  ├── npm ci（安装依赖）                               │
│  └── npm run build（打包产物到 dist/）                 │
│                                                      │
│  Stage 2: upload-cdn（仅 Docker+CDN 方案）            │
│  ├── 安装 ossutil                                     │
│  └── 上传 dist/assets/ → OSS                         │
│                                                      │
│  Stage 3: deploy                                     │
│  ├── docker build -t my-app:latest .                 │
│  │   ↓ 这时才读取 Dockerfile：                        │
│  │   ├── FROM node:20-alpine → npm ci → npm run build│
│  │   ├── FROM nginx:alpine                           │
│  │   └── COPY dist → nginx html                      │
│  ├── docker push（推送到镜像仓库）                     │
│  ├── SSH 到服务器                                     │
│  ├── docker pull（拉取镜像）                           │
│  ├── docker stop/rm 旧容器                            │
│  └── docker run 新容器                                │
│                                                      │
└──────────────────────────────────────────────────────┘
      ↓
✅ 部署完成
```

---

## 两种方案对比

| | 纯 Docker | Docker + CDN |
|--|----------|-------------|
| 架构 | 所有文件在容器内 | index.html 在容器，assets 在 OSS/CDN |
| 性能 | 取决于服务器带宽 | 静态资源全国加速 |
| 镜像大小 | 较大（含所有静态文件） | 很小（只有 index.html） |
| 复杂度 | 简单 | 中等（需配 OSS + CDN） |
| 适用场景 | 内部系统、小项目 | 面向公众的正式项目 |
| 费用 | 无额外费用 | OSS + CDN 少量费用 |

---

## 和 Next.js 项目对比

| | Next.js（SSR） | Vue3 SPA |
|--|---------------|----------|
| Docker 内运行 | `node server.js` | `nginx` |
| 渲染方式 | 服务端渲染 | 客户端渲染 |
| 打包产物 | `.next/`（JS + 预渲染页面） | `dist/`（纯静态文件） |
| 需要 Node 运行时？ | ✅ 是 | ❌ 否 |
| 容器大小 | 较大（含 Node） | 很小（只有 Nginx + HTML） |
