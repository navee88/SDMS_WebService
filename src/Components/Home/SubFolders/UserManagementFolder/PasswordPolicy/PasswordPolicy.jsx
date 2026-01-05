import React, { useState, useEffect, useCallback } from 'react';
import { CheckSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import Errordialog from '../../../../Layout/Common/Errordialog';
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';

const drawerWidthCollapsed = 60;
const topBarHeight = 60;

export default function PasswordPolicy() {
  const [dbLogin, setDbLogin] = useState(true);
  const [complexPolicy, setComplexPolicy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [infoDialog, setInfoDialog] = useState({
    open: false,
    message: "",
    type: "information"
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

  const tabLabels = ["Password Policy"];
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
        if (!encryptedValue) return "";
        
        if (encryptedValue.length > 50 && encryptedValue.includes('==')) {
          return CF_decrypt(encryptedValue);
        }
        return encryptedValue;
      } catch (error) {
        console.error(`Error decrypting ${key}:`, error);
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
    const sTenantID = getDecryptedValue("sTenantID") || "";

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
    setLoading(true);
    try {
      // Mock API call - replace with actual API endpoint
      const passObjDet = {
        ActiveUserDetails: getActiveUserDetails(),
        ApplicationCode: "SDMS"
      };
      
      // For now, using mock data - replace with actual API call
      // const response = await postData("PasswordPolicy/GetPasswordPolicy", passObjDet);
      
      // Mock response data (replace with actual API response)
      const mockResponse = {
        oResObj: {
          dbLogin: true,
          complexPolicy: false,
          minPasswordLength: 4,
          maxPasswordLength: 10,
          passwordHistory: 5,
          passwordExpiry: 90,
          autolockPolicy: 3,
          minUppercase: 0,
          minLowercase: 0,
          minNumeric: 0,
          minSpecial: 0,
        }
      };
      
      let data = mockResponse.oResObj; // Change to actual API response parsing
      
      // Uncomment this when API is ready
      /*
      const response = await postData("PasswordPolicy/GetPasswordPolicy", passObjDet);
      
      if (!response) {
        showInfoDialog(t('masters.failedtofetchpolicy') || 'Failed to fetch password policy', "error");
        return;
      }
      
      let data = response;
      if (typeof response === 'string' && response.length > 50) {
        try {
          const decrypted = CF_decrypt(response);
          data = JSON.parse(decrypted);
        } catch (decryptError) {
          console.error('Failed to decrypt response:', decryptError);
        }
      }
      
      if (data && data.oResObj) {
        data = data.oResObj;
      }
      */
      
      // Update state with API data
      setDbLogin(data.dbLogin || true);
      setComplexPolicy(data.complexPolicy || false);
      setValues({
        minPasswordLength: data.minPasswordLength || 4,
        maxPasswordLength: data.maxPasswordLength || 10,
        passwordHistory: data.passwordHistory || 5,
        passwordExpiry: data.passwordExpiry || 90,
        autolockPolicy: data.autolockPolicy || 3,
        minUppercase: data.minUppercase || 0,
        minLowercase: data.minLowercase || 0,
        minNumeric: data.minNumeric || 0,
        minSpecial: data.minSpecial || 0,
      });
      
    } catch (error) {
      console.error('Error fetching password policy:', error);
      showInfoDialog(t('masters.failedtofetchpolicy') || 'Failed to fetch password policy', "error");
    } finally {
      setLoading(false);
    }
  }, [postData, showInfoDialog, t, getActiveUserDetails]);

  // Save password policy data to API
  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      
      const passObjDet = {
        dbLogin: dbLogin,
        complexPolicy: complexPolicy,
        ...values,
        ActiveUserDetails: getActiveUserDetails(),
        ApplicationCode: "SDMS"
      };
      
      // Mock API call - replace with actual API endpoint
      // const response = await postData("PasswordPolicy/SavePasswordPolicy", passObjDet);
      
      // Mock success response
      const mockResponse = {
        success: true,
        message: "Password policy saved successfully"
      };
      
      // Uncomment this when API is ready
      /*
      const response = await postData("PasswordPolicy/SavePasswordPolicy", passObjDet);
      
      if (!response) {
        showInfoDialog(t('masters.failedtosavepolicy') || 'Failed to save password policy', "error");
        return;
      }
      
      let data = response;
      if (typeof response === 'string' && response.length > 50) {
        try {
          const decrypted = CF_decrypt(response);
          data = JSON.parse(decrypted);
        } catch (decryptError) {
          console.error('Failed to decrypt response:', decryptError);
        }
      }
      
      if (data.success) {
        showInfoDialog(data.message || t('masters.policysavedsuccess') || 'Password policy saved successfully', "success");
      } else {
        showInfoDialog(data.message || t('masters.failedtosavepolicy') || 'Failed to save password policy', "error");
      }
      */
      
      // Mock success
      showInfoDialog(mockResponse.message || t('masters.policysavedsuccess') || 'Password policy saved successfully', "success");
      
    } catch (error) {
      console.error('Error saving password policy:', error);
      showInfoDialog(t('masters.failedtosavepolicy') || 'Failed to save password policy', "error");
    } finally {
      setLoading(false);
    }
  }, [dbLogin, complexPolicy, values, postData, showInfoDialog, t, getActiveUserDetails]);

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

  if (loading) {
    return (
      <div
        className="fixed"
        style={{
          top: `${topBarHeight}px`,
          left: `${drawerWidthCollapsed}px`,
          width: `calc(100% - ${drawerWidthCollapsed}px)`,
          height: `calc(100vh - ${topBarHeight}px)`,
        }}
      >
        <div className="h-full bg-[#f1f3f5] flex flex-col items-center justify-center">
          <div className="text-gray-500 text-base mb-2.5">
            {t('label.loading') || 'Loading...'}
          </div>
          <div className="text-gray-400 text-xs">
            Fetching password policy data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed"
      style={{
        top: `${topBarHeight}px`,
        left: `${drawerWidthCollapsed}px`,
        width: `calc(100% - ${drawerWidthCollapsed}px)`,
        height: `calc(100vh - ${topBarHeight}px)`,
      }}
    >
      {infoDialog.open && (
        <Errordialog
          message={infoDialog.message}
          type={infoDialog.type}
          onClose={closeInfoDialog}
        />
      )}
      
      <div className="h-full bg-[#f1f3f5] flex flex-col">
        <div className="border-b border-[#ccc]" />
        
        <div className="flex gap-8 border-b">
          {tabLabels.map((label, idx) => (
            <button
              key={idx}
              className={`pb-2 px-1 text-[1.4rem] font-semibold capitalize transition-colors ${
                idx === 0
                  ? 'text-[#034896] border-b-2 border-[#1565c0]'
                  : 'text-[#666] hover:text-[#034896]'
              }`}
            >
              {t('label.tabtitle') || label}
            </button>
          ))}
        </div>
        
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
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#f3f3f3] text-[#3992f8] font-roboto font-bold text-[11px] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckSquare className="w-4 h-4" />
              {t('button.save') || 'Save'}
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
                      {t('masters.notetext') || 'NOTE: The total length of complex password must be greater than or equal to minimum password length and less than or equal to maximum password length.'}
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
  );
}