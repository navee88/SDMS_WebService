// ServerFileDeleteScheduler.js - Updated with export and print functionality
import { useState, useMemo, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { LuChevronsDown, LuChevronsUp } from "react-icons/lu";
import { TiExport } from "react-icons/ti";
import { MdPrint } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import * as XLSX from "xlsx";

import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { useTranslation } from "react-i18next";

/* ------------------ MOCK DATA ------------------ */
const gridData = [
  {
    id: 1,
    fileName: "sample_report_001.pdf",
    clientName: "AGD54",
    sourcePath: "D:\\SDMS\\files\\sample_report_001.pdf",
    uploadOn: "2025-12-01",
    modifiedOn: "2025-12-05",
    deletedOn: "2025-12-18",
    fileVersion: "v1.0",
    authorized: false,
  },
  {
    id: 2,
    fileName: "analysis_data.xlsx",
    clientName: "AGD55",
    sourcePath: "D:\\SDMS\\files\\analysis_data.xlsx",
    uploadOn: "2025-11-20",
    modifiedOn: "2025-11-22",
    deletedOn: "2025-12-10",
    fileVersion: "v2.1",
    authorized: true,
  },
];

/* ------------------ HELPERS ------------------ */
const formatDate = (date) => date.toISOString().split("T")[0];
const todayStr = formatDate(new Date());

export default function ServerFileDeleteScheduler() {
  const { t } = useTranslation();
  const printRef = useRef(null);

  const [isOpen, setIsOpen] = useState(true);
  const [client, setClient] = useState("AGD54");
  const [duration, setDuration] = useState("Current Date");
  const [selectedRow, setSelectedRow] = useState(gridData[0]);

  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [filteredData, setFilteredData] = useState(gridData);

  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  /* ------------------ GRID COLUMNS ------------------ */
  const columns = useMemo(() => [
    {
      key: "select",
      label: t("label.select"),
      width: 100,
      render: (row) => (
        <input
          type="checkbox"
          checked={row.selected || false}
          onChange={() => handleCheckboxToggle(row)}
        />
      ),
      
    },
    {
      key: "fileName",
      label: t("label.fileName"),
      width: 270,
      enableSearch: true,
      render: (row) => (
        <span className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRow?.id ? "font-bold" : ""
            }`}>
          {row.fileName}
        </span>
      ),
    },
    {
      key: "clientName",
      label: t("label.clientName"),
      width: 200,
      enableSearch: true,
      render: (row) => (
        <span 
        className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRow?.id ? "font-bold" : ""
            }`}>
          {row.clientName}
        </span>
      ),
    },
  ], [selectedRow, t]);

  const handleCheckboxToggle = (row) => {
    const updatedData = filteredData.map((r) =>
      r.id === row.id ? { ...r, selected: !r.selected } : r
    );
    setFilteredData(updatedData);
  };

  /* ------------------ PRINT FUNCTIONALITY ------------------ */
  const handlePrint = () => {
    if (!filteredData || filteredData.length === 0) {
      setDialogMessage(t("errormsg.noresultsfound"));
      setDialogType("information");
      setShowDialog(true);
      return;
    }

    // Create print content
    const printWindow = window.open('', '_blank');
    
    // Get current date and time
    const now = new Date();
    const printDate = now.toLocaleDateString();
    const printTime = now.toLocaleTimeString();

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server File Delete Scheduler - Print</title>
        <style>
          @media print {
            @page {
              margin: 20px;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .print-title {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .print-subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 10px;
            }
            .print-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 12px;
              color: #555;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .print-table th {
              background-color: #f4f6f8;
              color: #333;
              font-weight: bold;
              padding: 10px;
              text-align: left;
              border: 1px solid #ddd;
            }
            .print-table td {
              padding: 8px 10px;
              border: 1px solid #ddd;
              font-size: 12px;
            }
            .print-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .print-table tr:hover {
              background-color: #f5f5f5;
            }
            .print-footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 11px;
              color: #777;
              text-align: center;
            }
            .status-approved {
              color: #28a745;
              font-weight: bold;
            }
            .status-pending {
              color: #dc3545;
              font-weight: bold;
            }
            .selected-true::before {
              content: "✓";
              color: #28a745;
              font-weight: bold;
            }
            .selected-false::before {
              content: "✗";
              color: #dc3545;
            }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .print-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .print-subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
          }
          .print-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
            color: #555;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .print-table th {
            background-color: #f4f6f8;
            color: #333;
            font-weight: bold;
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
          }
          .print-table td {
            padding: 8px 10px;
            border: 1px solid #ddd;
            font-size: 12px;
          }
          .print-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .print-table tr:hover {
            background-color: #f5f5f5;
          }
          .print-footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #777;
            text-align: center;
          }
          .status-approved {
            color: #28a745;
            font-weight: bold;
          }
          .status-pending {
            color: #dc3545;
            font-weight: bold;
          }
          .selected-true::before {
            content: "✓";
            color: #28a745;
            font-weight: bold;
          }
          .selected-false::before {
            content: "✗";
            color: #dc3545;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="print-title">Server File Delete Scheduler</div>
          <div class="print-subtitle">Files Pending Deletion</div>
        </div>
        
        <div class="print-meta">
          <div>
            <strong>Client:</strong> ${client}<br>
            <strong>Duration:</strong> ${duration}<br>
            <strong>From:</strong> ${formatDisplayDate(from)}<br>
            <strong>To:</strong> ${formatDisplayDate(to)}
          </div>
          <div>
            <strong>Print Date:</strong> ${printDate}<br>
            <strong>Print Time:</strong> ${printTime}<br>
            <strong>Total Records:</strong> ${filteredData.length}
          </div>
        </div>

        <table class="print-table">
          <thead>
            <tr>
              <th>${t("label.select")}</th>
              <th>${t("label.fileName")}</th>
              <th>${t("label.clientName")}</th>
              <th>${t("label.sourcePath")}</th>
              <th>${t("label.uploadOn")}</th>
              <th>${t("label.modifiedOn")}</th>
              <th>${t("label.deletionmarkedon")}</th>
              <th>${t("label.versionNo")}</th>
              <th>${t("statuses.authorized")}</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(row => `
              <tr>
                <td class="selected-${row.selected}">${row.selected ? '✓' : '✗'}</td>
                <td>${row.fileName}</td>
                <td>${row.clientName}</td>
                <td>${row.sourcePath}</td>
                <td>${row.uploadOn}</td>
                <td>${row.modifiedOn}</td>
                <td>${row.deletedOn}</td>
                <td>${row.fileVersion}</td>
                <td class="${row.authorized ? 'status-approved' : 'status-pending'}">
                  ${row.authorized ? t("statuses.approved") : t("statuses.pending")}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="print-footer">
          <p>Generated by SDMS - Server File Management System</p>
          <p>Page 1 of 1</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  /* ------------------ EXPORT TO EXCEL ------------------ */
  const handleExport = () => {
    try {
      if (!filteredData || filteredData.length === 0) {
        setDialogMessage(t("errormsg.noresultsfound"));
        setDialogType("information");
        setShowDialog(true);
        return;
      }

      // Prepare data for export
      const exportData = filteredData.map((row) => ({
        [t("label.select")]: row.selected ? "✓" : "",
        [t("label.fileName")]: row.fileName,
        [t("label.clientName")]: row.clientName,
        [t("label.sourcePath")]: row.sourcePath,
        [t("label.uploadOn")]: row.uploadOn,
        [t("label.modifiedOn")]: row.modifiedOn,
        [t("label.deletionmarkedon")]: row.deletedOn,
        [t("label.versionNo")]: row.fileVersion,
        [t("statuses.authorized")]: row.authorized ? t("statuses.approved") : t("statuses.pending"),
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 10 }, // Select
        { wch: 30 }, // File Name
        { wch: 15 }, // Client Name
        { wch: 40 }, // Source Path
        { wch: 15 }, // Upload On
        { wch: 15 }, // Modified On
        { wch: 15 }, // Deleted On
        { wch: 15 }, // Version No
        { wch: 15 }, // Authorized
      ];
      worksheet["!cols"] = colWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Server Files");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `Server_File_Delete_Scheduler_${timestamp}.xlsx`;

      // Export to Excel
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error("Export error:", error);
      setDialogMessage(t("errormsg.exportFailed"));
      setDialogType("error");
      setShowDialog(true);
    }
  };

  /* ------------------ DATE LOGIC ------------------ */
  const getFromToDates = (duration) => {
    const today = new Date();
    let fromDate = new Date(today);

    switch (duration) {
      case "Last 7 Days":
        fromDate.setDate(today.getDate() - 7);
        break;
      case "Last 30 Days":
        fromDate.setDate(today.getDate() - 30);
        break;
        case "Last 1 Year":
        fromDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        fromDate = today;
    }

    return {
      from: formatDate(fromDate),
      to: formatDate(today),
    };
  };

  const isCustomDate = duration === "Custom Date";
  const autoDates = getFromToDates(duration);
  const from = isCustomDate ? customFrom : autoDates.from;
  const to = isCustomDate ? customTo : autoDates.to;

  useEffect(() => {
    if (customFrom && customTo && customFrom > customTo) {
      setCustomTo(customFrom);
    }
  }, [customFrom, customTo]);

  /* ------------------ FILTER ------------------ */
  const handleFilter = () => {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const result = gridData.filter((row) => {
      const rowDate = new Date(row.deletedOn);
      const matchClient = client ? row.clientName === client : true;
      const matchDate = rowDate >= fromDate && rowDate <= toDate;
      return matchClient && matchDate;
    });

    setFilteredData(result);
    setSelectedRow(result[0] || null);
  };

  const handleRefresh = () => {
    setDuration("Current Date");
    setCustomFrom("");
    setCustomTo("");
    setFilteredData(gridData);
    setSelectedRow(gridData[0]);
  };

  /* ------------------ SELECT ALL ------------------ */
  const handleSelectAll = () => {
    const allSelected = filteredData.every((r) => r.selected);
    const updatedData = filteredData.map((r) => ({
      ...r,
      selected: !allSelected,
    }));
    setFilteredData(updatedData);
  };

  /* ------------------ AUTHORIZE ------------------ */
  const handleAuthorize = () => {
  const selectedRows = filteredData.filter(row => row.selected);

  if (selectedRows.length === 0) {
    setDialogMessage(t("errormsg.noresultsfound"));
    setDialogType("information");
    setShowDialog(true);
    return;
  }

  // 🔥 Remove selected rows from grid
  const remainingData = filteredData.filter(row => !row.selected);

  setFilteredData(remainingData);
  setSelectedRow(remainingData[0] || null);

  setDialogMessage(
    `${selectedRows.length} ${t("statuses.recordsAuthorized")}`
  );
  setDialogType("success");
  setShowDialog(true);
};


  /* ------------------ DETAILS PANEL ------------------ */
  const DetailsPanel = ({ row }) => (
    <div className=" text-[12px] space-y-3">
      <Detail label={t("label.sourcePath")} value={row?.sourcePath} />
      <Detail label={t("label.uploadOn")} value={row?.uploadOn} />
      <Detail label={t("label.deletionmarkedon")} value={row?.deletedOn} />
      <Detail label={t("label.versionNo")} value={row?.fileVersion} />
    </div>
  );

  return (
    <div className=" h-full overflow-hidden flex flex-col gap-3">
      {/* ---------------- FILTER BAR ---------------- */}
      <div className="relative bg-[#f4f6f8] px-5 py-2 pb-2rounded">
        {isOpen ? (
          <div className="flex flex-wrap items-start gap-8">
            <div className="w-55">
              <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
                {t("label.clientName")}
              </label>
              <div className="mt-2">
              <AnimatedDropdown
                value={client}
                options={["AGD54", "AGD55"]}
                onChange={(e) => setClient(e.target.value)}
              />
              </div>
            </div>

            <div className="w-55">
              <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
                {t("label.recordsDuration")}
              </label>
              <div className="mt-2">
              <AnimatedDropdown
                
                value={duration}
                options={[
                  "Current Date",
                  "Last 7 Days",
                  "Last 30 Days",
                  "Last 1 Year",
                  "Custom Date",
                ]}
                onChange={(e) => {
                  const val = e.target.value;
                  setDuration(val);
                  if (val === "Custom Date") {
                    setCustomFrom(todayStr);
                    setCustomTo(todayStr);
                  } else {
                    setCustomFrom("");
                    setCustomTo("");
                  }
                }}
              />
              </div>
            </div>

            {/* ✅ CUSTOM DATE INPUTS RESTORED */}
            {isCustomDate && (
              <>
                <CalendarInput
                  label={t("label.from")}
                  value={customFrom}
                  max={todayStr}
                  onChange={setCustomFrom}
                />
                <CalendarInput
                  label={t("label.to")}
                  value={customTo}
                  min={customFrom}
                  max={todayStr}
                  onChange={setCustomTo}
                />
              </>
            )}

            <div className="flex gap-2 pt-6">
              <PrimaryButton
                icon={FaFilter}
                label={t("button.filter")}
                onClick={handleFilter}
              />
              
              <PrimaryButton
                icon={HiRefresh}
                label={t("button.refresh")}
                onClick={handleRefresh}
              />
            
            </div>
          </div>
        ) : ( 
        <div className="grid grid-cols-6 gap-2 py-2"> 
        <SummaryItem label="Client Name" value={client} /> 
        <SummaryItem label={t("label.from")} value={formatDisplayDate(from)} />
        <SummaryItem label={t("label.to")} value={formatDisplayDate(to)} />

        </div> 
      )}

        <button
          className="absolute right-4 -bottom-4 bg-[#f0f4f8] px-6"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <LuChevronsDown className="text-blue-700" /> : <LuChevronsUp className="text-blue-700" />}
        </button>
      </div>

      {/* ---------------- ACTION BUTTONS ---------------- */}
      <div className="flex justify-end gap-2 p-4 pb-0">
        <ActionButton icon={FaCheck} label={t("usermanagement.selectall")} onClick={handleSelectAll} />
        <ActionButton icon={FaRegCircleCheck } label={t("button.authorize")} onClick={handleAuthorize} />
        <ActionButton icon={MdPrint} label={t("button.print")} onClick={handlePrint} />
        <ActionButton icon={TiExport} label={t("button.export")} onClick={handleExport} />
      </div>

      <GridLayout
        columns={columns}
        data={filteredData}
        height="100%"
        detailPanelWidth="46%"
        getRowId={(row) => row.id}
        onRowClick={(row) => setSelectedRow(row)}
        renderDetailPanel={(row) => <DetailsPanel row={row} />}
      />

      {showDialog && (
        <Errordialog
          message={dialogMessage}
          type={dialogType}
          onClose={() => setShowDialog(false)}
        />
      )}
    </div>
  );
}

/* ------------------ SMALL COMPONENTS ------------------ */
const CalendarInput = ({ label, value, onChange, min, max }) => (
  <div className="w-55">
    <label className="block text-[#405f7d] text-[12px] font-semibold font-roboto">
      {label}
    </label>
    <div className="mt-2">
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-b-2 border-gray-300 bg-transparent pb-1 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
    />
    </div>
  </div>
);

  const ActionButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-[12px] py-[7px]  bg-[#f0f2f5] text-[#2883fe] font-roboto text-[11px] font-bold rounded shadow-sm"
    >
      <Icon className="w-4 h-4"  />
      <span className="leading-none">{label}</span>
    </button>
  );

const PrimaryButton =  ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-[12px] py-[7px] bg-[#ffffff] text-[#2883fe] font-roboto text-[11px] font-bold rounded shadow-sm"
    >
      <Icon className="w-4 h-4"  />
      <span className="leading-none">{label}</span>
    </button>
  );

const Detail = ({ label, value }) => (
  <div className="grid grid-cols-2">
    <span className="font-bold text-[12px] text-[#405F7D] font-roboto">{label}</span>
    <span className="font-bold text-[12px] text-[#353f49] font-roboto">{value || "-"}</span>
  </div>
);
const SummaryItem = ({ label, value }) => ( 
<div className="flex gap-2 items-center"> 
  <span className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">{label}:</span> 
  <span className="mb-1 block text-[#0e5bca] text-[12px] font-semibold font-roboto">{value || "---"}</span> 
  </div> 
  );
  const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "---";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
};