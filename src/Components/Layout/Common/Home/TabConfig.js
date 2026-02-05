import DataLogger from "../../../Home/SubFolders/FTPDataView/DataExplorer/DataLogger";
import ServerData from "../../../Home/SubFolders/FTPDataView/ServerData/ServerData";

import TemplateView from "../../../Home/SubFolders/FTPDataView/DataExplorer/TemplateView";
import SearchServerData from "../../../Home/SubFolders/FTPDataView/SearchServerData/SearchServerData";
import MyInstruments from "../../../Home/SubFolders/LockSettings/InstrumentLockSettings/MyInstruments";
import OtherInstruments from "../../../Home/SubFolders/LockSettings/InstrumentLockSettings/OtherInstruments";
import InstrumentLockTag from "../../../Home/SubFolders/LockSettings/InstrumentLockSettings/InstrumentLocksandTags";
import InstrumentDataPage from "../../../Home/SubFolders/LockSettings/InstrumentLockSettings/Data";
import UploadQueue from "../../../Home/SubFolders/Scheduler/MonitorScheduler/UploadQueue";
import FailedQueue from "../../../Home/SubFolders/Scheduler/MonitorScheduler/FailedQueue";
import RestoreMonitor from "../../../Home/SubFolders/Scheduler/MonitorScheduler/RestoreMonitor";
import DownloadMonitor from "../../../Home/SubFolders/Scheduler/MonitorScheduler/DownloadMonitor";
import UploadMonitor from "../../../Home/SubFolders/Scheduler/MonitorScheduler/UploadMonitor";
import CFRSettings from "../../../Home/SubFolders/LogHistory/AuditTrailHistory/CFRSettings";
import AuditTrailHistory from "../../../Home/SubFolders/LogHistory/AuditTrailHistory/AuditTrailHistory";
import DownloadErrorLogs from "../../../Home/SubFolders/LogHistory/DownloadLogs/DownloadErrorLogs";
import DownloadLogs from "../../../Home/SubFolders/LogHistory/DownloadLogs/DownloadLogs";
import UploadErrorLogs from "../../../Home/SubFolders/LogHistory/UploadLogs/UploadErrorLogs";
import UploadLogs from "../../../Home/SubFolders/LogHistory/UploadLogs/UploadLogs";
import ManualUploadLogs from "../../../Home/SubFolders/LogHistory/UploadLogs/ManualUploadLogs";
import RestoreLogs from "../../../Home/SubFolders/LogHistory/RestoreLogs/RestoreLogs";
import RestoreErrorLogs from "../../../Home/SubFolders/LogHistory/RestoreLogs/RestoreErrorLogs";
import ServerFileDeleteLogs from "../../../Home/SubFolders/LogHistory/Server&LocalFileDeleteLogs/ServerFileDeleteLogs";
import LocalFileDeleteLogs from "../../../Home/SubFolders/LogHistory/Server&LocalFileDeleteLogs/LocalFileDeleteLogs";
import InstrumentLogs from "../../../Home/SubFolders/LogHistory/InstrumentLogs/InstrumentLogs";
import SchedulerConfigLogs from "../../../Home/SubFolders/LogHistory/SchedulerConfigLogs/SchedulerConfigLogs";
import AutoDownloadConfiguration from "../../../Home/SubFolders/Scheduler/DownloadScheduler/AutoDownloadConfiguration";
import ViewDownloadConfiguration from "../../../Home/SubFolders/Scheduler/DownloadScheduler/ViewDownloadConfiguration";
import ClientServiceMonitor from "../../../Home/SubFolders/Scheduler/ClientServiceMonitor/ClientServiceMonitor";
import Domain from "../../../Home/SubFolders/Masters/BaseMaster/Domain";
import Client from "../../../Home/SubFolders/Masters/BaseMaster/ClientMaster/Client";
import Instrument from "../../../Home/SubFolders/Masters/BaseMaster/InstrumentMaster/Instrument";
import Site from "../../../Home/SubFolders/Masters/BaseMaster/Site";
import TagMaster from "../../../Home/SubFolders/Masters/TagsAndTemplate/TagMaster";
import TemplateMapping from "../../../Home/SubFolders/Masters/TagsAndTemplate/TemplateMapping";
import ParserKey from "../../../Home/SubFolders/Masters/ParentParserKey/ParserKey";
import ServerConfiguration from "../../../Home/SubFolders/Storage/Configuration/ServerConfiguration";
import ServerDriveConfiguration from "../../../Home/SubFolders/Storage/Configuration/ServerDriveConfiguration";
import StorageConfiguration from "../../../Home/SubFolders/Storage/Configuration/StorageConfiguration";
import StorageUserMapping from "../../../Home/SubFolders/Storage/Rights/StorageUserMapping";
import UserGroup from "../../../Home/SubFolders/UserManagementFolder/UserManagement/UserGroup";
import UserMaster from "../../../Home/SubFolders/UserManagementFolder/UserManagement/UserMaster";
import UserRights from "../../../Home/SubFolders/UserManagementFolder/UserManagement/UserRights";
import OnlineUsers from "../../../Home/SubFolders/UserManagementFolder/UserManagement/OnlineUsers";
import PasswordPolicy from "../../../Home/SubFolders/UserManagementFolder/PasswordPolicy/PasswordPolicy"; //deletee
import DataScheduler from "../../../Home/SubFolders/Scheduler/DataScheduler/DataScheduler";
import DeactivatedTask from "../../../Home/SubFolders/Scheduler/ViewEditScheduler/DeactivatedTask";
import ActivatedTask from "../../../Home/SubFolders/Scheduler/ViewEditScheduler/ActivatedTask";
import RetiredTask from "../../../Home/SubFolders/Scheduler/ViewEditScheduler/RetiredTask";
import EditTask from "../../../Home/SubFolders/Scheduler/ViewEditScheduler/EditTask";
import LocalFileDeleteScheduler from "../../../Home/SubFolders/Scheduler/LocalFileDeleteScheduler/LocalFileDeleteScheduler";
import ServerFileDeleteScheduler from "../../../Home/SubFolders/Scheduler/ServerFileDeleteScheduler/ServerFileDeleteScheduler";
import UserRoleMapping from "../../../Home/SubFolders/UserManagementFolder/UserManagement/UserRoleMapping";

//Added These 6 imports by kirubhakaran on 23-01-2026
// import { DeactivatedTaskWrapper } from '../../../Home/SubFolders/Scheduler/ViewEditScheduler/DeactivatedTask';
import InstrumentLockTagWrapper from '../../../../Context/InstrumentLockTagWrapper';
// import DataSchedulerWrapper from '../../../Home/SubFolders/Scheduler/DataScheduler/DataSchedulerWrapper';
import ActivatedTaskWrapper from '../../../../Context/ActivatedTaskWrapper';
import DeactivatedTaskWrapper from '../../../../Context/DeactivatedTaskWrapper';


export const tabConfig = {
  //completed
  DataExplorer: {
    "Server Data": { content: <ServerData /> },
    "Template View": { content: <TemplateView /> },
    "Data Logger": { content: <DataLogger /> },
  },
  //completed
  SearchServerData: {
    "SearchServerData": { content: <SearchServerData /> }
  },
  //completed
  InstrumentLockSettings: {
    "Instrument Locks and Tags": { content: <InstrumentLockTagWrapper /> }, //Modified by kirubhakaran on 23-01-2026  chagned from  <InstrumentLockTag /> this to <InstrumentLockTagWrapper />
    "Data": { content: <InstrumentDataPage /> },
    "My Instruments": { content: <MyInstruments /> },
    "Other Instruments": { content: <OtherInstruments /> },
  },
  DataScheduler: {
    "Data Scheduler": {
      content:
        <DataScheduler />
    },
  },
  ViewEditScheduler: {
    "Deactivated Task": { content: <DeactivatedTaskWrapper /> },//Modified by kirubhakaran on 23-01-2026 changed from <DeactivatedTask /> this to <DeactivatedTaskWrapper />},
    "Activated Task": {
      content:
        <ActivatedTaskWrapper />
    }, //Modified by kirubhakaran on 23-01-2026 changed from <ActivatedTask /> this to <ActivatedTaskWrapper />},
    "Retired Task": { content: <RetiredTask /> },
    "Edit Task": { content: <EditTask /> },
  },
  //completed
  MonitorScheduler: {
    "Upload Queue": { content: <UploadQueue /> },
    "Failed Queue": { content: <FailedQueue /> },
    "Upload Monitor": { content: <UploadMonitor /> },
    "Restore Monitor": { content: <RestoreMonitor /> },
    "Download Monitor": { content: <DownloadMonitor /> },
  },
  //completed
  LocalFileDeleteScheduler: {
    "Local File Delete Scheduler": { content: <LocalFileDeleteScheduler /> },
  },
  ServerFileDeleteScheduler: {
    "Server File Delete Scheduler": { content: <ServerFileDeleteScheduler /> },
  },
  //completed
  DownloadScheduler: {
    "Auto Download Configuration": { content: <AutoDownloadConfiguration /> },
    "View Download Configuration": { content: <ViewDownloadConfiguration /> }

  },
  //completed
  ClientServiceMonitor: {
    "Client Service Monitor": { content: <ClientServiceMonitor /> },
  },
  //completed
  BaseMaster: {
    "Domain": { content: <Domain /> },
    "Client": { content: <Client /> },
    "Instrument": { content: <Instrument /> },
    "Site": { content: <Site /> },

  },
  //completed
  TagsAndTemplates: {
    "Tag Master": { content: <TagMaster /> },
    "Template Mapping": { content: <TemplateMapping /> },
  },
  //completed
  ParentParserKey: {
    "Parser Key": { content: <ParserKey /> },
  },
  //completed
  Configuration: {
    "Server Configuration": { content: <ServerConfiguration /> },
    "Server Drive Configuration": { content: <ServerDriveConfiguration /> },
    "Storage Configuration": { content: <StorageConfiguration /> },
  },
  //completed
  Rights: {
    "Storage User Mapping": { content: <StorageUserMapping /> },
  },
  //completed
  UserManagement:{
    // "User Group": { content: <UserGroup /> },
    // "User Master": { content: <UserMaster /> },
    "UserRoleMapping":{content:<UserRoleMapping/>},
    "User Rights": { content: <UserRights /> },
    "Online Users": { content: <OnlineUsers /> },
  },
  //completed
  PasswordPolicy: {
    "Password Policy": { content: <PasswordPolicy /> },//change to pages
  },
  //completed
  AuditTrailHistory: {
    "Audit Trail History": { content: <AuditTrailHistory /> },
    "CFR Settings": { content: <CFRSettings /> },
  },
  //completed
  DownloadLogs: {
    "Download Logs": { content: <DownloadLogs /> },
    "Download Error Logs": { content: <DownloadErrorLogs /> },
  },
  //completed
  UploadLogs: {
    "Upload Logs": { content: <UploadLogs /> },
    "Upload Error Logs": { content: <UploadErrorLogs /> },
    "Manual Upload Logs": { content: <ManualUploadLogs /> },
  },
  //completed
  RestoreLogs: {
    "Restore Logs": { content: <RestoreLogs /> },
    "Restore Error Logs": { content: <RestoreErrorLogs /> },
  },
  //completed
  ServerAndLocalFileDeleteLogs: {
    "Server File Delete Logs": { content: <ServerFileDeleteLogs /> },
    "Local File Delete Logs": { content: <LocalFileDeleteLogs /> },
  },
  //completed
  SchedulerConfigLogs: {
    "Scheduler Config Logs": { content: <SchedulerConfigLogs /> }
  },
  //completed
  InstrumentLogs: {
    "InstrumentLogs": { content: <InstrumentLogs /> }
  },
};
