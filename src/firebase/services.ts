import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { MessageTemplate, FlightRoute } from '../types';

// Collections
const TEMPLATES_COLLECTION = 'templates';
const FLIGHT_ROUTES_COLLECTION = 'flightRoutes';

// Get all templates
export const getTemplates = async (): Promise<MessageTemplate[]> => {
  try {
    const templatesRef = collection(db, TEMPLATES_COLLECTION);
    const q = query(templatesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as MessageTemplate[];
  } catch (error) {
    console.error('Error getting templates:', error);
    throw error;
  }
};

// Add new template
export const addTemplate = async (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const templatesRef = collection(db, TEMPLATES_COLLECTION);
    const docRef = await addDoc(templatesRef, {
      ...template,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding template:', error);
    throw error;
  }
};

// Update template
export const updateTemplate = async (id: string, template: Partial<MessageTemplate>): Promise<void> => {
  try {
    const templateRef = doc(db, TEMPLATES_COLLECTION, id);
    await updateDoc(templateRef, {
      ...template,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

// Delete template
export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    const templateRef = doc(db, TEMPLATES_COLLECTION, id);
    await deleteDoc(templateRef);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// Set active template
export const setActiveTemplate = async (id: string): Promise<void> => {
  try {
    // First, set all templates to inactive
    const templatesRef = collection(db, TEMPLATES_COLLECTION);
    const querySnapshot = await getDocs(templatesRef);
    
    const batch: Promise<void>[] = [];
    querySnapshot.docs.forEach(docSnapshot => {
      const docRef = doc(db, TEMPLATES_COLLECTION, docSnapshot.id);
      batch.push(updateDoc(docRef, { 
        isActive: docSnapshot.id === id,
        updatedAt: serverTimestamp()
      }));
    });
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Error setting active template:', error);
    throw error;
  }
};

// Real-time listener for templates
export const subscribeToTemplates = (callback: (templates: MessageTemplate[]) => void) => {
  const templatesRef = collection(db, TEMPLATES_COLLECTION);
  const q = query(templatesRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const templates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as MessageTemplate[];
    
    callback(templates);
  }, (error) => {
    console.error('Error in templates subscription:', error);
  });
};

// Flight Routes Services
// Get all flight routes
export const getFlightRoutes = async (): Promise<FlightRoute[]> => {
  try {
    const routesRef = collection(db, FLIGHT_ROUTES_COLLECTION);
    const q = query(routesRef, orderBy('flightNumber', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as unknown as FlightRoute));
  } catch (error) {
    console.error('Error getting flight routes:', error);
    throw error;
  }
};

// Add new flight route
export const addFlightRoute = async (route: Omit<FlightRoute, 'id'>): Promise<string> => {
  try {
    const routesRef = collection(db, FLIGHT_ROUTES_COLLECTION);
    const docRef = await addDoc(routesRef, {
      ...route,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding flight route:', error);
    throw error;
  }
};

// Update flight route
export const updateFlightRoute = async (id: string, route: Partial<FlightRoute>): Promise<void> => {
  try {
    const routeRef = doc(db, FLIGHT_ROUTES_COLLECTION, id);
    await updateDoc(routeRef, {
      ...route,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating flight route:', error);
    throw error;
  }
};

// Delete flight route
export const deleteFlightRoute = async (id: string): Promise<void> => {
  try {
    const routeRef = doc(db, FLIGHT_ROUTES_COLLECTION, id);
    await deleteDoc(routeRef);
  } catch (error) {
    console.error('Error deleting flight route:', error);
    throw error;
  }
};

// Real-time listener for flight routes
export const subscribeToFlightRoutes = (callback: (routes: FlightRoute[]) => void) => {
  const routesRef = collection(db, FLIGHT_ROUTES_COLLECTION);
  const q = query(routesRef, orderBy('flightNumber', 'asc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const routes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as unknown as FlightRoute));
    
    callback(routes);
  }, (error) => {
    console.error('Error in flight routes subscription:', error);
  });
};
