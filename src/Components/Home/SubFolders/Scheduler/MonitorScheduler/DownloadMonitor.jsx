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
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
import { handleExportCommon } from '../../../../Layout/Common/exportService';
import useAxios from '../../../../../Services/servicecall';

const PrimaryButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 px-2.5 py-2 hover:scale-90 transition-all bg-white text-[#2883FE] text-[11px] font-bold rounded shadow-sm border border-transparent hover:bg-blue-50  whitespace-nowrap"
  >
    <Icon className="w-4 h-4 stroke-[3]" />
    <span>{label}</span>
  </button>
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

const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
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
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.clientName}
        </span>
      )
    },
    {
      key: 'fileName',
      label: t('label.fileName'),
      width: 250,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.fileName}
        </span>
      )
    },
    {
      key: 'taskStatus',
      label: t('label.taskStatus'),
      width: 120,
      enableSearch: true,
      render: (row, isSelected) => {
        const status = row.taskStatus?.toLowerCase() || '';
        const color = status === 'done' ? 'text-green-600' : 'text-red-600';
        return (
          <span
            className={`${color} ${isSelected ? 'font-semibold' : ''}`}
            style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}
          >
            {row.taskStatus}
          </span>
        );
      }
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Download Logs");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream"
    });

    saveAs(file, `Download_Monitor_Logs_${Date.now()}.xlsx`);
  }, [exportTrigger, userData, userColumns]);

  const renderUserDetail = (user) => (
    <div className="space-y-3 text-[12px]">
      {[
        { label: "sourcePath", value: user.sourcePath || "" },
        { label: "type", value: user.type || "" },
        { label: "downloadLocation", value: user.downloadLocation || "" },
        { label: "errorDescription", value: user.errorDescription || "" },
        { label: "downloadedBy", value: user.downloadedBy || "" },
        { label: "downloadedOn", value: user.downloadedOn || "" },
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

const DownloadMonitor = () => {
  const today = getCurrentDate();
  const { t } = useTranslation();
  const { postData } = useAxios();

  // States
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  // const [visibleCount, setVisibleCount] = useState(9);
  const [recordsDuration, setRecordsDuration] = useState("Current Date");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedClient, setSelectedClient] = useState("");
  const [taskId, setTaskId] = useState("");
  const [fileName, setFileName] = useState("");
  const [filters, setFilters] = useState({});
  const [exportTrigger, setExportTrigger] = useState(0);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  const [clientList, setClientList] = useState([]);
  const [clientMapping, setClientMapping] = useState({});
  const [taskList, setTaskList] = useState([]);
  const [taskMapping, setTaskMapping] = useState({});
  const [errorDialog, setErrorDialog] = useState({ show: false, message: "", type: "" });
  // const [isClientTouched, setIsClientTouched] = useState(false);
  // const [isTaskTouched, setIsTaskTouched] = useState(false);

  const { currentLanguage, changeLanguage, languages } = useLanguage();

  // const menuRef = useRef(null);
  // const actionContainerRef = useRef(null);
  // const buttonRefs = useRef([]);

  // const [configState, setConfigState] = useState({
  //   "Restore": true,
  //   "Folder Download": true,
  //   "File Upload": true,
  //   "Folder Upload": true,
  //   "Version History": true,
  //   "Work Complete": true,
  //   "Workflow History": true,
  //   "Tag": true,
  //   "Open": true,
  //   "File Download": true,
  //   "Audit Trail History": true,
  //   "Attribute": true,
  //   "Multi-File Select": true,
  //   "Instrument": true,
  //   "Workflow Status": true,
  //   "Task Status": true,
  //   "Parser Status": false
  // });

  // const enabledActions = ALL_ACTION_ORDER.filter(action => configState[action]);

  // useEffect(() => {
  //   const calculateVisibleActions = () => {
  //     if (!actionContainerRef.current) return;

  //     const containerWidth = actionContainerRef.current.offsetWidth;
  //     const reservedSpace = 140;
  //     const availableWidth = containerWidth - reservedSpace;

  //     let accumulatedWidth = 0;
  //     let count = 0;

  //     for (let i = 0; i < buttonRefs.current.length; i++) {
  //       const button = buttonRefs.current[i];
  //       if (!button) continue;

  //       const buttonWidth = button.offsetWidth + 8;

  //       if (accumulatedWidth + buttonWidth <= availableWidth) {
  //         accumulatedWidth += buttonWidth;
  //         count++;
  //       } else {
  //         break;
  //       }
  //     }

  //     setVisibleCount(Math.max(1, count));
  //   };

  //   calculateVisibleActions();

  //   window.addEventListener('resize', calculateVisibleActions);

  //   const timer = setTimeout(calculateVisibleActions, 100);

  //   return () => {
  //     window.removeEventListener('resize', calculateVisibleActions);
  //     clearTimeout(timer);
  //   };
  // }, [configState, enabledActions.length]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setShowMenu(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  // const visibleActions = enabledActions.slice(0, visibleCount);
  // const overflowActions = enabledActions.slice(visibleCount);

  const isCustomDate = recordsDuration === "Custom Date";

  const handleDurationChange = (value) => {
    const actualValue = value?.target?.value || value?.value || value;
    setRecordsDuration(actualValue);
  };

  const formatDateDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateYYYYMMDD = (ddmmyyyyDate) => {
    if (!ddmmyyyyDate) return '';
    const parts = ddmmyyyyDate.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return ddmmyyyyDate;
  };

  const formatDateDDMMYYYYfromInput = (yyyymmddDate) => {
    if (!yyyymmddDate) return '';
    const parts = yyyymmddDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return yyyymmddDate;
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
      console.log("Client List Response:", result);

      if (Array.isArray(result) && result.length > 0) {
        const clientNames = result.map(item => item.L06ClientName);

        const mapping = result.reduce((acc, item) => {
          acc[item.L06ClientName] = item.L06ClientID;
          return acc;
        }, {});

        setClientList(clientNames);
        setClientMapping(mapping);

        setSelectedClient(prev => prev ? prev : clientNames[0]);
      }
    } catch (error) {
      console.error('Error fetching client list:', error);
    }
  };

  const fetchTaskList = async () => {
    try {
      const payload = {
        sType: "D", // ← Changed from "R" to "D" for Download Monitor
        ...CF_activeUserdetails()
      };

      const result = await postData('Scheduler/getTaskDownload', payload);
      console.log("Task List Response:", result);

      if (Array.isArray(result) && result.length > 0) {
        const taskLabels = result.map(item => item.sTaskID);

        const mapping = result.reduce((acc, item) => {
          acc[item.sTaskID] = item.sDownloadTaskID;
          return acc;
        }, {});

        setTaskList(taskLabels);
        setTaskMapping(mapping);

        setTaskId(prev => prev ? prev : taskLabels[0]);
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
      await handleInitialLoad();
    };
    initializeComponent();
  }, []);

  const handleInitialLoad = async () => {
    setLoading(true);
    try {
      const todayDate = new Date();
      const sFromDate = formatDateDDMMYYYY(todayDate);
      const sToDate = formatDateDDMMYYYY(todayDate);

      const payload = {
        bStatus: true,
        sFromDate: sFromDate,
        sToDate: sToDate,
        sClientID: "",
        sFileName: "",
        sDownloadTaskID: "",
        ...CF_activeUserdetails()
      };
      console.log("Initial Load Payload:", payload);

      const result = await postData('Scheduler/getDownloadMonitor', payload);

      if (result && Array.isArray(result)) {
        const mappedData = result.map((item, index) => ({
          id: index + 1,
          clientName: item.sClientName || "",
          fileName: item.sFileName || "",
          taskStatus: item.sTaskStatus || "",
          sourcePath: item.sSourcePath || "",
          type: item.sFileType || "",
          downloadLocation: item.sDownloadLocation || "",
          errorDescription: item.sErrorDescription || "",
          downloadedBy: item.sDownloadBy || "",
          downloadedOn: item.sTimeStamp || "",
          downloadTskID: item.sDownloadTskID || "",
          taskID: item.sTaskID || "",
          utcTimeStamp: item.sUTCTimeStamp || "",
          siteCode: item.sSiteCode || ""
        }));

        setUserData(mappedData);
        setFilters({ ...payload, data: mappedData });
      }

      console.log("Initial Load Response:", result);
      setLoading(false);
    } catch (error) {
      console.error('Error in initial load:', error);
      setLoading(false);
    }
  };

  const fetchDownloadMonitor = async ({ isRefresh = false } = {}) => {
    console.group("Download Monitor API");
    setLoading(true);

    try {
      const { startDate, endDate } = getDateRange(recordsDuration, fromDate, toDate);

      const payload = {
        bStatus: false,
        sFromDate: startDate,
        sToDate: endDate,
        sClientID: clientMapping[selectedClient] || "",
        sFileName: fileName || "",
        sDownloadTaskID: taskMapping[taskId] || "",
        ...CF_activeUserdetails()
      };

      console.log("Request Payload:", payload);

      const response = await postData("Scheduler/getDownloadMonitor", payload);

      console.log("API Response:", response);

      if (Array.isArray(response)) {
        const mappedData = response.map((item, index) => ({
          id: index + 1,
          clientName: item.sClientName || "",
          fileName: item.sFileName || "",
          taskStatus: item.sTaskStatus || "",
          sourcePath: item.sSourcePath || "",
          type: item.sFileType || "",
          downloadLocation: item.sDownloadLocation || "",
          errorDescription: item.sErrorDescription || "",
          downloadedBy: item.sDownloadBy || "",
          downloadedOn: item.sTimeStamp || "",
          downloadTskID: item.sDownloadTskID || "",
          taskID: item.sTaskID || "",
          utcTimeStamp: item.sUTCTimeStamp || "",
          siteCode: item.sSiteCode || ""
        }));

        setUserData(mappedData);
        setFilters({ data: mappedData });
      }
    } catch (err) {
      console.error("Download Monitor Error:", err);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  const handleFilter = () => {
    console.log("Filter Clicked");
    fetchDownloadMonitor();
  };

  const handleRefresh = () => {
    console.log("Refresh Clicked");
    fetchDownloadMonitor({ isRefresh: true });
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
        sDownloadLocation: row.downloadLocation || "",
        sErrorDescription: row.errorDescription || null,
        sDownloadBy: row.downloadedBy || "",
        sTimeStamp: row.downloadedOn || "",
        sDownloadTskID: row.downloadTskID || "",
        sTaskID: row.taskID || "",
        sUTCTimeStamp: row.utcTimeStamp || "",
        sSiteCode: row.siteCode || "",
        visibleindex: index,
        boundindex: index,
        uid: index,
        uniqueid: `${Date.now()}-${index}`
      })),
      sFileName: "DownloadMonitor",
      sBrowserURL: window.location.origin,
      AllowKeys: [
        "sClientName", "sSourcePath", "sTaskStatus", "sFileName",
        "sFileType", "sDownloadLocation", "sErrorDescription",
        "sDownloadBy", "sTimeStamp"
      ],
      HeaderDetails: [
        "Client Name", "Source Path", "Task Status", "Filename",
        "Type", "Download Location", "Error Description",
        "Downloaded By", "Downloaded On"
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
                }}
                allowFreeInput={true}
              />

            </div>


            <div className="w-60">
              <AnimatedDropdown
                label={t("label.taskId")}
                value={taskId}
                options={taskList}
                onChange={(val) => {
                  setTaskId(val?.target?.value ?? val);
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
                allowFreeInput={true}
              />
            </div>

            {isCustomDate && (
              <>
                <div className="w-52 pb-4">
                  <DatePicker
                    label="From"
                    value={formatDateYYYYMMDD(fromDate)}
                    onChange={(val) => setFromDate(formatDateDDMMYYYYfromInput(val))}
                    max={formatDateYYYYMMDD(today)}
                  />
                </div>
                <div className="w-52 pb-4">
                  <DatePicker
                    label="To"
                    value={formatDateYYYYMMDD(toDate)}
                    onChange={(val) => setToDate(formatDateDDMMYYYYfromInput(val))}
                    max={formatDateYYYYMMDD(today)}
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
        <div className="flex-1 overflow-hidden grid-custom-font">
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

export default DownloadMonitor