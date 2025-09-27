# הגדרת שירות SMS של הוט

## הוראות הגדרה

### 1. קבלת API Key
1. התחבר לחשבון שלך בשירות SMS של הוט
2. עבור לקטע "API" או "מפתחות API"
3. צור מפתח API חדש או העתק את המפתח הקיים

### 2. הגדרת משתנים סביבתיים
המשתנים הסביבתיים כבר מוגדרים בקובץ `.env.local`:

```bash
# Hot SMS API Configuration
REACT_APP_HOT_SMS_API_KEY=8325247e-771b-42d1-8862-727fe60b4b8b
REACT_APP_HOT_SMS_BASE_URL=https://capi.inforu.co.il
REACT_APP_HOT_SMS_SENDER_NAME=ELAL
REACT_APP_HOT_SMS_BASE_CREDENTIALS=Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI=
```

**הערה:** המפתחות כבר מוגדרים ומוכנים לשימוש!

### 3. בדיקת API Documentation
בדוק את ה-API documentation של הוט בכתובת:
https://apidoc.inforu.co.il/

### 4. התאמת הקוד
ייתכן שתצטרך להתאים את הקוד ב-`src/firebase/services.ts` בהתאם ל-API של הוט:

#### שדות נדרשים אפשריים:
- `sender` - שם השולח
- `priority` - עדיפות ההודעה
- `unicode` - תמיכה בעברית
- `schedule` - תזמון שליחה

#### דוגמה להתאמה:
```typescript
const payload = {
  to: formattedPhone,
  message: message,
  sender: process.env.REACT_APP_HOT_SMS_SENDER_NAME || 'ELAL',
  priority: 'normal',
  unicode: true, // לתמיכה בעברית
};
```

### 5. בדיקת הפעלה
1. הפעל את האפליקציה
2. מלא טופס עם מספר טלפון
3. שלח הודעה
4. בדוק בקונסול אם נשלחה הודעת SMS

### 6. פתרון בעיות
- **שגיאת 401**: בדוק שהמפתח API נכון
- **שגיאת 400**: בדוק את פורמט הנתונים
- **שגיאת 500**: פנה לתמיכת הוט

### 7. עלויות
- בדוק את מחירי השירות עם הוט
- ייתכן שיש הגבלה על מספר הודעות ליום

## הערות חשובות
- המפתח API רגיש - אל תחלוק אותו
- הוסף את `.env.local` ל-`.gitignore`
- בדוק את תנאי השימוש של הוט
