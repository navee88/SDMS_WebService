// import { useState, useMemo, useEffect, useCallback } from 'react';
// import { Users, Edit, UserCheck, UserX, UserPlus } from 'lucide-react';
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
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.L01UserGroupName}
//                 </div>
//             )
//         },
//         {
//             key: 'gStatus',
//             label: t('usermanagement.userstatus'),
//             width: 150,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${row.gStatus === 'Active' ? 'text-[#008000]' : 'text-red-500'} ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.gStatus}
//                 </div>
//             )
//         }
//     ], [selectedRowId, t, handleRowSelect]);

//     const renderGroupDetail = useCallback((group) => (
//         <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.createdby')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gCreatedBy}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.createdon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gCreatedOn}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedby')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gModifiedBy}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gModifiedOn}
//                 </div>
//             </div>
//         </div>
//     ), [t]);

//     // Action Button Component - Same as Domain component
//     const ActionButton = ({ icon: Icon, label, disabled, onClick, variant = "default" }) => (
//         <button
//             onClick={onClick}
//             disabled={disabled}
//             className={`
//                 flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none 
//                 transition-all duration-200 whitespace-nowrap
//                 hover:scale-[0.98] hover:opacity-90
//                 ${disabled 
//                     ? variant === 'primary'
//                     ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
//                     : 'bg-[#f0f2f5dc] text-[#2885fecc] font-bold cursor-not-allowed'
//                     : variant === 'primary'
//                         ? 'bg-[#2883FE] text-white hover:bg-[#1c6fd8]'
//                         : variant === 'danger'
//                             ? 'bg-red-500 text-white hover:bg-red-600'
//                             : 'bg-[#f0f2f5] text-[#2883fe] font-bold '
//                 }
//             `}
//         >
//             {Icon && <Icon className="w-4 h-4 font-bold" />}
//             <span>{label}</span>
//         </button>
//     );

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-full">
//                 <div className="text-gray-500">{t('masters.loading')}</div>
//             </div>
//         );
//     }

//     return (
//         <div className="h-full overflow-hidden bg-[#f5f7fb]">
//             <div className="h-full flex flex-col bg-white">
//                 {infoDialog.open && (
//                     <Errordialog
//                         message={infoDialog.message}
//                         type={infoDialog.type}
//                         onClose={closeInfoDialog}
//                     />
//                 )}

//                 {/* Top Action Buttons - Same layout as Domain */}
//                 <div className="flex justify-end pr-5 gap-2 pt-3">
//                     <ActionButton
//                         icon={UserPlus}
//                         label={t('usermanagement.addnewgroup')}
//                         onClick={handleAddClick}
//                     />
//                     <ActionButton
//                         icon={Edit}
//                         label={t('usermanagement.edit')}
//                         onClick={handleEditClick}
//                         disabled={!selectedGroup}
//                     />
//                     <ActionButton
//                         icon={UserX}
//                         label={t('usermanagement.activedeactive')}
//                         onClick={handleActiveDeactiveClick}
//                         disabled={!selectedGroup}
//                     />
//                 </div>

//                 {/* Main GridLayout with Details Panel - Same height as Domain */}
//                 <div className="flex-1 overflow-auto p-3 font-['Roboto'] text-[#353f49]">
//                     {loading ? (
//                         <div className="text-center py-10 text-gray-500">
//                             {t("login.loadingpasswordpolicy")}
//                         </div>
//                     ) : (
//                         <GridLayout
//                             columns={columns}
//                             height="100%" // Same height as Domain
//                             detailPanelWidth="46%" // Same detail panel width
//                             data={userGroupData}
//                             getRowId={(row) => row.id}
//                             renderDetailPanel={renderGroupDetail}
//                             onRowClick={handleRowSelect}
//                             rowClassName={(row) =>
//                                 row.id === selectedRowId
//                                     ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
//                                     : ""
//                             }
//                             searchable={false}
//                             selectable={true}
//                             hidePagination={false}
//                         />
//                     )}
//                 </div>

//                 {/* Add/Edit User Group Popup */}
//                 {activePopup && (
//                     <CustomPopup
//                         isOpen={!!activePopup}
//                         onClose={handlePopupClose}
//                         title={activePopup}
//                         content={
//                             <div className="flex flex-col gap-1 p-1">
//                                 {/* Hidden Group ID field */}
//                                 <input
//                                     type="hidden"
//                                     value={formData.sUserGroupID}
//                                 />

//                                 {/* Group Name */}
//                                 <div className="flex flex-col">
//                                     <label className="text-[12px] font-roboto font-semibold text-[#405f7d]">
//                                         {t('usermanagement.groupname')} <span className="text-red-500">*</span>
//                                     </label>
//                                     <AnimatedInput
//                                         type="text"
//                                         value={formData.sGroupName}
//                                         onChange={(e) => handleFormChange('sGroupName', e.target.value)}
//                                         maxLength={50}
//                                         className={`w-full text-[12px] outline-none bg-white ${
//                                             formErrors.sGroupName ? 'border-red-500' : 'border-gray-300'
//                                         }`}
//                                     />
//                                     {formErrors.sGroupName && (
//                                         <div className="text-red-500 text-[12px]">
//                                             {formErrors.sGroupName}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Form Buttons */}
//                                 <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
//                                     <button
//                                         onClick={handleSubmit}
//                                         className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600"
//                                     >
//                                         <Edit className="w-4 h-4" /> 
//                                         {t('usermanagement.submit')}
//                                     </button>
//                                     <button
//                                         onClick={handlePopupClose}
//                                         className="px-2.5 py-2 text-[12px] font-roboto font-semibold text-[#8092a4] bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
//                                     >
//                                         {t('usermanagement.close')}
//                                     </button>
//                                 </div>
//                             </div>
//                         }
//                         size="md"
//                     />
//                 )}
//             </div>
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
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';

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
    const [confirmationAction, setConfirmationAction] = useState(null);
    const { t } = useTranslation();
    const { postData } = servicecall();

    // Define showInfoDialog first to avoid circular dependency
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
        
        // Handle confirmation actions
        if (confirmationAction && infoDialog.type === "confirmation") {
            if (infoDialog.message.includes(t('usermanagement.confiramationactdeact'))) {
                // User confirmed active/deactive action
                handleActiveDeactiveConfirm();
            }
        }
        setConfirmationAction(null);
    }, [confirmationAction, infoDialog.type, infoDialog.message, t]);

    const getActiveUserDetails = useCallback(() => {
        const getDecryptedValue = (key) => {
            try {
                const encryptedValue = sessionStorage.getItem(key);
                if (!encryptedValue) return "";
                
                if (encryptedValue.length > 50 && encryptedValue.includes('==')) {
                    return CF_decrypt(encryptedValue);
                }
                return encryptedValue;
            } catch (error) {
                console.error(`Error decrypting ${key}:`, error);
                return "";
            }
        };

        const sUsername = getDecryptedValue("sUsername");
        const sSiteCode = getDecryptedValue("sSiteCode") || "CH        ";
        const sUserGroupID = getDecryptedValue("sUserGroupID") || "G1        ";
        const sUserID = getDecryptedValue("sUserID") || "U1";
        const sSessionID = getDecryptedValue("sSessionID");
        const sDomainName = getDecryptedValue("sDomainName") || "SDMS";
        const sTimeZoneID = getDecryptedValue("sTimeZoneID") || "Asia/Shanghai<~>true";
        const sdbtype = getDecryptedValue("sdbtype") || "MSSQL";
        const sCategories = getDecryptedValue("sCategories") || "DB";
        const sUserStatus = getDecryptedValue("sUserStatus") || "";
        const sTenantID = getDecryptedValue("sTenantID") || "";

        return {
            sUserDomainName: sDomainName,
            sSessionID: sSessionID || "",
            sUserID: sUserID,
            sTimeZoneID: sTimeZoneID,
            sApplicationName: "SDMS",
            sdbtype: sdbtype,
            sUsername: sUsername || "Administrator",
            sSiteCode: sSiteCode.padEnd(10, ' ').substring(0, 10),
            sCategories: sCategories,
            sUserGroupID: sUserGroupID.padEnd(10, ' ').substring(0, 10),
            sUserStatus: sUserStatus,
            sTenantID: sTenantID
        };
    }, []);

    const getAuditTrailValues = useCallback(() => {
        return {
            sUserName: "Administrator",
            sUserPassword: "admin123",
            sReasonNo: 1,
            sReasonName: "Activated",
            sComments: "",
            sUserDomainName: "SDMS"
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(',', '');
    };

    const fetchUserGroups = useCallback(async () => {
        setLoading(true);
        try {
            const passObjDet = {
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            const response = await postData("User/UserRightsCombo", passObjDet);
            
            if (!response) {
                setUserGroupData([]);
                showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups', "error");
                return;
            }
            
            let groupsData = response;
            if (typeof response === 'string' && response.length > 50) {
                try {
                    const decrypted = CF_decrypt(response);
                    groupsData = JSON.parse(decrypted);
                } catch (decryptError) {
                    console.error('Failed to decrypt response:', decryptError);
                }
            }
            
            if (groupsData && groupsData.oResObj) {
                groupsData = groupsData.oResObj;
            }
            
            if (!Array.isArray(groupsData)) {
                groupsData = [];
            }
            
            // Format the data to match our expected structure
            const formattedData = groupsData.map((group, index) => ({
                id: index + 1,
                L01UserGroupID: group.L01UserGroupID || '',
                L01UserGroupName: group.L01UserGroupName || '',
                gStatus: group.gStatus || 'Active',
                gCreatedBy: group.gCreatedBy || 'System',
                gCreatedOn: group.gCreatedOn ? formatDate(group.gCreatedOn) : '2024-01-01 09:00',
                gModifiedBy: group.gModifiedBy || null,
                gModifiedOn: group.gModifiedOn ? formatDate(group.gModifiedOn) : null
            }));
            
            setUserGroupData(formattedData);
            
            // Select the first row by default when data loads
            if (formattedData.length > 0) {
                setSelectedGroup(formattedData[0]);
                setSelectedRowId(formattedData[0].id);
            }
        } catch (error) {
            console.error('Error fetching user groups:', error);
            showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups', "error");
        } finally {
            setLoading(false);
        }
    }, [postData, showInfoDialog, t, getActiveUserDetails]);

    // Handle row selection
    const handleRowSelect = useCallback((row) => {
        setSelectedGroup(row);
        setSelectedRowId(row.id);
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
        setConfirmationAction('activeDeactive');
    }, [selectedGroup, showInfoDialog, t]);

    const handleActiveDeactiveConfirm = useCallback(async () => {
        if (!selectedGroup) return;
        
        try {
            setLoading(true);
            
            const newStatus = selectedGroup.gStatus === "Active" ? "Deactive" : "Active";
            
            const passObjDet = {
                ActDeactObj: {
                    sGroupname: selectedGroup.L01UserGroupName,
                    sUserStatus: newStatus,
                    sUserGroupID: selectedGroup.L01UserGroupID
                },
                AuditTrailValues: getAuditTrailValues(),
                ApplicationCode: "SDMS",
                ActiveUserDetails: getActiveUserDetails()
            };
            
            const response = await postData("User/UserGroupActDeactBtnclick", passObjDet);
            
            if (!response) {
                showInfoDialog(t('usermanagement.actdeactfailed'), "error");
                return;
            }
            
            if (response.Rtn === "Success") {
                showInfoDialog(
                    `${t('usermanagement.group')} ${newStatus === "Active" ? t('usermanagement.activated') : t('usermanagement.deactivated')} ${t('usermanagement.successfully')}`,
                    "success"
                );
                
                // Refresh the data
                await fetchUserGroups();
            } else {
                showInfoDialog(t('usermanagement.actdeactfailed'), "error");
            }
        } catch (error) {
            console.error('Error in active/deactive:', error);
            showInfoDialog(t('usermanagement.actdeactfailed'), "error");
        } finally {
            setLoading(false);
        }
    }, [selectedGroup, postData, showInfoDialog, t, getAuditTrailValues, getActiveUserDetails, fetchUserGroups]);

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

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            return;
        }
        
        // Define isEdit here so it's accessible in the catch block
        const isEdit = formData.sUserGroupID !== "";
        
        try {
            setLoading(true);
            
            const activeUserDetails = getActiveUserDetails();
            
            if (isEdit) {
                // Update existing group
                const passObjDet = {
                    grpSave: {
                        sGroupname: formData.sGroupName,
                        sUserGroupID: formData.sUserGroupID,
                        sCreatedBy: activeUserDetails.sUserID,
                        sUserStatus: "Active"
                    },
                    AuditTrailValues: getAuditTrailValues(),
                    ApplicationCode: "SDMS",
                    ActiveUserDetails: activeUserDetails
                };
                
                const response = await postData("User/UserGroupUpdateBtnclick", passObjDet);
                
                if (response && response.Rtn === "Success") {
                    showInfoDialog(t('usermanagement.schedulerrightssavesuccessfully'), "success");
                    setActivePopup(null);
                    await fetchUserGroups();
                } else {
                    showInfoDialog(t('usermanagement.updatefailed'), "error");
                }
            } else {
                // Add new group
                const passObjDet = {
                    grpSave: {
                        sGroupname: formData.sGroupName,
                        sCreatedBy: activeUserDetails.sUserID,
                        sUserStatus: "Active"
                    },
                    ApplicationCode: "SDMS",
                    ActiveUserDetails: activeUserDetails
                };
                
                const response = await postData("User/UserGroupSaveBtnclick", passObjDet);
                
                if (response && response.Rtn === "Success") {
                    showInfoDialog(t('usermanagement.importusersuccessmessage'), "success");
                    setActivePopup(null);
                    await fetchUserGroups();
                } else {
                    showInfoDialog(t('usermanagement.importuserfailedmessage'), "error");
                }
            }
            
        } catch (error) {
            console.error('Error saving user group:', error);
            showInfoDialog(
                isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage'),
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, [formData, validateForm, showInfoDialog, t, postData, getActiveUserDetails, getAuditTrailValues, fetchUserGroups]);

    const handlePopupClose = useCallback(() => {
        setActivePopup(null);
        setFormErrors({});
    }, []);

    useEffect(() => {
        const sessionID = sessionStorage.getItem('sSessionID');
        const userID = sessionStorage.getItem('sUserID');
        
        if (!sessionID || !userID) {
            showInfoDialog(t('usermanagement.sessionexpired') || 'Session expired. Please login again.', "error");
            return;
        }
        
        fetchUserGroups();
    }, [fetchUserGroups, showInfoDialog, t]);

    // Update selectedGroup when selectedRowId changes
    useEffect(() => {
        if (selectedRowId && userGroupData.length > 0) {
            const selected = userGroupData.find(group => group.id === selectedRowId);
            if (selected) {
                setSelectedGroup(selected);
            }
        }
    }, [selectedRowId, userGroupData]);

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
                    {group.gModifiedBy || 'N/A'}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.modifiedon')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {group.gModifiedOn || 'N/A'}
                </div>
            </div>
        </div>
    ), [t]);

    // Action Button Component
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

                {/* Top Action Buttons */}
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

                {/* Main GridLayout with Details Panel */}
                <div className="flex-1 overflow-auto p-3 font-['Roboto'] text-[#353f49]">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">
                            {t("login.loadingpasswordpolicy")}
                        </div>
                    ) : (
                        <GridLayout
                            columns={columns}
                            height="100%"
                            detailPanelWidth="46%"
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
                                        disabled={loading}
                                        className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Edit className="w-4 h-4" /> 
                                        {loading ? t('usermanagement.saving') : t('usermanagement.submit')}
                                    </button>
                                    <button
                                        onClick={handlePopupClose}
                                        disabled={loading}
                                        className="px-2.5 py-2 text-[12px] font-roboto font-semibold text-[#8092a4] bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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