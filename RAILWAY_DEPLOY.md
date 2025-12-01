# Railway 快速部署后端

## 🚀 5分钟部署步骤

### 1. 创建Railway项目

1. 访问 **https://railway.app**
2. 点击 **"Start a New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 选择 **`zhengsuanfa/omniedu_zhongruanbei`**

### 2. 配置环境变量

在Railway项目设置中添加：

```env
QIANFAN_ACCESS_KEY=bce-v3/ALTAK-YHzNwp2pFDhPaj6l1ffxg/47d04025d6facb908f5046353bb83b7cf058689e
QIANFAN_APP_ID=d48409e4-57e7-4d0f-a8cf-30984ba037a9
DATABASE_URL=sqlite:///./govhotline.db
```

### 3. 添加PostgreSQL（可选但推荐）

1. 点击 **"+ New"**
2. 选择 **"Database"** → **"PostgreSQL"**
3. Railway会自动设置 `DATABASE_URL`

如果添加了PostgreSQL，需要更新backend依赖：

```bash
# 本地操作
cd backend
echo "psycopg2-binary==2.9.9" >> requirements.txt
git add requirements.txt
git commit -m "Add PostgreSQL support"
git push
```

### 4. 部署

Railway会自动开始部署，等待2-3分钟。

### 5. 获取后端URL

部署完成后，Railway会提供一个URL，格式如：
```
https://omniedu-zhongruanbei-production.up.railway.app
```

### 6. 更新Vercel环境变量

1. 访问 **Vercel Dashboard**
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加/更新：
   ```
   VITE_API_BASE_URL=https://你的railway域名.railway.app
   ```
5. 重新部署Vercel项目

### 7. 测试后端

访问：
```
https://你的railway域名.railway.app/docs
```

应该能看到FastAPI的Swagger文档。

## ⚡ 使用Railway CLI部署（更快）

```bash
# 安装Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 链接项目
railway link

# 设置环境变量
railway variables set QIANFAN_ACCESS_KEY="your_key"
railway variables set QIANFAN_APP_ID="your_app_id"

# 部署
railway up
```

## 📝 常见问题

### Q: 部署失败？
**A:** 检查Railway日志，常见原因：
- requirements.txt路径错误
- 环境变量未设置
- 端口配置错误

### Q: 数据库连接失败？
**A:** 确认：
- 已添加PostgreSQL服务
- DATABASE_URL环境变量正确
- 安装了psycopg2-binary

### Q: API返回500错误？
**A:** 检查：
- 千帆API密钥是否正确
- 查看Railway日志
- 数据库表是否创建

## 🔄 本地测试Railway配置

```bash
# 安装Railway CLI
npm i -g @railway/cli

# 在本地运行（使用Railway环境变量）
railway run python backend/main.py
```

## 📊 监控和日志

Railway提供实时日志查看：
1. 点击项目
2. 查看 **Deployments** 标签
3. 点击最新部署查看日志

## 💰 费用

Railway提供：
- **免费额度**: $5/月
- **资源限制**: 500MB RAM, 1GB 磁盘

足够运行此项目！

---

**预计部署时间**: 5-10分钟

