import React, { useEffect, useMemo } from "react";
import { RxCross2 } from "react-icons/rx";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import servicecall from "../../Services/servicecall";
import Errordialog from "../Layout/Common/Errordialog";
import { CF_decrypt } from "../Common/encryptiondecryption";
import Cookies from "js-cookie";
import { useToggle, useDefault, useObjectState } from "@uidotdev/usehooks";
import { useEventListener } from "usehooks-ts";
import { useTranslation } from "react-i18next";

function PasswordPolicy({ onClose }) {
  const { postData } = servicecall();

  const [showOld, toggleOld] = useToggle(false);
  const [showNew, toggleNew] = useToggle(false);
  const [showConfirm, toggleConfirm] = useToggle(false);

  const [policy, setPolicy] = useDefault(null, null);

    const { t } = useTranslation();

  const [dialogData, setDialogData] = useObjectState({
    open: false,
    message: "",
    type: "warning",
  });

  const cookieData = useMemo(() => {
    const getDecryptedCookie = (name) => {
      const cookieValue = Cookies.get(name);
      return cookieValue ? CF_decrypt(cookieValue) : "";
    };

    return {
      sUsername: getDecryptedCookie("sUsername"),
      sSiteCode: getDecryptedCookie("sitecode"),
    };
  }, []);

  const passwordSchema = useMemo(() => {
    if (!policy) {
      return z
        .object({
          oldPassword: z.string().min(1, "Please enter old password"),
          newPassword: z.string().min(1, "Please enter new password"),
          confirmPassword: z.string().min(1, "Please confirm password"),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
    }

    return z
      .object({
        oldPassword: z.string().min(1, "Please enter old password"),
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
        confirmPassword: z.string().min(1, "Please confirm password"),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
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


  const showDialog = (msg, type = "warning") => {
    setDialogData({ open: true, message: msg, type });
  };

 
  const handleDialogClose = () => {
    if (dialogData.type === "success" && onClose) onClose();
    setDialogData({ open: false, message: "", type: "warning" });
  };

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!cookieData.sUsername || !cookieData.sSiteCode) return;

      try {
        const payload = {
          sUsername: cookieData.sUsername,
          sSiteCode: cookieData.sSiteCode,
        };
        const response = await postData("Login/PasswordMessage", payload,{
			          "Authorization": "relogin"
			      }, );

        if (Array.isArray(response) && response.length > 0) {
          setPolicy(response[0]);
        }
      } catch (err) {
        console.error("Error loading password policy:", err);
      }
    };

    fetchPolicy();
  }, [cookieData.sUsername, cookieData.sSiteCode, postData, setPolicy]);


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
          sUsername: cookieData.sUsername,
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
        showDialog("Password changed successfully!", "success");
        reset();
      } else {
        showDialog(
          response?.oResObj?.sInformation || "Password change failed.",
          "warning"
        );
      }
    } catch (err) {
      console.error("Change password error:", err);
      showDialog("Something went wrong while changing password.", "error");
    }
  };

  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-[630px] rounded-md shadow-lg overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-blue-100">
          <h2 className="text-[22px] font-semibold text-blue-600">
            Change Password
          </h2>
          <RxCross2
            className="text-[22px] text-gray-600 cursor-pointer hover:text-red-500 transition-all hover:scale-90"
            onClick={onClose}
          />
        </div>
        <div className="px-8 py-6">
          <h3 className="text-red-500 text-[18px] font-semibold mb-5">
            Policy Changed
          </h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('login.username')}
              </label>
              <input
                type="text"
                value={cookieData.sUsername || "(not found)"}
                readOnly
                className="w-full text-sm font-semibold text-gray-800 bg-gray-100 border-b border-gray-300 rounded-sm px-1 py-2 focus:outline-none"
              />
            </div>

            
            <div className="mb-5 relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Old Password
              </label>
              <input
                type={showOld ? "text" : "password"}
                {...register("oldPassword")}
                className="w-full text-sm font-semibold focus:outline-none text-gray-800 border-b border-gray-300 pr-8 focus:border-blue-500"
              />
              <span
                className="absolute right-2 top-[30px] cursor-pointer"
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
                className="w-full text-sm font-semibold focus:outline-none text-gray-800 border-b border-gray-300 pr-8 focus:border-blue-500"
              />
              <span
                className="absolute right-2 top-[30px] cursor-pointer"
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
                className="w-full text-sm font-semibold focus:outline-none text-gray-800 border-b border-gray-300 pr-8 focus:border-blue-500"
              />
              <span
                className="absolute right-2 top-[30px] cursor-pointer"
                onClick={toggleConfirm}
              >
                {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {policy ? (
              <div className="font-semibold text-[11px] text-gray-600 mt-3 leading-tight">
                NOTE: Password must follow the rules:
                <span className="font-bold text-gray-800 ms-1">
                  Min: {policy.L25MinPasswordLength}, Max:{" "}
                  {policy.L25MaxPasswordLength}, Uppercase:{" "}
                  {policy.L25MinCapitalChar}, Lowercase:{" "}
                  {policy.L25MinSmallChar}, Numeric:{" "}
                  {policy.L25MinNumericChar}, Special:{" "}
                  {policy.L25MinSpecialChar}
                </span>
              </div>
            ) : (
              <div className="text-[10px] text-gray-500 italic">
                Loading password policy...
              </div>
            )}


            <div className="flex justify-end gap-3 px-8 py-4 border-t bg-gray-50 mt-6">
              <button
                type="submit"
                className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Changing..." : "Change"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>


      <AnimatePresence>
        {dialogData.open && (
          <motion.div
            key="error-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Errordialog
              message={dialogData.message}
              type={dialogData.type}
              onClose={handleDialogClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(PasswordPolicy);
