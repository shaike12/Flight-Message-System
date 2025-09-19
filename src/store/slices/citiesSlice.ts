import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { City } from '../../types';
import { fetchCities as fetchCitiesFromFirebase, addCity as addCityToFirebase, updateCity as updateCityInFirebase, deleteCity as deleteCityFromFirebase } from '../../firebase/services';

interface CitiesState {
  cities: City[];
  loading: boolean;
  error: string | null;
}

const initialState: CitiesState = {
  cities: [],
  loading: false,
  error: null,
};

// El Al destinations data with English names - Updated with all destinations
const elAlCities: City[] = [
  // Israel
  { code: 'TLV', name: 'תל אביב', englishName: 'Tel Aviv', country: 'ישראל', isElAlDestination: true },
  
  // North America
  { code: 'JFK', name: 'ניו יורק', englishName: 'New York', country: 'ארה"ב', isElAlDestination: true },
  { code: 'LAX', name: 'לוס אנג\'לס', englishName: 'Los Angeles', country: 'ארה"ב', isElAlDestination: true },
  { code: 'MIA', name: 'מיאמי', englishName: 'Miami', country: 'ארה"ב', isElAlDestination: true },
  { code: 'BOS', name: 'בוסטון', englishName: 'Boston', country: 'ארה"ב', isElAlDestination: true },
  { code: 'YYZ', name: 'טורונטו', englishName: 'Toronto', country: 'קנדה', isElAlDestination: true },
  
  // Europe
  { code: 'LHR', name: 'לונדון', englishName: 'London', country: 'אנגליה', isElAlDestination: true },
  { code: 'CDG', name: 'פריז', englishName: 'Paris', country: 'צרפת', isElAlDestination: true },
  { code: 'FRA', name: 'פרנקפורט', englishName: 'Frankfurt', country: 'גרמניה', isElAlDestination: true },
  { code: 'MAD', name: 'מדריד', englishName: 'Madrid', country: 'ספרד', isElAlDestination: true },
  { code: 'FCO', name: 'רומא', englishName: 'Rome', country: 'איטליה', isElAlDestination: true },
  { code: 'MXP', name: 'מילאנו', englishName: 'Milan', country: 'איטליה', isElAlDestination: true },
  { code: 'ZUR', name: 'ציריך', englishName: 'Zurich', country: 'שוויץ', isElAlDestination: true },
  { code: 'VIE', name: 'וינה', englishName: 'Vienna', country: 'אוסטריה', isElAlDestination: true },
  { code: 'AMS', name: 'אמסטרדם', englishName: 'Amsterdam', country: 'הולנד', isElAlDestination: true },
  { code: 'BRU', name: 'בריסל', englishName: 'Brussels', country: 'בלגיה', isElAlDestination: true },
  
  // Eastern Europe & Russia
  { code: 'SVO', name: 'מוסקבה', englishName: 'Moscow', country: 'רוסיה', isElAlDestination: true },
  { code: 'LED', name: 'סנט פטרסבורג', englishName: 'St. Petersburg', country: 'רוסיה', isElAlDestination: true },
  { code: 'KBP', name: 'קייב', englishName: 'Kiev', country: 'אוקראינה', isElAlDestination: true },
  { code: 'BUD', name: 'בודפשט', englishName: 'Budapest', country: 'הונגריה', isElAlDestination: true },
  { code: 'PRG', name: 'פראג', englishName: 'Prague', country: 'צ\'כיה', isElAlDestination: true },
  
  // Middle East & Asia
  { code: 'IST', name: 'איסטנבול', englishName: 'Istanbul', country: 'טורקיה', isElAlDestination: true },
  { code: 'DXB', name: 'דובאי', englishName: 'Dubai', country: 'איחוד האמירויות', isElAlDestination: true },
  { code: 'BKK', name: 'בנגקוק', englishName: 'Bangkok', country: 'תאילנד', isElAlDestination: true },
  { code: 'HKG', name: 'הונג קונג', englishName: 'Hong Kong', country: 'הונג קונג', isElAlDestination: true },
  { code: 'NRT', name: 'טוקיו', englishName: 'Tokyo', country: 'יפן', isElAlDestination: true },
  { code: 'ICN', name: 'סיאול', englishName: 'Seoul', country: 'דרום קוריאה', isElAlDestination: true },
  { code: 'SIN', name: 'סינגפור', englishName: 'Singapore', country: 'סינגפור', isElAlDestination: true },
  { code: 'BOM', name: 'מומבאי', englishName: 'Mumbai', country: 'הודו', isElAlDestination: true },
  
  // Africa
  { code: 'JNB', name: 'יוהנסבורג', englishName: 'Johannesburg', country: 'דרום אפריקה', isElAlDestination: true },
  { code: 'CPT', name: 'קייפטאון', englishName: 'Cape Town', country: 'דרום אפריקה', isElAlDestination: true },
  { code: 'CAI', name: 'קהיר', englishName: 'Cairo', country: 'מצרים', isElAlDestination: true },
  { code: 'ADD', name: 'אדיס אבבה', englishName: 'Addis Ababa', country: 'אתיופיה', isElAlDestination: true },
  
  // South America
  { code: 'GRU', name: 'סאו פאולו', englishName: 'São Paulo', country: 'ברזיל', isElAlDestination: true },
  { code: 'EZE', name: 'בואנוס איירס', englishName: 'Buenos Aires', country: 'ארגנטינה', isElAlDestination: true },
  { code: 'SCL', name: 'סנטיאגו', englishName: 'Santiago', country: 'צ\'ילה', isElAlDestination: true },
  
  // Australia & Oceania
  { code: 'SYD', name: 'סידני', englishName: 'Sydney', country: 'אוסטרליה', isElAlDestination: true },
  { code: 'MEL', name: 'מלבורן', englishName: 'Melbourne', country: 'אוסטרליה', isElAlDestination: true },
];

// Async thunk for fetching cities
export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async () => {
    try {
      const cities = await fetchCitiesFromFirebase();
      // If no cities in Firebase, return default cities
      if (cities.length === 0) {
        return elAlCities;
      }
      return cities;
    } catch (error) {
      console.error('Error fetching cities from Firebase, using defaults:', error);
      return elAlCities;
    }
  }
);

// Async thunk for adding a city
export const addCityAsync = createAsyncThunk(
  'cities/addCityAsync',
  async (city: Omit<City, 'id'>) => {
    try {
      const id = await addCityToFirebase(city);
      return { id, ...city };
    } catch (error) {
      console.error('Error adding city to Firebase:', error);
      throw error;
    }
  }
);

// Async thunk for updating a city
export const updateCityAsync = createAsyncThunk(
  'cities/updateCityAsync',
  async ({ id, city }: { id: string; city: Partial<City> }) => {
    try {
      await updateCityInFirebase(id, city);
      return { id, ...city };
    } catch (error) {
      console.error('Error updating city in Firebase:', error);
      throw error;
    }
  }
);

// Async thunk for deleting a city
export const deleteCityAsync = createAsyncThunk(
  'cities/deleteCityAsync',
  async (id: string) => {
    try {
      await deleteCityFromFirebase(id);
      return id;
    } catch (error) {
      console.error('Error deleting city from Firebase:', error);
      throw error;
    }
  }
);

const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    addCity: (state, action) => {
      state.cities.push(action.payload);
    },
    updateCity: (state, action) => {
      const index = state.cities.findIndex(city => city.code === action.payload.code);
      if (index !== -1) {
        state.cities[index] = action.payload;
      }
    },
    deleteCity: (state, action) => {
      state.cities = state.cities.filter(city => city.code !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cities';
      })
      .addCase(addCityAsync.fulfilled, (state, action) => {
        state.cities.push(action.payload);
      })
      .addCase(updateCityAsync.fulfilled, (state, action) => {
        const index = state.cities.findIndex(city => (city as any).id === action.payload.id);
        if (index !== -1) {
          state.cities[index] = { ...state.cities[index], ...action.payload };
        }
      })
      .addCase(deleteCityAsync.fulfilled, (state, action) => {
        state.cities = state.cities.filter(city => (city as any).id !== action.payload);
      });
  },
});

export const { addCity, updateCity, deleteCity } = citiesSlice.actions;
export default citiesSlice.reducer;