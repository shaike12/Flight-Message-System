# תיקון Content Security Policy (CSP)

## הבעיה
הדפדפן חסם בקשות ל-localhost:3001 בגלל Content Security Policy.

## הפתרון
הוספנו `http://localhost:*` ו-`https://localhost:*` ל-CSP ב-`public/index.html`.

## מה שונה
**לפני:**
```
connect-src 'self' ... ws://localhost:* wss://localhost:*
```

**אחרי:**
```
connect-src 'self' ... http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*
```

## איך לבדוק
1. **רענן את הדפדפן** (Ctrl+F5 או Cmd+Shift+R)
2. **פתח את האפליקציה** ב-localhost:3000
3. **מלא טופס** עם מספר טלפון
4. **שלח הודעה** - אמור לעבוד!

## אם עדיין לא עובד
1. **נקה את cache** של הדפדפן
2. **פתח Developer Tools** (F12)
3. **בדוק Console** - אמור לראות:
   ```
   Sending SMS via local server: { to: '522546036', message: '...' }
   SMS sent successfully via local server
   ```

## הערות
- השינוי ב-CSP נכנס לתוקף רק אחרי רענון הדפדפן
- השרת SMS צריך להיות פעיל על localhost:3001
- האפליקציה צריכה להיות פעילה על localhost:3000
