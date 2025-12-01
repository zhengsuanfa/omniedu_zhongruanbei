# 🚀 快速开始

## 一键部署到Vercel

### 前置准备
- GitHub账号
- Vercel账号（可用GitHub登录）
- Railway账号（后端部署）

### 部署步骤

#### 1️⃣ 推送到GitHub

```bash
# 初始化Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Ready for Vercel deployment"

# 添加远程仓库
git remote add origin https://github.com/your-username/your-repo.git

# 推送
git push -u origin main
```

#### 2️⃣ 部署前端到Vercel

**方法A：通过Dashboard（推荐）**
1. 访问 https://vercel.com
2. 点击 "New Project"
3. 导入GitHub仓库
4. 配置构建：
   - Framework: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 添加环境变量：
   - `VITE_API_BASE_URL`: `https://your-backend.railway.app`
6. 点击 "Deploy"

**方法B：通过CLI**
```bash
# 安装CLI
npm i -g vercel

# 登录
vercel login

# 进入前端目录
cd frontend

# 部署
vercel --prod
```

#### 3️⃣ 部署后端到Railway

```bash
# 安装Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 进入后端目录
cd backend

# 初始化项目
railway init

# 添加PostgreSQL（推荐）
railway add

# 设置环境变量
railway variables set QIANFAN_ACCESS_KEY=your_access_key
railway variables set QIANFAN_APP_ID=your_app_id

# 部署
railway up
```

#### 4️⃣ 更新配置

1. 获取Railway后端URL（如：`https://your-app.railway.app`）

2. 在Vercel设置环境变量：
   ```
   VITE_API_BASE_URL=https://your-app.railway.app
   ```

3. 重新部署Vercel项目

### ✅ 验证部署

1. 访问Vercel提供的URL
2. 查看启动页动画
3. 测试提交工单
4. 查看数据大盘

### 🔧 环境变量

**前端 (Vercel)**
```env
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

**后端 (Railway)**
```env
QIANFAN_ACCESS_KEY=your_access_key_here
QIANFAN_APP_ID=your_app_id_here
DATABASE_URL=postgresql://...（Railway自动配置）
```

### 📝 常见问题

**Q: API调用失败？**
- 检查 `VITE_API_BASE_URL` 环境变量
- 确认后端已成功部署
- 查看浏览器控制台错误信息

**Q: 数据库连接失败？**
- 确认Railway已添加PostgreSQL
- 检查 `DATABASE_URL` 环境变量
- 查看Railway日志

**Q: 千帆API调用失败？**
- 验证 `QIANFAN_ACCESS_KEY` 和 `QIANFAN_APP_ID`
- 确认千帆平台账号有效

### 🎯 下一步

- [ ] 自定义域名
- [ ] 配置SSL证书（Vercel自动）
- [ ] 设置监控告警
- [ ] 优化性能
- [ ] 添加更多功能

### 📚 详细文档

- `README.md` - 项目介绍
- `DEPLOYMENT.md` - 详细部署指南

### 🆘 获取帮助

遇到问题？
- 查看 Railway 日志
- 查看 Vercel 日志
- 检查浏览器控制台
- 阅读 DEPLOYMENT.md

---

**预计部署时间：10-15分钟**

**成本：免费额度内**
