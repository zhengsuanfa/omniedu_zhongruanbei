"""
用户管理API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.db.database import get_db
from app.models.user import User, Comment, Rating, Notification

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    email: str
    phone: str = None
    full_name: str = None

class CommentCreate(BaseModel):
    ticket_id: int
    content: str

class RatingCreate(BaseModel):
    ticket_id: int
    score: int  # 1-5
    feedback: str = None

@router.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """用户注册（简化版，无密码）"""
    # 检查用户名是否存在
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 创建用户
    db_user = User(
        username=user.username,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        role="citizen"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"id": db_user.id, "username": db_user.username, "message": "注册成功"}

@router.get("/profile/{user_id}")
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """获取用户信息"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
        "full_name": user.full_name,
        "role": user.role
    }

@router.post("/comments")
async def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    """添加评论"""
    db_comment = Comment(
        ticket_id=comment.ticket_id,
        user_id=1,  # 简化版，默认用户ID
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return {"id": db_comment.id, "message": "评论成功"}

@router.get("/comments/{ticket_id}")
async def get_comments(ticket_id: int, db: Session = Depends(get_db)):
    """获取工单评论"""
    comments = db.query(Comment).filter(Comment.ticket_id == ticket_id).all()
    return [{
        "id": c.id,
        "content": c.content,
        "created_at": c.created_at.isoformat() if c.created_at else None
    } for c in comments]

@router.post("/ratings")
async def create_rating(rating: RatingCreate, db: Session = Depends(get_db)):
    """提交满意度评价"""
    # 检查是否已评价
    existing = db.query(Rating).filter(Rating.ticket_id == rating.ticket_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="该工单已评价")
    
    db_rating = Rating(
        ticket_id=rating.ticket_id,
        score=rating.score,
        feedback=rating.feedback
    )
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    
    return {"id": db_rating.id, "message": "评价成功"}

@router.get("/ratings/{ticket_id}")
async def get_rating(ticket_id: int, db: Session = Depends(get_db)):
    """获取工单评价"""
    rating = db.query(Rating).filter(Rating.ticket_id == ticket_id).first()
    if not rating:
        return None
    
    return {
        "score": rating.score,
        "feedback": rating.feedback,
        "created_at": rating.created_at.isoformat() if rating.created_at else None
    }

@router.get("/notifications/{user_id}")
async def get_notifications(user_id: int, db: Session = Depends(get_db)):
    """获取用户通知"""
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    
    return [{
        "id": n.id,
        "title": n.title,
        "content": n.content,
        "ticket_id": n.ticket_id,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat() if n.created_at else None
    } for n in notifications]

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """标记通知为已读"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    notification.is_read = 1
    db.commit()
    
    return {"message": "已标记为已读"}

