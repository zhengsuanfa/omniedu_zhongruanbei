# Docker 部署指南

## 🐳 Docker部署方案

完整的前后端容器化部署，包含数据库和反向代理。

### 📦 容器架构

```
┌─────────────────────────────────────┐
│         Nginx (端口80)              │
│      前端静态文件 + API代理         │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────┐    ┌──────────────┐
│  前端     │    │  FastAPI后端 │
│  React   │    │   (端口8000)  │
└──────────┘    └────────┬───────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ PostgreSQL  │
                  │  (端口5432) │
                  └─────────────┘
```

## 🚀 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/zhengsuanfa/omniedu_zhongruanbei.git
cd omniedu_zhongruanbei

# 2. 配置环境变量
cp .env.docker .env

# 3. 启动所有服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f

# 5. 访问应用
# 前端: http://localhost
# 后端API: http://localhost/api/v1/docs
# 直接访问后端: http://localhost:8000/docs
```

### 方式二：单独构建Docker镜像

```bash
# 1. 构建镜像
docker build -t govhotline:latest .

# 2. 运行容器
docker run -d \
  --name govhotline \
  -p 8000:8000 \
  -e QIANFAN_ACCESS_KEY="your_key" \
  -e QIANFAN_APP_ID="your_app_id" \
  -e DATABASE_URL="sqlite:///./govhotline.db" \
  govhotline:latest

# 3. 查看日志
docker logs -f govhotline
```

## 🔧 配置说明

### docker-compose.yml

完整的服务编排，包括：
- **web**: FastAPI后端 + React前端
- **db**: PostgreSQL数据库
- **nginx**: 反向代理和静态文件服务

### Dockerfile

多阶段构建，优化镜像大小：
1. 前端构建阶段（Node.js）
2. 后端运行阶段（Python）

### .env.docker

环境变量配置：
```env
QIANFAN_ACCESS_KEY=your_access_key
QIANFAN_APP_ID=your_app_id
DATABASE_URL=postgresql://user:pass@db:5432/dbname
```

## 📋 常用命令

### 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 仅启动特定服务
docker-compose up -d web db

# 查看服务状态
docker-compose ps
```

### 查看日志
```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f web
docker-compose logs -f db
```

### 停止和删除
```bash
# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 删除容器和数据卷
docker-compose down -v
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart web
```

### 更新代码
```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并启动
docker-compose up -d --build
```

## 🌐 部署到云服务器

### 准备工作
```bash
# 1. 服务器上安装Docker和Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 部署步骤
```bash
# 1. 上传代码到服务器
git clone https://github.com/zhengsuanfa/omniedu_zhongruanbei.git
cd omniedu_zhongruanbei

# 2. 配置环境变量
cp .env.docker .env
nano .env  # 编辑配置

# 3. 启动服务
docker-compose up -d

# 4. 配置防火墙（如果需要）
sudo ufw allow 80
sudo ufw allow 443
```

## 🐳 Docker Hub部署

### 发布镜像到Docker Hub

```bash
# 1. 登录Docker Hub
docker login

# 2. 构建镜像
docker build -t yourusername/govhotline:latest .

# 3. 推送镜像
docker push yourusername/govhotline:latest

# 4. 在其他服务器拉取运行
docker pull yourusername/govhotline:latest
docker run -d -p 8000:8000 \
  -e QIANFAN_ACCESS_KEY="your_key" \
  -e QIANFAN_APP_ID="your_app_id" \
  yourusername/govhotline:latest
```

## ☁️ 免费Docker托管平台

### 1. Render.com
```bash
# 使用Dockerfile自动部署
# 1. 连接GitHub仓库
# 2. 选择"Web Service"
# 3. Docker类型
# 4. 自动部署
```

### 2. Railway.app
```bash
# 支持Docker和docker-compose
# 1. 导入GitHub仓库
# 2. 自动检测Dockerfile
# 3. 配置环境变量
# 4. 部署
```

### 3. Fly.io
```bash
# 安装flyctl
curl -L https://fly.io/install.sh | sh

# 初始化并部署
fly launch
fly deploy
```

## 🔍 健康检查

```bash
# 检查容器健康状态
docker ps

# 检查后端API
curl http://localhost:8000/api/v1/tickets/?limit=1

# 检查前端
curl http://localhost/

# 进入容器调试
docker exec -it govhotline_app bash
```

## 📊 监控和日志

### 查看资源使用
```bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats govhotline_app
```

### 导出日志
```bash
# 导出日志到文件
docker-compose logs > logs.txt

# 查看最近100行
docker-compose logs --tail=100
```

## 🛠️ 故障排查

### 容器无法启动
```bash
# 查看详细错误
docker-compose logs web

# 检查配置
docker-compose config
```

### 数据库连接失败
```bash
# 检查数据库容器状态
docker-compose ps db

# 测试数据库连接
docker exec -it govhotline_db psql -U govhotline -d govhotline
```

### 端口冲突
```bash
# 查看端口占用
sudo lsof -i :80
sudo lsof -i :8000

# 修改docker-compose.yml中的端口映射
```

## 💾 数据备份

### 备份数据库
```bash
# 备份PostgreSQL
docker exec govhotline_db pg_dump -U govhotline govhotline > backup.sql

# 恢复
docker exec -i govhotline_db psql -U govhotline govhotline < backup.sql
```

### 备份数据卷
```bash
# 创建数据卷备份
docker run --rm \
  -v omniedu_zhongruanbei_postgres-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/db-backup.tar.gz /data
```

## 🔐 安全建议

1. **修改默认密码**
   ```yaml
   # docker-compose.yml
   environment:
     - POSTGRES_PASSWORD=使用强密码
   ```

2. **使用secrets管理敏感信息**
   ```bash
   # 使用Docker secrets
   echo "my_secret" | docker secret create qianfan_key -
   ```

3. **配置HTTPS**
   - 使用Let's Encrypt
   - 配置nginx SSL

## 💰 成本估算

### 云服务器
- **腾讯云**: ¥60/月（1核2G）
- **阿里云**: ¥70/月（1核2G）
- **AWS**: $5/月（t2.micro）

### 免费方案
- Render.com（有限资源）
- Fly.io（免费额度）
- Railway.app（$5免费额度）

## 📚 参考资料

- Docker官方文档: https://docs.docker.com
- Docker Compose文档: https://docs.docker.com/compose
- FastAPI Docker部署: https://fastapi.tiangolo.com/deployment/docker

---

**推荐部署方式**：
- 开发测试：本地Docker Compose
- 生产环境：云服务器 + Docker Compose + PostgreSQL

