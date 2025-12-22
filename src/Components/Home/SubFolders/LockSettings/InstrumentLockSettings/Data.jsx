import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, FileText } from "lucide-react";
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../Layout/Common/Errordialog";

const InfoBox = ({ data }) => (
  <div className="border border-gray-300 bg-white min-h-[100px] p-4 ">
    {data.length === 0 ? null : (
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex">
            <label className="w-[45%] text-sm font-bold text-gray-800">
              {d.Category || d.label}:
            </label>
            <span className="w-[45%] text-sm font-bold text-[#162ddc]">
              {d.Value || d.value}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const FileViewer = ({ src, fileType, supportedExtensions }) => {
  const isSupported = supportedExtensions.includes(fileType?.toLowerCase());
  
  return (
    <div className="border border-gray-300 bg-white min-h-[200px] ">
      {src && isSupported ? (
        <iframe
          src={`${src}#toolbar=0&navpanes=0`}
          className="w-full h-[200px] border-none "
          title="File Viewer"
        />
      ) : src && !isSupported ? (
        <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
          <div className="text-center">
            <h2 className="text-lg">File format not supported for preview</h2>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const PrimaryButton = ({ icon: Icon, label, disabled, onClick, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold rounded whitespace-nowrap
      hover:scale-90 transition-all
      ${disabled
        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
        : "bg-[#f1f5f9] text-[#2883FE] hover:bg-[#E6F0FF]"
      }
      ${className}
    `}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    <span>{label}</span>
  </button>
);

export default function InstrumentDataPage() {
  const { t } = useTranslation();

  const [instrument, setInstrument] = useState("");
  const [tab, setTab] = useState("merge");
  const [instruments, setInstruments] = useState([]);
  
  const [instrumentTags, setInstrumentTags] = useState([]);
  const [mergeRows, setMergeRows] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileTags, setFileTags] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [mergeFileRawData, setMergeFileRawData] = useState([]);
  const [nullDataRows, setNullDataRows] = useState([]);
  
  const [fileViewerSrc, setFileViewerSrc] = useState("");
  const [fileViewerType, setFileViewerType] = useState("");
  const [supportedExtensions, setSupportedExtensions] = useState([]);
  
  const [oldRawDataID, setOldRawDataID] = useState(" ");
  const [newRawDataID, setNewRawDataID] = useState("");
  
  const refreshTimerRef = useRef(null);
  const [selectedNullRow, setSelectedNullRow] = useState(null);
  
  // Add state for information dialog
  const [infoDialog, setInfoDialog] = useState({
    open: false,
    message: "",
    type: "information" // Default type is "information" for blue color
  });

  // Function to show information dialog
  const showInfoDialog = useCallback((message, type = "information") => {
    setInfoDialog({
      open: true,
      message,
      type
    });
  }, []);

  // Function to close information dialog
  const closeInfoDialog = useCallback(() => {
    setInfoDialog(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  // Load initial data
  useEffect(() => {
    loadTemplateValidation();
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Handle instrument change
  useEffect(() => {
    if (instrument) {
      handleInstrumentChange();
    }
  }, [instrument]);

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

  const loadTemplateValidation = async () => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/ValidatingTemplateTobeLoad", {});
      
      if (response && response.length > 0) {
        const featureStatus = response[0]["L67Status"];
        
        if (response[1] && response[1]["sFileExtensionList"]) {
          setSupportedExtensions(response[1]["sFileExtensionList"].split(","));
        }
        
        loadInstruments(featureStatus);
      }
    } catch (error) {
      console.error("Error loading template validation:", error);
    }
  };

  const loadInstruments = async (featureStatus) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/LoadInterfaceLockInstrumentNameCombo", {
        sFeature: featureStatus
      });
      
      if (response && Array.isArray(response)) {
        setInstruments(response);
      }
    } catch (error) {
      console.error("Error loading instruments:", error);
      showInfoDialog("Failed to load instruments", "information");
    }
  };

  const handleInstrumentChange = async () => {
    if (!instrument) return;
    
    setFileViewerSrc("");
    setFileTags([]);
    setParsedData([]);
    
    const selectedInstrument = instruments.find(inst => inst.nInterInstrumentID === parseInt(instrument));
    
    if (selectedInstrument) {
      loadInstrumentTags(selectedInstrument);
      loadLatestMergedFiles(selectedInstrument);
      loadFileInformation(selectedInstrument);
      checkMergeCount(selectedInstrument);
    }
  };

  const loadInstrumentTags = async (selectedInstrument) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/CurrentLockInstrumentTagInfo", {
        sInstrumentID: selectedInstrument.sInstrumentID,
        sSiteCode: sessionStorage.getItem("sSiteCode")
      });
      
      if (response && Array.isArray(response)) {
        setInstrumentTags(response);
      }
    } catch (error) {
      console.error("Error loading instrument tags:", error);
      showInfoDialog("Failed to load instrument tags", "information");
    }
  };

  const loadLatestMergedFiles = async (selectedInstrument) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/LoadMergeFileDetails", {
        sInstrumentID: selectedInstrument.sInstrumentID,
        sLockID: selectedInstrument.sLockID
      });
      
      if (response && Array.isArray(response)) {
        const dataWithIds = response.map((item, index) => ({ ...item, id: item.sRawDataID || index + 1 }));
        setMergeRows(dataWithIds);
      }
    } catch (error) {
      console.error("Error loading merged files:", error);
      showInfoDialog("Failed to load merged files", "information");
    }
  };

  const loadFileInformation = async (selectedInstrument) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/InstrumentCaptureTagData", {
        sInstrumentID: selectedInstrument.sInstrumentID,
        sTaskID: selectedInstrument.sTaskID
      });
      
      if (response && Array.isArray(response)) {
        const dataWithIds = response.map((item, index) => ({ ...item, id: item.Reference || index + 1 }));
        setFiles(dataWithIds);
      }
    } catch (error) {
      console.error("Error loading file information:", error);
      showInfoDialog("Failed to load file information", "information");
    }
  };

  const checkMergeCount = async (selectedInstrument) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/MergeCountForAutoRefresh", {
        nInterfaceInstID: selectedInstrument.nInterInstrumentID
      });
      
      if (response && response.MergeCount > 1) {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
        
        refreshTimerRef.current = setInterval(() => {
          loadLatestMergedFiles(selectedInstrument);
        }, 1000);
      }
    } catch (error) {
      console.error("Error checking merge count:", error);
      showInfoDialog("Failed to check merge count", "information");
    }
  };

  const loadFileTags = async (file) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/LoadCategoryValueForFiles", {
        sRecordNo: file.Reference,
        sTaskID: file["Task ID"],
        sFileName: file["File Name"]
      });
      
      if (response && Array.isArray(response)) {
        setFileTags(response);
      }
    } catch (error) {
      console.error("Error loading file tags:", error);
      showInfoDialog("Failed to load file tags", "information");
    }
  };

  const loadParsedData = async (file) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/getParsedDataDetails", {
        sRecordNo: file.Reference,
        sTaskID: file["Task ID"],
        sFileName: file["File Name"]
      });
      
      if (response && Array.isArray(response)) {
        const parsed = response.map(item => {
          let fieldName = item.FieldName.split("]");
          if (fieldName && fieldName.length > 0) {
            fieldName = fieldName[1];
          }
          return {
            Category: fieldName,
            Value: item.FieldValue
          };
        });
        setParsedData(parsed);
      }
    } catch (error) {
      console.error("Error loading parsed data:", error);
      showInfoDialog("Failed to load parsed data", "information");
    }
  };

  const loadFileViewer = async (file) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/InterFaceInstrumentFileDownLoad", {
        sRecordNo: file.Reference,
        sTaskID: file["Task ID"],
        sUploadStatus: file["Upload Status"]?.trim(),
        sBrowserURL: window.location.origin
      });
      
      if (response && response.Rtn?.toLowerCase() === "success") {
        const urlPath = response.ServerDataViewURL;
        const fileExtension = urlPath.split(".").pop();
        setFileViewerType(fileExtension);
        setFileViewerSrc(urlPath);
      } else if (response && response.Rtn?.toLowerCase() === "failed") {
        // Replace alert with information dialog
        showInfoDialog(response.Message || "Failed to load file", "information");
        setFileViewerSrc("");
      }
    } catch (error) {
      console.error("Error loading file viewer:", error);
      showInfoDialog("Failed to load file viewer", "information");
    }
  };

  const loadNullData = async () => {
    const selectedInstrument = instruments.find(inst => inst.nInterInstrumentID === parseInt(instrument));
    
    if (!selectedInstrument) {
      // Replace alert with information dialog
      showInfoDialog(t("instrumentlocktag.noinstrumentsfound") || "No Instruments Found", "information");
      return;
    }
    
    try {
      const response = await makeAjaxCall("/InstrumentLock/FetchNullDataBasedOnInstrument", {
        nInterfaceInstID: selectedInstrument.nInterInstrumentID,
        sLockID: selectedInstrument.sLockID
      });
      
      if (response && Array.isArray(response)) {
        const dataWithIds = response.map((item, index) => ({ ...item, id: item.sRawDataID || index + 1 }));
        setNullDataRows(dataWithIds);
      }
    } catch (error) {
      console.error("Error loading null data:", error);
      showInfoDialog("Failed to load null data", "information");
    }
  };

  const handleNullDataAcknowledgement = async () => {
    if (!selectedNullRow) {
      // Replace alert with information dialog
      showInfoDialog(t("instrumentlocktag.norecordsfound") || "No Records Found", "information");
      return;
    }
    
    try {
      const response = await makeAjaxCall("/InstrumentLock/NullDataAcknowledgement", {
        nInterfaceInstID: selectedNullRow.nInstrumentID,
        sRawData: selectedNullRow.sRawDataID,
        sLockID: selectedNullRow.sLockID
      });
      
      if (response) {
        loadNullData();
        // Show success message for acknowledgement
        showInfoDialog("Null data acknowledged successfully", "success");
      }
    } catch (error) {
      console.error("Error acknowledging null data:", error);
      showInfoDialog("Failed to acknowledge null data", "information");
    }
  };

  const handleRefreshLatestFiles = () => {
    const selectedInstrument = instruments.find(inst => inst.nInterInstrumentID === parseInt(instrument));
    if (selectedInstrument) {
      loadLatestMergedFiles(selectedInstrument);
      setMergeFileRawData([]);
    }
  };

  const handleRefreshFileInfo = () => {
    const selectedInstrument = instruments.find(inst => inst.nInterInstrumentID === parseInt(instrument));
    if (selectedInstrument) {
      loadFileInformation(selectedInstrument);
    }
  };

  const handleRefreshNullData = () => {
    loadNullData();
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === "null") {
      loadNullData();
    }
  };

  const handleInstrumentDropdownChange = (e) => {
    setInstrument(e.target.value);
  };

  // Column definitions for GridLayout
  const mergeColumns = useMemo(() => [
    {
      key: 'sRawDataID',
      label: t("instrumentlocktag.rawdataid") || 'Raw Data ID',
      width: 250,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
          {row.sRawDataID}
        </span>
      )
    },
    {
      key: 'nSequenceNo',
      label: t("instrumentlocktag.sequenceno") || 'Sequence No',
      width: 200,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'font-bold' : ''}>{row.nSequenceNo}</span>
      )
    },
    {
      key: 'nMergeFileCount',
      label: t("instrumentlocktag.mergefilecount") || 'Merge File Count',
      width: 200,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'font-bold' : ''}>{row.nMergeFileCount}</span>
      )
    }
  ], [t]);

  const nullDataColumns = useMemo(() => [
    {
      key: 'sRawDataID',
      label: t("instrumentlocktag.rawdataid") || 'Raw Data ID',
      width: 180,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
          {row.sRawDataID}
        </span>
      )
    },
    {
      key: 'nSequenceNo',
      label: t("instrumentlocktag.sequenceno") || 'Sequence No',
      width: 130,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'font-bold' : ''}>{row.nSequenceNo}</span>
      )
    },
    {
      key: 'nMergeFileCount',
      label: t("instrumentlocktag.mergefilecount") || 'Merge File Count',
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'font-bold' : ''}>{row.nMergeFileCount}</span>
      )
    },
    {
      key: 'sLockID',
      label: t("instrumentlocktag.lockid") || 'Lock ID',
      width: 180,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'font-bold' : ''}>{row.sLockID}</span>
      )
    },
    {
      key: 'nInstrumentID',
      label: t("instrumentlocktag.instrumentid") || 'Instrument ID',
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'font-bold' : ''}>{row.nInstrumentID}</span>
      )
    }
  ], [t]);

  const fileColumns = useMemo(() => [
    {
      key: 'File Name',
      label: t("instrumentlocktag.filename") || 'File Name',
      width: 300,
      enableSearch: true,
      render: (row, isSelected) => {
        const fileName = row["File Name"] || "";
        const createdOn = row["Created On"] || "";
        return (
          <div>
            <div className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{fileName}</div>
            {createdOn && <div className="text-xs text-gray-500">{createdOn}</div>}
          </div>
        );
      }
    },
    {
      key: 'Upload Status',
      label: t("instrumentlocktag.uploadstatus") || 'Upload Status',
      width: 200,
      render: (row) => {
        const status = row["Upload Status"]?.trim() || "";
        return (
          <span className={`inline-block px-2 py-1 text-xs font-semibold ${
            status.toLowerCase() === "success" ? "bg-green-100 text-green-800" :
            status.toLowerCase() === "failed" ? "bg-red-100 text-red-800" :
            "bg-yellow-100 text-yellow-800"
          }`}>
            {status}
          </span>
        );
      }
    },
    {
      key: 'Client Name',
      label: t("label.clientName") || 'Client Name',
      width: 250,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={isSelected ? 'font-bold' : ''}>{row["Client Name"]}</span>
      )
    }
  ], [t]);

  const MergeDetailPanel = ({ merge }) => {
    useEffect(() => {
      if (merge) {
        setNewRawDataID(merge.sRawDataID);
        
        const loadMergeData = async () => {
          try {
            const response = await makeAjaxCall("/InstrumentLock/MergeFileDatas", {
              nRawData: merge.sRawDataID,
              LockID: merge.sLockID,
              nSequenceNo: merge.nSequenceNo,
              nMergeFileCount: merge.nMergeFileCount,
              nInstrumentID: merge.nInstrumentID
            });
            
            if (response) {
              if (response.NullDataStatus === "Created") {
                setMergeFileRawData([]);
                if (response.CreatedList) {
                  // Replace alert with information dialog
                  showInfoDialog(response.CreatedList + " " + response.Message, "information");
                }
              } else {
                if (oldRawDataID === merge.sRawDataID || oldRawDataID === " ") {
                  setOldRawDataID(merge.sRawDataID);
                  if (response.MergeData && Array.isArray(response.MergeData)) {
                    setMergeFileRawData(response.MergeData);
                  }
                } else {
                  setOldRawDataID(merge.sRawDataID);
                  setMergeFileRawData(response.MergeData || []);
                }
              }
            }
          } catch (error) {
            console.error("Error loading merge file data:", error);
            showInfoDialog("Failed to load merge file data", "information");
          }
        };
        
        loadMergeData();
      }
    }, [merge]);

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.rawdataid")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{merge.sRawDataID}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.sequenceno")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{merge.nSequenceNo}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.mergefilecount")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{merge.nMergeFileCount}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.lockid")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{merge.sLockID}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.instrumentid")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{merge.nInstrumentID}</div>
        </div>
      </div>
    );
  };

  const NullDetailPanel = ({ nullRow }) => {
    useEffect(() => {
      if (nullRow) {
        setSelectedNullRow(nullRow);
      }
    }, [nullRow]);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.rawdataid")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{nullRow.sRawDataID}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.sequenceno")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{nullRow.nSequenceNo}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.mergefilecount")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{nullRow.nMergeFileCount}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.lockid")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{nullRow.sLockID}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.instrumentid")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{nullRow.nInstrumentID}</div>
        </div>
      </div>
    );
  };
  
  const FileDetailPanel = ({ file }) => {
    useEffect(() => {
      if (file) {
        loadFileViewer(file);
        loadFileTags(file);
        loadParsedData(file);
      }
    }, [file]);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.filename")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{file["File Name"]}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.uploadstatus")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{file["Upload Status"]}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.clientname")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{file["Client Name"]}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">{t("instrumentlocktag.createdon")}</div>
          <div className="col-span-2 text-gray-800 font-medium">{file["Created On"]}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">Reference</div>
          <div className="col-span-2 text-gray-800 font-medium">{file.Reference}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="font-semibold text-teal-700">Task ID</div>
          <div className="col-span-2 text-gray-800 font-medium">{file["Task ID"]}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 font-roboto flex flex-col">
      {/* Information Dialog - will show with blue color for "information" type */}
      {infoDialog.open && (
        <Errordialog
          message={infoDialog.message}
          type={infoDialog.type}
          onClose={closeInfoDialog}
        />
      )}
      
      {/* Instrument Dropdown */}
      <div className="mb-4 mt-4">
        <label className="block text-sm font-medium text-[#4a6fa5] mb-1">
          {t("label.instrument")} <span className="text-red-500">*</span>
        </label>
        <div className="w-80">
          <AnimatedDropdown
            name="instrument"
            value={instrument}
            options={instruments}
            displayKey="sInstrumentAliasName"
            valueKey="nInterInstrumentID"
            onChange={handleInstrumentDropdownChange}
          />
        </div>
      </div>

      {/* Instrument Tag Information */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#4a6fa5] mb-2">
          {t("instrumentlocktag.instrumenttagsinformation")}
        </h3>
        <InfoBox data={instrumentTags} />
      </div>

      {/* Latest Merged File Information */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-[#4a6fa5]">
            {t("instrumentlocktag.latestmergedfileinformation")}
          </h3>
          <div className="flex gap-6">
            <button
              className={`text-sm font-medium pb-1 ${
                tab === "merge"
                  ? "text-[#4a9fd8] border-b-2 border-[#4a9fd8]"
                  : "text-gray-600"
              }`}
              onClick={() => handleTabChange("merge")}
            >
              {t("instrumentlocktag.mergedata")}
            </button>
            <button
              className={`text-sm font-medium pb-1 ${
                tab === "null"
                  ? "text-[#4a9fd8] border-b-2 border-[#4a9fd8]"
                  : "text-gray-600"
              }`}
              onClick={() => handleTabChange("null")}
            >
              {t("instrumentlocktag.viewnulldata")}
            </button>
          </div>
        </div>

        {tab === "merge" ? (
          <>
            <div className="flex justify-end gap-2 mb-2">
              <PrimaryButton 
                icon={RefreshCw}
                label={t("instrumentlocktag.refresh")}
                onClick={handleRefreshLatestFiles}
              />
            </div>
            {/* Simple wrapper with border and no radius */}
            <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
              <GridLayout
                columns={mergeColumns}
                data={mergeRows}
                hidePagination={false}
                // onRowClick={}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end mb-2 gap-2">
              <PrimaryButton 
                icon={FileText}
                label={t("instrumentlocktag.proceedacknowledgement")}
                onClick={handleNullDataAcknowledgement}
              />
              <PrimaryButton 
                icon={RefreshCw}
                label={t("instrumentlocktag.refresh")}
                onClick={handleRefreshNullData}
              />
            </div>
            {/* Simple wrapper with border and no radius */}
            <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
              <GridLayout
                columns={nullDataColumns}
                data={nullDataRows}
                hidePagination={false}
              />
            </div>
          </>
        )}
      </div>

      {/* File Information */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-[#4a6fa5]">
            {t("instrumentlocktag.fileinformation")}
          </h3>
          <PrimaryButton 
            icon={RefreshCw}
            label={t("instrumentlocktag.refresh")}
            onClick={handleRefreshFileInfo}
          />
        </div>
        {/* Simple wrapper with border and no radius */}
        <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
          <GridLayout
            columns={fileColumns}
            data={files}
            hidePagination={false}
          />
        </div>
      </div>

      {/* File Tag Information */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#4a6fa5] mb-2">
          {t("instrumentlocktag.filetagsinformation")}
        </h3>
        <InfoBox data={fileTags} />
      </div>

      {/* File Raw Data */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#4a6fa5] mb-2">
          {t("instrumentlocktag.filerawdata")}
        </h3>
        <FileViewer 
          src={fileViewerSrc} 
          fileType={fileViewerType}
          supportedExtensions={supportedExtensions}
        />
      </div>

      {/* Parsed Data */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#4a6fa5] mb-2">
          {t("instrumentlocktag.parseddata")}
        </h3>
        <InfoBox data={parsedData} />
      </div>
    </div>
  );
}
