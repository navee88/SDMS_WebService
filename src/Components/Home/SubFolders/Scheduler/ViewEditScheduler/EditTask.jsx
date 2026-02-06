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

const EditTask = ({ navigationData, onClearNavigation, onNavigateAway }) => {
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

    const { navigateToDataScheduler, navigateToTab, navigationState } = useSchedulerNavigation();


    const [confirmDialogData, setConfirmDialogData] = useState({
        title: "",
        message: "",
        onConfirm: null,
        actionType: ""
    });
    const { t } = useTranslation('scheduler');

    // Audit trail state
    const [showAudit, setShowAudit] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [pendingActionData, setPendingActionData] = useState(null);
    const [auditTrailRights, setAuditTrailRights] = useState({
        edit: 0
    });

    const { postData } = servicecall();
    const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
    const [highlightScheduleId, setHighlightScheduleId] = useState(null);
    const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);

    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const endpoints = {
        editSchedulerView: "Scheduler/EditSchedulerView",
        editSchedulerViewGrid: "Scheduler/DeactiveSchedulerViewgrid",
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

    // Fetch edit scheduler data
    const fetchEditSchedulerData = useCallback(async () => {
        setLoading(true);
        setLoadingText(t('common.loading'));
        try {
            const initialRequestData = prepareRequestBody();
            const initialResponse = await makeApiCall(
                endpoints.editSchedulerView,
                initialRequestData,
                "EditSchedulerInitialView"
            );

            const gridRequestData = prepareRequestBody();
            const gridResponse = await makeApiCall(
                endpoints.editSchedulerViewGrid,
                gridRequestData,
                "FetchEditSchedulerGrid"
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
                    TaskStatus: item.TaskStatus || "Active",
                    ClientStatus: item.ClientStatus || "Active",
                    InstrumentStatus: item.InstrumentStatus || "Active",
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
            console.error('Failed to fetch edit scheduler data:', error);
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

    // Load audit trail rights
    useEffect(() => {
        const loadAuditTrailRights = () => {
            try {
                const auditRightsData = sessionStorage.getItem('auditTrailRights');

                if (auditRightsData) {
                    try {
                        const rights = JSON.parse(auditRightsData);
                        const schedulerRights = rights.filter(item =>
                            item.sScreenName && item.sScreenName.includes("Edit Task")
                        );

                        const editRight = schedulerRights.find(item =>
                            item.sTaskName && item.sTaskName.includes("Edit")
                        );

                        setAuditTrailRights({
                            edit: editRight ? (editRight.nManualAuditTrail || 0) : 0
                        });
                    } catch (parseError) {
                        setAuditTrailRights({ edit: 1 });
                    }
                } else {
                    setAuditTrailRights({ edit: 1 });
                }
            } catch (error) {
                setAuditTrailRights({ edit: 1 });
            }
        };

        loadAuditTrailRights();
    }, []);

    // Navigation handling
    // useEffect(() => {
    //     console.log('=== EditTask useEffect triggered ===');
    //     console.log('Navigation data from props:', navigationData);
    //     console.log('Context submission data:', getSubmissionData());

    //     let scheduleId = null;

    //     if (navigationData && navigationData.scheduleId) {
    //         scheduleId = navigationData.scheduleId;
    //     } else {
    //         const submissionData = getSubmissionData();
    //         if (submissionData && submissionData.targetTab === 'Edit Task') {
    //             scheduleId = submissionData.data?.scheduleId;
    //             clearNavigation();
    //         }
    //     }

    //     if (scheduleId) {
    //         setHighlightScheduleId(scheduleId);
    //         setShouldScrollToSchedule(true);
    //         fetchEditSchedulerData();
    //     } else if (schedulerData.length === 0) {
    //         // Only fetch if we don't have data yet
    //         fetchEditSchedulerData();
    //     }
    // }, [navigationData]);


    // useEffect(() => {
    //     if (navigationState?.data?.fromDataScheduler &&
    //         navigationState?.data?.scheduleUpdated) {

    //         console.log('✅ Schedule update detected in EditTask');

    //         setSuccessMessage(navigationState.data.message);
    //         setShowSuccessDialog(true);

    //         // Remove the loadScheduleData call or define it properly
    //         // if (navigationState.data.scheduleId) {
    //         //     loadScheduleData(navigationState.data.scheduleId);
    //         // }

    //         setTimeout(() => {
    //             clearNavigation();
    //         }, 500);
    //     }
    // }, [navigationState, clearNavigation]);

    useEffect(() => {
        if (navigationState?.data?.fromDataScheduler &&
            navigationState?.data?.scheduleUpdated) {

            console.log('✅ Schedule update detected in EditTask');

            // Show success message
            setSuccessMessage(navigationState.data.message || "Scheduler Updated Successfully");
            setShowSuccessDialog(true);

            // Refresh grid data
            fetchEditSchedulerData();

            // Clear navigation
            setTimeout(() => {
                if (clearNavigation) {
                    clearNavigation();
                }
            }, 500);
        }
    }, [navigationState, clearNavigation, fetchEditSchedulerData]);

    useEffect(() => {
        console.log('EditTask - checking for refresh trigger');

        const submissionData = getSubmissionData();
        console.log('Submission data:', submissionData);

        if (submissionData?.data?.showSuccess) {  // ← KEY: Check for showSuccess flag
            // Show success message
            showInfoDialog("Scheduler Updated Successfully", "success");

            // Refresh the grid data
            fetchEditSchedulerData();

            // Clear the navigation
            clearNavigation();
        }

        if (submissionData?.data?.fromCancel) {
            // Came back from cancel, just refresh
            fetchEditSchedulerData();
            clearNavigation();
        }
    }, [getSubmissionData, clearNavigation, fetchEditSchedulerData, showInfoDialog]);

    // Initial data load
    useEffect(() => {
        fetchEditSchedulerData();
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
                // showInfoDialog(`Schedule ${highlightScheduleId} selected for editing`, "success");
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

    // Handle Edit Schedule
    // const handleEditClick = useCallback(() => {
    //     if (!selectedScheduler) {
    //         showInfoDialog(t('scheduler.selectRecord'), "warning");
    //         return;
    //     }

    //     // Check audit trail rights
    //     if (auditTrailRights.edit === 1) {
    //         // Store action data and show audit trail
    //         setPendingAction('edit');
    //         setPendingActionData({
    //             scheduleId: selectedScheduler.L13ScheduleID,
    //             scheduleName: selectedScheduler.L13TaskName
    //         });
    //         setShowAudit(true);
    //     } else {
    //         // No audit trail required, proceed directly
    //         executeEdit();
    //     }
    // }, [selectedScheduler, showInfoDialog, t, auditTrailRights.edit]);


    const handleEditClick = useCallback(async () => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }

        try {
            setLoading(true);
            setLoadingText(t('scheduler.loading'));

            // FIRST API CALL - Get edit data (like jQuery's EditSchedulerEditBtnclick)
            const editRequestData = {
                bExist: true,
                process: "",
                L13TaskID: selectedScheduler.L13ScheduleID.trim(),
                ...CF_activeUserdetails()
            };

            console.log('📤 Sending Edit request to get data:', editRequestData);

            const response = await postData(
                'Scheduler/DataSchedulerSave',
                editRequestData
            );

            console.log('📥 Edit API Response:', response);

            // Check audit trail login
            if (response && response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
                return;
            }

            if (response && (response.ViewDatas || response.ViewLoad)) {
                console.log('✅ Edit data received, navigating...');

                // Navigate to Data Scheduler with edit data
                const navigationPayload = {
                    viewMode: false,
                    isEdit: true,
                    scheduleId: selectedScheduler.L13ScheduleID,
                    viewData: response,
                    timestamp: Date.now(),
                    fromEditTask: true,
                    sourceComponent: 'EditTask',
                    innerTab: 'Edit Task',
                    process: "edit" // Add process flag
                };

                console.log('🚀 Calling navigateToDataScheduler with edit mode');

                // Clear any existing navigation first
                if (clearNavigation) {
                    clearNavigation();
                }

                // Navigate to Data Scheduler
                setTimeout(() => {
                    navigateToDataScheduler(navigationPayload);
                }, 50);

            } else {
                const errorMsg = response?.Message || response?.returnMsg || t('scheduler.editFailed');
                console.error('❌ Edit API failed:', errorMsg);
                showInfoDialog(errorMsg, "error");
            }
        } catch (error) {
            console.error('❌ Edit schedule error:', error);
            showInfoDialog(t('scheduler.editFailed'), "error");
        } finally {
            setLoading(false);
            setLoadingText("");
        }
    }, [selectedScheduler, postData, t, showInfoDialog, navigateToDataScheduler, clearNavigation]);


    // Fix the handleViewSchedule function
    // const handleViewSchedule = useCallback(async () => {
    //     if (!selectedScheduler) return;

    //     try {
    //         setLoading(true);
    //         setLoadingText(t('scheduler.loading'));

    //         const viewRequestData = prepareRequestBody({
    //             L13TaskID: selectedScheduler.L13ScheduleID,
    //             bExist: true,
    //             process: ""
    //         });

    //         console.log('📤 Sending View request:', viewRequestData);

    //         const response = await makeApiCall(
    //             endpoints.viewSchedule,
    //             viewRequestData,
    //             "ViewSchedule"
    //         );

    //         console.log('📥 View API Response:', response);

    //         if (response && (response.ViewDatas || response.ViewLoad)) {
    //             console.log('✅ View data received, navigating...');

    //             const navigationPayload = {
    //                 viewMode: true,
    //                 isEdit: false, // View mode
    //                 scheduleId: selectedScheduler.L13ScheduleID,
    //                 viewData: response,
    //                 timestamp: Date.now(),
    //                 fromEditTask: true,
    //                 sourceComponent: 'EditTask',
    //                 sourceTab: 'Edit Task'
    //             };

    //             console.log('🚀 Calling navigateToDataScheduler with:', navigationPayload);

    //             // **IMPORTANT: Clear any existing navigation first**
    //             if (clearNavigation) {
    //                 clearNavigation();
    //             }

    //             // Then navigate after a tiny delay
    //             setTimeout(() => {
    //                 navigateToDataScheduler(navigationPayload);

    //                 if (navigateToTab) {
    //                     navigateToTab('Scheduler', 'Data Scheduler', navigationPayload);
    //                 }
    //             }, 50);

    //         } else {
    //             const errorMsg = response?.Message ||
    //                 response?.returnMsg ||
    //                 t('scheduler.viewFailed');
    //             console.error('❌ View API failed:', errorMsg);
    //             showInfoDialog(errorMsg, "error");
    //         }
    //     } catch (error) {
    //         console.error('❌ View schedule error:', error);
    //         showInfoDialog(t('scheduler.viewFailed'), "error");
    //     } finally {
    //         setLoading(false);
    //         setLoadingText("");
    //     }
    // }, [selectedScheduler, makeApiCall, prepareRequestBody, t, navigateToDataScheduler, navigateToTab, showInfoDialog, clearNavigation]);

    const handleViewSchedule = useCallback(async () => {
        if (!selectedScheduler) return;

        try {
            setLoading(true);
            setLoadingText(t('scheduler.loading'));

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

                // Use the same structure as Edit button
                const navigationPayload = {
                    viewMode: true,
                    isEdit: false,
                    scheduleId: selectedScheduler.L13ScheduleID,
                    viewData: response,
                    timestamp: Date.now(),
                    fromEditTask: true,
                    sourceComponent: 'EditTask',
                    sourceTab: 'Edit Task'
                };

                console.log('🚀 Calling navigateToDataScheduler with:', navigationPayload);

                // Clear any existing navigation first
                if (clearNavigation) {
                    clearNavigation();
                }

                // Use navigateToDataScheduler instead of navigateToTab
                setTimeout(() => {
                    navigateToDataScheduler(navigationPayload);
                }, 50);

            } else {
                const errorMsg = response?.Message || response?.returnMsg || t('scheduler.viewFailed');
                console.error('View API failed:', errorMsg);
                showInfoDialog(errorMsg, "error");
            }
        } catch (error) {
            console.error('View schedule error:', error);
            showInfoDialog(t('scheduler.viewFailed'), "error");
        } finally {
            setLoading(false);
            setLoadingText("");
        }
    }, [selectedScheduler, makeApiCall, prepareRequestBody, t, navigateToDataScheduler, showInfoDialog, clearNavigation]);

    // Execute edit after audit or directly
    // const executeEdit = useCallback(async (auditTrailValues = null) => {
    //     try {
    //         setLoading(true);
    //         setLoadingText(t('scheduler.loading'));

    //         const editRequestData = prepareRequestBody({
    //             L13TaskID: selectedScheduler.L13ScheduleID,
    //             bExist: true,
    //             process: "",
    //             ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
    //         });

    //         console.log('📤 Sending Edit request:', editRequestData);

    //         const response = await makeApiCall(
    //             endpoints.viewSchedule,
    //             editRequestData,
    //             "EditSchedule"
    //         );

    //         console.log('📥 Edit API Response:', response);

    //         // Check audit trail login
    //         if (response && response.AuditTrailLogin === false) {
    //             showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
    //             return;
    //         }

    //         if (response && (response.ViewDatas || response.ViewLoad)) {
    //             console.log('✅ Edit data received, navigating...');

    //             const navigationPayload = {
    //                 viewMode: false,
    //                 isEdit: true,
    //                 scheduleId: selectedScheduler.L13ScheduleID,
    //                 viewData: response,
    //                 timestamp: Date.now(),
    //                 fromEditTask: true,
    //                 sourceComponent: 'EditTask',
    //                 innerTab: 'Edit Task'
    //             };

    //             console.log('🚀 Calling navigateToDataScheduler with:', navigationPayload);

    //             // **IMPORTANT: Clear any existing navigation first**
    //             if (clearNavigation) {
    //                 clearNavigation();
    //             }

    //             // Then navigate after a tiny delay
    //             setTimeout(() => {
    //                 navigateToDataScheduler(navigationPayload);

    //                 if (navigateToTab) {
    //                     navigateToTab('Scheduler', 'Data Scheduler', navigationPayload);
    //                 }
    //             }, 50);

    //         } else {
    //             const errorMsg = response?.Message ||
    //                 response?.returnMsg ||
    //                 t('scheduler.editFailed');
    //             console.error('❌ Edit API failed:', errorMsg);
    //             showInfoDialog(errorMsg, "error");
    //         }
    //     } catch (error) {
    //         console.error('❌ Edit schedule error:', error);
    //         showInfoDialog(t('scheduler.editFailed'), "error");
    //     } finally {
    //         setLoading(false);
    //         setLoadingText("");
    //     }
    // }, [selectedScheduler, makeApiCall, prepareRequestBody, t, navigateToDataScheduler, navigateToTab, showInfoDialog, clearNavigation]);

    const executeEdit = useCallback(async (auditTrailValues = null) => {
        try {
            setLoading(true);
            setLoadingText(t('scheduler.loading'));

            const editRequestData = prepareRequestBody({
                L13TaskID: selectedScheduler.L13ScheduleID,
                bExist: true,
                process: "",
                ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
            });

            console.log('📤 Sending Edit request:', editRequestData);

            const response = await makeApiCall(
                endpoints.viewSchedule,
                editRequestData,
                "EditSchedule"
            );

            console.log('📥 Edit API Response:', response);

            // Check audit trail login
            if (response && response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
                return;
            }

            if (response && (response.ViewDatas || response.ViewLoad)) {
                console.log('✅ Edit data received, navigating...');

                // FIX: Use the same structure as View button
                const navigationPayload = {
                    viewMode: false,
                    isEdit: true,
                    scheduleId: selectedScheduler.L13ScheduleID,
                    viewData: response,
                    timestamp: Date.now(),
                    fromEditTask: true,
                    sourceComponent: 'EditTask',
                    innerTab: 'Edit Task'
                };

                console.log('🚀 Calling navigateToDataScheduler with:', navigationPayload);

                // Clear any existing navigation first
                if (clearNavigation) {
                    clearNavigation();
                }

                // Use navigateToDataScheduler instead of navigateToTab
                setTimeout(() => {
                    navigateToDataScheduler(navigationPayload);
                }, 50);

            } else {
                const errorMsg = response?.Message || response?.returnMsg || t('scheduler.editFailed');
                console.error('❌ Edit API failed:', errorMsg);
                showInfoDialog(errorMsg, "error");
            }
        } catch (error) {
            console.error('❌ Edit schedule error:', error);
            showInfoDialog(t('scheduler.editFailed'), "error");
        } finally {
            setLoading(false);
            setLoadingText("");
        }
    }, [selectedScheduler, makeApiCall, prepareRequestBody, t, navigateToDataScheduler, showInfoDialog, clearNavigation]);


    // Handle audit trail authorized
    const handleAuditAuthorized = useCallback((auditData) => {
        const auditTrailValues = auditData.AuditTrailValues;

        if (!auditTrailValues) {
            showInfoDialog("Audit trail data is missing", "error");
            setShowAudit(false);
            setPendingAction(null);
            setPendingActionData(null);
            return;
        }

        setShowAudit(false);

        if (pendingAction === 'edit' && pendingActionData) {
            executeEdit(auditTrailValues);
        }

        setPendingAction(null);
        setPendingActionData(null);
    }, [pendingAction, pendingActionData, executeEdit, showInfoDialog]);

    const handleAuditClose = useCallback(() => {
        setShowAudit(false);
        setPendingAction(null);
        setPendingActionData(null);
    }, []);

    // Add this useEffect in EditTask:
    useEffect(() => {
        console.log('EditTask - checking for refresh trigger');

        const submissionData = getSubmissionData();
        console.log('Submission data:', submissionData);

        if (submissionData?.data?.showSuccess) {
            // Show success message
            showInfoDialog("Scheduler Updated Successfully", "success");

            // Refresh the grid data
            fetchEditSchedulerData();

            // Clear the navigation
            clearNavigation();
        }

        if (submissionData?.data?.fromCancel) {
            // Came back from cancel, just refresh
            fetchEditSchedulerData();
            clearNavigation();
        }
    }, [getSubmissionData, clearNavigation, fetchEditSchedulerData, showInfoDialog]);

    useEffect(() => {
        const handleDataSchedulerNavigation = (event) => {
            console.log('Received navigate-to-datascheduler event:', event.detail);
            if (event.detail?.direct && navigateToTab) {
                // Try navigation one more time with a delay
                setTimeout(() => {
                    navigateToTab('Scheduler', 'Data Scheduler', {
                        viewMode: true,
                        data: event.detail.data,
                        type: 'edit'
                    });
                }, 100);
            }
        };

        window.addEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);

        return () => {
            window.removeEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);
        };
    }, [navigateToTab]);



    // useEffect(() => {
    //     // Optional: Validate task when component loads
    //     const validateTask = async () => {
    //         const taskId = selectedTaskId;

    //         if (taskId) {
    //             const validatePayload = {
    //                 ...CF_activeUserdetails(),
    //                 bExist: true,
    //                 process: "",
    //                 L13TaskID: taskId
    //             };

    //             try {
    //                 // Import or define DataSchedulerupdate at the top
    //                 // import { DataSchedulerupdate } from '../../servicecall';

    //                 const response = await DataSchedulerupdate(validatePayload);
    //                 if (!response.oResObj.bStatus) {
    //                     console.error("Task validation failed");
    //                 }
    //             } catch (error) {
    //                 console.error("Validation error:", error);
    //             }
    //         }
    //     };

    //     // validateTask(); // Uncomment if you want validation
    // }, []); // Remove selectedTaskId from dependencies



    const handleImportClick = useCallback(() => {
        setImportModalOpen(true);
    }, []);

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
            t('scheduler.createdBy'),
            t('scheduler.createdOn'),
            t('scheduler.modifiedBy'),
            t('scheduler.modifiedOn')
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
            sFileName: "EditScheduler",
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
        sModuleName: "Edit Scheduler",
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

                await fetchEditSchedulerData();

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
    }, [importFile, getActiveUserDetails, fetchEditSchedulerData, t, showInfoDialog]);

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

            {/* Audit Trail Modal */}
            {showAudit && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
                    <AuditTrail
                        isOpen={showAudit}
                        onClose={handleAuditClose}
                        onAuthorized={handleAuditAuthorized}
                        actionLabel={'Edit Task'}
                        defaultReason={"Edited"}
                        disableReason={false}
                    />
                </div>
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
                    iconClass="fa-pencil-square-o"
                    label={t('button.edit')}
                    onClick={handleEditClick}
                    disabled={!selectedScheduler}
                />
                <ActionButton
                    iconClass="glyphicon glyphicon-export"
                    label={t('button.export')}
                    onClick={handleExportClick}
                />
                <ActionButton
                    iconClass="glyphicon glyphicon-import"
                    label={t('button.import')}
                    onClick={handleImportClick}
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
                    title={t('scheduler.editScheduler')}
                    subtitle=""
                    printRequest={buildPrintRequest()}
                    onDone={() => setDoPrint(false)}
                />
            )}

            {/* Import Modal */}
            {importModalOpen && (
                <CustomPopup
                    isOpen={importModalOpen}
                    onClose={handlePopupClose}
                    title={t('scheduler.importSchedule')}
                    content={
                        <div className="flex flex-col gap-4 p-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">
                                    {t('scheduler.file')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".xlsx,.xls"
                                    className="w-full p-2 text-sm border border-gray-300 rounded outline-none"
                                />
                                <div className="text-xs text-gray-500">
                                    {t('scheduler.activeNoteBrowseUploadXlsAndXlxs')}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 border-none rounded cursor-pointer hover:bg-blue-700"
                                >
                                    <i className="fa fa-download"></i> {t('scheduler.getImportTemplate')}
                                </button>
                                <button
                                    onClick={handleUploadSubmit}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-white bg-green-500 border-none rounded cursor-pointer hover:bg-green-600"
                                >
                                    <i className="fa fa-upload"></i> {t('scheduler.upload')}
                                </button>
                            </div>
                        </div>
                    }
                    size="md"
                />
            )}
            {showSuccessDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-xl max-w-md">
                        <div className="flex items-center mb-4">
                            <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <h3 className="text-lg font-semibold">Success</h3>
                        </div>
                        <p className="text-gray-700 mb-4">{successMessage}</p>
                        <button
                            onClick={() => setShowSuccessDialog(false)}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditTask;