// import React from "react";
// import { useTranslation } from "react-i18next";

// function Errordialog({ message, type = "", onClose }) {

//     const { t , i18n} = useTranslation();
//     const isTranslationKey = i18n.exists(message);
//   const displayMessage = isTranslationKey ? t(message) : message;
  

//   let headerColor = "";
//   let title = "";
//   let buttoncolor = "";  


//   switch (type) {
//     case "success":
//     case "verification-success":
//       headerColor = "bg-green-500";
//       title = t('Auditpopup.success');
//       buttoncolor = "bg-green-500";
//       break;
//     case "error":
//       headerColor = "bg-[#f0ad4e]";
//       title = t('Auditpopup.error');
//       buttoncolor = "bg-[#f0ad4e]";
//       break;
//     case "information":
//       headerColor = "bg-[#60c1de]";
//       title = t('Auditpopup.information');
//       buttoncolor = "bg-[#60c1de]";
//       break;
//       case "confirmation":
//       headerColor = "bg-[#d5d5d5]";
//       title = t('Auditpopup.confirmation');
//       buttoncolor = "bg-[#d5d5d5]";
//       break;
//     default:
//       headerColor = "bg-orange-600/80";
//       title = t('Auditpopup.warning');
//       buttoncolor = "bg-orange-600/80";
//       break;
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//       <div className="bg-white rounded-md shadow-lg w-[550px]">
//         <div
//           className={`${headerColor} text-white font-semibold text-lg px-5 py-4 rounded-t-md flex items-center gap-2 transition-all duration-500`}
//         >
//           {title}
//         </div>
//         <div className="p-10 text-center transition-all duration-700">
//           <p className="text-gray-700 font-semibold text-[18px] leading-relaxed">{displayMessage}</p>
//         </div>
//         <div className="flex justify-end border-t px-5 py-3">
//           <button
//             onClick={onClose}
//             className={`${buttoncolor} px-5 py-1.5 text-sm font-semibold text-white rounded hover:scale-90 transition duration-200`}
//           >
//             {t("button.ok")}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default React.memo(Errordialog);



// import React from "react";
// import { useTranslation } from "react-i18next";

// function Errordialog({
//   message,
//   type = "",
//   onClose,
//   showCancel = false,
//   onCancel,
//   cancelText,
//   okText,
//   onConfirm, 
//   reverseButtons = false, 
// }) {
//   const { t, i18n } = useTranslation();
//   const isTranslationKey = i18n.exists(message);
//   const displayMessage = isTranslationKey ? t(message) : message;

//   let headerColor = "";
//   let title = "";
//   let buttoncolor = "";

//   switch (type) {
//     case "success":
//     case "verification-success":
//       headerColor = "bg-green-500";
//       title = t("Auditpopup.success");
//       buttoncolor = "bg-green-500";
//       break;
//     case "error":
//       headerColor = "bg-[#f0ad4e]";
//       title = t("Auditpopup.error");
//       buttoncolor = "bg-[#f0ad4e]";
//       break;
//     case "information":
//       headerColor = "bg-[#60c1de]";
//       title = t("Auditpopup.information");
//       buttoncolor = "bg-[#60c1de]";
//       break;
//     case "confirmation":
//       headerColor = "bg-[#d5d5d5]";
//       title = t("Auditpopup.confirmation");
//       buttoncolor = "bg-[#d5d5d5]";
//       break;
//     case "confirmationlogout":
//       headerColor = "bg-[#d9534f]";
//       title = t("Auditpopup.confirmationlogout");
//       buttoncolor = "bg-[#d9534f]";
//       break;
//     default:
//       headerColor = "bg-orange-600/80";
//       title = t("Auditpopup.warning");
//       buttoncolor = "bg-orange-600/80";
//       break;
//   }

//   const handleCancel = () => {
//     if (onCancel) onCancel();
//     else onClose?.();
//   };

//   const handleOk = () => {
//     if (onConfirm) onConfirm(); // Call confirm action if provided
//     else onClose?.(); // Default to close
//   };

//   // Define buttons as variables to easily swap them
//   const CancelBtn = (
//     <button
//       key="cancel-btn"
//       type="button"
//       onClick={handleCancel}
//       className="border border-gray-300 px-6 py-1.5 text-sm font-semibold text-slate-700 rounded hover:scale-90 transition duration-200"
//     >
//       {cancelText || t("button.cancel")}
//     </button>
//   );

//   const OkBtn = (
//     <button
//       key="ok-btn"
//       type="button"
//       onClick={handleOk}
//       className={`${buttoncolor} px-6 py-1.5 text-sm font-semibold text-white rounded hover:scale-90 transition duration-200`}
//     >
//       {okText || t("button.ok")}
//     </button>
//   );

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//       <div className="bg-white rounded-md shadow-lg w-[550px]">
//        {/* changed font to roboto */}
//         <div
//           className={`${headerColor} text-white font-roboto font-semibold text-lg px-5 py-4 rounded-t-md flex items-center gap-2 transition-all duration-500`}
//         >
//           {title}
//         </div>

//         <div className="p-10 text-center transition-all duration-700">
//           {/* changed font to roboto */}
//           <p className="text-gray-700 font-semibold font-roboto text-[18px] leading-relaxed">
//             {displayMessage}
//           </p>
//         </div>
//         {/* changed font to roboto */}
//         <div className="flex justify-end font-roboto border-t px-5 py-3 gap-2">
//           {reverseButtons ? (
//             <>
//               {OkBtn}
//               {showCancel && CancelBtn}
//             </>
//           ) : (
//             <>
//               {showCancel && CancelBtn}
//               {OkBtn}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default React.memo(Errordialog);



import React from "react";
import { useTranslation } from "react-i18next";

function Errordialog({
  message,
  subMessage = "",
  type = "",
  onClose,
  showCancel = false,
  onCancel,
  cancelText,
  okText,
  onConfirm,
  confirmButtonColor,
  reverseButtons = false,
  customButtons = null,
  titleTextColor = "text-white" 
}) {
  const { t, i18n } = useTranslation();
  const isTranslationKey = i18n.exists(message);
  const displayMessage = isTranslationKey ? t(message) : message;

  const isSubMessageKey = subMessage && i18n.exists(subMessage);
  const displaySubMessage = isSubMessageKey ? t(subMessage) : subMessage;

  let headerColor = "";
  let title = "";
  let defaultButtonColor = "";

  switch (type) {
    case "success":
      headerColor = "bg-green-500";
      title = t("Auditpopup.success");
      defaultButtonColor = "bg-green-500 text-white";
      break;
    case "error":
      // headerColor = "bg-[#f0ad4e]";
      headerColor = "bg-red-400";
      title = t("Auditpopup.error");
      // defaultButtonColor = "bg-[#f0ad4e] text-white";
      defaultButtonColor = "bg-red-400 text-white";
      break;
    case "information":
      headerColor = "bg-[#60c1de]";
      title = t("Auditpopup.information");
      defaultButtonColor = "bg-[#60c1de] text-white";
      break;
    case "confirmation":
      headerColor = "bg-[#d5d5d5]";
      title = t("Auditpopup.confirmation");
      defaultButtonColor = "bg-[#d5d5d5] text-white";
      break;
    default:
      headerColor = "bg-orange-600/80";
      title = t("Auditpopup.warning");
      defaultButtonColor = "bg-orange-600/80 text-white";
      break;
  }

  const handleClose = () => {
    if (onClose) onClose();
  };

  let buttonsToRender = [];

  if (customButtons && Array.isArray(customButtons) && customButtons.length > 0) {
    buttonsToRender = customButtons;
  } else {
    const cancelBtnObj = {
      text: cancelText || t("button.cancel"),
      onClick: onCancel || handleClose,
      className: "border border-gray-300 text-slate-700 bg-white",
    };

    const okBtnObj = {
      text: okText || t("button.ok"),
      onClick: onConfirm || handleClose,
      className: confirmButtonColor || defaultButtonColor,
    };

    if (reverseButtons) {
      buttonsToRender = [okBtnObj];
      if (showCancel) buttonsToRender.push(cancelBtnObj);
    } else {
      if (showCancel) buttonsToRender.push(cancelBtnObj);
      buttonsToRender.push(okBtnObj);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-md shadow-lg w-[550px]">
        <div
          className={`${headerColor} ${titleTextColor} font-roboto font-semibold text-lg px-5 py-4 rounded-t-md flex items-center gap-2 transition-all duration-500`}
        >
          {title}
        </div>

        <div className="p-10 text-center transition-all duration-700">
          <p className="text-gray-700 font-semibold font-roboto text-[18px] leading-relaxed">
            {displayMessage}
          </p>

        {displaySubMessage && (
            <p className="text-gray-500 font-normal font-roboto text-[14px] mt-3 leading-relaxed">
              {displaySubMessage}
            </p>
          )}

        </div>
        
        <div className="flex justify-end font-roboto border-t px-5 py-3 gap-3">
          {buttonsToRender.map((btn, index) => {
            // Check if the text provided is a key in your en.json/locales
            const isBtnKey = i18n.exists(btn.text);
            const buttonLabel = isBtnKey ? t(btn.text) : btn.text;

            return (
              <button
                key={index}
                type="button"
                onClick={btn.onClick}
                className={`px-6 py-1.5 text-sm font-semibold rounded hover:scale-95 transition duration-200 shadow-sm ${btn.className}`}
                style={btn.style} 
              >
                {buttonLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Errordialog);