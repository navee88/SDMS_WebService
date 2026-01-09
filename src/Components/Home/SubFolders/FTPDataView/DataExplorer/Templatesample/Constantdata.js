import { 
  FolderOpen, Download, RotateCcw, FolderDown, Upload, FolderUp, 
  FileClock, History, Tag, List, FileText, MousePointer2, CheckCircle 
} from 'lucide-react';

export const ACTION_ICONS = {
  "File Download": Download, 
  "Restore": RotateCcw, 
  "Folder Download": FolderDown,
  "Version History": FileClock,
  "Work Complete": CheckCircle,
  "Workflow History": History,
  "Tag": Tag, 
  "Audit Trail History": List, 
  "Attribute": FileText, 
};

export const ALL_ACTION_ORDER = [
  "File Download", "Restore", "Folder Download", 
  "Version History", "Work Complete", "Workflow History", "Tag", "Audit Trail History",
  "Attribute"
];

// Initial Config State for the Settings Modal
export const INITIAL_CONFIG_STATE = {
  ...ALL_ACTION_ORDER.reduce((acc, action) => ({ ...acc, [action]: true }), {}),
  "Parser Status": false
};

// Helper to get current date string (YYYY-MM-DD)
export const getCurrentDate = () => new Date().toISOString().split('T')[0];
