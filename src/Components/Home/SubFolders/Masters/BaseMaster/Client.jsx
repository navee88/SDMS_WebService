import React, { useState, useMemo, useRef ,useEffect} from "react";

import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import { MdPrint } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { TiExport } from "react-icons/ti";
import * as XLSX from "xlsx"; // For Excel export

import useAxios from "../../../../../Services/servicecall";
import { CF_decrypt,CF_encrypt } from "../../../../Common/encryptiondecryption";

import AddClientModal from "./AddClientModal";
import AuditTrail from "../../../../Layout/Common/AuditTrail";
/* ---------------- MOCK INSTRUMENTS ---------------- */


/* ================== MAIN COMPONENT ================== */
const Client = () => {
    const [rows, setRows] = useState([]);
    const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const [unmappedInstruments, setUnmappedInstruments] = useState([]);
  const [unmappedInstrumentsId, setUnmappedInstrumentsId] = useState([]);

const [showAuditTrail, setShowAuditTrail] = useState(false);

const [pendingClientData, setPendingClientData] = useState(null);
const [gridKey, setGridKey] = useState(0);

  

  const { postData } = useAxios();
const getSessionValue = (key) => {
  const value = sessionStorage.getItem(key);

  // ✅ 1. key missing
  if (!value) return "";

  // ✅ 2. already plain text (NOT encrypted)
  if (!value.includes("=") && value.length < 40) {
    return value;
  }

  // ✅ 3. encrypted value
  try {
    return CF_decrypt(value);
  } catch (e) {
    console.warn(`Decrypt skipped for ${key}`);
    return value;
  }
};


const buildClientRequest = () => {
  return {
    sActionType: "View",
    ActiveUserDetails: {
      sUserDomainName: getSessionValue("sDomainName"),
      sSessionID: getSessionValue("sSessionID"),
      sUserID: getSessionValue("sUserID"),
      sTimeZoneID: getSessionValue("sTimeZoneID") + "<~>true",
      sApplicationName: "SDMS",
      sdbtype: getSessionValue("sdbtype") ,
      sUsername: getSessionValue("sUsername"),
      sSiteCode: getSessionValue("sSiteCode"),
      sCategories: getSessionValue("sCategories"),
      sUserGroupID: getSessionValue("sUserGroupID"),
      sUserStatus:"" ,
      sTenantID: "" ,
    },
    ApplicationCode: "SDMS",
  };
};
const buildMappedInstrumentRequest = (clientId) => ({
  sClientID: clientId,   // ✅ FIXED
  ActiveUserDetails: buildClientRequest().ActiveUserDetails,
  ApplicationCode: "SDMS",
});

const loadMappedInstruments = async (clientId) => {
  try {
    const requestPayload = buildMappedInstrumentRequest(clientId);
    const response = await postData(
      "basemaster/getMappedInstrumentClient",
      requestPayload
    );


    // Return the mapped instrument string, or "-" if empty
    return response?.MappedInstrumentClient || "-";
  } catch (error) {
    console.error("Mapped Instrument API Error:", error);
    return "-";
  }
};

const loadClientGridData = async () => {
  try {
    const requestPayload = buildClientRequest();
    const response = await postData("basemaster/getClient", requestPayload);

    if (Array.isArray(response) && response.length > 0) {
      const mappedRows = await Promise.all(
        response.map(async (item, index) => {
          const mappedInstrumentText = await loadMappedInstruments(item.sClientID);

          return {
            id: item.sClientID || index.toString(),
            clientName: item.sClientName,
            clientAlias: item.sClientAliasName,
            status: item.sClientStatus ==="DeActive" ? "Deactive" : "Active",
            clientType: item.sClientTypeName,
            ipAddress: item.sIPAddress,
            createdBy: item.sCreatedBy,
            createdOn: item.dCreatedOn,
            modifiedBy: item.sModifiedBy,
            modifiedOn: item.dModifiedOn,
            mappedInstrument: mappedInstrumentText, // ✅ mapped correctly now
          };
        })
      );

      setRows(mappedRows);
      setSelectedRowId(mappedRows[0].id); // select first row
    } else {
      setRows([]);
      setSelectedRowId(null);
    }
  } catch (error) {
    console.error("Client API Error:", error);
  }
};

console.log("Client Rows:", rows); // Debugging log
useEffect(() => {
  const fetchUnmappedInstruments = async () => {
    try {
      const response = await postData(
        "basemaster/getClientUnmappingInstrumentMaster",
        buildClientRequest()
      );

      if (Array.isArray(response)) {
        setUnmappedInstruments(
  response.map(inst => ({
    sInstrumentID: inst.sInstrumentID.trim(),   // I3
    sInstrumentName: inst.sInstrumentName.trim() // IN002
  }))
);

        console.log("Unmapped Instruments:", unmappedInstruments); // Debug log       
      }
    } catch (err) {
      console.error("Error fetching unmapped instruments:", err);
    }
  };

  fetchUnmappedInstruments();
}, []);


const buildInstrumentUnMappingByClient = (selectedInstruments = []) => {
  return selectedInstruments.map(inst => ({
    sInstrumentID: inst.sInstrumentID,     // I3
    sInstrumentName: inst.sInstrumentName  // IN002
  }));
};


const buildInsertClientRequest = (clientData, auditData) => {
  const instruments =
    clientData.selectedInstruments?.length > 0
      ? buildInstrumentUnMappingByClient(clientData.selectedInstruments)
      : [];

  return {
    InstrumentUnMappingByClient: instruments, // ✅ CONDITIONAL
    Client: {
      sClientName: clientData.clientName,
      sClientAliasName: clientData.clientAlias,
      sClientTypeID: "CT1",
      iStatus: clientData.status === "Active" ? 1 : 0,
      nClientGateway: clientData.gatewayClient ? 1 : 0
    },
    ActiveUserDetails: buildClientRequest().ActiveUserDetails,
    ApplicationCode: "SDMS"
  };
};
const buildEditClientRequest = (clientData, auditData) => {
  console.log("Building Edit Client Request with data:", clientData, auditData); // Debug log
  return {
    InstrumentUnMappingByClient: buildInstrumentUnMappingByClient(
      clientData.selectedInstruments
    ),

    AuditTrailValues: {
      sUserPassword: auditData.password,
      sUserDomainName: auditData.domain,
      sComments: auditData.comments,
      sUserName: auditData.username,
      sReasonNo: auditData.reasonNo,
      sReasonName: auditData.reasonName
    },

    Client: {
      sClientID: clientData.clientId, // 🔥 REQUIRED
      sClientName: clientData.clientName,
      sClientAliasName: clientData.clientAlias,
      sClientTypeID: "CT1",
      iStatus: clientData.status === "Active" ? 1 : 0,
      nClientGateway: clientData.gatewayClient ? 1 : 0
    },

    ActiveUserDetails: buildClientRequest().ActiveUserDetails,
    ApplicationCode: "SDMS"
  };
};


const handleAuditSubmit = async (auditData) => {
  try {
    const isEdit = pendingClientData.mode === "EDIT";

    const requestPayload = isEdit
      ? buildEditClientRequest(pendingClientData, auditData)
      : buildInsertClientRequest(pendingClientData, auditData);

    const apiUrl = isEdit
      ? "basemaster/editClient"
      : "basemaster/insertClient";

    const response = await postData(apiUrl, requestPayload);

    if (response?.Rtn === "Success") {
      if (isEdit) {
        // 🔥 Update grid state immediately for edited row
        setRows(prevRows =>
          prevRows.map(row =>
            row.id === pendingClientData.clientId
              ? {
                  ...row,
                  clientName: pendingClientData.clientName,
                  clientAlias: pendingClientData.clientAlias,
                  status: pendingClientData.status,
                  clientType: pendingClientData.clientType,
                  mappedInstrument: pendingClientData.selectedInstruments
                    ? pendingClientData.selectedInstruments.map(i => i.sInstrumentName).join(", ")
                    : row.mappedInstrument
                }
              : row
          )
        );
      } else {
        // For new insert, reload grid
        await loadClientGridData();
      }
    }

    setShowAuditTrail(false);
    setPendingClientData(null);
    setEditingRow(null);
  } catch (err) {
    console.error("Client submit error:", err);
  }
};


const handleEdit = async (row) => {
  try {
    const response = await postData(
      "basemaster/editGetClient",
      {
        sClientID: row.id,
        ActiveUserDetails: buildClientRequest().ActiveUserDetails,
        ApplicationCode: "SDMS"
      }
    );

    if (response?.Rtn === "Success") {

      // 1️⃣ Normalize instruments
      const normalizedInstruments = response.InstrumentUnMappingByClient.map(inst => ({
        sInstrumentID: inst.sInstrumentID.trim(),
        sInstrumentName: inst.sInstrumentName.trim(),
        iStatus: inst.iStatus
      }));

      // 2️⃣ Preselect mapped instruments
      const initiallySelected = normalizedInstruments.filter(
        inst => inst.iStatus === 1
      );

      // 3️⃣ Set edit form data
      setEditingRow({
        id: row.id,
        clientName: response.Client.sClientName.trim(),
        clientAlias: response.Client.sClientAliasName.trim(),
        status: response.Client.iStatus === 1 ? "Active" : "Inactive",
        selectedInstruments: initiallySelected,
        allInstruments: normalizedInstruments
      });

      setShowModal(true);
    }
  } catch (err) {
    console.error("Edit load error:", err);
  }
};



useEffect(() => {
  loadClientGridData();

}, []);
useEffect(() => {
  if (rows.length > 0 && !selectedRowId) {
    setSelectedRowId(rows[0].id); // select the first row by default
  }
}, [rows]);






  
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
          className={row.id === selectedRowId ? "font-semibold cursor-pointer" : "cursor-pointer"}
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
          className={row.id === selectedRowId ? "font-semibold cursor-pointer" : "cursor-pointer"}
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
        ${isSelected ? "font-semibold" : ""}
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
  return (
    <div className=" h-full overflow-hidden flex flex-col">
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
        height="100%"
        detailPanelWidth="46%"
        getRowId={(row) => row.id}
        enableSelection={false}
        renderDetailPanel={renderDetailPanel}
         getRowClassName={(row) =>
    row.id === selectedRowId ? "bg-gray-100 font-semibold" : ""
  }
  onRowClick={(row) => setSelectedRowId(row.id)}

      />
    
      {/* MODAL */}
   {showModal && (
  <AddClientModal
    initialData={editingRow}
    allInstruments={editingRow?.allInstruments || unmappedInstruments}// 🔥 PASS HERE
    onClose={() => setShowModal(false)}
    onSubmit={(clientData) => {
      setPendingClientData({
        ...clientData,
        mode: editingRow ? "EDIT" : "ADD",
        clientId: editingRow?.id || null,
      });

      setShowModal(false);
      setShowAuditTrail(true);
    }}
  />
)}


{showAuditTrail && (
  <AuditTrail
    isOpen={showAuditTrail}
    actionLabel="Submit"
    defaultReason={pendingClientData?.mode === "EDIT" ? "Modified" : "Activated"}
    onClose={() => setShowAuditTrail(false)}
    onAuthorized={handleAuditSubmit}
  />
)}

    </div>
  );
};

/* ================== ADD / EDIT CLIENT MODAL ================== */


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