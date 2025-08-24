// Calendar Service for managing events and appointments
// This service integrates with Firestore for data persistence

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
  // Get all events for a user
  async getUserEvents(userId, startDate = null, endDate = null) {
    try {
      let eventsQuery = query(
        collection(db, 'events'),
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );

      if (startDate && endDate) {
        eventsQuery = query(
          collection(db, 'events'),
          where('userId', '==', userId),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'asc')
        );
      }

      const querySnapshot = await getDocs(eventsQuery);
      const events = [];
      
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        events: events
      };
    } catch (error) {
      console.error('Failed to get user events:', error);
      return { success: false, error: error.message };
    }
  },

  // Create a new event
  async createEvent(eventData) {
    try {
      const eventDoc = {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'events'), eventDoc);
      
      return {
        success: true,
        eventId: docRef.id,
        message: 'Event created successfully'
      };
    } catch (error) {
      console.error('Failed to create event:', error);
      return { success: false, error: error.message };
    }
  },

  // Update an existing event
  async updateEvent(eventId, updateData) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Event updated successfully'
      };
    } catch (error) {
      console.error('Failed to update event:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete an event
  async deleteEvent(eventId) {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      
      return {
        success: true,
        message: 'Event deleted successfully'
      };
    } catch (error) {
      console.error('Failed to delete event:', error);
      return { success: false, error: error.message };
    }
  },

  // Get available appointment slots
  async getAvailableSlots(serviceId, date) {
    try {
      // This would typically query a service provider's availability
      // For now, we'll return mock available slots
      const mockSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];

      return {
        success: true,
        slots: mockSlots
      };
    } catch (error) {
      console.error('Failed to get available slots:', error);
      return { success: false, error: error.message };
    }
  },

  // Book an appointment
  async bookAppointment(appointmentData) {
    try {
      const appointmentDoc = {
        ...appointmentData,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'appointments'), appointmentDoc);
      
      return {
        success: true,
        appointmentId: docRef.id,
        message: 'Appointment booked successfully'
      };
    } catch (error) {
      console.error('Failed to book appointment:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user appointments
  async getUserAppointments(userId) {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(appointmentsQuery);
      const appointments = [];
      
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        appointments: appointments
      };
    } catch (error) {
      console.error('Failed to get user appointments:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancel an appointment
  async cancelAppointment(appointmentId) {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Appointment cancelled successfully'
      };
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      return { success: false, error: error.message };
    }
  },

  // Get upcoming events (next 7 days)
  async getUpcomingEvents(userId) {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const eventsQuery = query(
        collection(db, 'events'),
        where('userId', '==', userId),
        where('date', '>=', today.toISOString().split('T')[0]),
        where('date', '<=', nextWeek.toISOString().split('T')[0]),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(eventsQuery);
      const events = [];
      
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        events: events
      };
    } catch (error) {
      console.error('Failed to get upcoming events:', error);
      return { success: false, error: error.message };
    }
  },

  // Get events by type
  async getEventsByType(userId, eventType) {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('userId', '==', userId),
        where('type', '==', eventType),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(eventsQuery);
      const events = [];
      
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        events: events
      };
    } catch (error) {
      console.error('Failed to get events by type:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate calendar data for a month
  generateCalendarData(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      dates.push({
        key: date.toISOString().split('T')[0],
        date: date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        events: [] // Will be populated when events are loaded
      });
    }
    
    return dates;
  }
};
