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
import { useServerDataApi, INITIAL_FILTER_STATE } from "../DataExplorer/useServerDataApi";
import ConfigModal from "./ConfigModal";
import PopupContentResolver from "../DataExplorer/PopupContent";

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

  // Search Modes
  const [searchBy, setSearchBy] = useState({
    file: true,
    tag: false,
    parameter: false,
  });

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
    setSearchBy((prev) => ({ ...prev, [type]: !prev[type] }));
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

  const handleFilter = useCallback(() => {
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
  }, [filterForm, applyLocalStorageFilters, setSavedFilters]);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadInitialData().catch((err) => {
        showDialog("Failed to load server data: " + err.message, "error");
      });
    }
  }, [loadInitialData, showDialog]);

  const handleRowSelect = useCallback((row) => {
    setSelectedRow(row);
    if (!row) {
      setFileTagsData([]);
      setFileParsedData([]);
      return;
    }
    setFileTagsData([{ id: 1, category: "Priority", value: "High", createdBy: "System" }]);
    setFileParsedData([{ id: 1, fieldName: "FTP ID", fieldValue: row.id }]);
  }, []);

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
    <div className="flex flex-col w-full font-sans rounded-md relative h-full">
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
        checked={searchBy.file} 
        onChange={() => handleSearchByToggle("file")} 
      />
      <ToggleSwitch 
        label="By Tag" 
        checked={searchBy.tag} 
        onChange={() => handleSearchByToggle("tag")} 
      />
      <ToggleSwitch 
        label="By Parameter" 
        checked={searchBy.parameter} 
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
      <div className="py-3 mb-10 h-full">
        <FtpLayout
          storageGroup={appliedFilters.storageGroup}
          rowData={gridData}
          columns={[
            { key: "username", label: "Filename", width: 150 },
            { key: "profileName", label: "Client", width: 150 },
            { key: "TasksName", label: "Task Type", width: 150 },
            {
              key: "parserStatus",
              label: "Parser Status",
              width: 120,
              enableSearch: true,
               hidden: !configState["Parser Status"],
            },
          ]}
          onRowSelect={handleRowSelect}
          refreshKey={refreshKey}
          tagsData={fileTagsData}
          tagsColumns={tagsColumns}
          parsedData={fileParsedData}
          parsedDataColumns={parsedDataColumns}
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
