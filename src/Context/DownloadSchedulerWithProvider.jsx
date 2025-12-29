import React from "react";
import { DownloadSchedulerProvider } from "./DownloadSchedulerContext";
import DownloadScheduler from "../Pages/Home/Scheduler/DownloadScheduler";

const DownloadSchedulerWithProvider = () => {
  return (
    <DownloadSchedulerProvider>
      <DownloadScheduler />
    </DownloadSchedulerProvider>
  );
};

export default DownloadSchedulerWithProvider;

