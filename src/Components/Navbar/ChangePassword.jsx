import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import AnimatedInput from "../Layout/Common/AnimatedInput";
import AuditTrail from "../Layout/Common/AuditTrail";
import Errordialog from "../Layout/Common/Errordialog";
import { CF_sessionGet } from "../Common/CF_session";
import servicecall from "../../Services/servicecall"; 

const ChangePasswordContent = ({ onClose }) => {
  const { postData } = servicecall(); 

  const sessionData = useMemo(() => {
    return {
        username: CF_sessionGet("sUsername", 1) || "",
        siteCode: CF_sessionGet("sSiteCode", 1) || ""
    }
  }, []);

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [dialogData, setDialogData] = useState({
    open: false,
    message: "",
    type: "",
  });

  // --- 1. Fetch Password Policy ---
  useEffect(() => {
    const loadPolicy = async () => {
      if (!sessionData.username || !sessionData.siteCode) {
         console.warn("Warning: Calling API with potential empty session data", sessionData);
      }

      try {
        const payload = { 
          sUsername: sessionData.username || "", 
          sSiteCode: sessionData.siteCode || "" 
        };
        
        const response = await postData("Login/PasswordMessage", payload);
       
        if (response && Array.isArray(response) && response.length > 0) {
            setPolicy(response[0]);
        }
      } catch (err) {
        console.error("Policy loading error:", err);
      }
    };

    loadPolicy();
  }, [sessionData]); 

  // --- 2. Dynamic Zod Validation Schema ---
  const dynamicResolver = useCallback(async (values, context, options) => {
    const minLen = policy?.L25MinPasswordLength ? Number(policy.L25MinPasswordLength) : 4;
    const maxLen = policy?.L25MaxPasswordLength ? Number(policy.L25MaxPasswordLength) : 20;
    
    const minUpper = policy?.L25MinCapitalChar ? Number(policy.L25MinCapitalChar) : 0;
    const minLower = policy?.L25MinSmallChar ? Number(policy.L25MinSmallChar) : 0;
    const minNum = policy?.L25MinNumericChar ? Number(policy.L25MinNumericChar) : 0;
    const minSpecial = policy?.L25MinSpecialChar ? Number(policy.L25MinSpecialChar) : 0;

    const schema = z
      .object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z
          .string()
          .min(minLen, `Min length: ${minLen}`)
          .max(maxLen, `Max length: ${maxLen}`)
          .regex(new RegExp(`(?=(.*[A-Z]){${minUpper},})`), `Must contain ${minUpper} uppercase char(s)`)
          .regex(new RegExp(`(?=(.*[a-z]){${minLower},})`), `Must contain ${minLower} lowercase char(s)`)
          .regex(new RegExp(`(?=(.*[0-9]){${minNum},})`), `Must contain ${minNum} numeric char(s)`)
          .regex(new RegExp(`(?=(.*[^A-Za-z0-9]){${minSpecial},})`), `Must contain ${minSpecial} special char(s)`),
        confirmPassword: z.string().min(1, "Confirm password is required"),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: "New Password and Confirm Password do not match",
        path: ["confirmPassword"],
      });

    return zodResolver(schema)(values, context, options);
  }, [policy]); 

  const {
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: dynamicResolver, 
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // --- STEP 1: VALIDATION ERROR ---
  const onError = (errors) => {
    const firstErrorKey = Object.keys(errors)[0];
    const errorMessage = errors[firstErrorKey]?.message || "Please check the password fields.";
    
    setDialogData({
        open: true,
        message: errorMessage,
        type: "error"
    });
  };

  // --- STEP 2: FORM VALID -> CALL API FIRST ---
  // If API succeeds -> Show Audit Trail
  // If API fails -> Show Error
  const onSuccess = async (data) => {
    try {
      const payload = {
        ChangePasswordObj: {
          sNewPassword: data.newPassword,
          sConfirmPassword: data.confirmPassword,
          sSiteCode: sessionData.siteCode,
          sUsername: sessionData.username,
          sPassword: data.oldPassword,
        },
        ActiveUserDetails: {
          sTimeZoneID: "undefined<~>true", 
          sUserStatus: "",
          sApplicationName: "SDMS",
        },
        PasswordExpiry: false,
      };

      const response = await postData("Login/ChangePassword", payload);

      if (response?.oResObj?.bStatus) {
        // API Success: Now we show the audit trail for confirmation/logging
        setShowAuditTrail(true);
      } else {
        // API Failed (e.g. Wrong Old Password): Show error immediately
        setDialogData({
          open: true,
          message: response?.oResObj?.sInformation || "Password change failed",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Change password error:", err);
      setDialogData({
        open: true,
        message: "Something went wrong while changing password.",
        type: "error",
      });
    }
  };

  // --- STEP 3: AUDIT TRAIL AUTHORIZED ---
  // Since the API was already called successfully in Step 2,
  // this function simply handles the UI cleanup and Success Message.
  const handleAuditSubmit = (auditReason) => {
    setShowAuditTrail(false);
    
    // We display the final success message here.
    // (If you have a separate API to log the specific 'auditReason' 
    // after the fact, you would call it here.)
    setDialogData({
      open: true,
      message: "Password changed successfully!",
      type: "success",
    });
  };

  const handleDialogClose = () => {
    setDialogData({ ...dialogData, open: false });
    if (dialogData.type === "success") {
      onClose(); 
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSuccess, onError)} className="space-y-6 pt-2 text-sm w-full">
        
        {/* Username */}
        <div className="w-[70%] lg:w-[65%]">
          <AnimatedInput
            label="Username"
            name="username"
            value={sessionData.username}
            onChange={() => {}}
            disabled={true}
            required
          />
        </div>

        {/* Old Password */}
        <div className="w-[70%] lg:w-[65%] relative">
          <AnimatedInput
            label="Old Password"
            name="oldPassword"
            value={watch("oldPassword")}
            onChange={(e) => {
              setValue("oldPassword", e.target.value);
              trigger("oldPassword");
            }}
            type={showOldPass ? "text" : "password"}
            required
            showError={!!errors.oldPassword}
          />
          <button
            type="button"
            onClick={() => setShowOldPass(!showOldPass)}
            className="absolute right-2 top-7 text-gray-400 hover:text-gray-600 z-10"
            tabIndex="-1"
          >
            {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.oldPassword && (
            <div className="text-red-500 text-xs font-semibold px-1 mt-1">
              {errors.oldPassword.message}
            </div>
          )}
        </div>

        {/* New Password */}
        <div className="w-[70%] lg:w-[65%] relative">
          <AnimatedInput
            label="New Password"
            name="newPassword"
            value={watch("newPassword")}
            onChange={(e) => {
              setValue("newPassword", e.target.value);
              trigger("newPassword");
            }}
            type={showNewPass ? "text" : "password"}
            required
            showError={!!errors.newPassword}
          />
          <button
            type="button"
            onClick={() => setShowNewPass(!showNewPass)}
            className="absolute right-2 top-7 text-gray-400 hover:text-gray-600 z-10"
            tabIndex="-1"
          >
            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.newPassword && (
            <div className="text-red-500 text-xs font-semibold px-1 mt-1">
              {errors.newPassword.message}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="w-[70%] lg:w-[65%] relative">
          <AnimatedInput
            label="Confirm Password"
            name="confirmPassword"
            value={watch("confirmPassword")}
            onChange={(e) => {
              setValue("confirmPassword", e.target.value);
              trigger("confirmPassword");
            }}
            type={showConfirmPass ? "text" : "password"}
            required
            showError={!!errors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPass(!showConfirmPass)}
            className="absolute right-2 top-7 text-gray-400 hover:text-gray-600 z-10"
            tabIndex="-1"
          >
            {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.confirmPassword && (
            <div className="text-red-500 text-xs font-semibold px-1 mt-1">
              {errors.confirmPassword.message}
            </div>
          )}
        </div>

        {/* Dynamic Policy Note */}
        <div className="w-full">
          <div className="text-[10px] text-gray-500 mt-4 leading-relaxed rounded">
            <span className="font-bold">NOTE:- </span> Password Length must be
            within the specified range:
            {policy ? (
              <>
                {" "}Minimum Length: {policy.L25MinPasswordLength}, Maximum
                Length: {policy.L25MaxPasswordLength}, Uppercase:{" "}
                {policy.L25MinCapitalChar}, Lowercase: {policy.L25MinSmallChar},
                Numeric: {policy.L25MinNumericChar}, Special Characters:{" "}
                {policy.L25MinSpecialChar}
              </>
            ) : (
              " Loading policy details..."
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-actionprimary transition-all hover:scale-95 hover:rounded-md flex items-center justify-center px-6 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded shadow-sm font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Changing..." : "Change"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-actionsecondary transition-all hover:scale-95 hover:rounded-md flex items-center justify-center px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded shadow-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Audit Trail */}
      {/* Logic: Only shown if API has ALREADY succeeded */}
      {showAuditTrail && (
        <AuditTrail
          isOpen={showAuditTrail}
          onClose={() => setShowAuditTrail(false)}
          onAuthorized={handleAuditSubmit}
          actionLabel="Confirm Change"
          defaultReason="Password Update"
        />
      )}

      {/* Error/Success Dialog */}
      {dialogData.open && (
        <Errordialog
          message={dialogData.message}
          type={dialogData.type}
          onClose={handleDialogClose}
        />
      )}
    </>
  );
};

export default ChangePasswordContent;
