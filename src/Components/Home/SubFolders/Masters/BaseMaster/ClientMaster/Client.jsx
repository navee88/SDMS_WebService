  import React, { useState, useMemo, useRef, useEffect } from "react";

  import GridLayout from "../../../../../Layout/Common/Home/Grid/GridLayout";
  import { MdPrint } from "react-icons/md";
  import { IoMdAdd } from "react-icons/io";
  import { FaEdit } from "react-icons/fa";
  import { TiExport } from "react-icons/ti";
  import { Loader2 } from "lucide-react";
  import useAxios from "../../../../../../Services/servicecall";
  import {CF_decrypt} from "../../../../../Common/encryptiondecryption";
  import AddClientModal from "./AddClientModal";
  import AuditTrail from "../../../../../Layout/Common/AuditTrail";
  import PrintTable from "./PrintTable";

  /* ================== MAIN COMPONENT ================== */
  const Client = () => {
    const [rows, setRows] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

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

    const buildClientRequest = () => {
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
    const buildMappedInstrumentRequest = (clientId) => ({
      sClientID: clientId, // ✅ FIXED
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
              const mappedInstrumentText = await loadMappedInstruments(
                item.sClientID
              );

              return {
                id: item.sClientID || index.toString(),
                clientName: item.sClientName,
                clientAlias: item.sClientAliasName,
                status: item.sClientStatus === "DeActive" ? "Deactive" : "Active",
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

          // ✅ Preserve selection if it still exists
          setSelectedRowId((prev) =>
            mappedRows.some((r) => r.id === prev)
              ? prev
              : prev ?? mappedRows[0]?.id ?? null
          );
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
              response.map((inst) => ({
                sInstrumentID: inst.sInstrumentID.trim(), // I3
                sInstrumentName: inst.sInstrumentName.trim(), // IN002
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
      return selectedInstruments.map((inst) => ({
        sInstrumentID: inst.sInstrumentID, // I3
        sInstrumentName: inst.sInstrumentName, // IN002
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
          nClientGateway: clientData.gatewayClient ? 1 : 0,
        },
        ActiveUserDetails: buildClientRequest().ActiveUserDetails,
        ApplicationCode: "SDMS",
      };
    };
    const buildEditClientRequest = (clientData, auditData) => {
      console.log(
        "Building Edit Client Request with data:",
        clientData,
        auditData
      ); // Debug log
      return {
        InstrumentUnMappingByClient: buildInstrumentUnMappingByClient(
          clientData.selectedInstruments
        ),

        AuditTrailValues: auditData.AuditTrailValues,

        Client: {
          sClientID: clientData.clientId, // 🔥 REQUIRED
          sClientName: clientData.clientName,
          sClientAliasName: clientData.clientAlias,
          sClientTypeID: "CT1",
          iStatus: clientData.status === "Active" ? 1 : 0,
          nClientGateway: clientData.gatewayClient ? 1 : 0,
        },

        ActiveUserDetails: buildClientRequest().ActiveUserDetails,
        ApplicationCode: "SDMS",
      };
    };

    const handleAuditSubmit = async (auditData) => {
      setShowAuditTrail(false);
      const previousSelectedRowId = selectedRowId;

      try {
        setLoading(true); // 🔥 SHOW LOADER
        setLoadingText("Loading Client Data...");

        const isEdit = pendingClientData.mode === "EDIT";

        const requestPayload = isEdit
          ? buildEditClientRequest(pendingClientData, auditData)
          : buildInsertClientRequest(pendingClientData, auditData);

        const apiUrl = isEdit
          ? "basemaster/editClient"
          : "basemaster/insertClient";

        const response = await postData(apiUrl, requestPayload);

        if (response?.Rtn === "Success") {
    await loadClientGridData();

    // keep edited/added row selected
    if (isEdit) {
      setSelectedRowId(pendingClientData.clientId);
    } else {
      setSelectedRowId(previousSelectedRowId);
    }
  }


        setPendingClientData(null);
        setEditingRow(null);
      } catch (err) {
        console.error("Client submit error:", err);
      } finally {
        setLoading(false); // 🔥 HIDE LOADER ALWAYS
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
          "Client Name",
          "Client Alias Name",
          "Status",
          "Client Type",
          "IP Address",
          "Created By",
          "Created On",
          "Modified By",
          "Modified On",
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
    const handlePrint = () => {
      PrintTable({
        columns,
        rows,
        title: "Client Configuration",
        subtitle: "View Client Configuration Report",
      });
    };

    /* ---------------- EXPORT TO EXCEL FUNCTIONALITY ---------------- */
    const handleExport = async () => {
      try {
        setLoading(true);
        setLoadingText("Preparing export file..."); // ✅ custom wording

        const requestPayload = buildClientExportRequest();
        const response = await postData(
          "basemaster/exportDataFile",
          requestPayload
        );

        if (response?.ExportDataViewURL) {
          const exportUrl = CF_decrypt(response.ExportDataViewURL);

          // Download via Blob so Chrome shows download
          const fileResp = await fetch(exportUrl, { credentials: "include" });
          if (!fileResp.ok) throw new Error("File not accessible");

          const blob = await fileResp.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "ClientMaster.xls";
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(link.href);
        }
      } catch (err) {
        console.error("Export failed:", err);
        setLoadingText("Export failed!"); // optional error text
      } finally {
        setLoading(false);
        setLoadingText("");
      }
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
              className={
                row.id === selectedRowId
                  ? "font-bold cursor-pointer"
                  : "cursor-pointer"
              }
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
              className={
                row.id === selectedRowId
                  ? "font-bold cursor-pointer"
                  : "cursor-pointer"
              }
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
          },
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
          <ActionButton icon={TiExport} label="Export" onClick={handleExport} />

          <ActionButton icon={MdPrint} label="Print" onClick={handlePrint} />
        </div>
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-lg font-medium">{loadingText}</span>
            </div>
          </div>
        )}
        <GridLayout
          key={rows.map(r => r.id).join(",")}
          columns={columns}
          data={rows}
          height="100%"
          detailPanelWidth="46%"
          getRowId={(row) => row.id}
          enableSelection={false}
          renderDetailPanel={renderDetailPanel}
          getRowClassName={(row) => (row.id === selectedRowId ? "font-bold" : "")}
          onRowClick={(row) => setSelectedRowId(row.id)}
        />

        {/* MODAL */}
        {showModal && (
          <AddClientModal
            initialData={editingRow}
            allInstruments={editingRow?.allInstruments || unmappedInstruments} // 🔥 PASS HERE
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
            defaultReason={
              pendingClientData?.mode === "EDIT" ? "Modified" : "Activated"
            }
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
