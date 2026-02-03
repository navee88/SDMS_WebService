// export const BDC_BindChildGrid = (data) => {
//   if (!data || !Array.isArray(data) || data.length === 0) {
//     return { columns: [], formattedData: [] };
//   }

//   const dateFields = [
//       "TransactionDate", "screatedtimestamp", "UpLoad Date", 
//       "sCreatedOn", "CreatedOn", "RefTimestamp", "CaptureDate"
//   ];

//   const firstRow = data[0];
//   const dynamicColumns = Object.keys(firstRow).map((key) => {
//     const isDate = dateFields.includes(key);
    
//     return {
//       key: key,            
//       label: key,          
//       width: 150,          
//       isDate: isDate,      
//       sortable: true
//     };
//   });

//   const formattedData = data.map((row, index) => ({
//     ...row,
//     _gridId: row.sServerID || row.id || `row-${index}` 
//   }));

//   return { 
//       columns: dynamicColumns, 
//       formattedData: formattedData 
//   };
// };


// Common/GridHelpers.js (or wherever you keep this)

export const BDC_BindChildGrid = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { columns: [], formattedData: [] };
  }

  const dateFields = [
      "TransactionDate", "screatedtimestamp", "UpLoad Date", 
      "sCreatedOn", "CreatedOn", "RefTimestamp", "CaptureDate", "dCreatedOn", "dModifiedOn"
  ];

  const firstRow = data[0];
  
  // Create generic columns from data keys
  const dynamicColumns = Object.keys(firstRow).map((key) => {
    const isDate = dateFields.includes(key);
    
    // Hide ID columns by default if needed, or keep them visible
    const isHidden = key.toLowerCase().includes("id") && key !== "sServerID"; 

    return {
      key: key,            
      label: key, // You might want a helper to format "sServerName" -> "Server Name"          
      width: 150,          
      isDate: isDate,      
      sortable: true,
      hidden: isHidden // Optional: hide technical ID columns
    };
  });

  const formattedData = data.map((row, index) => ({
    ...row,
    // Added sFTPID here because your Edit logic likely needs it
    _gridId: row.sFTPID || row.sServerID || row.id || `row-${index}` 
  }));

  return { 
      columns: dynamicColumns, 
      formattedData: formattedData 
  };
};

// export const BDC_BindChildCombobox = (data, config = {}) => {
//   if (!data || !Array.isArray(data) || data.length === 0) {
//     return { 
//         options: [], 
//         defaultSelected: null, 
//         hasData: false 
//     };
//   }

//   const firstRow = data[0];
//   const keys = Object.keys(firstRow);
//   const findKey = (patterns) => keys.find(k => patterns.some(p => new RegExp(p, 'i').test(k)));

//   const labelKey = config.labelKey || 
//                    findKey(['name', 'desc', 'text', 'description', 'label', 'alias']) || 
//                    keys[1] || 
//                    keys[0];  

//   const valueKey = config.valueKey || 
//                    findKey(['id', 'code', 'value', 'key']) || 
//                    keys[0];   

//   const formattedOptions = data.map((row, index) => {
//     return {
//       ...row,                         
//       label: String(row[labelKey]),   
//       value: row[valueKey],           
//       _key: `opt-${index}`            
//     };
//   });

//   const defaultSelected = formattedOptions.length > 0 ? formattedOptions[0].value : null;

//   return { 
//       options: formattedOptions, 
//       defaultSelected: defaultSelected,
//       hasData: true 
//   };
// };


export const BDC_BindChildCombobox = (data, config = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      options: [],
      defaultSelected: null,
      hasData: false,
    };
  }

  const MAX_SAFE_OPTIONS = 4000; // ← prevent memory + render explosion

  let workingData = data;
  let isTruncated = false;

  if (data.length > MAX_SAFE_OPTIONS) {
    workingData = data.slice(0, MAX_SAFE_OPTIONS);
    isTruncated = true;
    console.warn(
      `BDC_BindChildCombobox: Truncated from ${data.length} to ${MAX_SAFE_OPTIONS} items`
    );
  }

  const firstRow = workingData[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return { options: [], defaultSelected: null, hasData: false };
  }

  const keys = Object.keys(firstRow);

  const findBestKey = (patterns) =>
    keys.find(k => patterns.some(p => new RegExp(p, 'i').test(k)));

  // More patterns = more chance to find something meaningful
  const labelKey =
    config.labelKey ||
    findBestKey([
      'name', 'description', 'desc', 'text', 'label', 'alias', 'title',
      'display', 'fullname', 'displayname', 'sname'
    ]) ||
    keys[1] ||
    keys[0];

  const valueKey =
    config.valueKey ||
    findBestKey([
      'id', 'code', 'value', 'key', 'uuid', 'number', 'no',
      'sno', 'sid', 'scode', 'userid'
    ]) ||
    keys[0];

  const formattedOptions = workingData.map((row, index) => {
    let label = row[labelKey];

    // Very defensive label fallback
    if (label === undefined || label === null || label === '') {
      label = row[valueKey] ?? `Item ${index + 1}`;
    }

    return {
      ...row, // keep original data for later use
      label: String(label),
      value: row[valueKey] ?? `auto-val-${index}`,
      _key: `opt-${index}`,
    };
  });

  return {
    options: formattedOptions,
    defaultSelected: formattedOptions.length > 0 ? formattedOptions[0].value : null,
    hasData: formattedOptions.length > 0,
    truncated: isTruncated,
    originalCount: data.length,     // useful for UI warning: "Showing first 4000 of 12000"
  };
};



// export function buildTreeData(data, {
//   idKey = "id",
//   parentKey = "parentid",
//   textKey = "text"
// } = {}) {

//   if (!Array.isArray(data) || data.length === 0) return [];

//   const map = {};
//   const tree = [];

//   // Create lookup map
//   data.forEach(item => {
//     map[item[idKey]] = {
//       label: item[textKey],
//       value: item[idKey],
//       items: []
//     };
//   });

//   // Build hierarchy
//   data.forEach(item => {
//     const parentId = item[parentKey];
//     if (parentId && map[parentId]) {
//       map[parentId].items.push(map[item[idKey]]);
//     } else {
//       tree.push(map[item[idKey]]);
//     }
//   });

//   return tree;
// }


export const BDC_BindChildTree = ({
  dataResponse,
  treeRef,
  textField = "text",
  idField = "id",
  parentField = "parentid",
  autoSelect = false,
  onClearChild
}) => {

  if (!treeRef?.current) return;

  if (!Array.isArray(dataResponse) || dataResponse.length === 0) {
    treeRef.current.clear();
    onClearChild?.();
    return;
  }

  const map = Object.create(null);
  const treeData = [];

  for (let i = 0; i < dataResponse.length; i++) {
    const item = dataResponse[i];
    map[item[idField]] = {
      label: item[textField],
      value: item[idField],
      items: []
    };
  }

  for (let i = 0; i < dataResponse.length; i++) {
    const item = dataResponse[i];
    const parentId = item[parentField];

    if (parentId != null && map[parentId]) {
      map[parentId].items.push(map[item[idField]]);
    } else {
      treeData.push(map[item[idField]]);
    }
  }

  treeRef.current.source(treeData);

  if (autoSelect) {
    const items = treeRef.current.getItems();
    if (items?.length) {
      treeRef.current.selectItem(items[0]);
    }
  }
};
