// import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// import { 
//   UserPlus, Edit, Ban, Power, Unlock, UserX, ThumbsUp, 
//   Server, Download, Upload, Plus, Users, Check, Eye, EyeOff, RefreshCw 
// } from 'lucide-react';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// import { useTranslation } from 'react-i18next';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import CustomPopup from '../../../../Layout/Common/Popup';
// import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
// import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';

// const UserMaster = () => {
//     const [userData, setUserData] = useState([]);
//     const [originalUserData, setOriginalUserData] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [selectedRowId, setSelectedRowId] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [userGroups, setUserGroups] = useState([]);
//     const [selectedGroup, setSelectedGroup] = useState('');
//     const [infoDialog, setInfoDialog] = useState({
//         open: false,
//         message: "",
//         type: "information"
//     });
//     const [activePopup, setActivePopup] = useState(null);
//     const [showImportADS, setShowImportADS] = useState(false);
//     const [formData, setFormData] = useState({
//         sUsername: "",
//         sUserFullname: "",
//         sUserMailID: "",
//         sUserGroupID: "",
//         sUserDefaultSiteCode: "",
//         sUserStatus: "UA",
//         nLabsheetLicense: 0,
//         profileImage: null
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const [resetPasswordData, setResetPasswordData] = useState({
//         newPassword: "",
//         confirmPassword: "",
//         showPassword: false
//     });
//     const [adsData, setAdsData] = useState({
//         domain: "",
//         username: "",
//         password: "",
//         selectedGroup: "",
//         connected: false,
//         adsGroups: ["Engineering", "Management", "QA Team", "Development", "Sales"],
//         adsUsers: [],
//         selectedADSGroup: "",
//         selectAll: false,
//         approveAll: false
//     });
//     const { t } = useTranslation();
//     const fileInputRef = useRef(null);

//     // Mock data for user master
//     const mockUserData = [
//         {
//             id: 1,
//             L02UserID: "U-001",
//             L02UserName: "new1",
//             L02UserFullName: "new1",
//             UserGroupName: "Administrator",
//             UserStatus: "Retired",
//             L02EmailID: "new1@example.com",
//             LastLoggedOn: "2024-01-20 14:30",
//             PassWordExpiryDate: "2024-04-20",
//             CreatedBy: "System",
//             CreatedOn: "2024-01-01 09:00",
//             ModifiedBy: "Admin",
//             ModifiedOn: "2024-01-15 11:00",
//             sUserDomainName: "SDMS",
//             SiteName: "Main Lab",
//             isLocked: false,
//             isActive: false
//         },
//         {
//             id: 2,
//             L02UserID: "U-002",
//             L02UserName: "new",
//             L02UserFullName: "new",
//             UserGroupName: "Administrator",
//             UserStatus: "Deactive",
//             L02EmailID: "new@example.com",
//             LastLoggedOn: "2024-01-18 10:15",
//             PassWordExpiryDate: "2024-04-18",
//             CreatedBy: "Admin",
//             CreatedOn: "2024-01-10 10:00",
//             ModifiedBy: "Admin",
//             ModifiedOn: "2024-01-12 14:00",
//             sUserDomainName: "Corporate",
//             SiteName: "Lab A",
//             isLocked: false,
//             isActive: false
//         }
//     ];

//     // Mock user groups
//     const mockUserGroups = [
//         { L01UserGroupID: "UG-001", L01UserGroupName: "Administrator" },
//         { L01UserGroupID: "UG-002", L01UserGroupName: "Lab Technician" },
     
//     ];

//     // Mock sites
//     const mockSites = [
//         { SiteCode: "SITE-001", SiteName: "Main Lab" },
//         { SiteCode: "SITE-002", SiteName: "Lab A" },
       
//     ];

//     // Mock ADS users for different groups
//     const mockADSUsersByGroup = {
//         "Engineering": [
//             { username: "john.doe", approved: false },
//             { username: "jane.smith", approved: true },
//             { username: "mike.wilson", approved: false }
//         ],
//         "Management": [
//             { username: "sarah.johnson", approved: true },
//             { username: "robert.brown", approved: false }
//         ],
      
//     };

//     useEffect(() => {
//         setLoading(true);
//         setTimeout(() => {
//             setUserData(mockUserData);
//             setOriginalUserData(mockUserData);
//             setUserGroups(mockUserGroups);
//             if (mockUserGroups.length > 0) {
//                 setSelectedGroup(mockUserGroups[0].L01UserGroupID);
//             }
//             setLoading(false);
//         }, 500);
//     }, []);

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

//     const handleRowSelect = useCallback((row) => {
//         setSelectedUser(row);
//         setSelectedRowId(row.id);
//     }, []);

//     const handleGroupChange = useCallback((value) => {
//         setSelectedGroup(value);
//         setLoading(true);
//         setTimeout(() => {
//             if (value === "UG-001") {
//                 setUserData(originalUserData.filter(user => user.UserGroupName === "Administrator"));
//             } else if (value === "UG-002") {
//                 setUserData(originalUserData.filter(user => user.UserGroupName === "Lab Technician"));
//             } else if (value === "UG-003") {
//                 setUserData(originalUserData.filter(user => user.UserGroupName === "View Only"));
//             } else {
//                 setUserData(originalUserData);
//             }
//             setSelectedUser(null);
//             setSelectedRowId(null);
//             setLoading(false);
//         }, 300);
//     }, [originalUserData]);

//     // ADD USER FUNCTIONALITY
//     const handleAddClick = useCallback(() => {
//         setFormData({
//             sUsername: "",
//             sUserFullname: "",
//             sUserMailID: "",
//             sUserGroupID: selectedGroup || "",
//             sUserDefaultSiteCode: "",
//             sUserStatus: "UA",
//             nLabsheetLicense: 0,
//             profileImage: null
//         });
//         setFormErrors({});
//         setActivePopup("adduser");
//     }, [selectedGroup]);

//     // EDIT USER FUNCTIONALITY
//     const handleEditClick = useCallback(() => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
//             showInfoDialog(t('usermanagement.adminusercantedit'), "warning");
//             return;
//         }
        
//         const userGroup = userGroups.find(g => g.L01UserGroupName === selectedUser.UserGroupName);
//         setFormData({
//             sUsername: selectedUser.L02UserName,
//             sUserFullname: selectedUser.L02UserFullName,
//             sUserMailID: selectedUser.L02EmailID || "",
//             sUserGroupID: userGroup?.L01UserGroupID || "",
//             sUserDefaultSiteCode: "",
//             sUserStatus: selectedUser.UserStatus === "Unapproved" ? "UA" : "A",
//             nLabsheetLicense: 0,
//             profileImage: null
//         });
//         setFormErrors({});
//         setActivePopup("edituser");
//     }, [selectedUser, userGroups, showInfoDialog, t]);

//     // RETIRE USER FUNCTIONALITY
//     const handleRetireClick = useCallback(() => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
//             showInfoDialog(t('usermanagement.adminusercantberetired'), "warning");
//             return;
//         }
        
//         if (selectedUser.UserStatus === "Retired") {
//             showInfoDialog(t('usermanagement.retiremessage'), "warning");
//             return;
//         }
        
//         const confirmRetire = window.confirm(t('usermanagement.confirametionretire'));
//         if (confirmRetire) {
//             const updatedData = userData.map(user => {
//                 if (user.id === selectedUser.id) {
//                     return {
//                         ...user,
//                         UserStatus: "Retired",
//                         isActive: false,
//                         ModifiedBy: t('usermanagement.currentuser'),
//                         ModifiedOn: new Date().toISOString()
//                     };
//                 }
//                 return user;
//             });
            
//             setUserData(updatedData);
//             setOriginalUserData(updatedData);
//             setSelectedUser(null);
//             setSelectedRowId(null);
//             showInfoDialog(t('usermanagement.userretiredsuccessfully'), "success");
//         }
//     }, [selectedUser, userData, showInfoDialog, t]);

//     // RESET PASSWORD FUNCTIONALITY
//     const handleResetPasswordClick = useCallback(() => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
//             showInfoDialog(t('usermanagement.adminusercantreset'), "warning");
//             return;
//         }
        
//         setResetPasswordData({
//             newPassword: "",
//             confirmPassword: "",
//             showPassword: false
//         });
//         setActivePopup("resetpassword");
//     }, [selectedUser, showInfoDialog, t]);

//     // UNLOCK USER FUNCTIONALITY
//     const handleUnlockClick = useCallback(() => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
//             showInfoDialog(t('usermanagement.adminusercantbelock'), "warning");
//             return;
//         }
        
//         if (selectedUser.UserStatus !== "Locked") {
//             showInfoDialog(t('usermanagement.userlockmessage'), "warning");
//             return;
//         }
        
//         const updatedData = userData.map(user => {
//             if (user.id === selectedUser.id) {
//                 return {
//                     ...user,
//                     UserStatus: "Active",
//                     isLocked: false,
//                     ModifiedBy: t('usermanagement.currentuser'),
//                     ModifiedOn: new Date().toISOString()
//                 };
//             }
//             return user;
//         });
        
//         setUserData(updatedData);
//         setOriginalUserData(updatedData);
//         setSelectedUser(updatedData.find(user => user.id === selectedUser.id));
//         showInfoDialog(t('usermanagement.userunlockedsuccessfully'), "success");
//     }, [selectedUser, userData, showInfoDialog, t]);

//     // ACTIVE/DEACTIVE USER FUNCTIONALITY
//     const handleActiveDeactiveClick = useCallback(() => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
//             showInfoDialog(t('usermanagement.adminusercantbeactivedeactivate'), "warning");
//             return;
//         }
        
//         if (selectedUser.UserStatus === "Retired") {
//             showInfoDialog(t('usermanagement.userretiredsocantactive'), "warning");
//             return;
//         }
        
//         const newStatus = selectedUser.UserStatus === "Active" ? "Deactive" : "Active";
//         const confirmAction = window.confirm(
//             t('usermanagement.confiramationactdeactforuser') + " " + selectedUser.L02UserName + " to " + newStatus + "?"
//         );
        
//         if (confirmAction) {
//             const updatedData = userData.map(user => {
//                 if (user.id === selectedUser.id) {
//                     return {
//                         ...user,
//                         UserStatus: newStatus,
//                         isActive: newStatus === "Active",
//                         ModifiedBy: t('usermanagement.currentuser'),
//                         ModifiedOn: new Date().toISOString()
//                     };
//                 }
//                 return user;
//             });
            
//             setUserData(updatedData);
//             setOriginalUserData(updatedData);
//             setSelectedUser(updatedData.find(user => user.id === selectedUser.id));
//             showInfoDialog(selectedUser.L02UserName + " " + (newStatus === "Active" ? t('usermanagement.activatedsuccessfully') : t('usermanagement.deactivatedsuccessfully')), "success");
//         }
//     }, [selectedUser, userData, showInfoDialog, t]);

//     // APPROVE USER FUNCTIONALITY
//     const handleApproveClick = useCallback(() => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         if (selectedUser.UserStatus !== "Unapproved") {
//             showInfoDialog(t('usermanagement.userselectedis') + " " + selectedUser.UserStatus.toLowerCase() + ", " + t('usermanagement.socantapprove'), "warning");
//             return;
//         }
        
//         const confirmApprove = window.confirm(t('usermanagement.confirmationapprove'));
//         if (confirmApprove) {
//             const updatedData = userData.map(user => {
//                 if (user.id === selectedUser.id) {
//                     return {
//                         ...user,
//                         UserStatus: "Active",
//                         isActive: true,
//                         ModifiedBy: t('usermanagement.currentuser'),
//                         ModifiedOn: new Date().toISOString()
//                     };
//                 }
//                 return user;
//             });
            
//             setUserData(updatedData);
//             setOriginalUserData(updatedData);
//             setSelectedUser(updatedData.find(user => user.id === selectedUser.id));
//             showInfoDialog(t('usermanagement.userapprovedsuccessfully'), "success");
//         }
//     }, [selectedUser, userData, showInfoDialog, t]);

//     // IMPORT ADS FUNCTIONALITY
//     const handleImportADSClick = useCallback(() => {
//         setAdsData({
//             domain: "",
//             username: "",
//             password: "",
//             selectedGroup: "",
//             connected: false,
//             adsGroups: ["Engineering", "Management", "QA Team", "Development", "Sales"],
//             adsUsers: [],
//             selectedADSGroup: "",
//             selectAll: false,
//             approveAll: false
//         });
//         setShowImportADS(true);
//     }, []);

//     // ADS Connect
//     const handleADSConnect = useCallback(() => {
//         if (!adsData.domain || !adsData.username || !adsData.password) {
//             showInfoDialog(t('usermanagement.fillallfields'), "warning");
//             return;
//         }
        
//         setAdsData(prev => ({
//             ...prev,
//             connected: true
//         }));
//         showInfoDialog(t('usermanagement.adsconnectedsuccessfully'), "success");
//     }, [adsData, showInfoDialog, t]);

//     // ADS Group Selection
//     const handleADSGroupSelect = useCallback((group) => {
//         const users = mockADSUsersByGroup[group] || [];
//         setAdsData(prev => ({
//             ...prev,
//             selectedADSGroup: group,
//             adsUsers: users.map(u => ({ ...u, selected: false })),
//             selectAll: false,
//             approveAll: false
//         }));
//     }, []);

//     // ADS Select All
//     const handleADSSelectAll = useCallback((checked) => {
//         setAdsData(prev => ({
//             ...prev,
//             selectAll: checked,
//             adsUsers: prev.adsUsers.map(u => ({ ...u, selected: checked }))
//         }));
//     }, []);

//     // ADS Approve All
//     const handleADSApproveAll = useCallback((checked) => {
//         setAdsData(prev => ({
//             ...prev,
//             approveAll: checked,
//             adsUsers: prev.adsUsers.map(u => ({ ...u, approved: checked }))
//         }));
//     }, []);

//     // ADS User Selection
//     const handleADSUserSelect = useCallback((index, field, value) => {
//         setAdsData(prev => ({
//             ...prev,
//             adsUsers: prev.adsUsers.map((u, i) => 
//                 i === index ? { ...u, [field]: value } : u
//             )
//         }));
//     }, []);

//     // ADS Refresh
//     const handleADSRefresh = useCallback(() => {
//         if (adsData.selectedADSGroup) {
//             const users = mockADSUsersByGroup[adsData.selectedADSGroup] || [];
//             setAdsData(prev => ({
//                 ...prev,
//                 adsUsers: users.map(u => ({ ...u, selected: false }))
//             }));
//             showInfoDialog(t('usermanagement.adsusersrefreshed'), "success");
//         }
//     }, [adsData.selectedADSGroup, showInfoDialog, t]);

//     // ADS Import Submit
//     const handleImportADSSubmit = useCallback(() => {
//         if (!adsData.connected) {
//             showInfoDialog(t('usermanagement.pleaseconnectadsfirst'), "warning");
//             return;
//         }

//         const selectedUsers = adsData.adsUsers.filter(u => u.selected);
//         if (selectedUsers.length === 0) {
//             showInfoDialog(t('usermanagement.selectuserstoimport'), "warning");
//             return;
//         }

//         const importedUsers = selectedUsers.map((user, index) => ({
//             id: originalUserData.length + index + 1,
//             L02UserID: `ADS-${Date.now()}-${index}`,
//             L02UserName: user.username,
//             L02UserFullName: user.username.replace('.', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
//             UserGroupName: userGroups.find(g => g.L01UserGroupID === adsData.selectedGroup)?.L01UserGroupName || "Administrator",
//             UserStatus: user.approved ? "Active" : "Unapproved",
//             L02EmailID: `${user.username}@company.com`,
//             LastLoggedOn: "-",
//             PassWordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//             CreatedBy: "ADS Import",
//             CreatedOn: new Date().toISOString(),
//             ModifiedBy: "ADS Import",
//             ModifiedOn: new Date().toISOString(),
//             sUserDomainName: adsData.domain || "ADS Domain",
//             SiteName: "Default Site",
//             isLocked: false,
//             isActive: user.approved
//         }));

//         const updatedData = [...originalUserData, ...importedUsers];
//         setUserData(updatedData);
//         setOriginalUserData(updatedData);
//         setShowImportADS(false);
//         showInfoDialog(`${importedUsers.length} ` + t('usermanagement.adsusersimportedsuccessfully'), "success");
//     }, [adsData, originalUserData, userGroups, showInfoDialog, t]);

//     // EXPORT FUNCTIONALITY
//     const handleExportClick = useCallback(() => {
//         if (userData.length === 0) {
//             showInfoDialog(t('usermanagement.nodataexport'), "warning");
//             return;
//         }
        
//         const headers = ['Username', 'Profile Name', 'User Group', 'Status', 'Email'];
//         const csvContent = [
//             headers.join(','),
//             ...userData.map(user => [
//                 user.L02UserName,
//                 user.L02UserFullName,
//                 user.UserGroupName,
//                 user.UserStatus,
//                 user.L02EmailID
//             ].join(','))
//         ].join('\n');
        
//         const blob = new Blob([csvContent], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `users_${selectedGroup}_${new Date().toISOString().split('T')[0]}.csv`;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
        
//         showInfoDialog(t('usermanagement.exportsuccess'), "success");
//     }, [userData, selectedGroup, showInfoDialog, t]);

//     // IMPORT FUNCTIONALITY
//     const handleImportClick = useCallback(() => {
//         if (fileInputRef.current) {
//             fileInputRef.current.click();
//         }
//     }, []);

//     const handleFileImport = useCallback((e) => {
//         const file = e.target.files[0];
//         if (!file) return;
        
//         if (!file.name.endsWith('.csv')) {
//             showInfoDialog(t('usermanagement.onlycsvfiles'), "warning");
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = (event) => {
//             try {
//                 const content = event.target.result;
//                 const lines = content.split('\n');
                
//                 const importedUsers = lines.slice(1)
//                     .filter(line => line.trim())
//                     .map((line, index) => {
//                         const values = line.split(',');
//                         return {
//                             id: originalUserData.length + index + 1,
//                             L02UserID: `IMP-${Date.now()}-${index}`,
//                             L02UserName: values[0] || `imported${index}`,
//                             L02UserFullName: values[1] || `Imported User ${index}`,
//                             UserGroupName: values[2] || "Imported",
//                             UserStatus: "Unapproved",
//                             L02EmailID: values[4] || "",
//                             LastLoggedOn: "-",
//                             PassWordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//                             CreatedBy: t('usermanagement.import'),
//                             CreatedOn: new Date().toISOString(),
//                             ModifiedBy: t('usermanagement.import'),
//                             ModifiedOn: new Date().toISOString(),
//                             sUserDomainName: "Imported",
//                             SiteName: "Default",
//                             isLocked: false,
//                             isActive: false
//                         };
//                     });
                
//                 const updatedData = [...originalUserData, ...importedUsers];
//                 setUserData(updatedData);
//                 setOriginalUserData(updatedData);
//                 showInfoDialog(`${importedUsers.length} ` + t('usermanagement.usersimportedsuccessfully'), "success");
//             } catch (error) {
//                 showInfoDialog(t('usermanagement.importfailed'), "error");
//             }
//         };
        
//         reader.readAsText(file);
//         e.target.value = '';
//     }, [originalUserData, showInfoDialog, t]);

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

//     const handleResetPasswordChange = useCallback((field, value) => {
//         setResetPasswordData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     }, []);

//     const handleTogglePasswordVisibility = useCallback(() => {
//         setResetPasswordData(prev => ({
//             ...prev,
//             showPassword: !prev.showPassword
//         }));
//     }, []);

//     const handleProfileImageChange = useCallback((e) => {
//         const file = e.target.files[0];
//         if (file) {
//             if (file.size > 3 * 1024 * 1024) {
//                 showInfoDialog(t('usermanagement.noteuserprofileupload'), "warning");
//                 return;
//             }
            
//             const validTypes = ['image/gif', 'image/png', 'image/jpg', 'image/jpeg'];
//             if (!validTypes.includes(file.type)) {
//                 showInfoDialog(t('usermanagement.noteuserprofileupload'), "warning");
//                 return;
//             }
            
//             setFormData(prev => ({
//                 ...prev,
//                 profileImage: file
//             }));
//         }
//     }, [showInfoDialog, t]);

//     const validateForm = useCallback(() => {
//         const errors = {};
        
//         if (!formData.sUsername.trim()) {
//             errors.sUsername = t('usermanagement.loginid') + " " + t('usermanagement.isrequired');
//         }
        
//         if (!formData.sUserFullname.trim()) {
//             errors.sUserFullname = t('usermanagement.fullname') + " " + t('usermanagement.isrequired');
//         }
        
//         if (!formData.sUserGroupID.trim()) {
//             errors.sUserGroupID = t('usermanagement.groupname') + " " + t('usermanagement.isrequired');
//         }
        
//         if (formData.sUserMailID && !/\S+@\S+\.\S+/.test(formData.sUserMailID)) {
//             errors.sUserMailID = t('usermanagement.emailid') + " " + t('usermanagement.isinvalid');
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     }, [formData, t]);

//     const validateResetPassword = useCallback(() => {
//         const errors = {};
        
//         if (!resetPasswordData.newPassword.trim()) {
//             errors.newPassword = t('usermanagement.newpasswordrequired');
//         } else if (resetPasswordData.newPassword.length < 8) {
//             errors.newPassword = t('usermanagement.passwordminlength');
//         }
        
//         if (!resetPasswordData.confirmPassword.trim()) {
//             errors.confirmPassword = t('usermanagement.confirmpasswordrequired');
//         } else if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
//             errors.confirmPassword = t('usermanagement.passwordsdonotmatch');
//         }
        
//         return errors;
//     }, [resetPasswordData, t]);

//     const handleSubmit = useCallback(() => {
//         if (!validateForm()) {
//             return;
//         }
        
//         try {
//             const isEdit = activePopup === "edituser";
//             const userGroup = userGroups.find(g => g.L01UserGroupID === formData.sUserGroupID);
            
//             if (isEdit) {
//                 const updatedData = userData.map(user => {
//                     if (user.id === selectedUser.id) {
//                         return {
//                             ...user,
//                             L02UserName: formData.sUsername,
//                             L02UserFullName: formData.sUserFullname,
//                             L02EmailID: formData.sUserMailID,
//                             UserGroupName: userGroup?.L01UserGroupName || selectedUser.UserGroupName,
//                             UserStatus: formData.sUserStatus === "A" ? "Active" : "Unapproved",
//                             ModifiedBy: t('usermanagement.currentuser'),
//                             ModifiedOn: new Date().toISOString()
//                         };
//                     }
//                     return user;
//                 });
                
//                 setUserData(updatedData);
//                 setOriginalUserData(updatedData);
//                 setSelectedUser(updatedData.find(user => user.id === selectedUser.id));
//                 showInfoDialog(t('usermanagement.userupdatedsuccessfully'), "success");
//             } else {
//                 const newUser = {
//                     id: originalUserData.length + 1,
//                     L02UserID: `U-${Date.now()}`,
//                     L02UserName: formData.sUsername,
//                     L02UserFullName: formData.sUserFullname,
//                     UserGroupName: userGroup?.L01UserGroupName || "User",
//                     UserStatus: formData.sUserStatus === "A" ? "Active" : "Unapproved",
//                     L02EmailID: formData.sUserMailID,
//                     LastLoggedOn: "-",
//                     PassWordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//                     CreatedBy: t('usermanagement.currentuser'),
//                     CreatedOn: new Date().toISOString(),
//                     ModifiedBy: t('usermanagement.currentuser'),
//                     ModifiedOn: new Date().toISOString(),
//                     sUserDomainName: "Default",
//                     SiteName: mockSites.find(s => s.SiteCode === formData.sUserDefaultSiteCode)?.SiteName || "Default",
//                     isLocked: false,
//                     isActive: formData.sUserStatus === "A"
//                 };
                
//                 const updatedData = [...originalUserData, newUser];
//                 setUserData(updatedData);
//                 setOriginalUserData(updatedData);
//                 showInfoDialog(t('usermanagement.useraddedsuccessfully'), "success");
//             }
            
//             setActivePopup(null);
            
//         } catch (error) {
//             showInfoDialog(t('usermanagement.operationFailed'), "error");
//         }
//     }, [formData, validateForm, activePopup, userGroups, userData, selectedUser, originalUserData, mockSites, showInfoDialog, t]);

//     const handleResetPasswordSubmit = useCallback(() => {
//         const errors = validateResetPassword();
//         if (Object.keys(errors).length > 0) {
//             showInfoDialog(Object.values(errors).join('\n'), "warning");
//             return;
//         }
        
//         const updatedData = userData.map(user => {
//             if (user.id === selectedUser.id) {
//                 return {
//                     ...user,
//                     PassWordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//                     ModifiedBy: t('usermanagement.currentuser'),
//                     ModifiedOn: new Date().toISOString()
//                 };
//             }
//             return user;
//         });
        
//         setUserData(updatedData);
//         setOriginalUserData(updatedData);
//         setActivePopup(null);
//         showInfoDialog(t('usermanagement.passwordresetsuccessfully'), "success");
//     }, [validateResetPassword, userData, selectedUser, showInfoDialog, t]);

//     const handlePopupClose = useCallback(() => {
//         setActivePopup(null);
//         setFormErrors({});
//         setResetPasswordData({
//             newPassword: "",
//             confirmPassword: "",
//             showPassword: false
//         });
//     }, []);

//     const handleCloseImportADS = useCallback(() => {
//         setShowImportADS(false);
//     }, []);

// const columns = useMemo(() => [
//     {
//         key: 'L02UserName',
//         label: t('usermanagement.loginid'),
//         width: 120,
//         enableSearch: true,
//         render: (row, isSelected) => (
//             <div style={{ 
//                 fontSize: '12px', 
//                 fontFamily: 'verdana',
//                 color: '#374151',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 whiteSpace: 'nowrap',
//                 fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
//             }}>
//                 <span className={isSelected ? "font-bold" : ''}>{row.L02UserName}</span>
//             </div>
//         )
//     },
//     {
//         key: 'L02UserFullName',
//         label: t('usermanagement.userfullname'),
//         width: 150,
//         enableSearch: true,
//         render: (row, isSelected) => (
//             <div style={{ 
//                 fontSize: '12px', 
//                 fontFamily: 'verdana',
//                 color: '#374151',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 whiteSpace: 'nowrap',
//                 fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
//             }}>
//                 <span className={isSelected ? "font-bold" : ''}>{row.L02UserFullName}</span>
//             </div>
//         )
//     },
//     {
//         key: 'UserGroupName',
//         label: t('usermanagement.usergroupname'),
//         width: 120,
//         enableSearch: true,
//         render: (row, isSelected) => (
//             <div style={{ 
//                 fontSize: '12px', 
//                 fontFamily: 'verdana',
//                 color: '#374151',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 whiteSpace: 'nowrap',
//                 fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
//             }}>
//                 <span className={isSelected ? "font-bold" : ''}>{row.UserGroupName}</span>
//             </div>
//         )
//     },
//     {
//         key: 'UserStatus',
//         label: t('usermanagement.userstatus'),
//         width: 100,
//         enableSearch: true,
//         render: (row, isSelected) => {
//             let color = '#6b7280';
//             if (row.UserStatus === 'Active') color = '#0a7350';
//             else if (row.UserStatus === 'Deactive') color = '#f59e0b';
//             else if (row.UserStatus === 'Locked') color = '#ef4444';
//             else if (row.UserStatus === 'Retired') color = '#8b5cf6';
//             else if (row.UserStatus === 'Unapproved') color = '#8b5cf6';
            
//             return (
//                 <div style={{ 
//                     fontSize: '12px', 
//                     fontFamily: 'verdana',
//                     color: color,
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap',
//                     fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
//                 }}>
//                     <span className={isSelected ? "font-bold" : ''}>{row.UserStatus}</span>
//                 </div>
//             );
//         }
//     }
// ], [selectedRowId, t]);

//     const renderUserDetail = useCallback((user) => (
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
//                     {t('usermanagement.emailid')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.L02EmailID || '-'}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.profileimage')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.profileImage || '-'}
//                 </div>
//             </div>            
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.lastloggedon')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.LastLoggedOn}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.passwordexpiredon')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.PassWordExpiryDate}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.createdby')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.CreatedBy}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.createdon')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.CreatedOn}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.modifiedby')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.ModifiedBy}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('usermanagement.modifiedon')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.ModifiedOn}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('login.domain')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.sUserDomainName}
//                 </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
//                     {t('login.site')}
//                 </div>
//                 <div style={{ width: '60%', color: '#1f2937' }}>
//                     {user.SiteName}
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

//     const ActionButton = ({ icon: Icon, label, disabled, onClick, variant = "default" }) => (
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
//             fontFamily: 'Roboto, sans-serif',
//             height: '100vh',
//             backgroundColor: '#f9fafb'
//         }}>
//             {/* Error/Info Dialog */}
//             {infoDialog.open && (
//                 <Errordialog
//                     message={infoDialog.message}
//                     type={infoDialog.type}
//                     onClose={closeInfoDialog}
//                 />
//             )}

//             {/* Hidden file input for import */}
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 accept=".csv"
//                 onChange={handleFileImport}
//             />

//             {/* Show Import ADS Full Page View */}
//             {showImportADS ? (
//                 <div style={{ 
//                     display: 'flex', 
//                     flexDirection: 'column',
//                     height: '100vh',
//                     backgroundColor: 'white'
//                 }}>
//                     {/* Header */}
//                     <div style={{ 
//                       padding: '16px 20px',
//                     }}>
//                         <h2 style={{ 
//                             margin: 0, 
//                             fontSize: '12px', 
//                             fontWeight: '600', 
//                             color: '#1e40af' 
//                         }}>
//                             {t('usermanagement.importadsusers')}
//                         </h2>
//                     </div>

//                     {/* Connection Form */}
//                     <div style={{ 
//                         padding: '20px',
//                         display: 'grid', 
//                         gridTemplateColumns: 'repeat(5, 1fr)',
//                         gap: '20px',
//                         alignItems: 'end',
//                         borderBottom: '1px solid #e5e7eb'
//                     }}>
//                         <div>
//                             <label style={{ 
//                                 display: 'block', 
//                                 fontWeight: 600, 
//                                 fontSize: '12px',
//                                 color: '#374151'
//                             }}>
//                                 {t('usermanagement.serverdomain')} <span style={{ color: '#ef4444' }}>*</span>
//                             </label>
//                             <AnimatedDropdown
//                                 value={adsData.domain}
//                                 onChange={(e) => setAdsData(prev => ({ ...prev, domain: e.target.value }))}
//                                 style={{
//                                     width: '100%',
//                                     padding: '8px 12px',
//                                     border: '1px solid #d1d5db',
//                                     borderRadius: '4px',
//                                     fontSize: '12px',
//                                     outline: 'none'
//                                 }}
//                             >
//                                 <option value="">{t('usermanagement.selectdomain')}</option>
//                                 <option value="corpagaram">corpagaram</option>
//                                 <option value="domain1">Domain 1</option>
//                                 <option value="domain2">Domain 2</option>
//                             </AnimatedDropdown>
//                         </div>
                        
//                         <div>
//                             <label style={{ 
//                                 display: 'block', 
//                                 fontWeight: 600, 
//                                 fontSize: '12px',
//                                 color: '#374151'
//                             }}>
//                                 {t('usermanagement.username')} <span style={{ color: '#ef4444' }}>*</span>
//                             </label>
//                             <AnimatedInput
//                                 type="text"
//                                 value={adsData.username}
//                                 onChange={(e) => setAdsData(prev => ({ ...prev, username: e.target.value }))}
//                                 style={{
//                                     width: '100%',
//                                     padding: '8px 12px',
//                                     border: '1px solid #d1d5db',
//                                     borderRadius: '4px',
//                                     fontSize: '12px',
//                                     outline: 'none'
//                                 }}
//                             />
//                         </div>
                        
//                         <div>
//                             <label style={{ 
//                                 display: 'block', 
//                                 fontWeight: 600, 
//                                 fontSize: '12px',
//                                 color: '#374151'
//                             }}>
//                                 {t('usermanagement.password')} <span style={{ color: '#ef4444' }}>*</span>
//                             </label>
//                             <AnimatedInput
//                                 type="password"
//                                 value={adsData.password}
//                                 onChange={(e) => setAdsData(prev => ({ ...prev, password: e.target.value }))}
//                                 style={{
//                                     width: '100%',
//                                     padding: '8px 12px',
//                                     border: '1px solid #d1d5db',
//                                     borderRadius: '4px',
//                                     fontSize: '12px',
//                                     outline: 'none'
//                                 }}
//                             />
//                         </div>
                        
//                         <div>
//                             <button
//                                 onClick={handleADSConnect}
//                                 disabled={adsData.connected}
//                                 style={{
//                                     width: '50%',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     gap: '6px',
//                                     marginBottom: '4px',
//                                     padding: '8px 10px',
//                                     fontSize: '12px',
//                                     fontWeight: 'bold',
//                                     borderRadius: '4px',
//                                     border: 'none',
//                                     cursor: adsData.connected ? 'not-allowed' : 'pointer',
//                                     backgroundColor: '#f1f5f9' ,
//                                     color: '#0ea5e9'
//                                 }}
//                             >
//                                 <Server style={{ width: '14px', height: '14px' }} />
//                                 {adsData.connected ? t('usermanagement.connected') : t('usermanagement.connect')}
//                             </button>
//                         </div>
                        
//                         <div>
//                             <label style={{ 
//                                 display: 'block', 
//                                 fontWeight: 600, 
//                                 fontSize: '12px',
//                                 color: '#374151'
//                             }}>
//                                 {t('usermanagement.groupname')}
//                             </label>
//                             <AnimatedDropdown
//                                 value={adsData.selectedGroup}
//                                 onChange={(e) => setAdsData(prev => ({ ...prev, selectedGroup: e.target.value }))}
//                                 style={{
//                                     width: '100%',
//                                     padding: '8px 12px',
//                                     border: '1px solid #d1d5db',
//                                     borderRadius: '4px',
//                                     fontSize: '12px',
//                                     outline: 'none'
//                                 }}
//                             >
//                                 <option value="">{t('usermanagement.selectgroup')}</option>
//                                 {userGroups.map(group => (
//                                     <option key={group.L01UserGroupID} value={group.L01UserGroupID}>
//                                         {group.L01UserGroupName}
//                                     </option>
//                                 ))}
//                             </AnimatedDropdown>
//                         </div>
//                     </div>

//                     {/* Main Content Area */}
//                     <div style={{ 
//                         flex: 1,
//                         display: 'flex',
//                         gap: '0',
//                         overflow: 'hidden'
//                     }}>
//                         {/* Left: ADS Groups */}
//                         <div style={{ 
//                             width: '30%',
//                             borderRight: 'none',
//                             display: 'flex',
//                             flexDirection: 'column'
//                         }}>
//                             <div style={{ 
//                                 padding: '15px 20px',
//                                 borderBottom: '1px solid #e5e7eb',
//                                 backgroundColor: 'white'
//                             }}>
//                                 <h3 style={{ 
//                                     margin: 0, 
//                                     fontSize: '14px', 
//                                     fontWeight: '600',
//                                     color: '#1e40af'
//                                 }}>
//                                     {t('usermanagement.listofadsgroups')}
//                                 </h3>
//                             </div>
//                             <div style={{ padding: '15px 20px', border: '1px solid #e5e7eb' }}>
//                                 <input
//                                     type="text"
//                                     placeholder={t('usermanagement.lookingfor')}
//                                     style={{
//                                         width: '100%',
//                                         padding: '8px 12px',
//                                         border: '1px solid #d1d5db',
//                                         borderRadius: '4px',
//                                         fontSize: '12px',
//                                         outline: 'none'
//                                     }}
//                                 />
//                             </div>
//                             <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
//                                 {adsData.connected ? (
//                                     adsData.adsGroups.map(group => (
//                                         <div
//                                             key={group}
//                                             onClick={() => handleADSGroupSelect(group)}
//                                             style={{
//                                                 padding: '12px 15px',
//                                                 cursor: 'pointer',
//                                                 backgroundColor: adsData.selectedADSGroup === group ? '#dbeafe' : 'white',
//                                                 borderRadius: '4px',
//                                                 marginBottom: '5px',
//                                                 fontSize: '12px',
//                                                 fontWeight: adsData.selectedADSGroup === group ? '600' : '400',
//                                                 color: adsData.selectedADSGroup === group ? '#1e40af' : '#374151',
//                                                 transition: 'all 0.2s',
//                                                 border: adsData.selectedADSGroup === group ? '1px solid #93c5fd' : '1px solid transparent'
//                                             }}
//                                             onMouseEnter={(e) => {
//                                                 if (adsData.selectedADSGroup !== group) {
//                                                     e.currentTarget.style.backgroundColor = '#f3f4f6';
//                                                 }
//                                             }}
//                                             onMouseLeave={(e) => {
//                                                 if (adsData.selectedADSGroup !== group) {
//                                                     e.currentTarget.style.backgroundColor = 'white';
//                                                 }
//                                             }}
//                                         >
//                                             {group}
//                                         </div>
//                                     ))
//                                 ) : (
//                                     <div style={{ 
//                                         padding: '40px 20px', 
//                                         textAlign: 'center', 
//                                         color: '#9ca3af',
//                                         fontSize: '12px'
//                                     }}>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Right: ADS Users */}
//                         <div style={{ 
//                             flex: 1,
//                             display: 'flex',
//                             flexDirection: 'column'
//                         }}>
//                             <div style={{ 
//                                 padding: '15px 20px',
//                                 borderBottom: '1px solid #e5e7eb',
//                                 backgroundColor: 'white',
//                                 display: 'flex',
//                                 justifyContent: 'space-between',
//                                 alignItems: 'center'
//                             }}>
//                                 <h3 style={{ 
//                                     margin: 0, 
//                                     fontSize: '14px', 
//                                     fontWeight: '600',
//                                     color: '#1e40af'
//                                 }}>
//                                     {t('usermanagement.listofadsusers')}
//                                 </h3>
//                                 <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
//                                     <label style={{ 
//                                         display: 'flex', 
//                                         alignItems: 'center', 
//                                         gap: '6px', 
//                                         fontSize: '12px',
//                                         cursor: 'pointer',
//                                         fontWeight: '500'
//                                     }}>
//                                         <input
//                                             type="checkbox"
//                                             checked={adsData.selectAll}
//                                             onChange={(e) => handleADSSelectAll(e.target.checked)}
//                                             style={{ cursor: 'pointer' }}
//                                         />
//                                         {t('usermanagement.selectall')}
//                                     </label>
//                                     <label style={{ 
//                                         display: 'flex', 
//                                         alignItems: 'center', 
//                                         gap: '6px', 
//                                         fontSize: '12px',
//                                         cursor: 'pointer',
//                                         fontWeight: '500'
//                                     }}>
//                                         <input
//                                             type="checkbox"
//                                             checked={adsData.approveAll}
//                                             onChange={(e) => handleADSApproveAll(e.target.checked)}
//                                             style={{ cursor: 'pointer' }}
//                                         />
//                                         {t('usermanagement.approveall')}
//                                     </label>
//                                     <button
//                                         onClick={handleADSRefresh}
//                                         style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '6px',
//                                             padding: '6px 12px',
//                                             fontSize: '12px',
//                                             fontWeight: 'bold',
//                                             borderRadius: '4px',
//                                             border: 'none',
//                                             cursor: 'pointer',
//                                             backgroundColor: '#f1f5f9',
//                                             color: '#2883FE'
//                                         }}
//                                     >
//                                         <RefreshCw style={{ width: '14px', height: '14px' }} />
//                                         {t('button.refresh')}
//                                     </button>
//                                 </div>
//                             </div>
                            
//                             <div style={{ flex: 1, overflow: 'auto' }}>
//                                 <table style={{ 
//                                     width: '100%', 
//                                     borderCollapse: 'collapse',
//                                     fontSize: '14px'
//                                 }}>
//                                     <thead style={{ 
//                                         position: 'sticky', 
//                                         top: 0, 
//                                         backgroundColor: '#f9fafb',
//                                         zIndex: 1
//                                     }}>
//                                         <tr>
//                                             <th style={{ 
//                                                 padding: '12px 20px', 
//                                                 textAlign: 'left', 
//                                                 borderBottom: '2px solid #e5e7eb',
//                                                 fontWeight: '600',
//                                                 color: '#374151',
//                                                 width: '15%'
//                                             }}>
//                                                 {t('usermanagement.import')}
//                                             </th>
//                                             <th style={{ 
//                                                 padding: '12px 20px', 
//                                                 textAlign: 'left', 
//                                                 borderBottom: '2px solid #e5e7eb',
//                                                 fontWeight: '600',
//                                                 color: '#374151'
//                                             }}>
//                                                 {t('usermanagement.username')}
//                                             </th>
//                                             <th style={{ 
//                                                 padding: '12px 20px', 
//                                                 textAlign: 'left', 
//                                                 borderBottom: '2px solid #e5e7eb',
//                                                 fontWeight: '600',
//                                                 color: '#374151',
//                                                 width: '15%'
//                                             }}>
//                                                 {t('usermanagement.approve')}
//                                             </th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {adsData.adsUsers.length > 0 ? (
//                                             adsData.adsUsers.map((user, index) => (
//                                                 <tr 
//                                                     key={index} 
//                                                     style={{ 
//                                                         borderBottom: '1px solid #f3f4f6',
//                                                         backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
//                                                     }}
//                                                 >
//                                                     <td style={{ padding: '12px 20px', textAlign: 'center' }}>
//                                                         <input
//                                                             type="checkbox"
//                                                             checked={user.selected || false}
//                                                             onChange={(e) => handleADSUserSelect(index, 'selected', e.target.checked)}
//                                                             style={{ cursor: 'pointer' }}
//                                                         />
//                                                     </td>
//                                                     <td style={{ padding: '12px 20px', color: '#374151' }}>
//                                                         {user.username}
//                                                     </td>
//                                                     <td style={{ padding: '12px 20px', textAlign: 'center' }}>
//                                                         <input
//                                                             type="checkbox"
//                                                             checked={user.approved || false}
//                                                             onChange={(e) => handleADSUserSelect(index, 'approved', e.target.checked)}
//                                                             style={{ cursor: 'pointer' }}
//                                                         />
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td 
//                                                     colSpan="3" 
//                                                     style={{ 
//                                                         padding: '60px 20px', 
//                                                         textAlign: 'center', 
//                                                         color: '#9ca3af',
//                                                         fontSize: '14px'
//                                                     }}
//                                                 >
//                                                     {adsData.connected 
//                                                         ? t('usermanagement.nodatatodisplay') 
//                                                         : t('usermanagement.nodata')}
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Footer Buttons */}
//                     <div style={{ 
//                         padding: '15px 20px',
//                         borderTop: '2px solid #e5e7eb',
//                         display: 'flex',
//                         justifyContent: 'flex-end',
//                         gap: '10px',
//                         backgroundColor: 'white'
//                     }}>
//                         <button
//                             onClick={handleImportADSSubmit}
//                             style={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px',
//                                 padding: '8px',
//                                 fontSize: '12px',
//                                 fontWeight: '600',
//                                 color: 'white',
//                                 backgroundColor: '#2883FE',
//                                 border: 'none',
//                                 borderRadius: '4px',
//                                 cursor: 'pointer'
//                             }}
//                         >
//                             <Upload style={{ width: '14px', height: '14px' }} />
//                             {t('usermanagement.import')}
//                         </button>
//                         <button
//                             onClick={handleCloseImportADS}
//                             style={{
//                                 padding: '8px',
//                                 fontSize: '12px',
//                                 fontWeight: '600',
//                                 color: '#374151',
//                                 backgroundColor: 'white',
//                                 border: '1px solid #d1d5db',
//                                 borderRadius: '4px',
//                                 cursor: 'pointer'
//                             }}
//                         >
//                             {t('usermanagement.close')}
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <>
//                     {/* Header with Actions */}
//                     <div style={{ 
//                         display: 'flex', 
//                         justifyContent: 'space-between', 
//                         alignItems: 'center',
//                         padding: '10px',
//                         background: 'white',
//                         borderBottom: '1px solid #e5e7eb'
//                     }}>
//                         {/* Group Selection */}
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                             <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
//                                 {t('usermanagement.groupname')}:
//                             </label>
//                             <AnimatedDropdown
//                                 value={selectedGroup}
//                                 onChange={handleGroupChange}
//                                 options={userGroups.map(group => ({
//                                     value: group.L01UserGroupID,
//                                     label: group.L01UserGroupName
//                                 }))}
//                             />
//                         </div>

//                         {/* Action Buttons */}
//                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
//                             <ActionButton icon={UserPlus} label={t('button.add')} onClick={handleAddClick} />
//                             <ActionButton icon={Edit} label={t('usermanagement.edit')} onClick={handleEditClick} />
//                             <ActionButton icon={Ban} label={t('usermanagement.retire')} onClick={handleRetireClick} />
//                             <ActionButton icon={Power} label={t('usermanagement.resetpassword')} onClick={handleResetPasswordClick} />
//                             <ActionButton icon={Unlock} label={t('usermanagement.unlock')} onClick={handleUnlockClick} />
//                             <ActionButton icon={UserX} label={t('usermanagement.activedeactive')} onClick={handleActiveDeactiveClick} />
//                             <ActionButton icon={ThumbsUp} label={t('usermanagement.approve')} onClick={handleApproveClick} />
//                             <ActionButton icon={Server} label={t('usermanagement.importads')} onClick={handleImportADSClick} />
//                             <ActionButton icon={Download} label={t('usermanagement.export')} onClick={handleExportClick} />
//                             <ActionButton icon={Upload} label={t('usermanagement.import')} onClick={handleImportClick} />
//                         </div>
//                     </div>

//                     {/* Main Grid Layout */}
//                     <div style={{ flex: 1 }}>
//                         <GridLayout
//                             columns={columns}
//                             data={userData}
//                             renderDetailPanel={renderUserDetail}
//                             onRowClick={handleRowSelect}
//                             searchable={false}
//                             selectable={true}
//                             hidePagination={false}
//                         />
//                     </div>
//                 </>
//             )}

//             {/* Add/Edit User Popup */}
//             {(activePopup === "adduser" || activePopup === "edituser") && (
//                 <CustomPopup
//                     isOpen={true}
//                     onClose={handlePopupClose}
//                     title={activePopup === "adduser" ? t('button.add') : t('usermanagement.edit')}
//                     size="sm"
//                     content={
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//                             {/* Login ID */}
//                             <div>
//                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
//                                     {t('usermanagement.loginid')} <span style={{ color: '#ef4444' }}>*</span>
//                                 </label>
//                                 <AnimatedInput
//                                     type="text"
//                                     value={formData.sUsername}
//                                     onChange={(e) => handleFormChange('sUsername', e.target.value)}
//                                     disabled={activePopup === "edituser"}
//                                     maxLength={30}
//                                     style={{
//                                         width: '80%',
//                                         padding: '8px 12px',
//                                         fontSize: '14px',
//                                         border: formErrors.sUsername ? '1px solid #ef4444' : '1px solid #d1d5db',
//                                         borderRadius: '4px',
//                                         outline: 'none',
//                                         backgroundColor: activePopup === "edituser" ? '#f9fafb' : 'white'
//                                     }}
//                                 />
//                                 {formErrors.sUsername && (
//                                     <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
//                                         {formErrors.sUsername}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Full Name */}
//                             <div>
//                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
//                                     {t('usermanagement.fullname')} <span style={{ color: '#ef4444' }}>*</span>
//                                 </label>
//                                 <AnimatedInput
//                                     type="text"
//                                     value={formData.sUserFullname}
//                                     onChange={(e) => handleFormChange('sUserFullname', e.target.value)}
//                                     maxLength={100}
                                   
//                                 />
//                                 {formErrors.sUserFullname && (
//                                     <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
//                                         {formErrors.sUserFullname}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Email ID */}
//                             <div>
//                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
//                                     {t('usermanagement.emailid')}
//                                 </label>
//                                 <AnimatedInput
//                                     type="email"
//                                     value={formData.sUserMailID}
//                                     onChange={(e) => handleFormChange('sUserMailID', e.target.value)}
                                  
//                                 />
//                                 {formErrors.sUserMailID && (
//                                     <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
//                                         {formErrors.sUserMailID}
//                                     </div>
//                                 )}
//                                 <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
//                                     {t('usermanagement.noteforgotpassword')}
//                                 </div>
//                             </div>

//                             {/* Profile Image */}
//                             <div>
//                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
//                                     {t('usermanagement.profileimage')}
//                                 </label>
//                                 <input style={{fontSize:"12px"}}
//                                     type="file"
//                                     accept="image/gif,image/png,image/jpg,image/jpeg"
//                                     onChange={handleProfileImageChange}
//                                                                    />
//                                 <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
//                                     {t('usermanagement.noteuserprofileupload')}
//                                 </div>
//                             </div>

//                             {/* Group Name */}
//                             <div>
//                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
//                                     {t('usermanagement.groupname')} <span style={{ color: '#ef4444' }}>*</span>
//                                 </label>
//                                 <AnimatedDropdown
//                                     value={formData.sUserGroupID}
//                                     onChange={(e) => handleFormChange('sUserGroupID', e.target.value)}
//                                     style={{
//                                         width: '100%',
//                                         padding: '8px 12px',
//                                         fontSize: '14px',
//                                         border: formErrors.sUserGroupID ? '1px solid #ef4444' : '1px solid #d1d5db',
//                                         borderRadius: '4px',
//                                         outline: 'none'
//                                     }}
//                                 >
//                                     <option value="">{t('usermanagement.selectgroup')}</option>
//                                     {userGroups.map(group => (
//                                         <option key={group.L01UserGroupID} value={group.L01UserGroupID}>
//                                             {group.L01UserGroupName}
//                                         </option>
//                                     ))}
//                                 </AnimatedDropdown>
//                                 {formErrors.sUserGroupID && (
//                                     <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
//                                         {formErrors.sUserGroupID}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Default Login Site */}
//                             <div>
//                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
//                                     {t('usermanagement.defaultloginsite')}
//                                 </label>
//                                 <AnimatedDropdown
//                                     value={formData.sUserDefaultSiteCode}
//                                     onChange={(e) => handleFormChange('sUserDefaultSiteCode', e.target.value)}
//                                     style={{
//                                         width: '100%',
//                                         padding: '8px 12px',
//                                         fontSize: '14px',
//                                         border: '1px solid #d1d5db',
//                                         borderRadius: '4px',
//                                         outline: 'none'
//                                     }}
//                                 >
//                                     <option value="">{t('usermanagement.selectsite')}</option>
//                                     {mockSites.map(site => (
//                                         <option key={site.SiteCode} value={site.SiteCode}>
//                                             {site.SiteName}
//                                         </option>
//                                     ))}
//                                 </AnimatedDropdown>
//                             </div>

//                             {/* Checkboxes */}
//                             <div style={{ display: 'flex', gap: '30px' }}>
//                                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
//                                     <input
//                                         type="checkbox"
//                                         checked={formData.sUserStatus === "A"}
//                                         onChange={(e) => handleFormChange('sUserStatus', e.target.checked ? "A" : "UA")}
//                                         disabled={activePopup === "edituser"}
//                                         style={{ cursor: activePopup === "edituser" ? 'not-allowed' : 'pointer' }}
//                                     />
//                                     <span style={{ fontSize: '14px' }}>{t('usermanagement.approve')}</span>
//                                 </label>
                                
//                             </div>

//                             {/* Form Buttons */}
//                             <div style={{ 
//                                 display: 'flex', 
//                                 justifyContent: 'flex-end', 
//                                 gap: '12px',
//                                 paddingTop: '10px',
//                                 marginTop: '5px',
//                             }}>
//                                 <button
//                                     onClick={handleSubmit}
//                                     style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '3px',
//                                         padding: '8px ',
//                                         fontSize: '12px',
//                                         fontWeight: 600,
//                                         color: 'white',
//                                         backgroundColor: '#3b82f6',
//                                         border: 'none',
//                                         borderRadius: '4px',
//                                         cursor: 'pointer'
//                                     }}
//                                 >
//                                     <Check style={{ width: '14px', height: '14px' }} /> {t('usermanagement.submit')}
//                                 </button>
//                                 <button
//                                     onClick={handlePopupClose}
//                                     style={{
//                                         padding: '8px ',
//                                         fontSize: '12px',
//                                         fontWeight: 600,
//                                         color: '#374151',
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
//                 />
//             )}

//             {/* Reset Password Popup */}
//             {activePopup === "resetpassword" && (
//                 <CustomPopup
//                     isOpen={true}
//                     onClose={handlePopupClose}
//                     title={t('usermanagement.resetpassword')}
//                     size="md"
//                     content={
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                             <div style={{ marginBottom: '10px' }}>
//                                 <p style={{ fontSize: '14px', color: '#374151' }}>
//                                     {t('usermanagement.resetpasswordfor')}: <strong>{selectedUser?.L02UserName}</strong>
//                                 </p>
//                             </div>
                            
//                             {/* New Password */}
//                             <div>
//                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
//                                     {t('usermanagement.newpassword')} <span style={{ color: '#ef4444' }}>*</span>
//                                 </label>
//                                 <div style={{ position: 'relative' }}>
//                                     <input
//                                         type={resetPasswordData.showPassword ? "text" : "password"}
//                                         value={resetPasswordData.newPassword}
//                                         onChange={(e) => handleResetPasswordChange('newPassword', e.target.value)}
//                                         style={{
//                                             width: '100%',
//                                             padding: '8px 40px 8px 12px',
//                                             fontSize: '14px',
//                                             border: '1px solid #d1d5db',
//                                             borderRadius: '4px',
//                                             outline: 'none'
//                                         }}
//                                         placeholder={t('usermanagement.enternewpassword')}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={handleTogglePasswordVisibility}
//                                         style={{
//                                             position: 'absolute',
//                                             right: '10px',
//                                             top: '50%',
//                                             transform: 'translateY(-50%)',
//                                             background: 'none',
//                                             border: 'none',
//                                             cursor: 'pointer',
//                                             color: '#6b7280'
//                                         }}
//                                     >
//                                         {resetPasswordData.showPassword ? (
//                                             <EyeOff size={18} />
//                                         ) : (
//                                             <Eye size={18} />
//                                         )}
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Confirm Password */}
//                             <div>
//                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
//                                     {t('usermanagement.confirmpassword')} <span style={{ color: '#ef4444' }}>*</span>
//                                 </label>
//                                 <input
//                                     type={resetPasswordData.showPassword ? "text" : "password"}
//                                     value={resetPasswordData.confirmPassword}
//                                     onChange={(e) => handleResetPasswordChange('confirmPassword', e.target.value)}
//                                     style={{
//                                         width: '100%',
//                                         padding: '8px 12px',
//                                         fontSize: '14px',
//                                         border: '1px solid #d1d5db',
//                                         borderRadius: '4px',
//                                         outline: 'none'
//                                     }}
//                                     placeholder={t('usermanagement.confirmnewpassword')}
//                                 />
//                             </div>

//                             <div style={{ 
//                                 fontSize: '12px', 
//                                 color: '#6b7280',
//                                 padding: '8px',
//                                 backgroundColor: '#f9fafb',
//                                 borderRadius: '4px'
//                             }}>
//                                 {t('usermanagement.passwordrequirements')}
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
//                                     onClick={handleResetPasswordSubmit}
//                                     style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '8px',
//                                         padding: '8px 16px',
//                                         fontSize: '14px',
//                                         fontWeight: 600,
//                                         color: 'white',
//                                         backgroundColor: '#3b82f6',
//                                         border: 'none',
//                                         borderRadius: '4px',
//                                         cursor: 'pointer'
//                                     }}
//                                 >
//                                     <Check style={{ width: '16px', height: '16px' }} /> {t('usermanagement.reset')}
//                                 </button>
//                                 <button
//                                     onClick={handlePopupClose}
//                                     style={{
//                                         padding: '8px 16px',
//                                         fontSize: '14px',
//                                         fontWeight: 600,
//                                         color: '#374151',
//                                         backgroundColor: 'white',
//                                         border: '1px solid #d1d5db',
//                                         borderRadius: '4px',
//                                         cursor: 'pointer'
//                                     }}
//                                 >
//                                     {t('usermanagement.cancel')}
//                                 </button>
//                             </div>
//                         </div>
//                     }
//                 />
//             )}
//         </div>
//     );
// };

// export default UserMaster;



























































import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  UserPlus, Edit, Ban, Power, Unlock, UserX, ThumbsUp, 
  Server, Download, Upload, Plus, Users, Check, Eye, EyeOff, RefreshCw 
} from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';

const UserMaster = () => {
    const [userData, setUserData] = useState([]);
    const [originalUserData, setOriginalUserData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(0);
    const [loading, setLoading] = useState(true);
    const [userGroups, setUserGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });
    const [activePopup, setActivePopup] = useState(null);
    const [showImportADS, setShowImportADS] = useState(false);
    const [formData, setFormData] = useState({
        sUsername: "",
        sUserFullname: "",
        sUserMailID: "",
        sUserGroupID: "",
        sUserDefaultSiteCode: "",
        sUserStatus: "UA",
        nLabsheetLicense: 0,
        profileImage: null
    });
    const [formErrors, setFormErrors] = useState({});
    const [resetPasswordData, setResetPasswordData] = useState({
        newPassword: "",
        confirmPassword: "",
        showPassword: false
    });
    const [adsData, setAdsData] = useState({
        domain: "",
        username: "",
        password: "",
        selectedGroup: "",
        connected: false,
        adsGroups: ["Engineering", "Management", "QA Team", "Development", "Sales"],
        adsUsers: [],
        selectedADSGroup: "",
        selectAll: false,
        approveAll: false
    });
    const { t } = useTranslation();
    const fileInputRef = useRef(null);

    // Mock data for user master
    const mockUserData = [
        {
            id: 1,
            L02UserID: "U-001",
            L02UserName: "new1",
            L02UserFullName: "new1",
            UserGroupName: "Administrator",
            UserStatus: "Retired",
            L02EmailID: "new1@example.com",
            LastLoggedOn: "2024-01-20 14:30",
            PassWordExpiryDate: "2024-04-20",
            CreatedBy: "System",
            CreatedOn: "2024-01-01 09:00",
            ModifiedBy: "Admin",
            ModifiedOn: "2024-01-15 11:00",
            sUserDomainName: "SDMS",
            SiteName: "Main Lab",
            isLocked: false,
            isActive: false
        },
        {
            id: 2,
            L02UserID: "U-002",
            L02UserName: "new",
            L02UserFullName: "new",
            UserGroupName: "Administrator",
            UserStatus: "Deactive",
            L02EmailID: "new@example.com",
            LastLoggedOn: "2024-01-18 10:15",
            PassWordExpiryDate: "2024-04-18",
            CreatedBy: "Admin",
            CreatedOn: "2024-01-10 10:00",
            ModifiedBy: "Admin",
            ModifiedOn: "2024-01-12 14:00",
            sUserDomainName: "Corporate",
            SiteName: "Lab A",
            isLocked: false,
            isActive: false
        }
    ];

    // Mock user groups
    const mockUserGroups = [
        { L01UserGroupID: "UG-001", L01UserGroupName: "Administrator" },
        { L01UserGroupID: "UG-002", L01UserGroupName: "Lab Technician" },
    ];

    // Mock sites
    const mockSites = [
        { SiteCode: "SITE-001", SiteName: "Main Lab" },
        { SiteCode: "SITE-002", SiteName: "Lab A" },
    ];

    // Mock ADS users for different groups
    const mockADSUsersByGroup = {
        "Engineering": [
            { username: "john.doe", approved: false },
            { username: "jane.smith", approved: true },
            { username: "mike.wilson", approved: false }
        ],
        "Management": [
            { username: "sarah.johnson", approved: true },
            { username: "robert.brown", approved: false }
        ],
    };

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setUserData(mockUserData);
            setOriginalUserData(mockUserData);
            setUserGroups(mockUserGroups);
            if (mockUserGroups.length > 0) {
                setSelectedGroup(mockUserGroups[0].L01UserGroupID);
            }
            setLoading(false);
        }, 500);
    }, []);

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

    const handleRowSelect = useCallback((row) => {
        setSelectedUser(row);
        setSelectedRowId(row.id);
    }, []);

    const handleGroupChange = useCallback((value) => {
        setSelectedGroup(value);
        setLoading(true);
        setTimeout(() => {
            if (value === "UG-001") {
                setUserData(originalUserData.filter(user => user.UserGroupName === "Administrator"));
            } else if (value === "UG-002") {
                setUserData(originalUserData.filter(user => user.UserGroupName === "Lab Technician"));
            } else if (value === "UG-003") {
                setUserData(originalUserData.filter(user => user.UserGroupName === "View Only"));
            } else {
                setUserData(originalUserData);
            }
            setSelectedUser(null);
            setSelectedRowId(null);
            setLoading(false);
        }, 300);
    }, [originalUserData]);

    // ADD USER FUNCTIONALITY
    const handleAddClick = useCallback(() => {
        setFormData({
            sUsername: "",
            sUserFullname: "",
            sUserMailID: "",
            sUserGroupID: selectedGroup || "",
            sUserDefaultSiteCode: "",
            sUserStatus: "UA",
            nLabsheetLicense: 0,
            profileImage: null
        });
        setFormErrors({});
        setActivePopup("adduser");
    }, [selectedGroup]);

    // EDIT USER FUNCTIONALITY
    const handleEditClick = useCallback(() => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
            showInfoDialog(t('usermanagement.adminusercantedit'), "warning");
            return;
        }
        
        const userGroup = userGroups.find(g => g.L01UserGroupName === selectedUser.UserGroupName);
        setFormData({
            sUsername: selectedUser.L02UserName,
            sUserFullname: selectedUser.L02UserFullName,
            sUserMailID: selectedUser.L02EmailID || "",
            sUserGroupID: userGroup?.L01UserGroupID || "",
            sUserDefaultSiteCode: "",
            sUserStatus: selectedUser.UserStatus === "Unapproved" ? "UA" : "A",
            nLabsheetLicense: 0,
            profileImage: null
        });
        setFormErrors({});
        setActivePopup("edituser");
    }, [selectedUser, userGroups, showInfoDialog, t]);

    // RETIRE USER FUNCTIONALITY
    const handleRetireClick = useCallback(() => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
            showInfoDialog(t('usermanagement.adminusercantberetired'), "warning");
            return;
        }
        
        if (selectedUser.UserStatus === "Retired") {
            showInfoDialog(t('usermanagement.retiremessage'), "warning");
            return;
        }
        
        const confirmRetire = window.confirm(t('usermanagement.confirametionretire'));
        if (confirmRetire) {
            const updatedData = userData.map(user => {
                if (user.id === selectedUser.id) {
                    return {
                        ...user,
                        UserStatus: "Retired",
                        isActive: false,
                        ModifiedBy: t('usermanagement.currentuser'),
                        ModifiedOn: new Date().toISOString()
                    };
                }
                return user;
            });
            
            setUserData(updatedData);
            setOriginalUserData(updatedData);
            setSelectedUser(null);
            setSelectedRowId(null);
            showInfoDialog(t('usermanagement.userretiredsuccessfully'), "success");
        }
    }, [selectedUser, userData, showInfoDialog, t]);

    // RESET PASSWORD FUNCTIONALITY
    const handleResetPasswordClick = useCallback(() => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
            showInfoDialog(t('usermanagement.adminusercantreset'), "warning");
            return;
        }
        
        setResetPasswordData({
            newPassword: "",
            confirmPassword: "",
            showPassword: false
        });
        setActivePopup("resetpassword");
    }, [selectedUser, showInfoDialog, t]);

    // UNLOCK USER FUNCTIONALITY
    const handleUnlockClick = useCallback(() => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
            showInfoDialog(t('usermanagement.adminusercantbelock'), "warning");
            return;
        }
        
        if (selectedUser.UserStatus !== "Locked") {
            showInfoDialog(t('usermanagement.userlockmessage'), "warning");
            return;
        }
        
        const updatedData = userData.map(user => {
            if (user.id === selectedUser.id) {
                return {
                    ...user,
                    UserStatus: "Active",
                    isLocked: false,
                    ModifiedBy: t('usermanagement.currentuser'),
                    ModifiedOn: new Date().toISOString()
                };
            }
            return user;
        });
        
        setUserData(updatedData);
        setOriginalUserData(updatedData);
        setSelectedUser(updatedData.find(user => user.id === selectedUser.id));
        showInfoDialog(t('usermanagement.userunlockedsuccessfully'), "success");
    }, [selectedUser, userData, showInfoDialog, t]);

    // ACTIVE/DEACTIVE USER FUNCTIONALITY
    const handleActiveDeactiveClick = useCallback(() => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        if (selectedUser.L02UserName === "admin" || selectedUser.L02UserName === "Administrator" || selectedUser.L02UserName === "System") {
            showInfoDialog(t('usermanagement.adminusercantbeactivedeactivate'), "warning");
            return;
        }
        
        if (selectedUser.UserStatus === "Retired") {
            showInfoDialog(t('usermanagement.userretiredsocantactive'), "warning");
            return;
        }
        
        const newStatus = selectedUser.UserStatus === "Active" ? "Deactive" : "Active";
        const confirmAction = window.confirm(
            t('usermanagement.confiramationactdeactforuser') + " " + selectedUser.L02UserName + " to " + newStatus + "?"
        );
        
        if (confirmAction) {
            const updatedData = userData.map(user => {
                if (user.id === selectedUser.id) {
                    return {
                        ...user,
                        UserStatus: newStatus,
                        isActive: newStatus === "Active",
                        ModifiedBy: t('usermanagement.currentuser'),
                        ModifiedOn: new Date().toISOString()
                    };
                }
                return user;
            });
            
            setUserData(updatedData);
            setOriginalUserData(updatedData);
            setSelectedUser(updatedData.find(user => user.id === selectedUser.id));
            showInfoDialog(selectedUser.L02UserName + " " + (newStatus === "Active" ? t('usermanagement.activatedsuccessfully') : t('usermanagement.deactivatedsuccessfully')), "success");
        }
    }, [selectedUser, userData, showInfoDialog, t]);

    // APPROVE USER FUNCTIONALITY
    const handleApproveClick = useCallback(() => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        if (selectedUser.UserStatus !== "Unapproved") {
            showInfoDialog(t('usermanagement.userselectedis') + " " + selectedUser.UserStatus.toLowerCase() + ", " + t('usermanagement.socantapprove'), "warning");
            return;
        }
        
        const confirmApprove = window.confirm(t('usermanagement.confirmationapprove'));
        if (confirmApprove) {
            const updatedData = userData.map(user => {
                if (user.id === selectedUser.id) {
                    return {
                        ...user,
                        UserStatus: "Active",
                        isActive: true,
                        ModifiedBy: t('usermanagement.currentuser'),
                        ModifiedOn: new Date().toISOString()
                    };
                }
                return user;
            });
            
            setUserData(updatedData);
            setOriginalUserData(updatedData);
            setSelectedUser(updatedData.find(user => user.id === selectedUser.id));
            showInfoDialog(t('usermanagement.userapprovedsuccessfully'), "success");
        }
    }, [selectedUser, userData, showInfoDialog, t]);

    // IMPORT ADS FUNCTIONALITY
    const handleImportADSClick = useCallback(() => {
        setAdsData({
            domain: "",
            username: "",
            password: "",
            selectedGroup: "",
            connected: false,
            adsGroups: ["Engineering", "Management", "QA Team", "Development", "Sales"],
            adsUsers: [],
            selectedADSGroup: "",
            selectAll: false,
            approveAll: false
        });
        setShowImportADS(true);
    }, []);

    // ADS Connect
    const handleADSConnect = useCallback(() => {
        if (!adsData.domain || !adsData.username || !adsData.password) {
            showInfoDialog(t('usermanagement.fillallfields'), "warning");
            return;
        }
        
        setAdsData(prev => ({
            ...prev,
            connected: true
        }));
        showInfoDialog(t('usermanagement.adsconnectedsuccessfully'), "success");
    }, [adsData, showInfoDialog, t]);

    // ADS Group Selection
    const handleADSGroupSelect = useCallback((group) => {
        const users = mockADSUsersByGroup[group] || [];
        setAdsData(prev => ({
            ...prev,
            selectedADSGroup: group,
            adsUsers: users.map(u => ({ ...u, selected: false })),
            selectAll: false,
            approveAll: false
        }));
    }, []);

    // ADS Select All
    const handleADSSelectAll = useCallback((checked) => {
        setAdsData(prev => ({
            ...prev,
            selectAll: checked,
            adsUsers: prev.adsUsers.map(u => ({ ...u, selected: checked }))
        }));
    }, []);

    // ADS Approve All
    const handleADSApproveAll = useCallback((checked) => {
        setAdsData(prev => ({
            ...prev,
            approveAll: checked,
            adsUsers: prev.adsUsers.map(u => ({ ...u, approved: checked }))
        }));
    }, []);

    // ADS User Selection
    const handleADSUserSelect = useCallback((index, field, value) => {
        setAdsData(prev => ({
            ...prev,
            adsUsers: prev.adsUsers.map((u, i) => 
                i === index ? { ...u, [field]: value } : u
            )
        }));
    }, []);

    // ADS Refresh
    const handleADSRefresh = useCallback(() => {
        if (adsData.selectedADSGroup) {
            const users = mockADSUsersByGroup[adsData.selectedADSGroup] || [];
            setAdsData(prev => ({
                ...prev,
                adsUsers: users.map(u => ({ ...u, selected: false }))
            }));
            showInfoDialog(t('usermanagement.adsusersrefreshed'), "success");
        }
    }, [adsData.selectedADSGroup, showInfoDialog, t]);

    // ADS Import Submit
    const handleImportADSSubmit = useCallback(() => {
        if (!adsData.connected) {
            showInfoDialog(t('usermanagement.pleaseconnectadsfirst'), "warning");
            return;
        }

        const selectedUsers = adsData.adsUsers.filter(u => u.selected);
        if (selectedUsers.length === 0) {
            showInfoDialog(t('usermanagement.selectuserstoimport'), "warning");
            return;
        }

        const importedUsers = selectedUsers.map((user, index) => ({
            id: originalUserData.length + index + 1,
            L02UserID: `ADS-${Date.now()}-${index}`,
            L02UserName: user.username,
            L02UserFullName: user.username.replace('.', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            UserGroupName: userGroups.find(g => g.L01UserGroupID === adsData.selectedGroup)?.L01UserGroupName || "Administrator",
            UserStatus: user.approved ? "Active" : "Unapproved",
            L02EmailID: `${user.username}@company.com`,
            LastLoggedOn: "-",
            PassWordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            CreatedBy: "ADS Import",
            CreatedOn: new Date().toISOString(),
            ModifiedBy: "ADS Import",
            ModifiedOn: new Date().toISOString(),
            sUserDomainName: adsData.domain || "ADS Domain",
            SiteName: "Default Site",
            isLocked: false,
            isActive: user.approved
        }));

        const updatedData = [...originalUserData, ...importedUsers];
        setUserData(updatedData);
        setOriginalUserData(updatedData);
        setShowImportADS(false);
        showInfoDialog(`${importedUsers.length} ` + t('usermanagement.adsusersimportedsuccessfully'), "success");
    }, [adsData, originalUserData, userGroups, showInfoDialog, t]);

    // EXPORT FUNCTIONALITY
    const handleExportClick = useCallback(() => {
        if (userData.length === 0) {
            showInfoDialog(t('usermanagement.nodataexport'), "warning");
            return;
        }
        
        const headers = ['Username', 'Profile Name', 'User Group', 'Status', 'Email'];
        const csvContent = [
            headers.join(','),
            ...userData.map(user => [
                user.L02UserName,
                user.L02UserFullName,
                user.UserGroupName,
                user.UserStatus,
                user.L02EmailID
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${selectedGroup}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showInfoDialog(t('usermanagement.exportsuccess'), "success");
    }, [userData, selectedGroup, showInfoDialog, t]);

    // IMPORT FUNCTIONALITY
    const handleImportClick = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    const handleFileImport = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.csv')) {
            showInfoDialog(t('usermanagement.onlycsvfiles'), "warning");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                const lines = content.split('\n');
                
                const importedUsers = lines.slice(1)
                    .filter(line => line.trim())
                    .map((line, index) => {
                        const values = line.split(',');
                        return {
                            id: originalUserData.length + index + 1,
                            L02UserID: `IMP-${Date.now()}-${index}`,
                            L02UserName: values[0] || `imported${index}`,
                            L02UserFullName: values[1] || `Imported User ${index}`,
                            UserGroupName: values[2] || "Imported",
                            UserStatus: "Unapproved",
                            L02EmailID: values[4] || "",
                            LastLoggedOn: "-",
                            PassWordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            CreatedBy: t('usermanagement.import'),
                            CreatedOn: new Date().toISOString(),
                            ModifiedBy: t('usermanagement.import'),
                            ModifiedOn: new Date().toISOString(),
                            sUserDomainName: "Imported",
                            SiteName: "Default",
                            isLocked: false,
                            isActive: false
                        };
                    });
                
                const updatedData = [...originalUserData, ...importedUsers];
                setUserData(updatedData);
                setOriginalUserData(updatedData);
                showInfoDialog(`${importedUsers.length} ` + t('usermanagement.usersimportedsuccessfully'), "success");
            } catch (error) {
                showInfoDialog(t('usermanagement.importfailed'), "error");
            }
        };
        
        reader.readAsText(file);
        e.target.value = '';
    }, [originalUserData, showInfoDialog, t]);

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

    const handleResetPasswordChange = useCallback((field, value) => {
        setResetPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleTogglePasswordVisibility = useCallback(() => {
        setResetPasswordData(prev => ({
            ...prev,
            showPassword: !prev.showPassword
        }));
    }, []);

    const handleProfileImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                showInfoDialog(t('usermanagement.noteuserprofileupload'), "warning");
                return;
            }
            
            const validTypes = ['image/gif', 'image/png', 'image/jpg', 'image/jpeg'];
            if (!validTypes.includes(file.type)) {
                showInfoDialog(t('usermanagement.noteuserprofileupload'), "warning");
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                profileImage: file
            }));
        }
    }, [showInfoDialog, t]);

    const validateForm = useCallback(() => {
        const errors = {};
        
        if (!formData.sUsername.trim()) {
            errors.sUsername = t('usermanagement.loginid') + " " + t('usermanagement.isrequired');
        }
        
        if (!formData.sUserFullname.trim()) {
            errors.sUserFullname = t('usermanagement.fullname') + " " + t('usermanagement.isrequired');
        }
        
        if (!formData.sUserGroupID.trim()) {
            errors.sUserGroupID = t('usermanagement.groupname') + " " + t('usermanagement.isrequired');
        }
        
        if (formData.sUserMailID && !/\S+@\S+\.\S+/.test(formData.sUserMailID)) {
            errors.sUserMailID = t('usermanagement.emailid') + " " + t('usermanagement.isinvalid');
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData, t]);

    const validateResetPassword = useCallback(() => {
        const errors = {};
        
        if (!resetPasswordData.newPassword.trim()) {
            errors.newPassword = t('usermanagement.newpasswordrequired');
        } else if (resetPasswordData.newPassword.length < 8) {
            errors.newPassword = t('usermanagement.passwordminlength');
        }
        
        if (!resetPasswordData.confirmPassword.trim()) {
            errors.confirmPassword = t('usermanagement.confirmpasswordrequired');
        } else if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            errors.confirmPassword = t('usermanagement.passwordsdonotmatch');
        }
        
        return errors;
    }, [resetPasswordData, t]);

    const handleSubmit = useCallback(() => {
        if (!validateForm()) {
            return;
        }
        
        try {
            const isEdit = activePopup === "edituser";
            const userGroup = userGroups.find(g => g.L01UserGroupID === formData.sUserGroupID);
            
            if (isEdit) {
                const updatedData = userData.map(user => {
                    if (user.id === selectedUser.id) {
                        return {
                            ...user,
                            L02UserName: formData.sUsername,
                            L02UserFullName: formData.sUserFullname,
                            L02EmailID: formData.sUserMailID,
                            UserGroupName: userGroup?.L01UserGroupName || selectedUser.UserGroupName,
                            UserStatus: formData.sUserStatus === "A" ? "Active" : "Unapproved",
                            ModifiedBy: t('usermanagement.currentuser'),
                            ModifiedOn: new Date().toISOString()
                        };
                    }
                    return user;
                });
                
                setUserData(updatedData);
                setOriginalUserData(updatedData);
                setSelectedUser(updatedData.find(user => user.id === selectedUser.id));
                showInfoDialog(t('usermanagement.userupdatedsuccessfully'), "success");
            } else {
                const newUser = {
                    id: originalUserData.length + 1,
                    L02UserID: `U-${Date.now()}`,
                    L02UserName: formData.sUsername,
                    L02UserFullName: formData.sUserFullname,
                    UserGroupName: userGroup?.L01UserGroupName || "User",
                    UserStatus: formData.sUserStatus === "A" ? "Active" : "Unapproved",
                    L02EmailID: formData.sUserMailID,
                    LastLoggedOn: "-",
                    PassWordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    CreatedBy: t('usermanagement.currentuser'),
                    CreatedOn: new Date().toISOString(),
                    ModifiedBy: t('usermanagement.currentuser'),
                    ModifiedOn: new Date().toISOString(),
                    sUserDomainName: "Default",
                    SiteName: mockSites.find(s => s.SiteCode === formData.sUserDefaultSiteCode)?.SiteName || "Default",
                    isLocked: false,
                    isActive: formData.sUserStatus === "A"
                };
                
                const updatedData = [...originalUserData, newUser];
                setUserData(updatedData);
                setOriginalUserData(updatedData);
                showInfoDialog(t('usermanagement.useraddedsuccessfully'), "success");
            }
            
            setActivePopup(null);
            
        } catch (error) {
            showInfoDialog(t('usermanagement.operationFailed'), "error");
        }
    }, [formData, validateForm, activePopup, userGroups, userData, selectedUser, originalUserData, mockSites, showInfoDialog, t]);

    const handleResetPasswordSubmit = useCallback(() => {
        const errors = validateResetPassword();
        if (Object.keys(errors).length > 0) {
            showInfoDialog(Object.values(errors).join('\n'), "warning");
            return;
        }
        
        const updatedData = userData.map(user => {
            if (user.id === selectedUser.id) {
                return {
                    ...user,
                    PassWordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    ModifiedBy: t('usermanagement.currentuser'),
                    ModifiedOn: new Date().toISOString()
                };
            }
            return user;
        });
        
        setUserData(updatedData);
        setOriginalUserData(updatedData);
        setActivePopup(null);
        showInfoDialog(t('usermanagement.passwordresetsuccessfully'), "success");
    }, [validateResetPassword, userData, selectedUser, showInfoDialog, t]);

    const handlePopupClose = useCallback(() => {
        setActivePopup(null);
        setFormErrors({});
        setResetPasswordData({
            newPassword: "",
            confirmPassword: "",
            showPassword: false
        });
    }, []);

    const handleCloseImportADS = useCallback(() => {
        setShowImportADS(false);
    }, []);

    const columns = useMemo(() => [
        {
            key: 'L02UserName',
            label: t('usermanagement.loginid'),
            width: 120,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.L02UserName}
                </div>
            )
        },
        {
            key: 'L02UserFullName',
            label: t('usermanagement.userfullname'),
            width: 150,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.L02UserFullName}
                </div>
            )
        },
        {
            key: 'UserGroupName',
            label: t('usermanagement.usergroupname'),
            width: 120,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.UserGroupName}
                </div>
            )
        },
        {
            key: 'UserStatus',
            label: t('usermanagement.userstatus'),
            width: 100,
            enableSearch: true,
            render: (row, isSelected) => {
                let colorClass = 'text-gray-500';
                if (row.UserStatus === 'Active') colorClass = 'text-green-600';
                else if (row.UserStatus === 'Deactive') colorClass = 'text-yellow-600';
                else if (row.UserStatus === 'Locked') colorClass = 'text-red-500';
                else if (row.UserStatus === 'Retired') colorClass = 'text-purple-600';
                else if (row.UserStatus === 'Unapproved') colorClass = 'text-purple-600';
                
                return (
                    <div 
                        className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${colorClass} ${isSelected ? 'font-bold' : ''}`}
                        onClick={() => handleRowSelect(row)}
                    >
                        {row.UserStatus}
                    </div>
                );
            }
        }
    ], [t, handleRowSelect]);

    const renderUserDetail = useCallback((user) => (
        <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.emailid')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.L02EmailID || '-'}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.profileimage')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.profileImage || '-'}
                </div>
            </div>            
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.lastloggedon')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.LastLoggedOn}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.passwordexpiredon')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.PassWordExpiryDate}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.createdby')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.CreatedBy}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.createdon')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.CreatedOn}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.modifiedby')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.ModifiedBy}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.modifiedon')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.ModifiedOn}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('login.domain')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.sUserDomainName}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.site')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.SiteName}
                </div>
            </div>
        </div>
    ), [t]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">{t('masters.loading')}</div>
            </div>
        );
    }

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
                            : 'bg-[#f0f2f5] text-[#2883fe] font-bold hover:bg-[#E6F0FF]'
                }
            `}
        >
            {Icon && <Icon className="w-4 h-4 font-bold" />}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="h-full overflow-hidden bg-[#f5f7fb]">
            {/* Error/Info Dialog */}
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

            {/* Hidden file input for import */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileImport}
            />

            {/* Show Import ADS Full Page View */}
            {showImportADS ? (
                <div className="flex flex-col h-full bg-white">
                    {/* Header */}
                    <div className="px-5 py-4">
                        <h2 className="m-0 text-[14px] font-semibold text-blue-800">
                            {t('usermanagement.importadsusers')}
                        </h2>
                    </div>

                    {/* Connection Form */}
                    <div className="grid grid-cols-5 gap-5 p-5 border-b border-gray-200 items-end">
                        <div>
                            <label className="block text-[12px] font-semibold text-gray-700">
                                {t('usermanagement.serverdomain')} <span className="text-red-500">*</span>
                            </label>
                            <AnimatedDropdown
                                value={adsData.domain}
                                onChange={(e) => setAdsData(prev => ({ ...prev, domain: e.target.value }))}
                                className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded outline-none"
                            >
                                <option value="">{t('usermanagement.selectdomain')}</option>
                                <option value="corpagaram">corpagaram</option>
                                <option value="domain1">Domain 1</option>
                                <option value="domain2">Domain 2</option>
                            </AnimatedDropdown>
                        </div>
                        
                        <div>
                            <label className="block text-[12px] font-semibold text-gray-700">
                                {t('usermanagement.username')} <span className="text-red-500">*</span>
                            </label>
                            <AnimatedInput
                                type="text"
                                value={adsData.username}
                                onChange={(e) => setAdsData(prev => ({ ...prev, username: e.target.value }))}
                                className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded outline-none"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-[12px] font-semibold text-gray-700">
                                {t('usermanagement.password')} <span className="text-red-500">*</span>
                            </label>
                            <AnimatedInput
                                type="password"
                                value={adsData.password}
                                onChange={(e) => setAdsData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded outline-none"
                            />
                        </div>
                        
                        <div>
                            <button
                                onClick={handleADSConnect}
                                disabled={adsData.connected}
                                className="w-1/2 flex items-center justify-center gap-1.5 mb-1 px-3 py-2 text-[12px] font-bold rounded border-none cursor-pointer bg-[#f1f5f9] text-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Server className="w-3.5 h-3.5" />
                                {adsData.connected ? t('usermanagement.connected') : t('usermanagement.connect')}
                            </button>
                        </div>
                        
                        <div>
                            <label className="block text-[12px] font-semibold text-gray-700">
                                {t('usermanagement.groupname')}
                            </label>
                            <AnimatedDropdown
                                value={adsData.selectedGroup}
                                onChange={(e) => setAdsData(prev => ({ ...prev, selectedGroup: e.target.value }))}
                                className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded outline-none"
                            >
                                <option value="">{t('usermanagement.selectgroup')}</option>
                                {userGroups.map(group => (
                                    <option key={group.L01UserGroupID} value={group.L01UserGroupID}>
                                        {group.L01UserGroupName}
                                    </option>
                                ))}
                            </AnimatedDropdown>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left: ADS Groups */}
                        <div className="w-1/3 flex flex-col">
                            <div className="px-5 py-4 border-b border-gray-200 bg-white">
                                <h3 className="m-0 text-[14px] font-semibold text-blue-800">
                                    {t('usermanagement.listofadsgroups')}
                                </h3>
                            </div>
                            <div className="p-5 border border-gray-200">
                                <input
                                    type="text"
                                    placeholder={t('usermanagement.lookingfor')}
                                    className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded outline-none"
                                />
                            </div>
                            <div className="flex-1 overflow-auto p-3">
                                {adsData.connected ? (
                                    adsData.adsGroups.map(group => (
                                        <div
                                            key={group}
                                            onClick={() => handleADSGroupSelect(group)}
                                            className={`px-4 py-3 cursor-pointer rounded mb-1.5 text-[12px] transition-all ${adsData.selectedADSGroup === group 
                                                ? 'bg-blue-50 border border-blue-200 font-semibold text-blue-800' 
                                                : 'bg-white border border-transparent font-normal text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {group}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-5 py-10 text-center text-gray-400 text-[12px]">
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: ADS Users */}
                        <div className="flex-1 flex flex-col">
                            <div className="px-5 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
                                <h3 className="m-0 text-[14px] font-semibold text-blue-800">
                                    {t('usermanagement.listofadsusers')}
                                </h3>
                                <div className="flex gap-5 items-center">
                                    <label className="flex items-center gap-1.5 text-[12px] cursor-pointer font-medium">
                                        <input
                                            type="checkbox"
                                            checked={adsData.selectAll}
                                            onChange={(e) => handleADSSelectAll(e.target.checked)}
                                            className="cursor-pointer"
                                        />
                                        {t('usermanagement.selectall')}
                                    </label>
                                    <label className="flex items-center gap-1.5 text-[12px] cursor-pointer font-medium">
                                        <input
                                            type="checkbox"
                                            checked={adsData.approveAll}
                                            onChange={(e) => handleADSApproveAll(e.target.checked)}
                                            className="cursor-pointer"
                                        />
                                        {t('usermanagement.approveall')}
                                    </label>
                                    <button
                                        onClick={handleADSRefresh}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded border-none cursor-pointer bg-[#f1f5f9] text-[#2883FE]"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        {t('button.refresh')}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-auto">
                                <table className="w-full border-collapse text-[14px]">
                                    <thead className="sticky top-0 bg-gray-50 z-1">
                                        <tr>
                                            <th className="px-5 py-3 text-left border-b-2 border-gray-200 font-semibold text-gray-700 w-[15%]">
                                                {t('usermanagement.import')}
                                            </th>
                                            <th className="px-5 py-3 text-left border-b-2 border-gray-200 font-semibold text-gray-700">
                                                {t('usermanagement.username')}
                                            </th>
                                            <th className="px-5 py-3 text-left border-b-2 border-gray-200 font-semibold text-gray-700 w-[15%]">
                                                {t('usermanagement.approve')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adsData.adsUsers.length > 0 ? (
                                            adsData.adsUsers.map((user, index) => (
                                                <tr 
                                                    key={index} 
                                                    className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                >
                                                    <td className="px-5 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={user.selected || false}
                                                            onChange={(e) => handleADSUserSelect(index, 'selected', e.target.checked)}
                                                            className="cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-700">
                                                        {user.username}
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={user.approved || false}
                                                            onChange={(e) => handleADSUserSelect(index, 'approved', e.target.checked)}
                                                            className="cursor-pointer"
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td 
                                                    colSpan="3" 
                                                    className="px-5 py-12 text-center text-gray-400 text-[14px]"
                                                >
                                                    {adsData.connected 
                                                        ? t('usermanagement.nodatatodisplay') 
                                                        : t('usermanagement.nodata')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="px-5 py-4 border-t-2 border-gray-200 flex justify-end gap-2.5 bg-white">
                        <button
                            onClick={handleImportADSSubmit}
                            className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-white bg-[#2883FE] border-none rounded cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {t('usermanagement.import')}
                        </button>
                        <button
                            onClick={handleCloseImportADS}
                            className="px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white border border-gray-300 rounded cursor-pointer"
                        >
                            {t('usermanagement.close')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col bg-white">
                    {/* Header with Actions */}
                    <div className="flex justify-between items-center p-3 bg-white ">
                        {/* Group Selection */}
                        <div className="flex items-center gap-3">
                            <label className="text-[14px] font-semibold text-gray-700">
                                {t('usermanagement.groupname')}:
                            </label>
                            <AnimatedDropdown
                                value={selectedGroup}
                                onChange={handleGroupChange}
                                options={userGroups.map(group => ({
                                    value: group.L01UserGroupID,
                                    label: group.L01UserGroupName
                                }))}
                                className="w-48"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 justify-end">
                            <ActionButton icon={UserPlus} label={t('button.add')} onClick={handleAddClick} />
                            <ActionButton icon={Edit} label={t('usermanagement.edit')} onClick={handleEditClick} />
                            <ActionButton icon={Ban} label={t('usermanagement.retire')} onClick={handleRetireClick} />
                            <ActionButton icon={Power} label={t('usermanagement.resetpassword')} onClick={handleResetPasswordClick} />
                            <ActionButton icon={Unlock} label={t('usermanagement.unlock')} onClick={handleUnlockClick} />
                            <ActionButton icon={UserX} label={t('usermanagement.activedeactive')} onClick={handleActiveDeactiveClick} />
                            <ActionButton icon={ThumbsUp} label={t('usermanagement.approve')} onClick={handleApproveClick} />
                            <ActionButton icon={Server} label={t('usermanagement.importads')} onClick={handleImportADSClick} />
                            <ActionButton icon={Download} label={t('usermanagement.export')} onClick={handleExportClick} />
                            <ActionButton icon={Upload} label={t('usermanagement.import')} onClick={handleImportClick} />
                        </div>
                    </div>

                    {/* Main Grid Layout - This is the key change */}
{/* Main Grid Layout - Takes remaining height and scrolls */}
<div className="flex-1 overflow-auto min-h-0 w-full relative overflow-visible p-3">
    <div className="h-full flex flex-col relative z-0">
        <div className="flex-1 min-h-[100px] overflow-hidden bg-white relative z-0">                        {loading ? (
                            <div className="text-center py-10 text-gray-500">
                                {t("login.loading")}
                            </div>
                        ) : (
                            <GridLayout
                                columns={columns}
                                height="100%"
                                detailPanelWidth="46%"
                                data={userData}
                                getRowId={(row) => row.id}
                                renderDetailPanel={renderUserDetail}
                                onRowClick={handleRowSelect}
                                searchable={false}
                                selectable={true}
                                hidePagination={false}
                                rowClassName={(row) =>
                                    row.id === selectedRowId
                                        ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
                                        : ""
                                }
                            />
                        )}
                    </div>
                </div>
                </div>
                </div>
            )}

            {/* Add/Edit User Popup */}
            {(activePopup === "adduser" || activePopup === "edituser") && (
                <CustomPopup
                    isOpen={true}
                    onClose={handlePopupClose}
                    title={activePopup === "adduser" ? t('button.add') : t('usermanagement.edit')}
                    size="sm"
                    content={
                        <div className="flex flex-col gap-1">
                            {/* Login ID */}
                            <div>
                                <label className="text-[14px] font-semibold text-gray-700 block mb-1">
                                    {t('usermanagement.loginid')} <span className="text-red-500">*</span>
                                </label>
                                <AnimatedInput
                                    type="text"
                                    value={formData.sUsername}
                                    onChange={(e) => handleFormChange('sUsername', e.target.value)}
                                    disabled={activePopup === "edituser"}
                                    maxLength={30}
                                    className={`w-4/5 px-3 py-2 text-[14px] border rounded outline-none ${
                                        formErrors.sUsername ? 'border-red-500' : 'border-gray-300'
                                    } ${activePopup === "edituser" ? 'bg-gray-50' : 'bg-white'}`}
                                />
                                {formErrors.sUsername && (
                                    <div className="text-red-500 text-[12px] mt-1">
                                        {formErrors.sUsername}
                                    </div>
                                )}
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="text-[14px] font-semibold text-gray-700 block mb-1">
                                    {t('usermanagement.fullname')} <span className="text-red-500">*</span>
                                </label>
                                <AnimatedInput
                                    type="text"
                                    value={formData.sUserFullname}
                                    onChange={(e) => handleFormChange('sUserFullname', e.target.value)}
                                    maxLength={100}
                                    className={`w-full px-3 py-2 text-[14px] border rounded outline-none ${
                                        formErrors.sUserFullname ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {formErrors.sUserFullname && (
                                    <div className="text-red-500 text-[12px] mt-1">
                                        {formErrors.sUserFullname}
                                    </div>
                                )}
                            </div>

                            {/* Email ID */}
                            <div>
                                <label className="text-[14px] font-semibold text-gray-700 block mb-1">
                                    {t('usermanagement.emailid')}
                                </label>
                                <AnimatedInput
                                    type="email"
                                    value={formData.sUserMailID}
                                    onChange={(e) => handleFormChange('sUserMailID', e.target.value)}
                                    className={`w-full px-3 py-2 text-[14px] border rounded outline-none ${
                                        formErrors.sUserMailID ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {formErrors.sUserMailID && (
                                    <div className="text-red-500 text-[12px] mt-1">
                                        {formErrors.sUserMailID}
                                    </div>
                                )}
                                <div className="text-[11px] text-gray-500 mt-1">
                                    {t('usermanagement.noteforgotpassword')}
                                </div>
                            </div>

                            {/* Profile Image */}
                            <div>
                                <label className="text-[14px] font-semibold text-gray-700 block mb-1">
                                    {t('usermanagement.profileimage')}
                                </label>
                                <input
                                    type="file"
                                    accept="image/gif,image/png,image/jpg,image/jpeg"
                                    onChange={handleProfileImageChange}
                                    className="w-full text-[12px]"
                                />
                                <div className="text-[11px] text-gray-500 mt-1">
                                    {t('usermanagement.noteuserprofileupload')}
                                </div>
                            </div>

                            {/* Group Name */}
                            <div>
                                <label className="text-[14px] font-semibold text-gray-700 block mb-1">
                                    {t('usermanagement.groupname')} <span className="text-red-500">*</span>
                                </label>
                                <AnimatedDropdown
                                    value={formData.sUserGroupID}
                                    onChange={(e) => handleFormChange('sUserGroupID', e.target.value)}
                                    className={`w-full px-3 py-2 text-[14px] border rounded outline-none ${
                                        formErrors.sUserGroupID ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">{t('usermanagement.selectgroup')}</option>
                                    {userGroups.map(group => (
                                        <option key={group.L01UserGroupID} value={group.L01UserGroupID}>
                                            {group.L01UserGroupName}
                                        </option>
                                    ))}
                                </AnimatedDropdown>
                                {formErrors.sUserGroupID && (
                                    <div className="text-red-500 text-[12px] mt-1">
                                        {formErrors.sUserGroupID}
                                    </div>
                                )}
                            </div>

                            {/* Default Login Site */}
                            <div>
                                <label className="text-[14px] font-semibold text-gray-700 block mb-1">
                                    {t('usermanagement.defaultloginsite')}
                                </label>
                                <AnimatedDropdown
                                    value={formData.sUserDefaultSiteCode}
                                    onChange={(e) => handleFormChange('sUserDefaultSiteCode', e.target.value)}
                                    className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded outline-none"
                                >
                                    <option value="">{t('usermanagement.selectsite')}</option>
                                    {mockSites.map(site => (
                                        <option key={site.SiteCode} value={site.SiteCode}>
                                            {site.SiteName}
                                        </option>
                                    ))}
                                </AnimatedDropdown>
                            </div>

                            {/* Checkboxes */}
                            <div className="flex gap-7">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.sUserStatus === "A"}
                                        onChange={(e) => handleFormChange('sUserStatus', e.target.checked ? "A" : "UA")}
                                        disabled={activePopup === "edituser"}
                                        className={`w-4 h-4 cursor-pointer ${activePopup === "edituser" ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    />
                                    <span className="text-[14px]">{t('usermanagement.approve')}</span>
                                </label>
                            </div>

                            {/* Form Buttons */}
                            <div className="flex justify-end gap-3 pt-3 mt-1 border-t border-gray-200">
                                <button
                                    onClick={handleSubmit}
                                    className="flex items-center gap-1 px-4 py-2 text-[12px] font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600"
                                >
                                    <Check className="w-3.5 h-3.5" /> {t('usermanagement.submit')}
                                </button>
                                <button
                                    onClick={handlePopupClose}
                                    className="px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                                >
                                    {t('usermanagement.close')}
                                </button>
                            </div>
                        </div>
                    }
                />
            )}

            {/* Reset Password Popup */}
            {activePopup === "resetpassword" && (
                <CustomPopup
                    isOpen={true}
                    onClose={handlePopupClose}
                    title={t('usermanagement.resetpassword')}
                    size="md"
                    content={
                        <div className="flex flex-col gap-4">
                            <div className="mb-2">
                                <p className="text-[14px] text-gray-700">
                                    {t('usermanagement.resetpasswordfor')}: <strong>{selectedUser?.L02UserName}</strong>
                                </p>
                            </div>
                            
                            {/* New Password */}
                            <div>
                                <label className="text-[14px] font-semibold text-gray-700 block mb-1">
                                    {t('usermanagement.newpassword')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={resetPasswordData.showPassword ? "text" : "password"}
                                        value={resetPasswordData.newPassword}
                                        onChange={(e) => handleResetPasswordChange('newPassword', e.target.value)}
                                        className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded outline-none pr-10"
                                        placeholder={t('usermanagement.enternewpassword')}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleTogglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-none border-none cursor-pointer text-gray-500"
                                    >
                                        {resetPasswordData.showPassword ? (
                                            <EyeOff className="w-4.5 h-4.5" />
                                        ) : (
                                            <Eye className="w-4.5 h-4.5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="text-[14px] font-semibold text-gray-700 block mb-1">
                                    {t('usermanagement.confirmpassword')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type={resetPasswordData.showPassword ? "text" : "password"}
                                    value={resetPasswordData.confirmPassword}
                                    onChange={(e) => handleResetPasswordChange('confirmPassword', e.target.value)}
                                    className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded outline-none"
                                    placeholder={t('usermanagement.confirmnewpassword')}
                                />
                            </div>

                            <div className="text-[12px] text-gray-500 p-2 bg-gray-50 rounded">
                                {t('usermanagement.passwordrequirements')}
                            </div>

                            {/* Form Buttons */}
                            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-200">
                                <button
                                    onClick={handleResetPasswordSubmit}
                                    className="flex items-center gap-2 px-4 py-2 text-[14px] font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600"
                                >
                                    <Check className="w-4 h-4" /> {t('usermanagement.reset')}
                                </button>
                                <button
                                    onClick={handlePopupClose}
                                    className="px-4 py-2 text-[14px] font-semibold text-gray-700 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                                >
                                    {t('usermanagement.cancel')}
                                </button>
                            </div>
                        </div>
                    }
                />
            )}
        </div>
    );
};

export default UserMaster;