import React, { useMemo, useState , useEffect} from "react";
import GridLayout from "../../../../../Layout/Common/Home/Grid/GridLayout";
import { MdPrint } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { TiExport } from "react-icons/ti";
import { MdBlock } from "react-icons/md";
import AddInstrumentModal from "./AddInstrumentModal";
import { useTranslation } from "react-i18next";
import useAxios from "../../../../../../Services/servicecall";
import {CF_decrypt} from "../../../../../Common/encryptiondecryption";
import PrintTable from "../../../../../Layout/Common/PrintTable";
import AuditTrail from "../../../../../Layout/Common/AuditTrail";
import { handleExportCommon } from "../../../../../Layout/Common/exportService";

/* ---------------- SMALL UI HELPER ---------------- */

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4 ">
    <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
      {label}
    </div>
    <div className="font-bold text-[12px] text-[#353f49] font-roboto">
      {value || "-"}
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, disabled }) => (
  <button
    onClick={!disabled ? onClick : undefined}
    disabled={disabled}
    className={`
      flex items-center gap-1 px-[12px] py-[6px]
      font-roboto text-[11px] font-bold rounded shadow-sm
      ${
        disabled
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
  const { postData } = useAxios();
const [loading, setLoading] = useState(false);
const [loadingText, setLoadingText] = useState("");


  const [rows, setRows] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(rows[0]?.id ?? null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [rowToRetire, setRowToRetire] = useState(null);
  const [editInstrumentData, setEditInstrumentData] = useState(null);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
const [pendingRetireRow, setPendingRetireRow] = useState(null);



    const [errorDialog, setErrorDialog] = useState({
      open: false,
      message: "",
      type: "information",
    });

  const selectedRow = useMemo(
    () => rows.find((r) => r.id === selectedRowId),
    [rows, selectedRowId]
  );
  const isRetired = selectedRow?.status === "Retired";
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
      const buildInstrumentRequest= () => {
      return {
        sActionType: "View",
        ActiveUserDetails: {
          sUserDomainName: getSessionValue("sDomainName"),
          sSessionID: getSessionValue("sSessionID"),
          sUserID: getSessionValue("sUserID"),
          sTimeZoneID: getSessionValue("sTimeZoneID") + "<~>true",
          sApplicationName: "SDMS",
          sdbtype: getSessionValue("sdbtype"),
          sUsername: getSessionValue("sUsername"),
          sSiteCode: getSessionValue("sSiteCode"),
          sCategories: getSessionValue("sCategories"),
          sUserGroupID: getSessionValue("sUserGroupID"),
          sUserStatus: "",
          sTenantID: "",
        },
        ApplicationCode: "SDMS",
      };
    };
    const loadInstrumentGrid = async () => {
  try {
    setLoading(true);
    setLoadingText(t("masters.loadinginstrumentdata"));

    const response = await postData(
      "basemaster/getInstrument",
      buildInstrumentRequest()
    );

    console.log("Instrument API Response:", response);

    if (Array.isArray(response)) {
      const mappedRows = response.map((item, index) => ({
        // ✅ REQUIRED FOR GRID
        id: item.sInstrumentID || index.toString(),

        // ✅ GRID COLUMNS
        instrumentcode: item.sInstrumentName,
        instrumentAlias: item.sInstrumentAliasName,
        instrumentModel: item.sInstrumentModel || "-",
        instrumentMake: item.sInstrumentMake || "-",
        clientName: item.sAssociatedToClient || "-",

        // ✅ STATUS
        status:
  item.sInstrumentStatus === "DeActive"
    ? "Deactive"
    : item.sInstrumentStatus === "Retired"
    ? "Retired"
    : "Active",

        // ✅ AUDIT FIELDS
        createdBy: item.sCreatedBy || "-",
        createdOn: item.dCreatedOn || "-",
        modifiedBy: item.sModifiedBy || "-",
        modifiedOn: item.dModifiedOn || "-",
      }));

      setRows(mappedRows);

      // ✅ keep / auto select
      setSelectedRowId((prev) =>
        mappedRows.some((r) => r.id === prev)
          ? prev
          : mappedRows[0]?.id ?? null
      );
    } else {
      setRows([]);
      setSelectedRowId(null);
    }
  } catch (err) {
    console.error("Instrument API Error:", err);
  } finally {
    setLoading(false);
    setLoadingText("");
  }
};
const loadInstrumentForEdit = async (row) => {
  try {
    setLoading(true);
    setLoadingText("Loading instrument details...");
    console.log("Loading request row data ", row);

    const response = await postData(
      "basemaster/editGetInstrument",
      {
        sInstrumentID: row.id,
        sInstrumentName: row.instrumentcode,
        ActiveUserDetails: buildInstrumentRequest().ActiveUserDetails,
        ApplicationCode: "SDMS",
      }
    );

    if (response?.Instrument) {
      setEditInstrumentData(response); // 🔥 FULL API RESPONSE
      setModalMode("edit");
      setIsAddDialogOpen(true);
    }
  } catch (err) {
    console.error("Edit load failed", err);
  } finally {
    setLoading(false);
    setLoadingText("");
  }
};


useEffect(() => {
  loadInstrumentGrid();
}, []);
useEffect(() => {
  if (rows.length > 0 && !selectedRowId) {
    setSelectedRowId(rows[0].id);
  }
}, [rows]);



  /* ---------------- HANDLE SAVE ---------------- */

const handleSave = async () => {
  if (modalMode === "add") {
    await loadInstrumentGrid();
    setSelectedRowId(null); // ✅ AFTER reload
  } else {
    await loadInstrumentGrid();
  }
};

const buildRetireInstrumentRequest = (row, auditPayload) => ({
  sInstrumentName: row.instrumentcode,
  sInstrumentID: row.id,

  AuditTrailValues: auditPayload.AuditTrailValues,

  ActiveUserDetails: buildInstrumentRequest().ActiveUserDetails,

  ApplicationCode: "SDMS",
});
const handleRetireAuthorized = async (auditPayload) => {
  if (!pendingRetireRow) return;

  try {
    setLoading(true);
    setLoadingText("Retiring instrument...");

    const response = await postData(
      "basemaster/RetireInstrument",
      buildRetireInstrumentRequest(pendingRetireRow, auditPayload)
    );

    if (response?.Message !== "Success") {
      throw new Error("Retire failed");
    }

    // ✅ reload from API (SOURCE OF TRUTH)
    await loadInstrumentGrid();


  } catch (err) {
    console.error("Retire failed", err);
    setErrorDialog({
      open: true,
      message: "Failed to retire instrument",
      type: "error",
    });
  } finally {
    setLoading(false);
    setLoadingText("");
    setShowAuditTrail(false);
    setPendingRetireRow(null);
  }
};




  const handleRetire = (row) => {
    setRowToRetire(row);
    setIsConfirmOpen(true);
  };
const buildExportRequest = () => ({
  AllRows: rows.map((row, index) => ({
    visibleindex: index,
    sInstrumentName: row.instrumentcode,
    sInstrumentAliasName: row.instrumentAlias,
    sInstrumentStatus: row.status,
    sInstrumentModel: row.instrumentModel,
    sInstrumentMake: row.instrumentMake,
    sAssociatedToClient: row.clientName,
    sCreatedBy: row.createdBy,
    dCreatedOn: row.createdOn,
    sModifiedBy: row.modifiedBy,
    dModifiedOn: row.modifiedOn,
  })),

  sFileName: "InstrumentMaster",
  sBrowserURL: window.location.origin,

  AllowKeys: [
    "sInstrumentName",
    "sInstrumentAliasName",
    "sInstrumentStatus",
    "sInstrumentModel",
    "sInstrumentMake",
    "sAssociatedToClient",
    "sCreatedBy",
    "dCreatedOn",
    "sModifiedBy",
    "dModifiedOn",
  ],

  HeaderDetails: [
    t("scheduler.instrumentname"),
    t("masters.instrumentaliasname"),
    t("statuses.status"),
    t("masters.instrumentmodel"),
    t("masters.instrumentmake"),
    t("masters.associatedtoclient"),
    t("masters.createdBy"),
    t("masters.createdOn"),
    t("masters.modifiedBy"),
    t("masters.modifiedOn"),
  ],

  ActiveUserDetails: buildInstrumentRequest().ActiveUserDetails,
  ApplicationCode: "SDMS",
});

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
      t("masters.modifiedOn"),
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        [
          `"${row.instrumentcode}"`,
          `"${row.instrumentAlias}"`,
          `"${row.instrumentModel}"`,
          `"${row.instrumentMake}"`,
          `"${row.clientName}"`,
          `"${row.status}"`,
          `"${row.createdBy}"`,
          `"${row.createdOn}"`,
          `"${row.modifiedBy}"`,
          `"${row.modifiedOn}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `instruments_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------------- PRINT FUNCTIONALITY ---------------- */

    const [doPrint, setDoPrint] = React.useState(false);
  
  const handlePrint = () => {
    if (!rows || rows.length === 0) {
      setErrorDialog({
        open: true,
        message: "Select an existing record.",
        type: "information",
      });
      return;
    }
  
    setDoPrint(true);
  };

    const buildPrintRequest = () => ({
  sModuleName: "Instrument Master",
  ActiveUserDetails: buildInstrumentRequest().ActiveUserDetails,
  ApplicationCode: "SDMS",
});

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
              row.id === selectedRowId ? "font-bold" : ""
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
              row.id === selectedRowId ? "font-bold" : ""
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
        enableSearch: true,
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
      <DetailRow
        label={t("masters.instrumentModel")}
        value={row.instrumentModel}
      />
      <DetailRow
        label={t("masters.instrumentMake")}
        value={row.instrumentMake}
      />
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
          onClick={() => loadInstrumentForEdit(selectedRow)}

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
           onClick={() =>
    handleExportCommon({
      rows,
      buildRequest: buildExportRequest,
      postData,
      setLoading,
      setLoadingText,
      setErrorDialog,
      t,
    })
  }
        />

        {/* Print Button */}
        <ActionButton
          icon={MdPrint}
          label={t("button.print")}
          onClick={handlePrint}
        />
      </div>
      {loading && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="  rounded-sm flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A57A6]"></div>
           <p className="text-sm font-medium">{loadingText}</p>
          </div>
        </div>
)}


      {/* GRID CONTAINER */}
      <div className="flex-1 overflow-hidden">
        <GridLayout
        key={rows.map((r) => r.id).join(",")}  
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
        initialData={editInstrumentData}
      />
      {doPrint && (
  <PrintTable
    columns={columns}
    rows={rows}
    title="Instrument Master"
    subtitle="View Instrument Configuration Report"
    printRequest={buildPrintRequest()}
    onDone={() => setDoPrint(false)}
  />
)}
<AuditTrail
  isOpen={showAuditTrail}
  onClose={() => {
    setShowAuditTrail(false);
    setPendingRetireRow(null);
  }}
  onAuthorized={handleRetireAuthorized}
  actionLabel="Retire"
  defaultReason="Activated"
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
    setIsConfirmOpen(false);
    setShowAuditTrail(true);      // 🔥 open audit popup
    setPendingRetireRow(rowToRetire);
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
