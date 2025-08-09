const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const projectRoutes = require('./routes/project');
const { startScheduler } = require('./utils/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;
const leaderStatsRoutes = require('./routes/leaderStats');

app.use(cors());
app.use(bodyParser.json());

// 确保正确挂载路由
app.use('/api/projects', projectRoutes);
app.use('/api/leader-stats', leaderStatsRoutes);

// 启动定时任务
startScheduler();

// 添加健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});