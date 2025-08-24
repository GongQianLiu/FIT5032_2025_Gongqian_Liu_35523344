const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample data
const sampleUsers = [
  {
    id: 'user1',
    username: 'sarah_johnson',
    email: 'sarah.johnson@email.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'elderly',
    phone: '+61 412 345 678',
    address: '123 Collins St, Melbourne VIC 3000',
    dateOfBirth: '1945-03-15',
    isActive: true,
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T10:00:00Z')),
    lastLogin: admin.firestore.Timestamp.fromDate(new Date('2024-02-14T16:30:00Z')),
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: 'en'
    },
    healthInfo: {
      mobility: 'limited',
      vision: 'good',
      hearing: 'good',
      medicalConditions: ['diabetes', 'hypertension'],
      medications: ['Metformin', 'Lisinopril'],
      emergencyContact: {
        name: 'Michael Johnson',
        relationship: 'Son',
        phone: '+61 423 456 789'
      }
    }
  },
  {
    id: 'user2',
    username: 'robert_smith',
    email: 'robert.smith@email.com',
    firstName: 'Robert',
    lastName: 'Smith',
    role: 'elderly',
    phone: '+61 434 567 890',
    address: '456 Bourke St, Melbourne VIC 3000',
    dateOfBirth: '1940-07-22',
    isActive: true,
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-20T14:30:00Z')),
    lastLogin: admin.firestore.Timestamp.fromDate(new Date('2024-02-13T09:15:00Z')),
    preferences: {
      notifications: true,
      emailUpdates: false,
      language: 'en'
    },
    healthInfo: {
      mobility: 'good',
      vision: 'limited',
      hearing: 'good',
      medicalConditions: ['arthritis'],
      medications: ['Ibuprofen'],
      emergencyContact: {
        name: 'Jennifer Smith',
        relationship: 'Daughter',
        phone: '+61 445 678 901'
      }
    }
  },
  {
    id: 'user3',
    username: 'emma_wilson',
    email: 'emma.wilson@email.com',
    firstName: 'Emma',
    lastName: 'Wilson',
    role: 'volunteer',
    phone: '+61 456 789 012',
    address: '789 Swanston St, Melbourne VIC 3000',
    dateOfBirth: '1990-11-08',
    isActive: true,
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-10T08:45:00Z')),
    lastLogin: admin.firestore.Timestamp.fromDate(new Date('2024-02-14T12:20:00Z')),
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: 'en'
    },
    volunteerInfo: {
      skills: ['housework', 'companionship', 'shopping'],
      availability: {
        monday: { morning: true, afternoon: true, evening: false },
        tuesday: { morning: false, afternoon: true, evening: true },
        wednesday: { morning: true, afternoon: false, evening: false },
        thursday: { morning: false, afternoon: true, evening: true },
        friday: { morning: true, afternoon: true, evening: false },
        saturday: { morning: true, afternoon: false, evening: false },
        sunday: { morning: false, afternoon: false, evening: false }
      },
      experience: '2 years',
      certifications: ['First Aid', 'Working with Children Check'],
      rating: 4.8,
      completedTasks: 45
    }
  },
  {
    id: 'user4',
    username: 'james_brown',
    email: 'james.brown@email.com',
    firstName: 'James',
    lastName: 'Brown',
    role: 'volunteer',
    phone: '+61 467 890 123',
    address: '321 Flinders St, Melbourne VIC 3000',
    dateOfBirth: '1985-04-12',
    isActive: true,
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-25T11:20:00Z')),
    lastLogin: admin.firestore.Timestamp.fromDate(new Date('2024-02-14T10:45:00Z')),
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: 'en'
    },
    volunteerInfo: {
      skills: ['companionship', 'therapy', 'transportation'],
      availability: {
        monday: { morning: false, afternoon: true, evening: true },
        tuesday: { morning: true, afternoon: false, evening: true },
        wednesday: { morning: false, afternoon: true, evening: false },
        thursday: { morning: true, afternoon: true, evening: false },
        friday: { morning: false, afternoon: false, evening: true },
        saturday: { morning: true, afternoon: true, evening: false },
        sunday: { morning: true, afternoon: false, evening: false }
      },
      experience: '3 years',
      certifications: ['Occupational Therapy', 'First Aid'],
      rating: 4.9,
      completedTasks: 67
    }
  },
  {
    id: 'user5',
    username: 'admin_user',
    email: 'admin@evergreenway.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '+61 478 901 234',
    address: 'Admin Office, Melbourne VIC 3000',
    dateOfBirth: '1980-01-01',
    isActive: true,
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
    lastLogin: admin.firestore.Timestamp.fromDate(new Date('2024-02-14T17:00:00Z')),
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: 'en'
    }
  }
];

const sampleTasks = [
  {
    id: 'task1',
    title: 'Grocery Shopping',
    description: 'Need help with grocery shopping for the week',
    type: 'shopping',
    status: 'open',
    priority: 'medium',
    location: 'Melbourne CBD',
    elderlyId: 'user1',
    elderlyName: 'Sarah Johnson',
    volunteerId: null,
    volunteerName: null,
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-10T10:00:00Z')),
    deadline: admin.firestore.Timestamp.fromDate(new Date('2024-02-15T18:00:00Z')),
    completedAt: null,
    rating: null,
    review: null
  },
  {
    id: 'task2',
    title: 'House Cleaning',
    description: 'Weekly house cleaning and tidying up',
    type: 'housework',
    status: 'in_progress',
    priority: 'high',
    location: 'North Melbourne',
    elderlyId: 'user2',
    elderlyName: 'Robert Smith',
    volunteerId: 'user3',
    volunteerName: 'Emma Wilson',
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-08T14:30:00Z')),
    deadline: admin.firestore.Timestamp.fromDate(new Date('2024-02-12T17:00:00Z')),
    completedAt: null,
    rating: null,
    review: null
  },
  {
    id: 'task3',
    title: 'Companionship Visit',
    description: 'Looking for someone to chat and have tea with',
    type: 'companionship',
    status: 'completed',
    priority: 'low',
    location: 'South Yarra',
    elderlyId: 'user1',
    elderlyName: 'Sarah Johnson',
    volunteerId: 'user4',
    volunteerName: 'James Brown',
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-05T09:15:00Z')),
    deadline: admin.firestore.Timestamp.fromDate(new Date('2024-02-07T16:00:00Z')),
    completedAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-07T15:30:00Z')),
    rating: 5,
    review: 'Excellent service, very friendly and helpful'
  }
];

const sampleNotifications = [
  {
    id: 'notif1',
    userId: 'user1',
    type: 'task_created',
    title: 'New Task Created',
    message: 'Your task "Grocery Shopping" has been created successfully',
    isRead: false,
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-10T10:00:00Z')),
    data: {
      taskId: 'task1',
      taskTitle: 'Grocery Shopping'
    }
  },
  {
    id: 'notif2',
    userId: 'user3',
    type: 'task_accepted',
    title: 'Task Accepted',
    message: 'You have accepted the task "House Cleaning"',
    isRead: false,
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-08T14:30:00Z')),
    data: {
      taskId: 'task2',
      taskTitle: 'House Cleaning'
    }
  },
  {
    id: 'notif3',
    userId: 'user2',
    type: 'task_completed',
    title: 'Task Completed',
    message: 'The task "House Cleaning" has been completed by Emma Wilson',
    isRead: true,
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-07T15:30:00Z')),
    data: {
      taskId: 'task2',
      taskTitle: 'House Cleaning',
      volunteerName: 'Emma Wilson'
    }
  }
];

const sampleRatings = [
  {
    id: 'rating1',
    volunteerId: 'user4',
    volunteerName: 'James Brown',
    elderlyId: 'user1',
    elderlyName: 'Sarah Johnson',
    taskId: 'task3',
    taskTitle: 'Companionship Visit',
    rating: 5,
    review: 'James was wonderful company. We had a lovely chat over tea and he was very patient and kind. Highly recommend!',
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-07T16:00:00Z')),
    isVerified: true,
    helpfulCount: 1,
    reportCount: 0
  }
];

// Initialize data
async function initializeData() {
  try {
    console.log('Starting data initialization...');

    // Add users
    console.log('Adding users...');
    for (const user of sampleUsers) {
      await db.collection('users').doc(user.id).set(user);
    }

    // Add tasks
    console.log('Adding tasks...');
    for (const task of sampleTasks) {
      await db.collection('tasks').doc(task.id).set(task);
    }

    // Add notifications
    console.log('Adding notifications...');
    for (const notification of sampleNotifications) {
      await db.collection('notifications').doc(notification.id).set(notification);
    }

    // Add ratings
    console.log('Adding ratings...');
    for (const rating of sampleRatings) {
      await db.collection('ratings').doc(rating.id).set(rating);
    }

    console.log('Data initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
}

// Run initialization
initializeData();
