import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Network, FileDown, Printer } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Components
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import PopupModal from "../../FTPDataView/DataExplorer/PopupModal";
import StorageMappingForm from "./StorageMappingForm";

// Services
import servicecall from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { AR_ajaxCall } from "../Configuration/Common/AR_ajaxCall"; // Adjusted import path to match reference style

/* ------------------ HELPER COMPONENTS ------------------ */

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
      {label}
    </div>
    <div className="font-bold text-[12px] text-[#353f49] font-roboto">
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

// Placeholder for future mutations if needed (matching reference structure)
const updateMappingAPI = async ({ postData, formData }) => {
    // Example structure if you need to implement update later
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { sActionType: "Update", ...userDetailsData, ...formData };
    return await postData("", reqObj);
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function StorageUserMapping() {
  const { postData } = servicecall();
  const queryClient = useQueryClient();

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "mapping", data: null });

  // 1. Fetch Data
  const { data: gridResult, isLoading, isError, error } = useQuery({
    queryKey: ["storageUserMappings"],
    queryFn: () => fetchMappingDataAPI({ postData }),
    staleTime: 5 * 60 * 1000,
  });

  const rows = gridResult?.formattedData || [];

  // 2. Define Columns
  const columns = useMemo(() => [
      { 
          key: "ServerName", 
          label: "Storage  Created In", 
          width: 150, 
          enableSearch: true, 
          sortable: true,
          render: (row, isSelected) => (
            <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
              {row.ServerName}
            </span>
          ) 
      },
      { 
          key: "L09FTPAliasName", 
          label: "Storage Name", 
          width: 150, 
          enableSearch: true, 
          sortable: true,
          render: (row, isSelected) => (
            <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
              {row.L09FTPAliasName}
            </span>
          ) 
      },
      { 
          key: "UserMapped", 
          label: "Assigned User", 
          width: 150, 
          enableSearch: true, 
          sortable: true,
           render: (row, isSelected) => (
            <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
              {row.UserMapped}
            </span>
          )  
      }
     
  ], []);

  // 3. Auto-Select First Row
  useEffect(() => {
    if (rows.length > 0 && selectedRowId === null) {
      setSelectedRowId(rows[0]._gridId);
    }
  }, [rows, selectedRowId]);

  const selectedRow = useMemo(
    () => rows.find((r) => r._gridId === selectedRowId),
    [rows, selectedRowId]
  );

  /* ------------------ MUTATIONS ------------------ */

  const onSuccessMutation = (response, successMessage) => {
    const status = AR_ajaxCall(response, "status");
    if(status.success) {
        alert(successMessage);
        queryClient.invalidateQueries(['storageUserMappings']);
        handleCloseModal();
    } else {
        alert(status.message);
    }
  };

  // Example mutation setup (even if currently mock)
  const mappingMutation = useMutation({
    mutationFn: (formData) => updateMappingAPI({ postData, formData }), 
    onSuccess: (res) => onSuccessMutation(res, "Mapping saved successfully!")
  });

  /* ------------------ RENDER DETAIL PANEL ------------------ */
  
  const renderDetailPanel = useCallback(() => {
    if (!selectedRow) return <div className="p-4 text-gray-500 font-roboto text-sm">Select a row to view details</div>;

    return (
        <div className="space-y-3">
            <DetailRow label="Storage Path" value={selectedRow.VirtualPath} />
            <DetailRow label="Storage Information" value={selectedRow.VirtualIP} />
        </div>
    );
  }, [selectedRow]);

  /* ------------------ HANDLERS ------------------ */

  const handleMappingClick = () => {
      setModalConfig({ isOpen: true, type: "mapping", data: null });
  };
  
  const handleExportClick = () => {
    alert("Exporting data to Excel/CSV...");
  };

  const handlePrintClick = () => {
    window.print();
  };
  
  const handleCloseModal = () => setModalConfig((p) => ({ ...p, isOpen: false }));
  
  const handleFormSubmit = (formData) => {
      console.log("Submitting Mapping:", formData);
      // mappingMutation.mutate(formData); // Uncomment when API is ready
      alert("Mapping saved successfully (Mock)");
      handleCloseModal();
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">{error.message}</div>;

  const responsiveHeight = "calc(100vh - 180px)"; 

  return (
    <>
      <PopupModal 
        isOpen={modalConfig.isOpen} 
        onClose={handleCloseModal} 
        title="Storage User Mapping"
        width="800px" // Matched width from reference
        content={
            <StorageMappingForm 
                onSubmit={handleFormSubmit} 
                onClose={handleCloseModal}
            />
        } 
      />

      <div className='flex items-center justify-end gap-3 me-6 pt-3 pb-1'>
          <button
            type="button"
            onClick={handleMappingClick}
            className="flex items-center gap-1.5 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-blue-100 transition whitespace-nowrap border border-gray-200"
          >
            <Network size={14} strokeWidth={2.5} /> Mapping
          </button>

          <button
            type="button"
            onClick={handleExportClick}
            className="flex items-center gap-1.5 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-green-100 transition whitespace-nowrap border border-gray-200"
          >
            <FileDown size={14} strokeWidth={2.5} /> Export
          </button>

          <button
            type="button"
            onClick={handlePrintClick}
            className="flex items-center gap-1.5 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-gray-100 transition whitespace-nowrap border border-gray-200"
          >
            <Printer size={14} strokeWidth={2.5} /> Print
          </button>
      </div>

      <div className="px-4 h-full">
        <GridLayout
            columns={columns}
            data={rows}
            getRowId={(row) => row._gridId}
            onRowClick={(row) => setSelectedRowId(row._gridId)}
            rowClassName={(row) => row._gridId === selectedRowId ? "bg-blue-50 border-l-4 border-blue-600" : ""}
            renderDetailPanel={renderDetailPanel} 
            detailPanelWidth="45%" 
            height={responsiveHeight} 
        />
      </div>
    </>
  );
}
