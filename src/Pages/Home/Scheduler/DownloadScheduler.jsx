import React, { useState } from "react";
import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
import { tabConfig } from ".././../../Components/Layout/Common/Home/TabConfig";
import { useDownloadScheduler } from "../../../Context/DownloadSchedulerContext";

export default function DownloadScheduler() {
  const [page] = useState("DownloadScheduler");

  const {
    activeTabIndex,
    setActiveTabIndex,
    clearAutoConfigData,
  } = useDownloadScheduler();

  const pageTabsObj = tabConfig[page] || {};
  const currentTabs = Object.keys(pageTabsObj).map((label) => ({
    label,
    content: pageTabsObj[label].content,
  }));

  const handleTabChange = (index) => {
    setActiveTabIndex(index);

    // 🔴 Clear auto data when leaving Auto tab
    if (index !== 0) {
      clearAutoConfigData();
    }
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-white">
      <div className="flex-none z-10 bg-white">
        <TabsHeader
          tabs={currentTabs}
          selectedTab={activeTabIndex}
          setSelectedTab={handleTabChange}
          className="shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-scroll overflow-x-hidden pb-20">
        {currentTabs[activeTabIndex]?.content || null}
      </div>
    </div>
  );
}
