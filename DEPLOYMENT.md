# Vercel 部署指南

## 快速部署

### 方式一：通过Vercel Dashboard

1. **导入项目**
   - 访问 https://vercel.com
   - 点击 "Add New Project"
   - 选择你的Git仓库
   - 导入项目

2. **配置前端构建**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **设置环境变量**
   在Vercel Dashboard中设置：
   - `VITE_API_BASE_URL`: 你的后端API地址（如 https://your-backend.railway.app）

4. **点击Deploy**

### 方式二：通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

## 后端部署

Vercel主要用于前端静态文件和Serverless函数，不适合部署带SQLite的FastAPI后端。

### 推荐后端部署方案

#### 1. Railway (推荐)

**优点**：
- 支持Python
- 内置PostgreSQL
- 简单配置
- 免费额度充足

**步骤**：
```bash
# 1. 创建Railway账号: https://railway.app
# 2. 安装Railway CLI
npm i -g @railway/cli

# 3. 登录
railway login

# 4. 初始化项目
cd backend
railway init

# 5. 添加PostgreSQL
railway add --plugin postgresql

# 6. 设置环境变量
railway variables set QIANFAN_ACCESS_KEY=your_key
railway variables set QIANFAN_APP_ID=your_app_id

# 7. 部署
railway up
```

#### 2. Render

**步骤**：
1. 访问 https://render.com
2. 创建新的 Web Service
3. 连接GitHub仓库
4. 配置：
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - 添加PostgreSQL数据库
5. 设置环境变量
6. 部署

#### 3. Fly.io

```bash
# 安装Fly CLI
curl -L https://fly.io/install.sh | sh

# 登录
fly auth login

# 创建应用
cd backend
fly launch

# 添加PostgreSQL
fly postgres create

# 部署
fly deploy
```

## 数据库迁移

### 从SQLite迁移到PostgreSQL

1. **修改配置**
```python
# backend/app/core/config.py
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./govhotline.db")
```

2. **更新依赖**
```bash
# 添加到 requirements.txt
psycopg2-binary==2.9.9
```

3. **数据导出导入**
```bash
# 导出SQLite数据
python export_data.py

# 导入PostgreSQL
python import_data.py
```

## 环境变量配置

### 前端 (Vercel)
```
VITE_API_BASE_URL=https://your-backend-api.railway.app
```

### 后端 (Railway/Render/Fly)
```
QIANFAN_ACCESS_KEY=your_access_key
QIANFAN_APP_ID=your_app_id
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=8000
```

## 验证部署

1. **检查前端**
```bash
curl https://your-app.vercel.app
```

2. **检查后端API**
```bash
curl https://your-backend-api.railway.app/docs
```

3. **测试端到端**
- 访问前端URL
- 提交测试工单
- 查看数据大盘

## 常见问题

### Q: Vercel部署后API调用失败？
A: 检查 `VITE_API_BASE_URL` 环境变量是否正确设置为后端API地址。

### Q: 后端部署后数据库连接失败？
A: 确保 `DATABASE_URL` 格式正确，PostgreSQL服务已启动。

### Q: CORS错误？
A: 在后端 `main.py` 中添加前端域名到CORS允许列表：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Q: 千帆API调用失败？
A: 检查环境变量是否正确设置，API密钥是否有效。

## 性能优化

### 前端优化
- 启用Vercel Edge Network CDN
- 配置缓存策略
- 代码分割和懒加载

### 后端优化
- 使用数据库连接池
- 添加Redis缓存
- 配置数据库索引

## 监控和日志

### Vercel
- Analytics: 内置访问统计
- Logs: 实时日志查看

### Railway/Render
- 内置日志查看
- 配置监控告警

## 成本估算

### Vercel (前端)
- Hobby: 免费
- Pro: $20/月

### Railway (后端)
- 免费额度: $5/月
- 按使用量计费

### Render (后端)
- 免费层: 有限资源
- Starter: $7/月

## 下一步

- [ ] 推送代码到GitHub
- [ ] 连接Vercel部署前端
- [ ] 选择后端部署平台
- [ ] 配置环境变量
- [ ] 测试完整流程
- [ ] 设置自定义域名（可选）

