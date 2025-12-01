import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from 'antd'
import { AnimatePresence } from 'framer-motion'
import SplashScreen from './components/SplashScreen'
import './components/SplashScreen.css'
import CitizenPage from './pages/CitizenPage'
import DashboardPage from './pages/DashboardPage'
import MyTicketsPage from './pages/MyTicketsPage'
import NavBar from './components/NavBar'

const { Header, Content } = Layout

function App() {
  const location = useLocation()
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // 显示启动屏幕
  if (showSplash) {
    return (
      <AnimatePresence>
        <SplashScreen key="splash" onComplete={handleSplashComplete} />
      </AnimatePresence>
    )
  }

  // 启动屏幕完成后，显示主应用
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ 
        position: 'fixed', 
        zIndex: 1000, 
        width: '100%', 
        padding: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <NavBar />
      </Header>
      <Content style={{ marginTop: 64, minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/citizen" replace />} />
          <Route path="/citizen" element={<CitizenPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App

