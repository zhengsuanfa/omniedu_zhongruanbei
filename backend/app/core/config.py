"""
应用配置
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置类"""
    
    # 百度千帆配置
    QIANFAN_AK: str = ""
    QIANFAN_SK: str = ""
    
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./govhotline.db"
    
    # Redis配置
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # 应用配置
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True
    
    # 安全配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

