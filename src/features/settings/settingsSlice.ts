import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchUserSettings,
  updateBackgroundSettings,
  uploadBackgroundImage,
} from "../../api/settingsService";
import type { BackgroundSettings, UserSettings } from "../../api/settingsService";

interface SettingsState {
  settings: UserSettings | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  status: "idle",
  error: null,
};

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (userId: string) => {
    return await fetchUserSettings(userId);
  }
);

export const updateBackground = createAsyncThunk(
  "settings/updateBackground",
  async ({ userId, background }: { userId: string; background: BackgroundSettings }) => {
    await updateBackgroundSettings(userId, background);
    return background;
  }
);

export const uploadImageAndUpdateBackground = createAsyncThunk(
  "settings/uploadImageAndUpdateBackground",
  async ({ userId, file }: { userId: string; file: File }) => {
    const url = await uploadBackgroundImage(userId, file);
    const background: BackgroundSettings = { type: "image", value: url };
    await updateBackgroundSettings(userId, background);
    return background;
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Ошибка загрузки настроек";
      })
      .addCase(updateBackground.fulfilled, (state, action) => {
        state.settings = { background: action.payload };
      })
      .addCase(uploadImageAndUpdateBackground.fulfilled, (state, action) => {
        state.settings = { background: action.payload };
      });
  },
});

export default settingsSlice.reducer;