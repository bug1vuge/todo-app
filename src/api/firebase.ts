// Импортируем необходимые функции из SDK Firebase
import { initializeApp } from "firebase/app"; // Для инициализации Firebase приложения
import { getAuth } from "firebase/auth"; // Для работы с аутентификацией
import { getFirestore } from "firebase/firestore"; // Для работы с Firestore (базой данных)

// Конфигурация Firebase приложения, берём значения из переменных окружения
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // API ключ проекта Firebase
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // Домен для аутентификации
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, // ID проекта Firebase
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // Хранилище файлов Firebase
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // ID отправителя сообщений (для Cloud Messaging)
  appId: import.meta.env.VITE_FIREBASE_APP_ID, // ID приложения
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? undefined, // ID для аналитики (может быть undefined)
};

// Инициализация Firebase приложения с конфигурацией
const app = initializeApp(firebaseConfig);

// Получаем экземпляры сервисов Firebase для дальнейшего использования в приложении
export const auth = getAuth(app); // Экземпляр аутентификации
export const db = getFirestore(app); // Экземпляр базы данных Firestore
