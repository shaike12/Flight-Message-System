# הגדרת Firebase Cloud Functions לשליחת SMS

## מה יצרנו
יצרנו Firebase Cloud Function שמאזינה לבקשות SMS חדשות ב-Firebase ומעבדת אותן אוטומטית.

## קבצים שנוצרו
- `functions/package.json` - הגדרות הפרויקט
- `functions/tsconfig.json` - הגדרות TypeScript
- `functions/src/index.ts` - הקוד של ה-Function
- `firebase.json` - הגדרות Firebase
- `firestore.rules` - כללי אבטחה
- `firestore.indexes.json` - אינדקסים למסד הנתונים

## איך זה עובד
1. משתמש שולח הודעה עם מספר טלפון
2. המערכת שומרת בקשת SMS ב-Firebase ב-collection `smsRequests`
3. Firebase Function מזהה בקשה חדשה ומפעילה את `processSMSRequests`
4. ה-Function שולחת SMS דרך API של הוט
5. ה-Function מעדכנת את הסטטוס ב-Firebase

## הפעלה מקומית (לבדיקה)

### 1. התקנת Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. התחברות ל-Firebase
```bash
firebase login
```

### 3. בחירת הפרויקט
```bash
firebase use flight-system-1d0b2
```

### 4. הפעלת Emulator מקומי
```bash
cd functions
npm run serve
```

זה יפעיל emulator מקומי שיעבד את בקשת ה-SMS.

## פריסה ל-Firebase (לשימוש אמיתי)

### 1. פריסת Functions
```bash
firebase deploy --only functions
```

### 2. פריסת Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. פריסת Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

## בדיקה

### 1. בדיקה מקומית
1. הפעל את האפליקציה: `npm start`
2. הפעל את ה-emulator: `cd functions && npm run serve`
3. שלח הודעה עם מספר טלפון
4. בדוק ב-Firebase Console ב-collection `smsRequests`

### 2. בדיקה בפרודקשן
1. פרוס את ה-Functions: `firebase deploy --only functions`
2. שלח הודעה עם מספר טלפון
3. בדוק ב-Firebase Console

## Functions שנוצרו

### 1. processSMSRequests
- **טריגר:** יצירת document חדש ב-`smsRequests`
- **פעולה:** שולח SMS דרך API של הוט
- **עדכון:** מעדכן סטטוס ל-`sent` או `failed`

### 2. processPendingSMSRequests
- **טריגר:** קריאה ידנית (לבדיקה)
- **פעולה:** מעבדת בקשות pending
- **שימוש:** `firebase functions:shell` ואז `processPendingSMSRequests()`

## מבנה הנתונים ב-Firebase

### smsRequests Collection
```json
{
  "phoneNumber": "522546036",
  "message": "הודעה חדשה נשלחה: טיסה 123...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "pending|sent|failed",
  "sender": "ELAL",
  "messageId": "12345",
  "processedAt": "2024-01-15T10:30:05.000Z",
  "error": "error message if failed"
}
```

## פתרון בעיות

### 1. Function לא מופעלת
- בדוק שה-Function פרוסה: `firebase functions:list`
- בדוק logs: `firebase functions:log`

### 2. SMS לא נשלח
- בדוק את ה-logs של ה-Function
- ודא שה-API credentials נכונים
- בדוק את ה-response מה-API של הוט

### 3. שגיאות CORS
- ה-Functions רצות בשרת, לא בדפדפן, אז אין בעיית CORS

## עלויות
- Firebase Functions: חינם עד 2 מיליון קריאות בחודש
- Firestore: חינם עד 50,000 קריאות ביום
- SMS: לפי תעריפי הוט

## הערות חשובות
- ה-Functions רצות אוטומטית
- אין צורך בשרת נפרד
- כל הבקשות נשמרות ב-Firebase
- ניתן לעקוב אחר סטטוס כל בקשה
