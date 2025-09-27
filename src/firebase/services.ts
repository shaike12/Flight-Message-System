import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth } from './config';
import { MessageTemplate, GeneratedMessage, FlightRoute, City, CustomVariable } from '../types';

// Flight Routes Services
export const fetchFlightRoutes = async (): Promise<FlightRoute[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'flightRoutes'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert any Timestamp objects to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as unknown as FlightRoute;
    });
  } catch (error) {
    console.error('Error fetching flight routes:', error);
    throw error;
  }
};

export const addFlightRoute = async (route: Omit<FlightRoute, 'id'>): Promise<string> => {
  try {
    // Ensure cities exist in the cities collection before adding the route
    await ensureCitiesExist(route);
    
    const docRef = await addDoc(collection(db, 'flightRoutes'), route);
    return docRef.id;
  } catch (error) {
    console.error('Error adding flight route:', error);
    throw error;
  }
};

export const updateFlightRoute = async (id: string, route: Partial<FlightRoute>): Promise<void> => {
  try {
    const routeRef = doc(db, 'flightRoutes', id);
    await updateDoc(routeRef, route);
  } catch (error) {
    console.error('Error updating flight route:', error);
    throw error;
  }
};

export const deleteFlightRoute = async (id: string): Promise<void> => {
  try {
    const routeRef = doc(db, 'flightRoutes', id);
    await deleteDoc(routeRef);
  } catch (error) {
    console.error('Error deleting flight route:', error);
    throw error;
  }
};

// Templates Services
export const fetchTemplates = async (): Promise<MessageTemplate[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'templates'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert any Timestamp objects to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as unknown as MessageTemplate;
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

export const addTemplate = async (template: Omit<MessageTemplate, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'templates'), template);
    return docRef.id;
  } catch (error) {
    console.error('Error adding template:', error);
    throw error;
  }
};

export const updateTemplate = async (id: string, template: Partial<MessageTemplate>): Promise<void> => {
  try {
    const templateRef = doc(db, 'templates', id);
    await updateDoc(templateRef, template);
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    const templateRef = doc(db, 'templates', id);
    await deleteDoc(templateRef);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

export const setActiveTemplate = async (id: string, isActive: boolean): Promise<void> => {
  try {
    const templateRef = doc(db, 'templates', id);
    await updateDoc(templateRef, { isActive });
  } catch (error) {
    console.error('Error setting active template:', error);
    throw error;
  }
};

// Messages Services
export const fetchMessages = async (): Promise<GeneratedMessage[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'messages'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GeneratedMessage[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const addMessage = async (message: Omit<GeneratedMessage, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), message);
    return docRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const updateMessage = async (id: string, message: Partial<GeneratedMessage>): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', id);
    await updateDoc(messageRef, message);
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

export const deleteMessage = async (id: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', id);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Airport code to Hebrew/English name mapping - Comprehensive list
const airportMappings: { [key: string]: { hebrew: string; english: string; country: string } } = {
  // Israel
  'TLV': { hebrew: 'תל אביב', english: 'Tel Aviv', country: 'ישראל' },
  'ETH': { hebrew: 'אילת', english: 'Eilat', country: 'ישראל' },
  'VDA': { hebrew: 'אילת', english: 'Eilat', country: 'ישראל' },
  
  // North America - USA
  'JFK': { hebrew: 'ניו יורק', english: 'New York', country: 'ארה"ב' },
  'LGA': { hebrew: 'ניו יורק', english: 'New York', country: 'ארה"ב' },
  'EWR': { hebrew: 'ניו יורק', english: 'New York', country: 'ארה"ב' },
  'LAX': { hebrew: 'לוס אנג\'לס', english: 'Los Angeles', country: 'ארה"ב' },
  'MIA': { hebrew: 'מיאמי', english: 'Miami', country: 'ארה"ב' },
  'BOS': { hebrew: 'בוסטון', english: 'Boston', country: 'ארה"ב' },
  'ORD': { hebrew: 'שיקגו', english: 'Chicago', country: 'ארה"ב' },
  'SFO': { hebrew: 'סן פרנסיסקו', english: 'San Francisco', country: 'ארה"ב' },
  'LAS': { hebrew: 'לאס וגאס', english: 'Las Vegas', country: 'ארה"ב' },
  'SEA': { hebrew: 'סיאטל', english: 'Seattle', country: 'ארה"ב' },
  'DEN': { hebrew: 'דנוור', english: 'Denver', country: 'ארה"ב' },
  'ATL': { hebrew: 'אטלנטה', english: 'Atlanta', country: 'ארה"ב' },
  'DFW': { hebrew: 'דאלאס', english: 'Dallas', country: 'ארה"ב' },
  'IAH': { hebrew: 'יוסטון', english: 'Houston', country: 'ארה"ב' },
  'PHX': { hebrew: 'פיניקס', english: 'Phoenix', country: 'ארה"ב' },
  'PHL': { hebrew: 'פילדלפיה', english: 'Philadelphia', country: 'ארה"ב' },
  'DCA': { hebrew: 'וושינגטון', english: 'Washington', country: 'ארה"ב' },
  'IAD': { hebrew: 'וושינגטון', english: 'Washington', country: 'ארה"ב' },
  'MCO': { hebrew: 'אורלנדו', english: 'Orlando', country: 'ארה"ב' },
  'FLL': { hebrew: 'פורט לודרדייל', english: 'Fort Lauderdale', country: 'ארה"ב' },
  
  // North America - Canada
  'YYZ': { hebrew: 'טורונטו', english: 'Toronto', country: 'קנדה' },
  'YVR': { hebrew: 'ונקובר', english: 'Vancouver', country: 'קנדה' },
  'YUL': { hebrew: 'מונטריאול', english: 'Montreal', country: 'קנדה' },
  'YYC': { hebrew: 'קלגרי', english: 'Calgary', country: 'קנדה' },
  
  // Europe - UK & Ireland
  'LHR': { hebrew: 'לונדון', english: 'London', country: 'אנגליה' },
  'LGW': { hebrew: 'לונדון', english: 'London', country: 'אנגליה' },
  'STN': { hebrew: 'לונדון', english: 'London', country: 'אנגליה' },
  'LTN': { hebrew: 'לונדון', english: 'London', country: 'אנגליה' },
  'MAN': { hebrew: 'מנצ\'סטר', english: 'Manchester', country: 'אנגליה' },
  'BHX': { hebrew: 'בירמינגהם', english: 'Birmingham', country: 'אנגליה' },
  'DUB': { hebrew: 'דבלין', english: 'Dublin', country: 'אירלנד' },
  
  // Europe - France
  'CDG': { hebrew: 'פריז', english: 'Paris', country: 'צרפת' },
  'ORY': { hebrew: 'פריז', english: 'Paris', country: 'צרפת' },
  'NCE': { hebrew: 'ניס', english: 'Nice', country: 'צרפת' },
  'LYS': { hebrew: 'ליון', english: 'Lyon', country: 'צרפת' },
  'MRS': { hebrew: 'מרסיי', english: 'Marseille', country: 'צרפת' },
  'TLS': { hebrew: 'טולוז', english: 'Toulouse', country: 'צרפת' },
  
  // Europe - Germany
  'FRA': { hebrew: 'פרנקפורט', english: 'Frankfurt', country: 'גרמניה' },
  'MUC': { hebrew: 'מינכן', english: 'Munich', country: 'גרמניה' },
  'TXL': { hebrew: 'ברלין', english: 'Berlin', country: 'גרמניה' },
  'SXF': { hebrew: 'ברלין', english: 'Berlin', country: 'גרמניה' },
  'BER': { hebrew: 'ברלין', english: 'Berlin', country: 'גרמניה' },
  'HAM': { hebrew: 'המבורג', english: 'Hamburg', country: 'גרמניה' },
  'DUS': { hebrew: 'דיסלדורף', english: 'Düsseldorf', country: 'גרמניה' },
  'CGN': { hebrew: 'קלן', english: 'Cologne', country: 'גרמניה' },
  'STR': { hebrew: 'שטוטגרט', english: 'Stuttgart', country: 'גרמניה' },
  
  // Europe - Spain
  'MAD': { hebrew: 'מדריד', english: 'Madrid', country: 'ספרד' },
  'BCN': { hebrew: 'ברצלונה', english: 'Barcelona', country: 'ספרד' },
  'AGP': { hebrew: 'מלגה', english: 'Malaga', country: 'ספרד' },
  'PMI': { hebrew: 'פלמה דה מיורקה', english: 'Palma de Mallorca', country: 'ספרד' },
  'VLC': { hebrew: 'ולנסיה', english: 'Valencia', country: 'ספרד' },
  'SVQ': { hebrew: 'סביליה', english: 'Seville', country: 'ספרד' },
  'BIO': { hebrew: 'בילבאו', english: 'Bilbao', country: 'ספרד' },
  
  // Europe - Italy
  'FCO': { hebrew: 'רומא', english: 'Rome', country: 'איטליה' },
  'MXP': { hebrew: 'מילאנו', english: 'Milan', country: 'איטליה' },
  'LIN': { hebrew: 'מילאנו', english: 'Milan', country: 'איטליה' },
  'VCE': { hebrew: 'ונציה', english: 'Venice', country: 'איטליה' },
  'FLR': { hebrew: 'פירנצה', english: 'Florence', country: 'איטליה' },
  'NAP': { hebrew: 'נאפולי', english: 'Naples', country: 'איטליה' },
  'BRI': { hebrew: 'בארי', english: 'Bari', country: 'איטליה' },
  'CTA': { hebrew: 'קטניה', english: 'Catania', country: 'איטליה' },
  'PMO': { hebrew: 'פלרמו', english: 'Palermo', country: 'איטליה' },
  
  // Europe - Switzerland & Austria
  'ZUR': { hebrew: 'ציריך', english: 'Zurich', country: 'שוויץ' },
  'ZRH': { hebrew: 'ציריך', english: 'Zurich', country: 'שוויץ' },
  'GVA': { hebrew: 'ז\'נבה', english: 'Geneva', country: 'שוויץ' },
  'BSL': { hebrew: 'בזל', english: 'Basel', country: 'שוויץ' },
  'VIE': { hebrew: 'וינה', english: 'Vienna', country: 'אוסטריה' },
  'SZG': { hebrew: 'זלצבורג', english: 'Salzburg', country: 'אוסטריה' },
  'INN': { hebrew: 'אינסברוק', english: 'Innsbruck', country: 'אוסטריה' },
  
  // Europe - Netherlands & Belgium
  'AMS': { hebrew: 'אמסטרדם', english: 'Amsterdam', country: 'הולנד' },
  'EIN': { hebrew: 'איינדהובן', english: 'Eindhoven', country: 'הולנד' },
  'RTM': { hebrew: 'רוטרדם', english: 'Rotterdam', country: 'הולנד' },
  'BRU': { hebrew: 'בריסל', english: 'Brussels', country: 'בלגיה' },
  'BUS': { hebrew: 'בריסל', english: 'Brussels', country: 'בלגיה' },
  'ANR': { hebrew: 'אנטוורפן', english: 'Antwerp', country: 'בלגיה' },
  
  // Europe - Scandinavia
  'ARN': { hebrew: 'סטוקהולם', english: 'Stockholm', country: 'שוודיה' },
  'GOT': { hebrew: 'גטבורג', english: 'Gothenburg', country: 'שוודיה' },
  'CPH': { hebrew: 'קופנהגן', english: 'Copenhagen', country: 'דנמרק' },
  'OSL': { hebrew: 'אוסלו', english: 'Oslo', country: 'נורווגיה' },
  'HEL': { hebrew: 'הלסינקי', english: 'Helsinki', country: 'פינלנד' },
  
  // Europe - Eastern Europe
  'SVO': { hebrew: 'מוסקבה', english: 'Moscow', country: 'רוסיה' },
  'DME': { hebrew: 'מוסקבה', english: 'Moscow', country: 'רוסיה' },
  'LED': { hebrew: 'סנט פטרסבורג', english: 'St. Petersburg', country: 'רוסיה' },
  'KBP': { hebrew: 'קייב', english: 'Kiev', country: 'אוקראינה' },
  'BUD': { hebrew: 'בודפשט', english: 'Budapest', country: 'הונגריה' },
  'PRG': { hebrew: 'פראג', english: 'Prague', country: 'צ\'כיה' },
  'WAW': { hebrew: 'ורשה', english: 'Warsaw', country: 'פולין' },
  'KRK': { hebrew: 'קרקוב', english: 'Krakow', country: 'פולין' },
  'SOF': { hebrew: 'סופיה', english: 'Sofia', country: 'בולגריה' },
  'OTP': { hebrew: 'בוקרשט', english: 'Bucharest', country: 'רומניה' },
  'ZAG': { hebrew: 'זאגרב', english: 'Zagreb', country: 'קרואטיה' },
  'LJU': { hebrew: 'ליובליאנה', english: 'Ljubljana', country: 'סלובניה' },
  'BEG': { hebrew: 'בלגרד', english: 'Belgrade', country: 'סרביה' },
  'TGD': { hebrew: 'מונטנגרו', english: 'Montenegro', country: 'מונטנגרו' },
  'TIV': { hebrew: 'טיבאט', english: 'Tivat', country: 'מונטנגרו' },
  'TBS': { hebrew: 'טיביליסי', english: 'Tbilisi', country: 'גאורגיה' },
  'RMO': { hebrew: 'קישינב', english: 'Kishinev', country: 'מולדובה' },
  'SKG': { hebrew: 'סלוניקי', english: 'Thessaloniki', country: 'יוון' },
  'ATH': { hebrew: 'אתונה', english: 'Athens', country: 'יוון' },
  'PFO': { hebrew: 'פאפוס', english: 'Paphos', country: 'קפריסין' },
  'LCA': { hebrew: 'לרנקה', english: 'Larnaca', country: 'קפריסין' },
  'RHO': { hebrew: 'רודוס', english: 'Rhodos', country: 'יוון' },
  'JSH': { hebrew: 'סיטיה', english: 'Sitia', country: 'יוון' },
  'EFL': { hebrew: 'קפלוניה', english: 'Kefalonia', country: 'יוון' },
  'PVK': { hebrew: 'אקטיון', english: 'Aktion', country: 'יוון' },
  'JTR': { hebrew: 'סנטוריני', english: 'Santorini', country: 'יוון' },
  
  // Africa - Morocco
  'RAK': { hebrew: 'מרקש', english: 'Marrakech', country: 'מרוקו' },
  
  // Europe - Portugal
  'LIS': { hebrew: 'ליסבון', english: 'Lisbon', country: 'פורטוגל' },
  'OPO': { hebrew: 'פורטו', english: 'Porto', country: 'פורטוגל' },
  'FAO': { hebrew: 'פארו', english: 'Faro', country: 'פורטוגל' },
  
  // Middle East
  'IST': { hebrew: 'איסטנבול', english: 'Istanbul', country: 'טורקיה' },
  'SAW': { hebrew: 'איסטנבול', english: 'Istanbul', country: 'טורקיה' },
  'ADB': { hebrew: 'איזמיר', english: 'Izmir', country: 'טורקיה' },
  'AYT': { hebrew: 'אנטליה', english: 'Antalya', country: 'טורקיה' },
  'DXB': { hebrew: 'דובאי', english: 'Dubai', country: 'איחוד האמירויות' },
  'AUH': { hebrew: 'אבו דאבי', english: 'Abu Dhabi', country: 'איחוד האמירויות' },
  'DOH': { hebrew: 'דוחה', english: 'Doha', country: 'קטאר' },
  'KWI': { hebrew: 'כווית', english: 'Kuwait', country: 'כווית' },
  'BAH': { hebrew: 'בחריין', english: 'Bahrain', country: 'בחריין' },
  'RUH': { hebrew: 'ריאד', english: 'Riyadh', country: 'ערב הסעודית' },
  'JED': { hebrew: 'ג\'דה', english: 'Jeddah', country: 'ערב הסעודית' },
  'AMM': { hebrew: 'עמאן', english: 'Amman', country: 'ירדן' },
  'BEY': { hebrew: 'ביירות', english: 'Beirut', country: 'לבנון' },
  'DAM': { hebrew: 'דמשק', english: 'Damascus', country: 'סוריה' },
  'BGW': { hebrew: 'בגדד', english: 'Baghdad', country: 'עיראק' },
  'THR': { hebrew: 'טהרן', english: 'Tehran', country: 'איראן' },
  
  // Asia - East Asia
  'NRT': { hebrew: 'טוקיו', english: 'Tokyo', country: 'יפן' },
  'HND': { hebrew: 'טוקיו', english: 'Tokyo', country: 'יפן' },
  'KIX': { hebrew: 'אוסקה', english: 'Osaka', country: 'יפן' },
  'NGO': { hebrew: 'נגויה', english: 'Nagoya', country: 'יפן' },
  'FUK': { hebrew: 'פוקואוקה', english: 'Fukuoka', country: 'יפן' },
  'ICN': { hebrew: 'סיאול', english: 'Seoul', country: 'דרום קוריאה' },
  'GMP': { hebrew: 'סיאול', english: 'Seoul', country: 'דרום קוריאה' },
  'PUS': { hebrew: 'פוסן', english: 'Busan', country: 'דרום קוריאה' },
  'PEK': { hebrew: 'בייג\'ינג', english: 'Beijing', country: 'סין' },
  'PVG': { hebrew: 'שנגחאי', english: 'Shanghai', country: 'סין' },
  'CAN': { hebrew: 'גואנגז\'ו', english: 'Guangzhou', country: 'סין' },
  'SZX': { hebrew: 'שנז\'ן', english: 'Shenzhen', country: 'סין' },
  'HKG': { hebrew: 'הונג קונג', english: 'Hong Kong', country: 'הונג קונג' },
  'TPE': { hebrew: 'טייפה', english: 'Taipei', country: 'טייוואן' },
  'TSA': { hebrew: 'טייפה', english: 'Taipei', country: 'טייוואן' },
  
  // Asia - Southeast Asia
  'SIN': { hebrew: 'סינגפור', english: 'Singapore', country: 'סינגפור' },
  'KUL': { hebrew: 'קואלה לומפור', english: 'Kuala Lumpur', country: 'מלזיה' },
  'BKK': { hebrew: 'בנגקוק', english: 'Bangkok', country: 'תאילנד' },
  'CNX': { hebrew: 'צ\'יאנג מאי', english: 'Chiang Mai', country: 'תאילנד' },
  'HKT': { hebrew: 'פוקט', english: 'Phuket', country: 'תאילנד' },
  'CGK': { hebrew: 'ג\'קרטה', english: 'Jakarta', country: 'אינדונזיה' },
  'DPS': { hebrew: 'דנפסאר', english: 'Denpasar', country: 'אינדונזיה' },
  'MNL': { hebrew: 'מנילה', english: 'Manila', country: 'הפיליפינים' },
  'CEB': { hebrew: 'סבו', english: 'Cebu', country: 'הפיליפינים' },
  'HAN': { hebrew: 'האנוי', english: 'Hanoi', country: 'וייטנאם' },
  'SGN': { hebrew: 'הו צ\'י מין סיטי', english: 'Ho Chi Minh City', country: 'וייטנאם' },
  'PNH': { hebrew: 'פנום פן', english: 'Phnom Penh', country: 'קמבודיה' },
  'REP': { hebrew: 'סיאם ריפ', english: 'Siem Reap', country: 'קמבודיה' },
  'VTE': { hebrew: 'ויינטיאן', english: 'Vientiane', country: 'לאוס' },
  'RGN': { hebrew: 'יאנגון', english: 'Yangon', country: 'מיאנמר' },
  
  // Asia - South Asia
  'BOM': { hebrew: 'מומבאי', english: 'Mumbai', country: 'הודו' },
  'DEL': { hebrew: 'ניו דלהי', english: 'New Delhi', country: 'הודו' },
  'BLR': { hebrew: 'בנגלור', english: 'Bangalore', country: 'הודו' },
  'MAA': { hebrew: 'צ\'נאי', english: 'Chennai', country: 'הודו' },
  'CCU': { hebrew: 'קולקטה', english: 'Kolkata', country: 'הודו' },
  'HYD': { hebrew: 'היידראבאד', english: 'Hyderabad', country: 'הודו' },
  'KTM': { hebrew: 'קטמנדו', english: 'Kathmandu', country: 'נפאל' },
  'CMB': { hebrew: 'קולומבו', english: 'Colombo', country: 'סרי לנקה' },
  'DAC': { hebrew: 'דאקה', english: 'Dhaka', country: 'בנגלדש' },
  'ISB': { hebrew: 'אסאבאד', english: 'Islamabad', country: 'פקיסטן' },
  'KHI': { hebrew: 'קראצ\'י', english: 'Karachi', country: 'פקיסטן' },
  'LHE': { hebrew: 'להאור', english: 'Lahore', country: 'פקיסטן' },
  
  // Asia - Central Asia
  'TAS': { hebrew: 'טשקנט', english: 'Tashkent', country: 'אוזבקיסטן' },
  'ALA': { hebrew: 'אלמטי', english: 'Almaty', country: 'קזחסטן' },
  'FRU': { hebrew: 'בישקק', english: 'Bishkek', country: 'קירגיזסטן' },
  'DYU': { hebrew: 'דושנבה', english: 'Dushanbe', country: 'טג\'יקיסטן' },
  'ASB': { hebrew: 'אשגבאט', english: 'Ashgabat', country: 'טורקמניסטן' },
  
  // Africa - North Africa
  'CAI': { hebrew: 'קהיר', english: 'Cairo', country: 'מצרים' },
  'HRG': { hebrew: 'חורגדה', english: 'Hurghada', country: 'מצרים' },
  'SSH': { hebrew: 'שארם א-שייח\'', english: 'Sharm el-Sheikh', country: 'מצרים' },
  'ALG': { hebrew: 'אלג\'יר', english: 'Algiers', country: 'אלג\'יריה' },
  'TUN': { hebrew: 'תוניס', english: 'Tunis', country: 'תוניסיה' },
  'CMN': { hebrew: 'קזבלנקה', english: 'Casablanca', country: 'מרוקו' },
  'RBA': { hebrew: 'רבאט', english: 'Rabat', country: 'מרוקו' },
  'FEZ': { hebrew: 'פאס', english: 'Fez', country: 'מרוקו' },
  'TRV': { hebrew: 'טריפולי', english: 'Tripoli', country: 'לוב' },
  
  // Africa - West Africa
  'LOS': { hebrew: 'לאגוס', english: 'Lagos', country: 'ניגריה' },
  'ABV': { hebrew: 'אבוג\'ה', english: 'Abuja', country: 'ניגריה' },
  'ACC': { hebrew: 'אקרה', english: 'Accra', country: 'גאנה' },
  'DKR': { hebrew: 'דאקר', english: 'Dakar', country: 'סנגל' },
  'BKO': { hebrew: 'במאקו', english: 'Bamako', country: 'מאלי' },
  'OUA': { hebrew: 'ואגאדוגו', english: 'Ouagadougou', country: 'בורקינה פאסו' },
  'NIM': { hebrew: 'ניאמיי', english: 'Niamey', country: 'ניז\'ר' },
  'NDJ': { hebrew: 'נג\'מנה', english: 'N\'Djamena', country: 'צ\'אד' },
  
  // Africa - East Africa
  'ADD': { hebrew: 'אדיס אבבה', english: 'Addis Ababa', country: 'אתיופיה' },
  'NBO': { hebrew: 'ניירובי', english: 'Nairobi', country: 'קניה' },
  'DAR': { hebrew: 'דאר א-סאלאם', english: 'Dar es Salaam', country: 'טנזניה' },
  'KGL': { hebrew: 'קיגאלי', english: 'Kigali', country: 'רואנדה' },
  'EBB': { hebrew: 'קמפלה', english: 'Kampala', country: 'אוגנדה' },
  'JIB': { hebrew: 'ג\'יבוטי', english: 'Djibouti', country: 'ג\'יבוטי' },
  'MOG': { hebrew: 'מוגדישו', english: 'Mogadishu', country: 'סומליה' },
  'ASM': { hebrew: 'אסמרה', english: 'Asmara', country: 'אריתריאה' },
  
  // Africa - Central Africa
  'FIH': { hebrew: 'קינשאסה', english: 'Kinshasa', country: 'הרפובליקה הדמוקרטית של קונגו' },
  'BZV': { hebrew: 'ברזוויל', english: 'Brazzaville', country: 'הרפובליקה של קונגו' },
  'BGF': { hebrew: 'בנגי', english: 'Bangui', country: 'הרפובליקה המרכז-אפריקאית' },
  'BLL': { hebrew: 'בלינגה', english: 'Belinga', country: 'גבון' },
  'SSG': { hebrew: 'מלאבו', english: 'Malabo', country: 'גינאה המשוונית' },
  'SAO': { hebrew: 'סאו טומה', english: 'São Tomé', country: 'סאו טומה ופרינסיפה' },
  
  // Africa - Southern Africa
  'JNB': { hebrew: 'יוהנסבורג', english: 'Johannesburg', country: 'דרום אפריקה' },
  'CPT': { hebrew: 'קייפטאון', english: 'Cape Town', country: 'דרום אפריקה' },
  'DUR': { hebrew: 'דרבן', english: 'Durban', country: 'דרום אפריקה' },
  'HRE': { hebrew: 'הררה', english: 'Harare', country: 'זימבבואה' },
  'LUN': { hebrew: 'לוסקה', english: 'Lusaka', country: 'זמביה' },
  'GBE': { hebrew: 'גאבורון', english: 'Gaborone', country: 'בוטסואנה' },
  'WDH': { hebrew: 'וינדהוק', english: 'Windhoek', country: 'נמיביה' },
  'MPM': { hebrew: 'מפוטו', english: 'Maputo', country: 'מוזמביק' },
  'LLW': { hebrew: 'לילונגווה', english: 'Lilongwe', country: 'מלאווי' },
  'TNR': { hebrew: 'אנטננריבו', english: 'Antananarivo', country: 'מדגסקר' },
  'MRU': { hebrew: 'פורט לואי', english: 'Port Louis', country: 'מאוריציוס' },
  
  // South America
  'GRU': { hebrew: 'סאו פאולו', english: 'São Paulo', country: 'ברזיל' },
  'GIG': { hebrew: 'ריו דה ז\'ניירו', english: 'Rio de Janeiro', country: 'ברזיל' },
  'BSB': { hebrew: 'ברזיליה', english: 'Brasília', country: 'ברזיל' },
  'CNF': { hebrew: 'בלו הוריזונטה', english: 'Belo Horizonte', country: 'ברזיל' },
  'SSA': { hebrew: 'סלבדור', english: 'Salvador', country: 'ברזיל' },
  'REC': { hebrew: 'רסיפה', english: 'Recife', country: 'ברזיל' },
  'FOR': { hebrew: 'פורטלזה', english: 'Fortaleza', country: 'ברזיל' },
  'EZE': { hebrew: 'בואנוס איירס', english: 'Buenos Aires', country: 'ארגנטינה' },
  'AEP': { hebrew: 'בואנוס איירס', english: 'Buenos Aires', country: 'ארגנטינה' },
  'COR': { hebrew: 'קורדובה', english: 'Córdoba', country: 'ארגנטינה' },
  'MDZ': { hebrew: 'מנדוסה', english: 'Mendoza', country: 'ארגנטינה' },
  'SCL': { hebrew: 'סנטיאגו', english: 'Santiago', country: 'צ\'ילה' },
  'LIM': { hebrew: 'לימה', english: 'Lima', country: 'פרו' },
  'CUZ': { hebrew: 'קוסקו', english: 'Cusco', country: 'פרו' },
  'BOG': { hebrew: 'בוגוטה', english: 'Bogotá', country: 'קולומביה' },
  'CCS': { hebrew: 'קראקס', english: 'Caracas', country: 'ונצואלה' },
  'UIO': { hebrew: 'קיטו', english: 'Quito', country: 'אקוודור' },
  'GYE': { hebrew: 'גואיאקיל', english: 'Guayaquil', country: 'אקוודור' },
  'ASU': { hebrew: 'אסונסיון', english: 'Asunción', country: 'פרגוואי' },
  'MVD': { hebrew: 'מונטווידאו', english: 'Montevideo', country: 'אורוגוואי' },
  'GEO': { hebrew: 'ג\'ורג\'טאון', english: 'Georgetown', country: 'גיאנה' },
  'PBM': { hebrew: 'פרמריבו', english: 'Paramaribo', country: 'סורינאם' },
  
  // Central America & Caribbean
  'MEX': { hebrew: 'מקסיקו סיטי', english: 'Mexico City', country: 'מקסיקו' },
  'CUN': { hebrew: 'קנקון', english: 'Cancún', country: 'מקסיקו' },
  'GDL': { hebrew: 'גוודלחרה', english: 'Guadalajara', country: 'מקסיקו' },
  'MTY': { hebrew: 'מונטריי', english: 'Monterrey', country: 'מקסיקו' },
  'GUA': { hebrew: 'גואטמלה סיטי', english: 'Guatemala City', country: 'גואטמלה' },
  'SAL': { hebrew: 'סן סלבדור', english: 'San Salvador', country: 'אל סלבדור' },
  'TGU': { hebrew: 'טגוסיגלפה', english: 'Tegucigalpa', country: 'הונדורס' },
  'MGA': { hebrew: 'מנגואה', english: 'Managua', country: 'ניקרגואה' },
  'SJO': { hebrew: 'סן חוסה', english: 'San José', country: 'קוסטה ריקה' },
  'PTY': { hebrew: 'פנמה סיטי', english: 'Panama City', country: 'פנמה' },
  'HAV': { hebrew: 'הוואנה', english: 'Havana', country: 'קובה' },
  'SDQ': { hebrew: 'סנטו דומינגו', english: 'Santo Domingo', country: 'הרפובליקה הדומיניקנית' },
  'PUJ': { hebrew: 'פונטה קנה', english: 'Punta Cana', country: 'הרפובליקה הדומיניקנית' },
  'KIN': { hebrew: 'קינגסטון', english: 'Kingston', country: 'ג\'מייקה' },
  'NAS': { hebrew: 'נסאו', english: 'Nassau', country: 'איי בהאמה' },
  'BGI': { hebrew: 'ברידג\'טאון', english: 'Bridgetown', country: 'ברבדוס' },
  'POS': { hebrew: 'פורט אוף ספיין', english: 'Port of Spain', country: 'טרינידד וטובגו' },
  
  // Australia & Oceania
  'SYD': { hebrew: 'סידני', english: 'Sydney', country: 'אוסטרליה' },
  'MEL': { hebrew: 'מלבורן', english: 'Melbourne', country: 'אוסטרליה' },
  'BNE': { hebrew: 'בריסביין', english: 'Brisbane', country: 'אוסטרליה' },
  'PER': { hebrew: 'פרת\'', english: 'Perth', country: 'אוסטרליה' },
  'ADL': { hebrew: 'אדלייד', english: 'Adelaide', country: 'אוסטרליה' },
  'CBR': { hebrew: 'קנברה', english: 'Canberra', country: 'אוסטרליה' },
  'DRW': { hebrew: 'דרווין', english: 'Darwin', country: 'אוסטרליה' },
  'HOB': { hebrew: 'הובארט', english: 'Hobart', country: 'אוסטרליה' },
  'AKL': { hebrew: 'אוקלנד', english: 'Auckland', country: 'ניו זילנד' },
  'WLG': { hebrew: 'וולינגטון', english: 'Wellington', country: 'ניו זילנד' },
  'CHC': { hebrew: 'כרייסטצ\'רץ\'', english: 'Christchurch', country: 'ניו זילנד' },
  'NAN': { hebrew: 'נאדי', english: 'Nadi', country: 'פיג\'י' },
  'PPT': { hebrew: 'פפאטה', english: 'Papeete', country: 'פולינזיה הצרפתית' },
  'HNL': { hebrew: 'הונולולו', english: 'Honolulu', country: 'הוואי' },
  'GUM': { hebrew: 'גואם', english: 'Guam', country: 'גואם' },
  'SPN': { hebrew: 'סאיפן', english: 'Saipan', country: 'איי מריאנה הצפוניים' },
};

// Function to check which routes have missing data
export const checkMissingFlightRouteData = async (): Promise<{
  totalRoutes: number;
  routesWithMissingData: any[];
  missingAirportCodes: string[];
}> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'flightRoutes'));
    const routesWithMissingData: any[] = [];
    const missingAirportCodes = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const route = doc.data();
      const routeId = doc.id;
      
      // Check if Hebrew or English names are missing or contain placeholder text
      const missingFields = [];
      if (!route.departureCityHebrew || route.departureCityHebrew === 'לא ידוע' || route.departureCityHebrew === 'Unknown') {
        missingFields.push('departureCityHebrew');
      }
      if (!route.departureCityEnglish || route.departureCityEnglish === 'Unknown' || route.departureCityEnglish === 'לא ידוע') {
        missingFields.push('departureCityEnglish');
      }
      if (!route.arrivalCityHebrew || route.arrivalCityHebrew === 'לא ידוע' || route.arrivalCityHebrew === 'Unknown') {
        missingFields.push('arrivalCityHebrew');
      }
      if (!route.arrivalCityEnglish || route.arrivalCityEnglish === 'Unknown' || route.arrivalCityEnglish === 'לא ידוע') {
        missingFields.push('arrivalCityEnglish');
      }
      
      if (missingFields.length > 0) {
        routesWithMissingData.push({
          id: routeId,
          flightNumber: route.flightNumber,
          departureCity: route.departureCity,
          arrivalCity: route.arrivalCity,
          missingFields,
          currentData: {
            departureCityHebrew: route.departureCityHebrew || 'MISSING',
            departureCityEnglish: route.departureCityEnglish || 'MISSING',
            arrivalCityHebrew: route.arrivalCityHebrew || 'MISSING',
            arrivalCityEnglish: route.arrivalCityEnglish || 'MISSING'
          }
        });
        
        // Add missing airport codes to set
        if (!route.departureCityHebrew || !route.departureCityEnglish) {
          missingAirportCodes.add(route.departureCity);
        }
        if (!route.arrivalCityHebrew || !route.arrivalCityEnglish) {
          missingAirportCodes.add(route.arrivalCity);
        }
      }
    });
    
    return {
      totalRoutes: querySnapshot.size,
      routesWithMissingData,
      missingAirportCodes: Array.from(missingAirportCodes)
    };
  } catch (error) {
    console.error('Error checking missing flight route data:', error);
    throw error;
  }
};

// Function to update flight routes with missing data
export const updateMissingFlightRouteData = async (): Promise<{
  updatedCount: number;
  failedUpdates: any[];
}> => {
  try {
    const { routesWithMissingData } = await checkMissingFlightRouteData();
    let updatedCount = 0;
    const failedUpdates = [];
    
    for (const route of routesWithMissingData) {
      try {
        const updateData: any = {};
        
        // Update departure city names if missing or contain placeholder text
        if ((!route.currentData.departureCityHebrew || 
             route.currentData.departureCityHebrew === 'לא ידוע' || 
             route.currentData.departureCityHebrew === 'Unknown' ||
             route.currentData.departureCityHebrew === 'MISSING') && 
            airportMappings[route.departureCity]) {
          updateData.departureCityHebrew = airportMappings[route.departureCity].hebrew;
        }
        if ((!route.currentData.departureCityEnglish || 
             route.currentData.departureCityEnglish === 'Unknown' || 
             route.currentData.departureCityEnglish === 'לא ידוע' ||
             route.currentData.departureCityEnglish === 'MISSING') && 
            airportMappings[route.departureCity]) {
          updateData.departureCityEnglish = airportMappings[route.departureCity].english;
        }
        
        // Update arrival city names if missing or contain placeholder text
        if ((!route.currentData.arrivalCityHebrew || 
             route.currentData.arrivalCityHebrew === 'לא ידוע' || 
             route.currentData.arrivalCityHebrew === 'Unknown' ||
             route.currentData.arrivalCityHebrew === 'MISSING') && 
            airportMappings[route.arrivalCity]) {
          updateData.arrivalCityHebrew = airportMappings[route.arrivalCity].hebrew;
        }
        if ((!route.currentData.arrivalCityEnglish || 
             route.currentData.arrivalCityEnglish === 'Unknown' || 
             route.currentData.arrivalCityEnglish === 'לא ידוע' ||
             route.currentData.arrivalCityEnglish === 'MISSING') && 
            airportMappings[route.arrivalCity]) {
          updateData.arrivalCityEnglish = airportMappings[route.arrivalCity].english;
        }
        
        if (Object.keys(updateData).length > 0) {
          await updateFlightRoute(route.id, updateData);
          updatedCount++;
          console.log(`Updated flight ${route.flightNumber}:`, updateData);
        }
      } catch (error) {
        console.error(`Failed to update flight ${route.flightNumber}:`, error);
        failedUpdates.push({ route, error });
      }
    }
    
    return { updatedCount, failedUpdates };
  } catch (error) {
    console.error('Error updating missing flight route data:', error);
    throw error;
  }
};

// Cities Services
export const fetchCities = async (): Promise<City[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'cities'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        // Convert any Timestamp objects to ISO strings if they exist
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as unknown as City;
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

export const addCity = async (city: Omit<City, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'cities'), city);
    return docRef.id;
  } catch (error) {
    console.error('Error adding city:', error);
    throw error;
  }
};

export const updateCity = async (id: string, city: Partial<City>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'cities', id), city);
  } catch (error) {
    console.error('Error updating city:', error);
    throw error;
  }
};

export const deleteCity = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'cities', id));
  } catch (error) {
    console.error('Error deleting city:', error);
    throw error;
  }
};

// Function to check if a city exists by code
export const checkCityExists = async (cityCode: string): Promise<boolean> => {
  try {
    const q = query(collection(db, 'cities'), where('code', '==', cityCode));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if city exists:', error);
    return false;
  }
};

// Function to add cities from flight route if they don't exist
export const ensureCitiesExist = async (route: Omit<FlightRoute, 'id'>): Promise<void> => {
  try {
    // Check and add departure city
    const departureExists = await checkCityExists(route.departureCity);
    if (!departureExists) {
      const departureMapping = airportMappings[route.departureCity];
      if (departureMapping) {
        await addCity({
          code: route.departureCity,
          name: route.departureCityHebrew || departureMapping.hebrew,
          englishName: route.departureCityEnglish || departureMapping.english,
          country: departureMapping.country,
          isElAlDestination: false // New cities from routes are not El Al destinations by default
        });
        console.log(`Added departure city: ${route.departureCity}`);
      }
    }

    // Check and add arrival city
    const arrivalExists = await checkCityExists(route.arrivalCity);
    if (!arrivalExists) {
      const arrivalMapping = airportMappings[route.arrivalCity];
      if (arrivalMapping) {
        await addCity({
          code: route.arrivalCity,
          name: route.arrivalCityHebrew || arrivalMapping.hebrew,
          englishName: route.arrivalCityEnglish || arrivalMapping.english,
          country: arrivalMapping.country,
          isElAlDestination: false // New cities from routes are not El Al destinations by default
        });
        console.log(`Added arrival city: ${route.arrivalCity}`);
      }
    }
  } catch (error) {
    console.error('Error ensuring cities exist:', error);
    throw error;
  }
};

// Custom Variables Services
export const fetchCustomVariables = async (): Promise<CustomVariable[]> => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('User not authenticated. Please log in first.');
    }
    
    const querySnapshot = await getDocs(collection(db, 'customVariables'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as CustomVariable[];
  } catch (error: any) {
    console.error('Error fetching custom variables:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please make sure you are logged in and have admin privileges.');
    }
    if (error.message === 'User not authenticated. Please log in first.') {
      throw error;
    }
    throw new Error('Failed to fetch custom variables. Please try again.');
  }
};

export const addCustomVariable = async (variable: Omit<CustomVariable, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomVariable> => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('User not authenticated. Please log in first.');
    }
    
    const now = new Date();
    const docRef = await addDoc(collection(db, 'customVariables'), {
      ...variable,
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      id: docRef.id,
      ...variable,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  } catch (error: any) {
    console.error('Error adding custom variable:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please make sure you are logged in and have admin privileges.');
    }
    if (error.message === 'User not authenticated. Please log in first.') {
      throw error;
    }
    throw new Error('Failed to add custom variable. Please try again.');
  }
};

export const updateCustomVariable = async (variable: CustomVariable): Promise<CustomVariable> => {
  try {
    const now = new Date();
    await updateDoc(doc(db, 'customVariables', variable.id), {
      ...variable,
      updatedAt: now,
    });
    
    return {
      ...variable,
      updatedAt: now.toISOString(),
    };
  } catch (error: any) {
    console.error('Error updating custom variable:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please make sure you are logged in and have admin privileges.');
    }
    throw new Error('Failed to update custom variable. Please try again.');
  }
};

export const deleteCustomVariable = async (variableId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'customVariables', variableId));
  } catch (error: any) {
    console.error('Error deleting custom variable:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please make sure you are logged in and have admin privileges.');
    }
    throw new Error('Failed to delete custom variable. Please try again.');
  }
};

// SMS Notification Service - Hot/Inforu Integration via Local Server
export const sendSMSNotification = async (phoneNumber: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  try {
    // Format phone number for Israeli numbers (remove leading 0 and add country code)
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = phoneNumber.substring(1); // Remove leading 0
    } else if (phoneNumber.startsWith('+972')) {
      formattedPhone = phoneNumber.substring(4); // Remove +972
    } else if (phoneNumber.startsWith('972')) {
      formattedPhone = phoneNumber.substring(3); // Remove 972
    }
    
    console.log('Sending SMS via local server:', { 
      to: formattedPhone, 
      message: message.substring(0, 50) + '...' 
    });
    
    // Call local SMS server
    const smsServerUrl = process.env.REACT_APP_SMS_SERVER_URL || 'http://localhost:3001';
    const response = await fetch(`${smsServerUrl}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('SMS sent successfully via local server');
      return { 
        success: true, 
        messageId: result.messageId || 'sent'
      };
    } else {
      throw new Error(result.error || 'Unknown error');
    }
    
  } catch (error: any) {
    console.error('Error sending SMS via local server:', error);
    
    // Fallback: save to Firebase for processing by the server
    try {
      const smsRequest = {
        phoneNumber: phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'pending',
        sender: 'ELAL'
      };
      
      const smsRequestsRef = collection(db, 'smsRequests');
      const docRef = await addDoc(smsRequestsRef, smsRequest);
      
      console.log('SMS request saved to Firebase as fallback:', docRef.id);
      
      return { 
        success: true, 
        messageId: docRef.id
      };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return { success: false, error: error.message };
    }
  }
};

// Email Notification Service - Simple implementation via local server
export const sendEmailNotification = async (email: string, subject: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  try {
    console.log('Sending email via local server:', {
      to: email,
      subject: subject,
      message: message.substring(0, 50) + '...'
    });
    
    const smsServerUrl = process.env.REACT_APP_SMS_SERVER_URL || 'http://localhost:3001';
    const response = await fetch(`${smsServerUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        subject: subject,
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Email sent successfully via local server');
      return {
        success: true,
        messageId: result.messageId || 'sent'
      };
    } else {
      throw new Error(result.error || 'Unknown error');
    }
    
  } catch (error: any) {
    console.error('Error sending email via local server:', error);
    
    // Fallback: save to Firebase for processing by the server
    try {
      const emailRequest = {
        email: email,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'pending',
        sender: 'ELAL'
      };
      
      const emailRequestsRef = collection(db, 'emailRequests');
      const docRef = await addDoc(emailRequestsRef, emailRequest);
      
      console.log('Email request saved to Firebase as fallback:', docRef.id);
      
      return {
        success: true,
        messageId: docRef.id
      };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return { success: false, error: error.message };
    }
  }
};
