import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { auth } from "../../api/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

type UserState = { uid: string; email?: string } | null;

interface AuthState {
  user: UserState;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  initialized: false,
};

// -------------------- Существующие thunks --------------------
export const register = createAsyncThunk<
  { uid: string; email?: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/register", async ({ email, password }, { rejectWithValue }) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, email: cred.user.email ?? undefined };
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Ошибка при регистрации");
  }
});

export const login = createAsyncThunk<
  { uid: string; email?: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, email: cred.user.email ?? undefined };
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Ошибка при входе");
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await signOut(auth);
});

// -------------------- Новые thunks для смены email/пароля --------------------
export const updateUserEmail = createAsyncThunk<
  { email: string },
  { newEmail: string; password: string },
  { rejectValue: string }
>("auth/updateUserEmail", async ({ newEmail, password }, { rejectWithValue }) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Пользователь не авторизован");
    if (!user.email) throw new Error("Email не найден");

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await updateEmail(user, newEmail);

    return { email: newEmail };
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Ошибка при смене email");
  }
});

export const updateUserPassword = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>("auth/updateUserPassword", async ({ currentPassword, newPassword }, { rejectWithValue }) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Пользователь не авторизован");
    if (!user.email) throw new Error("Email не найден");

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Ошибка при смене пароля");
  }
});

// -------------------- Slice --------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
      state.initialized = true;
    },
    clearUser(state) {
      state.user = null;
      state.status = "succeeded";
      state.error = null;
      state.initialized = true;
    },
    setLoading(state) {
      state.status = "loading";
    },
    setInitialized(state) {
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload;
      })
      .addCase(register.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(login.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload;
      })
      .addCase(login.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.status = "idle";
      })
      .addCase(updateUserEmail.fulfilled, (s, a) => {
        if (s.user) {
          s.user.email = a.payload.email;
        }
      })
      .addCase(updateUserEmail.rejected, (_state, action) => {
        console.error("Ошибка смены email:", action.payload);
      })
      .addCase(updateUserPassword.rejected, (_state, action) => {
        console.error("Ошибка смены пароля:", action.payload);
      });
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;