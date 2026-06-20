import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  heatmap: boolean;
  showShadows: boolean;
  showSunRays: boolean;
}

const initialState: SettingsState = {
  heatmap: true,
  showShadows: true,
  showSunRays: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleHeatmap: (state, action: PayloadAction<boolean | undefined>) => {
      state.heatmap = action.payload ?? !state.heatmap;
    },
    toggleShadows: (state, action: PayloadAction<boolean | undefined>) => {
      state.showShadows = action.payload ?? !state.showShadows;
    },
    toggleSunRays: (state, action: PayloadAction<boolean | undefined>) => {
      state.showSunRays = action.payload ?? !state.showSunRays;
    },
  },
});

export const { toggleHeatmap, toggleShadows, toggleSunRays } = settingsSlice.actions;
export default settingsSlice.reducer;
