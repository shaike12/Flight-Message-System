# הגדרת Firebase למערכת הודעות טיסות

## שלב 1: יצירת פרויקט Firebase

1. לך ל-[Firebase Console](https://console.firebase.google.com/)
2. לחץ על "Create a project" או "הוסף פרויקט"
3. הזן שם לפרויקט (לדוגמה: "flight-message-system")
4. בחר אם להפעיל Google Analytics (אופציונלי)
5. לחץ על "Create project"

## שלב 2: הוספת אפליקציה Web

1. בפרויקט שיצרת, לחץ על האייקון Web (</>)
2. הזן שם לאפליקציה (לדוגמה: "flight-message-app")
3. לחץ על "Register app"
4. העתק את קוד ההגדרה (firebaseConfig)

## שלב 3: הגדרת Firestore Database

1. בתפריט הצד, לחץ על "Firestore Database"
2. לחץ על "Create database"
3. בחר "Start in test mode" (לפיתוח)
4. בחר מיקום (למשל: us-central1)
5. לחץ על "Done"

## שלב 4: עדכון קוד ההגדרה

1. פתח את הקובץ `src/firebase/config.ts`
2. החלף את הערכים ב-`firebaseConfig` עם הערכים שקיבלת:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDWdpjaBD_dG9EAfNnHjEJv485fll5bedA",
  authDomain: "flight-system-1d0b2.firebaseapp.com",
  projectId: "flight-system-1d0b2,
  storageBucket: "flight-system-1d0b2.firebasestorage.app",
  messagingSenderId: "346117765958",
  appId: "1:346117765958:web:846859bbaf0573cfd38347"
};
```

## שלב 5: הגדרת כללי אבטחה (אופציונלי)

1. ב-Firestore Database, לחץ על "Rules"
2. החלף את הכללים עם:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to templates collection
    match /templates/{document} {
      allow read, write: if true; // For development only
    }
    
    // Allow read/write access to flight routes collection
    match /flightRoutes/{document} {
      allow read, write: if true; // For development only
    }
  }
}
```

**הערה**: כללים אלה מאפשרים גישה מלאה לכל המשתמשים. לפרודקשן, יש להגדיר כללי אבטחה מתאימים.

## שלב 6: בדיקת החיבור

1. הפעל את האפליקציה: `npm start`
2. לך ללשונית "ניהול תבניות"
3. נסה ליצור תבנית חדשה
4. בדוק ב-Firebase Console שהתבנית נשמרה ב-Firestore

## שלב 7: הגדרת כללי אבטחה לפרודקשן

לפרודקשן, החלף את כללי האבטחה עם:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /templates/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /flightRoutes/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

זה יאפשר גישה רק למשתמשים מחוברים.

## פתרון בעיות

### שגיאה: "Firebase: No Firebase App '[DEFAULT]' has been created"
- ודא שהגדרת את `firebaseConfig` נכון
- ודא שהקובץ `config.ts` מיובא נכון

### שגיאה: "Permission denied" או "Missing or insufficient permissions"
- בדוק את כללי האבטחה ב-Firestore
- ודא שהפרויקט מוגדר נכון
- ודא שהוספת כללים עבור `flightRoutes` collection
- אם אתה בפיתוח, השתמש בכללים הבאים:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only - allows all access
    }
  }
}
```

**אזהרה**: כללים אלה מאפשרים גישה מלאה לכל המשתמשים. השתמש בהם רק לפיתוח!

### התבניות לא נטענות
- בדוק שהחיבור לאינטרנט עובד
- בדוק את הקונסול לשגיאות
- ודא שהפרויקט Firebase פעיל

## תכונות נוספות

### גיבוי אוטומטי
Firebase מספק גיבוי אוטומטי של הנתונים.

### סנכרון בזמן אמת
המערכת תסנכרן את התבניות בין כל המכשירים בזמן אמת.

### היסטוריית שינויים
Firebase שומר היסטוריית שינויים אוטומטית.

## תמיכה

אם יש בעיות, בדוק:
1. [Firebase Documentation](https://firebase.google.com/docs)
2. [Firestore Documentation](https://firebase.google.com/docs/firestore)
3. [Firebase Console](https://console.firebase.google.com/)
