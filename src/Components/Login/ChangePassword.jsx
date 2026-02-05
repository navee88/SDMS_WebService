import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useToggle, useEventListener } from "usehooks-ts";
import servicecall from "../../Services/servicecall";
import Errordialog from "../Layout/Common/Errordialog";
import { CF_decrypt } from "../Common/encryptiondecryption";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

function ChangePassword({ onNavigate }) {
  const { postData } = servicecall();

  const [showOld, toggleOld] = useToggle(false);
  const [showNew, toggleNew] = useToggle(false);
  const [showConfirm, toggleConfirm] = useToggle(false);

  const [dialogData, setDialogData] = React.useState({
    open: false,
    message: "",
    type: "",
  });

  const [policy, setPolicy] = React.useState(null);

    const { t } = useTranslation();
 
  const cookieData = useMemo(() => {
    const getDecryptedCookie = (name) => {
      const cookieValue = Cookies.get(name);
      return cookieValue ? CF_decrypt(cookieValue) : "";
    };
    
    return {
      username: getDecryptedCookie("sUsername"),
      sSiteCode: getDecryptedCookie("sitecode"),
    };
  }, []);

  const passwordSchema = useMemo(() => {
    if (!policy) {
      return z.object({
        oldPassword: z.string().min(1, t("login.oldpassword")),
        newPassword: z.string().min(1, "New password is required"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    return z.object({
      oldPassword: z.string().min(1, t("login.oldpassword")),
      newPassword: z
        .string()
        .min(
          policy.L25MinPasswordLength,
          `Password must be at least ${policy.L25MinPasswordLength} characters`
        )
        .max(
          policy.L25MaxPasswordLength,
          `Password must not exceed ${policy.L25MaxPasswordLength} characters`
        )
        .regex(
          new RegExp(`[A-Z]{${policy.L25MinCapitalChar},}`),
          `Password must contain at least ${policy.L25MinCapitalChar} uppercase letter(s)`
        )
        .regex(
          new RegExp(`[a-z]{${policy.L25MinSmallChar},}`),
          `Password must contain at least ${policy.L25MinSmallChar} lowercase letter(s)`
        )
        .regex(
          new RegExp(`[0-9]{${policy.L25MinNumericChar},}`),
          `Password must contain at least ${policy.L25MinNumericChar} numeric character(s)`
        )
        .regex(
          new RegExp(`[^A-Za-z0-9]{${policy.L25MinSpecialChar},}`),
          `Password must contain at least ${policy.L25MinSpecialChar} special character(s)`
        ),
      confirmPassword: z.string().min(1, "Confirm password is required"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "New password and confirm password do not match",
      path: ["confirmPassword"],
    });
  }, [policy]);

  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur", 
  });

  
  useEffect(() => {
    const loadPolicy = async () => {
      try {
        if (cookieData.username && cookieData.sSiteCode) {
          const payload = {
            sUsername: cookieData.username,
            sSiteCode: cookieData.sSiteCode,
          };

          const response = await postData("Login/PasswordMessage", payload,{
			          "Authorization": "relogin"
			      }, );
          if (Array.isArray(response) && response.length > 0) {
            setPolicy(response[0]);
          }
        }
      } catch (err) {
        console.error("Policy loading error:", err);
      }
    };

    loadPolicy();
  }, [cookieData.username, cookieData.sSiteCode, postData]);


  const handleDialogClose = React.useCallback(() => {
    if (dialogData.type === "success") {
      onNavigate("login");
    }
    setDialogData({ open: false, message: "", type: "" });
  }, [dialogData.type, onNavigate]);

  useEventListener("keydown", (e) => {
    if (e.key === "Enter" && dialogData.open) {
      e.preventDefault();
      handleDialogClose();
    }
    if (e.key === "Enter" && !dialogData.open) {
    e.preventDefault(); 
  }
  });


  const onSubmit = async (data) => {
    try {
      const payload = {
        ChangePasswordObj: {
          sNewPassword: data.newPassword,
          sConfirmPassword: data.confirmPassword,
          sSiteCode: cookieData.sSiteCode,
          sUsername: cookieData.username,
          sPassword: data.oldPassword,
        },
        ActiveUserDetails: {
          sTimeZoneID: "undefined<~>true",
          sUserStatus: "",
          sApplicationName: "SDMS",
        },
        PasswordExpiry: false,
      };

      const response = await postData("Login/ChangePassword", payload,{
			          "Authorization": "relogin"
			      }, );

      if (response?.oResObj?.bStatus) {
        setDialogData({
          open: true,
          message: "Password changed successfully!",
          type: "success",
        });
        reset();
      } else {
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

  return (
    <div className="select-none">
      <div className="mb-3">
        <h1 className="text-red-600 font-semibold">Password Expired</h1>
        <h4 className="text-[24px] text-blue-500 mt-2">Change Password</h4>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="text-sm inline-block font-medium text-gray-600 mb-1 hover:cursor-not-allowed">
         {t('login.username')} : <span className=" font-bold text-red-500">{cookieData.username || "(not found)"}</span>
        </label>

    
        <div className="mb-5 mt-5 relative">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Old Password
          </label>
          <input
            type={showOld ? "text" : "password"}
            {...register("oldPassword")}
            className="w-full text-sm font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500 pr-8"
          />
          <span
            className="absolute right-2 top-[30px] cursor-pointer text-gray-600"
            onClick={toggleOld}
          >
            {showOld ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
          {errors.oldPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.oldPassword.message}</p>
          )}
        </div>

      
        <div className="mb-5 relative">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            New Password
          </label>
          <input
            type={showNew ? "text" : "password"}
            {...register("newPassword")}
            className="w-full text-sm font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500 pr-8"
          />
          <span
            className="absolute right-2 top-[30px] cursor-pointer text-gray-600"
            onClick={toggleNew}
          >
            {showNew ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
          )}
        </div>

      
        <div className="mb-5 relative">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Confirm Password
          </label>
          <input
            type={showConfirm ? "text" : "password"}
            {...register("confirmPassword")}
            className="w-full text-sm font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500 pr-8"
          />
          <span
            className="absolute right-2 top-[30px] cursor-pointer text-gray-600"
            onClick={toggleConfirm}
          >
            {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

      
        {policy ? (
          <div className="font-semibold text-[10px] text-gray-600 leading-tight mt-3">
            <p>NOTE: Password length must be within the specified range;</p>
            <span>
              <span className="font-bold">Minimum Length:</span>{" "}
              <span className="font-extrabold text-gray-700">
                {policy.L25MinPasswordLength}
              </span>
              ,&nbsp;
              <span className="font-bold">Maximum Length:</span>{" "}
              <span className="font-extrabold text-gray-700">
                {policy.L25MaxPasswordLength}
              </span>
              ,&nbsp;
              <span className="font-bold">Uppercase:</span>{" "}
              <span className="font-extrabold text-gray-700">
                {policy.L25MinCapitalChar}
              </span>
            </span>
            <br />
            <span>
              <span className="font-bold">Lowercase:</span>{" "}
              <span className="font-extrabold text-gray-700">
                {policy.L25MinSmallChar}
              </span>
              ,&nbsp;
              <span className="font-bold">Numeric:</span>{" "}
              <span className="font-extrabold text-gray-700">
                {policy.L25MinNumericChar}
              </span>
              ,&nbsp;
              <span className="font-bold">Special Characters:</span>{" "}
              <span className="font-extrabold text-gray-700">
                {policy.L25MinSpecialChar}
              </span>
              .
            </span>
          </div>
        ) : (
          <div className="text-[10px] text-gray-500 italic">
            Loading password policy...
          </div>
        )}

    
        <div className="flex justify-end gap-3 px-8 py-4 border-t mt-6 mb-[-58px]">
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-all hover:scale-90"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-all hover:scale-90 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Changing..." : "Change"}
          </button>
        </div>
      </form>

      {dialogData.open && (
        <Errordialog
          message={dialogData.message}
          type={dialogData.type}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}

export default ChangePassword;
