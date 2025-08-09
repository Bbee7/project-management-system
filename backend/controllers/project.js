const Project = require('../models/project');
const emailService = require('../services/email');
const ExcelJS = require('exceljs');
const moment = require('moment');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const keyword = req.query.keyword || null;
    const progress = req.query.progress ? parseInt(req.query.progress) : null;
    
    console.log(`[${new Date().toISOString()}] 查询项目: 
      页码=${page}, 
      页大小=${pageSize}, 
      关键词=${keyword}, 
      进度=${progress}`);
    
    const { projects, total } = await Project.getAll({ 
      page, 
      pageSize,
      keyword,
      progress
    });
    
    console.log(`查询结果: 找到 ${projects.length} 个项目`);
    
    res.json({ projects, total });
  } catch (err) {
    console.error('获取项目列表时出错:', err);
    res.status(500).json({ 
      error: err.message,
      details: err.stack 
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const project = await Project.getById(req.params.id);
    if (!project) return res.status(404).json({ error: '项目未找到' });
    res.json(project);
  } catch (err) {
    console.error('获取项目详情时出错:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('创建项目请求:', req.body);
    
    // 验证必填字段
    const requiredFields = [
      'apply_department', 'project_name', 'project_code', 
      'project_leader', 'leader_email', 'estimated_completion'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `缺少必填字段: ${missingFields.join(', ')}` 
      });
    }
    
    const id = await Project.create(req.body);
    console.log('项目创建成功，ID:', id);
    res.status(201).json({ id });
  } catch (err) {
    console.error('创建项目时出错:', err);
    res.status(500).json({ 
      error: err.message,
      details: err.stack 
    });
  }
};

exports.update = async (req, res) => {
  try {
    await Project.update(req.params.id, req.body);
    res.json({ message: '项目更新成功' });
  } catch (err) {
    console.error('更新项目时出错:', err);
    // 确保返回JSON格式的错误响应
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.delete = async (req, res) => {
  try {
    await Project.delete(req.params.id);
    res.json({ message: '项目删除成功' });
  } catch (err) {
    console.error('删除项目时出错:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.sendReminder = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.getById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: '项目未找到' });
    }
    
    // 发送邮件
    const success = await emailService.sendReminder(project);
    
    if (success) {
      // 标记邮件已发送
      await Project.markEmailSent(projectId);
      
      res.json({ 
        success: true,
        message: '邮件发送成功'
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: '邮件发送失败'
      });
    }
  } catch (err) {
    console.error('发送提醒邮件时出错:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.exportProjects = async (req, res) => {
  try {
    const keyword = req.query.keyword || null;
    const progress = req.query.progress ? parseInt(req.query.progress) : null;
    
    console.log(`[${new Date().toISOString()}] 导出请求: 关键词=${keyword}, 进度=${progress}`);
    
    // 使用模型方法获取所有数据（pageSize=0表示获取所有）
    const { projects } = await Project.getAll({ 
      keyword,
      progress,
      page: 1,
      pageSize: 0
    });
    
    console.log(`找到 ${projects.length} 个项目`);
    
    // 创建Excel工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('项目列表');
    
    // 设置表头
    worksheet.columns = [
      { header: '序号', key: 'id', width: 10 },
      { header: '申请部门', key: 'apply_department', width: 15 },
      { header: '项目类别', key: 'project_category', width: 15 },
      { header: '项目名称', key: 'project_name', width: 30 },
      { header: '项目编号', key: 'project_code', width: 15 },
      { header: '负责人', key: 'project_leader', width: 15 },
      { header: '负责人邮箱', key: 'leader_email', width: 30 },
      { header: '预算(万元)', key: 'budget', width: 12 },
      { header: '政府采购', key: 'is_gov_procurement', width: 10 },
      { header: '调研时间', key: 'research_date', width: 12 },
      { header: '调研方式', key: 'research_method', width: 12 },
      { header: '采购请示时间', key: 'procurement_request_date', width: 15 },
      { header: '交采购部时间', key: 'procurement_submit_date', width: 15 },
      { header: '合同签订时间', key: 'contract_sign_date', width: 15 },
      { header: '进度', key: 'progress', width: 10 },
      { header: '进度开始时间', key: 'progress_start_time', width: 20 },
      { header: '进度完成时间', key: 'progress_complete_time', width: 20 },
      { header: '预计完成时间', key: 'estimated_completion', width: 15 },
      { header: '备注', key: 'remarks', width: 30 },
      { header: '进度历史', key: 'progress_history', width: 50 }
    ];
    
    // 获取进度文本
    function getProgressText(progress) {
      const progressMap = {
        1: '申请中',
        2: '调研中',
        3: '采购中',
        4: '执行中',
        5: '已完成'
      };
      return progressMap[progress] || '未知状态';
    }
    
    // 格式化日期时间
    function formatDateTime(dateStr) {
      if (!dateStr) return '';
      return moment(dateStr).format('YYYY-MM-DD HH:mm:ss');
    }
    
    // 添加数据行
    if (projects.length > 0) {
      projects.forEach(project => {
        // 格式化进度历史
        let historyText = '';
        let history = [];
        try {

          // 检查并解析进度历史
          if (typeof project.progress_history === 'string') {
            try {
              history = JSON.parse(project.progress_history) || [];
            } catch (e) {
              history = [];
            }
          } else if (Array.isArray(project.progress_history)) {
            history = project.progress_history;
          }

          const history = JSON.parse(project.progress_history || '[]');
          historyText = history.map(item => {
            const start = item.start_time ? moment(item.start_time).format('YYYY-MM-DD HH:mm') : '';
            const end = item.complete_time ? moment(item.complete_time).format('YYYY-MM-DD HH:mm') : '';
            return `${getProgressText(item.progress)}: ${start} ${end ? `至 ${end}` : ''}`;
          }).join('\n');
        } catch (e) {
          historyText = '解析进度历史失败';
        }
        
        worksheet.addRow({
          ...project,
          is_gov_procurement: project.is_gov_procurement ? '是' : '否',
          progress: getProgressText(project.progress),
          progress_start_time: formatDateTime(project.progress_start_time),
          progress_complete_time: formatDateTime(project.progress_complete_time),
          progress_history: historyText
        });
      });
    } else {
      // 添加空数据提示
      const row = worksheet.addRow(['没有找到项目数据']);
      row.font = { color: { argb: 'FFFF0000' }, italic: true };
      worksheet.mergeCells(`A${row.number}:T${row.number}`);
      const cell = worksheet.getCell(`A${row.number}`);
      cell.alignment = { horizontal: 'center' };
    }
    
    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    
    // 生成文件名
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `项目列表_${dateStr}.xlsx`;
    
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(fileName)}`
    );
    
    // 将Excel文件发送给客户端
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (err) {
    console.error('导出项目数据时出错:', err);
    
    // 返回更详细的错误信息
    res.status(500).json({ 
      error: '导出失败',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
};

// 获取进度文本
function getProgressText(progress) {
  const progressMap = {
    1: '申请中',
    2: '调研中',
    3: '采购中',
    4: '执行中',
    5: '已完成'
  };
  return progressMap[progress] || '未知状态';
}