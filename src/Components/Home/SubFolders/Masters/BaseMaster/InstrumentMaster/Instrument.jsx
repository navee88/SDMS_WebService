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

import { Loader2 } from "lucide-react";


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
    setLoadingText("Loading Instrument Data...");

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
        status: item.sInstrumentStatus || "Inactive",

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

useEffect(() => {
  loadInstrumentGrid();
}, []);



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
      {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-lg font-medium">{loadingText}</span>
            </div>
          </div>
        )}


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
                  setRows((prev) =>
                    prev.map((row) =>
                      row.id === rowToRetire.id
                        ? { ...row, status: "Retired" }
                        : row
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
