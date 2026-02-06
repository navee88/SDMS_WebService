import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useToggle, useWindowSize, useLocalStorage } from "@uidotdev/usehooks";
import {
  Filter,
  RefreshCw,
  Settings,
  Loader2,
  ChevronsRight
} from "lucide-react";

import FtpLayout from "../../../../Layout/Common/Home/Grid/FtpLayout";
import CustomPopup from "../DataExplorer/PopupModal";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { useServerDataApi, INITIAL_FILTER_STATE } from "./useServerDataApi";
import ConfigModal from "./ConfigModal";
import PopupContentResolver from "../DataExplorer/PopupContent";
import FileFilterModal from "./FileFilterModal";
import TagFilterModal from "./TagFilterModal";
import ParameterFilterModal from "./ParameterFilterModal";


import {
  ACTION_ICONS,
  ALL_ACTION_ORDER,
  INITIAL_CONFIG_STATE,
} from "./Constantdata";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";

// --- HELPER COMPONENTS ---

const ToggleSwitch = React.memo(({ label, checked, onChange }) => (
  <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onChange}>
    <span className="text-[12px] font-bold text-slate-600">{label}</span>
    <div
      className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
        checked ? "bg-blue-500" : "bg-slate-300"
      }`}
    >
      <div
        className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </div>
  </div>
));

const ActionButton = React.memo(({ icon: Icon, label, disabled, className = "" }) => (
  <div
    className={`flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold rounded whitespace-nowrap transition-all ${
      disabled
        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
        : "bg-[#f1f5f9] text-[#1d8cf8] hover:bg-blue-100 hover:scale-95 cursor-pointer"
    } ${className}`}
  >
    <Icon className="w-3.5 h-3.5" />
    <span>{label}</span>
  </div>
));

const ActionWrapper = React.memo(({ disabled, onClick, showDialog, isLoading, children }) => {
  const handleClick = useCallback(() => {
    if (isLoading) return;
    if (disabled) {
      showDialog("Selected menu item has been disabled.", "information");
      return;
    }
    if (onClick) onClick();
  }, [disabled, isLoading, onClick, showDialog]);

  return (
    <div
      onClick={handleClick}
      className={`inline-block ${
        isLoading ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      {children}
    </div>
  );
});

// --- MAIN COMPONENT ---
export default function SearchServerData() {
  const { width } = useWindowSize();
  const [isFilterOpen, toggleFilter] = useToggle(true);
  const [isConfigOpen, toggleConfig] = useToggle(false);
  const [showFileFilterModal, setShowFileFilterModal] = useState(false);
const [showParameterFilterModal, setShowParameterFilterModal] = useState(false); // Add this line
const [showTagFilterModal, setShowTagFilterModal] = useState(false);

  // Search Modes
  const [searchBy, setSearchBy] = useState("file"); // "file" | "tag" | "parameter"

  const [savedFilters, setSavedFilters] = useLocalStorage(
    "serverDataFilters",
    INITIAL_FILTER_STATE
  );

  const {
    ftpGroups,
    loadInitialData,
    applyLocalStorageFilters,
    isLoadingApi,
  } = useServerDataApi();

  const [dialogData, setDialogData] = useState({ open: false, message: "", type: "" });
  const [filterForm, setFilterForm] = useState(INITIAL_FILTER_STATE);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTER_STATE);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingScope, setLoadingScope] = useState("both");
  const [isGridLoading, setIsGridLoading] = useState(true);
  const [isLeftLoading, setIsLeftLoading] = useState(true);
  const [leftPanelData, setLeftPanelData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [fileTagsData, setFileTagsData] = useState([]);
  const [fileParsedData, setFileParsedData] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  
  const [configState, setConfigState] = useState(INITIAL_CONFIG_STATE);

  const initialLoadRef = useRef(false);

  // --- COLUMN DEFINITIONS ---
const generateFileInfoData = useCallback((row) => {
  const isRowSelected = !!row;
  
  // Helper function - returns empty string when no row is selected
  const getVal = (key, fallback = '') => {
    if (!isRowSelected) return ''; // Empty string for no selection
    return row[key] || fallback;
  };
  
  // Always return the structure, even when no row is selected
  return [
    { id: 1, label: 'File Name', value: getVal('username') },
    { id: 2, label: 'Size', value: getVal('fileSize', '38.00 KB') },
    { id: 3, label: 'Contains', value: getVal('contains', '8 Files') },
    { id: 4, label: 'Login Username', value: isRowSelected ? 'CORPAGARAM\\kishorkumar' : '' },
    { id: 5, label: 'Client Name', value: getVal('client', 'AGD54') },
    { id: 6, label: 'Status', value: getVal('status') },
    { id: 7, label: 'Parser Status', value: getVal('parserStatus') },
    { id: 8, label: 'Created On', value: getVal('createdOn', '2026-02-04 17:10:35') },
    { id: 9, label: 'Modified On', value: getVal('modifiedOn') },
    { id: 10, label: 'Task Type', value: getVal('TasksName', 'Scheduler Task') },
    { id: 11, label: 'Source Path', value: getVal('sourcePath', 'D:\\SDMS\\Scheduler_path\\IN001\\sample2') },
    { id: 12, label: 'Checksum', value: '' },
    { id: 13, label: 'Share Link', value: '' },
  ];
}, []);
// Update the handleRowSelect function to generate file info
const handleRowSelect = useCallback((row) => {
  setSelectedRow(row);
  
  if (!row) {
    setFileTagsData([]);
    setFileParsedData([]);
    return;
  }
  
  // Update tags data
  setFileTagsData([{ 
    id: 1, 
    category: "File Type", 
    value: row.fileType === "folder" ? "Folder" : "File", 
    createdBy: "System",
    createdOn: new Date().toLocaleDateString()
  }]);
  
  // Update parsed data
  setFileParsedData([{ 
    id: 1, 
    fieldName: "Filename", 
    fieldValue: row.username 
  }]);
}, []);
  const tagsColumns = useMemo(() => [
    { key: 'category', label: 'Category', width: 100 },
    { key: 'value', label: 'Value', width: 150 },
    { key: 'createdBy', label: 'Created By', width: 120 },
    { key: 'createdOn', label: 'Created On', width: 120 },
  ], []);

  const parsedDataColumns = useMemo(() => [
    { key: 'fieldName', label: 'Field Name', width: 150 },
    { key: 'fieldValue', label: 'Field Value', width: 250 },
  ], []);

  // --- HANDLERS ---
  const handleSearchByToggle = useCallback((type) => {
    setSearchBy(type);
  }, []);

  const showDialog = useCallback((message, type = "error") => {
    setDialogData({ open: true, message, type });
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogData({ open: false, message: "", type: "" });
  }, []);

  const handlePopupClose = useCallback(() => {
    setActivePopup(null);
  }, []);

// Update the handleFilter function
const handleFilter = useCallback(() => {
  if (searchBy === "file") {
    setShowFileFilterModal(true);
  } else if (searchBy === "tag") {
    setShowTagFilterModal(true);
  } else if (searchBy === "parameter") {
    setShowParameterFilterModal(true); // Add this for parameter mode
  } else {
    // Your existing filter logic for when none of the above
    applyLocalStorageFilters(filterForm);
    setSavedFilters(filterForm);
    setHasFiltered(true);
    setLoadingScope("both");
    setIsGridLoading(true);
    setIsLeftLoading(true);

    setLeftPanelData({
      storageGroup: filterForm.storageGroup,
      client: filterForm.client,
      instrument: filterForm.instrument,
    });
  }
}, [searchBy, filterForm, applyLocalStorageFilters, setSavedFilters]);

// Add this state near the other modal states


// Add handler for tag filter submit
const handleTagFilterSubmit = useCallback((filterData) => {
  console.log("Tag filter data:", filterData);
  // Process tag filter data as needed
  
  // Close the modal
  setShowTagFilterModal(false);
}, []);

// Add this with your other handler functions
const handleParameterFilterSubmit = useCallback((filterData) => {
  console.log("Parameter filter data:", filterData);
  // Process parameter filter data as needed
  
  // Here you can convert the parameter filter data to your filterForm structure
  const newFilterForm = {
    ...filterForm,
    // Map parameter filter fields to your filter structure
    recordsDuration: filterData.recordsDuration,
    // Add any other mappings specific to parameter filtering
  };
  
  // Apply the filters
  applyLocalStorageFilters(newFilterForm);
  setSavedFilters(newFilterForm);
  setHasFiltered(true);
  setLoadingScope("both");
  setIsGridLoading(true);
  setIsLeftLoading(true);
  
  // Close the modal
  setShowParameterFilterModal(false);
}, [filterForm, applyLocalStorageFilters, setSavedFilters]);



  const handleFileFilterSubmit = useCallback((filterData) => {
    // Handle the filter data from the modal
    console.log("Filter data:", filterData);
    
    // You can convert the modal data to your filterForm structure if needed
    const newFilterForm = {
      ...filterForm,
      // Map modal fields to your filter structure
      recordsDuration: filterData.recordsDuration,
      dateCategory: filterData.dateCategory,
      client: filterData.clientName === "All" ? "" : filterData.clientName,
      instrument: filterData.instrument === "All" ? "" : filterData.instrument,
    };
    
    // Apply the filters
    applyLocalStorageFilters(newFilterForm);
    setSavedFilters(newFilterForm);
    setHasFiltered(true);
    setLoadingScope("both");
    setIsGridLoading(true);
    setIsLeftLoading(true);
    
    // Close the modal
    setShowFileFilterModal(false);
  }, [filterForm, applyLocalStorageFilters, setSavedFilters]);
  useEffect(() => {
  if (loadingScope === "both") {
    setIsLeftLoading(true);
    setIsGridLoading(true);
  } else {
    setIsGridLoading(true);
    setIsLeftLoading(false);
  }

  const mockData = ftpGroups.map((group, index) => ({
    id: index + 1,
    username: group.sFTPAliasName || `${group.sFTPID}.pdf`,
    fullName: "System",
    profileName: appliedFilters.client && appliedFilters.client !== "All"
      ? appliedFilters.client
      : "System",
    client: appliedFilters.client && appliedFilters.client !== "All"
      ? appliedFilters.client
      : "Default Client",
    TasksName: "Upload",
    taskType: "Upload",
    parserStatus: index % 3 === 0 ? "Parsed" : index % 3 === 1 ? "Pending" : "Failed",
    versionNo: `v${(index % 5) + 1}.${(index % 10)}`,
    uploadDate: new Date(Date.now() - index * 86400000).toLocaleDateString(),
    fileType: index % 4 === 0 ? "folder" : "file", // Simulate some folders
  }));

  const timer = setTimeout(() => {
    setGridData(mockData);
    setIsGridLoading(false);
    setIsLeftLoading(false);
  }, 800);

  return () => clearTimeout(timer);
}, [refreshKey, ftpGroups, appliedFilters, loadingScope]);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadInitialData().catch((err) => {
        showDialog("Failed to load server data: " + err.message, "error");
      });
    }
  }, [loadInitialData, showDialog]);


  const handleRefresh = useCallback(
    (scope = "middle") => {
      handleRowSelect(null);
      setLoadingScope(scope);
      setRefreshKey((prev) => prev + 1);
      if (scope === "both") loadInitialData().catch(console.error);
    },
    [handleRowSelect, loadInitialData]
  );

  const handleActionClick = useCallback(
    (actionName) => {
      if (actionName === "Parser Status") {
        setFileParsedData([]);
        return;
      }
      setActivePopup(actionName);
    },
    []
  );

  useEffect(() => {
    if (loadingScope === "both") {
      setIsLeftLoading(true);
      setIsGridLoading(true);
    } else {
      setIsGridLoading(true);
      setIsLeftLoading(false);
    }

    const mockData = ftpGroups.map((group, index) => ({
      id: index + 1,
      username: group.sFTPAliasName || `${group.sFTPID}.pdf`,
      fullName: "System",
      profileName:
        appliedFilters.client && appliedFilters.client !== "All"
          ? appliedFilters.client
          : "System",
      TasksName: "Upload",
      parserStatus: "Parsed",
    }));

    const timer = setTimeout(() => {
      setGridData(mockData);
      setIsGridLoading(false);
      setIsLeftLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [refreshKey, ftpGroups, appliedFilters, loadingScope]);

  const getIsActionDisabled = useCallback(
    (actionName) => {
      if (selectedRow)
        return ![].includes(
          actionName
        );
      if (hasFiltered) return !["Open", "Restore"].includes(actionName);
      return ["Open", "Restore", "Download", "File Upload", "Folder Upload","Version History","Workflow History", "Audit Trail History", "Attribute"].includes(actionName);
    },
    [selectedRow, hasFiltered]
  );

  const enabledActions = useMemo(
    () => ALL_ACTION_ORDER.filter((a) => configState[a]),
    [configState]
  );

  return (
    <div className="flex flex-col w-full font-sans rounded-md relative">
      {isLoadingApi && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="rounded-sm flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading Server Data...</span>
          </div>
        </div>
      )}

    
     {/* --- ROW 1: COMBINED FILTER CONTROLS --- */}
      <div className="bg-white mt-2.5 mx-1 flex items-center justify-between px-4 h-12">
        
        {/* Left Side: Saved Filter Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-gray-600 text-sm font-medium whitespace-nowrap">Saved Filter</label>
          <div className="w-60">
            <AnimatedDropdown 
              /* Add your props here */
            />
          </div>
        </div>

        {/* Right Side: Toggles & Actions */}
        <div className="flex items-center gap-6">
          {/* Filter Info Toggle */}
          <div 
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 select-none border-r border-slate-300 pr-4"
            onClick={toggleFilter}
          >
            <span className="text-[13px] font-medium text-blue-600">Filter Info »</span>
          </div>

          {/* Search Mode Toggles */}
          <div className="flex items-center gap-4">
            <ToggleSwitch 
              label="By File" 
              checked={searchBy === "file"} 
              onChange={() => handleSearchByToggle("file")} 
            />
            <ToggleSwitch 
              label="By Tag" 
              checked={searchBy === "tag"} 
              onChange={() => handleSearchByToggle("tag")} 
            />
            <ToggleSwitch 
              label="By Parameter" 
              checked={searchBy === "parameter"} 
              onChange={() => handleSearchByToggle("parameter")} 
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={handleFilter}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium rounded transition-all shadow-sm whitespace-nowrap"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>


      {/* --- ROW 2: ACTION BAR (UNDER TOGGLES) --- */}
      <div className="bg-white flex items-center gap-2 mt-2 pl-1 border-slate-200">
        {enabledActions.map((a) => (
          <ActionWrapper
            key={a}
            disabled={getIsActionDisabled(a)}
            isLoading={isLoadingApi}
            showDialog={showDialog}
            onClick={() => handleActionClick(a)}
          >
            <ActionButton icon={ACTION_ICONS[a]} label={a} disabled={getIsActionDisabled(a)} />
          </ActionWrapper>
        ))}

        <ActionWrapper
          disabled={false}
          isLoading={isLoadingApi}
          showDialog={showDialog}
          onClick={() => handleRefresh("middle")}
        >
          <ActionButton icon={RefreshCw} label="Refresh" disabled={isLoadingApi} />
        </ActionWrapper>

        <ActionWrapper
           disabled={false}
           isLoading={isLoadingApi}
           showDialog={showDialog}
           onClick={toggleConfig}
        >
           <ActionButton icon={Settings} label="Configuration" disabled={isLoadingApi} />
        </ActionWrapper>
      </div>

      {/* FTP LAYOUT */}
      {/* FTP LAYOUT */}
<div className="py-3 mb-10">
  <FtpLayout
    storageGroup={appliedFilters.storageGroup}
    rowData={gridData}
    columns={[
      {
        key: "select",
        label: "Select",
        width: 50,
        render: (row) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedRow?.id === row.id}
              onChange={() => handleRowSelect(row)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
        ),
      },
      {
        key: "username",
        label: "File Name",
        width: 100,
        enableSearch: true,
        render: (row) => {
          const isFolder = row.fileType === "folder" || row.username.includes("/");
          return (
            <div className="flex items-center gap-2">
              {isFolder ? (
                <span className="text-yellow-500">
                  <i className="fa fa-folder text-lg"></i>
                </span>
              ) : (
                <span className="text-blue-500">
                  <i className="fa fa-file text-lg"></i>
                </span>
              )}
              <span
                className="font-medium truncate"
                title={row.username}
              >
                {row.username?.trim() || "Unnamed"}
              </span>
            </div>
          );
        },
      },
      {
        key: "versionNo",
        label: "Version No",
        width: 50,
        enableSearch: true,
        render: (row) => (
          <span>{row.versionNo || "1.0"}</span>
        ),
      },
      {
        key: "uploadDate",
        label: "Upload On",
        width: 70,
        enableSearch: true,
        inputType: "date",
        isDate: true,
        render: (row) => {
          const uploadDate = row.uploadDate || new Date().toLocaleDateString();
          return <span>{uploadDate}</span>;
        },
      },
      {
        key: "parserStatus",
        label: "Parser Status",
        width: 120,
        enableSearch: true,
        hidden: !configState["Parser Status"],
        render: (row) => (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            row.parserStatus === "Parsed" 
              ? "bg-green-100 text-green-800" 
              : row.parserStatus === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {row.parserStatus || "Not Parsed"}
          </span>
        ),
      },
    ]}
    onRowSelect={handleRowSelect}
    refreshKey={refreshKey}
    tagsData={fileTagsData}
    tagsColumns={tagsColumns}
    parsedData={fileParsedData}
    parsedDataColumns={parsedDataColumns}
    // Add fileInfoData prop
    fileInfoData={generateFileInfoData(selectedRow)}
    configState={configState}
    isMiddleLoading={isGridLoading}
    isLeftLoading={isLeftLoading}
    showParserColumn={configState["Parser Status"]}
    showRightPanel={true}
    showLeftPanel={false}
    onRefresh={() => handleRefresh("middle")}
    showDialog={showDialog}
    leftPanelData={leftPanelData}
  />
</div>

      {/* MODALS */}
      {isConfigOpen && (
        <ConfigModal
          currentVisibility={configState}
          onSave={setConfigState}
          onClose={toggleConfig}
          showDialog={showDialog}
        />
      )}

      {/* FILE FILTER MODAL - MOVED TO THE CORRECT POSITION */}
      {showFileFilterModal && (
        <FileFilterModal
          isOpen={showFileFilterModal}
          onClose={() => setShowFileFilterModal(false)}
          onSubmit={handleFileFilterSubmit}
        />
      )}
{showTagFilterModal && (
  <TagFilterModal
    isOpen={showTagFilterModal}
    onClose={() => setShowTagFilterModal(false)}
    onSubmit={handleTagFilterSubmit}
  />
)}
{showParameterFilterModal && (
  <ParameterFilterModal
    isOpen={showParameterFilterModal}
    onClose={() => setShowParameterFilterModal(false)}
    onSubmit={handleParameterFilterSubmit}
  />
)}
      <CustomPopup
        isOpen={!!activePopup}
        onClose={handlePopupClose}
        title={activePopup || ""}
        content={<PopupContentResolver type={activePopup} onClose={handlePopupClose} />}
        closeOnOverlayClick={false}
      />

      {dialogData.open && (
        <Errordialog
          message={dialogData.message}
          type={dialogData.type}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}