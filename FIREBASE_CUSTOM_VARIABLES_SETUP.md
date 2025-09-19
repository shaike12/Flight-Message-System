# הגדרת אוסף customVariables ב-Firebase

## הבעיה
האוסף `customVariables` לא קיים ב-Firebase או שאין הרשאות אליו.

## פתרון 1: הוספת כללי אבטחה (מומלץ)

### שלב 1: לך ל-Firebase Console
1. פתח [Firebase Console](https://console.firebase.google.com/)
2. בחר את הפרויקט שלך: `flight-system-1d0b2`
3. לך ל-**Firestore Database** → **Rules**

### שלב 2: הוסף את הכלל החדש
הוסף את הכלל הבא לכללי האבטחה:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Existing rules for other collections...
    
    // Add this rule for customVariables
    match /customVariables/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### שלב 3: שמור את הכללים
1. לחץ על **"Publish"**
2. המתן עד שהכללים יופעלו

---

## פתרון 2: יצירת האוסף באופן ידני

### שלב 1: לך ל-Firestore Database
1. ב-Firebase Console, לך ל-**Firestore Database** → **Data**
2. לחץ על **"Start collection"**

### שלב 2: צור את האוסף
1. **Collection ID**: `customVariables`
2. לחץ על **"Next"**

### שלב 3: הוסף מסמך ראשון (אופציונלי)
1. **Document ID**: `sample` (או השאר ריק לאוטומטי)
2. **Fields**:
   - `name` (string): `gateNumber`
   - `displayName` (string): `מספר שער`
   - `displayNameEnglish` (string): `Gate Number`
   - `type` (string): `text`
   - `placeholder` (string): `הזן מספר שער`
   - `placeholderEnglish` (string): `Enter gate number`
   - `isActive` (boolean): `true`
   - `createdAt` (string): `2025-09-18T18:51:00.000Z`
   - `updatedAt` (string): `2025-09-18T18:51:00.000Z`

3. לחץ על **"Save"**

---

## פתרון 3: כללי אבטחה זמניים (לפיתוח בלבד)

אם אתה בפיתוח ורוצה גישה מלאה זמנית:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // WARNING: Allows all access!
    }
  }
}
```

**⚠️ אזהרה**: כללים אלה מאפשרים גישה מלאה לכל המשתמשים. השתמש בהם רק לפיתוח!

---

## בדיקה שהכל עובד

### שלב 1: רענן את האפליקציה
1. לך לאפליקציה שלך
2. רענן את הדף (F5)

### שלב 2: בדוק את ניהול המשתנים
1. לך לטאב **"ניהול משתנים"**
2. השגיאה אמורה להיעלם
3. אתה אמור לראות את הממשק לניהול משתנים

### שלב 3: נסה ליצור משתנה חדש
1. לחץ על **"הוסף משתנה"**
2. מלא את הפרטים
3. לחץ על **"שמור"**
4. בדוק שהמשתנה נשמר

---

## פתרון בעיות

### שגיאה: "Permission denied"
- ודא שהוספת את הכלל `customVariables` לכללי האבטחה
- ודא שלחצת על "Publish" אחרי הוספת הכללים
- המתן כמה דקות עד שהכללים יופעלו

### השגיאה עדיין מופיעה
- בדוק שהכללים נשמרו נכון
- ודא שאין שגיאות תחביר בכללי האבטחה
- נסה ליצור את האוסף באופן ידני דרך Firebase Console

### האוסף לא נוצר
- ודא שיש לך הרשאות לפרויקט Firebase
- בדוק שהפרויקט פעיל
- נסה ליצור אוסף אחר כדי לוודא שהכל עובד

---

## כללי אבטחה מומלצים לפרודקשן

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Templates - accessible to all authenticated users
    match /templates/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Flight routes - accessible to all authenticated users
    match /flightRoutes/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Cities - accessible to all authenticated users
    match /cities/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Custom variables - accessible to all authenticated users
    match /customVariables/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Users - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

זה יאפשר גישה לכל האוספים למשתמשים מחוברים, אבל רק למשתמשים לגשת לנתונים שלהם.
