import { useState, useMemo, useEffect, useCallback } from 'react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import PrintTable from '../../../../Layout/Common/PrintTable';
import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
import { handleExportCommon } from '../../../../Layout/Common/exportService';
import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
import AuditTrail from '../../../../Layout/Common/AuditTrail';

const RetiredTask = ({ navigationData, onClearNavigation, onNavigateAway }) => {
    const [schedulerData, setSchedulerData] = useState([]);
    const [selectedScheduler, setSelectedScheduler] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("");
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
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [doPrint, setDoPrint] = useState(false);
    
    const { navigateToDataScheduler, navigateToTab } = useSchedulerNavigation();
    
    const [confirmDialogData, setConfirmDialogData] = useState({
        title: "",
        message: "",
        onConfirm: null,
        actionType: ""
    });
    const { t } = useTranslation('scheduler');
    
    // Audit trail state (though not used in Retired, kept for consistency)
    const [showAudit, setShowAudit] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [pendingActionData, setPendingActionData] = useState(null);
    const [auditTrailRights, setAuditTrailRights] = useState({ 
        // No actions for retired tasks, but keeping for consistency
    });
    
    const { postData } = servicecall();
    const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
    const [highlightScheduleId, setHighlightScheduleId] = useState(null);
    const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);

    const endpoints = {
        retiredSchedulerView: "Scheduler/RetireSchedulerView",
        retiredSchedulerViewGrid: "Scheduler/RetireSchedulerViewgrid",
        exportData: "basemaster/exportDataFile",
        importScheduler: "Scheduler/importSchedulerDataFile",
        importTemplate: "Scheduler/ImportTemplateFileData",
        viewSchedule: "Scheduler/DataSchedulerSave"
    };

    // Get active user details
    const getActiveUserDetails = useCallback(() => {
        const userDetails = CF_activeUserdetails();
        return userDetails.ActiveUserDetails || {};
    }, []);

    // Prepare API request body
    const prepareRequestBody = useCallback((additionalData = {}) => {
        const baseData = {
            ApplicationCode: "SDMS",
            ActiveUserDetails: getActiveUserDetails(),
            ...additionalData
        };
        return baseData;
    }, [getActiveUserDetails]);

    // Info Dialog Functions
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

    // Make API call
    const makeApiCall = useCallback(async (url, data, processName) => {
        try {
            const response = await postData(url, data);
            
            if (!response) {
                throw new Error('No response from server');
            }
            
            if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
                throw new Error(response.Message || response.ErrorMessage || 'API error');
            }
            
            return response;
        } catch (error) {
            console.error(`${processName} error:`, error);
            showInfoDialog(error.message || `${t('scheduler.apiError')}`, "error");
            throw error;
        }
    }, [postData, t, showInfoDialog]);

    // Fetch retired scheduler data
    const fetchRetiredSchedulerData = useCallback(async () => {
        setLoading(true);
        setLoadingText(t('common.loading'));
        try {
            const initialRequestData = prepareRequestBody();
            const initialResponse = await makeApiCall(
                endpoints.retiredSchedulerView, 
                initialRequestData, 
                "RetireSchedulerInitialView"
            );
            
            const gridRequestData = prepareRequestBody();
            const gridResponse = await makeApiCall(
                endpoints.retiredSchedulerViewGrid, 
                gridRequestData, 
                "FetchRetiredSchedulerGrid"
            );
            
            if (gridResponse && Array.isArray(gridResponse)) {
                const transformedData = gridResponse.map(item => ({
                    id: item.L13ScheduleID?.trim() || '',
                    L11InstrumentAliasName: item.L11InstrumentAliasName || item.L11InstrumentName || "",
                    L13ScheduleID: item.L13ScheduleID?.trim() || '',
                    L06ClientName: item.L06ClientName || "",
                    L09FTPAliasName: item.L09FTPAliasName || "",
                    L13LiveArchive: item.L13LiveArchive || false,
                    L13TaskName: item.L13TaskName || "",
                    L13SourcePath: item.L13SourcePath || "",
                    L52TaskCompleted: item.L52TaskCompleted || "",
                    EmpowerStatus: item.EmpowerStatus || "",
                    L13UNCStatus: item.L13UNCStatus || false,
                    TaskStatus: item.TaskStatus || "Retired",
                    ClientStatus: item.ClientStatus || "Inactive",
                    InstrumentStatus: item.InstrumentStatus || "Inactive",
                    StartDate: item.StartDate || "",
                    UTCStartDate: item.UTCStartDate || "",
                    EndDate: item.EndDate,
                    UTCEndDate: item.UTCEndDate,
                    TriggerTime: item.TriggerTime || "",
                    UTCTriggerTime: item.UTCTriggerTime || "",
                    ScheduleMode: item.ScheduleMode,
                    NextScheduleDate: item.NextScheduleDate,
                    UTCNextScheduleDate: item.UTCNextScheduleDate,
                    LastScheduleDateTime: item.LastScheduleDateTime || "",
                    UTCLastScheduleDateTime: item.UTCLastScheduleDateTime,
                    CreatedBy: item.CreatedBy || "",
                    CreatedDate: item.CreatedDate || "",
                    UTCCreatedDate: item.UTCCreatedDate || "",
                    ModifiedBy: item.ModifiedBy,
                    ModifiedDate: item.ModifiedDate,
                    UTCModifiedDate: item.UTCModifiedDate,
                    L52TaskID: item.L52TaskID || "",
                    L13TaskID: item.L13ScheduleID?.trim() || ''
                }));
                
                setSchedulerData(transformedData);
                
                // Auto-select the first row if data exists
                if (transformedData.length > 0 && !highlightScheduleId) {
                    const firstRow = transformedData[0];
                    setSelectedScheduler(firstRow);
                    setSelectedRowId(firstRow.id);
                    console.log('Auto-selected first row:', firstRow.id);
                }
                
                // Handle navigation highlighting if applicable
                if (highlightScheduleId && shouldScrollToSchedule) {
                    const scheduleToSelect = transformedData.find(item => 
                        item.L13ScheduleID === highlightScheduleId
                    );
                    
                    if (scheduleToSelect) {
                        setSelectedScheduler(scheduleToSelect);
                        setSelectedRowId(scheduleToSelect.id);
                    }
                    setShouldScrollToSchedule(false);
                }
            } else {
                setSchedulerData([]);
                // Clear selections if no data
                setSelectedScheduler(null);
                setSelectedRowId(0);
            }
        } catch (error) {
            console.error('Failed to fetch retired scheduler data:', error);
            setSchedulerData([]);
            setSelectedScheduler(null);
            setSelectedRowId(0);
        } finally {
            setLoading(false);
            setLoadingText("");
        }
    }, [makeApiCall, prepareRequestBody, highlightScheduleId, shouldScrollToSchedule, t]);

    // Show custom confirmation dialog
    const showConfirmation = useCallback((title, message, onConfirm, actionType) => {
        setConfirmDialogData({
            title,
            message,
            onConfirm,
            actionType
        });
        setShowConfirmDialog(true);
    }, []);

    // Handle confirm dialog actions
    const handleConfirmDialogClose = useCallback(() => {
        setShowConfirmDialog(false);
        setConfirmDialogData({
            title: "",
            message: "",
            onConfirm: null,
            actionType: ""
        });
    }, []);

    const handleConfirmDialogConfirm = useCallback(() => {
        if (confirmDialogData.onConfirm) {
            confirmDialogData.onConfirm();
        }
        handleConfirmDialogClose();
    }, [confirmDialogData, handleConfirmDialogClose]);

    // Navigation handling
    useEffect(() => {
        console.log('=== RetiredTask useEffect triggered ===');
        console.log('Navigation data from props:', navigationData);
        console.log('Context submission data:', getSubmissionData());

        let scheduleId = null;

        if (navigationData && navigationData.scheduleId) {
            scheduleId = navigationData.scheduleId;
        } else {
            const submissionData = getSubmissionData();
            if (submissionData && submissionData.targetTab === 'Retired Task') {
                scheduleId = submissionData.data?.scheduleId;
                clearNavigation();
            }
        }

        if (scheduleId) {
            setHighlightScheduleId(scheduleId);
            setShouldScrollToSchedule(true);
            fetchRetiredSchedulerData();
        }
    }, [navigationData, getSubmissionData, clearNavigation, fetchRetiredSchedulerData]);

    // Initial data load
    useEffect(() => {
        fetchRetiredSchedulerData();
    }, []);
    
    useEffect(() => {
        if (schedulerData.length > 0 && selectedRowId === 0 && !highlightScheduleId) {
            // Auto-select first row when data is loaded and no specific schedule is highlighted
            const firstRow = schedulerData[0];
            setSelectedScheduler(firstRow);
            setSelectedRowId(firstRow.id);
            console.log('Auto-selected first row on data change:', firstRow.id);
        }
    }, [schedulerData, highlightScheduleId]);

    useEffect(() => {
        if (shouldScrollToSchedule && highlightScheduleId && schedulerData.length > 0) {
            const scheduleRow = schedulerData.find(item =>
                item.L13ScheduleID === highlightScheduleId
            );

            if (scheduleRow) {
                setSelectedScheduler(scheduleRow);
                setSelectedRowId(scheduleRow.id);
                // showInfoDialog(`Schedule ${highlightScheduleId} retired successfully!`, "success");
                console.log('Auto-selected schedule:', highlightScheduleId);
            } else {
                // If the highlighted schedule is not found, fall back to first row
                const firstRow = schedulerData[0];
                setSelectedScheduler(firstRow);
                setSelectedRowId(firstRow.id);
                console.log('Fallback to auto-selecting first row:', firstRow.id);
            }

            setShouldScrollToSchedule(false);
        }
    }, [schedulerData, highlightScheduleId, shouldScrollToSchedule, showInfoDialog]);

    const handleRowSelect = useCallback((row) => {
        setSelectedScheduler(row);
        setSelectedRowId(row.id);
    }, []);

    // Handle View Schedule
    const handleViewClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }
        
        // Call the API to get view data
        handleViewSchedule();
    }, [selectedScheduler, showInfoDialog, t]);

    // Fix the handleViewSchedule function
    const handleViewSchedule = useCallback(async () => {
        if (!selectedScheduler) return;
        
        try {
            setLoading(true);
            setLoadingText(t('common.loading'));
            
            const viewRequestData = prepareRequestBody({
                L13TaskID: selectedScheduler.L13ScheduleID,
                bExist: true,
                process: "" 
            });
            
            console.log('📤 Sending View request:', viewRequestData);
            
            const response = await makeApiCall(
                endpoints.viewSchedule,
                viewRequestData,
                "ViewSchedule"
            );
            
            console.log('📥 View API Response:', response);
            
            if (response && (response.ViewDatas || response.ViewLoad)) {
                console.log('✅ View data received, navigating...');
                
                const navigationPayload = {
                    viewMode: true,
                    isEdit: true,
                    scheduleId: selectedScheduler.L13ScheduleID,
                    viewData: response,
                    timestamp: Date.now(),
                    fromRetiredTask: true,
                    sourceComponent: 'RetiredTask',
                    sourceTab: 'Retired Task'
                };
                
                console.log('🚀 Calling navigateToDataScheduler with:', navigationPayload);
                
                // **IMPORTANT: Clear any existing navigation first**
                if (clearNavigation) {
                    clearNavigation();
                }
                
                // Then navigate after a tiny delay
                setTimeout(() => {
                    navigateToDataScheduler(navigationPayload);
                    
                    if (navigateToTab) {
                        navigateToTab('Scheduler', 'Data Scheduler', navigationPayload);
                    }
                }, 50);
                
            } else {
                const errorMsg = response?.Message || 
                                response?.returnMsg || 
                                t('scheduler.viewFailed');
                console.error('❌ View API failed:', errorMsg);
                showInfoDialog(errorMsg, "error");
            }
        } catch (error) {
            console.error('❌ View schedule error:', error);
            showInfoDialog(t('scheduler.viewFailed'), "error");
        } finally {
            setLoading(false);
            setLoadingText("");
        }
    }, [selectedScheduler, makeApiCall, prepareRequestBody, t, navigateToDataScheduler, navigateToTab, showInfoDialog, clearNavigation]);
    
    useEffect(() => {
        const handleDataSchedulerNavigation = (event) => {
            console.log('Received navigate-to-datascheduler event:', event.detail);
            if (event.detail?.direct && navigateToTab) {
                // Try navigation one more time with a delay
                setTimeout(() => {
                    navigateToTab('Scheduler', 'Data Scheduler', {
                        viewMode: true,
                        data: event.detail.data,
                        type: 'retired'
                    });
                }, 100);
            }
        };
        
        window.addEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);
        
        return () => {
            window.removeEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);
        };
    }, [navigateToTab]);


    const handlePopupClose = useCallback(() => {
        setActivePopup(null);
        setImportModalOpen(false);
        setAuditTrailData({
            username: "Administrator",
            password: "",
            reason: "",
            comments: ""
        });
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (['xls', 'xlsx'].includes(fileExtension)) {
                setImportFile(file);
            } else {
                showInfoDialog(t('scheduler.invalidFileType'), "error");
                e.target.value = '';
            }
        }
    }, [showInfoDialog, t]);

    // Build export request
    const buildExportRequest = useCallback(() => {
        const allRows = schedulerData.map(item => ({
            ...item,
            L13LiveArchive: item.L13LiveArchive ? "✓" : ""
        }));

        const headerDetails = [
            t('label.taskId'),
            t('scheduler.clientName'),
            t('scheduler.storageName'),
            t('scheduler.liveArchive'),
            t('label.taskName'),
            t('label.instrument'),
            t('scheduler.sourcePath'),
            t('scheduler.firstCycleStatus'),
            t('scheduler.empowerStatus'),
            t('scheduler.uncStatus'),
            t('scheduler.taskStatus'),
            t('scheduler.startDate'),
            t('scheduler.endDate'),
            t('scheduler.triggerTime'),
            t('scheduler.scheduleMode'),
            t('scheduler.nextScheduleDateTime'),
            t('scheduler.lastScheduleDateTime'),
            t('label.createdBy'),
            t('label.createdOn'),
            t('label.modifiedBy'),
            t('label.modifiedOn')
        ];

        const allowKeys = [
            "L13ScheduleID",
            "L06ClientName",
            "L09FTPAliasName",
            "L13LiveArchive",
            "L13TaskName",
            "L11InstrumentAliasName",
            "L13SourcePath",
            "L52TaskCompleted",
            "EmpowerStatus",
            "L13UNCStatus",
            "TaskStatus",
            "StartDate",
            "EndDate",
            "TriggerTime",
            "ScheduleMode",
            "NextScheduleDate",
            "LastScheduleDateTime",
            "CreatedBy",
            "CreatedDate",
            "ModifiedBy",
            "ModifiedDate"
        ];

        return {
            sFileName: "RetiredScheduler",
            AllRows: allRows,
            HeaderDetails: headerDetails,
            AllowKeys: allowKeys,
            sBrowserURL: window.location.origin,
            ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
            ApplicationCode: "SDMS"
        };
    }, [schedulerData, t, prepareRequestBody]);

    // Handle export
    const handleExportClick = useCallback(() => {
        if (schedulerData.length === 0) {
            showInfoDialog(t('scheduler.noRecordsToExport'), "warning");
            return;
        }

        handleExportCommon({
            rows: schedulerData,
            buildRequest: buildExportRequest,
            postData,
            setLoading,
            setLoadingText,
            setErrorDialog: ({ open, message, type }) => {
                showInfoDialog(message, type);
            },
            t
        });
    }, [schedulerData, buildExportRequest, postData, showInfoDialog, t]);

    // Handle print
    const handlePrintClick = useCallback(() => {
        if (!schedulerData || schedulerData.length === 0) {
            showInfoDialog(t('scheduler.selectRecord'), "information");
            return;
        }

        setDoPrint(true);
    }, [schedulerData, showInfoDialog, t]);

    // Build print request
    const buildPrintRequest = useCallback(() => ({
        sModuleName: "Retired Scheduler",
        ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
        ApplicationCode: "SDMS",
    }), [prepareRequestBody]);

    // Handle upload file
    const handleUploadSubmit = useCallback(async () => {
        if (!importFile) {
            showInfoDialog(t('scheduler.selectFileToUpload'), "warning");
            return;
        }

        try {
            setLoading(true);
            setLoadingText(t('scheduler.uploading'));
            
            const formData = new FormData();
            formData.append('file', importFile);
            
            const userDetails = getActiveUserDetails();
            formData.append('sUsername', userDetails.sUsername || '');
            formData.append('sSiteCode', userDetails.sSiteCode || '');
            formData.append('sUserID', userDetails.sUserID || '');
            formData.append('sTimeZoneID', userDetails.sTimeZoneID || '');
            formData.append('ActiveUserDetails', JSON.stringify(userDetails));
            
            const response = await fetch(endpoints.importScheduler, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            });
            
            const data = await response.json();
            
            if (!data.Rtn) {
                showInfoDialog(t('scheduler.importFailed'), "error");
            } else if (data.Rtn.toLowerCase() === 'success' || data.Rtn.toLowerCase() === 'partial_success') {
                if (data.Rtn.toLowerCase() === 'success') {
                    showInfoDialog(t('scheduler.importSuccess'), "success");
                }
                
                await fetchRetiredSchedulerData();
                
                if (data.ExportDataViewURL) {
                    const win = window.open(data.ExportDataViewURL, '_blank');
                    if (win) {
                        win.focus();
                    } else {
                        alert(t('scheduler.allowPopups'));
                    }
                }
            } else {
                showInfoDialog(data.Message || t('scheduler.importFailed'), "error");
            }
            
            setImportModalOpen(false);
            setImportFile(null);
        } catch (error) {
            showInfoDialog(t('scheduler.importFailed'), "error");
        } finally {
            setLoading(false);
            setLoadingText("");
        }
    }, [importFile, getActiveUserDetails, fetchRetiredSchedulerData, t, showInfoDialog]);

    // Handle download template
    const handleDownloadTemplate = useCallback(() => {
        const userDetails = getActiveUserDetails();
        const newurl = 'template/Import Schedule.xls'.replaceAll("/", "~");
        const downloadFileURL = `[YOUR_BASE_URL]/Scheduler/ImportTemplateFileData/${userDetails.sSiteCode || ''}/${userDetails.sUserID || ''}/${newurl}`;
        
        showInfoDialog(t('scheduler.templateDownloadStarted'), "success");
        
        const win = window.open(downloadFileURL, '_blank');
        if (win) {
            win.focus();
        } else {
            alert(t('scheduler.allowPopups'));
        }
    }, [getActiveUserDetails, t, showInfoDialog]);

    const columns = useMemo(() => [
        {
            key: 'L11InstrumentAliasName',
            label: t('label.instrument'),
            width: 150,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.L11InstrumentAliasName}
                </div>
            )
        },
        {
            key: 'L13ScheduleID',
            label: t('label.taskId'),
            width: 110,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.L13ScheduleID}
                </div>
            )
        },
        {
            key: 'L06ClientName',
            label: t('scheduler.clientName'),
            width: 130,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.L06ClientName}
                </div>
            )
        },
        {
            key: 'L09FTPAliasName',
            label: t('scheduler.storageName'),
            width: 140,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.L09FTPAliasName}
                </div>
            )
        },
        {
            key: 'L13LiveArchive',
            label: t('scheduler.liveArchive'),
            width: 140,
            enableSearch: true,
            render: (row, isSelected) => (
                <div 
                    className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer text-center ${isSelected ? 'font-bold' : ''}`}
                    onClick={() => handleRowSelect(row)}
                >
                    {row.L13LiveArchive ? "✓" : ""}
                </div>
            )
        }
    ], [t, handleRowSelect]);

    const renderSchedulerDetail = useCallback((scheduler) => (
        <div className="space-y-2">
            <DetailRow label={t('label.taskName')} value={scheduler.L13TaskName} />
            <DetailRow label={t('scheduler.sourcepath')} value={scheduler.L13SourcePath} />
            <DetailRow label={t('scheduler.firstCycleStatus')} value={scheduler.L52TaskCompleted} />
            <DetailRow label={t('scheduler.empowerStatus')} value={scheduler.EmpowerStatus} />
            <DetailRow label={t('scheduler.uncStatus')} value={scheduler.L13UNCStatus ? t('button.yes') : t('button.no')} />
            <DetailRow label={t('scheduler.taskStatus')} value={scheduler.TaskStatus} />
            <DetailRow label={t('scheduler.clientstatus')} value={scheduler.ClientStatus} />
            <DetailRow label={t('scheduler.instrumentstatus')} value={scheduler.InstrumentStatus} />
            <DetailRow label={t('scheduler.startDate')} value={scheduler.StartDate} />
            <DetailRow label={t('scheduler.endDate')} value={scheduler.EndDate || t('scheduler.notSet')} />
            <DetailRow label={t('scheduler.triggerTime')} value={scheduler.TriggerTime} />
            <DetailRow label={t('scheduler.scheduleMode')} value={scheduler.ScheduleMode || t('scheduler.notSet')} />
            <DetailRow label={t('scheduler.nextScheduleDateTime')} value={scheduler.NextScheduleDate || t('scheduler.notSet')} />
            <DetailRow label={t('scheduler.lastScheduleDateTime')} value={scheduler.LastScheduleDateTime || t('scheduler.notSet')} />
            <DetailRow label={t('label.createdBy')} value={scheduler.CreatedBy} />
            <DetailRow label={t('label.createdOn')} value={scheduler.CreatedDate} />
            <DetailRow label={t('label.modifiedBy')} value={scheduler.ModifiedBy || t('scheduler.notSet')} />
            <DetailRow label={t('label.modifiedOn')} value={scheduler.ModifiedDate || t('scheduler.notSet')} />
        </div>
    ), [t]);

    const DetailRow = ({ label, value }) => (
        <div className="grid grid-cols-2 gap-4">
            <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
                {label}
            </div>
            <div className="font-bold text-[12px] text-[#353f49] font-roboto">
                {value || "-"}
            </div>
        </div>
    );

    const ActionButton = ({ iconClass, label, disabled, onClick, variant = "default" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center gap-1.5 px-3 py-2 text-[11px] font-roboto font-bold rounded border-none 
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
            {iconClass && <i className={`fa ${iconClass} w-3 h-3`}></i>}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col font-roboto bg-white w-full h-[80vh] overflow-hidden relative">
            {/* Error/Info Dialog */}
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                    onConfirm={infoDialog.type === "confirmation" && handleConfirmDialogConfirm}
                />
            )}

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <Errordialog
                    message={confirmDialogData.message}
                    type="confirmation"
                    onClose={handleConfirmDialogClose}
                    onConfirm={handleConfirmDialogConfirm}
                    okText={t('button.yes')}
                    cancelText={t('button.no')}
                />
            )}

            {/* FullPageLoader */}
            <FullPageLoader loading={loading} text={loadingText} />

            {/* Top Action Buttons */}
            <div className="flex justify-end pr-5 gap-2 pt-3">
                <ActionButton
                    iconClass="fa-eye"
                    label={t('button.view')}
                    onClick={handleViewClick}
                    disabled={!selectedScheduler}
                />
                <ActionButton
                    iconClass="glyphicon glyphicon-export"
                    label={t('button.export')}
                    onClick={handleExportClick}
                />
               
                <ActionButton
                    iconClass="glyphicon glyphicon-print"
                    label={t('button.print')}
                    onClick={handlePrintClick}
                />
            </div>

            {/* Main GridLayout with Details Panel */}
            <div className="flex-1 overflow-hidden p-1 ">
                <GridLayout
                    columns={columns}
                    height="100%"
                    detailPanelWidth="46%"
                    data={schedulerData}
                    getRowId={(row) => row.id}
                    renderDetailPanel={renderSchedulerDetail}
                    onRowClick={handleRowSelect}
                    rowClassName={(row) =>
                        row.id === selectedRowId
                            ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
                            : ""
                    }
                />
            </div>

            {/* Print Component */}
            {doPrint && (
                <PrintTable
                    columns={columns}
                    rows={schedulerData}
                    title={t('scheduler.retiredScheduler')}
                    subtitle=""
                    printRequest={buildPrintRequest()}
                    onDone={() => setDoPrint(false)}
                />
            )}

           
        </div>
    );
};

export default RetiredTask;