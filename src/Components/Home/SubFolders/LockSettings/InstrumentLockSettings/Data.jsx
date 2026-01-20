import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, FileText } from "lucide-react";

// Components
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../Layout/Common/Errordialog";

// Services
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";

/* ------------------ HELPER COMPONENTS ------------------ */

const InfoBox = ({ data, className = "", title, showEmptyMessage = true }) => (
  <div className={`border border-gray-300 bg-white min-h-[100px] p-1 ${className}`}>
    {data.length === 0 ? (
      showEmptyMessage ? (
        <div className="text-gray-400 italic text-sm text-center py-4">
          No data available
        </div>
      ) : (
        <div></div>
      )
    ) : (
      <div className="p-0">
        {data.map((d, i) => (
          <div key={i} className="flex">
            <label className="w-[45%] text-xs font-bold font-roboto text-[#070707] truncate">
              {d.Category || d.label}:
            </label>
            <span className="w-[55%] text-sm font-bold font-['helvetica']  text-[#162ddc] truncate">
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
    <div className="bg-white min-h-[200px]">
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
        <div></div>
      )}
    </div>
  );
};

const PrimaryButton = ({ icon: Icon, label, disabled, onClick, className = "", variant = "primary", loading = false }) => {
  const baseStyles = "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function InstrumentDataPage() {
  const { t } = useTranslation();
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
  const [supportedExtensions, setSupportedExtensions] = useState([]);
  const [oldRawDataID, setOldRawDataID] = useState(" ");
  const [newRawDataID, setNewRawDataID] = useState("");
  const [nullDataRawId, setNullDataRawId] = useState("");
  const [mergeDataContent, setMergeDataContent] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [fileTags, setFileTags] = useState([]);
  const [instrumentTags, setInstrumentTags] = useState([]);
  const [mergedFiles, setMergedFiles] = useState([]);
  const [fileInformation, setFileInformation] = useState([]);
  const [nullData, setNullData] = useState([]);
  
  const [isLoading, setIsLoading] = useState({
    template: false,
    instruments: false,
    instrumentTags: false,
    mergedFiles: false,
    fileInformation: false,
    nullData: false,
    mergeData: false,
    fileData: false,
    fileViewer: false,
    fileTags: false,
    parsedData: false
  });
  
  const [featureStatus, setFeatureStatus] = useState(false);
  const [showInstrumentTags, setShowInstrumentTags] = useState(true);
  
  const [infoDialog, setInfoDialog] = useState({
    open: false,
    message: "",
    type: "information"
  });

  // New state for auto-loaded data
  const [autoSelectedFile, setAutoSelectedFile] = useState(null);
  const [autoSelectedMergeRow, setAutoSelectedMergeRow] = useState(null);
  const [autoLoadedMergeData, setAutoLoadedMergeData] = useState("");
  const [autoLoadedFileTags, setAutoLoadedFileTags] = useState([]);
  const [autoLoadedParsedData, setAutoLoadedParsedData] = useState([]);

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

  // Function to make API call with proper formatting
  const makeAPICall = async (url, passObjDet) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { ...passObjDet, ...userDetailsData };
    
    console.log(`Making API call to ${url}:`, reqObj);
    
    const response = await postData(url, reqObj);
    console.log(`Response from ${url}:`, response);
    
    return response;
  };

  // 1. Fetch Template Validation on component mount
  useEffect(() => {
    const loadTemplateValidation = async () => {
      console.log("Loading template validation...");
      setIsLoading(prev => ({ ...prev, template: true }));
      try {
        const data = await makeAPICall("InstrumentLock/ValidatingTemplateTobeLoad", {});
        
        if (data && Array.isArray(data) && data.length > 0) {
          const status = data[0]?.L67Status ?? false;
          console.log("Feature status (L67Status):", status);
          setFeatureStatus(status);
          setShowInstrumentTags(!status);
          
          // Set file extensions if provided
          if (data[1]?.sFileExtensionList) {
            const extensionList = data[1].sFileExtensionList.split(",").map(ext => ext.trim().toLowerCase());
            setSupportedExtensions(extensionList);
            console.log("Supported extensions:", extensionList);
          } else {
            // Default extensions
            setSupportedExtensions(["pdf", "txt", "csv", "xlsx", "xls", "jpg", "jpeg", "png"]);
          }
          
          // Load instruments after template validation
          await loadInstruments(status);
        } else {
          console.warn("No template validation data received");
          showInfoDialog(t("instrumentlocktag.noinstrumentsfound") || "No instruments found", "information");
        }
      } catch (error) {
        console.error("Error loading template validation:", error);
        showInfoDialog("Failed to load template validation", "information");
      } finally {
        setIsLoading(prev => ({ ...prev, template: false }));
      }
    };
    
    loadTemplateValidation();
  }, [postData, showInfoDialog, t]);

  // Load instruments
  const loadInstruments = async (featureStatus) => {
    console.log("Loading instruments with featureStatus:", featureStatus);
    setIsLoading(prev => ({ ...prev, instruments: true }));
    try {
      const userDetailsData = CF_activeUserdetails();
      const reqObj = { 
        sFeature: featureStatus,
        ...userDetailsData 
      };
      
      const instrumentsData = await postData("InstrumentLock/LoadInterfaceLockInstrumentNameCombo", reqObj);
      console.log("Instruments response:", instrumentsData);
      
      if (instrumentsData && Array.isArray(instrumentsData)) {
        const formattedInstruments = instrumentsData.map(inst => ({
          value: inst.nInterInstrumentID?.toString() || "",
          label: inst.sInstrumentAliasName || "Unknown Instrument",
          originalItem: inst
        }));
        console.log("Formatted instruments:", formattedInstruments);
        setInstruments(formattedInstruments);
        
        // Auto-select first instrument
        if (formattedInstruments.length > 0) {
          const firstInstrument = formattedInstruments[0];
          console.log("Auto-selecting instrument:", firstInstrument);
          setInstrument(firstInstrument.value);
          setSelectedInstrument(firstInstrument.originalItem);
          
          await loadInstrumentData({
            value: firstInstrument.value,
            originalItem: firstInstrument.originalItem
          });
        }
      } else {
        console.warn("No instruments data received");
        showInfoDialog(t("instrumentlocktag.noinstrumentsfound") || "No instruments found", "information");
      }
    } catch (error) {
      console.error("Error loading instruments:", error);
      showInfoDialog("Failed to load instruments", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, instruments: false }));
    }
  };

  const loadInstrumentData = useCallback(async (instrumentData) => {
    console.log("Loading data for instrument:", instrumentData);
    
    try {
      // 1. Load instrument tags (if feature is not enabled)
      if (showInstrumentTags && instrumentData.originalItem?.sInstrumentID) {
        console.log("Loading instrument tags for:", instrumentData.originalItem.sInstrumentID);
        setIsLoading(prev => ({ ...prev, instrumentTags: true }));
        try {
          const passObjDet = {
            passObjDet: {
              sSiteCode: CF_activeUserdetails().sSiteCode,
              sInstrumentID: instrumentData.originalItem.sInstrumentID
            }
          };
          
          const tags = await makeAPICall("InstrumentLock/CurrentLockInstrumentTagInfo", passObjDet);
          
          if (tags && Array.isArray(tags)) {
            setInstrumentTags(tags);
            console.log("Instrument tags set:", tags.length, "items");
          }
        } catch (error) {
          console.error("Error loading instrument tags:", error);
        } finally {
          setIsLoading(prev => ({ ...prev, instrumentTags: false }));
        }
      }

      // 2. Load merged files
      if (instrumentData.value && instrumentData.originalItem?.sLockID) {
        console.log("Loading merged files");
        setIsLoading(prev => ({ ...prev, mergedFiles: true }));
        try {
          const instrumentId = parseInt(instrumentData.value);
          const passObjDet = {
            sInstrumentID: instrumentId,
            sLockID: instrumentData.originalItem.sLockID
          };
          
          console.log("Merged files request:", passObjDet);
          const mergedFilesData = await makeAPICall("InstrumentLock/LoadMergeFileDetails", passObjDet);
          
          if (mergedFilesData && Array.isArray(mergedFilesData)) {
            setMergedFiles(mergedFilesData);
            console.log("Merged files set:", mergedFilesData.length, "items");
            
            // AUTO-SELECT FIRST MERGE ROW
            if (mergedFilesData.length > 0) {
              const firstMergeRow = mergedFilesData[0];
              console.log("Auto-selecting first merge row:", firstMergeRow);
              setAutoSelectedMergeRow(firstMergeRow);
              setSelectedMergeRow(firstMergeRow);
              
              // Load merge data for the first row
              await loadMergeFileData(firstMergeRow, true);
            }
          } else {
            setMergedFiles([]);
            setAutoSelectedMergeRow(null);
            setSelectedMergeRow(null);
            setAutoLoadedMergeData("");
          }
        } catch (error) {
          console.error("Error loading merged files:", error);
          showInfoDialog("Failed to load merged files", "information");
          setMergedFiles([]);
          setAutoSelectedMergeRow(null);
          setSelectedMergeRow(null);
          setAutoLoadedMergeData("");
        } finally {
          setIsLoading(prev => ({ ...prev, mergedFiles: false }));
        }
      }

      // 3. Load file information
      if (instrumentData.originalItem?.sInstrumentID && instrumentData.originalItem?.sTaskID) {
        console.log("Loading file information");
        setIsLoading(prev => ({ ...prev, fileInformation: true }));
        try {
          const passObjDet = {
            sInstrumentID: instrumentData.originalItem.sInstrumentID,
            sTaskID: instrumentData.originalItem.sTaskID
          };
          
          const fileInfoData = await makeAPICall("InstrumentLock/InstrumentCaptureTagData", passObjDet);
          
          if (fileInfoData && Array.isArray(fileInfoData)) {
            setFileInformation(fileInfoData);
            console.log("File information set:", fileInfoData.length, "items");
            
            // AUTO-SELECT FIRST FILE
            if (fileInfoData.length > 0) {
              const firstFile = fileInfoData[0];
              console.log("Auto-selecting first file:", firstFile);
              setAutoSelectedFile(firstFile);
              setSelectedFile(firstFile);
              
              // Load file data for the first file
              await loadFileData(firstFile, true);
            }
          } else {
            setFileInformation([]);
            setAutoSelectedFile(null);
            setSelectedFile(null);
            setAutoLoadedFileTags([]);
            setAutoLoadedParsedData([]);
          }
        } catch (error) {
          console.error("Error loading file information:", error);
          setFileInformation([]);
          setAutoSelectedFile(null);
          setSelectedFile(null);
          setAutoLoadedFileTags([]);
          setAutoLoadedParsedData([]);
        } finally {
          setIsLoading(prev => ({ ...prev, fileInformation: false }));
        }
      }

    } catch (error) {
      console.error("Error loading instrument data:", error);
      showInfoDialog("Failed to load instrument data", "information");
    }
  }, [postData, showInstrumentTags, showInfoDialog]);

  // Function to load merge file data (reusable)
  const loadMergeFileData = async (row, isAutoLoad = false) => {
    console.log("Loading merge file data for row:", row);
    setIsLoading(prev => ({ ...prev, mergeData: true }));
    
    try {
      const passObjDet = {
        nRawData: row.sRawDataID,
        LockID: row.sLockID,
        nSequenceNo: row.nSequenceNo,
        nMergeFileCount: row.nMergeFileCount,
        nInstrumentID: row.nInstrumentID
      };
      
      console.log("Merge file data request:", passObjDet);
      const response = await makeAPICall("InstrumentLock/MergeFileDatas", passObjDet);
      
      console.log("Merge file data response:", response);
      
      if (response) {
        if (response.NullDataStatus === "Created") {
          showInfoDialog(
            (response.CreatedList || "") + " " + (response.Message || ""), 
            "information"
          );
          setNullDataRawId(response.CreatedList || "");
          
          if (isAutoLoad) {
            setAutoLoadedMergeData("");
          } else {
            setMergeDataContent("");
          }
        } else {
          let mergeContent = "";
          if (response.MergeData) {
            try {
              // Decode base64 (matching jQuery atob logic)
              mergeContent = atob(response.MergeData);
              console.log("Decoded merge data:", mergeContent);
            } catch (error) {
              console.error("Error decoding merge data:", error);
              mergeContent = response.MergeData;
            }
          } else if (response.InstData && Array.isArray(response.InstData)) {
            // If InstData array exists, decode each item
            const decodedData = response.InstData.map(item => {
              if (item.sInstrumentData) {
                try {
                  return atob(item.sInstrumentData);
                } catch (e) {
                  return item.sInstrumentData;
                }
              }
              return item;
            });
            mergeContent = decodedData.join('\n');
          }
          
          console.log("Final merge content:", mergeContent);
          
          // Handle old/new raw data ID comparison (matching jQuery logic)
          if (oldRawDataID === row.sRawDataID || oldRawDataID === " ") {
            setOldRawDataID(row.sRawDataID);
            if (isAutoLoad) {
              if (!autoLoadedMergeData) {
                setAutoLoadedMergeData(mergeContent);
              }
            } else {
              if (!mergeDataContent) {
                setMergeDataContent(mergeContent);
              }
            }
          } else {
            setOldRawDataID(row.sRawDataID);
            if (isAutoLoad) {
              setAutoLoadedMergeData(mergeContent);
            } else {
              setMergeDataContent(mergeContent);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading merge file data:", error);
      showInfoDialog("Failed to load merge file data", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, mergeData: false }));
    }
  };

  // Function to load file data (reusable)
  const loadFileData = async (file, isAutoLoad = false) => {
    console.log("Loading file data for:", file);
    
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
          showInfoDialog(viewerResponse.Message || "Failed to load file", "information");
        } else if (viewerResponse.Rtn?.toLowerCase() === "success" && viewerResponse.ServerDataViewURL) {
          console.log("File viewer URL received:", viewerResponse.ServerDataViewURL);
          
          // Decrypt the URL if needed (matching jQuery logic)
          let urlPath = viewerResponse.ServerDataViewURL;
          
          // Check if it's a supported file type
          const lastDotIndex = urlPath.lastIndexOf('.');
          const fileExtension = lastDotIndex !== -1 ? urlPath.substring(lastDotIndex + 1).toLowerCase() : '';
          
          if (supportedExtensions.includes(fileExtension)) {
            setFileViewerSrc(`${urlPath}#toolbar=0&navpanes=0`);
          } else {
            // If not supported, hide the iframe (matching jQuery logic)
            setFileViewerSrc("");
            showInfoDialog("File format not supported for preview", "information");
          }
        }
      }
    } catch (error) {
      console.error("Error loading file viewer:", error);
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
        if (isAutoLoad) {
          setAutoLoadedFileTags(tagsResponse);
        } else {
          setFileTags(tagsResponse);
        }
      } else {
        if (isAutoLoad) {
          setAutoLoadedFileTags([]);
        } else {
          setFileTags([]);
        }
      }
    } catch (error) {
      console.error("Error loading file tags:", error);
      if (isAutoLoad) {
        setAutoLoadedFileTags([]);
      } else {
        setFileTags([]);
      }
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
        if (isAutoLoad) {
          setAutoLoadedParsedData(parsedResponse);
        } else {
          setParsedData(parsedResponse);
        }
      } else {
        if (isAutoLoad) {
          setAutoLoadedParsedData([]);
        } else {
          setParsedData([]);
        }
      }
    } catch (error) {
      console.error("Error loading parsed data:", error);
      if (isAutoLoad) {
        setAutoLoadedParsedData([]);
      } else {
        setParsedData([]);
      }
    } finally {
      setIsLoading(prev => ({ ...prev, parsedData: false }));
    }
  };

  const handleRefreshMergedFiles = useCallback(async () => {
    if (!selectedInstrument || !instrument) {
      showInfoDialog("Please select an instrument first", "information");
      return;
    }
    
    console.log("Refreshing merged files");
    setIsLoading(prev => ({ ...prev, mergedFiles: true }));
    try {
      const passObjDet = {
        sInstrumentID: parseInt(instrument),
        sLockID: selectedInstrument.sLockID
      };
      
      const mergedFilesData = await makeAPICall("InstrumentLock/LoadMergeFileDetails", passObjDet);
      
      if (mergedFilesData && Array.isArray(mergedFilesData)) {
        setMergedFiles(mergedFilesData);
        
        // AUTO-SELECT FIRST MERGE ROW AFTER REFRESH
        if (mergedFilesData.length > 0) {
          const firstMergeRow = mergedFilesData[0];
          console.log("Auto-selecting first merge row after refresh:", firstMergeRow);
          setAutoSelectedMergeRow(firstMergeRow);
          setSelectedMergeRow(firstMergeRow);
          
          // Load merge data for the first row
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
    } catch (error) {
      console.error("Error refreshing merged files:", error);
      showInfoDialog("Failed to refresh data", "information");
      setMergedFiles([]);
      setAutoSelectedMergeRow(null);
      setSelectedMergeRow(null);
      setAutoLoadedMergeData("");
    } finally {
      setIsLoading(prev => ({ ...prev, mergedFiles: false }));
    }
  }, [selectedInstrument, instrument, postData, showInfoDialog, loadMergeFileData]);

  const handleInstrumentChange = useCallback(async (value) => {
    console.log("Instrument changed to:", value);
    setInstrument(value);
    const selectedInst = instruments.find(inst => inst.value === value);
    console.log("Selected instrument:", selectedInst);
    setSelectedInstrument(selectedInst?.originalItem || null);
    setSelectedFile(null);
    setSelectedMergeRow(null);
    setSelectedNullRow(null);
    setFileViewerSrc("");
    setMergeDataContent("");
    setParsedData([]);
    setFileTags([]);
    setNewRawDataID("");
    setOldRawDataID(" ");
    setNullDataRawId("");
    setInstrumentTags([]);
    setMergedFiles([]);
    setFileInformation([]);
    setNullData([]);
    
    // Reset auto-loaded data
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
  }, [instruments, loadInstrumentData]);

  // Load null data when tab changes to "null"
  useEffect(() => {
    const loadNullData = async () => {
      if (tab === "null" && selectedInstrument?.nInterInstrumentID && selectedInstrument?.sLockID) {
        console.log("Loading null data");
        setIsLoading(prev => ({ ...prev, nullData: true }));
        try {
          const passObjDet = {
            nInterfaceInstID: selectedInstrument.nInterInstrumentID,
            sLockID: selectedInstrument.sLockID
          };
          
          const nullDataResponse = await makeAPICall("InstrumentLock/FetchNullDataBasedOnInstrument", passObjDet);
          
          if (nullDataResponse && Array.isArray(nullDataResponse)) {
            setNullData(nullDataResponse);
            console.log("Null data set:", nullDataResponse.length, "items");
          }
        } catch (error) {
          console.error("Error loading null data:", error);
          showInfoDialog("Failed to load null data", "information");
        } finally {
          setIsLoading(prev => ({ ...prev, nullData: false }));
        }
      }
    };

    loadNullData();
  }, [tab, selectedInstrument, postData, showInfoDialog]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file) => {
    console.log("File selected:", file);
    setSelectedFile(file);
    await loadFileData(file, false);
  }, [postData, showInfoDialog, supportedExtensions]);

  // Handle merge row selection
  const handleMergeRowSelect = useCallback(async (row) => {
    console.log("Merge row selection started:", row);
    setSelectedMergeRow(row);
    setNewRawDataID(row.sRawDataID);
    await loadMergeFileData(row, false);
  }, [postData, oldRawDataID, mergeDataContent, showInfoDialog]);

  // Handle null data row selection
  const handleNullRowSelect = useCallback((row) => {
    console.log("Null row selected:", row);
    setSelectedNullRow(row);
  }, []);

  const handleRefreshFileInfo = useCallback(async () => {
    if (!selectedInstrument) {
      showInfoDialog("Please select an instrument first", "information");
      return;
    }
    
    console.log("Refreshing file info");
    setIsLoading(prev => ({ ...prev, fileInformation: true }));
    try {
      const passObjDet = {
        sInstrumentID: selectedInstrument.sInstrumentID,
        sTaskID: selectedInstrument.sTaskID
      };
      
      const fileInfoData = await makeAPICall("InstrumentLock/InstrumentCaptureTagData", passObjDet);
      
      if (fileInfoData && Array.isArray(fileInfoData)) {
        setFileInformation(fileInfoData);
        
        // AUTO-SELECT FIRST FILE AFTER REFRESH
        if (fileInfoData.length > 0) {
          const firstFile = fileInfoData[0];
          console.log("Auto-selecting first file after refresh:", firstFile);
          setAutoSelectedFile(firstFile);
          setSelectedFile(firstFile);
          
          // Load file data for the first file
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
    } catch (error) {
      console.error("Error refreshing file information:", error);
      showInfoDialog("Failed to refresh data", "information");
      setFileInformation([]);
      setAutoSelectedFile(null);
      setSelectedFile(null);
      setAutoLoadedFileTags([]);
      setAutoLoadedParsedData([]);
    } finally {
      setIsLoading(prev => ({ ...prev, fileInformation: false }));
    }
  }, [selectedInstrument, postData, showInfoDialog, loadFileData]);

  const handleRefreshNullData = useCallback(async () => {
    if (!selectedInstrument) {
      showInfoDialog("Please select an instrument first", "information");
      return;
    }
    
    console.log("Refreshing null data");
    setIsLoading(prev => ({ ...prev, nullData: true }));
    try {
      const passObjDet = {
        nInterfaceInstID: selectedInstrument.nInterInstrumentID,
        sLockID: selectedInstrument.sLockID
      };
      
      const nullDataResponse = await makeAPICall("InstrumentLock/FetchNullDataBasedOnInstrument", passObjDet);
      
      if (nullDataResponse && Array.isArray(nullDataResponse)) {
        setNullData(nullDataResponse);
      }
    } catch (error) {
      console.error("Error refreshing null data:", error);
      showInfoDialog("Failed to refresh data", "information");
    } finally {
      setIsLoading(prev => ({ ...prev, nullData: false }));
    }
  }, [selectedInstrument, postData, showInfoDialog]);

  // Handle null data acknowledgement
  const handleNullDataAcknowledgement = useCallback(async () => {
    if (!selectedNullRow) {
      showInfoDialog(t("instrumentlocktag.norecordsfound") || "No Records Found", "information");
      return;
    }
    
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
      
    } catch (error) {
      console.error("Error acknowledging null data:", error);
      showInfoDialog("Failed to acknowledge null data", "information");
    }
  }, [postData, selectedNullRow, showInfoDialog, t, handleRefreshNullData]);

  // Handle tab change
  const handleTabChange = useCallback((newTab) => {
    console.log("Tab changed to:", newTab);
    setTab(newTab);
    setSelectedNullRow(null);
  }, []);

  // Format parsed data for InfoBox
  const formattedParsedData = useMemo(() => {
    const dataToUse = parsedData.length > 0 ? parsedData : autoLoadedParsedData;
    return (dataToUse || []).map(item => {
      let fieldName = item.FieldName || "";
      const bracketMatch = fieldName.match(/\[([^\]]+)\]/);
      if (bracketMatch) {
        fieldName = bracketMatch[1];
      } else {
        const splitField = fieldName.split("]");
        if (splitField.length > 1) {
          fieldName = splitField[1];
        }
      }
      
      return {
        Category: fieldName,
        Value: item.FieldValue || ""
      };
    });
  }, [parsedData, autoLoadedParsedData]);

  // Format file tags for InfoBox
  const formattedFileTags = useMemo(() => {
    const tagsToUse = fileTags.length > 0 ? fileTags : autoLoadedFileTags;
    return (tagsToUse || []).map(tag => ({
      Category: tag.Category || "",
      Value: tag.Value || ""
    }));
  }, [fileTags, autoLoadedFileTags]);

  // Format instrument tags for InfoBox
  const formattedInstrumentTags = useMemo(() => {
    return (instrumentTags || []).map(tag => ({
      Category: tag.Category || "",
      Value: tag.Value || ""
    }));
  }, [instrumentTags]);

  // Determine which merge data to display
  const displayedMergeData = useMemo(() => {
    return mergeDataContent || autoLoadedMergeData;
  }, [mergeDataContent, autoLoadedMergeData]);

  // Column definitions with Verdana font and 12px size - MATCHING JQUERY
  const mergeColumns = useMemo(() => [
    {
      key: 'sRawDataID',
      label: t("instrumentlocktag.rawdataid") || 'Raw Data ID',
      width: "40%",
      enableSearch: true,
      render: (row, isSelected) => {
        // Check if this is the auto-selected row
        const isAutoSelected = autoSelectedMergeRow && autoSelectedMergeRow.sRawDataID === row.sRawDataID;
        return (
          <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected || isAutoSelected ? 'font-bold' : 'font-normal'}`}>
            {row.sRawDataID}
          </span>
        );
      }
    },
    {
      key: 'nSequenceNo',
      label: t("instrumentlocktag.sequenceno") || 'Sequence No',
      width: "40%",
      enableSearch: true,
      render: (row, isSelected) => {
        const isAutoSelected = autoSelectedMergeRow && autoSelectedMergeRow.sRawDataID === row.sRawDataID;
        return (
          <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected || isAutoSelected ? 'font-bold' : 'font-normal'}`}>
            {row.nSequenceNo}
          </span>
        );
      }
    },
    {
      key: 'nMergeFileCount',
      label: t("instrumentlocktag.mergefilecount") || 'Merge File Count',
      width: "20%",
      enableSearch: true,
      render: (row, isSelected) => {
        const isAutoSelected = autoSelectedMergeRow && autoSelectedMergeRow.sRawDataID === row.sRawDataID;
        return (
          <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected || isAutoSelected ? 'font-bold' : 'font-normal'}`}>
            {row.nMergeFileCount}
          </span>
        );
      }
    }
  ], [t, autoSelectedMergeRow]);

  const nullDataColumns = useMemo(() => [
    {
      key: 'sRawDataID',
      label: t("instrumentlocktag.rawdataid") || 'Raw Data ID',
      width: "25%",
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row.sRawDataID}
        </span>
      )
    },
    {
      key: 'nSequenceNo',
      label: t("instrumentlocktag.sequenceno") || 'Sequence No',
      width: "15%",
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row.nSequenceNo}
        </span>
      )
    },
    {
      key: 'nMergeFileCount',
      label: t("instrumentlocktag.mergefilecount") || 'Merge File Count',
      width: "15%",
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row.nMergeFileCount}
        </span>
      )
    },
    {
      key: 'sLockID',
      label: t("instrumentlocktag.lockid") || 'Lock ID',
      width: "25%",
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row.sLockID}
        </span>
      )
    },
    {
      key: 'nInstrumentID',
      label: t("instrumentlocktag.instrumentid") || 'Instrument ID',
      width: "20%",
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row.nInstrumentID}
        </span>
      )
    }
  ], [t]);

  const fileColumns = useMemo(() => [
  {
    key: 'File Name',
    label: t("instrumentlocktag.filename") || 'File Name',
    width: "40%",
    enableSearch: true,
    render: (row, isSelected) => {
      const fileName = row["ActualFileName"] || row["File Name"] || "";
      const createdOn = row["Created On"] || "";
      // REMOVE the isAutoSelected check - only use isSelected
      return (
        <div className="flex flex-col">
          <div className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'} truncate`}>
            {fileName}  
          
              {createdOn}
            </div>
       
        </div>
      );
    }
  },
  {
    key: 'Upload Status',
    label: t("instrumentlocktag.uploadstatus") || 'Upload Status',
    width: "20%",
    render: (row) => {
      const status = row["Upload Status"]?.trim() || "";
      const statusLower = status.toLowerCase();

      // Use CHECK ICONS with different colors (not dots)
      if (statusLower.includes("uploaded") || statusLower.includes("success")) {
        return (
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      } else if (statusLower.includes("queue")) {
        return (
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 font-bold text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      } else if (statusLower.includes("failed") || statusLower.includes("error")) {
        return (
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      } else {
        // For other statuses, show check icon in gray
        return (
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      }
    }
  },
  {
    key: 'Client Name',
    label: t("label.clientName") || 'Client Name',
    width: "40%",
    enableSearch: true,
    render: (row, isSelected) => {
      // REMOVE the isAutoSelected check - only use isSelected
      return (
        <div className={`text-[12px] text-[#373737] font-['verdana'] ${isSelected ? 'font-bold' : 'font-normal'}`}>
          {row["Client Name"]}
        </div>
      );
    }
  }
], [t]); 
  // Format data for grids
  const mergeRows = useMemo(() => {
    return (mergedFiles || []).map((item, index) => ({ 
      ...item, 
      id: item.sRawDataID || `merge-${index}`,
    }));
  }, [mergedFiles]);

  const nullRows = useMemo(() => {
    return (nullData || []).map((item, index) => ({ 
      ...item, 
      id: item.sRawDataID || `null-${index}`,
    }));
  }, [nullData]);

  const files = useMemo(() => {
    return (fileInformation || []).map((item, index) => ({ 
      ...item, 
      id: item.Reference || `file-${index}`,
    }));
  }, [fileInformation]);

  return (
    <div className="px-4 font-roboto flex flex-col space-y-2">
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

      {/* Instrument Tag Information - Show/Hide based on feature status (matching jQuery) */}
      {showInstrumentTags && (
        <div className="mb-0">
          <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">
            {t("instrumentlocktag.instrumenttagsinformation")}
          </h3>
          <InfoBox 
            data={formattedInstrumentTags} 
            showEmptyMessage={false}
          />
        </div>
      )}

      {/* Latest Merged File Information */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-[#4a6fa5]">
            {t("instrumentlocktag.latestmergedfileinformation")}
          </h3>
          <div className="flex gap-6">
            <button
              className={`text-xs font-bold pb-1 transition-colors ${
                tab === "merge"
                  ? "text-[#0049b0] text-sm border-b-2 border-[#2883fe] tabSelectedFocus"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange("merge")}
            >
              {t("instrumentlocktag.mergedata")}
            </button>
            <button
              className={`text-xs font-bold pb-1 transition-colors ${
                tab === "null"
                  ? "text-[#0049b0] text-sm border-b-2 border-[#2883fe] tabSelectedFocus"
                  : "text-gray-600 hover:text-gray-800"
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
                onClick={handleRefreshMergedFiles}
                disabled={!selectedInstrument || isLoading.mergedFiles}
                loading={isLoading.mergedFiles}
              />
            </div>
            <div className="w-full overflow-hidden">
              <GridLayout
                columns={mergeColumns}
                data={mergeRows}
                hidePagination={false}
                height="400px"
                onRowClick={handleMergeRowSelect}
                selectedRowId={selectedMergeRow?.id}
                emptyMessage={selectedInstrument ? "No merged files available" : "Select an instrument to load data"}
              />
            </div>
            
            {/* Merge File Raw Data Display */}
              <div className="mt-4">
                <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">
                  {t("instrumentlocktag.mergedfilerawdata")}
                </h3>
                <div className="border border-gray-300 bg-white min-h-[200px] p-1 overflow-auto max-h-[300px]">
                  <pre className="text-sm font-['helvetica'] m-0 p-0 whitespace-pre-wrap break-words">
                    {displayedMergeData || "No merge data available"}
                  </pre>
                </div>
              </div>
            
          </>
        ) : (
          <>
            <div className="flex justify-end mb-2 gap-2">
              <PrimaryButton 
                label={t("instrumentlocktag.proceedacknowledgement")}
                onClick={handleNullDataAcknowledgement}
                variant="primary"
                disabled={!selectedNullRow}
              />
              <PrimaryButton 
                icon={RefreshCw}
                label={t("button.refresh")}
                onClick={handleRefreshNullData}
                disabled={!selectedInstrument || isLoading.nullData}
                loading={isLoading.nullData}
              />
            </div>
            <div className="w-full overflow-hidden">
              <GridLayout
                columns={nullDataColumns}
                data={nullRows}
                hidePagination={false}
                height="400px"
                onRowClick={handleNullRowSelect}
                selectedRowId={selectedNullRow?.id}
                emptyMessage={selectedInstrument ? "No null data available" : "Select an instrument to load data"}
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
            onClick={handleRefreshFileInfo}
            disabled={!selectedInstrument || isLoading.fileInformation}
            loading={isLoading.fileInformation}
          />
        </div>
        <div className="w-full overflow-hidden">
          {isLoading.fileInformation ? (
            <div className="p-4 text-center text-gray-500 bg-white flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading file information...
            </div>
          ) : files.length > 0 ? (
            <GridLayout
              columns={fileColumns}
              height="500px"
              data={files}
              hidePagination={false}
              onRowClick={handleFileSelect}
              selectedRowId={selectedFile?.id}
            />
          ) : (
            <div className="p-4 text-center text-gray-500 bg-white">
              {selectedInstrument ? "No files available" : "Select an instrument to load data"}
            </div>
          )}
        </div>
      </div>

      {/* File Tags Information - Show/Hide based on feature status (matching jQuery) */}
      {showInstrumentTags && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">
            {t("instrumentlocktag.filetagsinformation")}
          </h3>
          <InfoBox 
            data={formattedFileTags} 
            showEmptyMessage={false}
          />
        </div>
      )}

      {/* File Raw Data Viewer */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">
          {t("instrumentlocktag.filerawdata")}
        </h3>
        <div className="bg-white min-h-[200px]">
            <iframe
              src={fileViewerSrc}
              className="w-full h-[200px] border-none"
              title="File Viewer"
              sandbox="allow-same-origin"
            />
        
        </div>
      </div>

      {/* Parsed Data */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[#4a6fa5] mb-2">
          {t("instrumentlocktag.parseddata")}
        </h3>
        <InfoBox 
          data={formattedParsedData} 
          showEmptyMessage={false}
        />
      </div>
    </div>
  );
}