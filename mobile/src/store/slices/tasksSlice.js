import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await client.get(`/projects/${projectId}/tasks`);
      return { projectId, tasks: res.data.data };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch tasks.');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, title, due_date, priority, category }, { rejectWithValue }) => {
    try {
      const res = await client.post(`/projects/${projectId}/tasks`, { title, due_date, priority, category });
      return { projectId, task: res.data.data };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to create task.');
    }
  }
);

// Optimistic toggle — flip locally, revert on failure
export const toggleTask =
  ({ projectId, taskId, currentStatus }) =>
  async (dispatch) => {
    dispatch(flipTaskOptimistic({ projectId, taskId }));
    const newStatus = currentStatus === 'complete' ? 'pending' : 'complete';
    try {
      await client.patch(`/projects/${projectId}/tasks/${taskId}`, {
        status: newStatus,
      });
    } catch {
      // Revert by flipping back
      dispatch(flipTaskOptimistic({ projectId, taskId }));
    }
  };

// Optimistic delete — remove locally, revert (re-fetch) on failure
export const deleteTask =
  ({ projectId, taskId }) =>
  async (dispatch) => {
    dispatch(removeTaskOptimistic({ projectId, taskId }));
    try {
      await client.delete(`/projects/${projectId}/tasks/${taskId}`);
    } catch {
      dispatch(fetchTasks(projectId));
    }
  };

export const editTask = createAsyncThunk(
  'tasks/editTask',
  async ({ projectId, taskId, title, due_date, priority, category }, { rejectWithValue }) => {
    try {
      const res = await client.patch(
        `/projects/${projectId}/tasks/${taskId}`,
        { title, due_date, priority, category }
      );
      return { projectId, task: res.data.data };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to update task.');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  itemsByProjectId: {},
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    flipTaskOptimistic(state, action) {
      const { projectId, taskId } = action.payload;
      const list = state.itemsByProjectId[projectId];
      if (!list) return;
      state.itemsByProjectId[projectId] = list.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'complete' ? 'pending' : 'complete' }
          : t
      );
    },
    removeTaskOptimistic(state, action) {
      const { projectId, taskId } = action.payload;
      const list = state.itemsByProjectId[projectId];
      if (!list) return;
      state.itemsByProjectId[projectId] = list.filter((t) => t.id !== taskId);
    },
    updateTaskInPlace(state, action) {
      const { projectId, task } = action.payload;
      const list = state.itemsByProjectId[projectId];
      if (!list) return;
      state.itemsByProjectId[projectId] = list.map((t) => (t.id === task.id ? task : t));
    },
  },
  extraReducers: (builder) => {
    // fetchTasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.itemsByProjectId[action.payload.projectId] = action.payload.tasks;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createTask
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, task } = action.payload;
        if (!state.itemsByProjectId[projectId]) {
          state.itemsByProjectId[projectId] = [];
        }
        state.itemsByProjectId[projectId].push(task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // editTask
    builder
      .addCase(editTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, task } = action.payload;
        const list = state.itemsByProjectId[projectId];
        if (list) {
          state.itemsByProjectId[projectId] = list.map((t) => (t.id === task.id ? task : t));
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const { flipTaskOptimistic, removeTaskOptimistic, updateTaskInPlace } = tasksSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
const EMPTY_ARRAY = [];
export const selectTasksByProject = (projectId) => (state) =>
  state.tasks.itemsByProjectId[projectId] ?? EMPTY_ARRAY;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;

export default tasksSlice.reducer;
