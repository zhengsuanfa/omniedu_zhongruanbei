# Vercel 完整部署指南（前后端一体）

## 🎯 方案说明

将整个项目（前端+后端）完全部署到Vercel，无需其他服务！

### 优势
✅ 前后端统一部署，一个域名
✅ 完全免费（Hobby计划）
✅ 自动HTTPS和CDN
✅ 零配置部署
✅ 自动CI/CD

### 架构
```
Vercel项目
├── 前端（React + Vite）→ 静态文件
└── 后端（FastAPI）→ Serverless Functions
```

## 🚀 快速部署

### 方式一：通过Vercel Dashboard（推荐）

1. **访问Vercel**
   👉 https://vercel.com/new

2. **导入项目**
   - 选择 `zhengsuanfa/omniedu_zhongruanbei`
   - Framework Preset: 自动检测（Vite）

3. **配置环境变量**
   在Environment Variables中添加：
   ```
   QIANFAN_ACCESS_KEY=bce-v3/ALTAK-YHzNwp2pFDhPaj6l1ffxg/47d04025d6facb908f5046353bb83b7cf058689e
   QIANFAN_APP_ID=d48409e4-57e7-4d0f-a8cf-30984ba037a9
   DATABASE_URL=sqlite:///./govhotline.db
   ```

4. **点击Deploy**
   等待3-5分钟，完成！

5. **访问项目**
   Vercel会提供URL，如：
   ```
   https://omniedu-zhongruanbei.vercel.app
   ```

### 方式二：通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd /path/to/omniedu_zhongruanbei
vercel

# 添加环境变量
vercel env add QIANFAN_ACCESS_KEY
vercel env add QIANFAN_APP_ID

# 生产部署
vercel --prod
```

## 📋 配置说明

### vercel.json 配置
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### 项目结构
```
omniedu_zhongruanbei/
├── frontend/          # 前端 → Vercel Static
├── backend/           # 后端源码
├── api/
│   └── index.py      # Vercel Serverless入口
├── requirements.txt   # Python依赖
└── vercel.json       # Vercel配置
```

## 🔧 环境变量

在Vercel Dashboard设置：

```env
QIANFAN_ACCESS_KEY=your_access_key
QIANFAN_APP_ID=your_app_id
DATABASE_URL=sqlite:///./govhotline.db
```

## 📝 注意事项

### 1. 数据库限制
- Vercel Serverless是无状态的
- SQLite文件在每次部署后会重置
- 生产环境建议使用：
  - Vercel Postgres（付费）
  - Supabase（免费）
  - PlanetScale（免费）

### 2. Serverless函数限制
- Hobby计划：10秒超时
- Pro计划：60秒超时
- 内存：1024MB

### 3. 文件存储
- 不支持持久化文件存储
- 上传的文件需要存储到：
  - Vercel Blob Storage
  - AWS S3
  - Cloudinary

## 🆚 替代方案对比

### 方案A：Vercel全栈（当前）
```
前端：Vercel Static
后端：Vercel Serverless
数据库：外部服务（Supabase等）

优点：一个平台，简单
缺点：需要外部数据库
费用：免费
```

### 方案B：Vercel前端 + Render后端
```
前端：Vercel
后端：Render.com
数据库：Render PostgreSQL

优点：后端功能完整
缺点：需要两个平台
费用：Render免费层（15分钟无活动后休眠）
```

### 方案C：Vercel前端 + PythonAnywhere后端
```
前端：Vercel
后端：PythonAnywhere
数据库：PythonAnywhere MySQL

优点：完全免费
缺点：性能有限
费用：完全免费
```

## 🚀 推荐使用外部数据库

### Supabase（推荐）
```bash
# 1. 注册 https://supabase.com
# 2. 创建项目
# 3. 获取数据库URL
# 4. 在Vercel添加环境变量：
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

### PlanetScale
```bash
# 1. 注册 https://planetscale.com
# 2. 创建数据库
# 3. 获取连接字符串
# 4. 添加到Vercel环境变量
```

## ✅ 验证部署

部署完成后：

1. **测试前端**
   ```
   https://your-app.vercel.app
   ```

2. **测试后端API**
   ```
   https://your-app.vercel.app/api/v1/docs
   ```

3. **测试功能**
   - 提交工单
   - 查看数据大盘
   - 检查我的工单

## 🔄 持续部署

每次推送到GitHub main分支，Vercel会自动部署！

```bash
git add .
git commit -m "Update"
git push
```

## 💰 费用

完全免费（Hobby计划）：
- 带宽：100GB/月
- Serverless函数调用：无限
- 构建时间：6000分钟/月

## 🆘 常见问题

**Q: 数据会丢失吗？**
A: SQLite文件会在每次部署后重置，需要使用外部数据库。

**Q: API超时怎么办？**
A: 优化代码或升级到Pro计划（60秒超时）。

**Q: 如何查看日志？**
A: Vercel Dashboard → Functions → View Logs

---

**推荐方案**：Vercel全栈 + Supabase数据库（完全免费）
