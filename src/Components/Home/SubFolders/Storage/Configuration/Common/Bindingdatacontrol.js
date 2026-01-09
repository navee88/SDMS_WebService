export const BDC_BindChildGrid = (data) => {
  // 1. Handle Empty Data safely
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { columns: [], formattedData: [] };
  }

  // 2. Identify Date Fields (Add more if needed)
  const dateFields = [
      "TransactionDate", "screatedtimestamp", "UpLoad Date", 
      "sCreatedOn", "CreatedOn", "RefTimestamp", "CaptureDate"
  ];

  // 3. Generate Columns Dynamically from the first row
  const firstRow = data[0];
  const dynamicColumns = Object.keys(firstRow).map((key) => {
    const isDate = dateFields.includes(key);
    
    return {
      key: key,            // Field name for access
      label: key,          // Header text
      width: 150,          // Default width
      isDate: isDate,      // For date formatting in UI
      sortable: true
    };
  });

  // 4. Create Unique IDs for React (Polyfill)
  const formattedData = data.map((row, index) => ({
    ...row,
    // Try to find a unique ID, otherwise use index
    _gridId: row.sServerID || row.id || `row-${index}` 
  }));

  // 5. Return the package expected by the Component
  return { 
      columns: dynamicColumns, 
      formattedData: formattedData 
  };
};


export const BDC_BindChildCombobox = (data, config = {}) => {
  // 1. Handle Empty/Null Data safely
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { 
        options: [], 
        defaultSelected: null, 
        hasData: false 
    };
  }

  // 2. Identify Label and Value keys dynamically
  // We check the first row to detect keys if they aren't provided in config.
  const firstRow = data[0];
  const keys = Object.keys(firstRow);

  // Helper regex matcher
  const findKey = (patterns) => keys.find(k => patterns.some(p => new RegExp(p, 'i').test(k)));

  // Strategy: Config -> Common Patterns -> Fallback Indices
  const labelKey = config.labelKey || 
                   findKey(['name', 'desc', 'text', 'description', 'label', 'alias']) || 
                   keys[1] || // Fallback to 2nd column (often name)
                   keys[0];   // Fallback to 1st column

  const valueKey = config.valueKey || 
                   findKey(['id', 'code', 'value', 'key']) || 
                   keys[0];   // Fallback to 1st column (often ID)

  // 3. Map Data to Standardized Format
  const formattedOptions = data.map((row, index) => {
    return {
      ...row,                         // Keep original data accessible
      label: String(row[labelKey]),   // Standardized UI label
      value: row[valueKey],           // Standardized Logic value
      _key: `opt-${index}`            // React-friendly unique key
    };
  });

  // 4. Determine Default Selection
  // Mimics legacy logic: `selectedIndex: 0` if data exists
  const defaultSelected = formattedOptions.length > 0 ? formattedOptions[0].value : null;

  // 5. Return the package
  return { 
      options: formattedOptions, 
      defaultSelected: defaultSelected,
      hasData: true 
  };
};