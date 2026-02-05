/**
 * Main Logic Engine for Server Data Responses
 * Processes API data and determines UI state (buttons to disable, flags to show).
 */
export const SD_AjaxCall = (dataResponse, actionType, params = {}) => {
  // 1. Default Structure
  const result = {
    treeNodes: [],
    gridData: [],
    disabledActions: [], // Array of button IDs to disable
    uiFlags: {
      showWorkComplete: false,
      hideWorkflowStatus: false,
    },
    selectedNodeOverride: null, // Used if we need to force a node rename/selection
    rawData: dataResponse       // Keep reference to original
  };

  // 2. Safety Check
  if (!dataResponse || Object.keys(dataResponse).length === 0) {
    return result;
  }

  switch (actionType) {
    case "addTree":
      const rawTreeData = dataResponse["ServerDataTree"] || [];
      const rawGridData = dataResponse["FileDetailsServerData"] || [];
      
      // Determine what was clicked (passed from UI params)
      // Check both sTaskID (Node ID) and sFTPID (Group ID)
      const clickedTaskId = params.passObjDet?.sTaskID || params.passObjDet?.sFTPID || "";

      // ---------------------------------------------------------
      // A. Process Tree Nodes (Map Status to Colors)
      // ---------------------------------------------------------
      result.treeNodes = rawTreeData.map((node) => {
        let statusColor = ""; 
        const status = node.sTaskStatus; 

        if (status === "A") statusColor = "green";
        else if (status === "D") statusColor = "orange";
        else if (status === "R") statusColor = "red";

        return {
          id: node.sTaskID,
          label: node.NodeName,
          value: node.sTaskID,
          parentId: node.sParentID,
          statusColor: statusColor,
          originalData: node,
        };
      });

      result.gridData = rawGridData;

      // ---------------------------------------------------------
      // B. Business Logic Engine (UI Rules)
      // ---------------------------------------------------------
      const actionsToDisable = new Set();
      
      // Common file actions
      const allFileActions = [
        "filedownload", "folderdownload", "fileupload", "folderupload",
        "restore", "versionhistory", "workcomplete", "workflowhistory",
        "attribute", "tag"
      ];

      // --- Rule 1: Empty Grid Logic ---
      if (rawGridData.length === 0) {
        result.uiFlags.showWorkComplete = true;
        result.uiFlags.hideWorkflowStatus = true;

        // Disable specific actions when grid is empty
        [
          "filedownload", "restore", "folderdownload", 
          "versionhistory", "workcomplete", "workflowhistory", 
          "attribute", "tag"
        ].forEach(a => actionsToDisable.add(a));

        // Explicitly Enable Uploads
        actionsToDisable.delete("fileupload");
        actionsToDisable.delete("folderupload");
      } else {
        // If Grid has data, Restore is enabled
        actionsToDisable.delete("restore");
      }

      // --- Rule 2: File vs Folder Logic (TaskID starts with 'F') ---
      if (clickedTaskId && clickedTaskId.toString().startsWith("F")) {
        // CASE: FILE Selected
        if (rawGridData.length > 0) {
          // Override the Tree Label to match the File Name
          result.selectedNodeOverride = {
            label: rawGridData[0]["File Name"] || rawGridData[0]["NodeName"],
            id: rawGridData[0]["TaskID"]
          };

          // Strict Mode: Disable almost everything inside a file view
          allFileActions.forEach(a => actionsToDisable.add(a));
        }
      } else {
        // CASE: FOLDER Selected
        // Ensure Uploads are enabled
        actionsToDisable.delete("fileupload");
        actionsToDisable.delete("folderupload");
      }

      // Convert Set to Array for React State
      result.disabledActions = Array.from(actionsToDisable);

      return result;

    default:
      return result;
  }
};