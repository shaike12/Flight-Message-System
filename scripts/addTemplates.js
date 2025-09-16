// Script to add templates to Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config
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

// Templates to add
const templates = [
  {
    name: "שינוי זמנים",
    content: "לקוח/ה יקר/ה,\nטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} תמריא בשעה {newTime} במקום {originalTime} כמתוכנן.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFlight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} originally scheduled to depart at {originalTime} will depart at {newTime}.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "שינוי זמנים - חזרה לזמן מקורי",
    content: "לקוח/ה יקר/ה,\nטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא על פי לוח הזמנים המתוכנן בשעה {originalTime}.\nטיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFlight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} that was scheduled to depart at {originalTime} will depart as scheduled at {originalTime}.\nWe wish you a pleasant flight,\nEL AL Israel Airlines",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "שינוי זמנים שעתיים עד חמש שעות + אופריישן",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תפעוליות בלתי צפויות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nDue to an unexpected operational reason, Flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} that was scheduled to depart at {originalTime} will now depart at {newTime}.\nFor your rights under the Aviation Services Law, please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "שינוי זמנים והקדמה טיסה",
    content: "לקוח/ה יקר/ה,\nטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFlight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} that was scheduled to depart at {originalTime} will now depart at {newTime}.\nFor your rights under the Aviation Services Law, please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "שינוי זמנים מעל חמש שעות + אופריישין",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנעימות שנגרמה.\nאל על",
    englishContent: "Dear customer,\nDue to an unexpected operational reason, Flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} that was scheduled to depart at {originalTime} will now depart at {newTime}.\nFor your rights under the Aviation Services Law, please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "שינוי זמנים מעל חמש שעות + שינוי תאריך + מספר טיסה",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תפעוליות בלתי צפויות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא ב{newDate} בשעה {newTime}.\nלידיעתך, מספר הטיסה שונה ל{newFlightNumber}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nDue to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} at {originalTime} will now depart on {newDate} at {newTime}.\nPlease note that the flight number has been changed to {newFlightNumber}.\nFor your rights under the Aviation Services Law, please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "שינוי זמנים שעתייים עד חמש + תאריך",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תפעוליות בלתי צפויות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא ב{newDate} בשעה {newTime}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nDue to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} at {originalTime} will now depart on {newDate} at {newTime}.\nFor your rights under the Aviation Services Law, please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "שינוי זמנים שעתיים עד חמש שעות + שינוי תאריך + שינוי מספר טיסה",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא ב{newDate} בשעה {newTime}.\nלידיעתך, מספר הטיסה שונה ל{newFlightNumber}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nDue to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} at {originalTime} will now depart on {newDate} at {newTime}.\nPlease note that the flight number has been changed to {newFlightNumber}.\nFor your rights under the Aviation Services Law, please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function addTemplates() {
  try {
    console.log('Starting to add templates...');
    
    for (const template of templates) {
      const docRef = await addDoc(collection(db, 'templates'), template);
      console.log(`Added template: ${template.name} with ID: ${docRef.id}`);
    }
    
    console.log('All templates added successfully!');
  } catch (error) {
    console.error('Error adding templates:', error);
  } finally {
    process.exit(0);
  }
}

addTemplates();
