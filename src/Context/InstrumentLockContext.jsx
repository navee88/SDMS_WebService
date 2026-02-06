
// File: src/Context/InstrumentLockContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
 import { useSchedulerNavigation } from './SchedulerNavigationContext'; // You need to use this context

const InstrumentLockContext = createContext();
 
export const useInstrumentLock = () => {
  const context = useContext(InstrumentLockContext);
  if (!context) {
    throw new Error('useInstrumentLock must be used within InstrumentLockProvider');
  }
  return context;
};
 
export const InstrumentLockProvider = ({ children }) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [tabNames] = useState([
    "Instrument Locks and Tags",
    "Data",
    "My Instruments",
    "Other Instruments"
  ]);
 
  const [navigationData, setNavigationData] = useState({
    instrumentId: null,
    autoSelectInstrument: false,
    targetTab: null
  });
 
  const switchToTabByName = useCallback((tabName, data = {}) => {
    const index = tabNames.indexOf(tabName);
    if (index !== -1) {
      setSelectedTabIndex(index);
      setNavigationData({
        instrumentId: data.instrumentId || null,
        autoSelectInstrument: data.autoSelectInstrument || false,
        targetTab: tabName
      });
      console.log(`🔵 Navigated to tab: ${tabName}`, { instrumentId: data.instrumentId });
    } else {
      console.error(`❌ Tab "${tabName}" not found. Available tabs:`, tabNames);
    }
  }, [tabNames]);
 
  const switchToTabByIndex = useCallback((index, data = {}) => {
    if (index >= 0 && index < tabNames.length) {
      setSelectedTabIndex(index);
      setNavigationData({
        instrumentId: data.instrumentId || null,
        autoSelectInstrument: data.autoSelectInstrument || false,
        targetTab: tabNames[index]
      });
      console.log(`🔵 Navigated to tab index: ${index} (${tabNames[index]})`, { instrumentId: data.instrumentId });
    }
  }, [tabNames]);
 
  // CRITICAL FIX: Enhanced navigation logic
  const navigateAfterLock = useCallback((instrumentId) => {
    console.log('🔵 navigateAfterLock called with instrumentId:', instrumentId);
   
    if (!instrumentId) {
      console.log('⚠️ No instrumentId provided, staying on current tab');
      return;
    }
   
    // Clean up the instrument ID
    const cleanInstrumentId = String(instrumentId).trim();
    console.log('🔵 Cleaned instrument ID:', cleanInstrumentId);
   
    // IMPORTANT: Check if this is a parser instrument (ends with :X where X != 0)
    const isParserInstrument = cleanInstrumentId.includes(':') &&
                               cleanInstrumentId.split(':').length > 1 &&
                               cleanInstrumentId.split(':')[1].trim() !== "0";
   
    console.log('🔵 Is parser instrument:', isParserInstrument);
   
    // Based on jQuery logic in LOCKANDTAG_ajaxCall function:
    // Original code checks: if (thisVal.split(':')[1].trim() === "0")
    // If parser part is "0" -> go to My Instruments
    // Otherwise -> go to Data page
   
    if (isParserInstrument) {
      // Navigate to Data tab
      console.log('🔵 Navigating to Data tab for parser instrument');
      switchToTabByName("Data", {
        instrumentId: cleanInstrumentId,
        autoSelectInstrument: true
      });
    } else {
      // Navigate to My Instruments tab
      console.log('🔵 Navigating to My Instruments tab for non-parser instrument');
      switchToTabByName("My Instruments", {
        instrumentId: cleanInstrumentId,
        autoSelectInstrument: true
      });
    }
  }, [switchToTabByName]);
 
  // Clear navigation data
  const clearNavigationData = useCallback(() => {
    console.log('🧹 Clearing navigation data');
    setNavigationData({
      instrumentId: null,
      autoSelectInstrument: false,
      targetTab: null
    });
  }, []);
 
  const value = {
    selectedTabIndex,
    switchToTabByName,
    switchToTabByIndex,
    tabNames,
    currentTabName: tabNames[selectedTabIndex],
    navigationData,
    navigateAfterLock,
    clearNavigationData
  };
 
  return (
    <InstrumentLockContext.Provider value={value}>
      {children}
    </InstrumentLockContext.Provider>
  );
};
 