<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/elderly-dashboard" class="navbar-brand">
          <i class="bi bi-heart-fill"></i>
          Evergreen Way - Calendar & Appointments
        </router-link>
        <div class="d-flex me-auto">
          <router-link to="/elderly-home" class="btn btn-outline-light me-2">
            <i class="bi bi-house-fill"></i>
            Home
          </router-link>
        </div>
        <div class="d-flex">
          <router-link to="/elderly-dashboard" class="btn btn-outline-light me-2">
            <i class="bi bi-house"></i>
            Back to Dashboard
          </router-link>
          <button class="btn btn-outline-light" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>
    </nav>

    <div class="main-content">
      <div class="container-fluid">
        <div class="page-header mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1>Calendar & Appointments</h1>
              <p class="text-muted">View and book health services and community activities</p>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Calendar Area -->
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">
                    <i class="bi bi-calendar3"></i>
                    Calendar View
                  </h5>
                  <div class="calendar-controls">
                    <button class="btn btn-sm btn-outline-secondary" @click="previousMonth">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                    <span class="mx-3">{{ currentMonthYear }}</span>
                    <button class="btn btn-sm btn-outline-secondary" @click="nextMonth">
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="calendar">
                  <!-- Weekday Headers -->
                  <div class="calendar-header">
                    <div class="calendar-day-header" v-for="day in weekDays" :key="day">
                      {{ day }}
                    </div>
                  </div>
                  
                  <!-- Calendar Grid -->
                  <div class="calendar-grid">
                    <div 
                      v-for="date in calendarDates" 
                      :key="date.key"
                      class="calendar-day"
                      :class="{
                        'other-month': !date.isCurrentMonth,
                        'today': date.isToday,
                         'selected': isDateSelected(date.date),
                         'has-events': date.events.length > 0,
                         'bookable': isDateInRange(date.date) && userAppointmentCount < 3,
                         'not-bookable': !isDateInRange(date.date) || userAppointmentCount >= 3
                      }"
                      @click="selectDate(date)"
                    >
                      <div class="day-number">{{ date.day }}</div>
                      <div class="day-events">
                        <div 
                          v-for="event in date.events.slice(0, 2)" 
                          :key="event.id"
                          class="event-dot"
                          :class="'event-' + event.type"
                          :title="event.title"
                        ></div>
                        <div v-if="date.events.length > 2" class="more-events">
                          +{{ date.events.length - 2 }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Event List -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-list-check"></i>
                   {{ getSelectedDateTitle() }} ({{ selectedDateEvents.length }})
                </h5>
              </div>
              <div class="card-body">
                <div class="event-list">
                  <div v-if="selectedDateEvents.length === 0" class="no-events">
                    <i class="bi bi-calendar-x"></i>
                     <p>No events on {{ selectedDate.toLocaleDateString() }}</p>
                  </div>
                  <div 
                    v-for="event in selectedDateEvents" 
                    :key="event.id"
                    class="event-item"
                    :class="'event-' + event.type"
                  >
                    <div class="event-time">{{ event.time }}</div>
                    <div class="event-content">
                      <h6>{{ event.title }}</h6>
                      <p class="text-muted">{{ event.description }}</p>
                      <div class="event-meta">
                        <span class="badge" :class="'bg-' + getEventTypeColor(event.type)">
                          {{ getEventTypeName(event.type) }}
                        </span>
                        <small class="text-muted">{{ event.location }}</small>
                         <small v-if="!canCancelAppointment(event)" class="text-danger ms-2">
                           <i class="bi bi-exclamation-triangle"></i>
                           {{ getCancelButtonTooltip(event) }}
                         </small>
                      </div>
                    </div>
                    <div class="event-actions">
                      <button class="btn btn-sm btn-outline-primary" @click="editEvent(event)">
                        <i class="bi bi-pencil"></i>
                      </button>
                       <button 
                         class="btn btn-sm btn-outline-warning" 
                         @click="cancelAppointment(event)"
                         :disabled="!canCancelAppointment(event)"
                         :title="getCancelButtonTooltip(event)"
                       >
                         <i class="bi bi-x-circle"></i>
                         Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Appointments -->
            <div class="card mt-3">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-lightning"></i>
                  Quick Appointments
                   <span class="badge bg-info ms-2">{{ userAppointmentCount }}/3</span>
                </h5>
              </div>
              <div class="card-body">
                 <div v-if="userAppointmentCount >= 3" class="alert alert-warning">
                   <i class="bi bi-exclamation-triangle"></i>
                   You have reached the maximum number of appointments (3). Please cancel an existing appointment to book a new one.
                 </div>
                                   <div v-else-if="!isDateInRange(selectedDate)" class="alert alert-warning">
                    <i class="bi bi-calendar-x"></i>
                    Appointments can only be booked within the next 7 days.
                  </div>
                  <div v-else>
                    <div class="alert alert-info">
                      <i class="bi bi-info-circle"></i>
                      Selected date: {{ selectedDate.toLocaleDateString() }} - Click a service to book an appointment.
                    </div>
                    <div class="quick-appointments">
                  <button 
                    v-for="service in quickServices" 
                    :key="service.id"
                    class="btn btn-outline-primary w-100 mb-2"
                     @click="showTimeSelection(service)"
                     :disabled="userAppointmentCount >= 3 || !isDateInRange(selectedDate)"
                  >
                    <i :class="service.icon"></i>
                    {{ service.name }}
                  </button>
                </div>
                  </div>
              </div>
            </div>

             <!-- Time Selection Modal -->
             <div v-if="showTimeModal" class="modal-overlay" @click="closeTimeModal">
               <div class="modal-content" @click.stop>
                 <div class="modal-header">
                   <h5>Select Time for {{ selectedService?.name }}</h5>
                   <button type="button" class="btn-close" @click="closeTimeModal"></button>
                 </div>
                 <div class="modal-body">
                   <div class="time-slots">
                     <button
                       v-for="timeSlot in availableTimeSlots"
                       :key="timeSlot"
                       class="btn mb-2 me-2 time-slot-btn"
                       :class="{
                         'btn-primary': selectedTime === timeSlot,
                         'btn-outline-secondary': selectedTime !== timeSlot && !isTimeSlotBooked(timeSlot),
                         'btn-outline-danger': isTimeSlotBooked(timeSlot),
                         'btn-outline-warning': getTimeSlotBookingCount(timeSlot) === 2
                       }"
                       @click="selectTime(timeSlot)"
                       :disabled="isTimeSlotBooked(timeSlot)"
                       :title="getTimeSlotTooltip(timeSlot)"
                     >
                       <div class="time-slot-content">
                         <div class="time-text">{{ timeSlot }}</div>
                         <div class="booking-count">
                           {{ getTimeSlotBookingCount(timeSlot) }}/3
                         </div>
                       </div>
                     </button>
                   </div>
                   <div v-if="selectedTime" class="mt-3">
                     <button class="btn btn-success w-100" @click="confirmBooking">
                       Confirm Booking for {{ selectedTime }}
                     </button>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import appointmentService from '../services/appointmentService';

export default {
  name: 'Calendar',
  setup() {
    const router = useRouter();
    const toast = useToast();

    const currentDate = ref(new Date());
    const selectedDate = ref(new Date());
    const events = ref([]);
    const currentUser = ref(null);
    const showTimeModal = ref(false);
    const selectedService = ref(null);
    const selectedTime = ref('');
    const userAppointmentCount = ref(0);

    // 加载用户信息
    const loadUserInfo = () => {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        currentUser.value = JSON.parse(userStr);
      }
    };

    // 加载预约数据
    const loadAppointments = async () => {
      try {
        if (currentUser.value) {
          const appointments = await appointmentService.getAppointmentsByUser(currentUser.value.id);
          events.value = appointments.map(apt => ({
            id: apt.id,
            title: apt.title,
            description: apt.description,
            date: apt.date,
            time: apt.time,
            type: apt.type,
            location: apt.location
          }));
          // 更新用户预约数量
          userAppointmentCount.value = appointments.length;
        }
      } catch (error) {
        console.error('Failed to load appointments:', error);
        // 如果加载失败，使用默认数据
        events.value = [
      {
        id: 1,
        title: 'Health Checkup',
        description: 'Regular health examination',
        date: '2024-02-15',
        time: '09:00',
        type: 'medical',
        location: 'Community Health Center'
      },
      {
        id: 2,
        title: 'Tai Chi Practice',
        description: 'Weekly Tai Chi class',
        date: '2024-02-15',
        time: '14:00',
        type: 'exercise',
        location: 'Community Park'
      },
      {
        id: 3,
        title: 'Nutrition Consultation',
        description: 'Personalized nutrition guidance',
        date: '2024-02-20',
        time: '10:00',
        type: 'nutrition',
        location: 'Nutrition Consultation Center'
      }
        ];
        userAppointmentCount.value = events.value.length;
      }
    };

    const quickServices = ref([
      {
        id: 1,
        name: 'Health Checkup',
        icon: 'bi bi-heart-pulse'
      },
      {
        id: 2,
        name: 'Rehabilitation Therapy',
        icon: 'bi bi-heart'
      },
      {
        id: 3,
        name: 'Nutrition Consultation',
        icon: 'bi bi-apple'
      },
      {
        id: 4,
        name: 'Exercise Guidance',
        icon: 'bi bi-lightning'
      }
    ]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    });

    const calendarDates = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const dates = [];
      const today = new Date();
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dateKey = date.toISOString().split('T')[0];
        const dayEvents = events.value.filter(event => event.date === dateKey);
        
        dates.push({
          key: dateKey,
          date: date,
          day: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          events: dayEvents
        });
      }
      
      return dates;
    });

    const selectedDateEvents = computed(() => {
      const dateKey = selectedDate.value.toISOString().split('T')[0];
      return events.value.filter(event => event.date === dateKey);
    });

    const selectDate = (date) => {
      selectedDate.value = date.date;
    };

    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
    };

    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
    };

    const getEventTypeName = (type) => {
      const names = {
        medical: 'Medical Service',
        exercise: 'Exercise & Fitness',
        nutrition: 'Nutrition Guidance',
        social: 'Social Activity'
      };
      return names[type] || type;
    };

    const getEventTypeColor = (type) => {
      const colors = {
        medical: 'danger',
        exercise: 'success',
        nutrition: 'warning',
        social: 'info'
      };
      return colors[type] || 'secondary';
    };



    const editEvent = (event) => {
      // 简单的编辑功能 - 更新事件标题
      const newTitle = prompt('Enter new title for the event:', event.title);
      if (newTitle && newTitle.trim()) {
        const eventIndex = events.value.findIndex(e => e.id === event.id);
        if (eventIndex !== -1) {
          events.value[eventIndex].title = newTitle.trim();
          toast.success('Event updated successfully');
        }
      }
    };

    const deleteEvent = async (event) => {
      if (confirm(`Are you sure you want to delete event "${event.title}"?`)) {
        try {
          await appointmentService.deleteAppointment(event.id);
        events.value = events.value.filter(e => e.id !== event.id);
          // 更新预约数量
          userAppointmentCount.value--;
        toast.success('Event deleted successfully');
        } catch (error) {
          console.error('Failed to delete event:', error);
          toast.error('Failed to delete event. Please try again.');
        }
      }
    };

    // 检查是否可以取消预约
    const canCancelAppointment = (event) => {
      const appointmentDateTime = new Date(`${event.date}T${event.time}`);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
      
      // 如果预约时间已经过了，不能取消
      if (hoursUntilAppointment < 0) {
        return false;
      }
      
      // 如果距离预约时间小于1小时，不能取消
      if (hoursUntilAppointment < 1) {
        return false;
      }
      
      return true;
    };

    // 获取取消按钮的提示文本
    const getCancelButtonTooltip = (event) => {
      const appointmentDateTime = new Date(`${event.date}T${event.time}`);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
      
      if (hoursUntilAppointment < 0) {
        return 'Appointment has already passed';
      } else if (hoursUntilAppointment < 1) {
        return 'Cannot cancel within 1 hour of appointment';
      } else if (hoursUntilAppointment < 4) {
        return 'Force cancellation required (within 4 hours)';
      } else {
        return 'Cancel appointment';
      }
    };

    // 取消预约
    const cancelAppointment = async (event) => {
      const appointmentDateTime = new Date(`${event.date}T${event.time}`);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
      
      let confirmMessage = '';
      let isForceCancel = false;
      
      if (hoursUntilAppointment < 0) {
        toast.error('Cannot cancel an appointment that has already passed');
        return;
      } else if (hoursUntilAppointment < 1) {
        toast.error('Cannot cancel appointment within 1 hour of start time');
        return;
      } else if (hoursUntilAppointment < 4) {
        // 强制取消
        confirmMessage = `This appointment is within 4 hours of start time. Force cancellation will incur a penalty. Are you sure you want to force cancel "${event.title}"?`;
        isForceCancel = true;
      } else {
        // 正常取消
        confirmMessage = `Are you sure you want to cancel "${event.title}"?`;
        isForceCancel = false;
      }
      
      if (confirm(confirmMessage)) {
        try {
          // 更新预约状态为已取消
          await appointmentService.updateAppointment(event.id, {
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            isForceCancel: isForceCancel
          });
          
          // 从本地事件列表中移除
          events.value = events.value.filter(e => e.id !== event.id);
          
          // 更新预约数量
          userAppointmentCount.value--;
          
          const cancelType = isForceCancel ? 'force cancelled' : 'cancelled';
          toast.success(`Appointment ${cancelType} successfully`);
        } catch (error) {
          console.error('Failed to cancel appointment:', error);
          toast.error('Failed to cancel appointment. Please try again.');
        }
      }
    };

    // 检查日期是否在7天范围内
    const isDateInRange = (date) => {
      const today = new Date();
      const selectedDateObj = new Date(date);
      const diffTime = selectedDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    };

    // 检查日期是否被选中
    const isDateSelected = (date) => {
      return selectedDate.value.toDateString() === new Date(date).toDateString();
    };

    // 获取选中日期的标题
    const getSelectedDateTitle = () => {
      const today = new Date();
      const selectedDateObj = new Date(selectedDate.value);
      
      if (selectedDateObj.toDateString() === today.toDateString()) {
        return "Today's Events";
      } else if (selectedDateObj.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()) {
        return "Tomorrow's Events";
      } else {
        return `Events on ${selectedDate.value.toLocaleDateString()}`;
      }
    };

    // 生成可用时间段 (9:00-18:00)
    const availableTimeSlots = computed(() => {
      const slots = [];
      for (let hour = 9; hour <= 18; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      return slots;
    });

    // 检查时间段是否已满（最多3个预约）
    const isTimeSlotBooked = (timeSlot) => {
      const dateKey = selectedDate.value.toISOString().split('T')[0];
      const bookingsForSlot = events.value.filter(event =>
        event.date === dateKey && event.time === timeSlot
      ).length;
      return bookingsForSlot >= 3;
    };

    // 获取时间段的预约数量
    const getTimeSlotBookingCount = (timeSlot) => {
      const dateKey = selectedDate.value.toISOString().split('T')[0];
      return events.value.filter(event =>
        event.date === dateKey && event.time === timeSlot
      ).length;
    };

    // 获取时间段的提示信息
    const getTimeSlotTooltip = (timeSlot) => {
      const count = getTimeSlotBookingCount(timeSlot);
      if (count >= 3) {
        return 'This time slot is fully booked (3/3)';
      } else if (count === 2) {
        return 'Only 1 spot remaining (2/3)';
      } else if (count === 1) {
        return '2 spots remaining (1/3)';
      } else {
        return 'Available (0/3)';
      }
    };

    // 显示时间选择模态框
    const showTimeSelection = (service) => {
      if (userAppointmentCount.value >= 3) {
        toast.error('You have reached the maximum number of appointments (3)');
        return;
      }
      if (!isDateInRange(selectedDate.value)) {
        toast.error('Appointments can only be booked within the next 7 days');
        return;
      }
      selectedService.value = service;
      selectedTime.value = '';
      showTimeModal.value = true;
    };

    // 关闭时间选择模态框
    const closeTimeModal = () => {
      showTimeModal.value = false;
      selectedService.value = null;
      selectedTime.value = '';
    };

    // 选择时间
    const selectTime = (timeSlot) => {
      selectedTime.value = timeSlot;
    };

    // 确认预约
    const confirmBooking = async () => {
      try {
        if (!currentUser.value) {
          toast.error('Please login first');
          return;
        }

        if (!selectedTime.value) {
          toast.error('Please select a time slot');
          return;
        }

        // 检查时间段是否已满（服务器端验证）
        const dateKey = selectedDate.value.toISOString().split('T')[0];
        const availability = await appointmentService.checkTimeSlotAvailability(dateKey, selectedTime.value);

        if (!availability.available) {
          toast.error(`This time slot is fully booked (${availability.currentBookings}/${availability.maxBookings}). Please select another time.`);
          return;
        }

        // 检查用户预约数量限制
        if (userAppointmentCount.value >= 3) {
          toast.error('You have reached the maximum number of appointments (3). Please cancel an existing appointment first.');
          return;
        }

        // 创建新的预约
        const appointmentData = {
          userId: currentUser.value.id,
          title: selectedService.value.name,
          description: `Appointment for ${selectedService.value.name}`,
          date: selectedDate.value.toISOString().split('T')[0],
          time: selectedTime.value,
          type: selectedService.value.name.toLowerCase().replace(' ', '_'),
          location: 'Community Health Center',
          status: 'confirmed',
          createdAt: new Date().toISOString()
        };

        const newAppointment = await appointmentService.createAppointment(appointmentData);

        // 添加到本地事件列表
        events.value.push({
          id: newAppointment.id,
          title: newAppointment.title,
          description: newAppointment.description,
          date: newAppointment.date,
          time: newAppointment.time,
          type: newAppointment.type,
          location: newAppointment.location,
          status: newAppointment.status
        });

        // 更新预约数量
        userAppointmentCount.value++;

        const remainingSlots = 3 - getTimeSlotBookingCount(selectedTime.value);
        toast.success(`Successfully booked ${selectedService.value.name} for ${selectedDate.value.toLocaleDateString()} at ${selectedTime.value}. ${remainingSlots} slots remaining for this time.`);
        closeTimeModal();
      } catch (error) {
        console.error('Failed to book appointment:', error);
        toast.error('Failed to book appointment. Please try again.');
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      router.push('/login');
    };

    onMounted(() => {
      loadUserInfo();
      loadAppointments();
    });

    return {
      currentDate,
      selectedDate,
      events,
      quickServices,
      weekDays,
      currentMonthYear,
      calendarDates,
      selectedDateEvents,
      selectDate,
      previousMonth,
      nextMonth,
      getEventTypeName,
      getEventTypeColor,
      editEvent,
      deleteEvent,
      canCancelAppointment,
      getCancelButtonTooltip,
      cancelAppointment,
      handleLogout,
      // 新增的变量和函数
      showTimeModal,
      selectedService,
      selectedTime,
      userAppointmentCount,
      availableTimeSlots,
      isDateInRange,
      isDateSelected,
      getSelectedDateTitle,
      isTimeSlotBooked,
      getTimeSlotBookingCount,
      getTimeSlotTooltip,
      showTimeSelection,
      closeTimeModal,
      selectTime,
      confirmBooking
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.navbar {
  background: #2c3e50;
  padding: 0.75rem 0;
  color: white;
  flex-shrink: 0;
}

.navbar-brand {
  color: white;
  font-weight: 600;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: #f8f9fa;
}

.page-header h1 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card {
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1rem;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  padding: 1rem 1.5rem;
}

.calendar {
  width: 100%;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
  border: 1px solid #dee2e6;
}

.calendar-day-header {
  background: #f8f9fa;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #495057;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
  border: 1px solid #dee2e6;
  border-top: none;
}

.calendar-day {
  background: white;
  min-height: 120px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
  margin: 2px;
}

.calendar-day:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.calendar-day.other-month {
  background-color: #f8f9fa;
  color: #6c757d;
  opacity: 0.6;
}

.calendar-day.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

 .calendar-day.selected {
   background-color: #007bff;
   color: white;
   border: 2px solid #0056b3;
 }

 .calendar-day.selected .day-number {
   color: white;
}

.calendar-day.has-events {
  background-color: #fff3cd;
}

 .calendar-day.bookable {
   background-color: #d4edda;
   border: 2px solid #28a745;
   cursor: pointer;
 }

 .calendar-day.bookable:hover {
   background-color: #c3e6cb;
 }

 .calendar-day.not-bookable {
   background-color: #f8d7da;
   border: 2px solid #dc3545;
   opacity: 0.7;
   cursor: not-allowed;
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-medical { background-color: #dc3545; }
.event-exercise { background-color: #198754; }
.event-nutrition { background-color: #fd7e14; }
.event-social { background-color: #0d6efd; }

.more-events {
  font-size: 0.7rem;
  color: #6c757d;
  margin-left: 2px;
}

.event-list {
  max-height: 300px;
  overflow-y: auto;
}

.no-events {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.no-events i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.event-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border-left: 4px solid #007bff;
}

.event-item.event-medical { border-left-color: #dc3545; }
.event-item.event-exercise { border-left-color: #198754; }
.event-item.event-nutrition { border-left-color: #fd7e14; }
.event-item.event-social { border-left-color: #0d6efd; }

.event-time {
  font-weight: 600;
  color: #007bff;
  margin-right: 1rem;
  min-width: 50px;
}

.event-content {
  flex: 1;
}

.event-content h6 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.event-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-actions {
  display: flex;
  gap: 0.25rem;
}

 .event-actions .btn:disabled {
   opacity: 0.5;
   cursor: not-allowed;
 }

 .event-actions .btn-outline-warning:disabled {
   color: #6c757d;
   border-color: #6c757d;
}

.quick-appointments .btn {
  text-align: left;
}

 /* Modal Styles */
 .modal-overlay {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background-color: rgba(0, 0, 0, 0.5);
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 1050;
 }

 .modal-content {
   background: white;
   border-radius: 8px;
   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
   max-width: 500px;
   width: 90%;
   max-height: 80vh;
   overflow-y: auto;
 }

 .modal-header {
   padding: 1rem 1.5rem;
   border-bottom: 1px solid #dee2e6;
   display: flex;
   justify-content: space-between;
   align-items: center;
 }

 .modal-header h5 {
   margin: 0;
   color: #2c3e50;
 }

 .modal-body {
   padding: 1.5rem;
 }

 .time-slots {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
   gap: 0.75rem;
   margin-bottom: 1rem;
 }

 .time-slot-btn {
   font-size: 0.85rem;
   padding: 0.75rem 0.5rem;
   min-height: 60px;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all 0.3s ease;
 }

 .time-slot-content {
   text-align: center;
   line-height: 1.2;
 }

 .time-text {
   font-weight: 600;
   font-size: 0.9rem;
 }

 .booking-count {
   font-size: 0.75rem;
   margin-top: 0.25rem;
   opacity: 0.8;
 }

 .time-slot-btn.btn-outline-warning {
   border-color: #ffc107;
   color: #856404;
 }

 .time-slot-btn.btn-outline-warning:hover {
   background-color: #fff3cd;
   border-color: #ffc107;
 }

 .time-slot-btn.btn-outline-danger {
   border-color: #dc3545;
   color: #721c24;
   cursor: not-allowed;
 }

 .time-slot-btn:disabled {
   opacity: 0.6;
   cursor: not-allowed;
 }

 .time-slot-btn:disabled:hover {
   transform: none;
 }

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }
  
  .event-item {
    flex-direction: column;
  }
  
  .event-time {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .event-actions {
    margin-top: 0.5rem;
  }
}
</style>

