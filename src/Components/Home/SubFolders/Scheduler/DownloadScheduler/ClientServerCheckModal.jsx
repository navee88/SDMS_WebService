import React, {useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";
import { FiCheckSquare } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const ClientServerCheckModal = ({
  isOpen,
  onClose,
  onSubmit,
  clientName,
  setLoading,
  setLoadingText
}) => {
  const { t } = useTranslation();
  const [connectionType, setConnectionType] = useState("client");
  const [clientUserName, setClientUserName] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [serverName, setServerName] = useState("");
  const [errors, setErrors] = useState({});
const draggableRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setConnectionType("client");
      setClientUserName("");
      setClientPassword("");
      setServerName("");
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const newErrors = {};
    
    // Validate based on connection type
    if (connectionType === "client") {
      if (!clientUserName.trim()) {
        newErrors.clientUserName = "Client User Name is required";
      }
      if (!clientPassword.trim()) {
        newErrors.clientPassword = "Client Password is required";
      }
    } else {
      if (!serverName.trim()) {
        newErrors.serverName = "Server Name is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (setLoading) setLoading(true);
      if (setLoadingText) setLoadingText("Checking connection...");

      // Prepare payload based on connection type
      const payload = {
        connectionType,
        clientName: connectionType === "client" ? clientName : undefined,
        serverName: connectionType === "server" ? serverName : undefined,
        clientUserName: connectionType === "client" ? clientUserName : undefined,
        clientPassword: connectionType === "client" ? clientPassword : undefined,
        // Add any other required fields
      };

      // Call the submit handler
      if (onSubmit) {
        await onSubmit(payload);
      }

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Check failed:", error);
      // You might want to show an error dialog here
    } finally {
      if (setLoading) setLoading(false);
      if (setLoadingText) setLoadingText("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-10 z-50">
      <Draggable handle=".modal-header" bounds="parent" nodeRef={draggableRef}>
        <div  ref={draggableRef} className="bg-white w-[600px] rounded-lg overflow-hidden shadow-lg
                       animate-slideFromTop">
          {/* HEADER */}
          <div className="modal-header cursor-move flex justify-between px-4 py-2 bg-slate-100 border-b rounded-t-lg">
            <label className="text-[#0e5bca] text-[18px]"
                style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
              {t("scheduler.checkPath")}
            </label>
            <button
              onClick={onClose}
              className="text-gray-300 text-[20px] font-bold "
            >
              ×
            </button>
          </div>

          {/* BODY */}
          <div className="px-4 py-4 overflow-y-auto flex-1">
            {/* Source Path Section */}
            <div className="mb-4">
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto mb-2">
                {t("scheduler.sourcePath")}
              </label>
              
              {/* Client/Server Toggle */}
<div className="flex gap-8 mb-4">
  <Toggle
    label={t("scheduler.client")}
    checked={connectionType === "client"}
    onChange={() => setConnectionType("client")}
  />

  <Toggle
    label={t("scheduler.server")}
    checked={connectionType === "server"}
    onChange={() => setConnectionType("server")}
  />
</div>
            </div>

            {/* Client Name/Server Name Section */}
            <div className="mb-4">
              <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                {connectionType === "client" 
                  ? (t("scheduler.clientName"))
                  : (t("scheduler.serverName"))}
              </label>
               <input
  type="text"
  value={clientName}
  disabled
  className="w-[350px] bg-transparent pb-1 text-[12px] font-semibold outline-none
             border-b-2 border-gray-300
             disabled:bg-gray-100 disabled:text-gray-500"
/>


            </div>

            {/* Client Credentials Section (only for client type) */}

              <>
                <div className="mb-4">
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
  {t("scheduler.clientUserName")}
  {connectionType === "client" && (
    <span className="text-red-500 ml-1">*</span>
  )}
</label>

                 <input
  type="text"
  value={clientUserName}
  disabled={connectionType === "server"}
  onChange={(e) => {
    setClientUserName(e.target.value);
    setErrors(prev => ({ ...prev, clientUserName: "" }));
  }}
  className={`w-[350px] bg-transparent pb-1 text-[12px] font-semibold outline-none
    border-b-2
    ${errors.clientUserName ? "border-red-500" : "border-gray-300"}
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
 />

                </div>

                <div className="mb-4">
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
  {t("scheduler.clientPassword")}
  {connectionType === "client" && (
    <span className="text-red-500 ml-1">*</span>
  )}
</label>

                  <input
  type="password"
  value={clientPassword}
  disabled={connectionType === "server"}
  onChange={(e) => {
    setClientPassword(e.target.value);
    setErrors(prev => ({ ...prev, clientPassword: "" }));
  }}
  className={`w-[350px] bg-transparent pb-1 text-[12px] font-semibold outline-none
    border-b-2
    ${errors.clientPassword ? "border-red-500" : "border-gray-300"}
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
 />

                </div>
              </>

          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-4 py-3 border-t">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1 px-[12px] text-white py-[6px] rounded text-[11px] font-bold shadow-sm bg-[#2883fe]"
            >
                <FiCheckSquare className="w-4 h-4" />
              {t("button.submit")}
            </button>
            
            <button
              onClick={onClose}
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
function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#405f7d] text-[13px] font-semibold">
        {label}
      </span>

      <button
        type="button"
        onClick={onChange}
        className="relative h-5 w-10 rounded-full border"
      >
        <span
          className={`absolute top-[1px] h-4 w-4 rounded-full transition ${
            checked ? "left-5 bg-blue-500" : "left-1 bg-gray-400"
          }`}
        />
      </button>
    </div>
  );
}


export default ClientServerCheckModal;