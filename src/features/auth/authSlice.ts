import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { auth } from "../../api/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Тип состояния пользователя: либо объект с uid/email, либо null (не авторизован)
type UserState = { uid: string; email?: string } | null;

// Тип состояния аутентификации
interface AuthState {
  user: UserState; // текущий пользователь
  status: "idle" | "loading" | "succeeded" | "failed"; // статус запроса
  error?: string | null; // ошибка, если есть
  initialized: boolean; // флаг, что auth инициализирован
}

// Начальное состояние
const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  initialized: false
};

// -------------------- Асинхронные операции --------------------

// Регистрация нового пользователя
export const register = createAsyncThunk<
  { uid: string; email?: string }, // возвращаемый тип при успехе
  { email: string; password: string }, // аргументы функции
  { rejectValue: string } // тип отклоненного значения
>(
  "auth/register",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return { uid: cred.user.uid, email: cred.user.email ?? undefined };
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Ошибка при регистрации");
    }
  }
);

// Вход пользователя
export const login = createAsyncThunk<
  { uid: string; email?: string },
  { email: string; password: string },
  { rejectValue: string }
>(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { uid: cred.user.uid, email: cred.user.email ?? undefined };
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Ошибка при входе");
    }
  }
);

// Выход пользователя
export const logout = createAsyncThunk("auth/logout", async () => {
  await signOut(auth);
});

// -------------------- Slice --------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Устанавливает пользователя вручную (например, после проверки токена)
    setUser(state, action: PayloadAction<UserState>) {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
      state.initialized = true;
    },
    // Очищает пользователя (например, после выхода)
    clearUser(state) {
      state.user = null;
      state.status = "succeeded"; 
      state.error = null;
      state.initialized = true; 
    },
    // Устанавливает статус загрузки
    setLoading(state) {
      state.status = "loading";
    },
    // Помечает auth как инициализированный
    setInitialized(state) {
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------------------- Регистрация --------------------
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
      // -------------------- Вход --------------------
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
      // -------------------- Выход --------------------
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.status = "idle";
      });
  },
});

// Экспорт действий
export const { setUser, clearUser, setLoading } = authSlice.actions;

// Экспорт редьюсера
export default authSlice.reducer;
