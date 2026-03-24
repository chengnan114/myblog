# Vue3 + Vite 项目 CDN 部署方案

## 整体架构

```
开发者 push 代码
      ↓
GitLab CI/CD Runner 触发
      ↓
安装依赖 → 打包构建
      ↓
  ┌───────────────────────────┐
  │  dist/                    │
  │  ├── index.html           │ → 部署到 Nginx 服务器
  │  └── assets/              │ → 上传到 OSS → CDN 加速
  │      ├── js/xxx-hash.js   │
  │      ├── css/xxx-hash.css │
  │      └── img/xxx-hash.png │
  └───────────────────────────┘
      ↓
用户访问：
  index.html ← Nginx（源站）
  assets/*   ← CDN 边缘节点（就近访问）
```

---

## 一、第三方依赖通过 CDN 引入（减小打包体积）

将 Vue、Vue Router、Pinia、Axios 等大型依赖**不打包进 bundle**，从公共 CDN 加载。

### 1. 安装插件

```bash
npm install vite-plugin-cdn-import -D
```

### 2. 配置 `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { autoComplete, Plugin as importToCDN } from 'vite-plugin-cdn-import'

export default defineConfig({
  plugins: [
    vue(),
    importToCDN({
      prodUrl: 'https://cdn.jsdelivr.net/npm/{name}@{version}/{path}',
      modules: [
        autoComplete('vue'),
        autoComplete('axios'),
        {
          name: 'vue-router',
          var: 'VueRouter',
          path: 'dist/vue-router.global.prod.min.js',
        },
        {
          name: 'pinia',
          var: 'Pinia',
          path: 'dist/pinia.iife.prod.min.js',
        },
        {
          name: 'element-plus',
          var: 'ElementPlus',
          path: 'dist/index.full.min.js',
          css: 'dist/index.css',
        },
      ],
    }),
  ],
})
```

### 3. 体积对比

| 依赖 | 打包前大小 | CDN 后 |
|------|----------|--------|
| Vue | ~80KB | ✅ 移除 |
| Element Plus | ~800KB | ✅ 移除 |
| Axios | ~30KB | ✅ 移除 |
| Vue Router | ~25KB | ✅ 移除 |
| **总计可节省** | | **约 1MB+** |

> **常用公共 CDN 源：**
> - 国际：`cdn.jsdelivr.net`、`unpkg.com`
> - 国内推荐：`cdn.bootcdn.net`、`cdn.staticfile.org`

---

## 二、打包产物部署到 CDN（静态资源加速）

### 1. 配置 `vite.config.ts` 的 `base`

```ts
export default defineConfig(({ mode }) => ({
  base: mode === 'production'
    ? 'https://cdn.chengnanblog.cn/'
    : '/',

  build: {
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) return 'element-plus'
            if (id.includes('vue')) return 'vue-vendor'
            return 'vendor'
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
}))
```

### 2. 两者结合的完整配置

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { autoComplete, Plugin as importToCDN } from 'vite-plugin-cdn-import'

export default defineConfig(({ mode }) => ({
  base: mode === 'production'
    ? 'https://cdn.chengnanblog.cn/'
    : '/',

  plugins: [
    vue(),
    importToCDN({
      prodUrl: 'https://cdn.bootcdn.net/ajax/libs/{name}/{version}/{path}',
      modules: [
        autoComplete('vue'),
        autoComplete('axios'),
      ],
    }),
  ],

  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
}))
```

---

## 三、前置准备

### 1. 创建阿里云 OSS Bucket

- 阿里云控制台 → 对象存储 OSS → 创建 Bucket
- 名称：如 `my-vue-cdn`
- 地域：和服务器同地域
- 权限：**公共读**

### 2. 创建 RAM 子账号

- RAM 访问控制 → 创建用户 → 勾选 OpenAPI 调用访问
- 分配权限：`AliyunOSSFullAccess`
- 保存 AccessKey ID 和 AccessKey Secret

### 3. 配置 CDN 回源 OSS

- CDN → 添加域名 → 加速域名填 `cdn.chengnanblog.cn`
- 源站类型：OSS 域名 → 选择 Bucket
- DNS 配置 CNAME 解析

---

## 四、GitLab CI/CD 完整配置

### GitLab CI/CD Variables（Settings → CI/CD → Variables）

| Variable | 值 | 属性 |
|----------|---|------|
| `ACCESS_KEY_ID` | RAM 子账号的 AK | Protected + Masked |
| `ACCESS_KEY_SECRET` | RAM 子账号的 SK | Protected + Masked |
| `SSH_PRIVATE_KEY` | 服务器 SSH 私钥 | Protected + Masked |

### `.gitlab-ci.yml`

```yaml
variables:
  OSS_BUCKET: "my-vue-cdn"
  OSS_ENDPOINT: "oss-cn-hangzhou.aliyuncs.com"
  DEPLOY_SERVER: "47.xxx.xxx.xxx"
  DEPLOY_PATH: "/var/www/html"

stages:
  - install
  - build
  - deploy

# ---------- 安装依赖 ----------
install:
  stage: install
  image: node:20-alpine
  script:
    - npm ci --prefer-offline
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

# ---------- 打包构建 ----------
build:
  stage: build
  image: node:20-alpine
  dependencies:
    - install
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

# ---------- 部署 ----------
deploy:
  stage: deploy
  image: alpine:latest
  dependencies:
    - build
  only:
    - main
  before_script:
    # 安装 ossutil
    - apk add --no-cache curl openssh-client
    - curl -o ossutil https://gosspublic.alicdn.com/ossutil/v2/2.0.3-beta.09041200/ossutil-2.0.3-beta.09041200-linux-amd64
    - chmod +x ossutil
    - mv ossutil /usr/local/bin/

    # 配置 ossutil
    - |
      cat > ~/.ossutilconfig << EOF
      [default]
      accessKeyId=${ACCESS_KEY_ID}
      accessKeySecret=${ACCESS_KEY_SECRET}
      endpoint=${OSS_ENDPOINT}
      EOF

    # 配置 SSH
    - mkdir -p ~/.ssh
    - echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - ssh-keyscan -H $DEPLOY_SERVER >> ~/.ssh/known_hosts

  script:
    # Step 1: 上传静态资源到 OSS（带缓存头，hash 文件缓存1年）
    - |
      ossutil cp -r dist/assets/ oss://${OSS_BUCKET}/assets/ \
        --update \
        --meta "Cache-Control:public,max-age=31536000"
    - echo "✅ 静态资源已上传到 OSS"

    # Step 2: 部署 index.html 到 Nginx 服务器
    - scp dist/index.html root@${DEPLOY_SERVER}:${DEPLOY_PATH}/index.html
    - echo "✅ index.html 已部署到服务器"
```

---

## 五、用户访问请求流程

```
1. 浏览器请求 https://chengnanblog.cn
      ↓
2. Nginx 返回 index.html
      ↓
3. 浏览器解析 index.html，里面引用了：
   <script src="https://cdn.chengnanblog.cn/assets/js/app-a1b2c3.js">
   <link href="https://cdn.chengnanblog.cn/assets/css/style-d4e5f6.css">
      ↓
4. 浏览器向 CDN 请求静态文件
      ↓
5. CDN 边缘节点：
   - 有缓存 → 直接返回（极快）
   - 无缓存 → 回源 OSS → 缓存后返回
```

---

## 六、为什么 index.html 不走 CDN？

| | index.html | assets/* |
|--|-----------|---------|
| 变更频率 | 每次部署都变 | 内容变了文件名也变（hash） |
| 缓存策略 | 不缓存 / 短缓存 | 永久缓存 |
| 走 CDN？ | ❌ 不走 | ✅ 走 CDN |

index.html 走 CDN 缓存的话，用户可能一直看到旧页面。

---

## 七、常见问题

**Q: OSS 上旧文件会堆积吗？**

会。可以在 CI 中部署前清理：
```yaml
- ossutil rm -r oss://${OSS_BUCKET}/assets/ --force
```

**Q: 公共 CDN 和自有 OSS CDN 的区别？**

| | 公共 CDN | 自有 OSS + CDN |
|--|---------|---------------|
| 内容 | 只能放 npm 包 | 任何文件 |
| 控制权 | 无 | 完全可控 |
| 国内稳定性 | jsdelivr 偶尔被墙 | 阿里云稳定 |

---

## 总结

| 方式 | 作用 | 适用场景 |
|------|------|---------|
| 依赖 CDN 引入 | Vue/ElementPlus 等从公共 CDN 加载 | 减小打包体积 |
| 静态资源上 CDN | 自有 JS/CSS/图片走 OSS + CDN | 全国访问加速 |
| 两者结合 | 最佳性能 | 正式项目推荐 |
