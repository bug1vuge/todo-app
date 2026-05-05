import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { Task } from "../features/tasks/tasksSlice";

const getTasksCollection = (boardId: string) => collection(db, "boards", boardId, "tasks");

const convertTimestamp = (value: any): Date | null => {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
};

const transformTaskData = (doc: any, boardId: string): Task => {
  const data = doc.data();
  return {
    id: doc.id,
    boardId,
    title: data.title || "Без названия",
    description: data.description || "",
    status: data.status || "Planned",
    priority: data.priority || "Medium",
    dueDate: convertTimestamp(data.dueDate),
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as Task;
};

export const fetchTasksFromFirestore = async (boardId: string): Promise<Task[]> => {
  try {
    const tasksRef = getTasksCollection(boardId);
    const snapshot = await getDocs(tasksRef);
    return snapshot.docs.map((doc) => transformTaskData(doc, boardId));
  } catch (error) {
    console.error("fetchTasksFromFirestore error:", error);
    throw error;
  }
};

export const addTaskToFirestore = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
  try {
    const { boardId, ...data } = taskData;
    const tasksRef = getTasksCollection(boardId);
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(tasksRef, docData);
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Task;
  } catch (error) {
    console.error("addTaskToFirestore error:", error);
    throw error;
  }
};

export const updateTaskInFirestore = async (id: string, updates: Partial<Task>) => {
  try {
    const { boardId, ...cleanUpdates } = updates;
    if (!boardId) throw new Error("boardId is required for update");
    const taskRef = doc(getTasksCollection(boardId), id);
    const updateData = {
      ...cleanUpdates,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(taskRef, updateData);
    return { id, ...cleanUpdates };
  } catch (error) {
    console.error("updateTaskInFirestore error:", error);
    throw error;
  }
};

export const updateTaskStatusInFirestore = async (taskId: string, status: string, boardId: string) => {
  try {
    const taskRef = doc(getTasksCollection(boardId), taskId);
    await updateDoc(taskRef, { status, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("updateTaskStatusInFirestore error:", error);
    throw error;
  }
};

export const deleteTaskFromFirestore = async (id: string, boardId: string) => {
  try {
    const taskRef = doc(getTasksCollection(boardId), id);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("deleteTaskFromFirestore error:", error);
    throw error;
  }
};