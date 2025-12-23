import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { MdOutlineThumbUp } from "react-icons/md";
import { BsCheck2Square } from "react-icons/bs";
import { useDownloadScheduler } from "../../../../../Context/DownloadSchedulerContext";
import { useEffect } from "react";



 
export default function AutoDownloadConfiguration() {
  const { t } = useTranslation();
  const { autoConfigData } = useDownloadScheduler();
 
  const [pathType, setPathType] = useState("LOCAL"); // LOCAL | UNC
  const isUNC = pathType === "UNC";
 
  // 🔹 Form values
  const [instrument, setInstrument] = useState("");
  const [clientName, setClientName] = useState("");
  const [downloadPath, setDownloadPath] = useState("");
  const [structureType, setStructureType] = useState("");
  const [filter, setFilter] = useState("");
const [sourcePath, setSourcePath] = useState("");
const [uncStatus, setUncStatus] = useState("");
const [username, setUsername] = useState("");
const [fileSettings, setFileSettings] = useState("");

 
  // 🔹 Error states
  const [instrumentError, setInstrumentError] = useState(false);
  const [clientError, setClientError] = useState(false);
  const [pathError, setPathError] = useState(false);
  const [structureError, setStructureError] = useState(false);
 
  // 🔹 Popup
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
useEffect(() => {
  if (!autoConfigData) return;

  setInstrument(autoConfigData.instrument ?? "");
  setClientName(autoConfigData.clientName ?? "");
  setDownloadPath(autoConfigData.downloadPath ?? "");
  setFilter(autoConfigData.filter ?? "");
  setSourcePath(autoConfigData.sourcepath ?? "");
  setUsername(autoConfigData.username ?? "");
  setFileSettings(autoConfigData.filesettings ?? "");

  // ✅ THIS IS THE KEY LINE
  setPathType(autoConfigData.uncStatus ? "UNC" : "LOCAL");
}, [autoConfigData]);



 
  const handleSave = () => {
    let hasError = false;
 
    if (!instrument) {
      setInstrumentError(true);
      hasError = true;
    }
    if (!clientName) {
      setClientError(true);
      hasError = true;
    }
    if (!downloadPath.trim()) {
      setPathError(true);
      hasError = true;
    }
    if (!structureType) {
      setStructureError(true);
      hasError = true;
    }
 
    if (hasError) {
      setErrorMessage(t("errormsg.incompletedatafields")); // already exists
      setShowErrorDialog(true);
      return;
    }
 
    console.log("Saved", {
      instrument,
      clientName,
      downloadPath,
      structureType
    });
  };
 
  const handleCheck = () => {
    let hasError = false;
 
    if (!clientName.trim()) {
      setClientError(true);
      hasError = true;
    }
    if (!downloadPath.trim()) {
      setPathError(true);
      hasError = true;
    }
    if (hasError) return;
 
    console.log("Valid Data", { clientName, downloadPath });
  };
 
  return (
    <div className="bg-white p-8 pt-4">
 
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center mb-4 gap-2 rounded bg-blue-500 px-3 py-1.5 text-white font-semibold"
        >
          <BsCheck2Square size={18} />
          <span className="text-xs font-medium">
            {t("button.save")}
          </span>
        </button>
      </div>
 
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
 
          {/* Source */}
          <div>
            <h2 className="mb-2 text-sm font-bold text-blue-600">
              {t("scheduler.source")} {/* 🔴 ADD TO JSON */}
            </h2>
 
            <label className="mb-1 block text-gray-600 text-xs font-semibold">
              {t("label.instrument")} <span className="text-red-500">*</span>
            </label>
 
            <div className="w-80">
              <AnimatedDropdown
                value={instrument}
                options={["IN001 (IN001)"]}
                required
                showError={instrumentError}
                onChange={(e) => {
                  setInstrument(e.target.value);
                  setInstrumentError(false);
                }}
              />
            </div>
          </div>
 
          {/* UNC Credentials */}
          <div>
            <h2 className="mb-2 text-sm font-bold text-blue-600">
              {t("scheduler.unccredentials")}
            </h2>
 
            <div className="grid grid-cols-2 gap-2 max-w-md">
              <div>
                <label className="mb-1 block text-gray-600 text-xs font-semibold">
                  {t("label.username")}
                </label>
                <input
                  disabled={!isUNC}
                  className="w-full border-b border-gray-400 text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
 
              <div>
                <label className="mb-1 block text-gray-600 text-xs font-semibold">
                  {t("login.password")}
                </label>
                <input
                  disabled={!isUNC}
                  type="password"
                  className="w-full border-b border-gray-400 text-xs focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
 
          {/* Schedule Path */}
          <div>
            <label className="mb-1 block text-gray-600 text-xs font-medium">
              {t("scheduler.sourcepath")} <span className="text-red-500">*</span>
            </label>
            <div className="w-80">
              <AnimatedDropdown
                  value={sourcePath}
                  options={["Daily", "Weekly"]}
                  allowFreeInput
                  onChange={(e) => setSourcePath(e.target.value)}
                />

            </div>
          </div>
 
          {/* Domain */}
          <div>
            <label className="mb-1 block text-gray-600 text-xs font-semibold">
              {t("label.domain")}
            </label>
            <div className="w-80">
              <AnimatedDropdown disabled={!isUNC} options={["NONE"]} />
            </div>
          </div>
 
          {/* Download */}
          <div>
            <h2 className="mb-4 text-sm font-bold text-blue-600">
              {t("scheduler.download")} {/* 🔴 ADD TO JSON */}
            </h2>
 
            <label className="mb-1 block text-gray-600 text-xs font-semibold">
              {t("label.clientName")} <span className="text-red-500">*</span>
            </label>
 
            <div className="w-80">
              <AnimatedDropdown
                value={clientName}
                options={["Client A", "Client B"]}
                required
                showError={clientError}
                onChange={(e) => {
                  setClientName(e.target.value);
                  setClientError(false);
                }}
              />
            </div>
          </div>
 
          {/* Filter */}
          <div className="w-80">
            <label className="mb-1 block text-gray-600 text-xs font-semibold">
              {t("label.filter")}
            </label>
            <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full border-b py-2 focus:outline-none focus:border-blue-500"
              />

          </div>
 
          {/* Toggle */}
          <div className="md:col-span-2 flex gap-8">
            <Toggle
              label={t("scheduler.localpath")}
              checked={pathType === "LOCAL"}
              onChange={() => setPathType("LOCAL")}
            />
            <Toggle
              label={t("scheduler.uncpath")}
              checked={pathType === "UNC"}
              onChange={() => setPathType("UNC")}
            />
          </div>
 
          {/* Download Path */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-gray-600 text-xs font-semibold">
              {t("label.downloadLocation")} <span className="text-red-500">*</span>
            </label>
 
            <div className="flex w-[400px] gap-4">
              <input
                value={downloadPath}
                onChange={(e) => {
                  setDownloadPath(e.target.value);
                  setPathError(false);
                }}
                className={`flex-1 border-b py-1 focus:outline-none ${
                  pathError ? "border-red-500" : "border-gray-400 focus:border-blue-500"
                }`}
              />
 
              <button
                onClick={handleCheck}
                className="flex items-center gap-2 rounded bg-gray-600/10 px-2 py-1 text-blue-600 font-semibold"
              >
                <MdOutlineThumbUp size={20} />
                <span className="text-sm font-medium">
                  {t("button.check")}
                </span>
              </button>
            </div>
 
            <p className="mt-2 text-xs text-gray-500">
              {t("scheduler.manualpathnote")} {/* 🔴 ADD TO JSON */}
            </p>
          </div>
 
          {/* Structure */}
          <div>
            <label className="mb-1 block text-gray-600 text-xs font-semibold">
              {t("scheduler.filesettings")} <span className="text-red-500">*</span>
            </label>
            <div className="w-80">
              <AnimatedDropdown
                value={fileSettings}
                options={["Original", "File Only"]}
                required
                showError={structureError}
                allowFreeInput
                onChange={(e) => {
                  setFileSettings(e.target.value);
                  setStructureError(false);
                }}
              />
            </div>
          </div>
 
        </div>
      </div>
 
      {showErrorDialog && (
        <Errordialog
          type="error"
          message={errorMessage}
          onClose={() => setShowErrorDialog(false)}
        />
      )}
    </div>
  );
}
 
/* Toggle */
function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs">{label}</span>
      <button onClick={onChange} className="relative h-5 w-10 rounded-full border">
        <span
          className={`absolute top-[1px] h-4 w-4 rounded-full transition ${
            checked ? "left-5 bg-blue-400" : "left-1 bg-gray-400"
          }`}
        />
      </button>
    </div>
  );
}
 
 