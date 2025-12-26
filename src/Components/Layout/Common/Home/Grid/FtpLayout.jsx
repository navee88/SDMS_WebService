import React, { useState, useEffect, useRef } from 'react';
import GridLayout from './GridLayout'; 
import { FaLink, FaFileExport, FaFileAlt, FaImage, FaMusic, FaFilm, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Folder, Loader2 } from 'lucide-react'; 
import { FaRegFolderOpen } from "react-icons/fa";

const FileDetailPanel = ({ 
  selectedFile, 
  tagsData = [], 
  tagsColumns, 
  parsedData = [], 
  parsedDataColumns
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [tagsHeightPercent, setTagsHeightPercent] = useState(50); 
  const [lastOpenPercent, setLastOpenPercent] = useState(50); 
  const [isResizingTags, setIsResizingTags] = useState(false);
  const tagsContainerRef = useRef(null);

  // ✅ Right panel ALWAYS shows Tags & Parsed Data - no config dependency
  const tabs = [
    { id: 'info', label: 'File Information' },
    { id: 'viewer', label: 'File Viewer' },
    { id: 'tags', label: 'Tags & Parsed Data' }  // ✅ Always visible
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

  useEffect(() => {
    if (!isResizingTags) return;

    const handleMouseMove = (e) => {
      if (!tagsContainerRef.current) return;
      const containerRect = tagsContainerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - containerRect.top;
      const totalHeight = containerRect.height;
      let newPercent = (relativeY / totalHeight) * 100;
      if (newPercent < 5) newPercent = 0;  
      if (newPercent > 95) newPercent = 100; 
      newPercent = Math.max(0, Math.min(100, newPercent));
      setTagsHeightPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsResizingTags(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingTags]);

  return (
    <div className="flex flex-col h-full bg-white z-10">
      {/* Tabs Header */}
      <div className="flex border-b ms-1 border-gray-200 mb-0 shrink-0 overflow-x-auto scrollbar-hide ">
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

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
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
            <InfoRow label="Parser Status" value={selectedFile ? "Completed" : '-'} /> {/* ✅ Always visible */}
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

        {/* TAB: VIEWER */}
        {activeTab === 'viewer' && (
          <div className="h-full flex flex-col items-center justify-center bg-white p-4 select-none">
            <div className="relative w-32 h-32 mb-6 opacity-30 pointer-events-none">
              <FaFileAlt className="absolute top-0 left-10 text-5xl text-gray-500 transform -rotate-12 drop-shadow-sm" />
              <FaImage className="absolute top-10 right-4 text-5xl text-gray-500 transform rotate-12 drop-shadow-sm" />
              <FaMusic className="absolute bottom-8 left-2 text-5xl text-gray-500 transform -rotate-35 drop-shadow-sm" />
              <FaFilm className="absolute bottom-0 right-10 text-5xl text-gray-500 transform rotate-6 drop-shadow-sm" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-300 tracking-wide">Files can be viewed here</h3>
          </div>
        )}

        {/* TAB: TAGS & PARSED DATA - ✅ Always visible in right panel */}
        {activeTab === 'tags' && (
          <div ref={tagsContainerRef} className="flex flex-col h-full overflow-hidden px-1 pb-2">
            
            {/* Top Grid: Tags */}
            <div
              style={{ height: `${tagsHeightPercent}%`, display: tagsHeightPercent === 0 ? 'none' : 'flex' }}
              className="flex flex-col min-h-0 border-b border-gray-200 transition-all duration-75"
            >
              <div className="text-blue-800 font-bold py-2 px-2 text-sm shrink-0">Tags</div>
              <div className="flex-1 border-gray-200 rounded overflow-hidden relative">
                <div className="absolute inset-0 overflow-auto">
                  <GridLayout
                    columns={tagsColumns || []}
                    data={tagsData}
                    hidePagination={true}
                    height='300px'
                  />
                </div>
              </div>
            </div>

            {/* Resizer */}
            <div
              onMouseDown={() => setIsResizingTags(true)}
              className="group h-5 flex items-center justify-center cursor-row-resize hover:bg-gray-50 shrink-0 z-10 transition-colors relative"
            >
              <div className={`w-full h-[5px] bg-gray-200 group-hover:bg-blue-300 absolute top-1/2 left-0 -translate-y-1/2`} />
              <button
                onMouseDown={(e) => e.stopPropagation()} 
                onClick={toggleTagsPanel}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-[10px] text-gray-500 shadow-sm hover:text-blue-600 hover:border-blue-400 z-20"
                title={tagsHeightPercent === 0 ? "Show Tags" : "Hide Tags"}
              >
                {tagsHeightPercent === 0 ? <FaChevronDown /> : <FaChevronUp />}
              </button>
            </div>

            {/* Bottom Grid: Parsed Data - ✅ Always visible in right panel */}
            <div
              style={{ height: `${100 - tagsHeightPercent}%` }}
              className="flex flex-col min-h-0"
            >
              <div className="flex items-center justify-between py-1 px-2 shrink-0">
                <div className="text-blue-800 font-bold text-sm">Parsed Data</div>
                <div className="flex gap-2">
                  <button className="text-xs text-blue-600 font-medium hover:underline">Multi-Fields &raquo;</button>
                  <button className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs border border-blue-100 hover:bg-blue-100">
                    <FaFileExport /> Export
                  </button>
                </div>
              </div>
              <div className="flex-1 border-gray-200 rounded overflow-hidden relative">
                <div className="absolute inset-0 overflow-auto">
                  <GridLayout
                    columns={parsedDataColumns || []}
                    data={parsedData}
                    hidePagination={true}
                    height='300px'
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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

function FtpLayout({ 
  storageGroup,
  rowData = [], 
  columns = [], 
  tagsData = [],
  tagsColumns, 
  parsedData = [],
  parsedDataColumns, 
  onRowSelect,
  showRightPanel = true,
  showParserColumn = false,  // ✅ ONLY controls MIDDLE PANEL (main grid) Parser Status column
  isLeftLoading = false,
  isLoading = false, // ✅ RESTORED: Prop to control Left Panel loading state
  autoSelectFirst = true,
  leftPanelData,
  refreshKey
}) {
  const [leftWidth, setLeftWidth] = useState(250); 
  const [rightWidth, setRightWidth] = useState(400);
  const [isMiddleCollapsed, setIsMiddleCollapsed] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dragging, setDragging] = useState(null);
  const containerRef = useRef(null);
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  const isLeftCollapsed = leftWidth === 0;

  useEffect(() => {
    if (leftPanelData) {
      setIsFolderOpen(true);   // ✅ auto-open on filter click
    } else {
      setIsFolderOpen(false);  // ✅ close on reset
    }
  }, [leftPanelData]);


  const toggleLeft = () => setLeftWidth(isLeftCollapsed ? 250 : 0);
  const toggleMiddlePanel = () => setIsMiddleCollapsed(!isMiddleCollapsed);

  // ✅ ONLY middle panel: Filter main grid columns based on showParserColumn
  const filteredColumns = columns.map(col => {
    if (col.key === 'parserStatus') {
      return { ...col, hidden: !showParserColumn };  // ✅ Controls ONLY main grid column
    }
    return col;
  });

  // ✅ RESET SELECTION ON DATA LOAD
  useEffect(() => {
    setSelectedRow(null);
    if (onRowSelect) {
      onRowSelect(null);
    }
  }, [rowData]);

  const handleRowClick = (row) => {
    setSelectedRow(row); 
    if (onRowSelect) {
      onRowSelect(row);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const totalWidth = containerRef.current.offsetWidth;
      // Just check bounds, but let flex handle the rest
      if (totalWidth > 0) {
          const initialLeft = Math.min(250, totalWidth * 0.20);
          setLeftWidth(initialLeft);
          if (showRightPanel) {
            setRightWidth(Math.min(400, totalWidth * 0.35));
          }
      }
    }
  }, [showRightPanel]); 

  // Drag Logic 
  useEffect(() => {
    if (!dragging) return;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseRelativeX = e.clientX - containerRect.left;
      
      // Use scrollWidth if scrolling is active, otherwise offsetWidth
      const containerWidth = containerRef.current.scrollWidth; 
      
      const SNAP_THRESHOLD = 50;

      if (dragging === 'left') {
        let newLeft = mouseRelativeX;
        // Add scrollLeft to account for scrolled state
        newLeft += containerRef.current.scrollLeft;

        if (newLeft < SNAP_THRESHOLD) newLeft = 0;
        
        // Ensure left doesn't push right panel off too much
        const maxLeft = showRightPanel 
          ? containerWidth - rightWidth - 100 
          : containerWidth - 100;

        newLeft = Math.min(newLeft, maxLeft);
        setLeftWidth(newLeft);
      }

      if (dragging === 'right' && showRightPanel) {
        // Calculate from right edge
        let newRight = containerWidth - (mouseRelativeX + containerRef.current.scrollLeft);
        
        if (isMiddleCollapsed && newRight < containerWidth - 100) {
          setIsMiddleCollapsed(false);
        }

        if (newRight < SNAP_THRESHOLD) newRight = 0;
        
        // Prevent right from overlapping left
        newRight = Math.min(newRight, containerWidth - leftWidth - 100);
        setRightWidth(newRight);
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragging, leftWidth, rightWidth, isMiddleCollapsed, showRightPanel]);

  const startDragLeft = () => setDragging('left');
  const startDragRight = () => setDragging('right');

  return (
   <>
    {/* ✅ OUTER CONTAINER WITH SCROLL */}
    <div className="w-full overflow-x-auto pb-2">
      <div 
        ref={containerRef} 
        className="flex h-[600px] min-w-[1000px] w-full ms-1 bg-gray-50 border border-gray-300 overflow-hidden select-none"
      >
        
        {/* 1. LEFT PANEL */}
        <div
          style={{ width: leftWidth }}
          className={`bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-75 ${
            leftWidth === 0 ? 'overflow-hidden' : ''
          }`}
        >
          {leftWidth > 30 && (
            <div className="p-3 space-y-2">
              {/* FOLDER HEADER */}
              <div
                className="flex items-center gap-2 px-2 py-1.5 bg-[#f0f4f9] rounded-sm text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200"
                onClick={() => leftPanelData && setIsFolderOpen(prev => !prev)}
              >
                {isFolderOpen ? (
                  <FaRegFolderOpen className="w-4 h-4 text-blue-500" />
                ) : (
                  <Folder className="w-4 h-4 text-blue-500 fill-blue-500" />
                )}
                <span className="truncate">{storageGroup || "Folder"}</span>
              </div>

              {/* BEFORE FILTER */}
              {!leftPanelData && (
                <div className="flex justify-center text-xs text-slate-400 pt-6">
                  Apply filter to view folders
                </div>
              )}

              {/* SUB ITEMS */}
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

        {/* 2. LEFT RESIZER */}
        <div className="w-[4px] hover:w-[4px] bg-gray-200 cursor-col-resize flex items-center justify-center z-10 relative shrink-0" onMouseDown={startDragLeft}>
          <button
            onClick={(e) => { e.stopPropagation(); toggleLeft(); }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-[25px] bg-blue-800 hover:bg-blue-500 text-white text-[10px] flex items-center justify-center shadow-sm z-20 rounded-sm"
          />
        </div>

        {/* 3. MIDDLE PANEL */}
        <div className={`flex flex-col bg-white min-w-[300px] transition-all duration-300 ${isMiddleCollapsed && showRightPanel ? 'hidden w-0' : 'flex flex-1'}`}>
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ):(
            <GridLayout
              key={refreshKey} 
              columns={filteredColumns} 
              data={rowData}
              onRowClick={handleRowClick}
              height='580px'
              autoSelectFirst={autoSelectFirst}
            />
          )}
        </div>

        {/* 4. RIGHT RESIZER */}
        {showRightPanel && (
          <div 
            className={`w-[4px] hover:w-[4px] bg-gray-200 cursor-col-resize flex items-center justify-center z-10 relative shrink-0 ${isMiddleCollapsed ? 'ms-4' : ''}`} 
            onMouseDown={startDragRight}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleMiddlePanel(); }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-[25px] bg-blue-800 hover:bg-blue-500 text-white text-[10px] flex items-center justify-center shadow-sm z-20 rounded-sm"
            />
          </div>
        )}

        {/* 5. RIGHT PANEL */}
        {showRightPanel && (
          <div
            style={{ width: isMiddleCollapsed ? 'auto' : rightWidth }}
            className={`bg-white border-l border-gray-200 flex flex-col shrink-0 ${isMiddleCollapsed ? 'flex-1' : ''} ${rightWidth === 0 && !isMiddleCollapsed ? 'hidden' : ''}`}
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
   </>
  );
}

export default FtpLayout;
