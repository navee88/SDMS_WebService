import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Filter, RefreshCw, ChevronUp, ChevronDown,
  UploadIcon,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileCode,
  Archive,
  FilePdf,
  FileText,
  FileType,
  Folder
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
import { useLogFilters } from '../../../../../Context/LogFiltersContext';

const FileIcon = ({ fileName, className = "w-4 h-4" }) => {
  const getFileExtension = (filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const getIconByExtension = (ext) => {
    // Document files
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return <FileText className={`${className} text-blue-600`} />;
    }

    // Spreadsheet files
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FileSpreadsheet className={`${className} text-green-600`} />;
    }

    // PDF files
    if (ext === 'pdf') {
      return <FileType className={`${className} text-red-600`} />;
    }

    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
      return <FileImage className={`${className} text-purple-600`} />;
    }

    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
      return <FileVideo className={`${className} text-pink-600`} />;
    }

    // Audio files
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) {
      return <FileAudio className={`${className} text-yellow-600`} />;
    }

    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'sql', 'py', 'java', 'c', 'cpp'].includes(ext)) {
      return <FileCode className={`${className} text-orange-600`} />;
    }

    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive className={`${className} text-gray-600`} />;
    }

    // Default file icon
    return <Folder className={`${className} text-gray-500`} />;
  };

  const extension = getFileExtension(fileName);
  return getIconByExtension(extension);
};




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


const UsersPage = ({ filters, refreshKey, exportTrigger, onDataCountChange }) => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();

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
      width: 120,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.clientName}
        </span>
      )
    },
    // {
    //   key: 'fileName',
    //   label: t('label.fileName'),
    //   width: 120,
    //   enableSearch: true,
    //   render: (row, isSelected) => (
    //     <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
    //       style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
    //       {row.fileName}
    //     </span>
    //   )
    // }
    {
      key: 'fileName',
      label: t('label.fileName'),
      width: 250,
      enableSearch: true,
      render: (row, isSelected) => (
        <div className="flex items-center gap-2">
          <FileIcon fileName={row.fileName} className="w-4 h-4 flex-shrink-0" />
          <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
            style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
            {row.fileName}
          </span>
        </div>
      )
    }
  ], []);

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

    saveAs(file, `Upload_Logs_${Date.now()}.xlsx`);
  }, [exportTrigger, userData, userColumns]);


  const renderUserDetail = (user) => (
    <div className="space-y-3 text-[12px]">
      {[
        { label: "size", value: user.size || "" },
        { label: "versionNo", value: user.versionNo || "" },
        { label: "fileMode", value: user.fileMode || "" },
        { label: "userName", value: user.userName || "" },
        { label: "uploadOn", value: user.uploadOn || "" },
        { label: "checksum", value: user.checksum || "" },
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



const UploadLogs = () => {
  const today = getCurrentDate();
  const [isOpen, setIsOpen] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  // const [recordsDuration, setRecordsDuration] = useState("Current Date");
  // const [fromDate, setFromDate] = useState(today);
  // const [toDate, setToDate] = useState(today);
  // const [selectedClient, setSelectedClient] = useState("");
  // const [task, setTask] = useState("");
  const [fileName, setFileName] = useState("");

  const COMPONENT_NAME = 'UploadLogs';
  const { getFilters, updateFilter } = useLogFilters();
  const contextFilters = getFilters(COMPONENT_NAME);
  const { selectedClient, task, recordsDuration, fromDate, toDate } = contextFilters;

  const [filters, setFilters] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [exportTrigger, setExportTrigger] = useState(0);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  const [clientList, setClientList] = useState([]);
  const [clientMapping, setClientMapping] = useState({});
  const [taskList, setTaskList] = useState([]);
  const [taskMapping, setTaskMapping] = useState({});
  const [errorDialog, setErrorDialog] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadDropdowns = async () => {
      await Promise.all([
        fetchClientList(),
        fetchTaskList()
      ]);
      setIsInitialized(true);
    };
    loadDropdowns();
  }, []);

  // (Using the Filter when reloading from the other tabs)
  // Separate useEffect that waits for mappings to be ready 
  useEffect(() => {
    if (isInitialized && Object.keys(clientMapping).length > 0 && Object.keys(taskMapping).length > 0) {
      // If context has values, use filter; otherwise use initial load
      if (selectedClient || task || recordsDuration !== "Current Date") {
        handleFilter();
      } else {
        handleInitialLoad();
      }
    }
  }, [isInitialized, clientMapping, taskMapping]);

  // (Using the Initial Load when reloading from the other tabs)
  // Separate useEffect that waits for mappings to be ready - only runs once
  // useEffect(() => {
  //   if (isInitialized && Object.keys(clientMapping).length > 0 && Object.keys(taskMapping).length > 0) {
  //     // Use initial load - only runs when component mounts
  //     handleInitialLoad();
  //   }
  // }, [isInitialized, clientMapping, taskMapping]);



  const handleInitialLoad = async () => {
    setLoading(true);
    try {
      // Wait a bit for context and mappings to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const { startDate, endDate } = getDateRange(recordsDuration, fromDate, toDate);
      const payload = {
        sFilter: "",
        sFromDate: getCurrentDate(),
        // sClientID: "",
        sClientID: clientMapping[selectedClient] || "", // Use context value
        ...CF_activeUserdetails()
      };
      console.log("Initial Load Payload:", payload);

      const result = await postData('AuditTrail/UploadlogLoad', payload);

      if (result && Array.isArray(result)) {
        const mappedData = result.map((item, index) => ({
          id: index + 1,
          clientName: item.ClientName || "",
          fileName: item.FileName || "",
          fileType: item.FileType?.trim() || "",
          size: item.FileSize || 0,
          fileMode: item.FileMode?.trim() || "",
          uploadOn: item.UpLoadTime || "",
          utcUploadTime: item.UTCUpLoadTime || "",
          userName: item.LoginUser || "",
          versionNo: item.FileVersionNo || 0,
          checksum: item.CheckSum || ""
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

  const { postData } = useAxios();

  const isCustomDate = recordsDuration === "Custom Date";

  // const handleDurationChange = (value) => {
  //   const actualValue = value?.target?.value || value?.value || value;
  //   setRecordsDuration(actualValue);
  // };

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

  const handleFilter = async () => {
    console.log("Filter Clicked");
    setLoading(true);

    try {
      const { startDate, endDate } = getDateRange(recordsDuration, fromDate, toDate);

      const payload = {
        sFromDate: startDate,
        sToDate: endDate,
        sClientID: clientMapping[selectedClient] || "",
        sFilename: fileName || "",
        sTaskID: taskMapping[task] || "All",
        ...CF_activeUserdetails()
      };

      console.log("Filter Payload:", payload);

      const response = await postData("AuditTrail/UploadlogsFilter", payload);

      console.log("API Response:", response);

      if (Array.isArray(response)) {
        const mappedData = response.map((item, index) => ({
          id: index + 1,
          clientName: item.ClientName || "",
          fileName: item.FileName || "",
          fileType: item.FileType?.trim() || "",
          size: item.FileSize || 0,
          fileMode: item.FileMode?.trim() || "",
          uploadOn: item.UpLoadTime || "",
          utcUploadTime: item.UTCUpLoadTime || "",
          userName: item.LoginUser || "",
          versionNo: item.FileVersionNo || 0,
          checksum: item.CheckSum || ""
        }));

        setUserData(mappedData);
        setFilters({ data: mappedData });
      }
    } catch (err) {
      console.error("Upload Logs Filter Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log("Refresh Clicked");
    handleFilter();
  };

  const buildExportRequest = () => {
    const userDetails = CF_activeUserdetails();

    return {
      AllRows: userData.map((row, index) => ({
        ClientName: row.clientName || "",
        FileName: row.fileName || "",
        FileType: row.fileType || "",
        FileSize: row.size || 0,
        FileMode: row.fileMode || "",
        UpLoadTime: row.uploadOn || "",
        UTCUpLoadTime: row.utcUploadTime || "",
        LoginUser: row.userName || "",
        FileVersionNo: row.versionNo || 0,
        CheckSum: row.checksum || "",
        visibleindex: index,
        boundindex: index,
        uid: index,
        uniqueid: `${Date.now()}-${index}`
      })),
      sFileName: "UpLoadLog",
      sBrowserURL: window.location.origin,
      AllowKeys: [
        "ClientName", "FileName", "FileType", "FileSize",
        "FileMode", "UpLoadTime"
      ],
      HeaderDetails: [
        "Client Name", "Filename", "File Type", "Size",
        "File Mode", "Upload On"
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
        // setSelectedClient(prev => prev ? prev : clientNames[0]);
        if (!selectedClient) {
          updateFilter(COMPONENT_NAME, 'selectedClient', clientNames[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching client list:', error);
    }
  };

  const fetchTaskList = async () => {
    try {
      const payload = {
        bStatus: false,
        ...CF_activeUserdetails()
      };

      const result = await postData('AuditTrail/AuditTrailTaskID', payload);
      console.log("Task List Response:", result);

      if (Array.isArray(result) && result.length > 0) {
        // Use L13ScheduleID for display (which contains the task name)
        const taskLabels = result.map(item => item.L13ScheduleID || item.L52TaskID);

        // Map L13ScheduleID (display name) to L52TaskID (actual ID)
        const mapping = result.reduce((acc, item) => {
          const displayName = item.L13ScheduleID || item.L52TaskID;
          acc[displayName] = item.L52TaskID;
          return acc;
        }, {});

        setTaskList(taskLabels);
        setTaskMapping(mapping);
        // setTask(prev => prev ? prev : taskLabels[0]);
        if (!task) {
          updateFilter(COMPONENT_NAME, 'task', taskLabels[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching task list:', error);
    }
  };



  return (
    <div className="flex flex-col w-full font-roboto rounded-md font-[roboto]">
      <div className="bg-[#f0f2f5] px-4 pt-4 pb-2 relative rounded-t-md z-20">
        {isOpen ? (
          <div className="flex flex-wrap items-end gap-3.5 mb-2">

            <div className="w-60 mr-2">
              <AnimatedDropdown
                label={t("label.clientName")}
                value={selectedClient}
                options={clientList}
                // onChange={(val) => {
                //   setSelectedClient(val?.target?.value ?? val);
                // }}
                onChange={(val) => {
                  updateFilter(COMPONENT_NAME, 'selectedClient', val?.target?.value ?? val);
                }}
                allowFreeInput={true}
              />
            </div>


            <div className="w-60 mr-6">
              <AnimatedDropdown
                label={t("label.task")}
                value={task}
                options={taskList}
                // onChange={(val) => {
                //   setTask(val?.target?.value ?? val);
                // }}
                onChange={(val) => {
                  updateFilter(COMPONENT_NAME, 'task', val?.target?.value ?? val);
                }}
                allowFreeInput={true}
              />

            </div>

            <div className="w-60 mr-2">
              <AnimatedInput
                label={t("label.fileName")}
                name="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              // onChange={(e) => updateFilter(COMPONENT_NAME, 'fileName', e.target.value)}
              />

            </div>


            <div className="w-60 mr-2">
              <AnimatedDropdown
                label={t("label.recordsDuration")}
                value={recordsDuration}
                options={["Current Date", "Last 7 Days", "Last 30 Days", "Last 1 Year", "Custom Date"]}
                // onChange={handleDurationChange}
                onChange={(value) => {
                  const actualValue = value?.target?.value || value?.value || value;
                  updateFilter(COMPONENT_NAME, 'recordsDuration', actualValue);
                }}
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
                    // onChange={setFromDate}
                    onChange={(val) => updateFilter(COMPONENT_NAME, 'fromDate', val)}
                    max={today}
                  />
                </div>
                <div className="w-52 pb-4">
                  <DatePicker
                    label="To"
                    value={toDate}
                    // onChange={setToDate}
                    onChange={(val) => updateFilter(COMPONENT_NAME, 'toDate', val)}
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
            refreshKey={refreshKey}
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

export default UploadLogs

