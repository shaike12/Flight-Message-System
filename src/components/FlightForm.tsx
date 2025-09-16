import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch } from '../store/hooks';
import { addFlight } from '../store/slices/flightsSlice';
import { addMessageToHistory } from '../store/slices/messageHistorySlice';
import { City, FlightRoute, MessageTemplate } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Plane, Calendar, Clock, MapPin, MessageSquare, Copy, Trash2, AlertTriangle } from 'lucide-react';

interface FlightFormProps {
  cities: City[];
  flightRoutes: FlightRoute[];
  templates: MessageTemplate[];
}

const FlightForm: React.FC<FlightFormProps> = ({ cities, flightRoutes, templates }) => {
  const dispatch = useAppDispatch();
  const { t, isRTL } = useLanguage();
  // Get current time and date
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format

  const [formData, setFormData] = useState({
    flightNumber: '',
    newFlightNumber: '',
    originalTime: currentTime,
    newTime: currentTime,
    originalDate: currentDate,
    newDate: currentDate,
    departureCity: '',
    arrivalCity: '',
    loungeOpenTime: '',
    counterOpenTime: '',
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [generatedEnglishText, setGeneratedEnglishText] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [copyButtonRef, setCopyButtonRef] = useState<HTMLButtonElement | null>(null);


  // Function to check which parameters are used in the selected template
  const getTemplateParameters = (templateContent: string): Set<string> => {
    const parameterRegex = /\{([^}]+)\}/g;
    const parameters = new Set<string>();
    let match;
    
    while ((match = parameterRegex.exec(templateContent)) !== null) {
      parameters.add(match[1]);
    }
    
    return parameters;
  };

  // Get parameters used in the selected template
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const templateParameters = selectedTemplateData ? getTemplateParameters(selectedTemplateData.content) : new Set<string>();

  // Function to highlight template variables
  const highlightTemplateVariables = (text: string): string => {
    return text.replace(/\{([^}]+)\}/g, '<strong class="text-blue-600 font-bold">{$1}</strong>');
  };

  // Function to handle copy with toast
  const handleCopy = async (text: string, buttonRef: HTMLButtonElement | null) => {
    try {
      // Remove HTML tags from text before copying
      const cleanText = text.replace(/<[^>]*>/g, '');
      await navigator.clipboard.writeText(cleanText);
      setCopyButtonRef(buttonRef);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text.replace(/<[^>]*>/g, '');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyButtonRef(buttonRef);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    }
  };

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('flightFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Auto-save form data to localStorage with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        setAutoSaveStatus('saving');
        localStorage.setItem('flightFormData', JSON.stringify(formData));
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(null), 2000);
      } catch (error) {
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus(null), 3000);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Helper function to format time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Validation function
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.flightNumber.trim()) {
      newErrors.flightNumber = 'מספר טיסה הוא שדה חובה';
    } else if (!/^\d{1,4}$/.test(formData.flightNumber)) {
      newErrors.flightNumber = 'מספר טיסה חייב להכיל 1-4 ספרות בלבד';
    }

    if (!formData.departureCity) {
      newErrors.departureCity = t.flightForm.departureCity + ' ' + t.common.required;
    }

    if (!formData.arrivalCity) {
      newErrors.arrivalCity = t.flightForm.arrivalCity + ' ' + t.common.required;
    }

    if (!formData.originalTime) {
      newErrors.originalTime = 'שעה מקורית היא שדה חובה';
    }

    if (!formData.newTime) {
      newErrors.newTime = t.flightForm.newTime + ' ' + t.common.required;
    }

    if (formData.departureCity === formData.arrivalCity && formData.departureCity) {
      newErrors.arrivalCity = t.flightForm.arrivalCity + ' must be different from ' + t.flightForm.departureCity;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateMessageText = () => {
    if (!formData.flightNumber || !formData.departureCity || !formData.arrivalCity || 
        !formData.originalDate || !formData.originalTime || !formData.newTime) {
      return '';
    }

    // Check if flight number exists in flight routes
    const flightExists = flightRoutes.some(route => route.flightNumber === formData.flightNumber);
    if (!flightExists) {
      return '';
    }

    const departureCityName = cities.find(c => c.code === formData.departureCity)?.name || formData.departureCity;
    const arrivalCityName = cities.find(c => c.code === formData.arrivalCity)?.name || formData.arrivalCity;
    
    // Format date as DD.MM for Hebrew
    const originalDateObj = new Date(formData.originalDate);
    const originalDateFormatted = `${originalDateObj.getDate().toString().padStart(2, '0')}.${(originalDateObj.getMonth() + 1).toString().padStart(2, '0')}`;
    const newDateFormatted = formData.newDate ? 
      `${new Date(formData.newDate).getDate().toString().padStart(2, '0')}.${(new Date(formData.newDate).getMonth() + 1).toString().padStart(2, '0')}` : 
      originalDateFormatted;

    // Format flight number with LY prefix
    const formattedFlightNumber = formData.flightNumber.startsWith('LY') 
      ? formData.flightNumber 
      : `LY${formData.flightNumber.padStart(3, '0')}`;
    
    // Format new flight number with LY prefix if provided
    const formattedNewFlightNumber = formData.newFlightNumber 
      ? (formData.newFlightNumber.startsWith('LY') 
          ? formData.newFlightNumber 
          : `LY${formData.newFlightNumber.padStart(3, '0')}`)
      : '';

    // Get selected template or use default
    const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
    const templateContent = selectedTemplateObj?.content || `לקוח/ה יקר/ה,
עקב סיבות תיפעוליות, טיסתך {flightNumber} מ{departureCity} ל{arrivalCity} ב{originalDate} שתוכננה להמריא בשעה {originalTime} תמריא בשעה {newTime}${'{newDate}' ? ' בתאריך {newDate}' : ''}.
אנו מתנצלים על אי הנוחות ומאחלים טיסה נעימה,
אל על`;

    return templateContent
      .replace('{flightNumber}', formattedFlightNumber)
      .replace('{newFlightNumber}', formattedNewFlightNumber)
      .replace('{departureCity}', departureCityName)
      .replace('{arrivalCity}', arrivalCityName)
      .replace('{originalDate}', originalDateFormatted)
      .replace('{originalTime}', formData.originalTime)
      .replace('{newTime}', formData.newTime)
      .replace('{newDate}', newDateFormatted)
      .replace('{loungeOpenTime}', formData.loungeOpenTime || '')
      .replace('{counterOpenTime}', formData.counterOpenTime || '');
  };

  const generateEnglishMessageText = () => {
    if (!formData.flightNumber || !formData.departureCity || !formData.arrivalCity || 
        !formData.originalDate || !formData.originalTime || !formData.newTime) {
      return '';
    }

    // Check if flight number exists in flight routes
    const flightExists = flightRoutes.some(route => route.flightNumber === formData.flightNumber);
    if (!flightExists) {
      return '';
    }

    // For English message, use English city names from flight routes
    const flightRoute = flightRoutes.find(route => route.flightNumber === formData.flightNumber);
    const departureCityName = flightRoute?.departureCityEnglish || cities.find(c => c.code === formData.departureCity)?.englishName || formData.departureCity;
    const arrivalCityName = flightRoute?.arrivalCityEnglish || cities.find(c => c.code === formData.arrivalCity)?.englishName || formData.arrivalCity;
    
    // Format date as Month DD for English
    const originalDateObj = new Date(formData.originalDate);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const originalDateFormatted = `${monthNames[originalDateObj.getMonth()]} ${originalDateObj.getDate()}`;
    const newDateFormatted = formData.newDate ? 
      `${monthNames[new Date(formData.newDate).getMonth()]} ${new Date(formData.newDate).getDate()}` : 
      originalDateFormatted;

    // Format flight number with LY prefix
    const formattedFlightNumber = formData.flightNumber.startsWith('LY') 
      ? formData.flightNumber 
      : `LY${formData.flightNumber.padStart(3, '0')}`;
    
    // Format new flight number with LY prefix if provided
    const formattedNewFlightNumber = formData.newFlightNumber 
      ? (formData.newFlightNumber.startsWith('LY') 
          ? formData.newFlightNumber 
          : `LY${formData.newFlightNumber.padStart(3, '0')}`)
      : '';

    // Get selected template or use default
    const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
    const templateContent = selectedTemplateObj?.englishContent || `Dear Customer,
Due to operational reasons, Flight {flightNumber} from {departureCity} to {arrivalCity}, originally scheduled to depart on {originalDate} at {originalTime}, will now depart at {newTime}${'{newDate}' ? ' on {newDate}' : ''}.
We sincerely apologize for the inconvenience and wish you a pleasant flight.
EL AL Israel Airlines`;

    return templateContent
      .replace('{flightNumber}', formattedFlightNumber)
      .replace('{newFlightNumber}', formattedNewFlightNumber)
      .replace('{departureCity}', departureCityName)
      .replace('{arrivalCity}', arrivalCityName)
      .replace('{originalDate}', originalDateFormatted)
      .replace('{originalTime}', formatTimeTo12Hour(formData.originalTime))
      .replace('{newTime}', formatTimeTo12Hour(formData.newTime))
      .replace('{newDate}', newDateFormatted)
      .replace('{loungeOpenTime}', formData.loungeOpenTime || '')
      .replace('{counterOpenTime}', formData.counterOpenTime || '');
  };

  // Update generated text whenever form data changes
  useEffect(() => {
    const text = generateMessageText();
    const englishText = generateEnglishMessageText();
    setGeneratedText(text);
    setGeneratedEnglishText(englishText);
  }, [formData, cities, selectedTemplate, templates]);

  // Debug: Log templates when they change
  useEffect(() => {
    console.log('Templates loaded:', templates.length, templates);
  }, [templates]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isSubmitting) {
          handleSubmit(e as any);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleClearFields();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Limit flight number to 4 digits maximum
    if (name === 'flightNumber' && value.length > 4) {
      return;
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Auto-fill cities when flight number is entered
      if (name === 'flightNumber' && value) {
        const route = flightRoutes.find(route => route.flightNumber === value);
        if (route) {
          newData.departureCity = route.departureCity;
          newData.arrivalCity = route.arrivalCity;
        }
      }
      
      return newData;
    });
  };

  const handleClearFields = () => {
    if (window.confirm('האם אתה בטוח שברצונך לנקות את השדות?')) {
      setFormData({
        flightNumber: '',
        newFlightNumber: '',
        originalTime: currentTime,
        newTime: currentTime,
        originalDate: currentDate,
        newDate: currentDate,
        departureCity: '',
        arrivalCity: '',
        loungeOpenTime: '',
        counterOpenTime: '',
      });
      setGeneratedText('');
      setGeneratedEnglishText('');
      setSelectedTemplate('');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      const messageText = generateMessageText();
      const englishMessageText = generateEnglishMessageText();
      setGeneratedText(messageText);
      setGeneratedEnglishText(englishMessageText);
      
      dispatch(addFlight({
        ...formData,
        airline: 'ELAL',
        status: 'delayed',
      }));

      // Add to message history
      const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
      dispatch(addMessageToHistory({
        flightNumber: formData.flightNumber,
        departureCity: formData.departureCity,
        arrivalCity: formData.arrivalCity,
        originalDate: formData.originalDate,
        originalTime: formData.originalTime,
        newTime: formData.newTime,
        newDate: formData.newDate,
        hebrewMessage: messageText,
        englishMessage: englishMessageText,
        templateId: selectedTemplate,
        templateName: selectedTemplateObj?.name,
      }));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding flight:', error);
      setErrors({ submit: 'שגיאה בשמירת הטיסה. אנא נסה שוב.' });
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const elAlCities = cities.filter(city => city.isElAlDestination);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Plane className="h-6 w-6 text-blue-600 ml-3" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t.flightForm.title}
            </h3>
            {autoSaveStatus && (
              <div className="text-xs mr-4">
                {autoSaveStatus === 'saving' && (
                  <span className="text-blue-600 flex items-center">
                    <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    שומר...
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="text-green-600">נשמר</span>
                )}
                {autoSaveStatus === 'error' && (
                  <span className="text-red-600">שגיאה בשמירה</span>
                )}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mb-6">
            {t.flightForm.keyboardShortcuts}
          </div>

          {showSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Plane className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    הטיסה נוספה בהצלחה!
                  </p>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {errors.submit}
                  </p>
                </div>
              </div>
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Flight Number - Required Field */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <label htmlFor="flightNumber" className="flex items-center text-sm font-medium text-red-800">
                <Plane className="h-4 w-4 text-red-400 ml-3" />
                {t.flightForm.flightNumber} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="flightNumber"
                  id="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                  placeholder="LY001"
                  required
                  className={`block w-full sm:text-sm rounded-md focus:ring-red-500 focus:border-red-500 ${
                    errors.flightNumber ? 'border-red-300' : 'border-red-300'
                  }`}
                />
              </div>
              {errors.flightNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.flightNumber}</p>
              )}
            </div>

            {/* New Flight Number - Only show if template uses this parameter */}
            {templateParameters.has('newFlightNumber') && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <label htmlFor="newFlightNumber" className="flex items-center text-sm font-medium text-orange-800">
                  <Plane className="h-4 w-4 text-orange-400 ml-3" />
                  {t.flightForm.newFlightNumber} <span className="text-orange-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="newFlightNumber"
                    id="newFlightNumber"
                    value={formData.newFlightNumber}
                    onChange={handleInputChange}
                    placeholder="LY002"
                    className="block w-full sm:text-sm rounded-md focus:ring-orange-500 focus:border-orange-500 border-orange-300"
                  />
                </div>
              </div>
            )}

            {/* Cities - Required Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label htmlFor="departureCity" className="flex items-center text-sm font-medium text-blue-800">
                  <MapPin className="h-4 w-4 text-blue-400 ml-3" />
                  {t.flightForm.departureCity} <span className="text-blue-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    name="departureCity"
                    id="departureCity"
                    value={formData.departureCity}
                    onChange={handleInputChange}
                    required
                    className={`block w-full sm:text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.departureCity ? 'border-red-300' : 'border-blue-300'
                    }`}
                  >
                    <option value="">{t.destinationsTable.selectDepartureCity}</option>
                    {elAlCities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name} ({city.code})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.departureCity && (
                  <p className="mt-1 text-sm text-red-600">{errors.departureCity}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label htmlFor="arrivalCity" className="flex items-center text-sm font-medium text-blue-800">
                  <MapPin className="h-4 w-4 text-blue-400 ml-3" />
                  {t.flightForm.arrivalCity} <span className="text-blue-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    name="arrivalCity"
                    id="arrivalCity"
                    value={formData.arrivalCity}
                    onChange={handleInputChange}
                    required
                    className={`block w-full sm:text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.arrivalCity ? 'border-red-300' : 'border-blue-300'
                    }`}
                  >
                    <option value="">{t.flightForm.selectArrivalCity}</option>
                    {elAlCities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name} ({city.code})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.arrivalCity && (
                  <p className="mt-1 text-sm text-red-600">{errors.arrivalCity}</p>
                )}
              </div>
            </div>

            {/* Original Date and Time - Required Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label htmlFor="originalDate" className="flex items-center text-sm font-medium text-green-800">
                  <Calendar className="h-4 w-4 text-green-400 ml-3" />
                  {t.flightForm.originalDate} <span className="text-green-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="originalDate"
                    id="originalDate"
                    value={formData.originalDate}
                    onChange={handleInputChange}
                    required
                    className="block w-full sm:text-sm border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label htmlFor="originalTime" className="flex items-center text-sm font-medium text-green-800">
                  <Clock className="h-4 w-4 text-green-400 ml-3" />
                  {t.flightForm.originalTime} <span className="text-green-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="originalTime"
                    id="originalTime"
                    value={formData.originalTime}
                    onChange={handleInputChange}
                    required
                    className="block w-full sm:text-sm border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* New Date and Time - Required Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <label htmlFor="newDate" className="flex items-center text-sm font-medium text-purple-800">
                  <Calendar className="h-4 w-4 text-purple-400 ml-3" />
                  {t.flightForm.newDateOptional}
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="newDate"
                    id="newDate"
                    value={formData.newDate}
                    onChange={handleInputChange}
                    className="block w-full sm:text-sm border-purple-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <label htmlFor="newTime" className="flex items-center text-sm font-medium text-purple-800">
                  <Clock className="h-4 w-4 text-purple-400 ml-3" />
                  {t.flightForm.newTime} <span className="text-purple-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="newTime"
                    id="newTime"
                    value={formData.newTime}
                    onChange={handleInputChange}
                    required
                    className="block w-full sm:text-sm border-purple-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Times - Only show if template uses these parameters */}
            {(templateParameters.has('loungeOpenTime') || templateParameters.has('counterOpenTime')) && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {templateParameters.has('loungeOpenTime') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label htmlFor="loungeOpenTime" className="flex items-center text-sm font-medium text-yellow-800">
                      <Clock className="h-4 w-4 text-yellow-400 ml-3" />
                      {t.flightForm.loungeOpenTime} <span className="text-yellow-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="time"
                        name="loungeOpenTime"
                        id="loungeOpenTime"
                        value={formData.loungeOpenTime}
                        onChange={handleInputChange}
                        className="block w-full sm:text-sm border-yellow-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>
                )}

                {templateParameters.has('counterOpenTime') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label htmlFor="counterOpenTime" className="flex items-center text-sm font-medium text-yellow-800">
                      <Clock className="h-4 w-4 text-yellow-400 ml-3" />
                      {t.flightForm.counterOpenTime} <span className="text-yellow-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="time"
                        name="counterOpenTime"
                        id="counterOpenTime"
                        value={formData.counterOpenTime}
                        onChange={handleInputChange}
                        className="block w-full sm:text-sm border-yellow-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleClearFields}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Trash2 className="h-5 w-5 ml-3" />
                {t.flightForm.clearFields}
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
{t.common.loading}
                  </>
                ) : (
                  <>
                    <Plane className="h-5 w-5 ml-3" />
{t.flightForm.generateMessage}
                  </>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>

        {/* Messages Section */}
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-blue-600 ml-3" />
                <h4 className="text-lg font-medium text-gray-900">
                  {t.flightForm.templateSelection}
                </h4>
              </div>
            </div>
            <div>
              <select
                name="template"
                id="template"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t.flightForm.defaultTemplate}</option>
                {templates.filter(template => template.isActive).map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {templates.filter(template => template.isActive).length === 0 && templates.length > 0 && (
                <p className="mt-1 text-sm text-gray-500">{t.flightForm.noActiveTemplates}</p>
              )}
              {templates.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">{t.flightForm.loadingTemplates}</p>
              )}
            </div>
            
          </div>

          {/* Hebrew Message */}
          {generatedText && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 ml-3" />
                  <h4 className="text-lg font-medium text-blue-900">
                    {t.flightForm.messageToSend} - {isRTL ? 'עברית' : 'Hebrew'}
                  </h4>
                </div>
                <button
                  ref={(el) => {
                    if (el) setCopyButtonRef(el);
                  }}
                  onClick={(e) => handleCopy(generatedText, e.currentTarget)}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Copy className="h-4 w-4 ml-3" />
                  {t.common.copy}
                </button>
              </div>
              <div className="bg-white p-4 rounded-md border">
                <pre 
                  className="text-sm text-gray-700 whitespace-pre-wrap font-sans"
                  dangerouslySetInnerHTML={{ __html: highlightTemplateVariables(generatedText) }}
                />
              </div>
            </div>
          )}

          {/* Flight not found message */}
          {formData.flightNumber && !flightRoutes.some(route => route.flightNumber === formData.flightNumber) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 text-yellow-600 ml-3" />
                <h4 className="text-lg font-medium text-yellow-900">
                  {t.flightForm.flightNotFound}
                </h4>
              </div>
              <div className="text-sm text-yellow-800">
                <p>{t.flightForm.flightNotFoundMessage}</p>
                <p className="mt-2">{t.flightForm.checkFlightNumber}</p>
              </div>
            </div>
          )}

          {/* English Message */}
          {generatedEnglishText && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-green-600 ml-3" />
                  <h4 className="text-lg font-medium text-green-900">
                    {t.flightForm.messageToSend} - {isRTL ? 'אנגלית' : 'English'}
                  </h4>
                </div>
                <button
                  ref={(el) => {
                    if (el) setCopyButtonRef(el);
                  }}
                  onClick={(e) => handleCopy(generatedEnglishText, e.currentTarget)}
                  className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Copy className="h-4 w-4 ml-3" />
                  {t.common.copy}
                </button>
              </div>
              <div className="bg-white p-4 rounded-md border" dir="ltr">
                <pre 
                  className="text-sm text-gray-700 whitespace-pre-wrap font-sans text-left"
                  dangerouslySetInnerHTML={{ __html: highlightTemplateVariables(generatedEnglishText) }}
                />
              </div>
            </div>
          )}

          {/* English Flight not found message */}
          {formData.flightNumber && !flightRoutes.some(route => route.flightNumber === formData.flightNumber) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-600 ml-3" />
                <h4 className="text-lg font-medium text-orange-900">
                  Flight Number Not Found
                </h4>
              </div>
              <div className="text-sm text-orange-800">
                <p>Flight number <strong>{formData.flightNumber}</strong> was not found in the flight list.</p>
                <p className="mt-2">Please check the flight number or add it to the flight list in the "ניהול יעדים ומסלולים" tab.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy Toast using Portal */}
      {showCopyToast && copyButtonRef && createPortal(
        <div 
          style={{
            position: 'absolute',
            top: copyButtonRef.offsetTop - 50,
            left: copyButtonRef.offsetLeft + copyButtonRef.offsetWidth + 10,
            zIndex: 9999,
            backgroundColor: '#10b981',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #059669',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}
        >
          <Copy className="h-4 w-4 mr-1" />
          <span style={{ fontWeight: '500' }}>הועתק!</span>
        </div>,
        copyButtonRef.offsetParent || document.body
      )}
      
    </div>
  );
};

export default FlightForm;
