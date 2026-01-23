// SchedulerNavigationContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const SchedulerNavigationContext = createContext();

export const useSchedulerNavigation = () => {
  const context = useContext(SchedulerNavigationContext);
  if (!context) {
    throw new Error('useSchedulerNavigation must be used within SchedulerNavigationProvider');
  }
  return context;
};

export const SchedulerNavigationProvider = ({ children }) => {
  // State for tab navigation
  const [navigationState, setNavigationState] = useState({
    targetTab: null,           // Which tab to open: 'instrumentLockTag', 'activatedTask', 'deactivatedTask'
    targetComponent: null,     // Which component to show within the tab
    data: null,                // Data to pass
    timestamp: null,
    // ADD THESE for tab control:
    parentTabKey: null,        // e.g., 'InstrumentLockSettings', 'ViewEditScheduler'
    childTabKey: null,         // e.g., 'Instrument Locks and Tags', 'Activated Task'
  });

  // Function to trigger tab navigation
  const navigateToTab = useCallback((parentTabKey, childTabKey, data = null) => {
    console.log('=== Navigate to Tab ===');
    console.log('Parent Tab:', parentTabKey);
    console.log('Child Tab:', childTabKey);
    console.log('Data:', data);

    setNavigationState({
      targetTab: childTabKey,
      targetComponent: childTabKey,
      parentTabKey,
      childTabKey,
      data,
      timestamp: Date.now()
    });

    // Dispatch custom event for your tab system to listen to
    window.dispatchEvent(new CustomEvent('tab-navigation', {
      detail: { parentTabKey, childTabKey, data }
    }));
  }, []);

  // Specialized functions for your use cases
  const navigateToInstrumentLockTag = useCallback((data) => {
    navigateToTab('InstrumentLockSettings', 'Instrument Locks and Tags', data);
  }, [navigateToTab]);

  const navigateToActivatedTask = useCallback((data) => {
    navigateToTab('ViewEditScheduler', 'Activated Task', data);
  }, [navigateToTab]);

  const navigateToDeactivatedTask = useCallback((data) => {
    navigateToTab('ViewEditScheduler', 'Deactivated Task', data);
  }, [navigateToTab]);

  const clearNavigation = useCallback(() => {
    setNavigationState({
      targetTab: null,
      targetComponent: null,
      parentTabKey: null,
      childTabKey: null,
      data: null,
      timestamp: null
    });
  }, []);

  const getSubmissionData = useCallback(() => {
    if (navigationState.timestamp && Date.now() - navigationState.timestamp > 30000) {
      clearNavigation();
      return null;
    }
    return navigationState;
  }, [navigationState, clearNavigation]);

  const value = {
    navigationState,
    navigateToTab,
    navigateToInstrumentLockTag,
    navigateToActivatedTask,
    navigateToDeactivatedTask,
    clearNavigation,
    getSubmissionData
  };

  return (
    <SchedulerNavigationContext.Provider value={value}>
      {children}
    </SchedulerNavigationContext.Provider>
  );
};