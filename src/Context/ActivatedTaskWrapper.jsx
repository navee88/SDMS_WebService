// // ActivatedTaskWrapper.jsx - UPDATED
// import React from 'react';
// import { useSchedulerNavigation } from './SchedulerNavigationContext';
// import ActivatedTask from '../Components/Home/SubFolders/Scheduler/ViewEditScheduler/ActivatedTask';

// const ActivatedTaskWrapper = (props) => {
//   // Get data from context
//   const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
//   const submissionData = getSubmissionData();

//   return (
//     <ActivatedTask 
//       {...props}
//       submissionData={submissionData}
//       onClearNavigation={clearNavigation}
//     />
//   );
// };

// export default ActivatedTaskWrapper;

//Kirubhakaran
// ActivatedTaskWrapper.jsx
// import React from 'react';
// import { SchedulerNavigationProvider } from './SchedulerNavigationContext';
// import ActivatedTask from '../Components/Home/SubFolders/Scheduler/ViewEditScheduler/ActivatedTask';


// const ActivatedTaskWrapper = (props) => {
//   return (
//     <SchedulerNavigationProvider>
//       <ActivatedTask {...props} />
//     </SchedulerNavigationProvider>
//   );
// };

// export default ActivatedTaskWrapper;
//------------------------------------------------------

//Athira

import React, { useEffect } from 'react';
import { useSchedulerNavigation } from './SchedulerNavigationContext';
import ActivatedTask from '../Components/Home/SubFolders/Scheduler/ViewEditScheduler/ActivatedTask';
 
const ActivatedTaskWrapper = (props) => {
  const { getSubmissionData, clearNavigation, navigateToActivatedTask } = useSchedulerNavigation();
  const submissionData = getSubmissionData();
 
  // Listen for lock completion events
  useEffect(() => {
    const handleNavigateToActivatedTask = (event) => {
      if (event.detail?.fromLock) {
        console.log('🎯 Received navigateToActivatedTask event from lock:', event.detail);
       
        if (navigateToActivatedTask) {
          navigateToActivatedTask(event.detail);
        }
      }
    };
   
    window.addEventListener('navigateToActivatedTask', handleNavigateToActivatedTask);
   
    return () => {
      window.removeEventListener('navigateToActivatedTask', handleNavigateToActivatedTask);
    };
  }, [navigateToActivatedTask]);
 
  return (
    <ActivatedTask
      {...props}
      navigationData={submissionData}
      onClearNavigation={clearNavigation}
      onNavigateAway={props.onNavigateAway} // Pass the callback
    />
  );
};
 
export default ActivatedTaskWrapper;
 
 
 
 
 
 