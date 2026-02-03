import { useTranslation } from "react-i18next";

export const StatusMsg = () => {
  const { t } = useTranslation();

  return {
    RECORD_NOT_SELECTED: t("existingrecord"),
    DELETE_POPUP_MESSAGE: t("deleteselection"),
    SUCCESS: "success",
    PARTIAL_SUCCESS: "partialsuccess",
    WARNING: "warning",
    INFORMATION: "information",
    FAILED: "failed",
    RowsHeight: 40,
    DISABLED_MENU_ITEM: t("menudisabled"),
    NO_RECORDS: t("norecordfound"),
    INSUFFICIENT_USER_RIGHTS: t("insufficientrightstoview"),
    INSUFFICIENT_Action_USER_RIGHTS: t("insufficientrightstopreform"),
  };
};
