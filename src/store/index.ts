import { configureStore } from '@reduxjs/toolkit';
import flightsReducer from './slices/flightsSlice';
import templatesReducer from './slices/templatesSlice';
import messagesReducer from './slices/messagesSlice';
import citiesReducer from './slices/citiesSlice';
import flightRoutesReducer from './slices/flightRoutesSlice';
import messageHistoryReducer from './slices/messageHistorySlice';

export const store = configureStore({
  reducer: {
    flights: flightsReducer,
    templates: templatesReducer,
    messages: messagesReducer,
    cities: citiesReducer,
    flightRoutes: flightRoutesReducer,
    messageHistory: messageHistoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['flightRoutes.routes.0.updatedAt', 'flightRoutes.routes.0.createdAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
