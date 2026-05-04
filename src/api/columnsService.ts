import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Column } from "../features/columns/columnsSlice";

const DEFAULT_COLUMNS: Column[] = [
  { id: "Planned", title: "Сделать" },
  { id: "InProgress", title: "В процессе" },
  { id: "Done", title: "Сделано" },
];

export const fetchUserColumns = async (userId: string): Promise<Column[]> => {
  try {
    const docRef = doc(db, "userColumns", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.columns && Array.isArray(data.columns) && data.columns.length > 0) {
        return data.columns;
      }
    }
    // Если нет документа или колонок – возвращаем дефолтные
    console.log("Колонки не найдены, загружаем стандартные");
    return DEFAULT_COLUMNS;
  } catch (error) {
    console.error("Ошибка загрузки колонок:", error);
    return DEFAULT_COLUMNS; // при любой ошибке тоже отдаём дефолт
  }
};

export const saveUserColumns = async (userId: string, columns: Column[]): Promise<void> => {
  try {
    const docRef = doc(db, "userColumns", userId);
    await setDoc(docRef, { columns }, { merge: true });
  } catch (error) {
    console.error("Ошибка сохранения колонок:", error);
    throw error;
  }
};