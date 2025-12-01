"""
工单数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class TicketCreate(BaseModel):
    """创建工单请求"""
    content: str = Field(..., min_length=1, description="工单内容")
    location_info: Optional[str] = Field(None, description="位置信息")

class TicketUpdate(BaseModel):
    """更新工单请求"""
    status: Optional[str] = None
    department: Optional[str] = None
    priority: Optional[str] = None

class TicketResponse(BaseModel):
    """工单响应"""
    id: int
    ticket_no: str
    user_id: Optional[int]
    content: str
    summary: Optional[str]
    category: Optional[str]
    department: Optional[str]
    priority: Optional[str]
    sentiment: Optional[str]
    sentiment_score: Optional[float]
    location_district: Optional[str]
    location_street: Optional[str]
    location_detail: Optional[str]
    status: str
    keywords: Optional[str]
    solution_suggestion: Optional[str]
    response_time: Optional[int]
    ai_analysis: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StatisticsResponse(BaseModel):
    """统计数据响应"""
    total_tickets: int
    by_category: Dict[str, int]
    by_status: Dict[str, int]
    by_priority: Dict[str, int]
    sentiment_distribution: Dict[str, int]

class AlertResponse(BaseModel):
    """预警响应"""
    alert_type: str
    level: str
    title: str
    description: str
    data: Optional[Dict[str, Any]] = None
    created_at: datetime

class IntentAnalysisRequest(BaseModel):
    """意图分析请求"""
    content: str = Field(..., min_length=1, description="要分析的内容")

class IntentAnalysisResponse(BaseModel):
    """意图分析响应"""
    intents: list = Field(default_factory=list, description="识别出的意图列表")
    entities: Dict[str, Any] = Field(default_factory=dict, description="提取的实体")
    sentiment: Optional[str] = None
    confidence: Optional[float] = None

