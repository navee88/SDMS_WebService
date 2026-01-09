import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import GridLayout from './GridLayout'; // Adjust path if needed
import {
  FaLink, FaFileExport, FaFileAlt, FaImage, FaMusic, FaFilm,
  FaChevronUp, FaChevronDown, FaExpand, FaTimes, FaRegFolderOpen
} from "react-icons/fa";
import { Folder } from 'lucide-react';

// --- Custom Hooks ---

// Hook to access the latest value in effects/callbacks without triggering re-renders
function useLatest(value) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

// Hook to handle event listeners easily (Used for FileDetailPanel)
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
const InfoRow = ({ label, value, customValue, highlight, truncate }) => (
  <div className="flex flex-row items-baseline p-3 hover:bg-gray-50 transition-colors">
    <span className="text-sm font-semibold text-teal-900 w-36 shrink-0">{label}:</span>
    <div className="flex-1 min-w-0">
      {customValue ? customValue : (
        <span className={`text-sm block ${highlight ? 'font-medium text-gray-900' : 'text-gray-600'} ${truncate ? 'truncate' : ''}`}>
          {value || '-'}
        </span>
      )}
    </div>
  </div>
);

// --- Component: FileDetailPanel ---
const FileDetailPanel = ({
  selectedFile,
  tagsData = [],
  tagsColumns = [],
  parsedData = [],
  parsedDataColumns = [],
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [tagsHeightPercent, setTagsHeightPercent] = useState(50);
  const [lastOpenPercent, setLastOpenPercent] = useState(50);
  const [isResizingTags, setIsResizingTags] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const tagsContainerRef = useRef(null);

  const tabs = [
    { id: 'info', label: 'File Information' },
    { id: 'viewer', label: 'File Viewer' },
    { id: 'tags', label: 'Tags & Parsed Data' }
  ];

  const getValue = (key) => selectedFile ? selectedFile[key] || '-' : '-';

  const toggleTagsPanel = (e) => {
    e.stopPropagation();
    if (tagsHeightPercent < 5) {
      setTagsHeightPercent(lastOpenPercent || 50);
    } else {
      setLastOpenPercent(tagsHeightPercent);
      setTagsHeightPercent(0);
    }
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
    if (isResizingTags) {
      setIsResizingTags(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  };

  useEventListener('mousemove', handleMouseMove, document);
  useEventListener('mouseup', handleMouseUp, document);

  const renderPopup = () => {
    if (!activePopup) return null;

    let title = '';
    let content = null;

    if (activePopup === 'viewer') {
      title = 'File Viewer';
      content = (
        <div className="z-50 relative h-full overflow-auto flex flex-col items-center justify-center bg-gray-50 p-10 select-none">
          <div className="relative w-48 h-48 mb-8 opacity-30 pointer-events-none">
            <FaFileAlt className="absolute top-0 left-10 text-7xl text-gray-500 transform -rotate-12 drop-shadow-sm" />
            <FaImage className="absolute top-10 right-4 text-7xl text-gray-500 transform rotate-12 drop-shadow-sm" />
            <FaMusic className="absolute bottom-8 left-2 text-7xl text-gray-500 transform -rotate-35 drop-shadow-sm" />
            <FaFilm className="absolute bottom-0 right-10 text-7xl text-gray-500 transform rotate-6 drop-shadow-sm" />
          </div>
          <h3 className="text-3xl font-semibold text-gray-400 tracking-wide">Files can be viewed here</h3>
          <p className="text-gray-400 mt-2">Expanded View Mode</p>
        </div>
      );
    } else {
      const isTags = activePopup === 'tags';
      title = isTags ? 'Tags Details' : 'Parsed Data Details';
      const data = isTags ? tagsData : parsedData;
      const columns = isTags ? tagsColumns : parsedDataColumns;

      content = (
        <div className="z-50 relative flex flex-col flex-1 w-100 min-w-[250px] h-full bg-white">
          {!isTags && (
            <div className="flex items-center justify-end gap-3 py-0 px-1  border-gray-100  shrink-0">
              <button className="text-sm text-blue-600 font-medium hover:underline">
                Multi-Fields &raquo;
              </button>
              <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-sm border border-blue-100 hover:bg-blue-100 transition-colors font-medium">
                <FaFileExport /> Export
              </button>
            </div>
          )}
          
          <div className="flex-1 overflow-auto">
            <GridLayout
              key={`popup-grid-${activePopup}`}
              columns={columns}
              data={data}
              height="100%"
              hidePagination={false}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-6xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
            <h3 className="text-lg font-bold text-blue-700">{title}</h3>
            <button
              onClick={() => setActivePopup(null)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-hidden bg-white w-full flex flex-col">
            {content}
          </div>
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end shrink-0">
            <button
              onClick={() => setActivePopup(null)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white z-10 min-w-0 w-full relative">
      {renderPopup()}
      
      {/* Tabs */}
      <div className="flex border-b ms-0 border-gray-200 mb-0 shrink-0 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative whitespace-nowrap flex-1 ${
              activeTab === tab.id
                ? 'text-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden relative w-full">
        
        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="flex flex-col border border-gray-100 rounded-lg shadow-sm bg-white divide-y divide-gray-100 h-full p-4 overflow-y-auto">
            <InfoRow label="Filename" value={getValue('username')} highlight />
            <InfoRow label="Size" value={selectedFile ? "2.4 MB" : '-'} />
            <InfoRow label="Contains" value={selectedFile ? "User Data" : '-'} />
            <InfoRow label="Login Username" value={getValue('username')} />
            <InfoRow label="Client Name" value={getValue('fullName')} />
            <InfoRow
              label="Status"
              customValue={selectedFile ? (
                <span className={`px-2 py-0.5 rounded text-xs font-medium w-max ${
                  selectedFile.userStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedFile.userStatus || 'Unknown'}
                </span>
              ) : null}
            />
            <InfoRow label="Parser Status" value={selectedFile ? "Completed" : '-'} />
            <InfoRow label="Created On" value={selectedFile ? "2023-01-15" : '-'} />
            <InfoRow label="Task Type" value={getValue('TasksName')} />
            <InfoRow
              label="Share Link"
              customValue={selectedFile ? (
                <div className="flex items-center gap-2 text-blue-600 cursor-pointer hover:underline text-sm">
                  <FaLink /> <span>Generate Link</span>
                </div>
              ) : <span className="text-gray-400 text-sm">-</span>}
            />
          </div>
        )}

        {/* VIEWER TAB */}
        {activeTab === 'viewer' && (
          <div className="h-full flex flex-col items-center justify-center bg-white p-4 select-none relative">
            <button
              onClick={() => setActivePopup('viewer')}
              className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 p-2 rounded hover:bg-blue-50 transition-all z-10"
              title="Expand Viewer"
            >
              <FaExpand size={16} />
            </button>
            <div className="relative w-32 h-32 mb-6 opacity-30 pointer-events-none">
              <FaFileAlt className="absolute top-0 left-10 text-5xl text-gray-500 transform -rotate-12 drop-shadow-sm" />
              <FaImage className="absolute top-10 right-4 text-5xl text-gray-500 transform rotate-12 drop-shadow-sm" />
              <FaMusic className="absolute bottom-8 left-2 text-5xl text-gray-500 transform -rotate-35 drop-shadow-sm" />
              <FaFilm className="absolute bottom-0 right-10 text-7xl text-gray-500 transform rotate-6 drop-shadow-sm" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-300 tracking-wide">Files can be viewed here</h3>
          </div>
        )}

        {/* TAGS & PARSED DATA TAB */}
        {activeTab === 'tags' && (
          <div ref={tagsContainerRef} className="flex flex-col h-full overflow-hidden px-1 pb-2 w-full">
            
            {/* TAGS SECTION */}
            <div
              style={{ height: `${tagsHeightPercent}%`, display: tagsHeightPercent === 0 ? 'none' : 'flex' }}
              className="flex flex-col min-h-0 border-gray-200 transition-all duration-75 w-full"
            >
              <div className="flex items-center gap-[3px] py-2 px-2 shrink-0">
                <div className="text-blue-800 font-bold text-sm">Tags</div>
                <button
                  onClick={() => setActivePopup('tags')}
                  className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-all"
                  title="Expand Tags"
                >
                  <FaExpand size={12} />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col min-h-0 w-full overflow-scroll border-gray-200 rounded">
                <GridLayout
                  columns={tagsColumns || []}
                  data={tagsData}
                  hidePagination={true}
                  height="100%"
                />
              </div>
            </div>

            {/* Resizer Handle */}
            <div
              onMouseDown={() => setIsResizingTags(true)}
              className="group h-5 flex items-center justify-center cursor-row-resize hover:bg-gray-50 shrink-0 z-10 transition-colors relative w-full"
            >
              <div className={`w-full h-[5px] bg-gray-200 group-hover:bg-blue-300 absolute top-1/2 left-1 rounded-[5px] -translate-y-1/2`} />
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleTagsPanel}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-[10px] text-gray-500 shadow-sm hover:text-blue-600 hover:border-blue-400 z-20"
                title={tagsHeightPercent === 0 ? "Show Tags" : "Hide Tags"}
              >
                {tagsHeightPercent === 0 ? <FaChevronDown /> : <FaChevronUp />}
              </button>
            </div>

            {/* PARSED DATA SECTION */}
            <div
              style={{ height: `${100 - tagsHeightPercent}%` }}
              className="flex flex-col min-h-0 w-full"
            >
              <div className="flex items-center justify-between py-1 px-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="text-blue-800 font-bold text-sm">Parsed Data</div>
                  <button
                    onClick={() => setActivePopup('parsed')}
                    className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-all"
                    title="Expand Parsed Data"
                  >
                    <FaExpand size={12} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs text-blue-600 font-medium hover:underline">Multi-Fields &raquo;</button>
                  <button className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs border border-blue-100 hover:bg-blue-100">
                    <FaFileExport /> Export
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden border-gray-200 rounded">
                <GridLayout
                  columns={parsedDataColumns || []}
                  data={parsedData}
                  hidePagination={true}
                  height="100%"
                  // resizableColumns={true}
                />
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
  leftPanelData, 
  isLeftLoading,
  rowData,
  columns,
  tagsData,
  tagsColumns,
  parsedData,
  parsedDataColumns,
  onRowSelect,
  showLeftPanel = true,
  showRightPanel = true
}) {
  const [leftWidth, setLeftWidth] = useState(showLeftPanel ? 250 : 0); 
  const [rightWidth, setRightWidth] = useState(400); 
  const [isMiddleCollapsed, setIsMiddleCollapsed] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  
  // Drag Ref: Mutable state for drag start positions (No re-renders)
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

  // Data State
  const [userData, setUserData] = useState([]);
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  const isLeftCollapsed = leftWidth === 0;

    useEffect(() => {
    setLeftWidth(showLeftPanel ? 270 : 0);
  }, [showLeftPanel]);

  const toggleLeft = () => setLeftWidth(isLeftCollapsed ? 270 : 0);
  const toggleMiddlePanel = () => setIsMiddleCollapsed(!isMiddleCollapsed);

  // useLatest hook creates a ref that always holds current state
  // This allows handleDrag to read fresh state without adding dependencies
  const stateRef = useLatest({ leftWidth, rightWidth, isMiddleCollapsed, showRightPanel ,showLeftPanel});

  // Effect to open folder when leftPanelData arrives
  useEffect(() => {
    if (leftPanelData) {
      setIsFolderOpen(true);
    } else {
      setIsFolderOpen(false);
    }
  }, [leftPanelData]);

  // Effect to split Middle and Right evenly on initial load
  useEffect(() => {
    if (containerRef.current) {
        const totalWidth = containerRef.current.clientWidth;
        const availableSpace = totalWidth - leftWidth - 10;
        if (availableSpace > 0) {
            setRightWidth(availableSpace * 0.4);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Mock Data (Grid)
  useEffect(() => {
    if (!rowData) {
        setTimeout(() => {
        setUserData([
            { id: '1', username: 'report_2023.pdf', fullName: 'John Doe', profileName: 'Admin', userGroupName: 'Admins', userStatus: 'Active', TasksName: 'Upload' },
            { id: '2', username: 'assets_main.zip', fullName: 'Alex Smith', profileName: 'Editor', userGroupName: 'Editors', userStatus: 'Active', TasksName: 'Download' },
        ]);
        }, 500);
    }
  }, [rowData]);

  const defaultUserColumns = useMemo(() => [
    { key: 'username', label: 'Filename', width: 200, render: (r) => <span className="font-medium">{r.username}</span> },
    { key: 'profileName', label: 'Owner', width: 120 },
    { key: 'userStatus', label: 'Status', width: 100 },
  ], []);

  const gridColumns = columns || defaultUserColumns;

  const handleRowClick = (row) => {
    setSelectedRow(row);
    if (onRowSelect) {
        onRowSelect(row);
    }
  };

  // --- STABLE DRAG HANDLER ---
  // const handleDrag = useCallback((e) => {
  //   const drag = dragRef.current;
  //   if (!drag.active || !containerRef.current) return;

  //   document.body.style.cursor = 'col-resize';
  //   document.body.style.userSelect = 'none';

  //   // Access current state via ref (no dependency)
  //   const { 
  //       leftWidth: currentLeftWidth, 
  //       rightWidth: currentRightWidth, 
  //       isMiddleCollapsed: currentIsMiddle,
  //       showRightPanel: isRightVisible,
  //       showLeftPanel: isLeftVisible,
  //   } = stateRef.current;

  //   const currentX = e.clientX;
  //   const deltaX = currentX - drag.startX;
  //   const visibleWidth = containerRef.current.clientWidth;

  //   // Buffer to prevent panels from overlapping drag handles (~20px)
  //   const RESIZER_BUFFER = 20;
  //   const MAX_LIMIT_PERCENT = 0.98;

  //   // 1. LEFT RESIZER
  //   if (drag.active === 'left' && isLeftVisible) {
  //     let newLeft = drag.startWidth + deltaX;

  //     // Snap to zero
  //     if (newLeft < 50) newLeft = 0;
      
  //     const maxLimit = visibleWidth * MAX_LIMIT_PERCENT;
  //     if (newLeft > maxLimit) newLeft = maxLimit;

  //     const spaceForRest = visibleWidth - newLeft;
  //     const targetRightWidth = drag.startRightWidth; 

  //     // Logic: If left panel pushes too far, collapse middle or shrink right
  //     if (spaceForRest < targetRightWidth + RESIZER_BUFFER) {
  //        if (!currentIsMiddle) setIsMiddleCollapsed(true);
  //        if (isRightVisible) {
  //            setRightWidth(Math.max(0, spaceForRest - RESIZER_BUFFER));
  //        }
  //     } else {
  //        const middleGap = spaceForRest - targetRightWidth;
  //        // Ensure enough gap for handles
  //        if (middleGap > RESIZER_BUFFER) {
  //           if (currentIsMiddle) setIsMiddleCollapsed(false);
  //           if (currentRightWidth !== targetRightWidth && isRightVisible) {
  //               setRightWidth(targetRightWidth);
  //           }
  //        } else {
  //           if (!currentIsMiddle) setIsMiddleCollapsed(true);
  //        }
  //     }
  //     setLeftWidth(newLeft);
  //   }

  //   // 2. RIGHT RESIZER
  //   if (drag.active === 'right' && isRightVisible) {
  //     let newRight = drag.startWidth - deltaX;

  //     if (newRight < 50) newRight = 0;
      
  //     const maxRight = visibleWidth * MAX_LIMIT_PERCENT;
  //     if (newRight > maxRight) newRight = maxRight;

  //     const spaceForRest = visibleWidth - newRight;
  //     const targetLeftWidth = drag.startLeftWidth;

  //     if (spaceForRest < targetLeftWidth + RESIZER_BUFFER) {
  //        if (!currentIsMiddle) setIsMiddleCollapsed(true);
  //        // Shrink left to fit, minus buffer
  //       //  setLeftWidth(Math.max(0, spaceForRest - RESIZER_BUFFER));
  //       if (isLeftVisible) setLeftWidth(Math.max(0, spaceForRest - RESIZER_BUFFER));

  //     } else {
  //        const middleGap = spaceForRest - targetLeftWidth;
  //        if (middleGap > RESIZER_BUFFER) {
  //           if (currentIsMiddle) setIsMiddleCollapsed(false);
  //           // if (currentLeftWidth !== targetLeftWidth) setLeftWidth(targetLeftWidth);
  //             if (isLeftVisible && currentLeftWidth !== targetLeftWidth) setLeftWidth(targetLeftWidth);

  //        } else {
  //           if (!currentIsMiddle) setIsMiddleCollapsed(true);
  //        }
  //     }
  //     setRightWidth(newRight);
  //   }
  // }, [stateRef]); // Only dependency is the stable ref hook

    // --- STABLE DRAG HANDLER ---
  const handleDrag = useCallback((e) => {
    const drag = dragRef.current;
    if (!drag.active || !containerRef.current) return;

    // Prevent default scrolling on touch
    if(e.type === 'touchmove') {
        // e.preventDefault(); // Uncomment if page scrolling interferes
    }

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    // Access current state via ref
    const { 
        leftWidth: currentLeftWidth, 
        rightWidth: currentRightWidth, 
        isMiddleCollapsed: currentIsMiddle,
        showRightPanel: isRightVisible,
        showLeftPanel: isLeftVisible,
    } = stateRef.current;

    // UNIFIED COORDINATE GETTER
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    
    const deltaX = currentX - drag.startX;
    const visibleWidth = containerRef.current.clientWidth;

    // ... (rest of your logic remains EXACTLY the same from here) ...
    const RESIZER_BUFFER = 20;
    const MAX_LIMIT_PERCENT = 0.98;

    if (Math.abs(deltaX) > 5) {
        drag.hasMoved = true;
    }

    // 1. LEFT RESIZER
    if (drag.active === 'left' && isLeftVisible) {
        let newLeft = drag.startWidth + deltaX;
        // ... (rest of left resize logic) ...
        if (newLeft < 50) newLeft = 0;
        const maxLimit = visibleWidth * MAX_LIMIT_PERCENT;
        if (newLeft > maxLimit) newLeft = maxLimit;
        
        const spaceForRest = visibleWidth - newLeft;
        const targetRightWidth = drag.startRightWidth; 

        if (spaceForRest < targetRightWidth + RESIZER_BUFFER) {
             if (!currentIsMiddle) setIsMiddleCollapsed(true);
             if (isRightVisible) {
                 setRightWidth(Math.max(0, spaceForRest - RESIZER_BUFFER));
             }
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

    // 2. RIGHT RESIZER
    if (drag.active === 'right' && isRightVisible) {
        let newRight = drag.startWidth - deltaX;
        // ... (rest of right resize logic) ...
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


  // --- DRAG END ---
  const handleDragEnd = useCallback(() => {
    if (dragRef.current.active) {
      dragRef.current.active = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, []);

  // --- EVENT LISTENERS (Attached Once) ---
  // useEffect(() => {
  //   document.addEventListener('mousemove', handleDrag);
  //   document.addEventListener('mouseup', handleDragEnd);
  //   return () => {
  //     document.removeEventListener('mousemove', handleDrag);
  //     document.removeEventListener('mouseup', handleDragEnd);
  //   };
  // }, [handleDrag, handleDragEnd]);

    // --- EVENT LISTENERS (Attached Once) ---
  useEffect(() => {
    // Mouse
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Touch
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDrag, handleDragEnd]);


  // --- START HANDLERS ---
  // const startDragLeft = (e) => {
  //   e.preventDefault();
  //   let currentRightW = rightWidth;
  //   if (isMiddleCollapsed && rightPanelRef.current) {
  //     currentRightW = rightPanelRef.current.getBoundingClientRect().width;
  //   }

  //   dragRef.current = { 
  //       active: 'left', 
  //       startX: e.clientX, 
  //       startWidth: leftWidth,
  //       startRightWidth: currentRightW,
  //       startLeftWidth: leftWidth 
  //   };
  // };

  //     const startDragRight = (e) => {
  //   e.preventDefault();
  //   let initialWidth = rightWidth;
    
  //   // If middle is collapsed, the right panel might be taking up remaining space.
  //   // We capture its actual current size.
  //   if (isMiddleCollapsed && rightPanelRef.current) {
  //     initialWidth = rightPanelRef.current.getBoundingClientRect().width;
  //     // When we start dragging right resizer while collapsed, we usually intend
  //     // to un-collapse or resize relative to the current state.
  //     // Resetting strict collapse state helps smoothness.
  //     setIsMiddleCollapsed(false);
  //     setRightWidth(initialWidth);
  //   }

  //   dragRef.current = { 
  //       active: 'right', 
  //       startX: e.clientX, 
  //       startWidth: initialWidth,
  //       startRightWidth: initialWidth,
  //       startLeftWidth: leftWidth 
  //   };
  // };

    const startDragLeft = (e) => {
    // Stop event defaults only if it's not a passive listener issue
    if (e.cancelable && e.preventDefault) e.preventDefault();
    
    let currentRightW = rightWidth;
    if (isMiddleCollapsed && rightPanelRef.current) {
      currentRightW = rightPanelRef.current.getBoundingClientRect().width;
    }

    // UNIFIED COORDINATE GETTER
    const startX = e.touches ? e.touches[0].clientX : e.clientX;

    dragRef.current = { 
        active: 'left', 
        startX: startX, 
        startWidth: leftWidth,
        startRightWidth: currentRightW,
        startLeftWidth: leftWidth 
    };
  };
  const startDragRight = (e) => {
    // Prevent default to avoid text selection, but allow events to bubble
    if (e.cancelable && e.preventDefault) e.preventDefault();
    
    let initialWidth = rightWidth;
    let initialCollapsed = isMiddleCollapsed; // Capture this

    // If currently collapsed, we base the drag width on the hidden panel's real width
    if (isMiddleCollapsed && rightPanelRef.current) {
      initialWidth = rightPanelRef.current.getBoundingClientRect().width;
      // DO NOT call setIsMiddleCollapsed(false) here yet!
    }

    const startX = e.touches ? e.touches[0].clientX : e.clientX;

    dragRef.current = { 
        active: 'right', 
        startX: startX, 
        startWidth: initialWidth,
        startRightWidth: initialWidth,
        startLeftWidth: leftWidth,
        wasCollapsed: initialCollapsed, // Store this
        hasMoved: false 
    };
  };




  return (
    <div className="w-full pb-2 relative z-0">
      <div
        ref={containerRef}
        className="flex h-[calc(100vh-100px)] min-w-[1000px] mb-1 w-full bg-gray-50 border-2 border-gray-300 rounded-[8px] overflow-x-auto select-none"
      >
        {/* 1. Left Panel */}
         {showLeftPanel && (
        <div
          style={{ width: leftWidth, transition: dragRef.current?.active ? 'none' : 'width 0.1s' }}
          className={`bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden ${
            leftWidth === 0 ? 'overflow-hidden' : ''
          }`}
        >
          {leftWidth > 30 && (
            <div className="p-1 space-y-2">
              <div
                className="flex items-center gap-2 px-2 py-1.5 bg-[#f0f4f9] rounded-[8px] text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200"
                onClick={() => leftPanelData && setIsFolderOpen(prev => !prev)}
              >
                {isFolderOpen ? (
                  <FaRegFolderOpen className="w-4 h-4 text-blue-500" />
                ) : (
                  <Folder className="w-4 h-4 text-blue-500 fill-blue-500" />
                )}
                <span className="truncate">{storageGroup || "Folder"}</span>
              </div>
              
              {!leftPanelData && (
                <div className="flex justify-center text-xs text-slate-400 pt-6">
                  Apply filter to view folders
                </div>
              )}

              {leftPanelData && isFolderOpen && (
                <div className="border-l-2 border-green-500 pl-3 text-xs text-slate-700 truncate">
                  {isLeftLoading
                    ? "Loading path..."
                    : `${leftPanelData.client}/${leftPanelData.instrument}/${leftPanelData.fileName}`
                  }
                </div>
              )}
            </div>
          )}
        </div>
         )}

      {/* 2. Left Resizer */}
      {showLeftPanel && (
        <div 
          className="w-[4px] hover:w-[4px] bg-gray-200 cursor-col-resize flex items-center justify-center z-10 relative shrink-0 me-2 cursor-move" 
          onMouseDown={startDragLeft}
          onTouchStart={startDragLeft}
        >
          <button
            onClick={(e) => { e.stopPropagation(); toggleLeft(); }}
            className="absolute cursor-pointer top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-[25px] bg-blue-800 hover:bg-blue-500 text-white text-[10px] flex items-center justify-center shadow-sm z-20 rounded-sm"
          />
        </div>
      )}

        {/* 3. Middle Panel */}
        <div className={`flex flex-col bg-white min-w-0 transition-all duration-300 flex-1 overflow-hidden ${isMiddleCollapsed && showRightPanel ? 'hidden w-0' : ''}`}>
           <GridLayout
             columns={gridColumns}
             data={rowData || userData}
             onRowClick={handleRowClick}
             height="100%"
            //  resizableColumns={true}
           />
        </div>


               {/* 4. Right Resizer */}
        {showRightPanel && (
          <div
            className="w-[4px] hover:w-[4px] bg-gray-200 cursor-col-resize flex items-center justify-center z-10 relative shrink-0 touch-none"
            onMouseDown={startDragRight}
            onTouchStart={startDragRight}
          >
            <button
              // UPDATE ONCLICK
             onClick={(e) => { 
    e.stopPropagation(); 
    if (!dragRef.current.hasMoved) { 
        toggleMiddlePanel(); 
    }
  }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-[25px] bg-blue-800 hover:bg-blue-500 text-white text-[10px] flex items-center justify-center shadow-sm z-20 rounded-sm"
            />
          </div>
        )}


        {/* 5. Right Panel */}
        {showRightPanel && (
          <div
            ref={rightPanelRef}
            className={`bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-x-auto ${rightWidth === 0 ? 'hidden' : (isMiddleCollapsed ? 'flex-1' : '')}`}
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
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FtpLayout;
