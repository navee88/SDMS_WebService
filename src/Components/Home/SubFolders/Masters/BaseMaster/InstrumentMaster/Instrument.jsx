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
import Errordialog from "../../../../../Layout/Common/Errordialog";
import FullPageLoader from "../../../../../Layout/Common/FullPageLoader";


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
   const loadInstrumentGrid = async (forceSelectFirst = false, defaultSelectedRowId = null) => {
  try {
    setLoading(true);
    setLoadingText(t("common.loading"));

    const response = await postData(
      "basemaster/getInstrument",
      buildInstrumentRequest()
    );

    if (Array.isArray(response)) {
      const mappedRows = response.map((item, index) => ({
        id: item.sInstrumentID || index.toString(),
        instrumentcode: item.sInstrumentName,
        instrumentAlias: item.sInstrumentAliasName,
        instrumentModel: item.sInstrumentModel || "-",
        instrumentMake: item.sInstrumentMake || "-",
        clientName: item.sAssociatedToClient || "-",
        status:
          item.sInstrumentStatus === "DeActive"
            ? "Deactive"
            : item.sInstrumentStatus === "Retired"
            ? "Retired"
            : "Active",
        createdBy: item.sCreatedBy || "-",
        createdOn: item.dCreatedOn || "-",
        modifiedBy: item.sModifiedBy || "-",
        modifiedOn: item.dModifiedOn || "-",
      }));

      setRows(mappedRows);

      if (forceSelectFirst) {
        setSelectedRowId(mappedRows[0]?.id ?? null);
      } else if (defaultSelectedRowId) {
        setSelectedRowId(
          mappedRows.some((r) => r.id === defaultSelectedRowId)
            ? defaultSelectedRowId
            : mappedRows[0]?.id ?? null
        );
      } else {
        setSelectedRowId((prev) =>
          mappedRows.some((r) => r.id === prev)
            ? prev
            : mappedRows[0]?.id ?? null
        );
      }
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
    setLoadingText(t("common.loading"));

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




  /* ---------------- HANDLE SAVE ---------------- */

const handleSave = async () => {
  await loadInstrumentGrid(true);
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
    setLoadingText(t("common.loading"));

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
    t("label.createdBy"),
    t("label.createdOn"),
    t("label.modifiedBy"),
    t("label.modifiedOn"),
  ],

  ActiveUserDetails: buildInstrumentRequest().ActiveUserDetails,
  ApplicationCode: "SDMS",
});


    const [doPrint, setDoPrint] = React.useState(false);
  
  const handlePrint = () => {
    if (!rows || rows.length === 0) {
      setErrorDialog({
        open: true,
        message: t("masters.selectrecord"),
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
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
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
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
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
                text-[12px] font-['Verdana'] truncate cursor-pointer
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
      <DetailRow label={t("masters.associatedtoclient")} value={row.clientName} />
      <DetailRow label={t("label.createdBy")} value={row.createdBy} />
      <DetailRow label={t("label.createdOn")} value={row.createdOn} />
      <DetailRow label={t("label.modifiedBy")} value={row.modifiedBy} />
      <DetailRow label={t("label.modifiedOn")} value={row.modifiedOn} />
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
      <FullPageLoader loading={loading} text={loadingText} />



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
        selectedRow={selectedRow}
        initialData={editInstrumentData}
          setLoading={setLoading}          // 👈 NEW
  setLoadingText={setLoadingText}  // 👈 NEW
   selectedRowId={selectedRowId}         // 🔥 pass current selection
  loadInstrumentGrid={loadInstrumentGrid}
  
      />
      {doPrint && (
  <PrintTable
    columns={columns}
    rows={rows}
    title={t("masters.instrumentmaster")}
    subtitle={t("masters.viewinstrumentconfigurationreport")}
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


{isConfirmOpen && rowToRetire && (
  <Errordialog
    message={t("masters.retireconfirmation")}
    type="confirmation"
    showCancel={true}
    onClose={() => {
      setIsConfirmOpen(false);
      setRowToRetire(null);
    }}
    onCancel={() => {
      setIsConfirmOpen(false);
      setRowToRetire(null);
    }}
    onConfirm={() => {
      setIsConfirmOpen(false);
      setShowAuditTrail(true);   // 🔥 open audit popup
      setPendingRetireRow(rowToRetire);
      setRowToRetire(null);
    }}
  />
)}

    </div>
  );
}
