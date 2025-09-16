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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  arrivalCity: string;
  arrivalCityHebrew: string;
  arrivalCityEnglish: string;
  airline: 'ELAL' | 'Sundor';
}
