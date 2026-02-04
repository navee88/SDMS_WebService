// import React from 'react';
// import { useSchedulerNavigation } from './SchedulerNavigationContext';
// import DeactivatedTask from '../Components/Home/SubFolders/Scheduler/ViewEditScheduler/DeactivatedTask';

// const DeactivatedTaskWrapper = (props) => {
//     // Get data from context
//     const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
//     const submissionData = getSubmissionData();

//     return (
//         <DeactivatedTask 
//             {...props}
//             submissionData={submissionData}
//             onClearNavigation={clearNavigation}
//         />
//     );
// };

// export default DeactivatedTaskWrapper;

// ------------------- Kirubhakaran ----------------------------
// import React from 'react';
// // import { SchedulerNavigationProvider } from '../../../../../Context/SchedulerNavigationContext';
// import { SchedulerNavigationProvider } from './SchedulerNavigationContext';
// // import DeactivedTask from './DeactivatedTask'
// import DeactivatedTask from '../Components/Home/SubFolders/Scheduler/ViewEditScheduler/DeactivatedTask';

// const DeactivedTaskWrapper = ({ navigationData }) => {
//   return (
//     <SchedulerNavigationProvider>
//       <DeactivatedTask navigationData={navigationData} />
//     </SchedulerNavigationProvider>
//   );
// };

// export default DeactivedTaskWrapper;

// -------------- Athira ----------------------------------------------

 
// import React, { useEffect, useState } from 'react';
// import { useSchedulerNavigation } from './SchedulerNavigationContext';
// import DeactivedTask from '../Components/Home/SubFolders/Scheduler/ViewEditScheduler/DeactivatedTask';
 
// const DeactivatedTaskWrapper = (props) => {
//   const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
//   const [navData, setNavData] = useState(null);
 
//   useEffect(() => {
//     console.log('=== DeactivatedTaskWrapper Mounted ===');
   
//     const submissionData = getSubmissionData();
//     console.log('Submission data from context:', submissionData);
   
//     if (submissionData) {
//       if (submissionData.data?.innerTab === 'Deactivated Task') {
//         console.log('Navigation data for Deactivated Task:', submissionData.data);
//         setNavData(submissionData.data);
//         clearNavigation();
//       } else if (submissionData.targetTab === 'Deactivated Task') {
//         console.log('Direct navigation to Deactivated Task:', submissionData.data);
//         setNavData(submissionData.data);
//         clearNavigation();
//       }
//     }
   
//     if (props.navigationData) {
//       console.log('Navigation data from props:', props.navigationData);
//       setNavData(props.navigationData);
//     }
//   }, [getSubmissionData, clearNavigation, props.navigationData]);
 
//   return (
//     <DeactivedTask
//       {...props}
//       navigationData={navData || props.navigationData}
//       onNavigateAway={props.onNavigateAway} // Pass the callback
//     />
//   );
// };
 
// export default DeactivatedTaskWrapper;


import React, { useEffect } from 'react';
import { useSchedulerNavigation } from './SchedulerNavigationContext';
import DeactivedTask from '../Components/Home/SubFolders/Scheduler/ViewEditScheduler/DeactivatedTask';
 
const DeactivedTaskWrapper = (props) => {
  const { getSubmissionData, clearNavigation, navigateToDeactivedTask } = useSchedulerNavigation();
  const submissionData = getSubmissionData();
 
  // Listen for lock completion events
  useEffect(() => {
    const handleNavigateToDeactivedTask = (event) => {
      if (event.detail?.fromLock) {
        console.log('🎯 Received navigateToActivatedTask event from lock:', event.detail);
       
        if (navigateToDeactivedTask) {
          navigateToDeactivedTask(event.detail);
        }
      }
    };
   
    window.addEventListener('navigateToDeactivedTask', handleNavigateToDeactivedTask);
   
    return () => {
      window.removeEventListener('navigateToDeactivedTask', handleNavigateToDeactivedTask);
    };
  }, [navigateToDeactivedTask]);
 
  return (
    <DeactivedTask
      {...props}
      navigationData={submissionData}
      onClearNavigation={clearNavigation}
      onNavigateAway={props.onNavigateAway} // Pass the callback
    />
  );
};
 
export default DeactivedTaskWrapper;
 
 
 
 
 
 
 