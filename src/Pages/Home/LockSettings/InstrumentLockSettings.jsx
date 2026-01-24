import React, { useState, useEffect } from "react";
import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
import { tabConfig } from "../../../Components/Layout/Common/Home/TabConfig";
import { useInstrumentLock } from "../../../Context/InstrumentLockContext";

export default function InstrumentLockSettings() {
  const [page] = useState("InstrumentLockSettings");
  const { selectedTabIndex, switchToTabByIndex, clearNavigationData, navigationData } = useInstrumentLock();
  
  const [localTabIndex, setLocalTabIndex] = useState(selectedTabIndex);

  useEffect(() => {
    setLocalTabIndex(selectedTabIndex);
  }, [selectedTabIndex]);

  const pageTabsObj = tabConfig[page] || {};
  
  const currentTabs = Object.keys(pageTabsObj).map(label => {
    const tabContent = pageTabsObj[label].content;
    return {
      label,
      content: tabContent,
    };
  });

  const handleTabChange = (index) => {
    clearNavigationData();
    
    setLocalTabIndex(index);
    
    switchToTabByIndex(index, { 
      autoSelectInstrument: false,
      instrumentId: null 
    });
  };

  useEffect(() => {
    return () => {
      clearNavigationData();
    };
  }, [clearNavigationData]);

  const TestComponent = ({ label }) => (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">{label}</h2>
      <p>This is a test component for {label}</p>
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Button
      </button>
    </div>
  );

  const fallbackTabs = [
    { label: "Instrument Locks and Tags", content: <TestComponent label="Instrument Locks and Tags" /> },
    { label: "Data", content: <TestComponent label="Data" /> },
    { label: "My Instruments", content: <TestComponent label="My Instruments" /> },
    { label: "Other Instruments", content: <TestComponent label="Other Instruments" /> },
  ];

  const tabsToUse = currentTabs.length > 0 ? currentTabs : fallbackTabs;

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-white">
      <div className="flex-none z-10 bg-white">
        <TabsHeader 
          tabs={tabsToUse} 
          selectedTab={localTabIndex}
          setSelectedTab={handleTabChange}
          className="shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-scroll overflow-x-hidden pb-20">
        {tabsToUse[localTabIndex]?.content || (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-500">No tab content found!</h2>
            <p>Selected tab index: {localTabIndex}</p>
            <p>Total tabs: {tabsToUse.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}