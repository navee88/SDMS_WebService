// SchedulerGlobalWrapper.jsx
import React from 'react';
import { SchedulerNavigationProvider } from './SchedulerNavigationContext';

const SchedulerGlobalWrapper = ({ children }) => {
  return (
    <SchedulerNavigationProvider>
      {children}
    </SchedulerNavigationProvider>
  );
};

export default SchedulerGlobalWrapper;