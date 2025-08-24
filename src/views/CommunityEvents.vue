<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/admin-dashboard" class="navbar-brand">
          <i class="bi bi-shield-fill"></i>
          Evergreen Way - Community Events Management
        </router-link>
        <div class="d-flex">
          <router-link to="/admin-dashboard" class="btn btn-outline-light me-2">
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
              <h1>Community Events Management</h1>
              <p class="text-muted">Manage all community events and schedules</p>
            </div>
            <button class="btn btn-primary" @click="showAddEventModal">
              <i class="bi bi-plus-circle"></i>
              Add New Event
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-calendar-event"></i>
              Event List
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>Event Name</th>
                    <th>Type</th>
                    <th>Date & Time</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="event in events" :key="event.id">
                    <td>
                      <div>
                        <h6 class="mb-1">{{ event.name }}</h6>
                        <small class="text-muted">{{ event.description }}</small>
                      </div>
                    </td>
                    <td>
                      <span :class="'badge bg-' + getEventTypeColor(event.type)">
                        {{ getEventTypeName(event.type) }}
                      </span>
                    </td>
                    <td>{{ formatDateTime(event.dateTime) }}</td>
                    <td>{{ event.location }}</td>
                    <td>
                      <span :class="'badge bg-' + getStatusColor(event.status)">
                        {{ getStatusName(event.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" @click="editEvent(event)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteEvent(event)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Event Modal -->
    <div class="modal fade" id="addEventModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Add New Event
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveNewEvent">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">Event Name *</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="newEventForm.name"
                      required
                      placeholder="Enter event name"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Event Type</label>
                    <select class="form-select" v-model="newEventForm.type">
                      <option value="social">Social</option>
                      <option value="education">Education</option>
                      <option value="exercise">Exercise</option>
                      <option value="health">Health</option>
                      <option value="entertainment">Entertainment</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  v-model="newEventForm.description"
                  rows="3"
                  placeholder="Enter event description"
                ></textarea>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Date *</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="newEventForm.date"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Time *</label>
                    <input
                      type="time"
                      class="form-control"
                      v-model="newEventForm.time"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Max Participants</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model="newEventForm.maxParticipants"
                      min="1"
                      max="200"
                    >
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">Location</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="newEventForm.location"
                      placeholder="Enter event location"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" v-model="newEventForm.status">
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveNewEvent" :disabled="isSaving">
              <span v-if="isSaving">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating...
              </span>
              <span v-else>
                <i class="bi bi-check-lg me-1"></i>
                Create Event
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export default {
  name: 'CommunityEvents',
  setup() {
    const router = useRouter();
    const toast = useToast();
    const isSaving = ref(false);

    // New event form
    const newEventForm = ref({
      name: '',
      description: '',
      type: 'social',
      date: '',
      time: '',
      location: '',
      maxParticipants: 20,
      status: 'upcoming'
    });

    const events = ref([
      {
        id: 1,
        name: 'Health Lecture: Elderly Nutrition Management',
        type: 'education',
        description: 'Professional nutritionist shares elderly nutrition management knowledge',
        dateTime: new Date('2024-02-15T14:00:00'),
        location: 'Community Activity Center',
        status: 'upcoming'
      },
      {
        id: 2,
        name: 'Tai Chi Practice Class',
        type: 'exercise',
        description: 'Weekly Tai Chi practice, suitable for elderly',
        dateTime: new Date('2024-02-10T09:00:00'),
        location: 'Community Park',
        status: 'ongoing'
      },
      {
        id: 3,
        name: 'Handicraft Art Workshop',
        type: 'social',
        description: 'Learn traditional handicraft art, enhance social interaction',
        dateTime: new Date('2024-02-20T15:00:00'),
        location: 'Community Cultural Center',
        status: 'upcoming'
      }
    ]);

    const getEventTypeName = (type) => {
      const names = {
        education: 'Education Lecture',
        exercise: 'Exercise & Fitness',
        social: 'Social Activity',
        entertainment: 'Entertainment'
      };
      return names[type] || type;
    };

    const getEventTypeColor = (type) => {
      const colors = {
        education: 'primary',
        exercise: 'success',
        social: 'info',
        entertainment: 'warning'
      };
      return colors[type] || 'secondary';
    };

    const getStatusName = (status) => {
      const names = {
        upcoming: 'Upcoming',
        ongoing: 'Ongoing',
        completed: 'Completed',
        cancelled: 'Cancelled'
      };
      return names[status] || status;
    };

    const getStatusColor = (status) => {
      const colors = {
        upcoming: 'warning',
        ongoing: 'success',
        completed: 'secondary',
        cancelled: 'danger'
      };
      return colors[status] || 'secondary';
    };

    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('zh-CN');
    };

    const showAddEventModal = () => {
      // Reset form
      newEventForm.value = {
        name: '',
        description: '',
        type: 'social',
        date: '',
        time: '',
        location: '',
        maxParticipants: 20,
        status: 'upcoming'
      };

      // Show modal
      nextTick(() => {
        const modalElement = document.getElementById('addEventModal');
        if (modalElement) {
          try {
            // Check if bootstrap is available
            if (typeof window.bootstrap !== 'undefined') {
              const modal = new window.bootstrap.Modal(modalElement);
              modal.show();
              console.log('📅 Add event modal opened');
            } else {
              console.error('Bootstrap not available');
              toast.error('Bootstrap library not loaded');
            }
          } catch (error) {
            console.error('Error opening modal:', error);
            toast.error('Failed to open add event dialog: ' + error.message);
          }
        } else {
          console.error('Modal element not found');
          toast.error('Add event dialog not found');
        }
      });
    };

    // Save new event
    const saveNewEvent = async () => {
      if (!newEventForm.value.name || !newEventForm.value.date || !newEventForm.value.time) {
        toast.error('Please fill in all required fields');
        return;
      }

      isSaving.value = true;
      try {
        // Create new event object
        const newEvent = {
          id: Date.now(), // Simple ID generation
          name: newEventForm.value.name,
          description: newEventForm.value.description,
          type: newEventForm.value.type,
          dateTime: new Date(`${newEventForm.value.date}T${newEventForm.value.time}`),
          location: newEventForm.value.location,
          maxParticipants: newEventForm.value.maxParticipants,
          status: newEventForm.value.status,
          createdAt: new Date().toISOString()
        };

        // Add to Firebase (you can implement this later)
        // await addDoc(collection(db, 'community_events'), newEvent);

        // For now, just add to local array
        events.value.unshift(newEvent);

        toast.success('Event created successfully');

        // Close modal
        const modalElement = document.getElementById('addEventModal');
        if (modalElement && window.bootstrap) {
          const modal = window.bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }

        console.log('📅 New event created:', newEvent);
      } catch (error) {
        console.error('Error creating event:', error);
        toast.error('Failed to create event');
      } finally {
        isSaving.value = false;
      }
    };

    const editEvent = (event) => {
      toast.info(`Edit event: ${event.name}`);
    };

    const deleteEvent = (event) => {
      if (confirm(`Are you sure you want to delete event "${event.name}"?`)) {
        events.value = events.value.filter(e => e.id !== event.id);
        toast.success('Event deleted successfully');
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      router.push('/login');
    };

    return {
      events,
      getEventTypeName,
      getEventTypeColor,
      getStatusName,
      getStatusColor,
      formatDateTime,
      newEventForm,
      isSaving,
      showAddEventModal,
      saveNewEvent,
      editEvent,
      deleteEvent,
      handleLogout
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
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  padding: 1rem 1.5rem;
}
</style>
