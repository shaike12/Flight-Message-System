import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MessageTemplate } from '../../types';
import { 
  getTemplates, 
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

// No default templates - user will create their own
const defaultTemplates: MessageTemplate[] = [];

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
      return templates;
    } catch (error) {
      console.error('Error fetching templates from Firebase, using defaults:', error);
      return defaultTemplates;
    }
  }
);

// Async thunk for adding a new template
export const addTemplate = createAsyncThunk(
  'templates/addTemplate',
  async (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await addTemplateToFirebase(template);
      return {
        id,
        ...template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
  async (template: MessageTemplate) => {
    try {
      await updateTemplateInFirebase(template.id, template);
      return {
        ...template,
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
  async (id: string) => {
    try {
      await setActiveTemplateInFirebase(id);
      return id;
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
    setActiveTemplate: (state, action: PayloadAction<string>) => {
      // Set all templates to inactive first
      state.templates.forEach(template => {
        template.isActive = false;
      });
      // Set the selected template as active
      const template = state.templates.find(t => t.id === action.payload);
      if (template) {
        template.isActive = true;
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
          state.templates[index] = action.payload;
        }
      })
      .addCase(deleteTemplateAsync.fulfilled, (state, action) => {
        state.templates = state.templates.filter(template => template.id !== action.payload);
      })
      .addCase(setActiveTemplateAsync.fulfilled, (state, action) => {
        state.templates.forEach(template => {
          template.isActive = false;
        });
        const template = state.templates.find(t => t.id === action.payload);
        if (template) {
          template.isActive = true;
        }
      });
  },
});

export const { deleteTemplate, setActiveTemplate } = templatesSlice.actions;
export default templatesSlice.reducer;
