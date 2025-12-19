import React, { useState, useEffect, useMemo } from "react";
import { FaFileAlt, FaCheck } from "react-icons/fa";
import { MdOutlineThumbDown, MdPrint } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TiExport } from "react-icons/ti";
import { BsCheck2Square } from "react-icons/bs";
import { useTranslation } from "react-i18next";

import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../Layout/Common/Errordialog";

export default function ViewDownloadConfiguration() {
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ---------- AUDIT POPUP ---------- */
  const [showAudit, setShowAudit] = useState(false);
  const [auditForm, setAuditForm] = useState({
    username: t("login.administrator"),
    password: "",
    reason: "",
    comments: "",
    command: "View Download Scheduler",
  });
  const [errors, setErrors] = useState({});

  /* ---------- BUTTON ---------- */
  const PrimaryButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-2 bg-gray-500/10 text-blue-600 text-[11px] font-bold rounded shadow-sm"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  /* ---------- MOCK DATA ---------- */
  useEffect(() => {
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          instrument: "IN001 (IN001)",
          taskId: "T2",
          sourcePath: "D:\\SDMS\\scheduler\\IN001",
          uncStatus: false,
          downloadClientName: "AGD54",
          downloadPath: "D:\\SDMS\\download_schedule",
          taskStatus: "active",
          taskFilter: "*.*",
          taskCompleted: "completed",
          uncUsername: "",
        },
        {
          id: 2,
          instrument: "IN002 (IN002)",
          taskId: "T3",
          sourcePath: "D:\\SDMS\\scheduler\\IN002",
          uncStatus: true,
          downloadClientName: "AGD55",
          downloadPath: "D:\\SDMS\\download_schedule2",
          taskStatus: "inactive",
          taskFilter: "*.csv",
          taskCompleted: "pending",
          uncUsername: "admin",
        },
      ];

      setData(mockData);
      setSelectedRow(mockData[0]);
      setLoading(false);
    }, 300);
  }, []);

  /* ---------- GRID COLUMNS ---------- */
  const columns = useMemo(
    () => [
      {
        key: "instrument",
        label: t("label.instrument"),
        width: 190,
        enableSearch: true,
      },
      {
        key: "taskId",
        label: t("label.taskId"),
        width: 120,
        enableSearch: true,
      },
      {
        key: "sourcePath",
        label: t("label.sourcePath"),
        width: 230,
        enableSearch: true,
      },
      {
        key: "uncStatus",
        label: t("scheduler.uncStatus"),
        width: 160,
        render: (row) => (
          <input type="checkbox" checked={row.uncStatus} readOnly />
        ),
      },
    ],
    [t]
  );

  /* ---------- ACTION HANDLER ---------- */
  const handleAction = (action) => {
    if (!selectedRow) {
      setErrorMessage(t("errormsg.incompletedatafields"));
      setShowErrorDialog(true);
      return;
    }

    if (action === "ACTIVE" && selectedRow.taskStatus === "active") {
      setErrorMessage(t("statuses.activated"));
      setShowErrorDialog(true);
      return;
    }

    if (action === "INACTIVE" && selectedRow.taskStatus === "inactive") {
      setErrorMessage(t("statuses.deactivated"));
      setShowErrorDialog(true);
      return;
    }

    setShowAudit(true);
  };

  /* ---------- AUDIT VALIDATION ---------- */
  const validateAudit = () => {
    const e = {};
    if (!auditForm.password) e.password = true;
    if (!auditForm.reason) e.reason = true;
    if (!auditForm.comments) e.comments = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitAudit = () => {
    if (!validateAudit()) return;
    setShowAudit(false);
    setErrors({});
  };

  /* ---------- DETAIL PANEL ---------- */
  const DetailRow = ({ label, value }) => (
    <div className="grid grid-cols-2 gap-4 text-[13px]">
      <div className="font-semibold text-[#405F7D]">{label}</div>
      <div className="font-semibold">{value || "-"}</div>
    </div>
  );

  const renderUserDetail = (row) => (
    <div className="space-y-3">
      <DetailRow label={t("label.clientName")} value={row.downloadClientName} />
      <DetailRow label={t("scheduler.destinationpath")} value={row.downloadPath} />
      <DetailRow
        label={t("label.taskStatus")}
        value={t(`statuses.${row.taskStatus}`)}
      />
      <DetailRow label={t("label.filter")} value={row.taskFilter} />
      <DetailRow label={t("label.comments")} value={row.taskCompleted} />
      <DetailRow label={t("label.username")} value={row.uncUsername} />
    </div>
  );

  return (
    <div className="bg-white p-4 space-y-4">
      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-2">
        <PrimaryButton icon={FaFileAlt} label={t("scheduler.view")} onClick={() => setShowAudit(true)} />
        <PrimaryButton icon={FaCheck} label={t("scheduler.activate")} onClick={() => handleAction("ACTIVE")} />
        <PrimaryButton icon={MdOutlineThumbDown} label={t("scheduler.deactivate")} onClick={() => handleAction("INACTIVE")} />
        <PrimaryButton icon={RiDeleteBin6Line} label={t("scheduler.retire")} onClick={() => handleAction("RETIRE")} />
        <PrimaryButton icon={TiExport} label={t("button.export")} />
        <PrimaryButton icon={MdPrint} label={t("button.print")} />
      </div>

      {/* GRID */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          {t("login.loadingpasswordpolicy")}
        </div>
      ) : (
        <GridLayout
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          renderDetailPanel={renderUserDetail}
          onRowClick={(row) => setSelectedRow(row)}
          rowClassName={(row) =>
            row.id === selectedRow?.id
              ? "bg-blue-50 border-l-4 border-blue-600"
              : ""
          }
        />
      )}

      {showErrorDialog && (
        <Errordialog
          type="error"
          message={errorMessage}
          onClose={() => setShowErrorDialog(false)}
        />
      )}

      {/* AUDIT POPUP */}
      {showAudit && (
        <div className="fixed inset-0 bg-black/40 flex justify-center pt-16 z-50">
          <div className="bg-white w-[600px] rounded shadow-lg flex flex-col">
            <div className="px-4 py-2 border-b bg-blue-400/10">
              <h2 className="font-semibold text-blue-700">
                {t("Auditpopup.audittrail")}
              </h2>
            </div>

            <div className="p-5 space-y-5 text-sm">
              <div>
                <label>{t("label.username")} *</label>
                <input disabled value={auditForm.username} className="w-full border-b" />
              </div>

              <div>
                <label>{t("login.password")} *</label>
                <input
                  type="password"
                  className={`w-full border-b ${errors.password ? "border-red-500" : ""}`}
                  onChange={(e) =>
                    setAuditForm({ ...auditForm, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label>{t("Auditpopup.reason")} *</label>
                <AnimatedDropdown
                  options={[
                    t("statuses.activated"),
                    t("statuses.deactivated"),
                    t("Auditpopup.information"),
                  ]}
                  onChange={(e) =>
                    setAuditForm({ ...auditForm, reason: e.target.value })
                  }
                />
              </div>

              <div>
                <label>{t("Auditpopup.comments")} *</label>
                <textarea
                  className={`w-full border-b ${errors.comments ? "border-red-500" : ""}`}
                  onChange={(e) =>
                    setAuditForm({ ...auditForm, comments: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-3 border-t">
              <button
                onClick={submitAudit}
                className="bg-blue-500 text-white px-3 py-1.5 rounded"
              >
                <BsCheck2Square size={16} /> {t("button.submit")}
              </button>
              <button onClick={() => setShowAudit(false)}>
                {t("button.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
