// const nodemailer = require('nodemailer');

// // 创建邮件传输器
// const transporter = nodemailer.createTransport({
//   host: 'smtp.qq.com', // 使用QQ邮箱服务器
//   port: 465,
//   secure: true, // 使用SSL
//   auth: {
//     user: '2289254995@qq.com', // 替换为你的QQ邮箱
//     pass: 'odhzaqhujoyodijc' // 替换为QQ邮箱的授权码
//   }
// });

// // 发送项目到期提醒
// exports.sendReminder = async (project) => {
//   const mailOptions = {
//     from: '"项目管理系统" <2289254995@qq.com>',
//     to: project.leader_email,
//     subject: `【项目到期提醒】${project.project_name}`,
//     html: `
//       <div style="font-family: 'Microsoft YaHei', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
//         <h2 style="color: #1890ff;">项目到期提醒</h2>
//         <p>尊敬的项目负责人 <strong>${project.project_leader}</strong>，您好！</p>
//         <p>您的项目 <strong>"${project.project_name}"</strong> 预计完成时间为 <span style="color: #f5222d; font-weight: bold;">${project.estimated_completion}</span>，即将到期，请及时处理。</p>
        
//         <div style="margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
//           <h3>项目详情</h3>
//           <ul style="list-style: none; padding: 0;">
//             <li><strong>项目编号：</strong> ${project.project_code}</li>
//             <li><strong>项目类别：</strong> ${project.project_category || '无'}</li>
//             <li><strong>申请部门：</strong> ${project.apply_department}</li>
//             <li><strong>当前进度：</strong> ${getProgressText(project.progress)}</li>
//             <li><strong>预算金额：</strong> ${project.budget ? project.budget + '万元' : '无'}</li>
//           </ul>
//         </div>
        
//         <p style="margin-top: 30px;">此邮件由系统自动发送，请勿直接回复。</p>
//         <p>项目管理系统</p>
//       </div>
//     `
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`提醒邮件已发送给 ${project.leader_email}`);
//     return true;
//   } catch (error) {
//     console.error('邮件发送失败:', error);
//     return false;
//   }
// };

// // 获取进度文本
// function getProgressText(progress) {
//   const progressMap = {
//     1: '申请中',
//     2: '调研中',
//     3: '采购中',
//     4: '执行中',
//     5: '已完成'
//   };
//   return progressMap[progress] || '未知状态';
// }





// const nodemailer = require('nodemailer');
// const config = require('../config/config');

// // 创建邮件传输器
// const transporter = nodemailer.createTransport({
//   host: config.email.host,
//   port: config.email.port,
//   secure: config.email.secure,
//   auth: {
//     user: config.email.user,
//     pass: config.email.pass
//   }
// });

// // 发送项目到期提醒
// exports.sendReminder = async (project) => {
//   const mailOptions = {
//     from: `"项目管理系统" <${config.email.user}>`,
//     to: project.leader_email,
//     subject: `【项目到期提醒】${project.project_name}`,
//     html: `
//       <div style="font-family: 'Microsoft YaHei', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
//         <h2 style="color: #1890ff;">项目到期提醒</h2>
//         <p>尊敬的项目负责人 <strong>${project.project_leader}</strong>，您好！</p>
//         <p>您的项目 <strong>"${project.project_name}"</strong> 预计完成时间为 <span style="color: #f5222d; font-weight: bold;">${project.estimated_completion}</span>，即将到期，请及时处理。</p>
        
//         <div style="margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
//           <h3>项目详情</h3>
//           <ul style="list-style: none; padding: 0;">
//             <li><strong>项目编号：</strong> ${project.project_code}</li>
//             <li><strong>项目类别：</strong> ${project.project_category || '无'}</li>
//             <li><strong>申请部门：</strong> ${project.apply_department}</li>
//             <li><strong>当前进度：</strong> ${getProgressText(project.progress)}</li>
//             <li><strong>预算金额：</strong> ${project.budget ? project.budget + '万元' : '无'}</li>
//           </ul>
//         </div>
        
//         <p style="margin-top: 30px;">此邮件由项目管理系统自动发送，请勿直接回复。</p>
//         <p>项目管理系统</p>
//       </div>
//     `
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`[${new Date().toISOString()}] 提醒邮件已发送给 ${project.leader_email}`);
//     return true;
//   } catch (error) {
//     console.error('邮件发送失败:', error);
//     return false;
//   }
// };

// // 获取进度文本
// function getProgressText(progress) {
//   const progressMap = {
//     1: '申请中',
//     2: '调研中',
//     3: '采购中',
//     4: '执行中',
//     5: '已完成'
//   };
//   return progressMap[progress] || '未知状态';
// }





const nodemailer = require('nodemailer');
const config = require('../config/config');

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

// 发送项目到期提醒
exports.sendReminder = async (project) => {
  const mailOptions = {
    from: `"项目管理系统" <${config.email.user}>`,
    to: project.leader_email,
    subject: `【项目到期提醒】${project.project_name}`,
    html: `
      <div style="font-family: 'Microsoft YaHei', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #1890ff;">项目到期提醒</h2>
        <p>尊敬的项目负责人 <strong>${project.project_leader}</strong>，您好！</p>
        <p>您的项目 <strong>"${project.project_name}"</strong> 预计完成时间为 <span style="color: #f5222d; font-weight: bold;">${project.estimated_completion}</span>，即将到期，请及时处理。</p>
        
        <div style="margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h3>项目详情</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>项目编号：</strong> ${project.project_code}</li>
            <li><strong>项目类别：</strong> ${project.project_category || '无'}</li>
            <li><strong>申请部门：</strong> ${project.apply_department}</li>
            <li><strong>当前进度：</strong> ${getProgressText(project.progress)}</li>
            <li><strong>当前进度开始时间：</strong> ${formatDateTime(project.progress_start_time)}</li>
            <li><strong>预算金额：</strong> ${project.budget ? project.budget + '万元' : '无'}</li>
          </ul>
        </div>
        
        <p style="margin-top: 30px;">此邮件由项目管理系统自动发送，请勿直接回复。</p>
        <p>项目管理系统</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] 提醒邮件已发送给 ${project.leader_email}`);
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
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

// 格式化日期时间
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
}