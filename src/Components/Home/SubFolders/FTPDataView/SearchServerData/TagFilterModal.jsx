import React, { useState, useEffect, useRef } from "react";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import { FiCheckSquare, FiPlus, FiTrash2 } from "react-icons/fi";
import TagGrid from "./TagGrid";
import ParsedDataSearchGrid from "./ParsedDataSearchGrid";

// Temporary icon component
const EditPencilIcon = () => (
  <i className="fa fa-pencil text-sm mr-0.5"></i>
);

const TagFilterModal = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [recordsDuration, setRecordsDuration] = useState("Last 30 Days");
  const [clientName, setClientName] = useState("All");
  const [instrument, setInstrument] = useState("All");
  const [sizeGreaterThan, setSizeGreaterThan] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);
  
  // Template state
  const [templateEnabled, setTemplateEnabled] = useState(false);
  const [templateValue, setTemplateValue] = useState("All");
  
  // Tag grid data - based on your screenshot
  const [tags, setTags] = useState([
    { tagID: 1, tagName: "Category", value: "Sample", required: true, editable: true, options: [] },
    { tagID: 2, tagName: "Value", value: "Test", required: true, editable: true, options: [] },
    { tagID: 3, tagName: "Project", value: "", required: false, editable: true, options: [] },
    { tagID: 4, tagName: "BatchNo", value: "", required: false, editable: true, options: [] },
    { tagID: 5, tagName: "ARNo", value: "", required: false, editable: true, options: [] },
    { tagID: 6, tagName: "Result", value: "", required: false, editable: true, options: [] },
    { tagID: 7, tagName: "Trial", value: "", required: false, editable: true, options: [] },
    { tagID: 8, tagName: "DataFor", value: "", required: false, editable: true, options: [] },
  ]);
  
  // Parsed Data Search state - Initialize with EMPTY values
  const [parsedDataSearchEnabled, setParsedDataSearchEnabled] = useState(false);
  const [parsedDataRows, setParsedDataRows] = useState([
    { 
      id: 1, 
      logicalOperator: "", // CHANGED: Empty instead of "AND"
      fieldName: "", 
      relationalOperator: "", // CHANGED: Empty instead of "="
      fieldValue: "" 
    }
  ]);
  
  // State for dropdowns in parsed data grid
  const [showLogicalOpDropdown, setShowLogicalOpDropdown] = useState(-1);
  const [showRelOpDropdown, setShowRelOpDropdown] = useState(-1);
  const [logicalOpSearchTerm, setLogicalOpSearchTerm] = useState("");
  const [relOpSearchTerm, setRelOpSearchTerm] = useState("");
  
  const [saveFilter, setSaveFilter] = useState(false);
  const [tagErrors, setTagErrors] = useState({});

  // Options for dropdowns
  const durationOptions = [
    "Last 7 Days",
    "Last 30 Days", 
    "Last 90 Days",
    "Last 1 Year",
    "Custom Date"
  ];

  const clientOptions = [
    "All",
    "Client A",
    "Client B",
    "Client C"
  ];

  const instrumentOptions = [
    "All",
    "Instrument 1",
    "Instrument 2",
    "Instrument 3"
  ];

  const templateOptions = [
    "All",
    "Template 1",
    "Template 2",
    "Template 3"
  ];

  const logicalOperatorOptions = [
    "AND",
    "OR"
  ];

  const relationalOperatorOptions = [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "contains",
    "starts with",
    "ends with"
  ];

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRecordsDuration("Last 30 Days");
      setClientName("All");
      setInstrument("All");
      setSizeGreaterThan("");
      setTemplateEnabled(false);
      setTemplateValue("All");
      setParsedDataSearchEnabled(false);
      // CHANGED: Initialize with EMPTY values
      setParsedDataRows([{ 
        id: 1, 
        logicalOperator: "", // Empty instead of "AND"
        fieldName: "", 
        relationalOperator: "", // Empty instead of "="
        fieldValue: "" 
      }]);
      setShowLogicalOpDropdown(-1);
      setShowRelOpDropdown(-1);
      setLogicalOpSearchTerm("");
      setRelOpSearchTerm("");
      setSaveFilter(false);
      setTagErrors({});
    }
  }, [isOpen]);

  // Handler for tag value changes
  const handleTagValueClick = (index, value, valueID) => {
    if (!templateEnabled) return; // Don't allow editing if template is disabled
    
    const updatedTags = [...tags];
    updatedTags[index] = { ...updatedTags[index], value };
    setTags(updatedTags);
  };

  // Handler for tag edit requests
  const handleTagEditRequest = async (index) => {
    if (!templateEnabled) return []; // Don't return options if template is disabled
    
    // Return sample options for the tag
    return [
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2" },
      { value: "3", label: "Option 3" },
    ];
  };

  // Handler for inline tag editing
  const handleInlineEditSubmit = (index, value, valueID) => {
    if (!templateEnabled) return; // Don't allow editing if template is disabled
    
    const updatedTags = [...tags];
    updatedTags[index] = { ...updatedTags[index], value };
    setTags(updatedTags);
  };

  // Handler for parsed data row changes
  const handleParsedDataRowChange = (id, field, value) => {
    const updatedRows = parsedDataRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    );
    setParsedDataRows(updatedRows);
  };

  // Add new parsed data row - CHANGED: Empty values for new rows
  const handleAddParsedDataRow = () => {
    const newId = Math.max(...parsedDataRows.map(row => row.id), 0) + 1;
    const newRows = [
      ...parsedDataRows,
      { 
        id: newId, 
        logicalOperator: "", // CHANGED: Empty instead of "AND"
        fieldName: "", 
        relationalOperator: "", // CHANGED: Empty instead of "="
        fieldValue: "" 
      }
    ];
    setParsedDataRows(newRows);
    // Select the new row
    setSelectedRowId(newId);
  };

  const handleRemoveParsedDataRow = (id) => {
    if (parsedDataRows.length === 1) return;
    
    const newRows = parsedDataRows.filter(row => row.id !== id);
    setParsedDataRows(newRows);
    
    // If the selected row was removed, select the first row
    if (selectedRowId === id) {
      setSelectedRowId(newRows.length > 0 ? newRows[0].id : null);
    }
    
    // Close any dropdowns
    if (showLogicalOpDropdown === id) setShowLogicalOpDropdown(-1);
    if (showRelOpDropdown === id) setShowRelOpDropdown(-1);
  };

  // Add handler for row selection
  const handleRowSelect = (id) => {
    setSelectedRowId(id);
  };

  const handleSubmit = () => {
    // Prepare filter data
    const filterData = {
      // Left side data
      recordsDuration,
      clientName,
      instrument,
      sizeGreaterThan,
      templateEnabled,
      templateValue,
      
      // Tag data
      tags: templateEnabled ? tags.map(tag => ({ name: tag.tagName, value: tag.value })) : [],
      
      // Parsed Data Search
      parsedDataSearchEnabled,
      parsedDataRows: parsedDataSearchEnabled ? parsedDataRows : [],
      
      // Save filter
      saveFilter,
    };

    if (onSubmit) {
      onSubmit(filterData);
    }

    onClose();
  };

  const handleClear = () => {
    setRecordsDuration("Last 30 Days");
    setClientName("All");
    setInstrument("All");
    setSizeGreaterThan("");
    setTemplateEnabled(false);
    setTemplateValue("All");
    setParsedDataSearchEnabled(false);
    // CHANGED: Reset with EMPTY values
    setParsedDataRows([{ 
      id: 1, 
      logicalOperator: "", // Empty instead of "AND"
      fieldName: "", 
      relationalOperator: "", // Empty instead of "="
      fieldValue: "" 
    }]);
    setShowLogicalOpDropdown(-1);
    setShowRelOpDropdown(-1);
    setLogicalOpSearchTerm("");
    setRelOpSearchTerm("");
    setSaveFilter(false);
    setTagErrors({});
    
    // Reset tags
    setTags(prev => prev.map(tag => ({ ...tag, value: "" })));
  };

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isLogicalOpDropdown = event.target.closest('.logical-op-dropdown');
      const isRelOpDropdown = event.target.closest('.rel-op-dropdown');
      
      if (!isLogicalOpDropdown && showLogicalOpDropdown !== -1) {
        setShowLogicalOpDropdown(-1);
        setLogicalOpSearchTerm("");
      }
      
      if (!isRelOpDropdown && showRelOpDropdown !== -1) {
        setShowRelOpDropdown(-1);
        setRelOpSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogicalOpDropdown, showRelOpDropdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#f5f7fb] mt-[60px] ml-[62px] px-2 flex flex-col">
      <div className="bg-white w-full h-full flex flex-col">
        {/* HEADER */}
        <div className="flex justify-center items-center py-1 bg-[#dbdfe4] border-b">
          <label className="text-[#0e5bca] text-[18px]" style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
            By Tag
          </label>
        </div>

        {/* BODY */}
        <div className="px-10 py-6 overflow-y-auto flex-1">
          {/* Two Column Form Layout */}
          <div className="grid grid-cols-2 gap-y-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4 w-[350px]">
              {/* Records Duration */}
              <div className="flex items-center">
                <div className="w-full">
                  <AnimatedDropdown
                    label="Records Duration"
                    value={recordsDuration}
                    options={durationOptions}
                    onChange={(e) => setRecordsDuration(e.target.value)}
                  />
                </div>
              </div>

              {/* Client Name */}
              <div className="flex items-center">
                <div className="w-full">
                  <AnimatedDropdown
                    label="Client Name"
                    value={clientName}
                    options={clientOptions}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
              </div>

              {/* Instrument */}
              <div className="flex items-center">
                <div className="w-full">
                  <AnimatedDropdown
                    label="Instrument"
                    value={instrument}
                    options={instrumentOptions}
                    onChange={(e) => setInstrument(e.target.value)}
                  />
                </div>
              </div>

              {/* Size >= */}
              <div>
                <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
                  Size &gt;=
                </label>
                <div className="w-full">
                  <input
                    type="text"
                    value={sizeGreaterThan}
                    onChange={(e) => setSizeGreaterThan(e.target.value)}
                    className="w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555] border-gray-300 cursor-pointer focus:border-[#2883fe]"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Template Checkbox and Dropdown */}
              <div className="items-center gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="templateCheckbox"
                    checked={templateEnabled}
                    onChange={(e) => setTemplateEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="templateCheckbox" className="block text-[12px] font-roboto text-[#405F7D] font-semibold">
                    Template
                  </label>
                </div>
                <div className="w-[300px]">
                  <AnimatedDropdown
                    value={templateValue}
                    options={templateOptions}
                    onChange={(e) => setTemplateValue(e.target.value)}
                    disabled={!templateEnabled}
                  />
                </div>
              </div>

              {/* Tag Grid */}
              <div className="mt-2">
                <div className={`border border-gray-300 rounded-md overflow-hidden max-h-[250px] overflow-y-auto ${
                  !templateEnabled ? 'opacity-50' : ''
                }`}>
                  <TagGrid
                    tags={tags}
                    onTagValueClick={handleTagValueClick}
                    isLoadingTags={false}
                    isLocked={!templateEnabled} // Lock when template is disabled
                    lockedByOtherUser={false}
                    isAutoLocked={false}
                    onTagEditRequest={handleTagEditRequest}
                    onInlineEditSubmit={handleInlineEditSubmit}
                    t={(key) => key}
                    tagErrors={tagErrors}
                    // Pass specific columns for your screenshot
                    columns={[
                      { key: 'tagName', label: 'Tag Name', width: '50%' },
                      { key: 'value', label: 'Value', width: '50%' }
                    ]}
                  />
                </div>
              </div>

              {/* Parsed Data Search Section */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="parsedDataCheckbox"
                    checked={parsedDataSearchEnabled}
                    onChange={(e) => setParsedDataSearchEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="parsedDataCheckbox" className="block text-[12px] font-roboto text-[#405F7D] font-semibold">
                    Parsed Data Search
                  </label>
                </div>
                
                <div className={`border border-gray-300 rounded-md overflow-hidden max-h-[250px] overflow-y-auto ${
                  !parsedDataSearchEnabled ? 'opacity-50' : ''
                }`}>
                  <ParsedDataSearchGrid
                    rows={parsedDataRows}
                    onRowChange={handleParsedDataRowChange}
                    onAddRow={handleAddParsedDataRow}
                    onRemoveRow={handleRemoveParsedDataRow}
                    selectedRowId={selectedRowId}
                    onRowSelect={handleRowSelect}
                    logicalOperatorOptions={logicalOperatorOptions}
                    relationalOperatorOptions={relationalOperatorOptions}
                  />
                </div>
              </div>

              {/* Save Filter Checkbox */}
              <div className="flex items-center gap-2 mt-4">
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
            onClick={handleClear}
            className="border px-[12px] py-[6px] rounded text-[11px] text-[#8092a4] font-roboto font-bold"
          >
            <span className="leading-none">Clear</span>
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

export default TagFilterModal;