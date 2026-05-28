import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'system', // 'system', 'light', 'dark'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action) {
      state.mode = action.payload;
    },
  },
});

export const { setThemeMode } = themeSlice.actions;

export const selectThemeMode = (state) => state.theme.mode;

export default themeSlice.reducer;
