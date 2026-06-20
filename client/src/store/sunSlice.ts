import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SunMode, SunState } from '@/types';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/lib/constants';
import { sunAnglesFromDateTime } from '@/lib/sun';

const initialDate = '2026-06-21';
const initialMinutes = 13 * 60; 

const initialAngles = sunAnglesFromDateTime(
  initialDate,
  initialMinutes,
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE
);

const initialState: SunState = {
  mode: 'datetime',
  azimuth: initialAngles.azimuth,
  elevation: initialAngles.elevation,
  date: initialDate,
  minutes: initialMinutes,
  latitude: DEFAULT_LATITUDE,
  longitude: DEFAULT_LONGITUDE,
  playing: false,
};

function recompute(state: SunState) {
  const a = sunAnglesFromDateTime(state.date, state.minutes, state.latitude, state.longitude);
  state.azimuth = a.azimuth;
  state.elevation = a.elevation;
}

const sunSlice = createSlice({
  name: 'sun',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<SunMode>) => {
      state.mode = action.payload;
      if (state.mode === 'datetime') recompute(state);
    },
    setAzimuth: (state, action: PayloadAction<number>) => {
      state.azimuth = action.payload;
    },
    setElevation: (state, action: PayloadAction<number>) => {
      state.elevation = action.payload;
    },
    setDate: (state, action: PayloadAction<string>) => {
      state.date = action.payload;
      recompute(state);
    },
    setMinutes: (state, action: PayloadAction<number>) => {
      state.minutes = action.payload;
      if (state.mode === 'datetime') recompute(state);
    },
    setLatitude: (state, action: PayloadAction<number>) => {
      state.latitude = action.payload;
      recompute(state);
    },
    setLongitude: (state, action: PayloadAction<number>) => {
      state.longitude = action.payload;
      recompute(state);
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.playing = action.payload;
      if (state.playing) state.mode = 'datetime';
    },
    tickPlayback: (state, action: PayloadAction<number>) => {
      let m = state.minutes + action.payload;
      if (m >= 24 * 60) m = 0;
      state.minutes = m;
      recompute(state);
    },
  },
});

export const {
  setMode,
  setAzimuth,
  setElevation,
  setDate,
  setMinutes,
  setLatitude,
  setLongitude,
  setPlaying,
  tickPlayback,
} = sunSlice.actions;

export default sunSlice.reducer;
