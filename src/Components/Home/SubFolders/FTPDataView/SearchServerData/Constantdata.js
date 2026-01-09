import { 
  FolderOpen, 
  Download, 
  RotateCcw, 
  FileClock, 
  History, 
  List, 
  FileText 
} from 'lucide-react';

export const ACTION_ICONS = {
  "Open": FolderOpen, 
  "Download": Download, 
  "Restore": RotateCcw, 
  "Version History": FileClock, 
  "Workflow History": History,
  "Audit Trail History": List, 
  "Attribute": FileText, 
};

// Removed "Work Complete" to match the requested image layout
export const ALL_ACTION_ORDER = [
  "Open", 
  "Download", 
  "Restore",
  "Version History", 
  "Workflow History", 
  "Audit Trail History",
  "Attribute",
];

export const INITIAL_CONFIG_STATE = {
  ...ALL_ACTION_ORDER.reduce((acc, action) => ({ ...acc, [action]: true }), {}),
  "Parser Status": false
};

// Helper to get current date string (YYYY-MM-DD)
export const getCurrentDate = () => new Date().toISOString().split('T')[0];
