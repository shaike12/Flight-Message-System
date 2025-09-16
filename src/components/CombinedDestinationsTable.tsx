import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addCity, updateCity, deleteCity } from '../store/slices';
import { addFlightRoute, updateFlightRoute, deleteFlightRoute, fetchFlightRoutes } from '../store/slices/flightRoutesSlice';
import { City, FlightRoute } from '../types';
import { MapPin, Plane, Plus, Edit2, Trash2, Save, X, Globe, Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CombinedDestinationsTableProps {
  cities: City[];
}

interface CombinedRow {
  id: string;
  type: 'city' | 'route';
  data: City | FlightRoute;
}

const CombinedDestinationsTable: React.FC<CombinedDestinationsTableProps> = ({ cities }) => {
  const dispatch = useAppDispatch();
  const { routes: flightRoutes, loading, error } = useAppSelector(state => state.flightRoutes);
  const elAlCities = cities.filter(city => city.isElAlDestination);

  // Fetch flight routes on component mount
  useEffect(() => {
    dispatch(fetchFlightRoutes());
  }, [dispatch]);
  
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [originalFlightNumber, setOriginalFlightNumber] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addType, setAddType] = useState<'city' | 'route'>('city');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cityEditForm, setCityEditForm] = useState({
    code: '',
    name: '',
    englishName: '',
    country: '',
    isElAlDestination: true
  });

  const [routeEditForm, setRouteEditForm] = useState({
    flightNumber: '',
    departureCity: '',
    departureCityHebrew: '',
    departureCityEnglish: '',
    arrivalCity: '',
    arrivalCityHebrew: '',
    arrivalCityEnglish: '',
    airline: 'ELAL' as 'ELAL' | 'Sundor'
  });

  // Create combined data - only flight routes now, sorted automatically
  const combinedData: CombinedRow[] = React.useMemo(() => {
    return flightRoutes.map(route => ({
      id: `route-${route.flightNumber}`,
      type: 'route' as const,
      data: route
    })).sort((a, b) => {
      // Sort by flight number numerically
      const numA = parseInt((a.data as FlightRoute).flightNumber);
      const numB = parseInt((b.data as FlightRoute).flightNumber);
      return numA - numB;
    });
  }, [flightRoutes]);

  const getCityName = (cityCode: string) => {
    const city = cities.find(c => c.code === cityCode);
    return city ? city.name : cityCode;
  };

  const getCityEnglishName = (cityCode: string) => {
    const city = cities.find(c => c.code === cityCode);
    return city ? city.englishName : cityCode;
  };

  // City handlers
  const handleEditCity = (city: City) => {
    setEditingItem(`city-${city.code}`);
    setCityEditForm({
      code: city.code,
      name: city.name,
      englishName: city.englishName,
      country: city.country,
      isElAlDestination: city.isElAlDestination
    });
  };

  const handleSaveCity = () => {
    if (editingItem?.startsWith('city-')) {
      dispatch(updateCity(cityEditForm));
    } else {
      dispatch(addCity(cityEditForm));
    }
    setEditingItem(null);
    setIsAddingNew(false);
    setCityEditForm({
      code: '',
      name: '',
      englishName: '',
      country: '',
      isElAlDestination: true
    });
  };

  const handleDeleteCity = (cityCode: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את היעד?')) {
      dispatch(deleteCity(cityCode));
    }
  };

  // Route handlers
  const handleEditRoute = (route: FlightRoute) => {
    setEditingItem(`route-${route.flightNumber}`);
    setOriginalFlightNumber(route.flightNumber);
    setRouteEditForm({
      flightNumber: route.flightNumber,
      departureCity: route.departureCity,
      departureCityHebrew: route.departureCityHebrew,
      departureCityEnglish: route.departureCityEnglish,
      arrivalCity: route.arrivalCity,
      arrivalCityHebrew: route.arrivalCityHebrew,
      arrivalCityEnglish: route.arrivalCityEnglish,
      airline: route.airline
    });
  };

  const handleSaveRoute = () => {
    if (!routeEditForm.flightNumber || !routeEditForm.departureCity || !routeEditForm.arrivalCity) {
      alert('אנא מלא את כל השדות הנדרשים');
      return;
    }

    // Validate flight number - only digits, max 4 characters
    if (!/^\d{1,4}$/.test(routeEditForm.flightNumber)) {
      alert('מספר הטיסה חייב להכיל רק ספרות (1-4 ספרות)');
      return;
    }

    const routeData = {
      ...routeEditForm,
    };

    if (editingItem?.startsWith('route-')) {
      // Find the route to update by original flight number
      const routeToUpdate = flightRoutes.find(route => route.flightNumber === originalFlightNumber);
      if (routeToUpdate) {
        dispatch(updateFlightRoute({
          id: routeToUpdate.id,
          route: routeData
        }));
      }
    } else {
      // Check if flight number already exists when adding new route
      const existingRoute = flightRoutes.find(route => route.flightNumber === routeEditForm.flightNumber);
      if (existingRoute) {
        alert(`מספר הטיסה ${routeEditForm.flightNumber} כבר קיים במערכת. אנא בחר מספר טיסה אחר.`);
        return;
      }
      dispatch(addFlightRoute(routeData));
    }
    setEditingItem(null);
    setOriginalFlightNumber('');
    setIsAddingNew(false);
    setRouteEditForm({
      flightNumber: '',
      departureCity: '',
      departureCityHebrew: '',
      departureCityEnglish: '',
      arrivalCity: '',
      arrivalCityHebrew: '',
      arrivalCityEnglish: '',
      airline: 'ELAL' as 'ELAL' | 'Sundor'
    });
  };

  const handleDeleteRoute = (flightNumber: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את מסלול הטיסה?')) {
      const routeToDelete = flightRoutes.find(route => route.flightNumber === flightNumber);
      if (routeToDelete) {
        dispatch(deleteFlightRoute(routeToDelete.id));
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAddingNew(false);
    setCityEditForm({
      code: '',
      name: '',
      englishName: '',
      country: '',
      isElAlDestination: true
    });
    setRouteEditForm({
      flightNumber: '',
      departureCity: '',
      departureCityHebrew: '',
      departureCityEnglish: '',
      arrivalCity: '',
      arrivalCityHebrew: '',
      arrivalCityEnglish: '',
      airline: 'ELAL' as 'ELAL' | 'Sundor'
    });
  };

  const handleAddNew = (type: 'city' | 'route') => {
    setIsAddingNew(true);
    setAddType(type);
    if (type === 'city') {
      setCityEditForm({
        code: '',
        name: '',
        englishName: '',
        country: '',
        isElAlDestination: true
      });
    } else {
      setRouteEditForm({
        flightNumber: '',
        departureCity: '',
        departureCityHebrew: '',
        departureCityEnglish: '',
        arrivalCity: '',
        arrivalCityHebrew: '',
        arrivalCityEnglish: '',
        airline: 'ELAL' as 'ELAL' | 'Sundor'
      });
    }
  };

  // File upload handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      alert('אנא בחר קובץ Excel (.xlsx, .xls) או CSV');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Parse the file on the frontend
      let content: string;
      if (file.name.endsWith('.csv')) {
        content = await file.text();
      } else {
        // For Excel files, read as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        content = arrayBuffer.toString();
      }
      const routes = parseFlightRoutesFile(content, file.name);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Check for existing routes and filter out duplicates
      const existingFlightNumbers = new Set(flightRoutes.map(route => route.flightNumber));
      const newRoutes = routes.filter(route => !existingFlightNumbers.has(route.flightNumber));
      const duplicateRoutes = routes.filter(route => existingFlightNumbers.has(route.flightNumber));

      if (duplicateRoutes.length > 0) {
        const duplicateNumbers = duplicateRoutes.map(route => route.flightNumber).join(', ');
        alert(`נמצאו ${duplicateRoutes.length} טיסות שכבר קיימות במערכת: ${duplicateNumbers}\nרק ${newRoutes.length} טיסות חדשות יועלו.`);
      }

      // Add only new routes to Firebase
      let addedCount = 0;
      for (const route of newRoutes) {
        try {
          await dispatch(addFlightRoute(route));
          addedCount++;
        } catch (error) {
          console.error('Error adding route:', error);
        }
      }

      if (newRoutes.length > 0) {
        alert(`הועלו בהצלחה ${addedCount} מסלולי טיסות חדשים!`);
      } else {
        alert('לא נמצאו טיסות חדשות להעלאה.');
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('שגיאה בהעלאת הקובץ');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseFlightRoutesFile = (content: string, fileName: string): Omit<FlightRoute, 'id'>[] => {
    const routes: Omit<FlightRoute, 'id'>[] = [];
    
    if (fileName.endsWith('.csv')) {
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim());
        if (values.length >= 6) {
          routes.push({
            flightNumber: values[0],
            departureCity: values[1],
            departureCityHebrew: values[2],
            departureCityEnglish: values[3],
            arrivalCity: values[4],
            arrivalCityHebrew: values[5],
            arrivalCityEnglish: values[6],
            airline: values[7] === 'Sundor' ? 'Sundor' : 'ELAL'
          });
        }
      }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        const workbook = XLSX.read(content, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row && row.length >= 6) {
            routes.push({
              flightNumber: String(row[0] || '').trim(),
              departureCity: String(row[1] || '').trim(),
              departureCityHebrew: String(row[2] || '').trim(),
              departureCityEnglish: String(row[3] || '').trim(),
              arrivalCity: String(row[4] || '').trim(),
              arrivalCityHebrew: String(row[5] || '').trim(),
              arrivalCityEnglish: String(row[6] || '').trim(),
              airline: String(row[7] || 'ELAL').trim() === 'Sundor' ? 'Sundor' : 'ELAL'
            });
          }
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        throw new Error('שגיאה בקריאת קובץ Excel');
      }
    }
    
    return routes;
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'מספר טיסה,קוד עיר יציאה,שם עיר יציאה עברית,שם עיר יציאה אנגלית,קוד עיר נחיתה,שם עיר נחיתה עברית,שם עיר נחיתה אנגלית,חברת תעופה\n1,TLV,תל אביב,Tel Aviv,JFK,ניו יורק,New York,ELAL\n2,TLV,תל אביב,Tel Aviv,LAX,לוס אנג\'לס,Los Angeles,ELAL\n3,TLV,תל אביב,Tel Aviv,DXB,דובאי,Dubai,Sundor';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'flight_routes_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <div className="text-lg text-gray-600">טוען מסלולי טיסות...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <div className="text-lg text-red-600">שגיאה בטעינת מסלולי הטיסות: {error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Plane className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                מסלולי טיסות של אל על
              </h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                הורד תבנית
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'מעלה...' : 'העלה קובץ'}
              </button>
              <button
                onClick={() => handleAddNew('route')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                הוסף מסלול חדש
              </button>
            </div>
          </div>

          {/* File Upload Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Upload className="h-5 w-5 text-green-400" />
                </div>
                <div className="mr-3 flex-1">
                  <div className="text-sm font-medium text-green-800">
                    מעלה קובץ...
                  </div>
                  <div className="mt-2">
                    <div className="bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {uploadProgress}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-blue-800">
                  איך זה עובד
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    טבלה זו מכילה את כל מסלולי הטיסות של אל על וסנדור. 
                    כל מסלול מציג את עיר היציאה והנחיתה עם השמות בעברית ובאנגלית.
                    הזן מספר טיסה בטופס והערים יתמלאו אוטומטית.
                  </p>
                  <div className="mt-3">
                    <p className="font-medium">העלאת קבצים:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>לחץ על "הורד תבנית" כדי לקבל קובץ CSV לדוגמה</li>
                      <li>מלא את הקובץ עם מסלולי הטיסות שלך (מספר טיסה, קוד עיר יציאה, שם עברית, שם אנגלית, קוד עיר נחיתה, שם עברית, שם אנגלית, חברת תעופה)</li>
                      <li>לחץ על "העלה קובץ" כדי להוסיף את המסלולים לטבלה</li>
                      <li>תומך בקבצי CSV, Excel (.xlsx, .xls)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מספר טיסה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    עיר יציאה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    עיר נחיתה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    חברת תעופה
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Add New Row - moved to top */}
                {isAddingNew && (
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="mr-3">
                          <input
                            type="text"
                            value={routeEditForm.flightNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setRouteEditForm({...routeEditForm, flightNumber: value});
                            }}
                            placeholder="מספר טיסה"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={routeEditForm.departureCity}
                          onChange={(e) => setRouteEditForm({...routeEditForm, departureCity: e.target.value})}
                          placeholder="קוד עיר יציאה (TLV)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                        <input
                          type="text"
                          value={routeEditForm.departureCityHebrew}
                          onChange={(e) => setRouteEditForm({...routeEditForm, departureCityHebrew: e.target.value})}
                          placeholder="שם עברית"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                        <input
                          type="text"
                          value={routeEditForm.departureCityEnglish}
                          onChange={(e) => setRouteEditForm({...routeEditForm, departureCityEnglish: e.target.value})}
                          placeholder="English name"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={routeEditForm.arrivalCity}
                          onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCity: e.target.value})}
                          placeholder="קוד עיר נחיתה (JFK)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                        <input
                          type="text"
                          value={routeEditForm.arrivalCityHebrew}
                          onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityHebrew: e.target.value})}
                          placeholder="שם עברית"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                        <input
                          type="text"
                          value={routeEditForm.arrivalCityEnglish}
                          onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityEnglish: e.target.value})}
                          placeholder="English name"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={routeEditForm.airline}
                        onChange={(e) => setRouteEditForm({...routeEditForm, airline: e.target.value as 'ELAL' | 'Sundor'})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      >
                        <option value="ELAL">EL AL</option>
                        <option value="Sundor">Sundor</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={handleSaveRoute}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                
                {combinedData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {/* Flight Number Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Plane className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="mr-3">
                          <div className="text-sm font-medium text-gray-900 text-right">
                            {editingItem === row.id ? (
                              <input
                                type="text"
                                value={routeEditForm.flightNumber}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  setRouteEditForm({...routeEditForm, flightNumber: value});
                                }}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="1234"
                              />
                            ) : (
                              `LY${(row.data as FlightRoute).flightNumber.padStart(3, '0')}`
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Departure City Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 text-right">
                        {editingItem === row.id ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={routeEditForm.departureCity}
                              onChange={(e) => setRouteEditForm({...routeEditForm, departureCity: e.target.value})}
                              placeholder="קוד עיר יציאה (TLV)"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            />
                            <input
                              type="text"
                              value={routeEditForm.departureCityHebrew}
                              onChange={(e) => setRouteEditForm({...routeEditForm, departureCityHebrew: e.target.value})}
                              placeholder="שם עברית"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            />
                            <input
                              type="text"
                              value={routeEditForm.departureCityEnglish}
                              onChange={(e) => setRouteEditForm({...routeEditForm, departureCityEnglish: e.target.value})}
                              placeholder="English name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-right">{(row.data as FlightRoute).departureCityHebrew}</div>
                            <div className="text-xs text-gray-500 text-right">{(row.data as FlightRoute).departureCityEnglish}</div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Arrival City Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 text-right">
                        {editingItem === row.id ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={routeEditForm.arrivalCity}
                              onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCity: e.target.value})}
                              placeholder="קוד עיר נחיתה (JFK)"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            />
                            <input
                              type="text"
                              value={routeEditForm.arrivalCityHebrew}
                              onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityHebrew: e.target.value})}
                              placeholder="שם עברית"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            />
                            <input
                              type="text"
                              value={routeEditForm.arrivalCityEnglish}
                              onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityEnglish: e.target.value})}
                              placeholder="English name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-right">{(row.data as FlightRoute).arrivalCityHebrew}</div>
                            <div className="text-xs text-gray-500 text-right">{(row.data as FlightRoute).arrivalCityEnglish}</div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Airline Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 text-right">
                        {editingItem === row.id ? (
                          <select
                            value={routeEditForm.airline}
                            onChange={(e) => setRouteEditForm({...routeEditForm, airline: e.target.value as 'ELAL' | 'Sundor'})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                          >
                            <option value="ELAL">EL AL</option>
                            <option value="Sundor">Sundor</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (row.data as FlightRoute).airline === 'ELAL' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {(row.data as FlightRoute).airline === 'ELAL' ? 'EL AL' : 'Sundor'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {editingItem === row.id ? (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={handleSaveRoute}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditRoute(row.data as FlightRoute)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute((row.data as FlightRoute).flightNumber)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedDestinationsTable;
