import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';

const Domain = () => {
    // State declarations
    const [domainData, setDomainData] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullPageLoading, setFullPageLoading] = useState(false);
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });
    const [activePopup, setActivePopup] = useState(null);
    const [showAudit, setShowAudit] = useState(false);
    const [formData, setFormData] = useState({
        sDomainID: "",
        sDomainName: "",
        sLoginDomainName: "",
        sdomainusername: "",
        sdomainpassword: "",
        iDomainStatus: 1
    });
    const [formErrors, setFormErrors] = useState({});
    const [connectionError, setConnectionError] = useState("");
    
    const { t } = useTranslation();
    const { postData } = servicecall();
    const isInitialMount = useRef(true);

    // ==================== HELPER FUNCTIONS ====================

    const showInfoDialog = useCallback((message, type = "information") => {
        setInfoDialog({
            open: true,
            message,
            type
        });
    }, []);

    const closeInfoDialog = useCallback(() => {
        setInfoDialog(prev => ({ ...prev, open: false }));
    }, []);

    // ==================== API FUNCTIONS ====================

    const fetchDomainData = useCallback(async () => {
        setLoading(true);
        setFullPageLoading(true);
        try {
            const userDetails = CF_activeUserdetails();
            const passObjDet = {
                sActionType: "View",
                ActiveUserDetails: userDetails.ActiveUserDetails,
                ApplicationCode: userDetails.ApplicationCode
            };
            
            const response = await postData("basemaster/getDomain", passObjDet);
            
            if (!response) {
                setDomainData([]);
                showInfoDialog(t('Auditpopup.failed') || 'Failed to fetch domain data', "error");
                return;
            }
            
            let data = response;
            
            if (data && data.oResObj) {
                data = data.oResObj;
            }
            
            if (data && data.Rtn === "Success" && data.Domain) {
                data = data.Domain;
            }
            
            if (Array.isArray(data)) {
                const dataWithIds = data.map((item, index) => ({
                    ...item,
                    id: index + 1,
                    sDomainStatus: item.sDomainStatus ? 
                        item.sDomainStatus.replace('DeActive', 'Deactive') : 
                        (item.iDomainStatus === 1 ? "Active" : "Deactive")
                }));
                setDomainData(dataWithIds);
            } else {
                setDomainData([]);
                if (data && data.Message) {
                    showInfoDialog(data.Message, "error");
                }
            }
        } catch (error) {
            showInfoDialog(t('Auditpopup.failed') || 'Failed to fetch domain data', "error");
            setDomainData([]);
        } finally {
            setLoading(false);
            setFullPageLoading(false);
        }
    }, [postData, t, showInfoDialog]);

    const fetchDomainDetails = useCallback(async (domainID) => {
        if (!domainID) return null;
        
        setFullPageLoading(true);
        try {
            const userDetails = CF_activeUserdetails();
            const passObjDet = {
                sDomainID: domainID,
                ActiveUserDetails: userDetails.ActiveUserDetails,
                ApplicationCode: userDetails.ApplicationCode
            };
            
            const response = await postData("basemaster/editGetDomain", passObjDet);
            
            if (!response) {
                showInfoDialog(t('Auditpopup.failed') || 'Failed to fetch domain details', "error");
                return null;
            }
            
            let data = response;
            
            if (data && data.Rtn === "Success" && data.Domain) {
                return {
                    ...data.Domain,
                    sDomainStatus: data.Domain.iDomainStatus === 1 ? "Active" : "Deactive"
                };
            } else {
                showInfoDialog(t('Auditpopup.failed') || 'Failed to fetch domain details', "error");
                return null;
            }
        } catch (error) {
            showInfoDialog(t('Auditpopup.failed') || 'Failed to fetch domain details', "error");
            return null;
        } finally {
            setFullPageLoading(false);
        }
    }, [postData, showInfoDialog, t]);

    // ==================== EVENT HANDLERS ====================

    const handleRowSelect = useCallback((row) => {
        setSelectedDomain(row);
        setSelectedRowId(row.id);
    }, []);

    const handleAddClick = useCallback(() => {
        setFormData({
            sDomainID: "",
            sDomainName: "",
            sLoginDomainName: "",
            sdomainusername: "",
            sdomainpassword: "",
            iDomainStatus: 1
        });
        setFormErrors({});
        setConnectionError("");
        setActivePopup(t('masters.adddomain'));
    }, [t]);

    const handleEditClick = useCallback(async () => {
        if (!selectedDomain) {
            showInfoDialog(t('masters.selectRecord'), "warning");
            return;
        }
        
        setLoading(true);
        try {
            const domainDetails = await fetchDomainDetails(selectedDomain.sDomainID);
            
            if (domainDetails) {
                const newFormData = {
                    sDomainID: domainDetails.sDomainID?.trim() || selectedDomain.sDomainID,
                    sDomainName: domainDetails.sDomainName?.trim() || selectedDomain.sDomainName,
                    sLoginDomainName: domainDetails.sLoginDomainName?.trim() || "",
                    sdomainusername: "",
                    sdomainpassword: "",
                    iDomainStatus: domainDetails.iDomainStatus || (domainDetails.sDomainStatus === "Active" ? 1 : 0)
                };
                
                setFormData(newFormData);
                setFormErrors({});
                setConnectionError("");
                setActivePopup(t('masters.editdomain'));
            }
        } finally {
            setLoading(false);
        }
    }, [selectedDomain, showInfoDialog, t, fetchDomainDetails]);

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
        
        if (field === 'sdomainpassword' && connectionError) {
            setConnectionError("");
        }
    }, [formErrors, connectionError]);

    const validateForm = useCallback(() => {
        const errors = {};
        
        if (!formData.sDomainName.trim()) {
            errors.sDomainName = t('masters.domainNameRequired');
        }
        
        if (!formData.sdomainusername.trim()) {
            errors.sdomainusername = t('masters.usernameRequired');
        }
        
        if (!formData.sdomainpassword.trim()) {
            errors.sdomainpassword = t('masters.passwordRequired');
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData, t]);

    const handleFormSubmit = useCallback(async (auditValues, submittedFormData = null) => {
        const dataToValidate = submittedFormData || formData;
        
        const validateFormData = (formDataToValidate) => {
            const errors = {};
            
            if (!formDataToValidate.sDomainName.trim()) {
                errors.sDomainName = t('masters.domainNameRequired');
            }
            
            if (!formDataToValidate.sdomainusername.trim()) {
                errors.sdomainusername = t('masters.usernameRequired');
            }
            
            if (!formDataToValidate.sdomainpassword.trim()) {
                errors.sdomainpassword = t('masters.passwordRequired');
            }
            
            setFormErrors(errors);
            return Object.keys(errors).length === 0;
        };
        
        if (!validateFormData(dataToValidate)) {
            showInfoDialog(t('Auditpopup.failed') || 'Please fill all required fields', "error");
            return;
        }
        
        setFullPageLoading(true);
        try {
            const isEdit = dataToValidate.sDomainID !== "";
            const apiEndpoint = isEdit ? "basemaster/editDomain" : "basemaster/insertDomain";
            
            const userDetails = CF_activeUserdetails();
            const requestData = {
                sdomainusername: dataToValidate.sdomainusername,
                AuditTrailValues: auditValues,
                Domain: {
                    sDomainName: dataToValidate.sDomainName.trim(),
                    sCategories: "Server",
                    iDomainStatus: dataToValidate.iDomainStatus,
                    sLoginDomainName: dataToValidate.sLoginDomainName.trim() || null,
                    ...(dataToValidate.sDomainID && dataToValidate.sDomainID.trim() && {
                        sDomainID: dataToValidate.sDomainID.trim()
                    })
                },
                ActiveUserDetails: userDetails.ActiveUserDetails,
                sdomainpassword: dataToValidate.sdomainpassword,
                ApplicationCode: userDetails.ApplicationCode
            };
            
            const response = await postData(apiEndpoint, requestData);
            
            if (!response) {
                showInfoDialog(t('Auditpopup.failed'), "error");
                return;
            }
            
            let data = response;
            
            if (data && data.Rtn === "Success") {
                showInfoDialog(
                    isEdit ? t('masters.domainUpdated') : t('masters.domainAdded'),
                    "success"
                );
                
                setActivePopup(null);
                setFormData({
                    sDomainID: "",
                    sDomainName: "",
                    sLoginDomainName: "",
                    sdomainusername: "",
                    sdomainpassword: "",
                    iDomainStatus: 1
                });
                setFormErrors({});
                setConnectionError("");
                
                await fetchDomainData();
                
            } else if (data && data.Message) {
                const errorMessage = typeof data.Message === 'string' 
                    ? data.Message 
                    : Object.values(data.Message).join(', ');
                
                const lowerErrorMessage = errorMessage.toLowerCase();
                const isDomainConnectionError = 
                    lowerErrorMessage.includes("unknown host") || 
                    lowerErrorMessage.includes("check domain") ||
                    lowerErrorMessage.includes("incorrect username") ||
                    lowerErrorMessage.includes("incorrect password") ||
                    lowerErrorMessage.includes("invalid credentials") ||
                    lowerErrorMessage.includes("connection failed") ||
                    lowerErrorMessage.includes("cannot connect");
                
                if (isDomainConnectionError) {
                    setConnectionError(errorMessage);
                    setTimeout(() => {
                        const errorElement = document.getElementById('bmd_domainpasswordid');
                        if (errorElement) {
                            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                } else {
                    showInfoDialog(errorMessage, "error");
                }
            } else {
                showInfoDialog(t('Auditpopup.failed'), "error");
            }
            
        } catch (error) {
            showInfoDialog(t('Auditpopup.failed'), "error");
        } finally {
            setFullPageLoading(false);
        }
    }, [formData, t, postData, fetchDomainData, showInfoDialog]);

    const handleAuditAuthorized = useCallback((auditData) => {
        const auditValues = auditData.AuditTrailValues;
        
        if (auditValues) {
            const currentFormData = { ...formData };
            setShowAudit(false);
            handleFormSubmit(auditValues, currentFormData);
        } else {
            showInfoDialog(t('common.auditDataMissing') || 'Audit data is missing', "error");
            setShowAudit(false);
        }
    }, [formData, t, showInfoDialog, handleFormSubmit]);

    const handleSubmitClick = useCallback(() => {
        if (!validateForm()) {
            return;
        }
        setShowAudit(true);
    }, [formData, validateForm]);

    const handlePopupClose = useCallback(() => {
        setActivePopup(null);
        setFormData({
            sDomainID: "",
            sDomainName: "",
            sLoginDomainName: "",
            sdomainusername: "",
            sdomainpassword: "",
            iDomainStatus: 1
        });
        setFormErrors({});
        setConnectionError("");
        setShowAudit(false);
    }, []);

    // ==================== COMPONENT SETUP ====================

    useEffect(() => {
        const sessionID = sessionStorage.getItem('sSessionID');
        const userID = sessionStorage.getItem('sUserID');
        
        if (!sessionID || !userID) {
            showInfoDialog(t('usermanagement.sessionexpired') || 'Session expired. Please login again.', "error");
            return;
        }
        
        fetchDomainData();
        isInitialMount.current = false;
    }, [fetchDomainData, showInfoDialog, t]);

    useEffect(() => {
        if (domainData.length > 0 && !selectedRowId) {
            setSelectedDomain(domainData[0]);
            setSelectedRowId(domainData[0].id);
        }
    }, [domainData, selectedRowId]);

    // ==================== UI COMPONENTS ====================

    const columns = useMemo(() => [
        {
            key: 'sDomainName',
            label: t('masters.domainname'),
            width: 150,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
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
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
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
                <div 
                    className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${row.sDomainStatus === 'Active' ? 'text-green-600' : 'text-red-500'} ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.sDomainStatus}
                </div>
            )
        }
    ], [t, handleRowSelect]);

    const renderDomainDetail = useCallback((domain) => (
        <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('masters.logindomainname')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.sLoginDomainName || ""}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('label.createdBy')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.sCreatedBy}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('label.createdOn')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.dCreatedOn}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('label.modifiedBy')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.sModifiedBy || ""}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('label.modifiedOn')}
                </div>
                <div className="w-3/5 text-gray-800">
                    {domain.dModifiedOn || ""}
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
                transition-all duration-200 whitespace-nowrap hover:scale-[0.98] hover:opacity-90
                ${disabled 
                    ? variant === 'primary'
                    ? 'bg-[#f0f2f5] text-white cursor-not-allowed'
                    : 'bg-[#f0f2f5] text-[#2883fe] cursor-not-allowed'
                    : variant === 'primary'
                        ? 'bg-[#f0f2f5] text-white hover:bg-blue-700'
                        : variant === 'danger'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-[#f0f2f5] text-[#2883fe] hover:bg-gray-100'
                }
            `}
        >
            {Icon && <Icon className="w-4 h-4 font-bold text-[#2883fe]" />}
            <span>{label}</span>
        </button>
    );

    // ==================== RENDER ====================

    if (loading && isInitialMount.current) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 font-roboto">
                <div className="text-gray-500 text-base mb-2.5">
                    {t('common.loading')}
                </div>
                <div className="text-gray-400 text-xs">
                    {t('masters.loadingclientdata') || 'Loading domain data...'}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col font-roboto bg-white w-full h-[80vh] overflow-hidden relative">
            <FullPageLoader 
                loading={fullPageLoading} 
                text={t('common.loading')} 
            />
            
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

            <div className="flex justify-end pr-5 gap-2 pt-3">
                <ActionButton
                    icon={Plus}
                    label={t('button.add')}
                    onClick={handleAddClick}
                    disabled={fullPageLoading}
                />
                <ActionButton
                    icon={Edit}
                    label={t('button.edit')}
                    onClick={handleEditClick}
                    disabled={!selectedDomain || fullPageLoading || selectedDomain?.sDomainName === "SDMS"}
                />
            </div>

            <div className="flex-1 overflow-auto min-h-0 w-full p-3">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">
                        {t('common.loading')}
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

            {activePopup && (
                <CustomPopup
                    isOpen={!!activePopup}
                    onClose={handlePopupClose}
                    title={activePopup}
                    content={
                        <div className="flex flex-col gap-1 p-1">
                            <input
                                type="hidden"
                                id="bmd_domainprimaryid"
                                value={formData.sDomainID}
                            />

                            <div className="flex flex-col">
                                <label className="text-[12px] font-roboto font-semibold text-gray-700">
                                    {t('label.name')} <span className="text-red-500">*</span>
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
                            
                            <div className="flex flex-col">
                                <label className="text-[12px] font-roboto font-semibold text-gray-700">
                                    {t('masters.logindomainname')}
                                </label>
                                <AnimatedInput
                                    type="text"
                                    id="bmd_logindomainnameid"
                                    value={formData.sLoginDomainName}
                                    onChange={(e) => handleFormChange('sLoginDomainName', e.target.value)}
                                    maxLength={100}
                                    className="w-full text-[12px] outline-none border-gray-300"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[12px] font-roboto font-semibold text-gray-700">
                                    {t('masters.domainusername')} <span className="text-red-500">*</span>
                                </label>
                                <AnimatedInput
                                    type="text"
                                    id="bmd_domainusernameid"
                                    value={formData.sdomainusername}
                                    onChange={(e) => handleFormChange('sdomainusername', e.target.value)}
                                    maxLength={50}
                                    className={`w-full text-[12px] outline-none bg-white ${
                                        formErrors.sdomainusername ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {formErrors.sdomainusername && (
                                    <div className="text-red-500 text-[12px]">
                                        {formErrors.sdomainusername}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[12px] font-roboto font-semibold text-gray-700">
                                    {t('masters.domainpassword')} <span className="text-red-500">*</span>
                                </label>
                                <AnimatedInput
                                    type="password"
                                    id="bmd_domainpasswordid"
                                    value={formData.sdomainpassword}
                                    onChange={(e) => handleFormChange('sdomainpassword', e.target.value)}
                                    maxLength={50}
                                    className={`w-full text-[12px] outline-none bg-white ${
                                        formErrors.sdomainpassword || connectionError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {formErrors.sdomainpassword && (
                                    <div className="text-red-500 text-[12px] mt-1">
                                        {formErrors.sdomainpassword}
                                    </div>
                                )}
                                {connectionError && (
                                    <div className="p-0.5 bg-red-600">
                                        <div className="text-white text-[14px] font-roboto font-normal">
                                            {connectionError}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2.5 mt-2">
                                <label htmlFor="bmd_domainstatusid" className="text-[12px] font-roboto font-semibold text-gray-700">
                                    {t('statuses.active')}
                                </label>
                                <input
                                    type="checkbox"
                                    id="bmd_domainstatusid"
                                    checked={formData.iDomainStatus === 1}
                                    onChange={(e) => handleFormChange('iDomainStatus', e.target.checked ? 1 : 0)}
                                    className="w-4 h-4 cursor-pointer accent-blue-600"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                                <button
                                    onClick={handleSubmitClick}
                                    disabled={fullPageLoading}
                                    className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-600 border-none rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Edit className="w-4 h-4" /> 
                                    {fullPageLoading ? t('masters.submitting') : t('button.submit')}
                                </button>
                                <button
                                    onClick={handlePopupClose}
                                    disabled={fullPageLoading}
                                    className="px-2.5 py-2 text-[12px] font-roboto font-semibold text-gray-600 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('button.close')}
                                </button>
                            </div>
                        </div>
                    }
                    size="md"
                />
            )}

            {showAudit && (
                <AuditTrail
                    isOpen={showAudit}
                    onClose={() => setShowAudit(false)}
                    onAuthorized={handleAuditAuthorized}
                    actionLabel={t('button.submit')}
                    defaultReason="Activated"
                    disableReason={false}
                />
            )}
        </div>
    );
};

export default Domain;