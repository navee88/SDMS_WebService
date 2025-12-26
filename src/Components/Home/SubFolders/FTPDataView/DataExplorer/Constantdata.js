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

// Initial Config State for the Settings Modal
export const INITIAL_CONFIG_STATE = {
  ...ALL_ACTION_ORDER.reduce((acc, action) => ({ ...acc, [action]: true }), {}),
  Instrument: true, 
  "Workflow Status": true, 
  "Task Status": true, 
  "Parser Status": false
};

// Helper to get current date string (YYYY-MM-DD)
export const getCurrentDate = () => new Date().toISOString().split('T')[0];
