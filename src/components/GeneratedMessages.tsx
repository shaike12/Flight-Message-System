import React from 'react';
import { Copy, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GeneratedMessagesProps {
  generatedText: string;
  generatedEnglishText: string;
  isGenerating: boolean;
  error: string | null;
  copyHebrewText: () => void;
  copyEnglishText: () => void;
}

const GeneratedMessages: React.FC<GeneratedMessagesProps> = ({
  generatedText,
  generatedEnglishText,
  isGenerating,
  error,
  copyHebrewText,
  copyEnglishText
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 ml-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 ml-3"></div>
            <p className="text-blue-800">יוצר הודעה...</p>
          </div>
        </div>
      )}

      {/* Generated Messages */}
      {generatedText && !isGenerating && (
        <div className="space-y-4">
          {/* Hebrew Message */}
          <div>
            <div className="flex items-center justify-between mb-2" style={{ marginTop: '20px' }}>
              <label className="block text-sm font-medium text-gray-700" style={{ margin: '0px' }}>
                {t.flightForm.hebrewMessage}
              </label>
              <button
                onClick={copyHebrewText}
                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Copy className="h-3 w-3 ml-1" />
                {t.flightForm.copy}
              </button>
            </div>
            <div className="bg-white p-4 rounded-md border" dir="rtl">
              <pre className="whitespace-pre-wrap text-sm font-medium text-gray-900 text-right">
                {generatedText}
              </pre>
            </div>
          </div>

          {/* English Message */}
          {generatedEnglishText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700" style={{ margin: '0px' }}>
                  {t.flightForm.englishMessage}
                </label>
                <button
                  onClick={copyEnglishText}
                  className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Copy className="h-3 w-3 ml-1" />
                  {t.flightForm.copy}
                </button>
              </div>
              <div className="bg-white p-4 rounded-md border" dir="ltr">
                <pre className="whitespace-pre-wrap text-sm font-medium text-gray-900 text-left">
                  {generatedEnglishText}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneratedMessages;
