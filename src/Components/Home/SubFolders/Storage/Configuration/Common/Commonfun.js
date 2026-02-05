import { AR_ajaxCall } from "./AR_ajaxCall";
import { BDC_BindChildCombobox, BDC_BindChildGrid,  BDC_BindChildTree } from "./Bindingdatacontrol";


// Strategy map for binders by control type
const bindersByCtrlType = {
  grid: (value) => BDC_BindChildGrid(value),
  combobox: (value) => BDC_BindChildCombobox(value),
};

// // Helper to normalize response (shared utility)
// const normalizeResponse = (response) => {
//   if (!response) return [];
//   if (Array.isArray(response)) return response;
//   if (Array.isArray(response.Data)) return response.Data;
//   if (Array.isArray(response.data)) return response.data;
//   return response;
// };

const findControlIdByKey = (resKey) => {
  // Logic to find element ID by "keyvalue" or "pojofield"
  const el = document.querySelector(`[keyvalue="${resKey}"], [pojofield="${resKey}"]`);
  return el ? el.id : null;
};

export const CF_splitResponseData = (dataResponse, targetControlId = null) => {
  // 1. Safety Check
  if (!dataResponse) {
    return;
  }

  // 2. Check if Array (Direct Binding)
  if (Array.isArray(dataResponse)) {
      // CCDB_getChildControlType(dataResponse, targetControlId);
  } 
  
  // 3. Check if Object (Map Binding)
  else if (typeof dataResponse === "object") {
    // Iterate over the keys (e.g., "EmployeeList": [...], "DepartmentCombo": [...])
    Object.entries(dataResponse).forEach(([resKey, resValue]) => {
      
      // Find the ID based on the key
      const thisID = findControlIdByKey(resKey);
      
      // Bind data to that specific ID
      if (thisID) {
        CF_getChildControlType(resValue, thisID);
      }
    });
  }
};






// Utility functions for the new implementation
const getType = (value) => {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

const findControlIdFallback = (resKey) => {
  // Fallback selectors since pageCss/fieldCss not available
  const selectors = [
    `[keyvalue="${resKey}"]`,
    `[pojofield="${resKey}"]`
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element.id;
  }
  
  return '';
};


/**
 * Modernized CF_getChildControlType - Pure JS version
 */
export const CF_getChildControlType = (dataResponse, thisObjID, ctrlType, childCtrlId) => {
  if (!ctrlType || !thisObjID) {
    console.warn('CF_getChildControlType: Missing ctrlType or thisObjID');
    return;
  }

  const controlHandlers = {
    grid: () => BDC_BindChildGrid(dataResponse, thisObjID, childCtrlId),
    combobox: () => BDC_BindChildCombobox(dataResponse, thisObjID, childCtrlId),
    tree: () => BDC_BindChildTree(dataResponse, thisObjID, childCtrlId),
    // listbox: () => BDC_BindChildListbox(dataResponse, thisObjID, childCtrlId)
  };

  const handler = controlHandlers[ctrlType];
  if (handler) {
    handler();
  } else {
    console.warn(`CF_getChildControlType: Unknown control type "${ctrlType}"`);
  }
};


export const FTP_ajaxCall = (dataresponse, editData) => {
  const rawData =
    dataresponse.Data ||
    dataresponse.data ||
    (Array.isArray(dataresponse) ? dataresponse : dataresponse);

  console.log("🔍 Raw Data For Configuration:", rawData);

  const RtnStatus = rawData?.Rtn?.toLowerCase();

  if (editData.process === "editGetData") {
    if (RtnStatus === "success") {
      const FTPMaster = rawData.FTPMaster || {};

      /* -----------------------------------
         SERVER OPTIONS
         value = sServerID
         label = sServerDesc
      ----------------------------------- */
      const serverOptions = (rawData.lstServerMaster || [])
        .map(item => ({
          value: String(item.sServerID || "").trim(),
          label: item.sServerDesc && item.sServerDesc
            ? String(item.sServerDesc).trim()
            : String(item.sServerID).trim() // fallback
        }))
        .filter(opt => opt.value);

      /* -----------------------------------
         DRIVE OPTIONS
         value = sDriveID
         label = sDriveStaticPath
      ----------------------------------- */
      const driveOptions = (rawData.lstDriveMaster || [])
        .map(item => ({
          value: String(item.sDriveID || "").trim(),
          label: String(item.sDriveStaticPath || "").trim(),
          storageType: item.sStorageTypeName || "FTP",
          portNo: item.iPortNo || 21
        }))
        .filter(opt => opt.value && opt.label);

      /* -----------------------------------
         SELECTED DRIVE (for storageType)
      ----------------------------------- */
      const selectedDrive = driveOptions.find(
        d => d.value === String(FTPMaster.sDriveID || "").trim()
      );

      /* -----------------------------------
         FORM DATA (EDIT BINDING)
      ----------------------------------- */
      const formData = {
        sFTPID: FTPMaster.sFTPID || "",
        serverId: String(FTPMaster.sServerID || "").trim(),   // ✅ S1
        serverDrivePath: String(FTPMaster.sDriveID || "").trim(), // ✅ SD1
        storageGroupName: FTPMaster.sFTPVirtualPathDirectory || "",
        serverNameIp: FTPMaster.sFTPServerIP || "",
        portNumber: FTPMaster.iPortNo === 0 ? "" : FTPMaster.iPortNo,
        storageType: selectedDrive?.storageType || "FTP",
        isActive: !!FTPMaster.iFTPStatus,
        isRead: !!FTPMaster.iStatusRead,
        isWrite: !!FTPMaster.iStatusWrite,
        virtualStaticIp: FTPMaster.sVirtualStaticIP
          ? FTPMaster.sVirtualStaticIP.split(":")[0]
          : ""
      };

      console.log("✅ serverOptions:", serverOptions);
      console.log("✅ driveOptions:", driveOptions);
      console.log("✅ selectedDrive:", selectedDrive);
      console.log("✅ formData:", formData);

      return {
        success: true,
        formData,
        dropdownData: {
          serverOptions,
          driveOptions,
          region: rawData.sRegion || ""
        },
        FTPMaster,
        rawResponse: rawData
      };
    }

    return {
      success: false,
      message: rawData.Message || "Request failed"
    };
  }

  return { success: true, data: rawData };
};




