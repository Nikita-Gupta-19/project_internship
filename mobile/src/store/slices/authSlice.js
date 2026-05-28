import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const restoreToken = createAsyncThunk(
  'auth/restoreToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token; // null or string
    } catch {
      return rejectWithValue(null);
    }
  }
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      await client.post('/auth/send-otp', { email });
      return true;
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.[0]?.message ||
        'Failed to send OTP.';
      return rejectWithValue(msg);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await client.post('/auth/verify-otp', { email, otp });
      await AsyncStorage.setItem('token', res.data.token);
      return { token: res.data.token, user: res.data.user };
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.[0]?.message ||
        'Verification failed.';
      return rejectWithValue(msg);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, avatar_url }, { rejectWithValue }) => {
    try {
      const res = await client.patch('/auth/profile', { name, avatar_url });
      return res.data.user;
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to update profile.';
      return rejectWithValue(msg);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('token');
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // restoreToken
    builder
      .addCase(restoreToken.fulfilled, (state, action) => {
        state.token = action.payload; // null or string
      })
      .addCase(restoreToken.rejected, (state) => {
        state.token = null;
      });

    // sendOtp
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // verifyOtp
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // updateProfile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // logout
    builder.addCase(logout.fulfilled, () => initialState);
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const { clearError } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
