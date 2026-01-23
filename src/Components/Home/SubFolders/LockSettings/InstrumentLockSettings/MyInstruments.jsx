// File: src/Components/Home/SubFolders/LockSettings/InstrumentLockSettings/MyInstrumentsPage.js
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { CF_decrypt, CF_encrypt } from '../../../../../Components/Common/encryptiondecryption';
import FullPageLoader from "../../../../Layout/Common/FullPageLoader";
import Errordialog from "../../../../Layout/Common/Errordialog";

// ============================================
// OPTIMIZED HELPER FUNCTIONS
// ============================================

const CF_sessionGet = (key) => sessionStorage.getItem(key);
const CF_DomainReturnServer = () => 'http://localhost:9091/SDMS_WebService';
const CF_Oauth2ReturnServer = () => {
  try {
    const config = localStorage.getItem('oauth2Config');
    return config ? JSON.parse(config) : { oauth2enable: false };
  } catch {
    return { oauth2enable: false };
  }
};
const StatusMessage = {
  SUCCESS: 'success',
  PARTIAL_SUCCESS: 'partial success',
  FAILED: 'failed',
  RECORD_NOT_SELECTED: 'Please select a record first.',
  RowsHeight: 40
};

// ============================================
// OPTIMIZED UI COMPONENTS
// ============================================

const PrimaryButton = React.memo(({ 
  iconClass, label, disabled, onClick, className = "", variant = "primary", loading = false 
}) => {
  const variantClasses = useMemo(() => ({
    primary: disabled 
      ? "bg-slate-100 text-slate-300 cursor-not-allowed" 
      : "bg-[#f1f5f9] text-[#2883FE] hover:bg-[#E6F0FF]",
    secondary: disabled
      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: disabled
      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
      : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
  }), [disabled]);

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold rounded whitespace-nowrap hover:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {loading ? <i className="fa fa-refresh w-3.5 h-3.5 animate-spin" /> : 
       iconClass && <i className={`fa ${iconClass} w-3.5 h-3.5`} />}
      <span>{label}</span>
    </button>
  );
});

const FileUploadDropzone = React.memo(({ onFilesAdded, files, onRemoveFile, onUpload, onReset, loading = false }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFilesAdded(droppedFiles);
  }, [onFilesAdded]);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    onFilesAdded(selectedFiles);
    e.target.value = '';
  }, [onFilesAdded]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="border border-gray-300 bg-white p-4">
      <div
        className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-8 text-center cursor-pointer transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept="*/*" />   
        <i className="fa fa-plus-circle mx-auto mb-2 text-gray-400" style={{ fontSize: '2.5em' }} />
        <div className="text-gray-400 text-[14px]">
          <span className="font-bold font-['Helvetica'] text-[#505f79a8] text-sm uppercase">
            {t("instrumentlocktag.dragdrop") || "Drag & Drop"}
          </span>
          <br />
          {t("instrumentlocktag.or") || "or"}{" "}
          <span className="text-blue-600 ">{t("instrumentlocktag.clickhere") || "Click Here"}</span>
          {" "}{t("instrumentlocktag.tobrowseoraccesscamera") || "to browse or access camera"}
          {" "}<i className="fa fa-camera inline ml-1 text-sm" />
          {" "}{t("instrumentlocktag.toaddfile") || "to add file"}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold text-gray-700 mb-2">Selected Files ({files.length})</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}-${file.size}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <PrimaryButton onClick={onReset} label={t("button.reset") || "Reset"} variant="primary" className="px-3" />
        <PrimaryButton onClick={onUpload} iconClass="fa-upload" label={t("button.upload") || "Upload"} 
          variant="primary" className="px-3" loading={loading} />
      </div>
    </div>
  );
});

const InfoBox = React.memo(({ data }) => (
  data.length === 0 ? null : (
    <div className="border border-gray-300 bg-white min-h-[170px] p-4 overflow-auto">
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex">
            <label className="w-[45%] text-xs font-bold text-gray-800">{d.label}:</label>
            <span className="w-[45%] text-xs font-bold text-[#162ddc]">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
));

// ============================================
// MAIN COMPONENT - OPTIMIZED WITH AUTO-SELECTION
// ============================================

export default function MyInstrumentsPage() {
  const { t } = useTranslation();
  const { postData } = servicecall();
  const abortControllerRef = useRef(null);

  // State management
  const [lockedInstruments, setLockedInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTags, setFileTags] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [featureStatus, setFeatureStatus] = useState(false);
  
  // Loading states
  const [fullPageLoading, setFullPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState({
    template: false, instruments: false, files: false, fileTags: false, upload: false
  });
  
  const [infoDialog, setInfoDialog] = useState({
    open: false, message: "", type: "information"
  });

  // Initialize abort controller
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => abortControllerRef.current?.abort();
  }, []);

  // Dialog functions
  const showInfoDialog = useCallback((message, type = "information") => {
    setInfoDialog({ open: true, message, type });
  }, []);

  const closeInfoDialog = useCallback(() => {
    setInfoDialog(prev => ({ ...prev, open: false }));
  }, []);

  // Optimized API call
  const makeAPICall = useCallback(async (url, passObjDet) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { ...passObjDet, ...userDetailsData };
    return await postData(url, reqObj, { signal: abortControllerRef.current.signal });
  }, [postData]);

  // Optimized response handler
  const handleAPIResponse = useCallback((response) => {
    if (!response) return null;
    try {
      if (typeof response === 'string' && response.length > 50) {
        try {
          return JSON.parse(CF_decrypt(response));
        } catch {
          return JSON.parse(response);
        }
      } else if (typeof response === 'object') {
        return response;
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Response parsing error:', error);
      return response;
    }
  }, []);

  // Load file tags
  const loadFileTags = useCallback(async (file) => {
    if (!file?.Reference) {
      setFileTags([]);
      return;
    }
    
    setIsLoading(prev => ({ ...prev, fileTags: true }));
    try {
      const response = await makeAPICall("InstrumentLock/LoadCategoryValueForFiles", {
        sRecordNo: file.Reference,
        sTaskID: file["Task ID"],
        sFileName: file["File Name"]
      });
      
      const processedResponse = handleAPIResponse(response);
      if (Array.isArray(processedResponse)) {
        setFileTags(processedResponse.map(item => ({ label: item.Category, value: item.Value })));
      } else {
        setFileTags([]);
      }
    } catch (error) {
      console.error("Error loading file tags:", error);
      setFileTags([]);
    } finally {
      setIsLoading(prev => ({ ...prev, fileTags: false }));
    }
  }, [makeAPICall, handleAPIResponse]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file) => {
    setSelectedFile(file);
    await loadFileTags(file);
  }, [loadFileTags]);

  // Load instrument files with auto-selection of first file
  const loadInstrumentFiles = useCallback(async (instrument) => {
    if (!instrument?.sTaskID) {
      setFiles([]);
      setSelectedFile(null);
      setFileTags([]);
      return;
    }
    
    setIsLoading(prev => ({ ...prev, files: true }));
    
    try {
      const response = await makeAPICall("InstrumentLock/InstrumentCaptureTagData", {
        sTaskID: instrument.sTaskID
      });
      
      const processedResponse = handleAPIResponse(response);
      
      if (Array.isArray(processedResponse) && processedResponse.length > 0) {
        setFiles(processedResponse);
        // AUTO-SELECT FIRST FILE AND LOAD ITS TAGS
        const firstFile = processedResponse[0];
        setSelectedFile(firstFile);
        await loadFileTags(firstFile);
      } else {
        setFiles([]);
        setSelectedFile(null);
        setFileTags([]);
      }
    } catch (error) {
      console.error("Error loading instrument files:", error);
      showInfoDialog("Failed to load files", "information");
      setFiles([]);
      setSelectedFile(null);
      setFileTags([]);
    } finally {
      setIsLoading(prev => ({ ...prev, files: false }));
    }
  }, [makeAPICall, handleAPIResponse, showInfoDialog, loadFileTags]);

  // Handle instrument selection
  const handleInstrumentSelect = useCallback(async (instrument) => {
    if (!instrument) return;
    
    setSelectedInstrument(instrument);
    setSelectedFile(null);
    setFileTags([]);
    setFiles([]);
    setUploadFiles([]);
    
    const shouldShow = instrument.Status === "Locked" && 
                      parseInt(instrument.iCommunicationType) === -2 &&
                      parseInt(instrument.sParsertype) === 0;
    
    setShowUploadZone(shouldShow);
    
    // Load instrument files (auto-selects first file)
    await loadInstrumentFiles(instrument);
  }, [loadInstrumentFiles]);

  // Upload function with retry logic
  const uploadFormData = useCallback(async (formData) => {
    const userDetails = CF_activeUserdetails();
    const tenantID = userDetails?.ActiveUserDetails?.sTenantID || "";
    
    const uploadUrl = tenantID && tenantID.trim() !== "" 
      ? `http://localhost:9091/SDMS_WebService/multipart/uploadBrowseMultipleFiles${tenantID}`
      : `http://localhost:9091/SDMS_WebService/multipart/uploadBrowseMultipleFiles`;
    
    // Prepare headers
    const headers = {};
    const oauthConfig = CF_Oauth2ReturnServer();
    if (oauthConfig.oauth2enable === true) {
      const token = localStorage.getItem('token');
      if (token) headers["Authorization"] = token;
    }
    
    // Retry logic (3 attempts)
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
          headers,
          signal: abortControllerRef.current.signal,
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        
        // Check for HTML error pages
        if (responseText.trim().startsWith('<!DOCTYPE') || 
            responseText.trim().startsWith('<html') ||
            response.headers.get('content-type')?.includes('text/html')) {
          throw new Error('Server returned HTML error page');
        }
        
        try {
          return JSON.parse(responseText);
        } catch {
          const decrypted = CF_decrypt(responseText);
          return JSON.parse(decrypted);
        }
        
      } catch (error) {
        lastError = error;
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
      }
    }
    
    throw lastError || new Error('Upload failed after 3 attempts');
  }, []);

  // Load initial data
  useEffect(() => {
    loadTemplateValidation();
  }, []);

  const loadTemplateValidation = useCallback(async () => {
    setFullPageLoading(true);
    setIsLoading(prev => ({ ...prev, template: true }));
    
    try {
      const response = await makeAPICall("InstrumentLock/ValidatingTemplateTobeLoad", {});
      const processedResponse = handleAPIResponse(response);
      
      if (processedResponse?.[0]?.["L67Status"] !== undefined) {
        const feature = processedResponse[0]["L67Status"];
        setFeatureStatus(feature);
        await loadLockedInstruments(feature);
      } else {
        showInfoDialog("No instruments found", "information");
      }
    } catch (error) {
      console.error("Error loading template validation:", error);
      showInfoDialog("Failed to load template validation", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, template: false }));
      setFullPageLoading(false);
    }
  }, [makeAPICall, handleAPIResponse, showInfoDialog]);

  const loadLockedInstruments = useCallback(async (feature) => {
    setIsLoading(prev => ({ ...prev, instruments: true }));
    
    try {
      const response = await makeAPICall("InstrumentLock/LoadCurrentUsersLockInstDetails", {
        sFeature: feature
      });
      
      const processedResponse = handleAPIResponse(response);
      
      if (Array.isArray(processedResponse) && processedResponse.length > 0) {
        setLockedInstruments(processedResponse);
        // Auto-select first instrument
        handleInstrumentSelect(processedResponse[0]);
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
  }, [makeAPICall, handleAPIResponse, showInfoDialog, handleInstrumentSelect]);

  // Event handlers
  const handleRefreshInstruments = useCallback(() => {
    loadLockedInstruments(featureStatus);
  }, [featureStatus, loadLockedInstruments]);

  const handleRefreshFiles = useCallback(() => {
    selectedInstrument ? loadInstrumentFiles(selectedInstrument) : 
      showInfoDialog("Please select an instrument first", "information");
  }, [selectedInstrument, loadInstrumentFiles, showInfoDialog]);

  const handleFilesAdded = useCallback((newFiles) => {
    const existingKeys = new Set(uploadFiles.map(f => `${f.name}-${f.lastModified}-${f.size}`));
    const uniqueNewFiles = newFiles.filter(file => {
      const key = `${file.name}-${file.lastModified}-${file.size}`;
      return !existingKeys.has(key);
    });
    
    if (uniqueNewFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...uniqueNewFiles]);
    }
  }, [uploadFiles]);

  const handleRemoveFile = useCallback((index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleResetFiles = useCallback(() => {
    setUploadFiles([]);
  }, []);

  const checkSchedulerStatus = useCallback(async () => {
    if (!selectedInstrument) {
      showInfoDialog(StatusMessage.RECORD_NOT_SELECTED, "information");
      return false;
    }

    if (uploadFiles.length === 0) {
      showInfoDialog("Please select files to upload", "information");
      return false;
    }

    try {
      const response = await makeAPICall("ftpviewdata/checkSchedulerStatus", {
        sTaskID: selectedInstrument.sTaskID
      });
      
      const processedResponse = handleAPIResponse(response);
      if (processedResponse?.Message) {
        showInfoDialog(processedResponse.Message, "warning");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking scheduler:", error);
      return false;
    }
  }, [selectedInstrument, uploadFiles, makeAPICall, handleAPIResponse, showInfoDialog]);

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async () => {
    if (!selectedInstrument) {
      showInfoDialog(StatusMessage.RECORD_NOT_SELECTED, "information");
      return;
    }

    if (uploadFiles.length === 0) {
      showInfoDialog("Please select files to upload", "information");
      return;
    }

    const formData = new FormData();
    const activeUserDetails = CF_activeUserdetails();
    
    // Add files
    uploadFiles.forEach((file, index) => {
      formData.append(index.toString(), file.name);
      formData.append('uploadedFile' + index, file);
    });
    
    // Add metadata
    const addEncryptedField = (key, value) => {
      if (value) formData.append(key, CF_encrypt(value));
    };
    
    addEncryptedField("sTaskID", selectedInstrument.sTaskID);
    addEncryptedField("sTimeZoneID", activeUserDetails?.ActiveUserDetails?.sTimeZoneID);
    
    const instrumentId = selectedInstrument.sInstrumentID.includes(':') 
      ? selectedInstrument.sInstrumentID.split(":")[0] 
      : selectedInstrument.sInstrumentID;
    addEncryptedField("sInstrumentID", instrumentId);
    
    addEncryptedField("sSourcePath", selectedInstrument.sTaskSourcePath);
    addEncryptedField("sClientID", selectedInstrument.sClientID);
    
    formData.append("sSiteCode", CF_sessionGet("sSiteCode") || "");
    formData.append("sUserID", CF_sessionGet("sUserID") || "");
    
    try {
      const result = await uploadFormData(formData);
      const rtnStatus = result.Rtn?.toLowerCase();
      
      if (rtnStatus === StatusMessage.SUCCESS || rtnStatus === StatusMessage.PARTIAL_SUCCESS) {
        showInfoDialog(result.Message || "Upload successful", "success");
        setUploadFiles([]);
        
        // Refresh files immediately
        setTimeout(() => {
          if (selectedInstrument) loadInstrumentFiles(selectedInstrument);
        }, 1000);
        
        if (result.InstrumentFileDetails && Array.isArray(result.InstrumentFileDetails)) {
          setFiles(prev => [...result.InstrumentFileDetails, ...prev]);
        }
        
      } else {
        showInfoDialog(result.Message || "Upload failed", "warning");
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Upload failed";
      if (error.message.includes('HTML')) errorMessage = "Server error - check backend logs";
      else if (error.message.includes('Failed to fetch')) errorMessage = "Cannot connect to server";
      else if (error.message.includes('Upload failed after')) errorMessage = "Upload failed after multiple attempts";
      
      throw new Error(errorMessage);
    }
  }, [selectedInstrument, uploadFiles, uploadFormData, showInfoDialog, loadInstrumentFiles]);

  const handleUpload = useCallback(async () => {
    if (!(await checkSchedulerStatus())) return;
    
    setIsLoading(prev => ({ ...prev, upload: true }));
    setFullPageLoading(true);
    
    try {
      await uploadMultipleFiles();
    } catch (error) {
      console.error("Error uploading files:", error);
      showInfoDialog(error.message || "Error uploading files", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, upload: false }));
      setFullPageLoading(false);
    }
  }, [checkSchedulerStatus, uploadMultipleFiles, showInfoDialog]);

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
      render: (row) => (
        <div className="flex items-center justify-start">
          <i className={`fa ${row.Status === "Locked" ? "fa-lock" : "fa-unlock"}`} 
             style={{ fontSize: '18px', color:'#3c7febff' }} />
        </div>
      )
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
      render: (row) => {
        const status = row["Upload Status"]?.trim();
        if (!status) return null;
        return (
          <div className="flex items-center justify-left">
            <i className="fa fa-check" style={{ 
              fontSize: '16px',
              color: status === "Uploaded" ? '#82c91e' : '#fd7e14'
            }} />
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
      <FullPageLoader loading={fullPageLoading} text="Loading data..." />
      
      {infoDialog.open && (
        <Errordialog message={infoDialog.message} type={infoDialog.type} onClose={closeInfoDialog} />
      )}
      
      <div className="max-w-[1400px] space-y-6">
        {/* Locked Instruments */}
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
              onRowClick={handleInstrumentSelect}
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

        {/* File Information - First row auto-selected */}
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

// Export helper functions
export {
  CF_sessionGet,
  CF_DomainReturnServer,
  CF_Oauth2ReturnServer,
  StatusMessage
};