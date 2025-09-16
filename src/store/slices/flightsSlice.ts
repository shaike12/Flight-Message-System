import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Flight } from '../../types';

interface FlightsState {
  flights: Flight[];
  loading: boolean;
  error: string | null;
}

const initialState: FlightsState = {
  flights: [],
  loading: false,
  error: null,
};

// Async thunk for fetching flights
export const fetchFlights = createAsyncThunk(
  'flights/fetchFlights',
  async () => {
    // In a real app, this would be an API call
    // For now, we'll return mock data
    const mockFlights: Flight[] = [
      {
        id: '1',
        flightNumber: 'LY001',
        originalTime: '14:30',
        newTime: '16:45',
        originalDate: '2024-01-15',
        newDate: '2024-01-15',
        departureCity: 'TLV',
        arrivalCity: 'JFK',
        airline: 'ELAL',
        status: 'delayed',
      },
      {
        id: '2',
        flightNumber: 'LY002',
        originalTime: '08:00',
        newTime: '09:30',
        originalDate: '2024-01-16',
        departureCity: 'JFK',
        arrivalCity: 'TLV',
        airline: 'ELAL',
        status: 'delayed',
      },
    ];
    return mockFlights;
  }
);

// Async thunk for adding a new flight
export const addFlight = createAsyncThunk(
  'flights/addFlight',
  async (flight: Omit<Flight, 'id'>) => {
    // In a real app, this would be an API call
    const newFlight: Flight = {
      ...flight,
      id: Date.now().toString(),
    };
    return newFlight;
  }
);

const flightsSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {
    updateFlight: (state, action: PayloadAction<Flight>) => {
      const index = state.flights.findIndex(flight => flight.id === action.payload.id);
      if (index !== -1) {
        state.flights[index] = action.payload;
      }
    },
    deleteFlight: (state, action: PayloadAction<string>) => {
      state.flights = state.flights.filter(flight => flight.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.flights = action.payload;
      })
      .addCase(fetchFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch flights';
      })
      .addCase(addFlight.fulfilled, (state, action) => {
        state.flights.push(action.payload);
      });
  },
});

export const { updateFlight, deleteFlight } = flightsSlice.actions;
export default flightsSlice.reducer;

