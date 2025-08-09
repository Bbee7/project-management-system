const db = require('../config/db');
const moment = require('moment');

// 日期时间格式化函数
function formatDateTimeForDB(dateStr) {
  if (!dateStr) return null;
  
  try {
    if (dateStr instanceof Date) {
      return moment(dateStr).format('YYYY-MM-DD HH:mm:ss');
    }
    
    if (typeof dateStr === 'string') {
      if (dateStr.endsWith('Z')) {
        return moment.utc(dateStr).format('YYYY-MM-DD HH:mm:ss');
      }
      return moment(dateStr).format('YYYY-MM-DD HH:mm:ss');
    }
    
    return moment(dateStr).format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    console.error('日期时间格式化错误:', error);
    return null;
  }
}

// 日期格式化函数
function formatDateForDB(dateStr) {
  if (!dateStr) return null;
  
  try {
    if (dateStr instanceof Date) {
      return moment(dateStr).format('YYYY-MM-DD');
    }
    
    if (typeof dateStr === 'string') {
      if (dateStr.endsWith('Z')) {
        return moment.utc(dateStr).format('YYYY-MM-DD');
      }
      return moment(dateStr).format('YYYY-MM-DD');
    }
    
    return moment(dateStr).format('YYYY-MM-DD');
  } catch (error) {
    console.error('日期格式化错误:', error);
    return null;
  }
}

class Project {
  static async getAll({ page = 1, pageSize = 10, keyword = null, progress = null } = {}) {
    let conditions = [];
    let params = [];
    
    if (keyword) {
      conditions.push(`(
        project_name LIKE ? OR 
        project_code LIKE ? OR 
        project_leader LIKE ? OR 
        apply_department LIKE ?
      )`);
      const keywordParam = `%${keyword}%`;
      params.push(keywordParam, keywordParam, keywordParam, keywordParam);
    }
    
    if (progress !== null) {
      conditions.push('progress = ?');
      params.push(progress);
    }
    
    let whereClause = '';
    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }
    
    let query = `SELECT * FROM project_management ${whereClause} ORDER BY id DESC`;
    let countQuery = `SELECT COUNT(*) AS total FROM project_management ${whereClause}`;
    
    try {
      let projectsQuery = query;
      
      if (pageSize > 0) {
        const offset = (page - 1) * pageSize;
        projectsQuery += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);
      }
      
      const [projects] = await db.query(projectsQuery, params);
      
      const [totalResult] = await db.query(countQuery, params.slice(0, params.length - (pageSize > 0 ? 2 : 0)));
      const total = totalResult[0].total;
      
      return { projects, total };
    } catch (err) {
      console.error('查询项目时出错:', err);
      throw err;
    }
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM project_management WHERE id = ?', [id]);
    
    if (rows[0]) {
      const project = rows[0];
      
      // 确保 progress_history 是数组
      try {
        if (typeof project.progress_history === 'string') {
          project.progress_history = JSON.parse(project.progress_history) || [];
        }
      } catch (e) {
        console.error('解析进度历史失败', e);
        project.progress_history = [];
      }
      
      return project;
    }
    
    return null;
  }

  static async create(project) {
    const {
      apply_department, project_category, project_name, project_code, 
      project_leader, leader_email, budget, is_gov_procurement, research_date, 
      research_method, procurement_request_date, procurement_submit_date, 
      contract_sign_date, progress, estimated_completion, remarks
    } = project;
    
    // 初始化进度历史记录
    const progressHistory = JSON.stringify([
      {
        progress: progress || 1,
        start_time: new Date().toISOString()
      }
    ]);
    
    const result = await db.query(
      `INSERT INTO project_management (
        apply_department, project_category, project_name, project_code, 
        project_leader, leader_email, budget, is_gov_procurement, research_date, 
        research_method, procurement_request_date, procurement_submit_date, 
        contract_sign_date, progress, estimated_completion, remarks,
        progress_start_time, progress_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        apply_department, 
        project_category, 
        project_name, 
        project_code, 
        project_leader, 
        leader_email, 
        budget, 
        is_gov_procurement, 
        formatDateForDB(research_date), 
        research_method, 
        formatDateForDB(procurement_request_date), 
        formatDateForDB(procurement_submit_date), 
        formatDateForDB(contract_sign_date), 
        progress, 
        formatDateForDB(estimated_completion), 
        remarks || '',
        formatDateTimeForDB(new Date()),
        progressHistory
      ]
    );
    return result[0].insertId;
  }

  static async update(id, project) {
    const {
      apply_department, project_category, project_name, project_code, 
      project_leader, leader_email, budget, is_gov_procurement, research_date, 
      research_method, procurement_request_date, procurement_submit_date, 
      contract_sign_date, progress, estimated_completion, remarks
    } = project;
    
    // 获取当前项目状态
    const currentProject = await Project.getById(id);
    
    // 检查进度是否改变
    let progressHistory;
    
    // 修复：检查 progress_history 是否已经是对象
    if (typeof currentProject.progress_history === 'string') {
      try {
        progressHistory = JSON.parse(currentProject.progress_history || '[]');
      } catch (e) {
        console.error('解析进度历史失败', e);
        progressHistory = [];
      }
    } else if (Array.isArray(currentProject.progress_history)) {
      // 如果已经是数组，直接使用
      progressHistory = currentProject.progress_history;
    } else {
      console.warn('未知的进度历史格式', typeof currentProject.progress_history, currentProject.progress_history);
      progressHistory = [];
    }
    
    let progressStartTime = currentProject.progress_start_time;
    let progressCompleteTime = currentProject.progress_complete_time;
    
    if (progress !== undefined && progress !== currentProject.progress) {
      // 更新上一个进度的完成时间
      if (progressHistory.length > 0) {
        progressHistory[progressHistory.length - 1].complete_time = new Date().toISOString();
      }
      
      // 添加新进度记录
      progressHistory.push({
        progress: progress,
        start_time: new Date().toISOString()
      });
      
      // 设置新的进度开始时间
      progressStartTime = formatDateTimeForDB(new Date());
      progressCompleteTime = null;
    }
    
    // 确保保存前转换为JSON字符串
    const progressHistoryStr = JSON.stringify(progressHistory);
    
    await db.query(
      `UPDATE project_management SET 
        apply_department = ?, project_category = ?, project_name = ?, 
        project_code = ?, project_leader = ?, leader_email = ?, budget = ?, 
        is_gov_procurement = ?, research_date = ?, research_method = ?, 
        procurement_request_date = ?, procurement_submit_date = ?, 
        contract_sign_date = ?, progress = ?, estimated_completion = ?, 
        remarks = ?, 
        progress_start_time = ?, 
        progress_complete_time = ?,
        progress_history = ? 
      WHERE id = ?`,
      [
        apply_department, 
        project_category, 
        project_name, 
        project_code, 
        project_leader, 
        leader_email, 
        budget, 
        is_gov_procurement, 
        formatDateForDB(research_date), 
        research_method, 
        formatDateForDB(procurement_request_date), 
        formatDateForDB(procurement_submit_date), 
        formatDateForDB(contract_sign_date), 
        progress, 
        formatDateForDB(estimated_completion), 
        remarks || '', 
        progressStartTime,
        progressCompleteTime,
        progressHistoryStr,
        id
      ]
    );
  }

  static async delete(id) {
    await db.query('DELETE FROM project_management WHERE id = ?', [id]);
  }

  static async findProjectsDue() {
    const [rows] = await db.query(
      `SELECT * FROM project_management 
       WHERE estimated_completion BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
       AND email_sent = 0`
    );
    return rows;
  }

  static async markEmailSent(id) {
    await db.query('UPDATE project_management SET email_sent = 1 WHERE id = ?', [id]);
  }
}

module.exports = Project;