import { LiaFolderOpen } from "react-icons/lia";
import { LuFileSearch } from "react-icons/lu";
import { GiPadlock } from "react-icons/gi";
import { RiCalendarScheduleLine, RiFileCloudLine } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap } from "@fortawesome/free-solid-svg-icons";
import { FaUser, FaCog } from "react-icons/fa";

// ✅ IMPORT ALL COMPONENTS AS REFERENCES (NOT JSX)
import DataExplorer from "../../../../Pages/Home/FTP/DataExplorer";
import Searchserverdata from "../../../../Pages/Home/FTP/Searchserverdata";
import UserManagement from "../../../../Pages/Home/UserManagment/UserManagement";
import Passwordpolicy from "../../../../Pages/Home/UserManagment/Passwordpolicy";
import InstrumentLockSettings from "../../../../Pages/Home/LockSettings/InstrumentLockSettings";
import MonitorScheduler from "../../../../Pages/Home/Scheduler/MonitorScheduler";
import AuditTrailHistory from "../../../../Pages/Home/LogHistory/AuditTrailHistory";
import DownloadLogs from "../../../../Pages/Home/LogHistory/DownloadLogs";
import UploadLogs from "../../../../Pages/Home/LogHistory/UploadLogs";
import RestoreLogs from "../../../../Pages/Home/LogHistory/RestoreLogs";
import SchedulerConfigLogs from "../../../../Pages/Home/LogHistory/SchedulerConfigLogs";
import InstrumentLogs from "../../../../Pages/Home/LogHistory/InstrumentLogs";
import ServerAndLocalFileDeleteLogs from "../../../../Pages/Home/LogHistory/ServerAndLocalFileDeleteLogs";
import DownloadScheduler from "../../../../Pages/Home/Scheduler/DownloadScheduler";
import DataScheduler from "../../../../Pages/Home/Scheduler/DataScheduler";
import BaseMaster from "../../../../Pages/Home/Masters/BaseMaster";
import ParentParserKey from "../../../../Pages/Home/Masters/ParentParserKey";
import TagsAndTemplates from "../../../../Pages/Home/Masters/TagsAndTemplates";
import ViewEditScheduler from "../../../../Pages/Home/Scheduler/ViewEditScheduler";
import LocalFileDeleteScheduler from "../../../../Pages/Home/Scheduler/LocalFileDeleteScheduler";
import ServerFileDeleteScheduler from "../../../../Pages/Home/Scheduler/ServerFileDeleteScheduler";
import ClientServiceMonitor from "../../../../Pages/Home/Scheduler/ClientServiceMonitor";
import Configuration from "../../../../Pages/Home/Storage/Configuration";
import Rights from "../../../../Pages/Home/Storage/Rights";

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
      { label: "Instrument Lock Settings", content: InstrumentLockSettings },
    ],
  },

  {
    icon: <RiCalendarScheduleLine />,
    label: "Scheduler",
    subItems: [
      { label: "Data Scheduler", content: DataScheduler },
      { label: "View Edit Scheduler", content: ViewEditScheduler },
      { label: "Monitor Scheduler", content: MonitorScheduler },
      { label: "Local File Delete Scheduler", content: LocalFileDeleteScheduler },
      { label: "Server File Delete Scheduler", content: ServerFileDeleteScheduler },
      { label: "Download Scheduler", content: DownloadScheduler },
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