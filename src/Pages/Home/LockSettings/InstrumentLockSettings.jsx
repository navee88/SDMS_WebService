// File: src/Components/Home/SubFolders/LockSettings/InstrumentLockSettings/InstrumentLockSettings.js
import React, { useState, useEffect } from "react";
import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
import { tabConfig } from ".././../../Components/Layout/Common/Home/TabConfig";
import { useInstrumentLock } from "../../../Context/InstrumentLockContext";

export default function InstrumentLockSettings() {
  const [page] = useState("InstrumentLockSettings");
  const { selectedTabIndex, switchToTabByIndex } = useInstrumentLock();

  const pageTabsObj = tabConfig[page] || {};
  const currentTabs = Object.keys(pageTabsObj).map(label => ({
    label,
    content: pageTabsObj[label].content,
  }));

  // Custom setSelectedTab that updates context
  const handleTabChange = (index) => {
    switchToTabByIndex(index);
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-white">
      <div className="flex-none z-10 bg-white">
        <TabsHeader 
          tabs={currentTabs} 
          selectedTab={selectedTabIndex} 
          setSelectedTab={handleTabChange}
          className="shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-scroll overflow-x-hidden pb-20">
        {currentTabs[selectedTabIndex]?.content || null}
      </div>
    </div>
  );
}