// import { useState, useMemo, useEffect, useCallback } from 'react';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// import { useTranslation } from 'react-i18next';
// import { useNavigate } from "react-router-dom";
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import CustomPopup from '../../../../Layout/Common/Popup';
// import PrintTable from '../../../../Layout/Common/PrintTable';
// import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';
// import servicecall from '../../../../../Services/servicecall';
// import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
// import { handleExportCommon } from '../../../../Layout/Common/exportService';
// import FullPageLoader from '../../../../Layout/Common/FullPageLoader';

// const DeactivedTask = ({ navigationData }) => {
//     const [schedulerData, setSchedulerData] = useState([]);
//     const [selectedScheduler, setSelectedScheduler] = useState(null);
//     const [selectedRowId, setSelectedRowId] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [infoDialog, setInfoDialog] = useState({
//         open: false,
//         scheduler: "",
//         type: "information"
//     });
//     const [activePopup, setActivePopup] = useState(null);
//     const [auditTrailData, setAuditTrailData] = useState({
//         username: "Administrator",
//         password: "",
//         reason: "",
//         comments: ""
//     });
//     const [importModalOpen, setImportModalOpen] = useState(false);
//     const [importFile, setImportFile] = useState(null);
//     const [showConfirmDialog, setShowConfirmDialog] = useState(false);
//     const [doPrint, setDoPrint] = useState(false);
//     const [loadingText, setLoadingText] = useState("");

//     const [confirmDialogData, setConfirmDialogData] = useState({
//         title: "",
//         message: "",
//         onConfirm: null,
//         actionType: "" // "activate" or "retire"
//     });
//     const { t } = useTranslation('scheduler');

//     // API service
//     const { postData } = servicecall();

//     // Navigation context
//     const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
//     const [highlightScheduleId, setHighlightScheduleId] = useState(null);
//     const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);
//     const navigate = useNavigate();

//     // API endpoints
//     const endpoints = {
//         deactiveSchedulerView: "Scheduler/DeactiveSchedulerView",
//         deactiveSchedulerViewGrid: "Scheduler/DeactiveSchedulerViewgrid",
//         deactiveSchedulerActivate: "Scheduler/DeactiveSchedulerActiveBtnClick",
//         deactiveSchedulerRetire: "Scheduler/DeactiveSchedulerRetireBtnClick",
//         exportData: "basemaster/exportDataFile",
//         checkManualTask: "Scheduler/CheckManualTaskForScheduler",
//         viewSchedule: "Scheduler/DataSchedulerSave"
//     };

//     // Get active user details
//     const getActiveUserDetails = useCallback(() => {
//         const userDetails = CF_activeUserdetails();
//         return userDetails.ActiveUserDetails || {};
//     }, []);

//     // Prepare API request body
//     const prepareRequestBody = useCallback((additionalData = {}) => {
//         const baseData = {
//             ApplicationCode: "SDMS",
//             ActiveUserDetails: getActiveUserDetails(),
//             ...additionalData
//         };
//         return baseData;
//     }, [getActiveUserDetails]);

//     // Info Dialog Functions
//     const showInfoDialog = useCallback((scheduler, type = "information") => {
//         setInfoDialog({
//             open: true,
//             scheduler,
//             type
//         });
//     }, []);

//     const closeInfoDialog = useCallback(() => {
//         setInfoDialog(prev => ({
//             ...prev,
//             open: false
//         }));
//     }, []);

//     // Make API call
//     const makeApiCall = useCallback(async (url, data, processName) => {
//         try {
//             const response = await postData(url, data);

//             if (!response) {
//                 throw new Error('No response from server');
//             }

//             if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
//                 throw new Error(response.Message || response.ErrorMessage || 'API error');
//             }

//             return response;
//         } catch (error) {
//             console.error(`${processName} error:`, error);
//             showInfoDialog(error.message || `${t('scheduler.apiError')}`, "error");
//             throw error;
//         }
//     }, [postData, t, showInfoDialog]);

//     // Fetch deactivated scheduler data
//     // Replace the current fetchDeactivatedSchedulerData function with this:
// const fetchDeactivatedSchedulerData = useCallback(async (showLoader = true) => {
//     if (showLoader) {
//         setLoading(true);
//     }

//     try {
//         // First call: DeactiveSchedulerView (initial load)
//         const initialRequestData = prepareRequestBody();
//         const initialResponse = await makeApiCall(
//             endpoints.deactiveSchedulerView, 
//             initialRequestData, 
//             "DeactiveSchedulerInitialView"
//         );

//         // Second call: DeactiveSchedulerViewgrid (grid data)
//         const gridRequestData = prepareRequestBody();
//         const gridResponse = await makeApiCall(
//             endpoints.deactiveSchedulerViewGrid, 
//             gridRequestData, 
//             "FetchDeactivatedSchedulerGrid"
//         );

//         if (gridResponse && Array.isArray(gridResponse)) {
//             // Transform the API response
//             const transformedData = gridResponse.map(item => ({
//                 id: item.L13ScheduleID?.trim() || Math.random().toString(),
//                 L11InstrumentAliasName: item.L11InstrumentAliasName || item.L11InstrumentName || "",
//                 L13ScheduleID: item.L13ScheduleID?.trim() || "",
//                 L06ClientName: item.L06ClientName || "",
//                 L09FTPAliasName: item.L09FTPAliasName || "",
//                 L13LiveArchive: item.L13LiveArchive || false,
//                 L13TaskName: item.L13TaskName || "",
//                 L13SourcePath: item.L13SourcePath || "",
//                 L52TaskCompleted: item.L52TaskCompleted || "",
//                 EmpowerStatus: item.EmpowerStatus || "",
//                 L13UNCStatus: item.L13UNCStatus || false,
//                 TaskStatus: item.TaskStatus || "Deactivated",
//                 ClientStatus: item.ClientStatus || "Active",
//                 InstrumentStatus: item.InstrumentStatus || "Active",
//                 StartDate: item.StartDate || "",
//                 UTCStartDate: item.UTCStartDate || "",
//                 EndDate: item.EndDate,
//                 UTCEndDate: item.UTCEndDate,
//                 TriggerTime: item.TriggerTime || "",
//                 UTCTriggerTime: item.UTCTriggerTime || "",
//                 ScheduleMode: item.ScheduleMode,
//                 NextScheduleDate: item.NextScheduleDate,
//                 UTCNextScheduleDate: item.UTCNextScheduleDate,
//                 LastScheduleDateTime: item.LastScheduleDateTime || "",
//                 UTCLastScheduleDateTime: item.UTCLastScheduleDateTime,
//                 CreatedBy: item.CreatedBy || "",
//                 CreatedDate: item.CreatedDate || "",
//                 UTCCreatedDate: item.UTCCreatedDate || "",
//                 ModifiedBy: item.ModifiedBy,
//                 ModifiedDate: item.ModifiedDate,
//                 UTCModifiedDate: item.UTCModifiedDate,
//                 // Additional fields from API
//                 L52TaskID: item.L52TaskID || "",
//                 L13TaskID: item.L13ScheduleID?.trim() || "",
//                 L11InstrumentName: item.L11InstrumentName || "",
//                 L13InstrumentMappingID: item.L13InstrumentMappingID || ""
//             }));

//             setSchedulerData(transformedData);

//             // If we have a highlight schedule ID, select it
//             if (highlightScheduleId && shouldScrollToSchedule) {
//                 const scheduleToSelect = transformedData.find(item => 
//                     item.L13ScheduleID === highlightScheduleId
//                 );

//                 if (scheduleToSelect) {
//                     setSelectedScheduler(scheduleToSelect);
//                     setSelectedRowId(scheduleToSelect.id);
//                 }
//                 setShouldScrollToSchedule(false);
//             }

//             // Auto-select first row if none selected
//             if (transformedData.length > 0 && !selectedRowId) {
//                 setSelectedScheduler(transformedData[0]);
//                 setSelectedRowId(transformedData[0].id);
//             }
//         } else {
//             setSchedulerData([]);
//         }
//     } catch (error) {
//         console.error('Failed to fetch deactivated scheduler data:', error);
//         showInfoDialog(t('scheduler.failedToLoadData'), "error");
//         setSchedulerData([]);
//     } finally {
//         if (showLoader) {
//             setLoading(false);
//         }
//     }
// }, [makeApiCall, prepareRequestBody, highlightScheduleId, shouldScrollToSchedule, t, showInfoDialog]); 

//     // Show custom confirmation dialog
//     const showConfirmation = useCallback((title, message, onConfirm, actionType) => {
//         setConfirmDialogData({
//             title,
//             message,
//             onConfirm,
//             actionType
//         });
//         setShowConfirmDialog(true);
//     }, []);

//     // Handle activate action
//     const handleActivateConfirm = useCallback(async () => {
//         if (!selectedScheduler) return;

//         try {
//             // First check for manual tasks
//             const checkRequestData = prepareRequestBody({
//                 sTaskID: selectedScheduler.L13ScheduleID,
//                 sTaskStatus: selectedScheduler.TaskStatus,
//                 sPathTaskID: selectedScheduler.L52TaskID,
//                 sInstrumentMappingID: selectedScheduler.L13InstrumentMappingID || ""
//             });

//             const checkResponse = await makeApiCall(
//                 endpoints.checkManualTask,
//                 checkRequestData,
//                 "CheckManualTask"
//             );

//             if (checkResponse && checkResponse.nTaskCount !== undefined) {
//                 const alertText = checkResponse.nTaskCount === 1 
//                     ? t('scheduler.confirmActivate')
//                     : t('scheduler.confirmActivateWithManual');

//                 // Store the selected scheduler data for the audit trail
//                 const activateData = {
//                     sInstrumentName: selectedScheduler.L11InstrumentName,
//                     sTaskID: selectedScheduler.L13ScheduleID,
//                     sTaskStatus: selectedScheduler.TaskStatus,
//                     sEmpowerStatus: selectedScheduler.EmpowerStatus,
//                     sTaskName: selectedScheduler.L13TaskName,
//                     sSourcePath: selectedScheduler.L13SourcePath,
//                     sPathTaskID: selectedScheduler.L52TaskID
//                 };

//                 // Show custom confirmation dialog
//                 showConfirmation(
//                     t('scheduler.confirmation'),
//                     alertText,
//                     () => {
//                         // Check if audit trail is required and show the popup
//                         setAuditTrailData(prev => ({
//                             ...prev,
//                             username: getActiveUserDetails().sUsername || "Administrator"
//                         }));

//                         // Show the audit trail popup
//                         setActivePopup("Activate Task");

//                         // Store the data for later use
//                         sessionStorage.setItem('pendingActivateData', JSON.stringify(activateData));
//                     },
//                     "activate"
//                 );
//             }
//         } catch (error) {
//             console.error('Activate check failed:', error);
//             showInfoDialog(t('scheduler.activateFailed'), "error");
//         }
//     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, getActiveUserDetails, showConfirmation, showInfoDialog]);

//     // Handle retire action
//     const handleRetireConfirm = useCallback(async () => {
//         if (!selectedScheduler) return;

//         try {
//             // First check for manual tasks (if needed)
//             const checkRequestData = prepareRequestBody({
//                 sTaskID: selectedScheduler.L13ScheduleID,
//                 sTaskStatus: selectedScheduler.TaskStatus,
//                 sPathTaskID: selectedScheduler.L52TaskID
//             });

//             const checkResponse = await makeApiCall(
//                 endpoints.checkManualTask,
//                 checkRequestData,
//                 "CheckManualTask"
//             );

//             if (checkResponse && checkResponse.nTaskCount !== undefined) {
//                 const alertText = checkResponse.nTaskCount === 1 
//                     ? t('scheduler.confirmRetire')
//                     : t('scheduler.confirmRetireWithManual');

//                 // Store the selected scheduler data for the audit trail
//                 const retireData = {
//                     sClientName: selectedScheduler.L06ClientName,
//                     sTaskID: selectedScheduler.L13ScheduleID,
//                     sTaskStatus: selectedScheduler.TaskStatus,
//                     sEmpowerStatus: selectedScheduler.EmpowerStatus,
//                     sTaskName: selectedScheduler.L13TaskName,
//                     sSourcePath: selectedScheduler.L13SourcePath,
//                     sPathTaskID: selectedScheduler.L52TaskID
//                 };

//                 // Show custom confirmation dialog
//                 showConfirmation(
//                     t('scheduler.confirmation'),
//                     alertText,
//                     () => {
//                         // Check if audit trail is required
//                         setAuditTrailData(prev => ({
//                             ...prev,
//                             username: getActiveUserDetails().sUsername || "Administrator"
//                         }));

//                         // Show the audit trail popup
//                         setActivePopup("Retire Task");

//                         // Store the data for later use
//                         sessionStorage.setItem('pendingRetireData', JSON.stringify(retireData));
//                     },
//                     "retire"
//                 );
//             }
//         } catch (error) {
//             console.error('Retire check failed:', error);
//             showInfoDialog(t('scheduler.retireFailed'), "error");
//         }
//     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, getActiveUserDetails, showConfirmation, showInfoDialog]);

//     // Add a function to handle the actual activate/retire after audit trail
//     const handleAuditSubmit = useCallback(async () => {
//         if (!auditTrailData.password || !auditTrailData.reason || !auditTrailData.comments) {
//             showInfoDialog(t('scheduler.fillAllAuditFields'), "warning");
//             return;
//         }

//         try {
//             let endpoint, requestData, pendingDataKey;

//             if (activePopup === "Activate Task") {
//                 endpoint = endpoints.deactiveSchedulerActivate;
//                 pendingDataKey = 'pendingActivateData';
//             } else {
//                 endpoint = endpoints.deactiveSchedulerRetire;
//                 pendingDataKey = 'pendingRetireData';
//             }

//             // Get the stored data
//             const storedData = sessionStorage.getItem(pendingDataKey);
//             if (!storedData) {
//                 showInfoDialog(t('scheduler.noPendingAction'), "error");
//                 setActivePopup(null);
//                 return;
//             }

//             const actionData = JSON.parse(storedData);

//             // Prepare the full request with audit trail
//             const fullRequestData = prepareRequestBody({
//                 ...actionData,
//                 AuditTrailValues: {
//                     sUsername: auditTrailData.username,
//                     sPassword: auditTrailData.password,
//                     sReason: auditTrailData.reason,
//                     sComments: auditTrailData.comments
//                 }
//             });

//             const response = await makeApiCall(
//                 endpoint,
//                 fullRequestData,
//                 activePopup === "Activate Task" ? "ActivateSchedule" : "RetireSchedule"
//             );

//             // Check if audit trail login failed
//             if (response && response.AuditTrailLogin === false) {
//                 showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
//                 return;
//             }

//             if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
//                 showInfoDialog(
//                     activePopup === "Activate Task" 
//                         ? t('scheduler.taskActivatedSuccess') 
//                         : t('scheduler.taskRetiredSuccess'), 
//                     "success"
//                 );

//                 // Refresh the data
//                 await fetchDeactivatedSchedulerData(true);

//                 // Clear stored data
//                 sessionStorage.removeItem(pendingDataKey);
//                 setActivePopup(null);
//                 setAuditTrailData({
//                     username: getActiveUserDetails().sUsername || "Administrator",
//                     password: "",
//                     reason: "",
//                     comments: ""
//                 });
//             } else {
//                 showInfoDialog(
//                     response?.Message || response?.returnMsg || t('scheduler.actionFailed'),
//                     "error"
//                 );
//             }

//         } catch (error) {
//             console.error('Audit submit failed:', error);
//             showInfoDialog(t('scheduler.actionFailed'), "error");
//         }
//     }, [activePopup, auditTrailData, makeApiCall, prepareRequestBody, t, fetchDeactivatedSchedulerData, getActiveUserDetails, showInfoDialog]);

//     // Update the activate and retire click handlers
//     const handleActivateClick = useCallback(() => {
//         if (!selectedScheduler) {
//             showInfoDialog(t('scheduler.selectRecord'), "warning");
//             return;
//         }
//         // Show confirmation first, then audit trail if confirmed
//         handleActivateConfirm();
//     }, [selectedScheduler, showInfoDialog, t, handleActivateConfirm]);

//     const handleRetireClick = useCallback(() => {
//         if (!selectedScheduler) {
//             showInfoDialog(t('scheduler.selectRecord'), "warning");
//             return;
//         }
//         // Show confirmation first, then audit trail if confirmed
//         handleRetireConfirm();
//     }, [selectedScheduler, showInfoDialog, t, handleRetireConfirm]);

//     // Handle confirm dialog actions
//     const handleConfirmDialogClose = useCallback(() => {
//         setShowConfirmDialog(false);
//         setConfirmDialogData({
//             title: "",
//             message: "",
//             onConfirm: null,
//             actionType: ""
//         });
//     }, []);

//     const handleConfirmDialogConfirm = useCallback(() => {
//         if (confirmDialogData.onConfirm) {
//             confirmDialogData.onConfirm();
//         }
//         handleConfirmDialogClose();
//     }, [confirmDialogData, handleConfirmDialogClose]);

//     // Build export request
//     const buildExportRequest = useCallback(() => {
//         const allRows = schedulerData.map(item => ({
//             ...item,
//             L13LiveArchive: item.L13LiveArchive ? "✓" : ""
//         }));

//         const headerDetails = [
//             t('label.taskId'),
//             t('scheduler.clientName'),
//             t('scheduler.storageName'),
//             t('scheduler.liveArchive'),
//             t('label.taskName'),
//             t('label.instrument'),
//             t('scheduler.sourcePath'),
//             t('scheduler.firstCycleStatus'),
//             t('scheduler.empowerStatus'),
//             t('scheduler.uncStatus'),
//             t('scheduler.taskStatus'),
//             t('scheduler.startDate'),
//             t('scheduler.endDate'),
//             t('scheduler.triggerTime'),
//             t('scheduler.scheduleMode'),
//             t('scheduler.nextScheduleDateTime'),
//             t('scheduler.lastScheduleDateTime'),
//             t('label.createdBy'),
//             t('label.createdOn'),
//             t('label.modifiedBy'),
//             t('label.modifiedOn')
//         ];

//         const allowKeys = [
//             "L13ScheduleID",
//             "L06ClientName",
//             "L09FTPAliasName",
//             "L13LiveArchive",
//             "L13TaskName",
//             "L11InstrumentAliasName",
//             "L13SourcePath",
//             "L52TaskCompleted",
//             "EmpowerStatus",
//             "L13UNCStatus",
//             "TaskStatus",
//             "StartDate",
//             "EndDate",
//             "TriggerTime",
//             "ScheduleMode",
//             "NextScheduleDate",
//             "LastScheduleDateTime",
//             "CreatedBy",
//             "CreatedDate",
//             "ModifiedBy",
//             "ModifiedDate"
//         ];

//         return {
//             sFileName: "DeactiveScheduler",
//             AllRows: allRows,
//             HeaderDetails: headerDetails,
//             AllowKeys: allowKeys,
//             sBrowserURL: window.location.origin,
//             ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
//             ApplicationCode: "SDMS"
//         };
//     }, [schedulerData, t, prepareRequestBody]);

//     // Handle export - using the common export service
//     const handleExportClick = useCallback(() => {
//         if (schedulerData.length === 0) {
//             showInfoDialog(t('scheduler.noRecordsToExport'), "warning");
//             return;
//         }

//         handleExportCommon({
//             rows: schedulerData,
//             buildRequest: buildExportRequest,
//             postData,
//             setLoading,
//             setLoadingText: (text) => {/* You might want to add loadingText state */},
//             setErrorDialog: ({ open, message, type }) => {
//                 showInfoDialog(message, type);
//             },
//             t
//         });
//     }, [schedulerData, buildExportRequest, postData, showInfoDialog, t]);

//     // Handle print
//     const handlePrintClick = useCallback(() => {
//         if (!schedulerData || schedulerData.length === 0) {
//             showInfoDialog(t('scheduler.selectRecord'), "information");
//             return;
//         }

//         setDoPrint(true);
//     }, [schedulerData, showInfoDialog, t]);

//     // Build print request
//     const buildPrintRequest = useCallback(() => ({
//         sModuleName: "Deactivated Scheduler",
//         ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
//         ApplicationCode: "SDMS",
//     }), [prepareRequestBody]);

//     // MODIFY THIS useEffect TO HANDLE BOTH PROP AND CONTEXT:
//     useEffect(() => {
//         console.log('=== DeactivatedTask useEffect triggered ===');
//         console.log('Navigation data from props:', navigationData);
//         console.log('Context submission data:', getSubmissionData());

//         let scheduleId = null;
//         let scheduleData = null;

//         // Priority 1: Check props passed from parent (tab system)
//         if (navigationData && navigationData.scheduleId) {
//             console.log('=== Received navigation data via props ===');
//             console.log('Schedule ID:', navigationData.scheduleId);
//             scheduleId = navigationData.scheduleId;
//             scheduleData = navigationData;
//         }
//         // Priority 2: Check context (legacy navigation)
//         else {
//             const submissionData = getSubmissionData();
//             console.log('Submission data from context:', submissionData);

//             if (submissionData && submissionData.targetTab === 'Deactivated Task') {
//                 console.log('=== Navigating from context to DeactivatedTask ===');
//                 console.log('Schedule ID:', submissionData.data?.scheduleId);
//                 scheduleId = submissionData.data?.scheduleId;
//                 scheduleData = submissionData.data;
//                 clearNavigation();
//             }
//         }

//         if (scheduleId) {
//             setHighlightScheduleId(scheduleId);
//             setShouldScrollToSchedule(true);
//         }

//         // Fetch data (calls both endpoints)
//         fetchDeactivatedSchedulerData(true);
//     }, [navigationData, getSubmissionData, clearNavigation, fetchDeactivatedSchedulerData]);

//     // MODIFY THIS useEffect TO HANDLE HIGHLIGHTING:
//     useEffect(() => {
//         if (shouldScrollToSchedule && highlightScheduleId && schedulerData.length > 0) {
//             // Find the row with the schedule ID
//             const scheduleRow = schedulerData.find(item =>
//                 item.L13ScheduleID === highlightScheduleId
//             );

//             if (scheduleRow) {
//                 // Select and highlight the row
//                 setSelectedScheduler(scheduleRow);
//                 setSelectedRowId(scheduleRow.id);

//                 // Show success message
//                 showInfoDialog(`Schedule ${highlightScheduleId} deactivated successfully!`, "success");

//                 console.log('Auto-selected schedule:', highlightScheduleId);
//             }

//             setShouldScrollToSchedule(false);
//         }
//     }, [schedulerData, highlightScheduleId, shouldScrollToSchedule, showInfoDialog]);

//     // Replace the current handleRowSelect function with this:
// const handleRowSelect = useCallback((row) => {
//     setSelectedScheduler(row);
//     setSelectedRowId(row.id);
// }, []);

//     // MODIFIED handleViewClick 
//     const handleViewClick = useCallback(() => {
//         if (!selectedScheduler) {
//             showInfoDialog(t('scheduler.selectRecordToView'), "warning");
//             return;
//         }
//         // In tab system, you might want to switch to edit tab or show modal
//         showInfoDialog(`Viewing schedule ${selectedScheduler.L13ScheduleID}`, "information");
//     }, [selectedScheduler, showInfoDialog, t]);

//     const handlePopupClose = useCallback(() => {
//         setActivePopup(null);
//         setAuditTrailData({
//             username: "Administrator",
//             password: "",
//             reason: "",
//             comments: ""
//         });
//     }, []);

//     const columns = useMemo(() => [
//         {
//             key: 'L11InstrumentAliasName',
//             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('label.instrument')}</span>,
//             width: 150,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.L11InstrumentAliasName}
//                 </div>
//             )
//         },
//         {
//             key: 'L13ScheduleID',
//             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('label.taskId')}</span>,
//             width: 100,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.L13ScheduleID}
//                 </div>
//             )
//         },
//         {
//             key: 'L06ClientName',
//             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('scheduler.clientName')}</span>,
//             width: 130,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.L06ClientName}
//                 </div>
//             )
//         },
//         {
//             key: 'L09FTPAliasName',
//             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('scheduler.storageName')}</span>,
//             width: 140,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.L09FTPAliasName}
//                 </div>
//             )
//         },
//         {
//             key: 'L13LiveArchive',
//             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('scheduler.liveArchive')}</span>,
//             width: 140,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div 
//                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer text-center ${isSelected ? 'font-bold' : ''}`}
//                     onClick={() => handleRowSelect(row)}
//                 >
//                     {row.L13LiveArchive ? "✓" : ""}
//                 </div>
//             )
//         }
//     ], [t, handleRowSelect]);

//     const renderSchedulerDetail = useCallback((scheduler) => (
//         <div className="flex flex-col gap-3.5 font-roboto text-[12px] font-semibold">
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('label.taskName')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.L13TaskName}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.sourcepath')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.L13SourcePath}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.firstCycleStatus')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.L52TaskCompleted}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.empowerStatus')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.EmpowerStatus}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.uncStatus')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.L13UNCStatus ? t('button.yes') : t('button.no')}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.taskStatus')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.TaskStatus}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.clientstatus')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.ClientStatus}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.instrumentstatus')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.InstrumentStatus}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.startDate')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.StartDate}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.endDate')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.EndDate || t('scheduler.notSet')}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.triggerTime')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.TriggerTime}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.scheduleMode')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.ScheduleMode || t('scheduler.notSet')}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.nextScheduleDateTime')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.NextScheduleDate || t('scheduler.notSet')}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('scheduler.lastScheduleDateTime')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.LastScheduleDateTime || t('scheduler.notSet')}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('label.createdBy')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.CreatedBy}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('label.createdOn')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.CreatedDate}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('label.modifiedBy')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.ModifiedBy || t('scheduler.notSet')}
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <div className="w-2/5 font-bold text-gray-600">
//                     {t('label.modifiedOn')}
//                 </div>
//                 <div className="w-3/5 text-gray-800">
//                     {scheduler.ModifiedDate || t('scheduler.notSet')}
//                 </div>
//             </div>
//         </div>
//     ), [t]);



//     const ActionButton = ({ iconClass, label, disabled, onClick, variant = "default" }) => (
//         <button
//             onClick={onClick}
//             disabled={disabled}
//             className={`
//                 flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none 
//                 transition-all duration-200 whitespace-nowrap hover:scale-[0.98] hover:opacity-90
//                 ${disabled 
//                     ? variant === 'primary'
//                     ? 'bg-[#f0f2f5] text-white cursor-not-allowed'
//                     : 'bg-[#f0f2f5] text-[#2883fe] cursor-not-allowed'
//                     : variant === 'primary'
//                         ? 'bg-[#f0f2f5] text-white hover:bg-blue-700'
//                         : variant === 'danger'
//                             ? 'bg-red-500 text-white hover:bg-red-600'
//                             : 'bg-[#f0f2f5] text-[#2883fe] hover:bg-gray-100'
//                 }
//             `}
//         >
//             {iconClass && <i className={iconClass}></i>}
//             <span>{label}</span>
//         </button>
//     );

//     return (
//         <div className="flex flex-col font-roboto bg-white w-full h-[80vh] overflow-hidden relative">
//            <FullPageLoader 
//     loading={loading} 
//     text={loadingText || t('common.loading')} 
// />

//             {infoDialog.open && (
//                 <Errordialog
//                     message={infoDialog.scheduler}
//                     type={infoDialog.type}
//                     onClose={closeInfoDialog}
//                 />
//             )}

//             {/* Confirmation Dialog */}
//             {showConfirmDialog && (
//                 <Errordialog
//                     message={confirmDialogData.message}
//                     type="confirmation"
//                     onClose={handleConfirmDialogClose}
//                     onConfirm={handleConfirmDialogConfirm}
//                     okText={t('button.yes')}
//                     cancelText={t('button.no')}
//                 />
//             )}

//             {/* Top Action Buttons - EXACT eJQuery Icons */}
//             <div className="flex justify-end pr-5 gap-2 pt-3">
//                 <ActionButton
//                     iconClass="fa fa-eye"
//                     label={t('button.view')}
//                     onClick={handleViewClick}
//                     disabled={!selectedScheduler}
//                 />
//                 <ActionButton
//                     iconClass="fa fa-check"
//                     label={t('button.activate')}
//                     onClick={handleActivateClick}
//                     disabled={!selectedScheduler}
//                 />
//                 <ActionButton
//                     iconClass="fa fa-ban"
//                     label={t('button.retire')}
//                     onClick={handleRetireClick}
//                     disabled={!selectedScheduler}
//                 />
//                 <ActionButton
//                     iconClass="glyphicon glyphicon-export"
//                     label={t('button.export')}
//                     onClick={handleExportClick}
//                     disabled={schedulerData.length === 0}
//                 />
//                 <ActionButton
//                     iconClass="glyphicon glyphicon-print"
//                     label={t('button.print')}
//                     onClick={handlePrintClick}
//                     disabled={schedulerData.length === 0}
//                 />
//             </div>

//             {/* Main Grid - Same as Activated Task */}
//             <div className="flex-1 overflow-auto min-h-0 w-full p-1">
//     <GridLayout
//         columns={columns}
//         height="100%"
//         detailPanelWidth="46%"
//         data={schedulerData}
//         getRowId={(row) => row.id}
//         renderDetailPanel={renderSchedulerDetail}
//         onRowClick={handleRowSelect}
//         rowClassName={(row) =>
//             row.id === selectedRowId
//                 ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
//                 : ""
//         }
//     />
// </div>

//             {/* Print Table */}
//             {doPrint && (
//                 <PrintTable
//                     data={schedulerData}
//                     columns={[
//                         { key: 'L13ScheduleID', label: t('label.taskId') },
//                         { key: 'L06ClientName', label: t('scheduler.clientName') },
//                         { key: 'L09FTPAliasName', label: t('scheduler.storageName') },
//                         { key: 'L13LiveArchive', label: t('scheduler.liveArchive') },
//                         { key: 'L13TaskName', label: t('label.taskName') },
//                         { key: 'L11InstrumentAliasName', label: t('label.instrument') },
//                         { key: 'L13SourcePath', label: t('scheduler.sourcepath') },
//                         { key: 'L52TaskCompleted', label: t('scheduler.firstCycleStatus') },
//                         { key: 'EmpowerStatus', label: t('scheduler.empowerStatus') },
//                         { key: 'L13UNCStatus', label: t('scheduler.uncStatus') },
//                         { key: 'TaskStatus', label: t('scheduler.taskStatus') },
//                         { key: 'StartDate', label: t('scheduler.startDate') },
//                         { key: 'EndDate', label: t('scheduler.endDate') },
//                         { key: 'TriggerTime', label: t('scheduler.triggerTime') },
//                         { key: 'ScheduleMode', label: t('scheduler.scheduleMode') },
//                         { key: 'NextScheduleDate', label: t('scheduler.nextScheduleDateTime') },
//                         { key: 'LastScheduleDateTime', label: t('scheduler.lastScheduleDateTime') },
//                         { key: 'CreatedBy', label: t('label.createdBy') },
//                         { key: 'CreatedDate', label: t('label.createdOn') },
//                         { key: 'ModifiedBy', label: t('label.modifiedBy') },
//                         { key: 'ModifiedDate', label: t('label.modifiedOn') }
//                     ]}
//                     rows={schedulerData} // ADD THIS
//                     title={t('scheduler.deactivatedScheduler')}
//                     onClose={() => setDoPrint(false)}
//                     printRequest={buildPrintRequest()}
//                 />
//             )}

//             {/* Activate/Retire Popup */}
//             {activePopup && (
//                 <CustomPopup
//                     isOpen={!!activePopup}
//                     onClose={handlePopupClose}
//                     title={activePopup === "Activate Task" ? t('scheduler.activateTask') : t('scheduler.retireTask')}
//                     content={
//                         <div className="flex flex-col gap-1 p-1">
//                             {/* Audit trail form */}
//                             <div className="flex flex-col">
//                                 <label className="text-[12px] font-roboto font-semibold text-gray-700">
//                                     {t('scheduler.username')} <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={auditTrailData.username}
//                                     disabled
//                                     className="w-full text-[12px] outline-none border-gray-300 bg-gray-50 p-2 rounded"
//                                 />
//                             </div>

//                             <div className="flex flex-col">
//                                 <label className="text-[12px] font-roboto font-semibold text-gray-700">
//                                     {t('scheduler.password')} <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="password"
//                                     value={auditTrailData.password}
//                                     onChange={(e) => setAuditTrailData(prev => ({ ...prev, password: e.target.value }))}
//                                     className="w-full text-[12px] outline-none border-gray-300 p-2 rounded"
//                                     placeholder={t('scheduler.enterPassword')}
//                                 />
//                             </div>

//                             <div className="flex flex-col">
//                                 <label className="text-[12px] font-roboto font-semibold text-gray-700">
//                                     {t('scheduler.reason')} <span className="text-red-500">*</span>
//                                 </label>
//                                 <select
//                                     value={auditTrailData.reason}
//                                     onChange={(e) => setAuditTrailData(prev => ({ ...prev, reason: e.target.value }))}
//                                     className="w-full text-[12px] outline-none border-gray-300 p-2 rounded"
//                                 >
//                                     <option value="">{t('scheduler.selectReason')}</option>
//                                     {activePopup === "Activate Task" ? (
//                                         <>
//                                             <option value="Activated">{t('scheduler.activated')}</option>
//                                             <option value="Reactivated">{t('scheduler.reactivated')}</option>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <option value="Retired">{t('scheduler.retired')}</option>
//                                             <option value="Decommissioned">{t('scheduler.decommissioned')}</option>
//                                             <option value="Replaced">{t('scheduler.replaced')}</option>
//                                         </>
//                                     )}
//                                 </select>
//                             </div>

//                             <div className="flex flex-col">
//                                 <label className="text-[12px] font-roboto font-semibold text-gray-700">
//                                     {t('scheduler.comments')} <span className="text-red-500">*</span>
//                                 </label>
//                                 <textarea
//                                     rows={3}
//                                     value={auditTrailData.comments}
//                                     onChange={(e) => setAuditTrailData(prev => ({ ...prev, comments: e.target.value }))}
//                                     className="w-full text-[12px] outline-none border-gray-300 p-2 rounded resize-none"
//                                     placeholder={t('scheduler.enterComments')}
//                                 />
//                             </div>

//                             <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
//                                 <button
//                                     onClick={handleAuditSubmit}
//                                     className="flex items-center gap-1 px-2 py-1 text-[12px] font-roboto font-semibold text-white border-none rounded cursor-pointer"
//                                     style={{ 
//                                         backgroundColor: activePopup === "Activate Task" ? '#3b82f6' : '#ef4444' 
//                                     }}
//                                 >
//                                     {activePopup === "Activate Task" ? (
//                                         <>
//                                             <i className="fa fa-check"></i> {t('scheduler.submit')}
//                                         </>
//                                     ) : (
//                                         <>
//                                             <i className="fa fa-ban"></i> {t('scheduler.retire')}
//                                         </>
//                                     )}
//                                 </button>
//                                 <button
//                                     onClick={handlePopupClose}
//                                     className="px-2.5 py-2 text-[12px] font-roboto font-semibold text-gray-600 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
//                                 >
//                                     {t('button.close')}
//                                 </button>
//                             </div>
//                         </div>
//                     }
//                     size="md"
//                 />
//             )}
//         </div>
//     );
// };

// export default DeactivedTask;



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

const DeactivedTask = ({ navigationData, onClearNavigation, onNavigateAway }) => {
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

    // Get navigation functions from context
    const {
        navigateToTab,
        navigateFromDeactivatedToInstrumentLock,
        navigateToDataScheduler,
        navigateFromDeactivatedToActivatedTask,
        navigateWithinDeactivatedTask,
        clearNavigation
    } = useSchedulerNavigation();

    const showInfoDialog = useCallback((message, type = "information") => {
        setInfoDialog({
            open: true,
            message,
            type
        });
    }, []);

    const getActiveUserDetails = useCallback(() => {
        const userDetails = CF_activeUserdetails();
        return userDetails.ActiveUserDetails || {};
    }, []);

    const { postData } = servicecall();
    const { t } = useTranslation('scheduler');

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

    const prepareRequestBody = useCallback((additionalData = {}) => {
        const baseData = {
            ApplicationCode: "SDMS",
            ActiveUserDetails: getActiveUserDetails(),
            ...additionalData
        };
        return baseData;
    }, [getActiveUserDetails]);

    const [confirmDialogData, setConfirmDialogData] = useState({
        title: "",
        message: "",
        onConfirm: null,
        actionType: ""
    });

    // Audit trail state
    const [showAudit, setShowAudit] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [pendingActionData, setPendingActionData] = useState(null);
    const [auditTrailRights, setAuditTrailRights] = useState({
        activate: 0,
        retire: 0
    });

    const { getSubmissionData } = useSchedulerNavigation();
    const [highlightScheduleId, setHighlightScheduleId] = useState(null);
    const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);

    const endpoints = {
        deactiveSchedulerView: "Scheduler/DeactiveSchedulerView",
        deactiveSchedulerViewGrid: "Scheduler/DeactiveSchedulerViewgrid",
        deactiveSchedulerActivate: "Scheduler/DeactiveSchedulerActiveBtnClick",
        deactiveSchedulerRetire: "Scheduler/DeactiveSchedulerRetireBtnClick",
        exportData: "basemaster/exportDataFile",
        importScheduler: "Scheduler/importSchedulerDataFile",
        importTemplate: "Scheduler/ImportTemplateFileData",
        checkManualTask: "Scheduler/CheckManualTaskForScheduler",
        viewSchedule: "Scheduler/DataSchedulerSave"
    };

    const fetchDeactivatedSchedulerData = useCallback(async () => {
        setLoading(true);
        setLoadingText(t('common.loading'));
        try {
            const initialRequestData = prepareRequestBody();
            const initialResponse = await makeApiCall(
                endpoints.deactiveSchedulerView,
                initialRequestData,
                "DeactiveSchedulerInitialView"
            );

            const gridRequestData = prepareRequestBody();
            const gridResponse = await makeApiCall(
                endpoints.deactiveSchedulerViewGrid,
                gridRequestData,
                "FetchDeactivatedSchedulerGrid"
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
                    TaskStatus: item.TaskStatus || "Deactivated",
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
                    L13TaskID: item.L13ScheduleID?.trim() || '',
                    L12InstrumentMappingID: item.L12InstrumentMappingID || item.L13InstrumentMappingID || '',
                    L11InstrumentID: item.L11InstrumentID || '',
                    L13InstrumentMappingID: item.L13InstrumentMappingID || item.L12InstrumentMappingID || ''
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
                setSelectedScheduler(null);
                setSelectedRowId(0);
            }
        } catch (error) {
            console.error('Failed to fetch deactivated scheduler data:', error);
            setSchedulerData([]);
            setSelectedScheduler(null);
            setSelectedRowId(0);
        } finally {
            setLoading(false);
            setLoadingText("");
        }
    }, [makeApiCall, prepareRequestBody, highlightScheduleId, shouldScrollToSchedule, t]);

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
                console.log('✅ View data received, navigating to Data Scheduler...');

                const navigationPayload = {
                    viewMode: true,
                    isEdit: true,
                    scheduleId: selectedScheduler.L13ScheduleID,
                    viewData: response,
                    timestamp: Date.now(),
                    fromDeactivatedTask: true,
                    sourceComponent: 'DeactivatedTask',
                    sourceTab: 'Deactivated Task'
                };

                // Use the new navigation function
                if (navigateToDataScheduler) {
                    navigateToDataScheduler(navigationPayload);
                } else if (navigateToTab) {
                    navigateToTab('Scheduler', 'Data Scheduler', navigationPayload);
                }

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
    }, [selectedScheduler, makeApiCall, prepareRequestBody, t,
        navigateToDataScheduler, navigateToTab, showInfoDialog]);

    const executeActivate = useCallback(async (actionData, auditTrailValues = null) => {
        try {
            const fullRequestData = prepareRequestBody({
                ...actionData,
                ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
            });

            console.log("Executing activate with data:", fullRequestData);

            const response = await makeApiCall(
                endpoints.deactiveSchedulerActivate,
                fullRequestData,
                "ActivateSchedule"
            );

            if (response && response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
                return;
            }

            if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
                showInfoDialog(t('scheduler.taskActivatedSuccess'), "success");

                // Navigate to Activated Task after successful activation
                const scheduleId = actionData.sTaskID;
                if (navigateFromDeactivatedToActivatedTask) {
                    navigateFromDeactivatedToActivatedTask({
                        scheduleId: scheduleId,
                        message: 'Schedule activated successfully',
                        highlightScheduleId: scheduleId,
                        shouldScrollToSchedule: true
                    });
                } else {
                    // Fallback: refresh current view
                    await fetchDeactivatedSchedulerData();
                }
            } else {
                showInfoDialog(
                    response?.Message || response?.returnMsg || t('scheduler.actionFailed'),
                    "error"
                );
            }
        } catch (error) {
            console.error('Activate failed:', error);
            showInfoDialog(t('scheduler.activateFailed'), "error");
        }
    }, [makeApiCall, prepareRequestBody, t, showInfoDialog,
        navigateFromDeactivatedToActivatedTask, fetchDeactivatedSchedulerData]);

    const executeRetire = useCallback(async (actionData, auditTrailValues = null) => {
        try {
            const fullRequestData = prepareRequestBody({
                ...actionData,
                ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
            });

            const response = await makeApiCall(
                endpoints.deactiveSchedulerRetire,
                fullRequestData,
                "RetireSchedule"
            );

            if (response && response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
                return;
            }

            if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
                showInfoDialog(t('scheduler.taskRetiredSuccess'), "success");

                // Refresh the Deactivated Task view after retire
                if (navigateWithinDeactivatedTask) {
                    navigateWithinDeactivatedTask({
                        scheduleId: actionData.sTaskID
                    });
                } else {
                    await fetchDeactivatedSchedulerData();
                }
            } else if (response && response.returnMsg) {
                showInfoDialog(response.returnMsg, "error");
            } else {
                showInfoDialog(t('scheduler.actionFailed'), "error");
            }
        } catch (error) {
            console.error('Retire failed:', error);
            showInfoDialog(t('scheduler.retireFailed'), "error");
        }
    }, [makeApiCall, prepareRequestBody, t, fetchDeactivatedSchedulerData,
        showInfoDialog, navigateWithinDeactivatedTask]);

    const closeInfoDialog = useCallback(() => {
        setInfoDialog(prev => ({
            ...prev,
            open: false
        }));
    }, []);

    const showConfirmation = useCallback((title, message, onConfirm, actionType, buttonType = "yesno") => {
        setConfirmDialogData({
            title,
            message,
            onConfirm,
            actionType,
            buttonType
        });
        setShowConfirmDialog(true);
    }, []);

    // NAVIGATE TO INSTRUMENT LOCK - BYPASS RIGHTS CHECK VERSION
    const navigateToInstrumentLock = useCallback((data) => {
        console.log("🔄 NAVIGATE TO INSTRUMENT LOCK FROM DEACTIVATED TASK");
        console.log("Data being passed:", data);

        // Store the activation data globally (mimics jQuery's GActSchedulerData)
        if (data.forActivation && data.activateData) {
            window.GActSchedulerData = {
                scheduleData: data.scheduleData,
                checkResponse: data.checkResponse,
                activateData: data.activateData,
                shouldActivateAfterLock: true,
                fromDeactivatedTask: true,
                scheduleId: data.scheduleData?.L13ScheduleID
            };
            console.log('💾 Stored GActSchedulerData globally');
        }

        // Prepare the navigation data
        const navigationData = {
            scheduleData: data.scheduleData,
            checkResponse: data.checkResponse,
            actionType: data.actionType || 'lockActivate',
            fromDeactivatedTask: true,
            forActivation: data.forActivation || false,
            originalScheduleId: data.scheduleData?.L13ScheduleID,
            activateData: data.activateData
        };

        console.log("Navigation payload:", navigationData);

        // Use the new navigation function
        if (navigateFromDeactivatedToInstrumentLock) {
            navigateFromDeactivatedToInstrumentLock(navigationData);
        } else if (navigateToTab) {
            navigateToTab('Lock Settings', 'Instrument Lock Settings', navigationData);
        } else {
            console.error("❌ No navigation functions available!");
            showInfoDialog("Navigation function not available", "error");
        }
    }, [navigateFromDeactivatedToInstrumentLock, navigateToTab, showInfoDialog]);

    // Add event listeners for lock completion
    useEffect(() => {
        // Listen for when we need to navigate back from Instrument Lock
        const handleNavigateBackForActivation = (event) => {
            console.log('🔄 Received navigateToDeactivatedForActivation event:', event.detail);

            const { scheduleId, activateData, lockCompleted } = event.detail || {};

            if (lockCompleted && scheduleId && activateData) {
                console.log('✅ Lock completed, navigating back to DeactivatedTask to activate schedule:', scheduleId);

                // Navigate back to DeactivatedTask
                if (navigateWithinDeactivatedTask) {
                    navigateWithinDeactivatedTask({
                        scheduleId: scheduleId,
                        lockCompleted: true,
                        activateData: activateData
                    });

                    // After navigation, trigger activation
                    setTimeout(() => {
                        console.log('⚡ Triggering activation after lock...');
                        // Check audit trail rights
                        if (auditTrailRights.activate === 1) {
                            setPendingAction('activate');
                            setPendingActionData(activateData);
                            setShowAudit(true);
                        } else {
                            executeActivate(activateData);
                        }
                    }, 500);
                }
            }
        };

        // Listen for postMessage from iframe/popup
        const handlePostMessage = (event) => {
            if (event.data && event.data.type === 'LOCK_COMPLETED_ACTIVATE_NOW') {
                console.log('📬 Received postMessage for lock completion:', event.data);
                const { scheduleId, activateData } = event.data;

                if (scheduleId && activateData) {
                    // Trigger activation
                    if (auditTrailRights.activate === 1) {
                        setPendingAction('activate');
                        setPendingActionData(activateData);
                        setShowAudit(true);
                    } else {
                        executeActivate(activateData);
                    }
                }
            }
        };

        window.addEventListener('navigateToDeactivatedForActivation', handleNavigateBackForActivation);
        window.addEventListener('message', handlePostMessage);

        return () => {
            window.removeEventListener('navigateToDeactivatedForActivation', handleNavigateBackForActivation);
            window.removeEventListener('message', handlePostMessage);

            // Clean up global variable on unmount
            if (window.GActSchedulerData) {
                window.GActSchedulerData = null;
            }
            // Clean up session storage
            sessionStorage.removeItem('lockAndActivateFlow');
        };
    }, [navigateWithinDeactivatedTask, executeActivate, auditTrailRights.activate]);

    // Test navigation function for debugging
    const testNavigation = useCallback(() => {
        console.log("🧪 Testing navigation...");

        if (!selectedScheduler) {
            showInfoDialog("Please select a schedule first", "warning");
            return;
        }

        // Create test data
        const testCheckResponse = {
            nParsingCount: 1,
            nParsingInstrOrderCount: 0,
            nTaskCount: 1
        };

        navigateToInstrumentLock({
            scheduleData: selectedScheduler,
            checkResponse: testCheckResponse
        });
    }, [selectedScheduler, navigateToInstrumentLock, showInfoDialog]);

    const handleActivateConfirm = useCallback(async () => {
        if (!selectedScheduler) return;

        try {
            const checkRequestData = prepareRequestBody({
                sTaskID: selectedScheduler.L13ScheduleID,
                sTaskStatus: selectedScheduler.TaskStatus,
                sPathTaskID: selectedScheduler.L52TaskID,
                sInstrumentMappingID: selectedScheduler.L13InstrumentMappingID || selectedScheduler.L12InstrumentMappingID
            });

            console.log("📤 Sending checkManualTask API request:", checkRequestData);

            const checkResponse = await makeApiCall(
                endpoints.checkManualTask,
                checkRequestData,
                "CheckManualTask"
            );

            console.log("📥 checkManualTask API response:", checkResponse);

            if (checkResponse && checkResponse.nTaskCount !== undefined) {
                const activateData = {
                    sClientName: selectedScheduler.L06ClientName,
                    sTaskID: selectedScheduler.L13ScheduleID,
                    sTaskStatus: selectedScheduler.TaskStatus,
                    sEmpowerStatus: selectedScheduler.EmpowerStatus,
                    sTaskName: selectedScheduler.L13TaskName,
                    sSourcePath: selectedScheduler.L13SourcePath,
                    sPathTaskID: selectedScheduler.L52TaskID,
                    sInstrumentName: selectedScheduler.L11InstrumentAliasName || selectedScheduler.L11InstrumentName,
                    sInstrumentMappingID: selectedScheduler.L13InstrumentMappingID || selectedScheduler.L12InstrumentMappingID
                };

                // ========== SCENARIO HANDLING ==========

                // SCENARIO: nTaskCount === 1
                if (checkResponse.nTaskCount === 1) {
                    console.log("📊 SCENARIO: nTaskCount === 1");

                    // Sub-scenario 1: nParsingInstrOrderCount >= 1 (Instrument already locked)
                    if (checkResponse.nParsingInstrOrderCount >= 1) {
                        console.log("📊 SCENARIO 1: Instrument already locked");

                        showConfirmation(
                            t('scheduler.confirmation'),
                            t('scheduler.confirmActivateWithLockInfo'),
                            () => {
                                console.log("✅ User proceeding with activation (instrument already locked)");

                                if (auditTrailRights.activate === 1) {
                                    setPendingAction('activate');
                                    setPendingActionData(activateData);
                                    setShowAudit(true);
                                } else {
                                    executeActivate(activateData);
                                }
                            },
                            "activate"
                        );
                    }
                    // Sub-scenario 2: nParsingCount === 1 (Manual parsing instrument - needs lock)
                    else if (checkResponse.nParsingCount === 1) {
                        console.log("📊 SCENARIO 2: Manual parsing instrument - Lock & Activate option");

                        setConfirmDialogData({
                            title: t('scheduler.confirmation'),
                            message: t('scheduler.lockInstrumentAndActivate'),
                            onConfirm: (actionType) => {
                                console.log("✅ User selected action:", actionType);

                                if (actionType === 'lockActivate') {
                                    // ========== LOCK & ACTIVATE FLOW ==========
                                    console.log("🚀 Starting Lock & Activate flow");

                                    // Prepare complete data for Instrument Lock
                                    const lockSchedulerData = {
                                        // Client information
                                        clientId: selectedScheduler.L06ClientName,
                                        L06ClientID: selectedScheduler.L06ClientName,

                                        // Instrument information
                                        instrumentId: selectedScheduler.L13InstrumentMappingID || selectedScheduler.L12InstrumentMappingID,
                                        L11InstrumentID: selectedScheduler.L13InstrumentMappingID || selectedScheduler.L12InstrumentMappingID,
                                        instrumentName: selectedScheduler.L11InstrumentAliasName,
                                        dropdownInstrumentId: selectedScheduler.L13InstrumentMappingID || selectedScheduler.L12InstrumentMappingID,

                                        // Path information
                                        sourcePath: selectedScheduler.L13SourcePath,
                                        L13SourcePath: selectedScheduler.L13SourcePath,

                                        // Schedule information
                                        L13ScheduleID: selectedScheduler.L13ScheduleID,
                                        scheduleId: selectedScheduler.L13ScheduleID,
                                        sScheduleID: selectedScheduler.L13ScheduleID,

                                        // Task information
                                        L52TaskID: selectedScheduler.L52TaskID,
                                        sTaskID: selectedScheduler.L52TaskID,

                                        // Additional metadata
                                        fileName: selectedScheduler.L13TaskName,
                                        templateId: '', // Will be auto-selected in InstrumentLock
                                        fromScheduler: true,
                                        fromLockActivate: true,
                                        fromDeactivatedTask: true,
                                        TaskType: 'DeActive'
                                    };

                                    const lockActivatePayload = {
                                        scheduleData: lockSchedulerData,
                                        checkResponse: checkResponse,
                                        actionType: 'lockActivate',
                                        activateData: activateData,
                                        forActivation: true,
                                        fromDeactivatedTask: true,
                                        bypassRightsCheck: true
                                    };

                                    // Store in sessionStorage for persistence
                                    sessionStorage.setItem('lockAndActivateFlow', JSON.stringify(lockActivatePayload));
                                    sessionStorage.setItem('pendingActivationData', JSON.stringify({
                                        scheduleData: lockSchedulerData,
                                        activateData: activateData,
                                        fromLockActivate: true
                                    }));
                                    sessionStorage.setItem('originalScheduleId', selectedScheduler.L13ScheduleID);

                                    console.log('💾 Stored lock & activate data:', lockActivatePayload);

                                    // Navigate to Instrument Lock Settings
                                    navigateToInstrumentLock(lockActivatePayload);
                                }
                                else if (actionType === 'activateOnly') {
                                    // Activate without lock
                                    console.log("⚡ Activating without lock");

                                    if (auditTrailRights.activate === 1) {
                                        setPendingAction('activate');
                                        setPendingActionData(activateData);
                                        setShowAudit(true);
                                    } else {
                                        executeActivate(activateData);
                                    }
                                }
                            },
                            actionType: "threeButtons",
                            buttonType: "lockActivateCancel"
                        });
                        setShowConfirmDialog(true);
                    }
                    // Sub-scenario 3: Simple activation (no parsing, no lock)
                    else {
                        console.log("📊 SCENARIO 3: Simple activation");

                        showConfirmation(
                            t('scheduler.confirmation'),
                            t('scheduler.confirmActivate'),
                            () => {
                                console.log("✅ User proceeding with simple activation");

                                if (auditTrailRights.activate === 1) {
                                    setPendingAction('activate');
                                    setPendingActionData(activateData);
                                    setShowAudit(true);
                                } else {
                                    executeActivate(activateData);
                                }
                            },
                            "activate"
                        );
                    }
                }
                // SCENARIO: nTaskCount === 0 (pending manual upload)
                else if (checkResponse.nTaskCount === 0) {
                    console.log("📊 SCENARIO: nTaskCount === 0 (pending manual upload)");

                    showConfirmation(
                        t('scheduler.confirmation'),
                        t('scheduler.confirmActivateWithManual'),
                        () => {
                            console.log("✅ User proceeding with activation (with manual upload)");

                            if (auditTrailRights.activate === 1) {
                                setPendingAction('activate');
                                setPendingActionData(activateData);
                                setShowAudit(true);
                            } else {
                                executeActivate(activateData);
                            }
                        },
                        "activate"
                    );
                }
            }
        } catch (error) {
            console.error('Activate check failed:', error);
            showInfoDialog(t('scheduler.activateFailed'), "error");
        }
    }, [
        selectedScheduler,
        makeApiCall,
        prepareRequestBody,
        t,
        showConfirmation,
        showInfoDialog,
        auditTrailRights.activate,
        navigateToInstrumentLock,
        executeActivate
    ]);

    const handleRetireConfirm = useCallback(async () => {
        if (!selectedScheduler) return;

        try {
            const checkRequestData = prepareRequestBody({
                sTaskID: selectedScheduler.L13ScheduleID,
                sTaskStatus: selectedScheduler.TaskStatus,
                sPathTaskID: selectedScheduler.L52TaskID
            });

            const checkResponse = await makeApiCall(
                endpoints.checkManualTask,
                checkRequestData,
                "CheckManualTask"
            );

            if (checkResponse && checkResponse.nTaskCount !== undefined) {
                const alertText = checkResponse.nTaskCount === 1
                    ? t('scheduler.confirmRetire')
                    : t('scheduler.confirmRetireWithManual');

                const retireData = {
                    sClientName: selectedScheduler.L06ClientName,
                    sTaskID: selectedScheduler.L13ScheduleID,
                    sTaskStatus: selectedScheduler.TaskStatus,
                    sEmpowerStatus: selectedScheduler.EmpowerStatus,
                    sTaskName: selectedScheduler.L13TaskName,
                    sSourcePath: selectedScheduler.L13SourcePath,
                    sPathTaskID: selectedScheduler.L52TaskID
                };

                showConfirmation(
                    t('scheduler.confirmation'),
                    alertText,
                    () => {
                        // Check audit trail rights
                        if (auditTrailRights.retire === 1) {
                            setPendingAction('retire');
                            setPendingActionData(retireData);
                            setShowAudit(true);
                        } else {
                            executeRetire(retireData);
                        }
                    },
                    "retire"
                );
            }
        } catch (error) {
            console.error('Retire check failed:', error);
            showInfoDialog(t('scheduler.retireFailed'), "error");
        }
    }, [selectedScheduler, makeApiCall, prepareRequestBody, t, showConfirmation, showInfoDialog, auditTrailRights.retire]);

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

        if (pendingAction === 'activate' && pendingActionData) {
            executeActivate(pendingActionData, auditTrailValues);
        } else if (pendingAction === 'retire' && pendingActionData) {
            executeRetire(pendingActionData, auditTrailValues);
        }

        setPendingAction(null);
        setPendingActionData(null);
    }, [pendingAction, pendingActionData, executeActivate, executeRetire, showInfoDialog]);

    const handleAuditClose = useCallback(() => {
        setShowAudit(false);
        setPendingAction(null);
        setPendingActionData(null);
    }, []);

    const handleActivateClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }
        handleActivateConfirm();
    }, [selectedScheduler, showInfoDialog, t, handleActivateConfirm]);

    const handleRetireClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }
        handleRetireConfirm();
    }, [selectedScheduler, showInfoDialog, t, handleRetireConfirm]);

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

    // TEMPORARY: BYPASS INSTRUMENT LOCK RIGHTS CHECK
    // TODO: Remove this when proper rights checking is implemented
    const debugInstrumentLockRights = () => {
        console.log("🔍 DEBUG: Instrument Lock Rights Check BYPASSED");
        console.log("All navigation to Instrument Lock is currently allowed without rights check");
        alert("⚠️ INSTRUMENT LOCK RIGHTS CHECK BYPASSED\n\nAll navigation to Instrument Lock Settings is currently allowed without checking user rights.\n\nThis is temporary for testing. Proper rights checking needs to be implemented.");
    };

    // Load audit trail rights
    useEffect(() => {
        const loadAuditTrailRights = () => {
            try {
                const auditRightsData = sessionStorage.getItem('auditTrailRights');

                if (auditRightsData) {
                    try {
                        const rights = JSON.parse(auditRightsData);
                        const schedulerRights = rights.filter(item =>
                            item.sScreenName && item.sScreenName.includes("Deactivated Task")
                        );

                        const activateRight = schedulerRights.find(item =>
                            item.sTaskName && item.sTaskName.includes("Activate")
                        );
                        const retireRight = schedulerRights.find(item =>
                            item.sTaskName && item.sTaskName.includes("Retire")
                        );

                        setAuditTrailRights({
                            activate: activateRight ? (activateRight.nManualAuditTrail || 0) : 0,
                            retire: retireRight ? (retireRight.nManualAuditTrail || 0) : 0
                        });
                    } catch (parseError) {
                        setAuditTrailRights({ activate: 1, retire: 1 });
                    }
                } else {
                    setAuditTrailRights({ activate: 1, retire: 1 });
                }
            } catch (error) {
                setAuditTrailRights({ activate: 1, retire: 1 });
            }
        };

        loadAuditTrailRights();
    }, []);

    // TEMPORARILY DISABLE INSTRUMENT LOCK RIGHTS CHECKING
    // TODO: Remove this useEffect when proper rights checking is implemented
    useEffect(() => {
        console.log("⚠️ INSTRUMENT LOCK RIGHTS CHECKING DISABLED");
        console.log("All navigation to Instrument Lock will be allowed");

        // Force set rights to 'show' to bypass checks
        sessionStorage.setItem('instrumentLockRights', 'show');
        localStorage.setItem('instrumentLockRights', 'show');

        // Also set a flag that we're bypassing rights
        sessionStorage.setItem('bypassInstrumentLockRights', 'true');

        return () => {
            // Clean up on unmount
            sessionStorage.removeItem('bypassInstrumentLockRights');
        };
    }, []);

    // Navigation handling
    useEffect(() => {
        console.log('=== DeactivatedTask useEffect triggered ===');
        console.log('Navigation data from props:', navigationData);
        console.log('Context submission data:', getSubmissionData());

        let scheduleId = null;

        if (navigationData && navigationData.scheduleId) {
            scheduleId = navigationData.scheduleId;
        } else {
            const submissionData = getSubmissionData();
            if (submissionData && submissionData.targetTab === 'Deactivated Task') {
                scheduleId = submissionData.data?.scheduleId;
                if (clearNavigation) {
                    clearNavigation();
                }
            }
        }

        if (scheduleId) {
            setHighlightScheduleId(scheduleId);
            setShouldScrollToSchedule(true);
            fetchDeactivatedSchedulerData();
        }
    }, [navigationData, getSubmissionData, clearNavigation, fetchDeactivatedSchedulerData]);

    // Initial data load
    useEffect(() => {
        fetchDeactivatedSchedulerData();
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
                // showInfoDialog(`Schedule ${highlightScheduleId} deactivated successfully!`, "success");
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

    const handleViewClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }

        handleViewSchedule();
    }, [selectedScheduler, showInfoDialog, t, handleViewSchedule]);

    useEffect(() => {
        const handleDataSchedulerNavigation = (event) => {
            console.log('Received navigate-to-datascheduler event:', event.detail);
            if (event.detail?.direct && navigateToTab) {
                setTimeout(() => {
                    navigateToTab('Scheduler', 'Data Scheduler', {
                        viewMode: true,
                        data: event.detail.data,
                        type: 'deactivated'
                    });
                }, 100);
            }
        };

        window.addEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);

        return () => {
            window.removeEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);
        };
    }, [navigateToTab]);

    // Listen for when instrument lock is completed
    useEffect(() => {
        const handleInstrumentLockCompleted = (event) => {
            console.log('🔒 Received instrumentLockCompleted event:', event.detail);

            const { scheduleId, activateData, lockSuccess, shouldActivate } = event.detail || {};

            if (lockSuccess && scheduleId && activateData && shouldActivate) {
                console.log('✅ Lock completed, now activating schedule:', scheduleId);

                // Clear the stored data
                sessionStorage.removeItem('originalScheduleId');
                sessionStorage.removeItem('lockCompletedSuccessfully');

                // Check audit trail rights
                if (auditTrailRights.activate === 1) {
                    setPendingAction('activate');
                    setPendingActionData(activateData);
                    setShowAudit(true);
                } else {
                    executeActivate(activateData);
                }
            }
        };

        window.addEventListener('instrumentLockCompleted', handleInstrumentLockCompleted);

        return () => {
            window.removeEventListener('instrumentLockCompleted', handleInstrumentLockCompleted);
        };
    }, [executeActivate, auditTrailRights.activate]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            // Clean up on unmount
            sessionStorage.removeItem('lockAndActivateData');
            sessionStorage.removeItem('originalScheduleId');
            sessionStorage.removeItem('lockCompletedSuccessfully');
            sessionStorage.removeItem('lockResult');

            // Clean global variable
            if (window.GActSchedulerData) {
                window.GActSchedulerData = null;
            }
        };
    }, []);

    // Add this useEffect in DeactivatedTask.jsx - after your existing useEffect for instrument lock
    useEffect(() => {
        // Listen for when instrument lock is completed and we need to navigate to Activated Task
        const handleLockCompletedNavigate = (event) => {
            console.log('🔒 Received lock completed event for navigation:', event.detail);

            const { scheduleId, instrumentId, fromLock } = event.detail || {};

            if (fromLock && scheduleId) {
                console.log('✅ Lock completed, navigating to Activated Task for schedule:', scheduleId);

                // Use the navigation function to go to Activated Task
                if (navigateFromDeactivatedToActivatedTask) {
                    navigateFromDeactivatedToActivatedTask({
                        scheduleId: scheduleId,
                        message: 'Instrument locked successfully. Schedule ready for activation.',
                        highlightScheduleId: scheduleId,
                        shouldScrollToSchedule: true,
                        fromLock: true
                    });
                } else if (navigateToTab) {
                    // Fallback navigation
                    navigateToTab('Scheduler', 'View Edit Scheduler', {
                        innerTab: 'Activated Task',
                        scheduleId: scheduleId,
                        highlightScheduleId: scheduleId,
                        fromLock: true
                    });
                }
            }
        };

        window.addEventListener('schedulerInstrumentLocked', handleLockCompletedNavigate);

        return () => {
            window.removeEventListener('schedulerInstrumentLocked', handleLockCompletedNavigate);
        };
    }, [navigateFromDeactivatedToActivatedTask, navigateToTab]);

    // Update the cleanup effect in DeactivatedTask.jsx
    useEffect(() => {
        return () => {
            // Clean up on unmount
            sessionStorage.removeItem('lockAndActivateData');
            sessionStorage.removeItem('originalScheduleId');
            sessionStorage.removeItem('lockCompletedSuccessfully');
            sessionStorage.removeItem('lockResult');

            // Clean global variable
            if (window.GActSchedulerData) {
                window.GActSchedulerData = null;
            }
        };
    }, []);

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
            sFileName: "DeactiveScheduler",
            AllRows: allRows,
            HeaderDetails: headerDetails,
            AllowKeys: allowKeys,
            sBrowserURL: window.location.origin,
            ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
            ApplicationCode: "SDMS"
        };
    }, [schedulerData, t, prepareRequestBody]);

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

    const handlePrintClick = useCallback(() => {
        if (!schedulerData || schedulerData.length === 0) {
            showInfoDialog(t('scheduler.selectRecord'), "information");
            return;
        }

        setDoPrint(true);
    }, [schedulerData, showInfoDialog, t]);

    const buildPrintRequest = useCallback(() => ({
        sModuleName: "Deactivated Scheduler",
        ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
        ApplicationCode: "SDMS",
    }), [prepareRequestBody]);

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

                await fetchDeactivatedSchedulerData();

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
    }, [importFile, getActiveUserDetails, fetchDeactivatedSchedulerData, t, showInfoDialog]);

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
                    onConfirm={() => {
                        // Handle different button types
                        if (confirmDialogData.buttonType === "lockActivateCancel") {
                            // This is handled by custom buttons in the dialog
                            return;
                        }
                        // Default behavior for yes/no dialogs
                        handleConfirmDialogConfirm();
                    }}
                    customButtons={confirmDialogData.buttonType === "lockActivateCancel" ? [
                        {
                            text: t('button.cancel'),
                            onClick: () => {
                                setShowConfirmDialog(false);
                                setConfirmDialogData({
                                    title: "",
                                    message: "",
                                    onConfirm: null,
                                    actionType: ""
                                });
                            },
                            className: "bg-gray-200 text-slate-700 border border-gray-300"
                        },
                        {
                            text: t('button.activate'),
                            onClick: () => {
                                if (confirmDialogData.onConfirm) {
                                    confirmDialogData.onConfirm('activateOnly');
                                }
                                setShowConfirmDialog(false);
                            },
                            className: "bg-blue-500 text-white"
                        },
                        {
                            text: t('button.lockActivate'),
                            onClick: () => {
                                if (confirmDialogData.onConfirm) {
                                    confirmDialogData.onConfirm('lockActivate');
                                }
                                setShowConfirmDialog(false);
                            },
                            className: "bg-green-500 text-white"
                        }
                    ] : undefined}
                    okText={confirmDialogData.buttonType === "yesno" ? t('button.yes') : t('button.ok')}
                    cancelText={confirmDialogData.buttonType === "yesno" ? t('button.no') : t('button.cancel')}
                />
            )}

            {/* Audit Trail Modal */}
            {showAudit && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
                    <AuditTrail
                        isOpen={showAudit}
                        onClose={handleAuditClose}
                        onAuthorized={handleAuditAuthorized}
                        actionLabel={
                            pendingAction === 'activate' ? 'Activate Task' :
                                pendingAction === 'retire' ? 'Retire Task' :
                                    'Schedule Action'
                        }
                        defaultReason={
                            pendingAction === 'activate' ? "Activated" :
                                pendingAction === 'retire' ? "Retired" :
                                    "Modified"
                        }
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
                />
                <ActionButton
                    iconClass="fa-check"
                    label={t('button.activate')}
                    onClick={handleActivateClick}
                />
                <ActionButton
                    iconClass="fa-ban"
                    label={t('button.retire')}
                    onClick={handleRetireClick}
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
                    title={t('scheduler.deactivatedScheduler')}
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
        </div>
    );
};

export default DeactivedTask;