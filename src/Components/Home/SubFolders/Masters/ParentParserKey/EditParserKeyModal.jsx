import { FiCheckSquare } from "react-icons/fi";
import React, { useMemo, useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import { useTranslation } from "react-i18next";

const EditParserKeyModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const { t } = useTranslation();
  const nodeRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  
  const initialForm = {
    elnMethodName: "",
    parsingKey: "",
    usePdfToCsv: false,
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({
        elnMethodName: initialData.elnmethodname || "",
        parsingKey: initialData.parsingkey || "",
        usePdfToCsv: initialData.usePdfToCsv === "CSV",

      });
    }
  }, [isOpen, initialData]);

const handleClose = () => {
  setSubmitted(false);
  setApiError("");
  setForm(initialForm);
  onClose();
};


  const handleSubmit = () => {
  setSubmitted(true);
  setApiError("");

  if (!form.parsingKey.trim()) return;

  onSave(form, setApiError, onClose);
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-10 z-50">

      <Draggable nodeRef={nodeRef} handle=".modal-header" bounds="parent">
        <div
          ref={nodeRef}
          className="bg-white w-[550px] rounded-lg shadow-lg flex flex-col animate-slideFromTop"
        >
          {/* HEADER */}
          <div className="modal-header cursor-move flex justify-between px-4 py-2 bg-slate-100 border-b rounded-t-lg">
            <label
              className="text-[#0e5bca] text-[18px]"
              style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
            >
              Edit Parser Key
            </label>
            <button
              onClick={handleClose}
              className="text-gray-300 text-[20px] font-bold"
            >
              ×
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            <div className="space-y-7 w-80">
              {/* ELN Method Name */}
              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  ELN Method Name
                  <span className="text-red-500">*</span>
                </label>
                <input
  type="text"
  name="elnMethodName"
  value={form.elnMethodName}
  disabled
  className={`
    w-full bg-gray-100 pb-1 text-[12px] font-semibold outline-none
    border-b-2 border-gray-300 cursor-not-allowed
  `}
/>

                {submitted && !form.elnMethodName && (
                  <div className="text-[11px] text-red-600 font-roboto mt-1">
                    ELN Method Name is required
                  </div>
                )}
              </div>

              {/* Parsing Key */}
              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  Parsing Key
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="parsingKey"
                  value={form.parsingKey}
                  onChange={(e) =>
                    setForm({ ...form, parsingKey: e.target.value })
                  }
                  className="
                    w-full bg-transparent pb-1 text-[12px] font-semibold outline-none
                    border-b-2 border-gray-300"
                    
                />
                {apiError && (
  <div className="text-[11px] flex text-red-600 font-roboto mt-1">
   The Parser Key is already active for instrument → Group → Method: {apiError}
  </div>
)}

              </div>

              {/* Use PDF to CSV Checkbox */}
              <div className="flex items-center gap-2">
               
                <label
                  htmlFor="usePdfToCsv"
                  className="text-[#405f7d] text-[12px] font-bold font-roboto"
                >
                  Use PDF to CSV
                </label>
                 <input
                  type="checkbox"
                  id="usePdfToCsv"
                  checked={form.usePdfToCsv}
                  onChange={(e) =>
                    setForm({ ...form, usePdfToCsv: e.target.checked })
                  }
                  className="w-4 h-4 "
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-4 py-3 border-t">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1 px-[12px] text-white py-[6px] rounded text-[11px] font-bold shadow-sm bg-[#2883fe]"
            >
              <FiCheckSquare className="w-4 h-4" />
              Submit
            </button>

            <button
              onClick={handleClose}
              className="border px-[12px] py-[6px] rounded text-[11px] text-[#8092a4] font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default EditParserKeyModal;