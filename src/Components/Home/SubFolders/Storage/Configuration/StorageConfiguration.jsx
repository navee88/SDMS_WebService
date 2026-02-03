import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Check } from "lucide-react"; // Import Check icon
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Components
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import PopupModal from "../../FTPDataView/DataExplorer/PopupModal";
import StorageConfigForm from "./StorageConfigForm";

// Services & Helpers
import servicecall from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { AR_ajaxCall } from "./Common/AR_ajaxCall";

// --- API Call ---
const fetchStorageConfigsAPI = async ({ postData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { sActionType: "View", ...userDetailsData };
  const response = await postData("ftp/getFTPMaster", reqObj);
  // Returns { columns: [...], formattedData: [...] }
  return AR_ajaxCall(response, "grid");
};

export default function StorageConfiguration() {
  const { postData } = servicecall();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "add", data: null });

  // Fetch Data
  const { data: gridResult, isLoading, isError, error } = useQuery({
    queryKey: ["storageConfigs"],
    queryFn: () => fetchStorageConfigsAPI({ postData }),
    // staleTime: 5 * 60 * 1000,
    // staleTime : 1000 * 30,
    staleTime:0,
    gcTime:1000 * 60,
    refetchOnWindowFocus : true
  });

  const rows = gridResult?.formattedData || [];

  // --- MANUAL COLUMN CONFIGURATION ---
  // This defines exactly what headers show up and what data they pull
  const columns = useMemo(() => [
    { 
      key: "sServerNameIp", // The Key from API data
      label: "Server Name/IP", // The Header Text you want
      width: 160, 
      enableSearch: true, 
      sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sServerNameIp || row.sServerName || "-"}
        </span>
      )
    },
    { 
      key: "sFTPAliasName", 
      label: "Storage Name", 
      width: 160, 
      enableSearch: true, 
      sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sFTPAliasName || "-"}
        </span>
      )
    },
    { 
      key: "iStatusRead", 
      label: "RD", 
      width: 60, 
      sortable: false,
      render: (row) => {
        // Handle "1", "true", true, etc.
        const isChecked = row.iStatusRead == 1 || String(row.iStatusRead).toLowerCase() === "true";
        return isChecked ? <Check className="w-4 h-4 text-blue-600 stroke-[3px]" /> : null;
      }
    },
    { 
      key: "iStatusWrite", 
      label: "WR", 
      width: 60, 
      sortable: false,
      render: (row) => {
        const isChecked = row.iStatusWrite == 1 || String(row.iStatusWrite).toLowerCase() === "true";
        return isChecked ? <Check className="w-4 h-4 text-blue-600 stroke-[3px]" /> : null;
      }
    },
    { 
      key: "sFTPStatus", 
      label: "Status", 
      width: 100, 
      enableSearch: true, 
      sortable: true,
      render: (row) => {
        const status = row.sStatus || row.sFTPStatus || "-";
        const isActive = status.toLowerCase() === 'active';
        return (
          <span className={`font-bold ${isActive ? 'text-green-600' : 'text-red-500'}`}>
            {status}
          </span>
        );
      }
    }
  ], []);

  // --- Selection Logic ---
  useEffect(() => {
    if (rows && rows.length > 0) {
      const isSelectedIdValid = selectedRowId && rows.some(r => r._gridId === selectedRowId);
      if (!selectedRowId || !isSelectedIdValid) {
        setSelectedRowId(rows[0]._gridId);
      }
    }
  }, [rows, selectedRowId]);

  const selectedRow = useMemo(() => rows.find((r) => r._gridId === selectedRowId), [rows, selectedRowId]);

  // --- Handlers ---
  const handleAddClick = () => setModalConfig({ isOpen: true, type: "add", data: null });
  
  const handleEditClick = () => {
    if (!selectedRow) return alert("Please select a row to edit");
    setModalConfig({ isOpen: true, type: "edit", data: { sFTPID: selectedRow.sFTPID?.trim() } });
  };

  const handleCloseModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
  
  const handleFormSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ["storageConfigs"] });
    handleCloseModal();
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">Error: {error?.message}</div>;

  return (
    <>
      <PopupModal 
        isOpen={modalConfig.isOpen} 
        onClose={handleCloseModal} 
        title={modalConfig.type === 'edit' ? 'Edit Configuration' : 'Add Configuration'}
        width="800px"
        content={<StorageConfigForm initialData={modalConfig.data} isEditMode={modalConfig.type === "edit"} onSubmit={handleFormSubmit} onClose={handleCloseModal} />} 
      />

      <div className='flex items-center justify-end gap-5 me-6 pt-3 pb-1'>
        <button onClick={handleAddClick} className="flex items-center gap-1 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-blue-100 transition border shadow-sm" disabled={isLoading}><Plus size={14} strokeWidth={4} /> Add</button>
        <button onClick={handleEditClick} className="flex items-center gap-1 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-blue-100 transition border shadow-sm" disabled={isLoading || !selectedRow}><Edit size={14} strokeWidth={4} /> Edit</button>
      </div>

      <div className="h-full">
        <GridLayout
          columns={columns} // Using your CUSTOM columns here
          data={rows}       // Using the API data
          getRowId={(row) => row._gridId}
          externalSelectedId={selectedRowId}
          autoSelectFirst={false}
          onRowClick={(row) => setSelectedRowId(row._gridId)}
          rowClassName={(row) => row._gridId === selectedRowId ? "bg-blue-50 border-l-4 border-blue-600" : ""}
          renderDetailPanel={() => (
            selectedRow ? (
              <div className="space-y-3 p-4">
                <DetailRow label="Storage Path" value={selectedRow.sFTPVirtualPathDirectory} />
                <DetailRow label="Storage Information" value={selectedRow.sFTPVirtualDirectoryName} />
                <DetailRow label="Virtual/Static IP (Optional)" value={selectedRow.sVirtualStaticIP} />
                <DetailRow label="Created By" value={selectedRow.sCreatedBy} />
                <DetailRow label="Created On" value={selectedRow.dCreatedOn} />
                <DetailRow label="Modified By" value={selectedRow.sModifiedBy} />
                <DetailRow label="Modified On" value={selectedRow.dModifiedOn} />
              </div>
            ) : <div className="p-4 text-gray-500">Select a row to view details</div>
          )} 
          detailPanelWidth="45%" 
          height="calc(100vh - 180px)" 
        />
      </div>
    </>
  );
}

// Helper Component
const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="font-bold text-[12px] text-[#405F7D] font-roboto">{label}</div>
    <div className="font-bold text-[12px] text-[#353f49] font-roboto">
      {typeof value === 'boolean' ? (value ? "Yes" : "No") : (value || "")}
    </div>
  </div>
);