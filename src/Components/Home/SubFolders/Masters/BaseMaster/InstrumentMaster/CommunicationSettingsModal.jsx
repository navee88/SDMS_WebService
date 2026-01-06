import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../../Layout/Common/AnimatedDropdown";
import { tr } from "zod/v4/locales";

const CommunicationSettingsModal = ({
  isOpen,
  onClose,
  interfacerInstrument,
}) => {


const disableRules = {
  CREATE_NEW: {
    ip: true,
    tcp: true,
    com: false,
    baud: false,
    dataBits: false,
    handShake: false,
    stopBits: false,
    Parity: true,

  },
  INST_A: {
    ip: false,
    tcp: false,
    com: true,
    baud: true,
    dataBits: true,
    handShake: true, // ✅ DISABLE'
    stopBits: true, // ✅ DISABLE
    Parity: true, // ✅ DISABLE
   
  },
  INST_B: {
    ip: false,
    tcp: false,
    com: true,
    baud: true,
    dataBits: true,
    handShake: true, // ✅ DISABLE
    stopBits: true, // ✅ DISABLE
    Parity: true,
  },
  INST_C: {
    ip: true,
    tcp: true,
    com: false,
    baud: false,
    dataBits: false,
    handShake: false,
    stopBits: false, 
    Parity: false,
  },
};
const ruleKey =
  interfacerInstrument === -2
    ? "CREATE_NEW"
    : "INST_A"; // default for existing instruments

const disabled = disableRules[ruleKey] || {};


  const nodeRef = useRef(null);
  const [form, setForm] = useState({
    commType: "TCP_SERVER",
    parity: "NONE",
    stopBits: "-1",
    handShake: "NONE",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getBorderClass = (disabled, value) => {
    if (disabled) return "border-gray-200";
    if (isSubmitted && !value) return "border-red-500";
    return "border-gray-300 focus:border-blue-500";
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  
const handleClose = () => {
  setIsSubmitted(false);   // ✅ reset validation
  onClose();               // close modal
};


  if (!isOpen) return null;


  return (
    <div className="fixed rounded inset-0 bg-black/40 flex items-center justify-center z-[60]">
      <Draggable nodeRef={nodeRef} handle=".modal-header">
        <div ref={nodeRef} className="bg-white  w-[600px] rounded-lg  shadow-lg  animate-slideFromTop">
          {/* HEADER */}
          <div className="modal-header cursor-move flex justify-between px-4 py-2 bg-slate-100 border-b rounded-t-lg">
            <label
              className="text-[#0e5bca] text-[18px]"
              style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
            >
              Communication Settings
            </label>
            <button onClick={handleClose} className="text-gray-400 text-xl">
              ×
            </button>
          </div>

          {/* BODY */}
          <div className="p-5 grid grid-cols-2 gap-6 text-[13px]">
            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                Comm. Type
              </label>
              <AnimatedDropdown
                name="commType"
                value={form.commType}
                options={[
                  { label: "TCP_SERVER", value: "TCP_SERVER" },
                  { label: "TCP_CLIENT", value: "TCP_CLIENT" },
                  { label: "SERIAL", value: "SERIAL" },
                ]}
                displayKey="label"
                valueKey="value"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                Parity
              </label>
              <AnimatedDropdown
                name="parity"
                value={form.parity}
                options={[
                  { label: "NONE", value: "NONE" },
                  { label: "ODD", value: "ODD" },
                  { label: "EVEN", value: "EVEN" },
                ]}
                displayKey="label"
                valueKey="value"
                onChange={handleChange}
                disabled={disabled.Parity}
              />
            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                IP Address
              </label>
              <input
  value={form.ip || ""}
  disabled={disabled.ip}
  className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
    ${disabled.ip ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
    ${getBorderClass(disabled.ip, form.ip)}
  `}
/>

            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                Stop Bits
              </label>
              <AnimatedDropdown
                name="stopBits"
                value={form.stopBits}
                options={[
                  { label: "-1", value: "-1" },
                  { label: "1", value: "1" },
                  { label: "2", value: "2" },
                ]}
                displayKey="label"
                valueKey="value"
                onChange={handleChange}
                disabled={disabled.stopBits}
              />
            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                TCP Port Number
              </label>
             <input
  value={form.tcp || ""}
  disabled={disabled.tcp}
  className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
    ${disabled.tcp ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
    ${getBorderClass(disabled.tcp, form.tcp)}
  `}
/>
            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                Data Bits
              </label>
              <input
  value={form.dataBits || ""}
  disabled={disabled.dataBits}
  className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
    ${disabled.dataBits ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
    ${getBorderClass(disabled.dataBits, form.dataBits)}
  `}
/>

            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                COM Port Number
              </label>
             
<input
  value={disabled.com || ""}
  disabled={disabled.com}
  className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
    ${disabled.com ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
    ${getBorderClass(disabled.com, form.com)}
  `}
/>

            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                Hand Shake
              </label>
              <AnimatedDropdown
  name="handShake"
  value={form.handShake}
  options={[
    { label: "NONE", value: "NONE" },
    { label: "RTS/CTS", value: "RTS/CTS" },
    { label: "XON/XOFF", value: "XON/XOFF" },
  ]}
  displayKey="label"
  valueKey="value"
  onChange={handleChange}
  disabled={disabled.handShake}
/>

            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                Baud Rate
              </label>
<input
  value={disabled.baud|| ""}
  disabled={disabled.baud}
  className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
    ${disabled.baud ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
    ${getBorderClass(disabled.baud, form.baud)}
  `}
/>

            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                Termination Idle Seconds
              </label>
              <input
  value={form.terminationIdle || ""}
  className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
    ${getBorderClass(false, form.terminationIdle)}
  `}
/>

            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-4 py-3 border-t">
            <button onClick={() => setIsSubmitted(true)} className="bg-[#2883fe] text-white px-4 py-1 rounded text-[12px] font-bold flex items-center gap-1">
              <FiCheckSquare />
              Submit
            </button>


            <button
              onClick={handleClose}
              className="border px-4 py-1 rounded text-[12px]"
            >
              Close
            </button>
          </div>
        </div>
      </Draggable>
    </div>
  );
};



export default CommunicationSettingsModal;
