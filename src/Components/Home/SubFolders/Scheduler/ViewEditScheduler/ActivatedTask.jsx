import { useState, useMemo, useEffect, useCallback } from 'react';
import { Eye, ThumbsDown, Ban, Download, Upload, Printer } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext'; //made change by kirubhakaran on 23-01-2026

const ActivatedTask = ({ navigationData }) => { //made change by kirubhakaran on 23-01-2026
    const [schedulerData, setSchedulerData] = useState([]);
    const [selectedScheduler, setSelectedScheduler] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(0);
    const [loading, setLoading] = useState(true);
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        scheduler: "",
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
    const { t } = useTranslation('scheduler');
    // Added THESE 3 LINES:(made change by kirubhakaran on 23-01-2026)
    const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
    const [highlightScheduleId, setHighlightScheduleId] = useState(null);
    const [shouldScrollToSchedule, setShouldScrollToSchedule] = useState(false);
    const navigate = useNavigate();

    // Mock data - similar to DeactivedTask
    const mockSchedulerData = [
        {
            id: 1,
            L11InstrumentAliasName: "CU-Summary1 (CU-Summary1)",
            L13ScheduleID: "SCH-001",
            L06ClientName: "DESKTOP-CU9J5T2",
            L09FTPAliasName: "FTP-Alias-1",
            L13LiveArchive: true,
            L13TaskName: "Daily Backup Task",
            L13SourcePath: "/path/to/source",
            L52TaskCompleted: "Completed",
            EmpowerStatus: "Active",
            L13UNCStatus: false,
            TaskStatus: "Activated",
            ClientStatus: "Active",
            InstrumentStatus: "Active",
            StartDate: "2024-01-15 10:00",
            UTCStartDate: "2024-01-15 08:00",
            EndDate: null,
            UTCEndDate: null,
            TriggerTime: "10:00:00",
            UTCTriggerTime: "08:00:00",
            ScheduleMode: "Daily",
            NextScheduleDate: "2024-03-20 10:00",
            UTCNextScheduleDate: "2024-03-20 08:00",
            LastScheduleDateTime: "2024-03-19 10:00",
            UTCLastScheduleDateTime: "2024-03-19 08:00",
            CreatedBy: "Admin",
            CreatedDate: "2024-01-10 09:00",
            UTCCreatedDate: "2024-01-10 07:00",
            ModifiedBy: "Admin",
            ModifiedDate: "2024-01-12 11:00",
            UTCModifiedDate: "2024-01-12 09:00"
        }
        // Add more mock data as needed
    ];


    // MODIFY THIS useEffect TO HANDLE BOTH PROP AND CONTEXT:
    // Replace lines ~120-170 with:
    useEffect(() => {
        console.log('=== ActivatedTask useEffect triggered ===');
        console.log('Navigation data from props:', navigationData);
        console.log('Context submission data:', getSubmissionData());

        // Priority 1: Check props passed from parent (tab system)
        if (navigationData && navigationData.scheduleId) {
            console.log('=== Received navigation data via props ===');
            console.log('Schedule ID:', navigationData.scheduleId);
            setHighlightScheduleId(navigationData.scheduleId);
            setShouldScrollToSchedule(true);

            // Add the new schedule to mock data if it doesn't exist
            const scheduleExists = schedulerData.some(item =>
                item.L13ScheduleID === navigationData.scheduleId
            );

            if (!scheduleExists && navigationData.scheduleId) {
                const newSchedule = {
                    id: schedulerData.length + 1,
                    L11InstrumentAliasName: navigationData.instrumentName || "New Instrument",
                    L13ScheduleID: navigationData.scheduleId,
                    L06ClientName: navigationData.clientName || "New Client",
                    L09FTPAliasName: "FTP-Alias-" + (schedulerData.length + 1),
                    L13LiveArchive: true,
                    L13TaskName: "New Schedule Task",
                    L13SourcePath: navigationData.sourcePath || "/new/path",
                    L52TaskCompleted: "Completed",
                    EmpowerStatus: "Active",
                    L13UNCStatus: false,
                    TaskStatus: "Activated",
                    ClientStatus: "Active",
                    InstrumentStatus: "Active",
                    StartDate: new Date().toISOString(),
                    UTCStartDate: new Date().toISOString(),
                    EndDate: null,
                    UTCEndDate: null,
                    TriggerTime: "10:00:00",
                    UTCTriggerTime: "08:00:00",
                    ScheduleMode: "Daily",
                    NextScheduleDate: new Date(Date.now() + 86400000).toISOString(),
                    UTCNextScheduleDate: new Date(Date.now() + 86400000).toISOString(),
                    LastScheduleDateTime: new Date().toISOString(),
                    UTCLastScheduleDateTime: new Date().toISOString(),
                    CreatedBy: "Admin",
                    CreatedDate: new Date().toISOString(),
                    UTCCreatedDate: new Date().toISOString(),
                    ModifiedBy: "Admin",
                    ModifiedDate: new Date().toISOString(),
                    UTCModifiedDate: new Date().toISOString()
                };

                setSchedulerData(prev => [newSchedule, ...prev]);
            }
        }
        // Priority 2: Check context (legacy navigation)
        else {
            const submissionData = getSubmissionData();
            console.log('Submission data from context:', submissionData);

            if (submissionData && submissionData.targetTab === 'Activated Task') {
                console.log('=== Navigating from context to ActivatedTask ===');
                console.log('Schedule ID:', submissionData.data?.scheduleId);
                setHighlightScheduleId(submissionData.data?.scheduleId);
                clearNavigation();
                setShouldScrollToSchedule(true);

                // Add to mock data if needed
                const scheduleExists = schedulerData.some(item =>
                    item.L13ScheduleID === submissionData.data?.scheduleId
                );

                if (!scheduleExists && submissionData.data?.scheduleId) {
                    const newSchedule = {
                        id: schedulerData.length + 1,
                        L11InstrumentAliasName: submissionData.data?.instrumentName || "New Instrument",
                        L13ScheduleID: submissionData.data?.scheduleId,
                        L06ClientName: submissionData.data?.clientName || "New Client",
                        L09FTPAliasName: "FTP-Alias-" + (schedulerData.length + 1),
                        L13LiveArchive: true,
                        L13TaskName: "New Schedule Task",
                        L13SourcePath: submissionData.data?.sourcePath || "/new/path",
                        L52TaskCompleted: "Completed",
                        EmpowerStatus: "Active",
                        L13UNCStatus: false,
                        TaskStatus: "Activated",
                        ClientStatus: "Active",
                        InstrumentStatus: "Active",
                        StartDate: new Date().toISOString(),
                        UTCStartDate: new Date().toISOString(),
                        EndDate: null,
                        UTCEndDate: null,
                        TriggerTime: "10:00:00",
                        UTCTriggerTime: "08:00:00",
                        ScheduleMode: "Daily",
                        NextScheduleDate: new Date(Date.now() + 86400000).toISOString(),
                        UTCNextScheduleDate: new Date(Date.now() + 86400000).toISOString(),
                        LastScheduleDateTime: new Date().toISOString(),
                        UTCLastScheduleDateTime: new Date().toISOString(),
                        CreatedBy: "Admin",
                        CreatedDate: new Date().toISOString(),
                        UTCCreatedDate: new Date().toISOString(),
                        ModifiedBy: "Admin",
                        ModifiedDate: new Date().toISOString(),
                        UTCModifiedDate: new Date().toISOString()
                    };

                    setSchedulerData(prev => [newSchedule, ...prev]);
                }
            }
        }
    }, [navigationData, getSubmissionData, clearNavigation, schedulerData]);

    // MODIFY THIS useEffect TO HANDLE HIGHLIGHTING:
    useEffect(() => {
        if (shouldScrollToSchedule && highlightScheduleId && schedulerData.length > 0) {
            // Find the row with the schedule ID
            const scheduleRow = schedulerData.find(item =>
                item.L13ScheduleID === highlightScheduleId
            );

            if (scheduleRow) {
                // Select and highlight the row
                setSelectedScheduler(scheduleRow);
                setSelectedRowId(scheduleRow.id);

                // Show success message
                showInfoDialog(`Schedule ${highlightScheduleId} created successfully and is now activated!`, "success");

                console.log('Auto-selected schedule:', highlightScheduleId);
            }

            setShouldScrollToSchedule(false);
        }
    }, [schedulerData, highlightScheduleId, shouldScrollToSchedule]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setSchedulerData(mockSchedulerData);
            setLoading(false);
        }, 500);
    }, []);

    const showInfoDialog = useCallback((scheduler, type = "information") => {
        setInfoDialog({
            open: true,
            scheduler,
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
        setSelectedScheduler(row);
        setSelectedRowId(row.id);
    }, []);

    //Commented by kirubhakaran on 23-01-2026
    // const handleViewClick = useCallback(() => {
    //     if (!selectedScheduler) {
    //         showInfoDialog(t('scheduler.selectRecordToView'), "warning");
    //         return;
    //     }
    //     navigate(`/scheduler/view/${selectedScheduler.L13ScheduleID}`);
    // }, [selectedScheduler, navigate, showInfoDialog, t]);

    // MODIFIED handleViewClick (remove navigate since no router):
    const handleViewClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecordToView'), "warning");
            return;
        }
        // In tab system, you might want to switch to edit tab or show modal
        showInfoDialog(`Viewing schedule ${selectedScheduler.L13ScheduleID}`, "information");
    }, [selectedScheduler, showInfoDialog, t]);

    const handleDeactivateClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }
        setActivePopup("Deactivate Task");
    }, [selectedScheduler, showInfoDialog, t]);

    const handleRetireClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }
        setActivePopup("Retire Task");
    }, [selectedScheduler, showInfoDialog, t]);

    const handleExportClick = useCallback(async () => {
        if (schedulerData.length === 0) {
            showInfoDialog(t('scheduler.noRecordsToExport'), "warning");
            return;
        }

        try {
            // Implement export logic based on jQuery's ActiveScheduler_export function
            showInfoDialog(t('scheduler.exportSuccess'), "success");
        } catch (error) {
            showInfoDialog(t('scheduler.exportFailed'), "error");
        }
    }, [schedulerData, showInfoDialog, t]);

    const handleImportClick = useCallback(() => {
        setImportModalOpen(true);
    }, []);

    const handlePrintClick = useCallback(() => {
        window.print();
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

    const handleDownloadTemplate = useCallback(() => {
        // Implement template download logic
        showInfoDialog(t('scheduler.templateDownloadStarted'), "success");
    }, [showInfoDialog, t]);

    const handleUploadSubmit = useCallback(async () => {
        if (!importFile) {
            showInfoDialog(t('scheduler.selectFileToUpload'), "warning");
            return;
        }

        try {
            // Implement file upload logic
            showInfoDialog(t('scheduler.importSuccess'), "success");
            setImportModalOpen(false);
            setImportFile(null);
        } catch (error) {
            showInfoDialog(t('scheduler.importFailed'), "error");
        }
    }, [importFile, showInfoDialog, t]);

    const columns = useMemo(() => [
        {
            key: 'L11InstrumentAliasName',
            label: t('scheduler.instrument'),
            width: 150,
            render: (row, isSelected) => (
                <div style={{
                    fontSize: '12px',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.L11InstrumentAliasName}</span>
                </div>
            )
        },
        {
            key: 'L13ScheduleID',
            label: t('scheduler.taskID'),
            width: 120,
            render: (row, isSelected) => (
                <div style={{
                    fontSize: '12px',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.L13ScheduleID}</span>
                </div>
            )
        },
        {
            key: 'L06ClientName',
            label: t('scheduler.clientName'),
            width: 150,
            render: (row, isSelected) => (
                <div style={{
                    fontSize: '12px',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.L06ClientName}</span>
                </div>
            )
        },
        {
            key: 'L09FTPAliasName',
            label: t('scheduler.storageName'),
            width: 150,
            render: (row, isSelected) => (
                <div style={{
                    fontSize: '12px',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.L09FTPAliasName}</span>
                </div>
            )
        },
        {
            key: 'L13LiveArchive',
            label: t('scheduler.liveArchive'),
            width: 140,
            render: (row, isSelected) => (
                <div style={{
                    fontSize: '12px',
                    color: '#374151',
                    textAlign: 'center',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold" : ''}>{row.L13LiveArchive ? "✓" : ""}</span>
                </div>
            )
        }
    ], [selectedRowId, t]);

    const renderSchedulerDetail = useCallback((scheduler) => (
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
                    {t('scheduler.taskName')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.L13TaskName}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.sourcePath')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.L13SourcePath}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.firstCycleStatus')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.L52TaskCompleted}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.empowerStatus')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.EmpowerStatus}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.uncStatus')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.L13UNCStatus ? t('scheduler.yes') : t('scheduler.no')}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.taskStatus')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.TaskStatus}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.clientStatus')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.ClientStatus}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.instrumentStatus')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.InstrumentStatus}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.startDate')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.StartDate}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.endDate')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.EndDate || t('scheduler.notSet')}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.triggerTime')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.TriggerTime}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.scheduleMode')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.ScheduleMode}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.nextScheduleDateTime')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.NextScheduleDate || t('scheduler.notSet')}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.lastScheduleDateTime')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.LastScheduleDateTime}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.createdBy')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.CreatedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.createdOn')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.CreatedDate}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.modifiedBy')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.ModifiedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40%', fontWeight: 'bold', color: '#4b5563' }}>
                    {t('scheduler.modifiedOn')}
                </div>
                <div style={{ width: '60%', color: '#1f2937' }}>
                    {scheduler.ModifiedDate}
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
                <div style={{ color: '#6b7280' }}>{t('scheduler.loading')}</div>
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
                    scheduler={infoDialog.scheduler}
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
                    icon={Eye}
                    label={t('button.view')}
                    onClick={handleViewClick}
                />
                <ActionButton
                    icon={ThumbsDown}
                    label={t('button.deactivate')}
                    onClick={handleDeactivateClick}
                />
                <ActionButton
                    icon={Ban}
                    label={t('button.retire')}
                    onClick={handleRetireClick}
                />
                <ActionButton
                    icon={Download}
                    label={t('button.export')}
                    onClick={handleExportClick}
                />
                <ActionButton
                    icon={Upload}
                    label={t('button.import')}
                    onClick={handleImportClick}
                />
                <ActionButton
                    icon={Printer}
                    label={t('button.print')}
                    onClick={handlePrintClick}
                />
            </div>

            {/* Main GridLayout with Details Panel */}
            <div style={{ flex: 1, fontFamily: 'verdana, sans-serif' }}>
                <GridLayout
                    columns={columns}
                    data={schedulerData}
                    renderDetailPanel={renderSchedulerDetail}
                    onRowClick={handleRowSelect}
                    searchable={false}
                    selectable={true}
                    hidePagination={false}
                />
            </div>

            {/* Import Modal */}
            {importModalOpen && (
                <CustomPopup
                    isOpen={importModalOpen}
                    onClose={handlePopupClose}
                    title={t('scheduler.importSchedule')}
                    content={
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            padding: '8px'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#374151'
                                }}>
                                    {t('scheduler.file')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".xlsx,.xls"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        outline: 'none'
                                    }}
                                />
                                <div style={{ color: '#9a9797', fontSize: '12px' }}>
                                    {t('scheduler.activeNoteBrowseUploadXlsAndXlxs')}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                paddingTop: '12px',
                                marginTop: '8px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <button
                                    onClick={handleDownloadTemplate}
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
                                    <Download style={{ width: '16px', height: '16px' }} /> {t('scheduler.getImportTemplate')}
                                </button>
                                <button
                                    onClick={handleUploadSubmit}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'white',
                                        backgroundColor: '#10b981',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Upload style={{ width: '16px', height: '16px' }} /> {t('scheduler.upload')}
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
                                    {t('scheduler.close')}
                                </button>
                            </div>
                        </div>
                    }
                    size="md"
                />
            )}

            {/* Deactivate/Retire Popup */}
            {activePopup === "Deactivate Task" || activePopup === "Retire Task" ? (
                <CustomPopup
                    isOpen={!!activePopup}
                    onClose={handlePopupClose}
                    title={activePopup === "Deactivate Task" ? t('scheduler.deactivateTask') : t('scheduler.retireTask')}
                    content={
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            padding: '8px'
                        }}>
                            {/* Audit trail form similar to DeactivedTask */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                    {t('scheduler.username')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={auditTrailData.username}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        color: '#374151',
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                    {t('scheduler.password')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    value={auditTrailData.password}
                                    onChange={(e) => setAuditTrailData(prev => ({ ...prev, password: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        outline: 'none'
                                    }}
                                    placeholder={t('scheduler.enterPassword')}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                    {t('scheduler.reason')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    value={auditTrailData.reason}
                                    onChange={(e) => setAuditTrailData(prev => ({ ...prev, reason: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">{t('scheduler.selectReason')}</option>
                                    {activePopup === "Deactivate Task" ? (
                                        <>
                                            <option value="Deactivated">{t('scheduler.deactivated')}</option>
                                            <option value="Modified">{t('scheduler.modified')}</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Retired">{t('scheduler.retired')}</option>
                                            <option value="Decommissioned">{t('scheduler.decommissioned')}</option>
                                            <option value="Replaced">{t('scheduler.replaced')}</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                    {t('scheduler.comments')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={auditTrailData.comments}
                                    onChange={(e) => setAuditTrailData(prev => ({ ...prev, comments: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        outline: 'none',
                                        resize: 'none'
                                    }}
                                    placeholder={t('scheduler.enterComments')}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                paddingTop: '12px',
                                marginTop: '8px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <button
                                    onClick={() => {
                                        if (activePopup === "Deactivate Task") {
                                            showInfoDialog(t('scheduler.taskDeactivatedSuccess'), "success");
                                        } else {
                                            showInfoDialog(t('scheduler.taskRetiredSuccess'), "success");
                                        }
                                        handlePopupClose();
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'white',
                                        backgroundColor: activePopup === "Deactivate Task" ? '#3b82f6' : '#ef4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {activePopup === "Deactivate Task" ? (
                                        <>
                                            <ThumbsDown style={{ width: '16px', height: '16px' }} /> {t('scheduler.submit')}
                                        </>
                                    ) : (
                                        <>
                                            <Ban style={{ width: '16px', height: '16px' }} /> {t('scheduler.retire')}
                                        </>
                                    )}
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
                                    {t('scheduler.close')}
                                </button>
                            </div>
                        </div>
                    }
                    size="md"
                />
            ) : null}
        </div>
    );
};

export default ActivatedTask;