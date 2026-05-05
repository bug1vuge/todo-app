import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import type { Column } from "../features/columns/columnsSlice";

const getColumnsDoc = (boardId: string) => doc(db, "boards", boardId, "metadata", "columns");

export const fetchBoardColumns = async (boardId: string): Promise<Column[]> => {
  const docRef = getColumnsDoc(boardId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data().columns || []) : [];
};

export const saveBoardColumns = async (boardId: string, columns: Column[]): Promise<void> => {
  const docRef = getColumnsDoc(boardId);
  await setDoc(docRef, { columns });
};

export const addColumnToBoard = async (boardId: string, column: Column): Promise<void> => {
  const docRef = getColumnsDoc(boardId);
  if (!(await getDoc(docRef)).exists()) {
    await setDoc(docRef, { columns: [] });
  }
  await updateDoc(docRef, {
    columns: arrayUnion(column),
  });
};

export const updateColumnTitleInBoard = async (boardId: string, columnId: string, newTitle: string): Promise<void> => {
  const docRef = getColumnsDoc(boardId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const columns = snap.data().columns as Column[];
    const updated = columns.map(col => (col.id === columnId ? { ...col, title: newTitle } : col));
    await setDoc(docRef, { columns: updated });
  }
};

export const deleteColumnFromBoard = async (boardId: string, columnId: string): Promise<void> => {
  const docRef = getColumnsDoc(boardId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const columns = snap.data().columns as Column[];
    const filtered = columns.filter(col => col.id !== columnId);
    await setDoc(docRef, { columns: filtered });
  }
};