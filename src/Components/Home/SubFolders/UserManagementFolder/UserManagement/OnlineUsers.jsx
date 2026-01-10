import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, LogOut, RefreshCw } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog.jsx';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';
import ChatInterface from './ChatInterface.jsx';
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
    const [activeUsers, setActiveUsers] = useState([]);
   const chatRef = useRef(null);
    const { t } = useTranslation();
    const { postData } = servicecall();

    // Use refs to avoid stale state in callbacks
    const onlineUsersDataRef = useRef(onlineUsersData);
    const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    debugger
    const elements = document.getElementsByClassName("usm");
    if (elements.length > 0) {
        elements[0].scrollIntoView({ behavior: "smooth" });
    }
}, [showChat]);

    useEffect(() => {
        onlineUsersDataRef.current = onlineUsersData;
    }, [onlineUsersData]);
 
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

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
    }, [selectedUser, showInfoDialog, t, activeUsers]);

    const handleCloseChat = ()=>{
        setShowChat(false);
    }

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
    <div className="h-full overflow-hidden bg-[#f5f7fb]" >
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

            {/* Action buttons should always be visible */}
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

            {/* Chat Interface - Overlay style */}
            {showChat && (

                 <ChatInterface
                        selectedUser={selectedUser}
                        activeUsers={activeUsers}
                        onUserSelect={handleUserSelect}
                        onClose={handleCloseChat}
                        getApiRequestData={getApiRequestData}
                        postData={postData}
                        showInfoDialog={showInfoDialog}
                        t={t}
                       
                    />
            
        
            )}

            {/* Main Online Users Interface - Always rendered, just hidden when chat is open */}
            <div className={`flex-1 overflow-auto p-1 font-roboto text-[#353f49] ${showChat ? 'hidden' : ''}`}>
                {loading ? (
                    <div className="text-center py-10 text-gray-500">
                        {t("common.loading") || "Loading..."}
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
        </div>
    </div>
);
};

export default OnlineUsers;