import React, { lazy } from "react";
import { LiaFolderOpen } from "react-icons/lia";
import { LuFileSearch } from "react-icons/lu";
import { GiPadlock } from "react-icons/gi";
import { RiCalendarScheduleLine, RiFileCloudLine } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap } from "@fortawesome/free-solid-svg-icons";
import { FaUser, FaCog } from "react-icons/fa";

/* ================= LAZY IMPORTS ================= */

import DataExplorer from "../../../../Pages/Home/FTP/DataExplorer";

const Searchserverdata = lazy(() =>
  import("../../../../Pages/Home/FTP/Searchserverdata")
);

// Lock
const InstrumentLockSettingsWrapper = lazy(() =>
  import("../../../../Context/InstrumentLockSettingsWrapper")
);
const InstrumentLockTagWrapper = lazy(() =>
  import("../../../../Context/InstrumentLockTagWrapper")
);

// Scheduler
const DataScheduler = lazy(() =>
  import("../../../../Pages/Home/Scheduler/DataScheduler")
);
const ViewEditScheduler = lazy(() =>
  import("../../../../Pages/Home/Scheduler/ViewEditScheduler")
);
const MonitorScheduler = lazy(() =>
  import("../../../../Pages/Home/Scheduler/MonitorScheduler")
);
const LocalFileDeleteScheduler = lazy(() =>
  import("../../../../Pages/Home/Scheduler/LocalFileDeleteScheduler")
);
const ServerFileDeleteScheduler = lazy(() =>
  import("../../../../Pages/Home/Scheduler/ServerFileDeleteScheduler")
);
const DownloadSchedulerWithProvider = lazy(() =>
  import("../../../../Context/DownloadSchedulerWithProvider")
);
const ClientServiceMonitor = lazy(() =>
  import("../../../../Pages/Home/Scheduler/ClientServiceMonitor")
);

// Masters
const BaseMaster = lazy(() =>
  import("../../../../Pages/Home/Masters/BaseMaster")
);
const TagsAndTemplates = lazy(() =>
  import("../../../../Pages/Home/Masters/TagsAndTemplates")
);
const ParentParserKey = lazy(() =>
  import("../../../../Pages/Home/Masters/ParentParserKey")
);

// Storage
const Configuration = lazy(() =>
  import("../../../../Pages/Home/Storage/Configuration")
);
const Rights = lazy(() =>
  import("../../../../Pages/Home/Storage/Rights")
);

// User
const UserManagement = lazy(() =>
  import("../../../../Pages/Home/UserManagment/UserManagement")
);
const Passwordpolicy = lazy(() =>
  import("../../../../Pages/Home/UserManagment/Passwordpolicy")
);

// Logs
const AuditTrailHistory = lazy(() =>
  import("../../../../Pages/Home/LogHistory/AuditTrailHistory")
);
const DownloadLogs = lazy(() =>
  import("../../../../Pages/Home/LogHistory/DownloadLogs")
);
const UploadLogs = lazy(() =>
  import("../../../../Pages/Home/LogHistory/UploadLogs")
);
const RestoreLogs = lazy(() =>
  import("../../../../Pages/Home/LogHistory/RestoreLogs")
);
const SchedulerConfigLogs = lazy(() =>
  import("../../../../Pages/Home/LogHistory/SchedulerConfigLogs")
);
const InstrumentLogs = lazy(() =>
  import("../../../../Pages/Home/LogHistory/InstrumentLogs")
);
const ServerAndLocalFileDeleteLogs = lazy(() =>
  import("../../../../Pages/Home/LogHistory/ServerAndLocalFileDeleteLogs")
);

/* ================= MENU CONFIG ================= */

export const menuConfig = [
  {
    icon: <LiaFolderOpen />,
    label: "FTP Data View",
    subItems: [
      { label: "Data Explorer", content: DataExplorer },
      { label: "Search Server Data", content: Searchserverdata },
    ],
  },
  {
    icon: <GiPadlock />,
    label: "Lock Settings",
    subItems: [
      // { label: "Instrument Lock Settings", content: InstrumentLockTagWrapper  },
      { label: "Instrument Lock Settings", content: InstrumentLockSettingsWrapper },
    ],
  },
  {
    icon: <RiCalendarScheduleLine />, 
    label: "Scheduler",
    subItems: [
      { label: "Data Scheduler", content: DataScheduler   },
      { label: "View Edit Scheduler", content: ViewEditScheduler   },
      { label: "Monitor Scheduler", content: MonitorScheduler },
      { label: "Local File Delete Scheduler", content: LocalFileDeleteScheduler },
      { label: "Server File Delete Scheduler", content: ServerFileDeleteScheduler },
      { label: "Download Scheduler", content: DownloadSchedulerWithProvider },
      { label: "Client Service Monitor", content: ClientServiceMonitor },
    ],
  },
  {
    icon: <FontAwesomeIcon icon={faSitemap} />,
    label: "Masters",
    subItems: [
      { label: "Base Master", content: BaseMaster },
      { label: "Tags and Templates", content: TagsAndTemplates },
      { label: "Parent Parser Key", content: ParentParserKey },
    ],
  },
  {
    icon: <RiFileCloudLine />,
    label: "Storage",
    subItems: [
      { label: "Configuration", content: Configuration },
      { label: "Rights", content: Rights },
    ],
  },
  {
    icon: <FaUser />,
    label: "User Management",
    subItems: [
      { label: "User Management", content: UserManagement },
      { label: "Password Policy", content: Passwordpolicy },
    ],
  },
  {
    icon: <LuFileSearch />,
    label: "Log History",
    subItems: [
      { label: "Audit Trail History", content: AuditTrailHistory },
      { label: "Download Logs", content: DownloadLogs },
      { label: "Upload Logs", content: UploadLogs },
      { label: "Restore Logs", content: RestoreLogs },
      { label: "Server & Local File Delete", content: ServerAndLocalFileDeleteLogs },
      { label: "Scheduler Config. Logs", content: SchedulerConfigLogs },
      { label: "Instrument Logs", content: InstrumentLogs },
    ],
  },
  {
    icon: <FaCog />,
    label: "Settings",
    subItems: [
      { label: "Preferences", content: () => <div>Preferences</div> },
      { label: "License Information", content: () => <div>License Information</div> },
      { label: "Workflow Setup", content: () => <div>Workflow Setup</div> },
      { label: "Audit Trail Configuration", content: () => <div>Audit Trail Configuration</div> },
      { label: "Maintenance", content: () => <div>Maintenance</div> },
    ],
  },
];
