import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch } from '../store/hooks';
import { fetchCities } from '../store/slices/citiesSlice';
import { fetchTemplates } from '../store/slices/templatesSlice';
import { fetchFlightRoutes } from '../store/slices/flightRoutesSlice';
import { City, FlightRoute, MessageTemplate } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getLocalTime, getLocalTimeWithDate, getCityUTCOffset, convertLocalTimeToUTC, convertUTCToLocalTime } from '../services/timezoneService';
import { Plane, Calendar, Clock, MapPin, Copy, Trash2, AlertTriangle, CheckCircle, RefreshCw, FileText, Send } from 'lucide-react';
import { 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Paper, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip, 
  Alert, 
  CircularProgress, 
  IconButton, 
  Tooltip, 
  Divider, 
  Stack, 
  useTheme, 
  useMediaQuery,
  Autocomplete,
  Popover
} from '@mui/material';

interface FlightFormProps {
  cities: City[];
  flightRoutes: FlightRoute[];
  templates: MessageTemplate[];
}

const FlightForm: React.FC<FlightFormProps> = ({ cities, flightRoutes, templates }) => {
  const dispatch = useAppDispatch();
  const { t, language } = useLanguage();
  const { userData } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Memoize props to prevent unnecessary re-renders
  const memoizedCities = useMemo(() => cities, [cities]);
  const memoizedFlightRoutes = useMemo(() => flightRoutes, [flightRoutes]);
  const memoizedTemplates = useMemo(() => templates, [templates]);


  // Get current time and date - use useMemo to prevent infinite loop
  const { currentTime, currentDate } = useMemo(() => {
  const now = new Date();
    return {
      currentTime: now.toTimeString().slice(0, 5), // HH:MM format
      currentDate: now.toISOString().split('T')[0], // YYYY-MM-DD format
    };
  }, []); // Empty dependency array - only calculate once

  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDate = now.toISOString().split('T')[0];
    
    return {
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
      counterCloseTime: '',
      internetCode: '',
      // Dynamic custom variables will be added here
    };
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generatedText, setGeneratedText] = useState<string>('');
  const [generatedEnglishText, setGeneratedEnglishText] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [copyButtonRef, setCopyButtonRef] = useState<HTMLButtonElement | null>(null);
  const [autoFillStatus, setAutoFillStatus] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});
  const [showAddRouteButton, setShowAddRouteButton] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeState, setCurrentTimeState] = useState(new Date());
  const [departureLocalTime, setDepartureLocalTime] = useState<string>('');
  const [departureLocalDate, setDepartureLocalDate] = useState<string>('');
  
  // Date picker states
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(null);
  const [activeDateField, setActiveDateField] = useState<'originalDate' | 'newDate' | null>(null);
  const [arrivalLocalTime, setArrivalLocalTime] = useState<string>('');
  const [arrivalLocalDate, setArrivalLocalDate] = useState<string>('');
  const [departureUTCOffset, setDepartureUTCOffset] = useState<string>('');
  const [originalTimeUTC, setOriginalTimeUTC] = useState<string>('');
  const [newTimeUTC, setNewTimeUTC] = useState<string>('');
  const [originalTimeLocal, setOriginalTimeLocal] = useState<string>('');
  const [newTimeLocal, setNewTimeLocal] = useState<string>('');

  // Function to check which parameters are used in the selected template
  const getTemplateParameters = useCallback((templateContent: string): Set<string> => {
    const parameterRegex = /\{([^}]+)\}/g;
    const parameters = new Set<string>();
    let match;
    
    while ((match = parameterRegex.exec(templateContent)) !== null) {
      parameters.add(match[1]);
    }
    
    return parameters;
  }, []);

  // Get selected template data
  const selectedTemplateData = memoizedTemplates.find(t => t.id === selectedTemplate);

  // Get which parameters are needed for the selected template
  const templateParameters = selectedTemplateData ? 
    getTemplateParameters(selectedTemplateData.content || '') : 
    new Set<string>();


  // Function to handle copy to clipboard
  const handleCopyToClipboard = useCallback((text: string, buttonRef: HTMLButtonElement | null) => {
    if (buttonRef) {
      setCopyButtonRef(buttonRef);
      navigator.clipboard.writeText(text).then(() => {
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
      });
    }
  }, []);

  // Copy Hebrew text
  const copyHebrewText = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (generatedText) {
      const buttonElement = e.currentTarget;
      handleCopyToClipboard(generatedText, buttonElement);
    }
  }, [generatedText, handleCopyToClipboard]);

  // Copy English text
  const copyEnglishText = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (generatedEnglishText) {
      const buttonElement = e.currentTarget;
      handleCopyToClipboard(generatedEnglishText, buttonElement);
    }
  }, [generatedEnglishText, handleCopyToClipboard]);

  // Load form data from localStorage and fetch cities on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('flightFormData');
    const savedTemplate = localStorage.getItem('selectedTemplate');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Always update dates and times to current values, but keep other data
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDate = now.toISOString().split('T')[0];
        
        setFormData(prev => ({
          ...parsedData,
          originalTime: currentTime,
          newTime: currentTime,
          originalDate: currentDate,
          newDate: currentDate,
          counterCloseTime: parsedData.counterCloseTime || '',
          internetCode: parsedData.internetCode || ''
        }));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
    
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
    
    // Fetch cities, templates, and flight routes data
    dispatch(fetchCities());
    dispatch(fetchTemplates());
    dispatch(fetchFlightRoutes());
  }, [dispatch]);

  // Update current time every minute for local time display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeState(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Update local times when cities or current time change
  useEffect(() => {
    const updateLocalTimes = async () => {
      if (formData.departureCity) {
        try {
          const [time, date] = await Promise.all([
            getLocalTime(formData.departureCity, currentTimeState),
            getLocalTimeWithDate(formData.departureCity, currentTimeState)
          ]);
          setDepartureLocalTime(time);
          setDepartureLocalDate(date);
      } catch (error) {
          console.error('Error updating departure local time:', error);
          setDepartureLocalTime('שגיאה');
          setDepartureLocalDate('שגיאה');
        }
      } else {
        setDepartureLocalTime('');
        setDepartureLocalDate('');
      }

      if (formData.arrivalCity) {
        try {
          const [time, date] = await Promise.all([
            getLocalTime(formData.arrivalCity, currentTimeState),
            getLocalTimeWithDate(formData.arrivalCity, currentTimeState)
          ]);
          setArrivalLocalTime(time);
          setArrivalLocalDate(date);
        } catch (error) {
          console.error('Error updating arrival local time:', error);
          setArrivalLocalTime('שגיאה');
          setArrivalLocalDate('שגיאה');
        }
      } else {
        setArrivalLocalTime('');
        setArrivalLocalDate('');
      }
    };

    updateLocalTimes();
  }, [formData.departureCity, formData.arrivalCity, currentTimeState]);

  // Update UTC offset when departure city changes
  useEffect(() => {
    const updateUTCOffset = async () => {
      if (formData.departureCity) {
        try {
          const utcOffset = await getCityUTCOffset(formData.departureCity);
          setDepartureUTCOffset(utcOffset);
        } catch (error) {
          console.error('Error updating UTC offset:', error);
          setDepartureUTCOffset('');
        }
      } else {
        setDepartureUTCOffset('');
      }
    };

    updateUTCOffset();
  }, [formData.departureCity]);

  // Update local times when departure city, original time, or new time change
  useEffect(() => {
    const updateLocalTimes = async () => {
      if (formData.departureCity) {
        // Update original time local (formData.originalTime is UTC)
        if (formData.originalTime) {
          try {
            const localTime = await convertUTCToLocalTime(formData.originalTime, formData.departureCity);
            setOriginalTimeLocal(localTime);
            setOriginalTimeUTC(formData.originalTime);
          } catch (error) {
            console.error('Error updating original time local:', error);
            setOriginalTimeLocal(formData.originalTime);
            setOriginalTimeUTC(formData.originalTime);
          }
        } else {
          setOriginalTimeLocal('');
          setOriginalTimeUTC('');
        }

        // Update new time local (formData.newTime is UTC)
        if (formData.newTime) {
          try {
            const localTime = await convertUTCToLocalTime(formData.newTime, formData.departureCity);
            setNewTimeLocal(localTime);
            setNewTimeUTC(formData.newTime);
          } catch (error) {
            console.error('Error updating new time local:', error);
            setNewTimeLocal(formData.newTime);
            setNewTimeUTC(formData.newTime);
          }
        } else {
          setNewTimeLocal('');
          setNewTimeUTC('');
        }
      } else {
        setOriginalTimeLocal('');
        setNewTimeLocal('');
        setOriginalTimeUTC('');
        setNewTimeUTC('');
      }
    };

    updateLocalTimes();
  }, [formData.departureCity, formData.originalTime, formData.newTime]);

  // Auto-save form data to localStorage with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('flightFormData', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Auto-save selected template to localStorage
  useEffect(() => {
    if (selectedTemplate) {
      localStorage.setItem('selectedTemplate', selectedTemplate);
    }
  }, [selectedTemplate]);

  // Update generated text whenever form data changes
  useEffect(() => {
    if (!formData.flightNumber || !formData.departureCity || !formData.arrivalCity || 
        !formData.originalDate || !formData.originalTime || !formData.newTime) {
      setGeneratedText('');
      setGeneratedEnglishText('');
      setError(null);
      setIsGenerating(false);
      return;
    }

    // Check if flight number exists in flight routes
    const flightExists = memoizedFlightRoutes.some(route => route.flightNumber === formData.flightNumber);
    if (!flightExists) {
      setGeneratedText('');
      setGeneratedEnglishText('');
      setError(null);
      setIsGenerating(false);
      return;
    }

    if (!selectedTemplateData) {
      setGeneratedText('');
      setGeneratedEnglishText('');
      setError(null);
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Generate Hebrew message
    const departureCityName = memoizedCities.find(c => c.code === formData.departureCity)?.name || formData.departureCity;
    const arrivalCityName = memoizedCities.find(c => c.code === formData.arrivalCity)?.name || formData.arrivalCity;
    
    // Format date as DD.MM for Hebrew
    const originalDateObj = new Date(formData.originalDate);
    const originalDateFormatted = `${originalDateObj.getDate().toString().padStart(2, '0')}.${(originalDateObj.getMonth() + 1).toString().padStart(2, '0')}`;
    const newDateFormatted = formData.newDate ? 
      `${new Date(formData.newDate).getDate().toString().padStart(2, '0')}.${(new Date(formData.newDate).getMonth() + 1).toString().padStart(2, '0')}` : 
      originalDateFormatted;

    const formattedFlightNumber = `LY${formData.flightNumber.padStart(3, '0')}`;
    const formattedNewFlightNumber = formData.newFlightNumber ? `LY${formData.newFlightNumber.padStart(3, '0')}` : formattedFlightNumber;

    const templateContent = selectedTemplateData.content || '';
    const hebrewText = templateContent
      .replace('{flightNumber}', formData.flightNumber ? formattedFlightNumber : '***')
      .replace('{newFlightNumber}', formData.newFlightNumber ? formattedNewFlightNumber : '***')
      .replace('{departureCity}', formData.departureCity ? departureCityName : '***')
      .replace('{arrivalCity}', formData.arrivalCity ? arrivalCityName : '***')
      .replace('{originalDate}', formData.originalDate ? originalDateFormatted : '***')
      .replace('{originalTime}', originalTimeLocal ? originalTimeLocal : '***')
      .replace('{newTime}', newTimeLocal ? newTimeLocal : '***')
      .replace('{newDate}', formData.newDate ? newDateFormatted : '***')
      .replace('{loungeOpenTime}', formData.loungeOpenTime || '***')
      .replace('{counterOpenTime}', formData.counterOpenTime || '***')
      .replace('{counterCloseTime}', formData.counterCloseTime || '***')
      .replace('{internetCode}', formData.internetCode || '***');

    // Generate English message
    const flightRoute = memoizedFlightRoutes.find(route => route.flightNumber === formData.flightNumber);
    const departureCityNameEnglish = flightRoute?.departureCityEnglish || memoizedCities.find(c => c.code === formData.departureCity)?.englishName || formData.departureCity;
    const arrivalCityNameEnglish = flightRoute?.arrivalCityEnglish || memoizedCities.find(c => c.code === formData.arrivalCity)?.englishName || formData.arrivalCity;
    
    // Format date as Month DD for English
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const originalDateFormattedEnglish = `${monthNames[originalDateObj.getMonth()]} ${originalDateObj.getDate()}`;
    const newDateFormattedEnglish = formData.newDate ? 
      `${monthNames[new Date(formData.newDate).getMonth()]} ${new Date(formData.newDate).getDate()}` : 
      originalDateFormattedEnglish;

    const formatTimeTo12Hour = (time24: string) => {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    const englishTemplateContent = selectedTemplateData.englishContent || selectedTemplateData.content || '';
    const englishText = englishTemplateContent
      .replace('{flightNumber}', formData.flightNumber ? formattedFlightNumber : '***')
      .replace('{newFlightNumber}', formData.newFlightNumber ? formattedNewFlightNumber : '***')
      .replace('{departureCity}', formData.departureCity ? departureCityNameEnglish : '***')
      .replace('{arrivalCity}', formData.arrivalCity ? arrivalCityNameEnglish : '***')
      .replace('{originalDate}', formData.originalDate ? originalDateFormattedEnglish : '***')
      .replace('{originalTime}', originalTimeLocal ? formatTimeTo12Hour(originalTimeLocal) : '***')
      .replace('{newTime}', newTimeLocal ? formatTimeTo12Hour(newTimeLocal) : '***')
      .replace('{newDate}', formData.newDate ? newDateFormattedEnglish : '***')
      .replace('{loungeOpenTime}', formData.loungeOpenTime || '***')
      .replace('{counterOpenTime}', formData.counterOpenTime || '***')
      .replace('{counterCloseTime}', formData.counterCloseTime || '***')
      .replace('{internetCode}', formData.internetCode || '***');

    try {
      setGeneratedText(hebrewText);
    setGeneratedEnglishText(englishText);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה ביצירת ההודעה');
      setGeneratedText('');
      setGeneratedEnglishText('');
    } finally {
      setIsGenerating(false);
    }
  }, [formData, selectedTemplate, selectedTemplateData, memoizedCities, memoizedFlightRoutes, originalTimeLocal, newTimeLocal]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (window.confirm(t.flightForm.clearFieldsConfirm)) {
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
            counterCloseTime: '',
            internetCode: '',
          });
          setGeneratedText('');
          setGeneratedEnglishText('');
          setSelectedTemplate('');
          setShowAddRouteButton(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, currentDate]);

  // Helper function to convert ISO date to display format
  const formatDateForDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Date picker functions
  const handleDateFieldClick = (event: React.MouseEvent<HTMLElement>, field: 'originalDate' | 'newDate') => {
    setDatePickerAnchor(event.currentTarget);
    setActiveDateField(field);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
    setActiveDateField(null);
  };

  const handleDateSelect = (selectedDate: Date) => {
    if (activeDateField) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        [activeDateField]: isoDate,
      }));
    }
    handleDatePickerClose();
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!generatedText || !generatedEnglishText) {
      setError('אנא צור הודעה לפני השליחה');
      return;
    }

    if (!userData?.name) {
      setError('שם המשתמש לא זמין');
      return;
    }

    try {
      // Create message object
      const sentMessage = {
        flightNumber: formData.flightNumber,
        departureCity: formData.departureCity,
        arrivalCity: formData.arrivalCity,
        originalDate: formData.originalDate,
        newDate: formData.newDate,
        originalTime: formData.originalTime,
        newTime: formData.newTime,
        hebrewMessage: generatedText,
        englishMessage: generatedEnglishText,
        sentBy: userData.name,
        sentAt: new Date().toISOString(),
        templateId: selectedTemplate,
        templateName: selectedTemplateData?.name || 'Unknown Template'
      };

      // Save to Firebase
      const messagesRef = collection(db, 'sentMessages');
      await addDoc(messagesRef, sentMessage);

      // Also save to localStorage as backup
      const existingMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]');
      existingMessages.unshift({ id: Date.now().toString(), ...sentMessage });
      localStorage.setItem('sentMessages', JSON.stringify(existingMessages));

      // Show success message
      setError(null);
      alert(t.flightForm.messageSent);

      // Clear form after sending
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
        counterCloseTime: '',
        internetCode: '',
      });
      setSelectedTemplate('');
      setGeneratedText('');
      setGeneratedEnglishText('');

    } catch (error) {
      console.error('Error sending message:', error);
      setError(t.flightForm.messageSentError);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limit flight number to 4 digits maximum and only allow numbers
    if (name === 'flightNumber' || name === 'newFlightNumber') {
      // Only allow digits and limit to 4 characters
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      if (numericValue !== value) {
        e.target.value = numericValue;
      }
      if (numericValue.length > 4) {
      return;
      }
    }
    
    // Handle date formatting
    if (name === 'originalDate' || name === 'newDate') {
      // Remove any non-digit characters except slashes
      let cleanValue = value.replace(/[^\d/]/g, '');
      
      // Auto-format as user types
      if (cleanValue.length >= 2 && !cleanValue.includes('/')) {
        cleanValue = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2);
      }
      if (cleanValue.length >= 5 && cleanValue.split('/').length === 2) {
        cleanValue = cleanValue.slice(0, 5) + '/' + cleanValue.slice(5);
      }
      
      // Limit to DD/MM/YYYY format
      if (cleanValue.length > 10) {
        cleanValue = cleanValue.slice(0, 10);
      }
      
      // Update the input value
      e.target.value = cleanValue;
      
      // Convert to ISO format for storage
      if (cleanValue.length === 10) {
        const parts = cleanValue.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          setFormData(prev => ({
            ...prev,
            [name]: isoDate,
          }));
          return;
        }
      }
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Auto-fill cities when flight number is entered
      if (name === 'flightNumber') {
        if (!value) {
          // Clear everything when flight number is empty
          setShowAddRouteButton(false);
          setAutoFillStatus({type: null, message: ''});
        } else {
        const route = memoizedFlightRoutes.find(route => route.flightNumber === value);
        if (route) {
          newData.departureCity = route.departureCity;
          newData.arrivalCity = route.arrivalCity;
          setAutoFillStatus({
            type: 'success',
            message: `נמצא מסלול: ${route.departureCityHebrew} → ${route.arrivalCityHebrew}`
          });
          setShowAddRouteButton(false); // Hide the button when route is found
          // Clear status after 3 seconds
          setTimeout(() => setAutoFillStatus({type: null, message: ''}), 3000);
        } else {
          // Clear cities if no route found
          newData.departureCity = '';
          newData.arrivalCity = '';
          setAutoFillStatus({
            type: 'error',
            message: `לא נמצא מסלול למספר טיסה ${value}`
          });
          setShowAddRouteButton(true);
          // Clear status after 3 seconds but keep the button
          setTimeout(() => {
            setAutoFillStatus({type: null, message: ''});
          }, 3000);
        }
        }
      }
      
      return newData;
    });
  };

  const handleClearFields = () => {
    if (window.confirm(t.flightForm.clearAllFieldsConfirm)) {
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
        counterCloseTime: '',
        internetCode: '',
      });
      setGeneratedText('');
      setGeneratedEnglishText('');
      setSelectedTemplate('');
      setShowAddRouteButton(false);
    }
  };

  const handleAddRoute = () => {
    // Find the selected cities in the destinations list to get full names
    const departureCityData = Array.from(allDestinations.values()).find((city: any) => city.code === formData.departureCity);
    const arrivalCityData = Array.from(allDestinations.values()).find((city: any) => city.code === formData.arrivalCity);
    
    // Prepare route data to pass to the destinations tab
    const routeData = {
      flightNumber: formData.flightNumber,
      departureCity: formData.departureCity,
      departureCityHebrew: departureCityData?.name || '',
      departureCityEnglish: departureCityData?.englishName || '',
      arrivalCity: formData.arrivalCity,
      arrivalCityHebrew: arrivalCityData?.name || '',
      arrivalCityEnglish: arrivalCityData?.englishName || '',
      airline: 'ELAL'
    };
    
    // Store the route data in localStorage for the destinations tab to pick up
    localStorage.setItem('pendingRouteData', JSON.stringify(routeData));
    
    // Dispatch custom event to navigate to destinations tab
    window.dispatchEvent(new CustomEvent('navigateToTab', { 
      detail: 'destinations' 
    }));
  };

  // Create a comprehensive list of all available destinations
  const allDestinations = useMemo(() => {
    const destinations = new Map();
    
    // Add El Al cities
    const elAlCities = [
      { code: 'TLV', name: 'תל אביב', englishName: 'Tel Aviv' },
      { code: 'JFK', name: 'ניו יורק', englishName: 'New York' },
      { code: 'LAX', name: 'לוס אנג\'לס', englishName: 'Los Angeles' },
      { code: 'LHR', name: 'לונדון', englishName: 'London' },
      { code: 'CDG', name: 'פריז', englishName: 'Paris' },
      { code: 'FCO', name: 'רומא', englishName: 'Rome' },
      { code: 'VIE', name: 'וינה', englishName: 'Vienna' },
      { code: 'MUC', name: 'מינכן', englishName: 'Munich' },
      { code: 'ZUR', name: 'ציריך', englishName: 'Zurich' },
      { code: 'BRU', name: 'בריסל', englishName: 'Brussels' },
      { code: 'AMS', name: 'אמסטרדם', englishName: 'Amsterdam' },
      { code: 'ATH', name: 'אתונה', englishName: 'Athens' },
      { code: 'IST', name: 'איסטנבול', englishName: 'Istanbul' },
      { code: 'SVO', name: 'מוסקבה', englishName: 'Moscow' },
      { code: 'BKK', name: 'בנגקוק', englishName: 'Bangkok' },
      { code: 'BOM', name: 'מומבאי', englishName: 'Mumbai' },
      { code: 'JNB', name: 'יוהנסבורג', englishName: 'Johannesburg' }
    ];

    elAlCities.forEach(city => {
      destinations.set(city.code, city);
    });

    // Add cities from flight routes
    memoizedFlightRoutes.forEach(route => {
      if (!destinations.has(route.departureCity)) {
        destinations.set(route.departureCity, {
          code: route.departureCity,
          name: route.departureCityHebrew || route.departureCity,
          englishName: route.departureCityEnglish || route.departureCity
        });
      }
      if (!destinations.has(route.arrivalCity)) {
        destinations.set(route.arrivalCity, {
          code: route.arrivalCity,
          name: route.arrivalCityHebrew || route.arrivalCity,
          englishName: route.arrivalCityEnglish || route.arrivalCity
        });
      }
    });

    return Array.from(destinations.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [memoizedFlightRoutes]);

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* Form Section */}
        <Box sx={{ flex: 1 }}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 3,
              overflow: 'hidden',
              height: 'fit-content'
            }}
          >
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <Plane size={20} color="white" />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
              {t.flightForm.title}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}>
                      הזן פרטי טיסה ויצור הודעה
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ 
                pb: 1,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            />
            <CardContent sx={{ p: 3 }}>
              {/* Status Messages */}
              {autoFillStatus.type && (
                <Alert 
                  severity={autoFillStatus.type === 'success' ? 'success' : 'error'}
                  icon={autoFillStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  {autoFillStatus.message}
                </Alert>
              )}

              {/* Add Route Button */}
              {showAddRouteButton && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    onClick={handleAddRoute}
                    variant="contained"
                    startIcon={<MapPin size={18} />}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      }
                    }}
                  >
                    {t.flightForm.addNewRoute}
                  </Button>
                </Box>
              )}

              {/* Form Fields Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                {/* Flight Number */}
                <Box>
                  <TextField
                    fullWidth
                    label={t.flightForm.flightNumber}
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                    inputProps={{
                      maxLength: 4,
                      pattern: "[0-9]*",
                      inputMode: "numeric"
                    }}
                    placeholder={t.flightForm.flightNumberPlaceholder}
                    error={!!errors.flightNumber}
                    helperText={errors.flightNumber || t.flightForm.flightNumberHelper}
                    InputProps={{
                      startAdornment: (
                        <Plane size={18} style={{ marginRight: 8, color: '#667eea' }} />
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiFormHelperText-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                    }}
                  />
                </Box>

                {/* New Flight Number - always reserve space */}
                <Box>
                  <TextField
                    fullWidth
                    label={t.flightForm.newFlightNumber}
                    name="newFlightNumber"
                    value={formData.newFlightNumber}
                    onChange={handleInputChange}
                    inputProps={{
                      maxLength: 4,
                      pattern: "[0-9]*",
                      inputMode: "numeric"
                    }}
                    placeholder={t.flightForm.newFlightNumberPlaceholder}
                    InputProps={{
                      startAdornment: (
                        <RefreshCw size={18} style={{ marginRight: 8, color: '#667eea' }} />
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiFormHelperText-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                    }}
                    style={{
                      visibility: templateParameters.has('newFlightNumber') ? 'visible' : 'hidden'
                    }}
                  />
                </Box>

                {/* Departure City */}
                <Box>
                  <FormControl fullWidth error={!!errors.departureCity}>
                    <InputLabel>{t.flightForm.departureCity}</InputLabel>
                    <Select
                    name="departureCity"
                    value={formData.departureCity}
                      onChange={(e) => setFormData(prev => ({ ...prev, departureCity: e.target.value }))}
                      label={t.flightForm.departureCity}
                      startAdornment={<MapPin size={18} style={{ marginRight: 8, color: '#667eea' }} />}
                      sx={{
                        borderRadius: 2,
                        paddingRight: '20px', // Add space for dropdown arrow
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '& .MuiSelect-select': {
                          textAlign: language === 'he' ? 'right' : 'left',
                          direction: language === 'he' ? 'rtl' : 'ltr',
                        },
                        '& .MuiInputLabel-root': {
                          textAlign: language === 'he' ? 'right' : 'left',
                          direction: language === 'he' ? 'rtl' : 'ltr',
                        },
                        '& .MuiFormHelperText-root': {
                          textAlign: language === 'he' ? 'right' : 'left',
                          direction: language === 'he' ? 'rtl' : 'ltr',
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>{t.flightForm.selectDepartureCity}</em>
                      </MenuItem>
                      {allDestinations.map((city) => (
                        <MenuItem key={city.code} value={city.code}>
                          {language === 'he' ? city.name : city.englishName} ({city.code})
                        </MenuItem>
                      ))}
                    </Select>
                {errors.departureCity && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {errors.departureCity}
                      </Typography>
                    )}
                    {formData.departureCity && (
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        mt: 0.5, 
                        display: 'block', 
                        fontSize: '0.75rem',
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr'
                      }}>
                        🕐 {departureLocalTime} - {t.flightForm.localTime}
                        <br />
                        📅 {departureLocalDate} - {t.flightForm.localDate}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                {/* Arrival City */}
                <Box>
                  <FormControl fullWidth error={!!errors.arrivalCity}>
                    <InputLabel>{t.flightForm.arrivalCity}</InputLabel>
                    <Select
                    name="arrivalCity"
                    value={formData.arrivalCity}
                      onChange={(e) => setFormData(prev => ({ ...prev, arrivalCity: e.target.value }))}
                      label={t.flightForm.arrivalCity}
                      startAdornment={<MapPin size={18} style={{ marginRight: 8, color: '#667eea' }} />}
                      sx={{
                        borderRadius: 2,
                        paddingRight: '20px', // Add space for dropdown arrow
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '& .MuiSelect-select': {
                          textAlign: language === 'he' ? 'right' : 'left',
                          direction: language === 'he' ? 'rtl' : 'ltr',
                        },
                        '& .MuiInputLabel-root': {
                          textAlign: language === 'he' ? 'right' : 'left',
                          direction: language === 'he' ? 'rtl' : 'ltr',
                        },
                        '& .MuiFormHelperText-root': {
                          textAlign: language === 'he' ? 'right' : 'left',
                          direction: language === 'he' ? 'rtl' : 'ltr',
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>{t.flightForm.selectArrivalCity}</em>
                      </MenuItem>
                      {allDestinations.map((city) => (
                        <MenuItem key={city.code} value={city.code}>
                          {language === 'he' ? city.name : city.englishName} ({city.code})
                        </MenuItem>
                      ))}
                    </Select>
                {errors.arrivalCity && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {errors.arrivalCity}
                      </Typography>
                    )}
                    {formData.arrivalCity && (
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        mt: 0.5, 
                        display: 'block', 
                        fontSize: '0.75rem',
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr'
                      }}>
                        🕐 {arrivalLocalTime} - {t.flightForm.localTime}
                        <br />
                        📅 {arrivalLocalDate} - {t.flightForm.localDate}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                {/* Original Date */}
                <Box>
                  <TextField
                    fullWidth
                    label={t.flightForm.originalDate}
                    name="originalDate"
                    type="text"
                    value={formatDateForDisplay(formData.originalDate)}
                    onChange={handleInputChange}
                    onClick={(e) => handleDateFieldClick(e, 'originalDate')}
                    error={!!errors.originalDate}
                    helperText={errors.originalDate}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton
                          onClick={(e) => handleDateFieldClick(e, 'originalDate')}
                          edge="end"
                          sx={{ color: '#667eea' }}
                        >
                          <Calendar size={18} />
                        </IconButton>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiFormHelperText-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                    }}
                  />
                </Box>

                {/* New Date - always reserve space */}
                <Box>
                  <TextField
                    fullWidth
                    label={t.flightForm.newDate}
                    name="newDate"
                    type="text"
                    value={formatDateForDisplay(formData.newDate)}
                    onChange={handleInputChange}
                    onClick={(e) => handleDateFieldClick(e, 'newDate')}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton
                          onClick={(e) => handleDateFieldClick(e, 'newDate')}
                          edge="end"
                          sx={{ color: '#667eea' }}
                        >
                          <Calendar size={18} />
                        </IconButton>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiFormHelperText-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                    }}
                    style={{
                      visibility: templateParameters.has('newDate') ? 'visible' : 'hidden'
                    }}
                  />
                </Box>

                {/* Original Time */}
                <Box>
                  <Typography variant="caption" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block',
                    fontWeight: 500,
                    textAlign: language === 'he' ? 'right' : 'left',
                    direction: language === 'he' ? 'rtl' : 'ltr'
                  }}>
                    {t.flightForm.originalTimeHelper}
                  </Typography>
                  <TextField
                    fullWidth
                    label={t.flightForm.originalTimeLabel}
                    name="originalTime"
                    type="time"
                    value={formData.originalTime}
                    onChange={handleInputChange}
                    error={!!errors.originalTime}
                    helperText={errors.originalTime}
                    InputProps={{}}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiFormHelperText-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                    }}
                  />
                  {originalTimeLocal && (
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      mt: 0.5, 
                      display: 'block', 
                      fontSize: '0.75rem',
                      textAlign: language === 'he' ? 'right' : 'left',
                      direction: language === 'he' ? 'rtl' : 'ltr'
                    }}>
                      🕐 {originalTimeLocal} - {t.flightForm.localTimeDeparture}
                    </Typography>
                  )}
                  {departureUTCOffset && formData.departureCity && (
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      mt: 0.5, 
                      display: 'block', 
                      fontSize: '0.75rem',
                      textAlign: language === 'he' ? 'right' : 'left',
                      direction: language === 'he' ? 'rtl' : 'ltr'
                    }}>
                      🌍 {departureUTCOffset} - {t.flightForm.utcOf} {language === 'he' 
                        ? (memoizedCities.find(c => c.code === formData.departureCity)?.name || formData.departureCity)
                        : (memoizedCities.find(c => c.code === formData.departureCity)?.englishName || formData.departureCity)
                      }
                    </Typography>
                  )}
                </Box>

                {/* New Time */}
                <Box>
                  <Typography variant="caption" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block',
                    fontWeight: 500,
                    textAlign: language === 'he' ? 'right' : 'left',
                    direction: language === 'he' ? 'rtl' : 'ltr'
                  }}>
                    {t.flightForm.newTimeHelper}
                  </Typography>
                  <TextField
                    fullWidth
                    label={t.flightForm.newTimeLabel}
                    name="newTime"
                    type="time"
                    value={formData.newTime}
                    onChange={handleInputChange}
                    error={!!errors.newTime}
                    helperText={errors.newTime}
                    InputProps={{}}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiFormHelperText-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                    }}
                  />
                  {newTimeLocal && (
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      mt: 0.5, 
                      display: 'block', 
                      fontSize: '0.75rem',
                      textAlign: language === 'he' ? 'right' : 'left',
                      direction: language === 'he' ? 'rtl' : 'ltr'
                    }}>
                      🕐 {newTimeLocal} - {t.flightForm.localTimeDeparture}
                    </Typography>
                  )}
                  {departureUTCOffset && formData.departureCity && (
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      mt: 0.5, 
                      display: 'block', 
                      fontSize: '0.75rem',
                      textAlign: language === 'he' ? 'right' : 'left',
                      direction: language === 'he' ? 'rtl' : 'ltr'
                    }}>
                      🌍 {departureUTCOffset} - {t.flightForm.utcOf} {language === 'he' 
                        ? (memoizedCities.find(c => c.code === formData.departureCity)?.name || formData.departureCity)
                        : (memoizedCities.find(c => c.code === formData.departureCity)?.englishName || formData.departureCity)
                      }
                    </Typography>
                  )}
                </Box>

                {/* Check-in Counter Opening Time - always reserve space */}
                <Box>
                  <TextField
                    fullWidth
                    label={t.templateManager.parameters.counterOpenTime}
                    name="counterOpenTime"
                        type="time"
                    value={formData.counterOpenTime}
                    onChange={handleInputChange}
                    InputProps={{}}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiFormHelperText-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                    }}
                    style={{
                      visibility: templateParameters.has('counterOpenTime') ? 'visible' : 'hidden'
                    }}
                  />
                </Box>
                

                {/* Lounge Opening Time - always reserve space */}
                <Box>
                  <TextField
                    fullWidth
                    label={t.templateManager.parameters.loungeOpenTime}
                        name="loungeOpenTime"
                    type="time"
                        value={formData.loungeOpenTime}
                        onChange={handleInputChange}
                    InputProps={{}}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiFormHelperText-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                    }}
                    style={{
                      visibility: templateParameters.has('loungeOpenTime') ? 'visible' : 'hidden'
                    }}
                  />
                </Box>

                {/* Counter Closing Time - always reserve space */}
                <Box>
                  <TextField
                    fullWidth
                    label={t.templateManager.parameters.counterCloseTime}
                    name="counterCloseTime"
                        type="time"
                    value={formData.counterCloseTime}
                        onChange={handleInputChange}
                    InputProps={{}}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                      '& .MuiFormHelperText-root': {
                        textAlign: language === 'he' ? 'right' : 'left',
                        direction: language === 'he' ? 'rtl' : 'ltr',
                      },
                    }}
                    style={{
                      visibility: templateParameters.has('counterCloseTime') ? 'visible' : 'hidden'
                    }}
                  />
                </Box>

                {/* Internet Code - always reserve space */}
                <Box>
                  <TextField
                    fullWidth
                    label={t.templateManager.parameters.internetCode || 'קוד אינטרנט'}
                    name="internetCode"
                    value={formData.internetCode || ''}
                    onChange={handleInputChange}
                    placeholder={t.flightForm.internetCodePlaceholder}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      },
                    }}
                    style={{
                      visibility: templateParameters.has('internetCode') ? 'visible' : 'hidden'
                    }}
                  />
                </Box>
              </Box>

              {/* Clear Button */}
              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                onClick={handleClearFields}
                  startIcon={<Trash2 size={18} />}
                  sx={{ 
                    minWidth: '140px',
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                      boxShadow: '0 6px 16px rgba(245, 101, 101, 0.4)',
                    },
                    '& .MuiButton-startIcon': { 
                      marginRight: '8px',
                      marginLeft: 0
                    }
                  }}
                >
                {t.flightForm.clearFields}
                </Button>
                
                {/* Send Message Button */}
                <Button
                  variant="contained"
                  startIcon={<Send size={18} />}
                  onClick={handleSendMessage}
                  disabled={!generatedText || !generatedEnglishText || isGenerating}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0ea472 0%, #047857 100%)',
                      boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                      boxShadow: 'none'
                    },
                    '& .MuiButton-startIcon': { 
                      marginRight: '8px',
                      marginLeft: 0
                    }
                  }}
                >
                  {t.flightForm.sendMessage}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Message Generation Section */}
        <Box sx={{ flex: 1 }}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 3,
              overflow: 'hidden',
              height: 'fit-content'
            }}
          >
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <FileText size={20} color="white" />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      בחירת תבנית
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}>
                      בחר תבנית
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ 
                pb: 1,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            />
            <CardContent sx={{ p: 3 }}>
          {/* Template Selection */}
              <Box sx={{ mb: 3 }}>
                <Autocomplete
                  fullWidth
                  options={memoizedTemplates.filter(t => t.isActive)}
                  getOptionLabel={(option) => option.name}
                  value={memoizedTemplates.find(t => t.id === selectedTemplate) || null}
                  onChange={(event, newValue) => {
                    setSelectedTemplate(newValue ? newValue.id : '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t.flightForm.selectTemplateMessage}
                      placeholder={t.flightForm.selectTemplate}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                          },
                        },
                        '& .MuiInputBase-input': {
                          textAlign: language === 'he' ? 'right' : 'left',
                          direction: language === 'he' ? 'rtl' : 'ltr',
                        },
                        '& .MuiInputLabel-root': {
                          textAlign: language === 'he' ? 'right' : 'left',
                          direction: language === 'he' ? 'rtl' : 'ltr',
                        },
                        '& .MuiFormHelperText-root': {
                          textAlign: language === 'he' ? 'right' : 'left',
                          direction: language === 'he' ? 'rtl' : 'ltr',
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <FileText size={16} style={{ marginRight: 8, color: '#667eea' }} />
                        <Typography variant="body2">{option.name}</Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText={t.flightForm.noTemplatesFound || "לא נמצאו תבניות"}
                  clearOnEscape
                  selectOnFocus
                  handleHomeEndKeys
                />
              </Box>
            
              {/* Error Display */}
              {error && (
                <Alert 
                  severity="error"
                  icon={<AlertTriangle size={16} />}
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Loading State */}
              {isGenerating && (
                <Alert 
                  severity="info"
                  icon={<CircularProgress size={16} />}
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  יוצר הודעה...
                </Alert>
              )}

              {/* Generated Messages */}
              {generatedText && !isGenerating && (
                <Stack spacing={3}>
                  {/* Hebrew Message */}
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: 2 
                    }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 'bold',
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        🇮🇱 {t.flightForm.hebrewMessage}
                      </Typography>
                      <Button
                        onClick={copyHebrewText}
                        size="small"
                        startIcon={<Copy size={14} />}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          px: 2,
                          py: 0.5,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          }
                        }}
                      >
                        {t.flightForm.copy}
                      </Button>
                    </Box>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                        borderRadius: 2,
                        direction: 'rtl'
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          fontWeight: 'medium',
                          lineHeight: 1.6,
                          color: 'text.primary'
                        }}
                      >
                        {generatedText}
                      </Typography>
                    </Paper>
                  </Box>

          {/* English Message */}
          {generatedEnglishText && (
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        mb: 2 
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 'bold',
                          color: 'text.primary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          🇺🇸 {t.flightForm.englishMessage}
                        </Typography>
                        <Button
                          onClick={copyEnglishText}
                          size="small"
                          startIcon={<Copy size={14} />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            px: 2,
                            py: 0.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            }
                          }}
                        >
                          {t.flightForm.copy}
                        </Button>
                      </Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          borderRadius: 2,
                          direction: 'ltr'
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            fontWeight: 'medium',
                            lineHeight: 1.6,
                            color: 'text.primary'
                          }}
                        >
                          {generatedEnglishText}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              )}

              {/* Flight Not Found Warning */}
              {formData.flightNumber && !memoizedFlightRoutes.some(route => route.flightNumber === formData.flightNumber) && (
                <Alert 
                  severity="warning"
                  icon={<AlertTriangle size={16} />}
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    textAlign: language === 'he' ? 'right' : 'left',
                    direction: language === 'he' ? 'rtl' : 'ltr'
                  }}>
                    {t.flightForm.flightNotFound}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    mb: 1,
                    textAlign: language === 'he' ? 'right' : 'left',
                    direction: language === 'he' ? 'rtl' : 'ltr'
                  }}>
                    {t.flightForm.flightNotFoundMessage}
                  </Typography>
                  <Typography variant="body2" sx={{
                    textAlign: language === 'he' ? 'right' : 'left',
                    direction: language === 'he' ? 'rtl' : 'ltr'
                  }}>
                    {t.flightForm.checkFlightNumber}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Date Picker Popover */}
      <Popover
        open={Boolean(datePickerAnchor)}
        anchorEl={datePickerAnchor}
        onClose={handleDatePickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
          }
        }}
      >
        <Box sx={{ p: 2, minWidth: 280 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#667eea', fontWeight: 'bold' }}>
            {activeDateField === 'originalDate' ? t.flightForm.originalDate : t.flightForm.newDate}
          </Typography>
          
          {/* Simple Date Picker */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Year Selector */}
            <FormControl fullWidth size="small">
              <InputLabel>{t.flightForm.datePicker.year}</InputLabel>
              <Select
                value={activeDateField ? new Date(formData[activeDateField]).getFullYear() : new Date().getFullYear()}
                onChange={(e) => {
                  if (activeDateField) {
                    const currentDate = new Date(formData[activeDateField]);
                    currentDate.setFullYear(Number(e.target.value));
                    handleDateSelect(currentDate);
                  }
                }}
                sx={{ borderRadius: 1 }}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 2).map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Month Selector */}
            <FormControl fullWidth size="small">
              <InputLabel>{t.flightForm.datePicker.month}</InputLabel>
              <Select
                value={activeDateField ? new Date(formData[activeDateField]).getMonth() : new Date().getMonth()}
                onChange={(e) => {
                  if (activeDateField) {
                    const currentDate = new Date(formData[activeDateField]);
                    currentDate.setMonth(Number(e.target.value));
                    handleDateSelect(currentDate);
                  }
                }}
                sx={{ borderRadius: 1 }}
              >
                {[
                  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
                ].map((month, index) => (
                  <MenuItem key={index} value={index}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Day Selector */}
            <FormControl fullWidth size="small">
              <InputLabel>{t.flightForm.datePicker.day}</InputLabel>
              <Select
                value={activeDateField ? new Date(formData[activeDateField]).getDate() : new Date().getDate()}
                onChange={(e) => {
                  if (activeDateField) {
                    const currentDate = new Date(formData[activeDateField]);
                    currentDate.setDate(Number(e.target.value));
                    handleDateSelect(currentDate);
                  }
                }}
                sx={{ borderRadius: 1 }}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              size="small"
              onClick={() => handleDateSelect(new Date())}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 1,
                px: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
              >
                {t.flightForm.datePicker.today}
              </Button>
            <Button
              size="small"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateSelect(tomorrow);
              }}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: 1,
                px: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0ea472 0%, #047857 100%)',
                }
              }}
              >
                {t.flightForm.datePicker.tomorrow}
              </Button>
          </Box>
        </Box>
      </Popover>

      {/* Copy Toast using Portal */}
      {showCopyToast && copyButtonRef && createPortal(
        <Box
          sx={{
            position: 'absolute',
            top: (copyButtonRef.offsetTop || 0) - 50,
            left: (copyButtonRef.offsetLeft || 0) + (copyButtonRef.offsetWidth || 0) + 10,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: '1px solid rgba(5, 150, 105, 0.3)',
            fontSize: '0.875rem',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CheckCircle size={16} />
          <Typography variant="body2" sx={{ 
            fontWeight: 'inherit',
            textAlign: language === 'he' ? 'right' : 'left',
            direction: language === 'he' ? 'rtl' : 'ltr'
          }}>
            {t.common.copy}!
          </Typography>
        </Box>,
        (copyButtonRef.offsetParent as Element) || document.body
      )}
    </Box>
  );
};

export default FlightForm;