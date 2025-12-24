import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Filter, RotateCcw, RefreshCw, Settings, ChevronUp, ChevronDown, X, CheckSquare,
    FolderDown, Upload, FolderUp, FileClock, History, Tag, FileText, FolderOpen, Download,
    CheckCircle, List, MoreVertical, MousePointer2, Calendar,
    UploadIcon,
    Search,
    RotateCw,
    RotateCwIcon,
    Printer,
    Archive,
    PackageOpen,
    PackageOpenIcon,
    ArchiveIcon,
    SquareCheckBig,
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

const OpenArchivePopup = ({ isOpen, onClose, archiveList, onArchiveSelect }) => {
    const [selectedArchiveId, setSelectedArchiveId] = useState(archiveList.length > 0 ? archiveList[0].id : null);
    const { t } = useTranslation();

    const handleRowClick = (id) => {
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
                            onRowClick={handleRowClick}
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


// const OpenArchivePopup = ({ isOpen, onClose, archiveList, onArchiveSelect }) => {
//     const [selectedArchiveId, setSelectedArchiveId] = useState(null);
//     const { t } = useTranslation();

//     const handleRowSelection = (id) => {
//         setSelectedArchiveId(id);
//     };

//     const archiveColumns = useMemo(() => [
//         {
//             key: 'name',
//             label: t("label.name"),
//             width: 120,
//             enableSearch: true,
//             render: (row) => <span className="text-gray-700">{row.name}</span>
//         },
//         {
//             key: 'createDate',
//             label: t("label.CRDate"),
//             width: 120,
//             enableSearch: true,
//             render: (row) => <span className="text-gray-700">{row.createDate}</span>
//         }
//     ], [selectedArchiveId, t]);

//     const handleOpen = () => {
//         if (!selectedArchiveId) {
//             alert('Please select an archive');
//             return;
//         }
//         const selectedArchive = archiveList.find(a => a.id === selectedArchiveId);
//         onArchiveSelect(selectedArchive.name);
//     };

//     return (
//         <CustomPopup
//             isOpen={isOpen}
//             onClose={onClose}
//             title="Open Archive"
//             content={
//                 <div className="p-4">
//                     <div className="mb-4" style={{ height: '650px' }}>
//                         <GridLayout
//                             columns={archiveColumns}
//                             data={archiveList}
//                             onRowClick={handleRowSelection}
//                             selectedRows={selectedArchiveId ? [selectedArchiveId] : []}
//                         />
//                     </div>
//                     <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
//                         <button
//                             onClick={handleOpen}
//                             className="flex items-center gap-2 px-4 py-2 bg-[#2883FE] hover:bg-[#2883FE] text-white text-sm font-semibold rounded transition-colors"
//                         >
//                             <CheckSquare className="w-4 h-4" /> {t("button.open")}
//                         </button>
//                         <button
//                             onClick={onClose}
//                             className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors"
//                         >
//                             {t("button.close")}
//                         </button>
//                     </div>
//                 </div>
//             }
//         />
//     );
// };

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
    return `${year}-${month}-${day}`;
};


const UsersPage = ({ userData, setUserData, selectedRows, setSelectedRows, showReviewHistory, loading, userColumns, reviewHistoryColumns, exportTrigger }) => {
    const [error, setError] = useState(null);
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();

    //   useEffect(() => {
    //     const fetchUsers = async () => {
    //       try {
    //         setLoading(true);
    //         const response = await axios.get('http://localhost:5173/users');
    //         setUserData(response.data);
    //         setLoading(false);
    //       } catch (err) {
    //         console.error("Error fetching data:", err);
    //         setError(err.message || "Something went wrong");
    //         setLoading(false);
    //       }
    //     };

    //     fetchUsers();
    //   }, []);

    // useEffect(() => {
    //     setLoading(true);
    //     setTimeout(() => {
    //         setUserData(mockData);
    //         setLoading(false);
    //     }, 300);

    // }, []);

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


    const renderUserDetail = (user) => (
        <div className="space-y-3 text-[12px]">

            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.comments")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.comments}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.userName")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.userName}</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.profileName")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.profileName}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.systemComments")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.systemComments}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.reviewComments")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.reviewComments}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.reviewedBy")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.reviewedBy}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.reviewedDate")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.reviewedDate}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.modifiedData")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.modifiedData}</div>
            </div>


        </div>
    );


    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500"></div>;
    }


    return (
        // <div className="flex flex-col mt-2">
        //     <GridLayout
        //         columns={userColumns}
        //         data={userData}
        //         renderDetailPanel={renderUserDetail}
        //     />
        // </div>
        <div className="flex-1 overflow-hidden">
            {showReviewHistory ? (
                <GridLayout
                    columns={reviewHistoryColumns}
                    data={userData.filter(row => selectedRows.includes(row.id))}
                />
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

const MOCK_DATA = [
    {
        id: 1,
        select: false,
        moduleName: "Audit Trail",
        actions: "Create",
        transactionOn: "08/12/2025",
        reviewStatus: "Pending",
        requestedClient: "Client A",
        affectedClient: "Client B",
        instrumentName: "Instrument X",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    },
    {
        id: 2,
        select: true,
        moduleName: "Role Management",
        actions: "Update",
        transactionOn: "08/12/2025",
        reviewStatus: "Approved",
        requestedClient: "Client C",
        affectedClient: "Client D",
        instrumentName: "Instrument Y",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    },
    {
        id: 3,
        select: false,
        moduleName: "Audit Trail",
        actions: "Delete",
        transactionOn: "07/12/2025",
        reviewStatus: "Rejected",
        requestedClient: "Client E",
        affectedClient: "Client F",
        instrumentName: "Instrument Z",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    },
    {
        id: 4,
        select: false,
        moduleName: "Client Configuration",
        actions: "Update",
        transactionOn: "07/12/2025",
        reviewStatus: "Pending",
        requestedClient: "Client G",
        affectedClient: "Client H",
        instrumentName: "Instrument A",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    },
    {
        id: 5,
        select: true,
        moduleName: "Audit Logs",
        actions: "View",
        transactionOn: "06/12/2025",
        reviewStatus: "Approved",
        requestedClient: "Client I",
        affectedClient: "Client J",
        instrumentName: "Instrument B",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    },
    {
        id: 6,
        select: false,
        moduleName: "Permission Setup",
        actions: "Create",
        transactionOn: "06/12/2025",
        reviewStatus: "Pending",
        requestedClient: "Client K",
        affectedClient: "Client L",
        instrumentName: "Instrument C",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    },
    {
        id: 7,
        select: false,
        moduleName: "Workflow Engine",
        actions: "Update",
        transactionOn: "05/12/2025",
        reviewStatus: "Rejected",
        requestedClient: "Client M",
        affectedClient: "Client N",
        instrumentName: "Instrument D",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    },
    {
        id: 8,
        select: true,
        moduleName: "Report Generator",
        actions: "Generate",
        transactionOn: "05/12/2025",
        reviewStatus: "Approved",
        requestedClient: "Client O",
        affectedClient: "Client P",
        instrumentName: "Instrument E",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    },
    {
        id: 9,
        select: false,
        moduleName: "Notification Service",
        actions: "Update",
        transactionOn: "04/12/2025",
        reviewStatus: "Pending",
        requestedClient: "Client Q",
        affectedClient: "Client R",
        instrumentName: "Instrument F",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    },
    {
        id: 10,
        select: false,
        moduleName: "Security Settings",
        actions: "Update",
        transactionOn: "04/12/2025",
        reviewStatus: "Approved",
        requestedClient: "Client S",
        affectedClient: "Client T",
        instrumentName: "Instrument G",
        reason: "N/A",
        comments: "Sample comment",
        reviewComments: "Review comment text",
        reviewedBy: "Admin User",
        reviewedDate: "08/12/2025"
    }
];

const AuditTrailHistory = () => {
    const today = getCurrentDate();
    // const [hideEmpty, setHideEmpty] = useState(true);
    const [isOpen, setIsOpen] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [visibleCount, setVisibleCount] = useState(9);
    const [recordsDuration, setRecordsDuration] = useState("Current Date");
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

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setUserData(MOCK_DATA);
            setLoading(false); // Set to false after loading
        }, 300);
    }, []);

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
                startDate = formatDateDDMMYYYY(fromDate);
                endDate = formatDateDDMMYYYY(toDate);
                break;

            default:
                startDate = endDate = formatDateDDMMYYYY(today);
        }

        return { startDate, endDate };
    };

    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();

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
            render: (row, index) => <span className="text-gray-700">{index + 1}</span>
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
            width: 150,
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


    const handleReviewHistory = () => {
        if (selectedRows.length === 0) {
            setErrorDialog({
                show: true,
                message: "Select an existing record.",
                type: "information"
            });
            return;
        }
        setShowReviewHistory(true);
    };

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
            type: "information"
        });

        setShowAuditTrail(true);
    }

    const handleAuditTrailAuthorized = (data) => {
        // Update the selected rows with review status
        setUserData(prev => prev.map(row =>
            selectedRows.includes(row.id)
                ? { ...row, reviewStatus: "Reviewed" }
                : row
        ));
        setShowAuditTrail(false);
        setSelectedRows([]);
    };

    const handleCreateArchive = () => {
        setShowCreateArchiveDialog(true);
    };

    const handleCreateArchiveConfirm = () => {
        setShowCreateArchiveDialog(false);
        setShowCreateAuditLog(true);
    };

    const handleArchiveAuditLogAuthorized = (data) => {
        const newArchive = {
            id: archiveList.length + 1,
            name: `CFRArchiving_${archiveList.length + 1}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
            createDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        setArchiveList(prev => [newArchive, ...prev]);
        setShowCreateAuditLog(false);

        // Show success message and keep the current data visible
        setErrorDialog({
            show: true,
            message: `Archive "${newArchive.name}" created successfully!`,
            type: "success"
        });
    };

    const handleOpenArchive = () => {
        setShowOpenArchiveDialog(true);
    };

    const handleOpenArchiveConfirm = () => {
        setShowOpenArchiveDialog(false);
        setShowOpenAuditLog(true);
    };

    const handleOpenArchiveAuditLogAuthorized = (data) => {
        setShowOpenAuditLog(false);
        setShowOpenArchivePopup(true);
    };

    const handleArchiveSelect = (archive) => {
        setSelectedArchiveName(archive.name);
        setShowOpenArchivePopup(false);

        // Load archived data - filter or load specific archived records
        // For now, showing the original data. You can filter by archive.id or load from backend
        const archivedData = MOCK_DATA.filter(row => row.id <= 5); // Example: load specific archived records

        setUserData(archivedData);
        setShowReviewHistory(false);
        setSelectedRows([]);
    };

    //Reset Function
    const handleReset = () => {
        setSelectedUser("All");
        setSelectedModule("All");
        setSelectedAuditType("All");
        setRecordsDuration("Current Date");
        setFromDate(today);
        setToDate(today);
        setSelectedRows([]);
        setShowReviewHistory(false);
        setSelectedArchiveName("");

        // Reset to original mock data
        // setLoading(true);
        // setTimeout(() => {
        //     setUserData(MOCK_DATA);
        //     setLoading(false);
        // }, 300);
    };

    const handlePrint = () => {
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
    };

    const handleExport = () => {
        if (userData.length === 0) {
            setErrorDialog({
                show: true,
                message: "No data available to export.",
                type: "information"
            });
            return;
        }
        setExportTrigger(prev => prev + 1);
    };
    const handleFilter = () => {
        setLoading(true);

        setTimeout(() => {
            let filteredData = [...MOCK_DATA];

            // Filter by User Name
            if (selectedUser !== "All") {
                filteredData = filteredData.filter(row =>
                    row.userName && row.userName.toLowerCase().includes(selectedUser.toLowerCase())
                );
            }

            // Filter by Module Name
            if (selectedModule !== "All") {
                filteredData = filteredData.filter(row =>
                    row.moduleName && row.moduleName.toLowerCase().includes(selectedModule.toLowerCase())
                );
            }

            // Filter by Audit Type
            if (selectedAuditType !== "All") {
                // You can add logic based on your audit type field
                // For now, keeping all data for "All"
            }

            // Filter by Date Range
            const { startDate, endDate } = getDateRange(recordsDuration, fromDate, toDate);

            filteredData = filteredData.filter(row => {
                if (!row.transactionOn) return false;

                const rowDate = row.transactionOn; // Format: "08/12/2025"

                // Convert to comparable format
                const [rowDay, rowMonth, rowYear] = rowDate.split('/');
                const rowDateObj = new Date(`${rowYear}-${rowMonth}-${rowDay}`);

                const [startDay, startMonth, startYear] = startDate.split('/');
                const startDateObj = new Date(`${startYear}-${startMonth}-${startDay}`);

                const [endDay, endMonth, endYear] = endDate.split('/');
                const endDateObj = new Date(`${endYear}-${endMonth}-${endDay}`);

                return rowDateObj >= startDateObj && rowDateObj <= endDateObj;
            });

            setUserData(filteredData);
            setLoading(false);
            setSelectedRows([]);
            setShowReviewHistory(false);
        }, 300);
    };
    return (
        <div className="flex flex-col w-full font-roboto rounded-md">

            <div className="bg-[#f0f2f5] px-4 pt-4 pb-2 relative rounded-t-md z-20">
                {isOpen ? (
                    <div className="flex flex-wrap items-end gap-3.5 mb-2">

                        <div className="w-60 mr-4">
                            <AnimatedDropdown
                                label={t("label.userName")}
                                value={selectedUser}
                                options={["All", "User A", "User B"]}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                // isSearchable={true}
                                allowFreeInput={true}
                            />


                        </div>
                        <div className="w-60 mr-4">
                            <AnimatedDropdown
                                label={t("label.moduleName")}
                                value={selectedModule}
                                options={["All", "Audit Trail", "CFR Gateway", "CFR Settings"]}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                // isSearchable={true}
                                allowFreeInput={true}
                            />


                        </div>

                        <div className="w-60 mr-4">
                            <AnimatedDropdown
                                label={t("label.auditType")}
                                value={selectedAuditType}
                                options={["User", "System", "All"]}
                                onChange={(e) => setSelectedAuditType(e.target.value)}
                            />


                        </div>

                        <div className="w-60 mr-4">
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

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {selectedArchiveName && (
                    <div className="px-4 py-2 font-roboto">
                        <span className="font-bold text-xs text-[#000000]">Archival name: </span>
                        <span className="font-bold text-xs text-[#405F7D]">{selectedArchiveName}</span>
                    </div>
                )}

                <ActionButton icon={History} label={t('button.reviewHistory')} onClick={handleReviewHistory} />
                <ActionButton icon={FileText} label={t('button.review')} onClick={handleReview} />
                <ActionButton icon={ArchiveIcon} label={t('button.createArchieve')} onClick={handleCreateArchive} />
                <ActionButton icon={PackageOpenIcon} label={t('button.openArchieve')} onClick={handleOpenArchive} />
                <ActionButton icon={Upload} label={t('button.export')} onClick={handleExport} />
                <ActionButton icon={Printer} label={t('button.print')} onClick={handlePrint} />
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
                    onClose={() => setShowAuditTrail(false)}
                    onAuthorized={handleAuditTrailAuthorized}
                    actionLabel="Submit"
                    defaultReason="Reviewed"
                    disableReason={true}
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
                    type="information"
                    onClose={handleCreateArchiveConfirm}
                />
            )}

            {showOpenArchiveDialog && (
                <Errordialog
                    message="Do you want to open archive?"
                    type="information"
                    onClose={handleOpenArchiveConfirm}
                />
            )}

            {showCreateAuditLog && (
                <AuditTrail
                    isOpen={showCreateAuditLog}
                    onClose={() => setShowCreateAuditLog(false)}
                    onAuthorized={handleArchiveAuditLogAuthorized}
                    actionLabel="Submit"
                    defaultReason="Archive Created"
                    disableReason={true}
                />
            )}

            {showOpenAuditLog && (
                <AuditTrail
                    isOpen={showOpenAuditLog}
                    onClose={() => setShowOpenAuditLog(false)}
                    onAuthorized={handleOpenArchiveAuditLogAuthorized}
                    actionLabel="Submit"
                    defaultReason="Archive Opened"
                    disableReason={true}
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


