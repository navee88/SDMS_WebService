// File: src/Components/Home/SubFolders/LockSettings/InstrumentLockSettings/InstrumentLockSettingsWrapper.js
import React from 'react';
import { InstrumentLockProvider } from '../Context/InstrumentLockContext';
import InstrumentLockSettings from '../Pages/Home/LockSettings/InstrumentLockSettings';

const InstrumentLockSettingsWrapper = () => {
  return (
    <InstrumentLockProvider>
      <InstrumentLockSettings />
    </InstrumentLockProvider>
  );
};

export default InstrumentLockSettingsWrapper;