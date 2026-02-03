import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown'; 
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AuditTrail from '../../../../Layout/Common/AuditTrail';

import servicecall from "../../../../../Services/servicecall";
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { AR_ajaxCall } from "./Common/AR_ajaxCall";

// --- CONFIGURATION MAPPING ---
const SERVER_CONFIG = {
  "AzureBlob": { hasRegion: false, hasServerName: true, disableServerName: true, hasUsername: true, hasPassword: true, hasTomcat: false },
  "AmazonS3_Credential": { hasRegion: true, fetchRegions: true, hasServerName: false, hasUsername: true, hasPassword: true, hasTomcat: false },
  "AmazonS3-Credential": { hasRegion: true, fetchRegions: true, hasServerName: false, hasUsername: true, hasPassword: true, hasTomcat: false },
  "AmazonS3_EC2": { hasRegion: true, fetchRegions: true, hasServerName: false, hasUsername: false, hasPassword: false, hasTomcat: false },
  "AmazonS3-EC2": { hasRegion: true, fetchRegions: true, hasServerName: false, hasUsername: false, hasPassword: false, hasTomcat: false },
  "FTP": { hasRegion: false, hasServerName: true, hasUsername: true, hasPassword: true, hasTomcat: true },
  "SFTP": { hasRegion: false, hasServerName: true, hasUsername: true, hasPassword: true, hasTomcat: true },
  "DEFAULT": { hasRegion: false, hasServerName: true, hasUsername: true, hasPassword: true, hasTomcat: false }
};

const ENDPOINT_TYPES = ['AzureBlob', 'AmazonS3_Credential', 'AmazonS3-Credential', 'AmazonS3_EC2', 'AmazonS3-EC2'];

const fieldMapping = {
  sServerName: 'serverNameIp',
  sServerUserName: 'username',
  sServerPassword: 'password',
  sServerID: 'serverId',
  sServerDesc: 'serverDesc',
  sRegionID: 'region',
  sServerTypeName: 'serverType'
};

/* ---------------- API HELPERS ---------------- */
const fetchServerTypesAPI = async ({ postData }) => {
  const reqObj = CF_activeUserdetails();
  const response = await postData("ftp/getServerMasterType", reqObj);
  return AR_ajaxCall(response, "combo", {
    labelKey: 'sServerTypeName',
    valueKey: 'sServerTypeID'
  });
};

const fetchS3RegionsAPI = async ({ postData }) => {
  const reqObj = CF_activeUserdetails();
  const response = await postData("ftp/getS3Region", reqObj);
  return AR_ajaxCall(response, "combo", {
    labelKey: 'sRegionvalue',
    valueKey: 'sRegionID'
  });
};

const fetchServerDetailsAPI = async ({ postData, serverId }) => {
  const userDetailsData = CF_activeUserdetails();
  const reqObj = { ...userDetailsData, sServerID: serverId };
  const response = await postData("ftp/editGetServerMaster", reqObj);
  return response?.ServerMaster || null;
};

/* ---------------- MAIN ---------------- */
const ServerConfigForm = ({ editServerId, onSubmit, onClose, isEditMode = false }) => {
  const { postData } = servicecall();

  const [formData, setFormData] = useState({
    serverType: '', 
    serverId: '',
    serverDesc: '',
    serverTypeId: '',
    serverNameIp: '',
    username: '',
    password: '',
    region: '',
    isTomcatSame: false,
    isActive: false
  });

  const [apiErrors, setApiErrors] = useState({});
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shouldFetchRegions, setShouldFetchRegions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [fieldVisibility, setFieldVisibility] = useState({});

  /* ---------------- QUERIES ---------------- */
  const { data: serverTypeOptions = [] } = useQuery({
    queryKey: ['serverTypes'],
    queryFn: () => fetchServerTypesAPI({ postData }).then(r => r.options || [])
  });

  const { data: serverDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['serverDetails', editServerId],
    queryFn: () => fetchServerDetailsAPI({ postData, serverId: editServerId }),
    enabled: isEditMode && !!editServerId, 
    staleTime: 0 
  });

  const { data: regionOptions = [] } = useQuery({
    queryKey: ['s3Regions'],
    queryFn: () => fetchS3RegionsAPI({ postData }).then(r => r.options || []),
    enabled: shouldFetchRegions
  });

  /* ---------------- HELPERS ---------------- */
  const parseApiError = (response) => {
    if (response?.Message && typeof response.Message === 'object') {
      const apiKey = Object.keys(response.Message)[0];
      return {
        fieldKey: fieldMapping[apiKey] || apiKey,
        errorMsg: response.Message[apiKey]
      };
    }
    return { fieldKey: 'serverId', errorMsg: response?.Message || 'Operation failed' };
  };

  const handleServerTypeLogic = (typeName, isInitialLoad = false) => {
    const cleanType = (typeName || "").trim();
    const config = SERVER_CONFIG[cleanType] || SERVER_CONFIG.DEFAULT;
    setShouldFetchRegions(config.fetchRegions || false);
    
    if (!isInitialLoad && serverTypeOptions.length > 0) {
      const selectedOption = serverTypeOptions.find(opt => opt.label === cleanType);
      if (ENDPOINT_TYPES.includes(cleanType) && selectedOption?.sServerEndpoint) {
        setFormData(prev => ({ ...prev, serverNameIp: selectedOption.sServerEndpoint }));
      } else {
        setFormData(prev => ({ ...prev, serverNameIp: '' }));
      }
    }
    
    setFieldVisibility({
      hasRegion: config.hasRegion || false,
      hasServerName: config.hasServerName !== false,
      disableServerName: config.disableServerName || false,
      hasUsername: config.hasUsername !== false,
      hasPassword: config.hasPassword !== false,
      hasTomcat: config.hasTomcat !== false
    });
  };

  /* ---------------- EFFECTS ---------------- */
  
  // Auto-select first index on load for Add Mode
  useEffect(() => {
    if (!isEditMode && serverTypeOptions.length > 0 && !formData.serverType) {
      const firstType = serverTypeOptions[0];
      setFormData(prev => ({ 
        ...prev, 
        serverType: firstType.value,
        serverTypeId: firstType.value 
      }));
      handleServerTypeLogic(firstType.label, false);
    }
  }, [serverTypeOptions, isEditMode]);

  useEffect(() => {
    if (isEditMode && serverDetails) {
      const typeName = serverDetails.sServerTypeName || 'FTP';
      const typeId = serverDetails.sServerTypeID || '';
      setFormData({
        serverType: typeId,
        serverId: serverDetails.sServerID || '',
        serverDesc: serverDetails.sServerDesc || '',
        serverTypeId: typeId,
        serverNameIp: serverDetails.sServerName || '',
        username: serverDetails.sServerUserName || '',
        password: serverDetails.sServerPassword || '',
        region: serverDetails.sRegionID || '',
        isTomcatSame: serverDetails.isTomcatFTPSameServer === true,
        isActive: serverDetails.iServerStatus === 1
      });
      handleServerTypeLogic(typeName, true);
    }
  }, [serverDetails, isEditMode]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (name, value) => {
    if (name === 'serverType') {
      const selectedOption = serverTypeOptions.find(opt => String(opt.value) === String(value));
      setFormData(prev => ({
        ...prev,
        serverType: value,
        serverTypeId: value,
        serverId: '',
        serverNameIp: '',
        username: '',
        password: '',
        region: ''
      }));
      handleServerTypeLogic(selectedOption?.label || '', false);
      setApiErrors({});
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (apiErrors[name]) {
      const newErrors = { ...apiErrors };
      delete newErrors[name];
      setApiErrors(newErrors);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.serverId?.trim()) errors.serverId = "Required";
    if (fieldVisibility.hasServerName && !formData.serverNameIp?.trim()) errors.serverNameIp = "Required";
    if (fieldVisibility.hasUsername && !formData.username?.trim()) errors.username = "Required";
    if (fieldVisibility.hasPassword && !formData.password?.trim()) errors.password = "Required";
    return errors;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length) {
      setApiErrors(clientErrors);
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    setApiErrors({});
    try {
      const selectedType = serverTypeOptions.find(opt => opt.value === formData.serverType);
      const payload = {
        ...CF_activeUserdetails(),
        ServerMaster: {
          sServerTypeName: selectedType?.label || '',
          sServerTypeID: formData.serverTypeId,     
          sServerDesc: formData.serverId,          
          sServerName: formData.serverNameIp,
          sServerUserName: formData.username,
          sServerPassword: formData.password,
          sRegion: formData.region,
          isTomcatFTPSameServer: formData.isTomcatSame ? 1 : 0,
          iServerStatus: formData.isActive ? 1 : 0
        }
      };

      const response = await postData("ftp/insertServerMaster", payload);
      if (response?.Rtn === "Success") {
        onSubmit({ ...formData });
        onClose();
      } else {
        const { fieldKey, errorMsg } = parseApiError(response);
        setApiErrors({ [fieldKey]: errorMsg });
        setShowError(true);
      }
    } catch (err) {
      setApiErrors({ serverId: "Network error occurred." });
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuditSubmit = async (auditPayload) => {
    try {
      const selectedType = serverTypeOptions.find(opt => opt.value === formData.serverType);
      const payload = {
        ...CF_activeUserdetails(),
        ServerMaster: {
          sServerTypeName: selectedType?.label || '',
          sServerTypeID: formData.serverTypeId,     
          sServerDesc: formData.serverDesc,          
          sServerName: formData.serverNameIp,
          sServerUserName: formData.username,
          sServerPassword: formData.password,
          sServerID: formData.serverId,             
          sRegion: formData.region,
          isTomcatFTPSameServer: formData.isTomcatSame ? 1 : 0,
          iServerStatus: formData.isActive ? 1 : 0
        },
        AuditTrailValues: auditPayload.AuditTrailValues
      };

      const response = await postData("ftp/editServerMaster", payload);
      if (response?.Rtn === "Success") {
        onSubmit({ ...formData, isEditMode: true });
        onClose();
      } else {
        const { fieldKey, errorMsg } = parseApiError(response);
        setApiErrors({ [fieldKey]: errorMsg });
        setShowError(true);
        setShowAuditTrail(false);
      }
    } catch (err) {
      setApiErrors({ serverId: "Failed to update." });
      setShowError(true);
    }
  };

  if (isEditMode && isLoadingDetails) {
    return <div className="p-10 text-center animate-pulse">Loading Server Details...</div>;
  }

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
             <div className="w-10 h-10 border-4 border-t-blue-600 border-blue-100 rounded-full animate-spin"></div>
             <p className="font-medium text-gray-700">Processing Request...</p>
          </div>
        </div>
      )}

      <form onSubmit={isEditMode ? (e) => { e.preventDefault(); setShowAuditTrail(true); } : handleAddSubmit} className="space-y-6 pt-2">
        
        <div className={`w-[65%] ${isEditMode ? 'cursor-not-allowed opacity-75' : ''}`}>
          <AnimatedDropdown
            label="Server Type"
            name="serverType"
            value={formData.serverType}
            options={serverTypeOptions} 
            onChange={(e) => handleChange("serverType", e.target.value)}
            disabled={isEditMode}
            required
            showError={showError}
            errorMessage={apiErrors.serverType}
          />
        </div>

        <div className="w-[65%]">
          <AnimatedInput
            label="Server ID"
            name="serverId"
            value={isEditMode ? (formData.serverDesc || formData.serverId) : formData.serverId} 
            onChange={(e) => handleChange("serverId", e.target.value)}
            disabled={isEditMode}
            required
            showError={showError}
            errorMessage={apiErrors.serverId}
          />
        </div>

        {fieldVisibility.hasServerName && (
          <div className="w-[65%]">
            <AnimatedInput
              label="Server Name/IP"
              name="serverNameIp"
              value={formData.serverNameIp}
              onChange={(e) => handleChange("serverNameIp", e.target.value)}
              disabled={fieldVisibility.disableServerName}
              required
              showError={showError}
              errorMessage={apiErrors.serverNameIp}
            />
          </div>
        )}

        {fieldVisibility.hasUsername && (
          <div className="w-[65%]">
            <AnimatedInput
              label="Server Username"
              name="username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
              showError={showError}
              errorMessage={apiErrors.username}
            />
          </div>
        )}

        {fieldVisibility.hasPassword && (
          <div className="w-[65%] relative">
            <AnimatedInput
              label="Server Password"
              name="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              showError={showError}
              errorMessage={apiErrors.password}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-7 text-gray-400">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        )}

        {/* --- TOMCAT CHECKBOX --- */}
        {fieldVisibility.hasTomcat && (
          <div className="flex items-center gap-2 pt-2">
            <label className="font-semibold text-gray-700 text-[14px]">Is Tomcat and FTP located in Same Server</label>
            <input 
              type="checkbox" 
              name="isTomcatSame"
              className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
              checked={formData.isTomcatSame}
              onChange={handleCheckboxChange}
            />
          </div>
        )}

        {/* --- ACTIVE CHECKBOX --- */}
        <div className="flex items-center gap-2 pt-2">
          <label className="font-semibold text-gray-700 text-[14px]">Active</label>
          <input 
            type="checkbox" 
            name="isActive"
            className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
            checked={formData.isActive}
            onChange={handleCheckboxChange}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button type="submit" 
          className="btn-actionprimary px-6 py-2 rounded-lg font-medium transition-transform hover:scale-95"
          >
            {isEditMode ? 'Update Server' : 'Create Server'}
          </button>
          <button type="button" onClick={onClose} 
            className="btn-actionsecondary transition-all hover:scale-95 hover:rounded-md disabled:opacity-50 px-6 py-2 font-medium rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>

      {showAuditTrail && (
        <AuditTrail 
          isOpen={showAuditTrail}
          onClose={() => setShowAuditTrail(false)}
          onAuthorized={handleAuditSubmit}
          actionLabel="Update"
        />
      )}
    </>
  );
};

export default ServerConfigForm;