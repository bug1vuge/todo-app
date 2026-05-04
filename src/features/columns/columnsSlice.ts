import { createSlice, createAsyncThunk, } from '@reduxjs/toolkit';
import { updateTaskStatusInFirestore } from '../../api/taskService';
import { fetchUserColumns, saveUserColumns } from '../../api/columnsService';
import type { RootState } from '../../app/store';

export interface Column {
  id: string;
  title: string;
}

interface ColumnsState {
  columns: Column[];
  loading: boolean;
  error: string | null;
}

const initialState: ColumnsState = {
  columns: [],
  loading: false,
  error: null,
};

// Загрузка колонок
export const loadColumns = createAsyncThunk(
  'columns/load',
  async (userId: string) => {
    return await fetchUserColumns(userId);
  }
);

// Добавление колонки (сразу сохраняем)
export const addColumnAsync = createAsyncThunk<
  Column, // возвращаем добавленную колонку
  { userId: string; title: string },
  { state: RootState; rejectValue: string }
>('columns/addColumnAsync', async ({ userId, title }, { getState, rejectWithValue }) => {
  try {
    const newId = `col_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newColumn: Column = { id: newId, title: title.trim() };
    const currentColumns = getState().columns.columns;
    const updatedColumns = [...currentColumns, newColumn];
    await saveUserColumns(userId, updatedColumns);
    return newColumn;
  } catch (error) {
    return rejectWithValue('Ошибка при добавлении колонки');
  }
});

// Редактирование названия колонки (сразу сохраняем)
export const updateColumnTitleAsync = createAsyncThunk<
  Column, // возвращаем обновлённую колонку
  { userId: string; columnId: string; newTitle: string },
  { state: RootState; rejectValue: string }
>('columns/updateColumnTitleAsync', async ({ userId, columnId, newTitle }, { getState, rejectWithValue }) => {
  try {
    const currentColumns = getState().columns.columns;
    const updatedColumns = currentColumns.map(col =>
      col.id === columnId ? { ...col, title: newTitle.trim() } : col
    );
    await saveUserColumns(userId, updatedColumns);
    return { id: columnId, title: newTitle.trim() };
  } catch (error) {
    return rejectWithValue('Ошибка при обновлении названия');
  }
});

// Удаление колонки с перемещением задач
export const deleteColumnWithTasks = createAsyncThunk<
  string,
  { columnId: string; userId: string; targetColumnId?: string },
  { state: RootState; rejectValue: string }
>('columns/deleteColumnWithTasks', async ({ columnId, userId, targetColumnId = 'Planned' }, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const tasks = state.tasks.tasks;
    const tasksToMove = tasks.filter(t => t.status === columnId);
    await Promise.all(tasksToMove.map(task => 
      updateTaskStatusInFirestore(task.id, targetColumnId)
    ));
    const newColumns = state.columns.columns.filter(col => col.id !== columnId);
    await saveUserColumns(userId, newColumns);
    return columnId;
  } catch (error) {
    return rejectWithValue('Не удалось удалить колонку');
  }
});

const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    // Синхронные редьюсеры больше не используем для изменений, оставляем только для очистки
    resetColumns: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Загрузка
      .addCase(loadColumns.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadColumns.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = action.payload;
      })
      .addCase(loadColumns.rejected, (state) => {
        state.loading = false;
        state.error = 'Ошибка загрузки колонок';
      })
      // Добавление
      .addCase(addColumnAsync.fulfilled, (state, action) => {
        state.columns.push(action.payload);
      })
      .addCase(addColumnAsync.rejected, (_, action) => {
        console.error(action.payload);
      })
      // Редактирование
      .addCase(updateColumnTitleAsync.fulfilled, (state, action) => {
        const index = state.columns.findIndex(col => col.id === action.payload.id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      .addCase(updateColumnTitleAsync.rejected, (_, action) => {
        console.error(action.payload);
      })
      // Удаление
      .addCase(deleteColumnWithTasks.fulfilled, (state, action) => {
        state.columns = state.columns.filter(col => col.id !== action.payload);
      });
  },
});

export const { resetColumns } = columnsSlice.actions;
export default columnsSlice.reducer;