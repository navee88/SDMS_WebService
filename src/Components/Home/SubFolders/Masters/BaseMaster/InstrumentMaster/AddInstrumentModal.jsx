import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../../Layout/Common/AnimatedDropdown";
import { IoIosSettings } from "react-icons/io";
import { useTranslation } from "react-i18next";
import CommunicationSettingsModal from "./CommunicationSettingsModal";

const AddInstrumentModal = ({
  isOpen,
  onClose,
  onSave,
  mode = "add",
  initialData = null,
}) => {
  const { t } = useTranslation();
  const [showCommSettings, setShowCommSettings] = useState(false);

  const nodeRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);

  const initialForm = {
    instrumentCode: "",
    instrumentAlias: "",
    instrumentModel: "",
    instrumentMake: "",
    lockType: "Automatic",
    parserType: "NONE",
    automatic: false,
    interfacerMapped: false,
    interfacerInstrument: "CREATE_NEW",
    active: false,
  };

  const [form, setForm] = useState(initialForm);

  // ✅ preload data for EDIT
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        instrumentCode: initialData.instrumentcode || "",
        instrumentAlias: initialData.instrumentAlias || "",
        instrumentModel: initialData.instrumentModel || "",
        instrumentMake: initialData.instrumentMake || "",
        lockType: initialData.lockType || "",
        parserType: initialData.parserType || "NONE",
        interfacerMapped: false,
        interfacerInstrument: "",
        active: initialData.status === "Active",
      });
    }

    if (mode === "add") {
      setForm(initialForm);
    }
  }, [mode, initialData]);

  const handleSubmit = () => {
    setSubmitted(true);

    if (!isSubmitValid()) return;

    onSave(form);
    setForm(initialForm);
    setSubmitted(false);
    onClose();
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Draggable nodeRef={nodeRef} handle=".modal-header" bounds="parent">
        <div
          ref={nodeRef}
          className="bg-white w-[600px] max-h-[99vh] rounded shadow-lg flex flex-col  animate-slideFromTop"
        >
          {/* HEADER */}
          <div className="modal-header cursor-move flex justify-between px-4 py-2 bg-slate-100 border-b">
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
          <div className="px-4 py-4 rounded space-y-4 overflow-y-auto flex-1">
            <label className="block text-center text-green-700 text-[12px] font-bold font-roboto">
              {t("masters.availableLicense")}: 19
            </label>

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
    w-full px-1 py-1 text-sm outline-none
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
    w-full px-1 py-1 text-sm outline-none
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
  w-full px-1 py-1 text-sm outline-none border-b-2
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
  w-full px-1 py-1 text-sm outline-none border-b-2
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
                  options={["Automatic", "Manual"]}
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
                  options={[
                    { label: "NONE", value: "NONE" },
                    { label: "WIN_METHOD", value: "WIN_METHOD" },
                    { label: "WEB_METHOD", value: "WEB_METHOD" },

                  ]}
                  displayKey="label"
                  valueKey="value"
                  onChange={(e) =>
                    setForm({ ...form, parserType: e.target.value })
                  }
                  required
                  showError={submitted}
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-8">
                <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
                  {t("masters.interfacerMapped")}
                  <input
                    type="checkbox"
                    checked={form.interfacerMapped}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        interfacerMapped: e.target.checked,
                        interfacerInstrument: e.target.checked ? "CREATE_NEW" : "",

                      })
                    }
                  />
                </label>

                <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
                  {t("statuses.active")}
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.checked })
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
                    options={[
                      { label: "Create New", value: "CREATE_NEW" },
                      { label: "Roche Cobas 6800/8800", value: "INST_A" },
                      { label: "DiaSorin LIASION", value: "INST_B" },
                      { label: "Agaram Chromeleon", value: "INST_C" },
                    ]}
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
              disabled={form.interfacerMapped}
              className={`flex items-center gap-1 px-[12px] text-white py-[6px] rounded text-[11px] font-bold shadow-sm ${
                form.interfacerMapped
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-[#2883fe]"
              }`}
            >
              <FiCheckSquare className="w-4 h-4" />
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
        onClose={() => setShowCommSettings(false)}
      />
      </>
  );
};

export default AddInstrumentModal;
