// InstrumentLockTagWrapper.jsx
import React from 'react';
import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';
import InstrumentLockTag from './InstrumentLocksandTags';
 
const InstrumentLockTagWrapper = (props) => {
  const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
  const submissionData = getSubmissionData();
 
  return (
    <InstrumentLockTag
      {...props}
      navigationData={submissionData}
      onClearNavigation={clearNavigation}
    />
  );
};
 
export default InstrumentLockTagWrapper;
 