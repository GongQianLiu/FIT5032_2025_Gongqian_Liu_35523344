<template>
  <div class="appointment-calendar">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-calendar-event me-2"></i>
          Appointment Calendar
        </h5>
      </div>
      <div class="card-body">
        <!-- Calendar Controls -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="d-flex gap-2">
              <button 
                class="btn btn-outline-primary btn-sm"
                @click="showAppointmentModal = true"
                :disabled="!selectedDate"
              >
                <i class="bi bi-plus-circle me-1"></i>
                New Appointment
              </button>
              <button 
                class="btn btn-outline-secondary btn-sm"
                @click="refreshCalendar"
              >
                <i class="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
          </div>
          <div class="col-md-6 text-end">
            <div class="d-flex gap-2 justify-content-end">
              <span class="badge bg-success">Available</span>
              <span class="badge bg-warning">Pending</span>
              <span class="badge bg-danger">Conflict</span>
            </div>
          </div>
        </div>

        <!-- Calendar Container -->
        <div id="calendar" class="calendar-container"></div>

        <!-- Selected Date Info -->
        <div v-if="selectedDate" class="mt-3 p-3 bg-light rounded">
          <h6>Selected Date: {{ formatDate(selectedDate) }}</h6>
          <div v-if="selectedDateAppointments.length > 0">
            <p class="mb-2">Appointments on this date:</p>
            <div class="list-group">
              <div 
                v-for="appointment in selectedDateAppointments" 
                :key="appointment.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{{ appointment.title }}</strong>
                  <br>
                  <small class="text-muted">
                    {{ appointment.startTime }} - {{ appointment.endTime }}
                  </small>
                </div>
                <div class="d-flex gap-1">
                  <button 
                    class="btn btn-sm btn-outline-primary"
                    @click="editAppointment(appointment)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteAppointment(appointment.id)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p class="text-muted">No appointments scheduled for this date.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Modal -->
    <div 
      v-if="showAppointmentModal" 
      class="modal fade show d-block" 
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingAppointment ? 'Edit' : 'New' }} Appointment
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeAppointmentModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAppointment">
              <div class="mb-3">
                <label for="appointmentTitle" class="form-label">Title</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="appointmentTitle"
                  v-model="appointmentForm.title"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="appointmentDate" class="form-label">Date</label>
                <input 
                  type="date" 
                  class="form-control" 
                  id="appointmentDate"
                  v-model="appointmentForm.date"
                  required
                >
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <label for="startTime" class="form-label">Start Time</label>
                  <input 
                    type="time" 
                    class="form-control" 
                    id="startTime"
                    v-model="appointmentForm.startTime"
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label for="endTime" class="form-label">End Time</label>
                  <input 
                    type="time" 
                    class="form-control" 
                    id="endTime"
                    v-model="appointmentForm.endTime"
                    required
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="appointmentType" class="form-label">Type</label>
                <select 
                  class="form-select" 
                  id="appointmentType"
                  v-model="appointmentForm.type"
                  required
                >
                  <option value="">Select type...</option>
                  <option value="health">Health Check</option>
                  <option value="social">Social Visit</option>
                  <option value="therapy">Therapy Session</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="appointmentNotes" class="form-label">Notes</label>
                <textarea 
                  class="form-control" 
                  id="appointmentNotes"
                  v-model="appointmentForm.notes"
                  rows="3"
                ></textarea>
              </div>

              <!-- Conflict Warning -->
              <div v-if="conflictWarning" class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ conflictWarning }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeAppointmentModal"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveAppointment"
              :disabled="!isFormValid"
            >
              {{ editingAppointment ? 'Update' : 'Create' }} Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';

export default {
  name: 'AppointmentCalendar',
  setup() {
    const toast = useToast();
    
    // Calendar state
    const calendar = ref(null);
    const selectedDate = ref(null);
    const selectedDateAppointments = ref([]);
    const appointments = ref([]);
    
    // Modal state
    const showAppointmentModal = ref(false);
    const editingAppointment = ref(null);
    const conflictWarning = ref('');
    
    // Form state
    const appointmentForm = ref({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      type: '',
      notes: ''
    });

    // Computed properties
    const isFormValid = computed(() => {
      return appointmentForm.value.title && 
             appointmentForm.value.date && 
             appointmentForm.value.startTime && 
             appointmentForm.value.endTime && 
             appointmentForm.value.type;
    });

    // Initialize calendar
    const initializeCalendar = () => {
      // Check if FullCalendar is available
      if (typeof FullCalendar === 'undefined') {
        console.warn('FullCalendar not loaded. Loading from CDN...');
        loadFullCalendar();
        return;
      }

      const calendarEl = document.getElementById('calendar');
      if (!calendarEl) return;

      calendar.value = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        selectable: true,
        select: (info) => {
          selectedDate.value = info.startStr;
          appointmentForm.value.date = info.startStr;
          showAppointmentModal.value = true;
        },
        eventClick: (info) => {
          const appointment = appointments.value.find(a => a.id === info.event.id);
          if (appointment) {
            editAppointment(appointment);
          }
        },
        events: appointments.value.map(appointment => ({
          id: appointment.id,
          title: appointment.title,
          start: `${appointment.date}T${appointment.startTime}`,
          end: `${appointment.date}T${appointment.endTime}`,
          backgroundColor: getEventColor(appointment.type),
          borderColor: getEventColor(appointment.type),
          extendedProps: appointment
        })),
        eventDidMount: (info) => {
          // Add tooltip
          const tooltip = new Tooltip(info.el, {
            title: `${info.event.title}\n${info.event.start.toLocaleTimeString()} - ${info.event.end.toLocaleTimeString()}`,
            placement: 'top',
            trigger: 'hover',
            container: 'body'
          });
        }
      });

      calendar.value.render();
    };

    // Load FullCalendar from CDN
    const loadFullCalendar = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js';
      script.onload = () => {
        initializeCalendar();
      };
      document.head.appendChild(script);
    };

    // Get event color based on type
    const getEventColor = (type) => {
      const colors = {
        health: '#dc3545',
        social: '#28a745',
        therapy: '#17a2b8',
        consultation: '#ffc107'
      };
      return colors[type] || '#6c757d';
    };

    // Load appointments
    const loadAppointments = () => {
      // Mock data - replace with actual API call
      appointments.value = [
        {
          id: 1,
          title: 'Health Check',
          date: '2024-02-15',
          startTime: '09:00',
          endTime: '10:00',
          type: 'health',
          notes: 'Regular health checkup'
        },
        {
          id: 2,
          title: 'Social Visit',
          date: '2024-02-15',
          startTime: '14:00',
          endTime: '15:00',
          type: 'social',
          notes: 'Visit from volunteer'
        },
        {
          id: 3,
          title: 'Therapy Session',
          date: '2024-02-20',
          startTime: '11:00',
          endTime: '12:00',
          type: 'therapy',
          notes: 'Physical therapy session'
        }
      ];
      
      updateCalendarEvents();
    };

    // Update calendar events
    const updateCalendarEvents = () => {
      if (!calendar.value) return;
      
      calendar.value.removeAllEvents();
      calendar.value.addEventSource(appointments.value.map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        start: `${appointment.date}T${appointment.startTime}`,
        end: `${appointment.date}T${appointment.endTime}`,
        backgroundColor: getEventColor(appointment.type),
        borderColor: getEventColor(appointment.type),
        extendedProps: appointment
      })));
    };

    // Check for conflicts
    const checkConflicts = () => {
      if (!appointmentForm.value.date || !appointmentForm.value.startTime || !appointmentForm.value.endTime) {
        conflictWarning.value = '';
        return;
      }

      const newStart = new Date(`${appointmentForm.value.date}T${appointmentForm.value.startTime}`);
      const newEnd = new Date(`${appointmentForm.value.date}T${appointmentForm.value.endTime}`);
      
      const conflicts = appointments.value.filter(appointment => {
        if (editingAppointment.value && appointment.id === editingAppointment.value.id) {
          return false;
        }
        
        if (appointment.date !== appointmentForm.value.date) {
          return false;
        }
        
        const existingStart = new Date(`${appointment.date}T${appointment.startTime}`);
        const existingEnd = new Date(`${appointment.date}T${appointment.endTime}`);
        
        return (newStart < existingEnd && newEnd > existingStart);
      });

      if (conflicts.length > 0) {
        conflictWarning.value = `This appointment conflicts with: ${conflicts.map(c => c.title).join(', ')}`;
      } else {
        conflictWarning.value = '';
      }
    };

    // Watch form changes for conflicts
    watch([() => appointmentForm.value.date, () => appointmentForm.value.startTime, () => appointmentForm.value.endTime], () => {
      checkConflicts();
    });

    // Save appointment
    const saveAppointment = () => {
      if (!isFormValid.value) return;
      
      if (conflictWarning.value) {
        toast.warning('Please resolve conflicts before saving');
        return;
      }

      const appointment = {
        id: editingAppointment.value ? editingAppointment.value.id : Date.now(),
        ...appointmentForm.value
      };

      if (editingAppointment.value) {
        const index = appointments.value.findIndex(a => a.id === appointment.id);
        if (index !== -1) {
          appointments.value[index] = appointment;
        }
        toast.success('Appointment updated successfully');
      } else {
        appointments.value.push(appointment);
        toast.success('Appointment created successfully');
      }

      updateCalendarEvents();
      closeAppointmentModal();
    };

    // Edit appointment
    const editAppointment = (appointment) => {
      editingAppointment.value = appointment;
      appointmentForm.value = { ...appointment };
      showAppointmentModal.value = true;
    };

    // Delete appointment
    const deleteAppointment = (id) => {
      if (confirm('Are you sure you want to delete this appointment?')) {
        appointments.value = appointments.value.filter(a => a.id !== id);
        updateCalendarEvents();
        toast.success('Appointment deleted successfully');
      }
    };

    // Close modal
    const closeAppointmentModal = () => {
      showAppointmentModal.value = false;
      editingAppointment.value = null;
      appointmentForm.value = {
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        type: '',
        notes: ''
      };
      conflictWarning.value = '';
    };

    // Refresh calendar
    const refreshCalendar = () => {
      loadAppointments();
      toast.info('Calendar refreshed');
    };

    // Format date
    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    onMounted(() => {
      loadAppointments();
      initializeCalendar();
    });

    return {
      selectedDate,
      selectedDateAppointments,
      showAppointmentModal,
      editingAppointment,
      appointmentForm,
      conflictWarning,
      isFormValid,
      saveAppointment,
      editAppointment,
      deleteAppointment,
      closeAppointmentModal,
      refreshCalendar,
      formatDate
    };
  }
};
</script>

<style scoped>
.appointment-calendar {
  max-width: 1200px;
  margin: 0 auto;
}

.calendar-container {
  min-height: 600px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.modal {
  z-index: 1050;
}

.list-group-item {
  border-left: 4px solid #007bff;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

/* FullCalendar custom styles */
:deep(.fc-event) {
  cursor: pointer;
  border-radius: 4px;
}

:deep(.fc-event:hover) {
  opacity: 0.8;
}

:deep(.fc-daygrid-day:hover) {
  background-color: #f8f9fa;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5rem;
  font-weight: 600;
}

:deep(.fc-button) {
  background-color: #007bff;
  border-color: #007bff;
}

:deep(.fc-button:hover) {
  background-color: #0056b3;
  border-color: #0056b3;
}

:deep(.fc-button:focus) {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Responsive design */
@media (max-width: 768px) {
  .calendar-container {
    min-height: 400px;
  }
  
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  :deep(.fc-toolbar-title) {
    font-size: 1.2rem;
  }
}
</style>
