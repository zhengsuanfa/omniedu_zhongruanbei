import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Tag,
  Space,
  Button,
  Empty,
  Modal,
  Descriptions,
  Timeline,
  Typography,
  Spin,
  Badge,
  Statistic,
  Rate,
  Input,
  Select,
  message
} from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  EyeOutlined,
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { ticketAPI } from '../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [ratingModal, setRatingModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    setLoading(true)
    try {
      // 模拟用户ID为1
      const data = await ticketAPI.list({ limit: 50 })
      setTickets(data || [])
      setFilteredTickets(data || [])
    } catch (error) {
      console.error('加载失败:', error)
      message.error('加载工单失败')
    } finally {
      setLoading(false)
    }
  }

  // 筛选和搜索
  useEffect(() => {
    let result = [...tickets]
    
    // 状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter)
    }
    
    // 文本搜索
    if (searchText) {
      result = result.filter(t => 
        t.content?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.summary?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchText.toLowerCase())
      )
    }
    
    setFilteredTickets(result)
  }, [tickets, statusFilter, searchText])

  // 状态配置
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'orange',
        text: '待处理',
        icon: <ClockCircleOutlined />,
        badge: 'warning'
      },
      processing: {
        color: 'blue',
        text: '处理中',
        icon: <SyncOutlined spin />,
        badge: 'processing'
      },
      resolved: {
        color: 'green',
        text: '已完成',
        icon: <CheckCircleOutlined />,
        badge: 'success'
      }
    }
    return configs[status] || configs.pending
  }

  // 查看详情
  const handleViewDetail = (ticket) => {
    setSelectedTicket(ticket)
    setDetailVisible(true)
  }

  // 评价工单
  const handleRate = (ticket) => {
    setSelectedTicket(ticket)
    setRatingModal(true)
  }

  // 提交评价
  const handleSubmitRating = () => {
    message.success({
      content: `感谢您的${rating >= 4 ? '好' : rating >= 3 ? '中肯' : '宝贵'}评价！`,
      icon: rating >= 4 ? <SmileOutlined /> : rating >= 3 ? <MehOutlined /> : <FrownOutlined />
    })
    setRatingModal(false)
    setRating(5)
    setFeedback('')
    // 刷新列表
    loadTickets()
  }

  // 统计数据
  const getStatistics = () => {
    const stats = {
      total: tickets.length,
      pending: tickets.filter(t => t.status === 'pending').length,
      processing: tickets.filter(t => t.status === 'processing').length,
      resolved: tickets.filter(t => t.status === 'resolved').length
    }
    return stats
  }

  // 类别分布图表
  const getCategoryChartOption = () => {
    const categoryCount = {}
    tickets.forEach(ticket => {
      categoryCount[ticket.category] = (categoryCount[ticket.category] || 0) + 1
    })

    return {
      title: {
        text: '我的工单类别分布',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        bottom: 10,
        left: 'center'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: Object.entries(categoryCount).map(([name, value]) => ({
            name,
            value
          }))
        }
      ]
    }
  }

  const stats = getStatistics()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#999' }}>加载中...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            <FileTextOutlined /> 我的工单
          </Title>
          <Text type="secondary">
            查看您提交的所有工单进度和处理结果
          </Text>
        </div>
        <Space size="middle">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            placeholder="状态筛选"
          >
            <Option value="all">全部状态</Option>
            <Option value="pending">待处理</Option>
            <Option value="processing">处理中</Option>
            <Option value="resolved">已完成</Option>
          </Select>
          <Input
            placeholder="搜索工单内容..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTickets}
          >
            刷新
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false}>
            <Statistic
              title="总工单数"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false}>
            <Statistic
              title="待处理"
              value={stats.pending}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false}>
            <Statistic
              title="处理中"
              value={stats.processing}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined spin />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false}>
            <Statistic
              title="已完成"
              value={stats.resolved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* 工单列表 */}
        <Col xs={24} lg={16}>
          <Card
            title="工单列表"
            bordered={false}
            extra={
              <Button icon={<ReloadOutlined />} onClick={loadTickets}>
                刷新
              </Button>
            }
          >
            {filteredTickets.length === 0 ? (
              <Empty description={tickets.length === 0 ? "暂无工单" : "没有符合条件的工单"} />
            ) : (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {filteredTickets.map(ticket => {
                  const statusConfig = getStatusConfig(ticket.status)
                  return (
                    <Badge.Ribbon
                      key={ticket.id}
                      text={statusConfig.text}
                      color={statusConfig.color}
                    >
                      <Card
                        hoverable
                        style={{
                          borderLeft: `4px solid ${
                            statusConfig.color === 'orange' ? '#fa8c16' :
                            statusConfig.color === 'blue' ? '#1890ff' : '#52c41a'
                          }`
                        }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Space>
                              <Text strong style={{ fontSize: 16 }}>
                                {ticket.ticket_no}
                              </Text>
                              <Tag color={statusConfig.badge}>
                                {statusConfig.icon} {statusConfig.text}
                              </Tag>
                              <Tag color="blue">{ticket.category}</Tag>
                              <Tag>{ticket.department}</Tag>
                            </Space>
                          </div>

                          <Paragraph
                            ellipsis={{ rows: 2, expandable: false }}
                            style={{ margin: 0, color: '#595959' }}
                          >
                            {ticket.content}
                          </Paragraph>

                          {ticket.summary && (
                            <div
                              style={{
                                background: '#f5f5f5',
                                padding: '8px 12px',
                                borderRadius: 4,
                                fontSize: 13
                              }}
                            >
                              📝 {ticket.summary}
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <ClockCircleOutlined /> {new Date(ticket.created_at).toLocaleString('zh-CN')}
                            </Text>
                            <Space>
                              <Button
                                type="link"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetail(ticket)}
                              >
                                查看详情
                              </Button>
                              {ticket.status === 'resolved' && (
                                <Button
                                  type="link"
                                  icon={<SmileOutlined />}
                                  onClick={() => handleRate(ticket)}
                                >
                                  评价
                                </Button>
                              )}
                            </Space>
                          </div>
                        </Space>
                      </Card>
                    </Badge.Ribbon>
                  )
                })}
              </Space>
            )}
          </Card>
        </Col>

        {/* 类别分布图 */}
        <Col xs={24} lg={8}>
          <Card title="类别分布" bordered={false}>
            {tickets.length > 0 ? (
              <ReactECharts
                option={getCategoryChartOption()}
                style={{ height: '300px' }}
              />
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 工单详情模态框 */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            工单详情
          </Space>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTicket && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="工单编号" span={2}>
                <Text copyable>{selectedTicket.ticket_no}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusConfig(selectedTicket.status).badge}>
                  {getStatusConfig(selectedTicket.status).icon}{' '}
                  {getStatusConfig(selectedTicket.status).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={
                  selectedTicket.priority === 'high' ? 'red' :
                  selectedTicket.priority === 'medium' ? 'orange' : 'default'
                }>
                  {selectedTicket.priority === 'high' ? '高' :
                   selectedTicket.priority === 'medium' ? '中' : '低'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="类别">
                {selectedTicket.category}
              </Descriptions.Item>
              <Descriptions.Item label="负责部门">
                {selectedTicket.department}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间" span={2}>
                {new Date(selectedTicket.created_at).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Text strong>问题描述：</Text>
              <Paragraph style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                {selectedTicket.content}
              </Paragraph>
            </div>

            {selectedTicket.summary && (
              <div>
                <Text strong>AI智能摘要：</Text>
                <Paragraph style={{ marginTop: 8, padding: 12, background: '#e6f7ff', borderRadius: 4 }}>
                  {selectedTicket.summary}
                </Paragraph>
              </div>
            )}

            {selectedTicket.solution_suggestion && (
              <div>
                <Text strong>💡 处理建议：</Text>
                <Paragraph style={{ marginTop: 8, padding: 12, background: '#f6ffed', borderRadius: 4 }}>
                  {selectedTicket.solution_suggestion}
                </Paragraph>
              </div>
            )}

            {selectedTicket.keywords && (
              <div>
                <Text strong>关键词：</Text>
                <div style={{ marginTop: 8 }}>
                  {selectedTicket.keywords.split(',').map((kw, i) => (
                    <Tag key={i} color="purple">{kw.trim()}</Tag>
                  ))}
                </div>
              </div>
            )}

            {/* 处理时间线（模拟） */}
            <div>
              <Text strong>处理进度：</Text>
              <Timeline
                style={{ marginTop: 16 }}
                items={[
                  {
                    color: 'green',
                    children: (
                      <>
                        <Text>工单已提交</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(selectedTicket.created_at).toLocaleString('zh-CN')}
                        </Text>
                      </>
                    )
                  },
                  selectedTicket.status !== 'pending' && {
                    color: 'blue',
                    children: (
                      <>
                        <Text>已分派至 {selectedTicket.department}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          系统自动分派
                        </Text>
                      </>
                    )
                  },
                  selectedTicket.status === 'resolved' && {
                    color: 'green',
                    children: (
                      <>
                        <Text>问题已解决</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(selectedTicket.updated_at).toLocaleString('zh-CN')}
                        </Text>
                      </>
                    )
                  }
                ].filter(Boolean)}
              />
            </div>
          </Space>
        )}
      </Modal>

      {/* 评价模态框 */}
      <Modal
        title={
          <Space>
            <SmileOutlined />
            工单评价
          </Space>
        }
        open={ratingModal}
        onOk={handleSubmitRating}
        onCancel={() => setRatingModal(false)}
        okText="提交评价"
        cancelText="取消"
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ fontSize: 16 }}>请为本次服务打分</Text>
            <div style={{ marginTop: 16 }}>
              <Rate
                value={rating}
                onChange={setRating}
                style={{ fontSize: 36 }}
                character={({ index }) => {
                  if (index < rating) {
                    return rating >= 4 ? <SmileOutlined /> : rating >= 3 ? <MehOutlined /> : <FrownOutlined />
                  }
                  return <MehOutlined />
                }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {rating >= 4 ? '😊 非常满意' : rating >= 3 ? '😐 一般' : '😞 不满意'}
              </Text>
            </div>
          </div>

          <div>
            <Text strong>意见反馈（选填）：</Text>
            <TextArea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请告诉我们您的宝贵意见..."
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  )
}

export default MyTicketsPage

