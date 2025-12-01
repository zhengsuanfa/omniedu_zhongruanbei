"""
工单管理API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import random
import string

from app.db.database import get_db
from app.models.ticket import Ticket
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse
from app.services.qianfan_service import qianfan_service

router = APIRouter()

def generate_ticket_no() -> str:
    """生成工单编号"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_str = ''.join(random.choices(string.digits, k=4))
    return f"GH{timestamp}{random_str}"

@router.post("/", response_model=TicketResponse, summary="创建工单")
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """
    创建新工单，自动调用AI进行分析
    """
    import time
    start_time = time.time()
    
    # 调用AI分析
    analysis_result = await qianfan_service.analyze_intent(ticket.content)
    
    # 提取关键词
    keywords_list = analysis_result.get("keywords", [])
    if not keywords_list:
        keywords_list = await qianfan_service.extract_keywords(ticket.content)
    
    # 生成解决方案建议
    category = analysis_result.get("suggested_category", "其他")
    solution = await qianfan_service.generate_solution(ticket.content, category)
    
    # 计算响应时间
    response_time = int((time.time() - start_time) * 1000)  # 毫秒
    
    # 创建工单
    db_ticket = Ticket(
        ticket_no=generate_ticket_no(),
        user_id=1,  # 简化版，默认用户ID
        content=ticket.content,
        summary=analysis_result.get("summary", ""),
        category=category,
        department=analysis_result.get("suggested_department", "综合服务部"),
        priority=analysis_result.get("priority", "medium"),
        sentiment=analysis_result.get("sentiment", {}).get("type", "neutral"),
        sentiment_score=analysis_result.get("sentiment", {}).get("intensity", 0.5),
        location_detail=ticket.location_info or "",
        keywords=",".join(keywords_list),
        solution_suggestion=solution,
        response_time=response_time,
        status="pending",
        ai_analysis=analysis_result
    )
    
    # 提取位置信息
    entities = analysis_result.get("entities", {})
    if "location" in entities:
        db_ticket.location_detail = entities["location"]
    
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    
    return db_ticket

@router.get("/{ticket_id}", response_model=TicketResponse, summary="获取工单详情")
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """获取指定工单的详细信息"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="工单不存在")
    return ticket

@router.get("/", response_model=List[TicketResponse], summary="获取工单列表")
async def list_tickets(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    category: str = None,
    db: Session = Depends(get_db)
):
    """
    获取工单列表，支持分页和筛选
    """
    query = db.query(Ticket)
    
    if status:
        query = query.filter(Ticket.status == status)
    if category:
        query = query.filter(Ticket.category == category)
    
    tickets = query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()
    return tickets

@router.put("/{ticket_id}", response_model=TicketResponse, summary="更新工单")
async def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db)
):
    """更新工单状态或部门"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="工单不存在")
    
    if ticket_update.status:
        ticket.status = ticket_update.status
    if ticket_update.department:
        ticket.department = ticket_update.department
    
    db.commit()
    db.refresh(ticket)
    return ticket

@router.delete("/{ticket_id}", summary="删除工单")
async def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """删除指定工单"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="工单不存在")
    
    db.delete(ticket)
    db.commit()
    return {"message": "工单已删除", "ticket_no": ticket.ticket_no}

@router.get("/user/{user_id}", response_model=List[TicketResponse], summary="获取用户工单")
async def get_user_tickets(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取指定用户的所有工单"""
    tickets = db.query(Ticket).filter(
        Ticket.user_id == user_id
    ).order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()
    return tickets

@router.get("/search", response_model=List[TicketResponse], summary="搜索工单")
async def search_tickets(
    keyword: str = None,
    category: str = None,
    status: str = None,
    priority: str = None,
    start_date: str = None,
    end_date: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """高级搜索工单"""
    query = db.query(Ticket)
    
    if keyword:
        query = query.filter(
            (Ticket.content.contains(keyword)) |
            (Ticket.summary.contains(keyword))
        )
    
    if category:
        query = query.filter(Ticket.category == category)
    
    if status:
        query = query.filter(Ticket.status == status)
    
    if priority:
        query = query.filter(Ticket.priority == priority)
    
    # 时间范围过滤
    if start_date:
        from datetime import datetime
        start = datetime.fromisoformat(start_date)
        query = query.filter(Ticket.created_at >= start)
    
    if end_date:
        from datetime import datetime
        end = datetime.fromisoformat(end_date)
        query = query.filter(Ticket.created_at <= end)
    
    tickets = query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()
    return tickets

@router.get("/{ticket_id}/similar", summary="查找相似工单")
async def find_similar_tickets(ticket_id: int, db: Session = Depends(get_db)):
    """查找与指定工单相似的历史工单"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="工单不存在")
    
    # 获取最近100条工单
    recent_tickets = db.query(Ticket).filter(
        Ticket.id != ticket_id
    ).order_by(Ticket.created_at.desc()).limit(100).all()
    
    tickets_data = [{
        "id": t.id,
        "ticket_no": t.ticket_no,
        "content": t.content,
        "category": t.category,
        "status": t.status
    } for t in recent_tickets]
    
    # 调用AI查找相似工单
    similar = await qianfan_service.find_similar_tickets(ticket.content, tickets_data)
    
    return {
        "ticket_id": ticket_id,
        "similar_tickets": similar
    }

