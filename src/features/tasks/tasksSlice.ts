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
  userId: string;
  title: string;
  description: string;
  status: "Planned" | "InProgress" | "Done";
  priority: "Low" | "Medium" | "High";
  dueDate?: any;
  createdAt: any;
  updatedAt: any;
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
  async (userId: string) => {
    console.log("🚀 fetchTasks thunk started for userId:", userId);
    try {
      const tasks = await fetchTasksFromFirestore(userId);
      console.log("✅ fetchTasks thunk completed, tasks count:", tasks.length);
      return tasks;
    } catch (error) {
      console.error("❌ fetchTasks thunk caught error:", error);
      throw error;
    }
  }
);

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    console.log("➕ addTask thunk started with data:", taskData);
    try {
      const newTask = await addTaskToFirestore(taskData);
      console.log("✅ addTask thunk completed, new task:", newTask);
      return newTask;
    } catch (error) {
      console.error("❌ addTask thunk caught error:", error);
      throw error;
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, ...updates }: Partial<Task> & { id: string }) => {
    console.log("✏️ updateTask thunk started for id:", id, "updates:", updates);
    try {
      const updated = await updateTaskInFirestore(id, updates);
      console.log("✅ updateTask thunk completed, updated task:", updated);
      return updated;
    } catch (error) {
      console.error("❌ updateTask thunk caught error:", error);
      throw error;
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id: string) => {
    console.log("🗑️ deleteTask thunk started for id:", id);
    try {
      await deleteTaskFromFirestore(id);
      console.log("✅ deleteTask thunk completed");
      return id;
    } catch (error) {
      console.error("❌ deleteTask thunk caught error:", error);
      throw error;
    }
  }
);

export const moveTask = createAsyncThunk(
  "tasks/moveTask",
  async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
    console.log("🔄 moveTask thunk started for taskId:", taskId, "newStatus:", newStatus);
    try {
      await updateTaskStatusInFirestore(taskId, newStatus);
      console.log("✅ moveTask thunk completed");
      return { taskId, newStatus };
    } catch (error) {
      console.error("❌ moveTask thunk caught error:", error);
      throw error;
    }
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
        console.log("⏳ fetchTasks pending");
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
        console.log("✅ fetchTasks fulfilled, tasks count:", action.payload.length);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Ошибка загрузки";
        console.error("❌ fetchTasks rejected:", action.error);
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
        console.log("✅ addTask fulfilled, new task:", action.payload);
      })
      .addCase(addTask.rejected, (_state, action) => {
        console.error("❌ addTask rejected:", action.error);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const task = state.tasks.find((t) => t.id === action.payload.id);
        if (task) {
          Object.assign(task, action.payload);
        }
        console.log("✅ updateTask fulfilled, updated task:", action.payload);
      })
      .addCase(updateTask.rejected, (_state, action) => {
        console.error("❌ updateTask rejected:", action.error);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        console.log("✅ deleteTask fulfilled, removed id:", action.payload);
      })
      .addCase(deleteTask.rejected, (_state, action) => {
        console.error("❌ deleteTask rejected:", action.error);
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const { taskId, newStatus } = action.payload;
        const task = state.tasks.find((t) => t.id === taskId);
        if (task) {
          task.status = newStatus as Task["status"];
        }
        console.log("✅ moveTask fulfilled:", action.payload);
      })
      .addCase(moveTask.rejected, (_state, action) => {
        console.error("❌ moveTask rejected:", action.error);
      });
  },
});

export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;