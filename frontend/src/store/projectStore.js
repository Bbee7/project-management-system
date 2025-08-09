import { defineStore } from 'pinia';
import projectAPI from '@/api/project';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    loading: false
  }),
  actions: {
    async fetchProjects(params = {}) {
      this.loading = true;
      try {
        const res = await projectAPI.getProjects(params);
        this.projects = res.data.projects;
        return { 
          total: res.data.total,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        };
      } catch (err) {
        console.error('获取项目失败:', err);
        return { total: 0 };
      } finally {
        this.loading = false;
      } 
    },
    async getProject(id) {
      this.loading = true;
      try {
        const response = await projectAPI.getProject(id);
        this.currentProject = response.data;
        return response; // 返回完整响应对象
      } catch (error) {
        console.error('获取项目详情失败', error);
        throw error; // 抛出错误供组件捕获
      } finally {
        this.loading = false;
      }
    },
    async addProject(project) {
      try {
        const res = await projectAPI.createProject(project);
        // 添加新项目时刷新列表
        await this.fetchProjects();
        this.projects.push(res.data);
        return true;
      } catch (err) {
        console.error('创建项目失败:', err);
        return false;
      }
    },
    async updateProject(id, project) {
      try { 
        const response = await projectAPI.updateProject(id, {
          ...project,
          // 确保所有新字段包含在内
          research_date: project.research_date,
          research_method: project.research_method,
          procurement_request_date: project.procurement_request_date,
          procurement_submit_date: project.procurement_submit_date,
          contract_sign_date: project.contract_sign_date,
          apply_department: project.apply_department
        });
        
        // 更新本地store
        this.projects = this.projects.map(p => 
          p.id === id ? {...p, ...response.data} : p
        );
        
        return true;
      } catch (err) {
        console.error('更新失败', err);
        return false;
      }
    },
    
    // 格式化项目数据
    formatProject(project) {
      return {
        ...project,
        // 确保前端显示正确的政府采购状态
        is_gov_procurement: project.is_gov_procurement === 1 ? '是' : '否'
      };
    },

    async deleteProject(id) {
      try {
        await projectAPI.deleteProject(id);
        this.projects = this.projects.filter(p => p.id !== id);
        return true;
      } catch (err) {
        console.error('删除项目失败:', err);
        return false;
      }
    }
  }
});