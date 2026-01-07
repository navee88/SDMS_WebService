// import { useState, useMemo, useEffect, useCallback } from 'react';
// import { Users, Edit, UserCheck, UserX, UserPlus } from 'lucide-react';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// import { useTranslation } from 'react-i18next';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import CustomPopup from '../../../../Layout/Common/Popup';
// import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
// import servicecall from '../../../../../Services/servicecall';
// import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';

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
//     const [confirmationAction, setConfirmationAction] = useState(null);
//     const { t } = useTranslation();
//     const { postData } = servicecall();

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
        
//         if (confirmationAction && infoDialog.type === "confirmation") {
//             if (infoDialog.message.includes(t('usermanagement.confiramationactdeact'))) {
//                 handleActiveDeactiveConfirm();
//             }
//         }
//         setConfirmationAction(null);
//     }, [confirmationAction, infoDialog.type, infoDialog.message, t]);

//     const getActiveUserDetails = useCallback(() => {
//         const getDecryptedValue = (key) => {
//             try {
//                 const encryptedValue = sessionStorage.getItem(key);
//                 if (!encryptedValue) return "";
                
//                 if (encryptedValue.length > 50 && encryptedValue.includes('==')) {
//                     return CF_decrypt(encryptedValue);
//                 }
//                 return encryptedValue;
//             } catch (error) {
//                 console.error(`Error decrypting ${key}:`, error);
//                 return "";
//             }
//         };

//         const sUsername = getDecryptedValue("sUsername");
//         const sSiteCode = getDecryptedValue("sSiteCode") || "CH        ";
//         const sUserGroupID = getDecryptedValue("sUserGroupID") || "G1        ";
//         const sUserID = getDecryptedValue("sUserID") || "U1";
//         const sSessionID = getDecryptedValue("sSessionID");
//         const sDomainName = getDecryptedValue("sDomainName") || "SDMS";
//         const sTimeZoneID = getDecryptedValue("sTimeZoneID") || "Asia/Shanghai<~>true";
//         const sdbtype = getDecryptedValue("sdbtype") || "MSSQL";
//         const sCategories = getDecryptedValue("sCategories") || "DB";
//         const sUserStatus = getDecryptedValue("sUserStatus") || "";
//         const sTenantID = getDecryptedValue("") || ""; // Fixed: should be "sTenantID" not empty string

//         return {
//             sUsername: sUsername || "Administrator",
//             sCategories: sCategories,
//             sSiteCode: sSiteCode.padEnd(10, ' ').substring(0, 10),
//             sUserID: sUserID,
//             sUserDomainName: sDomainName,
//             sUserGroupID: sUserGroupID.padEnd(10, ' ').substring(0, 10),
//             sTimeZoneID: sTimeZoneID,
//             sSessionID: sSessionID || "",
//             sUserStatus: sUserStatus,
//             sApplicationName: "SDMS",
//             sdbtype: sdbtype,
//             sTenantID: sTenantID
//         };
//     }, []);

//     const getAuditTrailValues = useCallback(() => {
//         const getDecryptedValue = (key) => {
//             try {
//                 const encryptedValue = sessionStorage.getItem(key);
//                 if (!encryptedValue) return "";
                
//                 if (encryptedValue.length > 50 && encryptedValue.includes('==')) {
//                     return CF_decrypt(encryptedValue);
//                 }
//                 return encryptedValue;
//             } catch (error) {
//                 console.error(`Error decrypting ${key}:`, error);
//                 return "";
//             }
//         };

//         const sUsername = getDecryptedValue("sUsername") || "Administrator";
        
//         return {
//             sUserName: sUsername,
//             sUserPassword: "admin123",
//             sReasonNo: 1,
//             sReasonName: "Activated",
//             sComments: "",
//             sUserDomainName: "SDMS"
//         };
//     }, []);

//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         try {
//             const date = new Date(dateString);
//             if (isNaN(date.getTime())) {
//                 return dateString;
//             }
//             return date.toLocaleString('en-US', {
//                 year: 'numeric',
//                 month: '2-digit',
//                 day: '2-digit',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: false
//             }).replace(',', '');
//         } catch (error) {
//             console.error('Error formatting date:', error);
//             return dateString;
//         }
//     };

//     // Define processUserGroupsResponse BEFORE fetchUserGroups
//     const processUserGroupsResponse = useCallback((response) => {
//         console.log("Processing response:", response);
        
//         let groupsData = [];
        
//         // Extract user group data from response
//         if (response && response.oResObj && Array.isArray(response.oResObj)) {
//             groupsData = response.oResObj;
//         } else if (response && response.returnservice && response.returnservice.oResObj) {
//             groupsData = response.returnservice.oResObj;
//         } else if (Array.isArray(response)) {
//             groupsData = response;
//         }
        
//         console.log("Extracted groups data:", groupsData);
        
//         // Format the data
//         const formattedData = groupsData.map((group, index) => ({
//             id: index + 1,
//             L01UserGroupID: group.L01UserGroupID || '',
//             L01UserGroupName: group.L01UserGroupName || '',
//             gStatus: group.gStatus || 'Active',
//             gCreatedBy: group.gCreatedBy || 'System',
//             gCreatedOn: group.gCreatedOn ? formatDate(group.gCreatedOn) : '',
//             gUTCCreatedOn: group.gUTCCreatedOn || '',
//             gModifiedBy: group.gModifiedBy || null,
//             gModifiedOn: group.gModifiedOn ? formatDate(group.gModifiedOn) : null,
//             gUTCModifiedOn: group.gUTCModifiedOn || null
//         }));
        
//         console.log("Formatted user groups:", formattedData);
        
//         setUserGroupData(formattedData);
        
//         if (formattedData.length > 0) {
//             setSelectedGroup(formattedData[0]);
//             setSelectedRowId(formattedData[0].id);
//         }
//     }, []);

//     // Now define fetchUserGroups AFTER processUserGroupsResponse
//     const fetchUserGroups = useCallback(async () => {
//         setLoading(true);
//         try {
//             const activeUserDetails = getActiveUserDetails();
            
//             // Log all session storage items for debugging
//             console.log("All session storage items:");
//             for (let i = 0; i < sessionStorage.length; i++) {
//                 const key = sessionStorage.key(i);
//                 console.log(`${key}: ${sessionStorage.getItem(key)}`);
//             }
            
//             // Create request as per API documentation
//             const requestData = {
//                 ApplicationCode: "SDMS",
//                 ActiveUserDetails: activeUserDetails
//             };
            
//             console.log("Fetching user groups with FULL request:", JSON.stringify(requestData, null, 2));
            
//             // Call the UserGroupAndMasterGrid endpoint
//             const response = await postData("User/UserGroupAndMasterGrid", requestData);
            
//             console.log("Raw API Response:", response);
//             console.log("Response type:", typeof response);
//             console.log("Response keys:", Object.keys(response || {}));
            
//             if (!response || Object.keys(response).length === 0) {
//                 console.error("Empty response received");
                
//                 // Try with a simpler request first
//                 console.log("Testing with minimal request...");
                
//                 const testRequest = {
//                     ApplicationCode: "SDMS",
//                     ActiveUserDetails: {
//                         sUsername: "Administrator",
//                         sCategories: "DB",
//                         sSiteCode: "CH        ",
//                         sUserID: "U1",
//                         sUserDomainName: "SDMS",
//                         sUserGroupID: "G1        ",
//                         sTimeZoneID: "Asia/Shanghai<~>true",
//                         sSessionID: "",
//                         sUserStatus: "Active",
//                         sApplicationName: "SDMS",
//                         sdbtype: "MSSQL",
//                         sTenantID: ""
//                     }
//                 };
                
//                 console.log("Testing with:", testRequest);
//                 const testResponse = await postData("User/UserGroupAndMasterGrid", testRequest);
//                 console.log("Test response:", testResponse);
                
//                 if (!testResponse || Object.keys(testResponse).length === 0) {
//                     showInfoDialog("API connection issue. Please check the endpoint and server.", "error");
//                 } else {
//                     processUserGroupsResponse(testResponse);
//                     return;
//                 }
//                 return;
//             }
            
//             console.log("User groups API Response:", response);
            
//             // Process the response
//             processUserGroupsResponse(response);
            
//         } catch (error) {
//             console.error('Error fetching user groups:', error);
//             console.error('Error details:', {
//                 message: error.message,
//                 stack: error.stack,
//                 name: error.name
//             });
            
//             if (error.message && error.message.includes("Network")) {
//                 showInfoDialog("Network error. Please check your connection and server status.", "error");
//             } else if (error.message && error.message.includes("Failed to fetch")) {
//                 showInfoDialog("Failed to connect to server. Please check if the service is running.", "error");
//             } else {
//                 showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups', "error");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [postData, showInfoDialog, t, getActiveUserDetails, processUserGroupsResponse]);

//     // Handle row selection
//     const handleRowSelect = useCallback((row) => {
//         setSelectedGroup(row);
//         setSelectedRowId(row.id);
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
        
//         if (selectedGroup.L01UserGroupName === "Administrator") {
//             showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
//             return;
//         }
        
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
        
//         if (selectedGroup.L01UserGroupName === "Administrator") {
//             showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
//             return;
//         }
        
//         showInfoDialog(t('usermanagement.confiramationactdeact'), "confirmation");
//         setConfirmationAction('activeDeactive');
//     }, [selectedGroup, showInfoDialog, t]);

//     const handleActiveDeactiveConfirm = useCallback(async () => {
//         if (!selectedGroup) return;
        
//         try {
//             setLoading(true);
            
//             const newStatus = selectedGroup.gStatus === "Active" ? "Deactive" : "Active";
//             const activeUserDetails = getActiveUserDetails();
//             const auditTrailValues = getAuditTrailValues();
            
//             // Create request as per API documentation for UserGroupActDeactBtnclick
//             const requestData = {
//                 ActDeactObj: {
//                     sGroupname: selectedGroup.L01UserGroupName,
//                     sUserStatus: newStatus,
//                     sUserGroupID: selectedGroup.L01UserGroupID
//                 },
//                 AuditTrailValues: auditTrailValues,
//                 ApplicationCode: "SDMS",
//                 ActiveUserDetails: activeUserDetails
//             };
            
//             console.log("Sending Active/Deactive request:", requestData);
            
//             // Call UserGroupActDeactBtnclick endpoint
//             const response = await postData("User/UserGroupActDeactBtnclick", requestData);
            
//             if (!response) {
//                 showInfoDialog(t('usermanagement.actdeactfailed'), "error");
//                 return;
//             }
            
//             console.log("Active/Deactive response:", response);
            
//             // Check if operation was successful
//             if (response.Rtn === "Success") {
//                 const message = selectedGroup.gStatus === "Active" 
//                     ? t('usermanagement.groupdeactivatedsuccessfully')
//                     : t('usermanagement.groupactivatedsuccessfully');
                
//                 showInfoDialog(message, "success");
//                 fetchUserGroups(); // Refresh the list
//             } else {
//                 showInfoDialog(response.returnMsg || t('usermanagement.actdeactfailed'), "error");
//             }
            
//         } catch (error) {
//             console.error('Error in active/deactive:', error);
//             showInfoDialog(t('usermanagement.actdeactfailed'), "error");
//         } finally {
//             setLoading(false);
//         }
//     }, [selectedGroup, postData, showInfoDialog, t, getAuditTrailValues, getActiveUserDetails, fetchUserGroups]);

//     const handleFormChange = useCallback((field, value) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
        
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
        
//         const existingGroup = userGroupData.find(group => 
//             group.L01UserGroupName.toLowerCase() === formData.sGroupName.toLowerCase() &&
//             group.L01UserGroupID !== formData.sUserGroupID
//         );
        
//         if (existingGroup) {
//             errors.sGroupName = t('usermanagement.groupnamealreadyexists');
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     }, [formData, t, userGroupData]);

//     const handleSubmit = useCallback(async () => {
//         if (!validateForm()) {
//             return;
//         }
        
//         const isEdit = formData.sUserGroupID !== "";
        
//         try {
//             setLoading(true);
            
//             const activeUserDetails = getActiveUserDetails();
//             const auditTrailValues = getAuditTrailValues();
            
//             let endpoint, requestData;
            
//             if (isEdit) {
//                 // Update existing group - UserGroupUpdateBtnclick endpoint
//                 endpoint = "User/UserGroupUpdateBtnclick";
//                 requestData = {
//                     grpSave: {
//                         sGroupname: formData.sGroupName,
//                         sUserGroupID: formData.sUserGroupID,
//                         sCreatedBy: activeUserDetails.sUserID,
//                         sUserStatus: "Active"
//                     },
//                     AuditTrailValues: auditTrailValues,
//                     ApplicationCode: "SDMS",
//                     ActiveUserDetails: activeUserDetails
//                 };
//             } else {
//                 // Add new group - UserGroupSaveBtnclick endpoint
//                 endpoint = "User/UserGroupSaveBtnclick";
//                 requestData = {
//                     grpSave: {
//                         sGroupname: formData.sGroupName,
//                         sCreatedBy: activeUserDetails.sUserID,
//                         sUserStatus: "Active"
//                     },
//                     ApplicationCode: "SDMS",
//                     ActiveUserDetails: activeUserDetails
//                 };
//             }
            
//             console.log(`Sending ${isEdit ? 'update' : 'add'} request to ${endpoint}:`, requestData);
            
//             // Call the appropriate endpoint
//             const response = await postData(endpoint, requestData);
            
//             if (!response) {
//                 showInfoDialog(
//                     isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage'),
//                     "error"
//                 );
//                 return;
//             }
            
//             console.log(`${isEdit ? 'Update' : 'Add'} response:`, response);
            
//             // Check if operation was successful
//             if (response.Rtn === "Success") {
//                 const message = isEdit 
//                     ? t('usermanagement.groupupdatesuccessfully')
//                     : t('usermanagement.groupaddedsuccessfully');
                
//                 showInfoDialog(message, "success");
//                 fetchUserGroups(); // Refresh the list
//                 setActivePopup(null);
//             } else {
//                 showInfoDialog(
//                     response.returnMsg || 
//                     (isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage')),
//                     "error"
//                 );
//             }
            
//         } catch (error) {
//             console.error('Error saving user group:', error);
//             showInfoDialog(
//                 isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage'),
//                 "error"
//             );
//         } finally {
//             setLoading(false);
//         }
//     }, [formData, validateForm, showInfoDialog, t, postData, getActiveUserDetails, getAuditTrailValues, fetchUserGroups]);

//     const handlePopupClose = useCallback(() => {
//         setActivePopup(null);
//         setFormErrors({});
//     }, []);

//     useEffect(() => {
//         const sessionID = sessionStorage.getItem('sSessionID');
//         const userID = sessionStorage.getItem('sUserID');
        
//         if (!sessionID || !userID) {
//             showInfoDialog(t('usermanagement.sessionexpired') || 'Session expired. Please login again.', "error");
//             return;
//         }
        
//         fetchUserGroups();
//     }, [fetchUserGroups, showInfoDialog, t]);

//     useEffect(() => {
//         if (selectedRowId && userGroupData.length > 0) {
//             const selected = userGroupData.find(group => group.id === selectedRowId);
//             if (selected) {
//                 setSelectedGroup(selected);
//             }
//         }
//     }, [selectedRowId, userGroupData]);

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
//                     {group.gCreatedBy || ''}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.createdon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gCreatedOn || ''}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedby')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gModifiedBy || ''}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gModifiedOn || ''}
//                 </div>
//             </div>
//         </div>
//     ), [t]);

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

//                 <div className="flex-1 overflow-auto p-3 font-['Roboto'] text-[#353f49]">
//                     {loading ? (
//                         <div className="text-center py-10 text-gray-500">
//                             {t("login.loadingpasswordpolicy")}
//                         </div>
//                     ) : (
//                         <GridLayout
//                             columns={columns}
//                             height="100%"
//                             detailPanelWidth="46%"
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

//                 {activePopup && (
//                     <CustomPopup
//                         isOpen={!!activePopup}
//                         onClose={handlePopupClose}
//                         title={activePopup}
//                         content={
//                             <div className="flex flex-col gap-1 p-1">
//                                 <input
//                                     type="hidden"
//                                     value={formData.sUserGroupID}
//                                 />

//                                 <div className="flex flex-col">
//                                     <label className="text-[12px] font-roboto font-bold text-[#405f7d]">
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

//                                 <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
//                                     <button
//                                         onClick={handleSubmit}
//                                         disabled={loading}
//                                         className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         <Edit className="w-4 h-4" /> 
//                                         {loading ? t('usermanagement.saving') : t('usermanagement.submit')}
//                                     </button>
//                                     <button
//                                         onClick={handlePopupClose}
//                                         disabled={loading}
//                                         className="px-2.5 py-2 text-[12px] font-roboto font-semibold text-[#8092a4] bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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




















































































import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Users, Edit, UserCheck, UserX, UserPlus } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
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
    const [showAudit, setShowAudit] = useState(false);
    const [formData, setFormData] = useState({
        sGroupName: "",
        sUserGroupID: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [auditAction, setAuditAction] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [auditTrailRights, setAuditTrailRights] = useState({
        edit: 0,
        activeDeactive: 0
    });

    const { t } = useTranslation();
    const { postData } = servicecall();

    // Use refs to avoid stale state in callbacks
    const userGroupDataRef = useRef(userGroupData);
    const formDataRef = useRef(formData);
    const auditTrailRightsRef = useRef(auditTrailRights);
    const selectedGroupRef = useRef(selectedGroup);
    const confirmationActionRef = useRef(confirmationAction);

    // Update refs when state changes
    useEffect(() => {
        userGroupDataRef.current = userGroupData;
    }, [userGroupData]);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    useEffect(() => {
        auditTrailRightsRef.current = auditTrailRights;
    }, [auditTrailRights]);

    useEffect(() => {
        selectedGroupRef.current = selectedGroup;
    }, [selectedGroup]);

    useEffect(() => {
        confirmationActionRef.current = confirmationAction;
    }, [confirmationAction]);

    // Enhanced decryption function with better error handling
    const getDecryptedValue = useCallback((key) => {
        try {
            const encryptedValue = sessionStorage.getItem(key);
            if (!encryptedValue) {
                console.log(`No value found for ${key} in sessionStorage`);
                return "";
            }
            
            // Check if it's a valid string and not empty
            if (typeof encryptedValue !== 'string' || encryptedValue.trim() === '') {
                return "";
            }
            
            // Try to decrypt if it looks like encrypted data
            try {
                const decrypted = CF_decrypt(encryptedValue);
                return decrypted || "";
            } catch (decryptError) {
                console.warn(`Decryption failed for ${key}:`, decryptError.message);
                // Return raw value if decryption fails
                return encryptedValue;
            }
        } catch (error) {
            console.error(`Error getting value for ${key}:`, error);
            return "";
        }
    }, []);

    // Memoize getActiveUserDetails to prevent unnecessary recreations
    const getActiveUserDetails = useMemo(() => {
        return () => {
            // Get values
            const sUsername = getDecryptedValue("sUsername");
            const sSiteCode = getDecryptedValue("sSiteCode");
            const sUserGroupID = getDecryptedValue("sUserGroupID");
            const sUserID = getDecryptedValue("sUserID");
            const sSessionID = getDecryptedValue("sSessionID");
            const sDomainName = getDecryptedValue("sDomainName");
            const sTimeZoneID = getDecryptedValue("sTimeZoneID");
            const sdbtype = getDecryptedValue("sdbtype");
            const sCategories = getDecryptedValue("sCategories");
            const sUserStatus = getDecryptedValue("sUserStatus");
            
            // sTenantID might be empty, handle it carefully
            let sTenantID = "";
            try {
                sTenantID = getDecryptedValue("sTenantID") || "";
            } catch (error) {
                console.log("sTenantID decryption failed, using empty string");
            }

            // IMPORTANT: Format values exactly like in working example
            const formattedSiteCode = (sSiteCode || "CH").padEnd(10, ' ').substring(0, 10);
            const formattedUserGroupID = (sUserGroupID || "G1").padEnd(10, ' ').substring(0, 10);
            
            // FIXED: Proper timezone formatting
            let timeZoneID;
            if (sTimeZoneID && sTimeZoneID.trim() !== "") {
                if (!sTimeZoneID.includes("<~>")) {
                    timeZoneID = sTimeZoneID + "<~>true";
                } else {
                    timeZoneID = sTimeZoneID;
                }
            } else {
                timeZoneID = "Asia/Shanghai<~>true";
            }

            return {
                sUsername: sUsername || "Administrator",
                sCategories: sCategories || "DB",
                sSiteCode: formattedSiteCode,
                sUserID: sUserID || "U1",
                sUserDomainName: sDomainName || "SDMS",
                sUserGroupID: formattedUserGroupID,
                sTimeZoneID: timeZoneID,
                sSessionID: sSessionID || "",
                sUserStatus: "", // IMPORTANT: Empty string like in working example
                sApplicationName: "SDMS",
                sdbtype: sdbtype || "MSSQL",
                sTenantID: sTenantID
            };
        };
    }, [getDecryptedValue]);

    // Validate form function
    const validateForm = useCallback(() => {
        const errors = {};
        const currentFormData = formDataRef.current;
        const currentUserGroupData = userGroupDataRef.current;
        
        if (!currentFormData.sGroupName.trim()) {
            errors.sGroupName = t('usermanagement.usergroupname') + " " + t('usermanagement.isrequired');
        }
        
        const existingGroup = currentUserGroupData.find(group => 
            group.L01UserGroupName.toLowerCase() === currentFormData.sGroupName.toLowerCase() &&
            group.L01UserGroupID !== currentFormData.sUserGroupID
        );
        
        if (existingGroup) {
            errors.sGroupName = t('usermanagement.groupnamealreadyexists');
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [t]);

    // Show info dialog - memoized
    const showInfoDialog = useCallback((message, type = "information") => {
        console.log(`Showing dialog: ${message} (${type})`);
        setInfoDialog({
            open: true,
            message,
            type
        });
    }, []);

    // Process user groups response
    const processUserGroupsResponse = useCallback((response) => {
        console.log("Processing response:", response);
        
        let groupsData = [];
        
        // Extract user group data from response
        if (response && response.oResObj && Array.isArray(response.oResObj)) {
            groupsData = response.oResObj;
            console.log("Found data in response.oResObj");
        } else if (response && response.returnservice && response.returnservice.oResObj) {
            groupsData = response.returnservice.oResObj;
            console.log("Found data in response.returnservice.oResObj");
        } else if (Array.isArray(response)) {
            groupsData = response;
            console.log("Response is array");
        } else if (response && response.oResObj1 && Array.isArray(response.oResObj1)) {
            groupsData = response.oResObj1;
            console.log("Found data in response.oResObj1");
        }
        
        console.log("Extracted groups data:", groupsData);
        
        if (groupsData.length === 0) {
            console.warn("No groups data found in response");
            setUserGroupData([]);
            return;
        }
        
        // Format the data
        const formattedData = groupsData.map((group, index) => ({
            id: index + 1,
            L01UserGroupID: group.L01UserGroupID || '',
            L01UserGroupName: group.L01UserGroupName || '',
            gStatus: group.gStatus || 'Active',
            gCreatedBy: group.gCreatedBy || 'System',
            gCreatedOn: group.gCreatedOn ? (group.gCreatedOn) : '',
            gUTCCreatedOn: group.gUTCCreatedOn || '',
            gModifiedBy: group.gModifiedBy || null,
            gModifiedOn: group.gModifiedOn ? (group.gModifiedOn) : null, 
            gUTCModifiedOn: group.gUTCModifiedOn || null
        }));
        
        console.log("Formatted user groups:", formattedData);
        
        setUserGroupData(formattedData);
        
        if (formattedData.length > 0 && !selectedRowId) {
            setSelectedGroup(formattedData[0]);
            setSelectedRowId(formattedData[0].id);
        }
    }, [selectedRowId]);

    // Fetch user groups - fixed dependencies
    const fetchUserGroups = useCallback(async () => {
        setLoading(true);
        try {
            const activeUserDetails = getActiveUserDetails();
            
            console.log("Active User Details:", activeUserDetails);
            
            // Create request as per API documentation
            const requestData = {
                ApplicationCode: "SDMS",
                ActiveUserDetails: activeUserDetails
            };
            
            console.log("Fetching user groups with request:", JSON.stringify(requestData, null, 2));
            
            // Call the UserGroupAndMasterGrid endpoint
            const response = await postData("User/UserGroupAndMasterGrid", requestData);
            
            console.log("Raw API Response:", response);
            console.log("Response type:", typeof response);
            
            if (!response) {
                console.error("Response is null");
                showInfoDialog("Server returned null response", "error");
                return;
            }
            
            if (typeof response === 'string') {
                console.error("Response is string:", response);
                showInfoDialog("Server returned string instead of JSON", "error");
                return;
            }
            
            if (Object.keys(response).length === 0) {
                console.error("Empty response object received");
                
                // Check if session is valid
                if (!activeUserDetails.sSessionID || !activeUserDetails.sUserID) {
                    showInfoDialog("Session expired or invalid. Please login again.", "error");
                    return;
                }
                
                showInfoDialog("Server returned empty response. Please check API configuration.", "error");
                return;
            }
            
            // Check for error response
            if (response.Rtn && response.Rtn !== "Success") {
                console.error("API returned error:", response.Rtn);
                showInfoDialog(response.returnMsg || "Failed to fetch user groups", "error");
                return;
            }
            
            console.log("Processing successful response...");
            processUserGroupsResponse(response);
            
        } catch (error) {
            console.error('Error fetching user groups:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            // Check if it's a network error
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                showInfoDialog("Cannot connect to server. Please check if the service is running.", "error");
            } else if (error.message && error.message.includes("Network")) {
                showInfoDialog("Network error. Please check your connection.", "error");
            } else {
                showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups', "error");
            }
        } finally {
            setLoading(false);
        }
    }, [postData, t, getActiveUserDetails, processUserGroupsResponse, showInfoDialog]);

    // Handle active/deactive confirm
    const handleActiveDeactiveConfirm = useCallback(async (auditTrailValues = null) => {
        const currentSelectedGroup = selectedGroupRef.current;
        console.log("handleActiveDeactiveConfirm called with selectedGroup:", currentSelectedGroup);
        
        if (!currentSelectedGroup) {
            console.error("No selected group!");
            setConfirmationAction(null);
            return;
        }
        
        try {
            setIsSubmitting(true);
            
            const newStatus = currentSelectedGroup.gStatus === "Active" ? "Deactive" : "Active";
            console.log(`Changing status from ${currentSelectedGroup.gStatus} to ${newStatus}`);
            
            const activeUserDetails = getActiveUserDetails();
            
            // Create request as per API documentation for UserGroupActDeactBtnclick
            const requestData = {
                ActDeactObj: {
                    sGroupname: currentSelectedGroup.L01UserGroupName,
                    sUserStatus: newStatus,
                    sUserGroupID: currentSelectedGroup.L01UserGroupID
                },
                ApplicationCode: "SDMS",
                ActiveUserDetails: activeUserDetails
            };

            // Add audit trail values if provided
            if (auditTrailValues) {
                requestData.AuditTrailValues = auditTrailValues;
            }
            
            console.log("Sending Active/Deactive request:", JSON.stringify(requestData, null, 2));
            
            // Call UserGroupActDeactBtnclick endpoint
            const response = await postData("User/UserGroupActDeactBtnclick", requestData);
            
            if (!response) {
                showInfoDialog(t('usermanagement.actdeactfailed'), "error");
                setConfirmationAction(null);
                return;
            }
            
            console.log("Active/Deactive response:", response);
            
            // Check if operation was successful
            if (response.Rtn === "Success") {
                const message = currentSelectedGroup.gStatus === "Active" 
                    ? t('usermanagement.groupdeactivatedsuccessfully')
                    : t('usermanagement.groupactivatedsuccessfully');
                
                console.log("Success! Showing message:", message);
                showInfoDialog(message, "success");
                console.log("Calling fetchUserGroups to refresh data...");
                await fetchUserGroups(); // Refresh the list
            } else {
                // Check for audit trail login failure
                if (response.AuditTrailLogin === false) {
                    showInfoDialog(response.LoginFailedMsg || "Audit trail authentication failed", "error");
                } else {
                    showInfoDialog(response.returnMsg || t('usermanagement.actdeactfailed'), "error");
                }
            }
            
            setConfirmationAction(null);
            
        } catch (error) {
            console.error('Error in active/deactive:', error);
            showInfoDialog(t('usermanagement.actdeactfailed'), "error");
            setConfirmationAction(null);
        } finally {
            setIsSubmitting(false);
        }
    }, [postData, showInfoDialog, t, getActiveUserDetails, fetchUserGroups]);

    const handleEditConfirm = useCallback(async (auditTrailValues = null) => {
        console.log("handleEditConfirm called with auditTrailValues:", auditTrailValues);
        
        if (!validateForm()) {
            console.log("Form validation failed");
            return;
        }
        
        try {
            setIsSubmitting(true);
            
            const activeUserDetails = getActiveUserDetails();
            const currentFormData = formDataRef.current;
            
            // Update existing group - UserGroupUpdateBtnclick endpoint
            const endpoint = "User/UserGroupUpdateBtnclick";
            const requestData = {
                grpSave: {
                    sGroupname: currentFormData.sGroupName,
                    sUserGroupID: currentFormData.sUserGroupID,
                    sCreatedBy: activeUserDetails.sUserID,
                    sUserStatus: "Active"
                },
                ApplicationCode: "SDMS",
                ActiveUserDetails: activeUserDetails
            };

            // Add audit trail values if provided
            if (auditTrailValues) {
                requestData.AuditTrailValues = auditTrailValues;
            }
            
            console.log('Sending update request to UserGroupUpdateBtnclick:', JSON.stringify(requestData, null, 2));
            
            // Call the update endpoint
            const response = await postData(endpoint, requestData);
            
            if (!response) {
                showInfoDialog(t('usermanagement.updatefailed'), "error");
                return;
            }
            
            console.log('Update response:', response);
            
            // Check if operation was successful
            if (response.Rtn === "Success") {
                showInfoDialog(t('usermanagement.groupupdatesuccessfully'), "success");
                await fetchUserGroups(); // Refresh the list
                setActivePopup(null);
            } else {
                // Check for audit trail login failure
                if (response.AuditTrailLogin === false) {
                    showInfoDialog(response.LoginFailedMsg || "Audit trail authentication failed", "error");
                } else {
                    showInfoDialog(response.returnMsg || t('usermanagement.updatefailed'), "error");
                }
            }
            
        } catch (error) {
            console.error('Error updating user group:', error);
            showInfoDialog(t('usermanagement.updatefailed'), "error");
        } finally {
            setIsSubmitting(false);
        }
    }, [validateForm, showInfoDialog, t, postData, getActiveUserDetails, fetchUserGroups]);

    // Fixed closeInfoDialog
    const closeInfoDialog = useCallback(() => {
        console.log("closeInfoDialog called");
        
        // Store current values before state changes
        const currentDialogType = infoDialog.type;
        const currentConfirmationAction = confirmationActionRef.current;
        const currentAuditRights = auditTrailRightsRef.current;
        
        // Close the dialog first
        setInfoDialog(prev => ({ ...prev, open: false }));
        
        // Handle confirmation after dialog closes
        if (currentConfirmationAction && currentDialogType === "confirmation") {
            console.log(`Processing confirmation action: ${currentConfirmationAction}`);
            
            if (currentConfirmationAction === 'deactivate' || currentConfirmationAction === 'activate') {
                console.log("Setting auditAction to activeDeactive");
                setAuditAction('activeDeactive');
                
                console.log("Current audit rights:", currentAuditRights);
                
                if (currentAuditRights.activeDeactive === 1) {
                    console.log("Showing audit trail...");
                    // Use setTimeout to ensure state updates happen in correct order
                    setTimeout(() => {
                        setShowAudit(true);
                    }, 100);
                } else {
                    console.log("No audit trail required, proceeding directly");
                    // If no audit trail required, proceed directly
                    setTimeout(() => {
                        handleActiveDeactiveConfirm();
                    }, 100);
                }
            }
        }
    }, [infoDialog, handleActiveDeactiveConfirm]);

    // Handle audit authorized
    const handleAuditAuthorized = useCallback((auditData) => {
        console.log("Audit authorized with data:", auditData);
        
        const auditTrailValues = auditData.AuditTrailValues;
        
        if (!auditTrailValues) {
            showInfoDialog("Audit trail data is missing", "error");
            setShowAudit(false);
            setConfirmationAction(null);
            return;
        }
        
        // Close audit trail modal
        setShowAudit(false);
        
        console.log(`Performing action after audit: ${auditAction}`);
        
        // Perform the action based on auditAction
        if (auditAction === 'edit') {
            handleEditConfirm(auditTrailValues);
        } else if (auditAction === 'activeDeactive') {
            handleActiveDeactiveConfirm(auditTrailValues);
        }
        
        // Reset states
        setAuditAction(null);
        setConfirmationAction(null);
    }, [auditAction, handleEditConfirm, handleActiveDeactiveConfirm, showInfoDialog]);

    // Handle audit close
    const handleAuditClose = useCallback(() => {
        console.log("Closing audit trail");
        setShowAudit(false);
        setAuditAction(null);
        setConfirmationAction(null);
    }, []);

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
        console.log("Edit clicked, selectedGroup:", selectedGroup);
        
        if (!selectedGroup) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        if (selectedGroup.L01UserGroupName === "Administrator") {
            showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
            return;
        }
        
        if (selectedGroup.gStatus === "Deactive") {
            showInfoDialog(t('usermanagement.groupdeactivesocannotedit'), "warning");
            return;
        }
        
        setFormData({
            sGroupName: selectedGroup.L01UserGroupName,
            sUserGroupID: selectedGroup.L01UserGroupID
        });
        setFormErrors({});
        
        // Open edit popup
        setActivePopup(t('usermanagement.updateusergroup'));
    }, [selectedGroup, showInfoDialog, t]);

    const handleActiveDeactiveClick = useCallback(() => {
        console.log("Active/Deactive clicked, selectedGroup:", selectedGroup);
        console.log("Audit trail rights for activeDeactive:", auditTrailRights.activeDeactive);
        
        if (!selectedGroup) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        if (selectedGroup.L01UserGroupName === "Administrator") {
            showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
            return;
        }
        
        const actionType = selectedGroup.gStatus === "Active" ? "deactivate" : "activate";
        const message = actionType === "deactivate" 
            ? t('usermanagement.confirmdeactivategroup', { groupName: selectedGroup.L01UserGroupName })
            : t('usermanagement.confirmactivategroup', { groupName: selectedGroup.L01UserGroupName });
        
        console.log(`Setting confirmation action: ${actionType}`);
        console.log("Showing confirmation dialog...");
        
        setConfirmationAction(actionType);
        showInfoDialog(message, "confirmation");
    }, [selectedGroup, showInfoDialog, t, auditTrailRights]);

    const handleSubmit = useCallback(async () => {
        console.log("Submit button clicked, auditTrailRights.edit:", auditTrailRights.edit);
        
        if (!validateForm()) {
            console.log("Form validation failed");
            return;
        }
        
        const isEdit = formData.sUserGroupID !== "";
        
        console.log(`Is edit operation: ${isEdit}`);
        
        if (isEdit && auditTrailRights.edit === 1) {
            console.log("Edit requires audit trail, showing audit...");
            
            // Close edit popup first
            setActivePopup(null);
            
            // Set a small delay to ensure popup closes before audit opens
            setTimeout(() => {
                setAuditAction('edit');
                setShowAudit(true);
            }, 100);
            
            return;
        }
        
        // If no audit trail required or it's an add operation
        try {
            setIsSubmitting(true);
            
            const activeUserDetails = getActiveUserDetails();
            
            let endpoint, requestData;
            
            if (isEdit) {
                // Update existing group - UserGroupUpdateBtnclick endpoint
                endpoint = "User/UserGroupUpdateBtnclick";
                requestData = {
                    grpSave: {
                        sGroupname: formData.sGroupName,
                        sUserGroupID: formData.sUserGroupID,
                        sCreatedBy: activeUserDetails.sUserID,
                        sUserStatus: "Active"
                    },
                    ApplicationCode: "SDMS",
                    ActiveUserDetails: activeUserDetails
                };
            } else {
                // Add new group - UserGroupSaveBtnclick endpoint
                endpoint = "User/UserGroupSaveBtnclick";
                requestData = {
                    grpSave: {
                        sGroupname: formData.sGroupName,
                        sCreatedBy: activeUserDetails.sUserID,
                        sUserStatus: "Active"
                    },
                    ApplicationCode: "SDMS",
                    ActiveUserDetails: activeUserDetails
                };
            }
            
            console.log(`Sending ${isEdit ? 'update' : 'add'} request to ${endpoint}:`, JSON.stringify(requestData, null, 2));
            
            // Call the appropriate endpoint
            const response = await postData(endpoint, requestData);
            
            if (!response) {
                showInfoDialog(
                    isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage'),
                    "error"
                );
                return;
            }
            
            console.log(`${isEdit ? 'Update' : 'Add'} response:`, response);
            
            // Check if operation was successful
            if (response.Rtn === "Success") {
                const message = isEdit 
                    ? t('usermanagement.groupupdatesuccessfully')
                    : t('usermanagement.groupaddedsuccessfully');
                
                showInfoDialog(message, "success");
                await fetchUserGroups(); // Refresh the list
                setActivePopup(null);
            } else {
                showInfoDialog(
                    response.returnMsg || 
                    (isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage')),
                    "error"
                );
            }
            
        } catch (error) {
            console.error('Error saving user group:', error);
            showInfoDialog(
                isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage'),
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, showInfoDialog, t, postData, getActiveUserDetails, fetchUserGroups, auditTrailRights]);

    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    }, [formErrors]);

    const handlePopupClose = useCallback(() => {
        setActivePopup(null);
        setFormErrors({});
    }, []);

    // Load audit trail rights
    useEffect(() => {
        const loadAuditTrailRights = () => {
            try {
                // Try to get audit trail rights from session storage
                const auditRightsData = sessionStorage.getItem('auditTrailRights');
                
                if (auditRightsData) {
                    try {
                        const rights = JSON.parse(auditRightsData);
                        console.log("Loaded audit rights from session:", rights);
                        
                        // Filter for User Group screen
                        const userGroupRights = rights.filter(item => 
                            item.sScreenName && item.sScreenName.includes("User Group")
                        );
                        
                        console.log("User Group rights:", userGroupRights);
                        
                        const editRight = userGroupRights.find(item => 
                            item.sTaskName && item.sTaskName.includes("Edit")
                        );
                        const activeDeactiveRight = userGroupRights.find(item => 
                            item.sTaskName && item.sTaskName.includes("Active/Deactive")
                        );
                        
                        setAuditTrailRights({
                            edit: editRight ? (editRight.nManualAuditTrail || 0) : 0,
                            activeDeactive: activeDeactiveRight ? (activeDeactiveRight.nManualAuditTrail || 0) : 0
                        });
                    } catch (parseError) {
                        console.error("Error parsing audit rights:", parseError);
                        // Default to requiring audit trail
                        setAuditTrailRights({
                            edit: 1,
                            activeDeactive: 1
                        });
                    }
                } else {
                    // For testing, default to requiring audit trail
                    console.log("No audit rights found, defaulting to require audit trail for testing");
                    setAuditTrailRights({
                        edit: 1,
                        activeDeactive: 1
                    });
                }
            } catch (error) {
                console.error("Error loading audit trail rights:", error);
            }
        };
        
        // Load rights after a short delay
        const timer = setTimeout(() => {
            loadAuditTrailRights();
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

    // Debug useEffect
    useEffect(() => {
        console.log("=== State Debug ===");
        console.log("selectedGroup:", selectedGroup);
        console.log("confirmationAction:", confirmationAction);
        console.log("auditAction:", auditAction);
        console.log("showAudit:", showAudit);
        console.log("auditTrailRights:", auditTrailRights);
        console.log("infoDialog:", infoDialog);
        console.log("=== End Debug ===");
    }, [selectedGroup, confirmationAction, auditAction, showAudit, auditTrailRights, infoDialog]);

    // Initial data fetch
    useEffect(() => {
        const fetchData = async () => {
            const sessionID = getDecryptedValue('sSessionID');
            const userID = getDecryptedValue('sUserID');
            
            console.log("Checking session - SessionID:", sessionID, "UserID:", userID);
            
            if (!sessionID || !userID) {
                showInfoDialog(t('usermanagement.sessionexpired') || 'Session expired. Please login again.', "error");
                return;
            }
            
            await fetchUserGroups();
        };
        
        fetchData();
    }, []); // Empty dependency array - only run once on mount

    // Update selected group when selectedRowId or userGroupData changes
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
    ], [t, handleRowSelect]);

    const renderGroupDetail = useCallback((group) => (
        <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.createdby')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {group.gCreatedBy || ''}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.createdon')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {group.gCreatedOn || ''}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.modifiedby')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {group.gModifiedBy || ''}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.modifiedon')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {group.gModifiedOn || ''}
                </div>
            </div>
        </div>
    ), [t]);

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

                {/* Audit Trail Modal */}
                {showAudit && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
                        <AuditTrail 
                            isOpen={showAudit}
                            onClose={handleAuditClose}
                            onAuthorized={handleAuditAuthorized}
                            actionLabel={auditAction === 'edit' ? 'Edit User Group' : 'Active/Deactive User Group'}
                            defaultReason={auditAction === 'edit' ? "Modified" : "Activated"}
                            disableReason={false}
                        />
                    </div>
                )}

                <div className="flex justify-end pr-5 gap-2 pt-3">
                    <ActionButton
                        icon={UserPlus}
                        label={t('usermanagement.addnewgroup')}
                        onClick={handleAddClick}
                        disabled={isSubmitting}
                    />
                    <ActionButton
                        icon={Edit}
                        label={t('usermanagement.edit')}
                        onClick={handleEditClick}
                        disabled={!selectedGroup || isSubmitting}
                    />
                    <ActionButton
                        icon={UserX}
                        label={t('usermanagement.activedeactive')}
                        onClick={handleActiveDeactiveClick}
                        disabled={!selectedGroup || isSubmitting}
                    />
                </div>

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

                {activePopup && (
                    <CustomPopup
                        isOpen={!!activePopup}
                        onClose={handlePopupClose}
                        title={activePopup}
                        content={
                            <div className="flex flex-col gap-1 p-1">
                                <input
                                    type="hidden"
                                    value={formData.sUserGroupID}
                                />

                                <div className="flex flex-col">
                                    <label className="text-[12px] font-roboto font-bold text-[#405f7d]">
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

                                <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Edit className="w-4 h-4" /> 
                                        {isSubmitting ? t('usermanagement.saving') : t('usermanagement.submit')}
                                    </button>
                                    <button
                                        onClick={handlePopupClose}
                                        disabled={isSubmitting}
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


































// import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// import { Users, Edit, UserCheck, UserX, UserPlus } from 'lucide-react';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// import { useTranslation } from 'react-i18next';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import CustomPopup from '../../../../Layout/Common/Popup';
// import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
// import AuditTrail from '../../../../Layout/Common/AuditTrail';
// import servicecall from '../../../../../Services/servicecall';
// import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';

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
//     const [showAudit, setShowAudit] = useState(false);
//     const [auditTrailData, setAuditTrailData] = useState({
//         username: "",
//         password: "",
//         reason: "",
//         comments: ""
//     });
//     const [formData, setFormData] = useState({
//         sGroupName: "",
//         sUserGroupID: ""
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const [confirmationAction, setConfirmationAction] = useState(null);
//     const [auditAction, setAuditAction] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const { t } = useTranslation();
//     const { postData } = servicecall();
//     const isInitialMount = useRef(true);

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
        
//         // Handle confirmation after dialog closes
//         if (confirmationAction && infoDialog.type === "confirmation") {
//             // Show audit trail for active/deactive
//             if (confirmationAction === 'deactivate' || confirmationAction === 'activate') {
//                 setAuditAction('activeDeactive');
//                 setShowAudit(true);
//             }
//         }
        
//         setConfirmationAction(null);
//     }, [confirmationAction, infoDialog.type, infoDialog.message]);

//     const getActiveUserDetails = useCallback(() => {
//         const getDecryptedValue = (key) => {
//             try {
//                 const encryptedValue = sessionStorage.getItem(key);
//                 if (!encryptedValue) return "";
                
//                 if (encryptedValue.length > 50 && encryptedValue.includes('==')) {
//                     return CF_decrypt(encryptedValue);
//                 }
//                 return encryptedValue;
//             } catch (error) {
//                 console.error(`Error decrypting ${key}:`, error);
//                 return "";
//             }
//         };

//         const sUsername = getDecryptedValue("sUsername");
//         const sSiteCode = getDecryptedValue("sSiteCode") || "CH        ";
//         const sUserGroupID = getDecryptedValue("sUserGroupID") || "G1        ";
//         const sUserID = getDecryptedValue("sUserID") || "U1";
//         const sSessionID = getDecryptedValue("sSessionID");
//         const sDomainName = getDecryptedValue("sDomainName") || "SDMS";
//         const sTimeZoneID = getDecryptedValue("sTimeZoneID") || "Asia/Shanghai<~>true";
//         const sdbtype = getDecryptedValue("sdbtype") || "MSSQL";
//         const sCategories = getDecryptedValue("sCategories") || "DB";
//         const sUserStatus = getDecryptedValue("sUserStatus") || "";
//         const sTenantID = getDecryptedValue("sTenantID") || "";

//         return {
//             sUsername: sUsername || "Administrator",
//             sCategories: sCategories,
//             sSiteCode: sSiteCode.padEnd(10, ' ').substring(0, 10),
//             sUserID: sUserID,
//             sUserDomainName: sDomainName,
//             sUserGroupID: sUserGroupID.padEnd(10, ' ').substring(0, 10),
//             sTimeZoneID: sTimeZoneID,
//             sSessionID: sSessionID || "",
//             sUserStatus: sUserStatus,
//             sApplicationName: "SDMS",
//             sdbtype: sdbtype,
//             sTenantID: sTenantID
//         };
//     }, []);

//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         try {
//             const date = new Date(dateString);
//             if (isNaN(date.getTime())) {
//                 return dateString;
//             }
//             return date.toLocaleString('en-US', {
//                 year: 'numeric',
//                 month: '2-digit',
//                 day: '2-digit',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: false
//             }).replace(',', '');
//         } catch (error) {
//             console.error('Error formatting date:', error);
//             return dateString;
//         }
//     };

//     const processUserGroupsResponse = useCallback((response, shouldPreserveSelection = false) => {
//     console.log("Processing response:", response);
    
//     let groupsData = [];
    
//     if (response && response.oResObj && Array.isArray(response.oResObj)) {
//         groupsData = response.oResObj;
//     } else if (response && response.returnservice && response.returnservice.oResObj) {
//         groupsData = response.returnservice.oResObj;
//     } else if (Array.isArray(response)) {
//         groupsData = response;
//     }
    
//     console.log("Extracted groups data:", groupsData);
    
//     const formattedData = groupsData.map((group, index) => ({
//         id: index + 1,
//         L01UserGroupID: group.L01UserGroupID || '',
//         L01UserGroupName: group.L01UserGroupName || '',
//         gStatus: group.gStatus || 'Active',
//         gCreatedBy: group.gCreatedBy || 'System',
//         gCreatedOn: group.gCreatedOn ? formatDate(group.gCreatedOn) : '',
//         gUTCCreatedOn: group.gUTCCreatedOn || '',
//         gModifiedBy: group.gModifiedBy || null,
//         gModifiedOn: group.gModifiedOn ? formatDate(group.gModifiedOn) : null,
//         gUTCModifiedOn: group.gUTCModifiedOn || null
//     }));
    
//     console.log("Formatted user groups:", formattedData);
    
//     setUserGroupData(formattedData);
    
//     // Only auto-select first row on initial load if no row is selected
//     if (formattedData.length > 0 && !selectedRowId && !shouldPreserveSelection) {
//         setSelectedGroup(formattedData[0]);
//         setSelectedRowId(formattedData[0].id);
//     } else if (shouldPreserveSelection && selectedRowId) {
//         // Try to keep the same selection after refresh
//         const previouslySelected = formattedData.find(item => item.id === selectedRowId);
//         if (previouslySelected) {
//             setSelectedGroup(previouslySelected);
//         } else if (formattedData.length > 0) {
//             // If previous selection doesn't exist anymore, select first row
//             setSelectedGroup(formattedData[0]);
//             setSelectedRowId(formattedData[0].id);
//         }
//     }
// }, [selectedRowId]); // Keep this dependency but handle it carefully

//     const fetchUserGroups = useCallback(async () => {
//         setLoading(true);
//         try {
//             const activeUserDetails = getActiveUserDetails();
            
//             // Log all session storage items for debugging
//             console.log("All session storage items:");
//             for (let i = 0; i < sessionStorage.length; i++) {
//                 const key = sessionStorage.key(i);
//                 console.log(`${key}: ${sessionStorage.getItem(key)}`);
//             }
            
//             // Create request as per API documentation
//             const requestData = {
//                 ApplicationCode: "SDMS",
//                 ActiveUserDetails: activeUserDetails
//             };
            
//             console.log("Fetching user groups with FULL request:", JSON.stringify(requestData, null, 2));
            
//             // Call the UserGroupAndMasterGrid endpoint
//             const response = await postData("User/UserGroupAndMasterGrid", requestData);
            
//             console.log("Raw API Response:", response);
//             console.log("Response type:", typeof response);
//             console.log("Response keys:", Object.keys(response || {}));
            
//             if (!response || Object.keys(response).length === 0) {
//                 console.error("Empty response received");
                
//                 // Try with a simpler request first
//                 console.log("Testing with minimal request...");
                
//                 const testRequest = {
//                     ApplicationCode: "SDMS",
//                     ActiveUserDetails: {
//                         sUsername: "Administrator",
//                         sCategories: "DB",
//                         sSiteCode: "CH        ",
//                         sUserID: "U1",
//                         sUserDomainName: "SDMS",
//                         sUserGroupID: "G1        ",
//                         sTimeZoneID: "Asia/Shanghai<~>true",
//                         sSessionID: "",
//                         sUserStatus: "Active",
//                         sApplicationName: "SDMS",
//                         sdbtype: "MSSQL",
//                         sTenantID: ""
//                     }
//                 };
                
//                 console.log("Testing with:", testRequest);
//                 const testResponse = await postData("User/UserGroupAndMasterGrid", testRequest);
//                 console.log("Test response:", testResponse);
                
//                 if (!testResponse || Object.keys(testResponse).length === 0) {
//                     showInfoDialog("API connection issue. Please check the endpoint and server.", "error");
//                 } else {
//                     processUserGroupsResponse(testResponse);
//                     return;
//                 }
//                 return;
//             }
            
//             console.log("User groups API Response:", response);
            
//             // Process the response
//             processUserGroupsResponse(response);
            
//         } catch (error) {
//             console.error('Error fetching user groups:', error);
//             console.error('Error details:', {
//                 message: error.message,
//                 stack: error.stack,
//                 name: error.name
//             });
            
//             if (error.message && error.message.includes("Network")) {
//                 showInfoDialog("Network error. Please check your connection and server status.", "error");
//             } else if (error.message && error.message.includes("Failed to fetch")) {
//                 showInfoDialog("Failed to connect to server. Please check if the service is running.", "error");
//             } else {
//                 showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups', "error");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [postData, showInfoDialog, t, getActiveUserDetails, processUserGroupsResponse]);

//     // Handle row selection - FIXED
//     const handleRowSelect = useCallback((row) => {
//         console.log("Row selected:", row);
//         // Store the selected ID before updating state
//         const selectedId = row.id;
        
//         // Update both states together
//         setSelectedGroup(row);
//         setSelectedRowId(selectedId);
        
//         // Log for debugging
//         console.log(`Selected row ID: ${selectedId}, Group: ${row.L01UserGroupName}`);
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
        
//         if (selectedGroup.L01UserGroupName === "Administrator") {
//             showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
//             return;
//         }
        
//         if (selectedGroup.gStatus === "Deactive") {
//             showInfoDialog(t('usermanagement.groupdeactivesocannotedit'), "warning");
//             return;
//         }
        
//         setFormData({
//             sGroupName: selectedGroup.L01UserGroupName,
//             sUserGroupID: selectedGroup.L01UserGroupID
//         });
//         setFormErrors({});
        
//         // Store the action and open edit popup
//         setAuditAction('edit');
//         setActivePopup(t('usermanagement.updateusergroup'));
//     }, [selectedGroup, showInfoDialog, t]);

//     const handleActiveDeactiveClick = useCallback(() => {
//     if (!selectedGroup) {
//         showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//         return;
//     }
    
//     if (selectedGroup.L01UserGroupName === "Administrator") {
//         showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
//         return;
//     }
    
//     const actionType = selectedGroup.gStatus === "Active" ? "deactivate" : "activate";
//     const message = actionType === "deactivate" 
//         ? t('usermanagement.confirmdeactivategroup', { groupName: selectedGroup.L01UserGroupName })
//         : t('usermanagement.confirmactivategroup', { groupName: selectedGroup.L01UserGroupName });
    
//     console.log(`Active/Deactive clicked. Current status: ${selectedGroup.gStatus}, Action: ${actionType}`);
//     console.log(`Selected group:`, selectedGroup);
    
//     // Set confirmation action first
//     setConfirmationAction(actionType);
    
//     // Then show confirmation dialog
//     showInfoDialog(message, "confirmation");
// }, [selectedGroup, showInfoDialog, t]);

//     const handleFormSubmit = useCallback(async (auditValues = null, submittedFormData = null) => {
//     console.log("Starting form submission with audit values:", auditValues);
    
//     const dataToValidate = submittedFormData || formData;
    
//     const validateFormData = (formDataToValidate) => {
//         const errors = {};
        
//         if (!formDataToValidate.sGroupName.trim()) {
//             errors.sGroupName = t('usermanagement.usergroupname') + " " + t('usermanagement.isrequired');
//         }
        
//         const existingGroup = userGroupData.find(group => 
//             group.L01UserGroupName.toLowerCase() === formDataToValidate.sGroupName.toLowerCase() &&
//             group.L01UserGroupID !== formDataToValidate.sUserGroupID
//         );
        
//         if (existingGroup) {
//             errors.sGroupName = t('usermanagement.groupnamealreadyexists');
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     };
    
//     if (!validateFormData(dataToValidate)) {
//         console.log("Form validation failed");
//         return;
//     }
    
//     setIsSubmitting(true);
    
//     // Declare isEdit in function scope
//     const isEdit = dataToValidate.sUserGroupID !== "";
    
//     try {
//         const activeUserDetails = getActiveUserDetails();
        
//         let endpoint, requestData;
        
//         if (isEdit) {
//             endpoint = "User/UserGroupUpdateBtnclick";
//             requestData = {
//                 grpSave: {
//                     sGroupname: dataToValidate.sGroupName,
//                     sUserGroupID: dataToValidate.sUserGroupID,
//                     sCreatedBy: activeUserDetails.sUserID,
//                     sUserStatus: "Active"
//                 },
//                 ApplicationCode: "SDMS",
//                 ActiveUserDetails: activeUserDetails
//             };
            
//             if (auditValues) {
//                 requestData.AuditTrailValues = auditValues;
//             }
//         } else {
//             endpoint = "User/UserGroupSaveBtnclick";
//             requestData = {
//                 grpSave: {
//                     sGroupname: dataToValidate.sGroupName,
//                     sCreatedBy: activeUserDetails.sUserID,
//                     sUserStatus: "Active"
//                 },
//                 ApplicationCode: "SDMS",
//                 ActiveUserDetails: activeUserDetails
//             };
//         }
        
//         console.log(`Sending ${isEdit ? 'update' : 'add'} request to ${endpoint}:`, requestData);
        
//         const response = await postData(endpoint, requestData);
        
//         if (!response) {
//             showInfoDialog(
//                 isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage'),
//                 "error"
//             );
//             return;
//         }
        
//         console.log(`${isEdit ? 'Update' : 'Add'} response:`, response);
        
//         if (response.Rtn === "Success") {
//             const message = isEdit 
//                 ? t('usermanagement.groupupdatesuccessfully')
//                 : t('usermanagement.groupaddedsuccessfully');
            
//             showInfoDialog(message, "success");
            
//             setActivePopup(null);
//             setShowAudit(false);
//             setFormData({
//                 sGroupName: "",
//                 sUserGroupID: ""
//             });
//             setFormErrors({});
            
//             // Refresh the list and preserve selection
//             await fetchUserGroups(true);
            
//         } else {
//             if (response.AuditTrailLogin === false) {
//                 showInfoDialog(response.LoginFailedMsg || 'Audit trail authentication failed', "error");
//             } else {
//                 showInfoDialog(
//                     response.returnMsg || 
//                     (isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage')),
//                     "error"
//                 );
//             }
//         }
        
//     } catch (error) {
//         console.error('Error saving user group:', error);
//         showInfoDialog(
//             isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage'),
//             "error"
//         );
//     } finally {
//         setIsSubmitting(false);
//     }
// }, [formData, t, userGroupData, postData, getActiveUserDetails, fetchUserGroups, showInfoDialog]);

//     const handleActiveDeactiveSubmit = useCallback(async (auditValues = null) => {
//     if (!selectedGroup) return;
    
//     setIsSubmitting(true);
    
//     try {
//         const newStatus = selectedGroup.gStatus === "Active" ? "Deactive" : "Active";
//         const activeUserDetails = getActiveUserDetails();
        
//         const requestData = {
//             ActDeactObj: {
//                 sGroupname: selectedGroup.L01UserGroupName,
//                 sUserStatus: newStatus,
//                 sUserGroupID: selectedGroup.L01UserGroupID
//             },
//             ApplicationCode: "SDMS",
//             ActiveUserDetails: activeUserDetails
//         };
        
//         if (auditValues) {
//             requestData.AuditTrailValues = auditValues;
//         }
        
//         console.log("Sending Active/Deactive request:", requestData);
        
//         const response = await postData("User/UserGroupActDeactBtnclick", requestData);
        
//         if (!response) {
//             showInfoDialog(t('usermanagement.actdeactfailed'), "error");
//             return;
//         }
        
//         console.log("Active/Deactive response:", response);
        
//         if (response.Rtn === "Success") {
//             const message = selectedGroup.gStatus === "Active" 
//                 ? t('usermanagement.groupdeactivatedsuccessfully')
//                 : t('usermanagement.groupactivatedsuccessfully');
            
//             showInfoDialog(message, "success");
            
//             setShowAudit(false);
            
//             // Refresh the list and preserve selection
//             await fetchUserGroups(true);
            
//         } else {
//             if (response.AuditTrailLogin === false) {
//                 showInfoDialog(response.LoginFailedMsg || 'Audit trail authentication failed', "error");
//             } else {
//                 showInfoDialog(response.returnMsg || t('usermanagement.actdeactfailed'), "error");
//             }
//         }
        
//     } catch (error) {
//         console.error('Error in active/deactive:', error);
//         showInfoDialog(t('usermanagement.actdeactfailed'), "error");
//     } finally {
//         setIsSubmitting(false);
//     }
// }, [selectedGroup, postData, showInfoDialog, t, getActiveUserDetails, fetchUserGroups]);

//     const handleSubmitClick = useCallback(() => {
//         console.log("Submit button clicked, current form data:", formData);
        
//         const validateFormData = (formDataToValidate) => {
//             const errors = {};
            
//             if (!formDataToValidate.sGroupName.trim()) {
//                 errors.sGroupName = t('usermanagement.usergroupname') + " " + t('usermanagement.isrequired');
//             }
            
//             const existingGroup = userGroupData.find(group => 
//                 group.L01UserGroupName.toLowerCase() === formDataToValidate.sGroupName.toLowerCase() &&
//                 group.L01UserGroupID !== formDataToValidate.sUserGroupID
//             );
            
//             if (existingGroup) {
//                 errors.sGroupName = t('usermanagement.groupnamealreadyexists');
//             }
            
//             setFormErrors(errors);
//             return Object.keys(errors).length === 0;
//         };
        
//         if (!validateFormData(formData)) {
//             console.log("Form validation failed");
//             return;
//         }
        
//         const isEdit = formData.sUserGroupID !== "";
        
//         if (isEdit) {
//             console.log("Opening audit trail for edit...");
//             setAuditAction('edit');
//             setShowAudit(true);
//         } else {
//             console.log("Submitting add directly...");
//             handleFormSubmit();
//         }
//     }, [formData, t, userGroupData, handleFormSubmit]);

//     const handleAuditAuthorized = useCallback((auditData) => {
//         console.log("Audit authorized with data:", auditData);
        
//         const auditValues = auditData.AuditTrailValues;
        
//         if (auditValues) {
//             console.log(`Proceeding with ${auditAction} after audit...`);
            
//             const currentFormData = { ...formData };
            
//             setShowAudit(false);
            
//             if (auditAction === 'edit') {
//                 handleFormSubmit(auditValues, currentFormData);
//             } else if (auditAction === 'activeDeactive') {
//                 handleActiveDeactiveSubmit(auditValues);
//             }
//         } else {
//             console.error("Audit data missing in AuditTrailValues");
//             showInfoDialog(t('masters.auditDataMissing'), "error");
//             setShowAudit(false);
//         }
//     }, [auditAction, formData, handleFormSubmit, handleActiveDeactiveSubmit, showInfoDialog, t]);

//     const handleFormChange = useCallback((field, value) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
        
//         if (formErrors[field]) {
//             setFormErrors(prev => ({
//                 ...prev,
//                 [field]: ""
//             }));
//         }
//     }, [formErrors]);

//     const handlePopupClose = useCallback(() => {
//         setActivePopup(null);
//         if (!isSubmitting) {
//             setFormData({
//                 sGroupName: "",
//                 sUserGroupID: ""
//             });
//             setFormErrors({});
//         }
//         setAuditTrailData({
//             username: "",
//             password: "",
//             reason: "",
//             comments: ""
//         });
//         setShowAudit(false);
//         setAuditAction(null);
//     }, [isSubmitting]);

//     // Remove the useEffect for confirmation dialog - handled in closeInfoDialog

//     useEffect(() => {
//         const sessionID = sessionStorage.getItem('sSessionID');
//         const userID = sessionStorage.getItem('sUserID');
        
//         if (!sessionID || !userID) {
//             showInfoDialog(t('usermanagement.sessionexpired') || 'Session expired. Please login again.', "error");
//             return;
//         }
        
//         fetchUserGroups();
//         isInitialMount.current = false;
//     }, [fetchUserGroups, showInfoDialog, t]);

//     // Keep selected group in sync with selected row ID
//     useEffect(() => {
//         if (selectedRowId && userGroupData.length > 0) {
//             const selected = userGroupData.find(group => group.id === selectedRowId);
//             if (selected) {
//                 setSelectedGroup(selected);
//             }
//         }
//     }, [selectedRowId, userGroupData]);

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
//     ], [t, handleRowSelect]);

//     const renderGroupDetail = useCallback((group) => (
//         <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.createdby')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gCreatedBy || 'N/A'}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.createdon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gCreatedOn || 'N/A'}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedby')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gModifiedBy || 'N/A'}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {group.gModifiedOn || 'N/A'}
//                 </div>
//             </div>
//         </div>
//     ), [t]);

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

//                 {/* Audit Trail Modal - Added z-index */}
//                 {showAudit && (
//                     <div className="fixed inset-0 z-[9999]">
//                         <AuditTrail 
//                             isOpen={showAudit}
//                             onClose={() => setShowAudit(false)}
//                             onAuthorized={handleAuditAuthorized}
//                             actionLabel={auditAction === 'edit' ? t('usermanagement.update') : t('usermanagement.activedeactive')}
//                             defaultReason="Activated"
//                             disableReason={false}
//                         />
//                     </div>
//                 )}

//                 <div className="flex justify-end pr-5 gap-2 pt-3">
//                     <ActionButton
//                         icon={UserPlus}
//                         label={t('usermanagement.addnewgroup')}
//                         onClick={handleAddClick}
//                         disabled={isSubmitting}
//                     />
//                     <ActionButton
//                         icon={Edit}
//                         label={t('usermanagement.edit')}
//                         onClick={handleEditClick}
//                         disabled={!selectedGroup || isSubmitting}
//                     />
//                     <ActionButton
//                         icon={UserX}
//                         label={t('usermanagement.activedeactive')}
//                         onClick={handleActiveDeactiveClick}
//                         disabled={!selectedGroup || isSubmitting}
//                     />
//                 </div>

//                 <div className="flex-1 overflow-auto p-3 font-['Roboto'] text-[#353f49]">
//                     {loading ? (
//                         <div className="text-center py-10 text-gray-500">
//                             {t("login.loadingpasswordpolicy")}
//                         </div>
//                     ) : (
//                         <GridLayout
//                             columns={columns}
//                             height="100%"
//                             detailPanelWidth="46%"
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

//                 {activePopup && (
//                     <div className="fixed inset-0 z-[9998]"> {/* Lower z-index than audit */}
//                         <CustomPopup
//                             isOpen={!!activePopup}
//                             onClose={handlePopupClose}
//                             title={activePopup}
//                             content={
//                                 <div className="flex flex-col gap-1 p-1">
//                                     <input
//                                         type="hidden"
//                                         value={formData.sUserGroupID}
//                                     />

//                                     <div className="flex flex-col">
//                                         <label className="text-[12px] font-roboto font-semibold text-[#405f7d]">
//                                             {t('usermanagement.groupname')} <span className="text-red-500">*</span>
//                                         </label>
//                                         <AnimatedInput
//                                             type="text"
//                                             value={formData.sGroupName}
//                                             onChange={(e) => handleFormChange('sGroupName', e.target.value)}
//                                             maxLength={50}
//                                             className={`w-full text-[12px] outline-none bg-white ${
//                                                 formErrors.sGroupName ? 'border-red-500' : 'border-gray-300'
//                                             }`}
//                                         />
//                                         {formErrors.sGroupName && (
//                                             <div className="text-red-500 text-[12px]">
//                                                 {formErrors.sGroupName}
//                                             </div>
//                                         )}
//                                     </div>

//                                     <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
//                                         <button
//                                             onClick={handleSubmitClick}
//                                             disabled={isSubmitting}
//                                             className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                                         >
//                                             <Edit className="w-4 h-4" /> 
//                                             {isSubmitting ? t('usermanagement.saving') : t('usermanagement.submit')}
//                                         </button>
//                                         <button
//                                             onClick={handlePopupClose}
//                                             disabled={isSubmitting}
//                                             className="px-2.5 py-2 text-[12px] font-roboto font-semibold text-[#8092a4] bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                                         >
//                                             {t('usermanagement.close')}
//                                         </button>
//                                     </div>
//                                 </div>
//                             }
//                             size="md"
//                         />
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default UserGroup;