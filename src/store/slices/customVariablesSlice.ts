import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CustomVariable } from '../../types';
import { 
  fetchCustomVariables, 
  addCustomVariable, 
  updateCustomVariable, 
  deleteCustomVariable 
} from '../../firebase/services';

interface CustomVariablesState {
  variables: CustomVariable[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomVariablesState = {
  variables: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCustomVariablesAsync = createAsyncThunk(
  'customVariables/fetchCustomVariables',
  async () => {
    const variables = await fetchCustomVariables();
    return variables;
  }
);

export const addCustomVariableAsync = createAsyncThunk(
  'customVariables/addCustomVariable',
  async (variable: Omit<CustomVariable, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVariable = await addCustomVariable(variable);
    return newVariable;
  }
);

export const updateCustomVariableAsync = createAsyncThunk(
  'customVariables/updateCustomVariable',
  async (variable: CustomVariable) => {
    const updatedVariable = await updateCustomVariable(variable);
    return updatedVariable;
  }
);

export const deleteCustomVariableAsync = createAsyncThunk(
  'customVariables/deleteCustomVariable',
  async (variableId: string) => {
    await deleteCustomVariable(variableId);
    return variableId;
  }
);

const customVariablesSlice = createSlice({
  name: 'customVariables',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch variables
      .addCase(fetchCustomVariablesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomVariablesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.variables = action.payload;
      })
      .addCase(fetchCustomVariablesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch custom variables';
      })
      // Add variable
      .addCase(addCustomVariableAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCustomVariableAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.variables.push(action.payload);
      })
      .addCase(addCustomVariableAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add custom variable';
      })
      // Update variable
      .addCase(updateCustomVariableAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomVariableAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.variables.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.variables[index] = action.payload;
        }
      })
      .addCase(updateCustomVariableAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update custom variable';
      })
      // Delete variable
      .addCase(deleteCustomVariableAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomVariableAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.variables = state.variables.filter(v => v.id !== action.payload);
      })
      .addCase(deleteCustomVariableAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete custom variable';
      });
  },
});

export const { clearError } = customVariablesSlice.actions;
export default customVariablesSlice.reducer;
