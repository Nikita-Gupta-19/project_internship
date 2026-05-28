import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const res = await client.get('/projects');
      return res.data.data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch projects.');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async ({ title, description }, { rejectWithValue }) => {
    try {
      const res = await client.post('/projects', { title, description });
      return res.data.data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to create project.');
    }
  }
);

// Optimistic delete — implemented as a manual thunk (not createAsyncThunk)
// so we can dispatch removeProjectOptimistic before the API call.
export const deleteProject = (projectId) => async (dispatch) => {
  dispatch(removeProjectOptimistic(projectId));
  try {
    await client.delete(`/projects/${projectId}`);
  } catch {
    // Revert by re-fetching
    dispatch(fetchProjects());
  }
};

export const editProject = createAsyncThunk(
  'projects/editProject',
  async ({ projectId, title, description }, { rejectWithValue }) => {
    try {
      const res = await client.patch(`/projects/${projectId}`, { title, description });
      return res.data.data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to update project.');
    }
  }
);

export const inviteMember = createAsyncThunk(
  'projects/inviteMember',
  async ({ projectId, email }, { rejectWithValue }) => {
    try {
      const res = await client.post(`/projects/${projectId}/members`, { email });
      return res.data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to invite user.');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    removeProjectOptimistic(state, action) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    updateProjectInPlace(state, action) {
      const updated = action.payload;
      state.items = state.items.map((p) => (p.id === updated.id ? updated : p));
    },
  },
  extraReducers: (builder) => {
    // fetchProjects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createProject
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        // Prepend new project so it appears at the top
        state.items = [action.payload, ...state.items];
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // editProject
    builder
      .addCase(editProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((p) =>
          p.id === action.payload.id ? action.payload : p
        );
      })
      .addCase(editProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const { removeProjectOptimistic, updateProjectInPlace } = projectsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectProjects = (state) => state.projects.items;
export const selectProjectsLoading = (state) => state.projects.loading;
export const selectProjectsError = (state) => state.projects.error;

export default projectsSlice.reducer;
