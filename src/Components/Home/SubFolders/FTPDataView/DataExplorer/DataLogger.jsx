import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useToggle, useLocalStorage } from "@uidotdev/usehooks";
import {
  Filter,
  RotateCcw,
  RefreshCw,
  ChartArea,
  ArchiveRestore,
  FileUp,
  Loader2,
  CheckSquare,
} from "lucide-react";

import { LuChevronsDown, LuChevronsUp } from "react-icons/lu";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import FtpLayout from "../../../../Layout/Common/Home/Grid/FtpLayout";
import CustomPopup from "./PopupModal";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { useServerDataApi, INITIAL_FILTER_STATE } from "./useServerDataApi";
import PopupContentResolver from "./PopupContent";
import { getCurrentDate } from "./Constantdata";

// --- SUB-COMPONENTS ---

const SummaryItem = React.memo(({ label, value }) => {
  let displayValue = "---";
  if (value) {
    if (typeof value === "object") {
      displayValue = value.label || value.value || value.name || "---";
    } else {
      displayValue = String(value);
    }
  }
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-slate-500 font-semibold">{label}</span>
      <span className="text-[12px] text-slate-800 font-bold truncate" title={displayValue}>
        {displayValue}
      </span>
    </div>
  );
});

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "---";
  return d.toLocaleDateString("en-GB");
};

const PrimaryButton = React.memo(({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 hover:scale-95 transition-all bg-white text-blue-600 text-[12px] font-bold rounded shadow-sm border border-transparent hover:bg-blue-50 whitespace-nowrap"
  >
    <Icon className="w-3.5 h-3.5 stroke-[2.5px]" />
    <span>{label}</span>
  </button>
));

const DatePicker = React.memo(({ label, value, onChange, max }) => (
  <div className="flex flex-col w-full">
    <label className="text-[13px] text-slate-600 font-semibold">{label}</label>
    <input
      type="date"
      value={value}
      onChange={onChange}
      max={max}
      className="px-2 bg-transparent border-b-2 border-slate-300 text-[12px]"
    />
  </div>
));

// Restored ToggleSwitch for the "Auto Refresh" feature
const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <span className="text-[13px] font-bold text-slate-600">{label}</span>
    <div className="relative">
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
      <div className={`w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
      <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  </label>
);

// Restored BottomActionButton for the specific bar style
const BottomActionButton = React.memo(({ icon: Icon, label, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold rounded bg-[#f1f5f9] text-[#1d8cf8] hover:bg-blue-50 hover:text-blue-700 transition-colors ${className}`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
));

// --- MAIN COMPONENT ---
export default function DataLogger() {
  const [isFilterOpen, toggleFilter] = useToggle(true);
  
  // Data State
  const [savedFilters, setSavedFilters] = useLocalStorage("serverDataFilters", INITIAL_FILTER_STATE);
  const {
    ftpGroups,
    clients,
    instruments,
    loadInitialData,
    applyLocalStorageFilters,
    isLoadingApi,
    changeClientName,
    getInstrumentmappedClientID,
    setLastCustomDates,
  } = useServerDataApi();

  const [dialogData, setDialogData] = useState({ open: false, message: "", type: "" });
  const [filterForm, setFilterForm] = useState(INITIAL_FILTER_STATE);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTER_STATE);

  // Grid & Layout State
  const [refreshKey, setRefreshKey] = useState(0);
  const [isGridLoading, setIsGridLoading] = useState(true);
  const [isLeftLoading, setIsLeftLoading] = useState(true);
  const [leftPanelData, setLeftPanelData] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [fileTagsData, setFileTagsData] = useState([]);
  const [fileParsedData, setFileParsedData] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  
  // Action Bar States (Restored)
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [dataType, setDataType] = useState("BOTH");
  const [channel, setChannel] = useState("All");

  const autoInstrumentSetRef = useRef(false);
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
  const showDialog = useCallback((message, type = "error") => {
    setDialogData({ open: true, message, type });
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogData({ open: false, message: "", type: "" });
  }, []);

  const handlePopupClose = useCallback(() => {
    setActivePopup(null);
  }, []);

  const instrumentOptions = useMemo(() => instruments.map((i) => i.sInstrumentName).filter(Boolean), [instruments]);
  
  const clientOptions = useMemo(() => {
    const names = (clients || []).map((c) => c.sClientName).filter(Boolean);
    const uniqueNames = [...new Set(names)];
    return uniqueNames.includes("All") ? uniqueNames : ["All", ...uniqueNames];
  }, [clients]);

  const handleInputChange = useCallback(async (field, value) => {
    let val = value?.target?.value !== undefined ? value.target.value : (typeof value === "object" && value !== null ? value.value || value.label || "" : value);

    if (field === "fromDate" || field === "toDate") {
      setLastCustomDates((prev) => ({ ...prev, [field]: value.target.value }));
    }

    setFilterForm((prev) => ({ ...prev, [field]: val }));
    setAppliedFilters((prev) => ({ ...prev, [field]: val }));

    if (field === "client") {
        const clientObj = clients.find((c) => String(c.sClientName) === String(val));
        const currentGroup = filterForm.storageGroup || (ftpGroups[0] ? ftpGroups[0].sFTPAliasName : "");
        const ftpObj = ftpGroups.find((g) => g.sFTPAliasName === currentGroup);

        if (!clientObj || !ftpObj) return;
        autoInstrumentSetRef.current = false;
        
        const newInstruments = await changeClientName(clientObj.sClientID, ftpObj.sFTPID, clientObj.sClientName);
        
        setFilterForm((prev) => {
           if (clientObj.sClientName === "All") return { ...prev, client: val, instrument: "" };
           if (!autoInstrumentSetRef.current && newInstruments?.length > 0) {
             autoInstrumentSetRef.current = true;
             setAppliedFilters((p) => ({ ...p, client: val, instrument: newInstruments[0].sInstrumentName }));
             return { ...prev, client: val, instrument: newInstruments[0].sInstrumentName };
           }
           return { ...prev, client: val };
        });
    }

    if (field === "instrument") {
       const instObj = instruments.find((i) => i.sInstrumentName === val);
       if (!instObj) return;
       const mappedClientID = await getInstrumentmappedClientID(instObj.sInstrumentMappingID);
       if (!mappedClientID) return;
       const mappedClient = clients.find((c) => c.sClientID === mappedClientID);
       if (!mappedClient) return;
       
       const currentGroup = filterForm.storageGroup || (ftpGroups[0] ? ftpGroups[0].sFTPAliasName : "");
       const ftpObj = ftpGroups.find((g) => g.sFTPAliasName === currentGroup);
       if(!ftpObj) return;

       autoInstrumentSetRef.current = true;
       await changeClientName(mappedClient.sClientID, ftpObj.sFTPID, mappedClient.sClientName);
       
       setFilterForm((prev) => ({ ...prev, client: mappedClient.sClientName, instrument: val }));
       setAppliedFilters((prev) => ({ ...prev, client: mappedClient.sClientName, instrument: val }));
    }
  }, [clients, ftpGroups, instruments, filterForm.storageGroup, changeClientName, getInstrumentmappedClientID, setLastCustomDates]);

  const handleReset = useCallback(async () => {
    try {
      setFilterForm(INITIAL_FILTER_STATE);
      setAppliedFilters(INITIAL_FILTER_STATE);
      setSavedFilters(INITIAL_FILTER_STATE);
      setFileTagsData([]);
      setFileParsedData([]);
      setLeftPanelData(null);
      setIsGridLoading(true);
      setIsLeftLoading(true);
      await loadInitialData();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      showDialog("Failed to reset application state: " + error.message, "error");
    }
  }, [loadInitialData, setSavedFilters, showDialog]);

  const handleFilter = useCallback(() => {
    applyLocalStorageFilters(filterForm);
    setSavedFilters(filterForm);
    setIsGridLoading(true);
    setIsLeftLoading(true);
    setLeftPanelData({
      storageGroup: filterForm.storageGroup,
      client: filterForm.client,
      instrument: filterForm.instrument,
    });
  }, [filterForm, applyLocalStorageFilters, setSavedFilters]);

  // Initial Data Load
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadInitialData().catch((err) => showDialog("Failed to load server data: " + err.message, "error"));
    }
  }, [loadInitialData, showDialog]);

  // Mock Grid Data Load
  useEffect(() => {
    setIsLeftLoading(true);
    setIsGridLoading(true);
    const mockData = ftpGroups.map((group, index) => ({
      id: index + 1,
      username: group.sFTPAliasName || `${group.sFTPID}.pdf`,
      fullName: "System",
      profileName: appliedFilters.client && appliedFilters.client !== "All" ? appliedFilters.client : "System",
      TasksName: "Upload",
      parserStatus: "Parsed",
    }));

    const timer = setTimeout(() => {
      setGridData(mockData);
      setIsGridLoading(false);
      setIsLeftLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [refreshKey, ftpGroups, appliedFilters]);

  const handleRowSelect = useCallback((row) => {
    if (!row) {
      setFileTagsData([]);
      setFileParsedData([]);
      return;
    }
    setFileTagsData([{ id: 1, category: "Priority", value: "High", createdBy: "System", createdOn: "2023-10-01" }]);
    setFileParsedData([{ id: 1, fieldName: "FTP ID", fieldValue: row.id }]);
  }, []);

  const handleRefresh = useCallback(() => {
      handleRowSelect(null);
      setRefreshKey((prev) => prev + 1);
      loadInitialData().catch(console.error);
  }, [handleRowSelect, loadInitialData]);

  return (
    <div className="flex flex-col w-full font-sans rounded-md relative h-full bg-white">
      {isLoadingApi && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="rounded-sm flex items-center gap-4 bg-white px-6 py-4 shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-lg font-medium text-gray-700">Loading Server Data...</span>
          </div>
        </div>
      )}

      {/* --- TOP FILTER BAR --- */}
      <div className="bg-[#f0f4f8] border-b border-gray-200">
        <div className="px-5 pt-4 pb-2 relative">
          {isFilterOpen ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="w-56">
                  <AnimatedDropdown
                    label="Storage Group"
                    value={filterForm.storageGroup}
                    options={ftpGroups.map((g) => g.sFTPAliasName) || []}
                    onChange={(val) => handleInputChange("storageGroup", val)}
                    isSearchable
                  />
                </div>
                <div className="w-56">
                  <AnimatedDropdown
                    label="Client"
                    value={filterForm.client}
                    options={clientOptions}
                    onChange={(val) => handleInputChange("client", val)}
                    isSearchable
                  />
                </div>
                <div className="w-56">
                  <AnimatedDropdown
                    label="Instrument"
                    value={filterForm.instrument}
                    options={instrumentOptions}
                    onChange={(val) => handleInputChange("instrument", val)}
                    allowFreeInput
                  />
                </div>
                
                <div className="w-40 pb-0.5 relative mt-0">
                  <DatePicker
                    label="From"
                    value={filterForm.fromDate}
                    onChange={(e) => handleInputChange("fromDate", e)}
                    max={getCurrentDate()}
                  />
                </div>
                <div className="w-40 pb-0.5">
                  <DatePicker
                    label="To"
                    value={filterForm.toDate}
                    onChange={(e) => handleInputChange("toDate", e)}
                    max={getCurrentDate()}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pb-2 mt-1">
                <PrimaryButton icon={Filter} label="Filter" onClick={handleFilter} />
                <PrimaryButton icon={RotateCcw} label="Reset" onClick={handleReset} />
                <PrimaryButton icon={RefreshCw} label="Refresh" onClick={handleRefresh} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3 py-2">
              <SummaryItem label="Storage Group" value={appliedFilters.storageGroup} />
              <SummaryItem label="Client" value={appliedFilters.client} />
              <SummaryItem label="Instrument" value={appliedFilters.instrument} />
              <SummaryItem label="From" value={formatDisplayDate(appliedFilters.fromDate)} />
              <SummaryItem label="To" value={formatDisplayDate(appliedFilters.toDate)} />
            </div>
          )}

          {/* Toggle Arrow */}
        <button
          className="absolute right-4 -bottom-3 z-10 bg-[#f0f4f8] p-0.5 rounded shadow-sm cursor-pointer"
          onClick={toggleFilter}
        >
          {isFilterOpen ? (
            <LuChevronsUp className="w-4 h-4 text-blue-600" />
          ) : (
            <LuChevronsDown className="w-4 h-4 text-blue-600" />
          )}
        </button>
         
        </div>
      </div>

      {/* --- MIDDLE ACTION BAR (Restored from Image/Original) --- */}
      <div className="px-5 pt-2.5 bg-white  border-gray-100 flex items-center justify-between">
        
        {/* Left Side: Data Type & Channel */}
        <div className="flex items-end gap-6">
            <div className="w-44">
                <AnimatedDropdown 
                    label="Data Type" 
                    value={dataType} 
                    options={["BOTH", "RAW", "PARSED"]} 
                    onChange={setDataType} 
                />
            </div>
            <div className="w-44">
                <AnimatedDropdown 
                    label="Channel" 
                    value={channel} 
                    options={["All", "Channel 1", "Channel 2"]} 
                    onChange={setChannel} 
                />
            </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-4">
             <ToggleSwitch 
                label="Auto Refresh" 
                checked={autoRefresh} 
                onChange={setAutoRefresh} 
             />
             
             {/* Divider if needed, or just gap */}
             {/* <div className="h-5 w-px bg-slate-200 mx-1"></div> */}

             <BottomActionButton 
                icon={ChartArea} 
                label="Chart" 
                onClick={() => setActivePopup("Chart")} 
             />
             <BottomActionButton 
                icon={ArchiveRestore} 
                label="Open Archive" 
                onClick={() => setActivePopup("Open Archive")} 
             />
             <BottomActionButton 
                icon={RefreshCw} 
                label="Refresh" 
                onClick={handleRefresh} 
             />
             <BottomActionButton 
                icon={FileUp} 
                label="Export" 
                onClick={() => console.log("Export clicked")} 
             />
        </div>
      </div>

      {/* --- FTP LAYOUT (Scroll Implementation retained) --- */}
      {/* Wrapper ensures correct scroll behavior from ServerData.jsx */}
      <div className="py-3 mb-10">
        <FtpLayout
          storageGroup={appliedFilters.storageGroup}
          rowData={gridData}
          columns={[
            { key: "username", label: "Filename", width: 150 },
            { key: "profileName", label: "Client", width: 150 },
            { key: "TasksName", label: "Task Type", width: 150 },
          ]}
          onRowSelect={handleRowSelect}
          refreshKey={refreshKey}
          tagsData={fileTagsData}
          tagsColumns={tagsColumns}
          parsedData={fileParsedData}
          parsedDataColumns={parsedDataColumns}
          isMiddleLoading={isGridLoading}
          isLeftLoading={isLeftLoading}
          showRightPanel={false}
          showLeftPanel={true}
          onRefresh={() => handleRefresh("middle")}
          showDialog={showDialog}
          leftPanelData={leftPanelData}
        />
      </div>

      <div>user</div>

      {/* --- POPUPS & MODALS --- */}
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
