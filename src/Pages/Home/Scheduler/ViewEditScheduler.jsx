// // import React, { useState, useEffect } from "react";
// // import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
// // import { tabConfig } from ".././../../Components/Layout/Common/Home/TabConfig";

// // export default function ViewEditScheduler() {
// //   const [page, setPage] = useState("ViewEditScheduler");
// //   const [selectedTab, setSelectedTab] = useState(0);

// //   useEffect(() => {
// //     setSelectedTab(0);
// //   }, [page]);

// //   const pageTabsObj = tabConfig[page] || {};
// //   const currentTabs = Object.keys(pageTabsObj).map(label => ({
// //     label,
// //     content: pageTabsObj[label].content,
// //   }));

// //   return (
// //     <>

// // <div className="flex flex-col h-dvh overflow-hidden bg-white">


// //   <div className="flex-none z-10 bg-white">
// //     <TabsHeader 
// //       tabs={currentTabs} 
// //       selectedTab={selectedTab} 
// //       setSelectedTab={setSelectedTab}
// //       className="shadow-sm"
// //     />
// //   </div>

// //   <div className="flex-1 overflow-y-scroll overflow-x-hidden pb-20">
// //     {currentTabs[selectedTab]?.content || null}
// //   </div>

// // </div>

// //     </>
// //   );
// // }


// // Kirubhakaran Updated Code
// import React, { useState, useEffect, useRef } from "react"; // Add useRef
// import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
// import { tabConfig } from ".././../../Components/Layout/Common/Home/TabConfig";
// import { useSchedulerNavigation } from '../../../Context/SchedulerNavigationContext';

// export default function ViewEditScheduler() {
//   const [page, setPage] = useState("ViewEditScheduler");
//   const [selectedTab, setSelectedTab] = useState(0);
//   const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
//   const hasProcessedNavigation = useRef(false); // ADD THIS

//   useEffect(() => {
//     setSelectedTab(0);
//   }, [page]);

// useEffect(() => {
//     if (hasProcessedNavigation.current) {
//         return;
//     }

//     const submissionData = getSubmissionData();
//     console.log('=== ViewEditScheduler DEBUG ===');
//     console.log('Full navigation data:', submissionData);
//     console.log('childTabKey:', submissionData?.childTabKey); // This will be "View Edit Scheduler"
//     console.log('data.innerTab:', submissionData?.data?.innerTab); // This should be "Activated Task" or "Deactivated Task"
//     console.log('data.action:', submissionData?.data?.action); // This should be "saveActivate" or "saveOnly"

//     if (submissionData && submissionData.data) {
//         console.log('ViewEditScheduler received navigation data:', submissionData);

//         const pageTabsObj = tabConfig[page] || {};
//         const currentTabs = Object.keys(pageTabsObj).map(label => ({ label }));
        
//         console.log('Available inner tabs:', currentTabs.map(t => t.label));

//         // DON'T use childTabKey! It's "View Edit Scheduler" (the page itself)
//         // Instead, look for innerTab or action
        
//         let targetTabLabel = 'Deactivated Task'; // Default
        
//         // Check innerTab first (added to data in navigation context)
//         if (submissionData.data.innerTab) {
//             targetTabLabel = submissionData.data.innerTab;
//             console.log('Using innerTab from data:', targetTabLabel);
//         }
//         // Then check action as fallback
//         else if (submissionData.data.action === 'saveActivate') {
//             targetTabLabel = 'Activated Task';
//             console.log('Using action for Activated Task');
//         } else if (submissionData.data.action === 'saveOnly') {
//             targetTabLabel = 'Deactivated Task';
//             console.log('Using action for Deactivated Task');
//         }
        
//         console.log('Target inner tab:', targetTabLabel);

//         const targetTabIndex = currentTabs.findIndex(
//             tab => tab.label === targetTabLabel
//         );

//         if (targetTabIndex !== -1) {
//             console.log(`✅ Switching to ${targetTabLabel} tab at index:`, targetTabIndex);
//             setSelectedTab(targetTabIndex);
//             hasProcessedNavigation.current = true;
            
//             setTimeout(() => {
//                 console.log('Clearing navigation');
//                 clearNavigation();
//             }, 300);
//         } else {
//             console.warn(`❌ Target inner tab "${targetTabLabel}" not found in:`, currentTabs.map(t => t.label));
//         }
//     }
// }, [getSubmissionData, clearNavigation, page]);

//   // ADD THIS: Reset when component unmounts or page changes
//   useEffect(() => {
//     return () => {
//       hasProcessedNavigation.current = false;
//     };
//   }, [page]);

//   const pageTabsObj = tabConfig[page] || {};
//   const currentTabs = Object.keys(pageTabsObj).map(label => ({
//     label,
//     content: pageTabsObj[label].content,
//   }));

//   return (
//     <>
//       <div className="flex flex-col h-dvh overflow-hidden bg-white">
//         <div className="flex-none z-10 bg-white">
//           <TabsHeader
//             tabs={currentTabs}
//             selectedTab={selectedTab}
//             setSelectedTab={setSelectedTab}
//             className="shadow-sm"
//           />
//         </div>

//         <div className="flex-1 overflow-y-scroll overflow-x-hidden pb-20">
//           {currentTabs[selectedTab]?.content || null}
//         </div>
//       </div>
//     </>
//   );
// }

// //----------------------------

// AThira
 
import React, { useState, useEffect } from "react";
import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
import { tabConfig } from ".././../../Components/Layout/Common/Home/TabConfig";
import { useSchedulerNavigation } from '../../../Context/SchedulerNavigationContext';
 
export default function ViewEditScheduler({ navigationData }) {
  const [page, setPage] = useState("ViewEditScheduler");
  const [selectedTab, setSelectedTab] = useState(0);
  const [innerNavigationData, setInnerNavigationData] = useState(null);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
 
  const {
    navigationState,
    clearNavigation,
    getSubmissionData,
    activeParentTab // ADD: Track active parent tab
  } = useSchedulerNavigation();
 
  // Function to find tab index by label
  const findTabIndexByLabel = (label) => {
    const pageTabsObj = tabConfig[page] || {};
    const tabs = Object.keys(pageTabsObj);
    return tabs.findIndex(tab => tab === label);
  };
 
  // ADD: Reset function when navigating away
  const resetViewEditState = () => {
    console.log('Resetting ViewEditScheduler state');
    setInnerNavigationData(null);
    setIsNavigatingAway(true);
   
    // Reset to first tab after a short delay
    setTimeout(() => {
      setSelectedTab(0);
      setIsNavigatingAway(false);
    }, 100);
  };
 
// Around line 62-100
useEffect(() => {
    console.log('=== ViewEditScheduler Mounted ===');
    console.log('Navigation data from props:', navigationData);
    console.log('Navigation state from context:', navigationState);
   
    let navigationProcessed = false; // Track if we processed navigation
   
    // Priority 1: Check direct props navigation (coming from DataScheduler)
    if (navigationData) {
        console.log('Processing direct navigation data:', navigationData);
       
        if (navigationData.fromActivatedTask || navigationData.fromDeactivatedTask) {
            const tabName = navigationData.fromActivatedTask ? 'Activated Task' : 'Deactivated Task';
            const tabIndex = findTabIndexByLabel(tabName);
           
            if (tabIndex !== -1) {
                console.log(`Setting tab to ${tabName} at index ${tabIndex} from direct navigation`);
                setSelectedTab(tabIndex);
                setInnerNavigationData(navigationData);
                navigationProcessed = true;
            }
        }
    }
   
    // Priority 2: Check context navigation
    if (!navigationProcessed) {
        const submissionData = getSubmissionData();
        console.log('Context submission data:', submissionData);
       
        if (submissionData?.parentTabKey === 'Scheduler' &&
            submissionData?.childTabKey === 'View Edit Scheduler') {
           
            if (submissionData.data?.innerTab) {
                const innerTab = submissionData.data.innerTab;
                const tabIndex = findTabIndexByLabel(innerTab);
               
                if (tabIndex !== -1) {
                    setSelectedTab(tabIndex);
                    setInnerNavigationData(submissionData.data);
                    navigationProcessed = true;
                }
            }
        }
    }
   
    // **ADD: Clear navigation after processing**
    if (navigationProcessed && clearNavigation) {
        console.log('✅ Navigation processed, clearing state');
        // Small delay to ensure state updates complete
        setTimeout(() => {
            clearNavigation();
        }, 100);
    }
}, [navigationState, navigationData, getSubmissionData, clearNavigation, page]);
 
  // ADD: Monitor when parent tab changes
  useEffect(() => {
    // If we're on a different parent tab, reset the ViewEditScheduler state
    if (activeParentTab && activeParentTab !== 'Scheduler') {
      console.log(`Parent tab changed to ${activeParentTab}, resetting ViewEditScheduler`);
      resetViewEditState();
    }
  }, [activeParentTab]);
 
  // Handle tab selection
  const handleTabSelect = (index) => {
    console.log(`Tab manually selected: ${index}`);
    setSelectedTab(index);
    setInnerNavigationData(null); // Clear navigation when manually switching tabs
  };
 
  // Get the current component with navigation data
  const getCurrentContent = () => {
    // Don't render content if navigating away
    if (isNavigatingAway) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }
 
    const pageTabsObj = tabConfig[page] || {};
    const tabs = Object.keys(pageTabsObj);
    const currentTab = tabs[selectedTab];
   
    if (!currentTab) return null;
   
    const contentConfig = pageTabsObj[currentTab];
   
    // Clone the component with navigationData prop
    if (contentConfig.content && innerNavigationData) {
      return React.cloneElement(contentConfig.content, {
        navigationData: innerNavigationData,
        onNavigateAway: resetViewEditState // Pass callback to child
      });
    }
   
    return contentConfig.content;
  };
 
  const pageTabsObj = tabConfig[page] || {};
  const currentTabs = Object.keys(pageTabsObj).map(label => ({
    label,
    content: pageTabsObj[label].content,
  }));
 
  return (
    <div className="flex flex-col overflow-hidden bg-white h-full">
      <div className="flex-none z-10 bg-white">
        <TabsHeader
          tabs={currentTabs}
          selectedTab={selectedTab}
          setSelectedTab={handleTabSelect}
          className="shadow-sm"
        />
      </div>
 
      <div className="flex-1 overflow-y-hidden overflow-x-hidden">
        {getCurrentContent()}
      </div>
    </div>
  );
}
 

// Athira new ---------------------------------------------


// import React, { useState, useEffect } from "react";
// import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
// import { tabConfig } from ".././../../Components/Layout/Common/Home/TabConfig";
// import { useSchedulerNavigation } from '../../../Context/SchedulerNavigationContext';

// export default function ViewEditScheduler({ navigationData }) {
//   const [page, setPage] = useState("ViewEditScheduler");
//   const [selectedTab, setSelectedTab] = useState(0);
//   const [innerNavigationData, setInnerNavigationData] = useState(null);
  
//   const { 
//     navigationState, 
//     clearNavigation,
//     getSubmissionData
//   } = useSchedulerNavigation();

//   // Function to find tab index by label
//   const findTabIndexByLabel = (label) => {
//     const pageTabsObj = tabConfig[page] || {};
//     const tabs = Object.keys(pageTabsObj);
//     return tabs.findIndex(tab => tab === label);
//   };

//   // // CRITICAL: Listen for instrument lock completion events
//   // useEffect(() => {
//   //   const handleInstrumentLockCompleted = (event) => {
//   //     console.log('🎯 ViewEditScheduler received instrument-lock-completed event:', event.detail);
      
//   //     const { 
//   //       scheduleId, 
//   //       fromInstrumentLock, 
//   //       shouldNavigateToActivatedTask,
//   //       highlightScheduleId,
//   //       activateData 
//   //     } = event.detail || {};
      
//   //     if (fromInstrumentLock && shouldNavigateToActivatedTask && scheduleId) {
//   //       console.log('🚀 Navigating to Activated Task from Instrument Lock');
        
//   //       // Switch to Activated Task tab
//   //       const activatedTaskIndex = findTabIndexByLabel('Activated Task');
//   //       if (activatedTaskIndex !== -1) {
//   //         setSelectedTab(activatedTaskIndex);
          
//   //         // Prepare navigation data for Activated Task component
//   //         const innerData = {
//   //           scheduleId: scheduleId,
//   //           highlightScheduleId: highlightScheduleId || scheduleId,
//   //           shouldScrollToSchedule: true,
//   //           fromInstrumentLock: true,
//   //           activateData: activateData,
//   //           message: 'Instrument locked successfully. Schedule ready for activation.',
//   //           timestamp: Date.now()
//   //         };
          
//   //         setInnerNavigationData(innerData);
//   //         console.log('✅ Navigation data set for Activated Task:', innerData);
//   //       }
//   //     }
//   //   };
    
//   //   window.addEventListener('instrument-lock-completed', handleInstrumentLockCompleted);
    
//   //   return () => {
//   //     window.removeEventListener('instrument-lock-completed', handleInstrumentLockCompleted);
//   //   };
//   // }, []);

//   // // CRITICAL: Listen for navigation from context
//   // useEffect(() => {
//   //   const handleContextNavigation = () => {
//   //     console.log('🔍 Checking for context navigation in ViewEditScheduler');
      
//   //     const submissionData = getSubmissionData();
//   //     console.log('Context submission data:', submissionData);
      
//   //     if (submissionData?.data) {
//   //       // Check if this is from Instrument Lock
//   //       if (submissionData.data.fromInstrumentLock) {
//   //         console.log('📍 Navigation from Instrument Lock detected');
          
//   //         const activatedTaskIndex = findTabIndexByLabel('Activated Task');
//   //         if (activatedTaskIndex !== -1) {
//   //           setSelectedTab(activatedTaskIndex);
//   //           setInnerNavigationData({
//   //             ...submissionData.data,
//   //             fromInstrumentLock: true
//   //           });
            
//   //           if (clearNavigation) {
//   //             setTimeout(() => {
//   //               clearNavigation();
//   //             }, 100);
//   //           }
//   //         }
//   //       }
//   //       // Check for inner tab navigation
//   //       else if (submissionData.data?.innerTab) {
//   //         const innerTab = submissionData.data.innerTab;
//   //         const tabIndex = findTabIndexByLabel(innerTab);
          
//   //         if (tabIndex !== -1) {
//   //           console.log(`Setting tab to ${innerTab} at index ${tabIndex}`);
//   //           setSelectedTab(tabIndex);
//   //           setInnerNavigationData(submissionData.data);
            
//   //           if (clearNavigation) {
//   //             setTimeout(() => {
//   //               clearNavigation();
//   //             }, 100);
//   //           }
//   //         }
//   //       }
//   //     }
//   //   };
    
//   //   // Check on mount
//   //   handleContextNavigation();
    
//   //   // Also listen for navigation state changes
//   //   const checkInterval = setInterval(handleContextNavigation, 500);
    
//   //   return () => {
//   //     clearInterval(checkInterval);
//   //   };
//   // }, [getSubmissionData, clearNavigation, page]);

//   // Handle direct navigation data from props
//   useEffect(() => {
//     if (navigationData) {
//       console.log('Processing direct navigation data:', navigationData);
      
//       // Check for navigation from Instrument Lock
//       if (navigationData.fromInstrumentLock || 
//           (navigationData.fromDeactivatedTask && navigationData.lockCompleted)) {
        
//         console.log('🚀 Direct navigation from Instrument Lock/DeactivatedTask');
//         const activatedTaskIndex = findTabIndexByLabel('Activated Task');
        
//         if (activatedTaskIndex !== -1) {
//           setSelectedTab(activatedTaskIndex);
          
//           const innerData = {
//             ...navigationData,
//             fromInstrumentLock: true,
//             timestamp: Date.now()
//           };
//           setInnerNavigationData(innerData);
//         }
//       }
//       // Check if navigation is targeting a specific inner tab
//       else if (navigationData.innerTab) {
//         const tabName = navigationData.innerTab;
//         const tabIndex = findTabIndexByLabel(tabName);
        
//         if (tabIndex !== -1) {
//           console.log(`Setting tab to ${tabName} at index ${tabIndex}`);
//           setSelectedTab(tabIndex);
//           setInnerNavigationData(navigationData);
//         }
//       }
//     }
//   }, [navigationData]);

//   // Handle tab selection manually
//   const handleTabSelect = (index) => {
//     console.log(`Tab manually selected: ${index}`);
    
//     // Get tab name for reference
//     const pageTabsObj = tabConfig[page] || {};
//     const tabs = Object.keys(pageTabsObj);
//     const selectedTabName = tabs[index];
    
//     console.log(`Switching to tab: ${selectedTabName}`);
    
//     setSelectedTab(index);
    
//     // Clear navigation data when manually switching tabs
//     // But only if we're not currently processing a navigation
//     if (!innerNavigationData?.fromInstrumentLock) {
//       setInnerNavigationData(null);
//     }
    
//     // Dispatch manual tab change event
//     window.dispatchEvent(new CustomEvent('manual-tab-change', {
//       detail: {
//         parentTabKey: 'Scheduler',
//         childTabKey: 'View Edit Scheduler',
//         innerTab: selectedTabName,
//         isManualClick: true
//       }
//     }));
//   };

//   // Get the current component with navigation data
//   const getCurrentContent = () => {
//     const pageTabsObj = tabConfig[page] || {};
//     const tabs = Object.keys(pageTabsObj);
//     const currentTab = tabs[selectedTab];
    
//     if (!currentTab) return null;
    
//     const contentConfig = pageTabsObj[currentTab];
    
//     // Only pass navigation data if we have it
//     if (contentConfig.content && innerNavigationData) {
//       console.log(`Rendering ${currentTab} with navigation data:`, innerNavigationData);
      
//       return React.cloneElement(contentConfig.content, {
//         navigationData: innerNavigationData,
//         onClearNavigation: () => {
//           console.log('🧹 Clearing navigation data in ViewEditScheduler');
//           setInnerNavigationData(null);
//         }
//       });
//     }
    
//     console.log(`Rendering ${currentTab} without navigation data`);
//     return contentConfig.content;
//   };

//   const pageTabsObj = tabConfig[page] || {};
//   const currentTabs = Object.keys(pageTabsObj).map(label => ({
//     label,
//     content: pageTabsObj[label].content,
//   }));



//   return (
//     <div className="flex flex-col overflow-hidden bg-white h-full">
//       <div className="flex-none z-10 bg-white">
//         <TabsHeader 
//           tabs={currentTabs} 
//           selectedTab={selectedTab} 
//           setSelectedTab={handleTabSelect}
//           parentTabKey="Scheduler"
//           className="shadow-sm"
//         />
//       </div>

//       <div className="flex-1 overflow-y-hidden overflow-x-hidden">
//         {getCurrentContent()}
//       </div>
//     </div>
//   );
// }