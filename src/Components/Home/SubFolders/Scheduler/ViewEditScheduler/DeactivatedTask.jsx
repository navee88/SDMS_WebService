import { useState, useMemo, useEffect, useCallback } from 'react';
import { Eye, Check, Ban, Download, Printer } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';

const DeactivedTask = () => {
    const [schedulerData, setSchedulerData] = useState([]);
    const [selectedScheduler, setSelectedScheduler] = useState(null);
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
    const { t } = useTranslation('scheduler');
    const navigate = useNavigate();

    // Mock data - replace with API call
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
            TaskStatus: "Deactivated",
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
        },
        {
            id: 2,
            L11InstrumentAliasName: "MU-Summary1 (MU-Summary1)",
            L13ScheduleID: "SCH-002",
            L06ClientName: "DESKTOP-MU9J5T2",
            L09FTPAliasName: "FTP-Alias-2",
            L13LiveArchive: false,
            L13TaskName: "Weekly Backup Task",
            L13SourcePath: "/another/path",
            L52TaskCompleted: "In Progress",
            EmpowerStatus: "Inactive",
            L13UNCStatus: true,
            TaskStatus: "Deactivated",
            ClientStatus: "Inactive",
            InstrumentStatus: "Maintenance",
            StartDate: "2024-02-01 09:00",
            UTCStartDate: "2024-02-01 07:00",
            EndDate: "2024-12-31 18:00",
            UTCEndDate: "2024-12-31 16:00",
            TriggerTime: "09:00:00",
            UTCTriggerTime: "07:00:00",
            ScheduleMode: "Weekly",
            NextScheduleDate: "2024-03-27 09:00",
            UTCNextScheduleDate: "2024-03-27 07:00",
            LastScheduleDateTime: "2024-03-20 09:00",
            UTCLastScheduleDateTime: "2024-03-20 07:00",
            CreatedBy: "Admin",
            CreatedDate: "2024-01-20 10:00",
            UTCCreatedDate: "2024-01-20 08:00",
            ModifiedBy: "User",
            ModifiedDate: "2024-02-15 14:00",
            UTCModifiedDate: "2024-02-15 12:00"
        }
    ];

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setSchedulerData(mockSchedulerData);
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
        setSelectedScheduler(row);
        setSelectedRowId(row.id);
    }, []);

    const handleViewClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecordToView'), "warning");
            return;
        }
        navigate(`/scheduler/view/${selectedScheduler.L13ScheduleID}`);
    }, [selectedScheduler, navigate, showInfoDialog, t]);

    const handleActivateClick = useCallback(() => {
        if (!selectedScheduler) {
            showInfoDialog(t('scheduler.selectRecord'), "warning");
            return;
        }
        setActivePopup("Activate Task");
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
            // Implement export logic
            showInfoDialog(t('scheduler.exportSuccess'), "success");
        } catch (error) {
            showInfoDialog(t('scheduler.exportFailed'), "error");
        }
    }, [schedulerData, showInfoDialog, t]);

    const handlePrintClick = useCallback(() => {
        window.print();
    }, []);

    const handlePopupClose = useCallback(() => {
        setActivePopup(null);
        setAuditTrailData({
            username: "Administrator",
            password: "",
            reason: "",
            comments: ""
        });
    }, []);

    const columns = useMemo(() => [
        {
            key: 'L11InstrumentAliasName',
            label: t('scheduler.instrument'), // Translated
            width: 150,
            render: (row,isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#374151',
                    overflow: 'hidden',
                   
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold":''}>{row.L11InstrumentAliasName}</span>
                </div>
            )
        },
        {
            key: 'L13ScheduleID',
            label: t('scheduler.taskID'), // Translated
            width: 90,
            render: (row,isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold":''}>{row.L13ScheduleID}</span>
                </div>
            )
        },
        {
            key: 'L06ClientName',
            label: t('scheduler.clientName'), // Translated
            width: 150,
            render: (row,isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                  <span className={isSelected ? "font-bold":''}>{row.L06ClientName}</span>
                </div>
            )
        },
        {
            key: 'L09FTPAliasName',
            label: t('scheduler.storageName'), // Translated
            width: 100,
            render: (row,isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold":''}>{row.L09FTPAliasName}</span>
                    
                </div>
            )
        },
        {
            key: 'L13LiveArchive',
            label: t('scheduler.liveArchive'), // Translated
            width: 140,
            render: (row,isSelected) => (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#374151',
                    textAlign: 'center',
                    fontWeight: selectedRowId === row.id ? 'bold' : 'normal'
                }}>
                    <span className={isSelected ? "font-bold":''}>{row.L13LiveArchive ? "✓" : ""}</span>
                    
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
            fontFamily:'Roboto, sans-serif',
            fontSize: '12px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.taskName')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.L13TaskName}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.sourcePath')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.L13SourcePath}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.firstCycleStatus')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.L52TaskCompleted}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.empowerStatus')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                  {scheduler.EmpowerStatus}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.uncStatus')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.L13UNCStatus ? t('scheduler.yes') : t('scheduler.no')} {/* Translated Yes/No */}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.taskStatus')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.TaskStatus}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.clientStatus')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.ClientStatus}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.instrumentStatus')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.InstrumentStatus}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.startDate')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.StartDate}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.endDate')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.EndDate || t('scheduler.notSet')}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.triggerTime')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.TriggerTime}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.scheduleMode')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.ScheduleMode}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.nextScheduleDateTime')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.NextScheduleDate || t('scheduler.notSet')}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.lastScheduleDateTime')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.LastScheduleDateTime}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.createdBy')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.CreatedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.createdOn')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.CreatedDate}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.modifiedBy')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
                    {scheduler.ModifiedBy}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                    width: '40%',
                    fontWeight:'bold',
                    color: '#4b5563'
                }}>
                    {t('scheduler.modifiedOn')} {/* Translated */}
                </div>
                <div style={{ 
                    width: '60%',
                    color: '#1f2937'
                }}>
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
                    icon={Eye}
                    label={t('button.view')}
                    onClick={handleViewClick}
                />
                <ActionButton
                    icon={Check}
                    label={t('button.activate')}
                    onClick={handleActivateClick}
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
                    icon={Printer}
                    label={t('button.print')}
                    onClick={handlePrintClick}
                />
            </div>

            {/* Main GridLayout with Details Panel */}
            <div style={{ flex: 1,fontSize:"12px",fontFamily: 'roboto, sans-serif' }}>
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

            {/* Custom Popup for Actions */}
            {activePopup === "Activate Task" || activePopup === "Retire Task" ? (
                <CustomPopup
                    isOpen={!!activePopup}
                    onClose={handlePopupClose}
                    title={activePopup === "Activate Task" ? t('scheduler.activateTask') : t('scheduler.retireTask')}
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
                                <label style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 600, 
                                    color: '#374151' 
                                }}>
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
                                <label style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 600, 
                                    color: '#374151' 
                                }}>
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
                                    {activePopup === "Activate Task" ? (
                                        <>
                                            <option value="Activated">{t('scheduler.activated')}</option>
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
                                <label style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 600, 
                                    color: '#374151' 
                                }}>
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
                                        if (activePopup === "Activate Task") {
                                            showInfoDialog(t('scheduler.taskActivatedSuccess'), "success");
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
                                        backgroundColor: activePopup === "Activate Task" ? '#3b82f6' : '#ef4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {activePopup === "Activate Task" ? (
                                        <>
                                            <Check style={{ width: '16px', height: '16px' }} /> {t('button.submit')}
                                        </>
                                    ) : (
                                        <>
                                            <Ban style={{ width: '16px', height: '16px' }} /> {t('button.retire')}
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
                                    {t('button.close')}
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

export default DeactivedTask;