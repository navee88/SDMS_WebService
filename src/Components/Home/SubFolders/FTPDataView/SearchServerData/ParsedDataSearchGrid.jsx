import React, { useState, useEffect, useRef } from "react";

// Temporary icon components
const EditPencilIcon = () => (
  <i className="fa fa-pencil text-sm mr-0.5"></i>
);

const DeleteIcon = () => (
  <i className="fa fa-times text-sm text-red-500 hover:text-red-700 cursor-pointer"></i>
);

const RequiredSymbol = () => (
  <span className="text-red-500 ml-1">*</span>
);

const ParsedDataSearchGrid = ({ 
  rows, 
  onRowChange, 
  onAddRow, 
  onRemoveRow,
  logicalOperatorOptions = "",
  relationalOperatorOptions = ["=", "!=", ">", "<", ">=", "<=", "contains", "starts with", "ends with"],
  selectedRowId = null,
  onRowSelect = null,
  validationErrors = [], // Add validation errors prop
  showValidation = false // Add show validation prop
}) => {
  const [tooltipState, setTooltipState] = useState({
    isOpen: false,
    rowId: null,
    type: null, // 'fieldName' or 'relational'
    position: { top: 0, left: 0 },
    searchTerm: "",
    selectedValue: "",
    options: []
  });

  const fieldNameButtonRefs = useRef({});
  const relOpButtonRefs = useRef({});

  // Get field name display text - return empty string if no value
  const getFieldNameDisplay = (value) => {
    return value || "";
  };

  // Get relational operator display text - return empty string if no value
  const getRelationalOperatorDisplay = (value) => {
    return value || "";
  };

  // Check if a field has a value (for showing required indicator)
  const isFieldEmpty = (value) => {
    return !value || value.trim() === "";
  };

  // Check if a field has validation error
  const hasValidationError = (rowId, field) => {
    if (!showValidation) return false;
    return validationErrors.some(error => error.rowId === rowId && error.field === field);
  };

  // Calculate tooltip position similar to TagGrid
  const calculateTooltipPositionFromRect = (buttonRect, type) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 250;
    const tooltipHeight = 220;
   
    let left = buttonRect.left - tooltipWidth + 0;
    let top = buttonRect.top - (tooltipHeight) + 10;
   
    if (top < 10) top = 10;
    if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
    if (left < 10) left = buttonRect.right + 10;
    if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
   
    return { top, left };
  };

  // Handler for opening dropdown (for field name or relational operator)
  const handleDropdownClick = (rowId, type, event) => {
    event.stopPropagation();
    
    const buttonRef = type === 'fieldName' 
      ? fieldNameButtonRefs.current[rowId]
      : relOpButtonRefs.current[rowId];
    
    if (!buttonRef) return;

    const buttonRect = buttonRef.getBoundingClientRect();
    const position = calculateTooltipPositionFromRect(buttonRect, type);

    const currentRow = rows.find(row => row.id === rowId);
    let currentValue = '';
    let options = [];

    if (type === 'fieldName') {
      currentValue = currentRow?.fieldName || '';
      // For field name, we could have predefined options or allow custom input
      // For now, we'll use sample options
      options = [
        { value: "sample_field1", label: "Sample Field 1" },
        { value: "sample_field2", label: "Sample Field 2" },
        { value: "sample_field3", label: "Sample Field 3" },
        { value: "custom", label: "Custom Field" }
      ];
    } else if (type === 'relational') {
      currentValue = currentRow?.relationalOperator || '';
      options = relationalOperatorOptions.map(op => ({ value: op, label: op }));
    }

    setTooltipState({
      isOpen: true,
      rowId,
      type,
      position,
      searchTerm: '',
      selectedValue: currentValue,
      options
    });
  };

  // Handler for selecting an option
  const handleOptionSelect = (value) => {
    if (tooltipState.rowId !== null && tooltipState.type) {
      let field = '';
      if (tooltipState.type === 'fieldName') {
        field = 'fieldName';
      } else if (tooltipState.type === 'relational') {
        field = 'relationalOperator';
      }
      
      if (field) {
        onRowChange(tooltipState.rowId, field, value);
      }
    }
    handleTooltipClose();
  };

  // Handler for closing tooltip
  const handleTooltipClose = () => {
    setTooltipState({
      isOpen: false,
      rowId: null,
      type: null,
      position: { top: 0, left: 0 },
      searchTerm: "",
      selectedValue: "",
      options: []
    });
  };

  // Handler for submitting tooltip selection (when double-clicking option)
  const handleTooltipSubmit = () => {
    if (tooltipState.selectedValue) {
      handleOptionSelect(tooltipState.selectedValue);
    }
  };

  // Handler for search term change
  const handleSearchChange = (value) => {
    setTooltipState(prev => ({
      ...prev,
      searchTerm: value
    }));
  };

  // Handler for option click
  const handleOptionClick = (value) => {
    setTooltipState(prev => ({
      ...prev,
      selectedValue: value
    }));
  };

  // Handler for row changes
  const handleRowChange = (id, field, value) => {
    if (onRowChange) {
      onRowChange(id, field, value);
    }
  };

  // Handler for clearing field value
  const handleClearFieldValue = (id, e) => {
    e.stopPropagation();
    handleRowChange(id, 'fieldValue', '');
  };

  // Handler for row click (selection)
  const handleRowClick = (id) => {
    if (onRowSelect) {
      onRowSelect(id);
    }
  };

  // Filter options based on search term
  const filteredOptions = tooltipState.options.filter(opt =>
    opt.label.toLowerCase().includes(tooltipState.searchTerm.toLowerCase())
  );

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isTooltip = event.target.closest('.operator-tooltip');
      
      if (!isTooltip && tooltipState.isOpen) {
        handleTooltipClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltipState.isOpen]);

  // Select first row by default on mount
  useEffect(() => {
    if (rows.length > 0 && onRowSelect && selectedRowId === null) {
      onRowSelect(rows[0].id);
    }
  }, [rows, onRowSelect, selectedRowId]);

  // Initialize rows with empty values
  useEffect(() => {
    // Ensure all rows start with empty values
    if (rows.length > 0) {
      const hasDefaults = rows.some(row => 
        row.logicalOperator === "AND" || 
        row.relationalOperator === "=" ||
        row.fieldName === "Click to select"
      );
      
      if (hasDefaults) {
        // Reset rows to empty values
        rows.forEach((row, index) => {
          if (row.logicalOperator === "AND") {
            handleRowChange(row.id, 'logicalOperator', '');
          }
          if (row.relationalOperator === "=") {
            handleRowChange(row.id, 'relationalOperator', '');
          }
          if (row.fieldName === "Click to select") {
            handleRowChange(row.id, 'fieldName', '');
          }
        });
      }
    }
  }, []);

  return (
    <div className="space-y-3">
      
      {/* Grid for Parsed Data Search */}
      <div className="border border-[#f3f3f3] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 bg-[#fbfbfb] border-b border-[#f3f3f3]">
          <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">Logical Operator</div>
          <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
            Field Name
          </div>
          <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
            Relational Operator
          </div>
          <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
            Field Value
          </div>
        </div>

        {/* Body */}
        <div className="bg-white min-h-[150px] max-h-[200px] overflow-y-auto">
          {rows.map((row) => {
            const isSelected = selectedRowId === row.id;
            const hasFieldValue = row.fieldValue && row.fieldValue.trim() !== '';
            const isFieldNameEmpty = isFieldEmpty(row.fieldName);
            const isRelOpEmpty = isFieldEmpty(row.relationalOperator);
            const isFieldValueEmpty = isFieldEmpty(row.fieldValue);
            
            const hasFieldNameError = hasValidationError(row.id, 'fieldName');
            const hasRelOpError = hasValidationError(row.id, 'relationalOperator');
            const hasFieldValueError = hasValidationError(row.id, 'fieldValue');
            
            return (
              <div 
                key={row.id} 
                className={`grid grid-cols-4 border-b border-[#e7e6e6] last:border-b-0 min-h-[40px] cursor-pointer
                  ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#2883fe]' : 'bg-white border-l-4 border-l-transparent'}`}
                onClick={() => handleRowClick(row.id)}
              >
                
                {/* Logical Operator Column - NORMAL INPUT */}
                <div className="px-4 py-2 relative flex items-center">
                  <input
                    type="text"
                    value={row.logicalOperator || ""}
                    onChange={(e) => handleRowChange(row.id, 'logicalOperator', e.target.value)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(row.id);
                    }}
                    className="w-full h-8 px-2 text-xs font-bold bg-[#eef2f9] border-gray-300 focus:outline-none font-['verdana']"
                    placeholder=""
                  />
                </div>

                {/* Field Name Column - WITH EDIT ICON DROPDOWN */}
                <div className="px-4 py-2 relative flex items-center">
                  <div className={`flex-1 flex items-center justify-between `}>
                    <div className="flex items-center">
                      {/* Show empty string if no value */}
                      <div className={`text-xs font-['verdana'] ${row.fieldName ? 'text-[#373737]' : 'text-gray-400'}`}>
                        {getFieldNameDisplay(row.fieldName)}
                      </div>
                    </div>

                    <div className="flex items-center">
                      {/* Show required indicator if empty */}
                      {(isFieldNameEmpty || hasFieldNameError) && (
                        <RequiredSymbol />
                      )}
                      <button
                        ref={el => fieldNameButtonRefs.current[row.id] = el}
                        onClick={(e) => handleDropdownClick(row.id, 'fieldName', e)}
                        className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool ml-1"
                      >
                        <EditPencilIcon />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Relational Operator Column */}
                <div className="px-4 py-2 relative flex items-center">
                  <div className={`flex-1 flex items-center justify-between `}>
                    <div className="flex items-center">
                      {/* Show empty string if no value */}
                      <div className={`text-xs font-['verdana'] ${row.relationalOperator ? 'text-[#373737]' : 'text-gray-400'}`}>
                        {getRelationalOperatorDisplay(row.relationalOperator)}
                      </div>
                    </div>

                    <div className="flex items-center">
                      {/* Show required indicator if empty */}
                      {(isRelOpEmpty || hasRelOpError) && (
                        <RequiredSymbol />
                      )}
                      <button
                        ref={el => relOpButtonRefs.current[row.id] = el}
                        onClick={(e) => handleDropdownClick(row.id, 'relational', e)}
                        className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool ml-1"
                      >
                        <EditPencilIcon />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Field Value Column with delete icon */}
                <div className="px-4 py-2 relative flex items-center">
                  <div className={`relative w-full flex items-center`}>
                    <input
                      type="text"
                      value={row.fieldValue || ""}
                      onChange={(e) => handleRowChange(row.id, 'fieldValue', e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row.id);
                      }}
                      className={`w-full h-8 px-2 pr-7 text-xs font-bold bg-[#eef2f9] border-gray-300 focus:outline-none font-['verdana'] ${hasFieldValueError ? 'border-red-500' : ''}`}
                      placeholder=""
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                      {/* Show required indicator if empty */}
                      {(isFieldValueEmpty && !hasFieldValue) && (
                        <RequiredSymbol />
                      )}
                      {hasFieldValue && (
                        <div 
                          onClick={(e) => handleClearFieldValue(row.id, e)}
                          className="ml-1"
                        >
                          <DeleteIcon />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dropdown Selection Tooltip */}
      {tooltipState.isOpen && (
        <div
          className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col operator-tooltip"
          style={{
            top: `${tooltipState.position.top}px`,
            left: `${tooltipState.position.left}px`,
          }}
        >
          <div className="p-0.5 border-gray-200">
            <div className="mb-0">
              <input
                type="text"
                value={tooltipState.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
                autoFocus
                placeholder="Looking for"
              />
            </div>
          </div>
         
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 font-roboto">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = tooltipState.selectedValue === option.value;
               
                return (
                  <div
                    key={`option-${idx}-${option.value}`}
                    onClick={() => handleOptionClick(option.value)}
                    onDoubleClick={handleTooltipSubmit}
                    className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
                      ${isSelected ? 'bg-[#f2f2f2]' : ''}
                      ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
                    `}
                  >
                    <div className="flex items-center ml-1">
                      <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
                        {option.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
         
          <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
            <button
              onClick={handleTooltipSubmit}
              className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
            >
              <i className="fa fa-check-square-o mr-1"></i>
              Submit
            </button>
            <button
              onClick={handleTooltipClose}
              className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
            >
              <i className="fa fa-times mr-1"></i>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParsedDataSearchGrid;