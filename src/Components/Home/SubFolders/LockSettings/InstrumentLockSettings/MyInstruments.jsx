import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Lock, Unlock, Check, Upload, X, Camera, Plus, RotateCcw } from "lucide-react";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";

// Add at the top with other imports
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption';

// Get postData from servicecall


// Unified PrimaryButton component with variant support
const PrimaryButton = ({ 
  icon: Icon, 
  label, 
  disabled, 
  onClick, 
  className = "",
  variant = "primary" // primary, secondary, danger
}) => {
  const baseClasses = "flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold rounded whitespace-nowrap hover:scale-90 transition-all";
  
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
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </button>
  );
};

const FileUploadDropzone = ({ onFilesAdded, files, onRemoveFile, onUpload, onReset }) => {
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
        <Plus className="mx-auto mb-2 text-gray-400" size={40} />
        <div className="text-gray-700 ">
          <span className="font-bold font-Helvetica Neue text-sm uppercase">{t("instrumentlocktag.dragdrop") || "Drag & Drop"}</span>
          <br />
          {t("instrumentlocktag.or") || "or"}{" "}
          <span className="text-blue-600 underline">
            {t("instrumentlocktag.clickhere") || "Click Here"}
          </span>
          {" "}{t("instrumentlocktag.tobrowseoraccesscamera") || "to browse or access camera"}
          {" "}<Camera className="inline" size={16} />
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
                  icon={X}
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
          icon={RotateCcw}
          label={t("button.reset") || "Reset"}
          variant="primary"
          className="px-4"
        />
        <PrimaryButton
          onClick={onUpload}
          disabled={files.length === 0}
          icon={Upload}
          label={t("button.upload") || "Upload"}
          variant="primary"
          className="px-4"
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

// Helper function for AJAX calls - ONLY ONE DEFINITION
const makeAjaxCall = async (url, passObjDet) => {
  try {
    // Remove leading slash if present (postData doesn't need it)
    const endpoint = url.replace(/^\//, '');
    
    const response = await postData(endpoint, passObjDet);
    
    if (!response) {
      console.error('No response from API');
      return null;
    }
    
    // Handle decryption
    if (typeof response === 'string' && response.length > 50) {
      try {
        const decrypted = CF_decrypt(response);
        return JSON.parse(decrypted);
      } catch (decryptError) {
        console.error('Failed to decrypt response:', decryptError);
        // Try to parse as plain JSON
        try {
          return JSON.parse(response);
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          return response;
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error("AJAX call failed:", error);
    throw error;
  }
};
  const [lockedInstruments, setLockedInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTags, setFileTags] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [showUploadZone, setShowUploadZone] = useState(true);
  const [featureStatus, setFeatureStatus] = useState(false);

  // Memoized column definitions
  const lockedInstrumentsColumns = useMemo(() => [
    {
      key: 'sInstrumentAliasName',
      label: t("label.instrument") || "Instrument",
      width: 300,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1">
          <div className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
            {row.sInstrumentAliasName}
          </div>
          <div className="text-xs text-gray-500">{row.sCreatedOn}</div>
        </div>
      )
    },
    {
      key: 'Status',
      label: t("instrumentlocktag.status") || "Status",
      width: 150,
      noFilter: true,
      render: (row, isSelected) => {
        const isLocked = row.Status === "Locked";
        return (
          <div className="flex items-center justify-center">
            {isLocked ? (
              <Lock className={`${isSelected ? 'text-gray-700' : 'text-gray-500'}`} size={24} />
            ) : (
              <Unlock className={`${isSelected ? 'text-gray-700' : 'text-gray-500'}`} size={24} />
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
        <span className={isSelected ? 'text-gray-900' : 'text-gray-700'}>
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
        <span className={isSelected ? 'text-gray-900' : 'text-gray-700'}>
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
          <div className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
            {row.ActualFileName}
          </div>
          <div className="text-xs text-gray-500">{row["Created On"]}</div>
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
            <Check 
              className={isUploaded ? "text-green-500" : "text-orange-500"} 
              size={20} 
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
        <span className={isSelected ? 'text-gray-900' : 'text-gray-700'}>
          {row["Client Name"]}
        </span>
      )
    }
  ], [t]);

  // Detail panel renderers
  const renderInstrumentDetail = useCallback((instrument) => (
    <div className="p-4 space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-4">
        <span className="font-bold text-gray-700">Task ID:</span>
        <span className="font-bold text-gray-900">{instrument.sTaskID}</span>
        <span className="font-bold text-gray-700">Status:</span>
        <span className={`font-bold ${instrument.Status === 'Locked' ? 'text-green-600' : 'text-orange-600'}`}>
          {instrument.Status}
        </span>
        <span className="font-bold text-gray-700">Source Path:</span>
        <span className="text-gray-900 truncate">{instrument.sTaskSourcePath}</span>
        <span className="font-bold text-gray-700">Template:</span>
        <span className="text-gray-900">{instrument.sTemplateName}</span>
      </div>
    </div>
  ), []);

  const renderFileDetail = useCallback((file) => (
    <div className="p-4 space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-4">
        <span className="font-bold text-gray-700">File Name:</span>
        <span className="font-bold text-gray-900">{file.ActualFileName}</span>
        <span className="font-bold text-gray-700">Status:</span>
        <span className={`font-bold ${file["Upload Status"] === 'Uploaded' ? 'text-green-600' : 'text-orange-600'}`}>
          {file["Upload Status"]}
        </span>
        <span className="font-bold text-gray-700">Client:</span>
        <span className="text-gray-900">{file["Client Name"]}</span>
      </div>
    </div>
  ), []);

  // Load initial data
  useEffect(() => {
    loadTemplateValidation();
  }, []);

  const loadTemplateValidation = async () => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/ValidatingTemplateTobeLoad", {});
      if (response && response.length > 0) {
        const feature = response[0]["L67Status"];
        setFeatureStatus(feature);
        loadLockedInstruments(feature);
      }
    } catch (error) {
      console.error("Error loading template validation:", error);
    }
  };

  const loadLockedInstruments = async (feature) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/LoadCurrentUsersLockInstDetails", {
        sFeature: feature
      });
      if (response && Array.isArray(response)) {
        setLockedInstruments(response);
      }
    } catch (error) {
      console.error("Error loading locked instruments:", error);
    }
  };

  const handleInstrumentSelect = async (instrument) => {
    setSelectedInstrument(instrument);
    setSelectedFile(null);
    setFileTags([]);
    
    const shouldShow = instrument.Status === "Locked" && 
                      instrument.iCommunicationType === -2 && 
                      parseInt(instrument.sParsertype) === 0;
    setShowUploadZone(shouldShow);
    
    loadInstrumentFiles(instrument);
  };

  const loadInstrumentFiles = async (instrument) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/InstrumentCaptureTagData", {
        sTaskID: instrument.sTaskID
      });
      if (response && Array.isArray(response)) {
        setFiles(response);
      }
    } catch (error) {
      console.error("Error loading instrument files:", error);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    loadFileTags(file);
  };

  const loadFileTags = async (file) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/LoadCategoryValueForFiles", {
        sRecordNo: file.Reference,
        sTaskID: file["Task ID"],
        sFileName: file["File Name"]
      });
      if (response && Array.isArray(response)) {
        const tags = response.map(item => ({
          label: item.Category,
          value: item.Value
        }));
        setFileTags(tags);
      }
    } catch (error) {
      console.error("Error loading file tags:", error);
    }
  };

  const handleRefreshInstruments = () => {
    loadLockedInstruments(featureStatus);
  };

  const handleRefreshFiles = () => {
    if (selectedInstrument) {
      loadInstrumentFiles(selectedInstrument);
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

  const handleUpload = async () => {
    if (!selectedInstrument || uploadFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }
    try {
      const schedulerResponse = await makeAjaxCall("/ftpviewdata/checkSchedulerStatus", {
        sTaskID: selectedInstrument.sTaskID
      });
      if (schedulerResponse && schedulerResponse.Message) {
        alert(schedulerResponse.Message);
        return;
      }
      await uploadMultipleFiles();
    } catch (error) {
      console.error("Error checking scheduler status:", error);
    }
  };

  const uploadMultipleFiles = async () => {
    const formData = new FormData();
    uploadFiles.forEach((file, index) => {
      formData.append(index.toString(), file.name);
      formData.append(`uploadedFile${index}`, file);
    });
    formData.append("sTaskID", selectedInstrument.sTaskID);
    formData.append("sSiteCode", sessionStorage.getItem("sSiteCode") || "");
    formData.append("sUserID", sessionStorage.getItem("sUserID") || "");
    formData.append("sInstrumentID", selectedInstrument.sInstrumentID.split(":")[0]);
    formData.append("sSourcePath", selectedInstrument.sTaskSourcePath);
    formData.append("sClientID", selectedInstrument.sClientID);

    try {
      const response = await fetch("/multipart/uploadBrowseMultipleFiles", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (result.Rtn?.toLowerCase() === "success" || result.Rtn?.toLowerCase() === "partial success") {
        alert(result.Message || "Files uploaded successfully");
        if (result.InstrumentFileDetails) {
          setFiles(result.InstrumentFileDetails);
        }
        setUploadFiles([]);
      } else {
        alert(result.Message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files");
    }
  };

  return (
    <div className="px-3 py-2 bg-[#ffffff] min-h-screen font-roboto">
      <div className="max-w-[1400px] space-y-6">
        {/* Locked Instruments - GridLayout */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-[#405f7d]">
              {t("instrumentlocktag.lockedinstrumentdetails")}
            </h3>
            <PrimaryButton 
              onClick={handleRefreshInstruments}
              icon={RefreshCw}
              label={t("instrumentlocktag.refresh") || "Refresh"}
            />
          </div>
            <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
              <GridLayout
                columns={lockedInstrumentsColumns}
                data={lockedInstruments}
                onRowSelect={handleInstrumentSelect}
                hidePagination={false}
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
            />
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-[#405f7d]">
              {t("instrumentlocktag.fileinformation")}
            </h3>
            <PrimaryButton 
              onClick={handleRefreshFiles}
              icon={RefreshCw}
              label={t("instrumentlocktag.refresh") || "Refresh"}
            />
          </div>
            <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
              <GridLayout
                columns={filesColumns}
                data={files}
                onRowClick={handleFileSelect}
                hidePagination={false}
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