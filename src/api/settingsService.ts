import { db, storage } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore"; // убрали updateDoc
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface BackgroundSettings {
  type: "color" | "image";
  value: string;
}

export interface UserSettings {
  background: BackgroundSettings;
}

export const fetchUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const docRef = doc(db, "userSettings", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserSettings;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw error;
  }
};

export const updateBackgroundSettings = async (userId: string, background: BackgroundSettings) => {
  try {
    const docRef = doc(db, "userSettings", userId);
    await setDoc(docRef, { background }, { merge: true });
  } catch (error) {
    console.error("Error updating background settings:", error);
    throw error;
  }
};

export const uploadBackgroundImage = async (userId: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `backgrounds/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error uploading background image:", error);
    throw error;
  }
};