import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import { FiCheckSquare } from "react-icons/fi";

const FileFilterModal = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [recordsDuration, setRecordsDuration] = useState("Last 30 Days");
  const [dateCategory, setDateCategory] = useState("FileUploadOn");
  const [clientName, setClientName] = useState("All");
  const [instrument, setInstrument] = useState("All");
  const [fileType, setFileType] = useState("All");
  const [sizeGreaterThan, setSizeGreaterThan] = useState("");
  const [filename, setFilename] = useState("");
  const [owner, setOwner] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [saveFilter, setSaveFilter] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Options for dropdowns
  const durationOptions = [
    "Last 7 Days",
    "Last 30 Days", 
    "Last 90 Days",
    "Last 1 Year",
    "Custom Date"
  ];

  const dateCategoryOptions = [
    "FileUploadOn",
    "FileModifiedOn", 
    "FileCreatedOn"
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

  const fileTypeOptions = [
    "All",
    "PDF",
    "DOC",
    "XLS",
    "TXT",
    "CSV"
  ];

  const usernameOptions = [
    "All",
    "User1",
    "User2",
    "User3"
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setRecordsDuration("Last 30 Days");
      setDateCategory("FileUploadOn");
      setClientName("All");
      setInstrument("All");
      setFileType("All");
      setSizeGreaterThan("");
      setFilename("");
      setOwner("");
      setLoginUsername("");
      setSaveFilter(false);
      setSubmitted(false);
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = () => {
    setSubmitted(true);
    const newErrors = {};

    // Add any validation here if needed
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Prepare filter data
      const filterData = {
        recordsDuration,
        dateCategory,
        clientName,
        instrument,
        fileType,
        sizeGreaterThan,
        filename,
        owner,
        loginUsername,
        saveFilter
      };

      // Call the submit handler
      if (onSubmit) {
        onSubmit(filterData);
      }

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Filter failed:", error);
    } 
  };

  const handleClear = () => {
    setRecordsDuration("Last 30 Days");
    setDateCategory("FileUploadOn");
    setClientName("All");
    setInstrument("All");
    setFileType("All");
    setSizeGreaterThan("");
    setFilename("");
    setOwner("");
    setLoginUsername("");
    setSaveFilter(false);
    setSubmitted(false);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#f5f7fb] mt-[60px] ml-[62px] px-2 flex flex-col">
      <div className="bg-white w-full h-full flex flex-col">
        {/* HEADER */}
        <div className="flex justify-center items-center py-1 bg-[#dbdfe4] border-b">
          <label className="text-[#0e5bca] text-[18px]"style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
            By File
          </label>
        </div>

        {/* BODY */}
        <div className="px-10 py-6 overflow-y-auto flex-1">

          {/* Two Column Form Layout */}
          <div className="grid grid-cols-2 gap-y-6">
            {/* LEFT COLUMN - Dropdowns */}
            <div className="space-y-4 w-[350px]" >
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

              {/* Date Category */}
              <div className="flex items-center">
                <div className="w-full">
                  <AnimatedDropdown
                  label="Date Category"
                    value={dateCategory}
                    options={dateCategoryOptions}
                    onChange={(e) => setDateCategory(e.target.value)}
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

              
            </div>

            {/* RIGHT COLUMN - Input Fields */}
            <div className="space-y-4 w-[350px]" >
                {/* File Type */}
              <div className="flex items-center">
                <div className="w-full">
                  <AnimatedDropdown
                  label="File Type"
                    value={fileType}
                    options={fileTypeOptions}
                    onChange={(e) => setFileType(e.target.value)}
                  />
                </div>
              </div>
              {/* Size >= */}
              <div >
                <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
                  Size &gt;=
                </label>
                <div className="w-full">
                  <input
                    type="text"
                    value={sizeGreaterThan}
                    onChange={(e) => setSizeGreaterThan(e.target.value)}
                    className="w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
            border-gray-300 cursor-pointer
          "
                  />
                </div>
              </div>

              {/* Filename */}
              <div >
                <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
                  Filename
                </label>
                <div className="w-full">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
            border-gray-300 cursor-pointer
          "
                  />
                </div>
              </div>

              {/* Owner */}
              <div >
                <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
                  Owner
                </label>
                <div className="w-full">
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
            border-gray-300 cursor-pointer
          "
                  />
                </div>
              </div>

              {/* Login Username */}
              <div>
                <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
                  Login Username
                </label>
                <div className="w-full">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
            border-gray-300 cursor-pointer
          "
                  />
                </div>
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

              {/* Save Filter Checkbox */}
              <div className="flex items-center">
                <div className="w-[180px] min-w-[180px]"></div>
                
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
            <FiCheckSquare className="w-4 h-4" />{" "}
            <span className="leading-none">{t("button.submit")}</span>
          </button>
          
          <button
            onClick={handleClear}
            className="border px-[12px] py-[6px] rounded text-[11px] text-[#8092a4] font-roboto font-bold"
          >
            
            <span className="leading-none">{t("button.clear")}</span>
          </button>
          
          <button
            onClick={onClose}
            className="border px-[12px] py-[6px] rounded text-[11px] text-[#8092a4] font-roboto font-bold"
          >
            <span className="leading-none">{t("button.close")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileFilterModal;