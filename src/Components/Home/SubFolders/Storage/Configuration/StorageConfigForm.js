import React, { useState, useEffect, useCallback } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import { FTP_ajaxCall } from './Common/Commonfun';
import { AR_ajaxCall } from './Common/AR_ajaxCall';
import { useAlerts } from './Common/alertenumeration';
import { StatusMsg } from './Common/enumeration';
import Errordialog from '../../../../Layout/Common/Errordialog';

const StorageConfigForm = ({ initialData, onSubmit, onClose, isEditMode }) => {
  const { sFTPID } = initialData || {};
  const process = isEditMode ? "Edit" : "Add";
  const { postData } = servicecall();
  const alerts = useAlerts();
  const statusMsgObj = StatusMsg();
  const activeUserDetails = CF_activeUserdetails();

  const [formData, setFormData] = useState({
    serverId: '',
    serverNameIp: '',
    virtualStaticIp: '',
    serverDrivePath: '',
    portNumber: '',
    storageGroupName: '',
    storageType: '',
    serverTypeName: '',
    isRead: true,
    isWrite: true,
    isActive: false,
    sFTPID: ''
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    serverOptions: [],
    driveOptions: []
  });

  const [fieldDisabled, setFieldDisabled] = useState({
    serverId: false,
    serverDrivePath: false
  });

  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showError, setShowError] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverTypeName, setServerTypeName] = useState('');

  // Confirmation dialog states
  const [showActiveConfirm, setShowActiveConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [initialActive, setInitialActive] = useState(true);

  // ────────────────────────────────────────────────
  //              EDIT MODE - Load existing data
  // ────────────────────────────────────────────────
  const {
    data: editResponse,
    isSuccess: editSuccess,
    isLoading: editLoading
  } = useQuery({
    queryKey: ["editFTPMaster", sFTPID],
    queryFn: async () => {
      if (process !== "Edit" || !sFTPID) return null;
      const reqObj = { ...activeUserDetails, sFTPID };
      return await postData("ftp/editGetFTPMaster", reqObj);
    },
    enabled: process === "Edit" && !!sFTPID,
  });

  useEffect(() => {
    if (process === "Edit" && editSuccess && editResponse) {
      const processResult = FTP_ajaxCall(editResponse, { process: "editGetData" });

      if (processResult.success) {
        setFormData(processResult.formData);

        if (editResponse.lstServerMaster?.length > 0) {
          const serverTypeNameFromAPI = editResponse.lstServerMaster[0].sServerTypeName;
          setServerTypeName(serverTypeNameFromAPI);
          setFormData(prev => ({ ...prev, serverTypeName: serverTypeNameFromAPI }));
        }

        setDropdownOptions({
          serverOptions: processResult.dropdownData?.serverOptions || [],
          driveOptions: processResult.dropdownData?.driveOptions || []
        });

        setFieldDisabled({ serverId: true, serverDrivePath: true });

        setInitialActive(!!processResult.formData.isActive);
      }
    }
  }, [editResponse, editSuccess, process]);

  // ────────────────────────────────────────────────
  //             ADD MODE - Load dropdowns
  // ────────────────────────────────────────────────
  const {
    data: serversResponse,
    isSuccess: serversSuccess,
    isLoading: serversLoading,
    refetch: refetchDrives
  } = useQuery({
    queryKey: ["add-ftp-servers",formData.serverId],
    queryFn: async () => {
      if (process !== "Add" || !formData.serverId) return null;
      const payload = {
        appname: "SDMS",
        sServerID: formData.serverId,
        ...activeUserDetails
      };
      return await postData("ftp/getServerDetailsRelatedServerMaster", payload);
    },
    enabled: process === "Add",
  });

  const {
    data: activeResponse,
    isSuccess: activeSuccess,
    isLoading: activeLoading
  } = useQuery({
    queryKey: ["add-ftp-active"],
    queryFn: async () => {
      if (process !== "Add") return null;
      const payload = { appname: "SDMS", ...activeUserDetails };
      return await postData("ftp/getActiveServerMaster", payload);
    },
    enabled: process === "Add",
  });

  useEffect(() => {
    if (process !== "Add") return;

    const serverList = Array.isArray(activeResponse) ? activeResponse : [];
    const driveList = Array.isArray(serversResponse) ? serversResponse : [];

    let serverOptions = [];
    let driveOptions = [];

    try {
      const serverResult = AR_ajaxCall(serverList, "combo", {
        labelKey: "sServerDesc",
        valueKey: "sServerID",
      });
      serverOptions = (serverResult?.options || []).map((opt, index) => {
        const original = serverList[index];
        if (!original) return opt;
        return {
          ...opt,
          extra: {
            serverTypeName: original.sServerTypeName || "FTP",
            serverName: original.sServerName || opt.label
          }
        };
      });
    } catch (err) {
      console.warn("AR_ajaxCall failed for servers:", err);
    }

    if (serverOptions.length === 0 && serverList.length > 0) {
      serverOptions = serverList.map(item => ({
        label: item.sServerDesc || item.sServerName || `Server ${item.sServerID || ''}`,
        value: item.sServerID || '',
        extra: {
          serverTypeName: item.sServerTypeName || "FTP",
          serverName: item.sServerName
        }
      }));
    }

    try {
      const driveResult = AR_ajaxCall(driveList, "combo", {
        labelKey: "sDriveStaticPath",
        valueKey: "sDriveID",
      });
      driveOptions = (driveResult?.options || []).map((opt, index) => {
        const original = driveList[index];
        if (!original) return opt;
        return {
          ...opt,
          extra: {
            portNo: original.iPortNo,
            storageType: original.sStorageTypeName || "FTP",
            serverName: original.sServerName
          }
        };
      });
    } catch (err) {
      console.warn("AR_ajaxCall failed for drives:", err);
    }

    if (driveOptions.length === 0 && driveList.length > 0) {
      driveOptions = driveList.map(item => ({
        label: item.sDriveStaticPath || `Drive ${item.sDriveID || ''}`,
        value: item.sDriveID || '',
        extra: {
          portNo: item.iPortNo,
          storageType: item.sStorageTypeName || "FTP",
          serverName: item.sServerName
        }
      }));
    }

    setDropdownOptions({ serverOptions, driveOptions });

    if (serverOptions.length > 0 && !formData.serverId) {
      const first = serverOptions[0];
      setFormData(prev => ({
        ...prev,
        serverId: first.value,
        serverNameIp: first.extra?.serverName || first.label || "",
        serverTypeName: first.extra?.serverTypeName || prev.serverTypeName || "FTP"
      }));
    }

    if (driveOptions.length > 0 && !formData.serverDrivePath) {
      const first = driveOptions[0];
      setFormData(prev => ({
        ...prev,
        serverDrivePath: first.value,
        storageType: first.extra?.storageType || "FTP",
        portNumber: first.extra?.portNo != null ? String(first.extra.portNo) : prev.portNumber || "",
        serverNameIp: first.extra?.serverName || prev.serverNameIp || ""
      }));
    }
  }, [
    process,
    serversSuccess,
    activeSuccess,
    serversResponse,
    activeResponse,
    formData.serverId,
    formData.serverDrivePath
  ]);

  // ────────────────────────────────────────────────
  //             TEST CONNECTION
  // ────────────────────────────────────────────────
  const handleTestConnection = async () => {
    setConnectionStatus('idle');
    setStatusMessage('');

    const missing = [];
    if (!formData.serverId?.trim()) missing.push("Server ID");
    if (!formData.serverNameIp?.trim()) missing.push("Server Name/IP");
    if (!formData.serverDrivePath?.trim()) missing.push("Server Drive Path");
    if (!formData.storageGroupName?.trim()) missing.push("Storage Group Name");

    if (missing.length > 0) {
      setConnectionStatus('error');
      setStatusMessage(`Please fill in the following required fields:\n• ${missing.join('\n• ')}`);
      return;
    }

    setConnectionStatus('checking');
    setStatusMessage('');

    try {
      const payload = {
        ServerMaster: { sServerTypeName: serverTypeName || formData.serverTypeName },
        appname: "SDMS",
        FTPMaster: {
          sStorageType: formData.storageType,
          sDriveID: formData.serverDrivePath,
          sFTPID: formData.sFTPID || "",
          sFTPVirtualPathDirectory: formData.storageGroupName || "",
          sFTPServerIP: formData.serverNameIp,
          sFTPVirtualDirectoryName: formData.storageGroupName || "",
          iPortNo: String(formData.portNumber || ""),
          sServerID: formData.serverId,
          sRegion: ""
        },
        ...CF_activeUserdetails()
      };

      const response = await postData("ftp/CheckFTPMaster", payload);
      const rtn = response?.Rtn?.toLowerCase?.() || '';

      if (rtn.includes('success')) {
        setConnectionStatus('success');
        setStatusMessage(alerts.FTPSCREEN?.FTPCONNECTION_SUCCESS || 'Connection successful');
      } else {
        setConnectionStatus('failed');
        setStatusMessage(response?.Message || alerts.FTPSCREEN?.FTPCONNECTION_FAILED || 'Connection failed');
      }
    } catch (err) {
      console.error("Test connection error:", err);
      setConnectionStatus('error');
      setStatusMessage('Connection check failed – please check network or server availability');
    }
  };

  const handleChange = (name, value) => {
    if (showError) setShowError(false);

    setFormData(prev => {
      const next = { ...prev, [name]: value };

      if (name === 'serverId') {
        const opt = dropdownOptions.serverOptions.find(o => o.value === value);
        if (opt) {
          next.serverNameIp = opt.extra?.serverName || opt.label || "";
          next.serverTypeName = opt.extra?.serverTypeName || prev.serverTypeName || "FTP";
        }
      }

      if (name === 'serverDrivePath') {
        const opt = dropdownOptions.driveOptions.find(o => o.value === value);
        if (opt) {
          next.serverDrivePath = value;
          next.storageType = opt.extra?.storageType || prev.storageType || "FTP";
          next.portNumber = opt.extra?.portNo != null ? String(opt.extra.portNo) : prev.portNumber || "";
          next.serverNameIp = opt.extra?.serverName || prev.serverNameIp || "";
        }
      }

      return next;
    });

    if (apiErrors[name]) {
      setApiErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.storageGroupName?.trim()) errors.storageGroupName = "Required";
    if (!formData.serverId) errors.serverId = "Required";
    if (!formData.serverDrivePath) errors.serverDrivePath = "Required";
    if (!formData.portNumber || Number(formData.portNumber) <= 0) {
      errors.portNumber = "Valid port required";
    }
    return errors;
  };

  // ─── Confirmation dialog handlers ────────────────────────────────
  const handleConfirmActivateYes = useCallback(() => {
    setFormData(prev => ({ ...prev, isActive: true }));
    setShowActiveConfirm(false);
  }, []);

  const handleConfirmActivateNo = useCallback(() => {
    setShowActiveConfirm(false);
  }, []);

  useEffect(() => {
    if (pendingSubmit && !showActiveConfirm) {
      if (!isEditMode) {
        handleFinalSubmit({ AuditTrailValues: [] });
      } else {
        setShowAuditTrail(true);
      }
      setPendingSubmit(false);
    }
  }, [pendingSubmit, showActiveConfirm, isEditMode]);

  // ─── Submit handler ──────────────────────────────
  const handleInitialSubmit = (e) => {
    e.preventDefault();

    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setApiErrors(errs);
      setShowError(true);
      return;
    }

    setShowError(false);
    setApiErrors({});

    // Show confirmation in these cases:
    // 1. Add mode + saving as inactive
    // 2. Edit mode + changing from active → inactive
    // 3. Edit mode + was inactive + still inactive (no change to active)
    const shouldShowConfirmation =
      (!isEditMode && !formData.isActive) ||
      (isEditMode && initialActive === true && !formData.isActive) ||
      (isEditMode && initialActive === false && !formData.isActive);

    if (shouldShowConfirmation) {
      setPendingSubmit(true);
      setShowActiveConfirm(true);
      return;
    }

    // No confirmation needed → proceed directly
    if (!isEditMode) {
      handleFinalSubmit({ AuditTrailValues: [] });
    } else {
      setShowAuditTrail(true);
    }
  };

  const handleFinalSubmit = async (auditPayload) => {
    setIsSubmitting(true);

    try {
      const currentFormData = formData;
      const serverOpt = dropdownOptions.serverOptions.find(o => o.value === currentFormData.serverId);

      const payload = {
        ServerMaster: {
          sServerTypeName: serverTypeName || currentFormData.serverTypeName || "FTP",
          sRegion: ""
        },
        appname: "SDMS",
        FTPMaster: {
          sStorageType: currentFormData.storageType || "FTP",
          sDriveID: currentFormData.serverDrivePath,
          sFTPVirtualPathDirectory: currentFormData.storageGroupName,
          sFTPServerIP: currentFormData.serverNameIp,
          sFTPVirtualDirectoryName: currentFormData.storageGroupName,
          iPortNo: String(currentFormData.portNumber || ""),
          sServerID: serverOpt?.value || currentFormData.serverId,
          sFTPID: currentFormData.sFTPID || "",
          iFTPStatus: currentFormData.isActive ? 1 : 0,
          iStatusRead: currentFormData.isRead ? 1 : 0,
          iStatusWrite: currentFormData.isWrite ? 1 : 0,
          sRegion: "",
          sVirtualStaticIP: currentFormData.virtualStaticIp || ""
        },
        AuditTrailValues: auditPayload.AuditTrailValues || [],
        ...CF_activeUserdetails()
      };

      const endpoint = isEditMode ? "ftp/editFTPMaster" : "ftp/insertFTPMaster";
      const res = await postData(endpoint, payload);

      const success =
        res?.Rtn?.toLowerCase?.().includes('success') ||
        res?.status === 'success' ||
        res?.Rtn === statusMsgObj.SUCCESS;

      if (success) {
        onSubmit?.({ ...formData, auditData: auditPayload?.AuditTrailValues });
        setShowAuditTrail(false);
        onClose?.();
        alerts.Commonfunction?.SUCCESS?.(
          isEditMode ? "Updated successfully" : "Created successfully"
        );
      } else {
        setApiErrors({ general: res?.Message || "Operation failed" });
        setShowError(true);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setApiErrors({ general: "Network or server error" });
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && editLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Loading configuration...</span>
      </div>
    );
  }

  if (!isEditMode && (serversLoading || activeLoading)) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Loading servers & drives...</span>
      </div>
    );
  }

  const getConfirmMessage = () => {
    if (!isEditMode) {
      return "Do you want to save this configuration as Inactive?";
    }
    if (initialActive === true && !formData.isActive) {
      return "Do you want to deactivate this storage configuration?";
    }
    if (initialActive === false && !formData.isActive) {
      return "This storage is currently deactivated.\nDo you want to activate it?";
    }
    return "Do you want to Activate?";
  };

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-lg font-semibold text-gray-700">
              {process === 'Edit' ? 'Updating...' : 'Creating...'}
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleInitialSubmit}
        className={`pt-2 text-sm w-full relative ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="absolute top-0 right-0 flex flex-col items-end z-10">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={connectionStatus === 'checking' || isSubmitting || showActiveConfirm}
            className="mb-[2px] px-3 py-[4px] bg-gray-100 border border-gray-300 rounded text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs font-semibold shadow-sm h-[38px] disabled:opacity-50 transition-all"
          >
            {connectionStatus === 'checking' ? (
              <Loader2 size={14} className="animate-spin text-blue-600" strokeWidth={3} />
            ) : (
              <Check size={14} className="text-blue-600" strokeWidth={3} />
            )}
            {connectionStatus === 'checking' ? 'Checking...' : 'Check'}
          </button>

          {statusMessage && (
            <div
              className={`text-[10px] mt-1 font-medium px-2 py-1 rounded max-w-[260px] border whitespace-pre-wrap leading-tight ${
                connectionStatus === 'success'
                  ? 'text-green-700 bg-green-50 border-green-200'
                  : connectionStatus === 'error' || connectionStatus === 'failed'
                  ? 'text-red-700 bg-red-50 border-red-200'
                  : 'text-gray-600 bg-gray-50 border-gray-200'
              }`}
            >
              {statusMessage}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-2">
          <div className="space-y-5">
            <AnimatedDropdown
              label="Server ID "
              name="serverId"
              value={formData.serverId}
              options={dropdownOptions.serverOptions}
              onChange={(e) => handleChange("serverId", e.target.value)}
              // disabled={fieldDisabled.serverId || isSubmitting || showActiveConfirm}
                 disabled={true}
              required
              showError={showError}
              errorMessage={apiErrors.serverId}
            />

            <AnimatedDropdown
              label="Server Drive Path *"
              name="serverDrivePath"
              value={formData.serverDrivePath}
              options={dropdownOptions.driveOptions}
              onChange={(e) => handleChange("serverDrivePath", e.target.value)}
              // disabled={fieldDisabled.serverDrivePath || isSubmitting || showActiveConfirm}
              disabled={true}
              required
              showError={showError}
              errorMessage={apiErrors.serverDrivePath}
            />

           <AnimatedInput
  label="Storage Group Name"
  name="storageGroupName"
  value={formData.storageGroupName}
  onChange={(e) => handleChange("storageGroupName", e.target.value)}
  disabled={isEditMode || isSubmitting || showActiveConfirm} 
  required
  showError={showError}
  errorMessage={apiErrors.storageGroupName}
/>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-700 text-[12px]">Read</label>
                <input
                  type="checkbox"
                  name="isRead"
                  checked={formData.isRead}
                  onChange={handleCheckboxChange}
                  disabled={isSubmitting || showActiveConfirm}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-700 text-[12px]">Write</label>
                <input
                  type="checkbox"
                  name="isWrite"
                  checked={formData.isWrite}
                  onChange={handleCheckboxChange}
                  disabled={isSubmitting || showActiveConfirm}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <AnimatedInput
              label="Server Name/IP *"
              name="serverNameIp"
              value={formData.serverNameIp}
              // disabled={fieldDisabled.serverId || isSubmitting || showActiveConfirm}
                 disabled={true}

              onChange={(e) => handleChange("serverNameIp", e.target.value)}
              required
              showError={showError}
              errorMessage={apiErrors.serverNameIp}
            />

           <AnimatedInput
  label="Virtual/Static IP"
  name="virtualStaticIp"
  value={formData.virtualStaticIp}
  onChange={(e) => handleChange("virtualStaticIp", e.target.value)}
  // NO CHANGE: Keeps it editable in both Add and Edit modes
  disabled={isSubmitting || showActiveConfirm} 
/>

            <AnimatedInput
  label="Port Number *"
  name="portNumber"
  value={formData.portNumber}
  type="number"
  onChange={(e) => handleChange("portNumber", e.target.value)}
  required
  // disabled={isEditMode || isSubmitting || showActiveConfirm}
  disabled={true}
  showError={showError}
  errorMessage={apiErrors.portNumber}
/>

            <AnimatedInput
              label="Storage Type"
              name="storageType"
              value={formData.storageType}
              disabled={true}
            />

            <div className="flex items-center gap-2 pt-2">
              <label className="font-semibold text-gray-700 text-[12px]">Active</label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                disabled={isSubmitting || showActiveConfirm}
                className="w-4 h-4"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 mt-6">
          <button
            type="submit"
            disabled={isSubmitting || connectionStatus === 'checking' || showActiveConfirm}
            className={`px-6 py-2 font-medium rounded-lg flex items-center gap-2 transition-all ${
              isSubmitting || connectionStatus === 'checking' || showActiveConfirm
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting
              ? isEditMode ? 'Updating...' : 'Creating...'
              : 'Submit'}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || connectionStatus === 'checking' || showActiveConfirm}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </form>

      {showAuditTrail && (
        <AuditTrail
          isOpen={showAuditTrail}
          onClose={() => setShowAuditTrail(false)}
          onAuthorized={handleFinalSubmit}
          actionLabel={isEditMode ? "Update" : "Create"}
          defaultReason={isEditMode ? "Updated" : "Created"}
        />
      )}

      {/* Active/Inactive Confirmation Dialog */}
    {showActiveConfirm && (
  <Errordialog
    message="messages.confirmActivation"
    type="confirm"
    onClose={handleConfirmActivateNo}
    // Pass keys in the 'text' property
    customButtons={[
      {
        text: "button.Deactive", // <--- Translation Key
        onClick: handleConfirmActivateNo,
        className: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      },
      // {
      //   text: "button.saveDraft", // <--- Translation Key
      //   onClick: () => {
      //        console.log("Draft saved");
      //        setShowActiveConfirm(false);
      //   },
      //   className: "underline text-yellow-800 border-0 border-yellow-200 hover:bg-yellow-200"
      // },
      {
        text: "button.activate", 
        onClick: handleConfirmActivateYes,
        className: "bg-blue-600 text-white hover:bg-blue-700"
      }
    ]}
  />
)}
    </>
  );
};

export default StorageConfigForm;