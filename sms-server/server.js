const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Memory management
if (global.gc) {
  console.log('Manual garbage collection available');
} else {
  console.log('Manual garbage collection not available');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Hot SMS API credentials
const HOT_SMS_BASE_CREDENTIALS = 'Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI=';
const HOT_SMS_API_URL = 'https://capi.inforu.co.il/api/v2/SMS/SendSms';

// Hot Email API credentials (using same credentials as SMS)
const HOT_EMAIL_BASE_CREDENTIALS = 'Basic bW9rZWQtZWxhbDo4MzI1MjQ3ZS03NzFiLTQyZDEtODg2Mi03MjdmZTYwYjRiOGI=';
const HOT_EMAIL_API_URL = 'https://capi.inforu.co.il/api/Umail/Campaign/Send/';
const HOT_EMAIL_CAMPAIGN_ID = process.env.HOT_EMAIL_CAMPAIGN_ID || '30000810'; // Campaign ID for ELAL emails

// Function to send SMS via Hot API
async function sendSMS(phoneNumber, message) {
  try {
    const payload = {
      Data: {
        Message: message,
        Recipients: [
          {
            Phone: phoneNumber
          }
        ],
        Settings: {
          Sender: 'ELAL',
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

    console.log('Sending SMS via Hot API:', {
      to: phoneNumber,
      message: message.substring(0, 50) + '...'
    });

    const response = await fetch(HOT_SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': HOT_SMS_BASE_CREDENTIALS,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`SMS API error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('SMS API response:', result);
    
    if (result.StatusId === -1) {
      throw new Error(`SMS API error: ${result.StatusDescription || 'Unknown error'}`);
    }
    
    return { success: true, messageId: result.Data?.CampaignId || 'unknown', apiResponse: result };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
}

// Function to parse CSV file
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const contacts = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Expected CSV format: name,phone,email
        contacts.push({
          name: row.name || row.Name || row.NAME || '',
          phone: row.phone || row.Phone || row.PHONE || row.phoneNumber || row.PhoneNumber || '',
          email: row.email || row.Email || row.EMAIL || ''
        });
      })
      .on('end', () => {
        resolve(contacts);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Function to send Email via Hot API
async function sendEmailViaHotApi(email, subject, message) {
  try {
    console.log('Sending Email via Hot API:', {
      to: email,
      subject: subject,
      message: message.substring(0, 50) + '...'
    });

    const payload = {
      Data: {
        CampaignId: 57934763,
        CampaignName: "Flight Message System " + Date.now(),
        CampaignRefId: "ELAL-FLIGHT-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        FromAddress: "noreply@elal.co.il",
        ReplyAddress: "noreply@elal.co.il",
        FromName: "ELAL Airlines",
        IgnoreUnsubscribeCheck: false,
        EmbeddedImages: false,
        ScheduledSending: new Date(Date.now() + 60000).toISOString().replace('T', ' ').substring(0, 19), // Schedule 1 minute from now
        Subject: subject,
        Preheader: "הודעת טיסה מ-ELAL",
        Body: message,
        AllowDuplicates: true,
        UpdateContacts: false,
        IncludeContacts: [
          {
            FirstName: "Customer",
            LastName: "ELAL",
            Email: email
          }
        ],
        IgnorePossibleSendingTime: false,
        TrackPurchaseTData: false
      }
    };

    console.log('Email payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(HOT_EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': HOT_EMAIL_BASE_CREDENTIALS,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Email API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Email API response:', result);
    
    // Check if the response indicates success
    if (result.StatusId === -1) {
      throw new Error(`Email API error: ${result.StatusDescription || 'Unknown error'}`);
    }
    
    return { success: true, messageId: result.Data?.CampaignId || 'unknown', apiResponse: result };
  } catch (error) {
    console.error('Error sending Email:', error);
    return { success: false, error: error.message };
  }
}

// Simple SMS server - no Firebase needed

// API endpoint for manual SMS sending (for testing)
app.post('/send-sms', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }

    const result = await sendSMS(phoneNumber, message);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error in /send-sms endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Bulk send endpoint
app.post('/send-bulk', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CSV file uploaded' });
    }

    const { messageContent, sendSMS: shouldSendSMS, sendEmail } = req.body;
    
    if (!messageContent) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    // Parse CSV file
    const contacts = await parseCSV(req.file.path);
    console.log(`Parsed ${contacts.length} contacts from CSV`);

    const results = {
      total: contacts.length,
      smsSent: 0,
      emailSent: 0,
      errors: []
    };

    // Process each contact
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      console.log(`Processing contact ${i + 1}/${contacts.length}: ${contact.name}`);

      // Send SMS if requested and phone number exists
      if (shouldSendSMS === 'true' && contact.phone) {
        try {
          const smsResult = await sendSMS(contact.phone, messageContent);
          if (smsResult.success) {
            results.smsSent++;
          } else {
            results.errors.push(`SMS failed for ${contact.name}: ${smsResult.error}`);
          }
        } catch (error) {
          results.errors.push(`SMS error for ${contact.name}: ${error.message}`);
        }
      }

      // Send Email if requested and email exists
      if (sendEmail === 'true' && contact.email) {
        try {
          const emailSubject = `הודעת טיסה - ELAL`;
          const emailResult = await sendEmailViaHotApi(contact.email, emailSubject, messageContent);
          if (emailResult.success) {
            results.emailSent++;
          } else {
            results.errors.push(`Email failed for ${contact.name}: ${emailResult.error}`);
          }
        } catch (error) {
          results.errors.push(`Email error for ${contact.name}: ${error.message}`);
        }
      }

      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    res.json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('Bulk send error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint for manual email sending via Hot API
app.post('/send-email', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Email, subject and message are required.' });
    }

    const result = await sendEmailViaHotApi(email, subject, message);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in /send-email endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'SMS Server for Hot API',
    memory: process.memoryUsage()
  });
});

// Memory cleanup endpoint
app.post('/cleanup', (req, res) => {
  if (global.gc) {
    global.gc();
    res.json({
      success: true,
      message: 'Garbage collection completed',
      memory: process.memoryUsage()
    });
  } else {
    res.json({
      success: false,
      message: 'Garbage collection not available',
      memory: process.memoryUsage()
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`SMS Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Manual SMS endpoint: POST http://localhost:${PORT}/send-sms`);
  console.log(`Manual Email endpoint: POST http://localhost:${PORT}/send-email`);
  console.log(`Bulk send endpoint: POST http://localhost:${PORT}/send-bulk`);
  console.log(`Memory cleanup endpoint: POST http://localhost:${PORT}/cleanup`);
  console.log(`Ready to send SMS and Email via Hot API!`);
  console.log(`Memory usage:`, process.memoryUsage());
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down SMS server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down SMS server...');
  process.exit(0);
});
