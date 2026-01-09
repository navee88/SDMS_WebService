import React, { useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";
import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../../Layout/Common/AnimatedDropdown";
import { tr } from "zod/v4/locales";

const CommunicationSettingsModal = ({
  isOpen,
  onClose,
  interfacerInstrument,
  parserType,
  commData,      // 👈 ADD
  onSubmit,
}) => {


console.log("commData", commData)


const getDisabledByCommType = (commType) => {
  switch (commType) {
    case 1: // RS232
      return {
        ip: true,
        tcp: true,
        com: false,
        baud: false,
        dataBits: false,
        handShake: false,
        stopBits: false,
        Parity: false,
      };

    case 2: // TCP_CLIENT
    case 4: // TCP_SERVER
      return {
        ip: false,
        tcp: false,
        com: true,
        baud: true,
        dataBits: true,
        handShake: true,
        stopBits: true,
        Parity: true,
      };

    case 3: // FILE
      return {
        ip: true,
        tcp: true,
        com: true,
        baud: true,
        dataBits: true,
        handShake: true,
        stopBits: true,
        Parity: true,
        terminationIdle: false,
      };

    case 5: // ICPMODBUS
      return {
        ip: false,
        tcp: false,
        com: false,
        baud: false,
        dataBits: false,
        handShake: false,
        stopBits: false,
        parity: false,
      };

    default:
      return {};
  }
};

const RESULT_SAMPLE_ID_OPTIONS = [
  { label: "IFACER", value: "IFACER" },
  { label: "LimsTestOrder", value: "LimsTestOrder" },
  { label: "DataFileName", value: "DataFileName" },
];
// constants/commTypes.js
const COMM_TYPES = [
  { sInstrumentCommTypeName: "RS232", sInstrumentCommTypeID: 1 },
  { sInstrumentCommTypeName: "TCP_CLIENT", sInstrumentCommTypeID: 2 },
  { sInstrumentCommTypeName: "FILE", sInstrumentCommTypeID: 3 },
  { sInstrumentCommTypeName: "TCP_SERVER", sInstrumentCommTypeID: 4 },
  { sInstrumentCommTypeName: "ICPMODBUS", sInstrumentCommTypeID: 5 },
];
const PARITY_OPTIONS = [
  { sParityName: "NONE", sParityID: 1 },
  { sParityName: "ODD", sParityID: 2 },
  { sParityName: "EVEN", sParityID: 3 },
];
const STOP_BITS_OPTIONS = [
  { sBitsName: "-1" },
  { sBitsName: "0" },
  { sBitsName: "1" },
  { sBitsName: "1.5" },
  { sBitsName: "2" },
];
const HANDSHAKE_OPTIONS = [
  { sHandShakeName: "NONE", sHandShakeID: 1 },
  { sHandShakeName: "Xon_Xoff", sHandShakeID: 2 },
  { sHandShakeName: "RTS_CTS", sHandShakeID: 3 },
  { sHandShakeName: "BOTH", sHandShakeID: 4 },
];



const showResultSampleId =
  parserType === "WIN_METHOD" || parserType === "WEB_METHOD";

const ruleKey =
  interfacerInstrument === -2
    ? "CREATE_NEW"
    : "INST_A"; // default for existing instruments




  const nodeRef = useRef(null);
  const initialFormState = {
  commType: 1,
  parity: 1,
  stopBits: "-1",
  handShake: 1,
  ip: "",
  tcp: "",
  dataBits: "",
  com: "",
  baud: "",
  terminationIdle: "",
  resultSampleIdFrom: "IFACER",
};

const [form, setForm] = useState(initialFormState);

// ✅ NOW it's safe
const disabled = getDisabledByCommType(form.commType);
useEffect(() => {
  if (!isOpen) return;

  if (!commData) {
    setForm(initialFormState);
    return;
  }

  setForm({
    commType: Number(commData.COMMUNICATIONTYPE)+1 === 0 ? 1: Number(commData.COMMUNICATIONTYPE)+1,

    // backend "0" → UI 1 (NONE)
    parity: Number(commData.PARITY) + 1,

    // must stay STRING
    stopBits: String(commData.STOPBITS ?? "-1"),

    // backend 0 → UI 1 (NONE)
    handShake: Number(commData.HANDSHAKE) + 1,

    ip: commData.IPNUMBER ?? "",
    tcp: commData.TCPPORTNUMBER ?? "",
    com: commData.COMPORTNUMBER ?? "",
    baud: commData.BAUDRATE ?? "",
    dataBits: commData.DATABITS ?? "",

    terminationIdle:
      Number(commData.MsgTerminationIdleSecs) > 0
        ? String(commData.MsgTerminationIdleSecs)
        : "",

    resultSampleIdFrom:
      commData.ResultSampleIDFrom || "IFACER",
  });
}, [isOpen, commData]);






  const [isSubmitted, setIsSubmitted] = useState(false);

  const getBorderClass = (disabled, value) => {
    if (disabled) return "border-gray-200";
    if (isSubmitted && !value) return "border-red-500";
    return "border-gray-300 focus:border-blue-500";
  };
  const handleChange = (e) => {
  const { name, value } = e.target;

  setForm(prev => {
    let updated = {
      ...prev,
      [name]: ["commType", "parity", "handShake"].includes(name)
        ? Number(value)   // ✅ force number
        : value,
    };

  if (name === "commType") {
  // only change disabled state, DO NOT clear values
  updated.commType = Number(value);
}


    return updated;
  });
};


  
const handleClose = () => {
  setIsSubmitted(false);   // ✅ reset validation
  setForm(initialFormState); 
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
  value={form.commType}                 // numeric ID
  options={COMM_TYPES}
  displayKey="sInstrumentCommTypeName"  // what user sees
  valueKey="sInstrumentCommTypeID"      // what backend needs
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
  options={PARITY_OPTIONS}
  displayKey="sParityName"
  valueKey="sParityID"
  onChange={handleChange}
  disabled={disabled.parity}
/>

            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                IP Address
              </label>

<input
  name="ip"
  value={form.ip || ""}
  onChange={handleChange}
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
  options={STOP_BITS_OPTIONS}
  displayKey="sBitsName"
  valueKey="sBitsName"
  onChange={handleChange}
  disabled={disabled.stopBits}
/>

            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                TCP Port Number
              </label>
             <input
             name="tcp"
  value={form.tcp || ""}
  onChange={handleChange}
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
 name="dataBits"
  value={form.dataBits || ""}
  onChange={handleChange}
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
  name="com"
  value={form.com || ""}
  onChange={handleChange}
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
  options={HANDSHAKE_OPTIONS}
  displayKey="sHandShakeName"
  valueKey="sHandShakeID"
  onChange={handleChange}
  disabled={disabled.handShake}
/>


            </div>

            <div>
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                Baud Rate
              </label>
<input
 name="baud"
  value={form.baud || ""}
  onChange={handleChange}
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
  name="terminationIdle"
  value={form.terminationIdle || ""}
  onChange={handleChange}
  className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
    ${getBorderClass(false, form.terminationIdle)}
  `}
/>

            </div>
            {showResultSampleId && (
  <div>
    <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
      Result Sample ID From
    </label>

    <AnimatedDropdown
      name="resultSampleIdFrom"
      value={form.resultSampleIdFrom}
      options={RESULT_SAMPLE_ID_OPTIONS}
      displayKey="label"
      valueKey="value"
      onChange={handleChange}
      required
      showError={isSubmitted}
    />
  </div>
)}


          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-4 py-3 border-t">
            <button onClick={() => {
    setIsSubmitted(true);

    // basic validation example
    if (form.commType === null || form.commType === undefined) return;


    onSubmit({
  ...form,
  commType: form.commType - 1,
  parity: form.parity - 1,
});
  }} className="bg-[#2883fe] text-white px-4 py-1 rounded text-[12px] font-bold flex items-center gap-1">
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
