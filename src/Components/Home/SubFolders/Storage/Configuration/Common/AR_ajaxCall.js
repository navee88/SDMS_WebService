/* Services/Common/AR_ajaxCall.js */

// IMPORTS
import { BDC_BindChildGrid, BDC_BindChildCombobox } from "./Bindingdatacontrol";

// UPDATE: Add extraConfig as the 3rd parameter (defaulting to empty object)
export const AR_ajaxCall = (response, type, extraConfig = {}) => {
  
  // Safety Check
  if (!response) {
      if (type === "grid") return { columns: [], formattedData: [] };
      if (type === "combo") return { options: [], defaultSelected: null, hasData: false };
      return null;
  }

  switch (type) {
    /* ----------------------------------------------------
       CASE: GRID
    ---------------------------------------------------- */
    case "grid":
      const rawArray = response.Data || response.data || (Array.isArray(response) ? response : []);
      return BDC_BindChildGrid(rawArray);

    /* ----------------------------------------------------
       CASE: COMBO
    ---------------------------------------------------- */
    case "combo":
      const rawComboArray = response.Data || response.data || (Array.isArray(response) ? response : []);
      
      // NOW IT WORKS: extraConfig is passed from the function argument above
      return BDC_BindChildCombobox(rawComboArray, extraConfig);

    /* ----------------------------------------------------
       CASE: STATUS
    ---------------------------------------------------- */
    case "status":
      const rtnStatus = response.Rtn ? response.Rtn.toLowerCase() : "";
      return {
        success: rtnStatus === "success" || response.success === true,
        message: response.Message?.message || response.Message || "Operation completed"
      };

    /* ----------------------------------------------------
       DEFAULT
    ---------------------------------------------------- */
    default:
      return response;
  }
};
