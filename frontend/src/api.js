import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api'
    : 'http://localhost:5000/api',
});

// 添加请求拦截器
api.interceptors.request.use(config => {
  console.log('Request:', config);
  return config;
}, error => {
  return Promise.reject(error);
});

// 添加响应拦截器
api.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
}, error => {
  console.error('API Error:', error);
  return Promise.reject(error);
});

export const getProjects = (page, pageSize, keyword = null, progress = null) => {
  return api.get('/projects', {
    params: { 
      page, 
      pageSize,
      keyword,
      progress
    }
  });
};

export const getProjectById = (id) => {
  return api.get(`/projects/${id}`);
};

export const createProject = (project) => {
  return api.post('/projects', project);
};

export const updateProject = (id, project) => {
  return api.put(`/projects/${id}`, project)
    .then(response => response.data)
    .catch(error => {
      // 处理非JSON响应
      if (error.response && typeof error.response.data === 'string') {
        throw new Error(`服务器错误: ${error.response.data}`);
      }
      
      // 处理JSON格式的错误响应
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      
      // 处理其他错误
      throw new Error(error.message || '更新项目失败');
    });
};

export const deleteProject = (id) => {
  return api.delete(`/projects/${id}`);
};

export const sendProjectReminder = (id) => {
  return api.post(`/projects/${id}/send-reminder`);
};

export const exportProjects = (keyword = null, progress = null) => {
  return api.get('/projects/export', {
    params: {
      keyword,
      progress
    },
    responseType: 'blob'
  });
};

// 添加获取负责人统计数据的方法
export const getLeaderStats = () => {
  return api.get('/leader-stats');
};