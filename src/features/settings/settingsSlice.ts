import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBoardSettings,
  updateBoardBackgroundSettings,
} from "../../api/settingsService";
import type { BackgroundSettings } from "../../api/settingsService";

interface SettingsState {
  settings: { background?: BackgroundSettings } | null;
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
  async (boardId: string) => {
    return await fetchBoardSettings(boardId);
  }
);

export const updateBackground = createAsyncThunk(
  "settings/updateBackground",
  async ({ boardId, background }: { boardId: string; background: BackgroundSettings }) => {
    await updateBoardBackgroundSettings(boardId, background);
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
        if (state.settings) {
          state.settings.background = action.payload;
        } else {
          state.settings = { background: action.payload };
        }
      });
  },
});

export default settingsSlice.reducer;