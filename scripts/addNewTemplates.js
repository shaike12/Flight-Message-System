// Script to add only new templates to Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } = require('firebase/firestore');

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

// All new templates to check
const newTemplates = [
  {
    name: "שינוי זמנים שעתייים עד חמש",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תיפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nDue to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} which was scheduled to depart at {originalTime} will now depart on {newTime}.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינוי זמנים שעתייים עד חמש והקדמת טיסה",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תיפעוליות בלתי צפויות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} הוקדמה ותמריא בשעה {newTime}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nDue to an unexpected operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} which was scheduled to depart at {originalTime} has been advanced and will depart at {newTime}.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינוי טיסה והעברה לטיסה חלופית",
    content: "לקוח/ה יקר/ה,\nטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} שונתה.\nהנכם מועברים לטיסה {newFlightNumber} ב{newDate} שתמריא בשעה {newTime}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFlight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} which was scheduled to depart at {originalTime} is changed.\nPassengers are transferred to {newFlightNumber} on {newDate}.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl.\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינוי זמנים + תאריך",
    content: "לקוח/ה יקר/ה,\nטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא ב{newDate} בשעה {newTime}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFlight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} which was scheduled to depart at {originalTime} will depart on {newDate} at {newTime}.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl.\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינוי מטוס למטוס סאן דור ללא מח' עסקים",
    content: "לקוח/ה יקר/ה,\nטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} תמריא על פי לוח הזמנים המתוכנן בשעה {originalTime}, ותתופעל במטוס סאנדור ללא מחלקת עסקים.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFlight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} will depart as per original schedule at {originalTime} and will be operated by a Sun D'or aircraft without business class service.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl.\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינוי מספר טיסה",
    content: "לקוח/ה יקר/ה,\nטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} תמריא על פי לוח הזמנים המקורי בשעה {originalTime} ותקרא טיסת {newFlightNumber}.\nאנו מאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFlight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} will depart as per original schedule at {originalTime}.\nThe flight number has been changed to {newFlightNumber}.\nWe wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינוי זנב מטוס 777",
    content: "לקוחות יקרים,\nעקב סיבות תיפעוליות בלתי צפויות, אנו מעדכנים כי שונה סוג המטוס לטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate}\nהטיסה תמריא כמתוכנן בשעה {originalTime} ותבוצע ע'י מטוס בואינג מסוג 777-200.\nבמטוס זה, הצפייה בתכני הבידור והאזנה יתאפשרו באמצעות חיבור מכשירכם האישי לרשת אל על בטיסה.\nכדי ליהנות מחווית צפייה והאזנה לתכנים, אנא הביאו עמכם/ן לטיסה אוזניות ומטען המתאימים למכשירכם האישי.\nאנו מאחלים לכם טיסה נעימה,\nאל על",
    englishContent: "Dear Customers,\nDue to an unexpected operational reasons, we wish to inform you that the aircraft for Flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} has been changed.\nThe flight will depart as planned at {originalTime} or and will be operated on a Boeing 777-200.\nPassengers on this aircraft will be able to enjoy the entertainment content by connecting their personal device to the EL AL network during the flight.\nTo enjoy the entertainment options, please make sure to bring personal earphone and electronic charger for your device.\nWishing you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינוי טרמינל",
    content: "לקוח/ה יקר/ה,\nלידיעתך טיסת {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} תמריא על פי לוח הזמנים המתוכנן בשעה {originalTime} ותצא מטרמינל {terminal}.\nאנו מאחלים לכם טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFor your information Flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} will depart as per original schedule at {originalTime} and will depart from Terminal {terminal}.\nWe wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "טיסות מוצ\"ש / פתיחת דלפקים",
    content: "לקוחות יקרים,\nאנו מתרגשים לראותכם בטיסתנו הקרובה מ{departureCity} ל{arrivalCity} שתמריא בשעה {originalTime}. לתשומת ליבכם - דלפקי הצ'ק אין שלנו יפתחו מיד עם צאת השבת בשעה {checkinTime}.\nאנו מאחלים לכם טיסה נעימה ומודים לכם שבחרתם אל על.",
    englishContent: "Dear customers,\nWe are excited to see you onboard your upcoming flight from {departureCity} to {arrivalCity} scheduled to depart at {originalTime}.\nPlease note that our check-in counters will open immediately after Shabbat (Saturday evening) is over at {checkinTime}.\nWishing you a please flight and thank you for choosing EL AL"
  },
  {
    name: "שינוי זמנים + תאריך + מספר טיסה",
    content: "לקוח/ה יקר/ה,\nטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא ב{newDate} בשעה {newTime} ותיקרא {newFlightNumber}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFlight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} which was scheduled to depart at {originalTime} will depart on {newDate} at {newTime}.\nThe flight number has been changed to {newFlightNumber}.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl.\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "טרקלין טיסות מוצ\"ש עקב יציאת שבת מאוחרת",
    content: "לקוחות יקרים,\nלידיעתכם, בטיסתכם הקרובה {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שממריאה בשעה {originalTime}.\nטרקלין המלך דוד ייפתח לאירוח כשעה לאחר צאת השבת, בשעה {loungeTime} לשירותכם.\nנשמח לארח אתכם וטיסה נעימה,\nאל על",
    englishContent: "Dear customers,\nPlease note that on your upcoming flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} which is schedule to depart at {originalTime}.\nThe King David Lounge will open for hospitality an hour after the end of Shabbat at {loungeTime} at your service.\nWe will be happy to host you and have a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "תקלת אינטרנט",
    content: "לקוחות יקרים,\nבטיסתכם {flightNumber} ב{originalDate} מ{departureCity} ל{arrivalCity} תוכלו ליהנות ממערכת בידור עשירה בתכנים.\nלידיעתכם, בטיסה זו שירות האינטרנט לא יהיה זמין.\nאנו מאחלים לכם טיסה נעימה\nאל על",
    englishContent: "Dear customers,\nWe wish to inform you that on your flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} you will be able to enjoy a variety of entertainment content available on our in-flight entertainment system.\nPlease note that the internet service will not be available.\nWe wish you a pleasant flight.\nEL AL Israel Airlines"
  },
  {
    name: "תקלת אינטרנט + הטבה",
    content: "לקוחות יקרים,\nבטיסתכם {flightNumber} ב{originalDate} מ{departureCity} ל{arrivalCity} תוכלו ליהנות ממערכת בידור עשירה בתכנים.\nלידיעתכם, בטיסה זו שירות האינטרנט לא יהיה זמין.\nנשמח להעניק לכם 20% הנחה לרכישת מוצרי דיוטי פרי במטוס.\nמאחלים לכם טיסה נעימה\nאל על",
    englishContent: "Dear passenger,\nWe wish to inform you that on your flight {flightNumber} departing from {departureCity} to {arrivalCity} on {originalDate}, you will be able to enjoy a variety of entertainment content available on our in-flight entertainment system.\nPlease note that on your flight the internet service will not be available.\nWe would like to grant you a 20% discount which may be used for on board duty-free purchase.\nWe wish you a pleasant flight.\nEL AL Israel Airlines"
  },
  {
    name: "תקלה במערכת הבידור",
    content: "לקוח/ה יקר/ה,\nאנו מבקשים לעדכן כי עקב תקלה במערכת הבידור בטיסתך {flightNumber} ב{originalDate} מ{departureCity} ל{arrivalCity} שממריאה ב{originalTime} חברת אלעל תעניק לך חבילת גלישה חינם לאינטרנט בטיסתך.\nקוד הגלישה הינו: {internetCode}.\nוכן 15% הנחה למוצרי הדיוטי פרי במטוס.\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customers,\nWe would like to inform you that, due to a malfunction in the entertainment system on your flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate}.\nEL AL will provide you a free internet surfing package on your flight.\nThe browsing code is: {internetCode}.\nIn addition, you are entitled to a discount of 15% on duty free items on board the flight.\nWe apologize for any inconvenience and wish you a pleasant flight\nEL AL Israel Airlines"
  },
  {
    name: "שינוי טיסת סאנדור למטוס חכור",
    content: "לקוח/ה יקר/ה,\nמתוך רצון לתת מענה לביקושים בקרב לקוחותינו, תגברנו את לוח הטיסות באמצעות מטוס חכור.טיסתך {flightNumber} ב{originalDate} מ{departureCity} ל{arrivalCity} תמריא בהתאם ללוח הזמנים המתוכנן בשעה {originalTime} ותתופעל באמצעות מטוס חכור בואינג 737-800 של חברת klasJet עם צוות של חברת התעופה klasJet בליווי דייל/ת אל על דובר/ת עברית.\nלפרטים נוספים אודות זכויותיך בדבר שינוי או ביטול הטיסה וכן למידע נוסף על המטוס https://rb.gy/keqm4h\nהודעה זו חלה על כל הנוסעים בהזמנה.\nטיסה נעימה,\nסאן דור מקבוצת אל על",
    englishContent: "Dear customers,\nIn order to meet the high demand of our customers, we have added additional flights using a leased aircraft.\nYour flight {flightNumber} on {originalDate} from {departureCity} to {arrivalCity} scheduled to depart at {originalTime} will be operated by KlasJet with leased Boeing 737-800 aircraft, with KlasJet aircrew accompanied by EL AL's Hebrew speaking flight attendant.\nFor further details regarding your rights to change or cancel the flight and for information about the service onboard, please press here: https://rb.gy/yo0c1uPlease note this message applies to all passengers in the reservation.\nHave a pleasant flight,\nSUNDOR\nBy EL AL Group"
  },
  {
    name: "שינוי זמנים מעל 5 שעות + שינוי מספר טיסה",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תיפעוליות, טיסתכם {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}.\nלידיעתך מספר הטיסה שונה ל {newFlightNumber}.\nלמידע נוסף ניתן לפנות אלינו בטלפון 972-3-9404040 או 1-800-223-6700 .\nלידיעתך , דלפקי הבידוק יפתחו בשעה {checkinOpen} ויסגרו בשעה {checkinClose}\nבמידה ואינך מעוניין בטיסה זו, הנך זכאי לבחור בין החזר כספי לבין שובר זיכוי למימוש לטיסה עתידית בקישור הבא (בכפוף לסוג הכרטיס): https://rb.gy/am86b\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנעימות שנגרמה,\nאל על",
    englishContent: "Dear customers,\nDue to an unforeseen operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity} originally scheduled to depart on {originalDate} at {originalTime} will now depart at {newTime}.\nPlease note that the flight number has been changed to {newFlightNumber}.\nFor more information you may contact us at +972-3-9404040 or 1-800-223-6700\nIf you choose not to take this flight, you are entitled to a refund or a voucher for future travel to one of EL AL's destinations (subject to ticket type). You can request this via the following link:\nhttps://bit.ly/3rFZIlN\nTo learn more about your rights under the Aviation Services Law, please visit: https://did.li/LQorl\nWe sincerely apologize for the inconvenience and appreciate your understanding,\nEL AL Israel Airlines"
  },
  {
    name: "ביטול טיסה תקלה תכנית ללא חלופה עם מלון",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תיפעוליות בלתי צפויות, טיסת {flightNumber} ב{originalDate} מ{departureCity} ל{arrivalCity} שתוכננה להמריא בשעה {originalTime} מבוטלת.\nבשלב זה, שעת ההמראה המדויקת טרם ידועה ואנו נעדכן בהמשך על שעת ההמראה המעודכנת.\nהינכם מתבקשים להגיע לדלפקי אל על להעברתכם לבתי מלון.\nלמידע נוסף ניתן ליצור קשר ב 97239404040.\nבמידה ואינך מעוניין בטיסה זו, הינך זכאי/ת לבחור בין החזר כספי לבין שובר זיכוי לשימוש עתידי לאחד מיעדי אל על בקישור: https://bit.ly/3sqMpXr\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנעימות שנגרמה לך.\nאל על",
    englishContent: "Dear customer\nDue to an unexpected operational reasons, flight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} which was schedule to depart at {originalTime} is canceled.\nAt this point of time the new departure time has not yet been set.\nWe will provide updated information on the departure time as soon as the updated departure time is confirmed.\nYou are kindly requested to arrive to the EL AL counters for accommodation.\nfor further information please contact 97239404040.\nIf you do not wish to take this flight, you are entitled to a refund or a voucher for future use on one of El Al's destinations via the link: https://bit.ly/3rFZIlN\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl\nWe sincerely apologize for any inconvenience and wish you a pleasant flight\n\nEL AL Israel Airlines"
  },
  {
    name: "שעתיים עד חמש+שינוי תאריך+שינוי מס טיסה סאנדור",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תיפעוליות בלתי צפויות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב- {originalDate} שתוכננה להמריא בשעה {originalTime} נדחית ותמריא ב-{newDate} בשעה {newTime}.\nלידיעתכם מספר הטיסה שונה ל {newFlightNumber}\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nDue to an unexpected operational reasons, {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} which was scheduled to depart at {originalTime} is delayed and will depart on {newDate} at {newTime}.\nFor your information the flight number has been changed to {newFlightNumber}.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl.\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינוי זמנים עם שעת פתיחת/סגירת דלפקים",
    content: "לקוח/ה יקר/ה,\nטיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} תמריא בשעה {newTime} במקום {originalTime} כמתוכנן.\nלידיעתך, דלפקי הבידוק יפתחו בשעה {checkinOpen} ויסגרו בשעה {checkinClose}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nFlight {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} which was scheduled to depart at {originalTime} will depart at {newTime}.\nFor your information, check in counters will be open at {checkinOpen} and will be closed at {checkinClose}.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינויי זמנים שעתיים עד חמש + שינוי מספר טיסה",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תיפעוליות בלתי צפויות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא ב{newDate} בשעה {newTime} מספר הטיסה שונה ל {newFlightNumber}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nDue to an unexpected operational reasons, {flightNumber} from {departureCity} to {arrivalCity} on {originalDate} originally scheduled to depart at {originalTime} will depart on {newDate} at {newTime}.\nPlease note that the flight number has been changed to {newFlightNumber}.\nFor your right in accordance with the aviation service laws please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  },
  {
    name: "שינוי זמנים מעל חמש שעות + אופריישין + פתיחת דלפקים + שינוי מספר טיסה",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תיפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}.\nלידיעתכם מספר הטיסה שונה ל {newFlightNumber}.\nלמידע נוסף ניתן לפנות אלינו בטלפון 972-3-9404040 או 1-800-223-6700 .\nדלפקי הבידוק יפתחו בשעה {checkinOpen} ויסגרו בשעה {checkinClose}\nבמידה ואינך מעוניין בטיסה זו, הינך זכאי/ת לבחור בין החזר כספי לבין שובר זיכוי לאחד מיעדי אל על בקישור הבא (בכפוף לסוג הכרטיס): https://did.li/TiUrl\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנעימות שנגרמה,\nאל על",
    englishContent: "Dear customers,\nDue to an unforeseen operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity}, originally scheduled to depart on {originalDate} at {originalTime} will now depart at {newTime}.\nPlease note that the flight number has been changed to {newFlightNumber}.\nThe check in counters will be open at {checkinOpen} and will be closed at {checkinClose}\nFor more information, please contact us at +972-3-940-4040 or 1-800-223-6700.\nIf you choose not to take this flight, you are entitled to a refund or a voucher for future travel to one of EL AL's destinations (subject to ticket type). You can request this via the following link:\nhttps://bit.ly/3rFZIlN\nTo learn more about your rights under the Aviation Services Law, please visit: https://did.li/LQorl\nWe sincerely apologize for the inconvenience and appreciate your understanding.\nEL AL Israel Airlines"
  },
  {
    name: "שינוי זמנים שעתייים עד חמש + שינוי מספר טיסה",
    content: "לקוח/ה יקר/ה,\nעקב סיבות תיפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא ב{newDate} בשעה {newTime}.\nלידיעתך, מספר הטיסה שונה ל {newFlightNumber}.\nלקישור לזכויות על פי חוק שירותי תעופה: https://bit.ly/3ym76Xx\nאנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,\nאל על",
    englishContent: "Dear customer,\nDue to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity} originally scheduled to depart on {originalDate} at {originalTime}, will now depart on {newDate} at {newTime}.\nPlease note that the flight number has been changed to {newFlightNumber}.To learn more about your rights under the Aviation Services Law, please visit: https://did.li/LQorl\nWe apologize for the inconvenience and wish you a pleasant flight,\nEL AL Israel Airlines"
  }
];

async function getExistingTemplates() {
  try {
    const templatesRef = collection(db, 'templates');
    const q = query(templatesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting existing templates:', error);
    return [];
  }
}

async function addNewTemplates() {
  try {
    console.log('Checking existing templates...');
    const existingTemplates = await getExistingTemplates();
    const existingNames = existingTemplates.map(t => t.name);
    
    console.log(`Found ${existingTemplates.length} existing templates`);
    
    const templatesToAdd = newTemplates.filter(template => 
      !existingNames.includes(template.name)
    );
    
    console.log(`Found ${templatesToAdd.length} new templates to add`);
    
    if (templatesToAdd.length === 0) {
      console.log('No new templates to add!');
      return;
    }
    
    for (const template of templatesToAdd) {
      const docRef = await addDoc(collection(db, 'templates'), {
        ...template,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added template: ${template.name} with ID: ${docRef.id}`);
    }
    
    console.log(`Successfully added ${templatesToAdd.length} new templates!`);
  } catch (error) {
    console.error('Error adding new templates:', error);
  } finally {
    process.exit(0);
  }
}

addNewTemplates();
