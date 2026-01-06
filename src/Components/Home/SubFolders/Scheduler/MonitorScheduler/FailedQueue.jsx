import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, FileText, SquarePen } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useLanguage } from '../../../../../Context/LanguageContext';
import { useTranslation } from "react-i18next";
import { useCallback } from 'react'; // Add useCallback to existing imports
import Errordialog from "../../../../Layout/Common/Errordialog";

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
      instrument: "CU-Summary1 (CU-Summary1)",
      storageName: "sdms-ftp"
    },
    {
      id: 2,
      clientName: "DESKTOP-CU9J5T2",
      instrument: "CU-Summary1 (CU-Summary1)",
      storageName: "sdms-ftp"
    },
    {
      id: 3,
      clientName: "DESKTOP-CU9J5T2",
      instrument: "MU-Summary1 (MU-Summary1)",
      storageName: "sdms-ftp"
    },
    {
      id: 4,
      clientName: "DESKTOP-CU9J5T2",
      instrument: "AU-Summary1 (AU-Summary1)",
      storageName: "sdms-ftp"
    },
    {
      id: 5,
      clientName: "DESKTOP-CU9J5T2",
      instrument: "CU-Summary1 (CU-Summary1)",
      storageName: "sdms-ftp"
    },
    {
      id: 6,
      clientName: "DESKTOP-CU9J5T2",
      instrument: "CU-Summary1 (CU-Summary1)",
      storageName: "sdms-ftp"
    },
    {
      id: 7,
      clientName: "DESKTOP-CU9J5T2",
      instrument: "CU-Summary1 (CU-Summary1)",
      storageName: "sdms-ftp"
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
      width: 180,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.clientName}</span>
    },
    {
      key: 'instrument',
      label: t('label.instrument'),
      width: 250,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.instrument}</span>
    },
    {
      key: 'storageName',
      label: t('label.storageName'),
      width: 120,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.storageName}</span>
    }
  ], []);


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


  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500"></div>;
  }


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

function FailedQueue() {

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
      {/* Top Action Buttons (same place) */}
      <div className="flex justify-end gap-2 mt-4">
        <ActionButton
          icon={FileText}
          label={t('button.viewDetails')}
          onClick={() => showInfoDialog("No records found here!", "information")}
        />
      </div>

      {/* UsersPage takes full width & height */}
      <div className="flex-1 overflow-hidden">
        <UsersPage />
      </div>
    </div>
  )
}

export default FailedQueue

