import { useTranslation } from "react-i18next";


export const useAlerts = () => {
  const { t } = useTranslation();


  const UserManagAlert = {
    SCHRIG_SAVE: t("schedulerrightssave"),
    NO_RECORDSFORACTDEACT: t("gridactivedeactive"),
    CONF_ACTDEACT: t("confiramationactdeact"),
    USER_SELECTED: t("userselectedis"),
    CANT_EDIT: t("socantedit"),
    CANT_ACTDEACT: t("socantactivedeactive"),
    CANT_APPROVE: t("socantapprove"),
    CONF_APPROVE: t("confirmationapprove"),
    RETIRE_MSG: t("retiremessage"),
    CONF_RETIRE: t("confirametionretire"),
    ADMINUSER_CANTRETIRE: t("adminusercantberetired"),
    ADMINUSER_CANTRESET: t("adminusercantreset"),
    USERRETIRED_CANTREST: t("userretiredsocantrest"),
    USERRETIRED_CANTACTIVE: t("userretiredsocantactive"),
    CONF_ACTDEACTFORUSER: t("confiramationactdeactforuser"),
    ADMINUSER_CANTACTDEACT: t("adminusercantbeactivedeactivate"),
    USER_NOTLOCKED: t("userlockmessage"),
    ADMINUSER_CANTLOCK: t("adminusercantbelock"),
    NO_USERSTOIMPORT: t("nouserstoimport"),
    IMPORTALL_USERS: t("selecttoimportallusers"),
    ENABLE_RIGHTS: t("enablerightsinpreference"),
    ADMINGRP_CANTEDIT: t("adminigroupnamecannotbeeditedordeactivate"),
    ADMINGRPDEACT_CANTEDIT: t("groupdeactivesocannotedit"),
    USERRIGHTS_SAVESUCCESS: t("userrightssavesuccess"),
    USERRIGHTS_SAVEFAIL: t("userrightssavefailed"),
  };

  const AudittrailAlert = {
    CREATEARCHIVE: t("doyouwanttocreateaarchive"),
    OPENARCHIVE: t("doyouwanttoopenaarchive"),
    DATEVALIDATION: t("startdateshouldbelessthanenddate"),
  };

  const TemplateTagsAlert = {
    CANTMOVE_ROOT: t("cannotmoverootnode"),
    LOADORDER_TREE: t("loadorderlist"),
    CANTSAVEEMPTY_TEMPLATE: t("cannotsaveemptytemplate"),
    THISISTAG_NAME: t("thisistagname"),
    THISISTAG_VALUE: t("thisistagvalue"),
    THISISTREE_HEADING: t("selectedistreeheading"),
    CONF_ACTDEACTFORTag: t("confiramationactdeactfortag"),
    CONF_ACTDEACTFORTemplate: t("confiramationactdeactfortemplate"),
    TAG_SELECT: t("tagselect"),
    TEMPLATE_SELECT: t("templateselect"),
    TAGVALUE_CANTADD: t("tagvaluecantadd"),
    TAGVALUE_CANTEDIT: t("tagvaluecantedit"),
  };

  const SchedulerAlert = {
    CONF_DEACTIVESCHEDULER: t("confirmationdeactivescheduler"),
    CONF_DEACTIVESCHEDULERWITHMANUALTASK: t("confirmationdeactiveschedulerwithmanualtask"),
    CONF_RETIRESCHEDULER: t("confirmationretirescheduler"),
    CONF_RETIRESCHEDULERWITHMANUALTASK: t("confirmationretireschedulerwithmanualtask"),
    CONF_ACTIVESCHEDULER: t("confirmationactivescheduler"),
    CONF_ACTIVESCHEDULERWITHMANUALTASK: t("confirmationactiveschedulerwithmanualtask"),
    INCOMPLETE_DATAFIELDS: t("incompletedatafields"),
    INSTRUMENT_ALREADYMAPPED: t("instrumentalreadymapped"),
    LLPROINSTRUMENT_MAPPEDSUCCESS: t("llproinstrumentmappedsuccess"),
    LLPROINSTRUMENT_MAPPEDFAILED: t("llproinstrumentmappedfailed"),
    SAVE_SUCCESS: t("savedsuccessfully"),
    ACTIVE_DOWNLOADSCHEDULER: t("confirmationactivedownloadscheduler"),
    CANTRETIRE_ACTIVEDOWNLOADSCHEDULER: t("cantactiveretireddownloadscheduler"),
    DEACTIVE_DOWNLOADSCHEDULER: t("confirmationdeactivedownloadscheduler"),
    CANTRETIRE_DEACTIVEDOWNLOADSCHEDULER: t("cantdeactiveretireddownloadscheduler"),
    RETIRE_DOWNLOADSCHEDULER: t("confirmationretiredownloadscheduler"),
    SCHEDULER_SAVESUCCESSMESSAGE: t("schedulersavedsuccessfully"),
    SCHEDULER_EXPIRY_TIME_VALIDATION_MESSAGE: t("schedulerexpirytimevalidationmessage"),
  };

  const InstrumentLock = {
    INSTLOCK_PLZSELECT: t("pleaseselect"),
    INSTLOCK_VALUE: t("value"),
    TAGSALREADY_EXIST: t("confirmationtagsalreadyexist"),
    INSTLOCK_INTERFACENOTCONNECTED: t("interfacenotconnected"),
  };

  const FTPSCREEN = {
    FTPCONNECTION_SUCCESS: t("ftpserverconnection"),
    CONF_FTPACTIVESTATUS: t("confirmationftpactivestatus"),
    FTP_PATHISSUE: t("ftppathissue"),
  };

  const MastersScreen = {
    DBBASED_DISABLED: t("dbbasedisdisabled"),
    INSUFFICIENT_LICENSE: t("insufficientlicense"),
  };

  const DataExplorer = {
    EXPLORER_SELECTTAG: t("selectanytag"),
    EXPLORER_SELECTTEMPLATE: t("selecttemplate"),
    CHOOSEFIELD_NAMEVALUE: t("choosefieldnameorvalue"),
    ALLOW_POPUP: t("allowpopup"),
    CONFIGURATION_UPDATED_SUCCESS: t("configurationupdatedsuccessfully"),
    CONFIGURATION_UPDATED_FAILED: t("configurationupdatedfailed"),
    RESTORE_CONFIRMATION_CLIENTSTATUS: t("restoreclientstatusconfirmation"),
  };

  const Commonfunction = {
    FILEEXTENTION_SHOULDBE: t("fileextentionshouldbe"),
    CONFIRMATION: t("confirmation"),
    ALERT_DIALOG: t("alertdialog"),
    WARNING: t("warning"),
    INFORMATION: t("information"),
    FAILED: t("failed"),
    SUCCESS: t("success"),
  };

  const Login = {
    PSWD_MISMATCH: t("mismatchinpswd"),
    ELN_NOTINTEGRATED: t("elnnotintegrated"),
  };

  const TemplateMaster = {
    ADD_TAG_VALUE: t("addtagvalueforthe"),
    ALL_READY_TAG_EXISTS: t("alltemplatetagvaluealreadyexistsforthe"),
    SELECT_TAG_VALUE: t("selecttagvalueforthe"),
    SAVE_SUCCESS: t("templatesavedsuccessfully"),
    SAVE_FAILED: t("templatesavedfailed"),
  };

  const Chat = {
    CHAT_CONFIRMATION: t("wanttoclearthechathistory"),
  };

  const Logout = {
    LOGOUT_CONFIRMATION: t("wanttologoutthispage"),
  };

  const WorkflowSetup = {
    WORKFLOWGROUP_SUCCESS: t("workflowgroupsavedsuccessfully"),
  };

  const Preference = {
    PREFERENCE_SAVESUCCESS: t("audittrailconfigsavesuccess"),
    PREFERENCE_SAVEFAIL: t("audittrailconfigsavefailed"),
  };

  return {
    UserManagAlert,
    AudittrailAlert,
    TemplateTagsAlert,
    SchedulerAlert,
    InstrumentLock,
    FTPSCREEN,
    MastersScreen,
    DataExplorer,
    Commonfunction,
    Login,
    TemplateMaster,
    Chat,
    Logout,
    WorkflowSetup,
    Preference,
  };
};
