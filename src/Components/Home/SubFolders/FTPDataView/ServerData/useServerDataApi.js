import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query'; // <--- 1. Import React Query
import servicecall from '../../../../../Services/servicecall';
import User from '../../../../../Services/activeUserdetails';
import { AR_ajaxCall } from "../../Storage/Configuration/Common/AR_ajaxCall"; 
import { INITIAL_CONFIG_STATE, CONFIG_KEY_MAP, BACKEND_TO_FRONTEND_MAP } from '../DataExplorer/Constantdata';
import { SD_AjaxCall } from '../../Storage/Configuration/Common/SD_ajaxcall'; 

export const INITIAL_FILTER_STATE = {
  storageGroup: "",
  client: "",
  instrument: "",
  taskStatus: "",
  workflowStatus: "",
  recordsDuration: "",
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

  // --- HELPER: MAP STATUS VALUE TO LABEL ---
  const getStatusLabel = (val) => {
    switch(val) {
        case "A": return "Active";
        case "D": return "Deactive";
        case "R": return "Retire";
        default: return "All";
    }
  };

  // -----------------------------------------------------------------------
  // REACT QUERY IMPLEMENTATION FOR CONFIGURATION
  // -----------------------------------------------------------------------
 // Inside useServerDataApi.js

const configQuery = useQuery({
  queryKey: ['serverDataConfig', user],
  queryFn: async () => {
    const payload = {
      ScreenModuleName: "Data Explorer",
      sModuleName: "ServerData",
      sActionType: "View",
      ...user,
    };

    const response = await postData("ftpviewdata/getActionConfigurationServerData", payload);
    
    const apiConfigList = response?.ActionsConfiguration || [];
    const newConfig = { ...INITIAL_CONFIG_STATE };

    if (response) {
      // --- FIX: Wrap these in Number() to handle strings like "1" ---
      newConfig["sys_HideFolderVisibility"] = Number(response.nHideEmptyFldVisibility ?? 0);
      newConfig["sys_HideFolderDefault"] = Number(response.nHideEmptyFldDefaultval ?? 0);
    }

    if (apiConfigList.length > 0) {
      apiConfigList.forEach(item => {
        const backendKey = item.L108Actions || item.sActions;
        const frontendKey = BACKEND_TO_FRONTEND_MAP[backendKey];
        
        if (frontendKey) {
          // --- OPTIONAL: Ensure this is also boolean/number safe ---
          const isActive = (item.L108Status == 1) || (item.sActive == 1); 
          newConfig[frontendKey] = isActive;
        }
      });
    }
    
    // Debugging Log: Check what is actually being set
    console.log("Parsed Config:", newConfig); 
    
    return newConfig;
  },
  keepPreviousData: true, 
  initialData: INITIAL_CONFIG_STATE, 
  staleTime: 0,
  refetchOnWindowFocus: true,
});
  // -----------------------------------------------------------------------

  // // 1. LOAD INITIAL DATA
  // const loadInitialData = useCallback(async () => {
  //   setIsLoadingApi(true);
  //   try {
  //     const payload = {
  //       ScreenModuleName: "Data Explorer",
  //       sModuleName: "ServerData",
  //       ...user,
  //     };

  //     const dataResponse = await postData("ftpviewdata/getFTPViewServerData", payload);

  //     const groupRes = AR_ajaxCall(dataResponse?.FTPGroup, "combo");
  //     const clientRes = AR_ajaxCall(dataResponse?.Client, "combo");
  //     const instRes = AR_ajaxCall(dataResponse?.InstrumentClientMapping, "combo");

  //     const rawWorkflow = dataResponse?.WorkflowStatus || [];
  //     const formattedWorkflow = rawWorkflow.map((item) => ({
  //       value: item.L80FlowStatus,    
  //       label: item.L80WorkFlowType   
  //     }));

  //     setFtpGroups(groupRes.options);
  //     setClients(clientRes.options); 
  //     setInstruments(instRes.options);
  //     setWorkflowStatuses(formattedWorkflow);
  //     setIsHiddenRetire(dataResponse?.isHiddenRetire ?? "1");

  //     // --- CHECK LOCAL STORAGE ---
  //     const storedDataStr = localStorage.getItem("U1");
  //     let storedData = null;
  //     if (storedDataStr) {
  //       try {
  //           const parsed = JSON.parse(storedDataStr);
  //           if (parsed && parsed.ServerData) {
  //               storedData = parsed.ServerData;
  //           }
  //       } catch (e) {
  //           console.error("Error parsing local storage U1", e);
  //       }
  //     }

  //     // --- DETERMINE DEFAULTS ---
  //     let defaults = {};

  //     if (storedData) {
  //       // CASE A: Load from Local Storage
  //       const foundGroup = groupRes.options.find(g => g.value === storedData.sFTPID);
  //       const storageGroupLabel = foundGroup ? foundGroup.label : (groupRes.hasData ? groupRes.options[0].label : "");
  //       const sFTPID = foundGroup ? foundGroup.value : (groupRes.hasData ? groupRes.options[0].value : "");

  //       let validClients = clientRes.options;
  //       let validInstruments = instRes.options;

  //       if (foundGroup && groupRes.options.length > 0 && foundGroup.value !== groupRes.options[0].value) {
  //           const changeGroupPayload = {
  //               sFTPID: foundGroup.value,
  //               ScreenModuleName: "Data Explorer",
  //               sModuleName: "ServerData",
  //               ...user,
  //           };
            
  //           const groupChangeResponse = await postData("ftpviewdata/changeFTPGroupNameServerData", changeGroupPayload);
            
  //           if (groupChangeResponse) {
  //               const newClientRes = AR_ajaxCall(groupChangeResponse.Client, "combo");
  //               const newInstRes = AR_ajaxCall(groupChangeResponse.InstrumentClientMapping, "combo");
  //               setClients(newClientRes.options);
  //               setInstruments(newInstRes.options);
  //               validClients = newClientRes.options;
  //               validInstruments = newInstRes.options;
  //           }
  //       }

  //       let clientLabel = "";
  //       let foundClient = null;
  //       if (storedData.sClientID) {
  //           foundClient = validClients.find(c => c.value === storedData.sClientID);
  //       }
  //       clientLabel = foundClient ? foundClient.label : (validClients.length > 0 ? validClients[0].label : "");

  //       let instrumentLabel = "";
  //       if (foundClient) {
  //            const foundInst = validInstruments.find(i => i.value === storedData.sInstrumentID);
  //           //  instrumentLabel = foundInst ? foundInst.label : "";
            
  //       if (foundInst) {
  //           instrumentLabel = foundInst.label;
  //       } 
        
  //       // 2. Robust Fallback: If ID is empty string (""), force "All"
  //       // This ensures that if Local Storage has id: "", the UI shows "All"
  //       else if (storedData.sInstrumentID === "") {
  //       instrumentLabel = "All";
  //       }
  //       }

  //       const formattedDuration = storedData.sRecordDuration 
  //           ? storedData.sRecordDuration.replace(/_/g, " ") 
  //           : "Current Date";
            
  //       let defaultFrom = new Date().toISOString().split('T')[0];
  //       let defaultTo = new Date().toISOString().split('T')[0];

  //       if (storedData.sRecordDuration === "Custom_Date" && storedData.sFrom && storedData.sTo) {
  //            const [d1, m1, y1] = storedData.sFrom.split('/');
  //            const [d2, m2, y2] = storedData.sTo.split('/');
  //            if (y1 && m1 && d1) defaultFrom = `${y1}-${m1}-${d1}`;
  //            if (y2 && m2 && d2) defaultTo = `${y2}-${m2}-${d2}`;
  //       }

  //       defaults = {
  //           storageGroup: storageGroupLabel,
  //           client: clientLabel, 
  //           instrument: instrumentLabel,
  //           taskStatus: getStatusLabel(storedData.sTaskStatusValue),
  //           recordsDuration: formattedDuration,
  //           fromDate: defaultFrom,
  //           toDate: defaultTo,
  //           workflowStatus: "", 
  //           sFTPID: sFTPID 
  //       };
  //     } else {
  //       // CASE B: Load from API Defaults
  //       defaults = {
  //         storageGroup: groupRes.hasData ? groupRes.options[0].label : "",
  //         client: clientRes.hasData ? clientRes.options[0].label : "",
  //         instrument: "",
  //         taskStatus: "All",
  //         recordsDuration: "Current Date",
  //         sFTPID: groupRes.hasData ? groupRes.options[0].value : "",
  //         fromDate: new Date().toISOString().split('T')[0],
  //         toDate: new Date().toISOString().split('T')[0],
  //       };
  //     }

  //     return {
  //       ...dataResponse,
  //       defaults: defaults
  //     };

  //   } catch (err) {
  //     console.error("API Error:", err);
  //     throw err;
  //   } finally {
  //     setIsLoadingApi(false);
  //   }
  // }, [postData, user]);


// 1. LOAD INITIAL DATA
  const loadInitialData = useCallback(async () => {
    setIsLoadingApi(true);
    try {
      const payload = {
        ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData",
        ...user,
      };

      const dataResponse = await postData("ftpviewdata/getFTPViewServerData", payload);

      const groupRes = AR_ajaxCall(dataResponse?.FTPGroup, "combo");
      const clientRes = AR_ajaxCall(dataResponse?.Client, "combo");
      const instRes = AR_ajaxCall(dataResponse?.InstrumentClientMapping, "combo");

      const rawWorkflow = dataResponse?.WorkflowStatus || [];
      const formattedWorkflow = rawWorkflow.map((item) => ({
        value: item.L80FlowStatus,
        label: item.L80WorkFlowType,
      }));

      // Set initial state (will be updated further down if LS exists)
      setFtpGroups(groupRes.options);
      setClients(clientRes.options);
      setInstruments(instRes.options);
      setWorkflowStatuses(formattedWorkflow);
      setIsHiddenRetire(dataResponse?.isHiddenRetire ?? "1");

      // ─── CHECK LOCAL STORAGE ───────────────────────────────────────
      const storedDataStr = localStorage.getItem("U1");
      let storedData = null;
      if (storedDataStr) {
        try {
          const parsed = JSON.parse(storedDataStr);
          if (parsed && parsed.ServerData) {
            storedData = parsed.ServerData;
          }
        } catch (e) {
          console.error("Error parsing local storage U1", e);
        }
      }

      // ─── DETERMINE DEFAULTS ────────────────────────────────────────
      let defaults = {};
      let preparedFilter = { ...INITIAL_FILTER_STATE };

      if (storedData) {
        // CASE A: Load from Local Storage
        
        // 1. SETUP GROUP
        const foundGroup = groupRes.options.find((g) => g.value === storedData.sFTPID);
        const storageGroupLabel = foundGroup ? foundGroup.label : (groupRes.hasData ? groupRes.options[0].label : "");
        const sFTPID = foundGroup ? foundGroup.value : (groupRes.hasData ? groupRes.options[0].value : "");

        let validClients = clientRes.options;
        let validInstruments = instRes.options;
        let defaultWorkflowStatus = workflowStatuses.length > 0 ? (workflowStatuses[0]?.label || "All") : "All";

        // 2. HANDLE GROUP CHANGE (Fetch Clients/Instruments for this Group)
        if (foundGroup && groupRes.options.length > 0 && foundGroup.value !== groupRes.options[0].value) {
          const changeGroupPayload = {
            sFTPID: foundGroup.value,
            ScreenModuleName: "Data Explorer",
            sModuleName: "ServerData",
            ...user,
          };

          const groupChangeResponse = await postData("ftpviewdata/changeFTPGroupNameServerData", changeGroupPayload);

          if (groupChangeResponse) {
            const newClientRes = AR_ajaxCall(groupChangeResponse.Client, "combo");
            const newInstRes = AR_ajaxCall(groupChangeResponse.InstrumentClientMapping, "combo");
            
            setClients(newClientRes.options);
            setInstruments(newInstRes.options);
            validClients = newClientRes.options;
            validInstruments = newInstRes.options;
          }
        }

        // 3. [FIX START] REVERSE LOOKUP & CLIENT FILTERING
        // If we have an Instrument ID, we must ensure the Client ID matches it
        // and that the Instrument list is filtered for that Client.
        
        let finalClientID = storedData.sClientID;

        // A. If Instrument exists, force get the mapped Client ID
        if (storedData.sInstrumentID) {
            const mapPayload = { 
                sInstrumentMapID: storedData.sInstrumentID, 
                ScreenModuleName: "Data Explorer",
                sModuleName: "ServerData", 
                ...user 
            };
            // Call API to find which client owns this instrument
            const mapRes = await postData("ftpviewdata/getInstrumentmappedClientID", mapPayload);
            
            if (mapRes && mapRes.sClientID) {
                finalClientID = mapRes.sClientID; // Override LS Client with API Truth
                storedData.sClientID = finalClientID; // Update storedData ref for label finding below
            }
        }

        // B. If we have a valid Client ID, we MUST fetch instruments specific to this client
        // This prevents "Full" instrument lists from loading when a specific client is implied
        if (finalClientID) {
            const clientPayload = {
                sClientID: finalClientID,
                sClientName: "", 
                sFTPID: sFTPID,
                ScreenModuleName: "Data Explorer",
                sModuleName: "ServerData",
                ...user,
            };
            
            const clientChangeRes = await postData("ftpviewdata/changeClientNameServerData", clientPayload);
            
            if (clientChangeRes) {
                 const refinedInstRes = AR_ajaxCall(clientChangeRes.InstrumentClientMapping, "combo");
                 setInstruments(refinedInstRes.options); // Update State
                 validInstruments = refinedInstRes.options; // Update Local Var for label lookup below
            }
        }
        // [FIX END] ───────────────────────────────────────────────────


        // 4. DETERMINE LABELS BASED ON UPDATED LISTS
        let clientLabel = "";
        let foundClient = null;
        if (storedData.sClientID) {
          foundClient = validClients.find((c) => c.value === storedData.sClientID);
        }
        clientLabel = foundClient ? foundClient.label : (validClients.length > 0 ? validClients[0].label : "");

        let instrumentLabel = "";
        if (foundClient) {
          // Now `validInstruments` is correctly filtered for the client
          const foundInst = validInstruments.find((i) => i.value === storedData.sInstrumentID);
          instrumentLabel = foundInst ? foundInst.label : "";
          
          if (storedData.sInstrumentID === "") {
            instrumentLabel = "All";
          }
        }

        const formattedDuration = storedData.sRecordDuration
          ? storedData.sRecordDuration.replace(/_/g, " ")
          : "Current Date";

        let defaultFrom = new Date().toISOString().split("T")[0];
        let defaultTo = new Date().toISOString().split("T")[0];

        if (storedData.sRecordDuration === "Custom_Date" && storedData.sFrom && storedData.sTo) {
          const [d1, m1, y1] = storedData.sFrom.split("/");
          const [d2, m2, y2] = storedData.sTo.split("/");
          if (y1 && m1 && d1) defaultFrom = `${y1}-${m1}-${d1}`;
          if (y2 && m2 && d2) defaultTo = `${y2}-${m2}-${d2}`;
        }

        defaults = {
          storageGroup: storageGroupLabel,
          client: clientLabel,
          instrument: instrumentLabel,
          taskStatus: getStatusLabel(storedData.sTaskStatusValue),
          workflowStatus: defaultWorkflowStatus,
          recordsDuration: formattedDuration,
          fromDate: defaultFrom,
          toDate: defaultTo,
          sFTPID: sFTPID,
        };

        preparedFilter = {
          ...INITIAL_FILTER_STATE,
          storageGroup: storageGroupLabel,
          client: clientLabel,
          instrument: instrumentLabel,
          taskStatus: getStatusLabel(storedData.sTaskStatusValue),
          workflowStatus: defaultWorkflowStatus,
          recordsDuration: formattedDuration,
          fromDate: defaultFrom,
          toDate: defaultTo,
          hideEmpty: true,
        };
      } else {
        // CASE B: Fresh defaults
        defaults = {
          storageGroup: groupRes.hasData ? groupRes.options[0].label : "",
          client: clientRes.hasData ? clientRes.options[0].label : "",
          instrument: "",
          taskStatus: "All",
          recordsDuration: "Current Date",
          sFTPID: groupRes.hasData ? groupRes.options[0].value : "",
          fromDate: new Date().toISOString().split("T")[0],
          toDate: new Date().toISOString().split("T")[0],
        };

        preparedFilter = {
          ...INITIAL_FILTER_STATE,
          ...defaults,
          workflowStatus: workflowStatuses.length > 0 ? (workflowStatuses[0]?.label || "All") : "All",
          hideEmpty: true,
        };
      }

      return {
        ...dataResponse,
        defaults,
        preparedFilter,
      };
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  // 2. CHANGE STORAGE GROUP
  const changeStorageGroup = useCallback(async (sFTPID) => {
    setIsLoadingApi(true);
    try {
      const payload = {
        sFTPID,
        ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData",
        ...user,
      };
      const response = await postData("ftpviewdata/changeFTPGroupNameServerData", payload);
      
      const clientRes = AR_ajaxCall(response.Client, "combo");
      const instRes = AR_ajaxCall(response.InstrumentClientMapping, "combo");

      setClients(clientRes.options);
      setInstruments(instRes.options);

      return {
        clients: clientRes.options,
        instruments: instRes.options
      };
    } catch (err) {
      setClients([]);
      setInstruments([]);
      return { clients: [], instruments: [] };
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  // 3. CHANGE CLIENT NAME
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
      const response = await postData("ftpviewdata/changeClientNameServerData", payload);
      const instRes = AR_ajaxCall(response.InstrumentClientMapping, "combo");
      setInstruments(instRes.options);
      return instRes.options;
    } catch (err) {
      setInstruments([]);
      return [];
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  // 4. GET INSTRUMENT MAPPED CLIENT
  const getInstrumentmappedClientID = useCallback(async (sInstrumentMapID) => {
    setIsLoadingApi(true);
    try {
      const payload = { sInstrumentMapID, ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData", ...user };
      const response = await postData("ftpviewdata/getInstrumentmappedClientID", payload);
      return response.sClientID?.trim() || null;
    } catch (err) {
      return null;
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  // 5. SAVE CONFIGURATION
  const saveConfiguration = useCallback(async (currentConfigState) => {
    setIsLoadingApi(true);
    try {
      const actionsConfigArray = Object.entries(CONFIG_KEY_MAP).map(([frontendLabel, backendKey]) => {
        const isChecked = currentConfigState[frontendLabel] === true;
        return {
           sModuleName: "ServerData",
           sActive: isChecked ? 1 : 0, 
           sActions: backendKey
        };
      });

      const payload = {
        ActionsConfiguration: actionsConfigArray,
        nHideEmptyFldVisibility: currentConfigState["sys_HideFolderVisibility"],
        nHideEmptyFldDefaultval: currentConfigState["sys_HideFolderDefault"],
        ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData",
        ...user,
      };

      const response = await postData("ftpviewdata/insertActionConfigurationServerData", payload);
      
      // OPTIONAL: Immediately refetch configuration after saving so the UI is synced
      // configQuery.refetch(); 

      return response;

    } catch (err) {
      console.error("Config Save Error:", err);
      throw err;
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  // 6. API: GET INIT TREE DATA
  const getInitTreeData = useCallback(async (sFTPID, sClientID) => {
    setIsLoadingApi(true);
    try {
      const payload = {
        sFTPID: sFTPID,
        sClientID: sClientID || "",
        ...user, 
      };
      const response = await postData("ftpviewdata/getInitTreeServerData", payload);
      return response;
      
    } catch (err) {
      return null;
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  // 7. API: SELECT TREE DATA
  const getSelectTreeData = useCallback(async (payloadData) => {
    setIsLoadingApi(true);
    try {
      const payload = {
        ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData",
        ...user,
        ...payloadData
      };

      const response = await postData("ftpviewdata/selectTreeServerData", payload);
      
      const helperParams = { 
        passObjDet: payloadData 
      };

      const processedResult = SD_AjaxCall(response, "addTree", helperParams);

      console.log("------------------------------------------");
      console.log("Raw API Response:", response);
      console.log("Processed UI Logic (SD_AjaxCall):", processedResult);
      console.log("------------------------------------------");

      return processedResult;

    } catch (err) {
      console.error("Select Tree Error:", err);
      return null;
    } finally {
      setIsLoadingApi(false);
    }
  }, [postData, user]);

  const getFileProperties = useCallback(async (payloadData) => {
    // Don't set main loading to true here to avoid flickering the whole grid
    // We will handle local loading in the UI
    try {
      const payload = {
        ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData",
        ...user,
        ...payloadData
      };

      const response = await postData("ftpviewdata/propertiesServerData", payload);
      return response;
    } catch (err) {
      console.error("Properties Error:", err);
      return null;
    }
  }, [postData, user]);

  const openServerData = useCallback(async (payloadData) => {
    try {     
      const datapayload = {
         ...user,
         ...payloadData
      }
      const response = await postData("ftpviewdata/openServerData", datapayload);
      return response;
    } catch (err) {
      console.error("Open Server Data Error:", err);
      return { Rtn: "failure", Message: err.message };
    }
  }, [postData]);

  const getFileTagsAndParsed = useCallback(async (payloadData) => {
    try {
      const datapayload = {
        ...user, // This adds ActiveUserDetails
        ...payloadData
      };
      // Endpoint for Tags & Parsed Data
      const response = await postData("ftpviewdata/selectTemplateFileTag", datapayload);
      return response;
    } catch (err) {
      console.error("Tag API Error:", err);
      return null;
    }
  }, [postData, user]);


  const getMultiParsedFields = useCallback(async (payloadData) => {
    try {
      const datapayload = {
        ...user, // This adds ActiveUserDetails
        ...payloadData
      };
      // Endpoint for Multi Fields
      const response = await postData("ftpviewdata/getMultiParsedFields", datapayload);
      return response;
    } catch (err) {
      console.error("Multi Field API Error:", err);
      return null;
    }
  }, [postData, user]);



  const getFromToDates = (duration) => {
    const today = new Date();
    const to = new Date(today);
    const from = new Date(today);
    switch (duration) {
      case "Last 7 Days": from.setDate(today.getDate() - 7); break;
      case "Last 30 Days": from.setDate(today.getDate() - 30); break;
      case "Last 1 Year": from.setFullYear(today.getFullYear() - 1); break;
      case "Current Date": break;
      default: return null;
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
    changeStorageGroup,
    changeClientName,
    getInstrumentmappedClientID,
    getFromToDates,
    
    // -- UPDATED RETURNS FOR CONFIGURATION --
    configData: configQuery.data,      // The actual config object
    isConfigLoading: configQuery.isLoading, // True while fetching
    refetchConfig: configQuery.refetch, // Function to manually reload
    
    saveConfiguration,
    getInitTreeData,
    getSelectTreeData,
    getFileProperties,
    openServerData,
    getFileTagsAndParsed, 
    getMultiParsedFields
  };
};