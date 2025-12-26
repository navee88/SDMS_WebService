// import React, { useState, useEffect } from "react";
// import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
// import { tabConfig } from ".././../../Components/Layout/Common/Home/TabConfig";

// export default function Searchserverdata() {
//   const [page, setPage] = useState("SearchServerData");
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
//       <TabsHeader
//         tabs={currentTabs}
//         selectedTab={selectedTab}
//         setSelectedTab={setSelectedTab}
//       />
//       <div className="p-4">
//         {currentTabs[selectedTab]?.content || null}
//       </div>
//     </>
//   );
// }

import React, { useState } from "react";
import TabsHeader from "../../../Components/Layout/Common/Home/TabsHeader";
import SearchServerData from "../../../Components/Home/SubFolders/FTPDataView/SearchServerData/SearchServerData";

const Searchserverdata = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { label: "Search Server Data", component: SearchServerData },
  ];

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-white">
      <TabsHeader
        tabs={tabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      <div className="flex-1 overflow-y-scroll overflow-x-hidden pb-20">
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

export default Searchserverdata;

