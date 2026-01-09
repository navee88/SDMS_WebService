import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Components
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import PopupModal from "../../FTPDataView/DataExplorer/PopupModal";
import ServerDriveConfigForm from "./ServerDriveConfigForm";

// Services
import servicecall from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { AR_ajaxCall } from "./Common/AR_ajaxCall";

/* ------------------ HELPER COMPONENTS ------------------ */

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="font-bold text-[12px] text-[#405F7D] font-roboto">
      {label}
    </div>
    <div className="font-bold text-[12px] text-[#353f49] font-roboto">
      {
        // Handle boolean values explicitly
        typeof value === 'boolean' ? (value ? "Yes" : "No") : (value || "-")
      }
    </div>
  </div>
);

/* ------------------ DATA FETCHING ------------------ */

const fetchDriveConfigsAPI = async ({ postData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { sActionType: "View", ...userDetailsData };
  const response = await postData("ftp/getServerDetails", reqObj); 
  return AR_ajaxCall(response, "grid");
};

const addDriveConfigAPI = async ({ postData, formData }) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { sActionType: "Insert", ...userDetailsData, ...formData };
    return await postData("ftp/getServerDetails", reqObj);
};

const updateDriveConfigAPI = async ({ postData, formData }) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { sActionType: "Update", ...userDetailsData, ...formData };
    return await postData("ftp/getServerDetails", reqObj);
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function ServerDriveConfiguration() {
  const { postData } = servicecall();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "add", data: null });

  // 1. Fetch Data
  const { data: gridResult, isLoading, isError, error } = useQuery({
    queryKey: ["driveConfigs"],
    queryFn: () => fetchDriveConfigsAPI({ postData }),
    staleTime: 5 * 60 * 1000,
  });

  const rows = gridResult?.formattedData || [];

  // 2. Define Columns
  const columns = useMemo(() => [
      { 
          key: "sServerDesc", 
          label: "Server ID", 
          width: 150, 
          enableSearch: true, 
          sortable: true,
           render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sServerDesc}
        </span>
      )
      },
       { 
          key: "sServerName", 
          label: "Server Name", 
          width: 150,
          enableSearch: true,
          sortable: true,
          render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sServerName}
        </span>
      )
      },
      { 
          key: "sDriveStaticPath", 
          label: "Drive Path", 
          width: 150, 
          enableSearch: true, 
          sortable: true,
          render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sDriveStaticPath}
        </span>
      ) 
      },
      { 
          key: "sStatus", 
          label: "Status", 
          width: 100, 
          enableSearch: true, 
          sortable: true,
          render: (row) => {
             const status = row.sStatus || "-";
             const isActive = status.toLowerCase() === 'active';
             return (
                 <span className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                     {status}
                 </span>
             );
          }
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
        queryClient.invalidateQueries(['driveConfigs']);
        handleCloseModal();
    } else {
        alert(status.message);
    }
  };

  const addMutation = useMutation({
    mutationFn: (formData) => addDriveConfigAPI({ postData, formData }),
    onSuccess: (res) => onSuccessMutation(res, "Configuration added successfully!")
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => updateDriveConfigAPI({ postData, formData }),
    onSuccess: (res) => onSuccessMutation(res, "Configuration updated successfully!")
  });

  /* ------------------ RENDER DETAIL PANEL ------------------ */
  
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

  /* ------------------ HANDLERS ------------------ */

  const handleAddClick = () => {
      setModalConfig({ isOpen: true, type: "add", data: null });
  };
  
  const handleEditClick = () => {
    if (!selectedRow) return alert("Select a row");

    // DATA MAPPING: Convert Grid Data -> Form Data Format
    const editData = {
        driveConfigName: selectedRow.sDriveConfigName || '',
        serverId: selectedRow.sServerDesc || '',
        serverType: selectedRow.sServerType || '',
        serverDrivePath: selectedRow.sServerDrivePath || '',
        portNumber: selectedRow.iPortNumber || selectedRow.iPortNo || '', 
        isActive: (selectedRow.sStatus || '').toLowerCase() === 'active'
    };

    setModalConfig({ isOpen: true, type: "edit", data: editData });
  };
  
  const handleCloseModal = () => setModalConfig((p) => ({ ...p, isOpen: false }));
  
  const handleFormSubmit = (formData) => {
      if (modalConfig.type === 'add') {
          addMutation.mutate(formData);
      } else {
          updateMutation.mutate(formData);
      }
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
        width="600px"
        content={
            <ServerDriveConfigForm 
                initialData={modalConfig.data} 
                isEditMode={modalConfig.type === 'edit'}
                onSubmit={handleFormSubmit} 
                onClose={handleCloseModal}
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
                className="flex items-center gap-1 bg-gray-100 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-blue-100 transition whitespace-nowrap border cursor-pointer"
              >
                <Edit size={14} strokeWidth={4} /> Edit
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
