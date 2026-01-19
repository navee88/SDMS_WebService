import React, { useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";
import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../../Layout/Common/AnimatedDropdown";
import Errordialog from "../../../../../Layout/Common/Errordialog";

const CommunicationSettingsModal = ({
  isOpen,
  onClose,
  interfacerInstrument,
  parserType,
  commData,
  onSubmit,
  selectedRow
}) => {


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
          parity: false,
          minCurrent: true,
          maxCurrent: true,
          channelNumber: true,
          minDataPoint: true,
          maxDataPoint: true,
          conversionType: true,
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
          parity: true,
          minCurrent: true,
          maxCurrent: true,
          channelNumber: true,
          minDataPoint: true,
          maxDataPoint: true,
          conversionType: true,
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
          parity: true,
          minCurrent: true,
          maxCurrent: true,
          channelNumber: true,
          minDataPoint: true,
          maxDataPoint: true,
          conversionType: true,
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
          minCurrent: false,
          maxCurrent: false,
          channelNumber: false,
          minDataPoint: false,
          maxDataPoint: false,
          conversionType: false,
        };

      default:
        return {};
    }
  };

  // Helper function to check if field is required based on communication type
  const isFieldRequiredForCommType = (fieldName, commType) => {
    switch (commType) {
      case 1: // RS232
        return fieldName === 'com' || fieldName === 'baud' || fieldName === 'dataBits';
      case 2: // TCP_CLIENT
      case 4: // TCP_SERVER
        return fieldName === 'ip' || fieldName === 'tcp';
      case 5: // ICPMODBUS
        return fieldName === 'ip' || fieldName === 'tcp' || 
               fieldName === 'minCurrent' || fieldName === 'maxCurrent' ||
               fieldName === 'channelNumber' || fieldName === 'minDataPoint' ||
               fieldName === 'maxDataPoint' || fieldName === 'conversionType';
      case 3: // FILE
        // No specific field requirements for FILE type
        return false;
      default:
        return false;
    }
  };

  const RESULT_SAMPLE_ID_OPTIONS = [
    { label: "IFACER", value: "IFACER" },
    { label: "LimsTestOrder", value: "LimsTestOrder" },
    { label: "DataFileName", value: "DataFileName" },
  ];
  
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

  const CONVERSION_TYPE_OPTIONS = [
  { sConversionTypeName: "NONE", sConversionTypeID: 1 },
  { sConversionTypeName: "Temperature_Celcius", sConversionTypeID: 2 },
  { sConversionTypeName: "Temperature_Farenheit", sConversionTypeID: 3 },
];

  const showResultSampleId =
    parserType === "WIN_METHOD" || parserType === "WEB_METHOD";

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
  terminationIdle: "5",
  resultSampleIdFrom: "IFACER",
  // ICPMODBUS specific fields
  minCurrent: "",
  maxCurrent: "",
  channelNumber: "",
  minDataPoint: "",
  maxDataPoint: "",
  conversionType: 1, // Changed from 1 to 0 (NONE)
};

  const [form, setForm] = useState(initialFormState);
  const previousCommTypeRef = useRef(null);
  const [pendingCommType, setPendingCommType] = useState(null);
  const [showCommTypeConfirm, setShowCommTypeConfirm] = useState(false);

  const disabled = getDisabledByCommType(form.commType);
  
useEffect(() => {
  if (!isOpen) return;

  // Only populate when EDITING existing data
  if (commData) {
    const commType = Number(commData.COMMUNICATIONTYPE ?? 0) + 1;
    previousCommTypeRef.current = commType;
    
    setForm({
      commType: commType <=0 ? 1:commType ,
      parity: Number(commData.PARITY ?? 0) + 1<=  0 ? 1 :Number(commData.PARITY ?? 0) + 1,
      stopBits: String(commData.STOPBITS ?? "-1"),
      handShake: Number(commData.HANDSHAKE ?? 0) + 1,
      ip: commData.IPNUMBER || "",
      tcp: commData.TCPPORTNUMBER || "",
      com: commData.COMPORTNUMBER || "",
      baud: commData.BAUDRATE || "",
      dataBits: commData.DATABITS || "",
      terminationIdle: String(commData.MsgTerminationIdleSecs ?? "5"),
      resultSampleIdFrom: commData.ResultSampleIDFrom || "IFACER",
      // ICPMODBUS specific fields
      minCurrent: commData.
MinimumCurrent
 || "",
      maxCurrent: commData.
MaximumCurrent
 || "",
      channelNumber: commData.
ChannelNumber
 || "",
      minDataPoint: commData.MinimumDataPoint
|| "",
      maxDataPoint: commData.
MaximumDataPoint || "",
      conversionType: Number(commData.
ConversionType ?? 1), // Changed from 1 to 0
    });
  }
}, [isOpen, commData]);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const getBorderClass = (disabled, value, fieldName) => {
    if (disabled) return "border-gray-200";
    
    if (isSubmitted) {
      const isEmpty = !value || value.toString().trim() === "";
      const isRequired = isFieldRequiredForCommType(fieldName, form.commType);
      
      if (isEmpty && isRequired) {
        return "border-red-500";
      }
    }
    
    return "border-gray-300 focus:border-blue-500";
  };

const handleChange = (e) => {
  const { name, value } = e.target;

if (
  name === "commType" &&
  commData &&                  
  selectedRow &&                
  selectedRow.clientName &&        
  selectedRow.clientName !== "-" &&  
  Number(value) !== previousCommTypeRef.current
) {
  setPendingCommType(Number(value));
  setShowCommTypeConfirm(true);
  return;
}


  if (name === "commType") {
    const newCommType = Number(value);
    
    const clearedForm = {
      ...initialFormState,
      commType: newCommType,
      parity: 1,
      stopBits: "-1",
      handShake: 1,
      terminationIdle: "5",
      resultSampleIdFrom: "IFACER",
      conversionType: 0, // Changed from 1 to 0
    };
    
    setForm(clearedForm);
    return;
  }

  setForm((prev) => ({
    ...prev,
    [name]: ["commType", "parity", "handShake", "conversionType"].includes(name)
      ? Number(value)
      : value,
  }));
};

  const handleClose = () => {
    setIsSubmitted(false);
    setForm(initialFormState);
    onClose();
  };

 const handleSubmit = () => {
  if (form.commType === null || form.commType === undefined) {
    console.error("Validation: Please select a Communication Type");
    return;
  }

  let allRequiredFieldsFilled = true;
  
  switch (form.commType) {
    case 1: // RS232
      allRequiredFieldsFilled = form.com && form.baud && form.dataBits;
      break;
    case 2: // TCP_CLIENT
    case 4: // TCP_SERVER
      allRequiredFieldsFilled = form.ip && form.tcp;
      break;
    case 5: // ICPMODBUS
      allRequiredFieldsFilled = form.ip && form.tcp && 
                               form.minCurrent && form.maxCurrent && 
                               form.channelNumber && form.minDataPoint && 
                               form.maxDataPoint;
      // conversionType is not required as it has default value (0 = NONE)
      break;
    case 3: // FILE
      allRequiredFieldsFilled = true;
      break;
    default:
      allRequiredFieldsFilled = false;
  }

  if (!allRequiredFieldsFilled) {
    setIsSubmitted(true);
    console.error("Validation failed: Please fill all required fields");
    return;
  }

  console.log("Validation passed, submitting data...");
  
  const basePayload = {
    COMMUNICATIONTYPE: form.commType - 1,
    Parity: form.parity - 1,
    Handshake: form.handShake - 1,
    StopBits: form.stopBits,
    IPAddress: form.ip || "",
    TCPPortNumber: form.tcp ? Number(form.tcp) : 0,
    COMPortNumber: form.com || "",
    Baudrate: form.baud || "",
    Databits: form.dataBits || "",
    TerminationIdleSecs: form.terminationIdle || "0",
    ResultSampleIDFrom: form.resultSampleIdFrom,
  };

  // Add ICPMODBUS specific fields
  if (form.commType === 5) {
    basePayload.MIN_CURRENT = form.minCurrent;
    basePayload.MAX_CURRENT = form.maxCurrent;
    basePayload.CHANNEL_NUMBER = form.channelNumber;
    basePayload.MIN_DATAPOINT = form.minDataPoint;
    basePayload.MAX_DATAPOINT = form.maxDataPoint;
    basePayload.CONVERSION_TYPE = form.conversionType;
  }

  onSubmit(basePayload);
};

  if (!isOpen) return null;

  const isICPModbus = form.commType === 5;
  const isStandardComm = [1, 2, 3, 4].includes(form.commType);

  return (
    <>
      <div className="fixed rounded inset-0 bg-black/40 flex items-center justify-center z-[60]">
        <Draggable nodeRef={nodeRef} handle=".modal-header">
          <div
            ref={nodeRef}
            className="bg-white w-[600px] rounded-lg shadow-lg animate-slideFromTop"
          >
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
              {/* Common Fields */}
              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  Comm. Type
                </label>
                <AnimatedDropdown
                  name="commType"
                  value={form.commType}
                  options={COMM_TYPES}
                  displayKey="sInstrumentCommTypeName"
                  valueKey="sInstrumentCommTypeID"
                  onChange={handleChange}
                />
              </div>

              {/* Standard Communication Fields (RS232, TCP_CLIENT, TCP_SERVER, FILE) */}
              {isStandardComm && (
                <>
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
                        ${getBorderClass(disabled.ip, form.ip, 'ip')}
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
                        ${getBorderClass(disabled.tcp, form.tcp, 'tcp')}
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
                        ${getBorderClass(disabled.dataBits, form.dataBits, 'dataBits')}
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
                        ${getBorderClass(disabled.com, form.com, 'com')}
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
                        ${getBorderClass(disabled.baud, form.baud, 'baud')}
                      `}
                    />
                  </div>
                </>
              )}

              {/* ICPMODBUS Specific Fields */}
              {isICPModbus && (
                <>
                 <div>
                    <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                      Channel Number
                    </label>
                    <input
                      name="channelNumber"
                      value={form.channelNumber || ""}
                      onChange={handleChange}
                      disabled={disabled.channelNumber}
                      className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
                        ${disabled.channelNumber ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                        ${getBorderClass(disabled.channelNumber, form.channelNumber, 'channelNumber')}
                      `}
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
                        ${getBorderClass(disabled.ip, form.ip, 'ip')}
                      `}
                    />
                  </div>
                   <div>
                    <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                      Minimum Data Point
                    </label>
                    <input
                      name="minDataPoint"
                      value={form.minDataPoint || ""}
                      onChange={handleChange}
                      disabled={disabled.minDataPoint}
                      className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
                        ${disabled.minDataPoint ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                        ${getBorderClass(disabled.minDataPoint, form.minDataPoint, 'minDataPoint')}
                      `}
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
                        ${getBorderClass(disabled.tcp, form.tcp, 'tcp')}
                      `}
                    />
                  </div>
                         <div>
                    <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                      Maximum Data Point
                    </label>
                    <input
                      name="maxDataPoint"
                      value={form.maxDataPoint || ""}
                      onChange={handleChange}
                      disabled={disabled.maxDataPoint}
                      className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
                        ${disabled.maxDataPoint ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                        ${getBorderClass(disabled.maxDataPoint, form.maxDataPoint, 'maxDataPoint')}
                      `}
                    />
                  </div>

                  <div>
                    <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                      Minimum Current
                    </label>
                    <input
                      name="minCurrent"
                      value={form.minCurrent || ""}
                      onChange={handleChange}
                      disabled={disabled.minCurrent}
                      className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
                        ${disabled.minCurrent ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                        ${getBorderClass(disabled.minCurrent, form.minCurrent, 'minCurrent')}
                      `}
                    />
                  </div>
              <div>
  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
    Conversion Type
  </label>
  <AnimatedDropdown
    name="conversionType"
    value={form.conversionType}
    options={CONVERSION_TYPE_OPTIONS}
    displayKey="sConversionTypeName"
    valueKey="sConversionTypeID"
    onChange={handleChange}
    disabled={disabled.conversionType}
  />
</div>

                  <div>
                    <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                      Maximum Current
                    </label>
                    <input
                      name="maxCurrent"
                      value={form.maxCurrent || ""}
                      onChange={handleChange}
                      disabled={disabled.maxCurrent}
                      className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
                        ${disabled.maxCurrent ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                        ${getBorderClass(disabled.maxCurrent, form.maxCurrent, 'maxCurrent')}
                      `}
                    />
                  </div>

                 

                 

                 
                  
                </>
              )}

              {/* Common Termination Field */}
              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  Termination Idle Seconds
                </label>
                <input
                  name="terminationIdle"
                  value={form.terminationIdle || ""}
                  onChange={handleChange}
                  className={`w-full border-b-2 pb-1 text-[12px] font-semibold outline-none
                    ${getBorderClass(false, form.terminationIdle, 'terminationIdle')}
                  `}
                />
              </div>

              {/* Result Sample ID From Field (conditionally shown) */}
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
              <button
                onClick={handleSubmit}
                className="bg-[#2883fe] text-white px-4 py-1 rounded text-[12px] font-bold flex items-center gap-1"
              >
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
      
      {showCommTypeConfirm && (
        <Errordialog
          type="confirmation"
          message="Changes in Comm. Type , AgaramInterfacer Services will restart. Do you want to continue?"
          showCancel={true}
          onCancel={() => {
            setShowCommTypeConfirm(false);
            setPendingCommType(null);
          }}
          onConfirm={() => {
            const newCommType = pendingCommType;
            
            const clearedForm = {
              ...initialFormState,
              commType: newCommType,
              parity: 1,
              stopBits: "-1",
              handShake: 1,
              terminationIdle: "5",
              resultSampleIdFrom: form.resultSampleIdFrom || "IFACER",
              conversionType: 1,
            };
            
            setForm(clearedForm);
            previousCommTypeRef.current = newCommType;
            setPendingCommType(null);
            setShowCommTypeConfirm(false);
          }}
        />
      )}
    </>
  );
};

export default CommunicationSettingsModal;