/**
 * Flight Message System
 * © 2024 Shai Shmuel. All rights reserved.
 * 
 * A professional flight message management system built with React, Firebase, and Material UI.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import FlightMessageSystem from './components/FlightMessageSystem';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

function App() {
  return (
    <Provider store={store}>
      <CustomThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ErrorBoundary>
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Header />
                  <FlightMessageSystem />
                </div>
              </ProtectedRoute>
            </ErrorBoundary>
          </AuthProvider>
        </LanguageProvider>
      </CustomThemeProvider>
    </Provider>
  );
}

export default App;
