import { initializeApp } from "firebase/app"; 
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // API ключ проекта Firebase
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // Домен для аутентификации
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, // ID проекта Firebase
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // Хранилище файлов Firebase
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // ID отправителя сообщений (для Cloud Messaging)
  appId: import.meta.env.VITE_FIREBASE_APP_ID, // ID приложения
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? undefined, // ID для аналитики (может быть undefined)
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app);
export const storage = getStorage(app);
