// Appointment Service - Handles all appointment-related operations
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Appointment types
const appointmentTypes = [
  { value: 'health_checkup', label: 'Health Checkup', icon: 'bi-heart-pulse', color: 'danger' },
  { value: 'rehabilitation', label: 'Rehabilitation Therapy', icon: 'bi-heart', color: 'warning' },
  { value: 'nutrition', label: 'Nutrition Consultation', icon: 'bi-apple', color: 'success' },
  { value: 'exercise', label: 'Exercise Guidance', icon: 'bi-lightning', color: 'info' },
  { value: 'social', label: 'Social Activity', icon: 'bi-people', color: 'primary' }
];

// Get all appointments for a user
export const getAppointmentsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId)
      // 临时移除orderBy以避免索引问题
      // orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw new Error('Failed to load appointments');
  }
};

// Get appointments by date
export const getAppointmentsByDate = async (userId, date) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    throw new Error('Failed to load appointments');
  }
};

// Get all appointments for a specific date and time (for conflict checking)
export const getAppointmentsByDateTime = async (date, time) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('date', '==', date),
      where('time', '==', time),
      where('status', '!=', 'cancelled')
    );
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments by date and time:', error);
    throw new Error('Failed to check appointment conflicts');
  }
};

// Check if a time slot is available (less than 3 bookings)
export const checkTimeSlotAvailability = async (date, time) => {
  try {
    const appointments = await getAppointmentsByDateTime(date, time);
    return {
      available: appointments.length < 3,
      currentBookings: appointments.length,
      maxBookings: 3,
      remainingSlots: 3 - appointments.length
    };
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    throw new Error('Failed to check time slot availability');
  }
};

// Create new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: serverTimestamp(),
      status: 'scheduled'
    });
    return { id: docRef.id, ...appointmentData };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }
};

// Update appointment
export const updateAppointment = async (appointmentId, updates) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    const docSnap = await getDoc(appointmentRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Appointment not found');
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
};

// Delete appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    await deleteDoc(doc(db, 'appointments', appointmentId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw new Error('Failed to delete appointment');
  }
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Appointment not found');
    }
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw new Error('Failed to load appointment');
  }
};

// Search appointments
export const searchAppointments = async (userId, query, filters = {}) => {
  try {
    let q = collection(db, 'appointments');
    
    // Apply filters
    if (filters.date) {
      q = query(q, where('date', '==', filters.date));
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    // Always filter by user
    q = query(q, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      const appointmentData = { id: doc.id, ...doc.data() };
      
      // Text search if query provided
      if (query) {
        const searchTerm = query.toLowerCase();
        if (appointmentData.title?.toLowerCase().includes(searchTerm) ||
            appointmentData.description?.toLowerCase().includes(searchTerm) ||
            appointmentData.location?.toLowerCase().includes(searchTerm)) {
          appointments.push(appointmentData);
        }
      } else {
        appointments.push(appointmentData);
      }
    });
    
    return appointments;
  } catch (error) {
    console.error('Error searching appointments:', error);
    throw new Error('Failed to search appointments');
  }
};

// Get appointment statistics
export const getAppointmentStatistics = async (userId) => {
  try {
    const appointments = await getAppointmentsByUser(userId);
    
    const total = appointments.length;
    const scheduled = appointments.filter(apt => apt.status === 'scheduled').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    
    const typeStats = appointmentTypes.map(type => ({
      type: type.value,
      label: type.label,
      count: appointments.filter(apt => apt.type === type.value).length
    }));
    
    // Recent appointments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAppointments = appointments.filter(
      apt => new Date(apt.date) >= thirtyDaysAgo
    ).length;
    
    return {
      total,
      scheduled,
      completed,
      cancelled,
      typeStats,
      recentAppointments
    };
  } catch (error) {
    console.error('Error getting appointment statistics:', error);
    throw new Error('Failed to get appointment statistics');
  }
};

// Export constants
export { appointmentTypes };

// Default export
export default {
  getAppointmentsByUser,
  getAppointmentsByDate,
  getAppointmentsByDateTime,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentById,
  searchAppointments,
  getAppointmentStatistics,
  checkTimeSlotAvailability,
  appointmentTypes
};
