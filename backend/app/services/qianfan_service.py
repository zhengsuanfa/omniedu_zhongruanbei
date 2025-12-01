"""
百度千帆服务
"""
import qianfan
import json
from typing import Dict, Any, List
from app.core.config import settings

class QianfanService:
    """千帆AI服务类"""
    
    def __init__(self):
        """初始化千帆客户端"""
        # 设置千帆认证
        if settings.QIANFAN_AK and settings.QIANFAN_SK:
            qianfan.AK(settings.QIANFAN_AK)
            qianfan.SK(settings.QIANFAN_SK)
        
        # 创建聊天完成客户端
        self.chat_comp = qianfan.ChatCompletion()
    
    async def analyze_intent(self, content: str) -> Dict[str, Any]:
        """
        分析市民诉求的意图
        
        Args:
            content: 市民反馈内容
            
        Returns:
            分析结果
        """
        prompt = self._build_intent_prompt(content)
        
        try:
            # 调用千帆API
            response = self.chat_comp.do(
                model="ERNIE-Speed-128k",  # 使用ERNIE-Speed模型（注意是小写k）
                messages=[{
                    "role": "user",
                    "content": prompt
                }],
                temperature=0.3,
                top_p=0.8
            )
            
            # 解析响应
            result_text = response.get("result", "")
            return self._parse_analysis_result(result_text)
            
        except Exception as e:
            print(f"千帆API调用失败: {e}")
            # 返回默认结果
            return self._get_default_analysis(content)
    
    def _build_intent_prompt(self, content: str) -> str:
        """构建意图分析prompt"""
        return f"""你是一个政务热线工单分析专家。请仔细分析以下市民反馈，提取关键信息。

市民反馈: {content}

请严格按照以下JSON格式输出分析结果（不要包含任何其他文字）：
{{
  "core_issues": ["问题1", "问题2"],
  "entities": {{
    "location": "位置信息",
    "time": "时间信息",
    "departments": ["相关部门"]
  }},
  "sentiment": {{
    "type": "positive/neutral/negative",
    "intensity": 0.75,
    "urgency": "low/medium/high",
    "keywords": ["关键词1", "关键词2"]
  }},
  "summary": "一句话摘要（不超过50字）",
  "suggested_category": "工单类别",
  "suggested_department": "建议分派部门",
  "priority": "low/medium/high"
}}

分析要点:
1. core_issues: 识别所有核心问题，可能包含多个
2. entities: 提取地点、时间等关键实体
3. sentiment: 准确判断情绪类型和紧急程度
4. summary: 简洁准确地概括问题
5. suggested_category: 从以下类别中选择: 环境卫生/市政设施/交通出行/噪音扰民/物业管理/行政效率/其他
6. suggested_department: 建议最合适的处理部门
7. priority: 综合考虑紧急程度和影响范围

请直接输出JSON，不要有其他内容。"""
    
    def _parse_analysis_result(self, result_text: str) -> Dict[str, Any]:
        """解析AI返回的分析结果"""
        try:
            # 尝试提取JSON
            json_start = result_text.find('{')
            json_end = result_text.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = result_text[json_start:json_end]
                return json.loads(json_str)
            else:
                raise ValueError("未找到有效的JSON")
                
        except Exception as e:
            print(f"解析结果失败: {e}")
            print(f"原始结果: {result_text}")
            return {
                "core_issues": ["待分析"],
                "entities": {},
                "sentiment": {
                    "type": "neutral",
                    "intensity": 0.5,
                    "urgency": "medium"
                },
                "summary": result_text[:100],
                "suggested_category": "其他",
                "suggested_department": "综合服务部",
                "priority": "medium"
            }
    
    def _get_default_analysis(self, content: str) -> Dict[str, Any]:
        """获取默认分析结果（API失败时使用）"""
        # 简单的关键词提取
        keywords = self._extract_simple_keywords(content)
        
        return {
            "core_issues": ["市民反馈"],
            "entities": {
                "location": "待确认",
                "time": "近期",
                "departments": []
            },
            "sentiment": {
                "type": "neutral",
                "intensity": 0.5,
                "urgency": "medium",
                "keywords": keywords
            },
            "summary": content[:50] + "..." if len(content) > 50 else content,
            "suggested_category": "其他",
            "suggested_department": "综合服务部",
            "priority": "medium",
            "keywords": keywords,
            "solution_suggestion": "我们已收到您的反馈，将尽快为您处理。"
        }
    
    def _extract_simple_keywords(self, content: str) -> List[str]:
        """简单的关键词提取（用于降级模式）"""
        # 常见问题关键词
        keyword_dict = {
            "垃圾": "环境卫生",
            "路灯": "市政设施",
            "噪音": "噪音扰民",
            "停车": "交通出行",
            "物业": "物业管理",
            "道路": "市政设施",
            "绿化": "环境卫生",
            "施工": "工程建设"
        }
        
        keywords = []
        for key, value in keyword_dict.items():
            if key in content:
                keywords.append(value)
        
        return keywords[:5] if keywords else ["其他"]
    
    async def generate_summary(self, content: str) -> str:
        """生成工单摘要"""
        try:
            response = self.chat_comp.do(
                model="ERNIE-Speed-128k",
                messages=[{
                    "role": "user",
                    "content": f"请用一句话（不超过50字）概括以下市民反馈的核心问题：\n\n{content}"
                }],
                temperature=0.3
            )
            return response.get("result", content[:50])
        except:
            return content[:50] + "..." if len(content) > 50 else content
    
    async def extract_keywords(self, content: str) -> List[str]:
        """提取关键词"""
        try:
            response = self.chat_comp.do(
                model="ERNIE-Speed-128k",
                messages=[{
                    "role": "user",
                    "content": f"从以下文本中提取3-5个关键词，用逗号分隔：\n\n{content}"
                }],
                temperature=0.2
            )
            result = response.get("result", "")
            keywords = [k.strip() for k in result.split(",")]
            return keywords[:5]
        except:
            return self._extract_simple_keywords(content)
    
    async def generate_solution(self, content: str, category: str) -> str:
        """生成解决方案建议"""
        try:
            prompt = f"""
作为政务热线专家，请为以下问题提供专业的解决方案建议：

问题类别：{category}
问题描述：{content}

请提供：
1. 可能的解决方案（2-3条）
2. 预计处理时间
3. 注意事项

用简洁专业的语言回答，不超过200字。
"""
            response = self.chat_comp.do(
                model="ERNIE-Speed-128k",
                messages=[{
                    "role": "user",
                    "content": prompt
                }],
                temperature=0.5
            )
            return response.get("result", "我们将尽快为您处理，请耐心等待。")
        except:
            solutions = {
                "环境卫生": "建议：1. 联系环卫部门加强清理频次 2. 设置垃圾分类点 3. 预计3个工作日内处理完毕",
                "市政设施": "建议：1. 派遣维修人员现场查看 2. 制定维修方案 3. 预计5个工作日内修复",
                "噪音扰民": "建议：1. 核实施工许可证 2. 限制施工时间 3. 加强现场监管",
                "交通出行": "建议：1. 优化交通组织方案 2. 增设交通标识 3. 加强现场疏导"
            }
            return solutions.get(category, "我们已收到您的反馈，将尽快安排处理。")
    
    async def find_similar_tickets(self, content: str, existing_tickets: List[Dict]) -> List[Dict]:
        """查找相似工单"""
        # 简单的文本相似度匹配
        similar = []
        keywords = set(self._extract_simple_keywords(content))
        
        for ticket in existing_tickets:
            ticket_keywords = set(self._extract_simple_keywords(ticket.get("content", "")))
            # 计算关键词交集
            intersection = keywords & ticket_keywords
            if len(intersection) >= 1:
                similarity = len(intersection) / len(keywords | ticket_keywords)
                if similarity > 0.3:
                    similar.append({
                        "ticket": ticket,
                        "similarity": round(similarity, 2)
                    })
        
        # 按相似度排序
        similar.sort(key=lambda x: x["similarity"], reverse=True)
        return similar[:5]
    
    async def analyze_trends(self, tickets_data: List[Dict]) -> Dict[str, Any]:
        """分析趋势和生成预警"""
        # 统计分析
        category_count = {}
        location_count = {}
        
        for ticket in tickets_data:
            # 类别统计
            category = ticket.get("category", "其他")
            category_count[category] = category_count.get(category, 0) + 1
            
            # 地点统计
            location = ticket.get("location_district", "未知")
            location_count[location] = location_count.get(location, 0) + 1
        
        # 生成预警
        alerts = []
        
        # 检查类别激增
        for category, count in category_count.items():
            if count > 10:  # 简单阈值
                alerts.append({
                    "type": "category_surge",
                    "level": "high" if count > 20 else "medium",
                    "title": f"{category}类工单数量较多",
                    "description": f"近期{category}类工单达到{count}件，建议重点关注",
                    "data": {"category": category, "count": count}
                })
        
        # 检查地点集中
        for location, count in location_count.items():
            if count > 5:
                alerts.append({
                    "type": "location_concentration",
                    "level": "medium",
                    "title": f"{location}区域问题集中",
                    "description": f"{location}区域工单数量达到{count}件",
                    "data": {"location": location, "count": count}
                })
        
        return {
            "category_statistics": category_count,
            "location_statistics": location_count,
            "alerts": alerts,
            "total_analyzed": len(tickets_data)
        }

# 创建全局实例
qianfan_service = QianfanService()

