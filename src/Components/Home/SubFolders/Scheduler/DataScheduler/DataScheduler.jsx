import React, { useState, useRef, useEffect } from 'react';
import {
    Check, ChevronDown, RefreshCw, Calendar, Clock, Pencil, Search
} from 'lucide-react';
import useAxios from '../../../../../Services/servicecall';
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
import Popup from '../../../../Layout/Common/Popup';
import Errordialog from '../../../../Layout/Common/Errordialog';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

const CF_pathValidation = (path) => {
    const regex = /^[A-Za-z]:\\(?:[a-zA-Z0-9 _\-\.#&()@,=+`~!$^;{}[\]-]+\\)*[a-zA-Z0-9 _\-\.#&()@,=+%`~!$^;{}[\]-]*$/;
    return regex.test(path);
};

const CF_UNCPathValidation = (UNCPath) => {
    const regex = /^\\\\(?:[a-zA-Z0-9 _\-\.#&()@,=+`~!$^;{}[\]-]+\\)+[a-zA-Z0-9 _\-\.#&()@,=+%`~!$^;{}[\]-]+$/;
    return regex.test(UNCPath);
};

const CF_textFieldValidation = (text) => {
    const regex = /[<>()/"']/;
    return !regex.test(text);
};

const CF_sourcePathValidation = (path) => {
    const regex = /[*?"<>|]/g;
    return !regex.test(path);
};

const CF_maxLengthValidation = (text, maxLength = 50) => {
    return text.length <= maxLength;
};

const CF_numberValidation = (value, maxDigits = 5) => {
    const regex = new RegExp(`^\\d{0,${maxDigits}}$`);
    return regex.test(value);
};

const SearchServerData = () => {
    const { t } = useTranslation();

    const daysCombo = [
        { Date: t("label.days"), Number: "Days" },
        { Date: t("label.weeks"), Number: "Weeks" },
        { Date: t("label.months"), Number: "Months" },
        { Date: t("label.year"), Number: "Years" }
    ];

    const localDeleteCombo = [
        { LocalDeleteName: t("label.automatic"), LocalDeleteNo: 1 },
        { LocalDeleteName: t("label.manual"), LocalDeleteNo: 0 }
    ];

    const serverDeleteCombo = [
        { ServerDeleteName: t("label.automatic"), ServerDeleteNo: 1 },
        { ServerDeleteName: t("label.manual"), ServerDeleteNo: 0 }
    ];

    // State
    const [errorDialog, setErrorDialog] = useState({
        isOpen: false,
        message: '',
        type: ''
    });
    const [isSchedulerMetadataEnabled, setIsSchedulerMetadataEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState('File Settings');
    const { postData } = useAxios();
    const [clientOptions, setClientOptions] = useState([]);
    const [domainOptions, setDomainOptions] = useState([]);
    const [destinationOptions, setDestinationOptions] = useState([]);
    const [templateOptions, setTemplateOptions] = useState([]);
    const [delimiterOptions, setDelimiterOptions] = useState([]);
    const [tagMasterData, setTagMasterData] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');
    const [selectedDelimiter, setSelectedDelimiter] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');
    const [sourcePath, setSourcePath] = useState('');
    const [selectedInstrument, setSelectedInstrument] = useState('');
    const [instrumentOptions, setInstrumentOptions] = useState([]);
    const [methodOptions, setMethodOptions] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [isInstrumentDisabled, setIsInstrumentDisabled] = useState(true);
    const [isMethodDisabled, setIsMethodDisabled] = useState(true);
    const [isCheckPathModalOpen, setIsCheckPathModalOpen] = useState(false);
    const [checkPathType, setCheckPathType] = useState('client'); // 'client' or 'server'
    const [clientUsername, setClientUsername] = useState('');
    const [clientPassword, setClientPassword] = useState('');
    const [sourcePathError, setSourcePathError] = useState(false);
    const [clientError, setClientError] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);


    // UNC Path states
    const [isUNCPathEnabled, setIsUNCPathEnabled] = useState(false);
    const [uncPath, setUncPath] = useState('');
    const [uncUsername, setUncUsername] = useState('');
    const [uncPassword, setUncPassword] = useState('');

    // Upload Policy states
    const [includeSubfolder, setIncludeSubfolder] = useState(false);
    const [completeTree, setCompleteTree] = useState(false);
    const [levelEnabled, setLevelEnabled] = useState(false);
    const [levelValue, setLevelValue] = useState('');
    const [deleteLocalCopy, setDeleteLocalCopy] = useState(false);
    const [filesOlderThanEnabled, setFilesOlderThanEnabled] = useState(false);
    const [filesOlderDays, setFilesOlderDays] = useState('');
    const [filesOlderDaysUnit, setFilesOlderDaysUnit] = useState('Days');
    const [localDeleteMode, setLocalDeleteMode] = useState('automatic');
    const [filesOlderThanDate, setFilesOlderThanDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [filesOlderThanDateEnabled, setFilesOlderThanDateEnabled] = useState(false);

    // Trigger/Expiry states
    const [triggerDate, setTriggerDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [triggerTime, setTriggerTime] = useState(new Date().toLocaleTimeString('en-GB'));
    const [expiryEnabled, setExpiryEnabled] = useState(false);
    const [expiryDate, setExpiryDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [expiryTime, setExpiryTime] = useState(new Date().toLocaleTimeString('en-GB'));

    // File Delete Policy states
    const [applyDeletePolicy, setApplyDeletePolicy] = useState(false);
    const [serverDeleteMode, setServerDeleteMode] = useState('automatic');
    const [enableFileLink, setEnableFileLink] = useState(false);

    // Compliance Policy states
    const [enableFileAudit, setEnableFileAudit] = useState(false);
    const [auditFilter, setAuditFilter] = useState('*.*');

    // Data Logger states
    const [dataLogger, setDataLogger] = useState(false);
    const [archivalDays, setArchivalDays] = useState('0');

    // Schedule Capture states
    const [liveCapture, setLiveCapture] = useState(true);
    const [liveCaptureVersioning, setLiveCaptureVersioning] = useState(true);
    const [oneVersionPerDay, setOneVersionPerDay] = useState(false);
    const [withoutVersioning, setWithoutVersioning] = useState(false);

    // Filter state
    const [filter, setFilter] = useState('*.*');


    // Ref for the scrollable container (The specific div that scrolls)
    const scrollContainerRef = useRef(null);

    // Refs for Sections
    const fileSettingsRef = useRef(null);
    const uploadPolicyRef = useRef(null);
    const triggerExpiryRef = useRef(null);
    const scheduleCaptureRef = useRef(null);
    const schedulerMetadataRef = useRef(null);



    // Load all combos on screen load
    const loadCombos = async () => {
        try {
            const requestData = CF_activeUserdetails();

            // Client Combo
            const clientResponse = await postData(
                'Scheduler/DataSchedulerClientCombo',
                requestData
            );
            setClientOptions(clientResponse || []);

            // Domain Combo
            const domainResponse = await postData(
                'Scheduler/DataSchedulerDomainCombo',
                requestData
            );
            // Set NONE as default selected
            setDomainOptions(domainResponse || []);

            if (domainResponse && domainResponse.length > 0) {
                setSelectedDomain(domainResponse[0].L03DomainID);
            }

            // Destination Combo
            const destinationResponse = await postData(
                'Scheduler/DataSchedulerDestinationCombo',
                requestData
            );
            setDestinationOptions(destinationResponse || []);

            // Template Combo
            const templateResponse = await postData(
                'InstrumentLock/LockTemplateCombo',
                requestData
            );
            setTemplateOptions(templateResponse || []);

            // Auto-select first template
            if (templateResponse && templateResponse.length > 0) {
                const firstTemplateId = templateResponse[0].sTemplateID;
                console.log("Auto-selected template:", firstTemplateId);
                setSelectedTemplate(firstTemplateId);
            }



            // Delimiter Combo
            const delimiterResponse = await postData(
                'Scheduler/LoadDelimeter',
                requestData
            );
            setDelimiterOptions(delimiterResponse || []);

        } catch (error) {
            console.error("Error loading combos:", error);
        }
    };


    // Load instruments based on selected client
    const loadInstruments = async (clientId) => {
        try {
            const requestData = {
                sClientID: clientId,
                ...CF_activeUserdetails()
            };

            const response = await postData(
                'Scheduler/DataSchedulerInstrumentCombo',
                requestData
            );

            setInstrumentOptions(response || []);
            setIsInstrumentDisabled(false);

            // Reset instrument and method selections
            setSelectedInstrument('');
            setSelectedMethod('');
            setMethodOptions([]);
            setIsMethodDisabled(true);
        } catch (error) {
            console.error("Error loading instruments:", error);
            setInstrumentOptions([]);
        }
    };

    // Check if instrument is auto-locked
    const checkAutoLock = async (instrumentId) => {
        try {
            const requestData = {
                sInstrumentID: instrumentId,
                ...CF_activeUserdetails()
            };

            const response = await postData(
                'Scheduler/checkAutoLockedforSchecdule',
                requestData
            );

            if (response && response.ScheduleActivated) {
                const message = `${response.InstrumentName} instrument has already scheduled with ${response.ScheduleTaskID} taskID by Autolock Mode. So, Retire the ${response.ScheduleTaskID} taskID, before creating a new schedule for this instrument`;

                // Show error dialog
                setErrorDialog({
                    isOpen: true,
                    message: message,
                    type: 'warning'
                });

                // Reset instrument selection
                setSelectedInstrument('');
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error checking auto lock:", error);
            return true;
        }
    };

    // Load methods based on selected instrument
    const loadMethods = async (instrumentData) => {
        try {
            const requestData = {
                sInstrumentID: instrumentData.L12InstrumentID,
                InstrumentMappingId: instrumentData.L12InstrumentMappingID,
                InstInterfacerStatus: instrumentData.L11InterfaceStatus,
                ...CF_activeUserdetails()
            };

            const response = await postData(
                'Scheduler/DataSchedulerTestCombo',
                requestData
            );

            if (response && response.lstWebMethod && response.lstWebMethod.length > 0) {
                setMethodOptions(response.lstWebMethod);
                setIsMethodDisabled(false);
            } else {
                setMethodOptions([]);
                setIsMethodDisabled(true);
            }
        } catch (error) {
            console.error("Error loading methods:", error);
            setMethodOptions([]);
            setIsMethodDisabled(true);
        }
    };

    // Check path validation
    const validateAndShowCheckPathModal = () => {
        let hasError = false;

        // Validate client selection
        if (!selectedClient) {
            setClientError(true);
            hasError = true;
        } else {
            setClientError(false);
        }

        // Validate source path
        if (!sourcePath.trim()) {
            setSourcePathError(true);
            hasError = true;
        } else if (!CF_pathValidation(sourcePath)) {
            setSourcePathError(true);
            hasError = true;
        } else {
            setSourcePathError(false);
        }

        if (hasError) {
            return;
        }

        // Open check path modal
        setIsCheckPathModalOpen(true);
        setCheckPathType('client');
        setClientUsername('');
        setClientPassword('');
        setUsernameError(false);
        setPasswordError(false);
    };

    const submitCheckPath = async () => {
        if (checkPathType === 'client') {
            // Validate BOTH username and password before showing errors
            const hasUsernameError = !clientUsername.trim();
            const hasPasswordError = !clientPassword.trim();

            setUsernameError(hasUsernameError);
            setPasswordError(hasPasswordError);

            if (hasUsernameError || hasPasswordError) {
                return;
            }

            try {
                const requestData = {
                    path: sourcePath,
                    pathreference: 'local',
                    sclientname: clientOptions.find(c => c.L06ClientID === selectedClient)?.L06ClientName || '',
                    sclientusername: clientUsername,
                    sclientpassword: clientPassword,
                    ...CF_activeUserdetails()
                };

                const response = await postData(
                    'Scheduler/ClientPathChecking',
                    requestData
                );

                // Close modal first
                setIsCheckPathModalOpen(false);

                // Then show error dialog
                if (response.Rtn?.toLowerCase() === 'success') {
                    setErrorDialog({
                        isOpen: true,
                        message: response.Message || 'Path is accessible',
                        type: 'success'
                    });
                } else {
                    setErrorDialog({
                        isOpen: true,
                        message: response.Message || 'Failed to connect',
                        type: 'warning'
                    });
                }
            } catch (error) {
                console.error("Error checking client path:", error);
                setIsCheckPathModalOpen(false);
                setErrorDialog({
                    isOpen: true,
                    message: 'Error checking path',
                    type: 'error'
                });
            }
        } else {
            // Server path checking
            try {
                const requestData = {
                    path: sourcePath,
                    ...CF_activeUserdetails()
                };

                const response = await postData(
                    'Scheduler/PathChecking',
                    requestData
                );

                // Close modal first
                setIsCheckPathModalOpen(false);

                // Then show error dialog
                if (response.Rtn?.toLowerCase() === 'success') {
                    setErrorDialog({
                        isOpen: true,
                        message: response.OResObj || 'Path is accessible',
                        type: 'success'
                    });
                } else {
                    setErrorDialog({
                        isOpen: true,
                        message: response.OResObj || 'Path is not accessible',
                        type: 'warning'
                    });
                }
            } catch (error) {
                console.error("Error checking server path:", error);
                setIsCheckPathModalOpen(false);
                setErrorDialog({
                    isOpen: true,
                    message: 'Error checking path',
                    type: 'error'
                });
            }
        }
    };

    // Load Tag Master based on selected template
    const loadTagMaster = async (templateId) => {
        console.log("=== loadTagMaster called ===");
        console.log("templateId:", templateId);
        console.log("isSchedulerMetadataEnabled:", isSchedulerMetadataEnabled);

        try {
            const requestData = {
                sTemplateID: templateId,
                sInstrumentID: "",
                ...CF_activeUserdetails()
            };

            console.log("Tag API Request:", requestData);

            const response = await postData(
                'Scheduler/GetTagMasterByTemplate',
                requestData
            );

            console.log("Tag API Response:", response);

            setTagMasterData(response || []);
        } catch (error) {
            console.error("Tag master load failed:", error);
            setTagMasterData([]);
        }
    };
    useEffect(() => {
        if (isSchedulerMetadataEnabled && selectedTemplate) {
            console.log("Loading tags for template:", selectedTemplate);
            loadTagMaster(selectedTemplate);
        }
    }, [isSchedulerMetadataEnabled, selectedTemplate]);


    useEffect(() => {
        loadCombos();
    }, []);

    // Scroll Handler (Manual Calculation to prevent Header movement)
    const scrollToSection = (ref, tabName) => {
        setActiveTab(tabName);

        if (ref.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const element = ref.current;

            // Get positions relative to the viewport
            const elementRect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const offsetPosition = container.scrollTop + (elementRect.top - containerRect.top) - 20;

            container.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            {/* Fixed Navbar - Will not move because scrolling is handled in the div below */}
            <header className="z-10 bg-white border-b border-gray-200 shadow-sm flex-none h-16 sticky top-0">
                <div className="flex items-center justify-between px-8 h-full">
                    <nav className="flex space-x-6 h-full">
                        <NavItem
                            label="File Settings"
                            active={activeTab === 'File Settings'}
                            onClick={() => scrollToSection(fileSettingsRef, 'File Settings')}
                        />
                        <NavItem
                            label="Upload Policy"
                            active={activeTab === 'Upload Policy'}
                            onClick={() => scrollToSection(uploadPolicyRef, 'Upload Policy')}
                        />
                        <NavItem
                            label="Schedule Trigger/Expiry On"
                            active={activeTab === 'Schedule Trigger/Expiry On'}
                            onClick={() => scrollToSection(triggerExpiryRef, 'Schedule Trigger/Expiry On')}
                        />
                        <NavItem
                            label="Schedule Capture"
                            active={activeTab === 'Schedule Capture'}
                            onClick={() => scrollToSection(scheduleCaptureRef, 'Schedule Capture')}
                        />
                        <NavItem
                            label="Scheduler Metadata"
                            active={activeTab === 'Scheduler Metadata'}
                            onClick={() => scrollToSection(schedulerMetadataRef, 'Scheduler Metadata')}
                        />
                    </nav>

                    <div className="flex items-center gap-3">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-[5px] shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 transform active:scale-95">
                            <div className="w-4 h-4 border-2 border-white rounded flex items-center justify-center">
                                <Check size={10} strokeWidth={4} />
                            </div>
                            <span>Submit</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 px-4 py-2.5 rounded-[5px] text-sm font-medium transition-all duration-200">
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Scrollable Content Area - Attach ref here */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto pt-4 relative"
            >
                <main className="px-2">
                    <div className="max-w-8xl mx-auto space-y-8 pb-20">
                        {/* File Settings Section */}
                        <div
                            ref={fileSettingsRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="File Settings" />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-12 mb-12">
                                <div className="space-y-10">
                                    <div className="relative group w-full">
                                        <label className="block text-gray-600 text-sm font-bold mb-2">
                                            Client Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedClient || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setSelectedClient(value);
                                                    setClientError(false);
                                                    if (value) {
                                                        loadInstruments(value);
                                                    } else {
                                                        setInstrumentOptions([]);
                                                        setIsInstrumentDisabled(true);
                                                        setSelectedInstrument('');
                                                        setMethodOptions([]);
                                                        setIsMethodDisabled(true);
                                                        setSelectedMethod('');
                                                    }
                                                }}
                                                className={`w-full bg-transparent border-b-2 py-2 pr-8 text-gray-700 text-sm focus:outline-none appearance-none cursor-pointer transition-colors ${clientError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'
                                                    }`}
                                            >
                                                <option value="" disabled hidden></option>
                                                {clientOptions.map((option, index) => (
                                                    <option key={index} value={option.L06ClientID}>
                                                        {option.L06ClientName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className="text-blue-500 fill-current" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group w-full">
                                        <label className="block text-gray-600 text-sm font-bold mb-2">
                                            Instrument <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedInstrument || ""}
                                                onChange={async (e) => {
                                                    const value = e.target.value;
                                                    const selectedInstrData = instrumentOptions.find(
                                                        inst => inst.L12InstrumentMappingID === value
                                                    );

                                                    if (selectedInstrData) {
                                                        const canProceed = await checkAutoLock(selectedInstrData.L12InstrumentID);

                                                        if (canProceed) {
                                                            setSelectedInstrument(value);
                                                            await loadMethods(selectedInstrData);
                                                        }
                                                    } else {
                                                        setSelectedInstrument('');
                                                        setMethodOptions([]);
                                                        setIsMethodDisabled(true);
                                                    }
                                                }}
                                                disabled={isInstrumentDisabled}
                                                className={`w-full bg-transparent border-b-2 py-2 pr-8 text-gray-700 text-sm focus:outline-none appearance-none transition-colors ${isInstrumentDisabled
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 border-[rgb(145,220,243)]'
                                                    : 'cursor-pointer border-[#e2e2e2] focus:border-blue-400'
                                                    }`}
                                            >
                                                <option value="" disabled hidden></option>
                                                {instrumentOptions.map((option, index) => (
                                                    <option key={index} value={option.L12InstrumentMappingID}>
                                                        {option.L11InstrumentName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className="text-blue-500 fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative group w-full">
                                        <label className="block text-gray-600 text-sm font-bold mb-2">
                                            Default Parser Method
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedMethod || ""}
                                                onChange={(e) => setSelectedMethod(e.target.value)}
                                                disabled={isMethodDisabled}
                                                className={`w-full bg-transparent border-b-2 py-2 pr-8 text-gray-700 text-sm focus:outline-none appearance-none transition-colors ${isMethodDisabled
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 border-[rgb(145,220,243)]'
                                                    : 'cursor-pointer border-[#e2e2e2] focus:border-blue-400'
                                                    }`}
                                            >
                                                <option value="" disabled hidden></option>
                                                {methodOptions.map((option, index) => (
                                                    <option key={index} value={option.InstMethodName}>
                                                        {option.InstMethodName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className="text-blue-500 fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <label className="block text-gray-600 text-sm font-bold">Path Type</label>
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-gray-700 text-sm font-medium">Local Path</span>
                                            <div
                                                onClick={() => {
                                                    if (isUNCPathEnabled) {
                                                        // Can only enable Local Path if UNC is currently on
                                                        setIsUNCPathEnabled(false);
                                                        setUncPath('');
                                                        setUncUsername('');
                                                        setUncPassword('');
                                                    }
                                                }}
                                                className={`w-10 h-5 flex items-center rounded-full p-0.5 ${isUNCPathEnabled ? 'cursor-pointer' : 'cursor-not-allowed'} transition-colors duration-300 ${!isUNCPathEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${!isUNCPathEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Source Path <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-end gap-3">
                                            <input
                                                type="text"
                                                value={sourcePath}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (CF_sourcePathValidation(value) && CF_textFieldValidation(value)) {
                                                        setSourcePath(value);
                                                        setSourcePathError(false);
                                                    }
                                                }}
                                                disabled={isUNCPathEnabled}
                                                className={`flex-1 bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none transition-colors ${isUNCPathEnabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                                    } ${sourcePathError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={validateAndShowCheckPathModal}
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors"
                                            >
                                                <Check size={16} strokeWidth={3} /> Check
                                            </button>
                                        </div>
                                        <p className="text-gray-400 text-xs mt-3 font-medium">
                                            NOTE:- Browse is not supported. Manually copy the path
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-gray-600 font-bold text-base mb-8">UNC Credentials</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-10">
                                    <div className="space-y-8">

                                        <div className="flex items-center gap-4">
                                            <label className="text-gray-600 text-sm font-bold">UNC Path</label>
                                            <div
                                                onClick={() => {
                                                    if (!isUNCPathEnabled) {
                                                        // Can only enable if Local Path is checked (currently on)
                                                        setIsUNCPathEnabled(true);
                                                        setSourcePath(''); // Disable local path by clearing it
                                                    }
                                                }}
                                                className={`w-10 h-5 flex items-center rounded-full p-0.5 ${!isUNCPathEnabled ? 'cursor-pointer' : 'cursor-not-allowed'} transition-colors duration-300 ${isUNCPathEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isUNCPathEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-end gap-3">
                                                <div className="flex-1"><UnderlineInput
                                                    label="UNC Path"
                                                    value={uncPath}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (CF_UNCPathValidation(value) && CF_sourcePathValidation(value) && CF_textFieldValidation(value)) {
                                                            setUncPath(value);
                                                        }
                                                    }}
                                                    disabled={!isUNCPathEnabled}
                                                />
                                                </div>
                                                <button className="bg-blue-50 text-blue-600 border-1 border-gray-500 hover:bg-blue-100 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors mb-1">
                                                    <Check size={16} strokeWidth={3} /> Check
                                                </button>
                                            </div>
                                            <p className="text-gray-400 text-xs mt-3 font-medium">NOTE:- Browse is not supported. Manually copy the path</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <UnderlineInput
                                                label="Username"
                                                value={uncUsername}
                                                onChange={(e) => {
                                                    if (CF_textFieldValidation(e.target.value)) {
                                                        setUncUsername(e.target.value);
                                                    }
                                                }}
                                                disabled={!isUNCPathEnabled}
                                            />
                                            <UnderlineInput
                                                label="Password"
                                                type="password"
                                                value={uncPassword}
                                                onChange={(e) => {
                                                    if (CF_textFieldValidation(e.target.value)) {
                                                        setUncPassword(e.target.value);
                                                    }
                                                }}
                                                disabled={!isUNCPathEnabled}
                                            />
                                        </div>
                                        {/* <UnderlineSelect label="Domain" placeholder="NONE" /> */}
                                        <UnderlineSelect
                                            label="Domain"
                                            options={domainOptions}
                                            displayKey="L03DomainName"
                                            valueKey="L03DomainID"
                                            value={selectedDomain}
                                            onChange={(value) => setSelectedDomain(value)}
                                            disabled={!isUNCPathEnabled}
                                        />
                                    </div>
                                    <div className="space-y-10">
                                        {/* <UnderlineSelect label="Destination" required /> */}
                                        <UnderlineSelect
                                            label="Destination"
                                            required
                                            options={destinationOptions}
                                            displayKey="L09FTPAliasName"
                                            valueKey="L09FTPID"
                                            value={selectedDestination}
                                            onChange={(value) => setSelectedDestination(value)}
                                        />
                                        <input
                                            type="text"
                                            value={filter}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (CF_textFieldValidation(value) && CF_maxLengthValidation(value, 50)) {
                                                    setFilter(value);
                                                }
                                            }}
                                            className="w-full bg-transparent border-b border-gray-300 pb-1 text-sm text-gray-600 focus:outline-none focus:border-blue-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upload Policy Section */}
                        <div
                            ref={uploadPolicyRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="Upload Policy" />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-12">
                                {/* Left Column */}
                                <div className="space-y-8">
                                    <SquareCheckbox
                                        label="Include Subfolder"
                                        checked={includeSubfolder}
                                        onChange={() => setIncludeSubfolder(!includeSubfolder)}
                                    />

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-800">Complete Tree</span>
                                            <div
                                                onClick={() => {
                                                    if (includeSubfolder) {
                                                        setCompleteTree(!completeTree);
                                                    }
                                                }}
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${includeSubfolder ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                                    } ${completeTree ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${completeTree ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-blue-800">Level</span>
                                                <div
                                                    onClick={() => {
                                                        if (includeSubfolder) {
                                                            setLevelEnabled(!levelEnabled);
                                                        }
                                                    }}
                                                    className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${includeSubfolder ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                                        } ${levelEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${levelEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={levelValue}
                                                onChange={(e) => {
                                                    if (CF_numberValidation(e.target.value, 5)) {
                                                        setLevelValue(e.target.value);
                                                    }
                                                }}
                                                disabled={!levelEnabled || !includeSubfolder}
                                                className={`w-24 border-b-2 px-2 py-1 text-sm ${(!levelEnabled || !includeSubfolder) ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-200 focus:border-blue-400 focus:outline-none'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 pt-2">
                                        <ToggleLabel label="Copy Files" checked={true} />
                                        <ToggleLabel label="Move Files(Do not leave local copy)" />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
                                    <SquareCheckbox
                                        label="Delete local copy"
                                        checked={deleteLocalCopy}
                                        onChange={() => {
                                            const newValue = !deleteLocalCopy;
                                            setDeleteLocalCopy(newValue);
                                            // When Delete local copy is checked, enable the first "Files older than" by default
                                            if (newValue) {
                                                setFilesOlderThanEnabled(true);
                                                setFilesOlderThanDateEnabled(false);
                                            }
                                        }}
                                    />

                                    {/* Files older than with number input - SINGLE LINE */}
                                    <div className="flex items-end gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-800">Files older than</span>
                                            <div
                                                onClick={() => {
                                                    if (deleteLocalCopy && !filesOlderThanDateEnabled) {
                                                        setFilesOlderThanEnabled(!filesOlderThanEnabled);
                                                    }
                                                }}
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${(deleteLocalCopy && !filesOlderThanDateEnabled) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                                    } ${filesOlderThanEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${filesOlderThanEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <input
                                            type="text"
                                            value={filesOlderDays}
                                            onChange={(e) => {
                                                if (CF_numberValidation(e.target.value, 5)) {
                                                    setFilesOlderDays(e.target.value);
                                                }
                                            }}
                                            disabled={!filesOlderThanEnabled || !deleteLocalCopy}
                                            className={`w-16 border-b-2 px-1 py-1 text-sm ${(!filesOlderThanEnabled || !deleteLocalCopy) ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />

                                        {/* Days dropdown */}
                                        <div className="w-24 relative">
                                            <select
                                                value={filesOlderDaysUnit}
                                                onChange={(e) => setFilesOlderDaysUnit(e.target.value)}
                                                disabled={!filesOlderThanEnabled || !deleteLocalCopy}
                                                className={`w-full bg-transparent border-b-2 py-1 pr-6 text-sm appearance-none focus:outline-none ${(!filesOlderThanEnabled || !deleteLocalCopy)
                                                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'text-gray-700 border-gray-300 focus:border-blue-400 cursor-pointer'
                                                    }`}
                                            >
                                                {daysCombo.map((item) => (
                                                    <option key={item.Number} value={item.Number}>
                                                        {item.Date}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className={(!filesOlderThanEnabled || !deleteLocalCopy) ? 'text-gray-300' : 'text-gray-400'} />
                                            </div>
                                        </div>

                                        {/* Automatic/Manual dropdown - SAME LINE */}
                                        <div className="w-32 relative">
                                            <select
                                                value={localDeleteMode}
                                                onChange={(e) => setLocalDeleteMode(e.target.value)}
                                                disabled={!filesOlderThanEnabled || !deleteLocalCopy}
                                                className={`w-full bg-transparent border-b-2 py-1 pr-6 text-sm italic appearance-none focus:outline-none ${(!filesOlderThanEnabled || !deleteLocalCopy)
                                                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                                    : 'text-gray-600 border-gray-300 focus:border-blue-400 cursor-pointer'
                                                    }`}
                                            >
                                                {localDeleteCombo.map((item) => (
                                                    <option key={item.LocalDeleteNo} value={item.LocalDeleteNo}>
                                                        {item.LocalDeleteName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className={(!filesOlderThanEnabled || !deleteLocalCopy) ? 'text-gray-200' : 'text-gray-300'} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Files older than with date */}
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-800">Files older than</span>
                                            <div
                                                onClick={() => {
                                                    if (deleteLocalCopy && !filesOlderThanEnabled) {
                                                        setFilesOlderThanDateEnabled(!filesOlderThanDateEnabled);
                                                    }
                                                }}
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${(deleteLocalCopy && !filesOlderThanEnabled) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                                    } ${filesOlderThanDateEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${filesOlderThanDateEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                        <DateInput
                                            value={filesOlderThanDate}
                                            disabled={!filesOlderThanDateEnabled || !deleteLocalCopy}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Trigger/Expiry On Section */}
                        <div
                            ref={triggerExpiryRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="Schedule Trigger/Expiry On" />
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <label className="text-gray-600 text-sm font-bold w-24">Trigger on</label>
                                    {/* <DateInput value="14/01/2026" />
                                    <TimeInput value="16:00:26" /> */}
                                    <DateInput
                                        value={expiryDate}
                                        disabled={!expiryEnabled}
                                    />
                                    <TimeInput
                                        value={expiryTime}
                                        disabled={!expiryEnabled}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-24"></div>
                                    <div className="-ml-24 flex items-center gap-4">
                                        <SquareCheckbox
                                            label="Expiry Date & Time"
                                            boldLabel
                                            checked={expiryEnabled}
                                            onChange={() => setExpiryEnabled(!expiryEnabled)}
                                        />
                                        <DateInput
                                            value={expiryDate}
                                            disabled={!expiryEnabled}
                                        />
                                        <TimeInput
                                            value={expiryTime}
                                            disabled={!expiryEnabled}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Policies & Logger Section */}
                        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-blue-600 font-bold text-sm">File Delete Policy</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <SquareCheckbox />

                                            <label className="text-sm text-gray-800 font-medium whitespace-nowrap">
                                                Apply Delete Policy for Server Files
                                            </label>

                                            <div className="relative w-32">
                                                <select
                                                    value={localDeleteMode}
                                                    onChange={(e) => setLocalDeleteMode(e.target.value)}
                                                    disabled={!filesOlderThanEnabled || !deleteLocalCopy}
                                                    className={`w-full bg-transparent border-b-2 py-1 pr-6 text-sm italic appearance-none focus:outline-none ${(!filesOlderThanEnabled || !deleteLocalCopy)
                                                        ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                                        : 'text-gray-600 border-gray-300 focus:border-blue-400 cursor-pointer'
                                                        }`}
                                                >
                                                    {serverDeleteCombo.map((item) => (
                                                        <option key={item.ServerDeleteNo} value={item.ServerDeleteNo}>
                                                            {item.ServerDeleteName}
                                                        </option>
                                                    ))}
                                                </select>

                                                <ChevronDown
                                                    size={14}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                />
                                            </div>
                                        </div>
                                        <SquareCheckbox label="Enable file link" boldLabel />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-blue-600 font-bold text-sm">Compliance Policy</h3>
                                    <div className="space-y-6">
                                        <SquareCheckbox label="Enable File Audit" boldLabel />
                                        <div className="flex items-center gap-4">
                                            <label className="text-gray-600 text-sm font-bold w-20">Audit Filter</label>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value="*.*"
                                                    disabled
                                                    className="w-full bg-transparent border-b border-gray-200 pb-1 text-sm text-gray-400 focus:outline-none cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-blue-600 font-bold text-sm">Data Logger</h3>
                                    <div className="space-y-6">
                                        <SquareCheckbox label="Data Logger" boldLabel />
                                        <div className="flex items-center gap-2">
                                            <label className="text-gray-600 text-sm font-bold w-16">Archival</label>
                                            <input
                                                type="number"
                                                disabled
                                                className="w-20 bg-gray-50 border-b border-gray-200 h-6 text-sm text-gray-400 cursor-not-allowed focus:outline-none"
                                            />
                                            <span className="text-gray-600 text-sm font-bold">Days Older</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Capture Section */}
                        <div
                            ref={scheduleCaptureRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="Schedule Capture" />
                            <div className="space-y-6">
                                <SquareCheckbox label="Live Capture" boldLabel checked={true} />
                                <div className="flex items-center gap-8 pl-1">
                                    <ToggleLabel label="Live Capture Versioning" checked={true} />
                                    <ToggleLabel label="One version per Day" />
                                    <ToggleLabel label="Without Versioning" />
                                </div>
                            </div>
                        </div>

                        {/* Scheduler Metadata Section */}
                        <div
                            ref={schedulerMetadataRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="Scheduler Metadata" />
                            <div className="mb-8">
                                <SquareCheckbox
                                    label="Enable Scheduler Metadata"
                                    boldLabel
                                    checked={isSchedulerMetadataEnabled}
                                    onChange={() => setIsSchedulerMetadataEnabled(!isSchedulerMetadataEnabled)}
                                />
                            </div>

                            {isSchedulerMetadataEnabled && (
                                <div className="space-y-8">


                                    <div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6 mb-6">
                                            {/* <UnderlineSelect label="Template Master" placeholder="QC" /> */}
                                            <UnderlineSelect
                                                label="Template Master"
                                                options={templateOptions}
                                                displayKey="sTemplateName"
                                                valueKey="sTemplateID"
                                                value={selectedTemplate}
                                                onChange={(value) => {
                                                    console.log("Template changed to:", value);
                                                    setSelectedTemplate(value);
                                                    if (isSchedulerMetadataEnabled) {
                                                        loadTagMaster(value);
                                                    }
                                                }}

                                            />
                                            <UnderlineInput label="Sample Filename" />
                                            {/* <UnderlineSelect label="Delimiter" /> */}
                                            <UnderlineSelect
                                                label="Delimiter"
                                                options={delimiterOptions}
                                                displayKey="sDelimiterName"
                                                valueKey="sDelimiterID"
                                                value={selectedDelimiter}
                                                onChange={(value) => setSelectedDelimiter(value)}
                                            />
                                        </div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 w-1/4">TagName</th>
                                                        <th scope="col" className="px-6 py-3 w-1/2">Extract From</th>
                                                        <th scope="col" className="px-6 py-3 w-1/4">Metadata</th>
                                                        <th scope="col" className="px-6 py-3 w-16"></th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {tagMasterData && tagMasterData.length > 0 ? (
                                                        tagMasterData.map((tag, index) => (
                                                            <tr
                                                                key={tag.sTagID}
                                                                className={index % 2 === 0
                                                                    ? "bg-blue-50/30 border-b border-gray-100"
                                                                    : "bg-white border-b border-gray-100"}
                                                            >
                                                                {/* Tag Name */}
                                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                                    {tag.sTagName}
                                                                </td>

                                                                {/* Extract From */}
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <RadioButton
                                                                            label="NONE"
                                                                            name={`extract_${tag.sTagID}`}
                                                                            checked={!tag.sSourceFlag || tag.sSourceFlag === 'NONE'}
                                                                        />
                                                                        <RadioButton
                                                                            label="Folder"
                                                                            name={`extract_${tag.sTagID}`}
                                                                            checked={tag.sSourceFlag === 'Folder'}
                                                                        />
                                                                        <RadioButton
                                                                            label="Filename"
                                                                            name={`extract_${tag.sTagID}`}
                                                                            checked={tag.sSourceFlag === 'Filename'}
                                                                        />
                                                                    </div>
                                                                </td>

                                                                {/* Metadata */}
                                                                <td className="px-6 py-4">
                                                                    {tag.sTextData || ''}
                                                                </td>

                                                                {/* Action */}
                                                                <td className="px-6 py-4 text-right">
                                                                    <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                                                No tags found for selected template
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>


                                    <div>
                                        <h3 className="text-blue-600 font-bold text-sm mb-4">Rule</h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-6 mb-6">
                                            <UnderlineSelect label="Rule Name" placeholder="Sample" />
                                            <UnderlineInput label="Metadata" />
                                        </div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3">TagName</th>
                                                        <th scope="col" className="px-6 py-3">Relational Operator</th>
                                                        <th scope="col" className="px-6 py-3">Field Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-blue-50/30 border-b border-gray-100">
                                                        <td className="px-6 py-4 font-medium text-gray-900"></td>
                                                        <td className="px-6 py-4">
                                                            <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>



                                    <div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-white border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Rule Name <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Metadata <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                TagName <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Relational Operator <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Field Value <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-white">
                                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                            No data to display
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex justify-end">
                                            <button className="bg-gray-100 hover:bg-gray-200 text-blue-600 font-bold py-2 px-6 rounded text-sm transition-colors">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div >
            <Popup
                isOpen={isCheckPathModalOpen}
                onClose={() => setIsCheckPathModalOpen(false)}
                title="Check Path"
                content={
                    <div className="space-y-6 p-4">
                        <div>
                            <label className="block text-gray-600 text-sm font-bold mb-3">Source Path</label>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Client</span>
                                    <div
                                        onClick={() => {
                                            setCheckPathType('client');
                                            setUsernameError(false);
                                            setPasswordError(false);
                                        }}
                                        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${checkPathType === 'client' ? 'bg-blue-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checkPathType === 'client' ? 'translate-x-5' : 'translate-x-0'
                                            }`}></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Server</span>
                                    <div
                                        onClick={() => {
                                            setCheckPathType('server');
                                            setUsernameError(false);
                                            setPasswordError(false);
                                        }}
                                        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${checkPathType === 'server' ? 'bg-blue-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checkPathType === 'server' ? 'translate-x-5' : 'translate-x-0'
                                            }`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Client Name
                            </label>
                            <input
                                type="text"
                                value={clientOptions.find(c => c.L06ClientID === selectedClient)?.L06ClientName || ''}
                                disabled
                                className="w-full bg-gray-50 border-b-2 border-gray-300 px-2 py-2 text-sm text-gray-600 focus:outline-none cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Client User Name
                                {checkPathType === 'client' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type="text"
                                value={clientUsername}
                                onChange={(e) => {
                                    setClientUsername(e.target.value);
                                    setUsernameError(false);
                                }}
                                disabled={checkPathType === 'server'}
                                className={`w-full bg-transparent border-b-2 px-2 py-2 text-sm focus:outline-none transition-colors ${checkPathType === 'server'
                                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                    : usernameError
                                        ? 'border-red-500'
                                        : 'border-gray-300 focus:border-blue-400'
                                    }`}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Client Password
                                {checkPathType === 'client' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type="password"
                                value={clientPassword}
                                onChange={(e) => {
                                    setClientPassword(e.target.value);
                                    setPasswordError(false);
                                }}
                                disabled={checkPathType === 'server'}
                                className={`w-full bg-transparent border-b-2 px-2 py-2 text-sm focus:outline-none transition-colors ${checkPathType === 'server'
                                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                    : passwordError
                                        ? 'border-red-500'
                                        : 'border-gray-300 focus:border-blue-400'
                                    }`}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                            <button
                                onClick={submitCheckPath}
                                className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Check size={16} /> Submit
                            </button>
                            <button
                                onClick={() => setIsCheckPathModalOpen(false)}
                                className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                }
            />


            {
                errorDialog.isOpen && (
                    <Errordialog
                        message={errorDialog.message}
                        type={errorDialog.type}
                        onClose={() => setErrorDialog({ isOpen: false, message: '', type: '' })}
                    />
                )
            }
        </div >
    );
};

// Reusable Components
const SectionHeader = ({ title }) => (
    <div className="mb-6 border-b border-gray-100 pb-2">
        <h2 className="text-lg font-semibold text-blue-600">{title}</h2>
    </div>
);

const NavItem = ({ label, active, onClick }) => (
    <div
        onClick={onClick}
        className={`relative h-full flex items-center px-2 cursor-pointer transition-colors group`}
    >
        <span className={`text-sm font-medium transition-colors ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-900'}`}>
            {label}
        </span>
        {active && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-md" />}
    </div>
);

const UnderlineSelect = ({
    label,
    required,
    placeholder,
    options = [],
    value,
    onChange,
    displayKey = 'name',
    valueKey = 'id',
    disabled = false
}) => (
    <div className="relative group w-full">
        <label className="block text-gray-600 text-sm font-bold mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <select
                value={value || ""}
                onChange={(e) => onChange && onChange(e.target.value)}
                disabled={disabled}
                className={`w-full bg-transparent border-b-2 border-gray-200 py-2 pr-8 text-gray-700 text-sm focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                    }`}
            >
                <option value="" disabled hidden></option>
                {options.map((option, index) => (
                    <option key={index} value={option[valueKey]}>
                        {option[displayKey]}
                    </option>
                ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} className="text-blue-500 fill-current" />
            </div>
        </div>
    </div>
);

const UnderlineInput = ({ label, required, placeholder, defaultValue, type = "text", disabled = false, value, onChange }) => (
    <div className="group w-full relative">
        <label className="block text-gray-700 text-sm font-bold mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            disabled={disabled}
            className={`w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:border-blue-400 focus:outline-none transition-colors ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                }`}
        />
    </div>
);

const ToggleSwitch = ({ checked }) => (
    <div className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
);

const SquareCheckbox = ({ label, boldLabel, checked, onChange }) => (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
        <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${checked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
            {checked && <Check size={14} className="text-white" strokeWidth={3} />}
        </div>
        {label && <span className={`text-sm text-blue-800 ${boldLabel ? 'font-bold' : 'font-medium'}`}>{label}</span>}
    </div>
);

const ToggleLabel = ({ label, checked }) => (
    <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${checked ? 'text-blue-600' : 'text-blue-800'}`}>{label}</span>
        <div className={`w-8 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </div>
    </div>
);


const DateInput = ({ value, disabled = false, onChange }) => (
    <div className="relative w-40">
        <input
            type="text"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-blue-400 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                }`}
        />
        <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
);

const TimeInput = ({ value, disabled = false }) => (
    <div className="relative w-32">
        <input
            type="text"
            value={value}
            disabled={disabled}
            className={`w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:border-blue-400 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                }`}
        />
        <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
);

const RadioButton = ({ label, name, checked, onChange }) => (
    <label className="flex items-center cursor-pointer group">
        <input
            type="radio"
            name={name}
            className="hidden peer"
            checked={checked}
            onChange={onChange}
        />
        <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-white transition-colors relative">
            <div className={`w-2 h-2 bg-blue-500 rounded-full transition-transform ${checked ? 'scale-100' : 'scale-0'}`}></div>
        </div>
        <span className="ml-2 text-sm text-gray-700 font-bold group-hover:text-blue-600">{label}</span>
    </label>
);

export default SearchServerData;
