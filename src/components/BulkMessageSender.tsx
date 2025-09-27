import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { CloudUpload, Send } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppSelector } from '../store/hooks';

interface BulkMessageSenderProps {
  onClose: () => void;
  messageContent?: {
    hebrew: string;
    english: string;
    french?: string;
  };
}

interface BulkSendResult {
  total: number;
  smsSent: number;
  emailSent: number;
  errors: string[];
}

const BulkMessageSender: React.FC<BulkMessageSenderProps> = ({ onClose, messageContent }) => {
  const { language, t } = useLanguage();
  const [sendSMS, setSendSMS] = useState(true);
  const [sendEmail, setSendEmail] = useState(false); // Default to false since email doesn't work
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkSendResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('אנא בחר קובץ CSV בלבד');
      }
    }
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
    if (phoneError) {
      setPhoneError(null);
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (emailError) {
      setEmailError(null);
    }
  };

  const handleSend = async () => {
    // Validate phone number and email if sending individual message
    if (!selectedFile) {
      if (sendSMS && (!phoneNumber || phoneNumber.trim() === '')) {
        setPhoneError('אנא הזן מספר טלפון לשליחת SMS');
        return;
      }
      if (sendEmail && (!email || email.trim() === '')) {
        setEmailError('אנא הזן כתובת אימייל לשליחת אימייל');
        return;
      }
      if (!sendSMS && !sendEmail) {
        setError('אנא בחר לפחות סוג הודעה אחד (SMS או אימייל)');
        return;
      }
    } else {
      if (!sendSMS && !sendEmail) {
        setError('אנא בחר לפחות סוג הודעה אחד (SMS או אימייל)');
        return;
      }
    }

    if (!messageContent?.hebrew || !messageContent?.english) {
      setError('אנא צור הודעה בלשונית הטיסות לפני שליחת הודעות המוניות');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create combined message content (Hebrew + English like in the main form)
      const combinedMessage = `${messageContent.hebrew}\n\n${messageContent.english}`;

      const smsServerUrl = process.env.REACT_APP_SMS_SERVER_URL || 'http://localhost:3001';
      let response;
      let data;

      if (selectedFile) {
        // Bulk sending via CSV
        const formData = new FormData();
        formData.append('csvFile', selectedFile);
        formData.append('messageContent', combinedMessage);
        formData.append('sendSMS', sendSMS.toString());
        formData.append('sendEmail', sendEmail.toString());

        response = await fetch(`${smsServerUrl}/send-bulk`, {
          method: 'POST',
          body: formData,
        });
        data = await response.json();

        if (data.success) {
          setResult(data.results);
          setShowResult(true);
        } else {
          setError(data.error || 'שגיאה בשליחת ההודעות');
        }
      } else {
        // Individual sending
        let successCount = 0;
        let errorMessages = [];

        if (sendSMS && phoneNumber) {
          try {
            const smsResponse = await fetch(`${smsServerUrl}/send-sms`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phoneNumber: phoneNumber,
                message: combinedMessage
              })
            });
            const smsData = await smsResponse.json();
            if (smsData.success) {
              successCount++;
            } else {
              errorMessages.push(`SMS נכשל: ${smsData.error}`);
            }
          } catch (error) {
            errorMessages.push('שליחת SMS נכשלה');
          }
        }

        if (sendEmail && email) {
          try {
            const emailResponse = await fetch(`${smsServerUrl}/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                subject: 'הודעת טיסה - ELAL',
                message: combinedMessage
              })
            });
            const emailData = await emailResponse.json();
            if (emailData.success) {
              successCount++;
            } else {
              errorMessages.push(`אימייל נכשל: ${emailData.error}`);
            }
          } catch (error) {
            errorMessages.push('שליחת אימייל נכשלה');
          }
        }

        if (successCount > 0) {
          setResult({
            total: 1,
            smsSent: sendSMS && phoneNumber ? 1 : 0,
            emailSent: sendEmail && email ? 1 : 0,
            errors: errorMessages
          });
          setShowResult(true);
        } else {
          setError(errorMessages.join(', ') || 'שגיאה בשליחת ההודעות');
        }
      }
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      setError('שגיאה בשליחת ההודעות');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResult(null);
    onClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          שליחת הודעות
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          העלה קובץ CSV עם רשימת אנשי קשר או הזן מספר טלפון/אימייל יחיד ושלוח את ההודעה שנוצרה בלשונית הטיסות
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* File Upload or Individual Contact */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            העלאת קובץ CSV או שליחה למספר יחיד
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            פורמט הקובץ: name,phone,email (שורה ראשונה יכולה להיות כותרות)
            <br />
            <strong>הערה:</strong> כרגע רק SMS נתמך. אימייל יופעל בעתיד.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
            >
              בחר קובץ CSV
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileSelect}
              />
            </Button>
            
            {selectedFile && (
              <Typography variant="body2" color="primary">
                נבחר: {selectedFile.name}
              </Typography>
            )}
          </Box>

          {/* Individual Contact Fields */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mt: 2 }}>
            <Box sx={{ flex: 1, maxWidth: 300 }}>
              {phoneError && (
                <Alert severity="error" sx={{ mb: 1, borderRadius: 2, fontSize: '0.875rem' }}>
                  {phoneError}
                </Alert>
              )}
              <TextField
                fullWidth
                size="small"
                label="מספר טלפון"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="0501234567"
                error={!!phoneError}
                inputProps={{ 
                            maxLength: 4,
                            pattern: '[0-9]*',
                            inputMode: 'numeric'
                          }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    direction: 'rtl',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: phoneError ? '#d32f2f' : '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: phoneError ? '#d32f2f' : '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    right: 20,
                    left: 'auto',
                    transformOrigin: 'top right',
                    '&.Mui-focused': {
                      transform: 'translate(20px, -9px) scale(0.75)',
                    },
                    '&.MuiFormLabel-filled': {
                      transform: 'translate(20px, -9px) scale(0.75)',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'right',
                    padding: '8.5px 14px',
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: 1, maxWidth: 300 }}>
              {emailError && (
                <Alert severity="error" sx={{ mb: 1, borderRadius: 2, fontSize: '0.875rem' }}>
                  {emailError}
                </Alert>
              )}
              <TextField
                fullWidth
                size="small"
                label="כתובת אימייל"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="user@example.com"
                error={!!emailError}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    direction: 'rtl',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: emailError ? '#d32f2f' : '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: emailError ? '#d32f2f' : '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    right: 20,
                    left: 'auto',
                    transformOrigin: 'top right',
                    '&.Mui-focused': {
                      transform: 'translate(20px, -9px) scale(0.75)',
                    },
                    '&.MuiFormLabel-filled': {
                      transform: 'translate(20px, -9px) scale(0.75)',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'right',
                    padding: '8.5px 14px',
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Message Content Preview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            תוכן ההודעה לשליחה
          </Typography>
          
          {messageContent ? (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                תצוגה מקדימה של ההודעה:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                <strong>עברית:</strong>
                <br />
                {messageContent.hebrew}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                <strong>אנגלית:</strong>
                <br />
                {messageContent.english}
              </Typography>
            </Box>
          ) : (
            <Alert severity="warning">
              אנא צור הודעה בלשונית הטיסות לפני שליחת הודעות המוניות
            </Alert>
          )}
        </Box>

        {/* Send Options */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            אפשרויות שליחה
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={sendSMS}
                onChange={(e) => setSendSMS(e.target.checked)}
              />
            }
            label="שלח SMS"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={true}
              />
            }
            label="שלח אימייל (לא זמין כרגע)"
          />
        </Box>

        {/* Send Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={isUploading ? <CircularProgress size={20} /> : <Send />}
          onClick={handleSend}
          disabled={isUploading || (!selectedFile && !phoneNumber && !email)}
          fullWidth
        >
          {isUploading ? 'שולח הודעות...' : (selectedFile ? 'שלח הודעות המוניות' : 'שלח הודעה יחידה')}
        </Button>

        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              שולח הודעות... אנא המתן
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Results Dialog */}
      <Dialog open={showResult} onClose={handleCloseResult} maxWidth="md" fullWidth>
        <DialogTitle>תוצאות שליחת ההודעות</DialogTitle>
        <DialogContent>
          {result && (
            <Box>
              <Typography variant="h6" gutterBottom>
                סיכום
              </Typography>
              <Typography variant="body1">
                סה"כ אנשי קשר: {result.total}
              </Typography>
              <Typography variant="body1" color="primary">
                SMS נשלחו: {result.smsSent}
              </Typography>
              <Typography variant="body1" color="primary">
                אימיילים נשלחו: {result.emailSent}
              </Typography>
              
              {result.errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" color="error" gutterBottom>
                    שגיאות ({result.errors.length})
                  </Typography>
                  <List dense>
                    {result.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={error}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResult}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkMessageSender;
