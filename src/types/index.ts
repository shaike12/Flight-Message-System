// Flight data structure
export interface Flight {
  id: string;
  flightNumber: string;
  originalTime: string;
  newTime: string;
  originalDate: string;
  newDate?: string;
  departureCity: string;
  arrivalCity: string;
  airline: 'ELAL';
  status: 'scheduled' | 'delayed' | 'cancelled';
}

// Message template structure
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  englishContent?: string;
  frenchContent?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Generated message structure
export interface GeneratedMessage {
  id: string;
  flightId: string;
  templateId: string;
  content: string;
  recipients: string[];
  status: 'draft' | 'sent' | 'failed';
  createdAt: string;
  departureCity: string;
  arrivalCity: string;
  sentAt?: string;
}

// City data for El Al destinations
export interface City {
  code: string;
  name: string;
  englishName: string;
  country: string;
  isElAlDestination: boolean;
}

// Flight route data
export interface FlightRoute {
  id: string;
  flightNumber: string;
  departureCity: string;
  departureCityHebrew: string;
  departureCityEnglish: string;
  departureCityFrench?: string;
  arrivalCity: string;
  arrivalCityHebrew: string;
  arrivalCityEnglish: string;
  arrivalCityFrench?: string;
  airline: 'ELAL' | 'Sundor';
}

// Custom variable for templates
export interface CustomVariable {
  id: string;
  name: string;
  displayName: string;
  displayNameEnglish: string;
  displayNameFrench?: string;
  type: 'text' | 'time' | 'date' | 'number';
  placeholder: string;
  placeholderEnglish: string;
  placeholderFrench?: string;
  isActive: boolean;
  order: number; // Field to control display order
  createdAt: string;
  updatedAt: string;
}

