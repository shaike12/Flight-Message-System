import moment from 'moment-timezone';

// Cache for timezone lookups to avoid repeated API calls
const timezoneCache = new Map<string, string>();

// Fallback mapping of airport codes to timezones for known airports
const airportTimezones: Record<string, string> = {
  // Israel
  'TLV': 'Asia/Jerusalem',
  'JLM': 'Asia/Jerusalem',
  
  // Europe
  'LHR': 'Europe/London',
  'CDG': 'Europe/Paris',
  'FRA': 'Europe/Berlin',
  'MAD': 'Europe/Madrid',
  'FCO': 'Europe/Rome',
  'AMS': 'Europe/Amsterdam',
  'ZUR': 'Europe/Zurich',
  'VIE': 'Europe/Vienna',
  'BRU': 'Europe/Brussels',
  'CPH': 'Europe/Copenhagen',
  'ARN': 'Europe/Stockholm',
  'OSL': 'Europe/Oslo',
  'HEL': 'Europe/Helsinki',
  'WAW': 'Europe/Warsaw',
  'PRG': 'Europe/Prague',
  'BUD': 'Europe/Budapest',
  'ATH': 'Europe/Athens',
  'IST': 'Europe/Istanbul',
  'SOF': 'Europe/Sofia',
  'BUH': 'Europe/Bucharest',
  'OTP': 'Europe/Bucharest',
  'KBP': 'Europe/Kiev',
  'SVO': 'Europe/Moscow',
  'LED': 'Europe/Moscow',
  'BEG': 'Europe/Belgrade',
  'TGD': 'Europe/Podgorica',
  
  // North America
  'JFK': 'America/New_York',
  'LGA': 'America/New_York',
  'EWR': 'America/New_York',
  'LAX': 'America/Los_Angeles',
  'SFO': 'America/Los_Angeles',
  'ORD': 'America/Chicago',
  'DFW': 'America/Chicago',
  'MIA': 'America/New_York',
  'ATL': 'America/New_York',
  'DEN': 'America/Denver',
  'SEA': 'America/Los_Angeles',
  'LAS': 'America/Los_Angeles',
  'PHX': 'America/Phoenix',
  'BOS': 'America/New_York',
  'YYZ': 'America/Toronto',
  'YVR': 'America/Vancouver',
  
  // Asia
  'NRT': 'Asia/Tokyo',
  'HND': 'Asia/Tokyo',
  'ICN': 'Asia/Seoul',
  'PEK': 'Asia/Shanghai',
  'PVG': 'Asia/Shanghai',
  'HKG': 'Asia/Hong_Kong',
  'SIN': 'Asia/Singapore',
  'BKK': 'Asia/Bangkok',
  'KUL': 'Asia/Kuala_Lumpur',
  'MNL': 'Asia/Manila',
  'BOM': 'Asia/Kolkata',
  'DEL': 'Asia/Kolkata',
  'DXB': 'Asia/Dubai',
  'AUH': 'Asia/Dubai',
  'DOH': 'Asia/Qatar',
  'RUH': 'Asia/Riyadh',
  'JED': 'Asia/Riyadh',
  
  // Africa
  'CAI': 'Africa/Cairo',
  'JNB': 'Africa/Johannesburg',
  'CPT': 'Africa/Johannesburg',
  'LAD': 'Africa/Luanda',
  'LOS': 'Africa/Lagos',
  'NBO': 'Africa/Nairobi',
  'ADD': 'Africa/Addis_Ababa',
  
  // Australia/Oceania
  'SYD': 'Australia/Sydney',
  'MEL': 'Australia/Melbourne',
  'BNE': 'Australia/Brisbane',
  'PER': 'Australia/Perth',
  'ADL': 'Australia/Adelaide',
  'AKL': 'Pacific/Auckland',
  
  // South America
  'GRU': 'America/Sao_Paulo',
  'GIG': 'America/Sao_Paulo',
  'EZE': 'America/Argentina/Buenos_Aires',
  'LIM': 'America/Lima',
  'SCL': 'America/Santiago',
  'BOG': 'America/Bogota',
  
  // Additional destinations from your system
  'TIV': 'Europe/Podgorica',
  'ZRH': 'Europe/Zurich',
  'TBS': 'Asia/Tbilisi',
  'PFO': 'Asia/Nicosia',
  'RHO': 'Europe/Athens',
  'JSH': 'Europe/Athens',
  'EFL': 'Europe/Athens',
  'RMO': 'Europe/Chisinau',
  'LTN': 'Europe/London',
  'LCA': 'Asia/Nicosia',
  'PVK': 'Europe/Athens',
  'JTR': 'Europe/Athens',
  'RAK': 'Africa/Casablanca',
  'BUS': 'Europe/Brussels'
};

// Function to get timezone from airport code using external API
const getTimezoneFromAPI = async (airportCode: string): Promise<string | null> => {
  try {
    // Try multiple APIs for better coverage
    const apis = [
      // WorldTimeAPI - free, no key required
      `https://worldtimeapi.org/api/timezone`,
      // TimeZoneDB - requires API key but more accurate
      // `https://api.timezonedb.com/v2.1/list-time-zone?key=${API_KEY}&format=json`
    ];

    // For now, we'll use a simple approach with airport code to city mapping
    // In a real implementation, you'd use a proper airport database API
    const airportToCity: Record<string, string> = {
      'TLV': 'Jerusalem',
      'JFK': 'New_York',
      'LHR': 'London',
      'CDG': 'Paris',
      'FRA': 'Berlin',
      'LAX': 'Los_Angeles',
      'NRT': 'Tokyo',
      'SYD': 'Sydney',
      'DXB': 'Dubai',
      'SIN': 'Singapore',
      'HKG': 'Hong_Kong',
      'BKK': 'Bangkok',
      'ICN': 'Seoul',
      'PEK': 'Shanghai',
      'MAD': 'Madrid',
      'FCO': 'Rome',
      'AMS': 'Amsterdam',
      'ZUR': 'Zurich',
      'VIE': 'Vienna',
      'BRU': 'Brussels',
      'CPH': 'Copenhagen',
      'ARN': 'Stockholm',
      'OSL': 'Oslo',
      'HEL': 'Helsinki',
      'WAW': 'Warsaw',
      'PRG': 'Prague',
      'BUD': 'Budapest',
      'ATH': 'Athens',
      'IST': 'Istanbul',
      'SOF': 'Sofia',
      'BUH': 'Bucharest',
      'OTP': 'Bucharest',
      'KBP': 'Kiev',
      'SVO': 'Moscow',
      'LED': 'Moscow',
      'BEG': 'Belgrade',
      'TGD': 'Podgorica',
      'CAI': 'Cairo',
      'JNB': 'Johannesburg',
      'CPT': 'Cape_Town',
      'LAD': 'Luanda',
      'LOS': 'Lagos',
      'NBO': 'Nairobi',
      'ADD': 'Addis_Ababa',
      'MEL': 'Melbourne',
      'BNE': 'Brisbane',
      'PER': 'Perth',
      'ADL': 'Adelaide',
      'AKL': 'Auckland',
      'GRU': 'Sao_Paulo',
      'GIG': 'Sao_Paulo',
      'EZE': 'Buenos_Aires',
      'LIM': 'Lima',
      'SCL': 'Santiago',
      'BOG': 'Bogota'
    };

    const cityName = airportToCity[airportCode.toUpperCase()];
    if (!cityName) {
      return null;
    }

    // Try to get timezone from WorldTimeAPI
    const response = await fetch(`https://worldtimeapi.org/api/timezone`);
    if (!response.ok) {
      return null;
    }

    const timezones = await response.json();
    
    // Find timezone that contains the city name
    const matchingTimezone = timezones.find((tz: string) => 
      tz.toLowerCase().includes(cityName.toLowerCase())
    );

    return matchingTimezone || null;
  } catch (error) {
    console.error('Error fetching timezone from API:', error);
    return null;
  }
};

// Function to get timezone with caching and fallback
const getTimezone = async (airportCode: string): Promise<string | null> => {
  const code = airportCode.toUpperCase();
  
  // Check cache first
  if (timezoneCache.has(code)) {
    return timezoneCache.get(code) || null;
  }

  // Check fallback mapping
  if (airportTimezones[code]) {
    timezoneCache.set(code, airportTimezones[code]);
    return airportTimezones[code];
  }

  // Try API lookup
  try {
    const timezone = await getTimezoneFromAPI(code);
    if (timezone) {
      timezoneCache.set(code, timezone);
      return timezone;
    }
  } catch (error) {
    console.error('API lookup failed:', error);
  }

  return null;
};

export const getLocalTime = async (airportCode: string, currentTime?: Date): Promise<string> => {
  const timezone = await getTimezone(airportCode);
  
  if (!timezone) {
    return 'זמן לא זמין';
  }
  
  try {
    const timeToUse = currentTime || new Date();
    const localTime = moment(timeToUse).tz(timezone).format('HH:mm');
    return localTime;
  } catch (error) {
    console.error('Error getting local time:', error);
    return 'שגיאה בשעה';
  }
};

export const getLocalTimeWithDate = async (airportCode: string, currentTime?: Date): Promise<string> => {
  const timezone = await getTimezone(airportCode);
  
  if (!timezone) {
    return 'זמן לא זמין';
  }
  
  try {
    const timeToUse = currentTime || new Date();
    const localDate = moment(timeToUse).tz(timezone).format('DD/MM');
    return localDate;
  } catch (error) {
    console.error('Error getting local time:', error);
    return 'שגיאה בשעה';
  }
};

export const getTimezoneName = (airportCode: string): string => {
  const timezone = airportTimezones[airportCode.toUpperCase()];
  
  if (!timezone) {
    return '';
  }
  
  // Extract city name from timezone
  const parts = timezone.split('/');
  return parts[parts.length - 1].replace('_', ' ');
};

// Function to get UTC offset for a city
export const getCityUTCOffset = async (cityName: string): Promise<string> => {
  try {
    const timezone = await getTimezone(cityName);
    if (!timezone) {
      return 'UTC+0';
    }
    
    const now = moment();
    const offset = now.tz(timezone).utcOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    
    if (minutes === 0) {
      return `UTC${sign}${hours}`;
    } else {
      return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
    }
  } catch (error) {
    console.error('Error getting UTC offset:', error);
    return 'UTC+0';
  }
};

// Function to convert local time to UTC for a specific city
export const convertLocalTimeToUTC = async (localTime: string, cityName: string): Promise<string> => {
  try {
    const timezone = await getTimezone(cityName);
    if (!timezone) {
      return localTime;
    }
    
    // Create a moment object with the local time in the city's timezone
    const localMoment = moment.tz(localTime, 'HH:mm', timezone);
    
    // Convert to UTC
    const utcMoment = localMoment.utc();
    
    // Return in HH:mm format
    return utcMoment.format('HH:mm');
  } catch (error) {
    console.error('Error converting local time to UTC:', error);
    return localTime;
  }
};

// Function to convert UTC time to local time for a specific city
export const convertUTCToLocalTime = async (utcTime: string, cityName: string): Promise<string> => {
  try {
    const timezone = await getTimezone(cityName);
    if (!timezone) {
      return utcTime;
    }
    
    // Create a moment object with the UTC time
    const utcMoment = moment.utc(utcTime, 'HH:mm');
    
    // Convert to local time in the city's timezone
    const localMoment = utcMoment.tz(timezone);
    
    // Return in HH:mm format
    return localMoment.format('HH:mm');
  } catch (error) {
    console.error('Error converting UTC to local time:', error);
    return utcTime;
  }
};
