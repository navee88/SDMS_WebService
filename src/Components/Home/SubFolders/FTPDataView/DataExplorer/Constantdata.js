// import { 
//   FolderOpen, Download, RotateCcw, FolderDown, Upload, FolderUp, 
//   FileClock, History, Tag, List, FileText, MousePointer2, CheckCircle 
// } from 'lucide-react';

// export const ACTION_ICONS = {
//   "Open": FolderOpen, 
//   "File Download": Download, 
//   "Restore": RotateCcw, 
//   "Folder Download": FolderDown,
//   "File Upload": Upload, 
//   "Folder Upload": FolderUp, 
//   "Version History": FileClock, 
//   "Workflow History": History,
//   "Tag": Tag, 
//   "Audit Trail History": List, 
//   "Attribute": FileText, 
//   "Multi-File Select": MousePointer2,
//   "Work Complete": CheckCircle
// };

// export const ALL_ACTION_ORDER = [
//   "Open", "File Download", "Restore", "Folder Download", "File Upload", "Folder Upload",
//   "Version History", "Work Complete", "Workflow History", "Tag", "Audit Trail History",
//   "Attribute", "Multi-File Select"
// ];

// // Initial Config State for the Settings Modal
// export const INITIAL_CONFIG_STATE = {
//   ...ALL_ACTION_ORDER.reduce((acc, action) => ({ ...acc, [action]: true }), {}),
//   Instrument: true, 
//   "Workflow Status": true, 
//   "Task Status": true, 
//   "Parser Status": false
// };

// // Helper to get current date string (YYYY-MM-DD)
// export const getCurrentDate = () => new Date().toISOString().split('T')[0];


import { 
  FolderOpen, Download, RotateCcw, FolderDown, Upload, FolderUp, 
  FileClock, History, Tag, List, FileText, MousePointer2, CheckCircle 
} from 'lucide-react';

export const ACTION_ICONS = {
  "Open": FolderOpen, 
  "File Download": Download, 
  "Restore": RotateCcw, 
  "Folder Download": FolderDown,
  "File Upload": Upload, 
  "Folder Upload": FolderUp, 
  "Version History": FileClock, 
  "Workflow History": History,
  "Tag": Tag, 
  "Audit Trail History": List, 
  "Attribute": FileText, 
  "Multi-File Select": MousePointer2,
  "Work Complete": CheckCircle
};

export const ALL_ACTION_ORDER = [
  "Open", "File Download", "Restore", "Folder Download", "File Upload", "Folder Upload",
  "Version History", "Work Complete", "Workflow History", "Tag", "Audit Trail History",
  "Attribute", "Multi-File Select"
];

// Initial Config State: Everything is TRUE by default
export const INITIAL_CONFIG_STATE = {
  // 1. Actions defaults (all true)
  ...ALL_ACTION_ORDER.reduce((acc, action) => ({ ...acc, [action]: true }), {}),
  
  // 2. Custom Filters & Columns defaults
  "Instrument": true, 
  "Workflow Status": true, 
  "Task Status": true, 
  "Parser Status": false, // Usually hidden by default
  
  // 3. System Flags (Internal use only, not for Modal)
  // 0 = Hidden/False, 1 = Visible/True
  "sys_HideFolderVisibility": 0, 
  "sys_HideFolderDefault": 0 
};

// Helper to get current date string (YYYY-MM-DD)
export const getCurrentDate = () => new Date().toISOString().split('T')[0];

/* ================= CONFIG MAPPINGS ================= */

// Map: Frontend Label -> Backend Key (sActions)
export const CONFIG_KEY_MAP = {
  // Custom Filters
  "Instrument": "instrument",
  "Workflow Status": "workflowstatus",
  "Task Status": "taskstatus",
  
  // Custom Columns
  "Parser Status": "parserstatus",
  
  // Actions
  "Open": "open",
  "File Download": "filedownload",
  "Restore": "restore",
  "Folder Download": "folderdownload",
  "File Upload": "fileupload",
  "Folder Upload": "folderupload",
  "Version History": "versionhistory",
  "Workflow History": "workflowhistory",
  "Tag": "tag",
  "Audit Trail History": "audittrailhistory",
  "Attribute": "attribute",
  "Multi-File Select": "multifilestatusupdate",
  "Work Complete": "workcomplete" 
};

// Map: Backend Key -> Frontend Label (For parsing Load Response)
export const BACKEND_TO_FRONTEND_MAP = Object.entries(CONFIG_KEY_MAP).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});