// import React, { createContext, useContext, useState, useCallback } from 'react';

// const SchedulerNavigationContext = createContext();

// export const useSchedulerNavigation = () => {
//   const context = useContext(SchedulerNavigationContext);
//   if (!context) {
//     throw new Error('useSchedulerNavigation must be used within SchedulerNavigationProvider');
//   }
//   return context;
// };

// export const SchedulerNavigationProvider = ({ children }) => {
//   const [navigationState, setNavigationState] = useState({
//     targetTab: null,
//     targetComponent: null,
//     data: null,
//     timestamp: null,
//     parentTabKey: null,
//     childTabKey: null,
//   });

//   // ADD: Active tab tracking
//   const [activeParentTab, setActiveParentTab] = useState(null);
//   const [activeChildTab, setActiveChildTab] = useState(null);

//   const navigateToTab = useCallback((parentTabKey, childTabKey, data = null) => {
//     console.log('=== Navigate to Tab ===');
//     console.log('Parent Tab:', parentTabKey);
//     console.log('Child Tab:', childTabKey);
//     console.log('Data:', data);

//     setNavigationState({
//       targetTab: childTabKey,
//       targetComponent: childTabKey,
//       parentTabKey,
//       childTabKey,
//       data,
//       timestamp: Date.now()
//     });

//     // UPDATE: Switch tabs immediately
//     setActiveParentTab(parentTabKey);

//     // Small delay to ensure parent tab renders first
//     // setTimeout(() => {
//     //   setActiveChildTab(childTabKey);
//     // }, 100);
//     // Small delay to ensure parent tab renders first
//     setTimeout(() => {
//       setActiveChildTab(childTabKey);

//       // ADD: Auto-clear after animation completes
//       setTimeout(() => {
//         console.log('Auto-clearing active tabs after navigation');
//         setActiveParentTab(null);
//         setActiveChildTab(null);
//       }, 300); // Clear after tab switch animation
//     }, 100);

//     // Also dispatch event for compatibility
//     window.dispatchEvent(new CustomEvent('tab-navigation', {
//       detail: { parentTabKey, childTabKey, data }
//     }));
//   }, []);

//   // In SchedulerNavigationContext.jsx
//  const navigateToInstrumentLockTag = useCallback((submissionData) => {
//     console.log('=== navigateToInstrumentLockTag CALLED ===');
//     console.log('Received submissionData:', submissionData);

//     // Extract the inner data if it's wrapped
//     let navigationData = submissionData;

//     if (submissionData?.data?.data) {
//         // Data is doubly wrapped: {data: {data: {...}}}
//         console.log('Data is doubly wrapped, extracting inner data');
//         navigationData = { data: submissionData.data.data };
//     } else if (submissionData?.data) {
//         // Data is properly wrapped: {data: {...}}
//         console.log('Data is properly wrapped');
//         navigationData = submissionData;
//     } else {
//         // Data is not wrapped: {...}
//         console.log('Wrapping raw data');
//         navigationData = { data: submissionData };
//     }

//     console.log('Final navigation data:', navigationData);
//     navigateToTab('Lock Settings', 'Instrument Lock Settings', navigationData);
// }, [navigateToTab]);

//   const navigateToActivatedTask = useCallback((data) => {
//     console.log('navigateToActivatedTask CALLED with data:', data);
//     // Add inner tab information to the data
//     const navigationData = {
//       ...data,
//       innerTab: 'Activated Task'  // <-- Add this
//     };
//     console.log('Navigation data with innerTab:', navigationData);
//     // Navigate to ViewEditScheduler and set Activated Task as target
//     // navigateToTab('View Edit Scheduler', 'Activated Task', data);
//     navigateToTab('Scheduler', 'View Edit Scheduler', navigationData);
//   }, [navigateToTab]);

//   const navigateToDeactivatedTask = useCallback((data) => {
//     console.log('navigateToDeactivatedTask CALLED with data:', data);
//     // Navigate to ViewEditScheduler and set Deactivated Task as target
//     const navigationData = {
//       ...data,
//       innerTab: 'Deactivated Task'  // <-- Add this
//     };
//     console.log('Navigation data with innerTab:', navigationData);
//     navigateToTab('Scheduler', 'View Edit Scheduler', navigationData);
//     // navigateToTab('View Edit Scheduler', 'Deactivated Task', data);
//   }, [navigateToTab]);

//   const clearNavigation = useCallback(() => {
//     console.log('Clearing navigation data');
//     setNavigationState({
//       targetTab: null,
//       targetComponent: null,
//       parentTabKey: null,
//       childTabKey: null,
//       data: null,
//       timestamp: null
//     });
//     setActiveParentTab(null); // ADD THIS
//     setActiveChildTab(null);  // ADD THIS
//   }, []);

//   const getSubmissionData = useCallback(() => {
//     if (navigationState.timestamp && Date.now() - navigationState.timestamp > 30000) {
//       clearNavigation();
//       return null;
//     }
//     return navigationState;
//   }, [navigationState, clearNavigation]);

//   const value = {
//     navigationState,
//     navigateToTab,
//     navigateToInstrumentLockTag,
//     navigateToActivatedTask,
//     navigateToDeactivatedTask,
//     clearNavigation,
//     getSubmissionData,
//     activeParentTab,
//     activeChildTab,
//     setActiveParentTab,
//     setActiveChildTab,
//   };

//   return (
//     <SchedulerNavigationContext.Provider value={value}>
//       {children}
//     </SchedulerNavigationContext.Provider>
//   );
// };



// Athira-----------------------------------------------------------

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const SchedulerNavigationContext = createContext();

export const useSchedulerNavigation = () => {
  const context = useContext(SchedulerNavigationContext);
  if (!context) {
    throw new Error('useSchedulerNavigation must be used within SchedulerNavigationProvider');
  }
  return context;
};

export const SchedulerNavigationProvider = ({ children }) => {
  const [navigationState, setNavigationState] = useState({
    targetTab: null,
    targetComponent: null,
    data: null,
    timestamp: null,
    parentTabKey: null,
    childTabKey: null,
  });

  const [activeParentTab, setActiveParentTab] = useState(null);
  const [activeChildTab, setActiveChildTab] = useState(null);

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

    setActiveParentTab(parentTabKey);
    setActiveChildTab(childTabKey);

    //
    setTimeout(() => {
      setActiveParentTab(null);
      setActiveChildTab(null);
    }, 500); // Adjust timing as needed


    window.dispatchEvent(new CustomEvent('tab-navigation', {
      detail: { parentTabKey, childTabKey, data }
    }));

    window.dispatchEvent(new CustomEvent('force-tab-change', {
      detail: { parentTabKey, childTabKey }
    }));
  }, []);

  const navigateToDataScheduler = useCallback((data) => {
    console.log('=== navigateToDataScheduler CALLED ===');
    console.log('Data received:', data);

    setNavigationState({
      targetTab: 'Data Scheduler',
      targetComponent: 'Data Scheduler',
      parentTabKey: 'Scheduler',
      childTabKey: 'Data Scheduler',
      data: data,
      timestamp: Date.now()
    });

    setActiveParentTab('Scheduler');
    setActiveChildTab('Data Scheduler');

    //
    setTimeout(() => {
      setActiveParentTab(null);
      setActiveChildTab(null);
    }, 500); // Adjust timing as needed

    window.dispatchEvent(new CustomEvent('tab-navigation', {
      detail: {
        parentTabKey: 'Scheduler',
        childTabKey: 'Data Scheduler',
        data
      }
    }));

    window.dispatchEvent(new CustomEvent('force-tab-change', {
      detail: {
        parentTabKey: 'Scheduler',
        childTabKey: 'Data Scheduler'
      }
    }));
  }, []);

  const navigateToInstrumentLockTag = useCallback((submissionData) => {
    console.log('=== navigateToInstrumentLockTag CALLED ===');
    console.log('Received submissionData:', submissionData);

    let navigationData = submissionData;

    if (submissionData?.data?.data) {
      console.log('Data is doubly wrapped, extracting inner data');
      navigationData = { data: submissionData.data.data };
    } else if (submissionData?.data) {
      console.log('Data is properly wrapped');
      navigationData = submissionData;
    } else {
      console.log('Wrapping raw data');
      navigationData = { data: submissionData };
    }

    console.log('Final navigation data:', navigationData);
    navigateToTab('Lock Settings', 'Instrument Lock Settings', navigationData);
  }, [navigateToTab]);

  const navigateToActivatedTask = useCallback((data) => {
    console.log('navigateToActivatedTask CALLED with data:', data);
    const navigationData = {
      ...data,
      innerTab: 'Activated Task'
    };
    console.log('Navigation data with innerTab:', navigationData);
    navigateToTab('Scheduler', 'View Edit Scheduler', navigationData);
  }, [navigateToTab]);

  const navigateToDeactivatedTask = useCallback((data) => {
    console.log('navigateToDeactivatedTask CALLED with data:', data);
    const navigationData = {
      ...data,
      innerTab: 'Deactivated Task'
    };
    console.log('Navigation data with innerTab:', navigationData);
    navigateToTab('Scheduler', 'View Edit Scheduler', navigationData);
  }, [navigateToTab]);

  const navigateToRetiredTask = useCallback((data) => {
    navigateToTab('Scheduler', 'View Edit Scheduler', {
      innerTab: 'Retired Task',
      ...data
    });
  }, [navigateToTab]);

  const navigateToEditTask = useCallback((data) => {
    navigateToTab('Scheduler', 'View Edit Scheduler', {
      innerTab: 'Edit Task',
      ...data
    });
  }, [navigateToTab]);

  // CRITICAL FIX: Don't clear active tabs, only navigation data
  const clearNavigation = useCallback(() => {
    console.log('🧹 Clearing navigation data (preserving active tabs)');
    setNavigationState({
      targetTab: null,
      targetComponent: null,
      parentTabKey: null,
      childTabKey: null,
      data: null,
      timestamp: null
    });
    // DON'T clear activeParentTab and activeChildTab
  }, []);

  // Listen for manual tab changes (when user clicks tabs)
  useEffect(() => {
    const handleManualTabChange = (event) => {
      const { parentTabKey, childTabKey } = event.detail || {};
      console.log('📍 Manual tab change detected:', { parentTabKey, childTabKey });

      if (parentTabKey) {
        setActiveParentTab(parentTabKey);
      }
      if (childTabKey) {
        setActiveChildTab(childTabKey);
      }

      // Clear navigation data when user manually changes tabs
      clearNavigation();
    };

    window.addEventListener('manual-tab-change', handleManualTabChange);
    return () => window.removeEventListener('manual-tab-change', handleManualTabChange);
  }, [clearNavigation]);


  // In SchedulerNavigationContext.jsx, update the manual tab change listener
  useEffect(() => {
    const handleManualTabChange = (event) => {
      const { isManualClick } = event.detail || {};

      if (isManualClick) {
        console.log('📍 Manual tab change detected - clearing navigation data');

        // Only clear navigation data, keep active tabs
        clearNavigation();
      }
    };

    window.addEventListener('manual-tab-change', handleManualTabChange);
    return () => window.removeEventListener('manual-tab-change', handleManualTabChange);
  }, [clearNavigation]);


  const getSubmissionData = useCallback(() => {
    // Return data even if timestamp is old (remove timeout)
    return navigationState;
  }, [navigationState]);

  const navigateFromDeactivatedToInstrumentLock = useCallback((data) => {
    console.log('=== navigateFromDeactivatedToInstrumentLock CALLED ===');
    console.log('Raw data from DeactivatedTask:', data);

    let navigationData;

    // Handle different data structures
    if (data?.scheduleData && data?.checkResponse) {
      // Direct deactivated task data structure
      navigationData = {
        data: {
          scheduleData: data.scheduleData,
          checkResponse: data.checkResponse,
          activateData: data.activateData,
          actionType: data.actionType || 'lockActivate',
          forActivation: data.forActivation || false,
          fromDeactivatedTask: true,
          fromLockActivate: data.fromLockActivate || false,
          navigationTimestamp: Date.now()
        }
      };
    } else if (data?.data?.scheduleData) {
      // Already wrapped data
      navigationData = {
        data: {
          ...data.data,
          fromDeactivatedTask: true,
          navigationTimestamp: Date.now()
        }
      };
    } else {
      // Fallback
      navigationData = {
        data: {
          ...data,
          fromDeactivatedTask: true,
          navigationTimestamp: Date.now()
        }
      };
    }

    // Store the data globally as well
    if (navigationData.data.scheduleData) {
      window.GActSchedulerData = navigationData.data.scheduleData;
      console.log('💾 Stored GActSchedulerData:', window.GActSchedulerData);
    }

    console.log('Final navigation data for Instrument Lock Settings:', navigationData);

    // Navigate with the data directly (not double-wrapped)
    setNavigationState({
      targetTab: 'Instrument Lock Settings',
      targetComponent: 'Instrument Lock Settings',
      parentTabKey: 'Lock Settings',
      childTabKey: 'Instrument Lock Settings',
      data: navigationData.data, // Use the data directly, not wrapped
      timestamp: Date.now()
    });

    setActiveParentTab('Lock Settings');
    setActiveChildTab('Instrument Lock Settings');

    // Dispatch events for tab change
    window.dispatchEvent(new CustomEvent('tab-navigation', {
      detail: {
        parentTabKey: 'Lock Settings',
        childTabKey: 'Instrument Lock Settings',
        data: navigationData.data
      }
    }));

    window.dispatchEvent(new CustomEvent('force-tab-change', {
      detail: {
        parentTabKey: 'Lock Settings',
        childTabKey: 'Instrument Lock Settings'
      }
    }));

    // Also dispatch a custom event for Instrument Lock to listen for
    window.dispatchEvent(new CustomEvent('deactivated-task-navigation', {
      detail: navigationData.data
    }));
  }, []);

  const navigateFromDeactivatedToDataScheduler = useCallback((data) => {
    console.log('=== navigateFromDeactivatedToDataScheduler CALLED ===');
    console.log('Data from DeactivatedTask:', data);

    let navigationData = data;

    if (data?.data) {
      navigationData = data;
    } else {
      navigationData = { data: data };
    }

    navigationData.data = {
      ...navigationData.data,
      fromDeactivatedTaskView: true,
      fromDeactivatedTask: true,
      navigationTimestamp: Date.now()
    };

    console.log('Navigating to Data Scheduler from DeactivatedTask:', navigationData);
    navigateToTab('Scheduler', 'Data Scheduler', navigationData);
  }, [navigateToTab]);

  const navigateFromDeactivatedToActivatedTask = useCallback((data) => {
    console.log('=== navigateFromDeactivatedToActivatedTask CALLED ===');
    console.log('Data from DeactivatedTask:', data);

    const navigationData = {
      innerTab: 'Activated Task',
      fromDeactivatedTask: true,
      scheduleActivated: true,
      scheduleId: data?.scheduleId || data?.data?.scheduleId,
      highlightScheduleId: data?.highlightScheduleId || data?.scheduleId,
      shouldScrollToSchedule: data?.shouldScrollToSchedule || true,
      message: data?.message || 'Schedule activated successfully',
      ...data,
      navigationTimestamp: Date.now()
    };

    console.log('Navigating to Activated Task from DeactivatedTask:', navigationData);
    navigateToTab('Scheduler', 'View Edit Scheduler', navigationData);
  }, [navigateToTab]);

  const navigateWithinDeactivatedTask = useCallback((data) => {
    console.log('=== navigateWithinDeactivatedTask CALLED ===');
    console.log('Refreshing DeactivatedTask with data:', data);

    const navigationData = {
      innerTab: 'Deactivated Task',
      refreshDeactivatedTask: true,
      scheduleId: data?.scheduleId,
      highlightScheduleId: data?.scheduleId,
      shouldScrollToSchedule: true,
      navigationTimestamp: Date.now()
    };

    console.log('Refreshing DeactivatedTask view:', navigationData);
    navigateToTab('Scheduler', 'View Edit Scheduler', navigationData);
  }, [navigateToTab]);

  const value = {
    navigationState,
    navigateToTab,
    navigateToInstrumentLockTag,
    navigateToActivatedTask,
    navigateToDeactivatedTask,
    navigateToDataScheduler,
    clearNavigation,
    getSubmissionData,
    activeParentTab,
    activeChildTab,
    setActiveParentTab,
    setActiveChildTab,
    navigateFromDeactivatedToInstrumentLock,
    navigateFromDeactivatedToDataScheduler,
    navigateFromDeactivatedToActivatedTask,
    navigateWithinDeactivatedTask,
    navigateToRetiredTask,
    navigateToEditTask
  };

  return (
    <SchedulerNavigationContext.Provider value={value}>
      {children}
    </SchedulerNavigationContext.Provider>
  );
};
