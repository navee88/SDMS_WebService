import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Edit } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import PopupModal from "../../FTPDataView/DataExplorer/PopupModal";
import ServerDriveConfigForm from "./ServerDriveConfigForm";

import servicecall from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { AR_ajaxCall } from "./Common/AR_ajaxCall";

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
      {label}
    </div>
    <div className="font-bold text-[12px] text-[#353f49] font-roboto">
      {typeof value === 'boolean' ? (value ? "Yes" : "No") : (value || "")}
    </div>
  </div>
);

// ✅ ONLY GRID API - No edit/submit APIs
const fetchDriveConfigsAPI = async ({ postData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { sActionType: "View", ...userDetailsData };
  const response = await postData("ftp/getServerDetails", reqObj); 
  return AR_ajaxCall(response, "grid");
};

export default function ServerDriveConfiguration() {
  const { postData } = servicecall();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "add", data: null });

  const { data: gridResult, isLoading, isError, error } = useQuery({
    queryKey: ["driveConfigs"],
    queryFn: () => fetchDriveConfigsAPI({ postData }),
    // staleTime: 5 * 60 * 1000,
     staleTime:0,
    gcTime:1000 * 60,
    refetchOnWindowFocus : true
  });

  const rows = gridResult?.formattedData || [];

  const columns = useMemo(() => [
    { key: "sServerDesc", label: "Server ID", width: 150, enableSearch: true, sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sServerDesc}
        </span>
      )
    },
    { key: "sServerName", label: "Server Name", width: 150, enableSearch: true, sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sServerName}
        </span>
      )
    },
    { key: "sDriveStaticPath", label: "Drive Path", width: 150, enableSearch: true, sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sDriveStaticPath}
        </span>
      ) 
    },
    { key: "sStatus", label: "Status", width: 100, enableSearch: true, sortable: true,
      render: (row) => {
        const status = row.sStatus || "-";
        const isActive = status.toLowerCase() === 'active';
        return (
          <span className={`font-bold ${isActive ? 'text-green-600' : 'text-red-500'}`}>
            {status}
          </span>
        );
      }
    }
  ], []);

  useEffect(() => {
    if (rows.length > 0 && selectedRowId === null) {
      setSelectedRowId(rows[0]._gridId);
    }
  }, [rows, selectedRowId]);

  const selectedRow = useMemo(
    () => rows.find((r) => r._gridId === selectedRowId),
    [rows, selectedRowId]
  );

  const renderDetailPanel = useCallback(() => {
    if (!selectedRow) return <div className="p-4 text-gray-500 font-roboto text-sm">Select a row to view details</div>;

    return (
      <div className="space-y-3">
        <DetailRow label="Port No" value={selectedRow.iPortNo} />
        <DetailRow label="Created By" value={selectedRow.sCreatedBy} />
        <DetailRow label="Created On" value={selectedRow.dCreatedOn} />
        <DetailRow label="Modified By" value={selectedRow.sModifiedBy} />
        <DetailRow label="Modified On" value={selectedRow.dModifiedOn} />
      </div>
    );
  }, [selectedRow]);

  // ✅ SIMPLIFIED: Pass ONLY ID - Form handles everything else
  const handleEditClick = () => {
    if (!selectedRow) {
      alert("Select a row");
      return;
    }
    const sDriveID = selectedRow.sDriveID || selectedRow._gridId;
    setModalConfig({ isOpen: true, type: "edit", data: { id: sDriveID } });
  };

  const handleAddClick = () => {
    setModalConfig({ 
      isOpen: true, 
      type: "add", 
      data: { id: null }
    });
  };

  const handleCloseModal = () => {
    setModalConfig((p) => ({ ...p, isOpen: false }));
  };

  // ✅ FORM CALLS THIS AFTER SUCCESSFUL SUBMIT
  const handleFormSuccess = () => {
    queryClient.invalidateQueries(['driveConfigs']);
    handleCloseModal();
  };

  // ✅ FORM CALLS THIS ON ERROR
  const handleFormError = (message) => {
    alert(message || "Operation failed");
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">{error.message}</div>;

  const responsiveHeight = "calc(100vh - 180px)"; 

  return (
    <>
      <PopupModal 
        isOpen={modalConfig.isOpen} 
        onClose={handleCloseModal} 
        title={modalConfig.type === 'edit' ? 'Edit Server Drive Configuration' : 'Add Server Drive Configuration'}
        width="500px"
        content={
          <ServerDriveConfigForm 
            initialData={modalConfig.data}  // ✅ Only { id: sDriveID } or { id: null }
            isEditMode={modalConfig.type === 'edit'}
            onSuccess={handleFormSuccess}    // ✅ Form calls this on success
            onError={handleFormError}        // ✅ Form calls this on error
            postData={postData} 
            onClose={handleCloseModal}             // ✅ Pass postData for form APIs
          />
        } 
      />

      <div className='flex items-center justify-end gap-5 me-6 pt-3 pb-1'>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-1 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-blue-100 transition whitespace-nowrap border"
        >
          <Plus size={14} strokeWidth={4} /> Add
        </button>
        <button
          type="button"
          onClick={handleEditClick}
          disabled={!selectedRow}
          className={`flex items-center gap-1 px-4 py-2 rounded text-xs font-bold transition whitespace-nowrap border ${
            !selectedRow 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-100 text-blue-600 hover:bg-blue-100 cursor-pointer'
          }`}
        >
          <Edit size={14} strokeWidth={4} />
          Edit
        </button>
      </div>

      <div className="h-full">
        <GridLayout
          columns={columns}
          data={rows}
          getRowId={(row) => row._gridId}
          onRowClick={(row) => setSelectedRowId(row._gridId)}
          rowClassName={(row) => row._gridId === selectedRowId ? "bg-blue-50 border-l-4 border-blue-600" : ""}
          renderDetailPanel={renderDetailPanel} 
          detailPanelWidth="45%" 
          height={responsiveHeight}
          externalSelectedId={selectedRowId}
        />
      </div>
    </>
  );
}
