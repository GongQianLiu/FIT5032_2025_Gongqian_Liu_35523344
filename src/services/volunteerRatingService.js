// Volunteer Rating Service - Handles all volunteer rating-related operations
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
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Rating criteria
const ratingCriteria = [
  { value: 'punctuality', label: 'Punctuality', description: 'Arrived on time' },
  { value: 'professionalism', label: 'Professionalism', description: 'Professional conduct' },
  { value: 'quality', label: 'Quality of Work', description: 'Quality of service provided' },
  { value: 'communication', label: 'Communication', description: 'Clear and effective communication' },
  { value: 'reliability', label: 'Reliability', description: 'Dependable and trustworthy' }
]

// Get all ratings
export const getAllRatings = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'ratings'));
    const ratings = [];
    querySnapshot.forEach((doc) => {
      ratings.push({ id: doc.id, ...doc.data() });
    });
    return ratings;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw new Error('Failed to load ratings');
  }
}

// Get ratings by volunteer ID
export const getRatingsByVolunteer = async (volunteerId) => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('volunteerId', '==', volunteerId)
      // 临时移除orderBy以避免索引问题
      // orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const ratings = [];
    querySnapshot.forEach((doc) => {
      ratings.push({ id: doc.id, ...doc.data() });
    });
    return ratings;
  } catch (error) {
    console.error('Error fetching volunteer ratings:', error);
    throw new Error('Failed to load ratings');
  }
}

// Get ratings by elderly user ID
export const getRatingsByElderly = async (elderlyId) => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('elderlyId', '==', elderlyId)
      // 临时移除orderBy以避免索引问题
      // orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const ratings = [];
    querySnapshot.forEach((doc) => {
      ratings.push({ id: doc.id, ...doc.data() });
    });
    return ratings;
  } catch (error) {
    console.error('Error fetching elderly ratings:', error);
    throw new Error('Failed to load ratings');
  }
}

// Get rating by ID
export const getRatingById = async (ratingId) => {
  try {
    const docRef = doc(db, 'ratings', ratingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Rating not found');
    }
  } catch (error) {
    console.error('Error fetching rating:', error);
    throw new Error('Failed to load rating');
  }
}

// Create new rating
export const createRating = async (ratingData) => {
  try {
    // Check if rating already exists for this task
    const q = query(
      collection(db, 'ratings'),
      where('taskId', '==', ratingData.taskId),
      where('volunteerId', '==', ratingData.volunteerId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Rating already exists for this task');
    }
    
    const docRef = await addDoc(collection(db, 'ratings'), {
      ...ratingData,
      createdAt: serverTimestamp(),
      isVerified: false,
      helpfulCount: 0,
      reportCount: 0
    });
    return { id: docRef.id, ...ratingData };
  } catch (error) {
    console.error('Error creating rating:', error);
    throw new Error('Failed to create rating');
  }
}

// Update rating
export const updateRating = async (ratingId, updates) => {
  try {
    const ratingRef = doc(db, 'ratings', ratingId);
    await updateDoc(ratingRef, updates);
    
    const docSnap = await getDoc(ratingRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Rating not found');
    }
  } catch (error) {
    console.error('Error updating rating:', error);
    throw new Error('Failed to update rating');
  }
}

// Delete rating
export const deleteRating = async (ratingId) => {
  try {
    await deleteDoc(doc(db, 'ratings', ratingId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw new Error('Failed to delete rating');
  }
}

// Verify rating (admin function)
export const verifyRating = async (ratingId) => {
  try {
    const ratingRef = doc(db, 'ratings', ratingId);
    await updateDoc(ratingRef, {
      isVerified: true
    });
    
    const docSnap = await getDoc(ratingRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Rating not found');
    }
  } catch (error) {
    console.error('Error verifying rating:', error);
    throw new Error('Failed to verify rating');
  }
}

// Mark rating as helpful
export const markRatingAsHelpful = async (ratingId) => {
  try {
    const ratingRef = doc(db, 'ratings', ratingId);
    const docSnap = await getDoc(ratingRef);
    
    if (!docSnap.exists()) {
      throw new Error('Rating not found');
    }
    
    const currentData = docSnap.data();
    await updateDoc(ratingRef, {
      helpfulCount: (currentData.helpfulCount || 0) + 1
    });
    
    return { id: docSnap.id, ...currentData, helpfulCount: (currentData.helpfulCount || 0) + 1 };
  } catch (error) {
    console.error('Error marking rating as helpful:', error);
    throw new Error('Failed to mark rating as helpful');
  }
}

// Report rating
export const reportRating = async (ratingId, reason) => {
  try {
    const ratingRef = doc(db, 'ratings', ratingId);
    const docSnap = await getDoc(ratingRef);
    
    if (!docSnap.exists()) {
      throw new Error('Rating not found');
    }
    
    const currentData = docSnap.data();
    await updateDoc(ratingRef, {
      reportCount: (currentData.reportCount || 0) + 1
    });
    
    // Create a report record (in a real system, this would be stored separately)
    const report = {
      id: Date.now(),
      ratingId,
      reason,
      reportedAt: new Date().toISOString()
    };
    
    return { success: true, report };
  } catch (error) {
    console.error('Error reporting rating:', error);
    throw new Error('Failed to report rating');
  }
}

// Get volunteer ratings (alias for getVolunteerAverageRating for compatibility)
export const getVolunteerRatings = async (volunteerId) => {
  try {
    const ratings = await getRatingsByVolunteer(volunteerId);

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratings: [],
        ratingDistribution: {}
      };
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    // Calculate rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = ratings.filter(rating => rating.rating === i).length;
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      ratings: ratings,
      ratingDistribution
    };
  } catch (error) {
    console.error('Error getting volunteer ratings:', error);
    throw new Error('Failed to get volunteer ratings');
  }
}

// Get volunteer average rating
export const getVolunteerAverageRating = async (volunteerId) => {
  try {
    const ratings = await getRatingsByVolunteer(volunteerId);

    if (ratings.length === 0) {
      return { averageRating: 0, totalRatings: 0, ratingDistribution: {} };
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    // Calculate rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = ratings.filter(rating => rating.rating === i).length;
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      ratingDistribution
    };
  } catch (error) {
    console.error('Error getting volunteer average rating:', error);
    throw new Error('Failed to get volunteer average rating');
  }
}

// Get top rated volunteers
export const getTopRatedVolunteers = async (limit = 10) => {
  try {
    const ratings = await getAllRatings();
    
    // Get unique volunteers and their average ratings
    const volunteerStats = {};
    
    ratings.forEach(rating => {
      if (!volunteerStats[rating.volunteerId]) {
        volunteerStats[rating.volunteerId] = {
          volunteerId: rating.volunteerId,
          volunteerName: rating.volunteerName,
          totalRatings: 0,
          totalRating: 0,
          averageRating: 0
        };
      }
      
      volunteerStats[rating.volunteerId].totalRatings++;
      volunteerStats[rating.volunteerId].totalRating += rating.rating;
    });
    
    // Calculate average ratings
    Object.values(volunteerStats).forEach(volunteer => {
      volunteer.averageRating = Math.round((volunteer.totalRating / volunteer.totalRatings) * 10) / 10;
    });
    
    // Sort by average rating and return top volunteers
    return Object.values(volunteerStats)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top rated volunteers:', error);
    throw new Error('Failed to get top rated volunteers');
  }
}

// Search ratings
export const searchRatings = async (query, filters = {}) => {
  try {
    let q = collection(db, 'ratings');
    
    // Apply filters
    if (filters.volunteerId) {
      q = query(q, where('volunteerId', '==', filters.volunteerId));
    }
    if (filters.elderlyId) {
      q = query(q, where('elderlyId', '==', filters.elderlyId));
    }
    if (filters.minRating) {
      q = query(q, where('rating', '>=', filters.minRating));
    }
    if (filters.maxRating) {
      q = query(q, where('rating', '<=', filters.maxRating));
    }
    if (filters.isVerified !== undefined) {
      q = query(q, where('isVerified', '==', filters.isVerified));
    }
    
    // 临时移除orderBy以避免索引问题
    // q = query(q, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const ratings = [];
    querySnapshot.forEach((doc) => {
      const ratingData = { id: doc.id, ...doc.data() };
      
      // Text search if query provided
      if (query) {
        const searchTerm = query.toLowerCase();
        if (ratingData.volunteerName?.toLowerCase().includes(searchTerm) ||
            ratingData.elderlyName?.toLowerCase().includes(searchTerm) ||
            ratingData.taskTitle?.toLowerCase().includes(searchTerm) ||
            ratingData.review?.toLowerCase().includes(searchTerm)) {
          ratings.push(ratingData);
        }
      } else {
        ratings.push(ratingData);
      }
    });
    
    return ratings;
  } catch (error) {
    console.error('Error searching ratings:', error);
    throw new Error('Failed to search ratings');
  }
}

// Get rating statistics
export const getRatingStatistics = async () => {
  try {
    const ratings = await getAllRatings();
    
    const total = ratings.length;
    const verified = ratings.filter(rating => rating.isVerified).length;
    const unverified = total - verified;
    
    // Average rating
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = total > 0 ? totalRating / total : 0;
    
    // Rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = ratings.filter(rating => rating.rating === i).length;
    }
    
    // Recent ratings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRatings = ratings.filter(
      rating => new Date(rating.createdAt?.toDate?.() || rating.createdAt) >= thirtyDaysAgo
    ).length;
    
    // Most helpful ratings
    const mostHelpful = ratings
      .sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
      .slice(0, 5);
    
    return {
      total,
      verified,
      unverified,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      recentRatings,
      mostHelpful
    };
  } catch (error) {
    console.error('Error getting rating statistics:', error);
    throw new Error('Failed to get rating statistics');
  }
}

// Export constants
export { ratingCriteria }

// Default export
export default {
  getAllRatings,
  getRatingsByVolunteer,
  getRatingsByElderly,
  getRatingById,
  createRating,
  updateRating,
  deleteRating,
  verifyRating,
  markRatingAsHelpful,
  reportRating,
  getVolunteerRatings,
  getVolunteerAverageRating,
  getTopRatedVolunteers,
  searchRatings,
  getRatingStatistics,
  ratingCriteria
}
