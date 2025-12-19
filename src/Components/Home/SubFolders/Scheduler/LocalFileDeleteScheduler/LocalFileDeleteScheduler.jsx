import { useState, useMemo } from "react";
import {
  CheckSquare,
  ShieldCheck,
  Printer,
  Download,
} from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import { LuChevronsDown, LuChevronsUp } from "react-icons/lu";

import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import { useTranslation } from "react-i18next";

/* ------------------ MOCK DATA ------------------ */
const gridData = [
  {
    id: 1,
    fileName: "sample_report_001.pdf",
    clientName: "AGD54",
    sourcePath: "D:\\SDMS\\files\\sample_report_001.pdf",
    uploadOn: "2025-12-01",
    modifiedOn: "2025-12-05",
    deletedOn: "2025-12-18",
    fileVersion: "v1.0"
  },
  {
    id: 2,
    fileName: "analysis_data.xlsx",
    clientName: "AGD55",
    sourcePath: "D:\\SDMS\\files\\analysis_data.xlsx",
    uploadOn: "2025-11-20",
    modifiedOn: "2025-11-22",
    deletedOn: "2025-12-10",
    fileVersion: "v2.1"
  }
];

export default function LocalFileDeleteScheduler() {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(true);
  const [client, setClient] = useState("AGD54");
  const [duration, setDuration] = useState("Current Date");
  const [selectedRow, setSelectedRow] = useState(null);

  /* Custom date state */
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  /* ------------------ GRID COLUMNS ------------------ */
  const columns = useMemo(
    () => [
      {
        key: "select",
        label: "Select",
        width: 70,
        render: () => <input type="checkbox" />
      },
      { key: "fileName", label: "Filename", width: 300 },
      { key: "clientName", label: "Client Name", width: 200 }
    ],
    []
  );

  /* ------------------ DATE LOGIC ------------------ */
  const formatDate = (date) => date.toISOString().split("T")[0];

  const getFromToDates = (duration) => {
    const today = new Date();
    let fromDate = new Date(today);

    switch (duration) {
      case "Last 7 Days":
        fromDate.setDate(today.getDate() - 7);
        break;
      case "Last 30 Days":
        fromDate.setDate(today.getDate() - 30);
        break;
      case "Current Date":
      default:
        fromDate = today;
    }

    return {
      from: formatDate(fromDate),
      to: formatDate(today)
    };
  };

  const autoDates = getFromToDates(duration);

  const from =
    duration === "Costom Date" ? customFrom : autoDates.from;

  const to =
    duration === "Costom Date" ? customTo : autoDates.to;

  /* ------------------ DETAILS PANEL ------------------ */
  const DetailsPanel = () => (
    <div className="p-4 text-[12px] space-y-3 text-[#405F7D]">
      <Detail label="Source Path" value={selectedRow?.sourcePath} />
      <Detail label="Upload On" value={selectedRow?.uploadOn} />
      <Detail label="Modified On" value={selectedRow?.modifiedOn} />
      <Detail label="Deletion Marked On" value={selectedRow?.deletedOn} />
      <Detail label="File Version" value={selectedRow?.fileVersion} />
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ================= FILTER BAR ================= */}
      <div className="relative bg-[#f4f6f8] p-5 rounded">

        {isOpen ? (
          <>
            <div className="flex flex-wrap items-end gap-3">

              <div className="w-60">
                <label className="text-xs font-medium text-gray-600">
                  Client Name
                </label>
                <AnimatedDropdown
                  value={client}
                  options={["AGD54", "AGD55"]}
                  onChange={(e) => setClient(e.target.value)}
                />
              </div>

              <div className="w-60">
                <label className="text-xs font-medium text-gray-600">
                  Records Duration
                </label>
                <AnimatedDropdown
                  value={duration}
                  options={[
                    "Current Date",
                    "Last 7 Days",
                    "Last 30 Days",
                    "Costom Date"
                  ]}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              {duration === "Costom Date" && (
                <div className="flex gap-3 mt-2">

                  <div className="w-60">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="w-60">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs"
                    />
                  </div>

                </div>
              )}


              <div className="flex gap-2 pt-5">
                <ActionButton
                  icon={FaFilter}
                  label="Filter"
                  bgColor="bg-white"
                  textColor="text-blue-500"
                />
                <ActionButton
                  icon={IoMdRefresh}
                  label="Refresh"
                  bgColor="bg-white"
                  textColor="text-blue-500"
                />
              </div>
            </div>

            
          </>
        ) : (
          <div className="grid grid-cols-6 gap-2 py-2">
            <SummaryItem label="Client Name" value={client} />
            <SummaryItem label="From" value={from} />
            <SummaryItem label="To" value={to} />
          </div>
        )}

        <button
          className="absolute right-4 -bottom-4 bg-[#f0f4f8] px-6"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <LuChevronsDown className="text-blue-700" />
          ) : (
            <LuChevronsUp className="text-blue-700" />
          )}
        </button>
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex justify-end gap-2 p-4">
        <ActionButton icon={CheckSquare} label="Select All" />
        <ActionButton icon={ShieldCheck} label="Authorize" />
        <ActionButton icon={Printer} label="Print" />
        <ActionButton icon={Download} label="Export" />
      </div>

      {/* ================= GRID + DETAILS ================= */}
      <div className="flex gap-3 flex-1 overflow-hidden">
        <div className="flex-[2] bg-white border rounded">
          <GridLayout
            columns={columns}
            data={gridData}
            getRowId={(row) => row.id}
            onRowSelect={setSelectedRow}
          />
        </div>

        <div className="flex-1 bg-white border rounded">
          <DetailsPanel />
        </div>
      </div>
    </div>
  );
}

/* ------------------ HELPERS ------------------ */

const ActionButton = ({
  icon: Icon,
  label,
  bgColor = "bg-[#f1f5f9]",
  textColor = "text-[#2883FE]"
}) => (
  <button
    className={`flex items-center gap-1 px-3 py-2 text-[11px] font-bold rounded ${bgColor} ${textColor}`}
  >
    {Icon && <Icon size={14} />}
    {label}
  </button>
);

const DateInput = ({ label, value, onChange }) => (
  <div className="w-60">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-2 py-1 text-xs"
    />
  </div>
);

const Detail = ({ label, value }) => (
  <div className="grid grid-cols-2">
    <span className="font-semibold">{label}</span>
    <span>{value || "-"}</span>
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div className="flex gap-2 items-center">
    <span className="text-xs font-bold text-slate-600">{label}:</span>
    <span className="text-xs font-bold text-blue-600">{value || "---"}</span>
  </div>
);
