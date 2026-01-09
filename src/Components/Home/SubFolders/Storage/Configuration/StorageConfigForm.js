import React, { useState, useEffect } from 'react';
import { Check, Loader2, Wifi, XCircle, CheckCircle2 } from 'lucide-react';

// Common Components
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown'; 
import AnimatedInput from '../../../../Layout/Common/AnimatedInput'; 
import AuditTrail from '../../../../Layout/Common/AuditTrail'; 

const StorageConfigForm = ({ initialData, onSubmit, onClose, isEditMode }) => {
  const defaultState = {
    serverId: '',
    serverNameIp: '',
    virtualStaticIp: '',
    serverDrivePath: '',
    portNumber: '',
    storageGroupName: '',
    storageType: 'FTP',
    isRead: false,
    isWrite: false,
    isActive: false
  };

  const [formData, setFormData] = useState(defaultState);
  
  // Connection Testing UX State
  const [connectionStatus, setConnectionStatus] = useState('idle'); 
  const [statusMessage, setStatusMessage] = useState('');

  // Audit Trail & Validation State
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showError, setShowError] = useState(false); // [1. Add showError state]

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        serverId: initialData.serverId || '',
        serverNameIp: initialData.serverNameIp || '',
        virtualStaticIp: initialData.virtualStaticIp || '',
        serverDrivePath: initialData.serverDrivePath || '',
        portNumber: initialData.portNumber || '',
        storageGroupName: initialData.storageGroupName || '',
        storageType: initialData.storageType || 'FTP',
        isRead: initialData.isRead || false,
        isWrite: initialData.isWrite || false,
        isActive: initialData.isActive || false
      });
    } else {
      setFormData(defaultState);
    }
  }, [initialData, isEditMode]);

  // Reset connection status if critical fields change
  useEffect(() => {
    if (connectionStatus !== 'idle') {
        setConnectionStatus('idle');
        setStatusMessage('');
    }
  }, [formData.serverNameIp, formData.portNumber, formData.serverId]);

  const handleChange = (name, value) => {
    // Clear error when user starts typing
    if (showError) setShowError(false);

    if (name === 'serverId') {
         setFormData(prev => ({
            ...prev,
            [name]: value,
            serverNameIp: value // Mock auto-fill
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

  // Async Connection Test with Feedback
  const handleTestConnection = async () => {
      if (!formData.serverNameIp) {
          setConnectionStatus('error');
          setStatusMessage('Server IP is missing');
          return;
      }

      setConnectionStatus('checking');
      setStatusMessage('');

      setTimeout(() => {
          const isSuccess = Math.random() > 0.3; 
          if (isSuccess) {
              setConnectionStatus('success');
              setStatusMessage('Connection Established');
          } else {
              setConnectionStatus('error');
              setStatusMessage('Connection Timed Out');
          }
      }, 1500);
  };

  // 1. Initial Submit: Validates and Opens Modal
  const handleInitialSubmit = (e) => {
    e.preventDefault();

    // Validation Logic
    if (
        !formData.serverId || 
        !formData.storageGroupName.trim() ||
        !formData.serverDrivePath || 
        !formData.portNumber
    ) {
        setShowError(true); // Trigger red borders
        return;
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

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="pt-2 text-sm w-full relative">
        
        {/* CHECK BUTTON - Absolute Positioned */}
        <div className="absolute top-0 right-0 flex flex-col items-end z-10">
            <button
                type="button"
                onClick={handleTestConnection}
                className="mb-[2px] px-3 py-[4px] bg-gray-100 border border-gray-300 rounded text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs font-semibold shadow-sm h-[38px]"
            >
                <Check size={14} className="text-blue-600" strokeWidth={3} /> Check
            </button>
            
            {statusMessage && (
                <div className={`text-[10px] mt-1 font-medium transition-all duration-300 ${
                    connectionStatus === 'success' ? 'text-green-600' : 
                    connectionStatus === 'error' ? 'text-red-500' : 'text-gray-400'
                }`}>
                    {statusMessage}
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-2">
          
          {/* LEFT COLUMN */}
          <div className="space-y-5">
              
              {/* 1. Server ID (Dropdown) */}
              <div className="w-full">
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

              {/* 2. Server Drive Path (Dropdown) */}
              <div className="w-full">
                  <AnimatedDropdown
                      label="Server Drive Path"
                      name="serverDrivePath"
                      value={formData.serverDrivePath}
                      onChange={(e) => handleChange("serverDrivePath", e.target.value)}
                      options={['D:\\FTP', 'E:\\Data', '/var/www']} 
                      required
                      showError={showError} // [Pass showError]
                  />
              </div>

              {/* 3. Storage Group Name (Input) */}
              <div className="w-full">
                  <AnimatedInput
                      label="Storage Group Name"
                      name="storageGroupName"
                      value={formData.storageGroupName}
                      onChange={(e) => handleChange("storageGroupName", e.target.value)}
                      required
                      showError={showError} // [Pass showError]
                  />
              </div>

              {/* 4. Read / Write Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                      <label className="font-semibold text-gray-700">Read</label>
                      <input 
                          type="checkbox" 
                          name="isRead"
                          checked={formData.isRead}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" 
                      />
                  </div>
                  <div className="flex items-center gap-2">
                      <label className="font-semibold text-gray-700">Write</label>
                      <input 
                          type="checkbox" 
                          name="isWrite"
                          checked={formData.isWrite}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" 
                      />
                  </div>
              </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
              
              {/* 1. Server Name/IP (Input - Readonly/Disabled) */}
              <div className="w-full">
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

              {/* 2. Virtual/Static IP (Input - Optional) */}
              <div className="w-full">
                  <AnimatedInput
                      label="Virtual/Static IP (Optional)"
                      name="virtualStaticIp"
                      value={formData.virtualStaticIp}
                      onChange={(e) => handleChange("virtualStaticIp", e.target.value)}
                      // Not required, so no showError needed strictly, but good practice if it became required
                  />
              </div>

              {/* 3. Port Number (Input) */}
              <div className="w-full">
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

              {/* 4. Storage Type (Input - Readonly) */}
              <div className="w-full">
                  <AnimatedInput
                      label="Storage Type"
                      name="storageType"
                      value={formData.storageType}
                      onChange={(e) => handleChange("storageType", e.target.value)}
                      disabled={true} 
                      required
                      showError={showError} // [Pass showError]
                  />
              </div>
               
               {/* 5. Active Checkbox */}
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
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 mt-6">
          <button 
            type="submit"
            disabled={connectionStatus === 'checking'}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            <span className="flex items-center gap-1">Submit</span>
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
          onClose={() => setShowAuditTrail(false)}
          onAuthorized={handleAuditSubmit}
          actionLabel={isEditMode ? "Update" : "Create"}
          defaultReason={isEditMode ? "Updated" : "Created"}
        />
      )}
    </>
  );
};

export default StorageConfigForm;
