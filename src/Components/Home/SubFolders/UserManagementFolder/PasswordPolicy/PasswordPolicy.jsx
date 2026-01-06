import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import Errordialog from '../../../../Layout/Common/Errordialog';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';

export default function PasswordPolicy() {
  const [dbLogin, setDbLogin] = useState(true);
  const [complexPolicy, setComplexPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [validationPending, setValidationPending] = useState(false);
  const [pendingValidationResult, setPendingValidationResult] = useState({
    errors: [],
    warnings: []
  });
  
  // Default values (will be updated from API)
  const [values, setValues] = useState({
    minPasswordLength: 4,
    maxPasswordLength: 10,
    passwordHistory: 5,
    passwordExpiry: 90,
    autolockPolicy: 3,
    minUppercase: 0,
    minLowercase: 0,
    minNumeric: 0,
    minSpecial: 0,
  });

  const [infoDialog, setInfoDialog] = useState({
    open: false,
    message: "",
    type: "information"
  });

  const { t } = useTranslation();
  const { postData } = servicecall();

  const showInfoDialog = useCallback((message, type = "information") => {
    setInfoDialog({
      open: true,
      message,
      type
    });
  }, []);

  const closeInfoDialog = useCallback(() => {
    setInfoDialog(prev => ({ ...prev, open: false }));
  }, []);

  // Get active user details for API calls
  const getActiveUserDetails = useCallback(() => {
    const getDecryptedValue = (key) => {
      try {
        const encryptedValue = sessionStorage.getItem(key);
        if (!encryptedValue || encryptedValue.trim() === "") {
          return "";
        }
        
        // Only decrypt if it looks like encrypted data
        if (encryptedValue.length > 50 && encryptedValue.includes('==')) {
          try {
            return CF_decrypt(encryptedValue);
          } catch (decryptError) {
            console.warn(`Decryption failed for ${key}, returning as-is`);
            return encryptedValue;
          }
        }
        return encryptedValue;
      } catch (error) {
        console.error(`Error processing ${key}:`, error);
        return "";
      }
    };

    const sUsername = getDecryptedValue("sUsername");
    const sSiteCode = getDecryptedValue("sSiteCode") || "CH-7310   ";
    const sUserGroupID = getDecryptedValue("sUserGroupID") || "G1        ";
    const sUserID = getDecryptedValue("sUserID") || "U1";
    const sSessionID = getDecryptedValue("sSessionID");
    const sDomainName = getDecryptedValue("sDomainName") || "SDMS";
    const sTimeZoneID = getDecryptedValue("sTimeZoneID") || "Asia/Kolkata<~>true";
    const sdbtype = getDecryptedValue("sdbtype") || "MSSQL";
    const sCategories = getDecryptedValue("sCategories") || "DB";
    const sUserStatus = getDecryptedValue("sUserStatus") || "";
    const sTenantID = getDecryptedValue("") ;

    return {
      sUserDomainName: sDomainName,
      sSessionID: sSessionID || "",
      sUserID: sUserID,
      sTimeZoneID: sTimeZoneID,
      sApplicationName: "SDMS",
      sdbtype: sdbtype,
      sUsername: sUsername || "Administrator",
      sSiteCode: sSiteCode.padEnd(10, ' ').substring(0, 10),
      sCategories: sCategories,
      sUserGroupID: sUserGroupID.padEnd(10, ' ').substring(0, 10),
      sUserStatus: sUserStatus,
      sTenantID: sTenantID
    };
  }, []);

  // Fetch password policy data from API
  const fetchPasswordPolicy = useCallback(async () => {
    try {
      const passObjDet = {
        ActiveUserDetails: getActiveUserDetails(),
        ApplicationCode: "SDMS"
      };
      
      // Call the API to get password policy
      console.log("Fetching password policy from API: User/GetPasswordPolicy");
      const response = await postData("User/GetPasswordPolicy", passObjDet);
      
      if (!response) {
        showInfoDialog(t('usermanagement.failedtofetchpolicy') || 'Failed to fetch password policy', "error");
        return;
      }
      
      let data = response;
      if (typeof response === 'string' && response.length > 50 && response.includes('==')) {
        try {
          const decrypted = CF_decrypt(response);
          data = JSON.parse(decrypted);
        } catch (decryptError) {
          console.error('Failed to decrypt response:', decryptError);
          showInfoDialog(t('label.failedtoparseresponse') || 'Failed to parse response', "error");
          return;
        }
      }
      
      console.log("Processed password policy data:", data);
      
      // Update state with API data - Direct from response as per jQuery
      if (data) {
        setDbLogin(data.DBBased === true || data.DBBased === 1);
        setComplexPolicy(data.nComplexPasswrd === true || data.nComplexPasswrd === 1);
        setValues({
          minPasswordLength: data.nMinPasswrdLength || 4,
          maxPasswordLength: data.nMaxPasswrdLength || 10,
          passwordHistory: data.nPasswordHistory || 5,
          passwordExpiry: data.nPasswordExpiry || 90,
          autolockPolicy: data.nLockPolicy || 3,
          minUppercase: data.nMinCapitalChar || 0,
          minLowercase: data.nMinSmallChar || 0,
          minNumeric: data.nMinNumericChar || 0,
          minSpecial: data.nMinSpecialChar || 0,
        });
      }
      
    } catch (error) {
      console.error('Error fetching password policy:', error);
      showInfoDialog(t('usermanagement.failedtofetchpolicy') || 'Failed to fetch password policy', "error");
    }
  }, [postData, showInfoDialog, t, getActiveUserDetails]);

  // Save password policy data to API
  const handleSaveWithAudit = useCallback(async (auditValues, submittedValues = null) => {
    console.log("Starting save with audit values:", auditValues);
    
    const valuesToSave = submittedValues || values;
    
    // FIRST: Run validation before saving
    const validationResult = validateData(valuesToSave);
    
    // Check for blocking errors
    if (validationResult.errors.length > 0) {
      console.log("Validation errors found after audit:", validationResult.errors);
      showInfoDialog(validationResult.errors.join('\n'), "error");
      return;
    }
    
    // Check for warnings
    if (validationResult.warnings.length > 0) {
      console.log("Validation warnings found after audit:", validationResult.warnings);
      // Show warnings in orange
      showInfoDialog(validationResult.warnings.join('\n'), "warning");
      
      // If there are warnings, we can still proceed after user sees them
      // The dialog will close automatically when user clicks OK
      // We'll continue with save after a short delay
      setTimeout(() => {
        proceedWithSave(auditValues, valuesToSave);
      }, 500);
      return;
    }
    
    // If no warnings or errors, proceed with save
    proceedWithSave(auditValues, valuesToSave);
    
  }, [dbLogin, complexPolicy, values, postData, showInfoDialog, t, getActiveUserDetails, fetchPasswordPolicy]);

  // Function to proceed with actual save after validation
  const proceedWithSave = useCallback(async (auditValues, valuesToSave) => {
    try {
      const activeUserDetails = getActiveUserDetails();
      
      // Prepare the request object as per API specification
      const passObjDet = {
        pswdObj: {
          nMinPasswrdLength: valuesToSave.minPasswordLength || 0,
          nMaxPasswrdLength: valuesToSave.maxPasswordLength || 0,
          nPasswordHistory: valuesToSave.passwordHistory || 0,
          nPasswordExpiry: valuesToSave.passwordExpiry || 0,
          nLockPolicy: valuesToSave.autolockPolicy || 0,
          nMinCapitalChar: valuesToSave.minUppercase || 0,
          nMinSmallChar: valuesToSave.minLowercase || 0,
          nMinNumericChar: valuesToSave.minNumeric || 0,
          nMinSpecialChar: valuesToSave.minSpecial || 0,
          nComplexPasswrd: complexPolicy ? 1 : 0,
          nDBBased: dbLogin ? 1 : 0
        },
        AuditTrailValues: auditValues,
        ApplicationCode: "SDMS",
        ActiveUserDetails: activeUserDetails
      };
      
      console.log("Saving password policy with data:", passObjDet);
      
      // Call the API to save password policy
      const response = await postData("User/PasswordpolicySave", passObjDet);
      
      if (!response) {
        showInfoDialog(t('usermanagement.failedtosavepolicy') || 'Failed to save password policy', "error");
        return;
      }
      
      let data = response;
      if (typeof response === 'string' && response.length > 50 && response.includes('==')) {
        try {
          const decrypted = CF_decrypt(response);
          data = JSON.parse(decrypted);
        } catch (decryptError) {
          console.error('Failed to decrypt response:', decryptError);
        }
      }
      
      console.log("Processed save response:", data);
      
      // Check if save was successful
      if (data && data.oResObj && data.oResObj.bStatus === true) {
        showInfoDialog(
          data.oResObj.sInformation || t('usermanagement.policysavedsuccess') || 'Password policy saved successfully', 
          "success"
        );
        // Refresh data after successful save
        fetchPasswordPolicy();
      } else if (data && data.Message) {
        showInfoDialog(
          data.Message || t('usermanagement.failedtosavepolicy') || 'Failed to save password policy', 
          "error"
        );
      } else {
        showInfoDialog(t('usermanagement.failedtosavepolicy') || 'Failed to save password policy', "error");
      }
      
    } catch (error) {
      console.error('Error saving password policy:', error);
      showInfoDialog(t('usermanagement.failedtosavepolicy') || 'Failed to save password policy', "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [dbLogin, complexPolicy, postData, showInfoDialog, t, getActiveUserDetails, fetchPasswordPolicy]);

  // Validation function
  const validateData = useCallback((dataToValidate) => {
    console.log("Validating data:", dataToValidate);
    
    // Parse all values as integers for proper comparison
    const minLength = parseInt(dataToValidate.minPasswordLength) || 0;
    const maxLength = parseInt(dataToValidate.maxPasswordLength) || 0;
    
    console.log("Parsed values - minLength:", minLength, "maxLength:", maxLength);
    
    // Separate arrays for errors (blocking) and warnings (non-blocking)
    const validationErrors = [];
    const validationWarnings = [];
    
    // Validate min and max password length (ERRORS - blocking)
    if (minLength < 4 || minLength > 20) {
      validationErrors.push(t('usermanagement.minPasswordLengthRange') || 'Minimum password length must be between 4 and 20');
    }
    
    if (maxLength < 4 || maxLength > 20) {
      validationErrors.push(t('usermanagement.maxPasswordLengthRange') || 'Maximum password length must be between 4 and 20');
    }
    
    if (minLength > maxLength) {
      validationErrors.push(t('usermanagement.minGreaterThanMax') || 'Minimum password length cannot be greater than maximum password length');
    }
    
    // Parse other values too
    const passwordHistory = parseInt(dataToValidate.passwordHistory) || 0;
    const passwordExpiry = parseInt(dataToValidate.passwordExpiry) || 0;
    const autolockPolicy = parseInt(dataToValidate.autolockPolicy) || 0;
    
    // Validate password history (ERRORS - blocking)
    if (passwordHistory < 1 || passwordHistory > 5) {
      validationErrors.push(t('usermanagement.passwordHistoryRange') || 'Password history must be between 1 and 5');
    }
    
    // Validate password expiry (ERRORS - blocking)
    if (passwordExpiry < 1 || passwordExpiry > 180) {
      validationErrors.push(t('usermanagement.passwordExpiryRange') || 'Password expiry must be between 1 and 180 days');
    }
    
    // Validate autolock policy (ERRORS - blocking)
    if (autolockPolicy < 1 || autolockPolicy > 5) {
      validationErrors.push(t('usermanagement.autolockPolicyRange') || 'Autolock policy must be between 1 and 5');
    }
    
    // Validate complex password requirements if enabled
    if (complexPolicy) {
      const minUppercase = parseInt(dataToValidate.minUppercase) || 0;
      const minLowercase = parseInt(dataToValidate.minLowercase) || 0;
      const minNumeric = parseInt(dataToValidate.minNumeric) || 0;
      const minSpecial = parseInt(dataToValidate.minSpecial) || 0;
      
      const totalComplexRequirements = minUppercase + minLowercase + minNumeric + minSpecial;
      
      console.log("Complex requirements total:", totalComplexRequirements);
      console.log("minLength:", minLength, "maxLength:", maxLength);
      
      // WARNING: Total complex requirements less than minimum length (SHOW IN ORANGE)
      if (totalComplexRequirements < minLength) {
        validationWarnings.push(t('usermanagement.totalComplexLessThanMin') || 'Complex password policy should not be less than Minimum password length');
      }
      
      // ERROR: Total complex requirements exceed maximum length (blocking)
      if (totalComplexRequirements > maxLength) {
        validationWarnings.push(t('usermanagement.totalComplexExceedsMax') || 'Total complex requirements exceed maximum password length');
      }
      
      // ERROR: Negative values (blocking)
      if (minUppercase < 0 || minLowercase < 0 || minNumeric < 0 || minSpecial < 0) {
        validationWarnings.push(t('usermanagement.complexRequirementsNegative') || 'Complex requirements cannot be negative');
      }
    }
    
    return {
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [complexPolicy, t]);

  // Handle audit authorization
  const handleAuditAuthorized = useCallback((auditData) => {
    console.log("Audit authorized with data:", auditData);
    
    // Extract data from AuditTrailValues
    const auditValues = auditData.AuditTrailValues;
    
    if (auditValues) {
      console.log("Proceeding with save...");
      
      // Save current values BEFORE closing audit
      const currentValues = { ...values };
      
      // Close audit dialog
      setShowAudit(false);
      
      // Proceed with save (which will run validation and show warnings/errors)
      handleSaveWithAudit(auditValues, currentValues);
    } else {
      console.error("Audit data missing in AuditTrailValues");
      showInfoDialog(t('usermanagement.auditDataMissing') || 'Audit data missing', "error");
      setShowAudit(false);
    }
  }, [values, t, showInfoDialog, handleSaveWithAudit]);

  // Handle save button click (opens audit trail FIRST)
  const handleSaveClick = useCallback(() => {
    console.log("Save button clicked, current values:", values);
    
    // FIRST: Open audit trail dialog
    console.log("Opening audit trail...");
    setShowAudit(true);
  }, [values]);

  const handleValueChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    
    // Apply validation constraints
    if (field === 'minPasswordLength' && (numValue < 4 || numValue > 20)) return;
    if (field === 'maxPasswordLength' && (numValue < 4 || numValue > 20)) return;
    if (field === 'passwordHistory' && (numValue < 1 || numValue > 5)) return;
    if (field === 'passwordExpiry' && (numValue < 1 || numValue > 180)) return;
    if (field === 'autolockPolicy' && (numValue < 1 || numValue > 5)) return;
    if (['minUppercase', 'minLowercase', 'minNumeric', 'minSpecial'].includes(field) && numValue < 0) return;
    
    setValues(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Fetch data on component mount
  useEffect(() => {
    const sessionID = sessionStorage.getItem('sSessionID');
    const userID = sessionStorage.getItem('sUserID');
    
    if (!sessionID || !userID) {
      showInfoDialog(t('label.sessionexpired') || 'Session expired. Please login again.', "error");
      return;
    }
    
    fetchPasswordPolicy();
  }, [fetchPasswordPolicy, showInfoDialog, t]);

  return (
    <>
      <div className="fixed w-[1290px]">
        
        {infoDialog.open && (
          <Errordialog
            message={infoDialog.message}
            type={infoDialog.type}
            onClose={closeInfoDialog}
          />
        )}
        <div className="h-full bg-[#ffffff] flex flex-col ">
          <div className=" mb-0" />
          
          {/* Main white background content */}
          <div className="flex-1 px-4 py-4 bg-white rounded overflow-auto">
            {/* Top row: Database login (left), Save button (right) */}
            <div className="flex items-center justify-between mb-2">
              {/* Left: Database Login */}
              <div className="flex items-center">
                <span className="mr-3 text-[#405f7d] text-[12px] mb-1 font-semibold font-roboto">
                  {t('label.databaselogin') || 'Database Based Login'}
                </span>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={dbLogin}
                    onChange={() => setDbLogin(!dbLogin)}
                    className="sr-only"
                    id="db-login-toggle"
                  />
                  <label
                    htmlFor="db-login-toggle"
                    className={`block h-5 w-10 rounded-full cursor-pointer transition-colors ${
                      dbLogin ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                        dbLogin ? 'transform translate-x-5' : ''
                      }`}
                    />
                  </label>
                </div>
              </div>
              {/* Right: Save button */}
              <button 
                onClick={handleSaveClick}
                disabled={isSubmitting}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#f0f2f5] text-[#2883fe] font-roboto font-bold text-[11px] rounded transition-colors hover:opacity-90 hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckSquare className="w-4 h-4" />
                {isSubmitting ? t('button.saving') || 'Saving...' : t('button.save') || 'Save'}
              </button>
            </div>

            {/* Main content area with two columns */}
            <div className="flex gap-8">
              {/* Left column - Password Policy */}
              <div className="w-auto">
                <div className="space-y-0">
                  {[
                    { 
                      labelKey: "label.minlength",
                      labelDefault: "Minimum Password Length(Between 4 and 20 Characters)", 
                      field: "minPasswordLength", 
                      min: 4,
                      max: 20
                    },
                    { 
                      labelKey: "label.maxlength",
                      labelDefault: "Maximum Password Length(Between 4 and 20 Characters)", 
                      field: "maxPasswordLength", 
                      min: 4,
                      max: 20
                    },
                    { 
                      labelKey: "label.history",
                      labelDefault: "Password History(Between 1 and 5 Times)", 
                      field: "passwordHistory", 
                      min: 1,
                      max: 5
                    },
                    { 
                      labelKey: "label.expiry",
                      labelDefault: "Password Expiry(Between 1 and 180 Days)", 
                      field: "passwordExpiry", 
                      min: 1,
                      max: 180
                    },
                    { 
                      labelKey: "label.autolock",
                      labelDefault: "Autolock Policy(Between 1 and 5 Times)", 
                      field: "autolockPolicy", 
                      min: 1,
                      max: 5
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col mb-4">
                      <label className="text-[#405f7d] text-[12px] mb-1 font-semibold font-roboto">
                        {t(item.labelKey) || item.labelDefault}
                      </label>
                      <div className="w-65">
                        <AnimatedInput
                          type="number"
                          value={values[item.field]}
                          onChange={(e) => handleValueChange(item.field, e.target.value)}
                          min={item.min}
                          max={item.max}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column - Complex Password Policy */}
              <div className="w-1/2 ml-14">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-[#0049b0] font-roboto font-bold text-[14px] mb-5">
                      {t('label.complexpasswordpolicy') || 'Complex Password Policy'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[#405f7d] font-semibold font-roboto text-[12px] mb-0">
                        {t('label.complexpasswordpolicy') || 'Complex Password Policy'}
                      </h2>
                      <input
                        type="checkbox"
                        checked={complexPolicy}
                        onChange={() => setComplexPolicy(!complexPolicy)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-5"
                      />
                    </div>
                  </div>
                </div>

                {complexPolicy && (
                  <>
                    {/* NOTE - yellow highlight */}
                    <div className="px-0 py-0 bg-[#ff0] mb-3 max-w-[615px]">
                      <p className="font-semibold font-roboto text-[#405f7d] text-[12px]">
                        {t('usermanagement.notetext') || 'NOTE: The total length of complex password must be greater than or equal to minimum password length and less than or equal to maximum password length.'}
                      </p>
                    </div>

                    {/* Inputs for complex password */}
                    <div className="space-y-0">
                      {[
                        { 
                          labelKey: "label.minuppercase",
                          labelDefault: "Minimum number of Uppercase characters", 
                          field: "minUppercase", 
                          min: 0,
                          max: 20
                        },
                        { 
                          labelKey: "label.minlowercase",
                          labelDefault: "Minimum number of Lowercase characters", 
                          field: "minLowercase", 
                          min: 0,
                          max: 20
                        },
                        { 
                          labelKey: "label.minnumeric",
                          labelDefault: "Minimum number of Numeric characters", 
                          field: "minNumeric", 
                          min: 0,
                          max: 20
                        },
                        { 
                          labelKey: "label.minspecial",
                          labelDefault: "Minimum number of Special characters", 
                          field: "minSpecial", 
                          min: 0,
                          max: 20
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col mb-4">
                          <label className="text-[#405f7d] text-[12px] mb-1 font-semibold font-roboto">
                            {t(item.labelKey) || item.labelDefault}
                          </label>
                          <div className="w-60">
                            <AnimatedInput
                              type="number"
                              value={values[item.field]}
                              onChange={(e) => handleValueChange(item.field, e.target.value)}
                              min={item.min}
                              max={item.max}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Trail Dialog - RENDERED OUTSIDE THE FIXED CONTAINER */}
      {showAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <AuditTrail
            isOpen={showAudit}
            onClose={() => setShowAudit(false)}
            onAuthorized={handleAuditAuthorized}
            actionLabel={t('button.save') || 'Save'}
            disableReason={false}
          />
        </div>
      )}
    </>
  );
}