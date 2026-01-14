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
//     const [formData, setFormData] = useState({
//         sGroupName: "",
//         sUserGroupID: ""
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const [confirmationAction, setConfirmationAction] = useState(null);
//     const [auditAction, setAuditAction] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [auditTrailRights, setAuditTrailRights] = useState({
//         edit: 0,
//         activeDeactive: 0
//     });

//     const { t } = useTranslation();
//     const { postData } = servicecall();

//     // Use refs to avoid stale state in callbacks
//     const userGroupDataRef = useRef(userGroupData);
//     const formDataRef = useRef(formData);
//     const auditTrailRightsRef = useRef(auditTrailRights);
//     const selectedGroupRef = useRef(selectedGroup);
//     const confirmationActionRef = useRef(confirmationAction);

//     // Update refs when state changes
//     useEffect(() => {
//         userGroupDataRef.current = userGroupData;
//     }, [userGroupData]);

//     useEffect(() => {
//         formDataRef.current = formData;
//     }, [formData]);

//     useEffect(() => {
//         auditTrailRightsRef.current = auditTrailRights;
//     }, [auditTrailRights]);

//     useEffect(() => {
//         selectedGroupRef.current = selectedGroup;
//     }, [selectedGroup]);

//     useEffect(() => {
//         confirmationActionRef.current = confirmationAction;
//     }, [confirmationAction]);

//     // Enhanced decryption function
//     const getDecryptedValue = useCallback((key) => {
//         try {
//             const encryptedValue = sessionStorage.getItem(key);
//             if (!encryptedValue) {
//                 return "";
//             }
            
//             if (typeof encryptedValue !== 'string' || encryptedValue.trim() === '') {
//                 return "";
//             }
            
//             try {
//                 const decrypted = CF_decrypt(encryptedValue);
//                 return decrypted || "";
//             } catch (decryptError) {
//                 return encryptedValue;
//             }
//         } catch (error) {
//             return "";
//         }
//     }, []);

//     // Memoize getActiveUserDetails - CORRECTED BASED ON LEGACY CODE
//     const getActiveUserDetails = useMemo(() => {
//         return () => {
//             const sUsername = getDecryptedValue("sUsername") || "Administrator";
//             const sSiteCode = getDecryptedValue("sSiteCode") || "CH";
//             const sUserGroupID = getDecryptedValue("sUserGroupID") || "G1";
//             const sUserID = getDecryptedValue("sUserID") || "U1";
//             const sSessionID = getDecryptedValue("sSessionID") || "";
//             const sDomainName = getDecryptedValue("sDomainName") || "SDMS";
//             const sTimeZoneID = getDecryptedValue("sTimeZoneID") || "Asia/Shanghai";
//             const sdbtype = getDecryptedValue("sdbtype") || "MSSQL";
//             const sCategories = getDecryptedValue("sCategories") || "DB";
//             const sUserStatus = getDecryptedValue("sUserStatus") || "";
            
//             // From legacy code: sTenantID is in ActiveUserDetails
//             let sTenantID = getDecryptedValue("sTenantID") || "";

//             // IMPORTANT: Legacy code formats these to 10 characters
//             const formattedSiteCode = (sSiteCode || "CH").padEnd(10, ' ').substring(0, 10);
//             const formattedUserGroupID = (sUserGroupID || "G1").padEnd(10, ' ').substring(0, 10);
            
//             // Legacy timezone format
//             let timeZoneID;
//             if (sTimeZoneID && sTimeZoneID.trim() !== "") {
//                 if (!sTimeZoneID.includes("<~>")) {
//                     timeZoneID = sTimeZoneID + "<~>true";
//                 } else {
//                     timeZoneID = sTimeZoneID;
//                 }
//             } else {
//                 timeZoneID = "Asia/Shanghai<~>true";
//             }

//             return {
//                 sUsername: sUsername,
//                 sCategories: sCategories,
//                 sSiteCode: formattedSiteCode,
//                 sUserID: sUserID,
//                 sUserDomainName: sDomainName,
//                 sUserGroupID: formattedUserGroupID,
//                 sTimeZoneID: timeZoneID,
//                 sSessionID: sSessionID,
//                 sUserStatus: sUserStatus, // Note: Legacy has value, not empty
//                 sApplicationName: "SDMS",
//                 sdbtype: sdbtype,
//                 sTenantID: sTenantID
//             };
//         };
//     }, [getDecryptedValue]);

//     // Get active user details wrapper for API calls - MATCHING LEGACY CODE STRUCTURE
//     const getApiRequestData = useCallback((additionalData = {}) => {
//         const activeUserDetails = getActiveUserDetails();
        
//         // Create base request matching legacy structure
//         const requestData = {
//             ApplicationCode: "SDMS",
//             ActiveUserDetails: activeUserDetails,
//             ...additionalData
//         };
        
//         // Add TenantID to URL if exists (as in legacy code)
//         if (activeUserDetails.sTenantID && activeUserDetails.sTenantID.trim() !== "") {
//             // Note: In legacy, TenantID is added to URL, not in body
//             // We'll handle this differently in the servicecall
//         }
        
//         return requestData;
//     }, [getActiveUserDetails]);

//     // Validate form function
//     const validateForm = useCallback(() => {
//         const errors = {};
//         const currentFormData = formDataRef.current;
//         const currentUserGroupData = userGroupDataRef.current;
        
//         if (!currentFormData.sGroupName.trim()) {
//             errors.sGroupName = t('usermanagement.usergroupname') + " " + t('usermanagement.isrequired');
//         }
        
//         const existingGroup = currentUserGroupData.find(group => 
//             group.L01UserGroupName.toLowerCase() === currentFormData.sGroupName.toLowerCase() &&
//             group.L01UserGroupID !== currentFormData.sUserGroupID
//         );
        
//         if (existingGroup) {
//             errors.sGroupName = t('usermanagement.groupnamealreadyexists');
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     }, [t]);

//     // Show info dialog
//     const showInfoDialog = useCallback((message, type = "information") => {
//         setInfoDialog({
//             open: true,
//             message,
//             type
//         });
//     }, []);

//     // Process user groups response - FIXED BASED ON LEGACY
//     const processUserGroupsResponse = useCallback((response) => {
//         console.log('Processing response:', response);
        
//         let groupsData = [];
        
//         // Match legacy response structure
//         if (response && response.oResObj && Array.isArray(response.oResObj)) {
//             groupsData = response.oResObj;
//         } else if (response && response.returnservice && response.returnservice.oResObj) {
//             groupsData = response.returnservice.oResObj;
//         } else if (Array.isArray(response)) {
//             groupsData = response;
//         }
        
//         if (groupsData.length === 0) {
//             setUserGroupData([]);
//             return;
//         }
        
//         // Format data exactly like legacy
//         const formattedData = groupsData.map((group, index) => ({
//             id: index + 1,
//             L01UserGroupID: group.L01UserGroupID || '',
//             L01UserGroupName: group.L01UserGroupName || '',
//             gStatus: group.gStatus || 'Active',
//             gCreatedBy: group.gCreatedBy || 'System',
//             gCreatedOn: group.gCreatedOn || '',
//             gUTCCreatedOn: group.gUTCCreatedOn || '',
//             gModifiedBy: group.gModifiedBy || null,
//             gModifiedOn: group.gModifiedOn || null,
//             gUTCModifiedOn: group.gUTCModifiedOn || null
//         }));
        
//         console.log('Formatted groups:', formattedData);
//         setUserGroupData(formattedData);
        
//         // Update selected group
//         if (selectedRowId && formattedData.length > 0) {
//             const selected = formattedData.find(group => 
//                 group.L01UserGroupID === selectedGroupRef.current?.L01UserGroupID
//             );
//             if (selected) {
//                 setSelectedGroup(selected);
//                 setSelectedRowId(selected.id);
//             } else if (formattedData.length > 0) {
//                 setSelectedGroup(formattedData[0]);
//                 setSelectedRowId(formattedData[0].id);
//             }
//         } else if (formattedData.length > 0 && !selectedRowId) {
//             setSelectedGroup(formattedData[0]);
//             setSelectedRowId(formattedData[0].id);
//         }
//     }, [selectedRowId]);

//     // Fetch user groups
//     const fetchUserGroups = useCallback(async () => {
//         setLoading(true);
//         try {
//             const requestData = getApiRequestData();
            
//             console.log('Fetching user groups with:', requestData);
//             const response = await postData("User/UserGroupAndMasterGrid", requestData);
            
//             if (!response) {
//                 showInfoDialog("Server returned null response", "error");
//                 return;
//             }
            
//             // Check for error response
//             if (response.Rtn && response.Rtn !== "Success") {
//                 showInfoDialog(response.returnMsg || "Failed to fetch user groups", "error");
//                 return;
//             }
            
//             processUserGroupsResponse(response);
            
//         } catch (error) {
//             console.error('Error fetching user groups:', error);
//             if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
//                 showInfoDialog("Cannot connect to server. Please check if the service is running.", "error");
//             } else {
//                 showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups', "error");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [postData, t, getApiRequestData, processUserGroupsResponse, showInfoDialog]);

//     // Handle active/deactive confirm - FIXED BASED ON LEGACY CODE
//     const handleActiveDeactiveConfirm = useCallback(async (auditTrailValues = null) => {
//         const currentSelectedGroup = selectedGroupRef.current;
        
//         if (!currentSelectedGroup) {
//             setConfirmationAction(null);
//             return;
//         }
        
//         try {
//             setIsSubmitting(true);
            
//             // From legacy: current status is passed, backend flips it
//             const currentStatus = currentSelectedGroup.gStatus;
            
//             // Create ActDeactObj exactly like legacy
//             const ActDeactObj = {
//                 sGroupname: currentSelectedGroup.L01UserGroupName,
//                 sUserStatus: currentStatus, // Current status, not new status
//                 sUserGroupID: currentSelectedGroup.L01UserGroupID
//             };
            
//             console.log('ActDeactObj:', ActDeactObj);
            
//             // Build request data
//             let requestData = getApiRequestData({
//                 ActDeactObj: ActDeactObj
//             });

//             // Add audit trail values if provided
//             if (auditTrailValues) {
//                 requestData.AuditTrailValues = auditTrailValues;
//             }
            
//             console.log('Sending Active/Deactive request:', JSON.stringify(requestData, null, 2));
            
//             const response = await postData("User/UserGroupActDeactBtnclick", requestData);
            
//             if (!response) {
//                 showInfoDialog(t('usermanagement.actdeactfailed'), "error");
//                 setConfirmationAction(null);
//                 return;
//             }
            
//             console.log('API Response:', response);
            
//             // Check for audit trail login failure first
//             if (response.AuditTrailLogin === false) {
//                 showInfoDialog(response.LoginFailedMsg || "Audit trail authentication failed", "error");
//                 setConfirmationAction(null);
//                 return;
//             }
            
//             if (response.Rtn === "Success") {
//                 // Success - refresh grid with returned data
//                 const message = currentStatus === "Active" 
//                     ? t('usermanagement.groupdeactivatedsuccessfully')
//                     : t('usermanagement.groupactivatedsuccessfully');
                
//                 showInfoDialog(message, "success");
                
//                 // IMPORTANT: Legacy code uses returnservice.oResObj to update grid
//                 if (response.returnservice && response.returnservice.oResObj) {
//                     console.log('Updating grid with returnservice.oResObj');
//                     processUserGroupsResponse(response.returnservice);
//                 } else if (response.oResObj) {
//                     console.log('Updating grid with oResObj');
//                     processUserGroupsResponse(response);
//                 } else {
//                     console.log('No data in response, fetching fresh data');
//                     await fetchUserGroups();
//                 }
//             } else {
//                 // Error from API
//                 showInfoDialog(response.returnMsg || t('usermanagement.actdeactfailed'), "error");
//             }
            
//             setConfirmationAction(null);
            
//         } catch (error) {
//             console.error('Error in active/deactive:', error);
//             showInfoDialog(t('usermanagement.actdeactfailed'), "error");
//             setConfirmationAction(null);
//         } finally {
//             setIsSubmitting(false);
//         }
//     }, [postData, showInfoDialog, t, getApiRequestData, fetchUserGroups, processUserGroupsResponse]);

//     const handleEditConfirm = useCallback(async (auditTrailValues = null) => {
//         if (!validateForm()) {
//             return;
//         }
        
//         try {
//             setIsSubmitting(true);
            
//             const currentFormData = formDataRef.current;
            
//             // Create grpSave object exactly like legacy
//             const grpSave = {
//                 sGroupname: currentFormData.sGroupName,
//                 sUserGroupID: currentFormData.sUserGroupID,
//                 sCreatedBy: getDecryptedValue("sUserID") || "U1",
//                 sUserStatus: getDecryptedValue("sUserStatus") || ""
//             };
            
//             console.log('grpSave:', grpSave);
            
//             // Build request data
//             let requestData = getApiRequestData({
//                 grpSave: grpSave
//             });

//             if (auditTrailValues) {
//                 requestData.AuditTrailValues = auditTrailValues;
//             }
            
//             const response = await postData("User/UserGroupUpdateBtnclick", requestData);
            
//             if (!response) {
//                 showInfoDialog(t('usermanagement.updatefailed'), "error");
//                 return;
//             }
            
//             // Check for audit trail login failure
//             if (response.AuditTrailLogin === false) {
//                 showInfoDialog(response.LoginFailedMsg || "Audit trail authentication failed", "error");
//                 return;
//             }
            
//             if (response.Rtn === "Success") {
//                 showInfoDialog(t('usermanagement.groupupdatesuccessfully'), "success");
                
//                 // Update grid with returned data
//                 if (response.returnservice && response.returnservice.oResObj) {
//                     processUserGroupsResponse(response.returnservice);
//                 } else {
//                     await fetchUserGroups();
//                 }
                
//                 setActivePopup(null);
//             } else {
//                 // Check for specific error message like legacy does
//                 if (response.Message && response.Message.sGroupName) {
//                     showInfoDialog(response.Message.sGroupName, "error");
//                 } else {
//                     showInfoDialog(response.returnMsg || t('usermanagement.updatefailed'), "error");
//                 }
//             }
            
//         } catch (error) {
//             console.error('Error updating user group:', error);
//             showInfoDialog(t('usermanagement.updatefailed'), "error");
//         } finally {
//             setIsSubmitting(false);
//         }
//     }, [validateForm, showInfoDialog, t, postData, getApiRequestData, getDecryptedValue, fetchUserGroups, processUserGroupsResponse]);

//     // Close info dialog
//     const closeInfoDialog = useCallback(() => {
//         if (infoDialog.type === "confirmation" && confirmationAction) {
//             const action = confirmationAction;
//             const needsAudit = auditTrailRights.activeDeactive === 1;
            
//             setInfoDialog(prev => ({ ...prev, open: false }));
//             setConfirmationAction(null);
            
//             setTimeout(() => {
//                 if (action === 'deactivate' || action === 'activate') {
//                     if (needsAudit) {
//                         setAuditAction('activeDeactive');
//                         setShowAudit(true);
//                     } else {
//                         handleActiveDeactiveConfirm();
//                     }
//                 }
//             }, 100);
//         } else {
//             setInfoDialog(prev => ({ ...prev, open: false }));
//             setConfirmationAction(null);
//         }
//     }, [infoDialog, confirmationAction, auditTrailRights, handleActiveDeactiveConfirm]);

//     // Handle audit authorized
//     const handleAuditAuthorized = useCallback((auditData) => {
//         const auditTrailValues = auditData.AuditTrailValues;
        
//         if (!auditTrailValues) {
//             showInfoDialog("Audit trail data is missing", "error");
//             setShowAudit(false);
//             setConfirmationAction(null);
//             return;
//         }
        
//         setShowAudit(false);
        
//         if (auditAction === 'edit') {
//             handleEditConfirm(auditTrailValues);
//         } else if (auditAction === 'activeDeactive') {
//             handleActiveDeactiveConfirm(auditTrailValues);
//         }
        
//         setAuditAction(null);
//         setConfirmationAction(null);
//     }, [auditAction, handleEditConfirm, handleActiveDeactiveConfirm, showInfoDialog]);

//     // Handle audit close
//     const handleAuditClose = useCallback(() => {
//         setShowAudit(false);
//         setAuditAction(null);
//         setConfirmationAction(null);
//     }, []);

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
        
//         const actionType = selectedGroup.gStatus === "Active" ? "deactivate" : "activate";
//         const message = actionType === "deactivate" 
//             ? t('usermanagement.confirmactivedeactivategroup', { groupName: selectedGroup.L01UserGroupName })
//             : t('usermanagement.confirmactivedeactivategroup', { groupName: selectedGroup.L01UserGroupName });
        
//         setConfirmationAction(actionType);
//         setTimeout(() => {
//             showInfoDialog(message, "confirmation");
//         }, 10);
//     }, [selectedGroup, showInfoDialog, t]);

//     const handleSubmit = useCallback(async () => {
//         if (!validateForm()) {
//             return;
//         }
        
//         const isEdit = formData.sUserGroupID !== "";
        
//         if (isEdit && auditTrailRights.edit === 1) {
//             setActivePopup(null);
            
//             setTimeout(() => {
//                 setAuditAction('edit');
//                 setShowAudit(true);
//             }, 100);
            
//             return;
//         }
        
//         try {
//             setIsSubmitting(true);
            
//             if (isEdit) {
//                 // For edit without audit trail
//                 const grpSave = {
//                     sGroupname: formData.sGroupName,
//                     sUserGroupID: formData.sUserGroupID,
//                     sCreatedBy: getDecryptedValue("sUserID") || "U1",
//                     sUserStatus: getDecryptedValue("sUserStatus") || ""
//                 };
                
//                 const requestData = getApiRequestData({
//                     grpSave: grpSave
//                 });
                
//                 const response = await postData("User/UserGroupUpdateBtnclick", requestData);
                
//                 if (!response) {
//                     showInfoDialog(t('usermanagement.updatefailed'), "error");
//                     return;
//                 }
                
//                 if (response.Rtn === "Success") {
//                     showInfoDialog(t('usermanagement.groupupdatesuccessfully'), "success");
//                     await fetchUserGroups();
//                     setActivePopup(null);
//                 } else {
//                     showInfoDialog(response.returnMsg || t('usermanagement.updatefailed'), "error");
//                 }
//             } else {
//                 // For add new group
//                 const grpSave = {
//                     sGroupname: formData.sGroupName,
//                     sCreatedBy: getDecryptedValue("sUserID") || "U1",
//                     sUserStatus: getDecryptedValue("sUserStatus") || ""
//                 };
                
//                 const requestData = getApiRequestData({
//                     grpSave: grpSave
//                 });
                
//                 const response = await postData("User/UserGroupSaveBtnclick", requestData);
                
//                 if (!response) {
//                     showInfoDialog(t('usermanagement.importuserfailedmessage'), "error");
//                     return;
//                 }
                
//                 if (response.Rtn === "Success") {
//                     showInfoDialog(t('usermanagement.groupaddedsuccessfully'), "success");
//                     await fetchUserGroups();
//                     setActivePopup(null);
//                 } else {
//                     showInfoDialog(response.returnMsg || t('usermanagement.importuserfailedmessage'), "error");
//                 }
//             }
            
//         } catch (error) {
//             console.error('Error saving user group:', error);
//             showInfoDialog(
//                 isEdit ? t('usermanagement.updatefailed') : t('usermanagement.importuserfailedmessage'),
//                 "error"
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     }, [formData, validateForm, showInfoDialog, t, postData, getApiRequestData, getDecryptedValue, fetchUserGroups, auditTrailRights]);

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
//         setFormErrors({});
//     }, []);

//     // Load audit trail rights
//     useEffect(() => {
//         const loadAuditTrailRights = () => {
//             try {
//                 const auditRightsData = sessionStorage.getItem('auditTrailRights');
                
//                 if (auditRightsData) {
//                     try {
//                         const rights = JSON.parse(auditRightsData);
                        
//                         const userGroupRights = rights.filter(item => 
//                             item.sScreenName && item.sScreenName.includes("User Group")
//                         );
                        
//                         const editRight = userGroupRights.find(item => 
//                             item.sTaskName && item.sTaskName.includes("Edit")
//                         );
//                         const activeDeactiveRight = userGroupRights.find(item => 
//                             item.sTaskName && item.sTaskName.includes("Active/Deactive")
//                         );
                        
//                         setAuditTrailRights({
//                             edit: editRight ? (editRight.nManualAuditTrail || 0) : 0,
//                             activeDeactive: activeDeactiveRight ? (activeDeactiveRight.nManualAuditTrail || 0) : 0
//                         });
//                     } catch (parseError) {
//                         setAuditTrailRights({
//                             edit: 1,
//                             activeDeactive: 1
//                         });
//                     }
//                 } else {
//                     setAuditTrailRights({
//                         edit: 1,
//                         activeDeactive: 1
//                     });
//                 }
//             } catch (error) {
//                 setAuditTrailRights({
//                     edit: 1,
//                     activeDeactive: 1
//                 });
//             }
//         };
        
//         const timer = setTimeout(() => {
//             loadAuditTrailRights();
//         }, 1000);
        
//         return () => clearTimeout(timer);
//     }, []);

//     // Initial data fetch
//     useEffect(() => {
//         const fetchData = async () => {
//             const sessionID = getDecryptedValue('sSessionID');
//             const userID = getDecryptedValue('sUserID');
            
//             if (!sessionID || !userID) {
//                 showInfoDialog(t('usermanagement.sessionexpired') || 'Session expired. Please login again.', "error");
//                 return;
//             }
            
//             await fetchUserGroups();
//         };
        
//         fetchData();
//     }, []);

//     // Update selected group when selectedRowId or userGroupData changes
//     useEffect(() => {
//         if (selectedRowId && userGroupData.length > 0) {
//             const selected = userGroupData.find(group => group.id === selectedRowId);
//             if (selected) {
//                 setSelectedGroup(selected);
//             }
//         }
//     }, [selectedRowId, userGroupData]);

    // const columns = useMemo(() => [
    //     {
    //         key: 'L01UserGroupName',
    //         label: (
    //             <div> 
    //                 <span className="text-[12px] font-roboto text-[#353f49] font-bold">
    //                     {t('usermanagement.usergroupname') || 'User Full Name'}
    //                 </span>
    //             </div>
    //         ),
    //         width: 200,
    //         enableSearch: true,
    //         render: (row, isSelected) => (
    //             <div 
    //                 className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
    //                 onClick={() => handleRowSelect(row)}
    //             >
    //                 {row.L01UserGroupName}
    //             </div>
    //         )
    //     },
    //     {
    //         key: 'gStatus',
    //         label: (
    //             <div> 
    //                 <span className="text-[12px] font-roboto text-[#353f49] font-bold">
    //                     {t('usermanagement.userstatus') || 'User Full Name'}
    //                 </span>
    //             </div>
    //         ),
    //         width: 150,
    //         enableSearch: true,
    //         render: (row, isSelected) => (
    //             <div 
    //                 className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${row.gStatus === 'Active' ? 'text-[#008000]' : 'text-red-500'} ${isSelected ? 'font-bold' : ''}`}
    //                 onClick={() => handleRowSelect(row)}
    //             >
    //                 {row.gStatus}
    //             </div>
    //         )
    //     }
    // ], [t, handleRowSelect]);

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

//                 {/* Audit Trail Modal */}
//                 {showAudit && (
//                     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
//                         <AuditTrail 
//                             isOpen={showAudit}
//                             onClose={handleAuditClose}
//                             onAuthorized={handleAuditAuthorized}
//                             actionLabel={auditAction === 'edit' ? 'Edit User Group' : 'Active/Deactive User Group'}
//                             defaultReason={auditAction === 'edit' ? "Modified" : "Activated"}
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
//                                         disabled={isSubmitting}
//                                         className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         <Edit className="w-4 h-4" /> 
//                                         {isSubmitting ? t('usermanagement.saving') : t('usermanagement.submit')}
//                                     </button>
//                                     <button
//                                         onClick={handlePopupClose}
//                                         disabled={isSubmitting}
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








// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { UserPlus, Edit, UserX } from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useTranslation } from "react-i18next";

// // Components
// import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
// import PopupModal from "../../FTPDataView/DataExplorer/PopupModal";
// import AnimatedInput from "../../../../Layout/Common/AnimatedInput";
// import AuditTrail from "../../../../Layout/Common/AuditTrail";
// import Errordialog from "../../../../Layout/Common/Errordialog";

// // Services
// import servicecall from "../../../../../Services/servicecall";
// import CF_activeUserdetails from "../../../../../Services/activeUserdetails";

// /* ------------------ HELPER COMPONENTS ------------------ */

// const DetailRow = ({ label, value }) => (
//   <div className="grid grid-cols-2 gap-4">
//     <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
//       {label}
//     </div>
//     <div className="font-bold text-[12px] text-[#353f49] font-roboto">
//       {value || "-"}
//     </div>
//   </div>
// );

// const ActionButton = ({ icon: Icon, label, disabled, onClick, variant = "default" }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     className={`
//       flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none 
//       transition-all duration-200 whitespace-nowrap
//       hover:scale-[0.98] hover:opacity-90
//       ${disabled 
//         ? variant === 'primary'
//         ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
//         : 'bg-[#f0f2f5dc] text-[#2885fecc] font-bold cursor-not-allowed'
//         : variant === 'primary'
//           ? 'bg-[#2883FE] text-white hover:bg-[#1c6fd8]'
//           : variant === 'danger'
//             ? 'bg-red-500 text-white hover:bg-red-600'
//             : 'bg-[#f0f2f5] text-[#2883fe] font-bold '
//       }
//     `}
//   >
//     {Icon && <Icon className="w-4 h-4 font-bold" />}
//     <span>{label}</span>
//   </button>
// );

// /* ------------------ DATA FETCHING ------------------ */

// const fetchUserGroupsAPI = async ({ postData }) => {
//   const userDetailsData = CF_activeUserdetails();
//   const reqObj = { sActionType: "View", ...userDetailsData };
//   const response = await postData("User/UserGroupAndMasterGrid", reqObj);
  
//   if (!response) {
//     throw new Error("Server returned null response");
//   }
  
//   if (response.Rtn && response.Rtn !== "Success") {
//     throw new Error(response.returnMsg || "Failed to fetch user groups");
//   }
  
//   // Process response - Match your User Group API structure
//   let groupsData = [];
  
//   if (response && response.oResObj && Array.isArray(response.oResObj)) {
//     groupsData = response.oResObj;
//   } else if (response && response.returnservice && response.returnservice.oResObj) {
//     groupsData = response.returnservice.oResObj;
//   } else if (Array.isArray(response)) {
//     groupsData = response;
//   }
  
//   // Format data for grid - Match your User Group data structure
//   const formattedData = groupsData.map((group, index) => ({
//     _gridId: group.L01UserGroupID || `group-${index}`,
//     L01UserGroupID: group.L01UserGroupID || '',
//     L01UserGroupName: group.L01UserGroupName || '',
//     gStatus: group.gStatus || 'Active',
//     gCreatedBy: group.gCreatedBy || 'System',
//     gCreatedOn: group.gCreatedOn || '',
//     gUTCCreatedOn: group.gUTCCreatedOn || '',
//     gModifiedBy: group.gModifiedBy || null,
//     gModifiedOn: group.gModifiedOn || null,
//     gUTCModifiedOn: group.gUTCModifiedOn || null
//   }));
  
//   return { formattedData, rawResponse: response };
// };

// const saveUserGroupAPI = async ({ postData, formData, actionType, auditTrailValues = null }) => {
//   const userDetailsData = CF_activeUserdetails();
//   let reqObj = { sActionType: actionType, ...userDetailsData };
//   let endpoint = "";
  
//   // Add action-specific data based on your User Group API structure
//   if (actionType === "Insert") {
//     endpoint = "User/UserGroupSaveBtnclick";
//     reqObj.grpSave = {
//       sGroupname: formData.sGroupName,
//       sCreatedBy: userDetailsData.sUserID || "U1",
//       sUserStatus: userDetailsData.sUserStatus || ""
//     };
//   } else if (actionType === "Update") {
//     endpoint = "User/UserGroupUpdateBtnclick";
//     reqObj.grpSave = {
//       sGroupname: formData.sGroupName,
//       sUserGroupID: formData.sUserGroupID,
//       sCreatedBy: userDetailsData.sUserID || "U1",
//       sUserStatus: userDetailsData.sUserStatus || ""
//     };
//   } else if (actionType === "ActDeact") {
//     endpoint = "User/UserGroupActDeactBtnclick";
//     reqObj.ActDeactObj = {
//       sGroupname: formData.sGroupName,
//       sUserStatus: formData.gStatus,
//       sUserGroupID: formData.sUserGroupID
//     };
//   }
  
//   // Add audit trail values if provided
//   if (auditTrailValues) {
//     reqObj.AuditTrailValues = auditTrailValues;
//   }
  
//   const response = await postData(endpoint, reqObj);
  
//   if (!response) {
//     throw new Error("Server returned null response");
//   }
  
//   return response;
// };

// /* ------------------ MAIN COMPONENT ------------------ */

// export default function UserGroup() {
//   const { postData } = servicecall(); 
//   const queryClient = useQueryClient();
//   const { t } = useTranslation(); 

//   const [selectedRowId, setSelectedRowId] = useState(null);
//   const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "add", groupId: null });
//   const [infoDialog, setInfoDialog] = useState({ open: false, message: "", type: "information" });
//   const [showAudit, setShowAudit] = useState(false);
//   const [pendingAction, setPendingAction] = useState(null); // Stores the pending form data for audit trail
//   const [confirmationAction, setConfirmationAction] = useState(null);
//   const [auditTrailRights, setAuditTrailRights] = useState({ edit: 0, activeDeactive: 0 });
  
//   // Store form data when edit is submitted (for audit trail)
//   const [pendingEditData, setPendingEditData] = useState(null);

//   /* ------------------ QUERIES ------------------ */

//   // 1. Fetch Grid Data
//   const { data: gridResult, isLoading, isError, error } = useQuery({
//     queryKey: ["userGroups"],
//     queryFn: () => fetchUserGroupsAPI({ postData }),
//     staleTime: 5 * 60 * 1000,
//     retry: 1,
//   });

//   const rows = gridResult?.formattedData || [];

//   // 2. Define Columns
//   const columns = useMemo(() => [
//     { 
//       key: "L01UserGroupName",  
//       label: t('usermanagement.usergroupname'), 
//       width: 200,
//       enableSearch: true,
//       sortable: true,
//       render: (row, isSelected) => (
//         <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'} text-[12px] font-['Verdana']`}>
//           {row.L01UserGroupName}
//         </span>
//       ) 
//     },
//     { 
//       key: "gStatus", 
//       label: t('usermanagement.userstatus'), 
//       width: 150,
//       enableSearch: true,
//       sortable: true,
//       render: (row) => {
//         const isActive = (row.gStatus || "").toLowerCase() === 'active';
//         return (
//           <span className={`font-bold text-[12px] font-['Verdana'] ${isActive ? 'text-green-600' : 'text-red-500'}`}>
//             {row.gStatus}
//           </span>
//         );
//       }
//     }
//   ], [t]);

//   // 3. Auto-Select First Row
//   useEffect(() => {
//     if (rows.length > 0 && selectedRowId === null) {
//       setSelectedRowId(rows[0]._gridId);
//     }
//   }, [rows, selectedRowId]);

//   const selectedRow = useMemo(
//     () => rows.find((r) => r._gridId === selectedRowId),
//     [rows, selectedRowId]
//   );

//   /* ------------------ MUTATIONS ------------------ */

//   const saveMutation = useMutation({
//     mutationFn: ({ formData, type, auditTrailValues = null }) => 
//       saveUserGroupAPI({ 
//         postData, 
//         formData, 
//         actionType: type === 'add' ? 'Insert' : 'Update',
//         auditTrailValues
//       }),
//     onSuccess: (res, variables) => {
//       const { type } = variables;
      
//       // Check for audit trail login failure
//       if (res.AuditTrailLogin === false) {
//         showInfoDialog(res.LoginFailedMsg || "Audit trail authentication failed", "error");
//         return;
//       }
      
//       if(res.Rtn === "Success") {
//         showInfoDialog(
//           type === 'add' ? t('usermanagement.groupaddedsuccessfully') : t('usermanagement.groupupdatesuccessfully'), 
//           "success"
//         );
//         queryClient.invalidateQueries(['userGroups']);
//         handleCloseModal();
//       } else {
//         // Check for specific error message
//         if (res.Message && res.Message.sGroupName) {
//           showInfoDialog(res.Message.sGroupName, "error");
//         } else {
//           showInfoDialog(res.returnMsg || t('usermanagement.updatefailed'), "error");
//         }
//       }
//     },
//     onError: (err) => showInfoDialog(err.message, "error")
//   });

//   const actDeactMutation = useMutation({
//     mutationFn: ({ formData, auditTrailValues = null }) => 
//       saveUserGroupAPI({ 
//         postData, 
//         formData, 
//         actionType: 'ActDeact',
//         auditTrailValues
//       }),
//     onSuccess: (res, variables) => {
//       const { formData } = variables;
      
//       // Check for audit trail login failure
//       if (res.AuditTrailLogin === false) {
//         showInfoDialog(res.LoginFailedMsg || "Audit trail authentication failed", "error");
//         setConfirmationAction(null);
//         return;
//       }
      
//       if(res.Rtn === "Success") {
//         const message = formData.gStatus === "Active" 
//           ? t('usermanagement.groupdeactivatedsuccessfully')
//           : t('usermanagement.groupactivatedsuccessfully');
//         showInfoDialog(message, "success");
//         queryClient.invalidateQueries(['userGroups']);
//         setConfirmationAction(null);
//       } else {
//         showInfoDialog(res.returnMsg || t('usermanagement.actdeactfailed'), "error");
//       }
//     },
//     onError: (err) => showInfoDialog(err.message, "error")
//   });

//   /* ------------------ RENDER DETAIL PANEL ------------------ */
  
//   const renderDetailPanel = useCallback(() => {
//     if (!selectedRow) return <div className="p-4 text-gray-500 font-roboto text-sm">Select a row to view details</div>;

//     return (
//       <div className="space-y-3">
//         <DetailRow label={t('usermanagement.createdby')} value={selectedRow.gCreatedBy} />
//         <DetailRow label={t('usermanagement.createdon')} value={selectedRow.gCreatedOn} />
//         <DetailRow label={t('usermanagement.modifiedby')} value={selectedRow.gModifiedBy} />
//         <DetailRow label={t('usermanagement.modifiedon')} value={selectedRow.gModifiedOn} />
//       </div>
//     );
//   }, [selectedRow, t]);

//   /* ------------------ MODAL FORM COMPONENT ------------------ */

//   const UserGroupForm = ({ editGroupId, isEditMode, onSubmit, onClose, onAuditRequired }) => {
//     const [formData, setFormData] = useState({
//       sGroupName: "",
//       sUserGroupID: ""
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // Load data for edit mode
//     useEffect(() => {
//       if (isEditMode && editGroupId) {
//         const groupToEdit = rows.find(r => 
//           r.L01UserGroupID === editGroupId || r._gridId === editGroupId
//         );
//         if (groupToEdit) {
//           setFormData({
//             sGroupName: groupToEdit.L01UserGroupName,
//             sUserGroupID: groupToEdit.L01UserGroupID
//           });
//         }
//       } else {
//         setFormData({ sGroupName: "", sUserGroupID: "" });
//       }
//     }, [isEditMode, editGroupId, rows]);

//     const validateForm = () => {
//       const errors = {};
      
//       if (!formData.sGroupName.trim()) {
//         errors.sGroupName = t('usermanagement.usergroupname') + " " + t('usermanagement.isrequired');
//       }
      
//       const existingGroup = rows.find(group => 
//         group.L01UserGroupName.toLowerCase() === formData.sGroupName.toLowerCase() &&
//         group.L01UserGroupID !== formData.sUserGroupID
//       );
      
//       if (existingGroup) {
//         errors.sGroupName = t('usermanagement.groupnamealreadyexists');
//       }
      
//       setFormErrors(errors);
//       return Object.keys(errors).length === 0;
//     };

//     const handleSubmit = () => {
//       if (!validateForm()) return;
      
//       setIsSubmitting(true);
      
//       // If edit mode and audit trail is required, trigger audit trail
//       if (isEditMode && auditTrailRights.edit === 1) {
//         onAuditRequired(formData);
//       } else {
//         // For add or edit without audit trail, submit directly
//         onSubmit(formData);
//       }
//     };

//     const handleChange = (field, value) => {
//       setFormData(prev => ({ ...prev, [field]: value }));
//       if (formErrors[field]) {
//         setFormErrors(prev => ({ ...prev, [field]: "" }));
//       }
//     };

//     return (
//       <div className="flex flex-col gap-4 p-1">
//         <input type="hidden" value={formData.sUserGroupID} />
        
//         <div className="flex flex-col">
//           <label className="text-[12px] font-roboto font-bold text-[#405f7d]">
//             {t('usermanagement.groupname')} <span className="text-red-500">*</span>
//           </label>
//           <AnimatedInput
//             type="text"
//             value={formData.sGroupName}
//             onChange={(e) => handleChange('sGroupName', e.target.value)}
//             maxLength={50}
//             className={`w-full text-[12px] outline-none bg-white ${
//               formErrors.sGroupName ? 'border-red-500' : 'border-gray-300'
//             }`}
//           />
//           {formErrors.sGroupName && (
//             <div className="text-red-500 text-[12px]">
//               {formErrors.sGroupName}
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Edit className="w-4 h-4" /> 
//             {isSubmitting ? t('usermanagement.saving') : t('usermanagement.submit')}
//           </button>
//           <button
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="px-2.5 py-2 text-[12px] font-roboto font-semibold text-[#8092a4] bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {t('usermanagement.close')}
//           </button>
//         </div>
//       </div>
//     );
//   };

//   /* ------------------ HANDLERS ------------------ */

//   const showInfoDialog = (message, type = "information") => {
//     setInfoDialog({ open: true, message, type });
//   };

//   const closeInfoDialog = () => {
//     setInfoDialog(prev => ({ ...prev, open: false }));
//     setConfirmationAction(null);
//   };

//   const handleAuditAuthorized = (auditData) => {
//     const auditTrailValues = auditData.AuditTrailValues;
    
//     if (!auditTrailValues) {
//       showInfoDialog("Audit trail data is missing", "error");
//       setShowAudit(false);
//       setConfirmationAction(null);
//       return;
//     }
    
//     setShowAudit(false);
    
//     // Check what action is pending
//     if (pendingAction === 'edit' && pendingEditData) {
//       // Submit edit with audit trail values
//       saveMutation.mutate({ 
//         formData: pendingEditData, 
//         type: 'edit',
//         auditTrailValues 
//       });
//     } else if (pendingAction === 'activeDeactive' && selectedRow) {
//       const formData = {
//         sGroupName: selectedRow.L01UserGroupName,
//         sUserGroupID: selectedRow.L01UserGroupID,
//         gStatus: selectedRow.gStatus
//       };
//       actDeactMutation.mutate({ formData, auditTrailValues });
//     }
    
//     setPendingAction(null);
//     setPendingEditData(null);
//     setConfirmationAction(null);
//   };

//   const handleAuditClose = () => {
//     setShowAudit(false);
//     setPendingAction(null);
//     setPendingEditData(null);
//     setConfirmationAction(null);
//   };

//   const handleAddClick = () => {
//     setModalConfig({ isOpen: true, type: "add", groupId: null });
//   };

//   const handleEditClick = () => {
//     if (!selectedRow) {
//       showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//       return;
//     }

//     if (selectedRow.L01UserGroupName === "Administrator") {
//       showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
//       return;
//     }

//     if (selectedRow.gStatus === "Deactive") {
//       showInfoDialog(t('usermanagement.groupdeactivesocannotedit'), "warning");
//       return;
//     }

//     // Open edit modal first
//     setModalConfig({ 
//       isOpen: true, 
//       type: "edit", 
//       groupId: selectedRow.L01UserGroupID 
//     });
//   };

//   const handleActiveDeactiveClick = () => {
//     if (!selectedRow) {
//       showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//       return;
//     }

//     if (selectedRow.L01UserGroupName === "Administrator") {
//       showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
//       return;
//     }

//     if (auditTrailRights.activeDeactive === 1) {
//       setPendingAction('activeDeactive');
//       setConfirmationAction(selectedRow.gStatus === "Active" ? "deactivate" : "activate");
      
//       const message = selectedRow.gStatus === "Active"
//         ? t('usermanagement.confirmdeactivategroup', { groupName: selectedRow.L01UserGroupName })
//         : t('usermanagement.confirmactivategroup', { groupName: selectedRow.L01UserGroupName });
      
//       showInfoDialog(message, "confirmation");
//     } else {
//       const confirmMessage = selectedRow.gStatus === "Active"
//         ? t('usermanagement.confirmdeactivategroup', { groupName: selectedRow.L01UserGroupName })
//         : t('usermanagement.confirmactivategroup', { groupName: selectedRow.L01UserGroupName });
      
//       setConfirmationAction(selectedRow.gStatus === "Active" ? "deactivate" : "activate");
//       showInfoDialog(confirmMessage, "confirmation");
//     }
//   };

//   const handleFormSubmit = (formData) => {
//     if (modalConfig.type === 'add') {
//       // For add, submit directly (no audit trail for add)
//       saveMutation.mutate({ formData, type: 'add' });
//     } else if (modalConfig.type === 'edit') {
//       // For edit, check if audit trail is required
//       if (auditTrailRights.edit === 1) {
//         // Store the form data and show audit trail
//         setPendingEditData(formData);
//         setPendingAction('edit');
//         setModalConfig(prev => ({ ...prev, isOpen: false })); // Close edit modal
        
//         // Show audit trail after a short delay
//         setTimeout(() => {
//           setShowAudit(true);
//         }, 100);
//       } else {
//         // No audit trail required, submit directly
//         saveMutation.mutate({ formData, type: 'edit' });
//       }
//     }
//   };

//   const handleFormAuditRequired = (formData) => {
//     // This is called from the UserGroupForm when submit is clicked and audit is required
//     setPendingEditData(formData);
//     setPendingAction('edit');
//     setModalConfig(prev => ({ ...prev, isOpen: false })); // Close edit modal
    
//     // Show audit trail after a short delay
//     setTimeout(() => {
//       setShowAudit(true);
//     }, 100);
//   };

//   const handleCloseModal = () => {
//     setModalConfig(prev => ({ ...prev, isOpen: false }));
//   };

//   const handleConfirmation = () => {
//     if (!selectedRow) return;
    
//     if (confirmationAction === 'deactivate' || confirmationAction === 'activate') {
//       if (auditTrailRights.activeDeactive === 1) {
//         // Store the pending action and show audit trail
//         setPendingAction('activeDeactive');
//         setShowAudit(true);
//       } else {
//         // No audit trail required, submit directly
//         const formData = {
//           sGroupName: selectedRow.L01UserGroupName,
//           sUserGroupID: selectedRow.L01UserGroupID,
//           gStatus: selectedRow.gStatus
//         };
//         actDeactMutation.mutate({ formData });
//       }
//     }
    
//     setConfirmationAction(null);
//   };

//   /* ------------------ LOAD AUDIT RIGHTS ------------------ */

//   useEffect(() => {
//     const loadAuditTrailRights = () => {
//       try {
//         const auditRightsData = sessionStorage.getItem('auditTrailRights');
        
//         if (auditRightsData) {
//           try {
//             const rights = JSON.parse(auditRightsData);
//             const userGroupRights = rights.filter(item => 
//               item.sScreenName && item.sScreenName.includes("User Group")
//             );
            
//             const editRight = userGroupRights.find(item => 
//               item.sTaskName && item.sTaskName.includes("Edit")
//             );
//             const activeDeactiveRight = userGroupRights.find(item => 
//               item.sTaskName && item.sTaskName.includes("Active/Deactive")
//             );
            
//             setAuditTrailRights({
//               edit: editRight ? (editRight.nManualAuditTrail || 0) : 0,
//               activeDeactive: activeDeactiveRight ? (activeDeactiveRight.nManualAuditTrail || 0) : 0
//             });
//           } catch (parseError) {
//             setAuditTrailRights({ edit: 1, activeDeactive: 1 });
//           }
//         } else {
//           setAuditTrailRights({ edit: 1, activeDeactive: 1 });
//         }
//       } catch (error) {
//         setAuditTrailRights({ edit: 1, activeDeactive: 1 });
//       }
//     };
    
//     loadAuditTrailRights();
//   }, []);

//   /* ------------------ RENDER ------------------ */

//   if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
//   if (isError) return <div className="p-4 text-center text-red-500">{error.message}</div>;

//   const responsiveHeight = "calc(100vh - 180px)";

//   return (
//     <>
//       {/* Info Dialog */}
//       {infoDialog.open && (
//         <Errordialog
//           message={infoDialog.message}
//           type={infoDialog.type}
//           onClose={closeInfoDialog}
//           onConfirm={infoDialog.type === "confirmation" ? handleConfirmation : undefined}
//         />
//       )}

//       {/* Audit Trail Modal */}
//       {showAudit && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
//           <AuditTrail 
//             isOpen={showAudit}
//             onClose={handleAuditClose}
//             onAuthorized={handleAuditAuthorized}
//             actionLabel={pendingAction === 'edit' ? 'Edit User Group' : 'Active/Deactive User Group'}
//             defaultReason={pendingAction === 'edit' ? "Modified" : "Activated"}
//             disableReason={false}
//           />
//         </div>
//       )}

//       {/* Add/Edit Modal */}
//       <PopupModal 
//         isOpen={modalConfig.isOpen} 
//         onClose={handleCloseModal} 
//         title={modalConfig.type === 'edit' ? t('usermanagement.updateusergroup') : t('usermanagement.addnewgroup')}
//         width="600px"
//         content={
//           <UserGroupForm 
//             editGroupId={modalConfig.groupId} 
//             isEditMode={modalConfig.type === 'edit'}
//             onSubmit={handleFormSubmit} 
//             onAuditRequired={handleFormAuditRequired}
//             onClose={handleCloseModal}
//           />
//         } 
//       />

//       {/* Action Buttons */}
//       <div className='flex items-center justify-end gap-5 me-6 pt-3 pb-1'>
//         <ActionButton
//           icon={UserPlus}
//           label={t('usermanagement.addnewgroup')}
//           onClick={handleAddClick}
//           disabled={isLoading || saveMutation.isLoading}
//         />
//         <ActionButton
//           icon={Edit}
//           label={t('usermanagement.edit')}
//           onClick={handleEditClick}
//           disabled={!selectedRow || isLoading || saveMutation.isLoading}
//         />
//         <ActionButton
//           icon={UserX}
//           label={t('usermanagement.activedeactive')}
//           onClick={handleActiveDeactiveClick}
//           disabled={!selectedRow || isLoading || actDeactMutation.isLoading}
//         />
//       </div>
      
//       {/* Grid Layout */}
//       <div className="px-4 h-full"> 
//         <GridLayout
//           columns={columns}
//           data={rows}
//           getRowId={(row) => row._gridId}
//           onRowClick={(row) => setSelectedRowId(row._gridId)}
//           rowClassName={(row) => row._gridId === selectedRowId ? "bg-blue-50 border-l-4 border-blue-600 font-semibold" : ""}
//           renderDetailPanel={renderDetailPanel} 
//           detailPanelWidth="45%" 
//           height={responsiveHeight}
//           searchable={true}
//           selectable={true}
//           hidePagination={false}
//         />
//       </div>
//     </>
//   );
// }



import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Components
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import PopupModal from "../../FTPDataView/DataExplorer/PopupModal";
import AnimatedInput from "../../../../Layout/Common/AnimatedInput";
import AuditTrail from "../../../../Layout/Common/AuditTrail";
import Errordialog from "../../../../Layout/Common/Errordialog";

// Services
import servicecall from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";

/* ------------------ HELPER COMPONENTS ------------------ */

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
      {label}
    </div>
    <div className="font-bold text-[12px] text-[#353f49] font-roboto">
      {value || "-"}
    </div>
  </div>
);
const ActionButton = ({ iconClass, label, disabled, onClick, variant = "default" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold font-roboto rounded border-none 
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
            {iconClass && <i className={`fa ${iconClass} w-3 h-3`}></i>}
    <span>{label}</span>
        </button>
    );


/* ------------------ DATA FETCHING ------------------ */

const fetchUserGroupsAPI = async ({ postData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { sActionType: "View", ...userDetailsData };
  const response = await postData("User/UserGroupAndMasterGrid", reqObj);
  
  if (!response) {
    throw new Error("Server returned null response");
  }
  
  if (response.Rtn && response.Rtn !== "Success") {
    throw new Error(response.returnMsg || "Failed to fetch user groups");
  }
  
  // Process response - Match your User Group API structure
  let groupsData = [];
  
  if (response && response.oResObj && Array.isArray(response.oResObj)) {
    groupsData = response.oResObj;
  } else if (response && response.returnservice && response.returnservice.oResObj) {
    groupsData = response.returnservice.oResObj;
  } else if (Array.isArray(response)) {
    groupsData = response;
  }
  
  // Format data for grid - Match your User Group data structure
  const formattedData = groupsData.map((group, index) => ({
    _gridId: group.L01UserGroupID || `group-${index}`,
    L01UserGroupID: group.L01UserGroupID || '',
    L01UserGroupName: group.L01UserGroupName || '',
    gStatus: group.gStatus || 'Active',
    gCreatedBy: group.gCreatedBy || 'System',
    gCreatedOn: group.gCreatedOn || '',
    gUTCCreatedOn: group.gUTCCreatedOn || '',
    gModifiedBy: group.gModifiedBy || null,
    gModifiedOn: group.gModifiedOn || null,
    gUTCModifiedOn: group.gUTCModifiedOn || null
  }));
  
  return { formattedData, rawResponse: response };
};

const saveUserGroupAPI = async ({ postData, formData, actionType, auditTrailValues = null }) => {
  const userDetailsData = CF_activeUserdetails();
  let reqObj = { sActionType: actionType, ...userDetailsData };
  let endpoint = "";
  
  // Add action-specific data based on your User Group API structure
  if (actionType === "Insert") {
    endpoint = "User/UserGroupSaveBtnclick";
    reqObj.grpSave = {
      sGroupname: formData.sGroupName,
      sCreatedBy: userDetailsData.sUserID || "U1",
      sUserStatus: userDetailsData.sUserStatus || ""
    };
  } else if (actionType === "Update") {
    endpoint = "User/UserGroupUpdateBtnclick";
    reqObj.grpSave = {
      sGroupname: formData.sGroupName,
      sUserGroupID: formData.sUserGroupID,
      sCreatedBy: userDetailsData.sUserID || "U1",
      sUserStatus: userDetailsData.sUserStatus || ""
    };
  } else if (actionType === "ActDeact") {
    endpoint = "User/UserGroupActDeactBtnclick";
    reqObj.ActDeactObj = {
      sGroupname: formData.sGroupName,
      sUserStatus: formData.gStatus,
      sUserGroupID: formData.sUserGroupID
    };
  }
  
  // Add audit trail values if provided
  if (auditTrailValues) {
    reqObj.AuditTrailValues = auditTrailValues;
  }
  
  const response = await postData(endpoint, reqObj);
  
  if (!response) {
    throw new Error("Server returned null response");
  }
  
  return response;
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function UserGroup() {
  const { postData } = servicecall(); 
  const queryClient = useQueryClient();
  const { t } = useTranslation(); 

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "add", groupId: null });
  const [infoDialog, setInfoDialog] = useState({ open: false, message: "", type: "information" });
  const [showAudit, setShowAudit] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // Stores the pending form data for audit trail
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [auditTrailRights, setAuditTrailRights] = useState({ edit: 0, activeDeactive: 0 });
  
  // Store form data when edit is submitted (for audit trail)
  const [pendingEditData, setPendingEditData] = useState(null);

  /* ------------------ QUERIES ------------------ */

  // 1. Fetch Grid Data
  const { data: gridResult, isLoading, isError, error } = useQuery({
    queryKey: ["userGroups"],
    queryFn: () => fetchUserGroupsAPI({ postData }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const rows = gridResult?.formattedData || [];

  // 2. Define Columns
  const columns = useMemo(() => [
    { 
      key: "L01UserGroupName",  
      label: (
                <div> 
                    <span className="text-[12px] font-roboto text-[#353f49] font-bold">
                        {t('usermanagement.usergroupname') || 'User Full Name'}
                    </span>
                </div>
            ),
      width: 200,
      enableSearch: true,
      sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'} text-[12px] font-['Verdana']`}>
          {row.L01UserGroupName}
        </span>
      ) 
    },
    { 
      key: "gStatus", 
      label: (
                <div> 
                    <span className="text-[12px] font-roboto text-[#353f49] font-bold">
                        {t('usermanagement.userstatus') || 'User Full Name'}
                    </span>
                </div>
            ), 
      width: 150,
      enableSearch: true,
      sortable: true,
      render: (row,isSelected) => {
        const isActive = (row.gStatus || "").toLowerCase() === 'active';
        return (
          <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'} text-[12px] font-['Verdana'] ${isActive ? 'text-green-600' : 'text-red-500'}`}>
            {row.gStatus}
          </span>
        );
      }
    }
  ], [t]);
      
  // 3. Auto-Select First Row
  useEffect(() => {
    if (rows.length > 0 && selectedRowId === null) {
      setSelectedRowId(rows[0]._gridId);
    }
  }, [rows, selectedRowId]);

  const selectedRow = useMemo(
    () => rows.find((r) => r._gridId === selectedRowId),
    [rows, selectedRowId]
  );

  /* ------------------ MUTATIONS ------------------ */

  const saveMutation = useMutation({
    mutationFn: ({ formData, type, auditTrailValues = null }) => 
      saveUserGroupAPI({ 
        postData, 
        formData, 
        actionType: type === 'add' ? 'Insert' : 'Update',
        auditTrailValues
      }),
    onSuccess: (res, variables) => {
      const { type } = variables;
      
      // Check for audit trail login failure
      if (res.AuditTrailLogin === false) {
        showInfoDialog(res.LoginFailedMsg || "Audit trail authentication failed", "error");
        return;
      }
      
      if(res.Rtn === "Success") {
        showInfoDialog(
          type === 'add' ? t('usermanagement.groupaddedsuccessfully') : t('usermanagement.groupupdatesuccessfully'), 
          "success"
        );
        queryClient.invalidateQueries(['userGroups']);
        handleCloseModal();
      } else {
        // Check for specific error message
        if (res.Message && res.Message.sGroupName) {
          showInfoDialog(res.Message.sGroupName, "error");
        } else {
          showInfoDialog(res.returnMsg || t('usermanagement.updatefailed'), "error");
        }
      }
    },
    onError: (err) => showInfoDialog(err.message, "error")
  });

  const actDeactMutation = useMutation({
    mutationFn: ({ formData, auditTrailValues = null }) => 
      saveUserGroupAPI({ 
        postData, 
        formData, 
        actionType: 'ActDeact',
        auditTrailValues
      }),
    onSuccess: (res, variables) => {
      const { formData } = variables;
      
      // Check for audit trail login failure
      if (res.AuditTrailLogin === false) {
        showInfoDialog(res.LoginFailedMsg || "Audit trail authentication failed", "error");
        setConfirmationAction(null);
        return;
      }
      
      if(res.Rtn === "Success") {
        const message = formData.gStatus === "Active" 
          ? t('usermanagement.groupdeactivatedsuccessfully')
          : t('usermanagement.groupactivatedsuccessfully');
        showInfoDialog(message, "success");
        queryClient.invalidateQueries(['userGroups']);
        setConfirmationAction(null);
      } else {
        showInfoDialog(res.returnMsg || t('usermanagement.actdeactfailed'), "error");
      }
    },
    onError: (err) => showInfoDialog(err.message, "error")
  });

  /* ------------------ RENDER DETAIL PANEL ------------------ */
  
  const renderDetailPanel = useCallback(() => {
    if (!selectedRow) return <div className="p-4 text-gray-500 font-roboto text-sm">Select a row to view details</div>;

    return (
      <div className="space-y-3">
        <DetailRow label={t('usermanagement.createdby')} value={selectedRow.gCreatedBy} />
        <DetailRow label={t('usermanagement.createdon')} value={selectedRow.gCreatedOn} />
        <DetailRow label={t('usermanagement.modifiedby')} value={selectedRow.gModifiedBy} />
        <DetailRow label={t('usermanagement.modifiedon')} value={selectedRow.gModifiedOn} />
      </div>
    );
  }, [selectedRow, t]);

  /* ------------------ MODAL FORM COMPONENT ------------------ */

  const UserGroupForm = ({ editGroupId, isEditMode, onSubmit, onClose, onAuditRequired }) => {
    const [formData, setFormData] = useState({
      sGroupName: "",
      sUserGroupID: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load data for edit mode
    useEffect(() => {
      if (isEditMode && editGroupId) {
        const groupToEdit = rows.find(r => 
          r.L01UserGroupID === editGroupId || r._gridId === editGroupId
        );
        if (groupToEdit) {
          setFormData({
            sGroupName: groupToEdit.L01UserGroupName,
            sUserGroupID: groupToEdit.L01UserGroupID
          });
        }
      } else {
        setFormData({ sGroupName: "", sUserGroupID: "" });
      }
    }, [isEditMode, editGroupId, rows]);

    const validateForm = () => {
      const errors = {};
      
      if (!formData.sGroupName.trim()) {
        errors.sGroupName = t('usermanagement.usergroupname') + " " + t('usermanagement.isrequired');
      }
      
      const existingGroup = rows.find(group => 
        group.L01UserGroupName.toLowerCase() === formData.sGroupName.toLowerCase() &&
        group.L01UserGroupID !== formData.sUserGroupID
      );
      
      if (existingGroup) {
        errors.sGroupName = t('usermanagement.groupnamealreadyexists');
      }
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
      if (!validateForm()) return;
      
      setIsSubmitting(true);
      
      // If edit mode and audit trail is required, trigger audit trail
      if (isEditMode && auditTrailRights.edit === 1) {
        onAuditRequired(formData);
      } else {
        // For add or edit without audit trail, submit directly
        onSubmit(formData);
      }
    };

    const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (formErrors[field]) {
        setFormErrors(prev => ({ ...prev, [field]: "" }));
      }
    };

    return (
      <div className="flex flex-col gap-1 p-1">
        <input type="hidden" value={formData.sUserGroupID} />
        
        <div className="flex flex-col">
          <label className="text-[12px] font-roboto font-bold text-[#405f7d] mb-1">
            {t('usermanagement.groupname')} <span className="text-red-500">*</span>
          </label>
          <AnimatedInput
            type="text"
            value={formData.sGroupName}
            onChange={(e) => handleChange('sGroupName', e.target.value)}
            maxLength={30}
            className={`w-full text-[12px] outline-none bg-white p-2 border rounded ${
              formErrors.sGroupName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.sGroupName && (
            <div className="text-red-500 text-[11px] mt-1">
              {formErrors.sGroupName}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 mt-1 border-t border-gray-200">
          <button
  onClick={handleSubmit}
  disabled={isSubmitting}
  className="flex items-center gap-1 px-4 py-2 text-[11px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <i className="fa fa-check-square-o w-4 h-3"></i>
  {isSubmitting ? t('button.saving') : t('button.submit')}
</button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-[11px] font-roboto font-semibold text-gray-600 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('button.close')}
          </button>
        </div>
      </div>
    );
  };

  /* ------------------ HANDLERS ------------------ */

  const showInfoDialog = (message, type = "information") => {
    setInfoDialog({ open: true, message, type });
  };

  const closeInfoDialog = () => {
    setInfoDialog(prev => ({ ...prev, open: false }));
    setConfirmationAction(null);
  };

  const handleAuditAuthorized = (auditData) => {
    const auditTrailValues = auditData.AuditTrailValues;
    
    if (!auditTrailValues) {
      showInfoDialog("Audit trail data is missing", "error");
      setShowAudit(false);
      setConfirmationAction(null);
      return;
    }
    
    setShowAudit(false);
    
    // Check what action is pending
    if (pendingAction === 'edit' && pendingEditData) {
      // Submit edit with audit trail values
      saveMutation.mutate({ 
        formData: pendingEditData, 
        type: 'edit',
        auditTrailValues 
      });
    } else if (pendingAction === 'activeDeactive' && selectedRow) {
      const formData = {
        sGroupName: selectedRow.L01UserGroupName,
        sUserGroupID: selectedRow.L01UserGroupID,
        gStatus: selectedRow.gStatus
      };
      actDeactMutation.mutate({ formData, auditTrailValues });
    }
    
    setPendingAction(null);
    setPendingEditData(null);
    setConfirmationAction(null);
  };

  const handleAuditClose = () => {
    setShowAudit(false);
    setPendingAction(null);
    setPendingEditData(null);
    setConfirmationAction(null);
  };

  const handleAddClick = () => {
    setModalConfig({ isOpen: true, type: "add", groupId: null });
  };

  const handleEditClick = () => {
    if (!selectedRow) {
      showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
      return;
    }

    if (selectedRow.L01UserGroupName === "Administrator") {
      showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
      return;
    }

    if (selectedRow.gStatus === "Deactive") {
      showInfoDialog(t('usermanagement.groupdeactivesocannotedit'), "warning");
      return;
    }

    // Open edit modal first
    setModalConfig({ 
      isOpen: true, 
      type: "edit", 
      groupId: selectedRow.L01UserGroupID 
    });
  };

  const handleActiveDeactiveClick = () => {
    if (!selectedRow) {
      showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
      return;
    }

    if (selectedRow.L01UserGroupName === "Administrator") {
      showInfoDialog(t('usermanagement.adminigroupnamecannotbeeditedordeactivate'), "warning");
      return;
    }

    if (auditTrailRights.activeDeactive === 1) {
      setPendingAction('activeDeactive');
      setConfirmationAction(selectedRow.gStatus === "Active" ? "deactivate" : "activate");
      
      const message = selectedRow.gStatus === "Active"
        ? t('usermanagement.confirmdeactivategroup', { groupName: selectedRow.L01UserGroupName })
        : t('usermanagement.confirmactivategroup', { groupName: selectedRow.L01UserGroupName });
      
      showInfoDialog(message, "confirmation");
    } else {
      const confirmMessage = selectedRow.gStatus === "Active"
        ? t('usermanagement.confirmdeactivategroup', { groupName: selectedRow.L01UserGroupName })
        : t('usermanagement.confirmactivategroup', { groupName: selectedRow.L01UserGroupName });
      
      setConfirmationAction(selectedRow.gStatus === "Active" ? "deactivate" : "activate");
      showInfoDialog(confirmMessage, "confirmation");
    }
  };

  const handleFormSubmit = (formData) => {
    if (modalConfig.type === 'add') {
      // For add, submit directly (no audit trail for add)
      saveMutation.mutate({ formData, type: 'add' });
    } else if (modalConfig.type === 'edit') {
      // For edit, check if audit trail is required
      if (auditTrailRights.edit === 1) {
        // Store the form data and show audit trail
        setPendingEditData(formData);
        setPendingAction('edit');
        setModalConfig(prev => ({ ...prev, isOpen: false })); // Close edit modal
        
        // Show audit trail after a short delay
        setTimeout(() => {
          setShowAudit(true);
        }, 100);
      } else {
        // No audit trail required, submit directly
        saveMutation.mutate({ formData, type: 'edit' });
      }
    }
  };

  const handleFormAuditRequired = (formData) => {
    // This is called from the UserGroupForm when submit is clicked and audit is required
    setPendingEditData(formData);
    setPendingAction('edit');
    setModalConfig(prev => ({ ...prev, isOpen: false })); // Close edit modal
    
    // Show audit trail after a short delay
    setTimeout(() => {
      setShowAudit(true);
    }, 100);
  };

  const handleCloseModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmation = () => {
    if (!selectedRow) return;
    
    if (confirmationAction === 'deactivate' || confirmationAction === 'activate') {
      if (auditTrailRights.activeDeactive === 1) {
        // Store the pending action and show audit trail
        setPendingAction('activeDeactive');
        setShowAudit(true);
      } else {
        // No audit trail required, submit directly
        const formData = {
          sGroupName: selectedRow.L01UserGroupName,
          sUserGroupID: selectedRow.L01UserGroupID,
          gStatus: selectedRow.gStatus
        };
        actDeactMutation.mutate({ formData });
      }
    }
    
    setConfirmationAction(null);
  };

  /* ------------------ LOAD AUDIT RIGHTS ------------------ */

  useEffect(() => {
    const loadAuditTrailRights = () => {
      try {
        const auditRightsData = sessionStorage.getItem('auditTrailRights');
        
        if (auditRightsData) {
          try {
            const rights = JSON.parse(auditRightsData);
            const userGroupRights = rights.filter(item => 
              item.sScreenName && item.sScreenName.includes("User Group")
            );
            
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
            setAuditTrailRights({ edit: 1, activeDeactive: 1 });
          }
        } else {
          setAuditTrailRights({ edit: 1, activeDeactive: 1 });
        }
      } catch (error) {
        setAuditTrailRights({ edit: 1, activeDeactive: 1 });
      }
    };
    
    loadAuditTrailRights();
  }, []);

  /* ------------------ RENDER ------------------ */

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">{error.message}</div>;

  const responsiveHeight = "calc(100vh - 187px)"; // Same as legacy: windowSize().height - 187

  return (
    <>
      {/* Info Dialog */}
      {infoDialog.open && (
        <Errordialog
          message={infoDialog.message}
          type={infoDialog.type}
          onClose={closeInfoDialog}
          onConfirm={infoDialog.type === "confirmation" ? handleConfirmation : undefined}
        />
      )}

      {/* Audit Trail Modal */}
      {showAudit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <AuditTrail 
            isOpen={showAudit}
            onClose={handleAuditClose}
            onAuthorized={handleAuditAuthorized}
            actionLabel={pendingAction === 'edit' ? 'Edit User Group' : 'Active/Deactive User Group'}
            defaultReason={pendingAction === 'edit' ? "Modified" : "Activated"}
            disableReason={false}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <PopupModal 
        isOpen={modalConfig.isOpen} 
        onClose={handleCloseModal} 
        title={modalConfig.type === 'edit' ? t('usermanagement.updateusergroup') : t('usermanagement.addnewgroup')}
        width="500px"
        content={
          <UserGroupForm 
            editGroupId={modalConfig.groupId} 
            isEditMode={modalConfig.type === 'edit'}
            onSubmit={handleFormSubmit} 
            onAuditRequired={handleFormAuditRequired}
            onClose={handleCloseModal}
          />
        } 
      />

      {/* Action Buttons */}
<div className='flex items-center justify-end gap-2 pr-4 pt-3 pb-1'>
  <ActionButton
    iconClass="fa-users"
    label={t('button.addnewgroup')}
    onClick={handleAddClick}
    disabled={isLoading || saveMutation.isLoading}
  />
  <ActionButton
    iconClass="fa fa-pencil" // Using glyphicon-edit as in legacy
    label={t('button.edit')}
    onClick={handleEditClick}
    disabled={!selectedRow || isLoading || saveMutation.isLoading}
  />
  <ActionButton
    iconClass="fa-user-times"
    label={t('button.activedeactive')}
    onClick={handleActiveDeactiveClick}
    disabled={!selectedRow || isLoading || actDeactMutation.isLoading}
  />
</div>
      
      {/* Grid Layout */}
      <div className="px-4 h-full"> 
        <GridLayout
          columns={columns}
          data={rows}
          getRowId={(row) => row._gridId}
          onRowClick={(row) => setSelectedRowId(row._gridId)}
          rowClassName={(row) => row._gridId === selectedRowId ? "bg-blue-50 border-l-4 border-blue-600 font-semibold" : ""}
          renderDetailPanel={renderDetailPanel} 
          detailPanelWidth="49%" 
          height={responsiveHeight}
          searchable={true}
          selectable={true}
          hidePagination={false}
        />
      </div>
    </>
  );
}