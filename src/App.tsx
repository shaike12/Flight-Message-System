import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import FlightMessageSystem from './components/FlightMessageSystem';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            <FlightMessageSystem />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
