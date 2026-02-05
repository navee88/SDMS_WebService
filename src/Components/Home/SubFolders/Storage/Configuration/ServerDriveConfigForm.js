import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown'; 
import AnimatedInput from '../../../../Layout/Common/AnimatedInput'; 
import AuditTrail from '../../../../Layout/Common/AuditTrail'; 
import servicecall from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { AR_ajaxCall } from "./Common/AR_ajaxCall"; 

const ServerDriveConfigForm = ({ initialData, onSuccess, onError, isEditMode, onClose }) => {
  const { id: sDriveID } = initialData || {};
  const process = isEditMode ? "Edit" : "Add";
  const { postData } = servicecall();

  // ✅ States
  const [triggerAddLoad, setTriggerAddLoad] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [selectedServerType, setSelectedServerType] = useState('');

  const [formData, setFormData] = useState({
    sDriveID: '',
    driveConfigName: '',
    serverId: '',
    serverNameIp: '',
    serverType: '',
    serverDrivePath: '',
    portNumber: '',
    storageType: '',
    isActive: false
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    serverIdOptions: [],
    serverNameOptions: [],
    serverTypeOptions: [],
    storageTypeOptions: []
  });

  const [fieldDisabled, setFieldDisabled] = useState({
    driveConfigName: true,
    serverId: true,
    serverType: true,
    serverNameIp: true
  });

  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showError, setShowError] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Field → Form Field mapping
  const fieldMapping = {
    sDriveConfigName: 'driveConfigName',
    sServerID: 'serverId',
    sServerName: 'serverNameIp',
    sServerTypeID: 'serverType',
    sDriveStaticPath: 'serverDrivePath',
    iPortNo: 'portNumber',
    sStorageTypeID: 'storageType'
  };

  // ✅ 1st API: Get Server IDs + Server Types
  const { data: addModeData, isSuccess: addSuccess, isLoading: addLoading } = useQuery({
    queryKey: ["addModeData", process, triggerAddLoad],
    queryFn: async () => {
      if (process !== "Add" || !triggerAddLoad) return null;
      const userDetailsData = CF_activeUserdetails();
      const reqObj = { sActionType: "getMapFillOnControl", ...userDetailsData };
      console.log("🚀 Add Mode Request:", reqObj);
      const response = await postData("ftp/getActiveServerDescandType", reqObj);
      console.log("📥 Add Mode Response:", response);
      return response;
    },
    enabled: process === "Add" && triggerAddLoad,
  });

  // ✅ 2nd API: Get Server Name/IP based on Server ID
  const { data: serverNameData, isSuccess: serverNameSuccess } = useQuery({
    queryKey: ["serverNameData", selectedServerId],
    queryFn: async () => {
      if (!selectedServerId) return null;
      const userDetailsData = CF_activeUserdetails();
      const reqObj = {
        appname: "SDMS",
        sServerID: selectedServerId,
        ...userDetailsData
      };
      console.log("🚀 Server Name Request:", reqObj);
      const response = await postData("ftp/getServerDescBasedDetails", reqObj);
      console.log("📥 Server Name Response:", response);
      return response;
    },
    enabled: !!selectedServerId,
  });

  // ✅ 3rd API: Get Storage Types based on Server Type
  const { data: storageTypeData, isSuccess: storageTypeSuccess } = useQuery({
    queryKey: ["storageTypeData", selectedServerType],
    queryFn: async () => {
      if (!selectedServerType) return null;
      const userDetailsData = CF_activeUserdetails();
      const reqObj = {
        appname: "SDMS",
        sServerTypeID: selectedServerType,
        ...userDetailsData
      };
      console.log("🚀 Storage Type Request:", reqObj);
      const response = await postData("ftp/getServerStorageType", reqObj);
      console.log("📥 Storage Type Response:", response);
      return response;
    },
    enabled: !!selectedServerType,
  });

  // Edit Mode API
  const { data: editResponse, isSuccess: editSuccess, isLoading: isLoadingEdit } = useQuery({
    queryKey: ["editServerData", sDriveID],
    queryFn: async () => {
      if (process !== "Edit" || !sDriveID) return null;
      const userDetailsData = CF_activeUserdetails();
      const reqObj = { ...userDetailsData, sDriveID: sDriveID };
      return await postData("ftp/editGetServerDetails", reqObj);
    },
    enabled: process === "Edit" && !!sDriveID,
  });

  // ✅ Load initial dropdowns
  useEffect(() => {
    if (process === "Add" && !triggerAddLoad) {
      const timer = setTimeout(() => {
        console.log("🎯 Triggering Add Mode Data Load");
        setTriggerAddLoad(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [process, triggerAddLoad]);

  // 🔥 MAIN: Process 1st API + AUTO-SELECT Server Type [0]
  useEffect(() => {
    if (process === "Add" && addSuccess && addModeData) {
      console.log("🟢 Processing Add Mode Data:", addModeData);
      
      const serverDescArray = Array.isArray(addModeData.ServerDesc) ? addModeData.ServerDesc : [];
      const serverTypeArray = Array.isArray(addModeData.ServerType) ? addModeData.ServerType : [];

      const serverIdOptions = serverDescArray
        .map(item => ({
          value: String(item.sServerID || '').trim(),
          label: String(item.sServerDesc || '').trim()
        }))
        .filter(opt => opt.value && opt.label);

      const serverTypeOptions = serverTypeArray
        .map(item => ({
          value: String(item.sServerTypeID || '').trim(),
          label: String(item.sServerTypeName || '').trim()
        }))
        .filter(opt => opt.value && opt.label);

      console.log("✅ Server ID Options:", serverIdOptions);
      console.log("✅ Server Type Options:", serverTypeOptions);

      setDropdownOptions(prev => ({
        ...prev,
        serverIdOptions,
        serverTypeOptions
      }));

      // 🔥 AUTO-SELECT FIRST OPTIONS
      if (serverIdOptions.length > 0 && serverTypeOptions.length > 0) {
        const defaultServerId = serverIdOptions[0].value;
        const defaultServerType = serverTypeOptions[0]; 
        
        // Set Server ID & trigger cascade
        setSelectedServerId(defaultServerId);
        setSelectedServerType(defaultServerType.value);
        
        setFormData(prev => ({
          ...prev,
          serverId: defaultServerId,
          serverNameIp: serverIdOptions[0].label,
          serverType: defaultServerType.label
        }));
      }

      // ✅ Enable ONLY required fields
      setFieldDisabled({ 
        driveConfigName: false, 
        serverId: false,
        serverType: true,
        serverNameIp: true
      });
    }
  }, [process, addModeData, addSuccess]);

  // ✅ Process Server Name API
  useEffect(() => {
    if (serverNameSuccess && serverNameData?.ServerDetails) {
      const serverDetailsArray = Array.isArray(serverNameData.ServerDetails) ? serverNameData.ServerDetails : [];
      const serverNameOptions = serverDetailsArray
        .map(item => ({
          value: String(item.sServerTypeID || '').trim(),
          label: String(item.sServerName || '').trim()
        }))
        .filter(opt => opt.value && opt.label);

      console.log("✅ Server Name Options:", serverNameOptions);
      
      setDropdownOptions(prev => ({
        ...prev,
        serverNameOptions
      }));

      // ✅ Auto-populate Server Name/IP (DISABLED)
      if (serverNameOptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          serverNameIp: serverNameOptions[0].label
        }));
      }
    }
  }, [serverNameData, serverNameSuccess]);

  // ✅ Process Storage Type API
  useEffect(() => {
    if (storageTypeSuccess && storageTypeData) {
      const storageTypeArray = Array.isArray(storageTypeData) ? storageTypeData : [];
      const storageTypeOptions = storageTypeArray
        .map(item => ({
          value: String(item.sStorageTypeID || '').trim(),
          label: String(item.sStorageTypeName || '').trim()
        }))
        .filter(opt => opt.value && opt.label);

      console.log("✅ Storage Type Options:", storageTypeOptions);
      
      setDropdownOptions(prev => ({
        ...prev,
        storageTypeOptions
      }));

      if (storageTypeOptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          storageType: storageTypeOptions[0].label
        }));
      }
    }
  }, [storageTypeData, storageTypeSuccess]);

  // Edit Mode processing (unchanged)
  useEffect(() => {
    if (process === "Edit" && editSuccess && editResponse) {
      const serverDescCombo = AR_ajaxCall(editResponse["ServerDesc"] || [], "combo");
      const serverTypeCombo = AR_ajaxCall(editResponse["ServerType"] || [], "combo");
      const storageTypeCombo = AR_ajaxCall(editResponse["ServerStorageType"] || [], "combo");

      const serverIdOptions = (serverDescCombo?.options || []).map(option => ({
        value: String(option.value || ''),
        label: String(option.label || '')
      })).filter(opt => opt.value);

      const serverTypeOptions = (serverTypeCombo?.options || []).map(option => ({
        value: String(option.value || ''),
        label: String(option.label || '')
      })).filter(opt => opt.value);

      const storageTypeOptions = (storageTypeCombo?.options || []).map(option => ({
        value: String(option.value || ''),
        label: String(option.label || '')
      })).filter(opt => opt.value);

      setDropdownOptions({
        serverIdOptions,
        serverTypeOptions,
        storageTypeOptions,
        serverNameOptions: []
      });

      const ServerDetail = editResponse.ServerDetails;
      if (ServerDetail) {
        const serverMatch = editResponse.ServerDesc?.find(item => 
          String(item.sServerID || '').trim() === String(ServerDetail.sServerID || '').trim()
        );
        const serverTypeMatch = editResponse.ServerType?.find(item => 
          String(item.sServerTypeID || '').trim() === String(ServerDetail.sServerTypeID || '').trim()
        );
        const storageTypeMatch = editResponse.ServerStorageType?.find(item => 
          String(item.sStorageTypeID || '').trim() === String(ServerDetail.sStorageTypeID || '').trim()
        );

        const formDataToSet = {
          sDriveID: ServerDetail.sDriveID || '',
          driveConfigName: ServerDetail.sDriveConfigName || '',
          serverId: serverMatch?.sServerDesc || String(ServerDetail.sServerID || ''),
          serverNameIp: serverMatch?.sServerDesc || ServerDetail.sServerName || '',
          serverType: serverTypeMatch?.sServerTypeName || String(ServerDetail.sServerTypeID || ''),
          serverDrivePath: ServerDetail.sDriveStaticPath || '',
          storageType: storageTypeMatch?.sStorageTypeName || String(ServerDetail.sStorageTypeID || ''),
          isActive: !!ServerDetail.iStatus,
          portNumber: ServerDetail.iPortNo === 0 ? '' : String(ServerDetail.iPortNo || '')
        };

        setFormData(formDataToSet);
        setSelectedServerId(String(ServerDetail.sServerID || ''));
        setSelectedServerType(String(ServerDetail.sServerTypeID || ''));
        setFieldDisabled({ driveConfigName: true, serverId: true, serverType: true, serverNameIp: true });
      }
    }
  }, [process, editResponse, editSuccess]);

  // ✅ Updated handleChange - NO changes for disabled fields
  const handleChange = (name, value) => {
    if (showError) setShowError(false);
    
    if (name === 'serverId') {
      setSelectedServerId(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value, 
        serverNameIp: '', 
        storageType: ''
      }));
    } else if (name === 'serverType') {
      setSelectedServerType(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        storageType: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (apiErrors[name]) {
      const copy = { ...apiErrors };
      delete copy[name];
      setApiErrors(copy);
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const parseApiError = (response) => {
    if (response?.Message && typeof response.Message === 'object') {
      const apiKey = Object.keys(response.Message)[0];
      return {
        fieldKey: fieldMapping[apiKey] || apiKey,
        errorMsg: response.Message[apiKey]
      };
    }
    return { fieldKey: 'driveConfigName', errorMsg: 'Operation failed' };
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.driveConfigName?.trim()) errors.driveConfigName = "Drive config name is required";
    if (!formData.serverId?.trim()) errors.serverId = "Server ID is required";
    if (!formData.serverDrivePath?.trim()) errors.serverDrivePath = "Drive path is required";
    if (!formData.portNumber?.trim()) errors.portNumber = "Port number is required";
    if (!formData.serverType?.trim()) errors.serverType = "Server type is required";
    if (!formData.storageType?.trim()) errors.storageType = "Storage type is required";
    return errors;
  };

  // 🔥 UPDATED: Conditional Submit - ADD (Direct) vs EDIT (Audit Trail)
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validateForm();
    
    if (Object.keys(clientErrors).length > 0) {
      setApiErrors(clientErrors);
      setShowError(true);
      return;
    }

    setShowError(false);
    setApiErrors({});

    // ✅ ADD MODE: Direct API call (NO audit trail)
    if (process === "Add") {
      await handleDirectSubmit();
      return;
    }

    // ✅ EDIT MODE: Show audit trail screen
    setShowAuditTrail(true);
  };

  // ✅ NEW: Direct submit for ADD mode (NO audit trail)
  const handleDirectSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Find dropdown option values
      const serverTypeOption = dropdownOptions.serverTypeOptions.find(opt => opt.label === formData.serverType);
      const storageTypeOption = dropdownOptions.storageTypeOptions.find(opt => opt.label === formData.storageType);
      const serverIdOption = dropdownOptions.serverIdOptions.find(opt => opt.value === formData.serverId);

      // INSERT API ENDPOINT (NO audit trail)
      const apiEndpoint = "ftp/insertServerDetails";
      
      const payload = {
        ServerMaster: {
          sServerTypeName: formData.serverType,
          sServerTypeID: serverTypeOption?.value || formData.serverType
        },
        appname: "SDMS",
        ServerDetails: {
          sDriveConfigName: formData.driveConfigName,
          sServerID: serverIdOption?.value || formData.serverId,
          sDriveStaticPath: formData.serverDrivePath,
          sStorageTypeID: storageTypeOption?.value || formData.storageType,
          iPortNo: parseInt(formData.portNumber) || 0,
          iStatus: formData.isActive ? 1 : 0
        },
        ...CF_activeUserdetails()
      };

      console.log(`🚀 ${apiEndpoint} Payload:`, payload);
      
      const response = await postData(apiEndpoint, payload);
      console.log(`📥 ${apiEndpoint} Response:`, response);

      if (response?.Rtn === "Success") {
        console.log(`✅ Drive Config CREATED successfully!`);
        
        if (onSuccess) {
          onSuccess({
            ...formData,
            apiResponse: 'Success',
            isEditMode: false
          });
        }
        
        onClose?.();
      } else {
        console.warn(`⚠️ ${apiEndpoint} Failed:`, response);
        const { fieldKey, errorMsg } = parseApiError(response);
        setApiErrors({ [fieldKey]: errorMsg });
        setShowError(true);
      }
      
    } catch (error) {
      console.error(`❌ Add Error:`, error);
      setApiErrors({ driveConfigName: "Network error. Please try again." });
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ UPDATED: EDIT MODE ONLY - Audit trail submit
  const handleAuditSubmit = async (auditPayload) => {
    setIsSubmitting(true);
    
    try {
      // Find dropdown option values
      const serverTypeOption = dropdownOptions.serverTypeOptions.find(opt => opt.label === formData.serverType);
      const storageTypeOption = dropdownOptions.storageTypeOptions.find(opt => opt.label === formData.storageType);
      const serverIdOption = dropdownOptions.serverIdOptions.find(opt => opt.value === formData.serverId);

      // EDIT API ENDPOINT (WITH audit trail)
      const apiEndpoint = "ftp/editServerDetails";
      
      const payload = {
        ServerMaster: {
          sServerTypeName: formData.serverType,
          sServerTypeID: serverTypeOption?.value || formData.serverType
        },
        appname: "SDMS",
        ServerDetails: {
          sDriveConfigName: formData.driveConfigName,
          sServerID: serverIdOption?.value || formData.serverId,
          sDriveStaticPath: formData.serverDrivePath,
          sStorageTypeID: storageTypeOption?.value || formData.storageType,
          iPortNo: parseInt(formData.portNumber) || 0,
          iStatus: formData.isActive ? 1 : 0,
          sDriveID: formData.sDriveID
        },
        AuditTrailValues: auditPayload.AuditTrailValues,
        ...CF_activeUserdetails()
      };

      console.log(`🚀 ${apiEndpoint} Payload:`, payload);
      
      const response = await postData(apiEndpoint, payload);
      console.log(`📥 ${apiEndpoint} Response:`, response);

      if (response?.Rtn === "Success") {
        console.log(`✅ Drive Config UPDATED successfully!`);
        
        if (onSuccess) {
          onSuccess({
            ...formData,
            auditData: auditPayload?.AuditTrailValues,
            apiResponse: 'Success',
            isEditMode: true
          });
        }
        
        setShowAuditTrail(false);
        onClose?.();
      } else {
        console.warn(`⚠️ ${apiEndpoint} Failed:`, response);
        const { fieldKey, errorMsg } = parseApiError(response);
        setApiErrors({ [fieldKey]: errorMsg });
        setShowError(true);
      }
      
    } catch (error) {
      console.error(`❌ Edit Error:`, error);
      setApiErrors({ driveConfigName: "Network error. Please try again." });
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuditClose = () => {
    setShowAuditTrail(false);
    setApiErrors({});
    setShowError(false);
  };

  // Loading states
  if (process === "Edit" && isLoadingEdit) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500 font-semibold animate-pulse">Loading Drive Configuration...</div>
      </div>
    );
  }

  if (process === "Add" && addLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500 font-semibold animate-pulse">Loading dropdown options...</div>
      </div>
    );
  }

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-lg font-semibold text-gray-700 text-center">
              {isEditMode ? 'Updating...' : 'Creating Drive Configuration...'}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleInitialSubmit} className={`space-y-6 pt-2 text-sm ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="w-[65%]">
          <AnimatedInput
            label="Drive Configuration Name"
            name="driveConfigName"
            value={formData.driveConfigName}
            onChange={(e) => handleChange("driveConfigName", e.target.value)}
            disabled={fieldDisabled.driveConfigName || isSubmitting}
            required 
            showError={showError}
            errorMessage={apiErrors.driveConfigName}
          />
        </div>

        <div className="w-[65%]">
          <AnimatedDropdown
            label="Server ID "
            name="serverId"
            value={formData.serverId}
            options={dropdownOptions.serverIdOptions}
            onChange={(e) => handleChange("serverId", e.target.value)}
            disabled={fieldDisabled.serverId || isSubmitting || addLoading}
            required 
            showError={showError}
            errorMessage={apiErrors.serverId}
          />
        </div>

        <div className="w-[65%]">
          <AnimatedInput
            label="Server Name/IP"
            name="serverNameIp"
            value={formData.serverNameIp}
            onChange={(e) => handleChange("serverNameIp", e.target.value)}
            disabled={fieldDisabled.serverNameIp || isSubmitting}
            required 
            showError={showError}
            errorMessage={apiErrors.serverNameIp}
          />
        </div>

        <div className="w-[65%]">
          <AnimatedDropdown
            label="Server Type *"
            name="serverType"
            value={formData.serverType}
            options={dropdownOptions.serverTypeOptions}
            onChange={(e) => handleChange("serverType", e.target.value)}
            disabled={fieldDisabled.serverType || isSubmitting}
            isSearchable={false} 
            required 
            showError={showError}
            errorMessage={apiErrors.serverType}
          />
        </div>

        <div className="w-[65%]">
          <AnimatedInput
            label="Server Drive Path"
            name="serverDrivePath"
            value={formData.serverDrivePath}
            onChange={(e) => handleChange("serverDrivePath", e.target.value)}
            required 
            showError={showError}
            errorMessage={apiErrors.serverDrivePath}
          />
          <p className="text-xs text-gray-500 mt-1 pl-1">NOTE: Browse not supported</p>
        </div>

        <div className="w-[65%]">
          <AnimatedInput
            label="Port Number"
            name="portNumber"
            value={formData.portNumber}
            onChange={(e) => handleChange("portNumber", e.target.value)}
            type="number" 
            required 
            showError={showError}
            errorMessage={apiErrors.portNumber}
          />
        </div>

        <div className="w-[65%]">
          <AnimatedDropdown
            label="Storage Type"
            name="storageType"
            value={formData.storageType}
            options={dropdownOptions.storageTypeOptions}
            onChange={(e) => handleChange("storageType", e.target.value)}
            isSearchable={false} 
            disabled={isSubmitting}
            required 
            showError={showError}
            errorMessage={apiErrors.storageType}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <label className="font-semibold text-gray-700">Active</label>
          <input 
            type="checkbox" 
            name="isActive" 
            checked={formData.isActive}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" 
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`transition-all hover:scale-95 hover:rounded-md px-6 py-2 font-medium rounded-lg flex items-center gap-2 ${
              isSubmitting 
                ? 'btn-actionsecondary opacity-75 cursor-not-allowed' 
                : 'btn-actionprimary'
            }`}
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Submit' : 'Create Drive Config')}
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="btn-actionsecondary transition-all hover:scale-95 hover:rounded-md disabled:opacity-50 px-6 py-2 font-medium rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>

      {showAuditTrail && (
        <AuditTrail 
          isOpen={showAuditTrail}
          onClose={handleAuditClose}
          onAuthorized={handleAuditSubmit}
          actionLabel={isEditMode ? "Update" : "Create"}
          defaultReason={isEditMode ? "Updated" : "Created"}
        />
      )}
    </>
  );
};

export default ServerDriveConfigForm;
