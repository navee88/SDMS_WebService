import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Components
import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import PopupModal from "../../FTPDataView/DataExplorer/PopupModal";
import StorageConfigForm from "./StorageConfigForm";

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
        typeof value === 'boolean' ? (value ? "Yes" : "No") : (value || "-")
      }
    </div>
  </div>
);

/* ------------------ DATA FETCHING ------------------ */

const fetchStorageConfigsAPI = async ({ postData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { sActionType: "View", ...userDetailsData };
  const response = await postData("ftp/getFTPMaster", reqObj);
  return AR_ajaxCall(response, "grid");
};

const addStorageConfigAPI = async ({ postData, formData }) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { sActionType: "Insert", ...userDetailsData, ...formData };
    return await postData("ftp/getFTPMaster", reqObj);
};

const updateStorageConfigAPI = async ({ postData, formData }) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { sActionType: "Update", ...userDetailsData, ...formData };
    return await postData("ftp/getFTPMaster", reqObj);
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function StorageConfiguration() {
  const { postData } = servicecall();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "add", data: null });

  // 1. Fetch Data
  const { data: gridResult, isLoading, isError, error } = useQuery({
    queryKey: ["storageConfigs"],
    queryFn: () => fetchStorageConfigsAPI({ postData }),
    staleTime: 5 * 60 * 1000,
  });

  const rows = gridResult?.formattedData || [];

  // 2. Define Columns
    // 2. Define Columns
  const columns = useMemo(() => [
      { 
          key: "sServerNameIp", 
          label: "Server Name/IP", 
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
          key: "sStorageGroupName", 
          label: "Storage Name", 
          width: 150, 
          enableSearch: true, 
          sortable: true,
          render: (row, isSelected) => (
            <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
              {row.sFTPAliasName}
            </span>
          ) 
      },
      // --- FIXED READ COLUMN ---
      {
        key: "iStatusRead",
        label: "RD",
        width: 70, 
        sortable: false, 
        render: (row) => {
            const isChecked = row.iStatusRead == 1 || row.iStatusRead === true || row.iStatusRead === "true";
            
            return (
                <div className="flex items-center justify-start h-full">
                    <input 
                        type="checkbox" 
                        checked={isChecked} 
                        readOnly // Makes it display-only (user clicks Edit button to change)
                        className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-default"
                    />
                </div>
            );
        }
      },

      { 
          key: "iStatusWrite", 
          label: "WR", 
          width: 70,
          sortable: false,
          render: (row) => {
             
             const isChecked = row.iStatusWrite == 1 || row.bIsWrite === true || row.bIsWrite === "true";
             return (
                <div className="flex items-center justify-start h-full select-disable">
                    <input 
                        type="checkbox" 
                        checked={isChecked} 
                        readOnly 
                        className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-default"
                    />
                </div>
             );
          }
      },
      { 
          key: "sStatus", 
          label: "Status", 
          width: 150, 
          enableSearch: true, 
          sortable: true,
          render: (row) => {
             const status = row.sFTPStatus || "-";
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
        queryClient.invalidateQueries(['storageConfigs']);
        handleCloseModal();
    } else {
        alert(status.message);
    }
  };

  const addMutation = useMutation({
    mutationFn: (formData) => addStorageConfigAPI({ postData, formData }),
    onSuccess: (res) => onSuccessMutation(res, "Storage configuration added successfully!")
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => updateStorageConfigAPI({ postData, formData }),
    onSuccess: (res) => onSuccessMutation(res, "Storage configuration updated successfully!")
  });

  /* ------------------ RENDER DETAIL PANEL ------------------ */
  
  const renderDetailPanel = useCallback(() => {
    if (!selectedRow) return <div className="p-4 text-gray-500 font-roboto text-sm">Select a row to view details</div>;

    return (
        <div className="space-y-3">
            <DetailRow label="Storage Path" value={selectedRow.sFTPVirtualPathDirectory} />
            <DetailRow label="Storage Information" value={selectedRow.sFTPVirtualDirectoryName} />
            <DetailRow label="Virtual/Static IP" value={selectedRow.sVirtualIp} />
            <DetailRow label="Port Number" value={selectedRow.iPortNumber} />
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

    // DATA MAPPING: Grid -> Form
    const editData = {
        serverNameIp: selectedRow.sServerNameIp || '',
        storageGroupName: selectedRow.sStorageGroupName || '',
        serverDrivePath: selectedRow.sServerDrivePath || '',
        portNumber: selectedRow.iPortNumber || '',
        storageType: selectedRow.sStorageType || 'FTP',
        
        // Ensure these map correctly from the row data used in the columns
        isRead: selectedRow.iStatusRead === true || selectedRow.iStatusRead === 'true' || selectedRow.iStatusRead === 1,
        isWrite: selectedRow.bIsWrite === true || selectedRow.bIsWrite === 'true' || selectedRow.bIsWrite === 1,
        
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
        title={modalConfig.type === 'edit' ? 'Edit Storage Configuration' : 'Add Storage Configuration'}
        width="800px"
        content={
            <StorageConfigForm 
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
