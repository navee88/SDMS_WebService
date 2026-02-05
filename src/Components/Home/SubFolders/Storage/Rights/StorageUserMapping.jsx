import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Network, FileDown, Printer } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import PopupModal from "../../FTPDataView/DataExplorer/PopupModal";
import StorageMappingForm from "./StorageMappingForm";

// Services
import servicecall from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { AR_ajaxCall } from "../Configuration/Common/AR_ajaxCall";

/* ------------------ HELPER COMPONENTS ------------------ */

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4 py-1">
    <div className="font-bold text-[12px] text-[#405F7D] font-roboto">{label}</div>
    <div className="text-[12px] text-[#353f49] font-roboto">
      {typeof value === 'boolean' ? (value ? "Yes" : "No") : (value || "-")}
    </div>
  </div>
);

/* ------------------ DATA FETCHING ------------------ */

const fetchMappingDataAPI = async ({ postData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { sActionType: "View", ...userDetailsData };
  const response = await postData("User/FTPAndUserMappedDetails", reqObj);
  return AR_ajaxCall(response, "grid");
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function StorageUserMapping() {
  const { postData } = servicecall();
  const queryClient = useQueryClient();

  const [selectedKey, setSelectedKey] = useState(null); 
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "mapping", data: null });

  const { data: gridResult, isLoading, isError, error } = useQuery({
    queryKey: ["storageUserMappings"],
    queryFn: () => fetchMappingDataAPI({ postData }),
    staleTime: 5 * 60 * 1000,
  });

  const rows = gridResult?.formattedData || [];

  // Stable key generator
  const getStableKey = useCallback((row) => {
    return `${row.L09FTPAliasName || ''}|${row.GroupID || ''}`.trim();
  }, []);

  // Selected row using stable key
  const selectedRow = useMemo(() => 
    rows.find(r => getStableKey(r) === selectedKey), 
    [rows, selectedKey, getStableKey]
  );

  // Auto-select first row on initial load
  useEffect(() => {
    if (rows.length > 0 && selectedKey === null) {
      setSelectedKey(getStableKey(rows[0]));
    }
  }, [rows, selectedKey, getStableKey]);

  

  const columns = useMemo(() => [
    { 
      key: "ServerName", 
      label: "Storage Created In", 
      width: 160, 
      enableSearch: true, 
      sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.ServerName || "-"}
        </span>
      ) 
    },
    { 
      key: "L09FTPAliasName", 
      label: "Storage Name", 
      width: 160, 
      enableSearch: true, 
      sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.L09FTPAliasName || "-"}
        </span>
      ) 
    },
    { 
      key: "UserMapped", 
      label: "Assigned User(s)", 
      width: 220, 
      enableSearch: true, 
      sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.UserMapped || "No users mapped"}
        </span>
      )   
    }
  ], []);

  const handleMappingClick = () => setModalConfig({ isOpen: true, type: "mapping", data: null });
  const handleExportClick = () => alert("Export not implemented yet.");
  const handlePrintClick = () => window.print();
  
  const handleCloseModal = useCallback(() => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleMappingSuccess = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["storageUserMappings"] });
    handleCloseModal();
  }, [queryClient, handleCloseModal]);

  const renderDetailPanel = useCallback(() => {
    if (!selectedRow) {
      return (
        <div className="p-6 text-center text-gray-600 font-medium">
          {rows.length === 0 ? "No storage mappings available" : "Select a row to view details"}
        </div>
      );
    }

    return (
      <div className="space-y-3 p-4">
        <DetailRow label="Storage Path" value={selectedRow.VirtualPath} />
        <DetailRow label="Storage Information" value={selectedRow.VirtualIP} />
      </div>
    );
  }, [selectedRow, rows.length]);

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-6 text-center text-red-600">Error: {error?.message}</div>;

  return (
    <>
      <PopupModal 
        isOpen={modalConfig.isOpen} 
        onClose={handleCloseModal} 
        title="Storage User Mapping"
        width="800px"
        content={
          <StorageMappingForm 
            onSubmit={(data) => console.log(data)}
            onClose={handleCloseModal}
            onSuccessRefresh={handleMappingSuccess}
          />
        } 
      />

      <div className="flex items-center justify-end gap-3 me-6 pt-3 pb-1">
        <button onClick={handleMappingClick} className="flex items-center gap-1.5 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-blue-100 transition border border-gray-200 shadow-sm">
          <Network size={14} strokeWidth={2.5} /> Mapping
        </button>
        <button onClick={handleExportClick} className="flex items-center gap-1.5 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-green-100 transition border border-gray-200 shadow-sm">
          <FileDown size={14} strokeWidth={2.5} /> Export
        </button>
        <button onClick={handlePrintClick} className="flex items-center gap-1.5 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-gray-100 transition border border-gray-200 shadow-sm">
          <Printer size={14} strokeWidth={2.5} /> Print
        </button>
      </div>

      <div className="px-0 h-full">
        <GridLayout
          columns={columns}
          data={rows}
          // IMPORTANT: Use the stable key for selection identification
          getRowId={getStableKey} 
          externalSelectedId={selectedKey}
          onRowClick={row => setSelectedKey(getStableKey(row))}
          rowClassName={row => getStableKey(row) === selectedKey ? "bg-blue-50 border-l-4 border-blue-600" : ""}
          renderDetailPanel={renderDetailPanel}
          detailPanelWidth="45%"
          height="calc(100vh - 180px)"
        />
      </div>
    </>
  );
}