import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// You'll need to replace these with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDWdpjaBD_dG9EAfNnHjEJv485fll5bedA",
  authDomain: "flight-system-1d0b2.firebaseapp.com",
  projectId: "flight-system-1d0b2",
  storageBucket: "flight-system-1d0b2.firebasestorage.app",
  messagingSenderId: "346117765958",
  appId: "1:346117765958:web:846859bbaf0573cfd38347"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
