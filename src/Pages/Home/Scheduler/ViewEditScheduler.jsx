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
 