import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, FileText, SquarePen, CheckSquare } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useLanguage } from '../../../../../Context/LanguageContext';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCallback } from 'react';
import Errordialog from "../../../../Layout/Common/Errordialog";
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import AnimatedTextarea from '../../../../Layout/Common/AnimatedTextarea';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import useAxios from '../../../../../Services/servicecall';
import { CF_sessionGet } from "../../../../Common/CF_session";

const UsersPage = ({
    data,
    selectedRowId,
    onRowSelect,
    showViewDetails,
    viewDetailsData
}) => {
    // const [userData, setUserData] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();
    // const [selectedRows, setSelectedRows] = useState([]);
    // const [selectedRowData, setSelectedRowData] = useState(null);
    const { postData } = useAxios();
    // const navigate = useNavigate();



    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoading(true);
    //         try {
    //             // Audit call
    //             // await postData('Scheduler/MonitorSchedulerViewAudit', CF_activeUserdetails());

    //             // Grid load
    //             // const response = await postData('Scheduler/UploadqueueSchedulerViewgrid', CF_activeUserdetails());

    //             // Map the response to match your component structure
    //             // const mappedData = response.map((item, index) => ({
    //             //     id: index + 1,
    //             //     clientName: item.L06ClientName,
    //             //     instrument: item.L11InstrumentName,
    //             //     live: item.L13LiveArchive,
    //             //     storageName: item.L09FTPAliasName,
    //             //     taskStatus: item.Status,
    //             //     scheduleId: item.L13ScheduleID,
    //             //     taskId: item.L52TaskID,
    //             //     sourcePath: item.L52TaskSourcePath,
    //             //     queue: item.L62Queue
    //             // }));

    //             // setUserData(mappedData);
    //             const loadGrid = async () => {
    //                 const response = await postData(
    //                     'Scheduler/UploadqueueSchedulerViewgrid',
    //                     CF_activeUserdetails()
    //                 );

    //                 const mapped = response.map((item, index) => ({
    //                     id: index + 1,
    //                     clientName: item.L06ClientName,
    //                     instrument: item.L11InstrumentName,
    //                     live: item.L13LiveArchive,
    //                     storageName: item.L09FTPAliasName,
    //                     taskStatus: item.Status,
    //                     scheduleId: item.L13ScheduleID,
    //                     taskId: item.L52TaskID,
    //                     sourcePath: item.L52TaskSourcePath,
    //                     queue: item.L62Queue
    //                 }));

    //                 setUserData(mapped);

    //                 // Auto-select first row
    //                 if (mapped.length > 0) {
    //                     setSelectedRowId(mapped[0].id);
    //                     setSelectedRowData(mapped[0]);
    //                 }
    //             };
    //         } catch (error) {
    //             console.error("Error fetching data:", error);
    //             setError(error.message || "Something went wrong");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, []);

    // useEffect(() => {
    //     loadGrid();
    // }, []);



    // const handleRowSelection = (id) => {
    //     setSelectedRows([id]); // Only allow single selection
    //     const selectedData = userData.find(row => row.id === id);
    //     setSelectedRowData(selectedData);
    //     if (onRowSelect) {
    //         onRowSelect(selectedData);
    //     }
    // };

    const userColumns = useMemo(() => [
        {
            key: 'clientName',
            label: t("label.clientName"),
            width: 200,
            enableSearch: true,
            render: (row) => (
                <span className="text-gray-700">
                    {row.clientName}
                </span>
            )
        },
        {
            key: 'instrument',
            label: t("label.instrument"),
            width: 250,
            enableSearch: true,
            render: (row) => (
                <span className="text-gray-700">
                    {row.instrument}
                </span>
            )
        },
        {
            key: 'live',
            label: t("label.live"),
            width: 150,
            render: (row) => (
                <label className="inline-flex items-center cursor-default">
                    <span className="w-4 h-4 border border-gray-400 flex items-center justify-center bg-gray-100">
                        {row.live && (
                            <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </span>
                </label>
            )
        }
    ], [t]); //selectedRows

    const ViewDetailsColumns = useMemo(() => [
        {
            key: 'clientName',
            label: t('label.clientName'),
            width: 180,
            enableSearch: true,
            render: (row, index) => {
                console.log("ClientName Render - Row:", row, "Index:", index);
                return <span className="text-gray-700">{row.clientName}</span>
            }
        },
        {
            key: 'instrument',
            label: t('label.instrument'),
            width: 180,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.instrument}</span>
        },
        {
            key: 'taskId',
            label: t('label.taskId'),
            width: 120,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.taskId}</span>
        },
        {
            key: 'filename',
            label: t('label.fileName'),
            width: 200,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.filename}</span>
        },
        {
            key: 'fileType',
            label: t('label.fileType'),
            width: 120,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.fileType}</span>
        },
        {
            key: 'captureDate',
            label: t('label.captureDate'),
            width: 200,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.captureDate}</span>
        },
        {
            key: 'captureDateUTC',
            label: t('label.captureDateUTC'),
            width: 150,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.captureDateUTC}</span>
        },
        {
            key: 'errorDescription',
            label: t('label.errorDescription'),
            width: 150,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.errorDescription}</span>
        }
    ], [t]);


    const renderUserDetail = (user) => (
        <div className="space-y-3 text-[12px]">
            {[
                { label: "storageName", value: user.storageName },
                { label: "taskStatus", value: user.taskStatus },
                { label: "scheduleId", value: user.scheduleId },
                { label: "taskId", value: user.taskId },
                { label: "sourcePath", value: user.sourcePath },
                { label: "queue", value: user.queue },
            ].map((field) => (
                <div key={field.label} className="grid grid-cols-3 gap-4">
                    <div className="font-semibold text-[12px] font-['Roboto'] text-[#405F7D]">
                        {t(`label.${field.label}`)}
                    </div>
                    <div className="col-span-2 font-semibold text-[12px] font-['Roboto'] text-[#353F49]">
                        {field.value}
                    </div>
                </div>
            ))}
        </div>
    );


    // if (loading) {
    //     return <div className="p-8 text-center text-gray-500">Loading...</div>;
    // }

    // if (error) {
    //     return <div className="p-8 text-center text-red-500"></div>;
    // }





    // UPDATE the return section:
    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {showViewDetails ? (
                <>
                    <div className="flex justify-end p-4 ">
                        {/* border-t border-gray-200 */}
                        <button
                            onClick={() => {
                                const event = new CustomEvent('closeViewDetails');
                                window.dispatchEvent(event);
                            }}
                            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors"
                        >
                            {t("button.close")}
                        </button>
                    </div>

                    <GridLayout
                        columns={ViewDetailsColumns}
                        data={viewDetailsData}
                    />
                </>
            ) : (
                <GridLayout
                    columns={userColumns}
                    data={data}
                    selectedRows={[selectedRowId]}
                    onRowClick={(row) => onRowSelect(row)}
                    renderDetailPanel={renderUserDetail}
                />
            )}
        </div>
    );
};


function CF_activeUserdetails() {
    const ActiveUserDetails = {
        sUserDomainName: CF_sessionGet("sDomainName", 1) || "SDMS",
        sSessionID: CF_sessionGet("sSessionID", 1) || "",
        sUserID: CF_sessionGet("sUserID", 1) || "",
        sTimeZoneID:
            (CF_sessionGet("sTimeZoneID", 1) || "Asia/Kolkata") +
            "<~>" +
            (CF_sessionGet("UTCStatus", 1) || "true"),
        sApplicationName: "SDMS",
        sdbtype: CF_sessionGet("sdbtype", 1) || "POSTGRESQL",
        sUsername: CF_sessionGet("sUsername", 1) || "",
        sSiteCode: CF_sessionGet("sSiteCode", 1) || "CH        ",
        sCategories: CF_sessionGet("sCategories", 1) || "DB",
        sUserGroupID: CF_sessionGet("sUserGroupID", 1) || "G1        ",
        sUserStatus: "",
        sTenantID: CF_sessionGet("sTenantID", 1) || ""
    };

    return {
        ActiveUserDetails,
        ApplicationCode: "SDMS"
    };
}

function UploadQueue() {
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [comments, setComments] = useState("");
    const [showError, setShowError] = useState(false);
    const [showAudit, setShowAudit] = useState(false);
    const [viewDetailsData, setViewDetailsData] = useState([]);
    const [showViewDetails, setShowViewDetails] = useState(false);
    const { postData } = useAxios();
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [userData, setUserData] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [loading, setLoading] = useState(true);

    // const loadGrid = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await postData(...);
    //         setUserData(mapped);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Add state for information dialog
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });

    // popup state
    const [activePopup, setActivePopup] = useState(null);
    const [scheduleMode, setScheduleMode] = useState("");
    // Function to show information dialog
    const showInfoDialog = useCallback((message, type = "information") => {
        setInfoDialog({
            open: true,
            message,
            type
        });
    }, []);

    // Function to close information dialog
    const closeInfoDialog = useCallback(() => {
        setInfoDialog(prev => ({
            ...prev,
            open: false
        }));
    }, []);

    const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold rounded whitespace-nowrap
      hover:scale-90 transition-all
      ${disabled
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-[#f1f5f9] text-[#2883FE] hover:bg-[#E6F0FF]"
                }
      ${className}
    `}
        >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{label}</span>
        </button>
    );

    // Handler to open popup
    const handleUpdateScheduleMode = () => {
        if (!selectedRowData) {
            showInfoDialog("Please select a row first!", "information");
            return;
        }
        setShowAudit(true);
    };

    // const handleAuthorizedUpdate = async (auditData) => {
    //     if (!selectedRowData) {
    //         showInfoDialog("Please select a row first!", "information");
    //         return;
    //     }

    //     try {
    //         const requestData = {
    //             AuditTrailValues: {
    //                 sUserPassword: auditData.password,
    //                 sUserDomainName: "SDMS",
    //                 sComments: auditData.comments,
    //                 sUserName: auditData.userName,
    //                 sReasonNo: auditData.reasonNo,
    //                 sReasonName: auditData.reasonName
    //             },
    //             ...CF_activeUserdetails(),
    //             bLiveStatus: true,
    //             sScheduleID: selectedRowData.scheduleId
    //         };

    //         const response = await postData('Scheduler/UpdateScheduleModeBtn', requestData);

    //         // Handle error response first
    //         if (response.returnMsg) {
    //             showInfoDialog(response.returnMsg, "information");
    //             setShowAudit(false);
    //             return; // Stop execution here
    //         }

    //         // Handle success response
    //         if (response.Rtn === "Success" && response.returnservice) {
    //             showInfoDialog("Schedule mode updated successfully", "success");

    //             // Update the grid with new data from returnservice
    //             const mappedData = response.returnservice.map((item, index) => ({
    //                 id: index + 1,
    //                 clientName: item.L06ClientName,
    //                 instrument: item.L11InstrumentName,
    //                 live: item.L13LiveArchive,
    //                 storageName: item.L09FTPAliasName,
    //                 taskStatus: item.Status,
    //                 scheduleId: item.L13ScheduleID,
    //                 taskId: item.L52TaskID,
    //                 sourcePath: item.L52TaskSourcePath,
    //                 queue: item.L62Queue
    //             }));

    //             // Reload grid in UsersPage - you'll need to lift state up or use a callback
    //             // For now, refresh the entire page or call the initial fetch again
    //             // window.location.reload(); // Simple solution, or implement proper state management
    //         }

    //         setShowAudit(false);
    //     } catch (error) {
    //         console.error("Error updating schedule mode:", error);
    //         showInfoDialog("Error updating schedule mode", "error");
    //         setShowAudit(false);
    //     }
    // };

    const handleAuthorizedUpdate = async (auditData) => {
        try {
            const requestData = {
                AuditTrailValues: {
                    sUserPassword: auditData.password,
                    sUserDomainName: "SDMS",
                    sComments: auditData.comments,
                    sUserName: auditData.userName,
                    sReasonNo: auditData.reasonNo,
                    sReasonName: auditData.reasonName
                },
                ...CF_activeUserdetails(),
                bLiveStatus: selectedRowData.live,
                sScheduleID: selectedRowData.scheduleId
            };

            const response = await postData(
                'Scheduler/UpdateScheduleModeBtn',
                requestData
            );

            // ❌ Error case from backend
            if (response.returnMsg) {
                showInfoDialog(response.returnMsg, "information");
                setShowAudit(false);
                return;
            }

            // ✅ Success
            if (response.Rtn === "Success") {
                showInfoDialog("Schedule mode updated successfully", "success");

                // 🔥 Update grid immediately
                const updatedGrid = response.returnservice.map((item, index) => ({
                    id: index + 1,
                    clientName: item.L06ClientName,
                    instrument: item.L11InstrumentName,
                    live: item.L13LiveArchive,
                    storageName: item.L09FTPAliasName,
                    taskStatus: item.Status,
                    scheduleId: item.L13ScheduleID,
                    taskId: item.L52TaskID,
                    sourcePath: item.L52TaskSourcePath,
                    queue: item.L62Queue
                }));

                setUserData(updatedGrid);

                // 🔁 Restore selection
                const updatedRow = updatedGrid.find(
                    r => r.scheduleId === selectedRowData.scheduleId
                );
                if (updatedRow) {
                    setSelectedRowId(updatedRow.id);
                    setSelectedRowData(updatedRow);
                }
            }

            setShowAudit(false);
        } catch (e) {
            showInfoDialog("Error updating schedule mode", "error");
            setShowAudit(false);
        }
    };


    // Handler to close popup and show info dialog
    const handlePopupClose = () => {
        setActivePopup(null);
        // Show info dialog after closing popup
        // showInfoDialog("Schedule mode popup closed", "success");
    };

    // Handler to submit form
    const handlePopupSubmit = () => {
        if (!comments.trim()) {
            setShowError(true);
            return;
        }

        if (!scheduleMode) {
            // showInfoDialog("Please select a schedule mode", "information");
            return;
        }

        console.log("Comments:", comments);

        setShowError(false);
        setComments("");
        setScheduleMode("");

        // showInfoDialog("Schedule mode updated successfully", "success");
        setActivePopup(null);
    };

    // const handleViewDetails = async () => {
    //     if (!selectedRowData) {
    //         showInfoDialog("Please select a row first!", "information");
    //         return;
    //     }

    //     try {
    //         const response = await postData('Scheduler/UploadqueueViewDetailsGrid', {
    //             sTaskID: selectedRowData.taskId,
    //             ...CF_activeUserdetails()
    //         });

    //         if (!response || response.length === 0) {
    //             showInfoDialog("No records found here!", "information");
    //             return;
    //         }

    //         setViewDetailsData(response);
    //         setShowViewDetails(true);
    //     } catch (error) {
    //         showInfoDialog("Error fetching details", "error");
    //     }
    // };

    const handleViewDetails = async () => {
        if (!selectedRowData) {
            showInfoDialog("Please select a row first!", "information");
            return;
        }

        try {
            const requestData = {
                sTaskID: selectedRowData.taskId,
                ActiveUserDetails: CF_activeUserdetails().ActiveUserDetails,
                ApplicationCode: "SDMS"
            };

            const response = await postData('Scheduler/UploadqueueViewDetailsGrid', requestData);

            if (!response || response.length === 0) {
                showInfoDialog("No records found here!", "information");
                return;
            }

            // Map the response data
            const mappedDetailsData = response.map((item, index) => ({
                id: index + 1,
                clientName: item.L06ClientName,
                instrumentName: item.L11InstrumentName,
                taskId: item.L62TaskID,
                fileName: item.L62FileName,
                fileType: item.L62FileType,
                captureDate: item.CaptureDate,
                utcCaptureDate: item.UTCCaptureDate
            }));

            setViewDetailsData(mappedDetailsData);
            setShowViewDetails(true);
        } catch (error) {
            console.error("Error fetching details:", error);
            showInfoDialog("Error fetching details", "error");
        }
    };

    // useEffect(() => {
    //     const handleCloseViewDetails = () => {
    //         setShowViewDetails(false);
    //         setViewDetailsData([]);
    //     };

    //     window.addEventListener('closeViewDetails', handleCloseViewDetails);
    //     return () => window.removeEventListener('closeViewDetails', handleCloseViewDetails);
    // }, []);

    useEffect(() => {
        const handleCloseViewDetails = () => {
            setShowViewDetails(false);
            // DON'T clear viewDetailsData and selectedRowData - keep them
            // setViewDetailsData([]); // REMOVE THIS LINE
            // Keep selectedRowData intact so row selection persists
        };

        window.addEventListener('closeViewDetails', handleCloseViewDetails);
        return () => window.removeEventListener('closeViewDetails', handleCloseViewDetails);
    }, []);



    const loadGrid = async () => {

        setLoading(true);
        try {
            const response = await postData(
                'Scheduler/UploadqueueSchedulerViewgrid',
                CF_activeUserdetails()
            );

            const mapped = response.map((item, index) => ({
                id: index + 1,
                clientName: item.L06ClientName,
                instrument: item.L11InstrumentName,
                live: item.L13LiveArchive,
                storageName: item.L09FTPAliasName,
                taskStatus: item.Status,
                scheduleId: item.L13ScheduleID,
                taskId: item.L52TaskID,
                sourcePath: item.L52TaskSourcePath,
                queue: item.L62Queue
            }));

            setUserData(mapped);

            if (mapped.length > 0) {
                setSelectedRowId(mapped[0].id);
                setSelectedRowData(mapped[0]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadGrid();
    }, []);

    return (
        <div className="px-4 font-roboto h-[calc(100vh-150px)] flex flex-col">
            {/* Information Dialog */}
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

            {/* Top Action Buttons */}
            {!showViewDetails && (<div className="flex justify-end gap-2 mt-4">
                <ActionButton
                    icon={FileText}
                    label={t('button.viewDetails')}
                    onClick={handleViewDetails}
                />
                <ActionButton
                    icon={SquarePen}
                    label={t('button.updateScheduleMode')}
                    onClick={handleUpdateScheduleMode}
                />
            </div>)}

            {/* UsersPage takes full width & height */}
            <div className="flex-1 overflow-hidden">
                {/* <UsersPage
                    onRowSelect={setSelectedRowData}
                    showViewDetails={showViewDetails}
                    viewDetailsData={viewDetailsData}
                /> */}

                <UsersPage
                    data={userData}
                    selectedRowId={selectedRowId}
                    onRowSelect={(row) => {
                        setSelectedRowId(row.id);
                        setSelectedRowData(row);
                    }}
                    showViewDetails={showViewDetails}
                    viewDetailsData={viewDetailsData}
                />

            </div>

            {/* Audit Trail */}
            <AuditTrail
                isOpen={showAudit}
                onClose={() => setShowAudit(false)}
                onAuthorized={handleAuthorizedUpdate}
                actionLabel="Submit"
            />
        </div>
    );

}

export default UploadQueue
