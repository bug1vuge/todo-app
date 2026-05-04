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
  Timestamp,
} from "firebase/firestore";
import type { Task } from "../features/tasks/tasksSlice";

// Вспомогательная функция для приведения данных задачи к формату Task
const transformTaskData = (doc: any): Task => {
  const data = doc.data();
  const id = doc.id;

  // ✅ Статус – любая строка (берём из БД, если нет – "Planned")
  const status: string = data.status || "Planned";

  // Приводим priority к правильному регистру (Low, Medium, High)
  let priority: Task["priority"] = "Medium";
  if (data.priority) {
    const p = data.priority.toLowerCase();
    if (p === "low") priority = "Low";
    else if (p === "medium") priority = "Medium";
    else if (p === "high") priority = "High";
  }

  // ✅ Преобразуем Timestamp в Date (или оставляем null)
  const convertTimestamp = (value: any): Date | null => {
    if (value instanceof Timestamp) return value.toDate();
    if (value instanceof Date) return value;
    return null;
  };

  return {
    id,
    userId: data.userId || "",
    title: data.title || "Без названия",
    description: data.description || "",
    status,
    priority,
    dueDate: convertTimestamp(data.dueDate),
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as Task;
};

export const fetchTasksFromFirestore = async (userId: string): Promise<Task[]> => {
  console.log("📥 fetchTasksFromFirestore called with userId:", userId);
  try {
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    console.log(`📥 Query successful. Found ${querySnapshot.size} documents.`);

    const tasks = querySnapshot.docs.map((doc) => {
      console.log("📄 Raw document data:", doc.id, doc.data());
      const task = transformTaskData(doc);
      console.log("🔄 Transformed task:", task);
      return task;
    });

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
    const docRef = await addDoc(tasksRef, docData);
    console.log("✅ Document added with ID:", docRef.id);

    // Возвращаем задачу с клиентским Date (для немедленного использования)
    const result = {
      id: docRef.id,
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
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
    // Убираем поля, которые не нужно отправлять в Firestore (например, даты как Date)
    const { createdAt, updatedAt, ...cleanUpdates } = updates;
    const updateData = {
      ...cleanUpdates,
      updatedAt: serverTimestamp(),
    };
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