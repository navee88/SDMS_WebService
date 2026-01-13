import React, { createContext, useContext, useState } from 'react';

const LogFiltersContext = createContext();

export const LogFiltersProvider = ({ children }) => {
  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Store filters for multiple components using component name as key
  const [componentFilters, setComponentFilters] = useState({});

  // Get default filter structure
  const getDefaultFilters = () => ({
    selectedClient: "",
    task: "",
    taskId: "",
    fileName: "",
    recordsDuration: "Current Date",
    fromDate: getCurrentDate(),
    toDate: getCurrentDate(),
  });

  // Get filters for a specific component
  const getFilters = (componentName) => {
    return componentFilters[componentName] || getDefaultFilters();
  };

  // Update a single filter value for a specific component
  const updateFilter = (componentName, key, value) => {
    setComponentFilters(prev => ({
      ...prev,
      [componentName]: {
        ...(prev[componentName] || getDefaultFilters()),
        [key]: value
      }
    }));
  };

  // Update multiple filters at once for a specific component
  const updateFilters = (componentName, filters) => {
    setComponentFilters(prev => ({
      ...prev,
      [componentName]: {
        ...(prev[componentName] || getDefaultFilters()),
        ...filters
      }
    }));
  };

  // Reset filters for a specific component
  const resetFilters = (componentName) => {
    setComponentFilters(prev => ({
      ...prev,
      [componentName]: getDefaultFilters()
    }));
  };

  // Reset all filters (optional)
  const resetAllFilters = () => {
    setComponentFilters({});
  };

  return (
    <LogFiltersContext.Provider
      value={{
        getFilters,
        updateFilter,
        updateFilters,
        resetFilters,
        resetAllFilters,
      }}
    >
      {children}
    </LogFiltersContext.Provider>
  );
};

export const useLogFilters = () => {
  const context = useContext(LogFiltersContext);
  if (!context) {
    throw new Error('useLogFilters must be used within a LogFiltersProvider');
  }
  return context;
};