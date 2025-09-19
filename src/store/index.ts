import { configureStore } from '@reduxjs/toolkit';
import {
  flightsReducer,
  templatesReducer,
  messagesReducer,
  citiesReducer,
  flightRoutesReducer
} from './slices';
import customVariablesReducer from './slices/customVariablesSlice';

export const store = configureStore({
  reducer: {
    flights: flightsReducer,
    templates: templatesReducer,
    messages: messagesReducer,
    cities: citiesReducer,
    flightRoutes: flightRoutesReducer,
    customVariables: customVariablesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;