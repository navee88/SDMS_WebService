import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';

const Domain = () => {
    // State declarations
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
        username: "",
        password: "",
        reason: "",
        comments: ""
    });
    const [formData, setFormData] = useState({
        sDomainID: "",
        sDomainName: "",
        sLoginDomainName: "",
        sdomainusername: "",
        sdomainpassword: "",
        iDomainStatus: 1
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    // ADD THIS STATE FOR CONNECTION ERRORS
    const [connectionError, setConnectionError] = useState("");
    
    const { t } = useTranslation();
    const { postData } = servicecall();
    const isInitialMount = useRef(true);

    // ==================== HELPER FUNCTIONS ====================

    const getActiveUserDetails = useCallback(() => {
        const getDecryptedValue = (key) => {
            try {
                const encryptedValue = sessionStorage.getItem(key);
                if (!encryptedValue) return "";
                
                if (encryptedValue.length > 50 && encryptedValue.includes('==')) {
                    return CF_decrypt(encryptedValue);
                }
                return encryptedValue;
            } catch (error) {
                console.error(`Error decrypting ${key}:`, error);
                return "";
            }
        };

        const sUsername = getDecryptedValue("sUsername");
        const sSiteCode = getDecryptedValue("sSiteCode") || "CH        ";
        const sUserGroupID = getDecryptedValue("sUserGroupID") || "G1        ";
        const sUserID = getDecryptedValue("sUserID") || "U1";
        const sSessionID = getDecryptedValue("sSessionID");
        const sDomainName = getDecryptedValue("sDomainName") || "SDMS";
        
        // Format timezone with required suffix
        let sTimeZoneID = getDecryptedValue("sTimeZoneID");
        if (sTimeZoneID && !sTimeZoneID.includes("<~>true")) {
            sTimeZoneID = sTimeZoneID + "<~>true";
        } else if (!sTimeZoneID) {
            sTimeZoneID = "Asia/Kolkata<~>true";
        }
        
        const sdbtype = getDecryptedValue("sdbtype") || "POSTGRESQL";
        const sCategories = getDecryptedValue("sCategories") || "DB";
        const sUserStatus = getDecryptedValue("sUserStatus") || "";
        const sTenantID = getDecryptedValue("") 

        return {
            sUserDomainName: sDomainName,
            sSessionID: sSessionID || "",
            sUserID: sUserID,
            sTimeZoneID: sTimeZoneID,
            sApplicationName: "SDMS",
            sdbtype: sdbtype,
            sUsername: sUsername || "Administrator",
            sSiteCode: sSiteCode.padEnd(10, ' ').substring(0, 10),
            sCategories: sCategories,
            sUserGroupID: sUserGroupID.padEnd(10, ' ').substring(0, 10),
            sUserStatus: sUserStatus,
            sTenantID: sTenantID
        };
    }, []);

    const showInfoDialog = useCallback((message, type = "information") => {
        console.log(`Info Dialog: ${type} - ${message}`);
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
        console.log("Starting fetchDomainData...");
        setLoading(true);
        try {
            const activeUserDetails = getActiveUserDetails();
            const passObjDet = {
                sActionType: "View",
                ActiveUserDetails: activeUserDetails,
                ApplicationCode: "SDMS"
            };
            
            console.log("Fetching domain data...");
            const response = await postData("basemaster/getDomain", passObjDet);
            
            console.log("API Response:", response);
            
            if (!response) {
                setDomainData([]);
                showInfoDialog(t('masters.failedtofetchdomain') || 'Failed to fetch domain data', "error");
                return;
            }
            
            let data = response;
            
            // Handle encrypted response
            if (typeof response === 'string' && response.length > 50) {
                console.log("Response appears to be encrypted");
                try {
                    const decrypted = CF_decrypt(response);
                    console.log("Decrypted response:", decrypted);
                    data = JSON.parse(decrypted);
                } catch (error) {
                    console.error('Failed to decrypt/parse response:', error);
                }
            }
            
            console.log("Processed data:", data);
            
            // Handle nested response structure
            if (data && data.oResObj) {
                data = data.oResObj;
            }
            
            if (data && data.Rtn === "Success" && data.Domain) {
                data = data.Domain;
            }
            
            // Ensure it's an array
            if (Array.isArray(data)) {
                console.log(`Loaded ${data.length} domain records`);
                const dataWithIds = data.map((item, index) => ({
                    ...item,
                    id: index + 1,
                    sDomainStatus: item.sDomainStatus ? 
        item.sDomainStatus.replace('DeActive', 'Deactive') : 
        (item.iDomainStatus === 1 ? "Active" : "Deactive")
                }));
                setDomainData(dataWithIds);
            } else {
                console.log("Response is not an array:", data);
                setDomainData([]);
                if (data && data.Message) {
                    showInfoDialog(data.Message, "error");
                } else {
                    showInfoDialog(t('masters.invalidresponseformat') || 'Invalid response format', "error");
                }
            }
        } catch (error) {
            console.error('Error fetching domain data:', error);
            showInfoDialog(t('masters.failedtofetchdomain') || 'Failed to fetch domain data', "error");
            setDomainData([]);
        } finally {
            setLoading(false);
        }
    }, [postData, t, getActiveUserDetails, showInfoDialog]);

    const fetchDomainDetails = useCallback(async (domainID) => {
        console.log(`Fetching domain details for ID: ${domainID}`);
        if (!domainID) return null;
        
        try {
            const activeUserDetails = getActiveUserDetails();
            const passObjDet = {
                sDomainID: domainID,
                ActiveUserDetails: activeUserDetails,
                ApplicationCode: "SDMS"
            };
            
            const response = await postData("basemaster/editGetDomain", passObjDet);
            
            console.log("Edit get response:", response);
            
            if (!response) {
                showInfoDialog(t('masters.failedtofetchdomaindetails') || 'Failed to fetch domain details', "error");
                return null;
            }
            
            let data = response;
            if (typeof response === 'string' && response.length > 50) {
                try {
                    const decrypted = CF_decrypt(response);
                    data = JSON.parse(decrypted);
                } catch (error) {
                    console.error('Failed to decrypt response:', error);
                }
            }
            
            console.log("Processed domain details:", data);
            
            if (data && data.Rtn === "Success" && data.Domain) {
                return {
                    ...data.Domain,
                    sDomainStatus: data.Domain.iDomainStatus === 1 ? "Active" : "Deactive"
                };
            } else {
                showInfoDialog(t('masters.failedtofetchdomaindetails') || 'Failed to fetch domain details', "error");
                return null;
            }
        } catch (error) {
            console.error('Error fetching domain details:', error);
            showInfoDialog(t('masters.failedtofetchdomaindetails') || 'Failed to fetch domain details', "error");
            return null;
        }
    }, [postData, showInfoDialog, t, getActiveUserDetails]);

    // ==================== EVENT HANDLERS ====================

    const handleRowSelect = useCallback((row) => {
        console.log("Row selected:", row);
        setSelectedDomain(row);
        setSelectedRowId(row.id);
    }, []);

    const handleAddClick = useCallback(() => {
        console.log("Add button clicked");
        setFormData({
            sDomainID: "",
            sDomainName: "",
            sLoginDomainName: "",
            sdomainusername: "",
            sdomainpassword: "",
            iDomainStatus: 1
        });
        setFormErrors({});
        setConnectionError(""); // Clear connection error
        setActivePopup(t('masters.adddomain'));
        console.log("Form reset for add, activePopup set to:", t('masters.adddomain'));
    }, [t]);

    const handleEditClick = useCallback(async () => {
        console.log("Edit button clicked, selectedDomain:", selectedDomain);
        
        if (!selectedDomain) {
            showInfoDialog(t('masters.selectRecord'), "warning");
            return;
        }
        
        console.log("Fetching domain details for edit...");
        setLoading(true);
        try {
            const domainDetails = await fetchDomainDetails(selectedDomain.sDomainID);
            console.log("Domain details fetched:", domainDetails);
            
            if (domainDetails) {
                const newFormData = {
                    sDomainID: domainDetails.sDomainID?.trim() || selectedDomain.sDomainID,
                    sDomainName: domainDetails.sDomainName?.trim() || selectedDomain.sDomainName,
                    sLoginDomainName: domainDetails.sLoginDomainName?.trim() || "",
                    sdomainusername: "",
                    sdomainpassword: "",
                    iDomainStatus: domainDetails.iDomainStatus || (domainDetails.sDomainStatus === "Active" ? 1 : 0)
                };
                
                console.log("Setting form data for edit:", newFormData);
                setFormData(newFormData);
                setFormErrors({});
                setConnectionError(""); // Clear connection error
                setActivePopup(t('masters.editdomain'));
                console.log("Edit popup opened");
            }
        } finally {
            setLoading(false);
        }
    }, [selectedDomain, showInfoDialog, t, fetchDomainDetails]);

    const handleFormChange = useCallback((field, value) => {
        console.log(`Form field changed: ${field} = ${value}`);
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
        
        // Clear connection error when password changes (since error is shown under password field)
        if (field === 'sdomainpassword' && connectionError) {
            setConnectionError("");
        }
    }, [formErrors, connectionError]);

    const validateForm = useCallback(() => {
        console.log("Validating form data:", formData);
        const errors = {};
        
        if (!formData.sDomainName.trim()) {
            errors.sDomainName = t('masters.domainNameRequired');
        }
        
        // Always validate username and password (required for all domains)
        if (!formData.sdomainusername.trim()) {
            errors.sdomainusername = t('masters.usernameRequired');
        }
        
        if (!formData.sdomainpassword.trim()) {
            errors.sdomainpassword = t('masters.passwordRequired');
        }
        
        console.log("Validation errors:", errors);
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData, t]);

    const prepareDomainObject = useCallback(() => {
        console.log("Preparing domain object:", formData);
        const domainObj = {
            sDomainName: formData.sDomainName.trim(),
            sCategories: "Server", // Always Server since we removed the category field
            iDomainStatus: formData.iDomainStatus,
            sLoginDomainName: formData.sLoginDomainName.trim() || null
        };
        
        if (formData.sDomainID && formData.sDomainID.trim()) {
            domainObj.sDomainID = formData.sDomainID.trim();
        }
        
        return domainObj;
    }, [formData]);

    // ==================== HANDLE FORM SUBMIT (DEFINE THIS FIRST) ====================
    const handleFormSubmit = useCallback(async (auditValues, submittedFormData = null) => {
    console.log("Starting form submission with audit values:", auditValues);
    
    // Use submittedFormData if provided, otherwise use current formData state
    const dataToValidate = submittedFormData || formData;
    
    // Create a validation function that works with the provided data
    const validateFormData = (formDataToValidate) => {
        console.log("Validating form data:", formDataToValidate);
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
        
        console.log("Validation errors:", errors);
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    if (!validateFormData(dataToValidate)) {
        console.log("Form validation failed");
        showInfoDialog(t('masters.formValidationFailed'), "error");
        return;
    }
    
    setIsSubmitting(true);
    console.log("Starting API submission...");
    
    try {
        const isEdit = dataToValidate.sDomainID !== "";
        const apiEndpoint = isEdit ? "basemaster/editDomain" : "basemaster/insertDomain";
        
        console.log(`Operation: ${isEdit ? 'Edit' : 'Add'}, Endpoint: ${apiEndpoint}`);
        
        // Use the prepareDomainObject with the correct data
        const prepareDomainObjectFromData = (data) => {
            console.log("Preparing domain object:", data);
            const domainObj = {
                sDomainName: data.sDomainName.trim(),
                sCategories: "Server",
                iDomainStatus: data.iDomainStatus,
                sLoginDomainName: data.sLoginDomainName.trim() || null
            };
            
            if (data.sDomainID && data.sDomainID.trim()) {
                domainObj.sDomainID = data.sDomainID.trim();
            }
            
            return domainObj;
        };
        
        const requestData = {
            sdomainusername: dataToValidate.sdomainusername,
            AuditTrailValues: auditValues,
            Domain: prepareDomainObjectFromData(dataToValidate),
            ActiveUserDetails: getActiveUserDetails(),
            sdomainpassword: dataToValidate.sdomainpassword,
            ApplicationCode: "SDMS"
        };
        
        console.log("Submitting request data:", requestData);
        
        const response = await postData(apiEndpoint, requestData);
        
        console.log("Submit response:", response);
        
        if (!response) {
            showInfoDialog(t('masters.operationFailed'), "error");
            return;
        }
        
        let data = response;
        if (typeof response === 'string' && response.length > 50) {
            try {
                const decrypted = CF_decrypt(response);
                console.log("Decrypted submit response:", decrypted);
                data = JSON.parse(decrypted);
            } catch (error) {
                console.error('Failed to decrypt response:', error);
            }
        }
        
        console.log("Processed submit response:", data);
        
        if (data && data.Rtn === "Success") {
            showInfoDialog(
                isEdit ? t('masters.domainUpdated') : t('masters.domainAdded'),
                "success"
            );
            
            console.log("Success! Closing popup and refreshing data...");
            // Close the main form popup
            setActivePopup(null);
            // Clear form data
            setFormData({
                sDomainID: "",
                sDomainName: "",
                sLoginDomainName: "",
                sdomainusername: "",
                sdomainpassword: "",
                iDomainStatus: 1
            });
            setFormErrors({});
            setConnectionError(""); // Clear connection error
            setAuditTrailData({
                username: "",
                password: "",
                reason: "",
                comments: ""
            });
            
            // Refresh the domain list
            await fetchDomainData();
            
        } else if (data && data.Message) {
            const errorMessage = typeof data.Message === 'string' 
                ? data.Message 
                : Object.values(data.Message).join(', ');
            console.log("API returned error:", errorMessage);
            
            // CHECK FOR SPECIFIC DOMAIN CONNECTION ERRORS
            // Look for errors like "Unknown Host... Check Domainname", "Incorrect username or password", etc.
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
                // Set the error to display under password field (just like jQuery version)
                setConnectionError(errorMessage);
                // Scroll to show the error
                setTimeout(() => {
                    const errorElement = document.getElementById('bmd_domainpasswordid');
                    if (errorElement) {
                        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
                // DON'T show error dialog for domain connection errors
            } else {
                // For other errors, show in dialog
                showInfoDialog(errorMessage, "error");
            }
        } else {
            showInfoDialog(t('masters.operationFailed'), "error");
        }
        
    } catch (error) {
        console.error('Error submitting domain:', error);
        showInfoDialog(t('masters.operationFailed'), "error");
    } finally {
        console.log("Submit process completed");
        setIsSubmitting(false);
    }
}, [formData, t, postData, getActiveUserDetails, fetchDomainData, showInfoDialog]);

    // Handle audit authorization
    const handleAuditAuthorized = useCallback((auditData) => {
        console.log("Audit authorized with data:", auditData);
        
        // Extract data from AuditTrailValues
        const auditValues = auditData.AuditTrailValues;
        
        if (auditValues) {
            console.log("Proceeding with form submission...");
            
            // Save the current form data BEFORE closing audit
            const currentFormData = { ...formData };
            
            // Close audit dialog
            setShowAudit(false);
            
            // Proceed with form submission with current form data
            handleFormSubmit(auditValues, currentFormData);
        } else {
            console.error("Audit data missing in AuditTrailValues");
            showInfoDialog(t('masters.auditDataMissing'), "error");
            setShowAudit(false);
        }
    }, [formData, t, showInfoDialog, handleFormSubmit]); // Added handleFormSubmit dependency

    // Handle submit button click (opens audit trail)
    const handleSubmitClick = useCallback(() => {
        console.log("Submit button clicked, current form data:", formData);
        
        if (!validateForm()) {
            console.log("Form validation failed");
            return;
        }
        
        console.log("Form validation passed, opening audit trail...");
        setShowAudit(true);
    }, [formData, validateForm]);

    // Handle popup close
    const handlePopupClose = useCallback(() => {
        console.log("Closing popup");
        setActivePopup(null);
        // Only clear form when manually closing, not after submission
        if (!isSubmitting) {
            setFormData({
                sDomainID: "",
                sDomainName: "",
                sLoginDomainName: "",
                sdomainusername: "",
                sdomainpassword: "",
                iDomainStatus: 1
            });
            setFormErrors({});
        }
        setConnectionError(""); // Clear connection error
        setAuditTrailData({
            username: "",
            password: "",
            reason: "",
            comments: ""
        });
        setShowAudit(false);
    }, [isSubmitting]);

    // ==================== COMPONENT SETUP ====================

    useEffect(() => {
        console.log("Component useEffect triggered");
        const sessionID = sessionStorage.getItem('sSessionID');
        const userID = sessionStorage.getItem('sUserID');
        
        console.log("Session validation - SessionID:", sessionID, "UserID:", userID);
        
        if (!sessionID || !userID) {
            showInfoDialog(t('masters.sessionexpired') || 'Session expired. Please login again.', "error");
            return;
        }
        
        fetchDomainData();
        isInitialMount.current = false;
    }, [fetchDomainData, showInfoDialog, t]);

    // Effect to auto-select first row when data is loaded
    useEffect(() => {
        if (domainData.length > 0 && !selectedRowId) {
            console.log("Auto-selecting first row:", domainData[0]);
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
                    className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${row.sDomainStatus === 'Active' ? 'text-[#008000]' : 'text-red-500'} ${isSelected ? 'font-bold' : ''}`}
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
                    {domain.sModifiedBy || ""}
                </div>
            </div>
            <div className="flex items-center">
                <div className="w-2/5 font-bold text-gray-600">
                    {t('masters.modifiedOn')}
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

    // ==================== RENDER ====================

    if (loading && isInitialMount.current) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">{t('masters.loading')}</div>
            </div>
        );
    }

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

                <div className="flex justify-end pr-5 gap-2 pt-3">
                    <ActionButton
                        icon={Plus}
                        label={t('masters.add')}
                        onClick={handleAddClick}
                        disabled={isSubmitting}
                    />
                    <ActionButton
                        icon={Edit}
                        label={t('masters.edit')}
                        onClick={handleEditClick}
                        disabled={!selectedDomain || isSubmitting || selectedDomain?.sDomainName === "SDMS"}
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
                                    <label className="text-[12px] font-roboto font-semibold text-[#405f7d]">
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

                                
                                <div className="flex flex-col">
                                    <label className="text-[12px] font-roboto font-semibold text-[#405f7d]">
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

                                {/* Domain Username - Always Required */}
                                <div className="flex flex-col">
                                    <label className="text-[12px] font-roboto font-semibold text-[#405f7d]">
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

                                {/* Domain Password - Always Required with connection error display */}
                                <div className="flex flex-col">
    <label className="text-[12px] font-roboto font-semibold text-[#405f7d]">
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
    {/* Show password validation error */}
    {formErrors.sdomainpassword && (
        <div className="text-red-500 text-[12px] mt-1">
            {formErrors.sdomainpassword}
        </div>
    )}
    {/* Show connection error UNDER the password field (EXACTLY like in the jQuery image) */}
    {connectionError && (
        <div className="p-0.5 bg-[#d83e3e] ">
            <div className="flex items-center">
                <div className="text-white text-[14px] font-roboto font-normal">
                    {connectionError}
                </div>
            </div>
        </div>
    )}
</div>

                                <div className="flex items-center gap-2.5">
                                    <label htmlFor="bmd_domainstatusid" className="text-[12px] font-roboto font-semibold text-[#405f7d]">
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

                                <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                                    <button
                                        onClick={handleSubmitClick}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white bg-blue-500 border-none rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Edit className="w-4 h-4" /> 
                                        {isSubmitting ? t('masters.submitting') : t('masters.submit')}
                                    </button>
                                    <button
                                        onClick={handlePopupClose}
                                        disabled={isSubmitting}
                                        className="px-2.5 py-2 text-[12px] font-roboto font-semibold text-[#8092a4] bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('masters.close')}
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
                        actionLabel={t('masters.submit')}
                        defaultReason="Activated"
                        disableReason={false}
                    />
                )}
            </div>
        </div>
    );
};

export default Domain;