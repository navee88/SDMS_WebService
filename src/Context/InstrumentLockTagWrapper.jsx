// Context/InstrumentLockTagWrapper.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import { useSchedulerNavigation } from './SchedulerNavigationContext';
import InstrumentLockTag from '../Components/Home/SubFolders/LockSettings/InstrumentLockSettings/InstrumentLocksandTags';

const InstrumentLockTagWrapper = (props) => {
  const { getSubmissionData, clearNavigation, navigateToTab } = useSchedulerNavigation();
  const submissionData = getSubmissionData();
  const hasProcessedData = useRef(false);

  // Reset flag when component unmounts
  useEffect(() => {
    return () => {
      hasProcessedData.current = false;
    };
  }, []);

  // Handler to navigate back to My Instruments
  const handleNavigateToMyInstruments = useCallback(() => {
    console.log('🔄 Navigating to My Instruments');
    hasProcessedData.current = false;
    navigateToTab('Lock Settings', 'My Instruments');
  }, [navigateToTab]);

  // Safe clear navigation handler
  const handleClearNavigation = useCallback(() => {
    console.log('Manual clear navigation requested');
    hasProcessedData.current = false;
    clearNavigation();
  }, [clearNavigation]);

  return (
    <InstrumentLockTag 
      {...props}
      navigationData={submissionData}
      onClearNavigation={handleClearNavigation}
      onNavigateToMyInstruments={handleNavigateToMyInstruments}
    />
  );
};

export default InstrumentLockTagWrapper;