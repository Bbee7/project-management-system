const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project');




// 修复：确保导出路由是GET方法且路径正确
router.get('/export', projectController.exportProjects);
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

// 新增：发送提醒邮件路由
router.post('/:id/send-reminder', projectController.sendReminder);


module.exports = router;