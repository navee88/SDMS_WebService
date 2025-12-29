import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Edit, Eye, Download, Printer } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AuditTrail from '../../../../Layout/Common/AuditTrail';

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
    const [showAudit, setShowAudit] = useState(false);
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
        
        // Check if trying to edit SDMS domain
        if (selectedDomain.sDomainName === "SDMS") {
            showInfoDialog(t('masters.sdmsEditDisabled'), "error");
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

    const handleAuthorized = useCallback(() => {
        // Handle audit trail authorization
        console.log('Audit trail authorized');
        setShowAudit(false);
    }, []);

    const columns = useMemo(() => [
        {
            key: 'sDomainName',
            label: t('masters.domainname'),
            width: 150,
            enableSearch: true,
            render: (row, isSelected) => (
                <div className={`text-[12px] font-verdana truncate text-gray-700 ${isSelected ? 'font-bold' : ''}`}>
                    {row.sDomainName}
                </div>
            )
        },
        {
            key: 'sCategories',
            label: t('masters.category'),
            width: 120,
            enableSearch: true,
            render: (row, isSelected) => (
                <div className={`text-[12px] font-verdana truncate text-gray-700 ${isSelected ? 'font-bold' : ''}`}>
                    {row.sCategories}
                </div>
            )
        },
        {
            key: 'sDomainStatus',
            label: t('masters.domainstatus'),
            width: 150,
            enableSearch: true,
            render: (row, isSelected) => (
                <div className={`text-[12px] font-verdana truncate ${row.sDomainStatus === 'Active' ? 'text-green-600' : 'text-red-500'} ${isSelected ? 'font-bold' : ''}`}>
                    {row.sDomainStatus}
                </div>
            )
        }
    ], [t]);

    const renderDomainDetail = useCallback((domain) => (
        <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('masters.logindomainname')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.sLoginDomainName}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('masters.createdBy')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.sCreatedBy}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('masters.createdOn')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.dCreatedOn}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('masters.modifiedBy')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.sModifiedBy}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('masters.modifiedOn')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.dModifiedOn}
                </div>
            </div>
        </div>
    ), [t]);

    const ActionButton = ({ icon: Icon, label, disabled, onClick, variant = "default" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-bold rounded border-none 
                transition-all duration-200 whitespace-nowrap
                hover:scale-[0.98] hover:opacity-90
                ${disabled 
                    ? variant === 'primary'
                    ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : variant === 'primary'
                        ? 'bg-[#2883FE] text-white hover:bg-[#1c6fd8]'
                        : variant === 'danger'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-50 text-[#2883FE] hover:bg-blue-50'
                }
            `}
        >
            {Icon && <Icon className="w-3.5 h-3.5" />}
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
            {/* PAGE CONTAINER */}
            <div className="h-full flex flex-col bg-white">
                {/* Error/Info Dialog */}
                {infoDialog.open && (
                    <Errordialog
                        message={infoDialog.message}
                        type={infoDialog.type}
                        onClose={closeInfoDialog}
                    />
                )}

                {/* ACTION BUTTONS (NO SCROLL) */}
                <div className="flex justify-end pr-5 gap-2 pt-3">
                    
                    <ActionButton
                        icon={Plus}
                        label={t('masters.add')}
                        onClick={handleAddClick}
                    />
                    <ActionButton
                        icon={Edit}
                        label={t('masters.edit')}
                        onClick={handleEditClick}
                        disabled={!selectedDomain}
                    />
                    
                </div>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="flex-1 overflow-auto p-3">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">
                            {t("login.loadingpasswordpolicy")}
                        </div>
                    ) : (
                        <GridLayout
                            columns={columns}
                            height="100%"
                            detailPanelWidth="46%"
                            data={domainData}
                            getRowId={(row) => row.id}
                            renderDetailPanel={renderDomainDetail}
                            onRowClick={handleRowSelect}
                            rowClassName={(row) =>
                                row.id === selectedRowId
                                    ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
                                    : ""
                            }
                        />
                    )}
                </div>

                {/* Add/Edit Domain Popup */}
                {activePopup && (
                    <CustomPopup
                        isOpen={!!activePopup}
                        onClose={handlePopupClose}
                        title={activePopup}
                        content={
                            <div className="flex flex-col gap-2 p-1">
                                {/* Hidden Domain ID field */}
                                <input
                                    type="hidden"
                                    id="bmd_domainprimaryid"
                                    value={formData.sDomainID}
                                />

                                {/* Domain Name */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-semibold text-gray-700">
                                        {t('masters.name')} <span className="text-red-500">*</span>
                                    </label>
                                    <AnimatedInput
                                        type="text"
                                        id="bmd_domainnameid"
                                        value={formData.sDomainName}
                                        onChange={(e) => handleFormChange('sDomainName', e.target.value)}
                                        disabled={formData.sDomainID !== ""}
                                        maxLength={50}
                                        className={`w-full text-[12px] outline-none ${formData.sDomainID !== "" ? 'bg-gray-50' : 'bg-white'} ${
                                            formErrors.sDomainName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {formErrors.sDomainName && (
                                        <div className="text-red-500 text-[12px]">
                                            {formErrors.sDomainName}
                                        </div>
                                    )}
                                </div>

                                {/* Login Domain Name */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-semibold text-gray-700">
                                        {t('masters.logindomainname')}
                                    </label>
                                    <AnimatedInput
                                        type="text"
                                        id="bmd_logindomainnameid"
                                        value={formData.sLoginDomainName}
                                        onChange={(e) => handleFormChange('sLoginDomainName', e.target.value)}
                                        maxLength={100}
                                        className="w-full text-[12px] outline-none"
                                    />
                                </div>

                                {/* Domain Username */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-semibold text-gray-700">
                                        {t('masters.domainusername')} <span className="text-red-500">*</span>
                                    </label>
                                    <AnimatedInput
                                        type="text"
                                        id="bmd_domainusernameid"
                                        value={formData.sdomainusername}
                                        onChange={(e) => handleFormChange('sdomainusername', e.target.value)}
                                        disabled={formData.sCategories === "DB"}
                                        maxLength={50}
                                        className={`w-full text-[12px] outline-none ${formData.sCategories === "DB" ? 'bg-gray-50' : 'bg-white'} ${
                                            formErrors.sdomainusername ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {formErrors.sdomainusername && (
                                        <div className="text-red-500 text-[12px]">
                                            {formErrors.sdomainusername}
                                        </div>
                                    )}
                                </div>

                                {/* Domain Password */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-semibold text-gray-700">
                                        {t('masters.domainpassword')} <span className="text-red-500">*</span>
                                    </label>
                                    <AnimatedInput
                                        type="password"
                                        id="bmd_domainpasswordid"
                                        value={formData.sdomainpassword}
                                        onChange={(e) => handleFormChange('sdomainpassword', e.target.value)}
                                        disabled={formData.sCategories === "DB"}
                                        maxLength={50}
                                        className={`w-full text-[12px] outline-none ${formData.sCategories === "DB" ? 'bg-gray-50' : 'bg-white'} ${
                                            formErrors.sdomainpassword ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {formErrors.sdomainpassword && (
                                        <div className="text-red-500 text-[12px]">
                                            {formErrors.sdomainpassword}
                                        </div>
                                    )}
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-2.5">
                                    <label htmlFor="bmd_domainstatusid" className="text-[12px] font-semibold text-gray-700">
                                        {t('masters.active')}
                                    </label>
                                    <input
                                        type="checkbox"
                                        id="bmd_domainstatusid"
                                        checked={formData.iDomainStatus === 1}
                                        onChange={(e) => handleFormChange('iDomainStatus', e.target.checked ? 1 : 0)}
                                        className="w-4 h-4 cursor-pointer accent-blue-600"
                                    />
                                </div>

                                {/* Form Buttons */}
                                <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                                    <button
                                        onClick={handleSubmit}
                                        className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600"
                                    >
                                        <Edit className="w-4 h-4" /> {t('masters.submit')}
                                    </button>
                                    <button
                                        onClick={handlePopupClose}
                                        className="px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                                    >
                                        {t('masters.close')}
                                    </button>
                                </div>
                            </div>
                        }
                        size="md"
                    />
                )}

                {/* AUDIT POPUP */}
                {showAudit && (
                    <AuditTrail
                        isOpen={showAudit}
                        onClose={() => setShowAudit(false)}
                        onAuthorized={handleAuthorized}
                    />
                )}
            </div>
        </div>
    );
};

export default Domain;