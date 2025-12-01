"""
千帆AI直接调用API
"""
from fastapi import APIRouter
from app.schemas.ticket import IntentAnalysisRequest, IntentAnalysisResponse
from app.services.qianfan_service import qianfan_service

router = APIRouter()

@router.post("/analyze", response_model=IntentAnalysisResponse, summary="意图分析")
async def analyze_intent(request: IntentAnalysisRequest):
    """
    直接调用千帆AI进行意图分析
    
    这个接口可以独立使用，不创建工单
    """
    result = await qianfan_service.analyze_intent(request.content)
    
    return IntentAnalysisResponse(
        core_issues=result.get("core_issues", []),
        entities=result.get("entities", {}),
        sentiment=result.get("sentiment", {}),
        summary=result.get("summary", ""),
        suggested_category=result.get("suggested_category", "其他"),
        suggested_department=result.get("suggested_department", "综合服务部"),
        priority=result.get("priority", "medium")
    )

@router.post("/summary", summary="生成摘要")
async def generate_summary(request: IntentAnalysisRequest):
    """
    为长文本生成简短摘要
    """
    summary = await qianfan_service.generate_summary(request.content)
    return {
        "content": request.content,
        "summary": summary
    }

@router.get("/test", summary="测试千帆连接")
async def test_qianfan():
    """
    测试千帆API连接是否正常
    """
    test_content = "这是一个测试消息"
    try:
        result = await qianfan_service.analyze_intent(test_content)
        return {
            "status": "success",
            "message": "千帆API连接正常",
            "test_result": result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"千帆API连接失败: {str(e)}"
        }

