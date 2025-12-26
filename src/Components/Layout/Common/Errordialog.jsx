import React from "react";
import { useTranslation } from "react-i18next";

function Errordialog({ message, type = "", onClose }) {

    const { t , i18n} = useTranslation();
    const isTranslationKey = i18n.exists(message);
  const displayMessage = isTranslationKey ? t(message) : message;
  

  let headerColor = "";
  let title = "";
  let buttoncolor = "";  


  switch (type) {
    case "success":
    case "verification-success":
      headerColor = "bg-green-500";
      title = t('Auditpopup.success');
      buttoncolor = "bg-green-500";
      break;
    case "error":
      headerColor = "bg-[#f0ad4e]";
      title = t('Auditpopup.error');
      buttoncolor = "bg-[#f0ad4e]";
      break;
    case "information":
      headerColor = "bg-[#60c1de]";
      title = t('Auditpopup.information');
      buttoncolor = "bg-[#60c1de]";
      break;
      case "confirmation":
      headerColor = "bg-[#d5d5d5]";
      title = t('Auditpopup.confirmation');
      buttoncolor = "bg-[#d5d5d5]";
      break;
    default:
      headerColor = "bg-orange-600/80";
      title = t('Auditpopup.warning');
      buttoncolor = "bg-orange-600/80";
      break;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-md shadow-lg w-[550px]">
        <div
          className={`${headerColor} text-white font-semibold text-lg px-5 py-4 rounded-t-md flex items-center gap-2 transition-all duration-500`}
        >
          {title}
        </div>
        <div className="p-10 text-center transition-all duration-700">
          <p className="text-gray-700 font-semibold text-[18px] leading-relaxed">{displayMessage}</p>
        </div>
        <div className="flex justify-end border-t px-5 py-3">
          <button
            onClick={onClose}
            className={`${buttoncolor} px-5 py-1.5 text-sm font-semibold text-white rounded hover:scale-90 transition duration-200`}
          >
            {t("button.ok")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Errordialog);
