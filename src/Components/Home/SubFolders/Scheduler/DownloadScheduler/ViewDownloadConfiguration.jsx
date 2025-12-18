import React, { useState, useEffect, useMemo } from "react";
import { FaFileAlt, FaCheck } from "react-icons/fa";
import { MdOutlineThumbDown, MdPrint } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TiExport } from "react-icons/ti";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";

export default function ViewDownloadConfiguration() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- BUTTON ---------- */
  const PrimaryButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-2
        bg-gray-500/10 text-blue-600 text-[11px] font-bold
        rounded shadow-sm hover:bg-blue-50 hover:scale-90 transition-all
        whitespace-nowrap"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  /* ---------- MOCK DATA ---------- */
  useEffect(() => {
    setTimeout(() => {
      setData([
        {
          id: 1,
          instrument: "IN001 (IN001)",
          taskId: "T2",
          sourcePath: "D:\\SDMS\\scheduler\\IN001",
          uncStatus: false,

          downloadClientName: "AGD54",
          downloadPath: "D:\\SDMS\\download_schedule",
          taskStatus: "Active",
          taskFilter: "*.*",
          taskCompleted: "Completed",
          uncUsername: "",
        },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  /* ---------- GRID COLUMNS ---------- */
  const columns = useMemo(
    () => [
      {
        key: "instrument",
        label: "Instrument",
        width: 220,
        enableSearch: true,
      },
      {
        key: "taskId",
        label: "Task ID",
        width: 120,
        enableSearch: true,
      },
      {
        key: "sourcePath",
        label: "Source Path",
        width: 250,
        enableSearch: true,
      },
      {
        key: "uncStatus",
        label: "UNC Status",
        width: 160,
        isSelectionColumn: true
      },
    ],
    []
  );

  /* ---------- RIGHT DETAIL PANEL ---------- */
  const renderUserDetail = (row) => (
    <div className="space-y-4 text-[13px]">
      <DetailRow label="Download Client Name" value={row.downloadClientName} />
      <DetailRow label="Download Path" value={row.downloadPath} />
      <DetailRow label="Task Status" value={row.taskStatus} />
      <DetailRow label="Task Filter" value={row.taskFilter} />
      <DetailRow label="Task Completed" value={row.taskCompleted} />
      <DetailRow label="UNC Username" value={row.uncUsername || "-"} />
    </div>
  );

  const DetailRow = ({ label, value }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="font-semibold text-[#405F7D]">{label}</div>
      <div>{value}</div>
    </div>
  );

  return (
    <div className="bg-white p-4 space-y-4">
      {/* ---------- ACTION BUTTONS ---------- */}
      <div className="flex justify-end gap-2">
        <PrimaryButton icon={FaFileAlt} label="View" />
        <PrimaryButton icon={FaCheck} label="Active" />
        <PrimaryButton icon={MdOutlineThumbDown} label="Deactive" />
        <PrimaryButton icon={RiDeleteBin6Line} label="Retire" />
        <PrimaryButton icon={TiExport} label="Export" />
        <PrimaryButton icon={MdPrint} label="Print" />
      </div>

      {/* ---------- GRID ---------- */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading...</div>
      ) : (
        <GridLayout
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          renderDetailPanel={renderUserDetail}
        />
      )}
    </div>
  );
}
