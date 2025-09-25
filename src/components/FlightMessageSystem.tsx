import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import Statistics from './Statistics';
import TemplateManager from './TemplateManager';
import CombinedDestinationsTable from './CombinedDestinationsTable';
import FlightForm from './FlightForm';
import DataUpdater from './DataUpdater';
import VariableManager from './VariableManager';
import SentMessages from './SentMessages';
import UserManagement from './UserManagement';
import UserSettings from './UserSettings';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Container,
  Chip,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Plane, 
  MapPin, 
  FileText, 
  BarChart3, 
  Database, 
  Settings,
  MessageSquare,
  Shield
} from 'lucide-react';

const FlightMessageSystem: React.FC = () => {
  const { templates, cities, flightRoutes } = useAppSelector(
    useMemo(
      () => (state) => ({
        templates: state.templates.templates,
        cities: state.cities.cities,
        flightRoutes: state.flightRoutes.routes,
      }),
      []
    )
  );

  // Memoize the data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => ({
    templates: templates || [],
    cities: cities || [],
    flightRoutes: flightRoutes || [],
  }), [templates, cities, flightRoutes]);

  const { t } = useLanguage();
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('flights');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Listen for navigation events from other components
  React.useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      if (typeof event.detail === 'string') {
        setActiveTab(event.detail);
      } else if (event.detail && event.detail.tab) {
        setActiveTab(event.detail.tab);
        // Store route data for the destinations component
        if (event.detail.routeData) {
          localStorage.setItem('pendingRouteData', JSON.stringify(event.detail.routeData));
        }
      } else if (event.detail && event.detail.tabId) {
        setActiveTab(event.detail.tabId);
      }
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    return () => window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
  }, []);

  const tabs = [
    { 
      id: 'flights', 
      label: t.navigation.flights, 
      icon: Plane,
      description: 'יצירת הודעות טיסה'
    },
    { 
      id: 'destinations', 
      label: t.navigation.destinations, 
      icon: MapPin,
      description: 'ניהול יעדים'
    },
    { 
      id: 'templates', 
      label: t.navigation.templates, 
      icon: FileText,
      description: 'ניהול תבניות'
    },
    { 
      id: 'statistics', 
      label: t.navigation.statistics, 
      icon: BarChart3,
      description: 'סטטיסטיקות'
    },
    { 
      id: 'sent-messages', 
      label: t.navigation.sentMessages, 
      icon: MessageSquare,
      description: 'הודעות שנשלחו'
    },
    { 
      id: 'user-settings', 
      label: 'הגדרות אישיות', 
      icon: Settings,
      description: 'הגדרות חשבון וסיסמה'
    },
    ...(userData?.role === 'admin' ? [
      { 
        id: 'data-updater', 
        label: t.flightForm.dataUpdater, 
        icon: Database,
        description: 'עדכון נתונים',
        adminOnly: true
      },
      { 
        id: 'variables', 
        label: t.navigation.variables, 
        icon: Settings,
        description: 'ניהול משתנים',
        adminOnly: true
      },
      { 
        id: 'user-management', 
        label: t.navigation.userManagement, 
        icon: Shield,
        description: 'ניהול משתמשים',
        adminOnly: true
      }
    ] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'flights':
        return (
          <div className="space-y-6">
            <FlightForm cities={memoizedData.cities} flightRoutes={memoizedData.flightRoutes} templates={memoizedData.templates} />
          </div>
        );
      case 'destinations':
        return <CombinedDestinationsTable cities={memoizedData.cities} />;
      case 'templates':
        return <TemplateManager />;
      case 'statistics':
        return <Statistics />;
      case 'sent-messages':
        return <SentMessages />;
      case 'data-updater':
        if (userData?.role !== 'admin') {
          return (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">אין לך הרשאה לגשת לעמוד זה</h2>
              <p className="text-gray-600">עמוד זה זמין רק למשתמשים מסוג אדמין</p>
            </div>
          );
        }
        return <DataUpdater />;
      case 'variables':
        if (userData?.role !== 'admin') {
          return (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">אין לך הרשאה לגשת לעמוד זה</h2>
              <p className="text-gray-600">עמוד זה זמין רק למשתמשים מסוג אדמין</p>
            </div>
          );
        }
        return <VariableManager />;
      case 'user-management':
        if (userData?.role !== 'admin') {
          return (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">אין לך הרשאה לגשת לעמוד זה</h2>
              <p className="text-gray-600">עמוד זה זמין רק למשתמשים מסוג אדמין</p>
            </div>
          );
        }
        return <UserManagement />;
      case 'user-settings':
        return <UserSettings />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Navigation Section */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: { xs: 1, sm: 2 },
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 2 }
          }}>
            {/* Navigation Tabs */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flex: 1,
              minWidth: 0
            }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                sx={{
                  '& .MuiTabs-indicator': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    minHeight: 48,
                    px: 2,
                    '&.Mui-selected': {
                      color: '#667eea'
                    }
                  }
                }}
              >
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <Tab
                      key={tab.id}
                      value={tab.id}
                      label={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          flexDirection: isMobile ? 'column' : 'row'
                        }}>
                          <IconComponent size={isMobile ? 20 : 18} />
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: isMobile ? 'center' : 'flex-start',
                            gap: 0.25
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                              {tab.label}
                            </Typography>
                            {!isMobile && (
                              <Typography variant="caption" sx={{ 
                                opacity: 0.7, 
                                fontSize: '0.7rem',
                                lineHeight: 1
                              }}>
                                {tab.description}
                              </Typography>
                            )}
                          </Box>
                          {tab.adminOnly && (
                            <Chip
                              label="Admin"
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: '0.6rem',
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                color: '#1976d2',
                                '& .MuiChip-label': {
                                  px: 0.5
                                }
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  );
                })}
              </Tabs>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Content */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 3,
          overflow: 'hidden',
          minHeight: '60vh',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          p: 3, 
          flex: 1, 
          overflow: 'auto',
          position: 'relative',
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
          {renderContent()}
        </Box>
      </Paper>
    </Container>
  );
};

export default FlightMessageSystem;