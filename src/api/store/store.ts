import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './authSlice';
     
const persistConfig = {
  key      : 'root',
  storage  : AsyncStorage,
  whitelist: ['auth'],   // auth slice persisted - add others as needed
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  // add future reducers here
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store
export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches these non-serializable actions internally
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Persistor - pass this to <PersistGate> in App.tsx
export const persistor = persistStore(store);

// Typed helpers
export type RootState   = ReturnType<typeof rootReducer>;  // use rootReducer, not store.getState
export type AppDispatch = typeof store.dispatch;