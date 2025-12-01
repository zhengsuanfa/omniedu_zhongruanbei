"""
用户数据模型
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, comment="用户名")
    email = Column(String(100), unique=True, index=True, comment="邮箱")
    phone = Column(String(20), comment="手机号")
    password_hash = Column(String(255), comment="密码哈希")
    full_name = Column(String(100), comment="真实姓名")
    role = Column(String(20), default="citizen", comment="角色: citizen/admin")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<User {self.username}>"

class Comment(Base):
    """工单评论表"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, index=True, comment="工单ID")
    user_id = Column(Integer, comment="用户ID")
    content = Column(String(500), comment="评论内容")
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<Comment on ticket {self.ticket_id}>"

class Rating(Base):
    """满意度评价表"""
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, unique=True, index=True, comment="工单ID")
    score = Column(Integer, comment="评分 1-5")
    feedback = Column(String(500), comment="反馈意见")
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<Rating {self.score} for ticket {self.ticket_id}>"

class Notification(Base):
    """通知表"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, comment="用户ID")
    ticket_id = Column(Integer, comment="关联工单ID")
    title = Column(String(100), comment="通知标题")
    content = Column(String(500), comment="通知内容")
    is_read = Column(Integer, default=0, comment="是否已读: 0未读/1已读")
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<Notification for user {self.user_id}>"

