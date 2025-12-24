import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Lock, Unlock, ChevronDown, X, Edit, CheckSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import your common components
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';

// Import servicecall and decryption
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption';

const MergeFileCountRow = ({ mergeCount, currentCount, onMergeChange, disabled, showMergeFields, t }) => {
  if (!showMergeFields) return null;
  
  return (
    <div className="mb-6 mt-7">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
            {t('instrumentlocktag.mergefilecount')}
          </label>
          <input
            type="number"
            value={mergeCount}
            onChange={(e) => onMergeChange(e.target.value)}
            disabled={disabled}
            min="0"
            max="10000"
            className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-white hover:border-gray-400 text-[#405F7D]"
            style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#405F7D] min-w-[150px] font-semibold font-roboto">
            {t('instrumentlocktag.currentuploadfilecount')}
          </label>
          <input
            type="number"
            value={currentCount}
            disabled={true}
            min="0"
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

const TagGrid = ({ tags, onTagValueClick, isLocked, t, showValidationError }) => {
  const [tooltipState, setTooltipState] = useState({
    isOpen: false,
    tagIndex: null,
    position: { top: 0, left: 0 },
    searchTerm: '',
    selectedValue: '',
    options: []
  });

  const [selectedTagIndex, setSelectedTagIndex] = useState(null);

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

  const handleRowClick = (tag, index) => {
    if (!isLocked && tag.editable) {
      if (tag.tagName === 'Test' && !tags[0].value) {
        return;
      }
      setSelectedTagIndex(index);
    }
  };

  const handleEditClick = (tag, index, event) => {
    event.stopPropagation();
    
    if (!isLocked && tag.editable) {
      if (tag.tagName === 'Test' && !tags[0].value) {
        return;
      }
      
      const options = tag.options && tag.options.length > 0 ? tag.options : [];

      setSelectedTagIndex(index);
      
      const position = calculateTooltipPosition(event);
      
      setTooltipState({
        isOpen: true,
        tagIndex: index,
        position,
        searchTerm: '',
        selectedValue: tag.value || '',
        options: options
      });
    }
  };

  const handleTooltipSubmit = () => {
    if (tooltipState.tagIndex !== null) {
      onTagValueClick(tooltipState.tagIndex, tooltipState.selectedValue || '');
    }
    setTooltipState({
      isOpen: false,
      tagIndex: null,
      position: { top: 0, left: 0 },
      searchTerm: '',
      selectedValue: '',
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
      options: []
    });
  };

  const handleOptionClick = (optionValue) => {
    setTooltipState(prev => ({
      ...prev,
      selectedValue: optionValue
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
          {tags.length === 0 ? (
            <div className="px-4 py-12 text-center text-[12px] text-[#4b4b4b] font-roboto">            
              {t('instrumentlocktag.noTagValue')}
            </div>
          ) : (
            tags.map((tag, idx) => {
              const isSelected = selectedTagIndex === idx;
              const isTestTag = tag.tagName === 'Test';
              const sampleNotSelected = isTestTag && !tags[0].value;
              
              return (
                <div 
                  key={idx} 
                  onClick={() => handleRowClick(tag, idx)}
                  className={`grid grid-cols-2 border-b border-gray-100 last:border-b-gray-100 group min-h-[15px]
                    ${isSelected ? 'bg-blue-50' : 'bg-white'}
                    ${!isLocked && tag.editable && !sampleNotSelected ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
                    ${sampleNotSelected ? 'opacity-60' : ''}
                  `}
                >
                  <div className={`px-4 py-2 text-[12px] flex items-center transition-all
                    ${isSelected ? 'border-l-4 border-l-[#2883FE]' : 'border-l-4 border-l-transparent'}
                    ${isSelected ? 'text-[#373737] font-bold' : 'text-[#373737]'}
                  `} style={{ fontFamily: 'Verdana, Arial, sans-serif' }}>
                    {tag.tagName}
                    {tag.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  
                  <div className={`px-1 py-3 text-[12px] flex items-center justify-between gap-2 `}>
                    <span className={`flex-1 transition-all ${isSelected ? 'font-bold text-[#373737]' : 'font-medium text-[#373737]'}`}
                      style={{ fontFamily: 'Verdana, Arial, sans-serif' }}>
                      {tag.value || ''}
                    </span>
                    
                    {tag.editable && !isLocked && !sampleNotSelected && (
                      <button
                        onClick={(e) => handleEditClick(tag, idx, e)}
                        className="ml-1 opacity-100 hover:opacity-80 transition-opacity"
                        title="Edit tag value"
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

      {showValidationError && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-700 text-xs font-semibold">
              Select sample value first before selecting test
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
                const isSelected = tooltipState.selectedValue === option.value;
                
                return (
                  <div
                    key={idx}
                    onClick={() => handleOptionClick(option.value)}
                    onDoubleClick={handleTooltipSubmit}
                    className={`px-1 py-1.5 text-[12px] cursor-pointer hover:bg-gray-50 relative
                      ${isSelected ? 'bg-[#e8f2ff]' : ''}
                    `}
                    style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#007bff]"></div>
                    )}
                    
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

const InstrumentLockTag = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    client: '',
    instrument: '',
    path: '',
    limsOrder: '',
    fileName: '',
    template: 'TP1',
    mergeFileCount: '1',
    currentFileCount: '0',
    unlockAfterCapture: false
  });

  const [errors, setErrors] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [showMergeFields] = useState(true);
  const [showUnlockOption] = useState(true);
  const [showValidationError, setShowValidationError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditAction, setAuditAction] = useState(null);
  const [auditCallback, setAuditCallback] = useState(null);

  const [clientOptions, setClientOptions] = useState([]);
  const [instrumentOptions, setInstrumentOptions] = useState([]);
  const [pathOptions, setPathOptions] = useState([]);
  const [limsOrderOptions, setLimsOrderOptions] = useState([]);
  const [fileName, setFileName] = useState('');

  const [templateOptions] = useState([
    { value: 'TP1', label: 'QC' },
    { value: 'TP2', label: 'Calibration' },
    { value: 'TP3', label: 'Method Development' },
    { value: 'TP4', label: 'Project' }
  ]);

  const [tags, setTags] = useState([
    { 
      tagName: 'Sample', 
      value: '', 
      required: true, 
      editable: true, 
      options: getOptionsForTag('Sample', 'TP1') 
    },
    { 
      tagName: 'Test', 
      value: '', 
      required: true, 
      editable: true, 
      options: getOptionsForTag('Test', 'TP1') 
    }
  ]);

  const { postData } = servicecall();
  const isInitialMount = useRef(true);

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

    return {
      sUserDomainName: getDecryptedValue("sDomainName") || "SDMS",
      sSessionID: getDecryptedValue("sSessionID") || "",
      sUserID: getDecryptedValue("sUserID") || "U1",
      sTimeZoneID: getDecryptedValue("sTimeZoneID") || "Asia/Kolkata<~>true",
      sApplicationName: "SDMS",
      sdbtype: getDecryptedValue("sdbtype") || "POSTGRESQL",
      sUsername: getDecryptedValue("sUsername") || "Administrator",
      sSiteCode: (getDecryptedValue("sSiteCode") || "CH        ").padEnd(10, ' ').substring(0, 10),
      sCategories: getDecryptedValue("sCategories") || "DB",
      sUserGroupID: (getDecryptedValue("sUserGroupID") || "G1        ").padEnd(10, ' ').substring(0, 10),
      sUserStatus: getDecryptedValue("sUserStatus") || "",
      sTenantID: getDecryptedValue("sTenantID") || ""
    };
  }, []);

  const makeAjaxCall = useCallback(async (url, passObjDet) => {
    try {
      console.log(`API call to ${url}:`, passObjDet);
      
      const response = await postData(url, passObjDet);
      
      console.log(`API response from ${url}:`, response);
      
      if (response === null || response === undefined) {
        console.error('No response from API for:', url);
        return null;
      }
      
      if (typeof response === 'string') {
        try {
          if (response.length > 50) {
            const decrypted = CF_decrypt(response);
            const parsed = JSON.parse(decrypted);
            console.log(`Decrypted response from ${url}:`, parsed);
            return parsed;
          } else {
            const parsed = JSON.parse(response);
            console.log(`Parsed response from ${url}:`, parsed);
            return parsed;
          }
        } catch (parseError) {
          console.warn(`Could not parse response from ${url}:`, response);
          return response;
        }
      }
      
      console.log(`Object response from ${url}:`, response);
      return response;
    } catch (error) {
      console.error(`AJAX call failed for ${url}:`, error);
      throw error;
    }
  }, [postData]);

  function getOptionsForTag(tagName, templateId) {
    if (tagName === 'Sample') {
      switch (templateId) {
        case 'TP1':
          return [
            { value: 'Caffeine Oral Citrate', label: 'Caffeine Oral Citrate' },
            { value: 'Pantoprazole tablets IP', label: 'Pantoprazole tablets IP' }
          ];
        case 'TP2':
          return [
            { value: 'Balance Monthly Calibration', label: 'Balance Monthly Calibration' }
          ];
        case 'TP3':
          return [
            { value: 'Method Development Sample', label: 'Method Development Sample' }
          ];
        case 'TP4':
          return [
            { value: 'Project Sample', label: 'Project Sample' }
          ];
        default:
          return [];
      }
    } else if (tagName === 'Test') {
      switch (templateId) {
        case 'TP1':
          return [
            { value: 'Assay by HPLC', label: 'Assay by HPLC' },
            { value: 'Identification', label: 'Identification' },
            { value: 'Disintegration time', label: 'Disintegration time' },
            { value: 'Dissolution', label: 'Dissolution' }
          ];
        case 'TP2':
          return [
            { value: 'Calibration Test', label: 'Calibration Test' }
          ];
        case 'TP3':
          return [
            { value: 'Method Development Test', label: 'Method Development Test' }
          ];
        case 'TP4':
          return [
            { value: 'Project Test', label: 'Project Test' }
          ];
        default:
          return [];
      }
    }
    return [];
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const activeUserDetails = getActiveUserDetails();
      
      const templateResponse = await makeAjaxCall("/InstrumentLock/ValidatingTemplateTobeLoad", {});
      console.log("Template validation response:", templateResponse);
      
      let featureStatus = false;
      if (templateResponse && Array.isArray(templateResponse) && templateResponse.length > 0) {
        featureStatus = templateResponse[0]?.L67Status ?? templateResponse[1]?.L67Status ?? false;
      }
      
      const clientResponse = await makeAjaxCall("/InstrumentLock/LoadClientList", {
        ActiveUserDetails: activeUserDetails,
        ApplicationCode: "SDMS",
        sFeature: featureStatus
      });
      
      if (clientResponse && Array.isArray(clientResponse)) {
        setClientOptions(clientResponse.map(client => ({
          value: client.sClientID,
          label: client.sClientName
        })));
      }
      
      const instrumentResponse = await makeAjaxCall("/InstrumentLock/LoadInstruments", {
        ActiveUserDetails: activeUserDetails,
        ApplicationCode: "SDMS"
      });
      
      if (instrumentResponse && Array.isArray(instrumentResponse)) {
        setInstrumentOptions(instrumentResponse.map(instrument => ({
          value: instrument.sInstrumentID,
          label: instrument.sInstrumentAliasName
        })));
      }
      
      const pathResponse = await makeAjaxCall("/InstrumentLock/LoadTaskSourcePaths", {
        ActiveUserDetails: activeUserDetails,
        ApplicationCode: "SDMS"
      });
      
      if (pathResponse && Array.isArray(pathResponse)) {
        setPathOptions(pathResponse.map(path => ({
          value: path.sTaskSourcePath,
          label: path.sTaskSourcePath
        })));
      }
      
      if (clientOptions.length > 0) {
        setFormData(prev => ({ ...prev, client: clientOptions[0].value }));
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formData.instrument && formData.template) {
      fetchTags();
    }
  }, [formData.instrument, formData.template]);

  const fetchTags = async () => {
    setIsLoadingTags(true);
    try {
      const requestBody = {
        sUserID: getActiveUserDetails().sUserID,
        ActiveUserDetails: getActiveUserDetails(),
        sInstrumentID: formData.instrument,
        ApplicationCode: "SDMS",
        sTemplateID: formData.template
      };
      
      console.log("Fetching tags with request:", requestBody);
      
      const response = await makeAjaxCall("InstrumentLock/LoadTagCategory", requestBody);
      
      if (!response) {
        console.log("No response from API, using static tags");
        setTags([
          { 
            tagName: 'Sample', 
            value: '', 
            required: true, 
            editable: true, 
            options: getOptionsForTag('Sample', formData.template) 
          },
          { 
            tagName: 'Test', 
            value: '', 
            required: true, 
            editable: true, 
            options: getOptionsForTag('Test', formData.template) 
          }
        ]);
        return;
      }
      
      let data = response;
      
      if (typeof response === 'string' && response.includes('<!DOCTYPE')) {
        console.error('API returned HTML instead of JSON. This might be a 404/500 error page.');
        throw new Error('API returned HTML error page');
      }
      
      if (typeof response === 'string' && response.length > 50) {
        try {
          console.log("Attempting to decrypt response...");
          const decrypted = CF_decrypt(response);
          console.log("Decrypted response:", decrypted);
          data = JSON.parse(decrypted);
        } catch (decryptError) {
          console.error('Failed to decrypt response:', decryptError);
          try {
            data = JSON.parse(response);
          } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
          }
        }
      }
      
      if (data && data.oResObj) {
        data = data.oResObj;
      }
      
      if (data && Array.isArray(data)) {
        console.log("Parsed tags data:", data);
        const transformedTags = data.map(item => ({
          tagName: item.L58TagName,
          value: item.Value || '',
          valueID: item.ValueID,
          tagID: item.L58TagID,
          order: item.L58Order,
          required: item.L58ValueStatus,
          editable: true,
          options: getOptionsForTag(item.L58TagName, formData.template)
        }));
        
        setTags(transformedTags);
      } else {
        console.log("No valid tags data, using static tags");
        setTags([
          { 
            tagName: 'Sample', 
            value: '', 
            required: true, 
            editable: true, 
            options: getOptionsForTag('Sample', formData.template) 
          },
          { 
            tagName: 'Test', 
            value: '', 
            required: true, 
            editable: true, 
            options: getOptionsForTag('Test', formData.template) 
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([
        { 
          tagName: 'Sample', 
          value: '', 
          required: true, 
          editable: true, 
          options: getOptionsForTag('Sample', formData.template) 
        },
        { 
          tagName: 'Test', 
          value: '', 
          required: true, 
          editable: true, 
          options: getOptionsForTag('Test', formData.template) 
        }
      ]);
    } finally {
      setIsLoadingTags(false);
    }
  };

  useEffect(() => {
    if (formData.template) {
      setTags(prev => prev.map(tag => ({
        ...tag,
        options: getOptionsForTag(tag.tagName, formData.template),
        value: ''
      })));
    }
  }, [formData.template]);

  const handleClientChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, client: value }));
    
    setLimsOrderOptions([]);
    setFormData(prev => ({ ...prev, limsOrder: '' }));
    
    if (value) {
      loadLimsOrders(value);
    }
  }, []);

  const loadLimsOrders = async (clientId) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/LoadLimsOrders", {
        sClientID: clientId,
        ActiveUserDetails: getActiveUserDetails(),
        ApplicationCode: "SDMS"
      });
      
      if (response && Array.isArray(response)) {
        setLimsOrderOptions(response.map(order => ({
          value: order.sLimsOrderID,
          label: order.sLimsOrderName
        })));
        
        if (response.length > 0) {
          setFormData(prev => ({ ...prev, limsOrder: response[0].sLimsOrderID }));
        }
      }
    } catch (error) {
      console.error('Error loading LIMS orders:', error);
    }
  };

  const handleInstrumentChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, instrument: value }));
    setErrors(prev => ({ ...prev, instrument: false }));
    
    if (value) {
      generateFileName(value);
    }
  }, []);

  const generateFileName = async (instrumentId) => {
    try {
      const response = await makeAjaxCall("/InstrumentLock/GenerateFileName", {
        sInstrumentID: instrumentId,
        ActiveUserDetails: getActiveUserDetails(),
        ApplicationCode: "SDMS"
      });
      
      if (response && response.sFileName) {
        setFileName(response.sFileName);
        setFormData(prev => ({ ...prev, fileName: response.sFileName }));
      }
    } catch (error) {
      console.error('Error generating file name:', error);
    }
  };

  const handlePathChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, path: value }));
    setErrors(prev => ({ ...prev, path: false }));
  }, []);

  const handleTemplateChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, template: value }));
    setErrors(prev => ({ ...prev, template: false }));
    setShowValidationError(false);
  }, []);

  const handleMergeCountChange = useCallback((value) => {
    const numValue = parseInt(value);
    if (numValue > 10000) {
      alert('Merge count cannot exceed 10000');
      setFormData(prev => ({ ...prev, mergeFileCount: '10000' }));
    } else {
      setFormData(prev => ({ ...prev, mergeFileCount: value }));
    }
  }, []);

  const handleTagValueClick = useCallback((index, value) => {
    setTags(prev => {
      const updatedTags = prev.map((t, idx) => {
        if (idx === index) {
          if (prev[index].tagName === 'Sample') {
            setShowValidationError(false);
            return { ...t, value };
          }
          return { ...t, value };
        }
        if (prev[index].tagName === 'Sample' && t.tagName === 'Test') {
          return { ...t, value: '' };
        }
        return t;
      });
      
      return updatedTags;
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.instrument) newErrors.instrument = true;
    if (!formData.path) newErrors.path = true;
    if (!formData.template) newErrors.template = true;
    if (!formData.fileName) newErrors.fileName = true;
    
    const missingTags = tags.filter(tag => tag.required && !tag.value);
    if (missingTags.length > 0) {
      const missingTagName = missingTags[0].tagName;
      
      if (missingTagName === 'Test' && !tags[0].value) {
        setShowValidationError(true);
        return false;
      }
      
      alert(`Select ${missingTagName} value`);
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, tags]);

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
      
      const tagValues = tags.map(tag => ({
        sTagID: tag.tagID || '0',
        sValue: tag.value,
        sValueID: tag.valueID || '0'
      }));

      const requestBody = {
        sTaskID: "", 
        sInstrumentID: formData.instrument,
        sClientID: formData.client,
        sTaskSourcePath: formData.path,
        sLimsOrderID: formData.limsOrder,
        sFileName: formData.fileName,
        sTemplateID: formData.template,
        sMergeFileCount: formData.mergeFileCount,
        sUnlockAfterCapture: formData.unlockAfterCapture ? "1" : "0",
        tagValues: tagValues,
        sSiteCode: activeUserDetails.sSiteCode,
        sUserID: activeUserDetails.sUserID,
        sUserGroupID: activeUserDetails.sUserGroupID,
        sSessionID: activeUserDetails.sSessionID,
        sApplicationName: activeUserDetails.sApplicationName,
        sUsername: activeUserDetails.sUsername,
        sAuditReason: auditData.reason,
        sAuditPassword: auditData.password,
        sAuditUserName: auditData.username
      };

      console.log("Lock request:", requestBody);
      const response = await makeAjaxCall("InstrumentLock/Lock", requestBody);
      
      console.log("Lock API Response:", response);
      
      if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
        setIsLocked(true);
        alert(response.Message || t('instrumentlocktag.instrumentlockedsuccessfully'));
      } else {
        alert(response?.Message || 'Failed to lock instrument');
      }
    } catch (error) {
      console.error('Error locking instrument:', error);
      alert('Error locking instrument');
    }
  }, [formData, tags, t, getActiveUserDetails, makeAjaxCall]);

  const performUnlockAction = useCallback(async (auditData) => {
    try {
      const activeUserDetails = getActiveUserDetails();

      const requestBody = {
        sInstrumentID: formData.instrument,
        sSiteCode: activeUserDetails.sSiteCode,
        sUserID: activeUserDetails.sUserID,
        sAuditReason: auditData.reason,
        sAuditPassword: auditData.password,
        sAuditUserName: auditData.username
      };

      console.log("Unlock request:", requestBody);
      const response = await makeAjaxCall("InstrumentLock/Unlock", requestBody);
      
      console.log("Unlock API Response:", response);
      
      if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
        setIsLocked(false);
        alert(response.Message || t('instrumentlocktag.instrumentunlockedsuccessfully'));
      } else {
        alert(response?.Message || 'Failed to unlock instrument');
      }
    } catch (error) {
      console.error('Error unlocking instrument:', error);
      alert('Error unlocking instrument');
    }
  }, [formData.instrument, t, getActiveUserDetails, makeAjaxCall]);

  const performUpdateAction = useCallback(async (auditData) => {
    try {
      const activeUserDetails = getActiveUserDetails();
      
      const tagValues = tags.map(tag => ({
        sTagID: tag.tagID || '0',
        sValue: tag.value,
        sValueID: tag.valueID || '0'
      }));

      const requestBody = {
        sInstrumentID: formData.instrument,
        sClientID: formData.client,
        sTaskSourcePath: formData.path,
        sLimsOrderID: formData.limsOrder,
        sFileName: formData.fileName,
        sTemplateID: formData.template,
        sMergeFileCount: formData.mergeFileCount,
        sUnlockAfterCapture: formData.unlockAfterCapture ? "1" : "0",
        tagValues: tagValues,
        sSiteCode: activeUserDetails.sSiteCode,
        sUserID: activeUserDetails.sUserID,
        sUserGroupID: activeUserDetails.sUserGroupID,
        sSessionID: activeUserDetails.sSessionID,
        sApplicationName: activeUserDetails.sApplicationName,
        sUsername: activeUserDetails.sUsername,
        sAuditReason: auditData.reason,
        sAuditPassword: auditData.password,
        sAuditUserName: auditData.username
      };

      console.log("Update request:", requestBody);
      const response = await makeAjaxCall("InstrumentLock/Update", requestBody);
      
      console.log("Update API Response:", response);
      
      if (response && response.Rtn && response.Rtn.toLowerCase() === 'success') {
        alert(response.Message || t('instrumentlocktag.instrumentupdatedsuccessfully'));
      } else {
        alert(response?.Message || 'Failed to update instrument');
      }
    } catch (error) {
      console.error('Error updating instrument:', error);
      alert('Error updating instrument');
    }
  }, [formData, tags, t, getActiveUserDetails, makeAjaxCall]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading instrument data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full text-[#405F7D] rounded-md font-roboto">
      <div className="bg-white px-4 py-4">
        <div className="max-w-[1100px]">
          <div className="grid grid-cols-2">
            <div className="max-w-[400px] ">
              <div className="mb-7">
                <label className="block text-[12px] text-[#405F7D] mb-0 font-semibold font-roboto">
                  {t('label.client')}
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.client}
                    onChange={(e) => handleClientChange(e.target.value)}
                    disabled={isLocked}
                    className="w-full h-7 px-0 text-xs bg-transparent border-0 border-b-2 border-gray-300 outline-none text-[#373737] font-semibold"
                    style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                  >
                    <option value="">Select Client</option>
                    {clientOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </AnimatedDropdown>
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-[12px] text-[#405F7D] mb-0 font-semibold font-roboto">
                  {t('label.instrument')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.instrument}
                    onChange={(e) => handleInstrumentChange(e.target.value)}
                    disabled={isLocked}
                    className={`w-full h-7 px-0 text-xs bg-transparent border-0 border-b-2 outline-none text-[#373737] font-semibold
                      ${errors.instrument ? 'border-red-400' : 'border-gray-300'}`}
                    style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                  >
                    <option value="">Select Instrument</option>
                    {instrumentOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </AnimatedDropdown>
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-[12px] text-[#405F7D] mb-0 font-semibold font-roboto">
                  {t('instrumentlocktag.path')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.path}
                    onChange={(e) => handlePathChange(e.target.value)}
                    disabled={isLocked}
                    className={`w-full h-7 px-0 text-xs bg-transparent border-0 border-b-2 outline-none text-[#373737] font-semibold
                      ${errors.path ? 'border-red-400' : 'border-gray-300'}`}
                    style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                  >
                    <option value="">Select Path</option>
                    {pathOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </AnimatedDropdown>
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-[#405F7D] mb-1 font-semibold text-[12px] font-roboto">
                  {t('instrumentlocktag.limsorder')}
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.limsOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, limsOrder: e.target.value }))}
                    disabled={isLocked}
                    className="w-full h-7 px-0 text-xs bg-transparent border-0 border-b-2 border-gray-300 outline-none text-[#373737] font-semibold"
                    style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                  >
                    <option value="">Select LIMS Order</option>
                    {limsOrderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </AnimatedDropdown>
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-[#405F7D] mb-1 font-semibold text-[12px] font-roboto">
                  {t('instrumentlocktag.filename')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={true} 
                  value={formData.fileName}
                  className={`w-full h-7 px-0 text-xs bg-transparent border-0 border-b-2 outline-none font-semibold
                    ${errors.fileName ? 'border-red-400 text-[#A94442]' : 'border-gray-300 text-[#373737]'}`}
                  style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                  readOnly
                />
              </div>

              <MergeFileCountRow
                mergeCount={formData.mergeFileCount}
                currentCount={formData.currentFileCount}
                onMergeChange={handleMergeCountChange}
                disabled={isLocked}
                showMergeFields={showMergeFields}
                t={t}
              />

              {showUnlockOption && (
                <InlineCheckbox
                  label={t('instrumentlocktag.unlockaftercapture')}
                  checked={formData.unlockAfterCapture}
                  onChange={(value) => setFormData(prev => ({ ...prev, unlockAfterCapture: value }))}
                  disabled={isLocked}
                />
              )}
            </div>

            <div  className='max-w-[1300px]'>
              <div className="max-w-[350px] ">
                <div className="mb-7">
                  <label className="block text-[12px] text-[#405F7D] mb-0 font-semibold font-roboto">
                    {t('instrumentlocktag.template')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <AnimatedDropdown
                      value={formData.template}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      disabled={isLocked}
                      className={`w-full h-7 px-0 text-xs bg-transparent border-0 border-b-2 outline-none text-[#373737] font-semibold
                        ${errors.template ? 'border-red-400' : 'border-gray-300'}`}
                      style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                    >
                      {templateOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </AnimatedDropdown>
                  </div>
                </div>
              </div>
              <div className="mt-7 max-w-[1300px] ">
                <div className="max-w-[550px] ">
                  {isLoadingTags ? (
                    <div className="flex justify-center items-center h-[250px]">
                      <div className="text-sm text-gray-500">Loading tags...</div>
                    </div>
                  ) : (
                    <TagGrid
                      tags={tags}
                      onTagValueClick={handleTagValueClick}
                      isLocked={isLocked}
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