CREATE DATABASE project_manager 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
USE project_manager;

CREATE TABLE project_management (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '序号',
  apply_department VARCHAR(50) NOT NULL COMMENT '申请部门',
  apply_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  project_category VARCHAR(20) COMMENT '项目类别',
  project_name VARCHAR(100) NOT NULL COMMENT '项目名称',
  project_code VARCHAR(20) UNIQUE NOT NULL COMMENT '项目编号',
  project_leader VARCHAR(30) NOT NULL COMMENT '负责人',
  leader_email VARCHAR(30) NOT NULL COMMENT '负责人邮箱',
  budget DECIMAL(12, 2) UNSIGNED COMMENT '预算金额(万元)',
  is_gov_procurement TINYINT(1) DEFAULT 0 COMMENT '是否政府采购(0:否,1:是)',
  research_date DATE COMMENT '调研时间',
  research_method VARCHAR(20) COMMENT '调研方式',
  procurement_request_date DATE COMMENT '采购请示时间',
  procurement_submit_date DATE COMMENT '交采购部时间',
  contract_sign_date DATE COMMENT '合同签订时间',
  progress TINYINT DEFAULT 1 COMMENT '1:申请中, 2:调研中, 3:采购中, 4:执行中, 5:已完成',
  estimated_completion DATE NOT NULL COMMENT '预估完成时间',
  remarks TEXT COMMENT '备注',
  email_sent TINYINT(1) DEFAULT 0 COMMENT '邮件发送标记(0:未发送,1:已发送)',
  INDEX idx_leader (project_leader),
  INDEX idx_deadline (estimated_completion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- 测试数据
-- INSERT INTO project_management (
--     apply_department, 
--     apply_time, 
--     project_category, 
--     project_name, 
--     project_code, 
--     project_leader, 
--     budget, 
--     is_gov_procurement, 
--     research_date, 
--     research_method, 
--     procurement_request_date, 
--     procurement_submit_date, 
--     contract_sign_date, 
--     progress, 
--     estimated_completion, 
--     remarks, 
--     email_sent
-- ) 
-- VALUES 
--     ('技术部', '2025-01-10 10:00:00', '软件开发', '企业管理系统', 'PROJ2025001', '张三', 120.50, 1, '2025-01-20', '会议', '2025-02-01', '2025-02-05', '2025-02-10', 1, '2025-06-30', '重要项目，需按时完成', 0),
--     ('市场部', '2025-01-11 11:00:00', '市场推广', '夏季促销活动', 'PROJ2025002', '李四', 80.00, 0, '2025-01-25', '问卷调查', '2025-02-02', '2025-02-06', '2025-02-15', 2, '2025-03-31', '配合产品发布', 1),
--     ('财务部', '2025-01-12 14:30:00', '系统升级', '财务系统升级', 'PROJ2025003', '王五', 65.80, 0, '2025-01-18', '访谈', '2025-01-25', '2025-01-30', '2025-02-05', 3, '2025-02-28', '确保数据迁移安全', 0),
--     ('人力资源部', '2025-01-13 09:15:00', '培训', '员工技能培训', 'PROJ2025004', '赵六', 45.20, 1, '2025-01-22', '线上调研', '2025-02-03', '2025-02-07', '2025-02-14', 4, '2025-03-15', '全员参与', 1),
--     ('行政部', '2025-01-14 13:45:00', '设备采购', '办公设备更新', 'PROJ2025005', '钱七', 200.00, 1, '2025-01-23', '市场考察', '2025-02-04', '2025-02-08', '2025-02-20', 5, '2025-02-25', '旧设备评估处理', 1);