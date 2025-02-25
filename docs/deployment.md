# 部署指南

本文档将指导你如何部署 Link to QR Code Image Generator 到不同的环境。

## 目录

- [本地开发环境](#本地开发环境)
- [生产环境部署](#生产环境部署)
  - [Vercel 部署](#vercel-部署)
  - [自托管部署](#自托管部署)

## 本地开发环境

1. 确保你的开发环境满足以下要求：
   - Node.js 18.0.0 或更高版本
   - npm 或 yarn 包管理器

2. 克隆项目并安装依赖：
   ```bash
   git clone https://github.com/yourusername/link-to-image.git
   cd link-to-image
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 访问 http://localhost:3000 查看应用

## 生产环境部署

### Vercel 部署

推荐使用 Vercel 进行部署，这是最简单和最优化的方式：

1. 注册 [Vercel](https://vercel.com) 账号

2. 在 Vercel 控制台中点击 "New Project"

3. 导入你的 GitHub 仓库

4. 保持默认配置，点击 "Deploy"

部署完成后，Vercel 会自动分配一个域名。你也可以在项目设置中添加自定义域名。

### 自托管部署

如果你想在自己的服务器上部署，请按照以下步骤操作：

1. 在服务器上安装 Node.js 18.0.0 或更高版本

2. 克隆项目并安装依赖：
   ```bash
   git clone https://github.com/yourusername/link-to-image.git
   cd link-to-image
   npm install
   ```

3. 构建项目：
   ```bash
   npm run build
   ```

4. 启动生产服务器：
   ```bash
   npm start
   ```

5. 配置反向代理（推荐使用 Nginx）：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 容器化部署

如果你想使用 Docker 容器部署，请按照以下步骤操作：

1. 确保你的服务器已安装 Docker

2. 构建 Docker 镜像：
   ```bash
   docker build -t link-to-image .
   ```

3. 运行容器：
   ```bash
   docker run -d -p 3000:3000 link-to-image
   ```

4. 访问 http://localhost:3000 查看应用

你也可以使用 Docker Compose 进行部署，创建 `docker-compose.yml` 文件：
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
```

然后运行：
```bash
docker-compose up -d
```

## 环境变量配置

目前项目不需要配置任何环境变量即可运行。如果后续添加了需要环境变量的功能，会在此处更新配置说明。

## 性能优化

- 确保使用最新版本的 Node.js
- 启用 Gzip 压缩
- 配置适当的缓存策略
- 使用 CDN 加速静态资源

## 故障排除

如果遇到部署问题，请检查：

1. Node.js 版本是否符合要求
2. 是否所有依赖都已正确安装
3. 构建命令是否执行成功
4. 端口 3000 是否被占用

如果问题仍然存在，欢迎在 GitHub 上提交 Issue。