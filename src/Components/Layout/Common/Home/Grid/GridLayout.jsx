import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOnClickOutside, useDebounceValue, useLocalStorage } from 'usehooks-ts';
import { AiOutlineSortAscending } from "react-icons/ai";
import { TbSortDescendingLetters } from "react-icons/tb";
import { CgPlayListRemove } from "react-icons/cg";
import { useTranslation } from "react-i18next";

// --- Static Constants & Helpers ---
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const areSetsEqual = (setA, setB) => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};

// --- Styles ---
const GlobalGridStyles = () => (
  <style>
    {`
      .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    `}
  </style>
);

// --- Icons ---
const SearchIcon = () => (
  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const ArrowDownIcon = () => (
  <svg className="w-3 h-3 text-gray-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// --- Sub-Components ---
const ColGroupDefinition = ({ columns, colWidths, showDefaultSelectionColumn }) => (
  <colgroup>
    {showDefaultSelectionColumn && <col style={{ width: '50px', minWidth: '50px' }} />}
    {columns.map(col => (
      <col key={col.key} style={{ width: colWidths[col.key], minWidth: colWidths[col.key] }} />
    ))}
  </colgroup>
);

// --- Table Header Cell ---
const TableHeaderCell = React.memo(({
  colKey, label, width, isActive, onToggle, onSort, sortConfig, isLast, onResizeStart, 
  isSelectionColumn, hideHeaderSelection, enableSort, isAllSelected, onToggleAll
}) => {
  const containerRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, width: 0 });

  useOnClickOutside(containerRef, () => { 
    if (isActive) onToggle(null); 
  });
  
  useEffect(() => {
    if (isActive) {
      const handleScroll = () => onToggle(null);
      window.addEventListener('scroll', handleScroll, { capture: true });
      return () => window.removeEventListener('scroll', handleScroll, { capture: true });
    }
  }, [isActive, onToggle]);

  const isSortable = (enableSort === true) || (enableSort !== false && !isSelectionColumn);

  const isCurrentlySorted = sortConfig.key === colKey;
  const isAsc = isCurrentlySorted && sortConfig.direction === 'asc';
  const isDesc = isCurrentlySorted && sortConfig.direction === 'desc';

  const handleToggle = (e) => {
    if (!isSortable) return;
    
    if (!isActive && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width
        });
    }
    onToggle(isActive ? null : colKey);
  };

  return (
    <th
      className={`relative px-4 py-3 text-[14px] font-bold text-gray-600 capitalize tracking-wider bg-white border-b border-gray-200 group hover:bg-gray-50 select-none ${isSortable ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ width: width, minWidth: width }}
    >
      <div
        ref={containerRef}
        className="flex items-center justify-between h-full gap-2"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="truncate text-gray-600">{label}</span>
          {isSelectionColumn && !hideHeaderSelection && (
            <div className="flex items-center justify-center h-full">
              <input type="checkbox" className="cursor-pointer w-[14px] h-[14px] accent-blue-600 rounded border-gray-300 focus:ring-blue-500" checked={isAllSelected} onChange={(e) => { e.stopPropagation(); onToggleAll(); }} onClick={(e) => e.stopPropagation()} />
            </div>
          )}
        </div>
        {isSortable && (
          <>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig.key === colKey ? 'opacity-100' : ''}`}>
              <ArrowDownIcon />
            </div>
            
            {isActive && createPortal(
              <div
                className="bg-white border border-gray-200 rounded shadow-lg py-1 text-left font-normal normal-case w-48"
                style={{
                  position: 'fixed',
                  zIndex: 99999,
                  top: `${coords.top + 4}px`,
                  left: isLast ? `${coords.right - 192}px` : `${coords.left}px`, 
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  disabled={isAsc}
                  onClick={() => !isAsc && onSort(colKey, 'asc')} 
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm ${isAsc ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Sort Ascending <span className={`text-[20px] ${isAsc ? 'text-gray-400' : 'text-green-900'}`}><AiOutlineSortAscending /></span>
                </button>
                <button 
                  disabled={isDesc}
                  onClick={() => !isDesc && onSort(colKey, 'desc')} 
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm ${isDesc ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Sort Descending <span className={`text-[18px] ${isDesc ? 'text-gray-400' : 'text-green-900'}`}><TbSortDescendingLetters /></span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button 
                  disabled={!isCurrentlySorted}
                  onClick={() => isCurrentlySorted && onSort(null, 'asc')} 
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm ${!isCurrentlySorted ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Remove Sort <span className={`text-[20px] ${!isCurrentlySorted ? 'text-gray-400' : 'text-red-500'}`}><CgPlayListRemove /></span>
                </button>
              </div>,
              document.body
            )}
          </>
        )}
      </div>
      <div onMouseDown={(e) => onResizeStart(e, colKey)} onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-30" />
    </th>
  );
});

// --- Table Row ---
const TableRow = React.memo(({ 
  row, rowIndex, columns, isSelected, isChecked, showDefaultSelectionColumn,onRowClick, onRowDoubleClick,onToggleRow, currentRows, 
}) => {
  const rowKey = row._gridId;

  const clickTimeoutRef = useRef(null);

  const handleClick = (e) => {
    // If user clicked directly on a checkbox input, do not run row click logic
    if (e.target.type === 'checkbox') return;

    if (clickTimeoutRef.current) {
      // --- DOUBLE CLICK DETECTED ---
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      
      console.log('double clicking'); // <--- YOUR LOG
      
      if (onRowDoubleClick) {
        onRowDoubleClick(row, e);
      }
    } else {
      // --- SINGLE CLICK DETECTED (WAITING) ---
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        
        console.log('single click'); // <--- YOUR LOG
        
        if (onRowClick) {
          onRowClick(row, e);
        }
      }, 250); // 250ms delay to wait for potential 2nd click
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick(row, e);
    }
  };

  const getCellContent = (col) => {
    if (col.render) return col.render(row, isSelected, rowIndex, currentRows);
    
    if (col.isDate) {
      const d = new Date(row[col.key]);
      const formatted = !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }) : '-';
      return <span className={isSelected ? 'text-gray-900' : 'text-gray-600'}>{formatted}</span>;
    }
    return row[col.key];
  };

  return (
    <tr 
     onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`cursor-pointer transition-colors text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-100 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}
    >
      {showDefaultSelectionColumn && (
        <td className={`px-4 py-3 border-b border-gray-100 text-center align-middle ${isSelected ? 'border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}>
          <div className="flex items-center justify-center h-full">
            <input 
              type="checkbox" 
              checked={isChecked} 
              onChange={() => onToggleRow(rowKey)} 
              onClick={(e) => e.stopPropagation()} 
              className="cursor-pointer w-4 h-4 accent-blue-600 rounded border-gray-300 focus:ring-blue-500" 
            />
          </div>
        </td>
      )}
      {columns.map((col, colIndex) => {
        let showCheckbox = false;
        let isNA = false;
        if (col.isSelectionColumn) {
          const checkVal = col.getCheckValue ? col.getCheckValue(row) : null;
          if (checkVal === 'NA') isNA = true; else showCheckbox = true;
        }
        
        return (
          <td 
            key={`${rowKey}-${col.key}`} 
            className={`px-4 py-3 truncate border-b border-gray-100 ${!showDefaultSelectionColumn && isSelected && colIndex === 0 ? 'border-l-4 border-l-blue-600' : 'border-l-transparent'} ${!showDefaultSelectionColumn && colIndex === 0 ? 'border-l-4' : ''}`}
          >
            {col.isSelectionColumn ? (
              <div className="flex items-center justify-center gap-3">
                {isNA && <div className="w-5 h-5 flex items-center justify-center"><span className="text-gray-600 font-semibold select-none text-[13px]">NA</span></div>}
                {showCheckbox && (
                  <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={() => onToggleRow(rowKey)} 
                    onClick={(e) => e.stopPropagation()} 
                    className="cursor-pointer w-[15px] h-[15px] accent-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                  />
                )}
                {getCellContent(col)}
              </div>
            ) : getCellContent(col)}
          </td>
        );
      })}
    </tr>
  );
}, (prevProps, nextProps) => {
    return (
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isChecked === nextProps.isChecked &&
        prevProps.row === nextProps.row &&
        prevProps.columns === nextProps.columns
    );
});

// --- MAIN GRID COMPONENT ---
const GridLayout = ({ 
  columns, 
  data, 
  getRowId, 
  renderDetailPanel, 
  enableSelection, 
  onSelectionChange, 
  initialSelectedIds = [],
  hidePagination = false, 
  manualPagination = false, 
  totalRows = 0,            
  page = 1,                 
  pageSize = 10,            
  onPageChange,             
  onPageSizeChange,
  onRowClick,
  onRowDoubleClick,
  height = '610px',
  hideFilterRow = false,
  autoSelectFirst = true,
  externalSelectedId = null,
  detailPanelWidth = '50%',
  externalDetailData = null // <--- NEW PROP
}) => {
  const { t } = useTranslation();
  
  const headerRef = useRef(null);
  const bodyRef = useRef(null);

  const visibleColumns = useMemo(
    () => columns.filter(col => !col.hidden),
    [columns]
  );

  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({});
  const [debouncedFilters] = useDebounceValue(filters, 300);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeMenuColumn, setActiveMenuColumn] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const [colWidths, setColWidths] = useState(() =>
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.width}), {})
  );

  const [localPage, setLocalPage] = useState(1);
  const [localRowsPerPage, setLocalRowsPerPage] = useLocalStorage('commonTableRows', 10);

  const activePage = manualPagination ? page : localPage;
  const activeRowsPerPage = manualPagination ? pageSize : (localRowsPerPage || 10);
  
  const safeData = useMemo(() => {
    return data.map((row, index) => {
      const uniqueKey = getRowId ? getRowId(row) : (row.id ? row.id : `row-${index}`);
      return { ...row, _gridId: uniqueKey };
    });
  }, [data, getRowId]);

  const processedData = useMemo(() => {
    let result = [...safeData];

    if (Object.keys(debouncedFilters).length > 0) {
      result = result.filter(row =>
        Object.keys(debouncedFilters).every(key => {
          const filterValue = debouncedFilters[key]?.toLowerCase();
          if (!filterValue) return true;

          const cellValue = row[key];
          if (cellValue === null || cellValue === undefined) return false;
          
          if (DATE_REGEX.test(filterValue) && typeof cellValue === 'string') {
            return cellValue.startsWith(filterValue);
          }
          const strValue = String(cellValue).toLowerCase();
          return strValue.includes(filterValue);
        })
      );
    }
   
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const isNum = typeof valA === 'number' && typeof valB === 'number';
        let comparison = 0;

        if (isNum) {
            comparison = valA - valB;
        } else {
            comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        }
        
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return result;
  }, [safeData, debouncedFilters, sortConfig]);

  const currentRows = useMemo(() => {
    if (hidePagination || manualPagination) return processedData; 

    const rowsPerPage = activeRowsPerPage > 0 ? activeRowsPerPage : 10;
    const indexOfLastRow = activePage * rowsPerPage;
    const indexOfFirstRow = Math.max(0, indexOfLastRow - rowsPerPage);
    
    return processedData.slice(indexOfFirstRow, indexOfLastRow);
  }, [processedData, activePage, activeRowsPerPage, manualPagination, hidePagination]);

  const totalCount = manualPagination ? (totalRows || 0) : processedData.length;
  const totalPages = Math.ceil(totalCount / activeRowsPerPage);
  
  const indexOfFirstRowCalc = (activePage - 1) * activeRowsPerPage;
  const displayStart = totalCount === 0 ? 0 : indexOfFirstRowCalc + 1;
  const displayEnd = Math.min(indexOfFirstRowCalc + currentRows.length, totalCount);

  // --- Handlers ---
  const handlePageChange = useCallback((newPage) => {
    if (manualPagination) { if (onPageChange) onPageChange(newPage); } 
    else { setLocalPage(newPage); }
  }, [manualPagination, onPageChange]);

  const handlePageSizeChange = useCallback((newSize) => {
    const size = Number(newSize);
    if (manualPagination) { if (onPageSizeChange) onPageSizeChange(size); } 
    else { setLocalRowsPerPage(size); setLocalPage(1); }
  }, [manualPagination, onPageSizeChange, setLocalRowsPerPage]);

  const customSelectionColumnKey = useMemo(() => {
    const col = visibleColumns.find(c => c.isSelectionColumn);
    return col ? col.key : null;
  }, [visibleColumns]);
  
  const showDefaultSelectionColumn = enableSelection && !customSelectionColumnKey;

  const handleBodyScroll = useCallback((e) => {
    if (headerRef.current) {
        headerRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  useEffect(() => {
    const newSet = new Set();
    safeData.forEach(row => {
      if (row.checkStatus === 1 || row.checkStatus === true) {
        newSet.add(row._gridId);
      } else if (initialSelectedIds.length > 0 && initialSelectedIds.includes(row._gridId)) {
        newSet.add(row._gridId);
      }
    });
    setSelectedIds(prev => areSetsEqual(prev, newSet) ? prev : newSet);
  }, [initialSelectedIds, safeData]); 

  const handleSelectionUpdate = useCallback((newSet) => {
    setSelectedIds(newSet);
    if (onSelectionChange) {
      const selectedRows = safeData.filter(row => newSet.has(row._gridId));
      onSelectionChange(selectedRows);
    }
  }, [onSelectionChange, safeData]);

  const selectableRows = useMemo(() => currentRows.filter(row => {
    if (!customSelectionColumnKey) return true;
    const col = visibleColumns.find(c => c.key === customSelectionColumnKey);
    return col && col.getCheckValue ? col.getCheckValue(row) !== 'NA' : true;
  }), [currentRows, customSelectionColumnKey, visibleColumns]);

  const isAllSelected = useMemo(() => 
    selectableRows.length > 0 && selectableRows.every(row => selectedIds.has(row._gridId)),
    [selectableRows, selectedIds]
  );

  const toggleAll = useCallback(() => {
    const newSet = new Set(selectedIds);
    if (isAllSelected) selectableRows.forEach(row => newSet.delete(row._gridId));
    else selectableRows.forEach(row => newSet.add(row._gridId));
    handleSelectionUpdate(newSet);
  }, [selectedIds, isAllSelected, selectableRows, handleSelectionUpdate]);

  const toggleRow = useCallback((uniqueKey) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(uniqueKey)) newSet.delete(uniqueKey);
    else newSet.add(uniqueKey);
    handleSelectionUpdate(newSet);
  }, [selectedIds, handleSelectionUpdate]);

  const handleSort = useCallback((key, direction) => {
    setSortConfig({ key, direction });
    setActiveMenuColumn(null);
  }, []);

  const handleRowClick = useCallback((row) => {
    setSelectedItem(row);
    if(onRowClick) onRowClick(row);
  }, [onRowClick]);

  const startResize = useCallback((e, colKey) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[colKey];
    
    const onMouseMove = (moveEvent) => {
        setColWidths(prev => ({ 
            ...prev, 
            [colKey]: Math.max(50, startWidth + (moveEvent.clientX - startX)) 
        }));
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [colWidths]);


  // useEffect(() => {
  //   if (externalSelectedId) {
  //       const externalRow = safeData.find(r => r._gridId === externalSelectedId);
  //       if (externalRow) {
  //           setSelectedItem(externalRow);
  //           return;
  //       }
  //   }
  //   if (autoSelectFirst && safeData.length > 0 && !externalSelectedId) {
  //       setSelectedItem(prev => {
  //           if (!prev) return safeData[0];
  //           const stillExists = safeData.find(r => r._gridId === prev._gridId);
  //           return stillExists || safeData[0];
  //       });
  //   }
  // }, [safeData, autoSelectFirst, externalSelectedId]);

  
  useEffect(() => {
  // 1. If an external ID is provided, find and select that row
  if (externalSelectedId) {
    const externalRow = safeData.find(r => r._gridId === externalSelectedId);
    if (externalRow) {
      setSelectedItem(externalRow);
      return;
    }
  }

  // 2. If externalSelectedId is explicitly null, clear the selection
  if (externalSelectedId === null) {
    setSelectedItem(null);
    return;
  }

  // 3. Handle Auto-Selection logic
  if (autoSelectFirst && safeData.length > 0) {
    setSelectedItem(prev => {
      // If we already had a selection, check if it still exists in the new data
      const stillExists = prev ? safeData.find(r => r._gridId === prev._gridId) : null;
      
      // If it exists, keep it. If not, pick the first row.
      return stillExists || safeData[0];
    });
  } else if (!autoSelectFirst && !externalSelectedId) {
    // 4. CRITICAL FIX: If auto-select is OFF and no external ID is passed, 
    // clear the selection when data changes (e.g., navigating to a new folder)
    setSelectedItem(null);
  }
}, [safeData, autoSelectFirst, externalSelectedId]);


  useEffect(() => {
    if (!manualPagination) setLocalPage(1);
  }, [debouncedFilters, sortConfig, manualPagination]);

  // --- DERIVE DETAIL ITEM ---
  // If externalDetailData is provided, use it. Otherwise, use the grid selectedItem.

  const handleRowClickInternal = useCallback((row) => {
    setSelectedItem(row);
    // Note: We don't call onRowClick here anymore, it is handled inside TableRow via timeout
    // But we still need to update internal state
  }, []);

  const itemToRenderInDetail = externalDetailData || selectedItem;

  return (
    <>
      <GlobalGridStyles />
      <div className="flex w-full p-2 gap-4 overflow-hidden h-full">
        <div 
          className={`flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-w-0 transition-all duration-300`}
          style={{ 
             height: height,
             width: renderDetailPanel ? `calc(100% - ${detailPanelWidth})` : '100%' 
          }}
        >
          <div 
            ref={headerRef}
            // className="flex-none bg-white border-b border-gray-200 z-10 overflow-x-hidden"
            className="flex-none bg-white border-b border-gray-200 z-10 overflow-x-hidden"
          >
            <table className="table-fixed border-separate border-spacing-0 w-full">
               <ColGroupDefinition 
                 columns={visibleColumns} 
                 colWidths={colWidths} 
                 showDefaultSelectionColumn={showDefaultSelectionColumn} 
               />
              <thead className="bg-white">
                <tr>
                  {showDefaultSelectionColumn && (
                    <th className="relative px-4 py-3 w-[50px] bg-white border-b border-gray-200 text-center">
                      <div className="flex items-center justify-center">
                        <input type="checkbox" className="cursor-pointer w-5 h-5 accent-blue-600 rounded border-gray-300 focus:ring-blue-500" checked={isAllSelected} onChange={toggleAll} />
                      </div>
                    </th>
                  )}
                  {visibleColumns.map((col, index) => (
                    <TableHeaderCell
                      key={col.key}
                      colKey={col.key}
                      label={col.label}
                      width={colWidths[col.key]}
                      isActive={activeMenuColumn === col.key}
                      onToggle={setActiveMenuColumn}
                      onSort={handleSort}
                      sortConfig={sortConfig}
                      isLast={index === visibleColumns.length - 1}
                      onResizeStart={startResize}
                      isSelectionColumn={col.isSelectionColumn}
                      hideHeaderSelection={col.hideHeaderSelection}
                      enableSort={col.enableSort}
                      isAllSelected={isAllSelected}
                      onToggleAll={toggleAll}
                    />
                  ))}
                </tr>
                
                {!hideFilterRow && (
                  <tr>
                    {showDefaultSelectionColumn && <th className="relative px-2 py-2 bg-gray-50 border-b border-gray-200"></th>}
                    {visibleColumns.map((col) => (
                      <th key={col.key} className="relative px-2 py-2 bg-gray-50 border-b border-gray-200">
                        {col.enableSearch ? (
                          col.inputType === 'date' ? (
                            <div className="relative flex items-center w-full">
                              <input 
                                type="text" 
                                className="w-full pl-2 pr-8 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-600"
                                placeholder="YYYY-MM-DD"
                                value={filters[col.key] || ''} 
                                onChange={(e) => setFilters({ ...filters, [col.key]: e.target.value })} 
                              />
                              <div className="absolute right-2 top-1.5 pointer-events-none"><CalendarIcon /></div>
                              <input 
                                type="date"
                                className="absolute right-0 top-0 bottom-0 w-8 opacity-0 cursor-pointer"
                                value={filters[col.key] || ''}
                                onChange={(e) => { if (e.target.value) setFilters({ ...filters, [col.key]: e.target.value }); }}
                              />
                            </div>
                          ) : (
                            <div className="relative">
                              <input type="text" className="w-full pl-2 z-10 pr-7 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500" value={filters[col.key] || ''} onChange={(e) => setFilters({ ...filters, [col.key]: e.target.value })} placeholder="Search..." />
                              <div className="absolute right-2 top-1.5"><SearchIcon /></div>
                            </div>
                          )
                        ) : <div className="h-[26px]"></div>}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
            </table>
          </div>

          <div 
            ref={bodyRef}
            onScroll={handleBodyScroll}
            className="custom-scrollbar flex-grow overflow-y-auto overflow-x-auto" 
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}
          >
            <table className="table-fixed border-separate border-spacing-0 w-full">
               <ColGroupDefinition 
                 columns={visibleColumns} 
                 colWidths={colWidths} 
                 showDefaultSelectionColumn={showDefaultSelectionColumn} 
               />
              <tbody>
                {currentRows.map((row, rowIndex) => {
                  const isSelected = selectedItem && row._gridId === selectedItem._gridId;
                  const isChecked = selectedIds.has(row._gridId);
                  
                  return (
                    <TableRow 
                      key={row._gridId}
                      row={row}
                      rowIndex={rowIndex}
                      columns={visibleColumns} 
                      isSelected={isSelected}
                      isChecked={isChecked}
                      showDefaultSelectionColumn={showDefaultSelectionColumn}
                     onRowClick={(r, e) => {
                          handleRowClickInternal(r); // Update internal selectedItem state
                          if(onRowClick) onRowClick(r, e); // Call Parent Handler
                      }}
                      onRowDoubleClick={onRowDoubleClick} // Pass the prop down
                      onToggleRow={toggleRow}
                      currentRows={currentRows} 
                    />
                  );
                })}
              </tbody>
            </table>
            {processedData.length === 0 && <div className="flex w-full items-center justify-center p-8 text-gray-400">{t('errormsg.noresultsfound')}</div>}
          </div>

          {!hidePagination && (
            <div className="px-4 py-3 z-10 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs sm:text-sm shrink-0">
              <div className="flex items-center gap-2 text-gray-600">
                <span>Rows per page:</span>
                <select 
                  value={activeRowsPerPage} 
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))} 
                  className="border border-gray-300 rounded px-1 py-0.5 bg-white focus:outline-none focus:border-blue-500"
                >
                  {[10, 20, 30, 40, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">
                   {totalCount > 0 ? `${displayStart}-${displayEnd} of ${totalCount}` : '0-0 of 0'}
                </span> 
                <div className="flex items-center gap-1">
                  <button onClick={() => handlePageChange(activePage - 1)} disabled={activePage === 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeftIcon /></button>
                  <button onClick={() => handlePageChange(activePage + 1)} disabled={activePage >= totalPages || totalPages === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRightIcon /></button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {renderDetailPanel && (
          <div 
            className="bg-white rounded-md shadow-sm border border-gray-200 p-3 custom-scrollbar transition-all duration-300"
            style={{ 
              height: height, 
              width: detailPanelWidth, 
              overflowY: 'auto', 
              scrollbarWidth: 'thin', 
              scrollbarColor: '#cbd5e1 #f1f5f9' 
            }}
          >
            {/* UPDATED LOGIC: If we have an item (either from selection or external prop), show it. */}
            {itemToRenderInDetail ? renderDetailPanel(itemToRenderInDetail) : <div className="text-gray-400 text-center mt-10">{t('errormsg.noresultsfound')}</div>}
          </div>
        )}
      </div>
    </>
  );
};

export default GridLayout;