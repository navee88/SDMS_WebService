import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../Layout/Common/AnimatedDropdown";
import Draggable from "react-draggable";
import { get } from "react-hook-form";
import React, { useState, useMemo, useRef ,useEffect} from "react";
import useAxios from "../../../../../Services/servicecall";
import { CF_decrypt } from "../../../../Common/encryptiondecryption";

const INSTRUMENTS = [
  "IN001 (in001)",
  "IN002 (in002)",
  "IN003 (in003)",
  "IN004 (in004)",
  "IN005 (in005)",
  "IN006 (in006)",
  "IN007 (in007)",
  "IN008 (in008)",
  "IN009 (in009)",
  "IN010 (in010)",
  "IN011 (in011)",
  "IN012 (in012)",
  "IN013 (in013)",
  "IN014 (in014)",
  "IN015 (in015)",
];

const AddClientModal = ({ initialData, onClose, onSubmit }) => {
  const nodeRef = useRef(null);
  const [allInstruments, setAllInstruments] = useState([]);

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
    initialData?.mappedInstrument?.split(", ").filter(Boolean) || []
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
          const types = response.map(ct => ct.sClientTypeName.trim());
          setClientTypes(types);

          // If form has no clientType yet, set first type
          if (!form.clientType && types.length > 0) {
            setForm(f => ({ ...f, clientType: types[0] }));
          }
        }
      } catch (err) {
        console.error("Error fetching client types:", err);
      }
    };

    fetchClientTypes();
  }, []);
  useEffect(() => {
  const fetchInstruments = async () => {
    try {
      const response = await postData(
        "basemaster/getClientUnmappingInstrumentMaster",
        buildClientRequest()
      );

      if (Array.isArray(response)) {
        const instruments = response.map(inst => inst.sInstrumentName.trim());
        setAllInstruments(instruments);
      }
    } catch (err) {
      console.error("Error fetching instruments:", err);
    }
  };

  fetchInstruments();
}, []);
useEffect(() => {
  if (initialData) {
    setSelectedInstruments(
      initialData.mappedInstrument !== "-"
        ? initialData.mappedInstrument.split(",")
        : []
    );
  }
}, [initialData]);


const filteredInstruments = useMemo(() => {
  return allInstruments.filter(inst =>
    inst.toLowerCase().includes(instrumentSearch.toLowerCase())
  );
}, [instrumentSearch, allInstruments]);



  const handleSubmit = () => {
  onSubmit({
    clientName: form.clientName,
    clientAlias: form.clientAlias,
    status: form.active ? "Active" : "Inactive",
    clientType: form.clientType,
    clientTypeID: clientTypes.find(ct => ct === form.clientType), // or map ID properly
    gatewayClient: form.gatewayClient,
    selectedInstruments, // 🔥 IMPORTANT
  });
};


  return (
<div className=" fixed inset-0 bg-black/40 flex items-center justify-center z-50">
 <Draggable
  nodeRef={nodeRef}
  handle=".modal-header"
  bounds="parent"
>
  <div
    ref={nodeRef}
    className="bg-white w-[600px] rounded overflow-hidden shadow-lg"
  >


        {/* HEADER */}
        <div className="modal-header cursor-move flex justify-between items-center px-4 py-2 pb-[5px] bg-slate-100 border-b">

          <label
  className="text-[#0e5bca] text-[18px]"
  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
>
  {initialData ? "Edit Client" : "Add Client"}
</label>

          <button onClick={onClose} className="text-gray-300 text-[20px] font-bold ">
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-4 py-4 space-y-6">
          {/* CLIENT NAME / ALIAS / TYPE */}
          <div className="w-[300px] space-y-4">
            <div >
  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
    Client Name <span className="text-red-500">*</span>
  </label>
<AnimatedDropdown 
name="clientName" value={form.clientName} 
allowFreeInput 
borderColor="border-gray-300" 
onChange={(e) => setForm({ ...form, clientName: e.target.value })} 
/>
</div>


            <div>
  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
    Client Alias Name <span className="text-red-500">*</span>
  </label>
 <AnimatedDropdown  name="clientAlias" 
 value={form.clientAlias} 
 allowFreeInput 
 borderColor="border-gray-300" 
 onChange={(e) => setForm({ ...form, clientAlias: e.target.value })}
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
              options={clientTypes} 
              borderColor="border-gray-300"
              onChange={(e) => setForm({ ...form, clientType: e.target.value })}
              className="py-0"
            />
          </div>

          {/* CHECKBOXES */}
          <div className="flex gap-12 ">
            <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
              Active
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
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
                className="bg-blue-500 text-white px-[12px]  py-[6px] rounded text-[11px] font-bold font-roboto"
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
              <div className="overflow-auto" style={{ maxHeight: '140px' }}>
                <div className="px-2 font-verdana text-[12px] shadow-sm shadow-blue-500/40">
                  {/* SHOW DIFFERENT MESSAGE BASED ON MODE */}
                  {filteredInstruments.map((inst) => (
  <label
    key={inst}
    className="flex gap-2 text-sm hover:bg-gray-50 p-1 rounded"
  >
    <input
      type="checkbox"
      checked={selectedInstruments.includes(inst)}
      onChange={() =>
        setSelectedInstruments(prev =>
          prev.includes(inst)
            ? prev.filter(i => i !== inst)
            : [...prev, inst]
        )
      }
    />
    {inst}
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
            <FiCheckSquare className="w-4 h-4" /> <span className="leading-none">Submit</span> 
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
    </div>
  );
};
export default AddClientModal;