/**
 * Flight Message System - User Settings Component
 * © 2024 Shai Shmuel. All rights reserved.
 * 
 * User settings component for password management and account settings.
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { setPasswordForGoogleAccount, linkEmailPasswordToGoogle, changeUserPassword } from '../firebase/auth';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert,
  Divider,
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  User,
  Mail,
  Shield
} from 'lucide-react';

const UserSettings: React.FC = () => {
  const { userData, user, updateUserName } = useAuth();
  const { t } = useLanguage();
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password setup states (for Google users)
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmSetupPassword, setConfirmSetupPassword] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [showConfirmSetupPassword, setShowConfirmSetupPassword] = useState(false);
  
  // Name change states
  const [newName, setNewName] = useState(userData?.name || '');
  const [isChangingName, setIsChangingName] = useState(false);
  
  // UI states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSettingUpPassword, setIsSettingUpPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if user has Google provider
  const hasGoogleProvider = user?.providerData?.some(provider => provider.providerId === 'google.com');
  const hasEmailPasswordProvider = user?.providerData?.some(provider => provider.providerId === 'password');

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'אנא מלא את כל השדות' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'הסיסמאות אינן תואמות' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'הסיסמה חייבת להכיל לפחות 6 תווים' });
      return;
    }

    setIsChangingPassword(true);
    setMessage(null);

    try {
      const result = await changeUserPassword(currentPassword, newPassword);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'הסיסמה עודכנה בהצלחה' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: result.error || 'שגיאה בעדכון הסיסמה' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה לא צפויה' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordSetup = async () => {
    if (!setupPassword || !confirmSetupPassword) {
      setMessage({ type: 'error', text: 'אנא מלא את כל השדות' });
      return;
    }

    if (setupPassword !== confirmSetupPassword) {
      setMessage({ type: 'error', text: 'הסיסמאות אינן תואמות' });
      return;
    }

    if (setupPassword.length < 6) {
      setMessage({ type: 'error', text: 'הסיסמה חייבת להכיל לפחות 6 תווים' });
      return;
    }

    setIsSettingUpPassword(true);
    setMessage(null);

    try {
      const result = await linkEmailPasswordToGoogle(userData?.email || '', setupPassword);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'סיסמה נוספה בהצלחה! עכשיו תוכל להתחבר עם אימייל וסיסמה' });
        setSetupPassword('');
        setConfirmSetupPassword('');
      } else {
        setMessage({ type: 'error', text: result.error || 'שגיאה בהוספת הסיסמה' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה לא צפויה' });
    } finally {
      setIsSettingUpPassword(false);
    }
  };

  const handleNameChange = async () => {
    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'אנא הכנס שם תקין' });
      return;
    }

    if (newName === userData?.name) {
      setMessage({ type: 'error', text: 'השם זהה לשם הנוכחי' });
      return;
    }

    setIsChangingName(true);
    setMessage(null);

    try {
      const result = await updateUserName(newName.trim());
      
      if (result.success) {
        setMessage({ type: 'success', text: 'השם עודכן בהצלחה' });
      } else {
        setMessage({ type: 'error', text: result.error || 'שגיאה בעדכון השם' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה לא צפויה' });
    } finally {
      setIsChangingName(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ 
        mb: 4, 
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Shield size={32} />
        הגדרות חשבון
      </Typography>

      {/* User Info */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <User size={24} color="#667eea" />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                פרטי החשבון
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Mail size={20} color="#666" />
              <Typography variant="body1">
                <strong>אימייל:</strong> {userData?.email}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <User size={20} color="#666" />
              <Typography variant="body1">
                <strong>שם:</strong> {userData?.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Shield size={20} color="#666" />
              <Typography variant="body1">
                <strong>תפקיד:</strong> {userData?.role === 'admin' ? 'מנהל' : 'משתמש'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Name Change Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <User size={24} color="#667eea" />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                שינוי שם
              </Typography>
            </Box>
          }
          subheader="שנה את השם שלך"
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="שם חדש"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="הכנס את השם החדש שלך"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={20} color="#666" />
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
            
            <Button
              variant="contained"
              onClick={handleNameChange}
              disabled={isChangingName}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {isChangingName ? 'משנה שם...' : 'שנה שם'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Message Display */}
      {message && (
        <Alert 
          severity={message.type} 
          icon={message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Password Setup for Google Users */}
      {hasGoogleProvider && !hasEmailPasswordProvider && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Lock size={24} color="#667eea" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  הוספת סיסמה לחשבון
                </Typography>
              </Box>
            }
            subheader="הוסף סיסמה כדי שתוכל להתחבר עם אימייל וסיסמה במקום רק דרך Google"
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="סיסמה חדשה"
                type={showSetupPassword ? 'text' : 'password'}
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#666" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowSetupPassword(!showSetupPassword)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showSetupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="הסיסמה חייבת להכיל לפחות 6 תווים"
              />
              
              <TextField
                fullWidth
                label="אישור סיסמה"
                type={showConfirmSetupPassword ? 'text' : 'password'}
                value={confirmSetupPassword}
                onChange={(e) => setConfirmSetupPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#666" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmSetupPassword(!showConfirmSetupPassword)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showConfirmSetupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant="contained"
                onClick={handlePasswordSetup}
                disabled={isSettingUpPassword}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {isSettingUpPassword ? 'מוסיף סיסמה...' : 'הוסף סיסמה'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Password Change for Users with Password */}
      {hasEmailPasswordProvider && (
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Lock size={24} color="#667eea" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  שינוי סיסמה
                </Typography>
              </Box>
            }
            subheader="שנה את הסיסמה שלך"
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="סיסמה נוכחית"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#666" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="סיסמה חדשה"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#666" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="הסיסמה חייבת להכיל לפחות 6 תווים"
              />
              
              <TextField
                fullWidth
                label="אישור סיסמה חדשה"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#666" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant="contained"
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {isChangingPassword ? 'משנה סיסמה...' : 'שנה סיסמה'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Info for Google-only users */}
      {hasGoogleProvider && !hasEmailPasswordProvider && (
        <Paper sx={{ 
          p: 3, 
          mt: 3, 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CheckCircle size={24} color="#10b981" />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#10b981' }}>
              מידע חשוב
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            כרגע אתה מחובר דרך Google. הוספת סיסמה תאפשר לך להתחבר גם עם אימייל וסיסמה רגילים, 
            בנוסף לאפשרות להתחבר דרך Google. זה ייתן לך יותר גמישות בהתחברות.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default UserSettings;
