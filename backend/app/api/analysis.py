"""
数据分析API
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.ticket import Ticket
from app.schemas.ticket import StatisticsResponse, AlertResponse
from app.services.qianfan_service import qianfan_service

router = APIRouter()

@router.get("/statistics", response_model=StatisticsResponse, summary="获取统计数据")
async def get_statistics(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    获取工单统计数据
    
    Args:
        days: 统计最近几天的数据，默认7天
    """
    # 计算时间范围
    start_date = datetime.now() - timedelta(days=days)
    
    # 查询符合时间范围的工单
    query = db.query(Ticket).filter(Ticket.created_at >= start_date)
    
    # 总数
    total_tickets = query.count()
    
    # 按类别统计
    by_category = {}
    category_stats = query.with_entities(
        Ticket.category,
        func.count(Ticket.id)
    ).group_by(Ticket.category).all()
    
    for category, count in category_stats:
        by_category[category or "未分类"] = count
    
    # 按状态统计
    by_status = {}
    status_stats = query.with_entities(
        Ticket.status,
        func.count(Ticket.id)
    ).group_by(Ticket.status).all()
    
    for status, count in status_stats:
        by_status[status] = count
    
    # 按优先级统计
    by_priority = {}
    priority_stats = query.with_entities(
        Ticket.priority,
        func.count(Ticket.id)
    ).group_by(Ticket.priority).all()
    
    for priority, count in priority_stats:
        by_priority[priority or "medium"] = count
    
    # 按情绪统计
    sentiment_distribution = {}
    sentiment_stats = query.with_entities(
        Ticket.sentiment,
        func.count(Ticket.id)
    ).group_by(Ticket.sentiment).all()
    
    for sentiment, count in sentiment_stats:
        sentiment_distribution[sentiment or "neutral"] = count
    
    return StatisticsResponse(
        total_tickets=total_tickets,
        by_category=by_category,
        by_status=by_status,
        by_priority=by_priority,
        sentiment_distribution=sentiment_distribution
    )

@router.get("/alerts", summary="获取预警信息")
async def get_alerts(
    days: int = 7,
    db: Session = Depends(get_db)
) -> List[AlertResponse]:
    """
    生成预警信息
    
    基于最近的工单数据，分析潜在问题并生成预警
    """
    # 获取最近的工单数据
    start_date = datetime.now() - timedelta(days=days)
    tickets = db.query(Ticket).filter(Ticket.created_at >= start_date).all()
    
    # 转换为字典格式
    tickets_data = [
        {
            "category": t.category,
            "location_district": t.location_district or "未知",
            "sentiment": t.sentiment,
            "priority": t.priority,
            "created_at": t.created_at.isoformat() if t.created_at else None
        }
        for t in tickets
    ]
    
    # 调用AI分析趋势
    analysis_result = await qianfan_service.analyze_trends(tickets_data)
    
    # 构建预警响应
    alerts = []
    for alert in analysis_result.get("alerts", []):
        alerts.append(AlertResponse(
            alert_type=alert["type"],
            level=alert["level"],
            title=alert["title"],
            description=alert["description"],
            data=alert["data"],
            created_at=datetime.now()
        ))
    
    return alerts

@router.get("/trends/category", summary="类别趋势分析")
async def get_category_trends(
    days: int = 30,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    分析各类别工单的趋势变化
    """
    start_date = datetime.now() - timedelta(days=days)
    
    # 查询按日期和类别统计的数据
    tickets = db.query(Ticket).filter(Ticket.created_at >= start_date).all()
    
    # 按日期组织数据
    daily_data = {}
    for ticket in tickets:
        date_key = ticket.created_at.strftime("%Y-%m-%d")
        category = ticket.category or "未分类"
        
        if date_key not in daily_data:
            daily_data[date_key] = {}
        
        daily_data[date_key][category] = daily_data[date_key].get(category, 0) + 1
    
    # 排序
    sorted_dates = sorted(daily_data.keys())
    
    return {
        "time_range": f"最近{days}天",
        "daily_data": {date: daily_data[date] for date in sorted_dates},
        "total_days": len(sorted_dates)
    }

@router.get("/trends/location", summary="地域热点分析")
async def get_location_trends(
    days: int = 7,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    分析各地域的工单分布
    """
    start_date = datetime.now() - timedelta(days=days)
    
    # 按地域统计
    location_stats = db.query(
        Ticket.location_district,
        Ticket.category,
        func.count(Ticket.id).label('count')
    ).filter(
        Ticket.created_at >= start_date,
        Ticket.location_district.isnot(None)
    ).group_by(
        Ticket.location_district,
        Ticket.category
    ).all()
    
    # 组织数据
    location_data = {}
    for district, category, count in location_stats:
        if district not in location_data:
            location_data[district] = {
                "total": 0,
                "by_category": {}
            }
        location_data[district]["total"] += count
        location_data[district]["by_category"][category] = count
    
    # 找出TOP5热点地区
    top_locations = sorted(
        location_data.items(),
        key=lambda x: x[1]["total"],
        reverse=True
    )[:5]
    
    return {
        "time_range": f"最近{days}天",
        "all_locations": location_data,
        "top_locations": dict(top_locations),
        "total_locations": len(location_data)
    }

@router.get("/sentiment-analysis", summary="情绪分析")
async def get_sentiment_analysis(
    days: int = 7,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    分析市民满意度和情绪变化
    """
    start_date = datetime.now() - timedelta(days=days)
    
    tickets = db.query(Ticket).filter(Ticket.created_at >= start_date).all()
    
    # 统计情绪分布
    sentiment_count = {
        "positive": 0,
        "neutral": 0,
        "negative": 0
    }
    
    sentiment_scores = []
    
    for ticket in tickets:
        sentiment = ticket.sentiment or "neutral"
        sentiment_count[sentiment] = sentiment_count.get(sentiment, 0) + 1
        
        if ticket.sentiment_score:
            sentiment_scores.append(ticket.sentiment_score)
    
    # 计算平均情绪分数
    avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.5
    
    # 计算满意度 (positive的比例)
    total = sum(sentiment_count.values())
    satisfaction_rate = sentiment_count["positive"] / total if total > 0 else 0
    
    return {
        "time_range": f"最近{days}天",
        "sentiment_distribution": sentiment_count,
        "average_sentiment_score": round(avg_sentiment, 2),
        "satisfaction_rate": round(satisfaction_rate * 100, 2),
        "total_analyzed": total,
        "negative_rate": round(sentiment_count["negative"] / total * 100, 2) if total > 0 else 0
    }

@router.get("/department-performance", summary="部门绩效分析")
async def get_department_performance(
    days: int = 30,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """分析各部门的响应时间和处理效率"""
    start_date = datetime.now() - timedelta(days=days)
    
    tickets = db.query(Ticket).filter(Ticket.created_at >= start_date).all()
    
    dept_stats = {}
    
    for ticket in tickets:
        dept = ticket.department or "未分派"
        if dept not in dept_stats:
            dept_stats[dept] = {
                "total": 0,
                "resolved": 0,
                "avg_response_time": 0,
                "response_times": []
            }
        
        dept_stats[dept]["total"] += 1
        if ticket.status == "resolved":
            dept_stats[dept]["resolved"] += 1
        
        if ticket.response_time:
            dept_stats[dept]["response_times"].append(ticket.response_time)
    
    # 计算平均响应时间
    for dept in dept_stats:
        times = dept_stats[dept]["response_times"]
        if times:
            dept_stats[dept]["avg_response_time"] = round(sum(times) / len(times), 2)
        dept_stats[dept]["resolution_rate"] = round(
            dept_stats[dept]["resolved"] / dept_stats[dept]["total"] * 100, 2
        ) if dept_stats[dept]["total"] > 0 else 0
        del dept_stats[dept]["response_times"]  # 删除原始数据
    
    return {
        "time_range": f"最近{days}天",
        "departments": dept_stats
    }

@router.get("/keywords-cloud", summary="关键词云")
async def get_keywords_cloud(
    days: int = 30,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """生成关键词云数据"""
    start_date = datetime.now() - timedelta(days=days)
    
    tickets = db.query(Ticket).filter(Ticket.created_at >= start_date).all()
    
    keyword_count = {}
    
    for ticket in tickets:
        if ticket.keywords:
            keywords = ticket.keywords.split(",")
            for keyword in keywords:
                keyword = keyword.strip()
                if keyword:
                    keyword_count[keyword] = keyword_count.get(keyword, 0) + 1
    
    # 转换为词云格式
    word_cloud = [
        {"name": k, "value": v}
        for k, v in sorted(keyword_count.items(), key=lambda x: x[1], reverse=True)[:30]
    ]
    
    return {
        "time_range": f"最近{days}天",
        "keywords": word_cloud,
        "total_keywords": len(keyword_count)
    }

@router.get("/export/report", summary="导出统计报告")
async def export_report(
    days: int = 30,
    format: str = "json",
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """导出综合统计报告（JSON格式）"""
    start_date = datetime.now() - timedelta(days=days)
    
    tickets = db.query(Ticket).filter(Ticket.created_at >= start_date).all()
    
    report = {
        "report_date": datetime.now().isoformat(),
        "time_range": f"最近{days}天",
        "summary": {
            "total_tickets": len(tickets),
            "resolved": len([t for t in tickets if t.status == "resolved"]),
            "pending": len([t for t in tickets if t.status == "pending"]),
            "processing": len([t for t in tickets if t.status == "processing"])
        },
        "category_distribution": {},
        "sentiment_analysis": {
            "positive": 0,
            "neutral": 0,
            "negative": 0
        },
        "top_keywords": [],
        "average_response_time_ms": 0
    }
    
    # 统计类别
    for ticket in tickets:
        cat = ticket.category or "其他"
        report["category_distribution"][cat] = report["category_distribution"].get(cat, 0) + 1
        
        # 统计情绪
        sent = ticket.sentiment or "neutral"
        report["sentiment_analysis"][sent] += 1
    
    # 计算平均响应时间
    response_times = [t.response_time for t in tickets if t.response_time]
    if response_times:
        report["average_response_time_ms"] = round(sum(response_times) / len(response_times), 2)
    
    return report

