import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown'; 
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AuditTrail from '../../../../Layout/Common/AuditTrail';

// Services
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

/* ------------------ API FETCH FUNCTIONS ------------------ */

const fetchServerTypesAPI = async ({ postData }) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { ...userDetailsData };
    const response = await postData("ftp/getServerMasterType", reqObj);
    return AR_ajaxCall(response, "combo", { labelKey: 'sServerTypeName', valueKey: 'sServerTypeName' });
};

const fetchS3RegionsAPI = async ({ postData }) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { ...userDetailsData };
    const response = await postData("ftp/getS3Region", reqObj);
    
    return AR_ajaxCall(response, "combo", { 
        labelKey: 'sRegionvalue', 
        valueKey: 'sRegionID' 
    }); 
};

// --- NEW: Fetch Single Server Details for Edit ---
const fetchServerDetailsAPI = async ({ postData, serverId }) => {
    const userDetailsData = CF_activeUserdetails();
    const reqObj = { 
        ...userDetailsData, 
        sServerID: serverId 
    };
    const response = await postData("ftp/editGetServerMaster", reqObj);
    return response?.ServerMaster || null;
};

/* ------------------ MAIN COMPONENT ------------------ */

const ServerConfigForm = ({ editServerId, onSubmit, onClose, isEditMode }) => {
  const { postData } = servicecall();

  // --- 1. Queries ---

  // A. Get Server Types
  const { data: serverTypeOptions = [] } = useQuery({
      queryKey: ['serverTypes'],
      queryFn: () => fetchServerTypesAPI({ postData }).then(res => res.options || []),
      staleTime: 30 * 60 * 1000 
  });

  // B. Get Server Details (Only runs in Edit Mode)
  const { data: serverDetails, isLoading: isLoadingDetails } = useQuery({
      queryKey: ['serverDetails', editServerId],
      queryFn: () => fetchServerDetailsAPI({ postData, serverId: editServerId }),
      enabled: isEditMode && !!editServerId, 
      staleTime: 0 
  });

  const [shouldFetchRegions, setShouldFetchRegions] = useState(false);
  
  // C. Get Regions (Conditional)
  const { data: regionOptions = [] } = useQuery({
      queryKey: ['s3Regions'],
      queryFn: () => fetchS3RegionsAPI({ postData }).then(res => res.options || []),
      enabled: shouldFetchRegions, 
      staleTime: 30 * 60 * 1000
  });

  // --- 2. State Management ---
  const defaultState = {
    serverType: 'FTP',
    serverId: '',
    serverNameIp: '',
    username: '',
    password: '',
    region: '', 
    isTomcatSame: false,
    isActive: false
  };

  const [formData, setFormData] = useState(defaultState);
  const [showPassword, setShowPassword] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showError, setShowError] = useState(false);
  const [fieldVisibility, setFieldVisibility] = useState({
      serverName: true, username: true, password: true, region: false, tomcatCheckbox: true, serverNameDisabled: false
  });

  // --- 3. Effects ---

  // Initialize Data when serverDetails arrives (Edit Mode) or Reset (Add Mode)
  useEffect(() => {
    if (isEditMode && serverDetails) {
      const type = serverDetails.sServerTypeName || 'FTP';
      
      setFormData({
        serverType: type,
        serverId: serverDetails.sServerDesc || '', 
        serverNameIp: serverDetails.sServerName || '',
        username: serverDetails.sServerUserName || '',
        password: serverDetails.sServerPassword || '',
        region: serverDetails.sRegionID || '',
        isTomcatSame: serverDetails.isTomcatFTPSameServer === true,
        isActive: serverDetails.iServerStatus === 1
      });

      handleServerTypeLogic(type, true); 

    } else if (!isEditMode) {
      setFormData(defaultState);
      handleServerTypeLogic('FTP'); 
    }
  }, [serverDetails, isEditMode]);

  // Auto-Select Region if options available and current is invalid
  useEffect(() => {
      if (regionOptions && regionOptions.length > 0) {
          const currentRegionValid = regionOptions.some(opt => opt.value === formData.region);
          
          if (!formData.region || !currentRegionValid) {
              setFormData(prev => ({ ...prev, region: regionOptions[0].value }));
          }
      }
  }, [regionOptions]); 

  // --- 4. Logic Handlers ---

  const handleServerTypeLogic = (type, isInitialLoad = false) => {
      const cleanType = (type || "").trim();
      const config = SERVER_CONFIG[cleanType] || SERVER_CONFIG["DEFAULT"];

      setFieldVisibility({
          serverName: config.hasServerName,
          username: config.hasUsername,
          password: config.hasPassword,
          region: config.hasRegion,
          tomcatCheckbox: config.hasTomcat,
          serverNameDisabled: config.disableServerName || false
      });

      setShouldFetchRegions(config.fetchRegions || false);

      if (!isInitialLoad) {
          const selectedOption = serverTypeOptions.find(opt => opt.value === cleanType);
          if (selectedOption?.sServerEndpoint) {
              setFormData(prev => ({ ...prev, serverNameIp: selectedOption.sServerEndpoint }));
          } else {
              setFormData(prev => ({ ...prev, serverNameIp: '' }));
          }
      }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (showError) setShowError(false);
    if (name === 'serverType') handleServerTypeLogic(value);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    if (!formData.serverId.trim()) isValid = false;
    if (fieldVisibility.serverName && !formData.serverNameIp.trim()) isValid = false;
    if (fieldVisibility.username && !formData.username.trim()) isValid = false;
    if (fieldVisibility.password && !formData.password.trim()) isValid = false;
    if (fieldVisibility.region && !formData.region) isValid = false; 

    if (!isValid) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setShowAuditTrail(true);
  };

  const handleAuditSubmit = (auditData) => {
    const finalData = { ...formData, auditRemarks: auditData };
    onSubmit(finalData);
    setShowAuditTrail(false);
    setShowError(false);
  };

  const handleAuditClose = () => setShowAuditTrail(false);

  // Loading State
  if (isEditMode && isLoadingDetails) {
    return (
        <div className="flex items-center justify-center h-48">
             <div className="text-gray-500 font-semibold animate-pulse">Loading Server Details...</div>
        </div>
    );
  }

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="space-y-6 pt-2 text-sm">
        
        {/* 1. Server Type - Disabled in Edit Mode */}
        {/* Added div wrapper to handle cursor-not-allowed when disabled */}
        <div className={`w-[65%] ${isEditMode ? 'cursor-not-allowed opacity-75' : ''}`}>
          <AnimatedDropdown
              label="Server Type"
              name="serverType"
              value={formData.serverType}
              options={serverTypeOptions.map(opt => opt.value)} 
              onChange={(e) => handleChange("serverType", e.target.value)}
              isSearchable={false}
              required
              showError={showError}
              disabled={isEditMode} /* Disable prop passed here */
          />
        </div>

        {/* 3.b Region - MOVED HERE */}
        {fieldVisibility.region && (
            <div className="w-[65%]">
            <AnimatedDropdown
                label="Region"
                name="region"
                value={formData.region}
                options={regionOptions.map(opt => opt.value)} 
                onChange={(e) => handleChange("region", e.target.value)}
                required
                showError={showError}
                placeholder="Select Region"
            />
            </div>
        )}

        {/* 2. Server ID */}
        <div className="w-[65%]">
          <AnimatedInput
              label="Server ID"
              name="serverId"
              value={formData.serverId}
              onChange={(e) => handleChange("serverId", e.target.value)}
              disabled={isEditMode}
              required
              showError={showError}
          />
        </div>

        {/* 3. Server Name/IP */}
        {fieldVisibility.serverName && (
            <div className="w-[65%]">
            <AnimatedInput
                label="Server Name/IP"
                name="serverNameIp"
                value={formData.serverNameIp}
                onChange={(e) => handleChange("serverNameIp", e.target.value)}
                required
                disabled={fieldVisibility.serverNameDisabled} 
                showError={showError}
            />
            </div>
        )}

        {/* 4. Username */}
        {fieldVisibility.username && (
            <div className="w-[65%]">
            <AnimatedInput
                label="Server Username"
                name="username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                required
                showError={showError}
            />
            </div>
        )}

        {/* 5. Password */}
        {fieldVisibility.password && (
            <div className="w-[65%] relative">
            <AnimatedInput
                label="Server Password"
                name="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                showError={showError}
                type={showPassword ? "text" : "password"} 
            />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-7 text-gray-400 hover:text-gray-600 z-10"
            >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            </div>
        )}

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
            {fieldVisibility.tomcatCheckbox && (
                <div className="flex items-center gap-2">
                    <label className="font-semibold text-gray-700">Is Tomcat and FTP located in Same Server</label>
                    <input 
                      type="checkbox" 
                      name="isTomcatSame"
                      checked={formData.isTomcatSame}
                      onChange={handleCheckboxChange}
                      className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" 
                    />
                </div>
            )}

            <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-700">Active</label>
                <input 
                  type="checkbox" 
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" 
                />
            </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
          <button type="submit" className="btn-actionprimary transition-all hover:scale-95 hover:rounded-md">
            <span>Submit</span>
          </button>
          <button type="button" onClick={onClose} className="btn-actionsecondary transition-all hover:scale-95 hover:rounded-md">
            Close
          </button>
        </div>
      </form>

      {/* Audit Trail */}
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

export default ServerConfigForm;
