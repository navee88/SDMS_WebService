import React, { useEffect, useRef, useMemo } from "react";
import { TbCheckbox } from "react-icons/tb";
import { BiSend } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ForgotPasswordlayout from "../Layout/Login/ForgotPasswordlayout";
import servicecall from "../../Services/servicecall";
import Errordialog from "../Layout/Common/Errordialog";
import { CF_decrypt } from "../Common/encryptiondecryption";
import { useToggle, useObjectState } from "@uidotdev/usehooks";
import { useEventListener } from "usehooks-ts";
import { useTranslation } from "react-i18next";
import { useML } from "../../Services/useML";


const verificationSchema = z.object({
  code: z
    .string()
    .length(6,)
    .regex(/^\d{6}$/),
});


const parsedCookies = () => {
  const cookies = document.cookie.split("; ").reduce((acc, cur) => {
    const [key, value] = cur.split("=");
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});

  try {
    const username = cookies["sUsername"] ? CF_decrypt(cookies["sUsername"]) : "";
    const sitecode = cookies["sitecode"] ? CF_decrypt(cookies["sitecode"]) : "";
    return { sUsername: username, sSiteCode: sitecode };
  } catch (err) {
    console.error("Cookie decrypt error:", err);
    return { sUsername: "", sSiteCode: "" };
  }
};

function Verificationcode({ onClose, userData }) {
  const { postData } = servicecall();

  const inputRefs = useRef([]);
  const { t } = useTranslation();
  const applyML = useML();

  const [resending, toggleResending] = useToggle(false);
  const [dialogData, setDialogData] = useObjectState({
    open: false,
    message: "",
    type: "",
  });


  const cookieData = useMemo(() => parsedCookies(), []);
  const email = userData?.sUserMailID || "";

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const code = watch("code");


  const showDialog = (message, type = "error") => {
    setDialogData({ open: true, message, type });
  };


  const handleDialogClose = () => {
    if (dialogData.type === "verification-success") {
      onClose();
    }
    setDialogData({ open: false, message: "", type: "" });
  };

  useEventListener("keydown", (e) => {
    if (e.key === "Enter" && dialogData.open) {
      e.preventDefault();
      handleDialogClose();
    }
    if (e.key === "Enter" && !dialogData.open) {
    e.preventDefault(); 
  }
  });

  
  const handleInputChange = (index, e) => {
    const value = e.target.value;


    if (!/^\d*$/.test(value)) return;

 
    const newCode = code.split("");
    newCode[index] = value.slice(-1);
    const updatedCode = newCode.join("");
    setValue("code", updatedCode);
    clearErrors("code");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };


  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };


  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{1,6}$/.test(pastedData)) {
      setValue("code", pastedData.padEnd(6, ""));
      clearErrors("code");
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    const { sUsername, sSiteCode } = cookieData;
    toggleResending(true);

    try {
      const response = await postData("Login/sendVerificationCode", {
        sUserMailID: email,
        sUsername,
        sSiteCode,
      },{
			          "Authorization": "relogin"
			      }, );

      const { bSendStatus, bSendCode } = response || {};

      if (bSendCode === true) {
        showDialog(t("warningmsg.verificationcodesentsuccefully"), "success");
      } else if (bSendCode === false) {
        showDialog(bSendStatus || "Failed to send verification code.", "warning");
      } 
      // else {
      //   showDialog(bSendStatus || "Unexpected response from server.", "error");
      // }
    } catch (error) {
      showDialog(t("errormsg.somethingwentwrong"), "error");
      console.error("Resend error:", error);
    } finally {
      toggleResending(false);
    }
  };


  const onSubmit = async (data) => {
    const { sUsername, sSiteCode } = cookieData;

    try {
      const response = await postData("Login/submitVerificationCode", {
        sUsername,
        sSiteCode,
        nVerificationCode: data.code,
      },{
			          "Authorization": "relogin"
			      }, );

      const { Message, bValidCode } = response || {};

       const errorKeyMap = {
          "verificationcodeiswrong":"warningmsg.verificationcodeiswrong",
          "passwordresetsuccessfully":"warningmsg.passwordresetsuccessfully",
};
const translationKey = errorKeyMap[applyML(Message)];
const finalKeyOrText = translationKey || Message;
const msg = finalKeyOrText;
// showDialog(msg, "warning");

      if (bValidCode === true) {
        showDialog(msg, "verification-success");
        // showDialog(Message, "verification-success");
      } else if (bValidCode === false) {
        showDialog(msg, "warning");
      } else {
        showDialog(msg, "warning");
      }
    } catch (error) {
      console.error("Submit error:", error);
      showDialog(t("errormsg.somethingwentwrong"), "error");
    }
  };


  const resendButtonContent = useMemo(
    () =>
      resending ? (
        <>
          <AiOutlineLoading3Quarters className="animate-spin mr-2 w-4 h-4" />
          {t("button.resending")}
        </>
      ) : (
        <>
          {t("button.resend")}
          <BiSend className="ms-2 w-[16px] h-[16px] hover:scale-125" />
        </>
      ),
    [resending]
  );

  return (
    <ForgotPasswordlayout onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("label.verificationcode")} <span className="text-red-500">*</span>
        </label>

        <div className="flex justify-start gap-2 mb-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[index] || ""}
              onChange={(e) => handleInputChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-10 h-10 text-center text-[15px] font-semibold border-2 rounded-[3px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-none transition-all ${
                errors.code ? "border-red-500" : "border-gray-300"
              }`}
            />
          ))}
        </div>

        {/* {errors.code && (
          <p className="text-red-500 text-sm text-center mb-3">{errors.code.message}</p>
        )} */}

        <div className="flex justify-end space-x-2 mt-5">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || isSubmitting}
            className={`flex items-center justify-center bg-blue-500 text-[14px] text-white font-medium px-4 py-2 rounded-md shadow-sm transition-all hover:scale-90 ${
              resending ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {resendButtonContent}
          </button>

           <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center bg-blue-500 text-[14px] text-white font-medium px-4 py-2 rounded-md shadow-sm transition-all hover:scale-90 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <AiOutlineLoading3Quarters className="animate-spin mr-2 w-4 h-4" />
                {t("button.verifying")}
              </>
            ) : (
              <>
                {t("button.verify")}
                <TbCheckbox className="ms-2 w-[16px] h-[16px]" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all hover:scale-90"
          >
            {t("button.close")}
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
    </ForgotPasswordlayout>
  );
}

export default React.memo(Verificationcode);
