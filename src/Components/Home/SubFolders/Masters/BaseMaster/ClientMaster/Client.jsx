import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";

import GridLayout from "../../../../../Layout/Common/Home/Grid/GridLayout";
import { MdPrint } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { TiExport } from "react-icons/ti";
import { useTranslation } from "react-i18next";
import useAxios from "../../../../../../Services/servicecall";
import { CF_decrypt } from "../../../../../Common/encryptiondecryption";
import AddClientModal from "./AddClientModal";
import AuditTrail from "../../../../../Layout/Common/AuditTrail";
import PrintTable from "../../../../../Layout/Common/PrintTable";
import Errordialog from "../../../../../Layout/Common/Errordialog";
import { handleExportCommon } from "../../../../../Layout/Common/exportService";
import FullPageLoader from "../../../../../Layout/Common/FullPageLoader";

// adjust path if needed

/* ================== MAIN COMPONENT ================== */
const Client = () => {
  const mappedInstrumentCache = useRef({});
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: "",
    type: "information",
  });


  const [unmappedInstruments, setUnmappedInstruments] = useState([]);

  const [showAuditTrail, setShowAuditTrail] = useState(false);

  const [pendingClientData, setPendingClientData] = useState(null);

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
  const activeUserDetails = useMemo(
    () => ({
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
    }),
    []
  );

  const buildClientRequest = useCallback(
    () => ({
      sActionType: "View",
      ActiveUserDetails: activeUserDetails,
      ApplicationCode: "SDMS",
    }),
    [activeUserDetails]
  );

  const buildMappedInstrumentRequest = (clientId) => ({
    sClientID: clientId, // ✅ FIXED
    ActiveUserDetails: buildClientRequest().ActiveUserDetails,
    ApplicationCode: "SDMS",
  });

  const loadMappedInstruments = async (clientId) => {
  // ✅ Return cached value
  if (mappedInstrumentCache.current[clientId]) {
    return mappedInstrumentCache.current[clientId];
  }

  try {
    const response = await postData(
      "basemaster/getMappedInstrumentClient",
      buildMappedInstrumentRequest(clientId)
    );

    const result = response?.MappedInstrumentClient || "-";

    // ✅ Cache it
    mappedInstrumentCache.current[clientId] = result;

    return result;
  } catch (error) {
    console.error("Mapped Instrument API Error:", error);
    return "-";
  }
};


  const loadClientGridData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingText(t("common.loading"));

      const response = await postData(
        "basemaster/getClient",
        buildClientRequest()
      );

      if (!Array.isArray(response)) {
        setRows([]);
        return;
      }

      const mappedRows = await Promise.all(
        response.map(async (item, index) => ({
          id: item.sClientID || index.toString(),
          clientName: item.sClientName,
          clientAlias: item.sClientAliasName,
          status: item.sClientStatus === "DeActive" ? t("statuses.deactive") : t("statuses.active"),
          clientType: item.sClientTypeName,
          ipAddress: item.sIPAddress,
          createdBy: item.sCreatedBy,
          createdOn: item.dCreatedOn,
          modifiedBy: item.sModifiedBy,
          modifiedOn: item.dModifiedOn,
          mappedInstrument: await loadMappedInstruments(item.sClientID),
        }))
      );

      setRows(mappedRows);
    } catch (err) {
      console.error("Client API Error:", err);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  }, [postData, buildClientRequest]);

  const loadUnmappedInstruments = useCallback(async () => {
  try {
    const response = await postData(
      "basemaster/getClientUnmappingInstrumentMaster",
      buildClientRequest()
    );

    if (Array.isArray(response)) {
      const mapped = response.map((inst) => ({
        sInstrumentID: inst.sInstrumentID.trim(),
        sInstrumentName: inst.sInstrumentName.trim(),
      }));

      setUnmappedInstruments(mapped);
      return mapped; // 🔥 IMPORTANT
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}, [postData, buildClientRequest]);


  useEffect(() => {
  loadUnmappedInstruments();
}, [loadUnmappedInstruments]);

  const buildInstrumentUnMappingByClient = (selectedInstruments = []) => {
    return selectedInstruments.map((inst) => ({
      sInstrumentID: inst.sInstrumentID,
      sInstrumentName: inst.sInstrumentName,
    }));
  };

  const buildInsertClientRequest = (clientData, auditData) => {
    const instruments =
      clientData.selectedInstruments?.length > 0
        ? buildInstrumentUnMappingByClient(clientData.selectedInstruments)
        : [];

    return {
      InstrumentUnMappingByClient: instruments, 
      Client: {
        sClientName: clientData.clientName,
        sClientAliasName: clientData.clientAlias,
        sClientTypeID: clientData.clientTypeID,
        iStatus: clientData.status === "Active" ? 1 : 0,
        nClientGateway: clientData.gatewayClient ? 1 : 0,
      },
      ActiveUserDetails: buildClientRequest().ActiveUserDetails,
      ApplicationCode: "SDMS",
    };
  };
  const buildEditClientRequest = (clientData, auditData) => {

    return {
      InstrumentUnMappingByClient: buildInstrumentUnMappingByClient(
        clientData.selectedInstruments
      ),

      AuditTrailValues: auditData.AuditTrailValues,

      Client: {
        sClientID: clientData.clientId,
        sClientName: clientData.clientName,
        sClientAliasName: clientData.clientAlias,
        sClientTypeID: clientData.clientTypeID,
        iStatus: clientData.status === "Active" ? 1 : 0,
        nClientGateway: clientData.gatewayClient ? 1 : 0,
      },

      ActiveUserDetails: buildClientRequest().ActiveUserDetails,
      ApplicationCode: "SDMS",
    };
  };

const handleAuditSubmit = async (auditData) => {
  setShowAuditTrail(false);

  try {
    setLoading(true);
    setLoadingText(t("common.loading"));

    // 🔒 SAFETY: this function is EDIT ONLY
    if (pendingClientData.mode !== "EDIT") return;

    const requestPayload = buildEditClientRequest(
      pendingClientData,
      auditData
    );

    const response = await postData(
      "basemaster/editClient",
      requestPayload
    );
if (response?.Rtn === "Success") {
  mappedInstrumentCache.current = {};

  await loadClientGridData(); // ✅ THIS FIXES UI REFRESH

  setSelectedRowId(pendingClientData.clientId);
}

 else {
      setErrorDialog({
        open: true,
        message: response?.Message?.sClientName || "Operation failed",
        type: response?.Rtn === "Warning" ? "warning" : "error",
      });
    }

    setPendingClientData(null);
    setEditingRow(null);
  } catch (err) {
    console.error("Edit submit error:", err);
  } finally {
    setLoading(false);
    setLoadingText("");
  }
};



  const handleEdit = async (row) => {
    try {
      const response = await postData("basemaster/editGetClient", {
        sClientID: row.id,
        ActiveUserDetails: buildClientRequest().ActiveUserDetails,
        ApplicationCode: "SDMS",
      });

      if (response?.Rtn === "Success") {
        // 1️⃣ Normalize instruments
        const normalizedInstruments = response.InstrumentUnMappingByClient.map(
          (inst) => ({
            sInstrumentID: inst.sInstrumentID.trim(),
            sInstrumentName: inst.sInstrumentName.trim(),
            iStatus: inst.iStatus,
          })
        );

        // 2️⃣ Preselect mapped instruments
        const initiallySelected = normalizedInstruments.filter(
          (inst) => inst.iStatus === 1
        );

        // 3️⃣ Set edit form data
        setEditingRow({
  id: row.id,
  clientName: response.Client.sClientName.trim(),
  clientAlias: response.Client.sClientAliasName.trim(),
  status: response.Client.iStatus === 1 ? "Active" : "Inactive",
  clientTypeID: response.Client.sClientTypeID.trim(), // ✅ ADD THIS
  selectedInstruments: initiallySelected,
  allInstruments: normalizedInstruments,
});


        setShowModal(true);
      }
    } catch (err) {
      console.error("Edit load error:", err);
    }
  };
  const buildClientExportRequest = () => {
    return {
      AllRows: rows.map((row, index) => ({
        sClientID: row.id,
        sClientName: row.clientName,
        sClientAliasName: row.clientAlias,
        sClientStatus: row.status,
        sClientTypeName: row.clientType,
        sIPAddress: row.ipAddress,
        sCreatedBy: row.createdBy,
        dCreatedOn: row.createdOn,
        sModifiedBy: row.modifiedBy,
        dModifiedOn: row.modifiedOn,
        visibleindex: index,
        boundindex: index,
        nStatus: row.status === "Active" ? 1 : 0,
      })),

      sFileName: "ClientMaster",
      sBrowserURL: window.location.origin,

      AllowKeys: [
        "sClientName",
        "sClientAliasName",
        "sClientStatus",
        "sClientTypeName",
        "sIPAddress",
        "sCreatedBy",
        "dCreatedOn",
        "sModifiedBy",
        "dModifiedOn",
      ],

      HeaderDetails: [
        t("label.clientName"),
        t("masters.clientaliasname"),
        t("statuses.status"),
        t("masters.clienttype"),
        t("masters.ipaddress"),
        t("label.createdBy"),
        t("label.createdOn"),
        t("label.modifiedBy"),
        t("label.modifiedOn"),
      ],

      ActiveUserDetails: buildClientRequest().ActiveUserDetails,
      ApplicationCode: "SDMS",
    };
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
const handleExport = () => {
  handleExportCommon({
    rows,
    buildRequest: buildClientExportRequest,
    postData,
    setLoading,
    setLoadingText,
    setErrorDialog,
    t
  });
};


  /* ---------------- EXPORT TO EXCEL FUNCTIONALITY ---------------- */

  const buildPrintRequest = () => ({
  sModuleName: "Client Master",
  ActiveUserDetails: buildClientRequest().ActiveUserDetails,
  ApplicationCode: "SDMS",
});


  /* ---------------- GRID COLUMNS ---------------- */
  const columns = useMemo(
    () => [
      {
        key: "clientName",
        label: t("label.clientName"),
        width: 160,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRowId
                ? "font-bold cursor-pointer"
                : ""
            }`}
          >
            {row.clientName}
          </div>
        ),
      },
      {
        key: "clientAlias",
        label: t("masters.clientaliasname"),
        width: 220,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRowId
                ? "font-bold cursor-pointer"
                : ""
            }`}
          >
            {row.clientAlias}
          </div>
        ),
      },
      {
        key: "status",
        label:  t("statuses.status"),
        width: 160,
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

  const renderDetailPanel = (row) => (
    <div className="space-y-2 ">
      <DetailRow label={t("masters.clienttype")} value={row.clientType} />
      <DetailRow label={t("masters.ipaddress")} value={row.ipAddress} />
      <DetailRow label={t("label.createdBy")} value={row.createdBy} />
      <DetailRow label={t("label.createdOn")} value={row.createdOn} />
      <DetailRow label={t("label.modifiedBy")} value={row.modifiedBy} />
      <DetailRow label={t("label.modifiedOn")} value={row.modifiedOn} />
      <DetailRow label={t("masters.mappedinstrument")} value={row.mappedInstrument} />
    </div>
  );

  /* ---------------- SELECT ROW FOR EDIT ---------------- */
  return (
    <div className=" h-full overflow-hidden flex flex-col">
      {/* ACTION BAR */}
      <div className="flex justify-end gap-2 p-3 ">
        <ActionButton
          icon={IoMdAdd}
          label={t("button.add")}
          onClick={() => {
            setEditingRow(null);
            setShowModal(true);
          }}
        />
        <ActionButton
  icon={FaEdit}
  label={t("button.edit")}
  onClick={() => {
    if (!selectedRowId) {
      setErrorDialog({
        open: true,
        message: t("masters.selectrecord"),
        type: "information",
      });
      return;
    }

    const rowToEdit = rows.find((r) => r.id === selectedRowId);

    if (!rowToEdit) {
      setErrorDialog({
        open: true,
        message:t("masters.selectrecord")
,
        type: "information",
      });
      return;
    }

    handleEdit(rowToEdit);
  }}
/>

        <ActionButton icon={TiExport} label={t("button.export")} onClick={handleExport} />

        <ActionButton icon={MdPrint} label={t("button.print")} onClick={handlePrint} />
      </div>
      {/* {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-lg font-medium">{loadingText}</span>
          </div>
        </div>
      )} */}
      {/* {loading && (
  <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]">
    <div className="w-14 h-14 border-4 border-[#2883fe] border-t-transparent rounded-full animate-spin" />
    <p className="mt-4 text-[#2883fe] font-semibold text-sm">
      {loadingText || "Processing..."}
    </p>
  </div>
)} */}
 
<FullPageLoader loading={loading} text={loadingText} />
<div className="flex-1 overflow-hidden">
      <GridLayout
        key={rows.map((r) => r.id).join(",")}
        columns={columns}
        data={rows}
        height="100%"
        detailPanelWidth="46%"
        getRowId={(row) => row.id}
        enableSelection={false}
        renderDetailPanel={renderDetailPanel}
        getRowClassName={(row) => (row.id === selectedRowId ? "font-bold" : "")}
        onRowClick={(row) => setSelectedRowId(row.id)}
        externalSelectedId={selectedRowId}
      />
      </div>

      {/* MODAL */}
      {showModal && (
        <AddClientModal
          key={editingRow?.id || "ADD"} 
          initialData={editingRow}
          allInstruments={editingRow?.allInstruments || unmappedInstruments} // 🔥 PASS HERE
          onClose={() => setShowModal(false)}
          onReloadUnmapped={loadUnmappedInstruments}  

          onSubmit={async (clientData) => {
  if (!editingRow) {
    try {
      setLoading(true);
      setLoadingText(t("common.loading"));

      const requestPayload = buildInsertClientRequest(clientData);

      const response = await postData(
        "basemaster/insertClient",
        requestPayload
      );

      if (response?.Rtn === "Success") {
        mappedInstrumentCache.current = {};
        await loadClientGridData();
        setSelectedRowId(null);
      }

      return response; // 🔥 IMPORTANT
    } catch (err) {
      console.error("Insert error:", err);
      return { Rtn: "Error" };
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  }

  // EDIT MODE → audit
  setPendingClientData({
    ...clientData,
    mode: "EDIT",
    clientId: editingRow.id,
  });

  setShowModal(false);
  setShowAuditTrail(true);
}}


        />
      )}
      {doPrint && (
  <PrintTable
    columns={columns}
    rows={rows}
  title={t("masters.clientmaster")}
  subtitle={t("masters.clientdata")}

    printRequest={buildPrintRequest()}
    onDone={() => setDoPrint(false)}
  />
)}
      {showAuditTrail && (
        <AuditTrail
          isOpen={showAuditTrail}
          actionLabel="Submit"
          defaultReason={
            pendingClientData?.mode === "EDIT" ? "Modified" : "Activated"
          }
          onClose={() => setShowAuditTrail(false)}
          onAuthorized={handleAuditSubmit}
        />
      )}
      {errorDialog.open && (
        <Errordialog
          message={errorDialog.message}
          type={errorDialog.type}
          onClose={() =>
            setErrorDialog({ open: false, message: "", type: "information" })
          }
        />
      )}
    </div>
  );
};


/* ================== HELPERS ================== */
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

const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 px-[12px] py-[6px]  bg-[#f0f2f5] text-[#2883fe] font-roboto text-[11px] font-bold rounded shadow-sm"
  >
    <Icon className="w-4 h-4" />
    <span className="leading-none">{label}</span>
  </button>
);

export default Client;
