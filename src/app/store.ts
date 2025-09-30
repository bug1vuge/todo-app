// Импортируем функцию для создания Redux Store
import { configureStore } from "@reduxjs/toolkit";
// Импорт редьюсеров для разных фич приложения
import authReducer from "../features/auth/authSlice"; // Редьюсер для управления аутентификацией
import tasksReducer from "../features/tasks/tasksSlice"; // Редьюсер для управления задачами

// Создаём глобальный Redux Store
export const store = configureStore({
  reducer: {
    auth: authReducer,   // Добавляем редьюсер auth под ключ "auth"
    tasks: tasksReducer, // Добавляем редьюсер tasks под ключ "tasks"
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Отключаем проверку сериализуемости для middleware (нужно, если в state хранятся нестандартные объекты, например, даты)
    }),
  devTools: import.meta.env.DEV, // Включаем Redux DevTools только в режиме разработки
});

// Тип состояния всего Store, который будет использоваться в приложении для TypeScript
export type RootState = ReturnType<typeof store.getState>;
// Тип dispatch функции, используемый для корректной типизации при вызове dispatch
export type AppDispatch = typeof store.dispatch;
