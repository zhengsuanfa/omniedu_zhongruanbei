# 智慧政务热线助手系统

基于百度千帆大模型平台的智能政务热线工单管理系统。

## 项目简介

本系统为2025年中软国际"千帆杯"大模型应用开发大赛参赛作品，实现了智能工单提交、分析、分派和数据可视化等功能。

## 技术栈

### 前端
- React 18
- Ant Design 5
- ECharts
- Framer Motion
- Vite

### 后端
- FastAPI
- SQLAlchemy
- 百度千帆平台
- SQLite/PostgreSQL

## 本地开发

### 前置要求
- Node.js 18+
- Python 3.9+
- 百度千帆平台账号

### 环境配置

1. 克隆项目
```bash
git clone <repository-url>
cd omniedu_zhongruanbei
```

2. 配置环境变量
```bash
cp .env.example backend/.env
# 编辑 backend/.env 填入你的千帆平台密钥
```

3. 安装前端依赖
```bash
cd frontend
npm install
```

4. 安装后端依赖
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 启动开发服务器

1. 启动后端
```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

2. 启动前端
```bash
cd frontend
npm run dev
```

访问 http://localhost:3000

## Vercel部署

### 部署前端

1. 在Vercel导入项目
2. 配置构建设置：
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. 配置环境变量：
   - `VITE_API_BASE_URL`: 后端API地址

### 部署后端

后端建议部署到支持Python的平台：
- Railway
- Render
- Fly.io
- AWS Lambda

**注意**：生产环境建议使用PostgreSQL替代SQLite。

## 核心功能

### 市民端
- 📝 智能工单提交（多意图识别）
- 🏷️ 自动标签生成
- 📊 工单进度查看
- ⭐ 满意度评价

### 决策端
- 📈 数据大盘（多维度统计）
- 🗺️ 区域热力图
- 🔔 智能预警
- 🤖 AI辅助决策
- 📤 批量操作

### AI能力
- 多意图理解
- 实体识别
- 情感分析
- 智能分派
- 趋势预测

## 项目结构

```
omniedu_zhongruanbei/
├── frontend/              # 前端代码
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── services/     # API服务
│   │   └── App.jsx
│   └── package.json
├── backend/              # 后端代码
│   ├── app/
│   │   ├── api/         # API路由
│   │   ├── core/        # 核心配置
│   │   ├── db/          # 数据库
│   │   ├── models/      # 数据模型
│   │   ├── schemas/     # 数据验证
│   │   └── services/    # 业务逻辑
│   ├── main.py
│   └── requirements.txt
├── vercel.json          # Vercel配置
├── .gitignore
└── README.md

```

## API文档

启动后端后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 主要API端点

### 工单管理
- `POST /api/v1/tickets/` - 创建工单
- `GET /api/v1/tickets/` - 获取工单列表
- `GET /api/v1/tickets/{id}` - 获取工单详情
- `PUT /api/v1/tickets/{id}` - 更新工单

### 数据分析
- `GET /api/v1/analysis/statistics` - 统计数据
- `GET /api/v1/analysis/alerts` - 预警信息
- `GET /api/v1/analysis/trends/category` - 类别趋势
- `GET /api/v1/analysis/sentiment-analysis` - 情感分析

### 千帆AI
- `POST /api/v1/qianfan/analyze-intent` - 意图分析

## 环境变量

### 后端 (.env)
```env
QIANFAN_ACCESS_KEY=your_access_key
QIANFAN_APP_ID=your_app_id
DATABASE_URL=sqlite:///./govhotline.db
```

### 前端 (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue。
