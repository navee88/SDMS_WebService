import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import servicecall from "../../Services/servicecall";
import Errordialog from "../Layout/Common/Errordialog";
import { CF_decrypt } from "../Common/encryptiondecryption";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Cookies from "js-cookie";
import { useToggle, useDefault, useObjectState } from "@uidotdev/usehooks";
import { useEventListener } from "usehooks-ts"; 
import { useTranslation } from "react-i18next";
import { useML } from "../../Services/useML";

function CreatePassword({ onNavigate }) {
  const { postData } = servicecall();
  const { t } = useTranslation();
  const applyML = useML();
  const [showNew, toggleNew] = useToggle(false);
  const [showConfirm, toggleConfirm] = useToggle(false);
  const [policy, setPolicy] = useDefault(null, null);

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

    return {
      sUsername: getDecryptedCookie("sUsername"),
      sSiteCode: getDecryptedCookie("sitecode"),
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors},
    reset,
    setError,
    setFocus, 
  } = useForm({
    defaultValues: {
      password: "",
      repassword: "",
    },
  });

  const showDialog = (message, type = "error") => {
    setDialogData({ open: true, message, type });
  };

  const handleDialogClose = useCallback(() => {
    if (dialogData.type === "success") {
      onNavigate("login");
    }
    setDialogData({ open: false, message: "", type: "" });
  }, [dialogData.type, onNavigate, setDialogData]);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!cookieData.sUsername || !cookieData.sSiteCode) return;

      try {
        const response = await postData("Login/PasswordMessage", {
          sUsername: cookieData.sUsername,
          sSiteCode: cookieData.sSiteCode,
        },{
			          "Authorization": "relogin"
			      }, );

        if (Array.isArray(response) && response.length > 0) {
          setPolicy(response[0]);
        }
      } catch (error) {
        console.error("Policy fetch error:", error);
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
    if (!data.password) {
      // setError("password", "login.pleaseenternewpassword", "warning");
      setError("password", { message: t("login.pleaseenternewpassword") });
      setFocus("password");
      return;
    }

    if (data.password!=="" && ( !data.password || data.repassword==="")) {
      setError("repassword", { message: t("login.pleasere-enterpassword") });      
      setFocus("repassword")
      return;
    }
    else{
      setFocus("password")
    }

    if (data.password !== data.repassword) {
      showDialog("login.passwordsdonotmatch", "warning");
      return;
    }

    try {
      const payload = {
        ChangePasswordObj: {
          sNewPassword: data.password,
          sConfirmPassword: data.repassword,
          sSiteCode: cookieData.sSiteCode,
          sUsername: cookieData.sUsername,
          sPassword: 0,
        },
        PasswordExpiry: true,
      };

      const response = await postData("Login/ChangePassword", payload,{
			          "Authorization": "relogin"
			      }, );

      if (response?.oResObj?.bStatus) {
        showDialog(t('login.passwordcreatedsuccessfully'), "success");
        reset();
      } else {


          const errorKeyMap = {
  'newpassworddoesnotmatchwithcomplexpasswordpolicy': 'login.newpassworddoesnotmatchwithcomplexpasswordpolicy',
  'passwordhistoryvalidationerror':'login.passwordhistoryvalidationerror'
};

const translationKey = errorKeyMap[applyML(response?.oResObj?.sInformation)];

const finalKeyOrText = translationKey ||  response?.oResObj?.sInformation;

const msg = finalKeyOrText;

showDialog(msg, "warning");
        // showDialog(
        //   response?.oResObj?.sInformation || "Password created failed",
        //   "warning"
        // );
      }
    } catch (err) {
      console.error("Create password error:", err);
      showDialog(t('errormsg.somethingwentwrong'), "error");
    }
  };

  return (
    <div className="select-none">
      <h2 className="text-[25px] mt-[-15px] mb-4 font-semibold text-blue-600">
        {t('login.createpassword')}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="text-sm font-semibold text-gray-600 hover:cursor-not-allowed">
           user: <span className="font-bold text-red-500">{cookieData.sUsername || "(not found)"}</span>
          </label>
        </div>

        <div className="mb-3 relative">
          <label className="text-sm font-semibold text-gray-600">
            {t('login.newpassword')}
          </label>
          <input
            type={showNew ? "text" : "password"}
            {...register("password")}
            className="w-full text-sm font-semibold text-gray-900 pb-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 transition-colors pr-8"
          />
          <span
            className="absolute right-2 top-[35px] cursor-pointer text-gray-600"
            onClick={toggleNew}
          >
            {showNew ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
            {/* {errors.password && <p className="text-red-500 text-sm">{getErrorMessage('login.pleaseenternewpassword')}</p>} */}
{errors.password && (
  <p className="text-red-500 text-sm">{errors.password.message}</p>
)}
        </div>

     
        <div className="mb-3 relative">
          <label className="text-sm font-medium text-gray-600">
           {t('login.confirmpassword')}
          </label>
          <input
            type={showConfirm ? "text" : "password"}
            {...register("repassword")}
            className="w-full text-sm font-semibold text-gray-900 pb-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 transition-colors pr-8"
          />
          <span
            className="absolute right-2 top-[35px] cursor-pointer text-gray-600"
            onClick={toggleConfirm}
          >
            {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
{errors.repassword && (
  <p className="text-red-500 text-sm">{errors.repassword.message}</p>
)}
        </div>

        {policy ? (
          <div className="font-semibold text-[10px] text-gray-600 leading-tight mt-3">
            <p>{t("login.passwordnote")}</p>
            <p>
              <b>{t("login.minimumlength")}</b> {policy.L25MinPasswordLength}, <b>{t("login.maximumlength")}</b>{" "}
              {policy.L25MaxPasswordLength}, <b>{t("login.capitalcharacter")}</b>{" "}
              {policy.L25MinCapitalChar}
            </p>
            <p>
              <b>{t("login.smallcharacter")}</b> {policy.L25MinSmallChar}, <b>{t("login.numericcharacter")}</b>{" "}
              {policy.L25MinNumericChar}, <b>{t("login.specialcharacter")}</b>{" "}
              {policy.L25MinSpecialChar}
            </p>
          </div>
        ) : (
          <div className="text-[10px] text-gray-500 italic">
            {t("login.loadingpasswordpolicy")}
          </div>
        )}

        <div className="flex justify-end gap-3 px-8 py-4 border-t mt-6 mb-[-45px]">
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-all hover:scale-90"
            disabled={isSubmitting}
          >
            {t("button.cancel")}
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-all hover:scale-90 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("button.creating") : t("button.create")}
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

export default CreatePassword;
