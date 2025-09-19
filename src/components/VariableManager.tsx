import React, { useState, useEffect, useMemo } from 'react';
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
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Alert } from '@mui/material';

const VariableManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { language } = useLanguage();
  const { user, userData } = useAuth();
  const { variables, loading, error } = useAppSelector(useMemo(() => (state) => state.customVariables, []));

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    displayNameEnglish: '',
    type: 'text' as 'text' | 'time' | 'date' | 'number',
    placeholder: '',
    placeholderEnglish: '',
    isActive: true,
  });

  // Check if user is admin
  const isAdmin = userData?.role === 'admin';
  
  // Debug logging
  console.log('VariableManager Debug:', {
    user: !!user,
    userData: userData,
    isAdmin: isAdmin,
    role: userData?.role
  });
  

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
    setIsAdding(true);
    setFormData({
      name: '',
      displayName: '',
      displayNameEnglish: '',
      type: 'text',
      placeholder: '',
      placeholderEnglish: '',
      isActive: true,
    });
  };

  const handleEdit = (variable: CustomVariable) => {
    setEditingId(variable.id);
    setFormData({
      name: variable.name,
      displayName: variable.displayName,
      displayNameEnglish: variable.displayNameEnglish,
      type: variable.type,
      placeholder: variable.placeholder,
      placeholderEnglish: variable.placeholderEnglish,
      isActive: variable.isActive,
    });
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
        setIsAdding(false);
      }
      setFormData({
        name: '',
        displayName: '',
        displayNameEnglish: '',
        type: 'text',
        placeholder: '',
        placeholderEnglish: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Error saving variable:', error);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      displayName: '',
      displayNameEnglish: '',
      type: 'text',
      placeholder: '',
      placeholderEnglish: '',
      isActive: true,
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-blue-600 ml-3" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {language === 'he' ? 'ניהול משתנים' : 'Variable Management'}
              </h3>
            </div>
            <Button
              variant="contained"
              startIcon={<Plus className="h-4 w-4" />}
              onClick={handleAdd}
              disabled={isAdding || editingId !== null}
            >
              {language === 'he' ? 'הוסף משתנה' : 'Add Variable'}
            </Button>
          </div>

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

          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {editingId ? (language === 'he' ? 'עריכת משתנה' : 'Edit Variable') : (language === 'he' ? 'הוספת משתנה חדש' : 'Add New Variable')}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label={language === 'he' ? 'שם המשתנה (באנגלית)' : 'Variable Name (English)'}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., gateNumber"
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label={language === 'he' ? 'שם תצוגה (עברית)' : 'Display Name (Hebrew)'}
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder={language === 'he' ? 'מספר שער' : 'Gate Number'}
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label={language === 'he' ? 'שם תצוגה (אנגלית)' : 'Display Name (English)'}
                  name="displayNameEnglish"
                  value={formData.displayNameEnglish}
                  onChange={handleInputChange}
                  placeholder="Gate Number"
                  fullWidth
                  size="small"
                />
                
                <FormControl fullWidth size="small">
                  <InputLabel>{language === 'he' ? 'סוג שדה' : 'Field Type'}</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label={language === 'he' ? 'סוג שדה' : 'Field Type'}
                  >
                    <MenuItem value="text">{language === 'he' ? 'טקסט' : 'Text'}</MenuItem>
                    <MenuItem value="time">{language === 'he' ? 'שעה' : 'Time'}</MenuItem>
                    <MenuItem value="date">{language === 'he' ? 'תאריך' : 'Date'}</MenuItem>
                    <MenuItem value="number">{language === 'he' ? 'מספר' : 'Number'}</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label={language === 'he' ? 'טקסט עזר (עברית)' : 'Placeholder (Hebrew)'}
                  name="placeholder"
                  value={formData.placeholder}
                  onChange={handleInputChange}
                  placeholder={language === 'he' ? 'הזן מספר שער' : 'Enter gate number'}
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label={language === 'he' ? 'טקסט עזר (אנגלית)' : 'Placeholder (English)'}
                  name="placeholderEnglish"
                  value={formData.placeholderEnglish}
                  onChange={handleInputChange}
                  placeholder="Enter gate number"
                  fullWidth
                  size="small"
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      name="isActive"
                    />
                  }
                  label={language === 'he' ? 'משתנה פעיל' : 'Active Variable'}
                />
                
                <div className="flex space-x-2">
                  <Button
                    variant="outlined"
                    startIcon={<X className="h-4 w-4" />}
                    onClick={handleCancel}
                  >
                    {language === 'he' ? 'ביטול' : 'Cancel'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save className="h-4 w-4" />}
                    onClick={handleSave}
                    disabled={!formData.name || !formData.displayName || !formData.displayNameEnglish}
                  >
                    {language === 'he' ? 'שמור' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Variables List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
              </div>
            ) : variables.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{language === 'he' ? 'אין משתנים זמינים' : 'No variables available'}</p>
              </div>
            ) : (
              variables.map((variable) => (
                <div key={variable.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {language === 'he' ? variable.displayName : variable.displayNameEnglish}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {variable.name} ({variable.type})
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            variable.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {variable.isActive 
                              ? (language === 'he' ? 'פעיל' : 'Active') 
                              : (language === 'he' ? 'לא פעיל' : 'Inactive')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit className="h-3 w-3" />}
                        onClick={() => handleEdit(variable)}
                        disabled={isAdding || editingId !== null}
                      >
                        {language === 'he' ? 'ערוך' : 'Edit'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Trash2 className="h-3 w-3" />}
                        onClick={() => handleDelete(variable.id)}
                        disabled={isAdding || editingId !== null}
                      >
                        {language === 'he' ? 'מחק' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariableManager;
