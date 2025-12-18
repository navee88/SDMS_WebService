import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, FileText, SquarePen } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useLanguage } from '../../../../../Context/LanguageContext';
import { useTranslation } from "react-i18next";
import { useCallback } from 'react'; // Add useCallback to existing imports
import Errordialog from "../../../../Layout/Common/Errordialog";


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
      label: 'Client Name',
      width: 180,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.clientName}</span>
    },
    {
      key: 'instrument',
      label: 'Instrument',
      width: 250,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.instrument}</span>
    },
    {
      key: 'storageName',
      label: 'Storage Name',
      width: 120,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.storageName}</span>
    }
  ], []);


  const renderUserDetail = (user) => (
    <div className="space-y-3 text-[12px]">

      <div className="grid grid-cols-3 gap-4">
        <div className="font-semibold text-700 text-[#405F7D]">{t("label.taskStatus")}</div>
        <div className="col-span-2 font-semibold text-[#353F49]">{user.taskStatus}Active</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="font-semibold text-700 text-[#405F7D]">{t("label.scheduleId")}</div>
        <div className="col-span-2 font-semibold text-[#353F49]">{user.scheduleId}TS1</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="font-semibold text-700 text-[#405F7D]">{t("label.taskId")}</div>
        <div className="col-span-2 font-semibold text-[#353F49]">{user.taskId}T1</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="font-semibold text-700 text-[#405F7D]">{t("label.sourcePath")}</div>
        <div className="col-span-2 font-semibold text-[#353F49]">{user.sourcePath}D:\SDMSFTP\Scheduler</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="font-semibold text-700 text-[#405F7D]">{t("label.queue")}</div>
        <div className="col-span-2 font-semibold text-[#353F49]">{user.queue}0</div>
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

