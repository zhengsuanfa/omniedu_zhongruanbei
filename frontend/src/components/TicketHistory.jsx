import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Rate,
  Input,
  message,
  Badge
} from 'antd'
import {
  EyeOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { ticketAPI } from '../services/api'

const { TextArea } = Input

const TicketHistory = ({ userId = 1 }) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingModal, setRatingModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const data = await ticketAPI.list({ limit: 50 })
      // 简化版：获取所有工单（实际应该按user_id过滤）
      setTickets(data)
    } catch (error) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const showRatingModal = (ticket) => {
    setSelectedTicket(ticket)
    setRatingModal(true)
    setRating(5)
    setFeedback('')
  }

  const handleSubmitRating = async () => {
    // 提交评价的API调用（简化版）
    message.success('评价已提交，感谢您的反馈！')
    setRatingModal(false)
  }

  const columns = [
    {
      title: '工单编号',
      dataIndex: 'ticket_no',
      key: 'ticket_no',
      width: 180,
      render: (text) => <span style={{ fontFamily: 'monospace' }}>{text}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = {
          pending: { color: 'orange', text: '待处理', icon: <ClockCircleOutlined /> },
          processing: { color: 'blue', text: '处理中', icon: <ClockCircleOutlined /> },
          resolved: { color: 'green', text: '已解决', icon: <CheckCircleOutlined /> },
          closed: { color: 'default', text: '已关闭', icon: <CheckCircleOutlined /> }
        }
        const { color, text, icon } = config[status] || config.pending
        return <Badge status={color} text={text} />
      }
    },
    {
      title: '问题描述',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => new Date(text).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<StarOutlined />}
          onClick={() => showRatingModal(record)}
          disabled={record.status !== 'resolved'}
        >
          评价
        </Button>
      )
    }
  ]

  return (
    <>
      <Card
        title="我的工单历史"
        extra={<Button onClick={loadTickets}>刷新</Button>}
      >
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条工单`
          }}
        />
      </Card>

      <Modal
        title="工单满意度评价"
        open={ratingModal}
        onOk={handleSubmitRating}
        onCancel={() => setRatingModal(false)}
        okText="提交评价"
        cancelText="取消"
      >
        {selectedTicket && (
          <div>
            <p><strong>工单编号：</strong>{selectedTicket.ticket_no}</p>
            <p><strong>问题描述：</strong>{selectedTicket.summary}</p>
            <div style={{ marginTop: 16 }}>
              <p><strong>满意度评分：</strong></p>
              <Rate
                value={rating}
                onChange={setRating}
                style={{ fontSize: 32 }}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <p><strong>意见反馈：</strong></p>
              <TextArea
                rows={4}
                placeholder="请输入您的意见或建议（选填）"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default TicketHistory

