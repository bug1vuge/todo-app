import { db } from "./firebase";
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
} from "firebase/firestore";
import type { Task } from "../features/tasks/tasksSlice";

// Вспомогательная функция для приведения данных задачи к формату Task
const transformTaskData = (doc: any): Task => {
  const data = doc.data();
  const id = doc.id;

  // Определяем статус: если есть поле status, используем его, иначе смотрим completed
  let status: Task["status"] = "Planned";
  if (data.status && ["Planned", "InProgress", "Done"].includes(data.status)) {
    status = data.status;
  } else if (data.completed === true) {
    status = "Done";
  } else if (data.completed === false) {
    status = "Planned";
  }

  // Приводим priority к правильному регистру (Low, Medium, High)
  let priority: Task["priority"] = "Medium";
  if (data.priority) {
    const p = data.priority.toLowerCase();
    if (p === "low") priority = "Low";
    else if (p === "medium") priority = "Medium";
    else if (p === "high") priority = "High";
  }

  return {
    id,
    userId: data.userId || "",
    title: data.title || "Без названия",
    description: data.description || "",
    status,
    priority,
    dueDate: data.dueDate || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  } as Task;
};

export const fetchTasksFromFirestore = async (userId: string): Promise<Task[]> => {
  console.log("📥 fetchTasksFromFirestore called with userId:", userId);
  try {
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("userId", "==", userId));
    console.log("📥 Executing Firestore query...");
    const querySnapshot = await getDocs(q);
    console.log(`📥 Query successful. Found ${querySnapshot.size} documents.`);

    const tasks = querySnapshot.docs.map((doc) => {
      console.log("📄 Raw document data:", doc.id, doc.data());
      const task = transformTaskData(doc);
      console.log("🔄 Transformed task:", task);
      return task;
    });

    console.log("📦 Returning tasks array:", tasks);
    return tasks;
  } catch (error) {
    console.error("❌ Error in fetchTasksFromFirestore:", error);
    throw error;
  }
};

export const addTaskToFirestore = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
  console.log("➕ addTaskToFirestore called with data:", taskData);
  try {
    const tasksRef = collection(db, "tasks");
    const docData = {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    console.log("➕ Adding document with data:", docData);
    const docRef = await addDoc(tasksRef, docData);
    console.log("✅ Document added with ID:", docRef.id);

    const result = {
      id: docRef.id,
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log("📦 Returning new task:", result);
    return result;
  } catch (error) {
    console.error("❌ Error in addTaskToFirestore:", error);
    throw error;
  }
};

export const updateTaskInFirestore = async (id: string, updates: Partial<Task>) => {
  console.log("✏️ updateTaskInFirestore called for id:", id, "updates:", updates);
  try {
    const taskRef = doc(db, "tasks", id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    console.log("✏️ Updating with data:", updateData);
    await updateDoc(taskRef, updateData);
    console.log("✅ Document updated successfully");
    return { id, ...updates };
  } catch (error) {
    console.error("❌ Error in updateTaskInFirestore:", error);
    throw error;
  }
};

export const updateTaskStatusInFirestore = async (taskId: string, status: string) => {
  console.log("🔄 updateTaskStatusInFirestore called for taskId:", taskId, "new status:", status);
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Status updated successfully");
  } catch (error) {
    console.error("❌ Error in updateTaskStatusInFirestore:", error);
    throw error;
  }
};

export const deleteTaskFromFirestore = async (id: string) => {
  console.log("🗑️ deleteTaskFromFirestore called for id:", id);
  try {
    const taskRef = doc(db, "tasks", id);
    await deleteDoc(taskRef);
    console.log("✅ Document deleted successfully");
  } catch (error) {
    console.error("❌ Error in deleteTaskFromFirestore:", error);
    throw error;
  }
};