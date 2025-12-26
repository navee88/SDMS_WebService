import React, { useMemo, useState } from "react";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { FaEdit } from "react-icons/fa";

/* ---------------- DETAIL ROW ---------------- */
const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4">
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

/* ---------------- MOCK DATA (REPLACE WITH API) ---------------- */
const rows = [

];

const ParserKey = () => {
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  /* ---------------- GRID COLUMNS ---------------- */
  const columns = useMemo(
    () => [
      {
        key: "elninstrumentname",
        label: "ELN Instrument Name",
        width: 160,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`cursor-pointer ${
              row.id === selectedRowId ? "font-bold text-blue-600" : ""
            }`}
          >
            {row.elninstrumentname}
          </div>
        ),
      },
      {
        key: "elnmethodname",
        label: "ELN Method Name",
        width: 220,
        enableSearch: true,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`cursor-pointer ${
              row.id === selectedRowId ? "font-bold text-blue-600" : ""
            }`}
          >
            {row.elnmethodname}
          </div>
        ),
      },
      {
        key: "parserkey",
        label: "Parser Key",
        width: 160,
        render: (row) => (
          <div
            onClick={() => setSelectedRowId(row.id)}
            className={`cursor-pointer ${
              row.id === selectedRowId ? "font-bold" : ""
            } ${row.status === "Active" ? "text-green-600" : "text-red-600"}`}
          >
            {row.parserkey}
          </div>
        ),
      },
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

    // 👉 OPEN EDIT MODAL / NAVIGATE / API CALL
    console.log("Editing row:", selectedRow);
  };

  /* ---------------- DETAIL PANEL ---------------- */
  const renderDetailPanel = (row) => (
    <div className="space-y-3">
      <DetailRow label="Client Type" value={row.clientType} />
      <DetailRow label="IP Address" value={row.ipAddress} />
      <DetailRow label="Created By" value={row.createdBy} />
    </div>
  );

  return (
    <div className="h-full w-full p-3">

      {/* ACTION BAR */}
      <div className="flex justify-end p-2">
        <ActionButton
          icon={FaEdit}
          label="Edit"
          onClick={handleEditClick}
        />
      </div>

      {/* GRID */}
      <GridLayout
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        enableSelection={false}
        renderDetailPanel={renderDetailPanel}
        onRowClick={(row) => setSelectedRowId(row.id)}
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
