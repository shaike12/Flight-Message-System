# הגדרת שרת Backend לשליחת SMS

## הבעיה
הדפדפן חוסם בקשות API ישירות לשרתים חיצוניים מסיבות אבטחה (CORS policy). לכן לא ניתן לשלוח SMS ישירות מהדפדפן.

## הפתרון הנוכחי
המערכת שומרת את בקשת ה-SMS ב-Firebase ב-collection בשם `smsRequests`. שרת backend צריך לעבד את הבקשות האלה ולשלוח את ה-SMS.

## מבנה הנתונים ב-Firebase
```json
{
  "phoneNumber": "522546036",
  "message": "הודעה חדשה נשלחה: טיסה 123 מתל אביב לניו יורק...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "pending",
  "sender": "ELAL"
}
```

## אפשרויות לשרת Backend

### 1. Firebase Cloud Functions (מומלץ)
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.processSMSRequests = functions.firestore
  .document('smsRequests/{requestId}')
  .onCreate(async (snap, context) => {
    const request = snap.data();
    
    // Call Hot SMS API
    const response = await fetch('https://capi.inforu.co.il/api/v2/SMS/SendSms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI=',
      },
      body: JSON.stringify({
        Data: {
          Message: request.message,
          Recipients: [{ Phone: request.phoneNumber }],
          Settings: {
            Sender: 'ELAL',
            CampaignName: 'Flight Message System',
            Priority: 0
          }
        }
      })
    });
    
    // Update status
    await snap.ref.update({
      status: response.ok ? 'sent' : 'failed',
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
```

### 2. Node.js Server
```javascript
const express = require('express');
const admin = require('firebase-admin');

const app = express();

// Listen for new SMS requests
const db = admin.firestore();
db.collection('smsRequests')
  .where('status', '==', 'pending')
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const request = change.doc.data();
        await sendSMS(request);
        await change.doc.ref.update({ status: 'sent' });
      }
    });
  });

async function sendSMS(request) {
  // Call Hot SMS API
  // ... API call code
}
```

### 3. Python Server
```python
import firebase_admin
from firebase_admin import credentials, firestore
import requests

# Initialize Firebase
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def send_sms(request_data):
    url = 'https://capi.inforu.co.il/api/v2/SMS/SendSms'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI='
    }
    
    payload = {
        'Data': {
            'Message': request_data['message'],
            'Recipients': [{'Phone': request_data['phoneNumber']}],
            'Settings': {
                'Sender': 'ELAL',
                'CampaignName': 'Flight Message System',
                'Priority': 0
            }
        }
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.status_code == 200

# Listen for new requests
def on_snapshot(doc_snapshot, changes, read_time):
    for change in changes:
        if change.type.name == 'ADDED':
            request_data = change.document.to_dict()
            if request_data['status'] == 'pending':
                success = send_sms(request_data)
                change.document.reference.update({
                    'status': 'sent' if success else 'failed'
                })

# Start listening
db.collection('smsRequests').on_snapshot(on_snapshot)
```

## הוראות הפעלה

### Firebase Cloud Functions:
1. התקן Firebase CLI: `npm install -g firebase-tools`
2. התחבר: `firebase login`
3. אתחל פרויקט: `firebase init functions`
4. הוסף את הקוד למעלה
5. פרוס: `firebase deploy --only functions`

### Node.js Server:
1. צור תיקייה חדשה: `mkdir sms-backend`
2. אתחל פרויקט: `npm init -y`
3. התקן dependencies: `npm install express firebase-admin`
4. הוסף את הקוד למעלה
5. הפעל: `node server.js`

## בדיקה
1. שלח הודעה עם מספר טלפון
2. בדוק ב-Firebase Console ב-collection `smsRequests`
3. ודא שהשרת מעבד את הבקשות ומעדכן את הסטטוס

## הערות חשובות
- השרת צריך להיות פעיל כל הזמן
- הוסף טיפול בשגיאות
- שקול להוסיף retry logic
- הוסף logging לניטור
