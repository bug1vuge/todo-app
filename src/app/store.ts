import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import tasksReducer from "../features/tasks/tasksSlice";
import settingsReducer from "../features/settings/settingsSlice";
import columnsReducer from "../features/columns/columnsSlice";
import boardsReducer from "../features/boards/boardsSlice"; // добавьте

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    settings: settingsReducer,
    columns: columnsReducer,
    boards: boardsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;