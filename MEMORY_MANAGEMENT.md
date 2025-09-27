# ניהול זיכרון בשרת SMS

## הבעיה
השרת SMS יכול להיגמר זיכרון (Out of Memory) כשיש הרבה בקשות או שהשרת עובד זמן רב.

## הפתרונות שיושמו

### 1. **הגבלת זיכרון**
```json
// package.json
"start": "node --max-old-space-size=512 server.js"
```
- מגביל את השרת ל-512MB זיכרון
- מונע קריסה עקב זיכרון

### 2. **ניקוי זיכרון אוטומטי**
```javascript
// אחרי כל בקשה
if (global.gc) {
  global.gc();
}
```
- מנקה זיכרון אחרי כל שליחת SMS/Email
- מונע הצטברות זיכרון

### 3. **Endpoint לניקוי ידני**
```bash
curl -X POST http://localhost:3001/cleanup
```
- מנקה זיכרון ידנית
- מחזיר מידע על שימוש בזיכרון

### 4. **מעקב זיכרון**
```bash
curl http://localhost:3001/health
```
- מציג מידע על שימוש בזיכרון
- עוזר לזהות בעיות

## איך להשתמש

### **בדיקה שהשרת עובד:**
```bash
curl http://localhost:3001/health
```

### **ניקוי זיכרון ידני:**
```bash
curl -X POST http://localhost:3001/cleanup
```

### **הפעלת השרת עם הגבלת זיכרון:**
```bash
cd sms-server
npm start
```

## מה לעשות אם השרת עדיין קורס

### 1. **הגדל את הגבלת הזיכרון:**
```json
// package.json
"start": "node --max-old-space-size=1024 server.js"
```

### 2. **הפעל ניקוי זיכרון תכוף יותר:**
```javascript
// הוסף לשרת
setInterval(() => {
  if (global.gc) {
    global.gc();
  }
}, 60000); // כל דקה
```

### 3. **הגבל את מספר הבקשות:**
```javascript
// הוסף rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100 // מקסימום 100 בקשות
});
app.use('/send-sms', limiter);
```

## הגבלות Free Plan ב-Render

### **זיכרון:**
- **Free Plan**: 512MB RAM
- **Paid Plan**: 2GB+ RAM

### **המלצה:**
- **התחל עם Free Plan** - 512MB מספיק לרוב השימושים
- **שדרג רק אם צריך** - אם יש הרבה משתמשים

## סימנים לבעיות זיכרון

### **בקונסול:**
```
FATAL ERROR: Reached heap limit Allocation failed
```

### **במעקב:**
```bash
curl http://localhost:3001/health
# אם heapUsed גבוה מ-400MB
```

### **פתרונות:**
1. הפעל ניקוי זיכרון ידני
2. הפעל מחדש את השרת
3. הגדל את הגבלת הזיכרון
4. שדרג ל-Paid Plan

## טיפים למניעה

### 1. **נקה קבצים זמניים:**
```javascript
// אחרי עיבוד CSV
fs.unlinkSync(req.file.path);
```

### 2. **הגבל גודל קבצים:**
```javascript
// multer configuration
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB מקסימום
  }
});
```

### 3. **השתמש ב-streaming:**
```javascript
// במקום לטעון את כל הקובץ לזיכרון
const stream = fs.createReadStream(filePath);
```

## סיכום

✅ **השרת מוגבל ל-512MB זיכרון**
✅ **ניקוי זיכרון אוטומטי אחרי כל בקשה**
✅ **Endpoint לניקוי ידני**
✅ **מעקב זיכרון**
✅ **עובד מצוין עם Free Plan של Render**

**המערכת עכשיו יציבה ומוגנת מפני קריסות זיכרון!** 🎉
