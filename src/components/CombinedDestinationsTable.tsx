import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addCity, updateCity, deleteCity } from '../store/slices';
import { addFlightRoute, updateFlightRoute, deleteFlightRoute, fetchFlightRoutes } from '../store/slices/flightRoutesSlice';
import { City, FlightRoute } from '../types';
import { MapPin, Plane, Plus, Edit2, Trash2, Save, X, Search, Info, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Alert, 
  CircularProgress, 
  Stack,
  Chip,
  Avatar,
  Container,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';

interface CombinedDestinationsTableProps {
  cities: City[];
}

interface CombinedRow {
  id: string;
  type: 'city' | 'route';
  data: City | FlightRoute;
}

const CombinedDestinationsTable: React.FC<CombinedDestinationsTableProps> = ({ cities }) => {
  const { t, language } = useLanguage();
  const dispatch = useAppDispatch();
  const { routes: flightRoutes, loading, error } = useAppSelector((state) => state.flightRoutes);

  // Fetch flight routes on component mount
  useEffect(() => {
    dispatch(fetchFlightRoutes());
  }, [dispatch]);
  
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [originalFlightNumber, setOriginalFlightNumber] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Check for pending route data on component mount
  React.useEffect(() => {
    const pendingRouteData = localStorage.getItem('pendingRouteData');
    if (pendingRouteData) {
      try {
        const routeData = JSON.parse(pendingRouteData);
        if (routeData.flightNumber) {
          // Auto-open the route form with pending data
          setRouteEditForm({
            flightNumber: routeData.flightNumber || '',
            departureCity: routeData.departureCity || '',
            departureCityHebrew: routeData.departureCityHebrew || '',
            departureCityEnglish: routeData.departureCityEnglish || '',
            arrivalCity: routeData.arrivalCity || '',
            arrivalCityHebrew: routeData.arrivalCityHebrew || '',
            arrivalCityEnglish: routeData.arrivalCityEnglish || '',
            airline: routeData.airline || 'ELAL'
          });
          // Open the modal automatically
          setModalMode('add');
          setIsModalOpen(true);
          // Clear the pending data after using it
          localStorage.removeItem('pendingRouteData');
        }
      } catch (error) {
        console.error('Error parsing pending route data:', error);
        localStorage.removeItem('pendingRouteData');
      }
    }
  }, []);
  
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

  // Create combined data - only flight routes now, sorted automatically and filtered by search
  const combinedData: CombinedRow[] = React.useMemo(() => {
    let filteredRoutes = flightRoutes;
    
    // Filter by search term if provided
    if (searchTerm.trim()) {
      filteredRoutes = flightRoutes.filter((route: FlightRoute) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          route.flightNumber.toLowerCase().includes(searchLower) ||
          route.departureCity.toLowerCase().includes(searchLower) ||
          route.arrivalCity.toLowerCase().includes(searchLower) ||
          route.departureCityHebrew.toLowerCase().includes(searchLower) ||
          route.arrivalCityHebrew.toLowerCase().includes(searchLower) ||
          route.departureCityEnglish.toLowerCase().includes(searchLower) ||
          route.arrivalCityEnglish.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filteredRoutes.map((route: FlightRoute) => ({
      id: `route-${route.flightNumber}`,
      type: 'route' as const,
      data: route
    })).sort((a: CombinedRow, b: CombinedRow) => {
      // Sort by flight number numerically
      const numA = parseInt((a.data as FlightRoute).flightNumber);
      const numB = parseInt((b.data as FlightRoute).flightNumber);
      return numA - numB;
    });
  }, [flightRoutes, searchTerm]);


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
    setModalMode('edit');
    setIsModalOpen(true);
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
      const routeToUpdate = flightRoutes.find((route: FlightRoute) => route.flightNumber === originalFlightNumber);
      if (routeToUpdate) {
        dispatch(updateFlightRoute({
          id: routeToUpdate.id,
          route: routeData
        }));
      }
    } else {
      // Check if flight number already exists when adding new route
      const existingRoute = flightRoutes.find((route: FlightRoute) => route.flightNumber === routeEditForm.flightNumber);
      if (existingRoute) {
        alert(`מספר הטיסה ${routeEditForm.flightNumber} כבר קיים במערכת. אנא בחר מספר טיסה אחר.`);
        return;
      }
      dispatch(addFlightRoute(routeData));
    }
    setEditingItem(null);
    setOriginalFlightNumber('');
    setIsModalOpen(false);
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
      const routeToDelete = flightRoutes.find((route: FlightRoute) => route.flightNumber === flightNumber);
      if (routeToDelete) {
        dispatch(deleteFlightRoute(routeToDelete.id));
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsModalOpen(false);
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
    setModalMode('add');
    setIsModalOpen(true);
    if (type === 'city') {
      setCityEditForm({
        code: '',
        name: '',
        englishName: '',
        country: '',
        isElAlDestination: true
      });
    } else {
      // Check if there's pending route data from FlightForm
      const pendingRouteData = localStorage.getItem('pendingRouteData');
      if (pendingRouteData) {
        try {
          const routeData = JSON.parse(pendingRouteData);
          setRouteEditForm({
            flightNumber: routeData.flightNumber || '',
            departureCity: routeData.departureCity || '',
            departureCityHebrew: routeData.departureCityHebrew || '',
            departureCityEnglish: routeData.departureCityEnglish || '',
            arrivalCity: routeData.arrivalCity || '',
            arrivalCityHebrew: routeData.arrivalCityHebrew || '',
            arrivalCityEnglish: routeData.arrivalCityEnglish || '',
            airline: routeData.airline || 'ELAL'
          });
          // Open the modal automatically
          setModalMode('add');
          setIsModalOpen(true);
          // Clear the pending data after using it
          localStorage.removeItem('pendingRouteData');
        } catch (error) {
          console.error('Error parsing pending route data:', error);
          // Fallback to empty form
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
    }
  };




  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CircularProgress size={24} />
            <Typography variant="h6" sx={{ color: '#718096' }}>
              טוען מסלולי טיסות...
            </Typography>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          icon={<AlertCircle size={20} />}
          sx={{ 
            borderRadius: 3,
            '& .MuiAlert-message': {
              fontSize: '16px'
            }
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            שגיאה בטעינת מסלולי הטיסות
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, overflow: 'visible' }}>
      <Card sx={{ 
        minHeight: 'auto',
        height: 'auto',
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'visible'
      }}>
        {/* Header - Fixed */}
        <CardContent sx={{ flexShrink: 0, borderBottom: '1px solid #e5e7eb' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plane size={24} color="white" />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                  {t.destinationsTable.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#718096' }}>
                  {t.destinationsTable.subtitle}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
                onClick={() => handleAddNew('route')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 700,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {t.destinationsTable.addNewRoute}
            </Button>
          </Stack>

          {/* Search Field - Fixed */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder={t.destinationsTable.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#9ca3af" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <X size={16} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'white',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                    borderWidth: 2,
                  },
                },
              }}
            />
            {searchTerm && (
              <Typography variant="body2" sx={{ mt: 1, color: '#718096' }}>
                {t.destinationsTable.foundRoutes.replace('{count}', combinedData.length.toString()).replace('{searchTerm}', searchTerm)}
              </Typography>
            )}
          </Box>
        </CardContent>

        {/* Scrollable Content */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 3,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '&::-ms-overflow-style': {
            display: 'none',
          },
          '&': {
            scrollbarWidth: 'none',
          },
        }}>

          {/* Combined Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {/* Fixed Table Header */}
            <Table sx={{ minWidth: { xs: 600, sm: 800 } }}>
              <TableHead sx={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    color: '#374151',
                    borderBottom: '2px solid #e5e7eb',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 4px', sm: '16px' }
                  }}>
                    מספר טיסה
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    color: '#374151',
                    borderBottom: '2px solid #e5e7eb',
                    textAlign: 'center',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 4px', sm: '16px' }
                  }}>
                    {t.destinationsTable.departureCity}
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    color: '#374151',
                    borderBottom: '2px solid #e5e7eb',
                    textAlign: 'center',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 4px', sm: '16px' }
                  }}>
                    {t.destinationsTable.arrivalCity}
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    color: '#374151',
                    borderBottom: '2px solid #e5e7eb',
                    textAlign: 'center',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 4px', sm: '16px' }
                  }}>
                    חברת תעופה
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    color: '#374151',
                    borderBottom: '2px solid #e5e7eb',
                    textAlign: 'center',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 4px', sm: '16px' }
                  }}>
                    פעולות
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Add New Row - moved to top */}
                {false && (
                  <TableRow sx={{ backgroundColor: '#f0f9ff' }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#10b981', width: 32, height: 32 }}>
                          <Plus size={16} color="white" />
                        </Avatar>
                        <TextField
                          size="small"
                          value={routeEditForm.flightNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setRouteEditForm({...routeEditForm, flightNumber: value});
                          }}
                          placeholder="מספר טיסה"
                          sx={{ width: 100 }}
                          inputProps={{
                            maxLength: 4,
                            pattern: '[0-9]*',
                            inputMode: 'numeric'
                          }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={routeEditForm.departureCity}
                          onChange={(e) => setRouteEditForm({...routeEditForm, departureCity: e.target.value})}
                          placeholder="קוד יציאה (TLV)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                        <input
                          type="text"
                          value={routeEditForm.departureCityHebrew}
                          onChange={(e) => setRouteEditForm({...routeEditForm, departureCityHebrew: e.target.value})}
                          placeholder="יציאה (בעברית)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                        <input
                          type="text"
                          value={routeEditForm.departureCityEnglish}
                          onChange={(e) => setRouteEditForm({...routeEditForm, departureCityEnglish: e.target.value})}
                          placeholder="departure (english)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-left"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          value={routeEditForm.arrivalCity}
                          onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCity: e.target.value})}
                          placeholder="קוד עיר נחיתה (JFK)"
                          sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'right' } }}
                        />
                        <TextField
                          size="small"
                          value={routeEditForm.arrivalCityHebrew}
                          onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityHebrew: e.target.value})}
                          placeholder="שם עברית"
                          sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'right' } }}
                        />
                        <TextField
                          size="small"
                          value={routeEditForm.arrivalCityEnglish}
                          onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityEnglish: e.target.value})}
                          placeholder="English name"
                          sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' } }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                        value={routeEditForm.airline}
                        onChange={(e) => setRouteEditForm({...routeEditForm, airline: e.target.value as 'ELAL' | 'Sundor'})}
                          sx={{ borderRadius: 2, backgroundColor: 'white' }}
                        >
                          <MenuItem value="ELAL">EL AL</MenuItem>
                          <MenuItem value="Sundor">Sundor</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton onClick={handleSaveRoute} color="primary" sx={{ color: '#10b981' }}>
                          <Save size={20} />
                        </IconButton>
                        <IconButton onClick={handleCancel} color="error" sx={{ color: '#ef4444' }}>
                          <X size={20} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
                
                {combinedData.map((row) => (
                  <TableRow key={row.id} hover>
                    {/* Flight Number Column */}
                    <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#e0f2fe', width: 32, height: 32 }}>
                          <Plane size={16} color="#3b82f6" />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                            {editingItem === row.id ? (
                            <TextField
                              size="small"
                                value={routeEditForm.flightNumber}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  setRouteEditForm({...routeEditForm, flightNumber: value});
                                }}
                              sx={{ width: 100, textAlign: 'center' }}
                              inputProps={{
                                maxLength: 4,
                                pattern: '[0-9]*',
                                inputMode: 'numeric',
                                style: { textAlign: 'center' }
                              }}
                              />
                            ) : (
                              `LY${(row.data as FlightRoute).flightNumber.padStart(3, '0')}`
                            )}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Departure City Column */}
                    <TableCell sx={{ textAlign: 'center' }}>
                        {editingItem === row.id ? (
                        <Stack spacing={1}>
                          <TextField
                            size="small"
                              value={routeEditForm.departureCity}
                              onChange={(e) => setRouteEditForm({...routeEditForm, departureCity: e.target.value})}
                              placeholder="קוד יציאה (TLV)"
                            sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'right' } }}
                            />
                          <TextField
                            size="small"
                              value={routeEditForm.departureCityHebrew}
                              onChange={(e) => setRouteEditForm({...routeEditForm, departureCityHebrew: e.target.value})}
                              placeholder="שם עברית"
                            sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'right' } }}
                            />
                          <TextField
                            size="small"
                              value={routeEditForm.departureCityEnglish}
                              onChange={(e) => setRouteEditForm({...routeEditForm, departureCityEnglish: e.target.value})}
                              placeholder="English name"
                            sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' } }}
                          />
                        </Stack>
                      ) : (
                        <Stack>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {language === 'he' ? (row.data as FlightRoute).departureCityHebrew : (row.data as FlightRoute).departureCityEnglish}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#718096' }}>
                            {(row.data as FlightRoute).departureCity}
                          </Typography>
                        </Stack>
                      )}
                    </TableCell>

                    {/* Arrival City Column */}
                    <TableCell sx={{ textAlign: 'center' }}>
                        {editingItem === row.id ? (
                        <Stack spacing={1}>
                          <TextField
                            size="small"
                              value={routeEditForm.arrivalCity}
                              onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCity: e.target.value})}
                              placeholder="קוד עיר נחיתה (JFK)"
                            sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'right' } }}
                            />
                          <TextField
                            size="small"
                              value={routeEditForm.arrivalCityHebrew}
                              onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityHebrew: e.target.value})}
                              placeholder="שם עברית"
                            sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'right' } }}
                            />
                          <TextField
                            size="small"
                              value={routeEditForm.arrivalCityEnglish}
                              onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityEnglish: e.target.value})}
                              placeholder="English name"
                            sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' } }}
                          />
                        </Stack>
                      ) : (
                        <Stack>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {language === 'he' ? (row.data as FlightRoute).arrivalCityHebrew : (row.data as FlightRoute).arrivalCityEnglish}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#718096' }}>
                            {(row.data as FlightRoute).arrivalCity}
                          </Typography>
                        </Stack>
                      )}
                    </TableCell>

                    {/* Airline Column */}
                    <TableCell sx={{ textAlign: 'center' }}>
                        {editingItem === row.id ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={routeEditForm.airline}
                            onChange={(e) => setRouteEditForm({...routeEditForm, airline: e.target.value as 'ELAL' | 'Sundor'})}
                            sx={{ borderRadius: 2, backgroundColor: 'white' }}
                          >
                            <MenuItem value="ELAL">EL AL</MenuItem>
                            <MenuItem value="Sundor">Sundor</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip
                          label={(row.data as FlightRoute).airline === 'ELAL' ? 'EL AL' : 'Sundor'}
                          sx={{
                            backgroundColor: (row.data as FlightRoute).airline === 'ELAL' ? '#dbeafe' : '#dcfce7',
                            color: (row.data as FlightRoute).airline === 'ELAL' ? '#1e40af' : '#166534',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell sx={{ textAlign: 'center' }}>
                      {editingItem === row.id ? (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton onClick={handleSaveRoute} color="primary" sx={{ color: '#10b981' }}>
                            <Save size={20} />
                          </IconButton>
                          <IconButton onClick={handleCancel} color="error" sx={{ color: '#ef4444' }}>
                            <X size={20} />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton onClick={() => handleEditRoute(row.data as FlightRoute)} color="primary" sx={{ color: '#3b82f6' }}>
                            <Edit2 size={20} />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteRoute((row.data as FlightRoute).flightNumber)} color="error" sx={{ color: '#ef4444' }}>
                            <Trash2 size={20} />
                          </IconButton>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Card>

      {/* Modal for Add/Edit Route */}
      <Modal
        open={isModalOpen}
        onClose={handleCancel}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
          }
        }}
      >
        <Fade in={isModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '80%', md: '600px' },
              maxHeight: '90vh',
              overflow: 'auto',
              bgcolor: 'background.paper',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              '&::-ms-overflow-style': {
                display: 'none',
              },
              '&': {
                scrollbarWidth: 'none',
              },
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {modalMode === 'add' ? <Plus size={24} /> : <Edit2 size={24} />}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {modalMode === 'add' ? t.destinationsTable.addNewRoute : 'עריכת מסלול טיסה'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {modalMode === 'add' ? 'הוסף מסלול טיסה חדש למערכת' : 'ערוך פרטי מסלול הטיסה'}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleCancel}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <X size={24} />
              </IconButton>
            </Box>

            {/* Modal Content */}
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                {/* Flight Number */}
                <Box>
                  <TextField
                    fullWidth
                    label={t.destinationsTable.flightNumber}
                    value={routeEditForm.flightNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setRouteEditForm({...routeEditForm, flightNumber: value});
                    }}
                    placeholder={t.destinationsTable.enterFlightNumber}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Plane size={20} color="#667eea" />
                        </InputAdornment>
                      ),
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
                    }}
                  />
                </Box>

                {/* Airline */}
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>חברת תעופה</InputLabel>
                    <Select
                      value={routeEditForm.airline}
                      onChange={(e) => setRouteEditForm({...routeEditForm, airline: e.target.value as 'ELAL' | 'Sundor'})}
                      label={t.destinationsTable.airline}
                      sx={{
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      }}
                    >
                      <MenuItem value="ELAL">EL AL</MenuItem>
                      <MenuItem value="Sundor">Sundor</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Departure City */}
                <Box>
                  <TextField
                    fullWidth
                    label="יציאה (קוד)"
                    value={routeEditForm.departureCity}
                    onChange={(e) => setRouteEditForm({...routeEditForm, departureCity: e.target.value.toUpperCase()})}
                    placeholder="TLV"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={20} color="#667eea" />
                        </InputAdornment>
                      ),
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
                        textAlign: 'right',
                        direction: 'rtl'
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: 'right',
                        direction: 'rtl'
                      }
                    }}
                  />
                </Box>

                {/* Arrival City */}
                <Box>
                  <TextField
                    fullWidth
                    label="נחיתה (קוד)"
                    value={routeEditForm.arrivalCity}
                    onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCity: e.target.value.toUpperCase()})}
                    placeholder="JFK"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={20} color="#667eea" />
                        </InputAdornment>
                      ),
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
                        textAlign: 'right',
                        direction: 'rtl'
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: 'right',
                        direction: 'rtl'
                      }
                    }}
                  />
                </Box>

                {/* Departure City Hebrew */}
                <Box>
                  <TextField
                    fullWidth
                    label="יציאה (עברית)"
                    value={routeEditForm.departureCityHebrew}
                    onChange={(e) => setRouteEditForm({...routeEditForm, departureCityHebrew: e.target.value})}
                    placeholder="תל אביב"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={20} color="#667eea" />
                        </InputAdornment>
                      ),
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
                        textAlign: 'right',
                        direction: 'rtl'
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: 'right',
                        direction: 'rtl'
                      }
                    }}
                  />
                </Box>

               

                {/* Arrival City Hebrew */}
                <Box>
                  <TextField
                    fullWidth
                    label="נחיתה (עברית)"
                    value={routeEditForm.arrivalCityHebrew}
                    onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityHebrew: e.target.value})}
                    placeholder="ניו יורק"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={20} color="#667eea" />
                        </InputAdornment>
                      ),
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
                        textAlign: 'right',
                        direction: 'rtl'
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: 'right',
                        direction: 'rtl'
                      }
                    }}
                  />
                </Box>

                 {/* Departure City English */}
                 <Box>
                  <TextField
                    fullWidth
                    label="Departure (English)"
                    value={routeEditForm.departureCityEnglish}
                    onChange={(e) => setRouteEditForm({...routeEditForm, departureCityEnglish: e.target.value})}
                    placeholder="Tel Aviv"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={20} color="#667eea" />
                        </InputAdornment>
                      ),
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
                        textAlign: 'left',
                        direction: 'ltr'
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: 'right',
                        direction: 'rtl'
                      }
                    }}
                  />
                </Box>

                {/* Arrival City English */}
                <Box>
                  <TextField
                    fullWidth
                    label="Arrival (English)"
                    value={routeEditForm.arrivalCityEnglish}
                    onChange={(e) => setRouteEditForm({...routeEditForm, arrivalCityEnglish: e.target.value})}
                    placeholder="New York"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={20} color="#667eea" />
                        </InputAdornment>
                      ),
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
                        textAlign: 'left',
                        direction: 'ltr'
                      },
                      '& .MuiInputLabel-root': {
                        textAlign: 'right',
                        direction: 'rtl'
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Modal Actions */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<X size={20} />}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#6b7280',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb',
                    },
                    '& .MuiButton-startIcon': {
                      marginLeft: '10px'
                    }
                  }}
                >
                  ביטול
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveRoute}
                  startIcon={<Save size={20} />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiButton-startIcon': {
                      marginLeft: '10px'
                    }
                  }}
                >
                  {modalMode === 'add' ? 'הוסף מסלול' : 'שמור שינויים'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default CombinedDestinationsTable;
