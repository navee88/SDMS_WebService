import { create } from 'zustand';
import { AR_ajaxCall } from '../../Storage/Configuration/Common/AR_ajaxCall'; 

export const useFileDetailsStore = create((set, get) => ({
  detailsState: {
    isLoadingTags: false,
    isLoadingMulti: false,
    
    tagsData: [],
    tagsColumns: [],
    parsedData: [],
    parsedDataColumns: [],
    
    // NEW: Array to hold multiple table objects { title, rows, columns }
    multiFieldsTables: [], 
    
    currentFileId: null,
    errorMsg: null,
  },

  resetDetails: () => set((state) => ({
    detailsState: {
      ...state.detailsState,
      isLoadingTags: false,
      isLoadingMulti: false,
      tagsData: [],
      parsedData: [],
      multiFieldsTables: [], // Reset tables
      errorMsg: null,
      currentFileId: null 
    }
  })),

  // ... (fetchTagsAndParsedData remains unchanged) ...
  fetchTagsAndParsedData: async (fileData, apiFunction) => {
      // ... (Your existing code for Tags/Parsed Data) ...
      // (Included in previous response, keeping it brief here to focus on MultiFields)
      if (!fileData) return;
      const { detailsState } = get();
      const recordNo = fileData["id"] || fileData["RecordNo"] || fileData["sRecordNo"];
      const taskId = fileData["TaskID"] || fileData["sTaskID"];
      const hasExistingTags = detailsState.tagsData?.length > 0;
      const isSameFile = detailsState.currentFileId === recordNo;
      if (isSameFile && hasExistingTags) return;

      set((state) => ({ detailsState: { ...state.detailsState, isLoadingTags: true, currentFileId: recordNo } }));

      try {
        const payload = {
            TaskID: (taskId || "").trim(),
            RecordNo: recordNo,
            ScreenModuleName: "Data Explorer",
            sModuleName: "ServerData",
            ApplicationCode: "SDMS"
        };
        const response = await apiFunction(payload);
        if (response) {
            const rawTags = response.TemplateTagValueData || [];
            const rawParsed = response.TemplateParserValueData || [];
            const mappedTags = rawTags.map((item, index) => ({
                id: index,
                category: item.Category,
                value: item.Value,
                createdBy: item.CreatedBy,
                createdOn: item.CreatedOn || item.UTCCreatedOn
            }));
            const mappedParsed = rawParsed.map((item, index) => ({
                id: index,
                fieldName: item.FieldName,
                fieldValue: item.FieldValue
            }));
            set((state) => ({
                detailsState: {
                    ...state.detailsState,
                    isLoadingTags: false,
                    tagsData: mappedTags,
                    parsedData: mappedParsed,
                    tagsColumns: [], 
                    parsedDataColumns: [],
                }
            }));
        } else {
            set((state) => ({ detailsState: { ...state.detailsState, isLoadingTags: false, tagsData: [], parsedData: [] } }));
        }
      } catch (error) {
        set((state) => ({ detailsState: { ...state.detailsState, isLoadingTags: false, errorMsg: error.message } }));
      }
  },

  // --------------------------------------------------------
  // FETCH MULTI-FIELDS DATA (UPDATED LOGIC)
  // --------------------------------------------------------
  fetchMultiFieldsData: async (fileData, apiFunction) => {
    if (!fileData) return;

    // Force fetch every time or check cache? Let's refresh for safety with complex data
    set((state) => ({
      detailsState: { ...state.detailsState, isLoadingMulti: true, multiFieldsTables: [] }
    }));

    try {
      const recordNo = fileData["id"] || fileData["RecordNo"] || fileData["sRecordNo"];
      const taskId = fileData["TaskID"] || fileData["sTaskID"];

      const payload = {
        TaskID: (taskId || "").trim(),
        RecordNo: recordNo,
        ScreenModuleName: "Data Explorer",
        sModuleName: "ServerData",
        ApplicationCode: "SDMS"
      };

      const response = await apiFunction(payload);

      console.group("🔹 API RESPONSE: getMultiParsedFields");
      console.log("Raw Response:", response);
      console.groupEnd();

      if (response) {
        // 1. EXTRACT MAIN OBJECTS
        // Note: Keys in your JSON were "MultiParserFields" and "MultiParsedFieldsTableInfo"
        const parserFields = response.MultiParserFields || {};
        const tableInfos = response.MultiParsedFieldsTableInfo || {};
        
        const processedTables = [];

        // 2. ITERATE OVER THE DATA FIELDS (e.g., MultiParsedFields_0, MultiParsedFields_1)
        Object.keys(parserFields).forEach(fieldKey => {
            // Extract the suffix number (e.g., "1" from "MultiParsedFields_1")
            const parts = fieldKey.split('_');
            const suffix = parts.length > 1 ? parts[parts.length - 1] : ''; 
            
            // 3. MATCH WITH TABLE INFO
            const infoKey = `MultiParsedFieldsTableInfo_${suffix}`;
            const infoData = tableInfos[infoKey];

            let tableTitle = "Empty";
            

            // let tableTitle = fieldKey; // Default
            if (infoData && Array.isArray(infoData) && infoData.length > 0) {
                const infoObj = infoData[0];
                if (infoObj.sFieldName && infoObj.sFieldValue) {
                    tableTitle = `${infoObj.sFieldName} : ${infoObj.sFieldValue}`;
                }
            }

            // 5. GET ROWS
            const rows = parserFields[fieldKey] || [];

            // 6. GENERATE DYNAMIC COLUMNS (With width 100 & enableSearch)
            let columns = [];
            if (rows.length > 0) {
                const firstRow = rows[0];
                columns = Object.keys(firstRow)
                    .filter(key => key !== 'id' && key !== 'key') 
                    .map((key) => ({
                        key: key,
                        label: key, 
                        width: 100, // <--- REQUIREMENT: Fixed Width 100
                        enableSearch: true, // <--- REQUIREMENT: Enable Search
                        render: (row, isSelected) => (
                            <div className="flex w-full justify-start text-left">
                              <span className={isSelected ? 'font-bold' : ''}>
                                {row[key]}
                              </span>
                            </div>
                        )
                    }));
            }

            // Add to list if we have rows
            if (rows.length > 0) {
                processedTables.push({
                    id: suffix || fieldKey, // Unique ID for React Key
                    title: tableTitle,
                    rows: rows,
                    columns: columns
                });
            }
        });

        // 7. UPDATE STATE
        set((state) => ({
          detailsState: {
            ...state.detailsState,
            isLoadingMulti: false,
            multiFieldsTables: processedTables // Store the array of tables
          }
        }));
      } else {
         set((state) => ({ detailsState: { ...state.detailsState, isLoadingMulti: false, multiFieldsTables: [] } }));
      }
    } catch (error) {
      console.error("Multi Fields Error", error);
      set((state) => ({
        detailsState: { ...state.detailsState, isLoadingMulti: false, errorMsg: error.message }
      }));
    }
  }
}));