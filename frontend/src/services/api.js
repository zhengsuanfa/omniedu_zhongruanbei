import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 工单相关API
export const ticketAPI = {
  // 创建工单
  create: (data) => api.post('/tickets/', data),
  
  // 获取工单列表
  list: (params) => api.get('/tickets/', { params }),
  
  // 获取工单详情
  get: (id) => api.get(`/tickets/${id}`),
  
  // 更新工单
  update: (id, data) => api.put(`/tickets/${id}`, data),
  
  // 删除工单
  delete: (id) => api.delete(`/tickets/${id}`),
}

// 分析相关API
export const analysisAPI = {
  // 获取统计数据
  statistics: (params) => api.get('/analysis/statistics', { params }),
  
  // 获取预警信息
  alerts: (params) => api.get('/analysis/alerts', { params }),
  
  // 类别趋势
  categoryTrends: (params) => api.get('/analysis/trends/category', { params }),
  
  // 地域热点
  locationTrends: (params) => api.get('/analysis/trends/location', { params }),
  
  // 情绪分析
  sentimentAnalysis: (params) => api.get('/analysis/sentiment-analysis', { params }),
}

// 千帆AI相关API
export const qianfanAPI = {
  // 意图分析
  analyze: (data) => api.post('/qianfan/analyze', data),
  
  // 生成摘要
  summary: (data) => api.post('/qianfan/summary', data),
  
  // 测试连接
  test: () => api.get('/qianfan/test'),
}

export default api

