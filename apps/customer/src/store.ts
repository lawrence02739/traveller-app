import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

import flightReducer from './features/flightSlice';
import authReducer from './features/authSlice';
import bookingReducer from './features/bookingSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'booking', "flight"], // Only persist the user state and booking state
};

const rootReducer = combineReducers({
  flight: flightReducer,
  auth: authReducer,
  booking: bookingReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
