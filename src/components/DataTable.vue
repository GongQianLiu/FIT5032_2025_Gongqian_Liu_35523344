<template>
  <div class="data-table-container">
    <!-- 筛选区域 -->
    <div class="table-controls mb-3">
      <div class="row align-items-center">
        <div class="col-md-12">
          <div class="filter-section">
            <h6 class="filter-title mb-3">
              <i class="bi bi-funnel me-2"></i>
              Advanced Filters
            </h6>
            <div class="row g-3">
              <div v-for="filter in filterColumns" :key="filter.key" class="col-md-3">
                <label :for="`filter-${filter.key}`" class="form-label">{{ filter.label }}</label>
                <select
                  :id="`filter-${filter.key}`"
                  class="form-select"
                  v-model="filters[filter.key]"
                  @change="handleFilterChange"
                >
                  <option value="">All {{ filter.label }}</option>
                  <option
                    v-for="option in getFilterOptions(filter.key)"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-3 d-flex align-items-end gap-2">
                <button
                  class="btn btn-outline-secondary"
                  @click="clearAllFilters"
                  :disabled="!hasActiveFilters"
                >
                  <i class="bi bi-x-circle me-1"></i>
                  Clear Filters
                </button>
                <button
                  class="btn btn-outline-primary"
                  @click="exportToCSV"
                  :disabled="filteredData.length === 0"
                  title="Export current data to CSV"
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

    <!-- 表格 -->
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              @click="handleSort(column.key)"
              :class="{ 'sortable': column.sortable !== false }"
              style="cursor: pointer;"
            >
              {{ column.label }}
              <i 
                v-if="column.sortable !== false"
                class="bi ms-1"
                :class="getSortIcon(column.key)"
              ></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedData" :key="item.id">
            <td v-for="column in columns" :key="column.key">
              <template v-if="column.formatter">
                <TaskFormatters
                  :value="item[column.key]"
                  :row="item"
                  :formatterType="column.formatter"
                  @accept-task="$emit('accept-task', $event)"
                  @complete-task="$emit('complete-task', $event)"
                  @edit-task="$emit('edit-task', $event)"
                  @delete-task="$emit('delete-task', $event)"
                  @confirm-task="$emit('confirm-task', $event)"
                  @show-complaint-modal="$emit('show-complaint-modal', $event)"
                  @show-rating-modal="$emit('show-rating-modal', $event)"
                  @edit-user="$emit('edit-user', $event)"
                  @view-user="$emit('view-user', $event)"
                  @toggle-user-status="$emit('toggle-user-status', $event)"
                  @delete-user="$emit('delete-user', $event)"
                />
              </template>
              <template v-else>
                {{ item[column.key] }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-controls d-flex justify-content-between align-items-center">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }} - {{ endIndex }} of {{ filteredData.length }} records
      </div>
      <nav>
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          <li 
            v-for="page in visiblePages" 
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="goToPage(page)">
              {{ page }}
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import TaskFormatters from './formatters/TaskFormatters.vue';

export default {
  name: 'DataTable',
  components: {
    TaskFormatters
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    filterColumns: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'accept-task',
    'complete-task',
    'edit-task',
    'delete-task',
    'confirm-task',
    'show-complaint-modal',
    'show-rating-modal',
    'edit-user',
    'view-user',
    'toggle-user-status',
    'delete-user'
  ],
  setup(props) {
    const filters = ref({});
    const currentPage = ref(1);
    const itemsPerPage = ref(10); // 固定为10行
    const sortColumn = ref('');
    const sortDirection = ref('asc');

    // 过滤数据
    const filteredData = computed(() => {
      let filtered = [...props.data];

      // 应用多个筛选器
      Object.keys(filters.value).forEach(filterKey => {
        const filterValue = filters.value[filterKey];
        if (filterValue && filterValue !== '') {
          filtered = filtered.filter(item => {
            const itemValue = item[filterKey];
            if (itemValue === null || itemValue === undefined) {
              return false;
            }
            return itemValue.toString().toLowerCase() === filterValue.toLowerCase();
          });
        }
      });

      // 排序
      if (sortColumn.value) {
        filtered.sort((a, b) => {
          let aVal = a[sortColumn.value];
          let bVal = b[sortColumn.value];

          // 处理null/undefined值
          if (aVal === null || aVal === undefined) aVal = '';
          if (bVal === null || bVal === undefined) bVal = '';

          // 处理日期类型
          if (aVal instanceof Date && bVal instanceof Date) {
            aVal = aVal.getTime();
            bVal = bVal.getTime();
          }

          // 处理字符串类型
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
          }

          if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return filtered;
    });

    // 分页数据
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredData.value.slice(start, end);
    });

    // 分页信息
    const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value));
    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
    const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredData.value.length));

    // 可见页码
    const visiblePages = computed(() => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages.value, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    });

    // 检查是否有活动的筛选器
    const hasActiveFilters = computed(() => {
      return Object.values(filters.value).some(value => value && value !== '');
    });

    // 获取筛选器选项
    const getFilterOptions = (columnKey) => {
      const uniqueValues = [...new Set(props.data.map(item => item[columnKey]))];
      return uniqueValues
        .filter(value => value !== null && value !== undefined && value !== '')
        .map(value => ({
          value: value.toString(),
          label: value.toString()
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    };

    // 处理筛选器变化
    const handleFilterChange = () => {
      currentPage.value = 1;
    };

    // 清除所有筛选器
    const clearAllFilters = () => {
      filters.value = {};
      currentPage.value = 1;
    };

    // 处理排序
    const handleSort = (columnKey) => {
      if (sortColumn.value === columnKey) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn.value = columnKey;
        sortDirection.value = 'asc';
      }
      currentPage.value = 1;
    };

    // 跳转到指定页面
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    // 获取排序图标
    const getSortIcon = (columnKey) => {
      if (sortColumn.value !== columnKey) {
        return 'bi-arrow-down-up';
      }
      return sortDirection.value === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
    };

    // CSV导出功能
    const exportToCSV = () => {
      try {
        if (!filteredData.value || filteredData.value.length === 0) {
          alert('No data to export');
          return;
        }

        // 生成CSV内容
        const csvContent = generateCSVContent();

        // 创建并下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `data_export_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // 显示成功消息
          console.log(`Exported ${filteredData.value.length} rows to CSV`);
        }
      } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Failed to export CSV. Please try again.');
      }
    };

    // 生成CSV内容
    const generateCSVContent = () => {
      const data = filteredData.value;
      const columns = props.columns;

      // 创建标题行
      const headers = columns.map(col => `"${col.label}"`).join(',');

      // 创建数据行
      const rows = data.map(item => {
        return columns.map(col => {
          let value = item[col.key];

          // 处理不同类型的值
          if (value === null || value === undefined) {
            value = '';
          } else if (typeof value === 'object') {
            // 处理对象类型（如日期、嵌套对象等）
            if (value instanceof Date) {
              value = value.toLocaleDateString();
            } else {
              value = JSON.stringify(value);
            }
          } else {
            value = String(value);
          }

          // 转义双引号并包装在双引号中
          return `"${value.replace(/"/g, '""')}"`;
        }).join(',');
      });

      // 组合标题和数据
      return [headers, ...rows].join('\n');
    };

    // 监听数据变化，重置分页
    watch(() => props.data, () => {
      currentPage.value = 1;
    });

    return {
      filters,
      currentPage,
      itemsPerPage,
      sortColumn,
      sortDirection,
      filteredData,
      paginatedData,
      totalPages,
      startIndex,
      endIndex,
      visiblePages,
      hasActiveFilters,
      getFilterOptions,
      handleFilterChange,
      clearAllFilters,
      handleSort,
      goToPage,
      getSortIcon,
      exportToCSV
    };
  }
};
</script>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.table-controls {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
}

.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.filter-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.form-select {
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-select:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.table th.sortable:hover {
  background-color: #e9ecef;
}

.table th.sortable {
  transition: background-color 0.2s ease;
}

.pagination-controls {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination .page-link {
  color: #0d6efd;
  border: 1px solid #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.table-responsive {
  border-radius: 6px;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
}

@media (max-width: 768px) {
  .table-controls .row > div {
    margin-bottom: 1rem;
  }
  
  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
