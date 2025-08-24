import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase配置 - 请将这里的配置替换为您在 Firebase 控制台获取的实际配置
const firebaseConfig = {
  apiKey: "AIzaSyDBYlP47tNZXEVjzMqRIYAu5MhQrAkAOP4",
  authDomain: "old-serice.firebaseapp.com",
  projectId: "old-serice",
  storageBucket: "old-serice.firebasestorage.app",
  messagingSenderId: "401306106227",
  appId: "1:401306106227:web:7874cc9fe46fb37a0e6d06"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 初始化Firebase服务
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
