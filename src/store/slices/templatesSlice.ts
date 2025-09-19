import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MessageTemplate } from '../../types';
import { 
  fetchTemplates as getTemplates, 
  addTemplate as addTemplateToFirebase, 
  updateTemplate as updateTemplateInFirebase, 
  deleteTemplate as deleteTemplateFromFirebase,
  setActiveTemplate as setActiveTemplateInFirebase 
} from '../../firebase/services';

interface TemplatesState {
  templates: MessageTemplate[];
  loading: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  loading: false,
  error: null,
};

// Default templates for the system
const defaultTemplates: MessageTemplate[] = [
  {
    id: 'default-1',
    name: 'תבנית ברירת מחדל - שינוי שעה',
    content: `לקוח/ה יקר/ה,
עקב סיבות תיפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}{newDate ? ' בתאריך {newDate}' : ''}.
אנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,
אל על`,
    englishContent: `Dear Customer,
Due to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity}, originally scheduled to depart on {originalDate} at {originalTime}, will now depart at {newTime}{newDate ? ' on {newDate}' : ''}.
We sincerely apologize for the inconvenience and wish you a pleasant flight.
EL AL Israel Airlines`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-2',
    name: 'תבנית ברירת מחדל - שינוי מספר טיסה',
    content: `לקוח/ה יקר/ה,
עקב סיבות תיפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא כטיסה {newFlightNumber} בשעה {newTime}{newDate ? ' בתאריך {newDate}' : ''}.
אנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,
אל על`,
    englishContent: `Dear Customer,
Due to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity}, originally scheduled to depart on {originalDate} at {originalTime}, will now depart as Flight {newFlightNumber} at {newTime}{newDate ? ' on {newDate}' : ''}.
We sincerely apologize for the inconvenience and wish you a pleasant flight.
EL AL Israel Airlines`,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-3',
    name: 'תבנית עם שעות טרקלין ודלפקים',
    content: `לקוח/ה יקר/ה,
עקב סיבות תיפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}{newDate ? ' בתאריך {newDate}' : ''}.
שעת פתיחת הטרקלין: {loungeOpenTime}
שעת פתיחת הדלפקים: {checkinOpen}
שעת סגירת הדלפקים: {checkinClose}
אנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,
אל על`,
    englishContent: `Dear Customer,
Due to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity}, originally scheduled to depart on {originalDate} at {originalTime}, will now depart at {newTime}{newDate ? ' on {newDate}' : ''}.
Lounge opening time: {loungeOpenTime}
Check-in counter opening time: {checkinOpen}
Check-in counter closing time: {checkinClose}
We sincerely apologize for the inconvenience and wish you a pleasant flight.
EL AL Israel Airlines`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-4',
    name: 'תבנית עם כל הפרמטרים',
    content: `לקוח/ה יקר/ה,
עקב סיבות תיפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}{newDate ? ' בתאריך {newDate}' : ''}.
שעת פתיחת הטרקלין: {loungeOpenTime}
שעת פתיחת דלפקים: {counterOpenTime}
שעת פתיחת צ'ק-אין: {checkinOpen}
שעת סגירת צ'ק-אין: {checkinClose}
אנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,
אל על`,
    englishContent: `Dear Customer,
Due to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity}, originally scheduled to depart on {originalDate} at {originalTime}, will now depart at {newTime}{newDate ? ' on {newDate}' : ''}.
Lounge opening time: {loungeOpenTime}
Counter opening time: {counterOpenTime}
Check-in opening time: {checkinOpen}
Check-in closing time: {checkinClose}
We sincerely apologize for the inconvenience and wish you a pleasant flight.
EL AL Israel Airlines`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-5',
    name: 'טיסות מוצ״ש',
    content: `לקוח/ה יקר/ה,
עקב סיבות תיפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}{newDate ? ' בתאריך {newDate}' : ''}.
שעת פתיחת הטרקלין: {loungeOpenTime}
שעת פתיחת דלפקים: {counterOpenTime}
שעת פתיחת צ'ק-אין: {checkinOpen}
שעת סגירת צ'ק-אין: {checkinClose}
אנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,
אל על`,
    englishContent: `Dear Customer,
Due to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity}, originally scheduled to depart on {originalDate} at {originalTime}, will now depart at {newTime}{newDate ? ' on {newDate}' : ''}.
Lounge opening time: {loungeOpenTime}
Counter opening time: {counterOpenTime}
Check-in opening time: {checkinOpen}
Check-in closing time: {checkinClose}
We sincerely apologize for the inconvenience and wish you a pleasant flight.
EL AL Israel Airlines`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Async thunk for fetching templates
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async () => {
    try {
      const templates = await getTemplates();
      // If no templates in Firebase, return default templates
      if (templates.length === 0) {
        return defaultTemplates;
      }
      // Convert Firebase Timestamps to strings
      return templates.map(template => ({
        ...template,
        createdAt: (template.createdAt as any)?.toDate?.()?.toISOString() || template.createdAt,
        updatedAt: (template.updatedAt as any)?.toDate?.()?.toISOString() || template.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching templates from Firebase, using defaults:', error);
      return defaultTemplates;
    }
  }
);

// Async thunk for adding a new template
export const addTemplate = createAsyncThunk(
  'templates/addTemplate',
  async (template: Omit<MessageTemplate, 'id'>) => {
    try {
      const id = await addTemplateToFirebase(template);
      return {
        id,
        ...template,
        createdAt: template.createdAt || new Date().toISOString(),
        updatedAt: template.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error adding template to Firebase:', error);
      throw error;
    }
  }
);

// Async thunk for updating a template
export const updateTemplate = createAsyncThunk(
  'templates/updateTemplate',
  async (params: { id: string; template: Partial<MessageTemplate> }) => {
    try {
      await updateTemplateInFirebase(params.id, params.template);
      return {
        id: params.id,
        ...params.template,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating template in Firebase:', error);
      throw error;
    }
  }
);

// Async thunk for deleting a template
export const deleteTemplateAsync = createAsyncThunk(
  'templates/deleteTemplateAsync',
  async (id: string) => {
    try {
      await deleteTemplateFromFirebase(id);
      return id;
    } catch (error) {
      console.error('Error deleting template from Firebase:', error);
      throw error;
    }
  }
);

// Async thunk for setting active template
export const setActiveTemplateAsync = createAsyncThunk(
  'templates/setActiveTemplateAsync',
  async (params: { id: string; isActive: boolean }) => {
    try {
      await setActiveTemplateInFirebase(params.id, params.isActive);
      return params.id;
    } catch (error) {
      console.error('Error setting active template in Firebase:', error);
      throw error;
    }
  }
);

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(template => template.id !== action.payload);
    },
    setActiveTemplate: (state, action: PayloadAction<{ id: string; isActive: boolean }>) => {
      const template = state.templates.find(t => t.id === action.payload.id);
      if (template) {
        template.isActive = action.payload.isActive;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch templates';
      })
      .addCase(addTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload);
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(template => template.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = { ...state.templates[index], ...action.payload };
        }
      })
      .addCase(deleteTemplateAsync.fulfilled, (state, action) => {
        state.templates = state.templates.filter(template => template.id !== action.payload);
      })
      .addCase(setActiveTemplateAsync.fulfilled, (state, action) => {
        const template = state.templates.find(t => t.id === action.payload);
        if (template) {
          template.isActive = !template.isActive;
        }
      });
  },
});

export const { deleteTemplate, setActiveTemplate } = templatesSlice.actions;
export default templatesSlice.reducer;
