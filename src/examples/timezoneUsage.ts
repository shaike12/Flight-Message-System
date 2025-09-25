/**
 * Example usage of the enhanced timezone service
 * This shows how to add new airports dynamically without modifying the code
 */

import { 
  addNewAirport, 
  addAirportTimezone, 
  getCachedAirports, 
  clearTimezoneCache,
  getLocalTime,
  hasTimezoneSupport 
} from '../services/timezoneService';

// Example 1: Add a new airport with automatic timezone detection
export const addNewAirportExample = async () => {
  console.log('=== Adding New Airport Example ===');
  
  // Add a new Romanian airport
  const success = await addNewAirport('BCM', 'Bacau', 'Romania');
  if (success) {
    console.log('✅ BCM airport added successfully');
    
    // Test the new airport
    const localTime = await getLocalTime('BCM');
    console.log(`🕐 Local time in BCM: ${localTime}`);
  } else {
    console.log('❌ Failed to add BCM airport');
  }
};

// Example 2: Add multiple airports from different countries
export const addMultipleAirportsExample = async () => {
  console.log('=== Adding Multiple Airports Example ===');
  
  const newAirports = [
    { code: 'CLJ', city: 'Cluj-Napoca', country: 'Romania' },
    { code: 'IAS', city: 'Iasi', country: 'Romania' },
    { code: 'TSR', city: 'Timisoara', country: 'Romania' },
    { code: 'CND', city: 'Constanta', country: 'Romania' },
    { code: 'SBZ', city: 'Sibiu', country: 'Romania' },
    { code: 'ARW', city: 'Arad', country: 'Romania' },
    { code: 'OMR', city: 'Oradea', country: 'Romania' },
    { code: 'SUJ', city: 'Satu Mare', country: 'Romania' },
    { code: 'BAY', city: 'Baia Mare', country: 'Romania' },
    { code: 'CRA', city: 'Craiova', country: 'Romania' },
    { code: 'DRO', city: 'Drobeta-Turnu Severin', country: 'Romania' },
    { code: 'TGM', city: 'Targu Mures', country: 'Romania' },
    { code: 'SCV', city: 'Suceava', country: 'Romania' },
    { code: 'BBU', city: 'Bucharest', country: 'Romania' },
  ];

  for (const airport of newAirports) {
    const success = await addNewAirport(airport.code, airport.city, airport.country);
    console.log(`${success ? '✅' : '❌'} ${airport.code} (${airport.city}, ${airport.country})`);
  }
};

// Example 3: Manually add an airport with specific timezone
export const addManualAirportExample = () => {
  console.log('=== Manual Airport Addition Example ===');
  
  // Add an airport manually with a specific timezone
  addAirportTimezone('TEST', 'Europe/London', 'Test City');
  
  // Check if it was added
  const hasSupport = hasTimezoneSupport('TEST');
  console.log(`TEST airport has timezone support: ${hasSupport}`);
};

// Example 4: View all cached airports
export const viewCachedAirportsExample = () => {
  console.log('=== Cached Airports Example ===');
  
  const cachedAirports = getCachedAirports();
  console.log(`Total cached airports: ${cachedAirports.length}`);
  
  cachedAirports.forEach(airport => {
    console.log(`  ${airport.code}: ${airport.timezone}`);
  });
};

// Example 5: Clear cache and start fresh
export const clearCacheExample = () => {
  console.log('=== Clear Cache Example ===');
  
  console.log('Before clearing:');
  viewCachedAirportsExample();
  
  clearTimezoneCache();
  
  console.log('After clearing:');
  viewCachedAirportsExample();
};

// Example 6: Test timezone support for various airports
export const testTimezoneSupportExample = async () => {
  console.log('=== Timezone Support Test Example ===');
  
  const testAirports = ['TLV', 'JFK', 'BCM', 'CLJ', 'UNKNOWN'];
  
  for (const airport of testAirports) {
    const hasSupport = hasTimezoneSupport(airport);
    console.log(`${airport}: ${hasSupport ? '✅ Supported' : '❌ Not supported'}`);
    
    if (hasSupport) {
      const localTime = await getLocalTime(airport);
      console.log(`  Local time: ${localTime}`);
    }
  }
};

// Run all examples
export const runAllExamples = async () => {
  console.log('🚀 Running all timezone service examples...\n');
  
  await addNewAirportExample();
  console.log('\n');
  
  await addMultipleAirportsExample();
  console.log('\n');
  
  addManualAirportExample();
  console.log('\n');
  
  viewCachedAirportsExample();
  console.log('\n');
  
  await testTimezoneSupportExample();
  console.log('\n');
  
  console.log('✅ All examples completed!');
};
