import React, { createContext, useContext, useState } from "react";

const DownloadSchedulerContext = createContext(null);

export const DownloadSchedulerProvider = ({ children }) => {
  const [autoConfigData, setAutoConfigData] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const clearAutoConfigData = () => setAutoConfigData(null);

  return (
    <DownloadSchedulerContext.Provider
      value={{
        autoConfigData,
        setAutoConfigData,
        clearAutoConfigData,
        activeTabIndex,
        setActiveTabIndex,
      }}
    >
      {children}
    </DownloadSchedulerContext.Provider>
  );
};

export const useDownloadScheduler = () => {
  const ctx = useContext(DownloadSchedulerContext);
  if (!ctx) {
    throw new Error("useDownloadScheduler must be used inside Provider");
  }
  return ctx;
};
