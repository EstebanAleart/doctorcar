import { configureStore, createSlice } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

// Crear un noop storage para SSR
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Usar localStorage en cliente, noop en servidor
const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // solo persistir el slice de usuario
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    loading: false,  // cambié a false para que no esté cargando al inicio
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearUser: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
});

const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setVehicles: (state, action) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    addVehicle: (state, action) => {
      state.list.push(action.payload);
    },
    updateVehicle: (state, action) => {
      const idx = state.list.findIndex((v) => v.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = { ...state.list[idx], ...action.payload };
      }
    },
    deleteVehicle: (state, action) => {
      state.list = state.list.filter((v) => v.id !== action.payload);
    },
    setVehiclesLoading: (state, action) => {
      state.loading = action.payload;
    },
    setVehiclesError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

const claimsSlice = createSlice({
  name: "claims",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setClaims: (state, action) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    addClaim: (state, action) => {
      state.list.push(action.payload);
    },
    updateClaim: (state, action) => {
      const idx = state.list.findIndex((c) => c.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = { ...state.list[idx], ...action.payload };
      }
    },
    deleteClaim: (state, action) => {
      state.list = state.list.filter((c) => c.id !== action.payload);
    },
    setClaimsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setClaimsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setUser, updateUser, setError, setLoading, clearUser } = userSlice.actions;
export const { setVehicles, addVehicle, updateVehicle, deleteVehicle, setVehiclesLoading, setVehiclesError } = vehiclesSlice.actions;
export const { setClaims, addClaim, updateClaim, deleteClaim, setClaimsLoading, setClaimsError } = claimsSlice.actions;

const rootReducer = {
  user: userSlice.reducer,
  vehicles: vehiclesSlice.reducer,
  claims: claimsSlice.reducer,
};

const persistedReducer = persistReducer(persistConfig, (state = {}, action) => {
  return {
    user: rootReducer.user(state.user, action),
    vehicles: rootReducer.vehicles(state.vehicles, action),
    claims: rootReducer.claims(state.claims, action),
  };
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
