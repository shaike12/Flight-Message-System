// Script to delete all flight routes from Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration
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
const db = getFirestore(app);

async function deleteAllFlightRoutes() {
  try {
    console.log('Starting to delete all flight routes...');
    
    const collectionRef = collection(db, 'flightRoutes');
    const querySnapshot = await getDocs(collectionRef);
    
    console.log(`Found ${querySnapshot.docs.length} flight routes to delete`);
    
    let deletedCount = 0;
    for (const docSnapshot of querySnapshot.docs) {
      try {
        await deleteDoc(doc(db, 'flightRoutes', docSnapshot.id));
        const routeData = docSnapshot.data();
        console.log(`Deleted route: LY${routeData.flightNumber.padStart(3, '0')} - ${routeData.description}`);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting route ${docSnapshot.id}:`, error);
      }
    }
    
    console.log(`Successfully deleted ${deletedCount} flight routes!`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting flight routes:', error);
    process.exit(1);
  }
}

// Run the script
deleteAllFlightRoutes();

