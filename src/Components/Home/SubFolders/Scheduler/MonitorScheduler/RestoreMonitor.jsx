import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Filter, RotateCcw, RefreshCw, Settings, ChevronUp, ChevronDown, X, CheckSquare,
    FolderDown, Upload, FolderUp, FileClock, History, Tag, FileText, FolderOpen, Download,
    CheckCircle, List, MoreVertical, MousePointer2, Calendar,
    UploadIcon,
    Search,
} from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import { useLanguage } from '../../../../../Context/LanguageContext';
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Errordialog from '../../../../Layout/Common/Errordialog';
import { CF_encrypt, CF_decrypt } from '../../../../../Components/Common/encryptiondecryption';
import { CF_sessionGet } from "../../../../Common/CF_session";
import { handleExportCommon } from '../../../../Layout/Common/exportService';
import useAxios from '../../../../../Services/servicecall';

const ACTION_ICONS = {
    "Open": FolderOpen,
    "File Download": Download,
    "Restore": RotateCcw,
    "Folder Download": FolderDown,
    "File Upload": Upload,
    "Folder Upload": FolderUp,
    "Version History": FileClock,
    "Workflow History": History,
    "Tag": Tag,
    "Audit Trail History": List,
    "Attribute": FileText,
    "Multi-File Select": MousePointer2,
    "Work Complete": CheckCircle
};

const ALL_ACTION_ORDER = [
    "Open",
    "File Download",
    "Restore",
    "Folder Download",
    "File Upload",
    "Folder Upload",
    "Version History",
    "Work Complete",
    "Workflow History",
    "Tag",
    "Audit Trail History",
    "Attribute",
    "Multi-File Select"
];

const CUSTOM_FILTERS = ["Instrument", "Workflow Status", "Task Status"];
const CUSTOM_COLUMNS = ["Parser Status"];

const CheckboxItem = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between py-2 hover:bg-slate-50 px-2 rounded cursor-pointer group transition-colors mr-2">
        <span className="text-slate-700 font-medium text-sm select-none group-hover:text-blue-700">{label}</span>
        <input
            type="checkbox"
            checked={!!checked}
            onChange={() => onChange(label)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
    </label>
);

const PrimaryButton = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1 px-2.5 py-2 hover:scale-90 transition-all bg-white text-[#2883FE] text-[11px] font-bold rounded shadow-sm border border-transparent hover:bg-blue-50  whitespace-nowrap"
    >
        <Icon className="w-4 h-4 stroke-[3]" />
        <span>{label}</span>
    </button>
);

const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "" }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold rounded  whitespace-nowrap hover:scale-90 transition-all
      ${disabled
                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                : "bg-[#f1f5f9] text-[#1d8cf8] hover:bg-blue-100"
            }
      ${className}
    `}
    >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{label}</span>
    </button>
);

const SummaryItem = ({ label, value }) => (
    <div className="flex items-center gap-1 text-xs">
        <span className="font-medium text-slate-800">{value}</span>
    </div>
);

const DatePicker = ({ label, value, onChange, max }) => (
    <div className="flex flex-col w-full">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
        <input
            type="date"
            value={value}
            max={max}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border-b border-slate-300 pb-1 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-500"
        />
    </div>
);

const ConfigModal = ({ onClose, currentVisibility, onSave }) => {
    const [tempVisibility, setTempVisibility] = useState({ ...currentVisibility });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            setPosition({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y });
        };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const toggleVisibility = (label) => {
        setTempVisibility(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const handleSubmit = () => {
        onSave(tempVisibility);
        onClose();
    };

    const scrollbarStyles = {
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 #f1f5f9'
    };

    return (
        <>
            <style>
                {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
            </style>

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                <div
                    style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                    className="bg-white w-[650px] max-w-[95%] rounded-md shadow-2xl flex flex-col max-h-[90vh] border border-slate-200"
                >
                    <div
                        onMouseDown={handleMouseDown}
                        className="flex items-center justify-between px-6 py-3 border-b border-slate-100 cursor-move bg-slate-50/50 rounded-t-md select-none"
                    >
                        <h2 className="text-xl font-semibold text-blue-700">Configuration</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-6 pt-[20px] overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-blue-800 font-bold mb-3">Custom Filter</h3>
                                    <div className="space-y-1">
                                        {CUSTOM_FILTERS.map(item => (
                                            <CheckboxItem
                                                key={item}
                                                label={item}
                                                checked={tempVisibility[item]}
                                                onChange={toggleVisibility}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-blue-800 font-bold mb-3">Custom Column</h3>
                                    <div className="space-y-1">
                                        {CUSTOM_COLUMNS.map(item => (
                                            <CheckboxItem
                                                key={item}
                                                label={item}
                                                checked={tempVisibility[item]}
                                                onChange={toggleVisibility}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="md:border-l md:border-slate-200 md:pl-8 flex flex-col">
                                <h3 className="text-blue-800 font-bold mb-3">Custom Actions</h3>
                                <div
                                    className="space-y-1 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar"
                                    style={scrollbarStyles}
                                >
                                    {ALL_ACTION_ORDER.map(item => (
                                        <CheckboxItem
                                            key={item}
                                            label={item}
                                            checked={tempVisibility[item]}
                                            onChange={toggleVisibility}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 px-6 py-4 border-t text-[13px] border-slate-100 bg-slate-50/50 rounded-b-md mt-4">
                        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm">
                            <CheckSquare className="w-3.5 h-3.5" /> Submit
                        </button>
                        <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-600 font-medium rounded hover:bg-slate-50 transition-colors shadow-sm">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // return `${year}-${month}-${day}`;
    return `${day}/${month}/${year}`;
};


const UsersPage = ({ filters, exportTrigger, onDataCountChange }) => {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useTranslation();
    const { currentLanguage, changeLanguage, languages } = useLanguage();

    useEffect(() => {
        if (filters?.data) {
            setUserData(filters.data);
            if (onDataCountChange) {
                onDataCountChange(filters.data.length);
            }
        }
    }, [filters, onDataCountChange]);

    const userColumns = useMemo(() => [
        {
            key: 'clientName',
            label: t('label.clientName'),
            width: 180,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.clientName}</span>
        },
        {
            key: 'fileName',
            label: t('label.fileName'),
            width: 250,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.fileName}</span>
        },
        {
            key: 'taskStatus',
            label: t('label.taskStatus'),
            width: 120,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.taskStatus}</span>
        }
    ], [t]);

    useEffect(() => {
        if (exportTrigger === 0) return;
        if (!userData.length) return;

        const headers = userColumns.map(col => col.label);

        const rows = userData.map(row =>
            userColumns.map(col => row[col.key] ?? "")
        );

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        const colWidths = userColumns.map((col) => {
            const headerLength = col.label.length;
            const maxDataLength = Math.max(
                ...userData.map(row => {
                    const value = String(row[col.key] ?? "");
                    return value.length;
                }),
                0
            );
            const maxLength = Math.max(headerLength, maxDataLength);
            return { wch: maxLength + 2 };
        });

        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Upload Logs");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const file = new Blob([excelBuffer], {
            type: "application/octet-stream"
        });

        saveAs(file, `Manual_Upload_Logs_${Date.now()}.xlsx`);
    }, [exportTrigger, userData, userColumns]);



    const renderUserDetail = (user) => (
        <div className="space-y-3 text-[12px]">
            {[
                { label: "sourcePath", value: user.sourcePath || "D:\\SDMSFTP\\SourcePath" },
                { label: "type", value: user.type || "TS1" },
                { label: "restoreLocation", value: user.restoreLocation || "D:\\SDMSFTP\\Restore" },
                { label: "errorDescription", value: user.errorDescription || "NO Error" },
                { label: "restoredBy", value: user.restoredBy || "" },
                { label: "restoredOn", value: user.restoredOn || "" },
            ].map((field, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
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


    return (
        <div className="flex flex-col mt-2">
            <GridLayout
                columns={userColumns}
                data={userData}
                renderDetailPanel={renderUserDetail}
            />
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

const RestoreMonitor = () => {
    const today = getCurrentDate();
    const { t } = useTranslation();
    const { postData } = useAxios(); // ← Move here (was after usage)

    // States
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false); // ← Add this (was missing)
    const [userData, setUserData] = useState([]); // ← Add this (was missing)
    const [showConfig, setShowConfig] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [visibleCount, setVisibleCount] = useState(9);
    const [recordsDuration, setRecordsDuration] = useState("Current Date");
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [selectedClient, setSelectedClient] = useState(""); // ← Change from options[0]
    const [taskId, setTaskId] = useState("");
    const [fileName, setFileName] = useState("");
    const [filters, setFilters] = useState({});
    const [exportTrigger, setExportTrigger] = useState(0);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [dataCount, setDataCount] = useState(0);
    const [clientList, setClientList] = useState([]);
    const [taskList, setTaskList] = useState([]);
    const [errorDialog, setErrorDialog] = useState({ show: false, message: "", type: "" });
    const [isClientTouched, setIsClientTouched] = useState(false);
    const [isTaskTouched, setIsTaskTouched] = useState(false);


    const { currentLanguage, changeLanguage, languages } = useLanguage();

    const menuRef = useRef(null);
    const actionContainerRef = useRef(null);
    const buttonRefs = useRef([]);

    const [configState, setConfigState] = useState({
        "Restore": true,
        "Folder Download": true,
        "File Upload": true,
        "Folder Upload": true,
        "Version History": true,
        "Work Complete": true,
        "Workflow History": true,
        "Tag": true,
        "Open": true,
        "File Download": true,
        "Audit Trail History": true,
        "Attribute": true,
        "Multi-File Select": true,
        "Instrument": true,
        "Workflow Status": true,
        "Task Status": true,
        "Parser Status": false
    });

    const enabledActions = ALL_ACTION_ORDER.filter(action => configState[action]);

    useEffect(() => {
        const calculateVisibleActions = () => {
            if (!actionContainerRef.current) return;

            const containerWidth = actionContainerRef.current.offsetWidth;
            const reservedSpace = 140;
            const availableWidth = containerWidth - reservedSpace;

            let accumulatedWidth = 0;
            let count = 0;

            for (let i = 0; i < buttonRefs.current.length; i++) {
                const button = buttonRefs.current[i];
                if (!button) continue;

                const buttonWidth = button.offsetWidth + 8;

                if (accumulatedWidth + buttonWidth <= availableWidth) {
                    accumulatedWidth += buttonWidth;
                    count++;
                } else {
                    break;
                }
            }

            setVisibleCount(Math.max(1, count));
        };

        calculateVisibleActions();

        window.addEventListener('resize', calculateVisibleActions);

        const timer = setTimeout(calculateVisibleActions, 100);

        return () => {
            window.removeEventListener('resize', calculateVisibleActions);
            clearTimeout(timer);
        };
    }, [configState, enabledActions.length]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const visibleActions = enabledActions.slice(0, visibleCount);
    const overflowActions = enabledActions.slice(visibleCount);

    const isCustomDate = recordsDuration === "Custom Date";

    const handleDurationChange = (value) => {
        const actualValue = value?.target?.value || value?.value || value;
        setRecordsDuration(actualValue);
    };

    //calculate the current date minus the records duration date
    const formatDateDDMMYYYY = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getDateRange = (duration, fromDate, toDate) => {
        const today = new Date();
        let startDate, endDate;

        switch (duration) {
            case "Current Date":
                startDate = endDate = formatDateDDMMYYYY(today);
                break;

            case "Last 7 Days": {
                const start = new Date();
                start.setDate(today.getDate() - 7);
                startDate = formatDateDDMMYYYY(start);
                endDate = formatDateDDMMYYYY(today);
                break;
            }

            case "Last 30 Days": {
                const start = new Date();
                start.setDate(today.getDate() - 30);
                startDate = formatDateDDMMYYYY(start);
                endDate = formatDateDDMMYYYY(today);
                break;
            }

            case "Last 1 Year": {
                const start = new Date();
                start.setFullYear(today.getFullYear() - 1);
                startDate = formatDateDDMMYYYY(start);
                endDate = formatDateDDMMYYYY(today);
                break;
            }

            case "Custom Date":
                startDate = formatDateDDMMYYYY(new Date(fromDate));
                endDate = formatDateDDMMYYYY(new Date(toDate));
                break;

            default:
                startDate = endDate = formatDateDDMMYYYY(today);
        }

        return { startDate, endDate };
    };

    const fetchClientList = async () => {
        try {
            const payload = CF_activeUserdetails();
            const result = await postData('AuditTrail/AuditTrailClientname', payload);

            if (Array.isArray(result) && result.length > 0) {
                const clients = result.map(item => item.L06ClientName);

                setClientList(clients);

                setSelectedClient(prev =>
                    prev ? prev : clients[0]
                );
            }
        } catch (error) {
            console.error('Error fetching client list:', error);
        }
    };


    const fetchTaskList = async () => {
        try {
            const payload = {
                sType: "R",
                ...CF_activeUserdetails()
            };

            const result = await postData('Scheduler/getTaskDownload', payload);

            if (Array.isArray(result) && result.length > 0) {
                const tasks = result.map(item => item.sTaskID);

                setTaskList(tasks);

                // AUTO SELECT FIRST TASK
                setTaskId(prev =>
                    prev ? prev : tasks[0]
                );
            }
        } catch (error) {
            console.error('Error fetching task list:', error);
        }
    };


    useEffect(() => {
        const initializeComponent = async () => {
            await Promise.all([
                fetchClientList(),
                fetchTaskList()
            ]);
            // INITIAL LOAD with bStatus=true (like jQuery)
            await handleInitialLoad();
        };
        initializeComponent();
    }, []);

    // ADD THIS NEW FUNCTION (matches jQuery initial load)
    const handleInitialLoad = async () => {
        setLoading(true);
        try {
            const sFromDate = formatDateDDMMYYYY(today);
            const sToDate = formatDateDDMMYYYY(today);

            const payload = {
                bStatus: true,
                sFromDate: sFromDate,
                sToDate: sToDate,
                sClientID: "",
                sFileName: "",
                sDownloadTaskID: "",
                ...CF_activeUserdetails()
            };

            const result = await postData('Scheduler/getRestoreMonitor', payload);

            if (result && Array.isArray(result)) {
                const mappedData = result.map((item, index) => ({
                    id: index + 1,
                    clientName: item.sClientName || "",
                    fileName: item.sFileName || "",
                    taskStatus: item.sTaskStatus || "",
                    sourcePath: item.sSourcePath || "",
                    type: item.sFileType || "",
                    restoreLocation: item.sRestoreLocation || "",
                    errorDescription: item.sErrorDescription || "",
                    restoredBy: item.sRestoreBy || "",
                    restoredOn: item.sTimeStamp || ""
                }));

                setUserData(mappedData);
                setFilters({ ...payload, data: mappedData });
            }
            setLoading(false);
        } catch (error) {
            console.error('Error in initial load:', error);
            setLoading(false);
        }
    };

    const fetchRestoreMonitor = async ({ isRefresh = false } = {}) => {
        console.group("Restore Monitor API");
        setLoading(true);

        try {
            const { startDate, endDate } = getDateRange(recordsDuration, fromDate, toDate);

            const payload = {
                bStatus: false,
                sFromDate: startDate,
                sToDate: endDate,
                sClientID: selectedClient || "",
                sFileName: fileName || "",
                sDownloadTaskID: taskId || "",
                ...CF_activeUserdetails()
            };

            console.log("Request Payload:", payload);

            const response = await postData("Scheduler/getRestoreMonitor", payload);

            console.log("API Response:", response);

            if (Array.isArray(response)) {
                const mapped = response.map((item, index) => ({
                    id: index + 1,
                    clientName: item.sClientName || "",
                    fileName: item.sFileName || "",
                    taskStatus: item.sTaskStatus || "",
                    sourcePath: item.sSourcePath || "",
                    type: item.sFileType || "",
                    restoreLocation: item.sRestoreLocation || "",
                    errorDescription: item.sErrorDescription || "",
                    restoredBy: item.sRestoreBy || "",
                    restoredOn: item.sTimeStamp || ""
                }));

                setUserData(mapped);
                setFilters({ data: mapped });
            }
        } catch (err) {
            console.error("Restore Monitor Error:", err);
        } finally {
            setLoading(false);
            console.groupEnd();
        }
    };

    const handleFilter = () => {
        console.log("Filter Clicked");
        fetchRestoreMonitor();
    };

    const handleRefresh = () => {
        console.log("Refresh Clicked");
        fetchRestoreMonitor({ isRefresh: true });
    };


    const buildExportRequest = () => {
        const userDetails = CF_activeUserdetails();

        return {
            AllRows: userData.map((row, index) => ({
                sClientName: row.clientName || "",
                sSourcePath: row.sourcePath || "",
                sTaskStatus: row.taskStatus || "",
                sFileName: row.fileName || "",
                sFileType: row.type || "",
                sRestoreLocation: row.restoreLocation || "",
                sErrorDescription: row.errorDescription || null,
                sRestoreBy: row.restoredBy || "",
                sTimeStamp: row.restoredOn || "",
                sDownloadTskID: row.downloadTskID || "", // ← Now available
                sTaskID: row.taskID || "",                // ← Now available
                sUTCTimeStamp: row.utcTimeStamp || "",    // ← Now available
                sSiteCode: row.siteCode || "",            // ← Now available
                visibleindex: index,
                boundindex: index,
                uid: index,
                uniqueid: `${Date.now()}-${index}`
            })),
            sFileName: "RestoreMonitor",
            sBrowserURL: window.location.origin,
            AllowKeys: [
                "sClientName", "sSourcePath", "sTaskStatus", "sFileName",
                "sFileType", "sRestoreLocation", "sErrorDescription",
                "sRestoreBy", "sTimeStamp"
            ],
            HeaderDetails: [
                "Client Name", "Source Path", "Task Status", "Filename",
                "Type", "Restore Location", "Error Description",
                "Restored By", "Restored On"
            ],
            ActiveUserDetails: userDetails.ActiveUserDetails,
            ApplicationCode: userDetails.ApplicationCode
        };
    };


    const handleExport = () => {
        console.log("Export Clicked");

        handleExportCommon({
            rows: userData,
            buildRequest: buildExportRequest,
            postData,
            setLoading,
            setLoadingText: () => { },
            setErrorDialog,
            t
        });
    };


    return (
        <div className="flex flex-col w-full font-roboto rounded-md font-[roboto]">
            <div className="bg-[#f0f2f5] px-4 pt-4 pb-2 relative rounded-t-md z-20">
                {isOpen ? (
                    <div className="flex flex-wrap items-end gap-3.5 mb-2">

                        <div className="w-60">
                            <AnimatedDropdown
                                label={t("label.clientName")}
                                value={selectedClient}
                                options={clientList}
                                onChange={(val) => {
                                    setSelectedClient(val?.target?.value ?? val);
                                    setIsClientTouched(true);
                                }}
                                allowFreeInput
                            />


                        </div>


                        <div className="w-60">
                            <AnimatedDropdown
                                label={t("label.taskId")}
                                value={taskId}
                                options={taskList}
                                onChange={(val) => {
                                    setTaskId(val?.target?.value ?? val);
                                    setIsTaskTouched(true);
                                }}
                                allowFreeInput
                            />


                        </div>

                        <div className="w-60">
                            <AnimatedInput
                                label={t("label.fileName")}
                                name="filename"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                            />

                        </div>


                        <div className="w-60">
                            <AnimatedDropdown
                                label={t("label.recordsDuration")}
                                value={recordsDuration}
                                options={["Current Date", "Last 7 Days", "Last 30 Days", "Last 1 Year", "Custom Date"]}
                                onChange={handleDurationChange}
                                // isSearchable={true}
                                allowFreeInput={true}
                            />
                        </div>

                        {isCustomDate && (
                            <>
                                <div className="w-52 pb-4">
                                    <DatePicker
                                        label="From"
                                        value={fromDate}
                                        onChange={setFromDate}
                                        max={today}
                                    />
                                </div>
                                <div className="w-52 pb-4">
                                    <DatePicker
                                        label="To"
                                        value={toDate}
                                        onChange={setToDate}
                                        max={today}
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex items-end gap-2 pb-2 ml-4">
                            <PrimaryButton icon={Filter} label={t('button.filter')} onClick={handleFilter} />
                            <PrimaryButton icon={RefreshCw} label={t('button.refresh')} onClick={handleRefresh} />
                            <PrimaryButton icon={UploadIcon} label={t('button.export')} onClick={handleExport} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4 py-2.5">

                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-600">{t("label.clientName")}:</span>
                            <span className="font-medium text-xs text-[#0E5BCA] text-800">{selectedClient || "---"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-600">{t("label.fileName")}:</span>
                            <span className="font-medium text-xs text-[#0E5BCA] text-800">{fileName || "---"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-600">{t("label.from")}:</span>
                            <span className="font-medium text-xs text-[#0E5BCA]">{getDateRange(recordsDuration, fromDate, toDate).startDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-600">{t("label.to")}:</span>
                            <span className="font-medium text-xs text-[#0E5BCA]">{getDateRange(recordsDuration, fromDate, toDate).endDate}</span>
                        </div>
                    </div>
                )}

                <button
                    className="absolute right-4 -bottom-3 z-10 bg-[#f0f4f8] hover:bg-slate-200 p-0.5 rounded shadow-sm cursor-pointer transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
                </button>
            </div>

            <div className="px-4 font-roboto h-[calc(100vh-150px)] flex flex-col">
                {/* UsersPage takes full width & height */}
                <div className="flex-1 overflow-hidden">
                    <UsersPage
                        filters={filters}
                        exportTrigger={exportTrigger}
                        onDataCountChange={setDataCount}
                    />

                </div>
            </div>

            {errorDialog.show && (
                <Errordialog
                    message={errorDialog.message}
                    type={errorDialog.type}
                    onClose={() => setErrorDialog({ show: false, message: "", type: "" })}
                />
            )}
        </div>
    )
}

export default RestoreMonitor
