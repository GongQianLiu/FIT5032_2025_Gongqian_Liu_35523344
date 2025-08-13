// Firebase configuration and initialization
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlVGjG7MaJp6t0uhdaTI37qVnWkOMYV8I",
  authDomain: "the-lab7-of-gongqianliu.firebaseapp.com",
  projectId: "the-lab7-of-gongqianliu",
  storageBucket: "week7-yiwei.appspot.com",
  messagingSenderId: "97239204131",
  appId: "1:97239204131:web:f9ae8c902f3d405f7acc96"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

// Export db as both named export and default export
export { db }
export default db


 