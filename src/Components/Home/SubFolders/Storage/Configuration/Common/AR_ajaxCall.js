// import { BDC_BindChildGrid, BDC_BindChildCombobox } from "./Bindingdatacontrol";
// import { CF_splitResponseData } from "./Commonfun";

// export const AR_ajaxCall = (response, type, extraConfig = {}) => {
  
//   if (!response) {
//       if (type === "grid") return { columns: [], formattedData: [] };
//       if (type === "combo") return { options: [], defaultSelected: null, hasData: false };
//       return null;
//   }

//   switch (type) {
    
//     case "grid":
//       const rawArray = response.Data || response.data || (Array.isArray(response) ? response : []);
//       return BDC_BindChildGrid(rawArray);

   
//     case "combo":
//       const rawComboArray = response.Data || response.data || (Array.isArray(response) ? response : []);
//       return BDC_BindChildCombobox(rawComboArray, extraConfig);

//     case "getMapFillOnControl":
//       const rawMapArray = response.Data || response.data || (Array.isArray(response) ? response : []);
//       return CF_splitResponseData(rawMapArray);

//     case "status":
//       const rtnStatus = response.Rtn ? response.Rtn.toLowerCase() : "";
//       return {
//         success: rtnStatus === "success" || response.success === true,
//         message: response.Message?.message || response.Message || "Operation completed"
//       };

//     default:
//       return response;
//   }
// };



import { BDC_BindChildGrid, BDC_BindChildCombobox } from "./Bindingdatacontrol";
import { CF_splitResponseData } from "./Commonfun";

// Shared helper: normalize response to array or object as-is
const normalizeResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.Data)) return response.Data;
  if (Array.isArray(response.data)) return response.data;
  // return response;
  if(typeof response === 'object'){
    return[response]
  }

  return[];
};

export const AR_ajaxCall = (response, type, extraConfig = {}) => {
  if (!response) {
    if (type === "grid") return { columns: [], formattedData: [] };
    if (type === "combo") return { options: [], defaultSelected: null, hasData: false };
    return null;
  }

  switch (type) {
    case "grid": {
      const rawArray = normalizeResponse(response);
      return BDC_BindChildGrid(rawArray);
    }

    case "combo": {
      const rawComboArray = normalizeResponse(response);
      return BDC_BindChildCombobox(rawComboArray, extraConfig);
    }

    case "getMapFillOnControl": {
      const rawMap = normalizeResponse(response);
      return CF_splitResponseData(rawMap);
    }

    case "status": {
      const rtnStatus = response.Rtn ? response.Rtn.toLowerCase() : "";
      return {
        success: rtnStatus === "success" || response.success === true,
        message: response.Message?.message || response.Message || "Operation completed"
      };
    }

    default:
      return response;
  }
};
