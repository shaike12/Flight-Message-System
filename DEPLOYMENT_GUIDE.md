# מדריך העלאה ל-Render עם תמיכה ב-SMS

## סקירה כללית
המערכת מורכבת משני חלקים:
1. **אפליקציית React** (הפרויקט הראשי)
2. **שרת SMS** (Node.js - תיקיית `sms-server`)

## שלב 1: הכנת הפרויקט

### 1.1 יצירת משתני סביבה
צור קובץ `.env.local` בשורש הפרויקט:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# SMS Server Configuration
# For local development:
REACT_APP_SMS_SERVER_URL=http://localhost:3001

# For production (after deploying SMS server to Render):
# REACT_APP_SMS_SERVER_URL=https://your-sms-server.onrender.com

# Hot SMS API Configuration
REACT_APP_HOT_SMS_API_KEY=8325247e-771b-42d1-8862-727fe60b4b8b
REACT_APP_HOT_SMS_BASE_URL=https://capi.inforu.co.il
REACT_APP_HOT_SMS_SENDER_NAME=ELAL
REACT_APP_HOT_SMS_BASE_CREDENTIALS=Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI=

# Hot Email API Configuration
HOT_EMAIL_CAMPAIGN_ID=57934763
```

## שלב 2: העלאת שרת SMS ל-Render

### 2.1 יצירת שירות חדש
1. היכנס ל-[Render Dashboard](https://dashboard.render.com/)
2. לחץ על "New +" → "Web Service"
3. חבר את ה-GitHub repository
4. בחר את התיקייה `sms-server`

### 2.2 הגדרות השירות
- **Name**: `sms-server` (או שם אחר)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start` (כולל הגבלת זיכרון של 512MB)
- **Plan**: Free (או Paid לפי הצורך)

### 2.3 משתני סביבה לשרת SMS
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

### 2.4 העלאה
1. לחץ על "Create Web Service"
2. המתן שהשירות יעלה (יכול לקחת כמה דקות)
3. **שמור את ה-URL של השירות** (לדוגמה: `https://sms-server-xyz.onrender.com`)

## שלב 3: העלאת הפרויקט הראשי

### 3.1 יצירת שירות חדש
1. ב-Render Dashboard, לחץ על "New +" → "Web Service"
2. חבר את אותו GitHub repository
3. השאר את התיקייה הראשית (לא `sms-server`)

### 3.2 הגדרות השירות
- **Name**: `flight-message-system` (או שם אחר)
- **Environment**: `Static Site`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Plan**: Free (או Paid לפי הצורך)

### 3.3 משתני סביבה לפרויקט הראשי
הוסף את המשתנים הבאים:

```
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# SMS Server Configuration
REACT_APP_SMS_SERVER_URL=https://your-sms-server.onrender.com

# Hot SMS API Configuration
REACT_APP_HOT_SMS_API_KEY=8325247e-771b-42d1-8862-727fe60b4b8b
REACT_APP_HOT_SMS_BASE_URL=https://capi.inforu.co.il
REACT_APP_HOT_SMS_SENDER_NAME=ELAL
REACT_APP_HOT_SMS_BASE_CREDENTIALS=Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI=

# Hot Email API Configuration
HOT_EMAIL_CAMPAIGN_ID=57934763
```

**חשוב**: החלף `https://your-sms-server.onrender.com` בכתובת האמיתית של שרת SMS שלך.

### 3.4 העלאה
1. לחץ על "Create Web Service"
2. המתן שהשירות יעלה

## שלב 4: בדיקה

### 4.1 בדיקת שרת SMS
1. פתח את ה-URL של שרת SMS בדפדפן
2. אתה אמור לראות: `{"status":"OK","timestamp":"...","service":"SMS Server for Hot API"}`

### 4.2 בדיקת המערכת המלאה
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

### בעיה: שרת SMS נרדם
- ב-Free Plan, השירותים יכולים להירדם אחרי 15 דקות של חוסר פעילות
- זה נורמלי, השירות יתעורר אוטומטית כשמישהו יקרא לו
- אם זה מפריע, שדרג ל-Paid Plan

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
5. **HTTPS**: כל השירותים ב-Render עובדים עם HTTPS אוטומטית

## קישורים שימושיים

- [Render Dashboard](https://dashboard.render.com/)
- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/node)
- [Static Sites on Render](https://render.com/docs/static-sites)
