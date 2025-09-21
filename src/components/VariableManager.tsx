import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchCustomVariablesAsync, 
  addCustomVariableAsync, 
  updateCustomVariableAsync, 
  deleteCustomVariableAsync 
} from '../store/slices/customVariablesSlice';
import { CustomVariable } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Settings,
  AlertTriangle 
} from 'lucide-react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Divider } from '@mui/material';

const VariableManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { language, t } = useLanguage();
  const { user, userData } = useAuth();
  const { variables, loading, error } = useAppSelector((state) => state.customVariables);

  // const [isAdding, setIsAdding] = useState(false); // Removed unused variable
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    displayNameEnglish: '',
    displayNameFrench: '',
    type: 'text' as 'text' | 'time' | 'date' | 'number',
    placeholder: '',
    placeholderEnglish: '',
    placeholderFrench: '',
    isActive: true,
    order: 0,
  });

  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if (isAdmin && user && userData) {
      dispatch(fetchCustomVariablesAsync());
    }
  }, [dispatch, isAdmin, user, userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | any) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      displayName: '',
      displayNameEnglish: '',
      displayNameFrench: '',
      type: 'text',
      placeholder: '',
      placeholderEnglish: '',
      placeholderFrench: '',
      isActive: true,
      order: variables.length + 1,
    });
    setDialogOpen(true);
  };

  const handleEdit = (variable: CustomVariable) => {
    setEditingId(variable.id);
    setFormData({
      name: variable.name,
      displayName: variable.displayName,
      displayNameEnglish: variable.displayNameEnglish,
      displayNameFrench: variable.displayNameFrench || '',
      type: variable.type,
      placeholder: variable.placeholder,
      placeholderEnglish: variable.placeholderEnglish,
      placeholderFrench: variable.placeholderFrench || '',
      isActive: variable.isActive,
      order: variable.order || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await dispatch(updateCustomVariableAsync({
          id: editingId,
          ...formData,
          createdAt: variables.find(v => v.id === editingId)?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setEditingId(null);
      } else {
        await dispatch(addCustomVariableAsync(formData));
      }
      setFormData({
        name: '',
        displayName: '',
        displayNameEnglish: '',
        displayNameFrench: '',
        type: 'text',
        placeholder: '',
        placeholderEnglish: '',
        placeholderFrench: '',
        isActive: true,
        order: 0,
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving variable:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setDialogOpen(false);
    setFormData({
      name: '',
      displayName: '',
      displayNameEnglish: '',
      displayNameFrench: '',
      type: 'text',
      placeholder: '',
      placeholderEnglish: '',
      placeholderFrench: '',
      isActive: true,
      order: 0,
    });
  };

  const handleDelete = async (variableId: string) => {
    if (window.confirm(language === 'he' ? 'האם אתה בטוח שברצונך למחוק משתנה זה?' : 'Are you sure you want to delete this variable?')) {
      try {
        await dispatch(deleteCustomVariableAsync(variableId));
      } catch (error) {
        console.error('Error deleting variable:', error);
      }
    }
  };

  if (!user || !userData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert severity="warning" className="mb-4">
          {language === 'he' ? 
            'אנא התחבר למערכת כדי לגשת לדף זה. דף זה זמין רק למשתמשים מסוג אדמין.' :
            'Please log in to access this page. This page is only available for admin users.'
          }
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert severity="error" className="mb-4">
          {language === 'he' ? 
            'אין לך הרשאות לגשת לדף זה. דף זה זמין רק למשתמשים מסוג אדמין.' :
            'You do not have permission to access this page. This page is only available for admin users.'
          }
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                {language === 'he' ? 'ניהול משתנים' : 'Variable Management'}
                    </h1>
                    <p className="text-blue-100 mt-1">
                      {language === 'he' ? 
                        'ניהול משתנים מותאמים אישית לטופס יצירת ההודעות' : 
                        'Manage custom variables for the message creation form'
                      }
                    </p>
                  </div>
            </div>
            <Button
              variant="contained"
                  startIcon={<Plus className="h-5 w-5" />}
              onClick={handleAdd}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important',
                    backgroundColor: 'transparent !important',
                    color: 'white !important',
                    border: 'none !important',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3) !important',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important',
                      backgroundColor: 'transparent !important',
                      color: 'white !important',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4) !important',
                    },
                    '& .MuiButton-startIcon': {
                      color: 'white !important',
                    },
                    transition: 'all 0.3s ease',
                  }}
            >
              {language === 'he' ? 'הוסף משתנה' : 'Add Variable'}
            </Button>
          </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">

          {error && (
            <Alert severity="error" className="mb-4">
              {error.includes('Permission denied') || error.includes('Missing or insufficient permissions') ? (
                <div>
                  <p className="mb-2">
                    {language === 'he' ? 
                      'שגיאת הרשאות Firebase. האוסף customVariables לא קיים או אין הרשאות אליו.' :
                      'Firebase permission error. The customVariables collection does not exist or you do not have permissions to it.'
                    }
                  </p>
                  <p className="mb-2">
                    {language === 'he' ? 
                      'פתרונות אפשריים:' :
                      'Possible solutions:'
                    }
                  </p>
                  <ul className="list-disc list-inside mb-2">
                    <li>
                      {language === 'he' ? 
                        'הוסף את האוסף customVariables לכללי האבטחה של Firebase' :
                        'Add customVariables collection to Firebase security rules'
                      }
                    </li>
                    <li>
                      {language === 'he' ? 
                        'צור את האוסף באופן ידני ב-Firebase Console' :
                        'Create the collection manually in Firebase Console'
                      }
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600">
                    {language === 'he' ? 
                      'כללי אבטחה נדרשים:' :
                      'Required security rules:'
                    }
                  </p>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
{`match /customVariables/{document} {
  allow read, write: if request.auth != null;
}`}
                  </pre>
                </div>
              ) : (
                error
              )}
            </Alert>
          )}


            {/* Variables List */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                  <p className="text-gray-600 text-lg font-medium">{language === 'he' ? 'טוען משתנים...' : 'Loading variables...'}</p>
                </div>
              ) : variables.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
                    <AlertTriangle className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {language === 'he' ? 'אין משתנים זמינים' : 'No variables available'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {language === 'he' ? 
                      'התחל ביצירת משתנה חדש כדי להוסיף שדות מותאמים אישית לטופס' :
                      'Start by creating a new variable to add custom fields to the form'
                    }
                  </p>
                  <Button
                    variant="contained"
                    startIcon={<Plus className="h-5 w-5" />}
                    onClick={handleAdd}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {language === 'he' ? 'צור משתנה ראשון' : 'Create First Variable'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {variables.map((variable, index) => (
                    <div key={variable.id}>
                      <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-6">
                              <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  variable.isActive 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                    : 'bg-gradient-to-r from-gray-300 to-gray-400'
                                }`}>
                                  <Settings className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                  {language === 'he' ? variable.displayName : variable.displayNameEnglish}
                                </h4>
                                <div className="flex items-center space-x-4">
                                  <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                    {variable.name}
                                  </p>
                                  <span className="text-sm text-gray-500">
                                    {variable.type}
                                  </span>
                                </div>
                                {variable.placeholder && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {language === 'he' ? 
                                      `"${variable.placeholder}"` : 
                                      `"${variable.placeholderEnglish}"`
                                    }
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                                  variable.isActive 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {variable.isActive 
                                    ? (language === 'he' ? 'פעיל' : 'Active') 
                                    : (language === 'he' ? 'לא פעיל' : 'Inactive')
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Edit className="h-4 w-4" />}
                              onClick={() => handleEdit(variable)}
                              sx={{
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                borderColor: '#d1d5db',
                                color: '#374151',
                                '&:hover': {
                                  borderColor: '#3b82f6',
                                  backgroundColor: '#eff6ff',
                                  transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {language === 'he' ? 'ערוך' : 'Edit'}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Trash2 className="h-4 w-4" />}
                              onClick={() => handleDelete(variable.id)}
                              sx={{
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                borderColor: '#fca5a5',
                                color: '#dc2626',
                                '&:hover': {
                                  borderColor: '#dc2626',
                                  backgroundColor: '#fef2f2',
                                  transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {language === 'he' ? 'מחק' : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {index < variables.length - 1 && (
                        <Divider sx={{ my: 4, mx: 0, opacity: 0.2 }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCancel} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3,
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
                {editingId ? (language === 'he' ? 'עריכת משתנה' : 'Edit Variable') : (language === 'he' ? 'הוספת משתנה חדש' : 'Add New Variable')}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ pt: 2 }}>
            {/* Helper Text */}
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              backgroundColor: '#f8fafc', 
              borderRadius: 2, 
              border: '1px solid #e2e8f0' 
            }}>
              <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
                {language === 'he' ? 
                  'מלא את הפרטים הבאים כדי ליצור משתנה חדש שיופיע בטופס יצירת ההודעות' :
                  'Fill in the details below to create a new variable that will appear in the message creation form'
                }
              </Typography>
            </Box>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Variable Name */}
              <Box>
                <TextField
                  label={language === 'he' ? 'שם המשתנה (באנגלית)' : 'Variable Name (English)'}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="gateNumber"
                  fullWidth
                  size="medium"
                  sx={{ 
                    mb: 1,
                    '& .MuiInputBase-input': {
                      direction: 'ltr',
                      textAlign: 'left'
                    }
                  }}
                  helperText={language === 'he' ? 'דוגמה: gateNumber, terminalCode, flightStatus' : 'Example: gateNumber, terminalCode, flightStatus'}
                />
              </Box>

              {/* Display Name Hebrew */}
              <Box>
                <TextField
                  label={language === 'he' ? 'שם תצוגה (עברית)' : 'Display Name (Hebrew)'}
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="מספר שער"
                  fullWidth
                  size="medium"
                  sx={{ 
                    mb: 1,
                    '& .MuiInputBase-input': {
                      direction: 'rtl',
                      textAlign: 'right'
                    }
                  }}
                  helperText={language === 'he' ? 'דוגמה: מספר שער, קוד טרמינל, סטטוס טיסה' : 'Example: Gate Number, Terminal Code, Flight Status'}
                />
              </Box>

              {/* Display Name English */}
              <Box>
                <TextField
                  label={language === 'he' ? 'שם תצוגה (אנגלית)' : 'Display Name (English)'}
                  name="displayNameEnglish"
                  value={formData.displayNameEnglish}
                  onChange={handleInputChange}
                  placeholder="Gate Number"
                  fullWidth
                  size="medium"
                  sx={{ 
                    mb: 1,
                    '& .MuiInputBase-input': {
                      direction: 'ltr',
                      textAlign: 'left'
                    }
                  }}
                  helperText={language === 'he' ? 'דוגמה: Gate Number, Terminal Code, Flight Status' : 'Example: Gate Number, Terminal Code, Flight Status'}
                />
              </Box>

              {/* Display Name French */}
              <Box>
                <TextField
                  label={language === 'he' ? 'שם תצוגה (צרפתית)' : 'Display Name (French)'}
                  name="displayNameFrench"
                  value={formData.displayNameFrench}
                  onChange={handleInputChange}
                  placeholder="Numéro de porte"
                  fullWidth
                  size="medium"
                  sx={{ 
                    mb: 1,
                    '& .MuiInputBase-input': {
                      direction: 'ltr',
                      textAlign: 'left'
                    }
                  }}
                  helperText={language === 'he' ? 'דוגמה: Numéro de porte, Code terminal, Statut du vol' : 'Example: Numéro de porte, Code terminal, Statut du vol'}
                />
              </Box>

              {/* Field Type */}
              <Box>
                <FormControl fullWidth size="medium" sx={{ mb: 1 }}>
                  <InputLabel>{language === 'he' ? 'סוג שדה' : 'Field Type'}</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label={language === 'he' ? 'סוג שדה' : 'Field Type'}
                    sx={{
                      '& .MuiSelect-select': {
                        direction: language === 'he' ? 'rtl' : 'ltr',
                        textAlign: language === 'he' ? 'right' : 'left'
                      }
                    }}
                  >
                    <MenuItem value="text">{t.flightForm.text}</MenuItem>
                    <MenuItem value="time">{t.flightForm.time}</MenuItem>
                    <MenuItem value="date">{t.flightForm.date}</MenuItem>
                    <MenuItem value="number">{t.flightForm.number}</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" sx={{ color: '#64748b', ml: 1 }}>
                  {language === 'he' ? 'בחר את סוג הנתונים שהמשתמש יכניס' : 'Choose the type of data the user will enter'}
                </Typography>
              </Box>
                
              {/* Placeholder Hebrew */}
              <Box>
                <TextField
                  label={language === 'he' ? 'טקסט עזר (עברית)' : 'Placeholder (Hebrew)'}
                  name="placeholder"
                  value={formData.placeholder}
                  onChange={handleInputChange}
                  placeholder="הזן מספר שער"
                  fullWidth
                  size="medium"
                  sx={{ 
                    mb: 1,
                    '& .MuiInputBase-input': {
                      direction: 'rtl',
                      textAlign: 'right'
                    }
                  }}
                  helperText={language === 'he' ? 'טקסט שיופיע בתוך השדה כהנחיה למשתמש' : 'Text that will appear inside the field as user guidance'}
                />
              </Box>

              {/* Placeholder English */}
              <Box>
                <TextField
                  label={language === 'he' ? 'טקסט עזר (אנגלית)' : 'Placeholder (English)'}
                  name="placeholderEnglish"
                  value={formData.placeholderEnglish}
                  onChange={handleInputChange}
                  placeholder="Enter gate number"
                  fullWidth
                  size="medium"
                  sx={{ 
                    mb: 1,
                    '& .MuiInputBase-input': {
                      direction: 'ltr',
                      textAlign: 'left'
                    }
                  }}
                  helperText={language === 'he' ? 'טקסט שיופיע בתוך השדה כהנחיה למשתמש' : 'Text that will appear inside the field as user guidance'}
                />
              </Box>

              {/* Placeholder French */}
              <Box>
                <TextField
                  label={language === 'he' ? 'טקסט עזר (צרפתית)' : 'Placeholder (French)'}
                  name="placeholderFrench"
                  value={formData.placeholderFrench}
                  onChange={handleInputChange}
                  placeholder="Entrez le numéro de porte"
                  fullWidth
                  size="medium"
                  sx={{ 
                    mb: 1,
                    '& .MuiInputBase-input': {
                      direction: 'ltr',
                      textAlign: 'left'
                    }
                  }}
                  helperText={language === 'he' ? 'טקסט שיופיע בתוך השדה כהנחיה למשתמש' : 'Text that will appear inside the field as user guidance'}
                />
              </Box>

              {/* Display Order */}
              <Box>
                <TextField
                  label={language === 'he' ? 'סדר תצוגה' : 'Display Order'}
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="1"
                  fullWidth
                  size="medium"
                  sx={{ 
                    mb: 1,
                    '& .MuiInputBase-input': {
                      direction: language === 'he' ? 'rtl' : 'ltr',
                      textAlign: language === 'he' ? 'right' : 'left'
                    }
                  }}
                  helperText={language === 'he' ? 'מספר נמוך יותר = מופיע קודם בטופס' : 'Lower number = appears earlier in the form'}
                />
              </Box>
              </div>
              
            {/* Active Switch */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: '#f1f5f9', 
              borderRadius: 2,
              border: '1px solid #e2e8f0'
            }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      name="isActive"
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {language === 'he' ? 'משתנה פעיל' : 'Active Variable'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {language === 'he' ? 
                        'משתנה פעיל יופיע בטופס יצירת ההודעות' : 
                        'Active variables will appear in the message creation form'
                      }
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<X className="h-4 w-4" />}
                    onClick={handleCancel}
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1
            }}
                  >
                    {language === 'he' ? 'ביטול' : 'Cancel'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save className="h-4 w-4" />}
                    onClick={handleSave}
                    disabled={!formData.name || !formData.displayName || !formData.displayNameEnglish}
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            {language === 'he' ? 'שמור משתנה' : 'Save Variable'}
                      </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VariableManager;
