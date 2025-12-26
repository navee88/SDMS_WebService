import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToggle, useWindowSize, useLocalStorage } from "@uidotdev/usehooks";
import {
  Filter,
  RotateCcw,
  RefreshCw,
  Settings,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  MoreVertical,
  Loader2,
} from "lucide-react";

import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import FtpLayout from "../../../../Layout/Common/Home/Grid/FtpLayout";
import CustomPopup from "./PopupModal";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { useServerDataApi, INITIAL_FILTER_STATE } from "./useServerDataApi";
import ConfigModal from "./ConfigModal";
import UsersPage from "../../../../Layout/Common/Home/Userpage";
import PopupContentResolver from "./PopupContent";

import {
  ACTION_ICONS,
  ALL_ACTION_ORDER,
  INITIAL_CONFIG_STATE,
  getCurrentDate,
} from "./Constantdata";


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

const getFromToDates = (duration) => {
  const today = new Date();
  const to = new Date(today);
  const from = new Date(today);

  switch (duration) {
    case "Last 7 Days":
      from.setDate(today.getDate() - 7);
      break;
    case "Last 30 Days":
      from.setDate(today.getDate() - 30);
      break;
    case "Last 1 Year":
      from.setFullYear(today.getFullYear() - 1);
      break;
    case "Current Date":
      break;
    default:
      return null;
  }

  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "---";
  return d.toLocaleDateString("en-GB");
};



const PrimaryButton = React.memo(({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 px-2.5 py-2 hover:scale-95 transition-all bg-white text-blue-600 text-[11px] font-bold rounded shadow-sm border border-transparent hover:bg-blue-50 whitespace-nowrap"
  >
    <Icon className="w-4 h-4 stroke-3" />
    <span>{label}</span>
  </button>
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

const DatePicker = React.memo(({ label, value, onChange, max }) => (
  <div className="flex flex-col w-full">
    <label className="text-[11px] text-slate-500 font-semibold">{label}</label>
    <input
      type="date"
      value={value}
      onChange={onChange}
      max={max}
      className="px-2 py-1 border rounded text-[12px]"
    />
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
      className={`inline-block transition-all ${
        isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-95"
      }`}
    >
      {children}
    </div>
  );
});

// --- MAIN COMPONENT ---
export default function ServerData() {
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const [isFilterOpen, toggleFilter] = useToggle(true);
  const [isConfigOpen, toggleConfig] = useToggle(false);
  const [isMenuOpen, toggleMenu] = useToggle(false);

  const [savedFilters, setSavedFilters] = useLocalStorage(
    "serverDataFilters",
    INITIAL_FILTER_STATE
  );

  const {
    ftpGroups,
    clients,
    instruments,
    workflowStatuses,
    loadInitialData,
    applyLocalStorageFilters,
    isLoadingApi,
    isHiddenRetire,
    changeClientName,
    getInstrumentmappedClientID,
  } = useServerDataApi();

  const [dialogData, setDialogData] = useState({ open: false, message: "", type: "" });

  // Use separate state for Form (edit mode) vs Applied (view mode)
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
  const [visibleCount, setVisibleCount] = useState(9);
  const autoInstrumentSetRef = useRef(false);

  const [configState, setConfigState] = useState(INITIAL_CONFIG_STATE);

  const actionContainerRef = useRef(null);
  const buttonRefs = useRef([]);
  const initialLoadRef = useRef(false);

  const showDialog = useCallback((message, type = "error") => {
    setDialogData({ open: true, message, type });
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogData({ open: false, message: "", type: "" });
  }, []);

  const handlePopupClose = useCallback(() => {
    setActivePopup(null);
  }, []);

  const instrumentOptions = useMemo(() => {
    return instruments.map((i) => i.sInstrumentName).filter(Boolean);
  }, [instruments]);

  const clientOptions = useMemo(() => {
    const names = (clients || []).map((c) => c.sClientName).filter(Boolean);
    const uniqueNames = [...new Set(names)];
    return uniqueNames.includes("All") ? uniqueNames : ["All", ...uniqueNames];
  }, [clients]);

  const workflowOptions = useMemo(() => {
    const types = (workflowStatuses || [])
      .map((w) => w.L80WorkFlowType)
      .filter((t) => t && t !== "All");
    return ["All", ...new Set(types)];
  }, [workflowStatuses]);

  // ✅ CRITICAL FIX: Ensure 'val' is a string so .find() logic works
  const handleInputChange = useCallback(
    async (field, value) => {
      let val = value;

      // 1. Extract raw value if it's an event or object
      // if (value?.target?.value !== undefined) {
      //   val = value.target.value;
      // } else if (typeof value === "object" && value !== null) {
      //   val = value.value || value.label || ""; 
      // }

      if (value?.target?.value !== undefined) {
      val = value.target.value;
    } else if (typeof value === "object" && value !== null) {
      val = value.value || value.label || "";
    }

      setFilterForm((prev) => ({ ...prev, [field]: val }));
    

      if (field === "client") {
        // Ensure we compare strings
        const clientObj = clients.find((c) => String(c.sClientName) === String(val));
        
        // Always try to find FTP Group, even if using 'All'
        const currentGroup = filterForm.storageGroup || (ftpGroups[0] ? ftpGroups[0].sFTPAliasName : "");
        const ftpObj = ftpGroups.find((g) => g.sFTPAliasName === currentGroup);

        if (!clientObj || !ftpObj) return;

        autoInstrumentSetRef.current = false;

        const newInstruments = await changeClientName(
          clientObj.sClientID,
          ftpObj.sFTPID,
          clientObj.sClientName
        );

        setFilterForm((prev) => {
          if (clientObj.sClientName === "All") {
            return {
              ...prev,
              client: val,
              instrument: "",
            };
          }

          if (!autoInstrumentSetRef.current && newInstruments?.length > 0) {
            autoInstrumentSetRef.current = true;
            return {
              ...prev,
              client: val,
              instrument: newInstruments[0].sInstrumentName,
            };
          }

          return {
            ...prev,
            client: val,
          };
        });

        return;
      }

      if (field === "instrument") {
        setFilterForm((prev) => ({
          ...prev,
          instrument: val,
        }));

         if (field === "recordsDuration") {
      if (val !== "Custom Date") {
        const range = getFromToDates(val);

        if (range) {
          setFilterForm((prev) => ({
            ...prev,
            recordsDuration: val,
            fromDate: range.from,
            toDate: range.to,
          }));

          // 🔥 UPDATE SUMMARY IMMEDIATELY
          setAppliedFilters((prev) => ({
            ...prev,
            recordsDuration: val,
            fromDate: range.from,
            toDate: range.to,
          }));
        }
      } else {
        setFilterForm((prev) => ({
          ...prev,
          recordsDuration: val,
          fromDate: "",
          toDate: "",
        }));

        setAppliedFilters((prev) => ({
          ...prev,
          recordsDuration: val,
          fromDate: "",
          toDate: "",
        }));
      }
      return;
    }

  

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

        setFilterForm((prev) => ({
          ...prev,
          client: mappedClient.sClientName,
          instrument: val,
        }));
      }
    },
    [
      clients,
      ftpGroups,
      instruments,
      filterForm.storageGroup,
      changeClientName,
      getInstrumentmappedClientID,
    ]
  );

  const handleReset = useCallback(async () => {
    try {
      setFilterForm(INITIAL_FILTER_STATE);
      setAppliedFilters(INITIAL_FILTER_STATE);
      setSavedFilters(INITIAL_FILTER_STATE);

      setHasFiltered(false);
      setSelectedRow(null);
      setFileTagsData([]);
      setFileParsedData([]);
      setLeftPanelData(null);

      setLoadingScope("both");
      setIsGridLoading(true);
      setIsLeftLoading(true);

      await loadInitialData();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      showDialog("Failed to reset application state: " + error.message, "error");
    }
  }, [loadInitialData, setSavedFilters, showDialog]);


const handleFilter = useCallback(() => {
  // ENTRY POINT DEBUG - This MUST print when button is clicked
  console.log("🔥 handleFilter ENTERED - Function is being called!");
  console.log("Timestamp:", new Date().toISOString());
  
  // Rest of your existing logic with logs
  console.log("=== handleFilter called ===");
  console.log("Initial filterForm state:", {
    recordsDuration: filterForm.recordsDuration,
    fromDate: filterForm.fromDate,
    toDate: filterForm.toDate,
  });

  let effectiveFromDate = filterForm.fromDate;
  let effectiveToDate = filterForm.toDate;

  if (filterForm.recordsDuration !== "Custom Date") {
    console.log(`Calculating date range for: "${filterForm.recordsDuration}"`);
    const range = getFromToDates(filterForm.recordsDuration);
    
    if (range) {
      effectiveFromDate = range.from;
      effectiveToDate = range.to;
      console.log("✅ Dates calculated:", { from: range.from, to: range.to });
      
      setFilterForm(prev => ({
        ...prev,
        fromDate: range.from,
        toDate: range.to
      }));
    }
  }

  const finalFilters = {
    ...filterForm,
    fromDate: effectiveFromDate,
    toDate: effectiveToDate,
  };

  console.log("Final filters:", finalFilters);
  
  applyLocalStorageFilters(finalFilters);
  setAppliedFilters(finalFilters);
  setSavedFilters(finalFilters);
  setHasFiltered(true);
  setLoadingScope("both");
  setIsGridLoading(true);
  setIsLeftLoading(true);

  setLeftPanelData({
    storageGroup: finalFilters.storageGroup,
    client: finalFilters.client,
    instrument: finalFilters.instrument,
  });

  console.log("=== handleFilter completed ===");
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
      if (isMenuOpen) toggleMenu(false);
    },
    [isMenuOpen, toggleMenu]
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

 const calculateVisibleActions = useCallback(() => {
  if (!actionContainerRef.current) return;

  const availableWidth = actionContainerRef.current.offsetWidth - 140; // your buffer
  let accumulatedWidth = 0;
  let count = 0;

  buttonRefs.current.forEach((button) => {
    if (!button) return;
    const w = button.offsetWidth + 8; // button + gap
    if (accumulatedWidth + w < availableWidth) {
      accumulatedWidth += w;
      count += 1;
    }
  });

  setVisibleCount(Math.max(0, count));
}, []);


 useEffect(() => {
  calculateVisibleActions(); // initial
  window.addEventListener("resize", calculateVisibleActions);
  return () => window.removeEventListener("resize", calculateVisibleActions);
}, [calculateVisibleActions]);

  const getIsActionDisabled = useCallback(
    (actionName) => {
      if (selectedRow)
        return !["Open", "Restore", "Folder Download", "File Upload", "Folder Upload"].includes(
          actionName
        );
      if (hasFiltered) return !["Open", "Restore"].includes(actionName);
      return ["Version History", "Work Complete", "Tag"].includes(actionName);
    },
    [selectedRow, hasFiltered]
  );

  const enabledActions = useMemo(
    () => ALL_ACTION_ORDER.filter((a) => configState[a]),
    [configState]
  );
  const visibleActions = enabledActions.slice(0, visibleCount);
  const overflowActions = enabledActions.slice(visibleCount);

  const taskStatusOptions = useMemo(() => {
    const base = ["All", "Active", "Deactive"];
    return isHiddenRetire === "0" ? [...base, "Retire"] : base;
  }, [isHiddenRetire]);

  return (
    <div className="flex flex-col w-full font-sans rounded-md relative h-full">
      {isLoadingApi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading Server Data...</span>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-[#f0f4f8] px-4 pt-4 pb-2 relative rounded-t-md z-20">
        {isFilterOpen ? (
          <div className="flex flex-wrap items-end gap-3.5 mb-2">
            <div className="w-60">
              <AnimatedDropdown
                label="Storage Group"
                value={filterForm.storageGroup}
                options={ftpGroups.map((g) => g.sFTPAliasName) || []}
                onChange={(val) => handleInputChange("storageGroup", val)}
                isSearchable
              />
            </div>

            <div className="w-60">
              <AnimatedDropdown
                label="Client"
                value={filterForm.client}
                options={clientOptions}
                onChange={(val) => handleInputChange("client", val)}
                isSearchable
              />
            </div>

            {configState["Instrument"] && (
              <div className="w-60">
                <AnimatedDropdown
                  label="Instrument"
                  value={filterForm.instrument}
                  options={instrumentOptions}
                  onChange={(val) => handleInputChange("instrument", val)}
                  allowFreeInput
                />
              </div>
            )}

            {configState["Task Status"] && (
              <div className="w-60">
                <AnimatedDropdown
                  label="Task Status"
                  value={filterForm.taskStatus}
                  options={taskStatusOptions}
                  isSearchable
                  onChange={(val) => handleInputChange("taskStatus", val)}
                />
              </div>
            )}

            {configState["Workflow Status"] && (
              <div className="w-60">
                <AnimatedDropdown
                  label="Workflow Status"
                  value={filterForm.workflowStatus}
                  options={workflowOptions}
                  onChange={(val) => handleInputChange("workflowStatus", val)}
                  isSearchable
                />
              </div>
            )}

            <div className="w-60">
            <AnimatedDropdown
  label="Records Duration"
  value={filterForm.recordsDuration}
  options={[
    "Current Date",
    "Last 7 Days",
    "Last 30 Days", 
    "Last 1 Year",
    "Custom Date",
  ]}
  onChange={(val) => handleInputChange("recordsDuration", val)
}
  isSearchable
/>


            </div>

            {filterForm.recordsDuration === "Custom Date" && (
              <>
                <div className="w-52 pb-4">
                  <DatePicker
                    label="From"
                    value={filterForm.fromDate}
                    onChange={(val) => handleInputChange("fromDate", val)}
                    max={getCurrentDate()}
                  />
                </div>
                <div className="w-52 pb-4">
                  <DatePicker
                    label="To"
                    value={filterForm.toDate}
                    onChange={(val) => handleInputChange("toDate", val)}
                    max={getCurrentDate()}
                  />
                </div>
              </>
            )}

            <label className="flex items-center gap-2 cursor-pointer select-none pb-4">
              <span className="text-xs font-bold text-slate-600">Hide Empty Folder</span>
              <div
                onClick={() => handleInputChange("hideEmpty", !filterForm.hideEmpty)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  filterForm.hideEmpty ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300"
                }`}
              >
                {filterForm.hideEmpty && <CheckSquare className="w-3 h-3 text-white" />}
              </div>
            </label>

            <div className="flex items-end gap-2 pb-2">
              <PrimaryButton icon={Filter} label="Filter" onClick={handleFilter} />
              <PrimaryButton icon={RotateCcw} label="Reset" onClick={handleReset} />
              <PrimaryButton icon={RefreshCw} label="Refresh" onClick={() => handleRefresh("both")} />
              <PrimaryButton icon={Settings} label="Configuration" onClick={toggleConfig} />
            </div>
          </div>
        ) : (
          // ✅ FIXED: Using appliedFilters with robust display logic
          <div className="grid grid-cols-6 gap-3 py-2 px-1">
            <SummaryItem label="Storage Group" value={appliedFilters.storageGroup} />
            <SummaryItem label="Client" value={filterForm.client} />
<SummaryItem label="Instrument" value={filterForm.instrument} />

        <SummaryItem label="From" value={formatDisplayDate(appliedFilters.fromDate)} />
<SummaryItem label="To" value={formatDisplayDate(appliedFilters.toDate)} />



          </div>
        )}

        {/* Arrow Toggle */}
        <button
          className="absolute right-4 -bottom-3 z-10 bg-[#f0f4f8] hover:bg-slate-200 p-0.5 rounded shadow-sm cursor-pointer"
          onClick={toggleFilter}
        >
          {isFilterOpen ? (
            <ChevronUp className="w-4 h-4 text-blue-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-600" />
          )}
        </button>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white px-3 py-2 border-b border-slate-100">
        <div
          ref={actionContainerRef}
          className="flex items-center flex-wrap gap-2 justify-start relative"
        >
          <div className="invisible absolute pointer-events-none flex gap-2">
            {enabledActions.map((a, i) => (
              <div key={`measure-${a}`} ref={(el) => (buttonRefs.current[i] = el)}>
                <ActionButton icon={ACTION_ICONS[a]} label={a} />
              </div>
            ))}
          </div>

          {visibleActions.map((a) => (
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

          <div className="h-4 w-px bg-slate-200 mx-1"></div>

          <ActionWrapper
            disabled={false}
            isLoading={isLoadingApi}
            showDialog={showDialog}
            onClick={() => handleRefresh("middle")}
          >
            <ActionButton icon={RefreshCw} label="Refresh" disabled={isLoadingApi} />
          </ActionWrapper>

          {overflowActions.length > 0 && (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="p-1.5 rounded bg-[#f1f5f9] hover:bg-blue-100 text-[#1d8cf8]"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-xl py-1 z-50 border border-slate-100">
                  {overflowActions.map((a) => (
                    <ActionWrapper
                      key={a}
                      disabled={getIsActionDisabled(a)}
                      showDialog={showDialog}
                      onClick={() => handleActionClick(a)}
                    >
                      <div
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 ${
                          getIsActionDisabled(a)
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-700 cursor-pointer"
                        }`}
                      >
                        {React.createElement(ACTION_ICONS[a], { className: "w-3.5 h-3.5" })} {a}
                      </div>
                    </ActionWrapper>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FTP LAYOUT */}
      <div className="pb-10 pt-6">
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
              hidden: true,
            },
          ]}
          onRowSelect={handleRowSelect}
          refreshKey={refreshKey}
          tagsData={fileTagsData}
          parsedData={fileParsedData}
          configState={configState}
          isMiddleLoading={isGridLoading}
          isLeftLoading={isLeftLoading}
          showParserColumn={configState["Parser Status"]}
          showRightPanel={true}
          onRefresh={() => handleRefresh("middle")}
          showDialog={showDialog}
          leftPanelData={leftPanelData}
        />
      </div>

      <UsersPage />

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
