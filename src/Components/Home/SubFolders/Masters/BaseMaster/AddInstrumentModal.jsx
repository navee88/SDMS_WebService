import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import { IoIosSettings } from "react-icons/io";
import { useTranslation } from "react-i18next";

const AddInstrumentModal = ({
  isOpen,
  onClose,
  onSave,
  mode = "add",
  initialData = null,
}) => {
  const { t } = useTranslation();
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
    interfacerInstrument: "",
    active: true,
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

    if (
      !form.instrumentCode ||
      !form.instrumentAlias ||
      !form.lockType ||
      !form.parserType
    ) {
      return;
    }

    onSave(form);
    setForm(initialForm);
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Draggable nodeRef={nodeRef} handle=".modal-header" bounds="parent">
        <div
          ref={nodeRef}
          className="bg-white w-[600px] max-h-[99vh] rounded shadow-lg flex flex-col"
        >
          {/* HEADER */}
          <div className="modal-header cursor-move flex justify-between px-4 py-2 bg-slate-100 border-b">
            <span className="text-[#0e5bca] text-[18px] font-semibold">
              {mode === "edit"
                ? t("masters.editInstrument")
                : t("masters.addInstrument")}
            </span>
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
          <div className="px-4 py-4 space-y-6 overflow-y-auto flex-1">
            <label className="block text-center text-green-700 text-[12px] font-bold font-roboto">
              {t("masters.availableLicense")}: 19
            </label>

            <div className="space-y-7 w-[300px]">
              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  {t("masters.instrumentCode")}
                  <span className="text-red-500">*</span>
                </label>
                <AnimatedDropdown
                  name="instrumentCode"
                  value={form.instrumentCode}
                  options={[]}
                  allowFreeInput
                  onChange={(e) =>
                    setForm({ ...form, instrumentCode: e.target.value })
                  }
                  required
                  showError={submitted}
                />
              </div>

              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  {t("masters.instrumentAlias")}
                  <span className="text-red-500">*</span>
                </label>
                <AnimatedDropdown
                  name="instrumentAlias"
                  value={form.instrumentAlias}
                  options={[]}
                  allowFreeInput
                  onChange={(e) =>
                    setForm({ ...form, instrumentAlias: e.target.value })
                  }
                  required
                  showError={submitted}
                />
              </div>

              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  {t("masters.instrumentModel")}
                </label>
                <AnimatedDropdown
                  name="instrumentModel"
                  value={form.instrumentModel}
                  options={[]}
                  allowFreeInput
                  onChange={(e) =>
                    setForm({ ...form, instrumentModel: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  {t("masters.instrumentMake")}
                </label>
                <AnimatedDropdown
                  name="instrumentMake"
                  value={form.instrumentMake}
                  options={[]}
                  allowFreeInput
                  onChange={(e) =>
                    setForm({ ...form, instrumentMake: e.target.value })
                  }
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
                  allowFreeInput
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
                    { label: "CSV", value: "CSV" },
                    { label: "XML", value: "XML" },
                    { label: "JSON", value: "JSON" },
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
                        interfacerInstrument: "",
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
                      { label: "Instrument A", value: "INST_A" },
                      { label: "Instrument B", value: "INST_B" },
                      { label: "Instrument C", value: "INST_C" },
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
              <button className="flex items-center gap-1 px-[12px] py-[6px] rounded text-[11px] font-bold shadow-sm bg-[#2883fe] text-white">
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
  );
};

export default AddInstrumentModal;
