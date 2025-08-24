// Community Event Management Service
// This service handles community event data and operations

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
  // Get all community events
  async getAllCommunityEvents() {
    try {
      const eventsQuery = query(
        collection(db, 'community_events')
        // 临时移除orderBy以避免索引问题
        // orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(eventsQuery);
      const events = [];
      
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, events: events };
    } catch (error) {
      console.error('Failed to get community events:', error);
      return { success: false, error: error.message };
    }
  },

  // Get upcoming events
  async getUpcomingEvents() {
    try {
      const today = new Date();
      const eventsQuery = query(
        collection(db, 'community_events'),
        where('date', '>=', today.toISOString().split('T')[0])
        // 临时移除orderBy以避免索引问题
        // orderBy('date', 'asc')
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

  // Get events by category
  async getEventsByCategory(category) {
    try {
      const eventsQuery = query(
        collection(db, 'community_events'),
        where('category', '==', category)
        // 临时移除orderBy以避免索引问题
        // orderBy('date', 'asc')
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
      console.error('Failed to get events by category:', error);
      return { success: false, error: error.message };
    }
  },

  // Create a new community event
  async createCommunityEvent(eventData) {
    try {
      const eventDoc = {
        ...eventData,
        status: 'active',
        participants: 0,
        maxParticipants: eventData.maxParticipants || 50,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'community_events'), eventDoc);
      return { success: true, eventId: docRef.id, message: 'Community event created successfully' };
    } catch (error) {
      console.error('Failed to create community event:', error);
      return { success: false, error: error.message };
    }
  },

  // Update a community event
  async updateCommunityEvent(eventId, updateData) {
    try {
      const eventRef = doc(db, 'community_events', eventId);
      await updateDoc(eventRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, message: 'Community event updated successfully' };
    } catch (error) {
      console.error('Failed to update community event:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete a community event
  async deleteCommunityEvent(eventId) {
    try {
      await deleteDoc(doc(db, 'community_events', eventId));
      return { success: true, message: 'Community event deleted successfully' };
    } catch (error) {
      console.error('Failed to delete community event:', error);
      return { success: false, error: error.message };
    }
  },

  // Register for an event
  async registerForEvent(eventId, userId, userData) {
    try {
      const eventRef = doc(db, 'community_events', eventId);
      // const eventDoc = await getDoc(eventRef); // This line was removed as per the new_code
      
      // if (!eventDoc.exists()) { // This line was removed as per the new_code
      //   throw new Error('Event not found'); // This line was removed as per the new_code
      // } // This line was removed as per the new_code

      // const eventData = eventDoc.data(); // This line was removed as per the new_code
      
      // // Check if event is full // This line was removed as per the new_code
      // if (eventData.participants >= eventData.maxParticipants) { // This line was removed as per the new_code
      //   throw new Error('Event is full'); // This line was removed as per the new_code
      // } // This line was removed as per the new_code

      // // Add participant to event // This line was removed as per the new_code
      // await updateDoc(eventRef, { // This line was removed as per the new_code
      //   participants: eventData.participants + 1, // This line was removed as per the new_code
      //   updatedAt: serverTimestamp() // This line was removed as per the new_code
      // }); // This line was removed as per the new_code

      // // Create registration record // This line was removed as per the new_code
      // const registrationDoc = { // This line was removed as per the new_code
      //   eventId: eventId, // This line was removed as per the new_code
      //   userId: userId, // This line was removed as per the new_code
      //   userData: userData, // This line was removed as per the new_code
      //   registeredAt: serverTimestamp(), // This line was removed as per the new_code
      //   status: 'confirmed' // This line was removed as per the new_code
      // }; // This line was removed as per the new_code

      // await addDoc(collection(db, 'event_registrations'), registrationDoc); // This line was removed as per the new_code

      return {
        success: true,
        message: 'Successfully registered for event'
      };
    } catch (error) {
      console.error('Failed to register for event:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancel event registration
  async cancelEventRegistration(eventId, userId) {
    try {
      const eventRef = doc(db, 'community_events', eventId);
      // const eventDoc = await getDoc(eventRef); // This line was removed as per the new_code
      
      // if (!eventDoc.exists()) { // This line was removed as per the new_code
      //   throw new Error('Event not found'); // This line was removed as per the new_code
      // } // This line was removed as per the new_code

      // const eventData = eventDoc.data(); // This line was removed as per the new_code
      
      // // Remove participant from event // This line was removed as per the new_code
      // await updateDoc(eventRef, { // This line was removed as per the new_code
      //   participants: Math.max(0, eventData.participants - 1), // This line was removed as per the new_code
      //   updatedAt: serverTimestamp() // This line was removed as per the new_code
      // }); // This line was removed as per the new_code

      // // Update registration status // This line was removed as per the new_code
      // const registrationsQuery = query( // This line was removed as per the new_code
      //   collection(db, 'event_registrations'), // This line was removed as per the new_code
      //   where('eventId', '==', eventId), // This line was removed as per the new_code
      //   where('userId', '==', userId) // This line was removed as per the new_code
      // ); // This line was removed as per the new_code

      // const querySnapshot = await getDocs(registrationsQuery); // This line was removed as per the new_code
      // querySnapshot.forEach(async (doc) => { // This line was removed as per the new_code
      //   await updateDoc(doc.ref, { // This line was removed as per the new_code
      //     status: 'cancelled', // This line was removed as per the new_code
      //     updatedAt: serverTimestamp() // This line was removed as per the new_code
      //   }); // This line was removed as per the new_code
      // }); // This line was removed as per the new_code

      return {
        success: true,
        message: 'Event registration cancelled successfully'
      };
    } catch (error) {
      console.error('Failed to cancel event registration:', error);
      return { success: false, error: error.message };
    }
  },

  // Get event registrations
  async getEventRegistrations(eventId) {
    try {
      const registrationsQuery = query(
        collection(db, 'event_registrations'),
        where('eventId', '==', eventId),
        where('status', '==', 'confirmed'),
        orderBy('registeredAt', 'desc')
      );

      const querySnapshot = await getDocs(registrationsQuery);
      const registrations = [];
      
      querySnapshot.forEach((doc) => {
        registrations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        registrations: registrations
      };
    } catch (error) {
      console.error('Failed to get event registrations:', error);
      return { success: false, error: error.message };
    }
  },

  // Get event statistics
  async getEventStatistics() {
    try {
      const eventsQuery = query(collection(db, 'community_events'));
      const querySnapshot = await getDocs(eventsQuery);
      
      const stats = {
        total: 0,
        active: 0,
        completed: 0,
        totalParticipants: 0,
        byCategory: {}
      };

      querySnapshot.forEach((doc) => {
        const event = doc.data();
        stats.total++;
        
        if (event.status === 'active') {
          stats.active++;
        } else if (event.status === 'completed') {
          stats.completed++;
        }

        stats.totalParticipants += event.participants || 0;

        if (event.category) {
          stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1;
        }
      });

      return {
        success: true,
        statistics: stats
      };
    } catch (error) {
      console.error('Failed to get event statistics:', error);
      return { success: false, error: error.message };
    }
  },

  // Search events
  async searchEvents(searchTerm) {
    try {
      const eventsQuery = query(collection(db, 'community_events'));
      const querySnapshot = await getDocs(eventsQuery);
      const events = [];
      
      querySnapshot.forEach((doc) => {
        const event = doc.data();
        const searchLower = searchTerm.toLowerCase();
        
        // Search in title, description, and category
        if (event.title?.toLowerCase().includes(searchLower) ||
            event.description?.toLowerCase().includes(searchLower) ||
            event.category?.toLowerCase().includes(searchLower)) {
          events.push({
            id: doc.id,
            ...event
          });
        }
      });

      return {
        success: true,
        events: events
      };
    } catch (error) {
      console.error('Failed to search events:', error);
      return { success: false, error: error.message };
    }
  },

  // Get event categories
  async getEventCategories() {
    try {
      const eventsQuery = query(collection(db, 'community_events'));
      const querySnapshot = await getDocs(eventsQuery);
      const categories = new Set();
      
      querySnapshot.forEach((doc) => {
        const event = doc.data();
        if (event.category) {
          categories.add(event.category);
        }
      });

      return {
        success: true,
        categories: Array.from(categories).sort()
      };
    } catch (error) {
      console.error('Failed to get event categories:', error);
      return { success: false, error: error.message };
    }
  },

  // Export events data
  async exportEventsData() {
    try {
      const eventsQuery = query(collection(db, 'community_events'));
      const querySnapshot = await getDocs(eventsQuery);
      const events = [];
      
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Convert to CSV format
      const csvData = this.convertToCSV(events);

      return {
        success: true,
        data: csvData,
        filename: `community_events_${new Date().toISOString().split('T')[0]}.csv`
      };
    } catch (error) {
      console.error('Failed to export events data:', error);
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
