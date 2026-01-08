import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../../Layout/Common/AnimatedDropdown";
import { IoIosSettings } from "react-icons/io";
import { useTranslation } from "react-i18next";
import CommunicationSettingsModal from "./CommunicationSettingsModal";
import useAxios from "../../../../../../Services/servicecall";
import { CF_decrypt } from "../../../../../Common/encryptiondecryption";
import AuditTrail from "../../../../../Layout/Common/AuditTrail"; 
import Errordialog from "../../../../../Layout/Common/Errordialog";

const AddInstrumentModal = ({
  isOpen,
  onClose,
  onSave,
  mode = "add",
  initialData = null,
}) => {
  const { t } = useTranslation();
  const [showCommSettings, setShowCommSettings] = useState(false);
  const { postData } = useAxios();

  const [availableLicense, setAvailableLicense] = useState(0);
  const [parserOptions, setParserOptions] = useState([]);
  const [interfacerOptions, setInterfacerOptions] = useState([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
const [pendingForm, setPendingForm] = useState(null);
const [showInterfacerWarning, setShowInterfacerWarning] = useState(false);
const [originalInterfacerMapped, setOriginalInterfacerMapped] = useState(false);




  const isAddMode = mode === "add";
  const isEditMode = mode === "edit";
  const hasInsufficientLicense = isAddMode && availableLicense < 1;

  const PARSER_ORDER_MAP = {
    0: { label: t("masters.none"), value: t("masters.none")},
    1: { label: t("masters.winmethod"), value: t("masters.winmethod") },
    2: { label: t("masters.webmethod"), value: t("masters.webmethod") },
  };
  const LOCK_TYPE_OPTIONS = [
    { label: t("masters.automatic"), value: "A" },
    { label: t("masters.manual"), value: "M" },
  ];

  const nodeRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);

  const initialForm = {
    instrumentCode: "",
    instrumentAlias: "",
    instrumentModel: "",
    instrumentMake: "",
    lockType: "A",
    parserType: "NONE",
    automatic: false,
    interfacerMapped: false,
    interfacerInstrument: -2,
    active: false,
  };

  const [form, setForm] = useState(initialForm);
const showParserInterfacerMsg =
  submitted &&
  (form.parserType === "WIN_METHOD" ||
    form.parserType === "WEB_METHOD") &&
  !form.interfacerMapped;



const [commData, setCommData] = useState(null);

const handleCommSubmit = (data) => {
  setCommData(data);
  setShowAuditTrail(true); // ✅ OPEN AUDIT TRAIL
};

  useEffect(() => {
    if (!isOpen) return;
    const getSessionValue = (key) => {
      const value = sessionStorage.getItem(key);

      // ✅ 1. key missing
      if (!value) return "";

      // ✅ 2. already plain text (NOT encrypted)
      if (!value.includes("=") && value.length < 40) {
        return value;
      }

      // ✅ 3. encrypted value
      try {
        return CF_decrypt(value);
      } catch (e) {
        console.warn(`Decrypt skipped for ${key}`);
        return value;
      }
    };
    const buildDropdownRequest = () => ({
      ActiveUserDetails: {
        sUserDomainName: getSessionValue("sDomainName"),
        sSessionID: getSessionValue("sSessionID"),
        sUserID: getSessionValue("sUserID"),
        sTimeZoneID: getSessionValue("sTimeZoneID") + "<~>true",
        sApplicationName: "SDMS",
        sdbtype: getSessionValue("sdbtype"),
        sUsername: getSessionValue("sUsername"),
        sSiteCode: getSessionValue("sSiteCode"),
        sCategories: getSessionValue("sCategories"),
        sUserGroupID: getSessionValue("sUserGroupID"),
        sUserStatus: "",
        sTenantID: "",
      },
      sInstrumentID: "",
      ApplicationCode: "SDMS",
    });

    const loadDropdowns = async () => {
      try {
        const res = await postData(
          "basemaster/getMapInstrumentBasedDataFillValues",
          buildDropdownRequest()
        );

        // ✅ Available license
        setAvailableLicense(res.AvailableLicense || 0);
        // ✅ Parser Type dropdown (from Feature)
        if (Array.isArray(res.Feature)) {
  const options = [
    PARSER_ORDER_MAP[0], // 👈 NONE always
  ];

  const interfacerFeature = res.Feature.find(
    (f) => f.L67Enum === "INTERFACER_SETTINGS"
  );

  const webMethodFeature = res.Feature.find(
    (f) => f.L67Enum === "WEBMETHOD_INTERFACER"
  );

  const dbType = getSessionValue("sdbtype")?.toLowerCase();

  // ✅ MSSQL → allow both if enabled
  if (dbType === "mssql") {
    if (interfacerFeature?.L67Status === true) {
      options.push(PARSER_ORDER_MAP[1]); // WIN_METHOD
    }

    if (webMethodFeature?.L67Status === true) {
      options.push(PARSER_ORDER_MAP[2]); // WEB_METHOD
    }
  }

  // ✅ POSTGRES → ONLY WIN_METHOD if enabledPOSTGRESQL
  else if (dbType === "postgresql") {
    if (interfacerFeature?.L67Status === true) {
      options.push(PARSER_ORDER_MAP[1]); // WIN_METHOD only
    }
  }

  setParserOptions(options);
}


        // ✅ Interfacer Instrument dropdown
        if (Array.isArray(res.InterfacerInstrument)) {
          const interfacerList = res.InterfacerInstrument.map((item) => ({
            label: item.InstrumentName, // what user sees
            value: item.INSTRUMENTID, // what you store
          }));

          setInterfacerOptions([
            { label: "Create New", value: -2 }, // 👈 mandatory
            ...interfacerList,
          ]);
        }
      } catch (err) {
        console.error("Dropdown load failed", err);
      }
    };

    loadDropdowns();
  }, [isOpen]);

  // ✅ preload data for EDIT
 useEffect(() => {
  if (!isOpen || mode !== "edit" || !initialData?.Instrument) return;

  const inst = initialData.Instrument;
  const isMapped = inst.iInterfaceStatus === 1;

  setForm({
    instrumentCode: inst.sInstrumentName || "",
    instrumentAlias: inst.sInstrumentAliasName || "",
    instrumentModel: inst.sInstrumentModel || "",
    instrumentMake: inst.sInstrumentMake || "",
    lockType: inst.sLockType || "A",
    parserType:
      inst.iL11ParserType === 1
        ? "WIN_METHOD"
        : inst.iL11ParserType === 2
        ? "WEB_METHOD"
        : "NONE",
    interfacerMapped: isMapped,
    interfacerInstrument: initialData.iInterfacerInstID ?? -2,
    active: Number(inst.iInstrumentStatus) === 1,
  });

  // 🔥 STORE ORIGINAL STATE
  setOriginalInterfacerMapped(isMapped);

  setSubmitted(false);
}, [isOpen, mode, initialData]);



const handleSubmit = () => {
  setSubmitted(true);

  if (!isSubmitValid()) return;

  const isParserNeedsInterfacer =
    (form.parserType === "WIN_METHOD" ||
      form.parserType === "WEB_METHOD") &&
    !form.interfacerMapped;

  // 🚫 BLOCK audit trail popup
  if (isParserNeedsInterfacer) {
    return;
  }

  setPendingForm(form);
  setShowAuditTrail(true);
};

const buildInsertInstrumentPayload = (
  finalPayload,
  auditPayload
) => {
  return {
    Instrument: {
      sInstrumentName: finalPayload.instrumentCode,
      sInstrumentAliasName: finalPayload.instrumentAlias,
      sInstrumentModel: finalPayload.instrumentModel || "",
      sInstrumentMake: finalPayload.instrumentMake || "",
      sLockType: finalPayload.lockType,

      // 🔥 MUST BE NUMBER
      iL11ParserType:
        finalPayload.parserType === "WIN_METHOD"
          ? 1
          : finalPayload.parserType === "WEB_METHOD"
          ? 2
          : 0,

      // 🔥 MUST BE NUMBER
      iInterfaceStatus: finalPayload.interfacerMapped ? 1 : 0,

      // 🔥 MUST BE NUMBER
      iInstrumentStatus: finalPayload.active ? 1 : 0,

      sInstrumentID: "",
    },

    // 🔥 REQUIRED
    sActionType: "Insert_Normal_Instrument",

    ActiveUserDetails: {
      sUserDomainName: CF_decrypt(sessionStorage.getItem("sDomainName")),
      sSessionID: CF_decrypt(sessionStorage.getItem("sSessionID")),
      sUserID: CF_decrypt(sessionStorage.getItem("sUserID")),
      sTimeZoneID:
        CF_decrypt(sessionStorage.getItem("sTimeZoneID")) + "<~>true",
      sApplicationName: "SDMS",
      sdbtype: CF_decrypt(sessionStorage.getItem("sdbtype")),
      sUsername: CF_decrypt(sessionStorage.getItem("sUsername")),
      sSiteCode: CF_decrypt(sessionStorage.getItem("sSiteCode")),
      sCategories: CF_decrypt(sessionStorage.getItem("sCategories")),
      sUserGroupID: CF_decrypt(sessionStorage.getItem("sUserGroupID")),
      sUserStatus: "",
      sTenantID: "",
    },

    ApplicationCode: "SDMS",
  };
};
const buildEditInstrumentPayload = (
  finalPayload,
  auditPayload,
  initialData
) => {
  return {
    Instrument: {
      sInstrumentID: initialData?.Instrument?.sInstrumentID,
      sInstrumentName: finalPayload.instrumentCode,
      sInstrumentAliasName: finalPayload.instrumentAlias,
      sInstrumentModel: finalPayload.instrumentModel || "",
      sInstrumentMake: finalPayload.instrumentMake || "",
      sLockType: finalPayload.lockType,

      iL11ParserType:
        finalPayload.parserType === "WIN_METHOD"
          ? 1
          : finalPayload.parserType === "WEB_METHOD"
          ? 2
          : 0,

      iInterfaceStatus: finalPayload.interfacerMapped ? 1 : 0,
      iInstrumentStatus: finalPayload.active ? 1 : 0,
    },

    AuditTrailValues: auditPayload.AuditTrailValues,
    ActiveUserDetails: {
      sUserDomainName: CF_decrypt(sessionStorage.getItem("sDomainName")),
      sSessionID: CF_decrypt(sessionStorage.getItem("sSessionID")),
      sUserID: CF_decrypt(sessionStorage.getItem("sUserID")),
      sTimeZoneID:
        CF_decrypt(sessionStorage.getItem("sTimeZoneID")) + "<~>true",
      sApplicationName: "SDMS",
      sdbtype: CF_decrypt(sessionStorage.getItem("sdbtype")),
      sUsername: CF_decrypt(sessionStorage.getItem("sUsername")),
      sSiteCode: CF_decrypt(sessionStorage.getItem("sSiteCode")),
      sCategories: CF_decrypt(sessionStorage.getItem("sCategories")),
      sUserGroupID: CF_decrypt(sessionStorage.getItem("sUserGroupID")),
      sUserStatus: "",
      sTenantID: "",
    },

    ApplicationCode: "SDMS",
  };
};


const handleAuditAuthorized = async (auditPayload) => {
  try {
    const finalPayload = {
      ...pendingForm,          // instrument data
      CommunicationSettings: commData, // ✅ comm data
      AuditTrailValues: auditPayload.AuditTrailValues,
    };
    const response = isEditMode
  ? await postData(
      "basemaster/editInstrument",
      buildEditInstrumentPayload(finalPayload, auditPayload, initialData)
    )
  : await postData(
      "basemaster/insertInstrument",
      buildInsertInstrumentPayload(finalPayload, auditPayload)
    );
console.log("Insert/Edit Instrument request",buildEditInstrumentPayload(finalPayload, auditPayload, initialData) );




if (response?.Rtn !== "Success") {
  throw new Error("Insert Instrument failed");
}


await onSave({
  sInstrumentID: finalPayload.instrumentCode, // fallback
  sInstrumentName: finalPayload.instrumentAlias,
});


    // cleanup
    setShowCommSettings(false);
    setShowAuditTrail(false);
    setPendingForm(null);
    setCommData(null);
    setForm(initialForm);
    setSubmitted(false);
    onClose();
  } catch (err) {
    console.error("Save failed", err);
  }
};
const confirmUnmapInterfacer = () => {
  setForm((prev) => ({
    ...prev,
    interfacerMapped: false,
    interfacerInstrument: "",
  }));

  setShowInterfacerWarning(false);
};




  // Submit validation (ONLY 2 fields)
  const isSubmitValid = () => {
    return form.instrumentCode.trim() && form.instrumentAlias.trim();
  };

  // Communication Settings validation (4 fields)
  const isCommSettingsValid = () => {
    return (
      form.instrumentCode.trim() &&
      form.instrumentAlias.trim() &&
      form.instrumentModel.trim() &&
      form.instrumentMake.trim()
    );
  };

  if (!isOpen) return null;
  

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
        <Draggable nodeRef={nodeRef} handle=".modal-header" bounds="parent">
          <div
            ref={nodeRef}
            className="bg-white w-[600px] max-h-[99vh] rounded-lg shadow-lg flex flex-col  animate-slideFromTop"
          >
            {/* HEADER */}
            <div className="modal-header cursor-move flex justify-between px-4 py-2 bg-slate-100 border-b rounded-t-lg">
              <label
                className="text-[#0e5bca] text-[18px]"
                style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
              >
                {mode === "edit"
                  ? t("masters.editInstrument")
                  : t("masters.addInstrument")}
              </label>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                  onClose();
                }}
                className="text-gray-400 text-xl"
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="px-4 py-4 overflow-y-auto flex-1">
                {/* License Info */}
{(availableLicense > 0 || isAddMode) && (
  <label
    className={`block text-center text-[12px] font-bold font-roboto ${
      availableLicense > 0 ? "text-green-700" : "text-[#ff0000]"
    }`}
  >
    {availableLicense > 0
      ? `${t("masters.availableLicense")}: ${availableLicense}`
      : isAddMode
      ? "Insufficient License to create instrument"
      : ""}
  </label>
)}

              <div className="space-y-7 w-[340px]">
                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.instrumentCode")}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instrumentCode"
                    value={form.instrumentCode}
                    onChange={(e) =>
                      setForm({ ...form, instrumentCode: e.target.value })
                    }
                    className={`
    w-full bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
      border-b-2 
    ${submitted && !form.instrumentCode ? "border-red-500" : "border-gray-300"}

    focus:border-blue-500
  `}
                  />
                </div>

                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.instrumentAlias")}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instrumentAlias"
                    value={form.instrumentAlias}
                    onChange={(e) =>
                      setForm({ ...form, instrumentAlias: e.target.value })
                    }
                    className={`
    w-full bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
      border-b-2 
  ${submitted && !form.instrumentAlias ? "border-red-500" : "border-gray-300"}

    focus:border-blue-500
  `}
                  />
                </div>

                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.instrumentModel")}
                    {form.interfacerMapped && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  <input
                    type="text"
                    name="instrumentModel"
                    value={form.instrumentModel}
                    onChange={(e) =>
                      setForm({ ...form, instrumentModel: e.target.value })
                    }
                    className={`
  w-full bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
      border-b-2 
 ${
   submitted && form.interfacerMapped && !form.instrumentModel
     ? "border-red-500"
     : "border-gray-300"
 }

  focus:border-blue-500
`}
                  />
                </div>

                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.instrumentMake")}
                    {form.interfacerMapped && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  <input
                    type="text"
                    name="instrumentMake"
                    value={form.instrumentMake}
                    onChange={(e) =>
                      setForm({ ...form, instrumentMake: e.target.value })
                    }
                    className={`
 w-full bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
      border-b-2 
${
  submitted && form.interfacerMapped && !form.instrumentMake
    ? "border-red-500"
    : "border-gray-300"
}

  focus:border-blue-500
`}
                  />
                </div>

                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.lockType")}
                    <span className="text-red-500">*</span>
                  </label>
                  <AnimatedDropdown
                    name="lockType"
                    value={form.lockType}
                    options={LOCK_TYPE_OPTIONS}
                    displayKey="label"
                    valueKey="value"
                    onChange={(e) =>
                      setForm({ ...form, lockType: e.target.value })
                    }
                    required
                    showError={submitted}
                  />
                </div>

                <div>
  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
    {t("masters.parserType")}
    <span className="text-red-500">*</span>
  </label>

  <AnimatedDropdown
    name="parserType"
    value={form.parserType}
    options={parserOptions}
    displayKey="label"
    valueKey="value"
    onChange={(e) =>
      setForm({ ...form, parserType: e.target.value })
    }
    required
    showError={submitted}
  />

  {showParserInterfacerMsg && (
  <div className=" text-[11px] text-red-600 font-roboto">
    {t("masters.selectInterfacerMessage") ||
      "Enabled the InterFACER Mapped."}
  </div>
)}

</div>


                {/* Checkboxes */}
                <div className="flex gap-8">
                  <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.interfacerMapped")}
                    <input
  type="checkbox"
  checked={form.interfacerMapped}
  onChange={(e) => {
    const checked = e.target.checked;

    // ✅ EDIT MODE + was originally checked + user tries to uncheck
    if (
      isEditMode &&
      originalInterfacerMapped &&
      !checked
    ) {
      setShowInterfacerWarning(true);
      return;
    }

    // normal behavior
    setForm({
      ...form,
      interfacerMapped: checked,
      interfacerInstrument: checked ? -2 : "",
    });
  }}
/>

                  </label>

                  <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
  {t("statuses.active")}
  <input
  type="checkbox"
  checked={form.active}   // 👈 THIS is mandatory
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      active: e.target.checked,
    }))
  }
/>

</label>

                </div>

                {form.interfacerMapped && (
                  <div>
                    <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                      {t("masters.interfacerInstrument")}
                      <span className="text-red-500">*</span>
                    </label>
                    <AnimatedDropdown
                      name="interfacerInstrument"
                      value={form.interfacerInstrument}
                      options={interfacerOptions}
                      displayKey="label"
                      valueKey="value"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          interfacerInstrument: e.target.value,
                        })
                      }
                      required
                      showError={submitted}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              {form.interfacerMapped && (
                <button
                  onClick={() => {
                    setSubmitted(true);

                    if (!isCommSettingsValid()) return;
                    setPendingForm(form);  

                    setShowCommSettings(true);
                  }}
                  className="flex items-center gap-1 px-[12px] py-[6px] rounded text-[11px] font-bold shadow-sm bg-[#2883fe] text-white"
                >
                  <IoIosSettings className="w-4 h-4" />
                  {t("masters.communicationSettings")}
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={form.interfacerMapped || hasInsufficientLicense}
                className={`flex items-center gap-1 px-[12px] text-white py-[6px] rounded text-[11px] font-bold shadow-sm ${
                  form.interfacerMapped || hasInsufficientLicense
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-[#2883fe]"
                }`}
              >
                <FiCheckSquare className="w-4 h-4"/>
                {t("button.submit")}
              </button>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                  onClose();
                }}
                className="border px-[12px] py-[6px] rounded text-[11px] text-[#8092a4] font-bold"
              >
                {t("button.close")}
              </button>
            </div>
          </div>
        </Draggable>
      </div>
      <CommunicationSettingsModal
  isOpen={showCommSettings}
  interfacerInstrument={form.interfacerInstrument}
  instrumentData={pendingForm}      // ✅ pass instrument data
  onSubmit={handleCommSubmit}        // ✅ receive comm submit
  onClose={() => setShowCommSettings(false)}
/>

      <AuditTrail
  isOpen={showAuditTrail}
  onClose={() => setShowAuditTrail(false)}
  onAuthorized={handleAuditAuthorized}
  actionLabel={mode === "edit" ? "Update" : "Submit"}
/>
{showInterfacerWarning && (
  <Errordialog
    type="warning"
    message="Changes in interfacer instrument , AgaramInterfacer Services will restart. Do you want to continue?"
    onClose={confirmUnmapInterfacer}
  />
)}


    </>
  );
};

export default AddInstrumentModal;
