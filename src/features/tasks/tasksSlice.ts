import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { db } from "../../api/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";

// Тип приоритета задачи
export type Priority = "low" | "medium" | "high";

// Интерфейс задачи
export interface Task {
  id: string; // ID документа в Firestore
  title: string; // Название задачи
  description?: string; // Описание задачи
  completed: boolean; // Статус выполнения
  priority: Priority; // Приоритет
  createdAt?: any; // Дата создания
  updatedAt?: any; // Дата последнего обновления
  userId: string; // ID пользователя, которому принадлежит задача
}

// Состояние Redux для задач
interface TasksState {
  items: Task[]; // массив задач
  status: "idle" | "loading" | "succeeded" | "failed"; // статус асинхронных операций
  error?: string | null; // ошибка при операциях
}

const initialState: TasksState = {
  items: [],
  status: "idle",
  error: null,
};

// ----------------- Асинхронные действия -----------------

// Получение задач пользователя
export const fetchTasks = createAsyncThunk<Task[], string, { rejectValue: string }>(
  "tasks/fetchTasks",
  async (userId, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
      );
      const snap = await getDocs(q);
      // Преобразуем документы Firestore в массив Task
      const tasks: Task[] = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as DocumentData) }) as Task
      );
      return tasks;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Ошибка загрузки задач");
    }
  }
);

// Добавление новой задачи
export const addTask = createAsyncThunk<
  Task,
  { title: string; description?: string; priority?: Priority; userId: string },
  { rejectValue: string }
>(
  "tasks/addTask",
  async ({ title, description, priority = "medium", userId }, { rejectWithValue }) => {
    try {
      const ref = await addDoc(collection(db, "tasks"), {
        title,
        description: description ?? "",
        completed: false,
        priority,
        userId,
        createdAt: Date.now(),
        updatedAt: serverTimestamp(),
      });
      return {
        id: ref.id,
        title,
        description: description ?? "",
        completed: false,
        priority,
        userId,
        createdAt: Date.now(),
      } as Task;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Ошибка добавления задачи");
    }
  }
);

// Обновление задачи
export const updateTask = createAsyncThunk<Task, { id: string; updates: Partial<Task> }, { rejectValue: string }>(
  "tasks/updateTask",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const ref = doc(db, "tasks", id);
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
      return { id, ...(updates as any) } as Task;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Ошибка обновления задачи");
    }
  }
);

// Удаление задачи
export const removeTask = createAsyncThunk<string, string, { rejectValue: string }>(
  "tasks/removeTask",
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Ошибка удаления задачи");
    }
  }
);

// ----------------- Slice -----------------
const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Очистка всех задач
    clearTasks(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (s) => {
        s.status = "loading"; // загрузка
      })
      .addCase(fetchTasks.fulfilled, (s, a: PayloadAction<Task[]>) => {
        s.status = "succeeded"; // успешно загружено
        s.items = a.payload; // сохраняем задачи
      })
      .addCase(fetchTasks.rejected, (s, a) => {
        s.status = "failed"; // ошибка загрузки
        s.error = a.payload as string;
      })
      // addTask
      .addCase(addTask.fulfilled, (s, a) => {
        s.items.unshift(a.payload); // добавляем новую задачу в начало списка
      })
      // updateTask
      .addCase(updateTask.fulfilled, (s, a) => {
        // обновляем существующую задачу
        s.items = s.items.map((t) =>
          t.id === a.payload.id ? { ...t, ...(a.payload as any) } : t
        );
      })
      // removeTask
      .addCase(removeTask.fulfilled, (s, a) => {
        // удаляем задачу из массива
        s.items = s.items.filter((t) => t.id !== a.payload);
      });
  },
});

export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
