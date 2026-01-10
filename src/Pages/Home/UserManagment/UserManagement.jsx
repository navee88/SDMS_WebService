import React, { useState, useEffect } from "react";
import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
import { tabConfig } from ".././../../Components/Layout/Common/Home/TabConfig";

export default function UserManagement() {
  const [page, setPage] = useState("UserManagement");
  const [selectedTab, setSelectedTab] = useState(6);

  useEffect(() => {
    setSelectedTab(0);
  }, [page]);

  const pageTabsObj = tabConfig[page] || {};
  const currentTabs = Object.keys(pageTabsObj).map(label => ({
    label,
    content: pageTabsObj[label].content,
  }));

  return (
    <>

<div className="flex flex-col h-dvh overflow-hidden bg-white usm">
  

  <div className="flex-none z-10 bg-white">
    <TabsHeader 
      tabs={currentTabs} 
      selectedTab={selectedTab} 
      setSelectedTab={setSelectedTab}
      className="shadow-sm"
    />
  </div>

  <div className="flex-1 overflow-y-scroll overflow-x-hidden pb-20">
    {currentTabs[selectedTab]?.content || null}
  </div>

</div>

    </>
  );
}
