import { useState, useMemo, useEffect, useCallback } from 'react';
import { MessageSquare, LogOut, RefreshCw, Users } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';

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
    const [logoutPopup, setLogoutPopup] = useState(false);
    const { t } = useTranslation();

    // Mock data for online users
    const mockOnlineUsersData = [
        {
            id: 1,
            L02UserID: "USR-001",
            L02UserName: "admin",
            L02UserFullName: "Administrator",
            UserGroupName: "Administrator",
            LoginStatus: "Active",
            LastLoggedOn: "2024-12-22 10:30:00",
            PassWordExpiryDate: "2025-03-22",
            CreatedBy: "System",
            CreatedOn: "2024-01-01 09:00:00",
            ModifiedBy: "Admin",
            ModifiedOn: "2024-12-20 15:00:00",
        },
        {
            id: 2,
            L02UserID: "USR-002",
            L02UserName: "john.doe",
            L02UserFullName: "John Doe",
            UserGroupName: "Lab Technician",
            LoginStatus: "Active",
            LastLoggedOn: "2024-12-22 09:15:00",
            PassWordExpiryDate: "2025-02-15",
            CreatedBy: "Admin",
            CreatedOn: "2024-01-10 10:00:00",
            ModifiedBy: "Admin",
            ModifiedOn: "2024-12-18 14:00:00",
        },
        {
            id: 3,
            L02UserID: "USR-003",
            L02UserName: "jane.smith",
            L02UserFullName: "Jane Smith",
            UserGroupName: "View Only",
            LoginStatus: "InActive",
            LastLoggedOn: "2024-12-21 16:45:00",
            PassWordExpiryDate: "2025-01-30",
            CreatedBy: "Admin",
            CreatedOn: "2024-01-12 09:00:00",
            ModifiedBy: "Admin",
            ModifiedOn: "2024-12-19 11:00:00",
        }
    ];

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setOnlineUsersData(mockOnlineUsersData);
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

    const handleRefreshClick = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            // Simulate API refresh
            setOnlineUsersData(mockOnlineUsersData);
            setLoading(false);
            showInfoDialog(t('usermanagement.refreshsuccess'), "success");
        }, 500);
    }, [t, showInfoDialog]);

    const handleChatClick = useCallback(() => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        // Simulate chat functionality
        showInfoDialog(`${t('usermanagement.initiatechat')} ${selectedUser.L02UserFullName}`, "information");
        
        // TODO: Implement actual chat functionality
        // This would navigate to chat interface with selected user
    }, [selectedUser, showInfoDialog, t]);

    const handleLogoutClick = useCallback(() => {
        if (!selectedUser) {
            showInfoDialog(t('usermanagement.gridactivedeactive'), "warning");
            return;
        }
        
        // Check if user is SDMSADMIN or similar admin user
        const isAdminUser = true; // Replace with actual check
        
        if (!isAdminUser) {
            showInfoDialog(t('usermanagement.unauthorizedlogout'), "warning");
            return;
        }
        
        // Check if selected user is active
        if (selectedUser.LoginStatus === 'InActive') {
            showInfoDialog(t('usermanagement.userinactive'), "warning");
            return;
        }
        
        // Show confirmation dialog
        setLogoutPopup(true);
    }, [selectedUser, showInfoDialog, t]);

    const confirmLogout = useCallback(() => {
        try {
            // Simulate API call for force logout
            setTimeout(() => {
                showInfoDialog(`${t('usermanagement.forcelogoutsuccess')} ${selectedUser.L02UserFullName}`, "success");
                
                // Update user status to inactive
                setOnlineUsersData(prev => 
                    prev.map(user => 
                        user.id === selectedUser.id 
                            ? { ...user, LoginStatus: 'InActive' } 
                            : user
                    )
                );
                
                setLogoutPopup(false);
                setSelectedUser(null);
                setSelectedRowId(null);
            }, 500);
            
        } catch (error) {
            showInfoDialog(t('usermanagement.forcelogoutfailed'), "error");
        }
    }, [selectedUser, showInfoDialog, t]);

 const columns = useMemo(() => [
    {
        key: 'L02UserName',
        label: t('usermanagement.loginid'),
        width: 120,
        enableSearch: true,
        render: (row, isSelected) => (
            <div style={{ 
                fontSize: '12px', 
                fontFamily:'verdana',
                color: '#374151',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
            }}>
                <span className={isSelected ? "font-bold" : ''}>{row.L02UserName}</span>
            </div>
        )
    },
    {
        key: 'L02UserFullName',
        label: t('usermanagement.userfullname'),
        width: 150,
        enableSearch: true,
        render: (row, isSelected) => (
            <div style={{ 
                fontSize: '12px', 
                fontFamily:'verdana',
                color: '#374151',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
            }}>
                <span className={isSelected ? "font-bold" : ''}>{row.L02UserFullName}</span>
            </div>
        )
    },
    {
        key: 'UserGroupName',
        label: t('usermanagement.usergroupname'),
        width: 120,
        enableSearch: true,
        render: (row, isSelected) => (
            <div style={{ 
                fontSize: '12px', 
                fontFamily:'verdana',
                color: '#374151',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
            }}>
                <span className={isSelected ? "font-bold" : ''}>{row.UserGroupName}</span>
            </div>
        )
    },
    {
        key: 'UserStatus',
        label: t('usermanagement.userstatus'),
        width: 100,
        enableSearch: true,
        render: (row, isSelected) => {
            let color = '#6b7280';
            if (row.UserStatus === 'Active') color = '#0a7350';
            else if (row.UserStatus === 'Deactive') color = '#f59e0b';
            else if (row.UserStatus === 'Locked') color = '#ef4444';
            else if (row.UserStatus === 'Retired') color = '#8b5cf6';
            else if (row.UserStatus === 'Unapproved') color = '#8b5cf6';
            
            return (
                <div style={{ 
                    fontSize: '14px', 
                    color: color,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.UserStatus}</span>
                </div>
            );
        }
    }
], [selectedRowId, t]);

    const renderUserDetail = useCallback((user) => (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '12px',
            fontWeight: '600',
            fontFamily: 'Roboto, sans-serif',
            fontSize: '12px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.lastloggedon')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {user.LastLoggedOn}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.passwordexpiredon')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {user.PassWordExpiryDate}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.createdby')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {user.CreatedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.createdon')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {user.CreatedOn}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.modifiedby')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {user.ModifiedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.modifiedon')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {user.ModifiedOn}
                </div>
            </div>

        </div>
    ), [t]);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%' 
            }}>
                <div style={{ color: '#6b7280' }}>{t('masters.loading')}</div>
            </div>
        );
    }

    const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "", variant = "default" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '4px',
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                backgroundColor: disabled 
                    ? '#f8fafc' 
                    : variant === 'primary'
                        ? '#2883FE'
                        : variant === 'danger'
                            ? '#ef4444'
                            : '#f1f5f9',
                color: disabled 
                    ? '#cbd5e1' 
                    : variant === 'primary' || variant === 'danger'
                        ? 'white'
                        : '#2883FE'
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'scale(0.98)';
                    e.currentTarget.style.opacity = '0.9';
                    
                    if (variant === 'default') {
                        e.currentTarget.style.backgroundColor = '#E6F0FF';
                    } else if (variant === 'primary') {
                        e.currentTarget.style.backgroundColor = '#1c6fd8';
                    } else if (variant === 'danger') {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                    }
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '1';
                    
                    if (variant === 'default') {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                    } else if (variant === 'primary') {
                        e.currentTarget.style.backgroundColor = '#2883FE';
                    } else if (variant === 'danger') {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                    }
                }
            }}
        >
            {Icon && <Icon style={{ width: '14px', height: '14px' }} />}
            <span>{label}</span>
        </button>
    );

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
        }}>
            {/* Error/Info Dialog */}
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

            {/* Top Action Buttons */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '10px', 
                padding: '10px',
                background: 'white',
                marginBottom: '0px',
                marginTop: '2px',
            }}>
                <ActionButton
                    icon={MessageSquare}
                    label={t('usermanagement.chat')}
                    onClick={handleChatClick}
                    // disabled={!selectedUser}
                />
                <ActionButton
                    icon={LogOut}
                    label={t('usermanagement.logout')}
                    onClick={handleLogoutClick}
                    // disabled={!selectedUser}
                />
                <ActionButton
                    icon={RefreshCw}
                    label={t('usermanagement.refresh')}
                    onClick={handleRefreshClick}
                />
            </div>

            {/* Main GridLayout with Details Panel */}
            <div style={{ flex: 1, fontSize:"12px" }}>
                <GridLayout
                    columns={columns}
                    data={onlineUsersData}
                    renderDetailPanel={renderUserDetail}
                    onRowClick={handleRowSelect}
                    searchable={true}
                    selectable={true}
                    hidePagination={false}
                />
            </div>

            {/* Logout Confirmation Popup */}
            {logoutPopup && (
                <CustomPopup
                    isOpen={logoutPopup}
                    onClose={() => setLogoutPopup(false)}
                    title={t('usermanagement.confirmlogout')}
                    content={
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '16px',
                            padding: '8px'
                        }}>
                            <div style={{ fontSize: '14px', color: '#374151' }}>
                                {t('usermanagement.logoutconfirmation')} <strong>{selectedUser?.L02UserFullName}</strong>?
                            </div>
                            
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                gap: '12px',
                                paddingTop: '12px',
                                marginTop: '8px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <button
                                    onClick={confirmLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'white',
                                        backgroundColor: '#ef4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <LogOut style={{ width: '16px', height: '16px' }} /> {t('usermanagement.confirm')}
                                </button>
                                <button
                                    onClick={() => setLogoutPopup(false)}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#374151',
                                        backgroundColor: 'white',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
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
    );
};

export default OnlineUsers;