const nodemailer = require('nodemailer');

// 配置环境变量（测试时直接设置）
process.env.QQ_EMAIL = "2221674709@qq.com";
process.env.QQ_SMTP_PASS = "fnysrklkgygneagc";
process.env.TARGET_EMAIL = "2289254995@qq.com";

// 邮件传输器配置
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.QQ_EMAIL,
    pass: process.env.QQ_SMTP_PASS
  }
});

// 邮件发送函数
async function sendDueAlert(project) {
  const mailOptions = {
    from: `"项目管理系统" <${process.env.QQ_EMAIL}>`,
    to: process.env.TARGET_EMAIL,
    subject: `项目即将到期提醒: ${project.projectId} - ${project.name}`,
    html: `
      <h3>项目即将到期提醒</h3>
      <p>经办人: ${project.assignee}</p>
      <p>项目编号: ${project.projectId}</p>
      <p>项目名称: ${project.name}</p>
      <p>预计完成时间: ${project.dueDate.toLocaleDateString()}</p>
      <p style="color: #d32f2f; font-weight: 600;">
        距离项目完成仅剩3天，请及时跟进项目进度！
      </p>
    `,
    text: `项目即将到期：${project.name}（编号：${project.projectId}）
经办人：${project.assignee}
到期日：${project.dueDate.toLocaleDateString()}
剩余3天！`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`邮件发送成功: ${project.projectId}`);
    return true;
  } catch (error) {
    console.error(`邮件发送失败: ${error.message}`);
    return false;
  }
}

// 测试项目数据
const testProject = {
  projectId: "TEST-001",
  name: "测试项目",
  assignee: "张三",
  dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000) // 3天后到期
};

// 执行测试
(async () => {
  console.log("开始邮件发送测试...");
  const success = await sendDueAlert(testProject);
  console.log(success ? "✅ 测试邮件已发送" : "❌ 发送失败");
})();
