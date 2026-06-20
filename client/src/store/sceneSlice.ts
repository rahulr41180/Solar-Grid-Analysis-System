import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { Building, SceneObject, SolarTable, Tank } from '@/types';

export interface SceneState {
  objects: SceneObject[];
  selectedId: string | null;
}

function defaultObjects(): SceneObject[] {
  const tableA: SolarTable = { id: nanoid(), type: 'table', x: -3, y: 0, azimuth: 0 };
  const tableB: SolarTable = { id: nanoid(), type: 'table', x: 3, y: 0, azimuth: 0 };
  const building: Building = {
    id: nanoid(),
    type: 'building',
    x: -6,
    y: -8,
    width: 4,
    length: 4,
    height: 8,
  };
  const tank: Tank = { id: nanoid(), type: 'tank', x: 7, y: -6, radius: 1.5, height: 5 };
  return [tableA, tableB, building, tank];
}

const initialState: SceneState = {
  objects: defaultObjects(),
  selectedId: null,
};

const sceneSlice = createSlice({
  name: 'scene',
  initialState,
  reducers: {
    addBuilding: {
      reducer: (state, action: PayloadAction<Building>) => {
        state.objects.push(action.payload);
        state.selectedId = action.payload.id;
      },
      prepare: () => ({
        payload: {
          id: nanoid(),
          type: 'building',
          x: 0,
          y: -5,
          width: 3,
          length: 3,
          height: 5,
        } as Building,
      }),
    },
    addTank: {
      reducer: (state, action: PayloadAction<Tank>) => {
        state.objects.push(action.payload);
        state.selectedId = action.payload.id;
      },
      prepare: () => ({
        payload: { id: nanoid(), type: 'tank', x: 0, y: -5, radius: 1.5, height: 4 } as Tank,
      }),
    },
    addTable: {
      reducer: (state, action: PayloadAction<SolarTable>) => {
        state.objects.push(action.payload);
        state.selectedId = action.payload.id;
      },
      prepare: () => ({
        payload: { id: nanoid(), type: 'table', x: 0, y: 4, azimuth: 0 } as SolarTable,
      }),
    },
    updateObject: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<SceneObject> }>
    ) => {
      const obj = state.objects.find((o) => o.id === action.payload.id);
      if (obj) Object.assign(obj, action.payload.changes);
    },
    removeObject: (state, action: PayloadAction<string>) => {
      state.objects = state.objects.filter((o) => o.id !== action.payload);
      if (state.selectedId === action.payload) state.selectedId = null;
    },
    selectObject: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    loadScene: (state, action: PayloadAction<SceneObject[]>) => {
      state.objects = action.payload;
      state.selectedId = null;
    },
    resetScene: (state) => {
      state.objects = defaultObjects();
      state.selectedId = null;
    },
  },
});

export const {
  addBuilding,
  addTank,
  addTable,
  updateObject,
  removeObject,
  selectObject,
  loadScene,
  resetScene,
} = sceneSlice.actions;

export default sceneSlice.reducer;
