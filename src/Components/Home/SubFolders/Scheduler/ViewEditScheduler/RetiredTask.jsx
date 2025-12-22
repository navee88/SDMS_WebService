import { useState, useMemo, useEffect, useCallback } from 'react';
import { Eye, Download, Printer } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import Errordialog from '../../../../Layout/Common/Errordialog';

const RetiredTask = () => {
    const [schedulerData, setSchedulerData] = useState([]);
    const [selectedScheduler, setSelectedScheduler] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });
    const { t } = useTranslation('scheduler');
    const navigate = useNavigate();

    // Mock data for retired tasks
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
            EmpowerStatus: "Inactive",
            L13UNCStatus: false,
            TaskStatus: "Retired",
            ClientStatus: "Inactive",
            InstrumentStatus: "Inactive",
            StartDate: "2024-01-15 10:00",
            UTCStartDate: "2024-01-15 08:00",
            EndDate: "2024-03-19 10:00",
            UTCEndDate: "2024-03-19 08:00",
            TriggerTime: "10:00:00",
            UTCTriggerTime: "08:00:00",
            ScheduleMode: "Daily",
            NextScheduleDate: null,
            UTCNextScheduleDate: null,
            LastScheduleDateTime: "2024-03-19 10:00",
            UTCLastScheduleDateTime: "2024-03-19 08:00",
            CreatedBy: "Admin",
            CreatedDate: "2024-01-10 09:00",
            UTCCreatedDate: "2024-01-10 07:00",
            ModifiedBy: "System",
            ModifiedDate: "2024-03-20 11:00",
            UTCModifiedDate: "2024-03-20 09:00"
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
            L52TaskCompleted: "Completed",
            EmpowerStatus: "Inactive",
            L13UNCStatus: true,
            TaskStatus: "Retired",
            ClientStatus: "Inactive",
            InstrumentStatus: "Inactive",
            StartDate: "2024-02-01 09:00",
            UTCStartDate: "2024-02-01 07:00",
            EndDate: "2024-03-27 09:00",
            UTCEndDate: "2024-03-27 07:00",
            TriggerTime: "09:00:00",
            UTCTriggerTime: "07:00:00",
            ScheduleMode: "Weekly",
            NextScheduleDate: null,
            UTCNextScheduleDate: null,
            LastScheduleDateTime: "2024-03-27 09:00",
            UTCLastScheduleDateTime: "2024-03-27 07:00",
            CreatedBy: "Admin",
            CreatedDate: "2024-01-20 10:00",
            UTCCreatedDate: "2024-01-20 08:00",
            ModifiedBy: "System",
            ModifiedDate: "2024-03-28 14:00",
            UTCModifiedDate: "2024-03-28 12:00"
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

    const handleExportClick = useCallback(async () => {
        if (schedulerData.length === 0) {
            showInfoDialog(t('scheduler.noRecordsToExport'), "warning");
            return;
        }
        
        try {
            // Implement export logic based on jQuery's RetireScheduler_export function
            // Similar to ActiveScheduler_export but with "RetiredScheduler" filename
            showInfoDialog(t('scheduler.exportSuccess'), "success");
        } catch (error) {
            showInfoDialog(t('scheduler.exportFailed'), "error");
        }
    }, [schedulerData, showInfoDialog, t]);

    const handlePrintClick = useCallback(() => {
        window.print();
    }, []);

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
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

            {/* Top Action Buttons - Only View, Export, Print for Retired Tasks */}
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
                    label={t('scheduler.view')}
                    onClick={handleViewClick}
                />
                <ActionButton
                    icon={Download}
                    label={t('button.export')}
                    onClick={handleExportClick}
                />
                <ActionButton
                    icon={Printer}
                    label={t('scheduler.print')}
                    onClick={handlePrintClick}
                />
            </div>

            {/* Main GridLayout with Details Panel */}
            <div style={{ flex: 1 ,fontFamily: 'verdana, sans-serif'}}>
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
        </div>
    );
};

export default RetiredTask;