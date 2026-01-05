// import { useState, useMemo, useEffect, useCallback } from 'react';
// import { Users, Edit, UserCheck, UserX, Plus } from 'lucide-react';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// import { useTranslation } from 'react-i18next';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import CustomPopup from '../../../../Layout/Common/Popup';
// import AnimatedInput from '../../../../Layout/Common/AnimatedInput';

// const UserGroup = () => {
//     const [userGroupData, setUserGroupData] = useState([]);
//     const [selectedGroup, setSelectedGroup] = useState(null);
//     const [selectedRowId, setSelectedRowId] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [infoDialog, setInfoDialog] = useState({
//         open: false,
//         message: "",
//         type: "information" 
//     });
//     const [activePopup, setActivePopup] = useState(null);
//     const [formData, setFormData] = useState({
//         sGroupName: "",
//         sUserGroupID: ""
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const { t } = useTranslation();

//     // Mock data for user group management
//     const mockUserGroupData = [
//         {
//             id: 1,
//             L01UserGroupID: "UG-001",
//             L01UserGroupName: "Administrator",
//             gStatus: "Active",
//             gCreatedBy: "System",
//             gCreatedOn: "2024-01-01 09:00",
//             gModifiedBy: "Admin",
//             gModifiedOn: "2024-01-15 11:00",
//         },
//         {
//             id: 2,
//             L01UserGroupID: "UG-002",
//             L01UserGroupName: "Lab Technician",
//             gStatus: "Active",
//             gCreatedBy: "Admin",
//             gCreatedOn: "2024-01-10 10:00",
//             gModifiedBy: "Admin",
//             gModifiedOn: "2024-01-20 14:00",
//         },
//         {
//             id: 3,
//             L01UserGroupID: "UG-003",
//             L01UserGroupName: "View Only",
//             gStatus: "Deactive",
//             gCreatedBy: "Admin",
//             gCreatedOn: "2024-01-12 09:00",
//             gModifiedBy: "Admin",
//             gModifiedOn: "2024-01-25 16:00",
//         }
//     ];

//     useEffect(() => {
//         setLoading(true);
//         setTimeout(() => {
//             setUserGroupData(mockUserGroupData);
//             // Select the first row by default when data loads
//             if (mockUserGroupData.length > 0) {
//                 setSelectedGroup(mockUserGroupData[0]);
//                 setSelectedRowId(mockUserGroupData[0].id);
//             }
//             setLoading(false);
//         }, 500);
//     }, []);

//     // Handle row selection
//     const handleRowSelect = useCallback((row) => {
//         setSelectedGroup(row);
//         setSelectedRowId(row.id);
//     }, []);

//     // Update selectedGroup when selectedRowId changes
//     useEffect(() => {
//         if (selectedRowId && userGroupData.length > 0) {
//             const selected = userGroupData.find(group => group.id === selectedRowId);
//             if (selected) {
//                 setSelectedGroup(selected);
//             }
//         }
//     }, [selectedRowId, userGroupData]);

//     const showInfoDialog = useCallback((message, type = "information") => {
//         setInfoDialog({
//             open: true,
//             message,
//             type
//         });
//     }, []);

//     const closeInfoDialog = useCallback(() => {
//         setInfoDialog(prev => ({
//             ...prev,
//             open: false
//         }));
//     }, []);

//     const handleAddClick = useCallback(() => {
//         setFormData({
//             sGroupName: "",
//             sUserGroupID: ""
//         });
//         setFormErrors({});
//         setActivePopup(t('usermanagement.addnewgroup'));
//     }, [t]);

//     const handleEditClick = useCallback(() => {
//         if (!selectedGroup) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         // Disable edit for Administrator group
//         if (selectedGroup.L01UserGroupName === "Administrator") {
//             showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
//             return;
//         }
        
//         // Disable edit for deactivated group
//         if (selectedGroup.gStatus === "Deactive") {
//             showInfoDialog(t('usermanagement.groupdeactivesocannotedit'), "warning");
//             return;
//         }
        
//         setFormData({
//             sGroupName: selectedGroup.L01UserGroupName,
//             sUserGroupID: selectedGroup.L01UserGroupID
//         });
//         setFormErrors({});
//         setActivePopup(t('usermanagement.updateusergroup'));
//     }, [selectedGroup, showInfoDialog, t]);

//     const handleActiveDeactiveClick = useCallback(() => {
//         if (!selectedGroup) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         // Disable for Administrator group
//         if (selectedGroup.L01UserGroupName === "Administrator") {
//             showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
//             return;
//         }
        
//         // Show confirmation dialog
//         showInfoDialog(t('usermanagement.confiramationactdeact'), "confirmation");
//     }, [selectedGroup, showInfoDialog, t]);

//     const handleFormChange = useCallback((field, value) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
        
//         // Clear error when user starts typing
//         if (formErrors[field]) {
//             setFormErrors(prev => ({
//                 ...prev,
//                 [field]: ""
//             }));
//         }
//     }, [formErrors]);

//     const validateForm = useCallback(() => {
//         const errors = {};
        
//         if (!formData.sGroupName.trim()) {
//             errors.sGroupName = t('usermanagement.usergroupname') + " " + t('usermanagement.isrequired');
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     }, [formData, t]);

//     const handleSubmit = useCallback(() => {
//         if (!validateForm()) {
//             return;
//         }
        
//         try {
//             // Implement API call for add/edit
//             const isEdit = formData.sUserGroupID !== "";
//             if (isEdit) {
//                 showInfoDialog(t('usermanagement.schedulerrightssavesuccessfully'), "success");
//             } else {
//                 showInfoDialog(t('usermanagement.importusersuccessmessage'), "success");
//             }
            
//             setActivePopup(null);
            
//             // Refresh grid data
//             setLoading(true);
//             setTimeout(() => {
//                 setLoading(false);
//             }, 500);
            
//         } catch (error) {
//             showInfoDialog(t('usermanagement.importuserfailedmessage'), "error");
//         }
//     }, [formData, validateForm, showInfoDialog, t]);

//     const handlePopupClose = useCallback(() => {
//         setActivePopup(null);
//         setFormErrors({});
//     }, []);

//     const columns = useMemo(() => [
//         {
//             key: 'L01UserGroupName',
//             label: t('usermanagement.usergroupname'),
//             width: 200,
//             enableSearch:true,
//             render: (row, isSelected) => (
//                 <div style={{ 
//                     fontSize: '12px', 
//                     fontFamily:'verdana',
//                     color: '#374151',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap',
//                     fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
//                 }}>
//                     <span className={isSelected ? "font-bold" : ''}>{row.L01UserGroupName}</span>
//                 </div>
//             )
//         },
//         {
//             key: 'gStatus',
//             label: t('usermanagement.userstatus'),
//             width: 150,
            
//             enableSearch:true,
//             render: (row, isSelected) => (
//                 <div style={{ 
//                     fontSize: '12px', 
//                     fontFamily:'verdana',
//                     color: row.gStatus === 'Active' ? '#0a7350' : '#ef4444',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap',
//                     fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
//                 }}>
//                     <span className={isSelected ? "font-bold" : ''}>{row.gStatus}</span>
//                 </div>
//             )
//         }
//     ], [selectedRowId, t]);

//     const renderGroupDetail = useCallback((group) => (
//         <div style={{ 
//             display: 'flex', 
//             flexDirection: 'column',
//             gap: '14px',
//             fontWeight: '600',
//             fontFamily: 'Roboto, sans-serif',
//             fontSize: '12px',
//         }}>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.createdby')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {group.gCreatedBy}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.createdon')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {group.gCreatedOn}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.modifiedby')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {group.gModifiedBy}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.modifiedon')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {group.gModifiedOn}
//                 </div>
//             </div>
//         </div>
//     ), [t]);

//     if (loading) {
//         return (
//             <div style={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 justifyContent: 'center', 
//                 height: '100%' 
//             }}>
//                 <div style={{ color: '#6b7280' }}>{t('masters.loading')}</div>
//             </div>
//         );
//     }

//     const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "", variant = "default" }) => (
//         <button
//             onClick={onClick}
//             disabled={disabled}
//             style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '6px',
//                 padding: '6px 10px',
//                 fontSize: '12px',
//                 fontWeight: 'bold',
//                 borderRadius: '4px',
//                 border: 'none',
//                 cursor: disabled ? 'not-allowed' : 'pointer',
//                 transition: 'all 0.2s ease',
//                 whiteSpace: 'nowrap',
//                 backgroundColor: disabled 
//                     ? '#f8fafc' 
//                     : variant === 'primary'
//                         ? '#2883FE'
//                         : variant === 'danger'
//                             ? '#ef4444'
//                             : '#f1f5f9',
//                 color: disabled 
//                     ? '#cbd5e1' 
//                     : variant === 'primary' || variant === 'danger'
//                         ? 'white'
//                         : '#2883FE'
//             }}
//             onMouseEnter={(e) => {
//                 if (!disabled) {
//                     e.currentTarget.style.transform = 'scale(0.98)';
//                     e.currentTarget.style.opacity = '0.9';
                    
//                     if (variant === 'default') {
//                         e.currentTarget.style.backgroundColor = '#E6F0FF';
//                     } else if (variant === 'primary') {
//                         e.currentTarget.style.backgroundColor = '#1c6fd8';
//                     } else if (variant === 'danger') {
//                         e.currentTarget.style.backgroundColor = '#dc2626';
//                     }
//                 }
//             }}
//             onMouseLeave={(e) => {
//                 if (!disabled) {
//                     e.currentTarget.style.transform = 'scale(1)';
//                     e.currentTarget.style.opacity = '1';
                    
//                     if (variant === 'default') {
//                         e.currentTarget.style.backgroundColor = '#f1f5f9';
//                     } else if (variant === 'primary') {
//                         e.currentTarget.style.backgroundColor = '#2883FE';
//                     } else if (variant === 'danger') {
//                         e.currentTarget.style.backgroundColor = '#ef4444';
//                     }
//                 }
//             }}
//         >
//             {Icon && <Icon style={{ width: '14px', height: '14px' }} />}
//             <span>{label}</span>
//         </button>
//     );

//     return (
//         <div style={{ 
//             display: 'flex', 
//             flexDirection: 'column', 
//         }}>
//             {/* Error/Info Dialog */}
//             {infoDialog.open && (
//                 <Errordialog
//                     message={infoDialog.message}
//                     type={infoDialog.type}
//                     onClose={closeInfoDialog}
//                 />
//             )}

//             {/* Top Action Buttons */}
//             <div style={{ 
//                 display: 'flex', 
//                 justifyContent: 'flex-end', 
//                 gap: '10px', 
//                 padding: '10px',
//                 background: 'white',
//                 marginBottom: '0px',
//                 marginTop: '2px',
//             }}>
//                 <ActionButton
//                     icon={Plus}
//                     label={t('usermanagement.addnewgroup')}
//                     onClick={handleAddClick}
//                 />
//                 <ActionButton
//                     icon={Edit}
//                     label={t('usermanagement.edit')}
//                     onClick={handleEditClick}
//                     disabled={!selectedGroup}
//                 />
//                 <ActionButton
//                     icon={UserX}
//                     label={t('usermanagement.activedeactive')}
//                     onClick={handleActiveDeactiveClick}
//                     disabled={!selectedGroup}
//                 />
//             </div>

//             {/* Main GridLayout with Details Panel */}
//             <div style={{ flex: 1 }}>
//                 <GridLayout
//                     columns={columns}
//                     data={userGroupData}
//                     renderDetailPanel={renderGroupDetail}
//                     onRowClick={handleRowSelect}
//                     searchable={false}
//                     selectable={true}
//                     hidePagination={false}
//                     // height= '100%'
//                     // Pass the selected row ID to GridLayout
//                     selectedRowId={selectedRowId}
//                     onRowSelect={handleRowSelect}
//                 />
//             </div>

//             {/* Add/Edit User Group Popup */}
//             {activePopup && (
//                 <CustomPopup
//                     isOpen={!!activePopup}
//                     onClose={handlePopupClose}
//                     title={activePopup}
//                     content={
//                         <div style={{ 
//                             display: 'flex', 
//                             flexDirection: 'column', 
//                             gap: '16px',
//                             padding: '8px'
//                         }}>
//                             {/* Hidden Group ID field */}
//                             <input
//                                 type="hidden"
//                                 value={formData.sUserGroupID}
//                             />

//                             {/* Group Name */}
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
//                                     {t('usermanagement.groupname')} <span style={{ color: '#ef4444' }}>*</span>
//                                 </label>
//                                 <AnimatedInput
//                                     type="text"
//                                     value={formData.sGroupName}
//                                     onChange={(e) => handleFormChange('sGroupName', e.target.value)}
//                                     maxLength={50}
//                                     style={{
//                                         width: '100%',
//                                         padding: '8px 12px',
//                                         fontSize: '14px',
//                                         border: formErrors.sGroupName ? '1px solid #ef4444' : '1px solid #d1d5db',
//                                         borderRadius: '4px',
//                                         outline: 'none'
//                                     }}
//                                 />
//                                 {formErrors.sGroupName && (
//                                     <div style={{ color: '#ef4444', fontSize: '12px' }}>
//                                         {formErrors.sGroupName}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Form Buttons */}
//                             <div style={{ 
//                                 display: 'flex', 
//                                 justifyContent: 'flex-end', 
//                                 gap: '12px',
//                                 paddingTop: '12px',
//                                 marginTop: '8px',
//                                 borderTop: '1px solid #e5e7eb'
//                             }}>
//                                 <button
//                                     onClick={handleSubmit}
//                                     style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '8px',
//                                         padding: '5px 8px',
//                                         fontSize: '12px',
//                                         fontWeight: 700,
//                                         color: 'white',
//                                         backgroundColor: '#3b82f6',
//                                         border: 'none',
//                                         borderRadius: '4px',
//                                         cursor: 'pointer'
//                                     }}
//                                 >
//                                     <Edit style={{ width: '16px', height: '16px' }} /> {t('usermanagement.submit')}
//                                 </button>
//                                 <button
//                                     onClick={handlePopupClose}
//                                     style={{
//                                         padding: '5px 6px',
//                                         fontSize: '12px',
//                                         fontWeight: 700,
//                                         color: '#8092a4 !important',
//                                         backgroundColor: 'white',
//                                         border: '1px solid #d1d5db',
//                                         borderRadius: '4px',
//                                         cursor: 'pointer'
//                                     }}
//                                 >
//                                     {t('usermanagement.close')}
//                                 </button>
//                             </div>
//                         </div>
//                     }
//                     size="md"
//                 />
//             )}
//         </div>
//     );
// };

// export default UserGroup;






















































































import { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, Edit, UserCheck, UserX, UserPlus } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';

const UserGroup = () => {
    const [userGroupData, setUserGroupData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });
    const [activePopup, setActivePopup] = useState(null);
    const [formData, setFormData] = useState({
        sGroupName: "",
        sUserGroupID: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const { t } = useTranslation();

    // Mock data for user group management
    const mockUserGroupData = [
        {
            id: 1,
            L01UserGroupID: "UG-001",
            L01UserGroupName: "Administrator",
            gStatus: "Active",
            gCreatedBy: "System",
            gCreatedOn: "2024-01-01 09:00",
            gModifiedBy: "Admin",
            gModifiedOn: "2024-01-15 11:00",
        },
        {
            id: 2,
            L01UserGroupID: "UG-002",
            L01UserGroupName: "Lab Technician",
            gStatus: "Active",
            gCreatedBy: "Admin",
            gCreatedOn: "2024-01-10 10:00",
            gModifiedBy: "Admin",
            gModifiedOn: "2024-01-20 14:00",
        },
        {
            id: 3,
            L01UserGroupID: "UG-003",
            L01UserGroupName: "View Only",
            gStatus: "Deactive",
            gCreatedBy: "Admin",
            gCreatedOn: "2024-01-12 09:00",
            gModifiedBy: "Admin",
            gModifiedOn: "2024-01-25 16:00",
        }
    ];

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setUserGroupData(mockUserGroupData);
            // Select the first row by default when data loads
            if (mockUserGroupData.length > 0) {
                setSelectedGroup(mockUserGroupData[0]);
                setSelectedRowId(mockUserGroupData[0].id);
            }
            setLoading(false);
        }, 500);
    }, []);

    // Handle row selection
    const handleRowSelect = useCallback((row) => {
        setSelectedGroup(row);
        setSelectedRowId(row.id);
    }, []);

    // Update selectedGroup when selectedRowId changes
    useEffect(() => {
        if (selectedRowId && userGroupData.length > 0) {
            const selected = userGroupData.find(group => group.id === selectedRowId);
            if (selected) {
                setSelectedGroup(selected);
            }
        }
    }, [selectedRowId, userGroupData]);

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

    const handleAddClick = useCallback(() => {
        setFormData({
            sGroupName: "",
            sUserGroupID: ""
        });
        setFormErrors({});
        setActivePopup(t('usermanagement.addnewgroup'));
    }, [t]);

    const handleEditClick = useCallback(() => {
        if (!selectedGroup) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        // Disable edit for Administrator group
        if (selectedGroup.L01UserGroupName === "Administrator") {
            showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
            return;
        }
        
        // Disable edit for deactivated group
        if (selectedGroup.gStatus === "Deactive") {
            showInfoDialog(t('usermanagement.groupdeactivesocannotedit'), "warning");
            return;
        }
        
        setFormData({
            sGroupName: selectedGroup.L01UserGroupName,
            sUserGroupID: selectedGroup.L01UserGroupID
        });
        setFormErrors({});
        setActivePopup(t('usermanagement.updateusergroup'));
    }, [selectedGroup, showInfoDialog, t]);

    const handleActiveDeactiveClick = useCallback(() => {
        if (!selectedGroup) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        // Disable for Administrator group
        if (selectedGroup.L01UserGroupName === "Administrator") {
            showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
            return;
        }
        
        // Show confirmation dialog
        showInfoDialog(t('usermanagement.confiramationactdeact'), "confirmation");
    }, [selectedGroup, showInfoDialog, t]);

    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    }, [formErrors]);

    const validateForm = useCallback(() => {
        const errors = {};
        
        if (!formData.sGroupName.trim()) {
            errors.sGroupName = t('usermanagement.usergroupname') + " " + t('usermanagement.isrequired');
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData, t]);

    const handleSubmit = useCallback(() => {
        if (!validateForm()) {
            return;
        }
        
        try {
            // Implement API call for add/edit
            const isEdit = formData.sUserGroupID !== "";
            if (isEdit) {
                showInfoDialog(t('usermanagement.schedulerrightssavesuccessfully'), "success");
            } else {
                showInfoDialog(t('usermanagement.importusersuccessmessage'), "success");
            }
            
            setActivePopup(null);
            
            // Refresh grid data
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 500);
            
        } catch (error) {
            showInfoDialog(t('usermanagement.importuserfailedmessage'), "error");
        }
    }, [formData, validateForm, showInfoDialog, t]);

    const handlePopupClose = useCallback(() => {
        setActivePopup(null);
        setFormErrors({});
    }, []);

    const columns = useMemo(() => [
        {
            key: 'L01UserGroupName',
            label: t('usermanagement.usergroupname'),
            width: 200,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.L01UserGroupName}
                </div>
            )
        },
        {
            key: 'gStatus',
            label: t('usermanagement.userstatus'),
            width: 150,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${row.gStatus === 'Active' ? 'text-[#008000]' : 'text-red-500'} ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.gStatus}
                </div>
            )
        }
    ], [selectedRowId, t, handleRowSelect]);

    const renderGroupDetail = useCallback((group) => (
        <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.createdby')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {group.gCreatedBy}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.createdon')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {group.gCreatedOn}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.modifiedby')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {group.gModifiedBy}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.modifiedon')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {group.gModifiedOn}
                </div>
            </div>
        </div>
    ), [t]);

    // Action Button Component - Same as Domain component
    const ActionButton = ({ icon: Icon, label, disabled, onClick, variant = "default" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none 
                transition-all duration-200 whitespace-nowrap
                hover:scale-[0.98] hover:opacity-90
                ${disabled 
                    ? variant === 'primary'
                    ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
                    : 'bg-[#f0f2f5dc] text-[#2885fecc] font-bold cursor-not-allowed'
                    : variant === 'primary'
                        ? 'bg-[#2883FE] text-white hover:bg-[#1c6fd8]'
                        : variant === 'danger'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-[#f0f2f5] text-[#2883fe] font-bold '
                }
            `}
        >
            {Icon && <Icon className="w-4 h-4 font-bold" />}
            <span>{label}</span>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">{t('masters.loading')}</div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-hidden bg-[#f5f7fb]">
            <div className="h-full flex flex-col bg-white">
                {infoDialog.open && (
                    <Errordialog
                        message={infoDialog.message}
                        type={infoDialog.type}
                        onClose={closeInfoDialog}
                    />
                )}

                {/* Top Action Buttons - Same layout as Domain */}
                <div className="flex justify-end pr-5 gap-2 pt-3">
                    <ActionButton
                        icon={UserPlus}
                        label={t('usermanagement.addnewgroup')}
                        onClick={handleAddClick}
                    />
                    <ActionButton
                        icon={Edit}
                        label={t('usermanagement.edit')}
                        onClick={handleEditClick}
                        disabled={!selectedGroup}
                    />
                    <ActionButton
                        icon={UserX}
                        label={t('usermanagement.activedeactive')}
                        onClick={handleActiveDeactiveClick}
                        disabled={!selectedGroup}
                    />
                </div>

                {/* Main GridLayout with Details Panel - Same height as Domain */}
                <div className="flex-1 overflow-auto p-3 font-['Roboto'] text-[#353f49]">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">
                            {t("login.loadingpasswordpolicy")}
                        </div>
                    ) : (
                        <GridLayout
                            columns={columns}
                            height="100%" // Same height as Domain
                            detailPanelWidth="46%" // Same detail panel width
                            data={userGroupData}
                            getRowId={(row) => row.id}
                            renderDetailPanel={renderGroupDetail}
                            onRowClick={handleRowSelect}
                            rowClassName={(row) =>
                                row.id === selectedRowId
                                    ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
                                    : ""
                            }
                            searchable={false}
                            selectable={true}
                            hidePagination={false}
                        />
                    )}
                </div>

                {/* Add/Edit User Group Popup */}
                {activePopup && (
                    <CustomPopup
                        isOpen={!!activePopup}
                        onClose={handlePopupClose}
                        title={activePopup}
                        content={
                            <div className="flex flex-col gap-1 p-1">
                                {/* Hidden Group ID field */}
                                <input
                                    type="hidden"
                                    value={formData.sUserGroupID}
                                />

                                {/* Group Name */}
                                <div className="flex flex-col">
                                    <label className="text-[12px] font-roboto font-semibold text-[#405f7d]">
                                        {t('usermanagement.groupname')} <span className="text-red-500">*</span>
                                    </label>
                                    <AnimatedInput
                                        type="text"
                                        value={formData.sGroupName}
                                        onChange={(e) => handleFormChange('sGroupName', e.target.value)}
                                        maxLength={50}
                                        className={`w-full text-[12px] outline-none bg-white ${
                                            formErrors.sGroupName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {formErrors.sGroupName && (
                                        <div className="text-red-500 text-[12px]">
                                            {formErrors.sGroupName}
                                        </div>
                                    )}
                                </div>

                                {/* Form Buttons */}
                                <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                                    <button
                                        onClick={handleSubmit}
                                        className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600"
                                    >
                                        <Edit className="w-4 h-4" /> 
                                        {t('usermanagement.submit')}
                                    </button>
                                    <button
                                        onClick={handlePopupClose}
                                        className="px-2.5 py-2 text-[12px] font-roboto font-semibold text-[#8092a4] bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                                    >
                                        {t('usermanagement.close')}
                                    </button>
                                </div>
                            </div>
                        }
                        size="md"
                    />
                )}
            </div>
        </div>
    );
};

export default UserGroup;