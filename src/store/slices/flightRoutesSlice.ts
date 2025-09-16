import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FlightRoute } from '../../types';
import { 
  getFlightRoutes, 
  addFlightRoute as addFlightRouteToFirebase, 
  updateFlightRoute as updateFlightRouteInFirebase, 
  deleteFlightRoute as deleteFlightRouteFromFirebase 
} from '../../firebase/services';

interface FlightRoutesState {
  routes: FlightRoute[];
  loading: boolean;
  error: string | null;
}

const initialState: FlightRoutesState = {
  routes: [],
  loading: false,
  error: null,
};

// Async thunks for Firebase operations
export const fetchFlightRoutes = createAsyncThunk(
  'flightRoutes/fetchFlightRoutes',
  async () => {
    try {
      const routes = await getFlightRoutes();
      return routes;
    } catch (error) {
      console.error('Error fetching flight routes from Firebase:', error);
      throw error;
    }
  }
);

export const addFlightRoute = createAsyncThunk(
  'flightRoutes/addFlightRoute',
  async (route: Omit<FlightRoute, 'id'>) => {
    try {
      const id = await addFlightRouteToFirebase(route);
      return { id, ...route };
    } catch (error) {
      console.error('Error adding flight route to Firebase:', error);
      throw error;
    }
  }
);

export const updateFlightRoute = createAsyncThunk(
  'flightRoutes/updateFlightRoute',
  async ({ id, route }: { id: string; route: Partial<FlightRoute> }) => {
    try {
      await updateFlightRouteInFirebase(id, route);
      return { id, ...route };
    } catch (error) {
      console.error('Error updating flight route in Firebase:', error);
      throw error;
    }
  }
);

export const deleteFlightRoute = createAsyncThunk(
  'flightRoutes/deleteFlightRoute',
  async (id: string) => {
    try {
      await deleteFlightRouteFromFirebase(id);
      return id;
    } catch (error) {
      console.error('Error deleting flight route from Firebase:', error);
      throw error;
    }
  }
);

const flightRoutesSlice = createSlice({
  name: 'flightRoutes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlightRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlightRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(fetchFlightRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch flight routes';
      })
      .addCase(addFlightRoute.fulfilled, (state, action) => {
        state.routes.push(action.payload);
      })
      .addCase(updateFlightRoute.fulfilled, (state, action) => {
        const index = state.routes.findIndex(route => route.id === action.payload.id);
        if (index !== -1) {
          state.routes[index] = { ...state.routes[index], ...action.payload };
        }
      })
      .addCase(deleteFlightRoute.fulfilled, (state, action) => {
        state.routes = state.routes.filter(route => route.id !== action.payload);
      });
  },
});

export const { clearError } = flightRoutesSlice.actions;
export default flightRoutesSlice.reducer;