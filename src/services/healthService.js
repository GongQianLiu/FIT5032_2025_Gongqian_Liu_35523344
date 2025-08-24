// Health Service Management
// This service handles health service data and operations

import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

export default {
  // Get all health services
  async getAllHealthServices() {
    try {
      const servicesQuery = query(
        collection(db, 'health_services')
        // 临时移除orderBy以避免索引问题
        // orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(servicesQuery);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        services: services
      };
    } catch (error) {
      console.error('Failed to get health services:', error);
      return { success: false, error: error.message };
    }
  },

  // Get health services by category
  async getHealthServicesByCategory(category) {
    try {
      const servicesQuery = query(
        collection(db, 'health_services'),
        where('category', '==', category)
        // 临时移除orderBy以避免索引问题
        // orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(servicesQuery);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        services: services
      };
    } catch (error) {
      console.error('Failed to get health services by category:', error);
      return { success: false, error: error.message };
    }
  },

  // Create a new health service
  async createHealthService(serviceData) {
    try {
      const serviceDoc = {
        ...serviceData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'health_services'), serviceDoc);
      
      return {
        success: true,
        serviceId: docRef.id,
        message: 'Health service created successfully'
      };
    } catch (error) {
      console.error('Failed to create health service:', error);
      return { success: false, error: error.message };
    }
  },

  // Update a health service
  async updateHealthService(serviceId, updateData) {
    try {
      const serviceRef = doc(db, 'health_services', serviceId);
      await updateDoc(serviceRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Health service updated successfully'
      };
    } catch (error) {
      console.error('Failed to update health service:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete a health service
  async deleteHealthService(serviceId) {
    try {
      await deleteDoc(doc(db, 'health_services', serviceId));
      
      return {
        success: true,
        message: 'Health service deleted successfully'
      };
    } catch (error) {
      console.error('Failed to delete health service:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle service status (active/inactive)
  async toggleServiceStatus(serviceId, currentStatus) {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const serviceRef = doc(db, 'health_services', serviceId);
      
      await updateDoc(serviceRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        newStatus: newStatus,
        message: `Service ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      console.error('Failed to toggle service status:', error);
      return { success: false, error: error.message };
    }
  },

  // Get service statistics
  async getServiceStatistics() {
    try {
      const servicesQuery = query(collection(db, 'health_services'));
      const querySnapshot = await getDocs(servicesQuery);
      
      const stats = {
        total: 0,
        active: 0,
        inactive: 0,
        byCategory: {}
      };

      querySnapshot.forEach((doc) => {
        const service = doc.data();
        stats.total++;
        
        if (service.status === 'active') {
          stats.active++;
        } else {
          stats.inactive++;
        }

        if (service.category) {
          stats.byCategory[service.category] = (stats.byCategory[service.category] || 0) + 1;
        }
      });

      return {
        success: true,
        statistics: stats
      };
    } catch (error) {
      console.error('Failed to get service statistics:', error);
      return { success: false, error: error.message };
    }
  },

  // Search health services
  async searchHealthServices(searchTerm) {
    try {
      const servicesQuery = query(collection(db, 'health_services'));
      const querySnapshot = await getDocs(servicesQuery);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        const service = doc.data();
        const searchLower = searchTerm.toLowerCase();
        
        // Search in name, description, and category
        if (service.name?.toLowerCase().includes(searchLower) ||
            service.description?.toLowerCase().includes(searchLower) ||
            service.category?.toLowerCase().includes(searchLower)) {
          services.push({
            id: doc.id,
            ...service
          });
        }
      });

      return {
        success: true,
        services: services
      };
    } catch (error) {
      console.error('Failed to search health services:', error);
      return { success: false, error: error.message };
    }
  },

  // Get service categories
  async getServiceCategories() {
    try {
      const servicesQuery = query(collection(db, 'health_services'));
      const querySnapshot = await getDocs(servicesQuery);
      const categories = new Set();
      
      querySnapshot.forEach((doc) => {
        const service = doc.data();
        if (service.category) {
          categories.add(service.category);
        }
      });

      return {
        success: true,
        categories: Array.from(categories).sort()
      };
    } catch (error) {
      console.error('Failed to get service categories:', error);
      return { success: false, error: error.message };
    }
  },

  // Bulk update services
  async bulkUpdateServices(serviceIds, updateData) {
    try {
      const updatePromises = serviceIds.map(serviceId => {
        const serviceRef = doc(db, 'health_services', serviceId);
        return updateDoc(serviceRef, {
          ...updateData,
          updatedAt: serverTimestamp()
        });
      });

      await Promise.all(updatePromises);

      return {
        success: true,
        message: `${serviceIds.length} services updated successfully`
      };
    } catch (error) {
      console.error('Failed to bulk update services:', error);
      return { success: false, error: error.message };
    }
  },

  // Export services data
  async exportServicesData() {
    try {
      const servicesQuery = query(collection(db, 'health_services'));
      const querySnapshot = await getDocs(servicesQuery);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Convert to CSV format
      const csvData = this.convertToCSV(services);

      return {
        success: true,
        data: csvData,
        filename: `health_services_${new Date().toISOString().split('T')[0]}.csv`
      };
    } catch (error) {
      console.error('Failed to export services data:', error);
      return { success: false, error: error.message };
    }
  },

  // Convert data to CSV format
  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
};
