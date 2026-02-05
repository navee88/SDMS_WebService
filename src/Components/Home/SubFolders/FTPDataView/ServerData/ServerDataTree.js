// import React, { useState } from 'react';
// import { Folder } from 'lucide-react'; 
// import { FaRegFolderOpen } from 'react-icons/fa';

// // --- IMPORT YOUR SEPARATE LOADER COMPONENT HERE ---
// import FullPageLoader from '../../../../Layout/Common/FullPageLoader'; 

// import { TreegridMapping } from "./TreegridMapping";

// // --- 1. Recursive Node Component ---
// const TreeNode = ({ 
//   node, 
//   index, 
//   parentPath, 
//   getSelectTreeData, 
//   filters, 
//   activeFolderId, 
//   setActiveFolderId,
//   onFolderSelect, 
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [childNodes, setChildNodes] = useState([]); 
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Icon only appears AFTER successful data fetch
//   const [hasConfirmedChildren, setHasConfirmedChildren] = useState(false);

// const setActiveFolderIdStore = TreegridMapping((state) => state.setActiveFolderId);
// const cleanNodeName = (node.label || node.NodeName || '').replace(/<[^>]*>?/gm, '').trim();
//   // const cleanNodeName = (node.label || node.NodeName || node.Name || '').replace(/<[^>]*>?/gm, '').trim();


//   // UNIQUE ID
//   const fullPath = parentPath 
//     ? `${parentPath}/${cleanNodeName}`
//     : cleanNodeName;
  
//   const nodeId = fullPath;

//   const getTodayDate = () => {
//     const d = new Date();
//     const day = String(d.getDate()).padStart(2, '0');
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const year = d.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // --- CLICK HANDLER (TEXT LABEL) ---
//   const handleLabelClick = async (e) => {
//     e.stopPropagation();
//     setActiveFolderIdStore(fullPath);
//      console.log("🟢 Tree node clicked:", {
//     rawNode: node,
//     cleanNodeName,
//     fullPath,
//     nodeId,
//   });
//     setActiveFolderId(nodeId);

//     // -----------------------------------------------------------
//     // CHANGE: REMOVE THIS BLOCK COMPLETELY
//     // We do NOT want to toggle (open/close) when clicking text.
//     // -----------------------------------------------------------
//     /* if (hasConfirmedChildren) {
//        setIsOpen(!isOpen); 
//     }
//     */

//     // 2. Fetch Data (Always fetch to update Grid)
//     if (getSelectTreeData) {
//       setIsLoading(true); 
      
//       const today = getTodayDate();
//       const apiNodeName = `<span>${fullPath}`; 

//       const payload = {
//         ...filters,
//         sFTPID: node.sTaskID || node.sFTPID || node.originalData?.sTaskID,
//         sClientID: node.sClientID || filters.sClientID || "",
//         NodeName: apiNodeName, 
//         sFrom: filters.sFrom || today,
//         sTo: filters.sTo || today,
//         sInstrumentClientMappingID: node.sInstrumentClientMappingID || "",
//         nWorkflowStatusCode: filters.nWorkflowStatusCode ?? -1,
//         nFolderHideFlag: filters.nFolderHideFlag ?? 0,
//         sTaskStatusValue: filters.sTaskStatusValue || "",
//       };

//       try {
//         const result = await getSelectTreeData(payload);

//         if (onFolderSelect) {
//             onFolderSelect(result); 
//         }

//         const newChildren = result?.treeNodes || result?.ServerDataTree || [];

//         if (Array.isArray(newChildren) && newChildren.length > 0) {
//            setChildNodes(newChildren);
//            // Only open automatically if it's the FIRST time loading
//            if (!hasConfirmedChildren) setIsOpen(true); 
//            setHasConfirmedChildren(true); 
//         } else {
//            if (!hasConfirmedChildren) setIsOpen(true);
//            setHasConfirmedChildren(newChildren.length > 0); 
//         }

//       } catch (error) {
//         console.error("Error fetching node data:", error);
//         if (!hasConfirmedChildren) setIsOpen(false); 
//       } finally {
//         setIsLoading(false); 
//       }
//     }
//   };

//   // --- CLICK HANDLER (ICON) ---
//   const handleIconClick = (e) => {
//     e.stopPropagation(); 
//     if (!isLoading && hasConfirmedChildren) {
//         setIsOpen(!isOpen);
//     }
//   };

//   const isActive = activeFolderId === nodeId;

//   // --- BORDER LOGIC ---
//   let statusBorderClass = "border-transparent"; 
//   if (node.statusColor === "green") statusBorderClass = "border-green-500";
//   if (node.statusColor === "orange") statusBorderClass = "border-orange-500";
//   if (node.statusColor === "red") statusBorderClass = "border-red-500";

//   // --- SHOW ICON LOGIC ---
//   // CHANGE: Removed 'isLoading'. Now icon only shows if we definitely have children.
//   // This prevents the text from shifting (moving) during the loading phase.
//   const showIcon = hasConfirmedChildren;

//   return (
//     <>
//       {/* RENDER LOADER IF THIS SPECIFIC NODE IS FETCHING */}
//       <FullPageLoader loading={isLoading} text="Loading contents..." />

//       <div className="select-none">
//         <div className="flex items-center gap-1 group mb-1">
          
//           {/* --- ICON AREA --- */}
//           {/* Only renders if data is confirmed. Does NOT render during loading. */}
//           {showIcon && (
//               <div 
//                   className="w-4 h-4 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity"
//                   onClick={handleIconClick}
//               >
//                   {isOpen ? (
//                       <FaRegFolderOpen className="w-4 h-4 text-blue-500" />
//                   ) : (
//                       <Folder className="w-4 h-4 text-blue-500" fill="currentColor" />
//                   )}
//               </div>
//           )}

//           {/* Label Area */}
//           <div
//             onClick={handleLabelClick} 
//             className={`
//               flex-1 py-[6px] px-1.5 text-sm font-medium border-l-[3px] transition-all duration-200 rounded-l-[2px] cursor-pointer
//               ${isActive 
//                 ? 'bg-blue-50/80 border-l-4 border-blue-600 pl-1 shadow-sm' 
//                 : 'hover:bg-gray-50 border-l-4 ' + statusBorderClass + ' pl-1'
//               }
//             `}
//           >
//             <span className="truncate">
//               {cleanNodeName}
//             </span>
//           </div>
//         </div>

//         {/* --- RECURSIVE CHILDREN --- */}
//         {/* Keeps children in memory using CSS hidden, so they persist state */}
//         {hasConfirmedChildren && childNodes.length > 0 && (
//           <div className={`pl-4 border-l border-slate-200 ml-2 space-y-0 ${isOpen ? 'block' : 'hidden'}`}>
//             {childNodes.map((childNode, idx) => (
//               <TreeNode
//                 key={childNode.id || idx}
//                 node={childNode}
//                 index={idx}
//                 parentPath={fullPath} 
//                 getSelectTreeData={getSelectTreeData}
//                 filters={filters}
//                 activeFolderId={activeFolderId}
//                 setActiveFolderId={setActiveFolderId}
//                 onFolderSelect={onFolderSelect}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// };


// // --- 2. Main Component ---
// export default function ServerDataTree({ 
//   storageGroup, 
//   treeNodes, 
//   isLeftLoading, 
//   leftPanelData,
//   getSelectTreeData, 
//   filters = {},
//   onFolderSelect,
   
// }) {
//   const [isFolderOpen, setIsFolderOpen] = useState(true);
//   const [activeFolderId, setActiveFolderId] = useState(null);

//   return (
//     <div className="p-3 space-y-3 overflow-y-auto h-full">
      
//       {/* Root Header */}
//       {storageGroup && (
//         <div
//           className="flex items-center gap-1 px-3 py-2 bg-[#f0f4f9] rounded-lg text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
//           onClick={() => leftPanelData && setIsFolderOpen(prev => !prev)}
//         >
//           {isFolderOpen ? (
//             <FaRegFolderOpen className="w-[18px] h-[18px] text-blue-500" />
//           ) : (
//             <Folder className="w-[18px] h-[18px] text-blue-500 fill-blue-500" />
//           )}
//           <span className="truncate">{storageGroup}</span>
//         </div>
//       )}
        
//       {/* Root Level Loop */}
//       {/* FIX: Removed '&& isFolderOpen' from the condition below.
//          We always render if treeNodes exist, but we hide it via CSS if closed.
//       */}
//       {storageGroup && treeNodes?.length > 0 && (
//         <div 
//           className={`space-y-2 pl-1 ${isFolderOpen ? 'block' : 'hidden'}`}
//         >
//           {treeNodes.map((node, index) => (
//             <TreeNode
//                 key={node.id || index}
//                 node={node}
//                 index={index}
//                 parentPath=""
//                 getSelectTreeData={getSelectTreeData}
//                 filters={filters}
//                 activeFolderId={activeFolderId}
//                 setActiveFolderId={setActiveFolderId}
//                 onFolderSelect={onFolderSelect}
//             />
//           ))}
//         </div>
//       )}
      
//       {/* Empty State / Closed State Message */}
//       {(!treeNodes?.length || !isFolderOpen) && !isLeftLoading && (
//         <div className="text-center pt-10 px-4 text-xs text-slate-400">
//            <Folder className="w-12 h-12 text-slate-300 mb-3 opacity-70 mx-auto" />
//            <p>Select a folder to view contents</p>
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useState, useCallback } from 'react';
// import { Folder } from 'lucide-react'; 
// import { FaRegFolderOpen } from 'react-icons/fa';
// import FullPageLoader from '../../../../Layout/Common/FullPageLoader'; 
// import { TreegridMapping } from "./TreegridMapping"; 

// // --- HELPER TO STRIP HTML TAGS ---
// // We use this everywhere to ensure "<span>Folder</span>" becomes "Folder"
// const cleanName = (name) => {
//   if (!name) return "";
//   return name.replace(/<[^>]*>?/gm, '').trim();
// };

// // --- 1. Recursive Node Component ---
// const TreeNode = ({ 
//   node, 
//   index, 
//   parentPath, 
//   getSelectTreeData, 
//   filters, 
//   onFolderSelect, 
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [childNodes, setChildNodes] = useState([]); 
//   const [isLoading, setIsLoading] = useState(false);
//   const [hasConfirmedChildren, setHasConfirmedChildren] = useState(false);

//   // --- ZUSTAND: Get current active path ---
//   const setActiveFolderIdStore = TreegridMapping((state) => state.setActiveFolderId);
//   const activeFolderId = TreegridMapping((state) => state.activeFolderId);

//   // --- 1. CLEAN THE NAME ---
//   // API often sends "<span>Name</span>" or "Name". We standardize it here.
//   const rawName = node.label || node.NodeName || node.Name || '';
//   const nodeLabel = cleanName(rawName);
  
//   // --- 2. GENERATE UNIQUE ID (FULL PATH) ---
//   // If parent is "Desktop" and this is "Folder", ID becomes "Desktop/Folder"
//   // If parent is empty (Root), ID is just "Desktop"
//   const fullPath = parentPath 
//     ? `${parentPath}/${nodeLabel}`
//     : nodeLabel;
  
//   // --- 3. COMPARE FOR BLUE BORDER ---
//   // We clean the activeFolderId just in case the store has a <span> in it
//   const isActive = cleanName(activeFolderId) === fullPath;

//   // --- HELPER FOR DATE ---
//   const getTodayDate = () => {
//     const d = new Date();
//     const day = String(d.getDate()).padStart(2, '0');
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const year = d.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // --- CLICK HANDLER ---
//   const handleLabelClick = async (e) => {
//     e.stopPropagation();
    
//     // A. Set the Active Border IMMEDIATELY
//     setActiveFolderIdStore(fullPath);
//     console.log("Tree Click -> Active ID set to:", fullPath);

//     // B. Fetch Children (Logic preserved)
//     if (getSelectTreeData) {
//       setIsLoading(true); 
      
//       const today = getTodayDate();
//       // Note: API might REQUIRE the <span> tag for the query, so we add it back here for the payload
//       const apiNodeName = `<span>${fullPath}`; 

//       const payload = {
//         ...filters,
//         sFTPID: node.sTaskID || node.sFTPID || node.originalData?.sTaskID,
//         sClientID: node.sClientID || filters.sClientID || "",
//         NodeName: apiNodeName, 
//         sFrom: filters.sFrom || today,
//         sTo: filters.sTo || today,
//         sInstrumentClientMappingID: node.sInstrumentClientMappingID || "",
//         nWorkflowStatusCode: filters.nWorkflowStatusCode ?? -1,
//         nFolderHideFlag: filters.nFolderHideFlag ?? 0,
//         sTaskStatusValue: filters.sTaskStatusValue || "",
//       };

//       try {
//         const result = await getSelectTreeData(payload);

//         if (onFolderSelect) {
//             onFolderSelect(result); 
//         }

//         const newChildren = result?.treeNodes || result?.ServerDataTree || [];

//         if (Array.isArray(newChildren) && newChildren.length > 0) {
//            setChildNodes(newChildren);
//            if (!hasConfirmedChildren) setIsOpen(true); 
//            setHasConfirmedChildren(true); 
//         } else {
//            if (!hasConfirmedChildren) setIsOpen(true);
//            setHasConfirmedChildren(newChildren.length > 0); 
//         }

//       } catch (error) {
//         console.error("Error fetching node data:", error);
//         if (!hasConfirmedChildren) setIsOpen(false); 
//       } finally {
//         setIsLoading(false); 
//       }
//     }
//   };

//   const handleIconClick = (e) => {
//     e.stopPropagation(); 
//     if (!isLoading && hasConfirmedChildren) {
//         setIsOpen(!isOpen);
//     }
//   };

//   let statusBorderClass = "border-transparent"; 
//   if (node.statusColor === "green") statusBorderClass = "border-green-500";
//   if (node.statusColor === "orange") statusBorderClass = "border-orange-500";
//   if (node.statusColor === "red") statusBorderClass = "border-red-500";

//   return (
//     <>
//       <FullPageLoader loading={isLoading} text="Loading contents..." />

//       <div className="select-none">
//         <div className="flex items-center gap-1 group mb-1">
          
//           {/* ICON */}
//           {hasConfirmedChildren && (
//               <div 
//                   className="w-4 h-4 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity"
//                   onClick={handleIconClick}
//               >
//                   {isOpen ? (
//                       <FaRegFolderOpen className="w-4 h-4 text-blue-500" />
//                   ) : (
//                       <Folder className="w-4 h-4 text-blue-500" fill="currentColor" />
//                   )}
//               </div>
//           )}

//           {/* LABEL CONTAINER */}
//           <div
//             onClick={handleLabelClick} 
//             className={`
//               flex-1 py-[6px] px-1.5 text-sm font-medium border-l-[3px] transition-all duration-200 rounded-l-[2px] cursor-pointer
//               ${isActive 
//                 ? 'bg-blue-50/80 border-l-4 border-blue-600 pl-1 shadow-sm'  // <--- ACTIVE STYLE
//                 : 'hover:bg-gray-50 border-l-4 ' + statusBorderClass + ' pl-1'
//               }
//             `}
//           >
//             <span className="truncate">
//               {nodeLabel} {/* Render the CLEAN name */}
//             </span>
//           </div>
//         </div>

//         {/* RECURSION */}
//         {hasConfirmedChildren && childNodes.length > 0 && (
//           <div className={`pl-4 border-l border-slate-200 ml-2 space-y-0 ${isOpen ? 'block' : 'hidden'}`}>
//             {childNodes.map((childNode, idx) => (
//               <TreeNode
//                 key={childNode.id || idx}
//                 node={childNode}
//                 index={idx}
//                 parentPath={fullPath} // <--- Pass the current Full Path down
//                 getSelectTreeData={getSelectTreeData}
//                 filters={filters}
//                 onFolderSelect={onFolderSelect}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// };


// // --- 2. Main Component ---
// export default function ServerDataTree({ 
//   storageGroup, 
//   treeNodes, 
//   isLeftLoading, 
//   leftPanelData,
//   getSelectTreeData, 
//   filters = {},
//   onFolderSelect,
// }) {
//   const [isFolderOpen, setIsFolderOpen] = useState(true);

//   return (
//     <div className="p-3 space-y-3 overflow-y-auto h-full">
//       {/* Root Header */}
//       {storageGroup && (
//         <div
//           className="flex items-center gap-1 px-3 py-2 bg-[#f0f4f9] rounded-lg text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
//           onClick={() => leftPanelData && setIsFolderOpen(prev => !prev)}
//         >
//           {isFolderOpen ? (
//             <FaRegFolderOpen className="w-[18px] h-[18px] text-blue-500" />
//           ) : (
//             <Folder className="w-[18px] h-[18px] text-blue-500 fill-blue-500" />
//           )}
//           <span className="truncate">{storageGroup}</span>
//         </div>
//       )}
        
//       {/* Root Level Loop */}
//       {storageGroup && treeNodes?.length > 0 && (
//         <div 
//           className={`space-y-2 pl-1 ${isFolderOpen ? 'block' : 'hidden'}`}
//         >
//           {treeNodes.map((node, index) => (
//             <TreeNode
//                 key={node.id || index}
//                 node={node}
//                 index={index}
//                 parentPath="" // Root nodes start with empty parent path
//                 getSelectTreeData={getSelectTreeData}
//                 filters={filters}
//                 onFolderSelect={onFolderSelect}
//             />
//           ))}
//         </div>
//       )}
      
//       {(!treeNodes?.length || !isFolderOpen) && !isLeftLoading && (
//         <div className="text-center pt-10 px-4 text-xs text-slate-400">
//            <Folder className="w-12 h-12 text-slate-300 mb-3 opacity-70 mx-auto" />
//            <p>Select a folder to view contents</p>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Folder } from 'lucide-react'; 
import { FaRegFolderOpen } from 'react-icons/fa';
import FullPageLoader from '../../../../Layout/Common/FullPageLoader'; 
import { TreegridMapping } from "./TreegridMapping"; 

// --- HELPER TO STRIP HTML TAGS ---
const cleanName = (name) => {
  if (!name) return "";
  return String(name).replace(/<[^>]*>?/gm, '').trim();
};

// --- 1. Recursive Node Component ---
const TreeNode = ({ 
  node, 
  index, 
  parentPath, 
  getSelectTreeData, 
  filters, 
  onFolderSelect, 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [childNodes, setChildNodes] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);

  const iconClickRef = useRef(false);
  const userCollapsedRef = React.useRef(false);

  
  // Track if we have already tried to fetch this folder
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false); 
  const [hasConfirmedChildren, setHasConfirmedChildren] = useState(false);

  // --- ZUSTAND: Get current active path ---
  const setActiveFolderIdStore = TreegridMapping((state) => state.setActiveFolderId);
  const activeFolderId = TreegridMapping((state) => state.activeFolderId);

  // NEW: Get Cache Actions
  const folderCache = TreegridMapping((state) => state.folderCache);
  const cacheFolderData = TreegridMapping((state) => state.cacheFolderData);

  // --- 1. CLEAN THE NAME & GENERATE PATH ---
  const rawName = node.label || node.NodeName || node.Name || '';
  const nodeLabel = cleanName(rawName);

  const fullPath = parentPath 
    ? `${parentPath}/${nodeLabel}`
    : nodeLabel;
  
  const cleanActiveId = cleanName(activeFolderId || "");

  console.log("Heoo =>",cleanActiveId);

  // const isActive = (cleanActiveId === fullPath);

const isActive = cleanActiveId && cleanActiveId === fullPath;

  // --- NEW EFFECT: LISTEN TO CACHE ---
  // If ServerData.jsx fetched data for this folder, it appears in folderCache.
  // We grab it and skip our own fetch.
  useEffect(() => {
    if (folderCache[fullPath]) {
      setChildNodes(folderCache[fullPath]);
      setHasConfirmedChildren(true);
      setHasAttemptedFetch(true);
      // If we have data and we are the active target, ensure we are open
      // (Optional: depends on preference)
      // if (isActive) setIsOpen(true); 
    }
  }, [folderCache, fullPath, isActive]);

  // --- HELPER FOR DATE ---
  const getTodayDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // --- 2. REUSABLE FETCH FUNCTION ---
  const fetchNodeData = useCallback(async () => {
    if (isLoading) return;

    // Check Cache first!
    if (folderCache[fullPath]) {
        setChildNodes(folderCache[fullPath]);
        return;
    }

    if (hasAttemptedFetch && childNodes.length === 0) return;
    if (childNodes.length > 0 && hasConfirmedChildren) return;

    setIsLoading(true);
    const today = getTodayDate();
    const apiNodeName = `<span>${fullPath}`; 

    const payload = {
      ...filters,
      sFTPID: node.sTaskID || node.sFTPID || node.originalData?.sTaskID,
      sClientID: node.sClientID || filters.sClientID || "",
      NodeName: apiNodeName, 
      sFrom: filters.sFrom || today,
      sTo: filters.sTo || today,
      sInstrumentClientMappingID: node.sInstrumentClientMappingID || node.sInstrumentID || filters.sInstrumentID || "",
      nWorkflowStatusCode: filters.nWorkflowStatusCode ?? -1,
      nFolderHideFlag: filters.nFolderHideFlag ?? 0,
      sTaskStatusValue: filters.sTaskStatusValue || "",
    };

    try {
      if (getSelectTreeData) {
        const result = await getSelectTreeData(payload);

        const newChildren = result?.treeNodes || result?.ServerDataTree || [];

        if (Array.isArray(newChildren) && newChildren.length > 0) {
           setChildNodes(newChildren);
           setHasConfirmedChildren(true); 
        } else {
           setHasConfirmedChildren(false); 
        }
        setHasAttemptedFetch(true);

      }
    } catch (error) {
      console.error("Error fetching node data:", error);
      setHasAttemptedFetch(true);
    } finally {
      setIsLoading(false); 
    }
  }, [fullPath, filters, node, getSelectTreeData, isLoading, childNodes.length, hasConfirmedChildren, hasAttemptedFetch,folderCache, cacheFolderData]);


 // --- 3. [FIXED] AUTO-EXPAND EFFECT ---
useEffect(() => {
  if (!cleanActiveId) return;

  const isExactMatch = cleanActiveId === fullPath;
  const isAncestor = cleanActiveId.startsWith(fullPath + '/');

  if (userCollapsedRef.current) return;

  if (isExactMatch || isAncestor) {
    if (!isOpen) setIsOpen(true);

    if (
      (isAncestor || isExactMatch) &&
      childNodes.length === 0 &&
      !hasAttemptedFetch &&
      !isLoading &&
      !folderCache[fullPath]
    ) {
      fetchNodeData();
    }
  }
}, [
  cleanActiveId,
  fullPath,
  isOpen,
  childNodes.length,
  hasAttemptedFetch,
  isLoading,
  folderCache
]);



// ServerDataTree.jsx -> TreeNode Component

useEffect(() => {
if (node.originalData?.ServerDataTree) {
     setChildNodes(node.originalData.ServerDataTree);
     setHasConfirmedChildren(true);
         setHasAttemptedFetch(true);
  }
  else if (folderCache[fullPath]) {
         setChildNodes(folderCache[fullPath]);
         setHasConfirmedChildren(true);
         setHasAttemptedFetch(true);
    }
}, [node, folderCache, fullPath]);

  // --- CLICK HANDLER ---
  const handleLabelClick = async (e) => {
    e.stopPropagation();
    setActiveFolderIdStore(fullPath);

    if (getSelectTreeData) {
        setIsLoading(true);
        const today = getTodayDate();
        const apiNodeName = `<span>${fullPath}`; 
        
        const payload = {
            ...filters,
            sFTPID: node.sTaskID || node.sFTPID || node.originalData?.sTaskID,
            sClientID: node.sClientID || filters.sClientID || "",
            NodeName: apiNodeName, 
            sFrom: filters.sFrom || today,
            sTo: filters.sTo || today,
           sInstrumentClientMappingID: node.sInstrumentClientMappingID || node.sInstrumentID || filters.sInstrumentID || "",
            nWorkflowStatusCode: filters.nWorkflowStatusCode ?? -1,
            nFolderHideFlag: filters.nFolderHideFlag ?? 0,
            sTaskStatusValue: filters.sTaskStatusValue || "",
        };

        try {
            const result = await getSelectTreeData(payload);

            console.log("Child Path", result);
            
            if (onFolderSelect) onFolderSelect(result);

            const newChildren = result?.treeNodes ?? [];

            console.log("Children name:", newChildren);

            if (Array.isArray(newChildren) && newChildren.length > 0) {
                setChildNodes(newChildren);
                setHasConfirmedChildren(true);
                setIsOpen(true); 
                cacheFolderData(fullPath, newChildren);
            } else {
              setChildNodes([]);
                setHasConfirmedChildren(false);
                cacheFolderData(fullPath, []);
            }
            setHasAttemptedFetch(true);

        } catch(err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }
  };

const handleIconClick = (e) => {
  e.stopPropagation();

  setIsOpen(prev => {
    if (prev === true) {
      // User is manually collapsing
      userCollapsedRef.current = true;
    } else {
      // User is manually expanding
      userCollapsedRef.current = false;
    }
    return !prev;
  });
};


  let statusBorderClass = "border-transparent"; 
  if (node.statusColor === "green") statusBorderClass = "border-green-500";
  if (node.statusColor === "orange") statusBorderClass = "border-orange-500";
  if (node.statusColor === "red") statusBorderClass = "border-red-500";

  return (
    <>
      <FullPageLoader loading={isLoading} text="Loading contents..." />

      <div className="select-none">
        <div className="flex items-center gap-1 group mb-1">
          {/* {(isActive || isOpen) && hasConfirmedChildren && childNodes.length > 0 && ( */}
          {hasConfirmedChildren && childNodes.length > 0 && (
  <div 
      className="w-4 h-4 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity"
      onClick={handleIconClick}
  >
      {isOpen ? (
          <FaRegFolderOpen className="w-4 h-4 text-blue-500" />
      ) : (
          <Folder className="w-4 h-4 text-blue-500" />
      )}
  </div>
)}
          {hasAttemptedFetch && childNodes.length === 0}

          <div
            onClick={handleLabelClick} 
            className={`
              flex-1 py-[6px] px-1.5 text-sm font-medium border-l-[3px] transition-all duration-200 rounded-l-[2px] cursor-pointer
              ${isActive 
                ? 'bg-blue-50/80 border-l-4 border-blue-600 pl-1 shadow-sm' 
                : 'hover:bg-gray-50 border-l-4 ' + statusBorderClass + ' pl-1'
              }
            `}
          >
            <span className="truncate">{nodeLabel}</span>
          </div>
        </div>

        {childNodes.length > 0 && (
          <div className={`pl-4 border-l border-slate-200 ml-2 space-y-0 ${isOpen ? 'block' : 'hidden'}`}>
            {childNodes.map((childNode, idx) => (
              <TreeNode
                key={childNode.id || idx}
                node={childNode}
                index={idx}
                parentPath={fullPath} 
                getSelectTreeData={getSelectTreeData}
                filters={filters}
                onFolderSelect={onFolderSelect}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default function ServerDataTree({ 
  storageGroup, 
  treeNodes, 
  isLeftLoading, 
  leftPanelData,
  getSelectTreeData, 
  filters = {},
  onFolderSelect,
}) {
  const [isFolderOpen, setIsFolderOpen] = useState(true);

  const activeFolderId = TreegridMapping((state) => state.activeFolderId);
  const setActiveFolderId = TreegridMapping((state) => state.setActiveFolderId);
  // const activeFolderId = TreegridMapping((state) => state.activeFolderId);

  const handleRootClick = async (e) => {
    e.stopPropagation();

    // A. Visuals: Ensure it's open and set active state
    setIsFolderOpen(true); 
    setActiveFolderId(storageGroup); // Set root as active

    // B. Data Fetching: Reload Initial Data
    if (getSelectTreeData && leftPanelData) {
       try {
           // Construct payload for the Root
           // We use the existing filters (which contains sFTPID, sClientID, etc.)
           // and set NodeName to the storageGroup (or empty string depending on your API reqs for root)
           const apiNodeName = storageGroup; 

           const payload = {
               ...filters,
               NodeName: apiNodeName, 
               sInstrumentClientMappingID: filters.sInstrumentID || "",
               nFolderHideFlag: filters.nFolderHideFlag ?? 0, 
           };

           // C. Call API
           const result = await getSelectTreeData(payload);
           
           console.log(result);

           // D. Pass result back to Parent (ServerData.jsx) to update Grid
           if (onFolderSelect) {
               onFolderSelect(result);
           }
       } catch (error) {
           console.error("Failed to load root data", error);
       }
    }
  };

  const isRootActive = activeFolderId === storageGroup;

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full">
     {storageGroup && (
        <div
          className={`
            flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors border-l-1
            ${isRootActive 
               ? "bg-blue-50 border-blue-600 text-blue-800 shadow-sm"  // Active Styles
               : "bg-[#d5e3f5] border-transparent text-slate-700 hover:bg-slate-200" // Default Styles
            }
          `}
          onClick={handleRootClick} 
        >
          {/* Icon Logic: Toggle only if we click the icon specifically, or keep logic simple */}
          <div onClick={(e) => { e.stopPropagation(); setIsFolderOpen(p => !p); }}>
              {isFolderOpen ? (
                <FaRegFolderOpen className="w-[18px] h-[18px] text-blue-500" />
              ) : (
                <Folder className="w-[18px] h-[18px] text-blue-500 fill-blue-500" />
              )}
          </div>
          <span className="truncate select-none">{storageGroup}</span>
        </div>
      )}
        
      {storageGroup && treeNodes?.length > 0 && (
        <div 
          className={`space-y-2 pl-1 ${isFolderOpen ? 'block' : 'hidden'}`}
        >
          {treeNodes.map((node, index) => (
            <TreeNode
                key={`${node.id || index}-${activeFolderId}`}
                node={node}
                index={index}
                parentPath="" 
                getSelectTreeData={getSelectTreeData}
                filters={filters}
                onFolderSelect={onFolderSelect}
            />
          ))}
        </div>
      )}
      
      {(!treeNodes?.length || !isFolderOpen) && !isLeftLoading && (
        <div className="text-center pt-10 px-4 text-xs text-slate-400">
           <Folder className="w-12 h-12 text-slate-300 mb-3 opacity-70 mx-auto" />
           <p>Select a folder to view contents</p>
        </div>
      )}
    </div>
  );
}