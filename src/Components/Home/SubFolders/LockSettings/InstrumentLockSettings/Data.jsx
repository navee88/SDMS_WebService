import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { useInstrumentLock } from '../../../../../Context/InstrumentLockContext';

// Components
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../Layout/Common/Errordialog";
import FullPageLoader from "../../../../Layout/Common/FullPageLoader";

// Services
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { CF_decrypt } from "../../../../Common/encryptiondecryption";

/* ------------------ HELPER COMPONENTS ------------------ */

const InfoBox = ({ data, className = "", fixedHeight = false }) => (
  <div className={`border border-gray-300 bg-white p-1 ${fixedHeight ? 'min-h-[200px] max-h-[200px] overflow-auto' : 'min-h-[100px]'} ${className}`}>
    {data.length > 0 && (
      <div className="p-0">
        {data.map((d, i) => (
          <div key={i} className="flex">
            <label className="w-[45%] text-xs font-bold font-roboto text-[#070707] truncate">
              {d.Category || d.label}:
            </label>
            <span className="w-[55%] text-sm font-bold font-['helvetica'] text-[#162ddc] truncate">
              {d.Value || d.value}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const FileViewer = ({ src }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [ext, setExt] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const loadFile = async () => {
      try {
        const cleanSrc = src.split("#")[0].split("?")[0];
        let decryptedUrl;
        
        try {
          decryptedUrl = CF_decrypt(cleanSrc);
        } catch {
          decryptedUrl = cleanSrc;
        }

        const finalUrl = decryptedUrl
          .replace(/\\/g, "/")
          .replace("localhost:3000", "localhost:9091");

        const extension = finalUrl.split(".").pop()?.toLowerCase() || "";
        setExt(extension);

        const response = await fetch(finalUrl);
        if (!response.ok) throw new Error();
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        if (extension === "csv") await parseCSV(blob);
        if (["xls", "xlsx"].includes(extension)) await parseExcel(blob);
        if (["txt", "xml", "json"].includes(extension)) await parseText(blob);

      } catch {
        setError(true);
      }
    };

    loadFile();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src]);

  const parseCSV = async (blob) => {
    const text = await blob.text();
    const rows = text.split("\n").map(row => row.split(","));
    setData(rows);
  };

  const parseExcel = async (blob) => {
    const buffer = await blob.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    setData(json);
  };

  const parseText = async (blob) => {
    const text = await blob.text();
    setData(text);
  };

  if (!src) return null;
  if (error) return null;
  if (!blobUrl) return null;

  // PDF
  if (ext === "pdf") {
    return (
      <embed 
        src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        type="application/pdf" 
        className="w-full h-[200px]" 
      />
    );
  }

  // Images
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return <img src={blobUrl} className="max-h-[200px] mx-auto object-contain" alt="preview" />;
  }

  // CSV / Excel Table
  if (["csv", "xls", "xlsx"].includes(ext) && data) {
    return (
      <div className="overflow-auto max-h-[200px] border border-gray-300">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-gray-200 px-2 py-1">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Text / XML / JSON
  if (["txt", "xml", "json"].includes(ext)) {
    return (
      <pre className="p-2 max-h-[200px] overflow-auto bg-white text-[13px] font-mono break-words">
        {data}
      </pre>
    );
  }

  // Video
  if (["mp4", "webm", "ogg"].includes(ext)) {
    return <video controls className="w-full h-[200px]" src={blobUrl} />;
  }

  // Audio
  if (["mp3", "wav", "ogg"].includes(ext)) {
    return <audio controls src={blobUrl} className="w-full" />;
  }

  // Fallback
  return (
    <div className="flex items-center justify-center h-[200px]">
      <a href={blobUrl} download className="text-blue-600 underline">
        Download File
      </a>
    </div>
  );
};

const PrimaryButton = ({ icon: Icon, label, disabled, onClick, className = "", loading = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#f0f2f5] text-[#2883fe] ${className}`}
    >
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function InstrumentDataPage() {
  const { t } = useTranslation();
  const { navigationData, clearNavigationData } = useInstrumentLock();
  const { postData } = servicecall();

  // State management
  const [instrument, setInstrument] = useState("");
  const [tab, setTab] = useState("merge");
  const [instruments, setInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMergeRow, setSelectedMergeRow] = useState(null);
  const [selectedNullRow, setSelectedNullRow] = useState(null);
  const [fileViewerSrc, setFileViewerSrc] = useState("");
  const [oldRawDataID, setOldRawDataID] = useState(" ");
  const [mergeDataContent, setMergeDataContent] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [fileTags, setFileTags] = useState([]);
  const [instrumentTags, setInstrumentTags] = useState([]);
  const [mergedFiles, setMergedFiles] = useState([]);
  const [fileInformation, setFileInformation] = useState([]);
  const [nullData, setNullData] = useState([]);
  const [featureStatus, setFeatureStatus] = useState(false);
  const [showInstrumentTags, setShowInstrumentTags] = useState(true);
  
  // Auto-loaded data
  const [autoSelectedFile, setAutoSelectedFile] = useState(null);
  const [autoSelectedMergeRow, setAutoSelectedMergeRow] = useState(null);
  const [autoLoadedMergeData, setAutoLoadedMergeData] = useState("");
  const [autoLoadedFileTags, setAutoLoadedFileTags] = useState([]);
  const [autoLoadedParsedData, setAutoLoadedParsedData] = useState([]);
  
  // Loaders
  const [fullPageLoading, setFullPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState({
    template: false,
    instruments: false,
    mergedFiles: false,
    fileInformation: false,
    nullData: false,
    mergeData: false,
    fileViewer: false,
    fileTags: false,
    parsedData: false
  });
  
  // Dialogs
  const [infoDialog, setInfoDialog] = useState({
    open: false,
    message: "",
    type: "information"
  });

  // Refs
  const autoRefreshTimerRef = useRef(null);

  // Dialog functions
  const showInfoDialog = useCallback((message, type = "information") => {
    setInfoDialog({ open: true, message, type });
  }, []);

  const closeInfoDialog = useCallback(() => {
    setInfoDialog(prev => ({ ...prev, open: false }));
  }, []);

  // API call wrapper
  const makeAPICall = useCallback(async (url, passObjDet) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { ...passObjDet, ...userDetailsData };
    return await postData(url, reqObj);
  }, [postData]);

  // Load merge file data
  const loadMergeFileData = async (row, isAutoLoad = false) => {
    setIsLoading(prev => ({ ...prev, mergeData: true }));
    
    try {
      const passObjDet = {
        nRawData: row.sRawDataID,
        LockID: row.sLockID,
        nSequenceNo: row.nSequenceNo,
        nMergeFileCount: row.nMergeFileCount,
        nInstrumentID: row.nInstrumentID
      };
      
      const response = await makeAPICall("InstrumentLock/MergeFileDatas", passObjDet);
      
      if (response) {
        if (response.NullDataStatus === "Created") {
          showInfoDialog((response.CreatedList || "") + " " + (response.Message || ""), "warning");
        } else {
          let mergeContent = "";
          if (response.MergeData) {
            try {
              mergeContent = atob(response.MergeData);
            } catch {
              mergeContent = response.MergeData;
            }
          } else if (response.InstData && Array.isArray(response.InstData)) {
            const decodedData = response.InstData.map(item => 
              item.sInstrumentData ? (() => { try { return atob(item.sInstrumentData); } catch { return item.sInstrumentData; } })() : item
            );
            mergeContent = decodedData.join('\n');
          }
          
          if (oldRawDataID === row.sRawDataID || oldRawDataID === " ") {
            setOldRawDataID(row.sRawDataID);
            if (isAutoLoad) {
              if (!autoLoadedMergeData) setAutoLoadedMergeData(mergeContent);
            } else {
              if (!mergeDataContent) setMergeDataContent(mergeContent);
            }
          } else {
            setOldRawDataID(row.sRawDataID);
            if (isAutoLoad) setAutoLoadedMergeData(mergeContent);
            else setMergeDataContent(mergeContent);
          }
        }
      }
    } catch {
      showInfoDialog("Failed to load merge file data", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, mergeData: false }));
    }
  };

  // Load file data
  const loadFileData = async (file, isAutoLoad = false) => {
    setFileViewerSrc("");
    
    try {
      // Load file viewer
      setIsLoading(prev => ({ ...prev, fileViewer: true }));
      const passObjDet = {
        sRecordNo: file.Reference,
        sTaskID: file["Task ID"],
        sUploadStatus: file["Upload Status"]?.trim(),
        sBrowserURL: window.location.origin
      };
      
      const viewerResponse = await makeAPICall("InstrumentLock/InterFaceInstrumentFileDownLoad", passObjDet);
      
      if (viewerResponse) {
        if (viewerResponse.Rtn?.toLowerCase() === "failed") {
          showInfoDialog(viewerResponse.Message || "Failed to load file", "warning");
        } else if (viewerResponse.Rtn?.toLowerCase() === "success" && viewerResponse.ServerDataViewURL) {
          let urlPath = viewerResponse.ServerDataViewURL;
          if (!urlPath.includes('#')) urlPath += '#toolbar=0&navpanes=0';
          setFileViewerSrc(urlPath);
        }
      }
    } catch {
      showInfoDialog("Failed to load file", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, fileViewer: false }));
    }
    
    // Load file tags
    setIsLoading(prev => ({ ...prev, fileTags: true }));
    try {
      const passObjDet = {
        sRecordNo: file.Reference,
        sTaskID: file["Task ID"],
        sFileName: file["File Name"]
      };
      
      const tagsResponse = await makeAPICall("InstrumentLock/LoadCategoryValueForFiles", passObjDet);
      
      if (tagsResponse && Array.isArray(tagsResponse)) {
        if (isAutoLoad) setAutoLoadedFileTags(tagsResponse);
        else setFileTags(tagsResponse);
      } else {
        if (isAutoLoad) setAutoLoadedFileTags([]);
        else setFileTags([]);
      }
    } catch {
      if (isAutoLoad) setAutoLoadedFileTags([]);
      else setFileTags([]);
    } finally {
      setIsLoading(prev => ({ ...prev, fileTags: false }));
    }
    
    // Load parsed data
    setIsLoading(prev => ({ ...prev, parsedData: true }));
    try {
      const passObjDet = {
        sRecordNo: file.Reference,
        sTaskID: file["Task ID"],
        sFileName: file["File Name"]
      };
      
      const parsedResponse = await makeAPICall("InstrumentLock/getParsedDataDetails", passObjDet);
      
      if (parsedResponse && Array.isArray(parsedResponse)) {
        if (isAutoLoad) setAutoLoadedParsedData(parsedResponse);
        else setParsedData(parsedResponse);
      } else {
        if (isAutoLoad) setAutoLoadedParsedData([]);
        else setParsedData([]);
      }
    } catch {
      if (isAutoLoad) setAutoLoadedParsedData([]);
      else setParsedData([]);
    } finally {
      setIsLoading(prev => ({ ...prev, parsedData: false }));
    }
  };

  // Timer management
  const setupAutoRefreshTimer = useCallback((mergeCount) => {
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
    }
    
    if (mergeCount > 1) {
      autoRefreshTimerRef.current = setInterval(async () => {
        if (selectedInstrument && instrument) {
          try {
            const passObjDet = {
              sInstrumentID: parseInt(instrument),
              sLockID: selectedInstrument.sLockID
            };
            
            const mergedFilesData = await makeAPICall("InstrumentLock/LoadMergeFileDetails", passObjDet);
            
            if (mergedFilesData && Array.isArray(mergedFilesData)) {
              setMergedFiles(mergedFilesData);
              
              if (mergedFilesData.length > 0 && !selectedMergeRow && !autoSelectedMergeRow) {
                const firstMergeRow = mergedFilesData[0];
                setAutoSelectedMergeRow(firstMergeRow);
                setSelectedMergeRow(firstMergeRow);
                await loadMergeFileData(firstMergeRow, true);
              }
            }
          } catch {
            // Silent fail for auto-refresh
          }
        }
      }, 1000);
    }
  }, [selectedInstrument, instrument, selectedMergeRow, autoSelectedMergeRow, makeAPICall, loadMergeFileData]);

  // Load instrument data
  const loadInstrumentData = useCallback(async (instrumentData) => {
    if (!instrumentData || !instrumentData.originalItem) return;
    
    try {
      // Load instrument tags
      if (showInstrumentTags && instrumentData.originalItem?.sInstrumentID) {
        setIsLoading(prev => ({ ...prev, instrumentTags: true }));
        try {
          const passObjDet = {
            passObjDet: {
              sSiteCode: CF_activeUserdetails().sSiteCode,
              sInstrumentID: instrumentData.originalItem.sInstrumentID
            }
          };
          
          const tags = await makeAPICall("InstrumentLock/CurrentLockInstrumentTagInfo", passObjDet);
          if (tags && Array.isArray(tags)) setInstrumentTags(tags);
        } finally {
          setIsLoading(prev => ({ ...prev, instrumentTags: false }));
        }
      }

      // Load merged files
      if (instrumentData.value && instrumentData.originalItem?.sLockID) {
        setIsLoading(prev => ({ ...prev, mergedFiles: true }));
        try {
          const instrumentId = parseInt(instrumentData.value);
          const passObjDet = { sInstrumentID: instrumentId, sLockID: instrumentData.originalItem.sLockID };
          
          const mergedFilesData = await makeAPICall("InstrumentLock/LoadMergeFileDetails", passObjDet);
          
          if (mergedFilesData && Array.isArray(mergedFilesData)) {
            setMergedFiles(mergedFilesData);
            
            const mergeCount = mergedFilesData.reduce((count, item) => count + (parseInt(item.nMergeFileCount) || 0), 0);
            setupAutoRefreshTimer(mergeCount);
            
            if (mergedFilesData.length > 0) {
              const firstMergeRow = mergedFilesData[0];
              setAutoSelectedMergeRow(firstMergeRow);
              setSelectedMergeRow(firstMergeRow);
              await loadMergeFileData(firstMergeRow, true);
            } else {
              setAutoSelectedMergeRow(null);
              setSelectedMergeRow(null);
              setAutoLoadedMergeData("");
            }
          } else {
            setMergedFiles([]);
            setAutoSelectedMergeRow(null);
            setSelectedMergeRow(null);
            setAutoLoadedMergeData("");
          }
        } catch {
          showInfoDialog("Failed to load merged files", "information");
          setMergedFiles([]);
          setAutoSelectedMergeRow(null);
          setSelectedMergeRow(null);
          setAutoLoadedMergeData("");
        } finally {
          setIsLoading(prev => ({ ...prev, mergedFiles: false }));
        }
      }

      // Load file information
      if (instrumentData.originalItem?.sInstrumentID && instrumentData.originalItem?.sTaskID) {
        setIsLoading(prev => ({ ...prev, fileInformation: true }));
        try {
          const passObjDet = {
            sInstrumentID: instrumentData.originalItem.sInstrumentID,
            sTaskID: instrumentData.originalItem.sTaskID
          };
          
          const fileInfoData = await makeAPICall("InstrumentLock/InstrumentCaptureTagData", passObjDet);
          
          if (fileInfoData && Array.isArray(fileInfoData)) {
            setFileInformation(fileInfoData);
            
            if (fileInfoData.length > 0) {
              const firstFile = fileInfoData[0];
              setAutoSelectedFile(firstFile);
              setSelectedFile(firstFile);
              await loadFileData(firstFile, true);
            } else {
              setAutoSelectedFile(null);
              setSelectedFile(null);
              setAutoLoadedFileTags([]);
              setAutoLoadedParsedData([]);
            }
          } else {
            setFileInformation([]);
            setAutoSelectedFile(null);
            setSelectedFile(null);
            setAutoLoadedFileTags([]);
            setAutoLoadedParsedData([]);
          }
        } catch {
          setFileInformation([]);
          setAutoSelectedFile(null);
          setSelectedFile(null);
          setAutoLoadedFileTags([]);
          setAutoLoadedParsedData([]);
        } finally {
          setIsLoading(prev => ({ ...prev, fileInformation: false }));
        }
      }

    } catch {
      showInfoDialog("Failed to load instrument data", "information");
    }
  }, [makeAPICall, showInstrumentTags, showInfoDialog, setupAutoRefreshTimer, loadMergeFileData, loadFileData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, []);

  // Handle instrument change
  const handleInstrumentChange = useCallback(async (value) => {
    setFullPageLoading(true);
    
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }
    
    setInstrument(value);
    const selectedInst = instruments.find(inst => inst.value === value);
    setSelectedInstrument(selectedInst?.originalItem || null);
    setSelectedFile(null);
    setSelectedMergeRow(null);
    setSelectedNullRow(null);
    setFileViewerSrc("");
    setMergeDataContent("");
    setParsedData([]);
    setFileTags([]);
    setInstrumentTags([]);
    setMergedFiles([]);
    setFileInformation([]);
    setNullData([]);
    
    setAutoSelectedFile(null);
    setAutoSelectedMergeRow(null);
    setAutoLoadedMergeData("");
    setAutoLoadedFileTags([]);
    setAutoLoadedParsedData([]);
    
    if (selectedInst) {
      await loadInstrumentData({
        value: selectedInst.value,
        originalItem: selectedInst.originalItem
      });
    }
    
    setFullPageLoading(false);
  }, [instruments, loadInstrumentData]);

  // Navigation data handler
  useEffect(() => {
    if (navigationData.autoSelectInstrument && navigationData.instrumentId) {
      const targetInstrumentId = navigationData.instrumentId.trim();
      const selectedInst = instruments.find(inst => {
        const instId = inst.value || inst.originalItem?.sInstrumentID || '';
        return instId.toString().trim() === targetInstrumentId;
      });
      
      if (selectedInst) {
        const timer = setTimeout(() => {
          handleInstrumentChange(selectedInst.value);
          clearNavigationData();
        }, 100);
        
        return () => clearTimeout(timer);
      } else {
        clearNavigationData();
      }
    }
  }, [navigationData, instruments, handleInstrumentChange, clearNavigationData]);

  // Initialize on mount
  useEffect(() => {
    const loadTemplateValidation = async () => {
      setIsLoading(prev => ({ ...prev, template: true }));
      setFullPageLoading(true);
      try {
        const data = await makeAPICall("InstrumentLock/ValidatingTemplateTobeLoad", {});
        
        if (data && Array.isArray(data) && data.length > 0) {
          const status = data[0]?.L67Status ?? false;
          setFeatureStatus(status);
          setShowInstrumentTags(!status);
          await loadInstruments(status);
        } else {
          showInfoDialog(t("instrumentlocktag.noinstrumentsfound") || "No instruments found", "information");
        }
      } catch {
        showInfoDialog("Failed to load template validation", "information");
      } finally {
        setIsLoading(prev => ({ ...prev, template: false }));
        setFullPageLoading(false);
      }
    };
    
    loadTemplateValidation();
  }, [makeAPICall, showInfoDialog, t]);

  // Load instruments
  const loadInstruments = async (featureStatus) => {
    setIsLoading(prev => ({ ...prev, instruments: true }));
    try {
      const userDetailsData = CF_activeUserdetails();
      const reqObj = { sFeature: featureStatus, ...userDetailsData };
      
      const instrumentsData = await postData("InstrumentLock/LoadInterfaceLockInstrumentNameCombo", reqObj);
      
      if (instrumentsData && Array.isArray(instrumentsData)) {
        const formattedInstruments = instrumentsData.map(inst => ({
          value: inst.nInterInstrumentID?.toString() || "",
          label: inst.sInstrumentAliasName || "Unknown Instrument",
          originalItem: inst
        }));
        
        setInstruments(formattedInstruments);
        
        if (formattedInstruments.length > 0) {
          const firstInstrument = formattedInstruments[0];
          setInstrument(firstInstrument.value);
          setSelectedInstrument(firstInstrument.originalItem);
          await loadInstrumentData({
            value: firstInstrument.value,
            originalItem: firstInstrument.originalItem
          });
        } else {
          setInstrument("");
          setSelectedInstrument(null);
        }
      } else {
        setInstruments([]);
        setInstrument("");
        setSelectedInstrument(null);
      }
    } catch {
      setInstruments([]);
      setInstrument("");
      setSelectedInstrument(null);
      showInfoDialog("Failed to load instruments", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, instruments: false }));
    }
  };

  // Refresh handlers
  const handleRefreshMergedFiles = useCallback(async () => {
    if (!selectedInstrument || !instrument) {
      showInfoDialog("Please select an instrument first", "information");
      return;
    }
    
    setFullPageLoading(true);
    setIsLoading(prev => ({ ...prev, mergedFiles: true }));
    try {
      const passObjDet = {
        sInstrumentID: parseInt(instrument),
        sLockID: selectedInstrument.sLockID
      };
      
      const mergedFilesData = await makeAPICall("InstrumentLock/LoadMergeFileDetails", passObjDet);
      
      if (mergedFilesData && Array.isArray(mergedFilesData)) {
        setMergedFiles(mergedFilesData);
        
        const mergeCount = mergedFilesData.reduce((count, item) => count + (parseInt(item.nMergeFileCount) || 0), 0);
        setupAutoRefreshTimer(mergeCount);
        
        if (mergedFilesData.length > 0) {
          const firstMergeRow = mergedFilesData[0];
          setAutoSelectedMergeRow(firstMergeRow);
          setSelectedMergeRow(firstMergeRow);
          await loadMergeFileData(firstMergeRow, true);
        } else {
          setAutoSelectedMergeRow(null);
          setSelectedMergeRow(null);
          setAutoLoadedMergeData("");
        }
      } else {
        setMergedFiles([]);
        setAutoSelectedMergeRow(null);
        setSelectedMergeRow(null);
        setAutoLoadedMergeData("");
      }
    } catch {
      showInfoDialog("Failed to refresh data", "information");
      setMergedFiles([]);
      setAutoSelectedMergeRow(null);
      setSelectedMergeRow(null);
      setAutoLoadedMergeData("");
    } finally {
      setIsLoading(prev => ({ ...prev, mergedFiles: false }));
      setFullPageLoading(false);
    }
  }, [selectedInstrument, instrument, makeAPICall, showInfoDialog, loadMergeFileData, setupAutoRefreshTimer]);

  const handleRefreshFileInfo = useCallback(async () => {
    if (!selectedInstrument) {
      showInfoDialog("Please select an instrument first", "information");
      return;
    }
    
    setFullPageLoading(true);
    setIsLoading(prev => ({ ...prev, fileInformation: true }));
    try {
      const passObjDet = {
        sInstrumentID: selectedInstrument.sInstrumentID,
        sTaskID: selectedInstrument.sTaskID
      };
      
      const fileInfoData = await makeAPICall("InstrumentLock/InstrumentCaptureTagData", passObjDet);
      
      if (fileInfoData && Array.isArray(fileInfoData)) {
        setFileInformation(fileInfoData);
        
        if (fileInfoData.length > 0) {
          const firstFile = fileInfoData[0];
          setAutoSelectedFile(firstFile);
          setSelectedFile(firstFile);
          await loadFileData(firstFile, true);
        } else {
          setAutoSelectedFile(null);
          setSelectedFile(null);
          setAutoLoadedFileTags([]);
          setAutoLoadedParsedData([]);
        }
      } else {
        setFileInformation([]);
        setAutoSelectedFile(null);
        setSelectedFile(null);
        setAutoLoadedFileTags([]);
        setAutoLoadedParsedData([]);
      }
    } catch {
      showInfoDialog("Failed to refresh data", "information");
      setFileInformation([]);
      setAutoSelectedFile(null);
      setSelectedFile(null);
      setAutoLoadedFileTags([]);
      setAutoLoadedParsedData([]);
    } finally {
      setIsLoading(prev => ({ ...prev, fileInformation: false }));
      setFullPageLoading(false);
    }
  }, [selectedInstrument, makeAPICall, showInfoDialog, loadFileData]);

  const handleRefreshNullData = useCallback(async () => {
    if (!selectedInstrument) {
      showInfoDialog(t("instrumentlocktag.noinstrumentsfound") || "No instruments found", "information");
      return;
    }
    
    setFullPageLoading(true);
    setIsLoading(prev => ({ ...prev, nullData: true }));
    try {
      const passObjDet = {
        nInterfaceInstID: selectedInstrument.nInterInstrumentID,
        sLockID: selectedInstrument.sLockID
      };
      
      const nullDataResponse = await makeAPICall("InstrumentLock/FetchNullDataBasedOnInstrument", passObjDet);
      if (nullDataResponse && Array.isArray(nullDataResponse)) setNullData(nullDataResponse);
    } catch {
      showInfoDialog("Failed to refresh data", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, nullData: false }));
      setFullPageLoading(false);
    }
  }, [selectedInstrument, makeAPICall, showInfoDialog, t]);

  // Null data handler
  useEffect(() => {
    const loadNullData = async () => {
      if (tab === "null") {
        if (!selectedInstrument) {
          showInfoDialog(t("instrumentlocktag.noinstrumentsfound") || "No instruments found", "information");
          return;
        }
        
        if (selectedInstrument?.nInterInstrumentID && selectedInstrument?.sLockID) {
          setIsLoading(prev => ({ ...prev, nullData: true }));
          try {
            const passObjDet = {
              nInterfaceInstID: selectedInstrument.nInterInstrumentID,
              sLockID: selectedInstrument.sLockID
            };
            
            const nullDataResponse = await makeAPICall("InstrumentLock/FetchNullDataBasedOnInstrument", passObjDet);
            if (nullDataResponse && Array.isArray(nullDataResponse)) setNullData(nullDataResponse);
          } catch {
            showInfoDialog("Failed to load null data", "information");
          } finally {
            setIsLoading(prev => ({ ...prev, nullData: false }));
          }
        }
      }
    };

    loadNullData();
  }, [tab, selectedInstrument, makeAPICall, showInfoDialog, t]);

  // Event handlers
  const handleFileSelect = useCallback(async (file) => {
    setSelectedFile(file);
    await loadFileData(file, false);
  }, [loadFileData]);

  const handleMergeRowSelect = useCallback(async (row) => {
    setSelectedMergeRow(row);
    await loadMergeFileData(row, false);
  }, [loadMergeFileData]);

  const handleNullRowSelect = useCallback((row) => {
    setSelectedNullRow(row);
  }, []);

  const handleNullDataAcknowledgement = useCallback(async () => {
    if (!selectedNullRow) {
      showInfoDialog(t("instrumentlocktag.norecordsfound") || "No Records Found", "information");
      return;
    }
    
    setFullPageLoading(true);
    try {
      const passObjDet = {
        nInterfaceInstID: selectedNullRow.nInstrumentID,
        sRawData: selectedNullRow.sRawDataID,
        sLockID: selectedNullRow.sLockID
      };
      
      const response = await makeAPICall("InstrumentLock/NullDataAcknowledgement", passObjDet);
      
      if (response?.AuditTrailLogin === false) {
        showInfoDialog(response.LoginFailedMsg || "Login failed", "information");
      } else {
        showInfoDialog("Null data acknowledged successfully", "success");
        handleRefreshNullData();
      }
      
    } catch {
      showInfoDialog("Failed to acknowledge null data", "information");
    } finally {
      setFullPageLoading(false);
    }
  }, [makeAPICall, selectedNullRow, showInfoDialog, t, handleRefreshNullData]);

  const handleTabChange = useCallback((newTab) => {
    setTab(newTab);
    setSelectedNullRow(null);
    
    if (newTab === "null" && !selectedInstrument) {
      showInfoDialog(t("instrumentlocktag.noinstrumentsfound") || "No instruments found", "information");
    }
  }, [selectedInstrument, showInfoDialog, t]);

  // Data formatters
  const formattedParsedData = useMemo(() => {
    const dataToUse = parsedData.length > 0 ? parsedData : autoLoadedParsedData;
    return (dataToUse || []).map(item => {
      let fieldName = item.FieldName || "";
      const lastBracketIndex = fieldName.lastIndexOf(']');
      if (lastBracketIndex !== -1) {
        fieldName = fieldName.substring(lastBracketIndex + 1).trim();
      }
      
      if (!fieldName || /^\d+$/.test(fieldName)) {
        const original = item.FieldName || '';
        if (original.includes('IF0001')) fieldName = 'Parsed Time';
        else if (original.includes('IF0002')) fieldName = 'Instrument Code';
        else if (original.includes('IF0003')) fieldName = 'Instrument Name';
        else fieldName = `Field ${original.replace(/[\[\]]/g, '')}`;
      }
      
      return { Category: fieldName, Value: item.FieldValue || "" };
    });
  }, [parsedData, autoLoadedParsedData]);

  const formattedFileTags = useMemo(() => {
    const tagsToUse = fileTags.length > 0 ? fileTags : autoLoadedFileTags;
    return (tagsToUse || []).map(tag => ({ Category: tag.Category || "", Value: tag.Value || "" }));
  }, [fileTags, autoLoadedFileTags]);

  const formattedInstrumentTags = useMemo(() => {
    return (instrumentTags || []).map(tag => ({ Category: tag.Category || "", Value: tag.Value || "" }));
  }, [instrumentTags]);

  const displayedMergeData = useMemo(() => mergeDataContent || autoLoadedMergeData, [mergeDataContent, autoLoadedMergeData]);

  // Column definitions
  const mergeColumns = useMemo(() => [
    {
      key: 'sRawDataID',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.rawdataid") || 'Raw Data ID'}</span>,
      width: "40%",
      enableSearch: true,
      render: (row, isSelected) => {
        const isAutoSelected = autoSelectedMergeRow && autoSelectedMergeRow.sRawDataID === row.sRawDataID;
        return <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected || isAutoSelected ? 'font-bold' : 'font-normal'}`}>{row.sRawDataID}</span>;
      }
    },
    {
      key: 'nSequenceNo',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.sequenceno") || 'Sequence No'}</span>,
      width: "40%",
      enableSearch: true,
      render: (row, isSelected) => {
        const isAutoSelected = autoSelectedMergeRow && autoSelectedMergeRow.sRawDataID === row.sRawDataID;
        return <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected || isAutoSelected ? 'font-bold' : 'font-normal'}`}>{row.nSequenceNo}</span>;
      }
    },
    {
      key: 'nMergeFileCount',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.mergefilecount") || 'Merge File Count'}</span>,
      width: "20%",
      enableSearch: true,
      render: (row, isSelected) => {
        const isAutoSelected = autoSelectedMergeRow && autoSelectedMergeRow.sRawDataID === row.sRawDataID;
        return <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected || isAutoSelected ? 'font-bold' : 'font-normal'}`}>{row.nMergeFileCount}</span>;
      }
    }
  ], [t, autoSelectedMergeRow]);

  const nullDataColumns = useMemo(() => [
    {
      key: 'sRawDataID',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.rawdataid") || 'Raw Data ID'}</span>,
      width: "25%",
      enableSearch: true,
      render: (row, isSelected) => <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>{row.sRawDataID}</span>
    },
    {
      key: 'nSequenceNo',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.sequenceno") || 'Sequence No'}</span>,
      width: "15%",
      enableSearch: true,
      render: (row, isSelected) => <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>{row.nSequenceNo}</span>
    },
    {
      key: 'nMergeFileCount',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.mergefilecount") || 'Merge File Count'}</span>,
      width: "15%",
      enableSearch: true,
      render: (row, isSelected) => <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>{row.nMergeFileCount}</span>
    },
    {
      key: 'sLockID',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.lockid") || 'Lock ID'}</span>,
      width: "25%",
      enableSearch: true,
      render: (row, isSelected) => <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>{row.sLockID}</span>
    },
    {
      key: 'nInstrumentID',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.instrumentid") || 'Instrument ID'}</span>,
      width: "20%",
      enableSearch: true,
      render: (row, isSelected) => <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>{row.nInstrumentID}</span>
    }
  ], [t]);

  const fileColumns = useMemo(() => [
    {
      key: 'File Name',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.filename") || 'File Name'}</span>,
      width: "40%",
      enableSearch: true,
      render: (row, isSelected) => {
        const fileName = row["ActualFileName"] || row["File Name"] || "";
        const createdOn = row["Created On"] || "";
        return (
          <div className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'} truncate`}>
            {fileName} {createdOn}
          </div>
        );
      }
    },
    {
      key: 'Upload Status',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t("instrumentlocktag.uploadstatus") || 'Upload Status'}</span>,
      width: "20%",
      render: (row) => {
        const status = row["Upload Status"]?.trim() || "";
        const statusLower = status.toLowerCase();
        let color = "text-gray-400";
        
        if (statusLower.includes("uploaded") || statusLower.includes("success")) color = "text-green-500";
        else if (statusLower.includes("queue")) color = "text-amber-500";
        else if (statusLower.includes("failed") || statusLower.includes("error")) color = "text-red-500";
        
        return (
          <div className="flex items-center justify-center">
            <svg className={`w-4 h-4 ${color}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      }
    },
    {
      key: 'Client Name',
      label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('label.clientName') || 'Client Name'}</span>,
      width: "40%",
      enableSearch: true,
      render: (row, isSelected) => (
        <div className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row["Client Name"]}
        </div>
      )
    }
  ], [t]);

  // Grid data
  const mergeRows = useMemo(() => (mergedFiles || []).map((item, index) => ({ ...item, id: item.sRawDataID || `merge-${index}` })), [mergedFiles]);
  const nullRows = useMemo(() => (nullData || []).map((item, index) => ({ ...item, id: item.sRawDataID || `null-${index}` })), [nullData]);
  const files = useMemo(() => (fileInformation || []).map((item, index) => ({ ...item, id: item.Reference || `file-${index}` })), [fileInformation]);

  return (
    <div className="font-roboto flex flex-col space-y-2 px-4 relative">
      <FullPageLoader loading={fullPageLoading} text="Loading data..." />
      
      {infoDialog.open && <Errordialog message={infoDialog.message} type={infoDialog.type} onClose={closeInfoDialog} />}
      
      {/* Instrument Dropdown */}
      <div className="mb-1 mt-2">
        <label className="block text-xs font-bold text-[#4a6fa5] mb-1">
          {t("label.instrument")} <span className="text-red-500">*</span>
        </label>
        <div className="w-80">
          <AnimatedDropdown
            name="instrument"
            value={instrument}
            options={instruments}
            displayKey="label"
            valueKey="value"
            onChange={(e) => handleInstrumentChange(e.target.value)}
            loading={isLoading.instruments}
            required={true}
          />
        </div>
      </div>

      {/* Instrument Tag Information */}
      {showInstrumentTags && (
        <div className="mb-0">
          <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">{t("instrumentlocktag.instrumenttagsinformation")}</h3>
          <InfoBox data={formattedInstrumentTags} />
        </div>
      )}

      {/* Latest Merged File Information */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-[#4a6fa5]">{t("instrumentlocktag.latestmergedfileinformation")}</h3>
          <div className="flex gap-6">
            <button
              className={`text-xs font-bold pb-1 transition-colors ${tab === "merge" ? "text-[#0049b0] text-sm border-b-2 border-[#2883fe]" : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => handleTabChange("merge")}
            >
              {t("instrumentlocktag.mergedata")}
            </button>
            <button
              className={`text-xs font-bold pb-1 transition-colors ${tab === "null" ? "text-[#0049b0] text-sm border-b-2 border-[#2883fe]" : "text-gray-600 hover:text-gray-800"}`}
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
                onClick={handleRefreshMergedFiles}
                loading={isLoading.mergedFiles}
              />
            </div>
            <div className="overflow-hidden -m-2">
              <GridLayout
                columns={mergeColumns}
                data={mergeRows}
                hidePagination={false}
                height="400px"
                onRowClick={handleMergeRowSelect}
                selectedRowId={selectedMergeRow?.id}
                emptyMessage="No merged files available"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end mb-2 gap-2">
              <PrimaryButton 
                label={t("instrumentlocktag.proceedacknowledgement")}
                onClick={handleNullDataAcknowledgement}
              />
              <PrimaryButton 
                icon={RefreshCw}
                label={t("button.refresh")}
                onClick={handleRefreshNullData}
                loading={isLoading.nullData}
              />
            </div>
            <div className="overflow-hidden -m-2">
              <GridLayout
                columns={nullDataColumns}
                data={nullRows}
                hidePagination={false}
                height="400px"
                onRowClick={handleNullRowSelect}
                selectedRowId={selectedNullRow?.id}
                emptyMessage="No null data available"
              />
            </div>
          </>
        )}
        
        {/* Merge File Raw Data Display */}
        <div className="mt-4">
          <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">{t("instrumentlocktag.mergedfilerawdata")}</h3>
          <div className="border border-gray-300 bg-white min-h-[200px] p-1 overflow-auto max-h-[300px]">
            <pre className="text-sm font-['helvetica'] m-0 p-0 whitespace-pre-wrap break-words">
              {displayedMergeData || ""}
            </pre>
          </div>
        </div>
      </div>

      {/* File Information */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-[#4a6fa5]">{t("instrumentlocktag.fileinformation")}</h3>
          <PrimaryButton 
            icon={RefreshCw}
            label={t("button.refresh")}
            onClick={handleRefreshFileInfo}
            loading={isLoading.fileInformation}
          />
        </div>
        <div className="overflow-hidden -m-2">
          {isLoading.fileInformation ? (
            <div className="text-center text-gray-500 bg-white flex items-center justify-center h-[500px]">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            </div>
          ) : files.length > 0 ? (
            <GridLayout
              columns={fileColumns}
              height="500px"
              data={files}
              hidePagination={false}
              onRowClick={handleFileSelect}
              selectedRowId={selectedFile?.id}
              emptyMessage="No files available"
            />
          ) : (
            <GridLayout
              columns={fileColumns}
              height="500px"
              data={[]}
              hidePagination={false}
              onRowClick={handleFileSelect}
              selectedRowId={null}
              emptyMessage="No files available"
            />
          )}
        </div>
      </div>

      {/* File Tags Information */}
      {showInstrumentTags && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">{t("instrumentlocktag.filetagsinformation")}</h3>
          <InfoBox data={formattedFileTags} />
        </div>
      )}

      {/* File Raw Data Viewer */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">{t("instrumentlocktag.filerawdata")}</h3>
        <div className="bg-white min-h-[200px]">
          <FileViewer src={fileViewerSrc} />
        </div>
      </div>

      {/* Parsed Data */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">{t("instrumentlocktag.parseddata")}</h3>
        <InfoBox data={formattedParsedData} fixedHeight={true} />
      </div>
    </div>
  );
}