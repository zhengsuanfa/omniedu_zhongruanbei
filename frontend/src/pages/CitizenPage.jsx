import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Alert,
  Spin,
  Timeline,
  Typography,
  Modal,
  Badge
} from 'antd'
import {
  SendOutlined,
  FileTextOutlined,
  TagsOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SmileOutlined,
  FrownOutlined,
  MehOutlined
} from '@ant-design/icons'
import { ticketAPI } from '../services/api'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography

// 智能标签库
const SMART_TAGS = {
  '环境卫生': ['垃圾', '清理', '异味', '卫生', '保洁', '臭味'],
  '市政设施': ['路灯', '损坏', '维修', '道路', '井盖', '下水道'],
  '噪音扰民': ['噪音', '吵闹', '施工', '扰民', '音乐'],
  '交通出行': ['停车', '交通', '拥堵', '违停', '占道'],
  '绿化养护': ['绿化', '树木', '花草', '修剪', '浇水'],
  '其他': ['反映', '投诉', '建议', '咨询']
}

const CitizenPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [ticketResult, setTicketResult] = useState(null)
  const [inputText, setInputText] = useState('')
  const [suggestedTags, setSuggestedTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  // 智能标签识别
  useEffect(() => {
    if (inputText) {
      const detected = []
      Object.entries(SMART_TAGS).forEach(([category, keywords]) => {
        const hasKeyword = keywords.some(keyword => 
          inputText.toLowerCase().includes(keyword)
        )
        if (hasKeyword && !detected.includes(category)) {
          detected.push(category)
        }
      })
      setSuggestedTags(detected)
    } else {
      setSuggestedTags([])
    }
  }, [inputText])

  // 处理输入变化
  const handleInputChange = (e) => {
    const text = e.target.value
    setInputText(text)
    form.setFieldsValue({ content: text })
  }

  // 选择标签
  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    setAnalysis(null)
    setTicketResult(null)
    
    try {
      // 添加标签信息到内容
      let content = values.content
      if (selectedTags.length > 0) {
        content += `\n\n[标签: ${selectedTags.join(', ')}]`
      }
      
      // 提交工单
      const result = await ticketAPI.create({
        content: content,
        location_info: values.location_info
      })
      
      setTicketResult(result)
      setAnalysis(result.ai_analysis)
      message.success({
        content: '🎉 工单提交成功！',
        duration: 3
      })
      
      // 清空表单和状态
      form.resetFields()
      setInputText('')
      setSelectedTags([])
      setSuggestedTags([])
    } catch (error) {
      console.error('提交失败:', error)
      const errorMsg = error.response?.data?.detail || error.message || '提交失败，请稍后重试'
      message.error({
        content: `❌ ${errorMsg}`,
        duration: 5
      })
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: 'green',
      neutral: 'blue',
      negative: 'red'
    }
    return colors[sentiment] || 'default'
  }

  const getSentimentText = (sentiment) => {
    const texts = {
      positive: '积极',
      neutral: '中性',
      negative: '消极'
    }
    return texts[sentiment] || sentiment
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'warning',
      high: 'error'
    }
    return colors[priority] || 'default'
  }

  const getPriorityText = (priority) => {
    const texts = {
      low: '低优先级',
      medium: '中优先级',
      high: '高优先级'
    }
    return texts[priority] || priority
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <SendOutlined /> 市民工单提交
      </Title>
      <Paragraph type="secondary">
        请描述您遇到的问题，我们的AI助手将为您智能分析并自动分派到相关部门
      </Paragraph>

      <Row gutter={24}>
         <Col xs={24} lg={12}>
           <Card 
             title={
               <Space>
                 <FileTextOutlined />
                 提交工单
               </Space>
             }
             bordered={false}
             style={{ height: '100%' }}
           >
             <Form
               form={form}
               layout="vertical"
               onFinish={handleSubmit}
             >
               <Form.Item
                 label={
                   <Space>
                     <span>问题描述</span>
                     <Text type="secondary" style={{ fontSize: 12 }}>
                       （可同时提交多个诉求）
                     </Text>
                   </Space>
                 }
                 name="content"
                 rules={[
                   { required: true, message: '请输入问题描述' },
                   { min: 10, message: '请至少输入10个字符' }
                 ]}
               >
                 <TextArea
                   rows={8}
                   value={inputText}
                   onChange={handleInputChange}
                   placeholder="请详细描述问题，可同时提交多个诉求&#10;&#10;例如：我家楼下垃圾堆了三天没清理，味道很大，而且路灯也不亮了，向街道反映过但没下文..."
                   maxLength={1000}
                   showCount
                   style={{ fontSize: 15 }}
                 />
               </Form.Item>

               {/* 智能标签提示 */}
               {suggestedTags.length > 0 && (
                 <div style={{ marginBottom: 16 }}>
                   <Space direction="vertical" style={{ width: '100%' }}>
                     <Text strong>
                       <TagsOutlined /> 智能识别标签：
                     </Text>
                     <div>
                       {suggestedTags.map(tag => (
                         <Tag
                           key={tag}
                           color={selectedTags.includes(tag) ? 'blue' : 'default'}
                           style={{
                             cursor: 'pointer',
                             fontSize: 14,
                             padding: '6px 16px',
                             marginBottom: 8
                           }}
                           icon={selectedTags.includes(tag) ? <CheckCircleOutlined /> : null}
                           onClick={() => handleTagClick(tag)}
                         >
                           {tag}
                         </Tag>
                       ))}
                     </div>
                     <Text type="secondary" style={{ fontSize: 12 }}>
                       💡 点击标签可添加到工单中
                     </Text>
                   </Space>
                 </div>
               )}

               {/* 已选标签 */}
               {selectedTags.length > 0 && (
                 <Alert
                   message="已选标签"
                   description={
                     <Space wrap>
                       {selectedTags.map(tag => (
                         <Tag key={tag} color="blue" closable onClose={() => handleTagClick(tag)}>
                           {tag}
                         </Tag>
                       ))}
                     </Space>
                   }
                   type="info"
                   showIcon
                   style={{ marginBottom: 16 }}
                 />
               )}

               <Form.Item
                 label="位置信息（可选）"
                 name="location_info"
               >
                 <Input
                   prefix={<EnvironmentOutlined />}
                   placeholder="例如：XX区XX街道XX小区"
                   size="large"
                 />
               </Form.Item>

               {/* 提交按钮 */}
               <Form.Item style={{ marginBottom: 0 }}>
                 <Button
                   type="primary"
                   htmlType="submit"
                   icon={<SendOutlined />}
                   size="large"
                   block
                   loading={loading}
                   style={{ 
                     height: 48,
                     fontSize: 16,
                     fontWeight: 500,
                     background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                     border: 'none',
                     boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)'
                   }}
                 >
                   {loading ? 'AI分析中...' : '立即提交工单'}
                 </Button>
               </Form.Item>
             </Form>

            <Alert
              message="示例场景"
              description={
                <div>
                  <p>• 环境卫生：垃圾清理、道路保洁等</p>
                  <p>• 市政设施：路灯维修、道路损坏等</p>
                  <p>• 噪音扰民：施工噪音、商业噪音等</p>
                  <p>• 交通出行：停车管理、交通拥堵等</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {loading && (
            <Card bordered={false}>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop: 16, color: '#999' }}>
                  AI正在分析您的问题...
                </p>
              </div>
            </Card>
          )}

          {ticketResult && analysis && (
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  工单分析结果
                </Space>
              }
              bordered={false}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong>工单编号：</Text>
                  <Tag color="blue">{ticketResult.ticket_no}</Tag>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div>
                  <Text strong>AI摘要：</Text>
                  <Paragraph style={{ marginTop: 8, padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                    {analysis.summary || ticketResult.summary}
                  </Paragraph>
                </div>

                <div>
                  <Text strong>核心问题：</Text>
                  <div style={{ marginTop: 8 }}>
                    {analysis.core_issues && analysis.core_issues.map((issue, index) => (
                      <Tag key={index} color="orange" style={{ marginBottom: 8 }}>
                        {issue}
                      </Tag>
                    ))}
                  </div>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>问题分类：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">{ticketResult.category}</Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text strong>负责部门：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="green">{ticketResult.department}</Tag>
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>优先级：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={getPriorityColor(ticketResult.priority)}>
                        {getPriorityText(ticketResult.priority)}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text strong>情绪分析：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={getSentimentColor(ticketResult.sentiment)}>
                        {getSentimentText(ticketResult.sentiment)}
                      </Tag>
                    </div>
                  </Col>
                </Row>

                {analysis.sentiment && (
                  <div>
                    <Text strong>情绪详情：</Text>
                    <div style={{ marginTop: 8, padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                      <p>情绪强度: {(analysis.sentiment.intensity * 100).toFixed(0)}%</p>
                      <p>紧急程度: {analysis.sentiment.urgency === 'high' ? '高' : analysis.sentiment.urgency === 'medium' ? '中' : '低'}</p>
                      {analysis.sentiment.keywords && analysis.sentiment.keywords.length > 0 && (
                        <p>关键词: {analysis.sentiment.keywords.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 关键词展示 */}
                {ticketResult.keywords && (
                  <div>
                    <Text strong>🔤 智能提取关键词：</Text>
                    <div style={{ marginTop: 8 }}>
                      {ticketResult.keywords.split(',').map((keyword, index) => (
                        <Tag key={index} color="purple" style={{ marginBottom: 8, fontSize: '14px' }}>
                          {keyword.trim()}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI解决方案建议 */}
                {ticketResult.solution_suggestion && (
                  <div>
                    <Text strong>💡 AI解决方案建议：</Text>
                    <div style={{ 
                      marginTop: 8, 
                      padding: '16px', 
                      background: '#f0f9ff', 
                      border: '1px solid #91d5ff',
                      borderRadius: '8px',
                      lineHeight: '1.8'
                    }}>
                      {ticketResult.solution_suggestion}
                    </div>
                  </div>
                )}

                {/* 响应时间 */}
                {ticketResult.response_time && (
                  <div style={{ marginTop: 8, color: '#52c41a' }}>
                    <Text type="secondary">
                      ⚡ AI分析完成时间：{ticketResult.response_time}毫秒
                    </Text>
                  </div>
                )}

                <Alert
                  message="工单已成功提交"
                  description={`您的工单已分派给 ${ticketResult.department}，我们将尽快处理。工单编号：${ticketResult.ticket_no}`}
                  type="success"
                  showIcon
                />
              </Space>
            </Card>
          )}

          {!loading && !ticketResult && (
            <Card bordered={false}>
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>提交工单后，AI分析结果将在这里显示</p>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default CitizenPage

