import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Filter, ChevronUp, ChevronDown, X, CheckSquare,
    Upload, History, FileText, FolderOpen, Download,
    RotateCwIcon,
    Printer,
    PackageOpenIcon,
    ArchiveIcon,

} from 'lucide-react';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import exportIcon from "../../../../../Assests/Icons/export-icon.png"
import { useTranslation } from "react-i18next";
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useLanguage } from '../../../../../Context/LanguageContext';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import Errordialog from '../../../../Layout/Common/Errordialog';
import CustomPopup from '../../../../Layout/Common/Popup';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useAxios from '../../../../../Services/servicecall';
import { CF_encrypt, CF_decrypt } from '../../../../../Components/Common/encryptiondecryption';
// import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { CF_sessionGet } from "../../../../Common/CF_session";

const OpenArchivePopup = ({ isOpen, onClose, archiveList, onArchiveSelect }) => {
    const [selectedArchiveId, setSelectedArchiveId] = useState(archiveList.length > 0 ? archiveList[0].id : null);
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen && archiveList.length > 0) {
            setSelectedArchiveId(archiveList[0].id);
        }
    }, [isOpen, archiveList]);

    const handleRowClick = (rowOrId) => {
        const id = typeof rowOrId === 'object' ? rowOrId.id : rowOrId;
        console.log('Selected ID:', id);
        setSelectedArchiveId(id);
    };

    const archiveColumns = useMemo(() => [
        {
            key: 'name',
            label: t("label.name"),
            width: 200,
            enableSearch: true,
            render: (row) => (
                <span className={`text-gray-700 ${selectedArchiveId === row.id ? 'font-bold text-blue-600' : ''}`}>
                    {row.name}
                </span>
            )
        },
        {
            key: 'createDate',
            label: t("label.CRDate"),
            width: 150,
            enableSearch: true,
            render: (row) => (
                <span className={`text-gray-700 ${selectedArchiveId === row.id ? 'font-bold text-blue-600' : ''}`}>
                    {row.createDate}
                </span>
            )
        }
    ], [selectedArchiveId, t]);

    const handleOpen = () => {
        if (!selectedArchiveId) {
            alert('Please select an archive');
            return;
        }
        const selectedArchive = archiveList.find(a => a.id === selectedArchiveId);
        if (!selectedArchive) {
            alert('Archive not found');
            return;
        }
        onArchiveSelect(selectedArchive);
        onClose();
    };

    return (
        <CustomPopup
            isOpen={isOpen}
            onClose={onClose}
            title="Open Archive"
            content={
                <div className="p-4">
                    <div className="mb-4" style={{ height: '400px' }}>
                        <GridLayout
                            columns={archiveColumns}
                            data={archiveList}
                            onRowClick={(row) => handleRowClick(row.id)}
                            selectedRows={selectedArchiveId ? [selectedArchiveId] : []}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                        <button
                            onClick={handleOpen}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2883FE] hover:bg-[#2883FE] text-white text-sm font-semibold rounded transition-colors"
                        >
                            <CheckSquare className="w-4 h-4" /> {t("button.open")}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors"
                        >
                            {t("button.close")}
                        </button>
                    </div>
                </div>
            }
        />
    );
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
    return `${year}-${month}-${day}`;
};


const UsersPage = ({ userData, setUserData, selectedRows, setSelectedRows, showReviewHistory, loading, userColumns, reviewHistoryColumns, exportTrigger }) => {
    useEffect(() => {
        console.log("=== UsersPage Data Update ===");
        console.log("showReviewHistory:", showReviewHistory);
        console.log("userData length:", userData.length);
        console.log("userData sample:", userData.slice(0, 3));
    }, [userData, showReviewHistory]);
    const [error, setError] = useState(null);
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();
    useEffect(() => {
        if (exportTrigger === 0) return;
        if (!userData.length) return;

        const columnsToExport = showReviewHistory ? reviewHistoryColumns : userColumns;

        const headers = columnsToExport
            .filter(col => col.key !== 'select')
            .map(col => col.label);

        const rows = userData.map((row, index) =>
            columnsToExport
                .filter(col => col.key !== 'select')
                .map(col => {
                    if (col.key === 'serialNo') return index + 1;
                    return row[col.key] ?? "";
                })
        );

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        const colWidths = columnsToExport
            .filter(col => col.key !== 'select')
            .map((col) => {
                const headerLength = col.label.length;
                const maxDataLength = Math.max(
                    ...userData.map((row, index) => {
                        let value;
                        if (col.key === 'serialNo') {
                            value = String(index + 1);
                        } else {
                            value = String(row[col.key] ?? "");
                        }
                        return value.length;
                    }),
                    0
                );
                const maxLength = Math.max(headerLength, maxDataLength);
                return { wch: maxLength + 2 };
            });

        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        const sheetName = showReviewHistory ? "Review History" : "Audit Trail History";
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const file = new Blob([excelBuffer], {
            type: "application/octet-stream"
        });

        const fileName = showReviewHistory
            ? `Review_History_${Date.now()}.xlsx`
            : `Audit_Trail_History_${Date.now()}.xlsx`;

        saveAs(file, fileName);
    }, [exportTrigger, userData, userColumns, reviewHistoryColumns, showReviewHistory]);

    const parseModifiedXML = (raw) => {
        if (!raw) return [];

        const decoded = raw
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(decoded, "text/xml");

        const root = xmlDoc.documentElement;
        if (!root) return [];

        return Array.from(root.children).map(node => ({
            column: toPascalCaseWithSpace(node.tagName.replace(/^L\d+/i, "")),
            oldValue: node.getAttribute("Old_Value"),
            newValue: node.getAttribute("New_Value"),
        }));
    };

    const toPascalCaseWithSpace = (value = "") => {
        if (!value) return "";

        return value
            .replace(/([a-z])([A-Z])/g, "$1 $2") // add space between camelCase
            .replace(/_/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const renderUserDetail = (user) => (
        <div className="space-y-3 text-[12px]">
            {[
                { label: "comments", value: user.comments || "" },
                { label: "userName", value: user.userName || "" },
                { label: "profileName", value: user.profileName || "" },
                { label: "systemComments", value: user.systemComments || "" },
                { label: "reviewComments", value: user.reviewComments || "" },
                { label: "reviewedBy", value: user.reviewedBy || "" },
                { label: "reviewedDate", value: user.reviewedDate || "" },
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

            <div className="font-semibold text-[12px] font-['Roboto'] text-[#405F7D]">
                {t("label.modifiedData")}
            </div>
            {/* Modified Data Section */}
            {parseModifiedXML(user.modifiedData).length > 0 && (
                <div className="mt-2 space-y-1 text-[12px]">
                    {/* Header */}
                    <div className="grid grid-cols-3 font-semibold text-[#1E90FF] text-[14px]">
                        <span>{t("label.columnName")}</span>
                        <span>{t("label.oldValue")}</span>
                        <span>{t("label.newValue")}</span>
                    </div>

                    {/* Rows */}
                    {parseModifiedXML(user.modifiedData).map((row, idx) => (
                        <div key={idx} className="grid grid-cols-3">
                            <span className="text-[#405F7D] font-semibold text-[12px] font-['Roboto']">
                                {toPascalCaseWithSpace(row.column)}
                            </span>
                            <span className="text-[#FF1D1D] font-semibold text-[12px] font-['Roboto']">
                                {row.oldValue}
                            </span>
                            <span className="text-[#0C860C] font-semibold text-[12px] font-['Roboto']">
                                {row.newValue}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );


    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500"></div>;
    }



    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* {showReviewHistory ? (
                <>
                    <GridLayout
                        columns={reviewHistoryColumns}
                        // data={userData.filter(row => selectedRows.includes(row.id))}
                        data={userData}
                    />
                    <div className="flex justify-end p-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                setSelectedRows([]);
                                // This prop needs to be passed from parent
                                if (typeof window !== 'undefined') {
                                    const event = new CustomEvent('closeReviewHistory');
                                    window.dispatchEvent(event);
                                }
                            }}
                            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors"
                        >
                            {t("button.close")}
                        </button>
                    </div>
                </> */}
            {showReviewHistory ? (
                <>
                    <GridLayout
                        columns={reviewHistoryColumns}
                        data={userData}
                    />
                    <div className="flex justify-end p-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                // Trigger event to close and restore data
                                const event = new CustomEvent('closeReviewHistory');
                                window.dispatchEvent(event);
                            }}
                            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors"
                        >
                            {t("button.close")}
                        </button>
                    </div>
                </>
            ) : (
                <GridLayout
                    columns={userColumns}
                    data={userData}
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


const AuditTrailHistory = () => {
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();
    const today = getCurrentDate();
    // const [hideEmpty, setHideEmpty] = useState(true);
    const [isOpen, setIsOpen] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [visibleCount, setVisibleCount] = useState(9);
    const [recordsDuration, setRecordsDuration] = useState("Current_Date");
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [filename, setFilename] = useState("");
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportTrigger, setExportTrigger] = useState(0);


    const [selectedUser, setSelectedUser] = useState("All");
    const [selectedModule, setSelectedModule] = useState("All");
    const [selectedAuditType, setSelectedAuditType] = useState("All");

    const [selectedRows, setSelectedRows] = useState([]); // Track selected row IDs
    const [showReviewHistory, setShowReviewHistory] = useState(false);
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const [errorDialog, setErrorDialog] = useState({ show: false, message: "", type: "" });
    const [showCreateArchiveDialog, setShowCreateArchiveDialog] = useState(false);
    const [showOpenArchiveDialog, setShowOpenArchiveDialog] = useState(false);
    const [showOpenArchivePopup, setShowOpenArchivePopup] = useState(false);
    const [selectedArchiveName, setSelectedArchiveName] = useState("");
    const [showCreateAuditLog, setShowCreateAuditLog] = useState(false);
    const [showOpenAuditLog, setShowOpenAuditLog] = useState(false);
    const [archiveList, setArchiveList] = useState([
        {
            id: 1,
            name: "CFRArchiving_5_20251223",
            createDate: "2025-12-23 14:02:07"
        },
        {
            id: 2,
            name: "CFRArchiving_4_20251223",
            createDate: "2025-12-23 13:19:36"
        },
        {
            id: 3,
            name: "CFRArchiving_3_20251223",
            createDate: "2025-12-23 13:18:43"
        },
        {
            id: 4,
            name: "CFRArchiving_2_20251223",
            createDate: "2025-12-23 13:17:52"
        },
        {
            id: 5,
            name: "CFRArchiving_1_20251222",
            createDate: "2025-12-22 18:22:00"
        }
    ]);
    const [originalGridData, setOriginalGridData] = useState([]);


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
    const [selectedClient, setSelectedClient] = useState("All");
    const [clientList, setClientList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const { postData } = useAxios();

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

    const isCustomDate = recordsDuration === "Custom_Date";

    // const handleDurationChange = (value) => {
    //     const actualValue = value?.target?.value || value?.value || value;
    //     setRecordsDuration(actualValue);
    // };

    const handleDurationChange = (value) => {
        const actualValue = value?.target?.value || value?.value || value;
        setRecordsDuration(actualValue);

        const today = new Date();
        let from = new Date(today);
        let to = new Date(today);

        switch (actualValue) {
            case "Current_Date":
                // today → today
                break;

            case "Last_7_Days":
                from.setDate(today.getDate() - 7);
                break;

            case "Last_30_Days":
                from.setDate(today.getDate() - 30);
                break;

            case "Last_1_Year":
                from.setFullYear(today.getFullYear() - 1);
                break;

            case "Custom_Date":
                // user manually selects dates
                return;

            default:
                return;
        }

        setFromDate(from);
        setToDate(to);
    };


    useEffect(() => {
        const initializeComponent = async () => {
            await Promise.all([
                // logViewAuditTrail(),
                fetchUserList(),
                fetchModuleList(),
                fetchAuditTrailData()
            ]);
        };

        initializeComponent();
    }, []);

    // useEffect(() => {
    //     const handleCloseReviewHistory = () => {
    //         setShowReviewHistory(false);
    //         setSelectedRows([]);
    //     };

    //     window.addEventListener('closeReviewHistory', handleCloseReviewHistory);
    //     return () => window.removeEventListener('closeReviewHistory', handleCloseReviewHistory);
    // }, []);
    useEffect(() => {
        const handleCloseReviewHistory = () => {
            // ← RESTORE ORIGINAL GRID DATA
            if (originalGridData.length > 0) {
                setUserData(originalGridData);
            }
            setShowReviewHistory(false);
            setSelectedRows([]);
        };

        window.addEventListener('closeReviewHistory', handleCloseReviewHistory);
        return () => window.removeEventListener('closeReviewHistory', handleCloseReviewHistory);
    }, [originalGridData]); // ← Add dependency

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
            case "Current_Date":  // Change from "Current Date"
                startDate = endDate = formatDateDDMMYYYY(today);
                break;

            case "Last_7_Days":  // Change from "Last 7 Days"
                const start7 = new Date();
                start7.setDate(today.getDate() - 7);
                startDate = formatDateDDMMYYYY(start7);
                endDate = formatDateDDMMYYYY(today);
                break;

            case "Last_30_Days":  // Change from "Last 30 Days"
                const start30 = new Date();
                start30.setDate(today.getDate() - 30);
                startDate = formatDateDDMMYYYY(start30);
                endDate = formatDateDDMMYYYY(today);
                break;

            case "Last_1_Year":  // Change from "Last 1 Year"
                const start1y = new Date();
                start1y.setFullYear(today.getFullYear() - 1);
                startDate = formatDateDDMMYYYY(start1y);
                endDate = formatDateDDMMYYYY(today);
                break;

            case "Custom_Date":  // Change from "Custom Date"
                startDate = formatDateDDMMYYYY(fromDate);
                endDate = formatDateDDMMYYYY(toDate);
                break;

            default:
                startDate = endDate = formatDateDDMMYYYY(today);
        }

        return { startDate, endDate };
    };



    const AUDIT_TYPE_OPTIONS = useMemo(() => [
        { label: t("label.user"), value: "User Generated" },
        { label: t("label.system"), value: "System Generated" },
        { label: t("label.all"), value: "All" }
    ], [t]);

    const RECORD_DURATION_OPTIONS = useMemo(() => [
        { label: t("label.currentDate"), value: "Current_Date" },
        { label: t("label.last7Days"), value: "Last_7_Days" },
        { label: t("label.last30Days"), value: "Last_30_Days" },
        { label: t("label.last1Year"), value: "Last_1_Year" },
        { label: t("label.customDate"), value: "Custom_Date" }
    ], [t]);

    // Add column definitions HERE (before any functions)
    const userColumns = useMemo(() => [
        {
            key: 'select',
            label: t('label.select'),
            width: 150,
            render: (row) => (
                <label className="inline-flex items-center" onClick={() => handleRowSelection(row.id)}  >
                    <span className="w-4 h-4 border border-gray-400 flex items-center justify-center bg-white">
                        {selectedRows.includes(row.id) && (
                            <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </span>
                </label>
            )
        },
        {
            key: 'moduleName',
            label: t('label.moduleName'),
            width: 150,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.moduleName}</span>
        },
        {
            key: 'actions',
            label: t('label.actions'),
            width: 150,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.actions}</span>
        },
        {
            key: 'transactionOn',
            label: t('label.transactionOn'),
            width: 200,
            inputType: 'date',
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.transactionOn}</span>
        },
        {
            key: 'reviewStatus',
            label: t('label.reviewStatus'),
            width: 150,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.reviewStatus}</span>
        },
        {
            key: 'requestedClient',
            label: t('label.requestedClient'),
            width: 200,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.requestedClient}</span>
        },
        {
            key: 'affectedClient',
            label: t('label.affectedClient'),
            width: 200,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.affectedClient}</span>
        },
        {
            key: 'instrumentName',
            label: t('label.instrumentName'),
            width: 200,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.instrumentName}</span>
        },
        {
            key: 'reason',
            label: t('label.reason'),
            width: 150,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.reason}</span>
        }
    ], [selectedRows, t]);

    const reviewHistoryColumns = useMemo(() => [
        {
            key: 'serialNo',
            label: t('label.serialNo'),
            width: 100,
            render: (row, index) => {
                console.log("SerialNo Render - Row:", row, "Index:", index);
                return <span className="text-gray-700">{index + 1}</span>
            }
        },
        {
            key: 'moduleName',
            label: t('label.moduleName'),
            width: 180,
            render: (row) => <span className="text-gray-700">{row.moduleName}</span>
        },
        {
            key: 'actions',
            label: t('label.actions'),
            width: 200,
            render: (row) => <span className="text-gray-700">{row.actions}</span>
        },
        {
            key: 'comments',
            label: t('label.comments'),
            width: 200,
            render: (row) => <span className="text-gray-700">{row.comments}</span>
        },
        {
            key: 'reviewStatus',
            label: t('label.reviewStatus'),
            width: 180,
            render: (row) => <span className="text-gray-700">{row.reviewStatus}</span>
        },
        {
            key: 'reviewComments',
            label: t('label.reviewComments'),
            width: 200,
            render: (row) => <span className="text-gray-700">{row.reviewComments}</span>
        },
        {
            key: 'reviewedBy',
            label: t('label.reviewedBy'),
            width: 150,
            render: (row) => <span className="text-gray-700">{row.reviewedBy}</span>
        },
        {
            key: 'reviewedDate',
            label: t('label.reviewedDate'),
            width: 150,
            render: (row) => <span className="text-gray-700">{row.reviewedDate}</span>
        }
    ], [t]);

    // Add handleRowSelection here too
    const handleRowSelection = (id) => {
        console.log('Before:', selectedRows);
        setSelectedRows(prev => {
            const newState = prev.includes(id)
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id];
            console.log('After:', newState);
            return newState;
        });
    };

    const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold font-[roboto] rounded  whitespace-nowrap hover:scale-90 transition-all
      ${disabled
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-[#f1f5f9] text-[#1d8cf8] hover:bg-blue-100"
                }
      ${className}
    `}
        >
            {Icon && <Icon className="w-3.5 h-3.5 strokeWidth={3}" />}
            <span className="font-[roboto] font-bold">{label}</span>
        </button>
    );

    const handleReviewHistory = async () => {
        if (selectedRows.length === 0) {
            setErrorDialog({
                show: true,
                message: "Select an existing record.",
                type: "information"
            });
            return;
        }

        // Check if selected rows are reviewed
        const selectedRowsData = userData.filter(row => selectedRows.includes(row.id));
        const hasUnreviewedRows = selectedRowsData.some(row =>
            !row.reviewStatus || row.reviewStatus !== 'Reviewed'
        );

        if (hasUnreviewedRows) {
            setErrorDialog({
                show: true,
                message: "Please select only reviewed records.",
                type: "information"
            });
            return;
        }

        try {
            setLoading(true);

            // ← SAVE CURRENT GRID DATA BEFORE SWITCHING
            setOriginalGridData([...userData]);

            const payload = {
                arraylist: selectedRows,
                ...CF_activeUserdetails()
            };

            console.log("=== REVIEW HISTORY DEBUG ===");
            console.log("Selected Rows (IDs):", selectedRows);
            console.log("Review History Payload:", payload);

            const result = await postData('AuditTrail/GetReviewDetails', payload);

            console.log("Raw API Response:", result);
            console.log("ReviewList:", result?.ReviewList);

            if (result && result.ReviewList && Array.isArray(result.ReviewList)) {
                console.log("Number of items in ReviewList:", result.ReviewList.length);

                const mappedData = result.ReviewList.map((item, index) => {
                    const mapped = {
                        id: item.SerialNo || index + 1,
                        moduleName: item.ModuleName || '',
                        actions: item.Action || '',
                        comments: item.Comments || '',
                        reviewStatus: item['Review Status'] || '',
                        reviewComments: item['Review Comments'] || '',
                        reviewedBy: item['Reviewed By'] || '',
                        reviewedDate: item['Reviewed Date'] || ''
                    };
                    console.log(`Mapped review item ${index}:`, mapped);
                    return mapped;
                });

                console.log("Final Mapped Review Data:", mappedData);
                setUserData(mappedData);

                // ← DON'T UPDATE selectedRows, keep them as is
                setShowReviewHistory(true);
            } else {
                setErrorDialog({
                    show: true,
                    message: "No review history found.",
                    type: "information"
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching review history:', error);
            setLoading(false);
        }
    };

    // const handleReview = () => {
    //     if (selectedRows.length === 0) {
    //         setErrorDialog({
    //             show: true,
    //             message: "Select an existing record.",
    //             type: "information"
    //         });
    //         return;
    //     }
    //     setShowAuditTrail(true);
    // };

    const handleReview = () => {
        if (selectedRows.length === 0) {
            setErrorDialog({
                show: true,
                message: "Select an existing record.",
                type: "information"
            });
            return;
        }
        setShowAuditTrail(true);
    };

    const handleCreateArchieve = () => {

        setErrorDialog({
            show: true,
            message: "Do you want to Create an Archive?",
            type: "confirmation"
        });

        setShowAuditTrail(true);
    }

    const handleAuditTrailAuthorized = async (auditData) => {
        console.log("Audit Data:", auditData);

        try {
            const payload = {
                arraylist: selectedRows,
                AuditTrailValues: auditData.AuditTrailValues,
                ...CF_activeUserdetails()
            };

            console.log("Submit Review Payload:", payload);
            const result = await postData('AuditTrail/ReviewBtnValidation', payload);
            console.log("Submit Review Result:", result);

            if (result.AuditTrailLogin === false) {
                setPasswordError(true);
                return;
            }

            if (result.Message === "Success" && result.TransDetail) {
                // Map the response data
                const updatedData = userData.map(row => {
                    const reviewedItem = result.TransDetail.find(
                        item => item.SerialNo === row.id
                    );
                    if (reviewedItem) {
                        return {
                            ...row,
                            reviewStatus: reviewedItem['Review Status'] || 'Reviewed',
                            reviewComments: reviewedItem['Review Comments'],
                            reviewedBy: reviewedItem['Reviewed By'],
                            reviewedDate: reviewedItem['Reviewed Date']
                        };
                    }
                    return row;
                });

                setUserData(updatedData);
                setShowAuditTrail(false);
                setSelectedRows([]);
                setPasswordError(false);
            } else {
                alert(result.Message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        }
    };

    const handleCreateArchive = () => {
        setShowCreateArchiveDialog(true);
    };

    const handleCreateArchiveConfirm = () => {
        setShowCreateArchiveDialog(false);
        setShowCreateAuditLog(true);
    };

    const handleArchiveAuditLogAuthorized = async (auditData) => {
        console.log('Create Archive Audit Trail Data:', auditData);

        try {
            const payload = {
                AuditTrailValues: auditData.AuditTrailValues,
                ActiveUserDetails: getSessionUserDetails()
            };

            console.log("Create Archive Payload:", payload);
            const result = await postData('AuditTrail/CreateArchive', payload);
            console.log("Create Archive Result:", result);

            if (result.AuditTrailLogin === false) {
                setPasswordError(true);
                return;
            }

            if (result.rtnmsg === "Success") {
                const newArchive = {
                    id: result.archiveId || archiveList.length + 1,
                    name: result.archiveName || `CFRArchiving_${archiveList.length + 1}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
                    createDate: result.createDate || new Date().toISOString().replace('T', ' ').substring(0, 19)
                };

                setArchiveList(prev => [newArchive, ...prev]);
                setShowCreateAuditLog(false);
                setPasswordError(false);

                setErrorDialog({
                    show: true,
                    message: `Archive "${newArchive.name}" created successfully!`,
                    type: "success"
                });
            } else {
                alert(result.rtnmsg || 'Failed to create archive');
            }
        } catch (error) {
            console.error('Error creating archive:', error);
            alert('Failed to create archive. Please try again.');
        }
    };

    const handleOpenArchive = () => {
        setShowOpenArchiveDialog(true);
    };

    const handleOpenArchiveConfirm = () => {
        setShowOpenArchiveDialog(false);
        setShowOpenAuditLog(true);
    };

    const handleOpenArchiveAuditLogAuthorized = async (auditData) => {
        console.log('Open Archive Audit Trail Data:', auditData);

        try {
            const payload = {
                AuditTrailValues: auditData.AuditTrailValues,
                ActiveUserDetails: getSessionUserDetails()
            };

            console.log("Open Archive Log Payload:", payload);
            const result = await postData('AuditTrail/OpenArchiveLog', payload);
            console.log("Open Archive Log Result:", result);

            if (result.AuditTrailLogin === false) {
                setPasswordError(true);
                return;
            }

            if (result.rtnmsg === "Success") {
                setShowOpenAuditLog(false);
                setShowOpenArchivePopup(true);
                setPasswordError(false);
            }
        } catch (error) {
            console.error('Error logging open archive:', error);
            alert('Failed to log open archive action.');
        }
    };

    const handleArchiveSelect = async (archive) => {
        setSelectedArchiveName(archive.name);
        setShowOpenArchivePopup(false);
        setLoading(true);

        try {
            const payload = {
                sArchiveId: archive.id,
                sArchiveName: archive.name,
                ActiveUserDetails: getSessionUserDetails()
            };

            console.log("Load Archive Data Payload:", payload);
            const result = await postData('AuditTrail/LoadArchiveData', payload);
            console.log("Load Archive Data Result:", result);

            if (result && Array.isArray(result)) {
                const mappedData = result.map((item, index) => ({
                    id: index + 1,
                    select: false,
                    moduleName: item.ModuleName || '',
                    actions: item.Actions || '',
                    transactionOn: item.TransactionOn || '',
                    reviewStatus: item.ReviewStatus || '',
                    requestedClient: item.RequestedClient || '',
                    affectedClient: item.AffectedClient || '',
                    instrumentName: item.InstrumentName || '',
                    reason: item.Reason || '',
                    comments: item.Comments || '',
                    reviewComments: item.ReviewComments || '',
                    reviewedBy: item.ReviewedBy || '',
                    reviewedDate: item.ReviewedDate || ''
                }));

                setUserData(mappedData);
            }

            setShowReviewHistory(false);
            setSelectedRows([]);
            setLoading(false);
        } catch (error) {
            console.error('Error loading archive data:', error);
            setLoading(false);
        }
    };

    const handleReset = async () => {
        const currentUserID = getSessionUserDetails().sUserID;
        const currentUser = userList.find(
            u => String(u.L02UserID).trim() === String(currentUserID).trim()
        );
        const defaultUser = currentUser ? currentUser.L02UserName : "All";

        setSelectedUser("All");
        setSelectedModule("All");
        setSelectedAuditType("All");
        setRecordsDuration("Current_Date");
        setFromDate(today);
        setToDate(today);
        setSelectedRows([]);
        setShowReviewHistory(false);
        setSelectedArchiveName("");

        // await fetchAuditTrailData();
    };

    const handlePrint = async () => {
        const columnsToShow = showReviewHistory ? reviewHistoryColumns : userColumns;
        const dataToShow = showReviewHistory
            ? userData.filter(row => selectedRows.includes(row.id))
            : userData;

        const tableHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Audit Trail History</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Roboto', Arial, sans-serif; 
                    padding: 30px;
                    background-color: #ffffff;
                }
                h1 { 
                    text-align: center; 
                    color: #2883FE; 
                    margin-bottom: 30px;
                    font-size: 28px;
                    font-weight: 600;
                }
                .print-info {
                    text-align: right;
                    color: #666;
                    font-size: 12px;
                    margin-bottom: 15px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 12px 8px; 
                    text-align: left;
                    font-size: 13px;
                }
                th { 
                    background-color: #f9f9f9; 
                    color: #000000; 
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 12px;
                    letter-spacing: 0.5px;
                }
                tr:nth-child(even) { 
                    background-color: #fafafa; 
                }
                tr:hover {
                    background-color: #f5f5f5;
                }
                td {
                    color: #333;
                }
                @media print {
                    body { 
                        padding: 15px;
                    }
                    table {
                        box-shadow: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-info">
                Printed on: ${new Date().toLocaleString()}
            </div>
            <h1>Audit Trail History</h1>
            <table>
                <thead>
                    <tr>
                        ${columnsToShow
                .filter(col => col.key !== 'select')
                .map(col => `<th>${col.label}</th>`)
                .join('')}
                    </tr>
                </thead>
                <tbody>
                    ${dataToShow.map((row, index) => `
                        <tr>
                            ${columnsToShow
                        .filter(col => col.key !== 'select')
                        .map(col => {
                            if (col.key === 'serialNo') return `<td>${index + 1}</td>`;
                            return `<td>${row[col.key] || ''}</td>`;
                        })
                        .join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <script>
                window.onload = function() { 
                    setTimeout(function() {
                        window.print();
                    }, 250);
                }

                window.onafterprint = function() {
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };

                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        window.close();
                    }
                });
            </script>
        </body>
        </html>
    `;
        const printWindow = window.open('', 'PrintWindow', 'width=1200,height=800,left=100,top=50');
        if (printWindow) {
            printWindow.document.write(tableHTML);
            printWindow.document.close();
            printWindow.focus();
        } else {
            alert('Please allow popups for this site to print.');
        }
        // API call after print
        try {
            const payload = {
                sModuleName: "Audit Trail History",
                ActiveUserDetails: getSessionUserDetails()
            };

            await postData('basemaster/print', payload);
        } catch (error) {
            console.error('Error logging print action:', error);
        }
    };

    // const handleExport = () => {
    //     if (userData.length === 0) {
    //         setErrorDialog({
    //             show: true,
    //             message: "No data available to export.",
    //             type: "information"
    //         });
    //         return;
    //     }
    //     setExportTrigger(prev => prev + 1);
    // };


    const handleExport = async () => {
        if (userData.length === 0) {
            setErrorDialog({
                show: true,
                message: "No data available to export.",
                type: "information"
            });
            return;
        }

        try {
            const columnsToExport = showReviewHistory ? reviewHistoryColumns : userColumns;

            const headers = columnsToExport
                .filter(col => col.key !== 'select')
                .map(col => col.label);

            const rows = userData.map((row, index) =>
                columnsToExport
                    .filter(col => col.key !== 'select')
                    .map(col => {
                        if (col.key === 'serialNo') return index + 1;
                        return row[col.key] ?? "";
                    })
            );

            const payload = {
                sFileName: showReviewHistory ? "Review_History" : "Audit_Trail_History",
                AllRows: userData,
                HeaderDetails: headers,
                AllowKeys: columnsToExport.filter(col => col.key !== 'select').map(col => col.key),
                sBrowserURL: window.location.origin,
                ActiveUserDetails: getSessionUserDetails()
            };

            console.log("Export Payload:", payload);
            const result = await postData('basemaster/exportDataFile', payload);
            console.log("Export Result:", result);

            if (result && result.ExportDataViewURL) {
                const urlPath = CF_decrypt(result.ExportDataViewURL);
                const win = window.open(urlPath, '_blank');
                if (!win) {
                    alert('Please allow popups for this website');
                }
            }
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    const getSessionUserDetails = () => {
        try {
            const encryptedUserID = sessionStorage.getItem('sUserID');
            const encryptedSiteCode = sessionStorage.getItem('sSiteCode');
            const encryptedTenantID = sessionStorage.getItem('sTenantID');
            const encryptedUsername = sessionStorage.getItem('sUsername');
            const encryptedDomain = sessionStorage.getItem('sDomainName');
            const encryptedCategories = sessionStorage.getItem('sCategories');
            const encryptedUserGroup = sessionStorage.getItem('sUserGroupID');
            const encryptedSessionID = sessionStorage.getItem('sSessionID');
            const encryptedTimeZone = sessionStorage.getItem('sTimeZoneID');
            const encryptedDBType = sessionStorage.getItem('sdbtype');

            const isEncrypted = (value) => {
                if (typeof value !== 'string') return false;
                if (value.length < 70) return false;
                return /^[0-9a-fA-F]{64}/.test(value);
            };

            const safeDecrypt = (value) => {
                if (!value || value === 'null' || value === 'undefined') {
                    return '';
                }
                if (!isEncrypted(value)) {
                    return value;
                }
                try {
                    return CF_decrypt(value);
                } catch (error) {
                    console.debug('Decryption skipped for value');
                    return '';
                }
            };

            // Decrypt all values
            const sUserID = safeDecrypt(encryptedUserID);
            const sSiteCode = safeDecrypt(encryptedSiteCode);
            const sTenantID = safeDecrypt(encryptedTenantID);
            const sUsername = safeDecrypt(encryptedUsername);
            const sUserDomainName = safeDecrypt(encryptedDomain);
            const sCategories = safeDecrypt(encryptedCategories);
            const sUserGroupID = safeDecrypt(encryptedUserGroup);
            const sSessionID = safeDecrypt(encryptedSessionID);
            const sTimeZoneID = safeDecrypt(encryptedTimeZone);
            const sdbtype = safeDecrypt(encryptedDBType);

            const userDetails = {
                sUserID: sUserID || 'U1',
                sSiteCode: sSiteCode || 'CH-001    ',  // Match your actual site code with spaces
                sTenantID: sTenantID || '',
                sUsername: sUsername || 'Administrator',
                sUserDomainName: sUserDomainName || 'SDMS',
                sCategories: sCategories || 'DB',
                sUserGroupID: sUserGroupID || 'G1        ',  // With spaces to match backend
                sSessionID: sSessionID || '',
                sTimeZoneID: sTimeZoneID || 'Asia/Kolkata',  // Remove the <~>true part
                sdbtype: sdbtype || 'MSSQL',  // ← Fixed! Use MSSQL as default
                sApplicationName: "SDMS",
                sUserStatus: ""
            };

            console.log("=== SESSION USER DETAILS ===");
            console.log("Full User Details:", userDetails);
            console.log("Site Code:", `"${userDetails.sSiteCode}"`);
            console.log("Site Code length:", userDetails.sSiteCode.length);
            console.log("DB Type:", userDetails.sdbtype);

            return userDetails;
        } catch (error) {
            console.error('Error getting session user details:', error);
            return {
                sUserID: 'U1',
                sSiteCode: 'CH-001    ',
                sTenantID: '',
                sUsername: 'Administrator',
                sUserDomainName: 'SDMS',
                sCategories: 'DB',
                sUserGroupID: 'G1        ',
                sSessionID: '',
                sTimeZoneID: 'Asia/Kolkata',
                sdbtype: 'MSSQL',  // ← Fixed default
                sApplicationName: "SDMS",
                sUserStatus: ""
            };
        }
    };

    const fetchClientList = async () => {
        try {
            const payload = {
                ActiveUserDetails: getSessionUserDetails()
            };

            const result = await postData('AuditTrail/AuditTrailClientname', payload);
            console.log("Client List Result:", result);

            if (result && Array.isArray(result)) {
                setClientList(result);
            }
        } catch (error) {
            console.error('Error fetching client list:', error);
        }
    };

    const fetchUserList = async () => {
        try {
            // const payload = {
            //     ActiveUserDetails: getSessionUserDetails()
            // };

            const payload = CF_activeUserdetails();

            console.log("Fetch User List Payload:", payload);
            const result = await postData('AuditTrail/CFRTranUsername', payload);
            console.log("User List Result:", result);

            if (result && Array.isArray(result)) {
                setUserList(result);
            }
        } catch (error) {
            console.error('Error fetching user list:', error);
        }
    };


    const fetchModuleList = async () => {
        try {
            const payload = {
                ActiveUserDetails: getSessionUserDetails()
            };

            console.log("Fetch Module List Payload:", payload);
            const result = await postData('AuditTrail/CFRTranModuleName', payload);
            console.log("Module List Result:", result);

            if (result && Array.isArray(result)) {
                setModuleList(result);
            }
        } catch (error) {
            console.error('Error fetching module list:', error);
        }
    };

    const mapCFTViewLoad = (item, index) => ({
        id: item.SerialNo ?? index + 1,
        select: false,
        moduleName: item.ModuleName ?? '',
        actions: item.Actions ?? '',
        transactionOn: item.TransactionDate ?? '',
        userName: item['User Name'] ?? '',
        profileName: item['User Full Name'] ?? '',
        systemComments: item.SystemComments ?? '',
        reason: item.Reason ?? '',
        comments: item.Comments ?? '',
        modifiedData: item.ModifiedData ?? ''
    });

    const mapCFRFilter = (item, index) => ({
        id: item.SerialNo ?? index + 1,
        select: false,
        moduleName: item.ModuleName ?? '',
        actions: item.Actions ?? '',
        transactionOn: item.TransactionDate ?? '',
        reviewStatus: item['Review Status'] ?? '',
        requestedClient: item.RequestedClient ?? '',
        affectedClient: item.AffectedClient ?? '',
        instrumentName: item.InstrumentID ?? '',
        reason: item.Reason ?? '',
        comments: item.Comments ?? '',
        reviewComments: item['Review Comments'] ?? '',
        reviewedBy: item['Reviewed By'] ?? '',
        reviewedDate: item['Reviewed Date'] ?? '',
        userName: item['User Name'] ?? '',
        profileName: item['User Full Name'] ?? '',
        systemComments: item.SystemComments ?? '',
        modifiedData: item.ModifiedData ?? ''
    });

    const fetchAuditTrailData = async () => {
        setLoading(true);

        try {
            // const formatDate = (dateStr) => {
            //     const [year, month, day] = dateStr.split("-");
            //     return `${day}/${month}/${year}`;
            // };

            const formatDate = (date) => {
                const d = new Date(date);
                return `${String(d.getDate()).padStart(2, "0")}/${String(
                    d.getMonth() + 1
                ).padStart(2, "0")}/${d.getFullYear()}`;
            };




            // Get ActiveUserDetails + ApplicationCode (COMMON FUNCTION)
            const commonPayload = CF_activeUserdetails();

            const currentUserID =
                commonPayload.ActiveUserDetails.sUserID?.trim() || "U1";

            // Find user by ID
            const currentUser = userList.find(u =>
                String(u.L02UserID).trim() === currentUserID
            );

            // API EXPECTS USER NAME
            const sUserIDFromUI = currentUser?.L02UserName || "All";

            const payload = {
                sUserIDFromUI,
                auditTrailType: "All",
                sModuleName: "All",
                sFromDate: formatDate(fromDate),
                sToDate: formatDate(toDate),
                ...commonPayload
            };

            console.log("=== CFTTransViewLoad PAYLOAD ===", payload);

            const result = await postData(
                "AuditTrail/CFTTransViewLoad",
                payload
            );

            if (Array.isArray(result) && result.length > 0) {
                setUserData(result.map((item, i) =>
                    mapCFTViewLoad(item, i)
                ));
            } else {
                setUserData([]);
            }
        } catch (err) {
            console.error("Initial load error:", err);
            setUserData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async () => {
        setLoading(true);
        setSelectedArchiveName("");

        try {
            // const formatDate = (date) => {
            //     const d = new Date(date);
            //     return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")
            //         }/${d.getFullYear()}`;
            // };

            const formatDate = (date) => {
                const d = new Date(date);
                return `${String(d.getDate()).padStart(2, "0")}/${String(
                    d.getMonth() + 1
                ).padStart(2, "0")}/${d.getFullYear()}`;
            };


            // 🔹 COMMON ActiveUserDetails
            const commonPayload = CF_activeUserdetails();

            let sUserIDFromUI = "-1"; // DEFAULT → All users

            if (selectedUser !== "All") {
                const user = userList.find(
                    u => u.L02UserName === selectedUser
                );

                if (user && user.L02UserID) {
                    sUserIDFromUI = String(user.L02UserID).trim();
                }
            }
            const payload = {
                sUserIDFromUI,
                sModulename: selectedModule || "All",
                auditTrailType: selectedAuditType || "All",
                sFromDate: formatDate(fromDate),
                sToDate: formatDate(toDate),
                ...commonPayload
            };

            console.log("=== CFRTransactionFilter PAYLOAD ===", payload);

            const result = await postData(
                "AuditTrail/CFRTransactionFilter",
                payload
            );

            if (Array.isArray(result) && result.length > 0) {
                setUserData(result.map((item, i) =>
                    mapCFRFilter(item, i)
                ));
            } else {
                setUserData([]);
            }

            setSelectedRows([]);
            setShowReviewHistory(false);
        } catch (err) {
            console.error("Filter error:", err);
            setUserData([]);
        } finally {
            setLoading(false);
        }
    };


    const logViewAuditTrail = async () => {
        try {
            const payload = {
                ActiveUserDetails: getSessionUserDetails()
            };

            const result = await postData('AuditTrail/AuditTrailHistoryViewAudit', payload);
            console.log("Raw audit data count:", result?.length);

        } catch (error) {
            console.error('Error logging view audit trail:', error);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading audit trail data...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full font-roboto rounded-md">

            <div className="bg-[#f0f2f5] px-4 pt-4 pb-2 relative rounded-t-md z-20">
                {isOpen ? (
                    <div className="flex flex-wrap items-end gap-3.5 mb-2">


                        <div className="w-60 mr-4">
                            <AnimatedDropdown
                                label={t("label.userName")}
                                value={selectedUser}
                                options={userList.map(u => u.L02UserName || u.UserName)}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                allowFreeInput={true}
                            />
                        </div>


                        <div className="w-60 mr-4">
                            <AnimatedDropdown
                                label={t("label.moduleName")}
                                value={selectedModule}
                                options={moduleList.map(m => m.ModuleName)}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                allowFreeInput={true}
                            />
                        </div>

                        <div className="w-60 mr-4">
                            <AnimatedDropdown
                                label={t("label.auditType")}
                                value={selectedAuditType}
                                options={AUDIT_TYPE_OPTIONS}
                                displayKey="label"
                                valueKey="value"
                                onChange={(e) => setSelectedAuditType(e.target.value)}
                            />
                        </div>

                        <div className="w-60 mr-4">
                            <AnimatedDropdown
                                label={t("label.recordsDuration")}
                                value={recordsDuration}
                                options={RECORD_DURATION_OPTIONS}
                                displayKey="label"
                                valueKey="value"
                                onChange={handleDurationChange}
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
                            <PrimaryButton icon={RotateCwIcon} label={t('button.reset')} onClick={handleReset} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4 py-2.5 font-[roboto]">

                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-600">{t("label.userName")}:</span>
                            <span className="font-medium text-xs text-[#0E5BCA]">
                                {selectedUser}
                            </span>

                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-600">{t("label.moduleName")}:</span>
                            <span className="font-medium text-xs text-[#0E5BCA]">
                                {selectedModule}
                            </span>

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

            {/* Archive Name and Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 px-4">
                {/* Left side - Archive name label */}
                <div className="flex items-center">
                    {selectedArchiveName && (
                        <div className="px-4 py-2 font-roboto">
                            <span className="font-bold text-xs text-[#000000]">Archival name: </span>
                            <span className="font-bold text-xs text-[#405F7D]">{selectedArchiveName}</span>
                        </div>
                    )}
                </div>

                {/* Right side - Action buttons */}
                <div className="flex flex-wrap gap-2">
                    <ActionButton icon={History} label={t('button.reviewHistory')} onClick={handleReviewHistory} />
                    <ActionButton icon={FileText} label={t('button.review')} onClick={handleReview} />
                    <ActionButton icon={ArchiveIcon} label={t('button.createArchieve')} onClick={handleCreateArchive} />
                    <ActionButton icon={PackageOpenIcon} label={t('button.openArchieve')} onClick={handleOpenArchive} />
                    <ActionButton icon={Upload} label={t('button.export')} onClick={handleExport} />
                    <ActionButton icon={Printer} label={t('button.print')} onClick={handlePrint} />
                </div>
            </div>


            <div className="px-4 font-roboto h-[calc(100vh-150px)] flex flex-col">
                {/* UsersPage takes full width & height */}
                <div className="flex-1 overflow-hidden">
                    <UsersPage
                        userData={userData}
                        setUserData={setUserData}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        showReviewHistory={showReviewHistory}
                        loading={loading}
                        userColumns={userColumns}
                        reviewHistoryColumns={reviewHistoryColumns}
                        exportTrigger={exportTrigger}
                    />
                </div>
            </div>

            {showAuditTrail && (
                <AuditTrail
                    isOpen={showAuditTrail}
                    onClose={() => {
                        setShowAuditTrail(false);
                        setPasswordError(false);
                    }}
                    onAuthorized={handleAuditTrailAuthorized}
                    actionLabel="Submit"
                    defaultReason="Reviewed"
                    disableReason={true}
                    passwordError={passwordError}
                />
            )}

            {errorDialog.show && (
                <Errordialog
                    message={errorDialog.message}
                    type={errorDialog.type}
                    onClose={() => setErrorDialog({ show: false, message: "", type: "" })}
                />
            )}

            {showCreateArchiveDialog && (
                <Errordialog
                    message="Do you want to create archive?"
                    type="confirmation"
                    onClose={handleCreateArchiveConfirm}
                />
            )}

            {showOpenArchiveDialog && (
                <Errordialog
                    message="Do you want to open archive?"
                    type="confirmation"
                    onClose={handleOpenArchiveConfirm}
                />
            )}

            {showCreateAuditLog && (
                <AuditTrail
                    isOpen={showCreateAuditLog}
                    onClose={() => setShowCreateAuditLog(false)}
                    onAuthorized={handleArchiveAuditLogAuthorized}
                    actionLabel="Submit"

                />
            )}

            {showOpenAuditLog && (
                <AuditTrail
                    isOpen={showOpenAuditLog}
                    onClose={() => setShowOpenAuditLog(false)}
                    onAuthorized={handleOpenArchiveAuditLogAuthorized}
                    actionLabel="Submit"

                />
            )}

            {showOpenArchivePopup && (
                <OpenArchivePopup
                    isOpen={showOpenArchivePopup}
                    onClose={() => setShowOpenArchivePopup(false)}
                    archiveList={archiveList}
                    onArchiveSelect={handleArchiveSelect}
                />
            )}
        </div>
    )
}

export default AuditTrailHistory


