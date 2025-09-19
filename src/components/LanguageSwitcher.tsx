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
      <Globe className="h-4 w-4 text-gray-500" style={{ marginLeft: '16px' }} />
      <div className="flex bg-gray-100 rounded-md p-0.5">
        <button
          onClick={() => handleLanguageChange('he')}
          className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
            language === 'he'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          עב
        </button>
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
            language === 'en'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;

