import React, { useState, useEffect, useMemo } from "react";
import { FaFileAlt, FaCheck } from "react-icons/fa";
import { MdOutlineThumbDown, MdPrint } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TiExport } from "react-icons/ti";
import { BsCheck2Square } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx"; // Add this import

import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import Errordialog from "../../../../Layout/Common/Errordialog";
import AuditTrail from "../../../../Layout/Common/AuditTrail";
import { useDownloadScheduler } from "../../../../../Context/DownloadSchedulerContext";




export default function ViewDownloadConfiguration() {
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ---------- AUDIT POPUP ---------- */
  const [showAudit, setShowAudit] = useState(false);
  const [auditAction, setAuditAction] = useState("");
  const {
  setAutoConfigData,
  setActiveTabIndex
} = useDownloadScheduler();

  /* ---------- BUTTON ---------- */
  const PrimaryButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-2 bg-gray-500/10 text-blue-600 text-[11px] font-bold rounded shadow-sm"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  /* ---------- MOCK DATA ---------- */
  useEffect(() => {
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          instrument: "IN001 (IN001)",
          taskId: "T2",
          sourcePath: "D:\\SDMS\\scheduler\\IN001",
          uncStatus: false,
          downloadClientName: "AGD54",
          downloadPath: "D:\\SDMS\\download_schedule",
          taskStatus: "active",
          taskFilter: "*.*",
          taskCompleted: "completed",
          uncUsername: "",
          fileSettings: "Original",

        },
        {
          id: 2,
          instrument: "IN002 (IN002)",
          taskId: "T3",
          sourcePath: "D:\\SDMS\\scheduler\\IN002",
          uncStatus: true,
          downloadClientName: "AGD55",
          downloadPath: "D:\\SDMS\\download_schedule2",
          taskStatus: "inactive",
          taskFilter: "*.csv",
          taskCompleted: "pending",
          uncUsername: "admin",
          fileSettings: "Original",

        },
      ];

      setData(mockData);
      setSelectedRow(mockData[0]); // select first row initially
      setLoading(false);
    }, 300);
  }, []);

  /* ---------- EXPORT TO EXCEL FUNCTION ---------- */
  const handleExport = () => {
    try {
      if (!data || data.length === 0) {
        setErrorMessage(t("errormsg.noresultsfound"));
        setShowErrorDialog(true);
        return;
      }

      // Prepare data for export - include all columns from grid and detail panel
      const exportData = data.map((row) => ({
        [t("label.instrument")]: row.instrument,
        [t("label.taskId")]: row.taskId,
        [t("label.sourcePath")]: row.sourcePath,
        [t("scheduler.uncStatus")]: row.uncStatus ? "✓" : "✗",
        [t("label.clientName")]: row.downloadClientName,
        [t("scheduler.destinationpath")]: row.downloadPath,
        [t("label.taskStatus")]: t(`statuses.${row.taskStatus}`),
        [t("label.filter")]: row.taskFilter,
        [t("label.comments")]: row.taskCompleted,
        [t("label.username")]: row.uncUsername || "-",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 20 }, // Instrument
        { wch: 10 }, // Task ID
        { wch: 30 }, // Source Path
        { wch: 10 }, // UNC Status
        { wch: 15 }, // Client Name
        { wch: 30 }, // Download Path
        { wch: 15 }, // Task Status
        { wch: 15 }, // Filter
        { wch: 20 }, // Comments
        { wch: 15 }, // Username
      ];
      worksheet["!cols"] = colWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Download Configuration");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `Download_Configuration_${timestamp}.xlsx`;

      // Export to Excel
      XLSX.writeFile(workbook, fileName);



    } catch (error) {
      console.error("Export error:", error);
      setErrorMessage(t("errormsg.exportFailed"));
      setShowErrorDialog(true);
    }
  };
console.log(selectedRow);
  /* ---------- PRINT FUNCTION ---------- */
  const handlePrint = () => {
    if (!data || data.length === 0) {
      setErrorMessage(t("errormsg.noresultsfound"));
      setShowErrorDialog(true);
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
        <title>Download Configuration - Print</title>
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
            .print-footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 11px;
              color: #777;
              text-align: center;
            }
            .status-active {
              color: #28a745;
              font-weight: bold;
            }
            .status-inactive {
              color: #dc3545;
              font-weight: bold;
            }
            .unc-true::before {
              content: "✓";
              color: #28a745;
              font-weight: bold;
            }
            .unc-false::before {
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
          .print-footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #777;
            text-align: center;
          }
          .status-active {
            color: #28a745;
            font-weight: bold;
          }
          .status-inactive {
            color: #dc3545;
            font-weight: bold;
          }
          .unc-true::before {
            content: "✓";
            color: #28a745;
            font-weight: bold;
          }
          .unc-false::before {
            content: "✗";
            color: #dc3545;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="print-title">Download Configuration</div>
          <div class="print-subtitle">View Download Configuration Report</div>
        </div>
        
        <div class="print-meta">
          <div>
            <strong>Report Date:</strong> ${printDate}<br>
            <strong>Report Time:</strong> ${printTime}<br>
          </div>
          <div>
            <strong>Total Records:</strong> ${data.length}<br>
            <strong>Generated By:</strong> System Administrator
          </div>
        </div>

        <table class="print-table">
          <thead>
            <tr>
              <th>${t("label.instrument")}</th>
              <th>${t("label.taskId")}</th>
              <th>${t("label.sourcePath")}</th>
              <th>${t("scheduler.uncStatus")}</th>
              <th>${t("label.clientName")}</th>
              <th>${t("scheduler.destinationpath")}</th>
              <th>${t("label.taskStatus")}</th>
              <th>${t("label.filter")}</th>
              <th>${t("label.comments")}</th>
              <th>${t("label.username")}</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.instrument}</td>
                <td>${row.taskId}</td>
                <td>${row.sourcePath}</td>
                <td class="unc-${row.uncStatus}">${row.uncStatus ? '✓' : '✗'}</td>
                <td>${row.downloadClientName}</td>
                <td>${row.downloadPath}</td>
                <td class="${row.taskStatus === 'active' ? 'status-active' : 'status-inactive'}">
                  ${t(`statuses.${row.taskStatus}`)}
                </td>
                <td>${row.taskFilter}</td>
                <td>${row.taskCompleted}</td>
                <td>${row.uncUsername || "-"}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="print-footer">
          <p>Generated by SDMS - Download Configuration Module</p>
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

  /* ---------- GRID COLUMNS ---------- */
  const columns = useMemo(
    () => [
      {
        key: "instrument",
        label: t("label.instrument"),
        width: 190,
        enableSearch: true,
        render: (row) => (
          <span className={row.id === selectedRow?.id ? "font-semibold" : ""}>
            {row.instrument}
          </span>
        ),
      },
      {
        key: "taskId",
        label: t("label.taskId"),
        width: 120,
        enableSearch: true,
        render: (row) => (
          <span className={row.id === selectedRow?.id ? "font-semibold" : ""}>
            {row.taskId}
          </span>
        ),
      },
      {
        key: "sourcePath",
        label: t("label.sourcePath"),
        width: 230,
        enableSearch: true,
        render: (row) => (
          <span className={row.id === selectedRow?.id ? "font-semibold" : ""}>
            {row.sourcePath}
          </span>
        ),
      },
      {
        key: "uncStatus",
        label: t("scheduler.uncStatus"),
        width: 160,
        render: (row) => <input type="checkbox" checked={row.uncStatus} readOnly />,
      },
    ],
    [selectedRow, t]
  );

  /* ---------- ACTION HANDLER ---------- */
  const handleAction = (action) => {
    if (!selectedRow) {
      setErrorMessage(t("errormsg.incompletedatafields"));
      setShowErrorDialog(true);
      return;
    }

    if (action === "ACTIVE" && selectedRow.taskStatus === "active") {
      setErrorMessage(t("statuses.activated"));
      setShowErrorDialog(true);
      return;
    }

    if (action === "INACTIVE" && selectedRow.taskStatus === "inactive") {
      setErrorMessage(t("statuses.deactivated"));
      setShowErrorDialog(true);
      return;
    }

    setErrorMessage(t("statuses.activated"));
    setShowErrorDialog(true);
  };

  /* ---------- DETAIL PANEL ---------- */
  const DetailRow = ({ label, value }) => (
    <div className="grid grid-cols-2 gap-4 text-[13px]">
      <div className="font-semibold text-700 text-[#405F7D]">{label}</div>
      <div className="font-semibold">{value || "-"}</div>
    </div>
  );

  const renderUserDetail = (row) => (
    <div className="space-y-3">
      <DetailRow label={t("label.clientName")} value={row.downloadClientName} />
      <DetailRow label={t("scheduler.destinationpath")} value={row.downloadPath} />
      <DetailRow
        label={t("label.taskStatus")}
        value={t(`statuses.${row.taskStatus}`)}
      />
      <DetailRow label={t("label.filter")} value={row.taskFilter} />
      <DetailRow label={t("label.comments")} value={row.taskCompleted} />
      <DetailRow label={t("label.username")} value={row.uncUsername} />
    </div>
  );

  /* ---------- HANDLER FOR AUDITTRAIL SUBMIT ---------- */
  const handleAuthorized = () => {
  // 1️⃣ send selected row
  setAutoConfigData({
    instrument: selectedRow.instrument,
    clientName: selectedRow.downloadClientName,
    downloadPath: selectedRow.downloadPath,
    filter: selectedRow.taskFilter,
    sourcepath: selectedRow.sourcePath,
  uncStatus: selectedRow.uncStatus,
  username: selectedRow.uncUsername,
  filesettings: selectedRow.fileSettings,
    });

  // 2️⃣ switch to Auto Download Configuration tab
  setActiveTabIndex(0);

  setShowAudit(false);
};


  return (
    <div className="bg-white p-4 space-y-4">
      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-2">
        <PrimaryButton icon={FaFileAlt} label={t("scheduler.view")} onClick={() => setShowAudit(true)} />
        <PrimaryButton icon={FaCheck} label={t("scheduler.activate")} onClick={() => handleAction("ACTIVE")} />
        <PrimaryButton icon={MdOutlineThumbDown} label={t("scheduler.deactivate")} onClick={() => handleAction("INACTIVE")} />
        <PrimaryButton icon={RiDeleteBin6Line} label={t("scheduler.retire")} onClick={() => handleAction("RETIRE")} />
        <PrimaryButton icon={TiExport} label={t("button.export")} onClick={handleExport} />
        <PrimaryButton icon={MdPrint} label={t("button.print")} onClick={handlePrint} />
      </div>

      {/* GRID */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          {t("login.loadingpasswordpolicy")}
        </div>
      ) : (
        <GridLayout
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          renderDetailPanel={renderUserDetail}
          onRowClick={(row) => setSelectedRow(row)}
          rowClassName={(row) =>
            row.id === selectedRow?.id
              ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
              : ""
          }
        />
      )}

      {showErrorDialog && (
        <Errordialog
          type="error"
          message={errorMessage}
          onClose={() => setShowErrorDialog(false)}
        />
      )}

      {/* AUDIT POPUP */}
      {showAudit && (
        <AuditTrail
          isOpen={showAudit}
          onClose={() => setShowAudit(false)}
          onAuthorized={handleAuthorized}
        />
      )}
    </div>
  );
}