import { db } from "./firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export interface Board {
  id: string;
  name: string;
  createdAt: number;
}

export const fetchUserBoards = async (userId: string): Promise<Board[]> => {
  try {
    const boardsRef = collection(db, "users", userId, "boards");
    const snapshot = await getDocs(boardsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
  } catch (error) {
    console.error("Ошибка загрузки досок:", error);
    return [];
  }
};

export const createBoard = async (userId: string, name: string): Promise<Board> => {
  const boardsRef = collection(db, "users", userId, "boards");
  const newBoardRef = await addDoc(boardsRef, {
    name,
    createdAt: Date.now(),
  });
  return { id: newBoardRef.id, name, createdAt: Date.now() };
};

export const updateBoardNameInFirestore = async (userId: string, boardId: string, newName: string): Promise<void> => {
  const boardDocRef = doc(db, "users", userId, "boards", boardId);
  await updateDoc(boardDocRef, { name: newName });
};

export const deleteBoardWithAllData = async (userId: string, boardId: string): Promise<void> => {
  // 1. Удаляем все задачи
  const tasksRef = collection(db, "boards", boardId, "tasks");
  const tasksSnapshot = await getDocs(tasksRef);
  await Promise.all(tasksSnapshot.docs.map(taskDoc => deleteDoc(taskDoc.ref)));

  // 2. Удаляем метаданные (колонки)
  const metadataRef = collection(db, "boards", boardId, "metadata");
  const metadataSnapshot = await getDocs(metadataRef);
  await Promise.all(metadataSnapshot.docs.map(metaDoc => deleteDoc(metaDoc.ref)));

  // 3. Удаляем настройки
  const settingsRef = collection(db, "boards", boardId, "settings");
  const settingsSnapshot = await getDocs(settingsRef);
  await Promise.all(settingsSnapshot.docs.map(settingDoc => deleteDoc(settingDoc.ref)));

  // 4. Удаляем ссылку на доску у пользователя
  const boardDocRef = doc(db, "users", userId, "boards", boardId);
  await deleteDoc(boardDocRef);
};