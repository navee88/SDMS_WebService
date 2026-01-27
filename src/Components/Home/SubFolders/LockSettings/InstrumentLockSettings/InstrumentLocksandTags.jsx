import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import Errordialog from '../../../../Layout/Common/Errordialog';
import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { useInstrumentLock } from '../../../../../Context/InstrumentLockContext';

const LockIcon = () => (
  <i className="fa fa-lock text-xs mr-1"></i>
);

const UnlockIcon = () => (
  <i className="fa fa-unlock text-xs mr-1"></i>
);

const UpdateIcon = () => (
  <i className="fa fa-pencil-square-o text-xs mr-1"></i>
);

const EditPencilIcon = () => (
  <i className="fa fa-pencil text-xl mr-0.5"></i>
);

const MergeFileCountRow = ({ mergeCount, currentCount, onMergeChange, disabled, showMergeFields, t }) => {
  if (!showMergeFields) return null;
  
  const handleChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value) || 0;
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
            type="text"
            value={mergeCount}
            onChange={handleChange}
            onBlur={(e) => {
              if (e.target.value === '' || parseInt(e.target.value) < 1) {
                onMergeChange("1");
              }
            }}
            disabled={disabled}
            className="w-16 h-7 px-2 text-xs text-center font-['verdana'] border border-gray-300 rounded bg-white hover:border-gray-400 text-[#405F7D]"
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
            className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-[#405F7D] font-verdana"
          />
        </div>
      </div>
    </div>
  );
};

const InlineEditIcon = () => (
  <i className="fa fa-edit text-lg mr-1"></i>
);

const TagGrid = React.memo(({ tags, onTagValueClick, isLoadingTags, isLocked, lockedByOtherUser, isAutoLocked, onTagEditRequest, onInlineEditSubmit, t, tagErrors }) => {
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
  const [inlineEditState, setInlineEditState] = useState({
    isEditing: false,
    tagIndex: null,
    inputValue: ''
  });

  const showInformationMessage = (message) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  const canEditTag = useCallback((tagIndex) => {
    if (tagIndex === 0) return true;
    for (let i = 0; i < tagIndex; i++) {
      if (!tags[i]?.value) return false;
    }
    return true;
  }, [tags]);

  const getErrorMessage = useCallback((tagIndex) => {
    for (let i = tagIndex - 1; i >= 0; i--) {
      if (!tags[i]?.value) {
        return `${t('instrumentlocktag.pleaseselect')} ${tags[i]?.tagName} ${t('instrumentlocktag.value').toLowerCase()} first`;
      }
    }
    return `${t('instrumentlocktag.pleaseselect')} required ${t('instrumentlocktag.value').toLowerCase()} first`;
  }, [tags, t]);

  const handleEditClick = async (tag, index, event) => {
    event.stopPropagation();
    
    const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
    if (shouldDisableEdit) return;
    
    if (tag.required && tag.tagID !== 0) {
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
        
        if (top < 10) top = 10;
        if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
        if (left < 10) left = buttonRect.right + 10;
        if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
        
        return { top, left };
      };
      
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const position = calculateTooltipPositionFromRect(buttonRect);
      
      setSelectedTagIndex(index);
      
      if (tag.options && tag.options.length > 0) {
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
      
      setIsLoadingOptions(true);
      
      try {
        const options = await onTagEditRequest(index);
        
        setTooltipState({
          isOpen: true,
          tagIndex: index,
          position,
          searchTerm: '',
          selectedValue: tag.value || '',
          selectedValueID: tag.valueID || '',
          options: options || []
        });
      } catch (error) {
        showInformationMessage(t('instrumentlocktag.failedtoloadoptions'));
      } finally {
        setIsLoadingOptions(false);
      }
    } else {
      setInlineEditState({
        isEditing: true,
        tagIndex: index,
        inputValue: tag.value || ''
      });
    }
  };

  const handleInlineEditSubmit = () => {
    if (inlineEditState.tagIndex !== null && inlineEditState.inputValue !== undefined) {
      onInlineEditSubmit(
        inlineEditState.tagIndex,
        inlineEditState.inputValue,
        inlineEditState.inputValue
      );
    }
    setInlineEditState({
      isEditing: false,
      tagIndex: null,
      inputValue: ''
    });
  };

  const handleInlineEditCancel = () => {
    setInlineEditState({
      isEditing: false,
      tagIndex: null,
      inputValue: ''
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

  if (isLoadingTags) {
    return (
      <div className="border border-[#f3f3f3] rounded relative">
        <div className="flex justify-center items-center h-[250px]">
          <div className="text-sm text-gray-500">{t('common.loading')}...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border border-[#f3f3f3] rounded relative">
        <div className="grid grid-cols-2 bg-[#fbfbfb] border-b border-[#f3f3f3]">
          <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
            {t('instrumentlocktag.tagName')}
          </div>
          <div className="px-1 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
            {t('instrumentlocktag.tagValue')}
          </div>
        </div>
        
        <div className="bg-white min-h-[250px]">
          {tags.length === 0 ? (
            <div className="px-4 py-12 text-center text-xs text-[#4b4b4b] font-roboto">            
              {t('instrumentlocktag.noTagValue')}
            </div>
          ) : (
            tags.map((tag, idx) => {
              const isSelected = selectedTagIndex === idx;
              const isThisTagLoading = isLoadingOptions && isSelected;
              const isInlineEditing = inlineEditState.isEditing && inlineEditState.tagIndex === idx;
              const hasError = tagErrors[idx] && tag.required && !tag.value;
              
              const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
              const isDropdownMode = tag.required && tag.tagID !== 0;
              const showEditIcon = tag.editable && !shouldDisableEdit;
              
              return (
                <div 
                  key={`tag-${idx}-${tag.tagID}`}
                  className={`grid grid-cols-2 border-b border-[#e7e6e6] last:border-b-1 min-h-[40px]
                    ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#378cfc]' : 'bg-white border-l-4 border-l-transparent'}
                    ${hasError ? 'border-b-2 border-b-red-400' : ''}
                    ${tag.editable && !shouldDisableEdit ? 'cursor-pointer hover:bg-[#eef2f9]' : 'cursor-default'}
                  `}
                  onClick={() => setSelectedTagIndex(idx)}
                >
                  <div className={`px-4 text-xs flex items-center font-['verdana']
                    ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
                  `}>
                    {tag.tagName}
                    {tag.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  
                  <div className="px-0.5 py-0 text-xs flex items-center justify-between gap-0">
                    {isInlineEditing ? (
                      <div className="flex-1 flex items-center">
                        <input
                          type="text"
                          value={inlineEditState.inputValue}
                          onChange={(e) => setInlineEditState(prev => ({
                            ...prev,
                            inputValue: e.target.value
                          }))}
                          className={`w-full h-9 px-0.5 text-xs font-bold border border-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:border-white
                            ${hasError ? 'border-red-400' : ''}`}
                          autoFocus
                          onBlur={handleInlineEditSubmit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleInlineEditSubmit();
                            } else if (e.key === 'Escape') {
                              handleInlineEditCancel();
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <span className={`flex-1 font-['verdana'] ${
                          isSelected ? 'font-bold' : ''
                        } text-[#373737]`}>
                          {tag.value || ''}
                          {isThisTagLoading && (
                            <span className="ml-2 text-xs text-gray-500">{t('common.loading')}...</span>
                          )}
                        </span>
                        
                        {showEditIcon && (
                          <button
                            onClick={(e) => {
                              setSelectedTagIndex(idx);
                              handleEditClick(tag, idx, e);
                            }}
                            className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool"
                            title={t('button.edit')}
                            disabled={isThisTagLoading}
                          >
                            {isDropdownMode ? (
                              <EditPencilIcon />
                            ) : (
                              <InlineEditIcon />
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showErrorDialog && (
        <Errordialog
          message={errorMessage}
          type="information"
          onClose={() => setShowErrorDialog(false)}
          okText={t('button.ok')}
        />
      )}

      {tooltipState.isOpen && (
        <div 
          className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col"
          style={{
            top: `${tooltipState.position.top}px`,
            left: `${tooltipState.position.left}px`,
          }}
        >
          <div className="p-0.5 border-gray-200">
            <div className="mb-0">
              <input
                type="text"
                value={tooltipState.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
                autoFocus
                placeholder={t('instrumentlocktag.searchplaceholder')}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 font-roboto">
                {t('instrumentlocktag.nooptionsfound')}
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
                    className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
                      ${isSelected ? 'bg-[#f2f2f2]' : ''}
                      ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
                    `}
                  >
                    <div className="flex items-center ml-1">
                      <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
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
              className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
            >
              <i className="fa fa-check-square-o mr-1"></i>
              {t('button.submit')}
            </button>
            <button
              onClick={handleTooltipClose}
              className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
            >
              <i className="fa fa-times mr-1"></i>
              {t('button.cancel')}
            </button>
          </div>
        </div>
      )}
    </>
  );
});

TagGrid.displayName = 'TagGrid';

const InstrumentLockTag = ({ scheduleData }) => {
  const { t } = useTranslation();
  const { navigateAfterLock } = useInstrumentLock();
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
    loadProtocol: "InstrumentLock/LoadProtocol",
    lockLimsordercombo: "InstrumentLock/lockLimsordercombo",
    onChangeInstrumentCombo: "InstrumentLock/OnChangeInstrumentCombo",
    lockActiveParsingInstrumentCombo: "InstrumentLock/LockActiveParsingInstrumentCombo",
    lockDeactiveParsingInstrumentCombo: "InstrumentLock/LockDeactiveParsingInstrumentCombo",
    lockActiveInstrumentPathCombo: "InstrumentLock/LockActiveInstrumentPathCombo",
    lockDeactiveInstrumentPathCombo: "InstrumentLock/LockDeactiveInstrumentPathCombo",
    interfaceConnectionChecking: "InstrumentLock/InterfaceConnectionChecking",
    lockInstrument: "InstrumentLock/LockInstrument",
    unLockInstrument: "InstrumentLock/UnLockInstrument"
  };

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [errorDialogType, setErrorDialogType] = useState('information');
  const [errorDialogCallback, setErrorDialogCallback] = useState(null);

  const showErrorDialogMessage = (message, type = 'information', onConfirm = null) => {
    if (type === 'confirmation' && onConfirm) {
      setErrorDialogMessage(message);
      setErrorDialogType('confirmation');
      setErrorDialogCallback(() => onConfirm);
      setShowErrorDialog(true);
    } else {
      setErrorDialogMessage(message);
      setErrorDialogType(type);
      setErrorDialogCallback(null);
      setShowErrorDialog(true);
    }
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    setErrorDialogCallback(null);
  };

  const handleErrorDialogConfirm = () => {
    if (errorDialogCallback) {
      errorDialogCallback();
    }
    setShowErrorDialog(false);
    setErrorDialogCallback(null);
  };

  const getActiveUserDetails = useCallback(() => {
    const userDetails = CF_activeUserdetails();
    return {
      ...userDetails.ActiveUserDetails,
      sUserID: userDetails.ActiveUserDetails?.sUserID || userDetails.sUserID,
      sUsername: userDetails.ActiveUserDetails?.sUsername || userDetails.sUsername
    };
  }, []);

  const getSessionValue = (key) => {
    try {
      const value = sessionStorage.getItem(key);
      if (value === null) {
        switch(key) {
          case 'MergeCount': return '1';
          case 'FileName': return 'false';
          case 'L11ParserType': return '0';
          default: return "";
        }
      }
      return value;
    } catch {
      return "";
    }
  };

  const setSessionValue = (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // Silent error handling
    }
  };

  const makeAjaxCall = async (url, passObjDet, process) => {
    try {
      const userDetails = CF_activeUserdetails();
      
      let requestBody;
      
      if (url === endpoints.loadCategoryTagValueAndID) {
        requestBody = {
          passObjDet: passObjDet,
          ActiveUserDetails: userDetails.ActiveUserDetails,
          ApplicationCode: userDetails.ApplicationCode
        };
      } else {
        requestBody = {
          ...passObjDet,
          ActiveUserDetails: userDetails.ActiveUserDetails,
          ApplicationCode: userDetails.ApplicationCode
        };
      }
      
      const response = await postData(url, requestBody);
        
      if (!response) {
        return null;
      }
      
      if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
        throw new Error(response.Message || response.ErrorMessage || `${t('Auditpopup.somethingwentwrong')} ${url}`);
      }
      
      if (process === "InterfaceConnectionChecking") {
        let formattedResponse;
        
        if (response.AuditTrailLogin !== undefined) {
          return [response];
        }
        
        if (Array.isArray(response)) {
          formattedResponse = response;
        } else if (response && typeof response === 'object') {
          if (response.AccessStatus !== undefined) {
            formattedResponse = [response];
          } else if (response[0] && response[0].AccessStatus !== undefined) {
            formattedResponse = Object.values(response);
          } else {
            formattedResponse = [response];
          }
        } else {
          formattedResponse = [];
        }
        
        return formattedResponse;
      }
      
      if (process === "LockInstrument" || process === "UnLockInstrument") {
        return response;
      }
      
      if (process === "SelectPathFileUSerTemplate") {
        return response.oResInstChange || response;
      }
      
      if (response.oResObj !== undefined) {
        return response.oResObj;
      }
      
      if (response.oResInstChange !== undefined) {
        return response.oResInstChange;
      }
      
      if (response.list !== undefined) {
        return response.list;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return response;
      
    } catch (error) {
      throw error;
    }
  };

  const getDeactiveScheduleDataRef = useRef(scheduleData);
  const initialLoadDoneRef = useRef(false);

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
    user: '',
    lockID: '',
    interfaceOrderID: '',
    protocolID: '0'
  });

  const [errors, setErrors] = useState({});
  const [tagErrors, setTagErrors] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [showMergeFields, setShowMergeFields] = useState(false);
  const [showUnlockOption, setShowUnlockOption] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isInstrumentInterface, setIsInstrumentInterface] = useState(false);
  const [isFileNameEnabled, setIsFileNameEnabled] = useState(false);
  const [isLimsOrderEnabled, setIsLimsOrderEnabled] = useState(false);
  const [lockedByOtherUser, setLockedByOtherUser] = useState(false);
  const [isAutoLocked, setIsAutoLocked] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditAction, setAuditAction] = useState(null);
  const [auditCallback, setAuditCallback] = useState(null);

  const [templateOptions, setTemplateOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [instrumentOptions, setInstrumentOptions] = useState([]);
  const [pathOptions, setPathOptions] = useState([]);
  const [limsOrderOptions, setLimsOrderOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [tags, setTags] = useState([]);

  const tagIdToNameMap = {
    1: "Sample",
    2: "Test", 
    3: "Project",
    4: "BatchNo"
  };

  useEffect(() => {
    const device = sessionStorage.getItem("device") || "desktop";
    setDeviceType(device);
  }, []);

  const isInterfaceInstrument = useCallback((instrumentId) => {
    if (!instrumentId) return false;
    
    const idStr = instrumentId.toString().trim();
    const parts = idStr.split(':');
    return parts.length > 1 && parts[1] && parts[1].trim() !== "0";
  }, []);

  const loadTagValues = useCallback(async (tagId, templateId, instrumentId, tagIndex, previousTagValueID = "") => {
    try {
      const requestBody = {
        uid: tagIndex || 0,
        sUserID: formData.path || "",
        nTagID: parseInt(tagId) || 0,
        sTagValueID: previousTagValueID || "          ",
        sInstrumentID: instrumentId.padEnd(10, ' '),
        sTemplateID: templateId
      };
      
      const response = await makeAjaxCall(endpoints.loadCategoryTagValueAndID, requestBody);
      
      if (response && Array.isArray(response)) {
        const options = response.map(item => ({
          value: item.sTagValueID ? item.sTagValueID.trim() : '',
          label: item.sTagValue || t('instrumentlocktag.unknownvalue')
        })).filter(opt => opt.value && opt.label);
        
        return options;
      }
      
      return [];
      
    } catch (error) {
      return [];
    }
  }, [formData.path, t]);

  const fetchTags = useCallback(async (templateId, instrumentId) => {
    if (!templateId || !instrumentId) {
      setTags([]);
      return;
    }
    
    setIsLoadingTags(true);
    try {
      const currentInstrumentId = instrumentId.padEnd(10, ' ');
      
      const requestBody = {
        sUserID: formData.path || "",
        ActiveUserDetails: getActiveUserDetails(),
        sInstrumentID: currentInstrumentId,
        ApplicationCode: "SDMS",
        sTemplateID: templateId
      };
      
      const response = await makeAjaxCall(endpoints.loadTagCategory, requestBody);
      
      if (Array.isArray(response) && response.length > 0) {
        const transformedTags = await Promise.all(response.map(async (item, index) => {
          const tagId = item.L58TagID || item.L8iTagID || index;
          const tagName = tagIdToNameMap[tagId] || item.L58TagName || t('instrumentlocktag.unknowntag');
          const value = item.Value || '';
          const valueID = item.ValueID || '';
          const required = item.L58ValueStatus || false;
          const order = item.L58Order || index;
          
          let options = [];
          if (index === 0 && tagId && required) {
            options = await loadTagValues(tagId, templateId, instrumentId, index, "");
          }
          
          return {
            tagName: tagName,
            value: value.trim(),
            valueID: valueID ? valueID.trim() : '',
            tagID: tagId,
            order: order,
            required: required,
            editable: true,
            options: options
          };
        }));
        
        transformedTags.sort((a, b) => a.order - b.order);
        setTags(transformedTags);
        
      } else {
        setTags([]);
      }
    } catch (error) {
      setTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  }, [formData.path, loadTagValues, t]);

  const handleInlineEditSubmit = useCallback((index, value, valueID) => {
    setTags(prev => {
      const updatedTags = prev.map((t, idx) => {
        if (idx === index) {
          return { ...t, value, valueID };
        }
        
        if (idx > index) {
          return { ...t, value: '', valueID: '', options: [] };
        }
        
        return t;
      });
      
      return updatedTags;
    });
    
    if (value) {
      setTagErrors(prev => ({ ...prev, [index]: false }));
    }
  }, []);

  const checkMergeAndAutoUnlockSettings = useCallback(async () => {
    try {
      const response = await makeAjaxCall(endpoints.mergeFileAndAutoUnlock, {});
      
      if (response) {
        const showMerge = response.MergeCount?.[0]?.L67Status === false;
        setShowMergeFields(showMerge);
        
        const showUnlock = response.AutoUnlock?.[0]?.L67Status === false;
        setShowUnlockOption(showUnlock);
        
        if (response.MergeCountValue?.[0]?.L42ValueSettings) {
          const mergeCount = response.MergeCountValue[0].L42ValueSettings;
          setFormData(prev => ({ ...prev, mergeFileCount: mergeCount }));
          setSessionValue("MergeCount", mergeCount);
        }
        
        if (response.AutoUnlockValue?.[0]?.L42ValueSettings === "1") {
          setFormData(prev => ({ ...prev, unlockAfterCapture: true }));
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }, [t]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await makeAjaxCall(endpoints.lockUserCombo, {});
      
      if (Array.isArray(response) && response.length > 0) {
        const users = response.map(user => ({
          value: user.sUserID ? user.sUserID.trim() : '',
          label: user.sUserName || t('instrumentlocktag.unknownuser')
        }));
        
        setUserOptions(users);
        
        const activeUserDetails = getActiveUserDetails();
        const currentUserId = activeUserDetails.sUserID || "U1";
        
        const currentUser = users.find(user => user.value === currentUserId);
        if (currentUser) {
          setFormData(prev => ({ ...prev, user: currentUser.value }));
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }, [t]);

  const loadProtocol = useCallback(async (instrumentId) => {
    try {
      const response = await makeAjaxCall(endpoints.loadProtocol, {
        sInstrumentID: instrumentId
      });
      
      if (response) {
        const parserTypeValue = String(response.L11ParserType || '0');
        
        const fileNameEnabled = response.FileName === "true";
        setIsFileNameEnabled(fileNameEnabled);
        
        setSessionValue("FileName", fileNameEnabled.toString());
        setSessionValue("L11ParserType", parserTypeValue);
        
        const isInterface = isInterfaceInstrument(instrumentId);
        setIsInstrumentInterface(isInterface);
        
        if (isInterface) {
          if (fileNameEnabled) {
            setIsLimsOrderEnabled(false);
          } else {
            setIsLimsOrderEnabled(true);
          }
        } else {
          setIsLimsOrderEnabled(false);
        }
        
        return response;
      }
    } catch (error) {
      return null;
    }
  }, [isInterfaceInstrument, t]);

  const loadLimsOrder = useCallback(async (interfaceInstId) => {
    try {
      const response = await makeAjaxCall(endpoints.lockLimsordercombo, {
        nInterfaceInstID: interfaceInstId
      });
      
      if (Array.isArray(response) && response.length > 0) {
        const limsOrders = response.map(order => ({
          value: order.nOrderID ? String(order.nOrderID).trim() : '',
          label: order.LIMSOrder || t('instrumentlocktag.unknownorder'),
          orderID: order.nOrderID || '',
          sampleID: order.SampleID || '',
          testCode: order.TestCode || '',
          replicateID: order.ReplicateID || '',
          ...order
        }));
        
        setLimsOrderOptions(limsOrders);
        setIsLimsOrderEnabled(true);
        
        if (limsOrders.length > 0) {
          const firstOrder = limsOrders[0];
          setFormData(prev => ({ 
            ...prev, 
            limsOrder: firstOrder.value,
            limsOrderID: firstOrder.orderID,
            limsSampleID: firstOrder.sampleID,
            limsTestCode: firstOrder.testCode,
            limsReplicateID: firstOrder.replicateID
          }));
        }
        
        return limsOrders;
      } else {
        setLimsOrderOptions([]);
        setIsLimsOrderEnabled(false);
        setFormData(prev => ({ 
          ...prev, 
          limsOrder: '',
          limsOrderID: '',
          limsSampleID: '',
          limsTestCode: '',
          limsReplicateID: ''
        }));
        return [];
      }
    } catch (error) {
      setLimsOrderOptions([]);
      setIsLimsOrderEnabled(false);
      setFormData(prev => ({ 
        ...prev, 
        limsOrder: '',
        limsOrderID: '',
        limsSampleID: '',
        limsTestCode: '',
        limsReplicateID: ''
      }));
      return [];
    }
  }, [t]);

  const onChangeInstrumentCombo = useCallback(async (instrumentId) => {
  try {
    const nLLProStatus = 0;
    const nProtocolStatus = parseInt(formData.protocolID) || 0;
    const nProtocolStatusfile = isFileNameEnabled ? 101 : 0;
    
    const response = await makeAjaxCall(endpoints.onChangeInstrumentCombo, {
      sInstrumentID: instrumentId,
      nLLProStatus: nLLProStatus,
      nProtocolStatus: nProtocolStatus,
      nProtocolStatusfile: nProtocolStatusfile
    }, "SelectPathFileUSerTemplate");
    
    if (response) {
      const activeUserDetails = getActiveUserDetails();
      const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
      
      // Handle lock status
      if (response.sLockType === 'A') {
        setIsAutoLocked(true);
        setIsLocked(true);
        setLockedByOtherUser(false);
      } else if (response.sUserID) {
        setIsLocked(true);
        setIsAutoLocked(false);
        
        const responseUserId = response.sUserID ? response.sUserID.trim() : '';
        
        if (responseUserId === currentUserId) {
          setLockedByOtherUser(false);
        } else {
          setLockedByOtherUser(true);
        }
      } else {
        setIsLocked(false);
        setIsAutoLocked(false);
        setLockedByOtherUser(false);
      }
      
      const updates = {};
      
      if (response.sFileName) {
        updates.fileName = response.sFileName;
      }
      
      if (response.nCurMergeFileNo > 0) {
        updates.currentFileCount = String(response.nCurMergeFileNo);
      } else {
        updates.currentFileCount = '0';
      }
      
      if (response.nMergeFileCount > 0) {
        updates.mergeFileCount = String(response.nMergeFileCount);
        setSessionValue("LockedMergeCount", String(response.nMergeFileCount));
      } else if (response.sTaskID != null) {
        const lockedMergeCount = getSessionValue("LockedMergeCount");
        if (lockedMergeCount) {
          updates.mergeFileCount = lockedMergeCount;
        } else {
          updates.mergeFileCount = getSessionValue("MergeCount") || '1';
        }
      } else {
        updates.mergeFileCount = getSessionValue("MergeCount") || '1';
      }
      
      if (response.nAutoUnlock) {
        updates.unlockAfterCapture = true;
      } else {
        updates.unlockAfterCapture = false;
      }
      
      if (response.sLockID) {
        updates.lockID = response.sLockID;
      } else {
        updates.lockID = '';
      }
      
      if (response.nInterFaceOrderID) {
        updates.interfaceOrderID = String(response.nInterFaceOrderID);
      } else {
        updates.interfaceOrderID = '';
      }
      
      // ✅ FIX: Auto-select first template for auto-locked instruments
      if (response.sLockType === 'A' && templateOptions.length > 0) {
        const firstTemplateValue = templateOptions[0].value;
        updates.template = firstTemplateValue;
      } else if (response.sTemplateID) {
        // For user-locked instruments, use the template they used
        updates.template = response.sTemplateID;
      }
      // If not locked, template remains empty
      
      setFormData(prev => ({ ...prev, ...updates }));
      
      // ✅ If template was set (auto-locked or user-locked), return response
      // The useEffect will automatically load tags for the template
      
      return response;
    }
  } catch (error) {
    console.error('Error in onChangeInstrumentCombo:', error);
    return null;
  }
}, [formData.protocolID, isFileNameEnabled, templateOptions]);

  const loadPaths = useCallback(async (instrumentId) => {
    try {
      let endpoint = endpoints.lockPathCombo;
      let requestBody = {
        sInstrumentID: instrumentId,
        sScheduleID: ""
      };
      
      if (getDeactiveScheduleDataRef.current) {
        const scheduleData = getDeactiveScheduleDataRef.current;
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
      
      if (Array.isArray(response) && response.length > 0) {
        const pathOptionsData = response.map(path => ({
          value: path.sTaskID || path.L13ScheduleID || '',
          label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
          originalItem: path
        }));
        
        setPathOptions(pathOptionsData);
        
        if (pathOptionsData.length > 0) {
          const firstPath = pathOptionsData[0];
          setFormData(prev => ({ ...prev, path: firstPath.value }));
          
          if (formData.template) {
            fetchTags(formData.template, instrumentId);
          }
        }
      } else {
        setPathOptions([]);
      }
    } catch (error) {
      setPathOptions([]);
    }
  }, [formData.template, fetchTags, t]);

  const loadInstruments = useCallback(async (clientId) => {
  try {
    let endpoint = endpoints.lockInstrumentCombo;
    let requestBody = {
      sClientID: clientId,
      sScheduleID: ""
    };
    
    if (getDeactiveScheduleDataRef.current) {
      const scheduleData = getDeactiveScheduleDataRef.current;
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
    
    if (Array.isArray(response) && response.length > 0) {
      const instrumentOptionsData = response.map(instrument => ({
        value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
        label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
        originalItem: instrument
      }));
      
      setInstrumentOptions(instrumentOptionsData);
      
      // ✅ CRITICAL FIX: Auto-select and load first instrument
      if (instrumentOptionsData.length > 0) {
        const firstInstrument = instrumentOptionsData[0];
        
        // Trigger the COMPLETE instrument change flow
        // This ensures everything loads just like manual selection
        setIsLoading(true);
        
        try {
          // Step 1: Update instrument in state and clear dependent fields
          setFormData(prev => ({ 
            ...prev, 
            instrument: firstInstrument.value,
            path: '',
            fileName: '',
            limsOrder: '',
            limsOrderID: '',
            limsSampleID: '',
            limsTestCode: '',
            limsReplicateID: '',
            template: '', // Clear template - will be set from backend if locked
            mergeFileCount: getSessionValue("MergeCount") || '1',
            currentFileCount: '0'
          }));
          
          setErrors(prev => ({ ...prev, instrument: false }));
          
          // Clear tags and errors
          setTags([]);
          setTagErrors({});
          setPathOptions([]);
          
          // Step 2: Check if instrument is interface type
          const isInterface = isInterfaceInstrument(firstInstrument.value);
          
          // Step 3: Load protocol settings
          await loadProtocol(firstInstrument.value);
          
          // Step 4: Load LIMS orders if interface instrument
          if (isInterface) {
            const interfaceInstId = firstInstrument.value.includes(':') ? 
              parseInt(firstInstrument.value.split(':')[1].trim()) : 0;
            
            if (interfaceInstId > 0) {
              await loadLimsOrder(interfaceInstId);
            }
          } else {
            setLimsOrderOptions([]);
            setIsLimsOrderEnabled(false);
          }
          
          // Step 5: Get instrument lock status and data from backend
          const instrumentData = await onChangeInstrumentCombo(firstInstrument.value);
          
          if (instrumentData) {
            const updates = {};
            
            // Set current file count
            if (instrumentData.nCurMergeFileNo > 0) {
              updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
            } else {
              updates.currentFileCount = '0';
            }
            
            // Set merge file count
            const lockedMergeCount = getSessionValue("LockedMergeCount");
            if (instrumentData.sTaskID && lockedMergeCount) {
              // Instrument is locked, use locked merge count
              updates.mergeFileCount = lockedMergeCount;
            } else if (instrumentData.nMergeFileCount > 0) {
              updates.mergeFileCount = String(instrumentData.nMergeFileCount);
              setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
            } else {
              updates.mergeFileCount = getSessionValue("MergeCount") || '1';
            }
            
// ✅ CRITICAL: Set template from backend if instrument is locked
if (instrumentData.sTemplateID && instrumentData.sTaskID) {
  // Instrument is locked by user, use its template
  updates.template = instrumentData.sTemplateID;
  console.log('Auto-loading template from locked instrument:', instrumentData.sTemplateID);
}
// ✅ NEW: If auto-locked, use first template (QC)
else if (instrumentData.sLockType === 'A') {
  if (templateOptions.length > 0) {
    const firstTemplateValue = templateOptions[0].value;
    updates.template = firstTemplateValue;
    console.log('Auto-locked instrument - loading first template:', firstTemplateValue);
  }
}
            // If instrument is not locked, template remains empty (user must select)
            
            setFormData(prev => ({ ...prev, ...updates }));
            
            // ✅ If template was set, tags will load automatically via useEffect
            // The useEffect watching formData.template will trigger fetchTags()
          }
          
          // Step 6: Load paths for the instrument
          await loadPaths(firstInstrument.value);
          
          console.log('First instrument auto-loaded:', firstInstrument.value);
          
        } catch (error) {
          console.error('Error auto-loading first instrument:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setInstrumentOptions([]);
    }
  } catch (error) {
    console.error('Error loading instruments:', error);
    setInstrumentOptions([]);
    setIsLoading(false);
  }
}, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
    isInterfaceInstrument, isLocked, t]);

  const loadClients = useCallback(async () => {
    try {
      const preselectedClientId = scheduleData?.L06ClientID;
      const taskStatus = scheduleData?.TaskType !== "ScheduleCreation" ? 'D' : 'A';
      
      const response = await makeAjaxCall(endpoints.clientLockCombo, {
        sTaskStatus: taskStatus,
        sClientID: preselectedClientId
      });
      
      if (Array.isArray(response) && response.length > 0) {
        const clientOptionsData = response.map(client => ({
          value: client.sClientID ? client.sClientID.trim() : '',
          label: client.sClientName || t('instrumentlocktag.unknownclient')
        }));
        
        setClientOptions(clientOptionsData);
        
        let clientToSelect = null;
        
        if (preselectedClientId) {
          clientToSelect = clientOptionsData.find(client => client.value === preselectedClientId);
        }
        
        if (!clientToSelect && clientOptionsData.length > 0) {
          clientToSelect = clientOptionsData[0];
        }
        
        if (clientToSelect) {
          setFormData(prev => ({ ...prev, client: clientToSelect.value }));
          await loadInstruments(clientToSelect.value);
        }
      } else {
        setClientOptions([]);
      }
    } catch (error) {
      setClientOptions([]);
    }
  }, [scheduleData, loadInstruments, t]);

  const loadTagOptions = useCallback(async (tagIndex) => {
    if (!formData.template || !tags[tagIndex]) return [];
    
    const tag = tags[tagIndex];
    
    let previousTagValueID = "";
    if (tagIndex > 0) {
      previousTagValueID = tags[tagIndex - 1].valueID || "          ";
    }
    
    try {
      const options = await loadTagValues(
        tag.tagID, 
        formData.template, 
        formData.instrument,
        tagIndex,
        previousTagValueID
      );
      
      return options || [];
    } catch (error) {
      return [];
    }
  }, [formData.template, formData.instrument, tags, loadTagValues, t]);

  const handleTagValueClick = useCallback((index, value, valueID) => {
    setTags(prev => {
      const updatedTags = prev.map((t, idx) => {
        if (idx === index) {
          return { ...t, value, valueID };
        }
        
        if (idx > index) {
          return { ...t, value: '', valueID: '', options: [] };
        }
        
        return t;
      });
      
      return updatedTags;
    });
    
    if (value) {
      setTagErrors(prev => ({ ...prev, [index]: false }));
    }
    
    if (index < tags.length - 1) {
      loadTagOptions(index + 1).then(options => {
        if (options.length > 0) {
          setTags(prev => prev.map((tag, idx) => 
            idx === index + 1 ? { ...tag, options } : tag
          ));
        }
      });
    }
  }, [tags, loadTagOptions]);

  const handleTagEditRequest = useCallback(async (tagIndex) => {
    if (tags[tagIndex] && tags[tagIndex].options && tags[tagIndex].options.length > 0) {
      return tags[tagIndex].options;
    }
    
    const options = await loadTagOptions(tagIndex);
    
    setTags(prev => prev.map((tag, idx) => 
      idx === tagIndex ? { ...tag, options } : tag
    ));
    
    return options;
  }, [tags, loadTagOptions]);

  const showFullPageLoader = isLoading || isSubmitting || isLoadingTags || isLoadingOptions;
  
  useEffect(() => {
  if (initialLoadDoneRef.current) return;
  
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      await checkMergeAndAutoUnlockSettings();
      await loadUsers();
      
      const activeUserDetails = getActiveUserDetails();
      const templateResponse = await makeAjaxCall(endpoints.lockTemplateCombo, {
        ActiveUserDetails: activeUserDetails,
        ApplicationCode: "SDMS"
      });
      
      if (Array.isArray(templateResponse) && templateResponse.length > 0) {
        const templates = templateResponse
          .map(template => ({
            value: String(template.sTemplateID || '').trim(),
            label: String(template.sTemplateName || '').trim()
          }))
          .filter(template => template.value && template.label && template.value !== 'undefined');
        
        const order = ['QC', 'Calibration', 'Method Development', 'Project'];
        const sortedTemplates = templates.sort((a, b) => {
          const labelA = a.label || '';
          const labelB = b.label || '';
          
          const indexA = order.findIndex(pattern => labelA.includes(pattern));
          const indexB = order.findIndex(pattern => labelB.includes(pattern));
          
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          
          return labelA.localeCompare(labelB);
        });
        
        setTemplateOptions(sortedTemplates);
        
        // ✅ CRITICAL FIX: DO NOT auto-select template
        // Template should be:
        // 1. Empty until user selects it OR
        // 2. Set from backend if instrument is already locked
        // REMOVED: 
        // if (sortedTemplates.length > 0) {
        //   const firstTemplateValue = sortedTemplates[0].value;
        //   setFormData(prev => ({ ...prev, template: firstTemplateValue }));
        // }
      }
      
      await loadClients();
      initialLoadDoneRef.current = true;
      
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  loadData();
}, []);

// ============================================================================
// FIX #2: Template-Based Tag Loading - Check for Valid Template
// ============================================================================

useEffect(() => {
  // This will trigger when template is set from loadInstruments or handleInstrumentChange
  if (formData.template && formData.template.trim() !== '' && formData.instrument) {
    console.log('Loading tags for template:', formData.template, 'instrument:', formData.instrument);
    fetchTags(formData.template, formData.instrument);
  } else {
    setTags([]);
  }
}, [formData.template, formData.instrument, fetchTags]);

  const handleClientChange = useCallback(async (value) => {
    setFormData(prev => ({ ...prev, client: value, instrument: '', path: '', fileName: '', limsOrder: '' }));
    setErrors(prev => ({ ...prev, client: false }));
    
    setInstrumentOptions([]);
    setPathOptions([]);
    setLimsOrderOptions([]);
    setTags([]);
    setTagErrors({});
    
    if (value) {
      setIsLoading(true);
      try {
        await loadInstruments(value);
      } finally {
        setIsLoading(false);
      }
    }
  }, [loadInstruments]);

  const handleInstrumentChange = useCallback(async (value) => {
  setIsLoading(true);
  
  // ✅ CRITICAL FIX: Reset template when instrument changes
  setFormData(prev => ({ 
    ...prev, 
    instrument: value, 
    path: '', 
    fileName: '', 
    limsOrder: '',
    limsOrderID: '',
    limsSampleID: '',
    limsTestCode: '',
    limsReplicateID: '',
    mergeFileCount: getSessionValue("MergeCount") || '1',
    currentFileCount: '0'
  }));
  setErrors(prev => ({ ...prev, instrument: false }));
  
  setPathOptions([]);
  
  // ✅ CRITICAL FIX: Clear tags and errors when instrument changes
  setTags([]);
  setTagErrors({});
  
  if (value) {
    try {
      const isInterface = isInterfaceInstrument(value);
      
      await loadProtocol(value);
      
      if (isInterface) {
        const interfaceInstId = value.includes(':') ? 
          parseInt(value.split(':')[1].trim()) : 0;
        
        if (interfaceInstId > 0) {
          await loadLimsOrder(interfaceInstId);
        }
      } else {
        setLimsOrderOptions([]);
        setIsLimsOrderEnabled(false);
        setFormData(prev => ({ 
          ...prev, 
          limsOrder: '',
          limsOrderID: '',
          limsSampleID: '',
          limsTestCode: '',
          limsReplicateID: ''
        }));
      }
      
      // ✅ CRITICAL FIX: Get instrument data which may include template
      const instrumentData = await onChangeInstrumentCombo(value);
      
      if (instrumentData) {
        const updates = {};
        
        if (instrumentData.nCurMergeFileNo > 0) {
          updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
        } else {
          updates.currentFileCount = '0';
        }
        
        const lockedMergeCount = getSessionValue("LockedMergeCount");
        if (isLocked && lockedMergeCount) {
          updates.mergeFileCount = lockedMergeCount;
        } else {
          updates.mergeFileCount = getSessionValue("MergeCount") || '1';
        }
        
// ✅ CRITICAL FIX: Set template from backend if instrument is locked
if (instrumentData.sTemplateID && instrumentData.sTaskID) {
  // Instrument is locked by user, use its template
  updates.template = instrumentData.sTemplateID;
}
// ✅ NEW: If auto-locked, use first template (QC)
else if (instrumentData.sLockType === 'A') {
  if (templateOptions.length > 0) {
    const firstTemplateValue = templateOptions[0].value;
    updates.template = firstTemplateValue;
    console.log('Auto-locked instrument - loading first template:', firstTemplateValue);
  }
}
        // If instrument is not locked, template remains empty (set above)
        
        setFormData(prev => ({ ...prev, ...updates }));
        
        // ✅ If template was set from backend, tags will load via useEffect
        // If template is empty, user must select it manually
      }
      
      await loadPaths(value);
      
      // Note: Tags will be loaded automatically by useEffect when template is set
      
    } finally {
      setIsLoading(false);
    }
  } else {
    setIsLoading(false);
  }
}, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
    isInterfaceInstrument, isLocked, templateOptions, t]);

  useEffect(() => {
    if (formData.instrument) {
      const refreshData = async () => {
        try {
          setIsLoading(true);
          const response = await onChangeInstrumentCombo(formData.instrument);
          if (response) {
            setFormData(prev => ({
              ...prev,
              currentFileCount: response.nCurMergeFileNo > 0 ? String(response.nCurMergeFileNo) : '0',
              mergeFileCount: response.nMergeFileCount > 0 ? String(response.nMergeFileCount) : getSessionValue("MergeCount") || '1'
            }));
          }
        } catch (error) {
          // Silent error handling
        } finally {
          setIsLoading(false);
        }
      };
      
      refreshData();
    }
  }, [isLocked, formData.instrument]);

  const handlePathChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, path: value }));
    setErrors(prev => ({ ...prev, path: false }));
  }, []);

  const handleTemplateChange = useCallback((value) => {
  setFormData(prev => ({ ...prev, template: value }));
  setErrors(prev => ({ ...prev, template: false }));
  
  // ✅ Clear tags and errors before loading new ones
  setTags([]);
  setTagErrors({});
  
  // Tags will be loaded by useEffect that watches formData.template
}, []);

  const handleMergeCountChange = useCallback((value) => {
    const numValue = parseInt(value) || 0;
    
    if (numValue > 10000) {
      setFormData(prev => ({ ...prev, mergeFileCount: '10000' }));
      setErrors(prev => ({ ...prev, mergeFileCount: t('instrumentlocktag.mergecountexceed') }));
      return;
    }
    
    if (numValue < 1 && value !== '') {
      setFormData(prev => ({ ...prev, mergeFileCount: '1' }));
    } else {
      setFormData(prev => ({ ...prev, mergeFileCount: value }));
      setErrors(prev => ({ ...prev, mergeFileCount: '' }));
    }
  }, [t]);

  const validateFormForLock = useCallback(() => {
  const newErrors = {};
  const newTagErrors = {};
  let isValid = true;
  
  if (!formData.instrument) {
    newErrors.instrument = true;
    isValid = false;
  }
  
  if (!formData.path) {
    newErrors.path = true;
    isValid = false;
  }
  
  // ✅ CRITICAL FIX: Validate that template is selected
  if (!formData.template || formData.template.trim() === '') {
    newErrors.template = true;
    isValid = false;
  }
  
  const isInterface = isInterfaceInstrument(formData.instrument);
  
  if (isInterface) {
    if (isFileNameEnabled && !formData.fileName) {
      newErrors.fileName = true;
      isValid = false;
    }
    
    const mergeNum = parseInt(formData.mergeFileCount) || 0;
    const currentNum = parseInt(formData.currentFileCount) || 0;
    
    if (mergeNum > 10000) {
      newErrors.mergeFileCount = t('instrumentlocktag.mergecountexceed');
      isValid = false;
    }
    
    if (mergeNum < currentNum) {
      newErrors.mergeFileCount = t('instrumentlocktag.mergecountnotlessthancurrent', 
        { count: formData.currentFileCount });
      isValid = false;
    }
    
    if (isLimsOrderEnabled && !formData.limsOrder) {
      newErrors.limsOrder = true;
      isValid = false;
    }
  }
  
  // Validate required tags
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].required && !tags[i].value) {
      newTagErrors[i] = true;
      isValid = false;
    }
  }
  
  setErrors(newErrors);
  setTagErrors(newTagErrors);
  
  return isValid;
}, [formData, tags, isFileNameEnabled, isLimsOrderEnabled, isInterfaceInstrument, t]);

  const prepareLockData = useCallback((auditData = null, validationType = "CheckAndInsert") => {
    const activeUserDetails = getActiveUserDetails();
    const isInterface = isInterfaceInstrument(formData.instrument);
    
    const instrumentId = (formData.instrument || "").padEnd(10, ' ');
    const templateId = (formData.template || '').padEnd(10, ' ');
    const userId = (formData.user || activeUserDetails.sUserID || '').padEnd(10, ' ');
    
    const lockData = {
      sInstrumentName: instrumentOptions.find(i => i.value === formData.instrument)?.label || '',
      lockinstdetails: {
        sInstrumentID: instrumentId,
        sTaskID: formData.path,
        sTaskSourcePath: pathOptions.find(p => p.value === formData.path)?.label || '',
        sFileName: formData.fileName,
        sTemplateID: templateId,
        sUserID: userId,
        nMergeFileCount: parseInt(formData.mergeFileCount) || 1,
        nAutoUnlock: formData.unlockAfterCapture ? 1 : 0,
        nInterFaceOrderID: parseInt(formData.interfaceOrderID) || 0,
        nProtocolStatus: parseInt(formData.protocolID) || 0,
        nLLProStatus: isFileNameEnabled ? 1 : 0,
        sScheduleID: pathOptions.find(p => p.value === formData.path)?.originalItem?.L13ScheduleID || ''
      },
      sTemplateName: templateOptions.find(t => t.value === formData.template)?.label || '',
      lInstTagValue: tags.map(tag => ({
        L58TagID: tag.tagID,
        Value: tag.value || '',
        L58ValueStatus: tag.required || false,
        L58TagName: tag.tagName,
        ValueID: tag.valueID || '',
        LoadMasterValue: " ",
        L58Order: tag.order || 0
      })),
      sValidation: validationType,
      sSendLabel: isLocked ? t('button.update') : t('button.lock'),
      ManualOrder: false,
      LIMSobj: null,
      ActiveUserDetails: activeUserDetails,
      ApplicationCode: "SDMS"
    };
    
    if (auditData) {
      lockData.lockinstdetails.AuditTrailValues = auditData;
    }
    
    if (isInterface) {
      lockData.lockinstdetails.audittrailforinterfaceinstrument = true;
    }
    
    if (isLimsOrderEnabled && formData.limsOrder) {
      const limsOrderItem = limsOrderOptions.find(lo => lo.value === formData.limsOrder);
      if (limsOrderItem) {
        lockData.ManualOrder = false;
        const returnObject = {};
        Object.keys(limsOrderItem).forEach(key => {
          if (!['uid', 'boundindex', 'uniqueid', 'visibleindex'].includes(key)) {
            returnObject[key] = limsOrderItem[key];
          }
        });
        lockData.LIMSobj = returnObject;
      }
    }
    
    const encodeXmlText = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    
    const templateName = lockData.sTemplateName;
    const encodedTemplateName = encodeXmlText(templateName);
    
    let xMasterXml = "<Sheet1>";
    let xDetailsXml = "<Sheet1>";
    
    xMasterXml += "<Row>";
    xMasterXml += `<Template>${encodedTemplateName}</Template>`;
    
    xDetailsXml += `<Row><Category>Template</Category><Value>${encodedTemplateName}</Value></Row>`;
    
    tags.forEach(tag => {
      if (tag.value) {
        const encodedTagName = encodeXmlText(tag.tagName);
        const encodedTagValue = encodeXmlText(tag.value);
        
        xMasterXml += `<${encodedTagName}>${encodedTagValue}</${encodedTagName}>`;
        xDetailsXml += `<Row><Category>${encodedTagName}</Category><Value>${encodedTagValue}</Value></Row>`;
      }
    });
    
    xMasterXml += "</Row></Sheet1>";
    xDetailsXml += "</Sheet1>";
    
    lockData.lockinstdetails.xMasterXml = xMasterXml;
    lockData.lockinstdetails.xDetailsXml = xDetailsXml;
    
    return lockData;
  }, [formData, tags, instrumentOptions, pathOptions, templateOptions, 
      isFileNameEnabled, isLimsOrderEnabled, isLocked, limsOrderOptions, isInterfaceInstrument, t]);

  const performLockAction = useCallback(async (auditData = null, validationType = "CheckAndInsert") => {
    try {
      const lockData = prepareLockData(auditData, validationType);
      
      const isInterface = isInterfaceInstrument(formData.instrument);
      if (isInterface && auditData) {
        lockData.lockinstdetails.audittrailforinterfaceinstrument = false;
      }
      
      await performLockActionWithData(lockData);
    } catch (error) {
      showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, tags, prepareLockData, t]);

  const performLockActionWithData = async (lockData) => {
    try {
      setIsSubmitting(true);
      const result = await makeAjaxCall(endpoints.lockInstrument, lockData, "LockInstrument");
      
      if (result?.oResObj?.bStatus === true) {
        const successMessage = result.oResObj.sInformation || t('instrumentlocktag.instrumentlockedsuccessfully');
        
        setIsLocked(true);
        setIsAutoLocked(false);
        setLockedByOtherUser(false);
        
        if (result.oResObj.nMergeFileCount) {
          setFormData(prev => ({ 
            ...prev, 
            mergeFileCount: String(result.oResObj.nMergeFileCount) 
          }));
          setSessionValue("LockedMergeCount", String(result.oResObj.nMergeFileCount));
        } else if (result.oResObj.mergeFileCount) {
          setFormData(prev => ({ 
            ...prev, 
            mergeFileCount: String(result.oResObj.mergeFileCount) 
          }));
          setSessionValue("LockedMergeCount", String(result.oResObj.mergeFileCount));
        }
        
        const instrumentId = result.oResObj.sInstrumentID || formData.instrument;
        
        if (instrumentId) {
          const cleanInstrumentId = instrumentId.toString().trim();
          navigateAfterLock(cleanInstrumentId);
        }
        
        showErrorDialogMessage(
          `${result.oResObj.sInstrument || t('label.instrument')} ${successMessage}`,
          'success'
        );
        
      } else {
        const errorInfo = result?.oResObj?.sInformation;
        
        if (errorInfo === "Entering Duplicate Tag Values" || 
            (errorInfo === "Tags has already been used. Do you want to re-use same tags for New Data Capture?" && 
             result?.oResObj?.sValidation === "CheckAndInsert")) {
          showErrorDialogMessage(
            t('instrumentlocktag.confirmationtagsalreadyexist'),
            'confirmation',
            async () => {
              lockData.sValidation = "Insert";
              lockData.lockinstdetails.sValidation = "Insert";
              await performLockActionWithData(lockData);
            }
          );
          return;
        }
        
        if (errorInfo === "Merge Break") {
          showErrorDialogMessage(t('instrumentlocktag.mergebreak'), 'error');
        } else if (errorInfo === "This instrument is already locked by other user") {
          showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadylockedbyotheruser'), 'error');
          setIsLocked(true);
          setLockedByOtherUser(true);
        } else if (errorInfo === "Merge Count should not be Lesser than Current Parsing Count") {
          showErrorDialogMessage(t('instrumentlocktag.mergecountshouldnotbelesserthancurrentparsingcount'), 'error');
        } else if (errorInfo) {
          showErrorDialogMessage(errorInfo, 'error');
        } else {
          showErrorDialogMessage(t('instrumentlocktag.failedtolockinstrument'), 'error');
        }
      }
    } catch (error) {
      showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

const handleUnlockSuccess = useCallback(async (result) => {
  const successMessage = result?.oResObj?.sInformation || t('instrumentlocktag.instrumentunlockedsuccessfully');
  const instrumentName = result?.oResObj?.sInstrument || t('label.instrument');
  
  setIsLocked(false);
  setIsAutoLocked(false);
  setLockedByOtherUser(false);
  
  // ✅ FIX: Keep the CURRENT template after unlock, just clear tag values
  // Don't change to first template - keep the current one
  const currentTemplate = formData.template;
  
  setFormData(prev => ({
    ...prev,
    fileName: '',
    mergeFileCount: getSessionValue("MergeCount") || '1',
    currentFileCount: '0',
    lockID: '',
    interfaceOrderID: '',
    unlockAfterCapture: false,
    limsOrder: '',
    limsOrderID: '',
    limsSampleID: '',
    limsTestCode: '',
    limsReplicateID: '',
    template: currentTemplate // ✅ Keep current template instead of switching to first
  }));
  
  setErrors({});
  setTagErrors({});
  
  // ✅ Clear tag values but keep the tags structure
  setTags(prev => prev.map(tag => ({
    ...tag,
    value: '',
    valueID: '',
    options: tag.tagID === 1 ? tag.options : [] // Keep options for first tag if any
  })));
  
  showErrorDialogMessage(
    `${instrumentName} ${successMessage}`,
    'success'
  );
}, [t, formData.template]); // Add formData.template to dependencies

  const prepareUnlockData = useCallback((auditData = null, mergebreak = "true") => {
    const activeUserDetails = getActiveUserDetails();
    const pathItem = pathOptions.find(p => p.value === formData.path);
    const instrumentItem = instrumentOptions.find(i => i.value === formData.instrument);
    const templateItem = templateOptions.find(t => t.value === formData.template);
    
    const limsObj = {};
    
    const limsOrderVal = formData.limsOrder;
    const nOrderID = limsOrderVal === "" ? 0 : parseInt(limsOrderVal) || 0;
    limsObj["nOrderID"] = nOrderID;
    
    if (isInterfaceInstrument(formData.instrument)) {
      if (formData.limsSampleID) limsObj["SampleID"] = formData.limsSampleID;
      if (formData.limsTestCode) limsObj["TestCode"] = formData.limsTestCode;
      if (formData.limsReplicateID) limsObj["ReplicateID"] = formData.limsReplicateID;
    }
    
    const unlockObjDet = {
      nMergeFileCount: formData.mergeFileCount || "1",
      sTaskID: formData.path || "",
      nProtocolStatus: parseInt(formData.protocolID) || 0,
      sFileName: formData.fileName || "",
      sUserID: formData.user || activeUserDetails.sUserID,
      nInterFaceOrderID: formData.interfaceOrderID || "",
      sTaskSourcePath: pathItem?.label || "",
      sInstrumentID: (formData.instrument || "").padEnd(10, ' '),
      sScheduleID: pathItem?.originalItem?.L13ScheduleID || "",
      sTemplateID: formData.template || ""
    };
    
    const unlockData = {
      sTemplateName: templateItem?.label || "",
      unlockObjDet: unlockObjDet,
      sInstrumentName: instrumentItem?.label || "",
      limsObj: limsObj,
      mergebreak: mergebreak,
      ActiveUserDetails: activeUserDetails,
      ApplicationCode: "SDMS"
    };
    
    if (auditData) {
      unlockData.AuditTrailValues = auditData;
    }
    
    return unlockData;
  }, [formData, instrumentOptions, pathOptions, templateOptions, isInterfaceInstrument]);

  const performUnlockAction = useCallback(async (auditData = null, mergebreak = "true") => {
    try {
      if (!formData.instrument || !formData.path) {
        showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
        return;
      }
      
      setIsSubmitting(true);
      const unlockData = prepareUnlockData(auditData, mergebreak);
      
      const result = await makeAjaxCall(endpoints.unLockInstrument, unlockData, "UnLockInstrument");
      
      if (result?.AuditTrailLogin !== undefined && result.AuditTrailLogin === false) {
        showErrorDialogMessage(result.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'), 'error');
        return;
      }
      
      if (result?.oResObj?.bForceUnlock === true) {
        if (mergebreak === "true") {
          setAuditAction('unlock');
          setAuditCallback(() => async (forceAuditData) => {
            await performUnlockAction(forceAuditData, "false");
          });
          setShowAuditTrail(true);
        } else {
          await handleUnlockSuccess(result);
        }
      } 
      else if (result?.oResObj?.bStatus === true) {
        await handleUnlockSuccess(result);
      } 
      else {
        showErrorDialogMessage(result?.oResObj?.sInformation || t('instrumentlocktag.failedtounlockinstrument'), 'error');
      }
      
    } catch (error) {
      showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, prepareUnlockData, t, handleUnlockSuccess]);

  const checkInterfaceConnection = useCallback(async (instrumentId) => {
    const isInterface = isInterfaceInstrument(instrumentId);
    
    if (!isInterface) {
      return { needsCheck: false, isConnected: true };
    }
    
    const interfaceInstId = instrumentId.includes(':') ? 
      parseInt(instrumentId.split(':')[1].trim()) : 0;
    
    if (interfaceInstId <= 0) {
      return { needsCheck: false, isConnected: true };
    }
    
    try {
      setIsLoading(true);
      const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
        InterfaceInstID: interfaceInstId
      }, "InterfaceConnectionChecking");
      
      if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
        const accessStatus = connectionResult[0].AccessStatus;
        return { 
          needsCheck: true, 
          isConnected: accessStatus === 1,
          data: connectionResult[0]
        };
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
    
    return { needsCheck: false, isConnected: true };
  }, [isInterfaceInstrument, t]);

  const handleUnlock = useCallback(async () => {
    if (!isLocked) {
      showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
      return;
    }

    if (isAutoLocked) {
      showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
      return;
    }

    const validateCurrentLockStatus = async () => {
      try {
        if (!formData.instrument) return;
        
        setIsLoading(true);
        const response = await onChangeInstrumentCombo(formData.instrument);
        
        if (response) {
          if (response.sLockType === 'A') {
            setIsAutoLocked(true);
            setIsLocked(true);
            setLockedByOtherUser(false);
            showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
            return false;
          } else if (response.sUserID) {
            setIsLocked(true);
            setIsAutoLocked(false);
            
            const activeUserDetails = getActiveUserDetails();
            const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
            
            if (response.sUserID.trim() === currentUserId) {
              setLockedByOtherUser(false);
              return true;
            } else {
              setLockedByOtherUser(true);
              showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
              return false;
            }
          } else {
            setIsLocked(false);
            setIsAutoLocked(false);
            setLockedByOtherUser(false);
            showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
            return false;
          }
        }
        return false;
      } catch (error) {
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    const newErrors = {};
    let isValid = true;
    
    if (!formData.instrument) {
      newErrors.instrument = true;
      isValid = false;
    }
    
    if (!formData.path) {
      newErrors.path = true;
      isValid = false;
    }
    
    setErrors(newErrors);
    
    if (!isValid) {
      showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
      return;
    }

    const canProceedWithUnlock = await validateCurrentLockStatus();
    if (!canProceedWithUnlock) {
      return;
    }

    if (lockedByOtherUser) {
      const activeUserDetails = getActiveUserDetails();
      const isAdmin = activeUserDetails.sUsername === "Administrator" || 
                     activeUserDetails.ActiveUserDetails?.sUsername === "Administrator";
      
      if (!isAdmin) {
        showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
        return;
      }
    }

    const scheduleData = getDeactiveScheduleDataRef.current;
    if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
      const hasAuditTrailRights = true;
      
      if (hasAuditTrailRights) {
        setAuditAction('unlock');
        setAuditCallback(() => async (auditData) => {
          await performUnlockAction(auditData);
        });
        setShowAuditTrail(true);
        return;
      }
    }
    
    await performUnlockAction();
  }, [isLocked, isAutoLocked, lockedByOtherUser, formData.instrument, formData.path, performUnlockAction, onChangeInstrumentCombo, t]);

  const handleLock = useCallback(async () => {
    if (!validateFormForLock()) {
      return;
    }
    
    if (isAutoLocked) {
      showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
      return;
    }
    
    setIsSubmitting(true);
    
    const isInterface = isInterfaceInstrument(formData.instrument);
    
    if (isInterface) {
      const interfaceInstId = formData.instrument.includes(':') ? 
        parseInt(formData.instrument.split(':')[1].trim()) : 0;
      
      if (interfaceInstId > 0) {
        try {
          setIsLoading(true);
          const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
            InterfaceInstID: interfaceInstId
          }, "InterfaceConnectionChecking");
          
          if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
            const connectionData = connectionResult[0];
            
            if (connectionData.AuditTrailLogin === false) {
              showErrorDialogMessage(
                connectionData.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'),
                'error'
              );
              setIsSubmitting(false);
              setIsLoading(false);
              return;
            }
            
            const accessStatus = connectionData.AccessStatus;
            
            if (accessStatus == 1 || accessStatus === "1") {
              // Interface is connected - continue with normal flow
            } else {
              setIsSubmitting(false);
              setIsLoading(false);
              showErrorDialogMessage(
                t('instrumentlocktag.interfacerinstrumentisnotconnected'),
                'confirmation',
                async () => {
                  setIsSubmitting(true);
                  const scheduleData = getDeactiveScheduleDataRef.current;
                  if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
                    const hasAuditTrailRights = true;
                    
                    if (hasAuditTrailRights) {
                      setIsSubmitting(false);
                      setAuditAction('lock');
                      setAuditCallback(() => async (auditData) => {
                        await performLockAction(auditData);
                      });
                      setShowAuditTrail(true);
                      return;
                    }
                  }
                  
                  await performLockAction();
                }
              );
              return;
            }
          }
        } catch (error) {
          // Continue with lock even if check fails
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    const scheduleData = getDeactiveScheduleDataRef.current;
    if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
      const hasAuditTrailRights = true;
      
      if (hasAuditTrailRights) {
        setIsSubmitting(false);
        setAuditAction('lock');
        setAuditCallback(() => async (auditData) => {
          await performLockAction(auditData);
        });
        setShowAuditTrail(true);
        return;
      }
    }
    
    await performLockAction();
  }, [validateFormForLock, isAutoLocked, formData.instrument, performLockAction, isInterfaceInstrument, t]);

  const handleUpdate = useCallback(async () => {
    if (!validateFormForLock()) {
      return;
    }
    
    if (isAutoLocked) {
      showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
      return;
    }
    
    setIsSubmitting(true);
    await performLockAction();
  }, [validateFormForLock, isAutoLocked, performLockAction]);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  }, []);

  const getFieldDisabledState = useMemo(() => {
    if (isAutoLocked) {
      return {
        client: false,
        instrument: false,
        path: false,
        limsOrder: true,
        fileName: true,
        template: false,
        mergeCount: true,
        unlockCheckbox: true,
        tags: false,
        lockButton: true,
        unlockButton: true
      };
    }
    
    if (isLocked && !lockedByOtherUser) {
      return {
        client: false,
        instrument: false,
        path: true,
        limsOrder: false,
        fileName: false,
        template: true,
        mergeCount: false,
        unlockCheckbox: false,
        tags: false,
        lockButton: false,
        unlockButton: false
      };
    }
    
    if (isLocked && lockedByOtherUser) {
      return {
        client: false,
        instrument: false,
        path: true,
        limsOrder: false,
        fileName: true,
        template: true,
        mergeCount: true,
        unlockCheckbox: true,
        tags: true,
        lockButton: true,
        unlockButton: false
      };
    }
    
    return {
      client: false,
      instrument: false,
      path: false,
      limsOrder: false,
      fileName: false,
      template: false,
      mergeCount: false,
      unlockCheckbox: false,
      tags: false,
      lockButton: false,
      unlockButton: true
    };
  }, [isLocked, lockedByOtherUser, isAutoLocked]);

  return (
    <div >
      <FullPageLoader loading={showFullPageLoader} text={
        isSubmitting ? t('common.loading') :
        t('common.loading')
      } />
      
      <div className="bg-white px-4 py-4">
        <div className="max-w-[1100px]">
          <div className="grid grid-cols-2">
            <div className="max-w-[400px]">
              <div className="mb-7">
                <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
                  {t('label.client')}
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.client}
                    onChange={(e) => handleClientChange(e.target.value)}
                    disabled={getFieldDisabledState.client || isLoading}
                    options={clientOptions}
                    displayKey="label"
                    valueKey="value"
                    allowFreeInput
                    showError={errors.client}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
                  {t('label.instrument')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.instrument}
                    onChange={(e) => handleInstrumentChange(e.target.value)}
                    disabled={getFieldDisabledState.instrument || isLoading}
                    options={instrumentOptions}
                    displayKey="label"
                    valueKey="value"
                    allowFreeInput
                    showError={errors.instrument}
                    className="text-xs"
                  />
                </div>
                {isAutoLocked && (
                  <div className="mt-0 text-sm bg-[#d9534f] font-roboto text-white">
                    {t('instrumentlocktag.thisinstrumentisalreadyautolocked')}
                  </div>
                )}
              </div>

              <div className="mb-7">
                <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
                  {t('instrumentlocktag.path')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.path}
                    onChange={(e) => handlePathChange(e.target.value)}
                    disabled={getFieldDisabledState.path || isLoading}
                    options={pathOptions}
                    displayKey="label"
                    valueKey="value"
                    allowFreeInput
                    showError={errors.path}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
                  {t('instrumentlocktag.limsorder')}
                </label>
                <div className="relative">
                  <AnimatedDropdown
                    value={formData.limsOrder}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      const selectedOrder = limsOrderOptions.find(order => order.value === selectedValue);
                      
                      setFormData(prev => ({
                        ...prev,
                        limsOrder: selectedValue,
                        limsOrderID: selectedValue,
                        limsSampleID: selectedOrder?.sampleID || '',
                        limsTestCode: selectedOrder?.testCode || '',
                        limsReplicateID: selectedOrder?.replicateID || ''
                      }));
                    }}
                    disabled={!isLimsOrderEnabled || getFieldDisabledState.limsOrder || isLoading}
                    options={limsOrderOptions}
                    displayKey="label"
                    valueKey="value"
                    allowFreeInput
                    className="text-xs flex-1"
                  />
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
                  {t('instrumentlocktag.filename')} {isFileNameEnabled && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => handleFormChange('fileName', e.target.value)}
                  disabled={!isFileNameEnabled || getFieldDisabledState.fileName || isLoading}
                  className={`w-full h-7 px-0 text-xs bg-[#f3f3f3] border-0 border-b-2 outline-none font-semibold font-['verdana']
                    ${errors.fileName ? 'border-red-400 text-[#A94442]' : 'border-gray-300 text-[#373737]'}`}
                />
              </div>

              {showMergeFields && (
                <MergeFileCountRow
                  mergeCount={formData.mergeFileCount}
                  currentCount={formData.currentFileCount}
                  onMergeChange={handleMergeCountChange}
                  disabled={!isInstrumentInterface || getFieldDisabledState.mergeCount || isLoading}
                  showMergeFields={showMergeFields}
                  t={t}
                />
              )}

              {showUnlockOption && (
                <div className="flex items-center mb-3 gap-4">
                  <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
                    {t('instrumentlocktag.unlockaftercapture')}
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.unlockAfterCapture}
                    onChange={(e) => handleFormChange('unlockAfterCapture', e.target.checked)}
                    disabled={getFieldDisabledState.unlockCheckbox || isLoading}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className='max-w-[1300px]'>
              <div className="max-w-[350px]">
                <div className="mb-7">
                  <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
                    {t('instrumentlocktag.template')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <AnimatedDropdown
                      value={formData.template}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      disabled={getFieldDisabledState.template || isLoading}
                      options={templateOptions}
                      displayKey="label"
                      valueKey="value"
                      allowFreeInput
                      showError={errors.template}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-7 max-w-[1300px]">
                <div className="max-w-[550px]">
                  <TagGrid
                    tags={tags}
                    onTagValueClick={handleTagValueClick}
                    onTagEditRequest={handleTagEditRequest}
                    onInlineEditSubmit={handleInlineEditSubmit}
                    isLoadingTags={isLoadingTags}
                    isLocked={isLocked}
                    lockedByOtherUser={lockedByOtherUser}
                    isAutoLocked={isAutoLocked}
                    t={t}
                    tagErrors={tagErrors}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 ml-4 mr-4 mt-3 pt-5 border-t border-gray-200">
  <button
    onClick={isLocked && !lockedByOtherUser && !isAutoLocked ? handleUpdate : handleLock}
    disabled={getFieldDisabledState.lockButton || showFullPageLoader}
    className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
      ${getFieldDisabledState.lockButton || showFullPageLoader
        ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
        : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
    `}
  >
    {isLocked && !lockedByOtherUser && !isAutoLocked ? <UpdateIcon /> : <LockIcon />}
    <span>
      {isLocked && !lockedByOtherUser && !isAutoLocked ? t('button.update') : t('button.lock')}
    </span>
  </button>

  <button
    onClick={handleUnlock}
    disabled={getFieldDisabledState.unlockButton || showFullPageLoader}
    className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
      ${getFieldDisabledState.unlockButton || showFullPageLoader
        ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
        : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
    `}
  >
    <UnlockIcon />
    <span>{t('button.unlock')}</span>
  </button>
</div>

      <AuditTrail
        isOpen={showAuditTrail}
        onClose={() => setShowAuditTrail(false)}
        onAuthorized={(auditData) => {
          setShowAuditTrail(false);
          if (auditCallback) {
            auditCallback(auditData);
          }
          setAuditAction(null);
          setAuditCallback(null);
        }}
        actionLabel={auditAction === 'lock' ? t('button.lock') : 
                    auditAction === 'unlock' ? t('button.unlock') : 
                    t('button.update')}
        defaultReason={auditAction === 'lock' ? t('instrumentlocktag.instrumentlocked') : 
                      auditAction === 'unlock' ? t('instrumentlocktag.instrumentunlocked') : 
                      t('instrumentlocktag.instrumentupdated')}
        disableReason={false}
      />

      {showErrorDialog && (
        <Errordialog
          message={errorDialogMessage}
          type={errorDialogType}
          onClose={handleErrorDialogClose}
          showCancel={errorDialogType === 'confirmation'}
          onCancel={handleErrorDialogClose}
          onConfirm={errorDialogType === 'confirmation' ? handleErrorDialogConfirm : undefined}
          cancelText={t('button.cancel')}
          okText={t('button.ok')}
        />
      )}
    </div>
  );
};

export default InstrumentLockTag;