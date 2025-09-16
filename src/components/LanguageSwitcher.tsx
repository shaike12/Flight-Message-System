import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: 'he' | 'en') => {
    setLanguage(newLanguage);
  };

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <Globe className="h-5 w-5 text-gray-600" />
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleLanguageChange('he')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            language === 'he'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          עברית
        </button>
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            language === 'en'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;

