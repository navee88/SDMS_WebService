// File: src/Components/Home/SubFolders/LockSettings/InstrumentLockSettings/OtherInstruments.js
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Check } from "lucide-react";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import servicecall from '../../../../../Services/servicecall';
import FullPageLoader from "../../../../Layout/Common/FullPageLoader";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { CF_decrypt, CF_encrypt } from '../../../../../Components/Common/encryptiondecryption';
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { useInstrumentLock } from '../../../../../Context/InstrumentLockContext'; // ADD THIS

/* ----------------------------------------------------
   PRIMARY BUTTON COMPONENT
---------------------------------------------------- */
const PrimaryButton = ({ 
  icon: Icon, 
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
        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#2883FE]"></div>
      ) : (
        Icon && <Icon className="w-5 h-3.5 font-bold" />
      )}
      <span>{label}</span>
    </button>
  );
};

/* ----------------------------------------------------
   INFO BOX COMPONENT
---------------------------------------------------- */
const InfoBox = ({ data }) => (
  <div className="border border-gray-300 bg-white min-h-[170px] p-4 overflow-auto">
    
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex">
            <label className="w-[45%] text-sm font-bold text-gray-800">
              {d.label}:
            </label>
            <span className="w-[45%] text-sm font-bold text-[#162ddc]">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    
  </div>
);

/* ----------------------------------------------------
   MAIN PAGE
---------------------------------------------------- */
export default function OthersInstrumentsPage() {
  const { t } = useTranslation();
  const { navigationData, clearNavigationData } = useInstrumentLock(); // ADD THIS
  const { postData } = servicecall();

  const [lockedInstruments, setLockedInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTags, setFileTags] = useState([]);
  const [featureStatus, setFeatureStatus] = useState(false);
  const [loading, setLoading] = useState({
    template: false,
    instruments: false,
    files: false,
    tags: false
  });
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: "",
    type: "information"
  });

  // Helper function for API calls
  const makeAPICall = useCallback(async (url, passObjDet) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { ...passObjDet, ...userDetailsData };
    return await postData(url, reqObj);
  }, [postData]);

  // Handle API response
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

  // Show error dialog
  const showErrorDialog = useCallback((message, type = "information") => {
    setErrorDialog({ open: true, message, type });
  }, []);

  // Close error dialog
  const closeErrorDialog = useCallback(() => {
    setErrorDialog(prev => ({ ...prev, open: false }));
  }, []);

  // Handle instrument selection
  const handleInstrumentSelect = useCallback(async (instrument) => {
    if (!instrument) return;
    
    setSelectedInstrument(instrument);
    setSelectedFile(null);
    setFileTags([]);
    setFiles([]);
    
    // Load files for this instrument
    await loadInstrumentFiles(instrument);
  }, []);

  const loadInstrumentFiles = useCallback(async (instrument) => {
    if (!instrument?.sTaskID) {
      setFiles([]);
      return;
    }
    
    setLoading(prev => ({ ...prev, files: true }));
    try {
      const response = await makeAPICall("InstrumentLock/InstrumentCaptureTagData", {
        sTaskID: instrument.sTaskID
      });
      
      const processedResponse = handleAPIResponse(response);
      
      if (processedResponse && Array.isArray(processedResponse)) {
        setFiles(processedResponse);
        // Auto-select first file if available
        if (processedResponse.length > 0) {
          await handleFileSelect(processedResponse[0]);
        }
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Error loading instrument files:", error);
      showErrorDialog("Failed to load files", "error");
      setFiles([]);
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  }, [makeAPICall, handleAPIResponse, showErrorDialog]);

  const handleFileSelect = useCallback(async (file) => {
    setSelectedFile(file);
    await loadFileTags(file);
  }, []);

  const loadFileTags = useCallback(async (file) => {
    if (!file?.Reference || !file["Task ID"] || !file["File Name"]) {
      setFileTags([]);
      return;
    }
    
    setLoading(prev => ({ ...prev, tags: true }));
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
          value: item.Value,
          CreatedBy: item.CreatedBy,
          CreatedOn: item.CreatedOn
        }));
        setFileTags(tags);
      } else {
        setFileTags([]);
      }
    } catch (error) {
      console.error("Error loading file tags:", error);
      showErrorDialog("Failed to load file tags", "error");
      setFileTags([]);
    } finally {
      setLoading(prev => ({ ...prev, tags: false }));
    }
  }, [makeAPICall, handleAPIResponse, showErrorDialog]);

  // Load initial data
  useEffect(() => {
    loadTemplateValidation();
  }, []);

  // AUTO-SELECTION: When navigation data has instrumentId, find and select it
  useEffect(() => {
    if (navigationData.autoSelectInstrument && navigationData.instrumentId) {
      console.log('OtherInstruments: Auto-selecting instrument:', navigationData.instrumentId);
      
      // Find the instrument in the locked instruments list
      const selectedInst = lockedInstruments.find(inst => 
        inst.sInstrumentID === navigationData.instrumentId ||
        inst.sTaskID === navigationData.instrumentId
      );
      
      if (selectedInst) {
        // Use setTimeout to ensure component is fully mounted
        const timer = setTimeout(() => {
          handleInstrumentSelect(selectedInst);
          // Clear navigation data after selection
          clearNavigationData();
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [navigationData, lockedInstruments, handleInstrumentSelect, clearNavigationData]);

  const loadTemplateValidation = async () => {
    setLoading(prev => ({ ...prev, template: true }));
    try {
      const response = await makeAPICall("InstrumentLock/ValidatingTemplateTobeLoad", {});
      const processedResponse = handleAPIResponse(response);
      
      if (processedResponse && processedResponse.length > 0) {
        const feature = processedResponse[0]["L67Status"];
        setFeatureStatus(feature);
        await loadOthersLockedInstruments(feature);
      }
    } catch (error) {
      console.error("Error loading template validation:", error);
      showErrorDialog("Failed to load template validation data", "error");
    } finally {
      setLoading(prev => ({ ...prev, template: false }));
    }
  };

  const loadOthersLockedInstruments = async (feature) => {
    setLoading(prev => ({ ...prev, instruments: true }));
    try {
      const response = await makeAPICall("InstrumentLock/LoadOtherUsersLockInstDetails", {
        sFeature: feature
      });
      
      const processedResponse = handleAPIResponse(response);
      
      if (processedResponse && Array.isArray(processedResponse)) {
        setLockedInstruments(processedResponse);
        // Auto-select first instrument if available
        if (processedResponse.length > 0) {
          handleInstrumentSelect(processedResponse[0]);
        }
      }
    } catch (error) {
      console.error("Error loading others' locked instruments:", error);
      showErrorDialog("Failed to load locked instruments", "error");
    } finally {
      setLoading(prev => ({ ...prev, instruments: false }));
    }
  };

  const handleRefreshInstruments = () => {
    loadTemplateValidation();
  };

  const handleRefreshFiles = () => {
    if (selectedInstrument) {
      loadInstrumentFiles(selectedInstrument);
    } else {
      showErrorDialog("Please select an instrument first", "information");
    }
  };

  const lockedInstrumentsColumns = useMemo(() => [
    {
      key: 'sInstrumentAliasName',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("label.instrument") || "Instrument"}</span>,
      width: 200,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1 font-['verdana'] text-xs">
          <div className={`${isSelected ? 'font-bold text-gray-900' : 'text-gray-800'}`}>
            {row.sInstrumentAliasName}{row.sCreatedOn}</div>
        </div>
      )
    },
    {
      key: 'sUsername',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.lockeduser") || "Locked User"}</span>,
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1 font-['verdana'] text-xs">
        <span className={isSelected ? 'font-bold text-gray-900' : 'text-gray-700'}>
          {row.sUsername}
        </span>
        </div>
      )
    },
    {
      key: 'sCreatedOn',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.LockedOn") || "Locked On"}</span>,
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1 font-['verdana'] text-xs">
        <span className={isSelected ? 'font-bold text-gray-900' : 'text-gray-700'}>
          {row.sCreatedOn}
        </span>
        </div>
      )
    },
    {
      key: 'sTaskSourcePath',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.tasksourcepath") || "Task Source Path"}</span>,
      width: 250,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1 font-['verdana'] text-xs">
        <span className={isSelected ? 'font-bold text-gray-900' : 'text-gray-700'}>
          {row.sTaskSourcePath}
        </span>
        </div>
      )
    },
    {
      key: 'sTemplateName',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.templateName") || "Template Name"}</span>,
      width: 200,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1 font-['verdana'] text-xs">
        <span className={isSelected ? 'font-bold text-gray-900' : 'text-gray-700'}>
          {row.sTemplateName}
        </span>
        </div>
      )
    }
  ], [t]);

  // Memoized column definitions for files grid
  const filesColumns = useMemo(() => [
    {
      key: 'ActualFileName',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.filename") || "File Name"}</span>,
      width: 400,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1 font-['verdana'] text-xs">
          <div className={` ${isSelected ? 'font-bold text-gray-900' : 'text-gray-800'}`}>
            {row.ActualFileName}{row["Created On"]}</div>
        </div>
      )
    },
    {
      key: 'Upload Status',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.uploadstatus") || "Upload Status"}</span>,
      width: 150,
      noFilter: true,
      render: (row) => {
        const status = row["Upload Status"]?.trim();
        if (!status) return null;
        const isUploaded = status === "Uploaded";
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
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("label.clientName") || "Client Name"}</span>,
      width: 400,
      enableSearch: true,
      render: (row, isSelected) => (
      <div className="py-1 font-['verdana'] text-xs">
        <span className={isSelected ? 'font-bold text-gray-900' : 'text-gray-700'}>
          {row["Client Name"]}
        </span>
        </div>
      )
    }
  ], [t]);

  // Determine if loading
  const isPageLoading = loading.template || loading.instruments || loading.files;

  return (
    <div className="px-3 py-1 bg-[#ffffff] min-h-screen font-roboto">
      {errorDialog.open && (
        <Errordialog 
          message={errorDialog.message} 
          type={errorDialog.type} 
          onClose={closeErrorDialog} 
        />
      )}
      
      <FullPageLoader loading={isPageLoading} text="Loading data..." />
      
      <div className="max-w-[1400px] space-y-6">
        {/* Locked Instrument Details */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-[#405f7d]">
              {t("instrumentlocktag.lockedinstrumentdetails")}
            </h3>
            <PrimaryButton className="mt-2"
              onClick={handleRefreshInstruments}
              icon={RefreshCw}
              label={t("button.refresh") || "Refresh"}
              loading={loading.instruments}
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
              emptyMessage="No locked instruments from other users"
            />
          </div>
        </div>

        {/* File Information */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-[#405f7d]">
              {t("instrumentlocktag.fileinformation")}
            </h3>
            <PrimaryButton 
              onClick={handleRefreshFiles}
              icon={RefreshCw}
              label={t("button.refresh") || "Refresh"}
              loading={loading.files}
              disabled={!selectedInstrument}
            />
          </div>

          <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
            <GridLayout
              columns={filesColumns}
              data={files}
              onRowClick={handleFileSelect}
              hidePagination={false}
              height="400px"
              selectedRowId={selectedFile?.Reference}
              emptyMessage={selectedInstrument ? "No files available" : "Select an instrument to view files"}
            />
          </div>
        </div>

        {/* File Tag Information */}
        {!featureStatus && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-[#405f7d]">
                {t("instrumentlocktag.filetagsinformation")}
              </h3>
              
            </div>
            <InfoBox data={fileTags} />
          </div>
        )}
      </div>
    </div>
  );
}