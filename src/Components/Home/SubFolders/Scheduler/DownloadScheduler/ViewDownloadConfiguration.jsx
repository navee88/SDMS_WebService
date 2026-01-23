import React, { useState, useEffect, useMemo } from "react";
import { FaFileAlt, FaCheck } from "react-icons/fa";
import { MdOutlineThumbDown, MdPrint } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TiExport } from "react-icons/ti";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx"; // Add this import

import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import Errordialog from "../../../../Layout/Common/Errordialog";
import AuditTrail from "../../../../Layout/Common/AuditTrail";
import { useDownloadScheduler } from "../../../../../Context/DownloadSchedulerContext";
import { dom } from "@fortawesome/fontawesome-svg-core";
import useAxios from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import PrintTable from "../../../../Layout/Common/PrintTable";
import { handleExportCommon } from "../../../../Layout/Common/exportService";

export default function ViewDownloadConfiguration() {
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPrint, setShowPrint] = useState(false); // ✅ ADD THIS
  const [pendingAction, setPendingAction] = useState(null); // ACTIVE / INACTIVE
  const [showConfirm, setShowConfirm] = useState(false);

  /* ---------- AUDIT POPUP ---------- */
  const [showAudit, setShowAudit] = useState(false);
  const { setAutoConfigData, setActiveTabIndex, setOpenedFromView } =
    useDownloadScheduler();
  const { postData } = useAxios();

  useEffect(() => {
    const loadDownloadScheduler = async () => {
      try {
        setLoading(true);

        const requestPayload = CF_activeUserdetails();

        const response = await postData(
          "Scheduler/viewdownloadschedulerload",
          requestPayload,
        );

        if (!Array.isArray(response) || response.length === 0) {
          setData([]);
          setSelectedRow(null);
          return;
        }

        // 🔁 MAP API → GRID FORMAT
        const mappedData = response.map((item, index) => ({
          id: index + 1,
          instrument: item.L11InstrumentName,
          taskId: item.L101TaskID?.trim(),
          sourcePath: item.L52TaskSourcePath,
          downloadClientName: item.L06ClientName,
          downloadPath: item.L101TaskDownloadPath,
          taskStatus: item.L101TaskStatus?.toLowerCase(), // active / deactive
          taskFilter: item.L101TaskFilter?.replace(/,$/, ""), // "*.*,"
          taskCompleted: item.L101TaskCompleted,
          uncStatus: item.L101UNCStatus,
          uncUsername: item.L101UNCUserName,
          uncPassword: item.L101UNCPassword,
          uncDomain: item.L101UNCDomain,
          L101DownloadTaskID:item.L101DownloadTaskID,
          fileSettings: "Original", // backend not sending
        }));

        setData(mappedData);
        setSelectedRow(mappedData[0] || null);
      } catch (error) {
        console.error(error);
        setErrorMessage(t("errormsg.noresultsfound"));
        setShowErrorDialog(true);
      } finally {
        setLoading(false);
      }
    };

    loadDownloadScheduler();
  }, []);

  /* ---------- BUTTON ---------- */
  const ActionButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-[12px] py-[6px]  bg-[#f0f2f5] text-[#2883fe] font-roboto text-[11px] font-bold rounded shadow-sm"
    >
      <Icon className="w-4 h-4" />
      <span className="leading-none">{label}</span>
    </button>
  );

  /* ---------- MOCK DATA ---------- */

  /* ---------- EXPORT TO EXCEL FUNCTION ---------- */
  const buildExportRequest = () => ({
    sFileName: "DownloadScheduler",
    sBrowserURL: window.location.origin,
    AllRows: data.map((row) => ({
      L11InstrumentName: row.instrument,
      L101TaskID: row.taskId,
      L52TaskSourcePath: row.sourcePath,
      L06ClientName: row.downloadClientName,
      L101TaskDownloadPath: row.downloadPath,
      L101TaskStatus: row.taskStatus,
      L101TaskFilter: row.taskFilter,
      L101TaskCompleted: row.taskCompleted,
      L101UNCStatus: row.uncStatus,
      L101UNCUserName: row.uncUsername,
      L101UNCPassword: row.uncPassword,
      L101UNCDomain: row.uncDomain,
    })),

    HeaderDetails: [
      "Instrument Name",
      "Task ID",
      "Source Path",
      "UNC Status",
      "Download Client Name",
      "Download Path",
      "Task Status",
      "Task Filter",
      "Task Completed",
      "UNC Username",
      "UNC Domain",
    ],

    AllowKeys: [
      "L11InstrumentName",
      "L101TaskID",
      "L52TaskSourcePath",
      "L101UNCStatus",
      "L06ClientName",
      "L101TaskDownloadPath",
      "L101TaskStatus",
      "L101TaskFilter",
      "L101TaskCompleted",
      "L101UNCUserName",
      "L101UNCDomain",
    ],

    ...CF_activeUserdetails(),
  });

  const handleExport = () => {
    handleExportCommon({
      rows: data, // 🔥 ALL GRID ROWS
      buildRequest: buildExportRequest,
      postData,
      setLoading,
      setLoadingText: () => {},
      setErrorDialog: ({ message, type }) => {
        setErrorMessage(message);
        setShowErrorDialog(true);
      },
      t,
    });
  };

  /* ---------- PRINT FUNCTION ---------- */
  const printRequest = {
    sModuleName: "View Download Scheduler",
    ...CF_activeUserdetails(),
  };
  const handlePrint = () => {
    if (!data || data.length === 0) {
      setErrorMessage(t("errormsg.noresultsfound"));
      setShowErrorDialog(true);
      return;
    }
    setShowPrint(true);
  };

  /* ---------- GRID COLUMNS ---------- */
  const columns = useMemo(
    () => [
      {
        key: "instrument",
        label: t("label.instrument"),
        width: 160,
        enableSearch: true,
        render: (row) => (
          <span
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRow?.id ? "font-bold" : ""
            }`}
          >
            {row.instrument}
          </span>
        ),
      },
      {
        key: "taskId",
        label: t("label.taskId"),
        width: 140,
        enableSearch: true,
        render: (row) => (
          <span
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRow?.id ? "font-bold" : ""
            }`}
          >
            {row.taskId}
          </span>
        ),
      },
      {
        key: "sourcePath",
        label: t("label.sourcePath"),
        width: 200,
        enableSearch: true,
        render: (row) => (
          <span
            className={`text-[12px] font-['Verdana'] truncate cursor-pointer ${
              row.id === selectedRow?.id ? "font-bold" : ""
            }`}
          >
            {row.sourcePath}
          </span>
        ),
      },
      {
        key: "uncStatus",
        label: t("scheduler.uncStatus"),
        width: 140,
        render: (row) => (
          <input type="checkbox" checked={row.uncStatus} readOnly />
        ),
      },
    ],
    [selectedRow, t],
  );

  /* ---------- ACTION HANDLER ---------- */
  const handleAction = (action) => {
    console.log("action",action)
    if (!selectedRow) {
      setErrorMessage(t("errormsg.incompletedatafields"));
      setShowErrorDialog(true);
      return;
    }

    // Already Active
    if (action === "ACTIVE" && selectedRow.taskStatus === "active") {
      setErrorMessage(t("Download schedule already in Active status"));
      setShowErrorDialog(true);
      return;
    }

    // Already Deactive
    if (action === "INACTIVE" && selectedRow.taskStatus === "deactive") {
      setErrorMessage(t("Download schedule already in Deactive status"));
      setShowErrorDialog(true);
      return;
    }
  
    if (action === "ACTIVE" || action === "INACTIVE" && selectedRow.taskStatus === "retire") {
  setErrorMessage(t("Selected Download Schedule is Retired! So it cannot be Activated."));
  setShowErrorDialog(true);
  return;
}
if (action === "RETIRE" && selectedRow.taskStatus === "retire") {
  setErrorMessage(t("Download Scheduler already in Retired Status"));
  setShowErrorDialog(true);
  return;
}


    // Otherwise → Confirmation popup
    setPendingAction(action);
    setShowConfirm(true);
  };

  /* ---------- DETAIL PANEL ---------- */
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

  const renderUserDetail = (row) => (
    <div className="space-y-3">
      <DetailRow label={t("label.clientName")} value={row.downloadClientName} />
      <DetailRow
        label={t("scheduler.destinationpath")}
        value={row.downloadPath}
      />
      <DetailRow
        label={t("label.taskStatus")}
        value={t(`statuses.${row.taskStatus}`)}
      />
      <DetailRow label={t("label.filter")} value={row.taskFilter} />
      <DetailRow label={t("label.comments")} value={row.taskCompleted} />
      <DetailRow label={t("label.username")} value={row.uncUsername} />
    </div>
  );

  /* ---------- HANDLER FOR AUDITTRAIL SUBMIT ---------- */
console.log("selected row",selectedRow)
  const handleAuthorized = async (auditPayload) => {
    try {
      // 🔹 VIEW FLOW
      if (pendingAction === "VIEW") {
        const request = {
          process: "",
          sDownloadTaskID: selectedRow.L101DownloadTaskID,
          ...auditPayload,
          bExist: true,
          ...CF_activeUserdetails(),
        };
        console.log("view",request)
        const response = await postData(
          "Scheduler/DownloadschedulerSave",
          request,
        );

        const viewObj = response?.ViewObj;
        if (!viewObj) {
          throw new Error("No view data received");
        }

        // ✅ Map API → Context
        setAutoConfigData({
          instrument: viewObj.l11InstrumentName,
          clientName: viewObj.l06ClientName,
          downloadPath: viewObj.l101TaskDownloadPath,
          filter: viewObj.l101TaskFilter?.replace(/,$/, ""),
          sourcepath: viewObj.l52TaskSourcePath,
          uncStatus: viewObj.l101UNCStatus,
          username: viewObj.l101UNCUserName,
          password: viewObj.l101UNCPassword,
          domain: viewObj.l101UNCDomain,
          filesettings: viewObj.l101StructureType,
        });

        setOpenedFromView(true);
        setActiveTabIndex(0); // AutoDownloadConfiguration
        return;
      }

      // 🔹 ACTIVE / DEACTIVE FLOW
      const request = {
  sTaskID: selectedRow.taskId,
  sTaskStatus:
    pendingAction === "ACTIVE"
      ? "Active"
      : "Deactive",
  bStatus:
    pendingAction === "ACTIVE"
      ? "Active"
      : pendingAction === "INACTIVE"
      ? "DeActive"
      : "Retire",
  sDownloadTaskID: selectedRow.L101DownloadTaskID,
  ...auditPayload,
  ...CF_activeUserdetails(),
};
      console.log("active inactive pass");
      const response = await postData(
        "Scheduler/DownloadscheduleActions",
        request,
      );
      console.log("active in active ",request)

if (response?.Rtn === "Success") {
  // ✅ BEST PRACTICE: update grid from response if available
  if (Array.isArray(response.returnservice)) {
    const updatedData = response.returnservice.map((item, index) => ({
      id: index + 1,
      instrument: item.L11InstrumentName,
      taskId: item.L101TaskID?.trim(),
      sourcePath: item.L52TaskSourcePath,
      downloadClientName: item.L06ClientName,
      downloadPath: item.L101TaskDownloadPath,
      taskStatus: item.L101TaskStatus?.toLowerCase(), // active | deactive | retire
      taskFilter: item.L101TaskFilter?.replace(/,$/, ""),
      taskCompleted: item.L101TaskCompleted,
      uncStatus: item.L101UNCStatus,
      uncUsername: item.L101UNCUserName,
      uncPassword: item.L101UNCPassword,
      uncDomain: item.L101UNCDomain,
      L101DownloadTaskID: item.L101DownloadTaskID,
      fileSettings: "Original",
    }));

    setData(updatedData);
    setSelectedRow(updatedData[0] || null);
  } else {
    // fallback (should rarely happen)
    setData((prev) =>
      prev.map((row) =>
        row.id === selectedRow.id
          ? {
              ...row,
              taskStatus:
                pendingAction === "ACTIVE"
                  ? "active"
                  : pendingAction === "INACTIVE"
                  ? "deactive"
                  : "retire",
            }
          : row,
      ),
    );
  }}
    } catch (err) {
      console.error(err);
      setErrorMessage("Action failed");
      setShowErrorDialog(true);
    } finally {
      setShowAudit(false);
      setPendingAction(null);
    }
  };

  // const handleAuthorized = () => {
  //   setAutoConfigData({
  //     instrument: selectedRow.instrument,
  //     clientName: selectedRow.downloadClientName,
  //     downloadPath: selectedRow.downloadPath,
  //     filter: selectedRow.taskFilter,
  //     sourcepath: selectedRow.sourcePath,
  //     uncStatus: selectedRow.uncStatus,
  //     username: selectedRow.uncUsername,
  //     password: selectedRow.uncPassword,
  //     domain: selectedRow.uncDomain,
  //     filesettings: selectedRow.fileSettings,
  //   });

  //   setOpenedFromView(true);   // ✅ mark entry
  //   setActiveTabIndex(0);      // AutoDownloadConfiguration
  //   setShowAudit(false);
  // };

  return (
    <div className="h-full overflow-hidden bg-[#f5f7fb]">
      {/* PAGE CONTAINER */}
      <div className="h-full flex flex-col bg-white">
        {/* ACTION BUTTONS (NO SCROLL) */}
        <div className="flex justify-end pr-5  gap-2 pt-3">
          <ActionButton
            icon={FaFileAlt}
            label={t("scheduler.view")}
            onClick={() => {
              if (!selectedRow) {
                setErrorMessage(t("errormsg.incompletedatafields"));
                setShowErrorDialog(true);
                return;
              }
              setPendingAction("VIEW");
              setShowAudit(true);
            }}
          />

          <ActionButton
            icon={FaCheck}
            label={t("scheduler.active")}
            onClick={() => handleAction("ACTIVE")}
          />
          <ActionButton
            icon={MdOutlineThumbDown}
            label={t("scheduler.deactive")}
            onClick={() => handleAction("INACTIVE")}
          />
          <ActionButton
            icon={RiDeleteBin6Line}
            label={t("scheduler.retire")}
            onClick={() => handleAction("RETIRE")}
          />
          <ActionButton
            icon={TiExport}
            label={t("button.export")}
            onClick={handleExport}
          />
          <ActionButton
            icon={MdPrint}
            label={t("button.print")}
            onClick={handlePrint}
          />
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-auto p-3">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              {t("login.loadingpasswordpolicy")}
            </div>
          ) : (
            <GridLayout
              columns={columns}
              height="100%"
              detailPanelWidth="46%"
              data={data}
              getRowId={(row) => row.id}
              renderDetailPanel={renderUserDetail}
              onRowClick={(row) => setSelectedRow(row)}
              rowClassName={(row) =>
                row.id === selectedRow?.id
                  ? "bg-blue-50 border-l-4 border-blue-600 font-semibold"
                  : ""
              }
            />
          )}
        </div>

        {/* ERROR DIALOG */}
        {showErrorDialog && (
          <Errordialog
            type="warning"
            message={errorMessage}
            onClose={() => setShowErrorDialog(false)}
          />
        )}
        {showPrint && (
          <PrintTable
            columns={columns}
            rows={data}
            title="Download Configuration"
            subtitle="View Download Scheduler"
            printRequest={printRequest}
            onDone={() => setShowPrint(false)}
          />
        )}
        {showConfirm && (
          <Errordialog
            type="confirmation"
            message={
  pendingAction === "ACTIVE"
    ? t("Are you sure you want to activate this task?")
    : pendingAction === "INACTIVE"
    ? t("Are you sure you want to deactivate this task?")
    : pendingAction === "RETIRE"
    ? t("Are you sure you want to retire this task?")
    : ""
}

            showCancel={true}
            onCancel={() => setShowConfirm(false)}
            onConfirm={() => {
              setShowConfirm(false);
              setShowAudit(true); // 🔥 Open Audit Trail
            }}
          />
        )}

        {/* AUDIT POPUP */}
        {showAudit && (
          <AuditTrail
            isOpen={showAudit}
            onClose={() => setShowAudit(false)}
            onAuthorized={handleAuthorized}
          />
        )}
      </div>
    </div>
  );
}
