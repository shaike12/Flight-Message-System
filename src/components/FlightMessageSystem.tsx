import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFlights, fetchTemplates, fetchCities, fetchFlightRoutes } from '../store/slices';
import FlightForm from './FlightForm';
import TemplateManager from './TemplateManager';
import FlightList from './FlightList';
import CombinedDestinationsTable from './CombinedDestinationsTable';
import MessageHistory from './MessageHistory';
import Statistics from './Statistics';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { Plane, FileText, MessageSquare, List, MapPin, History, BarChart3 } from 'lucide-react';

type TabType = 'flights' | 'templates' | 'list' | 'destinations' | 'history' | 'statistics';

const FlightMessageSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('flights');
  const { t, isRTL } = useLanguage();
  
  const { flights } = useAppSelector((state) => state.flights);
  const { templates } = useAppSelector((state) => state.templates);
  const { cities } = useAppSelector((state) => state.cities);
  const { routes: flightRoutes } = useAppSelector((state) => state.flightRoutes);

  useEffect(() => {
    dispatch(fetchFlights());
    dispatch(fetchTemplates());
    dispatch(fetchCities());
    dispatch(fetchFlightRoutes());
  }, [dispatch]);

  const tabs = [
    { id: 'flights' as TabType, name: t.navigation.createMessage, icon: MessageSquare },
    { id: 'templates' as TabType, name: t.navigation.manageTemplates, icon: FileText },
    { id: 'list' as TabType, name: 'דחיות של טיסות', icon: List },
    { id: 'destinations' as TabType, name: t.navigation.manageDestinations, icon: MapPin },
    { id: 'history' as TabType, name: t.navigation.messageHistory, icon: History },
    { id: 'statistics' as TabType, name: t.navigation.statistics, icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'flights':
        return <FlightForm cities={cities} flightRoutes={flightRoutes} templates={templates} />;
      case 'templates':
        return <TemplateManager templates={templates} />;
      case 'list':
        return <FlightList flights={flights} />;
      case 'destinations':
        return <CombinedDestinationsTable cities={cities} />;
      case 'history':
        return <MessageHistory />;
      case 'statistics':
        return <Statistics />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-blue-600" />
              <h1 className={`${isRTL ? 'ml-3' : 'mr-3'} text-2xl font-bold text-gray-900`}>
                {isRTL ? 'מערכת הודעות דחיית טיסות - אל על' : 'EL AL Flight Delay Message System'}
              </h1>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default FlightMessageSystem;
