import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, FileText, SquarePen } from 'lucide-react';
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayoutTest';
import { useLanguage } from '../../../../../Context/LanguageContext';
import { useTranslation } from "react-i18next";
import { useCallback } from 'react'; // Add useCallback to existing imports
import Errordialog from "../../../../Layout/Common/Errordialog";
import useAxios from '../../../../../Services/servicecall';
import { CF_sessionGet } from "../../../../Common/CF_session";
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';

const UsersPage = ({
  data,
  selectedRowId,
  onRowSelect,
  showViewDetails,
  viewDetailsData
}) => {

  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();




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
      key: 'instrument',
      label: t('label.instrument'),
      width: 250,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.instrument}
        </span>
      )
    },
    {
      key: 'storageName',
      label: t('label.storageName'),
      width: 120,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.storageName}
        </span>
      )
    }
  ], []);

  const ViewDetailsColumns = useMemo(() => [
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
      key: 'instrument',
      label: t('label.instrument'),
      width: 180,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.instrumentName}
        </span>
      )
    },
    {
      key: 'taskId',
      label: t('label.taskId'),
      width: 120,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.taskId}
        </span>
      )
    },
    {
      key: 'filename',
      label: t('label.fileName'),
      width: 200,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.fileName}
        </span>
      )
    },
    {
      key: 'fileType',
      label: t('label.fileType'),
      width: 120,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.fileType}
        </span>
      )
    },
    {
      key: 'captureDate',
      label: t('label.captureDate'),
      width: 200,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.captureDate}
        </span>
      )
    },
    {
      key: 'captureDateUTC',
      label: t('label.captureDateUTC'),
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.utcCaptureDate}
        </span>
      )
    },
    {
      key: 'errorDescription',
      label: t('label.errorDescription'),
      width: 250,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`text-[#373737] ${isSelected ? 'font-semibold' : ''}`}
          style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px' }}>
          {row.errorDescription}
        </span>
      )
    }
  ], [t]);


  const renderUserDetail = (user) => (
    <div className="space-y-3 text-[12px]">
      {[
        { label: "taskStatus", value: user.taskStatus || "Active" },
        { label: "scheduleId", value: user.scheduleId || "TS1" },
        { label: "taskId", value: user.taskId || "T1" },
        { label: "sourcePath", value: user.sourcePath || "D:\\SDMSFTP\\Scheduler" },
        { label: "queue", value: user.queue || "0" },
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
    <div className="flex-1 overflow-hidden flex flex-col">
      {showViewDetails ? (
        <>
          <div className="flex justify-end p-4">
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
          getRowId={(row) => row.id}
          externalSelectedId={selectedRowId}
          selectedRows={[selectedRowId]}
          onRowClick={(row) => onRowSelect(row)}
          renderDetailPanel={renderUserDetail}
        />
      )}
    </div>
  );
};

function FailedQueue() {
  const { postData } = useAxios();
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [viewDetailsData, setViewDetailsData] = useState([]);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [forceGridUpdate, setForceGridUpdate] = useState(0);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  // Add state for information dialog
  const [infoDialog, setInfoDialog] = useState({
    open: false,
    message: "",
    type: "information"
  });

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


  const handleViewDetails = async () => {
    if (!selectedRowData) {
      showInfoDialog("Please select a row !", "information");
      return;
    }

    try {
      const requestData = {
        sTaskID: selectedRowData.taskId,
        ActiveUserDetails: CF_activeUserdetails().ActiveUserDetails,
        ApplicationCode: "SDMS"
      };

      const response = await postData('Scheduler/FailedQueueViewDetailsGrid', requestData);

      if (!response || response.length === 0) {
        showInfoDialog("No records found here!", "information");
        return;
      }

      const mappedDetailsData = response.map((item) => ({
        id: item.L32TaskID,
        clientName: item.L06ClientName,
        instrumentName: item.L11InstrumentName,
        taskId: item.L32TaskID,
        fileName: item.L32FileName,
        fileType: item.L32FileType,
        captureDate: item.CaptureDate,
        utcCaptureDate: item.UTCCaptureDate,
        errorDescription: item.L32ErrorDescription
      }));

      setViewDetailsData(mappedDetailsData);
      setShowViewDetails(true);
    } catch (error) {
      console.error("Error fetching details:", error);
      showInfoDialog("Error fetching details", "error");
    }
  };


  const loadGrid = async () => {
    setLoading(true);
    try {
      const response = await postData(
        'Scheduler/FailedqueueSchedulerViewgrid',
        CF_activeUserdetails()
      );

      const mapped = response.map((item) => ({
        id: item.L13ScheduleID,
        clientName: item.L06ClientName,
        instrument: item.L11InstrumentName,
        storageName: item.L09FTPAliasName,
        taskStatus: item.Status,
        scheduleId: item.L13ScheduleID,
        taskId: item.L52TaskID,
        sourcePath: item.L52TaskSourcePath,
        queue: item.L32Queue
      }));

      setUserData(mapped);

      if (selectedRowData) {
        const sameRow = mapped.find(r => r.scheduleId === selectedRowData.scheduleId);
        if (sameRow) {
          setSelectedRowId(sameRow.id);
          setSelectedRowData(sameRow);
        }
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

  useEffect(() => {
    const handleCloseViewDetails = () => {
      setShowViewDetails(false);
      setTimeout(() => {
        setForceGridUpdate(prev => prev + 1);
      }, 50);
    };

    window.addEventListener('closeViewDetails', handleCloseViewDetails);
    return () => window.removeEventListener('closeViewDetails', handleCloseViewDetails);
  }, []);

  useEffect(() => {
    // Auto-select first row when data loads
    if (userData.length > 0 && !selectedRowData) {
      setSelectedRowId(userData[0].id);
      setSelectedRowData(userData[0]);
    }
  }, [userData]);

  return (
    <div className="px-4 font-roboto h-[calc(100vh-150px)] flex flex-col">
      {infoDialog.open && (
        <Errordialog
          message={infoDialog.message}
          type={infoDialog.type}
          onClose={closeInfoDialog}
        />
      )}

      {!showViewDetails && (
        <div className="flex justify-end gap-2 mt-4">
          <ActionButton
            icon={FileText}
            label={t('button.viewDetails')}
            onClick={handleViewDetails}
          />
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <UsersPage
          key={forceGridUpdate}
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
    </div>
  );
}

export default FailedQueue

