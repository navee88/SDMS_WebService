import React, { useMemo } from "react";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import { MdAdd, MdEdit, MdPrint } from "react-icons/md";
import { TiExport } from "react-icons/ti";

const Client = () => {

  // 🔹 Mock Grid Data (same as screenshot)
  const data = [
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
      mappedInstrument: "IN001 (in001)",
    },
  ];

  // 🔹 Grid Columns
  const columns = useMemo(() => [
    {
      key: "clientName",
      label: "Client Name",
      enableSearch: true,
    },
    {
      key: "clientAlias",
      label: "Client Alias Name",
      enableSearch: true,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="text-green-600 font-semibold">
          {row.status}
        </span>
      ),
    },
  ], []);

  // 🔹 Right Detail Panel (exact screenshot style)
  const renderDetailPanel = (row) => (
    <div className="space-y-3 text-sm">
      <DetailRow label="Client Type" value={row.clientType} />
      <DetailRow label="IP Address" value={row.ipAddress} />
      <DetailRow label="Created By" value={row.createdBy} />
      <DetailRow label="Created On" value={row.createdOn} />
      <DetailRow label="Modified By" value={row.modifiedBy} />
      <DetailRow label="Modified On" value={row.modifiedOn} />
      <DetailRow label="Mapped Instrument" value={row.mappedInstrument} />
    </div>
  );

  return (
    <div className="h-full flex flex-col">

      {/* 🔹 Top Action Bar */}
      <div className="flex justify-end gap-2 p-3 border-b bg-white">
        <ActionButton icon={<MdAdd />} label="Add" />
        <ActionButton icon={<MdEdit />} label="Edit" />
        <ActionButton icon={<TiExport />} label="Export" />
        <ActionButton icon={<MdPrint />} label="Print" />
      </div>

      {/* 🔹 Grid + Detail Layout */}
      <GridLayout
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        enableSelection={false}
        renderDetailPanel={renderDetailPanel}
      />
    </div>
  );
};
const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="text-gray-900">{value || "-"}</span>
  </div>
);
const ActionButton = ({ icon, label }) => (
  <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded border">
    {icon}
    {label}
  </button>
);


export default Client;
