"""
政务热线智能助手 - 主应用入口
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import tickets, analysis, qianfan_api, users
from app.core.config import settings
from app.db.database import engine, Base

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建FastAPI应用
app = FastAPI(
    title="政务热线智能助手API",
    description="基于百度千帆的政务热线智能处理系统",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境需要修改为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(tickets.router, prefix="/api/v1/tickets", tags=["工单管理"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["数据分析"])
app.include_router(qianfan_api.router, prefix="/api/v1/qianfan", tags=["千帆AI"])
app.include_router(users.router, prefix="/api/v1/users", tags=["用户管理"])

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "政务热线智能助手API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG
    )

