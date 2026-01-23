// ActivatedTaskWrapper.jsx
import React from 'react';
import { SchedulerNavigationProvider } from '../../../../../Context/SchedulerNavigationContext';
import ActivatedTask from './ActivatedTask';

const ActivatedTaskWrapper = (props) => {
  return (
    <SchedulerNavigationProvider>
      <ActivatedTask {...props} />
    </SchedulerNavigationProvider>
  );
};

export default ActivatedTaskWrapper;