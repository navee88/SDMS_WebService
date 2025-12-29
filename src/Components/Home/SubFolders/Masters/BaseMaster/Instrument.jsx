import React, { useMemo, useState } from "react";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import { MdPrint } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { TiExport } from "react-icons/ti";
import { MdBlock } from "react-icons/md";
import AddInstrumentModal from "./AddInstrumentModal";
import { useTranslation } from "react-i18next";


/* ---------------- MOCK DATA ---------------- */

const mockRows = [
  {
    id: "1",
    instrumentcode: "INST-001",
    instrumentAlias: "Weighing Scale",
    instrumentModel: "WS-500",
    instrumentMake: "Shimadzu",
    clientName: "Logilab",
    status: "Active",
    createdBy: "Admin",
    createdOn: "12-Dec-2024",
    modifiedBy: "Supervisor",
    modifiedOn: "20-Dec-2024",
  },
  {
    id: "2",
    instrumentcode: "INST-002",
    instrumentAlias: "PH Meter",
    instrumentModel: "PH-700",
    instrumentMake: "Mettler",
    clientName: "Agro Labs",
    status: "Inactive",
    createdBy: "Admin",
    createdOn: "10-Dec-2024",
    modifiedBy: "Manager",
    modifiedOn: "18-Dec-2024",
  },
  {
    id: "3",
    instrumentcode: "INST-003",
    instrumentAlias: "HPLC",
    instrumentModel: "LC-2030",
    instrumentMake: "Shimadzu",
    clientName: "BioTech",
    status: "Retired",
    createdBy: "Admin",
    createdOn: "05-Dec-2024",
    modifiedBy: "Admin",
    modifiedOn: "15-Dec-2024",
  },
];

/* ---------------- SMALL UI HELPER ---------------- */

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4 ">
    <div className="font-bold text-[12px] text-[#405F7D] font-roboto">{label}</div>
    <div className="font-bold text-[12px] text-[#353f49] font-roboto">{value || "-"}</div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, disabled }) => (
  <button
    onClick={!disabled ? onClick : undefined}
    disabled={disabled}
    className={`
      flex items-center gap-1 px-[12px] py-[6px]
      font-roboto text-[11px] font-bold rounded shadow-sm
      ${disabled
        ? "bg-gray-400/10 text-blue-300 cursor-not-allowed"
        : "bg-[#f0f2f5] text-[#2883fe]"
      }
    `}
  >
    <Icon className="w-4 h-4" />
    <span className="leading-none">{label}</span>
  </button>
);

/* ---------------- MAIN COMPONENT ---------------- */

export default function Instrument() {
  const { t } = useTranslation();

  const [rows, setRows] = useState(mockRows);
  const [selectedRowId, setSelectedRowId] = useState(rows[0]?.id ?? null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [rowToRetire, setRowToRetire] = useState(null);

  const selectedRow = useMemo(
    () => rows.find((r) => r.id === selectedRowId),
    [rows, selectedRowId]
  );
  const isRetired = selectedRow?.status === "Retired";

  /* ---------------- HANDLE SAVE ---------------- */

  const handleSave = (formData) => {
    if (modalMode === "edit") {
      setRows((prev) =>
        prev.map((row) =>
          row.id === selectedRowId
            ? {
                ...row,
                instrumentcode: formData.instrumentCode,
                instrumentAlias: formData.instrumentAlias,
                instrumentModel: formData.instrumentModel,
                instrumentMake: formData.instrumentMake,
                status: formData.active ? "Active" : "Inactive",
                modifiedBy: "Admin",
                modifiedOn: new Date().toLocaleDateString("en-GB"),
              }
            : row
        )
      );
      return;
    }

    // ADD MODE
    const newRow = {
      id: Date.now().toString(),
      instrumentcode: formData.instrumentCode,
      instrumentAlias: formData.instrumentAlias,
      instrumentModel: formData.instrumentModel,
      instrumentMake: formData.instrumentMake,
      clientName: "—",
      status: formData.active ? "Active" : "Inactive",
      createdBy: "Admin",
      createdOn: new Date().toLocaleDateString("en-GB"),
    };

    setRows((prev) => [...prev, newRow]);
  };

  const handleRetire = (row) => {
    setRowToRetire(row);
    setIsConfirmOpen(true);
  };

  const handleRetireConfirm = () => {
    if (!rowToRetire) return;

    setRows((prev) =>
      prev.map((row) =>
        row.id === rowToRetire.id ? { ...row, status: "Retired" } : row
      )
    );

    // If the retired row is currently selected, deselect it
    if (selectedRowId === rowToRetire.id) {
      setSelectedRowId(null);
    }

    setIsConfirmOpen(false);
    setRowToRetire(null);
  };

  /* ---------------- EXPORT FUNCTIONALITY ---------------- */

  const handleExport = () => {
    // Convert rows to CSV format
    const headers = [
      t("masters.instrumentcode"),
      t("masters.instrumentAlias"),
      t("masters.instrumentModel"),
      t("masters.instrumentMake"),
      t("masters.associatedClient"),
      t("masters.status"),
      t("masters.createdBy"),
      t("masters.createdOn"),
      t("masters.modifiedBy"),
      t("masters.modifiedOn")
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(row => [
        `"${row.instrumentcode}"`,
        `"${row.instrumentAlias}"`,
        `"${row.instrumentModel}"`,
        `"${row.instrumentMake}"`,
        `"${row.clientName}"`,
        `"${row.status}"`,
        `"${row.createdBy}"`,
        `"${row.createdOn}"`,
        `"${row.modifiedBy}"`,
        `"${row.modifiedOn}"`
      ].join(","))
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `instruments_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------------- PRINT FUNCTIONALITY ---------------- */

  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleDateString("en-GB");
    const printTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Instrument Management - Print</title>
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
            .status-active {
              color: #28a745;
              font-weight: bold;
            }
            .status-inactive {
              color: #dc3545;
              font-weight: bold;
            }
            .status-retired {
              color: #6c757d;
              font-weight: bold;
            }
            .print-footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 11px;
              color: #777;
              text-align: center;
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
          .status-active {
            color: #28a745;
            font-weight: bold;
          }
          .status-inactive {
            color: #dc3545;
            font-weight: bold;
          }
          .status-retired {
            color: #6c757d;
            font-weight: bold;
          }
          .print-footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #777;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="print-title">${t("masters.instrumentmaster")}</div>
          <div class="print-subtitle">Instrument Details Report</div>
        </div>
        
        <div class="print-meta">
          <div>
            <strong>Total Instruments:</strong> ${rows.length}<br>
            <strong>Active:</strong> ${rows.filter(r => r.status === "Active").length}<br>
            <strong>Inactive:</strong> ${rows.filter(r => r.status === "Inactive").length}
          </div>
          <div>
            <strong>Print Date:</strong> ${printDate}<br>
            <strong>Print Time:</strong> ${printTime}<br>
            <strong>Retired:</strong> ${rows.filter(r => r.status === "Retired").length}
          </div>
        </div>

        <table class="print-table">
          <thead>
            <tr>
              <th>${t("masters.instrumentcode")}</th>
              <th>${t("masters.instrumentaliasname")}</th>
              <th>${t("statuses.status")}</th>

            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>${row.instrumentcode}</td>
                <td>${row.instrumentAlias}</td>
                <td class="status-${row.status.toLowerCase()}">${row.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="print-footer">
          <p>Generated by Instrument Management System</p>
          <p>Page 1 of 1</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open("", "_blank", "width=900,height=600");
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      // Optional: Close after printing
      // printWindow.close();
    };
  };

  /* ---------------- GRID COLUMNS ---------------- */

  const columns = useMemo(
    () => [
      {
        key: "instrumentcode",
        label: t("masters.instrumentcode"),
        width: 160,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`cursor-pointer ${
              row.id === selectedRowId ? "font-semibold" : ""
            }`}
          >
            {row.instrumentcode}
          </div>
        ),
      },
      {
        key: "instrumentAlias",
        label: t("masters.instrumentaliasname"),
        width: 220,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`cursor-pointer ${
              row.id === selectedRowId ? "font-semibold" : ""
            }`}
          >
            {row.instrumentAlias}
          </div>
        ),
      },
      {
        key: "status",
        label: t("statuses.status"),
        width: 140,
        render: (row) => {
          const isSelected = row.id === selectedRowId;
          const isActive = row.status === "Active";

          return (
            <div
              onClick={() => setSelectedRowId(row.id)}
              className={`
                cursor-pointer
                ${isSelected ? "font-bold" : ""}
                ${isActive ? "text-green-600" : "text-red-600"}
              `}
            >
              {row.status}
            </div>
          );
        },
      },
    ],
    [selectedRowId]
  );

  /* ---------------- DETAIL PANEL ---------------- */

  const renderDetailPanel = (row) => (
    <div className="space-y-2 ">
      <DetailRow label={t("masters.instrumentModel")} value={row.instrumentModel} />
      <DetailRow label={t("masters.instrumentMake")} value={row.instrumentMake} />
      <DetailRow label={t("masters.client")} value={row.clientName} />
      <DetailRow label={t("masters.createdBy")} value={row.createdBy} />
      <DetailRow label={t("masters.createdOn")} value={row.createdOn} />
      <DetailRow label={t("masters.modifiedBy")} value={row.modifiedBy} />
      <DetailRow label={t("masters.modifiedOn")} value={row.modifiedOn} />
    </div>
  );
  /* ---------------- RENDER ---------------- */

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* ACTION BAR */}
      <div className="flex justify-end gap-2 p-3 flex-none">
        <ActionButton
          icon={IoMdAdd}
          label={t("button.add")}
          onClick={() => {
            setModalMode("add");
            setIsAddDialogOpen(true);
          }}
        />

        <ActionButton
          icon={FaEdit}
          label={t("button.edit")}
          disabled={!selectedRow || isRetired}
          onClick={() => {
            setModalMode("edit");
            setIsAddDialogOpen(true);
          }}
        />

        <ActionButton
          icon={MdBlock}
          label={t("button.retire")}
          disabled={isRetired}
          onClick={() => handleRetire(selectedRow)}
        />
        
        {/* Export Button */}
        <ActionButton 
          icon={TiExport} 
          label={t("button.export")} 
          onClick={handleExport}
        />
        
        {/* Print Button */}
        <ActionButton 
          icon={MdPrint} 
          label={t("button.print")} 
          onClick={handlePrint}
        />
      </div>

      {/* GRID CONTAINER */}
      <div className="flex-1 overflow-hidden">
        <GridLayout
          columns={columns}
          data={rows}
          height="100%"
          detailPanelWidth="46%"
          getRowId={(row) => row.id}
          enableSelection={false}
          onRowClick={(row) => setSelectedRowId(row.id)}
          rowClassName={(row) =>
            row.id === selectedRowId
              ? "bg-blue-50 border-l-4 border-blue-600"
              : ""
          }
          renderDetailPanel={() =>
            selectedRow ? renderDetailPanel(selectedRow) : null
          }
        />
      </div>

      {/* ADD INSTRUMENT DIALOG */}
      <AddInstrumentModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleSave}
        mode={modalMode}
        initialData={selectedRow}
      />

      {/* CONFIRMATION POPUP */}
      {isConfirmOpen && rowToRetire && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-md shadow-lg w-[550px]">
            {/* Header */}
            <div className="bg-[#d5d5d5] text-blue-900  text-[22px] px-5 py-4 rounded-t-md flex items-center gap-2 transition-all duration-500">
              {t("Auditpopup.confirmation")}
            </div>

            {/* Message */}
            <div className="p-10 text-center transition-all duration-700">
              <p className="text-gray-500 font roboto  text-[20px] leading-relaxed">
                Are you sure you want to retire ?
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t px-5 py-3">
              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setRowToRetire(null);
                }}
                className="font-roboto text-[12px]"
              >
                {t("button.cancel")}
              </button>
              <button
                onClick={() => {
                  setRows(prev =>
                    prev.map(row =>
                      row.id === rowToRetire.id ? { ...row, status: "Retired" } : row
                    )
                  );
                  setIsConfirmOpen(false);
                  setRowToRetire(null);
                }}
                className="px-[12px] py-[6px] bg-gray-400 text-blue-900 font-roboto text-[12px] rounded"
              >
                {t("button.ok")}
              </button>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}