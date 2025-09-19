import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Divider, 
  IconButton, 
  InputAdornment,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Chip
} from '@mui/material';

// Google Icon Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Define proper types
interface LoginFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'user' | 'admin';
}

interface MessageState {
  type: 'success' | 'error';
  text: string;
}

const Login: React.FC = () => {
  const { signIn, signUp, signInWithGoogle, sendPhoneVerification, verifyPhoneCode } = useAuth();
  const { t, language } = useLanguage();
  
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  
  // Phone authentication states
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isPhoneVerificationSent, setIsPhoneVerificationSent] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message) setMessage(null);
  }, [message]);

  const validateForm = useCallback((): boolean => {
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: language === 'he' ? 'אנא מלא את כל השדות הנדרשים' : 'Please fill in all required fields' });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: language === 'he' ? 'כתובת האימייל אינה תקינה' : 'Invalid email address' });
      return false;
    }

    if (!isLogin) {
      if (!formData.name || !formData.confirmPassword) {
        setMessage({ type: 'error', text: language === 'he' ? 'אנא מלא את כל השדות הנדרשים' : 'Please fill in all required fields' });
        return false;
      }

      if (formData.name.length < 2) {
        setMessage({ type: 'error', text: language === 'he' ? 'השם חייב להכיל לפחות 2 תווים' : 'Name must be at least 2 characters' });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: language === 'he' ? 'הסיסמאות אינן תואמות' : 'Passwords do not match' });
        return false;
      }

      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: language === 'he' ? 'הסיסמא חייבת להכיל לפחות 6 תווים' : 'Password must be at least 6 characters' });
        return false;
      }
    }

    return true;
  }, [formData, isLogin, language]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      let result;
      
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, {
          name: formData.name,
          role: formData.role
        });
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: isLogin 
            ? (language === 'he' ? 'התחברת בהצלחה!' : 'Successfully logged in!')
            : (language === 'he' ? 'החשבון נוצר בהצלחה!' : 'Account created successfully!')
        });
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          role: 'user'
        });
      } else {
        // Handle specific Firebase errors
        let errorMessage = language === 'he' ? 'אירעה שגיאה' : 'An error occurred';
        
        if (result.error) {
          if (result.error.includes('auth/user-not-found')) {
            errorMessage = language === 'he' ? 'משתמש עם כתובת אימייל זו לא קיים במערכת' : 'User with this email does not exist';
          } else if (result.error.includes('auth/wrong-password')) {
            errorMessage = language === 'he' ? 'הסיסמא שגויה' : 'Wrong password';
          } else if (result.error.includes('auth/invalid-credential')) {
            errorMessage = language === 'he' ? 'פרטי ההתחברות שגויים. אנא בדוק את האימייל והסיסמא' : 'Invalid credentials. Please check your email and password';
          } else if (result.error.includes('auth/email-already-in-use')) {
            errorMessage = language === 'he' ? 'כתובת אימייל זו כבר רשומה במערכת' : 'This email is already registered';
          } else if (result.error.includes('auth/weak-password')) {
            errorMessage = language === 'he' ? 'הסיסמא חלשה מדי. אנא בחר סיסמא חזקה יותר' : 'Password is too weak. Please choose a stronger password';
          } else if (result.error.includes('auth/invalid-email')) {
            errorMessage = language === 'he' ? 'כתובת האימייל אינה תקינה' : 'Invalid email address';
          } else if (result.error.includes('auth/too-many-requests')) {
            errorMessage = language === 'he' ? 'יותר מדי ניסיונות התחברות. אנא נסה שוב מאוחר יותר' : 'Too many login attempts. Please try again later';
          } else if (result.error.includes('auth/network-request-failed')) {
            errorMessage = language === 'he' ? 'בעיית חיבור לאינטרנט. אנא בדוק את החיבור שלך' : 'Network connection issue. Please check your connection';
          } else if (result.error.includes('auth/user-disabled')) {
            errorMessage = language === 'he' ? 'החשבון הושבת. אנא פנה למנהל המערכת' : 'Account is disabled. Please contact system administrator';
          } else if (result.error.includes('auth/operation-not-allowed')) {
            errorMessage = language === 'he' ? 'פעולה זו לא מותרת. אנא פנה למנהל המערכת' : 'This operation is not allowed. Please contact system administrator';
          } else {
            errorMessage = result.error;
          }
        }
        
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error: unknown) {
      console.error('Unexpected error:', error);
      setMessage({ 
        type: 'error', 
        text: language === 'he' ? 'אירעה שגיאה לא צפויה' : 'An unexpected error occurred' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, isLogin, validateForm, signIn, signUp, language]);

  const toggleMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setMessage(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'user'
    });
  }, []);

  const handleGoogleSignIn = useCallback(async (): Promise<void> => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: language === 'he' ? 'התחברת עם Google בהצלחה!' : 'Successfully signed in with Google!'
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || (language === 'he' ? 'שגיאה בהתחברות עם Google' : 'Error signing in with Google')
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setMessage({ 
        type: 'error', 
        text: language === 'he' ? 'שגיאה בהתחברות עם Google' : 'Error signing in with Google'
      });
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, language]);

  const handleSendPhoneCode = useCallback(async (): Promise<void> => {
    if (!phoneNumber.trim()) {
      setMessage({ 
        type: 'error', 
        text: language === 'he' ? 'אנא הזן מספר טלפון' : 'Please enter a phone number'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Format phone number for Israel (+972)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+972${phoneNumber.replace(/^0/, '')}`;
      
      const result = await sendPhoneVerification(formattedPhone);
      
      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setIsPhoneVerificationSent(true);
        setMessage({ 
          type: 'success', 
          text: result.message || (language === 'he' ? 'קוד אימות נשלח בהצלחה!' : 'Verification code sent successfully!')
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || (language === 'he' ? 'שגיאה בשליחת קוד האימות' : 'Error sending verification code')
        });
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      setMessage({ 
        type: 'error', 
        text: language === 'he' ? 'שגיאה בשליחת קוד האימות' : 'Error sending verification code'
      });
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, sendPhoneVerification, language]);

  const handleVerifyPhoneCode = useCallback(async (): Promise<void> => {
    if (!verificationCode.trim()) {
      setMessage({ 
        type: 'error', 
        text: language === 'he' ? 'אנא הזן קוד אימות' : 'Please enter verification code'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await verifyPhoneCode(confirmationResult, verificationCode);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: language === 'he' ? 'התחברת עם הטלפון בהצלחה!' : 'Successfully signed in with phone!'
        });
        // Reset phone states
        setIsPhoneVerificationSent(false);
        setPhoneNumber('');
        setVerificationCode('');
        setConfirmationResult(null);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || (language === 'he' ? 'קוד אימות שגוי' : 'Invalid verification code')
        });
      }
    } catch (error) {
      console.error('Phone code verification error:', error);
      setMessage({ 
        type: 'error', 
        text: language === 'he' ? 'שגיאה באימות הקוד' : 'Error verifying code'
      });
    } finally {
      setLoading(false);
    }
  }, [verificationCode, confirmationResult, verifyPhoneCode, language]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid',
            borderColor: 'primary.main',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                }}
              >
                <User size={40} color="white" />
              </Box>
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 'bold', 
                color: 'text.primary',
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {isLogin ? 'התחברות למערכת' : 'הרשמה למערכת'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isLogin ? 'הכנס את פרטי החשבון שלך' : 'צור חשבון חדש'}
              </Typography>
            </Box>

            {/* Authentication Method Selector */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center' }}>
              <Button
                variant={authMethod === 'email' ? 'contained' : 'outlined'}
                onClick={() => setAuthMethod('email')}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  minWidth: '100px'
                }}
              >
                אימייל
              </Button>
              <Button
                variant={authMethod === 'phone' ? 'contained' : 'outlined'}
                onClick={() => setAuthMethod('phone')}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  minWidth: '100px'
                }}
              >
                טלפון
              </Button>
            </Box>

            {/* Loading Overlay */}
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  borderRadius: 4,
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <CircularProgress size={48} sx={{ color: 'primary.main' }} />
                  <Typography variant="body1" color="text.secondary">
                    {language === 'he' ? 'מעבד...' : 'Processing...'}
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Email Authentication Form */}
            {authMethod === 'email' && (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Stack spacing={3}>
                {!isLogin && (
                  <TextField
                    fullWidth
                    name="name"
                    label="שם מלא"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="הכנס את שמך המלא"
                    variant="outlined"
                    required={!isLogin}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={20} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                )}

                <TextField
                  fullWidth
                  name="email"
                  label="כתובת אימייל"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="הכנס את כתובת האימייל שלך"
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="סיסמא"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="הכנס את הסיסמא שלך"
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />

                {!isLogin && (
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    label="אישור סיסמא"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="הכנס שוב את הסיסמא"
                    variant="outlined"
                    required={!isLogin}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={20} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                )}

                {!isLogin && (
                  <TextField
                    fullWidth
                    name="role"
                    label="תפקיד"
                    select
                    value={formData.role}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <option value="user">משתמש רגיל</option>
                    <option value="admin">מנהל</option>
                  </TextField>
                )}

                {message && (
                  <Alert
                    severity={message.type === 'error' ? 'error' : 'success'}
                    onClose={() => setMessage(null)}
                    sx={{
                      borderRadius: 2,
                      '& .MuiAlert-message': {
                        width: '100%',
                      },
                    }}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)',
                    },
                  }}
                >
                  {loading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} color="inherit" />
                      <Typography variant="body2">
                        {isLogin ? 'מתחבר...' : 'יוצר חשבון...'}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body1" fontWeight="bold">
                      {isLogin ? 'התחבר' : 'צור חשבון'}
                    </Typography>
                  )}
                </Button>

                {/* Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                    או
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                {/* Google Sign In Button */}
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#dadce0',
                    color: '#3c4043',
                    backgroundColor: 'white',
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      borderColor: '#dadce0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    },
                    '&:disabled': {
                      backgroundColor: '#f8f9fa',
                      color: '#9aa0a6',
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GoogleIcon />
                    <Typography variant="body1" fontWeight="500">
                      {isLogin ? 'התחבר עם Google' : 'הירשם עם Google'}
                    </Typography>
                  </Stack>
                </Button>

                <Button
                  type="button"
                  onClick={toggleMode}
                  variant="text"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {isLogin ? 'אין לך חשבון? הירשם כאן' : 'יש לך חשבון? התחבר כאן'}
                </Button>
              </Stack>
            </Box>
            )}

            {/* Phone Authentication Form */}
            {authMethod === 'phone' && (
              <Box sx={{ mt: 3 }}>
                <Stack spacing={3}>
                  {!isPhoneVerificationSent ? (
                    <>
                      {/* Phone Number Input */}
                      <TextField
                        fullWidth
                        label="מספר טלפון"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="050-1234567"
                        variant="outlined"
                        type="tel"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography variant="body2" color="text.secondary">
                                +972
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />

                      {/* Send Code Button */}
                      <Button
                        type="button"
                        onClick={handleSendPhoneCode}
                        disabled={loading || !phoneNumber.trim()}
                        fullWidth
                        variant="contained"
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          },
                          '&:disabled': {
                            background: 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)',
                          },
                        }}
                      >
                        {loading ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={16} color="inherit" />
                            <Typography variant="body2">
                              שולח קוד...
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body1" fontWeight="bold">
                            שלח קוד אימות
                          </Typography>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Verification Code Input */}
                      <TextField
                        fullWidth
                        label="קוד אימות"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        variant="outlined"
                        type="text"
                        inputProps={{ maxLength: 6 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />

                      {/* Verify Code Button */}
                      <Button
                        type="button"
                        onClick={handleVerifyPhoneCode}
                        disabled={loading || !verificationCode.trim()}
                        fullWidth
                        variant="contained"
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          },
                          '&:disabled': {
                            background: 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)',
                          },
                        }}
                      >
                        {loading ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={16} color="inherit" />
                            <Typography variant="body2">
                              מאמת...
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body1" fontWeight="bold">
                            אמת קוד
                          </Typography>
                        )}
                      </Button>

                      {/* Back to Phone Number */}
                      <Button
                        type="button"
                        onClick={() => {
                          setIsPhoneVerificationSent(false);
                          setVerificationCode('');
                          setConfirmationResult(null);
                        }}
                        variant="text"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        חזור למספר טלפון
                      </Button>
                    </>
                  )}

                  {/* reCAPTCHA Container */}
                  <div id="recaptcha-container"></div>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
