"""
工单数据模型
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class Ticket(Base):
    """工单表"""
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_no = Column(String(50), unique=True, index=True, comment="工单编号")
    user_id = Column(Integer, index=True, comment="提交用户ID")
    content = Column(Text, comment="原始描述")
    summary = Column(Text, comment="AI摘要")
    category = Column(String(50), comment="分类")
    department = Column(String(50), comment="负责部门")
    priority = Column(String(20), comment="优先级: low/medium/high")
    sentiment = Column(String(20), comment="情绪: positive/neutral/negative")
    sentiment_score = Column(Float, comment="情绪分数 0-1")
    location_district = Column(String(50), comment="区域")
    location_street = Column(String(100), comment="街道")
    location_detail = Column(Text, comment="详细位置")
    status = Column(String(20), default="pending", comment="状态: pending/processing/resolved/closed")
    keywords = Column(Text, comment="关键词（逗号分隔）")
    solution_suggestion = Column(Text, comment="AI建议的解决方案")
    response_time = Column(Integer, comment="响应时间（秒）")
    ai_analysis = Column(JSON, comment="AI分析完整结果")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    def __repr__(self):
        return f"<Ticket {self.ticket_no}: {self.category}>"

class AnalyticsRecord(Base):
    """分析记录表"""
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_type = Column(String(50), comment="分析类型")
    time_range = Column(String(20), comment="时间范围")
    result = Column(JSON, comment="分析结果")
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<Analytics {self.analysis_type} at {self.created_at}>"

