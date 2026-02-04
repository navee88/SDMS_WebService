// // import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// // import { useTranslation } from 'react-i18next';
// // import AuditTrail from '../../../../Layout/Common/AuditTrail';
// // import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
// // import Errordialog from '../../../../Layout/Common/Errordialog';
// // import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
// // import servicecall from '../../../../../Services/servicecall';
// // import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
// // //need to add this
// // // import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';


// // const LockIcon = () => (
// //   <i className="fa fa-lock text-xs mr-1"></i>
// // );

// // const UnlockIcon = () => (
// //   <i className="fa fa-unlock text-xs mr-1"></i>
// // );

// // const UpdateIcon = () => (
// //   <i className="fa fa-pencil-square-o text-xs mr-1"></i>
// // );

// // const EditPencilIcon = () => (
// //   <i className="fa fa-pencil text-xl mr-0.5"></i>
// // );

// // // MergeFileCountRow Component
// // const MergeFileCountRow = ({ mergeCount, currentCount, onMergeChange, disabled, showMergeFields, t }) => {
// //   if (!showMergeFields) return null;

// //   const handleChange = (e) => {
// //     const value = e.target.value;
// //     if (value === '' || /^\d+$/.test(value)) {
// //       const numValue = parseInt(value) || 0;
// //       if (numValue > 10000) {
// //         onMergeChange("10000");
// //       } else {
// //         onMergeChange(value);
// //       }
// //     }
// //   };

// //   return (
// //     <div className="mb-6 mt-7">
// //       <div className="flex items-center gap-6">
// //         <div className="flex items-center gap-2">
// //           <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
// //             {t('instrumentlocktag.mergefilecount')}
// //           </label>
// //           <input
// //             type="text"
// //             value={mergeCount}
// //             onChange={handleChange}
// //             onBlur={(e) => {
// //               if (e.target.value === '' || parseInt(e.target.value) < 1) {
// //                 onMergeChange("1");
// //               }
// //             }}
// //             disabled={disabled}
// //             className="w-16 h-7 px-2 text-xs text-center font-['verdana'] border border-gray-300 rounded bg-white hover:border-gray-400 text-[#405F7D]"
// //           />
// //         </div>

// //         <div className="flex items-center gap-2">
// //           <label className="text-xs text-[#405F7D] min-w-[150px] font-semibold font-roboto">
// //             {t('instrumentlocktag.currentuploadfilecount')}
// //           </label>
// //           <input
// //             type="text"
// //             value={currentCount}
// //             disabled={true}
// //             className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-[#405F7D] font-verdana"
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // TagGrid Component
// // const InlineEditIcon = () => (
// //   <i className="fa fa-edit text-lg mr-1"></i>
// // );

// // const TagGrid = React.memo(({ tags, onTagValueClick, isLoadingTags, isLocked, lockedByOtherUser, isAutoLocked, onTagEditRequest, onInlineEditSubmit, t, tagErrors }) => {
// //   const [tooltipState, setTooltipState] = useState({
// //     isOpen: false,
// //     tagIndex: null,
// //     position: { top: 0, left: 0 },
// //     searchTerm: '',
// //     selectedValue: '',
// //     selectedValueID: '',
// //     options: []
// //   });

// //   const [selectedTagIndex, setSelectedTagIndex] = useState(null);
// //   const [showErrorDialog, setShowErrorDialog] = useState(false);
// //   const [errorMessage, setErrorMessage] = useState('');
// //   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
// //   const [inlineEditState, setInlineEditState] = useState({
// //     isEditing: false,
// //     tagIndex: null,
// //     inputValue: ''
// //   });

// //   const showInformationMessage = (message) => {
// //     setErrorMessage(message);
// //     setShowErrorDialog(true);
// //   };

// //   const canEditTag = useCallback((tagIndex) => {
// //     if (tagIndex === 0) return true;
// //     for (let i = 0; i < tagIndex; i++) {
// //       if (!tags[i]?.value) return false;
// //     }
// //     return true;
// //   }, [tags]);

// //   const getErrorMessage = useCallback((tagIndex) => {
// //     for (let i = tagIndex - 1; i >= 0; i--) {
// //       if (!tags[i]?.value) {
// //         return `${t('instrumentlocktag.pleaseselect')} ${tags[i]?.tagName} ${t('instrumentlocktag.value').toLowerCase()} first`;
// //       }
// //     }
// //     return `${t('instrumentlocktag.pleaseselect')} required ${t('instrumentlocktag.value').toLowerCase()} first`;
// //   }, [tags, t]);

// //   const handleEditClick = async (tag, index, event) => {
// //     event.stopPropagation();

// //     const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
// //     if (shouldDisableEdit) return;

// //     if (tag.required && tag.tagID !== 0) {
// //       if (!canEditTag(index)) {
// //         showInformationMessage(getErrorMessage(index));
// //         return;
// //       }

// //       const calculateTooltipPositionFromRect = (buttonRect) => {
// //         const viewportHeight = window.innerHeight;
// //         const viewportWidth = window.innerWidth;
// //         const tooltipWidth = 250;
// //         const tooltipHeight = 220;

// //         let left = buttonRect.left - tooltipWidth + 0;
// //         let top = buttonRect.top - (tooltipHeight) + 10;

// //         if (top < 10) top = 10;
// //         if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
// //         if (left < 10) left = buttonRect.right + 10;
// //         if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;

// //         return { top, left };
// //       };

// //       const buttonRect = event.currentTarget.getBoundingClientRect();
// //       const position = calculateTooltipPositionFromRect(buttonRect);

// //       setSelectedTagIndex(index);

// //       if (tag.options && tag.options.length > 0) {
// //         setTooltipState({
// //           isOpen: true,
// //           tagIndex: index,
// //           position,
// //           searchTerm: '',
// //           selectedValue: tag.value || '',
// //           selectedValueID: tag.valueID || '',
// //           options: tag.options
// //         });
// //         return;
// //       }

// //       setIsLoadingOptions(true);

// //       try {
// //         const options = await onTagEditRequest(index);

// //         setTooltipState({
// //           isOpen: true,
// //           tagIndex: index,
// //           position,
// //           searchTerm: '',
// //           selectedValue: tag.value || '',
// //           selectedValueID: tag.valueID || '',
// //           options: options || []
// //         });
// //       } catch (error) {
// //         console.error("Error loading tag options:", error);
// //         showInformationMessage(t('instrumentlocktag.failedtoloadoptions'));
// //       } finally {
// //         setIsLoadingOptions(false);
// //       }
// //     } else {
// //       setInlineEditState({
// //         isEditing: true,
// //         tagIndex: index,
// //         inputValue: tag.value || ''
// //       });
// //     }
// //   };

// //   const handleInlineEditSubmit = () => {
// //     if (inlineEditState.tagIndex !== null && inlineEditState.inputValue !== undefined) {
// //       onInlineEditSubmit(
// //         inlineEditState.tagIndex,
// //         inlineEditState.inputValue,
// //         inlineEditState.inputValue
// //       );
// //     }
// //     setInlineEditState({
// //       isEditing: false,
// //       tagIndex: null,
// //       inputValue: ''
// //     });
// //   };

// //   const handleInlineEditCancel = () => {
// //     setInlineEditState({
// //       isEditing: false,
// //       tagIndex: null,
// //       inputValue: ''
// //     });
// //   };

// //   const handleTooltipSubmit = () => {
// //     if (tooltipState.tagIndex !== null) {
// //       onTagValueClick(
// //         tooltipState.tagIndex,
// //         tooltipState.selectedValue || '',
// //         tooltipState.selectedValueID || ''
// //       );
// //     }
// //     setTooltipState({
// //       isOpen: false,
// //       tagIndex: null,
// //       position: { top: 0, left: 0 },
// //       searchTerm: '',
// //       selectedValue: '',
// //       selectedValueID: '',
// //       options: []
// //     });
// //   };

// //   const handleTooltipClose = () => {
// //     setTooltipState({
// //       isOpen: false,
// //       tagIndex: null,
// //       position: { top: 0, left: 0 },
// //       searchTerm: '',
// //       selectedValue: '',
// //       selectedValueID: '',
// //       options: []
// //     });
// //   };

// //   const handleOptionClick = (optionValue, optionValueID) => {
// //     setTooltipState(prev => ({
// //       ...prev,
// //       selectedValue: optionValue,
// //       selectedValueID: optionValueID
// //     }));
// //   };

// //   const handleSearchChange = (value) => {
// //     setTooltipState(prev => ({
// //       ...prev,
// //       searchTerm: value
// //     }));
// //   };

// //   const filteredOptions = tooltipState.options.filter(opt =>
// //     opt.label.toLowerCase().includes(tooltipState.searchTerm.toLowerCase())
// //   );

// //   if (isLoadingTags) {
// //     return (
// //       <div className="border border-[#f3f3f3] rounded relative">
// //         <div className="flex justify-center items-center h-[250px]">
// //           <div className="text-sm text-gray-500">{t('common.loading')}...</div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <>
// //       <div className="border border-[#f3f3f3] rounded relative">
// //         <div className="grid grid-cols-2 bg-[#fbfbfb] border-b border-[#f3f3f3]">
// //           <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
// //             {t('instrumentlocktag.tagName')}
// //           </div>
// //           <div className="px-1 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
// //             {t('instrumentlocktag.tagValue')}
// //           </div>
// //         </div>

// //         <div className="bg-white min-h-[250px]">
// //           {tags.length === 0 ? (
// //             <div className="px-4 py-12 text-center text-xs text-[#4b4b4b] font-roboto">
// //               {t('instrumentlocktag.noTagValue')}
// //             </div>
// //           ) : (
// //             tags.map((tag, idx) => {
// //               const isSelected = selectedTagIndex === idx;
// //               const isThisTagLoading = isLoadingOptions && isSelected;
// //               const isInlineEditing = inlineEditState.isEditing && inlineEditState.tagIndex === idx;
// //               const hasError = tagErrors[idx] && tag.required && !tag.value;

// //               const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
// //               const isDropdownMode = tag.required && tag.tagID !== 0;
// //               const showEditIcon = tag.editable && !shouldDisableEdit;

// //               return (
// //                 <div
// //                   key={`tag-${idx}-${tag.tagID}`}
// //                   className={`grid grid-cols-2 border-b border-[#e7e6e6] last:border-b-1 min-h-[40px]
// //                     ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#378cfc]' : 'bg-white border-l-4 border-l-transparent'}
// //                     ${hasError ? 'border-b-2 border-b-red-400' : ''}
// //                     ${tag.editable && !shouldDisableEdit ? 'cursor-pointer hover:bg-[#eef2f9]' : 'cursor-default'}
// //                   `}
// //                   onClick={() => setSelectedTagIndex(idx)}
// //                 >
// //                   <div className={`px-4 text-xs flex items-center font-['verdana']
// //                     ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
// //                   `}>
// //                     {tag.tagName}
// //                     {tag.required && <span className="text-red-500 ml-1">*</span>}
// //                   </div>

// //                   <div className="px-0.5 py-0 text-xs flex items-center justify-between gap-0">
// //                     {isInlineEditing ? (
// //                       <div className="flex-1 flex items-center">
// //                         <input
// //                           type="text"
// //                           value={inlineEditState.inputValue}
// //                           onChange={(e) => setInlineEditState(prev => ({
// //                             ...prev,
// //                             inputValue: e.target.value
// //                           }))}
// //                           className={`w-full h-9 px-0.5 text-xs font-bold border border-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:border-white
// //                             ${hasError ? 'border-red-400' : ''}`}
// //                           autoFocus
// //                           onBlur={handleInlineEditSubmit}
// //                           onKeyDown={(e) => {
// //                             if (e.key === 'Enter') {
// //                               handleInlineEditSubmit();
// //                             } else if (e.key === 'Escape') {
// //                               handleInlineEditCancel();
// //                             }
// //                           }}
// //                         />
// //                       </div>
// //                     ) : (
// //                       <>
// //                         <span className={`flex-1 font-['verdana'] ${isSelected ? 'font-bold' : ''
// //                           } text-[#373737]`}>
// //                           {tag.value || ''}
// //                           {isThisTagLoading && (
// //                             <span className="ml-2 text-xs text-gray-500">{t('common.loading')}...</span>
// //                           )}
// //                         </span>

// //                         {showEditIcon && (
// //                           <button
// //                             onClick={(e) => {
// //                               setSelectedTagIndex(idx);
// //                               handleEditClick(tag, idx, e);
// //                             }}
// //                             className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool"
// //                             title={t('button.edit')}
// //                             disabled={isThisTagLoading}
// //                           >
// //                             {isDropdownMode ? (
// //                               <EditPencilIcon />
// //                             ) : (
// //                               <InlineEditIcon />
// //                             )}
// //                           </button>
// //                         )}
// //                       </>
// //                     )}
// //                   </div>
// //                 </div>
// //               );
// //             })
// //           )}
// //         </div>
// //       </div>

// //       {showErrorDialog && (
// //         <Errordialog
// //           message={errorMessage}
// //           type="information"
// //           onClose={() => setShowErrorDialog(false)}
// //           okText={t('button.ok')}
// //         />
// //       )}

// //       {tooltipState.isOpen && (
// //         <div
// //           className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col"
// //           style={{
// //             top: `${tooltipState.position.top}px`,
// //             left: `${tooltipState.position.left}px`,
// //           }}
// //         >
// //           <div className="p-0.5 border-gray-200">
// //             <div className="mb-0">
// //               <input
// //                 type="text"
// //                 value={tooltipState.searchTerm}
// //                 onChange={(e) => handleSearchChange(e.target.value)}
// //                 className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
// //                 autoFocus
// //                 placeholder={t('instrumentlocktag.searchplaceholder')}
// //               />
// //             </div>
// //           </div>

// //           <div className="flex-1 overflow-y-auto min-h-0">
// //             {filteredOptions.length === 0 ? (
// //               <div className="text-center py-6 text-xs text-gray-500 font-roboto">
// //                 {t('instrumentlocktag.nooptionsfound')}
// //               </div>
// //             ) : (
// //               filteredOptions.map((option, idx) => {
// //                 const isSelected = tooltipState.selectedValue === option.label &&
// //                   tooltipState.selectedValueID === option.value;

// //                 return (
// //                   <div
// //                     key={`option-${idx}-${option.value}`}
// //                     onClick={() => handleOptionClick(option.label, option.value)}
// //                     onDoubleClick={handleTooltipSubmit}
// //                     className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
// //                       ${isSelected ? 'bg-[#f2f2f2]' : ''}
// //                       ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
// //                     `}
// //                   >
// //                     <div className="flex items-center ml-1">
// //                       <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
// //                         {option.label}
// //                       </span>
// //                     </div>
// //                   </div>
// //                 );
// //               })
// //             )}
// //           </div>

// //           <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
// //             <button
// //               onClick={handleTooltipSubmit}
// //               className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
// //             >
// //               <i className="fa fa-check-square-o mr-1"></i>
// //               {t('button.submit')}
// //             </button>
// //             <button
// //               onClick={handleTooltipClose}
// //               className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
// //             >
// //               <i className="fa fa-times mr-1"></i>
// //               {t('button.cancel')}
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // });

// // TagGrid.displayName = 'TagGrid';

// // // Main Component
// // //need to add this(props)
// // const InstrumentLockTag = ({ scheduleData, navigationData, onNavigateToMyInstruments,
// //   onClearNavigation }) => {
// //   const { t } = useTranslation();
// //   const { postData } = servicecall();

// //   const endpoints = {
// //     lockTemplateCombo: "InstrumentLock/LockTemplateCombo",
// //     loadTagCategory: "InstrumentLock/LoadTagCategory",
// //     clientLockCombo: "InstrumentLock/clientlockcombo",
// //     lockInstrumentCombo: "InstrumentLock/LockInstrumentCombo",
// //     lockPathCombo: "InstrumentLock/LockPathCombo",
// //     loadCategoryTagValueAndID: "InstrumentLock/LoadCategoryTagValueAndID",
// //     lockUserCombo: "InstrumentLock/LockUserCombo",
// //     mergeFileAndAutoUnlock: "InstrumentLock/MergeFileAndAutounlock",
// //     loadProtocol: "InstrumentLock/LoadProtocol",
// //     lockLimsordercombo: "InstrumentLock/lockLimsordercombo",
// //     onChangeInstrumentCombo: "InstrumentLock/OnChangeInstrumentCombo",
// //     lockActiveParsingInstrumentCombo: "InstrumentLock/LockActiveParsingInstrumentCombo",
// //     lockDeactiveParsingInstrumentCombo: "InstrumentLock/LockDeactiveParsingInstrumentCombo",
// //     lockActiveInstrumentPathCombo: "InstrumentLock/LockActiveInstrumentPathCombo",
// //     lockDeactiveInstrumentPathCombo: "InstrumentLock/LockDeactiveInstrumentPathCombo",
// //     interfaceConnectionChecking: "InstrumentLock/InterfaceConnectionChecking",
// //     lockInstrument: "InstrumentLock/LockInstrument",
// //     unLockInstrument: "InstrumentLock/UnLockInstrument"
// //   };

// //   const [showErrorDialog, setShowErrorDialog] = useState(false);
// //   const [errorDialogMessage, setErrorDialogMessage] = useState('');
// //   const [errorDialogType, setErrorDialogType] = useState('information');
// //   const [errorDialogCallback, setErrorDialogCallback] = useState(null);
// //   //need to add this
// //   // const { getSubmissionData, clearNavigation } = useSchedulerNavigation();

// //   const showErrorDialogMessage = (message, type = 'information', onConfirm = null) => {
// //     if (type === 'confirmation' && onConfirm) {
// //       setErrorDialogMessage(message);
// //       setErrorDialogType('confirmation');
// //       setErrorDialogCallback(() => onConfirm);
// //       setShowErrorDialog(true);
// //     } else {
// //       setErrorDialogMessage(message);
// //       setErrorDialogType(type);
// //       setErrorDialogCallback(null);
// //       setShowErrorDialog(true);
// //     }
// //   };

// //   const handleErrorDialogClose = () => {
// //     setShowErrorDialog(false);
// //     setErrorDialogCallback(null);
// //   };

// //   const handleErrorDialogConfirm = () => {
// //     if (errorDialogCallback) {
// //       errorDialogCallback();
// //     }
// //     setShowErrorDialog(false);
// //     setErrorDialogCallback(null);
// //   };

// //   // Use activeUserDetails component directly
// //   const getActiveUserDetails = useCallback(() => {
// //     const userDetails = CF_activeUserdetails();
// //     // Handle both structures: {ActiveUserDetails, ApplicationCode} or direct user object
// //     return {
// //       ...userDetails.ActiveUserDetails,
// //       sUserID: userDetails.ActiveUserDetails?.sUserID || userDetails.sUserID,
// //       sUsername: userDetails.ActiveUserDetails?.sUsername || userDetails.sUsername
// //     };
// //   }, []);

// //   const getSessionValue = (key) => {
// //     try {
// //       const value = sessionStorage.getItem(key);
// //       if (value === null) {
// //         switch (key) {
// //           case 'MergeCount': return '1';
// //           case 'FileName': return 'false';
// //           case 'L11ParserType': return '0';
// //           default: return "";
// //         }
// //       }
// //       return value;
// //     } catch {
// //       return "";
// //     }
// //   };

// //   const setSessionValue = (key, value) => {
// //     try {
// //       sessionStorage.setItem(key, value);
// //     } catch (error) {
// //       console.error(`Error setting session value ${key}:`, error);
// //     }
// //   };

// //   const makeAjaxCall = async (url, passObjDet, process) => {
// //     try {
// //       const userDetails = CF_activeUserdetails(); // This returns {ActiveUserDetails, ApplicationCode}

// //       let requestBody;

// //       if (url === endpoints.loadCategoryTagValueAndID) {
// //         requestBody = {
// //           passObjDet: passObjDet,
// //           ActiveUserDetails: userDetails.ActiveUserDetails, // Use the nested ActiveUserDetails
// //           ApplicationCode: userDetails.ApplicationCode
// //         };
// //       } else {
// //         requestBody = {
// //           ...passObjDet,
// //           ActiveUserDetails: userDetails.ActiveUserDetails, // Use the nested ActiveUserDetails
// //           ApplicationCode: userDetails.ApplicationCode
// //         };
// //       }

// //       const response = await postData(url, requestBody);

// //       if (!response) {
// //         return null;
// //       }

// //       if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
// //         throw new Error(response.Message || response.ErrorMessage || `${t('Auditpopup.somethingwentwrong')} ${url}`);
// //       }

// //       // Handle InterfaceConnectionChecking response
// //       if (process === "InterfaceConnectionChecking") {
// //         let formattedResponse;

// //         if (response.AuditTrailLogin !== undefined) {
// //           return [response];
// //         }

// //         if (Array.isArray(response)) {
// //           formattedResponse = response;
// //         } else if (response && typeof response === 'object') {
// //           if (response.AccessStatus !== undefined) {
// //             formattedResponse = [response];
// //           } else if (response[0] && response[0].AccessStatus !== undefined) {
// //             formattedResponse = Object.values(response);
// //           } else {
// //             formattedResponse = [response];
// //           }
// //         } else {
// //           formattedResponse = [];
// //         }

// //         return formattedResponse;
// //       }

// //       // Handle Lock/Unlock responses
// //       if (process === "LockInstrument" || process === "UnLockInstrument") {
// //         return response;
// //       }

// //       // Handle SelectPathFileUSerTemplate
// //       if (process === "SelectPathFileUSerTemplate") {
// //         return response.oResInstChange || response;
// //       }

// //       // Check for common response structures
// //       if (response.oResObj !== undefined) {
// //         return response.oResObj;
// //       }

// //       if (response.oResInstChange !== undefined) {
// //         return response.oResInstChange;
// //       }

// //       if (response.list !== undefined) {
// //         return response.list;
// //       }

// //       if (Array.isArray(response)) {
// //         return response;
// //       }

// //       return response;

// //     } catch (error) {
// //       console.error(`[ERROR] ${t('Auditpopup.somethingwentwrong')} ${url}:`, error);
// //       throw error;
// //     }
// //   };

// //   const getDeactiveScheduleDataRef = useRef(scheduleData);
// //   const initialLoadDoneRef = useRef(false);

// //   // const [formData, setFormData] = useState({
// //   //   client: '',
// //   //   instrument: '',
// //   //   path: '',
// //   //   limsOrder: '',
// //   //   fileName: '',
// //   //   template: '',
// //   //   mergeFileCount: '1',
// //   //   currentFileCount: '0',
// //   //   unlockAfterCapture: false,
// //   //   user: '',
// //   //   lockID: '',
// //   //   interfaceOrderID: '',
// //   //   protocolID: '0'
// //   // });

// //   const [formData, setFormData] = useState({
// //     clientId: '',       // Store Client ID internally
// //     clientName: '',     // Store Client Name for display
// //     instrument: '',
// //     path: '',
// //     limsOrder: '',
// //     fileName: '',
// //     template: '',
// //     mergeFileCount: '1',
// //     currentFileCount: '0',
// //     unlockAfterCapture: false,
// //     user: '',
// //     lockID: '',
// //     interfaceOrderID: '',
// //     protocolID: '0',
// //     client: ''          // Keep for backward compatibility
// //   });

// //   const [errors, setErrors] = useState({});
// //   const [tagErrors, setTagErrors] = useState({});
// //   const [isLocked, setIsLocked] = useState(false);
// //   const [showMergeFields, setShowMergeFields] = useState(false);
// //   const [showUnlockOption, setShowUnlockOption] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isLoadingTags, setIsLoadingTags] = useState(false);
// //   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
// //   const [isInstrumentInterface, setIsInstrumentInterface] = useState(false);
// //   const [isFileNameEnabled, setIsFileNameEnabled] = useState(false);
// //   const [isLimsOrderEnabled, setIsLimsOrderEnabled] = useState(false);
// //   const [lockedByOtherUser, setLockedByOtherUser] = useState(false);
// //   const [isAutoLocked, setIsAutoLocked] = useState(false);
// //   const [deviceType, setDeviceType] = useState('desktop');
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const [showAuditTrail, setShowAuditTrail] = useState(false);
// //   const [auditAction, setAuditAction] = useState(null);
// //   const [auditCallback, setAuditCallback] = useState(null);

// //   const [templateOptions, setTemplateOptions] = useState([]);
// //   const [clientOptions, setClientOptions] = useState([]);
// //   const [instrumentOptions, setInstrumentOptions] = useState([]);
// //   const [pathOptions, setPathOptions] = useState([]);
// //   const [limsOrderOptions, setLimsOrderOptions] = useState([]);
// //   const [userOptions, setUserOptions] = useState([]);
// //   const [tags, setTags] = useState([]);
// //   const [isLoadingFromNavigation, setIsLoadingFromNavigation] = useState(false);
// //   const [isLoadingFromScheduler, setIsLoadingFromScheduler] = useState(false);
// //   const [hasLoadedFromNavigation, setHasLoadedFromNavigation] = useState(false);

// //   const tagIdToNameMap = {
// //     1: "Sample",
// //     2: "Test",
// //     3: "Project",
// //     4: "BatchNo"
// //   };

// //   useEffect(() => {
// //     const device = sessionStorage.getItem("device") || "desktop";
// //     setDeviceType(device);
// //   }, []);

// //   const isInterfaceInstrument = useCallback((instrumentId) => {
// //     if (!instrumentId) return false;
// //     const parts = instrumentId.split(':');
// //     return parts.length > 1 && parts[1].trim() !== "0";
// //   }, []);

// //   const loadTagValues = useCallback(async (tagId, templateId, instrumentId, tagIndex, previousTagValueID = "") => {
// //     try {
// //       const requestBody = {
// //         uid: tagIndex || 0,
// //         sUserID: formData.path || "",
// //         nTagID: parseInt(tagId) || 0,
// //         sTagValueID: previousTagValueID || "          ",
// //         sInstrumentID: instrumentId.padEnd(10, ' '),
// //         sTemplateID: templateId
// //       };

// //       const response = await makeAjaxCall(endpoints.loadCategoryTagValueAndID, requestBody);

// //       if (response && Array.isArray(response)) {
// //         const options = response.map(item => ({
// //           value: item.sTagValueID ? item.sTagValueID.trim() : '',
// //           label: item.sTagValue || t('instrumentlocktag.unknownvalue')
// //         })).filter(opt => opt.value && opt.label);

// //         return options;
// //       }

// //       return [];

// //     } catch (error) {
// //       console.error(`${t('instrumentlocktag.errorloadingtagvalues')} ${tagId}:`, error);
// //       return [];
// //     }
// //   }, [formData.path, t]);

// //   const fetchTags = useCallback(async (templateId, instrumentId) => {
// //     if (!templateId || !instrumentId) {
// //       setTags([]);
// //       return;
// //     }

// //     setIsLoadingTags(true);
// //     try {
// //       const currentInstrumentId = instrumentId.padEnd(10, ' ');

// //       const requestBody = {
// //         sUserID: formData.path || "",
// //         ActiveUserDetails: getActiveUserDetails(),
// //         sInstrumentID: currentInstrumentId,
// //         ApplicationCode: "SDMS",
// //         sTemplateID: templateId
// //       };

// //       const response = await makeAjaxCall(endpoints.loadTagCategory, requestBody);

// //       if (Array.isArray(response) && response.length > 0) {
// //         const transformedTags = await Promise.all(response.map(async (item, index) => {
// //           const tagId = item.L58TagID || item.L8iTagID || index;
// //           const tagName = tagIdToNameMap[tagId] || item.L58TagName || t('instrumentlocktag.unknowntag');
// //           const value = item.Value || '';
// //           const valueID = item.ValueID || '';
// //           const required = item.L58ValueStatus || false;
// //           const order = item.L58Order || index;

// //           let options = [];
// //           if (index === 0 && tagId && required) {
// //             options = await loadTagValues(tagId, templateId, instrumentId, index, "");
// //           }

// //           return {
// //             tagName: tagName,
// //             value: value.trim(),
// //             valueID: valueID ? valueID.trim() : '',
// //             tagID: tagId,
// //             order: order,
// //             required: required,
// //             editable: true,
// //             options: options
// //           };
// //         }));

// //         transformedTags.sort((a, b) => a.order - b.order);
// //         setTags(transformedTags);

// //       } else {
// //         setTags([]);
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorfetchingtags'), error);
// //       setTags([]);
// //     } finally {
// //       setIsLoadingTags(false);
// //     }
// //   }, [formData.path, loadTagValues, t]);

// //   const handleInlineEditSubmit = useCallback((index, value, valueID) => {
// //     setTags(prev => {
// //       const updatedTags = prev.map((t, idx) => {
// //         if (idx === index) {
// //           return { ...t, value, valueID };
// //         }

// //         if (idx > index) {
// //           return { ...t, value: '', valueID: '', options: [] };
// //         }

// //         return t;
// //       });

// //       return updatedTags;
// //     });

// //     // Clear tag error when value is entered
// //     if (value) {
// //       setTagErrors(prev => ({ ...prev, [index]: false }));
// //     }
// //   }, []);

// //   const checkMergeAndAutoUnlockSettings = useCallback(async () => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.mergeFileAndAutoUnlock, {});

// //       if (response) {
// //         const showMerge = response.MergeCount?.[0]?.L67Status === false;
// //         setShowMergeFields(showMerge);

// //         const showUnlock = response.AutoUnlock?.[0]?.L67Status === false;
// //         setShowUnlockOption(showUnlock);

// //         if (response.MergeCountValue?.[0]?.L42ValueSettings) {
// //           const mergeCount = response.MergeCountValue[0].L42ValueSettings;
// //           setFormData(prev => ({ ...prev, mergeFileCount: mergeCount }));
// //           setSessionValue("MergeCount", mergeCount);
// //         }

// //         if (response.AutoUnlockValue?.[0]?.L42ValueSettings === "1") {
// //           setFormData(prev => ({ ...prev, unlockAfterCapture: true }));
// //         }
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorcheckingmergesettings'), error);
// //     }
// //   }, [t]);

// //   const loadUsers = useCallback(async () => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.lockUserCombo, {});

// //       if (Array.isArray(response) && response.length > 0) {
// //         const users = response.map(user => ({
// //           value: user.sUserID ? user.sUserID.trim() : '',
// //           label: user.sUserName || t('instrumentlocktag.unknownuser')
// //         }));

// //         setUserOptions(users);

// //         const activeUserDetails = getActiveUserDetails();
// //         const currentUserId = activeUserDetails.sUserID || "U1";

// //         const currentUser = users.find(user => user.value === currentUserId);
// //         if (currentUser) {
// //           setFormData(prev => ({ ...prev, user: currentUser.value }));
// //         }
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorloadingusers'), error);
// //     }
// //   }, [t]);

// //   const loadProtocol = useCallback(async (instrumentId) => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.loadProtocol, {
// //         sInstrumentID: instrumentId
// //       });

// //       if (response) {
// //         const parserTypeValue = String(response.L11ParserType || '0');

// //         const fileNameEnabled = response.FileName === "true";
// //         setIsFileNameEnabled(fileNameEnabled);

// //         setSessionValue("FileName", fileNameEnabled.toString());
// //         setSessionValue("L11ParserType", parserTypeValue);

// //         const isInterface = isInterfaceInstrument(instrumentId);
// //         setIsInstrumentInterface(isInterface);

// //         if (isInterface) {
// //           if (fileNameEnabled) {
// //             setIsLimsOrderEnabled(false);
// //           } else {
// //             setIsLimsOrderEnabled(true);
// //           }
// //         } else {
// //           setIsLimsOrderEnabled(false);
// //         }

// //         return response;
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorloadingprotocol'), error);
// //       return null;
// //     }
// //   }, [isInterfaceInstrument, t]);

// //   const loadLimsOrder = useCallback(async (interfaceInstId) => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.lockLimsordercombo, {
// //         nInterfaceInstID: interfaceInstId
// //       });

// //       if (Array.isArray(response) && response.length > 0) {
// //         const limsOrders = response.map(order => ({
// //           value: order.nOrderID ? String(order.nOrderID).trim() : '',
// //           label: order.LIMSOrder || t('instrumentlocktag.unknownorder'),
// //           orderID: order.nOrderID || '',
// //           sampleID: order.SampleID || '',
// //           testCode: order.TestCode || '',
// //           replicateID: order.ReplicateID || '',
// //           ...order
// //         }));

// //         setLimsOrderOptions(limsOrders);
// //         setIsLimsOrderEnabled(true);

// //         if (limsOrders.length > 0) {
// //           const firstOrder = limsOrders[0];
// //           setFormData(prev => ({
// //             ...prev,
// //             limsOrder: firstOrder.value,
// //             limsOrderID: firstOrder.orderID,
// //             limsSampleID: firstOrder.sampleID,
// //             limsTestCode: firstOrder.testCode,
// //             limsReplicateID: firstOrder.replicateID
// //           }));
// //         }

// //         return limsOrders;
// //       } else {
// //         setLimsOrderOptions([]);
// //         setIsLimsOrderEnabled(false);
// //         setFormData(prev => ({
// //           ...prev,
// //           limsOrder: '',
// //           limsOrderID: '',
// //           limsSampleID: '',
// //           limsTestCode: '',
// //           limsReplicateID: ''
// //         }));
// //         return [];
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorloadinglimsorders'), error);
// //       setLimsOrderOptions([]);
// //       setIsLimsOrderEnabled(false);
// //       setFormData(prev => ({
// //         ...prev,
// //         limsOrder: '',
// //         limsOrderID: '',
// //         limsSampleID: '',
// //         limsTestCode: '',
// //         limsReplicateID: ''
// //       }));
// //       return [];
// //     }
// //   }, [t]);

// //   const onChangeInstrumentCombo = useCallback(async (instrumentId) => {
// //     try {
// //       const nLLProStatus = 0;
// //       const nProtocolStatus = parseInt(formData.protocolID) || 0;
// //       const nProtocolStatusfile = isFileNameEnabled ? 101 : 0;

// //       const response = await makeAjaxCall(endpoints.onChangeInstrumentCombo, {
// //         sInstrumentID: instrumentId,
// //         nLLProStatus: nLLProStatus,
// //         nProtocolStatus: nProtocolStatus,
// //         nProtocolStatusfile: nProtocolStatusfile
// //       }, "SelectPathFileUSerTemplate");

// //       if (response) {
// //         // FIX: Properly handle user ID comparison
// //         const activeUserDetails = getActiveUserDetails();
// //         const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;

// //         if (response.sLockType === 'A') {
// //           setIsAutoLocked(true);
// //           setIsLocked(true);
// //           setLockedByOtherUser(false);
// //         } else if (response.sUserID) {
// //           setIsLocked(true);
// //           setIsAutoLocked(false);

// //           // Trim and compare user IDs properly
// //           const responseUserId = response.sUserID ? response.sUserID.trim() : '';

// //           if (responseUserId === currentUserId) {
// //             setLockedByOtherUser(false);
// //           } else {
// //             setLockedByOtherUser(true);
// //           }
// //         } else {
// //           setIsLocked(false);
// //           setIsAutoLocked(false);
// //           setLockedByOtherUser(false);
// //         }

// //         const updates = {};

// //         if (response.sFileName) {
// //           updates.fileName = response.sFileName;
// //         }

// //         if (response.nCurMergeFileNo > 0) {
// //           updates.currentFileCount = String(response.nCurMergeFileNo);
// //         } else {
// //           updates.currentFileCount = '0';
// //         }

// //         if (response.nMergeFileCount > 0) {
// //           updates.mergeFileCount = String(response.nMergeFileCount);
// //           setSessionValue("LockedMergeCount", String(response.nMergeFileCount));
// //         } else if (response.sTaskID != null) {
// //           const lockedMergeCount = getSessionValue("LockedMergeCount");
// //           if (lockedMergeCount) {
// //             updates.mergeFileCount = lockedMergeCount;
// //           } else {
// //             updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //           }
// //         } else {
// //           updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //         }

// //         if (response.nAutoUnlock) {
// //           updates.unlockAfterCapture = true;
// //         } else {
// //           updates.unlockAfterCapture = false;
// //         }

// //         if (response.sLockID) {
// //           updates.lockID = response.sLockID;
// //         } else {
// //           updates.lockID = '';
// //         }

// //         if (response.nInterFaceOrderID) {
// //           updates.interfaceOrderID = String(response.nInterFaceOrderID);
// //         } else {
// //           updates.interfaceOrderID = '';
// //         }

// //         setFormData(prev => ({ ...prev, ...updates }));

// //         return response;
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.erroronchangeinstrument'), error);
// //       return null;
// //     }
// //   }, [formData.protocolID, isFileNameEnabled, t]);

// //   // const loadPaths = useCallback(async (instrumentId) => {
// //   //   try {
// //   //     let endpoint = endpoints.lockPathCombo;
// //   //     let requestBody = {
// //   //       sInstrumentID: instrumentId,
// //   //       sScheduleID: ""
// //   //     };

// //   //     if (getDeactiveScheduleDataRef.current) {
// //   //       const scheduleData = getDeactiveScheduleDataRef.current;
// //   //       const scheduleId = scheduleData.L13ScheduleID;
// //   //       const taskType = scheduleData.TaskType;

// //   //       if (taskType === "ScheduleCreation") {
// //   //         endpoint = endpoints.lockActiveInstrumentPathCombo;
// //   //       } else {
// //   //         endpoint = endpoints.lockDeactiveInstrumentPathCombo;
// //   //       }
// //   //       requestBody.sScheduleID = scheduleId;
// //   //     }

// //   //     const response = await makeAjaxCall(endpoint, requestBody);

// //   //     if (Array.isArray(response) && response.length > 0) {
// //   //       const pathOptionsData = response.map(path => ({
// //   //         value: path.sTaskID || path.L13ScheduleID || '',
// //   //         label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
// //   //         originalItem: path
// //   //       }));

// //   //       setPathOptions(pathOptionsData);

// //   //       if (pathOptionsData.length > 0) {
// //   //         const firstPath = pathOptionsData[0];
// //   //         setFormData(prev => ({ ...prev, path: firstPath.value }));

// //   //         if (formData.template) {
// //   //           fetchTags(formData.template, instrumentId);
// //   //         }
// //   //       }
// //   //     } else {
// //   //       setPathOptions([]);
// //   //     }
// //   //   } catch (error) {
// //   //     console.error(t('instrumentlocktag.errorloadingpaths'), error);
// //   //     setPathOptions([]);
// //   //   }
// //   // }, [formData.template, fetchTags, t]);

// //   // const loadInstruments = useCallback(async (clientId) => {
// //   //   try {
// //   //     let endpoint = endpoints.lockInstrumentCombo;
// //   //     let requestBody = {
// //   //       sClientID: clientId,
// //   //       sScheduleID: ""
// //   //     };

// //   //     if (getDeactiveScheduleDataRef.current) {
// //   //       const scheduleData = getDeactiveScheduleDataRef.current;
// //   //       const scheduleId = scheduleData.L13ScheduleID;
// //   //       const taskType = scheduleData.TaskType;

// //   //       if (taskType === "ScheduleCreation") {
// //   //         endpoint = endpoints.lockActiveParsingInstrumentCombo;
// //   //       } else {
// //   //         endpoint = endpoints.lockDeactiveParsingInstrumentCombo;
// //   //       }
// //   //       requestBody.sScheduleID = scheduleId;
// //   //     }

// //   //     const response = await makeAjaxCall(endpoint, requestBody);

// //   //     if (Array.isArray(response) && response.length > 0) {
// //   //       const instrumentOptionsData = response.map(instrument => ({
// //   //         value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
// //   //         label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
// //   //         originalItem: instrument
// //   //       }));

// //   //       setInstrumentOptions(instrumentOptionsData);

// //   //       if (instrumentOptionsData.length > 0) {
// //   //         const firstInstrument = instrumentOptionsData[0];
// //   //         setFormData(prev => ({ ...prev, instrument: firstInstrument.value }));

// //   //         await loadProtocol(firstInstrument.value);

// //   //         const isInterface = isInterfaceInstrument(firstInstrument.value);
// //   //         if (isInterface) {
// //   //           const interfaceInstId = firstInstrument.value.includes(':') ?
// //   //             parseInt(firstInstrument.value.split(':')[1].trim()) : 0;

// //   //           if (interfaceInstId > 0) {
// //   //             await loadLimsOrder(interfaceInstId);
// //   //           }
// //   //         }

// //   //         await onChangeInstrumentCombo(firstInstrument.value);
// //   //         await loadPaths(firstInstrument.value);
// //   //       }
// //   //     } else {
// //   //       setInstrumentOptions([]);
// //   //     }
// //   //   } catch (error) {
// //   //     console.error(t('instrumentlocktag.errorloadinginstruments'), error);
// //   //     setInstrumentOptions([]);
// //   //   }
// //   // }, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, isInterfaceInstrument, t]);

// //   const loadPaths = useCallback(async (instrumentId) => {
// //     try {
// //       console.log('🛣️ Loading paths for instrument:', instrumentId);

// //       const response = await makeAjaxCall(endpoints.lockPathCombo, {
// //         sInstrumentID: instrumentId.trim(),
// //         sScheduleID: ""
// //       });

// //       if (Array.isArray(response) && response.length > 0) {
// //         const pathOptionsData = response.map(path => ({
// //           // Use sTaskID for dropdown value
// //           value: path.sTaskID ? path.sTaskID.trim() : '',
// //           // Show source path in label
// //           label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
// //           originalItem: path
// //         }));

// //         console.log('✅ Path options loaded:', pathOptionsData.length);
// //         setPathOptions(pathOptionsData);

// //         return pathOptionsData; // Return for chaining
// //       } else {
// //         console.log('❌ No paths found for instrument:', instrumentId);
// //         setPathOptions([]);
// //         return [];
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorloadingpaths'), error);
// //       setPathOptions([]);
// //       return [];
// //     }
// //   }, [t]);

// //   const loadInstruments = useCallback(async (clientId) => {
// //     // Use the ID, not the name
// //     const clientIdToUse = typeof clientId === 'string' && clientId.includes('C')
// //       ? clientId
// //       : formData.clientId;

// //     console.log('🔄 Loading instruments for client ID:', clientIdToUse);

// //     const response = await makeAjaxCall(endpoints.lockInstrumentCombo, {
// //       sClientID: clientIdToUse.trim(),
// //       sScheduleID: ""
// //     });
// //     try {
// //       console.log('🔄 Loading instruments for client:', clientId);

// //       const response = await makeAjaxCall(endpoints.lockInstrumentCombo, {
// //         sClientID: clientId.trim(), // Trim spaces
// //         sScheduleID: ""
// //       });

// //       console.log('📋 Raw instrument response:', response?.map(item => ({
// //         L11InstrumentID: item.L11InstrumentID?.trim(),
// //         L12InstrumentMappingID: item.L12InstrumentMappingID?.trim(),
// //         L11InstrumentName: item.L11InstrumentName,
// //         L11InstrumentAliasName: item.L11InstrumentAliasName
// //       })));

// //       if (Array.isArray(response) && response.length > 0) {
// //         const instrumentOptionsData = response.map(instrument => {
// //           // Use L11InstrumentID for dropdown value (I17)
// //           const instrumentId = instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '';
// //           const instrumentName = instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument');

// //           return {
// //             value: instrumentId,
// //             label: instrumentName,
// //             originalItem: {
// //               ...instrument,
// //               L11InstrumentID: instrumentId,
// //               L12InstrumentMappingID: instrument.L12InstrumentMappingID?.trim() || '',
// //               L11InstrumentName: instrument.L11InstrumentName || instrumentName
// //             }
// //           };
// //         }).filter(inst => inst.value); // Remove empty values

// //         console.log('✅ Instrument options:', instrumentOptionsData);
// //         setInstrumentOptions(instrumentOptionsData);

// //         return instrumentOptionsData; // Return for chaining
// //       } else {
// //         console.log('❌ No instruments found for client:', clientId);
// //         setInstrumentOptions([]);
// //         return [];
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorloadinginstruments'), error);
// //       setInstrumentOptions([]);
// //       return [];
// //     }
// //   }, [t]);

// //   // Add this to debug form state
// //   useEffect(() => {
// //     console.log('📊 CURRENT FORM STATE:', {
// //       client: formData.client,
// //       instrument: formData.instrument,
// //       path: formData.path,
// //       template: formData.template,
// //       fileName: formData.fileName
// //     });

// //     console.log('📋 AVAILABLE OPTIONS:', {
// //       clientOptions: clientOptions.map(c => ({ value: c.value, label: c.label })),
// //       instrumentOptions: instrumentOptions.map(i => ({ value: i.value, label: i.label })),
// //       pathOptions: pathOptions.map(p => ({ value: p.value, label: p.label })),
// //       templateOptions: templateOptions.map(t => ({ value: t.value, label: t.label }))
// //     });
// //   }, [formData, clientOptions, instrumentOptions, pathOptions, templateOptions]);

// //   //recently modified loadClients to prevent overwriting client during navigation
// //   // const loadClients = useCallback(async () => {
// //   //   // Check if we're currently processing navigation
// //   //   if (isLoadingFromScheduler || navigationData?.data) {
// //   //     console.log('⏸️ Skipping client load - navigation in progress');
// //   //     return;
// //   //   }

// //   //   try {
// //   //     const preselectedClientId = scheduleData?.L06ClientID;
// //   //     const taskStatus = scheduleData?.TaskType !== "ScheduleCreation" ? 'D' : 'A';

// //   //     const response = await makeAjaxCall(endpoints.clientLockCombo, {
// //   //       sTaskStatus: taskStatus,
// //   //       sClientID: preselectedClientId
// //   //     });

// //   //     if (Array.isArray(response) && response.length > 0) {
// //   //       const clientOptionsData = response.map(client => ({
// //   //         value: client.sClientID ? client.sClientID.trim() : '',
// //   //         label: client.sClientName || t('instrumentlocktag.unknownclient')
// //   //       }));

// //   //       // Update dropdown options
// //   //       setClientOptions(clientOptionsData);

// //   //       // IMPORTANT: Only change formData if we don't already have a client
// //   //       // AND we're not in the middle of navigation
// //   //       if (!formData.client && !isLoadingFromScheduler) {
// //   //         let clientToSelect = null;

// //   //         if (preselectedClientId) {
// //   //           clientToSelect = clientOptionsData.find(client => client.value === preselectedClientId);
// //   //         }

// //   //         if (!clientToSelect && clientOptionsData.length > 0) {
// //   //           clientToSelect = clientOptionsData[0];
// //   //         }

// //   //         if (clientToSelect) {
// //   //           setFormData(prev => ({
// //   //             ...prev,
// //   //             client: clientToSelect.value
// //   //           }));
// //   //           await loadInstruments(clientToSelect.value);
// //   //         }
// //   //       }
// //   //     }
// //   //   } catch (error) {
// //   //     console.error(t('instrumentlocktag.errorloadingclients'), error);
// //   //   }
// //   // }, [scheduleData, loadInstruments, t, formData.client, isLoadingFromScheduler, navigationData]);


// //   const loadClients = useCallback(async (targetClientId = null, targetClientName = null) => {
// //     try {
// //       console.log('📋 Loading clients, looking for:', { targetClientId, targetClientName });

// //       // Get ALL clients
// //       const response = await makeAjaxCall(endpoints.clientLockCombo, {
// //         sTaskStatus: 'A',
// //         sClientID: '' // Empty = Get ALL clients
// //       });

// //       if (Array.isArray(response) && response.length > 0) {
// //         // Transform data: Store BOTH ID and Name
// //         const clientOptionsData = response.map(client => ({
// //           id: client.sClientID ? client.sClientID.trim() : '', // Store ID internally
// //           value: client.sClientName || t('instrumentlocktag.unknownclient'), // Show NAME in dropdown
// //           label: client.sClientName || t('instrumentlocktag.unknownclient'), // Show NAME
// //           originalItem: client
// //         }));

// //         console.log('✅ Loaded clients:', clientOptionsData.map(c => ({
// //           id: c.id,
// //           name: c.value,
// //           count: clientOptionsData.length
// //         })));

// //         // Set ALL clients in dropdown
// //         setClientOptions(clientOptionsData);

// //         // Determine which client to select
// //         let clientToSelect = null;

// //         // Priority 1: Find by ID (from navigation)
// //         if (targetClientId) {
// //           clientToSelect = clientOptionsData.find(c => c.id === targetClientId);
// //           if (clientToSelect) {
// //             console.log('🎯 Found client by ID:', { id: targetClientId, name: clientToSelect.value });
// //           }
// //         }

// //         // Priority 2: Find by Name (from navigation)
// //         if (!clientToSelect && targetClientName) {
// //           clientToSelect = clientOptionsData.find(c =>
// //             c.value.toLowerCase() === targetClientName.toLowerCase() ||
// //             c.label.toLowerCase() === targetClientName.toLowerCase()
// //           );
// //           if (clientToSelect) {
// //             console.log('🎯 Found client by Name:', { name: targetClientName, id: clientToSelect.id });
// //           }
// //         }

// //         // Priority 3: Existing client in form
// //         if (!clientToSelect && formData.clientId) {
// //           clientToSelect = clientOptionsData.find(c => c.id === formData.clientId);
// //           if (clientToSelect) {
// //             console.log('📌 Keeping existing client by ID:', formData.clientId);
// //           }
// //         }

// //         // Priority 4: First client
// //         if (!clientToSelect && clientOptionsData.length > 0) {
// //           clientToSelect = clientOptionsData[0];
// //           console.log('📌 Selecting first client:', clientToSelect.value);
// //         }

// //         // Update form data with BOTH ID and Name
// //         if (clientToSelect) {
// //           console.log('📝 Setting client:', {
// //             clientId: clientToSelect.id,
// //             clientName: clientToSelect.value
// //           });

// //           setFormData(prev => {
// //             // Only update if different
// //             if (prev.clientId !== clientToSelect.id || prev.clientName !== clientToSelect.value) {
// //               return {
// //                 ...prev,
// //                 clientId: clientToSelect.id, // Store ID internally
// //                 clientName: clientToSelect.value, // Store Name for display
// //                 client: clientToSelect.value // For backward compatibility
// //               };
// //             }
// //             return prev;
// //           });

// //           // Load instruments for this client (using ID)
// //           if (!isLoadingFromScheduler && clientToSelect.id) {
// //             console.log('🔄 Loading instruments for client ID:', clientToSelect.id);
// //             await loadInstruments(clientToSelect.id);
// //           }
// //         }
// //       } else {
// //         console.log('❌ No clients returned from API');
// //         setClientOptions([]);
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorloadingclients'), error);
// //     }
// //   }, [loadInstruments, t, formData.clientId, isLoadingFromScheduler]);

// //   const loadClientsForNavigation = useCallback(async (targetClientId) => {
// //     try {
// //       console.log('👥 Loading clients, looking for:', targetClientId);

// //       // IMPORTANT: Pass the targetClientId to get ONLY that client
// //       const response = await makeAjaxCall(endpoints.clientLockCombo, {
// //         sTaskStatus: 'A',
// //         sClientID: targetClientId  // Pass the specific client ID
// //       });

// //       if (Array.isArray(response) && response.length > 0) {
// //         const clientOptionsData = response.map(client => ({
// //           value: client.sClientID ? client.sClientID.trim() : '',
// //           label: client.sClientName || t('instrumentlocktag.unknownclient')
// //         }));

// //         console.log('✅ Client options loaded (specific):', clientOptionsData);
// //         setClientOptions(clientOptionsData);

// //         // The target client should be the only one in the array
// //         if (clientOptionsData.length > 0 && clientOptionsData[0].value === targetClientId) {
// //           console.log('🎯 Target client loaded:', clientOptionsData[0].value);
// //           // Don't change formData here - it's already set
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Error loading clients:', error);
// //     }
// //   }, [t]);




// //   const loadTagOptions = useCallback(async (tagIndex) => {
// //     if (!formData.template || !tags[tagIndex]) return [];

// //     const tag = tags[tagIndex];

// //     let previousTagValueID = "";
// //     if (tagIndex > 0) {
// //       previousTagValueID = tags[tagIndex - 1].valueID || "          ";
// //     }

// //     try {
// //       const options = await loadTagValues(
// //         tag.tagID,
// //         formData.template,
// //         formData.instrument,
// //         tagIndex,
// //         previousTagValueID
// //       );

// //       return options || [];
// //     } catch (error) {
// //       console.error(`${t('instrumentlocktag.errorloadingoptionsfortag')} ${tagIndex}:`, error);
// //       return [];
// //     }
// //   }, [formData.template, formData.instrument, tags, loadTagValues, t]);

// //   const handleTagValueClick = useCallback((index, value, valueID) => {
// //     setTags(prev => {
// //       const updatedTags = prev.map((t, idx) => {
// //         if (idx === index) {
// //           return { ...t, value, valueID };
// //         }

// //         if (idx > index) {
// //           return { ...t, value: '', valueID: '', options: [] };
// //         }

// //         return t;
// //       });

// //       return updatedTags;
// //     });

// //     // Clear tag error when value is selected
// //     if (value) {
// //       setTagErrors(prev => ({ ...prev, [index]: false }));
// //     }

// //     if (index < tags.length - 1) {
// //       loadTagOptions(index + 1).then(options => {
// //         if (options.length > 0) {
// //           setTags(prev => prev.map((tag, idx) =>
// //             idx === index + 1 ? { ...tag, options } : tag
// //           ));
// //         }
// //       });
// //     }
// //   }, [tags, loadTagOptions]);

// //   const handleTagEditRequest = useCallback(async (tagIndex) => {
// //     if (tags[tagIndex] && tags[tagIndex].options && tags[tagIndex].options.length > 0) {
// //       return tags[tagIndex].options;
// //     }

// //     const options = await loadTagOptions(tagIndex);

// //     setTags(prev => prev.map((tag, idx) =>
// //       idx === tagIndex ? { ...tag, options } : tag
// //     ));

// //     return options;
// //   }, [tags, loadTagOptions]);

// //   // Combined loading states for FullPageLoader
// //   const showFullPageLoader = isLoading || isSubmitting || isLoadingTags || isLoadingOptions;

// //   // Initial data loading with FullPageLoader
// //   useEffect(() => {
// //     if (initialLoadDoneRef.current) return;

// //     const loadData = async () => {
// //       setIsLoading(true);

// //       try {
// //         await checkMergeAndAutoUnlockSettings();
// //         await loadUsers();

// //         const activeUserDetails = getActiveUserDetails();
// //         const templateResponse = await makeAjaxCall(endpoints.lockTemplateCombo, {
// //           ActiveUserDetails: activeUserDetails,
// //           ApplicationCode: "SDMS"
// //         });

// //         if (Array.isArray(templateResponse) && templateResponse.length > 0) {
// //           const templates = templateResponse
// //             .map(template => ({
// //               value: String(template.sTemplateID || '').trim(),
// //               label: String(template.sTemplateName || '').trim()
// //             }))
// //             .filter(template => template.value && template.label && template.value !== 'undefined');

// //           const order = ['QC', 'Calibration', 'Method Development', 'Project'];
// //           const sortedTemplates = templates.sort((a, b) => {
// //             const labelA = a.label || '';
// //             const labelB = b.label || '';

// //             const indexA = order.findIndex(pattern => labelA.includes(pattern));
// //             const indexB = order.findIndex(pattern => labelB.includes(pattern));

// //             if (indexA !== -1 && indexB !== -1) {
// //               return indexA - indexB;
// //             }

// //             if (indexA !== -1) return -1;
// //             if (indexB !== -1) return 1;

// //             return labelA.localeCompare(labelB);
// //           });

// //           setTemplateOptions(sortedTemplates);

// //           if (sortedTemplates.length > 0) {
// //             const firstTemplateValue = sortedTemplates[0].value;
// //             setFormData(prev => ({ ...prev, template: firstTemplateValue }));
// //           }
// //         }

// //         // await loadClients();

// //         //recently
// //         //  // If we have navigation data, use the navigation handler
// //         //     if (navigationData?.data?.fromScheduler) {
// //         //         console.log('🚀 Initial load: Navigation data detected');
// //         //         // Don't load clients normally - navigation will handle it
// //         //     } else {
// //         //         // Normal initial load - load ALL clients
// //         //         await loadClients();
// //         //     }
// //         initialLoadDoneRef.current = true;

// //       } catch (error) {
// //         console.error(t('instrumentlocktag.errorloadinitialdata'), error);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     loadData();
// //   }, []);//recently navigationData

// //   useEffect(() => {
// //     if (formData.template && formData.instrument) {
// //       fetchTags(formData.template, formData.instrument);
// //     } else {
// //       setTags([]);
// //     }
// //   }, [formData.template, formData.instrument, fetchTags]);

// //   const handleClientChange = useCallback(async (value) => {
// //     if (isLoadingFromScheduler) {
// //       console.log('⏸️ Skipping client change (loading from scheduler)');
// //       return;
// //     }
// //     setFormData(prev => ({ ...prev, client: value, instrument: '', path: '', fileName: '', limsOrder: '' }));
// //     setErrors(prev => ({ ...prev, client: false }));

// //     setInstrumentOptions([]);
// //     setPathOptions([]);
// //     setLimsOrderOptions([]);
// //     setTags([]);
// //     setTagErrors({});

// //     if (value) {
// //       setIsLoading(true);
// //       try {
// //         await loadInstruments(value);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     }
// //   }, [loadInstruments]);

// //   const handleInstrumentChange = useCallback(async (value) => {
// //     // Skip if loading from scheduler
// //     if (isLoadingFromScheduler) {
// //       console.log('⏸️ Skipping instrument change (loading from scheduler)');
// //       return;
// //     }
// //     setIsLoading(true);

// //     setFormData(prev => ({
// //       ...prev,
// //       instrument: value,
// //       path: '',
// //       fileName: '',
// //       limsOrder: '',
// //       mergeFileCount: getSessionValue("MergeCount") || '1',
// //       currentFileCount: '0'
// //     }));
// //     setErrors(prev => ({ ...prev, instrument: false }));

// //     setPathOptions([]);
// //     setTags([]);
// //     setTagErrors({});

// //     if (value) {
// //       try {
// //         const isInterface = isInterfaceInstrument(value);

// //         await loadProtocol(value);

// //         if (isInterface) {
// //           const interfaceInstId = value.includes(':') ?
// //             parseInt(value.split(':')[1].trim()) : 0;

// //           if (interfaceInstId > 0) {
// //             await loadLimsOrder(interfaceInstId);
// //           }
// //         } else {
// //           setLimsOrderOptions([]);
// //           setIsLimsOrderEnabled(false);
// //           setFormData(prev => ({ ...prev, limsOrder: '' }));
// //         }

// //         const instrumentData = await onChangeInstrumentCombo(value);

// //         if (instrumentData) {
// //           const updates = {};

// //           if (instrumentData.nCurMergeFileNo > 0) {
// //             updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
// //           } else {
// //             updates.currentFileCount = '0';
// //           }

// //           const lockedMergeCount = getSessionValue("LockedMergeCount");
// //           if (isLocked && lockedMergeCount) {
// //             updates.mergeFileCount = lockedMergeCount;
// //           } else {
// //             updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //           }

// //           setFormData(prev => ({ ...prev, ...updates }));
// //         }

// //         await loadPaths(value);

// //         if (formData.template) {
// //           fetchTags(formData.template, value);
// //         }


// //         // ✅ Only load paths if NOT coming from navigation
// //         if (!isLoadingFromNavigation) {
// //           await loadPaths(value);
// //         }
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     } else {
// //       setIsLoading(false);
// //     }
// //   }, [loadPaths, formData.template, fetchTags, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, isInterfaceInstrument, isLocked, isLoadingFromNavigation]);

// //   useEffect(() => {

// //     if (formData.instrument) {
// //       const refreshData = async () => {
// //         try {
// //           setIsLoading(true);
// //           const response = await onChangeInstrumentCombo(formData.instrument);
// //           if (response) {
// //             setFormData(prev => ({
// //               ...prev,
// //               currentFileCount: response.nCurMergeFileNo > 0 ? String(response.nCurMergeFileNo) : '0',
// //               mergeFileCount: response.nMergeFileCount > 0 ? String(response.nMergeFileCount) : getSessionValue("MergeCount") || '1'
// //             }));
// //           }
// //         } catch (error) {
// //           console.error('Error refreshing merge count:', error);
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       };

// //       refreshData();
// //     }
// //   }, [isLocked, formData.instrument]);

// //   // useEffect(() => {
// //   //   console.log('🔍 InstrumentLockTag navigation effect triggered');

// //   //   if (navigationData?.data?.fromScheduler) {

// //   //     console.log('📦 Navigation from scheduler detected');
// //   //     const data = navigationData.data;

// //   //     // Set loading flag
// //   //     setIsLoadingFromScheduler(true);
// //   //     setIsLoadingFromScheduler(true);

// //   //     // Clear existing data
// //   //     setClientOptions([]);
// //   //     setInstrumentOptions([]);
// //   //     setPathOptions([]);

// //   //     // STEP 1: Set form data with scheduler values
// //   //     setFormData(prev => ({
// //   //       ...prev,
// //   //       client: data.clientId || '',
// //   //       instrument: data.instrumentId || '',
// //   //       fileName: data.fileName || '',
// //   //       template: data.templateId || '',
// //   //       path: data.pathTaskId || ''
// //   //     }));

// //   //     console.log('✅ Form data set:', {
// //   //       client: data.clientId,
// //   //       instrument: data.instrumentId,
// //   //       fileName: data.fileName,
// //   //       template: data.templateId,
// //   //       path: data.pathTaskId
// //   //     });

// //   //     // STEP 2: Load data sequentially
// //   //     const loadSchedulerData = async () => {
// //   //       try {
// //   //         // Load clients
// //   //         console.log('1️⃣ Loading client options');
// //   //         const clientsResponse = await makeAjaxCall(endpoints.clientLockCombo, {
// //   //           sTaskStatus: 'A',
// //   //           sClientID: data.clientId || ''
// //   //         });

// //   //         if (Array.isArray(clientsResponse)) {
// //   //           const clientOptionsData = clientsResponse.map(client => ({
// //   //             value: client.sClientID?.trim() || '',
// //   //             label: client.sClientName || t('instrumentlocktag.unknownclient')
// //   //           }));
// //   //           setClientOptions(clientOptionsData);
// //   //           console.log('✅ Clients loaded:', clientOptionsData.length);
// //   //         }

// //   //         // Load instruments for this client
// //   //         console.log('2️⃣ Loading instruments for client:', data.clientId);
// //   //         const instrumentsResponse = await makeAjaxCall(endpoints.lockInstrumentCombo, {
// //   //           sClientID: data.clientId?.trim() || '',
// //   //           sScheduleID: ""
// //   //         });

// //   //         if (Array.isArray(instrumentsResponse)) {
// //   //           const instrumentOptionsData = instrumentsResponse.map(instrument => ({
// //   //             value: instrument.L11InstrumentID?.trim() || '',
// //   //             label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
// //   //             originalItem: instrument
// //   //           }));
// //   //           setInstrumentOptions(instrumentOptionsData);
// //   //           console.log('✅ Instruments loaded:', instrumentOptionsData.length);

// //   //           // Check if our instrument exists in the list
// //   //           const foundInstrument = instrumentOptionsData.find(
// //   //             inst => inst.value === data.instrumentId
// //   //           );

// //   //           if (foundInstrument) {
// //   //             console.log('🎯 Found instrument in dropdown');
// //   //           } else {
// //   //             console.log('⚠️ Instrument not found in dropdown list');
// //   //           }
// //   //         }

// //   //         // Load paths
// //   //         if (data.instrumentId) {
// //   //           console.log('3️⃣ Loading paths for instrument:', data.instrumentId);
// //   //           const pathsResponse = await makeAjaxCall(endpoints.lockPathCombo, {
// //   //             sInstrumentID: data.instrumentId.trim(),
// //   //             sScheduleID: ""
// //   //           });

// //   //           if (Array.isArray(pathsResponse)) {
// //   //             const pathOptionsData = pathsResponse.map(path => ({
// //   //               value: path.sTaskID?.trim() || '',
// //   //               label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
// //   //               originalItem: path
// //   //             }));
// //   //             setPathOptions(pathOptionsData);
// //   //             console.log('✅ Paths loaded:', pathOptionsData.length);

// //   //             // Auto-select first path if no specific path is provided
// //   //             if (!data.pathTaskId && pathOptionsData.length > 0) {
// //   //               setFormData(prev => ({
// //   //                 ...prev,
// //   //                 path: pathOptionsData[0].value
// //   //               }));
// //   //             }
// //   //           }
// //   //         }

// //   //         // Load protocol and other data
// //   //         if (data.instrumentId) {
// //   //           console.log('4️⃣ Loading additional data');
// //   //           await loadProtocol(data.instrumentId);
// //   //           await onChangeInstrumentCombo(data.instrumentId);

// //   //           if (data.templateId) {
// //   //             setTimeout(() => {
// //   //               fetchTags(data.templateId, data.instrumentId);
// //   //             }, 500);
// //   //           }
// //   //         }

// //   //       } catch (error) {
// //   //         console.error('Error loading scheduler data:', error);
// //   //       } finally {
// //   //         // Clear loading flag after a delay
// //   //         setTimeout(() => {
// //   //           console.log('✅ Finished loading from scheduler');
// //   //           setIsLoadingFromScheduler(false);
// //   //           setIsLoadingFromScheduler(true);

// //   //           // Clear navigation
// //   //           if (onClearNavigation) {
// //   //             console.log('🗑️ Clearing navigation');
// //   //             onClearNavigation();
// //   //           }
// //   //         }, 1000);
// //   //       }
// //   //     };

// //   //     loadSchedulerData();
// //   //   }
// //   // }, [navigationData, onClearNavigation]);


// //   useEffect(() => {
// //     console.log('🔍 InstrumentLockTag navigation effect triggered');

// //     // Check for navigation data
// //     const navData = navigationData?.data;
// //     console.log('📦 Navigation data structure:', {
// //       hasData: !!navData,
// //       isFromScheduler: navData?.fromScheduler,
// //       directFromScheduler: navData?.data?.fromScheduler, // Check both levels
// //       rawData: navigationData
// //     });

// //     // Handle both possible data structures
// //     const schedulerData = navData?.fromScheduler ? navData : navData?.data;

// //     if (schedulerData?.fromScheduler) {
// //       console.log('✅ Valid scheduler data detected:', schedulerData);
// //       handleSchedulerNavigation(schedulerData);
// //     }
// //   }, [navigationData]);

// //   // const handleSchedulerNavigation = async (data) => {
// //   //   console.log('🚀 Processing scheduler navigation with:', data);

// //   //   // Set loading flag
// //   //   setIsLoadingFromScheduler(true);

// //   //   // STEP 1: Set form data
// //   //   setFormData(prev => ({
// //   //     ...prev,
// //   //     client: data.clientId || '',
// //   //     instrument: data.instrumentId || data.instrumentMappingId || '',
// //   //     fileName: data.fileName || '',
// //   //     template: data.templateId || '',
// //   //     path: data.pathTaskId || ''
// //   //   }));

// //   //   console.log('📝 Form data set:', {
// //   //     client: data.clientId,
// //   //     instrument: data.instrumentId || data.instrumentMappingId,
// //   //     path: data.pathTaskId
// //   //   });

// //   //   // STEP 2: Load dropdowns sequentially
// //   //   try {
// //   //     // Load clients
// //   //     const clients = await loadClientsForNavigation(data.clientId);

// //   //     // Load instruments
// //   //     const instruments = await loadInstruments(data.clientId);

// //   //     // Try to find the instrument
// //   //     let targetInstrumentId = data.instrumentId || data.instrumentMappingId;
// //   //     const foundInstrument = instruments.find(
// //   //       inst => inst.value === targetInstrumentId ||
// //   //         inst.originalItem?.L12InstrumentMappingID === targetInstrumentId
// //   //     );

// //   //     if (foundInstrument) {
// //   //       console.log('🎯 Found instrument in dropdown:', foundInstrument.value);
// //   //       setFormData(prev => ({ ...prev, instrument: foundInstrument.value }));

// //   //       // Load paths for this instrument
// //   //       await loadPathsForScheduler(foundInstrument.value);

// //   //       // Load other data
// //   //       await loadProtocol(foundInstrument.value);
// //   //       await onChangeInstrumentCombo(foundInstrument.value);

// //   //       if (data.templateId) {
// //   //         setTimeout(() => {
// //   //           fetchTags(data.templateId, foundInstrument.value);
// //   //         }, 500);
// //   //       }
// //   //     } else if (instruments.length > 0) {
// //   //       console.log('⚠️ Target instrument not found, using first available');
// //   //       const firstInst = instruments[0];
// //   //       setFormData(prev => ({ ...prev, instrument: firstInst.value }));
// //   //       await loadPathsForScheduler(firstInst.value);
// //   //     }

// //   //   } catch (error) {
// //   //     console.error('Error loading navigation data:', error);
// //   //   } finally {
// //   //     // Clear loading flag
// //   //     setTimeout(() => {
// //   //       setIsLoadingFromScheduler(false);
// //   //       // Clear navigation if callback exists
// //   //       if (onClearNavigation) {
// //   //         onClearNavigation();
// //   //       }
// //   //     }, 1000);
// //   //   }
// //   // };


// //   const handleSchedulerNavigation = async (data) => {
// //     console.log('🚀 Processing scheduler navigation with:', data);
// //     console.log('🎯 Looking for instrument with:', {
// //       instrumentId: data.instrumentId,
// //       instrumentMappingId: data.instrumentMappingId,
// //       dropdownInstrumentId: data.dropdownInstrumentId,
// //       instrumentObj: data.instrumentObj
// //     });

// //     setIsLoadingFromScheduler(true);

// //     // STEP 1: Set form data - use the dropdown instrument ID
// //     setFormData(prev => ({
// //       ...prev,
// //       client: data.clientId || '',
// //       // Use dropdownInstrumentId first, fallback to instrumentId
// //       instrument: data.dropdownInstrumentId || data.instrumentId || data.instrumentMappingId || '',
// //       fileName: data.fileName || '',
// //       template: data.templateId || '',
// //       path: data.pathTaskId || ''
// //     }));

// //     // STEP 2: Load data
// //     try {
// //       // Load clients
// //       await loadClientsForNavigation(data.clientId);

// //       if (data.clientId) {
// //         // Load instruments
// //         const instruments = await loadInstruments(data.clientId);

// //         // Try multiple ways to find the instrument
// //         let targetInstrument = null;

// //         // Try 1: Match by dropdownInstrumentId
// //         if (data.dropdownInstrumentId) {
// //           targetInstrument = instruments.find(
// //             inst => inst.value === data.dropdownInstrumentId
// //           );
// //           console.log('🔍 Search by dropdownInstrumentId:', data.dropdownInstrumentId, 'found:', !!targetInstrument);
// //         }

// //         // Try 2: Match by instrumentId
// //         if (!targetInstrument && data.instrumentId) {
// //           targetInstrument = instruments.find(
// //             inst => inst.value === data.instrumentId
// //           );
// //           console.log('🔍 Search by instrumentId:', data.instrumentId, 'found:', !!targetInstrument);
// //         }

// //         // Try 3: Match by mapping ID in originalItem
// //         if (!targetInstrument && data.instrumentMappingId) {
// //           targetInstrument = instruments.find(
// //             inst => inst.originalItem?.L12InstrumentMappingID === data.instrumentMappingId
// //           );
// //           console.log('🔍 Search by instrumentMappingId:', data.instrumentMappingId, 'found:', !!targetInstrument);
// //         }

// //         // Try 4: Match by instrument name (fallback)
// //         if (!targetInstrument && data.instrumentName) {
// //           targetInstrument = instruments.find(
// //             inst => inst.label === data.instrumentName
// //           );
// //           console.log('🔍 Search by instrumentName:', data.instrumentName, 'found:', !!targetInstrument);
// //         }

// //         if (targetInstrument) {
// //           console.log('🎯 Found matching instrument:', targetInstrument);
// //           setFormData(prev => ({
// //             ...prev,
// //             instrument: targetInstrument.value
// //           }));

// //           // Load everything for this instrument
// //           // await loadPathsForScheduler(targetInstrument.value);
// //           await loadPathsForScheduler(targetInstrument.value, data.sourcePath);
// //           await loadProtocol(targetInstrument.value);
// //           await onChangeInstrumentCombo(targetInstrument.value);

// //           if (data.templateId) {
// //             setTimeout(() => {
// //               fetchTags(data.templateId, targetInstrument.value);
// //             }, 500);
// //           }
// //         } else if (instruments.length > 0) {
// //           console.log('⚠️ Exact instrument not found, using first available');
// //           const firstInst = instruments[0];
// //           console.log('📌 First available instrument:', firstInst);

// //           setFormData(prev => ({
// //             ...prev,
// //             instrument: firstInst.value
// //           }));

// //           await loadPathsForScheduler(firstInst.value);
// //           await loadProtocol(firstInst.value);
// //           await onChangeInstrumentCombo(firstInst.value);

// //           if (data.templateId) {
// //             setTimeout(() => {
// //               fetchTags(data.templateId, firstInst.value);
// //             }, 500);
// //           }
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Error loading navigation data:', error);
// //     } finally {
// //       setTimeout(() => {
// //         setIsLoadingFromScheduler(false);
// //         if (onClearNavigation) {
// //           onClearNavigation();
// //         }
// //       }, 1000);
// //     }
// //   };


// //   useEffect(() => {
// //     console.log('🏷️ isLoadingFromScheduler changed:', isLoadingFromScheduler);
// //   }, [isLoadingFromScheduler]);

// //   // Add this useEffect in InstrumentLockTag.jsx
// //   useEffect(() => {
// //     console.log('🔍 Auto-load check:', {
// //       client: formData.client,
// //       instrument: formData.instrument,
// //       isLoadingFromScheduler,
// //       hasNavigationData: !!navigationData?.data?.data?.fromScheduler
// //     });

// //     // Skip if we just loaded from scheduler
// //     if (isLoadingFromScheduler) {
// //       console.log('⏸️ Skipping auto-load (recently loaded from scheduler)');
// //       return;
// //     }

// //     // Skip if form is being set by navigation
// //     if (navigationData?.data?.data?.fromScheduler) {
// //       console.log('⏸️ Skipping auto-load (navigation in progress)');
// //       return;
// //     }

// //     // Normal auto-load logic for manual changes
// //     if (formData.instrument && formData.client && !isLoadingFromScheduler) {
// //       console.log('🚀 Normal auto-load triggered');

// //       const autoLoadData = async () => {
// //         try {
// //           console.log('📦 Starting auto-load sequence...');

// //           // Load protocol
// //           await loadProtocol(formData.instrument);

// //           // Load paths
// //           await loadPaths(formData.instrument);

// //           // Get lock status
// //           await onChangeInstrumentCombo(formData.instrument);

// //           // Load tags if template is set
// //           if (formData.template) {
// //             setTimeout(() => {
// //               fetchTags(formData.template, formData.instrument);
// //             }, 500);
// //           }

// //           console.log('✅ Auto-load completed');
// //         } catch (error) {
// //           console.error('Error in auto-load:', error);
// //         }
// //       };

// //       autoLoadData();
// //     }
// //   }, [formData.instrument, formData.client, isLoadingFromScheduler, navigationData]);

// //   // Add this function in InstrumentLockTag.jsx
// //   const resetLoadingState = useCallback(() => {
// //     console.log('🔄 Resetting loading state');
// //     setIsLoadingFromScheduler(false);
// //     // setNavigationData(null);
// //   }, []);

// //   // Call this when component unmounts
// //   useEffect(() => {
// //     return () => {
// //       resetLoadingState();
// //     };
// //   }, [resetLoadingState]);


// //   const getSchedulerData = useCallback(() => {
// //     if (!navigationData) return null;

// //     // Try multiple possible structures
// //     const possibleData = [
// //       navigationData.data, // {data: {...}}
// //       navigationData.data?.data, // {data: {data: {...}}}
// //       navigationData // raw data
// //     ];

// //     for (const data of possibleData) {
// //       if (data?.fromScheduler) {
// //         return data;
// //       }
// //     }

// //     return null;
// //   }, [navigationData]);

// //   // Then use it:
// //   useEffect(() => {
// //     const schedulerData = getSchedulerData();
// //     if (schedulerData) {
// //       handleSchedulerNavigation(schedulerData);
// //     }
// //   }, [getSchedulerData]);


// //   const loadClientDropdown = useCallback(async (clientId, clientName) => {
// //     try {
// //       console.log('👥 Loading client dropdown, expecting:', { clientId, clientName });

// //       // First, load all clients
// //       const response = await makeAjaxCall(endpoints.clientLockCombo, {
// //         sTaskStatus: 'A',
// //         sClientID: '' // Get all clients
// //       });

// //       if (Array.isArray(response) && response.length > 0) {
// //         const clientOptionsData = response.map(client => ({
// //           value: client.sClientID ? client.sClientID.trim() : '',
// //           label: client.sClientName || t('instrumentlocktag.unknownclient')
// //         }));

// //         setClientOptions(clientOptionsData);
// //         console.log('✅ Client options loaded:', clientOptionsData.length);

// //         // Find our target client
// //         const targetClient = clientOptionsData.find(c => c.value === clientId);
// //         if (targetClient) {
// //           console.log('🎯 Found target client:', targetClient);
// //           // Set form to show correct client
// //           setFormData(prev => ({ ...prev, client: targetClient.value }));
// //         } else if (clientOptionsData.length > 0) {
// //           console.log('⚠️ Target client not found, using first');
// //           setFormData(prev => ({ ...prev, client: clientOptionsData[0].value }));
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Error loading client dropdown:', error);
// //     }
// //   }, [t]);

// //   const loadInstrumentDropdown = useCallback(async (clientId, instrumentId, instrumentName) => {
// //     try {
// //       console.log('🔧 Loading instrument dropdown, expecting:', { clientId, instrumentId, instrumentName });

// //       const response = await makeAjaxCall(endpoints.lockInstrumentCombo, {
// //         sClientID: clientId,
// //         sScheduleID: ""
// //       });

// //       if (Array.isArray(response) && response.length > 0) {
// //         const instrumentOptionsData = response.map(instrument => {
// //           const id = instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '';
// //           const name = instrument.L11InstrumentAliasName || instrument.L11InstrumentName || '';

// //           return {
// //             value: id,
// //             label: name || t('instrumentlocktag.unknowninstrument'),
// //             originalItem: instrument
// //           };
// //         }).filter(inst => inst.value);

// //         setInstrumentOptions(instrumentOptionsData);
// //         console.log('✅ Instrument options loaded:', instrumentOptionsData.length);

// //         // Find target instrument
// //         let targetInstrument = instrumentOptionsData.find(inst => inst.value === instrumentId);

// //         if (!targetInstrument) {
// //           // Try by mapping ID
// //           targetInstrument = instrumentOptionsData.find(inst =>
// //             inst.originalItem?.L12InstrumentMappingID?.trim() === instrumentId
// //           );
// //         }

// //         if (targetInstrument) {
// //           console.log('🎯 Found target instrument:', targetInstrument);
// //           // Set form with correct instrument
// //           setFormData(prev => ({
// //             ...prev,
// //             instrument: targetInstrument.value
// //           }));

// //           // Now load paths for this instrument
// //           setTimeout(() => {
// //             loadPathsForScheduler(targetInstrument.value);
// //           }, 300);
// //         } else if (instrumentOptionsData.length > 0) {
// //           console.log('⚠️ Target instrument not found, using first');
// //           const firstInst = instrumentOptionsData[0];
// //           setFormData(prev => ({ ...prev, instrument: firstInst.value }));
// //           setTimeout(() => {
// //             loadPathsForScheduler(firstInst.value);
// //           }, 300);
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Error loading instrument dropdown:', error);
// //     }
// //   }, [t]);

// //   //recently
// //   // const loadPathsForScheduler = useCallback(async (instrumentId) => {
// //   //   try {
// //   //     console.log('🛣️ Loading paths for scheduler instrument:', instrumentId);

// //   //     const response = await makeAjaxCall(endpoints.lockPathCombo, {
// //   //       sInstrumentID: instrumentId,
// //   //       sScheduleID: "",
// //   //       sClientID: formData.clientId // Pass client ID if needed
// //   //     });

// //   //     if (Array.isArray(response) && response.length > 0) {
// //   //       const pathOptionsData = response.map(path => ({
// //   //         value: path.sTaskID ? path.sTaskID.trim() : '',
// //   //         label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
// //   //         originalItem: path
// //   //       }));

// //   //       setPathOptions(pathOptionsData);
// //   //       console.log('✅ Path options loaded:', pathOptionsData.length);

// //   //       // Auto-select first path
// //   //       if (pathOptionsData.length > 0) {
// //   //         setFormData(prev => ({
// //   //           ...prev,
// //   //           path: pathOptionsData[0].value
// //   //         }));
// //   //         console.log('📌 Selected first path:', pathOptionsData[0].value);
// //   //       }

// //   //       // Load protocol and other data
// //   //       await loadProtocol(instrumentId);
// //   //       await onChangeInstrumentCombo(instrumentId);

// //   //       // Load tags if template is set
// //   //       const currentTemplate = formData.template;
// //   //       if (currentTemplate) {
// //   //         setTimeout(() => {
// //   //           fetchTags(currentTemplate, instrumentId);
// //   //         }, 500);
// //   //       }
// //   //     }
// //   //   } catch (error) {
// //   //     console.error('Error loading paths:', error);
// //   //   }
// //   // }, [formData.clientId,formData.template, t]);

// //   const loadPathsForScheduler = useCallback(async (instrumentId, targetSourcePath = null) => {
// //     try {
// //       console.log('🛣️ Loading paths for scheduler instrument:', instrumentId);
// //       console.log('🎯 Target source path to select:', targetSourcePath);

// //       const response = await makeAjaxCall(endpoints.lockPathCombo, {
// //         sInstrumentID: instrumentId,
// //         sScheduleID: "",
// //         sClientID: formData.clientId
// //       });

// //       if (Array.isArray(response) && response.length > 0) {
// //         const pathOptionsData = response.map(path => ({
// //           value: path.sTaskID ? path.sTaskID.trim() : '',
// //           label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
// //           originalItem: path
// //         }));

// //         setPathOptions(pathOptionsData);
// //         console.log('✅ Path options loaded:', pathOptionsData.length);

// //         // ✅ FIND PATH BY SOURCE PATH (label), NOT by sTaskID (value)
// //         let selectedPath = null;

// //         if (targetSourcePath) {
// //           // Match by the source path string (the label)
// //           selectedPath = pathOptionsData.find(p =>
// //             p.label === targetSourcePath ||
// //             p.originalItem?.sTaskSourcePath === targetSourcePath
// //           );
// //           console.log('🎯 Found target path by source path:', selectedPath);
// //         }

// //         // Fallback to first path if target not found
// //         if (!selectedPath && pathOptionsData.length > 0) {
// //           selectedPath = pathOptionsData[0];
// //           console.log('📌 Using first path as fallback');
// //         }

// //         if (selectedPath) {
// //           setFormData(prev => ({
// //             ...prev,
// //             path: selectedPath.value // Set the sTaskID as the value
// //           }));
// //           console.log('✅ Selected path value (sTaskID):', selectedPath.value);
// //           console.log('✅ Selected path label (sourcePath):', selectedPath.label);
// //         }

// //         // ... rest of existing code ...
// //       }
// //     } catch (error) {
// //       console.error('Error loading paths:', error);
// //     }
// //   }, [formData.clientId, formData.template, t]);

// //   const handlePathChange = useCallback((value) => {
// //     setFormData(prev => ({ ...prev, path: value }));
// //     setErrors(prev => ({ ...prev, path: false }));
// //   }, []);

// //   const handleTemplateChange = useCallback((value) => {
// //     setFormData(prev => ({ ...prev, template: value }));
// //     setErrors(prev => ({ ...prev, template: false }));

// //     if (formData.instrument) {
// //       setIsLoadingTags(true);
// //       fetchTags(value, formData.instrument);
// //     }
// //   }, [formData.instrument, fetchTags]);

// //   const handleMergeCountChange = useCallback((value) => {
// //     const numValue = parseInt(value) || 0;

// //     if (numValue > 10000) {
// //       setFormData(prev => ({ ...prev, mergeFileCount: '10000' }));
// //       setErrors(prev => ({ ...prev, mergeFileCount: t('instrumentlocktag.mergecountexceed') }));
// //       return;
// //     }

// //     if (numValue < 1 && value !== '') {
// //       setFormData(prev => ({ ...prev, mergeFileCount: '1' }));
// //     } else {
// //       setFormData(prev => ({ ...prev, mergeFileCount: value }));
// //       setErrors(prev => ({ ...prev, mergeFileCount: '' }));
// //     }
// //   }, [t]);

// //   const validateFormForLock = useCallback(() => {
// //     const newErrors = {};
// //     const newTagErrors = {};
// //     let isValid = true;

// //     if (!formData.instrument) {
// //       newErrors.instrument = true;
// //       isValid = false;
// //     }

// //     if (!formData.path) {
// //       newErrors.path = true;
// //       isValid = false;
// //     }

// //     if (!formData.template) {
// //       newErrors.template = true;
// //       isValid = false;
// //     }

// //     const isInterface = isInterfaceInstrument(formData.instrument);

// //     if (isInterface) {
// //       if (isFileNameEnabled && !formData.fileName) {
// //         newErrors.fileName = true;
// //         isValid = false;
// //       }

// //       const mergeNum = parseInt(formData.mergeFileCount) || 0;
// //       const currentNum = parseInt(formData.currentFileCount) || 0;

// //       if (mergeNum > 10000) {
// //         newErrors.mergeFileCount = t('instrumentlocktag.mergecountexceed');
// //         isValid = false;
// //       }

// //       if (mergeNum < currentNum) {
// //         newErrors.mergeFileCount = t('instrumentlocktag.mergecountnotlessthancurrent', { count: formData.currentFileCount });
// //         isValid = false;
// //       }

// //       if (isLimsOrderEnabled && !formData.limsOrder) {
// //         newErrors.limsOrder = true;
// //         isValid = false;
// //       }
// //     }

// //     // Validate required tags
// //     for (let i = 0; i < tags.length; i++) {
// //       if (tags[i].required && !tags[i].value) {
// //         newTagErrors[i] = true;
// //         isValid = false;
// //       }
// //     }

// //     setErrors(newErrors);
// //     setTagErrors(newTagErrors);

// //     return isValid;
// //   }, [formData, tags, isFileNameEnabled, isLimsOrderEnabled, isInterfaceInstrument, t]);

// //   const prepareLockData = useCallback((auditData = null, validationType = "CheckAndInsert") => {
// //     const activeUserDetails = getActiveUserDetails();
// //     const isInterface = isInterfaceInstrument(formData.instrument);

// //     const instrumentId = (formData.instrument || "").padEnd(10, ' ');
// //     const templateId = (formData.template || '').padEnd(10, ' ');
// //     const userId = (formData.user || activeUserDetails.sUserID || '').padEnd(10, ' ');

// //     const lockData = {
// //       sInstrumentName: instrumentOptions.find(i => i.value === formData.instrument)?.label || '',
// //       lockinstdetails: {
// //         sInstrumentID: instrumentId,
// //         sTaskID: formData.path,
// //         sTaskSourcePath: pathOptions.find(p => p.value === formData.path)?.label || '',
// //         sFileName: formData.fileName,
// //         sTemplateID: templateId,
// //         sUserID: userId,
// //         nMergeFileCount: parseInt(formData.mergeFileCount) || 1,
// //         nAutoUnlock: formData.unlockAfterCapture ? 1 : 0,
// //         nInterFaceOrderID: parseInt(formData.interfaceOrderID) || 0,
// //         nProtocolStatus: parseInt(formData.protocolID) || 0,
// //         nLLProStatus: isFileNameEnabled ? 1 : 0,
// //         sScheduleID: pathOptions.find(p => p.value === formData.path)?.originalItem?.L13ScheduleID || ''
// //       },
// //       sTemplateName: templateOptions.find(t => t.value === formData.template)?.label || '',
// //       lInstTagValue: tags.map(tag => ({
// //         L58TagID: tag.tagID,
// //         Value: tag.value || '',
// //         L58ValueStatus: tag.required || false,
// //         L58TagName: tag.tagName,
// //         ValueID: tag.valueID || '',
// //         LoadMasterValue: " ",
// //         L58Order: tag.order || 0
// //       })),
// //       sValidation: validationType,
// //       sSendLabel: isLocked ? t('button.update') : t('button.lock'),
// //       ManualOrder: false,
// //       LIMSobj: null,
// //       ActiveUserDetails: activeUserDetails,
// //       ApplicationCode: "SDMS"
// //     };

// //     if (auditData) {
// //       lockData.lockinstdetails.AuditTrailValues = auditData;
// //     }

// //     if (isInterface) {
// //       lockData.lockinstdetails.audittrailforinterfaceinstrument = true;
// //     }

// //     if (isLimsOrderEnabled && formData.limsOrder) {
// //       const limsOrderItem = limsOrderOptions.find(lo => lo.value === formData.limsOrder);
// //       if (limsOrderItem) {
// //         lockData.ManualOrder = false;
// //         const returnObject = {};
// //         Object.keys(limsOrderItem).forEach(key => {
// //           if (!['uid', 'boundindex', 'uniqueid', 'visibleindex'].includes(key)) {
// //             returnObject[key] = limsOrderItem[key];
// //           }
// //         });
// //         lockData.LIMSobj = returnObject;
// //       }
// //     }

// //     const encodeXmlText = (text) => {
// //       if (!text) return '';
// //       return String(text)
// //         .replace(/&/g, '&amp;')
// //         .replace(/</g, '&lt;')
// //         .replace(/>/g, '&gt;')
// //         .replace(/"/g, '&quot;')
// //         .replace(/'/g, '&apos;');
// //     };

// //     const templateName = lockData.sTemplateName;
// //     const encodedTemplateName = encodeXmlText(templateName);

// //     let xMasterXml = "<Sheet1>";
// //     let xDetailsXml = "<Sheet1>";

// //     xMasterXml += "<Row>";
// //     xMasterXml += `<Template>${encodedTemplateName}</Template>`;

// //     xDetailsXml += `<Row><Category>Template</Category><Value>${encodedTemplateName}</Value></Row>`;

// //     tags.forEach(tag => {
// //       if (tag.value) {
// //         const encodedTagName = encodeXmlText(tag.tagName);
// //         const encodedTagValue = encodeXmlText(tag.value);

// //         xMasterXml += `<${encodedTagName}>${encodedTagValue}</${encodedTagName}>`;
// //         xDetailsXml += `<Row><Category>${encodedTagName}</Category><Value>${encodedTagValue}</Value></Row>`;
// //       }
// //     });

// //     xMasterXml += "</Row></Sheet1>";
// //     xDetailsXml += "</Sheet1>";

// //     lockData.lockinstdetails.xMasterXml = xMasterXml;
// //     lockData.lockinstdetails.xDetailsXml = xDetailsXml;

// //     return lockData;
// //   }, [formData, tags, instrumentOptions, pathOptions, templateOptions,
// //     isFileNameEnabled, isLimsOrderEnabled, isLocked, limsOrderOptions, isInterfaceInstrument, t]);

// //   const performLockAction = useCallback(async (auditData = null, validationType = "CheckAndInsert") => {
// //     try {
// //       const lockData = prepareLockData(auditData, validationType);

// //       const isInterface = isInterfaceInstrument(formData.instrument);
// //       if (isInterface && auditData) {
// //         lockData.lockinstdetails.audittrailforinterfaceinstrument = false;
// //       }

// //       await performLockActionWithData(lockData);
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorlockinginstrument'), error);
// //       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [formData, tags, prepareLockData, t]);

// //   const performLockActionWithData = async (lockData) => {
// //     try {
// //       setIsSubmitting(true);
// //       const result = await makeAjaxCall(endpoints.lockInstrument, lockData, "LockInstrument");

// //       if (result?.oResObj?.bStatus === true) {
// //         const successMessage = result.oResObj.sInformation || t('instrumentlocktag.instrumentlockedsuccessfully');

// //         setIsLocked(true);
// //         setIsAutoLocked(false);
// //         setLockedByOtherUser(false);

// //         if (result.oResObj.nMergeFileCount) {
// //           setFormData(prev => ({
// //             ...prev,
// //             mergeFileCount: String(result.oResObj.nMergeFileCount)
// //           }));
// //           setSessionValue("LockedMergeCount", String(result.oResObj.nMergeFileCount));
// //         } else if (result.oResObj.mergeFileCount) {
// //           setFormData(prev => ({
// //             ...prev,
// //             mergeFileCount: String(result.oResObj.mergeFileCount)
// //           }));
// //           setSessionValue("LockedMergeCount", String(result.oResObj.mergeFileCount));
// //         }

// //         showErrorDialogMessage(
// //           `${result.oResObj.sInstrument || t('label.instrument')} ${successMessage}`,
// //           'success',
// //           async () => {
// //             if (formData.instrument) {
// //               setIsLoading(true);
// //               try {
// //                 await onChangeInstrumentCombo(formData.instrument);
// //               } finally {
// //                 setIsLoading(false);
// //               }
// //             }

// //             if (formData.template && formData.instrument) {
// //               setIsLoadingTags(true);
// //               try {
// //                 await fetchTags(formData.template, formData.instrument);
// //               } finally {
// //                 setIsLoadingTags(false);
// //               }
// //             }

// //             if (onNavigateToMyInstruments) {
// //               onNavigateToMyInstruments();
// //             }
// //           }
// //         );
// //       } else {
// //         const errorInfo = result?.oResObj?.sInformation;

// //         if (errorInfo === "Entering Duplicate Tag Values" ||
// //           (errorInfo === "Tags has already been used. Do you want to re-use same tags for New Data Capture?" &&
// //             result?.oResObj?.sValidation === "CheckAndInsert")) {
// //           showErrorDialogMessage(
// //             t('instrumentlocktag.confirmationtagsalreadyexist'),
// //             'confirmation',
// //             async () => {
// //               lockData.sValidation = "Insert";
// //               lockData.lockinstdetails.sValidation = "Insert";
// //               await performLockActionWithData(lockData);
// //             }
// //           );
// //           return;
// //         }

// //         if (errorInfo === "Merge Break") {
// //           showErrorDialogMessage(t('instrumentlocktag.mergebreak'), 'error');
// //         } else if (errorInfo === "This instrument is already locked by other user") {
// //           showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadylockedbyotheruser'), 'error');
// //           setIsLocked(true);
// //           setLockedByOtherUser(true);
// //         } else if (errorInfo === "Merge Count should not be Lesser than Current Parsing Count") {
// //           showErrorDialogMessage(t('instrumentlocktag.mergecountshouldnotbelesserthancurrentparsingcount'), 'error');
// //         } else if (errorInfo) {
// //           showErrorDialogMessage(errorInfo, 'error');
// //         } else {
// //           showErrorDialogMessage(t('instrumentlocktag.failedtolockinstrument'), 'error');
// //         }
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.lockaction'), error);
// //       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const prepareUnlockData = useCallback((auditData = null, mergebreak = "true") => {
// //     const activeUserDetails = getActiveUserDetails();
// //     const pathItem = pathOptions.find(p => p.value === formData.path);
// //     const instrumentItem = instrumentOptions.find(i => i.value === formData.instrument);
// //     const templateItem = templateOptions.find(t => t.value === formData.template);

// //     const limsObj = {};

// //     const limsOrderVal = formData.limsOrder;
// //     const nOrderID = limsOrderVal === "" ? 0 : parseInt(limsOrderVal) || 0;
// //     limsObj["nOrderID"] = nOrderID;

// //     if (isInterfaceInstrument(formData.instrument)) {
// //       if (formData.limsSampleID) limsObj["SampleID"] = formData.limsSampleID;
// //       if (formData.limsTestCode) limsObj["TestCode"] = formData.limsTestCode;
// //       if (formData.limsReplicateID) limsObj["ReplicateID"] = formData.limsReplicateID;
// //     }

// //     const unlockObjDet = {
// //       nMergeFileCount: formData.mergeFileCount || "1",
// //       sTaskID: formData.path || "",
// //       nProtocolStatus: parseInt(formData.protocolID) || 0,
// //       sFileName: formData.fileName || "",
// //       sUserID: formData.user || activeUserDetails.sUserID,
// //       nInterFaceOrderID: formData.interfaceOrderID || "",
// //       sTaskSourcePath: pathItem?.label || "",
// //       sInstrumentID: (formData.instrument || "").padEnd(10, ' '),
// //       sScheduleID: pathItem?.originalItem?.L13ScheduleID || "",
// //       sTemplateID: formData.template || ""
// //     };

// //     const unlockData = {
// //       sTemplateName: templateItem?.label || "",
// //       unlockObjDet: unlockObjDet,
// //       sInstrumentName: instrumentItem?.label || "",
// //       limsObj: limsObj,
// //       mergebreak: mergebreak,
// //       ActiveUserDetails: activeUserDetails,
// //       ApplicationCode: "SDMS"
// //     };

// //     if (auditData) {
// //       unlockData.AuditTrailValues = auditData;
// //     }

// //     return unlockData;
// //   }, [formData, instrumentOptions, pathOptions, templateOptions, isInterfaceInstrument]);

// //   const performUnlockAction = useCallback(async (auditData = null, mergebreak = "true") => {
// //     try {
// //       if (!formData.instrument || !formData.path) {
// //         showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
// //         return;
// //       }

// //       setIsSubmitting(true);
// //       const unlockData = prepareUnlockData(auditData, mergebreak);

// //       const result = await makeAjaxCall(endpoints.unLockInstrument, unlockData, "UnLockInstrument");

// //       if (result?.AuditTrailLogin !== undefined && result.AuditTrailLogin === false) {
// //         showErrorDialogMessage(result.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'), 'error');
// //         return;
// //       }

// //       if (result?.oResObj?.bForceUnlock === true) {
// //         if (mergebreak === "true") {
// //           setAuditAction('unlock');
// //           setAuditCallback(() => async (forceAuditData) => {
// //             await performUnlockAction(forceAuditData, "false");
// //           });
// //           setShowAuditTrail(true);
// //         } else {
// //           await handleUnlockSuccess(result);
// //         }
// //       }
// //       else if (result?.oResObj?.bStatus === true) {
// //         await handleUnlockSuccess(result);
// //       }
// //       else {
// //         showErrorDialogMessage(result?.oResObj?.sInformation || t('instrumentlocktag.failedtounlockinstrument'), 'error');
// //       }

// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorunlockinginstrument'), error);
// //       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [formData, prepareUnlockData, t]);

// //   const checkInterfaceConnection = useCallback(async (instrumentId) => {
// //     const isInterface = isInterfaceInstrument(instrumentId);

// //     if (!isInterface) {
// //       return { needsCheck: false, isConnected: true };
// //     }

// //     const interfaceInstId = instrumentId.includes(':') ?
// //       parseInt(instrumentId.split(':')[1].trim()) : 0;

// //     if (interfaceInstId <= 0) {
// //       return { needsCheck: false, isConnected: true };
// //     }

// //     try {
// //       setIsLoading(true);
// //       const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
// //         InterfaceInstID: interfaceInstId
// //       }, "InterfaceConnectionChecking");

// //       if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
// //         const accessStatus = connectionResult[0].AccessStatus;
// //         return {
// //           needsCheck: true,
// //           isConnected: accessStatus === 1,
// //           data: connectionResult[0]
// //         };
// //       }
// //     } catch (error) {
// //       console.error(t('instrumentlocktag.errorcheckinginterfaceconnection'), error);
// //     } finally {
// //       setIsLoading(false);
// //     }

// //     return { needsCheck: false, isConnected: true };
// //   }, [isInterfaceInstrument, t]);

// //   const handleUnlockSuccess = useCallback(async (result) => {
// //     const successMessage = result?.oResObj?.sInformation || t('instrumentlocktag.instrumentunlockedsuccessfully');
// //     const instrumentName = result?.oResObj?.sInstrument || t('label.instrument');

// //     setIsLocked(false);
// //     setIsAutoLocked(false);
// //     setLockedByOtherUser(false);

// //     setFormData(prev => ({
// //       ...prev,
// //       fileName: '',
// //       mergeFileCount: getSessionValue("MergeCount") || '1',
// //       currentFileCount: '0',
// //       lockID: '',
// //       interfaceOrderID: '',
// //       unlockAfterCapture: false
// //     }));

// //     setErrors({});
// //     setTagErrors({});

// //     showErrorDialogMessage(
// //       `${instrumentName} ${successMessage}`,
// //       'success',
// //       async () => {
// //         if (formData.instrument) {
// //           setIsLoading(true);
// //           try {
// //             await onChangeInstrumentCombo(formData.instrument);
// //           } finally {
// //             setIsLoading(false);
// //           }
// //         }

// //         if (formData.template && formData.instrument) {
// //           setIsLoadingTags(true);
// //           try {
// //             await fetchTags(formData.template, formData.instrument);
// //           } finally {
// //             setIsLoadingTags(false);
// //           }
// //         }
// //       }
// //     );
// //   }, [formData.template, formData.instrument, fetchTags, onChangeInstrumentCombo, t]);

// //   const handleUnlock = useCallback(async () => {
// //     if (!isLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
// //       return;
// //     }

// //     if (isAutoLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //       return;
// //     }

// //     // CRITICAL FIX: Get the current instrument lock status directly from the API
// //     // instead of relying on cached state
// //     const validateCurrentLockStatus = async () => {
// //       try {
// //         if (!formData.instrument) return;

// //         setIsLoading(true);
// //         const response = await onChangeInstrumentCombo(formData.instrument);

// //         if (response) {
// //           // Reset lock states based on fresh API response
// //           if (response.sLockType === 'A') {
// //             setIsAutoLocked(true);
// //             setIsLocked(true);
// //             setLockedByOtherUser(false);
// //             showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //             return false;
// //           } else if (response.sUserID) {
// //             setIsLocked(true);
// //             setIsAutoLocked(false);

// //             const activeUserDetails = getActiveUserDetails();
// //             const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;

// //             // Compare with the actual user ID from API response
// //             if (response.sUserID.trim() === currentUserId) {
// //               setLockedByOtherUser(false);
// //               return true; // User can unlock
// //             } else {
// //               setLockedByOtherUser(true);
// //               showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
// //               return false;
// //             }
// //           } else {
// //             // Instrument is not locked
// //             setIsLocked(false);
// //             setIsAutoLocked(false);
// //             setLockedByOtherUser(false);
// //             showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
// //             return false;
// //           }
// //         }
// //         return false;
// //       } catch (error) {
// //         console.error('Error validating lock status:', error);
// //         return false;
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     // Validate form fields
// //     const newErrors = {};
// //     let isValid = true;

// //     if (!formData.instrument) {
// //       newErrors.instrument = true;
// //       isValid = false;
// //     }

// //     if (!formData.path) {
// //       newErrors.path = true;
// //       isValid = false;
// //     }

// //     setErrors(newErrors);

// //     if (!isValid) {
// //       showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
// //       return;
// //     }

// //     // Validate current lock status with API
// //     const canProceedWithUnlock = await validateCurrentLockStatus();
// //     if (!canProceedWithUnlock) {
// //       return; // Already showed appropriate error message
// //     }

// //     // Check admin rights if locked by other user (though this should be false now)
// //     if (lockedByOtherUser) {
// //       const activeUserDetails = getActiveUserDetails();
// //       const isAdmin = activeUserDetails.sUsername === "Administrator" ||
// //         activeUserDetails.ActiveUserDetails?.sUsername === "Administrator";

// //       if (!isAdmin) {
// //         showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
// //         return;
// //       }
// //     }

// //     // Check for audit trail requirements
// //     const scheduleData = getDeactiveScheduleDataRef.current;
// //     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
// //       const hasAuditTrailRights = true; // This should be determined based on actual rights

// //       if (hasAuditTrailRights) {
// //         setAuditAction('unlock');
// //         setAuditCallback(() => async (auditData) => {
// //           await performUnlockAction(auditData);
// //         });
// //         setShowAuditTrail(true);
// //         return;
// //       }
// //     }

// //     await performUnlockAction();
// //   }, [isLocked, isAutoLocked, lockedByOtherUser, formData.instrument, formData.path, performUnlockAction, onChangeInstrumentCombo, t]);

// //   const handleLock = useCallback(async () => {
// //     if (!validateFormForLock()) {
// //       return;
// //     }

// //     if (isAutoLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //       return;
// //     }

// //     setIsSubmitting(true);

// //     const isInterface = isInterfaceInstrument(formData.instrument);

// //     if (isInterface) {
// //       const interfaceInstId = formData.instrument.includes(':') ?
// //         parseInt(formData.instrument.split(':')[1].trim()) : 0;

// //       if (interfaceInstId > 0) {
// //         try {
// //           setIsLoading(true);
// //           const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
// //             InterfaceInstID: interfaceInstId
// //           }, "InterfaceConnectionChecking");

// //           if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
// //             const connectionData = connectionResult[0];

// //             if (connectionData.AuditTrailLogin === false) {
// //               showErrorDialogMessage(
// //                 connectionData.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'),
// //                 'error'
// //               );
// //               setIsSubmitting(false);
// //               setIsLoading(false);
// //               return;
// //             }

// //             const accessStatus = connectionData.AccessStatus;

// //             if (accessStatus == 1 || accessStatus === "1") {
// //               // Interface is connected - continue with normal flow
// //             } else {
// //               // Interface not connected or status unknown - show confirmation
// //               setIsSubmitting(false);
// //               setIsLoading(false);
// //               showErrorDialogMessage(
// //                 t('instrumentlocktag.interfacerinstrumentisnotconnected'),
// //                 'confirmation',
// //                 async () => {
// //                   setIsSubmitting(true);
// //                   const scheduleData = getDeactiveScheduleDataRef.current;
// //                   if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
// //                     const hasAuditTrailRights = true;

// //                     if (hasAuditTrailRights) {
// //                       setIsSubmitting(false);
// //                       setAuditAction('lock');
// //                       setAuditCallback(() => async (auditData) => {
// //                         await performLockAction(auditData);
// //                       });
// //                       setShowAuditTrail(true);
// //                       return;
// //                     }
// //                   }

// //                   await performLockAction();
// //                 }
// //               );
// //               return;
// //             }
// //           }
// //         } catch (error) {
// //           console.error('Error checking interface connection:', error);
// //           // Continue with lock even if check fails
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       }
// //     }

// //     // Non-interface instrument or check failed - proceed normally
// //     const scheduleData = getDeactiveScheduleDataRef.current;
// //     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
// //       const hasAuditTrailRights = true;

// //       if (hasAuditTrailRights) {
// //         setIsSubmitting(false);
// //         setAuditAction('lock');
// //         setAuditCallback(() => async (auditData) => {
// //           await performLockAction(auditData);
// //         });
// //         setShowAuditTrail(true);
// //         return;
// //       }
// //     }

// //     await performLockAction();
// //   }, [validateFormForLock, isAutoLocked, formData.instrument, performLockAction, isInterfaceInstrument, t]);

// //   const handleUpdate = useCallback(async () => {
// //     if (!validateFormForLock()) {
// //       return;
// //     }

// //     if (isAutoLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //       return;
// //     }

// //     setIsSubmitting(true);
// //     await performLockAction();
// //   }, [validateFormForLock, isAutoLocked, performLockAction]);

// //   const handleFormChange = useCallback((field, value) => {
// //     setFormData(prev => ({ ...prev, [field]: value }));
// //     setErrors(prev => ({ ...prev, [field]: false }));
// //   }, []);

// //   const getFieldDisabledState = useMemo(() => {
// //     if (isAutoLocked) {
// //       return {
// //         client: false,
// //         instrument: false,
// //         path: false,
// //         limsOrder: true,
// //         fileName: true,
// //         template: false,
// //         mergeCount: true,
// //         unlockCheckbox: true,
// //         tags: true,
// //         lockButton: true,
// //         unlockButton: true
// //       };
// //     }

// //     if (isLocked && !lockedByOtherUser) {
// //       return {
// //         client: false,
// //         instrument: false,
// //         path: true,
// //         limsOrder: true,
// //         fileName: false,
// //         template: true,
// //         mergeCount: false,
// //         unlockCheckbox: false,
// //         tags: false,
// //         lockButton: false,
// //         unlockButton: false
// //       };
// //     }

// //     if (isLocked && lockedByOtherUser) {
// //       return {
// //         client: false,
// //         instrument: false,
// //         path: true,
// //         limsOrder: false,
// //         fileName: true,
// //         template: true,
// //         mergeCount: true,
// //         unlockCheckbox: true,
// //         tags: true,
// //         lockButton: true,
// //         unlockButton: false
// //       };
// //     }

// //     return {
// //       client: false,
// //       instrument: false,
// //       path: false,
// //       limsOrder: false,
// //       fileName: false,
// //       template: false,
// //       mergeCount: false,
// //       unlockCheckbox: false,
// //       tags: false,
// //       lockButton: false,
// //       unlockButton: true
// //     };
// //   }, [isLocked, lockedByOtherUser, isAutoLocked]);

// //   return (
// //     <div >
// //       {/* Full Page Loader - Shows for initial load and major operations */}
// //       <FullPageLoader loading={showFullPageLoader} text={

// //         isSubmitting ? t('common.loading') :
// //           t('common.loading')
// //       } />

// //       <div className="bg-white px-4 py-4">
// //         <div className="max-w-[1100px]">
// //           <div className="grid grid-cols-2">
// //             <div className="max-w-[400px]">
// //               <div className="mb-7">
// //                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                   {t('label.client')}
// //                 </label>
// //                 <div className="relative">
// //                   {/* <AnimatedDropdown
// //                     value={formData.client}
// //                     onChange={(e) => handleClientChange(e.target.value)}
// //                     disabled={getFieldDisabledState.client || isLoading}
// //                     options={clientOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     showError={errors.client}
// //                     className="text-xs"
// //                   /> */}

// //                   {/* <AnimatedDropdown
// //                     value={formData.client}
// //                     onChange={(e) => !isLoadingFromScheduler && handleClientChange(e.target.value)}
// //                     disabled={getFieldDisabledState.client || isLoading || isLoadingFromScheduler}
// //                     options={clientOptions}
// //                     displayKey="label" // This shows the name
// //                     valueKey="value"   // This is the ID
// //                     allowFreeInput={false}
// //                     showError={errors.client}
// //                     className="text-xs"
// //                     placeholder="Select Client"
// //                   /> */}
// //                   {/* Client Dropdown */}
// //                   <AnimatedDropdown
// //                     value={formData.clientName || formData.client} // Show Name in dropdown
// //                     onChange={(e) => {
// //                       const selectedName = e.target.value;
// //                       // Find the selected client by name
// //                       const selectedClient = clientOptions.find(c => c.value === selectedName);

// //                       if (selectedClient) {
// //                         // Update form with BOTH ID and Name
// //                         setFormData(prev => ({
// //                           ...prev,
// //                           clientId: selectedClient.id,
// //                           clientName: selectedClient.value,
// //                           client: selectedClient.value
// //                         }));

// //                         // Load instruments using the ID
// //                         loadInstruments(selectedClient.id);
// //                       }
// //                     }}
// //                     disabled={getFieldDisabledState.client || isLoading || isLoadingFromScheduler}
// //                     options={clientOptions}
// //                     displayKey="label" // Show Name
// //                     valueKey="value"   // Store Name as value
// //                     allowFreeInput={false}
// //                     showError={errors.client}
// //                     className="text-xs"
// //                     placeholder="Select Client"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mb-5">
// //                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                   {t('label.instrument')} <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   {/* <AnimatedDropdown
// //                     value={formData.instrument}
// //                     onChange={(e) => handleInstrumentChange(e.target.value)}
// //                     disabled={getFieldDisabledState.instrument || isLoading}
// //                     options={instrumentOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     showError={errors.instrument}
// //                     className="text-xs"
// //                   /> */}
// //                   <AnimatedDropdown
// //                     value={formData.instrument}
// //                     onChange={(e) => !isLoadingFromScheduler && handleInstrumentChange(e.target.value)}
// //                     disabled={getFieldDisabledState.instrument || isLoading || isLoadingFromScheduler}
// //                     options={instrumentOptions}
// //                     displayKey="label" // This shows the instrument name
// //                     valueKey="value"   // This is the instrument ID
// //                     allowFreeInput={false}
// //                     showError={errors.instrument}
// //                     className="text-xs"
// //                     placeholder="Select Instrument"
// //                   />
// //                 </div>
// //                 {isAutoLocked && (
// //                   <div className="mt-0 text-sm bg-[#d9534f] font-roboto text-white">
// //                     {t('instrumentlocktag.thisinstrumentisalreadyautolocked')}
// //                   </div>
// //                 )}
// //               </div>

// //               <div className="mb-7">
// //                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                   {t('instrumentlocktag.path')} <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.path}
// //                     onChange={(e) => handlePathChange(e.target.value)}
// //                     disabled={getFieldDisabledState.path || isLoading}
// //                     options={pathOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     showError={errors.path}
// //                     className="text-xs"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mb-7">
// //                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
// //                   {t('instrumentlocktag.limsorder')}
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.limsOrder}
// //                     onChange={(e) => {
// //                       const selectedValue = e.target.value;
// //                       const selectedOrder = limsOrderOptions.find(order => order.value === selectedValue);

// //                       setFormData(prev => ({
// //                         ...prev,
// //                         limsOrder: selectedValue,
// //                         limsOrderID: selectedValue,
// //                         limsSampleID: selectedOrder?.sampleID || '',
// //                         limsTestCode: selectedOrder?.testCode || '',
// //                         limsReplicateID: selectedOrder?.replicateID || ''
// //                       }));
// //                     }}
// //                     disabled={!isLimsOrderEnabled || getFieldDisabledState.limsOrder || isLoading}
// //                     options={limsOrderOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     className="text-xs flex-1"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mb-7">
// //                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
// //                   {t('instrumentlocktag.filename')} {isFileNameEnabled && <span className="text-red-500">*</span>}
// //                 </label>
// //                 <input
// //                   type="text"
// //                   value={formData.fileName}
// //                   onChange={(e) => handleFormChange('fileName', e.target.value)}
// //                   disabled={!isFileNameEnabled || getFieldDisabledState.fileName || isLoading}
// //                   className={`w-full h-7 px-0 text-xs bg-[#f3f3f3] border-0 border-b-2 outline-none font-semibold font-['verdana']
// //                     ${errors.fileName ? 'border-red-400 text-[#A94442]' : 'border-gray-300 text-[#373737]'}`}
// //                 />
// //               </div>

// //               {showMergeFields && (
// //                 <MergeFileCountRow
// //                   mergeCount={formData.mergeFileCount}
// //                   currentCount={formData.currentFileCount}
// //                   onMergeChange={handleMergeCountChange}
// //                   disabled={!isInstrumentInterface || getFieldDisabledState.mergeCount || isLoading}
// //                   showMergeFields={showMergeFields}
// //                   t={t}
// //                 />
// //               )}

// //               {showUnlockOption && (
// //                 <div className="flex items-center mb-3 gap-4">
// //                   <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
// //                     {t('instrumentlocktag.unlockaftercapture')}
// //                   </label>
// //                   <input
// //                     type="checkbox"
// //                     checked={formData.unlockAfterCapture}
// //                     onChange={(e) => handleFormChange('unlockAfterCapture', e.target.checked)}
// //                     disabled={getFieldDisabledState.unlockCheckbox || isLoading}
// //                     className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
// //                   />
// //                 </div>
// //               )}
// //             </div>

// //             <div className='max-w-[1300px]'>
// //               <div className="max-w-[350px]">
// //                 <div className="mb-7">
// //                   <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                     {t('instrumentlocktag.template')} <span className="text-red-500">*</span>
// //                   </label>
// //                   <div className="relative">
// //                     <AnimatedDropdown
// //                       value={formData.template}
// //                       onChange={(e) => handleTemplateChange(e.target.value)}
// //                       disabled={getFieldDisabledState.template || isLoading}
// //                       options={templateOptions}
// //                       displayKey="label"
// //                       valueKey="value"
// //                       allowFreeInput
// //                       showError={errors.template}
// //                       className="text-xs"
// //                     />
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="mt-7 max-w-[1300px]">
// //                 <div className="max-w-[550px]">
// //                   <TagGrid
// //                     tags={tags}
// //                     onTagValueClick={handleTagValueClick}
// //                     onTagEditRequest={handleTagEditRequest}
// //                     onInlineEditSubmit={handleInlineEditSubmit}
// //                     isLoadingTags={isLoadingTags}
// //                     isLocked={isLocked}
// //                     lockedByOtherUser={lockedByOtherUser}
// //                     isAutoLocked={isAutoLocked}
// //                     t={t}
// //                     tagErrors={tagErrors}
// //                   />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="flex justify-end gap-2 ml-4 mr-4 mt-3 pt-5 border-t border-gray-200">
// //         <button
// //           onClick={isLocked && !lockedByOtherUser ? handleUpdate : handleLock}
// //           disabled={getFieldDisabledState.lockButton || showFullPageLoader}
// //           className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
// //             ${getFieldDisabledState.lockButton || showFullPageLoader
// //               ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
// //               : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
// //           `}
// //         >
// //           {isLocked && !lockedByOtherUser ? <UpdateIcon /> : <LockIcon />}
// //           <span>{isLocked && !lockedByOtherUser ? t('button.update') : t('button.lock')}</span>
// //         </button>

// //         <button
// //           onClick={handleUnlock}
// //           disabled={getFieldDisabledState.unlockButton || showFullPageLoader}
// //           className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
// //             ${getFieldDisabledState.unlockButton || showFullPageLoader
// //               ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
// //               : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
// //           `}
// //         >
// //           <UnlockIcon />
// //           <span>{t('button.unlock')}</span>
// //         </button>
// //       </div>

// //       <AuditTrail
// //         isOpen={showAuditTrail}
// //         onClose={() => setShowAuditTrail(false)}
// //         onAuthorized={(auditData) => {
// //           setShowAuditTrail(false);
// //           if (auditCallback) {
// //             auditCallback(auditData);
// //           }
// //           setAuditAction(null);
// //           setAuditCallback(null);
// //         }}
// //         actionLabel={auditAction === 'lock' ? t('button.lock') :
// //           auditAction === 'unlock' ? t('button.unlock') :
// //             t('button.update')}
// //         defaultReason={auditAction === 'lock' ? t('instrumentlocktag.instrumentlocked') :
// //           auditAction === 'unlock' ? t('instrumentlocktag.instrumentunlocked') :
// //             t('instrumentlocktag.instrumentupdated')}
// //         disableReason={false}
// //       />

// //       {showErrorDialog && (
// //         <Errordialog
// //           message={errorDialogMessage}
// //           type={errorDialogType}
// //           onClose={handleErrorDialogClose}
// //           showCancel={errorDialogType === 'confirmation'}
// //           onCancel={handleErrorDialogClose}
// //           onConfirm={errorDialogType === 'confirmation' ? handleErrorDialogConfirm : undefined}
// //           cancelText={t('button.cancel')}
// //           okText={t('button.ok')}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default InstrumentLockTag;




// // import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// // import { useTranslation } from 'react-i18next';
// // import AuditTrail from '../../../../Layout/Common/AuditTrail';
// // import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
// // import Errordialog from '../../../../Layout/Common/Errordialog';
// // import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
// // import servicecall from '../../../../../Services/servicecall';
// // import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
// // import { useInstrumentLock } from '../../../../../Context/InstrumentLockContext';

// // const LockIcon = () => (
// //   <i className="fa fa-lock text-xs mr-1"></i>
// // );

// // const UnlockIcon = () => (
// //   <i className="fa fa-unlock text-xs mr-1"></i>
// // );

// // const UpdateIcon = () => (
// //   <i className="fa fa-pencil-square-o text-xs mr-1"></i>
// // );

// // const EditPencilIcon = () => (
// //   <i className="fa fa-pencil text-xl mr-0.5"></i>
// // );

// // const MergeFileCountRow = ({ mergeCount, currentCount, onMergeChange, disabled, showMergeFields, t }) => {
// //   if (!showMergeFields) return null;
  
// //   const handleChange = (e) => {
// //     const value = e.target.value;
// //     if (value === '' || /^\d+$/.test(value)) {
// //       const numValue = parseInt(value) || 0;
// //       if (numValue > 10000) {
// //         onMergeChange("10000");
// //       } else {
// //         onMergeChange(value);
// //       }
// //     }
// //   };
  
// //   return (
// //     <div className="mb-6 mt-7">
// //       <div className="flex items-center gap-6">
// //         <div className="flex items-center gap-2">
// //           <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
// //             {t('instrumentlocktag.mergefilecount')}
// //           </label>
// //           <input
// //             type="text"
// //             value={mergeCount}
// //             onChange={handleChange}
// //             onBlur={(e) => {
// //               if (e.target.value === '' || parseInt(e.target.value) < 1) {
// //                 onMergeChange("1");
// //               }
// //             }}
// //             disabled={disabled}
// //             className="w-16 h-7 px-2 text-xs text-center font-['verdana'] border border-gray-300 rounded bg-white hover:border-gray-400 text-[#405F7D]"
// //           />
// //         </div>
        
// //         <div className="flex items-center gap-2">
// //           <label className="text-xs text-[#405F7D] min-w-[150px] font-semibold font-roboto">
// //             {t('instrumentlocktag.currentuploadfilecount')}
// //           </label>
// //           <input
// //             type="text"
// //             value={currentCount}
// //             disabled={true}
// //             className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-[#405F7D] font-verdana"
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const InlineEditIcon = () => (
// //   <i className="fa fa-edit text-lg mr-1"></i>
// // );

// // const TagGrid = React.memo(({ tags, onTagValueClick, isLoadingTags, isLocked, lockedByOtherUser, isAutoLocked, onTagEditRequest, onInlineEditSubmit, t, tagErrors }) => {
// //   const [tooltipState, setTooltipState] = useState({
// //     isOpen: false,
// //     tagIndex: null,
// //     position: { top: 0, left: 0 },
// //     searchTerm: '',
// //     selectedValue: '',
// //     selectedValueID: '',
// //     options: []
// //   });

// //   const [selectedTagIndex, setSelectedTagIndex] = useState(null);
// //   const [showErrorDialog, setShowErrorDialog] = useState(false);
// //   const [errorMessage, setErrorMessage] = useState('');
// //   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
// //   const [inlineEditState, setInlineEditState] = useState({
// //     isEditing: false,
// //     tagIndex: null,
// //     inputValue: ''
// //   });

// //   const showInformationMessage = (message) => {
// //     setErrorMessage(message);
// //     setShowErrorDialog(true);
// //   };

// //   const canEditTag = useCallback((tagIndex) => {
// //     if (tagIndex === 0) return true;
// //     for (let i = 0; i < tagIndex; i++) {
// //       if (!tags[i]?.value) return false;
// //     }
// //     return true;
// //   }, [tags]);

// //   const getErrorMessage = useCallback((tagIndex) => {
// //     for (let i = tagIndex - 1; i >= 0; i--) {
// //       if (!tags[i]?.value) {
// //         return `${t('instrumentlocktag.pleaseselect')} ${tags[i]?.tagName} ${t('instrumentlocktag.value').toLowerCase()} first`;
// //       }
// //     }
// //     return `${t('instrumentlocktag.pleaseselect')} required ${t('instrumentlocktag.value').toLowerCase()} first`;
// //   }, [tags, t]);

// //   const handleEditClick = async (tag, index, event) => {
// //     event.stopPropagation();
    
// //     const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
// //     if (shouldDisableEdit) return;
    
// //     if (tag.required && tag.tagID !== 0) {
// //       if (!canEditTag(index)) {
// //         showInformationMessage(getErrorMessage(index));
// //         return;
// //       }
      
// //       const calculateTooltipPositionFromRect = (buttonRect) => {
// //         const viewportHeight = window.innerHeight;
// //         const viewportWidth = window.innerWidth;
// //         const tooltipWidth = 250;
// //         const tooltipHeight = 220;
        
// //         let left = buttonRect.left - tooltipWidth + 0;
// //         let top = buttonRect.top - (tooltipHeight) + 10;
        
// //         if (top < 10) top = 10;
// //         if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
// //         if (left < 10) left = buttonRect.right + 10;
// //         if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
        
// //         return { top, left };
// //       };
      
// //       const buttonRect = event.currentTarget.getBoundingClientRect();
// //       const position = calculateTooltipPositionFromRect(buttonRect);
      
// //       setSelectedTagIndex(index);
      
// //       if (tag.options && tag.options.length > 0) {
// //         setTooltipState({
// //           isOpen: true,
// //           tagIndex: index,
// //           position,
// //           searchTerm: '',
// //           selectedValue: tag.value || '',
// //           selectedValueID: tag.valueID || '',
// //           options: tag.options
// //         });
// //         return;
// //       }
      
// //       setIsLoadingOptions(true);
      
// //       try {
// //         const options = await onTagEditRequest(index);
        
// //         setTooltipState({
// //           isOpen: true,
// //           tagIndex: index,
// //           position,
// //           searchTerm: '',
// //           selectedValue: tag.value || '',
// //           selectedValueID: tag.valueID || '',
// //           options: options || []
// //         });
// //       } catch (error) {
// //         showInformationMessage(t('instrumentlocktag.failedtoloadoptions'));
// //       } finally {
// //         setIsLoadingOptions(false);
// //       }
// //     } else {
// //       setInlineEditState({
// //         isEditing: true,
// //         tagIndex: index,
// //         inputValue: tag.value || ''
// //       });
// //     }
// //   };

// //   const handleInlineEditSubmit = () => {
// //     if (inlineEditState.tagIndex !== null && inlineEditState.inputValue !== undefined) {
// //       onInlineEditSubmit(
// //         inlineEditState.tagIndex,
// //         inlineEditState.inputValue,
// //         inlineEditState.inputValue
// //       );
// //     }
// //     setInlineEditState({
// //       isEditing: false,
// //       tagIndex: null,
// //       inputValue: ''
// //     });
// //   };

// //   const handleInlineEditCancel = () => {
// //     setInlineEditState({
// //       isEditing: false,
// //       tagIndex: null,
// //       inputValue: ''
// //     });
// //   };

// //   const handleTooltipSubmit = () => {
// //     if (tooltipState.tagIndex !== null) {
// //       onTagValueClick(
// //         tooltipState.tagIndex, 
// //         tooltipState.selectedValue || '',
// //         tooltipState.selectedValueID || ''
// //       );
// //     }
// //     setTooltipState({
// //       isOpen: false,
// //       tagIndex: null,
// //       position: { top: 0, left: 0 },
// //       searchTerm: '',
// //       selectedValue: '',
// //       selectedValueID: '',
// //       options: []
// //     });
// //   };

// //   const handleTooltipClose = () => {
// //     setTooltipState({
// //       isOpen: false,
// //       tagIndex: null,
// //       position: { top: 0, left: 0 },
// //       searchTerm: '',
// //       selectedValue: '',
// //       selectedValueID: '',
// //       options: []
// //     });
// //   };

// //   const handleOptionClick = (optionValue, optionValueID) => {
// //     setTooltipState(prev => ({
// //       ...prev,
// //       selectedValue: optionValue,
// //       selectedValueID: optionValueID
// //     }));
// //   };

// //   const handleSearchChange = (value) => {
// //     setTooltipState(prev => ({
// //       ...prev,
// //       searchTerm: value
// //     }));
// //   };

// //   const filteredOptions = tooltipState.options.filter(opt => 
// //     opt.label.toLowerCase().includes(tooltipState.searchTerm.toLowerCase())
// //   );

// //   if (isLoadingTags) {
// //     return (
// //       <div className="border border-[#f3f3f3] rounded relative">
// //         <div className="flex justify-center items-center h-[250px]">
// //           <div className="text-sm text-gray-500">{t('common.loading')}...</div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <>
// //       <div className="border border-[#f3f3f3] rounded relative">
// //         <div className="grid grid-cols-2 bg-[#fbfbfb] border-b border-[#f3f3f3]">
// //           <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
// //             {t('instrumentlocktag.tagName')}
// //           </div>
// //           <div className="px-1 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
// //             {t('instrumentlocktag.tagValue')}
// //           </div>
// //         </div>
        
// //         <div className="bg-white min-h-[250px]">
// //           {tags.length === 0 ? (
// //             <div className="px-4 py-12 text-center text-xs text-[#4b4b4b] font-roboto">            
// //               {t('instrumentlocktag.noTagValue')}
// //             </div>
// //           ) : (
// //             tags.map((tag, idx) => {
// //               const isSelected = selectedTagIndex === idx;
// //               const isThisTagLoading = isLoadingOptions && isSelected;
// //               const isInlineEditing = inlineEditState.isEditing && inlineEditState.tagIndex === idx;
// //               const hasError = tagErrors[idx] && tag.required && !tag.value;
              
// //               const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
// //               const isDropdownMode = tag.required && tag.tagID !== 0;
// //               const showEditIcon = tag.editable && !shouldDisableEdit;
              
// //               return (
// //                 <div 
// //                   key={`tag-${idx}-${tag.tagID}`}
// //                   className={`grid grid-cols-2 border-b border-[#e7e6e6] last:border-b-1 min-h-[40px]
// //                     ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#378cfc]' : 'bg-white border-l-4 border-l-transparent'}
// //                     ${hasError ? 'border-b-2 border-b-red-400' : ''}
// //                     ${tag.editable && !shouldDisableEdit ? 'cursor-pointer hover:bg-[#eef2f9]' : 'cursor-default'}
// //                   `}
// //                   onClick={() => setSelectedTagIndex(idx)}
// //                 >
// //                   <div className={`px-4 text-xs flex items-center font-['verdana']
// //                     ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
// //                   `}>
// //                     {tag.tagName}
// //                     {tag.required && <span className="text-red-500 ml-1">*</span>}
// //                   </div>
                  
// //                   <div className="px-0.5 py-0 text-xs flex items-center justify-between gap-0">
// //                     {isInlineEditing ? (
// //                       <div className="flex-1 flex items-center">
// //                         <input
// //                           type="text"
// //                           value={inlineEditState.inputValue}
// //                           onChange={(e) => setInlineEditState(prev => ({
// //                             ...prev,
// //                             inputValue: e.target.value
// //                           }))}
// //                           className={`w-full h-9 px-0.5 text-xs font-bold border border-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:border-white
// //                             ${hasError ? 'border-red-400' : ''}`}
// //                           autoFocus
// //                           onBlur={handleInlineEditSubmit}
// //                           onKeyDown={(e) => {
// //                             if (e.key === 'Enter') {
// //                               handleInlineEditSubmit();
// //                             } else if (e.key === 'Escape') {
// //                               handleInlineEditCancel();
// //                             }
// //                           }}
// //                         />
// //                       </div>
// //                     ) : (
// //                       <>
// //                         <span className={`flex-1 font-['verdana'] ${
// //                           isSelected ? 'font-bold' : ''
// //                         } text-[#373737]`}>
// //                           {tag.value || ''}
// //                           {isThisTagLoading && (
// //                             <span className="ml-2 text-xs text-gray-500">{t('common.loading')}...</span>
// //                           )}
// //                         </span>
                        
// //                         {showEditIcon && (
// //                           <button
// //                             onClick={(e) => {
// //                               setSelectedTagIndex(idx);
// //                               handleEditClick(tag, idx, e);
// //                             }}
// //                             className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool"
// //                             title={t('button.edit')}
// //                             disabled={isThisTagLoading}
// //                           >
// //                             {isDropdownMode ? (
// //                               <EditPencilIcon />
// //                             ) : (
// //                               <InlineEditIcon />
// //                             )}
// //                           </button>
// //                         )}
// //                       </>
// //                     )}
// //                   </div>
// //                 </div>
// //               );
// //             })
// //           )}
// //         </div>
// //       </div>

// //       {showErrorDialog && (
// //         <Errordialog
// //           message={errorMessage}
// //           type="information"
// //           onClose={() => setShowErrorDialog(false)}
// //           okText={t('button.ok')}
// //         />
// //       )}

// //       {tooltipState.isOpen && (
// //         <div 
// //           className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col"
// //           style={{
// //             top: `${tooltipState.position.top}px`,
// //             left: `${tooltipState.position.left}px`,
// //           }}
// //         >
// //           <div className="p-0.5 border-gray-200">
// //             <div className="mb-0">
// //               <input
// //                 type="text"
// //                 value={tooltipState.searchTerm}
// //                 onChange={(e) => handleSearchChange(e.target.value)}
// //                 className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
// //                 autoFocus
// //                 placeholder={t('instrumentlocktag.searchplaceholder')}
// //               />
// //             </div>
// //           </div>
          
// //           <div className="flex-1 overflow-y-auto min-h-0">
// //             {filteredOptions.length === 0 ? (
// //               <div className="text-center py-6 text-xs text-gray-500 font-roboto">
// //                 {t('instrumentlocktag.nooptionsfound')}
// //               </div>
// //             ) : (
// //               filteredOptions.map((option, idx) => {
// //                 const isSelected = tooltipState.selectedValue === option.label && 
// //                                    tooltipState.selectedValueID === option.value;
                
// //                 return (
// //                   <div
// //                     key={`option-${idx}-${option.value}`}
// //                     onClick={() => handleOptionClick(option.label, option.value)}
// //                     onDoubleClick={handleTooltipSubmit}
// //                     className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
// //                       ${isSelected ? 'bg-[#f2f2f2]' : ''}
// //                       ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
// //                     `}
// //                   >
// //                     <div className="flex items-center ml-1">
// //                       <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
// //                         {option.label}
// //                       </span>
// //                     </div>
// //                   </div>
// //                 );
// //               })
// //             )}
// //           </div>
          
// //           <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
// //             <button
// //               onClick={handleTooltipSubmit}
// //               className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
// //             >
// //               <i className="fa fa-check-square-o mr-1"></i>
// //               {t('button.submit')}
// //             </button>
// //             <button
// //               onClick={handleTooltipClose}
// //               className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
// //             >
// //               <i className="fa fa-times mr-1"></i>
// //               {t('button.cancel')}
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // });

// // TagGrid.displayName = 'TagGrid';

// // const InstrumentLockTag = ({ scheduleData }) => {
// //   const { t } = useTranslation();
// //   const { navigateAfterLock } = useInstrumentLock();
// //   const { postData } = servicecall();
  
// //   const endpoints = {
// //     lockTemplateCombo: "InstrumentLock/LockTemplateCombo",
// //     loadTagCategory: "InstrumentLock/LoadTagCategory",
// //     clientLockCombo: "InstrumentLock/clientlockcombo",
// //     lockInstrumentCombo: "InstrumentLock/LockInstrumentCombo",
// //     lockPathCombo: "InstrumentLock/LockPathCombo",
// //     loadCategoryTagValueAndID: "InstrumentLock/LoadCategoryTagValueAndID",
// //     lockUserCombo: "InstrumentLock/LockUserCombo", 
// //     mergeFileAndAutoUnlock: "InstrumentLock/MergeFileAndAutounlock",
// //     loadProtocol: "InstrumentLock/LoadProtocol",
// //     lockLimsordercombo: "InstrumentLock/lockLimsordercombo",
// //     onChangeInstrumentCombo: "InstrumentLock/OnChangeInstrumentCombo",
// //     lockActiveParsingInstrumentCombo: "InstrumentLock/LockActiveParsingInstrumentCombo",
// //     lockDeactiveParsingInstrumentCombo: "InstrumentLock/LockDeactiveParsingInstrumentCombo",
// //     lockActiveInstrumentPathCombo: "InstrumentLock/LockActiveInstrumentPathCombo",
// //     lockDeactiveInstrumentPathCombo: "InstrumentLock/LockDeactiveInstrumentPathCombo",
// //     interfaceConnectionChecking: "InstrumentLock/InterfaceConnectionChecking",
// //     lockInstrument: "InstrumentLock/LockInstrument",
// //     unLockInstrument: "InstrumentLock/UnLockInstrument"
// //   };

// //   const [showErrorDialog, setShowErrorDialog] = useState(false);
// //   const [errorDialogMessage, setErrorDialogMessage] = useState('');
// //   const [errorDialogType, setErrorDialogType] = useState('information');
// //   const [errorDialogCallback, setErrorDialogCallback] = useState(null);

// //   const showErrorDialogMessage = (message, type = 'information', onConfirm = null) => {
// //     if (type === 'confirmation' && onConfirm) {
// //       setErrorDialogMessage(message);
// //       setErrorDialogType('confirmation');
// //       setErrorDialogCallback(() => onConfirm);
// //       setShowErrorDialog(true);
// //     } else {
// //       setErrorDialogMessage(message);
// //       setErrorDialogType(type);
// //       setErrorDialogCallback(null);
// //       setShowErrorDialog(true);
// //     }
// //   };

// //   const handleErrorDialogClose = () => {
// //     setShowErrorDialog(false);
// //     setErrorDialogCallback(null);
// //   };

// //   const handleErrorDialogConfirm = () => {
// //     if (errorDialogCallback) {
// //       errorDialogCallback();
// //     }
// //     setShowErrorDialog(false);
// //     setErrorDialogCallback(null);
// //   };

// //   const getActiveUserDetails = useCallback(() => {
// //     const userDetails = CF_activeUserdetails();
// //     return {
// //       ...userDetails.ActiveUserDetails,
// //       sUserID: userDetails.ActiveUserDetails?.sUserID || userDetails.sUserID,
// //       sUsername: userDetails.ActiveUserDetails?.sUsername || userDetails.sUsername
// //     };
// //   }, []);

// //   const getSessionValue = (key) => {
// //     try {
// //       const value = sessionStorage.getItem(key);
// //       if (value === null) {
// //         switch(key) {
// //           case 'MergeCount': return '1';
// //           case 'FileName': return 'false';
// //           case 'L11ParserType': return '0';
// //           default: return "";
// //         }
// //       }
// //       return value;
// //     } catch {
// //       return "";
// //     }
// //   };

// //   const setSessionValue = (key, value) => {
// //     try {
// //       sessionStorage.setItem(key, value);
// //     } catch (error) {
// //       // Silent error handling
// //     }
// //   };

// //   const makeAjaxCall = async (url, passObjDet, process) => {
// //     try {
// //       const userDetails = CF_activeUserdetails();
      
// //       let requestBody;
      
// //       if (url === endpoints.loadCategoryTagValueAndID) {
// //         requestBody = {
// //           passObjDet: passObjDet,
// //           ActiveUserDetails: userDetails.ActiveUserDetails,
// //           ApplicationCode: userDetails.ApplicationCode
// //         };
// //       } else {
// //         requestBody = {
// //           ...passObjDet,
// //           ActiveUserDetails: userDetails.ActiveUserDetails,
// //           ApplicationCode: userDetails.ApplicationCode
// //         };
// //       }
      
// //       const response = await postData(url, requestBody);
        
// //       if (!response) {
// //         return null;
// //       }
      
// //       if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
// //         throw new Error(response.Message || response.ErrorMessage || `${t('Auditpopup.somethingwentwrong')} ${url}`);
// //       }
      
// //       if (process === "InterfaceConnectionChecking") {
// //         let formattedResponse;
        
// //         if (response.AuditTrailLogin !== undefined) {
// //           return [response];
// //         }
        
// //         if (Array.isArray(response)) {
// //           formattedResponse = response;
// //         } else if (response && typeof response === 'object') {
// //           if (response.AccessStatus !== undefined) {
// //             formattedResponse = [response];
// //           } else if (response[0] && response[0].AccessStatus !== undefined) {
// //             formattedResponse = Object.values(response);
// //           } else {
// //             formattedResponse = [response];
// //           }
// //         } else {
// //           formattedResponse = [];
// //         }
        
// //         return formattedResponse;
// //       }
      
// //       if (process === "LockInstrument" || process === "UnLockInstrument") {
// //         return response;
// //       }
      
// //       if (process === "SelectPathFileUSerTemplate") {
// //         return response.oResInstChange || response;
// //       }
      
// //       if (response.oResObj !== undefined) {
// //         return response.oResObj;
// //       }
      
// //       if (response.oResInstChange !== undefined) {
// //         return response.oResInstChange;
// //       }
      
// //       if (response.list !== undefined) {
// //         return response.list;
// //       }
      
// //       if (Array.isArray(response)) {
// //         return response;
// //       }
      
// //       return response;
      
// //     } catch (error) {
// //       throw error;
// //     }
// //   };

// //   const getDeactiveScheduleDataRef = useRef(scheduleData);
// //   const initialLoadDoneRef = useRef(false);

// //   const [formData, setFormData] = useState({
// //     client: '',
// //     instrument: '',
// //     path: '',
// //     limsOrder: '',
// //     fileName: '',
// //     template: '',
// //     mergeFileCount: '1',
// //     currentFileCount: '0',
// //     unlockAfterCapture: false,
// //     user: '',
// //     lockID: '',
// //     interfaceOrderID: '',
// //     protocolID: '0'
// //   });

// //   const [errors, setErrors] = useState({});
// //   const [tagErrors, setTagErrors] = useState({});
// //   const [isLocked, setIsLocked] = useState(false);
// //   const [showMergeFields, setShowMergeFields] = useState(false);
// //   const [showUnlockOption, setShowUnlockOption] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isLoadingTags, setIsLoadingTags] = useState(false);
// //   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
// //   const [isInstrumentInterface, setIsInstrumentInterface] = useState(false);
// //   const [isFileNameEnabled, setIsFileNameEnabled] = useState(false);
// //   const [isLimsOrderEnabled, setIsLimsOrderEnabled] = useState(false);
// //   const [lockedByOtherUser, setLockedByOtherUser] = useState(false);
// //   const [isAutoLocked, setIsAutoLocked] = useState(false);
// //   const [deviceType, setDeviceType] = useState('desktop');
// //   const [isSubmitting, setIsSubmitting] = useState(false);
  
// //   const [showAuditTrail, setShowAuditTrail] = useState(false);
// //   const [auditAction, setAuditAction] = useState(null);
// //   const [auditCallback, setAuditCallback] = useState(null);

// //   const [templateOptions, setTemplateOptions] = useState([]);
// //   const [clientOptions, setClientOptions] = useState([]);
// //   const [instrumentOptions, setInstrumentOptions] = useState([]);
// //   const [pathOptions, setPathOptions] = useState([]);
// //   const [limsOrderOptions, setLimsOrderOptions] = useState([]);
// //   const [userOptions, setUserOptions] = useState([]);
// //   const [tags, setTags] = useState([]);

// //   const tagIdToNameMap = {
// //     1: "Sample",
// //     2: "Test", 
// //     3: "Project",
// //     4: "BatchNo"
// //   };

// //   useEffect(() => {
// //     const device = sessionStorage.getItem("device") || "desktop";
// //     setDeviceType(device);
// //   }, []);

// //   const isInterfaceInstrument = useCallback((instrumentId) => {
// //     if (!instrumentId) return false;
    
// //     const idStr = instrumentId.toString().trim();
// //     const parts = idStr.split(':');
// //     return parts.length > 1 && parts[1] && parts[1].trim() !== "0";
// //   }, []);

// //   const loadTagValues = useCallback(async (tagId, templateId, instrumentId, tagIndex, previousTagValueID = "") => {
// //     try {
// //       const requestBody = {
// //         uid: tagIndex || 0,
// //         sUserID: formData.path || "",
// //         nTagID: parseInt(tagId) || 0,
// //         sTagValueID: previousTagValueID || "          ",
// //         sInstrumentID: instrumentId.padEnd(10, ' '),
// //         sTemplateID: templateId
// //       };
      
// //       const response = await makeAjaxCall(endpoints.loadCategoryTagValueAndID, requestBody);
      
// //       if (response && Array.isArray(response)) {
// //         const options = response.map(item => ({
// //           value: item.sTagValueID ? item.sTagValueID.trim() : '',
// //           label: item.sTagValue || t('instrumentlocktag.unknownvalue')
// //         })).filter(opt => opt.value && opt.label);
        
// //         return options;
// //       }
      
// //       return [];
      
// //     } catch (error) {
// //       return [];
// //     }
// //   }, [formData.path, t]);

// //   const fetchTags = useCallback(async (templateId, instrumentId) => {
// //     if (!templateId || !instrumentId) {
// //       setTags([]);
// //       return;
// //     }
    
// //     setIsLoadingTags(true);
// //     try {
// //       const currentInstrumentId = instrumentId.padEnd(10, ' ');
      
// //       const requestBody = {
// //         sUserID: formData.path || "",
// //         ActiveUserDetails: getActiveUserDetails(),
// //         sInstrumentID: currentInstrumentId,
// //         ApplicationCode: "SDMS",
// //         sTemplateID: templateId
// //       };
      
// //       const response = await makeAjaxCall(endpoints.loadTagCategory, requestBody);
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const transformedTags = await Promise.all(response.map(async (item, index) => {
// //           const tagId = item.L58TagID || item.L8iTagID || index;
// //           const tagName = tagIdToNameMap[tagId] || item.L58TagName || t('instrumentlocktag.unknowntag');
// //           const value = item.Value || '';
// //           const valueID = item.ValueID || '';
// //           const required = item.L58ValueStatus || false;
// //           const order = item.L58Order || index;
          
// //           let options = [];
// //           if (index === 0 && tagId && required) {
// //             options = await loadTagValues(tagId, templateId, instrumentId, index, "");
// //           }
          
// //           return {
// //             tagName: tagName,
// //             value: value.trim(),
// //             valueID: valueID ? valueID.trim() : '',
// //             tagID: tagId,
// //             order: order,
// //             required: required,
// //             editable: true,
// //             options: options
// //           };
// //         }));
        
// //         transformedTags.sort((a, b) => a.order - b.order);
// //         setTags(transformedTags);
        
// //       } else {
// //         setTags([]);
// //       }
// //     } catch (error) {
// //       setTags([]);
// //     } finally {
// //       setIsLoadingTags(false);
// //     }
// //   }, [formData.path, loadTagValues, t]);

// //   const handleInlineEditSubmit = useCallback((index, value, valueID) => {
// //     setTags(prev => {
// //       const updatedTags = prev.map((t, idx) => {
// //         if (idx === index) {
// //           return { ...t, value, valueID };
// //         }
        
// //         if (idx > index) {
// //           return { ...t, value: '', valueID: '', options: [] };
// //         }
        
// //         return t;
// //       });
      
// //       return updatedTags;
// //     });
    
// //     if (value) {
// //       setTagErrors(prev => ({ ...prev, [index]: false }));
// //     }
// //   }, []);

// //   const checkMergeAndAutoUnlockSettings = useCallback(async () => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.mergeFileAndAutoUnlock, {});
      
// //       if (response) {
// //         const showMerge = response.MergeCount?.[0]?.L67Status === false;
// //         setShowMergeFields(showMerge);
        
// //         const showUnlock = response.AutoUnlock?.[0]?.L67Status === false;
// //         setShowUnlockOption(showUnlock);
        
// //         if (response.MergeCountValue?.[0]?.L42ValueSettings) {
// //           const mergeCount = response.MergeCountValue[0].L42ValueSettings;
// //           setFormData(prev => ({ ...prev, mergeFileCount: mergeCount }));
// //           setSessionValue("MergeCount", mergeCount);
// //         }
        
// //         if (response.AutoUnlockValue?.[0]?.L42ValueSettings === "1") {
// //           setFormData(prev => ({ ...prev, unlockAfterCapture: true }));
// //         }
// //       }
// //     } catch (error) {
// //       // Silent error handling
// //     }
// //   }, [t]);

// //   const loadUsers = useCallback(async () => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.lockUserCombo, {});
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const users = response.map(user => ({
// //           value: user.sUserID ? user.sUserID.trim() : '',
// //           label: user.sUserName || t('instrumentlocktag.unknownuser')
// //         }));
        
// //         setUserOptions(users);
        
// //         const activeUserDetails = getActiveUserDetails();
// //         const currentUserId = activeUserDetails.sUserID || "U1";
        
// //         const currentUser = users.find(user => user.value === currentUserId);
// //         if (currentUser) {
// //           setFormData(prev => ({ ...prev, user: currentUser.value }));
// //         }
// //       }
// //     } catch (error) {
// //       // Silent error handling
// //     }
// //   }, [t]);

// //   const loadProtocol = useCallback(async (instrumentId) => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.loadProtocol, {
// //         sInstrumentID: instrumentId
// //       });
      
// //       if (response) {
// //         const parserTypeValue = String(response.L11ParserType || '0');
        
// //         const fileNameEnabled = response.FileName === "true";
// //         setIsFileNameEnabled(fileNameEnabled);
        
// //         setSessionValue("FileName", fileNameEnabled.toString());
// //         setSessionValue("L11ParserType", parserTypeValue);
        
// //         const isInterface = isInterfaceInstrument(instrumentId);
// //         setIsInstrumentInterface(isInterface);
        
// //         if (isInterface) {
// //           if (fileNameEnabled) {
// //             setIsLimsOrderEnabled(false);
// //           } else {
// //             setIsLimsOrderEnabled(true);
// //           }
// //         } else {
// //           setIsLimsOrderEnabled(false);
// //         }
        
// //         return response;
// //       }
// //     } catch (error) {
// //       return null;
// //     }
// //   }, [isInterfaceInstrument, t]);

// //   const loadLimsOrder = useCallback(async (interfaceInstId) => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.lockLimsordercombo, {
// //         nInterfaceInstID: interfaceInstId
// //       });
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const limsOrders = response.map(order => ({
// //           value: order.nOrderID ? String(order.nOrderID).trim() : '',
// //           label: order.LIMSOrder || t('instrumentlocktag.unknownorder'),
// //           orderID: order.nOrderID || '',
// //           sampleID: order.SampleID || '',
// //           testCode: order.TestCode || '',
// //           replicateID: order.ReplicateID || '',
// //           ...order
// //         }));
        
// //         setLimsOrderOptions(limsOrders);
// //         setIsLimsOrderEnabled(true);
        
// //         if (limsOrders.length > 0) {
// //           const firstOrder = limsOrders[0];
// //           setFormData(prev => ({ 
// //             ...prev, 
// //             limsOrder: firstOrder.value,
// //             limsOrderID: firstOrder.orderID,
// //             limsSampleID: firstOrder.sampleID,
// //             limsTestCode: firstOrder.testCode,
// //             limsReplicateID: firstOrder.replicateID
// //           }));
// //         }
        
// //         return limsOrders;
// //       } else {
// //         setLimsOrderOptions([]);
// //         setIsLimsOrderEnabled(false);
// //         setFormData(prev => ({ 
// //           ...prev, 
// //           limsOrder: '',
// //           limsOrderID: '',
// //           limsSampleID: '',
// //           limsTestCode: '',
// //           limsReplicateID: ''
// //         }));
// //         return [];
// //       }
// //     } catch (error) {
// //       setLimsOrderOptions([]);
// //       setIsLimsOrderEnabled(false);
// //       setFormData(prev => ({ 
// //         ...prev, 
// //         limsOrder: '',
// //         limsOrderID: '',
// //         limsSampleID: '',
// //         limsTestCode: '',
// //         limsReplicateID: ''
// //       }));
// //       return [];
// //     }
// //   }, [t]);

// //   const onChangeInstrumentCombo = useCallback(async (instrumentId) => {
// //   try {
// //     const nLLProStatus = 0;
// //     const nProtocolStatus = parseInt(formData.protocolID) || 0;
// //     const nProtocolStatusfile = isFileNameEnabled ? 101 : 0;
    
// //     const response = await makeAjaxCall(endpoints.onChangeInstrumentCombo, {
// //       sInstrumentID: instrumentId,
// //       nLLProStatus: nLLProStatus,
// //       nProtocolStatus: nProtocolStatus,
// //       nProtocolStatusfile: nProtocolStatusfile
// //     }, "SelectPathFileUSerTemplate");
    
// //     if (response) {
// //       const activeUserDetails = getActiveUserDetails();
// //       const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
      
// //       // Handle lock status
// //       if (response.sLockType === 'A') {
// //         setIsAutoLocked(true);
// //         setIsLocked(true);
// //         setLockedByOtherUser(false);
// //       } else if (response.sUserID) {
// //         setIsLocked(true);
// //         setIsAutoLocked(false);
        
// //         const responseUserId = response.sUserID ? response.sUserID.trim() : '';
        
// //         if (responseUserId === currentUserId) {
// //           setLockedByOtherUser(false);
// //         } else {
// //           setLockedByOtherUser(true);
// //         }
// //       } else {
// //         setIsLocked(false);
// //         setIsAutoLocked(false);
// //         setLockedByOtherUser(false);
// //       }
      
// //       const updates = {};
      
// //       if (response.sFileName) {
// //         updates.fileName = response.sFileName;
// //       }
      
// //       if (response.nCurMergeFileNo > 0) {
// //         updates.currentFileCount = String(response.nCurMergeFileNo);
// //       } else {
// //         updates.currentFileCount = '0';
// //       }
      
// //       if (response.nMergeFileCount > 0) {
// //         updates.mergeFileCount = String(response.nMergeFileCount);
// //         setSessionValue("LockedMergeCount", String(response.nMergeFileCount));
// //       } else if (response.sTaskID != null) {
// //         const lockedMergeCount = getSessionValue("LockedMergeCount");
// //         if (lockedMergeCount) {
// //           updates.mergeFileCount = lockedMergeCount;
// //         } else {
// //           updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //         }
// //       } else {
// //         updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //       }
      
// //       if (response.nAutoUnlock) {
// //         updates.unlockAfterCapture = true;
// //       } else {
// //         updates.unlockAfterCapture = false;
// //       }
      
// //       if (response.sLockID) {
// //         updates.lockID = response.sLockID;
// //       } else {
// //         updates.lockID = '';
// //       }
      
// //       if (response.nInterFaceOrderID) {
// //         updates.interfaceOrderID = String(response.nInterFaceOrderID);
// //       } else {
// //         updates.interfaceOrderID = '';
// //       }
      
// //       // Auto-select first template for auto-locked instruments
// //       if (response.sLockType === 'A' && templateOptions.length > 0) {
// //         const firstTemplateValue = templateOptions[0].value;
// //         updates.template = firstTemplateValue;
// //       } else if (response.sTemplateID) {
// //         // For user-locked instruments, use the template they used
// //         updates.template = response.sTemplateID;
// //       }
// //       // If not locked, template remains empty
      
// //       setFormData(prev => ({ ...prev, ...updates }));
      
// //       // If template was set (auto-locked or user-locked), return response
// //       // The useEffect will automatically load tags for the template
      
// //       return response;
// //     }
// //   } catch (error) {
// //     return null;
// //   }
// // }, [formData.protocolID, isFileNameEnabled, templateOptions]);

// //   const loadPaths = useCallback(async (instrumentId) => {
// //     try {
// //       let endpoint = endpoints.lockPathCombo;
// //       let requestBody = {
// //         sInstrumentID: instrumentId,
// //         sScheduleID: ""
// //       };
      
// //       if (getDeactiveScheduleDataRef.current) {
// //         const scheduleData = getDeactiveScheduleDataRef.current;
// //         const scheduleId = scheduleData.L13ScheduleID;
// //         const taskType = scheduleData.TaskType;
        
// //         if (taskType === "ScheduleCreation") {
// //           endpoint = endpoints.lockActiveInstrumentPathCombo;
// //         } else {
// //           endpoint = endpoints.lockDeactiveInstrumentPathCombo;
// //         }
// //         requestBody.sScheduleID = scheduleId;
// //       }
      
// //       const response = await makeAjaxCall(endpoint, requestBody);
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const pathOptionsData = response.map(path => ({
// //           value: path.sTaskID || path.L13ScheduleID || '',
// //           label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
// //           originalItem: path
// //         }));
        
// //         setPathOptions(pathOptionsData);
        
// //         if (pathOptionsData.length > 0) {
// //           const firstPath = pathOptionsData[0];
// //           setFormData(prev => ({ ...prev, path: firstPath.value }));
          
// //           if (formData.template) {
// //             fetchTags(formData.template, instrumentId);
// //           }
// //         }
// //       } else {
// //         setPathOptions([]);
// //       }
// //     } catch (error) {
// //       setPathOptions([]);
// //     }
// //   }, [formData.template, fetchTags, t]);

// //   const loadInstruments = useCallback(async (clientId) => {
// //   try {
// //     let endpoint = endpoints.lockInstrumentCombo;
// //     let requestBody = {
// //       sClientID: clientId,
// //       sScheduleID: ""
// //     };
    
// //     if (getDeactiveScheduleDataRef.current) {
// //       const scheduleData = getDeactiveScheduleDataRef.current;
// //       const scheduleId = scheduleData.L13ScheduleID;
// //       const taskType = scheduleData.TaskType;
      
// //       if (taskType === "ScheduleCreation") {
// //         endpoint = endpoints.lockActiveParsingInstrumentCombo;
// //       } else {
// //         endpoint = endpoints.lockDeactiveParsingInstrumentCombo;
// //       }
// //       requestBody.sScheduleID = scheduleId;
// //     }
    
// //     const response = await makeAjaxCall(endpoint, requestBody);
    
// //     if (Array.isArray(response) && response.length > 0) {
// //       const instrumentOptionsData = response.map(instrument => ({
// //         value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
// //         label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
// //         originalItem: instrument
// //       }));
      
// //       setInstrumentOptions(instrumentOptionsData);
      
// //       // Auto-select and load first instrument
// //       if (instrumentOptionsData.length > 0) {
// //         const firstInstrument = instrumentOptionsData[0];
        
// //         setIsLoading(true);
        
// //         try {
// //           setFormData(prev => ({ 
// //             ...prev, 
// //             instrument: firstInstrument.value,
// //             path: '',
// //             fileName: '',
// //             limsOrder: '',
// //             limsOrderID: '',
// //             limsSampleID: '',
// //             limsTestCode: '',
// //             limsReplicateID: '',
// //             // DO NOT clear template when auto-selecting first instrument
// //             mergeFileCount: getSessionValue("MergeCount") || '1',
// //             currentFileCount: '0'
// //           }));
          
// //           setErrors(prev => ({ ...prev, instrument: false }));
          
// //           setTags([]);
// //           setTagErrors({});
// //           setPathOptions([]);
          
// //           const isInterface = isInterfaceInstrument(firstInstrument.value);
          
// //           await loadProtocol(firstInstrument.value);
          
// //           if (isInterface) {
// //             const interfaceInstId = firstInstrument.value.includes(':') ? 
// //               parseInt(firstInstrument.value.split(':')[1].trim()) : 0;
            
// //             if (interfaceInstId > 0) {
// //               await loadLimsOrder(interfaceInstId);
// //             }
// //           } else {
// //             setLimsOrderOptions([]);
// //             setIsLimsOrderEnabled(false);
// //           }
          
// //           const instrumentData = await onChangeInstrumentCombo(firstInstrument.value);
          
// //           if (instrumentData) {
// //             const updates = {};
            
// //             if (instrumentData.nCurMergeFileNo > 0) {
// //               updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
// //             } else {
// //               updates.currentFileCount = '0';
// //             }
            
// //             const lockedMergeCount = getSessionValue("LockedMergeCount");
// //             if (instrumentData.sTaskID && lockedMergeCount) {
// //               updates.mergeFileCount = lockedMergeCount;
// //             } else if (instrumentData.nMergeFileCount > 0) {
// //               updates.mergeFileCount = String(instrumentData.nMergeFileCount);
// //               setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
// //             } else {
// //               updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //             }
            
// //             // ONLY set template from backend if instrument is locked
// //             if (instrumentData.sTemplateID && instrumentData.sTaskID) {
// //               updates.template = instrumentData.sTemplateID;
// //             }
// //             else if (instrumentData.sLockType === 'A') {
// //               if (templateOptions.length > 0) {
// //                 const firstTemplateValue = templateOptions[0].value;
// //                 updates.template = firstTemplateValue;
// //               }
// //             }
// //             // DO NOT auto-select first template when instrument is not locked
            
// //             setFormData(prev => ({ ...prev, ...updates }));
            
// //           }
          
// //           await loadPaths(firstInstrument.value);
          
// //         } catch (error) {
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       }
// //     } else {
// //       setInstrumentOptions([]);
// //     }
// //   } catch (error) {
// //     setInstrumentOptions([]);
// //     setIsLoading(false);
// //   }
// // }, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
// //     isInterfaceInstrument, isLocked, templateOptions, t]);

// //   const loadClients = useCallback(async () => {
// //     try {
// //       const preselectedClientId = scheduleData?.L06ClientID;
// //       const taskStatus = scheduleData?.TaskType !== "ScheduleCreation" ? 'D' : 'A';
      
// //       const response = await makeAjaxCall(endpoints.clientLockCombo, {
// //         sTaskStatus: taskStatus,
// //         sClientID: preselectedClientId
// //       });
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const clientOptionsData = response.map(client => ({
// //           value: client.sClientID ? client.sClientID.trim() : '',
// //           label: client.sClientName || t('instrumentlocktag.unknownclient')
// //         }));
        
// //         setClientOptions(clientOptionsData);
        
// //         let clientToSelect = null;
        
// //         if (preselectedClientId) {
// //           clientToSelect = clientOptionsData.find(client => client.value === preselectedClientId);
// //         }
        
// //         if (!clientToSelect && clientOptionsData.length > 0) {
// //           clientToSelect = clientOptionsData[0];
// //         }
        
// //         if (clientToSelect) {
// //           setFormData(prev => ({ ...prev, client: clientToSelect.value }));
// //           await loadInstruments(clientToSelect.value);
// //         }
// //       } else {
// //         setClientOptions([]);
// //       }
// //     } catch (error) {
// //       setClientOptions([]);
// //     }
// //   }, [scheduleData, loadInstruments, t]);

// //   const loadTagOptions = useCallback(async (tagIndex) => {
// //     if (!formData.template || !tags[tagIndex]) return [];
    
// //     const tag = tags[tagIndex];
    
// //     let previousTagValueID = "";
// //     if (tagIndex > 0) {
// //       previousTagValueID = tags[tagIndex - 1].valueID || "          ";
// //     }
    
// //     try {
// //       const options = await loadTagValues(
// //         tag.tagID, 
// //         formData.template, 
// //         formData.instrument,
// //         tagIndex,
// //         previousTagValueID
// //       );
      
// //       return options || [];
// //     } catch (error) {
// //       return [];
// //     }
// //   }, [formData.template, formData.instrument, tags, loadTagValues, t]);

// //   const handleTagValueClick = useCallback((index, value, valueID) => {
// //     setTags(prev => {
// //       const updatedTags = prev.map((t, idx) => {
// //         if (idx === index) {
// //           return { ...t, value, valueID };
// //         }
        
// //         if (idx > index) {
// //           return { ...t, value: '', valueID: '', options: [] };
// //         }
        
// //         return t;
// //       });
      
// //       return updatedTags;
// //     });
    
// //     if (value) {
// //       setTagErrors(prev => ({ ...prev, [index]: false }));
// //     }
    
// //     if (index < tags.length - 1) {
// //       loadTagOptions(index + 1).then(options => {
// //         if (options.length > 0) {
// //           setTags(prev => prev.map((tag, idx) => 
// //             idx === index + 1 ? { ...tag, options } : tag
// //           ));
// //         }
// //       });
// //     }
// //   }, [tags, loadTagOptions]);

// //   const handleTagEditRequest = useCallback(async (tagIndex) => {
// //     if (tags[tagIndex] && tags[tagIndex].options && tags[tagIndex].options.length > 0) {
// //       return tags[tagIndex].options;
// //     }
    
// //     const options = await loadTagOptions(tagIndex);
    
// //     setTags(prev => prev.map((tag, idx) => 
// //       idx === tagIndex ? { ...tag, options } : tag
// //     ));
    
// //     return options;
// //   }, [tags, loadTagOptions]);

// //   const showFullPageLoader = isLoading || isSubmitting || isLoadingTags || isLoadingOptions;
  
// //   useEffect(() => {
// //   if (initialLoadDoneRef.current) return;
  
// //   const loadData = async () => {
// //     setIsLoading(true);
    
// //     try {
// //       await checkMergeAndAutoUnlockSettings();
// //       await loadUsers();
      
// //       const activeUserDetails = getActiveUserDetails();
// //       const templateResponse = await makeAjaxCall(endpoints.lockTemplateCombo, {
// //         ActiveUserDetails: activeUserDetails,
// //         ApplicationCode: "SDMS"
// //       });
      
// //       if (Array.isArray(templateResponse) && templateResponse.length > 0) {
// //         const templates = templateResponse
// //           .map(template => ({
// //             value: String(template.sTemplateID || '').trim(),
// //             label: String(template.sTemplateName || '').trim()
// //           }))
// //           .filter(template => template.value && template.label && template.value !== 'undefined');
        
// //         const order = ['QC', 'Calibration', 'Method Development', 'Project'];
// //         const sortedTemplates = templates.sort((a, b) => {
// //           const labelA = a.label || '';
// //           const labelB = b.label || '';
          
// //           const indexA = order.findIndex(pattern => labelA.includes(pattern));
// //           const indexB = order.findIndex(pattern => labelB.includes(pattern));
          
// //           if (indexA !== -1 && indexB !== -1) {
// //             return indexA - indexB;
// //           }
          
// //           if (indexA !== -1) return -1;
// //           if (indexB !== -1) return 1;
          
// //           return labelA.localeCompare(labelB);
// //         });
        
// //         setTemplateOptions(sortedTemplates);
        
// //         // REMOVED: Do NOT auto-select first template on initial load
// //         // if (!formData.instrument && sortedTemplates.length > 0) {
// //         //   const firstTemplateValue = sortedTemplates[0].value;
// //         //   setFormData(prev => ({ ...prev, template: firstTemplateValue }));
// //         // }
// //       }
      
// //       await loadClients();
// //       initialLoadDoneRef.current = true;
      
// //     } catch (error) {
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };
  
// //   loadData();
// // }, []);

// // useEffect(() => {
// //   if (formData.template && formData.template.trim() !== '' && formData.instrument) {
// //     fetchTags(formData.template, formData.instrument);
// //   } else {
// //     setTags([]);
// //   }
// // }, [formData.template, formData.instrument, fetchTags]);

// //   const handleClientChange = useCallback(async (value) => {
// //     setFormData(prev => ({ ...prev, client: value, instrument: '', path: '', fileName: '', limsOrder: '' }));
// //     setErrors(prev => ({ ...prev, client: false }));
    
// //     setInstrumentOptions([]);
// //     setPathOptions([]);
// //     setLimsOrderOptions([]);
// //     setTags([]);
// //     setTagErrors({});
    
// //     if (value) {
// //       setIsLoading(true);
// //       try {
// //         await loadInstruments(value);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     }
// //   }, [loadInstruments]);

// //   const handleInstrumentChange = useCallback(async (value) => {
// //   setIsLoading(true);
  
// //   setFormData(prev => ({ 
// //     ...prev, 
// //     instrument: value, 
// //     path: '', 
// //     fileName: '', 
// //     limsOrder: '',
// //     limsOrderID: '',
// //     limsSampleID: '',
// //     limsTestCode: '',
// //     limsReplicateID: '',
// //     mergeFileCount: getSessionValue("MergeCount") || '1',
// //     currentFileCount: '0'
// //     // DO NOT clear template here - keep current template
// //   }));
// //   setErrors(prev => ({ ...prev, instrument: false }));
  
// //   setPathOptions([]);
  
// //   // Clear tags when instrument changes (they depend on instrument)
// //   setTags([]);
// //   setTagErrors({});
  
// //   if (value) {
// //     try {
// //       const isInterface = isInterfaceInstrument(value);
      
// //       await loadProtocol(value);
      
// //       if (isInterface) {
// //         const interfaceInstId = value.includes(':') ? 
// //           parseInt(value.split(':')[1].trim()) : 0;
        
// //         if (interfaceInstId > 0) {
// //           await loadLimsOrder(interfaceInstId);
// //         }
// //       } else {
// //         setLimsOrderOptions([]);
// //         setIsLimsOrderEnabled(false);
// //         setFormData(prev => ({ 
// //           ...prev, 
// //           limsOrder: '',
// //           limsOrderID: '',
// //           limsSampleID: '',
// //           limsTestCode: '',
// //           limsReplicateID: ''
// //         }));
// //       }
      
// //       const instrumentData = await onChangeInstrumentCombo(value);
      
// //       if (instrumentData) {
// //         const updates = {};
        
// //         if (instrumentData.nCurMergeFileNo > 0) {
// //           updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
// //         } else {
// //           updates.currentFileCount = '0';
// //         }
        
// //         const lockedMergeCount = getSessionValue("LockedMergeCount");
// //         if (isLocked && lockedMergeCount) {
// //           updates.mergeFileCount = lockedMergeCount;
// //         } else {
// //           updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //         }
        
// //         // ONLY set template from backend if instrument is locked
// //         if (instrumentData.sTemplateID && instrumentData.sTaskID) {
// //           // Instrument is locked by user, use its template
// //           updates.template = instrumentData.sTemplateID;
// //         }
// //         else if (instrumentData.sLockType === 'A') {
// //           // Auto-locked instrument - use first template
// //           if (templateOptions.length > 0) {
// //             const firstTemplateValue = templateOptions[0].value;
// //             updates.template = firstTemplateValue;
// //           }
// //         }
// //         // DO NOT auto-select first template when instrument is not locked
// //         // Keep whatever template was previously selected (if any)
        
// //         setFormData(prev => ({ ...prev, ...updates }));
        
// //       }
      
// //       await loadPaths(value);
      
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   } else {
// //     setIsLoading(false);
// //   }
// // }, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
// //     isInterfaceInstrument, isLocked, templateOptions, t]);

// //   useEffect(() => {
// //     if (formData.instrument) {
// //       const refreshData = async () => {
// //         try {
// //           setIsLoading(true);
// //           const response = await onChangeInstrumentCombo(formData.instrument);
// //           if (response) {
// //             setFormData(prev => ({
// //               ...prev,
// //               currentFileCount: response.nCurMergeFileNo > 0 ? String(response.nCurMergeFileNo) : '0',
// //               mergeFileCount: response.nMergeFileCount > 0 ? String(response.nMergeFileCount) : getSessionValue("MergeCount") || '1'
// //             }));
// //           }
// //         } catch (error) {
// //           // Silent error handling
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       };
      
// //       refreshData();
// //     }
// //   }, [isLocked, formData.instrument]);

// //   const handlePathChange = useCallback((value) => {
// //     setFormData(prev => ({ ...prev, path: value }));
// //     setErrors(prev => ({ ...prev, path: false }));
// //   }, []);

// // const handleTemplateChange = useCallback((value) => {
// //   // Simply set the template value - don't auto-select first template
// //   setFormData(prev => ({ ...prev, template: value }));
// //   setErrors(prev => ({ ...prev, template: false }));
  
// //   // Clear tags and errors
// //   setTags([]);
// //   setTagErrors({});
// // }, []); // Remove templateOptions dependency

// //   const handleMergeCountChange = useCallback((value) => {
// //     const numValue = parseInt(value) || 0;
    
// //     if (numValue > 10000) {
// //       setFormData(prev => ({ ...prev, mergeFileCount: '10000' }));
// //       setErrors(prev => ({ ...prev, mergeFileCount: t('instrumentlocktag.mergecountexceed') }));
// //       return;
// //     }
    
// //     if (numValue < 1 && value !== '') {
// //       setFormData(prev => ({ ...prev, mergeFileCount: '1' }));
// //     } else {
// //       setFormData(prev => ({ ...prev, mergeFileCount: value }));
// //       setErrors(prev => ({ ...prev, mergeFileCount: '' }));
// //     }
// //   }, [t]);

// //   const validateFormForLock = useCallback(() => {
// //   const newErrors = {};
// //   const newTagErrors = {};
// //   let isValid = true;
  
// //   if (!formData.instrument) {
// //     newErrors.instrument = true;
// //     isValid = false;
// //   }
  
// //   if (!formData.path) {
// //     newErrors.path = true;
// //     isValid = false;
// //   }
  
// //   if (!formData.template || formData.template.trim() === '') {
// //     newErrors.template = true;
// //     isValid = false;
// //   }
  
// //   const isInterface = isInterfaceInstrument(formData.instrument);
  
// //   if (isInterface) {
// //     if (isFileNameEnabled && !formData.fileName) {
// //       newErrors.fileName = true;
// //       isValid = false;
// //     }
    
// //     const mergeNum = parseInt(formData.mergeFileCount) || 0;
// //     const currentNum = parseInt(formData.currentFileCount) || 0;
    
// //     if (mergeNum > 10000) {
// //       newErrors.mergeFileCount = t('instrumentlocktag.mergecountexceed');
// //       isValid = false;
// //     }
    
// //     if (mergeNum < currentNum) {
// //       newErrors.mergeFileCount = t('instrumentlocktag.mergecountnotlessthancurrent', 
// //         { count: formData.currentFileCount });
// //       isValid = false;
// //     }
    
// //     if (isLimsOrderEnabled && !formData.limsOrder) {
// //       newErrors.limsOrder = true;
// //       isValid = false;
// //     }
// //   }
  
// //   for (let i = 0; i < tags.length; i++) {
// //     if (tags[i].required && !tags[i].value) {
// //       newTagErrors[i] = true;
// //       isValid = false;
// //     }
// //   }
  
// //   setErrors(newErrors);
// //   setTagErrors(newTagErrors);
  
// //   return isValid;
// // }, [formData, tags, isFileNameEnabled, isLimsOrderEnabled, isInterfaceInstrument, t]);

// //   const prepareLockData = useCallback((auditData = null, validationType = "CheckAndInsert") => {
// //     const activeUserDetails = getActiveUserDetails();
// //     const isInterface = isInterfaceInstrument(formData.instrument);
    
// //     const instrumentId = (formData.instrument || "").padEnd(10, ' ');
// //     const templateId = (formData.template || '').padEnd(10, ' ');
// //     const userId = (formData.user || activeUserDetails.sUserID || '').padEnd(10, ' ');
    
// //     const lockData = {
// //       sInstrumentName: instrumentOptions.find(i => i.value === formData.instrument)?.label || '',
// //       lockinstdetails: {
// //         sInstrumentID: instrumentId,
// //         sTaskID: formData.path,
// //         sTaskSourcePath: pathOptions.find(p => p.value === formData.path)?.label || '',
// //         sFileName: formData.fileName,
// //         sTemplateID: templateId,
// //         sUserID: userId,
// //         nMergeFileCount: parseInt(formData.mergeFileCount) || 1,
// //         nAutoUnlock: formData.unlockAfterCapture ? 1 : 0,
// //         nInterFaceOrderID: parseInt(formData.interfaceOrderID) || 0,
// //         nProtocolStatus: parseInt(formData.protocolID) || 0,
// //         nLLProStatus: isFileNameEnabled ? 1 : 0,
// //         sScheduleID: pathOptions.find(p => p.value === formData.path)?.originalItem?.L13ScheduleID || ''
// //       },
// //       sTemplateName: templateOptions.find(t => t.value === formData.template)?.label || '',
// //       lInstTagValue: tags.map(tag => ({
// //         L58TagID: tag.tagID,
// //         Value: tag.value || '',
// //         L58ValueStatus: tag.required || false,
// //         L58TagName: tag.tagName,
// //         ValueID: tag.valueID || '',
// //         LoadMasterValue: " ",
// //         L58Order: tag.order || 0
// //       })),
// //       sValidation: validationType,
// //       sSendLabel: isLocked ? t('button.update') : t('button.lock'),
// //       ManualOrder: false,
// //       LIMSobj: null,
// //       ActiveUserDetails: activeUserDetails,
// //       ApplicationCode: "SDMS"
// //     };
    
// //     if (auditData) {
// //       lockData.lockinstdetails.AuditTrailValues = auditData;
// //     }
    
// //     if (isInterface) {
// //       lockData.lockinstdetails.audittrailforinterfaceinstrument = true;
// //     }
    
// //     if (isLimsOrderEnabled && formData.limsOrder) {
// //       const limsOrderItem = limsOrderOptions.find(lo => lo.value === formData.limsOrder);
// //       if (limsOrderItem) {
// //         lockData.ManualOrder = false;
// //         const returnObject = {};
// //         Object.keys(limsOrderItem).forEach(key => {
// //           if (!['uid', 'boundindex', 'uniqueid', 'visibleindex'].includes(key)) {
// //             returnObject[key] = limsOrderItem[key];
// //           }
// //         });
// //         lockData.LIMSobj = returnObject;
// //       }
// //     }
    
// //     const encodeXmlText = (text) => {
// //       if (!text) return '';
// //       return String(text)
// //         .replace(/&/g, '&amp;')
// //         .replace(/</g, '&lt;')
// //         .replace(/>/g, '&gt;')
// //         .replace(/"/g, '&quot;')
// //         .replace(/'/g, '&apos;');
// //     };
    
// //     const templateName = lockData.sTemplateName;
// //     const encodedTemplateName = encodeXmlText(templateName);
    
// //     let xMasterXml = "<Sheet1>";
// //     let xDetailsXml = "<Sheet1>";
    
// //     xMasterXml += "<Row>";
// //     xMasterXml += `<Template>${encodedTemplateName}</Template>`;
    
// //     xDetailsXml += `<Row><Category>Template</Category><Value>${encodedTemplateName}</Value></Row>`;
    
// //     tags.forEach(tag => {
// //       if (tag.value) {
// //         const encodedTagName = encodeXmlText(tag.tagName);
// //         const encodedTagValue = encodeXmlText(tag.value);
        
// //         xMasterXml += `<${encodedTagName}>${encodedTagValue}</${encodedTagName}>`;
// //         xDetailsXml += `<Row><Category>${encodedTagName}</Category><Value>${encodedTagValue}</Value></Row>`;
// //       }
// //     });
    
// //     xMasterXml += "</Row></Sheet1>";
// //     xDetailsXml += "</Sheet1>";
    
// //     lockData.lockinstdetails.xMasterXml = xMasterXml;
// //     lockData.lockinstdetails.xDetailsXml = xDetailsXml;
    
// //     return lockData;
// //   }, [formData, tags, instrumentOptions, pathOptions, templateOptions, 
// //       isFileNameEnabled, isLimsOrderEnabled, isLocked, limsOrderOptions, isInterfaceInstrument, t]);

// //   const performLockAction = useCallback(async (auditData = null, validationType = "CheckAndInsert") => {
// //     try {
// //       const lockData = prepareLockData(auditData, validationType);
      
// //       const isInterface = isInterfaceInstrument(formData.instrument);
// //       if (isInterface && auditData) {
// //         lockData.lockinstdetails.audittrailforinterfaceinstrument = false;
// //       }
      
// //       await performLockActionWithData(lockData);
// //     } catch (error) {
// //       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [formData, tags, prepareLockData, t]);

// //   const performLockActionWithData = async (lockData) => {
// //     try {
// //       setIsSubmitting(true);
// //       const result = await makeAjaxCall(endpoints.lockInstrument, lockData, "LockInstrument");
      
// //       if (result?.oResObj?.bStatus === true) {
// //         const successMessage = result.oResObj.sInformation || t('instrumentlocktag.instrumentlockedsuccessfully');
        
// //         setIsLocked(true);
// //         setIsAutoLocked(false);
// //         setLockedByOtherUser(false);
        
// //         if (result.oResObj.nMergeFileCount) {
// //           setFormData(prev => ({ 
// //             ...prev, 
// //             mergeFileCount: String(result.oResObj.nMergeFileCount) 
// //           }));
// //           setSessionValue("LockedMergeCount", String(result.oResObj.nMergeFileCount));
// //         } else if (result.oResObj.mergeFileCount) {
// //           setFormData(prev => ({ 
// //             ...prev, 
// //             mergeFileCount: String(result.oResObj.mergeFileCount) 
// //           }));
// //           setSessionValue("LockedMergeCount", String(result.oResObj.mergeFileCount));
// //         }
        
// //         const instrumentId = result.oResObj.sInstrumentID || formData.instrument;
        
// //         if (instrumentId) {
// //           const cleanInstrumentId = instrumentId.toString().trim();
// //           navigateAfterLock(cleanInstrumentId);
// //         }
        
// //         showErrorDialogMessage(
// //           `${result.oResObj.sInstrument || t('label.instrument')} ${successMessage}`,
// //           'success'
// //         );
        
// //       } else {
// //         const errorInfo = result?.oResObj?.sInformation;
        
// //         if (errorInfo === "Entering Duplicate Tag Values" || 
// //             (errorInfo === "Tags has already been used. Do you want to re-use same tags for New Data Capture?" && 
// //              result?.oResObj?.sValidation === "CheckAndInsert")) {
// //           showErrorDialogMessage(
// //             t('instrumentlocktag.confirmationtagsalreadyexist'),
// //             'confirmation',
// //             async () => {
// //               lockData.sValidation = "Insert";
// //               lockData.lockinstdetails.sValidation = "Insert";
// //               await performLockActionWithData(lockData);
// //             }
// //           );
// //           return;
// //         }
        
// //         if (errorInfo === "Merge Break") {
// //           showErrorDialogMessage(t('instrumentlocktag.mergebreak'), 'error');
// //         } else if (errorInfo === "This instrument is already locked by other user") {
// //           showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadylockedbyotheruser'), 'error');
// //           setIsLocked(true);
// //           setLockedByOtherUser(true);
// //         } else if (errorInfo === "Merge Count should not be Lesser than Current Parsing Count") {
// //           showErrorDialogMessage(t('instrumentlocktag.mergecountshouldnotbelesserthancurrentparsingcount'), 'error');
// //         } else if (errorInfo) {
// //           showErrorDialogMessage(errorInfo, 'error');
// //         } else {
// //           showErrorDialogMessage(t('instrumentlocktag.failedtolockinstrument'), 'error');
// //         }
// //       }
// //     } catch (error) {
// //       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// // const handleUnlockSuccess = useCallback(async (result) => {
// //   const successMessage = result?.oResObj?.sInformation || t('instrumentlocktag.instrumentunlockedsuccessfully');
// //   const instrumentName = result?.oResObj?.sInstrument || t('label.instrument');
  
// //   setIsLocked(false);
// //   setIsAutoLocked(false);
// //   setLockedByOtherUser(false);
  
// //   const currentTemplate = formData.template;
  
// //   setFormData(prev => ({
// //     ...prev,
// //     fileName: '',
// //     mergeFileCount: getSessionValue("MergeCount") || '1',
// //     currentFileCount: '0',
// //     lockID: '',
// //     interfaceOrderID: '',
// //     unlockAfterCapture: false,
// //     limsOrder: '',
// //     limsOrderID: '',
// //     limsSampleID: '',
// //     limsTestCode: '',
// //     limsReplicateID: '',
// //     template: currentTemplate
// //   }));
  
// //   setErrors({});
// //   setTagErrors({});
  
// //   setTags(prev => prev.map(tag => ({
// //     ...tag,
// //     value: '',
// //     valueID: '',
// //     options: tag.tagID === 1 ? tag.options : []
// //   })));
  
// //   showErrorDialogMessage(
// //     `${instrumentName} ${successMessage}`,
// //     'success'
// //   );
// // }, [t, formData.template]);

// //   const prepareUnlockData = useCallback((auditData = null, mergebreak = "true") => {
// //     const activeUserDetails = getActiveUserDetails();
// //     const pathItem = pathOptions.find(p => p.value === formData.path);
// //     const instrumentItem = instrumentOptions.find(i => i.value === formData.instrument);
// //     const templateItem = templateOptions.find(t => t.value === formData.template);
    
// //     const limsObj = {};
    
// //     const limsOrderVal = formData.limsOrder;
// //     const nOrderID = limsOrderVal === "" ? 0 : parseInt(limsOrderVal) || 0;
// //     limsObj["nOrderID"] = nOrderID;
    
// //     if (isInterfaceInstrument(formData.instrument)) {
// //       if (formData.limsSampleID) limsObj["SampleID"] = formData.limsSampleID;
// //       if (formData.limsTestCode) limsObj["TestCode"] = formData.limsTestCode;
// //       if (formData.limsReplicateID) limsObj["ReplicateID"] = formData.limsReplicateID;
// //     }
    
// //     const unlockObjDet = {
// //       nMergeFileCount: formData.mergeFileCount || "1",
// //       sTaskID: formData.path || "",
// //       nProtocolStatus: parseInt(formData.protocolID) || 0,
// //       sFileName: formData.fileName || "",
// //       sUserID: formData.user || activeUserDetails.sUserID,
// //       nInterFaceOrderID: formData.interfaceOrderID || "",
// //       sTaskSourcePath: pathItem?.label || "",
// //       sInstrumentID: (formData.instrument || "").padEnd(10, ' '),
// //       sScheduleID: pathItem?.originalItem?.L13ScheduleID || "",
// //       sTemplateID: formData.template || ""
// //     };
    
// //     const unlockData = {
// //       sTemplateName: templateItem?.label || "",
// //       unlockObjDet: unlockObjDet,
// //       sInstrumentName: instrumentItem?.label || "",
// //       limsObj: limsObj,
// //       mergebreak: mergebreak,
// //       ActiveUserDetails: activeUserDetails,
// //       ApplicationCode: "SDMS"
// //     };
    
// //     if (auditData) {
// //       unlockData.AuditTrailValues = auditData;
// //     }
    
// //     return unlockData;
// //   }, [formData, instrumentOptions, pathOptions, templateOptions, isInterfaceInstrument]);

// //   const performUnlockAction = useCallback(async (auditData = null, mergebreak = "true") => {
// //     try {
// //       if (!formData.instrument || !formData.path) {
// //         showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
// //         return;
// //       }
      
// //       setIsSubmitting(true);
// //       const unlockData = prepareUnlockData(auditData, mergebreak);
      
// //       const result = await makeAjaxCall(endpoints.unLockInstrument, unlockData, "UnLockInstrument");
      
// //       if (result?.AuditTrailLogin !== undefined && result.AuditTrailLogin === false) {
// //         showErrorDialogMessage(result.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'), 'error');
// //         return;
// //       }
      
// //       if (result?.oResObj?.bForceUnlock === true) {
// //         if (mergebreak === "true") {
// //           setAuditAction('unlock');
// //           setAuditCallback(() => async (forceAuditData) => {
// //             await performUnlockAction(forceAuditData, "false");
// //           });
// //           setShowAuditTrail(true);
// //         } else {
// //           await handleUnlockSuccess(result);
// //         }
// //       } 
// //       else if (result?.oResObj?.bStatus === true) {
// //         await handleUnlockSuccess(result);
// //       } 
// //       else {
// //         showErrorDialogMessage(result?.oResObj?.sInformation || t('instrumentlocktag.failedtounlockinstrument'), 'error');
// //       }
      
// //     } catch (error) {
// //       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [formData, prepareUnlockData, t, handleUnlockSuccess]);

// //   const checkInterfaceConnection = useCallback(async (instrumentId) => {
// //     const isInterface = isInterfaceInstrument(instrumentId);
    
// //     if (!isInterface) {
// //       return { needsCheck: false, isConnected: true };
// //     }
    
// //     const interfaceInstId = instrumentId.includes(':') ? 
// //       parseInt(instrumentId.split(':')[1].trim()) : 0;
    
// //     if (interfaceInstId <= 0) {
// //       return { needsCheck: false, isConnected: true };
// //     }
    
// //     try {
// //       setIsLoading(true);
// //       const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
// //         InterfaceInstID: interfaceInstId
// //       }, "InterfaceConnectionChecking");
      
// //       if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
// //         const accessStatus = connectionResult[0].AccessStatus;
// //         return { 
// //           needsCheck: true, 
// //           isConnected: accessStatus === 1,
// //           data: connectionResult[0]
// //         };
// //       }
// //     } catch (error) {
// //       // Silent error handling
// //     } finally {
// //       setIsLoading(false);
// //     }
    
// //     return { needsCheck: false, isConnected: true };
// //   }, [isInterfaceInstrument, t]);

// //   const handleUnlock = useCallback(async () => {
// //     if (!isLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
// //       return;
// //     }

// //     if (isAutoLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //       return;
// //     }

// //     const validateCurrentLockStatus = async () => {
// //       try {
// //         if (!formData.instrument) return;
        
// //         setIsLoading(true);
// //         const response = await onChangeInstrumentCombo(formData.instrument);
        
// //         if (response) {
// //           if (response.sLockType === 'A') {
// //             setIsAutoLocked(true);
// //             setIsLocked(true);
// //             setLockedByOtherUser(false);
// //             showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //             return false;
// //           } else if (response.sUserID) {
// //             setIsLocked(true);
// //             setIsAutoLocked(false);
            
// //             const activeUserDetails = getActiveUserDetails();
// //             const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
            
// //             if (response.sUserID.trim() === currentUserId) {
// //               setLockedByOtherUser(false);
// //               return true;
// //             } else {
// //               setLockedByOtherUser(true);
// //               showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
// //               return false;
// //             }
// //           } else {
// //             setIsLocked(false);
// //             setIsAutoLocked(false);
// //             setLockedByOtherUser(false);
// //             showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
// //             return false;
// //           }
// //         }
// //         return false;
// //       } catch (error) {
// //         return false;
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     const newErrors = {};
// //     let isValid = true;
    
// //     if (!formData.instrument) {
// //       newErrors.instrument = true;
// //       isValid = false;
// //     }
    
// //     if (!formData.path) {
// //       newErrors.path = true;
// //       isValid = false;
// //     }
    
// //     setErrors(newErrors);
    
// //     if (!isValid) {
// //       showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
// //       return;
// //     }

// //     const canProceedWithUnlock = await validateCurrentLockStatus();
// //     if (!canProceedWithUnlock) {
// //       return;
// //     }

// //     if (lockedByOtherUser) {
// //       const activeUserDetails = getActiveUserDetails();
// //       const isAdmin = activeUserDetails.sUsername === "Administrator" || 
// //                      activeUserDetails.ActiveUserDetails?.sUsername === "Administrator";
      
// //       if (!isAdmin) {
// //         showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
// //         return;
// //       }
// //     }

// //     const scheduleData = getDeactiveScheduleDataRef.current;
// //     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
// //       const hasAuditTrailRights = true;
      
// //       if (hasAuditTrailRights) {
// //         setAuditAction('unlock');
// //         setAuditCallback(() => async (auditData) => {
// //           await performUnlockAction(auditData);
// //         });
// //         setShowAuditTrail(true);
// //         return;
// //       }
// //     }
    
// //     await performUnlockAction();
// //   }, [isLocked, isAutoLocked, lockedByOtherUser, formData.instrument, formData.path, performUnlockAction, onChangeInstrumentCombo, t]);

// //   const handleLock = useCallback(async () => {
// //     if (!validateFormForLock()) {
// //       return;
// //     }
    
// //     if (isAutoLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //       return;
// //     }
    
// //     setIsSubmitting(true);
    
// //     const isInterface = isInterfaceInstrument(formData.instrument);
    
// //     if (isInterface) {
// //       const interfaceInstId = formData.instrument.includes(':') ? 
// //         parseInt(formData.instrument.split(':')[1].trim()) : 0;
      
// //       if (interfaceInstId > 0) {
// //         try {
// //           setIsLoading(true);
// //           const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
// //             InterfaceInstID: interfaceInstId
// //           }, "InterfaceConnectionChecking");
          
// //           if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
// //             const connectionData = connectionResult[0];
            
// //             if (connectionData.AuditTrailLogin === false) {
// //               showErrorDialogMessage(
// //                 connectionData.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'),
// //                 'error'
// //               );
// //               setIsSubmitting(false);
// //               setIsLoading(false);
// //               return;
// //             }
            
// //             const accessStatus = connectionData.AccessStatus;
            
// //             if (accessStatus == 1 || accessStatus === "1") {
// //               // Interface is connected - continue with normal flow
// //             } else {
// //               setIsSubmitting(false);
// //               setIsLoading(false);
// //               showErrorDialogMessage(
// //                 t('instrumentlocktag.interfacerinstrumentisnotconnected'),
// //                 'confirmation',
// //                 async () => {
// //                   setIsSubmitting(true);
// //                   const scheduleData = getDeactiveScheduleDataRef.current;
// //                   if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
// //                     const hasAuditTrailRights = true;
                    
// //                     if (hasAuditTrailRights) {
// //                       setIsSubmitting(false);
// //                       setAuditAction('lock');
// //                       setAuditCallback(() => async (auditData) => {
// //                         await performLockAction(auditData);
// //                       });
// //                       setShowAuditTrail(true);
// //                       return;
// //                     }
// //                   }
                  
// //                   await performLockAction();
// //                 }
// //               );
// //               return;
// //             }
// //           }
// //         } catch (error) {
// //           // Continue with lock even if check fails
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       }
// //     }
    
// //     const scheduleData = getDeactiveScheduleDataRef.current;
// //     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
// //       const hasAuditTrailRights = true;
      
// //       if (hasAuditTrailRights) {
// //         setIsSubmitting(false);
// //         setAuditAction('lock');
// //         setAuditCallback(() => async (auditData) => {
// //           await performLockAction(auditData);
// //         });
// //         setShowAuditTrail(true);
// //         return;
// //       }
// //     }
    
// //     await performLockAction();
// //   }, [validateFormForLock, isAutoLocked, formData.instrument, performLockAction, isInterfaceInstrument, t]);

// //   const handleUpdate = useCallback(async () => {
// //     if (!validateFormForLock()) {
// //       return;
// //     }
    
// //     if (isAutoLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //       return;
// //     }
    
// //     setIsSubmitting(true);
// //     await performLockAction();
// //   }, [validateFormForLock, isAutoLocked, performLockAction]);

// //   const handleFormChange = useCallback((field, value) => {
// //     setFormData(prev => ({ ...prev, [field]: value }));
// //     setErrors(prev => ({ ...prev, [field]: false }));
// //   }, []);

// //   const getFieldDisabledState = useMemo(() => {
// //     if (isAutoLocked) {
// //       return {
// //         client: false,
// //         instrument: false,
// //         path: false,
// //         limsOrder: true,
// //         fileName: true,
// //         template: false,
// //         mergeCount: true,
// //         unlockCheckbox: true,
// //         tags: false,
// //         lockButton: true,
// //         unlockButton: true
// //       };
// //     }
    
// //     if (isLocked && !lockedByOtherUser) {
// //       return {
// //         client: false,
// //         instrument: false,
// //         path: true,
// //         limsOrder: false,
// //         fileName: false,
// //         template: true,
// //         mergeCount: false,
// //         unlockCheckbox: false,
// //         tags: false,
// //         lockButton: false,
// //         unlockButton: false
// //       };
// //     }
    
// //     if (isLocked && lockedByOtherUser) {
// //       return {
// //         client: false,
// //         instrument: false,
// //         path: true,
// //         limsOrder: false,
// //         fileName: true,
// //         template: true,
// //         mergeCount: true,
// //         unlockCheckbox: true,
// //         tags: true,
// //         lockButton: true,
// //         unlockButton: false
// //       };
// //     }
    
// //     return {
// //       client: false,
// //       instrument: false,
// //       path: false,
// //       limsOrder: false,
// //       fileName: false,
// //       template: false,
// //       mergeCount: false,
// //       unlockCheckbox: false,
// //       tags: false,
// //       lockButton: false,
// //       unlockButton: true
// //     };
// //   }, [isLocked, lockedByOtherUser, isAutoLocked]);

// //   return (
// //     <div >
// //       <FullPageLoader loading={showFullPageLoader} text={
// //         isSubmitting ? t('common.loading') :
// //         t('common.loading')
// //       } />
      
// //       <div className="bg-white px-4 py-4">
// //         <div className="max-w-[1100px]">
// //           <div className="grid grid-cols-2">
// //             <div className="max-w-[400px]">
// //               <div className="mb-7">
// //                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                   {t('label.client')}
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.client}
// //                     onChange={(e) => handleClientChange(e.target.value)}
// //                     disabled={getFieldDisabledState.client || isLoading}
// //                     options={clientOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     showError={errors.client}
// //                     className="text-xs"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mb-5">
// //                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                   {t('label.instrument')} <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.instrument}
// //                     onChange={(e) => handleInstrumentChange(e.target.value)}
// //                     disabled={getFieldDisabledState.instrument || isLoading}
// //                     options={instrumentOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     showError={errors.instrument}
// //                     className="text-xs"
// //                   />
// //                 </div>
// //                 {isAutoLocked && (
// //                   <div className="mt-0 text-sm bg-[#d9534f] font-roboto text-white">
// //                     {t('instrumentlocktag.thisinstrumentisalreadyautolocked')}
// //                   </div>
// //                 )}
// //               </div>

// //               <div className="mb-7">
// //                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                   {t('instrumentlocktag.path')} <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.path}
// //                     onChange={(e) => handlePathChange(e.target.value)}
// //                     disabled={getFieldDisabledState.path || isLoading}
// //                     options={pathOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     showError={errors.path}
// //                     className="text-xs"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mb-7">
// //                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
// //                   {t('instrumentlocktag.limsorder')}
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.limsOrder}
// //                     onChange={(e) => {
// //                       const selectedValue = e.target.value;
// //                       const selectedOrder = limsOrderOptions.find(order => order.value === selectedValue);
                      
// //                       setFormData(prev => ({
// //                         ...prev,
// //                         limsOrder: selectedValue,
// //                         limsOrderID: selectedValue,
// //                         limsSampleID: selectedOrder?.sampleID || '',
// //                         limsTestCode: selectedOrder?.testCode || '',
// //                         limsReplicateID: selectedOrder?.replicateID || ''
// //                       }));
// //                     }}
// //                     disabled={!isLimsOrderEnabled || getFieldDisabledState.limsOrder || isLoading}
// //                     options={limsOrderOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     className="text-xs flex-1"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mb-7">
// //                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
// //                   {t('instrumentlocktag.filename')} {isFileNameEnabled && <span className="text-red-500">*</span>}
// //                 </label>
// //                 <input
// //                   type="text"
// //                   value={formData.fileName}
// //                   onChange={(e) => handleFormChange('fileName', e.target.value)}
// //                   disabled={!isFileNameEnabled || getFieldDisabledState.fileName || isLoading}
// //                   className={`w-full h-7 px-0 text-xs bg-[#f3f3f3] border-0 border-b-2 outline-none font-semibold font-['verdana']
// //                     ${errors.fileName ? 'border-red-400 text-[#A94442]' : 'border-gray-300 text-[#373737]'}`}
// //                 />
// //               </div>

// //               {showMergeFields && (
// //                 <MergeFileCountRow
// //                   mergeCount={formData.mergeFileCount}
// //                   currentCount={formData.currentFileCount}
// //                   onMergeChange={handleMergeCountChange}
// //                   disabled={!isInstrumentInterface || getFieldDisabledState.mergeCount || isLoading}
// //                   showMergeFields={showMergeFields}
// //                   t={t}
// //                 />
// //               )}

// //               {showUnlockOption && (
// //                 <div className="flex items-center mb-3 gap-4">
// //                   <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
// //                     {t('instrumentlocktag.unlockaftercapture')}
// //                   </label>
// //                   <input
// //                     type="checkbox"
// //                     checked={formData.unlockAfterCapture}
// //                     onChange={(e) => handleFormChange('unlockAfterCapture', e.target.checked)}
// //                     disabled={getFieldDisabledState.unlockCheckbox || isLoading}
// //                     className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
// //                   />
// //                 </div>
// //               )}
// //             </div>

// //             <div className='max-w-[1300px]'>
// //               <div className="max-w-[350px]">
// //                 <div className="mb-7">
// //                   <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                     {t('instrumentlocktag.template')} <span className="text-red-500">*</span>
// //                   </label>
// //                   <div className="relative">
// //                     <AnimatedDropdown
// //                       value={formData.template}
// //                       onChange={(e) => handleTemplateChange(e.target.value)}
// //                       disabled={getFieldDisabledState.template || isLoading}
// //                       options={templateOptions}
// //                       displayKey="label"
// //                       valueKey="value"
// //                       allowFreeInput
// //                       showError={errors.template}
// //                       className="text-xs"
// //                     />
// //                   </div>
// //                 </div>
// //               </div>
              
// //               <div className="mt-7 max-w-[1300px]">
// //                 <div className="max-w-[550px]">
// //                   <TagGrid
// //                     tags={tags}
// //                     onTagValueClick={handleTagValueClick}
// //                     onTagEditRequest={handleTagEditRequest}
// //                     onInlineEditSubmit={handleInlineEditSubmit}
// //                     isLoadingTags={isLoadingTags}
// //                     isLocked={isLocked}
// //                     lockedByOtherUser={lockedByOtherUser}
// //                     isAutoLocked={isAutoLocked}
// //                     t={t}
// //                     tagErrors={tagErrors}
// //                   />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
      
// //       <div className="flex justify-end gap-2 ml-4 mr-4 mt-3 pt-5 border-t border-gray-200">
// //   <button
// //     onClick={isLocked && !lockedByOtherUser && !isAutoLocked ? handleUpdate : handleLock}
// //     disabled={getFieldDisabledState.lockButton || showFullPageLoader}
// //     className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
// //       ${getFieldDisabledState.lockButton || showFullPageLoader
// //         ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
// //         : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
// //     `}
// //   >
// //     {isLocked && !lockedByOtherUser && !isAutoLocked ? <UpdateIcon /> : <LockIcon />}
// //     <span>
// //       {isLocked && !lockedByOtherUser && !isAutoLocked ? t('button.update') : t('button.lock')}
// //     </span>
// //   </button>

// //   <button
// //     onClick={handleUnlock}
// //     disabled={getFieldDisabledState.unlockButton || showFullPageLoader}
// //     className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
// //       ${getFieldDisabledState.unlockButton || showFullPageLoader
// //         ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
// //         : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
// //     `}
// //   >
// //     <UnlockIcon />
// //     <span>{t('button.unlock')}</span>
// //   </button>
// // </div>

// //       <AuditTrail
// //         isOpen={showAuditTrail}
// //         onClose={() => setShowAuditTrail(false)}
// //         onAuthorized={(auditData) => {
// //           setShowAuditTrail(false);
// //           if (auditCallback) {
// //             auditCallback(auditData);
// //           }
// //           setAuditAction(null);
// //           setAuditCallback(null);
// //         }}
// //         actionLabel={auditAction === 'lock' ? t('button.lock') : 
// //                     auditAction === 'unlock' ? t('button.unlock') : 
// //                     t('button.update')}
// //         defaultReason={auditAction === 'lock' ? t('instrumentlocktag.instrumentlocked') : 
// //                       auditAction === 'unlock' ? t('instrumentlocktag.instrumentunlocked') : 
// //                       t('instrumentlocktag.instrumentupdated')}
// //         disableReason={false}
// //       />

// //       {showErrorDialog && (
// //         <Errordialog
// //           message={errorDialogMessage}
// //           type={errorDialogType}
// //           onClose={handleErrorDialogClose}
// //           showCancel={errorDialogType === 'confirmation'}
// //           onCancel={handleErrorDialogClose}
// //           onConfirm={errorDialogType === 'confirmation' ? handleErrorDialogConfirm : undefined}
// //           cancelText={t('button.cancel')}
// //           okText={t('button.ok')}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default InstrumentLockTag;



// // import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// // import { useTranslation } from 'react-i18next';
// // import AuditTrail from '../../../../Layout/Common/AuditTrail';
// // import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
// // import Errordialog from '../../../../Layout/Common/Errordialog';
// // import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
// // import servicecall from '../../../../../Services/servicecall';
// // import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
// // import { useInstrumentLock } from '../../../../../Context/InstrumentLockContext';

// // const LockIcon = () => (
// //   <i className="fa fa-lock text-xs mr-1"></i>
// // );

// // const UnlockIcon = () => (
// //   <i className="fa fa-unlock text-xs mr-1"></i>
// // );

// // const UpdateIcon = () => (
// //   <i className="fa fa-pencil-square-o text-xs mr-1"></i>
// // );

// // const EditPencilIcon = () => (
// //   <i className="fa fa-pencil text-xl mr-0.5"></i>
// // );

// // const MergeFileCountRow = ({ mergeCount, currentCount, onMergeChange, disabled, showMergeFields, t }) => {
// //   if (!showMergeFields) return null;
  
// //   const handleChange = (e) => {
// //     const value = e.target.value;
// //     if (value === '' || /^\d+$/.test(value)) {
// //       const numValue = parseInt(value) || 0;
// //       if (numValue > 10000) {
// //         onMergeChange("10000");
// //       } else {
// //         onMergeChange(value);
// //       }
// //     }
// //   };
  
// //   return (
// //     <div className="mb-6 mt-7">
// //       <div className="flex items-center gap-6">
// //         <div className="flex items-center gap-2">
// //           <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
// //             {t('instrumentlocktag.mergefilecount')}
// //           </label>
// //           <input
// //             type="text"
// //             value={mergeCount}
// //             onChange={handleChange}
// //             onBlur={(e) => {
// //               if (e.target.value === '' || parseInt(e.target.value) < 1) {
// //                 onMergeChange("1");
// //               }
// //             }}
// //             disabled={disabled}
// //             className="w-16 h-7 px-2 text-xs text-center font-['verdana'] border border-gray-300 rounded bg-white hover:border-gray-400 text-[#405F7D]"
// //           />
// //         </div>
        
// //         <div className="flex items-center gap-2">
// //           <label className="text-xs text-[#405F7D] min-w-[150px] font-semibold font-roboto">
// //             {t('instrumentlocktag.currentuploadfilecount')}
// //           </label>
// //           <input
// //             type="text"
// //             value={currentCount}
// //             disabled={true}
// //             className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-[#405F7D] font-verdana"
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const InlineEditIcon = () => (
// //   <i className="fa fa-edit text-lg mr-1"></i>
// // );

// // const TagGrid = React.memo(({ tags, onTagValueClick, isLoadingTags, isLocked, lockedByOtherUser, isAutoLocked, onTagEditRequest, onInlineEditSubmit, t, tagErrors }) => {
// //   const [tooltipState, setTooltipState] = useState({
// //     isOpen: false,
// //     tagIndex: null,
// //     position: { top: 0, left: 0 },
// //     searchTerm: '',
// //     selectedValue: '',
// //     selectedValueID: '',
// //     options: []
// //   });

// //   const [selectedTagIndex, setSelectedTagIndex] = useState(null);
// //   const [showErrorDialog, setShowErrorDialog] = useState(false);
// //   const [errorMessage, setErrorMessage] = useState('');
// //   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
// //   const [inlineEditState, setInlineEditState] = useState({
// //     isEditing: false,
// //     tagIndex: null,
// //     inputValue: ''
// //   });

// //   const showInformationMessage = (message) => {
// //     setErrorMessage(message);
// //     setShowErrorDialog(true);
// //   };

// //   const canEditTag = useCallback((tagIndex) => {
// //     if (tagIndex === 0) return true;
// //     for (let i = 0; i < tagIndex; i++) {
// //       if (!tags[i]?.value) return false;
// //     }
// //     return true;
// //   }, [tags]);

// //   const getErrorMessage = useCallback((tagIndex) => {
// //     for (let i = tagIndex - 1; i >= 0; i--) {
// //       if (!tags[i]?.value) {
// //         return `${t('instrumentlocktag.pleaseselect')} ${tags[i]?.tagName} ${t('instrumentlocktag.value').toLowerCase()} first`;
// //       }
// //     }
// //     return `${t('instrumentlocktag.pleaseselect')} required ${t('instrumentlocktag.value').toLowerCase()} first`;
// //   }, [tags, t]);

// //   const handleEditClick = async (tag, index, event) => {
// //     event.stopPropagation();
    
// //     const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
// //     if (shouldDisableEdit) return;
    
// //     if (tag.required && tag.tagID !== 0) {
// //       if (!canEditTag(index)) {
// //         showInformationMessage(getErrorMessage(index));
// //         return;
// //       }
      
// //       const calculateTooltipPositionFromRect = (buttonRect) => {
// //         const viewportHeight = window.innerHeight;
// //         const viewportWidth = window.innerWidth;
// //         const tooltipWidth = 250;
// //         const tooltipHeight = 220;
        
// //         let left = buttonRect.left - tooltipWidth + 0;
// //         let top = buttonRect.top - (tooltipHeight) + 10;
        
// //         if (top < 10) top = 10;
// //         if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
// //         if (left < 10) left = buttonRect.right + 10;
// //         if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
        
// //         return { top, left };
// //       };
      
// //       const buttonRect = event.currentTarget.getBoundingClientRect();
// //       const position = calculateTooltipPositionFromRect(buttonRect);
      
// //       setSelectedTagIndex(index);
      
// //       if (tag.options && tag.options.length > 0) {
// //         setTooltipState({
// //           isOpen: true,
// //           tagIndex: index,
// //           position,
// //           searchTerm: '',
// //           selectedValue: tag.value || '',
// //           selectedValueID: tag.valueID || '',
// //           options: tag.options
// //         });
// //         return;
// //       }
      
// //       setIsLoadingOptions(true);
      
// //       try {
// //         const options = await onTagEditRequest(index);
        
// //         setTooltipState({
// //           isOpen: true,
// //           tagIndex: index,
// //           position,
// //           searchTerm: '',
// //           selectedValue: tag.value || '',
// //           selectedValueID: tag.valueID || '',
// //           options: options || []
// //         });
// //       } catch (error) {
// //         showInformationMessage(t('instrumentlocktag.failedtoloadoptions'));
// //       } finally {
// //         setIsLoadingOptions(false);
// //       }
// //     } else {
// //       setInlineEditState({
// //         isEditing: true,
// //         tagIndex: index,
// //         inputValue: tag.value || ''
// //       });
// //     }
// //   };

// //   const handleInlineEditSubmit = () => {
// //     if (inlineEditState.tagIndex !== null && inlineEditState.inputValue !== undefined) {
// //       onInlineEditSubmit(
// //         inlineEditState.tagIndex,
// //         inlineEditState.inputValue,
// //         inlineEditState.inputValue
// //       );
// //     }
// //     setInlineEditState({
// //       isEditing: false,
// //       tagIndex: null,
// //       inputValue: ''
// //     });
// //   };

// //   const handleInlineEditCancel = () => {
// //     setInlineEditState({
// //       isEditing: false,
// //       tagIndex: null,
// //       inputValue: ''
// //     });
// //   };

// //   const handleTooltipSubmit = () => {
// //     if (tooltipState.tagIndex !== null) {
// //       onTagValueClick(
// //         tooltipState.tagIndex, 
// //         tooltipState.selectedValue || '',
// //         tooltipState.selectedValueID || ''
// //       );
// //     }
// //     setTooltipState({
// //       isOpen: false,
// //       tagIndex: null,
// //       position: { top: 0, left: 0 },
// //       searchTerm: '',
// //       selectedValue: '',
// //       selectedValueID: '',
// //       options: []
// //     });
// //   };

// //   const handleTooltipClose = () => {
// //     setTooltipState({
// //       isOpen: false,
// //       tagIndex: null,
// //       position: { top: 0, left: 0 },
// //       searchTerm: '',
// //       selectedValue: '',
// //       selectedValueID: '',
// //       options: []
// //     });
// //   };

// //   const handleOptionClick = (optionValue, optionValueID) => {
// //     setTooltipState(prev => ({
// //       ...prev,
// //       selectedValue: optionValue,
// //       selectedValueID: optionValueID
// //     }));
// //   };

// //   const handleSearchChange = (value) => {
// //     setTooltipState(prev => ({
// //       ...prev,
// //       searchTerm: value
// //     }));
// //   };

// //   const filteredOptions = tooltipState.options.filter(opt => 
// //     opt.label.toLowerCase().includes(tooltipState.searchTerm.toLowerCase())
// //   );

// //   if (isLoadingTags) {
// //     return (
// //       <div className="border border-[#f3f3f3] rounded relative">
// //         <div className="flex justify-center items-center h-[250px]">
// //           <div className="text-sm text-gray-500">{t('common.loading')}...</div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <>
// //       <div className="border border-[#f3f3f3] rounded relative">
// //         <div className="grid grid-cols-2 bg-[#fbfbfb] border-b border-[#f3f3f3]">
// //           <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
// //             {t('instrumentlocktag.tagName')}
// //           </div>
// //           <div className="px-1 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
// //             {t('instrumentlocktag.tagValue')}
// //           </div>
// //         </div>
        
// //         <div className="bg-white min-h-[250px]">
// //           {tags.length === 0 ? (
// //             <div className="px-4 py-12 text-center text-xs text-[#4b4b4b] font-roboto">            
// //               {t('instrumentlocktag.noTagValue')}
// //             </div>
// //           ) : (
// //             tags.map((tag, idx) => {
// //               const isSelected = selectedTagIndex === idx;
// //               const isThisTagLoading = isLoadingOptions && isSelected;
// //               const isInlineEditing = inlineEditState.isEditing && inlineEditState.tagIndex === idx;
// //               const hasError = tagErrors[idx] && tag.required && !tag.value;
              
// //               const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
// //               const isDropdownMode = tag.required && tag.tagID !== 0;
// //               const showEditIcon = tag.editable && !shouldDisableEdit;
              
// //               return (
// //                 <div 
// //                   key={`tag-${idx}-${tag.tagID}`}
// //                   className={`grid grid-cols-2 border-b border-[#e7e6e6] last:border-b-1 min-h-[40px]
// //                     ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#378cfc]' : 'bg-white border-l-4 border-l-transparent'}
// //                     ${hasError ? 'border-b-2 border-b-red-400' : ''}
// //                     ${tag.editable && !shouldDisableEdit ? 'cursor-pointer hover:bg-[#eef2f9]' : 'cursor-default'}
// //                   `}
// //                   onClick={() => setSelectedTagIndex(idx)}
// //                 >
// //                   <div className={`px-4 text-xs flex items-center font-['verdana']
// //                     ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
// //                   `}>
// //                     {tag.tagName}
// //                     {tag.required && <span className="text-red-500 ml-1">*</span>}
// //                   </div>
                  
// //                   <div className="px-0.5 py-0 text-xs flex items-center justify-between gap-0">
// //                     {isInlineEditing ? (
// //                       <div className="flex-1 flex items-center">
// //                         <input
// //                           type="text"
// //                           value={inlineEditState.inputValue}
// //                           onChange={(e) => setInlineEditState(prev => ({
// //                             ...prev,
// //                             inputValue: e.target.value
// //                           }))}
// //                           className={`w-full h-9 px-0.5 text-xs font-bold border border-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:border-white
// //                             ${hasError ? 'border-red-400' : ''}`}
// //                           autoFocus
// //                           onBlur={handleInlineEditSubmit}
// //                           onKeyDown={(e) => {
// //                             if (e.key === 'Enter') {
// //                               handleInlineEditSubmit();
// //                             } else if (e.key === 'Escape') {
// //                               handleInlineEditCancel();
// //                             }
// //                           }}
// //                         />
// //                       </div>
// //                     ) : (
// //                       <>
// //                         <span className={`flex-1 font-['verdana'] ${
// //                           isSelected ? 'font-bold' : ''
// //                         } text-[#373737]`}>
// //                           {tag.value || ''}
// //                           {isThisTagLoading && (
// //                             <span className="ml-2 text-xs text-gray-500">{t('common.loading')}...</span>
// //                           )}
// //                         </span>
                        
// //                         {showEditIcon && (
// //                           <button
// //                             onClick={(e) => {
// //                               setSelectedTagIndex(idx);
// //                               handleEditClick(tag, idx, e);
// //                             }}
// //                             className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool"
// //                             title={t('button.edit')}
// //                             disabled={isThisTagLoading}
// //                           >
// //                             {isDropdownMode ? (
// //                               <EditPencilIcon />
// //                             ) : (
// //                               <InlineEditIcon />
// //                             )}
// //                           </button>
// //                         )}
// //                       </>
// //                     )}
// //                   </div>
// //                 </div>
// //               );
// //             })
// //           )}
// //         </div>
// //       </div>

// //       {showErrorDialog && (
// //         <Errordialog
// //           message={errorMessage}
// //           type="information"
// //           onClose={() => setShowErrorDialog(false)}
// //           okText={t('button.ok')}
// //         />
// //       )}

// //       {tooltipState.isOpen && (
// //         <div 
// //           className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col"
// //           style={{
// //             top: `${tooltipState.position.top}px`,
// //             left: `${tooltipState.position.left}px`,
// //           }}
// //         >
// //           <div className="p-0.5 border-gray-200">
// //             <div className="mb-0">
// //               <input
// //                 type="text"
// //                 value={tooltipState.searchTerm}
// //                 onChange={(e) => handleSearchChange(e.target.value)}
// //                 className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
// //                 autoFocus
// //                 placeholder={t('instrumentlocktag.searchplaceholder')}
// //               />
// //             </div>
// //           </div>
          
// //           <div className="flex-1 overflow-y-auto min-h-0">
// //             {filteredOptions.length === 0 ? (
// //               <div className="text-center py-6 text-xs text-gray-500 font-roboto">
// //                 {t('instrumentlocktag.nooptionsfound')}
// //               </div>
// //             ) : (
// //               filteredOptions.map((option, idx) => {
// //                 const isSelected = tooltipState.selectedValue === option.label && 
// //                                    tooltipState.selectedValueID === option.value;
                
// //                 return (
// //                   <div
// //                     key={`option-${idx}-${option.value}`}
// //                     onClick={() => handleOptionClick(option.label, option.value)}
// //                     onDoubleClick={handleTooltipSubmit}
// //                     className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
// //                       ${isSelected ? 'bg-[#f2f2f2]' : ''}
// //                       ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
// //                     `}
// //                   >
// //                     <div className="flex items-center ml-1">
// //                       <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
// //                         {option.label}
// //                       </span>
// //                     </div>
// //                   </div>
// //                 );
// //               })
// //             )}
// //           </div>
          
// //           <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
// //             <button
// //               onClick={handleTooltipSubmit}
// //               className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
// //             >
// //               <i className="fa fa-check-square-o mr-1"></i>
// //               {t('button.submit')}
// //             </button>
// //             <button
// //               onClick={handleTooltipClose}
// //               className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
// //             >
// //               <i className="fa fa-times mr-1"></i>
// //               {t('button.cancel')}
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // });

// // TagGrid.displayName = 'TagGrid';

// // const InstrumentLockTag = ({ scheduleData }) => {
// //   const { t } = useTranslation();
// //   const { navigateAfterLock } = useInstrumentLock();
// //   const { postData } = servicecall();
  
// //   const endpoints = {
// //     lockTemplateCombo: "InstrumentLock/LockTemplateCombo",
// //     loadTagCategory: "InstrumentLock/LoadTagCategory",
// //     clientLockCombo: "InstrumentLock/clientlockcombo",
// //     lockInstrumentCombo: "InstrumentLock/LockInstrumentCombo",
// //     lockPathCombo: "InstrumentLock/LockPathCombo",
// //     loadCategoryTagValueAndID: "InstrumentLock/LoadCategoryTagValueAndID",
// //     lockUserCombo: "InstrumentLock/LockUserCombo", 
// //     mergeFileAndAutoUnlock: "InstrumentLock/MergeFileAndAutounlock",
// //     loadProtocol: "InstrumentLock/LoadProtocol",
// //     lockLimsordercombo: "InstrumentLock/lockLimsordercombo",
// //     onChangeInstrumentCombo: "InstrumentLock/OnChangeInstrumentCombo",
// //     lockActiveParsingInstrumentCombo: "InstrumentLock/LockActiveParsingInstrumentCombo",
// //     lockDeactiveParsingInstrumentCombo: "InstrumentLock/LockDeactiveParsingInstrumentCombo",
// //     lockActiveInstrumentPathCombo: "InstrumentLock/LockActiveInstrumentPathCombo",
// //     lockDeactiveInstrumentPathCombo: "InstrumentLock/LockDeactiveInstrumentPathCombo",
// //     interfaceConnectionChecking: "InstrumentLock/InterfaceConnectionChecking",
// //     lockInstrument: "InstrumentLock/LockInstrument",
// //     unLockInstrument: "InstrumentLock/UnLockInstrument"
// //   };

// //   const [showErrorDialog, setShowErrorDialog] = useState(false);
// //   const [errorDialogMessage, setErrorDialogMessage] = useState('');
// //   const [errorDialogType, setErrorDialogType] = useState('information');
// //   const [errorDialogCallback, setErrorDialogCallback] = useState(null);

// //   const showErrorDialogMessage = (message, type = 'information', onConfirm = null) => {
// //     if (type === 'confirmation' && onConfirm) {
// //       setErrorDialogMessage(message);
// //       setErrorDialogType('confirmation');
// //       setErrorDialogCallback(() => onConfirm);
// //       setShowErrorDialog(true);
// //     } else {
// //       setErrorDialogMessage(message);
// //       setErrorDialogType(type);
// //       setErrorDialogCallback(null);
// //       setShowErrorDialog(true);
// //     }
// //   };

// //   const handleErrorDialogClose = () => {
// //     setShowErrorDialog(false);
// //     setErrorDialogCallback(null);
// //   };

// //   const handleErrorDialogConfirm = () => {
// //     if (errorDialogCallback) {
// //       errorDialogCallback();
// //     }
// //     setShowErrorDialog(false);
// //     setErrorDialogCallback(null);
// //   };

// //   const getActiveUserDetails = useCallback(() => {
// //     const userDetails = CF_activeUserdetails();
// //     return {
// //       ...userDetails.ActiveUserDetails,
// //       sUserID: userDetails.ActiveUserDetails?.sUserID || userDetails.sUserID,
// //       sUsername: userDetails.ActiveUserDetails?.sUsername || userDetails.sUsername
// //     };
// //   }, []);

// //   const getSessionValue = (key) => {
// //     try {
// //       const value = sessionStorage.getItem(key);
// //       if (value === null) {
// //         switch(key) {
// //           case 'MergeCount': return '1';
// //           case 'FileName': return 'false';
// //           case 'L11ParserType': return '0';
// //           default: return "";
// //         }
// //       }
// //       return value;
// //     } catch {
// //       return "";
// //     }
// //   };

// //   const setSessionValue = (key, value) => {
// //     try {
// //       sessionStorage.setItem(key, value);
// //     } catch (error) {
// //       // Silent error handling
// //     }
// //   };

// //   const makeAjaxCall = async (url, passObjDet, process) => {
// //     try {
// //       const userDetails = CF_activeUserdetails();
      
// //       let requestBody;
      
// //       if (url === endpoints.loadCategoryTagValueAndID) {
// //         requestBody = {
// //           passObjDet: passObjDet,
// //           ActiveUserDetails: userDetails.ActiveUserDetails,
// //           ApplicationCode: userDetails.ApplicationCode
// //         };
// //       } else {
// //         requestBody = {
// //           ...passObjDet,
// //           ActiveUserDetails: userDetails.ActiveUserDetails,
// //           ApplicationCode: userDetails.ApplicationCode
// //         };
// //       }
      
// //       const response = await postData(url, requestBody);
        
// //       if (!response) {
// //         return null;
// //       }
      
// //       if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
// //         throw new Error(response.Message || response.ErrorMessage || `${t('Auditpopup.somethingwentwrong')} ${url}`);
// //       }
      
// //       if (process === "InterfaceConnectionChecking") {
// //         let formattedResponse;
        
// //         if (response.AuditTrailLogin !== undefined) {
// //           return [response];
// //         }
        
// //         if (Array.isArray(response)) {
// //           formattedResponse = response;
// //         } else if (response && typeof response === 'object') {
// //           if (response.AccessStatus !== undefined) {
// //             formattedResponse = [response];
// //           } else if (response[0] && response[0].AccessStatus !== undefined) {
// //             formattedResponse = Object.values(response);
// //           } else {
// //             formattedResponse = [response];
// //           }
// //         } else {
// //           formattedResponse = [];
// //         }
        
// //         return formattedResponse;
// //       }
      
// //       if (process === "LockInstrument" || process === "UnLockInstrument") {
// //         return response;
// //       }
      
// //       if (process === "SelectPathFileUSerTemplate") {
// //         return response.oResInstChange || response;
// //       }
      
// //       if (response.oResObj !== undefined) {
// //         return response.oResObj;
// //       }
      
// //       if (response.oResInstChange !== undefined) {
// //         return response.oResInstChange;
// //       }
      
// //       if (response.list !== undefined) {
// //         return response.list;
// //       }
      
// //       if (Array.isArray(response)) {
// //         return response;
// //       }
      
// //       return response;
      
// //     } catch (error) {
// //       throw error;
// //     }
// //   };

// //   const getDeactiveScheduleDataRef = useRef(scheduleData);
// //   const initialLoadDoneRef = useRef(false);

// //   const [formData, setFormData] = useState({
// //     client: '',
// //     instrument: '',
// //     path: '',
// //     limsOrder: '',
// //     fileName: '',
// //     template: '',
// //     mergeFileCount: '1',
// //     currentFileCount: '0',
// //     unlockAfterCapture: false,
// //     user: '',
// //     lockID: '',
// //     interfaceOrderID: '',
// //     protocolID: '0'
// //   });

// //   const [errors, setErrors] = useState({});
// //   const [tagErrors, setTagErrors] = useState({});
// //   const [isLocked, setIsLocked] = useState(false);
// //   const [showMergeFields, setShowMergeFields] = useState(false);
// //   const [showUnlockOption, setShowUnlockOption] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isLoadingTags, setIsLoadingTags] = useState(false);
// //   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
// //   const [isInstrumentInterface, setIsInstrumentInterface] = useState(false);
// //   const [isFileNameEnabled, setIsFileNameEnabled] = useState(false);
// //   const [isLimsOrderEnabled, setIsLimsOrderEnabled] = useState(false);
// //   const [lockedByOtherUser, setLockedByOtherUser] = useState(false);
// //   const [isAutoLocked, setIsAutoLocked] = useState(false);
// //   const [deviceType, setDeviceType] = useState('desktop');
// //   const [isSubmitting, setIsSubmitting] = useState(false);
  
// //   const [showAuditTrail, setShowAuditTrail] = useState(false);
// //   const [auditAction, setAuditAction] = useState(null);
// //   const [auditCallback, setAuditCallback] = useState(null);

// //   const [templateOptions, setTemplateOptions] = useState([]);
// //   const [clientOptions, setClientOptions] = useState([]);
// //   const [instrumentOptions, setInstrumentOptions] = useState([]);
// //   const [pathOptions, setPathOptions] = useState([]);
// //   const [limsOrderOptions, setLimsOrderOptions] = useState([]);
// //   const [userOptions, setUserOptions] = useState([]);
// //   const [tags, setTags] = useState([]);

// //   const tagIdToNameMap = {
// //     1: "Sample",
// //     2: "Test", 
// //     3: "Project",
// //     4: "BatchNo"
// //   };

// //   useEffect(() => {
// //     const device = sessionStorage.getItem("device") || "desktop";
// //     setDeviceType(device);
// //   }, []);

// //   const isInterfaceInstrument = useCallback((instrumentId) => {
// //     if (!instrumentId) return false;
    
// //     const idStr = instrumentId.toString().trim();
// //     const parts = idStr.split(':');
// //     return parts.length > 1 && parts[1] && parts[1].trim() !== "0";
// //   }, []);

// //   const loadTagValues = useCallback(async (tagId, templateId, instrumentId, tagIndex, previousTagValueID = "") => {
// //     try {
// //       const requestBody = {
// //         uid: tagIndex || 0,
// //         sUserID: formData.path || "",
// //         nTagID: parseInt(tagId) || 0,
// //         sTagValueID: previousTagValueID || "          ",
// //         sInstrumentID: instrumentId.padEnd(10, ' '),
// //         sTemplateID: templateId
// //       };
      
// //       const response = await makeAjaxCall(endpoints.loadCategoryTagValueAndID, requestBody);
      
// //       if (response && Array.isArray(response)) {
// //         const options = response.map(item => ({
// //           value: item.sTagValueID ? item.sTagValueID.trim() : '',
// //           label: item.sTagValue || t('instrumentlocktag.unknownvalue')
// //         })).filter(opt => opt.value && opt.label);
        
// //         return options;
// //       }
      
// //       return [];
      
// //     } catch (error) {
// //       return [];
// //     }
// //   }, [formData.path, t]);

// //   const fetchTags = useCallback(async (templateId, instrumentId) => {
// //     if (!templateId || !instrumentId) {
// //       setTags([]);
// //       return;
// //     }
    
// //     setIsLoadingTags(true);
// //     try {
// //       const currentInstrumentId = instrumentId.padEnd(10, ' ');
      
// //       const requestBody = {
// //         sUserID: formData.path || "",
// //         ActiveUserDetails: getActiveUserDetails(),
// //         sInstrumentID: currentInstrumentId,
// //         ApplicationCode: "SDMS",
// //         sTemplateID: templateId
// //       };
      
// //       const response = await makeAjaxCall(endpoints.loadTagCategory, requestBody);
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const transformedTags = await Promise.all(response.map(async (item, index) => {
// //           const tagId = item.L58TagID || item.L8iTagID || index;
// //           const tagName = tagIdToNameMap[tagId] || item.L58TagName || t('instrumentlocktag.unknowntag');
// //           const value = item.Value || '';
// //           const valueID = item.ValueID || '';
// //           const required = item.L58ValueStatus || false;
// //           const order = item.L58Order || index;
          
// //           let options = [];
// //           if (index === 0 && tagId && required) {
// //             options = await loadTagValues(tagId, templateId, instrumentId, index, "");
// //           }
          
// //           return {
// //             tagName: tagName,
// //             value: value.trim(),
// //             valueID: valueID ? valueID.trim() : '',
// //             tagID: tagId,
// //             order: order,
// //             required: required,
// //             editable: true,
// //             options: options
// //           };
// //         }));
        
// //         transformedTags.sort((a, b) => a.order - b.order);
// //         setTags(transformedTags);
        
// //       } else {
// //         setTags([]);
// //       }
// //     } catch (error) {
// //       setTags([]);
// //     } finally {
// //       setIsLoadingTags(false);
// //     }
// //   }, [formData.path, loadTagValues, t]);

// //   const handleInlineEditSubmit = useCallback((index, value, valueID) => {
// //     setTags(prev => {
// //       const updatedTags = prev.map((t, idx) => {
// //         if (idx === index) {
// //           return { ...t, value, valueID };
// //         }
        
// //         if (idx > index) {
// //           return { ...t, value: '', valueID: '', options: [] };
// //         }
        
// //         return t;
// //       });
      
// //       return updatedTags;
// //     });
    
// //     if (value) {
// //       setTagErrors(prev => ({ ...prev, [index]: false }));
// //     }
// //   }, []);

// //   const checkMergeAndAutoUnlockSettings = useCallback(async () => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.mergeFileAndAutoUnlock, {});
      
// //       if (response) {
// //         const showMerge = response.MergeCount?.[0]?.L67Status === false;
// //         setShowMergeFields(showMerge);
        
// //         const showUnlock = response.AutoUnlock?.[0]?.L67Status === false;
// //         setShowUnlockOption(showUnlock);
        
// //         if (response.MergeCountValue?.[0]?.L42ValueSettings) {
// //           const mergeCount = response.MergeCountValue[0].L42ValueSettings;
// //           setFormData(prev => ({ ...prev, mergeFileCount: mergeCount }));
// //           setSessionValue("MergeCount", mergeCount);
// //         }
        
// //         if (response.AutoUnlockValue?.[0]?.L42ValueSettings === "1") {
// //           setFormData(prev => ({ ...prev, unlockAfterCapture: true }));
// //         }
// //       }
// //     } catch (error) {
// //       // Silent error handling
// //     }
// //   }, [t]);

// //   const loadUsers = useCallback(async () => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.lockUserCombo, {});
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const users = response.map(user => ({
// //           value: user.sUserID ? user.sUserID.trim() : '',
// //           label: user.sUserName || t('instrumentlocktag.unknownuser')
// //         }));
        
// //         setUserOptions(users);
        
// //         const activeUserDetails = getActiveUserDetails();
// //         const currentUserId = activeUserDetails.sUserID || "U1";
        
// //         const currentUser = users.find(user => user.value === currentUserId);
// //         if (currentUser) {
// //           setFormData(prev => ({ ...prev, user: currentUser.value }));
// //         }
// //       }
// //     } catch (error) {
// //       // Silent error handling
// //     }
// //   }, [t]);

// //   const loadProtocol = useCallback(async (instrumentId) => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.loadProtocol, {
// //         sInstrumentID: instrumentId
// //       });
      
// //       if (response) {
// //         const parserTypeValue = String(response.L11ParserType || '0');
        
// //         const fileNameEnabled = response.FileName === "true";
// //         setIsFileNameEnabled(fileNameEnabled);
        
// //         setSessionValue("FileName", fileNameEnabled.toString());
// //         setSessionValue("L11ParserType", parserTypeValue);
        
// //         const isInterface = isInterfaceInstrument(instrumentId);
// //         setIsInstrumentInterface(isInterface);
        
// //         if (isInterface) {
// //           if (fileNameEnabled) {
// //             setIsLimsOrderEnabled(false);
// //           } else {
// //             setIsLimsOrderEnabled(true);
// //           }
// //         } else {
// //           setIsLimsOrderEnabled(false);
// //         }
        
// //         return response;
// //       }
// //     } catch (error) {
// //       return null;
// //     }
// //   }, [isInterfaceInstrument, t]);

// //   const loadLimsOrder = useCallback(async (interfaceInstId) => {
// //     try {
// //       const response = await makeAjaxCall(endpoints.lockLimsordercombo, {
// //         nInterfaceInstID: interfaceInstId
// //       });
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const limsOrders = response.map(order => ({
// //           value: order.nOrderID ? String(order.nOrderID).trim() : '',
// //           label: order.LIMSOrder || t('instrumentlocktag.unknownorder'),
// //           orderID: order.nOrderID || '',
// //           sampleID: order.SampleID || '',
// //           testCode: order.TestCode || '',
// //           replicateID: order.ReplicateID || '',
// //           ...order
// //         }));
        
// //         setLimsOrderOptions(limsOrders);
// //         setIsLimsOrderEnabled(true);
        
// //         if (limsOrders.length > 0) {
// //           const firstOrder = limsOrders[0];
// //           setFormData(prev => ({ 
// //             ...prev, 
// //             limsOrder: firstOrder.value,
// //             limsOrderID: firstOrder.orderID,
// //             limsSampleID: firstOrder.sampleID,
// //             limsTestCode: firstOrder.testCode,
// //             limsReplicateID: firstOrder.replicateID
// //           }));
// //         }
        
// //         return limsOrders;
// //       } else {
// //         setLimsOrderOptions([]);
// //         setIsLimsOrderEnabled(false);
// //         setFormData(prev => ({ 
// //           ...prev, 
// //           limsOrder: '',
// //           limsOrderID: '',
// //           limsSampleID: '',
// //           limsTestCode: '',
// //           limsReplicateID: ''
// //         }));
// //         return [];
// //       }
// //     } catch (error) {
// //       setLimsOrderOptions([]);
// //       setIsLimsOrderEnabled(false);
// //       setFormData(prev => ({ 
// //         ...prev, 
// //         limsOrder: '',
// //         limsOrderID: '',
// //         limsSampleID: '',
// //         limsTestCode: '',
// //         limsReplicateID: ''
// //       }));
// //       return [];
// //     }
// //   }, [t]);

// //   const onChangeInstrumentCombo = useCallback(async (instrumentId) => {
// //   try {
// //     const nLLProStatus = 0;
// //     const nProtocolStatus = parseInt(formData.protocolID) || 0;
// //     const nProtocolStatusfile = isFileNameEnabled ? 101 : 0;
    
// //     const response = await makeAjaxCall(endpoints.onChangeInstrumentCombo, {
// //       sInstrumentID: instrumentId,
// //       nLLProStatus: nLLProStatus,
// //       nProtocolStatus: nProtocolStatus,
// //       nProtocolStatusfile: nProtocolStatusfile
// //     }, "SelectPathFileUSerTemplate");
    
// //     if (response) {
// //       const activeUserDetails = getActiveUserDetails();
// //       const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
      
// //       // Handle lock status
// //       if (response.sLockType === 'A') {
// //         setIsAutoLocked(true);
// //         setIsLocked(true);
// //         setLockedByOtherUser(false);
// //       } else if (response.sUserID) {
// //         setIsLocked(true);
// //         setIsAutoLocked(false);
        
// //         const responseUserId = response.sUserID ? response.sUserID.trim() : '';
        
// //         if (responseUserId === currentUserId) {
// //           setLockedByOtherUser(false);
// //         } else {
// //           setLockedByOtherUser(true);
// //         }
// //       } else {
// //         setIsLocked(false);
// //         setIsAutoLocked(false);
// //         setLockedByOtherUser(false);
// //       }
      
// //       const updates = {};
      
// //       if (response.sFileName) {
// //         updates.fileName = response.sFileName;
// //       }
      
// //       if (response.nCurMergeFileNo > 0) {
// //         updates.currentFileCount = String(response.nCurMergeFileNo);
// //       } else {
// //         updates.currentFileCount = '0';
// //       }
      
// //       if (response.nMergeFileCount > 0) {
// //         updates.mergeFileCount = String(response.nMergeFileCount);
// //         setSessionValue("LockedMergeCount", String(response.nMergeFileCount));
// //       } else if (response.sTaskID != null) {
// //         const lockedMergeCount = getSessionValue("LockedMergeCount");
// //         if (lockedMergeCount) {
// //           updates.mergeFileCount = lockedMergeCount;
// //         } else {
// //           updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //         }
// //       } else {
// //         updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //       }
      
// //       if (response.nAutoUnlock) {
// //         updates.unlockAfterCapture = true;
// //       } else {
// //         updates.unlockAfterCapture = false;
// //       }
      
// //       if (response.sLockID) {
// //         updates.lockID = response.sLockID;
// //       } else {
// //         updates.lockID = '';
// //       }
      
// //       if (response.nInterFaceOrderID) {
// //         updates.interfaceOrderID = String(response.nInterFaceOrderID);
// //       } else {
// //         updates.interfaceOrderID = '';
// //       }
      
// //       // Auto-select first template for auto-locked instruments
// //       if (response.sLockType === 'A' && templateOptions.length > 0) {
// //         const firstTemplateValue = templateOptions[0].value;
// //         updates.template = firstTemplateValue;
// //       } else if (response.sTemplateID) {
// //         // For user-locked instruments, use the template they used
// //         updates.template = response.sTemplateID;
// //       }
// //       // If not locked, template remains empty
      
// //       setFormData(prev => ({ ...prev, ...updates }));
      
// //       // If template was set (auto-locked or user-locked), return response
// //       // The useEffect will automatically load tags for the template
      
// //       return response;
// //     }
// //   } catch (error) {
// //     return null;
// //   }
// // }, [formData.protocolID, isFileNameEnabled, templateOptions]);

// //   const loadPaths = useCallback(async (instrumentId) => {
// //     try {
// //       let endpoint = endpoints.lockPathCombo;
// //       let requestBody = {
// //         sInstrumentID: instrumentId,
// //         sScheduleID: ""
// //       };
      
// //       if (getDeactiveScheduleDataRef.current) {
// //         const scheduleData = getDeactiveScheduleDataRef.current;
// //         const scheduleId = scheduleData.L13ScheduleID;
// //         const taskType = scheduleData.TaskType;
        
// //         if (taskType === "ScheduleCreation") {
// //           endpoint = endpoints.lockActiveInstrumentPathCombo;
// //         } else {
// //           endpoint = endpoints.lockDeactiveInstrumentPathCombo;
// //         }
// //         requestBody.sScheduleID = scheduleId;
// //       }
      
// //       const response = await makeAjaxCall(endpoint, requestBody);
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const pathOptionsData = response.map(path => ({
// //           value: path.sTaskID || path.L13ScheduleID || '',
// //           label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
// //           originalItem: path
// //         }));
        
// //         setPathOptions(pathOptionsData);
        
// //         if (pathOptionsData.length > 0) {
// //           const firstPath = pathOptionsData[0];
// //           setFormData(prev => ({ ...prev, path: firstPath.value }));
          
// //           if (formData.template) {
// //             fetchTags(formData.template, instrumentId);
// //           }
// //         }
// //       } else {
// //         setPathOptions([]);
// //       }
// //     } catch (error) {
// //       setPathOptions([]);
// //     }
// //   }, [formData.template, fetchTags, t]);

// //   const loadInstruments = useCallback(async (clientId) => {
// //   try {
// //     let endpoint = endpoints.lockInstrumentCombo;
// //     let requestBody = {
// //       sClientID: clientId,
// //       sScheduleID: ""
// //     };
    
// //     if (getDeactiveScheduleDataRef.current) {
// //       const scheduleData = getDeactiveScheduleDataRef.current;
// //       const scheduleId = scheduleData.L13ScheduleID;
// //       const taskType = scheduleData.TaskType;
      
// //       if (taskType === "ScheduleCreation") {
// //         endpoint = endpoints.lockActiveParsingInstrumentCombo;
// //       } else {
// //         endpoint = endpoints.lockDeactiveParsingInstrumentCombo;
// //       }
// //       requestBody.sScheduleID = scheduleId;
// //     }
    
// //     const response = await makeAjaxCall(endpoint, requestBody);
    
// //     if (Array.isArray(response) && response.length > 0) {
// //       const instrumentOptionsData = response.map(instrument => ({
// //         value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
// //         label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
// //         originalItem: instrument
// //       }));
      
// //       setInstrumentOptions(instrumentOptionsData);
      
// //       // Auto-select and load first instrument
// //       if (instrumentOptionsData.length > 0) {
// //         const firstInstrument = instrumentOptionsData[0];
        
// //         setIsLoading(true);
        
// //         try {
// //           setFormData(prev => ({ 
// //             ...prev, 
// //             instrument: firstInstrument.value,
// //             path: '',
// //             fileName: '',
// //             limsOrder: '',
// //             limsOrderID: '',
// //             limsSampleID: '',
// //             limsTestCode: '',
// //             limsReplicateID: '',
// //             // DO NOT clear template when auto-selecting first instrument
// //             mergeFileCount: getSessionValue("MergeCount") || '1',
// //             currentFileCount: '0'
// //           }));
          
// //           setErrors(prev => ({ ...prev, instrument: false }));
          
// //           setTags([]);
// //           setTagErrors({});
// //           setPathOptions([]);
          
// //           const isInterface = isInterfaceInstrument(firstInstrument.value);
          
// //           await loadProtocol(firstInstrument.value);
          
// //           if (isInterface) {
// //             const interfaceInstId = firstInstrument.value.includes(':') ? 
// //               parseInt(firstInstrument.value.split(':')[1].trim()) : 0;
            
// //             if (interfaceInstId > 0) {
// //               await loadLimsOrder(interfaceInstId);
// //             }
// //           } else {
// //             setLimsOrderOptions([]);
// //             setIsLimsOrderEnabled(false);
// //           }
          
// //           const instrumentData = await onChangeInstrumentCombo(firstInstrument.value);
          
// //           if (instrumentData) {
// //             const updates = {};
            
// //             if (instrumentData.nCurMergeFileNo > 0) {
// //               updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
// //             } else {
// //               updates.currentFileCount = '0';
// //             }
            
// //             const lockedMergeCount = getSessionValue("LockedMergeCount");
// //             if (instrumentData.sTaskID && lockedMergeCount) {
// //               updates.mergeFileCount = lockedMergeCount;
// //             } else if (instrumentData.nMergeFileCount > 0) {
// //               updates.mergeFileCount = String(instrumentData.nMergeFileCount);
// //               setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
// //             } else {
// //               updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //             }
            
// //             // ONLY set template from backend if instrument is locked
// //             if (instrumentData.sTemplateID && instrumentData.sTaskID) {
// //               updates.template = instrumentData.sTemplateID;
// //             }
// //             else if (instrumentData.sLockType === 'A') {
// //               if (templateOptions.length > 0) {
// //                 const firstTemplateValue = templateOptions[0].value;
// //                 updates.template = firstTemplateValue;
// //               }
// //             }
// //             // DO NOT auto-select first template when instrument is not locked
            
// //             setFormData(prev => ({ ...prev, ...updates }));
            
// //           }
          
// //           await loadPaths(firstInstrument.value);
          
// //         } catch (error) {
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       }
// //     } else {
// //       setInstrumentOptions([]);
// //     }
// //   } catch (error) {
// //     setInstrumentOptions([]);
// //     setIsLoading(false);
// //   }
// // }, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
// //     isInterfaceInstrument, isLocked, templateOptions, t]);

// //   const loadClients = useCallback(async () => {
// //     try {
// //       const preselectedClientId = scheduleData?.L06ClientID;
// //       const taskStatus = scheduleData?.TaskType !== "ScheduleCreation" ? 'D' : 'A';
      
// //       const response = await makeAjaxCall(endpoints.clientLockCombo, {
// //         sTaskStatus: taskStatus,
// //         sClientID: preselectedClientId
// //       });
      
// //       if (Array.isArray(response) && response.length > 0) {
// //         const clientOptionsData = response.map(client => ({
// //           value: client.sClientID ? client.sClientID.trim() : '',
// //           label: client.sClientName || t('instrumentlocktag.unknownclient')
// //         }));
        
// //         setClientOptions(clientOptionsData);
        
// //         let clientToSelect = null;
        
// //         if (preselectedClientId) {
// //           clientToSelect = clientOptionsData.find(client => client.value === preselectedClientId);
// //         }
        
// //         if (!clientToSelect && clientOptionsData.length > 0) {
// //           clientToSelect = clientOptionsData[0];
// //         }
        
// //         if (clientToSelect) {
// //           setFormData(prev => ({ ...prev, client: clientToSelect.value }));
// //           await loadInstruments(clientToSelect.value);
// //         }
// //       } else {
// //         setClientOptions([]);
// //       }
// //     } catch (error) {
// //       setClientOptions([]);
// //     }
// //   }, [scheduleData, loadInstruments, t]);

// //   const loadTagOptions = useCallback(async (tagIndex) => {
// //     if (!formData.template || !tags[tagIndex]) return [];
    
// //     const tag = tags[tagIndex];
    
// //     let previousTagValueID = "";
// //     if (tagIndex > 0) {
// //       previousTagValueID = tags[tagIndex - 1].valueID || "          ";
// //     }
    
// //     try {
// //       const options = await loadTagValues(
// //         tag.tagID, 
// //         formData.template, 
// //         formData.instrument,
// //         tagIndex,
// //         previousTagValueID
// //       );
      
// //       return options || [];
// //     } catch (error) {
// //       return [];
// //     }
// //   }, [formData.template, formData.instrument, tags, loadTagValues, t]);

// //   const handleTagValueClick = useCallback((index, value, valueID) => {
// //     setTags(prev => {
// //       const updatedTags = prev.map((t, idx) => {
// //         if (idx === index) {
// //           return { ...t, value, valueID };
// //         }
        
// //         if (idx > index) {
// //           return { ...t, value: '', valueID: '', options: [] };
// //         }
        
// //         return t;
// //       });
      
// //       return updatedTags;
// //     });
    
// //     if (value) {
// //       setTagErrors(prev => ({ ...prev, [index]: false }));
// //     }
    
// //     if (index < tags.length - 1) {
// //       loadTagOptions(index + 1).then(options => {
// //         if (options.length > 0) {
// //           setTags(prev => prev.map((tag, idx) => 
// //             idx === index + 1 ? { ...tag, options } : tag
// //           ));
// //         }
// //       });
// //     }
// //   }, [tags, loadTagOptions]);

// //   const handleTagEditRequest = useCallback(async (tagIndex) => {
// //     if (tags[tagIndex] && tags[tagIndex].options && tags[tagIndex].options.length > 0) {
// //       return tags[tagIndex].options;
// //     }
    
// //     const options = await loadTagOptions(tagIndex);
    
// //     setTags(prev => prev.map((tag, idx) => 
// //       idx === tagIndex ? { ...tag, options } : tag
// //     ));
    
// //     return options;
// //   }, [tags, loadTagOptions]);

// //   const showFullPageLoader = isLoading || isSubmitting || isLoadingTags || isLoadingOptions;
  
// //   useEffect(() => {
// //   if (initialLoadDoneRef.current) return;
  
// //   const loadData = async () => {
// //     setIsLoading(true);
    
// //     try {
// //       await checkMergeAndAutoUnlockSettings();
// //       await loadUsers();
      
// //       const activeUserDetails = getActiveUserDetails();
// //       const templateResponse = await makeAjaxCall(endpoints.lockTemplateCombo, {
// //         ActiveUserDetails: activeUserDetails,
// //         ApplicationCode: "SDMS"
// //       });
      
// //       if (Array.isArray(templateResponse) && templateResponse.length > 0) {
// //         const templates = templateResponse
// //           .map(template => ({
// //             value: String(template.sTemplateID || '').trim(),
// //             label: String(template.sTemplateName || '').trim()
// //           }))
// //           .filter(template => template.value && template.label && template.value !== 'undefined');
        
// //         const order = ['QC', 'Calibration', 'Method Development', 'Project'];
// //         const sortedTemplates = templates.sort((a, b) => {
// //           const labelA = a.label || '';
// //           const labelB = b.label || '';
          
// //           const indexA = order.findIndex(pattern => labelA.includes(pattern));
// //           const indexB = order.findIndex(pattern => labelB.includes(pattern));
          
// //           if (indexA !== -1 && indexB !== -1) {
// //             return indexA - indexB;
// //           }
          
// //           if (indexA !== -1) return -1;
// //           if (indexB !== -1) return 1;
          
// //           return labelA.localeCompare(labelB);
// //         });
        
// //         setTemplateOptions(sortedTemplates);
        
// //         // REMOVED: Do NOT auto-select first template on initial load
// //         // if (!formData.instrument && sortedTemplates.length > 0) {
// //         //   const firstTemplateValue = sortedTemplates[0].value;
// //         //   setFormData(prev => ({ ...prev, template: firstTemplateValue }));
// //         // }
// //       }
      
// //       await loadClients();
// //       initialLoadDoneRef.current = true;
      
// //     } catch (error) {
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };
  
// //   loadData();
// // }, []);

// // useEffect(() => {
// //   if (formData.template && formData.template.trim() !== '' && formData.instrument) {
// //     fetchTags(formData.template, formData.instrument);
// //   } else {
// //     setTags([]);
// //   }
// // }, [formData.template, formData.instrument, fetchTags]);

// //   const handleClientChange = useCallback(async (value) => {
// //     setFormData(prev => ({ ...prev, client: value, instrument: '', path: '', fileName: '', limsOrder: '' }));
// //     setErrors(prev => ({ ...prev, client: false }));
    
// //     setInstrumentOptions([]);
// //     setPathOptions([]);
// //     setLimsOrderOptions([]);
// //     setTags([]);
// //     setTagErrors({});
    
// //     if (value) {
// //       setIsLoading(true);
// //       try {
// //         await loadInstruments(value);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     }
// //   }, [loadInstruments]);

// //   const handleInstrumentChange = useCallback(async (value) => {
// //   setIsLoading(true);
  
// //   setFormData(prev => ({ 
// //     ...prev, 
// //     instrument: value, 
// //     path: '', 
// //     fileName: '', 
// //     limsOrder: '',
// //     limsOrderID: '',
// //     limsSampleID: '',
// //     limsTestCode: '',
// //     limsReplicateID: '',
// //     mergeFileCount: getSessionValue("MergeCount") || '1',
// //     currentFileCount: '0'
// //     // DO NOT clear template here - keep current template
// //   }));
// //   setErrors(prev => ({ ...prev, instrument: false }));
  
// //   setPathOptions([]);
  
// //   // Clear tags when instrument changes (they depend on instrument)
// //   setTags([]);
// //   setTagErrors({});
  
// //   if (value) {
// //     try {
// //       const isInterface = isInterfaceInstrument(value);
      
// //       await loadProtocol(value);
      
// //       if (isInterface) {
// //         const interfaceInstId = value.includes(':') ? 
// //           parseInt(value.split(':')[1].trim()) : 0;
        
// //         if (interfaceInstId > 0) {
// //           await loadLimsOrder(interfaceInstId);
// //         }
// //       } else {
// //         setLimsOrderOptions([]);
// //         setIsLimsOrderEnabled(false);
// //         setFormData(prev => ({ 
// //           ...prev, 
// //           limsOrder: '',
// //           limsOrderID: '',
// //           limsSampleID: '',
// //           limsTestCode: '',
// //           limsReplicateID: ''
// //         }));
// //       }
      
// //       const instrumentData = await onChangeInstrumentCombo(value);
      
// //       if (instrumentData) {
// //         const updates = {};
        
// //         if (instrumentData.nCurMergeFileNo > 0) {
// //           updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
// //         } else {
// //           updates.currentFileCount = '0';
// //         }
        
// //         const lockedMergeCount = getSessionValue("LockedMergeCount");
// //         if (isLocked && lockedMergeCount) {
// //           updates.mergeFileCount = lockedMergeCount;
// //         } else {
// //           updates.mergeFileCount = getSessionValue("MergeCount") || '1';
// //         }
        
// //         // ONLY set template from backend if instrument is locked
// //         if (instrumentData.sTemplateID && instrumentData.sTaskID) {
// //           // Instrument is locked by user, use its template
// //           updates.template = instrumentData.sTemplateID;
// //         }
// //         else if (instrumentData.sLockType === 'A') {
// //           // Auto-locked instrument - use first template
// //           if (templateOptions.length > 0) {
// //             const firstTemplateValue = templateOptions[0].value;
// //             updates.template = firstTemplateValue;
// //           }
// //         }
// //         // DO NOT auto-select first template when instrument is not locked
// //         // Keep whatever template was previously selected (if any)
        
// //         setFormData(prev => ({ ...prev, ...updates }));
        
// //       }
      
// //       await loadPaths(value);
      
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   } else {
// //     setIsLoading(false);
// //   }
// // }, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
// //     isInterfaceInstrument, isLocked, templateOptions, t]);

// //   useEffect(() => {
// //     if (formData.instrument) {
// //       const refreshData = async () => {
// //         try {
// //           setIsLoading(true);
// //           const response = await onChangeInstrumentCombo(formData.instrument);
// //           if (response) {
// //             setFormData(prev => ({
// //               ...prev,
// //               currentFileCount: response.nCurMergeFileNo > 0 ? String(response.nCurMergeFileNo) : '0',
// //               mergeFileCount: response.nMergeFileCount > 0 ? String(response.nMergeFileCount) : getSessionValue("MergeCount") || '1'
// //             }));
// //           }
// //         } catch (error) {
// //           // Silent error handling
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       };
      
// //       refreshData();
// //     }
// //   }, [isLocked, formData.instrument]);

// //   const handlePathChange = useCallback((value) => {
// //     setFormData(prev => ({ ...prev, path: value }));
// //     setErrors(prev => ({ ...prev, path: false }));
// //   }, []);

// // const handleTemplateChange = useCallback((value) => {
// //   // Simply set the template value - don't auto-select first template
// //   setFormData(prev => ({ ...prev, template: value }));
// //   setErrors(prev => ({ ...prev, template: false }));
  
// //   // Clear tags and errors
// //   setTags([]);
// //   setTagErrors({});
// // }, []); // Remove templateOptions dependency

// //   const handleMergeCountChange = useCallback((value) => {
// //     const numValue = parseInt(value) || 0;
    
// //     if (numValue > 10000) {
// //       setFormData(prev => ({ ...prev, mergeFileCount: '10000' }));
// //       setErrors(prev => ({ ...prev, mergeFileCount: t('instrumentlocktag.mergecountexceed') }));
// //       return;
// //     }
    
// //     if (numValue < 1 && value !== '') {
// //       setFormData(prev => ({ ...prev, mergeFileCount: '1' }));
// //     } else {
// //       setFormData(prev => ({ ...prev, mergeFileCount: value }));
// //       setErrors(prev => ({ ...prev, mergeFileCount: '' }));
// //     }
// //   }, [t]);

// //   const validateFormForLock = useCallback(() => {
// //   const newErrors = {};
// //   const newTagErrors = {};
// //   let isValid = true;
  
// //   if (!formData.instrument) {
// //     newErrors.instrument = true;
// //     isValid = false;
// //   }
  
// //   if (!formData.path) {
// //     newErrors.path = true;
// //     isValid = false;
// //   }
  
// //   if (!formData.template || formData.template.trim() === '') {
// //     newErrors.template = true;
// //     isValid = false;
// //   }
  
// //   const isInterface = isInterfaceInstrument(formData.instrument);
  
// //   if (isInterface) {
// //     if (isFileNameEnabled && !formData.fileName) {
// //       newErrors.fileName = true;
// //       isValid = false;
// //     }
    
// //     const mergeNum = parseInt(formData.mergeFileCount) || 0;
// //     const currentNum = parseInt(formData.currentFileCount) || 0;
    
// //     if (mergeNum > 10000) {
// //       newErrors.mergeFileCount = t('instrumentlocktag.mergecountexceed');
// //       isValid = false;
// //     }
    
// //     if (mergeNum < currentNum) {
// //       newErrors.mergeFileCount = t('instrumentlocktag.mergecountnotlessthancurrent', 
// //         { count: formData.currentFileCount });
// //       isValid = false;
// //     }
    
// //     if (isLimsOrderEnabled && !formData.limsOrder) {
// //       newErrors.limsOrder = true;
// //       isValid = false;
// //     }
// //   }
  
// //   for (let i = 0; i < tags.length; i++) {
// //     if (tags[i].required && !tags[i].value) {
// //       newTagErrors[i] = true;
// //       isValid = false;
// //     }
// //   }
  
// //   setErrors(newErrors);
// //   setTagErrors(newTagErrors);
  
// //   return isValid;
// // }, [formData, tags, isFileNameEnabled, isLimsOrderEnabled, isInterfaceInstrument, t]);

// //   const prepareLockData = useCallback((auditData = null, validationType = "CheckAndInsert") => {
// //     const activeUserDetails = getActiveUserDetails();
// //     const isInterface = isInterfaceInstrument(formData.instrument);
    
// //     const instrumentId = (formData.instrument || "").padEnd(10, ' ');
// //     const templateId = (formData.template || '').padEnd(10, ' ');
// //     const userId = (formData.user || activeUserDetails.sUserID || '').padEnd(10, ' ');
    
// //     const lockData = {
// //       sInstrumentName: instrumentOptions.find(i => i.value === formData.instrument)?.label || '',
// //       lockinstdetails: {
// //         sInstrumentID: instrumentId,
// //         sTaskID: formData.path,
// //         sTaskSourcePath: pathOptions.find(p => p.value === formData.path)?.label || '',
// //         sFileName: formData.fileName,
// //         sTemplateID: templateId,
// //         sUserID: userId,
// //         nMergeFileCount: parseInt(formData.mergeFileCount) || 1,
// //         nAutoUnlock: formData.unlockAfterCapture ? 1 : 0,
// //         nInterFaceOrderID: parseInt(formData.interfaceOrderID) || 0,
// //         nProtocolStatus: parseInt(formData.protocolID) || 0,
// //         nLLProStatus: isFileNameEnabled ? 1 : 0,
// //         sScheduleID: pathOptions.find(p => p.value === formData.path)?.originalItem?.L13ScheduleID || ''
// //       },
// //       sTemplateName: templateOptions.find(t => t.value === formData.template)?.label || '',
// //       lInstTagValue: tags.map(tag => ({
// //         L58TagID: tag.tagID,
// //         Value: tag.value || '',
// //         L58ValueStatus: tag.required || false,
// //         L58TagName: tag.tagName,
// //         ValueID: tag.valueID || '',
// //         LoadMasterValue: " ",
// //         L58Order: tag.order || 0
// //       })),
// //       sValidation: validationType,
// //       sSendLabel: isLocked ? t('button.update') : t('button.lock'),
// //       ManualOrder: false,
// //       LIMSobj: null,
// //       ActiveUserDetails: activeUserDetails,
// //       ApplicationCode: "SDMS"
// //     };
    
// //     if (auditData) {
// //       lockData.lockinstdetails.AuditTrailValues = auditData;
// //     }
    
// //     if (isInterface) {
// //       lockData.lockinstdetails.audittrailforinterfaceinstrument = true;
// //     }
    
// //     if (isLimsOrderEnabled && formData.limsOrder) {
// //       const limsOrderItem = limsOrderOptions.find(lo => lo.value === formData.limsOrder);
// //       if (limsOrderItem) {
// //         lockData.ManualOrder = false;
// //         const returnObject = {};
// //         Object.keys(limsOrderItem).forEach(key => {
// //           if (!['uid', 'boundindex', 'uniqueid', 'visibleindex'].includes(key)) {
// //             returnObject[key] = limsOrderItem[key];
// //           }
// //         });
// //         lockData.LIMSobj = returnObject;
// //       }
// //     }
    
// //     const encodeXmlText = (text) => {
// //       if (!text) return '';
// //       return String(text)
// //         .replace(/&/g, '&amp;')
// //         .replace(/</g, '&lt;')
// //         .replace(/>/g, '&gt;')
// //         .replace(/"/g, '&quot;')
// //         .replace(/'/g, '&apos;');
// //     };
    
// //     const templateName = lockData.sTemplateName;
// //     const encodedTemplateName = encodeXmlText(templateName);
    
// //     let xMasterXml = "<Sheet1>";
// //     let xDetailsXml = "<Sheet1>";
    
// //     xMasterXml += "<Row>";
// //     xMasterXml += `<Template>${encodedTemplateName}</Template>`;
    
// //     xDetailsXml += `<Row><Category>Template</Category><Value>${encodedTemplateName}</Value></Row>`;
    
// //     tags.forEach(tag => {
// //       if (tag.value) {
// //         const encodedTagName = encodeXmlText(tag.tagName);
// //         const encodedTagValue = encodeXmlText(tag.value);
        
// //         xMasterXml += `<${encodedTagName}>${encodedTagValue}</${encodedTagName}>`;
// //         xDetailsXml += `<Row><Category>${encodedTagName}</Category><Value>${encodedTagValue}</Value></Row>`;
// //       }
// //     });
    
// //     xMasterXml += "</Row></Sheet1>";
// //     xDetailsXml += "</Sheet1>";
    
// //     lockData.lockinstdetails.xMasterXml = xMasterXml;
// //     lockData.lockinstdetails.xDetailsXml = xDetailsXml;
    
// //     return lockData;
// //   }, [formData, tags, instrumentOptions, pathOptions, templateOptions, 
// //       isFileNameEnabled, isLimsOrderEnabled, isLocked, limsOrderOptions, isInterfaceInstrument, t]);

// //   const performLockAction = useCallback(async (auditData = null, validationType = "CheckAndInsert") => {
// //     try {
// //       const lockData = prepareLockData(auditData, validationType);
      
// //       const isInterface = isInterfaceInstrument(formData.instrument);
// //       if (isInterface && auditData) {
// //         lockData.lockinstdetails.audittrailforinterfaceinstrument = false;
// //       }
      
// //       await performLockActionWithData(lockData);
// //     } catch (error) {
// //       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [formData, tags, prepareLockData, t]);

// //   const performLockActionWithData = async (lockData) => {
// //     try {
// //       setIsSubmitting(true);
// //       const result = await makeAjaxCall(endpoints.lockInstrument, lockData, "LockInstrument");
      
// //       if (result?.oResObj?.bStatus === true) {
// //         const successMessage = result.oResObj.sInformation || t('instrumentlocktag.instrumentlockedsuccessfully');
        
// //         setIsLocked(true);
// //         setIsAutoLocked(false);
// //         setLockedByOtherUser(false);
        
// //         if (result.oResObj.nMergeFileCount) {
// //           setFormData(prev => ({ 
// //             ...prev, 
// //             mergeFileCount: String(result.oResObj.nMergeFileCount) 
// //           }));
// //           setSessionValue("LockedMergeCount", String(result.oResObj.nMergeFileCount));
// //         } else if (result.oResObj.mergeFileCount) {
// //           setFormData(prev => ({ 
// //             ...prev, 
// //             mergeFileCount: String(result.oResObj.mergeFileCount) 
// //           }));
// //           setSessionValue("LockedMergeCount", String(result.oResObj.mergeFileCount));
// //         }
        
// //         const instrumentId = result.oResObj.sInstrumentID || formData.instrument;
        
// //         if (instrumentId) {
// //           const cleanInstrumentId = instrumentId.toString().trim();
// //           navigateAfterLock(cleanInstrumentId);
// //         }
        
// //         showErrorDialogMessage(
// //           `${result.oResObj.sInstrument || t('label.instrument')} ${successMessage}`,
// //           'success'
// //         );
        
// //       } else {
// //         const errorInfo = result?.oResObj?.sInformation;
        
// //         if (errorInfo === "Entering Duplicate Tag Values" || 
// //             (errorInfo === "Tags has already been used. Do you want to re-use same tags for New Data Capture?" && 
// //              result?.oResObj?.sValidation === "CheckAndInsert")) {
// //           showErrorDialogMessage(
// //             t('instrumentlocktag.confirmationtagsalreadyexist'),
// //             'confirmation',
// //             async () => {
// //               lockData.sValidation = "Insert";
// //               lockData.lockinstdetails.sValidation = "Insert";
// //               await performLockActionWithData(lockData);
// //             }
// //           );
// //           return;
// //         }
        
// //         if (errorInfo === "Merge Break") {
// //           showErrorDialogMessage(t('instrumentlocktag.mergebreak'), 'error');
// //         } else if (errorInfo === "This instrument is already locked by other user") {
// //           showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadylockedbyotheruser'), 'error');
// //           setIsLocked(true);
// //           setLockedByOtherUser(true);
// //         } else if (errorInfo === "Merge Count should not be Lesser than Current Parsing Count") {
// //           showErrorDialogMessage(t('instrumentlocktag.mergecountshouldnotbelesserthancurrentparsingcount'), 'error');
// //         } else if (errorInfo) {
// //           showErrorDialogMessage(errorInfo, 'error');
// //         } else {
// //           showErrorDialogMessage(t('instrumentlocktag.failedtolockinstrument'), 'error');
// //         }
// //       }
// //     } catch (error) {
// //       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// // const handleUnlockSuccess = useCallback(async (result) => {
// //   const successMessage = result?.oResObj?.sInformation || t('instrumentlocktag.instrumentunlockedsuccessfully');
// //   const instrumentName = result?.oResObj?.sInstrument || t('label.instrument');
  
// //   setIsLocked(false);
// //   setIsAutoLocked(false);
// //   setLockedByOtherUser(false);
  
// //   const currentTemplate = formData.template;
  
// //   setFormData(prev => ({
// //     ...prev,
// //     fileName: '',
// //     mergeFileCount: getSessionValue("MergeCount") || '1',
// //     currentFileCount: '0',
// //     lockID: '',
// //     interfaceOrderID: '',
// //     unlockAfterCapture: false,
// //     limsOrder: '',
// //     limsOrderID: '',
// //     limsSampleID: '',
// //     limsTestCode: '',
// //     limsReplicateID: '',
// //     template: currentTemplate
// //   }));
  
// //   setErrors({});
// //   setTagErrors({});
  
// //   setTags(prev => prev.map(tag => ({
// //     ...tag,
// //     value: '',
// //     valueID: '',
// //     options: tag.tagID === 1 ? tag.options : []
// //   })));
  
// //   showErrorDialogMessage(
// //     `${instrumentName} ${successMessage}`,
// //     'success'
// //   );
// // }, [t, formData.template]);

// //   const prepareUnlockData = useCallback((auditData = null, mergebreak = "true") => {
// //     const activeUserDetails = getActiveUserDetails();
// //     const pathItem = pathOptions.find(p => p.value === formData.path);
// //     const instrumentItem = instrumentOptions.find(i => i.value === formData.instrument);
// //     const templateItem = templateOptions.find(t => t.value === formData.template);
    
// //     const limsObj = {};
    
// //     const limsOrderVal = formData.limsOrder;
// //     const nOrderID = limsOrderVal === "" ? 0 : parseInt(limsOrderVal) || 0;
// //     limsObj["nOrderID"] = nOrderID;
    
// //     if (isInterfaceInstrument(formData.instrument)) {
// //       if (formData.limsSampleID) limsObj["SampleID"] = formData.limsSampleID;
// //       if (formData.limsTestCode) limsObj["TestCode"] = formData.limsTestCode;
// //       if (formData.limsReplicateID) limsObj["ReplicateID"] = formData.limsReplicateID;
// //     }
    
// //     const unlockObjDet = {
// //       nMergeFileCount: formData.mergeFileCount || "1",
// //       sTaskID: formData.path || "",
// //       nProtocolStatus: parseInt(formData.protocolID) || 0,
// //       sFileName: formData.fileName || "",
// //       sUserID: formData.user || activeUserDetails.sUserID,
// //       nInterFaceOrderID: formData.interfaceOrderID || "",
// //       sTaskSourcePath: pathItem?.label || "",
// //       sInstrumentID: (formData.instrument || "").padEnd(10, ' '),
// //       sScheduleID: pathItem?.originalItem?.L13ScheduleID || "",
// //       sTemplateID: formData.template || ""
// //     };
    
// //     const unlockData = {
// //       sTemplateName: templateItem?.label || "",
// //       unlockObjDet: unlockObjDet,
// //       sInstrumentName: instrumentItem?.label || "",
// //       limsObj: limsObj,
// //       mergebreak: mergebreak,
// //       ActiveUserDetails: activeUserDetails,
// //       ApplicationCode: "SDMS"
// //     };
    
// //     if (auditData) {
// //       unlockData.AuditTrailValues = auditData;
// //     }
    
// //     return unlockData;
// //   }, [formData, instrumentOptions, pathOptions, templateOptions, isInterfaceInstrument]);

// //   const performUnlockAction = useCallback(async (auditData = null, mergebreak = "true") => {
// //     try {
// //       if (!formData.instrument || !formData.path) {
// //         showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
// //         return;
// //       }
      
// //       setIsSubmitting(true);
// //       const unlockData = prepareUnlockData(auditData, mergebreak);
      
// //       const result = await makeAjaxCall(endpoints.unLockInstrument, unlockData, "UnLockInstrument");
      
// //       if (result?.AuditTrailLogin !== undefined && result.AuditTrailLogin === false) {
// //         showErrorDialogMessage(result.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'), 'error');
// //         return;
// //       }
      
// //       if (result?.oResObj?.bForceUnlock === true) {
// //         if (mergebreak === "true") {
// //           setAuditAction('unlock');
// //           setAuditCallback(() => async (forceAuditData) => {
// //             await performUnlockAction(forceAuditData, "false");
// //           });
// //           setShowAuditTrail(true);
// //         } else {
// //           await handleUnlockSuccess(result);
// //         }
// //       } 
// //       else if (result?.oResObj?.bStatus === true) {
// //         await handleUnlockSuccess(result);
// //       } 
// //       else {
// //         showErrorDialogMessage(result?.oResObj?.sInformation || t('instrumentlocktag.failedtounlockinstrument'), 'error');
// //       }
      
// //     } catch (error) {
// //       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [formData, prepareUnlockData, t, handleUnlockSuccess]);

// //   const checkInterfaceConnection = useCallback(async (instrumentId) => {
// //     const isInterface = isInterfaceInstrument(instrumentId);
    
// //     if (!isInterface) {
// //       return { needsCheck: false, isConnected: true };
// //     }
    
// //     const interfaceInstId = instrumentId.includes(':') ? 
// //       parseInt(instrumentId.split(':')[1].trim()) : 0;
    
// //     if (interfaceInstId <= 0) {
// //       return { needsCheck: false, isConnected: true };
// //     }
    
// //     try {
// //       setIsLoading(true);
// //       const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
// //         InterfaceInstID: interfaceInstId
// //       }, "InterfaceConnectionChecking");
      
// //       if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
// //         const accessStatus = connectionResult[0].AccessStatus;
// //         return { 
// //           needsCheck: true, 
// //           isConnected: accessStatus === 1,
// //           data: connectionResult[0]
// //         };
// //       }
// //     } catch (error) {
// //       // Silent error handling
// //     } finally {
// //       setIsLoading(false);
// //     }
    
// //     return { needsCheck: false, isConnected: true };
// //   }, [isInterfaceInstrument, t]);

// //   const handleUnlock = useCallback(async () => {
// //     if (!isLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
// //       return;
// //     }

// //     if (isAutoLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //       return;
// //     }

// //     const validateCurrentLockStatus = async () => {
// //       try {
// //         if (!formData.instrument) return;
        
// //         setIsLoading(true);
// //         const response = await onChangeInstrumentCombo(formData.instrument);
        
// //         if (response) {
// //           if (response.sLockType === 'A') {
// //             setIsAutoLocked(true);
// //             setIsLocked(true);
// //             setLockedByOtherUser(false);
// //             showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //             return false;
// //           } else if (response.sUserID) {
// //             setIsLocked(true);
// //             setIsAutoLocked(false);
            
// //             const activeUserDetails = getActiveUserDetails();
// //             const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
            
// //             if (response.sUserID.trim() === currentUserId) {
// //               setLockedByOtherUser(false);
// //               return true;
// //             } else {
// //               setLockedByOtherUser(true);
// //               showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
// //               return false;
// //             }
// //           } else {
// //             setIsLocked(false);
// //             setIsAutoLocked(false);
// //             setLockedByOtherUser(false);
// //             showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
// //             return false;
// //           }
// //         }
// //         return false;
// //       } catch (error) {
// //         return false;
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     const newErrors = {};
// //     let isValid = true;
    
// //     if (!formData.instrument) {
// //       newErrors.instrument = true;
// //       isValid = false;
// //     }
    
// //     if (!formData.path) {
// //       newErrors.path = true;
// //       isValid = false;
// //     }
    
// //     setErrors(newErrors);
    
// //     if (!isValid) {
// //       showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
// //       return;
// //     }

// //     const canProceedWithUnlock = await validateCurrentLockStatus();
// //     if (!canProceedWithUnlock) {
// //       return;
// //     }

// //     if (lockedByOtherUser) {
// //       const activeUserDetails = getActiveUserDetails();
// //       const isAdmin = activeUserDetails.sUsername === "Administrator" || 
// //                      activeUserDetails.ActiveUserDetails?.sUsername === "Administrator";
      
// //       if (!isAdmin) {
// //         showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
// //         return;
// //       }
// //     }

// //     const scheduleData = getDeactiveScheduleDataRef.current;
// //     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
// //       const hasAuditTrailRights = true;
      
// //       if (hasAuditTrailRights) {
// //         setAuditAction('unlock');
// //         setAuditCallback(() => async (auditData) => {
// //           await performUnlockAction(auditData);
// //         });
// //         setShowAuditTrail(true);
// //         return;
// //       }
// //     }
    
// //     await performUnlockAction();
// //   }, [isLocked, isAutoLocked, lockedByOtherUser, formData.instrument, formData.path, performUnlockAction, onChangeInstrumentCombo, t]);

// //   const handleLock = useCallback(async () => {
// //     if (!validateFormForLock()) {
// //       return;
// //     }
    
// //     if (isAutoLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //       return;
// //     }
    
// //     setIsSubmitting(true);
    
// //     const isInterface = isInterfaceInstrument(formData.instrument);
    
// //     if (isInterface) {
// //       const interfaceInstId = formData.instrument.includes(':') ? 
// //         parseInt(formData.instrument.split(':')[1].trim()) : 0;
      
// //       if (interfaceInstId > 0) {
// //         try {
// //           setIsLoading(true);
// //           const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
// //             InterfaceInstID: interfaceInstId
// //           }, "InterfaceConnectionChecking");
          
// //           if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
// //             const connectionData = connectionResult[0];
            
// //             if (connectionData.AuditTrailLogin === false) {
// //               showErrorDialogMessage(
// //                 connectionData.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'),
// //                 'error'
// //               );
// //               setIsSubmitting(false);
// //               setIsLoading(false);
// //               return;
// //             }
            
// //             const accessStatus = connectionData.AccessStatus;
            
// //             if (accessStatus == 1 || accessStatus === "1") {
// //               // Interface is connected - continue with normal flow
// //             } else {
// //               setIsSubmitting(false);
// //               setIsLoading(false);
// //               showErrorDialogMessage(
// //                 t('instrumentlocktag.interfacerinstrumentisnotconnected'),
// //                 'confirmation',
// //                 async () => {
// //                   setIsSubmitting(true);
// //                   const scheduleData = getDeactiveScheduleDataRef.current;
// //                   if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
// //                     const hasAuditTrailRights = true;
                    
// //                     if (hasAuditTrailRights) {
// //                       setIsSubmitting(false);
// //                       setAuditAction('lock');
// //                       setAuditCallback(() => async (auditData) => {
// //                         await performLockAction(auditData);
// //                       });
// //                       setShowAuditTrail(true);
// //                       return;
// //                     }
// //                   }
                  
// //                   await performLockAction();
// //                 }
// //               );
// //               return;
// //             }
// //           }
// //         } catch (error) {
// //           // Continue with lock even if check fails
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       }
// //     }
    
// //     const scheduleData = getDeactiveScheduleDataRef.current;
// //     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
// //       const hasAuditTrailRights = true;
      
// //       if (hasAuditTrailRights) {
// //         setIsSubmitting(false);
// //         setAuditAction('lock');
// //         setAuditCallback(() => async (auditData) => {
// //           await performLockAction(auditData);
// //         });
// //         setShowAuditTrail(true);
// //         return;
// //       }
// //     }
    
// //     await performLockAction();
// //   }, [validateFormForLock, isAutoLocked, formData.instrument, performLockAction, isInterfaceInstrument, t]);

// //   const handleUpdate = useCallback(async () => {
// //     if (!validateFormForLock()) {
// //       return;
// //     }
    
// //     if (isAutoLocked) {
// //       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
// //       return;
// //     }
    
// //     setIsSubmitting(true);
// //     await performLockAction();
// //   }, [validateFormForLock, isAutoLocked, performLockAction]);

// //   const handleFormChange = useCallback((field, value) => {
// //     setFormData(prev => ({ ...prev, [field]: value }));
// //     setErrors(prev => ({ ...prev, [field]: false }));
// //   }, []);

// //   const getFieldDisabledState = useMemo(() => {
// //     if (isAutoLocked) {
// //       return {
// //         client: false,
// //         instrument: false,
// //         path: false,
// //         limsOrder: true,
// //         fileName: true,
// //         template: false,
// //         mergeCount: true,
// //         unlockCheckbox: true,
// //         tags: false,
// //         lockButton: true,
// //         unlockButton: true
// //       };
// //     }
    
// //     if (isLocked && !lockedByOtherUser) {
// //       return {
// //         client: false,
// //         instrument: false,
// //         path: true,
// //         limsOrder: false,
// //         fileName: false,
// //         template: true,
// //         mergeCount: false,
// //         unlockCheckbox: false,
// //         tags: false,
// //         lockButton: false,
// //         unlockButton: false
// //       };
// //     }
    
// //     if (isLocked && lockedByOtherUser) {
// //       return {
// //         client: false,
// //         instrument: false,
// //         path: true,
// //         limsOrder: false,
// //         fileName: true,
// //         template: true,
// //         mergeCount: true,
// //         unlockCheckbox: true,
// //         tags: true,
// //         lockButton: true,
// //         unlockButton: false
// //       };
// //     }
    
// //     return {
// //       client: false,
// //       instrument: false,
// //       path: false,
// //       limsOrder: false,
// //       fileName: false,
// //       template: false,
// //       mergeCount: false,
// //       unlockCheckbox: false,
// //       tags: false,
// //       lockButton: false,
// //       unlockButton: true
// //     };
// //   }, [isLocked, lockedByOtherUser, isAutoLocked]);

// //   return (
// //     <div >
// //       <FullPageLoader loading={showFullPageLoader} text={
// //         isSubmitting ? t('common.loading') :
// //         t('common.loading')
// //       } />
      
// //       <div className="bg-white px-4 py-4">
// //         <div className="max-w-[1100px]">
// //           <div className="grid grid-cols-2">
// //             <div className="max-w-[400px]">
// //               <div className="mb-7">
// //                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                   {t('label.client')}
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.client}
// //                     onChange={(e) => handleClientChange(e.target.value)}
// //                     disabled={getFieldDisabledState.client || isLoading}
// //                     options={clientOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     showError={errors.client}
// //                     className="text-xs"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mb-5">
// //                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                   {t('label.instrument')} <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.instrument}
// //                     onChange={(e) => handleInstrumentChange(e.target.value)}
// //                     disabled={getFieldDisabledState.instrument || isLoading}
// //                     options={instrumentOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     showError={errors.instrument}
// //                     className="text-xs"
// //                   />
// //                 </div>
// //                 {isAutoLocked && (
// //                   <div className="mt-0 text-sm bg-[#d9534f] font-roboto text-white">
// //                     {t('instrumentlocktag.thisinstrumentisalreadyautolocked')}
// //                   </div>
// //                 )}
// //               </div>

// //               <div className="mb-7">
// //                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                   {t('instrumentlocktag.path')} <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.path}
// //                     onChange={(e) => handlePathChange(e.target.value)}
// //                     disabled={getFieldDisabledState.path || isLoading}
// //                     options={pathOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     showError={errors.path}
// //                     className="text-xs"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mb-7">
// //                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
// //                   {t('instrumentlocktag.limsorder')}
// //                 </label>
// //                 <div className="relative">
// //                   <AnimatedDropdown
// //                     value={formData.limsOrder}
// //                     onChange={(e) => {
// //                       const selectedValue = e.target.value;
// //                       const selectedOrder = limsOrderOptions.find(order => order.value === selectedValue);
                      
// //                       setFormData(prev => ({
// //                         ...prev,
// //                         limsOrder: selectedValue,
// //                         limsOrderID: selectedValue,
// //                         limsSampleID: selectedOrder?.sampleID || '',
// //                         limsTestCode: selectedOrder?.testCode || '',
// //                         limsReplicateID: selectedOrder?.replicateID || ''
// //                       }));
// //                     }}
// //                     disabled={!isLimsOrderEnabled || getFieldDisabledState.limsOrder || isLoading}
// //                     options={limsOrderOptions}
// //                     displayKey="label"
// //                     valueKey="value"
// //                     allowFreeInput
// //                     className="text-xs flex-1"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mb-7">
// //                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
// //                   {t('instrumentlocktag.filename')} {isFileNameEnabled && <span className="text-red-500">*</span>}
// //                 </label>
// //                 <input
// //                   type="text"
// //                   value={formData.fileName}
// //                   onChange={(e) => handleFormChange('fileName', e.target.value)}
// //                   disabled={!isFileNameEnabled || getFieldDisabledState.fileName || isLoading}
// //                   className={`w-full h-7 px-0 text-xs bg-[#f3f3f3] border-0 border-b-2 outline-none font-semibold font-['verdana']
// //                     ${errors.fileName ? 'border-red-400 text-[#A94442]' : 'border-gray-300 text-[#373737]'}`}
// //                 />
// //               </div>

// //               {showMergeFields && (
// //                 <MergeFileCountRow
// //                   mergeCount={formData.mergeFileCount}
// //                   currentCount={formData.currentFileCount}
// //                   onMergeChange={handleMergeCountChange}
// //                   disabled={!isInstrumentInterface || getFieldDisabledState.mergeCount || isLoading}
// //                   showMergeFields={showMergeFields}
// //                   t={t}
// //                 />
// //               )}

// //               {showUnlockOption && (
// //                 <div className="flex items-center mb-3 gap-4">
// //                   <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
// //                     {t('instrumentlocktag.unlockaftercapture')}
// //                   </label>
// //                   <input
// //                     type="checkbox"
// //                     checked={formData.unlockAfterCapture}
// //                     onChange={(e) => handleFormChange('unlockAfterCapture', e.target.checked)}
// //                     disabled={getFieldDisabledState.unlockCheckbox || isLoading}
// //                     className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
// //                   />
// //                 </div>
// //               )}
// //             </div>

// //             <div className='max-w-[1300px]'>
// //               <div className="max-w-[350px]">
// //                 <div className="mb-7">
// //                   <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
// //                     {t('instrumentlocktag.template')} <span className="text-red-500">*</span>
// //                   </label>
// //                   <div className="relative">
// //                     <AnimatedDropdown
// //                       value={formData.template}
// //                       onChange={(e) => handleTemplateChange(e.target.value)}
// //                       disabled={getFieldDisabledState.template || isLoading}
// //                       options={templateOptions}
// //                       displayKey="label"
// //                       valueKey="value"
// //                       allowFreeInput
// //                       showError={errors.template}
// //                       className="text-xs"
// //                     />
// //                   </div>
// //                 </div>
// //               </div>
              
// //               <div className="mt-7 max-w-[1300px]">
// //                 <div className="max-w-[550px]">
// //                   <TagGrid
// //                     tags={tags}
// //                     onTagValueClick={handleTagValueClick}
// //                     onTagEditRequest={handleTagEditRequest}
// //                     onInlineEditSubmit={handleInlineEditSubmit}
// //                     isLoadingTags={isLoadingTags}
// //                     isLocked={isLocked}
// //                     lockedByOtherUser={lockedByOtherUser}
// //                     isAutoLocked={isAutoLocked}
// //                     t={t}
// //                     tagErrors={tagErrors}
// //                   />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
      
// //       <div className="flex justify-end gap-2 ml-4 mr-4 mt-3 pt-5 border-t border-gray-200">
// //   <button
// //     onClick={isLocked && !lockedByOtherUser && !isAutoLocked ? handleUpdate : handleLock}
// //     disabled={getFieldDisabledState.lockButton || showFullPageLoader}
// //     className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
// //       ${getFieldDisabledState.lockButton || showFullPageLoader
// //         ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
// //         : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
// //     `}
// //   >
// //     {isLocked && !lockedByOtherUser && !isAutoLocked ? <UpdateIcon /> : <LockIcon />}
// //     <span>
// //       {isLocked && !lockedByOtherUser && !isAutoLocked ? t('button.update') : t('button.lock')}
// //     </span>
// //   </button>

// //   <button
// //     onClick={handleUnlock}
// //     disabled={getFieldDisabledState.unlockButton || showFullPageLoader}
// //     className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
// //       ${getFieldDisabledState.unlockButton || showFullPageLoader
// //         ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
// //         : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
// //     `}
// //   >
// //     <UnlockIcon />
// //     <span>{t('button.unlock')}</span>
// //   </button>
// // </div>

// //       <AuditTrail
// //         isOpen={showAuditTrail}
// //         onClose={() => setShowAuditTrail(false)}
// //         onAuthorized={(auditData) => {
// //           setShowAuditTrail(false);
// //           if (auditCallback) {
// //             auditCallback(auditData);
// //           }
// //           setAuditAction(null);
// //           setAuditCallback(null);
// //         }}
// //         actionLabel={auditAction === 'lock' ? t('button.lock') : 
// //                     auditAction === 'unlock' ? t('button.unlock') : 
// //                     t('button.update')}
// //         defaultReason={auditAction === 'lock' ? t('instrumentlocktag.instrumentlocked') : 
// //                       auditAction === 'unlock' ? t('instrumentlocktag.instrumentunlocked') : 
// //                       t('instrumentlocktag.instrumentupdated')}
// //         disableReason={false}
// //       />

// //       {showErrorDialog && (
// //         <Errordialog
// //           message={errorDialogMessage}
// //           type={errorDialogType}
// //           onClose={handleErrorDialogClose}
// //           showCancel={errorDialogType === 'confirmation'}
// //           onCancel={handleErrorDialogClose}
// //           onConfirm={errorDialogType === 'confirmation' ? handleErrorDialogConfirm : undefined}
// //           cancelText={t('button.cancel')}
// //           okText={t('button.ok')}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default InstrumentLockTag;














// import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// import { useTranslation } from 'react-i18next';
// import AuditTrail from '../../../../Layout/Common/AuditTrail';
// import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
// import servicecall from '../../../../../Services/servicecall';
// import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
// import { useInstrumentLock } from '../../../../../Context/InstrumentLockContext';
// import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';


// const LockIcon = () => (
//   <i className="fa fa-lock text-xs mr-1"></i>
// );

// const UnlockIcon = () => (
//   <i className="fa fa-unlock text-xs mr-1"></i>
// );

// const UpdateIcon = () => (
//   <i className="fa fa-pencil-square-o text-xs mr-1"></i>
// );

// const EditPencilIcon = () => (
//   <i className="fa fa-pencil text-xl mr-0.5"></i>
// );

// const MergeFileCountRow = ({ mergeCount, currentCount, onMergeChange, disabled, showMergeFields, t }) => {
//   if (!showMergeFields) return null;
  
//   const handleChange = (e) => {
//     const value = e.target.value;
//     if (value === '' || /^\d+$/.test(value)) {
//       const numValue = parseInt(value) || 0;
//       if (numValue > 10000) {
//         onMergeChange("10000");
//       } else {
//         onMergeChange(value);
//       }
//     }
//   };
  
//   return (
//     <div className="mb-6 mt-7">
//       <div className="flex items-center gap-6">
//         <div className="flex items-center gap-2">
//           <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
//             {t('instrumentlocktag.mergefilecount')}
//           </label>
//           <input
//             type="text"
//             value={mergeCount}
//             onChange={handleChange}
//             onBlur={(e) => {
//               if (e.target.value === '' || parseInt(e.target.value) < 1) {
//                 onMergeChange("1");
//               }
//             }}
//             disabled={disabled}
//             className="w-16 h-7 px-2 text-xs text-center font-['verdana'] border border-gray-300 rounded bg-white hover:border-gray-400 text-[#405F7D]"
//           />
//         </div>
        
//         <div className="flex items-center gap-2">
//           <label className="text-xs text-[#405F7D] min-w-[150px] font-semibold font-roboto">
//             {t('instrumentlocktag.currentuploadfilecount')}
//           </label>
//           <input
//             type="text"
//             value={currentCount}
//             disabled={true}
//             className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-[#405F7D] font-verdana"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const InlineEditIcon = () => (
//   <i className="fa fa-edit text-lg mr-1"></i>
// );

// const TagGrid = React.memo(({ tags, onTagValueClick, isLoadingTags, isLocked, lockedByOtherUser, isAutoLocked, onTagEditRequest, onInlineEditSubmit, t, tagErrors }) => {
//   const [tooltipState, setTooltipState] = useState({
//     isOpen: false,
//     tagIndex: null,
//     position: { top: 0, left: 0 },
//     searchTerm: '',
//     selectedValue: '',
//     selectedValueID: '',
//     options: []
//   });

//   const [selectedTagIndex, setSelectedTagIndex] = useState(null);
//   const [showErrorDialog, setShowErrorDialog] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
//   const [inlineEditState, setInlineEditState] = useState({
//     isEditing: false,
//     tagIndex: null,
//     inputValue: ''
//   });

//   const showInformationMessage = (message) => {
//     setErrorMessage(message);
//     setShowErrorDialog(true);
//   };

//   const canEditTag = useCallback((tagIndex) => {
//     if (tagIndex === 0) return true;
//     for (let i = 0; i < tagIndex; i++) {
//       if (!tags[i]?.value) return false;
//     }
//     return true;
//   }, [tags]);

//   const getErrorMessage = useCallback((tagIndex) => {
//     for (let i = tagIndex - 1; i >= 0; i--) {
//       if (!tags[i]?.value) {
//         return `${t('instrumentlocktag.pleaseselect')} ${tags[i]?.tagName} ${t('instrumentlocktag.value').toLowerCase()} first`;
//       }
//     }
//     return `${t('instrumentlocktag.pleaseselect')} required ${t('instrumentlocktag.value').toLowerCase()} first`;
//   }, [tags, t]);

//   const handleEditClick = async (tag, index, event) => {
//     event.stopPropagation();
    
//     const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
//     if (shouldDisableEdit) return;
    
//     if (tag.required && tag.tagID !== 0) {
//       if (!canEditTag(index)) {
//         showInformationMessage(getErrorMessage(index));
//         return;
//       }
      
//       const calculateTooltipPositionFromRect = (buttonRect) => {
//         const viewportHeight = window.innerHeight;
//         const viewportWidth = window.innerWidth;
//         const tooltipWidth = 250;
//         const tooltipHeight = 220;
        
//         let left = buttonRect.left - tooltipWidth + 0;
//         let top = buttonRect.top - (tooltipHeight) + 10;
        
//         if (top < 10) top = 10;
//         if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
//         if (left < 10) left = buttonRect.right + 10;
//         if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
        
//         return { top, left };
//       };
      
//       const buttonRect = event.currentTarget.getBoundingClientRect();
//       const position = calculateTooltipPositionFromRect(buttonRect);
      
//       setSelectedTagIndex(index);
      
//       if (tag.options && tag.options.length > 0) {
//         setTooltipState({
//           isOpen: true,
//           tagIndex: index,
//           position,
//           searchTerm: '',
//           selectedValue: tag.value || '',
//           selectedValueID: tag.valueID || '',
//           options: tag.options
//         });
//         return;
//       }
      
//       setIsLoadingOptions(true);
      
//       try {
//         const options = await onTagEditRequest(index);
        
//         setTooltipState({
//           isOpen: true,
//           tagIndex: index,
//           position,
//           searchTerm: '',
//           selectedValue: tag.value || '',
//           selectedValueID: tag.valueID || '',
//           options: options || []
//         });
//       } catch (error) {
//         showInformationMessage(t('instrumentlocktag.failedtoloadoptions'));
//       } finally {
//         setIsLoadingOptions(false);
//       }
//     } else {
//       setInlineEditState({
//         isEditing: true,
//         tagIndex: index,
//         inputValue: tag.value || ''
//       });
//     }
//   };

//   const handleInlineEditSubmit = () => {
//     if (inlineEditState.tagIndex !== null && inlineEditState.inputValue !== undefined) {
//       onInlineEditSubmit(
//         inlineEditState.tagIndex,
//         inlineEditState.inputValue,
//         inlineEditState.inputValue
//       );
//     }
//     setInlineEditState({
//       isEditing: false,
//       tagIndex: null,
//       inputValue: ''
//     });
//   };

//   const handleInlineEditCancel = () => {
//     setInlineEditState({
//       isEditing: false,
//       tagIndex: null,
//       inputValue: ''
//     });
//   };

//   const handleTooltipSubmit = () => {
//     if (tooltipState.tagIndex !== null) {
//       onTagValueClick(
//         tooltipState.tagIndex, 
//         tooltipState.selectedValue || '',
//         tooltipState.selectedValueID || ''
//       );
//     }
//     setTooltipState({
//       isOpen: false,
//       tagIndex: null,
//       position: { top: 0, left: 0 },
//       searchTerm: '',
//       selectedValue: '',
//       selectedValueID: '',
//       options: []
//     });
//   };

//   const handleTooltipClose = () => {
//     setTooltipState({
//       isOpen: false,
//       tagIndex: null,
//       position: { top: 0, left: 0 },
//       searchTerm: '',
//       selectedValue: '',
//       selectedValueID: '',
//       options: []
//     });
//   };

//   const handleOptionClick = (optionValue, optionValueID) => {
//     setTooltipState(prev => ({
//       ...prev,
//       selectedValue: optionValue,
//       selectedValueID: optionValueID
//     }));
//   };

//   const handleSearchChange = (value) => {
//     setTooltipState(prev => ({
//       ...prev,
//       searchTerm: value
//     }));
//   };

//   const filteredOptions = tooltipState.options.filter(opt => 
//     opt.label.toLowerCase().includes(tooltipState.searchTerm.toLowerCase())
//   );

//   if (isLoadingTags) {
//     return (
//       <div className="border border-[#f3f3f3] rounded relative">
//         <div className="flex justify-center items-center h-[250px]">
//           <div className="text-sm text-gray-500">{t('common.loading')}...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="border border-[#f3f3f3] rounded relative">
//         <div className="grid grid-cols-2 bg-[#fbfbfb] border-b border-[#f3f3f3]">
//           <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
//             {t('instrumentlocktag.tagName')}
//           </div>
//           <div className="px-1 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
//             {t('instrumentlocktag.tagValue')}
//           </div>
//         </div>
        
//         <div className="bg-white min-h-[250px]">
//           {tags.length === 0 ? (
//             <div className="px-4 py-12 text-center text-xs text-[#4b4b4b] font-roboto">            
//               {t('instrumentlocktag.noTagValue')}
//             </div>
//           ) : (
//             tags.map((tag, idx) => {
//               const isSelected = selectedTagIndex === idx;
//               const isThisTagLoading = isLoadingOptions && isSelected;
//               const isInlineEditing = inlineEditState.isEditing && inlineEditState.tagIndex === idx;
//               const hasError = tagErrors[idx] && tag.required && !tag.value;
              
//               const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
//               const isDropdownMode = tag.required && tag.tagID !== 0;
//               const showEditIcon = tag.editable && !shouldDisableEdit;
              
//               return (
//                 <div 
//                   key={`tag-${idx}-${tag.tagID}`}
//                   className={`grid grid-cols-2 border-b border-[#e7e6e6] last:border-b-1 min-h-[40px]
//                     ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#378cfc]' : 'bg-white border-l-4 border-l-transparent'}
//                     ${hasError ? 'border-b-2 border-b-red-400' : ''}
//                     ${tag.editable && !shouldDisableEdit ? 'cursor-pointer hover:bg-[#eef2f9]' : 'cursor-default'}
//                   `}
//                   onClick={() => setSelectedTagIndex(idx)}
//                 >
//                   <div className={`px-4 text-xs flex items-center font-['verdana']
//                     ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
//                   `}>
//                     {tag.tagName}
//                     {tag.required && <span className="text-red-500 ml-1">*</span>}
//                   </div>
                  
//                   <div className="px-0.5 py-0 text-xs flex items-center justify-between gap-0">
//                     {isInlineEditing ? (
//                       <div className="flex-1 flex items-center">
//                         <input
//                           type="text"
//                           value={inlineEditState.inputValue}
//                           onChange={(e) => setInlineEditState(prev => ({
//                             ...prev,
//                             inputValue: e.target.value
//                           }))}
//                           className={`w-full h-9 px-0.5 text-xs font-bold border border-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:border-white
//                             ${hasError ? 'border-red-400' : ''}`}
//                           autoFocus
//                           onBlur={handleInlineEditSubmit}
//                           onKeyDown={(e) => {
//                             if (e.key === 'Enter') {
//                               handleInlineEditSubmit();
//                             } else if (e.key === 'Escape') {
//                               handleInlineEditCancel();
//                             }
//                           }}
//                         />
//                       </div>
//                     ) : (
//                       <>
//                         <span className={`flex-1 font-['verdana'] ${
//                           isSelected ? 'font-bold' : ''
//                         } text-[#373737]`}>
//                           {tag.value || ''}
//                           {isThisTagLoading && (
//                             <span className="ml-2 text-xs text-gray-500">{t('common.loading')}...</span>
//                           )}
//                         </span>
                        
//                         {showEditIcon && (
//                           <button
//                             onClick={(e) => {
//                               setSelectedTagIndex(idx);
//                               handleEditClick(tag, idx, e);
//                             }}
//                             className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool"
//                             title={t('button.edit')}
//                             disabled={isThisTagLoading}
//                           >
//                             {isDropdownMode ? (
//                               <EditPencilIcon />
//                             ) : (
//                               <InlineEditIcon />
//                             )}
//                           </button>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {showErrorDialog && (
//         <Errordialog
//           message={errorMessage}
//           type="information"
//           onClose={() => setShowErrorDialog(false)}
//           okText={t('button.ok')}
//         />
//       )}

//       {tooltipState.isOpen && (
//         <div 
//           className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col"
//           style={{
//             top: `${tooltipState.position.top}px`,
//             left: `${tooltipState.position.left}px`,
//           }}
//         >
//           <div className="p-0.5 border-gray-200">
//             <div className="mb-0">
//               <input
//                 type="text"
//                 value={tooltipState.searchTerm}
//                 onChange={(e) => handleSearchChange(e.target.value)}
//                 className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
//                 autoFocus
//                 placeholder={t('instrumentlocktag.searchplaceholder')}
//               />
//             </div>
//           </div>
          
//           <div className="flex-1 overflow-y-auto min-h-0">
//             {filteredOptions.length === 0 ? (
//               <div className="text-center py-6 text-xs text-gray-500 font-roboto">
//                 {t('instrumentlocktag.nooptionsfound')}
//               </div>
//             ) : (
//               filteredOptions.map((option, idx) => {
//                 const isSelected = tooltipState.selectedValue === option.label && 
//                                    tooltipState.selectedValueID === option.value;
                
//                 return (
//                   <div
//                     key={`option-${idx}-${option.value}`}
//                     onClick={() => handleOptionClick(option.label, option.value)}
//                     onDoubleClick={handleTooltipSubmit}
//                     className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
//                       ${isSelected ? 'bg-[#f2f2f2]' : ''}
//                       ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
//                     `}
//                   >
//                     <div className="flex items-center ml-1">
//                       <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
//                         {option.label}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
          
//           <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
//             <button
//               onClick={handleTooltipSubmit}
//               className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
//             >
//               <i className="fa fa-check-square-o mr-1"></i>
//               {t('button.submit')}
//             </button>
//             <button
//               onClick={handleTooltipClose}
//               className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
//             >
//               <i className="fa fa-times mr-1"></i>
//               {t('button.cancel')}
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// });

// TagGrid.displayName = 'TagGrid';

// const InstrumentLockTag = ({ scheduleData, navigationData, onNavigateToMyInstruments,
//   onClearNavigation }) => {
  
//   // Add these at the top of your component, after useTranslation:
//   const { t } = useTranslation();
//   const { postData } = servicecall();
//   // Add this line:
//   // const { getSubmissionData, clearNavigation } = useSchedulerNavigation();
//   const { navigateAfterLock } = useInstrumentLock();
  
//   const endpoints = {
//     lockTemplateCombo: "InstrumentLock/LockTemplateCombo",
//     loadTagCategory: "InstrumentLock/LoadTagCategory",
//     clientLockCombo: "InstrumentLock/clientlockcombo",
//     lockInstrumentCombo: "InstrumentLock/LockInstrumentCombo",
//     lockPathCombo: "InstrumentLock/LockPathCombo",
//     loadCategoryTagValueAndID: "InstrumentLock/LoadCategoryTagValueAndID",
//     lockUserCombo: "InstrumentLock/LockUserCombo", 
//     mergeFileAndAutoUnlock: "InstrumentLock/MergeFileAndAutounlock",
//     loadProtocol: "InstrumentLock/LoadProtocol",
//     lockLimsordercombo: "InstrumentLock/lockLimsordercombo",
//     onChangeInstrumentCombo: "InstrumentLock/OnChangeInstrumentCombo",
//     lockActiveParsingInstrumentCombo: "InstrumentLock/LockActiveParsingInstrumentCombo",
//     lockDeactiveParsingInstrumentCombo: "InstrumentLock/LockDeactiveParsingInstrumentCombo",
//     lockActiveInstrumentPathCombo: "InstrumentLock/LockActiveInstrumentPathCombo",
//     lockDeactiveInstrumentPathCombo: "InstrumentLock/LockDeactiveInstrumentPathCombo",
//     interfaceConnectionChecking: "InstrumentLock/InterfaceConnectionChecking",
//     lockInstrument: "InstrumentLock/LockInstrument",
//     unLockInstrument: "InstrumentLock/UnLockInstrument"
//   };

//   const [showErrorDialog, setShowErrorDialog] = useState(false);
//   const [errorDialogMessage, setErrorDialogMessage] = useState('');
//   const [errorDialogType, setErrorDialogType] = useState('information');
//   const [errorDialogCallback, setErrorDialogCallback] = useState(null);
//   // Add these to your existing state declarations:
// const [isLoadingFromNavigation, setIsLoadingFromNavigation] = useState(false);
// const [isLoadingFromScheduler, setIsLoadingFromScheduler] = useState(false);
// const [hasLoadedFromNavigation, setHasLoadedFromNavigation] = useState(false);

//   const showErrorDialogMessage = (message, type = 'information', onConfirm = null) => {
//     if (type === 'confirmation' && onConfirm) {
//       setErrorDialogMessage(message);
//       setErrorDialogType('confirmation');
//       setErrorDialogCallback(() => onConfirm);
//       setShowErrorDialog(true);
//     } else {
//       setErrorDialogMessage(message);
//       setErrorDialogType(type);
//       setErrorDialogCallback(null);
//       setShowErrorDialog(true);
//     }
//   };

//   const handleErrorDialogClose = () => {
//     setShowErrorDialog(false);
//     setErrorDialogCallback(null);
//   };

//   const handleErrorDialogConfirm = () => {
//     if (errorDialogCallback) {
//       errorDialogCallback();
//     }
//     setShowErrorDialog(false);
//     setErrorDialogCallback(null);
//   };

//   const getActiveUserDetails = useCallback(() => {
//     const userDetails = CF_activeUserdetails();
//     return {
//       ...userDetails.ActiveUserDetails,
//       sUserID: userDetails.ActiveUserDetails?.sUserID || userDetails.sUserID,
//       sUsername: userDetails.ActiveUserDetails?.sUsername || userDetails.sUsername
//     };
//   }, []);

//   const getSessionValue = (key) => {
//     try {
//       const value = sessionStorage.getItem(key);
//       if (value === null) {
//         switch(key) {
//           case 'MergeCount': return '1';
//           case 'FileName': return 'false';
//           case 'L11ParserType': return '0';
//           default: return "";
//         }
//       }
//       return value;
//     } catch {
//       return "";
//     }
//   };

//   const setSessionValue = (key, value) => {
//     try {
//       sessionStorage.setItem(key, value);
//     } catch (error) {
//       // Silent error handling
//     }
//   };

//   const makeAjaxCall = async (url, passObjDet, process) => {
//     try {
//       const userDetails = CF_activeUserdetails();
      
//       let requestBody;
      
//       if (url === endpoints.loadCategoryTagValueAndID) {
//         requestBody = {
//           passObjDet: passObjDet,
//           ActiveUserDetails: userDetails.ActiveUserDetails,
//           ApplicationCode: userDetails.ApplicationCode
//         };
//       } else {
//         requestBody = {
//           ...passObjDet,
//           ActiveUserDetails: userDetails.ActiveUserDetails,
//           ApplicationCode: userDetails.ApplicationCode
//         };
//       }
      
//       const response = await postData(url, requestBody);
        
//       if (!response) {
//         return null;
//       }
      
//       if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
//         throw new Error(response.Message || response.ErrorMessage || `${t('Auditpopup.somethingwentwrong')} ${url}`);
//       }
      
//       if (process === "InterfaceConnectionChecking") {
//         let formattedResponse;
        
//         if (response.AuditTrailLogin !== undefined) {
//           return [response];
//         }
        
//         if (Array.isArray(response)) {
//           formattedResponse = response;
//         } else if (response && typeof response === 'object') {
//           if (response.AccessStatus !== undefined) {
//             formattedResponse = [response];
//           } else if (response[0] && response[0].AccessStatus !== undefined) {
//             formattedResponse = Object.values(response);
//           } else {
//             formattedResponse = [response];
//           }
//         } else {
//           formattedResponse = [];
//         }
        
//         return formattedResponse;
//       }
      
//       if (process === "LockInstrument" || process === "UnLockInstrument") {
//         return response;
//       }
      
//       if (process === "SelectPathFileUSerTemplate") {
//         return response.oResInstChange || response;
//       }
      
//       if (response.oResObj !== undefined) {
//         return response.oResObj;
//       }
      
//       if (response.oResInstChange !== undefined) {
//         return response.oResInstChange;
//       }
      
//       if (response.list !== undefined) {
//         return response.list;
//       }
      
//       if (Array.isArray(response)) {
//         return response;
//       }
      
//       return response;
      
//     } catch (error) {
//       throw error;
//     }
//   };

//   const getDeactiveScheduleDataRef = useRef(scheduleData);
//   const initialLoadDoneRef = useRef(false);

//   const [formData, setFormData] = useState({
//     client: '',
//     instrument: '',
//     path: '',
//     limsOrder: '',
//     fileName: '',
//     template: '',
//     mergeFileCount: '1',
//     currentFileCount: '0',
//     unlockAfterCapture: false,
//     user: '',
//     lockID: '',
//     interfaceOrderID: '',
//     protocolID: '0'
//   });

//   const [errors, setErrors] = useState({});
//   const [tagErrors, setTagErrors] = useState({});
//   const [isLocked, setIsLocked] = useState(false);
//   const [showMergeFields, setShowMergeFields] = useState(false);
//   const [showUnlockOption, setShowUnlockOption] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingTags, setIsLoadingTags] = useState(false);
//   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
//   const [isInstrumentInterface, setIsInstrumentInterface] = useState(false);
//   const [isFileNameEnabled, setIsFileNameEnabled] = useState(false);
//   const [isLimsOrderEnabled, setIsLimsOrderEnabled] = useState(false);
//   const [lockedByOtherUser, setLockedByOtherUser] = useState(false);
//   const [isAutoLocked, setIsAutoLocked] = useState(false);
//   const [deviceType, setDeviceType] = useState('desktop');
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   const [showAuditTrail, setShowAuditTrail] = useState(false);
//   const [auditAction, setAuditAction] = useState(null);
//   const [auditCallback, setAuditCallback] = useState(null);

//   const [templateOptions, setTemplateOptions] = useState([]);
//   const [clientOptions, setClientOptions] = useState([]);
//   const [instrumentOptions, setInstrumentOptions] = useState([]);
//   const [pathOptions, setPathOptions] = useState([]);
//   const [limsOrderOptions, setLimsOrderOptions] = useState([]);
//   const [userOptions, setUserOptions] = useState([]);
//   const [tags, setTags] = useState([]);

//   const tagIdToNameMap = {
//     1: "Sample",
//     2: "Test", 
//     3: "Project",
//     4: "BatchNo"
//   };
// // Add this useEffect after your existing useEffect hooks:
// useEffect(() => {
//   console.log('🔍 InstrumentLockTag navigation effect triggered');

//   // Check for navigation data
//   const navData = navigationData?.data;
//   console.log('📦 Navigation data structure:', {
//     hasData: !!navData,
//     isFromScheduler: navData?.fromScheduler,
//     directFromScheduler: navData?.data?.fromScheduler,
//     rawData: navigationData
//   });

//   // Handle both possible data structures
//   const schedulerData = navData?.fromScheduler ? navData : navData?.data;

//   if (schedulerData?.fromScheduler) {
//     console.log('✅ Valid scheduler data detected:', schedulerData);
//     handleSchedulerNavigation(schedulerData);
//   }
// }, [navigationData]);



// const loadSpecificPathForScheduler = async (sourcePath) => {
//     try {
//         console.log('🛣️ Loading specific path for scheduler:', sourcePath);
        
//         // Call your path loading endpoint
//         const response = await makeAjaxCall(endpoints.lockPathCombo, {
//             sInstrumentID: formData.instrument,
//             sScheduleID: "",
//             sClientID: formData.client
//         });

//         if (Array.isArray(response) && response.length > 0) {
//             const pathOptionsData = response.map(path => ({
//                 value: path.sTaskID || '',
//                 label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
//                 originalItem: path
//             }));

//             setPathOptions(pathOptionsData);
            
//             // Find and select the path that matches the scheduler's source path
//             const targetPath = pathOptionsData.find(p => 
//                 p.label === sourcePath || 
//                 p.originalItem?.sTaskSourcePath === sourcePath
//             );
            
//             if (targetPath) {
//                 console.log('✅ Setting scheduler path:', targetPath.value);
//                 setFormData(prev => ({
//                     ...prev,
//                     path: targetPath.value
//                 }));
//             } else if (pathOptionsData.length > 0) {
//                 // Fallback to first path
//                 console.log('📌 Using first available path as fallback');
//                 setFormData(prev => ({
//                     ...prev,
//                     path: pathOptionsData[0].value
//                 }));
//             }
//         }
//     } catch (error) {
//         console.error('Error loading specific path:', error);
//     }
// };
// // Add this function after your other handler functions:
// // In InstrumentLocksandTags.jsx, replace the entire handleSchedulerNavigation function:

// const handleSchedulerNavigation = async (data) => {
//   console.log('🚀 Processing scheduler navigation with FULL DATA:', data);
  
//   setIsLoadingFromScheduler(true);
  
//   try {
//     // Store scheduler data
//     sessionStorage.setItem('fromScheduler', 'true');
//     sessionStorage.setItem('schedulerData', JSON.stringify(data));
    
//     // Step 1: Ensure templates are loaded
//     if (templateOptions.length === 0) {
//       console.log('⏳ Waiting for templates to load...');
//       await new Promise(resolve => setTimeout(resolve, 500));
//     }
    
//     // Step 2: Find matching template
//     let targetTemplate = null;
//     const templateId = data.templateId?.trim();
    
//     if (templateId && templateOptions.length > 0) {
//       targetTemplate = templateOptions.find(t => 
//         t.value === templateId || 
//         t.label.toLowerCase().includes(templateId.toLowerCase())
//       );
      
//       if (!targetTemplate) {
//         targetTemplate = templateOptions[0];
//       }
//     }
    
//     // Step 3: Load clients if needed
//     if (clientOptions.length === 0) {
//       await loadClientsForNavigation(data.clientId?.trim());
//     }
    
//     // Step 4: Set initial form data
//     setFormData(prev => ({
//       ...prev,
//       client: data.clientId?.trim() || '',
//       instrument: '',
//       fileName: data.fileName?.trim() || '',
//       template: targetTemplate?.value || '',
//       path: '',
//     }));
    
//     if (data.clientId) {
//       // Load instruments for this client
//       const instruments = await loadInstruments(data.clientId.trim());
      
//       if (instruments.length > 0) {
//         // Find matching instrument
//         let targetInstrument = null;
//         const dropdownValue = data.dropdownInstrumentId?.trim() || '';
//         const cleanDropdownValue = dropdownValue.replace(/\s+/g, '');
        
//         targetInstrument = instruments.find(inst => {
//           const instValue = inst.value?.replace(/\s+/g, '') || '';
//           return instValue === cleanDropdownValue;
//         });
        
//         // If not found, try other strategies
//         if (!targetInstrument && dropdownValue.includes(':')) {
//           const [instPart] = dropdownValue.split(':');
//           targetInstrument = instruments.find(inst => {
//             const instValue = inst.value?.replace(/\s+/g, '') || '';
//             return instValue.includes(instPart);
//           });
//         }
        
//         if (!targetInstrument) {
//           targetInstrument = instruments.find(inst => 
//             inst.label?.toLowerCase().includes(data.instrumentName?.toLowerCase())
//           );
//         }
        
//         if (!targetInstrument && instruments.length > 0) {
//           targetInstrument = instruments[0];
//         }
        
//         if (targetInstrument) {
//           console.log('🎯 Found instrument:', targetInstrument.value);
          
//           // Update form data with instrument
//           setFormData(prev => ({
//             ...prev,
//             instrument: targetInstrument.value
//           }));
          
//           // Step 5: Check if it's an interface instrument and load LIMS orders
//           const isInterface = isInterfaceInstrument(targetInstrument.value);
          
//           if (isInterface) {
//             const interfaceInstId = targetInstrument.value.includes(':') ? 
//               parseInt(targetInstrument.value.split(':')[1].trim()) : 0;
            
//             if (interfaceInstId > 0) {
//               console.log('🔍 Loading LIMS orders for interface instrument:', interfaceInstId);
//               await loadLimsOrder(interfaceInstId);
//             }
//           }
          
//           // Step 6: Load paths
//           await loadPathsForScheduler(targetInstrument.value, data.sourcePath);
          
//           // Step 7: Load protocol and instrument data
//           await loadProtocol(targetInstrument.value);
//           await onChangeInstrumentCombo(targetInstrument.value);
          
//           // Step 8: Load tags if we have a template
//           if (targetTemplate?.value && targetInstrument.value) {
//             console.log('🔍 Loading tags for template:', targetTemplate.value);
            
//             setTimeout(async () => {
//               await fetchTags(targetTemplate.value, targetInstrument.value);
//             }, 800);
//           }
          
//           setHasLoadedFromNavigation(true);
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Error in scheduler navigation:', error);
//   } finally {
//     setIsLoadingFromScheduler(false);
//   }
// };


// const loadClientsForNavigation = useCallback(async (targetClientId) => {
//   try {
//     console.log('👥 Loading clients, looking for:', targetClientId);

//     const response = await makeAjaxCall(endpoints.clientLockCombo, {
//       sTaskStatus: 'A',
//       sClientID: targetClientId || ''
//     });

//     if (Array.isArray(response) && response.length > 0) {
//       const clientOptionsData = response.map(client => ({
//         value: client.sClientID ? client.sClientID.trim() : '',
//         label: client.sClientName || t('instrumentlocktag.unknownclient')
//       }));

//       console.log('✅ Client options loaded (specific):', clientOptionsData);
//       setClientOptions(clientOptionsData);

//       // Find and select the target client
//       const targetClient = clientOptionsData.find(client => 
//         client.value === targetClientId || 
//         client.label.toLowerCase().includes(targetClientId?.toLowerCase() || '')
//       );
      
//       if (targetClient) {
//         console.log('🎯 Target client loaded:', targetClient.value);
//         // Update form data with the client
//         setFormData(prev => ({
//           ...prev,
//           client: targetClient.value
//         }));
//       } else if (clientOptionsData.length > 0) {
//         // Fallback to first client
//         console.log('📌 Using first client as fallback:', clientOptionsData[0].value);
//         setFormData(prev => ({
//           ...prev,
//           client: clientOptionsData[0].value
//         }));
//       }
//     }
//   } catch (error) {
//     console.error('Error loading clients:', error);
//   }
// }, [t]);

// // Add this function:
// const loadPathsForScheduler = useCallback(async (instrumentId, targetSourcePath = null) => {
//   try {
//     console.log('🛣️ Loading paths for scheduler instrument:', instrumentId);
//     console.log('🎯 Target source path:', targetSourcePath);

//     const response = await makeAjaxCall(endpoints.lockPathCombo, {
//       sInstrumentID: instrumentId,
//       sScheduleID: "",
//       sClientID: formData.client || ''
//     });

//     if (Array.isArray(response) && response.length > 0) {
//       const pathOptionsData = response.map(path => ({
//         value: path.sTaskID ? path.sTaskID.trim() : '',
//         label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
//         originalItem: path
//       }));

//       setPathOptions(pathOptionsData);

//       // Find matching path
//       let selectedPath = null;
      
//       if (targetSourcePath) {
//         // Clean paths for comparison
//         const cleanTargetPath = targetSourcePath.toLowerCase().trim();
        
//         // Try exact match
//         selectedPath = pathOptionsData.find(p => 
//           p.label.toLowerCase().trim() === cleanTargetPath
//         );
        
//         // Try contains match
//         if (!selectedPath) {
//           selectedPath = pathOptionsData.find(p => 
//             p.label.toLowerCase().includes(cleanTargetPath) ||
//             cleanTargetPath.includes(p.label.toLowerCase())
//           );
//         }
        
//         // Try partial match (just the folder name)
//         if (!selectedPath) {
//           const lastFolder = targetSourcePath.split('\\').filter(Boolean).pop()?.toLowerCase();
//           if (lastFolder) {
//             selectedPath = pathOptionsData.find(p => 
//               p.label.toLowerCase().includes(lastFolder)
//             );
//           }
//         }
        
//         if (selectedPath) {
//           console.log('✅ Found matching path:', selectedPath.label);
//         }
//       }

//       // Fallback to first path
//       if (!selectedPath && pathOptionsData.length > 0) {
//         selectedPath = pathOptionsData[0];
//         console.log('📌 Using first available path:', selectedPath.label);
//       }

//       if (selectedPath) {
//         setFormData(prev => ({
//           ...prev,
//           path: selectedPath.value
//         }));
//       }
//     }
//   } catch (error) {
//     console.error('Error loading paths:', error);
//     setPathOptions([]);
//   }
// }, [formData.client, t]);

  
//   useEffect(() => {
//     const device = sessionStorage.getItem("device") || "desktop";
//     setDeviceType(device);
//   }, []);
//   useEffect(() => {
//   console.log('🔄 InstrumentLockTag - Current formData.instrument:', formData.instrument);
//   console.log('🔄 InstrumentLockTag - Current instrumentOptions:', instrumentOptions);
  
//   if (formData.instrument && instrumentOptions.length > 0) {
//     const match = instrumentOptions.find(opt => opt.value === formData.instrument);
//     console.log('🔄 Found match?', match);
//     console.log('🔄 Match details:', match ? {
//       value: match.value,
//       label: match.label,
//       L11InstrumentID: match.L11InstrumentID,
//       L12InstrumentMappingID: match.L12InstrumentMappingID
//     } : 'No match');
//   }
// }, [formData.instrument, instrumentOptions]);

//   const isInterfaceInstrument = useCallback((instrumentId) => {
//     if (!instrumentId) return false;
    
//     const idStr = instrumentId.toString().trim();
//     const parts = idStr.split(':');
//     return parts.length > 1 && parts[1] && parts[1].trim() !== "0";
//   }, []);

//   const loadTagValues = useCallback(async (tagId, templateId, instrumentId, tagIndex, previousTagValueID = "") => {
//     try {
//       const requestBody = {
//         uid: tagIndex || 0,
//         sUserID: formData.path || "",
//         nTagID: parseInt(tagId) || 0,
//         sTagValueID: previousTagValueID || "          ",
//         sInstrumentID: instrumentId.padEnd(10, ' '),
//         sTemplateID: templateId
//       };
      
//       const response = await makeAjaxCall(endpoints.loadCategoryTagValueAndID, requestBody);
      
//       if (response && Array.isArray(response)) {
//         const options = response.map(item => ({
//           value: item.sTagValueID ? item.sTagValueID.trim() : '',
//           label: item.sTagValue || t('instrumentlocktag.unknownvalue')
//         })).filter(opt => opt.value && opt.label);
        
//         return options;
//       }
      
//       return [];
      
//     } catch (error) {
//       return [];
//     }
//   }, [formData.path, t]);

//   const fetchTags = useCallback(async (templateId, instrumentId) => {
//     if (!templateId || !instrumentId) {
//       setTags([]);
//       return;
//     }
    
//     setIsLoadingTags(true);
//     try {
//       const currentInstrumentId = instrumentId.padEnd(10, ' ');
      
//       const requestBody = {
//         sUserID: formData.path || "",
//         ActiveUserDetails: getActiveUserDetails(),
//         sInstrumentID: currentInstrumentId,
//         ApplicationCode: "SDMS",
//         sTemplateID: templateId
//       };
      
//       const response = await makeAjaxCall(endpoints.loadTagCategory, requestBody);
      
//       if (Array.isArray(response) && response.length > 0) {
//         const transformedTags = await Promise.all(response.map(async (item, index) => {
//           const tagId = item.L58TagID || item.L8iTagID || index;
//           const tagName = tagIdToNameMap[tagId] || item.L58TagName || t('instrumentlocktag.unknowntag');
//           const value = item.Value || '';
//           const valueID = item.ValueID || '';
//           const required = item.L58ValueStatus || false;
//           const order = item.L58Order || index;
          
//           let options = [];
//           if (index === 0 && tagId && required) {
//             options = await loadTagValues(tagId, templateId, instrumentId, index, "");
//           }
          
//           return {
//             tagName: tagName,
//             value: value.trim(),
//             valueID: valueID ? valueID.trim() : '',
//             tagID: tagId,
//             order: order,
//             required: required,
//             editable: true,
//             options: options
//           };
//         }));
        
//         transformedTags.sort((a, b) => a.order - b.order);
//         setTags(transformedTags);
        
//       } else {
//         setTags([]);
//       }
//     } catch (error) {
//       setTags([]);
//     } finally {
//       setIsLoadingTags(false);
//     }
//   }, [formData.path, loadTagValues, t]);

//   // Add this useEffect after your existing useEffects
// useEffect(() => {
//   // This effect handles template loading when it comes from scheduler
//   const loadTemplateFromScheduler = async () => {
//     if (isLoadingFromScheduler) return;
    
//     // Check if we have a template from scheduler
//     const storedData = sessionStorage.getItem('schedulerData');
//     if (storedData) {
//       try {
//         const schedulerData = JSON.parse(storedData);
//         const templateId = schedulerData.templateId?.trim();
        
//         if (templateId && formData.instrument && !formData.template) {
//           console.log('📋 Setting template from scheduler:', templateId);
          
//           // Set the template
//           setFormData(prev => ({
//             ...prev,
//             template: templateId
//           }));
          
//           // Wait a bit for state to update, then fetch tags
//           setTimeout(() => {
//             if (formData.instrument) {
//               fetchTags(templateId, formData.instrument);
//             }
//           }, 1000);
//         }
//       } catch (error) {
//         console.error('Error processing stored template:', error);
//       }
//     }
//   };
  
//   loadTemplateFromScheduler();
// }, [formData.instrument, formData.template, isLoadingFromScheduler, fetchTags]);

//   const handleInlineEditSubmit = useCallback((index, value, valueID) => {
//     setTags(prev => {
//       const updatedTags = prev.map((t, idx) => {
//         if (idx === index) {
//           return { ...t, value, valueID };
//         }
        
//         if (idx > index) {
//           return { ...t, value: '', valueID: '', options: [] };
//         }
        
//         return t;
//       });
      
//       return updatedTags;
//     });
    
//     if (value) {
//       setTagErrors(prev => ({ ...prev, [index]: false }));
//     }
//   }, []);

//   const checkMergeAndAutoUnlockSettings = useCallback(async () => {
//     try {
//       const response = await makeAjaxCall(endpoints.mergeFileAndAutoUnlock, {});
      
//       if (response) {
//         const showMerge = response.MergeCount?.[0]?.L67Status === false;
//         setShowMergeFields(showMerge);
        
//         const showUnlock = response.AutoUnlock?.[0]?.L67Status === false;
//         setShowUnlockOption(showUnlock);
        
//         if (response.MergeCountValue?.[0]?.L42ValueSettings) {
//           const mergeCount = response.MergeCountValue[0].L42ValueSettings;
//           setFormData(prev => ({ ...prev, mergeFileCount: mergeCount }));
//           setSessionValue("MergeCount", mergeCount);
//         }
        
//         if (response.AutoUnlockValue?.[0]?.L42ValueSettings === "1") {
//           setFormData(prev => ({ ...prev, unlockAfterCapture: true }));
//         }
//       }
//     } catch (error) {
//       // Silent error handling
//     }
//   }, [t]);

//   const loadUsers = useCallback(async () => {
//     try {
//       const response = await makeAjaxCall(endpoints.lockUserCombo, {});
      
//       if (Array.isArray(response) && response.length > 0) {
//         const users = response.map(user => ({
//           value: user.sUserID ? user.sUserID.trim() : '',
//           label: user.sUserName || t('instrumentlocktag.unknownuser')
//         }));
        
//         setUserOptions(users);
        
//         const activeUserDetails = getActiveUserDetails();
//         const currentUserId = activeUserDetails.sUserID || "U1";
        
//         const currentUser = users.find(user => user.value === currentUserId);
//         if (currentUser) {
//           setFormData(prev => ({ ...prev, user: currentUser.value }));
//         }
//       }
//     } catch (error) {
//       // Silent error handling
//     }
//   }, [t]);

//   const loadProtocol = useCallback(async (instrumentId) => {
//     try {
//       const response = await makeAjaxCall(endpoints.loadProtocol, {
//         sInstrumentID: instrumentId
//       });
      
//       if (response) {
//         const parserTypeValue = String(response.L11ParserType || '0');
        
//         const fileNameEnabled = response.FileName === "true";
//         setIsFileNameEnabled(fileNameEnabled);
        
//         setSessionValue("FileName", fileNameEnabled.toString());
//         setSessionValue("L11ParserType", parserTypeValue);
        
//         const isInterface = isInterfaceInstrument(instrumentId);
//         setIsInstrumentInterface(isInterface);
        
//         if (isInterface) {
//           if (fileNameEnabled) {
//             setIsLimsOrderEnabled(false);
//           } else {
//             setIsLimsOrderEnabled(true);
//           }
//         } else {
//           setIsLimsOrderEnabled(false);
//         }
        
//         return response;
//       }
//     } catch (error) {
//       return null;
//     }
//   }, [isInterfaceInstrument, t]);

//   const loadLimsOrder = useCallback(async (interfaceInstId) => {
//     try {
//       const response = await makeAjaxCall(endpoints.lockLimsordercombo, {
//         nInterfaceInstID: interfaceInstId
//       });
      
//       if (Array.isArray(response) && response.length > 0) {
//         const limsOrders = response.map(order => ({
//           value: order.nOrderID ? String(order.nOrderID).trim() : '',
//           label: order.LIMSOrder || t('instrumentlocktag.unknownorder'),
//           orderID: order.nOrderID || '',
//           sampleID: order.SampleID || '',
//           testCode: order.TestCode || '',
//           replicateID: order.ReplicateID || '',
//           ...order
//         }));
        
//         setLimsOrderOptions(limsOrders);
//         setIsLimsOrderEnabled(true);
        
//         if (limsOrders.length > 0) {
//           const firstOrder = limsOrders[0];
//           setFormData(prev => ({ 
//             ...prev, 
//             limsOrder: firstOrder.value,
//             limsOrderID: firstOrder.orderID,
//             limsSampleID: firstOrder.sampleID,
//             limsTestCode: firstOrder.testCode,
//             limsReplicateID: firstOrder.replicateID
//           }));
//         }
        
//         return limsOrders;
//       } else {
//         setLimsOrderOptions([]);
//         setIsLimsOrderEnabled(false);
//         setFormData(prev => ({ 
//           ...prev, 
//           limsOrder: '',
//           limsOrderID: '',
//           limsSampleID: '',
//           limsTestCode: '',
//           limsReplicateID: ''
//         }));
//         return [];
//       }
//     } catch (error) {
//       setLimsOrderOptions([]);
//       setIsLimsOrderEnabled(false);
//       setFormData(prev => ({ 
//         ...prev, 
//         limsOrder: '',
//         limsOrderID: '',
//         limsSampleID: '',
//         limsTestCode: '',
//         limsReplicateID: ''
//       }));
//       return [];
//     }
//   }, [t]);

//   const onChangeInstrumentCombo = useCallback(async (instrumentId) => {
//   try {
//     const nLLProStatus = 0;
//     const nProtocolStatus = parseInt(formData.protocolID) || 0;
//     const nProtocolStatusfile = isFileNameEnabled ? 101 : 0;
    
//     const response = await makeAjaxCall(endpoints.onChangeInstrumentCombo, {
//       sInstrumentID: instrumentId,
//       nLLProStatus: nLLProStatus,
//       nProtocolStatus: nProtocolStatus,
//       nProtocolStatusfile: nProtocolStatusfile
//     }, "SelectPathFileUSerTemplate");
    
//     if (response) {
//       const activeUserDetails = getActiveUserDetails();
//       const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
      
//       // Handle lock status
//       if (response.sLockType === 'A') {
//         setIsAutoLocked(true);
//         setIsLocked(true);
//         setLockedByOtherUser(false);
//       } else if (response.sUserID) {
//         setIsLocked(true);
//         setIsAutoLocked(false);
        
//         const responseUserId = response.sUserID ? response.sUserID.trim() : '';
        
//         if (responseUserId === currentUserId) {
//           setLockedByOtherUser(false);
//         } else {
//           setLockedByOtherUser(true);
//         }
//       } else {
//         setIsLocked(false);
//         setIsAutoLocked(false);
//         setLockedByOtherUser(false);
//       }
      
//       const updates = {};
      
//       if (response.sFileName) {
//         updates.fileName = response.sFileName;
//       }
      
//       if (response.nCurMergeFileNo > 0) {
//         updates.currentFileCount = String(response.nCurMergeFileNo);
//       } else {
//         updates.currentFileCount = '0';
//       }
      
//       if (response.nMergeFileCount > 0) {
//         updates.mergeFileCount = String(response.nMergeFileCount);
//         setSessionValue("LockedMergeCount", String(response.nMergeFileCount));
//       } else if (response.sTaskID != null) {
//         const lockedMergeCount = getSessionValue("LockedMergeCount");
//         if (lockedMergeCount) {
//           updates.mergeFileCount = lockedMergeCount;
//         } else {
//           updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//         }
//       } else {
//         updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//       }
      
//       if (response.nAutoUnlock) {
//         updates.unlockAfterCapture = true;
//       } else {
//         updates.unlockAfterCapture = false;
//       }
      
//       if (response.sLockID) {
//         updates.lockID = response.sLockID;
//       } else {
//         updates.lockID = '';
//       }
      
//       if (response.nInterFaceOrderID) {
//         updates.interfaceOrderID = String(response.nInterFaceOrderID);
//       } else {
//         updates.interfaceOrderID = '';
//       }
      
//       // Auto-select first template for auto-locked instruments
//       if (response.sLockType === 'A' && templateOptions.length > 0) {
//         const firstTemplateValue = templateOptions[0].value;
//         updates.template = firstTemplateValue;
//       } else if (response.sTemplateID) {
//         // For user-locked instruments, use the template they used
//         updates.template = response.sTemplateID;
//       }
//       // If not locked, template remains empty
      
//       setFormData(prev => ({ ...prev, ...updates }));
      
//       // If template was set (auto-locked or user-locked), return response
//       // The useEffect will automatically load tags for the template
      
//       return response;
//     }
//   } catch (error) {
//     return null;
//   }
// }, [formData.protocolID, isFileNameEnabled, templateOptions]);

//   const loadPaths = useCallback(async (instrumentId) => {
//     try {
//       let endpoint = endpoints.lockPathCombo;
//       let requestBody = {
//         sInstrumentID: instrumentId,
//         sScheduleID: ""
//       };
      
//       if (getDeactiveScheduleDataRef.current) {
//         const scheduleData = getDeactiveScheduleDataRef.current;
//         const scheduleId = scheduleData.L13ScheduleID;
//         const taskType = scheduleData.TaskType;
        
//         if (taskType === "ScheduleCreation") {
//           endpoint = endpoints.lockActiveInstrumentPathCombo;
//         } else {
//           endpoint = endpoints.lockDeactiveInstrumentPathCombo;
//         }
//         requestBody.sScheduleID = scheduleId;
//       }
      
//       const response = await makeAjaxCall(endpoint, requestBody);
      
//       if (Array.isArray(response) && response.length > 0) {
//         const pathOptionsData = response.map(path => ({
//           value: path.sTaskID || path.L13ScheduleID || '',
//           label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
//           originalItem: path
//         }));
        
//         setPathOptions(pathOptionsData);
        
//         if (pathOptionsData.length > 0) {
//           const firstPath = pathOptionsData[0];
//           setFormData(prev => ({ ...prev, path: firstPath.value }));
          
//           if (formData.template) {
//             fetchTags(formData.template, instrumentId);
//           }
//         }
//       } else {
//         setPathOptions([]);
//       }
//     } catch (error) {
//       setPathOptions([]);
//     }
//   }, [formData.template, fetchTags, t]);

// // In InstrumentLocksandTags.jsx, find the loadInstruments function and update it:

// const loadInstruments = useCallback(async (clientId) => {
//   try {
//     let endpoint = endpoints.lockInstrumentCombo;
//     let requestBody = {
//       sClientID: clientId,
//       sScheduleID: ""
//     };
    
//     if (getDeactiveScheduleDataRef.current) {
//       const scheduleData = getDeactiveScheduleDataRef.current;
//       const scheduleId = scheduleData.L13ScheduleID;
//       const taskType = scheduleData.TaskType;
      
//       if (taskType === "ScheduleCreation") {
//         endpoint = endpoints.lockActiveParsingInstrumentCombo;
//       } else {
//         endpoint = endpoints.lockDeactiveParsingInstrumentCombo;
//       }
//       requestBody.sScheduleID = scheduleId;
//     }
    
//     const response = await makeAjaxCall(endpoint, requestBody);
    
//     if (Array.isArray(response) && response.length > 0) {
//       const instrumentOptionsData = response.map(instrument => ({
//         value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
//         label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
//         originalItem: instrument,
//         isInterface: instrument.L11InterfaceStatus === 1
//       }));
      
//       setInstrumentOptions(instrumentOptionsData);
      
//       // Auto-select and load first instrument (NORMAL FLOW)
//       if (instrumentOptionsData.length > 0 && !isLoadingFromScheduler) {
//         const firstInstrument = instrumentOptionsData[0];
        
//         setIsLoading(true);
        
//         try {
//           setFormData(prev => ({ 
//             ...prev, 
//             instrument: firstInstrument.value,
//             path: '',
//             fileName: '',
//             limsOrder: '',
//             limsOrderID: '',
//             limsSampleID: '',
//             limsTestCode: '',
//             limsReplicateID: '',
//             mergeFileCount: getSessionValue("MergeCount") || '1',
//             currentFileCount: '0'
//           }));
          
//           setErrors(prev => ({ ...prev, instrument: false }));
          
//           setTags([]);
//           setTagErrors({});
//           setPathOptions([]);
          
//           const isInterface = isInterfaceInstrument(firstInstrument.value);
          
//           await loadProtocol(firstInstrument.value);
          
//           if (isInterface) {
//             const interfaceInstId = firstInstrument.value.includes(':') ? 
//               parseInt(firstInstrument.value.split(':')[1].trim()) : 0;
            
//             if (interfaceInstId > 0) {
//               await loadLimsOrder(interfaceInstId);
//             }
//           } else {
//             setLimsOrderOptions([]);
//             setIsLimsOrderEnabled(false);
//           }
          
//           const instrumentData = await onChangeInstrumentCombo(firstInstrument.value);
          
//           if (instrumentData) {
//             const updates = {};
            
//             if (instrumentData.nCurMergeFileNo > 0) {
//               updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
//             } else {
//               updates.currentFileCount = '0';
//             }
            
//             const lockedMergeCount = getSessionValue("LockedMergeCount");
//             if (instrumentData.sTaskID && lockedMergeCount) {
//               updates.mergeFileCount = lockedMergeCount;
//             } else if (instrumentData.nMergeFileCount > 0) {
//               updates.mergeFileCount = String(instrumentData.nMergeFileCount);
//               setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
//             } else {
//               updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//             }
            
//             // ONLY set template from backend if instrument is locked
//             if (instrumentData.sTemplateID && instrumentData.sTaskID) {
//               updates.template = instrumentData.sTemplateID;
//             }
//             else if (instrumentData.sLockType === 'A') {
//               if (templateOptions.length > 0) {
//                 const firstTemplateValue = templateOptions[0].value;
//                 updates.template = firstTemplateValue;
//               }
//             }
//             // DO NOT auto-select first template when instrument is not locked
            
//             setFormData(prev => ({ ...prev, ...updates }));
//           }
          
//           await loadPaths(firstInstrument.value);
          
//         } catch (error) {
//           console.error('Error loading instrument details:', error);
//         } finally {
//           setIsLoading(false);
//         }
//       }
      
//       return instrumentOptionsData;
      
//     } else {
//       console.warn('⚠️ No instruments found for client:', clientId);
//       setInstrumentOptions([]);
//       return [];
//     }
//   } catch (error) {
//     console.error('❌ Error loading instruments:', error);
//     setInstrumentOptions([]);
//     setIsLoading(false);
//     return [];
//   }
// }, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
//     isInterfaceInstrument, templateOptions, isLoadingFromScheduler]);

//   // Update your existing loadClients function:
// const loadClients = useCallback(async () => {
//   // Check if we're loading from scheduler
//   const fromScheduler = sessionStorage.getItem('fromScheduler') === 'true';
  
//   if (fromScheduler && hasLoadedFromNavigation) {
//     console.log('⏸️ Skipping client load - already loaded from scheduler');
//     return;
//   }
  
//   try {
//     const preselectedClientId = scheduleData?.L06ClientID;
//     const taskStatus = scheduleData?.TaskType !== "ScheduleCreation" ? 'D' : 'A';
    
//     const response = await makeAjaxCall(endpoints.clientLockCombo, {
//       sTaskStatus: taskStatus,
//       sClientID: preselectedClientId
//     });
    
//     if (Array.isArray(response) && response.length > 0) {
//       const clientOptionsData = response.map(client => ({
//         value: client.sClientID ? client.sClientID.trim() : '',
//         label: client.sClientName || t('instrumentlocktag.unknownclient')
//       }));
      
//       setClientOptions(clientOptionsData);
      
//       // Only auto-select if NOT loading from scheduler
//       if (!isLoadingFromScheduler && !hasLoadedFromNavigation) {
//         let clientToSelect = null;
        
//         if (preselectedClientId) {
//           clientToSelect = clientOptionsData.find(client => client.value === preselectedClientId);
//         }
        
//         if (!clientToSelect && clientOptionsData.length > 0) {
//           clientToSelect = clientOptionsData[0];
//         }
        
//         if (clientToSelect) {
//           setFormData(prev => ({ ...prev, client: clientToSelect.value }));
//           await loadInstruments(clientToSelect.value);
//         }
//       }
//     } else {
//       setClientOptions([]);
//     }
//   } catch (error) {
//     console.error(t('instrumentlocktag.errorloadingclients'), error);
//     setClientOptions([]);
//   }
// }, [scheduleData, loadInstruments, t, isLoadingFromScheduler, hasLoadedFromNavigation]);

//   const loadTagOptions = useCallback(async (tagIndex) => {
//     if (!formData.template || !tags[tagIndex]) return [];
    
//     const tag = tags[tagIndex];
    
//     let previousTagValueID = "";
//     if (tagIndex > 0) {
//       previousTagValueID = tags[tagIndex - 1].valueID || "          ";
//     }
    
//     try {
//       const options = await loadTagValues(
//         tag.tagID, 
//         formData.template, 
//         formData.instrument,
//         tagIndex,
//         previousTagValueID
//       );
      
//       return options || [];
//     } catch (error) {
//       return [];
//     }
//   }, [formData.template, formData.instrument, tags, loadTagValues, t]);

//   const handleTagValueClick = useCallback((index, value, valueID) => {
//     setTags(prev => {
//       const updatedTags = prev.map((t, idx) => {
//         if (idx === index) {
//           return { ...t, value, valueID };
//         }
        
//         if (idx > index) {
//           return { ...t, value: '', valueID: '', options: [] };
//         }
        
//         return t;
//       });
      
//       return updatedTags;
//     });
    
//     if (value) {
//       setTagErrors(prev => ({ ...prev, [index]: false }));
//     }
    
//     if (index < tags.length - 1) {
//       loadTagOptions(index + 1).then(options => {
//         if (options.length > 0) {
//           setTags(prev => prev.map((tag, idx) => 
//             idx === index + 1 ? { ...tag, options } : tag
//           ));
//         }
//       });
//     }
//   }, [tags, loadTagOptions]);

//   const handleTagEditRequest = useCallback(async (tagIndex) => {
//     if (tags[tagIndex] && tags[tagIndex].options && tags[tagIndex].options.length > 0) {
//       return tags[tagIndex].options;
//     }
    
//     const options = await loadTagOptions(tagIndex);
    
//     setTags(prev => prev.map((tag, idx) => 
//       idx === tagIndex ? { ...tag, options } : tag
//     ));
    
//     return options;
//   }, [tags, loadTagOptions]);

// const showFullPageLoader = isLoading || isSubmitting || isLoadingTags || isLoadingOptions || isLoadingFromScheduler;  
  
// useEffect(() => {
//   return () => {
//     console.log('🔄 Cleaning up navigation state');
//     setIsLoadingFromScheduler(false);
//   };
// }, []);

// useEffect(() => {
//   if (initialLoadDoneRef.current) return;
  
//   const loadData = async () => {
//     setIsLoading(true);
    
//     try {
//       // 1. Load essential settings and users first
//       await checkMergeAndAutoUnlockSettings();
//       await loadUsers();
      
//       // 2. Load templates
//       const activeUserDetails = getActiveUserDetails();
//       const templateResponse = await makeAjaxCall(endpoints.lockTemplateCombo, {
//         ActiveUserDetails: activeUserDetails,
//         ApplicationCode: "SDMS"
//       });
      
//       if (Array.isArray(templateResponse) && templateResponse.length > 0) {
//         const templates = templateResponse
//           .map(template => ({
//             value: String(template.sTemplateID || '').trim(),
//             label: String(template.sTemplateName || '').trim()
//           }))
//           .filter(template => template.value && template.label && template.value !== 'undefined');
        
//         const order = ['QC', 'Calibration', 'Method Development', 'Project'];
//         const sortedTemplates = templates.sort((a, b) => {
//           const labelA = a.label || '';
//           const labelB = b.label || '';
          
//           const indexA = order.findIndex(pattern => labelA.includes(pattern));
//           const indexB = order.findIndex(pattern => labelB.includes(pattern));
          
//           if (indexA !== -1 && indexB !== -1) {
//             return indexA - indexB;
//           }
          
//           if (indexA !== -1) return -1;
//           if (indexB !== -1) return 1;
          
//           return labelA.localeCompare(labelB);
//         });
        
//         setTemplateOptions(sortedTemplates);
//       }
      
//       // 3. Check if we have scheduler data
//       const fromScheduler = sessionStorage.getItem('fromScheduler');
//       const storedData = sessionStorage.getItem('schedulerData');
      
//       if (fromScheduler === 'true' && storedData) {
//         try {
//           const schedulerData = JSON.parse(storedData);
//           console.log('🔍 Processing stored scheduler data');
          
//           // Wait a bit for templates to be set
//           setTimeout(() => {
//             handleSchedulerNavigation(schedulerData);
//           }, 300);
          
//           return; // Skip normal initialization
//         } catch (error) {
//           console.error('Error parsing stored scheduler data:', error);
//         }
//       }
      
//       // 4. NORMAL INITIALIZATION (only if not from scheduler)
//       await loadClients();
//       initialLoadDoneRef.current = true;
      
//     } catch (error) {
//       console.error('Error loading initial data:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   loadData();
  
//   // Clean up session storage on unmount
//   return () => {
//     sessionStorage.removeItem('fromScheduler');
//     sessionStorage.removeItem('schedulerData');
//     sessionStorage.removeItem('selectedSchedulerPath');
//   };
// }, []);

// useEffect(() => {
//   if (formData.template && formData.template.trim() !== '' && formData.instrument) {
//     fetchTags(formData.template, formData.instrument);
//   } else {
//     setTags([]);
//   }
// }, [formData.template, formData.instrument, fetchTags]);

//   const handleClientChange = useCallback(async (value) => {
//     if (isLoadingFromScheduler) {
//     console.log('⏸️ Skipping client change (loading from scheduler)');
//     return;
//   }
//     setFormData(prev => ({ ...prev, client: value, instrument: '', path: '', fileName: '', limsOrder: '' }));
//     setErrors(prev => ({ ...prev, client: false }));
    
//     setInstrumentOptions([]);
//     setPathOptions([]);
//     setLimsOrderOptions([]);
//     setTags([]);
//     setTagErrors({});
    
//     if (value) {
//       setIsLoading(true);
//       try {
//         await loadInstruments(value);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   }, [loadInstruments]);

//   const handleInstrumentChange = useCallback(async (value) => {
//   if (isLoadingFromScheduler) {
//     console.log('⏸️ Skipping instrument change (loading from scheduler)');
//     return;
//   }
  
//   setIsLoading(true);
  
//   setFormData(prev => ({ 
//     ...prev, 
//     instrument: value, 
//     path: '', 
//     fileName: '', 
//     limsOrder: '',
//     limsOrderID: '',
//     limsSampleID: '',
//     limsTestCode: '',
//     limsReplicateID: '',
//     mergeFileCount: getSessionValue("MergeCount") || '1',
//     currentFileCount: '0'
//   }));
//   setErrors(prev => ({ ...prev, instrument: false }));
  
//   setPathOptions([]);
//   setTags([]);
//   setTagErrors({});
  
//   if (value) {
//     try {
//       const isInterface = isInterfaceInstrument(value);
      
//       await loadProtocol(value);
      
//       if (isInterface) {
//         const interfaceInstId = value.includes(':') ? 
//           parseInt(value.split(':')[1].trim()) : 0;
        
//         if (interfaceInstId > 0) {
//           await loadLimsOrder(interfaceInstId);
//         }
//       } else {
//         setLimsOrderOptions([]);
//         setIsLimsOrderEnabled(false);
//         setFormData(prev => ({ 
//           ...prev, 
//           limsOrder: '',
//           limsOrderID: '',
//           limsSampleID: '',
//           limsTestCode: '',
//           limsReplicateID: ''
//         }));
//       }
      
//       const instrumentData = await onChangeInstrumentCombo(value);
      
//       if (instrumentData) {
//         const updates = {};
        
//         if (instrumentData.nCurMergeFileNo > 0) {
//           updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
//         } else {
//           updates.currentFileCount = '0';
//         }
        
//         const lockedMergeCount = getSessionValue("LockedMergeCount");
//         if (isLocked && lockedMergeCount) {
//           updates.mergeFileCount = lockedMergeCount;
//         } else {
//           updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//         }
        
//         if (instrumentData.sTemplateID && instrumentData.sTaskID) {
//           updates.template = instrumentData.sTemplateID;
//         }
//         else if (instrumentData.sLockType === 'A') {
//           if (templateOptions.length > 0) {
//             const firstTemplateValue = templateOptions[0].value;
//             updates.template = firstTemplateValue;
//           }
//         }
        
//         setFormData(prev => ({ ...prev, ...updates }));
//       }
      
//       await loadPaths(value);
      
//     } finally {
//       setIsLoading(false);
//     }
//   } else {
//     setIsLoading(false);
//   }
// }, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
//     isInterfaceInstrument, isLocked, templateOptions, t]);

//   useEffect(() => {
//     if (formData.instrument) {
//       const refreshData = async () => {
//         try {
//           setIsLoading(true);
//           const response = await onChangeInstrumentCombo(formData.instrument);
//           if (response) {
//             setFormData(prev => ({
//               ...prev,
//               currentFileCount: response.nCurMergeFileNo > 0 ? String(response.nCurMergeFileNo) : '0',
//               mergeFileCount: response.nMergeFileCount > 0 ? String(response.nMergeFileCount) : getSessionValue("MergeCount") || '1'
//             }));
//           }
//         } catch (error) {
//           // Silent error handling
//         } finally {
//           setIsLoading(false);
//         }
//       };
      
//       refreshData();
//     }
//   }, [isLocked, formData.instrument]);

//   // Add this useEffect after your other useEffects
// useEffect(() => {
//   if (navigationData?.data) {
//     const schedulerData = navigationData.data;
//     console.log('📦 Received navigation data:', schedulerData);
    
//     // Check if we're coming from scheduler
//     if (schedulerData.fromScheduler) {
//       // Create a flag in sessionStorage to indicate scheduler navigation
//       sessionStorage.setItem('fromScheduler', 'true');
//       sessionStorage.setItem('schedulerData', JSON.stringify(schedulerData));
      
//       // Process the scheduler data
//       handleSchedulerNavigation(schedulerData);
//     }
//   }
// }, [navigationData]);

// // Add this useEffect to check sessionStorage on mount
// useEffect(() => {
//   const fromScheduler = sessionStorage.getItem('fromScheduler');
//   const storedData = sessionStorage.getItem('schedulerData');
  
//   if (fromScheduler === 'true' && storedData) {
//     try {
//       const schedulerData = JSON.parse(storedData);
//       console.log('🔍 Restoring scheduler data from session:', schedulerData);
//       handleSchedulerNavigation(schedulerData);
//     } catch (error) {
//       console.error('Error parsing stored scheduler data:', error);
//     }
//   }
  
//   // Clean up
//   return () => {
//     sessionStorage.removeItem('fromScheduler');
//     sessionStorage.removeItem('schedulerData');
//   };
// }, []);

//   const handlePathChange = useCallback((value) => {
//     setFormData(prev => ({ ...prev, path: value }));
//     setErrors(prev => ({ ...prev, path: false }));
//   }, []);

// const handleTemplateChange = useCallback((value) => {
//   // Simply set the template value - don't auto-select first template
//   setFormData(prev => ({ ...prev, template: value }));
//   setErrors(prev => ({ ...prev, template: false }));
  
//   // Clear tags and errors
//   setTags([]);
//   setTagErrors({});
// }, []); // Remove templateOptions dependency

//   const handleMergeCountChange = useCallback((value) => {
//     const numValue = parseInt(value) || 0;
    
//     if (numValue > 10000) {
//       setFormData(prev => ({ ...prev, mergeFileCount: '10000' }));
//       setErrors(prev => ({ ...prev, mergeFileCount: t('instrumentlocktag.mergecountexceed') }));
//       return;
//     }
    
//     if (numValue < 1 && value !== '') {
//       setFormData(prev => ({ ...prev, mergeFileCount: '1' }));
//     } else {
//       setFormData(prev => ({ ...prev, mergeFileCount: value }));
//       setErrors(prev => ({ ...prev, mergeFileCount: '' }));
//     }
//   }, [t]);

//   const validateFormForLock = useCallback(() => {
//   const newErrors = {};
//   const newTagErrors = {};
//   let isValid = true;
  
//   if (!formData.instrument) {
//     newErrors.instrument = true;
//     isValid = false;
//   }
  
//   if (!formData.path) {
//     newErrors.path = true;
//     isValid = false;
//   }
  
//   if (!formData.template || formData.template.trim() === '') {
//     newErrors.template = true;
//     isValid = false;
//   }
  
//   const isInterface = isInterfaceInstrument(formData.instrument);
  
//   if (isInterface) {
//     if (isFileNameEnabled && !formData.fileName) {
//       newErrors.fileName = true;
//       isValid = false;
//     }
    
//     const mergeNum = parseInt(formData.mergeFileCount) || 0;
//     const currentNum = parseInt(formData.currentFileCount) || 0;
    
//     if (mergeNum > 10000) {
//       newErrors.mergeFileCount = t('instrumentlocktag.mergecountexceed');
//       isValid = false;
//     }
    
//     if (mergeNum < currentNum) {
//       newErrors.mergeFileCount = t('instrumentlocktag.mergecountnotlessthancurrent', 
//         { count: formData.currentFileCount });
//       isValid = false;
//     }
    
//     if (isLimsOrderEnabled && !formData.limsOrder) {
//       newErrors.limsOrder = true;
//       isValid = false;
//     }
//   }
  
//   for (let i = 0; i < tags.length; i++) {
//     if (tags[i].required && !tags[i].value) {
//       newTagErrors[i] = true;
//       isValid = false;
//     }
//   }
  
//   setErrors(newErrors);
//   setTagErrors(newTagErrors);
  
//   return isValid;
// }, [formData, tags, isFileNameEnabled, isLimsOrderEnabled, isInterfaceInstrument, t]);

//   const prepareLockData = useCallback((auditData = null, validationType = "CheckAndInsert") => {
//     const activeUserDetails = getActiveUserDetails();
//     const isInterface = isInterfaceInstrument(formData.instrument);
    
//     const instrumentId = (formData.instrument || "").padEnd(10, ' ');
//     const templateId = (formData.template || '').padEnd(10, ' ');
//     const userId = (formData.user || activeUserDetails.sUserID || '').padEnd(10, ' ');
    
//     const lockData = {
//       sInstrumentName: instrumentOptions.find(i => i.value === formData.instrument)?.label || '',
//       lockinstdetails: {
//         sInstrumentID: instrumentId,
//         sTaskID: formData.path,
//         sTaskSourcePath: pathOptions.find(p => p.value === formData.path)?.label || '',
//         sFileName: formData.fileName,
//         sTemplateID: templateId,
//         sUserID: userId,
//         nMergeFileCount: parseInt(formData.mergeFileCount) || 1,
//         nAutoUnlock: formData.unlockAfterCapture ? 1 : 0,
//         nInterFaceOrderID: parseInt(formData.interfaceOrderID) || 0,
//         nProtocolStatus: parseInt(formData.protocolID) || 0,
//         nLLProStatus: isFileNameEnabled ? 1 : 0,
//         sScheduleID: pathOptions.find(p => p.value === formData.path)?.originalItem?.L13ScheduleID || ''
//       },
//       sTemplateName: templateOptions.find(t => t.value === formData.template)?.label || '',
//       lInstTagValue: tags.map(tag => ({
//         L58TagID: tag.tagID,
//         Value: tag.value || '',
//         L58ValueStatus: tag.required || false,
//         L58TagName: tag.tagName,
//         ValueID: tag.valueID || '',
//         LoadMasterValue: " ",
//         L58Order: tag.order || 0
//       })),
//       sValidation: validationType,
//       sSendLabel: isLocked ? t('button.update') : t('button.lock'),
//       ManualOrder: false,
//       LIMSobj: null,
//       ActiveUserDetails: activeUserDetails,
//       ApplicationCode: "SDMS"
//     };
    
//     if (auditData) {
//       lockData.lockinstdetails.AuditTrailValues = auditData;
//     }
    
//     if (isInterface) {
//       lockData.lockinstdetails.audittrailforinterfaceinstrument = true;
//     }
    
//     if (isLimsOrderEnabled && formData.limsOrder) {
//       const limsOrderItem = limsOrderOptions.find(lo => lo.value === formData.limsOrder);
//       if (limsOrderItem) {
//         lockData.ManualOrder = false;
//         const returnObject = {};
//         Object.keys(limsOrderItem).forEach(key => {
//           if (!['uid', 'boundindex', 'uniqueid', 'visibleindex'].includes(key)) {
//             returnObject[key] = limsOrderItem[key];
//           }
//         });
//         lockData.LIMSobj = returnObject;
//       }
//     }
    
//     const encodeXmlText = (text) => {
//       if (!text) return '';
//       return String(text)
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&apos;');
//     };
    
//     const templateName = lockData.sTemplateName;
//     const encodedTemplateName = encodeXmlText(templateName);
    
//     let xMasterXml = "<Sheet1>";
//     let xDetailsXml = "<Sheet1>";
    
//     xMasterXml += "<Row>";
//     xMasterXml += `<Template>${encodedTemplateName}</Template>`;
    
//     xDetailsXml += `<Row><Category>Template</Category><Value>${encodedTemplateName}</Value></Row>`;
    
//     tags.forEach(tag => {
//       if (tag.value) {
//         const encodedTagName = encodeXmlText(tag.tagName);
//         const encodedTagValue = encodeXmlText(tag.value);
        
//         xMasterXml += `<${encodedTagName}>${encodedTagValue}</${encodedTagName}>`;
//         xDetailsXml += `<Row><Category>${encodedTagName}</Category><Value>${encodedTagValue}</Value></Row>`;
//       }
//     });
    
//     xMasterXml += "</Row></Sheet1>";
//     xDetailsXml += "</Sheet1>";
    
//     lockData.lockinstdetails.xMasterXml = xMasterXml;
//     lockData.lockinstdetails.xDetailsXml = xDetailsXml;
    
//     return lockData;
//   }, [formData, tags, instrumentOptions, pathOptions, templateOptions, 
//       isFileNameEnabled, isLimsOrderEnabled, isLocked, limsOrderOptions, isInterfaceInstrument, t]);

//   const performLockAction = useCallback(async (auditData = null, validationType = "CheckAndInsert") => {
//     try {
//       const lockData = prepareLockData(auditData, validationType);
      
//       const isInterface = isInterfaceInstrument(formData.instrument);
//       if (isInterface && auditData) {
//         lockData.lockinstdetails.audittrailforinterfaceinstrument = false;
//       }
      
//       await performLockActionWithData(lockData);
//     } catch (error) {
//       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [formData, tags, prepareLockData, t]);

//   const performLockActionWithData = async (lockData) => {
//     try {
//       setIsSubmitting(true);
//       const result = await makeAjaxCall(endpoints.lockInstrument, lockData, "LockInstrument");
      
//       if (result?.oResObj?.bStatus === true) {
//         const successMessage = result.oResObj.sInformation || t('instrumentlocktag.instrumentlockedsuccessfully');
        
//         setIsLocked(true);
//         setIsAutoLocked(false);
//         setLockedByOtherUser(false);
        
//         if (result.oResObj.nMergeFileCount) {
//           setFormData(prev => ({ 
//             ...prev, 
//             mergeFileCount: String(result.oResObj.nMergeFileCount) 
//           }));
//           setSessionValue("LockedMergeCount", String(result.oResObj.nMergeFileCount));
//         } else if (result.oResObj.mergeFileCount) {
//           setFormData(prev => ({ 
//             ...prev, 
//             mergeFileCount: String(result.oResObj.mergeFileCount) 
//           }));
//           setSessionValue("LockedMergeCount", String(result.oResObj.mergeFileCount));
//         }
        
//         const instrumentId = result.oResObj.sInstrumentID || formData.instrument;
        
//         if (instrumentId) {
//           const cleanInstrumentId = instrumentId.toString().trim();
//           navigateAfterLock(cleanInstrumentId);
//         }
        
//         showErrorDialogMessage(
//           `${result.oResObj.sInstrument || t('label.instrument')} ${successMessage}`,
//           'success'
//         );
        
//       } else {
//         const errorInfo = result?.oResObj?.sInformation;
        
//         if (errorInfo === "Entering Duplicate Tag Values" || 
//             (errorInfo === "Tags has already been used. Do you want to re-use same tags for New Data Capture?" && 
//              result?.oResObj?.sValidation === "CheckAndInsert")) {
//           showErrorDialogMessage(
//             t('instrumentlocktag.confirmationtagsalreadyexist'),
//             'confirmation',
//             async () => {
//               lockData.sValidation = "Insert";
//               lockData.lockinstdetails.sValidation = "Insert";
//               await performLockActionWithData(lockData);
//             }
//           );
//           return;
//         }
        
//         if (errorInfo === "Merge Break") {
//           showErrorDialogMessage(t('instrumentlocktag.mergebreak'), 'error');
//         } else if (errorInfo === "This instrument is already locked by other user") {
//           showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadylockedbyotheruser'), 'error');
//           setIsLocked(true);
//           setLockedByOtherUser(true);
//         } else if (errorInfo === "Merge Count should not be Lesser than Current Parsing Count") {
//           showErrorDialogMessage(t('instrumentlocktag.mergecountshouldnotbelesserthancurrentparsingcount'), 'error');
//         } else if (errorInfo) {
//           showErrorDialogMessage(errorInfo, 'error');
//         } else {
//           showErrorDialogMessage(t('instrumentlocktag.failedtolockinstrument'), 'error');
//         }
//       }
//     } catch (error) {
//       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

// const handleUnlockSuccess = useCallback(async (result) => {
//   const successMessage = result?.oResObj?.sInformation || t('instrumentlocktag.instrumentunlockedsuccessfully');
//   const instrumentName = result?.oResObj?.sInstrument || t('label.instrument');
  
//   setIsLocked(false);
//   setIsAutoLocked(false);
//   setLockedByOtherUser(false);
  
//   const currentTemplate = formData.template;
  
//   setFormData(prev => ({
//     ...prev,
//     fileName: '',
//     mergeFileCount: getSessionValue("MergeCount") || '1',
//     currentFileCount: '0',
//     lockID: '',
//     interfaceOrderID: '',
//     unlockAfterCapture: false,
//     limsOrder: '',
//     limsOrderID: '',
//     limsSampleID: '',
//     limsTestCode: '',
//     limsReplicateID: '',
//     template: currentTemplate
//   }));
  
//   setErrors({});
//   setTagErrors({});
  
//   setTags(prev => prev.map(tag => ({
//     ...tag,
//     value: '',
//     valueID: '',
//     options: tag.tagID === 1 ? tag.options : []
//   })));
  
//   showErrorDialogMessage(
//     `${instrumentName} ${successMessage}`,
//     'success'
//   );
// }, [t, formData.template]);

//   const prepareUnlockData = useCallback((auditData = null, mergebreak = "true") => {
//     const activeUserDetails = getActiveUserDetails();
//     const pathItem = pathOptions.find(p => p.value === formData.path);
//     const instrumentItem = instrumentOptions.find(i => i.value === formData.instrument);
//     const templateItem = templateOptions.find(t => t.value === formData.template);
    
//     const limsObj = {};
    
//     const limsOrderVal = formData.limsOrder;
//     const nOrderID = limsOrderVal === "" ? 0 : parseInt(limsOrderVal) || 0;
//     limsObj["nOrderID"] = nOrderID;
    
//     if (isInterfaceInstrument(formData.instrument)) {
//       if (formData.limsSampleID) limsObj["SampleID"] = formData.limsSampleID;
//       if (formData.limsTestCode) limsObj["TestCode"] = formData.limsTestCode;
//       if (formData.limsReplicateID) limsObj["ReplicateID"] = formData.limsReplicateID;
//     }
    
//     const unlockObjDet = {
//       nMergeFileCount: formData.mergeFileCount || "1",
//       sTaskID: formData.path || "",
//       nProtocolStatus: parseInt(formData.protocolID) || 0,
//       sFileName: formData.fileName || "",
//       sUserID: formData.user || activeUserDetails.sUserID,
//       nInterFaceOrderID: formData.interfaceOrderID || "",
//       sTaskSourcePath: pathItem?.label || "",
//       sInstrumentID: (formData.instrument || "").padEnd(10, ' '),
//       sScheduleID: pathItem?.originalItem?.L13ScheduleID || "",
//       sTemplateID: formData.template || ""
//     };
    
//     const unlockData = {
//       sTemplateName: templateItem?.label || "",
//       unlockObjDet: unlockObjDet,
//       sInstrumentName: instrumentItem?.label || "",
//       limsObj: limsObj,
//       mergebreak: mergebreak,
//       ActiveUserDetails: activeUserDetails,
//       ApplicationCode: "SDMS"
//     };
    
//     if (auditData) {
//       unlockData.AuditTrailValues = auditData;
//     }
    
//     return unlockData;
//   }, [formData, instrumentOptions, pathOptions, templateOptions, isInterfaceInstrument]);

//   const performUnlockAction = useCallback(async (auditData = null, mergebreak = "true") => {
//     try {
//       if (!formData.instrument || !formData.path) {
//         showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
//         return;
//       }
      
//       setIsSubmitting(true);
//       const unlockData = prepareUnlockData(auditData, mergebreak);
      
//       const result = await makeAjaxCall(endpoints.unLockInstrument, unlockData, "UnLockInstrument");
      
//       if (result?.AuditTrailLogin !== undefined && result.AuditTrailLogin === false) {
//         showErrorDialogMessage(result.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'), 'error');
//         return;
//       }
      
//       if (result?.oResObj?.bForceUnlock === true) {
//         if (mergebreak === "true") {
//           setAuditAction('unlock');
//           setAuditCallback(() => async (forceAuditData) => {
//             await performUnlockAction(forceAuditData, "false");
//           });
//           setShowAuditTrail(true);
//         } else {
//           await handleUnlockSuccess(result);
//         }
//       } 
//       else if (result?.oResObj?.bStatus === true) {
//         await handleUnlockSuccess(result);
//       } 
//       else {
//         showErrorDialogMessage(result?.oResObj?.sInformation || t('instrumentlocktag.failedtounlockinstrument'), 'error');
//       }
      
//     } catch (error) {
//       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [formData, prepareUnlockData, t, handleUnlockSuccess]);

//   const checkInterfaceConnection = useCallback(async (instrumentId) => {
//     const isInterface = isInterfaceInstrument(instrumentId);
    
//     if (!isInterface) {
//       return { needsCheck: false, isConnected: true };
//     }
    
//     const interfaceInstId = instrumentId.includes(':') ? 
//       parseInt(instrumentId.split(':')[1].trim()) : 0;
    
//     if (interfaceInstId <= 0) {
//       return { needsCheck: false, isConnected: true };
//     }
    
//     try {
//       setIsLoading(true);
//       const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
//         InterfaceInstID: interfaceInstId
//       }, "InterfaceConnectionChecking");
      
//       if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
//         const accessStatus = connectionResult[0].AccessStatus;
//         return { 
//           needsCheck: true, 
//           isConnected: accessStatus === 1,
//           data: connectionResult[0]
//         };
//       }
//     } catch (error) {
//       // Silent error handling
//     } finally {
//       setIsLoading(false);
//     }
    
//     return { needsCheck: false, isConnected: true };
//   }, [isInterfaceInstrument, t]);

//   const handleUnlock = useCallback(async () => {
//     if (!isLocked) {
//       showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
//       return;
//     }

//     if (isAutoLocked) {
//       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
//       return;
//     }

//     const validateCurrentLockStatus = async () => {
//       try {
//         if (!formData.instrument) return;
        
//         setIsLoading(true);
//         const response = await onChangeInstrumentCombo(formData.instrument);
        
//         if (response) {
//           if (response.sLockType === 'A') {
//             setIsAutoLocked(true);
//             setIsLocked(true);
//             setLockedByOtherUser(false);
//             showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
//             return false;
//           } else if (response.sUserID) {
//             setIsLocked(true);
//             setIsAutoLocked(false);
            
//             const activeUserDetails = getActiveUserDetails();
//             const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
            
//             if (response.sUserID.trim() === currentUserId) {
//               setLockedByOtherUser(false);
//               return true;
//             } else {
//               setLockedByOtherUser(true);
//               showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
//               return false;
//             }
//           } else {
//             setIsLocked(false);
//             setIsAutoLocked(false);
//             setLockedByOtherUser(false);
//             showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
//             return false;
//           }
//         }
//         return false;
//       } catch (error) {
//         return false;
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const newErrors = {};
//     let isValid = true;
    
//     if (!formData.instrument) {
//       newErrors.instrument = true;
//       isValid = false;
//     }
    
//     if (!formData.path) {
//       newErrors.path = true;
//       isValid = false;
//     }
    
//     setErrors(newErrors);
    
//     if (!isValid) {
//       showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
//       return;
//     }

//     const canProceedWithUnlock = await validateCurrentLockStatus();
//     if (!canProceedWithUnlock) {
//       return;
//     }

//     if (lockedByOtherUser) {
//       const activeUserDetails = getActiveUserDetails();
//       const isAdmin = activeUserDetails.sUsername === "Administrator" || 
//                      activeUserDetails.ActiveUserDetails?.sUsername === "Administrator";
      
//       if (!isAdmin) {
//         showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
//         return;
//       }
//     }

//     const scheduleData = getDeactiveScheduleDataRef.current;
//     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
//       const hasAuditTrailRights = true;
      
//       if (hasAuditTrailRights) {
//         setAuditAction('unlock');
//         setAuditCallback(() => async (auditData) => {
//           await performUnlockAction(auditData);
//         });
//         setShowAuditTrail(true);
//         return;
//       }
//     }
    
//     await performUnlockAction();
//   }, [isLocked, isAutoLocked, lockedByOtherUser, formData.instrument, formData.path, performUnlockAction, onChangeInstrumentCombo, t]);

//   const handleLock = useCallback(async () => {
//     if (!validateFormForLock()) {
//       return;
//     }
    
//     if (isAutoLocked) {
//       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
//       return;
//     }
    
//     setIsSubmitting(true);
    
//     const isInterface = isInterfaceInstrument(formData.instrument);
    
//     if (isInterface) {
//       const interfaceInstId = formData.instrument.includes(':') ? 
//         parseInt(formData.instrument.split(':')[1].trim()) : 0;
      
//       if (interfaceInstId > 0) {
//         try {
//           setIsLoading(true);
//           const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
//             InterfaceInstID: interfaceInstId
//           }, "InterfaceConnectionChecking");
          
//           if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
//             const connectionData = connectionResult[0];
            
//             if (connectionData.AuditTrailLogin === false) {
//               showErrorDialogMessage(
//                 connectionData.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'),
//                 'error'
//               );
//               setIsSubmitting(false);
//               setIsLoading(false);
//               return;
//             }
            
//             const accessStatus = connectionData.AccessStatus;
            
//             if (accessStatus == 1 || accessStatus === "1") {
//               // Interface is connected - continue with normal flow
//             } else {
//               setIsSubmitting(false);
//               setIsLoading(false);
//               showErrorDialogMessage(
//                 t('instrumentlocktag.interfacerinstrumentisnotconnected'),
//                 'confirmation',
//                 async () => {
//                   setIsSubmitting(true);
//                   const scheduleData = getDeactiveScheduleDataRef.current;
//                   if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
//                     const hasAuditTrailRights = true;
                    
//                     if (hasAuditTrailRights) {
//                       setIsSubmitting(false);
//                       setAuditAction('lock');
//                       setAuditCallback(() => async (auditData) => {
//                         await performLockAction(auditData);
//                       });
//                       setShowAuditTrail(true);
//                       return;
//                     }
//                   }
                  
//                   await performLockAction();
//                 }
//               );
//               return;
//             }
//           }
//         } catch (error) {
//           // Continue with lock even if check fails
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     }
    
//     const scheduleData = getDeactiveScheduleDataRef.current;
//     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
//       const hasAuditTrailRights = true;
      
//       if (hasAuditTrailRights) {
//         setIsSubmitting(false);
//         setAuditAction('lock');
//         setAuditCallback(() => async (auditData) => {
//           await performLockAction(auditData);
//         });
//         setShowAuditTrail(true);
//         return;
//       }
//     }
    
//     await performLockAction();
//   }, [validateFormForLock, isAutoLocked, formData.instrument, performLockAction, isInterfaceInstrument, t]);

//   const handleUpdate = useCallback(async () => {
//     if (!validateFormForLock()) {
//       return;
//     }
    
//     if (isAutoLocked) {
//       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
//       return;
//     }
    
//     setIsSubmitting(true);
//     await performLockAction();
//   }, [validateFormForLock, isAutoLocked, performLockAction]);

//   const handleFormChange = useCallback((field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     setErrors(prev => ({ ...prev, [field]: false }));
//   }, []);

//   const getFieldDisabledState = useMemo(() => {
//   // Check if we're loading from scheduler
//   const isFromScheduler = isLoadingFromScheduler || 
//                          sessionStorage.getItem('fromScheduler') === 'true';
  
//   if (isFromScheduler && !hasLoadedFromNavigation) {
//     // When loading from scheduler but not yet fully loaded
//     return {
//       client: true,
//       instrument: true,
//       path: true,
//       limsOrder: true,
//       fileName: true,
//       template: true,
//       mergeCount: true,
//       unlockCheckbox: true,
//       tags: true,
//       lockButton: true,
//       unlockButton: true
//     };
//   }
  
//   if (isFromScheduler && hasLoadedFromNavigation) {
//     // When fully loaded from scheduler
//     return {
//       client: true,           // Read-only from scheduler
//       instrument: true,       // Read-only from scheduler
//       path: true,            // Read-only from scheduler
//       limsOrder: false,      // Editable
//       fileName: false,       // Editable
//       template: false,       // Editable (can change if needed)
//       mergeCount: false,     // Editable
//       unlockCheckbox: false, // Editable
//       tags: false,           // Editable
//       lockButton: false,     // Enabled for locking
//       unlockButton: true     // Disabled until locked
//     };
//   }
//     if (isAutoLocked) {
//       return {
//         client: false,
//         instrument: false,
//         path: false,
//         limsOrder: true,
//         fileName: true,
//         template: false,
//         mergeCount: true,
//         unlockCheckbox: true,
//         tags: false,
//         lockButton: true,
//         unlockButton: true
//       };
//     }
    
//     if (isLocked && !lockedByOtherUser) {
//       return {
//         client: false,
//         instrument: false,
//         path: true,
//         limsOrder: false,
//         fileName: false,
//         template: true,
//         mergeCount: false,
//         unlockCheckbox: false,
//         tags: false,
//         lockButton: false,
//         unlockButton: false
//       };
//     }
    
//     if (isLocked && lockedByOtherUser) {
//       return {
//         client: false,
//         instrument: false,
//         path: true,
//         limsOrder: false,
//         fileName: true,
//         template: true,
//         mergeCount: true,
//         unlockCheckbox: true,
//         tags: true,
//         lockButton: true,
//         unlockButton: false
//       };
//     }
    
//     return {
//       client: false,
//       instrument: false,
//       path: false,
//       limsOrder: false,
//       fileName: false,
//       template: false,
//       mergeCount: false,
//       unlockCheckbox: false,
//       tags: false,
//       lockButton: false,
//       unlockButton: true
//     };
// }, [isLocked, lockedByOtherUser, isAutoLocked, isLoadingFromScheduler, hasLoadedFromNavigation]);

//   return (
//     <div >
//       <FullPageLoader loading={showFullPageLoader} text={
//         isSubmitting ? t('common.loading') :
//         t('common.loading')
//       } />
      
//       <div className="bg-white px-4 py-4">
//         <div className="max-w-[1100px]">
//           <div className="grid grid-cols-2">
//             <div className="max-w-[400px]">
//               <div className="mb-7">
//                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
//                   {t('label.client')}
//                 </label>
//                 <div className="relative">
//                   <AnimatedDropdown
//   value={formData.client}
//   onChange={(e) => handleClientChange(e.target.value)}
//   disabled={getFieldDisabledState.client || isLoading || isLoadingFromScheduler}
//   options={clientOptions}
//   displayKey="label"
//   valueKey="value"
//   allowFreeInput
//   showError={errors.client}
//   className="text-xs"
// />
//                 </div>
//               </div>

//               <div className="mb-5">
//                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
//                   {t('label.instrument')} <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                  <AnimatedDropdown
//   value={formData.instrument}
//   onChange={(e) => handleInstrumentChange(e.target.value)}
//   disabled={getFieldDisabledState.instrument || isLoading || isLoadingFromScheduler}
//   options={instrumentOptions}
//   displayKey="label"
//   valueKey="value"
//   allowFreeInput
//   showError={errors.instrument}
//   className="text-xs"
// />
//                 </div>
//                 {isAutoLocked && (
//                   <div className="mt-0 text-sm bg-[#d9534f] font-roboto text-white">
//                     {t('instrumentlocktag.thisinstrumentisalreadyautolocked')}
//                   </div>
//                 )}
//               </div>

//               <div className="mb-7">
//                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
//                   {t('instrumentlocktag.path')} <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <AnimatedDropdown
//   value={formData.path}
//   onChange={(e) => handlePathChange(e.target.value)}
//   disabled={getFieldDisabledState.path || isLoading || isLoadingFromScheduler}
//   options={pathOptions}
//   displayKey="label"
//   valueKey="value"
//   allowFreeInput
//   showError={errors.path}
//   className="text-xs"
// />
//                 </div>
//               </div>

//               <div className="mb-7">
//                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
//                   {t('instrumentlocktag.limsorder')}
//                 </label>
//                 <div className="relative">
//                  <AnimatedDropdown
//   value={formData.limsOrder}
//   onChange={(e) => {
//     const selectedValue = e.target.value;
//     const selectedOrder = limsOrderOptions.find(order => order.value === selectedValue);
    
//     setFormData(prev => ({
//       ...prev,
//       limsOrder: selectedValue,
//       limsOrderID: selectedValue,
//       limsSampleID: selectedOrder?.sampleID || '',
//       limsTestCode: selectedOrder?.testCode || '',
//       limsReplicateID: selectedOrder?.replicateID || ''
//     }));
//   }}
//   disabled={!isLimsOrderEnabled || getFieldDisabledState.limsOrder || isLoading}
//   options={limsOrderOptions}
//   displayKey="label"
//   valueKey="value"
//   allowFreeInput={true} // Ensure free text input is allowed
//   className="text-xs flex-1"
// />
//                 </div>
//               </div>

//               <div className="mb-7">
//                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
//                   {t('instrumentlocktag.filename')} {isFileNameEnabled && <span className="text-red-500">*</span>}
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.fileName}
//                   onChange={(e) => handleFormChange('fileName', e.target.value)}
//                   disabled={!isFileNameEnabled || getFieldDisabledState.fileName || isLoading}
//                   className={`w-full h-7 px-0 text-xs bg-[#f3f3f3] border-0 border-b-2 outline-none font-semibold font-['verdana']
//                     ${errors.fileName ? 'border-red-400 text-[#A94442]' : 'border-gray-300 text-[#373737]'}`}
//                 />
//               </div>

//               {showMergeFields && (
//                 <MergeFileCountRow
//                   mergeCount={formData.mergeFileCount}
//                   currentCount={formData.currentFileCount}
//                   onMergeChange={handleMergeCountChange}
//                   disabled={!isInstrumentInterface || getFieldDisabledState.mergeCount || isLoading}
//                   showMergeFields={showMergeFields}
//                   t={t}
//                 />
//               )}

//               {showUnlockOption && (
//                 <div className="flex items-center mb-3 gap-4">
//                   <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
//                     {t('instrumentlocktag.unlockaftercapture')}
//                   </label>
//                   <input
//                     type="checkbox"
//                     checked={formData.unlockAfterCapture}
//                     onChange={(e) => handleFormChange('unlockAfterCapture', e.target.checked)}
//                     disabled={getFieldDisabledState.unlockCheckbox || isLoading}
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
//                   />
//                 </div>
//               )}
//             </div>

//             <div className='max-w-[1300px]'>
//               <div className="max-w-[350px]">
//                 <div className="mb-7">
//                   <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
//                     {t('instrumentlocktag.template')} <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <AnimatedDropdown
//                       value={formData.template}
//                       onChange={(e) => handleTemplateChange(e.target.value)}
//                       disabled={getFieldDisabledState.template || isLoading}
//                       options={templateOptions}
//                       displayKey="label"
//                       valueKey="value"
//                       showError={errors.template}
//                       className="text-xs"
//                     />
//                   </div>
//                 </div>
//               </div>
              
//               <div className="mt-7 max-w-[1300px]">
//                 <div className="max-w-[550px]">
//                   <TagGrid
//                     tags={tags}
//                     onTagValueClick={handleTagValueClick}
//                     onTagEditRequest={handleTagEditRequest}
//                     onInlineEditSubmit={handleInlineEditSubmit}
//                     isLoadingTags={isLoadingTags}
//                     isLocked={isLocked}
//                     lockedByOtherUser={lockedByOtherUser}
//                     isAutoLocked={isAutoLocked}
//                     t={t}
//                     tagErrors={tagErrors}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <div className="flex justify-end gap-2 ml-4 mr-4 mt-3 pt-5 border-t border-gray-200">
//   <button
//     onClick={isLocked && !lockedByOtherUser && !isAutoLocked ? handleUpdate : handleLock}
//     disabled={getFieldDisabledState.lockButton || showFullPageLoader}
//     className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
//       ${getFieldDisabledState.lockButton || showFullPageLoader
//         ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
//         : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
//     `}
//   >
//     {isLocked && !lockedByOtherUser && !isAutoLocked ? <UpdateIcon /> : <LockIcon />}
//     <span>
//       {isLocked && !lockedByOtherUser && !isAutoLocked ? t('button.update') : t('button.lock')}
//     </span>
//   </button>

//   <button
//     onClick={handleUnlock}
//     disabled={getFieldDisabledState.unlockButton || showFullPageLoader}
//     className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
//       ${getFieldDisabledState.unlockButton || showFullPageLoader
//         ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
//         : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
//     `}
//   >
//     <UnlockIcon />
//     <span>{t('button.unlock')}</span>
//   </button>
// </div>

//       <AuditTrail
//         isOpen={showAuditTrail}
//         onClose={() => setShowAuditTrail(false)}
//         onAuthorized={(auditData) => {
//           setShowAuditTrail(false);
//           if (auditCallback) {
//             auditCallback(auditData);
//           }
//           setAuditAction(null);
//           setAuditCallback(null);
//         }}
//         actionLabel={auditAction === 'lock' ? t('button.lock') : 
//                     auditAction === 'unlock' ? t('button.unlock') : 
//                     t('button.update')}
//         defaultReason={auditAction === 'lock' ? t('instrumentlocktag.instrumentlocked') : 
//                       auditAction === 'unlock' ? t('instrumentlocktag.instrumentunlocked') : 
//                       t('instrumentlocktag.instrumentupdated')}
//         disableReason={false}
//       />

//       {showErrorDialog && (
//         <Errordialog
//           message={errorDialogMessage}
//           type={errorDialogType}
//           onClose={handleErrorDialogClose}
//           showCancel={errorDialogType === 'confirmation'}
//           onCancel={handleErrorDialogClose}
//           onConfirm={errorDialogType === 'confirmation' ? handleErrorDialogConfirm : undefined}
//           cancelText={t('button.cancel')}
//           okText={t('button.ok')}
//         />
//       )}
//     </div>
//   );
// };

// export default InstrumentLockTag;


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

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [errorDialogType, setErrorDialogType] = useState('information');
  const [errorDialogCallback, setErrorDialogCallback] = useState(null);
  const [isLoadingFromScheduler, setIsLoadingFromScheduler] = useState(false);
  const [hasLoadedFromNavigation, setHasLoadedFromNavigation] = useState(false);

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

  // Handle navigation data from scheduler
  // 1. Fix the useEffect that handles navigationData - make it more robust:
useEffect(() => {
  console.log('🔍 Navigation data received FULL:', navigationData);
  
  // Handle direct navigation data
  if (navigationData?.data?.fromScheduler) {
    const schedulerData = navigationData.data;
    console.log('🚀 Processing DIRECT scheduler navigation:', schedulerData);
    
    // Clear previous scheduler data
    sessionStorage.removeItem('fromScheduler');
    sessionStorage.removeItem('schedulerData');
    
    // Store new data
    sessionStorage.setItem('fromScheduler', 'true');
    sessionStorage.setItem('schedulerData', JSON.stringify(schedulerData));
    
    // Reset loading state
    setHasLoadedFromNavigation(false);
    
    // Process scheduler data immediately
    handleSchedulerNavigation(schedulerData);
  }
  
  // Also check for nested data structure
  if (navigationData?.data?.data?.fromScheduler) {
    const schedulerData = navigationData.data.data;
    console.log('🚀 Processing NESTED scheduler navigation:', schedulerData);
    
    // Clear previous scheduler data
    sessionStorage.removeItem('fromScheduler');
    sessionStorage.removeItem('schedulerData');
    
    // Store new data
    sessionStorage.setItem('fromScheduler', 'true');
    sessionStorage.setItem('schedulerData', JSON.stringify(schedulerData));
    
    // Reset loading state
    setHasLoadedFromNavigation(false);
    
    // Process scheduler data immediately
    handleSchedulerNavigation(schedulerData);
  }
}, [navigationData]);


// 3. Add helper functions for scheduler loading:
const loadTemplatesForScheduler = async () => {
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
      console.log('✅ Templates loaded for scheduler:', sortedTemplates.length);
    }
  } catch (error) {
    console.error('Error loading templates for scheduler:', error);
  }
};

const loadAndSetClient = async (clientId) => {
  try {
    console.log('👥 Loading and setting client:', clientId);
    
    const response = await makeAjaxCall(endpoints.clientLockCombo, {
      sTaskStatus: 'A',
      sClientID: clientId || ''
    });

    if (Array.isArray(response) && response.length > 0) {
      const clientOptionsData = response.map(client => ({
        value: client.sClientID ? client.sClientID.trim() : '',
        label: client.sClientName || t('instrumentlocktag.unknownclient')
      }));

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
      }
    }
    return false;
  } catch (error) {
    console.error('Error loading client:', error);
    return false;
  }
};


// 1. Update the loadAndSetPath function to load AFTER instrument is set:
const loadAndSetPath = async (sourcePath, specificInstrumentId = null) => {
  try {
    // Use specific instrument ID if provided, otherwise use formData.instrument
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
        // Clean the source path for comparison
        const cleanSourcePath = sourcePath.toLowerCase().trim().replace(/\\/g, '/');
        console.log('🔍 Looking for path matching:', cleanSourcePath);
        
        // Try different matching strategies
        selectedPath = pathOptionsData.find(p => {
          if (!p.label) return false;
          
          const cleanPathLabel = p.label.toLowerCase().trim().replace(/\\/g, '/');
          console.log('📁 Comparing path:', cleanPathLabel);
          
          // 1. Exact match
          if (cleanPathLabel === cleanSourcePath) {
            console.log('✅ Exact path match found');
            return true;
          }
          
          // 2. Ends with match (source path is at the end)
          if (cleanPathLabel.endsWith(cleanSourcePath)) {
            console.log('✅ Path ends with source path');
            return true;
          }
          
          // 3. Contains match
          if (cleanPathLabel.includes(cleanSourcePath)) {
            console.log('✅ Path contains source path');
            return true;
          }
          
          // 4. Source path contains path label
          if (cleanSourcePath.includes(cleanPathLabel)) {
            console.log('✅ Source path contains path label');
            return true;
          }
          
          // 5. Check last segment match
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

      // Fallback to first path
      if (!selectedPath && pathOptionsData.length > 0) {
        selectedPath = pathOptionsData[0];
        console.log('📌 Using first path as fallback:', selectedPath.label);
      }

      if (selectedPath) {
        console.log('✅ Setting selected path:', selectedPath.value, '->', selectedPath.label);
        
        // Update form data with the path
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
// 2. Update the handleSchedulerNavigation to properly sequence path loading:
const handleSchedulerNavigation = async (data) => {
  console.log('🚀 Starting COMPLETE scheduler navigation with:', data);
   
  setIsLoadingFromScheduler(true);
  setHasLoadedFromNavigation(false);
  
  try {
    // Clear previous options
    setInstrumentOptions([]);
    setPathOptions([]);
    setTags([]);
    
    // Step 1: Load templates first if not loaded
    if (templateOptions.length === 0) {
      console.log('⏳ Loading templates first...');
      await loadTemplatesForScheduler();
    }
    
    // Step 2: Set initial form data (excluding instrument and path initially)
const initialData = {
  client: data.clientId?.trim() || '',
  fileName: data.fileName?.trim() || '',
  template: data.templateId?.trim() || '',
  // If no templateId from scheduler, auto-select first template
  instrument: '', // Will be set after loading
  path: '',       // Will be set after instrument
  limsOrder: ''
};

// If no template from scheduler and we have templates, auto-select first one
if (!initialData.template && templateOptions.length > 0) {
  initialData.template = templateOptions[0].value;
  console.log('📋 Scheduler: Auto-selecting first template:', initialData.template);
}
    
    // Step 3: Load and set the client
    let clientLoaded = false;
    if (data.clientId) {
      clientLoaded = await loadAndSetClient(data.clientId.trim());
    }
    
    if (!clientLoaded) {
      console.error('❌ Failed to load client, cannot proceed');
      setIsLoadingFromScheduler(false);
      return;
    }
    
    // Step 4: Load instruments for this client
    console.log('🎯 Loading instruments for client:', data.clientId);
    const instruments = await loadInstrumentsForScheduler(data.clientId.trim());
    
    if (instruments.length === 0) {
      console.error('❌ No instruments found for client');
      setIsLoadingFromScheduler(false);
      return;
    }
    
    // Step 5: Find the matching instrument
    let targetInstrument = null;
    const dropdownValue = data.dropdownInstrumentId?.trim() || '';
    
    console.log('🔍 Looking for instrument matching:', dropdownValue);
    
    // Strategy 1: Exact match with value
    targetInstrument = instruments.find(inst => 
      inst.value === dropdownValue
    );
    
    // Strategy 2: Match by label (instrument name)
    if (!targetInstrument && data.instrumentName) {
      targetInstrument = instruments.find(inst => 
        inst.label.toLowerCase().includes(data.instrumentName.toLowerCase()) ||
        data.instrumentName.toLowerCase().includes(inst.label.toLowerCase())
      );
    }
    
    // Strategy 3: Contains match for partial values
    if (!targetInstrument) {
      targetInstrument = instruments.find(inst => 
        dropdownValue.includes(inst.value) || 
        inst.value.includes(dropdownValue)
      );
    }
    
    // Fallback to first instrument
    if (!targetInstrument && instruments.length > 0) {
      targetInstrument = instruments[0];
      console.log('📌 Using first instrument as fallback:', targetInstrument.label);
    }
    
    if (!targetInstrument) {
      console.error('❌ Could not find any matching instrument');
      setIsLoadingFromScheduler(false);
      return;
    }
    
    console.log('✅ Found target instrument:', {
      value: targetInstrument.value,
      label: targetInstrument.label
    });
    
    // Step 6: Set the instrument in form data
    setFormData(prev => ({ 
      ...prev, 
      instrument: targetInstrument.value,
      path: '' // Clear path initially
    }));
    
    // Step 7: Load instrument details
setIsLoading(true);
try {
  // Load protocol and instrument data
  await loadProtocol(targetInstrument.value);
  
  // Check if it's an interface instrument
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
  
  // Load instrument combo data
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
    
    // For auto-locked instruments, force first template
    if (instrumentData.sLockType === 'A' && templateOptions.length > 0) {
      const firstTemplateValue = templateOptions[0].value;
      updates.template = firstTemplateValue;
      console.log('🔒 Scheduler: Auto-locked instrument, setting first template:', firstTemplateValue);
    }
    else if (instrumentData.sTemplateID && instrumentData.sTaskID) {
      updates.template = instrumentData.sTemplateID;
    }
    else if (templateOptions.length > 0 && !formData.template) {
      // Auto-select first template for non-auto-locked instruments too
      updates.template = templateOptions[0].value;
      console.log('📋 Scheduler: Auto-selecting first template');
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  }
} catch (error) {
  console.error('❌ Error loading instrument details:', error);
} finally {
  setIsLoading(false);
}
    
    // Step 8: Load and set the path - THIS IS THE KEY FIX
    if (data.sourcePath) {
      console.log('🛣️ Loading scheduler path:', data.sourcePath);
      
      // Wait a bit for instrument state to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load paths for this instrument
      const pathsResponse = await makeAjaxCall(endpoints.lockPathCombo, {
        sInstrumentID: targetInstrument.value,
        sScheduleID: "",
        sClientID: data.clientId?.trim() || ''
      });
      
      if (Array.isArray(pathsResponse) && pathsResponse.length > 0) {
        const pathOptionsData = pathsResponse.map(path => ({
          value: path.sTaskID ? path.sTaskID.trim() : '',
          label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
          originalItem: path
        }));
        
        console.log('🛣️ Available paths:', pathOptionsData.length);
        setPathOptions(pathOptionsData);
        
        // Find matching path
        let selectedPath = null;
        const sourcePath = data.sourcePath.trim();
        
        // Try multiple matching strategies
        const cleanSourcePath = sourcePath.toLowerCase().replace(/\\/g, '/');
        
        // 1. Exact match
        selectedPath = pathOptionsData.find(p => {
          if (!p.label) return false;
          return p.label.toLowerCase().replace(/\\/g, '/') === cleanSourcePath;
        });
        
        // 2. Path ends with source path
        if (!selectedPath) {
          selectedPath = pathOptionsData.find(p => {
            if (!p.label) return false;
            return p.label.toLowerCase().replace(/\\/g, '/').endsWith(cleanSourcePath);
          });
        }
        
        // 3. Source path ends with path
        if (!selectedPath) {
          selectedPath = pathOptionsData.find(p => {
            if (!p.label) return false;
            return cleanSourcePath.endsWith(p.label.toLowerCase().replace(/\\/g, '/'));
          });
        }
        
        // 4. Contains match
        if (!selectedPath) {
          selectedPath = pathOptionsData.find(p => {
            if (!p.label) return false;
            return p.label.toLowerCase().includes(cleanSourcePath) || 
                   cleanSourcePath.includes(p.label.toLowerCase());
          });
        }
        
        // 5. Last segment match
        if (!selectedPath) {
          const sourceLastSegment = cleanSourcePath.split('/').pop();
          selectedPath = pathOptionsData.find(p => {
            if (!p.label) return false;
            const pathLastSegment = p.label.toLowerCase().replace(/\\/g, '/').split('/').pop();
            return pathLastSegment === sourceLastSegment;
          });
        }
        
        if (selectedPath) {
          console.log('✅ Found matching path:', selectedPath.label);
          
          // Set the path in form data
          setFormData(prev => ({
            ...prev,
            path: selectedPath.value
          }));
        } else if (pathOptionsData.length > 0) {
          // Fallback to first path
          selectedPath = pathOptionsData[0];
          console.log('📌 No exact match, using first path:', selectedPath.label);
          setFormData(prev => ({
            ...prev,
            path: selectedPath.value
          }));
        }
      }
    }
    
    // Step 9: Load tags if we have template and instrument
    if (data.templateId?.trim() && targetInstrument.value) {
      console.log('🔍 Scheduling tag loading for template:', data.templateId.trim());
      
      // Wait for everything to settle before loading tags
      setTimeout(async () => {
        if (formData.template && formData.instrument) {
          console.log('✅ Loading tags with data ready');
          await fetchTags(formData.template, formData.instrument);
        } else {
          console.log('⚠️ Skipping tag load - missing data');
        }
      }, 1000);
    }
    
    setHasLoadedFromNavigation(true);
    console.log('✅ Scheduler navigation completed!');
    console.log('📊 Final form data:', {
      client: formData.client,
      instrument: formData.instrument,
      path: formData.path,
      template: formData.template,
      fileName: formData.fileName
    });
    
  } catch (error) {
    console.error('❌ Error in scheduler navigation:', error);
  } finally {
    setIsLoadingFromScheduler(false);
  }
};

// 3. Update the loadAndSetInstrument function to ensure it loads paths after setting:
const loadAndSetInstrument = async (clientId, instrumentValue) => {
  try {
    console.log('🎯 Loading and setting instrument. Client:', clientId, 'Instrument:', instrumentValue);
    
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
      
      setInstrumentOptions(instrumentOptionsData);
      
      // Find the matching instrument
      let targetInstrument = null;
      
      // Try different matching strategies
      const cleanInstrumentValue = instrumentValue.replace(/\s+/g, '');
      
      // Strategy 1: Exact match
      targetInstrument = instrumentOptionsData.find(inst => 
        inst.value === instrumentValue
      );
      
      // Strategy 2: Match after removing spaces
      if (!targetInstrument) {
        targetInstrument = instrumentOptionsData.find(inst => 
          inst.value.replace(/\s+/g, '') === cleanInstrumentValue
        );
      }
      
      // Strategy 3: Contains match
      if (!targetInstrument) {
        targetInstrument = instrumentOptionsData.find(inst => 
          inst.value.includes(instrumentValue) || 
          instrumentValue.includes(inst.value)
        );
      }
      
      // Fallback to first instrument
      if (!targetInstrument && instrumentOptionsData.length > 0) {
        targetInstrument = instrumentOptionsData[0];
        console.log('📌 Using first instrument as fallback');
      }
      
      if (targetInstrument) {
        console.log('✅ Found instrument:', targetInstrument.value, targetInstrument.label);
        
        setIsLoading(true);
        
        try {
          // Set the instrument
          setFormData(prev => ({ 
            ...prev, 
            instrument: targetInstrument.value,
            path: '',
            fileName: '',
            limsOrder: '',
            limsOrderID: '',
            limsSampleID: '',
            limsTestCode: '',
            limsReplicateID: ''
          }));
          
          // Clear current path options
          setPathOptions([]);
          
          // Load protocol and instrument data
          await loadProtocol(targetInstrument.value);
          
          // Check if it's an interface instrument
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
          
          // Load instrument combo data
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
            
            if (instrumentData.sTemplateID && instrumentData.sTaskID) {
              updates.template = instrumentData.sTemplateID;
            }
            else if (instrumentData.sLockType === 'A') {
              if (templateOptions.length > 0) {
                const firstTemplateValue = templateOptions[0].value;
                updates.template = firstTemplateValue;
              }
            }
            
            setFormData(prev => ({ ...prev, ...updates }));
          }
          
          // Return both success status and instrument value
          return {
            success: true,
            instrumentValue: targetInstrument.value
          };
          
        } catch (error) {
          console.error('Error setting instrument details:', error);
          return {
            success: false,
            instrumentValue: null
          };
        } finally {
          setIsLoading(false);
        }
      }
    }
    return {
      success: false,
      instrumentValue: null
    };
  } catch (error) {
    console.error('❌ Error loading instrument:', error);
    setIsLoading(false);
    return {
      success: false,
      instrumentValue: null
    };
  }
};

// 4. Add a useEffect to watch for instrument changes and load paths:
useEffect(() => {
  const loadPathsAfterInstrumentChange = async () => {
    // Only load paths if we're in scheduler mode and have an instrument
    if (isLoadingFromScheduler && formData.instrument && !formData.path) {
      const schedulerDataStr = sessionStorage.getItem('schedulerData');
      if (schedulerDataStr) {
        try {
          const schedulerData = JSON.parse(schedulerDataStr);
          if (schedulerData.sourcePath) {
            console.log('🔄 Auto-loading path after instrument change');
            await loadAndSetPath(schedulerData.sourcePath.trim());
          }
        } catch (error) {
          console.error('Error parsing scheduler data:', error);
        }
      }
    }
  };
  
  loadPathsAfterInstrumentChange();
}, [formData.instrument, isLoadingFromScheduler, formData.path]);

// Add this useEffect
useEffect(() => {
  const loadPathForScheduler = async () => {
    // Only run when we have an instrument but no path, and we're in scheduler mode
    if (isLoadingFromScheduler && formData.instrument && !formData.path) {
      const schedulerDataStr = sessionStorage.getItem('schedulerData');
      if (schedulerDataStr) {
        try {
          const schedulerData = JSON.parse(schedulerDataStr);
          if (schedulerData.sourcePath) {
            console.log('🔧 Auto-loading path after instrument was set:', formData.instrument);
            
            // Small delay to ensure everything is ready
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

// 5. Add a useEffect to debug path loading:
useEffect(() => {
  console.log('🛣️ PATH STATE DEBUG:', {
    formDataPath: formData.path,
    pathOptionsCount: pathOptions.length,
    pathOptions: pathOptions.map(p => ({ value: p.value, label: p.label })),
    isLoadingFromScheduler,
    hasLoadedFromNavigation
  });
}, [formData.path, pathOptions, isLoadingFromScheduler, hasLoadedFromNavigation]);

// 6. Update the onChangeInstrumentCombo to properly handle paths:
const onChangeInstrumentCombo = useCallback(async (instrumentId) => {
  try {
    const nLLProStatus = 0;
    const nProtocolStatus = parseInt(formData.protocolID) || 0;
    const nProtocolStatusfile = isFileNameEnabled ? 101 : 0;
    
    console.log('🔧 onChangeInstrumentCombo called with:', instrumentId);
    
    const response = await makeAjaxCall(endpoints.onChangeInstrumentCombo, {
      sInstrumentID: instrumentId,
      nLLProStatus: nLLProStatus,
      nProtocolStatus: nProtocolStatus,
      nProtocolStatusfile: nProtocolStatusfile
    }, "SelectPathFileUSerTemplate");
    
    if (response) {
      const activeUserDetails = getActiveUserDetails();
      const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
      
      // Reset lock states first
      setIsLocked(false);
      setIsAutoLocked(false);
      setLockedByOtherUser(false);
      
      // Then check actual lock status
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
      
      // =========== IMPORTANT: AUTO-SELECT FIRST TEMPLATE LOGIC ===========
      
      let selectedTemplate = null;
      
      // 1. If instrument is auto-locked, always select first template
      if (response.sLockType === 'A' && templateOptions.length > 0) {
        selectedTemplate = templateOptions[0].value;
        updates.template = selectedTemplate;
        console.log('📋 Auto-locked: auto-selecting first template:', selectedTemplate);
      } 
      // 2. If instrument has a template from previous lock, use that
      else if (response.sTemplateID && response.sTemplateID.trim() !== '') {
        selectedTemplate = response.sTemplateID.trim();
        updates.template = selectedTemplate;
        console.log('📋 Using existing template from lock:', selectedTemplate);
      }
      // 3. If instrument has no template but we have template options, auto-select first one
      else if (templateOptions.length > 0 && !formData.template) {
        selectedTemplate = templateOptions[0].value;
        updates.template = selectedTemplate;
        console.log('📋 Auto-selecting first template (no existing lock):', selectedTemplate);
      }
      // 4. If user already selected a template, keep it (don't override)
      else if (formData.template) {
        // Keep current template selection
        selectedTemplate = formData.template;
        updates.template = selectedTemplate;
        console.log('📋 Keeping user-selected template:', selectedTemplate);
      }
      
      // IMPORTANT: Don't clear the path if we're loading from scheduler
      if (!isLoadingFromScheduler) {
        updates.path = '';
      }
      
      // Set the form data first
      setFormData(prev => ({ ...prev, ...updates }));
      
      // =========== IMPORTANT: LOAD TAGS FOR AUTO-LOCKED INSTRUMENTS ===========
      // Load tags immediately if we have a template and instrument
      if (selectedTemplate && instrumentId) {
        console.log('🔍 Immediately loading tags for auto-selected template:', selectedTemplate);
        
        // Small delay to ensure state updates, then load tags
        setTimeout(() => {
          fetchTags(selectedTemplate, instrumentId);
        }, 300);
      }
      
      return response;
    }
  } catch (error) {
    // Reset states on error
    setIsLocked(false);
    setIsAutoLocked(false);
    setLockedByOtherUser(false);
    return null;
  }
}, [formData.protocolID, isFileNameEnabled, templateOptions, isLoadingFromScheduler, formData.template, fetchTags]);

// 4. Update the initial load useEffect to handle scheduler data better:
// Update the initial load useEffect
useEffect(() => {
  if (initialLoadDoneRef.current) return;
  
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Load essential data first
      await checkMergeAndAutoUnlockSettings();
      await loadUsers();
      
      // Load templates
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
      }
      
      // Check for stored scheduler data
      const fromScheduler = sessionStorage.getItem('fromScheduler');
      const storedData = sessionStorage.getItem('schedulerData');
      
      if (fromScheduler === 'true' && storedData) {
        try {
          const schedulerData = JSON.parse(storedData);
          console.log('🔍 Processing STORED scheduler data from session');
          
          // Process scheduler data after a short delay to ensure templates are loaded
          setTimeout(() => {
            handleSchedulerNavigation(schedulerData);
          }, 800);
          
          // Mark initial load as done
          initialLoadDoneRef.current = true;
          return;
        } catch (error) {
          console.error('Error parsing stored scheduler data:', error);
          sessionStorage.removeItem('fromScheduler');
          sessionStorage.removeItem('schedulerData');
        }
      }
      
      // NORMAL INITIALIZATION
      console.log('🔧 Starting normal initialization');
      await loadClients();
      initialLoadDoneRef.current = true;
      
    } catch (error) {
      console.error('Error in initial load:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  loadData();
}, []);

// 5. Add this useEffect to debug scheduler loading state:
useEffect(() => {
  console.log('🔍 SCHEDULER LOADING STATE:', {
    isLoadingFromScheduler,
    hasLoadedFromNavigation,
    formData: {
      client: formData.client,
      instrument: formData.instrument,
      path: formData.path,
      template: formData.template
    },
    options: {
      clientOptions: clientOptions.length,
      instrumentOptions: instrumentOptions.length,
      pathOptions: pathOptions.length,
      templateOptions: templateOptions.length
    }
  });
}, [isLoadingFromScheduler, hasLoadedFromNavigation, formData, 
    clientOptions, instrumentOptions, pathOptions, templateOptions]);

  // Handle scheduler navigation
  

  // Load instruments for scheduler (no auto-select)
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

  // Load paths for scheduler
  const loadPathsForScheduler = async (instrumentId, sourcePath) => {
  try {
    console.log('🔍 Loading paths for scheduler:', {
      instrumentId,
      sourcePath
    });
    
    const response = await makeAjaxCall(endpoints.lockPathCombo, {
      sInstrumentID: instrumentId,
      sScheduleID: "",
      sClientID: formData.client || ''
    });
    
    console.log('📊 Path response:', response);
    
    if (Array.isArray(response) && response.length > 0) {
      const pathOptionsData = response.map(path => ({
        value: path.sTaskID ? path.sTaskID.trim() : '',
        label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
        originalItem: path
      }));
      
      console.log('🛣️ Available paths:', pathOptionsData.map(p => p.label));
      setPathOptions(pathOptionsData);
      
      // Find matching path
      let selectedPath = null;
      
      if (sourcePath) {
        // Clean paths for comparison
        const cleanSourcePath = sourcePath.toLowerCase().trim().replace(/\\/g, '/');
        
        console.log('🔍 Looking for path matching:', cleanSourcePath);
        
        // Try multiple matching strategies
        selectedPath = pathOptionsData.find(path => {
          if (!path.label) return false;
          
          const cleanPathLabel = path.label.toLowerCase().trim().replace(/\\/g, '/');
          
          // 1. Exact match
          if (cleanPathLabel === cleanSourcePath) {
            console.log('✅ Exact match found');
            return true;
          }
          
          // 2. Path ends with source path
          if (cleanPathLabel.endsWith(cleanSourcePath)) {
            console.log('✅ Path ends with source path');
            return true;
          }
          
          // 3. Contains match
          if (cleanPathLabel.includes(cleanSourcePath)) {
            console.log('✅ Path contains source path');
            return true;
          }
          
          // 4. Check last segment
          const sourceSegments = cleanSourcePath.split('/').filter(Boolean);
          const pathSegments = cleanPathLabel.split('/').filter(Boolean);
          
          if (sourceSegments.length > 0 && pathSegments.length > 0) {
            if (pathSegments[pathSegments.length - 1] === sourceSegments[sourceSegments.length - 1]) {
              console.log('✅ Last segment matches');
              return true;
            }
          }
          
          return false;
        });
      }
      
      // Fallback to first path if no match found
      if (!selectedPath && pathOptionsData.length > 0) {
        selectedPath = pathOptionsData[0];
        console.log('📌 Using first available path as fallback');
      }
      
      if (selectedPath) {
        console.log('✅ Setting selected path:', selectedPath.label);
        setFormData(prev => ({
          ...prev,
          path: selectedPath.value
        }));
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error loading paths for scheduler:', error);
    return false;
  }
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

  // Normal instrument loading (for non-scheduler)
  // Normal instrument loading (for non-scheduler)
// Normal instrument loading (for non-scheduler)
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
      console.error('Error loading clients:', error);
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

  const showFullPageLoader = isLoading || isSubmitting || isLoadingTags || isLoadingOptions || isLoadingFromScheduler;
  
  // Initial load
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        await checkMergeAndAutoUnlockSettings();
        await loadUsers();
        
        // Load templates
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
        }
        
        // Check for stored scheduler data
        const fromScheduler = sessionStorage.getItem('fromScheduler');
        const storedData = sessionStorage.getItem('schedulerData');
        
        if (fromScheduler === 'true' && storedData) {
          try {
            const schedulerData = JSON.parse(storedData);
            console.log('🔍 Processing stored scheduler data');
            
            // Clear storage to prevent reload on refresh
            sessionStorage.removeItem('fromScheduler');
            sessionStorage.removeItem('schedulerData');
            
            // Process scheduler data
            setTimeout(() => {
              handleSchedulerNavigation(schedulerData);
            }, 500);
            
            return; // Skip normal initialization
          } catch (error) {
            console.error('Error parsing stored scheduler data:', error);
          }
        }
        
        // Normal initialization
        await loadClients();
        initialLoadDoneRef.current = true;
        
      } catch (error) {
        console.error('Error in initial load:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (formData.template && formData.template.trim() !== '' && formData.instrument) {
      fetchTags(formData.template, formData.instrument);
    } else {
      setTags([]);
    }
  }, [formData.template, formData.instrument, fetchTags]);

// Add a ref to track the last loaded template/instrument combination
const lastLoadRef = useRef({ template: '', instrument: '' });

useEffect(() => {
  const loadTagsForTemplate = async () => {
    if (!formData.template || !formData.template.trim() || !formData.instrument) {
      setTags([]);
      return;
    }
    
    // Check if we're already loading or if this combination was just loaded
    const currentKey = `${formData.template}-${formData.instrument}`;
    const lastKey = `${lastLoadRef.current.template}-${lastLoadRef.current.instrument}`;
    
    if (currentKey === lastKey && tags.length > 0) {
      console.log('📋 Skipping tag load - same template/instrument');
      return;
    }
    
    // Don't load if we're already loading
    if (isLoadingTags) {
      console.log('⏳ Already loading tags, skipping');
      return;
    }
    
    console.log('🔍 Loading tags for template:', formData.template);
    
    // Update the last loaded reference
    lastLoadRef.current = {
      template: formData.template,
      instrument: formData.instrument
    };
    
    await fetchTags(formData.template, formData.instrument);
  };
  
  // Use a debounce to prevent rapid successive calls
  const timer = setTimeout(() => {
    loadTagsForTemplate();
  }, 300); // 300ms delay
  
  return () => clearTimeout(timer);
}, [formData.template, formData.instrument, fetchTags, isLoadingTags, tags.length]);


useEffect(() => {
  // Handle auto-locked instrument template loading
  const handleAutoLockedInstrument = async () => {
    if (isAutoLocked && formData.instrument && templateOptions.length > 0) {
      console.log('🔒 Processing auto-locked instrument:', formData.instrument);
      
      // Ensure template is set for auto-locked instruments
      if (!formData.template) {
        const firstTemplate = templateOptions[0].value;
        console.log('📋 Setting first template for auto-locked instrument:', firstTemplate);
        
        setFormData(prev => ({
          ...prev,
          template: firstTemplate
        }));
        
        // Load tags after a short delay
        setTimeout(() => {
          if (firstTemplate && formData.instrument) {
            console.log('🔍 Loading tags for auto-locked instrument');
            fetchTags(firstTemplate, formData.instrument);
          }
        }, 500);
      } else if (formData.template && formData.instrument) {
        // If template is already set, make sure tags are loaded
        console.log('🔍 Auto-locked instrument has template, ensuring tags are loaded');
        fetchTags(formData.template, formData.instrument);
      }
    }
  };
  
  handleAutoLockedInstrument();
}, [isAutoLocked, formData.instrument, formData.template, templateOptions, fetchTags]);


  const handleClientChange = useCallback(async (value) => {
  // Save current template before clearing
  const currentTemplate = formData.template;
  
  setFormData(prev => ({ 
    ...prev, 
    client: value, 
    instrument: '', 
    path: '', 
    fileName: '', 
    limsOrder: '',
    // Don't clear template here - let it persist
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

    useEffect(() => {
  return () => {
    // Cleanup on component unmount
    lastLoadRef.current = { template: '', instrument: '' };
  };
}, []);

  const handlePathChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, path: value }));
    setErrors(prev => ({ ...prev, path: false }));
  }, []);

const handleTemplateChange = useCallback((value) => {
  console.log('📋 User manually changed template from:', formData.template, 'to:', value);
  
  // Reset the last load reference when user manually changes template
  lastLoadRef.current = { template: '', instrument: '' };
  
  setFormData(prev => ({ ...prev, template: value }));
  setErrors(prev => ({ ...prev, template: false }));
  
  // Clear tags immediately
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
  }, [isLocked, isAutoLocked, lockedByOtherUser, formData.instrument, formData.path, performUnlockAction, t]);

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

  // Field disabled state logic
  const getFieldDisabledState = useMemo(() => {
    const isFromScheduler = isLoadingFromScheduler || 
                           sessionStorage.getItem('fromScheduler') === 'true';
    
    // Handle scheduler case
    if (isFromScheduler && hasLoadedFromNavigation) {
      return {
        client: true,
        instrument: true,
        path: true,
        limsOrder: false,
        fileName: false,
        template: false,
        mergeCount: false,
        unlockCheckbox: false,
        tags: false,
        lockButton: !isLocked,  // Enable lock if not locked
        unlockButton: isLocked   // Enable unlock if locked
      };
    }
    
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
    
    // Default: Not locked
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
  }, [isLocked, lockedByOtherUser, isAutoLocked, isLoadingFromScheduler, hasLoadedFromNavigation]);

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





















// import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// import { useTranslation } from 'react-i18next';
// import AuditTrail from '../../../../Layout/Common/AuditTrail';
// import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
// import servicecall from '../../../../../Services/servicecall';
// import CF_activeUserdetails from "../../../../../Services/activeUserdetails";
// import { useInstrumentLock } from '../../../../../Context/InstrumentLockContext';

// const LockIcon = () => (
//   <i className="fa fa-lock text-xs mr-1"></i>
// );

// const UnlockIcon = () => (
//   <i className="fa fa-unlock text-xs mr-1"></i>
// );

// const UpdateIcon = () => (
//   <i className="fa fa-pencil-square-o text-xs mr-1"></i>
// );

// const EditPencilIcon = () => (
//   <i className="fa fa-pencil text-xl mr-0.5"></i>
// );

// const MergeFileCountRow = ({ mergeCount, currentCount, onMergeChange, disabled, showMergeFields, t }) => {
//   if (!showMergeFields) return null;
  
//   const handleChange = (e) => {
//     const value = e.target.value;
//     if (value === '' || /^\d+$/.test(value)) {
//       const numValue = parseInt(value) || 0;
//       if (numValue > 10000) {
//         onMergeChange("10000");
//       } else {
//         onMergeChange(value);
//       }
//     }
//   };
  
//   return (
//     <div className="mb-6 mt-7">
//       <div className="flex items-center gap-6">
//         <div className="flex items-center gap-2">
//           <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
//             {t('instrumentlocktag.mergefilecount')}
//           </label>
//           <input
//             type="text"
//             value={mergeCount}
//             onChange={handleChange}
//             onBlur={(e) => {
//               if (e.target.value === '' || parseInt(e.target.value) < 1) {
//                 onMergeChange("1");
//               }
//             }}
//             disabled={disabled}
//             className="w-16 h-7 px-2 text-xs text-center font-['verdana'] border border-gray-300 rounded bg-white hover:border-gray-400 text-[#405F7D]"
//           />
//         </div>
        
//         <div className="flex items-center gap-2">
//           <label className="text-xs text-[#405F7D] min-w-[150px] font-semibold font-roboto">
//             {t('instrumentlocktag.currentuploadfilecount')}
//           </label>
//           <input
//             type="text"
//             value={currentCount}
//             disabled={true}
//             className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-[#405F7D] font-verdana"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const InlineEditIcon = () => (
//   <i className="fa fa-edit text-lg mr-1"></i>
// );

// const TagGrid = React.memo(({ tags, onTagValueClick, isLoadingTags, isLocked, lockedByOtherUser, isAutoLocked, onTagEditRequest, onInlineEditSubmit, t, tagErrors }) => {
//   const [tooltipState, setTooltipState] = useState({
//     isOpen: false,
//     tagIndex: null,
//     position: { top: 0, left: 0 },
//     searchTerm: '',
//     selectedValue: '',
//     selectedValueID: '',
//     options: []
//   });

//   const [selectedTagIndex, setSelectedTagIndex] = useState(null);
//   const [showErrorDialog, setShowErrorDialog] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
//   const [inlineEditState, setInlineEditState] = useState({
//     isEditing: false,
//     tagIndex: null,
//     inputValue: ''
//   });

//   const showInformationMessage = (message) => {
//     setErrorMessage(message);
//     setShowErrorDialog(true);
//   };

//   const canEditTag = useCallback((tagIndex) => {
//     if (tagIndex === 0) return true;
//     for (let i = 0; i < tagIndex; i++) {
//       if (!tags[i]?.value) return false;
//     }
//     return true;
//   }, [tags]);

//   const getErrorMessage = useCallback((tagIndex) => {
//     for (let i = tagIndex - 1; i >= 0; i--) {
//       if (!tags[i]?.value) {
//         return `${t('instrumentlocktag.pleaseselect')} ${tags[i]?.tagName} ${t('instrumentlocktag.value').toLowerCase()} first`;
//       }
//     }
//     return `${t('instrumentlocktag.pleaseselect')} required ${t('instrumentlocktag.value').toLowerCase()} first`;
//   }, [tags, t]);

//   const handleEditClick = async (tag, index, event) => {
//     event.stopPropagation();
    
//     const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
//     if (shouldDisableEdit) return;
    
//     if (tag.required && tag.tagID !== 0) {
//       if (!canEditTag(index)) {
//         showInformationMessage(getErrorMessage(index));
//         return;
//       }
      
//       const calculateTooltipPositionFromRect = (buttonRect) => {
//         const viewportHeight = window.innerHeight;
//         const viewportWidth = window.innerWidth;
//         const tooltipWidth = 250;
//         const tooltipHeight = 220;
        
//         let left = buttonRect.left - tooltipWidth + 0;
//         let top = buttonRect.top - (tooltipHeight) + 10;
        
//         if (top < 10) top = 10;
//         if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
//         if (left < 10) left = buttonRect.right + 10;
//         if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
        
//         return { top, left };
//       };
      
//       const buttonRect = event.currentTarget.getBoundingClientRect();
//       const position = calculateTooltipPositionFromRect(buttonRect);
      
//       setSelectedTagIndex(index);
      
//       if (tag.options && tag.options.length > 0) {
//         setTooltipState({
//           isOpen: true,
//           tagIndex: index,
//           position,
//           searchTerm: '',
//           selectedValue: tag.value || '',
//           selectedValueID: tag.valueID || '',
//           options: tag.options
//         });
//         return;
//       }
      
//       setIsLoadingOptions(true);
      
//       try {
//         const options = await onTagEditRequest(index);
        
//         setTooltipState({
//           isOpen: true,
//           tagIndex: index,
//           position,
//           searchTerm: '',
//           selectedValue: tag.value || '',
//           selectedValueID: tag.valueID || '',
//           options: options || []
//         });
//       } catch (error) {
//         showInformationMessage(t('instrumentlocktag.failedtoloadoptions'));
//       } finally {
//         setIsLoadingOptions(false);
//       }
//     } else {
//       setInlineEditState({
//         isEditing: true,
//         tagIndex: index,
//         inputValue: tag.value || ''
//       });
//     }
//   };

//   const handleInlineEditSubmit = () => {
//     if (inlineEditState.tagIndex !== null && inlineEditState.inputValue !== undefined) {
//       onInlineEditSubmit(
//         inlineEditState.tagIndex,
//         inlineEditState.inputValue,
//         inlineEditState.inputValue
//       );
//     }
//     setInlineEditState({
//       isEditing: false,
//       tagIndex: null,
//       inputValue: ''
//     });
//   };

//   const handleInlineEditCancel = () => {
//     setInlineEditState({
//       isEditing: false,
//       tagIndex: null,
//       inputValue: ''
//     });
//   };

//   const handleTooltipSubmit = () => {
//     if (tooltipState.tagIndex !== null) {
//       onTagValueClick(
//         tooltipState.tagIndex, 
//         tooltipState.selectedValue || '',
//         tooltipState.selectedValueID || ''
//       );
//     }
//     setTooltipState({
//       isOpen: false,
//       tagIndex: null,
//       position: { top: 0, left: 0 },
//       searchTerm: '',
//       selectedValue: '',
//       selectedValueID: '',
//       options: []
//     });
//   };

//   const handleTooltipClose = () => {
//     setTooltipState({
//       isOpen: false,
//       tagIndex: null,
//       position: { top: 0, left: 0 },
//       searchTerm: '',
//       selectedValue: '',
//       selectedValueID: '',
//       options: []
//     });
//   };

//   const handleOptionClick = (optionValue, optionValueID) => {
//     setTooltipState(prev => ({
//       ...prev,
//       selectedValue: optionValue,
//       selectedValueID: optionValueID
//     }));
//   };

//   const handleSearchChange = (value) => {
//     setTooltipState(prev => ({
//       ...prev,
//       searchTerm: value
//     }));
//   };

//   const filteredOptions = tooltipState.options.filter(opt => 
//     opt.label.toLowerCase().includes(tooltipState.searchTerm.toLowerCase())
//   );

//   if (isLoadingTags) {
//     return (
//       <div className="border border-[#f3f3f3] rounded relative">
//         <div className="flex justify-center items-center h-[250px]">
//           <div className="text-sm text-gray-500">{t('common.loading')}...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="border border-[#f3f3f3] rounded relative">
//         <div className="grid grid-cols-2 bg-[#fbfbfb] border-b border-[#f3f3f3]">
//           <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
//             {t('instrumentlocktag.tagName')}
//           </div>
//           <div className="px-1 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">
//             {t('instrumentlocktag.tagValue')}
//           </div>
//         </div>
        
//         <div className="bg-white min-h-[250px]">
//           {tags.length === 0 ? (
//             <div className="px-4 py-12 text-center text-xs text-[#4b4b4b] font-roboto">            
//               {t('instrumentlocktag.noTagValue')}
//             </div>
//           ) : (
//             tags.map((tag, idx) => {
//               const isSelected = selectedTagIndex === idx;
//               const isThisTagLoading = isLoadingOptions && isSelected;
//               const isInlineEditing = inlineEditState.isEditing && inlineEditState.tagIndex === idx;
//               const hasError = tagErrors[idx] && tag.required && !tag.value;
              
//               const shouldDisableEdit = (isLocked && lockedByOtherUser && !isAutoLocked);
//               const isDropdownMode = tag.required && tag.tagID !== 0;
//               const showEditIcon = tag.editable && !shouldDisableEdit;
              
//               return (
//                 <div 
//                   key={`tag-${idx}-${tag.tagID}`}
//                   className={`grid grid-cols-2 border-b border-[#e7e6e6] last:border-b-1 min-h-[40px]
//                     ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#378cfc]' : 'bg-white border-l-4 border-l-transparent'}
//                     ${hasError ? 'border-b-2 border-b-red-400' : ''}
//                     ${tag.editable && !shouldDisableEdit ? 'cursor-pointer hover:bg-[#eef2f9]' : 'cursor-default'}
//                   `}
//                   onClick={() => setSelectedTagIndex(idx)}
//                 >
//                   <div className={`px-4 text-xs flex items-center font-['verdana']
//                     ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
//                   `}>
//                     {tag.tagName}
//                     {tag.required && <span className="text-red-500 ml-1">*</span>}
//                   </div>
                  
//                   <div className="px-0.5 py-0 text-xs flex items-center justify-between gap-0">
//                     {isInlineEditing ? (
//                       <div className="flex-1 flex items-center">
//                         <input
//                           type="text"
//                           value={inlineEditState.inputValue}
//                           onChange={(e) => setInlineEditState(prev => ({
//                             ...prev,
//                             inputValue: e.target.value
//                           }))}
//                           className={`w-full h-9 px-0.5 text-xs font-bold border border-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:border-white
//                             ${hasError ? 'border-red-400' : ''}`}
//                           autoFocus
//                           onBlur={handleInlineEditSubmit}
//                           onKeyDown={(e) => {
//                             if (e.key === 'Enter') {
//                               handleInlineEditSubmit();
//                             } else if (e.key === 'Escape') {
//                               handleInlineEditCancel();
//                             }
//                           }}
//                         />
//                       </div>
//                     ) : (
//                       <>
//                         <span className={`flex-1 font-['verdana'] ${
//                           isSelected ? 'font-bold' : ''
//                         } text-[#373737]`}>
//                           {tag.value || ''}
//                           {isThisTagLoading && (
//                             <span className="ml-2 text-xs text-gray-500">{t('common.loading')}...</span>
//                           )}
//                         </span>
                        
//                         {showEditIcon && (
//                           <button
//                             onClick={(e) => {
//                               setSelectedTagIndex(idx);
//                               handleEditClick(tag, idx, e);
//                             }}
//                             className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool"
//                             title={t('button.edit')}
//                             disabled={isThisTagLoading}
//                           >
//                             {isDropdownMode ? (
//                               <EditPencilIcon />
//                             ) : (
//                               <InlineEditIcon />
//                             )}
//                           </button>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {showErrorDialog && (
//         <Errordialog
//           message={errorMessage}
//           type="information"
//           onClose={() => setShowErrorDialog(false)}
//           okText={t('button.ok')}
//         />
//       )}

//       {tooltipState.isOpen && (
//         <div 
//           className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col"
//           style={{
//             top: `${tooltipState.position.top}px`,
//             left: `${tooltipState.position.left}px`,
//           }}
//         >
//           <div className="p-0.5 border-gray-200">
//             <div className="mb-0">
//               <input
//                 type="text"
//                 value={tooltipState.searchTerm}
//                 onChange={(e) => handleSearchChange(e.target.value)}
//                 className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
//                 autoFocus
//                 placeholder={t('instrumentlocktag.searchplaceholder')}
//               />
//             </div>
//           </div>
          
//           <div className="flex-1 overflow-y-auto min-h-0">
//             {filteredOptions.length === 0 ? (
//               <div className="text-center py-6 text-xs text-gray-500 font-roboto">
//                 {t('instrumentlocktag.nooptionsfound')}
//               </div>
//             ) : (
//               filteredOptions.map((option, idx) => {
//                 const isSelected = tooltipState.selectedValue === option.label && 
//                                    tooltipState.selectedValueID === option.value;
                
//                 return (
//                   <div
//                     key={`option-${idx}-${option.value}`}
//                     onClick={() => handleOptionClick(option.label, option.value)}
//                     onDoubleClick={handleTooltipSubmit}
//                     className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
//                       ${isSelected ? 'bg-[#f2f2f2]' : ''}
//                       ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
//                     `}
//                   >
//                     <div className="flex items-center ml-1">
//                       <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
//                         {option.label}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
          
//           <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
//             <button
//               onClick={handleTooltipSubmit}
//               className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
//             >
//               <i className="fa fa-check-square-o mr-1"></i>
//               {t('button.submit')}
//             </button>
//             <button
//               onClick={handleTooltipClose}
//               className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
//             >
//               <i className="fa fa-times mr-1"></i>
//               {t('button.cancel')}
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// });

// TagGrid.displayName = 'TagGrid';

// const InstrumentLockTag = ({ scheduleData, navigationData }) => {
//   const { t } = useTranslation();
//   const { navigateAfterLock } = useInstrumentLock();
//   const { postData } = servicecall();
  
//   const endpoints = {
//     lockTemplateCombo: "InstrumentLock/LockTemplateCombo",
//     loadTagCategory: "InstrumentLock/LoadTagCategory",
//     clientLockCombo: "InstrumentLock/clientlockcombo",
//     lockInstrumentCombo: "InstrumentLock/LockInstrumentCombo",
//     lockPathCombo: "InstrumentLock/LockPathCombo",
//     loadCategoryTagValueAndID: "InstrumentLock/LoadCategoryTagValueAndID",
//     lockUserCombo: "InstrumentLock/LockUserCombo", 
//     mergeFileAndAutoUnlock: "InstrumentLock/MergeFileAndAutounlock",
//     loadProtocol: "InstrumentLock/LoadProtocol",
//     lockLimsordercombo: "InstrumentLock/lockLimsordercombo",
//     onChangeInstrumentCombo: "InstrumentLock/OnChangeInstrumentCombo",
//     lockActiveParsingInstrumentCombo: "InstrumentLock/LockActiveParsingInstrumentCombo",
//     lockDeactiveParsingInstrumentCombo: "InstrumentLock/LockDeactiveParsingInstrumentCombo",
//     lockActiveInstrumentPathCombo: "InstrumentLock/LockActiveInstrumentPathCombo",
//     lockDeactiveInstrumentPathCombo: "InstrumentLock/LockDeactiveInstrumentPathCombo",
//     interfaceConnectionChecking: "InstrumentLock/InterfaceConnectionChecking",
//     lockInstrument: "InstrumentLock/LockInstrument",
//     unLockInstrument: "InstrumentLock/UnLockInstrument"
//   };

//   const [showErrorDialog, setShowErrorDialog] = useState(false);
//   const [errorDialogMessage, setErrorDialogMessage] = useState('');
//   const [errorDialogType, setErrorDialogType] = useState('information');
//   const [errorDialogCallback, setErrorDialogCallback] = useState(null);
//   const [isLoadingFromScheduler, setIsLoadingFromScheduler] = useState(false);
//   const [hasLoadedFromNavigation, setHasLoadedFromNavigation] = useState(false);

//   const showErrorDialogMessage = (message, type = 'information', onConfirm = null) => {
//     if (type === 'confirmation' && onConfirm) {
//       setErrorDialogMessage(message);
//       setErrorDialogType('confirmation');
//       setErrorDialogCallback(() => onConfirm);
//       setShowErrorDialog(true);
//     } else {
//       setErrorDialogMessage(message);
//       setErrorDialogType(type);
//       setErrorDialogCallback(null);
//       setShowErrorDialog(true);
//     }
//   };

//   const handleErrorDialogClose = () => {
//     setShowErrorDialog(false);
//     setErrorDialogCallback(null);
//   };

//   const handleErrorDialogConfirm = () => {
//     if (errorDialogCallback) {
//       errorDialogCallback();
//     }
//     setShowErrorDialog(false);
//     setErrorDialogCallback(null);
//   };

//   const getActiveUserDetails = useCallback(() => {
//     const userDetails = CF_activeUserdetails();
//     return {
//       ...userDetails.ActiveUserDetails,
//       sUserID: userDetails.ActiveUserDetails?.sUserID || userDetails.sUserID,
//       sUsername: userDetails.ActiveUserDetails?.sUsername || userDetails.sUsername
//     };
//   }, []);

//   const getSessionValue = (key) => {
//     try {
//       const value = sessionStorage.getItem(key);
//       if (value === null) {
//         switch(key) {
//           case 'MergeCount': return '1';
//           case 'FileName': return 'false';
//           case 'L11ParserType': return '0';
//           default: return "";
//         }
//       }
//       return value;
//     } catch {
//       return "";
//     }
//   };

//   const setSessionValue = (key, value) => {
//     try {
//       sessionStorage.setItem(key, value);
//     } catch (error) {
//       // Silent error handling
//     }
//   };

//   const makeAjaxCall = async (url, passObjDet, process) => {
//     try {
//       const userDetails = CF_activeUserdetails();
      
//       let requestBody;
      
//       if (url === endpoints.loadCategoryTagValueAndID) {
//         requestBody = {
//           passObjDet: passObjDet,
//           ActiveUserDetails: userDetails.ActiveUserDetails,
//           ApplicationCode: userDetails.ApplicationCode
//         };
//       } else {
//         requestBody = {
//           ...passObjDet,
//           ActiveUserDetails: userDetails.ActiveUserDetails,
//           ApplicationCode: userDetails.ApplicationCode
//         };
//       }
      
//       const response = await postData(url, requestBody);
        
//       if (!response) {
//         return null;
//       }
      
//       if (response.Rtn && response.Rtn.toLowerCase() === 'error') {
//         throw new Error(response.Message || response.ErrorMessage || `${t('Auditpopup.somethingwentwrong')} ${url}`);
//       }
      
//       if (process === "InterfaceConnectionChecking") {
//         let formattedResponse;
        
//         if (response.AuditTrailLogin !== undefined) {
//           return [response];
//         }
        
//         if (Array.isArray(response)) {
//           formattedResponse = response;
//         } else if (response && typeof response === 'object') {
//           if (response.AccessStatus !== undefined) {
//             formattedResponse = [response];
//           } else if (response[0] && response[0].AccessStatus !== undefined) {
//             formattedResponse = Object.values(response);
//           } else {
//             formattedResponse = [response];
//           }
//         } else {
//           formattedResponse = [];
//         }
        
//         return formattedResponse;
//       }
      
//       if (process === "LockInstrument" || process === "UnLockInstrument") {
//         return response;
//       }
      
//       if (process === "SelectPathFileUSerTemplate") {
//         return response.oResInstChange || response;
//       }
      
//       if (response.oResObj !== undefined) {
//         return response.oResObj;
//       }
      
//       if (response.oResInstChange !== undefined) {
//         return response.oResInstChange;
//       }
      
//       if (response.list !== undefined) {
//         return response.list;
//       }
      
//       if (Array.isArray(response)) {
//         return response;
//       }
      
//       return response;
      
//     } catch (error) {
//       throw error;
//     }
//   };

//   const getDeactiveScheduleDataRef = useRef(scheduleData);
//   const initialLoadDoneRef = useRef(false);

//   const [formData, setFormData] = useState({
//     client: '',
//     instrument: '',
//     path: '',
//     limsOrder: '',
//     fileName: '',
//     template: '',
//     mergeFileCount: '1',
//     currentFileCount: '0',
//     unlockAfterCapture: false,
//     user: '',
//     lockID: '',
//     interfaceOrderID: '',
//     protocolID: '0'
//   });

//   const [errors, setErrors] = useState({});
//   const [tagErrors, setTagErrors] = useState({});
//   const [isLocked, setIsLocked] = useState(false);
//   const [showMergeFields, setShowMergeFields] = useState(false);
//   const [showUnlockOption, setShowUnlockOption] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingTags, setIsLoadingTags] = useState(false);
//   const [isLoadingOptions, setIsLoadingOptions] = useState(false);
//   const [isInstrumentInterface, setIsInstrumentInterface] = useState(false);
//   const [isFileNameEnabled, setIsFileNameEnabled] = useState(false);
//   const [isLimsOrderEnabled, setIsLimsOrderEnabled] = useState(false);
//   const [lockedByOtherUser, setLockedByOtherUser] = useState(false);
//   const [isAutoLocked, setIsAutoLocked] = useState(false);
//   const [deviceType, setDeviceType] = useState('desktop');
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   const [showAuditTrail, setShowAuditTrail] = useState(false);
//   const [auditAction, setAuditAction] = useState(null);
//   const [auditCallback, setAuditCallback] = useState(null);

//   const [templateOptions, setTemplateOptions] = useState([]);
//   const [clientOptions, setClientOptions] = useState([]);
//   const [instrumentOptions, setInstrumentOptions] = useState([]);
//   const [pathOptions, setPathOptions] = useState([]);
//   const [limsOrderOptions, setLimsOrderOptions] = useState([]);
//   const [userOptions, setUserOptions] = useState([]);
//   const [tags, setTags] = useState([]);

//   const tagIdToNameMap = {
//     1: "Sample",
//     2: "Test", 
//     3: "Project",
//     4: "BatchNo"
//   };

//   // Handle navigation data from scheduler
//   // 1. Fix the useEffect that handles navigationData - make it more robust:
// useEffect(() => {
//   console.log('🔍 Navigation data received FULL:', navigationData);
  
//   // Handle direct navigation data
//   if (navigationData?.data?.fromScheduler) {
//     const schedulerData = navigationData.data;
//     console.log('🚀 Processing DIRECT scheduler navigation:', schedulerData);
    
//     // Clear previous scheduler data
//     sessionStorage.removeItem('fromScheduler');
//     sessionStorage.removeItem('schedulerData');
    
//     // Store new data
//     sessionStorage.setItem('fromScheduler', 'true');
//     sessionStorage.setItem('schedulerData', JSON.stringify(schedulerData));
    
//     // Reset loading state
//     setHasLoadedFromNavigation(false);
    
//     // Process scheduler data immediately
//     handleSchedulerNavigation(schedulerData);
//   }
  
//   // Also check for nested data structure
//   if (navigationData?.data?.data?.fromScheduler) {
//     const schedulerData = navigationData.data.data;
//     console.log('🚀 Processing NESTED scheduler navigation:', schedulerData);
    
//     // Clear previous scheduler data
//     sessionStorage.removeItem('fromScheduler');
//     sessionStorage.removeItem('schedulerData');
    
//     // Store new data
//     sessionStorage.setItem('fromScheduler', 'true');
//     sessionStorage.setItem('schedulerData', JSON.stringify(schedulerData));
    
//     // Reset loading state
//     setHasLoadedFromNavigation(false);
    
//     // Process scheduler data immediately
//     handleSchedulerNavigation(schedulerData);
//   }
// }, [navigationData]);


// // 3. Add helper functions for scheduler loading:
// const loadTemplatesForScheduler = async () => {
//   try {
//     const activeUserDetails = getActiveUserDetails();
//     const templateResponse = await makeAjaxCall(endpoints.lockTemplateCombo, {
//       ActiveUserDetails: activeUserDetails,
//       ApplicationCode: "SDMS"
//     });
    
//     if (Array.isArray(templateResponse) && templateResponse.length > 0) {
//       const templates = templateResponse
//         .map(template => ({
//           value: String(template.sTemplateID || '').trim(),
//           label: String(template.sTemplateName || '').trim()
//         }))
//         .filter(template => template.value && template.label && template.value !== 'undefined');
      
//       const order = ['QC', 'Calibration', 'Method Development', 'Project'];
//       const sortedTemplates = templates.sort((a, b) => {
//         const labelA = a.label || '';
//         const labelB = b.label || '';
        
//         const indexA = order.findIndex(pattern => labelA.includes(pattern));
//         const indexB = order.findIndex(pattern => labelB.includes(pattern));
        
//         if (indexA !== -1 && indexB !== -1) {
//           return indexA - indexB;
//         }
        
//         if (indexA !== -1) return -1;
//         if (indexB !== -1) return 1;
        
//         return labelA.localeCompare(labelB);
//       });
      
//       setTemplateOptions(sortedTemplates);
//       console.log('✅ Templates loaded for scheduler:', sortedTemplates.length);
//     }
//   } catch (error) {
//     console.error('Error loading templates for scheduler:', error);
//   }
// };

// const loadAndSetClient = async (clientId) => {
//   try {
//     console.log('👥 Loading and setting client:', clientId);
    
//     const response = await makeAjaxCall(endpoints.clientLockCombo, {
//       sTaskStatus: 'A',
//       sClientID: clientId || ''
//     });

//     if (Array.isArray(response) && response.length > 0) {
//       const clientOptionsData = response.map(client => ({
//         value: client.sClientID ? client.sClientID.trim() : '',
//         label: client.sClientName || t('instrumentlocktag.unknownclient')
//       }));

//       setClientOptions(clientOptionsData);
      
//       // Find and set the exact client
//       const targetClient = clientOptionsData.find(client => client.value === clientId);
//       if (targetClient) {
//         console.log('✅ Setting client:', targetClient.value, targetClient.label);
//         setFormData(prev => ({
//           ...prev,
//           client: targetClient.value
//         }));
//         return true;
//       }
//     }
//     return false;
//   } catch (error) {
//     console.error('Error loading client:', error);
//     return false;
//   }
// };


// // 1. Update the loadAndSetPath function to load AFTER instrument is set:
// const loadAndSetPath = async (sourcePath, specificInstrumentId = null) => {
//   try {
//     // Use specific instrument ID if provided, otherwise use formData.instrument
//     const instrumentIdToUse = specificInstrumentId || formData.instrument;
    
//     if (!instrumentIdToUse) {
//       console.log('⏸️ Cannot load path - no instrument selected');
//       return false;
//     }
    
//     console.log('🛣️ Loading and setting path:', sourcePath, 'for instrument:', instrumentIdToUse);
    
//     const response = await makeAjaxCall(endpoints.lockPathCombo, {
//       sInstrumentID: instrumentIdToUse,
//       sScheduleID: "",
//       sClientID: formData.client || ''
//     });

//     console.log('📊 Path API response:', response);

//     if (Array.isArray(response) && response.length > 0) {
//       const pathOptionsData = response.map(path => ({
//         value: path.sTaskID ? path.sTaskID.trim() : '',
//         label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
//         originalItem: path
//       }));

//       console.log('🛣️ Path options loaded:', pathOptionsData.length, 'paths');
//       setPathOptions(pathOptionsData);

//       let selectedPath = null;
      
//       if (sourcePath) {
//         // Clean the source path for comparison
//         const cleanSourcePath = sourcePath.toLowerCase().trim().replace(/\\/g, '/');
//         console.log('🔍 Looking for path matching:', cleanSourcePath);
        
//         // Try different matching strategies
//         selectedPath = pathOptionsData.find(p => {
//           if (!p.label) return false;
          
//           const cleanPathLabel = p.label.toLowerCase().trim().replace(/\\/g, '/');
//           console.log('📁 Comparing path:', cleanPathLabel);
          
//           // 1. Exact match
//           if (cleanPathLabel === cleanSourcePath) {
//             console.log('✅ Exact path match found');
//             return true;
//           }
          
//           // 2. Ends with match (source path is at the end)
//           if (cleanPathLabel.endsWith(cleanSourcePath)) {
//             console.log('✅ Path ends with source path');
//             return true;
//           }
          
//           // 3. Contains match
//           if (cleanPathLabel.includes(cleanSourcePath)) {
//             console.log('✅ Path contains source path');
//             return true;
//           }
          
//           // 4. Source path contains path label
//           if (cleanSourcePath.includes(cleanPathLabel)) {
//             console.log('✅ Source path contains path label');
//             return true;
//           }
          
//           // 5. Check last segment match
//           const sourceSegments = cleanSourcePath.split('/').filter(s => s);
//           const pathSegments = cleanPathLabel.split('/').filter(s => s);
          
//           if (sourceSegments.length > 0 && pathSegments.length > 0) {
//             const lastSourceSegment = sourceSegments[sourceSegments.length - 1];
//             const lastPathSegment = pathSegments[pathSegments.length - 1];
            
//             if (lastPathSegment === lastSourceSegment) {
//               console.log('✅ Last segment match');
//               return true;
//             }
//           }
          
//           return false;
//         });
//       }

//       // Fallback to first path
//       if (!selectedPath && pathOptionsData.length > 0) {
//         selectedPath = pathOptionsData[0];
//         console.log('📌 Using first path as fallback:', selectedPath.label);
//       }

//       if (selectedPath) {
//         console.log('✅ Setting selected path:', selectedPath.value, '->', selectedPath.label);
        
//         // Update form data with the path
//         setFormData(prev => ({
//           ...prev,
//           path: selectedPath.value
//         }));
        
//         return true;
//       }
//     } else {
//       console.warn('⚠️ No path options returned from API');
//     }
//     return false;
//   } catch (error) {
//     console.error('❌ Error loading path:', error);
//     setPathOptions([]);
//     return false;
//   }
// };

// const loadTagValues = useCallback(async (tagId, templateId, instrumentId, tagIndex, previousTagValueID = "") => {
//     try {
//       const requestBody = {
//         uid: tagIndex || 0,
//         sUserID: formData.path || "",
//         nTagID: parseInt(tagId) || 0,
//         sTagValueID: previousTagValueID || "          ",
//         sInstrumentID: instrumentId.padEnd(10, ' '),
//         sTemplateID: templateId
//       };
      
//       const response = await makeAjaxCall(endpoints.loadCategoryTagValueAndID, requestBody);
      
//       if (response && Array.isArray(response)) {
//         return response.map(item => ({
//           value: item.sTagValueID ? item.sTagValueID.trim() : '',
//           label: item.sTagValue || t('instrumentlocktag.unknownvalue')
//         })).filter(opt => opt.value && opt.label);
//       }
      
//       return [];
//     } catch (error) {
//       return [];
//     }
//   }, [formData.path, t]);

  
// const fetchTags = useCallback(async (templateId, instrumentId) => {
//     if (!templateId || !instrumentId) {
//       setTags([]);
//       return;
//     }
    
//     setIsLoadingTags(true);
//     try {
//       const currentInstrumentId = instrumentId.padEnd(10, ' ');
      
//       const requestBody = {
//         sUserID: formData.path || "",
//         ActiveUserDetails: getActiveUserDetails(),
//         sInstrumentID: currentInstrumentId,
//         ApplicationCode: "SDMS",
//         sTemplateID: templateId
//       };
      
//       const response = await makeAjaxCall(endpoints.loadTagCategory, requestBody);
      
//       if (Array.isArray(response) && response.length > 0) {
//         const transformedTags = await Promise.all(response.map(async (item, index) => {
//           const tagId = item.L58TagID || item.L8iTagID || index;
//           const tagName = tagIdToNameMap[tagId] || item.L58TagName || t('instrumentlocktag.unknowntag');
//           const value = item.Value || '';
//           const valueID = item.ValueID || '';
//           const required = item.L58ValueStatus || false;
//           const order = item.L58Order || index;
          
//           let options = [];
//           if (index === 0 && tagId && required) {
//             options = await loadTagValues(tagId, templateId, instrumentId, index, "");
//           }
          
//           return {
//             tagName: tagName,
//             value: value.trim(),
//             valueID: valueID ? valueID.trim() : '',
//             tagID: tagId,
//             order: order,
//             required: required,
//             editable: true,
//             options: options
//           };
//         }));
        
//         transformedTags.sort((a, b) => a.order - b.order);
//         setTags(transformedTags);
        
//       } else {
//         setTags([]);
//       }
//     } catch (error) {
//       setTags([]);
//     } finally {
//       setIsLoadingTags(false);
//     }
//   }, [formData.path, loadTagValues, t]);
// // 2. Update the handleSchedulerNavigation to properly sequence path loading:
// const handleSchedulerNavigation = async (data) => {
//   console.log('🚀 Starting COMPLETE scheduler navigation with:', data);
   
//   setIsLoadingFromScheduler(true);
//   setHasLoadedFromNavigation(false);
  
//   try {
//     // Clear previous options
//     setInstrumentOptions([]);
//     setPathOptions([]);
//     setTags([]);
    
//     // Step 1: Load templates first if not loaded
//     if (templateOptions.length === 0) {
//       console.log('⏳ Loading templates first...');
//       await loadTemplatesForScheduler();
//     }
    
//     // Step 2: Set initial form data (excluding instrument and path initially)
// const initialData = {
//   client: data.clientId?.trim() || '',
//   fileName: data.fileName?.trim() || '',
//   template: data.templateId?.trim() || '',
//   // If no templateId from scheduler, auto-select first template
//   instrument: '', // Will be set after loading
//   path: '',       // Will be set after instrument
//   limsOrder: ''
// };

// // If no template from scheduler and we have templates, auto-select first one
// if (!initialData.template && templateOptions.length > 0) {
//   initialData.template = templateOptions[0].value;
//   console.log('📋 Scheduler: Auto-selecting first template:', initialData.template);
// }
    
//     // Step 3: Load and set the client
//     let clientLoaded = false;
//     if (data.clientId) {
//       clientLoaded = await loadAndSetClient(data.clientId.trim());
//     }
    
//     if (!clientLoaded) {
//       console.error('❌ Failed to load client, cannot proceed');
//       setIsLoadingFromScheduler(false);
//       return;
//     }
    
//     // Step 4: Load instruments for this client
//     console.log('🎯 Loading instruments for client:', data.clientId);
//     const instruments = await loadInstrumentsForScheduler(data.clientId.trim());
    
//     if (instruments.length === 0) {
//       console.error('❌ No instruments found for client');
//       setIsLoadingFromScheduler(false);
//       return;
//     }
    
//     // Step 5: Find the matching instrument
//     let targetInstrument = null;
//     const dropdownValue = data.dropdownInstrumentId?.trim() || '';
    
//     console.log('🔍 Looking for instrument matching:', dropdownValue);
    
//     // Strategy 1: Exact match with value
//     targetInstrument = instruments.find(inst => 
//       inst.value === dropdownValue
//     );
    
//     // Strategy 2: Match by label (instrument name)
//     if (!targetInstrument && data.instrumentName) {
//       targetInstrument = instruments.find(inst => 
//         inst.label.toLowerCase().includes(data.instrumentName.toLowerCase()) ||
//         data.instrumentName.toLowerCase().includes(inst.label.toLowerCase())
//       );
//     }
    
//     // Strategy 3: Contains match for partial values
//     if (!targetInstrument) {
//       targetInstrument = instruments.find(inst => 
//         dropdownValue.includes(inst.value) || 
//         inst.value.includes(dropdownValue)
//       );
//     }
    
//     // Fallback to first instrument
//     if (!targetInstrument && instruments.length > 0) {
//       targetInstrument = instruments[0];
//       console.log('📌 Using first instrument as fallback:', targetInstrument.label);
//     }
    
//     if (!targetInstrument) {
//       console.error('❌ Could not find any matching instrument');
//       setIsLoadingFromScheduler(false);
//       return;
//     }
    
//     console.log('✅ Found target instrument:', {
//       value: targetInstrument.value,
//       label: targetInstrument.label
//     });
    
//     // Step 6: Set the instrument in form data
//     setFormData(prev => ({ 
//       ...prev, 
//       instrument: targetInstrument.value,
//       path: '' // Clear path initially
//     }));
    
//     // Step 7: Load instrument details
// setIsLoading(true);
// try {
//   // Load protocol and instrument data
//   await loadProtocol(targetInstrument.value);
  
//   // Check if it's an interface instrument
//   const isInterface = isInterfaceInstrument(targetInstrument.value);
  
//   if (isInterface) {
//     const interfaceInstId = targetInstrument.value.includes(':') ? 
//       parseInt(targetInstrument.value.split(':')[1].trim()) : 0;
    
//     if (interfaceInstId > 0) {
//       console.log('🔍 Loading LIMS orders for interface instrument');
//       await loadLimsOrder(interfaceInstId);
//     }
//   } else {
//     setLimsOrderOptions([]);
//     setIsLimsOrderEnabled(false);
//   }
  
//   // Load instrument combo data
//   const instrumentData = await onChangeInstrumentCombo(targetInstrument.value);
  
//   if (instrumentData) {
//     const updates = {};
    
//     if (instrumentData.nCurMergeFileNo > 0) {
//       updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
//     } else {
//       updates.currentFileCount = '0';
//     }
    
//     const lockedMergeCount = getSessionValue("LockedMergeCount");
//     if (instrumentData.sTaskID && lockedMergeCount) {
//       updates.mergeFileCount = lockedMergeCount;
//     } else if (instrumentData.nMergeFileCount > 0) {
//       updates.mergeFileCount = String(instrumentData.nMergeFileCount);
//       setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
//     } else {
//       updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//     }
    
//     // For auto-locked instruments, force first template
//     if (instrumentData.sLockType === 'A' && templateOptions.length > 0) {
//       const firstTemplateValue = templateOptions[0].value;
//       updates.template = firstTemplateValue;
//       console.log('🔒 Scheduler: Auto-locked instrument, setting first template:', firstTemplateValue);
//     }
//     else if (instrumentData.sTemplateID && instrumentData.sTaskID) {
//       updates.template = instrumentData.sTemplateID;
//     }
//     else if (templateOptions.length > 0 && !formData.template) {
//       // Auto-select first template for non-auto-locked instruments too
//       updates.template = templateOptions[0].value;
//       console.log('📋 Scheduler: Auto-selecting first template');
//     }
    
//     setFormData(prev => ({ ...prev, ...updates }));
//   }
// } catch (error) {
//   console.error('❌ Error loading instrument details:', error);
// } finally {
//   setIsLoading(false);
// }
    
//     // Step 8: Load and set the path - THIS IS THE KEY FIX
//     if (data.sourcePath) {
//       console.log('🛣️ Loading scheduler path:', data.sourcePath);
      
//       // Wait a bit for instrument state to settle
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       // Load paths for this instrument
//       const pathsResponse = await makeAjaxCall(endpoints.lockPathCombo, {
//         sInstrumentID: targetInstrument.value,
//         sScheduleID: "",
//         sClientID: data.clientId?.trim() || ''
//       });
      
//       if (Array.isArray(pathsResponse) && pathsResponse.length > 0) {
//         const pathOptionsData = pathsResponse.map(path => ({
//           value: path.sTaskID ? path.sTaskID.trim() : '',
//           label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
//           originalItem: path
//         }));
        
//         console.log('🛣️ Available paths:', pathOptionsData.length);
//         setPathOptions(pathOptionsData);
        
//         // Find matching path
//         let selectedPath = null;
//         const sourcePath = data.sourcePath.trim();
        
//         // Try multiple matching strategies
//         const cleanSourcePath = sourcePath.toLowerCase().replace(/\\/g, '/');
        
//         // 1. Exact match
//         selectedPath = pathOptionsData.find(p => {
//           if (!p.label) return false;
//           return p.label.toLowerCase().replace(/\\/g, '/') === cleanSourcePath;
//         });
        
//         // 2. Path ends with source path
//         if (!selectedPath) {
//           selectedPath = pathOptionsData.find(p => {
//             if (!p.label) return false;
//             return p.label.toLowerCase().replace(/\\/g, '/').endsWith(cleanSourcePath);
//           });
//         }
        
//         // 3. Source path ends with path
//         if (!selectedPath) {
//           selectedPath = pathOptionsData.find(p => {
//             if (!p.label) return false;
//             return cleanSourcePath.endsWith(p.label.toLowerCase().replace(/\\/g, '/'));
//           });
//         }
        
//         // 4. Contains match
//         if (!selectedPath) {
//           selectedPath = pathOptionsData.find(p => {
//             if (!p.label) return false;
//             return p.label.toLowerCase().includes(cleanSourcePath) || 
//                    cleanSourcePath.includes(p.label.toLowerCase());
//           });
//         }
        
//         // 5. Last segment match
//         if (!selectedPath) {
//           const sourceLastSegment = cleanSourcePath.split('/').pop();
//           selectedPath = pathOptionsData.find(p => {
//             if (!p.label) return false;
//             const pathLastSegment = p.label.toLowerCase().replace(/\\/g, '/').split('/').pop();
//             return pathLastSegment === sourceLastSegment;
//           });
//         }
        
//         if (selectedPath) {
//           console.log('✅ Found matching path:', selectedPath.label);
          
//           // Set the path in form data
//           setFormData(prev => ({
//             ...prev,
//             path: selectedPath.value
//           }));
//         } else if (pathOptionsData.length > 0) {
//           // Fallback to first path
//           selectedPath = pathOptionsData[0];
//           console.log('📌 No exact match, using first path:', selectedPath.label);
//           setFormData(prev => ({
//             ...prev,
//             path: selectedPath.value
//           }));
//         }
//       }
//     }
    
//     // Step 9: Load tags if we have template and instrument
//     if (data.templateId?.trim() && targetInstrument.value) {
//       console.log('🔍 Scheduling tag loading for template:', data.templateId.trim());
      
//       // Wait for everything to settle before loading tags
//       setTimeout(async () => {
//         if (formData.template && formData.instrument) {
//           console.log('✅ Loading tags with data ready');
//           await fetchTags(formData.template, formData.instrument);
//         } else {
//           console.log('⚠️ Skipping tag load - missing data');
//         }
//       }, 1000);
//     }
    
//     setHasLoadedFromNavigation(true);
//     console.log('✅ Scheduler navigation completed!');
//     console.log('📊 Final form data:', {
//       client: formData.client,
//       instrument: formData.instrument,
//       path: formData.path,
//       template: formData.template,
//       fileName: formData.fileName
//     });
    
//   } catch (error) {
//     console.error('❌ Error in scheduler navigation:', error);
//   } finally {
//     setIsLoadingFromScheduler(false);
//   }
// };

// // 3. Update the loadAndSetInstrument function to ensure it loads paths after setting:
// const loadAndSetInstrument = async (clientId, instrumentValue) => {
//   try {
//     console.log('🎯 Loading and setting instrument. Client:', clientId, 'Instrument:', instrumentValue);
    
//     const response = await makeAjaxCall(endpoints.lockInstrumentCombo, {
//       sClientID: clientId,
//       sScheduleID: ""
//     });
    
//     if (Array.isArray(response) && response.length > 0) {
//       const instrumentOptionsData = response.map(instrument => ({
//         value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
//         label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
//         originalItem: instrument
//       }));
      
//       setInstrumentOptions(instrumentOptionsData);
      
//       // Find the matching instrument
//       let targetInstrument = null;
      
//       // Try different matching strategies
//       const cleanInstrumentValue = instrumentValue.replace(/\s+/g, '');
      
//       // Strategy 1: Exact match
//       targetInstrument = instrumentOptionsData.find(inst => 
//         inst.value === instrumentValue
//       );
      
//       // Strategy 2: Match after removing spaces
//       if (!targetInstrument) {
//         targetInstrument = instrumentOptionsData.find(inst => 
//           inst.value.replace(/\s+/g, '') === cleanInstrumentValue
//         );
//       }
      
//       // Strategy 3: Contains match
//       if (!targetInstrument) {
//         targetInstrument = instrumentOptionsData.find(inst => 
//           inst.value.includes(instrumentValue) || 
//           instrumentValue.includes(inst.value)
//         );
//       }
      
//       // Fallback to first instrument
//       if (!targetInstrument && instrumentOptionsData.length > 0) {
//         targetInstrument = instrumentOptionsData[0];
//         console.log('📌 Using first instrument as fallback');
//       }
      
//       if (targetInstrument) {
//         console.log('✅ Found instrument:', targetInstrument.value, targetInstrument.label);
        
//         setIsLoading(true);
        
//         try {
//           // Set the instrument
//           setFormData(prev => ({ 
//             ...prev, 
//             instrument: targetInstrument.value,
//             path: '',
//             fileName: '',
//             limsOrder: '',
//             limsOrderID: '',
//             limsSampleID: '',
//             limsTestCode: '',
//             limsReplicateID: ''
//           }));
          
//           // Clear current path options
//           setPathOptions([]);
          
//           // Load protocol and instrument data
//           await loadProtocol(targetInstrument.value);
          
//           // Check if it's an interface instrument
//           const isInterface = isInterfaceInstrument(targetInstrument.value);
          
//           if (isInterface) {
//             const interfaceInstId = targetInstrument.value.includes(':') ? 
//               parseInt(targetInstrument.value.split(':')[1].trim()) : 0;
            
//             if (interfaceInstId > 0) {
//               console.log('🔍 Loading LIMS orders for interface instrument');
//               await loadLimsOrder(interfaceInstId);
//             }
//           } else {
//             setLimsOrderOptions([]);
//             setIsLimsOrderEnabled(false);
//           }
          
//           // Load instrument combo data
//           const instrumentData = await onChangeInstrumentCombo(targetInstrument.value);
          
//           if (instrumentData) {
//             const updates = {};
            
//             if (instrumentData.nCurMergeFileNo > 0) {
//               updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
//             } else {
//               updates.currentFileCount = '0';
//             }
            
//             const lockedMergeCount = getSessionValue("LockedMergeCount");
//             if (instrumentData.sTaskID && lockedMergeCount) {
//               updates.mergeFileCount = lockedMergeCount;
//             } else if (instrumentData.nMergeFileCount > 0) {
//               updates.mergeFileCount = String(instrumentData.nMergeFileCount);
//               setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
//             } else {
//               updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//             }
            
//             if (instrumentData.sTemplateID && instrumentData.sTaskID) {
//               updates.template = instrumentData.sTemplateID;
//             }
//             else if (instrumentData.sLockType === 'A') {
//               if (templateOptions.length > 0) {
//                 const firstTemplateValue = templateOptions[0].value;
//                 updates.template = firstTemplateValue;
//               }
//             }
            
//             setFormData(prev => ({ ...prev, ...updates }));
//           }
          
//           // Return both success status and instrument value
//           return {
//             success: true,
//             instrumentValue: targetInstrument.value
//           };
          
//         } catch (error) {
//           console.error('Error setting instrument details:', error);
//           return {
//             success: false,
//             instrumentValue: null
//           };
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     }
//     return {
//       success: false,
//       instrumentValue: null
//     };
//   } catch (error) {
//     console.error('❌ Error loading instrument:', error);
//     setIsLoading(false);
//     return {
//       success: false,
//       instrumentValue: null
//     };
//   }
// };

// // 4. Add a useEffect to watch for instrument changes and load paths:
// useEffect(() => {
//   const loadPathsAfterInstrumentChange = async () => {
//     // Only load paths if we're in scheduler mode and have an instrument
//     if (isLoadingFromScheduler && formData.instrument && !formData.path) {
//       const schedulerDataStr = sessionStorage.getItem('schedulerData');
//       if (schedulerDataStr) {
//         try {
//           const schedulerData = JSON.parse(schedulerDataStr);
//           if (schedulerData.sourcePath) {
//             console.log('🔄 Auto-loading path after instrument change');
//             await loadAndSetPath(schedulerData.sourcePath.trim());
//           }
//         } catch (error) {
//           console.error('Error parsing scheduler data:', error);
//         }
//       }
//     }
//   };
  
//   loadPathsAfterInstrumentChange();
// }, [formData.instrument, isLoadingFromScheduler, formData.path]);

// // Add this useEffect
// useEffect(() => {
//   const loadPathForScheduler = async () => {
//     // Only run when we have an instrument but no path, and we're in scheduler mode
//     if (isLoadingFromScheduler && formData.instrument && !formData.path) {
//       const schedulerDataStr = sessionStorage.getItem('schedulerData');
//       if (schedulerDataStr) {
//         try {
//           const schedulerData = JSON.parse(schedulerDataStr);
//           if (schedulerData.sourcePath) {
//             console.log('🔧 Auto-loading path after instrument was set:', formData.instrument);
            
//             // Small delay to ensure everything is ready
//             setTimeout(async () => {
//               await loadAndSetPath(schedulerData.sourcePath.trim(), formData.instrument);
//             }, 300);
//           }
//         } catch (error) {
//           console.error('Error parsing scheduler data:', error);
//         }
//       }
//     }
//   };
  
//   loadPathForScheduler();
// }, [formData.instrument, formData.path, isLoadingFromScheduler]);

// // 5. Add a useEffect to debug path loading:
// useEffect(() => {
//   console.log('🛣️ PATH STATE DEBUG:', {
//     formDataPath: formData.path,
//     pathOptionsCount: pathOptions.length,
//     pathOptions: pathOptions.map(p => ({ value: p.value, label: p.label })),
//     isLoadingFromScheduler,
//     hasLoadedFromNavigation
//   });
// }, [formData.path, pathOptions, isLoadingFromScheduler, hasLoadedFromNavigation]);

// // 6. Update the onChangeInstrumentCombo to properly handle paths:
// const onChangeInstrumentCombo = useCallback(async (instrumentId) => {
//   try {
//     const nLLProStatus = 0;
//     const nProtocolStatus = parseInt(formData.protocolID) || 0;
//     const nProtocolStatusfile = isFileNameEnabled ? 101 : 0;
    
//     console.log('🔧 onChangeInstrumentCombo called with:', instrumentId);
    
//     const response = await makeAjaxCall(endpoints.onChangeInstrumentCombo, {
//       sInstrumentID: instrumentId,
//       nLLProStatus: nLLProStatus,
//       nProtocolStatus: nProtocolStatus,
//       nProtocolStatusfile: nProtocolStatusfile
//     }, "SelectPathFileUSerTemplate");
    
//     if (response) {
//       const activeUserDetails = getActiveUserDetails();
//       const currentUserId = activeUserDetails.sUserID || activeUserDetails.ActiveUserDetails?.sUserID;
      
//       // Reset lock states first
//       setIsLocked(false);
//       setIsAutoLocked(false);
//       setLockedByOtherUser(false);
      
//       // Then check actual lock status
//       if (response.sLockType === 'A') {
//         setIsAutoLocked(true);
//         setIsLocked(true);
//         setLockedByOtherUser(false);
//       } else if (response.sUserID && response.sUserID.trim() !== '') {
//         setIsLocked(true);
//         setIsAutoLocked(false);
        
//         const responseUserId = response.sUserID ? response.sUserID.trim() : '';
        
//         if (responseUserId === currentUserId) {
//           setLockedByOtherUser(false);
//         } else {
//           setLockedByOtherUser(true);
//         }
//       }
      
//       const updates = {};
      
//       if (response.sFileName) {
//         updates.fileName = response.sFileName;
//       }
      
//       if (response.nCurMergeFileNo > 0) {
//         updates.currentFileCount = String(response.nCurMergeFileNo);
//       } else {
//         updates.currentFileCount = '0';
//       }
      
//       if (response.nMergeFileCount > 0) {
//         updates.mergeFileCount = String(response.nMergeFileCount);
//         setSessionValue("LockedMergeCount", String(response.nMergeFileCount));
//       } else if (response.sTaskID != null) {
//         const lockedMergeCount = getSessionValue("LockedMergeCount");
//         if (lockedMergeCount) {
//           updates.mergeFileCount = lockedMergeCount;
//         } else {
//           updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//         }
//       } else {
//         updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//       }
      
//       if (response.nAutoUnlock) {
//         updates.unlockAfterCapture = true;
//       } else {
//         updates.unlockAfterCapture = false;
//       }
      
//       if (response.sLockID) {
//         updates.lockID = response.sLockID;
//       } else {
//         updates.lockID = '';
//       }
      
//       if (response.nInterFaceOrderID) {
//         updates.interfaceOrderID = String(response.nInterFaceOrderID);
//       } else {
//         updates.interfaceOrderID = '';
//       }
      
//       // =========== IMPORTANT: AUTO-SELECT FIRST TEMPLATE LOGIC ===========
      
//       let selectedTemplate = null;
      
//       // 1. If instrument is auto-locked, always select first template
//       if (response.sLockType === 'A' && templateOptions.length > 0) {
//         selectedTemplate = templateOptions[0].value;
//         updates.template = selectedTemplate;
//         console.log('📋 Auto-locked: auto-selecting first template:', selectedTemplate);
//       } 
//       // 2. If instrument has a template from previous lock, use that
//       else if (response.sTemplateID && response.sTemplateID.trim() !== '') {
//         selectedTemplate = response.sTemplateID.trim();
//         updates.template = selectedTemplate;
//         console.log('📋 Using existing template from lock:', selectedTemplate);
//       }
//       // 3. If instrument has no template but we have template options, auto-select first one
//       else if (templateOptions.length > 0 && !formData.template) {
//         selectedTemplate = templateOptions[0].value;
//         updates.template = selectedTemplate;
//         console.log('📋 Auto-selecting first template (no existing lock):', selectedTemplate);
//       }
//       // 4. If user already selected a template, keep it (don't override)
//       else if (formData.template) {
//         // Keep current template selection
//         selectedTemplate = formData.template;
//         updates.template = selectedTemplate;
//         console.log('📋 Keeping user-selected template:', selectedTemplate);
//       }
      
//       // IMPORTANT: Don't clear the path if we're loading from scheduler
//       if (!isLoadingFromScheduler) {
//         updates.path = '';
//       }
      
//       // Set the form data first
//       setFormData(prev => ({ ...prev, ...updates }));
      
//       // =========== IMPORTANT: LOAD TAGS FOR AUTO-LOCKED INSTRUMENTS ===========
//       // Load tags immediately if we have a template and instrument
//       if (selectedTemplate && instrumentId) {
//         console.log('🔍 Immediately loading tags for auto-selected template:', selectedTemplate);
        
//         // Small delay to ensure state updates, then load tags
//         setTimeout(() => {
//           fetchTags(selectedTemplate, instrumentId);
//         }, 300);
//       }
      
//       return response;
//     }
//   } catch (error) {
//     // Reset states on error
//     setIsLocked(false);
//     setIsAutoLocked(false);
//     setLockedByOtherUser(false);
//     return null;
//   }
// }, [formData.protocolID, isFileNameEnabled, templateOptions, isLoadingFromScheduler, formData.template, fetchTags]);

// // 4. Update the initial load useEffect to handle scheduler data better:
// // Update the initial load useEffect
// useEffect(() => {
//   if (initialLoadDoneRef.current) return;
  
//   const loadData = async () => {
//     setIsLoading(true);
    
//     try {
//       // Load essential data first
//       await checkMergeAndAutoUnlockSettings();
//       await loadUsers();
      
//       // Load templates
//       const activeUserDetails = getActiveUserDetails();
//       const templateResponse = await makeAjaxCall(endpoints.lockTemplateCombo, {
//         ActiveUserDetails: activeUserDetails,
//         ApplicationCode: "SDMS"
//       });
      
//       if (Array.isArray(templateResponse) && templateResponse.length > 0) {
//         const templates = templateResponse
//           .map(template => ({
//             value: String(template.sTemplateID || '').trim(),
//             label: String(template.sTemplateName || '').trim()
//           }))
//           .filter(template => template.value && template.label && template.value !== 'undefined');
        
//         const order = ['QC', 'Calibration', 'Method Development', 'Project'];
//         const sortedTemplates = templates.sort((a, b) => {
//           const labelA = a.label || '';
//           const labelB = b.label || '';
          
//           const indexA = order.findIndex(pattern => labelA.includes(pattern));
//           const indexB = order.findIndex(pattern => labelB.includes(pattern));
          
//           if (indexA !== -1 && indexB !== -1) {
//             return indexA - indexB;
//           }
          
//           if (indexA !== -1) return -1;
//           if (indexB !== -1) return 1;
          
//           return labelA.localeCompare(labelB);
//         });
        
//         setTemplateOptions(sortedTemplates);
//       }
      
//       // Check for stored scheduler data
//       const fromScheduler = sessionStorage.getItem('fromScheduler');
//       const storedData = sessionStorage.getItem('schedulerData');
      
//       if (fromScheduler === 'true' && storedData) {
//         try {
//           const schedulerData = JSON.parse(storedData);
//           console.log('🔍 Processing STORED scheduler data from session');
          
//           // Process scheduler data after a short delay to ensure templates are loaded
//           setTimeout(() => {
//             handleSchedulerNavigation(schedulerData);
//           }, 800);
          
//           // Mark initial load as done
//           initialLoadDoneRef.current = true;
//           return;
//         } catch (error) {
//           console.error('Error parsing stored scheduler data:', error);
//           sessionStorage.removeItem('fromScheduler');
//           sessionStorage.removeItem('schedulerData');
//         }
//       }
      
//       // NORMAL INITIALIZATION
//       console.log('🔧 Starting normal initialization');
//       await loadClients();
//       initialLoadDoneRef.current = true;
      
//     } catch (error) {
//       console.error('Error in initial load:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   loadData();
// }, []);

// // 5. Add this useEffect to debug scheduler loading state:
// useEffect(() => {
//   console.log('🔍 SCHEDULER LOADING STATE:', {
//     isLoadingFromScheduler,
//     hasLoadedFromNavigation,
//     formData: {
//       client: formData.client,
//       instrument: formData.instrument,
//       path: formData.path,
//       template: formData.template
//     },
//     options: {
//       clientOptions: clientOptions.length,
//       instrumentOptions: instrumentOptions.length,
//       pathOptions: pathOptions.length,
//       templateOptions: templateOptions.length
//     }
//   });
// }, [isLoadingFromScheduler, hasLoadedFromNavigation, formData, 
//     clientOptions, instrumentOptions, pathOptions, templateOptions]);

//   // Handle scheduler navigation
  

//   // Load instruments for scheduler (no auto-select)
//   const loadInstrumentsForScheduler = async (clientId) => {
//   try {
//     const response = await makeAjaxCall(endpoints.lockInstrumentCombo, {
//       sClientID: clientId,
//       sScheduleID: ""
//     });
    
//     if (Array.isArray(response) && response.length > 0) {
//       const instrumentOptionsData = response.map(instrument => ({
//         value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
//         label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
//         originalItem: instrument
//       }));
      
//       console.log(`✅ Loaded ${instrumentOptionsData.length} instruments`);
//       setInstrumentOptions(instrumentOptionsData);
//       return instrumentOptionsData;
//     }
    
//     return [];
//   } catch (error) {
//     console.error('Error loading instruments:', error);
//     return [];
//   }
// };

//   // Load paths for scheduler
//   const loadPathsForScheduler = async (instrumentId, sourcePath) => {
//   try {
//     console.log('🔍 Loading paths for scheduler:', {
//       instrumentId,
//       sourcePath
//     });
    
//     const response = await makeAjaxCall(endpoints.lockPathCombo, {
//       sInstrumentID: instrumentId,
//       sScheduleID: "",
//       sClientID: formData.client || ''
//     });
    
//     console.log('📊 Path response:', response);
    
//     if (Array.isArray(response) && response.length > 0) {
//       const pathOptionsData = response.map(path => ({
//         value: path.sTaskID ? path.sTaskID.trim() : '',
//         label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
//         originalItem: path
//       }));
      
//       console.log('🛣️ Available paths:', pathOptionsData.map(p => p.label));
//       setPathOptions(pathOptionsData);
      
//       // Find matching path
//       let selectedPath = null;
      
//       if (sourcePath) {
//         // Clean paths for comparison
//         const cleanSourcePath = sourcePath.toLowerCase().trim().replace(/\\/g, '/');
        
//         console.log('🔍 Looking for path matching:', cleanSourcePath);
        
//         // Try multiple matching strategies
//         selectedPath = pathOptionsData.find(path => {
//           if (!path.label) return false;
          
//           const cleanPathLabel = path.label.toLowerCase().trim().replace(/\\/g, '/');
          
//           // 1. Exact match
//           if (cleanPathLabel === cleanSourcePath) {
//             console.log('✅ Exact match found');
//             return true;
//           }
          
//           // 2. Path ends with source path
//           if (cleanPathLabel.endsWith(cleanSourcePath)) {
//             console.log('✅ Path ends with source path');
//             return true;
//           }
          
//           // 3. Contains match
//           if (cleanPathLabel.includes(cleanSourcePath)) {
//             console.log('✅ Path contains source path');
//             return true;
//           }
          
//           // 4. Check last segment
//           const sourceSegments = cleanSourcePath.split('/').filter(Boolean);
//           const pathSegments = cleanPathLabel.split('/').filter(Boolean);
          
//           if (sourceSegments.length > 0 && pathSegments.length > 0) {
//             if (pathSegments[pathSegments.length - 1] === sourceSegments[sourceSegments.length - 1]) {
//               console.log('✅ Last segment matches');
//               return true;
//             }
//           }
          
//           return false;
//         });
//       }
      
//       // Fallback to first path if no match found
//       if (!selectedPath && pathOptionsData.length > 0) {
//         selectedPath = pathOptionsData[0];
//         console.log('📌 Using first available path as fallback');
//       }
      
//       if (selectedPath) {
//         console.log('✅ Setting selected path:', selectedPath.label);
//         setFormData(prev => ({
//           ...prev,
//           path: selectedPath.value
//         }));
//         return true;
//       }
//     }
    
//     return false;
//   } catch (error) {
//     console.error('❌ Error loading paths for scheduler:', error);
//     return false;
//   }
// };

//   useEffect(() => {
//     const device = sessionStorage.getItem("device") || "desktop";
//     setDeviceType(device);
//   }, []);

//   const isInterfaceInstrument = useCallback((instrumentId) => {
//     if (!instrumentId) return false;
//     const idStr = instrumentId.toString().trim();
//     const parts = idStr.split(':');
//     return parts.length > 1 && parts[1] && parts[1].trim() !== "0";
//   }, []);

  

  

//   const handleInlineEditSubmit = useCallback((index, value, valueID) => {
//     setTags(prev => {
//       const updatedTags = prev.map((t, idx) => {
//         if (idx === index) {
//           return { ...t, value, valueID };
//         }
        
//         if (idx > index) {
//           return { ...t, value: '', valueID: '', options: [] };
//         }
        
//         return t;
//       });
      
//       return updatedTags;
//     });
    
//     if (value) {
//       setTagErrors(prev => ({ ...prev, [index]: false }));
//     }
//   }, []);

//   const checkMergeAndAutoUnlockSettings = useCallback(async () => {
//     try {
//       const response = await makeAjaxCall(endpoints.mergeFileAndAutoUnlock, {});
      
//       if (response) {
//         const showMerge = response.MergeCount?.[0]?.L67Status === false;
//         setShowMergeFields(showMerge);
        
//         const showUnlock = response.AutoUnlock?.[0]?.L67Status === false;
//         setShowUnlockOption(showUnlock);
        
//         if (response.MergeCountValue?.[0]?.L42ValueSettings) {
//           const mergeCount = response.MergeCountValue[0].L42ValueSettings;
//           setFormData(prev => ({ ...prev, mergeFileCount: mergeCount }));
//           setSessionValue("MergeCount", mergeCount);
//         }
        
//         if (response.AutoUnlockValue?.[0]?.L42ValueSettings === "1") {
//           setFormData(prev => ({ ...prev, unlockAfterCapture: true }));
//         }
//       }
//     } catch (error) {
//       // Silent error handling
//     }
//   }, [t]);

//   const loadUsers = useCallback(async () => {
//     try {
//       const response = await makeAjaxCall(endpoints.lockUserCombo, {});
      
//       if (Array.isArray(response) && response.length > 0) {
//         const users = response.map(user => ({
//           value: user.sUserID ? user.sUserID.trim() : '',
//           label: user.sUserName || t('instrumentlocktag.unknownuser')
//         }));
        
//         setUserOptions(users);
        
//         const activeUserDetails = getActiveUserDetails();
//         const currentUserId = activeUserDetails.sUserID || "U1";
        
//         const currentUser = users.find(user => user.value === currentUserId);
//         if (currentUser) {
//           setFormData(prev => ({ ...prev, user: currentUser.value }));
//         }
//       }
//     } catch (error) {
//       // Silent error handling
//     }
//   }, [t]);

//   const loadProtocol = useCallback(async (instrumentId) => {
//     try {
//       const response = await makeAjaxCall(endpoints.loadProtocol, {
//         sInstrumentID: instrumentId
//       });
      
//       if (response) {
//         const parserTypeValue = String(response.L11ParserType || '0');
        
//         const fileNameEnabled = response.FileName === "true";
//         setIsFileNameEnabled(fileNameEnabled);
        
//         setSessionValue("FileName", fileNameEnabled.toString());
//         setSessionValue("L11ParserType", parserTypeValue);
        
//         const isInterface = isInterfaceInstrument(instrumentId);
//         setIsInstrumentInterface(isInterface);
        
//         if (isInterface) {
//           if (fileNameEnabled) {
//             setIsLimsOrderEnabled(false);
//           } else {
//             setIsLimsOrderEnabled(true);
//           }
//         } else {
//           setIsLimsOrderEnabled(false);
//         }
        
//         return response;
//       }
//     } catch (error) {
//       return null;
//     }
//   }, [isInterfaceInstrument, t]);

//   const loadLimsOrder = useCallback(async (interfaceInstId) => {
//     try {
//       const response = await makeAjaxCall(endpoints.lockLimsordercombo, {
//         nInterfaceInstID: interfaceInstId
//       });
      
//       if (Array.isArray(response) && response.length > 0) {
//         const limsOrders = response.map(order => ({
//           value: order.nOrderID ? String(order.nOrderID).trim() : '',
//           label: order.LIMSOrder || t('instrumentlocktag.unknownorder'),
//           orderID: order.nOrderID || '',
//           sampleID: order.SampleID || '',
//           testCode: order.TestCode || '',
//           replicateID: order.ReplicateID || '',
//           ...order
//         }));
        
//         setLimsOrderOptions(limsOrders);
//         setIsLimsOrderEnabled(true);
        
//         if (limsOrders.length > 0) {
//           const firstOrder = limsOrders[0];
//           setFormData(prev => ({ 
//             ...prev, 
//             limsOrder: firstOrder.value,
//             limsOrderID: firstOrder.orderID,
//             limsSampleID: firstOrder.sampleID,
//             limsTestCode: firstOrder.testCode,
//             limsReplicateID: firstOrder.replicateID
//           }));
//         }
        
//         return limsOrders;
//       } else {
//         setLimsOrderOptions([]);
//         setIsLimsOrderEnabled(false);
//         setFormData(prev => ({ 
//           ...prev, 
//           limsOrder: '',
//           limsOrderID: '',
//           limsSampleID: '',
//           limsTestCode: '',
//           limsReplicateID: ''
//         }));
//         return [];
//       }
//     } catch (error) {
//       setLimsOrderOptions([]);
//       setIsLimsOrderEnabled(false);
//       setFormData(prev => ({ 
//         ...prev, 
//         limsOrder: '',
//         limsOrderID: '',
//         limsSampleID: '',
//         limsTestCode: '',
//         limsReplicateID: ''
//       }));
//       return [];
//     }
//   }, [t]);

  

//   const loadPaths = useCallback(async (instrumentId) => {
//     try {
//       let endpoint = endpoints.lockPathCombo;
//       let requestBody = {
//         sInstrumentID: instrumentId,
//         sScheduleID: ""
//       };
      
//       if (getDeactiveScheduleDataRef.current) {
//         const scheduleData = getDeactiveScheduleDataRef.current;
//         const scheduleId = scheduleData.L13ScheduleID;
//         const taskType = scheduleData.TaskType;
        
//         if (taskType === "ScheduleCreation") {
//           endpoint = endpoints.lockActiveInstrumentPathCombo;
//         } else {
//           endpoint = endpoints.lockDeactiveInstrumentPathCombo;
//         }
//         requestBody.sScheduleID = scheduleId;
//       }
      
//       const response = await makeAjaxCall(endpoint, requestBody);
      
//       if (Array.isArray(response) && response.length > 0) {
//         const pathOptionsData = response.map(path => ({
//           value: path.sTaskID || path.L13ScheduleID || '',
//           label: path.sTaskSourcePath || t('instrumentlocktag.unknownpath'),
//           originalItem: path
//         }));
        
//         setPathOptions(pathOptionsData);
        
//         if (pathOptionsData.length > 0) {
//           const firstPath = pathOptionsData[0];
//           setFormData(prev => ({ ...prev, path: firstPath.value }));
          
//           if (formData.template) {
//             fetchTags(formData.template, instrumentId);
//           }
//         }
//       } else {
//         setPathOptions([]);
//       }
//     } catch (error) {
//       setPathOptions([]);
//     }
//   }, [formData.template, fetchTags, t]);

//   // Normal instrument loading (for non-scheduler)
//   // Normal instrument loading (for non-scheduler)
// // Normal instrument loading (for non-scheduler)
// const loadInstruments = useCallback(async (clientId) => {
//   try {
//     let endpoint = endpoints.lockInstrumentCombo;
//     let requestBody = {
//       sClientID: clientId,
//       sScheduleID: ""
//     };
    
//     if (getDeactiveScheduleDataRef.current) {
//       const scheduleData = getDeactiveScheduleDataRef.current;
//       const scheduleId = scheduleData.L13ScheduleID;
//       const taskType = scheduleData.TaskType;
      
//       if (taskType === "ScheduleCreation") {
//         endpoint = endpoints.lockActiveParsingInstrumentCombo;
//       } else {
//         endpoint = endpoints.lockDeactiveParsingInstrumentCombo;
//       }
//       requestBody.sScheduleID = scheduleId;
//     }
    
//     const response = await makeAjaxCall(endpoint, requestBody);
    
//     if (Array.isArray(response) && response.length > 0) {
//       const instrumentOptionsData = response.map(instrument => ({
//         value: instrument.L11InstrumentID ? instrument.L11InstrumentID.trim() : '',
//         label: instrument.L11InstrumentAliasName || t('instrumentlocktag.unknowninstrument'),
//         originalItem: instrument
//       }));
      
//       setInstrumentOptions(instrumentOptionsData);
      
//       // Auto-select first instrument only if not loading from scheduler
//       if (instrumentOptionsData.length > 0 && !isLoadingFromScheduler) {
//         const firstInstrument = instrumentOptionsData[0];
        
//         setIsLoading(true);
        
//         try {
//           setFormData(prev => ({ 
//             ...prev, 
//             instrument: firstInstrument.value,
//             path: '',
//             fileName: '',
//             limsOrder: '',
//             limsOrderID: '',
//             limsSampleID: '',
//             limsTestCode: '',
//             limsReplicateID: '',
//             mergeFileCount: getSessionValue("MergeCount") || '1',
//             currentFileCount: '0'
//           }));
          
//           setErrors(prev => ({ ...prev, instrument: false }));
          
//           setTags([]);
//           setTagErrors({});
//           setPathOptions([]);
          
//           const isInterface = isInterfaceInstrument(firstInstrument.value);
          
//           await loadProtocol(firstInstrument.value);
          
//           if (isInterface) {
//             const interfaceInstId = firstInstrument.value.includes(':') ? 
//               parseInt(firstInstrument.value.split(':')[1].trim()) : 0;
            
//             if (interfaceInstId > 0) {
//               await loadLimsOrder(interfaceInstId);
//             }
//           } else {
//             setLimsOrderOptions([]);
//             setIsLimsOrderEnabled(false);
//           }
          
//           const instrumentData = await onChangeInstrumentCombo(firstInstrument.value);
          
//           if (instrumentData) {
//             const updates = {};
            
//             if (instrumentData.nCurMergeFileNo > 0) {
//               updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
//             } else {
//               updates.currentFileCount = '0';
//             }
            
//             const lockedMergeCount = getSessionValue("LockedMergeCount");
//             if (instrumentData.sTaskID && lockedMergeCount) {
//               updates.mergeFileCount = lockedMergeCount;
//             } else if (instrumentData.nMergeFileCount > 0) {
//               updates.mergeFileCount = String(instrumentData.nMergeFileCount);
//               setSessionValue("LockedMergeCount", String(instrumentData.nMergeFileCount));
//             } else {
//               updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//             }
            
//             // DON'T set template here - let onChangeInstrumentCombo handle it
//             // This will allow auto-selection of first template
            
//             setFormData(prev => ({ ...prev, ...updates }));
//           }
          
//           await loadPaths(firstInstrument.value);
          
//         } catch (error) {
//           console.error('Error loading instrument details:', error);
//         } finally {
//           setIsLoading(false);
//         }
//       }
      
//       return instrumentOptionsData;
      
//     } else {
//       setInstrumentOptions([]);
//       return [];
//     }
//   } catch (error) {
//     console.error('Error loading instruments:', error);
//     setInstrumentOptions([]);
//     setIsLoading(false);
//     return [];
//   }
// }, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
//     isInterfaceInstrument, isLoadingFromScheduler]);

//   const loadClients = useCallback(async () => {
//     try {
//       const preselectedClientId = scheduleData?.L06ClientID;
//       const taskStatus = scheduleData?.TaskType !== "ScheduleCreation" ? 'D' : 'A';
       
//       const response = await makeAjaxCall(endpoints.clientLockCombo, {
//         sTaskStatus: taskStatus,
//         sClientID: preselectedClientId
//       });
      
//       if (Array.isArray(response) && response.length > 0) {
//         const clientOptionsData = response.map(client => ({
//           value: client.sClientID ? client.sClientID.trim() : '',
//           label: client.sClientName || t('instrumentlocktag.unknownclient')
//         }));
        
//         setClientOptions(clientOptionsData);
        
//         let clientToSelect = null;
        
//         if (preselectedClientId) {
//           clientToSelect = clientOptionsData.find(client => client.value === preselectedClientId);
//         }
        
//         if (!clientToSelect && clientOptionsData.length > 0) {
//           clientToSelect = clientOptionsData[0];
//         }
        
//         if (clientToSelect) {
//           setFormData(prev => ({ ...prev, client: clientToSelect.value }));
//           await loadInstruments(clientToSelect.value);
//         }
//       } else {
//         setClientOptions([]);
//       }
//     } catch (error) {
//       console.error('Error loading clients:', error);
//       setClientOptions([]);
//     }
//   }, [scheduleData, loadInstruments, t]);

//   const loadTagOptions = useCallback(async (tagIndex) => {
//     if (!formData.template || !tags[tagIndex]) return [];
    
//     const tag = tags[tagIndex];
    
//     let previousTagValueID = "";
//     if (tagIndex > 0) {
//       previousTagValueID = tags[tagIndex - 1].valueID || "          ";
//     }
    
//     try {
//       const options = await loadTagValues(
//         tag.tagID, 
//         formData.template, 
//         formData.instrument,
//         tagIndex,
//         previousTagValueID
//       );
      
//       return options || [];
//     } catch (error) {
//       return [];
//     }
//   }, [formData.template, formData.instrument, tags, loadTagValues, t]);

//   const handleTagValueClick = useCallback((index, value, valueID) => {
//     setTags(prev => {
//       const updatedTags = prev.map((t, idx) => {
//         if (idx === index) {
//           return { ...t, value, valueID };
//         }
        
//         if (idx > index) {
//           return { ...t, value: '', valueID: '', options: [] };
//         }
        
//         return t;
//       });
      
//       return updatedTags;
//     });
    
//     if (value) {
//       setTagErrors(prev => ({ ...prev, [index]: false }));
//     }
    
//     if (index < tags.length - 1) {
//       loadTagOptions(index + 1).then(options => {
//         if (options.length > 0) {
//           setTags(prev => prev.map((tag, idx) => 
//             idx === index + 1 ? { ...tag, options } : tag
//           ));
//         }
//       });
//     }
//   }, [tags, loadTagOptions]);

//   const handleTagEditRequest = useCallback(async (tagIndex) => {
//     if (tags[tagIndex] && tags[tagIndex].options && tags[tagIndex].options.length > 0) {
//       return tags[tagIndex].options;
//     }
    
//     const options = await loadTagOptions(tagIndex);
    
//     setTags(prev => prev.map((tag, idx) => 
//       idx === tagIndex ? { ...tag, options } : tag
//     ));
    
//     return options;
//   }, [tags, loadTagOptions]);

//   const showFullPageLoader = isLoading || isSubmitting || isLoadingTags || isLoadingOptions || isLoadingFromScheduler;
  
//   // Initial load
//   useEffect(() => {
//     if (initialLoadDoneRef.current) return;
    
//     const loadData = async () => {
//       setIsLoading(true);
      
//       try {
//         await checkMergeAndAutoUnlockSettings();
//         await loadUsers();
        
//         // Load templates
//         const activeUserDetails = getActiveUserDetails();
//         const templateResponse = await makeAjaxCall(endpoints.lockTemplateCombo, {
//           ActiveUserDetails: activeUserDetails,
//           ApplicationCode: "SDMS"
//         });
        
//         if (Array.isArray(templateResponse) && templateResponse.length > 0) {
//           const templates = templateResponse
//             .map(template => ({
//               value: String(template.sTemplateID || '').trim(),
//               label: String(template.sTemplateName || '').trim()
//             }))
//             .filter(template => template.value && template.label && template.value !== 'undefined');
          
//           const order = ['QC', 'Calibration', 'Method Development', 'Project'];
//           const sortedTemplates = templates.sort((a, b) => {
//             const labelA = a.label || '';
//             const labelB = b.label || '';
            
//             const indexA = order.findIndex(pattern => labelA.includes(pattern));
//             const indexB = order.findIndex(pattern => labelB.includes(pattern));
            
//             if (indexA !== -1 && indexB !== -1) {
//               return indexA - indexB;
//             }
            
//             if (indexA !== -1) return -1;
//             if (indexB !== -1) return 1;
            
//             return labelA.localeCompare(labelB);
//           });
          
//           setTemplateOptions(sortedTemplates);
//         }
        
//         // Check for stored scheduler data
//         const fromScheduler = sessionStorage.getItem('fromScheduler');
//         const storedData = sessionStorage.getItem('schedulerData');
        
//         if (fromScheduler === 'true' && storedData) {
//           try {
//             const schedulerData = JSON.parse(storedData);
//             console.log('🔍 Processing stored scheduler data');
            
//             // Clear storage to prevent reload on refresh
//             sessionStorage.removeItem('fromScheduler');
//             sessionStorage.removeItem('schedulerData');
            
//             // Process scheduler data
//             setTimeout(() => {
//               handleSchedulerNavigation(schedulerData);
//             }, 500);
            
//             return; // Skip normal initialization
//           } catch (error) {
//             console.error('Error parsing stored scheduler data:', error);
//           }
//         }
        
//         // Normal initialization
//         await loadClients();
//         initialLoadDoneRef.current = true;
        
//       } catch (error) {
//         console.error('Error in initial load:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     loadData();
//   }, []);

//   useEffect(() => {
//     if (formData.template && formData.template.trim() !== '' && formData.instrument) {
//       fetchTags(formData.template, formData.instrument);
//     } else {
//       setTags([]);
//     }
//   }, [formData.template, formData.instrument, fetchTags]);

// // Add a ref to track the last loaded template/instrument combination
// const lastLoadRef = useRef({ template: '', instrument: '' });

// useEffect(() => {
//   const loadTagsForTemplate = async () => {
//     if (!formData.template || !formData.template.trim() || !formData.instrument) {
//       setTags([]);
//       return;
//     }
    
//     // Check if we're already loading or if this combination was just loaded
//     const currentKey = `${formData.template}-${formData.instrument}`;
//     const lastKey = `${lastLoadRef.current.template}-${lastLoadRef.current.instrument}`;
    
//     if (currentKey === lastKey && tags.length > 0) {
//       console.log('📋 Skipping tag load - same template/instrument');
//       return;
//     }
    
//     // Don't load if we're already loading
//     if (isLoadingTags) {
//       console.log('⏳ Already loading tags, skipping');
//       return;
//     }
    
//     console.log('🔍 Loading tags for template:', formData.template);
    
//     // Update the last loaded reference
//     lastLoadRef.current = {
//       template: formData.template,
//       instrument: formData.instrument
//     };
    
//     await fetchTags(formData.template, formData.instrument);
//   };
  
//   // Use a debounce to prevent rapid successive calls
//   const timer = setTimeout(() => {
//     loadTagsForTemplate();
//   }, 300); // 300ms delay
  
//   return () => clearTimeout(timer);
// }, [formData.template, formData.instrument, fetchTags, isLoadingTags, tags.length]);


// useEffect(() => {
//   // Handle auto-locked instrument template loading
//   const handleAutoLockedInstrument = async () => {
//     if (isAutoLocked && formData.instrument && templateOptions.length > 0) {
//       console.log('🔒 Processing auto-locked instrument:', formData.instrument);
      
//       // Ensure template is set for auto-locked instruments
//       if (!formData.template) {
//         const firstTemplate = templateOptions[0].value;
//         console.log('📋 Setting first template for auto-locked instrument:', firstTemplate);
        
//         setFormData(prev => ({
//           ...prev,
//           template: firstTemplate
//         }));
        
//         // Load tags after a short delay
//         setTimeout(() => {
//           if (firstTemplate && formData.instrument) {
//             console.log('🔍 Loading tags for auto-locked instrument');
//             fetchTags(firstTemplate, formData.instrument);
//           }
//         }, 500);
//       } else if (formData.template && formData.instrument) {
//         // If template is already set, make sure tags are loaded
//         console.log('🔍 Auto-locked instrument has template, ensuring tags are loaded');
//         fetchTags(formData.template, formData.instrument);
//       }
//     }
//   };
  
//   handleAutoLockedInstrument();
// }, [isAutoLocked, formData.instrument, formData.template, templateOptions, fetchTags]);


//   const handleClientChange = useCallback(async (value) => {
//   // Save current template before clearing
//   const currentTemplate = formData.template;
  
//   setFormData(prev => ({ 
//     ...prev, 
//     client: value, 
//     instrument: '', 
//     path: '', 
//     fileName: '', 
//     limsOrder: '',
//     // Don't clear template here - let it persist
//     template: currentTemplate
//   }));
//   setErrors(prev => ({ ...prev, client: false }));
  
//   setInstrumentOptions([]);
//   setPathOptions([]);
//   setLimsOrderOptions([]);
//   setTags([]);
//   setTagErrors({});
  
//   if (value) {
//     setIsLoading(true);
//     try {
//       await loadInstruments(value);
//     } finally {
//       setIsLoading(false);
//     }
//   }
// }, [loadInstruments]);

//   const handleInstrumentChange = useCallback(async (value) => {
//   setIsLoading(true);
  
//   // Reset the last load reference
//   lastLoadRef.current = { template: '', instrument: '' };
  
//   setFormData(prev => ({ 
//     ...prev, 
//     instrument: value, 
//     path: '', 
//     fileName: '', 
//     limsOrder: '',
//     limsOrderID: '',
//     limsSampleID: '',
//     limsTestCode: '',
//     limsReplicateID: '',
//     mergeFileCount: getSessionValue("MergeCount") || '1',
//     currentFileCount: '0'
//   }));
//   setErrors(prev => ({ ...prev, instrument: false }));
  
//   setPathOptions([]);
//   setTags([]);
//   setTagErrors({});
  
//   if (value) {
//     try {
//       const isInterface = isInterfaceInstrument(value);
      
//       await loadProtocol(value);
      
//       if (isInterface) {
//         const interfaceInstId = value.includes(':') ? 
//           parseInt(value.split(':')[1].trim()) : 0;
        
//         if (interfaceInstId > 0) {
//           await loadLimsOrder(interfaceInstId);
//         }
//       } else {
//         setLimsOrderOptions([]);
//         setIsLimsOrderEnabled(false);
//         setFormData(prev => ({ 
//           ...prev, 
//           limsOrder: '',
//           limsOrderID: '',
//           limsSampleID: '',
//           limsTestCode: '',
//           limsReplicateID: ''
//         }));
//       }
      
//       const instrumentData = await onChangeInstrumentCombo(value);
      
//       if (instrumentData) {
//         const updates = {};
        
//         if (instrumentData.nCurMergeFileNo > 0) {
//           updates.currentFileCount = String(instrumentData.nCurMergeFileNo);
//         } else {
//           updates.currentFileCount = '0';
//         }
        
//         const lockedMergeCount = getSessionValue("LockedMergeCount");
//         if (isLocked && lockedMergeCount) {
//           updates.mergeFileCount = lockedMergeCount;
//         } else {
//           updates.mergeFileCount = getSessionValue("MergeCount") || '1';
//         }
        
//         // Template handling is now done in onChangeInstrumentCombo
//         // Don't override template here
        
//         setFormData(prev => ({ ...prev, ...updates }));
//       }
      
//       await loadPaths(value);
      
//     } finally {
//       setIsLoading(false);
//     }
//   } else {
//     setIsLoading(false);
//   }
// }, [loadPaths, loadProtocol, loadLimsOrder, onChangeInstrumentCombo, 
//     isInterfaceInstrument, isLocked, t]);

//     useEffect(() => {
//   return () => {
//     // Cleanup on component unmount
//     lastLoadRef.current = { template: '', instrument: '' };
//   };
// }, []);

//   const handlePathChange = useCallback((value) => {
//     setFormData(prev => ({ ...prev, path: value }));
//     setErrors(prev => ({ ...prev, path: false }));
//   }, []);

// const handleTemplateChange = useCallback((value) => {
//   console.log('📋 User manually changed template from:', formData.template, 'to:', value);
  
//   // Reset the last load reference when user manually changes template
//   lastLoadRef.current = { template: '', instrument: '' };
  
//   setFormData(prev => ({ ...prev, template: value }));
//   setErrors(prev => ({ ...prev, template: false }));
  
//   // Clear tags immediately
//   setTags([]);
//   setTagErrors({});
// }, [formData.template]);

//   const handleMergeCountChange = useCallback((value) => {
//     const numValue = parseInt(value) || 0;
    
//     if (numValue > 10000) {
//       setFormData(prev => ({ ...prev, mergeFileCount: '10000' }));
//       setErrors(prev => ({ ...prev, mergeFileCount: t('instrumentlocktag.mergecountexceed') }));
//       return;
//     }
    
//     if (numValue < 1 && value !== '') {
//       setFormData(prev => ({ ...prev, mergeFileCount: '1' }));
//     } else {
//       setFormData(prev => ({ ...prev, mergeFileCount: value }));
//       setErrors(prev => ({ ...prev, mergeFileCount: '' }));
//     }
//   }, [t]);

//   const validateFormForLock = useCallback(() => {
//     const newErrors = {};
//     const newTagErrors = {};
//     let isValid = true;
    
//     if (!formData.instrument) {
//       newErrors.instrument = true;
//       isValid = false;
//     }
    
//     if (!formData.path) {
//       newErrors.path = true;
//       isValid = false;
//     }
    
//     if (!formData.template || formData.template.trim() === '') {
//       newErrors.template = true;
//       isValid = false;
//     }
    
//     const isInterface = isInterfaceInstrument(formData.instrument);
    
//     if (isInterface) {
//       if (isFileNameEnabled && !formData.fileName) {
//         newErrors.fileName = true;
//         isValid = false;
//       }
      
//       const mergeNum = parseInt(formData.mergeFileCount) || 0;
//       const currentNum = parseInt(formData.currentFileCount) || 0;
      
//       if (mergeNum > 10000) {
//         newErrors.mergeFileCount = t('instrumentlocktag.mergecountexceed');
//         isValid = false;
//       }
      
//       if (mergeNum < currentNum) {
//         newErrors.mergeFileCount = t('instrumentlocktag.mergecountnotlessthancurrent', 
//           { count: formData.currentFileCount });
//         isValid = false;
//       }
      
//       if (isLimsOrderEnabled && !formData.limsOrder) {
//         newErrors.limsOrder = true;
//         isValid = false;
//       }
//     }
    
//     for (let i = 0; i < tags.length; i++) {
//       if (tags[i].required && !tags[i].value) {
//         newTagErrors[i] = true;
//         isValid = false;
//       }
//     }
    
//     setErrors(newErrors);
//     setTagErrors(newTagErrors);
    
//     return isValid;
//   }, [formData, tags, isFileNameEnabled, isLimsOrderEnabled, isInterfaceInstrument, t]);

//   const prepareLockData = useCallback((auditData = null, validationType = "CheckAndInsert") => {
//     const activeUserDetails = getActiveUserDetails();
//     const isInterface = isInterfaceInstrument(formData.instrument);
    
//     const instrumentId = (formData.instrument || "").padEnd(10, ' ');
//     const templateId = (formData.template || '').padEnd(10, ' ');
//     const userId = (formData.user || activeUserDetails.sUserID || '').padEnd(10, ' ');
    
//     const lockData = {
//       sInstrumentName: instrumentOptions.find(i => i.value === formData.instrument)?.label || '',
//       lockinstdetails: {
//         sInstrumentID: instrumentId,
//         sTaskID: formData.path,
//         sTaskSourcePath: pathOptions.find(p => p.value === formData.path)?.label || '',
//         sFileName: formData.fileName,
//         sTemplateID: templateId,
//         sUserID: userId,
//         nMergeFileCount: parseInt(formData.mergeFileCount) || 1,
//         nAutoUnlock: formData.unlockAfterCapture ? 1 : 0,
//         nInterFaceOrderID: parseInt(formData.interfaceOrderID) || 0,
//         nProtocolStatus: parseInt(formData.protocolID) || 0,
//         nLLProStatus: isFileNameEnabled ? 1 : 0,
//         sScheduleID: pathOptions.find(p => p.value === formData.path)?.originalItem?.L13ScheduleID || ''
//       },
//       sTemplateName: templateOptions.find(t => t.value === formData.template)?.label || '',
//       lInstTagValue: tags.map(tag => ({
//         L58TagID: tag.tagID,
//         Value: tag.value || '',
//         L58ValueStatus: tag.required || false,
//         L58TagName: tag.tagName,
//         ValueID: tag.valueID || '',
//         LoadMasterValue: " ",
//         L58Order: tag.order || 0
//       })),
//       sValidation: validationType,
//       sSendLabel: isLocked ? t('button.update') : t('button.lock'),
//       ManualOrder: false,
//       LIMSobj: null,
//       ActiveUserDetails: activeUserDetails,
//       ApplicationCode: "SDMS"
//     };
    
//     if (auditData) {
//       lockData.lockinstdetails.AuditTrailValues = auditData;
//     }
    
//     if (isInterface) {
//       lockData.lockinstdetails.audittrailforinterfaceinstrument = true;
//     }
    
//     if (isLimsOrderEnabled && formData.limsOrder) {
//       const limsOrderItem = limsOrderOptions.find(lo => lo.value === formData.limsOrder);
//       if (limsOrderItem) {
//         lockData.ManualOrder = false;
//         const returnObject = {};
//         Object.keys(limsOrderItem).forEach(key => {
//           if (!['uid', 'boundindex', 'uniqueid', 'visibleindex'].includes(key)) {
//             returnObject[key] = limsOrderItem[key];
//           }
//         });
//         lockData.LIMSobj = returnObject;
//       }
//     }
    
//     const encodeXmlText = (text) => {
//       if (!text) return '';
//       return String(text)
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&apos;');
//     };
    
//     const templateName = lockData.sTemplateName;
//     const encodedTemplateName = encodeXmlText(templateName);
    
//     let xMasterXml = "<Sheet1>";
//     let xDetailsXml = "<Sheet1>";
    
//     xMasterXml += "<Row>";
//     xMasterXml += `<Template>${encodedTemplateName}</Template>`;
    
//     xDetailsXml += `<Row><Category>Template</Category><Value>${encodedTemplateName}</Value></Row>`;
    
//     tags.forEach(tag => {
//       if (tag.value) {
//         const encodedTagName = encodeXmlText(tag.tagName);
//         const encodedTagValue = encodeXmlText(tag.value);
        
//         xMasterXml += `<${encodedTagName}>${encodedTagValue}</${encodedTagName}>`;
//         xDetailsXml += `<Row><Category>${encodedTagName}</Category><Value>${encodedTagValue}</Value></Row>`;
//       }
//     });
    
//     xMasterXml += "</Row></Sheet1>";
//     xDetailsXml += "</Sheet1>";
    
//     lockData.lockinstdetails.xMasterXml = xMasterXml;
//     lockData.lockinstdetails.xDetailsXml = xDetailsXml;
    
//     return lockData;
//   }, [formData, tags, instrumentOptions, pathOptions, templateOptions, 
//       isFileNameEnabled, isLimsOrderEnabled, isLocked, limsOrderOptions, isInterfaceInstrument, t]);

//   const performLockAction = useCallback(async (auditData = null, validationType = "CheckAndInsert") => {
//     try {
//       const lockData = prepareLockData(auditData, validationType);
      
//       const isInterface = isInterfaceInstrument(formData.instrument);
//       if (isInterface && auditData) {
//         lockData.lockinstdetails.audittrailforinterfaceinstrument = false;
//       }
      
//       await performLockActionWithData(lockData);
//     } catch (error) {
//       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [formData, tags, prepareLockData, t]);

//   const performLockActionWithData = async (lockData) => {
//   try {
//     setIsSubmitting(true);
//     const result = await makeAjaxCall(endpoints.lockInstrument, lockData, "LockInstrument");
    
//     if (result?.oResObj?.bStatus === true) {
//       const successMessage = result.oResObj.sInformation || t('instrumentlocktag.instrumentlockedsuccessfully');
      
//       setIsLocked(true);
//       setIsAutoLocked(false);
//       setLockedByOtherUser(false);
      
//       if (result.oResObj.nMergeFileCount) {
//         setFormData(prev => ({ 
//           ...prev, 
//           mergeFileCount: String(result.oResObj.nMergeFileCount) 
//         }));
//         setSessionValue("LockedMergeCount", String(result.oResObj.nMergeFileCount));
//       } else if (result.oResObj.mergeFileCount) {
//         setFormData(prev => ({ 
//           ...prev, 
//           mergeFileCount: String(result.oResObj.mergeFileCount) 
//         }));
//         setSessionValue("LockedMergeCount", String(result.oResObj.mergeFileCount));
//       }
      
//       const instrumentId = result.oResObj.sInstrumentID || formData.instrument;
      
//       // =========== NEW: Check if coming from scheduler and navigate to Activated Task ===========
//       const fromScheduler = sessionStorage.getItem('fromScheduler') === 'true';
//       const storedSchedulerData = sessionStorage.getItem('schedulerData');
      
//       if (fromScheduler && storedSchedulerData && instrumentId) {
//         try {
//           const schedulerData = JSON.parse(storedSchedulerData);
//           console.log('🎯 Lock completed for scheduler instrument, navigating to Activated Task');
          
//           // Dispatch event to navigate to Activated Task
//           window.dispatchEvent(new CustomEvent('schedulerInstrumentLocked', {
//             detail: {
//               scheduleId: schedulerData.scheduleId || schedulerData.L13ScheduleID,
//               instrumentId: instrumentId.toString().trim(),
//               clientId: schedulerData.clientId,
//               sourcePath: schedulerData.sourcePath,
//               templateId: schedulerData.templateId,
//               fromScheduler: true,
//               fromLock: true
//             }
//           }));
          
//           // Clear session storage
//           sessionStorage.removeItem('fromScheduler');
//           sessionStorage.removeItem('schedulerData');
          
//         } catch (error) {
//           console.error('Error processing scheduler data:', error);
//         }
//       } else {
//         // Original navigation logic for non-scheduler
//         if (instrumentId) {
//           const cleanInstrumentId = instrumentId.toString().trim();
//           navigateAfterLock(cleanInstrumentId);
//         }
//       }
//       // ========================================================================================
      
//       showErrorDialogMessage(
//         `${result.oResObj.sInstrument || t('label.instrument')} ${successMessage}`,
//         'success'
//       );
      
//     } else {
    
//         const errorInfo = result?.oResObj?.sInformation;
        
//         if (errorInfo === "Entering Duplicate Tag Values" || 
//             (errorInfo === "Tags has already been used. Do you want to re-use same tags for New Data Capture?" && 
//              result?.oResObj?.sValidation === "CheckAndInsert")) {
//           showErrorDialogMessage(
//             t('instrumentlocktag.confirmationtagsalreadyexist'),
//             'confirmation',
//             async () => {
//               lockData.sValidation = "Insert";
//               lockData.lockinstdetails.sValidation = "Insert";
//               await performLockActionWithData(lockData);
//             }
//           );
//           return;
//         }
        
//         if (errorInfo === "Merge Break") {
//           showErrorDialogMessage(t('instrumentlocktag.mergebreak'), 'error');
//         } else if (errorInfo === "This instrument is already locked by other user") {
//           showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadylockedbyotheruser'), 'error');
//           setIsLocked(true);
//           setLockedByOtherUser(true);
//         } else if (errorInfo === "Merge Count should not be Lesser than Current Parsing Count") {
//           showErrorDialogMessage(t('instrumentlocktag.mergecountshouldnotbelesserthancurrentparsingcount'), 'error');
//         } else if (errorInfo) {
//           showErrorDialogMessage(errorInfo, 'error');
//         } else {
//           showErrorDialogMessage(t('instrumentlocktag.failedtolockinstrument'), 'error');
//         }
//       }
//     } catch (error) {
//       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleUnlockSuccess = useCallback(async (result) => {
//     const successMessage = result?.oResObj?.sInformation || t('instrumentlocktag.instrumentunlockedsuccessfully');
//     const instrumentName = result?.oResObj?.sInstrument || t('label.instrument');
    
//     // Reset lock states
//     setIsLocked(false);
//     setIsAutoLocked(false);
//     setLockedByOtherUser(false);
    
//     const currentTemplate = formData.template;
    
//     setFormData(prev => ({
//       ...prev,
//       fileName: '',
//       mergeFileCount: getSessionValue("MergeCount") || '1',
//       currentFileCount: '0',
//       lockID: '',
//       interfaceOrderID: '',
//       unlockAfterCapture: false,
//       limsOrder: '',
//       limsOrderID: '',
//       limsSampleID: '',
//       limsTestCode: '',
//       limsReplicateID: '',
//       template: currentTemplate
//     }));
    
//     setErrors({});
//     setTagErrors({});
    
//     setTags(prev => prev.map(tag => ({
//       ...tag,
//       value: '',
//       valueID: '',
//       options: tag.tagID === 1 ? tag.options : []
//     })));
    
//     showErrorDialogMessage(
//       `${instrumentName} ${successMessage}`,
//       'success'
//     );
//   }, [t, formData.template]);

//   const prepareUnlockData = useCallback((auditData = null, mergebreak = "true") => {
//     const activeUserDetails = getActiveUserDetails();
//     const pathItem = pathOptions.find(p => p.value === formData.path);
//     const instrumentItem = instrumentOptions.find(i => i.value === formData.instrument);
//     const templateItem = templateOptions.find(t => t.value === formData.template);
    
//     const limsObj = {};
    
//     const limsOrderVal = formData.limsOrder;
//     const nOrderID = limsOrderVal === "" ? 0 : parseInt(limsOrderVal) || 0;
//     limsObj["nOrderID"] = nOrderID;
    
//     if (isInterfaceInstrument(formData.instrument)) {
//       if (formData.limsSampleID) limsObj["SampleID"] = formData.limsSampleID;
//       if (formData.limsTestCode) limsObj["TestCode"] = formData.limsTestCode;
//       if (formData.limsReplicateID) limsObj["ReplicateID"] = formData.limsReplicateID;
//     }
    
//     const unlockObjDet = {
//       nMergeFileCount: formData.mergeFileCount || "1",
//       sTaskID: formData.path || "",
//       nProtocolStatus: parseInt(formData.protocolID) || 0,
//       sFileName: formData.fileName || "",
//       sUserID: formData.user || activeUserDetails.sUserID,
//       nInterFaceOrderID: formData.interfaceOrderID || "",
//       sTaskSourcePath: pathItem?.label || "",
//       sInstrumentID: (formData.instrument || "").padEnd(10, ' '),
//       sScheduleID: pathItem?.originalItem?.L13ScheduleID || "",
//       sTemplateID: formData.template || ""
//     };
    
//     const unlockData = {
//       sTemplateName: templateItem?.label || "",
//       unlockObjDet: unlockObjDet,
//       sInstrumentName: instrumentItem?.label || "",
//       limsObj: limsObj,
//       mergebreak: mergebreak,
//       ActiveUserDetails: activeUserDetails,
//       ApplicationCode: "SDMS"
//     };
    
//     if (auditData) {
//       unlockData.AuditTrailValues = auditData;
//     }
    
//     return unlockData;
//   }, [formData, instrumentOptions, pathOptions, templateOptions, isInterfaceInstrument]);

//   const performUnlockAction = useCallback(async (auditData = null, mergebreak = "true") => {
//     try {
//       if (!formData.instrument || !formData.path) {
//         showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
//         return;
//       }
      
//       setIsSubmitting(true);
//       const unlockData = prepareUnlockData(auditData, mergebreak);
      
//       const result = await makeAjaxCall(endpoints.unLockInstrument, unlockData, "UnLockInstrument");
      
//       if (result?.AuditTrailLogin !== undefined && result.AuditTrailLogin === false) {
//         showErrorDialogMessage(result.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'), 'error');
//         return;
//       }
      
//       if (result?.oResObj?.bForceUnlock === true) {
//         if (mergebreak === "true") {
//           setAuditAction('unlock');
//           setAuditCallback(() => async (forceAuditData) => {
//             await performUnlockAction(forceAuditData, "false");
//           });
//           setShowAuditTrail(true);
//         } else {
//           await handleUnlockSuccess(result);
//         }
//       } 
//       else if (result?.oResObj?.bStatus === true) {
//         await handleUnlockSuccess(result);
//       } 
//       else {
//         const errorMessage = result?.oResObj?.sInformation || '';
//         if (errorMessage.toLowerCase().includes('already unlocked') || 
//             errorMessage.toLowerCase().includes('not locked')) {
          
//           // Force refresh lock status
//           setIsLocked(false);
//           setIsAutoLocked(false);
//           setLockedByOtherUser(false);
          
//           if (formData.instrument) {
//             await onChangeInstrumentCombo(formData.instrument);
//           }
//         }
        
//         showErrorDialogMessage(errorMessage || t('instrumentlocktag.failedtounlockinstrument'), 'error');
//       }
      
//     } catch (error) {
//       showErrorDialogMessage(`${t('Auditpopup.failed')}: ${error.message || t('instrumentlocktag.unknownerror')}`, 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [formData, prepareUnlockData, t, handleUnlockSuccess, onChangeInstrumentCombo]);

//   const handleUnlock = useCallback(async () => {
//     if (!isLocked) {
//       showErrorDialogMessage(t('instrumentlocktag.instrumentisnotlocked'), 'information');
//       return;
//     }

//     if (isAutoLocked) {
//       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
//       return;
//     }

//     const newErrors = {};
//     let isValid = true;
    
//     if (!formData.instrument) {
//       newErrors.instrument = true;
//       isValid = false;
//     }
    
//     if (!formData.path) {
//       newErrors.path = true;
//       isValid = false;
//     }
    
//     setErrors(newErrors);
    
//     if (!isValid) {
//       showErrorDialogMessage(t('instrumentlocktag.pleaseselectinstrumentandpathbeforeunlocking'), 'information');
//       return;
//     }

//     if (lockedByOtherUser) {
//       const activeUserDetails = getActiveUserDetails();
//       const isAdmin = activeUserDetails.sUsername === "Administrator" || 
//                      activeUserDetails.ActiveUserDetails?.sUsername === "Administrator";
      
//       if (!isAdmin) {
//         showErrorDialogMessage(t('instrumentlocktag.instrumentislockedbyanotheruser'), 'information');
//         return;
//       }
//     }

//     const scheduleData = getDeactiveScheduleDataRef.current;
//     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
//       const hasAuditTrailRights = true;
      
//       if (hasAuditTrailRights) {
//         setAuditAction('unlock');
//         setAuditCallback(() => async (auditData) => {
//           await performUnlockAction(auditData);
//         });
//         setShowAuditTrail(true);
//         return;
//       }
//     }
    
//     await performUnlockAction();
//   }, [isLocked, isAutoLocked, lockedByOtherUser, formData.instrument, formData.path, performUnlockAction, t]);

//   const handleLock = useCallback(async () => {
//     if (!validateFormForLock()) {
//       return;
//     }
    
//     if (isAutoLocked) {
//       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
//       return;
//     }
    
//     setIsSubmitting(true);
    
//     const isInterface = isInterfaceInstrument(formData.instrument);
    
//     if (isInterface) {
//       const interfaceInstId = formData.instrument.includes(':') ? 
//         parseInt(formData.instrument.split(':')[1].trim()) : 0;
      
//       if (interfaceInstId > 0) {
//         try {
//           setIsLoading(true);
//           const connectionResult = await makeAjaxCall(endpoints.interfaceConnectionChecking, {
//             InterfaceInstID: interfaceInstId
//           }, "InterfaceConnectionChecking");
          
//           if (connectionResult && Array.isArray(connectionResult) && connectionResult[0]) {
//             const connectionData = connectionResult[0];
            
//             if (connectionData.AuditTrailLogin === false) {
//               showErrorDialogMessage(
//                 connectionData.LoginFailedMsg || t('instrumentlocktag.audittrailloginfailed'),
//                 'error'
//               );
//               setIsSubmitting(false);
//               setIsLoading(false);
//               return;
//             }
            
//             const accessStatus = connectionData.AccessStatus;
            
//             if (accessStatus == 1 || accessStatus === "1") {
//               // Interface is connected - continue with normal flow
//             } else {
//               setIsSubmitting(false);
//               setIsLoading(false);
//               showErrorDialogMessage(
//                 t('instrumentlocktag.interfacerinstrumentisnotconnected'),
//                 'confirmation',
//                 async () => {
//                   setIsSubmitting(true);
//                   const scheduleData = getDeactiveScheduleDataRef.current;
//                   if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
//                     const hasAuditTrailRights = true;
                    
//                     if (hasAuditTrailRights) {
//                       setIsSubmitting(false);
//                       setAuditAction('lock');
//                       setAuditCallback(() => async (auditData) => {
//                         await performLockAction(auditData);
//                       });
//                       setShowAuditTrail(true);
//                       return;
//                     }
//                   }
                  
//                   await performLockAction();
//                 }
//               );
//               return;
//             }
//           }
//         } catch (error) {
//           // Continue with lock even if check fails
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     }
    
//     const scheduleData = getDeactiveScheduleDataRef.current;
//     if (scheduleData && scheduleData.TaskType !== "ScheduleCreation") {
//       const hasAuditTrailRights = true;
      
//       if (hasAuditTrailRights) {
//         setIsSubmitting(false);
//         setAuditAction('lock');
//         setAuditCallback(() => async (auditData) => {
//           await performLockAction(auditData);
//         });
//         setShowAuditTrail(true);
//         return;
//       }
//     }
    
//     await performLockAction();
//   }, [validateFormForLock, isAutoLocked, formData.instrument, performLockAction, isInterfaceInstrument, t]);

//   const handleUpdate = useCallback(async () => {
//     if (!validateFormForLock()) {
//       return;
//     }
    
//     if (isAutoLocked) {
//       showErrorDialogMessage(t('instrumentlocktag.thisinstrumentisalreadyautolocked'), 'information');
//       return;
//     }
    
//     setIsSubmitting(true);
//     await performLockAction();
//   }, [validateFormForLock, isAutoLocked, performLockAction]);

//   const handleFormChange = useCallback((field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     setErrors(prev => ({ ...prev, [field]: false }));
//   }, []);

//   // Field disabled state logic
//   const getFieldDisabledState = useMemo(() => {
//     const isFromScheduler = isLoadingFromScheduler || 
//                            sessionStorage.getItem('fromScheduler') === 'true';
    
//     // Handle scheduler case
//     if (isFromScheduler && hasLoadedFromNavigation) {
//       return {
//         client: true,
//         instrument: true,
//         path: true,
//         limsOrder: false,
//         fileName: false,
//         template: false,
//         mergeCount: false,
//         unlockCheckbox: false,
//         tags: false,
//         lockButton: !isLocked,  // Enable lock if not locked
//         unlockButton: isLocked   // Enable unlock if locked
//       };
//     }
    
//     if (isAutoLocked) {
//       return {
//         client: false,
//         instrument: false,
//         path: false,
//         limsOrder: true,
//         fileName: true,
//         template: false,
//         mergeCount: true,
//         unlockCheckbox: true,
//         tags: false,
//         lockButton: true,
//         unlockButton: true
//       };
//     }
    
//     if (isLocked && !lockedByOtherUser) {
//       return {
//         client: false,
//         instrument: false,
//         path: true,
//         limsOrder: false,
//         fileName: false,
//         template: true,
//         mergeCount: false,
//         unlockCheckbox: false,
//         tags: false,
//         lockButton: false,
//         unlockButton: false
//       };
//     }
    
//     if (isLocked && lockedByOtherUser) {
//       return {
//         client: false,
//         instrument: false,
//         path: true,
//         limsOrder: false,
//         fileName: true,
//         template: true,
//         mergeCount: true,
//         unlockCheckbox: true,
//         tags: true,
//         lockButton: true,
//         unlockButton: false
//       };
//     }
    
//     // Default: Not locked
//     return {
//       client: false,
//       instrument: false,
//       path: false,
//       limsOrder: false,
//       fileName: false,
//       template: false,
//       mergeCount: false,
//       unlockCheckbox: false,
//       tags: false,
//       lockButton: false,
//       unlockButton: true
//     };
//   }, [isLocked, lockedByOtherUser, isAutoLocked, isLoadingFromScheduler, hasLoadedFromNavigation]);

//   return (
//     <div >
//       <FullPageLoader loading={showFullPageLoader} text={
//         isSubmitting ? t('common.loading') :
//         t('common.loading')
//       } />
      
//       <div className="bg-white px-4 py-4">
//         <div className="max-w-[1100px]">
//           <div className="grid grid-cols-2">
//             <div className="max-w-[400px]">
//               <div className="mb-7">
//                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
//                   {t('label.client')}
//                 </label>
//                 <div className="relative">
//                   <AnimatedDropdown
//                     value={formData.client}
//                     onChange={(e) => handleClientChange(e.target.value)}
//                     disabled={getFieldDisabledState.client || isLoading}
//                     options={clientOptions}
//                     displayKey="label"
//                     valueKey="value"
//                     allowFreeInput
//                     showError={errors.client}
//                     className="text-xs"
//                   />
//                 </div>
//               </div>

//               <div className="mb-5">
//                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
//                   {t('label.instrument')} <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <AnimatedDropdown
//                     value={formData.instrument}
//                     onChange={(e) => handleInstrumentChange(e.target.value)}
//                     disabled={getFieldDisabledState.instrument || isLoading}
//                     options={instrumentOptions}
//                     displayKey="label"
//                     valueKey="value"
//                     allowFreeInput
//                     showError={errors.instrument}
//                     className="text-xs"
//                   />
//                 </div>
//                 {isAutoLocked && (
//                   <div className="mt-0 text-sm bg-[#d9534f] font-roboto text-white">
//                     {t('instrumentlocktag.thisinstrumentisalreadyautolocked')}
//                   </div>
//                 )}
//               </div>

//               <div className="mb-7">
//                 <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
//                   {t('instrumentlocktag.path')} <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <AnimatedDropdown
//                     value={formData.path}
//                     onChange={(e) => handlePathChange(e.target.value)}
//                     disabled={getFieldDisabledState.path || isLoading}
//                     options={pathOptions}
//                     displayKey="label"
//                     valueKey="value"
//                     allowFreeInput
//                     showError={errors.path}
//                     className="text-xs"
//                   />
//                 </div>
//               </div>

//               <div className="mb-7">
//                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
//                   {t('instrumentlocktag.limsorder')}
//                 </label>
//                 <div className="relative">
//                   <AnimatedDropdown
//                     value={formData.limsOrder}
//                     onChange={(e) => {
//                       const selectedValue = e.target.value;
//                       const selectedOrder = limsOrderOptions.find(order => order.value === selectedValue);
                      
//                       setFormData(prev => ({
//                         ...prev,
//                         limsOrder: selectedValue,
//                         limsOrderID: selectedValue,
//                         limsSampleID: selectedOrder?.sampleID || '',
//                         limsTestCode: selectedOrder?.testCode || '',
//                         limsReplicateID: selectedOrder?.replicateID || ''
//                       }));
//                     }}
//                     disabled={!isLimsOrderEnabled || getFieldDisabledState.limsOrder || isLoading}
//                     options={limsOrderOptions}
//                     displayKey="label"
//                     valueKey="value"
//                     allowFreeInput
//                     className="text-xs flex-1"
//                   />
//                 </div>
//               </div>

//               <div className="mb-7">
//                 <label className="block text-[#405F7D] mb-3.5 font-semibold text-xs font-roboto">
//                   {t('instrumentlocktag.filename')} {isFileNameEnabled && <span className="text-red-500">*</span>}
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.fileName}
//                   onChange={(e) => handleFormChange('fileName', e.target.value)}
//                   disabled={!isFileNameEnabled || getFieldDisabledState.fileName || isLoading}
//                   className={`w-full h-7 px-0 text-xs bg-[#f3f3f3] border-0 border-b-2 outline-none font-semibold font-['verdana']
//                     ${errors.fileName ? 'border-red-400 text-[#A94442]' : 'border-gray-300 text-[#373737]'}`}
//                 />
//               </div>

//               {showMergeFields && (
//                 <MergeFileCountRow
//                   mergeCount={formData.mergeFileCount}
//                   currentCount={formData.currentFileCount}
//                   onMergeChange={handleMergeCountChange}
//                   disabled={!isInstrumentInterface || getFieldDisabledState.mergeCount || isLoading}
//                   showMergeFields={showMergeFields}
//                   t={t}
//                 />
//               )}

//               {showUnlockOption && (
//                 <div className="flex items-center mb-3 gap-4">
//                   <label className="text-xs text-[#405F7D] min-w-[120px] font-semibold font-roboto">
//                     {t('instrumentlocktag.unlockaftercapture')}
//                   </label>
//                   <input
//                     type="checkbox"
//                     checked={formData.unlockAfterCapture}
//                     onChange={(e) => handleFormChange('unlockAfterCapture', e.target.checked)}
//                     disabled={getFieldDisabledState.unlockCheckbox || isLoading}
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
//                   />
//                 </div>
//               )}
//             </div>

//             <div className='max-w-[1300px]'>
//               <div className="max-w-[350px]">
//                 <div className="mb-7">
//                   <label className="block text-xs text-[#405F7D] mb-3.5 font-semibold font-roboto">
//                     {t('instrumentlocktag.template')} <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <AnimatedDropdown
//                       value={formData.template}
//                       onChange={(e) => handleTemplateChange(e.target.value)}
//                       disabled={getFieldDisabledState.template || isLoading}
//                       options={templateOptions}
//                       displayKey="label"
//                       valueKey="value"
//                       allowFreeInput
//                       showError={errors.template}
//                       className="text-xs"
//                     />
//                   </div>
//                 </div>
//               </div>
              
//               <div className="mt-7 max-w-[1300px]">
//                 <div className="max-w-[550px]">
//                   <TagGrid
//                     tags={tags}
//                     onTagValueClick={handleTagValueClick}
//                     onTagEditRequest={handleTagEditRequest}
//                     onInlineEditSubmit={handleInlineEditSubmit}
//                     isLoadingTags={isLoadingTags}
//                     isLocked={isLocked}
//                     lockedByOtherUser={lockedByOtherUser}
//                     isAutoLocked={isAutoLocked}
//                     t={t}
//                     tagErrors={tagErrors}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <div className="flex justify-end gap-2 ml-4 mr-4 mt-3 pt-5 border-t border-gray-200">
//         <button
//           onClick={isLocked && !lockedByOtherUser && !isAutoLocked ? handleUpdate : handleLock}
//           disabled={getFieldDisabledState.lockButton || showFullPageLoader}
//           className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
//             ${getFieldDisabledState.lockButton || showFullPageLoader
//               ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
//               : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
//           `}
//         >
//           {isLocked && !lockedByOtherUser && !isAutoLocked ? <UpdateIcon /> : <LockIcon />}
//           <span>
//             {isLocked && !lockedByOtherUser && !isAutoLocked ? t('button.update') : t('button.lock')}
//           </span>
//         </button>

//         <button
//           onClick={handleUnlock}
//           disabled={getFieldDisabledState.unlockButton || showFullPageLoader}
//           className={`flex items-center gap-1 px-2.5 py-2 transition-all text-xs font-bold rounded shadow-xs whitespace-nowrap font-roboto
//             ${getFieldDisabledState.unlockButton || showFullPageLoader
//               ? 'bg-[#2885fe7e] text-white cursor-not-allowed'
//               : 'bg-[#2883FE] text-white hover:bg-[#2883FE] hover:scale-90'}
//           `}
//         >
//           <UnlockIcon />
//           <span>{t('button.unlock')}</span>
//         </button>
//       </div>

//       <AuditTrail
//         isOpen={showAuditTrail}
//         onClose={() => setShowAuditTrail(false)}
//         onAuthorized={(auditData) => {
//           setShowAuditTrail(false);
//           if (auditCallback) {
//             auditCallback(auditData);
//           }
//           setAuditAction(null);
//           setAuditCallback(null);
//         }}
//         actionLabel={auditAction === 'lock' ? t('button.lock') : 
//                     auditAction === 'unlock' ? t('button.unlock') : 
//                     t('button.update')}
//         defaultReason={auditAction === 'lock' ? t('instrumentlocktag.instrumentlocked') : 
//                       auditAction === 'unlock' ? t('instrumentlocktag.instrumentunlocked') : 
//                       t('instrumentlocktag.instrumentupdated')}
//         disableReason={false}
//       />

//       {showErrorDialog && (
//         <Errordialog
//           message={errorDialogMessage}
//           type={errorDialogType}
//           onClose={handleErrorDialogClose}
//           showCancel={errorDialogType === 'confirmation'}
//           onCancel={handleErrorDialogClose}
//           onConfirm={errorDialogType === 'confirmation' ? handleErrorDialogConfirm : undefined}
//           cancelText={t('button.cancel')}
//           okText={t('button.ok')}
//         />
//       )}
//     </div>
//   );
// };

// export default InstrumentLockTag;