import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Space } from 'antd'
import { 
  UserOutlined, 
  DashboardOutlined, 
  PhoneOutlined,
  SendOutlined,
  FileTextOutlined,
  RocketOutlined
} from '@ant-design/icons'
import NotificationCenter from './NotificationCenter'

const NavBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const items = [
    {
      key: '/citizen',
      icon: <SendOutlined />,
      label: '提交工单',
      onClick: () => navigate('/citizen')
    },
    {
      key: '/my-tickets',
      icon: <FileTextOutlined />,
      label: '我的工单',
      onClick: () => navigate('/my-tickets')
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据大盘',
      onClick: () => navigate('/dashboard')
    },
  ]
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      height: '100%', 
      padding: '0 24px',
      justifyContent: 'space-between'
    }}>
      {/* Logo和标题 */}
      <div 
        style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <RocketOutlined style={{ fontSize: 24, marginRight: 12 }} />
        <span>智慧政务热线</span>
      </div>

      {/* 中间菜单 */}
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        style={{ flex: 1, minWidth: 0, marginLeft: 40, background: 'transparent', border: 'none' }}
      />

      {/* 右侧通知中心 */}
      <Space size="middle">
        <NotificationCenter />
        <div style={{ color: 'white', fontSize: 14 }}>
          <UserOutlined style={{ marginRight: 6 }} />
          市民用户
        </div>
      </Space>
    </div>
  )
}

export default NavBar

