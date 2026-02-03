import React, { useMemo, useState, useRef, useEffect } from "react";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { FaEdit } from "react-icons/fa";
import EditParserKeyModal from "./EditParserKeyModal"; // Import from separate file
import useAxios from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { useTranslation } from "react-i18next";
import FullPageLoader from "../../../../Layout/Common/FullPageLoader";
import { fi } from "zod/v4/locales";


/* ---------------- DETAIL ROW ---------------- */
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
/* ---------------- ACTION BUTTON ---------------- */
const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 px-[12px] py-[6px] bg-[#f0f2f5] text-[#2883fe] font-roboto text-[11px] font-bold rounded shadow-sm"
  >
    <Icon className="w-4 h-4" />
    <span className="leading-none">{label}</span>
  </button>
);

/* ---------------- MOCK DATA WITH CORRECT COLUMNS ---------------- */

const ParserKey = () => {
const [rows, setRows] = useState([]);
const [selectedRowId, setSelectedRowId] = useState(null);
  const { t } = useTranslation();

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMethodSetupContext, setIsMethodSetupContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");


  /* ---------------- GRID COLUMNS WITH CORRECT STRUCTURE ---------------- */
  const { postData } = useAxios();

const loadParserKeyGrid = async () => {
  try {
    setLoading(true);
    setLoadingText(t("common.loading"));
    const requestPayload = {
      sActionType: "View",
      ...CF_activeUserdetails()
    };
    console.log("loading the grid data in paser key", requestPayload)
    const response = await postData(
      "basemaster/getParserMethod",
      requestPayload
    );

    // 👇 READ URL FROM RESPONSE
    const baseUrl = response?.sWebMethodBaseURL || "";

    setIsMethodSetupContext(
      baseUrl.toLowerCase().endsWith("methodsetup")
    );

    const apiRows = response?.ParserMethod || [];

    const mappedRows = apiRows.map((item) => ({
      id: item.MethodKey,
      elninstrumentcode: item.InstName || "-",
      elnmethodgroup: item.MethodGroup || "-",
      elnmethodname: item.MethodName || "-",
      parsingkey: item.ParserKey,
      status: item.isactive === 1 ? "Active" : "Inactive",
        createdOn: item.CreatedTimestamp ||  "-",
  modifiedOn: item.ModifiedTimestamp ||  "-",
      usePdfToCsv: item.FileConvert === "CSV" ? "CSV" : ""
    }));

    setRows(mappedRows);
    setSelectedRowId(mappedRows[0]?.id ?? null);

  } catch (error) {
    console.error("ParserKey load failed", error);
    setShowErrorDialog(true);
  }
  finally {
    setLoading(false);
    setLoadingText("");
  }
};

useEffect(() => {
  loadParserKeyGrid();
}, []);

  const columns = useMemo(
    () => [
      {
        key: "elninstrumentcode",
        label: t("scheduler.elninstrumentcode"),
        width: 140,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRowId ? "font-bold " : ""
            }`}
          >
            {row.elninstrumentcode}
          </div>
        ),
      },
      {
        key: "elnmethodgroup",
        label: t("scheduler.elnmethodgroup"),
        width: 140,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRowId ? "font-bold " : ""
            }`}
          >
            {row.elnmethodgroup}
          </div>
        ),
      },
      {
        key: "elnmethodname",
        label: t("scheduler.elnmethodname"),
        width: 140,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRowId ? "font-bold " : ""
            }`}
          >
            {row.elnmethodname}
          </div>
        ),
      },
      {
        key: "parsingkey",
        label: t("scheduler.parsingkey"),
        width: 140,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRowId ? "font-bold " : ""
            }`}
          >
            {row.parsingkey}
          </div>
        ),
      }
    ],
    [selectedRowId]
  );

  const selectedRow = rows.find((r) => r.id === selectedRowId);

  /* ---------------- EDIT CLICK ---------------- */
  const handleEditClick = () => {
    if (!selectedRowId) {
      setShowErrorDialog(true);
      return;
    }

    setShowEditModal(true);
  };

  /* ---------------- HANDLE SAVE ---------------- */
const handleSave = async (form, setApiError, closeModal) => {
  try {
    setLoading(true);
    setLoadingText(t("common.loading"));
    const requestPayload = {
      MethodGroup: selectedRow?.elnmethodgroup,
      FileConvert: form.usePdfToCsv ? "CSV" : "",
      parserkey: form.parsingKey,
      instrumentname: selectedRow?.elninstrumentcode,
      methodkey: selectedRow?.id,
      methodname: selectedRow?.elnmethodname,
      ApplicationCode: "SDMS",
      ...CF_activeUserdetails()
    };

    console.log("Update ParserKey request:", requestPayload);

    const response = await postData(
      "basemaster/updateParserKey",
      requestPayload
    );

    console.log("Update ParserKey response:", response);

    const ParserMethod = response?.ParserMethod;
    const MethodName = response?.MethodName;
    const Rtn = response?.Rtn;

    // ✅ SAME LOGIC AS jQuery
    if (ParserMethod) {
      // map API response again (important!)
      const mappedRows = ParserMethod.map((item) => ({
        id: item.MethodKey,
        elninstrumentcode: item.InstName || "-",
        elnmethodgroup: item.MethodGroup || "-",
        elnmethodname: item.MethodName || "-",
        parsingkey: item.ParserKey,
        status: item.isactive === 1 ? "Active" : "Inactive",
          createdOn: item.CreatedTimestamp || "-",
  modifiedOn: item.ModifiedTimestamp || "-",
        usePdfToCsv: item.FileConvert || ""
      }));

      setRows(mappedRows);
      setSelectedRowId(mappedRows[0]?.id ?? null);
      closeModal();
    }
    else if (Rtn === "") {
      closeModal();
    }
    else {
      if (MethodName) {
        setApiError(`${Rtn} ${MethodName}`);
      } else {
        setApiError(Rtn);
      }
    }
  } catch (err) {
    console.error("Update ParserKey failed", err);
    setApiError("Something went wrong while updating Parser Key");
  }
  finally {
    setLoading(false);
    setLoadingText("");
  }
};



  /* ---------------- DETAIL PANEL ---------------- */
const renderDetailPanel = (row) => (
  <div className="space-y-3 p-4">
    <DetailRow label={t("label.createdOn")} value={row.createdOn} />
    <DetailRow label={t("label.modifiedOn")} value={row.modifiedOn} />
    <DetailRow label={t("label.fileConvert")} value={row.usePdfToCsv || "-"} />
  </div>
);


  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* ACTION BAR */}
      <div className="flex justify-end p-2">
        <ActionButton
          icon={FaEdit}
          label={t("button.edit")}
          onClick={handleEditClick}
        />
      </div>
      <FullPageLoader loading={loading} text={loadingText} />
      {/* GRID */}
      <div className="flex-1 overflow-hidden">
        <GridLayout
          columns={columns}
          data={rows}
          height="100%"
          detailPanelWidth="46%"
          getRowId={(row) => row.id}
          enableSelection={false}
          renderDetailPanel={renderDetailPanel}
          onRowClick={(row) => setSelectedRowId(row.id)}
          rowClassName={(row) =>
            row.id === selectedRowId
              ? "bg-blue-50 border-l-4 border-blue-600"
              : ""
          }
        />
      </div>

      {/* EDIT MODAL */}
      <EditParserKeyModal
  isOpen={showEditModal}
  onClose={() => setShowEditModal(false)}
  onSave={handleSave}
  initialData={selectedRow}
  isMethodSetupContext={isMethodSetupContext}
/>


      {/* ERROR DIALOG */}
      {showErrorDialog && (
        <Errordialog
          type="information"
          message={t("masters.selectrecord")}
          onClose={() => setShowErrorDialog(false)}
        />
      )}
    </div>
  );
};

export default ParserKey;