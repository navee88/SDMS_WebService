import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import GridLayout from './GridLayout'; // Adjust path if needed
import { 
  FaLink, FaFileExport, FaFileAlt, FaImage, FaMusic, FaFilm, 
  FaChevronUp, FaChevronDown, FaExpand, FaTimes, FaExclamationTriangle,FaArrowLeft,FaFilePdf 
} from "react-icons/fa";
import { Loader2 } from "lucide-react";
// 1. IMPORT THE SEPARATED TREE COMPONENT
import ServerDataTree from '../../../../Home/SubFolders/FTPDataView/ServerData/ServerDataTree'; 

// 2. IMPORT THE API HOOK
import { useServerDataApi } from '../../../../Home/SubFolders/FTPDataView/ServerData/useServerDataApi'; // Adjust path to where your hook is located
import { TreegridMapping } from '../../../../Home/SubFolders/FTPDataView/ServerData/TreegridMapping';

import { useFileViewerStore } from '../../../../Home/SubFolders/FTPDataView/ServerData/useFileViewerStore'; // Adjust path
import { useFileDetailsStore } from '../../../../Home/SubFolders/FTPDataView/ServerData/useFileDetailsStore'; // <--- NEW IMPORT

// --- Custom Hooks ---
function useLatest(value) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

function useEventListener(eventName, handler, element = window) {
  const savedHandler = useLatest(handler);

  useEffect(() => {
    const targetElement = element?.current || element;
    if (!targetElement?.addEventListener) return;

    const eventListener = (event) => savedHandler.current(event);
    targetElement.addEventListener(eventName, eventListener);

    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// --- Helper Component: InfoRow ---
const DetailRow = ({ label, value, customValue }) => {
  // Logic: Use customValue (JSX) if present, otherwise check for boolean, otherwise show value or "-"
  let content = value;
  
  if (customValue) {
    content = customValue;
  } else if (typeof value === 'boolean') {
    content = value ? "Yes" : "No";
  } else if (!value && value !== 0) {
    content = ""; // Show dash for empty strings
  }

  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <div className="font-bold text-[12px] text-[#405F7D] font-roboto flex items-center">
        {label}
      </div>
      <div className="font-bold text-[12px] text-[#353f49] font-roboto break-words flex items-center">
        {content}
      </div>
    </div>
  );
};

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-[1px]">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      <span className="text-xs font-semibold text-blue-600">Loading Data...</span>
    </div>
  </div>
);


const getCleanUrl = (url) => {
  if (!url) return "";
  return url.replace(/\\/g, '/').replace(/\s/g, '%20');
};

// --- Main Component ---
const FileDetailPanel = ({
  selectedFile,
  fileInfoData = [],
  apiFilterParams,
  tagsColumns = [],
  parsedDataColumns = [],
  apiCallbacks = {
    onFileView: null,      
    onGetTags: null,       
    onGetMultiFields: null 
  }
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [tagsHeightPercent, setTagsHeightPercent] = useState(50);
  const [lastOpenPercent, setLastOpenPercent] = useState(50);
  const [isResizingTags, setIsResizingTags] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const tagsContainerRef = useRef(null);

  const [blobUrl, setBlobUrl] = useState(null);
const [isBlobLoading, setIsBlobLoading] = useState(false);

  const tabs = [
    { id: 'info', label: 'File Information' },
    { id: 'viewer', label: 'File Viewer' },
    { id: 'tags', label: 'Tags & Parsed Data' }
  ];

  // const { openServerData, getFileTagsAndParsed, getMultiParsedFields } = useServerDataApi();
  const { viewerState, fetchFileView } = useFileViewerStore();
  
  const { 
    detailsState, 
    fetchTagsAndParsedData, 
    fetchMultiFieldsData,
    resetDetails 
  } = useFileDetailsStore();

  useEffect(() => {
    if (!selectedFile) {
      resetDetails();
    }
  }, [selectedFile, resetDetails]);

  // 1. UPDATED VIEWER EFFECT

  // useEffect(() => {
  //   if (activeTab === 'viewer' && selectedFile) {
  //       const userDetails = { sClientID: apiFilterParams?.sClientID || "" };
  //       fetchFileView(selectedFile, openServerData, userDetails);
  //   }
  // }, [activeTab, selectedFile, openServerData, fetchFileView, apiFilterParams]);

// 1. EFFECT: Trigger the API call to get the file path from the server
useEffect(() => {
  // We watch selectedFile?.RecordNo specifically to ensure it fires on every new selection
  const fileId = selectedFile?.RecordNo || selectedFile?.sRecordNo || selectedFile?.id;
  
  if (activeTab === 'viewer' && fileId && apiCallbacks.onFileView) {
    const userDetails = { sClientID: apiFilterParams?.sClientID || "" };
    fetchFileView(selectedFile, apiCallbacks.onFileView, userDetails);
  }
}, [activeTab, selectedFile?.RecordNo, selectedFile?.sRecordNo, selectedFile?.id]);

// 2. EFFECT: Convert the URL from the server into a local Blob to bypass X-Frame-Options
useEffect(() => {
  let isMounted = true;

  if (activeTab === 'viewer' && viewerState.contentUrl && viewerState.isLoaded) {
    const loadSecureBlob = async () => {
      setIsBlobLoading(true);
      try {
        const cleanUrl = getCleanUrl(viewerState.contentUrl);
        const response = await fetch(cleanUrl);
        const blob = await response.blob();
        const localUrl = URL.createObjectURL(blob);

        if (isMounted) {
          if (blobUrl) URL.revokeObjectURL(blobUrl); // Memory cleanup
          setBlobUrl(localUrl);
        }
      } catch (err) {
        console.error("Blob error:", err);
      } finally {
        if (isMounted) setIsBlobLoading(false);
      }
    };
    loadSecureBlob();
  }

  return () => { isMounted = false; };
}, [viewerState.contentUrl, viewerState.isLoaded]);

  // 2. UPDATED TAGS EFFECT

  // useEffect(() => {
  //   if ((activeTab === 'tags' || activePopup === 'tags' || activePopup === 'parsed') && selectedFile) {
  //      fetchTagsAndParsedData(selectedFile, getFileTagsAndParsed);
  //   }
  // }, [activeTab, activePopup, selectedFile, fetchTagsAndParsedData, getFileTagsAndParsed]);

  useEffect(() => {
    if ((activeTab === 'tags' || activePopup === 'tags' || activePopup === 'parsed') && selectedFile && apiCallbacks.onGetTags) {
       // Use the passed prop function
       fetchTagsAndParsedData(selectedFile, apiCallbacks.onGetTags);
    }
  }, [activeTab, activePopup, selectedFile, fetchTagsAndParsedData, apiCallbacks.onGetTags]);

  // 3. UPDATED MULTI-FIELDS EFFECT

  // useEffect(() => {
  //   if (activePopup === 'multi-fields' && selectedFile) {
  //      fetchMultiFieldsData(selectedFile, getMultiParsedFields);
  //   }
  // }, [activePopup, selectedFile, fetchMultiFieldsData, getMultiParsedFields]);

  useEffect(() => {
    if (activePopup === 'multi-fields' && selectedFile && apiCallbacks.onGetMultiFields) {
       // Use the passed prop function
       fetchMultiFieldsData(selectedFile, apiCallbacks.onGetMultiFields);
    }
  }, [activePopup, selectedFile, fetchMultiFieldsData, apiCallbacks.onGetMultiFields]);

  // --- Resize & Mouse Events ---
  const toggleTagsPanel = (e) => {
    e.stopPropagation();
    if (tagsHeightPercent < 5) { setTagsHeightPercent(lastOpenPercent || 50); } 
    else { setLastOpenPercent(tagsHeightPercent); setTagsHeightPercent(0); }
  };
  const handleMouseMove = (e) => {
    if (!isResizingTags || !tagsContainerRef.current) return;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    const containerRect = tagsContainerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top;
    const totalHeight = containerRect.height;
    let newPercent = (relativeY / totalHeight) * 100;
    if (newPercent < 5) newPercent = 0;
    if (newPercent > 95) newPercent = 100;
    setTagsHeightPercent(Math.max(0, Math.min(100, newPercent)));
  };
  const handleMouseUp = () => {
    if (isResizingTags) { setIsResizingTags(false); document.body.style.cursor = ''; document.body.style.userSelect = ''; }
  };
  useEventListener('mousemove', handleMouseMove, document);
  useEventListener('mouseup', handleMouseUp, document);

  const closePopup = () => { setActivePopup(null); setCanGoBack(false); };

  // --- Renderers ---
  const renderViewerContent = () => { /* ... Same as previous ... */ 
    if (!selectedFile) return (
    <div className="z-0 relative h-full overflow-auto flex flex-col items-center justify-center p-10 select-none">
          <div className="relative w-48 h-48 mb-0 opacity-30 pointer-events-none">
            <FaFileAlt className="absolute top-12 left-10 text-5xl text-blue-600 transform -rotate-12 drop-shadow-sm" />
            <FaImage className="absolute top-11 right-10 text-5xl text-green-600 transform rotate-12 drop-shadow-sm" />
            <FaMusic className="absolute bottom-8 left-10 text-5xl text-purple-600 transform 50 rotate-30 drop-shadow-sm" />
            <FaFilm className="absolute bottom-10 right-10 text-5xl text-red-600 transform rotate-12 drop-shadow-sm" />
          </div>
          <h3 className="text-3xl text-center font-semibold text-gray-400">Files can be viewed here</h3>
        </div>
  );
    if (viewerState.isLoading) return <div className="flex flex-col items-center justify-center h-full gap-2"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
    if (viewerState.fileType === 'error') return <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2"><FaExclamationTriangle className="text-4xl" /><p>{viewerState.errorMsg}</p></div>;
    if (viewerState.fileType === 'image') return <div className="w-full h-full flex items-center justify-center bg-gray-50 overflow-auto"><img src={viewerState.contentUrl} alt="Preview" className="max-w-full max-h-full object-contain" /></div>;

    
// if (viewerState.fileType === 'iframe' || viewerState.fileType === 'office') {
//   const style = viewerState.fileType === 'office' ? { height: 'calc(100% + 70px)', marginTop: '-70px' } : { height: '100%' };

//   return (
//     <div className="w-full h-full overflow-hidden relative">
//       {(viewerState.isLoading || isBlobLoading) ? (
//         <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
//       ) : (
//         <iframe 
//           src={blobUrl ? `${blobUrl}#toolbar=0&navpanes=0` : ""} 
//           className="w-full border-0 absolute inset-0" 
//           style={style} 
//         />
//       )}
//     </div>
//   );
// }


if (viewerState.fileType === 'iframe' || viewerState.fileType === 'office') {
  const style = viewerState.fileType === 'office' ? { height: 'calc(100% + 70px)', marginTop: '-70px' } : { height: '100%' };

  
  const finalUrl = blobUrl ? blobUrl : "";

  return (
    <div className="w-full h-full overflow-hidden relative">
      {(viewerState.isLoading || isBlobLoading) ? (
        <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
      ) : (
        /* Using <object> is often more reliable on tablets than <iframe> */
        <object 
          data={finalUrl} 
          type="application/pdf"
          className="w-full border-0 absolute inset-0" 
          style={style}
        >
          {/* Fallback for tablets that won't render either */}
          <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gray-50">
  <FaFilePdf className="text-5xl text-red-500 mb-3" />
  <p className="mb-4 text-gray-700 font-medium">Mobile Preview Restricted</p>
  
  <div className="flex flex-col gap-3">
    {/* OPTION 1: Open in a new tab (Browsers handle PDFs perfectly when they are the main tab) */}
    <button 
      onClick={() => window.open(finalUrl, '_blank')}
      className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
    >
      View Full Screen
    </button>

    {/* OPTION 2: Keep the download as a secondary choice */}
    <a 
      href={finalUrl} 
      download 
      className="text-sm text-blue-600 underline"
    >
      Or Download for Offline
    </a>
  </div>
</div>
        </object>
      )}
    </div>
  );
}

    return <div className="relative w-32 h-32 mb-6 opacity-30 pointer-events-none"><FaFileAlt className="text-5xl text-gray-500" /></div>;
  };

  const renderPopup = () => {
    if (!activePopup) return null;

    let title = '';
    let content = null;
    let showExport = false;
    let showMultiFieldsLink = false;
    let showBackToParsed = (activePopup === 'multi-fields' && canGoBack); 

    if (activePopup === 'viewer') {
      title = 'File Viewer';
      content = <div className="z-50 relative h-full flex flex-col items-center justify-center bg-gray-50 select-none overflow-hidden"><div className="w-full h-full">{renderViewerContent()}</div></div>;
    } 
    // ----------------------------------------------------------------
    // MULTI-FIELDS RENDERER (Updated for Multiple Tables)
    // ----------------------------------------------------------------
    else if (activePopup === 'multi-fields') {
      title = 'Multi-Fields';
      showExport = true;
      
      const tables = detailsState.multiFieldsTables || []; // Get the array of tables

      content = (
        <div className="z-50 relative flex flex-col flex-1 w-100 min-w-[250px] h-full bg-white">
          {detailsState.isLoadingMulti && <LoadingOverlay />}
          
          <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
            {tables.length > 0 ? (
                tables.map((table, index) => (
                    <div key={table.id || index} className="flex flex-col border border-gray-300 rounded shadow-sm bg-white" style={{ height: '350px' }}>
                        {/* Table Header */}
                        <div className="px-3 py-2 bg-blue-50 border-b border-gray-200 font-bold text-blue-800 text-sm flex items-center">
                            {table.title}
                        </div>
                        {/* Table Grid */}
                        <div className="flex-1 overflow-hidden">
                            <GridLayout
                                columns={table.columns} 
                                data={table.rows}
                                height="100%"
                                hidePagination={false}
                            />
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    {!detailsState.isLoadingMulti && <span>No Multi-Field Data Available</span>}
                </div>
            )}
          </div>
        </div>
      );
    } 
    else {
      const isTags = activePopup === 'tags';
      title = isTags ? 'Tags Details' : 'Parsed Data Details';
      const data = isTags ? (detailsState.tagsData || []) : (detailsState.parsedData || []);
      const columns = isTags ? tagsColumns : parsedDataColumns;
      showMultiFieldsLink = !isTags;
      showExport = !isTags;

      content = (
        <div className="z-50 relative flex flex-col flex-1 w-100 min-w-[250px] h-full bg-white">
          {detailsState.isLoadingTags && <LoadingOverlay />}
          <div className="flex-1 overflow-auto">
            <GridLayout
              key={`popup-grid-${activePopup}`}
              columns={columns}
              data={data}
              height="100%"
              hidePagination={false}
              hideFilterRow={true}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-6xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
            <div className="flex items-center gap-4"><h3 className="text-lg font-bold text-blue-700">{title}</h3></div>
            <div className="flex items-center gap-3">
                 {showBackToParsed && <button onClick={() => setActivePopup('parsed')} className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors mr-2"><FaArrowLeft size={12} /> Back to Parsed Data</button>}
                 {showMultiFieldsLink && <button onClick={() => { setCanGoBack(true); setActivePopup('multi-fields'); }} className="text-sm text-blue-600 font-medium hover:underline">Multi-Fields &raquo;</button>}
                 {showExport && <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-sm border border-blue-100 hover:bg-blue-100 transition-colors font-medium"><FaFileExport /> Export</button>}
                <button onClick={closePopup} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><FaTimes size={18} /></button>
            </div>
          </div>
          <div className="flex-1 p-0 overflow-hidden bg-white w-full flex flex-col relative">{content}</div>
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end shrink-0"><button onClick={closePopup} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 text-sm font-medium">Close</button></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white z-10 min-w-0 w-full relative">
      {renderPopup()}
      {/* ... (Tabs and Main Panel Layout remain the same as previous corrected version) ... */}
      <div className="flex border-b border-gray-200 mb-0 shrink-0 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 text-sm font-semibold transition-colors relative whitespace-nowrap flex-1 ${activeTab === tab.id ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden relative w-full">
        {activeTab === 'info' && (
          <div className="flex flex-col h-full bg-white overflow-y-auto px-4 py-2">
            {fileInfoData.map((item, index) => <DetailRow key={item.id || index} label={item.label} value={item.value} customValue={item.customValue} />)}
            {!selectedFile && <div className="py-8 text-center text-xs text-gray-400 italic mt-2">Select a file to populate details</div>}
          </div>
        )}
        {activeTab === 'viewer' && (
          <div className="h-full flex flex-col items-center justify-center bg-white p-1 select-none relative w-full">
            <button onClick={() => setActivePopup('viewer')} className="absolute top-2 right-2 text-gray-400 bg-red-200/80 hover:text-blue-600 p-2 rounded hover:bg-blue-50 transition-all z-10" title="Expand Viewer"><FaExpand size={16} /></button>
            <div className="w-full h-full flex items-center justify-center overflow-hidden">{renderViewerContent()}</div>
          </div>
        )}
        {activeTab === 'tags' && (
          <div ref={tagsContainerRef} className="flex flex-col h-full overflow-hidden px-1 pb-2 w-full relative">
            {detailsState.isLoadingTags && <LoadingOverlay />}
            <div style={{ height: `${tagsHeightPercent}%`, display: tagsHeightPercent === 0 ? 'none' : 'flex' }} className="flex flex-col min-h-0 border-gray-200 transition-all duration-75 w-full">
              <div className="flex items-center gap-[3px] py-2 px-2 shrink-0">
                <div className="text-blue-800 font-bold text-sm">Tags</div>
                <button onClick={() => setActivePopup('tags')} className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-all" title="Expand Tags"><FaExpand size={12} /></button>
              </div>
              <div className="flex-1 flex flex-col min-h-0 w-full overflow-scroll border-gray-200 rounded">
                <GridLayout columns={tagsColumns} data={detailsState.tagsData || []} hidePagination={true} height="100%"   hideFilterRow={true}/>
              </div>
            </div>
            <div onMouseDown={() => setIsResizingTags(true)} className="group h-5 flex items-center justify-center cursor-row-resize hover:bg-gray-50 shrink-0 z-10 transition-colors relative w-full">
              <div className={`w-full h-[5px] bg-gray-200 group-hover:bg-blue-300 absolute top-1/2 left-1 rounded-[5px] -translate-y-1/2`} />
              <button onMouseDown={(e) => e.stopPropagation()} onClick={toggleTagsPanel} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-[10px] text-gray-500 shadow-sm hover:text-blue-600 hover:border-blue-400 z-20">
                {tagsHeightPercent === 0 ? <FaChevronDown /> : <FaChevronUp />}
              </button>
            </div>
            <div style={{ height: `${100 - tagsHeightPercent}%` }} className="flex flex-col min-h-0 w-full">
              <div className="flex items-center justify-between py-1 px-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="text-blue-800 font-bold text-sm">Parsed Data</div>
                  <button onClick={() => setActivePopup('parsed')} className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-all" title="Expand Parsed Data"><FaExpand size={12} /></button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setCanGoBack(false); setActivePopup('multi-fields'); }} className="text-xs text-blue-600 font-medium hover:underline">Multi-Fields &raquo;</button>
                  <button className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs border border-blue-100 hover:bg-blue-100"><FaFileExport /> Export</button>
                </div>
              </div>
              <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden border-gray-200 rounded">
                <GridLayout columns={parsedDataColumns} data={detailsState.parsedData || []} hidePagination={true} height="100%"   hideFilterRow={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Layout Component: FtpLayout ---
function FtpLayout({
  storageGroup,
  treeNodes = [],
  leftPanelData,
  isLeftLoading,
  rowData,
  columns,
  tagsData,
  tagsColumns,
  parsedData,
  parsedDataColumns,
  onRowSelect,
  onRowDoubleClick,
  fileInfoData,
  showLeftPanel = true,
  showRightPanel = true,
  apiFilterParams = {},
  isMiddleLoading = false,
  onFolderSelect,
  selectedRow,
  refreshKey,
  getSelectTreeData,
  multiFieldsData = [], // Data for the new popup
  multiFieldsColumns = [], // Columns for the new popup
  apiCallbacks = {
     onFileView: null,
     onGetTags: null,
     onGetMultiFields: null
  }
}) {
  
  // 3. INSTANTIATE THE API HOOK
  // const { getSelectTreeData } = useServerDataApi();

  // // 4. DEFINE FILTERS TO MERGE WITH TREE DATA
  // // These should match the extra fields in your Request JSON (Dates, Statuses, Flags)
  // const filters = useMemo(() => ({
  //   sClientID: "",          // Example default (or pass via props)
  //   nWorkflowStatusCode: -1,
  //   nFolderHideFlag: 0,
  //   sTaskStatusValue: "",
  //   sFrom: "",      // Example date (ensure these update with your date picker)
  //   sTo: ""         // Example date
  // }), []);

  // ─── STATE & REFS ─────────────────────────────────────────────────────────────
  const [leftWidth, setLeftWidth] = useState(showLeftPanel ? 270 : 0);
  const [rightWidth, setRightWidth] = useState(400);
  const [isMiddleCollapsed, setIsMiddleCollapsed] = useState(false);
  // const [selectedRow, setSelectedRow] = useState(null);

  
  const dragRef = useRef({
    active: null,
    startX: 0,
    startWidth: 0,
    startRightWidth: 0,
    startLeftWidth: 0,
    hasMoved: false
  });

  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);

  const [userData, setUserData] = useState([]);

    const activeFolderId = TreegridMapping((state) => state.activeFolderId);

  const isLeftCollapsed = leftWidth === 0;

  useEffect(() => {
    setLeftWidth(showLeftPanel ? 270 : 0);
  }, [showLeftPanel]);

  const toggleLeft = () => setLeftWidth(isLeftCollapsed ? 270 : 0);
  const toggleMiddlePanel = () => setIsMiddleCollapsed(!isMiddleCollapsed);

  const stateRef = useLatest({ leftWidth, rightWidth, isMiddleCollapsed, showRightPanel, showLeftPanel });

  // Mock fallback only if no real data
  useEffect(() => {
    if (!rowData?.length) {
      setTimeout(() => {
        setUserData([
          { id: '1', username: 'report_2023.pdf', fullName: 'John Doe', profileName: 'Admin', TasksName: 'Upload' },
          { id: '2', username: 'assets_main.zip', fullName: 'Alex Smith', profileName: 'Editor', TasksName: 'Download' },
        ]);
      }, 500);
    }
  }, [rowData]);

  const defaultUserColumns = useMemo(() => [
    { key: 'username', label: 'Filename', width: 200, render: (r) => <span className="font-medium">{r.username}</span> },
    { key: 'profileName', label: 'Owner', width: 120 },
    { key: 'TasksName', label: 'Task Type', width: 150 },
  ], []);

  const gridColumns = columns || defaultUserColumns;

  const handleRowClick = (row) => {
    // setSelectedRow(row);
    if (onRowSelect) onRowSelect(row);
  };

  // ─── DRAG HANDLERS ────────────────────────────────────────────────────────────
  const handleDrag = useCallback((e) => {
    const drag = dragRef.current;
    if (!drag.active || !containerRef.current) return;

    if (e.type === 'touchmove') {
      // e.preventDefault(); // Uncomment if needed
    }

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const { leftWidth: currentLeftWidth, rightWidth: currentRightWidth, isMiddleCollapsed: currentIsMiddle, showRightPanel: isRightVisible, showLeftPanel: isLeftVisible } = stateRef.current;

    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - drag.startX;
    const visibleWidth = containerRef.current.clientWidth;

    const RESIZER_BUFFER = 20;
    const MAX_LIMIT_PERCENT = 0.98;

    if (Math.abs(deltaX) > 5) {
      drag.hasMoved = true;
    }

    if (drag.active === 'left' && isLeftVisible) {
      let newLeft = drag.startWidth + deltaX;
      if (newLeft < 50) newLeft = 0;
      const maxLimit = visibleWidth * MAX_LIMIT_PERCENT;
      if (newLeft > maxLimit) newLeft = maxLimit;

      const spaceForRest = visibleWidth - newLeft;
      const targetRightWidth = drag.startRightWidth;

      if (spaceForRest < targetRightWidth + RESIZER_BUFFER) {
        if (!currentIsMiddle) setIsMiddleCollapsed(true);
        if (isRightVisible) setRightWidth(Math.max(0, spaceForRest - RESIZER_BUFFER));
      } else {
        const middleGap = spaceForRest - targetRightWidth;
        if (middleGap > RESIZER_BUFFER) {
          if (currentIsMiddle) setIsMiddleCollapsed(false);
          if (currentRightWidth !== targetRightWidth && isRightVisible) {
            setRightWidth(targetRightWidth);
          }
        } else {
          if (!currentIsMiddle) setIsMiddleCollapsed(true);
        }
      }
      setLeftWidth(newLeft);
    }

    if (drag.active === 'right' && isRightVisible) {
      let newRight = drag.startWidth - deltaX;
      if (newRight < 50) newRight = 0;
      const maxRight = visibleWidth * MAX_LIMIT_PERCENT;
      if (newRight > maxRight) newRight = maxRight;

      const spaceForRest = visibleWidth - newRight;
      const targetLeftWidth = drag.startLeftWidth;

      if (spaceForRest < targetLeftWidth + RESIZER_BUFFER) {
        if (!currentIsMiddle) setIsMiddleCollapsed(true);
        if (isLeftVisible) setLeftWidth(Math.max(0, spaceForRest - RESIZER_BUFFER));
      } else {
        const middleGap = spaceForRest - targetLeftWidth;
        if (middleGap > RESIZER_BUFFER) {
          if (currentIsMiddle) setIsMiddleCollapsed(false);
          if (isLeftVisible && currentLeftWidth !== targetLeftWidth) setLeftWidth(targetLeftWidth);
        } else {
          if (!currentIsMiddle) setIsMiddleCollapsed(true);
        }
      }
      setRightWidth(newRight);
    }
  }, [stateRef]);

  const handleDragEnd = useCallback(() => {
    if (dragRef.current.active) {
      dragRef.current.active = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDrag, handleDragEnd]);

  const startDragLeft = (e) => {
    if (e.cancelable && e.preventDefault) e.preventDefault();
    const startX = e.touches ? e.touches[0].clientX : e.clientX;

    let currentRightW = rightWidth;
    if (isMiddleCollapsed && rightPanelRef.current) {
      currentRightW = rightPanelRef.current.getBoundingClientRect().width;
    }

    dragRef.current = {
      active: 'left',
      startX,
      startWidth: leftWidth,
      startRightWidth: currentRightW,
      startLeftWidth: leftWidth,
      hasMoved: false
    };
  };

  const startDragRight = (e) => {
    if (e.cancelable && e.preventDefault) e.preventDefault();
    const startX = e.touches ? e.touches[0].clientX : e.clientX;

    let initialWidth = rightWidth;
    if (isMiddleCollapsed && rightPanelRef.current) {
      initialWidth = rightPanelRef.current.getBoundingClientRect().width;
    }

    dragRef.current = {
      active: 'right',
      startX,
      startWidth: initialWidth,
      startRightWidth: initialWidth,
      startLeftWidth: leftWidth,
      hasMoved: false
    };
  };

  return (
    <div className="w-full pb-2 relative z-0">
      <div
        ref={containerRef}
        className="flex h-[calc(100vh-100px)] min-w-[1000px] mb-1 w-full bg-gray-50 border-2 border-gray-300 rounded-[8px] overflow-x-auto select-none"
      >
        
        {/* ─── 1. Left Panel (Using New Component) ─── */}
        {showLeftPanel && (
          <div
            style={{ width: leftWidth, transition: dragRef.current?.active ? 'none' : 'width 0.1s' }}
            className={`bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden ${
              leftWidth === 0 ? 'overflow-hidden' : ''
            }`}
          >
            {leftWidth > 30 && (
               <ServerDataTree 
                  storageGroup={storageGroup}
                 activePath={activeFolderId}
                  treeNodes={treeNodes}
                  leftPanelData={leftPanelData}
                  isLeftLoading={isLeftLoading}
                  key={refreshKey}
                  // 5. PASS API & FILTERS TO TREE
                  getSelectTreeData={getSelectTreeData}
                  filters={apiFilterParams}
                  onFolderSelect={onFolderSelect}
               />
            )}
          </div>
        )}

        {/* ─── 2. Left Resizer ─── */}
        {showLeftPanel && (
          <div
            className="w-[4px] hover:w-[6px] bg-gray-200 cursor-col-resize flex items-center justify-center z-10 relative shrink-0 me-2 transition-all"
            onMouseDown={startDragLeft}
            onTouchStart={startDragLeft}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleLeft(); }}
              className="absolute cursor-pointer top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-[28px] bg-blue-700 hover:bg-blue-600 text-white text-[10px] flex items-center justify-center shadow-md z-20 rounded-sm transition-colors"
            />
          </div>
        )}

        {/* ─── 3. Middle Panel ─── */}
     {/* ─── 3. Middle Panel (File/Folder List) ─── */}
<div
  className={`flex flex-col bg-white min-w-0 transition-all duration-300 flex-1 overflow-hidden relative ${
    isMiddleCollapsed && showRightPanel ? 'hidden w-0' : ''
  }`}
>
  {
    // Render GridLayout even if rowData is empty
    <GridLayout
    key={refreshKey}
      columns={gridColumns}
      data={rowData || []} // Ensure it passes an array even if null
      onRowClick={handleRowClick}
      onRowDoubleClick={onRowDoubleClick}
      height="100%"
      autoSelectFirst={false}
    //  externalSelectedId={selectedRow ? selectedRow._gridId || selectedRow.id : null}
    />
  }
</div>
        {/* ─── 4. Right Resizer ─── */}
        {showRightPanel && (
          <div
            className="w-[4px] hover:w-[6px] bg-gray-200 cursor-col-resize flex items-center justify-center z-10 relative shrink-0 transition-all"
            onMouseDown={startDragRight}
            onTouchStart={startDragRight}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!dragRef.current.hasMoved) {
                  toggleMiddlePanel();
                }
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-[28px] bg-blue-700 hover:bg-blue-600 text-white text-[10px] flex items-center justify-center shadow-md z-20 rounded-sm transition-colors"
            />
          </div>
        )}

        {/* ─── 5. Right Panel ─── */}
        {showRightPanel && (
          <div
            ref={rightPanelRef}
            className={`bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden ${
              isMiddleCollapsed ? 'flex-1' : rightWidth === 0 ? 'hidden' : ''
            }`}
            style={{
              width: isMiddleCollapsed ? 'auto' : rightWidth,
              transition: dragRef.current?.active ? 'none' : 'width 0.1s'
            }}
          >
            <FileDetailPanel
              selectedFile={selectedRow}
              tagsData={tagsData}
              tagsColumns={tagsColumns}
              parsedData={parsedData}
              parsedDataColumns={parsedDataColumns}
              fileInfoData={fileInfoData}
              apiFilterParams={apiFilterParams}
              multiFieldsData={multiFieldsData}
              multiFieldsColumns={multiFieldsColumns}
              apiCallbacks={apiCallbacks}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FtpLayout;