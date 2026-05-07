import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchUserBoards, createBoard, deleteBoardWithAllData, updateBoardNameInFirestore, addMemberToBoardService, type Board } from "../../api/boardsService";

interface BoardsState {
  list: Board[];
  currentBoardId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: BoardsState = {
  list: [],
  currentBoardId: null,
  loading: true,
  error: null,
};

export const loadBoards = createAsyncThunk(
  "boards/load",
  async (userId: string) => {
    return await fetchUserBoards(userId);
  }
);

export const addBoard = createAsyncThunk(
  "boards/add",
  async ({ userId, name }: { userId: string; name: string }) => {
    return await createBoard(userId, name);
  }
);

export const updateBoardName = createAsyncThunk(
  "boards/updateName",
  async ({ boardId, newName }: { boardId: string; newName: string }) => {
    await updateBoardNameInFirestore(boardId, newName);
    return { boardId, newName };
  }
);

export const deleteBoard = createAsyncThunk(
  "boards/delete",
  async (boardId: string) => {
    await deleteBoardWithAllData(boardId);
    return boardId;
  }
);

export const addMemberToBoard = createAsyncThunk(
  "boards/addMember",
  async ({ boardId, email }: { boardId: string; email: string }) => {
    await addMemberToBoardService(boardId, email);
    return { boardId, email };
  }
);

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    setCurrentBoard(state, action: PayloadAction<string>) {
      state.currentBoardId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBoards.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(loadBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка загрузки досок";
      })
      .addCase(addBoard.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.currentBoardId = action.payload.id;
        state.loading = false;
      })
      .addCase(updateBoardName.fulfilled, (state, action) => {
        const { boardId, newName } = action.payload;
        const board = state.list.find(b => b.id === boardId);
        if (board) board.name = newName;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.list = state.list.filter(b => b.id !== action.payload);
        if (state.currentBoardId === action.payload) {
          state.currentBoardId = state.list.length > 0 ? state.list[0].id : null;
        }
      })
      .addCase(addMemberToBoard.fulfilled, () => {
        // можно перезагрузить доски или просто показать сообщение (уже показано в компоненте)
      });
  },
});

export const { setCurrentBoard } = boardsSlice.actions;
export default boardsSlice.reducer;