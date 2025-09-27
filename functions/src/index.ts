import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Hot SMS API credentials
const HOT_SMS_BASE_CREDENTIALS = 'Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI=';
const HOT_SMS_API_URL = 'https://capi.inforu.co.il/api/v2/SMS/SendSms';

// Function to process SMS requests
export const processSMSRequests = functions.firestore
  .document('smsRequests/{requestId}')
  .onCreate(async (snap, context) => {
    const request = snap.data();
    const requestId = context.params.requestId;
    
    console.log(`Processing SMS request: ${requestId}`, request);
    
    try {
      // Prepare the payload for Hot SMS API
      const payload = {
        Data: {
          Message: request.message,
          Recipients: [
            {
              Phone: request.phoneNumber
            }
          ],
          Settings: {
            Sender: request.sender || 'ELAL',
            CampaignName: 'Flight Message System',
            Priority: 0, // Normal priority
            MaxSegments: 0, // No limit
            IgnoreUnsubscribeCheck: false,
            AllowDuplicates: false,
            ShortenUrlEnable: false,
            TrackPurchaseTData: false
          }
        }
      };
      
      console.log('Sending SMS via Hot API:', {
        to: request.phoneNumber,
        message: request.message.substring(0, 50) + '...'
      });
      
      // Make API call to Hot SMS service
      const response = await fetch(HOT_SMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': HOT_SMS_BASE_CREDENTIALS,
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`SMS API error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      const messageId = result.Data?.MessageID || result.MessageID || 'unknown';
      
      console.log('SMS sent successfully:', messageId);
      
      // Update the request status to sent
      await snap.ref.update({
        status: 'sent',
        messageId: messageId,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        apiResponse: result
      });
      
      return { success: true, messageId };
      
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      
      // Update the request status to failed
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: false, error: error.message };
    }
  });

// Function to manually process pending SMS requests (for testing)
export const processPendingSMSRequests = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and has admin role
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const db = admin.firestore();
    const pendingRequests = await db.collection('smsRequests')
      .where('status', '==', 'pending')
      .limit(10)
      .get();
    
    const results = [];
    
    for (const doc of pendingRequests.docs) {
      const request = doc.data();
      
      // Process each request (same logic as above)
      try {
        const payload = {
          Data: {
            Message: request.message,
            Recipients: [{ Phone: request.phoneNumber }],
            Settings: {
              Sender: request.sender || 'ELAL',
              CampaignName: 'Flight Message System',
              Priority: 0,
              MaxSegments: 0,
              IgnoreUnsubscribeCheck: false,
              AllowDuplicates: false,
              ShortenUrlEnable: false,
              TrackPurchaseTData: false
            }
          }
        };
        
        const response = await fetch(HOT_SMS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': HOT_SMS_BASE_CREDENTIALS,
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const result = await response.json();
          const messageId = result.Data?.MessageID || result.MessageID || 'unknown';
          
          await doc.ref.update({
            status: 'sent',
            messageId: messageId,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            apiResponse: result
          });
          
          results.push({ id: doc.id, status: 'sent', messageId });
        } else {
          throw new Error(`API error: ${response.status}`);
        }
        
      } catch (error: any) {
        await doc.ref.update({
          status: 'failed',
          error: error.message,
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        results.push({ id: doc.id, status: 'failed', error: error.message });
      }
    }
    
    return { 
      success: true, 
      processed: results.length,
      results 
    };
    
  } catch (error: any) {
    console.error('Error processing pending SMS requests:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
