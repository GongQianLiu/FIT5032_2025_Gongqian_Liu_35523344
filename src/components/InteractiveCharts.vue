<template>
  <div class="interactive-charts">
    <div class="row">
      <!-- Chart Controls -->
      <div class="col-12 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>
              Interactive Analytics Dashboard
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <label for="chartType" class="form-label">Chart Type</label>
                <select 
                  id="chartType" 
                  class="form-select" 
                  v-model="selectedChartType"
                  @change="updateChart"
                >
                  <option value="tasks">Task Statistics</option>
                  <option value="users">User Distribution</option>
                  <option value="ratings">Rating Analysis</option>
                  <option value="timeline">Timeline Trends</option>
                </select>
              </div>
              <div class="col-md-3">
                <label for="timeRange" class="form-label">Time Range</label>
                <select 
                  id="timeRange" 
                  class="form-select" 
                  v-model="selectedTimeRange"
                  @change="updateChart"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
              <div class="col-md-3">
                <label for="chartStyle" class="form-label">Chart Style</label>
                <select 
                  id="chartStyle" 
                  class="form-select" 
                  v-model="selectedChartStyle"
                  @change="updateChart"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Actions</label>
                <div class="d-flex gap-2">

                  <button
                    class="btn btn-outline-secondary btn-sm me-2"
                    @click="refreshData"
                  >
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="exportCSV"
                    title="Export chart data as CSV"
                  >
                    <i class="bi bi-download me-1"></i>
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Chart -->
      <div class="col-12 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">{{ chartTitle }}</h6>
            <div class="btn-group btn-group-sm">
              <button 
                class="btn btn-outline-primary"
                @click="toggleFullscreen"
              >
                <i class="bi bi-arrows-fullscreen"></i>
              </button>
              <button 
                class="btn btn-outline-secondary"
                @click="toggleLegend"
              >
                <i class="bi bi-list"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container" :class="{ 'fullscreen': isFullscreen, 'loaded': isChartLoaded }">
              <canvas ref="chartCanvas" id="mainChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="col-12">
        <div class="row">
          <div class="col-md-3 mb-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Total Tasks</h6>
                    <h3 class="mb-0">{{ summaryData.totalTasks }}</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-list-task fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Completed</h6>
                    <h3 class="mb-0">{{ summaryData.completedTasks }}</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-check-circle fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-warning text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Active Users</h6>
                    <h3 class="mb-0">{{ summaryData.activeUsers }}</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-people fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-info text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Avg Rating</h6>
                    <h3 class="mb-0">{{ summaryData.averageRating }}</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-star fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useToast } from 'vue-toastification';
import taskService from '../services/taskService.js';
import userService from '../services/userService.js';
import { db } from '../firebase/config';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

export default {
  name: 'InteractiveCharts',
  setup() {
    const toast = useToast();
    
    // Chart state
    const chartCanvas = ref(null);
    const chart = ref(null);
    const isFullscreen = ref(false);
    const showLegend = ref(true);
    
    // Chart configuration
    const selectedChartType = ref('tasks');
    const selectedTimeRange = ref('30d');
    const selectedChartStyle = ref('bar');
    
    // Data state
    const chartData = ref({});
    const tasksData = ref([]);
    const usersData = ref([]);
    const healthServicesData = ref([]);
    const isCreatingChart = ref(false);
    const isChartLoaded = ref(false);
    const chartUpdateTimeout = ref(null);
    const summaryData = ref({
      totalTasks: 0,
      completedTasks: 0,
      activeUsers: 0,
      averageRating: 0
    });

    // Computed properties
    const chartTitle = computed(() => {
      const titles = {
        tasks: 'Task Statistics',
        users: 'User Distribution',
        ratings: 'Rating Analysis',
        timeline: 'Timeline Trends'
      };
      return titles[selectedChartType.value] || 'Analytics';
    });

    // Load Chart.js
    const loadChartJS = () => {
      return new Promise((resolve) => {
        if (typeof Chart !== 'undefined') {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    // Generate chart data from loaded data
    const generateChartData = () => {
      try {
        const tasks = tasksData.value || [];
        const users = usersData.value || [];

        console.log('Generating chart data with:', { tasks: tasks.length, users: users.length });

        // Process task data by type
        const tasksByType = {};
        tasks.forEach(task => {
          const type = task.type || 'other';
          tasksByType[type] = (tasksByType[type] || 0) + 1;
        });

        // Ensure we have some data for the chart
        if (Object.keys(tasksByType).length === 0) {
          tasksByType['No Data'] = 1;
        }

        // Process user data by role
        const usersByRole = {};
        users.forEach(user => {
          const role = user.role || 'unknown';
          usersByRole[role] = (usersByRole[role] || 0) + 1;
        });

        // Ensure we have some data for the chart
        if (Object.keys(usersByRole).length === 0) {
          usersByRole['No Data'] = 1;
        }

        // Process rating data
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        tasks.forEach(task => {
          if (task.rating && task.rating.rating) {
            const rating = Math.floor(task.rating.rating);
            if (rating >= 1 && rating <= 5) {
              ratingDistribution[rating]++;
            }
          }
        });

        const data = {
          tasks: {
            labels: Object.keys(tasksByType),
            datasets: [{
              label: 'Tasks by Type',
              data: Object.values(tasksByType),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
              ]
            }]
          },
          users: {
            labels: Object.keys(usersByRole),
            datasets: [{
              label: 'User Distribution',
              data: Object.values(usersByRole),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56'
              ]
            }]
          },
          ratings: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
              label: 'Rating Distribution',
              data: Object.values(ratingDistribution),
              backgroundColor: [
                '#FF6384',
                '#FF9F40',
                '#FFCE56',
                '#4BC0C0',
                '#36A2EB'
              ]
            }]
          },
          timeline: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Tasks Created',
              data: [tasks.filter(t => new Date(t.createdAt).getMonth() === 0).length,
                     tasks.filter(t => new Date(t.createdAt).getMonth() === 1).length,
                     tasks.filter(t => new Date(t.createdAt).getMonth() === 2).length,
                     tasks.filter(t => new Date(t.createdAt).getMonth() === 3).length,
                     tasks.filter(t => new Date(t.createdAt).getMonth() === 4).length,
                     tasks.filter(t => new Date(t.createdAt).getMonth() === 5).length],
              borderColor: '#36A2EB',
              backgroundColor: 'rgba(54, 162, 235, 0.1)',
              tension: 0.4
            }, {
              label: 'Tasks Completed',
              data: [tasks.filter(t => t.status === 'completed' && new Date(t.createdAt).getMonth() === 0).length,
                     tasks.filter(t => t.status === 'completed' && new Date(t.createdAt).getMonth() === 1).length,
                     tasks.filter(t => t.status === 'completed' && new Date(t.createdAt).getMonth() === 2).length,
                     tasks.filter(t => t.status === 'completed' && new Date(t.createdAt).getMonth() === 3).length,
                     tasks.filter(t => t.status === 'completed' && new Date(t.createdAt).getMonth() === 4).length,
                     tasks.filter(t => t.status === 'completed' && new Date(t.createdAt).getMonth() === 5).length],
              borderColor: '#4BC0C0',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              tension: 0.4
            }]
          }
        };

        return data[selectedChartType.value] || data.tasks;
      } catch (error) {
        console.error('Error generating chart data:', error);
        return null;
      }
    };

    // Load initial data
    const loadInitialData = async () => {
      try {
        console.log('Loading initial data from Firebase...');

        // Load tasks data
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        const tasks = [];
        tasksSnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        tasksData.value = tasks;
        console.log('Loaded tasks:', tasks.length);

        // Load users data
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        usersSnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        usersData.value = users;
        console.log('Loaded users:', users.length);

        // Load health services data
        const servicesSnapshot = await getDocs(collection(db, 'healthServices'));
        const services = [];
        servicesSnapshot.forEach((doc) => {
          services.push({ id: doc.id, ...doc.data() });
        });
        healthServicesData.value = services;
        console.log('Loaded health services:', services.length);

        // If no real data, use mock data
        if (tasks.length === 0 && users.length === 0) {
          console.log('No real data found, using mock data');
          tasksData.value = generateMockTasks();
          usersData.value = generateMockUsers();
          healthServicesData.value = [];
        }

        // Generate chart data and create chart
        updateChart();

        toast.success(`Chart data loaded: ${tasks.length} tasks, ${users.length} users`);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.warning('Using mock data due to loading error');

        // Use mock data as fallback
        tasksData.value = generateMockTasks();
        usersData.value = generateMockUsers();
        healthServicesData.value = [];
        updateChart();
      }
    };

    // Generate mock data for fallback
    const generateMockTasks = () => [
      { id: '1', title: 'Shopping Help', type: 'shopping', status: 'completed', priority: 'high', createdAt: new Date('2024-01-15'), rating: { rating: 5 } },
      { id: '2', title: 'Companionship', type: 'companionship', status: 'open', priority: 'medium', createdAt: new Date('2024-02-10'), rating: { rating: 4 } },
      { id: '3', title: 'Medical Transport', type: 'transportation', status: 'in_progress', priority: 'high', createdAt: new Date('2024-03-05'), rating: { rating: 5 } },
      { id: '4', title: 'House Cleaning', type: 'housework', status: 'completed', priority: 'low', createdAt: new Date('2024-04-20'), rating: { rating: 3 } },
      { id: '5', title: 'Delivery Service', type: 'delivery', status: 'open', priority: 'medium', createdAt: new Date('2024-05-12'), rating: { rating: 4 } },
      { id: '6', title: 'Garden Help', type: 'gardening', status: 'completed', priority: 'medium', createdAt: new Date('2024-06-08'), rating: { rating: 5 } },
      { id: '7', title: 'Tech Support', type: 'technology', status: 'open', priority: 'low', createdAt: new Date('2024-07-15'), rating: { rating: 4 } },
      { id: '8', title: 'Pet Care', type: 'petcare', status: 'completed', priority: 'high', createdAt: new Date('2024-08-01'), rating: { rating: 5 } }
    ];

    const generateMockUsers = () => [
      { id: '1', role: 'elderly', displayName: 'John Doe', createdAt: new Date('2024-01-01') },
      { id: '2', role: 'volunteer', displayName: 'Jane Smith', createdAt: new Date('2024-01-15') },
      { id: '3', role: 'elderly', displayName: 'Bob Johnson', createdAt: new Date('2024-02-01') },
      { id: '4', role: 'volunteer', displayName: 'Alice Brown', createdAt: new Date('2024-02-15') },
      { id: '5', role: 'admin', displayName: 'Admin User', createdAt: new Date('2024-03-01') },
      { id: '6', role: 'elderly', displayName: 'Mary Wilson', createdAt: new Date('2024-03-15') },
      { id: '7', role: 'volunteer', displayName: 'Tom Davis', createdAt: new Date('2024-04-01') },
      { id: '8', role: 'elderly', displayName: 'Sarah Miller', createdAt: new Date('2024-04-15') }
    ];

    // Create chart with proper DOM ready check and state management
    const createChart = () => {
      // Prevent multiple simultaneous chart creation
      if (isCreatingChart.value) {
        console.log('Chart creation already in progress, skipping...');
        return;
      }

      isCreatingChart.value = true;

      // Wait for next tick to ensure DOM is ready
      nextTick(() => {
        try {
          if (!chartCanvas.value) {
            console.warn('Chart canvas not available');
            isCreatingChart.value = false;
            return;
          }

          const ctx = chartCanvas.value.getContext('2d');
          if (!ctx) {
            console.error('Failed to get canvas context');
            isCreatingChart.value = false;
            return;
          }

          // Destroy existing chart safely
          if (chart.value) {
            try {
              chart.value.destroy();
            } catch (e) {
              console.warn('Error destroying existing chart:', e);
            }
            chart.value = null;
          }

          const data = chartData.value;
          if (!data || !data.labels || !data.datasets) {
            console.warn('Chart data not ready');
            isCreatingChart.value = false;
            return;
          }
      
      const config = {
        type: selectedChartStyle.value,
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: showLegend.value,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== undefined) {
                    label += context.parsed.y;
                  }
                  return label;
                }
              }
            }
          },
          scales: selectedChartStyle.value === 'line' || selectedChartStyle.value === 'bar' ? {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          } : {},
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }
      };

          chart.value = new Chart(ctx, config);
          isChartLoaded.value = true;
          console.log('Chart created successfully');
        } catch (error) {
          console.error('Error creating chart:', error);
          toast.error('Failed to create chart');
        } finally {
          isCreatingChart.value = false;
        }
      });
    };

    // Update summary data
    const updateSummaryData = () => {
      try {
        const tasks = tasksData.value || [];
        const users = usersData.value || [];

        summaryData.value = {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          activeUsers: users.length,
          averageRating: tasks.filter(t => t.rating && t.rating.rating).length > 0
            ? (tasks.filter(t => t.rating && t.rating.rating)
                   .reduce((sum, t) => sum + t.rating.rating, 0) /
               tasks.filter(t => t.rating && t.rating.rating).length).toFixed(1)
            : 0
        };
      } catch (error) {
        console.error('Error updating summary data:', error);
        summaryData.value = {
          totalTasks: 0,
          completedTasks: 0,
          activeUsers: 0,
          averageRating: 0
        };
      }
    };

    // Update chart with debouncing
    const updateChart = () => {
      // Clear existing timeout
      if (chartUpdateTimeout.value) {
        clearTimeout(chartUpdateTimeout.value);
      }

      // Debounce chart updates to prevent rapid recreation
      chartUpdateTimeout.value = setTimeout(() => {
        try {
          const data = generateChartData();
          if (data) {
            chartData.value = data;
            createChart();
            updateSummaryData();
          }
        } catch (error) {
          console.error('Error updating chart:', error);
        }
      }, 300); // 300ms debounce
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
      isFullscreen.value = !isFullscreen.value;
    };

    // Toggle legend
    const toggleLegend = () => {
      showLegend.value = !showLegend.value;
      if (chart.value) {
        chart.value.options.plugins.legend.display = showLegend.value;
        chart.value.update();
      }
    };

    // Export chart as image
    const exportChart = () => {
      console.log('Export chart clicked, chart.value:', chart.value);

      if (!chart.value) {
        toast.error('Chart not available for export. Please wait for chart to load.');
        return;
      }

      try {
        const link = document.createElement('a');
        link.download = `${selectedChartType.value}_chart_${new Date().toISOString().split('T')[0]}.png`;
        link.href = chart.value.toBase64Image();
        link.click();

        toast.success('Chart exported as image successfully');
      } catch (error) {
        console.error('Error exporting chart:', error);
        toast.error('Failed to export chart. Please try again.');
      }
    };

    // Export data as CSV
    const exportCSV = () => {
      try {
        // Check if we have data to export
        if (!tasksData.value || tasksData.value.length === 0) {
          toast.error('No data available to export');
          return;
        }

        // Generate CSV content from raw data instead of chart data
        const csvContent = generateCSVFromRawData();

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `analytics_data_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success(`Exported ${tasksData.value.length} records to CSV successfully`);
        }
      } catch (error) {
        console.error('Error exporting CSV:', error);
        toast.error('Failed to export CSV. Please try again.');
      }
    };

    // Generate CSV content from raw data (like DataTable)
    const generateCSVFromRawData = () => {
      const tasks = tasksData.value || [];
      const users = usersData.value || [];

      // Determine what data to export based on current chart type
      let data, columns;

      if (selectedChartType.value === 'users') {
        data = users;
        columns = [
          { key: 'id', label: 'ID' },
          { key: 'displayName', label: 'Name' },
          { key: 'role', label: 'Role' },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created Date' }
        ];
      } else {
        data = tasks;
        columns = [
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title' },
          { key: 'type', label: 'Type' },
          { key: 'status', label: 'Status' },
          { key: 'priority', label: 'Priority' },
          { key: 'createdAt', label: 'Created Date' }
        ];
      }

      // Create header row
      const headers = columns.map(col => `"${col.label}"`).join(',');

      // Create data rows
      const rows = data.map(item => {
        return columns.map(col => {
          let value = item[col.key];

          // Handle different value types
          if (value === null || value === undefined) {
            value = '';
          } else if (typeof value === 'object') {
            if (value instanceof Date) {
              value = value.toLocaleDateString();
            } else if (value.toDate && typeof value.toDate === 'function') {
              // Firestore Timestamp
              value = value.toDate().toLocaleDateString();
            } else {
              value = JSON.stringify(value);
            }
          } else {
            value = String(value);
          }

          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        }).join(',');
      });

      // Combine header and data
      return [headers, ...rows].join('\n');
    };

    // Refresh data
    const refreshData = () => {
      updateChart();
      toast.info('Data refreshed');
    };

    // Watch for changes
    watch([selectedChartType, selectedTimeRange, selectedChartStyle], () => {
      updateChart();
    });

    // Real-time data listeners
    const unsubscribers = ref([]);

    const setupRealtimeListeners = () => {
      try {
        console.log('Setting up real-time listeners...');

        // Listen to tasks collection changes
        const tasksUnsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
          console.log('Tasks collection updated, updating data...');
          const tasks = [];
          snapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
          });
          tasksData.value = tasks;
          // Use debounced update
          updateChart();
        });
        unsubscribers.value.push(tasksUnsubscribe);

        // Listen to users collection changes
        const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
          console.log('Users collection updated, updating data...');
          const users = [];
          snapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
          });
          usersData.value = users;
          // Use debounced update
          updateChart();
        });
        unsubscribers.value.push(usersUnsubscribe);

        // Listen to health services collection changes
        const servicesUnsubscribe = onSnapshot(collection(db, 'healthServices'), (snapshot) => {
          console.log('Health services updated, updating data...');
          const services = [];
          snapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() });
          });
          healthServicesData.value = services;
          // Use debounced update
          updateChart();
        });
        unsubscribers.value.push(servicesUnsubscribe);

        console.log('Real-time listeners setup complete');
      } catch (error) {
        console.warn('Failed to setup real-time listeners:', error);
        toast.warning('Real-time updates unavailable, using manual refresh');
      }
    };

    onMounted(async () => {
      await loadChartJS();
      await loadInitialData();
      setupRealtimeListeners();
    });

    onUnmounted(() => {
      console.log('Cleaning up InteractiveCharts component...');

      // Clear any pending timeouts
      if (chartUpdateTimeout.value) {
        clearTimeout(chartUpdateTimeout.value);
      }

      // Destroy chart
      if (chart.value) {
        try {
          chart.value.destroy();
        } catch (e) {
          console.warn('Error destroying chart on unmount:', e);
        }
        chart.value = null;
      }

      // Clean up listeners
      unsubscribers.value.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          try {
            unsubscribe();
          } catch (e) {
            console.warn('Error unsubscribing listener:', e);
          }
        }
      });

      console.log('InteractiveCharts cleanup complete');
    });

    return {
      chartCanvas,
      selectedChartType,
      selectedTimeRange,
      selectedChartStyle,
      isFullscreen,
      showLegend,
      chartTitle,
      summaryData,
      isChartLoaded,
      updateSummaryData,
      updateChart,
      toggleFullscreen,
      toggleLegend,
      exportCSV,
      refreshData
    };
  }
};
</script>

<style scoped>
.interactive-charts {
  padding: 1rem;
}

.chart-container {
  position: relative;
  height: 400px;
  transition: all 0.3s ease;
}

.chart-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: white;
  padding: 2rem;
}

.chart-container.fullscreen canvas {
  max-height: calc(100vh - 4rem);
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 8px;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0 !important;
}

.btn-group .btn {
  border-radius: 4px;
}

.btn-group .btn:not(:last-child) {
  margin-right: 0.25rem;
}

/* Chart.js custom styles */
:deep(.chartjs-tooltip) {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
}

:deep(.chartjs-legend) {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

:deep(.chartjs-legend-item) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

:deep(.chartjs-legend-item:hover) {
  opacity: 0.7;
}

/* Responsive design */
@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
  
  .btn-group {
    flex-direction: column;
  }
  
  .btn-group .btn {
    margin-bottom: 0.25rem;
  }
}

/* Animation for cards */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* Loading state */
.chart-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 1;
}

.chart-container.loaded::before {
  display: none;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
