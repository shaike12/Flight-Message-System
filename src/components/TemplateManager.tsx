import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  fetchTemplates, 
  addTemplate, 
  updateTemplate, 
  deleteTemplateAsync,
  setActiveTemplateAsync 
} from '../store/slices';
import { fetchCustomVariablesAsync } from '../store/slices/customVariablesSlice';
import { MessageTemplate } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Edit2, Trash2, Power, PowerOff, Eye, EyeOff } from 'lucide-react';
import { Button, TextField, Checkbox, FormControlLabel, Box, Typography, Paper, Chip, IconButton, Tooltip, Modal, Fade, Backdrop, Container, Stack, Divider, InputLabel, OutlinedInput, FormControl } from '@mui/material';

const TemplateManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t, language } = useLanguage();
  const { templates, loading, customVariables } = useAppSelector((state) => ({
    templates: state.templates.templates,
    loading: state.templates.loading,
    customVariables: state.customVariables.variables,
  }));

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    englishContent: '',
    isActive: true,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverField, setDragOverField] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeField, setActiveField] = useState<'content' | 'englishContent' | null>(null);

  // Load custom variables when component mounts
  useEffect(() => {
    dispatch(fetchCustomVariablesAsync());
  }, [dispatch]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [originalFormData, setOriginalFormData] = useState<{
    name: string;
    content: string;
    englishContent: string;
    isActive: boolean;
  } | null>(null);

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.englishContent && template.englishContent.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check if form is valid
  const isFormValid = formData.name.trim() !== '' && formData.content.trim() !== '';

  // Check if form has changes
  const hasChanges = originalFormData ? (
    formData.name !== originalFormData.name ||
    formData.content !== originalFormData.content ||
    formData.englishContent !== originalFormData.englishContent ||
    formData.isActive !== originalFormData.isActive
  ) : false;

  // Available parameters for drag and drop - dynamic from database
  const availableParameters = useMemo(() => 
    customVariables
      .filter(variable => variable.isActive)
      .map(variable => ({
        key: variable.name,
        label: language === 'he' ? variable.displayName : variable.displayNameEnglish
      })), [customVariables, language]
  );

  const handleDragStart = (e: React.DragEvent, parameter: string) => {
    e.dataTransfer.setData('text/plain', `{${parameter}}`);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent, field?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (field) {
      setDragOverField(field);
    }
  };

  const handleDragLeave = () => {
    setDragOverField(null);
  };

  const handleDrop = (e: React.DragEvent, field: 'content' | 'englishContent') => {
    e.preventDefault();
    const parameter = e.dataTransfer.getData('text/plain');
    insertParameter(parameter, field);
    setDragOverField(null);
  };

  const insertParameter = (parameter: string, field: 'content' | 'englishContent') => {
    const currentValue = formData[field];
    const newValue = currentValue + `{${parameter}}`;
    setFormData({ ...formData, [field]: newValue });
  };

  const handleParameterClick = (parameter: string) => {
    // Insert parameter into the active field, or content field by default
    const targetField = activeField || 'content';
    insertParameter(parameter, targetField);
  };

  React.useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'שם התבנית נדרש';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'תוכן התבנית בעברית נדרש';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
    if (editingTemplate) {
      await dispatch(updateTemplate({
        id: editingTemplate.id,
        template: {
          ...formData,
          updatedAt: new Date().toISOString(),
        },
      }));
    } else {
      await dispatch(addTemplate({
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    setFormData({ name: '', content: '', englishContent: '', isActive: true });
    setEditingTemplate(null);
    setEditingTemplateId(null);
    setOriginalFormData(null);
    setShowForm(false);
    setValidationErrors({});
    } catch (error) {
      console.error('Error saving template:', error);
      alert('שגיאה בשמירת התבנית. אנא נסה שוב.');
    }
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    const templateData = {
      name: template.name,
      content: template.content,
      englishContent: template.englishContent || '',
      isActive: template.isActive,
    };
    setFormData(templateData);
    setOriginalFormData(templateData); // Store original data for comparison
    setEditingTemplateId(template.id);
    setShowForm(true); // Show the modal form
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.templateManager.deleteConfirm)) {
      await dispatch(deleteTemplateAsync(id));
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await dispatch(setActiveTemplateAsync({ id, isActive: !isActive }));
  };

  return (
    <div className="rounded-lg shadow-md" style={{ 
      maxHeight: '70vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--mui-palette-background-paper)'
    }}>
      {/* Header - Fixed */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--mui-palette-divider)' }}>
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--mui-palette-text-primary)' }}>{t.templateManager.title}</h2>
          <Button
            variant="contained"
            color="primary"
          onClick={() => setShowForm(true)}
            sx={{ backgroundColor: 'green' }}
        >
            {t.templateManager.newTemplate}
          </Button>
      </div>

        {/* Search Templates - Fixed */}
        <div className="mb-4">
          <div className="relative">
              <input
                type="text"
              placeholder={t.templateManager.searchTemplates}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
              style={{ 
                color: 'var(--mui-palette-text-primary)',
                backgroundColor: 'var(--mui-palette-background-paper)',
                borderColor: 'var(--mui-palette-divider)'
              }}
              />
            </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6" style={{ flex: 1, overflow: 'auto', position: 'relative' }}>



      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4" style={{ color: 'var(--mui-palette-text-primary)' }}>{t.common.loading}</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--mui-palette-text-secondary)' }}>
            {searchTerm ? t.templateManager.noTemplatesFound : t.templateManager.noTemplatesAvailable}
          </div>
        ) : (
          filteredTemplates.map((template, index) => (
            <div key={template.id}>
              {index > 0 && (
                <Divider sx={{ 
                  my: 3, 
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  '&::before, &::after': {
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                  }
                }} />
              )}
              <div
                className="w-full p-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                style={{ 
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--mui-palette-divider)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--mui-palette-background-paper)'
                }}
              >
              {/* Header with title and action buttons */}
              <div className="flex items-center justify-between mb-4 w-full">
                <h4 className="font-medium text-lg" style={{ color: 'var(--mui-palette-text-primary)' }}>{template.name}</h4>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  alignItems: 'center'
                }}>
                  {/* Toggle Active Button */}
                  <Tooltip title={template.isActive ? 'השבת תבנית' : 'הפעל תבנית'} arrow>
                    <IconButton
                      onClick={() => handleToggleActive(template.id, template.isActive)}
                      sx={{
                        backgroundColor: template.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: template.isActive ? '#10b981' : '#f59e0b',
                        border: `2px solid ${template.isActive ? '#10b981' : '#f59e0b'}`,
                        borderRadius: 2,
                        width: 40,
                        height: 40,
                        '&:hover': {
                          backgroundColor: template.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          transform: 'scale(1.05)',
                          boxShadow: `0 4px 12px ${template.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {template.isActive ? <Power size={18} /> : <PowerOff size={18} />}
                    </IconButton>
                  </Tooltip>

                  {/* Edit Button */}
                  <Tooltip title="ערוך תבנית" arrow>
                    <IconButton
                      onClick={() => handleEdit(template)}
                      sx={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        border: '2px solid #3b82f6',
                        borderRadius: 2,
                        width: 40,
                        height: 40,
                        '&:hover': {
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <Edit2 size={18} />
                    </IconButton>
                  </Tooltip>

                  {/* Delete Button */}
                  <Tooltip title="מחק תבנית" arrow>
                    <IconButton
                      onClick={() => handleDelete(template.id)}
                      sx={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '2px solid #ef4444',
                        borderRadius: 2,
                        width: 40,
                        height: 40,
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </div>
              
              {/* Template content */}
              <div className="flex-1 w-full">
                <div className="text-sm mb-3 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--mui-palette-text-primary)' }}>
                    {template.content}
                </div>
                  {template.englishContent && (
                  <div className="text-sm mb-3 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--mui-palette-text-secondary)' }}>
                      {template.englishContent}
                  </div>
                )}
              </div>
              
              {/* Footer with status, date and creator */}
              <div className="w-full mt-6 pt-3" style={{ borderTop: '1px solid var(--mui-palette-divider)' }}>
                <div className="flex justify-between items-center">
                    <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: template.isActive 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(107, 114, 128, 0.1)',
                      color: template.isActive 
                        ? '#10b981' 
                        : 'var(--mui-palette-text-secondary)'
                    }}
                    >
                    {template.isActive ? t.templateManager.active : t.templateManager.inactive}
                    </span>
                  <div className="text-right">
                    <div className="text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
                      {t.templateManager.created}: {new Date(template.createdAt).toLocaleDateString('he-IL')}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
                      {t.templateManager.createdBy}: {template.createdBy || t.templateManager.unknownUser}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Edit Form for this specific template */}
              </div>
            </div>
          ))
        )}
      </div>
      </div>

      {/* Template Creation/Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTemplate(null);
          setFormData({ name: '', content: '', englishContent: '', isActive: true });
          setValidationErrors({});
        }}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          }
        }}
      >
        <Fade in={showForm}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
              maxWidth: '1000px',
              maxHeight: '90vh',
              overflow: 'auto',
              bgcolor: 'background.paper',
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '3px solid #667eea',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3,
                borderRadius: '16px 16px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {editingTemplate ? '✏️' : '✨'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {editingTemplate ? t.templateManager.edit : t.templateManager.newTemplate}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {editingTemplate ? 'עריכת תבנית קיימת' : 'יצירת תבנית חדשה'}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => {
                  setShowForm(false);
                  setEditingTemplate(null);
                  setFormData({ name: '', content: '', englishContent: '', isActive: true });
                  setValidationErrors({});
                }}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                ✕
              </IconButton>
            </Box>

            {/* Modal Content */}
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Available Parameters Section - Fixed */}
              <Paper
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                  border: '2px solid #0ea5e9',
                  borderRadius: 3,
                  p: 3,
                  m: 4,
                  mb: 2,
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      🎯
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0c4a6e' }}>
                      {t.templateManager.availableParameters}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 500 }}>
                      {t.templateManager.dragParameters}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1.5,
                  maxWidth: '100%',
                  p: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 2,
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                }}>
                  {availableParameters.map((param) => (
                    <Chip
                      key={param.key}
                      label={param.label}
                      draggable
                      onDragStart={(e) => handleDragStart(e, param.key)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleParameterClick(param.key)}
                      sx={{
                        background: isDragging ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                        color: isDragging ? 'white' : '#0c4a6e',
                        border: '2px solid',
                        borderColor: isDragging ? '#0284c7' : '#0ea5e9',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        height: 36,
                        transform: isDragging ? 'scale(1.1) translateY(-4px)' : 'none',
                        boxShadow: isDragging ? '0 8px 25px rgba(14, 165, 233, 0.4)' : '0 2px 8px rgba(14, 165, 233, 0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%)',
                          borderColor: '#0284c7',
                          boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
                          transform: 'scale(1.05) translateY(-2px)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      title="לחץ או גרור כדי להוסיף לתבנית"
                    />
                  ))}
                </Box>
              </Paper>

              {/* Form - Scrollable */}
              <Box sx={{ flex: 1, overflow: 'auto', px: 4, pb: 4 }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                  {/* Template Name */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid #e5e7eb',
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t.templateManager.templateName}
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (validationErrors.name) {
                          setValidationErrors({ ...validationErrors, name: '' });
                        }
                      }}
                      onFocus={() => setActiveField(null)}
                      error={!!validationErrors.name}
                      helperText={validationErrors.name}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#374151',
                          fontWeight: 600,
                        },
                        '& .MuiInputBase-input': {
                          textAlign: 'right',
                          direction: 'rtl',
                        },
                      }}
                    />
                  </Paper>

                  {/* Hebrew Content */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid #e5e7eb',
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151', mr: 2 }}>
                        🇮🇱
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151' }}>
                        {t.templateManager.hebrewContentLabel}
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={formData.content}
                      onChange={(e) => {
                        setFormData({ ...formData, content: e.target.value });
                        if (validationErrors.content) {
                          setValidationErrors({ ...validationErrors, content: '' });
                        }
                      }}
                      onFocus={() => setActiveField('content')}
                      onDragOver={(e) => handleDragOver(e, 'content')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'content')}
                      error={!!validationErrors.content}
                      helperText={validationErrors.content || "לחץ על פרמטרים או גרור אותם לכאן..."}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: dragOverField === 'content' ? '#eff6ff' : 'white',
                          border: dragOverField === 'content' ? '2px dashed #3b82f6' : 'none',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputBase-input': {
                          fontFamily: 'Arial, sans-serif',
                          fontSize: '14px',
                          lineHeight: 1.6,
                        },
                      }}
                    />
                  </Paper>

                  {/* English Content */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid #e5e7eb',
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151', mr: 2 }}>
                        🇺🇸
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151' }}>
                        {t.templateManager.englishContentLabel}
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={formData.englishContent}
                      onChange={(e) => setFormData({ ...formData, englishContent: e.target.value })}
                      onFocus={() => setActiveField('englishContent')}
                      onDragOver={(e) => handleDragOver(e, 'englishContent')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'englishContent')}
                      helperText="Click on parameters or drag them here..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: dragOverField === 'englishContent' ? '#eff6ff' : 'white',
                          border: dragOverField === 'englishContent' ? '2px dashed #3b82f6' : 'none',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputBase-input': {
                          fontFamily: 'Arial, sans-serif',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          direction: 'ltr',
                          textAlign: 'left',
                        },
                      }}
                    />
                  </Paper>

                  {/* Active Template & Buttons */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid #e5e7eb',
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            sx={{
                              color: '#3b82f6',
                              '&.Mui-checked': {
                                color: '#3b82f6',
                              },
                              '& .MuiSvgIcon-root': {
                                fontSize: 28,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ 
                            color: '#374151', 
                            fontWeight: 600,
                            fontSize: '16px'
                          }}>
                            {t.templateManager.activeTemplate}
                          </Typography>
                        }
                      />
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={!isFormValid}
                          sx={{ 
                            background: isFormValid ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#9ca3af',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '16px',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            boxShadow: isFormValid ? '0 8px 25px rgba(59, 130, 246, 0.4)' : 'none',
                            '&:hover': {
                              background: isFormValid ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' : '#9ca3af',
                              boxShadow: isFormValid ? '0 12px 35px rgba(59, 130, 246, 0.5)' : 'none',
                              transform: isFormValid ? 'translateY(-3px)' : 'none',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {editingTemplate ? t.common.save : t.templateManager.save}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="contained"
                          onClick={() => {
                            setShowForm(false);
                            setEditingTemplate(null);
                            setFormData({ name: '', content: '', englishContent: '', isActive: true });
                            setValidationErrors({});
                          }}
                          sx={{ 
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '16px',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                              boxShadow: '0 12px 35px rgba(239, 68, 68, 0.5)',
                              transform: 'translateY(-3px)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {t.templateManager.cancel}
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                  </Stack>
                </form>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default TemplateManager;