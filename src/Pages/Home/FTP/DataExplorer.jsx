// import React, { useState, useEffect } from "react";
// import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
// import { tabConfig } from ".././../../Components/Layout/Common/Home/TabConfig";

// export default function DataExplorer() {
//   const [page, setPage] = useState("DataExplorer");
//   const [selectedTab, setSelectedTab] = useState(0);

//   useEffect(() => {
//     setSelectedTab(0);
//   }, [page]);

//   const pageTabsObj = tabConfig[page] || {};
//   const currentTabs = Object.keys(pageTabsObj).map(label => ({
//     label,
//     content: pageTabsObj[label].content,
//   }));

//   return (
//     <>

// <div className="flex flex-col h-dvh overflow-hidden bg-white">
  

//   <div className="flex-none z-10 bg-white">
//     <TabsHeader 
//       tabs={currentTabs} 
//       selectedTab={selectedTab} 
//       setSelectedTab={setSelectedTab}
//       className="shadow-sm"
//     />
//   </div>

//   <div className="flex-1 overflow-y-scroll overflow-x-hidden pb-20">
//     {currentTabs[selectedTab]?.content || null}
//   </div>

// </div>

//     </>
//   );
// }


import React, { useState } from "react";
import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";

import ServerData from "../../../Components/Home/SubFolders/FTPDataView/ServerData/ServerData";
import TemplateView from "../../../Components/Home/SubFolders/FTPDataView/DataExplorer/TemplateView";
import DataLogger from "../../../Components/Home/SubFolders/FTPDataView/DataExplorer/DataLogger";

const DataExplorer = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { label: "Server Data", component: ServerData },
    { label: "Template View", component: TemplateView },
    { label: "Data Logger", component: DataLogger },
  ];

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-white">
      <TabsHeader
        tabs={tabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      <div className="flex-1 overflow-y-scroll overflow-x-hidden mb-10">
        {tabs.map((tab, index) => {
          const Component = tab.component;
          return (
            <div
              key={tab.label}
              style={{
                display: selectedTab === index ? "block" : "none",
                height: "100%",
              }}
            >
              <Component />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataExplorer;
