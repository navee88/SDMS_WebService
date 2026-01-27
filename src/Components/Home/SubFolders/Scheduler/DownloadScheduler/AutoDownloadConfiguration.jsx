import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../Layout/Common/Errordialog";
import { MdOutlineThumbUp } from "react-icons/md";
import { BsCheck2Square } from "react-icons/bs";
import { useDownloadScheduler } from "../../../../../Context/DownloadSchedulerContext";
import useAxios from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import ClientServerCheckModal from "./ClientServerCheckModal";
import AuditTrail from "../../../../Layout/Common/AuditTrail"
import FullPageLoader from "../../../../Layout/Common/FullPageLoader";



export default function AutoDownloadConfiguration() {
  const { t } = useTranslation();
  const { postData } = useAxios(); // Add useAxios hook
  const didLoadRef = useRef(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const {
    autoConfigData,
    setActiveTabIndex,
    setAutoConfigData,
    openedFromView,
    setOpenedFromView,
  } = useDownloadScheduler();

  const [pathType, setPathType] = useState("LOCAL"); // LOCAL | UNC
  const isUNC = pathType === "UNC";
  const [showCheckModal, setShowCheckModal] = useState(false);

  // 🔹 Form values
  const [instrumentId, setInstrumentId] = useState("");
const [instrumentOptions, setInstrumentOptions] = useState([]);

  const [clientId, setClientId] = useState("");
const [clientOptions, setClientOptions] = useState([]);

  const [downloadPath, setDownloadPath] = useState("");
  const [structureType, setStructureType] = useState("");
  const [filter, setFilter] = useState("*.*,");
  const [sourcePath, setSourcePath] = useState("");
  const [sourcePathOptions, setSourcePathOptions] = useState([]);

  const [username, setUsername] = useState("");
  const [fileSettingsId, setFileSettingsId] = useState("");

  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");

  // 🔹 Loading states
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // 🔹 Dialog states
 const [dialog, setDialog] = useState({
  open: false,
  type: "",      // "Warning" | "Success" | "Error"
  message: ""
});


  // 🔹 Error states
  const [instrumentError, setInstrumentError] = useState(false);
  const [clientError, setClientError] = useState(false);
  const [pathError, setPathError] = useState(false);
  const [structureError, setStructureError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
const [passwordError, setPasswordError] = useState(false);
const [domainError, setDomainError] = useState(false);
const [domainOptions, setDomainOptions] = useState([]);

  const isReadOnlyUNC = openedFromView && isUNC;
  const [scheduleId, setScheduleId] = useState("");
const [taskId, setTaskId] = useState("");



  const downloadTypeOptions = [
  { label: "Original", value: "O" },
  { label: "File Only", value: "F" }
];
const selectedClient = clientOptions.find(
  opt => opt.value === clientId
);

  const resetForm = () => {
  setInstrumentId("");
  setClientId("");
  setDownloadPath("");
  setStructureType("");
  setFilter("*.*,");
  setSourcePath("");
  setUsername("");
  setPassword("");
  setDomain("");
  setFileSettingsId("");
  setPathType("LOCAL");

  setInstrumentError(false);
  setClientError(false);
  setPathError(false);
  setStructureError(false);
};


  useEffect(() => {
    // If user did NOT come from View, ensure Close button is hidden
    if (!openedFromView) {
      setOpenedFromView(false);
    }
  }, [openedFromView, setOpenedFromView]);
    const loadInstruments = async () => {
    const res = await postData(
      "Scheduler/DownloadSchedulerinstrumentload",
      {
        ...CF_activeUserdetails()
      }
    );

    const options = res.map(item => ({
      label: item.L11InstrumentName.trim(),
      value: item.L11InstrumentID
    }));

    setInstrumentOptions(options);
  };
   const loadClients = async () => {
    const res = await postData(
      "Scheduler/DownloadSchedulerclientload",
      {
        ...CF_activeUserdetails()
      }
    );

    const options = res.map(item => ({
      label: item.L06ClientName.trim(),
      value: item.L06ClientID
    }));

    setClientOptions(options);
  };
   const loadDomains = async () => {
    const res = await postData(
      "Scheduler/DataSchedulerDomainCombo",
      {
        ...CF_activeUserdetails(),
        ApplicationCode: "SDMS"
      }
    );

    const options = res.map(item => ({
      label: item.L03DomainName,
      value: item.L03DomainID
    }));

    setDomainOptions(options);
  };
useEffect(() => {
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setLoadingText(t("common.loading")); // or "Loading..."

      await Promise.all([
        loadInstruments(),
        loadClients(),
        loadDomains()
      ]);

    } catch (error) {
      console.error("❌ Initial load failed", error);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  loadInitialData();
}, []);

useEffect(() => {
  if (!instrumentId) {
    setSourcePathOptions([]);
    setSourcePath("");
    return;
  }

  const loadSourcePaths = async () => {
    try {
      setLoading(true);
      setLoadingText(t("common.loading")); // or "Loading source paths..."

      const res = await postData(
        "Scheduler/DownloadSchedulerSourcepathload",
        {
          ...CF_activeUserdetails(),
          sInstrumentID: instrumentId
        }
      );

      const options = res.map(item => ({
        label: item.L52TaskSourcePath,
        value: item.ScheduleID
      }));

      setSourcePathOptions(options);

      // ❌ do not auto select
      

    } catch (err) {
      console.error("❌ Source path load failed", err);
      setSourcePathOptions([]);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  loadSourcePaths();
}, [instrumentId]);





  useEffect(() => {
    if (!autoConfigData) return;

    setInstrumentId(autoConfigData.instrument ?? "");
    setClientId(autoConfigData.clientName ?? "");
    setDownloadPath(autoConfigData.downloadPath ?? "");
    setFilter(autoConfigData.filter ?? "");
    setSourcePath(autoConfigData.sourcepath ?? "");
    setUsername(autoConfigData.username ?? "");
    setPassword(autoConfigData.password ?? "");
    setFileSettingsId(autoConfigData.filesettings ?? "");

    setDomain(autoConfigData.domain ?? "");
    setPathType(autoConfigData.uncStatus ? "UNC" : "LOCAL");

    console.log("Auto Config Data Loaded:", autoConfigData);
  }, [autoConfigData]);

const handleSave = () => {

  let hasError = false;

  if (!instrumentId) {
    setInstrumentError(true);
    hasError = true;
  }

  if (!clientId) {
    setClientError(true);
    hasError = true;
  }

  if (!downloadPath.trim()) {
    setPathError(true);
    hasError = true;
  } else if (!isValidWindowsPath(downloadPath, pathType)) {
    setPathError(true);
    hasError = true;
  }

  if (!fileSettingsId) {
    setStructureError(true);
    hasError = true;
  }

  if (pathType === "UNC") {
    if (!username.trim()) {
      setUsernameError(true);
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
    }
    if (!domain) {
      setDomainError(true);
      hasError = true;
    }
  }

   if (hasError) {
  setDialog({
    open: true,
    type: "Warning",
    message: t("errormsg.incompletedatafields")
  });
  return;
}

// 🔥 CLEAR OLD ERRORS
setInstrumentError(false);
setClientError(false);
setPathError(false);
setStructureError(false);
setUsernameError(false);
setPasswordError(false);
setDomainError(false);

// ✅ THEN open audit
setShowAuditTrail(true);

};


const handleAuditSubmit = async (auditPayload) => {
  try {
    setLoading(true);
    setLoadingText(t("common.loading"));

    const isUNCPath = pathType === "UNC";

   const savePayload = {
  process: "save",

  L101ScheduleID: scheduleId, // ✅ from source path
  L101TaskID: taskId,         // ✅ from source path

  L101TaskStatus: "D",
  L101TaskCompleted: 0,
  L101TaskStart: 0,
  L101TaskEnd: 1,

  L101TaskDownloadPath: downloadPath,
  L101UNCStatus: isUNCPath ? 1 : 0,
  L101StructureType: fileSettingsId,
  L101ClientID: clientId.trim(),
  L101TaskFilter: filter,

  L101UNCUserName: isUNCPath ? username : "",
  L101UNCPassword: isUNCPath ? password : "",
  L101UNCDomain: isUNCPath ? domain : "",

  L101SiteCode: CF_activeUserdetails().ActiveUserDetails.sSiteCode,
  bExist: false,

  ...auditPayload,
  ...CF_activeUserdetails()
};

    console.log("📦 Save Payload:", savePayload);

    const response = await postData(
      "Scheduler/DownloadschedulerSave",
      savePayload
    );
    setDialog({
  open: true,
  type: "success",
  message: response?.rtnstring || t("common.savedSuccessfully")
});

    

    // ✅ CLOSE AUDIT
    setShowAuditTrail(false);

resetForm();
  } catch (error) {
    console.error("❌ Save failed:", error);

    setDialog({
  open: true,
  type: "Error",
  message: error?.message || t("common.saveFailed")
});

  } finally {
    setLoading(false);
    setLoadingText("");
  }
};



  const handleCheck = () => {
    let hasError = false;
    
  setPathError(false);
    if (!clientId.trim()) {
      setClientError(true);
      hasError = true;
    }
    if (!downloadPath.trim()) {
      setPathError(true);
      hasError = true;
    }
    if (!downloadPath.trim()) {
  setPathError(true);
  hasError = true;
} else if (!isValidWindowsPath(downloadPath, pathType)) {
  setPathError(true);
  hasError = true;
}


    if (hasError) return;
    
    // Open the check modal instead of closing it
    setShowCheckModal(true);
  };
const isValidWindowsPath = (path, pathType) => {
  if (!path) return false;

  const trimmed = path.trim();

  // LOCAL path: C:\Folder\SubFolder
  const localPathRegex = /^[a-zA-Z]:\\(?:[^<>:"/\\|?*\r\n]+\\?)*$/;

  // UNC path: \\SERVER\Share or \\SERVER\Share\Folder
  const uncPathRegex = /^\\\\[^<>:"/\\|?*\r\n]+\\[^<>:"/\\|?*\r\n]+(\\[^<>:"/\\|?*\r\n]+)*$/;

  return pathType === "UNC"
    ? uncPathRegex.test(trimmed)
    : localPathRegex.test(trimmed);
};





  const handlePathTypeChange = (type) => {
    setPathType(type);
    
  setPathError(false);
    // 🔑 clear ONLY when user switches to LOCAL
    if (type === "LOCAL") {
      setUsername("");
      setPassword("");
    }
  };

  // Handle check modal submission
const handleCheckSubmit = async (payload) => {
  try {
    setLoading(true);
    setLoadingText(t("common.loading"));

    let response;

    // 🔹 SERVER PATH CHECK
    if (payload.type === "server") {
      const payload={
          path: downloadPath,
          ...CF_activeUserdetails()
        }
        console.log("payload", payload)
      response = await postData(
        "Scheduler/PathChecking",
        payload
      );
    }

    // 🔹 CLIENT PATH CHECK
    if (payload.type === "client") {
      const payloadrequst={
          path: downloadPath,
          pathreference: pathType === "UNC" ? "unc" : "local",
          sclientname: selectedClient?.label,
          sclientusername: payload.clientUserName,
          sclientpassword: payload.clientPassword,
          ...CF_activeUserdetails()
        }
        console.log("payloadrequst", payloadrequst)
      response = await postData(
        "Scheduler/ClientPathChecking",
        payloadrequst
      );
    }

    return response; 

  } catch (error) {
    console.error("❌ Path check failed:", error);
    return {
      Rtn: "Failure",
      Message: t("scheduler.checkError") || "Path check failed"
    };
  } finally {
    setLoading(false);
    setLoadingText("");
  }
};


  return (
    <div className="bg-white p-8 pt-4">
      {/* Save Button */}
      <div className="flex justify-end">
        {openedFromView ? (
          <button
            onClick={() => {
              resetForm();
              setAutoConfigData(null);
              setOpenedFromView(false);
              setActiveTabIndex(1); // back to View
            }}
            className="flex items-center mb-4 gap-2 rounded border px-3 py-1.5 text-[11px]"
          >
            {t("button.close")}
          </button>
        ) : (
          <button
  onClick={handleSave}
  disabled={showAuditTrail}
  className={`flex items-center mb-4 gap-2 rounded px-3 py-1.5
    ${showAuditTrail ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"}
    text-white font-semibold`}
>

            <BsCheck2Square size={18} />
            <span className="text-xs font-medium">
              {t("button.save")}
            </span>
          </button>
        )}
      </div>

      <div className="max-w-4xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Source */}
          <div>
            <h2 className="mb-2 text-[14px] font-bold text-[#0049b0] font-roboto">
              {t("scheduler.source")}
            </h2>

            <label className="mb-1 text-[#405f7d] text-[12px] font-semibold font-roboto">
              {t("label.instrument")} <span className="text-red-500">*</span>
            </label>

            <div className="w-80">
             <AnimatedDropdown
  value={instrumentId}
  options={instrumentOptions}
  required
  showError={instrumentError}
  allowFreeInput
  onChange={(e) => {
    const newInstrumentId = e.target.value;

    setInstrumentId(newInstrumentId);
    setInstrumentError(false);

    // 🔥 RESET dependent field
    setSourcePath("");
    setSourcePathOptions([]);
  }}
/>



            </div>
          </div>

          {/* UNC Credentials */}
          <div>
            <h2 className="mb-2 text-[14px] font-bold text-[#0049b0] font-roboto">
              {t("scheduler.unccredentials")}
            </h2>

            <div className="grid grid-cols-2 gap-2 max-w-md">
              {/* Username */}
              <div>
                <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
                  {t("label.userName")}
                </label>
              <input
  value={username}
  onChange={(e) => {
    if (isReadOnlyUNC) return;
    setUsername(e.target.value);
    setUsernameError(false);
  }}
  disabled={!isUNC || isReadOnlyUNC}
  className={`w-full border-b text-xs font-semibold
    focus:outline-none
    ${usernameError ? "border-red-500" : "border-gray-400 focus:border-blue-500"}
    disabled:bg-gray-100 disabled:cursor-not-allowed`}
/>


              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
                  {t("login.password")}
                </label>
               <input
  type="password"
  value={password}
  onChange={(e) => {
    if (isReadOnlyUNC) return;
    setPassword(e.target.value);
    setPasswordError(false);
  }}
  disabled={!isUNC || isReadOnlyUNC}
  className={`w-full border-b text-xs
    focus:outline-none
    ${passwordError ? "border-red-500" : "border-gray-400 focus:border-blue-500"}
    disabled:bg-gray-100 disabled:cursor-not-allowed`}
/>


              </div>
            </div>
          </div>

          {/* Schedule Path */}
          <div>
            <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
              {t("scheduler.sourcepath")} <span className="text-red-500">*</span>
            </label>
            <div className="w-80">
              <AnimatedDropdown
  value={sourcePath}
  options={sourcePathOptions}
  allowFreeInput
  onChange={(e) => {
    const selectedValue = e.target.value; // "TS2:T2"

    setSourcePath(selectedValue);

    if (selectedValue && selectedValue.includes(":")) {
      const [schId, tId] = selectedValue.split(":");

      setScheduleId(schId); // TS2
      setTaskId(tId);       // T2
    } else {
      setScheduleId("");
      setTaskId("");
    }
  }}
/>


            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
              {t("label.domain")}
            </label>
            <div className="w-80">
              <AnimatedDropdown
  disabled={!isUNC || isReadOnlyUNC}
  value={domain}
  options={domainOptions}
  required={isUNC && !isReadOnlyUNC}
  showError={domainError}
  allowFreeInput
  onChange={(e) => {
    if (isReadOnlyUNC) return;
    setDomain(e.target.value);
    setDomainError(false);
  }}
/>



            </div>
          </div>

          {/* Download */}
          <div>
            <h2 className="mb-4 text-[14px] font-bold text-[#0049b0] font-roboto">
              {t("scheduler.download")}
            </h2>

            <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
              {t("label.clientName")} <span className="text-red-500">*</span>
            </label>

            <div className="w-80">
              <AnimatedDropdown
  value={clientId}                 // ✅ ID only
  options={clientOptions}          // ✅ from API
  required
  allowFreeInput
  showError={clientError}
  onChange={(e) => {
    setClientId(e.target.value);   // ✅ store ID
    setClientError(false);
  }}
/>

            </div>
          </div>

          {/* Filter */}
          <div className="w-80">
            <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
              {t("button.filter")}
            </label>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555] border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Toggle */}
          <div className="md:col-span-2 flex gap-8">
            <Toggle
              label={t("scheduler.localpath")}
              checked={pathType === "LOCAL"}
              onChange={() => handlePathTypeChange("LOCAL")}
            />
            <Toggle
              label={t("scheduler.uncpath")}
              checked={pathType === "UNC"}
              onChange={() => handlePathTypeChange("UNC")}
            />
          </div>

          {/* Download Path */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
              {t("scheduler.downloadpath")}
              <span className="text-red-500">*</span>
            </label>

            <div className="flex w-[420px] gap-4">
              <input
                value={downloadPath}
                onChange={(e) => {
                  setDownloadPath(e.target.value);
                  setPathError(false);
                }}
                className={`w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
                          ${pathError ? "border-red-500" : "border-gray-300 focus:border-blue-500"}`}
              />
              <div className="pl-4">
                <button
                  onClick={handleCheck}
                  className="flex items-center gap-2 rounded bg-[#f0f2f5] px-[12px] py-[6px] text-[#2883fe] font-roboto font-bold"
                >
                  <MdOutlineThumbUp size={16}/>
                  <span className="text-[11px] pt-[2px] font-medium">
                    {t("button.check")}
                  </span>
                </button>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-gray-500"style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
              {t("scheduler.manualpathnote")}
            </p>
          </div>

          {/* Structure */}
          <div>
            <label className="mb-1 block text-[#405f7d] text-[12px] font-semibold font-roboto">
              {t("scheduler.filesettings")} <span className="text-red-500">*</span>
            </label>
            <div className="w-80">
              <AnimatedDropdown
  value={fileSettingsId}          // 👈 O / F
  options={downloadTypeOptions}   // 👈 [{label,value}]
  required
  showError={structureError}
  allowFreeInput
  onChange={(e) => {
    setFileSettingsId(e.target.value); // 👈 O / F
    setStructureError(false);
  }}
/>


            </div>
          </div>
        </div>
      </div>


      {dialog.open && (
  <Errordialog
    type={dialog.type}
    message={dialog.message}
    onClose={() => {
      setDialog({ open: false, type: "", message: "" });
    }}
  />
)}



      {showCheckModal && (
        <ClientServerCheckModal
          isOpen={showCheckModal}
          onClose={() => setShowCheckModal(false)}
          onSubmit={handleCheckSubmit}
          clientName={selectedClient?.label}
          setLoading={setLoading}
          setLoadingText={setLoadingText}
        />
      )}
      {showAuditTrail && (
  <AuditTrail
    isOpen={showAuditTrail}
    onClose={() => setShowAuditTrail(false)}
    onAuthorized={handleAuditSubmit}
    actionLabel="Save"
  />
)}
      <FullPageLoader loading={loading} text={loadingText} />
    </div>
  );
}

/* Toggle */
function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#405f7d] text-[12px] font-semibold font-roboto">{label}</span>
      <button onClick={onChange} className="relative h-5 w-10 rounded-full border">
        <span
          className={`absolute top-[1px] h-4 w-4 rounded-full transition ${
            checked ? "left-5 bg-blue-500" : "left-1 bg-gray-400"
          }`}
        />
      </button>
    </div>
  );
}

