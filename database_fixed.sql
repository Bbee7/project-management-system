CREATE DATABASE IF NOT EXISTS project_manager;
USE project_manager;

CREATE TABLE project_management (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '序号',
  apply_department VARCHAR(50) NOT NULL COMMENT '申请部门',
  apply_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  project_category ENUM('研发类','基建类','采购类','服务类') NOT NULL COMMENT '项目类别',
  project_name VARCHAR(100) NOT NULL COMMENT '项目名称',
  project_code VARCHAR(20) UNIQUE NOT NULL COMMENT '项目编号',
  project_leader VARCHAR(30) NOT NULL COMMENT '负责人',
  budget DECIMAL(12, 2) UNSIGNED COMMENT '预算金额(万元)',
  is_gov_procurement TINYINT(1) DEFAULT 0 COMMENT '是否政府采购(0:否,1:是)',
  research_date DATE COMMENT '调研时间',
  research_method ENUM('现场调研','线上会议','问卷','第三方评估') COMMENT '调研方式',
  procurement_request_date DATE COMMENT '采购请示时间',
  procurement_submit_date DATE COMMENT '交采购部时间',
  contract_sign_date DATE COMMENT '合同签订时间',
  progress ENUM('申请中','调研中','采购中','执行中','已完成') DEFAULT '申请中' COMMENT '项目进度',
  estimated_completion DATE NOT NULL COMMENT '预估完成时间',
  remarks TEXT COMMENT '备注',
  email_sent TINYINT(1) DEFAULT 0 COMMENT '邮件发送标记(0:未发送,1:已发送)',
  INDEX idx_leader (project_leader),
  INDEX idx_deadline (estimated_completion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 测试数据
INSERT INTO project_management (
  apply_department, project_category, project_name, project_code, 
  project_leader, budget, is_gov_procurement, estimated_completion
) VALUES 
  ('技术部', '研发类', 'AI客服系统', 'PROJ-2025-001', '张三', 150.50, 0, '2025-08-05'),
  ('财务部', '采购类', '办公设备采购', 'PROJ-2025-002', '李四', 80.00, 1, '2025-09-01');