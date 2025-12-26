import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Check } from "lucide-react";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";

/* ----------------------------------------------------
   PRIMARY BUTTON COMPONENT
---------------------------------------------------- */
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

/* ----------------------------------------------------
   INFO BOX COMPONENT
---------------------------------------------------- */
const InfoBox = ({ data }) => (
  <div className="border border-gray-300 bg-white min-h-[170px] p-4 overflow-auto">
    {data.length === 0 ? null : (
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
    )}
  </div>
);

/* ----------------------------------------------------
   MAIN PAGE
---------------------------------------------------- */
export default function OthersInstrumentsPage() {
  const { t } = useTranslation();

  const [lockedInstruments, setLockedInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTags, setFileTags] = useState([]);
  const [featureStatus, setFeatureStatus] = useState(false);

  // Memoized column definitions for locked instruments grid
  const lockedInstrumentsColumns = useMemo(() => [
    {
      key: 'sInstrumentAliasName',
      label: t("label.instrument") || "Instrument",
      width: 200,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="py-1">
          <div className={`font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
            {row.sInstrumentAliasName}
          </div>
          <div className="text-xs text-gray-500">{row.sCreatedOn}</div>
        </div>
      )
    },
    {
      key: 'sUsername',
      label: t("instrumentlocktag.lockeduser") || "Locked User",
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'text-gray-900' : 'text-gray-700'}>
          {row.sUsername}
        </span>
      )
    },
    {
      key: 'sCreatedOn',
      label: t("instrumentlocktag.LockedOn") || "Locked On",
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'text-gray-900' : 'text-gray-700'}>
          {row.sCreatedOn}
        </span>
      )
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
      label: t("instrumentlocktag.templateName") || "Template Name",
      width: 200,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'text-gray-900' : 'text-gray-700'}>
          {row.sTemplateName}
        </span>
      )
    }
  ], [t]);

  // Memoized column definitions for files grid
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
      width: 150,
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
      label: t("label.clientName") || "Client Name",
      width: 400,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'text-gray-900' : 'text-gray-700'}>
          {row["Client Name"]}
        </span>
      )
    }
  ], [t]);

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
        
        // Load locked instruments from other users
        loadOthersLockedInstruments(feature);
      }
    } catch (error) {
      console.error("Error loading template validation:", error);
    }
  };

  const loadOthersLockedInstruments = async (feature) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/LoadOtherUsersLockInstDetails", {
        sFeature: feature
      });
      
      if (response && Array.isArray(response)) {
        setLockedInstruments(response);
      }
    } catch (error) {
      console.error("Error loading others' locked instruments:", error);
    }
  };

  const handleInstrumentSelect = async (instrument) => {
    setSelectedInstrument(instrument);
    setSelectedFile(null);
    setFileTags([]);
    
    // Load files for this instrument
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
    loadTemplateValidation();
  };

  const handleRefreshFiles = () => {
    if (selectedInstrument) {
      loadInstrumentFiles(selectedInstrument);
    }
  };

  // Helper function for AJAX calls
  const makeAjaxCall = async (url, passObjDet) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ passObj: passObjDet })
      });
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      return await response.json();
    } catch (error) {
      console.error("AJAX call failed:", error);
      throw error;
    }
  };

  return (
    <div className="px-3 py-1 bg-[#ffffff] min-h-screen font-roboto">
      <div className="max-w-[1400px] space-y-6">
        {/* Locked Instrument Details */}
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

        {/* File Information */}
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