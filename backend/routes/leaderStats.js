const express = require('express');
const router = express.Router();
const db = require('../config/db');
const moment = require('moment');

// 获取负责人统计数据
router.get('/', async (req, res) => {
  try {
    // 获取所有负责人及其项目
    const [leaders] = await db.query(`
      SELECT 
        project_leader AS name,
        leader_email AS email,
        COUNT(*) AS total_projects,
        SUM(CASE WHEN progress = 5 THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN progress < 5 AND progress >= 2 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN estimated_completion BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY) THEN 1 ELSE 0 END) AS due_soon
      FROM project_management
      GROUP BY project_leader, leader_email
    `);

    // 获取每个负责人的详细项目
    for (const leader of leaders) {
      const [projects] = await db.query(`
        SELECT 
          id, 
          project_name AS name, 
          project_code AS code, 
          progress,
          estimated_completion AS deadline,
          CASE 
            WHEN estimated_completion BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY) THEN 1
            ELSE 0 
          END AS due_soon
        FROM project_management
        WHERE project_leader = ? AND leader_email = ?
      `, [leader.name, leader.email]);
      
      leader.projects = projects.map(p => ({
        ...p,
        dueSoon: p.due_soon === 1,
        status: getStatusText(p.progress)
      }));
    }

    // 获取整体统计数据
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT project_leader) AS total_leaders,
        COUNT(*) AS total_projects,
        SUM(CASE WHEN estimated_completion BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY) THEN 1 ELSE 0 END) AS due_soon_projects
      FROM project_management
    `);

    res.json({
      leaders,
      totalLeaders: stats[0].total_leaders,
      totalProjects: stats[0].total_projects,
      dueSoonProjects: stats[0].due_soon_projects,
      lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss')
    });
    
  } catch (error) {
    console.error('获取负责人统计数据失败:', error);
    res.status(500).json({ 
      error: '获取数据失败',
      details: error.message 
    });
  }
});

// 获取状态文本
function getStatusText(progress) {
  const statusMap = {
    1: '申请中',
    2: '调研中',
    3: '采购中',
    4: '执行中',
    5: '已完成'
  };
  return statusMap[progress] || '未知状态';
}

module.exports = router;