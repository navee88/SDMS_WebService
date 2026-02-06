import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import Errordialog from '../../../../Layout/Common/Errordialog';
import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
import { useInstrumentLock } from '../../../../../Context/InstrumentLockContext';
import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';

// Icons remain the same...
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

// TagGrid component remains the same...
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

const InstrumentLockTag = ({ scheduleData, navigationData }) => {
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
    const { 
    navigateFromDeactivatedToActivatedTask,
    navigateToTab ,
    navigateFromDeactivatedToInstrumentLock,
    clearNavigation
} = useSchedulerNavigation();
  // ========== STATE DECLARATIONS ==========
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [errorDialogType, setErrorDialogType] = useState('information');
  const [errorDialogCallback, setErrorDialogCallback] = useState(null);
  const [isLoadingFromScheduler, setIsLoadingFromScheduler] = useState(false);
  const [hasLoadedFromNavigation, setHasLoadedFromNavigation] = useState(false);
  const [isNavigationInProgress, setIsNavigationInProgress] = useState(false);

  
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

  // ========== REFS ==========
  const initialLoadDoneRef = useRef(false);
  const hasProcessedNavigationData = useRef(false);
  const getDeactiveScheduleDataRef = useRef(scheduleData);
  const lastLoadRef = useRef({ template: '', instrument: '' });

  const tagIdToNameMap = {
    1: "Sample",
    2: "Test", 
    3: "Project",
    4: "BatchNo"
  };

  // ========== UTILITY FUNCTIONS ==========
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

  const isInterfaceInstrument = useCallback((instrumentId) => {
    if (!instrumentId) return false;
    const idStr = instrumentId.toString().trim();
    const parts = idStr.split(':');
    return parts.length > 1 && parts[1] && parts[1].trim() !== "0";
  }, []);

  // ========== LOADING FUNCTIONS ==========
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

  const loadTemplates = async () => {
    try {
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
        console.log('✅ Templates loaded:', sortedTemplates.length);
        return sortedTemplates;
      }
      return [];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  };

const loadAndSetClient = async (clientId) => {
  try {
    console.log('👥 Loading and setting client:', clientId);
    
    // ========== IMPORTANT: Don't use task status 'D' for client loading ==========
    // For Instrument Lock, we should always use active clients regardless of schedule status
    const taskStatus = 'A'; // Always use Active for client loading
    
    console.log('📊 Using task status for client loading:', taskStatus);
    
    const response = await makeAjaxCall(endpoints.clientLockCombo, {
      sTaskStatus: taskStatus,
      sClientID: clientId || ''
    });

    console.log('📊 Client API response:', response);

    if (Array.isArray(response) && response.length > 0) {
      const clientOptionsData = response.map(client => ({
        value: client.sClientID ? client.sClientID.trim() : '',
        label: client.sClientName || t('instrumentlocktag.unknownclient')
      }));

      console.log('✅ Client options loaded:', clientOptionsData.length, 'options');
      setClientOptions(clientOptionsData);
      
      // Find and set the exact client
      const targetClient = clientOptionsData.find(client => client.value === clientId);
      if (targetClient) {
        console.log('✅ Setting client:', targetClient.value, targetClient.label);
        setFormData(prev => ({
          ...prev,
          client: targetClient.value
        }));
        return true;
      } else {
        // If exact match not found, use first client
        const firstClient = clientOptionsData[0];
        if (firstClient) {
          console.log('📌 Client not found, using first client:', firstClient.value);
          setFormData(prev => ({
            ...prev,
            client: firstClient.value
          }));
          return true;
        }
      }
    } else {
      console.warn('⚠️ No clients returned from API. Task status used:', taskStatus);
      
      // Even if no clients returned, set the client ID from navigation
      if (clientId) {
        console.log('📌 Setting client ID from navigation data:', clientId);
        setFormData(prev => ({
          ...prev,
          client: clientId
        }));
        
        // Create a dummy client option
        setClientOptions([{
          value: clientId,
          label: clientId
        }]);
        
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error loading client:', error);
    return false;
  }
};

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

  const loadInstrumentsForScheduler = async (clientId) => {
    try {
      const response = await makeAjaxCall(endpoints.lockInstrumentCombo, {
        sClientID: clientId,
        sScheduleID: ""
      });
      
      if (Array.isArray(response) && response.length > 0) {
        const instrumentOptionsData = response.map(instrument => ({
          value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
          label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
          originalItem: instrument
        }));
        
        console.log(`✅ Loaded ${instrumentOptionsData.length} instruments`);
        setInstrumentOptions(instrumentOptionsData);
        return instrumentOptionsData;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading instruments:', error);
      return [];
    }
  };

  const loadAndSetPath = async (sourcePath, specificInstrumentId = null) => {
    try {
      const instrumentIdToUse = specificInstrumentId || formData.instrument;
      
      if (!instrumentIdToUse) {
        console.log('⏸️ Cannot load path - no instrument selected');
        return false;
      }
      
      console.log('🛣️ Loading and setting path:', sourcePath, 'for instrument:', instrumentIdToUse);
      
      const response = await makeAjaxCall(endpoints.lockPathCombo, {
        sInstrumentID: instrumentIdToUse,
        sScheduleID: "",
        sClientID: formData.client || ''
      });

      console.log('📊 Path API response:', response);

      if (Array.isArray(response) && response.length > 0) {
        const pathOptionsData = response.map(path => ({
          value: path.sTaskID ? path.sTaskID.trim() : '',
          label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
          originalItem: path
        }));

        console.log('🛣️ Path options loaded:', pathOptionsData.length, 'paths');
        setPathOptions(pathOptionsData);

        let selectedPath = null;
        
        if (sourcePath) {
          const cleanSourcePath = sourcePath.toLowerCase().trim().replace(/\\/g, '/');
          console.log('🔍 Looking for path matching:', cleanSourcePath);
          
          selectedPath = pathOptionsData.find(p => {
            if (!p.label) return false;
            
            const cleanPathLabel = p.label.toLowerCase().trim().replace(/\\/g, '/');
            
            if (cleanPathLabel === cleanSourcePath) {
              console.log('✅ Exact path match found');
              return true;
            }
            
            if (cleanPathLabel.endsWith(cleanSourcePath)) {
              console.log('✅ Path ends with source path');
              return true;
            }
            
            if (cleanPathLabel.includes(cleanSourcePath)) {
              console.log('✅ Path contains source path');
              return true;
            }
            
            if (cleanSourcePath.includes(cleanPathLabel)) {
              console.log('✅ Source path contains path label');
              return true;
            }
            
            const sourceSegments = cleanSourcePath.split('/').filter(s => s);
            const pathSegments = cleanPathLabel.split('/').filter(s => s);
            
            if (sourceSegments.length > 0 && pathSegments.length > 0) {
              const lastSourceSegment = sourceSegments[sourceSegments.length - 1];
              const lastPathSegment = pathSegments[pathSegments.length - 1];
              
              if (lastPathSegment === lastSourceSegment) {
                console.log('✅ Last segment match');
                return true;
              }
            }
            
            return false;
          });
        }

        if (!selectedPath && pathOptionsData.length > 0) {
          selectedPath = pathOptionsData[0];
          console.log('📌 Using first path as fallback:', selectedPath.label);
        }

        if (selectedPath) {
          console.log('✅ Setting selected path:', selectedPath.value, '->', selectedPath.label);
          
          setFormData(prev => ({
            ...prev,
            path: selectedPath.value
          }));
          
          return true;
        }
      } else {
        console.warn('⚠️ No path options returned from API');
      }
      return false;
    } catch (error) {
      console.error('❌ Error loading path:', error);
      setPathOptions([]);
      return false;
    }
  };

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
        return response.map(item => ({
          value: item.sTagValueID ? item.sTagValueID.trim() : '',
          label: item.sTagValue || t('instrumentlocktag.unknownvalue')
        })).filter(opt => opt.value && opt.label);
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

const onChangeInstrumentCombo = useCallback(async (instrumentId) => {
  try {
    const nLLProStatus = 0;
    const nProtocolStatus = parseInt(formData.protocolID) || 0;
    const nProtocolStatusfile = isFileNameEnabled ? 101 : 0;
    
    console.log('🔧 onChangeInstrumentCombo called with:', instrumentId);
    console.log('📊 Current LIMS order data before change:', {
      limsOrder: formData.limsOrder,
      limsOrderID: formData.limsOrderID
    });
    
    const response = await makeAjaxCall(endpoints.onChangeInstrumentCombo, {
      sInstrumentID: instrumentId,
      nLLProStatus: nLLProStatus,
      nProtocolStatus: nProtocolStatus,
      nProtocolStatusfile: nProtocolStatusfile
    }, "SelectPathFileUSerTemplate");
    
    if (response) {
      const activeUserDetails = getActiveUserDetails();
      const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
      
      setIsLocked(false);
      setIsAutoLocked(false);
      setLockedByOtherUser(false);
      
      if (response.sLockType === 'A') {
        setIsAutoLocked(true);
        setIsLocked(true);
        setLockedByOtherUser(false);
      } else if (response.sUserID && response.sUserID.trim() !== '') {
        setIsLocked(true);
        setIsAutoLocked(false);
        
        const responseUserId = response.sUserID ? response.sUserID.trim() : '';
        
        if (responseUserId === currentUserId) {
          setLockedByOtherUser(false);
        } else {
          setLockedByOtherUser(true);
        }
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
      
      let selectedTemplate = null;
      
      if (response.sLockType === 'A' && templateOptions.length > 0) {
        selectedTemplate = templateOptions[0].value;
        updates.template = selectedTemplate;
        console.log('📋 Auto-locked: auto-selecting first template:', selectedTemplate);
      } 
      else if (response.sTemplateID && response.sTemplateID.trim() !== '') {
        selectedTemplate = response.sTemplateID.trim();
        updates.template = selectedTemplate;
        console.log('📋 Using existing template from lock:', selectedTemplate);
      }
      else if (templateOptions.length > 0 && !formData.template) {
        selectedTemplate = templateOptions[0].value;
        updates.template = selectedTemplate;
        console.log('📋 Auto-selecting first template (no existing lock):', selectedTemplate);
      }
      else if (formData.template) {
        selectedTemplate = formData.template;
        updates.template = selectedTemplate;
        console.log('📋 Keeping user-selected template:', selectedTemplate);
      }
      
      if (!isLoadingFromScheduler) {
        updates.path = '';
      }
      
      // ========== IMPORTANT: DON'T clear LIMS order data ==========
      // Keep existing LIMS order data when changing instrument
      // Only clear if the new instrument is not interface
      const isInterface = isInterfaceInstrument(instrumentId);
      if (!isInterface) {
        // Clear LIMS order data if instrument is not interface
        updates.limsOrder = '';
        updates.limsOrderID = '';
        updates.limsSampleID = '';
        updates.limsTestCode = '';
        updates.limsReplicateID = '';
      } else {
        // For interface instruments, keep existing LIMS data
        console.log('🔍 Interface instrument detected, preserving LIMS order data');
      }
      
      setFormData(prev => ({ ...prev, ...updates }));
      
      if (selectedTemplate && instrumentId) {
        console.log('🔍 Immediately loading tags for auto-selected template:', selectedTemplate);
        
        setTimeout(() => {
          fetchTags(selectedTemplate, instrumentId);
        }, 300);
      }
      
      return response;
    }
  } catch (error) {
    setIsLocked(false);
    setIsAutoLocked(false);
    setLockedByOtherUser(false);
    return null;
  }
}, [formData.protocolID, isFileNameEnabled, templateOptions, isLoadingFromScheduler, formData.template,
   fetchTags, formData.limsOrder, formData.limsOrderID]);
  // ========== NAVIGATION HANDLERS ==========
  const handleSchedulerNavigation = async (data) => {
    console.log('🚀 Starting scheduler navigation with data:', data);
    
    const scheduleData = data.scheduleData || data;
    const isFromLockActivate = data.fromLockActivate || data.actionType === 'lockActivate';
    
    if (isFromLockActivate) {
      console.log('🔐 Lock & Activate flow detected');
      console.log('Schedule ID:', scheduleData.L13ScheduleID || scheduleData.scheduleId);
    }
    
    setIsLoadingFromScheduler(true);
    setHasLoadedFromNavigation(false);
    
    try {
      setInstrumentOptions([]);
      setPathOptions([]);
      setTags([]);
      
      if (templateOptions.length === 0) {
        console.log('⏳ Loading templates...');
        await loadTemplates();
      }
      
      const clientId = (scheduleData.clientId || scheduleData.L06ClientID || '').trim();
      
      if (!clientId) {
        console.error('❌ No client ID found');
        setIsLoadingFromScheduler(false);
        return;
      }
      
      console.log('👥 Loading client:', clientId);
      
      const clientLoaded = await loadAndSetClient(clientId);
      
      if (!clientLoaded) {
        console.error('❌ Failed to load client');
        setIsLoadingFromScheduler(false);
        return;
      }
      
      console.log('🎯 Loading instruments for client:', clientId);
      const instruments = await loadInstrumentsForScheduler(clientId);
      
      if (instruments.length === 0) {
        console.error('❌ No instruments found');
        setIsLoadingFromScheduler(false);
        return;
      }
      
      const instrumentId = (
        scheduleData.dropdownInstrumentId || 
        scheduleData.instrumentId || 
        scheduleData.L11InstrumentID ||
        scheduleData.L13InstrumentMappingID
      )?.trim();
      
      console.log('🔍 Looking for instrument:', instrumentId);
      
      let targetInstrument = instruments.find(inst => 
        inst.value.trim() === instrumentId
      );
      
      if (!targetInstrument && scheduleData.instrumentName) {
        console.log('🔍 Trying instrument name match:', scheduleData.instrumentName);
        targetInstrument = instruments.find(inst => 
          inst.label.toLowerCase().includes(scheduleData.instrumentName.toLowerCase()) ||
          scheduleData.instrumentName.toLowerCase().includes(inst.label.toLowerCase())
        );
      }
      
      if (!targetInstrument && instruments.length > 0) {
        targetInstrument = instruments[0];
        console.log('📌 Using first instrument as fallback');
      }
      
      if (!targetInstrument) {
        console.error('❌ Could not find any matching instrument');
        setIsLoadingFromScheduler(false);
        return;
      }
      
      console.log('✅ Found instrument:', {
        value: targetInstrument.value,
        label: targetInstrument.label
      });
      
      setFormData(prev => ({ 
        ...prev, 
        instrument: targetInstrument.value,
        path: ''
      }));
      
      setIsLoading(true);
      try {
        await loadProtocol(targetInstrument.value);
        
        const isInterface = isInterfaceInstrument(targetInstrument.value);
        
        if (isInterface) {
          const interfaceInstId = targetInstrument.value.includes(':') ? 
            parseInt(targetInstrument.value.split(':')[1].trim()) : 0;
          
          if (interfaceInstId > 0) {
            console.log('🔍 Loading LIMS orders for interface instrument');
            await loadLimsOrder(interfaceInstId);
          }
        } else {
          setLimsOrderOptions([]);
          setIsLimsOrderEnabled(false);
        }
        
        const instrumentData = await onChangeInstrumentCombo(targetInstrument.value);
        
        if (instrumentData) {
          const updates = {};
          
          if (instrumentData.nCurMergeFileNo > 0) {
            updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
          } else {
            updates.currentFileCount = '0';
          }
          
          const lockedMergeCount = getSessionValue("LockedMergeCount");
          if (instrumentData.sTaskID && lockedMergeCount) {
            updates.mergeFileCount = lockedMergeCount;
          } else if (instrumentData.nMergeFileCount > 0) {
            updates.mergeFileCount = String(instrumentData.nMergeFileCount);
            setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
          } else {
            updates.mergeFileCount = getSessionValue("MergeCount") || '1';
          }
          
          if (templateOptions.length > 0) {
            updates.template = templateOptions[0].value;
            console.log('📋 Auto-selected first template:', templateOptions[0].value);
          }
          
          setFormData(prev => ({ ...prev, ...updates }));
        }
      } finally {
        setIsLoading(false);
      }
      
      if (scheduleData.sourcePath || scheduleData.L13SourcePath) {
        const sourcePath = (scheduleData.sourcePath || scheduleData.L13SourcePath).trim();
        console.log('🛣️ Loading path:', sourcePath);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const pathsResponse = await makeAjaxCall(endpoints.lockPathCombo, {
          sInstrumentID: targetInstrument.value,
          sScheduleID: scheduleData.L13ScheduleID || scheduleData.scheduleId || "",
          sClientID: clientId
        });
        
        if (Array.isArray(pathsResponse) && pathsResponse.length > 0) {
          const pathOptionsData = pathsResponse.map(path => ({
            value: path.sTaskID ? path.sTaskID.trim() : '',
            label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
            originalItem: path
          }));
          
          console.log('🛣️ Available paths:', pathOptionsData.length);
          setPathOptions(pathOptionsData);
          
          let selectedPath = pathOptionsData.find(p => {
            if (!p.label) return false;
            const cleanPathLabel = p.label.toLowerCase().replace(/\\/g, '/');
            const cleanSourcePath = sourcePath.toLowerCase().replace(/\\/g, '/');
            
            return cleanPathLabel === cleanSourcePath ||
                   cleanPathLabel.includes(cleanSourcePath) ||
                   cleanSourcePath.includes(cleanPathLabel);
          });
          
          if (!selectedPath && (scheduleData.L52TaskID || scheduleData.sTaskID)) {
            const taskId = (scheduleData.L52TaskID || scheduleData.sTaskID).trim();
            selectedPath = pathOptionsData.find(p => p.value === taskId);
          }
          
          if (!selectedPath && pathOptionsData.length > 0) {
            selectedPath = pathOptionsData[0];
            console.log('📌 Using first path as fallback');
          }
          
          if (selectedPath) {
            console.log('✅ Setting path:', selectedPath.label);
            setFormData(prev => ({
              ...prev,
              path: selectedPath.value
            }));
          }
        }
      }
      
      if (formData.template && targetInstrument.value) {
        console.log('🏷️ Scheduling tag load');
        setTimeout(async () => {
          await fetchTags(formData.template, targetInstrument.value);
        }, 1000);
      }
      
      setHasLoadedFromNavigation(true);
      console.log('✅ Scheduler navigation completed successfully');
      
    } catch (error) {
      console.error('❌ Error in scheduler navigation:', error);
      showErrorDialogMessage(error.message || 'Failed to load scheduler data', 'error');
    } finally {
      setIsLoadingFromScheduler(false);
    }
  };

const loadFromDeactivatedTask = async (scheduleData) => {
  console.log('🚀 Starting load from deactivated task:', scheduleData);
  
  setIsLoadingFromScheduler(true);
  setHasLoadedFromNavigation(false);
  hasProcessedNavigationData.current = true;
  
  try {
    // Extract data with proper fallbacks
    const clientId = (scheduleData.clientId || scheduleData.L06ClientID || '').trim();
    const instrumentId = (scheduleData.dropdownInstrumentId || scheduleData.instrumentId || scheduleData.L11InstrumentID || '').trim();
    const instrumentName = (scheduleData.instrumentName || scheduleData.L11InstrumentAliasName || '').trim();
    const sourcePath = (scheduleData.sourcePath || scheduleData.L13SourcePath || '').trim();
    const scheduleId = (scheduleData.L13ScheduleID || scheduleData.scheduleId || '').trim();
    
    console.log('🔍 Extracted deactivated task data:', { 
      clientId, 
      instrumentId, 
      instrumentName, 
      sourcePath,
      scheduleId
    });
    
    if (!clientId) {
      console.error('❌ No client ID found in deactivated task data');
      return;
    }
    
    setInstrumentOptions([]);
    setPathOptions([]);
    setTags([]);
    
    if (templateOptions.length === 0) {
      console.log('⏳ Loading templates for deactivated task...');
      await loadTemplates();
    }
    
    // Load client - ALWAYS use active status
    console.log('👥 Loading client for deactivated task:', clientId);
    setFormData(prev => ({ ...prev, client: clientId }));
    
    // Create a temporary client option
    setClientOptions([{
      value: clientId,
      label: clientId
    }]);
    
    console.log('🎯 Loading instruments for deactivated task client:', clientId);
    const instruments = await loadInstrumentsForScheduler(clientId);
    
    if (instruments.length === 0) {
      console.error('❌ No instruments found for client');
      return;
    }
    
    let targetInstrument = null;
    
    if (instrumentId) {
      targetInstrument = instruments.find(inst => 
        inst.value.trim() === instrumentId
      );
    }
    
    if (!targetInstrument && instrumentName) {
      console.log('🔍 Searching by instrument name:', instrumentName);
      targetInstrument = instruments.find(inst => 
        inst.label.toLowerCase().includes(instrumentName.toLowerCase()) ||
        instrumentName.toLowerCase().includes(inst.label.toLowerCase())
      );
    }
    
    if (!targetInstrument && instruments.length > 0) {
      targetInstrument = instruments[0];
      console.log('📌 Using first instrument as fallback');
    }
    
    if (!targetInstrument) {
      console.error('❌ Could not find matching instrument');
      return;
    }
    
    console.log('✅ Found instrument for deactivated task:', {
      value: targetInstrument.value,
      label: targetInstrument.label
    });
    
    // Set instrument in form
    setFormData(prev => ({ 
      ...prev, 
      instrument: targetInstrument.value,
      client: clientId,
      path: '',
      fileName: '',
      template: ''
    }));
    
    setIsLoading(true);
    
    try {
      // Load protocol and other details
      await loadProtocol(targetInstrument.value);
      
      const isInterface = isInterfaceInstrument(targetInstrument.value);
      
      // Check if we need to load LIMS orders
      if (isInterface) {
        const interfaceInstId = targetInstrument.value.includes(':') ? 
          parseInt(targetInstrument.value.split(':')[1].trim()) : 0;
        
        if (interfaceInstId > 0) {
          console.log('🔍 Loading LIMS orders for deactivated task');
          await loadLimsOrder(interfaceInstId);
        }
      } else {
        setLimsOrderOptions([]);
        setIsLimsOrderEnabled(false);
      }
      
      // Call onChangeInstrumentCombo to get lock status
      const instrumentData = await onChangeInstrumentCombo(targetInstrument.value);
      
      if (instrumentData) {
        const updates = {};
        
        if (instrumentData.nCurMergeFileNo > 0) {
          updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
        } else {
          updates.currentFileCount = '0';
        }
        
        const lockedMergeCount = getSessionValue("LockedMergeCount");
        if (instrumentData.sTaskID && lockedMergeCount) {
          updates.mergeFileCount = lockedMergeCount;
        } else if (instrumentData.nMergeFileCount > 0) {
          updates.mergeFileCount = String(instrumentData.nMergeFileCount);
          setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
        } else {
          updates.mergeFileCount = getSessionValue("MergeCount") || '1';
        }
        
        // Auto-select first template if instrument is auto-locked
        if (instrumentData.sLockType === 'A' && templateOptions.length > 0) {
          updates.template = templateOptions[0].value;
          console.log('📋 Auto-selected first template for auto-locked instrument');
        }
        
        setFormData(prev => ({ ...prev, ...updates }));
      }
    } finally {
      setIsLoading(false);
    }
    
    // Load path after a delay to ensure instrument is set
    if (sourcePath) {
      console.log('🛣️ Loading path for deactivated task:', sourcePath);
      
      setTimeout(async () => {
        const success = await loadAndSetPath(sourcePath, targetInstrument.value);
        if (!success) {
          console.log('⚠️ Could not find matching path, showing available paths');
        }
      }, 800);
    }
    
    setHasLoadedFromNavigation(true);
    console.log('✅ Deactivated task navigation completed');
    
  } catch (error) {
    console.error('❌ Error loading deactivated task data:', error);
    showErrorDialogMessage(error.message || 'Failed to load deactivated task data', 'error');
  } finally {
    setIsLoadingFromScheduler(false);
  }
};


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

  // ========== EVENT HANDLERS ==========
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
      
      // Auto-select first instrument only if not loading from scheduler
      if (instrumentOptionsData.length > 0 && !isLoadingFromScheduler) {
        const firstInstrument = instrumentOptionsData[0];
        
        setIsLoading(true);
        
        try {
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
            mergeFileCount: getSessionValue("MergeCount") || '1',
            currentFileCount: '0'
          }));
          
          setErrors(prev => ({ ...prev, instrument: false }));
          
          setTags([]);
          setTagErrors({});
          setPathOptions([]);
          
          const isInterface = isInterfaceInstrument(firstInstrument.value);
          
          await loadProtocol(firstInstrument.value);
          
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
          
          const instrumentData = await onChangeInstrumentCombo(firstInstrument.value);
          
          if (instrumentData) {
            const updates = {};
            
            if (instrumentData.nCurMergeFileNo > 0) {
              updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
            } else {
              updates.currentFileCount = '0';
            }
            
            const lockedMergeCount = getSessionValue("LockedMergeCount");
            if (instrumentData.sTaskID && lockedMergeCount) {
              updates.mergeFileCount = lockedMergeCount;
            } else if (instrumentData.nMergeFileCount > 0) {
              updates.mergeFileCount = String(instrumentData.nMergeFileCount);
              setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
            } else {
              updates.mergeFileCount = getSessionValue("MergeCount") || '1';
            }
            
            // DON'T set template here - let onChangeInstrumentCombo handle it
            // This will allow auto-selection of first template
            
            setFormData(prev => ({ ...prev, ...updates }));
          }
          
          await loadPaths(firstInstrument.value);
          
        } catch (error) {
          console.error('Error loading instrument details:', error);
        } finally {
          setIsLoading(false);
        }
      }
      
      return instrumentOptionsData;
      
    } else {
      setInstrumentOptions([]);
      return [];
    }
  } catch (error) {
    console.error('Error loading instruments:', error);
    setInstrumentOptions([]);
    setIsLoading(false);
    return [];
  }
}, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
    isInterfaceInstrument, isLoadingFromScheduler]);

const loadClients = useCallback(async () => {
  try {
    const preselectedClientId = scheduleData?.L06ClientID;
    // ========== FIX: Determine task status ==========
    const isFromDeactivatedTask = navigationData?.data?.scheduleData || 
                                 sessionStorage.getItem('fromDeactivatedTask') === 'true';
    const taskStatus = isFromDeactivatedTask ? 'D' : 'A';
    
    console.log('📊 Loading clients with task status:', taskStatus);
    
    const response = await makeAjaxCall(endpoints.clientLockCombo, {
      sTaskStatus: taskStatus,  // ← THIS IS THE FIX
      sClientID: preselectedClientId
    });
    
    console.log('📊 Client response:', response);
    
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
        console.log('✅ Selected client:', clientToSelect.value);
        setFormData(prev => ({ ...prev, client: clientToSelect.value }));
        await loadInstruments(clientToSelect.value);
      }
    } else {
      console.warn('⚠️ No clients found with task status:', taskStatus);
      setClientOptions([]);
    }
  } catch (error) {
    console.error('Error loading clients:', error);
    setClientOptions([]);
  }
}, [scheduleData, loadInstruments, t, navigationData]);

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

  // ========== CLEANED USEFFECTS ==========

  // 1. Handle device type
  useEffect(() => {
    const device = sessionStorage.getItem("device") || "desktop";
    setDeviceType(device);
  }, []);

  // 2. Handle pending activation from DeactivatedTask
  useEffect(() => {
    console.log('🔍 Checking for pending activation from DeactivatedTask');
    
    const pendingActivationData = sessionStorage.getItem('pendingActivationData');
    
    if (pendingActivationData) {
      try {
        const activationData = JSON.parse(pendingActivationData);
        console.log('🚀 Found pending activation data:', activationData);
        
        const { scheduleData, activateData } = activationData;
        
        if (scheduleData) {
          console.log('📋 Loading schedule data into Instrument Lock form');
          
          handleSchedulerNavigation({
            ...scheduleData,
            fromLockActivate: true,
            actionType: 'lockActivate'
          });
          
          sessionStorage.removeItem('pendingActivationData');
        }
      } catch (error) {
        console.error('Error processing pending activation data:', error);
        sessionStorage.removeItem('pendingActivationData');
      }
    }
  }, []);

  // 3. Handle navigation data
  useEffect(() => {
    console.log('🔍 Navigation data received:', navigationData);
    
    if (!navigationData?.data || hasProcessedNavigationData.current) {
      return;
    }
    
    let schedulerData = null;
    
    if (navigationData.data.fromScheduler) {
      schedulerData = navigationData.data;
    } else if (navigationData.data.data?.fromScheduler) {
      schedulerData = navigationData.data.data;
    } else if (navigationData.data.scheduleData) {
      schedulerData = navigationData.data;
    }
    
    if (schedulerData) {
      console.log('🚀 Processing navigation data:', schedulerData);
      
      sessionStorage.removeItem('fromScheduler');
      sessionStorage.removeItem('schedulerData');
      sessionStorage.removeItem('fromDeactivatedTask');
      sessionStorage.removeItem('deactivatedTaskData');
      
      const isFromDeactivatedTask = schedulerData.fromDeactivatedTask || 
                                   schedulerData.scheduleData?.fromDeactivatedTask;
      
      if (isFromDeactivatedTask) {
        console.log('📋 From Deactivated Task detected');
        sessionStorage.setItem('fromDeactivatedTask', 'true');
        sessionStorage.setItem('deactivatedTaskData', JSON.stringify(schedulerData.scheduleData || schedulerData));
      } else {
        console.log('📋 From Scheduler detected');
        sessionStorage.setItem('fromScheduler', 'true');
        sessionStorage.setItem('schedulerData', JSON.stringify(schedulerData));
      }
      
      setHasLoadedFromNavigation(false);
      hasProcessedNavigationData.current = true;
    }
  }, [navigationData]);

  // 4. Handle initial load - SIMPLIFIED VERSION
  useEffect(() => {
    const initializeComponent = async () => {
      if (initialLoadDoneRef.current) return;
      
      console.log('🔧 Starting component initialization');
      setIsLoading(true);
      
      try {
        // Step 1: Load basic settings
        await checkMergeAndAutoUnlockSettings();
        await loadUsers();
        await loadTemplates();
        
        // Step 2: Check for stored navigation data
        const fromDeactivatedTask = sessionStorage.getItem('fromDeactivatedTask');
        const storedDeactivatedData = sessionStorage.getItem('deactivatedTaskData');
        
        if (fromDeactivatedTask === 'true' && storedDeactivatedData) {
          try {
            const deactivatedData = JSON.parse(storedDeactivatedData);
            console.log('🔍 Found stored deactivated task data, loading...');
            
            sessionStorage.removeItem('fromDeactivatedTask');
            sessionStorage.removeItem('deactivatedTaskData');
            
            await loadFromDeactivatedTask(deactivatedData);
            initialLoadDoneRef.current = true;
            return;
          } catch (error) {
            console.error('Error parsing stored deactivated data:', error);
            sessionStorage.removeItem('fromDeactivatedTask');
            sessionStorage.removeItem('deactivatedTaskData');
          }
        }
        
        const fromScheduler = sessionStorage.getItem('fromScheduler');
        const storedData = sessionStorage.getItem('schedulerData');
        
        if (fromScheduler === 'true' && storedData) {
          try {
            const schedulerData = JSON.parse(storedData);
            console.log('🔍 Found stored scheduler data, loading...');
            
            sessionStorage.removeItem('fromScheduler');
            sessionStorage.removeItem('schedulerData');
            
            await handleSchedulerNavigation(schedulerData);
            initialLoadDoneRef.current = true;
            return;
          } catch (error) {
            console.error('Error parsing stored scheduler data:', error);
          }
        }
        
        // Step 3: Normal initialization
        console.log('🔧 No stored data found, starting normal initialization');
        await loadClients();
        
        initialLoadDoneRef.current = true;
        console.log('✅ Component initialization complete');
        
      } catch (error) {
        console.error('❌ Error during initialization:', error);
        showErrorDialogMessage('Failed to initialize component', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeComponent();
  }, []); // Empty dependency array - run once on mount

  // 5. Handle template change and tag loading
  useEffect(() => {
    const loadTagsForTemplate = async () => {
      if (!formData.template || !formData.template.trim() || !formData.instrument) {
        setTags([]);
        return;
      }
      
      const currentKey = `${formData.template}-${formData.instrument}`;
      const lastKey = `${lastLoadRef.current.template}-${lastLoadRef.current.instrument}`;
      
      if (currentKey === lastKey && tags.length > 0) {
        console.log('📋 Skipping tag load - same template/instrument');
        return;
      }
      
      if (isLoadingTags) {
        console.log('⏳ Already loading tags, skipping');
        return;
      }
      
      console.log('🔍 Loading tags for template:', formData.template);
      
      lastLoadRef.current = {
        template: formData.template,
        instrument: formData.instrument
      };
      
      await fetchTags(formData.template, formData.instrument);
    };
    
    const timer = setTimeout(() => {
      loadTagsForTemplate();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [formData.template, formData.instrument, fetchTags, isLoadingTags, tags.length]);

  // 6. Handle auto-locked instrument template loading
  useEffect(() => {
    const handleAutoLockedInstrument = async () => {
      if (isAutoLocked && formData.instrument && templateOptions.length > 0) {
        console.log('🔒 Processing auto-locked instrument:', formData.instrument);
        
        if (!formData.template) {
          const firstTemplate = templateOptions[0].value;
          console.log('📋 Setting first template for auto-locked instrument:', firstTemplate);
          
          setFormData(prev => ({
            ...prev,
            template: firstTemplate
          }));
          
          setTimeout(() => {
            if (firstTemplate && formData.instrument) {
              console.log('🔍 Loading tags for auto-locked instrument');
              fetchTags(firstTemplate, formData.instrument);
            }
          }, 500);
        } else if (formData.template && formData.instrument) {
          console.log('🔍 Auto-locked instrument has template, ensuring tags are loaded');
          fetchTags(formData.template, formData.instrument);
        }
      }
    };
    
    handleAutoLockedInstrument();
  }, [isAutoLocked, formData.instrument, formData.template, templateOptions, fetchTags]);



  // 7. Handle path loading after instrument change in scheduler mode
  useEffect(() => {
    const loadPathForScheduler = async () => {
      if (isLoadingFromScheduler && formData.instrument && !formData.path) {
        const schedulerDataStr = sessionStorage.getItem('schedulerData');
        
        if (schedulerDataStr) {
          try {
            const schedulerData = JSON.parse(schedulerDataStr);
            if (schedulerData.sourcePath) {
              console.log('🔧 Auto-loading path after instrument was set:', formData.instrument);
              
              setTimeout(async () => {
                await loadAndSetPath(schedulerData.sourcePath.trim(), formData.instrument);
              }, 300);
            }
          } catch (error) {
            console.error('Error parsing scheduler data:', error);
          }
        }
      }
    };
    
    loadPathForScheduler();
  }, [formData.instrument, formData.path, isLoadingFromScheduler]);

  // 8. Handle cleanup on unmount
  useEffect(() => {
    return () => {
      hasProcessedNavigationData.current = false;
      initialLoadDoneRef.current = false;
      lastLoadRef.current = { template: '', instrument: '' };
    };
  }, []);

useEffect(() => {
  console.log('🔍 Checking navigationData for deactivated task:', navigationData);
  
  if (navigationData?.data?.scheduleData) {
    console.log('🚀 DIRECT LOAD from deactivated task:', navigationData.data.scheduleData);
    
    const scheduleData = navigationData.data.scheduleData;
    
    // ========== FIX: Extract LIMS order data from checkResponse ==========
    let limsOrderData = null;
    
    // Check multiple possible sources for LIMS order data
    if (navigationData.data?.checkResponse?.LIMSobj) {
      limsOrderData = navigationData.data.checkResponse.LIMSobj;
      console.log('📊 Found LIMS order data in checkResponse:', limsOrderData);
    } else if (navigationData.data?.activateData?.LIMSobj) {
      limsOrderData = navigationData.data.activateData.LIMSobj;
      console.log('📊 Found LIMS order data in activateData:', limsOrderData);
    } else if (navigationData.data?.LIMSobj) {
      limsOrderData = navigationData.data.LIMSobj;
      console.log('📊 Found LIMS order data in navigationData.data:', limsOrderData);
    }
    
    // ========== FIX: Set form data with ALL extracted data ==========
    const formDataUpdate = {
      client: scheduleData.L06ClientID || '', 
      instrument: scheduleData.instrumentName || scheduleData.dropdownInstrumentId || '', 
      path: scheduleData.sourcePath || '',
      fileName: '', 
      limsOrder: limsOrderData?.nOrderID ? String(limsOrderData.nOrderID) : '',
      limsOrderID: limsOrderData?.nOrderID ? String(limsOrderData.nOrderID) : '',
      limsSampleID: limsOrderData?.sSampleID || '',
      limsTestCode: limsOrderData?.sTestCode || '',
      limsReplicateID: limsOrderData?.sReplicateID || '',
      template: ''
    };
    
    console.log('📋 Setting form data with LIMS order:', formDataUpdate);
    
    setFormData(prev => ({ 
      ...prev, 
      ...formDataUpdate
    }));
    
    // Store that this is from deactivated task
    sessionStorage.setItem('fromDeactivatedTask', 'true');
    
    // ========== FIX: Store LIMS order data separately ==========
    if (limsOrderData) {
      sessionStorage.setItem('deactivatedLIMSOrderData', JSON.stringify(limsOrderData));
    }
    
    // Clear any scheduler data to avoid conflicts
    sessionStorage.removeItem('fromScheduler');
    sessionStorage.removeItem('schedulerData');
    
    // Set loading state
    setIsLoadingFromScheduler(true);
    
    // Now load the data properly
    const loadData = async () => {
      try {
        // Load templates if needed
        if (templateOptions.length === 0) {
          await loadTemplates();
        }
        
        // Load client
        if (scheduleData.L06ClientID) {
          await loadAndSetClient(scheduleData.L06ClientID);
        }
        
        // Load instruments for this client
        if (scheduleData.L06ClientID) {
          const instruments = await loadInstrumentsForScheduler(scheduleData.L06ClientID);
          
          if (instruments.length > 0) {
            // Find the matching instrument
            const instrumentId = scheduleData.dropdownInstrumentId || scheduleData.instrumentName || '';
            let targetInstrument = instruments.find(inst => 
              inst.value === instrumentId || inst.label === instrumentId
            );
            
            if (!targetInstrument && instruments.length > 0) {
              targetInstrument = instruments[0];
            }
            
            if (targetInstrument) {
              // Set instrument
              setFormData(prev => ({ ...prev, instrument: targetInstrument.value }));
              
              // Load protocol and other details
              await loadProtocol(targetInstrument.value);
              
              const isInterface = isInterfaceInstrument(targetInstrument.value);
              
              // ========== IMPORTANT: Handle LIMS order setup ==========
              if (limsOrderData && limsOrderData.nOrderID) {
                console.log('🔄 Setting up LIMS order from deactivated task:', limsOrderData);
                
                // Create a lims order option from the data
                const limsOrderOption = {
                  value: String(limsOrderData.nOrderID),
                  label: limsOrderData.LIMSOrder || `Order ${limsOrderData.nOrderID}`,
                  orderID: limsOrderData.nOrderID,
                  sampleID: limsOrderData.sSampleID || '',
                  testCode: limsOrderData.sTestCode || '',
                  replicateID: limsOrderData.sReplicateID || '',
                  ...limsOrderData
                };
                
                // Update lims order options
                setLimsOrderOptions([limsOrderOption]);
                setIsLimsOrderEnabled(true);
                
                // IMPORTANT: Re-set form data to ensure LIMS values are preserved
                setFormData(prev => ({
                  ...prev,
                  limsOrder: String(limsOrderData.nOrderID),
                  limsOrderID: String(limsOrderData.nOrderID),
                  limsSampleID: limsOrderData.sSampleID || '',
                  limsTestCode: limsOrderData.sTestCode || '',
                  limsReplicateID: limsOrderData.sReplicateID || ''
                }));
                
              } else if (isInterface) {
                // Only load LIMS orders if interface instrument and no existing LIMS data
                const interfaceInstId = targetInstrument.value.includes(':') ? 
                  parseInt(targetInstrument.value.split(':')[1].trim()) : 0;
                if (interfaceInstId > 0) {
                  await loadLimsOrder(interfaceInstId);
                }
              } else {
                setLimsOrderOptions([]);
                setIsLimsOrderEnabled(false);
              }
              
              // Call onChangeInstrumentCombo to get lock status
              await onChangeInstrumentCombo(targetInstrument.value);
              
              // Load path
              if (scheduleData.sourcePath) {
                await loadAndSetPath(scheduleData.sourcePath, targetInstrument.value);
              }
            }
          }
        }
        
        setHasLoadedFromNavigation(true);
        console.log('✅ Direct deactivated task load completed');
        
      } catch (error) {
        console.error('❌ Error loading deactivated task data:', error);
      } finally {
        setIsLoadingFromScheduler(false);
      }
    };
    
    loadData();
  }
}, [navigationData]);

// Add this useEffect to restore LIMS order data when instrument loads
useEffect(() => {
  const restoreLIMSOrderData = () => {
    // Check if we have stored LIMS order data
    const storedLIMSData = sessionStorage.getItem('deactivatedLIMSOrderData');
    const isFromDeactivatedTask = sessionStorage.getItem('fromDeactivatedTask') === 'true';
    
    if (isFromDeactivatedTask && storedLIMSData && formData.instrument && !formData.limsOrder) {
      try {
        const limsOrderData = JSON.parse(storedLIMSData);
        
        if (limsOrderData && limsOrderData.nOrderID) {
          console.log('🔄 Restoring LIMS order data:', limsOrderData);
          
          // Create lims order option
          const limsOrderOption = {
            value: String(limsOrderData.nOrderID),
            label: limsOrderData.LIMSOrder || `Order ${limsOrderData.nOrderID}`,
            orderID: limsOrderData.nOrderID,
            sampleID: limsOrderData.sSampleID || '',
            testCode: limsOrderData.sTestCode || '',
            replicateID: limsOrderData.sReplicateID || '',
            ...limsOrderData
          };
          
          // Update lims order options
          setLimsOrderOptions([limsOrderOption]);
          setIsLimsOrderEnabled(true);
          
          // Update form data
          setFormData(prev => ({
            ...prev,
            limsOrder: String(limsOrderData.nOrderID),
            limsOrderID: String(limsOrderData.nOrderID),
            limsSampleID: limsOrderData.sSampleID || '',
            limsTestCode: limsOrderData.sTestCode || '',
            limsReplicateID: limsOrderData.sReplicateID || ''
          }));
          
          // Clear the stored data
          sessionStorage.removeItem('deactivatedLIMSOrderData');
        }
      } catch (error) {
        console.error('Error restoring LIMS order data:', error);
        sessionStorage.removeItem('deactivatedLIMSOrderData');
      }
    }
  };
  
  // Run when instrument changes
  restoreLIMSOrderData();
}, [formData.instrument]);

  // 9. Navigation event listeners
  useEffect(() => {
    const handleNavigateBackForActivation = (event) => {
      console.log('🔄 Received navigateToDeactivatedForActivation event:', event.detail);
      
      const { scheduleId, activateData, lockCompleted } = event.detail || {};
      
      if (lockCompleted && scheduleId && activateData) {
        console.log('✅ Lock completed, navigating back to DeactivatedTask to activate schedule:', scheduleId);
        
        if (window.opener || window.parent !== window) {
          window.parent.postMessage({
            type: 'LOCK_COMPLETED_ACTIVATE_NOW',
            scheduleId: scheduleId,
            activateData: activateData
          }, '*');
        } else {
          window.dispatchEvent(new CustomEvent('instrumentLockCompleted', {
            detail: {
              scheduleId: scheduleId,
              activateData: activateData,
              lockCompleted: true
            }
          }));
        }
      }
    };
    
    const handleNavigateToActivated = (event) => {
      const data = event.detail;
      console.log('🚀 Received navigate-to-activated-after-lock event:', data);
      
      if (navigateAfterLock) {
        window.dispatchEvent(new CustomEvent('instrument-lock-complete-navigate', {
          detail: {
            target: 'ActivatedTask',
            data: data
          }
        }));
      }
    };
    
    window.addEventListener('navigateToDeactivatedForActivation', handleNavigateBackForActivation);
    window.addEventListener('navigate-to-activated-after-lock', handleNavigateToActivated);
    
    return () => {
      window.removeEventListener('navigateToDeactivatedForActivation', handleNavigateBackForActivation);
      window.removeEventListener('navigate-to-activated-after-lock', handleNavigateToActivated);
    };
  }, [navigateAfterLock]);

  // ========== FORM EVENT HANDLERS ==========
  const handleClientChange = useCallback(async (value) => {
    const currentTemplate = formData.template;
    
    setFormData(prev => ({ 
      ...prev, 
      client: value, 
      instrument: '', 
      path: '', 
      fileName: '', 
      limsOrder: '',
      template: currentTemplate
    }));
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
  
  // Reset the last load reference
  lastLoadRef.current = { template: '', instrument: '' };
  
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
        
        // Template handling is now done in onChangeInstrumentCombo
        // Don't override template here
        
        setFormData(prev => ({ ...prev, ...updates }));
      }
      
      await loadPaths(value);
      
    } finally {
      setIsLoading(false);
    }
  } else {
    setIsLoading(false);
  }
}, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
    isInterfaceInstrument, isLocked, t]);

  const handlePathChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, path: value }));
    setErrors(prev => ({ ...prev, path: false }));
  }, []);

  const handleTemplateChange = useCallback((value) => {
    console.log('📋 User manually changed template from:', formData.template, 'to:', value);
    
    lastLoadRef.current = { template: '', instrument: '' };
    
    setFormData(prev => ({ ...prev, template: value }));
    setErrors(prev => ({ ...prev, template: false }));
    
    setTags([]);
    setTagErrors({});
  }, [formData.template]);

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

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  }, []);


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

// Add this at the beginning of the function
console.log('🔧 Navigation functions available:', {
  navigateFromDeactivatedToActivatedTask: !!navigateFromDeactivatedToActivatedTask,
  navigateToTab: !!navigateToTab,
  navigateAfterLock: !!navigateAfterLock
});
// Add detailed logging
console.log('🔍 Detailed source check:', {
  scheduleData: scheduleData,
  scheduleDataKeys: scheduleData ? Object.keys(scheduleData) : 'none',
  scheduleDataL13ScheduleID: scheduleData?.L13ScheduleID,
  navigationData: navigationData?.data?.scheduleData,
  deactiveRef: getDeactiveScheduleDataRef.current
});
const performLockActionWithData = useCallback(async (lockData) => {
  try {
    setIsSubmitting(true);
    
    console.log('🔒 Calling Lock Instrument API');
    const result = await makeAjaxCall(endpoints.lockInstrument, lockData, "LockInstrument");
    
    console.log('📥 Lock response:', result);
    
    if (result?.oResObj?.bStatus === true) {
      const successMessage = result.oResObj.sInformation || t('instrumentlocktag.instrumentlockedsuccessfully');
      const instrumentId = result.oResObj.sInstrumentID || formData.instrument;
      
      console.log('✅ Lock successful!');
      
      // Update lock states
      setIsLocked(true);
      setIsAutoLocked(false);
      setLockedByOtherUser(false);
      
      if (result.oResObj.nMergeFileCount) {
        setFormData(prev => ({ 
          ...prev, 
          mergeFileCount: String(result.oResObj.nMergeFileCount) 
        }));
        setSessionValue("LockedMergeCount", String(result.oResObj.nMergeFileCount));
      }
      
      // ========== SIMPLIFIED NAVIGATION LOGIC ==========
      console.log('🔍 Checking where to navigate...');
      
      // Check ALL possible sources for Data Scheduler or Deactivated Task
      const hasScheduleData = scheduleData && Object.keys(scheduleData).length > 0;
      const hasNavigationData = navigationData?.data?.scheduleData;
      const hasDeactiveDataRef = getDeactiveScheduleDataRef.current;
      const fromSchedulerSession = sessionStorage.getItem('fromScheduler') === 'true';
      const fromDeactivatedSession = sessionStorage.getItem('fromDeactivatedTask') === 'true';
      
      console.log('📊 Navigation sources:', {
        hasScheduleData,
        hasNavigationData,
        hasDeactiveDataRef,
        fromSchedulerSession,
        fromDeactivatedSession
      });
      
      // ========== CASE 1: From Data Scheduler OR Deactivated Task ==========
      if (hasScheduleData || hasNavigationData || hasDeactiveDataRef || fromSchedulerSession || fromDeactivatedSession) {
        console.log('🚀 FROM SCHEDULER/DECTIVATED TASK → Navigate to Activated Task');
        
        // Extract schedule ID
        let scheduleId = null;
        
        // Try all possible sources
        if (hasScheduleData && scheduleData.L13ScheduleID) {
          scheduleId = scheduleData.L13ScheduleID;
        } else if (hasNavigationData && navigationData.data.scheduleData?.L13ScheduleID) {
          scheduleId = navigationData.data.scheduleData.L13ScheduleID;
        } else if (hasDeactiveDataRef && getDeactiveScheduleDataRef.current?.L13ScheduleID) {
          scheduleId = getDeactiveScheduleDataRef.current.L13ScheduleID;
        }
        
        console.log('📍 Schedule ID for navigation:', scheduleId);
        
        if (scheduleId) {
          // DON'T show success dialog - navigate immediately
          
          // Clear all session storage
          sessionStorage.removeItem('fromScheduler');
          sessionStorage.removeItem('schedulerData');
          sessionStorage.removeItem('fromDeactivatedTask');
          sessionStorage.removeItem('deactivatedTaskData');
          sessionStorage.removeItem('lockAndActivateFlow');
          
          // Navigate to Activated Task
          if (navigateFromDeactivatedToActivatedTask) {
            console.log('📍 Using navigateFromDeactivatedToActivatedTask');
            navigateFromDeactivatedToActivatedTask({
              scheduleId: scheduleId,
              highlightScheduleId: scheduleId,
              shouldScrollToSchedule: true,
              fromInstrumentLock: true,
              message: 'Instrument locked successfully. Schedule ready for activation.'
            });
          } else if (navigateToTab) {
            console.log('📍 Using navigateToTab');
            navigateToTab('Scheduler', 'View Edit Scheduler', {
              innerTab: 'Activated Task',
              scheduleId: scheduleId,
              highlightScheduleId: scheduleId,
              fromInstrumentLock: true
            });
          }
          
          return; // Exit - no success message shown
        }
      }
      
      // ========== CASE 2: Manual lock (parser instrument) ==========
      console.log('📌 Manual lock for parser instrument');
      
      // Show success message
      showErrorDialogMessage(successMessage, 'success');
      
      // Navigate to Data page only for parser instruments
      const isParserInstrument = !isInterfaceInstrument(instrumentId);
      if (instrumentId && navigateAfterLock && isParserInstrument) {
        console.log('🔍 Parser instrument, navigating to Data page');
        navigateAfterLock(instrumentId);
      }
      
    } else {
      // Handle lock errors
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
    console.error('❌ Lock action failed:', error);
    showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
  } finally {
    setIsSubmitting(false);
  }
}, [
  formData.instrument,
  t,
  showErrorDialogMessage,
  makeAjaxCall,
  endpoints.lockInstrument,
  navigateFromDeactivatedToActivatedTask,
  navigateToTab,
  navigateAfterLock,
  navigationData,
  scheduleData,
  isInterfaceInstrument
]);



  const handleUnlockSuccess = useCallback(async (result) => {
    const successMessage = result?.oResObj?.sInformation || t('instrumentlocktag.instrumentunlockedsuccessfully');
    const instrumentName = result?.oResObj?.sInstrument || t('label.instrument');
    
    // Reset lock states
    setIsLocked(false);
    setIsAutoLocked(false);
    setLockedByOtherUser(false);
    
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
      template: currentTemplate
    }));
    
    setErrors({});
    setTagErrors({});
    
    setTags(prev => prev.map(tag => ({
      ...tag,
      value: '',
      valueID: '',
      options: tag.tagID === 1 ? tag.options : []
    })));
    
    showErrorDialogMessage(
      `${instrumentName} ${successMessage}`,
      'success'
    );
  }, [t, formData.template]);

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
        const errorMessage = result?.oResObj?.sInformation || '';
        if (errorMessage.toLowerCase().includes('already unlocked') || 
            errorMessage.toLowerCase().includes('not locked')) {
          
          // Force refresh lock status
          setIsLocked(false);
          setIsAutoLocked(false);
          setLockedByOtherUser(false);
          
          if (formData.instrument) {
            await onChangeInstrumentCombo(formData.instrument);
          }
        }
        
        showErrorDialogMessage(errorMessage || t('instrumentlocktag.failedtounlockinstrument'), 'error');
      }
      
    } catch (error) {
      showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, prepareUnlockData, t, handleUnlockSuccess, onChangeInstrumentCombo]);

const handleUnlock = useCallback(async () => {
    if (!isLocked) {
      showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
      return;
    }

    if (isAutoLocked) {
      showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
      return;
    }

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

    if (lockedByOtherUser) {
      const activeUserDetails = getActiveUserDetails();
      const isAdmin = activeUserDetails.sUsername === "Administrator" || 
                     activeUserDetails.ActiveUserDetails?.sUsername === "Administrator";
      
      if (!isAdmin) {
        showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
        return;
      }
    }
    
    // Check if audit trail is required
    const auditRights = sessionStorage.getItem('auditTrailRights');
    const requiresAudit = auditRights ? JSON.parse(auditRights).some(
      right => right.sScreenName.includes("Instrument Lock") && right.nManualAuditTrail === 1
    ) : false;

    console.log("🔐 Audit trail required for unlock:", requiresAudit);

    if (requiresAudit) {
      console.log("🔐 Showing audit trail for unlock...");
      setShowAuditTrail(true);
      setAuditAction('unlock');
      setAuditCallback(() => async (auditData) => {
        await performUnlockAction(auditData, "true");
      });
    } else {
      console.log("⚡ No audit required, performing unlock directly");
      await performUnlockAction(null, "true");
    }
  }, [isLocked, isAutoLocked, formData.instrument, formData.path, lockedByOtherUser, 
      getActiveUserDetails, t, showErrorDialogMessage, setErrors, performUnlockAction]);
  

const handleLock = useCallback(async () => {
  console.log('🔐 handleLock called');
  
  // Set a flag to indicate this is a lock-and-activate flow
  sessionStorage.setItem('lockAndActivateFlow', 'true');
  
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
        
        // ... existing interface check code ...
        
      } catch (error) {
        // Continue with lock even if check fails
      } finally {
        setIsLoading(false);
      }
    }
  }
  
  // Check if audit trail is required
  const auditRights = sessionStorage.getItem('auditTrailRights');
  const requiresAudit = auditRights ? JSON.parse(auditRights).some(
    right => right.sScreenName.includes("Instrument Lock") && right.nManualAuditTrail === 1
  ) : false;

  console.log("🔐 Audit trail required for lock:", requiresAudit);

  if (requiresAudit) {
    console.log("🔐 Showing audit trail for lock...");
    setShowAuditTrail(true);
    setAuditAction('lock');
    setAuditCallback(() => async (auditData) => {
      await performLockAction(auditData, "CheckAndInsert");
    });
  } else {
    console.log("⚡ No audit required, performing lock directly");
    await performLockAction(null, "CheckAndInsert");
  }
  
  setIsSubmitting(false);
}, [validateFormForLock, isAutoLocked, formData.instrument, isInterfaceInstrument, 
    endpoints, makeAjaxCall, t, showErrorDialogMessage, getDeactiveScheduleDataRef, 
    performLockAction, setIsLoading, setIsSubmitting, navigationData]);

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


const getFieldDisabledState = useMemo(() => {
  const isFromDeactivatedTask = navigationData?.data?.scheduleData || 
                                sessionStorage.getItem('fromDeactivatedTask') === 'true';
  
  console.log('🔧 Field disabled state check:', {
    isFromDeactivatedTask,
    isLocked,
    lockedByOtherUser,
    isAutoLocked,
    currentState: isLocked ? 'LOCKED' : 'NOT LOCKED'
  });
  
  // ====== CASE 1: From Deactivated Task (Instrument is NOT locked yet) ======
  if (isFromDeactivatedTask) {
    // When from deactivated task, instrument is NOT locked initially
    // We need to lock it for the first time
    return {
      client: true,           // Disabled - user cannot change
      instrument: true,       // Disabled - user cannot change
      path: true,             // Disabled - user cannot change
      limsOrder: false,       // Enabled
      fileName: false,        // Enabled
      template: false,        // Enabled - user needs to select template
      mergeCount: false,      // Enabled
      unlockCheckbox: false,  // Enabled
      tags: false,            // Enabled - user needs to fill tags
      lockButton: false,      // ENABLED - user can lock the instrument
      unlockButton: true      // DISABLED - instrument is not locked yet
    };
  }
  
  // ====== CASE 2: Auto-locked instrument ======
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
      lockButton: true,      // Disabled - auto-locked
      unlockButton: true     // Disabled - auto-locked
    };
  }
  
  // ====== CASE 3: Regular locked by current user ======
  if (isLocked && !lockedByOtherUser && !isAutoLocked) {
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
      lockButton: false,     // Disabled (shows Update button instead)
      unlockButton: false    // Enabled - can unlock
    };
  }
  
  // ====== CASE 4: Locked by other user ======
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
      lockButton: true,      // Disabled
      unlockButton: false    // Enabled if admin
    };
  }
  
  // ====== CASE 5: Default - Not locked, not from deactivated task ======
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
    lockButton: false,      // Enabled - can lock
    unlockButton: true      // Disabled - not locked
  };
}, [isLocked, lockedByOtherUser, isAutoLocked, navigationData]);

  useEffect(() => {
  console.log('🔍 BUTTON STATES DEBUG:', {
    isLocked,
    lockedByOtherUser,
    isAutoLocked,
    lockButtonDisabled: getFieldDisabledState.lockButton,
    unlockButtonDisabled: getFieldDisabledState.unlockButton,
    fromDeactivatedTask: navigationData?.data?.scheduleData ? 'yes' : 'no'
  });
}, [isLocked, lockedByOtherUser, isAutoLocked, getFieldDisabledState]);

// Add this function in InstrumentLockTag
const clearNavigationAfterUse = useCallback(() => {
  console.log('🧹 Clearing navigation data after lock');
  
  // Clear context navigation state
  if (clearNavigation) {
    clearNavigation();
  }
  
  // Clear all session storage
  sessionStorage.removeItem('fromDeactivatedTask');
  sessionStorage.removeItem('deactivatedTaskData');
  sessionStorage.removeItem('schedulerData');
  sessionStorage.removeItem('fromScheduler');
  sessionStorage.removeItem('pendingActivationData');
  sessionStorage.removeItem('lockAndActivateFlow');
  sessionStorage.removeItem('originalScheduleId');
  sessionStorage.removeItem('deactivatedLIMSOrderData');
  
  // Clear refs
  hasProcessedNavigationData.current = false;
  initialLoadDoneRef.current = false;
  lastLoadRef.current = { template: '', instrument: '' };
  getDeactiveScheduleDataRef.current = null;
  
  console.log('✅ Navigation data cleared');
}, [clearNavigation]);

// Add to cleanup effect
useEffect(() => {
  return () => {
    clearNavigationAfterUse();
  };
}, [clearNavigationAfterUse]);

  // ========== UI RENDER LOGIC ==========



  const showFullPageLoader = isLoading || isSubmitting || isLoadingTags || isLoadingOptions || isLoadingFromScheduler;

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
  onClick={handleLock}
  disabled={getFieldDisabledState.lockButton || showFullPageLoader}
  className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
    ${getFieldDisabledState.lockButton || showFullPageLoader
      ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
      : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
  `}
  title={navigationData?.data?.scheduleData ? 
    "Lock instrument → Activate schedule" : 
    (isLocked ? "Update lock settings" : "Lock instrument")}
>
  <LockIcon />
  <span>
    {navigationData?.data?.scheduleData ? 
      t('button.lock') : 
      (isLocked && !lockedByOtherUser && !isAutoLocked ? t('button.update') : t('button.lock'))}
  </span>
</button>

  <button
    onClick={() => {
      console.log('🔓 Unlock button clicked');
      handleUnlock();
    }}
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