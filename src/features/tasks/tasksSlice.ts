import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchTasksFromFirestore,
  addTaskToFirestore,
  updateTaskInFirestore,
  deleteTaskFromFirestore,
  updateTaskStatusInFirestore,
} from "../../api/taskService";

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: string;
  priority: "Low" | "Medium" | "High";
  dueDate?: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface TasksState {
  tasks: Task[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  status: "idle",
  error: null,
};

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (boardId: string) => {
    return await fetchTasksFromFirestore(boardId);
  }
);

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    return await addTaskToFirestore(taskData);
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, ...updates }: Partial<Task> & { id: string; boardId: string }) => {
    return await updateTaskInFirestore(id, updates);
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async ({ id, boardId }: { id: string; boardId: string }) => {
    await deleteTaskFromFirestore(id, boardId);
    return id;
  }
);

export const moveTask = createAsyncThunk(
  "tasks/moveTask",
  async ({ taskId, newStatus, boardId }: { taskId: string; newStatus: string; boardId: string }) => {
    await updateTaskStatusInFirestore(taskId, newStatus, boardId);
    return { taskId, newStatus };
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.tasks = [];
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Ошибка загрузки задач";
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.payload };
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const { taskId, newStatus } = action.payload;
        const task = state.tasks.find((t) => t.id === taskId);
        if (task) {
          task.status = newStatus;
        }
      });
  },
});

export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;