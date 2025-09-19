import React from 'react';
import { Plane, Calendar, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FlightFormFieldsProps {
  formData: {
    flightNumber: string;
    newFlightNumber: string;
    originalTime: string;
    newTime: string;
    originalDate: string;
    newDate: string;
    departureCity: string;
    arrivalCity: string;
    loungeOpenTime: string;
    counterOpenTime: string;
    counterCloseTime: string;
    internetCode: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: {[key: string]: string};
  templateParameters: Set<string>;
  allDestinations: Array<{code: string; name: string; englishName: string}>;
}

const FlightFormFields: React.FC<FlightFormFieldsProps> = ({
  formData,
  handleInputChange,
  errors,
  templateParameters,
  allDestinations
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Flight Number */}
      <div>
        <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700">
          <Plane className="inline h-4 w-4 ml-1" aria-hidden="true" />
          {t.flightForm.flightNumber}
        </label>
        <input
          type="text"
          name="flightNumber"
          id="flightNumber"
          value={formData.flightNumber}
          onChange={handleInputChange}
          maxLength={4}
          pattern="[0-9]*"
          inputMode="numeric"
          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.flightNumber ? 'border-red-300 bg-red-50' : ''
          }`}
          placeholder={t.flightForm.flightNumberPlaceholder}
          aria-describedby="flightNumber-help"
          aria-required="true"
          aria-invalid={errors.flightNumber ? 'true' : 'false'}
        />
        <p id="flightNumber-help" className="mt-1 text-sm text-gray-500">
          {t.flightForm.flightNumberPlaceholder}
        </p>
        {errors.flightNumber && <p className="mt-1 text-sm text-red-600" role="alert">{errors.flightNumber}</p>}
      </div>

      {/* New Flight Number - only show if template requires it */}
      <div style={{ visibility: templateParameters.has('newFlightNumber') ? 'visible' : 'hidden' }}>
        <label htmlFor="newFlightNumber" className="block text-sm font-medium text-gray-700">
          {t.flightForm.newFlightNumber}
        </label>
        <input
          type="text"
          name="newFlightNumber"
          id="newFlightNumber"
          value={formData.newFlightNumber}
          onChange={handleInputChange}
          maxLength={4}
          pattern="[0-9]*"
          inputMode="numeric"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={t.flightForm.newFlightNumberPlaceholder}
        />
      </div>

      {/* Original Date */}
      <div>
        <label htmlFor="originalDate" className="block text-sm font-medium text-gray-700">
          <Calendar className="inline h-4 w-4 ml-1" />
          {t.flightForm.originalDate}
        </label>
        <input
          type="date"
          name="originalDate"
          id="originalDate"
          value={formData.originalDate}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* New Date - only show if template requires it */}
      {templateParameters.has('newDate') && (
        <div>
          <label htmlFor="newDate" className="block text-sm font-medium text-gray-700">
            <Calendar className="inline h-4 w-4 ml-1" />
            {t.flightForm.newDate}
          </label>
          <input
            type="date"
            name="newDate"
            id="newDate"
            value={formData.newDate}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      )}

      {/* Original Time */}
      <div>
        <label htmlFor="originalTime" className="block text-sm font-medium text-gray-700">
          <Clock className="inline h-4 w-4 ml-1" />
          {t.flightForm.originalTime}
        </label>
        <input
          type="time"
          name="originalTime"
          id="originalTime"
          value={formData.originalTime}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* New Time */}
      <div>
        <label htmlFor="newTime" className="block text-sm font-medium text-gray-700">
          <Clock className="inline h-4 w-4 ml-1" />
          {t.flightForm.newTime}
        </label>
        <input
          type="time"
          name="newTime"
          id="newTime"
          value={formData.newTime}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Departure City */}
      <div>
        <label htmlFor="departureCity" className="block text-sm font-medium text-gray-700">
          <MapPin className="inline h-4 w-4 ml-1" />
          {t.flightForm.departureCity}
        </label>
        <select
          name="departureCity"
          id="departureCity"
          value={formData.departureCity}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">{t.flightForm.selectDepartureCity}</option>
          {allDestinations.map((city) => (
            <option key={city.code} value={city.code}>
              {language === 'he' ? city.name : city.englishName}
            </option>
          ))}
        </select>
      </div>

      {/* Arrival City */}
      <div>
        <label htmlFor="arrivalCity" className="block text-sm font-medium text-gray-700">
          <MapPin className="inline h-4 w-4 ml-1" />
          {t.flightForm.arrivalCity}
        </label>
        <select
          name="arrivalCity"
          id="arrivalCity"
          value={formData.arrivalCity}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">{t.flightForm.selectArrivalCity}</option>
          {allDestinations.map((city) => (
            <option key={city.code} value={city.code}>
              {language === 'he' ? city.name : city.englishName}
            </option>
          ))}
        </select>
      </div>

      {/* Lounge Opening Time - only show if template requires it */}
      {templateParameters.has('loungeOpenTime') && (
        <div>
          <label htmlFor="loungeOpenTime" className="block text-sm font-medium text-gray-700">
            <Clock className="inline h-4 w-4 ml-1" />
            {t.templateManager.parameters.loungeOpenTime}
          </label>
          <input
            type="time"
            name="loungeOpenTime"
            id="loungeOpenTime"
            value={formData.loungeOpenTime}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      )}

      {/* Check-in Counter Opening Time - only show if template requires it */}
      {templateParameters.has('counterOpenTime') && (
        <div>
          <label htmlFor="counterOpenTime" className="block text-sm font-medium text-gray-700">
            <Clock className="inline h-4 w-4 ml-1" />
            {t.templateManager.parameters.counterOpenTime}
          </label>
          <input
            type="time"
            name="counterOpenTime"
            id="counterOpenTime"
            value={formData.counterOpenTime}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      )}

      {/* Counter Closing Time - only show if template requires it */}
      {templateParameters.has('counterCloseTime') && (
        <div>
          <label htmlFor="counterCloseTime" className="block text-sm font-medium text-gray-700">
            <Clock className="inline h-4 w-4 ml-1" />
            {t.templateManager.parameters.counterCloseTime}
          </label>
          <input
            type="time"
            name="counterCloseTime"
            id="counterCloseTime"
            value={formData.counterCloseTime}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      )}

      {/* Internet Code - only show if template requires it */}
      {templateParameters.has('internetCode') && (
        <div>
          <label htmlFor="internetCode" className="block text-sm font-medium text-gray-700">
            {t.templateManager.parameters.internetCode || 'קוד אינטרנט'}
          </label>
          <input
            type="text"
            name="internetCode"
            id="internetCode"
            value={formData.internetCode}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="הזן קוד אינטרנט"
          />
        </div>
      )}
    </div>
  );
};

export default FlightFormFields;
