<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/admin-dashboard" class="navbar-brand">
          <i class="bi bi-shield-fill"></i>
          Evergreen Way - Health Services Management
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
              <h1>Health Services Management</h1>
              <p class="text-muted">Manage all health service programs</p>
            </div>
            <button class="btn btn-primary" @click="showAddServiceModal">
              <i class="bi bi-plus-circle"></i>
              Add New Service
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-heart-pulse"></i>
              Service List
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="service in services" :key="service.id">
                    <td>
                      <div>
                        <h6 class="mb-1">{{ service.name }}</h6>
                        <small class="text-muted">{{ service.description }}</small>
                      </div>
                    </td>
                    <td>
                      <span :class="'badge bg-' + getCategoryColor(service.category)">
                        {{ getCategoryName(service.category) }}
                      </span>
                    </td>
                    <td>¥{{ service.price }}</td>
                    <td>
                      <span :class="'badge bg-' + getStatusColor(service.status)">
                        {{ getStatusName(service.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" @click="editService(service)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteService(service)">
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export default {
  name: 'HealthServices',
  setup() {
    const router = useRouter();
    const toast = useToast();

    const services = ref([]);
    const isLoading = ref(false);

    // Load services from Firebase
    const loadServices = async () => {
      try {
        isLoading.value = true;
        const querySnapshot = await getDocs(collection(db, 'healthServices'));
        const servicesList = [];

        querySnapshot.forEach((doc) => {
          servicesList.push({
            id: doc.id,
            ...doc.data()
          });
        });

        services.value = servicesList;

        // If no services exist, create some default ones
        if (servicesList.length === 0) {
          await createDefaultServices();
        }
      } catch (error) {
        console.error('Error loading services:', error);
        toast.error('Failed to load services');
      } finally {
        isLoading.value = false;
      }
    };

    // Create default services
    const createDefaultServices = async () => {
      const defaultServices = [
        {
          name: 'Health Checkup Service',
          category: 'medical',
          description: 'Comprehensive health checkup service for elderly',
          price: 299,
          status: 'active',
          createdAt: serverTimestamp()
        },
        {
          name: 'Nutrition Consultation Service',
          category: 'nutrition',
          description: 'Professional nutritionist provides personalized nutrition advice',
          price: 150,
          status: 'active',
          createdAt: serverTimestamp()
        },
        {
          name: 'Rehabilitation Therapy Service',
          category: 'therapy',
          description: 'Rehabilitation therapy service for elderly',
          price: 200,
          status: 'active',
          createdAt: serverTimestamp()
        }
      ];

      try {
        for (const service of defaultServices) {
          await addDoc(collection(db, 'healthServices'), service);
        }
        await loadServices(); // Reload after creating defaults
        toast.success('Default health services created');
      } catch (error) {
        console.error('Error creating default services:', error);
      }
    };

    const getCategoryName = (category) => {
      const names = {
        medical: 'Medical Service',
        nutrition: 'Nutrition Guidance',
        therapy: 'Rehabilitation Therapy'
      };
      return names[category] || category;
    };

    const getCategoryColor = (category) => {
      const colors = {
        medical: 'danger',
        nutrition: 'success',
        therapy: 'warning'
      };
      return colors[category] || 'secondary';
    };

    const getStatusName = (status) => {
      const names = {
        active: 'Active',
        inactive: 'Inactive'
      };
      return names[status] || status;
    };

    const getStatusColor = (status) => {
      const colors = {
        active: 'success',
        inactive: 'danger'
      };
      return colors[status] || 'secondary';
    };

    const showAddServiceModal = () => {
      // For now, create a simple service
      const serviceName = prompt('Enter service name:');
      if (serviceName) {
        addNewService(serviceName);
      }
    };

    const addNewService = async (name) => {
      try {
        const newService = {
          name: name,
          category: 'medical',
          description: 'New health service',
          price: 100,
          status: 'active',
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'healthServices'), newService);
        await loadServices();
        toast.success('Service added successfully');
      } catch (error) {
        console.error('Error adding service:', error);
        toast.error('Failed to add service');
      }
    };

    const editService = (service) => {
      const newName = prompt('Enter new service name:', service.name);
      if (newName && newName !== service.name) {
        updateService(service.id, { name: newName });
      }
    };

    const updateService = async (serviceId, updates) => {
      try {
        const serviceRef = doc(db, 'healthServices', serviceId);
        await updateDoc(serviceRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        await loadServices();
        toast.success('Service updated successfully');
      } catch (error) {
        console.error('Error updating service:', error);
        toast.error('Failed to update service');
      }
    };

    const deleteService = async (service) => {
      if (confirm(`Are you sure you want to delete service "${service.name}"?`)) {
        try {
          await deleteDoc(doc(db, 'healthServices', service.id));
          await loadServices();
          toast.success('Service deleted successfully');
        } catch (error) {
          console.error('Error deleting service:', error);
          toast.error('Failed to delete service');
        }
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      router.push('/login');
    };

    // Initialize data when component mounts
    onMounted(() => {
      loadServices();
    });

    return {
      services,
      isLoading,
      getCategoryName,
      getCategoryColor,
      getStatusName,
      getStatusColor,
      showAddServiceModal,
      editService,
      deleteService,
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
