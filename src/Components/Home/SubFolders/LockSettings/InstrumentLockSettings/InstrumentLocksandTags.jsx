import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Lock, Unlock, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import Errordialog from '../../../../Layout/Common/Errordialog';
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption';

const MergeFileCountRow = ({ mergeCount, currentCount, onMergeChange, disabled, showMergeFields, t }) => {
  if (!showMergeFields) return null;
  
  const handleChange = (e) => {
    const value = e.target.value;
    
    // Allow empty string or valid positive integers
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value) || 0;
      
      // Enforce max limit
      if (numValue > 10000) {
        onMergeChange("10000");
      } else {
        onMergeChange(value);
      }
    }
  };
  
  return (
    <div className="mb-6 mt-7">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
            {t('instrumentlocktag.mergefilecount')}
          </label>
          <input
            type="text"  // Changed from "number" to "text" for better control
            value={mergeCount}
            onChange={handleChange}
            onBlur={(e) => {
              // Ensure it's at least 1 on blur if empty
              if (e.target.value === '' || parseInt(e.target.value) < 1) {
                onMergeChange("1");
              }
            }}
            disabled={disabled}
            className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-white hover:border-gray-400 text-[#405F7D]"
            style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#405F7D] min-w-[150px] font-semibold font-roboto">
            {t('instrumentlocktag.currentuploadfilecount')}
          </label>
          <input
            type="text"
            value={currentCount}
            disabled={true}
            className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-[#405F7D]"
            style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
          />
        </div>
      </div>
    </div>
  );
};

const InlineCheckbox = ({ label, checked, onChange, disabled }) => (
  <div className="flex items-center mb-3 gap-4">
    <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
      {label}
    </label>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
    />
  </div>
);

const TagGrid = ({ tags, onTagValueClick, t, showValidationError, onTagEditRequest }) => {
  const [tooltipState, setTooltipState] = useState({
    isOpen: false,
    tagIndex: null,
    position: { top: 0, left: 0 },
    searchTerm: '',
    selectedValue: '',
    selectedValueID: '',
    options: []
  });

  const [selectedTagIndex, setSelectedTagIndex] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [localTags, setLocalTags] = useState(tags);

  // Sync localTags with props when tags change
  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  const calculateTooltipPosition = (event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const tooltipWidth = 250;
    const tooltipHeight = 220;
    
    let left = buttonRect.left - tooltipWidth + 0;
    let top = buttonRect.top - (tooltipHeight) + 10;
    
    if (top < 10) {
      top = 10;
    }
    
    if (top + tooltipHeight > viewportHeight - 10) { 
      top = viewportHeight - tooltipHeight - 10;
    }
    
    if (left < 10) {
      left = buttonRect.right + 10;
    }
    
    if (left + tooltipWidth > viewportWidth - 10) {
      left = viewportWidth - tooltipWidth - 10;
    }
    
    return { top, left };
  };

  const showInformationMessage = (message) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  // Helper function to check if a tag can be edited based on order
  const canEditTag = (tagIndex) => {
    // First tag is always editable
    if (tagIndex === 0) return true;
    
    // Check if all previous tags have values
    for (let i = 0; i < tagIndex; i++) {
      if (!localTags[i].value) {
        return false;
      }
    }
    
    return true;
  };

  // Helper function to get appropriate error message
  const getErrorMessage = (tagIndex) => {
    // Find the first previous tag that doesn't have a value
    for (let i = tagIndex - 1; i >= 0; i--) {
      if (!localTags[i].value) {
        return `Please select the ${localTags[i].tagName} value first`;
      }
    }
    
    return `Please select the required value first`;
  };

const handleRowClick = (tag, index) => {
  if (tag.editable) {
    if (!canEditTag(index)) {
      showInformationMessage(getErrorMessage(index));
      return;
    }
    
    setSelectedTagIndex(index);
  }
};

  const handleEditClick = async (tag, index, event) => {
  event.stopPropagation();
  
  if (tag.editable) {
    if (!canEditTag(index)) {
      showInformationMessage(getErrorMessage(index));
      return;
    }
    const calculateTooltipPositionFromRect = (buttonRect) => {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  const tooltipWidth = 250;
  const tooltipHeight = 220;
  
  let left = buttonRect.left - tooltipWidth + 0;
  let top = buttonRect.top - (tooltipHeight) + 10;
  
  if (top < 10) {
    top = 10;
  }
  
  if (top + tooltipHeight > viewportHeight - 10) { 
    top = viewportHeight - tooltipHeight - 10;
  }
  
  if (left < 10) {
    left = buttonRect.right + 10;
  }
  
  if (left + tooltipWidth > viewportWidth - 10) {
    left = viewportWidth - tooltipWidth - 10;
  }
  
  return { top, left };
};

const calculateTooltipPosition = (event) => {
  const buttonRect = event.currentTarget.getBoundingClientRect();
  return calculateTooltipPositionFromRect(buttonRect);
};
    
    // Save the button position BEFORE any async operations
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const position = calculateTooltipPositionFromRect(buttonRect);
    
    // If tag already has options, just open the tooltip
    if (tag.options && tag.options.length > 0) {
      setSelectedTagIndex(index);
      setTooltipState({
        isOpen: true,
        tagIndex: index,
        position,
        searchTerm: '',
        selectedValue: tag.value || '',
        selectedValueID: tag.valueID || '',
        options: tag.options
      });
      return;
    }
    
    // If tag doesn't have options loaded yet
    setIsLoadingOptions(true);
    
    try {
      // Request parent to load options for this tag
      const options = await onTagEditRequest(index);
      
      if (options && options.length > 0) {
        // Update local tags state with the loaded options
        const updatedLocalTags = [...localTags];
        updatedLocalTags[index] = { ...updatedLocalTags[index], options };
        setLocalTags(updatedLocalTags);
        
        // Now open the tooltip with the loaded options using saved position
        setSelectedTagIndex(index);
        setTooltipState({
          isOpen: true,
          tagIndex: index,
          position,
          searchTerm: '',
          selectedValue: updatedLocalTags[index].value || '',
          selectedValueID: updatedLocalTags[index].valueID || '',
          options
        });
      } else {
        showInformationMessage("No options available for this tag based on previous selection");
      }
    } catch (error) {
      console.error("Error loading tag options:", error);
      showInformationMessage("Failed to load options. Please try again.");
    } finally {
      setIsLoadingOptions(false);
    }
  }
};

  const openTooltip = (tag, index, event) => {
    const options = tag.options && tag.options.length > 0 ? tag.options : [];
    const position = calculateTooltipPosition(event);
    
    setSelectedTagIndex(index);
    
    setTooltipState({
      isOpen: true,
      tagIndex: index,
      position,
      searchTerm: '',
      selectedValue: tag.value || '',
      selectedValueID: tag.valueID || '',
      options: options
    });
  };

  const handleTooltipSubmit = () => {
    if (tooltipState.tagIndex !== null) {
      onTagValueClick(
        tooltipState.tagIndex, 
        tooltipState.selectedValue || '',
        tooltipState.selectedValueID || ''
      );
     
    }
    setTooltipState({
      isOpen: false,
      tagIndex: null,
      position: { top: 0, left: 0 },
      searchTerm: '',
      selectedValue: '',
      selectedValueID: '',
      options: []
    });
  };

  const handleTooltipClose = () => {
    
    setTooltipState({
      isOpen: false,
      tagIndex: null,
      position: { top: 0, left: 0 },
      searchTerm: '',
      selectedValue: '',
      selectedValueID: '',
      options: []
    });
  };

  const handleOptionClick = (optionValue, optionValueID) => {
    setTooltipState(prev => ({
      ...prev,
      selectedValue: optionValue,
      selectedValueID: optionValueID
    }));
  };

  const handleSearchChange = (value) => {
    setTooltipState(prev => ({
      ...prev,
      searchTerm: value
    }));
  };

  const filteredOptions = tooltipState.options.filter(opt => 
    opt.label.toLowerCase().includes(tooltipState.searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="border border-[#f3f3f3] rounded relative">
        <div className="grid grid-cols-2 bg-[#fbfbfb] border-b border-[#f3f3f3] ">
          <div className="px-4 py-2.5 text-[12px] text-[#4b4b4b] font-bold font-roboto">
            {t('instrumentlocktag.tagName')}
          </div>
          <div className="px-1 py-2.5 text-[12px] text-[#4b4b4b] font-bold font-roboto">
            {t('instrumentlocktag.tagValue')}
          </div>
        </div>
        
        <div className="bg-white min-h-[250px]">
          {localTags.length === 0 ? (
            <div className="px-4 py-12 text-center text-[12px] text-[#4b4b4b] font-roboto">            
              {t('instrumentlocktag.noTagValue')}
            </div>
          ) : (
            localTags.map((tag, idx) => {
              const isSelected = selectedTagIndex === idx;
              const hasValue = !!tag.value;
              const isThisTagLoading = isLoadingOptions && isSelected;
              
              return (
                <div 
                  key={`tag-${idx}-${tag.tagID}`}
                  onClick={() => handleRowClick(tag, idx)}
                  className={`grid grid-cols-2 border-b border-gray-100 last:border-b-0 group min-h-[5px]
                    ${isSelected ? 'bg-[#eef2f9]' : 'bg-white'}
                    ${tag.editable ? 'cursor-pointer hover:bg-[#eef2f9]' : 'cursor-default'}
                  `}
                >
                  <div className={`px-4 py-1 text-[12px] flex items-center transition-all
                    ${isSelected ? 'border-l-4 border-l-[#378cfc]' : 'border-l-4 border-l-transparent'}
                    ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
                  `} style={{ fontFamily: 'Verdana, Arial, sans-serif' }}>
                    {tag.tagName}
                    {tag.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  
                  <div className={`px-1 py-3 text-[12px] flex items-center justify-between gap-2`}>
                    <span className={`flex-1 transition-all ${
                      isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'
                    }`} style={{ fontFamily: 'Verdana, Arial, sans-serif' }}>
                      {tag.value || ''}
                      {isThisTagLoading && (
                        <span className="ml-2 text-xs text-gray-500">Loading options...</span>
                      )}
                    </span>
                    
                    {tag.editable && (
                      <button
                        onClick={(e) => handleEditClick(tag, idx, e)}
                        className="ml-1 opacity-100 hover:opacity-80 transition-opacity"
                        title="Edit tag value"
                        disabled={isThisTagLoading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" 
                          fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z">
                          </path>
                          <path d="m15 5 4 4"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Information Dialog */}
      {showErrorDialog && (
        <Errordialog
          message={errorMessage}
          type="information"
          onClose={() => setShowErrorDialog(false)}
        />
      )}

      {showValidationError && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 0 11-16 0 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-700 text-xs font-semibold">
              Select values in order from top to bottom
            </span>
          </div>
        </div>
      )}

      {tooltipState.isOpen && (
        <div 
          className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col"
          style={{
            top: `${tooltipState.position.top}px`,
            left: `${tooltipState.position.left}px`,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="p-0.5 border-gray-200">
            <div className="mb-0">
              <input
                type="text"
                value={tooltipState.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-6 px-3 text-[12px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#000000] font-roboto"
                autoFocus
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                placeholder="Looking for..."
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 font-roboto">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = tooltipState.selectedValue === option.label && 
                                   tooltipState.selectedValueID === option.value;
                
                return (
                  <div
                    key={`option-${idx}-${option.value}`}
                    onClick={() => handleOptionClick(option.label, option.value)}
                    onDoubleClick={handleTooltipSubmit}
                    className={`px-1 py-1.5 text-[12px] cursor-pointer hover:bg-gray-50 relative
                      ${isSelected ? 'bg-[#f2f2f2]' : ''}
                      ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
                    `}
                    style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                  >
                    
                    
                    <div className="flex items-center ml-1">
                      <span className={`${isSelected ? 'font-bold text-[#000000]' : 'text-[#0e0e0e]'}`}>
                        {option.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
            <button
              onClick={handleTooltipSubmit}
              className="px-3 py-1.5 text-[12px] font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" 
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                <path d="m15 5 4 4"></path>
              </svg>
              Submit
            </button>
            <button
              onClick={handleTooltipClose}
              className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-[12px] font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" 
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};


// Memoized TemplateDropdown component
const TemplateDropdown = React.memo(({ value, onChange, disabled, options, error }) => {
  const handleChange = (event) => {
    onChange(event);
  };

  return (
    <div className="relative">
      <div className="mb-1">
        <div className="relative">
          <AnimatedDropdown 
            value={value}
            onChange={handleChange}
            disabled={disabled}
            options={options}
            displayKey="label"
            valueKey="value"
            isSearchable={true}
            showError={error}
            
          />
        </div>
      </div>
    </div>
  );
});

TemplateDropdown.displayName = 'TemplateDropdown';

const InstrumentLockTag = ({ scheduleData, onNavigateToMyInstruments }) => {
  const { t } = useTranslation();
  
  // Add loading ref to prevent duplicate API calls in Strict Mode
  const isLoadingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  // Create a ref to hold the loadInstruments function
  const loadInstrumentsRef = useRef(null);

  const [formData, setFormData] = useState({
    client: '',
    instrument: '',
    path: '',
    limsOrder: '',
    fileName: '',
    template: '',
    mergeFileCount: '1',
    currentFileCount: '0',
    unlockAfterCapture: false,
    user: '' // Added user field
  });

  const [errors, setErrors] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [showMergeFields, setShowMergeFields] = useState(false); // Default to false, will be set by API
  const [showUnlockOption, setShowUnlockOption] = useState(false); // Default to false, will be set by API
  const [showValidationError, setShowValidationError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [lockStatus, setLockStatus] = useState(null);
  const [isInstrumentInterface, setIsInstrumentInterface] = useState(false);
  
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditAction, setAuditAction] = useState(null);
  const [auditCallback, setAuditCallback] = useState(null);

  const [templateOptions, setTemplateOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [instrumentOptions, setInstrumentOptions] = useState([]);
  const [pathOptions, setPathOptions] = useState([]);
  const [limsOrderOptions, setLimsOrderOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]); // Added user options
  const [tags, setTags] = useState([]);

  const { postData } = servicecall();

  const endpoints = {
    lockTemplateCombo: "InstrumentLock/LockTemplateCombo",
    loadTagCategory: "InstrumentLock/LoadTagCategory",
    clientLockCombo: "InstrumentLock/clientlockcombo",
    lockInstrumentCombo: "InstrumentLock/LockInstrumentCombo",
    lockPathCombo: "InstrumentLock/LockPathCombo",
    loadCategoryTagValueAndID: "InstrumentLock/LoadCategoryTagValueAndID",
    lockUserCombo: "InstrumentLock/LockUserCombo", 
    mergeFileAndAutoUnlock: "InstrumentLock/MergeFileAndAutounlock", 
    // Schedule-specific endpoints
    lockActiveParsingInstrumentCombo: "InstrumentLock/LockActiveParsingInstrumentCombo",
    lockDeactiveParsingInstrumentCombo: "InstrumentLock/LockDeactiveParsingInstrumentCombo",
    lockActiveInstrumentPathCombo: "InstrumentLock/LockActiveInstrumentPathCombo",
    lockDeactiveInstrumentPathCombo: "InstrumentLock/LockDeactiveInstrumentPathCombo"
  };

  // Tag ID to Name mapping based on your table
  const tagIdToNameMap = {
    1: "Sample",
    2: "Test", 
    3: "Project"
  };

  // Helper function to check if a string is encrypted
  const isEncrypted = (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.includes('==') && str.length > 20;
  };

  // Fixed getActiveUserDetails with proper decryption
  const getActiveUserDetails = useCallback(() => {
    const getDecryptedValue = (key) => {
      try {
        const encryptedValue = sessionStorage.getItem(key);
        if (!encryptedValue) {
          console.warn(`No value found for key: ${key}`);
          return "";
        }
        
        // Check if it's actually encrypted or just plain text
        if (isEncrypted(encryptedValue)) {
          try {
            const decryptedValue = CF_decrypt(encryptedValue);
            console.log(`Successfully decrypted ${key}: ${decryptedValue}`);
            return decryptedValue;
          } catch (decryptError) {
            console.warn(`Failed to decrypt ${key}, using as plain text:`, decryptError.message);
            return encryptedValue;
          }
        } else {
          console.log(`${key} is not encrypted, using as is: ${encryptedValue}`);
          return encryptedValue;
        }
      } catch (error) {
        console.error(`Error getting/decrypting ${key}:`, error);
        return "";
      }
    };

    const sUsername = getDecryptedValue("sUsername");
    const sSiteCode = getDecryptedValue("sSiteCode");
    const sUserGroupID = getDecryptedValue("sUserGroupID");
    const sUserID = getDecryptedValue("sUserID");
    const sSessionID = getDecryptedValue("sSessionID");
    const sDomainName = getDecryptedValue("sDomainName");
    const sTimeZoneID = getDecryptedValue("sTimeZoneID");
    const sdbtype = getDecryptedValue("sdbtype");
    const sCategories = getDecryptedValue("sCategories");
    const sUserStatus = getDecryptedValue("sUserStatus");
    const sTenantID = getDecryptedValue("sTenantID");

    console.log("Active user details loaded:", {
      sUsername,
      sSiteCode,
      sUserID,
      sSessionID: sSessionID ? `${sSessionID.substring(0, 20)}...` : 'empty'
    });

    return {
      sUserDomainName: sDomainName || "SDMS",
      sSessionID: sSessionID || "",
      sUserID: sUserID || "U1",
      sTimeZoneID: sTimeZoneID || "Asia/Kolkata<~>true",
      sApplicationName: "SDMS",
      sdbtype: sdbtype || "POSTGRESQL",
      sUsername: sUsername || "Administrator",
      sSiteCode: (sSiteCode || "CH").padEnd(10, ' ').substring(0, 10),
      sCategories: sCategories || "DB",
      sUserGroupID: (sUserGroupID || "G1").padEnd(10, ' ').substring(0, 10),
      sUserStatus: sUserStatus || "",
      sTenantID: sTenantID || ""
    };
  }, []);

  // Fixed makeAjaxCall function
  const makeAjaxCall = useCallback(async (url, passObjDet) => {
    try {
      console.log(`API call to ${url}:`, passObjDet);
      
      // Get active user details
      const activeUserDetails = getActiveUserDetails();
      
      // Prepare the request body
      let requestBody;
      
      if (url === endpoints.loadCategoryTagValueAndID) {
        // Special handling for LoadCategoryTagValueAndID endpoint
        requestBody = {
          passObjDet: passObjDet,
          ActiveUserDetails: activeUserDetails,
          ApplicationCode: "SDMS"
        };
      } else {
        // For other endpoints
        requestBody = {
          ...passObjDet,
          ActiveUserDetails: activeUserDetails,
          ApplicationCode: "SDMS"
        };
      }
      
      console.log(`Final request to ${url}:`, requestBody);
      
      const response = await postData(url, requestBody);
      
      console.log(`Raw API response from ${url}:`, response);
      
      if (!response) {
        console.warn(`Empty response from ${url}`);
        return null;
      }
      
      // Check for Rtn status
      if (response.Rtn) {
        const rtn = response.Rtn.toLowerCase();
        if (rtn === 'false' || rtn === 'error') {
          console.error(`API returned error status: ${rtn}`, response.Message || response.ErrorMessage);
          throw new Error(response.Message || response.ErrorMessage || `API call failed for ${url}`);
        }
      }
      
      // Handle different response structures
      if (response.oResObj !== undefined) {
        return response.oResObj;
      }
      
      if (response.data !== undefined) {
        return response.data;
      }
      
      // If response is an array or object, return it directly
      if (Array.isArray(response) || typeof response === 'object') {
        return response;
      }
      
      return response;
      
    } catch (error) {
      console.error(`AJAX call failed for ${url}:`, error);
      throw error;
    }
  }, [postData, getActiveUserDetails, endpoints.loadCategoryTagValueAndID]);

  // Custom sort function for templates: QC, Calibration, Method Development, Project
  const sortTemplates = useCallback((templates) => {
    const order = ['QC', 'Calibration', 'Method Development', 'Project'];
    
    return templates.sort((a, b) => {
      const indexA = order.indexOf(a.label);
      const indexB = order.indexOf(b.label);
      
      // If both labels are in the order array, sort by the order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one is in the order array, put it first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither is in the order array, sort alphabetically
      return a.label.localeCompare(b.label);
    });
  }, []);

  // Load tag values for a specific tag with dependency on previous tag's value
  const loadTagValues = useCallback(async (tagId, templateId, instrumentId, tagIndex, previousTagValueID = "") => {
    try {
      // Get user ID from session storage or use default
      const getUserId = () => {
        try {
          const encryptedUserId = sessionStorage.getItem("sUserID");
          if (encryptedUserId && isEncrypted(encryptedUserId)) {
            return CF_decrypt(encryptedUserId);
          }
          return encryptedUserId || "U1";
        } catch (error) {
          console.error("Error getting user ID:", error);
          return "U1";
        }
      };
      
      const userId = getUserId();
      
      console.log("Loading tag values with params:", {
        tagId,
        templateId,
        instrumentId,
        userId,
        tagIndex,
        previousTagValueID
      });
      
      const requestBody = {
        uid: tagIndex || 0,
        sUserID: userId,
        nTagID: parseInt(tagId) || 0,
        sTagValueID: previousTagValueID || "          ",
        sInstrumentID: instrumentId.padEnd(10, ' '),
        sTemplateID: templateId
      };
      
      console.log("Tag values request body:", requestBody);
      
      const response = await makeAjaxCall(endpoints.loadCategoryTagValueAndID, requestBody);
      
      console.log("Tag values API response:", response);
      
      if (response && response.list && Array.isArray(response.list)) {
        // Transform API response to options array
        const options = response.list.map(item => ({
          value: item.sTagValueID ? item.sTagValueID.trim() : '',
          label: item.sTagValue || 'Unknown Value'
        })).filter(opt => opt.value && opt.label);
        
        console.log(`Transformed ${options.length} tag value options for tag ${tagId}`);
        return options;
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        const options = response.map(item => ({
          value: item.sTagValueID ? item.sTagValueID.trim() : '',
          label: item.sTagValue || 'Unknown Value'
        })).filter(opt => opt.value && opt.label);
        
        console.log(`Transformed ${options.length} tag value options (direct array) for tag ${tagId}`);
        return options;
      }
      
      console.warn(`No valid tag values found in response for tag ${tagId}`);
      return [];
      
    } catch (error) {
      console.error(`Error loading tag values for tag ${tagId}:`, error);
      return [];
    }
  }, [makeAjaxCall, endpoints.loadCategoryTagValueAndID]);

  // Load tags when template is selected
  const fetchTags = useCallback(async (templateId, instrumentId) => {
    if (!templateId || !instrumentId) {
      console.log("Cannot fetch tags: missing templateId or instrumentId");
      setTags([]);
      return;
    }
    
    setIsLoadingTags(true);
    try {
      const activeUserDetails = getActiveUserDetails();
      
      // Use current instrument ID or the provided one
      const currentInstrumentId = instrumentId.padEnd(10, ' ');
      
      const requestBody = {
        sUserID: activeUserDetails.sUserID || "U1",
        ActiveUserDetails: activeUserDetails,
        sInstrumentID: currentInstrumentId,
        ApplicationCode: "SDMS",
        sTemplateID: templateId
      };
      
      console.log("Fetching tags for template:", templateId, "instrument:", currentInstrumentId);
      
      const response = await makeAjaxCall(endpoints.loadTagCategory, requestBody);
      
      console.log("Tags API response:", response);
      
      if (Array.isArray(response) && response.length > 0) {
        // Create tags array with empty options initially
        const transformedTags = response.map((item, index) => {
          const tagId = item.L58TagID || item.L8iTagID || index;
          
          // Use the mapping table or fall back to API response
          const tagName = tagIdToNameMap[tagId] || item.L58TagName || 'Unknown Tag';
          const value = item.Value || '';
          const valueID = item.ValueID || '';
          
          console.log(`Tag ${index}: ID=${tagId}, Name="${tagName}", Value="${value}", ValueID="${valueID}"`);
          
          return {
            tagName: tagName,
            value: value.trim(),
            valueID: valueID ? valueID.trim() : '',
            tagID: tagId,
            order: item.L58Order || index,
            required: item.L58ValueStatus || false,
            editable: true, // Always editable by default
            options: [] // Initialize empty, will load from API if needed
          };
        });
        
        // Sort by order
        transformedTags.sort((a, b) => a.order - b.order);
        
        setTags(transformedTags);
        console.log(`Loaded ${transformedTags.length} tags for template ${templateId}:`, transformedTags);
        
        // Load values for the first tag only initially
        if (transformedTags.length > 0) {
          const firstTag = transformedTags[0];
          if (firstTag.tagID) {
            const options = await loadTagValues(
              firstTag.tagID, 
              templateId, 
              instrumentId,
              0, // tag index
              "" // empty previous value ID for first tag
            );
            if (options.length > 0) {
              setTags(prev => prev.map((tag, idx) => 
                idx === 0 ? { ...tag, options } : tag
              ));
            }
          }
        }
        
      } else {
        console.log("No tags returned from API for template:", templateId);
        setTags([]);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  }, [getActiveUserDetails, makeAjaxCall, endpoints.loadTagCategory, loadTagValues]);

  // Check merge and auto-unlock settings
  const checkMergeAndAutoUnlockSettings = useCallback(async () => {
    try {
      const response = await makeAjaxCall(endpoints.mergeFileAndAutoUnlock, {});
      
      console.log("=== DEBUG: Merge/AutoUnlock response ===");
      console.log("Full response:", response);
      console.log("MergeCount array:", response?.MergeCount);
      console.log("MergeCount[0]:", response?.MergeCount?.[0]);
      console.log("L67Status value:", response?.MergeCount?.[0]?.L67Status);
      console.log("L67Status type:", typeof response?.MergeCount?.[0]?.L67Status);
      
      if (response) {
        // Show merge fields if L67Status is false
        const showMerge = response.MergeCount?.[0]?.L67Status === false;
        console.log("showMerge calculated:", showMerge);
        setShowMergeFields(showMerge);
        
        // Show unlock option if L67Status is false
        const showUnlock = response.AutoUnlock?.[0]?.L67Status === false;
        setShowUnlockOption(showUnlock);
        
        // Store merge count from settings
        if (response.MergeCountValue?.[0]?.L42ValueSettings) {
          const mergeCount = response.MergeCountValue[0].L42ValueSettings;
          setFormData(prev => ({ ...prev, mergeFileCount: mergeCount }));
        }
        
        // Set unlock after capture default value
        if (response.AutoUnlockValue?.[0]?.L42ValueSettings === "1") {
          setFormData(prev => ({ ...prev, unlockAfterCapture: true }));
        }
        
        console.log(`Settings: showMergeFields=${showMerge}, showUnlockOption=${showUnlock}`);
        console.log(`API says L67Status = ${response.MergeCount?.[0]?.L67Status}`);
        console.log(`Setting showMergeFields to: ${showMerge}`);
        console.log(`This means merge fields will be ${showMerge ? 'VISIBLE' : 'HIDDEN'}`);
      } else {
        // Default to showing both if API fails
        console.log("No response from API, defaulting to show merge fields");
        setShowMergeFields(true);
        setShowUnlockOption(true);
      }
    } catch (error) {
      console.error('Error checking merge/auto-unlock settings:', error);
      // Default to showing both on error
      setShowMergeFields(true);
      setShowUnlockOption(true);
    }
  }, [makeAjaxCall, endpoints.mergeFileAndAutoUnlock]);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const response = await makeAjaxCall(endpoints.lockUserCombo, {});
      
      console.log("User response:", response);
      
      if (Array.isArray(response) && response.length > 0) {
        const users = response.map(user => ({
          value: user.sUserID ? user.sUserID.trim() : '',
          label: user.sUserName || 'Unknown User'
        }));
        
        setUserOptions(users);
        
        // Auto-select current user
        const activeUserDetails = getActiveUserDetails();
        const currentUserId = activeUserDetails.sUserID || "U1";
        
        const currentUser = users.find(user => user.value === currentUserId);
        if (currentUser) {
          setFormData(prev => ({ ...prev, user: currentUser.value }));
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUserOptions([]);
    }
  }, [makeAjaxCall, endpoints.lockUserCombo, getActiveUserDetails]);

  // Load paths based on selected instrument
  const loadPaths = useCallback(async (instrumentId) => {
    try {
      console.log(`Loading paths for instrument: ${instrumentId}`);
      
      let endpoint = endpoints.lockPathCombo;
      let requestBody = {
        sInstrumentID: instrumentId,
        sScheduleID: ""
      };
      
      // Check if coming from schedule
      if (scheduleData) {
        const scheduleId = scheduleData.L13ScheduleID;
        const taskType = scheduleData.TaskType;
        
        if (taskType === "ScheduleCreation") {
          endpoint = endpoints.lockActiveInstrumentPathCombo;
        } else {
          endpoint = endpoints.lockDeactiveInstrumentPathCombo;
        }
        requestBody.sScheduleID = scheduleId;
      }
      
      const response = await makeAjaxCall(endpoint, requestBody);
      
      console.log("Paths response:", response);
      
      if (Array.isArray(response) && response.length > 0) {
        const pathOptions = response.map(path => ({
          value: path.sTaskID || path.L13ScheduleID || '',
          label: path.sTaskSourcePath || 'Unknown Path'
        }));
        
        setPathOptions(pathOptions);
        console.log(`Loaded ${pathOptions.length} paths for instrument ${instrumentId}:`, pathOptions);
        
        // Auto-select the first path
        if (pathOptions.length > 0) {
          const firstPath = pathOptions[0];
          console.log(`Auto-selecting first path: ${firstPath.label} (${firstPath.value})`);
          setFormData(prev => ({ ...prev, path: firstPath.value }));
          
          // Check if instrument is interface type (has : in ID)
          const isInterface = instrumentId.includes(':') && instrumentId.split(':')[1].trim() !== "0";
          setIsInstrumentInterface(isInterface);
          
          // Generate filename for interface instruments
          if (isInterface) {
            const timestamp = new Date().toISOString().slice(0,10).replace(/-/g, '');
            const instrumentName = instrumentOptions.find(opt => opt.value === instrumentId)?.label || instrumentId;
            const fileName = `${timestamp}_${instrumentName.replace(/[:]/g, '_')}.dat`;
            setFormData(prev => ({ ...prev, fileName }));
          }
          
          // Load tags if template is already selected
          if (formData.template) {
            console.log(`Template already selected (${formData.template}), loading tags...`);
            fetchTags(formData.template, instrumentId);
          }
        }
      } else {
        console.warn("No paths returned from API");
        setPathOptions([]);
      }
    } catch (error) {
      console.error('Error loading paths:', error);
      setPathOptions([]);
    }
  }, [makeAjaxCall, endpoints.lockPathCombo, endpoints.lockActiveInstrumentPathCombo, 
      endpoints.lockDeactiveInstrumentPathCombo, instrumentOptions, formData.template, 
      fetchTags, scheduleData]);

  // Load instruments based on selected client
  const loadInstruments = useCallback(async (clientId) => {
    try {
      console.log(`Loading instruments for client: ${clientId}`);
      
      let endpoint = endpoints.lockInstrumentCombo;
      let requestBody = {
        sClientID: clientId,
        sScheduleID: ""
      };
      
      // Check if coming from schedule
      if (scheduleData) {
        const scheduleId = scheduleData.L13ScheduleID;
        const taskType = scheduleData.TaskType;
        
        if (taskType === "ScheduleCreation") {
          endpoint = endpoints.lockActiveParsingInstrumentCombo;
        } else {
          endpoint = endpoints.lockDeactiveParsingInstrumentCombo;
        }
        requestBody.sScheduleID = scheduleId;
      }
      
      const response = await makeAjaxCall(endpoint, requestBody);
      
      console.log("Instruments response:", response);
      
      if (Array.isArray(response) && response.length > 0) {
        const instrumentOptions = response.map(instrument => ({
          value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
          label: instrument.L11InstrumentAliasName || 'Unknown Instrument'
        }));
        
        setInstrumentOptions(instrumentOptions);
        console.log(`Loaded ${instrumentOptions.length} instruments for client ${clientId}:`, instrumentOptions);
        
        // Auto-select the first instrument and load its paths
        if (instrumentOptions.length > 0) {
          const firstInstrument = instrumentOptions[0];
          console.log(`Auto-selecting first instrument: ${firstInstrument.label} (${firstInstrument.value})`);
          setFormData(prev => ({ ...prev, instrument: firstInstrument.value }));
          
          // Load paths for the selected instrument
          await loadPaths(firstInstrument.value);
        }
      } else {
        console.warn("No instruments returned from API");
        setInstrumentOptions([]);
      }
    } catch (error) {
      console.error('Error loading instruments:', error);
      setInstrumentOptions([]);
    }
  }, [makeAjaxCall, endpoints.lockInstrumentCombo, endpoints.lockActiveParsingInstrumentCombo,
      endpoints.lockDeactiveParsingInstrumentCombo, loadPaths, scheduleData]);

  // Load clients - now using loadInstrumentsRef to avoid circular dependency
  const loadClients = useCallback(async () => {
    try {
      console.log("Loading clients...");
      
      // Extract schedule info if provided
      const preselectedClientId = scheduleData?.L06ClientID;
      const taskStatus = scheduleData?.TaskType !== "ScheduleCreation" ? 'D' : 'A';
      
      const response = await makeAjaxCall(endpoints.clientLockCombo, {
        sTaskStatus: taskStatus,
        sClientID: preselectedClientId
      });
      
      console.log("Client response:", response);
      
      if (Array.isArray(response) && response.length > 0) {
        const clientOptions = response.map(client => ({
          value: client.sClientID ? client.sClientID.trim() : '',
          label: client.sClientName || 'Unknown Client'
        }));
        
        setClientOptions(clientOptions);
        console.log(`Loaded ${clientOptions.length} clients:`, clientOptions);
        
        // Determine which client to select
        let clientToSelect = null;
        
        // If coming from schedule, try to select the specified client
        if (preselectedClientId) {
          clientToSelect = clientOptions.find(client => client.value === preselectedClientId);
        }
        
        // If not found or not from schedule, select first client
        if (!clientToSelect && clientOptions.length > 0) {
          clientToSelect = clientOptions[0];
        }
        
        if (clientToSelect) {
          console.log(`Selecting client: ${clientToSelect.label} (${clientToSelect.value})`);
          setFormData(prev => ({ ...prev, client: clientToSelect.value }));
          
          // Load instruments for the selected client
          if (loadInstrumentsRef.current) {
            await loadInstrumentsRef.current(clientToSelect.value);
          }
        }
      } else {
        console.warn("No clients returned from API");
        setClientOptions([]);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setClientOptions([]);
    }
  }, [makeAjaxCall, endpoints.clientLockCombo, scheduleData]);

  // Store the loadInstruments function in the ref
  useEffect(() => {
    loadInstrumentsRef.current = loadInstruments;
  }, [loadInstruments]);

  // Function to load options for a specific tag when needed
  const loadTagOptions = useCallback(async (tagIndex) => {
    if (!formData.template || !tags[tagIndex]) return [];
    
    const tag = tags[tagIndex];
    // Get the previous tag's selected value ID
    const previousTagValueID = tagIndex > 0 ? tags[tagIndex - 1].valueID : "";
    
    console.log(`Loading options for tag ${tagIndex} (${tag.tagName}) with previous value ID: "${previousTagValueID}"`);
    
    try {
      const options = await loadTagValues(
        tag.tagID, 
        formData.template, 
        formData.instrument,
        tagIndex, // Pass the tag index as uid
        previousTagValueID
      );
      
      return options || []; // Return the options immediately
    } catch (error) {
      console.error(`Error loading options for tag ${tagIndex}:`, error);
      return []; // Return empty array on error
    }
  }, [formData.template, formData.instrument, tags, loadTagValues]);

  // When a tag value is selected, load options for the next tag
  const handleTagValueClick = useCallback((index, value, valueID) => {
    console.log(`Tag ${index} selected - Value: ${value}, ValueID: ${valueID}`);
    
    setTags(prev => {
      const updatedTags = prev.map((t, idx) => {
        if (idx === index) {
          return { ...t, value, valueID };
        }
        
        // Clear all tags after the changed tag
        if (idx > index) {
          return { ...t, value: '', valueID: '', options: [] };
        }
        
        return t;
      });
      
      return updatedTags;
    });
    
    // If there's a next tag, load its options based on the selected value
    if (index < tags.length - 1) {
      console.log(`Loading options for next tag (index: ${index + 1}) after selecting tag ${index}`);
      setTimeout(() => {
        loadTagOptions(index + 1).then(options => {
          if (options.length > 0) {
            setTags(prev => prev.map((tag, idx) => 
              idx === index + 1 ? { ...tag, options } : tag
            ));
          }
        });
      }, 100);
    }
  }, [tags, loadTagOptions]);

  // Handle tag edit request - loads options when user clicks to edit a tag
  const handleTagEditRequest = useCallback(async (tagIndex) => {
    console.log(`Edit requested for tag ${tagIndex}`);
    
    // If tag already has options, return them immediately
    if (tags[tagIndex] && tags[tagIndex].options && tags[tagIndex].options.length > 0) {
      console.log(`Returning existing options for tag ${tagIndex}`);
      return tags[tagIndex].options;
    }
    
    // Otherwise, load options from API
    console.log(`Loading options from API for tag ${tagIndex}`);
    const options = await loadTagOptions(tagIndex);
    
    // Update the tag options in the parent state
    if (options.length > 0) {
      setTags(prev => prev.map((tag, idx) => 
        idx === tagIndex ? { ...tag, options } : tag
      ));
    }
    
    return options;
  }, [tags, loadTagOptions]);

  // Load initial data
  useEffect(() => {
    // Prevent duplicate calls in Strict Mode
    if (initialLoadDoneRef.current) return;
    
    const loadData = async () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      initialLoadDoneRef.current = true;
      
      console.log("Starting to load initial data...");
      await loadInitialData();
    };
    
    loadData();
    
    return () => {
      isLoadingRef.current = false;
    };
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    console.log("Starting to load initial data...");
    
    try {
      const activeUserDetails = getActiveUserDetails();
      
      // ========== STEP 1: CHECK MERGE/AUTO-UNLOCK SETTINGS ==========
      console.log("Checking merge/auto-unlock settings...");
      await checkMergeAndAutoUnlockSettings();
      
      // ========== STEP 2: LOAD USERS ==========
      console.log("Loading users...");
      await loadUsers();
      
      // ========== STEP 3: LOAD TEMPLATES ==========
      console.log("Loading templates...");
      try {
        const templateResponse = await makeAjaxCall(endpoints.lockTemplateCombo, {
          ActiveUserDetails: activeUserDetails,
          ApplicationCode: "SDMS"
        });
        
        console.log("Template response received:", templateResponse);
        
        if (Array.isArray(templateResponse) && templateResponse.length > 0) {
          const templates = templateResponse
            .map(template => ({
              value: String(template.sTemplateID || '').trim(),
              label: String(template.sTemplateName || '').trim()
            }))
            .filter(template => template.value && template.label && template.value !== 'undefined');
          
          console.log(`Successfully mapped ${templates.length} templates:`, templates);
          
          // Sort templates in specific order: QC, Calibration, Method Development, Project
          const sortedTemplates = sortTemplates([...templates]);
          
          // Set template options
          setTemplateOptions(sortedTemplates);
          
          // Set first template as default (should be QC)
          if (sortedTemplates.length > 0) {
            const firstTemplateValue = sortedTemplates[0].value;
            setFormData(prev => ({ 
              ...prev, 
              template: firstTemplateValue 
            }));
            console.log(`Set default template to: ${firstTemplateValue} (${sortedTemplates[0].label})`);
          } else {
            console.warn("No valid templates found after mapping");
            setTemplateOptions([]);
          }
        } else {
          console.warn("No templates in response or empty array");
          setTemplateOptions([]);
        }
      } catch (templateError) {
        console.error("Error loading templates:", templateError);
        setTemplateOptions([]);
      }
      
      // ========== STEP 4: LOAD CLIENTS ==========
      console.log("Loading clients...");
      await loadClients();
      
      console.log("Initial data loading complete");
      
    } catch (error) {
      console.error('Error in loadInitialData:', error);
      setTemplateOptions([]);
      setClientOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tags when template changes
  useEffect(() => {
    if (formData.template && formData.instrument) {
      console.log("Template changed, fetching tags for:", {
        template: formData.template,
        instrument: formData.instrument
      });
      fetchTags(formData.template, formData.instrument);
    } else {
      setTags([]);
    }
  }, [formData.template, formData.instrument, fetchTags]);

  // Event handlers
  const handleClientChange = useCallback(async (value) => {
    console.log("Client changed to:", value);
    setFormData(prev => ({ ...prev, client: value, instrument: '', path: '', fileName: '' }));
    setErrors(prev => ({ ...prev, client: false }));
    
    // Clear dependent dropdowns
    setInstrumentOptions([]);
    setPathOptions([]);
    setTags([]);
    
    // Load instruments for selected client
    if (value && loadInstrumentsRef.current) {
      await loadInstrumentsRef.current(value);
    }
  }, []);

  const handleInstrumentChange = useCallback(async (value) => {
    console.log("Instrument changed to:", value);
    setFormData(prev => ({ ...prev, instrument: value, path: '', fileName: '' }));
    setErrors(prev => ({ ...prev, instrument: false }));
    
    // Clear paths dropdown
    setPathOptions([]);
    setTags([]);
    
    // Load paths for selected instrument
    if (value) {
      await loadPaths(value);
      
      // Check if instrument is interface type (has : in ID)
      const isInterface = value.includes(':') && value.split(':')[1].trim() !== "0";
      setIsInstrumentInterface(isInterface);
      
      // Generate filename for interface instruments
      if (isInterface) {
        const timestamp = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const instrumentName = instrumentOptions.find(opt => opt.value === value)?.label || value;
        const fileName = `${timestamp}_${instrumentName.replace(/[:]/g, '_')}.dat`;
        setFormData(prev => ({ ...prev, fileName }));
      } else {
        setFormData(prev => ({ ...prev, fileName: '' }));
      }
      
      // Refresh tags if template is already selected
      if (formData.template) {
        fetchTags(formData.template, value);
      }
    }
  }, [instrumentOptions, loadPaths, formData.template, fetchTags]);

  const handlePathChange = useCallback((value) => {
    console.log("Path changed to:", value);
    setFormData(prev => ({ ...prev, path: value }));
    setErrors(prev => ({ ...prev, path: false }));
  }, []);

  const handleTemplateChange = useCallback((value) => {
    console.log("Template changed to:", value);
    setFormData(prev => ({ ...prev, template: value }));
    setErrors(prev => ({ ...prev, template: false }));
    setShowValidationError(false);
    
    // Fetch tags if instrument is selected
    if (formData.instrument) {
      fetchTags(value, formData.instrument);
    }
  }, [formData.instrument, fetchTags]);

  const handleUserChange = useCallback((value) => {
    console.log("User changed to:", value);
    setFormData(prev => ({ ...prev, user: value }));
  }, []);

  const handleMergeCountChange = useCallback((value) => {
    const numValue = parseInt(value) || 0;
    if (numValue > 10000) {
      alert('Merge count cannot exceed 10000');
      setFormData(prev => ({ ...prev, mergeFileCount: '10000' }));
    } else if (numValue < 1 && value !== '') {
      setFormData(prev => ({ ...prev, mergeFileCount: '1' }));
    } else {
      setFormData(prev => ({ ...prev, mergeFileCount: value }));
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.instrument) newErrors.instrument = true;
    if (!formData.path) newErrors.path = true;
    if (!formData.template) newErrors.template = true;
    if (!formData.fileName && isInstrumentInterface) newErrors.fileName = true;
    
    const missingTags = tags.filter(tag => tag.required && !tag.value);
    if (missingTags.length > 0) {
      const missingTagName = missingTags[0].tagName;
      
      // Check if it's because previous tags aren't selected
      const missingIndex = tags.findIndex(tag => tag.tagName === missingTagName);
      if (missingIndex > 0) {
        // Check previous tags
        for (let i = 0; i < missingIndex; i++) {
          if (!tags[i].value) {
            setShowValidationError(true);
            return false;
          }
        }
      }
      
      alert(`Select ${missingTagName} value`);
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, tags, isInstrumentInterface]);

  const handleAuditAction = useCallback((action, callback) => {
    setAuditAction(action);
    setAuditCallback(() => callback);
    setShowAuditTrail(true);
  }, []);

  const handleAuditAuthorized = useCallback((auditData) => {
    setShowAuditTrail(false);
    
    if (auditCallback) {
      auditCallback(auditData);
    }
    
    setAuditAction(null);
    setAuditCallback(null);
  }, [auditCallback]);

  const performLockAction = useCallback(async (auditData) => {
    try {
      const activeUserDetails = getActiveUserDetails();
      
      const instrumentId = (formData.instrument || "I1:51").padEnd(10, ' ');
      const clientId = (formData.client || '').padEnd(10, ' ');
      const templateId = (formData.template || '').padEnd(10, ' ');
      const limsOrderId = (formData.limsOrder || '').padEnd(10, ' ');
      const userId = (formData.user || activeUserDetails.sUserID || '').padEnd(10, ' ');
      
      const tagValues = tags.map(tag => {
        const tagID = String(tag.tagID || '0').padEnd(10, ' ');
        const value = (tag.value || '').padEnd(255, ' ');
        const valueID = (tag.valueID || '').padEnd(10, ' ');
        
        return {
          sTagID: tagID,
          sValue: value,
          sValueID: valueID
        };
      });

      const requestBody = {
        sTaskID: "", 
        sInstrumentID: instrumentId,
        sClientID: clientId,
        sTaskSourcePath: formData.path,
        sLimsOrderID: limsOrderId,
        sFileName: formData.fileName,
        sTemplateID: templateId,
        sMergeFileCount: formData.mergeFileCount,
        sUnlockAfterCapture: formData.unlockAfterCapture ? "1" : "0",
        tagValues: tagValues,
        sSiteCode: activeUserDetails.sSiteCode,
        sUserID: userId,
        sUserGroupID: activeUserDetails.sUserGroupID,
        sSessionID: activeUserDetails.sSessionID,
        sApplicationName: activeUserDetails.sApplicationName,
        sUsername: activeUserDetails.sUsername,
        sAuditReason: auditData.reason || '',
        sAuditPassword: auditData.password || '',
        sAuditUserName: auditData.username || ''
      };

      console.log("Lock request body:", JSON.stringify(requestBody, null, 2));
      
      // For demo purposes, just simulate success
      setIsLocked(true);
      
      // Show success message
      alert('Instrument locked successfully');
      
      // Redirect to MyInstruments page after successful lock
      setTimeout(() => {
        if (onNavigateToMyInstruments) {
          onNavigateToMyInstruments();
        } else {
          // Fallback: if navigation prop not provided, reload the page or show message
          alert('Please navigate to My Instruments page to view your locked instruments');
        }
      }, 500);
      
    } catch (error) {
      console.error('Error locking instrument:', error);
      alert(`Error: ${error.message || 'Unknown error occurred'}`);
    }
  }, [formData, tags, getActiveUserDetails, onNavigateToMyInstruments]);

  const performUnlockAction = useCallback(async (auditData) => {
    try {
      setIsLocked(false);
      alert('Instrument unlocked successfully (demo mode)');
      
    } catch (error) {
      console.error('Error unlocking instrument:', error);
      alert(`Error: ${error.message || 'Unknown error occurred'}`);
    }
  }, []);

  const performUpdateAction = useCallback(async (auditData) => {
    try {
      alert('Instrument updated successfully (demo mode)');
    } catch (error) {
      console.error('Error updating instrument:', error);
      alert(`Error: ${error.message || 'Unknown error occurred'}`);
    }
  }, []);

  const handleLock = useCallback(() => {
    setShowValidationError(false);
    if (!validateForm()) return;
    handleAuditAction('lock', performLockAction);
  }, [validateForm, handleAuditAction, performLockAction]);

  const handleUnlock = useCallback(() => {
    if (!isLocked) {
      alert(t('instrumentlocktag.instrumentisnotlocked'));
      return;
    }
    handleAuditAction('unlock', performUnlockAction);
  }, [isLocked, handleAuditAction, performUnlockAction, t]);

  const handleUpdate = useCallback(() => {
    setShowValidationError(false);
    if (!validateForm()) return;
    handleAuditAction('update', performUpdateAction);
  }, [validateForm, handleAuditAction, performUpdateAction]);

  const PrimaryButton = ({ icon: Icon, label, onClick, disabled }) => (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`flex items-center gap-1 px-2.5 py-2 transition-all text-[12px] font-bold rounded shadow-xs whitespace-nowrap
        ${disabled 
          ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
          : 'bg-[#2883FE] text-[#fff] hover:bg-[#2883FE] hover:scale-90'}
      `}
      style={{ fontFamily: 'roboto' }}
    >
      <Icon className="w-3 h-3 stroke-[2]" />
      <span>{label}</span>
    </button>
  );

  // Add debug logs to see what's loading
  useEffect(() => {
    console.log("=== RENDER DEBUG ===");
    console.log("Current form data:", formData);
    console.log("Client options:", clientOptions.length);
    console.log("Instrument options:", instrumentOptions.length);
    console.log("Path options:", pathOptions.length);
    console.log("User options:", userOptions.length);
    console.log("Tags:", tags.length);
    console.log("Show merge fields:", showMergeFields);
    console.log("Should render MergeFileCountRow:", showMergeFields ? "YES" : "NO");
    console.log("Show unlock option:", showUnlockOption);
    console.log("formData.mergeFileCount:", formData.mergeFileCount);
  }, [formData, clientOptions, instrumentOptions, pathOptions, userOptions, tags, showMergeFields, showUnlockOption]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading templates and clients...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full text-[#353F49] font-['Verdana'] text-xs ">
      
      <div className="bg-white px-4 py-4">
        <div className="max-w-[1100px]">
          <div className="grid grid-cols-2">
            <div className="max-w-[400px]">
              <div className="mb-7">
                
                <label className="block text-[12px] text-[#405F7D] mb-3.5 font-semibold font-roboto">
                  {t('label.client')}
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.client}
                    onChange={(e) => handleClientChange(e.target.value)}
                    // disabled={isLocked || !!scheduleData} // Disable if from schedule
                    options={clientOptions}
                    displayKey="label"
                    valueKey="value"
                    isSearchable={true}
                    showError={errors.client}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-[12px] text-[#405F7D] mb-3.5 font-semibold font-roboto">
                  {t('label.instrument')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.instrument}
                    onChange={(e) => handleInstrumentChange(e.target.value)}
                    // disabled={isLocked}
                    options={instrumentOptions}
                    displayKey="label"
                    valueKey="value"
                    isSearchable={true}
                    showError={errors.instrument}
                    className="text-xs"
                  />
                </div>
                {lockStatus && (
                  <div className={`mt-1 text-xs ${isLocked ? 'text-red-600' : 'text-green-600'}`}>
                    {isLocked ? ' Instrument is locked' : ' Instrument is unlocked'}
                  </div>
                )}
              </div>

              <div className="mb-7">
                <label className="block text-[12px] text-[#405F7D] mb-3.5 font-semibold font-roboto">
                  {t('instrumentlocktag.path')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.path}
                    onChange={(e) => handlePathChange(e.target.value)}
                    disabled={isLocked}
                    options={pathOptions}
                    displayKey="label"
                    valueKey="value"
                    isSearchable={true}
                    showError={errors.path}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-[#405F7D] mb-3.5 font-semibold text-[12px] font-roboto">
                  {t('instrumentlocktag.limsorder')}
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.limsOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, limsOrder: e.target.value }))}
                    disabled={isLocked || !isInstrumentInterface}
                    options={limsOrderOptions}
                    displayKey="label"
                    valueKey="value"
                    isSearchable={true}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-[#405F7D] mb-3.5 font-semibold text-[12px] font-roboto">
                  {t('instrumentlocktag.filename')} {isInstrumentInterface && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
                  disabled={!isInstrumentInterface || isLocked}
                  className={`w-full h-7 px-0 text-xs bg-[#f3f3f3] border-0 border-b-2 outline-none font-semibold
                    ${errors.fileName ? 'border-red-400 text-[#A94442]' : 'border-gray-300 text-[#373737]'}`}
                  style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                />
              </div>

              {/* User dropdown - hidden by default as in jQuery */}
              <div className="mb-7" style={{ display: 'none' }}>
                <label className="block text-[#405F7D] mb-3.5 font-semibold text-[12px] font-roboto">
                  {t('instrumentlocktag.username')}
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.user}
                    onChange={(e) => handleUserChange(e.target.value)}
                    disabled={isLocked}
                    options={userOptions}
                    displayKey="label"
                    valueKey="value"
                    isSearchable={true}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Conditionally render merge fields - COMPLETELY HIDDEN when showMergeFields is false */}
              {showMergeFields ? (
                <MergeFileCountRow
                  mergeCount={formData.mergeFileCount}
                  currentCount={formData.currentFileCount}
                  onMergeChange={handleMergeCountChange}
                  disabled={!isInstrumentInterface || isLocked}
                  showMergeFields={showMergeFields}
                  t={t}
                />
              ) : null}

              {/* Conditionally render unlock option - COMPLETELY HIDDEN when showUnlockOption is false */}
              {showUnlockOption ? (
                <InlineCheckbox
                  label={t('instrumentlocktag.unlockaftercapture')}
                  checked={formData.unlockAfterCapture}
                  onChange={(value) => setFormData(prev => ({ ...prev, unlockAfterCapture: value }))}
                  disabled={isLocked}
                />
              ) : null}
            </div>

            <div className='max-w-[1300px]'>
              <div className="max-w-[350px]">
                <div className="mb-7">
                  <label className="block text-[12px] text-[#405F7D] mb-3.5 font-semibold font-roboto">
                    {t('instrumentlocktag.template')} <span className="text-red-500">*</span>
                  </label>
                  <TemplateDropdown
                    value={formData.template}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    disabled={isLocked}
                    options={templateOptions}
                    error={errors.template}
                    className="text-xs"
                  />
                </div>
              </div>
              
              <div className="mt-7 max-w-[1300px]">
                <div className="max-w-[550px]">
                  {isLoadingTags ? (
                    <div className="flex justify-center items-center h-[250px]">
                      <div className="text-sm text-gray-500">Loading tags...</div>
                    </div>
                  ) : (
                    <TagGrid
                      tags={tags}
                      onTagValueClick={handleTagValueClick}
                      onTagEditRequest={handleTagEditRequest}
                      t={t}
                      showValidationError={showValidationError}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 ml-4 mr-4 mt-3 pt-5 border-t border-gray-200">
        <PrimaryButton 
          icon={isLocked ? Edit : Lock}
          label={isLocked ? t('button.update') : t('instrumentlocktag.lock')}
          onClick={isLocked ? handleUpdate : handleLock}
        />

        <PrimaryButton
          icon={Unlock}
          label={t('instrumentlocktag.unlock')}
          onClick={handleUnlock}
          disabled={!isLocked}
        />
      </div>

      <AuditTrail
        isOpen={showAuditTrail}
        onClose={() => setShowAuditTrail(false)}
        onAuthorized={handleAuditAuthorized}
        actionLabel={auditAction === 'lock' ? t('instrumentlocktag.lock') : 
                    auditAction === 'unlock' ? t('instrumentlocktag.unlock') : 
                    t('button.update')}
        defaultReason={auditAction === 'lock' ? "Instrument Locked" : 
                      auditAction === 'unlock' ? "Instrument Unlocked" : 
                      "Instrument Updated"}
        disableReason={false}
      />
    </div>
  );
};

export default InstrumentLockTag;
