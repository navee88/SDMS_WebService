import React, { useEffect, useMemo } from "react";
import { BiSend } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ForgotPasswordlayout from "../Layout/Login/ForgotPasswordlayout";
import servicecall from "../../Services/servicecall";
import { CF_decrypt } from "../Common/encryptiondecryption";
import Errordialog from "../Layout/Common/Errordialog";
import Cookies from "js-cookie";
import { useObjectState } from "@uidotdev/usehooks";
import { useEventListener } from "usehooks-ts";
import { useTranslation } from "react-i18next";
import { useML } from "../../Services/useML";


const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function Emailverification({ onClose, userData, onVerificationOpen }) {
    const { t } = useTranslation();

  const { postData } = servicecall();
  const navigate = useNavigate();
      const applyML = useML();
  

  const [dialogData, setDialogData] = useObjectState({
    open: false,
    message: "",
    type: "",
  });


  const cookieData = useMemo(() => {
    const getDecryptedCookie = (name) => {
      const cookieValue = Cookies.get(name);
      return cookieValue ? CF_decrypt(cookieValue) : "";
    };

    try {
      return {
        sUsername: getDecryptedCookie("sUsername"),
        sSiteCode: getDecryptedCookie("sitecode"),
      };
    } catch (err) {
      console.error("Cookie decrypt error:", err);
      return { sUsername: "", sSiteCode: "" };
    }
  }, []);

  const email = userData?.sUserMailID || "";


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: email,
    },
  });

  const showDialog = (message, type = "error") => {
    setDialogData({ open: true, message, type });
  };


  const handleDialogClose = () => {
    if (dialogData.type === "success") {
      navigate("/Login");
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


const ERROR_MAP = {
  "usergetslockedforconcurrentpasswordresetcontactadministrator": "warningmsg.usergetslockedforconcurrentpasswordresetcontactadministrator",
  "incorrectusernameorpassword": "common.incorrectusernameorpassword"
};

const onSubmit = async (data) => {
  const { sUsername, sSiteCode } = cookieData;

  const getErrorMessage = (status) => {
     
    if (status === false) {
      return t("common.incorrectusernameorpassword"); 
    }
  
    const key = applyML(status);
    return ERROR_MAP[key] || status || t("errormsg.unknownerror");
  };

  try {
    const rateLimitRes = await postData("Login/checkForRateLimit", {
      sUsername,
      sSiteCode,
      sUserMailID: data.email,
    },{
			          "Authorization": "relogin"
			      }, );

    if (rateLimitRes?.UserStatus !== "Success") {
      showDialog(getErrorMessage(rateLimitRes?.UserStatus), "warning");
      return;
    }

    const sendCodeRes = await postData("Login/sendVerificationCode", {
      sUsername,
      sSiteCode,
      sUserMailID: data.email,
    },{
			          "Authorization": "relogin"
			      }, );

    if (sendCodeRes?.bSendCode === true) {
      onVerificationOpen?.();
    } else {
      showDialog(getErrorMessage(sendCodeRes?.bSendCode), "warning");
    }

  } catch (err) {
    console.error("Forgot Password Error:", err);
    showDialog(t("errormsg.somethingwentwrong"), "error");
  }
};


  return (
    <ForgotPasswordlayout onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("label.email")} <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          {...register("email")}
          readOnly
          className="w-full font-semibold bg-gray-100 border-b border-gray-300 rounded-sm px-1 py-2 text-sm focus:outline-none hover:cursor-not-allowed"
        />

        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}

        <div className="flex justify-end space-x-2 mt-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-all hover:scale-90 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <AiOutlineLoading3Quarters className="animate-spin mr-2 w-4 h-4" />
                {t("button.sending")}
              </>
            ) : (
              <>
                {t("button.send")}
                <BiSend className="ms-2 w-[15px] h-[15px]" />
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

export default React.memo(Emailverification);
