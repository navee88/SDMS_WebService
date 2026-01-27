import React, { useMemo, useState ,useEffect} from "react";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import { FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { HiRefresh } from "react-icons/hi";
import useAxios from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import FullPageLoader from "../../../../Layout/Common/FullPageLoader";



const ClientServiceMonitor = () => {
  const { t } = useTranslation();
  const { postData } = useAxios();

const [gridData, setGridData] = useState([]);
const [clientOptions, setClientOptions] = useState([]);
const [serviceOptions, setServiceOptions] = useState([]);
const [externalSelectedId, setExternalSelectedId] = useState(null);
const [loading, setLoading] = useState(false);
const [loadingText, setLoadingText] = useState("");




  const [filters, setFilters] = useState({
    client: "All",
    service: "All"
  });

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
  setAppliedFilters(draftFilters);
  setIsFilterApplied(true);

  fetchFilteredGridData(
    draftFilters.client,
    draftFilters.service
  );
};



  /* ------------------ REFRESH FUNCTION ------------------ */
const handleRefreshClick = () => {
  setAppliedFilters(draftFilters);
  setIsFilterApplied(true);

  fetchFilteredGridData(
    draftFilters.client,
    draftFilters.service
  );
};


  /* ------------------ FILTERED DATA ------------------ */
 const filteredData = useMemo(() => {
  return gridData.filter(row => {
    const clientMatch =
      appliedFilters.client === "All" ||
      row.client === appliedFilters.client;

    const serviceMatch =
      appliedFilters.service === "All" ||
      row.serviceName === appliedFilters.service;

    return clientMatch && serviceMatch;
  });
}, [gridData, appliedFilters]);

 useEffect(() => {
  if (filteredData.length > 0) {
    setSelectedRow(filteredData[0]);
    setExternalSelectedId(filteredData[0].id); // 🔥 FORCE GRID SELECTION
  } else {
    setSelectedRow(null);
    setExternalSelectedId(null);
  }
}, [filteredData]);



  /* ------------------ GRID COLUMNS ------------------ */
  const columns = useMemo(
    () => [
      {
        key: "client",
        label: t("scheduler.listofclient/server"),
        enableSearch: true,
        width: 220,
        render: (row) => (
          <span className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRow?.id ? "font-bold" : ""
            }`}>
            {row.client}
          </span>
        )
      },
      {
        key: "serviceName",
        label: t("label.serviceName"),
        enableSearch: true,
        width: 280,
        render: (row) => (
          <span className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRow?.id ? "font-bold" : ""
            }`}>
            {row.serviceName}
          </span>
        )
      },
      {
        key: "status",
        label: t("statuses.status"),
        width: 140,
        enableSearch: true,
        render: (row) => (
          <span
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer 
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
useEffect(() => {
  const loadClientServiceMonitor = async () => {
    setLoading(true);
    setLoadingText(t("common.loading"));

    try {
      const response = await postData(
        "Scheduler/clientmonitorComboAndGridLoad",
        CF_activeUserdetails()
      );

      const mappedGrid = (response?.list1 || []).map((item, index) => ({
        id: index + 1,
        client: item.L06ClientName,
        serviceName: item.L81ServiceModule,
        status: item.Status,
        lastModified: item["Last Modified Date"],
        startTime: item["Start Date"],
        runningTime: item["Running Date"],
      }));

      setGridData(mappedGrid);

      setClientOptions(
        (response?.clientlist || []).map(c => c.L06ClientName)
      );

      setServiceOptions(
        (response?.list || []).map(s => s.L81ServiceModule)
      );

    } catch (error) {
      console.error("Client Service Monitor load failed", error);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  loadClientServiceMonitor();
}, []);

const fetchFilteredGridData = async (client, service) => {
  setLoading(true);
  setLoadingText(t("common.loading"));

  try {
    const payload = {
      sClientName: client,
      sServicename: service,
      ...CF_activeUserdetails(),
    };

    const response = await postData(
      "Scheduler/clientmonitorfilter",
      payload
    );

    const mappedGrid = (response || []).map((item, index) => ({
      id: index + 1,
      client: item.L06ClientName,
      serviceName: item.L81ServiceModule,
      status: item.Status,
      lastModified: item["Last Modified Date"],
      startTime: item["Start Date"],
      runningTime: item["Running Date"],
    }));

    setGridData(mappedGrid);

    if (mappedGrid.length > 0) {
      setSelectedRow(mappedGrid[0]);
      setExternalSelectedId(mappedGrid[0].id);
    } else {
      setSelectedRow(null);
      setExternalSelectedId(null);
    }

  } catch (error) {
    console.error("Filter API failed", error);
    setGridData([]);
  } finally {
    setLoading(false);
    setLoadingText("");
  }
};


  /* ------------------ DETAIL PANEL ------------------ */
  const DetailsPanel = ({ row }) => (
    <div className="space-y-4  text-[12px]">
      <Detail label={t("scheduler.lastmodifieddate")} value={row?.lastModified} />
      <Detail label={t("scheduler.startdatetime")} value={row?.startTime} />
      <Detail label={t("scheduler.enddatetime")} value={row?.runningTime} />
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
  options={[...clientOptions]}
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
  options={[ ...serviceOptions]}
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
<FullPageLoader loading={loading} text={loadingText} />

      {/* ---------- GRID ---------- */}
      <div className="flex-1 min-h-0">
 <GridLayout
  columns={columns}
  data={filteredData}
  height="100%"
  detailPanelWidth="46%"
  getRowId={(row) => row.id}
  externalSelectedId={externalSelectedId}   // 🔥 IMPORTANT
  onRowClick={(row) => {
    setSelectedRow(row);
    setExternalSelectedId(row.id);           // keep in sync
  }}
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