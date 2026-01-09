// import { useState, useCallback, useMemo } from 'react';
// import servicecall from '../../../../../Services/servicecall';
// import User from '../../../../../Services/activeUserdetails';

// const CF_sessionGet = (key, defaultValue) => {
//   if (typeof window === 'undefined') return defaultValue;
//   return localStorage.getItem(key) || defaultValue;
// };

// export const INITIAL_FILTER_STATE = {
//   storageGroup: "File01",
//   client: "All",
//   instrument: "",
//   taskStatus: "All",
//   workflowStatus: "All",
//   recordsDuration: "Current Date",
//   fromDate: new Date().toISOString().split('T')[0],
//   toDate: new Date().toISOString().split('T')[0],
//   hideEmpty: true,
// };

// export const useServerDataApi = () => {
//   const { postData } = servicecall();
//   const user = useMemo(() => User(), []);

//   const [ftpGroups, setFtpGroups] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [instruments, setInstruments] = useState([]);
//   const [workflowStatuses, setWorkflowStatuses] = useState([]);
//   const [isLoadingApi, setIsLoadingApi] = useState(false);
//   const [isHiddenRetire, setIsHiddenRetire] = useState("1");


//   /* ================= API: Load Initial ================= */
//   const loadInitialData = useCallback(async () => {
//     setIsLoadingApi(true);
//     try {
//       const payload = {
//         ScreenModuleName: "Data Explorer",
//         sModuleName: "ServerData",
//         ...user,
//       };

//       const dataResponse = await postData("ftpviewdata/getFTPViewServerData", payload);

//       console.log("Data Response : ", dataResponse);

//       setFtpGroups(dataResponse?.FTPGroup || []);
//       setClients(dataResponse?.Client || []);
//       setInstruments(dataResponse?.InstrumentClientMapping || []);
//       setWorkflowStatuses(dataResponse?.WorkflowStatus || []);
//        setIsHiddenRetire(
//       dataResponse?.isHiddenRetire ?? "1"
//     );

//       return dataResponse;
//     } catch (err) {
//       console.error("API Error:", err);
//       throw err;
//     } finally {
//       setIsLoadingApi(false);
//     }
//   }, [postData, user]);

//   /* ================= API: Change Client Name ================= */
//   // Updates the instruments list based on selected client
//   const changeClientName = useCallback(async (sClientID, sFTPID, sClientName) => {
//     // If selecting "All", typically we might want to reload initial data or clear instruments
//     // Adjust logic here if "All" (sClientID = "") should behavior differently
    
//     setIsLoadingApi(true);
//     try {
//       const payload = {
//         sClientID,
//         sClientName,
//         sFTPID,
//         ScreenModuleName: "Data Explorer",
//         sModuleName: "ServerData",
//         ...user,
//       };

//       console.log("ChangeClientName: ", payload);

//       const response = await postData("ftpviewdata/changeClientNameServerData", payload);
      
//       const newInstruments = response.InstrumentClientMapping || [];
      
//       // Update state directly so UI refreshes
//       setInstruments(newInstruments);
      
//       return newInstruments;
//     } catch (err) {
//       console.error("Failed to fetch instruments for client:", err);
//       setInstruments([]); 
//       return [];
//     } finally {
//       setIsLoadingApi(false);
//     }
//   }, [postData, user]);

//   /* ================= API: Get Instrument Mapped Client ================= */
//   // Returns the Client ID associated with the selected instrument
//   const getInstrumentmappedClientID = useCallback(async (sInstrumentMapID) => {
//     setIsLoadingApi(true);
//     try {
//       const payload = {
//         sInstrumentMapID,
//         ScreenModuleName: "Data Explorer",
//         sModuleName: "ServerData",
//         ...user,
//       };

//       const response = await postData("ftpviewdata/getInstrumentmappedClientID", payload);
//       return response.sClientID?.trim() || null;
//     } catch (err) {
//       console.error("Failed to fetch client ID for instrument:", err);
//       return null;
//     } finally {
//       setIsLoadingApi(false);
//     }
//   }, [postData, user]);

//   /* ================= Local Storage Filters ================= */
//   const applyLocalStorageFilters = useCallback((formState) => {
//     if (ftpGroups.length === 0 || clients.length === 0) return false;

//     const userId = CF_sessionGet("sUserID", "1");
//     const storageData = localStorage.getItem(userId);
//     if (!storageData) return false;

//     try {
//       const parsed = JSON.parse(storageData);
//       const saved = parsed?.ServerData;
//       if (!saved) return false;

//       const ftpItem = ftpGroups.find(g => g.sFTPID === saved.sFTPID);
//       if (ftpItem) formState.storageGroup = ftpItem.sFTPAliasName || "File01";

//       const clientItem = clients.find(c => c.sClientID === saved.sClientID);
//       if (!clientItem) return false;
//       formState.client = clientItem.sClientName || "All";

//       const instItem = instruments.find(i => i.sInstrumentMappingID === saved.sInstrumentID);
//       if (instItem) formState.instrument = instItem.sInstrumentName || "All";

//       const statusItem = workflowStatuses.find(s => s.L80WorkFlowType === saved.sTaskStatusValue);
//       if (statusItem) formState.workflowStatus = statusItem.L80WorkFlowType;

//       return true;
//     } catch (e) {
//       console.error("LocalStorage parse error:", e);
//       return false;
//     }
//   }, [ftpGroups, clients, instruments, workflowStatuses]);

//   return {
//   ftpGroups,
//   clients,
//   instruments,
//   setInstruments,
//   workflowStatuses,
//   isHiddenRetire, 
//   isLoadingApi,
//   loadInitialData,
//   applyLocalStorageFilters,
//   changeClientName,
//   getInstrumentmappedClientID,
// };

// };


// import { useState, useCallback, useMemo } from 'react';
// import servicecall from '../../../../../Services/servicecall';
// import User from '../../../../../Services/activeUserdetails';

// const CF_sessionGet = (key, defaultValue) => {
//   if (typeof window === 'undefined') return defaultValue;
//   return localStorage.getItem(key) || defaultValue;
// };

// export const INITIAL_FILTER_STATE = {
//   storageGroup: "File01",
//   client: "All",
//   instrument: "",
//   taskStatus: "All",
//   workflowStatus: "All",
//   recordsDuration: "Current Date",
//   fromDate: new Date().toISOString().split('T')[0],
//   toDate: new Date().toISOString().split('T')[0],
//   hideEmpty: true,
// };

// export const useServerDataApi = () => {
//   const { postData } = servicecall();
//   const user = useMemo(() => User(), []);

//   const [ftpGroups, setFtpGroups] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [instruments, setInstruments] = useState([]);
//   const [workflowStatuses, setWorkflowStatuses] = useState([]);
//   const [isLoadingApi, setIsLoadingApi] = useState(false);
//   const [isHiddenRetire, setIsHiddenRetire] = useState("1");
//   const [lastCustomDates, setLastCustomDates] = useState({
//     fromDate: new Date().toISOString().split('T')[0],
//     toDate: new Date().toISOString().split('T')[0],
//   });

//   /* ================= API: Load Initial ================= */
//   const loadInitialData = useCallback(async () => {
//     setIsLoadingApi(true);
//     try {
//       const payload = {
//         ScreenModuleName: "Data Explorer",
//         sModuleName: "ServerData",
//         ...user,
//       };

//       const dataResponse = await postData("ftpviewdata/getFTPViewServerData", payload);
//       console.log("Data Response : ", dataResponse);

//       setFtpGroups(dataResponse?.FTPGroup[0] || []);
//       setClients(dataResponse?.Client[0] || []);
//       setInstruments(dataResponse?.InstrumentClientMapping || []);
//       setWorkflowStatuses(dataResponse?.WorkflowStatus || []);
//       setIsHiddenRetire(dataResponse?.isHiddenRetire ?? "1");

//       return dataResponse;
//     } catch (err) {
//       console.error("API Error:", err);
//       throw err;
//     } finally {
//       setIsLoadingApi(false);
//     }
//   }, [postData, user]);

//   /* ================= API: Change Client Name ================= */
//   const changeClientName = useCallback(async (sClientID, sFTPID, sClientName) => {
//     setIsLoadingApi(true);
//     try {
//       const payload = {
//         sClientID,
//         sClientName,
//         sFTPID,
//         ScreenModuleName: "Data Explorer",
//         sModuleName: "ServerData",
//         ...user,
//       };

//       console.log("ChangeClientName: ", payload);
//       const response = await postData("ftpviewdata/changeClientNameServerData", payload);
//       const newInstruments = response.InstrumentClientMapping || [];
//       setInstruments(newInstruments);
//       return newInstruments;
//     } catch (err) {
//       console.error("Failed to fetch instruments for client:", err);
//       setInstruments([]);
//       return [];
//     } finally {
//       setIsLoadingApi(false);
//     }
//   }, [postData, user]);

//   /* ================= API: Get Instrument Mapped Client ================= */
//   const getInstrumentmappedClientID = useCallback(async (sInstrumentMapID) => {
//     setIsLoadingApi(true);
//     try {
//       const payload = {
//         sInstrumentMapID,
//         ScreenModuleName: "Data Explorer",
//         sModuleName: "ServerData",
//         ...user,
//       };

//       const response = await postData("ftpviewdata/getInstrumentmappedClientID", payload);
//       return response.sClientID?.trim() || null;
//     } catch (err) {
//       console.error("Failed to fetch client ID for instrument:", err);
//       return null;
//     } finally {
//       setIsLoadingApi(false);
//     }
//   }, [postData, user]);

//   /* ================= Local Storage Filters ================= */
//   const applyLocalStorageFilters = useCallback((formState) => {
//     if (ftpGroups.length === 0 || clients.length === 0) return false;

//     const userId = CF_sessionGet("sUserID", "1");
//     const storageData = localStorage.getItem(userId);
//     if (!storageData) return false;

//     try {
//       const parsed = JSON.parse(storageData);
//       const saved = parsed?.ServerData;
//       if (!saved) return false;

//       const ftpItem = ftpGroups.find(g => g.sFTPID === saved.sFTPID);
//       if (ftpItem) formState.storageGroup = ftpItem.sFTPAliasName || "File01";

//       const clientItem = clients.find(c => c.sClientID === saved.sClientID);
//       if (!clientItem) return false;
//       formState.client = clientItem.sClientName || "All";

//       const instItem = instruments.find(i => i.sInstrumentMappingID === saved.sInstrumentID);
//       if (instItem) formState.instrument = instItem.sInstrumentName || "All";

//       const statusItem = workflowStatuses.find(s => s.L80WorkFlowType === saved.sTaskStatusValue);
//       if (statusItem) formState.workflowStatus = statusItem.L80WorkFlowType;

//       return true;
//     } catch (e) {
//       console.error("LocalStorage parse error:", e);
//       return false;
//     }
//   }, [ftpGroups, clients, instruments, workflowStatuses]);

//   /* ================= Helper: Get From/To Dates ================= */
//   const getFromToDates = (duration) => {
//     const today = new Date();
//     const to = new Date(today);
//     const from = new Date(today);

//     switch (duration) {
//       case "Last 7 Days":
//         from.setDate(today.getDate() - 7);
//         break;
//       case "Last 30 Days":
//         from.setDate(today.getDate() - 30);
//         break;
//       case "Last 1 Year":
//         from.setFullYear(today.getFullYear() - 1);
//         break;
//       case "Current Date":
//         break;
//       default:
//         return null;
//     }

//     return {
//       from: from.toISOString().split("T")[0],
//       to: to.toISOString().split("T")[0],
//     };
//   };

//   return {
//     ftpGroups,
//     clients,
//     instruments,
//     setInstruments,
//     workflowStatuses,
//     isHiddenRetire,
//     isLoadingApi,
//     lastCustomDates,
//     setLastCustomDates,
//     loadInitialData,
//     applyLocalStorageFilters,
//     changeClientName,
//     getInstrumentmappedClientID,
//     getFromToDates,
//   };
// };


import { useState, useCallback, useMemo } from 'react';
import servicecall from '../../../../../Services/servicecall';
import User from '../../../../../Services/activeUserdetails';

const CF_sessionGet = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  return localStorage.getItem(key) || defaultValue;
};

// 1. Keep this as a fallback structure. 
// We will overwrite storageGroup and client after API loads.
export const INITIAL_FILTER_STATE = {
  storageGroup: "", // Will be updated by API
  client: "",       // Will be updated by API
  instrument: "",
  taskStatus: "All",
  workflowStatus: "All",
  recordsDuration: "Current Date",
  fromDate: new Date().toISOString().split('T')[0],
  toDate: new Date().toISOString().split('T')[0],
  hideEmpty: true,
};

export const useServerDataApi = () => {
  const { postData } = servicecall();
  const user = useMemo(() => User(), []);

  const [ftpGroups, setFtpGroups] = useState([]);
  const [clients, setClients] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [workflowStatuses, setWorkflowStatuses] = useState([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isHiddenRetire, setIsHiddenRetire] = useState("1");
  const [lastCustomDates, setLastCustomDates] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });

  /* ================= API: Load Initial ================= */
  const loadInitialData = useCallback(async () => {
    setIsLoadingApi(true);
    try {
      const payload = {
        ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData",
        ...user,
      };

      const dataResponse = await postData("ftpviewdata/getFTPViewServerData", payload);
      console.log("Data Response : ", dataResponse);

      const groups = dataResponse?.FTPGroup || [];
      const clientList = dataResponse?.Client || [];

      setFtpGroups(groups);
      setClients(clientList);
      setInstruments(dataResponse?.InstrumentClientMapping || []);
      setWorkflowStatuses(dataResponse?.WorkflowStatus || []);
      setIsHiddenRetire(dataResponse?.isHiddenRetire ?? "1");

      // 2. LOGIC: Get the first item (arr[0]) for defaults
      // Fallback to "File01"/"All" if array is empty
      const defaultStorageGroup = groups.length > 0 
        ? groups[0].sFTPAliasName 
        : "File01";

      
      console.log("Group List:", defaultStorageGroup);
        
      const defaultClient = clientList.length > 0 
        ? clientList[0].sClientName 
        : "All";

        console.log("Client List:", defaultClient);

      // 3. Return the defaults along with the response
      return {
        ...dataResponse,
        defaults: {
            storageGroup: defaultStorageGroup,
            client: defaultClient
        }
      };

    } catch (err) {
      console.error("API Error:", err);
      throw err;
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  /* ================= API: Change Client Name ================= */
  const changeClientName = useCallback(async (sClientID, sFTPID, sClientName) => {
    setIsLoadingApi(true);
    try {
      const payload = {
        sClientID,
        sClientName,
        sFTPID,
        ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData",
        ...user,
      };

      console.log("ChangeClientName: ", payload);
      const response = await postData("ftpviewdata/changeClientNameServerData", payload);
      const newInstruments = response.InstrumentClientMapping || [];
      setInstruments(newInstruments);
      return newInstruments;
    } catch (err) {
      console.error("Failed to fetch instruments for client:", err);
      setInstruments([]);
      return [];
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  /* ================= API: Get Instrument Mapped Client ================= */
  const getInstrumentmappedClientID = useCallback(async (sInstrumentMapID) => {
    setIsLoadingApi(true);
    try {
      const payload = {
        sInstrumentMapID,
        ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData",
        ...user,
      };

      const response = await postData("ftpviewdata/getInstrumentmappedClientID", payload);
      return response.sClientID?.trim() || null;
    } catch (err) {
      console.error("Failed to fetch client ID for instrument:", err);
      return null;
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  /* ================= Local Storage Filters ================= */
  const applyLocalStorageFilters = useCallback((formState) => {
    if (ftpGroups.length === 0 || clients.length === 0) return false;

    const userId = CF_sessionGet("sUserID", "1");
    const storageData = localStorage.getItem(userId);
    if (!storageData) return false;

    try {
      const parsed = JSON.parse(storageData);
      const saved = parsed?.ServerData;
      if (!saved) return false;

      const ftpItem = ftpGroups.find(g => g.sFTPID === saved.sFTPID);
      if (ftpItem) formState.storageGroup = ftpItem.sFTPAliasName;

      const clientItem = clients.find(c => c.sClientID === saved.sClientID);
      if (clientItem) formState.client = clientItem.sClientName;

      const instItem = instruments.find(i => i.sInstrumentMappingID === saved.sInstrumentID);
      if (instItem) formState.instrument = instItem.sInstrumentName || "All";

      const statusItem = workflowStatuses.find(s => s.L80WorkFlowType === saved.sTaskStatusValue);
      if (statusItem) formState.workflowStatus = statusItem.L80WorkFlowType;

      return true;
    } catch (e) {
      console.error("LocalStorage parse error:", e);
      return false;
    }
  }, [ftpGroups, clients, instruments, workflowStatuses]);

  /* ================= Helper: Get From/To Dates ================= */
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

  return {
    ftpGroups,
    clients,
    instruments,
    setInstruments,
    workflowStatuses,
    isHiddenRetire,
    isLoadingApi,
    lastCustomDates,
    setLastCustomDates,
    loadInitialData,
    applyLocalStorageFilters,
    changeClientName,
    getInstrumentmappedClientID,
    getFromToDates,
  };
};
