import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { generateMessage } from '../store/slices/messagesSlice';
import { Flight, MessageTemplate } from '../types';
import { MessageSquare, Send, Eye, Copy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MessageGeneratorProps {
  flights: Flight[];
  templates: MessageTemplate[];
}

const MessageGenerator: React.FC<MessageGeneratorProps> = ({ flights, templates }) => {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [recipients, setRecipients] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const activeTemplates = templates.filter(template => template.isActive);

  useEffect(() => {
    if (selectedFlight && selectedTemplate) {
      generateMessageContent();
    }
  }, [selectedFlight, selectedTemplate]);

  const generateMessageContent = () => {
    if (!selectedFlight || !selectedTemplate) return;

    let content = selectedTemplate.content;
    
    // Replace placeholders with actual flight data
    content = content.replace(/{flightNumber}/g, selectedFlight.flightNumber);
    content = content.replace(/{departureCity}/g, selectedFlight.departureCity);
    content = content.replace(/{arrivalCity}/g, selectedFlight.arrivalCity);
    content = content.replace(/{originalDate}/g, selectedFlight.originalDate);
    content = content.replace(/{originalTime}/g, selectedFlight.originalTime);
    content = content.replace(/{newTime}/g, selectedFlight.newTime);
    
    if (selectedFlight.newDate) {
      content = content.replace(/{newDate}/g, selectedFlight.newDate);
    } else {
      content = content.replace(/\s*\{newDate\}/g, '');
    }

    setGeneratedContent(content);
  };

  const handleGenerateMessage = async () => {
    if (!selectedFlight || !selectedTemplate || !recipients.trim()) {
      alert('אנא מלא את כל השדות הנדרשים');
      return;
    }

    const recipientsList = recipients.split(',').map(email => email.trim()).filter(email => email);
    
    try {
      dispatch(generateMessage({
        flightId: selectedFlight.id,
        templateId: selectedTemplate.id,
        recipients: recipientsList,
        departureCity: selectedFlight.departureCity,
        arrivalCity: selectedFlight.arrivalCity,
      }));
      
      alert('ההודעה נוצרה בהצלחה!');
    } catch (error) {
      console.error('Error generating message:', error);
      alert('שגיאה ביצירת ההודעה');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('ההודעה הועתקה ללוח');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              יצירת הודעת דחיית טיסה
            </h3>
          </div>

          <div className="space-y-6">
            {/* Flight Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                בחר טיסה
              </label>
              <select
                value={selectedFlight?.id || ''}
                onChange={(e) => {
                  const flight = flights.find(f => f.id === e.target.value);
                  setSelectedFlight(flight || null);
                }}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">בחר טיסה</option>
                {flights.map((flight) => (
                  <option key={flight.id} value={flight.id}>
                    {flight.flightNumber} - {flight.departureCity} → {flight.arrivalCity} 
                    ({flight.originalDate} {flight.originalTime} → {flight.newTime})
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                בחר תבנית
              </label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const template = activeTemplates.find(t => t.id === e.target.value);
                  setSelectedTemplate(template || null);
                }}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">בחר תבנית</option>
                {activeTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כתובות אימייל (מופרדות בפסיקים)
              </label>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                rows={3}
                placeholder="passenger1@example.com, passenger2@example.com"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Flight Details Display */}
            {selectedFlight && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">פרטי הטיסה</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">מספר טיסה:</span> {selectedFlight.flightNumber}
                  </div>
                  <div>
                    <span className="font-medium">מסלול:</span> {selectedFlight.departureCity} → {selectedFlight.arrivalCity}
                  </div>
                  <div>
                    <span className="font-medium">{t.flightForm.originalDate}:</span> {selectedFlight.originalDate}
                  </div>
                  <div>
                    <span className="font-medium">{t.flightForm.originalTime}:</span> {selectedFlight.originalTime}
                  </div>
                  <div>
                    <span className="font-medium">{t.flightForm.newTime}:</span> {selectedFlight.newTime}
                  </div>
                  {selectedFlight.newDate && (
                    <div>
                      <span className="font-medium">{t.flightForm.newDate}:</span> {selectedFlight.newDate}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated Message Preview */}
            {generatedContent && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">תצוגה מקדימה של ההודעה</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {showPreview ? 'הסתר' : 'הצג'}
                    </button>
                    <button
                      onClick={handleCopyToClipboard}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      העתק
                    </button>
                  </div>
                </div>
                {showPreview && (
                  <div className="bg-white p-3 rounded border">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{generatedContent}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleGenerateMessage}
                disabled={!selectedFlight || !selectedTemplate || !recipients.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5 mr-2" />
                צור הודעה
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageGenerator;
