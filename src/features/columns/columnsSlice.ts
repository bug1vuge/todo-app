import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateTaskStatusInFirestore } from '../../api/taskService';
import {
  fetchBoardColumns,
  saveBoardColumns,
  addColumnToBoard,
  updateColumnTitleInBoard,
  deleteColumnFromBoard,
} from '../../api/columnsService';
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

const DEFAULT_COLUMNS: Column[] = [
  { id: 'Planned', title: 'Сделать' },
  { id: 'InProgress', title: 'В процессе' },
  { id: 'Done', title: 'Сделано' },
];

const initialState: ColumnsState = {
  columns: [],
  loading: false,
  error: null,
};

export const loadColumns = createAsyncThunk(
  'columns/load',
  async ({ boardId }: { boardId: string }) => {
    let cols = await fetchBoardColumns(boardId);
    if (!cols.length) {
      cols = DEFAULT_COLUMNS;
      await saveBoardColumns(boardId, cols);
    }
    return cols;
  }
);

export const addColumnAsync = createAsyncThunk<
  Column,
  { boardId: string; title: string },
  { state: RootState }
>('columns/addColumnAsync', async ({ boardId, title }) => {
  const newId = `col_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newColumn: Column = { id: newId, title: title.trim() };
  await addColumnToBoard(boardId, newColumn);
  return newColumn;
});

export const updateColumnTitleAsync = createAsyncThunk<
  Column,
  { boardId: string; columnId: string; newTitle: string }
>('columns/updateColumnTitleAsync', async ({ boardId, columnId, newTitle }) => {
  await updateColumnTitleInBoard(boardId, columnId, newTitle);
  return { id: columnId, title: newTitle };
});

export const deleteColumnWithTasks = createAsyncThunk<
  string,
  { boardId: string; columnId: string; targetColumnId?: string },
  { state: RootState }
>('columns/deleteColumnWithTasks', async ({ boardId, columnId, targetColumnId = 'Planned' }, { getState }) => {
  const state = getState();
  const tasks = state.tasks.tasks;
  const tasksToMove = tasks.filter(t => t.status === columnId);
  await Promise.all(tasksToMove.map(task => updateTaskStatusInFirestore(task.id, targetColumnId, boardId)));
  await deleteColumnFromBoard(boardId, columnId);
  return columnId;
});

const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(addColumnAsync.fulfilled, (state, action) => {
        state.columns.push(action.payload);
      })
      .addCase(updateColumnTitleAsync.fulfilled, (state, action) => {
        const idx = state.columns.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.columns[idx] = action.payload;
      })
      .addCase(deleteColumnWithTasks.fulfilled, (state, action) => {
        state.columns = state.columns.filter(c => c.id !== action.payload);
      });
  },
});

export default columnsSlice.reducer;