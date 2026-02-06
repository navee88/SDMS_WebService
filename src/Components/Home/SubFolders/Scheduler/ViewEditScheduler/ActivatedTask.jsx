// // // // import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// // // // import { Eye, ThumbsDown, Ban, Download, Upload, Printer } from 'lucide-react';
// // // // import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// // // // import { useTranslation } from 'react-i18next';
// // // // import { useNavigate } from "react-router-dom";
// // // // import Errordialog from '../../../../Layout/Common/Errordialog';
// // // // import CustomPopup from '../../../../Layout/Common/Popup';

// // // // const ActivatedTask = ({
// // // //     navigationData,
// // // //     submissionData,
// // // //     onClearNavigation
// // // // }) => { //made change by kirubhakaran on 23-01-2026
// // // //     const [schedulerData, setSchedulerData] = useState([]);
// // // //     const [selectedScheduler, setSelectedScheduler] = useState(null);
// // // //     const [selectedRowId, setSelectedRowId] = useState(0);
// // // //     const [loading, setLoading] = useState(true);
// // // //     const [infoDialog, setInfoDialog] = useState({
// // // //         open: false,
// // // //         scheduler: "",
// // // //         type: "information"
// // // //     });
// // // //     const [activePopup, setActivePopup] = useState(null);
// // // //     const [auditTrailData, setAuditTrailData] = useState({
// // // //         username: "Administrator",
// // // //         password: "",
// // // //         reason: "",
// // // //         comments: ""
// // // //     });
// // // //     const [importModalOpen, setImportModalOpen] = useState(false);
// // // //     const [importFile, setImportFile] = useState(null);
// // // //     const { t } = useTranslation('scheduler');
// // // //     // Added THESE 3 LINES:(made change by kirubhakaran on 23-01-2026)
// // // //     // const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
// // // //     const [highlightScheduleId, setHighlightScheduleId] = useState(null);
// // // //     const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);
// // // //     // Receive props directly instead:
// // // //     // const { submissionData, onClearNavigation } = props; // Use props passed from wrapper

// // // //     const navigate = useNavigate();
// // // //     // Use ref to track if we've already processed the navigation
// // // //     const hasProcessedNavigation = useRef(false);

// // // //     // Mock data - similar to DeactivedTask
// // // //     const mockSchedulerData = [
// // // //         {
// // // //             id: 1,
// // // //             L11InstrumentAliasName: "CU-Summary1 (CU-Summary1)",
// // // //             L13ScheduleID: "SCH-001",
// // // //             L06ClientName: "DESKTOP-CU9J5T2",
// // // //             L09FTPAliasName: "FTP-Alias-1",
// // // //             L13LiveArchive: true,
// // // //             L13TaskName: "Daily Backup Task",
// // // //             L13SourcePath: "/path/to/source",
// // // //             L52TaskCompleted: "Completed",
// // // //             EmpowerStatus: "Active",
// // // //             L13UNCStatus: false,
// // // //             TaskStatus: "Activated",
// // // //             ClientStatus: "Active",
// // // //             InstrumentStatus: "Active",
// // // //             StartDate: "2024-01-15 10:00",
// // // //             UTCStartDate: "2024-01-15 08:00",
// // // //             EndDate: null,
// // // //             UTCEndDate: null,
// // // //             TriggerTime: "10:00:00",
// // // //             UTCTriggerTime: "08:00:00",
// // // //             ScheduleMode: "Daily",
// // // //             NextScheduleDate: "2024-03-20 10:00",
// // // //             UTCNextScheduleDate: "2024-03-20 08:00",
// // // //             LastScheduleDateTime: "2024-03-19 10:00",
// // // //             UTCLastScheduleDateTime: "2024-03-19 08:00",
// // // //             CreatedBy: "Admin",
// // // //             CreatedDate: "2024-01-10 09:00",
// // // //             UTCCreatedDate: "2024-01-10 07:00",
// // // //             ModifiedBy: "Admin",
// // // //             ModifiedDate: "2024-01-12 11:00",
// // // //             UTCModifiedDate: "2024-01-12 09:00"
// // // //         }
// // // //         // Add more mock data as needed
// // // //     ];

// // // //     useEffect(() => {
// // // //         setLoading(true);
// // // //         setTimeout(() => {
// // // //             setSchedulerData(mockSchedulerData);
// // // //             setLoading(false);
// // // //         }, 500);
// // // //     }, []);

// // // //     // Handle navigation data
// // // //     useEffect(() => {
// // // //         console.log('=== ActivatedTask useEffect triggered ===');
// // // //         console.log('Navigation data from props:', navigationData);
// // // //         console.log('Submission data from context:', submissionData);

// // // //         // Prevent multiple processing
// // // //         if (hasProcessedNavigation.current) {
// // // //             return;
// // // //         }

// // // //         let scheduleId = null;
// // // //         let scheduleData = null;

// // // //         // Priority 1: Check props passed from parent (tab system)
// // // //         if (navigationData && navigationData.scheduleId) {
// // // //             console.log('=== Received navigation data via props ===');
// // // //             scheduleId = navigationData.scheduleId;
// // // //             scheduleData = navigationData;
// // // //         }
// // // //         // Priority 2: Check submission data from wrapper
// // // //         else if (submissionData && submissionData.data) {
// // // //             console.log('=== Received submission data from wrapper ===');
// // // //             scheduleId = submissionData.data?.scheduleId;
// // // //             scheduleData = submissionData.data;

// // // //             // Clear navigation if provided
// // // //             if (onClearNavigation) {
// // // //                 onClearNavigation();
// // // //             }
// // // //         }

// // // //         if (scheduleId) {
// // // //             setHighlightScheduleId(scheduleId);
// // // //             setShouldScrollToSchedule(true);
// // // //             hasProcessedNavigation.current = true;

// // // //             // Add the new schedule if it doesn't exist
// // // //             const scheduleExists = schedulerData.some(item =>
// // // //                 item.L13ScheduleID === scheduleId
// // // //             );

// // // //             if (!scheduleExists && scheduleData) {
// // // //                 const newSchedule = {
// // // //                     id: schedulerData.length + 1,
// // // //                     L11InstrumentAliasName: scheduleData.instrumentName || "New Instrument",
// // // //                     L13ScheduleID: scheduleId,
// // // //                     L06ClientName: scheduleData.clientName || "New Client",
// // // //                     L09FTPAliasName: "FTP-Alias-" + (schedulerData.length + 1),
// // // //                     L13LiveArchive: true,
// // // //                     L13TaskName: "New Schedule Task",
// // // //                     L13SourcePath: scheduleData.sourcePath || "/new/path",
// // // //                     L52TaskCompleted: "Completed",
// // // //                     EmpowerStatus: "Active",
// // // //                     L13UNCStatus: false,
// // // //                     TaskStatus: "Activated",
// // // //                     ClientStatus: "Active",
// // // //                     InstrumentStatus: "Active",
// // // //                     StartDate: new Date().toISOString(),
// // // //                     UTCStartDate: new Date().toISOString(),
// // // //                     EndDate: null,
// // // //                     UTCEndDate: null,
// // // //                     TriggerTime: "10:00:00",
// // // //                     UTCTriggerTime: "08:00:00",
// // // //                     ScheduleMode: "Daily",
// // // //                     NextScheduleDate: new Date(Date.now() + 86400000).toISOString(),
// // // //                     UTCNextScheduleDate: new Date(Date.now() + 86400000).toISOString(),
// // // //                     LastScheduleDateTime: new Date().toISOString(),
// // // //                     UTCLastScheduleDateTime: new Date().toISOString(),
// // // //                     CreatedBy: "Admin",
// // // //                     CreatedDate: new Date().toISOString(),
// // // //                     UTCCreatedDate: new Date().toISOString(),
// // // //                     ModifiedBy: "Admin",
// // // //                     ModifiedDate: new Date().toISOString(),
// // // //                     UTCModifiedDate: new Date().toISOString()
// // // //                 };

// // // //                 setSchedulerData(prev => [newSchedule, ...prev]);
// // // //             }
// // // //         }
// // // //     }, [navigationData, submissionData, onClearNavigation, schedulerData]);

// // // //     // Handle highlighting after data loads
// // // //     useEffect(() => {
// // // //         if (shouldScrollToSchedule && highlightScheduleId && schedulerData.length > 0) {
// // // //             const scheduleRow = schedulerData.find(item =>
// // // //                 item.L13ScheduleID === highlightScheduleId
// // // //             );

// // // //             if (scheduleRow) {
// // // //                 setSelectedScheduler(scheduleRow);
// // // //                 setSelectedRowId(scheduleRow.id);
// // // //                 // showInfoDialog(`Schedule ${highlightScheduleId} created successfully and is now activated!`, "success");
// // // //                 console.log('Auto-selected schedule:', highlightScheduleId);
// // // //             }

// // // //             setShouldScrollToSchedule(false);
// // // //         }
// // // //     }, [schedulerData, highlightScheduleId, shouldScrollToSchedule]);

// // // //     const showInfoDialog = useCallback((scheduler, type = "information") => {
// // // //         setInfoDialog({
// // // //             open: true,
// // // //             scheduler,
// // // //             type
// // // //         });
// // // //     }, []);

// // // //     const closeInfoDialog = useCallback(() => {
// // // //         setInfoDialog(prev => ({
// // // //             ...prev,
// // // //             open: false
// // // //         }));
// // // //     }, []);

// // // //     const handleRowSelect = useCallback((row) => {
// // // //         setSelectedScheduler(row);
// // // //         setSelectedRowId(row.id);
// // // //     }, []);

// // // //     //Commented by kirubhakaran on 23-01-2026
// // // //     // const handleViewClick = useCallback(() => {
// // // //     //     if (!selectedScheduler) {
// // // //     //         showInfoDialog(t('scheduler.selectRecordToView'), "warning");
// // // //     //         return;
// // // //     //     }
// // // //     //     navigate(`/scheduler/view/${selectedScheduler.L13ScheduleID}`);
// // // //     // }, [selectedScheduler, navigate, showInfoDialog, t]);

// // // //     // MODIFIED handleViewClick (remove navigate since no router):
// // // //     const handleViewClick = useCallback(() => {
// // // //         if (!selectedScheduler) {
// // // //             showInfoDialog(t('scheduler.selectRecordToView'), "warning");
// // // //             return;
// // // //         }
// // // //         // In tab system, you might want to switch to edit tab or show modal
// // // //         showInfoDialog(`Viewing schedule ${selectedScheduler.L13ScheduleID}`, "information");
// // // //     }, [selectedScheduler, showInfoDialog, t]);

// // // //     const handleDeactivateClick = useCallback(() => {
// // // //         if (!selectedScheduler) {
// // // //             showInfoDialog(t('scheduler.selectRecord'), "warning");
// // // //             return;
// // // //         }
// // // //         setActivePopup("Deactivate Task");
// // // //     }, [selectedScheduler, showInfoDialog, t]);

// // // //     const handleRetireClick = useCallback(() => {
// // // //         if (!selectedScheduler) {
// // // //             showInfoDialog(t('scheduler.selectRecord'), "warning");
// // // //             return;
// // // //         }
// // // //         setActivePopup("Retire Task");
// // // //     }, [selectedScheduler, showInfoDialog, t]);

// // // //     const handleExportClick = useCallback(async () => {
// // // //         if (schedulerData.length === 0) {
// // // //             showInfoDialog(t('scheduler.noRecordsToExport'), "warning");
// // // //             return;
// // // //         }

// // // //         try {
// // // //             // Implement export logic based on jQuery's ActiveScheduler_export function
// // // //             showInfoDialog(t('scheduler.exportSuccess'), "success");
// // // //         } catch (error) {
// // // //             showInfoDialog(t('scheduler.exportFailed'), "error");
// // // //         }
// // // //     }, [schedulerData, showInfoDialog, t]);

// // // //     const handleImportClick = useCallback(() => {
// // // //         setImportModalOpen(true);
// // // //     }, []);

// // // //     const handlePrintClick = useCallback(() => {
// // // //         window.print();
// // // //     }, []);

// // // //     const handlePopupClose = useCallback(() => {
// // // //         setActivePopup(null);
// // // //         setImportModalOpen(false);
// // // //         setAuditTrailData({
// // // //             username: "Administrator",
// // // //             password: "",
// // // //             reason: "",
// // // //             comments: ""
// // // //         });
// // // //     }, []);

// // // //     const handleFileChange = useCallback((e) => {
// // // //         const file = e.target.files[0];
// // // //         if (file) {
// // // //             const fileExtension = file.name.split('.').pop().toLowerCase();
// // // //             if (['xls', 'xlsx'].includes(fileExtension)) {
// // // //                 setImportFile(file);
// // // //             } else {
// // // //                 showInfoDialog(t('scheduler.invalidFileType'), "error");
// // // //                 e.target.value = '';
// // // //             }
// // // //         }
// // // //     }, [showInfoDialog, t]);

// // // //     const handleDownloadTemplate = useCallback(() => {
// // // //         // Implement template download logic
// // // //         showInfoDialog(t('scheduler.templateDownloadStarted'), "success");
// // // //     }, [showInfoDialog, t]);

// // // //     const handleUploadSubmit = useCallback(async () => {
// // // //         if (!importFile) {
// // // //             showInfoDialog(t('scheduler.selectFileToUpload'), "warning");
// // // //             return;
// // // //         }

// // // //         try {
// // // //             // Implement file upload logic
// // // //             showInfoDialog(t('scheduler.importSuccess'), "success");
// // // //             setImportModalOpen(false);
// // // //             setImportFile(null);
// // // //         } catch (error) {
// // // //             showInfoDialog(t('scheduler.importFailed'), "error");
// // // //         }
// // // //     }, [importFile, showInfoDialog, t]);

// // // //     const columns = useMemo(() => [
// // // //         {
// // // //             key: 'L11InstrumentAliasName',
// // // //             label: t('scheduler.instrument'),
// // // //             width: 150,
// // // //             render: (row, isSelected) => (
// // // //                 <div style={{
// // // //                     fontSize: '12px',
// // // //                     color: '#374151',
// // // //                     overflow: 'hidden',
// // // //                     textOverflow: 'ellipsis',
// // // //                     whiteSpace: 'nowrap',
// // // //                     fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
// // // //                 }}>
// // // //                     <span className={isSelected ? "font-bold" : ''}>{row.L11InstrumentAliasName}</span>
// // // //                 </div>
// // // //             )
// // // //         },
// // // //         {
// // // //             key: 'L13ScheduleID',
// // // //             label: t('scheduler.taskID'),
// // // //             width: 120,
// // // //             render: (row, isSelected) => (
// // // //                 <div style={{
// // // //                     fontSize: '12px',
// // // //                     color: '#374151',
// // // //                     overflow: 'hidden',
// // // //                     textOverflow: 'ellipsis',
// // // //                     whiteSpace: 'nowrap',
// // // //                     fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
// // // //                 }}>
// // // //                     <span className={isSelected ? "font-bold" : ''}>{row.L13ScheduleID}</span>
// // // //                 </div>
// // // //             )
// // // //         },
// // // //         {
// // // //             key: 'L06ClientName',
// // // //             label: t('scheduler.clientName'),
// // // //             width: 150,
// // // //             render: (row, isSelected) => (
// // // //                 <div style={{
// // // //                     fontSize: '12px',
// // // //                     color: '#374151',
// // // //                     overflow: 'hidden',
// // // //                     textOverflow: 'ellipsis',
// // // //                     whiteSpace: 'nowrap',
// // // //                     fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
// // // //                 }}>
// // // //                     <span className={isSelected ? "font-bold" : ''}>{row.L06ClientName}</span>
// // // //                 </div>
// // // //             )
// // // //         },
// // // //         {
// // // //             key: 'L09FTPAliasName',
// // // //             label: t('scheduler.storageName'),
// // // //             width: 150,
// // // //             render: (row, isSelected) => (
// // // //                 <div style={{
// // // //                     fontSize: '12px',
// // // //                     color: '#374151',
// // // //                     overflow: 'hidden',
// // // //                     textOverflow: 'ellipsis',
// // // //                     whiteSpace: 'nowrap',
// // // //                     fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
// // // //                 }}>
// // // //                     <span className={isSelected ? "font-bold" : ''}>{row.L09FTPAliasName}</span>
// // // //                 </div>
// // // //             )
// // // //         },
// // // //         {
// // // //             key: 'L13LiveArchive',
// // // //             label: t('scheduler.liveArchive'),
// // // //             width: 140,
// // // //             render: (row, isSelected) => (
// // // //                 <div style={{
// // // //                     fontSize: '12px',
// // // //                     color: '#374151',
// // // //                     textAlign: 'center',
// // // //                     fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
// // // //                 }}>
// // // //                     <span className={isSelected ? "font-bold" : ''}>{row.L13LiveArchive ? "✓" : ""}</span>
// // // //                 </div>
// // // //             )
// // // //         }
// // // //     ], [selectedRowId, t]);

// // // //     const renderSchedulerDetail = useCallback((scheduler) => (
// // // //         <div style={{
// // // //             display: 'flex',
// // // //             flexDirection: 'column',
// // // //             gap: '14px',
// // // //             fontWeight: '600',
// // // //             fontFamily: 'Roboto, sans-serif',
// // // //             fontSize: '12px',
// // // //         }}>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.taskName')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.L13TaskName}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.sourcePath')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.L13SourcePath}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.firstCycleStatus')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.L52TaskCompleted}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.empowerStatus')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.EmpowerStatus}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.uncStatus')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.L13UNCStatus ? t('scheduler.yes') : t('scheduler.no')}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.taskStatus')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.TaskStatus}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.clientStatus')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.ClientStatus}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.instrumentStatus')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.InstrumentStatus}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.startDate')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.StartDate}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.endDate')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.EndDate || t('scheduler.notSet')}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.triggerTime')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.TriggerTime}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.scheduleMode')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.ScheduleMode}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.nextScheduleDateTime')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.NextScheduleDate || t('scheduler.notSet')}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.lastScheduleDateTime')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.LastScheduleDateTime}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.createdBy')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.CreatedBy}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.createdOn')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.CreatedDate}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.modifiedBy')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.ModifiedBy}
// // // //                 </div>
// // // //             </div>
// // // //             <div style={{ display: 'flex', alignItems: 'center' }}>
// // // //                 <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
// // // //                     {t('scheduler.modifiedOn')}
// // // //                 </div>
// // // //                 <div style={{ width: '60%', color: '#1f2937' }}>
// // // //                     {scheduler.ModifiedDate}
// // // //                 </div>
// // // //             </div>
// // // //         </div>
// // // //     ), [t]);

// // // //     if (loading) {
// // // //         return (
// // // //             <div style={{
// // // //                 display: 'flex',
// // // //                 alignItems: 'center',
// // // //                 justifyContent: 'center',
// // // //                 height: '100%'
// // // //             }}>
// // // //                 <div style={{ color: '#6b7280' }}>{t('scheduler.loading')}</div>
// // // //             </div>
// // // //         );
// // // //     }

// // // //     const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "", variant = "default" }) => (
// // // //         <button
// // // //             onClick={onClick}
// // // //             disabled={disabled}
// // // //             style={{
// // // //                 display: 'flex',
// // // //                 alignItems: 'center',
// // // //                 gap: '6px',
// // // //                 padding: '6px 10px',
// // // //                 fontSize: '12px',
// // // //                 fontWeight: 'bold',
// // // //                 borderRadius: '4px',
// // // //                 border: 'none',
// // // //                 cursor: disabled ? 'not-allowed' : 'pointer',
// // // //                 transition: 'all 0.2s ease',
// // // //                 whiteSpace: 'nowrap',
// // // //                 backgroundColor: disabled
// // // //                     ? '#f8fafc'
// // // //                     : variant === 'primary'
// // // //                         ? '#2883FE'
// // // //                         : variant === 'danger'
// // // //                             ? '#ef4444'
// // // //                             : '#f1f5f9',
// // // //                 color: disabled
// // // //                     ? '#cbd5e1'
// // // //                     : variant === 'primary' || variant === 'danger'
// // // //                         ? 'white'
// // // //                         : '#2883FE'
// // // //             }}
// // // //             onMouseEnter={(e) => {
// // // //                 if (!disabled) {
// // // //                     e.currentTarget.style.transform = 'scale(0.98)';
// // // //                     e.currentTarget.style.opacity = '0.9';

// // // //                     if (variant === 'default') {
// // // //                         e.currentTarget.style.backgroundColor = '#E6F0FF';
// // // //                     } else if (variant === 'primary') {
// // // //                         e.currentTarget.style.backgroundColor = '#1c6fd8';
// // // //                     } else if (variant === 'danger') {
// // // //                         e.currentTarget.style.backgroundColor = '#dc2626';
// // // //                     }
// // // //                 }
// // // //             }}
// // // //             onMouseLeave={(e) => {
// // // //                 if (!disabled) {
// // // //                     e.currentTarget.style.transform = 'scale(1)';
// // // //                     e.currentTarget.style.opacity = '1';

// // // //                     if (variant === 'default') {
// // // //                         e.currentTarget.style.backgroundColor = '#f1f5f9';
// // // //                     } else if (variant === 'primary') {
// // // //                         e.currentTarget.style.backgroundColor = '#2883FE';
// // // //                     } else if (variant === 'danger') {
// // // //                         e.currentTarget.style.backgroundColor = '#ef4444';
// // // //                     }
// // // //                 }
// // // //             }}
// // // //         >
// // // //             {Icon && <Icon style={{ width: '14px', height: '14px' }} />}
// // // //             <span>{label}</span>
// // // //         </button>
// // // //     );

// // // //     return (
// // // //         <div style={{
// // // //             display: 'flex',
// // // //             flexDirection: 'column',
// // // //             fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
// // // //         }}>
// // // //             {/* Error/Info Dialog */}
// // // //             {infoDialog.open && (
// // // //                 <Errordialog
// // // //                     scheduler={infoDialog.scheduler}
// // // //                     type={infoDialog.type}
// // // //                     onClose={closeInfoDialog}
// // // //                 />
// // // //             )}

// // // //             {/* Top Action Buttons */}
// // // //             <div style={{
// // // //                 display: 'flex',
// // // //                 justifyContent: 'flex-end',
// // // //                 gap: '10px',
// // // //                 padding: '10px',
// // // //                 background: 'white',
// // // //                 marginBottom: '0px',
// // // //                 marginTop: '2px',
// // // //             }}>
// // // //                 <ActionButton
// // // //                     icon={Eye}
// // // //                     label={t('button.view')}
// // // //                     onClick={handleViewClick}
// // // //                 />
// // // //                 <ActionButton
// // // //                     icon={ThumbsDown}
// // // //                     label={t('button.deactivate')}
// // // //                     onClick={handleDeactivateClick}
// // // //                 />
// // // //                 <ActionButton
// // // //                     icon={Ban}
// // // //                     label={t('button.retire')}
// // // //                     onClick={handleRetireClick}
// // // //                 />
// // // //                 <ActionButton
// // // //                     icon={Download}
// // // //                     label={t('button.export')}
// // // //                     onClick={handleExportClick}
// // // //                 />
// // // //                 <ActionButton
// // // //                     icon={Upload}
// // // //                     label={t('button.import')}
// // // //                     onClick={handleImportClick}
// // // //                 />
// // // //                 <ActionButton
// // // //                     icon={Printer}
// // // //                     label={t('button.print')}
// // // //                     onClick={handlePrintClick}
// // // //                 />
// // // //             </div>

// // // //             {/* Main GridLayout with Details Panel */}
// // // //             <div style={{ flex: 1, fontFamily: 'verdana, sans-serif' }}>
// // // //                 <GridLayout
// // // //                     columns={columns}
// // // //                     data={schedulerData}
// // // //                     renderDetailPanel={renderSchedulerDetail}
// // // //                     onRowClick={handleRowSelect}
// // // //                     searchable={false}
// // // //                     selectable={true}
// // // //                     hidePagination={false}
// // // //                 />
// // // //             </div>

// // // //             {/* Import Modal */}
// // // //             {importModalOpen && (
// // // //                 <CustomPopup
// // // //                     isOpen={importModalOpen}
// // // //                     onClose={handlePopupClose}
// // // //                     title={t('scheduler.importSchedule')}
// // // //                     content={
// // // //                         <div style={{
// // // //                             display: 'flex',
// // // //                             flexDirection: 'column',
// // // //                             gap: '16px',
// // // //                             padding: '8px'
// // // //                         }}>
// // // //                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
// // // //                                 <label style={{
// // // //                                     fontSize: '14px',
// // // //                                     fontWeight: 600,
// // // //                                     color: '#374151'
// // // //                                 }}>
// // // //                                     {t('scheduler.file')} <span style={{ color: '#ef4444' }}>*</span>
// // // //                                 </label>
// // // //                                 <input
// // // //                                     type="file"
// // // //                                     onChange={handleFileChange}
// // // //                                     accept=".xlsx,.xls"
// // // //                                     style={{
// // // //                                         width: '100%',
// // // //                                         padding: '8px 12px',
// // // //                                         fontSize: '14px',
// // // //                                         border: '1px solid #d1d5db',
// // // //                                         borderRadius: '4px',
// // // //                                         outline: 'none'
// // // //                                     }}
// // // //                                 />
// // // //                                 <div style={{ color: '#9a9797', fontSize: '12px' }}>
// // // //                                     {t('scheduler.activeNoteBrowseUploadXlsAndXlxs')}
// // // //                                 </div>
// // // //                             </div>

// // // //                             <div style={{
// // // //                                 display: 'flex',
// // // //                                 justifyContent: 'flex-end',
// // // //                                 gap: '12px',
// // // //                                 paddingTop: '12px',
// // // //                                 marginTop: '8px',
// // // //                                 borderTop: '1px solid #e5e7eb'
// // // //                             }}>
// // // //                                 <button
// // // //                                     onClick={handleDownloadTemplate}
// // // //                                     style={{
// // // //                                         display: 'flex',
// // // //                                         alignItems: 'center',
// // // //                                         gap: '8px',
// // // //                                         padding: '8px 16px',
// // // //                                         fontSize: '14px',
// // // //                                         fontWeight: 600,
// // // //                                         color: 'white',
// // // //                                         backgroundColor: '#3b82f6',
// // // //                                         border: 'none',
// // // //                                         borderRadius: '4px',
// // // //                                         cursor: 'pointer'
// // // //                                     }}
// // // //                                 >
// // // //                                     <Download style={{ width: '16px', height: '16px' }} /> {t('scheduler.getImportTemplate')}
// // // //                                 </button>
// // // //                                 <button
// // // //                                     onClick={handleUploadSubmit}
// // // //                                     style={{
// // // //                                         display: 'flex',
// // // //                                         alignItems: 'center',
// // // //                                         gap: '8px',
// // // //                                         padding: '8px 16px',
// // // //                                         fontSize: '14px',
// // // //                                         fontWeight: 600,
// // // //                                         color: 'white',
// // // //                                         backgroundColor: '#10b981',
// // // //                                         border: 'none',
// // // //                                         borderRadius: '4px',
// // // //                                         cursor: 'pointer'
// // // //                                     }}
// // // //                                 >
// // // //                                     <Upload style={{ width: '16px', height: '16px' }} /> {t('scheduler.upload')}
// // // //                                 </button>
// // // //                                 <button
// // // //                                     onClick={handlePopupClose}
// // // //                                     style={{
// // // //                                         padding: '8px 16px',
// // // //                                         fontSize: '14px',
// // // //                                         fontWeight: 600,
// // // //                                         color: '#374151',
// // // //                                         backgroundColor: 'white',
// // // //                                         border: '1px solid #d1d5db',
// // // //                                         borderRadius: '4px',
// // // //                                         cursor: 'pointer'
// // // //                                     }}
// // // //                                 >
// // // //                                     {t('scheduler.close')}
// // // //                                 </button>
// // // //                             </div>
// // // //                         </div>
// // // //                     }
// // // //                     size="md"
// // // //                 />
// // // //             )}

// // // //             {/* Deactivate/Retire Popup */}
// // // //             {activePopup === "Deactivate Task" || activePopup === "Retire Task" ? (
// // // //                 <CustomPopup
// // // //                     isOpen={!!activePopup}
// // // //                     onClose={handlePopupClose}
// // // //                     title={activePopup === "Deactivate Task" ? t('scheduler.deactivateTask') : t('scheduler.retireTask')}
// // // //                     content={
// // // //                         <div style={{
// // // //                             display: 'flex',
// // // //                             flexDirection: 'column',
// // // //                             gap: '16px',
// // // //                             padding: '8px'
// // // //                         }}>
// // // //                             {/* Audit trail form similar to DeactivedTask */}
// // // //                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
// // // //                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
// // // //                                     {t('scheduler.username')} <span style={{ color: '#ef4444' }}>*</span>
// // // //                                 </label>
// // // //                                 <input
// // // //                                     type="text"
// // // //                                     value={auditTrailData.username}
// // // //                                     disabled
// // // //                                     style={{
// // // //                                         width: '100%',
// // // //                                         padding: '8px 12px',
// // // //                                         fontSize: '14px',
// // // //                                         color: '#374151',
// // // //                                         backgroundColor: '#f9fafb',
// // // //                                         border: '1px solid #d1d5db',
// // // //                                         borderRadius: '4px'
// // // //                                     }}
// // // //                                 />
// // // //                             </div>

// // // //                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
// // // //                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
// // // //                                     {t('scheduler.password')} <span style={{ color: '#ef4444' }}>*</span>
// // // //                                 </label>
// // // //                                 <input
// // // //                                     type="password"
// // // //                                     value={auditTrailData.password}
// // // //                                     onChange={(e) => setAuditTrailData(prev => ({ ...prev, password: e.target.value }))}
// // // //                                     style={{
// // // //                                         width: '100%',
// // // //                                         padding: '8px 12px',
// // // //                                         fontSize: '14px',
// // // //                                         border: '1px solid #d1d5db',
// // // //                                         borderRadius: '4px',
// // // //                                         outline: 'none'
// // // //                                     }}
// // // //                                     placeholder={t('scheduler.enterPassword')}
// // // //                                 />
// // // //                             </div>

// // // //                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
// // // //                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
// // // //                                     {t('scheduler.reason')} <span style={{ color: '#ef4444' }}>*</span>
// // // //                                 </label>
// // // //                                 <select
// // // //                                     value={auditTrailData.reason}
// // // //                                     onChange={(e) => setAuditTrailData(prev => ({ ...prev, reason: e.target.value }))}
// // // //                                     style={{
// // // //                                         width: '100%',
// // // //                                         padding: '8px 12px',
// // // //                                         fontSize: '14px',
// // // //                                         border: '1px solid #d1d5db',
// // // //                                         borderRadius: '4px',
// // // //                                         outline: 'none'
// // // //                                     }}
// // // //                                 >
// // // //                                     <option value="">{t('scheduler.selectReason')}</option>
// // // //                                     {activePopup === "Deactivate Task" ? (
// // // //                                         <>
// // // //                                             <option value="Deactivated">{t('scheduler.deactivated')}</option>
// // // //                                             <option value="Modified">{t('scheduler.modified')}</option>
// // // //                                         </>
// // // //                                     ) : (
// // // //                                         <>
// // // //                                             <option value="Retired">{t('scheduler.retired')}</option>
// // // //                                             <option value="Decommissioned">{t('scheduler.decommissioned')}</option>
// // // //                                             <option value="Replaced">{t('scheduler.replaced')}</option>
// // // //                                         </>
// // // //                                     )}
// // // //                                 </select>
// // // //                             </div>

// // // //                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
// // // //                                 <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
// // // //                                     {t('scheduler.comments')} <span style={{ color: '#ef4444' }}>*</span>
// // // //                                 </label>
// // // //                                 <textarea
// // // //                                     rows={3}
// // // //                                     value={auditTrailData.comments}
// // // //                                     onChange={(e) => setAuditTrailData(prev => ({ ...prev, comments: e.target.value }))}
// // // //                                     style={{
// // // //                                         width: '100%',
// // // //                                         padding: '8px 12px',
// // // //                                         fontSize: '14px',
// // // //                                         border: '1px solid #d1d5db',
// // // //                                         borderRadius: '4px',
// // // //                                         outline: 'none',
// // // //                                         resize: 'none'
// // // //                                     }}
// // // //                                     placeholder={t('scheduler.enterComments')}
// // // //                                 />
// // // //                             </div>

// // // //                             <div style={{
// // // //                                 display: 'flex',
// // // //                                 justifyContent: 'flex-end',
// // // //                                 gap: '12px',
// // // //                                 paddingTop: '12px',
// // // //                                 marginTop: '8px',
// // // //                                 borderTop: '1px solid #e5e7eb'
// // // //                             }}>
// // // //                                 <button
// // // //                                     onClick={() => {
// // // //                                         if (activePopup === "Deactivate Task") {
// // // //                                             showInfoDialog(t('scheduler.taskDeactivatedSuccess'), "success");
// // // //                                         } else {
// // // //                                             showInfoDialog(t('scheduler.taskRetiredSuccess'), "success");
// // // //                                         }
// // // //                                         handlePopupClose();
// // // //                                     }}
// // // //                                     style={{
// // // //                                         display: 'flex',
// // // //                                         alignItems: 'center',
// // // //                                         gap: '8px',
// // // //                                         padding: '8px 16px',
// // // //                                         fontSize: '14px',
// // // //                                         fontWeight: 600,
// // // //                                         color: 'white',
// // // //                                         backgroundColor: activePopup === "Deactivate Task" ? '#3b82f6' : '#ef4444',
// // // //                                         border: 'none',
// // // //                                         borderRadius: '4px',
// // // //                                         cursor: 'pointer'
// // // //                                     }}
// // // //                                 >
// // // //                                     {activePopup === "Deactivate Task" ? (
// // // //                                         <>
// // // //                                             <ThumbsDown style={{ width: '16px', height: '16px' }} /> {t('scheduler.submit')}
// // // //                                         </>
// // // //                                     ) : (
// // // //                                         <>
// // // //                                             <Ban style={{ width: '16px', height: '16px' }} /> {t('scheduler.retire')}
// // // //                                         </>
// // // //                                     )}
// // // //                                 </button>
// // // //                                 <button
// // // //                                     onClick={handlePopupClose}
// // // //                                     style={{
// // // //                                         padding: '8px 16px',
// // // //                                         fontSize: '14px',
// // // //                                         fontWeight: 600,
// // // //                                         color: '#374151',
// // // //                                         backgroundColor: 'white',
// // // //                                         border: '1px solid #d1d5db',
// // // //                                         borderRadius: '4px',
// // // //                                         cursor: 'pointer'
// // // //                                     }}
// // // //                                 >
// // // //                                     {t('scheduler.close')}
// // // //                                 </button>
// // // //                             </div>
// // // //                         </div>
// // // //                     }
// // // //                     size="md"
// // // //                 />
// // // //             ) : null}
// // // //         </div>
// // // //     );
// // // // };

// // // // export default ActivatedTask;

// // // import { useState, useMemo, useEffect, useCallback } from 'react';
// // // // import { Eye, ThumbsDown, Ban, Download, Upload, Printer } from 'lucide-react';
// // // import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// // // import { useTranslation } from 'react-i18next';
// // // import { useNavigate } from "react-router-dom";
// // // import Errordialog from '../../../../Layout/Common/Errordialog';
// // // import CustomPopup from '../../../../Layout/Common/Popup';
// // // import PrintTable from '../../../../Layout/Common/PrintTable';
// // // import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';
// // // import servicecall from '../../../../../Services/servicecall';
// // // import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
// // // import { handleExportCommon } from '../../../../Layout/Common/exportService';
// // // import FullPageLoader from '../../../../Layout/Common/FullPageLoader';

// // // const ActivatedTask = ({ navigationData }) => {
// // //     const [schedulerData, setSchedulerData] = useState([]);
// // //     const [selectedScheduler, setSelectedScheduler] = useState(null);
// // //     const [selectedRowId, setSelectedRowId] = useState(0);
// // //     const [loading, setLoading] = useState(true);
// // //     const [loadingText, setLoadingText] = useState(""); // Added for FullPageLoader
// // //     const [infoDialog, setInfoDialog] = useState({
// // //         open: false,
// // //         scheduler: "",
// // //         type: "information"
// // //     });
// // //     const [activePopup, setActivePopup] = useState(null);
// // //     const [auditTrailData, setAuditTrailData] = useState({
// // //         username: "Administrator",
// // //         password: "",
// // //         reason: "",
// // //         comments: ""
// // //     });
// // //     const [importModalOpen, setImportModalOpen] = useState(false);
// // //     const [importFile, setImportFile] = useState(null);
// // //     const [showConfirmDialog, setShowConfirmDialog] = useState(false);
// // //     const [doPrint, setDoPrint] = useState(false);
// // //     const [confirmDialogData, setConfirmDialogData] = useState({
// // //         title: "",
// // //         message: "",
// // //         onConfirm: null,
// // //         actionType: "" // "deactivate" or "retire"
// // //     });
// // //     const { t } = useTranslation('scheduler');

// // //     // API service
// // //     const { postData } = servicecall();

// // //     // Context for navigation
// // //     const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
// // //     const [highlightScheduleId, setHighlightScheduleId] = useState(null);
// // //     const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);
// // //     const navigate = useNavigate();

// // //     // API endpoints
// // //     const endpoints = {
// // //         activeSchedulerViewGrid: "Scheduler/activeSchedulerViewgrid",
// // //         activeSchedulerDeactivate: "Scheduler/ActiveSchedulerDeActiveBtnClick",
// // //         activeSchedulerRetire: "Scheduler/DeactiveSchedulerRetireBtnClick",
// // //         exportData: "basemaster/exportDataFile",
// // //         importScheduler: "Scheduler/importSchedulerDataFile",
// // //         importTemplate: "Scheduler/ImportTemplateFileData",
// // //         checkManualTask: "Scheduler/CheckManualTaskForScheduler",
// // //         viewSchedule: "Scheduler/DataSchedulerSave"
// // //     };

// // //     // Get active user details
// // //     const getActiveUserDetails = useCallback(() => {
// // //         const userDetails = CF_activeUserdetails();
// // //         return userDetails.ActiveUserDetails || {};
// // //     }, []);

// // //     // Prepare API request body
// // //     const prepareRequestBody = useCallback((additionalData = {}) => {
// // //         const baseData = {
// // //             ApplicationCode: "SDMS",
// // //             ActiveUserDetails: getActiveUserDetails(),
// // //             ...additionalData
// // //         };
// // //         return baseData;
// // //     }, [getActiveUserDetails]);

// // //     // Info Dialog Functions
// // //     const showInfoDialog = useCallback((scheduler, type = "information") => {
// // //         setInfoDialog({
// // //             open: true,
// // //             scheduler,
// // //             type
// // //         });
// // //     }, []);

// // //     const closeInfoDialog = useCallback(() => {
// // //         setInfoDialog(prev => ({
// // //             ...prev,
// // //             open: false
// // //         }));
// // //     }, []);

// // //     // Make API call
// // //     const makeApiCall = useCallback(async (url, data, processName) => {
// // //         try {
// // //             const response = await postData(url, data);

// // //             if (!response) {
// // //                 throw new Error('No response from server');
// // //             }

// // //             if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
// // //                 throw new Error(response.Message || response.ErrorMessage || 'API error');
// // //             }

// // //             return response;
// // //         } catch (error) {
// // //             console.error(`${processName} error:`, error);
// // //             showInfoDialog(error.message || `${t('scheduler.apiError')}`, "error");
// // //             throw error;
// // //         }
// // //     }, [postData, t, showInfoDialog]);

// // //     // Fetch activated scheduler data - REMOVED MOCK DATA FALLBACK
// // //     const fetchActivatedSchedulerData = useCallback(async () => {
// // //         setLoading(true);
// // //         setLoadingText(t('scheduler.loading'));
// // //         try {
// // //             // First call: ActiveSchedulerView (initial load)
// // //             const initialRequestData = prepareRequestBody();
// // //             const initialResponse = await makeApiCall(
// // //                 "Scheduler/ActiveSchedulerView", 
// // //                 initialRequestData, 
// // //                 "ActiveSchedulerInitialView"
// // //             );

// // //             // Second call: activeSchedulerViewgrid (grid data)
// // //             const gridRequestData = prepareRequestBody();
// // //             const gridResponse = await makeApiCall(
// // //                 endpoints.activeSchedulerViewGrid, 
// // //                 gridRequestData, 
// // //                 "FetchActivatedSchedulerGrid"
// // //             );

// // //             if (gridResponse && Array.isArray(gridResponse)) {
// // //                 // Transform the API response
// // //                 const transformedData = gridResponse.map(item => ({
// // //                     id: item.L13ScheduleID?.trim() || '',
// // //                     L11InstrumentAliasName: item.L11InstrumentAliasName || item.L11InstrumentName || "",
// // //                     L13ScheduleID: item.L13ScheduleID?.trim() || '',
// // //                     L06ClientName: item.L06ClientName || "",
// // //                     L09FTPAliasName: item.L09FTPAliasName || "",
// // //                     L13LiveArchive: item.L13LiveArchive || false,
// // //                     L13TaskName: item.L13TaskName || "",
// // //                     L13SourcePath: item.L13SourcePath || "",
// // //                     L52TaskCompleted: item.L52TaskCompleted || "",
// // //                     EmpowerStatus: item.EmpowerStatus || "",
// // //                     L13UNCStatus: item.L13UNCStatus || false,
// // //                     TaskStatus: item.TaskStatus || "Activated",
// // //                     ClientStatus: item.ClientStatus || "Active",
// // //                     InstrumentStatus: item.InstrumentStatus || "Active",
// // //                     StartDate: item.StartDate || "",
// // //                     UTCStartDate: item.UTCStartDate || "",
// // //                     EndDate: item.EndDate,
// // //                     UTCEndDate: item.UTCEndDate,
// // //                     TriggerTime: item.TriggerTime || "",
// // //                     UTCTriggerTime: item.UTCTriggerTime || "",
// // //                     ScheduleMode: item.ScheduleMode,
// // //                     NextScheduleDate: item.NextScheduleDate,
// // //                     UTCNextScheduleDate: item.UTCNextScheduleDate,
// // //                     LastScheduleDateTime: item.LastScheduleDateTime || "",
// // //                     UTCLastScheduleDateTime: item.UTCLastScheduleDateTime,
// // //                     CreatedBy: item.CreatedBy || "",
// // //                     CreatedDate: item.CreatedDate || "",
// // //                     UTCCreatedDate: item.UTCCreatedDate || "",
// // //                     ModifiedBy: item.ModifiedBy,
// // //                     ModifiedDate: item.ModifiedDate,
// // //                     UTCModifiedDate: item.UTCModifiedDate,
// // //                     L52TaskID: item.L52TaskID || "",
// // //                     L13TaskID: item.L13ScheduleID?.trim() || ''
// // //                 }));

// // //                 setSchedulerData(transformedData);

// // //                 // If we have a highlight schedule ID, select it
// // //                 if (highlightScheduleId && shouldScrollToSchedule) {
// // //                     const scheduleToSelect = transformedData.find(item => 
// // //                         item.L13ScheduleID === highlightScheduleId
// // //                     );

// // //                     if (scheduleToSelect) {
// // //                         setSelectedScheduler(scheduleToSelect);
// // //                         setSelectedRowId(scheduleToSelect.id);
// // //                     }
// // //                     setShouldScrollToSchedule(false);
// // //                 }
// // //             } else {
// // //                 // No data from API
// // //                 setSchedulerData([]);
// // //             }
// // //         } catch (error) {
// // //             console.error('Failed to fetch scheduler data:', error);
// // //             setSchedulerData([]);
// // //         } finally {
// // //             setLoading(false);
// // //             setLoadingText("");
// // //         }
// // //     }, [makeApiCall, prepareRequestBody, highlightScheduleId, shouldScrollToSchedule, t]);

// // //     // Show custom confirmation dialog
// // //     const showConfirmation = useCallback((title, message, onConfirm, actionType) => {
// // //         setConfirmDialogData({
// // //             title,
// // //             message,
// // //             onConfirm,
// // //             actionType
// // //         });
// // //         setShowConfirmDialog(true);
// // //     }, []);

// // //     // Handle deactivate action
// // //     const handleDeactivateConfirm = useCallback(async () => {
// // //         if (!selectedScheduler) return;

// // //         try {
// // //             // First check for manual tasks
// // //             const checkRequestData = prepareRequestBody({
// // //                 sTaskID: selectedScheduler.L13ScheduleID,
// // //                 sTaskStatus: selectedScheduler.TaskStatus,
// // //                 sPathTaskID: selectedScheduler.L52TaskID
// // //             });

// // //             const checkResponse = await makeApiCall(
// // //                 endpoints.checkManualTask,
// // //                 checkRequestData,
// // //                 "CheckManualTask"
// // //             );

// // //             if (checkResponse && checkResponse.nTaskCount !== undefined) {
// // //                 const alertText = checkResponse.nTaskCount === 1 
// // //                     ? t('scheduler.confirmDeactivate')
// // //                     : t('scheduler.confirmDeactivateWithManual');

// // //                 // Store the selected scheduler data for the audit trail
// // //                 const deactivateData = {
// // //                     sClientName: selectedScheduler.L06ClientName,
// // //                     sTaskID: selectedScheduler.L13ScheduleID,
// // //                     sTaskStatus: selectedScheduler.TaskStatus,
// // //                     sEmpowerStatus: selectedScheduler.EmpowerStatus,
// // //                     sTaskName: selectedScheduler.L13TaskName,
// // //                     sSourcePath: selectedScheduler.L13SourcePath,
// // //                     sPathTaskID: selectedScheduler.L52TaskID
// // //                 };

// // //                 // Show custom confirmation dialog
// // //                 showConfirmation(
// // //                     t('scheduler.confirmation'),
// // //                     alertText,
// // //                     () => {
// // //                         // Check if audit trail is required and show the popup
// // //                         setAuditTrailData(prev => ({
// // //                             ...prev,
// // //                             username: getActiveUserDetails().sUsername || "Administrator"
// // //                         }));

// // //                         // Show the audit trail popup
// // //                         setActivePopup("Deactivate Task");

// // //                         // Store the data for later use
// // //                         sessionStorage.setItem('pendingDeactivateData', JSON.stringify(deactivateData));
// // //                     },
// // //                     "deactivate"
// // //                 );
// // //             }
// // //         } catch (error) {
// // //             console.error('Deactivate check failed:', error);
// // //             showInfoDialog(t('scheduler.deactivateFailed'), "error");
// // //         }
// // //     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, getActiveUserDetails, showConfirmation, showInfoDialog]);

// // //     // Handle retire action
// // //     const handleRetireConfirm = useCallback(async () => {
// // //         if (!selectedScheduler) return;

// // //         try {
// // //             // First check for manual tasks
// // //             const checkRequestData = prepareRequestBody({
// // //                 sTaskID: selectedScheduler.L13ScheduleID,
// // //                 sTaskStatus: selectedScheduler.TaskStatus,
// // //                 sPathTaskID: selectedScheduler.L52TaskID
// // //             });

// // //             const checkResponse = await makeApiCall(
// // //                 endpoints.checkManualTask,
// // //                 checkRequestData,
// // //                 "CheckManualTask"
// // //             );

// // //             if (checkResponse && checkResponse.nTaskCount !== undefined) {
// // //                 const alertText = checkResponse.nTaskCount === 1 
// // //                     ? t('scheduler.confirmRetire')
// // //                     : t('scheduler.confirmRetireWithManual');

// // //                 // Store the selected scheduler data for the audit trail
// // //                 const retireData = {
// // //                     sClientName: selectedScheduler.L06ClientName,
// // //                     sTaskID: selectedScheduler.L13ScheduleID,
// // //                     sTaskStatus: selectedScheduler.TaskStatus,
// // //                     sEmpowerStatus: selectedScheduler.EmpowerStatus,
// // //                     sTaskName: selectedScheduler.L13TaskName,
// // //                     sSourcePath: selectedScheduler.L13SourcePath,
// // //                     sPathTaskID: selectedScheduler.L52TaskID
// // //                 };

// // //                 // Show custom confirmation dialog
// // //                 showConfirmation(
// // //                     t('scheduler.confirmation'),
// // //                     alertText,
// // //                     () => {
// // //                         // Check if audit trail is required
// // //                         setAuditTrailData(prev => ({
// // //                             ...prev,
// // //                             username: getActiveUserDetails().sUsername || "Administrator"
// // //                         }));

// // //                         // Show the audit trail popup
// // //                         setActivePopup("Retire Task");

// // //                         // Store the data for later use
// // //                         sessionStorage.setItem('pendingRetireData', JSON.stringify(retireData));
// // //                     },
// // //                     "retire"
// // //                 );
// // //             }
// // //         } catch (error) {
// // //             console.error('Retire check failed:', error);
// // //             showInfoDialog(t('scheduler.retireFailed'), "error");
// // //         }
// // //     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, getActiveUserDetails, showConfirmation, showInfoDialog]);

// // //     // Add a function to handle the actual deactivate/retire after audit trail
// // //     const handleAuditSubmit = useCallback(async () => {
// // //         if (!auditTrailData.password || !auditTrailData.reason || !auditTrailData.comments) {
// // //             showInfoDialog(t('scheduler.fillAllAuditFields'), "warning");
// // //             return;
// // //         }

// // //         try {
// // //             let endpoint, requestData, pendingDataKey;

// // //             if (activePopup === "Deactivate Task") {
// // //                 endpoint = endpoints.activeSchedulerDeactivate;
// // //                 pendingDataKey = 'pendingDeactivateData';
// // //             } else {
// // //                 endpoint = endpoints.activeSchedulerRetire;
// // //                 pendingDataKey = 'pendingRetireData';
// // //             }

// // //             // Get the stored data
// // //             const storedData = sessionStorage.getItem(pendingDataKey);
// // //             if (!storedData) {
// // //                 showInfoDialog(t('scheduler.noPendingAction'), "error");
// // //                 setActivePopup(null);
// // //                 return;
// // //             }

// // //             const actionData = JSON.parse(storedData);

// // //             // Prepare the full request with audit trail
// // //             const fullRequestData = prepareRequestBody({
// // //                 ...actionData,
// // //                 AuditTrailValues: {
// // //                     sUsername: auditTrailData.username,
// // //                     sPassword: auditTrailData.password,
// // //                     sReason: auditTrailData.reason,
// // //                     sComments: auditTrailData.comments
// // //                 }
// // //             });

// // //             const response = await makeApiCall(
// // //                 endpoint,
// // //                 fullRequestData,
// // //                 activePopup === "Deactivate Task" ? "DeactivateSchedule" : "RetireSchedule"
// // //             );

// // //             // Check if audit trail login failed
// // //             if (response && response.AuditTrailLogin === false) {
// // //                 showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
// // //                 return;
// // //             }

// // //             if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
// // //                 showInfoDialog(
// // //                     activePopup === "Deactivate Task" 
// // //                         ? t('scheduler.taskDeactivatedSuccess') 
// // //                         : t('scheduler.taskRetiredSuccess'), 
// // //                     "success"
// // //                 );

// // //                 // Refresh the data
// // //                 await fetchActivatedSchedulerData();

// // //                 // Clear stored data
// // //                 sessionStorage.removeItem(pendingDataKey);
// // //                 setActivePopup(null);
// // //                 setAuditTrailData({
// // //                     username: getActiveUserDetails().sUsername || "Administrator",
// // //                     password: "",
// // //                     reason: "",
// // //                     comments: ""
// // //                 });
// // //             } else {
// // //                 showInfoDialog(
// // //                     response?.Message || response?.returnMsg || t('scheduler.actionFailed'),
// // //                     "error"
// // //                 );
// // //             }

// // //         } catch (error) {
// // //             console.error('Audit submit failed:', error);
// // //             showInfoDialog(t('scheduler.actionFailed'), "error");
// // //         }
// // //     }, [activePopup, auditTrailData, makeApiCall, prepareRequestBody, t, fetchActivatedSchedulerData, getActiveUserDetails, showInfoDialog]);

// // //     // Update the deactivate and retire click handlers
// // //     const handleDeactivateClick = useCallback(() => {
// // //         if (!selectedScheduler) {
// // //             showInfoDialog(t('scheduler.selectRecord'), "warning");
// // //             return;
// // //         }
// // //         // Show confirmation first, then audit trail if confirmed
// // //         handleDeactivateConfirm();
// // //     }, [selectedScheduler, showInfoDialog, t, handleDeactivateConfirm]);

// // //     const handleRetireClick = useCallback(() => {
// // //         if (!selectedScheduler) {
// // //             showInfoDialog(t('scheduler.selectRecord'), "warning");
// // //             return;
// // //         }
// // //         // Show confirmation first, then audit trail if confirmed
// // //         handleRetireConfirm();
// // //     }, [selectedScheduler, showInfoDialog, t, handleRetireConfirm]);

// // //     // Handle confirm dialog actions
// // //     const handleConfirmDialogClose = useCallback(() => {
// // //         setShowConfirmDialog(false);
// // //         setConfirmDialogData({
// // //             title: "",
// // //             message: "",
// // //             onConfirm: null,
// // //             actionType: ""
// // //         });
// // //     }, []);

// // //     const handleConfirmDialogConfirm = useCallback(() => {
// // //         if (confirmDialogData.onConfirm) {
// // //             confirmDialogData.onConfirm();
// // //         }
// // //         handleConfirmDialogClose();
// // //     }, [confirmDialogData, handleConfirmDialogClose]);

// // //     // Build export request
// // //     const buildExportRequest = useCallback(() => {
// // //         const allRows = schedulerData.map(item => ({
// // //             ...item,
// // //             L13LiveArchive: item.L13LiveArchive ? "✓" : ""
// // //         }));

// // //         const headerDetails = [
// // //             t('label.taskId'),
// // //             t('scheduler.clientName'),
// // //             t('scheduler.storageName'),
// // //             t('scheduler.liveArchive'),
// // //             t('label.taskName'),
// // //             t('label.instrument'),
// // //             t('scheduler.sourcePath'),
// // //             t('scheduler.firstCycleStatus'),
// // //             t('scheduler.empowerStatus'),
// // //             t('scheduler.uncStatus'),
// // //             t('scheduler.taskStatus'),
// // //             t('scheduler.startDate'),
// // //             t('scheduler.endDate'),
// // //             t('scheduler.triggerTime'),
// // //             t('scheduler.scheduleMode'),
// // //             t('scheduler.nextScheduleDateTime'),
// // //             t('scheduler.lastScheduleDateTime'),
// // //             t('scheduler.createdBy'),
// // //             t('scheduler.createdOn'),
// // //             t('scheduler.modifiedBy'),
// // //             t('scheduler.modifiedOn')
// // //         ];

// // //         const allowKeys = [
// // //             "L13ScheduleID",
// // //             "L06ClientName",
// // //             "L09FTPAliasName",
// // //             "L13LiveArchive",
// // //             "L13TaskName",
// // //             "L11InstrumentAliasName",
// // //             "L13SourcePath",
// // //             "L52TaskCompleted",
// // //             "EmpowerStatus",
// // //             "L13UNCStatus",
// // //             "TaskStatus",
// // //             "StartDate",
// // //             "EndDate",
// // //             "TriggerTime",
// // //             "ScheduleMode",
// // //             "NextScheduleDate",
// // //             "LastScheduleDateTime",
// // //             "CreatedBy",
// // //             "CreatedDate",
// // //             "ModifiedBy",
// // //             "ModifiedDate"
// // //         ];

// // //         return {
// // //             sFileName: "ActiveScheduler",
// // //             AllRows: allRows,
// // //             HeaderDetails: headerDetails,
// // //             AllowKeys: allowKeys,
// // //             sBrowserURL: window.location.origin,
// // //             ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
// // //             ApplicationCode: "SDMS"
// // //         };
// // //     }, [schedulerData, t, prepareRequestBody]);

// // //     // Handle export - using the common export service
// // //     const handleExportClick = useCallback(() => {
// // //         if (schedulerData.length === 0) {
// // //             showInfoDialog(t('scheduler.noRecordsToExport'), "warning");
// // //             return;
// // //         }

// // //         handleExportCommon({
// // //             rows: schedulerData,
// // //             buildRequest: buildExportRequest,
// // //             postData,
// // //             setLoading,
// // //             setLoadingText,
// // //             setErrorDialog: ({ open, message, type }) => {
// // //                 showInfoDialog(message, type);
// // //             },
// // //             t
// // //         });
// // //     }, [schedulerData, buildExportRequest, postData, showInfoDialog, t]);

// // //     // Handle print - MODIFIED to match Client page pattern
// // //     const handlePrintClick = useCallback(() => {
// // //         if (!schedulerData || schedulerData.length === 0) {
// // //             showInfoDialog(t('scheduler.selectRecord'), "information");
// // //             return;
// // //         }

// // //         setDoPrint(true);
// // //     }, [schedulerData, showInfoDialog, t]);

// // //     // Build print request - MODIFIED to match Client page pattern
// // //     const buildPrintRequest = useCallback(() => ({
// // //         sModuleName: "Activated Scheduler",
// // //         ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
// // //         ApplicationCode: "SDMS",
// // //     }), [prepareRequestBody]);

// // //     // Handle import file upload
// // //     const handleUploadSubmit = useCallback(async () => {
// // //         if (!importFile) {
// // //             showInfoDialog(t('scheduler.selectFileToUpload'), "warning");
// // //             return;
// // //         }

// // //         try {
// // //             setLoading(true);
// // //             setLoadingText(t('scheduler.uploading'));

// // //             const formData = new FormData();
// // //             formData.append('file', importFile);

// // //             const userDetails = getActiveUserDetails();
// // //             formData.append('sUsername', userDetails.sUsername || '');
// // //             formData.append('sSiteCode', userDetails.sSiteCode || '');
// // //             formData.append('sUserID', userDetails.sUserID || '');
// // //             formData.append('sTimeZoneID', userDetails.sTimeZoneID || '');
// // //             formData.append('ActiveUserDetails', JSON.stringify(userDetails));

// // //             // Use fetch directly for file upload
// // //             const response = await fetch(endpoints.importScheduler, {
// // //                 method: 'POST',
// // //                 body: formData,
// // //                 headers: {
// // //                     'Authorization': localStorage.getItem('token') || ''
// // //                 }
// // //             });

// // //             const data = await response.json();

// // //             if (!data.Rtn) {
// // //                 showInfoDialog(t('scheduler.importFailed'), "error");
// // //             } else if (data.Rtn.toLowerCase() === 'success' || data.Rtn.toLowerCase() === 'partial_success') {
// // //                 if (data.Rtn.toLowerCase() === 'success') {
// // //                     showInfoDialog(t('scheduler.importSuccess'), "success");
// // //                 }

// // //                 // Refresh the data
// // //                 await fetchActivatedSchedulerData();

// // //                 // Handle export data if available
// // //                 if (data.ExportDataViewURL) {
// // //                     const win = window.open(data.ExportDataViewURL, '_blank');
// // //                     if (win) {
// // //                         win.focus();
// // //                     } else {
// // //                         alert(t('scheduler.allowPopups'));
// // //                     }
// // //                 }
// // //             } else {
// // //                 showInfoDialog(data.Message || t('scheduler.importFailed'), "error");
// // //             }

// // //             setImportModalOpen(false);
// // //             setImportFile(null);
// // //         } catch (error) {
// // //             showInfoDialog(t('scheduler.importFailed'), "error");
// // //         } finally {
// // //             setLoading(false);
// // //             setLoadingText("");
// // //         }
// // //     }, [importFile, getActiveUserDetails, fetchActivatedSchedulerData, t, showInfoDialog]);

// // //     // Handle download template
// // //     const handleDownloadTemplate = useCallback(() => {
// // //         const userDetails = getActiveUserDetails();
// // //         const newurl = 'template/Import Schedule.xls'.replaceAll("/", "~");
// // //         const downloadFileURL = `[YOUR_BASE_URL]/Scheduler/ImportTemplateFileData/${userDetails.sSiteCode || ''}/${userDetails.sUserID || ''}/${newurl}`;

// // //         showInfoDialog(t('scheduler.templateDownloadStarted'), "success");

// // //         // Open in new window for download
// // //         const win = window.open(downloadFileURL, '_blank');
// // //         if (win) {
// // //             win.focus();
// // //         } else {
// // //             alert(t('scheduler.allowPopups'));
// // //         }
// // //     }, [getActiveUserDetails, t, showInfoDialog]);

// // //     // MODIFY THIS useEffect TO HANDLE BOTH PROP AND CONTEXT:
// // //     useEffect(() => {
// // //         console.log('=== ActivatedTask useEffect triggered ===');
// // //         console.log('Navigation data from props:', navigationData);
// // //         console.log('Context submission data:', getSubmissionData());

// // //         let scheduleId = null;
// // //         let scheduleData = null;

// // //         // Priority 1: Check props passed from parent (tab system)
// // //         if (navigationData && navigationData.scheduleId) {
// // //             console.log('=== Received navigation data via props ===');
// // //             console.log('Schedule ID:', navigationData.scheduleId);
// // //             scheduleId = navigationData.scheduleId;
// // //             scheduleData = navigationData;
// // //         }
// // //         // Priority 2: Check context (legacy navigation)
// // //         else {
// // //             const submissionData = getSubmissionData();
// // //             console.log('Submission data from context:', submissionData);

// // //             if (submissionData && submissionData.targetTab === 'Activated Task') {
// // //                 console.log('=== Navigating from context to ActivatedTask ===');
// // //                 console.log('Schedule ID:', submissionData.data?.scheduleId);
// // //                 scheduleId = submissionData.data?.scheduleId;
// // //                 scheduleData = submissionData.data;
// // //                 clearNavigation();
// // //             }
// // //         }

// // //         if (scheduleId) {
// // //             setHighlightScheduleId(scheduleId);
// // //             setShouldScrollToSchedule(true);

// // //             // Fetch updated data
// // //             fetchActivatedSchedulerData();
// // //         }
// // //     }, [navigationData, getSubmissionData, clearNavigation, fetchActivatedSchedulerData]);

// // //     // Initial data load
// // //     useEffect(() => {
// // //         fetchActivatedSchedulerData();
// // //     }, []);

// // //     // MODIFY THIS useEffect TO HANDLE HIGHLIGHTING:
// // //     useEffect(() => {
// // //         if (shouldScrollToSchedule && highlightScheduleId && schedulerData.length > 0) {
// // //             // Find the row with the schedule ID
// // //             const scheduleRow = schedulerData.find(item =>
// // //                 item.L13ScheduleID === highlightScheduleId
// // //             );

// // //             if (scheduleRow) {
// // //                 // Select and highlight the row
// // //                 setSelectedScheduler(scheduleRow);
// // //                 setSelectedRowId(scheduleRow.id);

// // //                 // Show success message
// // //                 showInfoDialog(`Schedule ${highlightScheduleId} created successfully and is now activated!`, "success");

// // //                 console.log('Auto-selected schedule:', highlightScheduleId);
// // //             }

// // //             setShouldScrollToSchedule(false);
// // //         }
// // //     }, [schedulerData, highlightScheduleId, shouldScrollToSchedule, showInfoDialog]);

// // //     const handleRowSelect = useCallback((row) => {
// // //         setSelectedScheduler(row);
// // //         setSelectedRowId(row.id);
// // //     }, []);

// // //     // MODIFIED handleViewClick (remove navigate since no router):
// // //     const handleViewClick = useCallback(() => {
// // //         if (!selectedScheduler) {
// // //             showInfoDialog(t('scheduler.selectRecordToView'), "warning");
// // //             return;
// // //         }
// // //         // In tab system, you might want to switch to edit tab or show modal
// // //         showInfoDialog(`Viewing schedule ${selectedScheduler.L13ScheduleID}`, "information");
// // //     }, [selectedScheduler, showInfoDialog, t]);

// // //     const handleImportClick = useCallback(() => {
// // //         setImportModalOpen(true);
// // //     }, []);

// // //     const handlePopupClose = useCallback(() => {
// // //         setActivePopup(null);
// // //         setImportModalOpen(false);
// // //         setAuditTrailData({
// // //             username: "Administrator",
// // //             password: "",
// // //             reason: "",
// // //             comments: ""
// // //         });
// // //     }, []);

// // //     const handleFileChange = useCallback((e) => {
// // //         const file = e.target.files[0];
// // //         if (file) {
// // //             const fileExtension = file.name.split('.').pop().toLowerCase();
// // //             if (['xls', 'xlsx'].includes(fileExtension)) {
// // //                 setImportFile(file);
// // //             } else {
// // //                 showInfoDialog(t('scheduler.invalidFileType'), "error");
// // //                 e.target.value = '';
// // //             }
// // //         }
// // //     }, [showInfoDialog, t]);

// // //     const columns = useMemo(() => [
// // //         {
// // //             key: 'L11InstrumentAliasName',
// // //             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('label.instrument')}</span>,
// // //             width: 150,
// // //             enableSearch: true,
// // //             render: (row, isSelected) => (
// // //                 <div 
// // //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
// // //                     onClick={() => handleRowSelect(row)}
// // //                 >
// // //                     {row.L11InstrumentAliasName}
// // //                 </div>
// // //             )
// // //         },
// // //         {
// // //             key: 'L13ScheduleID',
// // //             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('label.taskId')}</span>,
// // //             width: 110,
// // //             enableSearch: true,
// // //             render: (row, isSelected) => (
// // //                 <div 
// // //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
// // //                     onClick={() => handleRowSelect(row)}
// // //                 >
// // //                     {row.L13ScheduleID}
// // //                 </div>
// // //             )
// // //         },
// // //         {
// // //             key: 'L06ClientName',
// // //             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('scheduler.clientName')}</span>,
// // //             width: 130,
// // //             enableSearch: true,
// // //             render: (row, isSelected) => (
// // //                 <div 
// // //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
// // //                     onClick={() => handleRowSelect(row)}
// // //                 >
// // //                     {row.L06ClientName}
// // //                 </div>
// // //             )
// // //         },
// // //         {
// // //             key: 'L09FTPAliasName',
// // //             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('scheduler.storageName')}</span>,
// // //             width: 140,
// // //             enableSearch: true,
// // //             render: (row, isSelected) => (
// // //                 <div 
// // //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
// // //                     onClick={() => handleRowSelect(row)}
// // //                 >
// // //                     {row.L09FTPAliasName}
// // //                 </div>
// // //             )
// // //         },
// // //         {
// // //             key: 'L13LiveArchive',
// // //             label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('scheduler.liveArchive')}</span>,
// // //             width: 140,
// // //             enableSearch: true,
// // //             render: (row, isSelected) => (
// // //                 <div 
// // //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer text-center ${isSelected ? 'font-bold' : ''}`}
// // //                     onClick={() => handleRowSelect(row)}
// // //                 >
// // //                     {row.L13LiveArchive ? "✓" : ""}
// // //                 </div>
// // //             )
// // //         }
// // //     ], [t, handleRowSelect]);

// // //     const renderSchedulerDetail = useCallback((scheduler) => (
// // //         <div className="space-y-2">
// // //             <DetailRow label={t('label.taskName')} value={scheduler.L13TaskName} />
// // //             <DetailRow label={t('scheduler.sourcepath')} value={scheduler.L13SourcePath} />
// // //             <DetailRow label={t('scheduler.firstCycleStatus')} value={scheduler.L52TaskCompleted} />
// // //             <DetailRow label={t('scheduler.empowerStatus')} value={scheduler.EmpowerStatus} />
// // //             <DetailRow label={t('scheduler.uncStatus')} value={scheduler.L13UNCStatus ? t('button.yes') : t('button.no')} />
// // //             <DetailRow label={t('scheduler.taskStatus')} value={scheduler.TaskStatus} />
// // //             <DetailRow label={t('scheduler.clientstatus')} value={scheduler.ClientStatus} />
// // //             <DetailRow label={t('scheduler.instrumentstatus')} value={scheduler.InstrumentStatus} />
// // //             <DetailRow label={t('scheduler.startDate')} value={scheduler.StartDate} />
// // //             <DetailRow label={t('scheduler.endDate')} value={scheduler.EndDate || t('scheduler.notSet')} />
// // //             <DetailRow label={t('scheduler.triggerTime')} value={scheduler.TriggerTime} />
// // //             <DetailRow label={t('scheduler.scheduleMode')} value={scheduler.ScheduleMode || t('scheduler.notSet')} />
// // //             <DetailRow label={t('scheduler.nextScheduleDateTime')} value={scheduler.NextScheduleDate || t('scheduler.notSet')} />
// // //             <DetailRow label={t('scheduler.lastScheduleDateTime')} value={scheduler.LastScheduleDateTime || t('scheduler.notSet')} />
// // //             <DetailRow label={t('label.createdBy')} value={scheduler.CreatedBy} />
// // //             <DetailRow label={t('label.createdOn')} value={scheduler.CreatedDate} />
// // //             <DetailRow label={t('label.modifiedBy')} value={scheduler.ModifiedBy || t('scheduler.notSet')} />
// // //             <DetailRow label={t('label.modifiedOn')} value={scheduler.ModifiedDate || t('scheduler.notSet')} />
// // //         </div>
// // //     ), [t]);

// // //     const DetailRow = ({ label, value }) => (
// // //         <div className="grid grid-cols-2 gap-4">
// // //             <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
// // //                 {label}
// // //             </div>
// // //             <div className="font-bold text-[12px] text-[#353f49] font-roboto">
// // //                 {value || "-"}
// // //             </div>
// // //         </div>
// // //     );

// // //     const ActionButton = ({ iconClass, label, disabled, onClick, variant = "default" }) => (
// // //         <button
// // //             onClick={onClick}
// // //             disabled={disabled}
// // //             className={`
// // //                 flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none 
// // //                 transition-all duration-200 whitespace-nowrap hover:scale-[0.98] hover:opacity-90
// // //                 ${disabled 
// // //                     ? variant === 'primary'
// // //                     ? 'bg-[#f0f2f5] text-white cursor-not-allowed'
// // //                     : 'bg-[#f0f2f5] text-[#2883fe] cursor-not-allowed'
// // //                     : variant === 'primary'
// // //                         ? 'bg-[#f0f2f5] text-white hover:bg-blue-700'
// // //                         : variant === 'danger'
// // //                             ? 'bg-red-500 text-white hover:bg-red-600'
// // //                             : 'bg-[#f0f2f5] text-[#2883fe] hover:bg-gray-100'
// // //                 }
// // //             `}
// // //         >
// // //             {iconClass && <i className={iconClass}></i>}
// // //             <span>{label}</span>
// // //         </button>
// // //     );

// // //     return (
// // //         <div className="flex flex-col font-roboto bg-white w-full h-[80vh] overflow-hidden relative">
// // //             {/* Error/Info Dialog */}
// // //             {infoDialog.open && (
// // //                 <Errordialog
// // //                     scheduler={infoDialog.scheduler}
// // //                     type={infoDialog.type}
// // //                     onClose={closeInfoDialog}
// // //                 />
// // //             )}

// // //             {/* Confirmation Dialog */}
// // //             {showConfirmDialog && (
// // //                 <Errordialog
// // //                     scheduler={confirmDialogData.message}
// // //                     type="confirmation"
// // //                     onClose={handleConfirmDialogClose}
// // //                     onConfirm={handleConfirmDialogConfirm}
// // //                     okText={t('button.yes')}
// // //                     cancelText={t('button.no')}
// // //                 />
// // //             )}

// // //             {/* FullPageLoader */}
// // //             <FullPageLoader loading={loading} text={loadingText} />

// // //             {/* Top Action Buttons */}
// // //             <div className="flex justify-end pr-5 gap-2 pt-3">
// // //                 <ActionButton
// // //                     iconClass="fa fa-eye"
// // //                     label={t('button.view')}
// // //                     onClick={handleViewClick}
// // //                     disabled={!selectedScheduler}
// // //                 />
// // //                 <ActionButton
// // //                     iconClass="glyphicon glyphicon-thumbs-down"
// // //                     label={t('button.deactivate')}
// // //                     onClick={handleDeactivateClick}
// // //                     disabled={!selectedScheduler}
// // //                 />
// // //                 <ActionButton
// // //                     iconClass="fa fa-ban"
// // //                     label={t('button.retire')}
// // //                     onClick={handleRetireClick}
// // //                     disabled={!selectedScheduler}
// // //                 />
// // //                 <ActionButton
// // //                     iconClass="glyphicon glyphicon-export"
// // //                     label={t('button.export')}
// // //                     onClick={handleExportClick}
// // //                 />
// // //                 <ActionButton
// // //                     iconClass="glyphicon glyphicon-import"
// // //                     label={t('button.import')}
// // //                     onClick={handleImportClick}
// // //                 />
// // //                 <ActionButton
// // //                     iconClass="glyphicon glyphicon-print"
// // //                     label={t('button.print')}
// // //                     onClick={handlePrintClick}
// // //                 />
// // //             </div>

// // //             {/* Main GridLayout with Details Panel - FIXED HEIGHT */}
// // //             <div className="flex-1 overflow-hidden p-1 ">
// // //                 <GridLayout
// // //                     columns={columns}
// // //                     height="100%"
// // //                     detailPanelWidth="46%"
// // //                     data={schedulerData}
// // //                     getRowId={(row) => row.id}
// // //                     renderDetailPanel={renderSchedulerDetail}
// // //                     onRowClick={handleRowSelect}
// // //                     rowClassName={(row) =>
// // //                         row.id === selectedRowId
// // //                             ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
// // //                             : ""
// // //                     }
// // //                 />
// // //             </div>

// // //             {/* Print Component - SIMPLIFIED like Client page */}
// // //             {doPrint && (
// // //                 <PrintTable
// // //                     columns={[
// // //                         { key: 'L13ScheduleID', label: t('label.taskId') },
// // //                         { key: 'L06ClientName', label: t('scheduler.clientName') },
// // //                         { key: 'L09FTPAliasName', label: t('scheduler.storageName') },
// // //                         { key: 'L13LiveArchive', label: t('scheduler.liveArchive'), 
// // //                           render: (value) => value ? "✓" : "" },
// // //                         { key: 'L13TaskName', label: t('label.taskName') },
// // //                         { key: 'L11InstrumentAliasName', label: t('label.instrument') },
// // //                         { key: 'L13SourcePath', label: t('scheduler.sourcePath') },
// // //                         { key: 'L52TaskCompleted', label: t('scheduler.firstCycleStatus') },
// // //                         { key: 'EmpowerStatus', label: t('scheduler.empowerStatus') },
// // //                         { key: 'L13UNCStatus', label: t('scheduler.uncStatus'), 
// // //                           render: (value) => value ? t('button.yes') : t('button.no') },
// // //                         { key: 'TaskStatus', label: t('scheduler.taskStatus') },
// // //                         { key: 'StartDate', label: t('scheduler.startDate') },
// // //                         { key: 'EndDate', label: t('scheduler.endDate') },
// // //                         { key: 'TriggerTime', label: t('scheduler.triggerTime') },
// // //                         { key: 'ScheduleMode', label: t('scheduler.scheduleMode') },
// // //                         { key: 'NextScheduleDate', label: t('scheduler.nextScheduleDateTime') },
// // //                         { key: 'LastScheduleDateTime', label: t('scheduler.lastScheduleDateTime') },
// // //                         { key: 'CreatedBy', label: t('label.createdBy') },
// // //                         { key: 'CreatedDate', label: t('label.createdOn') },
// // //                         { key: 'ModifiedBy', label: t('label.modifiedBy') },
// // //                         { key: 'ModifiedDate', label: t('label.modifiedOn') }
// // //                     ]}
// // //                     rows={schedulerData}
// // //                     title={t('scheduler.activatedScheduler')}
// // //                     subtitle=""
// // //                     printRequest={buildPrintRequest()}
// // //                     onDone={() => setDoPrint(false)}
// // //                 />
// // //             )}

// // //             {/* Import Modal */}
// // //             {importModalOpen && (
// // //                 <CustomPopup
// // //                     isOpen={importModalOpen}
// // //                     onClose={handlePopupClose}
// // //                     title={t('scheduler.importSchedule')}
// // //                     content={
// // //                         <div className="flex flex-col gap-4 p-2">
// // //                             <div className="flex flex-col gap-1">
// // //                                 <label className="text-sm font-semibold text-gray-700">
// // //                                     {t('scheduler.file')} <span className="text-red-500">*</span>
// // //                                 </label>
// // //                                 <input
// // //                                     type="file"
// // //                                     onChange={handleFileChange}
// // //                                     accept=".xlsx,.xls"
// // //                                     className="w-full p-2 text-sm border border-gray-300 rounded outline-none"
// // //                                 />
// // //                                 <div className="text-xs text-gray-500">
// // //                                     {t('scheduler.activeNoteBrowseUploadXlsAndXlxs')}
// // //                                 </div>
// // //                             </div>

// // //                             <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
// // //                                 <button
// // //                                     onClick={handleDownloadTemplate}
// // //                                     className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 border-none rounded cursor-pointer hover:bg-blue-700"
// // //                                 >
// // //                                     <i className="fa fa-download"></i> {t('scheduler.getImportTemplate')}
// // //                                 </button>
// // //                                 <button
// // //                                     onClick={handleUploadSubmit}
// // //                                     className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-white bg-green-500 border-none rounded cursor-pointer hover:bg-green-600"
// // //                                 >
// // //                                     <i className="fa fa-upload"></i> {t('scheduler.upload')}
// // //                                 </button>
// // //                             </div>
// // //                         </div>
// // //                     }
// // //                     size="md"
// // //                 />
// // //             )}

// // //             {/* Deactivate/Retire Popup */}
// // //             {activePopup === "Deactivate Task" || activePopup === "Retire Task" ? (
// // //                 <CustomPopup
// // //                     isOpen={!!activePopup}
// // //                     onClose={handlePopupClose}
// // //                     title={activePopup === "Deactivate Task" ? t('scheduler.deactivateTask') : t('scheduler.retireTask')}
// // //                     content={
// // //                         <div className="flex flex-col gap-4 p-2">
// // //                             {/* Audit trail form */}
// // //                             <div className="flex flex-col gap-1">
// // //                                 <label className="text-sm font-semibold text-gray-700">
// // //                                     {t('scheduler.username')} <span className="text-red-500">*</span>
// // //                                 </label>
// // //                                 <input
// // //                                     type="text"
// // //                                     value={auditTrailData.username}
// // //                                     disabled
// // //                                     className="w-full p-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded"
// // //                                 />
// // //                             </div>

// // //                             <div className="flex flex-col gap-1">
// // //                                 <label className="text-sm font-semibold text-gray-700">
// // //                                     {t('scheduler.password')} <span className="text-red-500">*</span>
// // //                                 </label>
// // //                                 <input
// // //                                     type="password"
// // //                                     value={auditTrailData.password}
// // //                                     onChange={(e) => setAuditTrailData(prev => ({ ...prev, password: e.target.value }))}
// // //                                     className="w-full p-2 text-sm border border-gray-300 rounded outline-none"
// // //                                     placeholder={t('scheduler.enterPassword')}
// // //                                 />
// // //                             </div>

// // //                             <div className="flex flex-col gap-1">
// // //                                 <label className="text-sm font-semibold text-gray-700">
// // //                                     {t('scheduler.reason')} <span className="text-red-500">*</span>
// // //                                 </label>
// // //                                 <select
// // //                                     value={auditTrailData.reason}
// // //                                     onChange={(e) => setAuditTrailData(prev => ({ ...prev, reason: e.target.value }))}
// // //                                     className="w-full p-2 text-sm border border-gray-300 rounded outline-none"
// // //                                 >
// // //                                     <option value="">{t('scheduler.selectReason')}</option>
// // //                                     {activePopup === "Deactivate Task" ? (
// // //                                         <>
// // //                                             <option value="Deactivated">{t('scheduler.deactivated')}</option>
// // //                                             <option value="Modified">{t('scheduler.modified')}</option>
// // //                                         </>
// // //                                     ) : (
// // //                                         <>
// // //                                             <option value="Retired">{t('scheduler.retired')}</option>
// // //                                             <option value="Decommissioned">{t('scheduler.decommissioned')}</option>
// // //                                             <option value="Replaced">{t('scheduler.replaced')}</option>
// // //                                         </>
// // //                                     )}
// // //                                 </select>
// // //                             </div>

// // //                             <div className="flex flex-col gap-1">
// // //                                 <label className="text-sm font-semibold text-gray-700">
// // //                                     {t('scheduler.comments')} <span className="text-red-500">*</span>
// // //                                 </label>
// // //                                 <textarea
// // //                                     rows={3}
// // //                                     value={auditTrailData.comments}
// // //                                     onChange={(e) => setAuditTrailData(prev => ({ ...prev, comments: e.target.value }))}
// // //                                     className="w-full p-2 text-sm border border-gray-300 rounded outline-none resize-none"
// // //                                     placeholder={t('scheduler.enterComments')}
// // //                                 />
// // //                             </div>

// // //                             <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
// // //                                 <button
// // //                                     onClick={handleAuditSubmit}
// // //                                     className={`flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-white border-none rounded cursor-pointer ${
// // //                                         activePopup === "Deactivate Task" ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
// // //                                     }`}
// // //                                 >
// // //                                     {activePopup === "Deactivate Task" ? (
// // //                                         <>
// // //                                             <i className="glyphicon glyphicon-thumbs-down"></i> {t('scheduler.submit')}
// // //                                         </>
// // //                                     ) : (
// // //                                         <>
// // //                                             <i className="fa fa-ban"></i> {t('scheduler.retire')}
// // //                                         </>
// // //                                     )}
// // //                                 </button>
// // //                                 <button
// // //                                     onClick={handlePopupClose}
// // //                                     className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
// // //                                 >
// // //                                     {t('scheduler.close')}
// // //                                 </button>
// // //                             </div>
// // //                         </div>
// // //                     }
// // //                     size="md"
// // //                 />
// // //             ) : null}
// // //         </div>
// // //     );
// // // };

// // // export default ActivatedTask;


// // // Athira -------------------------------------------------------------------------------------
// // import { useState, useMemo, useEffect, useCallback } from 'react';
// // import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// // import { useTranslation } from 'react-i18next';
// // import Errordialog from '../../../../Layout/Common/Errordialog';
// // import CustomPopup from '../../../../Layout/Common/Popup';
// // import PrintTable from '../../../../Layout/Common/PrintTable';
// // import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';
// // import servicecall from '../../../../../Services/servicecall';
// // import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
// // import { handleExportCommon } from '../../../../Layout/Common/exportService';
// // import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
// // import AuditTrail from '../../../../Layout/Common/AuditTrail';

// // const ActivatedTask = ({ navigationData, onClearNavigation, onNavigateAway }) => {

// //     const [schedulerData, setSchedulerData] = useState([]);
// //     const [selectedScheduler, setSelectedScheduler] = useState(null);
// //     const [selectedRowId, setSelectedRowId] = useState(0);
// //     const [loading, setLoading] = useState(true);
// //     const [loadingText, setLoadingText] = useState("");
// //     const [infoDialog, setInfoDialog] = useState({
// //         open: false,
// //         message: "",
// //         type: "information"
// //     });
// //     const [activePopup, setActivePopup] = useState(null);
// //     const [auditTrailData, setAuditTrailData] = useState({
// //         username: "Administrator",
// //         password: "",
// //         reason: "",
// //         comments: ""
// //     });
// //     const [importModalOpen, setImportModalOpen] = useState(false);
// //     const [importFile, setImportFile] = useState(null);
// //     const [showConfirmDialog, setShowConfirmDialog] = useState(false);
// //     const [doPrint, setDoPrint] = useState(false);

// //     // Fix 1: Get all needed functions from SchedulerNavigationContext
// //     const { navigateToDataScheduler, navigateToTab } = useSchedulerNavigation();


// //     const [confirmDialogData, setConfirmDialogData] = useState({
// //         title: "",
// //         message: "",
// //         onConfirm: null,
// //         actionType: ""
// //     });
// //     const { t } = useTranslation('scheduler');

// //     // Audit trail state
// //     const [showAudit, setShowAudit] = useState(false);
// //     const [pendingAction, setPendingAction] = useState(null);
// //     const [pendingActionData, setPendingActionData] = useState(null);
// //     const [auditTrailRights, setAuditTrailRights] = useState({
// //         deactivate: 0,
// //         retire: 0
// //     });

// //     const { postData } = servicecall();
// //     const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
// //     const [highlightScheduleId, setHighlightScheduleId] = useState(null);
// //     const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);

// //     const endpoints = {
// //         activeSchedulerViewGrid: "Scheduler/activeSchedulerViewgrid",
// //         activeSchedulerDeactivate: "Scheduler/ActiveSchedulerDeActiveBtnClick",
// //         activeSchedulerRetire: "Scheduler/DeactiveSchedulerRetireBtnClick",
// //         exportData: "basemaster/exportDataFile",
// //         importScheduler: "Scheduler/importSchedulerDataFile",
// //         importTemplate: "Scheduler/ImportTemplateFileData",
// //         checkManualTask: "Scheduler/CheckManualTaskForScheduler",
// //         viewSchedule: "Scheduler/DataSchedulerSave"
// //     };

// //     // Get active user details
// //     const getActiveUserDetails = useCallback(() => {
// //         const userDetails = CF_activeUserdetails();
// //         return userDetails.ActiveUserDetails || {};
// //     }, []);

// //     // Prepare API request body
// //     const prepareRequestBody = useCallback((additionalData = {}) => {
// //         const baseData = {
// //             ApplicationCode: "SDMS",
// //             ActiveUserDetails: getActiveUserDetails(),
// //             ...additionalData
// //         };
// //         return baseData;
// //     }, [getActiveUserDetails]);

// //     // Info Dialog Functions
// //     const showInfoDialog = useCallback((message, type = "information") => {
// //         setInfoDialog({
// //             open: true,
// //             message,
// //             type
// //         });
// //     }, []);

// //     const closeInfoDialog = useCallback(() => {
// //         setInfoDialog(prev => ({
// //             ...prev,
// //             open: false
// //         }));
// //     }, []);

// //     // Make API call
// //     const makeApiCall = useCallback(async (url, data, processName) => {
// //         try {
// //             const response = await postData(url, data);

// //             if (!response) {
// //                 throw new Error('No response from server');
// //             }

// //             if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
// //                 throw new Error(response.Message || response.ErrorMessage || 'API error');
// //             }

// //             return response;
// //         } catch (error) {
// //             console.error(`${processName} error:`, error);
// //             showInfoDialog(error.message || `${t('scheduler.apiError')}`, "error");
// //             throw error;
// //         }
// //     }, [postData, t, showInfoDialog]);

// //     // Fetch activated scheduler data
// //     // Fetch activated scheduler data
// //     const fetchActivatedSchedulerData = useCallback(async () => {
// //         setLoading(true);
// //         setLoadingText(t('common.loading'));
// //         try {
// //             const initialRequestData = prepareRequestBody();
// //             const initialResponse = await makeApiCall(
// //                 "Scheduler/ActiveSchedulerView",
// //                 initialRequestData,
// //                 "ActiveSchedulerInitialView"
// //             );

// //             const gridRequestData = prepareRequestBody();
// //             const gridResponse = await makeApiCall(
// //                 endpoints.activeSchedulerViewGrid,
// //                 gridRequestData,
// //                 "FetchActivatedSchedulerGrid"
// //             );

// //             if (gridResponse && Array.isArray(gridResponse)) {
// //                 const transformedData = gridResponse.map(item => ({
// //                     id: item.L13ScheduleID?.trim() || '',
// //                     L11InstrumentAliasName: item.L11InstrumentAliasName || item.L11InstrumentName || "",
// //                     L13ScheduleID: item.L13ScheduleID?.trim() || '',
// //                     L06ClientName: item.L06ClientName || "",
// //                     L09FTPAliasName: item.L09FTPAliasName || "",
// //                     L13LiveArchive: item.L13LiveArchive || false,
// //                     L13TaskName: item.L13TaskName || "",
// //                     L13SourcePath: item.L13SourcePath || "",
// //                     L52TaskCompleted: item.L52TaskCompleted || "",
// //                     EmpowerStatus: item.EmpowerStatus || "",
// //                     L13UNCStatus: item.L13UNCStatus || false,
// //                     TaskStatus: item.TaskStatus || "Activated",
// //                     ClientStatus: item.ClientStatus || "Active",
// //                     InstrumentStatus: item.InstrumentStatus || "Active",
// //                     StartDate: item.StartDate || "",
// //                     UTCStartDate: item.UTCStartDate || "",
// //                     EndDate: item.EndDate,
// //                     UTCEndDate: item.UTCEndDate,
// //                     TriggerTime: item.TriggerTime || "",
// //                     UTCTriggerTime: item.UTCTriggerTime || "",
// //                     ScheduleMode: item.ScheduleMode,
// //                     NextScheduleDate: item.NextScheduleDate,
// //                     UTCNextScheduleDate: item.UTCNextScheduleDate,
// //                     LastScheduleDateTime: item.LastScheduleDateTime || "",
// //                     UTCLastScheduleDateTime: item.UTCLastScheduleDateTime,
// //                     CreatedBy: item.CreatedBy || "",
// //                     CreatedDate: item.CreatedDate || "",
// //                     UTCCreatedDate: item.UTCCreatedDate || "",
// //                     ModifiedBy: item.ModifiedBy,
// //                     ModifiedDate: item.ModifiedDate,
// //                     UTCModifiedDate: item.UTCModifiedDate,
// //                     L52TaskID: item.L52TaskID || "",
// //                     L13TaskID: item.L13ScheduleID?.trim() || ''
// //                 }));

// //                 setSchedulerData(transformedData);

// //                 // Auto-select the first row if data exists
// //                 if (transformedData.length > 0 && !highlightScheduleId) {
// //                     const firstRow = transformedData[0];
// //                     setSelectedScheduler(firstRow);
// //                     setSelectedRowId(firstRow.id);
// //                     console.log('Auto-selected first row:', firstRow.id);
// //                 }

// //                 // Handle navigation highlighting if applicable
// //                 if (highlightScheduleId && shouldScrollToSchedule) {
// //                     const scheduleToSelect = transformedData.find(item =>
// //                         item.L13ScheduleID === highlightScheduleId
// //                     );

// //                     if (scheduleToSelect) {
// //                         setSelectedScheduler(scheduleToSelect);
// //                         setSelectedRowId(scheduleToSelect.id);
// //                     }
// //                     setShouldScrollToSchedule(false);
// //                 }
// //             } else {
// //                 setSchedulerData([]);
// //                 // Clear selections if no data
// //                 setSelectedScheduler(null);
// //                 setSelectedRowId(0);
// //             }
// //         } catch (error) {
// //             console.error('Failed to fetch scheduler data:', error);
// //             setSchedulerData([]);
// //             setSelectedScheduler(null);
// //             setSelectedRowId(0);
// //         } finally {
// //             setLoading(false);
// //             setLoadingText("");
// //         }
// //     }, [makeApiCall, prepareRequestBody, highlightScheduleId, shouldScrollToSchedule, t]);

// //     // Show custom confirmation dialog
// //     const showConfirmation = useCallback((title, message, onConfirm, actionType) => {
// //         setConfirmDialogData({
// //             title,
// //             message,
// //             onConfirm,
// //             actionType
// //         });
// //         setShowConfirmDialog(true);
// //     }, []);

// //     // Handle deactivate action
// //     const handleDeactivateConfirm = useCallback(async () => {
// //         if (!selectedScheduler) return;

// //         try {
// //             const checkRequestData = prepareRequestBody({
// //                 sTaskID: selectedScheduler.L13ScheduleID,
// //                 sTaskStatus: selectedScheduler.TaskStatus,
// //                 sPathTaskID: selectedScheduler.L52TaskID
// //             });

// //             const checkResponse = await makeApiCall(
// //                 endpoints.checkManualTask,
// //                 checkRequestData,
// //                 "CheckManualTask"
// //             );

// //             if (checkResponse && checkResponse.nTaskCount !== undefined) {
// //                 const alertText = checkResponse.nTaskCount === 1
// //                     ? t('scheduler.confirmDeactivate')
// //                     : t('scheduler.confirmDeactivateWithManual');

// //                 const deactivateData = {
// //                     sClientName: selectedScheduler.L06ClientName,
// //                     sTaskID: selectedScheduler.L13ScheduleID,
// //                     sTaskStatus: selectedScheduler.TaskStatus,
// //                     sEmpowerStatus: selectedScheduler.EmpowerStatus,
// //                     sTaskName: selectedScheduler.L13TaskName,
// //                     sSourcePath: selectedScheduler.L13SourcePath,
// //                     sPathTaskID: selectedScheduler.L52TaskID
// //                 };

// //                 // Show custom confirmation dialog
// //                 showConfirmation(
// //                     t('scheduler.confirmation'),
// //                     alertText,
// //                     () => {
// //                         // Check audit trail rights
// //                         if (auditTrailRights.deactivate === 1) {
// //                             // Store action data and show audit trail
// //                             setPendingAction('deactivate');
// //                             setPendingActionData(deactivateData);
// //                             setShowAudit(true);
// //                         } else {
// //                             // No audit trail required, proceed directly
// //                             executeDeactivate(deactivateData);
// //                         }
// //                     },
// //                     "deactivate"
// //                 );
// //             }
// //         } catch (error) {
// //             console.error('Deactivate check failed:', error);
// //             showInfoDialog(t('scheduler.deactivateFailed'), "error");
// //         }
// //     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, showConfirmation, showInfoDialog, auditTrailRights.deactivate]);

// //     // Handle retire action
// //     const handleRetireConfirm = useCallback(async () => {
// //         if (!selectedScheduler) return;

// //         try {
// //             const checkRequestData = prepareRequestBody({
// //                 sTaskID: selectedScheduler.L13ScheduleID,
// //                 sTaskStatus: selectedScheduler.TaskStatus,
// //                 sPathTaskID: selectedScheduler.L52TaskID
// //             });

// //             const checkResponse = await makeApiCall(
// //                 endpoints.checkManualTask,
// //                 checkRequestData,
// //                 "CheckManualTask"
// //             );

// //             if (checkResponse && checkResponse.nTaskCount !== undefined) {
// //                 const alertText = checkResponse.nTaskCount === 1
// //                     ? t('scheduler.confirmRetire')
// //                     : t('scheduler.confirmRetireWithManual');

// //                 const retireData = {
// //                     sClientName: selectedScheduler.L06ClientName,
// //                     sTaskID: selectedScheduler.L13ScheduleID,
// //                     sTaskStatus: selectedScheduler.TaskStatus,
// //                     sEmpowerStatus: selectedScheduler.EmpowerStatus,
// //                     sTaskName: selectedScheduler.L13TaskName,
// //                     sSourcePath: selectedScheduler.L13SourcePath,
// //                     sPathTaskID: selectedScheduler.L52TaskID
// //                 };

// //                 showConfirmation(
// //                     t('scheduler.confirmation'),
// //                     alertText,
// //                     () => {
// //                         // Check audit trail rights
// //                         if (auditTrailRights.retire === 1) {
// //                             setPendingAction('retire');
// //                             setPendingActionData(retireData);
// //                             setShowAudit(true);
// //                         } else {
// //                             executeRetire(retireData);
// //                         }
// //                     },
// //                     "retire"
// //                 );
// //             }
// //         } catch (error) {
// //             console.error('Retire check failed:', error);
// //             showInfoDialog(t('scheduler.retireFailed'), "error");
// //         }
// //     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, showConfirmation, showInfoDialog, auditTrailRights.retire]);

// //     // Execute deactivate after audit or directly
// //     const executeDeactivate = useCallback(async (actionData, auditTrailValues = null) => {
// //         try {
// //             const fullRequestData = prepareRequestBody({
// //                 ...actionData,
// //                 ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
// //             });

// //             const response = await makeApiCall(
// //                 endpoints.activeSchedulerDeactivate,
// //                 fullRequestData,
// //                 "DeactivateSchedule"
// //             );

// //             // Check audit trail login
// //             if (response && response.AuditTrailLogin === false) {
// //                 showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
// //                 return;
// //             }

// //             if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
// //                 showInfoDialog(t('scheduler.taskDeactivatedSuccess'), "success");
// //                 await fetchActivatedSchedulerData();
// //             } else {
// //                 showInfoDialog(
// //                     response?.Message || response?.returnMsg || t('scheduler.actionFailed'),
// //                     "error"
// //                 );
// //             }
// //         } catch (error) {
// //             console.error('Deactivate failed:', error);
// //             showInfoDialog(t('scheduler.deactivateFailed'), "error");
// //         }
// //     }, [makeApiCall, prepareRequestBody, t, fetchActivatedSchedulerData, showInfoDialog]);

// //     // Execute retire after audit or directly
// //     const executeRetire = useCallback(async (actionData, auditTrailValues = null) => {
// //         try {
// //             const fullRequestData = prepareRequestBody({
// //                 ...actionData,
// //                 ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
// //             });

// //             const response = await makeApiCall(
// //                 endpoints.activeSchedulerRetire,
// //                 fullRequestData,
// //                 "RetireSchedule"
// //             );

// //             // Check audit trail login
// //             if (response && response.AuditTrailLogin === false) {
// //                 showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
// //                 return;
// //             }

// //             if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
// //                 showInfoDialog(t('scheduler.taskRetiredSuccess'), "success");

// //                 // Check for path locked error
// //                 if (response.returnMsg && response.returnMsg.includes("already locked")) {
// //                     showInfoDialog(response.returnMsg, "warning");
// //                 } else {
// //                     await fetchActivatedSchedulerData();
// //                 }
// //             } else if (response && response.returnMsg) {
// //                 showInfoDialog(response.returnMsg, "error");
// //             } else {
// //                 showInfoDialog(t('scheduler.actionFailed'), "error");
// //             }
// //         } catch (error) {
// //             console.error('Retire failed:', error);
// //             showInfoDialog(t('scheduler.retireFailed'), "error");
// //         }
// //     }, [makeApiCall, prepareRequestBody, t, fetchActivatedSchedulerData, showInfoDialog]);

// //     // Handle audit trail authorized
// //     const handleAuditAuthorized = useCallback((auditData) => {
// //         const auditTrailValues = auditData.AuditTrailValues;

// //         if (!auditTrailValues) {
// //             showInfoDialog("Audit trail data is missing", "error");
// //             setShowAudit(false);
// //             setPendingAction(null);
// //             setPendingActionData(null);
// //             return;
// //         }

// //         setShowAudit(false);

// //         if (pendingAction === 'deactivate' && pendingActionData) {
// //             executeDeactivate(pendingActionData, auditTrailValues);
// //         } else if (pendingAction === 'retire' && pendingActionData) {
// //             executeRetire(pendingActionData, auditTrailValues);
// //         }

// //         setPendingAction(null);
// //         setPendingActionData(null);
// //     }, [pendingAction, pendingActionData, executeDeactivate, executeRetire, showInfoDialog]);

// //     const handleAuditClose = useCallback(() => {
// //         setShowAudit(false);
// //         setPendingAction(null);
// //         setPendingActionData(null);
// //     }, []);

// //     // Update button click handlers
// //     const handleDeactivateClick = useCallback(() => {
// //         if (!selectedScheduler) {
// //             showInfoDialog(t('scheduler.selectRecord'), "warning");
// //             return;
// //         }
// //         handleDeactivateConfirm();
// //     }, [selectedScheduler, showInfoDialog, t, handleDeactivateConfirm]);

// //     const handleRetireClick = useCallback(() => {
// //         if (!selectedScheduler) {
// //             showInfoDialog(t('scheduler.selectRecord'), "warning");
// //             return;
// //         }
// //         handleRetireConfirm();
// //     }, [selectedScheduler, showInfoDialog, t, handleRetireConfirm]);

// //     // Handle confirm dialog actions
// //     const handleConfirmDialogClose = useCallback(() => {
// //         setShowConfirmDialog(false);
// //         setConfirmDialogData({
// //             title: "",
// //             message: "",
// //             onConfirm: null,
// //             actionType: ""
// //         });
// //     }, []);

// //     const handleConfirmDialogConfirm = useCallback(() => {
// //         if (confirmDialogData.onConfirm) {
// //             confirmDialogData.onConfirm();
// //         }
// //         handleConfirmDialogClose();
// //     }, [confirmDialogData, handleConfirmDialogClose]);

// //     // Load audit trail rights
// //     useEffect(() => {
// //         const loadAuditTrailRights = () => {
// //             try {
// //                 const auditRightsData = sessionStorage.getItem('auditTrailRights');

// //                 if (auditRightsData) {
// //                     try {
// //                         const rights = JSON.parse(auditRightsData);
// //                         const schedulerRights = rights.filter(item =>
// //                             item.sScreenName && item.sScreenName.includes("Activated Task")
// //                         );

// //                         const deactivateRight = schedulerRights.find(item =>
// //                             item.sTaskName && item.sTaskName.includes("De-activate")
// //                         );
// //                         const retireRight = schedulerRights.find(item =>
// //                             item.sTaskName && item.sTaskName.includes("Retire")
// //                         );

// //                         setAuditTrailRights({
// //                             deactivate: deactivateRight ? (deactivateRight.nManualAuditTrail || 0) : 0,
// //                             retire: retireRight ? (retireRight.nManualAuditTrail || 0) : 0
// //                         });
// //                     } catch (parseError) {
// //                         setAuditTrailRights({ deactivate: 1, retire: 1 });
// //                     }
// //                 } else {
// //                     setAuditTrailRights({ deactivate: 1, retire: 1 });
// //                 }
// //             } catch (error) {
// //                 setAuditTrailRights({ deactivate: 1, retire: 1 });
// //             }
// //         };

// //         loadAuditTrailRights();
// //     }, []);

// //     // Navigation handling
// //     useEffect(() => {
// //         const handleNavigationFromLock = () => {
// //             if (navigationData?.data?.fromLock) {
// //                 const { scheduleId, instrumentId } = navigationData.data;

// //                 if (scheduleId) {
// //                     setHighlightScheduleId(scheduleId);
// //                     setShouldScrollToSchedule(true);
// //                     fetchActivatedSchedulerData();

// //                     showInfoDialog(
// //                         `Instrument "${instrumentId || 'Unknown'}" locked successfully! Schedule "${scheduleId}" is now activated.`,
// //                         "success"
// //                     );

// //                     if (onClearNavigation) {
// //                         onClearNavigation();
// //                     }
// //                 }
// //             }
// //         };

// //         handleNavigationFromLock();

// //         const handleLockSuccess = (event) => {
// //             console.log('Direct lock success event in ActivatedTask:', event.detail);
// //         };

// //         window.addEventListener('instrumentLockSuccess', handleLockSuccess);

// //         return () => {
// //             window.removeEventListener('instrumentLockSuccess', handleLockSuccess);
// //         };
// //     }, [navigationData, fetchActivatedSchedulerData, showInfoDialog, onClearNavigation]);

// //     useEffect(() => {
// //         console.log('=== ActivatedTask useEffect triggered ===');
// //         console.log('Navigation data from props:', navigationData);
// //         console.log('Context submission data:', getSubmissionData());

// //         let scheduleId = null;

// //         if (navigationData && navigationData.scheduleId) {
// //             scheduleId = navigationData.scheduleId;
// //         } else {
// //             const submissionData = getSubmissionData();
// //             if (submissionData && submissionData.targetTab === 'Activated Task') {
// //                 scheduleId = submissionData.data?.scheduleId;
// //                 clearNavigation();
// //             }
// //         }

// //         if (scheduleId) {
// //             setHighlightScheduleId(scheduleId);
// //             setShouldScrollToSchedule(true);
// //             fetchActivatedSchedulerData();
// //         }
// //     }, [navigationData, getSubmissionData, clearNavigation, fetchActivatedSchedulerData]);

// //     // Initial data load
// //     useEffect(() => {
// //         fetchActivatedSchedulerData();
// //     }, []);
// //     useEffect(() => {
// //         if (schedulerData.length > 0 && selectedRowId === 0 && !highlightScheduleId) {
// //             // Auto-select first row when data is loaded and no specific schedule is highlighted
// //             const firstRow = schedulerData[0];
// //             setSelectedScheduler(firstRow);
// //             setSelectedRowId(firstRow.id);
// //             console.log('Auto-selected first row on data change:', firstRow.id);
// //         }
// //     }, [schedulerData, highlightScheduleId]);

// //     useEffect(() => {
// //         if (shouldScrollToSchedule && highlightScheduleId && schedulerData.length > 0) {
// //             const scheduleRow = schedulerData.find(item =>
// //                 item.L13ScheduleID === highlightScheduleId
// //             );

// //             if (scheduleRow) {
// //                 setSelectedScheduler(scheduleRow);
// //                 setSelectedRowId(scheduleRow.id);
// //                 showInfoDialog(`Schedule ${highlightScheduleId} created successfully and is now activated!`, "success");
// //                 console.log('Auto-selected schedule:', highlightScheduleId);
// //             } else {
// //                 // If the highlighted schedule is not found, fall back to first row
// //                 const firstRow = schedulerData[0];
// //                 setSelectedScheduler(firstRow);
// //                 setSelectedRowId(firstRow.id);
// //                 console.log('Fallback to auto-selecting first row:', firstRow.id);
// //             }

// //             setShouldScrollToSchedule(false);
// //         }
// //     }, [schedulerData, highlightScheduleId, shouldScrollToSchedule, showInfoDialog]);

// //     const handleRowSelect = useCallback((row) => {
// //         setSelectedScheduler(row);
// //         setSelectedRowId(row.id);
// //     }, []);

// //     // Handle View Schedule
// //     const handleViewClick = useCallback(() => {
// //         if (!selectedScheduler) {
// //             showInfoDialog(t('scheduler.selectRecord'), "warning");
// //             return;
// //         }

// //         // Call the API to get view data
// //         handleViewSchedule();
// //     }, [selectedScheduler, showInfoDialog, t]);

// //     // Fix the handleViewSchedule function in ActivatedTask.jsx
// //     const handleViewSchedule = useCallback(async () => {
// //         if (!selectedScheduler) return;

// //         try {
// //             setLoading(true);
// //             setLoadingText(t('common.loading'));

// //             const viewRequestData = prepareRequestBody({
// //                 L13TaskID: selectedScheduler.L13ScheduleID,
// //                 bExist: true,
// //                 process: ""
// //             });

// //             console.log('📤 Sending View request:', viewRequestData);

// //             const response = await makeApiCall(
// //                 endpoints.viewSchedule,
// //                 viewRequestData,
// //                 "ViewSchedule"
// //             );

// //             console.log('📥 View API Response:', response);

// //             if (response && (response.ViewDatas || response.ViewLoad)) {
// //                 console.log('✅ View data received, navigating...');

// //                 const navigationPayload = {
// //                     viewMode: true,
// //                     isEdit: true,
// //                     scheduleId: selectedScheduler.L13ScheduleID,
// //                     viewData: response,
// //                     timestamp: Date.now(),
// //                     fromActivatedTask: true,
// //                     sourceComponent: 'ActivatedTask',
// //                     sourceTab: 'Activated Task'
// //                 };

// //                 console.log('🚀 Calling navigateToDataScheduler with:', navigationPayload);

// //                 // **IMPORTANT: Clear any existing navigation first**               
// //                 if (clearNavigation) {
// //                     clearNavigation();
// //                 }

// //                 // Then navigate after a tiny delay
// //                 setTimeout(() => {
// //                     navigateToDataScheduler(navigationPayload);

// //                     if (navigateToTab) {
// //                         navigateToTab('Scheduler', 'Data Scheduler', navigationPayload);
// //                     }
// //                 }, 50);

// //             } else {
// //                 const errorMsg = response?.Message ||
// //                     response?.returnMsg ||
// //                     t('scheduler.viewFailed');
// //                 console.error('❌ View API failed:', errorMsg);
// //                 showInfoDialog(errorMsg, "error");
// //             }
// //         } catch (error) {
// //             console.error('❌ View schedule error:', error);
// //             showInfoDialog(t('scheduler.viewFailed'), "error");
// //         } finally {
// //             setLoading(false);
// //             setLoadingText("");
// //         }
// //     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, navigateToDataScheduler, navigateToTab, showInfoDialog, clearNavigation]);
// //     useEffect(() => {
// //         const handleDataSchedulerNavigation = (event) => {
// //             console.log('Received navigate-to-datascheduler event:', event.detail);
// //             if (event.detail?.direct && navigateToTab) {
// //                 // Try navigation one more time with a delay
// //                 setTimeout(() => {
// //                     navigateToTab('Scheduler', 'Data Scheduler', {
// //                         viewMode: true,
// //                         data: event.detail.data,
// //                         type: 'activated'
// //                     });
// //                 }, 100);
// //             }
// //         };

// //         window.addEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);

// //         return () => {
// //             window.removeEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);
// //         };
// //     }, [navigateToTab]);

// //     const handleImportClick = useCallback(() => {
// //         setImportModalOpen(true);
// //     }, []);

// //     const handlePopupClose = useCallback(() => {
// //         setActivePopup(null);
// //         setImportModalOpen(false);
// //         setAuditTrailData({
// //             username: "Administrator",
// //             password: "",
// //             reason: "",
// //             comments: ""
// //         });
// //     }, []);

// //     const handleFileChange = useCallback((e) => {
// //         const file = e.target.files[0];
// //         if (file) {
// //             const fileExtension = file.name.split('.').pop().toLowerCase();
// //             if (['xls', 'xlsx'].includes(fileExtension)) {
// //                 setImportFile(file);
// //             } else {
// //                 showInfoDialog(t('scheduler.invalidFileType'), "error");
// //                 e.target.value = '';
// //             }
// //         }
// //     }, [showInfoDialog, t]);

// //     // Build export request
// //     const buildExportRequest = useCallback(() => {
// //         const allRows = schedulerData.map(item => ({
// //             ...item,
// //             L13LiveArchive: item.L13LiveArchive ? "✓" : ""
// //         }));

// //         const headerDetails = [
// //             t('label.taskId'),
// //             t('scheduler.clientName'),
// //             t('scheduler.storageName'),
// //             t('scheduler.liveArchive'),
// //             t('label.taskName'),
// //             t('label.instrument'),
// //             t('scheduler.sourcePath'),
// //             t('scheduler.firstCycleStatus'),
// //             t('scheduler.empowerStatus'),
// //             t('scheduler.uncStatus'),
// //             t('scheduler.taskStatus'),
// //             t('scheduler.startDate'),
// //             t('scheduler.endDate'),
// //             t('scheduler.triggerTime'),
// //             t('scheduler.scheduleMode'),
// //             t('scheduler.nextScheduleDateTime'),
// //             t('scheduler.lastScheduleDateTime'),
// //             t('label.createdBy'),
// //             t('label.createdOn'),
// //             t('label.modifiedBy'),
// //             t('label.modifiedOn')
// //         ];

// //         const allowKeys = [
// //             "L13ScheduleID",
// //             "L06ClientName",
// //             "L09FTPAliasName",
// //             "L13LiveArchive",
// //             "L13TaskName",
// //             "L11InstrumentAliasName",
// //             "L13SourcePath",
// //             "L52TaskCompleted",
// //             "EmpowerStatus",
// //             "L13UNCStatus",
// //             "TaskStatus",
// //             "StartDate",
// //             "EndDate",
// //             "TriggerTime",
// //             "ScheduleMode",
// //             "NextScheduleDate",
// //             "LastScheduleDateTime",
// //             "CreatedBy",
// //             "CreatedDate",
// //             "ModifiedBy",
// //             "ModifiedDate"
// //         ];

// //         return {
// //             sFileName: "ActiveScheduler",
// //             AllRows: allRows,
// //             HeaderDetails: headerDetails,
// //             AllowKeys: allowKeys,
// //             sBrowserURL: window.location.origin,
// //             ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
// //             ApplicationCode: "SDMS"
// //         };
// //     }, [schedulerData, t, prepareRequestBody]);

// //     // Handle export
// //     const handleExportClick = useCallback(() => {
// //         if (schedulerData.length === 0) {
// //             showInfoDialog(t('scheduler.noRecordsToExport'), "warning");
// //             return;
// //         }

// //         handleExportCommon({
// //             rows: schedulerData,
// //             buildRequest: buildExportRequest,
// //             postData,
// //             setLoading,
// //             setLoadingText,
// //             setErrorDialog: ({ open, message, type }) => {
// //                 showInfoDialog(message, type);
// //             },
// //             t
// //         });
// //     }, [schedulerData, buildExportRequest, postData, showInfoDialog, t]);

// //     // Handle print
// //     const handlePrintClick = useCallback(() => {
// //         if (!schedulerData || schedulerData.length === 0) {
// //             showInfoDialog(t('scheduler.selectRecord'), "information");
// //             return;
// //         }

// //         setDoPrint(true);
// //     }, [schedulerData, showInfoDialog, t]);

// //     // Build print request
// //     const buildPrintRequest = useCallback(() => ({
// //         sModuleName: "Activated Scheduler",
// //         ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
// //         ApplicationCode: "SDMS",
// //     }), [prepareRequestBody]);

// //     // Handle upload file
// //     const handleUploadSubmit = useCallback(async () => {
// //         if (!importFile) {
// //             showInfoDialog(t('scheduler.selectFileToUpload'), "warning");
// //             return;
// //         }

// //         try {
// //             setLoading(true);
// //             setLoadingText(t('scheduler.uploading'));

// //             const formData = new FormData();
// //             formData.append('file', importFile);

// //             const userDetails = getActiveUserDetails();
// //             formData.append('sUsername', userDetails.sUsername || '');
// //             formData.append('sSiteCode', userDetails.sSiteCode || '');
// //             formData.append('sUserID', userDetails.sUserID || '');
// //             formData.append('sTimeZoneID', userDetails.sTimeZoneID || '');
// //             formData.append('ActiveUserDetails', JSON.stringify(userDetails));

// //             const response = await fetch(endpoints.importScheduler, {
// //                 method: 'POST',
// //                 body: formData,
// //                 headers: {
// //                     'Authorization': localStorage.getItem('token') || ''
// //                 }
// //             });

// //             const data = await response.json();

// //             if (!data.Rtn) {
// //                 showInfoDialog(t('scheduler.importFailed'), "error");
// //             } else if (data.Rtn.toLowerCase() === 'success' || data.Rtn.toLowerCase() === 'partial_success') {
// //                 if (data.Rtn.toLowerCase() === 'success') {
// //                     showInfoDialog(t('scheduler.importSuccess'), "success");
// //                 }

// //                 await fetchActivatedSchedulerData();

// //                 if (data.ExportDataViewURL) {
// //                     const win = window.open(data.ExportDataViewURL, '_blank');
// //                     if (win) {
// //                         win.focus();
// //                     } else {
// //                         alert(t('scheduler.allowPopups'));
// //                     }
// //                 }
// //             } else {
// //                 showInfoDialog(data.Message || t('scheduler.importFailed'), "error");
// //             }

// //             setImportModalOpen(false);
// //             setImportFile(null);
// //         } catch (error) {
// //             showInfoDialog(t('scheduler.importFailed'), "error");
// //         } finally {
// //             setLoading(false);
// //             setLoadingText("");
// //         }
// //     }, [importFile, getActiveUserDetails, fetchActivatedSchedulerData, t, showInfoDialog]);

// //     // Handle download template
// //     const handleDownloadTemplate = useCallback(() => {
// //         const userDetails = getActiveUserDetails();
// //         const newurl = 'template/Import Schedule.xls'.replaceAll("/", "~");
// //         const downloadFileURL = `[YOUR_BASE_URL]/Scheduler/ImportTemplateFileData/${userDetails.sSiteCode || ''}/${userDetails.sUserID || ''}/${newurl}`;

// //         showInfoDialog(t('scheduler.templateDownloadStarted'), "success");

// //         const win = window.open(downloadFileURL, '_blank');
// //         if (win) {
// //             win.focus();
// //         } else {
// //             alert(t('scheduler.allowPopups'));
// //         }
// //     }, [getActiveUserDetails, t, showInfoDialog]);

// //     const columns = useMemo(() => [
// //         {
// //             key: 'L11InstrumentAliasName',
// //             // label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('label.instrument')}</span>,
// //             label: t('label.instrument'),
// //             width: 150,
// //             enableSearch: true,
// //             render: (row, isSelected) => (
// //                 <div
// //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
// //                     onClick={() => handleRowSelect(row)}
// //                 >
// //                     {row.L11InstrumentAliasName}
// //                 </div>
// //             )
// //         },
// //         {
// //             key: 'L13ScheduleID',
// //             label: t('label.taskId'),
// //             // label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('label.taskId')}</span>,
// //             width: 110,
// //             enableSearch: true,
// //             render: (row, isSelected) => (
// //                 <div
// //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
// //                     onClick={() => handleRowSelect(row)}
// //                 >
// //                     {row.L13ScheduleID}
// //                 </div>
// //             )
// //         },
// //         {
// //             key: 'L06ClientName',
// //             label: t('scheduler.clientName'),
// //             // label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('scheduler.clientName')}</span>,
// //             width: 130,
// //             enableSearch: true,
// //             render: (row, isSelected) => (
// //                 <div
// //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
// //                     onClick={() => handleRowSelect(row)}
// //                 >
// //                     {row.L06ClientName}
// //                 </div>
// //             )
// //         },
// //         {
// //             key: 'L09FTPAliasName',
// //             label: t('scheduler.storageName'),
// //             // label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('scheduler.storageName')}</span>,
// //             width: 140,
// //             enableSearch: true,
// //             render: (row, isSelected) => (
// //                 <div
// //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer ${isSelected ? 'font-bold' : ''}`}
// //                     onClick={() => handleRowSelect(row)}
// //                 >
// //                     {row.L09FTPAliasName}
// //                 </div>
// //             )
// //         },
// //         {
// //             key: 'L13LiveArchive',
// //             label: t('scheduler.liveArchive'),
// //             // label: <span className="text-[12px] font-roboto text-[#353f49] font-bold">{t('scheduler.liveArchive')}</span>,
// //             width: 140,
// //             enableSearch: true,
// //             render: (row, isSelected) => (
// //                 <div
// //                     className={`text-[12px] font-['Verdana'] truncate text-gray-700 cursor-pointer text-center ${isSelected ? 'font-bold' : ''}`}
// //                     onClick={() => handleRowSelect(row)}
// //                 >
// //                     {row.L13LiveArchive ? "✓" : ""}
// //                 </div>
// //             )
// //         }
// //     ], [t, handleRowSelect]);

// //     const renderSchedulerDetail = useCallback((scheduler) => (
// //         <div className="space-y-2">
// //             <DetailRow label={t('label.taskName')} value={scheduler.L13TaskName} />
// //             <DetailRow label={t('scheduler.sourcepath')} value={scheduler.L13SourcePath} />
// //             <DetailRow label={t('scheduler.firstCycleStatus')} value={scheduler.L52TaskCompleted} />
// //             <DetailRow label={t('scheduler.empowerStatus')} value={scheduler.EmpowerStatus} />
// //             <DetailRow label={t('scheduler.uncStatus')} value={scheduler.L13UNCStatus ? t('button.yes') : t('button.no')} />
// //             <DetailRow label={t('scheduler.taskStatus')} value={scheduler.TaskStatus} />
// //             <DetailRow label={t('scheduler.clientstatus')} value={scheduler.ClientStatus} />
// //             <DetailRow label={t('scheduler.instrumentstatus')} value={scheduler.InstrumentStatus} />
// //             <DetailRow label={t('scheduler.startDate')} value={scheduler.StartDate} />
// //             <DetailRow label={t('scheduler.endDate')} value={scheduler.EndDate || t('scheduler.notSet')} />
// //             <DetailRow label={t('scheduler.triggerTime')} value={scheduler.TriggerTime} />
// //             <DetailRow label={t('scheduler.scheduleMode')} value={scheduler.ScheduleMode || t('scheduler.notSet')} />
// //             <DetailRow label={t('scheduler.nextScheduleDateTime')} value={scheduler.NextScheduleDate || t('scheduler.notSet')} />
// //             <DetailRow label={t('scheduler.lastScheduleDateTime')} value={scheduler.LastScheduleDateTime || t('scheduler.notSet')} />
// //             <DetailRow label={t('label.createdBy')} value={scheduler.CreatedBy} />
// //             <DetailRow label={t('label.createdOn')} value={scheduler.CreatedDate} />
// //             <DetailRow label={t('label.modifiedBy')} value={scheduler.ModifiedBy || t('scheduler.notSet')} />
// //             <DetailRow label={t('label.modifiedOn')} value={scheduler.ModifiedDate || t('scheduler.notSet')} />
// //         </div>
// //     ), [t]);

// //     const DetailRow = ({ label, value }) => (
// //         <div className="grid grid-cols-2 gap-4">
// //             <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
// //                 {label}
// //             </div>
// //             <div className="font-bold text-[12px] text-[#353f49] font-roboto">
// //                 {value || "-"}
// //             </div>
// //         </div>
// //     );

// //     const ActionButton = ({ iconClass, label, disabled, onClick, variant = "default" }) => (
// //         <button
// //             onClick={onClick}
// //             disabled={disabled}
// //             className={`
// //                 flex items-center gap-1.5 px-3 py-2 text-[11px] font-roboto font-bold rounded border-none 
// //                 transition-all duration-200 whitespace-nowrap
// //                 hover:scale-[0.98] hover:opacity-90
// //                 ${disabled
// //                     ? variant === 'primary'
// //                         ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
// //                         : 'bg-[#f0f2f5dc] text-[#2885fecc] font-bold cursor-not-allowed'
// //                     : variant === 'primary'
// //                         ? 'bg-[#2883FE] text-white hover:bg-[#1c6fd8]'
// //                         : variant === 'danger'
// //                             ? 'bg-red-500 text-white hover:bg-red-600'
// //                             : 'bg-[#f0f2f5] text-[#2883fe] font-bold '
// //                 }
// //             `}
// //         >
// //             {iconClass && <i className={`fa ${iconClass} w-3 h-3`}></i>}
// //             <span>{label}</span>
// //         </button>
// //     );

// //     return (
// //         <div className="flex flex-col font-roboto bg-white w-full h-[80vh] overflow-hidden relative">
// //             {/* Error/Info Dialog */}
// //             {infoDialog.open && (
// //                 <Errordialog
// //                     message={infoDialog.message}
// //                     type={infoDialog.type}
// //                     onClose={closeInfoDialog}
// //                     onConfirm={infoDialog.type === "confirmation" && handleConfirmDialogConfirm}
// //                 />
// //             )}

// //             {/* Confirmation Dialog */}
// //             {showConfirmDialog && (
// //                 <Errordialog
// //                     message={confirmDialogData.message}
// //                     type="confirmation"
// //                     onClose={handleConfirmDialogClose}
// //                     onConfirm={handleConfirmDialogConfirm}
// //                     okText={t('button.yes')}
// //                     cancelText={t('button.no')}
// //                 />
// //             )}

// //             {/* Audit Trail Modal */}
// //             {showAudit && (
// //                 <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
// //                     <AuditTrail
// //                         isOpen={showAudit}
// //                         onClose={handleAuditClose}
// //                         onAuthorized={handleAuditAuthorized}
// //                         actionLabel={
// //                             pendingAction === 'deactivate' ? 'Deactivate Task' :
// //                                 pendingAction === 'retire' ? 'Retire Task' :
// //                                     'Schedule Action'
// //                         }
// //                         defaultReason={
// //                             pendingAction === 'deactivate' ? "Deactivated" :
// //                                 pendingAction === 'retire' ? "Retired" :
// //                                     "Modified"
// //                         }
// //                         disableReason={false}
// //                     />
// //                 </div>
// //             )}

// //             {/* FullPageLoader */}
// //             <FullPageLoader loading={loading} text={loadingText} />

// //             {/* Top Action Buttons */}
// //             <div className="flex justify-end pr-5 gap-2 pt-3">
// //                 <ActionButton
// //                     iconClass="fa-eye"
// //                     label={t('button.view')}
// //                     onClick={handleViewClick}
// //                 />
// //                 <ActionButton
// //                     iconClass="glyphicon glyphicon-thumbs-down"
// //                     label={t('button.deactivate')}
// //                     onClick={handleDeactivateClick}
// //                 />
// //                 <ActionButton
// //                     iconClass="fa-ban"
// //                     label={t('button.retire')}
// //                     onClick={handleRetireClick}
// //                 />
// //                 <ActionButton
// //                     iconClass="glyphicon glyphicon-export"
// //                     label={t('button.export')}
// //                     onClick={handleExportClick}
// //                 />
// //                 <ActionButton
// //                     iconClass="glyphicon glyphicon-import"
// //                     label={t('button.import')}
// //                     onClick={handleImportClick}
// //                 />
// //                 <ActionButton
// //                     iconClass="glyphicon glyphicon-print"
// //                     label={t('button.print')}
// //                     onClick={handlePrintClick}
// //                 />
// //             </div>

// //             {/* Main GridLayout with Details Panel */}
// //             <div className="flex-1 overflow-hidden p-1 ">
// //                 <GridLayout
// //                     columns={columns}
// //                     height="100%"
// //                     detailPanelWidth="46%"
// //                     data={schedulerData}
// //                     getRowId={(row) => row.id}
// //                     renderDetailPanel={renderSchedulerDetail}
// //                     onRowClick={handleRowSelect}
// //                     rowClassName={(row) =>
// //                         row.id === selectedRowId
// //                             ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
// //                             : ""
// //                     }
// //                 />
// //             </div>

// //             {/* Print Component */}
// //             {doPrint && (
// //                 <PrintTable
// //                     // columns={[
// //                     //     { key: 'L11InstrumentAliasName', label: t('label.instrument') },
// //                     //     { key: 'L13ScheduleID', label: t('scheduler.clientName') },
// //                     //     { key: 'L06ClientName', label: t('scheduler.storageName') },
// //                     //     { key: 'L09FTPAliasName', label: t('label.taskName') },
// //                     //     { key: 'L13LiveArchive', label: t('label.instrument') },

// //                     // ]}
// //                     columns={columns}
// //                     rows={schedulerData}
// //                     title={t('scheduler.activatedScheduler')}
// //                     subtitle=""
// //                     printRequest={buildPrintRequest()}
// //                     onDone={() => setDoPrint(false)}
// //                 />
// //             )}

// //             {/* Import Modal */}
// //             {importModalOpen && (
// //                 <CustomPopup
// //                     isOpen={importModalOpen}
// //                     onClose={handlePopupClose}
// //                     title={t('scheduler.importSchedule')}
// //                     content={
// //                         <div className="flex flex-col gap-4 p-2">
// //                             <div className="flex flex-col gap-1">
// //                                 <label className="text-sm font-semibold text-gray-700">
// //                                     {t('scheduler.file')} <span className="text-red-500">*</span>
// //                                 </label>
// //                                 <input
// //                                     type="file"
// //                                     onChange={handleFileChange}
// //                                     accept=".xlsx,.xls"
// //                                     className="w-full p-2 text-sm border border-gray-300 rounded outline-none"
// //                                 />
// //                                 <div className="text-xs text-gray-500">
// //                                     {t('scheduler.activeNoteBrowseUploadXlsAndXlxs')}
// //                                 </div>
// //                             </div>

// //                             <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
// //                                 <button
// //                                     onClick={handleDownloadTemplate}
// //                                     className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 border-none rounded cursor-pointer hover:bg-blue-700"
// //                                 >
// //                                     <i className="fa fa-download"></i> {t('scheduler.getImportTemplate')}
// //                                 </button>
// //                                 <button
// //                                     onClick={handleUploadSubmit}
// //                                     className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-white bg-green-500 border-none rounded cursor-pointer hover:bg-green-600"
// //                                 >
// //                                     <i className="fa fa-upload"></i> {t('scheduler.upload')}
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     }
// //                     size="md"
// //                 />
// //             )}
// //         </div>
// //     );
// // };

// // export default ActivatedTask;

// // Athira new -----------------------------------


// import { useState, useMemo, useEffect, useCallback } from 'react';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// import { useTranslation } from 'react-i18next';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import CustomPopup from '../../../../Layout/Common/Popup';
// import PrintTable from '../../../../Layout/Common/PrintTable';
// import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';
// import servicecall from '../../../../../Services/servicecall';
// import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
// import { handleExportCommon } from '../../../../Layout/Common/exportService';
// import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
// import AuditTrail from '../../../../Layout/Common/AuditTrail';
// import { CF_encrypt, CF_decrypt } from '../../../../Common/encryptiondecryption';

// const API_BASE_URL = "http://localhost:9091/SDMS_WebService";

// const ActivatedTask = ({ navigationData, onClearNavigation, onNavigateAway }) => {
//     const [schedulerData, setSchedulerData] = useState([]);
//     const [selectedScheduler, setSelectedScheduler] = useState(null);
//     const [selectedRowId, setSelectedRowId] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [loadingText, setLoadingText] = useState("");
//     const [infoDialog, setInfoDialog] = useState({
//         open: false,
//         message: "",
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
    
//     // Get all needed functions from SchedulerNavigationContext
//     const { navigateToDataScheduler, navigateToTab, getSubmissionData, clearNavigation, navigateToDeactivatedTask } = useSchedulerNavigation();

//     const [confirmDialogData, setConfirmDialogData] = useState({
//         title: "",
//         message: "",
//         onConfirm: null,
//         actionType: ""
//     });
//     const { t } = useTranslation('scheduler');
    
//     // Audit trail state
//     const [showAudit, setShowAudit] = useState(false);
//     const [pendingAction, setPendingAction] = useState(null);
//     const [pendingActionData, setPendingActionData] = useState(null);
//     const [auditTrailRights, setAuditTrailRights] = useState({ 
//         deactivate: 0, 
//         retire: 0,
//         activate: 0 
//     });
    
//     const { postData } = servicecall();
//     const [highlightScheduleId, setHighlightScheduleId] = useState(null);
//     const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);

//     const endpoints = {
//         activeSchedulerViewGrid: "Scheduler/activeSchedulerViewgrid",
//         activeSchedulerDeactivate: "Scheduler/ActiveSchedulerDeActiveBtnClick",
//         activeSchedulerRetire: "Scheduler/DeactiveSchedulerRetireBtnClick",
//         exportData: "basemaster/exportDataFile",
//         importScheduler: "Scheduler/importSchedulerDataFile",
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
//     const showInfoDialog = useCallback((message, type = "information") => {
//         setInfoDialog({
//             open: true,
//             message,
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

//     // Fetch activated scheduler data
//     const fetchActivatedSchedulerData = useCallback(async () => {
//         setLoading(true);
//         setLoadingText(t('common.loading'));
//         try {
//             const initialRequestData = prepareRequestBody();
//             const initialResponse = await makeApiCall(
//                 "Scheduler/ActiveSchedulerView", 
//                 initialRequestData, 
//                 "ActiveSchedulerInitialView"
//             );
            
//             const gridRequestData = prepareRequestBody();
//             const gridResponse = await makeApiCall(
//                 endpoints.activeSchedulerViewGrid, 
//                 gridRequestData, 
//                 "FetchActivatedSchedulerGrid"
//             );
            
//             if (gridResponse && Array.isArray(gridResponse)) {
//                 const transformedData = gridResponse.map(item => ({
//                     id: item.L13ScheduleID?.trim() || '',
//                     L11InstrumentAliasName: item.L11InstrumentAliasName || item.L11InstrumentName || "",
//                     L13ScheduleID: item.L13ScheduleID?.trim() || '',
//                     L06ClientName: item.L06ClientName || "",
//                     L09FTPAliasName: item.L09FTPAliasName || "",
//                     L13LiveArchive: item.L13LiveArchive || false,
//                     L13TaskName: item.L13TaskName || "",
//                     L13SourcePath: item.L13SourcePath || "",
//                     L52TaskCompleted: item.L52TaskCompleted || "",
//                     EmpowerStatus: item.EmpowerStatus || "",
//                     L13UNCStatus: item.L13UNCStatus || false,
//                     TaskStatus: item.TaskStatus || "Activated",
//                     ClientStatus: item.ClientStatus || "Active",
//                     InstrumentStatus: item.InstrumentStatus || "Active",
//                     StartDate: item.StartDate || "",
//                     UTCStartDate: item.UTCStartDate || "",
//                     EndDate: item.EndDate,
//                     UTCEndDate: item.UTCEndDate,
//                     TriggerTime: item.TriggerTime || "",
//                     UTCTriggerTime: item.UTCTriggerTime || "",
//                     ScheduleMode: item.ScheduleMode,
//                     NextScheduleDate: item.NextScheduleDate,
//                     UTCNextScheduleDate: item.UTCNextScheduleDate,
//                     LastScheduleDateTime: item.LastScheduleDateTime || "",
//                     UTCLastScheduleDateTime: item.UTCLastScheduleDateTime,
//                     CreatedBy: item.CreatedBy || "",
//                     CreatedDate: item.CreatedDate || "",
//                     UTCCreatedDate: item.UTCCreatedDate || "",
//                     ModifiedBy: item.ModifiedBy,
//                     ModifiedDate: item.ModifiedDate,
//                     UTCModifiedDate: item.UTCModifiedDate,
//                     L52TaskID: item.L52TaskID || "",
//                     L13TaskID: item.L13ScheduleID?.trim() || ''
//                 }));
                
//                 setSchedulerData(transformedData);
                
//                 // Auto-select the first row if data exists
//                 if (transformedData.length > 0 && !highlightScheduleId) {
//                     const firstRow = transformedData[0];
//                     setSelectedScheduler(firstRow);
//                     setSelectedRowId(firstRow.id);
//                     console.log('Auto-selected first row:', firstRow.id);
//                 }
                
//                 // Handle navigation highlighting if applicable
//                 if (highlightScheduleId && shouldScrollToSchedule) {
//                     const scheduleToSelect = transformedData.find(item => 
//                         item.L13ScheduleID === highlightScheduleId
//                     );
                    
//                     if (scheduleToSelect) {
//                         setSelectedScheduler(scheduleToSelect);
//                         setSelectedRowId(scheduleToSelect.id);
//                     }
//                     setShouldScrollToSchedule(false);
//                 }
//             } else {
//                 setSchedulerData([]);
//                 // Clear selections if no data
//                 setSelectedScheduler(null);
//                 setSelectedRowId(0);
//             }
//         } catch (error) {
//             console.error('Failed to fetch scheduler data:', error);
//             setSchedulerData([]);
//             setSelectedScheduler(null);
//             setSelectedRowId(0);
//         } finally {
//             setLoading(false);
//             setLoadingText("");
//         }
//     }, [makeApiCall, prepareRequestBody, highlightScheduleId, shouldScrollToSchedule, t]);

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

//     // Handle deactivate action
//     const handleDeactivateConfirm = useCallback(async () => {
//         if (!selectedScheduler) return;
        
//         try {
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
//                     ? t('scheduler.confirmDeactivate')
//                     : t('scheduler.confirmDeactivateWithManual');
                
//                 const deactivateData = {
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
//                         // Check audit trail rights
//                         if (auditTrailRights.deactivate === 1) {
//                             // Store action data and show audit trail
//                             setPendingAction('deactivate');
//                             setPendingActionData(deactivateData);
//                             setShowAudit(true);
//                         } else {
//                             // No audit trail required, proceed directly
//                             executeDeactivate(deactivateData);
//                         }
//                     },
//                     "deactivate"
//                 );
//             }
//         } catch (error) {
//             console.error('Deactivate check failed:', error);
//             showInfoDialog(t('scheduler.deactivateFailed'), "error");
//         }
//     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, showConfirmation, showInfoDialog, auditTrailRights.deactivate]);

//     // Handle retire action
//     const handleRetireConfirm = useCallback(async () => {
//         if (!selectedScheduler) return;
        
//         try {
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
                
//                 const retireData = {
//                     sClientName: selectedScheduler.L06ClientName,
//                     sTaskID: selectedScheduler.L13ScheduleID,
//                     sTaskStatus: selectedScheduler.TaskStatus,
//                     sEmpowerStatus: selectedScheduler.EmpowerStatus,
//                     sTaskName: selectedScheduler.L13TaskName,
//                     sSourcePath: selectedScheduler.L13SourcePath,
//                     sPathTaskID: selectedScheduler.L52TaskID
//                 };
                
//                 showConfirmation(
//                     t('scheduler.confirmation'),
//                     alertText,
//                     () => {
//                         // Check audit trail rights
//                         if (auditTrailRights.retire === 1) {
//                             setPendingAction('retire');
//                             setPendingActionData(retireData);
//                             setShowAudit(true);
//                         } else {
//                             executeRetire(retireData);
//                         }
//                     },
//                     "retire"
//                 );
//             }
//         } catch (error) {
//             console.error('Retire check failed:', error);
//             showInfoDialog(t('scheduler.retireFailed'), "error");
//         }
//     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, showConfirmation, showInfoDialog, auditTrailRights.retire]);

//     // Execute deactivate after audit or directly
//     const executeDeactivate = useCallback(async (actionData, auditTrailValues = null) => {
//         try {
//             const fullRequestData = prepareRequestBody({
//                 ...actionData,
//                 ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
//             });
            
//             const response = await makeApiCall(
//                 endpoints.activeSchedulerDeactivate,
//                 fullRequestData,
//                 "DeactivateSchedule"
//             );
            
//             // Check audit trail login
//             if (response && response.AuditTrailLogin === false) {
//                 showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
//                 return;
//             }
            
//             if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
//                 // Navigate to Deactivated Task page
//                 const scheduleId = actionData.sTaskID;
//                 if (navigateToDeactivatedTask) {
//                     navigateToDeactivatedTask({
//                         scheduleId: scheduleId,
//                         message: 'Schedule deactivated successfully',
//                         highlightScheduleId: scheduleId,
//                         shouldScrollToSchedule: true
//                     });
//                 } else {
//                     // Fallback: refresh current view if navigation fails
//                     await fetchActivatedSchedulerData();
//                 }
//             } else {
//                 showInfoDialog(
//                     response?.Message || response?.returnMsg || t('scheduler.actionFailed'),
//                     "error"
//                 );
//             }
//         } catch (error) {
//             console.error('Deactivate failed:', error);
//             showInfoDialog(t('scheduler.deactivateFailed'), "error");
//         }
//     }, [makeApiCall, prepareRequestBody, t, showInfoDialog, navigateToDeactivatedTask]);

//     // Execute retire after audit or directly
//     const executeRetire = useCallback(async (actionData, auditTrailValues = null) => {
//         try {
//             const fullRequestData = prepareRequestBody({
//                 ...actionData,
//                 ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
//             });
            
//             const response = await makeApiCall(
//                 endpoints.activeSchedulerRetire,
//                 fullRequestData,
//                 "RetireSchedule"
//             );
            
//             // Check audit trail login
//             if (response && response.AuditTrailLogin === false) {
//                 showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
//                 return;
//             }
            
//             if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
//                 // Check for path locked error
//                 if (response.returnMsg && response.returnMsg.includes("already locked")) {
//                     showInfoDialog(response.returnMsg, "warning");
//                 } else {
//                     await fetchActivatedSchedulerData();
//                 }
//             } else if (response && response.returnMsg) {
//                 showInfoDialog(response.returnMsg, "error");
//             } else {
//                 showInfoDialog(t('scheduler.actionFailed'), "error");
//             }
//         } catch (error) {
//             console.error('Retire failed:', error);
//             showInfoDialog(t('scheduler.retireFailed'), "error");
//         }
//     }, [makeApiCall, prepareRequestBody, t, fetchActivatedSchedulerData, showInfoDialog]);

//     // Execute activate function (from second version)
//     const executeActivate = useCallback(async (actionData, auditTrailValues = null) => {
//         try {
//             const fullRequestData = prepareRequestBody({
//                 ...actionData,
//                 ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
//             });
            
//             console.log('📤 Calling Activate API');
//             console.log('Request:', fullRequestData);
            
//             const response = await makeApiCall(
//                 endpoints.activeSchedulerDeactivate, // Using same endpoint as deactivate but with different data
//                 fullRequestData,
//                 "ActivateSchedule"
//             );
            
//             console.log('📥 Activate response:', response);
            
//             // Check audit trail login
//             if (response && response.AuditTrailLogin === false) {
//                 showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
//                 return;
//             }
            
//             if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
//                 console.log('✅ Schedule activated successfully');
                
//                 // Show success message
//                 showInfoDialog(t('scheduler.taskActivatedSuccess'), "success");
                
//                 // Refresh the activated task list
//                 await fetchActivatedSchedulerData();
                
//                 // If this was from Lock & Activate, highlight the activated schedule
//                 if (navigationData?.fromLockActivate && actionData.sTaskID) {
//                     setHighlightScheduleId(actionData.sTaskID);
//                     setShouldScrollToSchedule(true);
//                 }
                
//             } else if (response && response.returnMsg) {
//                 // Handle instrument deactivated error
//                 if (response.returnMsg.includes("Mapped Instrument is Deactivated")) {
//                     showInfoDialog(response.returnMsg, "warning");
//                 } else {
//                     showInfoDialog(response.returnMsg, "error");
//                 }
//             } else {
//                 showInfoDialog(
//                     response?.Message || t('scheduler.actionFailed'),
//                     "error"
//                 );
//             }
//         } catch (error) {
//             console.error('❌ Activate failed:', error);
//             showInfoDialog(t('scheduler.activateFailed'), "error");
//         }
//     }, [makeApiCall, prepareRequestBody, t, fetchActivatedSchedulerData, showInfoDialog, navigationData]);

//     // Handle audit trail authorized
//     const handleAuditAuthorized = useCallback((auditData) => {
//         const auditTrailValues = auditData.AuditTrailValues;
        
//         if (!auditTrailValues) {
//             showInfoDialog("Audit trail data is missing", "error");
//             setShowAudit(false);
//             setPendingAction(null);
//             setPendingActionData(null);
//             return;
//         }
        
//         setShowAudit(false);
        
//         if (pendingAction === 'deactivate' && pendingActionData) {
//             executeDeactivate(pendingActionData, auditTrailValues);
//         } else if (pendingAction === 'retire' && pendingActionData) {
//             executeRetire(pendingActionData, auditTrailValues);
//         } else if (pendingAction === 'activate' && pendingActionData) {
//             executeActivate(pendingActionData, auditTrailValues);
//         }
        
//         setPendingAction(null);
//         setPendingActionData(null);
//     }, [pendingAction, pendingActionData, executeDeactivate, executeRetire, executeActivate, showInfoDialog]);

//     const handleAuditClose = useCallback(() => {
//         setShowAudit(false);
//         setPendingAction(null);
//         setPendingActionData(null);
//     }, []);

// const handleImportClose = useCallback(() => {
//     setImportModalOpen(false);
//     setImportFile(null);
//     // Remove red border when closing
//     const fileInputContainer = document.querySelector('.file-input-container');
//     if (fileInputContainer) {
//         fileInputContainer.classList.remove('border-red-500');
//         fileInputContainer.classList.remove('border-b-2');
//         fileInputContainer.classList.add('border-b-2');
//     }
//     // Reset file input if it exists
//     const fileInput = document.getElementById('file-input');
//     if (fileInput) {
//         fileInput.value = '';
//     }
// }, []);

//     // Update button click handlers
//     const handleDeactivateClick = useCallback(() => {
//         if (!selectedScheduler) {
//             showInfoDialog(t('scheduler.selectRecord'), "warning");
//             return;
//         }
//         handleDeactivateConfirm();
//     }, [selectedScheduler, showInfoDialog, t, handleDeactivateConfirm]);

//     const handleRetireClick = useCallback(() => {
//         if (!selectedScheduler) {
//             showInfoDialog(t('scheduler.selectRecord'), "warning");
//             return;
//         }
//         handleRetireConfirm();
//     }, [selectedScheduler, showInfoDialog, t, handleRetireConfirm]);

//     // Handle View Schedule
//     const handleViewClick = useCallback(() => {
//         if (!selectedScheduler) {
//             showInfoDialog(t('scheduler.selectRecord'), "warning");
//             return;
//         }
        
//         handleViewSchedule();
//     }, [selectedScheduler, showInfoDialog, t]);

//     // Handle View Schedule function
//     const handleViewSchedule = useCallback(async () => {
//         if (!selectedScheduler) return;
        
//         try {
//             setLoading(true);
//             setLoadingText(t('common.loading'));
            
//             const viewRequestData = prepareRequestBody({
//                 L13TaskID: selectedScheduler.L13ScheduleID,
//                 bExist: true,
//                 process: "" 
//             });
            
//             console.log('📤 Sending View request:', viewRequestData);
            
//             const response = await makeApiCall(
//                 endpoints.viewSchedule,
//                 viewRequestData,
//                 "ViewSchedule"
//             );
            
//             console.log('📥 View API Response:', response);
            
//             if (response && (response.ViewDatas || response.ViewLoad)) {
//                 console.log('✅ View data received, navigating...');
                
//                 const navigationPayload = {
//                     viewMode: true,
//                     isEdit: true,
//                     scheduleId: selectedScheduler.L13ScheduleID,
//                     viewData: response,
//                     timestamp: Date.now(),
//                     fromActivatedTask: true
//                 };
                
//                 console.log('🚀 Calling navigateToDataScheduler with:', navigationPayload);
                
//                 // Clear any existing navigation first
//                 if (clearNavigation) {
//                     clearNavigation();
//                 }
                
//                 // Then navigate after a tiny delay
//                 setTimeout(() => {
//                     if (navigateToDataScheduler) {
//                         navigateToDataScheduler(navigationPayload);
//                     }
                    
//                     if (navigateToTab) {
//                         navigateToTab('Scheduler', 'Data Scheduler', navigationPayload);
//                     }
//                 }, 50);
                
//             } else {
//                 const errorMsg = response?.Message || 
//                                 response?.returnMsg || 
//                                 t('scheduler.viewFailed');
//                 console.error('❌ View API failed:', errorMsg);
//                 showInfoDialog(errorMsg, "error");
//             }
//         } catch (error) {
//             console.error('❌ View schedule error:', error);
//             showInfoDialog(t('scheduler.viewFailed'), "error");
//         } finally {
//             setLoading(false);
//             setLoadingText("");
//         }
//     }, [selectedScheduler, makeApiCall, prepareRequestBody, t, navigateToDataScheduler, navigateToTab, showInfoDialog, clearNavigation]);

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

//     // Load audit trail rights
//     useEffect(() => {
//         const loadAuditTrailRights = () => {
//             try {
//                 const auditRightsData = sessionStorage.getItem('auditTrailRights');
                
//                 if (auditRightsData) {
//                     try {
//                         const rights = JSON.parse(auditRightsData);
//                         const schedulerRights = rights.filter(item => 
//                             item.sScreenName && item.sScreenName.includes("Activated Task")
//                         );
                        
//                         const deactivateRight = schedulerRights.find(item => 
//                             item.sTaskName && item.sTaskName.includes("De-activate")
//                         );
//                         const retireRight = schedulerRights.find(item => 
//                             item.sTaskName && item.sTaskName.includes("Retire")
//                         );
//                         const activateRight = schedulerRights.find(item => 
//                             item.sTaskName && item.sTaskName.includes("Activate")
//                         );
                        
//                         setAuditTrailRights({
//                             deactivate: deactivateRight ? (deactivateRight.nManualAuditTrail || 0) : 0,
//                             retire: retireRight ? (retireRight.nManualAuditTrail || 0) : 0,
//                             activate: activateRight ? (activateRight.nManualAuditTrail || 0) : 0
//                         });
//                     } catch (parseError) {
//                         setAuditTrailRights({ deactivate: 1, retire: 1, activate: 1 });
//                     }
//                 } else {
//                     setAuditTrailRights({ deactivate: 1, retire: 1, activate: 1 });
//                 }
//             } catch (error) {
//                 setAuditTrailRights({ deactivate: 1, retire: 1, activate: 1 });
//             }
//         };
        
//         loadAuditTrailRights();
//     }, []);

//     // Handle auto-activation after lock
//     useEffect(() => {
//         const handleAutoActivation = async () => {
//             if (navigationData?.autoActivate && navigationData?.activateData) {
//                 console.log('🎯 Auto-activating schedule after lock');
//                 console.log('Navigation data:', navigationData);
                
//                 const { activateData, scheduleId } = navigationData;
                
//                 // Wait for UI to settle
//                 await new Promise(resolve => setTimeout(resolve, 500));
                
//                 // Check if audit trail is required
//                 if (auditTrailRights.activate === 1) {
//                     console.log('📋 Audit trail required, showing audit modal');
//                     setPendingAction('activate');
//                     setPendingActionData(activateData);
//                     setShowAudit(true);
//                 } else {
//                     console.log('⚡ No audit trail required, activating directly');
//                     await executeActivate(activateData);
//                 }
                
//                 // Clear navigation data after processing
//                 if (onClearNavigation) {
//                     setTimeout(() => {
//                         onClearNavigation();
//                     }, 1000);
//                 }
//             }
//         };
        
//         handleAutoActivation();
//     }, [navigationData, auditTrailRights.activate, executeActivate, onClearNavigation]);

//     // Force navigation event listener
//     useEffect(() => {
//         const handleForceNavigation = (event) => {
//             console.log('🎯 FORCE NAVIGATION event received:', event.detail);
            
//             const { 
//                 scheduleId, 
//                 highlightScheduleId,
//                 fromInstrumentLock,
//                 forceInnerTab 
//             } = event.detail || {};
            
//             if (fromInstrumentLock && forceInnerTab === 'Activated Task' && scheduleId) {
//                 console.log('🚀 FORCE navigating to highlight schedule:', scheduleId);
                
//                 // Set highlight for the schedule
//                 setHighlightScheduleId(scheduleId || highlightScheduleId);
//                 setShouldScrollToSchedule(true);
                
//                 // Refresh data
//                 fetchActivatedSchedulerData();
                
//                 // Show success message
//                 showInfoDialog(
//                     'Instrument locked successfully. Schedule is now ready for activation.',
//                     "success"
//                 );
                
//                 // Clear any navigation data
//                 if (onClearNavigation) {
//                     onClearNavigation();
//                 }
//             }
//         };
        
//         window.addEventListener('FORCE_NAVIGATE_TO_ACTIVATED', handleForceNavigation);
        
//         return () => {
//             window.removeEventListener('FORCE_NAVIGATE_TO_ACTIVATED', handleForceNavigation);
//         };
//     }, [fetchActivatedSchedulerData, showInfoDialog, onClearNavigation]);

//     // Instrument lock completed event listener
//     useEffect(() => {
//         const handleInstrumentLockCompleted = (event) => {
//             console.log('🎯 ActivatedTask received instrument-lock-completed event:', event.detail);
            
//             const { 
//                 scheduleId, 
//                 highlightScheduleId,
//                 shouldNavigateToActivatedTask,
//                 message 
//             } = event.detail || {};
            
//             if (shouldNavigateToActivatedTask && scheduleId) {
//                 console.log('🚀 Navigating to highlight schedule:', scheduleId);
                
//                 // Set highlight for the schedule
//                 setHighlightScheduleId(scheduleId || highlightScheduleId);
//                 setShouldScrollToSchedule(true);
                
//                 // Show success message
//                 showInfoDialog(
//                     message || `Instrument locked successfully. Schedule "${scheduleId}" is now ready for activation.`,
//                     "success"
//                 );
                
//                 // Refresh data to show updated schedule
//                 fetchActivatedSchedulerData();
                
//                 // Clear any navigation data
//                 if (onClearNavigation) {
//                     onClearNavigation();
//                 }
                
//                 // Clear session storage
//                 sessionStorage.removeItem('fromDeactivatedTask');
//                 sessionStorage.removeItem('deactivatedTaskData');
//             }
//         };
        
//         window.addEventListener('instrument-lock-completed', handleInstrumentLockCompleted);
        
//         return () => {
//             window.removeEventListener('instrument-lock-completed', handleInstrumentLockCompleted);
//         };
//     }, [fetchActivatedSchedulerData, showInfoDialog, onClearNavigation]);

//     // Data scheduler navigation events
//     useEffect(() => {
//         const handleDataSchedulerNavigation = (event) => {
//             console.log('Received navigate-to-datascheduler event:', event.detail);
//             if (event.detail?.direct && navigateToTab) {
//                 // Try navigation one more time with a delay
//                 setTimeout(() => {
//                     navigateToTab('Scheduler', 'Data Scheduler', {
//                         viewMode: true,
//                         data: event.detail.data,
//                         type: 'activated'
//                     });
//                 }, 100);
//             }
//         };
        
//         window.addEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);
        
//         return () => {
//             window.removeEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);
//         };
//     }, [navigateToTab]);

//     // Handle navigation from submission data
//     useEffect(() => {
//         console.log('=== ActivatedTask useEffect triggered ===');
//         console.log('Navigation data from props:', navigationData);
//         console.log('Context submission data:', getSubmissionData());

//         let scheduleId = null;

//         if (navigationData && navigationData.scheduleId) {
//             scheduleId = navigationData.scheduleId;
//         } else {
//             const submissionData = getSubmissionData();
//             if (submissionData && submissionData.targetTab === 'Activated Task') {
//                 scheduleId = submissionData.data?.scheduleId;
//                 if (clearNavigation) {
//                     clearNavigation();
//                 }
//             }
//         }

//         if (scheduleId) {
//             setHighlightScheduleId(scheduleId);
//             setShouldScrollToSchedule(true);
//             fetchActivatedSchedulerData();
//         }
//     }, [navigationData, getSubmissionData, clearNavigation, fetchActivatedSchedulerData]);

//     // Mounted effect
//     useEffect(() => {
//         console.log('=== ActivatedTask Mounted ===');
//         console.log('Navigation data:', navigationData);
        
//         if (navigationData?.highlightScheduleId) {
//             console.log('Highlighting schedule:', navigationData.highlightScheduleId);
//         }
        
//         if (navigationData?.fromActivation) {
//             console.log('Received from activation, showing success message');
//         }
//     }, [navigationData]);

//     // Initial data load
//     useEffect(() => {
//         fetchActivatedSchedulerData();
//     }, []);

//     // Auto-select first row when data loads
//     useEffect(() => {
//         if (schedulerData.length > 0 && selectedRowId === 0 && !highlightScheduleId) {
//             const firstRow = schedulerData[0];
//             setSelectedScheduler(firstRow);
//             setSelectedRowId(firstRow.id);
//             console.log('Auto-selected first row on data change:', firstRow.id);
//         }
//     }, [schedulerData, highlightScheduleId]);

//     // Handle schedule highlighting
//     useEffect(() => {
//         if (shouldScrollToSchedule && highlightScheduleId && schedulerData.length > 0) {
//             const scheduleRow = schedulerData.find(item =>
//                 item.L13ScheduleID === highlightScheduleId
//             );

//             if (scheduleRow) {
//                 setSelectedScheduler(scheduleRow);
//                 setSelectedRowId(scheduleRow.id);
//                 showInfoDialog(`Schedule ${highlightScheduleId} created successfully and is now activated!`, "success");
//                 console.log('Auto-selected schedule:', highlightScheduleId);
//             } else {
//                 // If the highlighted schedule is not found, fall back to first row
//                 const firstRow = schedulerData[0];
//                 setSelectedScheduler(firstRow);
//                 setSelectedRowId(firstRow.id);
//                 console.log('Fallback to auto-selecting first row:', firstRow.id);
//             }

//             setShouldScrollToSchedule(false);
//         }
//     }, [schedulerData, highlightScheduleId, shouldScrollToSchedule, showInfoDialog]);

//     // Update the existing handleAutoActivation useEffect
//     useEffect(() => {
//         const handleAutoActivation = async () => {
//             console.log('🔍 Checking for auto-activation data:', navigationData);
            
//             // Check for lock completion navigation
//             if (navigationData?.fromInstrumentLock || navigationData?.lockCompleted) {
//                 console.log('🎯 Lock completion navigation detected');
                
//                 const { scheduleId, highlightScheduleId, message } = navigationData;
                
//                 if (scheduleId) {
//                     console.log('📍 Highlighting schedule after lock:', scheduleId);
                    
//                     // Set highlight for the schedule
//                     setHighlightScheduleId(scheduleId || highlightScheduleId);
//                     setShouldScrollToSchedule(true);
                    
//                     // Show success message
//                     if (message) {
//                         showInfoDialog(message, "success");
//                     }
                    
//                     // Refresh data
//                     await fetchActivatedSchedulerData();
                    
//                     // Clear navigation data
//                     if (onClearNavigation) {
//                         setTimeout(() => {
//                             onClearNavigation();
//                         }, 1000);
//                     }
//                 }
//             }
            
//             // Original auto-activation logic (keep this part)
//             if (navigationData?.autoActivate && navigationData?.activateData) {
//                 console.log('🎯 Auto-activating schedule after lock');
//                 console.log('Navigation data:', navigationData);
                
//                 const { activateData, scheduleId } = navigationData;
                
//                 // Wait for UI to settle
//                 await new Promise(resolve => setTimeout(resolve, 500));
                
//                 // Check if audit trail is required
//                 if (auditTrailRights.activate === 1) {
//                     console.log('📋 Audit trail required, showing audit modal');
//                     setPendingAction('activate');
//                     setPendingActionData(activateData);
//                     setShowAudit(true);
//                 } else {
//                     console.log('⚡ No audit trail required, activating directly');
//                     await executeActivate(activateData);
//                 }
                
//                 // Clear navigation data after processing
//                 if (onClearNavigation) {
//                     setTimeout(() => {
//                         onClearNavigation();
//                     }, 1000);
//                 }
//             }
//         };
        
//         handleAutoActivation();
//     }, [navigationData, auditTrailRights.activate, executeActivate, onClearNavigation, fetchActivatedSchedulerData, showInfoDialog]);

//     const handleRowSelect = useCallback((row) => {
//         setSelectedScheduler(row);
//         setSelectedRowId(row.id);
//     }, []);

//     const handleImportClick = useCallback(() => {
//         setImportModalOpen(true);
//     }, []);

// const handlePopupClose = useCallback(() => {
//     setActivePopup(null);
//     setImportModalOpen(false);
//     setImportFile(null); // Clear the file state
//     setAuditTrailData({
//         username: "Administrator",
//         password: "",
//         reason: "",
//         comments: ""
//     });
// }, []);

// const handleFileChange = useCallback((e) => {
//     const file = e.target.files[0];
    
//     // Remove red border when file is selected
//     const fileInputContainer = document.querySelector('.file-input-container');
//     if (fileInputContainer) {
//         fileInputContainer.classList.remove('border-red-500');
//         fileInputContainer.classList.add('border-gray-400');
//     }
    
//     if (file) {
//         const fileExtension = file.name.split('.').pop().toLowerCase();
        
//         if (!['xls', 'xlsx'].includes(fileExtension)) {
//             showInfoDialog(t('scheduler.invalidFileType'), "error");
//             e.target.value = '';
//             setImportFile(null);
            
//             // Add red border for invalid file type
//             if (fileInputContainer) {
//                 fileInputContainer.classList.add('border-red-500');
//             }
//             return;
//         }
        
//         // Optional: Check file size
//         const maxSize = 10 * 1024 * 1024; // 10MB
//         if (file.size > maxSize) {
//             showInfoDialog(t('scheduler.fileSizeExceeded'), "error");
//             e.target.value = '';
//             setImportFile(null);
            
//             // Add red border for file size error
//             if (fileInputContainer) {
//                 fileInputContainer.classList.add('border-red-500');
//             }
//             return;
//         }
        
//         setImportFile(file);
        
//         // Change border to indicate valid file
//         if (fileInputContainer) {
//             fileInputContainer.classList.remove('border-gray-300');
//             fileInputContainer.classList.add('border-green-500');
//         }
//     } else {
//         // No file selected
//         setImportFile(null);
//         if (fileInputContainer) {
//             fileInputContainer.classList.remove('border-green-500');
//             fileInputContainer.classList.add('border-gray-300');
//         }
//     }
// }, [showInfoDialog, t]);

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
//             sFileName: "ActiveScheduler",
//             AllRows: allRows,
//             HeaderDetails: headerDetails,
//             AllowKeys: allowKeys,
//             sBrowserURL: window.location.origin,
//             ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
//             ApplicationCode: "SDMS"
//         };
//     }, [schedulerData, t, prepareRequestBody]);

//     // Handle export
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
//             setLoadingText,
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
//         sModuleName: "Activated Scheduler",
//         ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
//         ApplicationCode: "SDMS",
//     }), [prepareRequestBody]);



//     // Handle upload file
// const handleUploadSubmit = useCallback(async () => {
//     if (!importFile) {
//         // Don't show dialog - just highlight the file input field
//         // Show red border on the file input container instead
//         const fileInputContainer = document.querySelector('.file-input-container');
//         if (fileInputContainer) {
//             fileInputContainer.classList.add('border-red-500');
//         }
//         return;
//     }

//     // Validate file size
//     const maxSize = 10 * 1024 * 1024; // 10MB
//     if (importFile.size > maxSize) {
//         showInfoDialog(t('scheduler.fileSizeExceeded'), "error");
//         return;
//     }

//     try {
//         setLoading(true);
//         setLoadingText(t('scheduler.uploading'));
        
//         const userDetails = getActiveUserDetails();
        
//         // Create FormData exactly as jQuery does
//         const formData = new FormData();
        
//         // 1. Append the file
//         formData.append('file', importFile);
        
//         // 2. Append user details exactly as jQuery does
//         formData.append('sUsername', CF_encrypt(userDetails.sUsername || ''));
//         formData.append('sSiteCode', CF_encrypt(userDetails.sSiteCode || ''));
//         formData.append('sUserID', CF_encrypt(userDetails.sUserID || ''));
//         formData.append('sTimeZoneID', CF_encrypt(userDetails.sTimeZoneID || ''));
        
//         // 3. Append ActiveUserDetails as encrypted JSON string
//         const activeUserDetails = {
//             sUsername: userDetails.sUsername || '',
//             sSiteCode: userDetails.sSiteCode || '',
//             sUserID: userDetails.sUserID || '',
//             sTimeZoneID: userDetails.sTimeZoneID || '',
//             sTenantID: userDetails.sTenantID || '',
//             sPassword: userDetails.sPassword || '',
//             ApplicationCode: "SDMS"
//         };
        
//         formData.append('ActiveUserDetails', CF_encrypt(JSON.stringify(activeUserDetails)));
//         formData.append('sBrowserURL', window.location.origin);
        
//         console.log('📤 Uploading file:', importFile.name);
//         console.log('👤 User details:', userDetails);
        
//         // Construct upload URL (exactly like jQuery)
//         let uploadUrl = `${API_BASE_URL}/Scheduler/importSchedulerDataFile`;
        
//         // Add tenant ID if available (like jQuery does)
//         if (userDetails.sTenantID) {
//             uploadUrl += `?TenantID=${userDetails.sTenantID}`;
//         }
        
//         console.log('📤 Upload URL:', uploadUrl);
        
//         // Prepare headers
//         const headers = {
//             // Don't set Content-Type - let browser set it with boundary
//         };
        
//         // Add authorization token if available
//         const token = localStorage.getItem('token');
//         if (token) {
//             // Check if jQuery uses "Bearer" prefix
//             headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
//         }
        
//         console.log('📤 Sending FormData with keys:');
//         for (let pair of formData.entries()) {
//             console.log(`  ${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name}` : 'encrypted data'}`);
//         }
        
//         // Send request
//         const response = await fetch(uploadUrl, {
//             method: 'POST',
//             body: formData,
//             headers: headers,
//         });
        
//         console.log('📥 Response status:', response.status, response.statusText);
        
//         if (!response.ok) {
//             const errorText = await response.text();
//             console.error('❌ Server error:', errorText);
//             throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//         }
        
//         const data = await response.json();
//         console.log('📥 Upload response:', data);
        
//         // Check for token validation error
//         if (data.tokenValitation === false) {
//             console.error('Token validation failed');
//             showInfoDialog(t('session.expired'), "error");
            
//             // Clear token and redirect to login
//             localStorage.removeItem('token');
//             window.location.href = ('/login');
            
//             // Close modal
//             setImportModalOpen(false);
//             setImportFile(null);
//             return;
//         }
        
//         // Check response status
//         if (!data.Rtn) {
//             console.error('No Rtn in response:', data);
//             showInfoDialog(t('scheduler.importFailed'), "error");
            
//             // Close modal on error
//             setImportModalOpen(false);
//             setImportFile(null);
//             return;
//         }
        
//         const rtnStatus = data.Rtn.toLowerCase();
//         console.log('📊 Rtn status:', rtnStatus);
        
//         if (rtnStatus === 'success' || rtnStatus === 'partial_success') {
//             // Show appropriate message
//             if (rtnStatus === 'success') {
//                 showInfoDialog(t('scheduler.importSuccess'), "success");
//             } else {
//                 showInfoDialog(t('scheduler.importPartialSuccess'), "warning");
//             }
            
//             // Handle imported data
//             if (data.lstSchedulers && Array.isArray(data.lstSchedulers)) {
//                 const importedCount = data.lstSchedulers.length;
//                 console.log(`✅ Imported ${importedCount} schedules`);
                
//                 // Transform the imported data
//                 const transformedData = data.lstSchedulers.map(item => ({
//                     id: item.L13ScheduleID?.trim() || '',
//                     L11InstrumentAliasName: item.L11InstrumentAliasName || item.L11InstrumentName || "",
//                     L13ScheduleID: item.L13ScheduleID?.trim() || '',
//                     L06ClientName: item.L06ClientName || "",
//                     L09FTPAliasName: item.L09FTPAliasName || "",
//                     L13LiveArchive: item.L13LiveArchive || false,
//                     L13TaskName: item.L13TaskName || "",
//                     L13SourcePath: item.L13SourcePath || "",
//                     L52TaskCompleted: item.L52TaskCompleted || "",
//                     EmpowerStatus: item.EmpowerStatus || "",
//                     L13UNCStatus: item.L13UNCStatus || false,
//                     TaskStatus: item.TaskStatus || "Activated",
//                     ClientStatus: item.ClientStatus || "Active",
//                     InstrumentStatus: item.InstrumentStatus || "Active",
//                     StartDate: item.StartDate || "",
//                     UTCStartDate: item.UTCStartDate || "",
//                     EndDate: item.EndDate,
//                     UTCEndDate: item.UTCEndDate,
//                     TriggerTime: item.TriggerTime || "",
//                     UTCTriggerTime: item.UTCTriggerTime || "",
//                     ScheduleMode: item.ScheduleMode,
//                     NextScheduleDate: item.NextScheduleDate,
//                     UTCNextScheduleDate: item.UTCNextScheduleDate,
//                     LastScheduleDateTime: item.LastScheduleDateTime || "",
//                     UTCLastScheduleDateTime: item.UTCLastScheduleDateTime,
//                     CreatedBy: item.CreatedBy || "",
//                     CreatedDate: item.CreatedDate || "",
//                     UTCCreatedDate: item.UTCCreatedDate || "",
//                     ModifiedBy: item.ModifiedBy,
//                     ModifiedDate: item.ModifiedDate,
//                     UTCModifiedDate: item.UTCModifiedDate,
//                     L52TaskID: item.L52TaskID || "",
//                     L13TaskID: item.L13ScheduleID?.trim() || ''
//                 }));
                
//                 // Update state with imported data
//                 setSchedulerData(prevData => {
//                     // Filter out any existing schedules with same ID
//                     const existingIds = new Set(prevData.map(item => item.L13ScheduleID));
//                     const newItems = transformedData.filter(item => !existingIds.has(item.L13ScheduleID));
//                     return [...newItems, ...prevData];
//                 });
                
//                 // Select the first imported item if available
//                 if (transformedData.length > 0) {
//                     const firstImported = transformedData[0];
//                     setSelectedScheduler(firstImported);
//                     setSelectedRowId(firstImported.id);
//                 }
                
//                 showInfoDialog(
//                     `${importedCount} schedule(s) imported successfully`,
//                     "success"
//                 );
//             } else {
//                 // If no lstSchedulers, refresh from server
//                 console.log('🔄 No imported data in response, refreshing from server...');
//                 await fetchActivatedSchedulerData();
//             }
            
//             // Handle export data URL if present
//             if (data.ExportDataViewURL) {
//                 try {
//                     // Decrypt the URL
//                     const decryptedUrl = CF_decrypt(data.ExportDataViewURL);
//                     const urlPath = decryptedUrl.replace(/\s/g, '%20');
                    
//                     if (urlPath) {
//                         console.log('📥 Opening export URL:', urlPath);
//                         const win = window.open(urlPath, '_blank');
//                         if (!win) {
//                             showInfoDialog(t('scheduler.allowPopups'), "warning");
//                         }
//                     }
//                 } catch (decryptError) {
//                     console.warn('Could not decrypt URL:', decryptError);
//                     showInfoDialog(
//                         'Import completed. Additional data available for download.',
//                         "info"
//                     );
//                 }
//             }
            
//         } else {
//             // Show error message
//             const errorMsg = data.Message || data.returnMsg || data.ErrorMessage || t('scheduler.importFailed');
//             console.error('❌ Import failed:', errorMsg);
//             showInfoDialog(errorMsg, "error");
//         }
        
//         // ✅ ALWAYS close modal and reset - whether success or error
//         setImportModalOpen(false);
//         setImportFile(null);
        
//     } catch (error) {
//         console.error('❌ Import failed:', error);
        
//         // More detailed error messages
//         let errorMessage = t('scheduler.importFailed');
//         if (error.message.includes('HTTP 413')) {
//             errorMessage = 'File too large. Maximum size is 10MB.';
//         } else if (error.message.includes('HTTP 415')) {
//             errorMessage = 'Invalid file type. Please upload .xls or .xlsx files only.';
//         } else if (error.message.includes('HTTP 500')) {
//             errorMessage = 'Server error. Please try again or contact administrator.';
//         } else if (error.message.includes('NetworkError')) {
//             errorMessage = 'Network error. Please check your connection.';
//         } else {
//             errorMessage = `${t('scheduler.importFailed')}: ${error.message}`;
//         }
        
//         showInfoDialog(errorMessage, "error");
        
//         // ✅ Close modal on catch error too
//         setImportModalOpen(false);
//         setImportFile(null);
//     } finally {
//         setLoading(false);
//         setLoadingText("");
//     }
// }, [importFile, getActiveUserDetails, t, showInfoDialog, fetchActivatedSchedulerData]);


// const handleDownloadTemplate = useCallback(async () => {
//     try {
//         setLoading(true);
//         setLoadingText('Downloading template...');
        
//         // Direct URL to template in Tomcat
//         const directTemplateUrl = `${window.location.origin}/LogilabSDMS/template/Import Schedule.xls`;
        
//         console.log('📥 Downloading template from:', directTemplateUrl);
        
//         // Direct download (simplest approach)
//         const downloadWindow = window.open(directTemplateUrl, '_blank');
        
//         if (!downloadWindow) {
//             // If popup blocked, create a link
//             const link = document.createElement('a');
//             link.href = directTemplateUrl;
//             link.download = 'Import Schedule.xls';
//             link.style.display = 'none';
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
            
//             showInfoDialog('Template download started. If it doesn\'t start automatically, check your downloads folder.', "info");
//         }
        
//     } catch (error) {
//         console.error('❌ Template download failed:', error);
//         showInfoDialog('Failed to download template. Please try again.', "error");
//     } finally {
//         setTimeout(() => {
//             setLoading(false);
//             setLoadingText("");
//         }, 1000);
//     }
// }, [showInfoDialog]);


//     const columns = useMemo(() => [
//         {
//             key: 'L11InstrumentAliasName',
//             label: t('label.instrument'),
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
//             label: t('label.taskId'),
//             width: 110,
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
//             label: t('scheduler.clientName'),
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
//             label: t('scheduler.storageName'),
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
//             label: t('scheduler.liveArchive'),
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
//         <div className="space-y-2">
//             <DetailRow label={t('label.taskName')} value={scheduler.L13TaskName} />
//             <DetailRow label={t('scheduler.sourcepath')} value={scheduler.L13SourcePath} />
//             <DetailRow label={t('scheduler.firstCycleStatus')} value={scheduler.L52TaskCompleted} />
//             <DetailRow label={t('scheduler.empowerStatus')} value={scheduler.EmpowerStatus} />
//             <DetailRow label={t('scheduler.uncStatus')} value={scheduler.L13UNCStatus ? t('button.yes') : t('button.no')} />
//             <DetailRow label={t('scheduler.taskStatus')} value={scheduler.TaskStatus} />
//             <DetailRow label={t('scheduler.clientstatus')} value={scheduler.ClientStatus} />
//             <DetailRow label={t('scheduler.instrumentstatus')} value={scheduler.InstrumentStatus} />
//             <DetailRow label={t('scheduler.startDate')} value={scheduler.StartDate} />
//             <DetailRow label={t('scheduler.endDate')} value={scheduler.EndDate || t('scheduler.notSet')} />
//             <DetailRow label={t('scheduler.triggerTime')} value={scheduler.TriggerTime} />
//             <DetailRow label={t('scheduler.scheduleMode')} value={scheduler.ScheduleMode || t('scheduler.notSet')} />
//             <DetailRow label={t('scheduler.nextScheduleDateTime')} value={scheduler.NextScheduleDate || t('scheduler.notSet')} />
//             <DetailRow label={t('scheduler.lastScheduleDateTime')} value={scheduler.LastScheduleDateTime || t('scheduler.notSet')} />
//             <DetailRow label={t('label.createdBy')} value={scheduler.CreatedBy} />
//             <DetailRow label={t('label.createdOn')} value={scheduler.CreatedDate} />
//             <DetailRow label={t('label.modifiedBy')} value={scheduler.ModifiedBy || t('scheduler.notSet')} />
//             <DetailRow label={t('label.modifiedOn')} value={scheduler.ModifiedDate || t('scheduler.notSet')} />
//         </div>
//     ), [t]);

//     const DetailRow = ({ label, value }) => (
//         <div className="grid grid-cols-2 gap-4">
//             <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
//                 {label}
//             </div>
//             <div className="font-bold text-[12px] text-[#353f49] font-roboto">
//                 {value || "-"}
//             </div>
//         </div>
//     );

//     const ActionButton = ({ iconClass, label, disabled, onClick, variant = "default" }) => (
//         <button
//             onClick={onClick}
//             disabled={disabled}
//             className={`
//                 flex items-center gap-1.5 px-3 py-2 text-[11px] font-roboto font-bold rounded border-none 
//                 transition-all duration-200 whitespace-nowrap
//                 hover:scale-[0.98] hover:opacity-90
//                 ${disabled 
//                     ? variant === 'primary'
//                     ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
//                     : 'bg-[#f0f2f5dc] text-[#2885fecc] font-bold cursor-not-allowed'
//                     : variant === 'primary'
//                         ? 'bg-[#2883FE] text-white hover:bg-[#1c6fd8]'
//                         : variant === 'danger'
//                             ? 'bg-red-500 text-white hover:bg-red-600'
//                             : 'bg-[#f0f2f5] text-[#2883fe] font-bold '
//                 }
//             `}
//         >
//             {iconClass && <i className={`fa ${iconClass} w-3 h-3`}></i>}
//             <span>{label}</span>
//         </button>
//     );

//     return (
//         <div className="flex flex-col font-roboto bg-white w-full h-[80vh] overflow-hidden relative">
//             {/* Error/Info Dialog */}
//             {infoDialog.open && (
//                 <Errordialog
//                     message={infoDialog.message}
//                     type={infoDialog.type}
//                     onClose={closeInfoDialog}
//                     onConfirm={infoDialog.type === "confirmation" && handleConfirmDialogConfirm}
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

//             {/* Audit Trail Modal */}
//             {showAudit && (
//                 <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
//                     <AuditTrail 
//                         isOpen={showAudit}
//                         onClose={handleAuditClose}
//                         onAuthorized={handleAuditAuthorized}
//                         actionLabel={
//                             pendingAction === 'deactivate' ? 'Deactivate Task' : 
//                             pendingAction === 'retire' ? 'Retire Task' : 
//                             pendingAction === 'activate' ? 'Activate Task' :
//                             'Schedule Action'
//                         }
//                         defaultReason={
//                             pendingAction === 'deactivate' ? "Deactivated" : 
//                             pendingAction === 'retire' ? "Retired" : 
//                             pendingAction === 'activate' ? "Activated" :
//                             "Modified"
//                         }
//                         disableReason={false}
//                     />
//                 </div>
//             )}

//             {/* FullPageLoader */}
//             <FullPageLoader loading={loading} text={loadingText} />

//             {/* Top Action Buttons */}
//             <div className="flex justify-end pr-5 gap-2 pt-3">
//                 <ActionButton
//                     iconClass="fa-eye"
//                     label={t('button.view')}
//                     onClick={handleViewClick}
//                 />
//                 <ActionButton
//                     iconClass="glyphicon glyphicon-thumbs-down"
//                     label={t('button.deactivate')}
//                     onClick={handleDeactivateClick}
//                 />
//                 <ActionButton
//                     iconClass="fa-ban"
//                     label={t('button.retire')}
//                     onClick={handleRetireClick}
//                 />
//                 <ActionButton
//                     iconClass="glyphicon glyphicon-export"
//                     label={t('button.export')}
//                     onClick={handleExportClick}
//                 />
//                 <ActionButton
//                     iconClass="glyphicon glyphicon-import"
//                     label={t('button.import')}
//                     onClick={handleImportClick}
//                 />
//                 <ActionButton
//                     iconClass="glyphicon glyphicon-print"
//                     label={t('button.print')}
//                     onClick={handlePrintClick}
//                 />
//             </div>

//             {/* Main GridLayout with Details Panel */}
//             <div className="flex-1 overflow-hidden p-1 ">
//                 <GridLayout
//                     columns={columns}
//                     height="100%"
//                     detailPanelWidth="46%"
//                     data={schedulerData}
//                     getRowId={(row) => row.id}
//                     renderDetailPanel={renderSchedulerDetail}
//                     onRowClick={handleRowSelect}
//                     rowClassName={(row) =>
//                         row.id === selectedRowId
//                             ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
//                             : ""
//                     }
//                 />
//             </div>

//             {/* Print Component */}
//             {doPrint && (
//                 <PrintTable
//                     columns={columns}
//                     rows={schedulerData}
//                     title={t('scheduler.activatedScheduler')}
//                     subtitle=""
//                     printRequest={buildPrintRequest()}
//                     onDone={() => setDoPrint(false)}
//                 />
//             )}

//             {/* Import Modal */}
// {importModalOpen && (
//     <CustomPopup
//         isOpen={importModalOpen}
//         onClose={handleImportClose}
//         title={t('scheduler.importSchedule')}
//         content={
//             <div className="flex flex-col gap-4 p-6">
//                 {/* File Input Section */}
//                 <div className="flex flex-col gap-3">
//                     <div className="flex items-center gap-1">
//                         <span className="text-xs font-medium text-[#3a5570] font-roboto">File</span> 
//                         <span className="text-sm font-medium text-[#a82700] font-roboto"> *</span>
//                         <div className="relative flex-1">
//                             <input
//                                 type="file"
//                                 id="file-input"
//                                 onChange={handleFileChange}
//                                 accept=".xls,.xlsx"
//                                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                             />
//                             <div className={`flex items-center px-4 py-2 border-b-2 bg-white min-h-[30px] file-input-container ${!importFile ? 'border-gray-300' : 'border-gray-400'}`}>
//                                 <button 
//                                     type="button"
//                                     className="px-2 py-1 text-xs font-medium text-black bg-gray-200 border border-black rounded font-roboto"
//                                     onClick={() => document.getElementById('file-input').click()}
//                                 >
//                                     {t('scheduler.browse')}
//                                 </button>
//                                 <span className="text-xs text-gray-700 font-bold ml-3">
//                                     {importFile ? importFile.name : "No file chosen"}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
                    
//                     <div className="text-sm text-gray-600 font-['Helvetica'] mt-0">
//                         NOTE:- Allowed browse file extension are .xls and .xlsx.
//                     </div>
//                 </div>

//                 {/* Action Buttons - All at right end with equal spacing */}
//                 <div className="flex justify-end gap-1 pt-4  border-t border-gray-200">
//                     <button
//                         onClick={handleDownloadTemplate}
//                         className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-[#2883fe] border-none rounded cursor-pointer transition-colors font-roboto"
//                     >
//                         <i className="fa fa-download"></i> 
//                         {t('scheduler.getImportTemplate')}
//                     </button>
//                     <button
//                         onClick={handleUploadSubmit}
//                         className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-[#2883fe] border-none rounded cursor-pointer transition-colors font-roboto`}
//                     >
//                         <i className="fa fa-upload"></i> 
//                         {t('button.upload')}
//                     </button>
//                     <button
//                         onClick={handleImportClose}
//                         className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded transition-colors font-roboto"
//                     >
//                         {t('button.close')}
//                     </button>
//                 </div>
//             </div>
//         }
//         size="md"
//     />
// )}
//         </div>
//     );
// };

// export default ActivatedTask;





// Athira new----------------------------------------

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
import { CF_encrypt, CF_decrypt } from '../../../../Common/encryptiondecryption';

const API_BASE_URL = "http://localhost:9091/SDMS_WebService";

const ActivatedTask = ({ navigationData, onClearNavigation, onNavigateAway }) => {
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
    
    // Get all needed functions from SchedulerNavigationContext
    const { navigateToDataScheduler, navigateToTab, getSubmissionData, clearNavigation, navigateToDeactivatedTask } = useSchedulerNavigation();

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
        deactivate: 0, 
        retire: 0,
        activate: 0 
    });
    
    const { postData } = servicecall();
    const [highlightScheduleId, setHighlightScheduleId] = useState(null);
    const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);

    const endpoints = {
        activeSchedulerViewGrid: "Scheduler/activeSchedulerViewgrid",
        activeSchedulerDeactivate: "Scheduler/ActiveSchedulerDeActiveBtnClick",
        activeSchedulerRetire: "Scheduler/DeactiveSchedulerRetireBtnClick",
        exportData: "basemaster/exportDataFile",
        importScheduler: "Scheduler/importSchedulerDataFile",
        checkManualTask: "Scheduler/CheckManualTaskForScheduler",
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

    // Fetch activated scheduler data
    const fetchActivatedSchedulerData = useCallback(async () => {
        setLoading(true);
        setLoadingText(t('common.loading'));
        try {
            const initialRequestData = prepareRequestBody();
            const initialResponse = await makeApiCall(
                "Scheduler/ActiveSchedulerView", 
                initialRequestData, 
                "ActiveSchedulerInitialView"
            );
            
            const gridRequestData = prepareRequestBody();
            const gridResponse = await makeApiCall(
                endpoints.activeSchedulerViewGrid, 
                gridRequestData, 
                "FetchActivatedSchedulerGrid"
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
                    TaskStatus: item.TaskStatus || "Activated",
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
            console.error('Failed to fetch scheduler data:', error);
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

    // Handle deactivate action
    const handleDeactivateConfirm = useCallback(async () => {
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
                    ? t('scheduler.confirmDeactivate')
                    : t('scheduler.confirmDeactivateWithManual');
                
                const deactivateData = {
                    sClientName: selectedScheduler.L06ClientName,
                    sTaskID: selectedScheduler.L13ScheduleID,
                    sTaskStatus: selectedScheduler.TaskStatus,
                    sEmpowerStatus: selectedScheduler.EmpowerStatus,
                    sTaskName: selectedScheduler.L13TaskName,
                    sSourcePath: selectedScheduler.L13SourcePath,
                    sPathTaskID: selectedScheduler.L52TaskID
                };
                
                // Show custom confirmation dialog
                showConfirmation(
                    t('scheduler.confirmation'),
                    alertText,
                    () => {
                        // Check audit trail rights
                        if (auditTrailRights.deactivate === 1) {
                            // Store action data and show audit trail
                            setPendingAction('deactivate');
                            setPendingActionData(deactivateData);
                            setShowAudit(true);
                        } else {
                            // No audit trail required, proceed directly
                            executeDeactivate(deactivateData);
                        }
                    },
                    "deactivate"
                );
            }
        } catch (error) {
            console.error('Deactivate check failed:', error);
            showInfoDialog(t('scheduler.deactivateFailed'), "error");
        }
    }, [selectedScheduler, makeApiCall, prepareRequestBody, t, showConfirmation, showInfoDialog, auditTrailRights.deactivate]);

    // Handle retire action
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

    // Execute deactivate after audit or directly
    const executeDeactivate = useCallback(async (actionData, auditTrailValues = null) => {
        try {
            const fullRequestData = prepareRequestBody({
                ...actionData,
                ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
            });
            
            const response = await makeApiCall(
                endpoints.activeSchedulerDeactivate,
                fullRequestData,
                "DeactivateSchedule"
            );
            
            // Check audit trail login
            if (response && response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
                return;
            }
            
            if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
                // Navigate to Deactivated Task page
                const scheduleId = actionData.sTaskID;
                if (navigateToDeactivatedTask) {
                    navigateToDeactivatedTask({
                        scheduleId: scheduleId,
                        message: 'Schedule deactivated successfully',
                        highlightScheduleId: scheduleId,
                        shouldScrollToSchedule: true
                    });
                } else {
                    // Fallback: refresh current view if navigation fails
                    await fetchActivatedSchedulerData();
                }
            } else {
                showInfoDialog(
                    response?.Message || response?.returnMsg || t('scheduler.actionFailed'),
                    "error"
                );
            }
        } catch (error) {
            console.error('Deactivate failed:', error);
            showInfoDialog(t('scheduler.deactivateFailed'), "error");
        }
    }, [makeApiCall, prepareRequestBody, t, showInfoDialog, navigateToDeactivatedTask]);

    // Execute retire after audit or directly
    const executeRetire = useCallback(async (actionData, auditTrailValues = null) => {
        try {
            const fullRequestData = prepareRequestBody({
                ...actionData,
                ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
            });
            
            const response = await makeApiCall(
                endpoints.activeSchedulerRetire,
                fullRequestData,
                "RetireSchedule"
            );
            
            // Check audit trail login
            if (response && response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
                return;
            }
            
            if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
                // Check for path locked error
                if (response.returnMsg && response.returnMsg.includes("already locked")) {
                    showInfoDialog(response.returnMsg, "warning");
                } else {
                    await fetchActivatedSchedulerData();
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
    }, [makeApiCall, prepareRequestBody, t, fetchActivatedSchedulerData, showInfoDialog]);

    // Execute activate function (from second version)
    const executeActivate = useCallback(async (actionData, auditTrailValues = null) => {
        try {
            const fullRequestData = prepareRequestBody({
                ...actionData,
                ...(auditTrailValues && { AuditTrailValues: auditTrailValues })
            });
            
            console.log('📤 Calling Activate API');
            console.log('Request:', fullRequestData);
            
            const response = await makeApiCall(
                endpoints.activeSchedulerDeactivate, // Using same endpoint as deactivate but with different data
                fullRequestData,
                "ActivateSchedule"
            );
            
            console.log('📥 Activate response:', response);
            
            // Check audit trail login
            if (response && response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || t('scheduler.auditTrailLoginFailed'), "error");
                return;
            }
            
            if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
                console.log('✅ Schedule activated successfully');
                
                // Show success message
                showInfoDialog(t('scheduler.taskActivatedSuccess'), "success");
                
                // Refresh the activated task list
                await fetchActivatedSchedulerData();
                
                // If this was from Lock & Activate, highlight the activated schedule
                if (navigationData?.fromLockActivate && actionData.sTaskID) {
                    setHighlightScheduleId(actionData.sTaskID);
                    setShouldScrollToSchedule(true);
                }
                
            } else if (response && response.returnMsg) {
                // Handle instrument deactivated error
                if (response.returnMsg.includes("Mapped Instrument is Deactivated")) {
                    showInfoDialog(response.returnMsg, "warning");
                } else {
                    showInfoDialog(response.returnMsg, "error");
                }
            } else {
                showInfoDialog(
                    response?.Message || t('scheduler.actionFailed'),
                    "error"
                );
            }
        } catch (error) {
            console.error('❌ Activate failed:', error);
            showInfoDialog(t('scheduler.activateFailed'), "error");
        }
    }, [makeApiCall, prepareRequestBody, t, fetchActivatedSchedulerData, showInfoDialog, navigationData]);

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
        
        if (pendingAction === 'deactivate' && pendingActionData) {
            executeDeactivate(pendingActionData, auditTrailValues);
        } else if (pendingAction === 'retire' && pendingActionData) {
            executeRetire(pendingActionData, auditTrailValues);
        } else if (pendingAction === 'activate' && pendingActionData) {
            executeActivate(pendingActionData, auditTrailValues);
        }
        
        setPendingAction(null);
        setPendingActionData(null);
    }, [pendingAction, pendingActionData, executeDeactivate, executeRetire, executeActivate, showInfoDialog]);

    const handleAuditClose = useCallback(() => {
        setShowAudit(false);
        setPendingAction(null);
        setPendingActionData(null);
    }, []);

const handleImportClose = useCallback(() => {
    setImportModalOpen(false);
    setImportFile(null);
    // Remove red border when closing
    const fileInputContainer = document.querySelector('.file-input-container');
    if (fileInputContainer) {
        fileInputContainer.classList.remove('border-red-500');
        fileInputContainer.classList.remove('border-b-2');
        fileInputContainer.classList.add('border-b-2');
    }
    // Reset file input if it exists
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.value = '';
    }
}, []);

    // Update button click handlers
    const handleDeactivateClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }
        handleDeactivateConfirm();
    }, [selectedScheduler, showInfoDialog, t, handleDeactivateConfirm]);

    const handleRetireClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }
        handleRetireConfirm();
    }, [selectedScheduler, showInfoDialog, t, handleRetireConfirm]);

    // Handle View Schedule
    const handleViewClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }
        
        handleViewSchedule();
    }, [selectedScheduler, showInfoDialog, t]);

    // Handle View Schedule function
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
                    fromActivatedTask: true
                };
                
                console.log('🚀 Calling navigateToDataScheduler with:', navigationPayload);
                
                // Clear any existing navigation first
                if (clearNavigation) {
                    clearNavigation();
                }
                
                // Then navigate after a tiny delay
                setTimeout(() => {
                    if (navigateToDataScheduler) {
                        navigateToDataScheduler(navigationPayload);
                    }
                    
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
                            item.sScreenName && item.sScreenName.includes("Activated Task")
                        );
                        
                        const deactivateRight = schedulerRights.find(item => 
                            item.sTaskName && item.sTaskName.includes("De-activate")
                        );
                        const retireRight = schedulerRights.find(item => 
                            item.sTaskName && item.sTaskName.includes("Retire")
                        );
                        const activateRight = schedulerRights.find(item => 
                            item.sTaskName && item.sTaskName.includes("Activate")
                        );
                        
                        setAuditTrailRights({
                            deactivate: deactivateRight ? (deactivateRight.nManualAuditTrail || 0) : 0,
                            retire: retireRight ? (retireRight.nManualAuditTrail || 0) : 0,
                            activate: activateRight ? (activateRight.nManualAuditTrail || 0) : 0
                        });
                    } catch (parseError) {
                        setAuditTrailRights({ deactivate: 1, retire: 1, activate: 1 });
                    }
                } else {
                    setAuditTrailRights({ deactivate: 1, retire: 1, activate: 1 });
                }
            } catch (error) {
                setAuditTrailRights({ deactivate: 1, retire: 1, activate: 1 });
            }
        };
        
        loadAuditTrailRights();
    }, []);

    // Handle auto-activation after lock
    useEffect(() => {
        const handleAutoActivation = async () => {
            if (navigationData?.autoActivate && navigationData?.activateData) {
                console.log('🎯 Auto-activating schedule after lock');
                console.log('Navigation data:', navigationData);
                
                const { activateData, scheduleId } = navigationData;
                
                // Wait for UI to settle
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if audit trail is required
                if (auditTrailRights.activate === 1) {
                    console.log('📋 Audit trail required, showing audit modal');
                    setPendingAction('activate');
                    setPendingActionData(activateData);
                    setShowAudit(true);
                } else {
                    console.log('⚡ No audit trail required, activating directly');
                    await executeActivate(activateData);
                }
                
                // Clear navigation data after processing
                if (onClearNavigation) {
                    setTimeout(() => {
                        onClearNavigation();
                    }, 1000);
                }
            }
        };
        
        handleAutoActivation();
    }, [navigationData, auditTrailRights.activate, executeActivate, onClearNavigation]);

    // Force navigation event listener
    useEffect(() => {
        const handleForceNavigation = (event) => {
            console.log('🎯 FORCE NAVIGATION event received:', event.detail);
            
            const { 
                scheduleId, 
                highlightScheduleId,
                fromInstrumentLock,
                forceInnerTab 
            } = event.detail || {};
            
            if (fromInstrumentLock && forceInnerTab === 'Activated Task' && scheduleId) {
                console.log('🚀 FORCE navigating to highlight schedule:', scheduleId);
                
                // Set highlight for the schedule
                setHighlightScheduleId(scheduleId || highlightScheduleId);
                setShouldScrollToSchedule(true);
                
                // Refresh data
                fetchActivatedSchedulerData();
                
                // Show success message
                showInfoDialog(
                    'Instrument locked successfully. Schedule is now ready for activation.',
                    "success"
                );
                
                // Clear any navigation data
                if (onClearNavigation) {
                    onClearNavigation();
                }
            }
        };
        
        window.addEventListener('FORCE_NAVIGATE_TO_ACTIVATED', handleForceNavigation);
        
        return () => {
            window.removeEventListener('FORCE_NAVIGATE_TO_ACTIVATED', handleForceNavigation);
        };
    }, [fetchActivatedSchedulerData, showInfoDialog, onClearNavigation]);

    // Instrument lock completed event listener
    useEffect(() => {
        const handleInstrumentLockCompleted = (event) => {
            console.log('🎯 ActivatedTask received instrument-lock-completed event:', event.detail);
            
            const { 
                scheduleId, 
                highlightScheduleId,
                shouldNavigateToActivatedTask,
                message 
            } = event.detail || {};
            
            if (shouldNavigateToActivatedTask && scheduleId) {
                console.log('🚀 Navigating to highlight schedule:', scheduleId);
                
                // Set highlight for the schedule
                setHighlightScheduleId(scheduleId || highlightScheduleId);
                setShouldScrollToSchedule(true);
                
                // Show success message
                showInfoDialog(
                    message || `Instrument locked successfully. Schedule "${scheduleId}" is now ready for activation.`,
                    "success"
                );
                
                // Refresh data to show updated schedule
                fetchActivatedSchedulerData();
                
                // Clear any navigation data
                if (onClearNavigation) {
                    onClearNavigation();
                }
                
                // Clear session storage
                sessionStorage.removeItem('fromDeactivatedTask');
                sessionStorage.removeItem('deactivatedTaskData');
            }
        };
        
        window.addEventListener('instrument-lock-completed', handleInstrumentLockCompleted);
        
        return () => {
            window.removeEventListener('instrument-lock-completed', handleInstrumentLockCompleted);
        };
    }, [fetchActivatedSchedulerData, showInfoDialog, onClearNavigation]);

    // Data scheduler navigation events
    useEffect(() => {
        const handleDataSchedulerNavigation = (event) => {
            console.log('Received navigate-to-datascheduler event:', event.detail);
            if (event.detail?.direct && navigateToTab) {
                // Try navigation one more time with a delay
                setTimeout(() => {
                    navigateToTab('Scheduler', 'Data Scheduler', {
                        viewMode: true,
                        data: event.detail.data,
                        type: 'activated'
                    });
                }, 100);
            }
        };
        
        window.addEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);
        
        return () => {
            window.removeEventListener('navigate-to-datascheduler', handleDataSchedulerNavigation);
        };
    }, [navigateToTab]);

    // Handle navigation from submission data
    useEffect(() => {
        console.log('=== ActivatedTask useEffect triggered ===');
        console.log('Navigation data from props:', navigationData);
        console.log('Context submission data:', getSubmissionData());

        let scheduleId = null;

        if (navigationData && navigationData.scheduleId) {
            scheduleId = navigationData.scheduleId;
        } else {
            const submissionData = getSubmissionData();
            if (submissionData && submissionData.targetTab === 'Activated Task') {
                scheduleId = submissionData.data?.scheduleId;
                if (clearNavigation) {
                    clearNavigation();
                }
            }
        }

        if (scheduleId) {
            setHighlightScheduleId(scheduleId);
            setShouldScrollToSchedule(true);
            fetchActivatedSchedulerData();
        }
    }, [navigationData, getSubmissionData, clearNavigation, fetchActivatedSchedulerData]);

    // Mounted effect
    useEffect(() => {
        console.log('=== ActivatedTask Mounted ===');
        console.log('Navigation data:', navigationData);
        
        if (navigationData?.highlightScheduleId) {
            console.log('Highlighting schedule:', navigationData.highlightScheduleId);
        }
        
        if (navigationData?.fromActivation) {
            console.log('Received from activation, showing success message');
        }
    }, [navigationData]);

    // Initial data load
    useEffect(() => {
        fetchActivatedSchedulerData();
    }, []);

    // Auto-select first row when data loads
    useEffect(() => {
        if (schedulerData.length > 0 && selectedRowId === 0 && !highlightScheduleId) {
            const firstRow = schedulerData[0];
            setSelectedScheduler(firstRow);
            setSelectedRowId(firstRow.id);
            console.log('Auto-selected first row on data change:', firstRow.id);
        }
    }, [schedulerData, highlightScheduleId]);

    // Handle schedule highlighting
    useEffect(() => {
        if (shouldScrollToSchedule && highlightScheduleId && schedulerData.length > 0) {
            const scheduleRow = schedulerData.find(item =>
                item.L13ScheduleID === highlightScheduleId
            );

            if (scheduleRow) {
                setSelectedScheduler(scheduleRow);
                setSelectedRowId(scheduleRow.id);
                showInfoDialog(`Schedule ${highlightScheduleId} created successfully and is now activated!`, "success");
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

    // Update the existing handleAutoActivation useEffect
    useEffect(() => {
        const handleAutoActivation = async () => {
            console.log('🔍 Checking for auto-activation data:', navigationData);
            
            // Check for lock completion navigation
            if (navigationData?.fromInstrumentLock || navigationData?.lockCompleted) {
                console.log('🎯 Lock completion navigation detected');
                
                const { scheduleId, highlightScheduleId, message } = navigationData;
                
                if (scheduleId) {
                    console.log('📍 Highlighting schedule after lock:', scheduleId);
                    
                    // Set highlight for the schedule
                    setHighlightScheduleId(scheduleId || highlightScheduleId);
                    setShouldScrollToSchedule(true);
                    
                    // Show success message
                    if (message) {
                        showInfoDialog(message, "success");
                    }
                    
                    // Refresh data
                    await fetchActivatedSchedulerData();
                    
                    // Clear navigation data
                    if (onClearNavigation) {
                        setTimeout(() => {
                            onClearNavigation();
                        }, 1000);
                    }
                }
            }
            
            // Original auto-activation logic (keep this part)
            if (navigationData?.autoActivate && navigationData?.activateData) {
                console.log('🎯 Auto-activating schedule after lock');
                console.log('Navigation data:', navigationData);
                
                const { activateData, scheduleId } = navigationData;
                
                // Wait for UI to settle
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if audit trail is required
                if (auditTrailRights.activate === 1) {
                    console.log('📋 Audit trail required, showing audit modal');
                    setPendingAction('activate');
                    setPendingActionData(activateData);
                    setShowAudit(true);
                } else {
                    console.log('⚡ No audit trail required, activating directly');
                    await executeActivate(activateData);
                }
                
                // Clear navigation data after processing
                if (onClearNavigation) {
                    setTimeout(() => {
                        onClearNavigation();
                    }, 1000);
                }
            }
        };
        
        handleAutoActivation();
    }, [navigationData, auditTrailRights.activate, executeActivate, onClearNavigation, fetchActivatedSchedulerData, showInfoDialog]);

    const handleRowSelect = useCallback((row) => {
        setSelectedScheduler(row);
        setSelectedRowId(row.id);
    }, []);

    const handleImportClick = useCallback(() => {
        setImportModalOpen(true);
    }, []);

const handlePopupClose = useCallback(() => {
    setActivePopup(null);
    setImportModalOpen(false);
    setImportFile(null); // Clear the file state
    setAuditTrailData({
        username: "Administrator",
        password: "",
        reason: "",
        comments: ""
    });
}, []);

const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    
    // Remove red border when file is selected
    const fileInputContainer = document.querySelector('.file-input-container');
    if (fileInputContainer) {
        fileInputContainer.classList.remove('border-red-500');
        fileInputContainer.classList.add('border-gray-400');
    }
    
    if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!['xls', 'xlsx'].includes(fileExtension)) {
            showInfoDialog(t('scheduler.invalidFileType'), "error");
            e.target.value = '';
            setImportFile(null);
            
            // Add red border for invalid file type
            if (fileInputContainer) {
                fileInputContainer.classList.add('border-red-500');
            }
            return;
        }
        
        // Optional: Check file size
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showInfoDialog(t('scheduler.fileSizeExceeded'), "error");
            e.target.value = '';
            setImportFile(null);
            
            // Add red border for file size error
            if (fileInputContainer) {
                fileInputContainer.classList.add('border-red-500');
            }
            return;
        }
        
        setImportFile(file);
        
        // Change border to indicate valid file
        if (fileInputContainer) {
            fileInputContainer.classList.remove('border-gray-300');
            fileInputContainer.classList.add('border-green-500');
        }
    } else {
        // No file selected
        setImportFile(null);
        if (fileInputContainer) {
            fileInputContainer.classList.remove('border-green-500');
            fileInputContainer.classList.add('border-gray-300');
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
            sFileName: "ActiveScheduler",
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
        sModuleName: "Activated Scheduler",
        ActiveUserDetails: prepareRequestBody().ActiveUserDetails,
        ApplicationCode: "SDMS",
    }), [prepareRequestBody]);



    // Handle upload file
const handleUploadSubmit = useCallback(async () => {
    if (!importFile) {
        // Don't show dialog - just highlight the file input field
        // Show red border on the file input container instead
        const fileInputContainer = document.querySelector('.file-input-container');
        if (fileInputContainer) {
            fileInputContainer.classList.add('border-red-500');
        }
        return;
    }

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (importFile.size > maxSize) {
        showInfoDialog(t('scheduler.fileSizeExceeded'), "error");
        return;
    }

    try {
        setLoading(true);
        setLoadingText(t('scheduler.uploading'));
        
        const userDetails = getActiveUserDetails();
        
        // Create FormData exactly as jQuery does
        const formData = new FormData();
        
        // 1. Append the file
        formData.append('file', importFile);
        
        // 2. Append user details exactly as jQuery does
        formData.append('sUsername', CF_encrypt(userDetails.sUsername || ''));
        formData.append('sSiteCode', CF_encrypt(userDetails.sSiteCode || ''));
        formData.append('sUserID', CF_encrypt(userDetails.sUserID || ''));
        formData.append('sTimeZoneID', CF_encrypt(userDetails.sTimeZoneID || ''));
        
        // 3. Append ActiveUserDetails as encrypted JSON string
        const activeUserDetails = {
            sUsername: userDetails.sUsername || '',
            sSiteCode: userDetails.sSiteCode || '',
            sUserID: userDetails.sUserID || '',
            sTimeZoneID: userDetails.sTimeZoneID || '',
            sTenantID: userDetails.sTenantID || '',
            sPassword: userDetails.sPassword || '',
            ApplicationCode: "SDMS"
        };
        
        formData.append('ActiveUserDetails', CF_encrypt(JSON.stringify(activeUserDetails)));
        formData.append('sBrowserURL', window.location.origin);
        
        console.log('📤 Uploading file:', importFile.name);
        console.log('👤 User details:', userDetails);
        
        // Construct upload URL (exactly like jQuery)
        let uploadUrl = `${API_BASE_URL}/Scheduler/importSchedulerDataFile`;
        
        // Add tenant ID if available (like jQuery does)
        if (userDetails.sTenantID) {
            uploadUrl += `?TenantID=${userDetails.sTenantID}`;
        }
        
        console.log('📤 Upload URL:', uploadUrl);
        
        // Prepare headers
        const headers = {
            // Don't set Content-Type - let browser set it with boundary
        };
        
        // Add authorization token if available
        const token = localStorage.getItem('token');
        if (token) {
            // Check if jQuery uses "Bearer" prefix
            headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        }
        
        console.log('📤 Sending FormData with keys:');
        for (let pair of formData.entries()) {
            console.log(`  ${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name}` : 'encrypted data'}`);
        }
        
        // Send request
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: headers,
        });
        
        console.log('📥 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server error:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📥 Upload response:', data);
        
        // Check for token validation error
        if (data.tokenValitation === false) {
            console.error('Token validation failed');
            showInfoDialog(t('session.expired'), "error");
            
            // Clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = ('/login');
            
            // Close modal
            setImportModalOpen(false);
            setImportFile(null);
            return;
        }
        
        // Check response status
        if (!data.Rtn) {
            console.error('No Rtn in response:', data);
            showInfoDialog(t('scheduler.importFailed'), "error");
            
            // Close modal on error
            setImportModalOpen(false);
            setImportFile(null);
            return;
        }
        
        const rtnStatus = data.Rtn.toLowerCase();
        console.log('📊 Rtn status:', rtnStatus);
        
        if (rtnStatus === 'success' || rtnStatus === 'partial_success') {
            // Show appropriate message
            if (rtnStatus === 'success') {
                showInfoDialog(t('scheduler.importSuccess'), "success");
            } else {
                showInfoDialog(t('scheduler.importPartialSuccess'), "warning");
            }
            
            // Handle imported data
            if (data.lstSchedulers && Array.isArray(data.lstSchedulers)) {
                const importedCount = data.lstSchedulers.length;
                console.log(`✅ Imported ${importedCount} schedules`);
                
                // Transform the imported data
                const transformedData = data.lstSchedulers.map(item => ({
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
                    TaskStatus: item.TaskStatus || "Activated",
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
                
                // Update state with imported data
                setSchedulerData(prevData => {
                    // Filter out any existing schedules with same ID
                    const existingIds = new Set(prevData.map(item => item.L13ScheduleID));
                    const newItems = transformedData.filter(item => !existingIds.has(item.L13ScheduleID));
                    return [...newItems, ...prevData];
                });
                
                // Select the first imported item if available
                if (transformedData.length > 0) {
                    const firstImported = transformedData[0];
                    setSelectedScheduler(firstImported);
                    setSelectedRowId(firstImported.id);
                }
                
                showInfoDialog(
                    `${importedCount} schedule(s) imported successfully`,
                    "success"
                );
            } else {
                // If no lstSchedulers, refresh from server
                console.log('🔄 No imported data in response, refreshing from server...');
                await fetchActivatedSchedulerData();
            }
            
            // Handle export data URL if present
            if (data.ExportDataViewURL) {
                try {
                    // Decrypt the URL
                    const decryptedUrl = CF_decrypt(data.ExportDataViewURL);
                    const urlPath = decryptedUrl.replace(/\s/g, '%20');
                    
                    if (urlPath) {
                        console.log('📥 Opening export URL:', urlPath);
                        const win = window.open(urlPath, '_blank');
                        if (!win) {
                            showInfoDialog(t('scheduler.allowPopups'), "warning");
                        }
                    }
                } catch (decryptError) {
                    console.warn('Could not decrypt URL:', decryptError);
                    showInfoDialog(
                        'Import completed. Additional data available for download.',
                        "info"
                    );
                }
            }
            
        } else {
            // Show error message
            const errorMsg = data.Message || data.returnMsg || data.ErrorMessage || t('scheduler.importFailed');
            console.error('❌ Import failed:', errorMsg);
            showInfoDialog(errorMsg, "error");
        }
        
        // ✅ ALWAYS close modal and reset - whether success or error
        setImportModalOpen(false);
        setImportFile(null);
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        
        // More detailed error messages
        let errorMessage = t('scheduler.importFailed');
        if (error.message.includes('HTTP 413')) {
            errorMessage = 'File too large. Maximum size is 10MB.';
        } else if (error.message.includes('HTTP 415')) {
            errorMessage = 'Invalid file type. Please upload .xls or .xlsx files only.';
        } else if (error.message.includes('HTTP 500')) {
            errorMessage = 'Server error. Please try again or contact administrator.';
        } else if (error.message.includes('NetworkError')) {
            errorMessage = 'Network error. Please check your connection.';
        } else {
            errorMessage = `${t('scheduler.importFailed')}: ${error.message}`;
        }
        
        showInfoDialog(errorMessage, "error");
        
        // ✅ Close modal on catch error too
        setImportModalOpen(false);
        setImportFile(null);
    } finally {
        setLoading(false);
        setLoadingText("");
    }
}, [importFile, getActiveUserDetails, t, showInfoDialog, fetchActivatedSchedulerData]);


const handleDownloadTemplate = useCallback(async () => {
    try {
        setLoading(true);
        setLoadingText('Downloading template...');
        
        // Direct URL to template in Tomcat
        const directTemplateUrl = `${window.location.origin}/LogilabSDMS/template/Import Schedule.xls`;
        
        console.log('📥 Downloading template from:', directTemplateUrl);
        
        // Direct download (simplest approach)
        const downloadWindow = window.open(directTemplateUrl, '_blank');
        
        if (!downloadWindow) {
            // If popup blocked, create a link
            const link = document.createElement('a');
            link.href = directTemplateUrl;
            link.download = 'Import Schedule.xls';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showInfoDialog('Template download started. If it doesn\'t start automatically, check your downloads folder.', "info");
        }
        
    } catch (error) {
        console.error('❌ Template download failed:', error);
        showInfoDialog('Failed to download template. Please try again.', "error");
    } finally {
        setTimeout(() => {
            setLoading(false);
            setLoadingText("");
        }, 1000);
    }
}, [showInfoDialog]);


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
                        actionLabel={
                            pendingAction === 'deactivate' ? 'Deactivate Task' : 
                            pendingAction === 'retire' ? 'Retire Task' : 
                            pendingAction === 'activate' ? 'Activate Task' :
                            'Schedule Action'
                        }
                        defaultReason={
                            pendingAction === 'deactivate' ? "Deactivated" : 
                            pendingAction === 'retire' ? "Retired" : 
                            pendingAction === 'activate' ? "Activated" :
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
                    iconClass="glyphicon glyphicon-thumbs-down"
                    label={t('button.deactivate')}
                    onClick={handleDeactivateClick}
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
                    externalSelectedId={selectedRowId}
                />
            </div>

            {/* Print Component */}
            {doPrint && (
                <PrintTable
                    columns={columns}
                    rows={schedulerData}
                    title={t('scheduler.activatedScheduler')}
                    subtitle=""
                    printRequest={buildPrintRequest()}
                    onDone={() => setDoPrint(false)}
                />
            )}

            {/* Import Modal */}
{importModalOpen && (
    <CustomPopup
        isOpen={importModalOpen}
        onClose={handleImportClose}
        title={t('scheduler.importSchedule')}
        content={
            <div className="flex flex-col gap-4 p-6">
                {/* File Input Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-[#3a5570] font-roboto">File</span> 
                        <span className="text-sm font-medium text-[#a82700] font-roboto"> *</span>
                        <div className="relative flex-1">
                            <input
                                type="file"
                                id="file-input"
                                onChange={handleFileChange}
                                accept=".xls,.xlsx"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className={`flex items-center px-4 py-2 border-b-2 bg-white min-h-[30px] file-input-container ${!importFile ? 'border-gray-300' : 'border-gray-400'}`}>
                                <button 
                                    type="button"
                                    className="px-2 py-1 text-xs font-medium text-black bg-gray-200 border border-black rounded font-roboto"
                                    onClick={() => document.getElementById('file-input').click()}
                                >
                                    {t('scheduler.browse')}
                                </button>
                                <span className="text-xs text-gray-700 font-bold ml-3">
                                    {importFile ? importFile.name : "No file chosen"}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 font-['Helvetica'] mt-0">
                        NOTE:- Allowed browse file extension are .xls and .xlsx.
                    </div>
                </div>

                {/* Action Buttons - All at right end with equal spacing */}
                <div className="flex justify-end gap-1 pt-4  border-t border-gray-200">
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-[#2883fe] border-none rounded cursor-pointer transition-colors font-roboto"
                    >
                        <i className="fa fa-download"></i> 
                        {t('scheduler.getImportTemplate')}
                    </button>
                    <button
                        onClick={handleUploadSubmit}
                        className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-[#2883fe] border-none rounded cursor-pointer transition-colors font-roboto`}
                    >
                        <i className="fa fa-upload"></i> 
                        {t('button.upload')}
                    </button>
                    <button
                        onClick={handleImportClose}
                        className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded transition-colors font-roboto"
                    >
                        {t('button.close')}
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

export default ActivatedTask;