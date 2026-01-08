// import { useState, useMemo, useEffect, useCallback } from 'react';
// import { MessageSquare, LogOut, RefreshCw, Users } from 'lucide-react';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// import { useTranslation } from 'react-i18next';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import CustomPopup from '../../../../Layout/Common/Popup';

// const OnlineUsers = () => {
//     const [onlineUsersData, setOnlineUsersData] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [selectedRowId, setSelectedRowId] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [infoDialog, setInfoDialog] = useState({
//         open: false,
//         message: "",
//         type: "information"
//     });
//     const [logoutPopup, setLogoutPopup] = useState(false);
//     const { t } = useTranslation();

//     // Mock data for online users
//     const mockOnlineUsersData = [
//         {
//             id: 1,
//             L02UserID: "USR-001",
//             L02UserName: "admin",
//             L02UserFullName: "Administrator",
//             UserGroupName: "Administrator",
//             UserStatus: "Active",
//             LoginStatus: "Active",
//             LastLoggedOn: "2024-12-22 10:30:00",
//             PassWordExpiryDate: "2025-03-22",
//             CreatedBy: "System",
//             CreatedOn: "2024-01-01 09:00:00",
//             ModifiedBy: "Admin",
//             ModifiedOn: "2024-12-20 15:00:00",
//         },
//         {
//             id: 2,
//             L02UserID: "USR-002",
//             L02UserName: "john.doe",
//             L02UserFullName: "John Doe",
//             UserGroupName: "Lab Technician",
//             UserStatus: "Active",
//             LoginStatus: "Active",
//             LastLoggedOn: "2024-12-22 09:15:00",
//             PassWordExpiryDate: "2025-02-15",
//             CreatedBy: "Admin",
//             CreatedOn: "2024-01-10 10:00:00",
//             ModifiedBy: "Admin",
//             ModifiedOn: "2024-12-18 14:00:00",
//         },
//         {
//             id: 3,
//             L02UserID: "USR-003",
//             L02UserName: "jane.smith",
//             L02UserFullName: "Jane Smith",
//             UserGroupName: "View Only",
//             UserStatus: "Active",
//             LoginStatus: "InActive",
//             LastLoggedOn: "2024-12-21 16:45:00",
//             PassWordExpiryDate: "2025-01-30",
//             CreatedBy: "Admin",
//             CreatedOn: "2024-01-12 09:00:00",
//             ModifiedBy: "Admin",
//             ModifiedOn: "2024-12-19 11:00:00",
//         }
//     ];

//     useEffect(() => {
//         setLoading(true);
//         setTimeout(() => {
//             setOnlineUsersData(mockOnlineUsersData);
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

//     const handleRefreshClick = useCallback(() => {
//         setLoading(true);
//         setTimeout(() => {
//             // Simulate API refresh
//             setOnlineUsersData(mockOnlineUsersData);
//             setLoading(false);
//             showInfoDialog(t('usermanagement.refreshsuccess'), "success");
//         }, 500);
//     }, [t, showInfoDialog]);

//     const handleChatClick = useCallback(() => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         // Simulate chat functionality
//         showInfoDialog(`${t('usermanagement.initiatechat')} ${selectedUser.L02UserFullName}`, "information");
        
//         // TODO: Implement actual chat functionality
//         // This would navigate to chat interface with selected user
//     }, [selectedUser, showInfoDialog, t]);

//     const handleLogoutClick = useCallback(() => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         // Check if user is SDMSADMIN or similar admin user
//         const isAdminUser = true; // Replace with actual check
        
//         if (!isAdminUser) {
//             showInfoDialog(t('usermanagement.unauthorizedlogout'), "warning");
//             return;
//         }
        
//         // Check if selected user is active
//         if (selectedUser.LoginStatus === 'InActive') {
//             showInfoDialog(t('usermanagement.userinactive'), "warning");
//             return;
//         }
        
//         // Show confirmation dialog
//         setLogoutPopup(true);
//     }, [selectedUser, showInfoDialog, t]);

//     const confirmLogout = useCallback(() => {
//         try {
//             // Simulate API call for force logout
//             setTimeout(() => {
//                 showInfoDialog(`${t('usermanagement.forcelogoutsuccess')} ${selectedUser.L02UserFullName}`, "success");
                
//                 // Update user status to inactive
//                 setOnlineUsersData(prev => 
//                     prev.map(user => 
//                         user.id === selectedUser.id 
//                             ? { ...user, LoginStatus: 'InActive' } 
//                             : user
//                     )
//                 );
                
//                 setLogoutPopup(false);
//                 setSelectedUser(null);
//                 setSelectedRowId(null);
//             }, 500);
            
//         } catch (error) {
//             showInfoDialog(t('usermanagement.forcelogoutfailed'), "error");
//         }
//     }, [selectedUser, showInfoDialog, t]);

//     const columns = useMemo(() => [
//         {
//             key: 'L02UserName',
//             label: t('usermanagement.loginid'),
//             width: 120,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.L02UserName}
//                 </div>
//             )
//         },
//         {
//             key: 'L02UserFullName',
//             label: t('usermanagement.userfullname'),
//             width: 150,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.L02UserFullName}
//                 </div>
//             )
//         },
//         {
//             key: 'UserGroupName',
//             label: t('usermanagement.usergroupname'),
//             width: 120,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.UserGroupName}
//                 </div>
//             )
//         },
//         {
//             key: 'LoginStatus',
//             label: t('usermanagement.userstatus'),
//             width: 100,
//             enableSearch: true,
//             render: (row, isSelected) => {
//                 let colorClass = 'text-gray-500';
//                 if (row.LoginStatus === 'Active') colorClass = 'text-green-600';
//                 else if (row.LoginStatus === 'InActive') colorClass = 'text-red-500';
                
//                 return (
//                     <div 
//                         className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${colorClass} ${isSelected ? 'font-bold' : ''}`}
//                         onClick={() => handleRowSelect(row)}
//                     >
//                         {row.LoginStatus}
//                     </div>
//                 );
//             }
//         }
//     ], [t, handleRowSelect]);

//     const renderUserDetail = useCallback((user) => (
//         <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.lastloggedon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.LastLoggedOn}
//                 </div>
//             </div>

//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.passwordexpiredon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.PassWordExpiryDate}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.createdby')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.CreatedBy}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.createdon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.CreatedOn}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedby')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.ModifiedBy}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.ModifiedOn}
//                 </div>
//             </div>
//         </div>
//     ), [t]);

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-full">
//                 <div className="text-gray-500">{t('masters.loading')}</div>
//             </div>
//         );
//     }

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
//                             : 'bg-[#f0f2f5] text-[#2883fe] font-bold hover:bg-[#E6F0FF]'
//                 }
//             `}
//         >
//             {Icon && <Icon className="w-4 h-4 font-bold" />}
//             <span>{label}</span>
//         </button>
//     );

//     return (
//         <div className="h-full overflow-hidden bg-[#f5f7fb]">
//             {/* Error/Info Dialog */}
//             {infoDialog.open && (
//                 <Errordialog
//                     message={infoDialog.message}
//                     type={infoDialog.type}
//                     onClose={closeInfoDialog}
//                 />
//             )}

//             <div className="h-full flex flex-col bg-white">
//                 {/* Top Action Buttons */}
//                 <div className="flex justify-end gap-2.5 p-3 bg-white border-b border-gray-200">
//                     <ActionButton
//                         icon={MessageSquare}
//                         label={t('usermanagement.chat')}
//                         onClick={handleChatClick}
//                         disabled={!selectedUser}
//                     />
//                     <ActionButton
//                         icon={LogOut}
//                         label={t('usermanagement.logout')}
//                         onClick={handleLogoutClick}
//                         disabled={!selectedUser}
//                     />
//                     <ActionButton
//                         icon={RefreshCw}
//                         label={t('usermanagement.refresh')}
//                         onClick={handleRefreshClick}
//                     />
//                 </div>

//                 {/* Main GridLayout with Details Panel */}
//                 <div className="flex-1 overflow-auto p-3 font-roboto text-[#353f49]">
//                     {loading ? (
//                         <div className="text-center py-10 text-gray-500">
//                             {t("login.loadingpasswordpolicy")}
//                         </div>
//                     ) : (
//                         <GridLayout
//                             columns={columns}
//                             height="100%"
//                             detailPanelWidth="46%"
//                             data={onlineUsersData}
//                             getRowId={(row) => row.id}
//                             renderDetailPanel={renderUserDetail}
//                             onRowClick={handleRowSelect}
//                             searchable={true}
//                             selectable={true}
//                             hidePagination={false}
//                             rowClassName={(row) =>
//                                 row.id === selectedRowId
//                                     ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
//                                     : ""
//                             }
//                         />
//                     )}
//                 </div>

//                 {/* Logout Confirmation Popup */}
//                 {logoutPopup && (
//                     <CustomPopup
//                         isOpen={logoutPopup}
//                         onClose={() => setLogoutPopup(false)}
//                         title={t('usermanagement.confirmlogout')}
//                         content={
//                             <div className="flex flex-col gap-4 p-2">
//                                 <div className="text-[14px] text-gray-700">
//                                     {t('usermanagement.logoutconfirmation')} <strong>{selectedUser?.L02UserFullName}</strong>?
//                                 </div>
                                
//                                 <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-200">
//                                     <button
//                                         onClick={confirmLogout}
//                                         className="flex items-center gap-2 px-4 py-2 text-[14px] font-semibold text-white bg-red-500 border-none rounded cursor-pointer hover:bg-red-600"
//                                     >
//                                         <LogOut className="w-4 h-4" /> {t('usermanagement.confirm')}
//                                     </button>
//                                     <button
//                                         onClick={() => setLogoutPopup(false)}
//                                         className="px-4 py-2 text-[14px] font-semibold text-gray-700 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
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

// export default OnlineUsers;










































// import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// import { MessageSquare, LogOut, RefreshCw } from 'lucide-react';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// import { useTranslation } from 'react-i18next';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import AuditTrail from '../../../../Layout/Common/AuditTrail';
// import servicecall from '../../../../../Services/servicecall';
// import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';
// import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown.jsx';

// const OnlineUsers = () => {
//     const [onlineUsersData, setOnlineUsersData] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [selectedRowId, setSelectedRowId] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [infoDialog, setInfoDialog] = useState({
//         open: false,
//         message: "",
//         type: "information"
//     });
//     const [showAuditTrail, setShowAuditTrail] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [showChat, setShowChat] = useState(false);
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [sendingMessage, setSendingMessage] = useState(false);
//     const [activeUsers, setActiveUsers] = useState([]);
    
//     const { t } = useTranslation();
//     const { postData } = servicecall();

//     // Use refs to avoid stale state in callbacks
//     const onlineUsersDataRef = useRef(onlineUsersData);
//     const selectedUserRef = useRef(selectedUser);
//     const messagesEndRef = useRef(null);

//     useEffect(() => {
//         onlineUsersDataRef.current = onlineUsersData;
//     }, [onlineUsersData]);

//     useEffect(() => {
//         selectedUserRef.current = selectedUser;
//     }, [selectedUser]);

//     // Scroll to bottom of messages
//     useEffect(() => {
//         if (messagesEndRef.current && showChat) {
//             messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [messages, showChat]);

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

//     // Get active user details
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
//             const sTenantID = getDecryptedValue("sTenantID") || "";

//             const formattedSiteCode = (sSiteCode || "CH").padEnd(10, ' ').substring(0, 10);
//             const formattedUserGroupID = (sUserGroupID || "G1").padEnd(10, ' ').substring(0, 10);
            
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
//                 sUserStatus: sUserStatus,
//                 sApplicationName: "SDMS",
//                 sdbtype: sdbtype,
//                 sTenantID: sTenantID
//             };
//         };
//     }, [getDecryptedValue]);

//     // Build API request data
//     const getApiRequestData = useCallback((additionalData = {}) => {
//         const activeUserDetails = getActiveUserDetails();
        
//         const requestData = {
//             ApplicationCode: "SDMS",
//             ActiveUserDetails: activeUserDetails,
//             ...additionalData
//         };
        
//         return requestData;
//     }, [getActiveUserDetails]);

//     // Show info dialog
//     const showInfoDialog = useCallback((message, type = "information") => {
//         setInfoDialog({
//             open: true,
//             message,
//             type
//         });
//     }, []);

//     // Close info dialog
//     const closeInfoDialog = useCallback(() => {
//         setInfoDialog(prev => ({
//             ...prev,
//             open: false
//         }));
//     }, []);

//     // Fetch active users for chat
//     const fetchActiveUsers = useCallback(async () => {
//         try {
//             const requestData = getApiRequestData();
            
//             const response = await postData("chatmessages/getActiveUsers", requestData);
            
//             if (response && response.ActiveUsers && Array.isArray(response.ActiveUsers)) {
//                 // Format active users for dropdown
//                 const formattedActiveUsers = response.ActiveUsers.map(user => ({
//                     id: user.sUserID,
//                     name: user.sUserName
//                 }));
//                 setActiveUsers(formattedActiveUsers);
//             }
//         } catch (error) {
//             console.error('Error fetching active users:', error);
//         }
//     }, [postData, getApiRequestData]);

//     // Process online users response
//     const processOnlineUsersResponse = useCallback((response) => {
//         let usersData = [];
        
//         if (response && response.OnlineUsers && Array.isArray(response.OnlineUsers)) {
//             usersData = response.OnlineUsers;
//         } else if (response && response.oResObj && Array.isArray(response.oResObj)) {
//             usersData = response.oResObj;
//         } else if (response && response.returnservice && response.returnservice.oResObj) {
//             usersData = response.returnservice.oResObj;
//         } else if (Array.isArray(response)) {
//             usersData = response;
//         }
        
//         if (usersData.length === 0) {
//             setOnlineUsersData([]);
//             return;
//         }
        
//         const formattedData = usersData.map((user, index) => ({
//             id: index + 1,
//             L02UserID: (user.L02UserID || "").padEnd(10, ' ').substring(0, 10),
//             L02UserName: user.L02UserName || "",
//             L02UserFullName: user.L02UserFullName || "",
//             UserGroupName: user.UserGroupName || "",
//             UserStatus: user.UserStatus || "Active",
//             LoginStatus: user.LoginStatus || "InActive",
//             LastLoggedOn: user.LastLoggedOn || "",
//             UTCLastLoggedOn: user.UTCLastLoggedOn || "",
//             PassWordExpiryDate: user.PassWordExpiryDate || "",
//             UTCPassWordExpiryDate: user.UTCPassWordExpiryDate || "",
//             CreatedBy: user.CreatedBy || "System",
//             CreatedOn: user.CreatedOn || "",
//             UTCCreatedOn: user.UTCCreatedOn || "",
//             ModifiedBy: user.ModifiedBy || null,
//             ModifiedOn: user.ModifiedOn || null,
//             UTCModifiedOn: user.UTCModifiedOn || null
//         }));
        
//         setOnlineUsersData(formattedData);
        
//         if (selectedRowId && formattedData.length > 0) {
//             const selected = formattedData.find(user => 
//                 user.L02UserID === selectedUserRef.current?.L02UserID
//             );
//             if (selected) {
//                 setSelectedUser(selected);
//                 setSelectedRowId(selected.id);
//             } else if (formattedData.length > 0) {
//                 setSelectedUser(formattedData[0]);
//                 setSelectedRowId(formattedData[0].id);
//             }
//         } else if (formattedData.length > 0 && !selectedRowId) {
//             setSelectedUser(formattedData[0]);
//             setSelectedRowId(formattedData[0].id);
//         }
//     }, [selectedRowId]);

//     // Fetch online users
//     const fetchOnlineUsers = useCallback(async () => {
//         setLoading(true);
//         try {
//             const requestData = getApiRequestData();
            
//             const response = await postData("User/OnlineUsersGrid", requestData);
            
//             if (!response) {
//                 showInfoDialog("Server returned null response", "error");
//                 return;
//             }
            
//             if (response.Rtn && response.Rtn !== "Success") {
//                 showInfoDialog(response.returnMsg || "Failed to fetch online users", "error");
//                 return;
//             }
            
//             processOnlineUsersResponse(response);
//             await fetchActiveUsers();
            
//         } catch (error) {
//             console.error('Error fetching online users:', error);
//             if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
//                 showInfoDialog("Cannot connect to server. Please check if the service is running.", "error");
//             } else {
//                 showInfoDialog(t('usermanagement.failedtofetchonlineusers') || 'Failed to fetch online users', "error");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [postData, t, getApiRequestData, processOnlineUsersResponse, showInfoDialog, fetchActiveUsers]);

//     // Fetch chat history
//     const fetchChatHistory = useCallback(async (toUserID = null) => {
//         try {
//             const requestData = getApiRequestData({
//                 sActionType: "View",
//                 ...(toUserID && { sToUserID: toUserID })
//             });
            
//             const response = await postData("chatmessages/getChatHistory", requestData);
            
//             if (response && response.ChatHistory) {
//                 // For now, we'll parse the HTML response
//                 if (typeof response.ChatHistory === 'string') {
//                     // Check if there are any totxtdiv elements in the HTML
//                     const hasMessages = response.ChatHistory.includes('totxtdiv');
                    
//                     if (!hasMessages) {
//                         setMessages([]);
//                     } else {
//                         // For demo purposes, create mock messages
//                         const mockMessages = [
//                             {
//                                 id: 1,
//                                 sender: "You",
//                                 text: "Hello!",
//                                 timestamp: "10:30 AM",
//                                 isOwn: true
//                             },
//                             {
//                                 id: 2,
//                                 sender: selectedUser?.L02UserFullName || "User",
//                                 text: "Hi there!",
//                                 timestamp: "10:32 AM",
//                                 isOwn: false
//                             }
//                         ];
//                         setMessages(mockMessages);
//                     }
//                 }
//             } else {
//                 setMessages([]);
//             }
//         } catch (error) {
//             console.error('Error fetching chat history:', error);
//             setMessages([]);
//         }
//     }, [postData, getApiRequestData, selectedUser]);

//     // Send message
//     const handleSendMessage = useCallback(async () => {
//         if (!newMessage.trim() || !selectedUser) return;
        
//         try {
//             setSendingMessage(true);
            
//             const requestData = getApiRequestData({
//                 sToUserName: selectedUser.L02UserFullName,
//                 sMessage: newMessage
//             });
            
//             const response = await postData("chatmessages/sendMessage", requestData);
            
//             if (response && response.Rtn === "Success") {
//                 setNewMessage('');
//                 // Add the sent message to local state immediately
//                 const newMsg = {
//                     id: messages.length + 1,
//                     sender: "You",
//                     text: newMessage,
//                     timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
//                     isOwn: true
//                 };
//                 setMessages(prev => [...prev, newMsg]);
                
//                 // Refresh chat history
//                 await fetchChatHistory(selectedUser.L02UserID);
//                 showInfoDialog(t('usermanagement.messagesent'), "success");
//             } else {
//                 showInfoDialog(response?.returnMsg || t('usermanagement.messagesentfailed'), "error");
//             }
            
//         } catch (error) {
//             console.error('Error sending message:', error);
//             showInfoDialog(t('usermanagement.messagesentfailed'), 'error');
//         } finally {
//             setSendingMessage(false);
//         }
//     }, [newMessage, selectedUser, postData, getApiRequestData, fetchChatHistory, showInfoDialog, t, messages]);

//     // Clear chat history
//     const handleClearHistory = useCallback(async () => {
//         if (messages.length === 0) {
//             showInfoDialog(t('usermanagement.youhavenohistoryhere'), "warning");
//             return;
//         }
        
//         if (window.confirm(t('usermanagement.chatconfirmation') || "Are you sure you want to clear chat history?")) {
//             try {
//                 const requestData = getApiRequestData();
                
//                 const response = await postData("chatmessages/clearChatHistory", requestData);
                
//                 if (response && response.Rtn === "Success") {
//                     setMessages([]);
//                     showInfoDialog(t('usermanagement.chathistorydeletesuccess') || "Chat history deleted successfully", "success");
//                 } else {
//                     showInfoDialog(response?.returnMsg || t('usermanagement.clearchatfailed'), "error");
//                 }
//             } catch (error) {
//                 console.error('Error clearing chat history:', error);
//                 showInfoDialog(t('usermanagement.clearchatfailed'), 'error');
//             }
//         }
//     }, [messages, postData, getApiRequestData, showInfoDialog, t]);

//     // Force logout
//     const handleForceLogout = useCallback(async (auditTrailValues = null) => {
//         const currentSelectedUser = selectedUserRef.current;
        
//         if (!currentSelectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         try {
//             setIsSubmitting(true);
            
//             const currentUsername = getDecryptedValue("sUsername") || "";
//             const isAdminUser = currentUsername.toUpperCase() === "SDMSADMIN";
            
//             if (!isAdminUser) {
//                 showInfoDialog(t('usermanagement.unauthorizedlogout'), "warning");
//                 return;
//             }
            
//             if (currentSelectedUser.LoginStatus === 'InActive') {
//                 showInfoDialog(t('usermanagement.userinactive'), "warning");
//                 return;
//             }
            
//             let requestData = getApiRequestData({
//                 sLogoutUserID: currentSelectedUser.L02UserID
//             });

//             if (auditTrailValues) {
//                 requestData.AuditTrailValues = auditTrailValues;
//             }
            
//             const response = await postData("User/ForceLogOut", requestData);
            
//             if (!response) {
//                 showInfoDialog(t('usermanagement.forcelogoutfailed'), "error");
//                 return;
//             }
            
//             if (response.AuditTrailLogin === false) {
//                 showInfoDialog(response.LoginFailedMsg || "Audit trail authentication failed", "error");
//                 return;
//             }
            
//             if (response.Rtn === "Success") {
//                 showInfoDialog(`${t('usermanagement.forcelogoutsuccess')} ${currentSelectedUser.L02UserFullName}`, "success");
                
//                 if (response.OnlineUsers) {
//                     processOnlineUsersResponse(response);
//                 } else if (response.returnservice && response.returnservice.oResObj) {
//                     processOnlineUsersResponse(response.returnservice);
//                 } else if (response.oResObj) {
//                     processOnlineUsersResponse(response);
//                 } else {
//                     await fetchOnlineUsers();
//                 }
                
//                 setSelectedUser(null);
//                 setSelectedRowId(null);
//             } else {
//                 showInfoDialog(response.returnMsg || t('usermanagement.forcelogoutfailed'), "error");
//             }
            
//         } catch (error) {
//             console.error('Error in force logout:', error);
//             showInfoDialog(t('usermanagement.forcelogoutfailed'), "error");
//         } finally {
//             setIsSubmitting(false);
//             setShowAuditTrail(false);
//         }
//     }, [postData, showInfoDialog, t, getApiRequestData, fetchOnlineUsers, processOnlineUsersResponse, getDecryptedValue]);

//     const handleAuditAuthorized = useCallback((auditData) => {
//         const auditTrailValues = auditData.AuditTrailValues;
        
//         if (!auditTrailValues) {
//             showInfoDialog("Audit trail data is missing", "error");
//             setShowAuditTrail(false);
//             return;
//         }
        
//         setShowAuditTrail(false);
//         handleForceLogout(auditTrailValues);
//     }, [handleForceLogout, showInfoDialog]);

//     const handleAuditClose = useCallback(() => {
//         setShowAuditTrail(false);
//     }, []);

//     const handleRowSelect = useCallback((row) => {
//         setSelectedUser(row);
//         setSelectedRowId(row.id);
//     }, []);

//     const handleRefreshClick = useCallback(async () => {
//         await fetchOnlineUsers();
//         showInfoDialog(t('usermanagement.refreshsuccess'), "success");
//     }, [fetchOnlineUsers, showInfoDialog, t]);

//     const handleChatClick = useCallback(async () => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         const isUserActive = activeUsers.some(user => 
//             user.id?.trim() === selectedUser.L02UserID?.trim()
//         );
        
//         if (!isUserActive) {
//             showInfoDialog(`${selectedUser.L02UserFullName} is not active for chat`, "warning");
//             return;
//         }
        
//         setShowChat(true);
//         await fetchChatHistory(selectedUser.L02UserID);
//     }, [selectedUser, showInfoDialog, t, activeUsers, fetchChatHistory]);

//     const handleCloseChat = useCallback(() => {
//         setShowChat(false);
//         setMessages([]);
//         setNewMessage('');
//     }, []);

//     const handleClearMessage = useCallback(() => {
//         setNewMessage('');
//     }, []);

//     const handleLogoutClick = useCallback(() => {
//         if (!selectedUser) {
//             showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
//             return;
//         }
        
//         const currentUsername = getDecryptedValue("sUsername") || "";
//         const isAdminUser = currentUsername.toUpperCase() === "SDMSADMIN";
        
//         if (!isAdminUser) {
//             showInfoDialog(t('usermanagement.unauthorizedlogout'), "warning");
//             return;
//         }
        
//         if (selectedUser.LoginStatus === 'InActive') {
//             showInfoDialog(t('usermanagement.userinactive'), "warning");
//             return;
//         }
        
//         setShowAuditTrail(true);
//     }, [selectedUser, showInfoDialog, t, getDecryptedValue]);

//     // Handle dropdown selection for active users
//     const handleUserSelect = useCallback((e) => {
//         const selectedUserId = e.target.value;
//         if (selectedUserId) {
//             // Find the active user
//             const selectedActiveUser = activeUsers.find(user => user.id === selectedUserId);
//             if (selectedActiveUser) {
//                 // Find the corresponding online user
//                 const onlineUser = onlineUsersData.find(user => 
//                     user.L02UserID?.trim() === selectedActiveUser.id?.trim()
//                 );
//                 if (onlineUser) {
//                     setSelectedUser(onlineUser);
//                     setSelectedRowId(onlineUser.id);
//                 }
//             }
//         }
//     }, [activeUsers, onlineUsersData]);

//     // Initial data fetch
//     useEffect(() => {
//         const fetchData = async () => {
//             const sessionID = getDecryptedValue('sSessionID');
//             const userID = getDecryptedValue('sUserID');
            
//             if (!sessionID || !userID) {
//                 showInfoDialog(t('usermanagement.sessionexpired') || 'Session expired. Please login again.', "error");
//                 return;
//             }
            
//             await fetchOnlineUsers();
//         };
        
//         fetchData();
//     }, []);

//     // Update selected user when selectedRowId or onlineUsersData changes
//     useEffect(() => {
//         if (selectedRowId && onlineUsersData.length > 0) {
//             const selected = onlineUsersData.find(user => user.id === selectedRowId);
//             if (selected) {
//                 setSelectedUser(selected);
//             }
//         }
//     }, [selectedRowId, onlineUsersData]);

//     const columns = useMemo(() => [
//         {
//             key: 'L02UserName',
//             label: t('usermanagement.loginid'),
//             width: 120,
//             enableSearch: true,
//             render: (row, isSelected) => {
//                 let colorClass = 'text-gray-700';
//                 if (row.LoginStatus === 'Active') colorClass = 'text-[#008000]';
//                 else if (row.LoginStatus === 'InActive') colorClass = 'text-red-500';
                
//                 return (
//                     <div 
//                         className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${colorClass} ${isSelected ? 'font-bold' : ''}`}
//                         onClick={() => handleRowSelect(row)}
//                     >
//                         {row.L02UserName}
//                     </div>
//                 );
//             }
//         },
//         {
//             key: 'L02UserFullName',
//             label: t('usermanagement.userfullname'),
//             width: 150,
//             enableSearch: true,
//             render: (row, isSelected) => {
//                 return (
//                     <div 
//                         className={`text-[12px] font-['Verdana'] text-gray-700 truncate cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                         onClick={() => handleRowSelect(row)}
//                     >
//                         {row.L02UserFullName}
//                     </div>
//                 );
//             }
//         },
//         {
//             key: 'UserGroupName',
//             label: t('usermanagement.usergroupname'),
//             width: 120,
//             enableSearch: true,
//             render: (row, isSelected) => {
//                 return (
//                     <div 
//                         className={`text-[12px] font-['Verdana'] text-gray-700 truncate cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                         onClick={() => handleRowSelect(row)}
//                     >
//                         {row.UserGroupName}
//                     </div>
//                 );
//             }
//         },
//         {
//             key: 'LoginStatus',
//             label: t('usermanagement.userstatus'),
//             width: 100,
//             enableSearch: true,
//             render: (row, isSelected) => {
//                 let colorClass = 'text-gray-500';
//                 if (row.LoginStatus === 'Active') colorClass = 'text-[#008000]';
//                 else if (row.LoginStatus === 'InActive') colorClass = 'text-red-500';
                
//                 return (
//                     <div 
//                         className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${colorClass} ${isSelected ? 'font-bold' : ''}`}
//                         onClick={() => handleRowSelect(row)}
//                     >
//                         {row.LoginStatus}
//                     </div>
//                 );
//             }
//         }
//     ], [t, handleRowSelect]);

//     const renderUserDetail = useCallback((user) => (
//         <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.lastloggedon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.LastLoggedOn}
//                 </div>
//             </div>

//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.passwordexpiredon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.PassWordExpiryDate}
//                 </div>
//             </div>

//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.createdby')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.CreatedBy}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.createdon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.CreatedOn}
//                 </div>
//             </div>

//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedby')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.ModifiedBy}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('usermanagement.modifiedon')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {user.ModifiedOn}
//                 </div>
//             </div>
//         </div>
//     ), [t]);

//     const ActionButton = ({ icon: Icon, label, disabled, onClick, variant = "default" }) => (
//         <button
//             onClick={onClick}
//             disabled={disabled || isSubmitting}
//             className={`
//                 flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none 
//                 transition-all duration-200 whitespace-nowrap
//                 hover:scale-[0.98] hover:opacity-90
//                 ${disabled || isSubmitting
//                     ? variant === 'primary'
//                     ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
//                     : 'bg-[#f0f2f5dc] text-[#2885fecc] font-bold cursor-not-allowed'
//                     : variant === 'primary'
//                         ? 'bg-[#2883FE] text-white hover:bg-[#1c6fd8]'
//                         : variant === 'danger'
//                             ? 'bg-red-500 text-white hover:bg-red-600'
//                             : 'bg-[#f0f2f5] text-[#2883fe] font-bold hover:bg-[#E6F0FF]'
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

//                 {/* Audit Trail Modal for Force Logout */}
//                 {showAuditTrail && (
//                     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
//                         <AuditTrail 
//                             isOpen={showAuditTrail}
//                             onClose={handleAuditClose}
//                             onAuthorized={handleAuditAuthorized}
//                             actionLabel="Force Logout User"
//                             defaultReason="Forced logout"
//                             disableReason={false}
//                         />
//                     </div>
//                 )}

//                 {/* Chat Interface - Takes over the main content area only */}
//                 {showChat ? (
//                     <div className="h-full flex flex-col bg-white">
//                         {/* Chat Header - Matching the jQuery title bar */}
//                         <div className="w-full px-4 py-0 mt-1 flex items-center justify-between  ">
//                             <span className="text-sm font-roboto font-bold text-[#0049b0]">
//                                 {t('usermanagement.messages') || "Messages"}
//                             </span>
//                             <button
//                                 onClick={handleClearHistory}
//                                 type="button"
//                                 className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all"
//                             >
//                                 <i className="fa fa-eraser text-[#2883fe] font-bold w-15 h-15"></i>
//                                 <span className="text-[#2883fe] font-roboto text-[11px] font-bold">
//                                     {t('usermanagement.clear') || "Clear"}
//                                 </span>
//                             </button>
//                         </div>

//                         {/* Chat Content - 65%/33% split */}
//                         <div className="flex-1 flex p-4 gap-4 h-[calc(100%-48px)]">
//                             {/* Messages Inbox - 65% width */}
//                             <div className="w-2/3 h-full overflow-auto border border-gray-300 rounded-lg bg-white p-4">
//                                 {messages.length === 0 ? (
//                                     <div className="h-full flex flex-col items-center justify-center">
//                                         <h2 className="text-center text-gray-300 text-lg">
//                                             {t('usermanagement.nomessage') || "No Message"}
//                                             <i className="fa fa-frown-o ml-2"></i>
//                                         </h2>
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-3">
//                                         {messages.map((message) => (
//                                             <div
//                                                 key={message.id}
//                                                 className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
//                                             >
//                                                 <div
//                                                     className={`max-w-[70%] rounded-lg p-3 ${
//                                                         message.isOwn
//                                                             ? 'bg-blue-50 text-blue-900 rounded-tr-none border border-blue-100'
//                                                             : 'bg-gray-50 text-gray-900 rounded-tl-none border border-gray-200'
//                                                     }`}
//                                                 >
//                                                     <div className="text-xs font-semibold mb-1">
//                                                         {message.sender}
//                                                     </div>
//                                                     <div className="mb-1 text-sm">{message.text}</div>
//                                                     <div className="text-xs text-gray-500 text-right">
//                                                         {message.timestamp}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                         <div ref={messagesEndRef} />
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Send Message Panel - 33% width */}
//                             <div className="w-1/3 h-full flex flex-col">
//                                 {/* Form Fields */}
//                                 <div className="flex-1">
//                                     {/* To Field */}
//                                     <div className="mb-4">
//                                         <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
//                                             {t('usermanagement.to') || "To"} 
//                                             <span className="text-red-500 ml-1">*</span>
//                                         </label>
//                                         <AnimatedDropdown
//                                             name="toUser"
//                                             value={selectedUser?.L02UserID || ''}
//                                             options={activeUsers}
//                                             onChange={handleUserSelect}
//                                             displayKey="name"
//                                             valueKey="id"
//                                             isSearchable={true}
//                                             required={true}
//                                             showError={false}
//                                             disabled={sendingMessage}
//                                         />
//                                     </div>

//                                     {/* Message Field */}
//                                     <div className="mb-4">
//                                         <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
//                                             {t('usermanagement.message') || "Message"} 
//                                             <span className="text-red-500 ml-1">*</span>
//                                         </label>
//                                         <textarea
//                                             value={newMessage}
//                                             onChange={(e) => setNewMessage(e.target.value)}
//                                             className="w-full h-[280px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
//                                             disabled={sendingMessage}
//                                             onKeyDown={(e) => {
//                                                 if (e.key === 'Enter' && !e.shiftKey) {
//                                                     e.preventDefault();
//                                                     handleSendMessage();
//                                                 }
//                                             }}
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* Action Buttons */}
//                                 <div className="flex justify-end gap-2">
//                                     <button
//                                         type="button"
//                                         onClick={handleSendMessage}
//                                         disabled={!newMessage.trim() || sendingMessage || !selectedUser}
//                                         className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all disabled:cursor-not-allowed"
//                                     >
//                                         <i className="fa fa-paper-plane-o"></i>
//                                         <span>{t('usermanagement.send') || "Send"}</span>
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={handleClearMessage}
//                                         className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all"
//                                     >
//                                         <i className="fa fa-eraser"></i>
//                                         <span>{t('usermanagement.clear') || "Clear"}</span>
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={handleCloseChat}
//                                         className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all"
//                                     >
//                                         <i className="fa fa-times"></i>
//                                         <span>{t('usermanagement.close') || "Close"}</span>
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ) : (
//                     /* Main Online Users Interface */
//                     <>
//                         <div className="flex justify-end gap-2.5 p-3 bg-white">
//                             <ActionButton
//                                 icon={MessageSquare}
//                                 label={t('usermanagement.chat')}
//                                 onClick={handleChatClick}
//                                 disabled={!selectedUser}
//                             />
//                             <ActionButton
//                                 icon={LogOut}
//                                 label={t('usermanagement.logout')}
//                                 onClick={handleLogoutClick}
//                                 disabled={!selectedUser}
//                             />
//                             <ActionButton
//                                 icon={RefreshCw}
//                                 label={t('usermanagement.refresh')}
//                                 onClick={handleRefreshClick}
//                             />
//                         </div>

//                         <div className="flex-1 overflow-auto p-1 font-roboto text-[#353f49]">
//                             {loading ? (
//                                 <div className="text-center py-10 text-gray-500">
//                                     {t("login.loadingpasswordpolicy")}
//                                 </div>
//                             ) : (
//                                 <GridLayout
//                                     columns={columns}
//                                     height="100%"
//                                     detailPanelWidth="46%"
//                                     data={onlineUsersData}
//                                     getRowId={(row) => row.id}
//                                     renderDetailPanel={renderUserDetail}
//                                     onRowClick={handleRowSelect}
//                                     searchable={true}
//                                     selectable={true}
//                                     hidePagination={false}
//                                     rowClassName={(row) =>
//                                         row.id === selectedRowId
//                                             ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
//                                             : ""
//                                     }
//                                 />
//                             )}
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default OnlineUsers;

















































import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, LogOut, RefreshCw } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown.jsx';

const OnlineUsers = () => {
    const [onlineUsersData, setOnlineUsersData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    
    const { t } = useTranslation();
    const { postData } = servicecall();

    // Use refs to avoid stale state in callbacks
    const onlineUsersDataRef = useRef(onlineUsersData);
    const selectedUserRef = useRef(selectedUser);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        onlineUsersDataRef.current = onlineUsersData;
    }, [onlineUsersData]);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    // Scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current && showChat) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, showChat]);

    // Enhanced decryption function
    const getDecryptedValue = useCallback((key) => {
        try {
            const encryptedValue = sessionStorage.getItem(key);
            if (!encryptedValue) {
                return "";
            }
            
            if (typeof encryptedValue !== 'string' || encryptedValue.trim() === '') {
                return "";
            }
            
            try {
                const decrypted = CF_decrypt(encryptedValue);
                return decrypted || "";
            } catch (decryptError) {
                return encryptedValue;
            }
        } catch (error) {
            return "";
        }
    }, []);

    // Get active user details
    const getActiveUserDetails = useMemo(() => {
        return () => {
            const sUsername = getDecryptedValue("sUsername") || "Administrator";
            const sSiteCode = getDecryptedValue("sSiteCode") || "CH";
            const sUserGroupID = getDecryptedValue("sUserGroupID") || "G1";
            const sUserID = getDecryptedValue("sUserID") || "U1";
            const sSessionID = getDecryptedValue("sSessionID") || "";
            const sDomainName = getDecryptedValue("sDomainName") || "SDMS";
            const sTimeZoneID = getDecryptedValue("sTimeZoneID") || "Asia/Shanghai";
            const sdbtype = getDecryptedValue("sdbtype") || "MSSQL";
            const sCategories = getDecryptedValue("sCategories") || "DB";
            const sUserStatus = getDecryptedValue("sUserStatus") || "";
            const sTenantID = getDecryptedValue("sTenantID") || "";

            const formattedSiteCode = (sSiteCode || "CH").padEnd(10, ' ').substring(0, 10);
            const formattedUserGroupID = (sUserGroupID || "G1").padEnd(10, ' ').substring(0, 10);
            
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
                sUsername: sUsername,
                sCategories: sCategories,
                sSiteCode: formattedSiteCode,
                sUserID: sUserID,
                sUserDomainName: sDomainName,
                sUserGroupID: formattedUserGroupID,
                sTimeZoneID: timeZoneID,
                sSessionID: sSessionID,
                sUserStatus: sUserStatus,
                sApplicationName: "SDMS",
                sdbtype: sdbtype,
                sTenantID: sTenantID
            };
        };
    }, [getDecryptedValue]);

    // Build API request data
    const getApiRequestData = useCallback((additionalData = {}) => {
        const activeUserDetails = getActiveUserDetails();
        
        const requestData = {
            ApplicationCode: "SDMS",
            ActiveUserDetails: activeUserDetails,
            ...additionalData
        };
        
        return requestData;
    }, [getActiveUserDetails]);

    // Show info dialog
    const showInfoDialog = useCallback((message, type = "information") => {
        setInfoDialog({
            open: true,
            message,
            type
        });
    }, []);

    // Close info dialog
    const closeInfoDialog = useCallback(() => {
        setInfoDialog(prev => ({
            ...prev,
            open: false
        }));
    }, []);

    // Parse HTML chat history into message objects
    const parseChatHistory = useCallback((htmlContent) => {
        if (!htmlContent || typeof htmlContent !== 'string') {
            return [];
        }

        const messages = [];
        const divRegex = /<div class='(totxtdiv|fromtxtdiv)'>([\s\S]*?)<\/div>/g;
        const messageDivs = htmlContent.match(divRegex) || [];

        messageDivs.forEach((div, index) => {
            // Extract sender information
            const fromMatch = div.match(/Sent To <span class='clstouser'>(.*?)<\/span>/);
            const toMatch = div.match(/Received From <span class='clsfromuser'>(.*?)<\/span>/);
            
            // Extract message text
            const messageMatch = div.match(/<div class='(fromvalspan|tovalspan)'>(.*?)<\/div>/);
            
            // Extract timestamp
            const dateMatch = div.match(/<div class='clsdateformat'>(.*?)<\/div>/);

            if (messageMatch && (fromMatch || toMatch) && dateMatch) {
                const isOwn = div.includes('fromtxtdiv');
                const sender = isOwn ? "You" : (toMatch ? toMatch[1] : fromMatch[1]);
                const text = messageMatch[2];
                const timestamp = dateMatch[1];

                messages.push({
                    id: index + 1,
                    sender,
                    text,
                    timestamp,
                    isOwn
                });
            }
        });

        return messages;
    }, []);

    // Fetch active users for chat
    const fetchActiveUsers = useCallback(async () => {
        try {
            const requestData = getApiRequestData();
            
            const response = await postData("chatmessages/getActiveUsers", requestData);
            
            if (response && response.ActiveUsers && Array.isArray(response.ActiveUsers)) {
                // Format active users for dropdown
                const formattedActiveUsers = response.ActiveUsers.map(user => ({
                    id: user.sUserID?.trim() || "",
                    name: user.sUserName || ""
                }));
                setActiveUsers(formattedActiveUsers);
            } else {
                setActiveUsers([]);
            }
        } catch (error) {
            console.error('Error fetching active users:', error);
            setActiveUsers([]);
        }
    }, [postData, getApiRequestData]);

    // Process online users response
    const processOnlineUsersResponse = useCallback((response) => {
        let usersData = [];
        
        if (response && response.OnlineUsers && Array.isArray(response.OnlineUsers)) {
            usersData = response.OnlineUsers;
        } else if (response && response.oResObj && Array.isArray(response.oResObj)) {
            usersData = response.oResObj;
        } else if (response && response.returnservice && response.returnservice.oResObj) {
            usersData = response.returnservice.oResObj;
        } else if (Array.isArray(response)) {
            usersData = response;
        }
        
        if (usersData.length === 0) {
            setOnlineUsersData([]);
            return;
        }
        
        const formattedData = usersData.map((user, index) => ({
            id: index + 1,
            L02UserID: (user.L02UserID || "").trim(),
            L02UserName: user.L02UserName || "",
            L02UserFullName: user.L02UserFullName || "",
            UserGroupName: user.UserGroupName || "",
            UserStatus: user.UserStatus || "Active",
            LoginStatus: user.LoginStatus || "InActive",
            LastLoggedOn: user.LastLoggedOn || "",
            UTCLastLoggedOn: user.UTCLastLoggedOn || "",
            PassWordExpiryDate: user.PassWordExpiryDate || "",
            UTCPassWordExpiryDate: user.UTCPassWordExpiryDate || "",
            CreatedBy: user.CreatedBy || "System",
            CreatedOn: user.CreatedOn || "",
            UTCCreatedOn: user.UTCCreatedOn || "",
            ModifiedBy: user.ModifiedBy || null,
            ModifiedOn: user.ModifiedOn || null,
            UTCModifiedOn: user.UTCModifiedOn || null
        }));
        
        setOnlineUsersData(formattedData);
        
        if (selectedRowId && formattedData.length > 0) {
            const selected = formattedData.find(user => 
                user.L02UserID === selectedUserRef.current?.L02UserID
            );
            if (selected) {
                setSelectedUser(selected);
                setSelectedRowId(selected.id);
            } else if (formattedData.length > 0) {
                setSelectedUser(formattedData[0]);
                setSelectedRowId(formattedData[0].id);
            }
        } else if (formattedData.length > 0 && !selectedRowId) {
            setSelectedUser(formattedData[0]);
            setSelectedRowId(formattedData[0].id);
        }
    }, [selectedRowId]);

    // Fetch online users
    const fetchOnlineUsers = useCallback(async () => {
        setLoading(true);
        try {
            const requestData = getApiRequestData();
            
            const response = await postData("User/OnlineUsersGrid", requestData);
            
            if (!response) {
                showInfoDialog("Server returned null response", "error");
                return;
            }
            
            if (response.Rtn && response.Rtn !== "Success") {
                showInfoDialog(response.Message || response.returnMsg || "Failed to fetch online users", "error");
                return;
            }
            
            processOnlineUsersResponse(response);
            await fetchActiveUsers();
            
        } catch (error) {
            console.error('Error fetching online users:', error);
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                showInfoDialog("Cannot connect to server. Please check if the service is running.", "error");
            } else {
                showInfoDialog(t('usermanagement.failedtofetchonlineusers') || 'Failed to fetch online users', "error");
            }
        } finally {
            setLoading(false);
        }
    }, [postData, t, getApiRequestData, processOnlineUsersResponse, showInfoDialog, fetchActiveUsers]);

    // Fetch chat history
    const fetchChatHistory = useCallback(async (toUserID = null) => {
        try {
            const requestData = getApiRequestData({
                sActionType: "View",
                ...(toUserID && { sToUserID: toUserID })
            });
            
            const response = await postData("chatmessages/getChatHistory", requestData);
            
            if (response && response.ChatHistory) {
                if (typeof response.ChatHistory === 'string') {
                    const parsedMessages = parseChatHistory(response.ChatHistory);
                    setMessages(parsedMessages);
                } else {
                    setMessages([]);
                }
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            setMessages([]);
        }
    }, [postData, getApiRequestData, parseChatHistory]);

    // Send message
    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim() || !selectedUser) return;
        
        try {
            setSendingMessage(true);
            
            const requestData = getApiRequestData({
                sToUserName: selectedUser.L02UserFullName,
                sMessage: newMessage
            });
            
            const response = await postData("chatmessages/sendMessage", requestData);
            
            if (response && response.Rtn === "Success") {
                setNewMessage('');
                // Refresh chat history immediately
                await fetchChatHistory(selectedUser.L02UserID);
                showInfoDialog(t('usermanagement.messagesent') || "Message sent successfully", "success");
            } else {
                showInfoDialog(response?.Message || response?.returnMsg || t('usermanagement.messagesentfailed'), "error");
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            showInfoDialog(t('usermanagement.messagesentfailed') || "Failed to send message", 'error');
        } finally {
            setSendingMessage(false);
        }
    }, [newMessage, selectedUser, postData, getApiRequestData, fetchChatHistory, showInfoDialog, t]);

    // Clear chat history
    const handleClearHistory = useCallback(async () => {
        if (messages.length === 0) {
            showInfoDialog(t('usermanagement.youhavenohistoryhere') || "You have no history here", "warning");
            return;
        }
        
        if (window.confirm(t('usermanagement.chatconfirmation') || "Are you sure you want to clear chat history?")) {
            try {
                const requestData = getApiRequestData();
                
                const response = await postData("chatmessages/clearChatHistory", requestData);
                
                if (response && response.Rtn === "Success") {
                    setMessages([]);
                    showInfoDialog(t('usermanagement.chathistorydeletesuccess') || "Chat history deleted successfully", "success");
                } else {
                    showInfoDialog(response?.Message || response?.returnMsg || t('usermanagement.clearchatfailed'), "error");
                }
            } catch (error) {
                console.error('Error clearing chat history:', error);
                showInfoDialog(t('usermanagement.clearchatfailed') || "Failed to clear chat history", 'error');
            }
        }
    }, [messages, postData, getApiRequestData, showInfoDialog, t]);

    // Force logout
    const handleForceLogout = useCallback(async (auditTrailValues = null) => {
        const currentSelectedUser = selectedUserRef.current;
        
        if (!currentSelectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive') || "Please select a user", "warning");
            return;
        }
        
        try {
            setIsSubmitting(true);
            
            const currentUsername = getDecryptedValue("sUsername") || "";
            const isAdminUser = currentUsername.toUpperCase() === "SDMSADMIN";
            
            if (!isAdminUser) {
                showInfoDialog(t('usermanagement.unauthorizedlogout') || "Unauthorized to perform logout", "warning");
                return;
            }
            
            if (currentSelectedUser.LoginStatus === 'InActive') {
                showInfoDialog(t('usermanagement.userinactive') || "User is already inactive", "warning");
                return;
            }
            
            let requestData = getApiRequestData({
                sLogoutUserID: currentSelectedUser.L02UserID.padEnd(10, ' ')
            });

            if (auditTrailValues) {
                requestData.AuditTrailValues = auditTrailValues;
            }
            
            const response = await postData("User/ForceLogOut", requestData);
            
            if (!response) {
                showInfoDialog(t('usermanagement.forcelogoutfailed') || "Force logout failed", "error");
                return;
            }
            
            if (response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || "Audit trail authentication failed", "error");
                return;
            }
            
            if (response.Rtn === "Success") {
                showInfoDialog(`${t('usermanagement.forcelogoutsuccess') || "Force logout successful for"} ${currentSelectedUser.L02UserFullName}`, "success");
                
                if (response.OnlineUsers) {
                    processOnlineUsersResponse(response);
                } else if (response.returnservice && response.returnservice.oResObj) {
                    processOnlineUsersResponse(response.returnservice);
                } else if (response.oResObj) {
                    processOnlineUsersResponse(response);
                } else {
                    await fetchOnlineUsers();
                }
                
                setSelectedUser(null);
                setSelectedRowId(null);
            } else {
                showInfoDialog(response.Message || response.returnMsg || t('usermanagement.forcelogoutfailed'), "error");
            }
            
        } catch (error) {
            console.error('Error in force logout:', error);
            showInfoDialog(t('usermanagement.forcelogoutfailed') || "Force logout failed", "error");
        } finally {
            setIsSubmitting(false);
            setShowAuditTrail(false);
        }
    }, [postData, showInfoDialog, t, getApiRequestData, fetchOnlineUsers, processOnlineUsersResponse, getDecryptedValue]);

    const handleAuditAuthorized = useCallback((auditData) => {
        const auditTrailValues = auditData.AuditTrailValues;
        
        if (!auditTrailValues) {
            showInfoDialog("Audit trail data is missing", "error");
            setShowAuditTrail(false);
            return;
        }
        
        setShowAuditTrail(false);
        handleForceLogout(auditTrailValues);
    }, [handleForceLogout, showInfoDialog]);

    const handleAuditClose = useCallback(() => {
        setShowAuditTrail(false);
    }, []);

    const handleRowSelect = useCallback((row) => {
        setSelectedUser(row);
        setSelectedRowId(row.id);
    }, []);

    const handleRefreshClick = useCallback(async () => {
        await fetchOnlineUsers();
        showInfoDialog(t('usermanagement.refreshsuccess') || "Refresh successful", "success");
    }, [fetchOnlineUsers, showInfoDialog, t]);

    const handleChatClick = useCallback(async () => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive') || "Please select a user", "warning");
            return;
        }
        
        const isUserActive = activeUsers.some(user => 
            user.id?.trim() === selectedUser.L02UserID?.trim()
        );
        
        if (!isUserActive) {
            showInfoDialog(`${selectedUser.L02UserFullName} is not active for chat`, "warning");
            return;
        }
        
        setShowChat(true);
        await fetchChatHistory(selectedUser.L02UserID);
    }, [selectedUser, showInfoDialog, t, activeUsers, fetchChatHistory]);

    const handleCloseChat = useCallback(() => {
        setShowChat(false);
        setMessages([]);
        setNewMessage('');
    }, []);

    const handleClearMessage = useCallback(() => {
        setNewMessage('');
    }, []);

    const handleLogoutClick = useCallback(() => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive') || "Please select a user", "warning");
            return;
        }
        
        const currentUsername = getDecryptedValue("sUsername") || "";
        const isAdminUser = currentUsername.toUpperCase() === "SDMSADMIN";
        
        if (!isAdminUser) {
            showInfoDialog(t('usermanagement.unauthorizedlogout') || "Unauthorized to perform logout", "warning");
            return;
        }
        
        if (selectedUser.LoginStatus === 'InActive') {
            showInfoDialog(t('usermanagement.userinactive') || "User is already inactive", "warning");
            return;
        }
        
        setShowAuditTrail(true);
    }, [selectedUser, showInfoDialog, t, getDecryptedValue]);

    // Handle dropdown selection for active users
    const handleUserSelect = useCallback((e) => {
        const selectedUserId = e.target.value;
        if (selectedUserId) {
            // Find the corresponding online user
            const onlineUser = onlineUsersData.find(user => 
                user.L02UserID?.trim() === selectedUserId?.trim()
            );
            if (onlineUser) {
                setSelectedUser(onlineUser);
                setSelectedRowId(onlineUser.id);
            }
        }
    }, [onlineUsersData]);

    // Initial data fetch
    useEffect(() => {
        const fetchData = async () => {
            const sessionID = getDecryptedValue('sSessionID');
            const userID = getDecryptedValue('sUserID');
            
            if (!sessionID || !userID) {
                showInfoDialog(t('usermanagement.sessionexpired') || 'Session expired. Please login again.', "error");
                return;
            }
            
            await fetchOnlineUsers();
        };
        
        fetchData();
    }, []);

    // Update selected user when selectedRowId or onlineUsersData changes
    useEffect(() => {
        if (selectedRowId && onlineUsersData.length > 0) {
            const selected = onlineUsersData.find(user => user.id === selectedRowId);
            if (selected) {
                setSelectedUser(selected);
            }
        }
    }, [selectedRowId, onlineUsersData]);

    const columns = useMemo(() => [
        {
            key: 'L02UserName',
            label: (
                <div> 
                    <span className="text-[12px] font-roboto text-[#353f49] font-bold">
                        {t('usermanagement.loginid') || 'Login ID'}
                    </span>
                </div>
            ),
            width: 120,
            enableSearch: true,
            render: (row, isSelected) => {
                let colorClass = 'text-gray-700';
                if (row.LoginStatus === 'Active') colorClass = 'text-[#008000]';
                else if (row.LoginStatus === 'InActive') colorClass = 'text-red-500';
                
                return (
                    <div 
                        className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${colorClass} ${isSelected ? 'font-bold' : ''}`}
                        onClick={() => handleRowSelect(row)}
                    >
                        {row.L02UserName}
                    </div>
                );
            }
        },
        {
            key: 'L02UserFullName',
            label: (
                <div> 
                    <span className="text-[12px] font-roboto text-[#353f49] font-bold">
                        {t('usermanagement.userfullname') || 'User Full Name'}
                    </span>
                </div>
            ),
            width: 150,
            enableSearch: true,
            render: (row, isSelected) => {
                return (
                    <div 
                        className={`text-[12px] font-['Verdana'] text-gray-700 truncate cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                        onClick={() => handleRowSelect(row)}
                    >
                        {row.L02UserFullName}
                    </div>
                );
            }
        },
        {
            key: 'UserGroupName',
            label: (
                <div> 
                    <span className="text-[12px] font-roboto text-[#353f49] font-bold">
                        {t('usermanagement.usergroupname') || 'User Group Name'}
                    </span>
                </div>
            ),
            width: 120,
            enableSearch: true,
            render: (row, isSelected) => {
                return (
                    <div 
                        className={`text-[12px] font-['Verdana'] text-gray-700 truncate cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                        onClick={() => handleRowSelect(row)}
                    >
                        {row.UserGroupName}
                    </div>
                );
            }
        },
        {
            key: 'LoginStatus',
            label: (
                <div> 
                    <span className="text-[12px] font-roboto text-[#353f49] font-bold">
                        {t('usermanagement.userstatus') || 'User Status'}
                    </span>
                </div>
            ),
            width: 100,
            enableSearch: true,
            render: (row, isSelected) => {
                let colorClass = 'text-gray-500';
                if (row.LoginStatus === 'Active') colorClass = 'text-[#008000]';
                else if (row.LoginStatus === 'InActive') colorClass = 'text-red-500';
                
                return (
                    <div 
                        className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${colorClass} ${isSelected ? 'font-bold' : ''}`}
                        onClick={() => handleRowSelect(row)}
                    >
                        {row.LoginStatus}
                    </div>
                );
            }
        }
    ], [t, handleRowSelect]);

    const renderUserDetail = useCallback((user) => (
        <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.lastloggedon') || 'Last Logged On'}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.LastLoggedOn}
                </div>
            </div>

            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.passwordexpiredon') || 'Password Expired On'}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.PassWordExpiryDate}
                </div>
            </div>

            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.createdby') || 'Created By'}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.CreatedBy}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.createdon') || 'Created On'}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.CreatedOn}
                </div>
            </div>

            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.modifiedby') || 'Modified By'}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.ModifiedBy || '-'}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('usermanagement.modifiedon') || 'Modified On'}
                </div>
                <div className="w-3/5 text-gray-800">
                    {user.ModifiedOn || '-'}
                </div>
            </div>
        </div>
    ), [t]);

    const ActionButton = ({ icon: Icon, label, disabled, onClick, variant = "default" }) => (
        <button
            onClick={onClick}
            disabled={disabled || isSubmitting}
            className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none 
                transition-all duration-200 whitespace-nowrap
                hover:scale-[0.98] hover:opacity-90
                ${disabled || isSubmitting
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
            <div className="h-full flex flex-col bg-white">
                {infoDialog.open && (
                    <Errordialog
                        message={infoDialog.message}
                        type={infoDialog.type}
                        onClose={closeInfoDialog}
                    />
                )}

                {/* Audit Trail Modal for Force Logout */}
                {showAuditTrail && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
                        <AuditTrail 
                            isOpen={showAuditTrail}
                            onClose={handleAuditClose}
                            onAuthorized={handleAuditAuthorized}
                            actionLabel="Force Logout User"
                            defaultReason="Forced logout"
                            disableReason={false}
                        />
                    </div>
                )}

                {/* Chat Interface - Takes over the main content area only */}
                {showChat ? (
                    <div className="h-full flex flex-col bg-white">
                        {/* Chat Header - Matching the jQuery title bar */}
                        <div className="w-full px-4 py-0 mt-1 flex items-center justify-between">
                            <span className="text-sm font-roboto font-bold text-[#0049b0]">
                                {t('usermanagement.messages') || "Messages"}
                            </span>
                            <button
                                onClick={handleClearHistory}
                                type="button"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all"
                            >
                                <i className="fa fa-eraser text-[#2883fe] font-bold w-15 h-15"></i>
                                <span className="text-[#2883fe] font-roboto text-[11px] font-bold">
                                    {t('usermanagement.clear') || "Clear"}
                                </span>
                            </button>
                        </div>

                        {/* Chat Content - 65%/33% split */}
                        <div className="flex-1 flex p-4 gap-4 h-[calc(100%-48px)]">
                            {/* Messages Inbox - 65% width */}
                            <div className="w-2/3 h-full overflow-auto border border-gray-300 rounded-lg bg-white p-4">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <h2 className="text-center text-gray-300 text-lg">
                                            {t('usermanagement.nomessage') || "No Message"}
                                            <i className="fa fa-frown-o ml-2"></i>
                                        </h2>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg p-3 ${
                                                        message.isOwn
                                                            ? 'bg-blue-50 text-blue-900 rounded-tr-none border border-blue-100'
                                                            : 'bg-gray-50 text-gray-900 rounded-tl-none border border-gray-200'
                                                    }`}
                                                >
                                                    <div className="text-xs font-semibold mb-1">
                                                        {message.sender}
                                                    </div>
                                                    <div className="mb-1 text-sm">{message.text}</div>
                                                    <div className="text-xs text-gray-500 text-right">
                                                        {message.timestamp}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Send Message Panel - 33% width */}
                            <div className="w-1/3 h-full flex flex-col">
                                {/* Form Fields */}
                                <div className="flex-1">
                                    {/* To Field */}
                                    <div className="mb-4">
                                        <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
                                            {t('usermanagement.to') || "To"} 
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <AnimatedDropdown
                                            name="toUser"
                                            value={selectedUser?.L02UserID || ''}
                                            options={activeUsers}
                                            onChange={handleUserSelect}
                                            displayKey="name"
                                            valueKey="id"
                                            isSearchable={true}
                                            required={true}
                                            showError={false}
                                            disabled={sendingMessage}
                                        />
                                    </div>

                                    {/* Message Field */}
                                    <div className="mb-4">
                                        <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
                                            {t('usermanagement.message') || "Message"} 
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="w-full h-[280px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                            disabled={sendingMessage}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() || sendingMessage || !selectedUser}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all disabled:cursor-not-allowed"
                                    >
                                        <i className="fa fa-paper-plane-o"></i>
                                        <span>{t('usermanagement.send') || "Send"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClearMessage}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all"
                                    >
                                        <i className="fa fa-eraser"></i>
                                        <span>{t('usermanagement.clear') || "Clear"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseChat}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all"
                                    >
                                        <i className="fa fa-times"></i>
                                        <span>{t('usermanagement.close') || "Close"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Main Online Users Interface */
                    <>
                        <div className="flex justify-end gap-2.5 p-3 bg-white">
                            <ActionButton
                                icon={MessageSquare}
                                label={t('usermanagement.chat') || "Chat"}
                                onClick={handleChatClick}
                                disabled={!selectedUser}
                            />
                            <ActionButton
                                icon={LogOut}
                                label={t('usermanagement.logout') || "Logout"}
                                onClick={handleLogoutClick}
                                disabled={!selectedUser}
                            />
                            <ActionButton
                                icon={RefreshCw}
                                label={t('usermanagement.refresh') || "Refresh"}
                                onClick={handleRefreshClick}
                            />
                        </div>

                        <div className="flex-1 overflow-auto p-1 font-roboto text-[#353f49]">
                            {loading ? (
                                <div className="text-center py-10 text-gray-500">
                                    {t("login.loadingpasswordpolicy") || "Loading..."}
                                </div>
                            ) : (
                                <GridLayout
                                    columns={columns}
                                    height="100%"
                                    detailPanelWidth="46%"
                                    data={onlineUsersData}
                                    getRowId={(row) => row.id}
                                    renderDetailPanel={renderUserDetail}
                                    onRowClick={handleRowSelect}
                                    searchable={true}
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
                    </>
                )}
            </div>
        </div>
    );
};

export default OnlineUsers;