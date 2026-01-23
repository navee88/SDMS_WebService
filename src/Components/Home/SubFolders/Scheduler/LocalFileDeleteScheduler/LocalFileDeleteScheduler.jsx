import { useState, useMemo, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { LuChevronsDown, LuChevronsUp } from "react-icons/lu";
import { TiExport } from "react-icons/ti";
import { MdPrint } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import * as XLSX from "xlsx"; // Add this import for Excel export
import PrintTable from "../../../../Layout/Common/PrintTable";
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { useTranslation } from "react-i18next";
import useAxios from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import AuditTrail from "../../../../Layout/Common/AuditTrail";
import { handleExportCommon } from "../../../../Layout/Common/exportService";
import FullPageLoader from "../../../../Layout/Common/FullPageLoader";

/* ------------------ HELPERS ------------------ */
const formatDate = (date) => date.toISOString().split("T")[0];
const todayStr = formatDate(new Date());

export default function LocalFileDeleteScheduler() {
  const { t } = useTranslation();
  const { postData } = useAxios();
  const [clientOptions, setClientOptions] = useState([]);
  const [client, setClient] = useState("");
  const selectedClient = clientOptions.find((opt) => opt.value === client);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [showPrint, setShowPrint] = useState(false);
  const [gridData, setGridData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialog, setDialog] = useState({
    open: false,
    type: "",
    message: "",
    onConfirm: null,
  });
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [duration, setDuration] = useState("Current Date");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [externalSelectedId, setExternalSelectedId] = useState(null);

  const loadViewAudit = async () => {
    try {
      await postData("Scheduler/localfiledeleteschedulerViewAudit", {
        ...CF_activeUserdetails(),
      });
    } catch (err) {
      console.error("View audit load failed", err);
    }
  };

  useEffect(() => {
    const loadClientOptions = async () => {
      setLoading(true);
      setLoadingText(t("common.loading"));

      try {
        const response = await postData(
          "Scheduler/LocalFileDeleteClientComboAndGridLoad",
          {
            ...CF_activeUserdetails(),
            bFlag: true,
            sFromDate: getCurrentDate(),
          },
        );

        const clients = (response?.oResObj || []).map((item) => ({
          label: item.L06ClientName.trim(),
          value: item.L06ClientID,
        }));

        setClientOptions(clients);
        if (clients.length > 0) setClient(clients[0].value);

        const gridRows = (response?.oResObj1 || []).map((item, index) => ({
          id: index + 1,
          fileName: item.FileName,
          clientName: item.ClientName,
          sourcePath: item.SourcePath,
          uploadOn: item.UploadOn,
          modifiedOn: item.ModifiedOn,
          deletedOn: item.DeletedOn,
          fileVersion: item.FileVersionNo,
          selected: false,
          _raw: item,
        }));

        setGridData(gridRows);
        setFilteredData(gridRows);
        setSelectedRow(gridRows[0] || null);

        await loadViewAudit();
      } catch (error) {
        console.error("Failed to load scheduler data", error);
      } finally {
        setLoading(false);
        setLoadingText("");
      }
    };

    loadClientOptions();
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: t("label.select"),
        width: 100,
        render: (row) => (
          <input
            type="checkbox"
            checked={row.selected || false}
            onChange={() => handleCheckboxToggle(row)}
          />
        ),
      },
      {
        key: "fileName",
        label: t("label.fileName"),
        width: 270,
        enableSearch: true,
        render: (row) => (
          <span
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRow?.id ? "font-bold" : ""
            }`}
          >
            {row.fileName}
          </span>
        ),
      },
      {
        key: "clientName",
        label: t("label.clientName"),
        width: 200,
        enableSearch: true,
        render: (row) => (
          <span
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRow?.id ? "font-bold" : ""
            }`}
          >
            {row.clientName}
          </span>
        ),
      },
    ],
    [selectedRow, t],
  );

  const handleCheckboxToggle = (row) => {
    const updatedData = filteredData.map((r) =>
      r.id === row.id ? { ...r, selected: !r.selected } : r,
    );
    setFilteredData(updatedData);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Jan = 0
    const yyyy = today.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  };
  const toDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}/${mm}/${yyyy}`;
  };
  const buildExportRequest = () => {
    return {
      AllRows: filteredData.map((r) => r._raw),
      sFileName: "LocalFileDelete",
      sBrowserURL: window.location.origin,
      AllowKeys: [
        "selectcolumn",
        "FileName",
        "ClientName",
        "SourcePath",
        "UploadOn",
        "ModifiedOn",
        "DeletedOn",
        "FileVersionNo",
      ],
      HeaderDetails: [
        t("label.select"),
        t("label.fileName"),
        t("label.clientName"),
        t("label.sourcePath"),
        t("label.uploadOn"),
        t("label.modifiedOn"),
        t("label.deletionmarkedon"),
        t("label.versionNo"),
      ],
      ...CF_activeUserdetails(),
    };
  };

  const buildPrintRequest = () => ({
    sModuleName: "Localfiledelete Scheduler",
    ...CF_activeUserdetails(),
  });
  const handlePrint = () => {
    if (!filteredData || filteredData.length === 0) {
      setDialogMessage(t("errormsg.noresultsfound"));
      setDialogType("information");
      setShowDialog(true);
      return;
    }

    setShowPrint(true);
  };

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
      case "Last 1 Year":
        fromDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        fromDate = today;
    }

    return {
      from: formatDate(fromDate),
      to: formatDate(today),
    };
  };

  const isCustomDate = duration === "Custom Date";
  const autoDates = getFromToDates(duration);
  const from = isCustomDate ? customFrom : autoDates.from;
  const to = isCustomDate ? customTo : autoDates.to;

  useEffect(() => {
    if (customFrom && customTo && customFrom > customTo) {
      setCustomTo(customFrom);
    }
  }, [customFrom, customTo]);


  const mapGridRows = (apiData = []) =>
    apiData.map((item, index) => ({
      id: index + 1,
      fileName: item.FileName,
      clientName: item.ClientName,
      sourcePath: item.SourcePath,
      uploadOn: item.UploadOn,
      modifiedOn: item.ModifiedOn,
      deletedOn: item.DeletedOn,
      fileVersion: item.FileVersionNo,
      selected: false,
      _raw: item,
    }));
  const fetchGridByDate = async (fromDate, toDate) => {
  setLoading(true);
  setLoadingText(t("common.loading"));

  try {
    const response = await postData(
      "Scheduler/localAndServerfiledeletionDateFilter",
      {
        sClientID: client,
        sStatus: "localFileDeletion",
        sFromDate: toDDMMYYYY(fromDate),
        sToDate: toDDMMYYYY(toDate),
        ...CF_activeUserdetails(),
        ApplicationCode: "SDMS",
      }
    );

    const rows = mapGridRows(response || []);

    setGridData(rows);
    setFilteredData(rows);

    if (rows.length > 0) {
      setSelectedRow(rows[0]);
      setExternalSelectedId(rows[0].id); // 🔥 THIS IS THE KEY
    } else {
      setSelectedRow(null);
      setExternalSelectedId(null);
    }
  } catch (err) {
    console.error("Date filter failed", err);
  } finally {
    setLoading(false);
    setLoadingText("");
  }
};


  const handleFilter = () => {
    fetchGridByDate(from, to);
  };

  const handleRefresh = () => {
    fetchGridByDate(from, to);
  };

  /* ------------------ SELECT ALL ------------------ */
  const handleSelectAll = () => {
    const allSelected = filteredData.every((r) => r.selected);
    const updatedData = filteredData.map((r) => ({
      ...r,
      selected: !allSelected,
    }));
    setFilteredData(updatedData);
  };

  /* ------------------ AUTHORIZE ------------------ */
  const handleAuthorize = () => {
    const selectedRows = filteredData.filter((row) => row.selected);
    if (selectedRows.length === 0) return;
    setShowAuditTrail(true);
  };

  const handleAuditSubmit = async (auditData) => {
  setLoading(true);
  setLoadingText(t("common.loading"));

  try {
    const selectedRows = filteredData.filter((row) => row.selected);

    const payload = {
      arraylist: selectedRows.map((row) => ({
        selectcolumn: true,
        sTaskID: row._raw?.L14TaskID,
        GUGID: row._raw?.L14DestinationGUID,
      })),
      sClientID: client,
      sStatus: "localFileDeletion",
      sFromDate: toDDMMYYYY(from),
      sToDate: toDDMMYYYY(to),
      ...auditData,
      ApplicationCode: "SDMS",
      ...CF_activeUserdetails(),
    };

    const response = await postData(
      "Scheduler/localAndServerfiledeletionAuthoriseBtn",
      payload
    );

    if (response?.Rtn === "Success") {
      const remaining = filteredData.filter((row) => !row.selected);
      setFilteredData(remaining);
      setSelectedRow(remaining[0] || null);
    }
  } catch (err) {
    console.error("Authorization failed", err);
  } finally {
    setLoading(false);
    setLoadingText("");
    setShowAuditTrail(false);
  }
};

  const DetailsPanel = ({ row }) => (
    <div className=" text-[12px] space-y-3">
      <Detail label={t("label.sourcePath")} value={row?.sourcePath} />
      <Detail label={t("label.uploadOn")} value={row?.uploadOn} />
      <Detail label={t("label.modifiedOn")} value={row?.modifiedOn} />
      <Detail label={t("label.deletionmarkedon")} value={row?.deletedOn} />
      <Detail label={t("label.versionNo")} value={row?.fileVersion} />
    </div>
  );

  return (
    <div className=" h-full overflow-hidden flex flex-col gap-3">
      {/* ---------------- FILTER BAR ---------------- */}
      <div className="relative bg-[#f4f6f8] px-5 py-2 pb-2 rounded">
        {isOpen ? (
          <div className="flex flex-wrap items-start gap-8">
            <div className="w-55">
              <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
                {t("label.clientName")}
              </label>
              <div className="mt-2">
                <AnimatedDropdown
                  name="client"
                  value={client}
                  options={clientOptions}
                  displayKey="label"
                  valueKey="value"
                  onChange={(e) => setClient(e.target.value)}
                />
              </div>
            </div>

            <div className="w-55">
              <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
                {t("label.recordsDuration")}
              </label>
              <div className="mt-2">
                <AnimatedDropdown
                  value={duration}
                  options={[
                    "Current Date",
                    "Last 7 Days",
                    "Last 30 Days",
                    "Last 1 Year",
                    "Custom Date",
                  ]}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDuration(val);
                    if (val === "Custom Date") {
                      setCustomFrom(todayStr);
                      setCustomTo(todayStr);
                    } else {
                      setCustomFrom("");
                      setCustomTo("");
                    }
                  }}
                />
              </div>
            </div>

            {/* ✅ CUSTOM DATE INPUTS RESTORED */}
            {isCustomDate && (
              <>
                <CalendarInput
                  label={t("label.from")}
                  value={customFrom}
                  max={todayStr}
                  onChange={setCustomFrom}
                />
                <CalendarInput
                  label={t("label.to")}
                  value={customTo}
                  min={customFrom}
                  max={todayStr}
                  onChange={setCustomTo}
                />
              </>
            )}

            <div className="flex gap-2 pt-6">
              <PrimaryButton
                icon={FaFilter}
                label={t("button.filter")}
                onClick={handleFilter}
              />
              <PrimaryButton
                icon={HiRefresh}
                label={t("button.refresh")}
                onClick={handleRefresh}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-2 py-2">
            <SummaryItem label="Client Name" value={selectedClient?.label} />

            <SummaryItem
              label={t("label.from")}
              value={formatDisplayDate(from)}
            />
            <SummaryItem label={t("label.to")} value={formatDisplayDate(to)} />
          </div>
        )}

        <button
          className="absolute right-4 -bottom-4 bg-[#f0f4f8] px-5"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <LuChevronsDown className="text-blue-700" />
          ) : (
            <LuChevronsUp className="text-blue-700" />
          )}
        </button>
      </div>

      {/* ---------------- ACTION BUTTONS ---------------- */}
      <div className="flex justify-end gap-2 p-4 pb-0">
        <ActionButton
          icon={FaCheck}
          label={t("usermanagement.selectall")}
          onClick={handleSelectAll}
        />
        <ActionButton
          icon={FaRegCircleCheck}
          label={t("button.authorize")}
          onClick={handleAuthorize}
        />
        <ActionButton
          icon={MdPrint}
          label={t("button.print")}
          onClick={handlePrint}
        />
        <ActionButton
          icon={TiExport}
          label={t("button.export")}
          onClick={() =>
            handleExportCommon({
              rows: filteredData,
              buildRequest: buildExportRequest,
              postData,
              setLoading: () => {},
              setLoadingText: () => {},
              setErrorDialog: setDialog,
              t,
            })
          }
        />
      </div>
<FullPageLoader loading={loading} text={loadingText} />

      <GridLayout
        columns={columns}
        data={filteredData}
        height="100%"
        detailPanelWidth="46%"
        getRowId={(row) => row.id}
          externalSelectedId={externalSelectedId}  
        onRowClick={(row) => {
  setSelectedRow(row);
  setExternalSelectedId(row.id);
}}

        renderDetailPanel={(row) => <DetailsPanel row={row} />}
      />
      {showPrint && (
        <PrintTable
          title="Local File Delete Scheduler"
          subtitle="Files Pending Deletion"
          columns={columns}
          rows={filteredData}
          printRequest={buildPrintRequest()}
          onDone={() => setShowPrint(false)}
        />
      )}
      {showAuditTrail && (
        <AuditTrail
          isOpen={showAuditTrail}
          onClose={() => setShowAuditTrail(false)}
          onAuthorized={handleAuditSubmit}
          actionLabel="Authorize"
        />
      )}

      {dialog.open && (
        <Errordialog
          type={dialog.type}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onClose={() =>
            setDialog({ open: false, type: "", message: "", onConfirm: null })
          }
        />
      )}
    </div>
  );
}
const CalendarInput = ({ label, value, onChange, min, max }) => (
  <div className="w-[150px]">
    <label className="block text-[#405f7d] text-[12px] font-semibold font-roboto">
      {label}
    </label>
    <div className="mt-2">
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
            border-gray-300 cursor-pointer
          "
      />
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 px-[12px] py-[7px]  bg-[#f0f2f5] text-[#2883fe] font-roboto text-[11px] font-bold rounded shadow-sm"
  >
    <Icon className="w-4 h-4" />
    <span className="leading-none">{label}</span>
  </button>
);

const PrimaryButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 px-[12px] py-[7px] bg-[#ffffff] text-[#2883fe] font-roboto text-[11px] font-bold rounded shadow-sm"
  >
    <Icon className="w-4 h-4" />
    <span className="leading-none">{label}</span>
  </button>
);

const Detail = ({ label, value }) => (
  <div className="grid grid-cols-2">
    <span className="font-bold text-[12px] text-[#405F7D] font-roboto">
      {label}
    </span>
    <span className="font-bold text-[12px] text-[#353f49] font-roboto">
      {value || "-"}
    </span>
  </div>
);
const SummaryItem = ({ label, value }) => (
  <div className="flex gap-2 items-center ">
    <span className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
      {label}:
    </span>
    <span className="mb-1 block text-[#0e5bca] text-[12px] font-semibold font-roboto">
      {value || "---"}
    </span>
  </div>
);
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "---";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
};
