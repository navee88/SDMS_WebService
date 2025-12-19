import { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, Edit, UserCheck, UserX, Plus } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';

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
            EnableSearch:true,
            render: (row, isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.L01UserGroupName}</span>
                </div>
            )
        },
        {
            key: 'gStatus',
            label: t('usermanagement.userstatus'),
            width: 150,
            EnableSearch:true,
            render: (row, isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: row.gStatus === 'Active' ? '#0a7350' : '#ef4444',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.gStatus}</span>
                </div>
            )
        }
    ], [selectedRowId, t]);

    const renderGroupDetail = useCallback((group) => (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '14px',
            fontWeight: '600',
            fontFamily: 'Roboto, sans-serif',
            fontSize: '12px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.createdby')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {group.gCreatedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.createdon')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {group.gCreatedOn}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.modifiedby')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {group.gModifiedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('usermanagement.modifiedon')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {group.gModifiedOn}
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
                    icon={Plus}
                    label={t('usermanagement.addnewgroup')}
                    onClick={handleAddClick}
                />
                <ActionButton
                    icon={Edit}
                    label={t('usermanagement.edit')}
                    onClick={handleEditClick}
                    // disabled={!selectedGroup}
                />
                <ActionButton
                    icon={UserX}
                    label={t('usermanagement.activedeactive')}
                    onClick={handleActiveDeactiveClick}
                    // disabled={!selectedGroup}
                />
            </div>

            {/* Main GridLayout with Details Panel */}
            <div style={{ flex: 1 ,fontFamily: 'verdana, sans-serif',}}>
                <GridLayout
                    columns={columns}
                    data={userGroupData}
                    renderDetailPanel={renderGroupDetail}
                    onRowSelect={handleRowSelect}
                    searchable={false}
                    selectable={true}
                    hidePagination={false}
                />
            </div>

            {/* Add/Edit User Group Popup */}
            {activePopup && (
                <CustomPopup
                    isOpen={!!activePopup}
                    onClose={handlePopupClose}
                    title={activePopup}
                    content={
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '16px',
                            padding: '8px'
                        }}>
                            {/* Hidden Group ID field */}
                            <input
                                type="hidden"
                                value={formData.sUserGroupID}
                            />

                            {/* Group Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                    {t('usermanagement.groupname')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.sGroupName}
                                    onChange={(e) => handleFormChange('sGroupName', e.target.value)}
                                    maxLength={50}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        border: formErrors.sGroupName ? '1px solid #ef4444' : '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        outline: 'none'
                                    }}
                                    placeholder={t('usermanagement.entergroupname')}
                                />
                                {formErrors.sGroupName && (
                                    <div style={{ color: '#ef4444', fontSize: '12px' }}>
                                        {formErrors.sGroupName}
                                    </div>
                                )}
                            </div>

                            {/* Form Buttons */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                gap: '12px',
                                paddingTop: '12px',
                                marginTop: '8px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <button
                                    onClick={handleSubmit}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'white',
                                        backgroundColor: '#3b82f6',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Edit style={{ width: '16px', height: '16px' }} /> {t('usermanagement.submit')}
                                </button>
                                <button
                                    onClick={handlePopupClose}
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

export default UserGroup;