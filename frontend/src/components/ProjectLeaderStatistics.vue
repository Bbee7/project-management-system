<template>
    <div class="leader-statistics">
      <div class="header">
        <h1><i class="el-icon-s-data"></i> 项目负责人进度统计</h1>
        <div class="header-actions">
          <el-button type="primary" @click="goBack">
            <i class="el-icon-back"></i> 返回项目管理
          </el-button>
          <el-button type="success" @click="refreshData" :loading="refreshing">
            <i class="el-icon-refresh"></i> 刷新数据
          </el-button>
        </div>
      </div>
  
      <div class="filters">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索负责人姓名"
          clearable
          prefix-icon="el-icon-search"
          style="width: 300px;"
        ></el-input>
        
        <el-select 
          v-model="statusFilter" 
          placeholder="按项目状态筛选" 
          clearable
          style="margin-left: 15px;"
        >
          <el-option label="所有状态" value="all"></el-option>
          <el-option label="申请中" :value="1"></el-option>
          <el-option label="调研中" :value="2"></el-option>
          <el-option label="采购中" :value="3"></el-option>
          <el-option label="执行中" :value="4"></el-option>
          <el-option label="已完成" :value="5"></el-option>
        </el-select>
      </div>
  
      <div class="dashboard" v-loading="loading">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <i class="el-icon-user-solid stat-icon leader"></i>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.totalLeaders || 0 }}</div>
                  <div class="stat-label">负责人数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <i class="el-icon-s-management stat-icon project"></i>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.totalProjects || 0 }}</div>
                  <div class="stat-label">项目总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <i class="el-icon-alarm-clock stat-icon due"></i>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.dueSoonProjects || 0 }}</div>
                  <div class="stat-label">即将到期项目</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
  
        <el-row :gutter="20" class="charts-row" v-if="leaders.length > 0">
          <el-col :span="12">
            <el-card class="chart-card">
              <h3><i class="el-icon-pie-chart"></i> 负责人项目分布</h3>
              <div ref="leaderChart" style="height: 400px;"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card">
              <h3><i class="el-icon-data-line"></i> 项目状态分布</h3>
              <div ref="statusChart" style="height: 400px;"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
  
      <div class="leader-list" v-if="filteredLeaders.length > 0">
        <el-collapse v-model="activeLeaders" accordion>
          <el-collapse-item 
            v-for="leader in filteredLeaders" 
            :key="leader.name" 
            :name="leader.name"
          >
            <template slot="title">
              <div class="leader-header">
                <div class="leader-info">
                  <el-avatar :src="getAvatar(leader.name)" size="medium"></el-avatar>
                  <div class="leader-name">{{ leader.name }}</div>
                  <el-tag type="info">邮箱: {{ leader.email }}</el-tag>
                </div>
                <div class="leader-stats">
                  <el-tag type="info">项目: {{ leader.total_projects }}</el-tag>
                  <el-tag type="warning">进行中: {{ leader.active }}</el-tag>
                  <el-tag type="success">已完成: {{ leader.completed }}</el-tag>
                  <el-tag type="danger">即将到期: {{ leader.due_soon }}</el-tag>
                </div>
              </div>
            </template>
            
            <div class="project-list">
              <el-table :data="leader.projects" border style="width: 100%">
                <el-table-column prop="name" label="项目名称" width="250">
                  <template slot-scope="scope">
                    <div class="project-name">
                      <span>{{ scope.row.name }}</span>
                      <el-tag 
                        v-if="scope.row.dueSoon" 
                        type="warning" 
                        size="mini"
                      >即将到期</el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="项目编号" width="150"></el-table-column>
                <el-table-column label="进度" width="300">
                  <template slot-scope="scope">
                    <div class="progress-container">
                      <el-progress 
                        :percentage="scope.row.progress * 20" 
                        :status="getProgressStatus(scope.row.progress)"
                        :show-text="false"
                      ></el-progress>
                      <el-tag :type="getProgressTag(scope.row.progress)">
                        {{ scope.row.status }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="deadline" label="截止日期" width="150">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.deadline) }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="120">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.status === '已完成' ? 'success' : 'warning'">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
  
      <div v-else class="empty-state">
        <el-empty description="没有找到负责人数据">
          <el-button type="primary" @click="refreshData">重新加载</el-button>
        </el-empty>
      </div>
  
      <div class="footer">
        <p>项目管理系统 © {{ new Date().getFullYear() }} - 负责人统计报表</p>
        <p>数据更新时间: {{ stats.lastUpdated || '--' }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import * as echarts from 'echarts';
  import { getLeaderStats } from '@/api';
  import moment from 'moment';
  
  export default {
    name: 'ProjectLeaderStatistics',
    data() {
      return {
        leaders: [],
        stats: {},
        searchKeyword: '',
        statusFilter: 'all',
        activeLeaders: [],
        loading: true,
        refreshing: false,
        leaderChart: null,
        statusChart: null
      };
    },
    computed: {
      filteredLeaders() {
        let result = this.leaders;
        
        // 按负责人姓名筛选
        if (this.searchKeyword) {
          const keyword = this.searchKeyword.toLowerCase();
          result = result.filter(leader => 
            leader.name.toLowerCase().includes(keyword) ||
            leader.email.toLowerCase().includes(keyword)
          );
        }
        
        // 按项目状态筛选
        if (this.statusFilter !== 'all') {
          result = result.map(leader => {
            const projects = leader.projects.filter(
              project => project.progress === this.statusFilter
            );
            
            if (projects.length > 0) {
              return {
                ...leader,
                projects,
                active: projects.filter(p => p.progress < 5 && p.progress >= 2).length,
                completed: projects.filter(p => p.progress === 5).length,
                due_soon: projects.filter(p => p.dueSoon).length
              };
            }
            return null;
          }).filter(Boolean);
        }
        
        return result;
      }
    },
    mounted() {
      this.loadData();
      window.addEventListener('resize', this.resizeCharts);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeCharts);
      if (this.leaderChart) this.leaderChart.dispose();
      if (this.statusChart) this.statusChart.dispose();
    },
    methods: {
      async loadData() {
        this.loading = true;
        try {
          const response = await getLeaderStats();
          this.leaders = response.data.leaders || [];
          this.stats = {
            totalLeaders: response.data.totalLeaders,
            totalProjects: response.data.totalProjects,
            dueSoonProjects: response.data.dueSoonProjects,
            lastUpdated: response.data.lastUpdated
          };
          
          this.$nextTick(() => {
            this.initCharts();
          });
        } catch (error) {
          console.error('加载负责人数据失败:', error);
          this.$message.error('加载负责人数据失败: ' + (error.response?.data?.error || error.message));
        } finally {
          this.loading = false;
          this.refreshing = false;
        }
      },
      
      initCharts() {
        // 负责人项目分布图
        const leaderChartDom = this.$refs.leaderChart;
        if (leaderChartDom && this.leaders.length > 0) {
          this.leaderChart = echarts.init(leaderChartDom);
          
          const leaderData = this.leaders.map(leader => {
            return {
              value: leader.total_projects,
              name: leader.name
            };
          });
          
          const option = {
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
              orient: 'vertical',
              right: 10,
              top: 'center',
              data: this.leaders.map(leader => leader.name)
            },
            series: [
              {
                name: '项目分布',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: '#fff',
                  borderWidth: 2
                },
                label: {
                  show: false,
                  position: 'center'
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: '18',
                    fontWeight: 'bold'
                  }
                },
                labelLine: {
                  show: false
                },
                data: leaderData
              }
            ]
          };
          
          this.leaderChart.setOption(option);
        }
        
        // 项目状态分布图
        const statusChartDom = this.$refs.statusChart;
        if (statusChartDom && this.leaders.length > 0) {
          this.statusChart = echarts.init(statusChartDom);
          
          const statusCounts = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
          };
          
          this.leaders.forEach(leader => {
            leader.projects.forEach(project => {
              statusCounts[project.progress]++;
            });
          });
          
          const statusData = [
            { name: '申请中', value: statusCounts[1] },
            { name: '调研中', value: statusCounts[2] },
            { name: '采购中', value: statusCounts[3] },
            { name: '执行中', value: statusCounts[4] },
            { name: '已完成', value: statusCounts[5] }
          ];
          
          const option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: statusData.map(item => item.name)
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                name: '项目数量',
                type: 'bar',
                barWidth: '60%',
                data: statusData,
                itemStyle: {
                  color: function(params) {
                    const colorList = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
                    return colorList[params.dataIndex];
                  }
                }
              }
            ]
          };
          
          this.statusChart.setOption(option);
        }
      },
      
      resizeCharts() {
        if (this.leaderChart) this.leaderChart.resize();
        if (this.statusChart) this.statusChart.resize();
      },
      
      getProgressTag(progress) {
        const types = {
          1: 'info',
          2: 'warning',
          3: 'primary',
          4: '',
          5: 'success'
        };
        return types[progress] || '';
      },
      
      getProgressStatus(progress) {
        if (progress === 5) return 'success';
        if (progress >= 3) return null;
        return 'exception';
      },
      
      getAvatar(name) {
  // 清理名称中的特殊字符，只保留字母数字
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
  
  // 如果名称为空，使用默认值
  const seed = cleanName || 'default';
  
  // 使用新的 DiceBear API 7.x 版本
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
},
      
      formatDate(dateStr) {
        if (!dateStr) return '--';
        return moment(dateStr).format('YYYY-MM-DD');
      },
      
      goBack() {
        this.$router.go(-1);
      },
      
      refreshData() {
        this.refreshing = true;
        this.loadData();
      }
    }
  };
  </script>
  
  <style scoped>
  /* 样式保持不变，与之前提供的相同 */
  .leader-statistics {
    background-color: #f5f7fa;
    min-height: 100vh;
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: linear-gradient(135deg, #409EFF, #3375b9);
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .header h1 {
    color: white;
    font-size: 24px;
    margin: 0;
    display: flex;
    align-items: center;
  }
  
  .header h1 i {
    margin-right: 10px;
    font-size: 28px;
  }
  
  .filters {
    background: white;
    padding: 15px 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .dashboard {
    margin-bottom: 20px;
  }
  
  .stat-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    margin-bottom: 20px;
  }
  
  .stat-content {
    display: flex;
    align-items: center;
  }
  
  .stat-icon {
    font-size: 48px;
    margin-right: 20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .stat-icon.leader {
    background-color: #e6f7ff;
    color: #1890ff;
  }
  
  .stat-icon.project {
    background-color: #f6ffed;
    color: #52c41a;
  }
  
  .stat-icon.due {
    background-color: #fff7e6;
    color: #fa8c16;
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-value {
    font-size: 32px;
    font-weight: bold;
    color: #333;
  }
  
  .stat-label {
    font-size: 16px;
    color: #666;
  }
  
  .charts-row {
    margin-top: 20px;
  }
  
  .chart-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    height: 500px;
  }
  
  .chart-card h3 {
    margin: 0 0 20px 0;
    color: #409EFF;
    display: flex;
    align-items: center;
  }
  
  .chart-card h3 i {
    margin-right: 10px;
  }
  
  .leader-list {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
  }
  
  .leader-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 10px 0;
  }
  
  .leader-info {
    display: flex;
    align-items: center;
  }
  
  .leader-name {
    font-weight: bold;
    margin: 0 15px;
    font-size: 18px;
  }
  
  .leader-stats {
    display: flex;
    gap: 10px;
  }
  
  .project-list {
    margin-top: 15px;
  }
  
  .project-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .progress-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .progress-container .el-progress {
    flex: 1;
  }
  
  .footer {
    text-align: center;
    color: #909399;
    font-size: 14px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .footer p {
    margin: 5px 0;
  }
  
  .empty-state {
    background: white;
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 992px) {
    .charts-row .el-col {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .leader-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .leader-stats {
      margin-top: 10px;
      flex-wrap: wrap;
    }
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      text-align: center;
    }
    
    .header h1 {
      margin-bottom: 15px;
    }
    
    .filters {
      flex-direction: column;
    }
    
    .filters .el-input {
      width: 100%;
      margin-bottom: 10px;
    }
    
    .filters .el-select {
      width: 100%;
      margin-left: 0;
    }
  }
  </style>