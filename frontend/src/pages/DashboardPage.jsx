import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Alert,
  Space,
  Select,
  Button,
  Typography,
  Spin,
  message,
  DatePicker,
  Modal,
  Checkbox,
  Badge,
  Tooltip,
  Dropdown,
  Menu,
  Input
} from 'antd'
import {
  DashboardOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
  FilterOutlined,
  BellOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SendOutlined,
  MoreOutlined,
  FireOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { analysisAPI, ticketAPI } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

// 模拟区域数据
const DISTRICTS = ['朝阳区', '海淀区', '丰台区', '昌平区', '石景山区']
const CATEGORIES = ['环境卫生', '市政设施', '噪音扰民', '交通出行', '绿化养护', '其他']

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [tickets, setTickets] = useState([])
  const [sentimentData, setSentimentData] = useState(null)
  const [keywordsData, setKeywordsData] = useState(null)
  
  // 筛选器状态
  const [timeRange, setTimeRange] = useState(7)
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  
  // 工单管理状态
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'
  
  // 预警弹窗
  const [alertModalVisible, setAlertModalVisible] = useState(false)
  const [currentAlert, setCurrentAlert] = useState(null)

  useEffect(() => {
    loadData()
    // 模拟实时预警 - 缩短到2秒
    const alertTimer = setTimeout(() => {
      showRealtimeAlert()
    }, 2000)
    return () => clearTimeout(alertTimer)
  }, [timeRange, selectedDistrict, selectedCategory])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, alertsRes, ticketsRes, sentimentRes] = await Promise.all([
        analysisAPI.statistics({ days: timeRange }),
        analysisAPI.alerts({ days: timeRange }),
        ticketAPI.list({ limit: 50 }),
        analysisAPI.sentimentAnalysis({ days: timeRange })
      ])

      setStatistics(statsRes)
      setAlerts(alertsRes)
      
      // 筛选工单
      let filteredTickets = ticketsRes || []
      if (selectedDistrict !== 'all') {
        filteredTickets = filteredTickets.filter(t => 
          t.location_info?.includes(selectedDistrict)
        )
      }
      if (selectedCategory !== 'all') {
        filteredTickets = filteredTickets.filter(t => t.category === selectedCategory)
      }
      setTickets(filteredTickets)
      
      setSentimentData(sentimentRes)
      
      // 加载关键词
      try {
        const keywordsRes = await fetch(`/api/v1/analysis/keywords-cloud?days=${timeRange}`)
        if (keywordsRes.ok) {
          const data = await keywordsRes.json()
          setKeywordsData(data)
        }
      } catch (err) {
        console.log('关键词数据加载失败')
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 显示实时预警
  const showRealtimeAlert = () => {
    const alert = {
      type: 'hot_area',
      level: 'high',
      title: '🔥 热点区域预警',
      area: '朝阳区',
      category: '环境卫生',
      count: 23,
      increase: '+85%',
      description: '近2小时内朝阳区环境卫生类工单激增23件，较昨日同期增长85%，建议立即关注'
    }
    setCurrentAlert(alert)
    setAlertModalVisible(true)
  }

  // 趋势折线图
  const getTrendChartOption = () => {
    return {
      title: {
        text: '工单趋势分析',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['总量', '待处理', '已完成'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: Array.from({ length: timeRange }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (timeRange - 1 - i))
          return `${date.getMonth() + 1}/${date.getDate()}`
        })
      },
      yAxis: {
        type: 'value',
        name: '工单数'
      },
      series: [
        {
          name: '总量',
          type: 'line',
          smooth: true,
          data: Array.from({ length: timeRange }, () => Math.floor(Math.random() * 20 + 10)),
          itemStyle: { color: '#1890ff' },
          areaStyle: { 
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
              ]
            }
          }
        },
        {
          name: '待处理',
          type: 'line',
          smooth: true,
          data: Array.from({ length: timeRange }, () => Math.floor(Math.random() * 8 + 2)),
          itemStyle: { color: '#faad14' }
        },
        {
          name: '已完成',
          type: 'line',
          smooth: true,
          data: Array.from({ length: timeRange }, () => Math.floor(Math.random() * 15 + 5)),
          itemStyle: { color: '#52c41a' }
        }
      ]
    }
  }

  // 类别统计柱状图
  const getCategoryBarChartOption = () => {
    if (!statistics) return {}

    const categories = Object.keys(statistics.by_category || {})
    const values = Object.values(statistics.by_category || {})
    
    // 找出异常增长的类别（模拟）
    const maxValue = Math.max(...values)

    return {
      title: {
        text: '类别统计分析',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 30,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '工单数'
      },
      series: [
        {
          type: 'bar',
          data: values.map(v => ({
            value: v,
            itemStyle: {
              color: v === maxValue ? '#ff4d4f' : '#1890ff' // 最高值红色预警
            }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: (params) => {
              return params.value === maxValue ? `⚠️ ${params.value}` : params.value
            }
          },
          barMaxWidth: 50
        }
      ]
    }
  }

  // 区域热力图
  const getHeatmapChartOption = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    
    const data = []
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 24; j++) {
        data.push([j, i, Math.floor(Math.random() * 15)])
      }
    }

    return {
      title: {
        text: '工单热力分布图（按时间段）',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        position: 'top',
        formatter: (params) => {
          return `${days[params.data[1]]} ${hours[params.data[0]]}<br/>工单数: ${params.data[2]}`
        }
      },
      grid: {
        height: '60%',
        top: '15%'
      },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: { show: true },
        axisLabel: { interval: 2 }
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: { show: true }
      },
      visualMap: {
        min: 0,
        max: 15,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#50a3ba', '#eac736', '#d94e5d']
        }
      },
      series: [
        {
          name: '工单数',
          type: 'heatmap',
          data: data,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }

  // 趋势预测图
  const getPredictionChartOption = () => {
    const categories = ['环境卫生', '市政设施', '噪音扰民', '交通出行', '绿化养护']
    const historicalData = categories.map(() => Math.floor(Math.random() * 20 + 10))
    const predictedData = categories.map(() => Math.floor(Math.random() * 25 + 15))

    return {
      title: {
        text: '未来7天诉求预测',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['历史数据', '预测数据'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { rotate: 30 }
      },
      yAxis: {
        type: 'value',
        name: '预计工单数'
      },
      series: [
        {
          name: '历史数据',
          type: 'bar',
          data: historicalData,
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '预测数据',
          type: 'bar',
          data: predictedData,
          itemStyle: { 
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#ff4d4f' },
                { offset: 1, color: '#faad14' }
              ]
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params) => {
              const increase = ((params.value - historicalData[params.dataIndex]) / historicalData[params.dataIndex] * 100).toFixed(0)
              return increase > 20 ? `⚠️ +${increase}%` : `+${increase}%`
            }
          }
        }
      ]
    }
  }

  // 工单表格列配置
  const columns = [
    {
      title: '工单编号',
      dataIndex: 'ticket_no',
      key: 'ticket_no',
      width: 180,
      render: (text) => <Text copyable style={{ fontSize: 12 }}>{text}</Text>
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      filters: CATEGORIES.map(c => ({ text: c, value: c })),
      onFilter: (value, record) => record.category === value,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '待处理', value: 'pending' },
        { text: '处理中', value: 'processing' },
        { text: '已完成', value: 'resolved' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const config = {
          pending: { color: 'orange', text: '待处理' },
          processing: { color: 'blue', text: '处理中' },
          resolved: { color: 'green', text: '已完成' }
        }
        return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 90,
      sorter: (a, b) => {
        const priorityMap = { high: 3, medium: 2, low: 1 }
        return priorityMap[a.priority] - priorityMap[b.priority]
      },
      render: (priority) => {
        const config = {
          high: { color: 'red', text: '高' },
          medium: { color: 'orange', text: '中' },
          low: { color: 'default', text: '低' }
        }
        return <Tag color={config[priority]?.color}>{config[priority]?.text}</Tag>
      }
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: (text, record) => (
        <Space>
          <Text>{text}</Text>
          {record.status === 'pending' && (
            <Tooltip title="智能分派建议">
              <ThunderboltOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ width: 200, display: 'inline-block' }}>
            {text}
          </Text>
        </Tooltip>
      )
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (text) => new Date(text).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button 
              type="link" 
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleQuickAssign(record)}
            >
              分派
            </Button>
          )}
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1">查看详情</Menu.Item>
                <Menu.Item key="2">修改优先级</Menu.Item>
                <Menu.Item key="3">添加备注</Menu.Item>
              </Menu>
            }
          >
            <Button type="link" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  // 快速分派
  const handleQuickAssign = (record) => {
    Modal.confirm({
      title: '智能分派建议',
      content: (
        <div>
          <p>根据AI分析，建议将此工单分派至：</p>
          <Tag color="blue" style={{ fontSize: 16, padding: '8px 16px' }}>
            {record.department}
          </Tag>
          <p style={{ marginTop: 16, color: '#999' }}>
            <ThunderboltOutlined /> 匹配度：95% | 平均处理时间：24小时
          </p>
        </div>
      ),
      onOk: () => {
        message.success(`工单已分派至 ${record.department}`)
      }
    })
  }

  // 批量操作
  const handleBatchOperation = (operation) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择工单')
      return
    }

    switch (operation) {
      case 'priority':
        Modal.confirm({
          title: '批量修改优先级',
          content: (
            <Select defaultValue="high" style={{ width: '100%' }}>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          ),
          onOk: () => {
            message.success(`已修改 ${selectedRowKeys.length} 条工单的优先级`)
            setSelectedRowKeys([])
          }
        })
        break
      case 'assign':
        Modal.confirm({
          title: '批量分派部门',
          content: (
            <Select defaultValue="环卫局" style={{ width: '100%' }}>
              <Option value="环卫局">环卫局</Option>
              <Option value="市政维护部">市政维护部</Option>
              <Option value="城管局">城管局</Option>
              <Option value="交警大队">交警大队</Option>
            </Select>
          ),
          onOk: () => {
            message.success(`已分派 ${selectedRowKeys.length} 条工单`)
            setSelectedRowKeys([])
          }
        })
        break
      case 'export':
        message.success(`正在导出 ${selectedRowKeys.length} 条工单...`)
        break
      default:
        break
    }
  }

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ]
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '200px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#999' }}>加载数据中...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 页面标题和筛选器 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  <DashboardOutlined /> 智能数据大盘
                </Title>
                <Text type="secondary">实时监控 · 智能预警 · 数据分析</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              {/* 时间范围选择 */}
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
                suffixIcon={<CalendarOutlined />}
              >
                <Option value={1}>今天</Option>
                <Option value={7}>近7天</Option>
                <Option value={30}>近30天</Option>
                <Option value={90}>近90天</Option>
              </Select>

              {/* 区域筛选 */}
              <Select
                value={selectedDistrict}
                onChange={(value) => {
                  setSelectedDistrict(value)
                  loadData()
                }}
                style={{ width: 130 }}
                suffixIcon={<EnvironmentOutlined />}
              >
                <Option value="all">全部区域</Option>
                {DISTRICTS.map(d => (
                  <Option key={d} value={d}>{d}</Option>
                ))}
              </Select>

              {/* 类别筛选 */}
              <Select
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value)
                  loadData()
                }}
                style={{ width: 130 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">全部类别</Option>
                {CATEGORIES.map(c => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>

              <Button icon={<ReloadOutlined />} onClick={loadData}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="总工单数"
              value={statistics?.total_tickets || 0}
              prefix={<DashboardOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="待处理"
              value={Object.values(statistics?.by_status || {}).find((_, i) => i === 0) || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix={
                <Tag color="orange" style={{ marginLeft: 8 }}>紧急</Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="处理中"
              value={Object.values(statistics?.by_status || {}).find((_, i) => i === 1) || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="已完成"
              value={Object.values(statistics?.by_status || {}).find((_, i) => i === 2) || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  <RiseOutlined /> 12%
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 预警信息 */}
      {alerts && alerts.length > 0 && (
        <Alert
          message={
            <Space>
              <FireOutlined />
              <Text strong>实时预警</Text>
              <Badge count={alerts.length} />
            </Space>
          }
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              {alerts.slice(0, 2).map((alert, index) => (
                <div key={index}>
                  <Text strong style={{ color: '#ff4d4f' }}>{alert.title}</Text>
                  <br />
                  <Text type="secondary">{alert.description}</Text>
                </div>
              ))}
            </Space>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={() => setAlertModalVisible(true)}>
              查看全部
            </Button>
          }
          closable
        />
      )}

      {/* 图表区域 - 第一行 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="📈 趋势分析">
            <ReactECharts option={getTrendChartOption()} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="📊 类别统计">
            <ReactECharts option={getCategoryBarChartOption()} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 - 第二行 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card bordered={false} title="🔥 热力分布">
            <ReactECharts option={getHeatmapChartOption()} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card bordered={false} title="🔮 趋势预测">
            <ReactECharts option={getPredictionChartOption()} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      {/* 工单管理 */}
      <Card
        bordered={false}
        title={
          <Space>
            <Text strong style={{ fontSize: 16 }}>工单管理</Text>
            <Badge count={tickets.length} style={{ backgroundColor: '#1890ff' }} />
          </Space>
        }
        extra={
          <Space>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Text type="secondary">已选 {selectedRowKeys.length} 项</Text>
                <Button 
                  size="small" 
                  icon={<ThunderboltOutlined />}
                  onClick={() => handleBatchOperation('priority')}
                >
                  批量优先级
                </Button>
                <Button 
                  size="small" 
                  icon={<SendOutlined />}
                  onClick={() => handleBatchOperation('assign')}
                >
                  批量分派
                </Button>
                <Button 
                  size="small"
                  onClick={() => handleBatchOperation('export')}
                >
                  导出
                </Button>
              </Space>
            )}
          </Space>
        }
      >
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      {/* 实时预警模态框 */}
      <Modal
        title={
          <Space>
            <FireOutlined style={{ color: '#ff4d4f' }} />
            <Text strong>实时预警</Text>
          </Space>
        }
        open={alertModalVisible}
        onCancel={() => setAlertModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAlertModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="view" 
            type="primary" 
            onClick={() => {
              message.info('跳转到工单详情...')
              setAlertModalVisible(false)
            }}
          >
            查看详情
          </Button>
        ]}
        width={600}
      >
        {currentAlert && (
          <div>
            <Alert
              message={currentAlert.title}
              description={currentAlert.description}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="热点区域"
                    value={currentAlert.area}
                    prefix={<EnvironmentOutlined />}
                    valueStyle={{ fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="问题类别"
                    value={currentAlert.category}
                    valueStyle={{ fontSize: 20 }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="工单数量"
                    value={currentAlert.count}
                    valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
                    suffix="件"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="增长幅度"
                    value={currentAlert.increase}
                    valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
                    prefix={<RiseOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <div style={{ marginTop: 16, padding: 16, background: '#fff7e6', borderRadius: 4 }}>
              <Text strong>💡 处理建议：</Text>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>立即联系{currentAlert.area}{currentAlert.category}相关部门</li>
                <li>调度应急响应小组到现场核查</li>
                <li>在2小时内给出初步处理方案</li>
                <li>加强该区域巡查频次</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DashboardPage
