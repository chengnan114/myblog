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
