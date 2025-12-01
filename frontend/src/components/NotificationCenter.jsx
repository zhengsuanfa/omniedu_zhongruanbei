import React, { useState, useEffect } from 'react'
import {
  Badge,
  Popover,
  List,
  Button,
  Empty,
  Tag,
  Space,
  Typography,
  Divider
} from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'

const { Text } = Typography

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 模拟通知数据
    const mockNotifications = [
      {
        id: 1,
        type: 'status_update',
        title: '工单状态更新',
        content: '您的工单 GH20251201001 已分派至环卫局处理',
        emotion: 'neutral',
        time: new Date(Date.now() - 5 * 60 * 1000),
        read: false
      },
      {
        id: 2,
        type: 'processing',
        title: '工单处理中',
        content: '您的工单 GH20251201002 正在处理中，预计24小时内完成',
        emotion: 'happy',
        time: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      },
      {
        id: 3,
        type: 'completed',
        title: '工单已完成',
        content: '您的工单 GH20251130123 已处理完成，请查看并评价',
        emotion: 'happy',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      },
      {
        id: 4,
        type: 'urgent',
        title: '紧急工单提醒',
        content: '您的紧急工单 GH20251201003 将在1小时内优先处理',
        emotion: 'urgent',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true
      }
    ]
    
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  // 获取通知图标
  const getNotificationIcon = (type, emotion) => {
    const emotionIcons = {
      happy: <SmileOutlined style={{ color: '#52c41a', fontSize: 20 }} />,
      neutral: <MehOutlined style={{ color: '#1890ff', fontSize: 20 }} />,
      urgent: <FrownOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
    }

    const typeIcons = {
      status_update: <FileTextOutlined style={{ color: '#1890ff', fontSize: 20 }} />,
      processing: <SyncOutlined spin style={{ color: '#1890ff', fontSize: 20 }} />,
      completed: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />,
      urgent: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
    }

    return emotion ? emotionIcons[emotion] : typeIcons[type]
  }

  // 获取时间显示
  const getTimeDisplay = (time) => {
    const now = new Date()
    const diff = now - time
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return `${days}天前`
  }

  // 标记已读
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // 全部标记为已读
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  // 清空所有通知
  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const content = (
    <div style={{ width: 380, maxHeight: 500, overflow: 'auto' }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Space>
          <Text strong style={{ fontSize: 16 }}>通知中心</Text>
          {unreadCount > 0 && (
            <Tag color="blue">{unreadCount} 条未读</Tag>
          )}
        </Space>
        <Space size="small">
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={markAllAsRead}>
              全部已读
            </Button>
          )}
          <Button type="link" size="small" onClick={clearAll} danger>
            清空
          </Button>
        </Space>
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: 40 }}>
          <Empty description="暂无通知" />
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 16px',
                background: item.read ? 'white' : '#f0f9ff',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onClick={() => !item.read && markAsRead(item.id)}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(item.type, item.emotion)}
                title={
                  <Space>
                    <Text strong style={{ fontSize: 14 }}>
                      {item.title}
                    </Text>
                    {!item.read && (
                      <Badge status="processing" />
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Text style={{ fontSize: 13, color: '#595959' }}>
                      {item.content}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {getTimeDisplay(item.time)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={visible}
      onOpenChange={setVisible}
    >
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          style={{ height: 40, width: 40 }}
        />
      </Badge>
    </Popover>
  )
}

export default NotificationCenter

