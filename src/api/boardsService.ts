import { db } from "./firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, arrayUnion, query, where } from "firebase/firestore";

export interface Board {
  id: string;
  ownerId: string;
  name: string;
  createdAt: number;
  members: string[]; // массив uid участников
}

export const fetchUserBoards = async (userId: string): Promise<Board[]> => {
  try {
    const q1 = query(collection(db, "boards"), where("ownerId", "==", userId));
    const q2 = query(collection(db, "boards"), where("members", "array-contains", userId));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const boards = [...snap1.docs, ...snap2.docs].map(doc => ({ id: doc.id, ...doc.data() } as Board));
    return boards.filter((board, index, self) => self.findIndex(b => b.id === board.id) === index);
  } catch (error) {
    console.error("Ошибка загрузки досок:", error);
    return [];
  }
};

export const createBoard = async (userId: string, name: string): Promise<Board> => {
  const boardsRef = collection(db, "boards");
  const newBoard = {
    ownerId: userId,
    name,
    createdAt: Date.now(),
    members: [],
  };
  const docRef = await addDoc(boardsRef, newBoard);
  return { id: docRef.id, ...newBoard } as Board;
};

export const updateBoardNameInFirestore = async (boardId: string, newName: string): Promise<void> => {
  const boardRef = doc(db, "boards", boardId);
  await updateDoc(boardRef, { name: newName });
};

export const deleteBoardWithAllData = async (boardId: string): Promise<void> => {
  const tasksRef = collection(db, "boards", boardId, "tasks");
  const tasksSnapshot = await getDocs(tasksRef);
  await Promise.all(tasksSnapshot.docs.map(doc => deleteDoc(doc.ref)));

  const metadataRef = collection(db, "boards", boardId, "metadata");
  const metadataSnapshot = await getDocs(metadataRef);
  await Promise.all(metadataSnapshot.docs.map(doc => deleteDoc(doc.ref)));

  const settingsRef = collection(db, "boards", boardId, "settings");
  const settingsSnapshot = await getDocs(settingsRef);
  await Promise.all(settingsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

  const boardRef = doc(db, "boards", boardId);
  await deleteDoc(boardRef);
};

export const addMemberToBoardService = async (boardId: string, email: string): Promise<void> => {
  const usersMetaRef = collection(db, "usersMeta");
  const q = query(usersMetaRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error("Пользователь не найден");
  const userUid = snapshot.docs[0].id;
  const boardRef = doc(db, "boards", boardId);
  await updateDoc(boardRef, {
    members: arrayUnion(userUid),
  });
};