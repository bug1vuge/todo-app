import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface BackgroundSettings {
  type: "color" | "image";
  value: string;
}

export const fetchBoardSettings = async (boardId: string): Promise<{ background?: BackgroundSettings } | null> => {
  try {
    const docRef = doc(db, "boards", boardId, "settings", "preferences");
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error("fetchBoardSettings error:", error);
    return null;
  }
};

export const updateBoardBackgroundSettings = async (boardId: string, background: BackgroundSettings): Promise<void> => {
  const docRef = doc(db, "boards", boardId, "settings", "preferences");
  await setDoc(docRef, { background }, { merge: true });
};