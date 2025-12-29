import React, { useMemo, useState ,useEffect} from "react";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import { FaFilter } from "react-icons/fa";

import { useTranslation } from "react-i18next";
import { HiRefresh } from "react-icons/hi";

const ClientServiceMonitor = () => {
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    client: "All",
    service: "All"
  });
  const [client, setClient] = useState("All");
  const [service, setService] = useState("All");
  // What user selects in dropdown (temporary)
const [draftFilters, setDraftFilters] = useState({
  client: "All",
  service: "All",
});

// What is actually applied to grid
const [appliedFilters, setAppliedFilters] = useState({
  client: "All",
  service: "All",
});



  const [selectedRow, setSelectedRow] = useState(1);
  const [isFilterApplied, setIsFilterApplied] = useState(false); // Track if filter is applied


  const handleDraftChange = (e) => {
  setDraftFilters({
    ...draftFilters,
    [e.target.name]: e.target.value,
  });
};

  /* ------------------ FILTER FUNCTION ------------------ */
const handleFilterClick = () => {
  setAppliedFilters(draftFilters); // 🔥 APPLY ONLY HERE
};


  /* ------------------ REFRESH FUNCTION ------------------ */
const handleRefreshClick = () => {
  setDraftFilters({
    client: "All",
    service: "All",
  });

  setAppliedFilters({
    client: "All",
    service: "All",
  });

};


  /* ------------------ ORIGINAL GRID DATA ------------------ */
  const originalData = useMemo(
    () => [
      {
        id: 1,
        client: "AGD54",
        serviceName: "AgaramInterFACER",
        status: "Warning",
        lastModified: "2024-11-21 16:29:56",
        startTime: "2025-10-06 10:04:40",
        runningTime: "2025-10-07 11:44:44"
      },
      {
        id: 2,
        client: "AGD54",
        serviceName: "RoboticsServiceManager",
        status: "Running",
        lastModified: "2024-11-21 16:29:56",
        startTime: "2025-10-06 10:04:40",
        runningTime: "2025-10-07 11:44:44"
      },
      {
        id: 3,
        client: "AGD54",
        serviceName: "RoboticsFileWatcher",
        status: "Running"
      },
      {
        id: 4,
        client: "AGD54",
        serviceName: "RoboticsFileDownload",
        status: "Running"
      },
      {
        id: 5,
        client: "AGD54",
        serviceName: "RoboticsFileShrink",
        status: "Running"
      }
    ],
    []
  );

  /* ------------------ FILTERED DATA ------------------ */
 const filteredData = useMemo(() => {
  return originalData.filter(row => {
    const clientMatch =
      appliedFilters.client === "All" ||
      row.client === appliedFilters.client;

    const serviceMatch =
      appliedFilters.service === "All" ||
      row.serviceName === appliedFilters.service;

    return clientMatch && serviceMatch;
  });
}, [originalData, appliedFilters]);
  useEffect(() => {
  if (filteredData.length > 0) {
    setSelectedRow(filteredData[0]); // 🔥 select first row
  } else {
    setSelectedRow(null);
  }
}, [filteredData]);


  /* ------------------ GRID COLUMNS ------------------ */
  const columns = useMemo(
    () => [
      {
        key: "client",
        label: "List of Client/Server",
        enableSearch: true,
        width: 220,
        render: (row) => (
          <span className={row.id === selectedRow?.id ? "font-semibold" : ""}>
            {row.client}
          </span>
        )
      },
      {
        key: "serviceName",
        label: "Service Name",
        enableSearch: true,
        width: 300,
        render: (row) => (
          <span className={row.id === selectedRow?.id ? "font-semibold" : ""}>
            {row.serviceName}
          </span>
        )
      },
      {
        key: "status",
        label: "Status",
        width: 150,
        render: (row) => (
          <span
            className={`
              ${row.status === "Warning" ? "text-red-600" : "text-green-600"}
              ${row.id === selectedRow?.id ? "font-bold" : "font-medium"}
            `}
          >
            {row.status}
          </span>
        )
      }
    ],
    [selectedRow]
  );

  /* ------------------ DROPDOWN OPTIONS FROM MOCK DATA ------------------ */
  const clientOptions = useMemo(() => {
    const uniqueClients = [...new Set(originalData.map(item => item.client))];
    return ["All", ...uniqueClients];
  }, [originalData]);

  const serviceOptions = useMemo(() => {
    const uniqueServices = [...new Set(originalData.map(item => item.serviceName))];
    return ["All", ...uniqueServices];
  }, [originalData]);

  /* ------------------ DETAIL PANEL ------------------ */
  const DetailsPanel = ({ row }) => (
    <div className="space-y-4  text-[12px]">
      <Detail label="Last Modified Date" value={row?.lastModified} />
      <Detail label="Start DateTime" value={row?.startTime} />
      <Detail label="Running DateTime" value={row?.runningTime} />
    </div>
  );

  return (
    <div className="flex flex-col h-full p-4">

      {/* ---------- FILTER BAR ---------- */}
      <div className="flex pl-4 items-end gap-4 pb-5">
        <label className="mb-5 block text-[#405f7d] text-[12px] font-semibold font-roboto">
                  {t("label.clientName")}
                </label>
        <div className="w-60">
          <AnimatedDropdown
          
          name="client"
          value={draftFilters.client}
          options={clientOptions}
          onChange={handleDraftChange}
        />
        </div>
        <label className="mb-5 block text-[#405f7d] text-[12px] font-semibold font-roboto">
                  {t("label.serviceName")}
                </label>
        <div className="w-60">
            <AnimatedDropdown
              name="service"
              value={draftFilters.service}
              options={serviceOptions}
              onChange={handleDraftChange}
            />
        </div>

        <div className="mb-3 flex gap-2">
          <ActionButton
            icon={FaFilter}
            label={t("button.filter")}
            onClick={handleFilterClick}
          />
          <ActionButton
            icon={HiRefresh}
            label={t("button.refresh")}
            onClick={handleRefreshClick}
          />
        </div>
      </div>

      {/* ---------- FILTER STATUS INDICATOR ---------- */}
      {isFilterApplied && (filters.client !== "All" || filters.service !== "All") && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <span className="font-medium text-blue-700">
            Filter Applied: 
            {filters.client !== "All" && ` Client: ${filters.client}`}
            {filters.service !== "All" && ` Service: ${filters.service}`}
          </span>
        </div>
      )}

      {/* ---------- GRID ---------- */}
      <div className="flex-1 min-h-0">
  <GridLayout
    columns={columns}
    data={filteredData}
    height="100%"
    detailPanelWidth="46%"
    getRowId={(row) => row.id}
    onRowClick={(row) => setSelectedRow(row)}
    renderDetailPanel={(row) => <DetailsPanel row={row} />}
  />
</div>

    </div>
  );
};

/* ------------------ ACTION BUTTON ------------------ */
const ActionButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-[12px] py-[7px]  bg-[#f0f2f5] text-[#2883fe] font-roboto text-[11px] font-bold rounded shadow-sm"
    >
      <Icon className="w-4 h-4"  />
      <span className="leading-none">{label}</span>
    </button>
  );

/* ------------------ DETAIL ROW ------------------ */
const Detail = ({ label, value }) => (
  <div className="grid grid-cols-2">
    <span className="font-bold text-[12px] text-[#405F7D] font-roboto">{label}</span>
    <span className="font-bold text-[12px] text-[#353f49] font-roboto">{value || "-"}</span>
  </div>
);

export default ClientServiceMonitor;