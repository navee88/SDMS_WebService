import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../../Layout/Common/AnimatedDropdown";
import Draggable from "react-draggable";
import { get } from "react-hook-form";
import React, { useState, useMemo, useRef, useEffect } from "react";
import useAxios from "../../../../../../Services/servicecall";
import { CF_decrypt } from "../../../../../Common/encryptiondecryption";
import AddInstrumentModal from "../InstrumentMaster/AddInstrumentModal";

const AddClientModal = ({
  initialData,
  allInstruments = [],
  onClose,
  onSubmit,
}) => {
  const nodeRef = useRef(null);

  const [submitted, setSubmitted] = useState(false);
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);

  const { postData } = useAxios();

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

  const buildClientRequest = () => ({
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
    ApplicationCode: "SDMS",
  });

  const [form, setForm] = useState({
    clientName: initialData?.clientName || "",
    clientAlias: initialData?.clientAlias || "",
    clientType: initialData?.clientType || "",
    active: initialData?.status === "Active" || false,
    gatewayClient: false,
  });

  const [clientTypes, setClientTypes] = useState([]);
  const [instrumentSearch, setInstrumentSearch] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState(
    initialData?.selectedInstruments || []
  );

  const isAddMode = !initialData;

  // Fetch Client Types dynamically
  useEffect(() => {
    const fetchClientTypes = async () => {
      try {
        const response = await postData(
          "basemaster/getClientMasterType",
          buildClientRequest()
        );

        if (Array.isArray(response)) {
          const types = response.map((ct) => ({
            id: ct.sClientTypeID.trim(),
            name: ct.sClientTypeName.trim(),
          }));

          setClientTypes(types);

          if (!form.clientType && types.length > 0) {
            setForm((f) => ({ ...f, clientType: types[0].name }));
          }
        }
      } catch (err) {
        console.error("Error fetching client types:", err);
      }
    };

    fetchClientTypes();
  }, []);

  useEffect(() => {
    if (initialData?.selectedInstruments) {
      setSelectedInstruments(initialData.selectedInstruments);
    }
  }, [initialData]);

  const filteredInstruments = useMemo(() => {
    return allInstruments.filter((inst) =>
      inst.sInstrumentName
        .toLowerCase()
        .includes(instrumentSearch.toLowerCase())
    );
  }, [instrumentSearch, allInstruments]);

  const handleSubmit = () => {
    setSubmitted(true);

    if (!form.clientName || !form.clientAlias || !form.clientType) {
      return;
    }
    const selectedClientType = clientTypes.find(
      (ct) => ct.name === form.clientType
    );

    onSubmit({
      clientName: form.clientName,
      clientAlias: form.clientAlias,
      status: form.active ? "Active" : "Deactive",
      clientType: selectedClientType?.name, // UI / Grid
      clientTypeID: selectedClientType?.id, // 🔥 API
      gatewayClient: form.gatewayClient,
      selectedInstruments,
    });

    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
      <Draggable nodeRef={nodeRef} handle=".modal-header" bounds="parent">
        <div
          ref={nodeRef}
          className="bg-white w-[600px] rounded-lg overflow-hidden shadow-lg
                       animate-slideFromTop"
        >
          {/* HEADER */}
          <div className="modal-header cursor-move flex justify-between items-center px-4 py-2 pb-[5px] bg-slate-100 border-b">
            <label
              className="text-[#0e5bca] text-[18px]"
              style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
            >
              {initialData ? "Edit Client" : "Add Client"}
            </label>

            <button
              onClick={onClose}
              className="text-gray-300 text-[20px] font-bold "
            >
              ×
            </button>
          </div>

          {/* BODY */}
          <div className="px-4 py-4 space-y-6">
            {/* CLIENT NAME / ALIAS / TYPE */}
            <div className="w-[300px] space-y-4">
              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                  className={`
      w-full bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
      border-b-2 
      ${submitted && !form.clientName ? "border-red-500" : "border-gray-300"}
      focus:border-blue-500
    `}
                />
              </div>

              <div>
                <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                  Client Alias Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="clientAlias"
                  value={form.clientAlias}
                  onChange={(e) =>
                    setForm({ ...form, clientAlias: e.target.value })
                  }
                  className={`
      w-full bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
      border-b-2
      ${submitted && !form.clientAlias ? "border-red-500" : "border-gray-300"}
      focus:border-blue-500
    `}
                />
              </div>

              <AnimatedDropdown
                label={
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    Client Type <span className="text-red-500">*</span>
                  </label>
                }
                name="clientType"
                value={form.clientType}
                allowFreeInput
                options={clientTypes.map((ct) => ct.name)}
                onChange={(e) =>
                  setForm({ ...form, clientType: e.target.value })
                }
              />
            </div>

            {/* CHECKBOXES */}
            <div className="flex gap-12 ">
              <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
                Active
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                />
              </label>

              <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
                Gateway Client
                <input
                  type="checkbox"
                  checked={form.gatewayClient}
                  onChange={(e) =>
                    setForm({ ...form, gatewayClient: e.target.checked })
                  }
                />
              </label>
            </div>

            {/* INSTRUMENTS */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
                  Instrument
                </label>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-[12px] py-[6px] rounded text-[11px] font-bold font-roboto"
                  onClick={() => setShowInstrumentModal(true)}
                >
                  Add
                </button>
              </div>

              <div className="border rounded h-[180px] overflow-hidden">
                <div className="sticky top-0 bg-white px-2 py-1 border-b z-10">
                  <input
                    placeholder="Looking for"
                    value={instrumentSearch}
                    onChange={(e) => setInstrumentSearch(e.target.value)}
                    className="w-full border px-2 rounded outline-none text-sm"
                  />
                </div>
                <div className="overflow-auto" style={{ maxHeight: "140px" }}>
                  <div className="px-2 font-verdana text-[12px] shadow-sm shadow-blue-500/40">
                    {/* SHOW DIFFERENT MESSAGE BASED ON MODE */}
                    {filteredInstruments.map((inst) => (
                      <label
                        key={inst.sInstrumentID}
                        className="flex gap-2 text-sm hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedInstruments.some(
                            (i) => i.sInstrumentID === inst.sInstrumentID
                          )}
                          onChange={() =>
                            setSelectedInstruments((prev) =>
                              prev.some(
                                (i) => i.sInstrumentID === inst.sInstrumentID
                              )
                                ? prev.filter(
                                    (i) =>
                                      i.sInstrumentID !== inst.sInstrumentID
                                  )
                                : [...prev, inst]
                            )
                          }
                        />

                        {inst.sInstrumentName}
                      </label>
                    ))}

                    {filteredInstruments.length === 0 && (
                      <div className="text-gray-400 text-xs pt-[53px] text-center py-4">
                        All the instruments or already mapped to this client.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-4 py-3 border-t">
            <button
              onClick={handleSubmit}
              className="bg-[#2883fe] flex text-[#ffffff] px-[12px] py-[6px] rounded text-[11px] font-bold font-roboto shadow-sm items-center gap-1"
            >
              <FiCheckSquare className="w-4 h-4" />{" "}
              <span className="leading-none">Submit</span>
            </button>
            <button
              onClick={onClose}
              className="border px-[12px] py-[6px] rounded text-[11px] text-[#8092a4] font-roboto font-bold"
            >
              <span className="leading-none">Close</span>
            </button>
          </div>
        </div>
      </Draggable>
      {showInstrumentModal && (
        <AddInstrumentModal
          isOpen={showInstrumentModal}
          onClose={() => setShowInstrumentModal(false)}
          onSave={(newInstrument) => {
            setSelectedInstruments((prev) => [...prev, newInstrument]);
            setShowInstrumentModal(false);
          }}
        />
      )}
    </div>
  );
};
export default AddClientModal;
