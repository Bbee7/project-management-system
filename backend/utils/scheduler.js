const cron = require('node-cron');
const Project = require('../models/project');
const emailService = require('../services/email');

// 创建并导出 startScheduler 函数
function startScheduler() {
  // 每天20点检查（北京时间）
  cron.schedule('0 22 * * *', async () => {
    try {
      console.log('开始执行定时任务：检查即将到期的项目');
      const projects = await Project.findProjectsDue();
      console.log(`找到 ${projects.length} 个即将到期的项目`);
      
      for (const project of projects) {
        try {
          console.log(`处理项目: ${project.project_name} (ID: ${project.id})`);
          const success = await emailService.sendReminder(project);
          if (success) {
            await Project.markEmailSent(project.id);
            console.log(`已标记项目 ${project.id} 的邮件发送状态`);
          } else {
            console.log(`项目 ${project.id} 邮件发送失败`);
          }
        } catch (error) {
          console.error(`处理项目 ${project.id} 时出错:`, error);
        }
      }
      
      console.log('定时任务执行完成');
    } catch (error) {
      console.error('定时任务执行失败:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Shanghai"
  });
  
  console.log('定时任务已启动，每天20点(北京时间)检查到期项目');
}

module.exports = { startScheduler };