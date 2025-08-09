import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: {'Content-Type': 'application/json'}
});

export default {


  
  getProjects(params) {
    return api.get('/projects', { params });
  },
   // 获取单个项目（新增）
   getProject(id) {
    return api.get(`/projects/${id}`); // → http://localhost:3000/projects/3
  },
  createProject(data) {
    return api.post('/projects', data);
  },
  updateProject(id, data) {
    if (!id || isNaN(id)) {
      return Promise.reject(new Error('无效的项目ID'));
    }
    return api.put(`/projects/${id}`, data);
  },


  updateProject(id, data) {
    return api.put(`/projects/${id}`, {
      ...data,
      research_date: data.research_date || null,
      research_method: data.research_method || '',
      procurement_request_date: data.procurement_request_date || null,
      procurement_submit_date: data.procurement_submit_date || null,
      contract_sign_date: data.contract_sign_date || null,
      apply_department: data.apply_department || ''
    });
  },
  deleteProject(id) {
    return api.delete(`/projects/${id}`);
  }
};