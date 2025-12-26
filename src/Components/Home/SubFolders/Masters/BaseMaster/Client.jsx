import React, { useState, useMemo, useRef } from "react";

import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import { MdPrint } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { TiExport } from "react-icons/ti";
import * as XLSX from "xlsx"; // For Excel export
import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Draggable from "react-draggable";
/* ---------------- MOCK INSTRUMENTS ---------------- */
const INSTRUMENTS = [
  "IN001 (in001)",
  "IN002 (in002)",
  "IN003 (in003)",
  "IN004 (in004)",
  "IN005 (in005)",
  "IN006 (in006)",
  "IN007 (in007)",
  "IN008 (in008)",
  "IN009 (in009)",
  "IN010 (in010)",
  "IN011 (in011)",
  "IN012 (in012)",
  "IN013 (in013)",
  "IN014 (in014)",
  "IN015 (in015)",
];

/* ================== MAIN COMPONENT ================== */
const Client = () => {
  const [rows, setRows] = useState([
    {
      id: "1",
      clientName: "AGD54",
      clientAlias: "AGD54",
      status: "Active",
      clientType: "Administrative",
      ipAddress: "192.168.0.92",
      createdBy: "Administrator",
      createdOn: "2025-12-24 17:09:41",
      modifiedBy: "Administrator",
      modifiedOn: "2025-12-24 17:14:30",
      mappedInstrument: "IN001 (in001), IN002 (in002)",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(rows[0]?.id || null);
  const selectedRow = rows.find((r) => r.id === selectedRowId);
  
  /* ---------------- PRINT FUNCTIONALITY ---------------- */
  const handlePrint = () => {
    const printDate = new Date().toLocaleDateString();
    const printTime = new Date().toLocaleTimeString();

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Client Configuration - Print</title>
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
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="print-title">Client Configuration</div>
          <div class="print-subtitle">View Client Configuration Report</div>
        </div>
        
        <div class="print-meta">
          <div>
            <strong>Report Date:</strong> ${printDate}<br>
            <strong>Report Time:</strong> ${printTime}<br>
          </div>
          <div>
            <strong>Total Records:</strong> ${rows.length}<br>
            <strong>Generated By:</strong> System Administrator
          </div>
        </div>

        <table class="print-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Client Alias</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>${row.clientName || '-'}</td>
                <td>${row.clientAlias || '-'}</td>
                <td class="status-${row.status.toLowerCase()}">${row.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="print-footer">
          <p>Generated by SDMS - Client Configuration Module</p>
          <p>Page 1 of 1</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  /* ---------------- EXPORT TO EXCEL FUNCTIONALITY ---------------- */
  const handleExportExcel = () => {
    // Prepare data for Excel
    const excelData = rows.map(row => ({
      "Client Name": row.clientName,
      "Client Alias": row.clientAlias,
      "Status": row.status,
      "Client Type": row.clientType,
      "IP Address": row.ipAddress,
      "Created By": row.createdBy,
      "Created On": row.createdOn,
      "Modified By": row.modifiedBy,
      "Modified On": row.modifiedOn,
      "Mapped Instrument": row.mappedInstrument
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");

    // Set column widths
    const wscols = [
         { wch: 15 }, // Client Alias
      { wch: 10 }, // Status
      { wch: 15 }, // Client Type
      { wch: 15 }, // IP Address
      { wch: 15 }, // Created By
      { wch: 20 }, // Created On
      { wch: 15 }, // Modified By
      { wch: 20 }, // Modified On
      { wch: 30 }, // Mapped Instrument
    ];
    ws['!cols'] = wscols;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    const filename = `Client_Configuration_${timestamp}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, filename);
  };

  /* ---------------- GRID COLUMNS ---------------- */
  const columns = useMemo(
  () => [
    {
      key: "clientName",
      label: "Client Name",
      width: 160,
      enableSearch: true,
      render: (row) => (
        <div
          onClick={() => setSelectedRowId(row.id)}
          className={row.id === selectedRowId ? "font-bold cursor-pointer" : "cursor-pointer"}
        >
          {row.clientName}
        </div>
      ),
    },
    {
      key: "clientAlias",
      label: "Client Alias Name",
      width: 220,
      enableSearch: true,
      render: (row) => (
        <div
          onClick={() => setSelectedRowId(row.id)}
          className={row.id === selectedRowId ? "font-bold cursor-pointer" : "cursor-pointer"}
        >
          {row.clientAlias}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 160,
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
}

    },
  ],
  [selectedRowId]
);

  const renderDetailPanel = (row) => (
    <div className="space-y-2 ">
      <DetailRow label="Client Type" value={row.clientType} />
      <DetailRow label="IP Address" value={row.ipAddress} />
      <DetailRow label="Created By" value={row.createdBy} />
      <DetailRow label="Created On" value={row.createdOn} />
      <DetailRow label="Modified By" value={row.modifiedBy} />
      <DetailRow label="Modified On" value={row.modifiedOn} />
      <DetailRow label="Mapped Instrument" value={row.mappedInstrument} />
    </div>
  );

  /* ---------------- SELECT ROW FOR EDIT ---------------- */
  const handleEdit = (row) => {
    setEditingRow(row);
    setShowModal(true);
    setSelectedRowId(row.id);
  };

  return (
    <div className=" flex flex-col">
      {/* ACTION BAR */}
      <div className="flex justify-end gap-2 p-3 ">
        <ActionButton
          icon={IoMdAdd}
          label="Add"
          onClick={() => {
            setEditingRow(null);
            setShowModal(true);
          }}
        />
        <ActionButton
          icon={FaEdit}
          label="Edit"
          onClick={() => {
            const rowToEdit = rows.find((r) => r.id === selectedRowId);
            if (rowToEdit) handleEdit(rowToEdit);
            else alert("No row selected!");
          }}
        />
        <ActionButton 
          icon={TiExport} 
          label="Export" 
          onClick={handleExportExcel}
        />
        <ActionButton 
          icon={MdPrint} 
          label="Print" 
          onClick={handlePrint}
        />
      </div>

      <GridLayout
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        enableSelection={false}
        renderDetailPanel={(row) =>
          row.id === selectedRowId ? renderDetailPanel(selectedRow) : renderDetailPanel(row)
        }
      />
    
      {/* MODAL */}
      {showModal && (
        <AddClientModal
          initialData={editingRow}
          onClose={() => setShowModal(false)}
          onSubmit={(newRow) => {
            if (editingRow) {
              setRows((prev) =>
                prev.map((r) => (r.id === editingRow.id ? { ...r, ...newRow } : r))
              );
            } else {
              setRows((prev) => [...prev, newRow]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

/* ================== ADD / EDIT CLIENT MODAL ================== */
const AddClientModal = ({ initialData, onClose, onSubmit }) => {
  const nodeRef = useRef(null);
  const [form, setForm] = useState({
    clientName: initialData?.clientName || "",
    clientAlias: initialData?.clientAlias || "",
    clientType: initialData?.clientType || "Administrative",
    active: initialData?.status === "Active" || false,
    gatewayClient: false,
  });

  const [instrumentSearch, setInstrumentSearch] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState(() => {
    if (initialData?.mappedInstrument) {
      return initialData.mappedInstrument.split(", ").filter(Boolean);
    }
    return [];
  });

  // Check if we're in Add mode (no initialData)
  const isAddMode = !initialData;
  
  // In Add mode, return empty array for filtered instruments
  const filteredInstruments = useMemo(() => {
    if (isAddMode) {
      return []; // Return empty array for Add mode
    }
    return INSTRUMENTS.filter((i) =>
      i.toLowerCase().includes(instrumentSearch.toLowerCase())
    );
  }, [instrumentSearch, isAddMode]);

  const handleSubmit = () => {
    onSubmit({
      id: initialData?.id || Date.now().toString(),
      clientName: form.clientName,
      clientAlias: form.clientAlias,
      status: form.active ? "Active" : "Inactive",
      clientType: form.clientType,
      mappedInstrument: selectedInstruments.join(", "),
      createdBy: "Administrator",
      createdOn: initialData?.createdOn || new Date().toISOString(),
      modifiedBy: "Administrator",
      modifiedOn: new Date().toISOString(),
    });
  };

  return (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
 <Draggable
  nodeRef={nodeRef}
  handle=".modal-header"
  bounds="parent"
>
  <div
    ref={nodeRef}
    className="bg-white w-[600px] rounded overflow-hidden shadow-lg"
  >


        {/* HEADER */}
        <div className="modal-header cursor-move flex justify-between items-center px-4 py-2 pb-[5px] bg-slate-100 border-b">

          <label
  className="text-[#0e5bca] text-[18px]"
  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
>
  {initialData ? "Edit Client" : "Add Client"}
</label>

          <button onClick={onClose} className="text-gray-300 text-[20px] font-bold ">
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-4 py-4 space-y-6">
          {/* CLIENT NAME / ALIAS / TYPE */}
          <div className="w-[300px] space-y-4">
            <div >
  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
    Client Name <span className="text-red-500">*</span>
  </label>
<AnimatedDropdown 
name="clientName" value={form.clientName} 
allowFreeInput 
borderColor="border-gray-300" 
onChange={(e) => setForm({ ...form, clientName: e.target.value })} 
/>
</div>


            <div>
  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
    Client Alias Name <span className="text-red-500">*</span>
  </label>
 <AnimatedDropdown  name="clientAlias" 
 value={form.clientAlias} 
 allowFreeInput 
 borderColor="border-gray-300" 
 onChange={(e) => setForm({ ...form, clientAlias: e.target.value })}
  />
</div>


            <AnimatedDropdown
              label={
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  Client Type <span className="text-red-500">*</span>
                </label>
              }
              name="clientType"
              value={form.clientType}
              options={["Administrative", "Trading"]}
              borderColor="border-gray-300"
              onChange={(e) => setForm({ ...form, clientType: e.target.value })}
              className="py-0"
            />
          </div>

          {/* CHECKBOXES */}
          <div className="flex gap-12 ">
            <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
              Active
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              
            </label>

            <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
              Gateway Client
              <input
                type="checkbox"
                checked={form.gatewayClient}
                onChange={(e) =>
                  setForm({ ...form, gatewayClient: e.target.checked })
                }
                
              />
              
            </label>
          </div>

          {/* INSTRUMENTS */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
                Instrument
              </label>
              <button
                type="button"
                className="bg-blue-500 text-white px-[12px]  py-[6px] rounded text-[11px] font-bold font-roboto"
              >
                Add
              </button>
            </div>

            <div className="border rounded h-[180px] overflow-hidden">
              <div className="sticky top-0 bg-white px-2 py-1 border-b z-10">
                <input
                  placeholder="Looking for"
                  value={instrumentSearch}
                  onChange={(e) => setInstrumentSearch(e.target.value)}
                  className="w-full border px-2 rounded outline-none text-sm"
                />
              </div>
              <div className="overflow-auto" style={{ maxHeight: '140px' }}>
                <div className="px-2 font-verdana text-[12px] shadow-sm shadow-blue-500/40">
                  {/* SHOW DIFFERENT MESSAGE BASED ON MODE */}
                  {isAddMode ? (
                    <div className="text-gray-400 text-xs  text-center py-8">
                      Instruments can be mapped after creating the client
                    </div>
                  ) : (
                    <>
                      {filteredInstruments.map((inst) => (
                        <label key={inst} className="flex gap-2 text-sm hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedInstruments.includes(inst)}
                            onChange={() =>
                              setSelectedInstruments((prev) =>
                                prev.includes(inst)
                                  ? prev.filter((i) => i !== inst)
                                  : [...prev, inst]
                              )
                            }
                          />
                          {inst}
                        </label>
                      ))}
                      {filteredInstruments.length === 0 && instrumentSearch && (
                        <div className="text-gray-400 text-xs text-center py-4">
                          No instruments found
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button
            onClick={handleSubmit}
            className="bg-[#2883fe] flex text-[#ffffff] px-[12px] py-[6px] rounded text-[11px] font-bold font-roboto shadow-sm items-center gap-1"
          >
            <FiCheckSquare className="w-4 h-4" /> <span className="leading-none">Submit</span> 
          </button>
          <button
            onClick={onClose}
            className="border px-[12px] py-[6px] rounded text-[11px] text-[#8092a4] font-roboto font-bold"
          >
            <span className="leading-none">Close</span>
          </button>
        </div>
      </div>
      </Draggable>
    </div>
  );
};

/* ================== HELPERS ================== */
  const DetailRow = ({ label, value }) => (
    <div className="grid grid-cols-2 gap-4 ">
      <div className="font-bold text-[12px] text-[#405F7D] font-roboto">{label}</div>
      <div className="font-bold text-[12px] text-[#353f49] font-roboto">{value || "-"}</div>
    </div>
  );

const ActionButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-[12px] py-[6px]  bg-[#f0f2f5] text-[#2883fe] font-roboto text-[11px] font-bold rounded shadow-sm"
    >
      <Icon className="w-4 h-4"  />
      <span className="leading-none">{label}</span>
    </button>
  );

export default Client;