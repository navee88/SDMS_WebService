// ServerData.jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToggle, useWindowSize } from "@uidotdev/usehooks";
import {
  Filter, RotateCcw, RefreshCw, Settings, CheckSquare, MoreVertical, Loader2,Folder,FileText
} from "lucide-react";

import {
  FaLink,
} from "react-icons/fa";

import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import FtpLayout from "../../../../Layout/Common/Home/Grid/FtpLayout";
import CustomPopup from "../DataExplorer/PopupModal";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { useServerDataApi, INITIAL_FILTER_STATE } from "./useServerDataApi";
import ConfigModal from "../DataExplorer/ConfigModal";
import PopupContentResolver from "../DataExplorer/PopupContent";
import { LuChevronsDown, LuChevronsUp } from "react-icons/lu";

import {
  ACTION_ICONS, ALL_ACTION_ORDER, getCurrentDate
} from "../DataExplorer/Constantdata";
import { TreegridMapping } from "./TreegridMapping";
import UsersPage from "../../../../Layout/Common/Home/Userpage";
import { useFileDetailsStore } from "./useFileDetailsStore";

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────────

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
      className="px-2 bg-transparent py-1 border-b-2 border-slate-300 text-[12px]"
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

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export default function ServerData() {
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const [isFilterOpen, toggleFilter] = useToggle(true);
  const [isConfigOpen, toggleConfig] = useToggle(false);
  const [isMenuOpen, toggleMenu] = useToggle(false);

  const {
    ftpGroups, clients, instruments, workflowStatuses,
    loadInitialData, changeStorageGroup, changeClientName, getInstrumentmappedClientID,
    getFromToDates, lastCustomDates, setLastCustomDates, isLoadingApi, isHiddenRetire,
    saveConfiguration, getInitTreeData, getSelectTreeData,getFileProperties,openServerData,getFileTagsAndParsed,getMultiParsedFields,
    // React Query Props
    configData, isConfigLoading, refetchConfig 
  } = useServerDataApi();

  const [dialogData, setDialogData] = useState({ open: false, message: "", type: "" });
  const [filterForm, setFilterForm] = useState(INITIAL_FILTER_STATE);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTER_STATE);

  const [shouldAutoFilter, setShouldAutoFilter] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingScope, setLoadingScope] = useState("both");
  const [isGridLoading, setIsGridLoading] = useState(true);
  const [isLeftLoading, setIsLeftLoading] = useState(true);
  const [leftPanelData, setLeftPanelData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [fileTagsData, setFileTagsData] = useState([]);
  const [fileParsedData, setFileParsedData] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9);
  
  const[defaultPath, setDefaultPath] = useState();

  // For the Tree Header we need to set 
  const [treeNodeName, setTreeNodeName] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const setActiveFolderId = TreegridMapping((state) => state.setActiveFolderId);
  

  // ─── NEW STATES FOR PROCESSED DATA ──────────────────────────────────────────────
  const [treeNodes, setTreeNodes] = useState([]);
  const [processedGridData, setProcessedGridData] = useState([]);
  const [disabledActions, setDisabledActions] = useState([]);
  const [activeApiParams, setActiveApiParams] = useState({});
  const [propertiesData, setPropertiesData] = useState(null); // <--- Store API Response
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(false);

  const cacheFolderData = TreegridMapping((state) => state.cacheFolderData);
  const clearCache = TreegridMapping((state) => state.clearCache);

  const autoInstrumentSetRef = useRef(false);
  const actionContainerRef = useRef(null);
  const buttonRefs = useRef([]);

  const { detailsState, resetDetails } = useFileDetailsStore();

  // ─── COLUMNS ────────────────────────────────────────────────────────────────────
const tagsColumns = useMemo(() => [
    { 
      key: 'category', 
      label: 'Category', 
      width: 100,
      render: (row, isSelected) => (
        <div className="flex w-full justify-start text-left">
          <span className={isSelected ? 'font-bold' : 'font-semibold'}>
            {row.category}
          </span>
        </div>
      )
    },
    { 
      key: 'value', 
      label: 'Value', 
      width: 150,
      render: (row, isSelected) => (
        <div className="flex w-full justify-start text-left">
          <span className={isSelected ? 'font-bold' : 'font-semibold'}>
            {row.value}
          </span>
        </div>
      )
    },
    { 
      key: 'createdBy', 
      label: 'Created By', 
      width: 120,
      render: (row, isSelected) => (
        <div className="flex w-full justify-start text-left">
          <span className={isSelected ? 'font-bold' : 'font-semibold'}>
            {row.createdBy}
          </span>
        </div>
      )
    },
    { 
      key: 'createdOn', 
      label: 'Created On', 
      width: 120,
      render: (row, isSelected) => (
        <div className="flex w-full justify-start text-left">
          <span className={isSelected ? 'font-bold' : 'font-semibold'}>
            {row.createdOn}
          </span>
        </div>
      )
    },
  ], []);

  const parsedDataColumns = useMemo(() => [
    { 
      key: 'fieldName', 
      label: 'Field Name', 
      width: 150,
      render: (row, isSelected) => (
        <div className="flex w-full justify-start text-left">
          <span className={isSelected ? 'font-bold' : 'font-semibold'}>
            {row.fieldName}
          </span>
        </div>
      )
    },
    { 
      key: 'fieldValue', 
      label: 'Field Value', 
      width: 250,
      render: (row, isSelected) => (
        <div className="flex w-full justify-start text-left">
          <span className={isSelected ? 'font-bold' : 'font-semibold'}>
            {row.fieldValue}
          </span>
        </div>
      )
    },
  ], []);

  const showDialog = useCallback((message, type = "error") => {
    setDialogData({ open: true, message, type });
  }, []);

  const handleDialogClose = useCallback(() => setDialogData({ open: false, message: "", type: "" }), []);
  const handlePopupClose = useCallback(() => setActivePopup(null), []);

  // const instrumentOptions = useMemo(() => instruments.map((i) => i.label).filter(Boolean), [instruments]);
  // const instrumentOptions = useMemo(() => {
  //   return instruments.map((i) => `${i.label} [${i.value}]`);
  // }, [instruments]); 
  
  // ServerData.jsx

// Helper to add invisible characters to duplicates so React can distinguish them
const instrumentOptions = useMemo(() => {
  const seenLabels = {};
  
  return instruments.map((inst) => {
    const label = inst.label;
    
    // Check how many times we've seen this label
    const count = seenLabels[label] || 0;
    seenLabels[label] = count + 1;

    // Append 'Zero Width Space' characters based on count
    // 1st time: "" (Normal)
    // 2nd time: "\u200B" (Invisible)
    // 3rd time: "\u200B\u200B" (Invisible)
    const invisibleSuffix = '\u200B'.repeat(count);
    
    return label + invisibleSuffix;
  });
}, [instruments]);

  const clientOptions = useMemo(() => (clients || []).map((c) => c.label).filter(Boolean), [clients]);
  
  // const workflowOptions = useMemo(() => {
  //   const options = (workflowStatuses || []).map((w) => w.label);
  //   return ["All", ...new Set(options)]; 
  // }, [workflowStatuses]);

  // ServerData.jsx

const workflowOptions = useMemo(() => {
  // 1. Get raw labels from the API state
  const apiLabels = (workflowStatuses || []).map((w) => w.label).filter(Boolean);
  
  // 2. Use a Set to deduplicate.
  // We explicitly start with "All", then add the API labels. 
  // If API also sends "All", the Set will ignore the second one.
  const uniqueOptions = new Set(["All", ...apiLabels]);

  // 3. Convert back to an array
  return Array.from(uniqueOptions); 
}, [workflowStatuses]);



  // ─── INPUT CHANGE HANDLER ───────────────────────────────────────────────────────
  const handleInputChange = useCallback(async (field, value) => {
   let val = value;
    if (value?.target?.value !== undefined) val = value.target.value;
    else if (typeof value === "object" && value !== null) val = value.value || value.label || "";

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: false }));
    }

    if (field === "storageGroup") {
      const groupObj = ftpGroups.find((g) => g.label === val);
      if (groupObj) {
        const result = await changeStorageGroup(groupObj.value);
        const newClient = result.clients.length > 0 ? result.clients[0].label : "";
        let newInstrument = "";
        if (newClient !== "All" && result.instruments.length > 0) {
          newInstrument = result.instruments[0].label;
        }

        const newForm = { ...filterForm, storageGroup: val, client: newClient, instrument: newInstrument };
        setFilterForm(newForm);
        setAppliedFilters(newForm);
      } else {
        setFilterForm(prev => ({ ...prev, [field]: val }));
        setAppliedFilters(prev => ({ ...prev, [field]: val }));
      }
      return;
    }

    if (field === "client") {
      const clientObj = clients.find((c) => String(c.label) === String(val));
      const currentGroup = filterForm.storageGroup || (ftpGroups[0] ? ftpGroups[0].label : "");
      const ftpObj = ftpGroups.find((g) => g.label === currentGroup);

      setFilterForm((prev) => ({ ...prev, client: val }));
      setAppliedFilters((prev) => ({ ...prev, client: val }));

      if (val === "All") {
        setFilterForm((prev) => ({ ...prev, instrument: "" }));
        setAppliedFilters((prev) => ({ ...prev, instrument: "" }));
        return;
      }

      if (!clientObj || !ftpObj) return;

      autoInstrumentSetRef.current = false;
      const newInstruments = await changeClientName(clientObj.value, ftpObj.value, clientObj.label);

      if (!autoInstrumentSetRef.current && newInstruments?.length > 0) {
        autoInstrumentSetRef.current = true;
        const firstInst = newInstruments[0].label;
        setFilterForm(prev => ({ ...prev, instrument: firstInst }));
        setAppliedFilters(prev => ({ ...prev, instrument: firstInst }));
      } else {
        setFilterForm(prev => ({ ...prev, instrument: "" }));
        setAppliedFilters(prev => ({ ...prev, instrument: "" }));
      }
      return;
    }

  if (field === "instrument") {
      // 1. Set the Visible Label (The invisible chars won't show in the UI input)
      setFilterForm((prev) => ({ ...prev, instrument: val }));
      setAppliedFilters((prev) => ({ ...prev, instrument: val }));

      // 2. Find the Index of the selected string in our Generated Options
      // 'val' is the string coming from the dropdown (potentially with invisible chars)
      const selectedIndex = instrumentOptions.indexOf(val);

      // 3. Use that Index to get the REAL Instrument Object
      if (selectedIndex !== -1 && instruments[selectedIndex]) {
        const instObj = instruments[selectedIndex];

        // Now we have the correct unique ID (IM4 vs IM1)
        const mappedClientID = await getInstrumentmappedClientID(instObj.value);

        if (mappedClientID) {
          const mappedClient = clients.find((c) => c.value === mappedClientID);
          if (mappedClient) {
            setFilterForm((prev) => ({ ...prev, client: mappedClient.label }));
            setAppliedFilters((prev) => ({ ...prev, client: mappedClient.label }));

            const currentGroupLabel = filterForm.storageGroup || (ftpGroups[0] ? ftpGroups[0].label : "");
            const ftpObj = ftpGroups.find((g) => g.label === currentGroupLabel);

            if (ftpObj) {
              await changeClientName(mappedClient.value, ftpObj.value, mappedClient.label);
            }
          }
        }
      }
      return;
    }

    if (field === "recordsDuration") {
      if (val === "Custom Date") {
        setFilterForm((prev) => ({ ...prev, recordsDuration: val, fromDate: lastCustomDates.fromDate, toDate: lastCustomDates.toDate }));
        setAppliedFilters((prev) => ({ ...prev, recordsDuration: val, fromDate: lastCustomDates.fromDate, toDate: lastCustomDates.toDate }));
      } else {
        if (filterForm.recordsDuration === "Custom Date") {
          setLastCustomDates({ fromDate: filterForm.fromDate, toDate: filterForm.toDate });
        }
        const range = getFromToDates(val);
        if (range) {
          setFilterForm((prev) => ({ ...prev, recordsDuration: val, fromDate: range.from, toDate: range.to }));
          setAppliedFilters((prev) => ({ ...prev, recordsDuration: val, fromDate: range.from, toDate: range.to }));
        } else {
          setFilterForm((prev) => ({ ...prev, recordsDuration: val, fromDate: "", toDate: "" }));
          setAppliedFilters((prev) => ({ ...prev, recordsDuration: val, fromDate: "", toDate: "" }));
        }
      }
      return;
    }

    if (field === "fromDate" || field === "toDate") {
      setLastCustomDates((prev) => ({ ...prev, [field]: value.target.value }));
    }

    setFilterForm((prev) => ({ ...prev, [field]: val }));
    setAppliedFilters((prev) => ({ ...prev, [field]: val }));
  }, [clients, ftpGroups, instruments, filterForm, changeStorageGroup, changeClientName, getInstrumentmappedClientID, lastCustomDates, setLastCustomDates, getFromToDates]);



const handleReset = useCallback(async () => {
    try {
      // 1. BACKUP: Save the current LocalStorage data to a variable
      const backupData = localStorage.getItem("U1");

      // 2. REMOVE: Temporarily delete it so loadInitialData() sees a "clean slate"
      localStorage.removeItem("U1");

      // 3. FETCH: Call the API. Since "U1" is gone, it will return fresh Server Defaults.
      const response = await loadInitialData();

      // 4. RESTORE: Immediately put the original data back into LocalStorage
      // The storage is now exactly how it was before this function started.
      if (backupData) {
        localStorage.setItem("U1", backupData);
      }

      // 5. UPDATE UI: Now apply the fresh defaults to your React State
      setHasFiltered(false);
      setSelectedRow(null);
      setTreeNodeName("");
      setFileTagsData([]);
      setFileParsedData([]);
      setTreeNodes([]);
      setProcessedGridData([]);
      setDisabledActions([]);
      setLoadingScope("both");
      setIsGridLoading(true);
      setIsLeftLoading(true);

      let resetState = INITIAL_FILTER_STATE;
      
      if (response?.defaults) {
        resetState = {
          ...INITIAL_FILTER_STATE,
          storageGroup: response.defaults.storageGroup,
          client: response.defaults.client,
          instrument: response.defaults.instrument || "",
          taskStatus: response.defaults.taskStatus || "All",
          workflowStatus: response.defaults.workflowStatus || "All",
          recordsDuration: response.defaults.recordsDuration || "Current Date",
          hideEmpty: configData["sys_HideFolderDefault"] === 0 
        };
      }

      setFilterForm(resetState);
      setAppliedFilters(resetState);

      if (response?.defaults) {
        setLeftPanelData({
          storageGroup: response.defaults.storageGroup,
          client: response.defaults.client,
          instrument: response.defaults.instrument || "",
        });
      } else {
        setLeftPanelData(null);
      }
      
      setRefreshKey((prev) => prev + 1);

    } catch (error) {
      // If error, ensure we still restore the backup so we don't lose user data
      const backupData = localStorage.getItem("U1"); // Check if it was restored
      if (!backupData && typeof backupData !== 'undefined') {
         // Logic to ensure safety, though step 4 usually covers it
      }
      showDialog("Failed to reset application state: " + error.message, "error");
    }
  }, [loadInitialData, showDialog, configData]);

  const convertDateForApi = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  // --- HELPER TO STRIP HTML TAGS (Same as in ServerDataTree) ---
const cleanName = (name) => {
  if (!name) return "";
  return String(name).replace(/<[^>]*>?/gm, '').trim();
};

  // ─── FILTER HANDLER (FIXED) ───────────────────────────────────────────────────────
  const handleFilter = useCallback(async () => {
    const { client, instrument, taskStatus, recordsDuration, storageGroup, fromDate, toDate, workflowStatus, hideEmpty } = filterForm;
   
    const newErrors = {};
    // if (!client) newErrors.client = true;
    if (!instrument) newErrors.instrument = true;
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      // Optional: You can still show a generic dialog if you want, or just rely on the red borders
      // showDialog("Please select the required fields highlighted in red.", "warning");
      return;
    }
    setFormErrors({});

    const selectedGroupObj = ftpGroups.find(g => g.label === storageGroup);
    const selectedClientObj = clients.find(c => c.label === client);
    const selectedInstObj = instruments.find(i => i.label === instrument);

    const sFTPID = selectedGroupObj ? selectedGroupObj.value : "";
    const sClientID = selectedClientObj ? selectedClientObj.value : "";
    const sInstrumentID = selectedInstObj ? selectedInstObj.value : "";

    // 1. Map Task Status safely using an object lookup
    const STATUS_MAP = { "Active": "A", "Deactive": "D", "Retire": "R" };
    const sTaskStatusValue = STATUS_MAP[taskStatus] || "";

    const sRecordDuration = recordsDuration ? recordsDuration.replace(/\s+/g, "_") : "";
    let sFrom = "";
    let sTo = "";

    if (recordsDuration === "Custom Date") {
      sFrom = convertDateForApi(fromDate);
      sTo = convertDateForApi(toDate);
    } 
    else {
      const range = getFromToDates(recordsDuration);
      if (range) {
        sFrom = convertDateForApi(range.from);
        sTo = convertDateForApi(range.to);
      }
    }

    const selectedWorkflowObj = workflowStatuses.find(w => w.label === workflowStatus);
    const nWorkflowStatusCode = selectedWorkflowObj ? selectedWorkflowObj.value : -1;
    const nFolderHideFlag = hideEmpty ? 1 : 0;

    // 2. Create a COMMON parameters object (Single Source of Truth)
    const commonParams = {
        sFTPID,
        sClientID,
        sInstrumentID,
        nWorkflowStatusCode,
        nFolderHideFlag,
        sTaskStatusValue,
        sFrom,
        sTo
    };

    // 3. Set Active API Params directly from common object
    setActiveApiParams(commonParams);
    clearCache();
    setLoadingScope("both");
    setIsGridLoading(true);
    setIsLeftLoading(true);

    setSelectedRow(null);
    setActiveFolderId("");

    if (sFTPID) {
    
    // const not changed   
    
    const treeResponse = await getInitTreeData(sFTPID, sClientID);
    let rootNodeName = "";
    console.log("TreeResponse =>", treeResponse?.ServerDataTree[0]?.originalData?.NodeName)
    if (treeResponse?.ServerDataTree?.length > 0) {
      rootNodeName = treeResponse.ServerDataTree[0].NodeName ?? "";
      setTreeNodeName(rootNodeName); 
    }

  // // 3. Update Zustand / Active State
  // const cleanRoot = rootNodeName.replace(/<[^>]*>/g, '').trim();

  // console.log("Clean Root Path=> ", cleanRoot);

  // const startPath = cleanRoot 

  // console.log("StartPath=>", startPath);

  
     

      // 4. Construct payload using common params + tree specific props
      const selectPayload = {
        sFTPID,
        sInstrumentClientMappingID: sInstrumentID,
        NodeName: rootNodeName,
        ...commonParams 
      };

      console.log("Select Payload => ", selectPayload);

      const processedResult = await getSelectTreeData(selectPayload);

      setTreeNodes(processedResult.treeNodes || []);

      

      console.log("Tree Data", processedResult.treeNodes)

      if (processedResult) {
        const cleanedGridData = (processedResult.gridData || []).map(item => ({
        ...item,
        Type: item.Type?.trim() || "",
        "File Name": item["File Name"]?.trim() || "",
        "Client Name": item["Client Name"]?.trim() || "",
        "Task Type": item["Task Type"]?.trim() || "",
        "Parser Status": item["Parser Status"]?.trim() || "NA",
        "UpLoad Date": item["UpLoad Date"] || null,
        "Size KB": Number(item["Size KB"] || 0),
        VersionNo: Number(item.VersionNo || 1),
      }));

       if (processedResult.treeNodes && processedResult.treeNodes.length > 0) {
          //  const rootLabel = processedResult.treeNodes[0].label;
          //  console.log("Label ", rootLabel)
          //  const cleanRoot = cleanName(rootLabel);
          //  console.log("Clean Label => ", cleanRoot);
          //  setActiveFolderId(cleanRoot);
       }
      //  setActiveFolderId(processedResult?.treeNodes[0]?.originalData?.NodeName);
      setDefaultPath(processedResult?.treeNodes[0]?.originalData?.NodeName);
        setProcessedGridData(cleanedGridData);
        setDisabledActions(processedResult.disabledActions || []);
      } else {
        setTreeNodes([]);
        setProcessedGridData([]);
        setDisabledActions([]);
      }
    }

    const storagePayload = {
      ServerData: {
        sClientID, sFTPID, sInstrumentID, sTaskStatusValue, sRecordDuration, sFrom, sTo
      }
    };
    localStorage.setItem("U1", JSON.stringify(storagePayload));

    setHasFiltered(true);
    setLeftPanelData({
      storageGroup: filterForm.storageGroup,
      client: filterForm.client,
      instrument: filterForm.instrument,
    });

    setIsGridLoading(false);
    setIsLeftLoading(false);
  }, [
    filterForm, ftpGroups, clients, instruments,
    getInitTreeData, getSelectTreeData, showDialog, getFromToDates, workflowStatuses,setActiveFolderId
  ]);

  // ─── INITIAL LOAD ───────────────────────────────────────────────────────────────
  // useEffect(() => {
  //   let mounted = true;
  //   const init = async () => {
  //     try {
  //       // Wait for config to be ready (handled by isConfigLoading in UI mostly, but for logic we check data)
  //       // Note: configData is already available via hook, so we just use it.
        
  //       const response = await loadInitialData();
  //       if (!mounted) return;

  //       if (response?.defaults) {

  //         const newDefaults = {
  //           ...INITIAL_FILTER_STATE,
  //           storageGroup: response.defaults.storageGroup,
  //           client: response.defaults.client,
  //           instrument: response.defaults.instrument || "",
  //           taskStatus: response.defaults.taskStatus || "All",
  //           workflowStatus: response.defaults.workflowStatus || "All" ,
  //           recordsDuration: response.defaults.recordsDuration || "Current Date",
  //           fromDate: response.defaults.fromDate || new Date().toISOString().split('T')[0],
  //           toDate: response.defaults.toDate || new Date().toISOString().split('T')[0],
  //           // Use configData directly here
  //           hideEmpty: configData["sys_HideFolderDefault"] === 1
  //         };

  //         setFilterForm((prev) => ({ ...prev, ...newDefaults }));
  //         setAppliedFilters((prev) => ({ ...prev, ...newDefaults }));
  //         setLastCustomDates({
  //           fromDate: newDefaults.fromDate,
  //           toDate: newDefaults.toDate
  //         });

  //         setLeftPanelData({
  //           storageGroup: response.defaults.storageGroup,
  //           client: response.defaults.client,
  //           instrument: response.defaults.instrument || "",
  //         });
  //       }
  //     } catch (err) {
  //       showDialog("Failed to load initial data: " + err.message, "error");
  //     }
  //   };

  //   // Only run init when config is not loading to ensure defaults are correct
  //   if (!isConfigLoading) {
  //       init();
  //   }

  //   return () => { mounted = false; };
  // }, [loadInitialData, showDialog, configData, isConfigLoading]);

useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const response = await loadInitialData();
        if (!mounted) return;

        if (response?.preparedFilter) {
          // 1. Set UI form values
          const newFilterState = {
            ...INITIAL_FILTER_STATE,
            ...response.preparedFilter,
            hideEmpty: configData?.["sys_HideFolderDefault"] === 1,
          };

          setFilterForm(newFilterState);
          setAppliedFilters(newFilterState);
          setLastCustomDates({
            fromDate: newFilterState.fromDate,
            toDate: newFilterState.toDate,
          });

          setLeftPanelData({
            storageGroup: newFilterState.storageGroup,
            client: newFilterState.client,
            instrument: newFilterState.instrument || "",
          });

          // 2. Decide if we should auto-apply filter
          const hasMeaningfulData =
            newFilterState.storageGroup &&
            newFilterState.client &&
            // instrument can sometimes be empty/all, so we allow it
            (newFilterState.instrument || true);

          if (hasMeaningfulData) {
            setShouldAutoFilter(true);
          }
        }
      } catch (err) {
        showDialog("Failed to load initial data: " + err.message, "error");
      }
    };

    if (!isConfigLoading) {
      init();
    }

    return () => {
      mounted = false;
    };
  }, [loadInitialData, showDialog, configData, isConfigLoading]);

  // ─── AUTO TRIGGER FILTER WHEN NEEDED ─────────────────────────────────────────────
  // useEffect(() => {
  //   if (shouldAutoFilter) {
  //     handleFilter();
  //     setShouldAutoFilter(false); // prevent looping
  //   }
  // }, [shouldAutoFilter, handleFilter]);

  const handleConfigSave = async (newConfig) => {
    try {
      await saveConfiguration(newConfig);
      refetchConfig(); // Manually trigger a refetch to ensure UI is in sync
      toggleConfig();
      showDialog("Configuration Saved Successfully", "success");
    } catch (error) {
      showDialog("Failed to save configuration", "error");
    }
  };

  // const handleRowSelect = useCallback((row) => {
  //   setSelectedRow(row);
  //   if (!row) {
  //     setFileTagsData([]);
  //     setFileParsedData([]);
  //     return;
  //   }
  //   setFileTagsData([{ id: 1, category: "Priority", value: "High", createdBy: "System" }]);
  //   setFileParsedData([{ id: 1, fieldName: "FTP ID", fieldValue: row.id }]);
  // }, []);

   const formatGridData = useCallback((rawGridData) => {
    return (rawGridData || []).map(item => ({
        ...item,
        Type: (item.Type || item.sType || "").trim(),
        "File Name": item["File Name"]?.trim() || "",
        "Client Name": item["Client Name"]?.trim() || "",
        "Task Type": item["Task Type"]?.trim() || "",
        "Parser Status": item["Parser Status"]?.trim() || "NA",
        "UpLoad Date": item["UpLoad Date"] || null,
        "Size KB": Number(item["Size KB"] || 0),
        VersionNo: Number(item.VersionNo || 1),
        id: item.id || item.sRecordNo || ""
      }));
  }, []);

const handleRowSelect = useCallback(async (row) => {
  // 1. Always update local state for the UI
  setSelectedRow(row);
  
  if (!row) {
    setFileTagsData([]);
    setFileParsedData([]);
    setPropertiesData(null);
    return;
  }

  // --- EXISTING LOGIC FOR TAGS/PROPERTIES ---
  setFileTagsData([{ id: 1, category: "Priority", value: "High", createdBy: "System" }]);
  setFileParsedData([{ id: 1, fieldName: "FTP ID", fieldValue: row.id }]);

  setIsPropertiesLoading(true);
  setPropertiesData(null);

  const rawPath = row["File Path"] ?? ""; 

  try {
    const propertyPayload = {
      sUTCCreatedOn: row["Created Date"] || "", 
      sTaskID: row["TaskID"] || "",
      sUploadOn: row["UpLoad Date"] || "",
      sClientID: activeApiParams.sClientID || "",
      sFileName: row["File Name"] || "",
      nWorkflowStatusCode: activeApiParams.nWorkflowStatusCode || -1,
      
      // ----------------------------------------------------
      // USE THE CLEANED ARRAY-JOINED PATH
      // ----------------------------------------------------
      sFilePath: rawPath, 

      sFrom: activeApiParams.sFrom || "",
      sTo: activeApiParams.sTo || "",
      sType: row["Type"] || "",
      sRecordNo: row["id"] || row["RecordNo"] || "",
      sFTPID: filterForm.storageGroup ? ftpGroups.find(g => g.label === filterForm.storageGroup)?.value : "",
      sCreatedOn: row["Created Date"] || "",
    };

    const response = await getFileProperties(propertyPayload);
    
    if (response) {
      setPropertiesData(response);
    }
  } catch (error) {
    console.error("Failed to fetch properties", error);
  } finally {
    setIsPropertiesLoading(false);
  }
}, [
  activeApiParams, 
  filterForm, 
  ftpGroups, 
  getFileProperties
]);

const handleRowDoubleClick = useCallback(async (row) => {
    if (!row) return;


    // 1. Identify File vs Folder
    const rawType = row["Type"] || row["sType"] || "";
    const fileType = rawType.toString().trim().toLowerCase();

    // Fix: Robustly get the folder name
    const rawName = row["File Name"] || row["sFileName"] || row["Name"] || "";
    const clickedFolderName = cleanName(rawName);

    if (!clickedFolderName) {
       console.error("Error: Could not determine folder name", row);
       return; 
    }

    if (fileType === "folder" || fileType === "directory") {
      setLoadingScope("middle");
      setIsGridLoading(true);
    setSelectedRow(null);
      let newPathString = "";
      const rowTaskId = (row["TaskID"] || row["sTaskID"] || "").trim();

      // =========================================================
      // STEP 1: GET THE LIVE PATH FROM ZUSTAND
      // =========================================================
      // This contains the path you navigated to via Tree (e.g., ".../IC07/New folder/New folder2")
      const currentStorePath = TreegridMapping.getState().activeFolderId;

      // =========================================================
      // STEP 2: CALCULATE NEXT PATH
      // =========================================================
      
      // LOGIC: If we have a valid path in the Store, we MUST append to it.
      // We only check the 'Root Tree Nodes' if the Store is empty/root.
      
      if (currentStorePath && currentStorePath.length > 0) {
          // CASE A: DEEP NAVIGATION (Trust the Store)
          // We are already inside a path. Just append the clicked folder.
          
          // Remove trailing slash to be safe
          const cleanBase = currentStorePath.replace(/\/+$/, ""); 
          newPathString = `${cleanBase}/${clickedFolderName}`;
          
          console.log("Appending to Store Path:", newPathString);
      } 
      else {
          // CASE B: INITIAL/ROOT NAVIGATION (Store is empty or we are at start)
          // Here we use the TaskID check to ensure we pick the correct Root Folder.
          
          const matchedNode = treeNodes.find((node) => {
            const treeId = (node.originalData?.sTaskID || node.value || node.id || "").trim();
            return treeId && treeId === rowTaskId;
          });

          if (matchedNode) {
             // Found specific root node
             newPathString = cleanName(matchedNode.originalData?.NodeName || matchedNode.label);
          } else {
             // Fallback if not found in tree list (e.g. searching/filtering)
             // Use Default Path or just the folder name
             const fallbackBase = defaultPath || filterForm.storageGroup || "";
             const cleanBase = fallbackBase.replace(/\/+$/, "");
             
             if (cleanBase) {
                 newPathString = `${cleanBase}/${clickedFolderName}`;
             } else {
                 newPathString = clickedFolderName;
             }
          }
      }

      // =========================================================
      // STEP 3: API CALL
      // =========================================================
      const apiNodeName = `<span>${newPathString}`;
      const globalGroupID = ftpGroups.find(g => g.label === filterForm.storageGroup)?.value || "";
      const sFTPID = row["TaskID"] || row["sTaskID"] || globalGroupID;

      const payload = {
        ...activeApiParams,
        sFTPID: String(sFTPID || "").trim(),
        sInstrumentClientMappingID: activeApiParams.sInstrumentID || "",
        NodeName: apiNodeName,
        sClientID: activeApiParams.sClientID || "", 
        nWorkflowStatusCode: activeApiParams.nWorkflowStatusCode ?? -1,
      };

      try {
        const processedResult = await getSelectTreeData(payload);

        if (processedResult) {
          // 1. Update Grid
          const cleanedGridData = formatGridData(processedResult.gridData);
          setProcessedGridData(cleanedGridData); 
          setDisabledActions(processedResult.disabledActions || []);
          
          // 2. CRITICAL: UPDATE ZUSTAND
          // This saves the new long path so the *next* click appends to it correctly.
          TreegridMapping.getState().setActiveFolderId(newPathString);
          
          // 3. Cache Data
          if (processedResult.treeNodes && processedResult.treeNodes.length > 0) {
             cacheFolderData(newPathString, processedResult.treeNodes);
          } else {
             cacheFolderData(newPathString, []);
          }
        }
      } catch (error) {
        console.error("Error drilling down:", error);
        showDialog("Failed to load folder contents", "error");
      } finally {
        setIsGridLoading(false);
      }
    } 
    else {
      // --- File Opening Logic ---
      let fileLink = row["WebLink"] || row["DownloadLink"] || row["sDownloadLink"];
      
      if (!fileLink && propertiesData) {
        fileLink = propertiesData.sWebLink || propertiesData.DownloadLink;
      }
      
      if (fileLink) {
          window.open(fileLink, "_blank", "noopener,noreferrer");
      } else {
          showDialog("No viewable link available for this file.", "information");
      }
    }
  }, [
    activeApiParams, 
    filterForm, 
    ftpGroups, 
    getSelectTreeData, 
    showDialog, 
    propertiesData, 
    formatGridData, 
    // treeNodes, // We can remove treeNodes from dependency to prevent re-creation mid-navigation
    defaultPath 
  ]); 

const handleRefresh = useCallback((scope = "middle") => {
    handleRowSelect(null);
    setLoadingScope(scope);
    setRefreshKey((prev) => prev + 1);
  }, [handleRowSelect]);

  const handleActionClick = useCallback((actionName) => {
    if (actionName === "Parser Status") {
      setFileParsedData([]);
      return;
    }
    setActivePopup(actionName);
    if (isMenuOpen) toggleMenu(false);
  }, [isMenuOpen, toggleMenu]);

  useEffect(() => {
    if (loadingScope === "both") {
      setIsLeftLoading(true);
      setIsGridLoading(true);
    } else {
      setIsGridLoading(true);
      setIsLeftLoading(false);
    }
  }, [loadingScope]);



const fileInfoData = useMemo(() => {
  const row = selectedRow || {};
  const hasRow = !!selectedRow;
  const props = propertiesData || {};

  const val = (v) => (v ? v : "");

  // Helper: Strictly returns empty if no row is selected
  const getVal = (apiKey, rowKey) => {
    if (!hasRow) return ""; 
    if (isPropertiesLoading) return "Loading...";
    return val(props[apiKey]) || val(row[rowKey]) || "";
  };

  return [
    { 
      id: 'filename', label: "Filename", highlight: true,
      value: getVal("sFileName", "File Name") 
    },
    { 
      id: 'size', label: "Size", 
      // FIX: Guard the entire expression with hasRow
      value: hasRow ? (props.sSize || (row["Size KB"] ? `${row["Size KB"]} KB` : "")) : "" 
    },
    { 
      id: 'contains', label: "Contains", 
      // FIX: Guard the entire expression with hasRow
      value: hasRow ? (props.sContains || getVal("sClientName", "Client Name")) : "" 
    },
    { 
      id: 'Login Username', label: "Login Username", 
      value: getVal("sUsername", "Login User") 
    },
    { 
      id: 'Client Name', label: "Client Name",
      value: getVal("sClientName", "Client Name") 
    },
    { 
      id: 'Status', label: "Status", 
      value: getVal("sUserStatus", "Status") 
    },
    { 
      id: 'parserStatus', label: "Parser Status",
      customValue: hasRow ? (
        <span className={`px-2 py-0.5 rounded text-xs font-medium w-max ${
          row["Parser Status"] === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {val(row["Parser Status"])}
        </span>
      ) : "" 
    },
    { 
      id: 'Created On', label: "Created On", 
      // FIX: Guard the entire expression with hasRow
      value: hasRow ? (props.sCreatedOn || props.sUTCCreatedOn || (row["Created Date"] ? formatDisplayDate(row["Created Date"]) : "")) : ""
    },
    { 
      id: 'Modified On', label: "Modified On", 
      value: hasRow ? (props.sModifiedOn || (row["Modified Date"] ? formatDisplayDate(row["Modified Date"]) : "")) : ""
    },
    { 
      id: 'Task Type', label: "Task Type", 
      value: getVal("sTaskType", "Task Type") 
    },
    { 
      id: 'Source Path', label: "Source Path", 
      value: getVal("sFilePath", "Source Path") 
    },
    { 
      id: 'Checksum', label: "Checksum", 
      value: getVal("sCheckSum", "Check Sum") 
    },
    {
      id: 'share', label: "Share Link",
      customValue: hasRow ? (
        <div className="flex items-center gap-2 text-blue-600 cursor-pointer hover:underline text-sm">
          <FaLink /> <span>Generate Link</span>
        </div>
      ) : ""
    }
  ];
}, [selectedRow, propertiesData, isPropertiesLoading]);
 
// ServerData.jsx

const handleTreeFolderSelect = useCallback((apiResult) => {
  console.log("PARENT RECEIVED DATA FROM TREE:", apiResult);
    setLoadingScope("middle");
    setSelectedRow(null); 
    
    // ---------------------------------------------------------
    // STEP 1: FORCE CLEAR SELECTION
    // This ensures the grid does not "remember" the previous index
    // and keeps the new list unselected.
    // ---------------------------------------------------------
    // setSelectedRow(null); 
    setFileTagsData([]);
    setFileParsedData([]);

    // Step 2: Update the Grid Data
    if (apiResult && apiResult.gridData) {
        const cleanedData = formatGridData(apiResult.gridData);
        setProcessedGridData(cleanedData);
        
        if (apiResult.disabledActions) {
           setDisabledActions(apiResult.disabledActions);
        }
        
        if (apiResult.NodeName) {
           setTreeNodeName(apiResult.NodeName); 
        }
    } else {
        setProcessedGridData([]);
    }
}, [formatGridData]);

  // ─── ACTION VISIBILITY & DISABLE LOGIC ──────────────────────────────────────────
  const getIsActionDisabled = useCallback((actionName) => {
    if (disabledActions.includes(actionName.toLowerCase())) return true;
    if (selectedRow) return !["Open", "Restore", "Folder Download", "File Upload", "Folder Upload"].includes(actionName);
    if (hasFiltered) return !["Open", "Restore"].includes(actionName);
    return ["Version History", "Work Complete", "Tag"].includes(actionName);
  }, [selectedRow, hasFiltered, disabledActions]);

  // Use configData instead of configState
  const enabledActions = useMemo(() => ALL_ACTION_ORDER.filter((a) => configData[a]), [configData]);
  const visibleActions = enabledActions.slice(0, visibleCount);
  const overflowActions = enabledActions.slice(visibleCount);

  const taskStatusOptions = useMemo(() => {
    const base = ["All", "Active", "Deactive"];
    return isHiddenRetire === "0" ? [...base, "Retire"] : base;
  }, [isHiddenRetire]);

  return (
    <div className="flex flex-col w-full font-sans rounded-md relative h-full">
      {(isLoadingApi || isConfigLoading) && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="rounded-sm flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-lg font-medium">Loading Server Data...</p>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-[#f0f4f8] px-4 pt-4 pb-2 relative rounded-t-md">
        {isFilterOpen ? (
          <div className="flex flex-wrap items-end gap-3.5 mb-2">
            <div className="w-60">
              <AnimatedDropdown
                label="Storage Group"
                value={filterForm.storageGroup}
                options={ftpGroups.map((g) => g.label) || []}
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
                // required={true}
                // showError={formErrors.client}
              />
            </div>

            {configData["Instrument"] && (
              <div className="w-60">
                <AnimatedDropdown
                  label="Instrument"
                  value={filterForm.instrument}
                  options={instrumentOptions}
                  onChange={(val) => handleInputChange("instrument", val)}
                  allowFreeInput
                  required={true}
                  showError={formErrors.instrument}
                />
              </div>
            )}

            {configData["Task Status"] && (
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

            {configData["Workflow Status"] && (
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
                options={["Current Date", "Last 7 Days", "Last 30 Days", "Last 1 Year", "Custom Date"]}
                onChange={(val) => handleInputChange("recordsDuration", val)}
                isSearchable
              />
            </div>

            {filterForm.recordsDuration === "Custom Date" && (
              <>
                <div className="w-52 pb-4">
                  <DatePicker label="From" value={filterForm.fromDate} onChange={(e) => handleInputChange("fromDate", e)} max={getCurrentDate()} />
                </div>
                <div className="w-52 pb-4">
                  <DatePicker label="To" value={filterForm.toDate} onChange={(e) => handleInputChange("toDate", e)} max={getCurrentDate()} />
                </div>
              </>
            )}

            {configData["sys_HideFolderVisibility"] == 1 && (
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
            )}

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
            <SummaryItem label="Instrument" value={appliedFilters.instrument} />
            <SummaryItem label="From" value={formatDisplayDate(appliedFilters.fromDate)} />
            <SummaryItem label="To" value={formatDisplayDate(appliedFilters.toDate)} />
          </div>
        )}

        <button className="absolute right-4 -bottom-3 bg-[#f0f4f8] p-0.5 rounded shadow-sm cursor-pointer" onClick={toggleFilter}>
          {isFilterOpen ? <LuChevronsUp className="w-4 h-4 text-blue-600" /> : <LuChevronsDown className="w-4 h-4 text-blue-600" />}
        </button>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white mt-2.5 ms-1">
        <div ref={actionContainerRef} className="flex items-center flex-wrap gap-2 justify-start relative">
          <div className="invisible absolute pointer-events-none flex gap-2">
            {enabledActions.map((a, i) => (
              <div key={`measure-${a}`} ref={(el) => (buttonRefs.current[i] = el)}>
                <ActionButton icon={ACTION_ICONS[a]} label={a} />
              </div>
            ))}
          </div>
          {visibleActions.map((a) => (
            <ActionWrapper key={a} disabled={getIsActionDisabled(a)} isLoading={isLoadingApi} showDialog={showDialog} onClick={() => handleActionClick(a)}>
              <ActionButton icon={ACTION_ICONS[a]} label={a} disabled={getIsActionDisabled(a)} />
            </ActionWrapper>
          ))}
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <ActionWrapper disabled={false} isLoading={isLoadingApi} showDialog={showDialog} onClick={() => handleRefresh("middle")}>
            <ActionButton icon={RefreshCw} label="Refresh" disabled={isLoadingApi} />
          </ActionWrapper>
          {overflowActions.length > 0 && (
            <div className="relative">
              <button onClick={toggleMenu} className="p-1.5 rounded z-0 bg-[#f1f5f9] hover:bg-blue-100 text-[#1d8cf8]">
                <MoreVertical className="w-4 h-4" />
              </button>
              {isMenuOpen && (
                <div className="absolute z-50 right-0 top-full mt-1 w-48 bg-white rounded-md shadow-xl py-1 border border-slate-100">
                  {overflowActions.map((a) => (
                    <ActionWrapper key={a} disabled={getIsActionDisabled(a)} showDialog={showDialog} onClick={() => handleActionClick(a)}>
                      <div className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 ${getIsActionDisabled(a) ? "text-slate-300 cursor-not-allowed" : "text-slate-700 cursor-pointer"}`}>
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

      {/* MAIN CONTENT */}
      <div className="py-3 z-0">
        <FtpLayout
          storageGroup={treeNodeName}
          treeNodes={treeNodes}
          rowData={processedGridData}
          columns={[
            {
    key: "File Name",
    label: "Name",
    width: 280,
    enableSearch: true,
    render: (row) => {
      const isFolder = row.Type?.trim().toLowerCase() === "folder";
      return (
        <div className="flex items-center gap-2">
          {isFolder ? (
            <span ><Folder  className="w-[18px] h-[18px] text-blue-500"/></span>
          ) : (
            <span className="text-blue-500 text-lg w-4.5 h-4.5"><FileText /></span>
          )}
          <span className="font-medium truncate" title={row["File Name"]}>
            {row["File Name"]?.trim() || "Unnamed"}
          </span>
        </div>
      );
    }
  },
            { key: "VersionNo", label: "Version No", width: 150,  enableSearch: true, },
            { key: "UpLoad Date", label: "Upload On", width: 150,
               enableSearch: true,
        inputType: 'date', 
      isDate: true,  
      render: (row) => {
    return <span>{row["UpLoad Date"] || row["UpLoad Date UTC"]}</span>;

  }

             },
            { key: "parserStatus", label: "Parser Status", width: 120, enableSearch: true, hidden: !configData["Parser Status"] },
          ]}
          onRowSelect={handleRowSelect}
          onRowDoubleClick={handleRowDoubleClick}
          selectedRow={selectedRow}
          refreshKey={refreshKey}
          tagsData={detailsState.tagsData || []} 
          tagsColumns={tagsColumns}
         parsedData={detailsState.parsedData || []}
          parsedDataColumns={parsedDataColumns}
          multiFieldsData={detailsState.multiFieldsData || []}
          multiFieldsColumns={detailsState.multiFieldsColumns || []}
          configState={configData} 
          isMiddleLoading={isGridLoading}
          isLeftLoading={isLeftLoading}
          showParserColumn={configData["Parser Status"]}
          showRightPanel={true}
          onRefresh={() => handleRefresh("middle")}
          showDialog={showDialog}
          leftPanelData={leftPanelData}
          disabledActions={disabledActions}
          apiFilterParams={activeApiParams}
          fileInfoData={fileInfoData}
          onFolderSelect={handleTreeFolderSelect}
          getSelectTreeData={getSelectTreeData}
          apiCallbacks={{
            onFileView: openServerData,
            onGetTags: getFileTagsAndParsed,
            onGetMultiFields: getMultiParsedFields
          }}
        />
      </div>

      {/* MODALS */}
      {isConfigOpen && <ConfigModal currentVisibility={configData} onSave={handleConfigSave} onClose={toggleConfig} showDialog={showDialog} />}
      <CustomPopup isOpen={!!activePopup} onClose={handlePopupClose} title={activePopup || ""} content={<PopupContentResolver type={activePopup} onClose={handlePopupClose} />} closeOnOverlayClick={false} />
      {dialogData.open && <Errordialog message={dialogData.message} type={dialogData.type} onClose={handleDialogClose} />}
          
       {/* <UsersPage />    */}

    </div>
  );
}