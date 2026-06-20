import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  /** Tint panels by their performance score. */
  heatmap: boolean;
  /** Render real-time shadow maps in the 3D scene. */
  showShadows: boolean;
  /** Show a translucent ray from each table to the sun. */
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
