// File: src/Context/InstrumentLockContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

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

  const switchToTabByName = useCallback((tabName) => {
    const index = tabNames.indexOf(tabName);
    if (index !== -1) {
      setSelectedTabIndex(index);
    }
  }, [tabNames]);

  const switchToTabByIndex = useCallback((index) => {
    if (index >= 0 && index < tabNames.length) {
      setSelectedTabIndex(index);
    }
  }, [tabNames]);

  const value = {
    selectedTabIndex,
    switchToTabByName,
    switchToTabByIndex,
    tabNames,
    currentTabName: tabNames[selectedTabIndex]
  };

  return (
    <InstrumentLockContext.Provider value={value}>
      {children}
    </InstrumentLockContext.Provider>
  );
};