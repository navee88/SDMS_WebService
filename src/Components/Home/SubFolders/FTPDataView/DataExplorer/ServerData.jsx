import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToggle, useWindowSize, useLocalStorage } from "@uidotdev/usehooks";
import {
  Filter,
  RotateCcw,
  RefreshCw,
  Settings,
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
import { LuChevronsDown, LuChevronsUp } from "react-icons/lu";

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
    <label className="text-[13px] text-slate-600 font-semibold">{label}</label>
    <input
      type="date"
      value={value}
      onChange={onChange}
      max={max}
      className="px-2 bg-transparent py-1 border-b-2 border-slate-300  text-[12px]"
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
    getFromToDates,
    lastCustomDates,
    setLastCustomDates,
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

  // --- COLUMN DEFINITIONS (New Addition) ---
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

  const handleInputChange = useCallback(
    async (field, value) => {
      let val = value;
      if (value?.target?.value !== undefined) {
        val = value.target.value;
      } else if (typeof value === "object" && value !== null) {
        val = value.value || value.label || "";
      }

      // If recordsDuration changes, update dates in both form and applied filters
      if (field === "recordsDuration") {
        if (val === "Custom Date") {
          // Restore last custom dates
          setFilterForm((prev) => ({
            ...prev,
            recordsDuration: val,
            fromDate: lastCustomDates.fromDate,
            toDate: lastCustomDates.toDate,
          }));
          setAppliedFilters((prev) => ({
            ...prev,
            recordsDuration: val,
            fromDate: lastCustomDates.fromDate,
            toDate: lastCustomDates.toDate,
          }));
        } else {
          // Save current dates as last custom dates (if coming from Custom Date)
          if (filterForm.recordsDuration === "Custom Date") {
            setLastCustomDates({
              fromDate: filterForm.fromDate,
              toDate: filterForm.toDate,
            });
          }
          // Update dates based on the selected duration
          const range = getFromToDates(val);
          if (range) {
            setFilterForm((prev) => ({
              ...prev,
              recordsDuration: val,
              fromDate: range.from,
              toDate: range.to,
            }));
            setAppliedFilters((prev) => ({
              ...prev,
              recordsDuration: val,
              fromDate: range.from,
              toDate: range.to,
            }));
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
      }

      // Update lastCustomDates for manual date changes
      if (field === "fromDate" || field === "toDate") {
        setLastCustomDates((prev) => ({
          ...prev,
          [field]: value.target.value,
        }));
      }

      // For client and instrument changes, update appliedFilters as well
      setFilterForm((prev) => ({ ...prev, [field]: val }));
      setAppliedFilters((prev) => ({ ...prev, [field]: val }));

      if (field === "client") {
        const clientObj = clients.find((c) => String(c.sClientName) === String(val));
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
            setAppliedFilters((prev) => ({
              ...prev,
              client: val,
              instrument: newInstruments[0].sInstrumentName,
            }));
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
        setAppliedFilters((prev) => ({
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
      lastCustomDates,
      setLastCustomDates,
      getFromToDates,
    ]
  );

  const handleReset = useCallback(async () => {
    try {
      // 1. Clear selection and UI states immediately
      setHasFiltered(false);
      setSelectedRow(null);
      setFileTagsData([]);
      setFileParsedData([]);
      
      setLoadingScope("both");
      setIsGridLoading(true);
      setIsLeftLoading(true);

      // 2. Load the initial data and WAIT for the response
      const response = await loadInitialData();

      // 3. Prepare the new state. Start with empty/initial state.
      let resetState = INITIAL_FILTER_STATE;

      // 4. If server returns defaults, merge them in (Just like the initial load useEffect)
      if (response?.defaults) {
        resetState = {
          ...INITIAL_FILTER_STATE,
          storageGroup: response.defaults.storageGroup,
          client: response.defaults.client,
        };
      }

      // 5. Update all filter states with these defaults
      setFilterForm(resetState);
      setAppliedFilters(resetState);
      setSavedFilters(resetState);

      // 6. Restore the Left Panel Data (so the folder tree works)
      if (response?.defaults) {
        setLeftPanelData({
          storageGroup: response.defaults.storageGroup,
          client: response.defaults.client,
          instrument: "",
        });
      } else {
        setLeftPanelData(null);
      }

      // 7. Trigger the grid refresh
      setRefreshKey((prev) => prev + 1);

    } catch (error) {
      showDialog("Failed to reset application state: " + error.message, "error");
    }
  }, [loadInitialData, setSavedFilters, showDialog]);


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
      
      // Update: Handle the promise response to set local state
      loadInitialData()
        .then((response) => {
          if (response?.defaults) {
            const newDefaults = {
              ...INITIAL_FILTER_STATE,
              storageGroup: response.defaults.storageGroup,
              client: response.defaults.client,
            };
            
            // Update both form and applied filters with the fetched defaults
            setFilterForm((prev) => ({ ...prev, ...newDefaults }));
            setAppliedFilters((prev) => ({ ...prev, ...newDefaults }));
            
            // Optional: Also update the left panel data immediately if needed
            setLeftPanelData({
               storageGroup: response.defaults.storageGroup,
               client: response.defaults.client,
               instrument: "",
            });
          }
        })
        .catch((err) => {
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

    const availableWidth = actionContainerRef.current.offsetWidth - 140;
    let accumulatedWidth = 0;
    let count = 0;

    buttonRefs.current.forEach((button) => {
      if (!button) return;
      const w = button.offsetWidth + 8;
      if (accumulatedWidth + w < availableWidth) {
        accumulatedWidth += w;
        count += 1;
      }
    });

    setVisibleCount(Math.max(0, count));
  }, []);

  useEffect(() => {
    calculateVisibleActions();
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
    <div className="flex  flex-col w-full font-sans rounded-md relative h-full">
      {isLoadingApi && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="  rounded-sm flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" /> 
           <p className="text-lg font-medium">Loading Server Data...</p>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-[#f0f4f8] px-4 pt-4 pb-2 relative rounded-t-md">
        {isFilterOpen ? (
          <div className="flex flex-wrap items-end gap-3.5 mb-2">
            <div className="w-60 ">
              <AnimatedDropdown
                label="Storage Group"
                value={filterForm.storageGroup}
                options={ftpGroups.map((g) => g.sFTPAliasName) || []}
                onChange={(val) => handleInputChange("storageGroup", val)}
                isSearchable
              />
            </div>

            <div className="w-60 ">
              <AnimatedDropdown
                label="Client"
                value={filterForm.client}
                options={clientOptions}
                onChange={(val) => handleInputChange("client", val)}
                isSearchable
              />
            </div>

            {configState["Instrument"] && (
              <div className="w-60 ">
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
              <div className="w-60 ">
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
              <div className="w-60 ">
                <AnimatedDropdown
                  label="Workflow Status"
                  value={filterForm.workflowStatus}
                  options={workflowOptions}
                  onChange={(val) => handleInputChange("workflowStatus", val)}
                  isSearchable
                />
              </div>
            )}

            <div className="w-60 ">
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
                onChange={(val) => handleInputChange("recordsDuration", val)}
                isSearchable
              />
            </div>

            {filterForm.recordsDuration === "Custom Date" && (
              <>
                <div className="w-52 pb-4">
                  <DatePicker
                    label="From"
                    value={filterForm.fromDate}
                    onChange={(e) => handleInputChange("fromDate", e)}
                    max={getCurrentDate()}
                  />
                </div>
                <div className="w-52 pb-4">
                  <DatePicker
                    label="To"
                    value={filterForm.toDate}
                    onChange={(e) => handleInputChange("toDate", e)}
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
          <div className="grid grid-cols-6 gap-3 py-2 px-1">
            <SummaryItem label="Storage Group" value={appliedFilters.storageGroup} />
            <SummaryItem label="Client" value={appliedFilters.client} />
<SummaryItem
  label="Instrument"
  value={
    appliedFilters.instrument === "" || appliedFilters.instrument === "All" || !appliedFilters.instrument
      ? ""
      : appliedFilters.instrument 
  }
/>
            <SummaryItem label="From" value={formatDisplayDate(appliedFilters.fromDate)} />
            <SummaryItem label="To" value={formatDisplayDate(appliedFilters.toDate)} />
          </div>
        )}

        {/* Arrow Toggle */}
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

      {/* ACTION BAR */}
      <div className="bg-white mt-2.5 ms-1">
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
      <div className="py-3 mb-10 z-0">
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
              // hidden: true,
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
          onRefresh={() => handleRefresh("middle")}
          showDialog={showDialog}
          leftPanelData={leftPanelData}
        />
      </div>

       <div>user</div> 
          
       {/* <div> <UsersPage/> </div>    */}

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