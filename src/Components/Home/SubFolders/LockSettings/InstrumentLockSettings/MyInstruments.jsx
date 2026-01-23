// File: src/Components/Home/SubFolders/LockSettings/InstrumentLockSettings/MyInstrumentsPage.js
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";

// Add at the top with other imports
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { CF_decrypt, CF_encrypt } from '../../../../../Components/Common/encryptiondecryption';
import FullPageLoader from "../../../../Layout/Common/FullPageLoader";
import Errordialog from "../../../../Layout/Common/Errordialog";

// Unified PrimaryButton component with variant support
const PrimaryButton = ({ 
  iconClass,
  label, 
  disabled, 
  onClick, 
  className = "",
  variant = "primary",
  loading = false
}) => {
  const baseClasses = "flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold rounded whitespace-nowrap hover:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: disabled 
      ? "bg-slate-100 text-slate-300 cursor-not-allowed" 
      : "bg-[#f1f5f9] text-[#2883FE] hover:bg-[#E6F0FF]",
    secondary: disabled
      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: disabled
      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
      : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <i className="fa fa-refresh w-3.5 h-3.5 animate-spin" />
      ) : iconClass && (
        <i className={`fa ${iconClass} w-3.5 h-3.5`} />
      )}
      <span>{label}</span>
    </button>
  );
};

const FileUploadDropzone = ({ onFilesAdded, files, onRemoveFile, onUpload, onReset, loading = false }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFilesAdded(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    onFilesAdded(selectedFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border border-gray-300 bg-white p-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />   
        <i className="fa fa-plus-circle mx-auto mb-2 text-gray-400" style={{ fontSize: '2.5em' }} />
        <div className="text-gray-700 ">
          <span className="font-bold font-Helvetica Neue text-sm uppercase">{t("instrumentlocktag.dragdrop") || "Drag & Drop"}</span>
          <br />
          {t("instrumentlocktag.or") || "or"}{" "}
          <span className="text-blue-600 underline">
            {t("instrumentlocktag.clickhere") || "Click Here"}
          </span>
          {" "}{t("instrumentlocktag.tobrowseoraccesscamera") || "to browse or access camera"}
          {" "}<i className="fa fa-camera inline ml-1 text-sm" />
          {" "}{t("instrumentlocktag.toaddfile") || "to add file"}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold text-gray-700 mb-2">
            Selected Files ({files.length})
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
                <PrimaryButton
                  onClick={() => onRemoveFile(index)}
                  variant="danger"
                  className="ml-2 p-1 min-w-[auto]"
                  iconClass="fa-times"
                  label=""
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <PrimaryButton
          onClick={onReset}
          iconClass="fa-redo"
          label={t("button.reset") || "Reset"}
          variant="primary"
          className="px-4"
        />
        <PrimaryButton
          onClick={onUpload}
          disabled={files.length === 0}
          iconClass="fa-upload"
          label={t("button.upload") || "Upload"}
          variant="primary"
          className="px-4"
          loading={loading}
        />
      </div>
    </div>
  );
};

const InfoBox = ({ data }) => (
  <div className="border border-gray-300 bg-white min-h-[170px] p-4 overflow-auto">
    {data.length === 0 ? null : (
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex">
            <label className="w-[45%] text-xs font-bold text-gray-800">
              {d.label}:
            </label>
            <span className="w-[45%] text-xs font-bold text-[#162ddc]">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function MyInstrumentsPage() {
  const { t } = useTranslation();
  const { postData } = servicecall();

  // State management
  const [lockedInstruments, setLockedInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTags, setFileTags] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [showUploadZone, setShowUploadZone] = useState(true);
  const [featureStatus, setFeatureStatus] = useState(false);
  
  // Loading states
  const [fullPageLoading, setFullPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState({
    template: false,
    instruments: false,
    files: false,
    fileTags: false,
    upload: false
  });
  
  const [infoDialog, setInfoDialog] = useState({
    open: false,
    message: "",
    type: "information"
  });

  // Dialog functions
  const showInfoDialog = useCallback((message, type = "information") => {
    setInfoDialog({ open: true, message, type });
  }, []);

  const closeInfoDialog = useCallback(() => {
    setInfoDialog(prev => ({ ...prev, open: false }));
  }, []);

  // Function to make API call - Similar to InstrumentDataPage
  const makeAPICall = useCallback(async (url, passObjDet) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { ...passObjDet, ...userDetailsData };
    return await postData(url, reqObj);
  }, [postData]);

  // Function to handle API response decryption
  const handleAPIResponse = useCallback((response) => {
    if (!response) {
      console.error('No response from API');
      return null;
    }
    
    if (typeof response === 'string' && response.length > 50) {
      try {
        const decrypted = CF_decrypt(response);
        return JSON.parse(decrypted);
      } catch (decryptError) {
        try {
          return JSON.parse(response);
        } catch (parseError) {
          return response;
        }
      }
    }
    
    return response;
  }, []);

  // Load initial data
  useEffect(() => {
    loadTemplateValidation();
  }, []);

  const loadTemplateValidation = async () => {
    setFullPageLoading(true);
    setIsLoading(prev => ({ ...prev, template: true }));
    
    try {
      const response = await makeAPICall("InstrumentLock/ValidatingTemplateTobeLoad", {});
      const processedResponse = handleAPIResponse(response);
      
      if (processedResponse && processedResponse.length > 0) {
        const feature = processedResponse[0]["L67Status"];
        setFeatureStatus(feature);
        await loadLockedInstruments(feature);
      } else {
        showInfoDialog(t("instrumentlocktag.noinstrumentsfound") || "No instruments found", "information");
      }
    } catch (error) {
      console.error("Error loading template validation:", error);
      showInfoDialog("Failed to load template validation", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, template: false }));
      setFullPageLoading(false);
    }
  };

  const loadLockedInstruments = async (feature) => {
    setIsLoading(prev => ({ ...prev, instruments: true }));
    
    try {
      const response = await makeAPICall("InstrumentLock/LoadCurrentUsersLockInstDetails", {
        sFeature: feature
      });
      const processedResponse = handleAPIResponse(response);
      
      if (processedResponse && Array.isArray(processedResponse)) {
        setLockedInstruments(processedResponse);
        
        // Auto-select first instrument if available
        if (processedResponse.length > 0) {
          const firstInstrument = processedResponse[0];
          handleInstrumentSelect(firstInstrument);
        }
      } else {
        setLockedInstruments([]);
      }
    } catch (error) {
      console.error("Error loading locked instruments:", error);
      showInfoDialog("Failed to load instruments", "information");
      setLockedInstruments([]);
    } finally {
      setIsLoading(prev => ({ ...prev, instruments: false }));
    }
  };

  const handleInstrumentSelect = async (instrument) => {
    setSelectedInstrument(instrument);
    setSelectedFile(null);
    setFileTags([]);
    
    // Determine if upload zone should be shown
    const shouldShow = instrument.Status === "Locked" && 
                      instrument.iCommunicationType === -2 && 
                      parseInt(instrument.sParsertype) === 0;
    setShowUploadZone(shouldShow);
    
    // Load instrument files
    await loadInstrumentFiles(instrument);
  };

  const loadInstrumentFiles = async (instrument) => {
    setIsLoading(prev => ({ ...prev, files: true }));
    
    try {
      const response = await makeAPICall("InstrumentLock/InstrumentCaptureTagData", {
        sTaskID: instrument.sTaskID
      });
      const processedResponse = handleAPIResponse(response);
      
      if (processedResponse && Array.isArray(processedResponse)) {
        setFiles(processedResponse);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Error loading instrument files:", error);
      showInfoDialog("Failed to load files", "information");
      setFiles([]);
    } finally {
      setIsLoading(prev => ({ ...prev, files: false }));
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    await loadFileTags(file);
  };

  const loadFileTags = async (file) => {
    setIsLoading(prev => ({ ...prev, fileTags: true }));
    
    try {
      const response = await makeAPICall("InstrumentLock/LoadCategoryValueForFiles", {
        sRecordNo: file.Reference,
        sTaskID: file["Task ID"],
        sFileName: file["File Name"]
      });
      const processedResponse = handleAPIResponse(response);
      
      if (processedResponse && Array.isArray(processedResponse)) {
        const tags = processedResponse.map(item => ({
          label: item.Category,
          value: item.Value
        }));
        setFileTags(tags);
      } else {
        setFileTags([]);
      }
    } catch (error) {
      console.error("Error loading file tags:", error);
      showInfoDialog("Failed to load file tags", "information");
      setFileTags([]);
    } finally {
      setIsLoading(prev => ({ ...prev, fileTags: false }));
    }
  };

  const handleRefreshInstruments = () => {
    loadLockedInstruments(featureStatus);
  };

  const handleRefreshFiles = () => {
    if (selectedInstrument) {
      loadInstrumentFiles(selectedInstrument);
    } else {
      showInfoDialog("Please select an instrument first", "information");
    }
  };

  const handleFilesAdded = (newFiles) => {
    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetFiles = () => {
    setUploadFiles([]);
  };

  const checkSchedulerStatus = async () => {
    if (!selectedInstrument || uploadFiles.length === 0) {
      showInfoDialog("Please select files to upload", "information");
      return false;
    }

    try {
      const response = await makeAPICall("ftpviewdata/checkSchedulerStatus", {
        sTaskID: selectedInstrument.sTaskID
      });
      const processedResponse = handleAPIResponse(response);
      
      if (processedResponse && processedResponse.Message) {
        showInfoDialog(processedResponse.Message, "warning");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking scheduler status:", error);
      showInfoDialog("Error checking scheduler status", "information");
      return false;
    }
  };

  const handleUpload = async () => {
    const canProceed = await checkSchedulerStatus();
    if (!canProceed) return;
    
    setIsLoading(prev => ({ ...prev, upload: true }));
    
    try {
      await uploadMultipleFiles();
    } catch (error) {
      console.error("Error uploading files:", error);
      showInfoDialog("Error uploading files", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, upload: false }));
    }
  };

  // Helper function to fix URL for backend
  const fixBackendUrl = (url) => {
    // Replace React dev server port with backend port
    return url.replace("localhost:3000", "localhost:9091")
              .replace(/\\/g, "/");
  };

  const uploadMultipleFiles = async () => {
    if (!selectedInstrument || uploadFiles.length === 0) {
      showInfoDialog("Please select files to upload", "information");
      return;
    }

    setFullPageLoading(true);
    setIsLoading(prev => ({ ...prev, upload: true }));
    
    try {
      const formData = new FormData();
      const userDetails = CF_activeUserdetails();
      const activeUserDetails = userDetails?.ActiveUserDetails || {};
      
      // Add files to FormData - exactly like legacy code
      uploadFiles.forEach((file, index) => {
        formData.append(index.toString(), file.name);
        formData.append(`uploadedFile${index}`, file);
      });
      
      // Get values from session storage - exactly like legacy code
      const sSiteCode = sessionStorage.getItem("sSiteCode") || "";
      const sUserID = sessionStorage.getItem("sUserID") || "";
      
      // Extract instrument ID from sInstrumentID (format: "I1:51")
      const instrumentId = selectedInstrument.sInstrumentID.split(":")[0];
      
      // Add encrypted parameters like legacy code - backend expects CF_encrypt
      formData.append("sTaskID", CF_encrypt(selectedInstrument.sTaskID));
      formData.append("sSiteCode", sSiteCode); // Not encrypted in backend
      formData.append("sTimeZoneID", CF_encrypt(activeUserDetails.sTimeZoneID || ""));
      formData.append("sUserID", sUserID); // Not encrypted in backend
      formData.append("sInstrumentID", CF_encrypt(instrumentId));
      formData.append("sSourcePath", CF_encrypt(selectedInstrument.sTaskSourcePath));
      formData.append("sClientID", CF_encrypt(selectedInstrument.sClientID));
      
      // Build URL with tenant ID - exactly like legacy code
      const tenantID = activeUserDetails?.sTenantID || "";
      let uploadUrl = '/multipart/uploadBrowseMultipleFiles';
      
      if (tenantID !== "" && tenantID.trim() !== "") {
        uploadUrl = `${uploadUrl}${tenantID}`;
      }
      
      // Fix URL for backend
      const fullUrl = fixBackendUrl(uploadUrl);
      
      console.log('Upload URL:', fullUrl);
      
      // Make the request to backend
      const response = await fetch(fullUrl, {
        method: "POST",
        body: formData,
        // Add credentials if needed for authentication
        credentials: 'include'
      });
      
      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText.substring(0, 200));
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      // Try to parse as JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.warn('Non-JSON response:', textResponse.substring(0, 200));
        // Try to parse anyway - backend might return plain text
        try {
          const result = JSON.parse(textResponse);
          return handleUploadResponse(result);
        } catch {
          throw new Error('Server returned non-JSON response');
        }
      }
      
      const result = await response.json();
      return handleUploadResponse(result);
      
    } catch (error) {
      console.error("Error uploading files:", error);
      
      // Show user-friendly error message
      let errorMessage = "Error uploading files. Please try again.";
      if (error.message.includes('404')) {
        errorMessage = "Upload endpoint not found. Please contact administrator.";
      } else if (error.message.includes('500')) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message.includes('non-JSON')) {
        errorMessage = "Invalid server response. Please check backend logs.";
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        errorMessage = "Cannot connect to backend server. Please make sure backend is running on localhost:9091.";
      }
      
      showInfoDialog(errorMessage, "information");
    } finally {
      setFullPageLoading(false);
      setIsLoading(prev => ({ ...prev, upload: false }));
    }
  };

  const handleUploadResponse = (result) => {
    console.log('Upload response:', result);
    
    if (result.Rtn?.toLowerCase() === "success" || result.Rtn?.toLowerCase() === "partial success") {
      showInfoDialog(result.Message || "Files uploaded successfully", "success");
      
      // Update files list with new data
      if (result.InstrumentFileDetails) {
        setFiles(result.InstrumentFileDetails);
      }
      
      // Clear uploaded files
      setUploadFiles([]);
      
      // Refresh the files list
      if (selectedInstrument) {
        loadInstrumentFiles(selectedInstrument);
      }
      
    } else if (result.Rtn?.toLowerCase() === "failed") {
      showInfoDialog(result.Message || "Upload failed", "warning");
    } else {
      showInfoDialog(result.Message || "Unexpected response from server", "information");
    }
  };

  // Memoized column definitions
  const lockedInstrumentsColumns = useMemo(() => [
    {
      key: 'sInstrumentAliasName',
      label: t("label.instrument") || "Instrument",
      width: 300,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1">
          <div className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
            {row.sInstrumentAliasName}
          </div>
          <div className="text-xs text-gray-500 font-['verdana']">
            {row.sCreatedOn}
          </div>
        </div>
      )
    },
    {
      key: 'Status',
      label: t("statuses.status") || "Status",
      width: 150,
      noFilter: true,
      render: (row, isSelected) => {
        const isLocked = row.Status === "Locked";
        return (
          <div className="flex items-center justify-start">
            {isLocked ? (
              <i 
                className="fa fa-lock" 
                style={{ 
                  fontSize: '18px',           
                  color:'#3c7febff' 
                }} 
              />
            ) : (
              <i 
                className="fa fa-unlock" 
                style={{ 
                  fontSize: '20px',
                  color:'#3c7febff' 
                }} 
              />
            )}
          </div>
        );
      }
    },
    {
      key: 'sTaskSourcePath',
      label: t("instrumentlocktag.tasksourcepath") || "Task Source Path",
      width: 250,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row.sTaskSourcePath}
        </span>
      )
    },
    {
      key: 'sTemplateName',
      label: t("instrumentlocktag.template") || "Template Name",
      width: 250,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row.sTemplateName}
        </span>
      )
    }
  ], [t]);

  const filesColumns = useMemo(() => [
    {
      key: 'ActualFileName',
      label: t("instrumentlocktag.filename") || "File Name",
      width: 400,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1">
          <div className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
            {row.ActualFileName}
          </div>
          <div className="text-xs text-gray-500 font-['verdana']">
            {row["Created On"]}
          </div>
        </div>
      )
    },
    {
      key: 'Upload Status',
      label: t("instrumentlocktag.uploadstatus") || "Upload Status",
      width: 200,
      noFilter: true,
      render: (row, isSelected) => {
        const status = row["Upload Status"]?.trim();
        if (!status) return null;
        const isUploaded = status === "Uploaded";
        return (
          <div className="flex items-center justify-center">
            <i 
              className="fa fa-check" 
              style={{ 
                fontSize: '20px',
                color: isUploaded ? '#82c91e' : '#fd7e14'
              }} 
            />
          </div>
        );
      }
    },
    {
      key: 'Client Name',
      label: "Client Name",
      width: 400,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row["Client Name"]}
        </span>
      )
    }
  ], [t]);

  return (
    <div className="px-3 py-2 bg-[#ffffff] min-h-screen font-roboto relative">
      {/* Full Page Loader */}
      <FullPageLoader 
        loading={fullPageLoading} 
        text="Loading data..." 
      />
      
      {/* Error Dialog */}
      {infoDialog.open && (
        <Errordialog 
          message={infoDialog.message} 
          type={infoDialog.type} 
          onClose={closeInfoDialog} 
        />
      )}
      
      <div className="max-w-[1400px] space-y-6">
        {/* Locked Instruments - GridLayout */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-[#405f7d]">
              {t("instrumentlocktag.lockedinstrumentdetails")}
            </h3>
            <PrimaryButton 
              onClick={handleRefreshInstruments}
              iconClass="fa-refresh"
              label={t("button.refresh") || "Refresh"}
              loading={isLoading.instruments}
            />
          </div>
          <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
            <GridLayout
              columns={lockedInstrumentsColumns}
              data={lockedInstruments}
              onRowSelect={handleInstrumentSelect}
              hidePagination={false}
              height="400px"
              selectedRowId={selectedInstrument?.sTaskID}
              emptyMessage="No locked instruments available"
            />
          </div>
        </div>

        {/* File Upload Zone */}
        {showUploadZone && (
          <div>
            <FileUploadDropzone
              onFilesAdded={handleFilesAdded}
              files={uploadFiles}
              onRemoveFile={handleRemoveFile}
              onUpload={handleUpload}
              onReset={handleResetFiles}
              loading={isLoading.upload}
            />
          </div>
        )}

        {/* File Information */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-[#405f7d]">
              {t("instrumentlocktag.fileinformation")}
            </h3>
            <PrimaryButton 
              onClick={handleRefreshFiles}
              iconClass="fa-refresh"
              label={t("button.refresh") || "Refresh"}
              loading={isLoading.files}
            />
          </div>
          <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
            <GridLayout
              columns={filesColumns}
              data={files}
              onRowClick={handleFileSelect}
              hidePagination={false}
              selectedRowId={selectedFile?.Reference}
              height="400px"
              emptyMessage="No files available"
            />
          </div>
        </div>

        {/* File Tag Information */}
        {!featureStatus && (
          <div>
            <h3 className="text-xs font-bold text-[#405f7d] mb-2">
              {t("instrumentlocktag.filetagsinformation")}
            </h3>
            <InfoBox data={fileTags} />
          </div>
        )}
      </div>
    </div>
  );
}