// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout'; 
// import AuditTrail from '../../../../Layout/Common/AuditTrail';
// import servicecall from "../../../../../Services/servicecall";
// import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
// import { AR_ajaxCall } from "../Configuration/Common/AR_ajaxCall";

// const StorageMappingForm = ({ 
//   initialData, 
//   onSubmit, 
//   onClose,
//   onSuccessRefresh = () => {}
// }) => {
//   const { postData } = servicecall();
//   const queryClient = useQueryClient();

//   const [showAuditTrail, setShowAuditTrail] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [formData, setFormData] = useState({
//     storageName: '',
//     groupName: '',
//   });

//   const [mappingData, setMappingData] = useState({
//     groupNames: [],
//     storageNames: [],
//     mappingDetails: []
//   });

//   const [selectedFtpId, setSelectedFtpId] = useState('');
//   const [selectedGroupId, setSelectedGroupId] = useState('');

//   const [selectAllChecked, setSelectAllChecked] = useState(false);
//   const [users, setUsers] = useState([]);

//   const [selectedRowId, setSelectedRowId] = useState(null);

//   // Reset everything important when form first mounts / re-opens
//   useEffect(() => {
//     setUsers([]);
//     setSelectAllChecked(false);
//     setShowAuditTrail(false);
//     // Optional: reset formData if you want clean start every open
//     // setFormData({ storageName: '', groupName: '' });
//   }, []); // ← runs once per mount

//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         storageName: initialData.storageName || '',
//         groupName: initialData.groupName || ''
//       });
//     }
//   }, [initialData]);

//   // ── Group Names ──
//   const { data: groupNameRaw, isSuccess: groupNameSuccess } = useQuery({
//     queryKey: ["groupNames"],
//     queryFn: async () => {
//       const userDetails = CF_activeUserdetails();
//       const reqObj = { appname: "SDMS", ...userDetails };
//       const response = await postData("User/FTPUserMappingGroupname", reqObj);
//       return AR_ajaxCall(response, "combo");
//     },
//   });

//   // ── Storage Names ──
//   const { data: storageNameRaw, isSuccess: storageNameSuccess } = useQuery({
//     queryKey: ["storageNames"],
//     queryFn: async () => {
//       const userDetails = CF_activeUserdetails();
//       const reqObj = { appname: "SDMS", ...userDetails };
//       const response = await postData("User/FTPUserMappingStoragename", reqObj);
//       return AR_ajaxCall(response, "combo");
//     },
//   });

//   // ── Mapping Details ──
//   const { data: mappingDetailsRaw, isSuccess: mappingDetailsSuccess, isFetching: isFetchingDetails } = useQuery({
//     queryKey: ["mappingDetails", selectedFtpId, selectedGroupId],
//     queryFn: async () => {
//       if (!selectedFtpId || !selectedGroupId) return null;
//       const userDetails = CF_activeUserdetails();
//       const reqObj = {
//         appname: "SDMS",
//         FTPMapObj: {
//           sFTPID: selectedFtpId,
//           sUserGroupID: selectedGroupId
//         },
//         ...userDetails
//       };
//       const response = await postData("User/FTPUserMappingDetails", reqObj);
//       return AR_ajaxCall(response, "grid");
//     },
//     enabled: !!selectedFtpId && !!selectedGroupId,
//   });

//   // Auto-select first item when lists become available
//   // useEffect(() => {
//   //   if (storageNameSuccess && storageNameRaw?.options?.length > 0 && !selectedFtpId) {
//   //     const first = storageNameRaw.options[0];
//   //     setSelectedFtpId(first.value || '');
//   //     setFormData(prev => ({ ...prev, storageName: first.label || first.value || '' }));
//   //   }
//   // }, [storageNameSuccess, storageNameRaw?.options]);

//   useEffect(() => {
//   if (storageNameSuccess && storageNameRaw?.options?.length > 0) {
//     // Only auto-select if nothing is currently selected
//     if (!selectedFtpId) {
//       const first = storageNameRaw.options[0];
//       setSelectedFtpId(first.value);
//       // This ensures the AnimatedDropdown 'value' prop matches an option
//       setFormData(prev => ({ ...prev, storageName: first.value })); 
//     }
//   }
// }, [storageNameSuccess, storageNameRaw, selectedFtpId]);

//   // useEffect(() => {
//   //   if (groupNameSuccess && groupNameRaw?.options?.length > 0 && !selectedGroupId) {
//   //     const first = groupNameRaw.options[0];
//   //     setSelectedGroupId(first.value || '');
//   //     setFormData(prev => ({ ...prev, groupName: first.label || first.value || '' }));
//   //   }
//   // }, [groupNameSuccess, groupNameRaw?.options]);

//   // Store dropdown options
  
//   useEffect(() => {
//   if (groupNameSuccess && groupNameRaw?.options?.length > 0) {
//     if (!selectedGroupId) {
//       const first = groupNameRaw.options[0];
//       setSelectedGroupId(first.value);
//       // Update formData to match the value stored in the dropdown options
//       setFormData(prev => ({ ...prev, groupName: first.value }));
//     }
//   }
// }, [groupNameSuccess, groupNameRaw, selectedGroupId]);
  
  
  
//   useEffect(() => {
//     if (groupNameSuccess && groupNameRaw?.options) {
//       setMappingData(prev => ({ ...prev, groupNames: groupNameRaw.options }));
//     }
//   }, [groupNameSuccess, groupNameRaw?.options]);

//   useEffect(() => {
//     if (storageNameSuccess && storageNameRaw?.options) {
//       setMappingData(prev => ({ ...prev, storageNames: storageNameRaw.options }));
//     }
//   }, [storageNameSuccess, storageNameRaw?.options]);

//   // IMPORTANT: Reset users whenever selection or data changes
//   useEffect(() => {
//     // Reset to server truth every time relevant data changes
//     if (!mappingDetailsSuccess || !mappingDetailsRaw?.formattedData) {
//       setUsers([]);
//       setSelectAllChecked(false);
//       return;
//     }

//     const transformed = mappingDetailsRaw.formattedData.map((item, idx) => ({
//       id: String(item.L02UserID || `user-${idx}`).trim(),
//       name: item.L02UserName || '',
//       originalL02UserID: item.L02UserID || '',
//       L02UserID: String(item.L02UserID || '').trim(),
//       isMapped: !!item.L02MapStatus,   // ← comes from server
//     }));

//     setUsers(transformed);
//     setSelectAllChecked(false);        // reset select-all checkbox

//   }, [
//     mappingDetailsSuccess,
//     mappingDetailsRaw,                 // ← reference change triggers reset
//     selectedFtpId,
//     selectedGroupId
//   ]);

//   // const handleStorageSelect = (e) => {
//   //   const value = e.target.value;
//   //   setSelectedFtpId(value);
//   //   const selected = mappingData.storageNames.find(opt => opt.value === value);
//   //   setFormData(prev => ({ ...prev, storageName: selected?.label || value }));
//   // };

//   // const handleGroupSelect = (e) => {
//   //   const value = e.target.value;
//   //   setSelectedGroupId(value);
//   //   const selected = mappingData.groupNames.find(opt => opt.value === value);
//   //   setFormData(prev => ({ ...prev, groupName: selected?.label || value }));
//   // };

// const handleStorageSelect = (e) => {
//   const value = e.target.value; // This is the ID/Value
//   setSelectedFtpId(value);
//   setFormData(prev => ({ ...prev, storageName: value })); // Set value, not label
// };

// const handleGroupSelect = (e) => {
//   const value = e.target.value;
//   setSelectedGroupId(value);
//   setFormData(prev => ({ ...prev, groupName: value }));
// };

//   const handleUserToggle = useCallback((id) => {
//     setUsers(prev => prev.map(u => 
//       u.id === id ? { ...u, isMapped: !u.isMapped } : u
//     ));
//     setSelectAllChecked(false);
//   }, []);

//   const handleSelectAll = (e) => {
//     const isChecked = e.target.checked;
//     setSelectAllChecked(isChecked);
//     setUsers(prev => prev.map(u => ({ ...u, isMapped: isChecked })));
//   };

//   const handleInitialSubmit = (e) => {
//     e.preventDefault();
//     if (!selectedFtpId || !selectedGroupId) return;
//     setShowAuditTrail(true);
//   };

//   const handleAuditSubmit = async (auditPayload) => {
//     setIsSubmitting(true);

//     try {
//       const loopdata1 = users.map((user, index) => ({
//         uid: index,
//         boundindex: index,
//         L02UserID: user.originalL02UserID,
//         visibleindex: index,
//         L02UserName: user.name || "",
//         L02MapStatus: user.isMapped,
//         uniqueid: ""
//       }));

//       const userDetails = CF_activeUserdetails();

//       const payload = {
//         loopdata1,
//         appname: "SDMS",
//         FTPMapObj: {
//           sFTPID: selectedFtpId,
//           sUserID: userDetails.sUserID || "",
//           sUserGroupID: selectedGroupId,
//         },
//         AuditTrailValues: auditPayload.AuditTrailValues,
//         ...userDetails,
//       };

//       const response = await postData("User/FTPUserMappingSave", payload);

//       const isSuccess = response?.oResObj?.bStatus === true;

//       if (isSuccess) {
//         // Invalidate so next time form opens it fetches fresh data
//         queryClient.invalidateQueries({ queryKey: ["mappingDetails"] });

//         onSubmit({
//           storageId: selectedFtpId,
//           groupId: selectedGroupId,
//           storageName: formData.storageName,
//           groupName: formData.groupName,
//           mappedUsers: loopdata1.filter(item => item.L02MapStatus).map(item => item.L02UserID),
//           apiResponse: 'Success',
//           auditData: auditPayload.AuditTrailValues,
//         });

//         setShowAuditTrail(false);
//         onClose();

//         if (typeof onSuccessRefresh === 'function') {
//           onSuccessRefresh();
//         }
//       } else {
//         const errorMessage = response?.oResObj?.sInformation || "Failed to save mapping";
//         console.error("Save failed:", response);
//         alert(errorMessage);
//       }
//     } catch (error) {
//       console.error("Error during save:", error);
//       alert("An error occurred while saving. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleAuditClose = () => {
//     setShowAuditTrail(false);
//   };

//   const gridColumns = useMemo(() => [
//     { 
//       key: 'name', 
//       label: 'Users', 
//       enableSearch: true,
//       width: 100,
//       render: (row) => <span className="text-gray-700">{row.name}</span>
//     },
//     { 
//       key: 'isMapped', 
//       label: 'Map', 
//       width: 50,
//       render: (row) => (
//         <input 
//           type="checkbox" 
//           checked={row.isMapped} 
//           onChange={() => handleUserToggle(row.id)}
//           className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
//           disabled={isSubmitting}
//         />
//       )
//     }
//   ], [handleUserToggle, isSubmitting]);

//   const getRowId = useCallback(row => row.id, []);

//   const isLoading = !groupNameSuccess || !storageNameSuccess;

//   return (
//     <>
//       {isSubmitting && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center gap-4 max-w-sm mx-4">
//             <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
//             <div className="text-lg font-semibold text-gray-700 text-center">
//               Updating Storage Mapping...
//             </div>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleInitialSubmit} className="pt-2 text-sm w-full flex flex-col h-[600px]">
//         {isLoading ? (
//           <div className="flex-1 flex items-center justify-center text-gray-500">
//             Loading storage & group data...
//           </div>
//         ) : (
//           <>
//             <div className="w-full mb-5">
//               <AnimatedDropdown
//                 label="Storage Name *"
//                 name="storageName"
//                 value={formData.storageName}
//                 options={mappingData.storageNames}
//                 onChange={handleStorageSelect}
//                 placeholder="Select Storage Name"
//                 disabled={isSubmitting}
//               />
//             </div>

//             <div className="w-full mb-6">
//               <AnimatedDropdown
//                 label="Group Name *"
//                 name="groupName"
//                 value={formData.groupName}
//                 options={mappingData.groupNames}
//                 onChange={handleGroupSelect}
//                 placeholder="Select Group Name"
//                 disabled={isSubmitting}
//               />
//             </div>

//             <div className="flex items-center justify-between mb-2">
//               <span className="font-semibold text-gray-700 text-sm">User Map</span>
//               <div className="flex items-center gap-2">
//                 <input 
//                   type="checkbox" 
//                   checked={selectAllChecked}
//                   onChange={handleSelectAll}
//                   className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
//                   disabled={isSubmitting}
//                 />
//                 <span className="text-gray-600 text-xs">Select All</span>
//               </div>
//             </div>

//             {isFetchingDetails ? (
//               <div className="text-center py-10 text-gray-500 bg-gray-50 rounded">
//                 Loading user mappings...
//               </div>
//             ) : users.length === 0 && selectedFtpId && selectedGroupId ? (
//               <div className="text-center py-10 text-gray-500 bg-gray-50 rounded">
//                 No users found for this storage + group combination
//               </div>
//             ) : (
//               <div className="">
//                 <GridLayout
//                   columns={gridColumns}
//                   data={users}
//                   getRowId={getRowId}
//                   manualPagination={false}
//                   totalRows={users.length}
//                   // page={page}
//                   // pageSize={pageSize}
//                   // onPageChange={setPage}
//                   // onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
//                   height="300px"
//                   headerClassName="bg-gray-50 text-gray-700 font-semibold"
//                 />
//               </div>
//             )}

//             <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4 shrink-0">
//               <button 
//                 type="submit"
//                 disabled={!selectedFtpId || !selectedGroupId || isSubmitting}
//                 className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isSubmitting ? 'Submitting...' : 'Submit'}
//               </button>
//               <button 
//                 type="button"
//                 onClick={onClose}
//                 disabled={isSubmitting}
//                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Close
//               </button>
//             </div>
//           </>
//         )}
//       </form>

//       {showAuditTrail && (
//         <AuditTrail 
//           isOpen={showAuditTrail}
//           onClose={handleAuditClose}
//           onAuthorized={handleAuditSubmit}
//           actionLabel="Update Mapping"
//           defaultReason="Updated storage user mapping"
//         />
//       )}
//     </>
//   );
// };

// export default StorageMappingForm;



import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout'; 
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import servicecall from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { AR_ajaxCall } from "../Configuration/Common/AR_ajaxCall";

const StorageMappingForm = ({ 
  initialData, 
  onSubmit, 
  onClose,
  onSuccessRefresh = () => {}
}) => {
  const { postData } = servicecall();
  const queryClient = useQueryClient();

  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFtpId, setSelectedFtpId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [users, setUsers] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const [formData, setFormData] = useState({
    storageName: '', 
    groupName: '',
  });

  // 1. ✅ FIXED: Define getRowId at the top level, not in the JSX
  const getRowId = useCallback(row => row.id, []);

  // ── Queries ──
  const { data: groupNameRaw, isSuccess: groupNameSuccess } = useQuery({
    queryKey: ["groupNames"],
    queryFn: async () => {
      const userDetails = CF_activeUserdetails();
      const reqObj = { appname: "SDMS", ...userDetails };
      const response = await postData("User/FTPUserMappingGroupname", reqObj);
      return AR_ajaxCall(response, "combo");
    },
  });

  const { data: storageNameRaw, isSuccess: storageNameSuccess } = useQuery({
    queryKey: ["storageNames"],
    queryFn: async () => {
      const userDetails = CF_activeUserdetails();
      const reqObj = { appname: "SDMS", ...userDetails };
      const response = await postData("User/FTPUserMappingStoragename", reqObj);
      return AR_ajaxCall(response, "combo");
    },
  });

  const { data: mappingDetailsRaw, isSuccess: mappingDetailsSuccess, isFetching: isFetchingDetails } = useQuery({
    queryKey: ["mappingDetails", selectedFtpId, selectedGroupId],
    queryFn: async () => {
      if (!selectedFtpId || !selectedGroupId) return null;
      const userDetails = CF_activeUserdetails();
      const reqObj = {
        appname: "SDMS",
        FTPMapObj: { sFTPID: selectedFtpId, sUserGroupID: selectedGroupId },
        ...userDetails
      };
      const response = await postData("User/FTPUserMappingDetails", reqObj);
      return AR_ajaxCall(response, "grid");
    },
    enabled: !!selectedFtpId && !!selectedGroupId,
  });

  // ── Auto-selection ──
  useEffect(() => {
    if (storageNameSuccess && storageNameRaw?.options?.length > 0 && !selectedFtpId) {
      const first = storageNameRaw.options[0];
      setSelectedFtpId(first.value);
      setFormData(prev => ({ ...prev, storageName: first.value }));
    }
  }, [storageNameSuccess, storageNameRaw, selectedFtpId]);

  useEffect(() => {
    if (groupNameSuccess && groupNameRaw?.options?.length > 0 && !selectedGroupId) {
      const first = groupNameRaw.options[0];
      setSelectedGroupId(first.value);
      setFormData(prev => ({ ...prev, groupName: first.value }));
    }
  }, [groupNameSuccess, groupNameRaw, selectedGroupId]);

  // ── Process Users ──
  useEffect(() => {
    if (!mappingDetailsSuccess || !mappingDetailsRaw?.formattedData) {
      setUsers([]);
      setSelectAllChecked(false);
      return;
    }

    const transformed = mappingDetailsRaw.formattedData.map((item, idx) => ({
      id: String(item.L02UserID || `user-${idx}`).trim(),
      name: item.L02UserName || '',
      originalL02UserID: item.L02UserID || '',
      isMapped: !!item.L02MapStatus,
    }));

    setUsers(transformed);
    setSelectAllChecked(false);
  }, [mappingDetailsSuccess, mappingDetailsRaw, selectedFtpId, selectedGroupId]);

  // ── Handlers ──
  const handleStorageSelect = (e) => {
    const value = e.target.value;
    setSelectedFtpId(value);
    setFormData(prev => ({ ...prev, storageName: value }));
  };

  const handleGroupSelect = (e) => {
    const value = e.target.value;
    setSelectedGroupId(value);
    setFormData(prev => ({ ...prev, groupName: value }));
  };

  const handleUserToggle = useCallback((id) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, isMapped: !u.isMapped } : u
    ));
    setSelectAllChecked(false);
  }, []);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAllChecked(isChecked);
    setUsers(prev => prev.map(u => ({ ...u, isMapped: isChecked })));
  };

  const gridColumns = useMemo(() => [
    { 
      key: 'name', 
      label: 'Users', 
      enableSearch: true,
      width: 100,
      render: (row) => <span className="text-gray-700 font-medium">{row.name}</span>
    },
    { 
      key: 'isMapped', 
      label: 'Map', 
      width: 50,
      render: (row) => (
        <input 
          type="checkbox" 
          checked={row.isMapped} 
          onChange={() => handleUserToggle(row.id)}
          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          disabled={isSubmitting}
        />
      )
    }
  ], [handleUserToggle, isSubmitting]);

  const handleAuditSubmit = async (auditPayload) => {
    setIsSubmitting(true);
    try {
      const loopdata1 = users.map((user, index) => ({
        L02UserID: user.originalL02UserID,
        L02UserName: user.name || "",
        L02MapStatus: user.isMapped,
        uid: index,
        boundindex: index,
        visibleindex: index,
      }));

      const userDetails = CF_activeUserdetails();
      const payload = {
        loopdata1,
        appname: "SDMS",
        FTPMapObj: {
          sFTPID: selectedFtpId,
          sUserID: userDetails.sUserID || "",
          sUserGroupID: selectedGroupId,
        },
        AuditTrailValues: auditPayload.AuditTrailValues,
        ...userDetails,
      };

      const response = await postData("User/FTPUserMappingSave", payload);
      if (response?.oResObj?.bStatus === true) {
        queryClient.invalidateQueries({ queryKey: ["mappingDetails"] });
        onSubmit(payload);
        onClose();
        onSuccessRefresh();
      } else {
        alert(response?.oResObj?.sInformation || "Failed to save mapping");
      }
    } finally {
      setIsSubmitting(false);
      setShowAuditTrail(false);
    }
  };

  const isLoadingLists = !groupNameSuccess || !storageNameSuccess;

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
            <p className="font-bold">Saving Changes...</p>
          </div>
        </div>
      )}

      <form 
        onSubmit={(e) => { e.preventDefault(); setShowAuditTrail(true); }} 
        className="pt-2 text-sm w-full flex flex-col h-[600px]"
      >
        {isLoadingLists ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 font-semibold animate-pulse">
            Loading configuration...
          </div>
        ) : (
          <>
            <div className="w-full mb-5">
              <AnimatedDropdown
                label="Storage Name *"
                name="storageName"
                value={formData.storageName}
                options={storageNameRaw?.options || []}
                onChange={handleStorageSelect}
                placeholder="Select Storage"
                disabled={isSubmitting}
              />
            </div>

            <div className="w-full mb-6">
              <AnimatedDropdown
                label="Group Name *"
                name="groupName"
                value={formData.groupName}
                options={groupNameRaw?.options || []}
                onChange={handleGroupSelect}
                placeholder="Select Group"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-700">Mapping Users</span>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={selectAllChecked}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                  disabled={isSubmitting}
                />
                <span className="text-gray-600 text-xs font-bold">Select All</span>
              </div>
            </div>

            <div className="flex-1 min-h-0 border border-gray-100 rounded-lg overflow-hidden">
              {isFetchingDetails ? (
                <div className="h-full flex items-center justify-center text-gray-400">Updating list...</div>
              ) : (
                <GridLayout
                  columns={gridColumns}
                  data={users}
                  // ✅ FIXED: Using the variable from top level
                  getRowId={getRowId}
                  height="300px"
                  manualPagination={false}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <button 
                type="submit"
                disabled={!selectedFtpId || !selectedGroupId || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Submit Changes
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-600 rounded-md font-bold hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </>
        )}
      </form>

      {showAuditTrail && (
        <AuditTrail 
          isOpen={showAuditTrail}
          onClose={() => setShowAuditTrail(false)}
          onAuthorized={handleAuditSubmit}
          actionLabel="Update Mapping"
        />
      )}
    </>
  );
};

export default StorageMappingForm;