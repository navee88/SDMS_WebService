import React, { useState, useEffect } from "react";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import { FiCheckSquare } from "react-icons/fi";
import { BsEraserFill } from "react-icons/bs";

// Import the ParsedDataSearchGrid component you provided
import ParsedDataSearchGrid from "./ParsedDataSearchGrid";

const ParameterFilterModal = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [recordsDuration, setRecordsDuration] = useState("Last 30 Days");
  const [saveFilter, setSaveFilter] = useState(false);
  
  // Parsed Data Search state - Initialize with EMPTY values
  const [parsedDataRows, setParsedDataRows] = useState([
    { 
      id: 1, 
      logicalOperator: "", 
      fieldName: "", 
      relationalOperator: "", 
      fieldValue: "" 
    }
  ]);
  
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]); // Track validation errors
  const [showValidation, setShowValidation] = useState(false); // Track if we should show validation

  // Options for dropdowns
  const durationOptions = [
    "Last 7 Days",
    "Last 30 Days", 
    "Last 90 Days",
    "Last 1 Year",
    "Custom Date"
  ];

  // Logical and relational operator options
  const logicalOperatorOptions = ["AND", "OR"];
  const relationalOperatorOptions = [
    "=", "!=", ">", "<", ">=", "<=", "contains", "starts with", "ends with"
  ];

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRecordsDuration("Last 30 Days");
      setSaveFilter(false);
      // Reset to one empty row
      setParsedDataRows([{ 
        id: 1, 
        logicalOperator: "", 
        fieldName: "", 
        relationalOperator: "", 
        fieldValue: "" 
      }]);
      setSelectedRowId(null);
      setValidationErrors([]);
      setShowValidation(false);
    }
  }, [isOpen]);

  // Handler for parsed data row changes
  const handleParsedDataRowChange = (id, field, value) => {
    const updatedRows = parsedDataRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    );
    setParsedDataRows(updatedRows);
    
    // Clear validation for this field when user starts typing
    if (showValidation) {
      setValidationErrors(prev => prev.filter(error => !(error.rowId === id && error.field === field)));
    }
  };

  // Add new parsed data row
  const handleAddParsedDataRow = () => {
    const newId = Math.max(...parsedDataRows.map(row => row.id), 0) + 1;
    const newRows = [
      ...parsedDataRows,
      { 
        id: newId, 
        logicalOperator: "", 
        fieldName: "", 
        relationalOperator: "", 
        fieldValue: "" 
      }
    ];
    setParsedDataRows(newRows);
    // Select the new row
    setSelectedRowId(newId);
  };

  // Remove parsed data row
  const handleRemoveParsedDataRow = (id) => {
    if (parsedDataRows.length === 1) return;
    
    const newRows = parsedDataRows.filter(row => row.id !== id);
    setParsedDataRows(newRows);
    
    // Remove validation errors for this row
    setValidationErrors(prev => prev.filter(error => error.rowId !== id));
    
    // If the selected row was removed, select the first row
    if (selectedRowId === id) {
      setSelectedRowId(newRows.length > 0 ? newRows[0].id : null);
    }
  };

  // Handler for row selection
  const handleRowSelect = (id) => {
    setSelectedRowId(id);
  };

  // Clear only grid data
  const handleClearGrid = () => {
    setParsedDataRows([{ 
      id: 1, 
      logicalOperator: "", 
      fieldName: "", 
      relationalOperator: "", 
      fieldValue: "" 
    }]);
    setSelectedRowId(null);
    setValidationErrors([]);
    setShowValidation(false);
  };

  // Validate the grid data
  const validateGridData = () => {
    const errors = [];
    
    parsedDataRows.forEach(row => {
      if (!row.fieldName || row.fieldName.trim() === "") {
        errors.push({
          rowId: row.id,
          field: 'fieldName',
          message: 'Field Name is required'
        });
      }
      
      if (!row.relationalOperator || row.relationalOperator.trim() === "") {
        errors.push({
          rowId: row.id,
          field: 'relationalOperator',
          message: 'Relational Operator is required'
        });
      }
      
      if (!row.fieldValue || row.fieldValue.trim() === "") {
        errors.push({
          rowId: row.id,
          field: 'fieldValue',
          message: 'Field Value is required'
        });
      }
    });
    
    return errors;
  };

  const handleSubmit = () => {
    // Validate the grid data
    const errors = validateGridData();
    
    if (errors.length > 0) {
      // Show validation errors
      setValidationErrors(errors);
      setShowValidation(true);
      return; // Don't submit if there are errors
    }
    
    // Clear validation if everything is valid
    setValidationErrors([]);
    setShowValidation(false);
    
    // Prepare filter data
    const filterData = {
      recordsDuration,
      parsedDataRows,
      saveFilter,
    };

    if (onSubmit) {
      onSubmit(filterData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#f5f7fb] mt-[60px] ml-[62px] px-2 flex flex-col">
      <div className="bg-white w-full h-full flex flex-col">
        {/* HEADER */}
        <div className="flex justify-center items-center py-1 bg-[#dbdfe4] border-b">
          <label className="text-[#0e5bca] text-[18px]" style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
            By Parameter
          </label>
        </div>

        {/* BODY */}
        <div className="px-5 py-6 overflow-y-auto flex-1">
          {/* Left-aligned layout */}
          <div className="flex flex-col gap-6">
            {/* Top Row: Records Duration and Save Filter on left */}
            <div className="flex items-start gap-6">
              {/* Left side controls */}
              <div className="flex flex-col gap-4  mr-[100px]">
                <div className="w-[300px]">
                  <AnimatedDropdown
                    label="Records Duration"
                    value={recordsDuration}
                    options={durationOptions}
                    onChange={(e) => setRecordsDuration(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveFilter"
                    checked={saveFilter}
                    onChange={(e) => setSaveFilter(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="saveFilter" className="block text-[12px] font-roboto text-[#405F7D] font-semibold">
                    Save Filter
                  </label>
                </div>

                {/* Clear Grid Button */}
                
              </div>

              {/* Parsed Data Search Grid - to the right */}
              <div className="flex-1">
                <div className="mt-2 mb-4 flex justify-end mr-2">
                  <button
                    onClick={handleClearGrid}
                    className=" flex px-[12px] py-[6px] rounded text-[11px] text-[#2883fe] bg-[#f0f2f5] font-roboto font-bold shadow-sm items-center gap-1"
                  >
                    <BsEraserFill className="w-4 h-4" />
                   <span className="leading-none"> Clear </span>
                  </button>
                </div>
                
                
                
                <div className={`border ${showValidation && validationErrors.length > 0 ? 'border-red-500' : 'border-gray-300'} rounded-md overflow-hidden`}>
                  <ParsedDataSearchGrid
                    rows={parsedDataRows}
                    onRowChange={handleParsedDataRowChange}
                    onAddRow={handleAddParsedDataRow}
                    onRemoveRow={handleRemoveParsedDataRow}
                    selectedRowId={selectedRowId}
                    onRowSelect={handleRowSelect}
                    logicalOperatorOptions={logicalOperatorOptions}
                    relationalOperatorOptions={relationalOperatorOptions}
                    validationErrors={validationErrors}
                    showValidation={showValidation}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={handleSubmit}
            className="bg-[#2883fe] flex text-[#ffffff] px-[12px] py-[6px] rounded text-[11px] font-bold font-roboto shadow-sm items-center gap-1"
          >
            <FiCheckSquare className="w-4 h-4" />
            <span className="leading-none">Submit</span>
          </button>
          <button
            onClick={onClose}
            className="border px-[12px] py-[6px] rounded text-[11px] text-[#8092a4] font-roboto font-bold"
          >
            <span className="leading-none">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParameterFilterModal;