import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { FiCheckSquare } from "react-icons/fi";
import AnimatedDropdown from "../../../../../Layout/Common/AnimatedDropdown";
import { IoIosSettings } from "react-icons/io";
import { useTranslation } from "react-i18next";
import CommunicationSettingsModal from "./CommunicationSettingsModal";
import useAxios from "../../../../../../Services/servicecall";
import { CF_decrypt } from "../../../../../Common/encryptiondecryption";
import AuditTrail from "../../../../../Layout/Common/AuditTrail";
import Errordialog from "../../../../../Layout/Common/Errordialog";

const AddInstrumentModal = ({
  isOpen,
  onClose,
  onSave,
  mode = "add",
  initialData = null,
  clientId,
  setLoading,
  setLoadingText,
  selectedRow,
  selectedRowId, // ✅ pass selected row ID
  loadInstrumentGrid, // ✅ pass reload function
}) => {
  console.log("selectedRow in AddInstrumentModal:", selectedRow);
  const { t } = useTranslation();
  const [showCommSettings, setShowCommSettings] = useState(false);
  const { postData } = useAxios();

  const [availableLicense, setAvailableLicense] = useState(0);
  const [parserOptions, setParserOptions] = useState([]);
  const [interfacerOptions, setInterfacerOptions] = useState([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [pendingForm, setPendingForm] = useState(null);
  const [showInterfacerWarning, setShowInterfacerWarning] = useState(false);
  const [originalInterfacerMapped, setOriginalInterfacerMapped] =
    useState(false);

  const isAddMode = mode === "add";
  const isEditMode = mode === "edit";
  const hasInsufficientLicense = isAddMode && availableLicense < 1;
  const [infoDialog, setInfoDialog] = useState({
    open: false,
    message: "",
    type: "information", // information | warning | error
  });

  const PARSER_ORDER_MAP = {
    0: { label: "NONE", value: "NONE" },
    1: { label: "WIN_METHOD", value: "WIN_METHOD" },
    2: { label: "WEB_METHOD", value: "WEB_METHOD" },
  };
  const LOCK_TYPE_OPTIONS = [
    { label: t("label.automatic"), value: "A" },
    { label: t("label.manual"), value: "M" },
  ];
  const [fieldErrors, setFieldErrors] = useState({
    instrumentCode: "",
    instrumentAlias: "",
  });

  const nodeRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);

  const initialForm = {
    instrumentCode: "",
    instrumentAlias: "",
    instrumentModel: "",
    instrumentMake: "",
    lockType: "A",
    parserType: "NONE",
    automatic: false,
    interfacerMapped: false,
    interfacerInstrument: -2,
    active: false,
  };

  const [form, setForm] = useState(initialForm);
  const showParserInterfacerMsg =
    submitted &&
    (form.parserType === "WIN_METHOD" ||
      form.parserType === "WEB_METHOD") &&
    !form.interfacerMapped;

  const [commData, setCommData] = useState(null);
  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setSubmitted(false);

      setShowCommSettings(false);
      setShowAuditTrail(false);
      setCommData(null);
      setPendingForm(null);
    }
  }, [isOpen, mode]);

  const handleCommSubmit = async (data) => {
    setCommData(data);

    // 🔥 EDIT MODE → go to audit first
    if (isEditMode) {
      setPendingForm({ ...form });
      setShowAuditTrail(true);
      return; // ⛔ Stop here - don't call API yet
    }

    // 🔥 ADD MODE → save immediately, NO audit
    try {
      setLoading(true);
      setLoadingText(t("common.loading"));

      const response = await postData(
        "basemaster/insertInstrumentCommonSetting",
        buildInstrumentRequestPayload(form, data),
      );
      if (!handleApiResponse(response)) return;
      // ✅ CLOSE BOTH POPUPS
      setShowCommSettings(false);
      onSave?.(); // 🔥 notify parent to reload grid
      onClose(); // 🔥 close AddInstrumentModal
    } catch (err) {
      console.error("Comm settings save failed", err);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const getSessionValue = (key) => {
    const value = sessionStorage.getItem(key);

    // ✅ 1. key missing
    if (!value) return "";

    // ✅ 2. already plain text (NOT encrypted)
    if (!value.includes("=") && value.length < 40) {
      return value;
    }

    // ✅ 3. encrypted value
    try {
      return CF_decrypt(value);
    } catch (e) {
      console.warn(`Decrypt skipped for ${key}`);
      return value;
    }
  };
  const getActiveUserDetails = () => ({
    sUserDomainName: getSessionValue("sDomainName"),
    sSessionID: getSessionValue("sSessionID"),
    sUserID: getSessionValue("sUserID"),
    sTimeZoneID: getSessionValue("sTimeZoneID") + "<~>true",
    sApplicationName: "SDMS",
    sdbtype: getSessionValue("sdbtype"),
    sUsername: getSessionValue("sUsername"),
    sSiteCode: getSessionValue("sSiteCode"),
    sCategories: getSessionValue("sCategories"),
    sUserGroupID: getSessionValue("sUserGroupID"),
    sUserStatus: "",
    sTenantID: "",
  });

  const buildDropdownRequest = (instrumentId) => ({
    ActiveUserDetails: getActiveUserDetails(),
    sInstrumentID: instrumentId || "",
    ApplicationCode: "SDMS",
  });

  const loadDropdowns = async () => {
    try {
      const instrumentId =
        mode === "edit" ? initialData?.Instrument?.sInstrumentID : "";

      const res = await postData(
        "basemaster/getMapInstrumentBasedDataFillValues",
        buildDropdownRequest(instrumentId),
      );

      // ✅ Available license
      setAvailableLicense(res.AvailableLicense || 0);

      // ✅ Parser Type dropdown (from Feature)
      if (Array.isArray(res.Feature)) {
        const options = [
          PARSER_ORDER_MAP[0], // 👈 NONE always
        ];

        const interfacerFeature = res.Feature.find(
          (f) => f.L67Enum === "INTERFACER_SETTINGS",
        );

        const webMethodFeature = res.Feature.find(
          (f) => f.L67Enum === "WEBMETHOD_INTERFACER",
        );

        const dbType = getSessionValue("sdbtype")?.toLowerCase();

        // ✅ MSSQL → allow both if enabled
        if (dbType === "mssql") {
          if (interfacerFeature?.L67Status === true) {
            options.push(PARSER_ORDER_MAP[1]);
          }

          if (webMethodFeature?.L67Status === true) {
            options.push(PARSER_ORDER_MAP[2]); // masters.webmethod
          }
        }

        // ✅ POSTGRES → ONLY masters.winmethod if enabledPOSTGRESQL
        else if (dbType === "postgresql") {
          if (interfacerFeature?.L67Status === true) {
            options.push(PARSER_ORDER_MAP[1]); // masters.winmethod only
          }
        }

        setParserOptions(options);
      }

      // ✅ Interfacer Instrument dropdown
      if (Array.isArray(res.InterfacerInstrument)) {
        const interfacerList = res.InterfacerInstrument.map((item) => ({
          label: item.InstrumentName,
          value: String(item.INSTRUMENTID), // ✅ STRING
        }));

        // 🔥 ADD mode: Always show "Create New" option
        if (isAddMode) {
          setInterfacerOptions([
            { label: "Create New", value: "-2" }, // ✅ STRING
            ...interfacerList,
          ]);
        } else {
          // 🔥 EDIT mode: Check iInterfacerInstID from response
          const interfacerId = initialData?.iInterfacerInstID;

          // If iInterfacerInstID is 0, null, or undefined, show "Create New"
          if (
            interfacerId === 0 ||
            interfacerId === null ||
            interfacerId === undefined
          ) {
            setInterfacerOptions([
              { label: "Create New", value: "-2" }, // ✅ STRING
              ...interfacerList,
            ]);
          } else {
            // If iInterfacerInstID has a value, DON'T show "Create New"
            setInterfacerOptions(interfacerList);
          }
        }
      }
    } catch (err) {
      console.error("Dropdown load failed", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    loadDropdowns();
  }, [isOpen]);

  // ✅ preload data for EDIT
  // ✅ preload data for EDIT
  // ✅ preload data for EDIT
  // ✅ preload data for EDIT
  // ✅ preload data for EDIT
  // ✅ preload data for EDIT
  useEffect(() => {
    if (!isOpen || mode !== "edit" || !initialData?.Instrument) return;

    const inst = initialData.Instrument;
    const isMapped = inst.iInterfaceStatus === 1;

    // Get the saved interfacer ID from response
    const savedInterfacerId = String(initialData.iInterfacerInstID || "0");

    const determineInitialValue = () => {
      if (!isMapped) return "";

      // 🔥 If saved interfacer ID is 0, use "Create New" (-2)
      if (
        savedInterfacerId === "0" ||
        savedInterfacerId === "null" ||
        savedInterfacerId === ""
      ) {
        return "-2";
      }

      // 🔥 Check if saved value exists in options
      if (savedInterfacerId && interfacerOptions.length > 0) {
        const existsInOptions = interfacerOptions.some(
          (opt) => opt.value === savedInterfacerId,
        );
        if (existsInOptions) {
          return savedInterfacerId;
        }

        // 🔥 If not exists and "Create New" is available, use it
        const hasCreateNew = interfacerOptions.some(
          (opt) => opt.value === "-2",
        );
        if (hasCreateNew) {
          return "-2";
        }

        // 🔥 Otherwise use first available option
        return interfacerOptions.length > 0 ? interfacerOptions[0].value : "";
      }

      // 🔥 Default to "Create New" if available, otherwise first option
      const hasCreateNew = interfacerOptions.some((opt) => opt.value === "-2");
      if (hasCreateNew) {
        return "-2";
      }
      return interfacerOptions.length > 0 ? interfacerOptions[0].value : "";
    };

    setForm({
      instrumentCode: inst.sInstrumentName || "",
      instrumentAlias: inst.sInstrumentAliasName || "",
      instrumentModel: inst.sInstrumentModel || "",
      instrumentMake: inst.sInstrumentMake || "",
      lockType: inst.sLockType || "A",
      parserType:
        inst.iL11ParserType === 1
          ? "WIN_METHOD"
          : inst.iL11ParserType === 2
            ? "WEB_METHOD"
            : "NONE",
      interfacerMapped: isMapped,
      interfacerInstrument: determineInitialValue(),
      active: Number(inst.iInstrumentStatus) === 1,
    });

    setOriginalInterfacerMapped(isMapped);
    setSubmitted(false);
  }, [isOpen, mode, initialData, interfacerOptions]);

  useEffect(() => {
    if (!isOpen) {
      setFieldErrors({ instrumentCode: "", instrumentAlias: "" });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!isSubmitValid()) return;

    const isParserNeedsInterfacer =
      (form.parserType === "WIN_METHOD" ||
        form.parserType === "WEB_METHOD") &&
      !form.interfacerMapped;

    if (isParserNeedsInterfacer) return;

    // 🔥 ADD MODE → INSERT FIRST
    if (isAddMode) {
      try {
        setLoading(true);
        setLoadingText(t("common.loading"));

        const response = await postData(
          "basemaster/insertInstrument",
          buildInsertInstrumentPayload(form, {}),
        );

        // 🔴 Server validation
        if (response?.Rtn === "Warning" && response?.Message) {
          setFieldErrors({
            instrumentCode: response.Message.sInstrumentName || "",
            instrumentAlias: response.Message.sInstrumentAliasName || "",
          });
          return;
        }
        if (!handleApiResponse(response)) return;
        if (response?.Rtn !== "Success") {
          throw new Error("Insert Instrument failed");
        }

        // ✅ INSERT SUCCESS → now open AuditTrail
        // ✅ correct
        setPendingForm({ ...form });
        onSave?.(); // 🔥 notify parent
        onClose();
      } catch (err) {
        console.error("Insert failed", err);
      } finally {
        setLoading(false);
        setLoadingText("");
      }

      return; // ⛔ stop here for ADD
    }

    // 🔥 EDIT MODE → OLD FLOW (Audit first)
    if (
                          isEditMode &&
                          originalInterfacerMapped &&
                          !form.interfacerMapped&&selectedRow?.clientName !=="-"
                        ) {
                          setShowInterfacerWarning(true);
                          
                          return;
                        }
    setPendingForm(form);
    setShowAuditTrail(true);
  };

  const buildInsertInstrumentPayload = (finalPayload, auditPayload) => {
    return {
      Instrument: {
        sInstrumentName: finalPayload.instrumentCode,
        sInstrumentAliasName: finalPayload.instrumentAlias,
        sInstrumentModel: finalPayload.instrumentModel || "",
        sInstrumentMake: finalPayload.instrumentMake || "",
        sLockType: finalPayload.lockType,

        // 🔥 MUST BE NUMBER
        iL11ParserType:
          finalPayload.parserType === "WIN_METHOD"
            ? 1
            : finalPayload.parserType === "WEB_METHOD"
              ? 2
              : 0,

        // 🔥 MUST BE NUMBER
        iInterfaceStatus: finalPayload.interfacerMapped ? 1 : 0,

        // 🔥 MUST BE NUMBER
        iInstrumentStatus: finalPayload.active ? 1 : 0,

        sInstrumentID: "",
      },

      // 🔥 REQUIRED
      sActionType: "Insert_Normal_Instrument",

      ActiveUserDetails: getActiveUserDetails(),

      ApplicationCode: "SDMS",
    };
  };
  const buildEditInstrumentPayload = (
    finalPayload,
    auditPayload,
    initialData,
  ) => {
    return {
      Instrument: {
        sInstrumentID: initialData?.Instrument?.sInstrumentID,
        sInstrumentName: finalPayload.instrumentCode,
        sInstrumentAliasName: finalPayload.instrumentAlias,
        sInstrumentModel: finalPayload.instrumentModel || "",
        sInstrumentMake: finalPayload.instrumentMake || "",
        sLockType: finalPayload.lockType,

        iL11ParserType:
          finalPayload.parserType === "WIN_METHOD"
            ? 1
            : finalPayload.parserType === "WEB_METHOD"
              ? 2
              : 0,

        iInterfaceStatus: finalPayload.interfacerMapped ? 1 : 0,
        iInstrumentStatus: finalPayload.active ? 1 : 0,
      },

      AuditTrailValues: auditPayload.AuditTrailValues,
      ActiveUserDetails: getActiveUserDetails(),

      ApplicationCode: "SDMS",
    };
  };
  // Helper function to convert conversion type ID to name
  const getConversionTypeName = (conversionTypeId) => {
    switch (conversionTypeId) {
      case 0:
        return "NONE";
      case 1:
        return "Temperature_Celcius";
      case 2:
        return "Temperature_Farenheit";
      default:
        return "NONE";
    }
  };

  const buildInstrumentRequestPayload = (pendingForm, commData) => {
    // Base CommonSetting for all communication types
    const baseCommonSetting = {
      StopBits: commData.StopBits,
      TerminationIdleSecs: commData.TerminationIdleSecs,
      TCPPortNumber: Number(commData.TCPPortNumber) ?? 0,
      Baudrate: Number(commData.Baudrate) ?? 0,
      Databits: Number(commData.Databits) ?? 0,
      COMPortNumber: Number(commData?.COMPortNumber) ?? 0,
      IPAddress: commData.IPAddress ?? "",
      Parity: commData.Parity,
      Handshake: commData.Handshake,
      InstResultSampleIDFrom:
        commData.ResultSampleIDFrom === "IFACER"
          ? 0
          : commData.ResultSampleIDFrom === "LimsTestOrder"
            ? 1
            : 2,

      InstrumentDLL: null,
      AllowRetest: 0,
      MiltiTestOrder: 0,
      InstrumentID: 0,
      IdleTimetoDisconnect: -1,
      AutoReconnectInterval: -1,
      AutoOrderInterval: -1,
      ImportFileWatcherPath: null,
      CheckSumCALC: 0,
      TestBased: -1,
      MiltiSampleResult: 0,
      HostComputerIP: "",
      LimsTestOrder: 0,
    };

    // If it's ICPMODBUS (commType 5), add additional fields
    const isICPModbus = commData.COMMUNICATIONTYPE === 4; // Note: 0-based, so 4 means 5-1

    if (isICPModbus) {
      baseCommonSetting.nMinimumCurrent = commData.MIN_CURRENT || "0";
      baseCommonSetting.nMaximumCurrent = commData.MAX_CURRENT || "0";
      baseCommonSetting.nChannelNumber = commData.CHANNEL_NUMBER || "0";
      baseCommonSetting.nMinimumDataPoint = commData.MIN_DATAPOINT || "0";
      baseCommonSetting.nMaximumDataPoint = commData.MAX_DATAPOINT || "0";
      baseCommonSetting.sConversionType = getConversionTypeName(
        commData.CONVERSION_TYPE,
      );

      // Set COM port and baud to 0 for ICPMODBUS if not provided
      if (!baseCommonSetting.COMPortNumber)
        baseCommonSetting.COMPortNumber = "0";
      if (!baseCommonSetting.Baudrate) baseCommonSetting.Baudrate = "0";
      if (!baseCommonSetting.Databits) baseCommonSetting.Databits = "0";
    }

    return {
      InstrumentList: {
        INSTRUMENTID: 0,
        LABNUMBER: "1",
        ACTIVE: pendingForm.active ? 1 : 0,
        SERIALNUMBER: "1",
        LIMSCOMMTYPE: -1,
        PROTOCOLID: 1,
        COMMUNICATIONTYPE: commData.COMMUNICATIONTYPE,
        MODEL: pendingForm.instrumentModel,
        MANUFACTURER: pendingForm.instrumentMake,
        ISINSTGROUP: -1,
        INSTGROUPID: pendingForm.interfacerMapped
          ? pendingForm.parserType === "WIN_METHOD" ||
            pendingForm.parserType === "WEB_METHOD"
            ? 20
            : 19
          : -1,
        INSTCODE: pendingForm.instrumentCode,
      },
      sClientID: clientId || "",
      Instrument: {
        sInstrumentID: "",
        sInstrumentName: pendingForm.instrumentCode,
        sInstrumentAliasName: pendingForm.instrumentAlias,
        iInstrumentStatus: pendingForm.active ? 1 : 0,
        iL11ParserType:
          pendingForm.parserType === "WIN_METHOD"
            ? 1
            : pendingForm.parserType === "WEB_METHOD"
              ? 2
              : 0,
        sInstrumentModel: pendingForm.instrumentModel,
        sInstrumentMake: pendingForm.instrumentMake,
        iInterfaceStatus: pendingForm.interfacerMapped ? 1 : 0,
        sLockType: pendingForm.lockType,
      },

      CommonSetting: baseCommonSetting,

      ActiveUserDetails: getActiveUserDetails(),
      ApplicationCode: "SDMS",
    };
  };

  const buildInstrumentEditRequestPayload = (
    pendingForm,
    commData,
    auditPayload,
  ) => {
    // Base CommonSetting for all communication types
    const baseCommonSetting = {
      StopBits: commData.StopBits,
      TerminationIdleSecs: commData.TerminationIdleSecs,
      TCPPortNumber: Number(commData.TCPPortNumber) ?? 0,
      Baudrate: Number(commData.Baudrate) ?? 0,
      Databits: Number(commData.Databits) ?? 0,
      COMPortNumber: Number(commData?.COMPortNumber) ?? 0,
      IPAddress: commData.IPAddress ?? "",
      Parity: commData.Parity,
      Handshake: commData.Handshake,
      InstResultSampleIDFrom:
        commData.ResultSampleIDFrom === "IFACER"
          ? 0
          : commData.ResultSampleIDFrom === "LimsTestOrder"
            ? 1
            : 2,
      InstrumentDLL: null,
      AllowRetest: 0,
      MiltiTestOrder: 0,
      InstrumentID:
        Number(pendingForm.interfacerInstrument) === -2
          ? 0
          : Number(pendingForm.interfacerInstrument),
      IdleTimetoDisconnect: -1,
      AutoReconnectInterval: -1,
      AutoOrderInterval: -1,
      ImportFileWatcherPath: null,
      CheckSumCALC: 0,
      TestBased: -1,
      MiltiSampleResult: 0,
      HostComputerIP: "",
      LimsTestOrder: 0,
    };

    // If it's ICPMODBUS (commType 5), add additional fields
    const isICPModbus = commData.COMMUNICATIONTYPE === 4; // Note: 0-based, so 4 means 5-1

    if (isICPModbus) {
      baseCommonSetting.nMinimumCurrent = commData.MIN_CURRENT || "0";
      baseCommonSetting.nMaximumCurrent = commData.MAX_CURRENT || "0";
      baseCommonSetting.nChannelNumber = commData.CHANNEL_NUMBER || "0";
      baseCommonSetting.nMinimumDataPoint = commData.MIN_DATAPOINT || "0";
      baseCommonSetting.nMaximumDataPoint = commData.MAX_DATAPOINT || "0";
      baseCommonSetting.sConversionType = getConversionTypeName(
        commData.CONVERSION_TYPE,
      );

      // Set COM port and baud to 0 for ICPMODBUS if not provided
      if (!baseCommonSetting.COMPortNumber)
        baseCommonSetting.COMPortNumber = "0";
      if (!baseCommonSetting.Baudrate) baseCommonSetting.Baudrate = "0";
      if (!baseCommonSetting.Databits) baseCommonSetting.Databits = "0";
    }

    return {
      InstrumentList: {
        INSTRUMENTID:
          Number(pendingForm.interfacerInstrument) === -2
            ? 0
            : Number(pendingForm.interfacerInstrument),
        LABNUMBER: "1",
        ACTIVE: pendingForm.active ? 1 : 0,
        SERIALNUMBER: "1",
        LIMSCOMMTYPE: -1,
        PROTOCOLID: 1,
        COMMUNICATIONTYPE: commData.COMMUNICATIONTYPE,
        MODEL: pendingForm.instrumentModel,
        MANUFACTURER: pendingForm.instrumentMake,
        ISINSTGROUP: -1,
        INSTGROUPID: pendingForm.interfacerMapped
          ? pendingForm.parserType === "WIN_METHOD" ||
            pendingForm.parserType === "WEB_METHOD"
            ? 20
            : 19
          : -1,
        INSTCODE: pendingForm.instrumentCode,
      },

      Instrument: {
        sInstrumentID: initialData?.Instrument?.sInstrumentID || "",
        sInstrumentName: pendingForm.instrumentCode,
        sInstrumentAliasName: pendingForm.instrumentAlias,
        iInstrumentStatus: pendingForm.active ? 1 : 0,
        iL11ParserType:
          pendingForm.parserType === "WIN_METHOD"
            ? 1
            : pendingForm.parserType === "WEB_METHOD"
              ? 2
              : 0,
        sInstrumentModel: pendingForm.instrumentModel,
        sInstrumentMake: pendingForm.instrumentMake,
        iInterfaceStatus: pendingForm.interfacerMapped ? 1 : 0,
        sLockType: pendingForm.lockType,
      },

      CommonSetting: baseCommonSetting,
      AuditTrailValues: auditPayload?.AuditTrailValues,
      ActiveUserDetails: getActiveUserDetails(),
      ApplicationCode: "SDMS",
    };
  };
  const handleApiResponse = (response) => {
    if (!response || response.Rtn !== "Success") {
      setInfoDialog({
        open: true,
        message:
          response?.Message?.sInstrumentName ||
          response?.Message ||
          t("common.operationfailed"),
        type: response?.Rtn || "Error",
      });
      return false; // ⛔ stop caller flow
    }
    return true; // ✅ success
  };

  const handleAuditAuthorized = async (auditPayload) => {
  setShowAuditTrail(false);

  if (!pendingForm) return;

  const previousRowId = selectedRowId; // 🔥 store current selection

  try {
    setLoading(true);
    setLoadingText(t("common.loading"));

    // Check if this is a basic instrument edit OR communication settings edit
    const isBasicEdit = !commData; // No communication data means basic edit
    const isCommEdit = !!commData; // Has communication data means comm settings edit
    
    if (isBasicEdit) {
      // 1️⃣ EDIT basic instrument info ONLY
      const editResponse = await postData(
        "basemaster/editInstrument",
        buildEditInstrumentPayload(pendingForm, auditPayload, initialData),
      );

      if (!handleApiResponse(editResponse)) {
        return; // Stop on error
      }
      
    } else if (isCommEdit) {
      // 2️⃣ EDIT communication settings ONLY (when interfacerMapped is true)
      if (pendingForm.interfacerMapped) {
        const commResponse = await postData(
          "basemaster/insertInstrumentCommonSetting",
          buildInstrumentEditRequestPayload(
            pendingForm,
            commData,
            auditPayload,
          ),
        );
        
        if (!handleApiResponse(commResponse)) {
          return; // Stop on error
        }
      }
    }

    // ✅ SUCCESS - close popups
    setCommData(null);
    setPendingForm(null);
    await loadInstrumentGrid(false, previousRowId);
    setShowCommSettings(false);
    onClose(); // ✅ ONLY close on success
    
  } catch (err) {
    console.error("Edit save failed", err);
  } finally {
    setLoading(false);
    setLoadingText("");
  }
};

  const checkExistingInstrument = async () => {
    const payload = {
      Instrument: {
        sInstrumentName: form.instrumentCode,
        sInstrumentAliasName: form.instrumentAlias,
        sInstrumentID: "", // 🔥 always empty for ADD
      },
      ActiveUserDetails: getActiveUserDetails(),

      ApplicationCode: "SDMS",
    };

    const res = await postData(
      "basemaster/checkingExistingInstrument",
      payload,
    );

    return Array.isArray(res) && res.length > 0;
  };
  const getInstrumentCommSettings = async (instrumentId) => {
    const res = await postData("basemaster/getInstrumentBasedSetting", {
      INSTRUMENTID: instrumentId,
      ActiveUserDetails: getActiveUserDetails(),
      ApplicationCode: "SDMS",
    });

    return Array.isArray(res) && res.length > 0 ? res[0] : null;
  };

  const confirmUnmapInterfacer = () => {
    setForm((prev) => ({
      ...prev,
      interfacerMapped: false,
      interfacerInstrument: "",
    }));

    setShowInterfacerWarning(false);
    setPendingForm(form);
    setShowAuditTrail(true);
  };

  // Submit validation (ONLY 2 fields)
  const isSubmitValid = () => {
    return form.instrumentCode.trim() && form.instrumentAlias.trim();
  };

  // Communication Settings validation (4 fields)
  const isCommSettingsValid = () => {
    return (
      form.instrumentCode.trim() &&
      form.instrumentAlias.trim() &&
      form.instrumentModel.trim() &&
      form.instrumentMake.trim()
    );
  };
  // Helper function to get the display value for interfacerInstrument
  // Helper function to get the display value for interfacerInstrument
  // Helper function to get the display value for interfacerInstrument
  const getInterfacerDisplayValue = () => {
    if (!form.interfacerMapped) return "";

    // For ADD mode, just return the form value
    if (isAddMode) {
      return form.interfacerInstrument;
    }

    // For EDIT mode
    if (form.interfacerInstrument) {
      // Check if the current value exists in options
      const existsInOptions = interfacerOptions.some(
        (opt) => opt.value === form.interfacerInstrument,
      );

      if (existsInOptions) {
        // If exists, return it
        return form.interfacerInstrument;
      } else {
        // If not exists, check if "Create New" is available
        const hasCreateNew = interfacerOptions.some(
          (opt) => opt.value === "-2",
        );
        if (hasCreateNew) {
          return "-2";
        }
        // Otherwise use first option
        return interfacerOptions.length > 0 ? interfacerOptions[0].value : "";
      }
    }

    // If no value, check for "Create New" first, then first option
    const hasCreateNew = interfacerOptions.some((opt) => opt.value === "-2");
    if (hasCreateNew) {
      return "-2";
    }
    return interfacerOptions.length > 0 ? interfacerOptions[0].value : "";
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
        <Draggable nodeRef={nodeRef} handle=".modal-header" bounds="parent">
          <div
            ref={nodeRef}
            className="bg-white w-[600px] max-h-[99vh] rounded-lg shadow-lg flex flex-col  animate-slideFromTop"
          >
            {/* HEADER */}
            <div className="modal-header cursor-move flex justify-between px-4 py-2 bg-slate-100 border-b rounded-t-lg">
              <label
                className="text-[#0e5bca] text-[18px]"
                style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
              >
                {mode === "edit"
                  ? t("masters.editInstrument")
                  : t("masters.addInstrument")}
              </label>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                  setCommData(null);
                  setPendingForm(null);
                  setShowCommSettings(false);
                  onClose();
                }}
                className="text-gray-300 text-[20px] font-bold "
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="px-4 py-4 overflow-y-auto flex-1">
              {/* License Info */}
              {(availableLicense > 0 || isAddMode) && (
                <label
                  className={`block text-center text-[12px] font-bold font-roboto ${
                    availableLicense > 0 ? "text-green-700" : "text-[#ff0000]"
                  }`}
                >
                  {availableLicense > 0
                    ? `${t("masters.availableLicense")}: ${availableLicense}`
                    : isAddMode
                      ? t("masters.insufficientlicensetocreateinstrument")
                      : ""}
                </label>
              )}

              <div className="space-y-7 w-[340px]">
                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.instrumentCode")}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instrumentCode"
                    value={form.instrumentCode}
                    disabled={isEditMode} // 🔥 THIS LINE
                    onChange={(e) => {
                      if (isEditMode) return; // extra safety
                      setForm({ ...form, instrumentCode: e.target.value });
                      setFieldErrors((prev) => ({
                        ...prev,
                        instrumentCode: "",
                      }));
                    }}
                    className={`
    w-full bg-transparent pb-1 text-[12px] font-semibold outline-none
    border-b-2
    ${
      isEditMode
        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
        : submitted && (!form.instrumentCode || fieldErrors.instrumentCode)
          ? "border-red-500"
          : "border-gray-300"
    }
  `}
                  />

                  {fieldErrors.instrumentCode && (
                    <div className="text-[11px] text-red-600 font-roboto">
                      {fieldErrors.instrumentCode}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.instrumentAlias")}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instrumentAlias"
                    value={form.instrumentAlias}
                    onChange={(e) => {
                      setForm({ ...form, instrumentAlias: e.target.value });
                      setFieldErrors((prev) => ({
                        ...prev,
                        instrumentAlias: "",
                      }));
                    }}
                    className={`
    w-full bg-transparent pb-1 text-[12px] font-semibold outline-none
    border-b-2
    ${
      submitted && (!form.instrumentAlias || fieldErrors.instrumentAlias)
        ? "border-red-500"
        : "border-gray-300"
    }
  `}
                  />

                  {fieldErrors.instrumentAlias && (
                    <div className="text-[11px] text-red-600 font-roboto">
                      {fieldErrors.instrumentAlias}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.instrumentModel")}
                    {form.interfacerMapped && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  <input
                    type="text"
                    name="instrumentModel"
                    value={form.instrumentModel}
                    onChange={(e) =>
                      setForm({ ...form, instrumentModel: e.target.value })
                    }
                    className={`
  w-full bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
      border-b-2 
 ${
   submitted && form.interfacerMapped && !form.instrumentModel
     ? "border-red-500"
     : "border-gray-300"
 }

  focus:border-blue-500
`}
                  />
                </div>

                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.instrumentMake")}
                    {form.interfacerMapped && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  <input
                    type="text"
                    name="instrumentMake"
                    value={form.instrumentMake}
                    onChange={(e) =>
                      setForm({ ...form, instrumentMake: e.target.value })
                    }
                    className={`
 w-full bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
      border-b-2 
${
  submitted && form.interfacerMapped && !form.instrumentMake
    ? "border-red-500"
    : "border-gray-300"
}

  focus:border-blue-500
`}
                  />
                </div>

                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.lockType")}
                    <span className="text-red-500">*</span>
                  </label>
                  <AnimatedDropdown
                    name="lockType"
                    value={form.lockType}
                    options={LOCK_TYPE_OPTIONS}
                    displayKey="label"
                    valueKey="value"
                    onChange={(e) =>
                      setForm({ ...form, lockType: e.target.value })
                    }
                    required
                    showError={submitted}
                  />
                </div>

                <div>
                  <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.parserType")}
                    <span className="text-red-500">*</span>
                  </label>

                  <AnimatedDropdown
                    name="parserType"
                    value={form.parserType}
                    options={parserOptions}
                    displayKey="label"
                    valueKey="value"
                    onChange={(e) =>
                      setForm({ ...form, parserType: e.target.value })
                    }
                    required
                    showError={submitted}
                  />

                  {showParserInterfacerMsg && (
                    <div className=" text-[11px] text-red-600 font-roboto">
                      {t("masters.selectInterfacerMessage")}
                    </div>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="flex gap-8">
                  <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("masters.interfacerMapped")}
                    <input
                      type="checkbox"
                      checked={form.interfacerMapped}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        // ✅ EDIT MODE + was originally checked + user tries to uncheck
                        

                        if (checked) {
                          let defaultInstrumentValue = "";

                          if (isAddMode) {
                            // ADD mode: Default to "Create New" (-2)
                            defaultInstrumentValue = "-2";
                          } else {
                            // EDIT mode: Check iInterfacerInstID from response
                            const savedInterfacerId = String(
                              initialData?.iInterfacerInstID || "0",
                            );

                            if (
                              savedInterfacerId === "0" ||
                              savedInterfacerId === "null" ||
                              savedInterfacerId === ""
                            ) {
                              // No existing interfacer, use "Create New" if available
                              defaultInstrumentValue = interfacerOptions.some(
                                (opt) => opt.value === "-2",
                              )
                                ? "-2"
                                : interfacerOptions.length > 0
                                  ? interfacerOptions[0].value
                                  : "";
                            } else {
                              // Has existing interfacer, try to use it
                              const existsInOptions = interfacerOptions.some(
                                (opt) => opt.value === savedInterfacerId,
                              );
                              defaultInstrumentValue = existsInOptions
                                ? savedInterfacerId
                                : interfacerOptions.length > 0
                                  ? interfacerOptions[0].value
                                  : "";
                            }
                          }

                          setForm({
                            ...form,
                            interfacerMapped: checked,
                            interfacerInstrument: defaultInstrumentValue,
                          });
                        } else {
                          // When unchecking
                          setForm({
                            ...form,
                            interfacerMapped: checked,
                            interfacerInstrument: "",
                          });
                        }
                      }}
                    />
                  </label>

                  <label className="flex items-center gap-2 text-[#405f7d] text-[12px] font-bold font-roboto">
                    {t("statuses.active")}
                    <input
                      type="checkbox"
                      checked={form.active} // 👈 THIS is mandatory
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          active: e.target.checked,
                        }))
                      }
                    />
                  </label>
                </div>

                {form.interfacerMapped && (
                  <div>
                    <label className="block text-[#405f7d] text-[12px] font-bold font-roboto">
                      {t("masters.interfacerInstrument")}
                      <span className="text-red-500">*</span>
                    </label>
                    <AnimatedDropdown
                      name="interfacerInstrument"
                      value={getInterfacerDisplayValue()}
                      options={interfacerOptions}
                      displayKey="label"
                      valueKey="value"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          interfacerInstrument: e.target.value, // 🔥 keep as STRING
                        })
                      }
                      required
                      showError={submitted}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              {form.interfacerMapped && (
                <button
                  onClick={async () => {
                    setSubmitted(true);

                    if (!isCommSettingsValid()) return;

                    // ADD MODE duplicate check
                    if (isAddMode) {
                      const isDuplicate = await checkExistingInstrument();
                      if (isDuplicate) {
                        setFieldErrors({
                          instrumentCode: t(
                            "masters.instrumentnamealreadyexists",
                          ),
                          instrumentAlias: t(
                            "masters.instrumentaliasnamealreadyexists",
                          ),
                        });
                        return;
                      }
                    }

                    let commSettings = null;

                    if (form.interfacerInstrument !== -2) {
                      commSettings = await getInstrumentCommSettings(
                        form.interfacerInstrument,
                      );
                    }

                    setCommData(commSettings);
                    setPendingForm(form);
                    setShowCommSettings(true);
                  }}
                  className="flex items-center gap-1 px-[12px] py-[6px] rounded text-[11px] font-bold shadow-sm bg-[#2883fe] text-white"
                >
                  <IoIosSettings className="w-4 h-4" />
                  {t("masters.communicationSettings")}
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={form.interfacerMapped || hasInsufficientLicense}
                className={`flex items-center gap-1 px-[12px] text-white py-[6px] rounded text-[11px] font-bold shadow-sm ${
                  form.interfacerMapped || hasInsufficientLicense
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-[#2883fe]"
                }`}
              >
                <FiCheckSquare className="w-4 h-4" />
                {t("button.submit")}
              </button>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                  onClose();
                }}
                className="border px-[12px] py-[6px] rounded text-[11px] text-[#8092a4] font-bold"
              >
                {t("button.close")}
              </button>
            </div>
          </div>
        </Draggable>
      </div>
      <CommunicationSettingsModal
        isOpen={showCommSettings}
        interfacerInstrument={form.interfacerInstrument}
        parserType={form.parserType}
        instrumentData={pendingForm}
        commData={commData}
        onSubmit={handleCommSubmit}
        selectedRow={selectedRow}
        onClose={() => setShowCommSettings(false)}
      />

      <AuditTrail
        isOpen={showAuditTrail}
        onClose={() => setShowAuditTrail(false)}
        onAuthorized={handleAuditAuthorized}
        actionLabel={mode === "edit" ? "Update" : "Submit"}
      />
      {showInterfacerWarning && (
        <Errordialog
          type="confirmation"
          message={t("masters.interfacermappedwithnonmappedinstrumentalertmsg")}
          showCancel={true}
          onConfirm={() => {
            confirmUnmapInterfacer();
          }}
          onCancel={() => {
            setShowInterfacerWarning(false);
          }}
        />
      )}
      {infoDialog.open && (
        <Errordialog
          type="information"
          message={infoDialog.message}
          onClose={() => setInfoDialog({ open: false, message: "" })}
        />
      )}
    </>
  );
};

export default AddInstrumentModal;
