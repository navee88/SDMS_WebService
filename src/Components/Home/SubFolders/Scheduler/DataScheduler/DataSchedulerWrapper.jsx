// DataSchedulerWrapper.jsx
import React from 'react';
import { SchedulerNavigationProvider } from '../../../../../Context/SchedulerNavigationContext';
import DataScheduler from './DataScheduler';

const DataSchedulerWrapper = () => {
  return (
    <SchedulerNavigationProvider>
      <DataScheduler />
    </SchedulerNavigationProvider>
  );
};

export default DataSchedulerWrapper;