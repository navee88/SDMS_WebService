import React, { useState, useEffect } from 'react';

// Adjust path as needed
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown'; 
import AnimatedInput from '../../../../Layout/Common/AnimatedInput'; 
import AuditTrail from '../../../../Layout/Common/AuditTrail'; 

const ServerDriveConfigForm = ({ initialData, onSubmit, onClose, isEditMode }) => {
  const defaultState = {
    driveConfigName: '',
    serverId: '',
    serverNameIp: '',
    serverType: 'FTP',
    serverDrivePath: '',
    portNumber: '',
    storageType: 'FTP',
    isActive: false
  };

  const [formData, setFormData] = useState(defaultState);
  
  // Audit Trail & Validation State
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showError, setShowError] = useState(false); // [1. Add showError state]

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        driveConfigName: initialData.driveConfigName || '',
        serverId: initialData.serverId || '',
        serverNameIp: initialData.serverNameIp || '',
        serverType: initialData.serverType || 'FTP',
        serverDrivePath: initialData.serverDrivePath || '',
        portNumber: initialData.portNumber || '',
        storageType: initialData.storageType || 'FTP',
        isActive: initialData.isActive || false
      });
    } else {
      setFormData(defaultState);
    }
  }, [initialData, isEditMode]);

  const handleChange = (name, value) => {
    // Clear error when user types
    if (showError) setShowError(false);

    // Optional: Auto-fill Server Name/IP when Server ID changes (mock logic)
    if (name === 'serverId') {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            serverNameIp: value // Assuming IP matches ID for this example
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // 1. Initial Submit: Validates and Opens Modal
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    
    // Validation Logic: Check if required fields are empty
    // Note: serverNameIp is auto-filled but still required
    if (
        !formData.driveConfigName.trim() || 
        !formData.serverId || 
        !formData.serverDrivePath.trim() || 
        !formData.portNumber
    ) {
        setShowError(true); // Show red borders
        return; // Stop submission
    }

    setShowError(false);
    setShowAuditTrail(true);
  };

  // 2. Final Submit: Called by AuditTrail
  const handleAuditSubmit = (auditData) => {
    const finalData = {
      ...formData,
      auditRemarks: auditData
    };
    
    onSubmit(finalData);
    setShowAuditTrail(false);
    setShowError(false);
  };

  const handleAuditClose = () => {
    setShowAuditTrail(false);
    // do not reset showError here
  };

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="space-y-6 pt-2 text-sm">
        
        {/* 1. Drive Configuration Name (Input) */}
        <div className="w-[65%]">
          <AnimatedInput
              label="Drive Configuration Name"
              name="driveConfigName"
              value={formData.driveConfigName}
              onChange={(e) => handleChange("driveConfigName", e.target.value)}
              required
              showError={showError} // [Pass showError]
          />
        </div>

        {/* 2. Server ID (Dropdown) */}
        <div className="w-[65%]">
          <AnimatedDropdown
              label="Server ID"
              name="serverId"
              value={formData.serverId}
              onChange={(e) => handleChange("serverId", e.target.value)}
              options={['DESKTOP-UJ3MUKJ', 'SERVER-002', 'SERVER-003']} 
              required
              showError={showError} // [Pass showError]
          />
        </div>

        {/* 3. Server Name/IP (Input - Readonly) */}
        <div className="w-[65%]">
          <AnimatedInput
              label="Server Name/IP"
              name="serverNameIp"
              value={formData.serverNameIp}
              onChange={(e) => handleChange("serverNameIp", e.target.value)}
              disabled={true} 
              required
              showError={showError} // [Pass showError]
          />
        </div>

        {/* 4. Server Type (Dropdown) */}
        <div className="w-[65%]">
          <AnimatedDropdown
              label="Server Type"
              name="serverType"
              value={formData.serverType}
              options={['FTP', 'SFTP', 'Local']}
              onChange={(e) => handleChange("serverType", e.target.value)}
              isSearchable={false}
              required
              showError={showError} // [Pass showError]
          />
        </div>

        {/* 5. Server Drive Path (Input) */}
        <div className="w-[65%]">
          <AnimatedInput
              label="Server Drive Path"
              name="serverDrivePath"
              value={formData.serverDrivePath}
              onChange={(e) => handleChange("serverDrivePath", e.target.value)}
              required
              showError={showError} // [Pass showError]
          />
          <p className="text-xs text-gray-500 mt-1 pl-1">
              NOTE:- Browse is not supported. Manually copy the path
          </p>
        </div>

        {/* 6. Port Number (Input) */}
        <div className="w-[65%]">
          <AnimatedInput
              label="Port Number"
              name="portNumber"
              value={formData.portNumber}
              onChange={(e) => handleChange("portNumber", e.target.value)}
              required
              type="number"
              showError={showError} // [Pass showError]
          />
        </div>

        {/* 7. Storage Type (Dropdown) */}
        <div className="w-[65%]">
          <AnimatedDropdown
              label="Storage Type"
              name="storageType"
              value={formData.storageType}
              options={['FTP', 'Local Storage', 'Cloud']}
              onChange={(e) => handleChange("storageType", e.target.value)}
              isSearchable={false}
              required
              showError={showError} // [Pass showError]
          />
        </div>

        {/* 8. Active Checkbox */}
        <div className="flex items-center gap-2 pt-2">
            <label className="font-semibold text-gray-700">Active</label>
            <input 
              type="checkbox" 
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" 
            />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
          <button 
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>Submit</span>
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </form>

      {/* Audit Trail Modal */}
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
