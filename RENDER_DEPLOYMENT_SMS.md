# הוראות העלאה ל-Render עם שרת SMS

## סקירה כללית
כדי שהמערכת תעבוד ב-Render עם שליחת SMS, צריך להעלות שני שירותים נפרדים:
1. **הפרויקט הראשי** (React App)
2. **שרת SMS** (Node.js)

## שלב 1: העלאת שרת SMS

### 1.1 יצירת שירות חדש ב-Render
1. היכנס ל-Render Dashboard
2. לחץ על "New +" → "Web Service"
3. חבר את ה-GitHub repository
4. בחר את התיקייה `sms-server`

### 1.2 הגדרות השירות
- **Name**: `sms-server` (או שם אחר)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (או Paid לפי הצורך)

### 1.3 משתני סביבה
הוסף את המשתנים הבאים:

```
NODE_ENV=production
PORT=10000
HOT_SMS_BASE_CREDENTIALS=Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI=
HOT_SMS_API_URL=https://capi.inforu.co.il/api/v2/SMS/SendSms
HOT_EMAIL_BASE_CREDENTIALS=Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI=
HOT_EMAIL_API_URL=https://capi.inforu.co.il/api/Umail/Campaign/Send/
HOT_EMAIL_CAMPAIGN_ID=57934763
```

### 1.4 העלאה
1. לחץ על "Create Web Service"
2. המתן שהשירות יעלה (יכול לקחת כמה דקות)
3. שמור את ה-URL של השירות (לדוגמה: `https://sms-server-xyz.onrender.com`)

## שלב 2: עדכון הפרויקט הראשי

### 2.1 עדכון משתני סביבה
הוסף את המשתנה הבא לפרויקט הראשי ב-Render:

```
REACT_APP_SMS_SERVER_URL=https://sms-server-xyz.onrender.com
```

**החלף `sms-server-xyz.onrender.com` בכתובת האמיתית של השרת SMS שלך.**

### 2.2 עדכון הקוד
הקוד כבר מוכן לעבוד עם משתנה הסביבה. השרת SMS יקרא לכתובת הנכונה אוטומטית.

## שלב 3: בדיקה

### 3.1 בדיקת שרת SMS
1. פתח את ה-URL של שרת SMS בדפדפן
2. אתה אמור לראות: `{"status":"OK","timestamp":"...","service":"SMS Server for Hot API"}`

### 3.2 בדיקת המערכת המלאה
1. פתח את האפליקציה הראשית
2. נסה לשלוח SMS דרך הטופס
3. נסה לשלוח הודעות המוניות

## פתרון בעיות

### בעיה: "Failed to fetch"
- ודא ששרת SMS עובד (בדוק את ה-URL)
- ודא שמשתנה הסביבה `REACT_APP_SMS_SERVER_URL` מוגדר נכון

### בעיה: "CORS error"
- השרת SMS כבר מוגדר לתמוך ב-CORS
- אם עדיין יש בעיה, בדוק את הגדרות Render

### בעיה: "SMS not delivered"
- בדוק את הלוגים של שרת SMS ב-Render
- ודא שמשתני הסביבה של Hot API מוגדרים נכון

## עלויות

### Free Plan
- **פרויקט ראשי**: חינם
- **שרת SMS**: חינם
- **הגבלות**: השירותים יכולים להירדם אחרי 15 דקות של חוסר פעילות

### Paid Plan
- **פרויקט ראשי**: $7/חודש
- **שרת SMS**: $7/חודש
- **יתרונות**: השירותים לא נרדמים, ביצועים טובים יותר

## הערות חשובות

1. **ביטחון**: משתני הסביבה מוגדרים ב-Render ולא בקוד
2. **גיבוי**: כל השינויים נשמרים ב-Git
3. **עדכונים**: כל push ל-Git יעלה אוטומטית את השירותים
4. **לוגים**: ניתן לראות לוגים ב-Render Dashboard

## קישורים שימושיים

- [Render Dashboard](https://dashboard.render.com/)
- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/node)
