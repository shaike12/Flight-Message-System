import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MessageHistoryItem {
  id: string;
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  originalDate: string;
  originalTime: string;
  newTime: string;
  newDate?: string;
  hebrewMessage: string;
  englishMessage: string;
  templateId?: string;
  templateName?: string;
  createdAt: string;
  sentAt?: string;
}

interface MessageHistoryState {
  messages: MessageHistoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: MessageHistoryState = {
  messages: [],
  loading: false,
  error: null,
};

const messageHistorySlice = createSlice({
  name: 'messageHistory',
  initialState,
  reducers: {
    addMessageToHistory: (state, action: PayloadAction<Omit<MessageHistoryItem, 'id' | 'createdAt'>>) => {
      const newMessage: MessageHistoryItem = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.messages.unshift(newMessage); // Add to beginning
      
      // Keep only last 100 messages
      if (state.messages.length > 100) {
        state.messages = state.messages.slice(0, 100);
      }
    },
    markMessageAsSent: (state, action: PayloadAction<string>) => {
      const message = state.messages.find(msg => msg.id === action.payload);
      if (message) {
        message.sentAt = new Date().toISOString();
      }
    },
    deleteMessageFromHistory: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    clearMessageHistory: (state) => {
      state.messages = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addMessageToHistory,
  markMessageAsSent,
  deleteMessageFromHistory,
  clearMessageHistory,
  setLoading,
  setError,
} = messageHistorySlice.actions;

export default messageHistorySlice.reducer;

