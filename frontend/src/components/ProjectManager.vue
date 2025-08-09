<template>
  <div class="project-manager">
    <!-- 头部区域 -->
    <div class="header">
      <h1>项目管理系统</h1>
      <div class="header-actions">

        <!-- 添加统计按钮 -->
        <el-button 
          class="leader-stat-btn"
          icon="el-icon-s-data"
          @click="goToLeaderStatistics"
        >
          负责人统计
        </el-button>

        <el-button type="primary" icon="el-icon-plus" @click="openDialog(null)">新增项目</el-button>
        <!-- 添加导出按钮 -->
        <el-button 
          type="success" 
          icon="el-icon-download"
          @click="exportProjects"
          :loading="exportLoading"
        >
          导出Excel
        </el-button>
        <el-tooltip content="刷新数据" placement="bottom">
          <el-button icon="el-icon-refresh" circle @click="fetchProjects"></el-button>
        </el-tooltip>
        
      </div>
    </div>


    

    
    
    <!-- 统计卡片 -->
    <div class="dashboard">
      <el-card class="stats-card">
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalProjects }}</div>
            <div class="stat-label">项目总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.activeProjects }}</div>
            <div class="stat-label">进行中</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.completedProjects }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.dueSoon }}</div>
            <div class="stat-label">即将到期</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.avgProgressTime }}</div>
            <div class="stat-label">平均进度时间</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 搜索控制 -->
    <!-- <div class="controls">
      <div class="search-controls">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索项目名称、负责人或编号"
          clearable
          @clear="fetchProjects"
          @keyup.enter="fetchProjects"
          style="width: 300px;"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
        
        <el-select v-model="progressFilter" placeholder="按进度筛选" clearable>
          <el-option label="申请中" :value="1"></el-option>
          <el-option label="调研中" :value="2"></el-option>
          <el-option label="采购中" :value="3"></el-option>
          <el-option label="执行中" :value="4"></el-option>
          <el-option label="已完成" :value="5"></el-option>
        </el-select>
        
        <el-button type="primary" @click="fetchProjects">搜索</el-button>
      </div>
    </div> -->



    <div class="controls">
      <div class="search-controls">
        <el-input
          v-model="searchParams.keyword"
          placeholder="搜索项目名称、负责人或编号"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
          style="width: 300px;"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
        
        <el-select 
          v-model="searchParams.progress" 
          placeholder="按进度筛选" 
          clearable
          @change="handleSearch"
        >
          <el-option label="申请中" :value="1"></el-option>
          <el-option label="调研中" :value="2"></el-option>
          <el-option label="采购中" :value="3"></el-option>
          <el-option label="执行中" :value="4"></el-option>
          <el-option label="已完成" :value="5"></el-option>
        </el-select>
        
        <el-button 
          type="primary" 
          icon="el-icon-search"
          @click="handleSearch"
          :loading="searchLoading"
        >
          搜索
        </el-button>
      </div>
    </div>


    
    <!-- 固定宽度的表格容器 -->
    <div class="fixed-table-container">
      <el-table 
        :data="projects" 
        border 
        style="width: 100%" 
        v-loading="loading"
        highlight-current-row
        :default-sort = "{prop: 'estimated_completion', order: 'ascending'}"
        height="calc(100vh - 380px)"
      >
        <el-table-column 
          label="序号" 
          width="70" 
          align="center"
          fixed="left"
        >
          <template slot-scope="scope">
            {{ calculateIndex(scope.$index) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="project_code" label="编号" width="120" fixed="left"></el-table-column>
        <el-table-column prop="project_name" label="项目名称" width="200" fixed="left">
          <template slot-scope="scope">
            <div class="project-name-cell">
              <span>{{ scope.row.project_name }}</span>
              <el-tag 
                v-if="isDueSoon(scope.row.estimated_completion)" 
                type="warning" 
                size="mini"
                style="margin-left: 5px;"
              >
                即将到期
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="project_category" label="项目类别" width="120"></el-table-column>
        <el-table-column prop="project_leader" label="负责人" width="120"></el-table-column>
        <el-table-column prop="budget" label="预算(万元)" width="120" align="right">
          <template slot-scope="scope">
            {{ scope.row.budget ? scope.row.budget.toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="is_gov_procurement" label="政府采购" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.is_gov_procurement ? 'success' : 'info'" size="small">
              {{ scope.row.is_gov_procurement ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template slot-scope="scope">
            <el-progress 
              :percentage="progressPercentage(scope.row.progress)" 
              :status="progressStatus(scope.row.progress)"
              :show-text="false"
            ></el-progress>
            <el-tag :type="progressTagType(scope.row.progress)" size="small">
              {{ progressText(scope.row.progress) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="apply_department" label="申请部门" width="150"></el-table-column>
        <el-table-column prop="research_date" label="调研时间" width="120" sortable>
          <template slot-scope="scope">
            {{ formatDate(scope.row.research_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="research_method" label="调研方式" width="120"></el-table-column>
        <el-table-column prop="procurement_request_date" label="采购请示时间" width="140" sortable>
          <template slot-scope="scope">
            {{ formatDate(scope.row.procurement_request_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="procurement_submit_date" label="交采购部时间" width="140" sortable>
          <template slot-scope="scope">
            {{ formatDate(scope.row.procurement_submit_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="contract_sign_date" label="合同签订时间" width="140" sortable>
          <template slot-scope="scope">
            {{ formatDate(scope.row.contract_sign_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="email_sent" label="邮件发送" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.email_sent ? 'success' : 'info'" size="small">
              {{ scope.row.email_sent ? '已发送' : '未发送' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="estimated_completion" label="预计完成时间" width="140" sortable>
          <template slot-scope="scope">
            <div :class="{'due-soon': isDueSoon(scope.row.estimated_completion)}">
              {{ formatDate(scope.row.estimated_completion) }}
              <i v-if="isDueSoon(scope.row.estimated_completion)" class="el-icon-warning" style="color: #e6a23c; margin-left: 5px"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
      <template slot-scope="scope">
        <el-button size="mini" type="primary" icon="el-icon-edit" @click="openDialog(scope.row)"></el-button>
        <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteProject(scope.row.id, scope.$index)"></el-button>
        <el-button 
          v-if="isDueSoon(scope.row.estimated_completion)" 
          size="mini" 
          type="warning" 
          icon="el-icon-message"
          :loading="scope.row.sending"
          @click="sendReminder(scope.row)"
        ></el-button>
      </template>
    </el-table-column>
      </el-table>
    </div>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    
    <div class="footer">
      项目管理系统 © {{ new Date().getFullYear() }} - 基于 Vue.js + Element UI 构建
    </div>

    <!-- 项目编辑对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="dialogVisible" 
      width="800px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form 
        :model="form" 
        label-width="150px" 
        ref="projectForm"
        :rules="rules"
        label-position="left"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="申请部门" prop="apply_department" required>
                  <el-input v-model="form.apply_department"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="项目类别" prop="project_category">
                  <el-input v-model="form.project_category"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="项目名称" prop="project_name" required>
                  <el-input v-model="form.project_name"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="项目编号" prop="project_code" required>
                  <el-input v-model="form.project_code"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="负责人" prop="project_leader" required>
                  <el-input v-model="form.project_leader"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="负责人邮箱" prop="leader_email" required>
                  <el-input v-model="form.leader_email"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="预算金额(万元)" prop="budget">
                  <el-input-number 
                    v-model="form.budget" 
                    :min="0" 
                    :precision="2"
                    style="width: 100%"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否政府采购" prop="is_gov_procurement">
                  <el-switch 
                    v-model="form.is_gov_procurement" 
                    :active-value="1" 
                    :inactive-value="0"
                    active-text="是"
                    inactive-text="否"
                  ></el-switch>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="备注" prop="remarks">
              <el-input type="textarea" v-model="form.remarks" rows="3"></el-input>
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="时间安排" name="schedule">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="调研时间" prop="research_date">
                  <el-date-picker 
                    v-model="form.research_date" 
                    type="date" 
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="调研方式" prop="research_method">
                  <el-input v-model="form.research_method"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="采购请示时间" prop="procurement_request_date">
                  <el-date-picker 
                    v-model="form.procurement_request_date" 
                    type="date" 
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="交采购部时间" prop="procurement_submit_date">
                  <el-date-picker 
                    v-model="form.procurement_submit_date" 
                    type="date" 
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="合同签订时间" prop="contract_sign_date">
                  <el-date-picker 
                    v-model="form.contract_sign_date" 
                    type="date" 
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="进度" prop="progress">
                  <el-select v-model="form.progress" placeholder="请选择进度" style="width: 100%">
                    <el-option label="申请中" :value="1"></el-option>
                    <el-option label="调研中" :value="2"></el-option>
                    <el-option label="采购中" :value="3"></el-option>
                    <el-option label="执行中" :value="4"></el-option>
                    <el-option label="已完成" :value="5"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="预计完成时间" prop="estimated_completion" required>
                  <el-date-picker 
                    v-model="form.estimated_completion" 
                    type="date" 
                    placeholder="选择日期"
                    :picker-options="dueDateOptions"
                    value-format="yyyy-MM-dd"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮件发送状态" prop="email_sent">
                  <el-tag :type="form.email_sent ? 'success' : 'info'">
                    {{ form.email_sent ? '已发送' : '未发送' }}
                  </el-tag>
                </el-form-item>
              </el-col>
            </el-row>



            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="进度开始时间">
                  <el-date-picker 
                    v-model="form.progress_start_time" 
                    type="datetime" 
                    placeholder="选择日期时间"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    style="width: 100%"
                    disabled
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="进度完成时间">
                  <el-date-picker 
                    v-model="form.progress_complete_time" 
                    type="datetime" 
                    placeholder="选择日期时间"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    style="width: 100%"
                    disabled
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>



          </el-tab-pane>



          <el-tab-pane label="进度历史" name="history" v-if="form.id">
            <el-form-item label="进度历史记录">
              <el-table :data="progressHistory" border style="width: 100%">
                <el-table-column label="进度" width="120">
                  <template slot-scope="scope">
                    <el-tag :type="progressTagType(scope.row.progress)">
                      {{ progressText(scope.row.progress) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="start_time" label="开始时间" width="180"></el-table-column>
                <el-table-column prop="complete_time" label="完成时间" width="180"></el-table-column>
                <el-table-column label="持续时间" width="120">
                  <template slot-scope="scope">
                    {{ calculateDuration(scope.row.start_time, scope.row.complete_time) }}
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-tab-pane>


          
        </el-tabs>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveProject">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  sendProjectReminder,
  exportProjects
} from '../api';
import moment from 'moment';

export default {
  name: 'ProjectManager',
  data() {
    return {
      searchParams: {
        keyword: '',
        progress: null
      },
      searchLoading: false,
      exportLoading: false,
      projects: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      dialogVisible: false,
      dialogTitle: '新增项目',
      activeTab: 'basic',
      progressHistory: [], // 进度历史记录
      stats: {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        dueSoon: 0,
        avgProgressTime: '-'
      },
      form: {
        id: '',
        apply_department: '',
        project_category: '',
        project_name: '',
        project_code: '',
        project_leader: '',
        leader_email: '',
        budget: null,
        is_gov_procurement: 0,
        research_date: null,
        research_method: '',
        procurement_request_date: null,
        procurement_submit_date: null,
        contract_sign_date: null,
        progress: 1,
        estimated_completion: null,
        remarks: '',
        email_sent: 0,
        progress_start_time: null,
        progress_complete_time: null,
        progress_history: '[]'
      },
      dueDateOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      rules: {
        apply_department: [
          { required: true, message: '请填写申请部门', trigger: 'blur' }
        ],
        project_name: [
          { required: true, message: '请填写项目名称', trigger: 'blur' }
        ],
        project_code: [
          { required: true, message: '请填写项目编号', trigger: 'blur' }
        ],
        project_leader: [
          { required: true, message: '请填写负责人', trigger: 'blur' }
        ],
        leader_email: [
          { required: true, message: '请填写负责人邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        estimated_completion: [
          { required: true, message: '请选择预计完成时间', trigger: 'change' }
        ]
      }
    };
  },
  methods: {
    goToLeaderStatistics() {
  // 如果已经在统计页面，则不进行跳转
  if (this.$route.path === '/leader-statistics') {
    return;
  }
  
  // 执行跳转并捕获可能的重复导航错误
  this.$router.push('/leader-statistics').catch(error => {
    if (error.name !== 'NavigationDuplicated') {
      console.error('导航错误:', error);
    }
  });
},
    // 添加 resetForm 方法
  resetForm() {
    this.form = {
      id: '',
      apply_department: '',
      project_category: '',
      project_name: '',
      project_code: '',
      project_leader: '',
      leader_email: '',
      budget: null,
      is_gov_procurement: 0,
      research_date: null,
      research_method: '',
      procurement_request_date: null,
      procurement_submit_date: null,
      contract_sign_date: null,
      progress: 1,
      estimated_completion: null,
      remarks: '',
      email_sent: 0,
      progress_start_time: null,
      progress_complete_time: null,
      progress_history: '[]'
    };
    this.progressHistory = [];
    
    if (this.$refs.projectForm) {
      this.$refs.projectForm.resetFields();
    }
  },
    handleSearch() {
      this.currentPage = 1;
      this.fetchProjects();
    },
    
    async fetchProjects() {
      this.loading = true;
      this.searchLoading = true;
      
      try {
        const response = await getProjects(
          this.currentPage, 
          this.pageSize,
          this.searchParams.keyword,
          this.searchParams.progress
        );
        
        this.projects = response.data.projects;
        this.total = response.data.total;
        this.calculateStats();
        
        if (this.hasSearchParams) {
          let message = '搜索完成';
          if (this.searchParams.keyword) {
            message += `，关键词: "${this.searchParams.keyword}"`;
          }
          if (this.searchParams.progress !== null) {
            const progressText = this.progressText(this.searchParams.progress);
            message += `，进度: "${progressText}"`;
          }
          message += `，找到 ${this.projects.length} 条记录`;
          
          this.$message.success(message);
        }
      } catch (error) {
        let errorMessage = '获取项目数据失败';
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        this.$message.error(errorMessage);
      } finally {
        this.loading = false;
        this.searchLoading = false;
      }
    },
    
    calculateStats() {
      this.stats = {
        totalProjects: this.total,
        activeProjects: this.projects.filter(p => p.progress >= 2 && p.progress <= 4).length,
        completedProjects: this.projects.filter(p => p.progress === 5).length,
        dueSoon: this.projects.filter(p => this.isDueSoon(p.estimated_completion)).length,
        avgProgressTime: this.calculateAverageProgressTime()
      };
    },
    
    calculateAverageProgressTime() {
  if (this.projects.length === 0) return '-';
  
  let totalDuration = 0;
  let count = 0;
  
  this.projects.forEach(project => {
    let history = [];
    
    // 处理不同类型的 progress_history
    if (typeof project.progress_history === 'string') {
      try {
        history = JSON.parse(project.progress_history) || [];
      } catch (e) {
        console.error('解析进度历史失败', e);
        return;
      }
    } else if (Array.isArray(project.progress_history)) {
      history = project.progress_history;
    } else {
      console.warn('未知的进度历史格式', typeof project.progress_history, project.progress_history);
      return;
    }
    
    history.forEach(item => {
      if (item.start_time && item.complete_time) {
        const start = new Date(item.start_time);
        const end = new Date(item.complete_time);
        
        // 确保日期有效
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn('无效的日期', item);
          return;
        }
        
        totalDuration += end - start;
        count++;
      }
    });
  });
  
  if (count === 0) return '-';
  
  const avgMs = totalDuration / count;
  const avgDays = (avgMs / (1000 * 60 * 60 * 24)).toFixed(1);
  return `${avgDays}天`;
},
    
    calculateIndex(index) {
      return (this.currentPage - 1) * this.pageSize + index + 1;
    },
    
    handleSizeChange(size) {
      this.pageSize = size;
      this.fetchProjects();
    },
    
    handleCurrentChange(page) {
      this.currentPage = page;
      this.fetchProjects();
    },
    
    openDialog(project) {
      if (project) {
      this.form = { 
        ...project,
        research_date: project.research_date ? moment(project.research_date).toDate() : null,
        procurement_request_date: project.procurement_request_date ? moment(project.procurement_request_date).toDate() : null,
        procurement_submit_date: project.procurement_submit_date ? moment(project.procurement_submit_date).toDate() : null,
        contract_sign_date: project.contract_sign_date ? moment(project.contract_sign_date).toDate() : null,
        estimated_completion: project.estimated_completion ? moment(project.estimated_completion).toDate() : null,
        progress_start_time: project.progress_start_time ? moment(project.progress_start_time).toDate() : null,
        progress_complete_time: project.progress_complete_time ? moment(project.progress_complete_time).toDate() : null
      };
      
      // 修复进度历史记录解析
      let rawHistory = project.progress_history;
      let parsedHistory = [];
      
      if (typeof rawHistory === 'string') {
        try {
          parsedHistory = JSON.parse(rawHistory) || [];
        } catch (e) {
          console.error('解析进度历史失败', e);
          parsedHistory = [];
        }
      } else if (Array.isArray(rawHistory)) {
        parsedHistory = rawHistory;
      } else {
        console.warn('未知的进度历史格式', typeof rawHistory, rawHistory);
        parsedHistory = [];
      }
      
      // 格式化历史记录中的时间
      this.progressHistory = parsedHistory.map(item => ({
        ...item,
        start_time: item.start_time ? this.formatDateTime(item.start_time) : '',
        complete_time: item.complete_time ? this.formatDateTime(item.complete_time) : ''
      }));
      
      this.dialogTitle = '编辑项目';
    } else {
      this.resetForm();
      this.dialogTitle = '新增项目';
    }
    this.dialogVisible = true;
    this.activeTab = 'basic';
    },
    
    async saveProject() {
      try {
    const valid = await this.$refs.projectForm.validate();
    if (!valid) return;
    
    // 准备发送的数据
    const payload = {
      ...this.form,
      id: this.form.id || undefined,
      research_date: this.formatDate(this.form.research_date),
      procurement_request_date: this.formatDate(this.form.procurement_request_date),
      procurement_submit_date: this.formatDate(this.form.procurement_submit_date),
      contract_sign_date: this.formatDate(this.form.contract_sign_date),
      estimated_completion: this.formatDate(this.form.estimated_completion),
      progress_start_time: this.formatDateTime(this.form.progress_start_time),
      progress_complete_time: this.formatDateTime(this.form.progress_complete_time)
    };

    // 记录调试信息
    console.log('Saving project:', payload);

    if (this.form.id) {
      await updateProject(this.form.id, payload);
      this.$message.success('项目更新成功');
    } else {
      await createProject(payload);
      this.$message.success('项目创建成功');
    }
    
    this.dialogVisible = false;
    this.fetchProjects();
  } catch (error) {
    console.error('保存失败:', error);
    
    // 显示更详细的错误信息
    let errorMessage = '保存失败';
    if (error.response) {
      try {
            // 尝试解析JSON错误响应
            const errorData = error.response.data;
            if (errorData.error) {
              errorMessage += `: ${errorData.error}`;
            } else if (typeof errorData === 'string') {
              errorMessage += `: ${errorData}`;
            } else {
              errorMessage += `: ${JSON.stringify(errorData)}`;
            }
          } catch (e) {
            errorMessage += `: 无法解析错误响应`;
          }
    } else {
      errorMessage += `: ${error.message}`;
    }
    
    this.$message.error(errorMessage);
  }
    },
    
    deleteProject(id, index) {
      this.$confirm('确定删除该项目吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteProject(id);
          this.$message.success('删除成功');
          this.fetchProjects();
          
          if (this.projects.length === 1 && this.currentPage > 1) {
            this.currentPage -= 1;
            this.fetchProjects();
          }
        } catch (error) {
          this.$message.error('删除失败');
        }
      }).catch(() => {});
    },
    
    async  sendReminder(project) {
      this.$set(project, 'sending', true);
      
      try {
        const response = await sendProjectReminder(project.id);
        
        if (response.data.success) {
          this.$message.success(`提醒邮件已发送给 ${project.project_leader} (${project.leader_email})`);
          project.email_sent = 1;
        } else {
          this.$message.error('邮件发送失败');
        }
      } catch (error) {
        console.error('发送邮件时出错:', error);
        this.$message.error('邮件发送失败: ' + (error.response?.data?.error || error.message));
      } finally {
        this.$set(project, 'sending', false);
      }
    },
    
    formatDate(date) {
  if (!date) return null;
  return moment(date).format('YYYY-MM-DD');
},
    
    progressTagType(progress) {
      const types = {
        1: 'info',
        2: 'warning',
        3: 'primary',
        4: '',
        5: 'success'
      };
      return types[progress] || '';
    },
    
    progressText(progress) {
      const texts = {
        1: '申请中',
        2: '调研中',
        3: '采购中',
        4: '执行中',
        5: '已完成'
      };
      return texts[progress] || '';
    },
    
    progressPercentage(progress) {
      return progress * 20;
    },
    
    progressStatus(progress) {
      const statusMap = {
    1: 'exception', // 申请中 - 异常状态
    2: 'exception', // 调研中 - 异常状态
    3: null,        // 采购中 - 正常状态
    4: null,        // 执行中 - 正常状态
    5: 'success'    // 已完成 - 成功状态
  };
  
  return statusMap[progress] || null;
    },
    
    isDueSoon(dateStr) {
      if (!dateStr) return false;
      const dueDate = moment(dateStr);
      const today = moment();
      const diffDays = dueDate.diff(today, 'days');
      return diffDays <= 3 && diffDays >= 0;
    },
    
    // 日期时间格式化函数
formatDateTime(date) {
  if (!date) return null;
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
},
    
    calculateDuration(start, end) {
      if (!start || !end) return '-';
      const startMoment = moment(start);
      const endMoment = moment(end);
      const duration = moment.duration(endMoment.diff(startMoment));
      return `${duration.days()}天${duration.hours()}小时`;
    },
    
    async exportProjects() {
      this.exportLoading = true;
      try {
        const response = await exportProjects(
          this.searchParams.keyword,
          this.searchParams.progress
        );
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        let fileName = '项目列表.xlsx';
        const contentDisposition = response.headers['content-disposition'];
        
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename\*=utf-8''(.+)/i) ||
                               contentDisposition.match(/filename="(.+)"/i);
          
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = decodeURIComponent(fileNameMatch[1]);
          }
        }
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.$message.success('导出成功');
        
      } catch (error) {
        console.error('导出失败:', error);
        let errorMessage = '导出失败';
        
        if (error.response) {
          if (error.response.data instanceof Blob) {
            try {
              const errorText = await new Response(error.response.data).text();
              try {
                const errorData = JSON.parse(errorText);
                errorMessage += `: ${errorData.error || '服务器错误'}`;
                if (errorData.message) {
                  errorMessage += ` (${errorData.message})`;
                }
              } catch (e) {
                errorMessage += `: ${errorText}`;
              }
            } catch (e) {
              errorMessage += ': 无法解析错误详情';
            }
          } else {
            errorMessage += `: ${error.response.status} ${error.response.statusText}`;
          }
        } else {
          errorMessage += `: ${error.message}`;
        }
        
        this.$message.error(errorMessage);
      } finally {
        this.exportLoading = false;
      }
    }
  },
  computed: {
    hasSearchParams() {
      return this.searchParams.keyword || this.searchParams.progress !== null;
    }
  },
  mounted() {
    this.fetchProjects();
  }
};
</script>

<style scoped>
.project-manager {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #409EFF, #3375b9);
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header::after {
  content: "";
  position: absolute;
  bottom: -80px;
  left: -80px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header h1 {
  color: white;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.header-actions {
  display: flex;
  gap: 15px;
  z-index: 2;
}

.header-actions .el-button {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 2;
}

.header-actions .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
}

.dashboard {
  padding: 20px 30px 0;
  background: white;
}

.controls {
  padding: 0 30px 20px;
  background: white;
}

.search-controls {
  display: flex;
  gap: 15px;
  background: #f5f7fa;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  align-items: center;
  flex-wrap: wrap;
}

.search-controls > * {
  margin-bottom: 0;
}

.fixed-table-container {
  padding: 0 30px;
  background: white;
}

.footer {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
  background: white;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  margin-top: 15px;
}

/* 添加导出按钮样式 */
.header-actions .el-button--success {
  background-color: #67c23a;
  border-color: #67c23a;
  color: #fff;
}
.header-actions .el-button--success:hover {
  background-color: #5daf34;
  border-color: #5daf34;
}
.header-actions .leader-stat-btn {
  background: linear-gradient(135deg, #9c27b0, #673ab7);
  border-color: #7b1fa2;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.header-actions .leader-stat-btn:hover {
  background: linear-gradient(135deg, #8e24aa, #5e35b1);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
}

.header-actions .leader-stat-btn:active {
  background: linear-gradient(135deg, #7b1fa2, #512da8);
}

/* 确保图标颜色为白色 */
.header-actions .leader-stat-btn [class*="el-icon-"] {
  color: white;
}
</style>