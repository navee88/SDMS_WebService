import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Filter, RotateCcw, RefreshCw, Settings, ChevronUp, ChevronDown, X, CheckSquare,
    FolderDown, Upload, FolderUp, FileClock, History, Tag, FileText, FolderOpen, Download,
    CheckCircle, List, MoreVertical, MousePointer2, Calendar,
    UploadIcon,
    Search,
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../../../../Context/LanguageContext';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';



const InstrumentGrid = () => {
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState(null);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchValues, setSearchValues] = useState({
        clientName: '',
        instrument: '',
        live: ''
    });
    const [focusedInput, setFocusedInput] = useState(null);
    const [hoveredColumn, setHoveredColumn] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    // Simulate API call
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Simulated API response
        const apiData = [
            { id: 1, clientName: 'DESKTOP-CU9J5T2', instrument: 'CU-Summary1 (CU-Summary1)', live: true },
            { id: 2, clientName: 'DESKTOP-CU9J5T2', instrument: 'CU-Summary1 (CU-Summary1)', live: true },
            { id: 3, clientName: 'DESKTOP-CU9J5T2', instrument: 'MU-Summary1 (MU-Summary1)', live: true },
            { id: 4, clientName: 'DESKTOP-CU9J5T2', instrument: 'AU-Summary1 (AU-Summary1)', live: true },
            { id: 5, clientName: 'DESKTOP-CU9J5T2', instrument: 'CU-Summary1 (CU-Summary1)', live: true },
            { id: 6, clientName: 'DESKTOP-CU9J5T2', instrument: 'CU-Summary1 (CU-Summary1)', live: false },
            { id: 7, clientName: 'DESKTOP-CU9J5T2', instrument: 'CU-Summary1 (CU-Summary1)', live: true },
        ];
        setData(apiData);
        setFilteredData(apiData);
    };

    useEffect(() => {
        filterData();
    }, [searchValues, data]);

    const filterData = () => {
        let filtered = [...data];

        if (searchValues.clientName) {
            filtered = filtered.filter(item =>
                item.clientName.toLowerCase().includes(searchValues.clientName.toLowerCase())
            );
        }

        if (searchValues.instrument) {
            filtered = filtered.filter(item =>
                item.instrument.toLowerCase().includes(searchValues.instrument.toLowerCase())
            );
        }

        if (searchValues.live) {
            const searchLower = searchValues.live.toLowerCase();
            filtered = filtered.filter(item => {
                const liveText = item.live ? 'true' : 'false';
                return liveText.includes(searchLower);
            });
        }

        setFilteredData(filtered);
    };

    const handleSort = (order) => {
        const sorted = [...filteredData].sort((a, b) => {
            if (order === 'asc') {
                return a.instrument.localeCompare(b.instrument);
            } else if (order === 'desc') {
                return b.instrument.localeCompare(a.instrument);
            }
            return 0;
        });
        setFilteredData(sorted);
        setSortOrder(order);
        setSortMenuOpen(false);
    };

    const handleRemoveSort = () => {
        filterData();
        setSortOrder(null);
        setSortMenuOpen(false);
    };

    const handleSearchChange = (column, value) => {
        setSearchValues(prev => ({
            ...prev,
            [column]: value
        }));
    };

    const clearSearch = (column) => {
        setSearchValues(prev => ({
            ...prev,
            [column]: ''
        }));
    };

    return (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-gray-300 bg-white">
                <div
                    className="px-4 py-3 font-semibold text-sm text-gray-700 border-r border-gray-300 relative"
                    onMouseEnter={() => setHoveredColumn('clientName')}
                    onMouseLeave={() => setHoveredColumn(null)}
                >
                    <div className="flex items-center justify-between">
                        <span>Client Name</span>
                    </div>
                </div>
                <div
                    className="px-4 py-3 font-semibold text-sm text-gray-700 border-r border-gray-300 relative"
                    onMouseEnter={() => setHoveredColumn('instrument')}
                    onMouseLeave={() => setHoveredColumn(null)}
                >
                    <div className="flex items-center justify-between">
                        <span>Instrument</span>
                        {hoveredColumn === 'instrument' && (
                            <button
                                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                                className="hover:bg-gray-100 p-1 rounded"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown Menu */}
                    {sortMenuOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 shadow-lg z-10 w-48">
                            <button
                                onClick={() => handleSort('asc')}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12l7-7 7 7" />
                                </svg>
                                Sort Ascending
                            </button>
                            <button
                                onClick={() => handleSort('desc')}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 19V5M5 12l7 7 7-7" />
                                </svg>
                                Sort Descending
                            </button>
                            <button
                                onClick={handleRemoveSort}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                                Remove Sort
                            </button>
                        </div>
                    )}
                </div>
                <div
                    className="px-4 py-3 font-semibold text-sm text-gray-700 flex items-center justify-between"
                    onMouseEnter={() => setHoveredColumn('live')}
                    onMouseLeave={() => setHoveredColumn(null)}
                >
                    <span>live</span>
                </div>
            </div>

            {/* Search Row */}
            <div className="grid grid-cols-3 border-b border-gray-300 bg-gray-50">
                <div className="px-4 py-1 border-r border-gray-300">
                    <div className="relative">
                        {focusedInput !== 'clientName' && !searchValues.clientName && (
                            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        )}
                        <input
                            type="text"
                            value={searchValues.clientName}
                            onChange={(e) => handleSearchChange('clientName', e.target.value)}
                            onFocus={() => setFocusedInput('clientName')}
                            onBlur={() => setFocusedInput(null)}
                            className={`w-full ${focusedInput === 'clientName' || searchValues.clientName ? 'pl-2' : 'pl-8'} pr-2 py-1 text-sm border-0 border-b-2 ${focusedInput === 'clientName' ? 'border-blue-500' : 'border-gray-300'
                                } focus:outline-none bg-transparent`}
                        />
                    </div>
                </div>
                <div className="px-4 py-1 border-r border-gray-300">
                    <div className="relative">
                        {focusedInput !== 'instrument' && !searchValues.instrument && (
                            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        )}
                        <input
                            type="text"
                            value={searchValues.instrument}
                            onChange={(e) => handleSearchChange('instrument', e.target.value)}
                            onFocus={() => setFocusedInput('instrument')}
                            onBlur={() => setFocusedInput(null)}
                            className={`w-full ${focusedInput === 'instrument' || searchValues.instrument ? 'pl-2' : 'pl-8'} pr-2 py-1 text-sm border-0 border-b-2 ${focusedInput === 'instrument' ? 'border-blue-500' : 'border-gray-300'
                                } focus:outline-none bg-transparent`}
                        />
                    </div>
                </div>
                <div className="px-4 py-2">
                    {/* Empty - no search for live column */}
                </div>
            </div>
            <div className="overflow-y-auto flex-1">
                {/* Data Rows */}
                {filteredData.map((row, index) => (
                    <div
                        key={row.id}
                        onClick={() => setSelectedRow(row.id)}
                        className={`grid grid-cols-3 border-b border-gray-200 cursor-pointer ${selectedRow === row.id ? 'bg-[#EEF2F9]' : 'hover:bg-gray-50'
                            }`}

                    >
                        <div className="px-4 py-2 text-sm text-gray-700 border-r border-gray-200 font-medium">
                            {row.clientName}
                        </div>
                        <div className="px-4 py-2 text-sm text-gray-700 border-r border-gray-200">
                            {row.instrument}
                        </div>
                        <div className="px-4 py-2 text-center">
                            {row.live && (
                                <span className="text-gray-700 text-lg">✓</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

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


const UsersPage = () => {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();

    const mockData = [
        {
            id: 1,
            clientName: "DESKTOP-CU9J5T2",
            taskStatus: "TS_1",
            fileName: "sample1"

        },
        {
            id: 2,
            clientName: "DESKTOP-CU9J5T2",
            taskStatus: "TS_2",
            fileName: "sample2"
        },
        {
            id: 3,
            clientName: "DESKTOP-CU9J5T2",
            taskStatus: "TS_3",
            fileName: "sample3",
        },
        {
            id: 4,
            clientName: "DESKTOP-CU9J5T2",
            taskStatus: "TS_4",
            fileName: "sample4"

        },
        {
            id: 5,
            clientName: "DESKTOP-CU9J5T2",
            taskStatus: "TS_5",
            fileName: "sample5"

        },
        {
            id: 6,
            clientName: "DESKTOP-CU9J5T2",
            taskStatus: "TS_6",
            fileName: "sample6"

        },
        {
            id: 7,
            clientName: "DESKTOP-CU9J5T2",
            taskStatus: "TS_7",
            fileName: "sample7"

        }
    ];



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

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setUserData(mockData);
            setLoading(false);
        }, 300);

    }, []);

    const userColumns = useMemo(() => [
        {
            key: 'clientName',
            label: t('label.clientName'),
            width: 120,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.clientName}</span>
        },
        {
            key: 'taskStatus',
            label: t('label.taskStatus'),
            width: 120,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.taskStatus}</span>
        },
        {
            key: 'fileName',
            label: t('label.fileName'),
            width: 120,
            enableSearch: true,
            render: (row) => <span className="text-gray-700">{row.fileName}</span>
        }
    ], []);


    const renderUserDetail = (user) => (
        <div className="space-y-3 text-[12px]">

            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.size")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.size}450 mb</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.restoreLocation")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.restoreLocation}D:/SDMS/Restore</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.restoredBy")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.restoredBy}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.restoredOn")}</div>
                <div className="col-span-2 font-semibold text-[#353F49]">{user.restoredOn}</div>
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
        <div className="flex flex-col">
            <GridLayout
                columns={userColumns}
                data={userData}
                renderDetailPanel={renderUserDetail}
            />
        </div>
    );
};



const RestoreLogs = () => {
    const today = getCurrentDate();
    // const [hideEmpty, setHideEmpty] = useState(true);
    const [isOpen, setIsOpen] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [visibleCount, setVisibleCount] = useState(9);
    const [recordsDuration, setRecordsDuration] = useState("Current Date");
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const options = ["User A", "User B"];
    const [selectedClient, setSelectedClient] = useState(options[0]);
    const [task, setTask] = useState("");
    const [fileName, setFileName] = useState("");


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
    return (
        <div className="flex flex-col w-full font-roboto rounded-md font-[roboto]">
            <div className="bg-[#f0f2f5] px-4 pt-4 pb-2 relative rounded-t-md z-20">
                {isOpen ? (
                    <div className="flex flex-wrap items-end gap-3.5 mb-2">

                        <div className="w-60 mr-2">
                            <AnimatedDropdown
                                label={t("label.clientName")}
                                value={selectedClient}
                                options={options}
                                onChange={(e) => setSelectedClient(e.target.value)}
                                // isSearchable={true}
                                allowFreeInput={true}
                            />
                        </div>


                        <div className="w-60 mr-6">
                            <AnimatedDropdown
                                label={t("label.task")}
                                value={task}
                                options={["TS1_D:\SDMSFTP-001", "TS2_D:\SDMSFTP-002", "TS3_D:\SDMSFTP-003"]}
                                onChange={(e) => setTask(e.target.value)}
                                // isSearchable={true}
                                allowFreeInput={true}
                            />

                        </div>

                        <div className="w-60 mr-2">
                            <AnimatedInput
                                label={t("label.fileName")}
                                name="filename"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                            />

                        </div>


                        <div className="w-60 mr-2">
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
                            <PrimaryButton icon={Filter} label={t('button.filter')} />
                            <PrimaryButton icon={RefreshCw} label={t('button.refresh')} />
                            <PrimaryButton icon={UploadIcon} label={t('button.export')} />
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
                    <UsersPage />
                </div>
            </div>


        </div>
    )
}

export default RestoreLogs


