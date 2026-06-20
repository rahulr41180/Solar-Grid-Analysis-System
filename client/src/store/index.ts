import { configureStore } from '@reduxjs/toolkit';
import sceneReducer from './sceneSlice';
import sunReducer from './sunSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    scene: sceneReducer,
    sun: sunReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
