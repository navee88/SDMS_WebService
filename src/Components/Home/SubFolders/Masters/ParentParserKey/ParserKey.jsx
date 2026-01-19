import React, { useMemo, useState, useRef, useEffect } from "react";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { FaEdit } from "react-icons/fa";
import EditParserKeyModal from "./EditParserKeyModal"; // Import from separate file
import useAxios from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";


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
const mockRows = [
  {
    id: "1",
    elninstrumentcode: "ELN-001",
    elnmethodgroup: "Chromatography",
    elnmethodname: "Dâne Method",
    parsingkey: "PARSER001",
    status: "Active",
    clientType: "Hospital",
    ipAddress: "192.168.1.100",
    createdBy: "Admin User",
    usePdfToCsv: true,
  },
  {
    id: "2",
    elninstrumentcode: "ELN-002",
    elnmethodgroup: "Spectroscopy",
    elnmethodname: "BioAnalyzer Method",
    parsingkey: "PARSER002",
    status: "Inactive",
    clientType: "Research Lab",
    ipAddress: "192.168.1.101",
    createdBy: "Lab Technician",
    usePdfToCsv: false,
  },
  {
    id: "3",
    elninstrumentcode: "ELN-003",
    elnmethodgroup: "Mass Spec",
    elnmethodname: "Chromatography Method",
    parsingkey: "PARSER003",
    status: "Active",
    clientType: "Pharmaceutical",
    ipAddress: "192.168.1.102",
    createdBy: "System Admin",
    usePdfToCsv: true,
  },
  {
    id: "4",
    elninstrumentcode: "ELN-004",
    elnmethodgroup: "HPLC",
    elnmethodname: "Quantitative Analysis",
    parsingkey: "PARSER004",
    status: "Active",
    clientType: "Diagnostic Lab",
    ipAddress: "192.168.1.103",
    createdBy: "Lab Manager",
    usePdfToCsv: false,
  },
];

const ParserKey = () => {
const [rows, setRows] = useState([]);
const [selectedRowId, setSelectedRowId] = useState(null);

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  /* ---------------- GRID COLUMNS WITH CORRECT STRUCTURE ---------------- */
  const { postData } = useAxios();

const loadParserKeyGrid = async () => {
  try {
    const requestPayload = {
      sActionType: "View",
      ...CF_activeUserdetails()
    };
    console.log("requst for paser key",requestPayload)

    const response = await postData(
      "basemaster/getParserMethod",
      requestPayload
    );

    console.log("ParserKey API response:", response);

    const apiRows = response?.ParserMethod || [];

    const mappedRows = apiRows.map((item) => ({
      id: item.MethodKey,                           // 🔑 unique row id
      elninstrumentcode: item.InstName || "-",
      elnmethodgroup: item.MethodGroup || "-",
      elnmethodname: item.MethodName || "-",
      parsingkey: item.ParserKey,
      status: item.isactive === 1 ? "Active" : "Inactive",
      createdBy: item.CreatedTimestamp || "-",
      ipAddress: item.UTCCreatedTimestamp || "-",
      usePdfToCsv: item.FileConvert === "CSV" ?"CSV" : ""
    }));

    setRows(mappedRows);

    // ✅ auto-select first row
    setSelectedRowId(mappedRows[0]?.id ?? null);

  } catch (error) {
    console.error("ParserKey load failed", error);
    setShowErrorDialog(true);
  }
};
useEffect(() => {
  loadParserKeyGrid();
}, []);

  const columns = useMemo(
    () => [
      {
        key: "elninstrumentcode",
        label: "ELN Instrument Code",
        width: 180,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`cursor-pointer ${
              row.id === selectedRowId ? "font-bold " : ""
            }`}
          >
            {row.elninstrumentcode}
          </div>
        ),
      },
      {
        key: "elnmethodgroup",
        label: "ELN Method Group",
        width: 180,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`cursor-pointer ${
              row.id === selectedRowId ? "font-bold " : ""
            }`}
          >
            {row.elnmethodgroup}
          </div>
        ),
      },
      {
        key: "elnmethodname",
        label: "ELN Method Name",
        width: 200,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`cursor-pointer ${
              row.id === selectedRowId ? "font-bold " : ""
            }`}
          >
            {row.elnmethodname}
          </div>
        ),
      },
      {
        key: "parsingkey",
        label: "Parsing Key",
        width: 160,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`cursor-pointer ${
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
        createdBy: item.CreatedTimestamp || "-",
        ipAddress: item.UTCCreatedTimestamp || "-",
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
};



  /* ---------------- DETAIL PANEL ---------------- */
  const renderDetailPanel = (row) => (
    <div className="space-y-3 p-4">
      <DetailRow label="Created On" value={row.ipAddress} />
      <DetailRow label="Created On" value={row.createdBy} />
      <DetailRow label="File Convert" value={row.usePdfToCsv==="CSV" ? "CSV" : ""} />
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* ACTION BAR */}
      <div className="flex justify-end p-2">
        <ActionButton
          icon={FaEdit}
          label="Edit"
          onClick={handleEditClick}
        />
      </div>

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
      />

      {/* ERROR DIALOG */}
      {showErrorDialog && (
        <Errordialog
          type="error"
          message="No row selected. Please select a row to edit."
          onClose={() => setShowErrorDialog(false)}
        />
      )}
    </div>
  );
};

export default ParserKey;