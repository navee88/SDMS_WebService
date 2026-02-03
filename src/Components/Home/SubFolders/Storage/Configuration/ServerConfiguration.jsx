import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import GridLayout from "../../../../Layout/Common/Home/Grid/GridLayout";
import PopupModal from "../../FTPDataView/DataExplorer/PopupModal";
import ServerConfigForm from "./ServerConfigForm";

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

const fetchServersAPI = async ({ postData }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { sActionType: "View", ...userDetailsData };
  const response = await postData("ftp/getServerMaster", reqObj);
  return AR_ajaxCall(response, "grid");
};

export default function ServerConfiguration() {
  const { postData } = servicecall(); 
  const queryClient = useQueryClient();
  const { t } = useTranslation(); 

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "add", serverId: null });

  // 🔥 FIXED: Grid data query
  const { data: gridResult, isLoading, isError, error } = useQuery({
    queryKey: ["servers"],
    queryFn: () => fetchServersAPI({ postData }),
    // staleTime: 5 * 60 * 1000,
   staleTime:0,
    gcTime:1000 * 60,
    refetchOnWindowFocus : true
  });

  const rows = gridResult?.formattedData || [];

  const columns = useMemo(() => [
    { 
      key: "sServerDesc", label: "Server ID", width: 150, enableSearch: true, sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sServerDesc}
        </span>
      ) 
    },
    { 
      key: "sServerName", label: "Server Name", width: 150, enableSearch: true, sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sServerName}
        </span>
      ) 
    },
    { 
      key: "sServerTypeName", label: "Server Type", width: 150, enableSearch: true, sortable: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-gray-600 font-bold' : 'text-gray-700'}`}>
          {row.sServerTypeName}
        </span>
      ) 
    },
    { 
      key: "L44ServerStatus", label: "Server Status", width: 150, enableSearch: true, sortable: true,
      render: (row) => {
        const status = row.L44ServerStatus || row.sServerStatus || "-";
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

  // 🔥 FIXED: Mutation with proper refresh logic (LIKE ServerDriveConfigForm)
  const saveMutation = useMutation({
    mutationFn: ({ formData, type }) => {
      // Direct API call matching ServerConfigForm pattern
      const userDetailsData = CF_activeUserdetails();
      const payload = {
        ...userDetailsData,
        ServerMaster: {
          sServerTypeName: formData.serverType,
          sServerTypeID: formData.serverTypeId,
          sServerDesc: formData.serverDesc,
          sServerName: formData.serverNameIp,
          sServerUserName: formData.username,
          sServerPassword: formData.password,
          sRegion: formData.region,
          isTomcatFTPSameServer: formData.isTomcatSame ? 1 : 0,
          iServerStatus: formData.isActive ? 1 : 0,
          ...(type === 'edit' && { sServerID: formData.serverId })
        },
        ...(type === 'edit' && { AuditTrailValues: formData.auditData })
      };
      
      const endpoint = type === 'add' ? 'ftp/insertServerMaster' : 'ftp/editServerMaster';
      return postData(endpoint, payload);
    },
    onSuccess: (response) => {
      // ✅ Handle ALL success formats
      const isSuccess = response?.success || response?.Rtn === 'Success' || response?.apiResponse === 'Success';
      
      if (isSuccess) {
        console.log('✅ Server config saved successfully!', response);
        
        // 🔥 CRITICAL: Force grid refresh (ServerDriveConfigForm pattern)
        queryClient.invalidateQueries({ queryKey: ['servers'] });
        queryClient.refetchQueries({ queryKey: ['servers'] });
        
        // Reset selection for clean UI
        setSelectedRowId(null);
        
        // Close modal
        handleCloseModal();
      } else {
        console.log('❌ Save failed:', response);
      }
    },
    onError: (err) => {
      console.error('❌ Mutation error:', err);
    },
  });

  const renderDetailPanel = useCallback(() => {
    if (!selectedRow) return <div className="p-4 text-gray-500 font-roboto text-sm">Select a row to view details</div>;

    return (
      <div className="space-y-3">
        <DetailRow label="Is Tomcat & FTP on Same Server" value={selectedRow.isTomcatFTPSameServer} />
        <DetailRow label="Created By" value={selectedRow.sCreatedBy} />
        <DetailRow label="Created On" value={selectedRow.dCreatedOn} />
        <DetailRow label="Modified By" value={selectedRow.sModifiedBy} />
        <DetailRow label="Modified On" value={selectedRow.dModifiedOn} />
      </div>
    );
  }, [selectedRow]);

  const handleAddClick = () => {
    setModalConfig({ isOpen: true, type: "add", serverId: null });
  };
  
  const handleEditClick = () => {
    if (!selectedRow) return alert("Select a row");
    const idToEdit = selectedRow.sServerID || selectedRow.sServerDesc; 
    setModalConfig({ isOpen: true, type: "edit", serverId: idToEdit });
  };
  
  const handleCloseModal = () => setModalConfig((p) => ({ ...p, isOpen: false }));
  
  // 🔥 SIMPLIFIED: Just pass formData to mutation
  const handleFormSubmit = (formData) => {
    saveMutation.mutate({ formData, type: modalConfig.type });
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">{error.message}</div>;

  const responsiveHeight = "calc(100vh - 180px)"; 

  return (
    <>
      <PopupModal 
        isOpen={modalConfig.isOpen} 
        onClose={handleCloseModal} 
        title={modalConfig.type === 'edit' ? 'Edit Server Configuration' : 'Add Server Configuration'}
        width="500px"
        content={
          <ServerConfigForm 
            editServerId={modalConfig.serverId} 
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
        
      <div className="px-0 h-full"> 
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
