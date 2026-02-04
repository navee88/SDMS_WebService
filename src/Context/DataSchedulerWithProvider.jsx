import React from "react";
import { SchedulerNavigationProvider } from "./SchedulerNavigationContext";
import DataScheduler from "../Pages/Home/Scheduler/DataScheduler";

const DataSchedulerWithProvider = () => {
  return (
    <SchedulerNavigationProvider>
      <DataScheduler />
    </SchedulerNavigationProvider>
  );
};

export default DataSchedulerWithProvider;