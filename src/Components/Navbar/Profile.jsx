import React, { useState } from "react";
import AnimatedDropdown from "../Layout/Common/AnimatedDropdown";
import AnimatedInput from "../Layout/Common/AnimatedInput";
import AuditTrail from "../Layout/Common/AuditTrail";

const EditProfileContent = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: "Administrator",
    profileName: "Administrator",
    email: "",
    groupName: "Administrator",
    defaultLoginSite: "Chennai",
    approve: true,
  });

  const [showError, setShowError] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  // Updated to match ServerConfigForm structure (expects event object)
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (showError) {
      setShowError(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim() || !formData.profileName.trim()) {
      setShowError(true);
      return;
    }

    setShowError(false);
    setShowAuditTrail(true);
  };

  const handleAuditSubmit = (auditData) => {
    const finalData = {
      ...formData,
      auditRemarks: auditData,
    };

    console.log("Final Submission:", finalData);
    // Add API call here
    
    setShowAuditTrail(false);
    onClose();
  };

  const handleAuditClose = () => {
    setShowAuditTrail(false);
  };

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="space-y-6 pt-2 text-sm w-full">
        
        {/* Username */}
        <div className="w-[65%]">
          <AnimatedInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            disabled={true} // Read-only as per image
            required
            showError={showError}
          />
        </div>

        {/* Profile Name */}
        <div className="w-[65%]">
          <AnimatedInput
            label="Profile Name"
            name="profileName"
            value={formData.profileName}
            onChange={(e) => handleChange("profileName", e.target.value)}
            disabled={true}
            required
            showError={showError}
          />
        </div>

        {/* Email ID */}
        <div className="w-[65%]">
          <AnimatedInput
            label="Email ID"
            name="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            showError={showError}
          />
          <p className="text-xs text-gray-500 font-bold mt-1 ml-1">
            NOTE:- This mail to recovery the forgot password
          </p>
        </div>

        {/* Profile Image - Custom Layout */}
        <div className="w-[85%] flex flex-col">
          <label className="font-bold text-blue-900/80 mb-1 text-xs uppercase tracking-wide">
            Profile Image
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              className="flex-1 bg-gray-50 border-b-2 border-gray-300 p-2 text-gray-600 focus:outline-none"
              placeholder="No file chosen"
            />
            <label className="cursor-pointer bg-gray-100 border border-gray-300 hover:bg-gray-200 text-black px-3 py-2 rounded font-semibold text-xs shadow-sm transition-colors">
              Choose file
              <input type="file" className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-500 font-bold mt-1 ml-1">
            NOTE:- Upload File should be less than 3 MB...
          </p>
        </div>

        {/* Group Name */}
        <div className="w-[65%]">
          <AnimatedDropdown
            label="Group Name"
            name="groupName"
            value={formData.groupName}
            options={['Administrator', 'User', 'Guest']} 
            onChange={(e) => handleChange("groupName", e.target.value)}
            disabled={true}
            showError={showError}
          />
        </div>

        {/* Default Login Site */}
        <div className="w-[65%]">
          <AnimatedDropdown
            label="Default Login Site"
            name="defaultLoginSite"
            value={formData.defaultLoginSite}
            options={['Chennai', 'Bangalore', 'Mumbai']}
            onChange={(e) => handleChange("defaultLoginSite", e.target.value)}
            showError={showError}
          />
        </div>

        {/* Approve Checkbox */}
        <div className="flex items-center gap-2 mt-4 ml-1">
          <label className="font-bold text-blue-900/80 text-sm">Approve</label>
          <input
            type="checkbox"
            name="approve"
            checked={formData.approve}
            onChange={handleCheckboxChange}
            className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
          <button
            type="submit"
            className="btn-actionprimary transition-all hover:scale-95 hover:rounded-md flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded"
          >
            <span>Submit</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="btn-actionsecondary transition-all hover:scale-95 hover:rounded-md flex items-center justify-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded"
          >
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
          actionLabel="Update Profile"
          defaultReason="Profile Update"
        />
      )}
    </>
  );
};

export default EditProfileContent;
