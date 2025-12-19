import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Edit, Eye, Download, Printer } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';

const Domain = () => {
    const [domainData, setDomainData] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });
    const [activePopup, setActivePopup] = useState(null);
    const [auditTrailData, setAuditTrailData] = useState({
        username: "Administrator",
        password: "",
        reason: "",
        comments: ""
    });
    const [formData, setFormData] = useState({
        sDomainID: "",
        sDomainName: "",
        sCategories: "Server",
        sLoginDomainName: "",
        sdomainusername: "",
        sdomainpassword: "",
        iDomainStatus: 1
    });
    const [formErrors, setFormErrors] = useState({});
    const { t } = useTranslation();

    // Mock data for domain master
    const mockDomainData = [
        {
            id: 1,
            sDomainID: "DOM-001",
            sDomainName: "SDMS",
            sLoginDomainName: "SDMS Domain",
            sCategories: "DB",
            sDomainStatus: "Active",
            sCreatedBy: "Admin",
            dCreatedOn: "2024-01-10 09:00",
            dUTCCreatedOn: "2024-01-10 07:00",
            sModifiedBy: "Admin",
            dModifiedOn: "2024-01-12 11:00",
            dUTCModifiedOn: "2024-01-12 09:00"
        },
        {
            id: 2,
            sDomainID: "DOM-002",
            sDomainName: "Corporate",
            sLoginDomainName: "Corporate Network",
            sCategories: "Server",
            sDomainStatus: "Active",
            sCreatedBy: "Admin",
            dCreatedOn: "2024-01-15 10:00",
            dUTCCreatedOn: "2024-01-15 08:00",
            sModifiedBy: "User",
            dModifiedOn: "2024-02-01 14:00",
            dUTCModifiedOn: "2024-02-01 12:00"
        },
        {
            id: 3,
            sDomainID: "DOM-003",
            sDomainName: "LabNetwork",
            sLoginDomainName: "Laboratory Domain",
            sCategories: "Server",
            sDomainStatus: "Inactive",
            sCreatedBy: "Admin",
            dCreatedOn: "2024-02-01 09:00",
            dUTCCreatedOn: "2024-02-01 07:00",
            sModifiedBy: "Admin",
            dModifiedOn: "2024-02-05 16:00",
            dUTCModifiedOn: "2024-02-05 14:00"
        }
    ];

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setDomainData(mockDomainData);
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
        setSelectedDomain(row);
        setSelectedRowId(row.id);
    }, []);

    const handleAddClick = useCallback(() => {
        setFormData({
            sDomainID: "",
            sDomainName: "",
            sCategories: "Server",
            sLoginDomainName: "",
            sdomainusername: "",
            sdomainpassword: "",
            iDomainStatus: 1
        });
        setFormErrors({});
        setActivePopup(t('masters.adddomain'));
    }, [t]);

    const handleEditClick = useCallback(() => {
        if (!selectedDomain) {
            showInfoDialog(t('masters.selectRecord'), "warning");
            return;
        }
        
        // Disable edit for SDMS domain
        if (selectedDomain.sDomainName === "SDMS") {
            showInfoDialog(t('masters.sdmsEditDisabled'), "warning");
            return;
        }
        
        setFormData({
            sDomainID: selectedDomain.sDomainID,
            sDomainName: selectedDomain.sDomainName,
            sCategories: selectedDomain.sCategories,
            sLoginDomainName: selectedDomain.sLoginDomainName,
            sdomainusername: "", // Would come from API in real implementation
            sdomainpassword: "", // Would come from API in real implementation
            iDomainStatus: selectedDomain.sDomainStatus === "Active" ? 1 : 0
        });
        setFormErrors({});
        setActivePopup(t('masters.editdomain'));
    }, [selectedDomain, showInfoDialog, t]);

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

    const handleCategoryChange = useCallback((value) => {
        setFormData(prev => ({
            ...prev,
            sCategories: value
        }));
    }, []);

    const validateForm = useCallback(() => {
        const errors = {};
        
        if (!formData.sDomainName.trim()) {
            errors.sDomainName = t('masters.domainNameRequired');
        }
        
        if (!formData.sdomainusername.trim() && formData.sCategories !== "DB") {
            errors.sdomainusername = t('masters.usernameRequired');
        }
        
        if (!formData.sdomainpassword.trim() && formData.sCategories !== "DB") {
            errors.sdomainpassword = t('masters.passwordRequired');
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
            const isEdit = formData.sDomainID !== "";
            if (isEdit) {
                showInfoDialog(t('masters.domainUpdated'), "success");
            } else {
                showInfoDialog(t('masters.domainAdded'), "success");
            }
            
            setActivePopup(null);
            
            // Refresh grid data
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 500);
            
        } catch (error) {
            showInfoDialog(t('masters.operationFailed'), "error");
        }
    }, [formData, validateForm, showInfoDialog, t]);

    const handlePopupClose = useCallback(() => {
        setActivePopup(null);
        setFormErrors({});
        setAuditTrailData({
            username: "Administrator",
            password: "",
            reason: "",
            comments: ""
        });
    }, []);

    const columns = useMemo(() => [
        {
            key: 'sDomainName',
            label: t('masters.domainname'),
            width: 150,
            enableSearch: true,
            render: (row, isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.sDomainName}</span>
                </div>
            )
        },
        {
            key: 'sCategories',
            label: t('masters.category'),
            width: 120,
            enableSearch: true,
            render: (row, isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.sCategories}</span>
                </div>
            )
        },
        {
            key: 'sDomainStatus',
            label: t('masters.domainstatus'),
            width: 150,
            enableSearch: true,
            render: (row, isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: row.sDomainStatus === 'Active' ? '#10b981' : '#ef4444',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.sDomainStatus}</span>
                </div>
            )
        }
    ], [selectedRowId, t]);

    const renderDomainDetail = useCallback((domain) => (
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
                    {t('masters.logindomainname')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {domain.sLoginDomainName}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('masters.createdBy')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {domain.sCreatedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('masters.createdOn')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {domain.dCreatedOn}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('masters.modifiedBy')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {domain.sModifiedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('masters.modifiedOn')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {domain.dModifiedOn}
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
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                    label={t('masters.add')}
                    onClick={handleAddClick}
                />
                <ActionButton
                    icon={Edit}
                    label={t('masters.edit')}
                    onClick={handleEditClick}
                    // disabled={!selectedDomain || (selectedDomain && selectedDomain.sDomainName === "SDMS")}
                />
            </div>

            {/* Main GridLayout with Details Panel */}
            <div style={{ flex: 1,fontFamily: 'verdana, sans-serif' }}>
                <GridLayout
                    columns={columns}
                    data={domainData}
                    renderDetailPanel={renderDomainDetail}
                    onRowSelect={handleRowSelect}
                    searchable={false}
                    selectable={true}
                    hidePagination={false}
                />
            </div>

            {/* Add/Edit Domain Popup */}
            {activePopup && (
                <CustomPopup
                    isOpen={!!activePopup}
                    onClose={handlePopupClose}
                    title={activePopup}
                    content={
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px',
                            padding: '4px'
                        }}>
                            {/* Hidden Domain ID field */}
                            <input
                                type="hidden"
                                id="bmd_domainprimaryid"
                                value={formData.sDomainID}
                            />

                            {/* Domain Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                                    {t('masters.name')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <AnimatedInput
                                    type="text"
                                    id="bmd_domainnameid"
                                    value={formData.sDomainName}
                                    onChange={(e) => handleFormChange('sDomainName', e.target.value)}
                                    disabled={formData.sDomainID !== ""} // Disable for edit
                                    maxLength={50}
                                    style={{
                                        width: '100%',
                                        fontSize: '12px',
                                        border: formErrors.sDomainName ? '1px solid #ef4444' : '1px solid #d1d5db',
                                        outline: 'none',
                                        backgroundColor: formData.sDomainID !== "" ? '#f9fafb' : 'white'
                                    }}
                                />
                                {formErrors.sDomainName && (
                                    <div style={{ color: '#ef4444', fontSize: '12px' }}>
                                        {formErrors.sDomainName}
                                    </div>
                                )}
                            </div>

                            {/* Login Domain Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                                    {t('masters.logindomainname')}
                                </label>
                                <AnimatedInput
                                    type="text"
                                    id="bmd_logindomainnameid"
                                    value={formData.sLoginDomainName}
                                    onChange={(e) => handleFormChange('sLoginDomainName', e.target.value)}
                                    maxLength={100}
                                    style={{
                                        width: '100%',
                                        fontSize: '12px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Domain Username */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                                    {t('masters.domainusername')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <AnimatedInput
                                    type="text"
                                    id="bmd_domainusernameid"
                                    value={formData.sdomainusername}
                                    onChange={(e) => handleFormChange('sdomainusername', e.target.value)}
                                    disabled={formData.sCategories === "DB"}
                                    maxLength={50}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        border: formErrors.sdomainusername ? '1px solid #ef4444' : '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        outline: 'none',
                                        backgroundColor: formData.sCategories === "DB" ? '#f9fafb' : 'white'
                                    }}
                                />
                                {formErrors.sdomainusername && (
                                    <div style={{ color: '#ef4444', fontSize: '12px' }}>
                                        {formErrors.sdomainusername}
                                    </div>
                                )}
                            </div>

                            {/* Domain Password */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                                    {t('masters.domainpassword')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <AnimatedInput
                                    type="password"
                                    id="bmd_domainpasswordid"
                                    value={formData.sdomainpassword}
                                    onChange={(e) => handleFormChange('sdomainpassword', e.target.value)}
                                    disabled={formData.sCategories === "DB"}
                                    maxLength={50}
                                    style={{
                                        width: '100%',
                                        fontSize: '12px',
                                        outline: 'none',
                                        backgroundColor: formData.sCategories === "DB" ? '#f9fafb' : 'white'
                                    }}
                                />
                                {formErrors.sdomainpassword && (
                                    <div style={{ color: '#ef4444', fontSize: '12px' }}>
                                        {formErrors.sdomainpassword}
                                    </div>
                                )}
                            </div>

                            {/* Active Status */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <label htmlFor="bmd_domainstatusid" style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                                    {t('masters.active')}
                                </label>
                                <input
                                    type="checkbox"
                                    id="bmd_domainstatusid"
                                    checked={formData.iDomainStatus === 1}
                                    onChange={(e) => handleFormChange('iDomainStatus', e.target.checked ? 1 : 0)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer'
                                    }}
                                />

                            </div>

                            {/* Form Buttons */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                gap: '12px',
                                paddingTop: '12px',
                                marginTop: '8px',
                            }}>
                                <button
                                    onClick={handleSubmit}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: 'white',
                                        backgroundColor: '#3b82f6',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Edit style={{ width: '16px', height: '16px' }} /> {t('masters.submit')}
                                </button>
                                <button
                                    onClick={handlePopupClose}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#374151',
                                        backgroundColor: 'white',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t('masters.close')}
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

export default Domain;