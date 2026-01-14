import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, FileText } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../Layout/Common/Errordialog";

// Services
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";

/* ------------------ HELPER COMPONENTS ------------------ */

const InfoBox = ({ data, className = "" }) => (
  <div className={`border border-gray-300 bg-white min-h-[100px] p-4 ${className}`}>
    {data.length === 0 ? (
      <div className="text-gray-400 italic text-sm text-center py-4">No data available</div>
    ) : (
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex">
            <label className="w-[45%] text-xs font-bold text-gray-800 truncate">
              {d.Category || d.label}:
            </label>
            <span className="w-[55%] text-xs font-bold text-[#162ddc] truncate">
              {d.Value || d.value}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const FileViewer = ({ src, fileType, supportedExtensions = [] }) => {
  const isSupported = supportedExtensions.some(ext => 
    src?.toLowerCase().endsWith(`.${ext.toLowerCase()}`)
  );
  
  return (
    <div className="border border-gray-300 bg-white min-h-[200px]">
      {src && isSupported ? (
        <iframe
          src={`${src}#toolbar=0&navpanes=0`}
          className="w-full h-[200px] border-none"
          title="File Viewer"
          sandbox="allow-same-origin"
        />
      ) : src && !isSupported ? (
        <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
          <FileText className="w-16 h-16 mb-2" />
          <h2 className="text-lg">File format not supported for preview</h2>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[200px] text-gray-400">
          Select a file to preview
        </div>
      )}
    </div>
  );
};

const PrimaryButton = ({ icon: Icon, label, disabled, onClick, className = "", variant = "primary" }) => {
  const baseStyles = "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded transition-all";
  const variants = {
    primary: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
};

/* ------------------ DATA FETCHING ------------------ */

// Template validation
const fetchTemplateValidation = async ({ postData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { ...userDetailsData };
  return await postData("InstrumentLock/ValidatingTemplateTobeLoad", reqObj);
};

// Load instruments
const fetchInstruments = async ({ postData, featureStatus }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    sFeature: featureStatus,
    ...userDetailsData 
  };
  return await postData("InstrumentLock/LoadInterfaceLockInstrumentNameCombo", reqObj);
};

// Load instrument tags
const fetchInstrumentTags = async ({ postData, instrumentId, siteCode }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    passObjDet: {
      sSiteCode: siteCode,
      sInstrumentID: instrumentId
    },
    ...userDetailsData 
  };
  return await postData("InstrumentLock/CurrentLockInstrumentTagInfo", reqObj);
};

// Load merged files
const fetchMergedFiles = async ({ postData, instrumentId, lockId }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    sInstrumentID: instrumentId,
    sLockID: lockId,
    ...userDetailsData 
  };
  return await postData("InstrumentLock/LoadMergeFileDetails", reqObj);
};

// Load file information
const fetchFileInformation = async ({ postData, instrumentId, taskId }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    sInstrumentID: instrumentId,
    sTaskID: taskId,
    ...userDetailsData 
  };
  return await postData("InstrumentLock/InstrumentCaptureTagData", reqObj);
};

// Load file tags
const fetchFileTags = async ({ postData, file }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    sRecordNo: file.Reference,
    sTaskID: file["Task ID"],
    sFileName: file["File Name"],
    ...userDetailsData 
  };
  return await postData("InstrumentLock/LoadCategoryValueForFiles", reqObj);
};

// Load parsed data
const fetchParsedData = async ({ postData, file }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    sRecordNo: file.Reference,
    sTaskID: file["Task ID"],
    sFileName: file["File Name"],
    ...userDetailsData 
  };
  return await postData("InstrumentLock/getParsedDataDetails", reqObj);
};

// Load file viewer
const fetchFileViewer = async ({ postData, file, browserURL }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    sRecordNo: file.Reference,
    sTaskID: file["Task ID"],
    sUploadStatus: file["Upload Status"]?.trim(),
    sBrowserURL: browserURL,
    ...userDetailsData 
  };
  return await postData("InstrumentLock/InterFaceInstrumentFileDownLoad", reqObj);
};

// Load null data
const fetchNullData = async ({ postData, interfaceInstId, lockId }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    nInterfaceInstID: interfaceInstId,
    sLockID: lockId,
    ...userDetailsData 
  };
  return await postData("InstrumentLock/FetchNullDataBasedOnInstrument", reqObj);
};

// Check merge count
const fetchMergeCount = async ({ postData, interfaceInstId }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    nInterfaceInstID: interfaceInstId,
    ...userDetailsData 
  };
  return await postData("InstrumentLock/MergeCountForAutoRefresh", reqObj);
};

// Load merge file data
const fetchMergeFileData = async ({ postData, mergeData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    ...mergeData,
    ...userDetailsData 
  };
  return await postData("InstrumentLock/MergeFileDatas", reqObj);
};

// Null data acknowledgement
const postNullDataAcknowledgement = async ({ postData, nullData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { 
    ...nullData,
    ...userDetailsData 
  };
  return await postData("InstrumentLock/NullDataAcknowledgement", reqObj);
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function InstrumentDataPage() {
  const { t } = useTranslation();
  const { postData } = servicecall();
  const queryClient = useQueryClient();

  // State management
  const [instrument, setInstrument] = useState("");
  const [tab, setTab] = useState("merge");
  const [instruments, setInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMergeRow, setSelectedMergeRow] = useState(null);
  const [selectedNullRow, setSelectedNullRow] = useState(null);
  const [fileViewerSrc, setFileViewerSrc] = useState("");
  const [supportedExtensions, setSupportedExtensions] = useState([]);
  const [oldRawDataID, setOldRawDataID] = useState(" ");
  const [newRawDataID, setNewRawDataID] = useState("");
  const [isLoadingInstruments, setIsLoadingInstruments] = useState(false);
  
  const refreshTimerRef = useRef(null);
  
  const [infoDialog, setInfoDialog] = useState({
    open: false,
    message: "",
    type: "information"
  });

  // Dialog functions
  const showInfoDialog = useCallback((message, type = "information") => {
    setInfoDialog({
      open: true,
      message,
      type
    });
  }, []);

  const closeInfoDialog = useCallback(() => {
    setInfoDialog(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  // Auto-select the first instrument when instruments are loaded
  useEffect(() => {
    if (instruments.length > 0 && !instrument) {
      setInstrument(instruments[0].value);
      setSelectedInstrument(instruments[0].originalItem);
    }
  }, [instruments, instrument]);

  // 1. Fetch Template Validation
  const { data: templateValidation, isLoading: loadingTemplate } = useQuery({
    queryKey: ["templateValidation"],
    queryFn: () => fetchTemplateValidation({ postData }),
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      if (data && Array.isArray(data)) {
        const featureStatus = data[0]?.L67Status ?? false;
        
        // Set default extensions
        const extensions = ["pdf", "txt", "csv", "xlsx", "xls", "jpg", "jpeg", "png"];
        setSupportedExtensions(extensions);
      }
    },
    onError: (error) => {
      console.error("Error loading template validation:", error);
      showInfoDialog("Failed to load template validation", "information");
    }
  });

  // Get feature status from template validation
  const featureStatus = useMemo(() => {
    return templateValidation?.[0]?.L67Status ?? false;
  }, [templateValidation]);

  // Load instruments directly
  useEffect(() => {
    const loadInstruments = async () => {
      if (templateValidation && instruments.length === 0 && !isLoadingInstruments) {
        setIsLoadingInstruments(true);
        try {
          const featureStatus = templateValidation[0]?.L67Status ?? false;
          const data = await fetchInstruments({ postData, featureStatus });
          
          if (data && Array.isArray(data) && data.length > 0) {
            const formattedInstruments = data.map(inst => ({
              value: inst.nInterInstrumentID?.toString() || "",
              label: inst.sInstrumentAliasName || "Unknown Instrument",
              originalItem: inst
            }));
            setInstruments(formattedInstruments);
          } else {
            showInfoDialog("No instruments found", "information");
          }
        } catch (error) {
          console.error("Error loading instruments:", error);
          showInfoDialog("Failed to load instruments", "information");
        } finally {
          setIsLoadingInstruments(false);
        }
      }
    };
    
    loadInstruments();
  }, [templateValidation, postData, instruments.length, isLoadingInstruments, showInfoDialog]);

  // 3. Fetch Instrument Tags
  const { data: instrumentTags, isLoading: loadingTags } = useQuery({
    queryKey: ["instrumentTags", selectedInstrument?.sInstrumentID],
    queryFn: () => fetchInstrumentTags({ 
      postData, 
      instrumentId: selectedInstrument?.sInstrumentID,
      siteCode: CF_activeUserdetails().sSiteCode
    }),
    enabled: !!selectedInstrument?.sInstrumentID,
    staleTime: 5 * 60 * 1000,
  });

  // 4. Fetch Merged Files
  const { data: mergedFiles, refetch: refetchMergedFiles } = useQuery({
    queryKey: ["mergedFiles", selectedInstrument?.sInstrumentID, selectedInstrument?.sLockID],
    queryFn: () => fetchMergedFiles({ 
      postData, 
      instrumentId: selectedInstrument?.sInstrumentID,
      lockId: selectedInstrument?.sLockID
    }),
    enabled: !!selectedInstrument?.sInstrumentID && !!selectedInstrument?.sLockID,
    staleTime: 5 * 60 * 1000,
  });

  // 5. Fetch File Information
  const { data: fileInformation, refetch: refetchFileInfo } = useQuery({
    queryKey: ["fileInformation", selectedInstrument?.sInstrumentID, selectedInstrument?.sTaskID],
    queryFn: () => fetchFileInformation({ 
      postData, 
      instrumentId: selectedInstrument?.sInstrumentID,
      taskId: selectedInstrument?.sTaskID
    }),
    enabled: !!selectedInstrument?.sInstrumentID && !!selectedInstrument?.sTaskID,
    staleTime: 5 * 60 * 1000,
  });

  // 6. Check Merge Count
  useEffect(() => {
    if (selectedInstrument?.nInterInstrumentID) {
      fetchMergeCount({ 
        postData, 
        interfaceInstId: selectedInstrument.nInterInstrumentID 
      }).then(response => {
        if (response?.MergeCount > 1) {
          if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
          }
          
          refreshTimerRef.current = setInterval(() => {
            refetchMergedFiles();
          }, 1000);
        }
      });
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [selectedInstrument?.nInterInstrumentID, postData, refetchMergedFiles]);

  // Handle instrument selection
  const handleInstrumentChange = useCallback((value) => {
    setInstrument(value);
    const selectedInst = instruments.find(inst => inst.value === value);
    setSelectedInstrument(selectedInst?.originalItem || null);
    setSelectedFile(null);
    setSelectedMergeRow(null);
    setSelectedNullRow(null);
    setFileViewerSrc("");
  }, [instruments]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file) => {
    setSelectedFile(file);
    
    try {
      // Load file viewer
      const viewerResponse = await fetchFileViewer({ 
        postData, 
        file, 
        browserURL: window.location.origin 
      });
      
      if (viewerResponse?.Rtn?.toLowerCase() === "success") {
        setFileViewerSrc(viewerResponse.ServerDataViewURL);
      }
      
      // Load file tags
      const tagsResponse = await fetchFileTags({ postData, file });
      
      // Load parsed data
      const parsedResponse = await fetchParsedData({ postData, file });
      
    } catch (error) {
      console.error("Error loading file data:", error);
      showInfoDialog("Failed to load file data", "information");
    }
  }, [postData, showInfoDialog]);

  // Handle merge row selection
  const handleMergeRowSelect = useCallback(async (row) => {
    setSelectedMergeRow(row);
    setNewRawDataID(row.sRawDataID);
    
    try {
      const response = await fetchMergeFileData({ 
        postData, 
        mergeData: {
          nRawData: row.sRawDataID,
          LockID: row.sLockID,
          nSequenceNo: row.nSequenceNo,
          nMergeFileCount: row.nMergeFileCount,
          nInstrumentID: row.nInstrumentID
        }
      });
      
      if (response) {
        if (response.NullDataStatus === "Created") {
          showInfoDialog(response.CreatedList + " " + (response.Message || ""), "information");
        } else {
          if (oldRawDataID === row.sRawDataID || oldRawDataID === " ") {
            setOldRawDataID(row.sRawDataID);
          } else {
            setOldRawDataID(row.sRawDataID);
          }
        }
      }
    } catch (error) {
      console.error("Error loading merge file data:", error);
      showInfoDialog("Failed to load merge file data", "information");
    }
  }, [postData, oldRawDataID, showInfoDialog]);

  // Handle null data acknowledgement
  const handleNullDataAcknowledgement = useCallback(async () => {
    if (!selectedNullRow) {
      showInfoDialog(t("instrumentlocktag.norecordsfound") || "No Records Found", "information");
      return;
    }
    
    try {
      await postNullDataAcknowledgement({ 
        postData, 
        nullData: {
          nInterfaceInstID: selectedNullRow.nInstrumentID,
          sRawData: selectedNullRow.sRawDataID,
          sLockID: selectedNullRow.sLockID
        }
      });
      
      showInfoDialog("Null data acknowledged successfully", "success");
      // Refresh null data
      queryClient.invalidateQueries({ queryKey: ["nullData"] });
      
    } catch (error) {
      console.error("Error acknowledging null data:", error);
      showInfoDialog("Failed to acknowledge null data", "information");
    }
  }, [postData, selectedNullRow, showInfoDialog, t, queryClient]);

  // Load null data when tab changes
  const handleTabChange = useCallback((newTab) => {
    setTab(newTab);
    if (newTab === "null" && selectedInstrument) {
      queryClient.prefetchQuery({
        queryKey: ["nullData", selectedInstrument.nInterInstrumentID, selectedInstrument.sLockID],
        queryFn: () => fetchNullData({ 
          postData, 
          interfaceInstId: selectedInstrument.nInterInstrumentID,
          lockId: selectedInstrument.sLockID
        }),
      });
    }
  }, [selectedInstrument, postData, queryClient]);

  // Column definitions
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
        const fileName = row["ActualFileName"] || row["File Name"] || "";
        const createdOn = row["Created On"] || "";
        return (
          <div>
            <div className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
              {fileName}
            </div>
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
        const statusLower = status.toLowerCase();
        return (
          <span className={`inline-block px-2 py-1 text-xs font-semibold ${
            statusLower.includes("uploaded") || statusLower.includes("success") ? "bg-green-100 text-green-800" :
            statusLower.includes("failed") || statusLower.includes("error") ? "bg-red-100 text-red-800" :
            statusLower.includes("queue") ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-100 text-gray-800"
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

  // Format data for grids
  const mergeRows = useMemo(() => {
    return (mergedFiles || []).map((item, index) => ({ 
      ...item, 
      id: item.sRawDataID || `merge-${index}`,
    }));
  }, [mergedFiles]);

  const files = useMemo(() => {
    return (fileInformation || []).map((item, index) => ({ 
      ...item, 
      id: item.Reference || `file-${index}`,
    }));
  }, [fileInformation]);

  // Format instrument tags for InfoBox
  const formattedInstrumentTags = useMemo(() => {
    return (instrumentTags || []).map(tag => ({
      Category: tag.Category || "",
      Value: tag.Value || ""
    }));
  }, [instrumentTags]);

  // Show loading state
  if (loadingTemplate) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading template data...</div>
      </div>
    );
  }

  return (
    <div className="px-4 font-roboto flex flex-col space-y-6">
      {/* Information Dialog */}
      {infoDialog.open && (
        <Errordialog
          message={infoDialog.message}
          type={infoDialog.type}
          onClose={closeInfoDialog}
        />
      )}
      
      {/* Instrument Dropdown */}
      <div className="mb-1 mt-2">
        <label className="block text-xs font-bold text-[#4a6fa5] mb-1">
          {t("label.instrument")} <span className="text-red-500">*</span>
        </label>
        <div className="w-80">
          {isLoadingInstruments ? (
            <div className="border border-gray-300 rounded px-3 py-2 text-gray-500">
              Loading instruments...
            </div>
          ) : instruments.length > 0 ? (
            <AnimatedDropdown
              name="instrument"
              value={instrument}
              options={instruments}
              displayKey="label"
              valueKey="value"
              onChange={(e) => handleInstrumentChange(e.target.value)}
              loading={isLoadingInstruments}
              required={true}
            />
          ) : (
            <div className="border border-gray-300 rounded px-3 py-2 text-gray-500">
              No instruments available
            </div>
          )}
        </div>
      </div>

      {/* Instrument Tag Information */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">
          {t("instrumentlocktag.instrumenttagsinformation")}
        </h3>
        <InfoBox data={formattedInstrumentTags} />
      </div>

      {/* Latest Merged File Information */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-[#4a6fa5]">
            {t("instrumentlocktag.latestmergedfileinformation")}
          </h3>
          <div className="flex gap-6">
            <button
              className={`text-xs font-bold pb-1 ${
                tab === "merge"
                  ? "text-[#0049b0] text-sm border-b-2 border-[#2883fe]"
                  : "text-gray-600"
              }`}
              onClick={() => handleTabChange("merge")}
            >
              {t("instrumentlocktag.mergedata")}
            </button>
            <button
              className={`text-xs font-bold pb-1 ${
                tab === "null"
                  ? "text-[#0049b0] text-sm border-b-2 border-[#2883fe]"
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
                label={t("button.refresh")}
                onClick={() => refetchMergedFiles()}
                disabled={!selectedInstrument}
              />
            </div>
            <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
              <GridLayout
                columns={mergeColumns}
                data={mergeRows}
                hidePagination={false}
                onRowClick={handleMergeRowSelect}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end mb-2 gap-2">
              <PrimaryButton 
                label={t("instrumentlocktag.proceedacknowledgement")}
                onClick={handleNullDataAcknowledgement}
                disabled={!selectedNullRow}
                variant="danger"
              />
              <PrimaryButton 
                icon={RefreshCw}
                label={t("button.refresh")}
                onClick={() => queryClient.invalidateQueries({ queryKey: ["nullData"] })}
                disabled={!selectedInstrument}
              />
            </div>
            <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
              <GridLayout
                columns={nullDataColumns}
                data={[]} // You would need to fetch null data
                hidePagination={false}
                onRowClick={setSelectedNullRow}
              />
            </div>
          </>
        )}
      </div>

      {/* File Information */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-[#4a6fa5]">
            {t("instrumentlocktag.fileinformation")}
          </h3>
          <PrimaryButton 
            icon={RefreshCw}
            label={t("button.refresh")}
            onClick={() => refetchFileInfo()}
            disabled={!selectedInstrument}
          />
        </div>
        <div className="w-full overflow-hidden [&>*]:!p-0 [&>*]:!m-0 rounded-none">
          <GridLayout
            columns={fileColumns}
            data={files}
            hidePagination={false}
            onRowClick={handleFileSelect}
          />
        </div>
      </div>

      {/* File Raw Data */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">
          {t("instrumentlocktag.filerawdata")}
        </h3>
        <FileViewer 
          src={fileViewerSrc} 
          supportedExtensions={supportedExtensions}
        />
      </div>
    </div>
  );
}