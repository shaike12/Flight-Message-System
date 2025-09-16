import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { addTemplate, updateTemplate, deleteTemplateAsync, setActiveTemplateAsync } from '../store/slices/templatesSlice';
import { MessageTemplate } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText, Edit, Trash2, Plus, Save, X, CheckCircle } from 'lucide-react';
import { 
  Chip, 
  Paper, 
  Typography, 
  Box, 
  Stack
} from '@mui/material';

interface TemplateManagerProps {
  templates: MessageTemplate[];
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ templates }) => {
  const dispatch = useAppDispatch();
  const { t, isRTL } = useLanguage();

  // Function to highlight template parameters
  const highlightParams = (text: string) => {
    return text.replace(/\{([^}]+)\}/g, '<span class="param">{$1}</span>');
  };

  // Function to prevent parameters in template name
  const handleNameChange = (value: string) => {
    // Remove any curly braces and their content
    const cleanValue = value.replace(/\{[^}]*\}/g, '');
    setNewTemplate({ ...newTemplate, name: cleanValue });
  };

  // Available template parameters
  const availableParams = [
    { key: 'flightNumber', label: t.templateManager.parameters.flightNumber, englishLabel: 'Flight Number', description: 'LY001' },
    { key: 'newFlightNumber', label: t.templateManager.parameters.newFlightNumber, englishLabel: 'New Flight Number', description: 'LY002' },
    { key: 'departureCity', label: t.templateManager.parameters.departureCity, englishLabel: 'Departure City', description: 'תל אביב' },
    { key: 'arrivalCity', label: t.templateManager.parameters.arrivalCity, englishLabel: 'Arrival City', description: 'ניו יורק' },
    { key: 'originalDate', label: t.templateManager.parameters.originalDate, englishLabel: 'Original Date', description: '15/12/2024' },
    { key: 'originalTime', label: t.templateManager.parameters.originalTime, englishLabel: 'Original Time', description: '14:30' },
    { key: 'newTime', label: t.templateManager.parameters.newTime, englishLabel: 'New Time', description: '16:45' },
    { key: 'newDate', label: t.templateManager.parameters.newDate, englishLabel: 'New Date', description: '15/12/2024' },
    { key: 'loungeOpenTime', label: t.templateManager.parameters.loungeOpenTime, englishLabel: 'Lounge Opening Time', description: '12:00' },
    { key: 'counterOpenTime', label: t.templateManager.parameters.counterOpenTime, englishLabel: 'Counter Opening Time', description: '13:00' },
  ];
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    englishContent: '',
    isActive: true,
  });

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
  };

  const handleSaveEdit = async () => {
    if (editingTemplate) {
      // Check if template name already exists (excluding current template)
      const existingTemplate = templates.find(template => 
        template.id !== editingTemplate.id && 
        template.name.toLowerCase() === editingTemplate.name.toLowerCase()
      );
      
      if (existingTemplate) {
        alert(`טמפלט עם השם "${editingTemplate.name}" כבר קיים במערכת. אנא בחר שם אחר.`);
        return;
      }
      
      try {
        dispatch(updateTemplate(editingTemplate));
        setEditingTemplate(null);
      } catch (error) {
        console.error('Error updating template:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את התבנית?')) {
      try {
        await dispatch(deleteTemplateAsync(templateId)).unwrap();
        console.log('Template deleted successfully');
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('שגיאה במחיקת התבנית. אנא נסה שוב.');
      }
    }
  };

  const handleCreateNew = async () => {
    if (newTemplate.name && newTemplate.content && newTemplate.englishContent) {
      // Check if template name already exists
      const existingTemplate = templates.find(template => 
        template.name.toLowerCase() === newTemplate.name.toLowerCase()
      );
      
      if (existingTemplate) {
        alert(`טמפלט עם השם "${newTemplate.name}" כבר קיים במערכת. אנא בחר שם אחר.`);
        return;
      }
      
      try {
        dispatch(addTemplate(newTemplate));
        setNewTemplate({ name: '', content: '', englishContent: '', isActive: true });
        setShowNewTemplate(false);
      } catch (error) {
        console.error('Error creating template:', error);
      }
    } else {
      alert('אנא מלא את כל השדות הנדרשים (שם, תוכן עברי ותוכן אנגלי)');
    }
  };

  const handleCancelNew = () => {
    setNewTemplate({ name: '', content: '', englishContent: '', isActive: true });
    setShowNewTemplate(false);
  };

  const handleSetActive = async (templateId: string) => {
    try {
      dispatch(setActiveTemplateAsync(templateId));
    } catch (error) {
      console.error('Error setting active template:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, paramKey: string) => {
    e.dataTransfer.setData('text/plain', `{${paramKey}}`);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, field: 'content' | 'englishContent') => {
    e.preventDefault();
    const param = e.dataTransfer.getData('text/plain');
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = field === 'content' ? newTemplate.content : newTemplate.englishContent;
    const newText = text.substring(0, start) + param + text.substring(end);
    
    if (field === 'content') {
      setNewTemplate(prev => ({ ...prev, content: newText }));
    } else {
      setNewTemplate(prev => ({ ...prev, englishContent: newText }));
    }
    
    // Set cursor position after the inserted parameter
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + param.length, start + param.length);
    }, 0);
  };

  const handleEditDrop = (e: React.DragEvent, field: 'content' | 'englishContent') => {
    e.preventDefault();
    const param = e.dataTransfer.getData('text/plain');
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = field === 'content' ? editingTemplate?.content || '' : editingTemplate?.englishContent || '';
    const newText = text.substring(0, start) + param + text.substring(end);
    
    if (editingTemplate) {
      setEditingTemplate(prev => prev ? { 
        ...prev, 
        [field]: newText 
      } : null);
    }
    
    // Set cursor position after the inserted parameter
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + param.length, start + param.length);
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t.templateManager.title}
              </h3>
            </div>
            <button
              onClick={() => setShowNewTemplate(true)}
              className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t.templateManager.newTemplate}
            </button>
          </div>

          {/* New Template Form */}
          {showNewTemplate && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="text-md font-medium text-gray-900 mb-4">תבנית חדשה</h4>
              
              {/* Parameter Palette */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                  border: '1px solid #90caf9'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      bgcolor: 'primary.main', 
                      borderRadius: '50%', 
                      mr: 1.5 
                    }} 
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {t.templateManager.availableParameters}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                  {t.templateManager.dragParameters}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                  {availableParams.map((param) => (
                    <Chip
                      key={param.key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, param.key)}
                      label={
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: 'white' }}>
                            {param.label}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem', color: '#fff3cd' }}>
                            {param.englishLabel}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: 'white',
                        cursor: 'grab',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                        },
                        '&:active': {
                          cursor: 'grabbing',
                          transform: 'translateY(0)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        minHeight: 48,
                        '& .MuiChip-label': {
                          padding: '8px 12px',
                        }
                      }}
                      title={`${param.label} - ${param.description}`}
                    />
                  ))}
                </Stack>
              </Paper>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.templateManager.templateName}
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="שם התבנית"
                  />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      תוכן התבנית - עברית
                    </label>
                    <textarea
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'content')}
                      rows={10}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-vertical"
                      placeholder="השתמש במשתנים: {flightNumber}, {departureCity}, {arrivalCity}, {originalDate}, {originalTime}, {newTime}, {newDate}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      תוכן התבנית - אנגלית
                    </label>
                    <textarea
                      value={newTemplate.englishContent}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, englishContent: e.target.value }))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'englishContent')}
                      rows={10}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-vertical"
                      style={{ direction: 'ltr', textAlign: 'left' }}
                      placeholder="Use variables: {flightNumber}, {departureCity}, {arrivalCity}, {originalDate}, {originalTime}, {newTime}, {newDate}"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newTemplate.isActive}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 flex items-center">
                      <CheckCircle className={`h-4 w-4 mr-1 ${newTemplate.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                      {t.templateManager.activeTemplate}
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <button
                    onClick={handleCancelNew}
                    className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t.templateManager.cancel}
                  </button>
                    <button
                      onClick={handleCreateNew}
                      disabled={!newTemplate.name || !newTemplate.content || !newTemplate.englishContent}
                      className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {t.templateManager.save}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates List */}
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                {editingTemplate?.id === template.id ? (
                  <div className="space-y-4">
                    {/* Parameter Palette for Editing */}
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        mb: 3, 
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                        border: '1px solid #90caf9'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            bgcolor: 'primary.main', 
                            borderRadius: '50%', 
                            mr: 1.5 
                          }} 
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          פרמטרים זמינים
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                        גרור ושחרר כל פרמטר לתבנית:
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                        {availableParams.map((param) => (
                          <Chip
                            key={param.key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, param.key)}
                            label={
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: 'white' }}>
                                  {param.label}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem', color: '#fff3cd' }}>
                                  {param.englishLabel}
                                </Typography>
                              </Box>
                            }
                            sx={{
                              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                              color: 'white',
                              cursor: 'grab',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                              },
                              '&:active': {
                                cursor: 'grabbing',
                                transform: 'translateY(0)',
                              },
                              transition: 'all 0.2s ease-in-out',
                              minHeight: 48,
                              '& .MuiChip-label': {
                                padding: '8px 12px',
                              }
                            }}
                            title={`${param.label} - ${param.description}`}
                          />
                        ))}
                      </Stack>
                    </Paper>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        שם התבנית
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          תוכן התבנית - עברית
                        </label>
                        <textarea
                          value={editingTemplate.content}
                          onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleEditDrop(e, 'content')}
                          rows={10}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-vertical"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          תוכן התבנית - אנגלית
                        </label>
                        <textarea
                          value={editingTemplate.englishContent || ''}
                          onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, englishContent: e.target.value } : null)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleEditDrop(e, 'englishContent')}
                          rows={10}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-vertical"
                          style={{ direction: 'ltr', textAlign: 'left' }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`isActive-${template.id}`}
                          checked={editingTemplate.isActive}
                          onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`isActive-${template.id}`} className="ml-2 block text-sm text-gray-900 flex items-center">
                          <CheckCircle className={`h-4 w-4 mr-1 ${editingTemplate.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                          תבנית פעילה
                        </label>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <X className="h-4 w-4 mr-2" />
                        ביטול
                      </button>
                        <button
                          onClick={handleSaveEdit}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          שמור
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-md font-medium text-gray-900">{template.name}</h4>
                      <div className="flex items-center space-x-2">
                        {!template.isActive && (
                          <button
                            onClick={() => handleSetActive(template.id)}
                            className="text-green-600 hover:text-green-900"
                            title="הגדר כתבנית פעילה"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-blue-600 hover:text-blue-900"
                          title="ערוך תבנית"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-900"
                          title="מחק תבנית"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        template.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <CheckCircle className={`h-3 w-3 mr-1 ${template.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                        {template.isActive ? 'פעילה' : 'לא פעילה'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">תוכן עברי:</h5>
                        <div className="bg-gray-50 p-4 rounded-md min-h-[200px]">
                          <pre 
                            className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed template-content"
                            dangerouslySetInnerHTML={{ __html: highlightParams(template.content) }}
                          />
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">תוכן אנגלי:</h5>
                        <div className="bg-gray-50 p-4 rounded-md min-h-[200px]">
                          <pre 
                            className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed template-content"
                            style={{ direction: 'ltr', textAlign: 'left' }}
                            dangerouslySetInnerHTML={{ __html: highlightParams(template.englishContent || 'לא הוגדר תוכן באנגלית') }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      נוצר: {new Date(template.createdAt).toLocaleDateString('he-IL')} • 
                      עודכן: {new Date(template.updatedAt).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-6">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">אין תבניות</h3>
              <p className="mt-1 text-sm text-gray-500">
                התחל ביצירת תבנית חדשה.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
