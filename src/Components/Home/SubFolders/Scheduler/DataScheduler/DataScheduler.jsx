import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Check, ChevronDown, RefreshCw, Calendar, Clock, Pencil, Search
} from 'lucide-react';
import useAxios from '../../../../../Services/servicecall';
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
import Popup from '../../../../Layout/Common/Popup';
import Errordialog from '../../../../Layout/Common/Errordialog';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedMultiSelect';
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import FullPageLoader from "../../../../Layout/Common/FullPageLoader";
import { useSchedulerNavigation } from '../../../../../Context/SchedulerNavigationContext';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';

const isPastDate = (dateStr) => {
    if (!dateStr) return false;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;

    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return false;

    const selected = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selected < today;
};

const CF_pathValidation = (path) => {
    const regex = /^[A-Za-z]:\\(?:[a-zA-Z0-9 _\-\.#&()@,=+`~!$^;{}[\]-]+\\)*[a-zA-Z0-9 _\-\.#&()@,=+%`~!$^;{}[\]-]*$/;
    return regex.test(path);
};

const CF_UNCPathValidation = (UNCPath) => {
    const regex = /^\\\\(?:[a-zA-Z0-9 _\-\.#&()@,=+`~!$^;{}[\]-]+\\)+[a-zA-Z0-9 _\-\.#&()@,=+%`~!$^;{}[\]-]+$/;
    return regex.test(UNCPath);
};

const CF_textFieldValidation = (text) => {
    const regex = /[<>()/"']/;
    return !regex.test(text);
};

const CF_sourcePathValidation = (path) => {
    const regex = /[*?"<>|]/g;
    return !regex.test(path);
};

const CF_maxLengthValidation = (text, maxLength = 50) => {
    return text.length <= maxLength;
};

const CF_numberValidation = (value, maxDigits = 5) => {
    const regex = new RegExp(`^\\d{0,${maxDigits}}$`);
    return regex.test(value);
};

const SelectorDropdown = ({
    options,
    selectedValues,
    onSelect,
    searchTerm,
    onSearchChange,
    isOpen,
    onClose,
    disabledOptions = []
}) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredOptions = options.filter(opt =>
        opt.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            ref={dropdownRef}
            className="absolute left-full top-0 ml-2 w-64 bg-white border border-gray-300 rounded-md overflow-hidden shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-300 bg-white">
                <div className="flex items-center gap-2">
                    <Search size={14} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder={t("common.lookingfor")}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full text-sm text-gray-700 placeholder-gray-400 border-none focus:outline-none bg-white"
                        autoFocus
                    />
                </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto bg-white custom-scrollbar">
                {filteredOptions.map((option) => {
                    // const isSelected = selectedValues.includes(option);
                    const isSelected = selectedValues.some(val =>
                        val.toString().toUpperCase() === option.toString().toUpperCase()
                    );
                    const isDisabled = disabledOptions.includes(option);
                    // const isNone = option.toUpperCase() === 'NONE';
                    const isNone = option.toString().toUpperCase() === 'NONE';


                    return (
                        <div
                            key={option}
                            onClick={() => !isDisabled && onSelect(option)}
                            className={`flex items-center gap-3 px-3 py-2 border-l-4 font-['Verdana'] 
            ${isDisabled && !isNone // NONE shouldn't be disabled visually even if in disabledOptions
                                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50 blur-[0.3px]'
                                    : isSelected
                                        ? 'bg-blue-50 border-blue-500 text-black cursor-pointer'
                                        : 'bg-white border-transparent text-gray-900 hover:bg-gray-50 cursor-pointer'
                                }`}
                        >

                            <div
                                className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 
                ${isSelected
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                                    }`}
                            >
                                {/* Show check for all selected items */}
                                {isSelected && (
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                )}
                            </div>
                            <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : ''}`}>
                                {option}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const EditPencilIcon = () => (
    <i className="fa fa-pencil text-lg"></i>
);

const InlineEditIcon = () => (
    <i className="fa fa-edit text-lg"></i>
);

const TagMasterRow = ({
    tag,
    index,
    parsedMetadata,
    showMetadataTooltip,
    setShowMetadataTooltip,
    setParsedMetadata,
    sampleFilename,
    selectedDelimiters,
    sampleFilenameError,
    setSampleFilenameError,
    delimiterError,
    setDelimiterError,
    delimiterOptions,
    tagRowErrors = [],
    isSelected,
    onSelect,
    onRowDataChange,
    isViewMode,
    isReadOnly,
    isFieldDisabled
}) => {
    const [rowError, setRowError] = useState(false);
    const [selectedParsedItem, setSelectedParsedItem] = useState(null);

    useEffect(() => {
        console.log(`Tag ${index} initialized:`, {
            tagName: tag.sTagName,
            sourceFlag: tag.sSourceFlag || 'NONE',
            metadata: tag.sTextData || '',
            original: {
                sSourceFlag: tag.sSourceFlag,
                sValue: tag.sValue,
                sDataIndex: tag.sDataIndex
            }
        });
    }, []);

    useEffect(() => {
        if (!sampleFilename.trim() && (tag.sSourceFlag || '') === 'File') {
            if (onRowDataChange) {
                onRowDataChange(index, tag.sSourceFlag || '', '');
            }
            setShowMetadataTooltip(null);
            setSelectedParsedItem(null);
        }
    }, [sampleFilename, tag.sSourceFlag]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            const tooltip = document.querySelector('.metadata-tooltip');
            const pencilButton = document.querySelector(`[data-pencil-id="${index}"]`);

            if (tooltip && !tooltip.contains(e.target) &&
                pencilButton && !pencilButton.contains(e.target)) {
                setShowMetadataTooltip(null);
                setSelectedParsedItem(null);
            }
        };

        if (showMetadataTooltip === index) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMetadataTooltip, index]);

    const handleRadioChange = (newValue) => {
        console.log(`Tag ${index} radio changed to:`, newValue);

        // Clear filename and delimiter errors when switching away from File
        if (tag.sSourceFlag === 'File' && newValue !== 'File') {
            setSampleFilenameError(false);
            setDelimiterError(false);
        }

        // Set delimiter error if File is selected but no delimiters
        if (newValue === 'File' && !selectedDelimiters.length) {
            setDelimiterError(true);
        } else if (newValue !== 'File') {
            setDelimiterError(false);
        }

        if (onRowDataChange) {
            let newMetadata = tag.sTextData || '';
            if (newValue === 'NONE' || newValue === '') {
                newMetadata = '';
            } else if (newValue === 'Folder') {
                newMetadata = '0';
            } else if (newValue === 'File') {
                newMetadata = '';
            }

            onRowDataChange(index, newValue, newMetadata);
        }
    };

    const handleInputFocus = () => {
        if (tagRowErrors.includes(index)) {
            const updatedErrors = tagRowErrors.filter(i => i !== index);
        }
    };

    const handlePencilClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (isViewMode || isReadOnly) return;

        if (showMetadataTooltip === index) {
            setShowMetadataTooltip(null);
            return;
        }

        document.body.classList.add('tooltip-open');

        // let hasError = false;

        const currentSourceFlag = tag.sSourceFlag || '';
        if (currentSourceFlag === 'File') {
            let hasError = false;

            if (!sampleFilename.trim()) {
                setSampleFilenameError(true);
                hasError = true;
            } else {
                const hasExtension = sampleFilename.includes('.') &&
                    sampleFilename.lastIndexOf('.') < sampleFilename.length - 1;
                if (!hasExtension) {
                    setSampleFilenameError(true);
                    hasError = true;
                } else {
                    setSampleFilenameError(false);
                }
            }

            if (!selectedDelimiters.length) {
                setDelimiterError(true);
                hasError = true;
            } else {
                setDelimiterError(false);
            }

            if (hasError) {
                setRowError(true);
                return;
            }
        }

        const concatenatedDelimiter = ConcatenateDelimeterfromlist(selectedDelimiters, delimiterOptions);

        if (concatenatedDelimiter !== "None") {
            const delimiterChars = concatenatedDelimiter.split('');
            const hasDelimiterInFilename = delimiterChars.some(char => sampleFilename.includes(char));

            if (!hasDelimiterInFilename) {
                setParsedMetadata([]);
                setShowMetadataTooltip(index);
                setRowError(false);
                return;
            }
        }

        const result = SplitFilenamewithExt(sampleFilename, concatenatedDelimiter);

        let parsedData = [...result.splitpath];
        if (result.lastDot > -1 && result.extension) {
            parsedData.push(result.extension);
        }

        setParsedMetadata(parsedData);
        setShowMetadataTooltip(index);
        setRowError(false);
    };

    const handleParsedItemClick = (item) => {
        setSelectedParsedItem(item);
    };

    const handleSubmitParsedData = () => {
        if (selectedParsedItem) {
            if (onRowDataChange) {
                onRowDataChange(index, tag.sSourceFlag || '', selectedParsedItem);
            }
        }
        setShowMetadataTooltip(null);
        setSelectedParsedItem(null);
    };

    const handleDoubleClick = (item) => {
        if (onRowDataChange) {
            onRowDataChange(index, tag.sSourceFlag || '', item);
        }
        setShowMetadataTooltip(null);
        setSelectedParsedItem(null);
    };

    const hasError = tagRowErrors.includes(index);

    const isMetadataEmpty = !(tag.sTextData || '').trim();

    const showMetadataError =
        tagRowErrors.length > 0 &&
        !isSelected &&
        isMetadataEmpty;


    return (
        <div
            className={`grid grid-cols-3 border-b border-[#e7e6e6] last:border-b-1 min-h-[40px]
                ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#378cfc]' : 'bg-white border-l-4 border-l-transparent'}                
                ${isViewMode || isReadOnly ? 'cursor-default' : 'cursor-pointer hover:bg-[#eef2f9]'}
            `}
            onClick={() => onSelect && onSelect()}
        >
            {/* Tag Name */}
            <div className={`px-4 text-xs flex items-center font-['verdana']
                ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
            `}>
                {tag.sTagName}
            </div>

            {/* Extract From */}
            <div className="px-4 text-xs flex items-center">
                <div className="flex items-center gap-4">
                    {/* NONE Radio */}
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="radio"
                            name={`extract_${tag.sTagID}_${index}`}
                            className="hidden peer"
                            checked={tag.sSourceFlag === 'NONE'}
                            onChange={() => handleRadioChange('NONE')}
                            // disabled={isViewMode || isReadOnly}
                            disabled={isFieldDisabled}
                        />
                        <div className={`w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center 
                            ${isViewMode || isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'} 
                            peer-checked:border-blue-500 peer-checked:bg-white transition-colors`}>
                            <div className={`w-2 h-2 bg-blue-500 rounded-full transition-transform 
                                ${tag.sSourceFlag === 'NONE' ? 'scale-100' : 'scale-0'}`}></div>
                        </div>
                        <span className={`ml-2 text-xs font-['verdana'] select-none
                            ${isViewMode || isReadOnly ? 'text-gray-500' : 'text-[#373737] group-hover:text-blue-600'}`}>
                            {t("common.none")}
                        </span>
                    </label>

                    {/* Folder Radio */}
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="radio"
                            name={`extract_${tag.sTagID}_${index}`}
                            className="hidden peer"
                            checked={tag.sSourceFlag === 'Folder'}
                            onChange={() => handleRadioChange('Folder')}
                            // disabled={isViewMode || isReadOnly}
                            disabled={isFieldDisabled()}
                        />
                        <div className={`w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center 
                            ${isViewMode || isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'} 
                            peer-checked:border-blue-500 peer-checked:bg-white transition-colors`}>
                            <div className={`w-2 h-2 bg-blue-500 rounded-full transition-transform 
                                ${tag.sSourceFlag === 'Folder' ? 'scale-100' : 'scale-0'}`}></div>
                        </div>
                        <span className={`ml-2 text-xs font-['verdana'] select-none
                            ${isViewMode || isReadOnly ? 'text-gray-500' : 'text-[#373737] group-hover:text-blue-600'}`}>
                            {t("scheduler.folder")}
                        </span>
                    </label>

                    {/* File Radio */}
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="radio"
                            name={`extract_${tag.sTagID}_${index}`}
                            className="hidden peer"
                            checked={tag.sSourceFlag === 'File'}
                            onChange={() => handleRadioChange('File')}
                            // disabled={isViewMode || isReadOnly}
                            disabled={isFieldDisabled()}
                        />
                        <div className={`w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center 
                            ${isViewMode || isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'} 
                            peer-checked:border-blue-500 peer-checked:bg-white transition-colors`}>
                            <div className={`w-2 h-2 bg-blue-500 rounded-full transition-transform 
                                ${tag.sSourceFlag === 'File' ? 'scale-100' : 'scale-0'}`}></div>
                        </div>
                        <span className={`ml-2 text-xs font-['verdana'] select-none
                            ${isViewMode || isReadOnly ? 'text-gray-500' : 'text-[#373737] group-hover:text-blue-600'}`}>
                            {t("scheduler.filename")}
                        </span>
                    </label>
                </div>
            </div>

            {/* Metadata column */}
            <div className="px-1 text-xs relative">
                <div
                    className={`
                    flex items-center justify-between gap-0 min-h-[36px]
                    ${showMetadataError ? 'border-2 border-red-500 rounded bg-white' : ''}
                `}
                >
                    {tag.sSourceFlag && tag.sSourceFlag !== '' ? (
                        <>
                            {tag.sSourceFlag === 'File' ? (
                                <div className="flex-1 flex items-center justify-between gap-2 px-2 py-1">
                                    <span className={`flex-1 font-['verdana'] ${(tag.sTextData || '') ? 'text-[#373737]' : 'text-gray-400 italic'}
                        ${isSelected ? 'font-bold' : ''}
                    `}>
                                        {(tag.sTextData || '') || "Click to select"}
                                    </span>
                                    <button
                                        data-pencil-id={index}
                                        onClick={handlePencilClick}
                                        className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool"
                                        title="Select from parsed data"
                                        // disabled={isViewMode || isReadOnly}
                                        disabled={isFieldDisabled()}
                                    >
                                        <EditPencilIcon />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tag.sTextData || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const currentSourceFlag = tag.sSourceFlag || '';

                                            if (currentSourceFlag === 'NONE' || currentSourceFlag === '') {
                                                if (value.length > 50) return;
                                                if (!CF_textFieldValidation(value)) return;
                                                if (onRowDataChange) {
                                                    onRowDataChange(index, currentSourceFlag, value);
                                                }
                                                return;
                                            }

                                            if (currentSourceFlag === 'Folder') {
                                                if (value === '' || value === '-') {
                                                    if (onRowDataChange) {
                                                        onRowDataChange(index, currentSourceFlag, value);
                                                    }
                                                    return;
                                                }

                                                if (value === '0') {
                                                    if (onRowDataChange) {
                                                        onRowDataChange(index, currentSourceFlag, value);
                                                    }
                                                    return;
                                                }

                                                if (/^-\d{1,2}$/.test(value)) {
                                                    const num = Number(value);
                                                    if (num >= -99 && num <= -1) {
                                                        if (onRowDataChange) {
                                                            onRowDataChange(index, currentSourceFlag, value);
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        onFocus={handleInputFocus}
                                        // disabled={isViewMode || isReadOnly}
                                        disabled={isFieldDisabled()}
                                        className={`flex-1 h-9 px-2 text-xs font-['verdana'] focus:outline-none bg-white transition-colors                             
                            ${isViewMode || isReadOnly ? 'cursor-not-allowed opacity-50' : ''}
                            ${isSelected ? 'font-bold' : ''}
                        `}
                                    />

                                    {tag.sSourceFlag === 'Folder' && (
                                        <div className="relative group z-[99999]">
                                            <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <div className="absolute right-full mr-2 hidden group-hover:block z-[99999]">
                                                <div className="bg-white border border-gray-300 text-black text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
                                                    {t("scheduler.foldertooltipmsg")}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}


                            {/* Tooltip */}
                            {showMetadataTooltip === index && tag.sSourceFlag === 'File' && (
                                <div
                                    className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col metadata-tooltip"
                                    style={{
                                        position: 'fixed',
                                        // position: 'absolute',  // Changed from 'fixed' to 'absolute'
                                        // left: 'calc(100% + 8px)',
                                        zIndex: 99999,
                                        borderTopLeftRadius: '4px',
                                        borderTopRightRadius: '4px',
                                    }}
                                    ref={(el) => {
                                        if (el) {
                                            const pencilButton = document.querySelector(`[data-pencil-id="${index}"]`);
                                            if (pencilButton) {
                                                const rect = pencilButton.getBoundingClientRect();
                                                el.style.left = `${rect.left - 264}px`;
                                                el.style.top = `${rect.top}px`;
                                            }
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Search Input */}
                                    <div className="p-0.5 border-gray-200">
                                        <div className="mb-0">
                                            <input
                                                type="text"
                                                placeholder={t("common.lookingfor")}
                                                className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* List of parsed data */}
                                    <div className="flex-1 overflow-y-auto min-h-0">
                                        {parsedMetadata.length === 0 ? (
                                            <div className="text-center py-6 text-xs text-gray-500 font-roboto">
                                                {t("scheduler.delimitererrormsg")}
                                            </div>
                                        ) : (
                                            parsedMetadata.map((item, i) => {
                                                const isSelected = selectedParsedItem === item;
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleParsedItemClick(item)}
                                                        onDoubleClick={() => handleDoubleClick(item)}
                                                        className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
                                                        ${isSelected ? 'bg-[#f2f2f2]' : ''}
                                                        ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
                                                    `}
                                                    >
                                                        <div className="flex items-center ml-1">
                                                            <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
                                                                {item}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Footer with buttons */}
                                    <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
                                        <button
                                            onClick={handleSubmitParsedData}
                                            className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
                                            disabled={!selectedParsedItem}
                                        >
                                            <i className="fa fa-check-square-o mr-1"></i>
                                            {t("button.submit")}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMetadataTooltip(null);
                                                setSelectedParsedItem(null);
                                            }}
                                            className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
                                        >
                                            <i className="fa fa-times mr-1"></i>
                                            {t("button.cancel")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-xs text-gray-400 italic font-['verdana']">
                            {t("scheduler.metadatatooltipmsg")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CF_HOURTOMINCONVERTION = (hour, min) => {
    return hour * 60 + min;
};

const GetActiveMonths = (selectedMonths, monthOptions) => {
    console.log("GetActiveMonths called with:", selectedMonths);
    let result = "";
    monthOptions.forEach(month => {
        result += selectedMonths.includes(month.Month) ? "1" : "0";
    });
    console.log("GetActiveMonths result:", result);
    return result;
};

const GetActiveMonthlyDays = (selectedDays) => {
    console.log("GetActiveMonthlyDays called with:", selectedDays);
    let result = "";
    for (let i = 1; i <= 31; i++) {
        result += selectedDays.includes(i) ? "1" : "0";
    }
    // Ensure it's exactly 31 characters
    if (result.length !== 31) {
        result = result.padEnd(31, '0');
    }
    console.log("GetActiveMonthlyDays result:", result);
    return result;
};

// const GetActiveMonthlyDays = (selectedDays) => {
//     console.log("GetActiveMonthlyDays called with:", selectedDays);
//     let result = "";
//     for (let i = 1; i <= 31; i++) {
//         result += selectedDays.includes(i) ? "1" : "0";
//     }

//     // Already ensures 31 characters, but double-check
//     return result.length === 31 ? result : result.padEnd(31, '0').substring(0, 31);
// };

const GetActiveWeekNO = (selectedWeeks, weekOptions) => {
    console.log("GetActiveWeekNO called with:", selectedWeeks);
    let result = "";
    weekOptions.forEach(week => {
        result += selectedWeeks.includes(week.weeks) ? "1" : "0";
    });
    // Ensure it's exactly 5 characters
    if (result.length !== 5) {
        result = result.padEnd(5, '0');
    }
    console.log("GetActiveWeekNO result:", result);
    return result;
};

const GetActiveWeekDays = (selectedWeekdays, weekdayOptions) => {
    console.log("GetActiveWeekDays called with:", selectedWeekdays);
    let result = "";
    weekdayOptions.forEach(day => {
        result += selectedWeekdays.includes(day.days) ? "1" : "0";
    });

    // Ensure it's exactly 7 characters
    if (result.length !== 7) {
        result = result.padEnd(7, '0');
    }

    console.log("GetActiveWeekDays result:", result);
    return result;
};

const ConcatenateDelimeterfromlist = (Delimeterlst, delimiterOptions) => {
    let concatdelimeter = "";
    for (let i = 0; i < Delimeterlst.length; i++) {
        // For "NONE", just return "None"
        if (Delimeterlst[i].toUpperCase() === 'NONE') {
            return "None";
        }

        const delimiterObj = delimiterOptions.find(opt => opt.sDelimiter === Delimeterlst[i]);
        if (delimiterObj) {
            concatdelimeter += delimiterObj.sDelimiter;
        }
    }
    return concatdelimeter || "None";
};

const SplitFilenamewithExt = (samplefilename, Delimeter) => {
    console.log("Splitting filename:", samplefilename, "with delimiter:", Delimeter);

    let lastDot = samplefilename.lastIndexOf('.');
    let filename = "", extension = "";

    if (lastDot > -1) {
        filename = samplefilename.slice(0, lastDot);
        extension = samplefilename.slice(lastDot + 1);
    } else {
        filename = samplefilename;
    }

    // Split the filename part
    var splitpath = splitfilenamewithdelimeter(filename, Delimeter);

    // If delimiter is "None" or no delimiter found, splitpath will be [filename]
    // Only add extension if we have a valid split
    if (splitpath.length === 0) {
        splitpath = [filename];
    }

    return { "lastDot": lastDot, "splitpath": splitpath, "extension": extension };
};

const splitfilenamewithdelimeter = (filename, Delimeter) => {
    if (Delimeter === "None" || !Delimeter || Delimeter === "") {
        return [filename];
    }

    // Escape special regex characters
    const escapedDelimiter = Delimeter.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    let regex = new RegExp('[' + escapedDelimiter + ']');
    let splitfilename = filename.split(regex).filter(Boolean);

    return splitfilename;
};


const DataScheduler = () => {
    const { navigateToActivatedTask, navigateToDataScheduler, navigateToDeactivatedTask, navigateToRetiredTask, navigateToEditTask, navigateToInstrumentLockTag, navigateToTab, navigationState, clearNavigation, getSubmissionData } = useSchedulerNavigation();
    const { t } = useTranslation();
    // const navigate = useNavigate();
    const { setNavigationData, navigateFromDataSchedulerToEditTask } = useSchedulerNavigation();

    const getUTCDateString = () => {
        const now = new Date();
        const day = String(now.getUTCDate()).padStart(2, '0');
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const year = now.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    const getUTCTimeString = () => {
        const now = new Date();
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const parseUTCDate = (dateString) => {
        if (!dateString) return null;
        const parts = dateString.split('/');
        if (parts.length !== 3) return null;
        return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0], 12, 0, 0));
    };

    const daysCombo = [
        { Date: t("label.days"), Number: "Days" },
        { Date: t("label.weeks"), Number: "Weeks" },
        { Date: t("label.months"), Number: "Months" },
        { Date: t("label.year"), Number: "Years" }
    ];

    const monthOptions = [
        { Month: t("label.january"), Number: 1 },
        { Month: t("label.february"), Number: 2 },
        { Month: t("label.march"), Number: 3 },
        { Month: t("label.april"), Number: 4 },
        { Month: t("label.may"), Number: 5 },
        { Month: t("label.june"), Number: 6 },
        { Month: t("label.july"), Number: 7 },
        { Month: t("label.august"), Number: 8 },
        { Month: t("label.september"), Number: 9 },
        { Month: t("label.october"), Number: 10 },
        { Month: t("label.november"), Number: 11 },
        { Month: t("label.december"), Number: 12 }
    ];

    const weekOptions = [
        { weeks: t("label.first"), Number: 1 },
        { weeks: t("label.second"), Number: 2 },
        { weeks: t("label.third"), Number: 3 },
        { weeks: t("label.fourth"), Number: 4 },
        { weeks: t("label.fifth"), Number: 5 }
    ];

    const weekdayOptions = [
        { days: t("label.sunday"), Number: 1 },
        { days: t("label.monday"), Number: 2 },
        { days: t("label.tuesday"), Number: 3 },
        { days: t("label.wednesday"), Number: 4 },
        { days: t("label.thursday"), Number: 5 },
        { days: t("label.friday"), Number: 6 },
        { days: t("label.saturday"), Number: 7 }
    ];
    const relationalOperatorOptions = [
        { label: '=', value: '=' },
        // { label: '!=', value: '!=' },
        // { label: '>', value: '>' },
        // { label: '<', value: '<' },
        // { label: '>=', value: '>=' },
        // { label: '<=', value: '<=' }
    ];

    const localDeleteCombo = [
        { LocalDeleteName: t("label.automatic"), LocalDeleteNo: 1 },
        { LocalDeleteName: t("label.manual"), LocalDeleteNo: 0 }
    ];

    const serverDeleteCombo = [
        { ServerDeleteName: t("label.automatic"), ServerDeleteNo: 1 },
        { ServerDeleteName: t("label.manual"), ServerDeleteNo: 0 }
    ];

    // State
    const [errorDialog, setErrorDialog] = useState({
        isOpen: false,
        message: '',
        type: ''
    });
    const [isSchedulerMetadataEnabled, setIsSchedulerMetadataEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState('File Settings');
    const { postData } = useAxios();
    const [clientOptions, setClientOptions] = useState([]);
    const [domainOptions, setDomainOptions] = useState([]);
    const [destinationOptions, setDestinationOptions] = useState([]);
    const [templateOptions, setTemplateOptions] = useState([]);
    const [delimiterOptions, setDelimiterOptions] = useState([]);
    const [tagMasterData, setTagMasterData] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');
    const [selectedDelimiter, setSelectedDelimiter] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');
    const [sourcePath, setSourcePath] = useState('');
    const [selectedInstrument, setSelectedInstrument] = useState('');
    const [instrumentOptions, setInstrumentOptions] = useState([]);
    const [methodOptions, setMethodOptions] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [isInstrumentDisabled, setIsInstrumentDisabled] = useState(true);
    const [isMethodDisabled, setIsMethodDisabled] = useState(true);
    const [isCheckPathModalOpen, setIsCheckPathModalOpen] = useState(false);
    const [checkPathType, setCheckPathType] = useState('client'); // 'client' or 'server'
    const [clientUsername, setClientUsername] = useState('');
    const [clientPassword, setClientPassword] = useState('');
    const [sourcePathError, setSourcePathError] = useState(false);
    const [clientError, setClientError] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [instrumentError, setInstrumentError] = useState(false);
    const [destinationError, setDestinationError] = useState(false);
    const [filterError, setFilterError] = useState(false);
    const [methodError, setMethodError] = useState(false);
    const [levelValueError, setLevelValueError] = useState(false);
    const [filesOlderDaysError, setFilesOlderDaysError] = useState(false);
    const [auditFilterError, setAuditFilterError] = useState(false);

    // UNC Path states
    const [isUNCPathEnabled, setIsUNCPathEnabled] = useState(false);
    const [uncPath, setUncPath] = useState('');
    const [uncUsername, setUncUsername] = useState('');
    const [uncPassword, setUncPassword] = useState('');

    // Upload Policy states
    const [includeSubfolder, setIncludeSubfolder] = useState(false);
    const [completeTree, setCompleteTree] = useState(false);
    const [levelEnabled, setLevelEnabled] = useState(false);
    const [levelValue, setLevelValue] = useState('');
    const [deleteLocalCopy, setDeleteLocalCopy] = useState(false);
    const [filesOlderThanEnabled, setFilesOlderThanEnabled] = useState(false);
    const [filesOlderDays, setFilesOlderDays] = useState('');
    const [filesOlderDaysUnit, setFilesOlderDaysUnit] = useState('Days');
    const [localDeleteMode, setLocalDeleteMode] = useState(1);
    const [serverDeleteMode, setServerDeleteMode] = useState(1);
    const [filesOlderThanDate, setFilesOlderThanDate] = useState(getUTCDateString());
    const [filesOlderThanDateEnabled, setFilesOlderThanDateEnabled] = useState(false);

    // Trigger/Expiry states
    const [triggerDate, setTriggerDate] = useState(getUTCDateString());
    const [triggerTime, setTriggerTime] = useState(getUTCTimeString());
    const [expiryEnabled, setExpiryEnabled] = useState(false);
    const [expiryDate, setExpiryDate] = useState(getUTCDateString());
    const [expiryTime, setExpiryTime] = useState(getUTCTimeString());

    // File Delete Policy states
    const [applyDeletePolicy, setApplyDeletePolicy] = useState(false);
    const [enableFileLink, setEnableFileLink] = useState(false);

    // Compliance Policy states
    const [enableFileAudit, setEnableFileAudit] = useState(false);
    const [auditFilter, setAuditFilter] = useState('*.*');

    const [copyFiles, setCopyFiles] = useState(true);
    const [moveFiles, setMoveFiles] = useState(false);
    // Data Logger states
    const [dataLogger, setDataLogger] = useState(false);
    const [archivalDays, setArchivalDays] = useState('');

    // Schedule Capture states
    const [liveCapture, setLiveCapture] = useState(true);
    const [liveCaptureVersioning, setLiveCaptureVersioning] = useState(true);
    const [oneVersionPerDay, setOneVersionPerDay] = useState(false);
    // const [withoutVersioning, setWithoutVersioning] = useState(false);
    const [scheduleWithVersioning, setScheduleWithVersioning] = useState(false);

    // Filter state
    const [filter, setFilter] = useState('*.*');

    // Schedule Type states (when Live Capture is OFF)
    const [oneTime, setOneTime] = useState(true);
    const [daily, setDaily] = useState(false);
    const [weekly, setWeekly] = useState(false);
    const [monthly, setMonthly] = useState(false);
    const [scheduleWithoutVersioning, setScheduleWithoutVersioning] = useState(false);


    // Daily schedule states
    const [dailyEveryDays, setDailyEveryDays] = useState('0');
    const [dailyRepeatTask, setDailyRepeatTask] = useState(false);
    const [dailyEveryHours, setDailyEveryHours] = useState('0');
    const [dailyEveryMinutes, setDailyEveryMinutes] = useState('0');

    // Weekly schedule states
    const [weeklyDays, setWeeklyDays] = useState({
        Sunday: false,
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false
    });

    // Monthly schedule states
    const [monthlyDayToggle, setMonthlyDayToggle] = useState(false);
    const [monthlyOnToggle, setMonthlyOnToggle] = useState(true);
    const [monthlySearchTerm, setMonthlySearchTerm] = useState('');
    const [monthlySelectedDays, setMonthlySelectedDays] = useState([]);
    const [monthlyMonth, setMonthlyMonth] = useState('');
    const [monthlyWeek, setMonthlyWeek] = useState('');
    const [monthlyWeekdays, setMonthlyWeekdays] = useState('');

    const [tempSelectedDays, setTempSelectedDays] = useState([]);
    const [tempSelectedWeeks, setTempSelectedWeeks] = useState([]);
    const [tempSelectedWeekdays, setTempSelectedWeekdays] = useState([]);

    // One Time schedule state
    const [oneTimeDate, setOneTimeDate] = useState(getUTCDateString());

    // Add these states after your existing monthly states (around line 125)
    const [showDaySelector, setShowDaySelector] = useState(false);
    const [showWeekSelector, setShowWeekSelector] = useState(false);
    const [showWeekdaysSelector, setShowWeekdaysSelector] = useState(false);
    const [monthlySelectedWeeks, setMonthlySelectedWeeks] = useState([]);
    const [monthlySelectedWeekdays, setMonthlySelectedWeekdays] = useState([]);

    // Add these new states after existing states
    const [uncPathError, setUncPathError] = useState(false);
    const [uncUsernameError, setUncUsernameError] = useState(false);
    const [uncPasswordError, setUncPasswordError] = useState(false);
    const [showExpiryWarning, setShowExpiryWarning] = useState(false);
    const [showTriggerWarning, setShowTriggerWarning] = useState(false);

    // Add month selection states
    const [monthlySearchTermMonth, setMonthlySearchTermMonth] = useState('');
    const [monthlySelectedMonths, setMonthlySelectedMonths] = useState([]);
    const [showMonthSelector, setShowMonthSelector] = useState(false);
    const [tempSelectedMonths, setTempSelectedMonths] = useState([]);



    const [clientPathErrorMessage, setClientPathErrorMessage] = useState('');
    const [uncPathErrorMessage, setUncPathErrorMessage] = useState('');

    const [isManualTyping, setIsManualTyping] = useState(false);

    const [lastTriggerDateWasValid, setLastTriggerDateWasValid] = useState(true);
    const [lastExpiryDateWasValid, setLastExpiryDateWasValid] = useState(true);

    const [lastFilesOlderDateWasValid, setLastFilesOlderDateWasValid] = useState(true);


    const [delimiterSearchTerm, setDelimiterSearchTerm] = useState('');
    const [selectedDelimiters, setSelectedDelimiters] = useState([]);
    const [showDelimiterSelector, setShowDelimiterSelector] = useState(false);
    const [tempSelectedDelimiters, setTempSelectedDelimiters] = useState([]);
    const [isNoneSelected, setIsNoneSelected] = useState(false);


    const [sampleFilename, setSampleFilename] = useState('');
    const [sampleFilenameError, setSampleFilenameError] = useState(false);
    const [delimiterError, setDelimiterError] = useState(false);
    const [showMetadataTooltip, setShowMetadataTooltip] = useState(null);
    const [parsedMetadata, setParsedMetadata] = useState([]);
    const [ruleNameOptions, setRuleNameOptions] = useState([]);

    const [selectedRuleName, setSelectedRuleName] = useState('');

    const [ruleGridData, setRuleGridData] = useState([]);
    const [newRuleMetadata, setNewRuleMetadata] = useState('');
    const [newRuleTagName, setNewRuleTagName] = useState('');
    const [newRuleFieldValue, setNewRuleFieldValue] = useState('');
    const [showTagNameSelector, setShowTagNameSelector] = useState(false);
    const [showRelOpSelector, setShowRelOpSelector] = useState(false);
    const [ruleGridError, setRuleGridError] = useState(false);

    const [tagGridError, setTagGridError] = useState(false);

    const [tagNameSearchTerm, setTagNameSearchTerm] = useState('');
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [newRuleRelationalOp, setNewRuleRelationalOp] = useState('');
    const [relOpSearchTerm, setRelOpSearchTerm] = useState('');
    const [uncDomainError, setUncDomainError] = useState(false);
    const [templateError, setTemplateError] = useState(false);

    const [tagRowErrors, setTagRowErrors] = useState([]);  // Track which tag rows have errors
    const [selectedTagRowIndex, setSelectedTagRowIndex] = useState(null);


    // Add these after other state declarations in SearchServerData component
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [isManualParsingInstrument, setIsManualParsingInstrument] = useState(false);
    const [submitAction, setSubmitAction] = useState(''); // 'save', 'saveActivate', 'activateLock'
    // Add to your state declarations:
    const [submitPassObjDet, setSubmitPassObjDet] = useState(null);

    const [mode, setMode] = useState('create');

    // Add to your state declarations (around line 220-230):
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const [auditAction, setAuditAction] = useState(''); // 'saveActivate' or 'activateLock'
    const [auditData, setAuditData] = useState(null);
    const [auditPasswordError, setAuditPasswordError] = useState(false);
    const [submitDialogMessage, setSubmitDialogMessage] = useState('');

    //state for the loading spinner
    const [fullPageLoading, setFullPageLoading] = useState(false);

    const [isViewMode, setIsViewMode] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const [navigationSource, setNavigationSource] = useState(null);

    const [isHandlingNavigation, setIsHandlingNavigation] = useState(false);
    const [submitDialogSubMessage, setSubmitDialogSubMessage] = useState('');

    const [delimiterEmptyError, setDelimiterEmptyError] = useState(false);

    const [tempSelectedTagName, setTempSelectedTagName] = useState('');
    const [tempSelectedRelOp, setTempSelectedRelOp] = useState('');
    // Add this near the top of DataScheduler component, after state declarations
    // Around line 340-348, replace the existing isFieldDisabled with:
    const isFieldDisabled = useCallback((fieldType = 'default') => {
        // In edit mode, some fields should be disabled, others should not
        if (mode === 'edit' && !isViewMode) {
            // These fields should be DISABLED in edit mode
            const disabledFields = [
                'client',
                'instrument',
                'sourcePath',
                'destination',
                'uncPath',
                'uncUsername',
                'uncPassword',
                'uncDomain',
                'pathType' // Both check buttons
            ];

            if (disabledFields.includes(fieldType)) {
                return true; // Disable these fields
            }
            return false; // Don't disable other fields (including method)
        }

        // In view mode, everything should be disabled
        return isViewMode || isReadOnly;
    }, [mode, isViewMode, isReadOnly]);

    // Ref for the scrollable container (The specific div that scrolls)
    const scrollContainerRef = useRef(null);

    // Refs for Sections
    const fileSettingsRef = useRef(null);
    const uploadPolicyRef = useRef(null);
    const triggerExpiryRef = useRef(null);
    const scheduleCaptureRef = useRef(null);
    const schedulerMetadataRef = useRef(null);

    // Add this near the top of DataScheduler component
    const isInterfaceInstrument = useCallback((instrumentId) => {
        if (!instrumentId) return false;
        const parts = instrumentId.split(':');
        return parts.length > 1 && parts[1].trim() !== "0";
    }, []);


    const validateFileRows = () => {
        let hasFileRows = false;
        let hasErrors = false;

        // Check if any rows have File selected
        tagMasterData.forEach(tag => {
            if (tag.sSourceFlag === 'File') {
                hasFileRows = true;
            }
        });

        if (!hasFileRows) {
            // No File rows, clear all errors
            setSampleFilenameError(false);
            setDelimiterError(false);
            return false;
        }

        // Validate sample filename for File rows
        if (!sampleFilename.trim()) {
            setSampleFilenameError(true);
            hasErrors = true;
        } else {
            const hasExtension = sampleFilename.includes('.') &&
                sampleFilename.lastIndexOf('.') < sampleFilename.length - 1;
            if (!hasExtension) {
                setSampleFilenameError(true);
                hasErrors = true;
            } else {
                setSampleFilenameError(false);
            }
        }

        // Validate delimiter for File rows
        if (!selectedDelimiters.length) {
            setDelimiterError(true);
            hasErrors = true;
        } else {
            setDelimiterError(false);
        }

        return hasErrors;
    };


    // At the top of your DataScheduler component
    useEffect(() => {
        console.log('CURRENT FORM STATE:');
        console.log('selectedClient:', selectedClient);
        console.log('selectedInstrument:', selectedInstrument);
        console.log('sourcePath:', sourcePath);
        console.log('uncPath:', uncPath);
        console.log('mode:', mode);
        console.log('isViewMode:', isViewMode);
    }, [selectedClient, selectedInstrument, sourcePath, uncPath, mode, isViewMode]);

    // Auto-select first tag row when tagMasterData is loaded
    useEffect(() => {
        if (tagMasterData.length > 0 && selectedTagRowIndex === null) {
            setSelectedTagRowIndex(0);
            console.log("Auto-selected first tag row");
        }
    }, [tagMasterData, selectedTagRowIndex]);

    // Debug: Log when navigationState changes
    useEffect(() => {
        console.log('NavigationState changed:', navigationState);
    }, [navigationState]);

    useEffect(() => {
        console.log('TEST: This useEffect is running!');
        console.log('navigationState:', navigationState);
    }, [navigationState]);

    // Date validation utilities
    const isValidDate = (dateString) => {
        const parts = dateString.split('/');
        if (parts.length !== 3) return false;

        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);

        if (day < 1 || day > 31) return false;
        if (month < 1 || month > 12) return false;
        if (year < 1900 || year > 9999) return false;

        return true;
    };

    // const isFutureDate = (dateString) => {
    //     const parts = dateString.split('/');
    //     const date = new Date(parts[2], parts[1] - 1, parts[0]);
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     return date > today;
    // };

    // const isPastDate = (dateString) => {
    //     const parts = dateString.split('/');
    //     const date = new Date(parts[2], parts[1] - 1, parts[0]);
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     return date < today;
    // };

    // const getCurrentDate = () => {
    //     return new Date().toLocaleDateString('en-GB');
    // };

    const getCurrentDate = () => {
        // OLD: return new Date().toLocaleDateString('en-GB');
        // NEW: UTC date in DD/MM/YYYY format
        const now = new Date();
        const day = String(now.getUTCDate()).padStart(2, '0');
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const year = now.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    const isFutureDate = (dateString) => {
        const parts = dateString.split('/');
        // Create UTC date (set hours to noon UTC to avoid timezone issues)
        const date = new Date(Date.UTC(parts[2], parts[1] - 1, parts[0], 12, 0, 0));
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return date > today;
    };

    const isPastDate = (dateString) => {
        const parts = dateString.split('/');
        const date = new Date(Date.UTC(parts[2], parts[1] - 1, parts[0], 12, 0, 0));
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return date < today;
    };

    const compareDates = (date1String, date2String) => {
        const parts1 = date1String.split('/');
        const parts2 = date2String.split('/');
        const date1 = new Date(parts1[2], parts1[1] - 1, parts1[0]);
        const date2 = new Date(parts2[2], parts2[1] - 1, parts2[0]);
        return date1 - date2;
    };

    // const validateTime = (hours, minutes, seconds) => {
    //     const validHours = Math.min(Math.max(parseInt(hours) || 0, 0), 23);
    //     const validMinutes = Math.min(Math.max(parseInt(minutes) || 0, 0), 59);
    //     const validSeconds = Math.min(Math.max(parseInt(seconds) || 0, 0), 59);
    //     return {
    //         hours: validHours.toString().padStart(2, '0'),
    //         minutes: validMinutes.toString().padStart(2, '0'),
    //         seconds: validSeconds.toString().padStart(2, '0')
    //     };
    // };

    const validateTime = (hours, minutes, seconds) => {
        // Already works with UTC if we treat as numbers
        const validHours = Math.min(Math.max(parseInt(hours) || 0, 0), 23);
        const validMinutes = Math.min(Math.max(parseInt(minutes) || 0, 0), 59);
        const validSeconds = Math.min(Math.max(parseInt(seconds) || 0, 0), 59);
        return {
            hours: validHours.toString().padStart(2, '0'),
            minutes: validMinutes.toString().padStart(2, '0'),
            seconds: validSeconds.toString().padStart(2, '0')
        };
    };

    const handleFilesOlderToggle = (toggleToEnable) => {
        // Don't do anything if deleteLocalCopy is OFF or moveFiles is ON
        if (!deleteLocalCopy || moveFiles) return;

        if (toggleToEnable === 'number') {
            // Turn ON number toggle, turn OFF date toggle
            setFilesOlderThanEnabled(true);
            setFilesOlderThanDateEnabled(false);
        } else if (toggleToEnable === 'date') {
            // Turn ON date toggle, turn OFF number toggle
            setFilesOlderThanEnabled(false);
            setFilesOlderThanDateEnabled(true);
        }
    };

    //---------------Athira
    // const {
    //     getSubmissionData,
    //     clearNavigation,
    //     submissionData,
    //     navigationState
    // } = useSchedulerNavigation();
    //------------------------------------------------


    const validateAndFormatDate = (dateString) => {
        const parts = dateString.split('/');
        if (parts.length !== 3) return dateString;

        let day = parseInt(parts[0]) || 1;
        let month = parseInt(parts[1]) || 1;
        let year = parseInt(parts[2]) || new Date().getFullYear();

        // Force upper limit
        if (year > 2100) {
            return '01/01/2100';
        }

        // Validate year lower bound
        if (year < 2000) year = 2000;

        // Validate month
        if (month < 1) month = 1;
        if (month > 12) month = 12;

        // Validate day
        const maxDay = new Date(year, month, 0).getDate();
        if (day < 1) day = 1;
        if (day > maxDay) day = maxDay;

        return `${day.toString().padStart(2, '0')}/${month
            .toString()
            .padStart(2, '0')}/${year}`;
    };

    const handleAddRule = () => {
        // Check if ALL fields are filled
        const allFieldsFilled =
            newRuleMetadata.trim() &&
            newRuleTagName &&
            newRuleFieldValue.trim() &&
            newRuleRelationalOp;

        if (!allFieldsFilled) {
            setRuleGridError(true);
            return;
        }

        // Clear error if validation passes
        setRuleGridError(false);

        // Create new rule object
        // const newRule = {
        //     id: Date.now(),
        //     ruleName: selectedRuleName,
        //     metadata: newRuleMetadata,
        //     tagName: newRuleTagName,
        //     relationalOp: newRuleRelationalOp,
        //     fieldValue: newRuleFieldValue
        // };

        // FIX - add ruleNameDisplay:
        const newRule = {
            id: Date.now(),
            ruleName: selectedRuleName,
            ruleNameDisplay: ruleNameOptions.find(r => r.RuleID?.toString() === selectedRuleName?.toString())?.RuleName || selectedRuleName,
            metadata: newRuleMetadata,
            tagName: newRuleTagName,
            relationalOp: newRuleRelationalOp,
            fieldValue: newRuleFieldValue
        };

        // Add to grid data
        setRuleGridData(prev => [...prev, newRule]);

        // Clear form fields
        setNewRuleMetadata('');
        setNewRuleTagName('');
        setNewRuleRelationalOp('');
        setNewRuleFieldValue('');
        setRelOpSearchTerm('');
        setTagNameSearchTerm('');
    };

    const handleRemoveRule = () => {
        if (ruleGridData.length === 0) {
            setErrorDialog({
                isOpen: true,
                message: t("common.selectrecord"),
                type: 'information'
            });
            return;
        }

        // If no row is selected, select the first one and show error
        if (selectedRowId === null) {
            if (ruleGridData.length > 0) {
                setSelectedRowId(ruleGridData[0].id);
                setErrorDialog({
                    isOpen: true,
                    message: t("common.selectrecord"),
                    type: 'warning'
                });
            }
            return;
        }

        // Remove the selected row
        setRuleGridData(prev => prev.filter(rule => rule.id !== selectedRowId));
        setSelectedRowId(null); // Clear selection after removal
    };

    const TagNameSelector = ({
        isOpen,
        onClose,
        tagOptions,
        selectedTag,
        onSelect,
        searchTerm,
        onSearchChange
    }) => {
        const dropdownRef = useRef(null);

        useEffect(() => {
            // Cleanup function when component unmounts
            return () => {
                console.log('DataScheduler unmounting, clearing navigation');
                if (clearNavigation) {
                    clearNavigation();
                }
            };
        }, [clearNavigation]);

        // Helper to check if fields should be disabled
        const isFieldDisabled = useCallback(() => {
            return isViewMode || isReadOnly;
        }, [isViewMode, isReadOnly]);
        // Example - Apply to ALL input fields, dropdowns, checkboxes, etc.
        // disabled={isFieldDisabled()}

        useEffect(() => {
            const handleClickOutside = (e) => {
                if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                    onClose();
                }
            };

            if (isOpen) {
                document.addEventListener('click', handleClickOutside);
            }

            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }, [isOpen, onClose]);

        if (!isOpen) return null;

        const filteredOptions = tagOptions.filter(opt =>
            opt.sTagName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div
                ref={dropdownRef}
                className="fixed z-[99999] bg-white border border-gray-300 rounded-md shadow-lg"
                style={{
                    position: 'fixed',
                    width: '256px',
                    zIndex: 99999,
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    overflow: 'visible'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="p-2 border-b border-gray-300 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Search size={14} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("common.lookingfor")}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full text-sm text-gray-700 placeholder-gray-400 border-none focus:outline-none bg-transparent"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Options List */}
                <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    {filteredOptions.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-gray-500">
                            {t("scheduler.notagsfound")}
                        </div>
                    ) : (
                        filteredOptions.map((tag) => (
                            <div
                                key={tag.sTagID}
                                onClick={() => onSelect(tag.sTagName)}
                                className={`px-3 py-2 text-sm cursor-pointer border-b last:border-b-0 transition-colors ${selectedTag === tag.sTagName
                                    ? 'bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-500'
                                    : 'hover:bg-blue-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{tag.sTagName}</span>
                                    {selectedTag === tag.sTagName && (
                                        <Check size={14} className="text-blue-500" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer with buttons */}
                <div className="border-t border-gray-300">
                    <div className="flex justify-end gap-2 p-2">
                        <button
                            onClick={() => {
                                if (selectedTag) {
                                    onSelect(selectedTag);
                                }
                                onClose();
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                            disabled={!selectedTag}
                        >
                            {t("button.submit")}
                        </button>
                        <button
                            onClick={onClose}
                            className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-50"
                        >
                            {t("button.cancel")}
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    // Load all combos on screen load
    const loadCombos = async () => {
        setFullPageLoading(true);
        try {
            const requestData = CF_activeUserdetails();

            // Detect if we're in edit mode by checking URL params or props
            // This replicates: $("#datascheduler_childmenu_item").attr("process")
            const urlParams = new URLSearchParams(window.location.search);
            const processParam = urlParams.get('process');

            if (processParam) {
                setMode('edit');
            } else {
                setMode('create');
            }

            // Client Combo
            const clientResponse = await postData(
                'Scheduler/DataSchedulerClientCombo',
                requestData
            );
            setClientOptions(clientResponse || []);

            // Domain Combo
            const domainResponse = await postData(
                'Scheduler/DataSchedulerDomainCombo',
                requestData
            );
            // Set NONE as default selected
            setDomainOptions(domainResponse || []);

            if (domainResponse && domainResponse.length > 0) {
                setSelectedDomain(domainResponse[0].L03DomainID);
            }

            // Destination Combo
            const destinationResponse = await postData(
                'Scheduler/DataSchedulerDestinationCombo',
                requestData
            );
            setDestinationOptions(destinationResponse || []);

            // Template Combo
            const templateResponse = await postData(
                'InstrumentLock/LockTemplateCombo',
                requestData
            );
            setTemplateOptions(templateResponse || []);

            // Auto-select first template
            if (templateResponse && templateResponse.length > 0) {
                const firstTemplateId = templateResponse[0].sTemplateID;
                console.log("Auto-selected template:", firstTemplateId);
                setSelectedTemplate(firstTemplateId);
            }



            // Delimiter Combo
            const delimiterResponse = await postData(
                'Scheduler/LoadDelimeter',
                requestData
            );
            setDelimiterOptions(delimiterResponse || []);

        } catch (error) {
            console.error("Error loading combos:", error);
        } finally {
            setFullPageLoading(false);
        }
    };

    // Replace your current loadInstruments function (around line 1330):
    const loadInstruments = async (clientId) => {
        setFullPageLoading(true);
        try {
            const requestData = {
                sClientID: clientId,
                ...CF_activeUserdetails()
            };

            // ALWAYS use DataSchedulerActiveInstrument to get LockType
            const endpoint = 'Scheduler/DataSchedulerActiveInstrument';

            console.log("Loading instruments with LockType via:", endpoint);

            const response = await postData(endpoint, requestData);

            console.log("=== INSTRUMENT OPTIONS WITH LOCKTYPE ===", response);

            // Debug: Check if LockType field exists
            if (response && response.length > 0) {
                console.log("First instrument has LockType?", 'L11LockType' in response[0]);
                console.log("First instrument LockType value:", response[0]?.L11LockType);
                console.log("All instrument fields:", Object.keys(response[0]));
            }

            setInstrumentOptions(response || []);
            setIsInstrumentDisabled(false);

            // Reset instrument and method selections
            setSelectedInstrument('');
            setSelectedMethod('');
            setMethodOptions([]);
            setIsMethodDisabled(true);
        } catch (error) {
            console.error("Error loading instruments:", error);
            setInstrumentOptions([]);
        } finally {
            setFullPageLoading(false);
        }
    };

    // Add this function somewhere in your component (after loadInstruments):
    const checkParsingOrder = async (passObjDet) => {
        try {
            const checkParsingOrderData = {
                ...CF_activeUserdetails(),
                ...passObjDet
            };

            console.log("Checking parsing order with data:", checkParsingOrderData);

            const parsingOrderResponse = await postData(
                'Scheduler/CheckInstrumentExistwithParsingOrder',
                checkParsingOrderData
            );

            console.log("Parsing order response:", parsingOrderResponse);

            if (parsingOrderResponse && parsingOrderResponse.nParsingInstrOrderCount >= 1) {
                // Instrument is locked - show 2-button dialog
                console.log("Instrument locked - showing 2-button dialog");
                setIsManualParsingInstrument(false);  // FALSE = 2 buttons
                // ADD SUBMESSAGE HERE
                setSubmitDialogMessage(t("scheduler.confirmActivate"));
                setSubmitDialogSubMessage(t("scheduler.instrumentlocksubmessage"));
                setShowSubmitDialog(true);
            } else {
                // Instrument is not locked - show 3-button dialog
                console.log("Instrument not locked - showing 3-button dialog");
                setIsManualParsingInstrument(true);  // TRUE = 3 buttons
                setSubmitDialogMessage(t("scheduler.lockInstrumentAndActivate"));
                setSubmitDialogSubMessage(""); // Clear submessage for 3-button case
                setShowSubmitDialog(true);
            }
        } catch (error) {
            console.error("Error checking parsing order:", error);
            setErrorDialog({
                isOpen: true,
                message: 'Error checking instrument parsing order',
                type: 'error'
            });
        }
    };

    // Check if instrument is auto-locked
    const checkAutoLock = async (instrumentId) => {
        setFullPageLoading(true);
        try {
            const requestData = {
                sInstrumentID: instrumentId,
                ...CF_activeUserdetails()
            };

            const response = await postData(
                'Scheduler/checkAutoLockedforSchecdule',
                requestData
            );

            if (response && response.ScheduleActivated) {
                // const message = `${response.InstrumentName} instrument has already scheduled with ${response.ScheduleTaskID} taskID by Autolock Mode. So, Retire the ${response.ScheduleTaskID} taskID, before creating a new schedule for this instrument`;

                const message = t("scheduler.alreadyScheduledFull", {
                    instrument: response.InstrumentName,
                    taskId: response.ScheduleTaskID
                });


                // Show error dialog
                setErrorDialog({
                    isOpen: true,
                    message: message,
                    type: 'warning'
                });

                // Reset instrument selection
                setSelectedInstrument('');
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error checking auto lock:", error);
            return true;
        } finally {
            setFullPageLoading(false);
        }
    };

    // Load methods based on selected instrument
    const loadMethods = async (instrumentData) => {
        setFullPageLoading(true);
        try {
            const requestData = {
                sInstrumentID: instrumentData.L12InstrumentID,
                InstrumentMappingId: instrumentData.L12InstrumentMappingID,
                InstInterfacerStatus: instrumentData.L11InterfaceStatus,
                ...CF_activeUserdetails()
            };

            const response = await postData(
                'Scheduler/DataSchedulerTestCombo',
                requestData
            );

            if (response && response.lstWebMethod && response.lstWebMethod.length > 0) {
                console.log("=== METHOD OPTIONS STRUCTURE ===", response.lstWebMethod); // ← ADD THIS
                setMethodOptions(response.lstWebMethod);
                setIsMethodDisabled(false);

                setSelectedMethod('');
                setMethodError(false);

                setIsMethodDisabled(false);

                const firstMethod = response.lstWebMethod[0].InstMethodName;
                setSelectedMethod(firstMethod);

                console.log("Auto-selected method:", firstMethod);
            } else {
                console.log("No methods found - clearing and disabling");
                setSelectedMethod('');
                setMethodError(false);
                setMethodOptions([]);
                setIsMethodDisabled(true);
                console.log("Instrument has no parser methods available");
            }
        } catch (error) {
            console.error("Error loading methods:", error);
            setSelectedMethod('');
            setMethodError(false);
            setMethodOptions([]);
            setIsMethodDisabled(true);
        } finally {
            setFullPageLoading(false);
        }
    };

    const validateAndShowCheckPathModal = () => {
        let hasError = false;

        if (!selectedClient) {
            setClientError(true);
            hasError = true;
        } else {
            setClientError(false);
        }

        if (!sourcePath.trim()) {
            setSourcePathError(true);
            hasError = true;
        } else if (!CF_pathValidation(sourcePath)) {
            setSourcePathError(true);
            hasError = true;
        } else {
            setSourcePathError(false);
        }

        if (hasError) {
            return;
        }

        // Clear everything first
        setClientUsername('');
        setClientPassword('');
        setUsernameError(false);
        setPasswordError(false);
        setClientPathErrorMessage('');
        setUncPathErrorMessage('');
        setCheckPathType('client');

        // Open modal after clearing
        setIsCheckPathModalOpen(true);
    };

    const parseMetadataFromFilename = (filename, delimiters, delimiterOptions) => {
        if (!filename || !delimiters || delimiters.length === 0) return [];

        // Validate filename has extension
        const extensionMatch = filename.match(/\.[^.]+$/);
        if (!extensionMatch) {
            setSampleFilenameError(true);
            return [];
        }

        const extension = extensionMatch[0];
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));

        // If NONE selected, split by extension only
        if (delimiters.includes('NONE') || delimiters.length === 0) {
            return [nameWithoutExt, extension.substring(1)]; // Remove dot from extension
        }

        // Get delimiter characters from backend data
        const delimiterChars = delimiters.map(d => {
            const delimiterObj = delimiterOptions.find(opt => opt.sDelimiterName === d);
            return delimiterObj?.sDelimiterValue || d;
        });

        // Create regex pattern from delimiters
        const pattern = new RegExp(`[${delimiterChars.map(d => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')}]`);

        // Split by delimiters
        const parts = nameWithoutExt.split(pattern).filter(p => p.trim());

        // Add extension as last part
        parts.push(extension.substring(1));

        return parts;
    };

    const validateAndShowUNCPathModal = () => {
        let hasError = false;

        if (!selectedClient) {
            setClientError(true);
            hasError = true;
        } else {
            setClientError(false);
        }

        if (!uncPath.trim()) {
            setUncPathError(true);
            hasError = true;
        } else if (!CF_UNCPathValidation(uncPath)) {
            setUncPathError(true);
            hasError = true;
        } else {
            setUncPathError(false);
        }

        if (hasError) {
            return;
        }

        // Clear everything first
        setClientUsername('');
        setClientPassword('');
        setUsernameError(false);
        setPasswordError(false);
        setClientPathErrorMessage('');
        setUncPathErrorMessage('');
        setCheckPathType('client');

        // Open modal after clearing
        setIsCheckPathModalOpen(true);
    };

    const submitCheckPath = async () => {
        const pathToCheck = isUNCPathEnabled ? uncPath : sourcePath;

        if (checkPathType === 'client') {
            // Validate BOTH username and password before showing errors
            const hasUsernameError = !clientUsername.trim();
            const hasPasswordError = !clientPassword.trim();

            setUsernameError(hasUsernameError);
            setPasswordError(hasPasswordError);

            if (hasUsernameError || hasPasswordError) {
                return;
            }

            setFullPageLoading(true);
            try {
                console.log("=== Sending to backend ===");
                console.log("Path:", pathToCheck);
                console.log("Is UNC Path:", isUNCPathEnabled);
                console.log("Client Name:", clientOptions.find(c => c.L06ClientID === selectedClient)?.L06ClientName);

                const requestData = {
                    path: pathToCheck,
                    // pathreference: 'local',
                    pathreference: isUNCPathEnabled ? 'unc' : 'local',
                    sclientname: clientOptions.find(c => c.L06ClientID === selectedClient)?.L06ClientName || '',
                    sclientusername: clientUsername,
                    sclientpassword: clientPassword,
                    ...CF_activeUserdetails()
                };

                console.log("Request Data:", requestData);
                const response = await postData(
                    'Scheduler/ClientPathChecking',
                    requestData
                );

                console.log("Response:", response);
                // Close modal first
                setIsCheckPathModalOpen(false);

                // For CLIENT path - show inline error or success dialog
                if (response.Rtn?.toLowerCase() === 'success') {
                    setClientPathErrorMessage('');
                    setUncPathErrorMessage('');
                    setErrorDialog({
                        isOpen: true,
                        message: response.Message || t("scheduler.pathaccessible"),
                        type: 'success'
                    });
                } else {
                    // Set inline error message instead of dialog for client
                    if (isUNCPathEnabled) {
                        setUncPathErrorMessage(response.Message || t("scheduler.failedtoconnect"));
                    } else {
                        setClientPathErrorMessage(response.Message || t("scheduler.failedtoconnect"));
                    }
                    // Reopen modal to show inline error
                    setIsCheckPathModalOpen(true);
                }
            } catch (error) {
                console.error("Error checking client path:", error);
                setIsCheckPathModalOpen(false);
                setErrorDialog({
                    isOpen: true,
                    message: t("scheduler.errorcheckingpath"),
                    type: 'error'
                });
            } finally {
                setFullPageLoading(false);
            }
        } else {
            // Server path checking
            setFullPageLoading(true);
            try {
                const requestData = {
                    path: pathToCheck,
                    ...CF_activeUserdetails()
                };

                const response = await postData(
                    'Scheduler/PathChecking',
                    requestData
                );

                // Close modal first
                setIsCheckPathModalOpen(false);

                // For SERVER path - ALWAYS show popup dialog (success or error)
                if (response.Rtn?.toLowerCase() === 'success') {
                    setErrorDialog({
                        isOpen: true,
                        message: response.OResObj || t("scheduler.pathaccessible"),
                        type: 'success'
                    });
                } else {
                    setErrorDialog({
                        isOpen: true,
                        message: response.OResObj || t("scheduler.pathnotaccessible"),
                        type: 'warning'
                    });
                }
            } catch (error) {
                console.error("Error checking server path:", error);
                setIsCheckPathModalOpen(false);
                setErrorDialog({
                    isOpen: true,
                    message: t("scheduler.errorcheckingpath"),
                    type: 'error'
                });
            } finally {
                setFullPageLoading(false);
            }
        }
    };
    const handleReset = () => {
        // Reset File Settings
        setSelectedClient('');
        setSelectedInstrument('');
        setSelectedMethod('');
        setIsInstrumentDisabled(true);
        setIsMethodDisabled(true);
        setInstrumentOptions([]);
        setMethodOptions([]);
        setSourcePath('');
        setSourcePathError(false);
        setClientError(false);

        // Reset Path Type
        setIsUNCPathEnabled(false);
        setUncPath('');
        setUncUsername('');
        setUncPassword('');
        setUncPathError(false);
        setUncUsernameError(false);
        setUncPasswordError(false);

        // Set default domain to first option
        if (domainOptions.length > 0) {
            setSelectedDomain(domainOptions[0].L03DomainID);
        }

        setSelectedDestination('');
        setFilter('*.*');
        setFilterError(false);

        // Reset Upload Policy
        setIncludeSubfolder(false);
        setCompleteTree(false);
        setLevelEnabled(false);
        setLevelValue('');
        setLevelValueError(false);

        // Reset copy/move files - COPY should be selected by default
        setCopyFiles(true);
        setMoveFiles(false);

        // Reset delete local copy
        setDeleteLocalCopy(false);
        setFilesOlderThanEnabled(false);
        setFilesOlderDays('');
        setFilesOlderDaysUnit('Days');
        setFilesOlderDaysError(false);
        setLocalDeleteMode(1); // Automatic

        // Reset files older than date
        setFilesOlderThanDate(getUTCDateString());
        setFilesOlderThanDateEnabled(false);
        setLastFilesOlderDateWasValid(true);

        // Reset Trigger/Expiry
        setTriggerDate(getUTCDateString());
        setTriggerTime(getUTCTimeString());
        setExpiryEnabled(false);
        setExpiryDate(getUTCDateString());
        setExpiryTime(getUTCTimeString());
        setShowExpiryWarning(false);
        setShowTriggerWarning(false);
        setLastTriggerDateWasValid(true);
        setLastExpiryDateWasValid(true);

        // Reset Policies
        setApplyDeletePolicy(false);
        setServerDeleteMode(1); // Automatic
        setEnableFileLink(false);

        // Reset Compliance Policy
        setEnableFileAudit(false);
        setAuditFilter('*.*');
        setAuditFilterError(false);

        // Reset Data Logger
        setDataLogger(false);
        setArchivalDays('');

        // Reset Schedule Capture 
        setLiveCapture(true);

        // When Live Capture is OFF, set schedule mode to One Time (default)
        setOneTime(true);
        setDaily(false);
        setWeekly(false);
        setMonthly(false);

        // Versioning settings when Live Capture is OFF
        setLiveCaptureVersioning(true);
        setOneVersionPerDay(false);
        setScheduleWithVersioning(false);
        setScheduleWithoutVersioning(false);

        // Set One Time date to current date
        setOneTimeDate(new Date().toLocaleDateString('en-GB'));

        // Reset Daily schedule
        setDailyEveryDays('0');
        setDailyRepeatTask(false);
        setDailyEveryHours('0');
        setDailyEveryMinutes('0');

        // Reset Weekly schedule
        setWeeklyDays({
            Sunday: false,
            Monday: false,
            Tuesday: false,
            Wednesday: false,
            Thursday: false,
            Friday: false,
            Saturday: false
        });

        // Reset Monthly schedule
        setMonthlyDayToggle(false);
        setMonthlyOnToggle(true);
        setMonthlySearchTerm('');
        setMonthlySelectedDays([]);

        // Reset month selection
        setMonthlySearchTermMonth('');
        setMonthlySelectedMonths([]);

        // Reset week selection
        setMonthlySelectedWeeks([]);
        setMonthlySelectedWeekdays([]);

        // Close all selectors
        setShowDaySelector(false);
        setShowWeekSelector(false);
        setShowWeekdaysSelector(false);
        setShowMonthSelector(false);
        setTempSelectedDays([]);
        setTempSelectedWeeks([]);
        setTempSelectedWeekdays([]);
        setTempSelectedMonths([]);

        // Reset Scheduler Metadata
        setIsSchedulerMetadataEnabled(false);

        // Set template to first option if available
        if (templateOptions.length > 0) {
            setSelectedTemplate(templateOptions[0].sTemplateID);
        }

        setSelectedDelimiter('');
        setTagMasterData([]);

        // Reset delimiter selection
        setSelectedDelimiters([]);
        setTempSelectedDelimiters([]);
        setDelimiterSearchTerm('');
        setShowDelimiterSelector(false);
        setIsNoneSelected(false);

        // Reset sample filename
        setSampleFilename('');
        setSampleFilenameError(false);
        setDelimiterError(false);

        // Clear all tooltips
        setShowMetadataTooltip(null);
        setParsedMetadata([]);

        // Reset Rule section
        setSelectedRuleName('');
        setRuleNameOptions([]);
        setRuleGridData([]);
        setSelectedRowId(null);
        setNewRuleMetadata('');
        setNewRuleTagName('');
        setNewRuleRelationalOp('');
        setNewRuleFieldValue('');
        setTagNameSearchTerm('');
        setRelOpSearchTerm('');
        setShowTagNameSelector(false);
        setShowRelOpSelector(false);
        setRuleGridError(false);

        // Reset tag errors
        setTagRowErrors([]);
        setSelectedTagRowIndex(null);
        setTagGridError(false);

        // Clear all other validation errors
        setClientError(false);
        setInstrumentError(false);
        setDestinationError(false);
        setMethodError(false);
        setUncDomainError(false);
        setTemplateError(false);

        // Clear path error messages
        setClientPathErrorMessage('');
        setUncPathErrorMessage('');

        // Clear password errors
        setUsernameError(false);
        setPasswordError(false);

        // Reset mode to create
        setMode('create');

        // Reload combos to refresh data
        loadCombos();

        // Reset submit states
        setShowSubmitDialog(false);
        setSubmitPassObjDet(null);
        setSubmitDialogMessage('');

        // Scroll to top
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Reset active tab
        setActiveTab('File Settings');
    };

    const loadTagMaster = async (templateId) => {
        setFullPageLoading(true);
        console.log("=== loadTagMaster called ===");
        console.log("templateId:", templateId);

        try {
            const requestData = {
                sTemplateID: templateId,
                sInstrumentID: "",
                ...CF_activeUserdetails()
            };

            console.log("Tag API Request:", requestData);

            const response = await postData(
                'Scheduler/GetTagMasterByTemplate',
                requestData
            );

            console.log("Tag API Response:", response);

            // Store the tag data
            setTagMasterData(response || []);

            // AUTO-SELECT FIRST ROW - ADD THIS
            if (response && response.length > 0) {
                setSelectedTagRowIndex(0);
            }

            // Create rule name options from tag data
            if (response && response.length > 0) {
                const tagNames = response.map(tag => ({
                    RuleName: tag.sTagName,
                    RuleID: tag.sTagID?.toString()  // Ensure it's a string
                }));

                console.log("Setting ruleNameOptions:", tagNames);
                setRuleNameOptions(tagNames);

                // Select first tag as default
                const firstTagId = response[0].sTagID?.toString();
                console.log("Setting selectedRuleName:", firstTagId);
                setSelectedRuleName(firstTagId);
            } else {
                setRuleNameOptions([]);
                setSelectedRuleName('');
            }
        } catch (error) {
            console.error("Tag master load failed:", error);
            setTagMasterData([]);
            setRuleNameOptions([]);
            setSelectedRuleName('');
            setSelectedTagRowIndex(null);
        } finally {
            setFullPageLoading(false);
        }
    };

    const handleTriggerDateChange = (date) => {
        console.log("=== handleTriggerDateChange called ===");
        console.log("Input date:", date);
        console.log("Current triggerDate:", triggerDate);
        console.log("lastTriggerDateWasValid:", lastTriggerDateWasValid);

        const formattedDate = validateAndFormatDate(date);
        console.log("Formatted date:", formattedDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const parts = formattedDate.split('/');

        if (parts.length === 3) {
            const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
            selectedDate.setHours(0, 0, 0, 0);

            console.log("Selected date:", selectedDate);
            console.log("Today:", today);
            console.log("Is past?", selectedDate < today);

            if (selectedDate < today) {
                // Calculate yesterday
                const yesterday = new Date();
                yesterday.setTime(yesterday.getTime() - 86400000);
                yesterday.setHours(0, 0, 0, 0);
                const yesterdayFormatted = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;

                console.log("Setting to yesterday:", yesterdayFormatted);

                // Show error ONLY if last date was valid (current or future)
                if (lastTriggerDateWasValid) {
                    console.log("Showing error dialog - transitioning from valid to past date");
                    setErrorDialog({
                        isOpen: true,
                        message: t("scheduler.dateselectionwarning"),
                        type: 'warning'
                    });
                } else {
                    console.log("No error dialog - already in past date state");
                }

                // First clear it, then set it in next tick
                setTriggerDate('');
                setTimeout(() => {
                    setTriggerDate(yesterdayFormatted);
                }, 0);

                setShowTriggerWarning(false);
                setLastTriggerDateWasValid(false);
                return;
            } else {
                // Valid date (today or future)
                console.log("Valid date (today or future), setting:", formattedDate);
                setTriggerDate(formattedDate);
                setShowTriggerWarning(false);
                setLastTriggerDateWasValid(true);
            }
        } else {
            setTriggerDate(formattedDate);
        }
    };

    const handleExpiryDateChange = (date) => {
        const formattedDate = validateAndFormatDate(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const parts = formattedDate.split('/');

        if (parts.length === 3) {
            const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                // Calculate yesterday
                const yesterday = new Date();
                yesterday.setTime(yesterday.getTime() - 86400000);
                yesterday.setHours(0, 0, 0, 0);
                const yesterdayFormatted = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;

                // Show error ONLY if last date was valid (current or future)
                if (lastExpiryDateWasValid) {
                    setErrorDialog({
                        isOpen: true,
                        message: t("scheduler.dateselectionwarning"),
                        type: 'warning'
                    });
                }

                // IMPORTANT: Force update even if value is the same
                // First clear it, then set it in next tick
                setExpiryDate('');
                setTimeout(() => {
                    setExpiryDate(yesterdayFormatted);
                }, 0);

                setShowExpiryWarning(false);
                setLastExpiryDateWasValid(false);
                return;
            } else {
                // Valid date (today or future)
                setExpiryDate(formattedDate);
                setShowExpiryWarning(false);
                setLastExpiryDateWasValid(true);
            }
        } else {
            setExpiryDate(formattedDate);
        }
    };

    const handleOneTimeDateChange = (date) => {
        const formattedDate = validateAndFormatDate(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const parts = formattedDate.split('/');

        // Check if it's a valid date
        if (parts.length === 3) {
            const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);

            if (selectedDate < today) {
                // For One Time schedule, also show error and set to yesterday
                setErrorDialog({
                    isOpen: true,
                    message: t("scheduler.dateselectionwarning"),
                    type: 'warning'
                });

                const yesterday = new Date();
                yesterday.setTime(yesterday.getTime() - 86400000); // CHANGED HERE
                const yesterdayFormatted = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
                setOneTimeDate(yesterdayFormatted);
            } else {
                setOneTimeDate(formattedDate);
            }
        } else {
            setOneTimeDate(formattedDate);
        }
    };

    const handleFilesOlderDateChange = (date) => {
        const formattedDate = validateAndFormatDate(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const parts = formattedDate.split('/');

        if (parts.length === 3) {
            const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
            selectedDate.setHours(0, 0, 0, 0);

            // For "Files older than" - only PAST dates are allowed
            if (selectedDate > today) {
                // Calculate yesterday
                const yesterday = new Date();
                yesterday.setTime(yesterday.getTime() - 86400000);
                yesterday.setHours(0, 0, 0, 0);
                const yesterdayFormatted = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;

                // Force update
                setFilesOlderThanDate('');
                setTimeout(() => {
                    setFilesOlderThanDate(yesterdayFormatted);
                }, 0);

                setLastFilesOlderDateWasValid(false);
                return;
            } else {
                // Valid date (today or past)
                setFilesOlderThanDate(formattedDate);
                setLastFilesOlderDateWasValid(true);
            }
        } else {
            setFilesOlderThanDate(formattedDate);
        }
    };

    useEffect(() => {
        if (tagMasterData && tagMasterData.length > 0) {
            // Extract tag names for rule name dropdown
            const tagNames = tagMasterData.map(tag => ({
                RuleName: tag.sTagName,
                RuleID: tag.sTagID
            }));
            setRuleNameOptions(tagNames);
        } else {
            setRuleNameOptions([]);
        }
    }, [tagMasterData]);

    useEffect(() => {
        const handleGlobalClick = () => {
            if (showDelimiterSelector) {
                setShowDelimiterSelector(false);
            }
            if (showMetadataTooltip !== null) {
                setShowMetadataTooltip(null);
            }
        };

        document.addEventListener('click', handleGlobalClick);

        return () => {
            document.removeEventListener('click', handleGlobalClick);
        };
    }, [showDelimiterSelector, showMetadataTooltip]);

    useEffect(() => {
        if (isSchedulerMetadataEnabled && selectedTemplate) {
            console.log("Loading tags for template:", selectedTemplate);
            loadTagMaster(selectedTemplate);

            // Also set the first tag as default selection if needed
            if (tagMasterData.length > 0 && !selectedRuleName) {
                setSelectedRuleName(tagMasterData[0].sTagID);
            }
        }
    }, [isSchedulerMetadataEnabled, selectedTemplate]);

    useEffect(() => {
        // Validate when sample filename or delimiter changes
        // CHANGED: Check for 'File' not 'Filename'
        if (tagMasterData.some(tag => tag.sSourceFlag === 'File')) {
            const hasFilenameError = !sampleFilename.trim() ||
                !sampleFilename.includes('.') ||
                sampleFilename.lastIndexOf('.') >= sampleFilename.length - 1;

            const hasDelimiterError = !selectedDelimiters.length;

            setSampleFilenameError(hasFilenameError);
            setDelimiterError(hasDelimiterError);
        }
    }, [sampleFilename, selectedDelimiters, tagMasterData]);

    const loadScheduleForEditing = useCallback(async (viewData, scheduleId, isReadOnly = false) => {
        console.log('loadScheduleForEditing called with:', { viewData, scheduleId, isReadOnly });

        try {
            setFullPageLoading(true);

            // Extract data from response
            const viewLoad = viewData.ViewLoad || {};
            const viewDatas = viewData.ViewDatas || {};
            const pathExtractObj = viewData.PathExtractObj || [];
            const pathExtractRules = viewData.PathExtractRules || [];

            console.log('Extracted view data:', { viewLoad, viewDatas, pathExtractObj, pathExtractRules });

            // Set view mode
            // setMode('view');
            // setIsViewMode(true);
            // setIsReadOnly(isReadOnly);
            if (isReadOnly) {
                // VIEW MODE
                setMode('view');
                setIsViewMode(true);
                setIsReadOnly(true);
            } else {
                // EDIT MODE
                setMode('edit');      // <-- SET TO 'edit'
                setIsViewMode(false); // <-- SET TO false
                setIsReadOnly(false);
            }

            // ============================================
            // 1. CLIENT - Load and Select
            // ============================================
            if (viewLoad.sClientID) {
                const clientId = viewLoad.sClientID.trim();
                setSelectedClient(clientId);
                setClientError(false);
                await loadInstruments(clientId);
            }

            // Wait for instruments to load
            await new Promise(resolve => setTimeout(resolve, 500));

            // ============================================
            // 2. INSTRUMENT - Select from loaded options
            // ============================================
            if (viewDatas.l13InstrumentMappingID) {
                const instrumentMappingId = viewDatas.l13InstrumentMappingID.trim();
                setSelectedInstrument(instrumentMappingId);
                setInstrumentError(false);

                const instrumentObj = instrumentOptions.find(
                    inst => inst.L12InstrumentMappingID === instrumentMappingId
                );

                if (instrumentObj) {
                    await loadMethods(instrumentObj);
                }
            }

            // Wait for methods to load
            await new Promise(resolve => setTimeout(resolve, 300));

            // ============================================
            // 3. METHOD - Select method
            // ============================================
            if (viewDatas.l13MethodName) {
                const methodName = viewDatas.l13MethodName.trim();
                if (viewDatas.sInstMethodName === "[DYNAMIC_METHOD]") {
                    setSelectedMethod(methodName);
                } else if (viewDatas.sInstMethodName === "null - DEFAULT") {
                    setSelectedMethod("");
                } else {
                    setSelectedMethod(methodName);
                }
                setMethodError(false);
            }

            // ============================================
            // 4. SOURCE PATH - UNC or Local
            // ============================================
            if (viewDatas.l13UNCStatus === true || viewDatas.l13UNCStatus === 1) {
                // UNC Path
                setIsUNCPathEnabled(true);
                setUncPath(viewDatas.l13SourcePath || '');
                setUncUsername(viewDatas.l13UNCUserName || '');
                setUncPassword(viewDatas.l13UNCPassword || '');

                // Set UNC Domain
                if (viewDatas.l13UNCDomain) {
                    setSelectedDomain(viewDatas.l13UNCDomain.trim());
                }

                setSourcePath(''); // Clear local path
            } else {
                // Local Path
                setIsUNCPathEnabled(false);
                setSourcePath(viewDatas.l13SourcePath || '');
                setUncPath('');
                setUncUsername('');
                setUncPassword('');
            }

            // ============================================
            // 5. DESTINATION
            // ============================================
            if (viewDatas.l13FTPID) {
                const ftpId = viewDatas.l13FTPID.trim();
                setSelectedDestination(ftpId);
                setDestinationError(false);
            }

            // ============================================
            // 6. FILTER
            // ============================================
            setFilter(viewDatas.l13FileFilter || '*.*');
            setFilterError(false);

            // ============================================
            // 7. UPLOAD POLICY - Subfolder Settings
            // ============================================
            if (viewDatas.l13SubDirectory === true || viewDatas.l13SubDirectory === 1) {
                setIncludeSubfolder(true);

                if (viewDatas.l13Level === 0 && viewDatas.l13DataArchiveMode === false) {
                    setCompleteTree(true);
                    setLevelEnabled(false);
                    setLevelValue('');
                } else {
                    setCompleteTree(false);
                    setLevelEnabled(true);
                    setLevelValue(viewDatas.l13Level?.toString() || '');
                }
            } else {
                setIncludeSubfolder(false);
                setCompleteTree(false);
                setLevelEnabled(false);
                setLevelValue('');
            }

            // ============================================
            // 8. COPY/MOVE FILES
            // ============================================
            if (viewDatas.l13MovePermenently === true || viewDatas.l13MovePermenently === 1) {
                setMoveFiles(true);
                setCopyFiles(false);
                setDeleteLocalCopy(false);
                setFilesOlderThanEnabled(false);
                setFilesOlderThanDateEnabled(false);
            } else {
                setCopyFiles(true);
                setMoveFiles(false);
            }

            // ============================================
            // 9. DELETE LOCAL COPY
            // ============================================
            if (viewDatas.l13DeleteLocalCopy === true || viewDatas.l13DeleteLocalCopy === 1) {
                setDeleteLocalCopy(true);

                if (viewDatas.l13OlderFileType === false || viewDatas.l13OlderFileType === 0) {
                    // Number-based deletion
                    setFilesOlderThanEnabled(true);
                    setFilesOlderThanDateEnabled(false);
                    setFilesOlderDays(viewDatas.l13OlderFileNO?.toString() || '');
                    setFilesOlderDaysUnit(viewDatas.l13OlderFileNoType || 'Days');
                } else {
                    // Date-based deletion
                    setFilesOlderThanEnabled(false);
                    setFilesOlderThanDateEnabled(true);
                    setFilesOlderThanDate(viewDatas.l13OlderFileDate || '');
                }

                // Set local delete mode
                const localDeleteValue = viewDatas.l13AutoLocalDeleteStatus === true ||
                    viewDatas.l13AutoLocalDeleteStatus === 1 ? 1 : 0;
                setLocalDeleteMode(localDeleteValue);
            } else {
                setDeleteLocalCopy(false);
                setFilesOlderThanEnabled(false);
                setFilesOlderThanDateEnabled(false);
            }

            // ============================================
            // 10. TRIGGER DATE/TIME
            // ============================================
            if (viewDatas.l13StartDate) {
                setTriggerDate(viewDatas.l13StartDate);
            }
            if (viewDatas.l13TriggerTime) {
                setTriggerTime(viewDatas.l13TriggerTime);
            }

            // ============================================
            // 11. EXPIRY DATE/TIME
            // ============================================
            if (viewDatas.l13EndDate) {
                setExpiryEnabled(true);
                setExpiryDate(viewDatas.l13EndDate);
                setExpiryTime(viewDatas.l13EndTime || '00:00:00');
            } else {
                setExpiryEnabled(false);
            }

            // ============================================
            // 12. SCHEDULE MODE
            // ============================================
            if (viewDatas.l13LiveArchive === true || viewDatas.l13LiveArchive === 1) {
                // Live Capture Mode
                setLiveCapture(true);

                if (viewDatas.l13VersionPolicy === '0') {
                    setLiveCaptureVersioning(true);
                    setOneVersionPerDay(false);
                    setScheduleWithVersioning(false);
                } else if (viewDatas.l13VersionPolicy === '1') {
                    setLiveCaptureVersioning(false);
                    setOneVersionPerDay(true);
                    setScheduleWithVersioning(false);
                } else {
                    setLiveCaptureVersioning(false);
                    setOneVersionPerDay(false);
                    setScheduleWithVersioning(true);
                }
            } else {
                // Schedule Mode
                setLiveCapture(false);

                const scheduleMode = viewDatas.l13ScheduleMode?.trim();

                if (scheduleMode === 'O') {
                    // One Time
                    setOneTime(true);
                    setDaily(false);
                    setWeekly(false);
                    setMonthly(false);
                    setOneTimeDate(viewDatas.l13OneTimeDate || '');
                } else if (scheduleMode === 'D') {
                    // Daily
                    setDaily(true);
                    setOneTime(false);
                    setWeekly(false);
                    setMonthly(false);
                    setDailyEveryDays(viewDatas.l13DateInterval?.toString() || '0');
                    setDailyEveryHours(Math.floor((viewDatas.l13TimeInterval || 0) / 60).toString());
                    setDailyEveryMinutes(((viewDatas.l13TimeInterval || 0) % 60).toString());
                    setDailyRepeatTask(viewDatas.l13DayRepeatStatus === true || viewDatas.l13DayRepeatStatus === 1);
                } else if (scheduleMode === 'W') {
                    // Weekly
                    setWeekly(true);
                    setOneTime(false);
                    setDaily(false);
                    setMonthly(false);

                    // Parse weekly days
                    const activeDays = viewDatas.l13ActiveDaysWeekly || '0000000';
                    setWeeklyDays({
                        Sunday: activeDays[0] === '1',
                        Monday: activeDays[1] === '1',
                        Tuesday: activeDays[2] === '1',
                        Wednesday: activeDays[3] === '1',
                        Thursday: activeDays[4] === '1',
                        Friday: activeDays[5] === '1',
                        Saturday: activeDays[6] === '1'
                    });
                } else if (scheduleMode === 'M') {
                    // Monthly
                    setMonthly(true);
                    setOneTime(false);
                    setDaily(false);
                    setWeekly(false);

                    // Parse active months
                    const activeMonths = viewDatas.l13ActiveMonth || '000000000000';
                    const selectedMonths = [];
                    monthOptions.forEach((month, index) => {
                        if (activeMonths[index] === '1') {
                            selectedMonths.push(month.Month);
                        }
                    });
                    setMonthlySelectedMonths(selectedMonths);



                    // Parse day/week selection
                    const statusType = viewDatas.l13StatusMonthDaysOrWeek?.trim();

                    if (statusType === 'Days') {
                        // Day toggle is ON
                        setMonthlyDayToggle(true);
                        setMonthlyOnToggle(false);

                        // Parse selected days
                        const activeDays = viewDatas.l13ActiveMonthlydays || '';
                        const selectedDays = [];
                        if (activeDays && activeDays.length === 31) {
                            for (let i = 0; i < 31; i++) {
                                if (activeDays[i] === '1') {
                                    selectedDays.push(i + 1);
                                }
                            }
                        }
                        setMonthlySelectedDays(selectedDays);

                        // Clear week/weekday selections
                        setMonthlySelectedWeeks([]);
                        setMonthlySelectedWeekdays([]);
                    } else {
                        // On toggle is ON (Week mode)
                        setMonthlyDayToggle(false);
                        setMonthlyOnToggle(true);

                        // Parse weeks
                        const activeWeeks = viewDatas.l13ActiveWeekNoMonthly || '00000';
                        const selectedWeeks = [];
                        if (activeWeeks && activeWeeks.length === 5) {
                            for (let i = 0; i < 5; i++) {
                                if (activeWeeks[i] === '1') {
                                    const weekOption = weekOptions[i];
                                    if (weekOption) {
                                        selectedWeeks.push(weekOption.weeks);
                                    }
                                }
                            }
                        }
                        setMonthlySelectedWeeks(selectedWeeks);

                        // Parse weekdays
                        const activeWeekdays = viewDatas.l13ActiveDayOfWeekMonthly || '0000000';
                        const selectedWeekdays = [];
                        if (activeWeekdays && activeWeekdays.length === 7) {
                            for (let i = 0; i < 7; i++) {
                                if (activeWeekdays[i] === '1') {
                                    const weekdayOption = weekdayOptions[i];
                                    if (weekdayOption) {
                                        selectedWeekdays.push(weekdayOption.days);
                                    }
                                }
                            }
                        }
                        setMonthlySelectedWeekdays(selectedWeekdays);

                        // Clear day selections
                        setMonthlySelectedDays([]);
                    }
                }

                // Set versioning for schedule mode
                if (viewDatas.l13VersionPolicy === '0' || viewDatas.l13VersionPolicy === 0) {
                    setScheduleWithVersioning(true);
                } else {
                    setScheduleWithVersioning(false);
                }
            }

            // ============================================
            // 13. POLICIES
            // ============================================
            setApplyDeletePolicy(viewDatas.l13FileDeleteVersionPolicy === true || viewDatas.l13FileDeleteVersionPolicy === 1);

            const serverDeleteValue = viewDatas.l13AutoServerDeleteStatus === true ||
                viewDatas.l13AutoServerDeleteStatus === 1 ? 1 : 0;
            setServerDeleteMode(serverDeleteValue);

            setEnableFileLink(viewDatas.l13FileLinkStatus === true || viewDatas.l13FileLinkStatus === 1);

            // File Audit
            if (viewDatas.l52EnableVerAudit === true || viewDatas.l52EnableVerAudit === 1) {
                setEnableFileAudit(true);
                setAuditFilter(viewDatas.l52AuditFilter || '*.*');
            } else {
                setEnableFileAudit(false);
            }

            // Data Logger
            setDataLogger(viewDatas.nDataLoggerStatus === 1 || viewDatas.nDataLoggerStatus === true);
            setArchivalDays(viewDatas.nDataLoggerArchivalDays?.toString() || '');
            // ============================================
            // 14. SCHEDULER METADATA - COMPLETE REWRITE BASED ON JQUERY CODE
            // ============================================
            if (pathExtractObj && pathExtractObj.length > 0) {
                console.log("Loading Scheduler Metadata from PathExtractObj:", pathExtractObj);

                // Enable scheduler metadata
                setIsSchedulerMetadataEnabled(true);

                // Set template - use the template ID from PathExtractObj
                if (pathExtractObj[0]?.sTemplateID) {
                    const templateId = pathExtractObj[0].sTemplateID.trim();
                    console.log("Setting template from PathExtractObj:", templateId);
                    setSelectedTemplate(templateId);

                    // Load tag master for this template
                    await loadTagMaster(templateId);
                }

                // Set sample filename
                if (pathExtractObj[0]?.sExamplefilename) {
                    const filename = pathExtractObj[0].sExamplefilename;
                    console.log("Setting sample filename:", filename);
                    setSampleFilename(filename);
                }

                // Set delimiters - using jQuery logic
                if (pathExtractObj[0]?.sFileDelimiter) {
                    const delimiters = pathExtractObj[0].sFileDelimiter;
                    console.log("Setting delimiters:", delimiters);

                    if (delimiters.toUpperCase() === 'NONE') {
                        setSelectedDelimiters(['NONE']);
                    } else if (delimiters !== "") {
                        // Split delimiter string into characters
                        const delimiterChars = delimiters.split("");
                        // Map characters to delimiter names
                        const delimiterNames = delimiterChars.map(char => {
                            const delimiterObj = delimiterOptions.find(d => d.sDelimiter === char);
                            return delimiterObj ? delimiterObj.sDelimiterName : char;
                        });
                        setSelectedDelimiters(delimiterNames);
                    }
                }

                // ============================================
                // PROCESS TAG MASTER DATA WITH JQUERY LOGIC
                // ============================================
                // Wait for tag master to load
                await new Promise(resolve => setTimeout(resolve, 500));

                console.log("Processing PathExtractObj for tag grid with jQuery logic:");

                // In loadScheduleForEditing function, update the tag processing section:

                const processedTagData = pathExtractObj.map((tag, index) => {
                    // 1. Use sSourceFlag directly from API - it should be "File", "Folder", or "NONE"
                    let sourceFlag = tag.sSourceFlag || 'NONE';

                    console.log(`Tag ${index} (${tag.sTagName}):`, {
                        sSourceFlag: sourceFlag,
                        sValue: tag.sValue,
                        sValueID: tag.sValueID,
                        sDataIndex: tag.sDataIndex
                    });

                    // 2. Determine metadata based on jQuery logic
                    let metadataValue = '';

                    // JQUERY LOGIC: Check if sValue is empty OR sValueID is empty/null
                    if (!tag.sValue || tag.sValue === "" || !tag.sValueID || tag.sValueID === "" || tag.sValueID === null) {
                        console.log(`Tag ${index}: sValue or sValueID is empty, checking for File processing`);

                        // If source is "File", parse from filename using sDataIndex
                        if (sourceFlag === 'File' && tag.sDataIndex) {
                            const dataIndex = tag.sDataIndex.trim();
                            console.log(`Tag ${index}: Processing File with sDataIndex: ${dataIndex}`);

                            if (pathExtractObj[0]?.sExamplefilename && pathExtractObj[0]?.sFileDelimiter) {
                                const samplefilename = pathExtractObj[0].sExamplefilename;
                                const delimiter = pathExtractObj[0].sFileDelimiter;

                                console.log(`Parsing filename: ${samplefilename} with delimiter: ${delimiter}`);

                                // Split filename with extension
                                const { splitpath, lastDot, extension } = SplitFilenamewithExt(samplefilename, delimiter);

                                // Create array of all parts including extension
                                const allParts = [...splitpath];
                                if (lastDot > -1 && extension) {
                                    allParts.push(extension);
                                }

                                console.log(`All parsed parts:`, allParts);

                                // Handle negative indices (like "-1" for extension)
                                let indexNum;
                                if (dataIndex.startsWith('-')) {
                                    // Negative index: -1 means last element (extension), -2 means second last, etc.
                                    indexNum = allParts.length + parseInt(dataIndex);
                                } else {
                                    // Positive index: 0 means first element, 1 means second, etc.
                                    indexNum = parseInt(dataIndex);
                                }

                                console.log(`Computed index: ${indexNum} from dataIndex: ${dataIndex}`);

                                if (!isNaN(indexNum) && indexNum >= 0 && indexNum < allParts.length) {
                                    metadataValue = allParts[indexNum];
                                    console.log(`Found metadata: ${metadataValue}`);
                                } else {
                                    console.warn(`Invalid index ${indexNum} for parts length ${allParts.length}`);
                                }
                            }
                        }
                        // For Folder or NONE with empty sValue, keep it empty
                        else if (sourceFlag === 'Folder' || sourceFlag === 'NONE') {
                            metadataValue = tag.sValue || ''; // Use sValue if available, otherwise empty
                            console.log(`Tag ${index}: ${sourceFlag} with empty sValue, setting metadata to: "${metadataValue}"`);
                        }
                    } else {
                        // sValue is NOT empty - use it directly
                        metadataValue = tag.sValue;
                        console.log(`Tag ${index}: Using sValue directly: ${metadataValue}`);
                    }

                    // 3. CREATE FINAL TAG OBJECT
                    const processedTag = {
                        ...tag,
                        sSourceFlag: sourceFlag,
                        sTextData: metadataValue,
                        // Store original values for reference
                        original: {
                            sValue: tag.sValue,
                            sValueID: tag.sValueID,
                            sDataIndex: tag.sDataIndex,
                            sSourceFlag: tag.sSourceFlag,
                        }
                    };

                    console.log(`Tag ${index} FINAL:`, {
                        name: processedTag.sTagName,
                        sourceFlag: processedTag.sSourceFlag,
                        metadata: processedTag.sTextData,
                        original: processedTag.original
                    });

                    return processedTag;
                });

                console.log("Final processed tag data:", processedTagData);
                setTagMasterData(processedTagData);

                // ADD THIS LINE - Auto-select first row
                setSelectedTagRowIndex(0);

                // Set the first tag as selected rule name
                if (processedTagData.length > 0) {
                    const firstTagId = processedTagData[0].sTagID?.toString();
                    console.log("Setting first tag as rule name:", firstTagId);
                    setSelectedRuleName(firstTagId);
                }

                // ============================================
                // PROCESS RULES GRID
                // ============================================
                if (pathExtractRules && pathExtractRules.length > 0) {
                    console.log("Loading rules from PathExtractRules:", pathExtractRules);

                    const loadedRules = pathExtractRules.map((rule, index) => {
                        // Parse the sConditions JSON string
                        let parsedCondition = {};
                        let ruleName = '';
                        let tagName = '';

                        try {
                            parsedCondition = JSON.parse(rule.sConditions);
                            console.log(`Parsed rule ${index}:`, parsedCondition);

                            // Get rule name from parsed condition
                            ruleName = parsedCondition.sRuleName || parsedCondition.sTagName || '';
                            tagName = parsedCondition.sTagName || '';
                        } catch (e) {
                            console.error("Failed to parse rule condition:", e, rule.sConditions);
                        }

                        // If no name found, use tag ID to find in tagMasterData
                        if (!ruleName && rule.sRuleTagID) {
                            const tag = processedTagData.find(t => t.sTagID === rule.sRuleTagID);
                            ruleName = tag ? tag.sTagName : `Tag ${rule.sRuleTagID}`;
                            tagName = tag ? tag.sTagName : tagName;
                        }

                        return {
                            id: Date.now() + index,
                            ruleName: rule.sRuleTagID?.toString(),  // Store ID for dropdown
                            ruleNameDisplay: ruleName,              // Store display name
                            metadata: parsedCondition.sMetadataType || '',
                            tagName: tagName,                       // Actual tag name
                            relationalOp: parsedCondition.srelationaloperator || '=',
                            fieldValue: parsedCondition.sfieldvalue || '',
                            // Store original for debugging
                            originalRule: rule
                        };
                    });

                    console.log("Loaded rules for grid:", loadedRules);
                    setRuleGridData(loadedRules);
                }
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
            setErrorDialog({
                isOpen: true,
                message: t("scheduler.failedtoloadscheduledata"),
                type: 'error'
            });
        } finally {
            setFullPageLoading(false);
        }
    }, [instrumentOptions, delimiterOptions, loadInstruments, loadMethods, loadTagMaster, monthOptions, weekOptions, weekdayOptions]);

    // useEffect(() => {
    //     if (!navigationState?.data || isHandlingNavigation) return;

    //     const navData = navigationState.data;
    //     const actualData = navData.data || navData;

    //     if (actualData.fromCloseAction) {
    //         console.log('Skipping - came from close');
    //         return;
    //     }

    //     if (actualData.innerTab && actualData.innerTab !== 'Data Scheduler') {
    //         return;
    //     }

    //     if (actualData.viewMode && actualData.viewData) {
    //         setIsHandlingNavigation(true);

    //         console.log('Starting navigation processing');

    //         setNavigationSource({
    //             component: actualData.sourceComponent || navData.sourceComponent,
    //             scheduleId: actualData.scheduleId,
    //             innerTab: actualData.innerTab // Add this to track inner tab
    //         });

    //         // Set mode based on source
    //         if (actualData.sourceComponent === 'EditTask') {
    //             setIsViewMode(false);
    //             setMode('edit');
    //         } else {
    //             setIsViewMode(true);
    //             setMode('view');
    //         }

    //         // Load schedule data
    //         loadScheduleForEditing(actualData.viewData, actualData.scheduleId)
    //             .then(() => {
    //                 console.log('Navigation processing complete');
    //             })
    //             .finally(() => {
    //                 // Clear navigation after processing
    //                 setTimeout(() => {
    //                     if (clearNavigation) {
    //                         clearNavigation();
    //                     }
    //                     setIsHandlingNavigation(false);
    //                 }, 300);
    //             });
    //     }
    // }, [navigationState, clearNavigation, loadScheduleForEditing, isHandlingNavigation]);

    useEffect(() => {
        if (!navigationState?.data || isHandlingNavigation) return;

        const navData = navigationState.data;
        const actualData = navData.data || navData;

        if (actualData.viewMode || actualData.isEdit) {
            // FIX: Properly set mode based on isEdit flag
            if (actualData.isEdit) {
                setIsViewMode(false);  // NOT view mode
                setMode('edit');       // EDIT mode
            } else if (actualData.viewMode) {
                setIsViewMode(true);   // VIEW mode
                setMode('view');       // VIEW mode
            }
        }

        console.log('=== DataScheduler Navigation Handler ===');
        console.log('actualData:', actualData);

        if (actualData.fromCloseAction) {
            console.log('Skipping - came from close');
            return;
        }

        // FIX: Allow both Edit Task and Data Scheduler
        if (actualData.innerTab &&
            actualData.innerTab !== 'Data Scheduler' &&
            actualData.innerTab !== 'Edit Task') {
            console.log('Skipping - wrong innerTab:', actualData.innerTab);
            return;
        }

        // FIX: Check for EITHER viewMode OR isEdit
        const shouldLoadData = (actualData.viewMode || actualData.isEdit) && actualData.viewData;

        console.log('Should load data?', shouldLoadData);
        console.log('viewMode:', actualData.viewMode);
        console.log('isEdit:', actualData.isEdit);
        console.log('has viewData:', !!actualData.viewData);

        // if (shouldLoadData) {
        //     setIsHandlingNavigation(true);

        //     console.log('Starting navigation processing');

        //     setNavigationSource({
        //         component: actualData.sourceComponent || navData.sourceComponent,
        //         scheduleId: actualData.scheduleId,
        //         innerTab: actualData.innerTab
        //     });

        //     // FIX: Set mode based on isEdit flag
        //     if (actualData.isEdit) {
        //         setIsViewMode(false);
        //         setMode('edit');
        //         console.log('Setting mode to EDIT');
        //     } else if (actualData.viewMode) {
        //         setIsViewMode(true);
        //         setMode('view');
        //         console.log('Setting mode to VIEW');
        //     }

        //     // Load schedule data
        //     loadScheduleForEditing(actualData.viewData, actualData.scheduleId, actualData.viewMode && !actualData.isEdit)
        //         .then(() => {
        //             console.log('Navigation processing complete');
        //         })
        //         .finally(() => {
        //             // Clear navigation after processing
        //             setTimeout(() => {
        //                 if (clearNavigation) {
        //                     clearNavigation();
        //                 }
        //                 setIsHandlingNavigation(false);
        //             }, 300);
        //         });
        // }
        // Around line 1191-1242, update this section:
        if (shouldLoadData) {
            setIsHandlingNavigation(true);

            console.log('Starting navigation processing');

            setNavigationSource({
                component: actualData.sourceComponent || navData.sourceComponent,
                scheduleId: actualData.scheduleId,
                innerTab: actualData.innerTab
            });

            // FIX: Properly set mode based on sourceComponent
            if (actualData.sourceComponent === 'EditTask' || actualData.isEdit === true) {
                setIsViewMode(false);
                setIsReadOnly(false);  // ← Add this
                setMode('edit');
                console.log('Setting mode to EDIT (editable)');
            } else if (actualData.viewMode) {
                setIsViewMode(true);
                setIsReadOnly(true);  // ← Add this
                setMode('view');
                console.log('Setting mode to VIEW (read-only)');
            }

            // Load schedule data - pass false for isReadOnly in edit mode
            const isReadOnlyMode = actualData.viewMode && !actualData.isEdit;
            loadScheduleForEditing(actualData.viewData, actualData.scheduleId, isReadOnlyMode)
                .then(() => {
                    console.log('Navigation processing complete');
                })
                .finally(() => {
                    setTimeout(() => {
                        if (clearNavigation) {
                            clearNavigation();
                        }
                        setIsHandlingNavigation(false);
                    }, 300);
                });
        }
    }, [navigationState, clearNavigation, loadScheduleForEditing, isHandlingNavigation]);

    useEffect(() => {
        loadCombos();
    }, []);
    useEffect(() => {
        console.log('=== DEBUG MODE STATE ===');
        console.log('mode:', mode);
        console.log('isViewMode:', isViewMode);
        console.log('isReadOnly:', isReadOnly);
        console.log('Navigation state:', navigationState);
        console.log('Navigation source:', navigationSource);
    }, [mode, isViewMode, isReadOnly]);

    // Add this useEffect in DataScheduler
    useEffect(() => {
        console.log('=== CHECKING NAVIGATION FOR MODE ===');
        console.log('Navigation source:', navigationSource);
        console.log('Current mode:', mode);
        console.log('isViewMode:', isViewMode);

        // If we have navigation source and it's from EditTask, force mode to 'edit'
        if (navigationSource?.component === 'EditTask' && mode === 'create') {
            console.log('Force setting mode to edit');
            setMode('edit');
            setIsViewMode(false);
        }
    }, [navigationSource, mode]);

    // Track if NONE is selected
    useEffect(() => {
        setIsNoneSelected(selectedDelimiters.includes('NONE'));
    }, [selectedDelimiters]);

    // Auto-select first row when data is added
    useEffect(() => {
        if (ruleGridData.length > 0 && selectedRowId === null) {
            setSelectedRowId(ruleGridData[0].id);
        } else if (ruleGridData.length === 0) {
            setSelectedRowId(null);
        }
    }, [ruleGridData]);


    useEffect(() => {
        const handleClickOutside = (e) => {

            const tagNameDropdown = document.querySelector('.tag-name-dropdown');
            const titleText = t("scheduler.selecttagname");
            const tagNameButton = document.querySelector(`[title="${titleText}"]`);

            if (showTagNameSelector &&
                tagNameDropdown && !tagNameDropdown.contains(e.target) &&
                tagNameButton && !tagNameButton.contains(e.target)) {
                setShowTagNameSelector(false);
                setTagNameSearchTerm('');
            }
        };

        if (showTagNameSelector) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTagNameSelector]);


    useEffect(() => {
        const handleClickOutside = (e) => {
            const relOpDropdown = document.querySelector('.rel-op-dropdown');
            const titleText = t("scheduler.selectrelationaloperator");
            const relOpButton = document.querySelector(`[title="${titleText}"]`);

            if (showRelOpSelector &&
                relOpDropdown && !relOpDropdown.contains(e.target) &&
                relOpButton && !relOpButton.contains(e.target)) {
                setShowRelOpSelector(false);
                setRelOpSearchTerm('');
            }
        };

        if (showRelOpSelector) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRelOpSelector]);

    // Validate sample filename and delimiter when File rows are present
    useEffect(() => {
        const hasFileRows = tagMasterData.some(tag => tag.sSourceFlag === 'File');

        if (hasFileRows) {
            // Only validate if we're in File mode
            if (!sampleFilename.trim()) {
                setSampleFilenameError(true);
            } else {
                const hasExtension = sampleFilename.includes('.') &&
                    sampleFilename.lastIndexOf('.') < sampleFilename.length - 1;
                if (!hasExtension) {
                    setSampleFilenameError(true);
                } else {
                    setSampleFilenameError(false);
                }
            }

            if (!selectedDelimiters.length) {
                setDelimiterError(true);
            } else {
                setDelimiterError(false);
            }
        } else {
            // No File rows, clear errors
            setSampleFilenameError(false);
            setDelimiterError(false);
        }
    }, [tagMasterData, sampleFilename, selectedDelimiters]);

    // Add this useEffect to reset Scheduler Metadata section when toggled
    useEffect(() => {
        if (!isSchedulerMetadataEnabled) {
            // Reset all Scheduler Metadata fields when unchecked
            setSelectedTemplate(templateOptions.length > 0 ? templateOptions[0].sTemplateID : '');
            setSampleFilename('');
            setSelectedDelimiters([]);
            setTempSelectedDelimiters([]);
            setDelimiterSearchTerm('');
            setShowDelimiterSelector(false);
            setIsNoneSelected(false);
            setSampleFilenameError(false);
            setDelimiterError(false);
            setTemplateError(false);
            setSampleFilenameError(false);
            setDelimiterError(false);
            setShowMetadataTooltip(null);
            setParsedMetadata([]);
            setTagMasterData([]);
            setTagRowErrors([]);
            setSelectedTagRowIndex(null);

            // Reset Rule section
            setSelectedRuleName('');
            setRuleNameOptions([]);
            setRuleGridData([]);
            setSelectedRowId(null);
            setNewRuleMetadata('');
            setNewRuleTagName('');
            setNewRuleRelationalOp('');
            setNewRuleFieldValue('');
            setTagNameSearchTerm('');
            setRelOpSearchTerm('');
            setShowTagNameSelector(false);
            setShowRelOpSelector(false);
            setRuleGridError(false);
        } else {
            // When enabled, load the first template's data if available
            if (templateOptions.length > 0 && selectedTemplate) {
                loadTagMaster(selectedTemplate);
            }

            if (tagMasterData.length > 0) {
                setSelectedTagRowIndex(0);
            }
        }
    }, [isSchedulerMetadataEnabled]);

    // Scroll Handler (Manual Calculation to prevent Header movement)
    //recently
    const scrollToSection = (ref, tabName) => {
        setActiveTab(tabName);

        if (ref.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const element = ref.current;

            // Get positions relative to the viewport
            const elementRect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const offsetPosition = container.scrollTop + (elementRect.top - containerRect.top) - 20;

            container.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };
    //recently commented
    // const handleTagRowDataChange = (rowIndex, sourceFlag, metadata) => {
    //     setTagMasterData(prev => {
    //         const updated = [...prev];
    //         updated[rowIndex] = {
    //             ...updated[rowIndex],
    //             sSourceFlag: sourceFlag,
    //             sTextData: metadata
    //         };
    //         return updated;
    //     });
    // };

    const handleTagRowDataChange = (rowIndex, sourceFlag, metadata) => {
        setTagMasterData(prev => {
            const updated = [...prev];
            const previousSourceFlag = updated[rowIndex].sSourceFlag;

            updated[rowIndex] = {
                ...updated[rowIndex],
                sSourceFlag: sourceFlag,
                sTextData: metadata
            };

            // Check if we're switching away from File
            if (previousSourceFlag === 'File' && sourceFlag !== 'File') {
                // Check if any other rows still have File
                const hasOtherFileRows = updated.some((tag, idx) =>
                    idx !== rowIndex && tag.sSourceFlag === 'File'
                );

                if (!hasOtherFileRows) {
                    // No more File rows, clear errors
                    setSampleFilenameError(false);
                    setDelimiterError(false);
                }
            }

            return updated;
        });
    };

    const beautifyErrorMessage = (msg = '') => {
        if (!msg || typeof msg !== 'string') return t("error.somethingwentwrong");

        return msg
            // split acronym + word (Ftpconnection → Ftp connection)
            .replace(/([A-Z][a-z]+)([a-z]+)/, '$1 $2')
            // split camelCase words
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            // normalize FTP to uppercase
            .replace(/\bftp\b/gi, 'FTP')
            // capitalize first letter
            .replace(/^./, c => c.toUpperCase());
    };

    // const handleUpdate = async () => {
    //     console.log("=== UPDATE STARTED ===");

    //     const userDetails = CF_activeUserdetails();
    //     let passObjDet = {};
    //     let hasErrors = false;
    //     let IsEmpty = false;
    //     let errorSections = [];

    //     // ========== PHASE 1: VALIDATION (Same as before) ==========
    //     // [Keep all your existing validation code here - lines 3674-3850]

    //     // ... (all your validation code stays the same) ...

    //     // ========== BUILD UPDATE REQUEST ==========
    //     console.log("--- Building Update Request Object ---");

    //     // **CRITICAL FIX 1: Set bExist to TRUE for update**
    //     passObjDet["bExist"] = true;  // ✅ CHANGED from false
    //     passObjDet["L13TaskID"] = navigationSource?.scheduleId;  // ✅ REQUIRED
    //     passObjDet["process"] = "edit";

    //     // **CRITICAL FIX 2: Add ALL instrument fields**
    //     passObjDet["L13EmpowerStatus"] = 0;


    //     // passObjDet["L13InstrumentMappingID"] = selectedInstrument.trim();

    //     // const Instrumentitem = instrumentOptions.find(inst =>
    //     //     inst.L12InstrumentMappingID === selectedInstrument
    //     // );
    //     // if (Instrumentitem) {
    //     //     passObjDet["L13InstrumentID"] = Instrumentitem.L12InstrumentID;  
    //     //     passObjDet["sInstrumentName"] = Instrumentitem.L11InstrumentName; 
    //     // }

    //     // // **CRITICAL FIX 3: Add destination text field**
    //     // passObjDet["L13FTPID"] = selectedDestination.trim();
    //     // const destinationItem = destinationOptions.find(d => d.L09FTPID === selectedDestination);
    //     // if (destinationItem) {
    //     //     passObjDet["L13FTPText"] = destinationItem.L09FTPAliasName;  // REQUIRED
    //     // }

    //     console.log("Selected Instrument:", selectedInstrument);
    //     console.log("Instrument Options:", instrumentOptions);

    //     passObjDet["L13InstrumentMappingID"] = selectedInstrument.trim();
    //     // Debug: See what properties exist
    //     console.log("Instrument Options Sample:", instrumentOptions[0]);
    //     // For Instrument
    //     const Instrumentitem = instrumentOptions.find(inst =>
    //         inst.L12InstrumentMappingID.trim() === selectedInstrument.trim()
    //     );

    //     console.log("Found Instrument Item:", Instrumentitem);

    //     if (Instrumentitem) {
    //         passObjDet["L13InstrumentID"] = Instrumentitem.L12InstrumentID.trim();
    //         passObjDet["sInstrumentName"] = Instrumentitem.L11InstrumentName.trim();
    //         console.log("Added L13InstrumentID:", Instrumentitem.L12InstrumentID.trim());
    //         console.log("Added sInstrumentName:", Instrumentitem.L11InstrumentName.trim());
    //     }

    //     // For Destination
    //     const destinationItem = destinationOptions.find(d =>
    //         d.L09FTPID.trim() === selectedDestination.trim()
    //     );

    //     console.log("Found Destination Item:", destinationItem);

    //     if (destinationItem) {
    //         passObjDet["L13FTPText"] = destinationItem.L09FTPAliasName.trim();
    //         console.log("Added L13FTPText:", destinationItem.L09FTPAliasName.trim());
    //     } else {
    //         console.error("Destination item NOT FOUND!");
    //     }
    //     // **CRITICAL FIX 4: Add method fields correctly**
    //     if (!isMethodDisabled) {
    //         const selectedMethodIndex = methodOptions.findIndex(m => m.InstMethodName === selectedMethod);
    //         if (selectedMethodIndex !== -1) {
    //             const selectedMethodItem = methodOptions[selectedMethodIndex];
    //             passObjDet["L13MethodName"] = selectedMethodItem.MethodName;
    //             passObjDet["L13ParserInstCode"] = selectedMethodItem.InstName;
    //             passObjDet["L13ParserMethodGroup"] = selectedMethodItem.MethodGroup;
    //         }
    //     } else {
    //         passObjDet["L13MethodName"] = "DEFAULT";
    //         passObjDet["L13ParserInstCode"] = "";  // ✅ Added
    //         passObjDet["L13ParserMethodGroup"] = "";  // ✅ Added
    //     }

    //     // Path settings
    //     if (!isUNCPathEnabled) {
    //         passObjDet["L13SourcePath"] = sourcePath;
    //         passObjDet["L13UNCStatus"] = 0;
    //     } else {
    //         passObjDet["L13SourcePath"] = uncPath.trim();
    //         passObjDet["L13UNCStatus"] = 1;
    //         passObjDet["L13UNCUserName"] = uncUsername.trim();
    //         passObjDet["L13UNCPassword"] = uncPassword.trim();

    //         const domainItem = domainOptions.find(d => d.L03DomainID === selectedDomain);
    //         passObjDet["L13UNCDomain"] = domainItem ? domainItem.L03DomainName : "";
    //     }

    //     // Filter
    //     passObjDet["L13FileFilter"] = filter;

    //     // [Keep all your other field mappings - schedules, policies, etc.]
    //     // ... (copy all the code from your handleSubmit for these fields) ...

    //     // **CRITICAL FIX 5: Set task status correctly for update**
    //     passObjDet["L13TaskStatus"] = "D";  // Keep deactivated status
    //     passObjDet["L13DayStatus"] = 1;
    //     passObjDet["L13TimeStatus"] = 1;
    //     passObjDet["L13CreatedBy"] = userDetails.ActiveUserDetails.sUserID;  // ✅ Keep original creator
    //     passObjDet["L13ModifiedBy"] = userDetails.ActiveUserDetails.sUserID;  // ✅ Set modifier
    //     passObjDet["L13TaskName"] = "Scheduler";
    //     passObjDet["L13WatcherFlag"] = 0;
    //     passObjDet["L13TaskCompleted"] = 0;

    //     // **CRITICAL FIX 6: Scheduler Metadata - Match jQuery exactly**
    //     if (isSchedulerMetadataEnabled) {
    //         const Delimeter = selectedDelimiters.length > 0
    //             ? ConcatenateDelimeterfromlist(selectedDelimiters, delimiterOptions)
    //             : "";

    //         passObjDet["L13FileDelimiter"] = Delimeter;
    //         passObjDet["L13Examplefilename"] = sampleFilename;
    //         passObjDet["L13SubfolderLevel"] = 0;
    //         passObjDet["L13Active"] = 1;
    //         passObjDet["L13TemplateID"] = selectedTemplate;
    //         passObjDet["L13ModifiedBy"] = userDetails.ActiveUserDetails.sUserID;

    //         // Process tag data EXACTLY like jQuery
    //         passObjDet["SchedulerExtractionlst"] = tagMasterData.map((tag, index) => {
    //             const sourceFlag = tag.sSourceFlag || 'NONE';
    //             const userValue = (tag.sTextData || '').trim();

    //             let sValue = "";
    //             let sValueID = "";
    //             let sDataIndex = "";

    //             if (sourceFlag === 'File') {
    //                 const { splitpath, lastDot, extension } = SplitFilenamewithExt(sampleFilename, Delimeter);
    //                 const allParts = [...splitpath];
    //                 if (lastDot > -1 && extension) {
    //                     allParts.push(extension);
    //                 }

    //                 const parsedIndex = allParts.findIndex(part => part === userValue);

    //                 if (parsedIndex !== -1) {
    //                     if (parsedIndex === allParts.length - 1 && extension) {
    //                         sValue = "-1";
    //                         sValueID = userValue;
    //                         sDataIndex = "-1";
    //                     } else {
    //                         sValue = parsedIndex.toString();
    //                         sValueID = userValue;
    //                         sDataIndex = parsedIndex.toString();
    //                     }
    //                 } else {
    //                     sValue = userValue;
    //                     sValueID = userValue;
    //                     sDataIndex = userValue;
    //                 }
    //             } else if (sourceFlag === 'Folder') {
    //                 sValue = userValue;
    //                 sValueID = userValue;
    //                 sDataIndex = userValue;
    //             } else {
    //                 // NONE
    //                 sValue = "";
    //                 sValueID = "";
    //                 sDataIndex = "";
    //             }

    //             const formattedTemplateID = selectedTemplate ?
    //                 `${selectedTemplate}       `.substring(0, 10) :
    //                 "          ";

    //             return {
    //                 sExtractionID: tag.original?.sExtractionID || null,  // ✅ Preserve original ID
    //                 sInstrumentID: tag.original?.sInstrumentID || null,
    //                 sScheduleID: tag.original?.sScheduleID || null,
    //                 sTemplateID: formattedTemplateID,
    //                 sTagID: tag.sTagID,
    //                 sSourceFlag: sourceFlag,
    //                 sExamplefilename: sampleFilename,
    //                 sFileDelimiter: Delimeter,
    //                 sDataIndex: sDataIndex,
    //                 sActive: 1,
    //                 sCreatedBy: tag.original?.sCreatedBy || null,
    //                 sCreatedOn: tag.original?.sCreatedOn || null,
    //                 sModifiedBy: userDetails.ActiveUserDetails.sUserID,
    //                 sModifiedOn: null,
    //                 sSiteCode: tag.original?.sSiteCode || null,
    //                 sValue: sValue,
    //                 sValueID: sValueID,
    //                 sTagName: tag.sTagName,
    //                 sSourcepath: isUNCPathEnabled ? uncPath.trim() : sourcePath,
    //                 sSubfolderLevel: 0,
    //                 uid: index,
    //                 boundindex: index,
    //                 uniqueid: `${Date.now()}-${index}`,
    //                 visibleindex: index,
    //                 sTextData: ""
    //             };
    //         });

    //         // Process rules EXACTLY like jQuery
    //         const pathExtractionRule = ruleGridData.map((rule, index) => {
    //             const ruleTag = tagMasterData.find(t =>
    //                 t.sTagID.toString() === rule.ruleName.toString()
    //             );

    //             const conditionObj = {
    //                 sRuleID: rule.originalRule?.sRuleID || 1,
    //                 sRuleTagID: parseInt(rule.ruleName),
    //                 sRuleName: ruleTag?.sTagName || rule.tagName,
    //                 sTagID: ruleTag?.sTagID || parseInt(rule.ruleName),
    //                 sTagName: rule.tagName,
    //                 srelationaloperator: rule.relationalOp,
    //                 sMetadataType: rule.metadata,
    //                 sfieldvalue: rule.fieldValue,
    //                 sConditionSeqNo: index + 1,
    //                 uid: index,
    //                 boundindex: index,
    //                 visibleindex: index
    //             };

    //             return {
    //                 L13TagID: parseInt(rule.ruleName),
    //                 L13TemplateID: selectedTemplate,
    //                 L13Conditions: JSON.stringify(conditionObj),
    //                 L13ConditionSeqNo: index + 1,
    //                 L13ModifiedBy: userDetails.ActiveUserDetails.sUserID,
    //                 L13RuleID: rule.originalRule?.sRuleID || 1,
    //                 L13Metadata: rule.metadata
    //             };
    //         });

    //         passObjDet["PathExtractionRule"] = pathExtractionRule;

    //         passObjDet["sConditionObj"] = pathExtractionRule.map(rule => ({
    //             L13Conditions: rule.L13Conditions
    //         }));
    //     }

    //     console.log("=== FINAL UPDATE REQUEST ===", passObjDet);

    //     // **Show audit trail for update**
    //     setSubmitPassObjDet(passObjDet);
    //     setAuditAction('update');
    //     setAuditData(passObjDet);
    //     setSubmitDialogMessage(t("scheduler.confirmUpdate"));
    //     setSubmitDialogSubMessage("");
    //     setShowAuditTrail(true);
    // };

    // ===== 1. INITIAL LOAD (in useEffect when navigationSource exists) =====
    useEffect(() => {
        if (navigationSource?.scheduleId && navigationSource?.action === 'edit') {
            validateScheduleForEdit();
        }
    }, [navigationSource]);

    // Add this function in DataScheduler.jsx (after your other function definitions)
    const DataSchedulerupdate = async (data) => {
        try {
            // Use your existing postData function
            const response = await postData('Scheduler/DataSchedulerSave', data);
            return response;
        } catch (error) {
            console.error('DataSchedulerupdate error:', error);
            throw error;
        }
    };

    const validateScheduleForEdit = async () => {
        const validatePayload = {
            ...CF_activeUserdetails(),
            bExist: true,
            process: "",
            L13TaskID: navigationSource.scheduleId
        };

        try {
            const response = await DataSchedulerupdate(validatePayload);
            if (response.oResObj.bStatus) {
                console.log("✅ Schedule validated for editing");
                // Continue loading the form
            } else {
                console.error("❌ Schedule validation failed");
                // Show error, navigate back
            }
        } catch (error) {
            console.error("Validation error:", error);
        }
    };

    const handleUpdate = async () => {
        console.log("=== UPDATE STARTED ===");

        const userDetails = CF_activeUserdetails();

        // Build passObjDet exactly like jQuery
        let passObjDet = {
            bExist: false, // IMPORTANT: false for update
            process: "edit",
            sTaskID: navigationSource?.scheduleId?.trim(), // From navigation
            L13TaskID: navigationSource?.scheduleId?.trim(), // Schedule ID from EditTask

            // Client/Instrument fields
            L13EmpowerStatus: 0,
            L13InstrumentMappingID: selectedInstrument.trim(),
            L13FTPID: selectedDestination.trim(),
            L13FileFilter: filter,

            // Path settings
            L13SourcePath: isUNCPathEnabled ? uncPath.trim() : sourcePath.trim(),
            L13UNCStatus: isUNCPathEnabled ? 1 : 0,
            L13UNCUserName: isUNCPathEnabled ? uncUsername.trim() : "",
            L13UNCPassword: isUNCPathEnabled ? uncPassword.trim() : "",
            L13UNCDomain: isUNCPathEnabled ? (selectedDomain || "NONE") : "NONE",

            // Method
            L13MethodName: !isMethodDisabled && selectedMethod ? selectedMethod : "DEFAULT",
            L13ParserInstCode: !isMethodDisabled ? selectedMethod : "",
            L13ParserMethodGroup: !isMethodDisabled ? selectedMethod : "",

            // Task info
            L13TaskStatus: "D",
            L13DayStatus: 1,
            L13TimeStatus: 1,
            L13CreatedBy: userDetails.ActiveUserDetails.sUserID,
            L13ModifiedBy: userDetails.ActiveUserDetails.sUserID,
            L13TaskName: "Scheduler",
            L13WatcherFlag: 0,
            L13TaskCompleted: 0,

            // Data Logger
            nDataLoggerStatus: dataLogger ? 1 : 0,
            nDataLoggerArchivalDays: parseInt(archivalDays) || 0,

            // Scheduler Metadata
            L13Active: isSchedulerMetadataEnabled ? 1 : 0,
            L13TemplateID: selectedTemplate,
            L13FileDelimiter: selectedDelimiters.join(''),
            L13Examplefilename: sampleFilename,
            L13SubfolderLevel: 0,
            L13ModifiedBy: userDetails.ActiveUserDetails.sUserID
        };

        // Add instrument details
        const instrumentItem = instrumentOptions.find(inst =>
            inst.L12InstrumentMappingID.trim() === selectedInstrument.trim()
        );
        if (instrumentItem) {
            passObjDet["L13InstrumentID"] = instrumentItem.L12InstrumentID.trim();
            passObjDet["sInstrumentName"] = instrumentItem.L11InstrumentName.trim();
        }

        // Add destination text
        const destinationItem = destinationOptions.find(d =>
            d.L09FTPID.trim() === selectedDestination.trim()
        );
        if (destinationItem) {
            passObjDet["L13FTPText"] = destinationItem.L09FTPAliasName.trim();
        }

        // ========== SCHEDULE CAPTURE SETTINGS ==========
        if (liveCapture) {
            passObjDet["L13ScheduleMode"] = "";
            passObjDet["L13LiveArchive"] = 1;

            if (liveCaptureVersioning) {
                passObjDet["L13VersionPolicy"] = 0;
            } else if (oneVersionPerDay) {
                passObjDet["L13VersionPolicy"] = 1;
            } else {
                passObjDet["L13VersionPolicy"] = 2;
            }
        } else {
            passObjDet["L13LiveArchive"] = 0;

            if (oneTime) {
                passObjDet["L13ScheduleMode"] = "O";
            } else if (daily) {
                passObjDet["L13ScheduleMode"] = "D";
            } else if (weekly) {
                passObjDet["L13ScheduleMode"] = "W";
            } else if (monthly) {
                passObjDet["L13ScheduleMode"] = "M";
            }

            if (oneTime) {
                passObjDet["L13VersionPolicy"] = 2;
            } else {
                passObjDet["L13VersionPolicy"] = scheduleWithVersioning ? 0 : 2;
            }
        }

        // ========== TRIGGER/EXPIRY ==========
        const triggerTimePart = triggerTime.split(' ')[0];
        passObjDet["L13StartDate"] = `${triggerDate} ${triggerTimePart}`;
        passObjDet["L13TriggerTime"] = `${triggerDate} ${triggerTimePart}`;

        if (expiryEnabled) {
            const expiryTimePart = expiryTime.split(' ')[0];
            passObjDet["L13EndDate"] = `${expiryDate} ${expiryTimePart}`;
        } else {
            passObjDet["L13EndDate"] = "";
        }

        if (oneTime) {
            passObjDet["L13OneTimeDate"] = oneTimeDate;
            passObjDet["L13TriggerTime"] = `${oneTimeDate} ${triggerTimePart}`;
        } else {
            passObjDet["L13OneTimeDate"] = null;
        }

        // ========== DAILY SCHEDULE ==========
        if (daily) {
            passObjDet["L13DayRepeatStatus"] = dailyRepeatTask ? 1 : 0;
            passObjDet["L13DateInterval"] = parseInt(dailyEveryDays) || 0;
            passObjDet["L13TimeInterval"] = CF_HOURTOMINCONVERTION(
                parseInt(dailyEveryHours) || 0,
                parseInt(dailyEveryMinutes) || 0
            );
        } else {
            passObjDet["L13DayRepeatStatus"] = 0;
            passObjDet["L13DateInterval"] = 0;
            passObjDet["L13TimeInterval"] = 0;
        }

        // ========== WEEKLY SCHEDULE ==========
        if (weekly) {
            let weekdays = "";
            weekdays += weeklyDays.Sunday ? "1" : "0";
            weekdays += weeklyDays.Monday ? "1" : "0";
            weekdays += weeklyDays.Tuesday ? "1" : "0";
            weekdays += weeklyDays.Wednesday ? "1" : "0";
            weekdays += weeklyDays.Thursday ? "1" : "0";
            weekdays += weeklyDays.Friday ? "1" : "0";
            weekdays += weeklyDays.Saturday ? "1" : "0";
            passObjDet["L13ActiveDaysWeekly"] = weekdays;
        } else {
            passObjDet["L13ActiveDaysWeekly"] = "0000000";
        }

        // ========== MONTHLY SCHEDULE ==========
        if (monthly) {
            passObjDet["L13ActiveMonth"] = GetActiveMonths(monthlySelectedMonths, monthOptions);

            if (monthlyDayToggle) {
                passObjDet["L13StatusMonthDaysOrWeek"] = "Days";
                passObjDet["L13ActiveMonthlydays"] = GetActiveMonthlyDays(monthlySelectedDays);
                passObjDet["L13ActiveWeekNoMonthly"] = "00000";
                passObjDet["L13ActiveDayOfWeekMonthly"] = "0000000";
            } else {
                passObjDet["L13StatusMonthDaysOrWeek"] = "Week";
                passObjDet["L13ActiveMonthlydays"] = "";
                passObjDet["L13ActiveWeekNoMonthly"] = GetActiveWeekNO(monthlySelectedWeeks, weekOptions);
                passObjDet["L13ActiveDayOfWeekMonthly"] = GetActiveWeekDays(monthlySelectedWeekdays, weekdayOptions);
            }
        } else {
            passObjDet["L13ActiveMonth"] = "000000000000";
            passObjDet["L13StatusMonthDaysOrWeek"] = "Week";
            passObjDet["L13ActiveMonthlydays"] = "";
            passObjDet["L13ActiveWeekNoMonthly"] = "00000";
            passObjDet["L13ActiveDayOfWeekMonthly"] = "0000000";
        }

        // ========== COPY/MOVE FILES ==========
        passObjDet["L13CopyFiles"] = copyFiles ? 1 : 0;
        passObjDet["L13MovePermenently"] = moveFiles ? 1 : 0;

        // ========== DELETE LOCAL COPY ==========
        if (deleteLocalCopy) {
            passObjDet["L13DeleteLocalCopy"] = 1;

            if (filesOlderThanEnabled) {
                passObjDet["L13OlderFileType"] = 0;
                passObjDet["L13OlderFileNO"] = parseInt(filesOlderDays) || 0;
                passObjDet["L13OlderFileNoType"] = filesOlderDaysUnit;
                passObjDet["L13OlderFileDate"] = null;
            } else if (filesOlderThanDateEnabled) {
                passObjDet["L13OlderFileType"] = 1;
                passObjDet["L13OlderFileNO"] = 0;
                passObjDet["L13OlderFileNoType"] = "";
                passObjDet["L13OlderFileDate"] = filesOlderThanDate;
            }
            passObjDet["L13AutoLocalDeleteStatus"] = localDeleteMode;
        } else {
            passObjDet["L13DeleteLocalCopy"] = 0;
            passObjDet["L13OlderFileType"] = 0;
            passObjDet["L13OlderFileNO"] = 0;
            passObjDet["L13OlderFileNoType"] = "";
            passObjDet["L13OlderFileDate"] = null;
            passObjDet["L13AutoLocalDeleteStatus"] = 1;
        }

        // ========== FILE DELETE POLICY ==========
        passObjDet["L13FileDeleteVersionPolicy"] = applyDeletePolicy ? 1 : 0;
        passObjDet["L52DBMaintenanceDelType"] = applyDeletePolicy;
        passObjDet["L52FileVersionDeleteType"] = false;
        passObjDet["L13AutoServerDeleteStatus"] = serverDeleteMode;

        // ========== FILE LINK STATUS ==========
        passObjDet["L13FileLinkStatus"] = enableFileLink ? 1 : 0;

        // ========== SUBFOLDER SETTINGS ==========
        if (includeSubfolder) {
            passObjDet["L13SubDirectory"] = 1;

            if (completeTree) {
                passObjDet["L13DataArchiveMode"] = 0;
                passObjDet["L13Level"] = 0;
            } else if (levelEnabled) {
                passObjDet["L13DataArchiveMode"] = 1;
                passObjDet["L13Level"] = parseInt(levelValue) || 0;
            }
        } else {
            passObjDet["L13SubDirectory"] = 0;
            passObjDet["L13Level"] = 0;
            passObjDet["L13DataArchiveMode"] = 0;
        }

        // ========== FILE AUDIT ==========
        passObjDet["L52EnableVerAudit"] = enableFileAudit ? 1 : 0;
        passObjDet["L52AuditFilter"] = enableFileAudit ? auditFilter : "";

        // ========== SCHEDULER METADATA ==========
        if (isSchedulerMetadataEnabled) {
            const Delimeter = selectedDelimiters.length > 0
                ? ConcatenateDelimeterfromlist(selectedDelimiters, delimiterOptions)
                : "";

            // Process tag data like jQuery
            passObjDet["SchedulerExtractionlst"] = tagMasterData.map((tag, index) => {
                const item = {
                    sTagID: tag.sTagID,
                    sTagName: tag.sTagName,
                    sSourceFlag: tag.sSourceFlag || "NONE",
                    sValue: tag.sTextData || "",
                    sValueID: tag.sTextData || "",
                    sDataIndex: tag.sTextData || "",
                    sExamplefilename: sampleFilename,
                    sFileDelimiter: Delimeter,
                    sActive: 1,
                    sCreatedBy: tag.original?.sCreatedBy || userDetails.ActiveUserDetails.sUserID,
                    sModifiedBy: userDetails.ActiveUserDetails.sUserID,
                    sSiteCode: userDetails.ActiveUserDetails.sSiteCode,
                    sTextData: ""
                };

                return item;
            });

            // Process rules like jQuery
            const pathExtractionRule = ruleGridData.map((rule, index) => {
                const conditionObj = {
                    sRuleID: rule.originalRule?.sRuleID || 1,
                    sRuleTagID: parseInt(rule.ruleName),
                    sRuleName: rule.tagName,
                    sTagID: parseInt(rule.ruleName),
                    sTagName: rule.tagName,
                    srelationaloperator: rule.relationalOp,
                    sMetadataType: rule.metadata,
                    sfieldvalue: rule.fieldValue,
                    sConditionSeqNo: index + 1
                };

                return {
                    L13TagID: parseInt(rule.ruleName),
                    L13TemplateID: selectedTemplate,
                    L13Conditions: JSON.stringify(conditionObj),
                    L13ConditionSeqNo: index + 1,
                    L13ModifiedBy: userDetails.ActiveUserDetails.sUserID,
                    L13RuleID: rule.originalRule?.sRuleID || 1,
                    L13Metadata: rule.metadata
                };
            });

            passObjDet["PathExtractionRule"] = pathExtractionRule;
            passObjDet["sConditionObj"] = pathExtractionRule.map(rule => ({
                L13Conditions: rule.L13Conditions
            }));
        }
        

        // 4. DEBUG: Check before merging
        console.log("DEBUG - bExist before merge:", passObjDet.bExist);
        console.log("DEBUG - process before merge:", passObjDet.process);

        // 5. Merge with userDetails (bExist: false will override any bExist from userDetails)
        const finalPayload = {
            ...userDetails,
            ...passObjDet,  // This will override bExist and process if userDetails has them
            ApplicationCode: "SDMS"
        };



        // 6. DEBUG: Verify final payload
        console.log("DEBUG - Final bExist:", finalPayload.bExist);
        console.log("DEBUG - Final process:", finalPayload.process);

        if (finalPayload.bExist !== false) {
            console.error("❌ ERROR: bExist is not false! Forcing to false...");
            finalPayload.bExist = false;
        }
        console.log("=== FINAL UPDATE REQUEST ===", passObjDet);

        // Store for audit trail
        setSubmitPassObjDet(passObjDet);
        setAuditAction('update');
        setAuditData(passObjDet);

        // Check audit trail rights (from your jQuery code)
        const auditTrailControlRights = 1; // You need to get this from your rights system
        if (auditTrailControlRights === 1) {
            // Show audit trail
            setSubmitDialogMessage(t("scheduler.confirmUpdate"));
            setShowAuditTrail(true);
        } else {
            // No audit trail required, submit directly
            await submitSchedulerUpdate(passObjDet, null);
        }
    };

    // ===== 3. AFTER AUDIT TRAIL AUTHORIZATION =====
    const handleAuditAuthorized = async (auditPayload) => {
        if (auditAction === 'update') {
            await submitSchedulerUpdate(submitPassObjDet, auditPayload);
        }
    };



    const handleSubmit = async () => {
        console.log("=== SUBMIT STARTED ===");

        // Initialize validation object
        let passObjDet = {};

        // ========== PHASE 1: ALL FIELD VALIDATION ==========
        console.log("--- Phase 1: All Field Validation ---");

        let hasErrors = false;
        let IsEmpty = false;
        let errorSections = []; // Track which sections have errors

        // 1. Client Validation
        if (!selectedClient) {
            console.log("Client validation failed");
            setClientError(true);
            hasErrors = true;
            IsEmpty = true;
            if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
        } else {
            setClientError(false);
        }

        // 2. Instrument Validation
        if (!selectedInstrument) {
            console.log("Instrument validation failed");
            setInstrumentError(true);
            hasErrors = true;
            IsEmpty = true;
            if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
        } else {
            setInstrumentError(false);
        }

        // 3. Path Validation (Local or UNC)
        if (!isUNCPathEnabled) {
            // Local Path
            if (!sourcePath.trim()) {
                console.log("Source path is empty");
                setSourcePathError(true);
                hasErrors = true;
                IsEmpty = true;
                if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
            } else {
                const pathValidation = CF_pathValidation(sourcePath);
                const sourcepathParts = sourcePath.split("\\");

                if (!pathValidation || sourcepathParts[1] === "") {
                    console.log("Source path validation failed");
                    setSourcePathError(true);
                    hasErrors = true;
                    IsEmpty = true;
                    if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
                } else {
                    setSourcePathError(false);
                }
            }
        } else {
            // UNC Path
            if (!uncPath.trim()) {
                console.log("UNC Path is empty");
                setUncPathError(true);
                hasErrors = true;
                IsEmpty = true;
                if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
            } else {
                const UNCPathValidation = CF_UNCPathValidation(uncPath.trim());
                if (!UNCPathValidation) {
                    console.log("UNC Path validation failed");
                    setUncPathError(true);
                    hasErrors = true;
                    IsEmpty = true;
                    if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
                } else {
                    setUncPathError(false);
                }
            }
        }

        // 4. Destination Validation
        if (!selectedDestination) {
            console.log("Destination not selected");
            setDestinationError(true);
            hasErrors = true;
            IsEmpty = true;
            if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
        } else {
            setDestinationError(false);
        }

        // Show error dialog ONLY if client and instrument are selected
        if (hasErrors && selectedClient && selectedInstrument) {
            console.log("Client and Instrument selected - showing error dialog");
            setErrorDialog({
                isOpen: true,
                message: t("errormsg.incompletedatafields"),
                type: 'information'
            });

            // Scroll to File Settings section
            scrollToSection(fileSettingsRef, 'File Settings');
            return; // EXIT - Don't proceed
        }

        // If there are errors but client/instrument not selected, just show red borders and return
        //recent
        if (hasErrors) {
            console.log("Errors exist but client/instrument not selected - only showing red borders");
            // Scroll to first error
            scrollToSection(fileSettingsRef, 'File Settings');
            return; // EXIT - Only red borders, no dialog
        }

        // ========== PHASE 2: CONDITIONAL FIELDS VALIDATION ==========
        console.log("--- Phase 2: Conditional Fields Validation ---");

        // 5. Method Validation (only if not disabled)
        if (!isMethodDisabled) {
            const selectedMethodIndex = methodOptions.findIndex(m => m.InstMethodName === selectedMethod);

            if (selectedMethodIndex === -1 || !selectedMethod) {
                console.log("Method validation failed");
                setMethodError(true);
                IsEmpty = true;
                if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
            } else {
                setMethodError(false);
                const selectedMethodItem = methodOptions[selectedMethodIndex];


                passObjDet["L13MethodName"] = selectedMethodItem.MethodName;
                passObjDet["L13ParserInstCode"] = selectedMethodItem.InstName;
                passObjDet["L13ParserMethodGroup"] = selectedMethodItem.MethodGroup;
            }
        } else {
            passObjDet["L13MethodName"] = "DEFAULT";
            // passObjDet["L13ParserInstCode"]='';
        }

        // Set Path in passObjDet
        if (!isUNCPathEnabled) {
            passObjDet["L13SourcePath"] = sourcePath;
            passObjDet["L13UNCStatus"] = 0;
        } else {
            passObjDet["L13SourcePath"] = uncPath.trim();
            passObjDet["L13UNCStatus"] = 1;

            // UNC credentials validation
            if (!uncUsername.trim()) {
                console.log("UNC Username is empty");
                setUncUsernameError(true);
                IsEmpty = true;
                if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
            } else {
                setUncUsernameError(false);
            }

            if (!uncPassword.trim()) {
                console.log("UNC Password is empty");
                setUncPasswordError(true);
                IsEmpty = true;
                if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
            } else {
                setUncPasswordError(false);
            }

            if (!selectedDomain) {
                console.log("Domain not selected");
                setUncDomainError(true);
                IsEmpty = true;
                if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
            } else {
                setUncDomainError(false);
            }
        }

        // 5. Filter Validation
        if (!filter.trim()) {
            console.log("Filter is empty");
            setFilterError(true);
            IsEmpty = true;
            if (!errorSections.includes('fileSettings')) errorSections.push('fileSettings');
        } else {
            setFilterError(false);
        }

        // Set Destination in passObjDet
        const destinationItem = destinationOptions.find(d => d.L09FTPID === selectedDestination);
        if (destinationItem) {
            passObjDet["L13FTPText"] = destinationItem.L09FTPAliasName;
        }

        // 6. Delete Local Copy Validation
        if (deleteLocalCopy) {
            console.log("Validating Delete Local Copy");

            if (filesOlderThanEnabled) {
                if (!filesOlderDays.trim()) {
                    console.log("Files older days is empty");
                    setFilesOlderDaysError(true);
                    IsEmpty = true;
                    if (!errorSections.includes('uploadPolicy')) errorSections.push('uploadPolicy');
                } else {
                    setFilesOlderDaysError(false);
                }
            }
        }

        // 7. Subfolder Level Validation
        if (includeSubfolder) {
            console.log("Validating Subfolder Level");

            if (levelEnabled) {
                if (!levelValue.trim()) {
                    console.log("Level value is empty");
                    setLevelValueError(true);
                    IsEmpty = true;
                    if (!errorSections.includes('uploadPolicy')) errorSections.push('uploadPolicy');
                } else {
                    setLevelValueError(false);
                }
            }
        }

        // 8. File Audit Validation
        if (enableFileAudit) {
            console.log("Validating File Audit");
            if (!auditFilter.trim()) {
                console.log("Audit filter is empty");
                setAuditFilterError(true);
                hasErrors = true;
                IsEmpty = true;
            } else {
                setAuditFilterError(false);
                passObjDet["L52EnableVerAudit"] = true;
                passObjDet["L52AuditFilter"] = auditFilter;
            }
        } else {
            passObjDet["L52EnableVerAudit"] = false;
            passObjDet["L52AuditFilter"] = "";
        }

        // ========== SCHEDULER METADATA VALIDATION ==========
        console.log("--- Processing Scheduler Metadata ---");

        passObjDet["L13Active"] = isSchedulerMetadataEnabled ? 1 : 0;

        if (isSchedulerMetadataEnabled) {
            console.log("Scheduler Metadata is enabled - validating");

            // Template validation
            if (!selectedTemplate) {
                console.log("Template not selected");
                setTemplateError(true);
                IsEmpty = true;
                if (!errorSections.includes('schedulerMetadata')) errorSections.push('schedulerMetadata');
            } else {
                setTemplateError(false);
                passObjDet["L13TemplateID"] = selectedTemplate;
            }

            // Sample filename validation - only validate if there are Filename rows
            const hasFilenameRows = tagMasterData.some(tag => tag.sSourceFlag === 'Filename');
            if (hasFilenameRows) {
                if (!sampleFilename.trim()) {
                    console.log("Sample filename is empty");
                    setSampleFilenameError(true);
                    IsEmpty = true;
                    if (!errorSections.includes('schedulerMetadata')) errorSections.push('schedulerMetadata');
                } else {
                    // Check if filename has valid extension
                    const hasExtension = sampleFilename.includes('.') &&
                        sampleFilename.lastIndexOf('.') < sampleFilename.length - 1;
                    if (!hasExtension) {
                        setSampleFilenameError(true);
                        IsEmpty = true;
                        if (!errorSections.includes('schedulerMetadata')) errorSections.push('schedulerMetadata');
                    } else {
                        setSampleFilenameError(false);
                    }
                }

                // Delimiter validation - only for Filename rows
                if (!selectedDelimiters.length) {
                    console.log("Delimiter not selected");
                    setDelimiterError(true);
                    IsEmpty = true;
                    if (!errorSections.includes('schedulerMetadata')) errorSections.push('schedulerMetadata');
                } else {
                    setDelimiterError(false);
                }
            }

            // Tag rows validation
            const errorRows = [];
            let hasAnyError = false;

            // Check each tag row in the grid
            for (let i = 0; i < tagMasterData.length; i++) {
                const tag = tagMasterData[i];
                const rowMetadata = tag.sTextData || '';

                // Show error for ANY empty metadata, regardless of radio selection
                // BUT skip the currently selected row
                if (!rowMetadata.trim() && i !== selectedTagRowIndex) {
                    console.log(`Tag row ${i} has empty metadata - ADDING ERROR`);
                    errorRows.push(i);
                    hasAnyError = true;
                    IsEmpty = true;
                }
            }

            // If ANY error exists, mark the error rows
            if (hasAnyError) {
                setTagRowErrors(errorRows);
                if (!errorSections.includes('schedulerMetadata')) errorSections.push('schedulerMetadata');
            }

            // Add indices to errorRows array
            setTagRowErrors(errorRows);
            if (errorRows.length > 0) {
                hasErrors = true;
                IsEmpty = true;
                if (!errorSections.includes('schedulerMetadata')) errorSections.push('schedulerMetadata');
            }

            const Delimeter = selectedDelimiters.length > 0
                ? ConcatenateDelimeterfromlist(selectedDelimiters, delimiterOptions)
                : "";

            const subfolderlevel = 0;
            const Instrumentitem = instrumentOptions.find(inst => inst.L12InstrumentMappingID === selectedInstrument);
            if (Instrumentitem) {
                passObjDet["L13InstrumentID"] = Instrumentitem.L12InstrumentID;
            }

            passObjDet["L13FileDelimiter"] = Delimeter;
            passObjDet["L13Examplefilename"] = sampleFilename;
            passObjDet["L13SubfolderLevel"] = subfolderlevel;

            // Fix SchedulerExtractionlst format to match jQuery
            passObjDet["SchedulerExtractionlst"] = tagMasterData.map((tag, index) => {
                const sourceFlag = tag.sSourceFlag || 'NONE';
                const userValue = (tag.sTextData || '').trim();

                // Determine sValue and sValueID based on source flag
                let sValue = "";
                let sValueID = "";

                if (sourceFlag === 'File') {
                    // For File, use the parsed index (like "2", "1", "-1")
                    const parsed = parsedMetadata.indexOf(userValue);
                    sValue = parsed >= 0 ? parsed.toString() : userValue;
                    sValueID = userValue;
                } else if (sourceFlag === 'Folder') {
                    sValue = userValue;
                    sValueID = userValue;
                } else {
                    // NONE
                    sValue = "";
                    sValueID = "";
                }

                return {
                    sValue: sValue,
                    sTagName: tag.sTagName,
                    sValueID: sValueID,
                    sTagID: tag.sTagID,
                    sSourceFlag: sourceFlag,
                    sTextData: "",
                    // Add jQuery-like tracking fields
                    uid: index,
                    boundindex: index,
                    uniqueid: `${Date.now()}-${index}`,
                    visibleindex: index
                };
            });

            // Fix PathExtractionRule to match jQuery format
            const pathExtractionRule = ruleGridData.map((rule, index) => {
                // Get the tag details
                const ruleTag = tagMasterData.find(t => t.sTagID.toString() === rule.ruleName.toString());

                const conditionObj = {
                    sRuleID: rule.originalRule?.sRuleID || 1,
                    sRuleTagID: rule.ruleName,  // The Rule Name dropdown ID
                    sRuleName: ruleTag?.sTagName || rule.tagName,
                    sTagID: ruleTag?.sTagID || rule.ruleName,
                    sTagName: rule.tagName,  // The Condition tag name
                    srelationaloperator: rule.relationalOp,
                    sMetadataType: rule.metadata,
                    sfieldvalue: rule.fieldValue,
                    sConditionSeqNo: index + 1,
                    // Add tracking fields like jQuery
                    uid: index,
                    boundindex: index,
                    uniqueid: `${Date.now()}-${index}`,
                    visibleindex: index
                };

                return {
                    L13TagID: rule.ruleName,
                    L13TemplateID: selectedTemplate,
                    L13Conditions: JSON.stringify(conditionObj),
                    L13ConditionSeqNo: index + 1,
                    L13ModifiedBy: CF_activeUserdetails().ActiveUserDetails.sUserID,
                    L13RuleID: rule.originalRule?.sRuleID || 1,
                    L13Metadata: rule.metadata
                };
            });
            passObjDet["PathExtractionRule"] = pathExtractionRule;
        }

        // ========== CHECK IF WE SHOULD SHOW ERROR DIALOG ==========
        // Show error dialog ONLY if client and instrument are selected

        //recently
        if (hasErrors && selectedClient && selectedInstrument) {
            console.log("Client and Instrument selected - showing error dialog");
            setErrorDialog({
                isOpen: true,
                message: t("errormsg.incompletedatafields"),
                type: 'information'
            });

            // Scroll to first error section
            if (errorSections.length > 0) {
                const firstSection = errorSections[0];
                switch (firstSection) {
                    case 'fileSettings':
                        scrollToSection(fileSettingsRef, 'File Settings');
                        break;
                    case 'uploadPolicy':
                        scrollToSection(uploadPolicyRef, 'Upload Policy');
                        break;
                    case 'schedulerMetadata':
                        scrollToSection(schedulerMetadataRef, 'Scheduler Metadata');
                        break;
                    default:
                        scrollToSection(fileSettingsRef, 'File Settings');
                }
            }

            return; // EXIT - Don't proceed
        }

        // If there are errors but client/instrument not selected, just show red borders and return
        //recently
        if (hasErrors) {
            console.log("Errors exist but client/instrument not selected - only showing red borders");

            // Scroll to first error section
            if (errorSections.length > 0) {
                const firstSection = errorSections[0];
                switch (firstSection) {
                    case 'fileSettings':
                        scrollToSection(fileSettingsRef, 'File Settings');
                        break;
                    case 'uploadPolicy':
                        scrollToSection(uploadPolicyRef, 'Upload Policy');
                        break;
                    case 'schedulerMetadata':
                        scrollToSection(schedulerMetadataRef, 'Scheduler Metadata');
                        break;
                    default:
                        scrollToSection(fileSettingsRef, 'File Settings');
                }
            }

            return; // EXIT - Only red borders, no dialog
        }

        // ========== LIVE BACKUP / SCHEDULE MODE ==========
        console.log("--- Processing Schedule Mode ---");

        passObjDet["L13LiveArchive"] = 0;
        passObjDet["L13VersionPolicy"] = 0;

        if (liveCapture) {
            console.log("Live Capture is enabled");

            passObjDet["L13ScheduleMode"] = "";
            passObjDet["L13LiveArchive"] = 1;

            if (liveCaptureVersioning) {
                passObjDet["L13VersionPolicy"] = 0;
            } else if (oneVersionPerDay) {
                passObjDet["L13VersionPolicy"] = 1;
            } else {
                passObjDet["L13VersionPolicy"] = 2;
            }
        } else {
            console.log("Schedule Mode is enabled");

            passObjDet["L13LiveArchive"] = 0;

            if (oneTime) {
                passObjDet["L13ScheduleMode"] = "O";
            } else if (daily) {
                passObjDet["L13ScheduleMode"] = "D";
            } else if (weekly) {
                passObjDet["L13ScheduleMode"] = "W";
            } else if (monthly) {
                passObjDet["L13ScheduleMode"] = "M";
            }

            if (oneTime) {
                passObjDet["L13VersionPolicy"] = 2;
            } else {
                if (scheduleWithVersioning) {
                    passObjDet["L13VersionPolicy"] = 0;
                } else {
                    passObjDet["L13VersionPolicy"] = 2;
                }
            }
        }

        // ========== TRIGGER TIME VALIDATION ==========
        console.log("--- Validating Trigger Time ---");

        const starttriggertime = triggerTime.split(' ');
        console.log("Start trigger time:", starttriggertime);

        if (starttriggertime[0] === "00:00:00") {
            console.log("Trigger time is 00:00:00 - showing error");
            setErrorDialog({
                isOpen: true,
                message: t("scheduler.mustchoosetriggertime"),
                type: 'warning'
            });
            scrollToSection(triggerExpiryRef, 'Schedule Trigger/Expiry On');
            return;
        } else {
            const startdate = `${triggerDate} ${triggerTime.split(' ')[0]}`;
            passObjDet["L13StartDate"] = startdate;
            console.log("L13StartDate set to:", startdate);
        }

        // ========== EXPIRY DATE/TIME VALIDATION ==========
        console.log("--- Validating Expiry Date/Time ---");

        if (expiryEnabled) {
            const expirytime = expiryTime.split(' ');
            console.log("Expiry time:", expirytime);

            if (expirytime[0] === "00:00:00") {
                console.log("Expiry time is 00:00:00 - showing error");
                setErrorDialog({
                    isOpen: true,
                    message: t("scheduler.mustchooseendtime"),
                    type: 'warning'
                });
                scrollToSection(triggerExpiryRef, 'Schedule Trigger/Expiry On');
                return;
            } else {
                const enddate = `${expiryDate} ${expirytime[0]}`;
                passObjDet["L13EndDate"] = enddate;
                console.log("L13EndDate set to:", enddate);
            }
        } else {
            passObjDet["L13EndDate"] = "";
        }

        // Set Trigger Time
        // const timeinput = triggerTime.split(' ');
        const triggertime = `${triggerDate} ${triggerTime.split(' ')[0]}`;
        passObjDet["L13TriggerTime"] = triggertime;
        console.log("L13TriggerTime set to:", triggertime);

        // ========== ONE TIME DATE ==========
        if (passObjDet["L13ScheduleMode"] === "O") {
            console.log("Setting One Time Date:", oneTimeDate);
            passObjDet["L13OneTimeDate"] = oneTimeDate;
            passObjDet["L13TriggerTime"] = `${oneTimeDate} ${triggerTime.split(' ')[0]}`;
        } else {
            passObjDet["L13OneTimeDate"] = null;
        }

        // ========== DAILY SCHEDULE ==========
        if (passObjDet["L13ScheduleMode"] === "D") {
            console.log("Processing Daily Schedule");

            passObjDet["L13DayRepeatStatus"] = dailyRepeatTask ? 1 : 0;
            passObjDet["L13DateInterval"] = parseInt(dailyEveryDays);

            const hourtominconvert = CF_HOURTOMINCONVERTION(
                parseInt(dailyEveryHours),
                parseInt(dailyEveryMinutes)
            );
            passObjDet["L13TimeInterval"] = hourtominconvert;

            console.log("Daily Schedule Data:", {
                DayRepeatStatus: passObjDet["L13DayRepeatStatus"],
                DateInterval: passObjDet["L13DateInterval"],
                TimeInterval: passObjDet["L13TimeInterval"]
            });
        } else {
            passObjDet["L13DayRepeatStatus"] = 0;
            passObjDet["L13DateInterval"] = 0;
            passObjDet["L13TimeInterval"] = 0;
        }

        // ========== WEEKLY SCHEDULE ==========
        if (passObjDet["L13ScheduleMode"] === "W") {
            console.log("Processing Weekly Schedule");

            let weekdays = "";
            weekdays += weeklyDays.Sunday ? "1" : "0";
            weekdays += weeklyDays.Monday ? "1" : "0";
            weekdays += weeklyDays.Tuesday ? "1" : "0";
            weekdays += weeklyDays.Wednesday ? "1" : "0";
            weekdays += weeklyDays.Thursday ? "1" : "0";
            weekdays += weeklyDays.Friday ? "1" : "0";
            weekdays += weeklyDays.Saturday ? "1" : "0";

            passObjDet["L13ActiveDaysWeekly"] = weekdays;
            console.log("L13ActiveDaysWeekly:", weekdays);
        } else {
            passObjDet["L13ActiveDaysWeekly"] = "0000000";
        }

        // ========== MONTHLY SCHEDULE ==========
        if (passObjDet["L13ScheduleMode"] === "M") {
            console.log("Processing Monthly Schedule");

            passObjDet["L13ActiveMonth"] = GetActiveMonths(monthlySelectedMonths, monthOptions);

            if (monthlyDayToggle) {
                // Day toggle is ON
                passObjDet["L13StatusMonthDaysOrWeek"] = "Days";
                passObjDet["L13ActiveMonthlydays"] = GetActiveMonthlyDays(monthlySelectedDays);
                // Set empty values for week/weekday fields when day toggle is selected
                passObjDet["L13ActiveWeekNoMonthly"] = "00000";
                passObjDet["L13ActiveDayOfWeekMonthly"] = "0000000";
                console.log("Monthly Days:", passObjDet["L13ActiveMonthlydays"]);
            } else if (monthlyOnToggle) {
                // On toggle is ON (Week mode)
                passObjDet["L13StatusMonthDaysOrWeek"] = "Week";
                passObjDet["L13ActiveWeekNoMonthly"] = GetActiveWeekNO(monthlySelectedWeeks, weekOptions);
                passObjDet["L13ActiveDayOfWeekMonthly"] = GetActiveWeekDays(monthlySelectedWeekdays, weekdayOptions);
                // Set empty value for days field when week toggle is selected
                passObjDet["L13ActiveMonthlydays"] = "";
                console.log("Monthly Week Data:", {
                    WeekNo: passObjDet["L13ActiveWeekNoMonthly"],
                    DayOfWeek: passObjDet["L13ActiveDayOfWeekMonthly"]
                });
            } else {
                // Neither toggle is selected (shouldn't happen, but set defaults)
                passObjDet["L13StatusMonthDaysOrWeek"] = "Week";
                passObjDet["L13ActiveMonthlydays"] = "";
                passObjDet["L13ActiveWeekNoMonthly"] = "00000";
                passObjDet["L13ActiveDayOfWeekMonthly"] = "0000000";
            }
        } else {
            passObjDet["L13ActiveMonth"] = "000000000000";
            passObjDet["L13StatusMonthDaysOrWeek"] = "Week";
            passObjDet["L13ActiveMonthlydays"] = "";
            passObjDet["L13ActiveWeekNoMonthly"] = "00000";
            passObjDet["L13ActiveDayOfWeekMonthly"] = "0000000";
        }

        // ========== COPY/MOVE FILES ==========
        console.log("--- Processing Copy/Move Files ---");
        passObjDet["L13CopyFiles"] = copyFiles ? 1 : 0;
        passObjDet["L13MovePermenently"] = moveFiles ? 1 : 0;

        // ========== DELETE LOCAL COPY ==========
        console.log("--- Processing Delete Local Copy ---");

        if (deleteLocalCopy) {
            passObjDet["L13DeleteLocalCopy"] = 1;

            if (filesOlderThanEnabled) {
                passObjDet["L13OlderFileType"] = 0;
                passObjDet["L13OlderFileNO"] = parseInt(filesOlderDays);
                passObjDet["L13OlderFileNoType"] = filesOlderDaysUnit;
                passObjDet["L13OlderFileDate"] = null;
                passObjDet["L13AutoLocalDeleteStatus"] = localDeleteMode;
            }

            if (filesOlderThanDateEnabled) {
                passObjDet["L13OlderFileNO"] = 0;
                passObjDet["L13OlderFileNoType"] = "";
                passObjDet["L13OlderFileType"] = 1;
                passObjDet["L13OlderFileDate"] = filesOlderThanDate;
                passObjDet["L13AutoLocalDeleteStatus"] = localDeleteMode;
            }
        } else {
            passObjDet["L13DeleteLocalCopy"] = 0;
            passObjDet["L13OlderFileType"] = 0;
            passObjDet["L13OlderFileNO"] = 0;
            passObjDet["L13OlderFileNoType"] = "";
            passObjDet["L13OlderFileDate"] = null;
            passObjDet["L13AutoLocalDeleteStatus"] = 1;
        }

        // ========== FILE DELETE VERSION POLICY ==========
        console.log("--- Processing File Delete Policy ---");

        if (applyDeletePolicy) {
            passObjDet["L13FileDeleteVersionPolicy"] = 1;
            passObjDet["L52DBMaintenanceDelType"] = true;
            passObjDet["L52FileVersionDeleteType"] = false;
            passObjDet["L13AutoServerDeleteStatus"] = serverDeleteMode;
        } else {
            passObjDet["L13FileDeleteVersionPolicy"] = 0;
            passObjDet["L52DBMaintenanceDelType"] = false;
            passObjDet["L52FileVersionDeleteType"] = false;
            passObjDet["L13AutoServerDeleteStatus"] = 1;
        }

        // ========== FILE LINK STATUS ==========
        passObjDet["L13FileLinkStatus"] = enableFileLink ? 1 : 0;

        // ========== SUBFOLDER SETTINGS ==========
        console.log("--- Processing Subfolder Settings ---");

        if (includeSubfolder) {
            passObjDet["L13SubDirectory"] = 1;

            if (completeTree) {
                passObjDet["L13DataArchiveMode"] = 0;
                passObjDet["L13Level"] = 0;
            }

            if (levelEnabled) {
                passObjDet["L13DataArchiveMode"] = 1;
                if (levelValue.trim() !== "") {
                    passObjDet["L13Level"] = parseInt(levelValue);
                }
            } else {
                passObjDet["L13Level"] = 0;
                passObjDet["L13DataArchiveMode"] = 0;
            }
        } else {
            passObjDet["L13SubDirectory"] = 0;
            passObjDet["L13Level"] = 0;
            passObjDet["L13DataArchiveMode"] = 0;
        }

        // ========== INSTRUMENT & UNC DATA ==========
        console.log("--- Processing Instrument & UNC Data ---");

        passObjDet["L13EmpowerStatus"] = 0;
        passObjDet["L13InstrumentMappingID"] = selectedInstrument.trim();

        const Instrumentitem = instrumentOptions.find(inst => inst.L12InstrumentMappingID === selectedInstrument);
        if (Instrumentitem) {
            passObjDet["L13InstrumentID"] = Instrumentitem.L12InstrumentID;
            passObjDet["sInstrumentName"] = Instrumentitem.L11InstrumentName;
            console.log("Instrument Data:", {
                InstrumentID: passObjDet["L13InstrumentID"],
                InstrumentName: passObjDet["sInstrumentName"]
            });
        }

        passObjDet["L13FTPID"] = selectedDestination.trim();
        passObjDet["L13FileFilter"] = filter;
        passObjDet["L13UNCUserName"] = uncUsername.trim();
        passObjDet["L13UNCPassword"] = uncPassword.trim();

        const domainItem = domainOptions.find(d => d.L03DomainID === selectedDomain);
        if (domainItem) {
            passObjDet["L13UNCDomain"] = domainItem.L03DomainName;
        } else {
            passObjDet["L13UNCDomain"] = "";
        }

        // ========== TASK SETTINGS ==========
        console.log("--- Setting Task Settings ---");
        const userDetails = CF_activeUserdetails();

        passObjDet["L13TaskStatus"] = "D";
        passObjDet["L13DayStatus"] = 1;
        passObjDet["L13TimeStatus"] = 1;
        passObjDet["L13CreatedBy"] = userDetails.ActiveUserDetails.sUserID;
        passObjDet["L13TaskName"] = "Scheduler";
        passObjDet["L13WatcherFlag"] = 0;
        passObjDet["L13TaskCompleted"] = 0;
        passObjDet["bExist"] = false;
        passObjDet["process"] = "";

        // ========== EXPIRY DATE/TIME COMPARISON ==========
        console.log("--- Comparing Trigger and Expiry Times ---");

        setShowExpiryWarning(false);
        setShowTriggerWarning(false);

        if (expiryEnabled) {
            const triggerParts = triggerDate.split('/');
            const triggerTimeParts = triggerTime.split(':');
            const triggerDateTime = new Date(
                parseInt(triggerParts[2]),
                parseInt(triggerParts[1]) - 1,
                parseInt(triggerParts[0]),
                parseInt(triggerTimeParts[0]),
                parseInt(triggerTimeParts[1]),
                parseInt(triggerTimeParts[2])
            );

            const expiryParts = expiryDate.split('/');
            const expiryTimeParts = expiryTime.split(':');
            const expiryDateTime = new Date(
                parseInt(expiryParts[2]),
                parseInt(expiryParts[1]) - 1,
                parseInt(expiryParts[0]),
                parseInt(expiryTimeParts[0]),
                parseInt(expiryTimeParts[1]),
                parseInt(expiryTimeParts[2])
            );

            console.log("Trigger DateTime:", triggerDateTime);
            console.log("Expiry DateTime:", expiryDateTime);

            if (expiryDateTime <= triggerDateTime) {
                console.log("Expiry time is less than or equal to trigger time - showing error");
                setShowExpiryWarning(true);
                setErrorDialog({
                    isOpen: true,
                    message: t("scheduler.triggerdatetimewarning"),
                    type: 'warning'
                });
                scrollToSection(triggerExpiryRef, 'Schedule Trigger/Expiry On');
                return;
            }
        }

        // ========== DATA LOGGER ==========
        console.log("--- Processing Data Logger ---");

        if (dataLogger) {
            passObjDet["nDataLoggerStatus"] = 1;
        } else {
            passObjDet["nDataLoggerStatus"] = 0;
        }

        const daysVal = archivalDays;
        passObjDet["nDataLoggerArchivalDays"] = daysVal ? parseInt(daysVal) : 0;

        // ========== FINAL VALIDATION CHECK ==========
        console.log("--- Final Validation Check ---");
        console.log("IsEmpty:", IsEmpty);

        //recently
        if (IsEmpty) {
            console.log("Phase 2 validation failed - showing red borders AND error dialog");
            setErrorDialog({
                isOpen: true,
                message: t("errormsg.incompletedatafields"),
                type: 'information'
            });

            // Scroll to the first error section
            if (uncUsernameError || uncPasswordError || uncDomainError) {
                scrollToSection(fileSettingsRef, 'File Settings');
            } else if (levelValueError || filesOlderDaysError) {
                scrollToSection(uploadPolicyRef, 'Upload Policy');
            } else if (auditFilterError) {
                // Stay on current section (policies section)
            } else if (templateError || sampleFilenameError || delimiterError) {
                scrollToSection(schedulerMetadataRef, 'Scheduler Metadata');
            } else {
                scrollToSection(fileSettingsRef, 'File Settings');
            }

            return;
        }
        //========== BUILD COMPLETE passObjDet FOR SUBMISSION ==========


        console.log("--- Building Complete passObjDet Object ---");

        // Store the passObjDet in state
        setSubmitPassObjDet(passObjDet);

        // Get selected instrument data
        const selectedInstData = instrumentOptions.find(
            inst => inst.L12InstrumentMappingID === selectedInstrument
        );

        // In handleSubmit(), around line 4748:
        console.log("=== CHECKING INSTRUMENT TYPE ===");
        console.log("Full instrument data:", selectedInstData);

        // Check if it's manual parsing instrument
        // Manual = Interface=1, ParserType>0, AND LockType="M"
        const isManualParsing = selectedInstData &&
            selectedInstData.L11InterfaceStatus === 1 &&
            selectedInstData.L11ParserType > 0 &&
            selectedInstData.L11LockType === "M";  // MUST check for "M"

        console.log("Manual parsing check:", {
            interfaceStatus: selectedInstData?.L11InterfaceStatus,
            parserType: selectedInstData?.L11ParserType,
            lockType: selectedInstData?.L11LockType,
            isManual: isManualParsing
        });

        if (isManualParsing) {
            console.log("Manual parsing instrument detected");

            // Add the required property for parsing order check
            passObjDet["sInstrumentMappingID"] = selectedInstData.L12InstrumentMappingID;

            // Store updated passObjDet
            setSubmitPassObjDet(passObjDet);

            // Build request for parsing order check
            const checkParsingOrderData = {
                ...CF_activeUserdetails(),
                ...passObjDet
            };

            console.log("Calling CheckInstrumentExistwithParsingOrder...");

            const parsingOrderResponse = await postData(
                'Scheduler/CheckInstrumentExistwithParsingOrder',
                checkParsingOrderData
            );

            console.log("Parsing order response:", parsingOrderResponse);

            if (parsingOrderResponse && parsingOrderResponse.nParsingInstrOrderCount !== undefined) {
                if (parsingOrderResponse.nParsingInstrOrderCount >= 1) {
                    // Instrument is already locked - show 2-button dialog
                    console.log("Instrument locked - showing 2-button dialog");
                    // setSubmitDialogMessage("Do you want to Activate the Scheduler ? Instrument lock info: This instrument is already locked in parsing order.");

                    setSubmitDialogMessage(t("scheduler.confirmActivate"));
                    setSubmitDialogSubMessage(t("scheduler.instrumentlocksubmessage"));

                    setIsManualParsingInstrument(false);  // FALSE = 2 buttons                   
                    setShowSubmitDialog(true);
                } else {
                    // Instrument not locked - show 3-button dialog
                    console.log("Instrument not locked - showing 3-button dialog");
                    setIsManualParsingInstrument(true);  // TRUE = 3 buttons
                    setSubmitDialogMessage(t("scheduler.lockInstrumentAndActivate"));
                    setSubmitDialogSubMessage("");
                    setShowSubmitDialog(true);
                }
            }
        } else {
            // For ALL other instruments (automatic) show 2-button dialog directly
            console.log("Automatic instrument - showing 2-button dialog directly");
            setIsManualParsingInstrument(false);
            setSubmitDialogMessage(t("scheduler.confirmActivate"));
            setSubmitDialogSubMessage(""); // Or any submessage you want for automatic instruments
            setShowSubmitDialog(true);
        }
    };


    const handleFinalSubmission = async (action) => {
        console.log("=== Starting Final Submission ===");
        console.log("Action:", action);

        if (!submitPassObjDet) {
            console.error("No passObjDet data available");
            setErrorDialog({
                isOpen: true,
                message: t("scheduler.submissiondata"),
                type: 'error'
            });
            setShowSubmitDialog(false);
            return;
        }

        // Clone the passObjDet to avoid mutating state
        let passObjDet = { ...submitPassObjDet };

        // Check if audit trail is required
        const requiresAuditTrail = action === 'saveActivate' || action === 'activateLock';

        if (requiresAuditTrail) {
            // For Save & Activate OR Activate & Lock, show audit trail first
            console.log("Action requires audit trail:", action);
            setAuditAction(action);
            setAuditData(passObjDet); // Store the data for later use
            setShowAuditTrail(true);
            setShowSubmitDialog(false); // Close the confirmation dialog
            return; // Don't submit yet, wait for audit trail
        } else {
            // For 'save' action, submit directly (no audit trail needed)
            console.log("Save action - submitting directly");
            await submitWithAuditTrail(passObjDet, null, action);
        }
    };

    const submitWithAuditTrail = async (passObjDet, auditPayload, action) => {
        console.log("=== Submitting with audit trail ===");



        // Build final payload
        const finalData = {
            ...CF_activeUserdetails(),
            ...passObjDet
        };

        // Add audit trail if provided
        if (auditPayload) {
            finalData.AuditTrailValues = auditPayload.AuditTrailValues;
        }

        // // Set sActiveSchedule based on action
        // if (action === 'saveActivate' || action === 'activateLock') {
        //     finalData["sActiveSchedule"] = 1;
        // }

        if (action === 'saveActivate' || action === 'activateLock') {
            finalData["sActiveSchedule"] = 1;
        } else if (action === 'saveOnly') {  // ADD THIS CONDITION
            finalData["sActiveSchedule"] = 0;  // Explicitly set to 0 for save only
        }

        console.log("Final API request data:", finalData);
        setFullPageLoading(true);
        try {
            const response = await postData(
                'Scheduler/DataSchedulerSave',
                finalData
            );

            console.log("Scheduler creation response:", response);
            if (response && response.oResObj === "Success") {
                setShowSubmitDialog(false);

                // Get the instrument object
                const selectedInstObj = instrumentOptions.find(i => i.L12InstrumentMappingID === selectedInstrument);

                console.log('Selected Instrument Object for Navigation:', {
                    instrumentObject: selectedInstObj,
                    L12InstrumentID: selectedInstObj?.L12InstrumentID,
                    L12InstrumentMappingID: selectedInstObj?.L12InstrumentMappingID,
                    L11InstrumentID: selectedInstObj?.L11InstrumentID,
                    L11InterfaceStatus: selectedInstObj?.L11InterfaceStatus
                });

                // ================== CRITICAL FIX ==================
                // Determine the dropdown value that InstrumentLockTag expects
                let dropdownValue = '';

                if (selectedInstObj) {
                    // Get the instrument ID (L12InstrumentID) and clean it
                    const instrumentId = selectedInstObj.L12InstrumentID?.trim() || '';

                    // Check if it's an interface instrument
                    const isInterface = selectedInstObj.L11InterfaceStatus === 1;

                    if (isInterface) {
                        // IMPORTANT: For interface instruments, the format is "I7:53"
                        // The "53" should be the InterfaceID, NOT L12InstrumentMappingID

                        // Try to get the interface ID from different possible fields
                        const interfaceId = selectedInstObj.L11InterfaceID ||
                            selectedInstObj.InterfaceID ||
                            selectedInstObj.L12InstrumentMappingID?.trim() || // Fallback
                            '0';

                        // Clean the interface ID (remove spaces)
                        const cleanInterfaceId = interfaceId.toString().replace(/\s+/g, '');

                        // Create dropdown value: "I7:53"
                        dropdownValue = `${instrumentId}:${cleanInterfaceId}`;

                        console.log('Interface instrument format:', {
                            instrumentId,
                            interfaceId: cleanInterfaceId,
                            dropdownValue
                        });
                    } else {
                        // Non-interface instrument: just the instrument ID
                        dropdownValue = instrumentId;
                        console.log('Non-interface instrument:', { dropdownValue });
                    }
                }
                // ================== END CRITICAL FIX ==================

                // Build the submission data
                // In DataScheduler.jsx, when constructing submissionData:
                const submissionData = {
                    data: {
                        fromScheduler: true,

                        // Client data
                        clientId: selectedClient.trim(),
                        clientName: clientOptions.find(c => c.L06ClientID === selectedClient)?.L06ClientName || '',

                        // Instrument data - Send in multiple formats for matching
                        instrumentObj: selectedInstObj,
                        instrumentId: selectedInstObj?.L12InstrumentID?.trim() || '', // "I7"
                        instrumentMappingId: selectedInstObj?.L12InstrumentMappingID?.trim() || '', // "IM8"

                        // CRITICAL: Send the format that InstrumentLockTag actually uses
                        // From your logs, InstrumentLockTag uses "I7:53" format
                        // NOT "I7:IM8"
                        dropdownInstrumentId: `${selectedInstObj?.L12InstrumentID?.trim()}:53`, // "I7:53"

                        instrumentName: selectedInstObj?.L11InstrumentName?.trim() || '',

                        // Path data
                        pathTaskId: selectedDestination.trim(),
                        sourcePath: isUNCPathEnabled ? uncPath.trim() : sourcePath.trim(),

                        // Template
                        templateId: isSchedulerMetadataEnabled ? selectedTemplate.trim() : '',

                        // File name
                        fileName: filter.trim(),

                        // Other data
                        hasLIMSOrder: selectedInstObj?.L11InterfaceStatus === 1,
                        delimiter: selectedDelimiters,
                        sampleFilename: sampleFilename.trim(),
                        tagMasterData: tagMasterData
                    }
                };

                console.log('Sending to InstrumentLockTag:', {
                    dropdownInstrumentId: submissionData.data.dropdownInstrumentId,
                    sourcePath: submissionData.data.sourcePath
                });

                console.log('FINAL Navigation Data:', {
                    dropdownInstrumentId: submissionData.data.dropdownInstrumentId,
                    instrumentId: submissionData.data.instrumentId,
                    instrumentMappingId: submissionData.data.instrumentMappingId,
                    clientId: submissionData.data.clientId
                });

                // Navigate based on action
                if (action === 'activateLock') {
                    console.log('Navigating to Instrument Lock Tag tab');
                    navigateToInstrumentLockTag(submissionData);
                } else if (action === 'saveActivate') {
                    console.log('Navigating to Activated Task tab');
                    navigateToActivatedTask(submissionData);
                } else if (action === 'saveOnly') {
                    console.log('Navigating to Deactivated Task tab');
                    navigateToDeactivatedTask(submissionData);
                } else {
                    console.log('Navigating to Deactivated Task tab');
                    navigateToDeactivatedTask(submissionData);
                }

                // Reset form after navigation
                handleReset();
            }
            else {
                // Error handling (keep existing)
                const rawMessage = response?.oResObj;
                const errorMessage = beautifyErrorMessage(rawMessage) || t("scheduler.failedtocreatescheduler");
                const isPasswordError = errorMessage.toLowerCase().includes('password') ||
                    errorMessage.toLowerCase().includes('invalid') ||
                    errorMessage.includes('Invalid password');

                if (isPasswordError) {
                    setAuditPasswordError(true);
                    setShowAuditTrail(true);
                } else {
                    setErrorDialog({
                        isOpen: true,
                        message: errorMessage,
                        type: 'error'
                    });
                }
            }
        } catch (error) {
            console.error("Submission error:", error);
            setErrorDialog({
                isOpen: true,
                message: error.message || t("scheduler.errorwhilecreatingscheduler"),
                type: 'error'
            });
        } finally {
            setFullPageLoading(false);
            setSubmitPassObjDet(null);
        }
    };

    // const submitSchedulerUpdate = async (passObjDet, auditPayload) => {
    //     console.log("=== Submitting Scheduler Update ===");

    //     const finalData = {
    //         ...CF_activeUserdetails(),
    //         ...passObjDet,  // Already has bExist: true, L13TaskID, process: "edit"
    //         AuditTrailValues: auditPayload.AuditTrailValues
    //     };

    //     console.log("Final update API request data:", finalData);

    //     setFullPageLoading(true);
    //     try {
    //         const response = await postData(
    //             'Scheduler/DataSchedulerSave',
    //             finalData
    //         );

    //         console.log("Scheduler update response:", response);

    //         if (response && response.oResObj === "Success") {
    //             // Reset form
    //             handleReset();

    //             // Navigate back to EditTask
    //             setTimeout(() => {
    //                 if (navigationSource?.component === 'EditTask') {
    //                     navigateToEditTask({
    //                         scheduleId: navigationSource.scheduleId,
    //                         showSuccess: true  // Flag to show success message
    //                     });
    //                 } else {
    //                     navigateToEditTask();
    //                 }

    //                 // Show success dialog
    //                 // setErrorDialog({
    //                 //     isOpen: true,
    //                 //     message: t("scheduler.schedulerUpdatedSuccessfully"),
    //                 //     type: 'success'
    //                 // });
    //             }, 100);

    //         } else {
    //             const rawMessage = response?.oResObj;
    //             const errorMessage = beautifyErrorMessage(rawMessage) || t("scheduler.failedToUpdateScheduler");
    //             const isPasswordError = errorMessage.toLowerCase().includes('password') ||
    //                 errorMessage.toLowerCase().includes('invalid');

    //             if (isPasswordError) {
    //                 setAuditPasswordError(true);
    //                 setShowAuditTrail(true);
    //             } else {
    //                 setErrorDialog({
    //                     isOpen: true,
    //                     message: errorMessage,
    //                     type: 'error'
    //                 });
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Update submission error:", error);
    //         setErrorDialog({
    //             isOpen: true,
    //             message: error.message || t("scheduler.errorWhileUpdatingScheduler"),
    //             type: 'error'
    //         });
    //     } finally {
    //         setFullPageLoading(false);
    //         setSubmitPassObjDet(null);
    //     }
    // };

    // const handleAuditTrailAuthorized = async (auditPayload, action) => {
    //     console.log("=== Audit Trail Authorized ===");
    //     console.log("Action:", auditAction);
    //     console.log("Audit payload:", auditPayload);

    //     // Close audit trail dialog
    //     setShowAuditTrail(false);
    //     setAuditPasswordError(false);

    //     // Get the stored data
    //     let passObjDet = { ...auditData };

    //     if (!passObjDet) {
    //         console.error("No data available after audit trail");
    //         setErrorDialog({
    //             isOpen: true,
    //             message: t("scheduler.submissiondatamissingafteraudtitrail"),
    //             type: 'error'
    //         });
    //         return;
    //     }

    //     // Add sActiveSchedule for activate actions
    //     if (auditAction === 'saveActivate' || auditAction === 'activateLock') {
    //         passObjDet["sActiveSchedule"] = 1;
    //         console.log("Setting sActiveSchedule: 1 (Active)");
    //     }

    //     await submitWithAuditTrail(passObjDet, auditPayload, auditAction);

    //     // Clear audit trail state
    //     setAuditAction('');
    //     setAuditData(null);
    // };

    // const submitSchedulerUpdate = async (passObjDet, auditPayload) => {
    //     console.log("=== Submitting Scheduler Update ===");

    //     const finalData = {
    //         ...CF_activeUserdetails(),
    //         ...passObjDet,
    //         ...(auditPayload && { AuditTrailValues: auditPayload.AuditTrailValues })
    //     };

    //     console.log("Final update API request data:", finalData);

    //     setFullPageLoading(true);
    //     try {
    //         const response = await postData(
    //             'Scheduler/DataSchedulerSave',
    //             finalData
    //         );

    //         console.log("Scheduler update response:", response);

    //         if (response && response.oResObj && response.oResObj.bStatus === true) {
    //             // SUCCESS - Navigate back to EditTask
    //             navigateFromDataSchedulerToEditTask({
    //                 scheduleId: navigationSource?.scheduleId,
    //                 showSuccess: true,
    //                 message: response.oResObj.sInformation || t("scheduler.schedulerUpdatedSuccessfully"),
    //                 data: response
    //             });

    //             // Reset form
    //             handleReset();
    //         } else {
    //             // Error handling
    //             const errorMessage = response?.oResObj?.sInformation ||
    //                 response?.Message ||
    //                 t("scheduler.failedToUpdateScheduler");

    //             setErrorDialog({
    //                 isOpen: true,
    //                 message: errorMessage,
    //                 type: 'error'
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Update submission error:", error);
    //         setErrorDialog({
    //             isOpen: true,
    //             message: error.message || t("scheduler.errorWhileUpdatingScheduler"),
    //             type: 'error'
    //         });
    //     } finally {
    //         setFullPageLoading(false);
    //         setSubmitPassObjDet(null);
    //     }
    // };


    const submitSchedulerUpdate = async (passObjDet, auditPayload) => {
        console.log("=== Submitting Scheduler Update ===");

        // 1. Ensure bExist is false
        if (passObjDet.bExist !== false) {
            console.warn("⚠️ WARNING: bExist is not false. Fixing it...");
            passObjDet.bExist = false;
        }

        // 2. Ensure process is "edit"
        if (passObjDet.process !== "edit") {
            console.warn("⚠️ WARNING: process is not 'edit'. Fixing it...");
            passObjDet.process = "edit";
        }

        // 3. Add audit trail if provided
        const finalData = {
            ...passObjDet,
            ...(auditPayload && { AuditTrailValues: auditPayload.AuditTrailValues })
        };

        console.log("Final update API request data:", finalData);
        console.log("bExist:", finalData.bExist, "process:", finalData.process);

        setFullPageLoading(true);
        try {
            const response = await postData(
                'Scheduler/DataSchedulerSave',
                finalData
            );

            console.log("Scheduler update response:", response);

            if (response && response.oResObj && response.oResObj.bStatus === true) {
                // SUCCESS
                navigateFromDataSchedulerToEditTask({
                    scheduleId: navigationSource?.scheduleId,
                    showSuccess: true,
                    message: response.oResObj.sInformation || t("scheduler.schedulerUpdatedSuccessfully"),
                    data: response
                });

                handleReset();
            } else {
                const errorMessage = response?.oResObj?.sInformation ||
                    response?.Message ||
                    t("scheduler.failedToUpdateScheduler");

                setErrorDialog({
                    isOpen: true,
                    message: errorMessage,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error("Update submission error:", error);
            setErrorDialog({
                isOpen: true,
                message: error.message || t("scheduler.errorWhileUpdatingScheduler"),
                type: 'error'
            });
        } finally {
            setFullPageLoading(false);
            setSubmitPassObjDet(null);
        }
    };

    const handleAuditTrailAuthorized = async (auditPayload, action) => {
        console.log("=== Audit Trail Authorized ===");
        console.log("Action:", auditAction);
        console.log("Audit payload:", auditPayload);

        setShowAuditTrail(false);
        setAuditPasswordError(false);

        let passObjDet = { ...auditData };

        if (!passObjDet) {
            console.error("No data available after audit trail");
            setErrorDialog({
                isOpen: true,
                message: t("scheduler.submissiondatamissingafteraudtitrail"),
                type: 'error'
            });
            return;
        }

        // For update action, we don't set sActiveSchedule
        if (auditAction === 'update') {
            console.log("Update action - calling submitSchedulerUpdate");
            await submitSchedulerUpdate(passObjDet, auditPayload);  // Correct function
        } else {
            // For saveActivate or activateLock
            if (auditAction === 'saveActivate' || auditAction === 'activateLock') {
                passObjDet["sActiveSchedule"] = 1;
            }
            await submitWithAuditTrail(passObjDet, auditPayload, auditAction);
        }


        setAuditAction('');
        setAuditData(null);
    };

    const handleAuditTrailClose = () => {
        setShowAuditTrail(false);
        setAuditAction('');
        setAuditData(null);
        setAuditPasswordError(false);
    };


    // Helper function for final scheduler submission
    const submitScheduler = async (passObjDet) => {
        console.log("=== Submitting Scheduler ===");
        try {
            const finalData = {
                ...CF_activeUserdetails(),
                passObjDet: passObjDet
            };

            console.log("Final submission data:", finalData);

            const response = await postData(
                'Scheduler/DataSchedulerSave',
                finalData
            );

            console.log("Scheduler creation response:", response);

            if (response && response.success) {
                setErrorDialog({
                    isOpen: true,
                    message: t("scheduler.schedulercreatedsuccessfully"),
                    type: 'success'
                });
            } else {
                setErrorDialog({
                    isOpen: true,
                    message: response.message || t("scheduler.failedtocreatescheduler"),
                    type: 'error'
                });
            }
        } catch (error) {
            console.error("Scheduler submission error:", error);
            setErrorDialog({
                isOpen: true,
                message: error.message || t("scheduler.errorwhilecreatingscheduler"),
                type: 'error'
            });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            <FullPageLoader loading={fullPageLoading} text={t("common.loadingdata")} />
            <style>
                {`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* Disabled delimiter items */
        .disabled-delimiter {
            opacity: 0.6;
            filter: blur(0.3px);
            cursor: not-allowed !important;
        }
        
        /* High z-index for tooltips */
        .high-z-index {
            z-index: 99999 !important;
        }
        
        /* Metadata input styles */
        .metadata-input-disabled {
            background-color: transparent !important;
            border: none !important;
            cursor: not-allowed !important;
        }
            /* Add to your existing style tag */
.red-border-error {
  border-color: #ef4444 !important;
  border-width: 2px !important;
}

/* Add to your existing style tag */
.input-error {
  border-color: #ef4444 !important;
}

.text-error {
  color: #ef4444 !important;
}
    `}
            </style>

            {/* Fixed Navbar - Will not move because scrolling is handled in the div below */}
            <header className="z-10 bg-white border-b border-gray-200 shadow-sm flex-none h-16 sticky top-0">
                <div className="flex items-center justify-between px-8 h-full">
                    <nav className="flex space-x-6 h-full">
                        <NavItem
                            label="File Settings"
                            active={activeTab === 'File Settings'}
                            onClick={() => scrollToSection(fileSettingsRef, 'File Settings')}
                        />
                        <NavItem
                            label="Upload Policy"
                            active={activeTab === 'Upload Policy'}
                            onClick={() => scrollToSection(uploadPolicyRef, 'Upload Policy')}
                        />
                        <NavItem
                            label="Schedule Trigger/Expiry On"
                            active={activeTab === 'Schedule Trigger/Expiry On'}
                            onClick={() => scrollToSection(triggerExpiryRef, 'Schedule Trigger/Expiry On')}
                        />
                        <NavItem
                            label="Schedule Capture"
                            active={activeTab === 'Schedule Capture'}
                            onClick={() => scrollToSection(scheduleCaptureRef, 'Schedule Capture')}
                        />
                        <NavItem
                            label="Scheduler Metadata"
                            active={activeTab === 'Scheduler Metadata'}
                            onClick={() => scrollToSection(schedulerMetadataRef, 'Scheduler Metadata')}
                        />
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* EDIT MODE: Show Update & Cancel */}
                        {/* {mode === 'edit' && !isViewMode && ( */}
                        {(mode === 'edit' || navigationSource?.component === 'EditTask') && !isViewMode ? (
                            <>

                                <button
                                    onClick={() => {
                                        // Navigate back to Edit Task
                                        console.log('Cancel clicked - navigating back to Edit Task');

                                        // Reset form
                                        handleReset();

                                        // Navigate back
                                        if (navigationSource?.component === 'EditTask') {
                                            navigateToEditTask({ scheduleId: navigationSource.scheduleId });
                                        } else {
                                            navigateToEditTask();
                                        }
                                        // Clear navigation source
                                        // setTimeout(() => {
                                        //     if (scheduleId) {
                                        //         navigateToEditTask({
                                        //             scheduleId: scheduleId,
                                        //             fromCancel: true
                                        //         });
                                        //     } else {
                                        //         navigateToEditTask();
                                        //     }

                                        //     // Clear navigation source
                                        //     setNavigationSource(null);
                                        // }, 100);
                                    }}
                                    className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-[5px] text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <span>{t("button.cancel")}</span>
                                </button>

                                <button
                                    onClick={handleUpdate}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-[5px] shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                                >
                                    <Check size={16} strokeWidth={3} />
                                    <span>{t("button.update")}</span>
                                </button>
                            </>
                        ) :
                            !isViewMode && mode === 'create' ? (
                                <>
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 px-4 py-2.5 rounded-[5px] text-sm font-medium transition-all duration-200"
                                    >
                                        <RefreshCw size={16} />
                                        <span>{t("button.reset")}</span>
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-[5px] shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                                    >
                                        <Check size={16} strokeWidth={3} />
                                        <span>{t("button.submit")}</span>
                                    </button>
                                </>
                            ) : isViewMode ? (

                                <button
                                    onClick={() => {
                                        console.log('Close clicked, current navigation:', {
                                            navigationState,
                                            navigationSource
                                        });

                                        let sourceComponent = navigationSource?.component;
                                        let scheduleId = navigationSource?.scheduleId;
                                        let innerTab = navigationSource?.innerTab;

                                        if (!sourceComponent && navigationState?.data) {
                                            const navData = navigationState.data;
                                            sourceComponent = navData.sourceComponent || navData.innerTab;
                                            scheduleId = navData.scheduleId;
                                            innerTab = navData.innerTab;
                                        }

                                        console.log('Determined source:', {
                                            sourceComponent,
                                            scheduleId,
                                            innerTab
                                        });

                                        setIsViewMode(false);
                                        setMode('create');
                                        handleReset();

                                        setTimeout(() => {
                                            if (sourceComponent === 'DeactivatedTask' || innerTab === 'Deactivated Task') {
                                                console.log('Navigating to Deactivated Task');
                                                navigateToDeactivatedTask({ scheduleId });
                                            } else if (sourceComponent === 'ActivatedTask' || innerTab === 'Activated Task') {
                                                console.log('Navigating to Activated Task');
                                                navigateToActivatedTask({ scheduleId });
                                            } else if (sourceComponent === 'RetiredTask' || innerTab === 'Retired Task') {
                                                console.log('Navigating to Retired Task');
                                                navigateToRetiredTask({ scheduleId });
                                            } else if (sourceComponent === 'EditTask' || innerTab === 'Edit Task') {
                                                console.log('Navigating to Edit Task');
                                                navigateToEditTask({ scheduleId });
                                            } else {
                                                console.log('Unknown source, defaulting to Activated Task');
                                                navigateToDataScheduler();
                                            }

                                            setNavigationSource(null);
                                        }, 100);
                                    }}
                                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    <span>{t("button.close")}</span>
                                </button>
                            ) : null}
                    </div>
                </div>
            </header>
            {/* <header className="z-10 bg-white border-b border-gray-200 shadow-sm flex-none h-16 sticky top-0">
                <div className="flex items-center justify-between px-8 h-full">
                    <nav className="flex space-x-6 h-full">
                        <NavItem
                            label="File Settings"
                            active={activeTab === 'File Settings'}
                            onClick={() => scrollToSection(fileSettingsRef, 'File Settings')}
                        />
                        <NavItem
                            label="Upload Policy"
                            active={activeTab === 'Upload Policy'}
                            onClick={() => scrollToSection(uploadPolicyRef, 'Upload Policy')}
                        />
                        <NavItem
                            label="Schedule Trigger/Expiry On"
                            active={activeTab === 'Schedule Trigger/Expiry On'}
                            onClick={() => scrollToSection(triggerExpiryRef, 'Schedule Trigger/Expiry On')}
                        />
                        <NavItem
                            label="Schedule Capture"
                            active={activeTab === 'Schedule Capture'}
                            onClick={() => scrollToSection(scheduleCaptureRef, 'Schedule Capture')}
                        />
                        <NavItem
                            label="Scheduler Metadata"
                            active={activeTab === 'Scheduler Metadata'}
                            onClick={() => scrollToSection(schedulerMetadataRef, 'Scheduler Metadata')}
                        />
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                           
                            {mode === 'edit' && !isViewMode && (
                                <>
                                    <button
                                        onClick={handleUpdate}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-[5px] shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                                    >
                                        <Check size={16} strokeWidth={3} />
                                        <span>{t("button.update")}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMode('create');
                                            setIsViewMode(false);
                                            handleReset();

                                            // Navigate back to source
                                            if (navigationSource?.component === 'EditTask') {
                                                navigateToEditTask();
                                            }
                                        }}
                                        className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-[5px] text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        <span>{t("button.cancel")}</span>
                                    </button>
                                </>
                            )}

                            
                            {!isViewMode && mode === 'create' && (
                                <>
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 px-4 py-2.5 rounded-[5px] text-sm font-medium transition-all duration-200"
                                    >
                                        <RefreshCw size={16} />
                                        <span>{t("button.reset")}</span>
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-[5px] shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                                    >
                                        <Check size={16} strokeWidth={3} />
                                        <span>{t("button.submit")}</span>
                                    </button>
                                </>
                            )}

                           
                            {isViewMode && (
                                <button
                                    onClick={() => {
                                        console.log('Close clicked, current navigation:', {
                                            navigationState,
                                            navigationSource
                                        });

                                        // Get the source from multiple places for reliability
                                        let sourceComponent = navigationSource?.component;
                                        let scheduleId = navigationSource?.scheduleId;
                                        let innerTab = navigationSource?.innerTab;

                                        // Also check navigationState as fallback
                                        if (!sourceComponent && navigationState?.data) {
                                            const navData = navigationState.data;
                                            sourceComponent = navData.sourceComponent || navData.innerTab;
                                            scheduleId = navData.scheduleId;
                                            innerTab = navData.innerTab;
                                        }

                                        console.log('Determined source:', {
                                            sourceComponent,
                                            scheduleId,
                                            innerTab
                                        });

                                        // Reset form state
                                        setIsViewMode(false);
                                        setMode('create');
                                        handleReset();

                                        // Navigate back based on source
                                        setTimeout(() => {
                                            if (sourceComponent === 'DeactivatedTask' || innerTab === 'Deactivated Task') {
                                                console.log('Navigating to Deactivated Task');
                                                navigateToDeactivatedTask({ scheduleId });
                                            } else if (sourceComponent === 'ActivatedTask' || innerTab === 'Activated Task') {
                                                console.log('Navigating to Activated Task');
                                                navigateToActivatedTask({ scheduleId });
                                            } else if (sourceComponent === 'RetiredTask' || innerTab === 'Retired Task') {
                                                console.log('Navigating to Retired Task');
                                                navigateToRetiredTask({ scheduleId });
                                            } else if (sourceComponent === 'EditTask' || innerTab === 'Edit Task') {
                                                console.log(' Navigating to Edit Task');
                                                navigateToEditTask({ scheduleId });
                                            } else {
                                                console.log('Unknown source, defaulting to Activated Task');
                                                navigateToDataScheduler();
                                            }

                                            // Clear source
                                            setNavigationSource(null);
                                        }, 100); // Small delay to ensure reset completes
                                    }}
                                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    <span>{t("button.close")}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header> */}

            {/* Scrollable Content Area - Attach ref here */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto pt-4 relative"
            >
                <main className="px-2">
                    <div className="max-w-8xl mx-auto space-y-8 pb-20">
                        {/* File Settings Section */}
                        <div
                            ref={fileSettingsRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="File Settings" />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-12 mb-12">
                                <div className="space-y-10">
                                    <div className="w-80 mr-4">
                                        <AnimatedDropdown
                                            label={t("label.clientName")}
                                            name="clientName"
                                            showRedAsterisk
                                            options={clientOptions}
                                            displayKey="L06ClientName"
                                            valueKey="L06ClientID"
                                            value={selectedClient || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSelectedClient(value);
                                                setClientError(false);
                                                if (value) {
                                                    loadInstruments(value);
                                                } else {
                                                    setInstrumentOptions([]);
                                                    setIsInstrumentDisabled(true);
                                                    setSelectedInstrument('');
                                                    setMethodOptions([]);
                                                    setIsMethodDisabled(true);
                                                    setSelectedMethod('');
                                                }
                                            }}
                                            showError={clientError}
                                            errorOnEmptyOnly={false}
                                            required={true}
                                            // disabled={isViewMode || isReadOnly}
                                            disabled={isFieldDisabled('client')}
                                        />
                                    </div>
                                    <div className="w-80 mr-4">
                                        <AnimatedDropdown
                                            label={t("label.instrument")}
                                            name="instrument"
                                            showRedAsterisk
                                            options={instrumentOptions}
                                            displayKey="L11InstrumentName"
                                            valueKey="L12InstrumentMappingID"
                                            value={selectedInstrument || ""}
                                            onChange={async (e) => {
                                                const value = e.target.value;
                                                const selectedInstrData = instrumentOptions.find(
                                                    inst => inst.L12InstrumentMappingID === value
                                                );

                                                if (selectedInstrData) {
                                                    const canProceed = await checkAutoLock(selectedInstrData.L12InstrumentID);
                                                    if (canProceed) {
                                                        setSelectedInstrument(value);
                                                        setInstrumentError(false);
                                                        setSelectedMethod('');
                                                        await loadMethods(selectedInstrData);
                                                    }
                                                } else {
                                                    setSelectedInstrument('');
                                                    setInstrumentError(false);
                                                    setSelectedMethod('');
                                                    setMethodOptions([]);
                                                    setIsMethodDisabled(true);
                                                }
                                            }}
                                            // disabled={isInstrumentDisabled || isViewMode || isReadOnly}
                                            disabled={isInstrumentDisabled || isFieldDisabled('instrument')}
                                            showError={instrumentError}
                                            errorOnEmptyOnly={false}
                                            // CUSTOM STYLING for disabled state (blue background):
                                            disabledClassName="opacity-50 cursor-not-allowed bg-gray-50 border-[rgb(145,220,243)]"
                                            errorClassName="border-red-500"
                                        />
                                    </div>
                                    <div className="w-80 mr-4">
                                        <AnimatedDropdown
                                            label={t("scheduler.defaultparsermethod")}
                                            name="defaultParserMethod"
                                            options={methodOptions}
                                            displayKey="InstMethodName"
                                            valueKey="InstMethodName"
                                            value={selectedMethod || ""}
                                            onChange={(e) => {
                                                setSelectedMethod(e.target.value);
                                                setMethodError(false);
                                            }}
                                            disabled={isMethodDisabled || isViewMode || isReadOnly}
                                            hasError={methodError}

                                            // CUSTOM STYLING for disabled state (blue background):
                                            disabledClassName="opacity-50 cursor-not-allowed bg-gray-50 border-[rgb(145,220,243)]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <label className="block text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.pathtype")}</label>
                                        <div
                                            className={`flex items-center gap-3 pt-1 ${isViewMode || isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'
                                                }`}
                                            onClick={() => {
                                                if (isViewMode || isReadOnly) return;

                                                if (isUNCPathEnabled) {
                                                    setIsUNCPathEnabled(false);
                                                    setUncPath('');
                                                    setUncUsername('');
                                                    setUncPassword('');
                                                    setUncPathError(false);
                                                    setUncUsernameError(false);
                                                    setUncPasswordError(false);
                                                    setUncDomainError(false);
                                                }
                                            }}
                                        >
                                            <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.localpath")}</span>
                                            <div
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${!isUNCPathEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${!isUNCPathEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="flex items-end gap-3">
                                            <div className="w-80 mr-4">
                                                <AnimatedInput
                                                    label={t("scheduler.sourcepath")}
                                                    name="sourcePath"
                                                    value={sourcePath}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (CF_sourcePathValidation(value) && CF_textFieldValidation(value)) {
                                                            setSourcePath(value);
                                                            setSourcePathError(false);
                                                        }
                                                    }}
                                                    // disabled={isUNCPathEnabled || isViewMode || isReadOnly}
                                                    disabled={isUNCPathEnabled || isFieldDisabled('sourcePath')}
                                                    required={!isUNCPathEnabled}
                                                    showError={sourcePathError}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={validateAndShowCheckPathModal}
                                                disabled={isUNCPathEnabled || isViewMode || isReadOnly}
                                                className={`bg-blue-50 mb-3.5 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors ${isUNCPathEnabled || isViewMode || isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                <Check size={16} strokeWidth={3} /> {t("button.check")}
                                            </button>
                                        </div>
                                        <p className="text-[#808080] text-[11px] font-['Helvetica_Neue',Helvetica,Arial]">
                                            {t("scheduler.manualpathnote")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[#0049B0] font-bold font-roboto text-[14px] mb-5">{t("scheduler.unccredentials")}</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-10">
                                    <div className="space-y-5">
                                        <div
                                            className={`flex items-center gap-4 ${isFieldDisabled('pathType') ? 'cursor-not-allowed' : 'cursor-pointer'
                                                }`}
                                            onClick={() => {
                                                if (isFieldDisabled('pathType')) return;
                                                if (isViewMode || isReadOnly) return;

                                                if (!isUNCPathEnabled) {
                                                    setIsUNCPathEnabled(true);
                                                    setSourcePath('');
                                                    setSourcePathError(false);
                                                }
                                            }}
                                        >
                                            <label className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.uncpath")}</label>
                                            <div
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${isUNCPathEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${isUNCPathEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>

                                        </div>
                                        <div>
                                            <div className="flex items-end gap-3">
                                                <div className='w-80 mr-4'>
                                                    <AnimatedInput
                                                        label={t("scheduler.uncpath")}
                                                        name="uncPath"
                                                        value={uncPath}
                                                        onChange={(e) => {
                                                            setUncPath(e.target.value);
                                                            setUncPathError(false);
                                                        }}
                                                        // disabled={!isUNCPathEnabled || isViewMode || isReadOnly}
                                                        disabled={!isUNCPathEnabled || isFieldDisabled('uncPath')}
                                                        required={isUNCPathEnabled}
                                                        showError={uncPathError}
                                                    />
                                                </div>

                                                {/* </div> */}
                                                <button
                                                    type="button"
                                                    onClick={validateAndShowUNCPathModal}
                                                    disabled={!isUNCPathEnabled || isViewMode || isReadOnly}
                                                    className={`bg-blue-50 mb-3.5 text-blue-600 border-1 border-gray-500 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors mb-1 ${!isUNCPathEnabled || isViewMode || isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                >
                                                    <Check size={16} strokeWidth={3} /> {t("button.check")}
                                                </button>
                                            </div>
                                            <p className="text-[#808080] text-[11px] font-['Helvetica_Neue',Helvetica,Arial]">
                                                {t("scheduler.manualpathnote")}</p>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="flex justify-start">
                                                <div className="w-80">
                                                    <AnimatedInput
                                                        label={t("label.userName")}
                                                        name="uncUsername"
                                                        value={uncUsername}
                                                        onChange={(e) => {
                                                            if (CF_textFieldValidation(e.target.value)) {
                                                                setUncUsername(e.target.value);
                                                                setUncUsernameError(false);
                                                            }
                                                        }}
                                                        // disabled={!isUNCPathEnabled || isViewMode || isReadOnly}
                                                        disabled={!isUNCPathEnabled || isFieldDisabled('uncUsername')}
                                                        required={isUNCPathEnabled}
                                                        showError={uncUsernameError}
                                                    />
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div className="flex justify-start">
                                                <div className="w-80">
                                                    <AnimatedInput
                                                        label={t("label.password")}
                                                        name="uncPassword"
                                                        type="password"
                                                        value={uncPassword}
                                                        onChange={(e) => {
                                                            if (CF_textFieldValidation(e.target.value)) {
                                                                setUncPassword(e.target.value);
                                                                setUncPasswordError(false);
                                                            }
                                                        }}
                                                        // disabled={!isUNCPathEnabled || isViewMode || isReadOnly}
                                                        disabled={!isUNCPathEnabled || isFieldDisabled('uncPassword')}
                                                        required={isUNCPathEnabled}
                                                        showError={uncPasswordError}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-80 mr-4">
                                            <AnimatedDropdown
                                                label={t("label.domain")}
                                                name="domain"
                                                options={domainOptions}
                                                displayKey="L03DomainName"
                                                valueKey="L03DomainID"
                                                value={selectedDomain}
                                                onChange={(e) => {
                                                    setSelectedDomain(e.target.value);
                                                    setUncDomainError(false);
                                                }}
                                                // disabled={!isUNCPathEnabled || isViewMode || isReadOnly}
                                                disabled={!isUNCPathEnabled || isFieldDisabled('uncDomain')}
                                                required={isUNCPathEnabled}
                                                showError={uncDomainError}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-10">
                                        <div className='w-80 mr-4'>
                                            <AnimatedDropdown
                                                label={t("label.destination")}
                                                name="destination"
                                                options={destinationOptions}
                                                displayKey="L09FTPAliasName"
                                                valueKey="L09FTPID"
                                                value={selectedDestination}
                                                onChange={(e) => {
                                                    setSelectedDestination(e.target.value);
                                                    setDestinationError(false);
                                                }}
                                                required={true}
                                                showError={destinationError}
                                                showRedAsterisk={true}
                                                // disabled={isViewMode || isReadOnly}
                                                disabled={isFieldDisabled('destination')}
                                            />
                                        </div>
                                        <div className="w-80 mr-4">
                                            <AnimatedInput
                                                label={t("label.filter")}
                                                name="filter"
                                                value={filter}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (CF_textFieldValidation(value) && CF_maxLengthValidation(value, 50)) {
                                                        setFilter(value);
                                                        setFilterError(false);
                                                    }
                                                }}
                                                required={true}
                                                showError={filterError}
                                            // disabled={isViewMode || isReadOnly}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upload Policy Section */}
                        <div
                            ref={uploadPolicyRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            {/* <SectionHeader title="Upload Policy" /> */}
                            <h3 className="text-[#0049B0] font-bold font-roboto text-[14px] mb-5">{t("scheduler.uploadpolicy")}</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-12">
                                {/* Left Column */}
                                <div className="space-y-8">
                                    <SquareCheckbox
                                        label={t("scheduler.includesubfolder")}
                                        checked={includeSubfolder}
                                        onChange={() => {
                                            const newValue = !includeSubfolder;
                                            setIncludeSubfolder(newValue);

                                            if (newValue) {
                                                setCompleteTree(true);
                                                setLevelEnabled(false);
                                            } else {
                                                setCompleteTree(false);
                                                setLevelEnabled(false);
                                                setLevelValue('');
                                                setLevelValueError(false);
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.completetree")}</span>
                                            <div
                                                onClick={() => {
                                                    if (includeSubfolder) {
                                                        const newCompleteTree = !completeTree;
                                                        setCompleteTree(newCompleteTree);

                                                        if (newCompleteTree) {
                                                            setLevelEnabled(false);
                                                        }
                                                    }
                                                }}
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${includeSubfolder ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                                    } ${completeTree ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${completeTree ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.level")}</span>
                                                <div
                                                    onClick={() => {
                                                        if (includeSubfolder) {
                                                            const newLevelEnabled = !levelEnabled;
                                                            setLevelEnabled(newLevelEnabled);
                                                            // When Level is turned ON, turn OFF Complete Tree
                                                            if (newLevelEnabled) {
                                                                setCompleteTree(false);
                                                            }
                                                        }
                                                    }}
                                                    className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${includeSubfolder ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                                        } ${levelEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${levelEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                </div>
                                            </div>
                                            <AnimatedInput
                                                label=""
                                                name="levelValue"
                                                value={levelValue}
                                                onChange={(e) => {
                                                    if (CF_numberValidation(e.target.value, 5)) {
                                                        setLevelValue(e.target.value);
                                                        setLevelValueError(false);
                                                    }
                                                }}
                                                disabled={!levelEnabled || !includeSubfolder}
                                                required={levelEnabled && includeSubfolder}
                                                showError={levelValueError}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 pt-2">
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                            if (!copyFiles) {
                                                setCopyFiles(true);
                                                setMoveFiles(false);
                                            }
                                        }}>
                                            <span className={`text-[12px] font-roboto text-[#405F7D] font-semibold`}>{t("scheduler.copyfiles")}</span>
                                            <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${copyFiles ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${copyFiles ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                            if (!moveFiles) {
                                                setMoveFiles(true);
                                                setCopyFiles(false);
                                                // When Move Files is ON, disable and uncheck Delete local copy
                                                setDeleteLocalCopy(false);
                                                setFilesOlderThanEnabled(false);
                                                setFilesOlderThanDateEnabled(false);
                                            }
                                        }}>
                                            <span className={`text-[12px] font-roboto text-[#405F7D] font-semibold`}>{t("scheduler.movepermanently")}</span>
                                            <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${moveFiles ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${moveFiles ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
                                    {/* Delete Local Copy Checkbox */}
                                    <div
                                        className="flex items-center gap-3 cursor-pointer group"
                                        onClick={() => {
                                            if (!moveFiles) {
                                                const newValue = !deleteLocalCopy;
                                                setDeleteLocalCopy(newValue);

                                                if (newValue) {

                                                    setFilesOlderThanEnabled(true);
                                                    setFilesOlderThanDateEnabled(false);
                                                } else {

                                                    setFilesOlderThanEnabled(false);
                                                    setFilesOlderThanDateEnabled(false);
                                                }
                                            }
                                        }}
                                    >
                                        <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${moveFiles
                                            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                                            : deleteLocalCopy
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300 group-hover:border-blue-400'
                                            }`}>
                                            {deleteLocalCopy && <Check size={14} className={moveFiles ? 'text-gray-400' : 'text-white'} strokeWidth={3} />}
                                        </div>
                                        <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.deletelocalcopy")}</span>
                                    </div>

                                    {/* First Files older than (number) */}
                                    <div className="flex items-end gap-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">
                                                {t("scheduler.filesolderthan")}
                                            </span>

                                            {/* Toggle Switch */}
                                            <div
                                                onClick={() => handleFilesOlderToggle('number')}
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors 
      ${(deleteLocalCopy && !moveFiles) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
      ${filesOlderThanEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform 
      ${filesOlderThanEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                        <div className="w-16">
                                            <AnimatedInput
                                                label=""
                                                name="filesOlderDays"
                                                value={filesOlderDays}
                                                onChange={(e) => {
                                                    if (CF_numberValidation(e.target.value, 5)) {
                                                        setFilesOlderDays(e.target.value);
                                                        setFilesOlderDaysError(false);
                                                    }
                                                }}
                                                disabled={!filesOlderThanEnabled || !deleteLocalCopy || moveFiles}
                                                required={filesOlderThanEnabled && deleteLocalCopy && !moveFiles}
                                                showError={filesOlderDaysError}
                                            />
                                        </div>
                                        {/* Days dropdown */}
                                        <div className="w-24">
                                            <AnimatedDropdown
                                                label=""
                                                name="filesOlderDaysUnit"
                                                options={daysCombo}
                                                displayKey="Date"
                                                valueKey="Number"
                                                value={filesOlderDaysUnit}
                                                onChange={(e) => setFilesOlderDaysUnit(e.target.value)}
                                                disabled={!filesOlderThanEnabled || !deleteLocalCopy}
                                            />
                                        </div>
                                        {/* Automatic/Manual dropdown - SAME LINE */}
                                        <div className="w-24">
                                            <AnimatedDropdown
                                                label=""
                                                name="localDeleteMode"
                                                options={localDeleteCombo}
                                                displayKey="LocalDeleteName"
                                                valueKey="LocalDeleteNo"
                                                value={localDeleteMode}
                                                onChange={(e) => {
                                                    console.log("localDeleteMode changed to:", e.target.value);
                                                    console.log("Options available:", localDeleteCombo);
                                                    setLocalDeleteMode(Number(e.target.value))
                                                }}
                                                disabled={!deleteLocalCopy || moveFiles}
                                            />
                                        </div>
                                    </div>

                                    {/* Second Files older than (date) */}
                                    <div className="flex items-end gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">
                                                {t("scheduler.filesolderthan")}
                                            </span>

                                            {/* Toggle Switch */}
                                            <div
                                                onClick={() => handleFilesOlderToggle('date')}
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors 
      ${(deleteLocalCopy && !moveFiles) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
      ${filesOlderThanDateEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform 
      ${filesOlderThanDateEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>



                                        <DatePickerInput
                                            value={filesOlderThanDate}
                                            onChange={handleFilesOlderDateChange}
                                            disabled={!filesOlderThanDateEnabled || !deleteLocalCopy || moveFiles}
                                            allowFuture={false}
                                            allowPast={true}
                                            validateAndFormatDate={validateAndFormatDate}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Schedule Trigger/Expiry On Section */}
                        <div
                            ref={triggerExpiryRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            {/* <SectionHeader title="Schedule Trigger/Expiry On" /> */}
                            <h3 className='text-[#0049B0] font-bold font-roboto text-[14px] mb-5'>{t("scheduler.scheduletriggerorexpiryon")}</h3>
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <label className="text-[12px] font-roboto text-[#405F7D] font-semibold"> {t("scheduler.triggeron")}</label>

                                    <DatePickerInput
                                        value={triggerDate}
                                        onChange={handleTriggerDateChange}
                                        allowPast={false}
                                        allowFuture={true}
                                        validateAndFormatDate={validateAndFormatDate}
                                    />


                                    <TimePicker
                                        value={triggerTime}
                                        onChange={(time) => {
                                            setTriggerTime(time);
                                            setShowExpiryWarning(false);
                                            setShowTriggerWarning(false); // Clear trigger warning when time changes
                                        }}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-24"></div>
                                    <div className="-ml-28 flex items-center gap-4">
                                        <SquareCheckbox
                                            label={t("scheduler.expirydatetime")}
                                            boldLabel
                                            checked={expiryEnabled}
                                            onChange={() => {
                                                setExpiryEnabled(!expiryEnabled);
                                                setShowExpiryWarning(false); // Clear warning when toggling
                                            }}
                                        />

                                        <DatePickerInput
                                            value={expiryDate}
                                            onChange={handleExpiryDateChange}
                                            disabled={!expiryEnabled}
                                            allowPast={false}
                                            allowFuture={true}
                                            validateAndFormatDate={validateAndFormatDate}
                                        />

                                        <TimePicker
                                            value={expiryTime}
                                            onChange={(time) => {
                                                setExpiryTime(time);
                                                setShowExpiryWarning(false); // Clear warning when time changes
                                            }}
                                            disabled={!expiryEnabled}
                                        />
                                    </div>
                                </div>
                                {showTriggerWarning && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-24"></div>
                                        <div className="-ml-24 mt-2">
                                            <div className="bg-yellow-400 text-white px-4 py-2 rounded text-sm font-medium inline-block">
                                                {t("scheduler.triggerdatetimewarning")}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Policies & Logger Section */}
                        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-[#0049B0] font-bold font-roboto text-[14px]"> {t("scheduler.filedeletepolicy")}</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer group"
                                                onClick={() => {
                                                    // if (!moveFiles) {
                                                    const newValue = !applyDeletePolicy;
                                                    setApplyDeletePolicy(newValue);
                                                    // }
                                                }}
                                            >
                                                <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${applyDeletePolicy
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'bg-white border-gray-300 group-hover:border-blue-400'
                                                    }`}>
                                                    {applyDeletePolicy && <Check size={14} className={moveFiles ? 'text-gray-400' : 'text-white'} strokeWidth={3} />}
                                                </div>
                                                <label className="text-[12px] font-roboto text-[#405F7D] font-semibold whitespace-nowrap">
                                                    {t("scheduler.applydeletepolicyforserverfiles")}
                                                </label>
                                            </div>
                                            <div className="w-32">
                                                <AnimatedDropdown
                                                    label=""
                                                    name="serverDeleteMode"
                                                    options={serverDeleteCombo}
                                                    displayKey="ServerDeleteName"
                                                    valueKey="ServerDeleteNo"
                                                    value={serverDeleteMode}
                                                    onChange={(e) => setServerDeleteMode(Number(e.target.value))}
                                                    disabled={!applyDeletePolicy}
                                                />
                                            </div>
                                        </div>
                                        <SquareCheckbox
                                            label={t("scheduler.enablefilelink")}
                                            boldLabel
                                            checked={enableFileLink}
                                            onChange={() => setEnableFileLink(!enableFileLink)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-[#0049B0] font-bold font-roboto text-[14px]"> {t("scheduler.compliancepolicy")}</h3>
                                    <div className="space-y-6">
                                        <SquareCheckbox
                                            label={t("scheduler.enablefileaudit")}
                                            boldLabel
                                            checked={enableFileAudit}
                                            onChange={() => {
                                                setEnableFileAudit(!enableFileAudit);
                                                if (!enableFileAudit) {
                                                    // If turning ON, no error to clear
                                                } else {
                                                    // If turning OFF, clear audit filter error
                                                    setAuditFilterError(false); // ADD THIS
                                                }
                                            }}
                                        />
                                        <div className="flex items-center gap-4">
                                            <label className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.auditfilter")}</label>
                                            <div className="w-50 mr-4">
                                                <AnimatedInput
                                                    label=""
                                                    name="auditFilter"
                                                    value={auditFilter}
                                                    onChange={(e) => {
                                                        if (CF_textFieldValidation(e.target.value)) {
                                                            setAuditFilter(e.target.value);
                                                            setAuditFilterError(false);
                                                        }
                                                    }}
                                                    disabled={!enableFileAudit}
                                                    required={enableFileAudit}
                                                    showError={auditFilterError}
                                                />
                                            </div>
                                            {/* </div> */}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-[#0049B0] font-bold font-roboto text-[14px]">{t("scheduler.datalogger")}</h3>
                                    <div className="space-y-6">
                                        <SquareCheckbox
                                            label={t("scheduler.datalogger")}
                                            boldLabel
                                            checked={dataLogger}
                                            onChange={() => setDataLogger(!dataLogger)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <label className="text-[12px] font-roboto text-[#405F7D] font-semibold ">{t("scheduler.archival")}</label>
                                            <div className="w-50 mr-2 ml-2">
                                                <AnimatedInput
                                                    label=""
                                                    name="archivalDays"
                                                    value={archivalDays}
                                                    onChange={(e) => {
                                                        if (CF_numberValidation(e.target.value, 5)) {
                                                            setArchivalDays(e.target.value);
                                                        }
                                                    }}
                                                    disabled={!dataLogger}
                                                />
                                            </div>
                                            <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.daysolder")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Capture Section */}
                        <div
                            ref={scheduleCaptureRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            {/* <SectionHeader title="Schedule Capture" /> */}
                            <h3 className="text-[#0049B0] font-bold font-roboto text-[14px] mb-5">{t("scheduler.schedulecapture")}</h3>
                            <div className="space-y-6">
                                <SquareCheckbox
                                    label={t("scheduler.livecapture")}
                                    boldLabel
                                    checked={liveCapture}
                                    onChange={() => {
                                        const newValue = !liveCapture;
                                        setLiveCapture(newValue);

                                        if (newValue) {
                                            // Reset to default versioning options
                                            setLiveCaptureVersioning(true);
                                            setOneVersionPerDay(false);
                                            setScheduleWithVersioning(false);
                                        } else {
                                            // Reset to schedule options
                                            setOneTime(true);
                                            setDaily(false);
                                            setWeekly(false);
                                            setMonthly(false);
                                            setScheduleWithoutVersioning(false);
                                        }
                                    }}
                                />

                                {liveCapture ? (
                                    // Live Capture Versioning Options
                                    <div className="flex items-center gap-8 pl-1">
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                            if (!liveCaptureVersioning) {
                                                setLiveCaptureVersioning(true);
                                                setOneVersionPerDay(false);
                                                setScheduleWithVersioning(false);
                                            }
                                        }}>
                                            <span className={`text-[12px] font-roboto text-[#405F7D] font-semibold`}>
                                                {t("scheduler.livecaptureversioning")}
                                            </span>
                                            <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${liveCaptureVersioning ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${liveCaptureVersioning ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                            if (!oneVersionPerDay) {
                                                setOneVersionPerDay(true);
                                                setLiveCaptureVersioning(false);
                                                setScheduleWithVersioning(false);
                                            }
                                        }}>
                                            <span className={`text-[12px] font-roboto text-[#405F7D] font-semibold`}>
                                                {t("scheduler.oneversionperday")}
                                            </span>
                                            <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${oneVersionPerDay ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${oneVersionPerDay ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={() => {
                                                if (!scheduleWithVersioning) {
                                                    setScheduleWithVersioning(true);
                                                    setLiveCaptureVersioning(false);
                                                    setOneVersionPerDay(false);
                                                }
                                            }}
                                        >
                                            <span
                                                className={`text-[12px] font-roboto text-[#405F7D] font-semibold`}
                                            >
                                                {t("scheduler.withoutversioning")}
                                            </span>

                                            <div
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${scheduleWithVersioning ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <div
                                                    className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${scheduleWithVersioning ? 'translate-x-4' : 'translate-x-0'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                ) : (
                                    // Schedule Options (One Time, Daily, Weekly, Monthly)
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-6">
                                            <RadioToggle
                                                label={t("scheduler.onetime")}
                                                checked={oneTime}
                                                onChange={() => {
                                                    setOneTime(true);
                                                    setDaily(false);
                                                    setWeekly(false);
                                                    setMonthly(false);
                                                    setScheduleWithoutVersioning(false); // Uncheck when One Time is selected
                                                }}
                                            />
                                            <RadioToggle
                                                label={t("scheduler.daily")}
                                                checked={daily}
                                                onChange={() => {
                                                    setDaily(true);
                                                    setOneTime(false);
                                                    setWeekly(false);
                                                    setMonthly(false);
                                                }}
                                            />
                                            <RadioToggle
                                                label={t("scheduler.weekly")}
                                                checked={weekly}
                                                onChange={() => {
                                                    setWeekly(true);
                                                    setOneTime(false);
                                                    setDaily(false);
                                                    setMonthly(false);
                                                }}
                                            />
                                            <RadioToggle
                                                label={t("scheduler.monthly")}
                                                checked={monthly}
                                                onChange={() => {
                                                    setMonthly(true);
                                                    setOneTime(false);
                                                    setDaily(false);
                                                    setWeekly(false);
                                                    // Set Day toggle ON by default
                                                    setMonthlyDayToggle(true);
                                                    setMonthlyOnToggle(false);
                                                }}
                                            />
                                            <SquareCheckbox
                                                label={scheduleWithVersioning
                                                    ? t("scheduler.withversioning")
                                                    : t("scheduler.withoutversioning")}
                                                boldLabel
                                                checked={scheduleWithVersioning}
                                                onChange={() => setScheduleWithVersioning(prev => !prev)}
                                                disabled={oneTime}
                                            />

                                        </div>

                                        {/* One Time Schedule UI */}
                                        {oneTime && (
                                            <div className="flex items-center gap-4 pl-4">
                                                <label className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.day")}</label>
                                                <DatePickerInput
                                                    value={oneTimeDate}
                                                    onChange={handleOneTimeDateChange}
                                                    allowPast={false}
                                                    allowFuture={true}
                                                    validateAndFormatDate={validateAndFormatDate}
                                                />
                                            </div>
                                        )}

                                        {/* Daily Schedule UI */}
                                        {daily && (
                                            <div className="flex gap-6 pl-4">
                                                {/* LEFT: Repeat checkbox */}
                                                <div className="flex items-center">
                                                    <SquareCheckbox
                                                        label={t("scheduler.repeattask")}
                                                        boldLabel
                                                        checked={dailyRepeatTask}
                                                        onChange={() => setDailyRepeatTask(!dailyRepeatTask)}
                                                    />
                                                </div>

                                                {/* RIGHT: Every fields */}
                                                <div className="space-y-4">
                                                    {/* Every Day */}
                                                    <div className="flex items-center gap-4">
                                                        <label className="text-[12px] font-roboto text-[#405F7D] font-semibold w-16">{t("scheduler.every")}</label>
                                                        <AnimatedInput
                                                            label=""
                                                            name="dailyEveryDays"
                                                            type="number"
                                                            value={dailyEveryDays}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '' || /^[0-9]+$/.test(value)) {
                                                                    setDailyEveryDays(value);
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.day")}</span>
                                                    </div>

                                                    {/* Every Hour & Minute */}
                                                    <div className="flex items-center gap-4">
                                                        <label className="text-[12px] font-roboto text-[#405F7D] font-semibold w-16">{t("scheduler.every")}</label>
                                                        <div className="relative group">
                                                            <div className="w-32">
                                                                <AnimatedInput
                                                                    label=""
                                                                    name="dailyEveryHours"
                                                                    type="number"
                                                                    value={dailyEveryHours}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '') {
                                                                            setDailyEveryHours('');
                                                                            return;
                                                                        }
                                                                        const num = parseInt(value);
                                                                        if (!isNaN(num) && num >= 0 && num <= 24) {
                                                                            setDailyEveryHours(value);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            {dailyEveryHours !== '' && parseInt(dailyEveryHours) > 24 && (
                                                                <div className="absolute left-0 -bottom-6 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                    {t("scheduler.valuevalidationforhour")}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.hour")}</span>

                                                        <div className="relative group">
                                                            <div className="w-32">
                                                                <AnimatedInput
                                                                    label=""
                                                                    name="dailyEveryMinutes"
                                                                    type="number"
                                                                    value={dailyEveryMinutes}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '') {
                                                                            setDailyEveryMinutes('');
                                                                            return;
                                                                        }
                                                                        const num = parseInt(value);
                                                                        if (!isNaN(num) && num >= 0 && num <= 59) {
                                                                            setDailyEveryMinutes(value);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            {dailyEveryMinutes !== '' && parseInt(dailyEveryMinutes) > 59 && (
                                                                <div className="absolute left-0 -bottom-6 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                    {t("scheduler.valuevalidationforminute")}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("scheduler.minute")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Weekly Schedule UI */}
                                        {weekly && (
                                            <div className="pl-4 space-y-3">
                                                <div className="grid grid-cols-3 gap-3">
                                                    {Object.keys(weeklyDays).map((day) => (
                                                        <SquareCheckbox
                                                            key={day}
                                                            label={day}
                                                            checked={weeklyDays[day]}
                                                            onChange={() => setWeeklyDays({
                                                                ...weeklyDays,
                                                                [day]: !weeklyDays[day]
                                                            })}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Monthly Schedule UI */}
                                        {monthly && (
                                            <div className="space-y-4 pl-4">

                                                <div className="flex items-center gap-4">
                                                    <label className="text-[12px] font-roboto text-[#405F7D] font-semibold w-20">{t("scheduler.month")}</label>
                                                    <input
                                                        type="text"
                                                        value={showMonthSelector ? tempSelectedMonths.join(', ') : monthlySelectedMonths.join(', ')}
                                                        readOnly
                                                        className="w-96 border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 cursor-not-allowed"
                                                    />
                                                    <div className="relative">
                                                        <ActionButton
                                                            label={t("scheduler.month")}
                                                            className="bg-[#E6F0FF] text-[#2883FE]"
                                                            onClick={(e) => {
                                                                e.stopPropagation();

                                                                if (showMonthSelector) {
                                                                    setMonthlySelectedMonths(tempSelectedMonths);
                                                                    setShowMonthSelector(false);
                                                                    return;
                                                                }

                                                                setTempSelectedMonths(monthlySelectedMonths);
                                                                setShowMonthSelector(true);
                                                                setShowDaySelector(false);
                                                                setShowWeekSelector(false);
                                                                setShowWeekdaysSelector(false);
                                                            }}
                                                        />

                                                        {showMonthSelector && (
                                                            <SelectorDropdown
                                                                options={monthOptions.map(m => m.Month)}
                                                                selectedValues={tempSelectedMonths}
                                                                onSelect={(month) => {
                                                                    setTempSelectedMonths(prev =>
                                                                        prev.includes(month)
                                                                            ? prev.filter(m => m !== month)
                                                                            : [...prev, month]
                                                                    );
                                                                }}
                                                                searchTerm={monthlySearchTermMonth}
                                                                onSearchChange={setMonthlySearchTermMonth}
                                                                isOpen
                                                                onClose={() => {
                                                                    setMonthlySelectedMonths(tempSelectedMonths);
                                                                    setShowMonthSelector(false);
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Day Toggle and Selector */}
                                                <div className="flex flex-wrap items-start gap-4 relative">
                                                    <label className="text-[12px] font-roboto text-[#405F7D] font-semibold w-8 pt-2">{t("scheduler.day")}</label>

                                                    <div
                                                        onClick={() => {
                                                            if (monthlyOnToggle) {
                                                                setMonthlyDayToggle(true);
                                                                setMonthlyOnToggle(false);
                                                                setShowWeekSelector(false);
                                                                setShowWeekdaysSelector(false);
                                                            }
                                                        }}
                                                        className={`w-8 h-4 mt-2 flex items-center rounded-full p-0.5 transition-colors
            ${monthlyOnToggle ? 'cursor-pointer' : 'pointer-events-none'}
            ${monthlyDayToggle ? 'bg-blue-500' : 'bg-gray-300'}`}
                                                    >
                                                        <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform
            ${monthlyDayToggle ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </div>

                                                    {/* Show temporary selections while dropdown is open, final selections when closed */}
                                                    <input
                                                        type="text"
                                                        value={showDaySelector ? tempSelectedDays.join(', ') : monthlySelectedDays.join(', ')}
                                                        readOnly
                                                        className="w-96 border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 cursor-not-allowed"
                                                    />

                                                    <div className="relative">
                                                        <ActionButton
                                                            label={t("scheduler.day")}
                                                            className="bg-[#E6F0FF] text-[#2883FE]"
                                                            disabled={!monthlyDayToggle}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!monthlyDayToggle) return;


                                                                if (showDaySelector) {
                                                                    setMonthlySelectedDays(tempSelectedDays);
                                                                    setShowDaySelector(false);
                                                                    return;
                                                                }


                                                                setTempSelectedDays(monthlySelectedDays);
                                                                setShowDaySelector(true);
                                                                setShowWeekSelector(false);
                                                                setShowWeekdaysSelector(false);
                                                            }}
                                                        />


                                                        {showDaySelector && (
                                                            <SelectorDropdown
                                                                options={Array.from({ length: 31 }, (_, i) => i + 1)}
                                                                selectedValues={tempSelectedDays} // Use temp state
                                                                onSelect={(day) => {
                                                                    setTempSelectedDays(prev =>
                                                                        prev.includes(day)
                                                                            ? prev.filter(d => d !== day)
                                                                            : [...prev, day].sort((a, b) => a - b)
                                                                    );
                                                                }}
                                                                searchTerm={monthlySearchTerm}
                                                                onSearchChange={setMonthlySearchTerm}
                                                                isOpen
                                                                onClose={() => {
                                                                    // Save selections and close
                                                                    setMonthlySelectedDays(tempSelectedDays);
                                                                    setShowDaySelector(false);
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                {/* On / Week / Weekdays */}
                                                <div className="space-y-4">
                                                    {/* First Row: On Toggle + Week Input + Week Button */}
                                                    <div className="flex flex-wrap items-start gap-4">
                                                        <label className="text-[12px] font-roboto text-[#405F7D] font-semibold w-8 pt-2">{t("scheduler.on")}</label>

                                                        <div
                                                            onClick={() => {
                                                                if (monthlyDayToggle) {
                                                                    setMonthlyOnToggle(true);
                                                                    setMonthlyDayToggle(false);
                                                                    setShowDaySelector(false);
                                                                }
                                                            }}
                                                            className={`w-8 h-4 mt-2 flex items-center rounded-full p-0.5 transition-colors
            ${monthlyDayToggle ? 'cursor-pointer' : 'pointer-events-none'}
            ${monthlyOnToggle ? 'bg-blue-500' : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform
            ${monthlyOnToggle ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </div>

                                                        {/* Week Input */}
                                                        <input
                                                            type="text"
                                                            value={showWeekSelector ? tempSelectedWeeks.join(', ') : monthlySelectedWeeks.join(', ')}
                                                            readOnly
                                                            className="w-96 border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 cursor-not-allowed"
                                                        />

                                                        {/* Week Button */}
                                                        <div className="relative">
                                                            <ActionButton
                                                                label={t("scheduler.week")}
                                                                className={`${!monthlyOnToggle ? '' : 'bg-[#E6F0FF] text-[#2883FE]'}`}
                                                                disabled={!monthlyOnToggle}

                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!monthlyOnToggle) return;

                                                                    if (showWeekSelector) {
                                                                        setMonthlySelectedWeeks(tempSelectedWeeks);
                                                                        setShowWeekSelector(false);
                                                                        return;
                                                                    }

                                                                    setTempSelectedWeeks(monthlySelectedWeeks);
                                                                    setShowWeekSelector(true);
                                                                }}


                                                            />

                                                            {showWeekSelector && (
                                                                <SelectorDropdown
                                                                    // options={['First', 'Second', 'Third', 'Fourth', 'Fifth']}
                                                                    options={weekOptions.map(w => w.weeks)}
                                                                    selectedValues={tempSelectedWeeks}
                                                                    onSelect={(week) => {
                                                                        setTempSelectedWeeks(prev =>
                                                                            prev.includes(week)
                                                                                ? prev.filter(w => w !== week)
                                                                                : [...prev, week]
                                                                        );
                                                                    }}
                                                                    searchTerm={monthlySearchTerm}
                                                                    onSearchChange={setMonthlySearchTerm}
                                                                    isOpen
                                                                    onClose={() => {
                                                                        setMonthlySelectedWeeks(tempSelectedWeeks);
                                                                        setShowWeekSelector(false);
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Second Row: Weekdays Input + Weekdays Button */}
                                                    <div className="flex flex-wrap items-start gap-4 pl-20">
                                                        {/* Weekdays Input */}
                                                        <input
                                                            type="text"
                                                            value={showWeekdaysSelector ? tempSelectedWeekdays.join(', ') : monthlySelectedWeekdays.join(', ')}
                                                            readOnly
                                                            className="w-96 ml-4 border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 cursor-not-allowed"
                                                        />

                                                        {/* Weekdays Button */}
                                                        <div className="relative">
                                                            <ActionButton
                                                                label={t("scheduler.weekdays")}
                                                                className={`${!monthlyOnToggle ? '' : 'bg-[#E6F0FF] text-[#2883FE]'}`}
                                                                disabled={!monthlyOnToggle}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();

                                                                    if (!monthlyOnToggle) return;


                                                                    if (showWeekdaysSelector) {
                                                                        setMonthlySelectedWeekdays(tempSelectedWeekdays);
                                                                        setShowWeekdaysSelector(false);
                                                                        return;
                                                                    }

                                                                    setTempSelectedWeekdays(monthlySelectedWeekdays);
                                                                    setShowWeekdaysSelector(true);
                                                                }}
                                                            />


                                                            {showWeekdaysSelector && (
                                                                <SelectorDropdown
                                                                    options={weekdayOptions.map(d => d.days)}
                                                                    selectedValues={tempSelectedWeekdays}
                                                                    onSelect={(day) => {
                                                                        setTempSelectedWeekdays(prev =>
                                                                            prev.includes(day)
                                                                                ? prev.filter(d => d !== day)
                                                                                : [...prev, day]
                                                                        );
                                                                    }}
                                                                    searchTerm={monthlySearchTerm}
                                                                    onSearchChange={setMonthlySearchTerm}
                                                                    isOpen
                                                                    onClose={() => {
                                                                        setMonthlySelectedWeekdays(tempSelectedWeekdays);
                                                                        setShowWeekdaysSelector(false);
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scheduler Metadata Section */}
                        <div
                            ref={schedulerMetadataRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            {/* <SectionHeader title="Scheduler Metadata" /> */}
                            <h3 className="text-[#0049B0] font-bold font-roboto text-[14px] mb-5">{t("scheduler.schedulermetadata")}</h3>
                            <div className="mb-8">
                                <SquareCheckbox
                                    label={t("scheduler.enableschedulermetadata")}
                                    boldLabel
                                    checked={isSchedulerMetadataEnabled}
                                    onChange={() => {
                                        setIsSchedulerMetadataEnabled(!isSchedulerMetadataEnabled);

                                        // ADD THIS - Clear all metadata-related errors when unchecking
                                        if (isSchedulerMetadataEnabled) {
                                            // Turning OFF - clear all errors
                                            setTemplateError(false);
                                            setSampleFilenameError(false);
                                            setDelimiterError(false);
                                            setTagRowErrors([]);
                                            setRuleGridError(false);
                                        }

                                    }}
                                />
                            </div>

                            {isSchedulerMetadataEnabled && (
                                <div className="space-y-8">


                                    <div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6 mb-6">
                                            <div className="w-80 mr-4">
                                                <AnimatedDropdown
                                                    label={t("scheduler.templatemaster")}
                                                    name="templateMaster"
                                                    options={templateOptions}
                                                    displayKey="sTemplateName"
                                                    valueKey="sTemplateID"
                                                    value={selectedTemplate}
                                                    onChange={(e) => {
                                                        setSelectedTemplate(e.target.value);
                                                        setTemplateError(false);
                                                        if (isSchedulerMetadataEnabled) {
                                                            loadTagMaster(e.target.value);
                                                        }
                                                    }}
                                                    required={isSchedulerMetadataEnabled}
                                                    showError={templateError}
                                                    // disabled={isViewMode || isReadOnly}
                                                    disabled={isFieldDisabled()}
                                                />
                                            </div>

                                            {/* Sample Filename Input */}
                                            <div className="w-full">
                                                <div className='w-80 mr-4'>
                                                    <AnimatedInput
                                                        label={t("scheduler.samplefilename")}
                                                        name="sampleFilename"
                                                        value={sampleFilename}
                                                        onChange={(e) => {
                                                            setSampleFilename(e.target.value);
                                                            if (e.target.value.trim()) {
                                                                const hasExtension = e.target.value.includes('.') &&
                                                                    e.target.value.lastIndexOf('.') < e.target.value.length - 1;
                                                                if (hasExtension) {
                                                                    setSampleFilenameError(false);
                                                                }
                                                            }
                                                        }}
                                                        required={true}
                                                        showError={sampleFilenameError}
                                                        placeholder="e.g., sample~data.pdf"
                                                        showRedAsterisk={true}
                                                        // disabled={isViewMode || isReadOnly}
                                                        disabled={isFieldDisabled()}
                                                    />
                                                </div>
                                                {sampleFilenameError && (
                                                    <p className="text-red-500 text-xs -mt-3">
                                                        {t("scheduler.samplefilenamevalidation")}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Delimiter Multi-Select */}
                                            {/* <div className="group w-full relative">
                                                <div className="w-80 mr-4">
                                                    <AnimatedDropdown
                                                        label="Delimiter"
                                                        name="delimiter"
                                                        options={delimiterOptions.map(d => ({
                                                            value: d.sDelimiter,
                                                            label: d.sDelimiterName,
                                                        }))}
                                                        value={selectedDelimiters}
                                                        onChange={(e) => {
                                                            // setSelectedDelimiters(e.target.value);
                                                            // setDelimiterError(false);
                                                            const values = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                                                            setSelectedDelimiters(values);
                                                            setDelimiterError(false);
                                                        }}

                                                        isMulti={true}
                                                        keepOpenOnSelect={true}
                                                        handleSpecialNone={true}
                                                        isSearchable={true}
                                                        required={true}
                                                        disabled={isViewMode || isReadOnly}
                                                        showError={delimiterError}
                                                        // showError={delimiterError || (tagMasterData.some(tag => tag.sSourceFlag === 'File') && !selectedDelimiters.length)}
                                                        errorClassName="border-red-500"
                                                        showRedAsterisk={true}
                                                        // Add this prop to display current selection
                                                        displayValue={(value) => {
                                                            if (Array.isArray(value) && value.length > 0) {
                                                                return value.map(v => {
                                                                    const delimiterObj = delimiterOptions.find(d =>
                                                                        d.sDelimiter === v || d.sDelimiterName === v
                                                                    );
                                                                    return delimiterObj ? delimiterObj.sDelimiterName : v;
                                                                }).join(', ');
                                                            }
                                                            return "Click to select delimiters...";
                                                        }}
                                                    />
                                                </div> */}
                                            <div className="group w-full relative">
                                                <div className="w-80 mr-4">
                                                    <AnimatedDropdown
                                                        label={t("scheduler.delimiter")}
                                                        name="delimiter"
                                                        options={delimiterOptions.map(d => ({
                                                            value: d.sDelimiter,
                                                            label: d.sDelimiterName,
                                                        }))}
                                                        value={selectedDelimiters}
                                                        onChange={(e) => {
                                                            const values = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                                                            setSelectedDelimiters(values);
                                                            setDelimiterError(false);
                                                        }}
                                                        isMulti={true}
                                                        keepOpenOnSelect={true}
                                                        handleSpecialNone={true}
                                                        isSearchable={true}
                                                        required={true}
                                                        // disabled={isViewMode || isReadOnly}
                                                        disabled={isFieldDisabled()}
                                                        showError={delimiterError}
                                                        errorOnEmptyOnly={false}
                                                        errorClassName="border-red-500"
                                                        showRedAsterisk={true}
                                                        displayValue={(value) => {
                                                            if (Array.isArray(value) && value.length > 0) {
                                                                return value.map(v => {
                                                                    const delimiterObj = delimiterOptions.find(d =>
                                                                        d.sDelimiter === v || d.sDelimiterName === v
                                                                    );
                                                                    return delimiterObj ? delimiterObj.sDelimiterName : v;
                                                                }).join(', ');
                                                            }
                                                            return t("scheduler.delimitervalidation");
                                                        }}
                                                    />
                                                </div>


                                                {/* Dropdown - RESTORED */}
                                                {showDelimiterSelector && (
                                                    <div
                                                        className="absolute left-0 top-full mt-1"
                                                        style={{
                                                            zIndex: 99999
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <SelectorDropdown
                                                            options={delimiterOptions.map(d => d.sDelimiterName)}
                                                            selectedValues={tempSelectedDelimiters.map(d => {
                                                                const delimiterObj = delimiterOptions.find(opt => opt.sDelimiter === d);
                                                                return delimiterObj ? delimiterObj.sDelimiterName : d;
                                                            })}
                                                            onSelect={(delimiterName) => {
                                                                const delimiterObj = delimiterOptions.find(opt => opt.sDelimiterName === delimiterName);
                                                                if (!delimiterObj) return;

                                                                const delimiterChar = delimiterObj.sDelimiter;
                                                                let newSelections;

                                                                if (delimiterChar.toUpperCase() === 'NONE') {
                                                                    if (tempSelectedDelimiters.includes('NONE')) {
                                                                        newSelections = [];
                                                                    } else {
                                                                        newSelections = ['NONE'];
                                                                    }
                                                                } else {
                                                                    const filtered = tempSelectedDelimiters.filter(d => d.toUpperCase() !== 'NONE');
                                                                    if (filtered.includes(delimiterChar)) {
                                                                        newSelections = filtered.filter(d => d !== delimiterChar);
                                                                    } else {
                                                                        newSelections = [...filtered, delimiterChar];
                                                                    }
                                                                }

                                                                setTempSelectedDelimiters(newSelections);
                                                                setSelectedDelimiters(newSelections);
                                                                setDelimiterError(false);

                                                                if (delimiterChar.toUpperCase() === 'NONE' && newSelections.includes('NONE')) {
                                                                    setShowDelimiterSelector(false);
                                                                }
                                                            }}
                                                            searchTerm={delimiterSearchTerm}
                                                            onSearchChange={setDelimiterSearchTerm}
                                                            isOpen={true}
                                                            onClose={() => {
                                                                setSelectedDelimiters(tempSelectedDelimiters);
                                                                setShowDelimiterSelector(false);
                                                            }}
                                                            disabledOptions={isNoneSelected ? delimiterOptions.filter(d => d.sDelimiter.toUpperCase() !== 'NONE').map(d => d.sDelimiterName) : []}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg overflow-visible relative">
                                            <div className="border border-[#f3f3f3] rounded relative">
                                                {/* Header */}
                                                <div className="grid grid-cols-3 bg-[#fbfbfb] border-b border-[#f3f3f3]">
                                                    <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("common.tagName")}</div>
                                                    <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("scheduler.extractfrom")}</div>
                                                    <div className="px-1 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("scheduler.metadata")}</div>
                                                </div>

                                                {/* Body */}
                                                <div className="bg-white min-h-[250px]">
                                                    {tagMasterData && tagMasterData.length > 0 ? (
                                                        tagMasterData.map((tag, index) => (
                                                            <TagMasterRow
                                                                key={tag.sTagID}
                                                                tag={tag}
                                                                index={index}
                                                                parsedMetadata={parsedMetadata}
                                                                showMetadataTooltip={showMetadataTooltip}
                                                                setShowMetadataTooltip={setShowMetadataTooltip}
                                                                setParsedMetadata={setParsedMetadata}
                                                                parseMetadataFromFilename={parseMetadataFromFilename}
                                                                sampleFilename={sampleFilename}
                                                                selectedDelimiters={selectedDelimiters}
                                                                sampleFilenameError={sampleFilenameError}
                                                                setSampleFilenameError={setSampleFilenameError}
                                                                delimiterError={delimiterError}
                                                                setDelimiterError={setDelimiterError}
                                                                delimiterOptions={delimiterOptions}
                                                                tagRowErrors={tagRowErrors}
                                                                isSelected={selectedTagRowIndex === index}
                                                                onSelect={() => setSelectedTagRowIndex(index)}
                                                                onRowDataChange={handleTagRowDataChange}
                                                                isViewMode={isViewMode}
                                                                isReadOnly={isReadOnly}
                                                                // disabled={isViewMode || isReadOnly}
                                                                // disabled={isFieldDisabled()}
                                                                isFieldDisabled={isFieldDisabled}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-12 text-center text-xs text-[#4b4b4b] font-roboto">
                                                            {t("scheduler.taggridvalidation")}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-12">
                                        <h3 className="text-[12px] font-roboto text-[#405F7D] font-semibold mb-4">{t("scheduler.rule")}</h3>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-6 mb-6">
                                            <div className='w-80 mr-4'>
                                                <AnimatedDropdown
                                                    label={t("scheduler.rulename")}
                                                    name="ruleName"
                                                    options={ruleNameOptions}
                                                    displayKey="RuleName"
                                                    valueKey="RuleID"
                                                    value={selectedRuleName}
                                                    onChange={(e) => setSelectedRuleName(e.target.value)}
                                                    placeholder="Select Tag"
                                                    // disabled={isViewMode || isReadOnly}
                                                    disabled={isFieldDisabled()}
                                                />
                                            </div>

                                            {/* Metadata Input with error styling */}
                                            <div className="group w-full relative">
                                                <div className='w-80 mr-4'>
                                                    <AnimatedInput
                                                        label={t("scheduler.metadata")}
                                                        name="newRuleMetadata"
                                                        value={newRuleMetadata}
                                                        onChange={(e) => {
                                                            setNewRuleMetadata(e.target.value);
                                                            setRuleGridError(false);
                                                        }}
                                                        required={true}
                                                        showError={ruleGridError && !newRuleMetadata.trim()}
                                                        showRedAsterisk={true}
                                                        // disabled={isViewMode || isReadOnly}
                                                        disabled={isFieldDisabled()}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rule Grid Input - Styled like TagGrid */}
                                        <div className={`border rounded-lg overflow-hidden mb-4 transition-colors ${ruleGridError ? 'border-red-500 border-2' : 'border-[#f3f3f3]'
                                            }`}>
                                            {/* Header */}
                                            <div className="grid grid-cols-3 bg-[#fbfbfb] border-b border-[#f3f3f3]">
                                                <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("common.tagName")}</div>
                                                <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("scheduler.relationaloperator")}</div>
                                                <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("scheduler.fieldvalue")}</div>
                                            </div>

                                            {/* Body */}
                                            <div className={`bg-white min-h-[250px] ${isViewMode || isReadOnly ? 'opacity-60 pointer-events-none' : ''}`}>
                                                <div className="grid grid-cols-3 border-b border-[#e7e6e6] min-h-[40px] bg-white">

                                                    {/* Tag Name Column */}
                                                    <div className="px-4 py-2 relative flex items-center">
                                                        <div className="flex-1 flex items-center justify-between">
                                                            <div className={`text-xs font-['verdana'] ${newRuleTagName ? 'text-[#373737]' : 'text-gray-400 italic'}`}>
                                                                {newRuleTagName || "Click to select"}
                                                            </div>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (showTagNameSelector) {
                                                                        setShowTagNameSelector(false);
                                                                        setTagNameSearchTerm('');
                                                                    } else {
                                                                        setShowTagNameSelector(true);
                                                                        setShowRelOpSelector(false);
                                                                        setRuleGridError(false);
                                                                    }
                                                                }}
                                                                className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool"
                                                                title={t("scheduler.selecttagname")}
                                                            >
                                                                <EditPencilIcon />
                                                            </button>
                                                        </div>

                                                        {/* Tag Name Selector Dropdown - UPDATED TO MATCH TAG GRID STYLE */}
                                                        {/* Tag Name Selector Dropdown */}
                                                        {showTagNameSelector && (
                                                            <div
                                                                ref={(el) => {
                                                                    if (el) {
                                                                        const titleText = t("scheduler.selecttagname");
                                                                        const pencilButton = document.querySelector(`[title="${titleText}"]`);
                                                                        if (pencilButton) {
                                                                            const rect = pencilButton.getBoundingClientRect();
                                                                            el.style.position = 'fixed';
                                                                            el.style.left = `${rect.left - 264}px`;
                                                                            el.style.top = `${rect.top}px`;
                                                                        }
                                                                    }
                                                                }}
                                                                className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {/* Search Input */}
                                                                <div className="p-0.5 border-gray-200">
                                                                    <div className="mb-0">
                                                                        <input
                                                                            type="text"
                                                                            placeholder={t("common.lookingfor")}
                                                                            value={tagNameSearchTerm}
                                                                            onChange={(e) => setTagNameSearchTerm(e.target.value)}
                                                                            className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
                                                                            autoFocus
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Options List */}
                                                                <div className="flex-1 overflow-y-auto min-h-0">
                                                                    {tagMasterData
                                                                        .filter(tag =>
                                                                            tag.sTagName.toLowerCase().includes(tagNameSearchTerm.toLowerCase())
                                                                        )
                                                                        .map((tag) => {
                                                                            const isSelected = tempSelectedTagName === tag.sTagName;
                                                                            return (
                                                                                <div
                                                                                    key={tag.sTagID}
                                                                                    onClick={() => {
                                                                                        // Only set temporary selection for highlighting
                                                                                        setTempSelectedTagName(tag.sTagName);
                                                                                    }}
                                                                                    onDoubleClick={() => {
                                                                                        // On double click, set actual value and close
                                                                                        setNewRuleTagName(tag.sTagName);
                                                                                        setTempSelectedTagName('');
                                                                                        setShowTagNameSelector(false);
                                                                                        setTagNameSearchTerm('');
                                                                                        setRuleGridError(false);
                                                                                    }}
                                                                                    className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
                                ${isSelected ? 'bg-[#f2f2f2]' : ''}
                                ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
                            `}
                                                                                >
                                                                                    <div className="flex items-center ml-1">
                                                                                        <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
                                                                                            {tag.sTagName}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    }
                                                                </div>

                                                                {/* Footer with buttons */}
                                                                <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
                                                                    <button
                                                                        onClick={() => {
                                                                            if (tempSelectedTagName) {
                                                                                // Set actual value from temp selection
                                                                                setNewRuleTagName(tempSelectedTagName);
                                                                                setTempSelectedTagName('');
                                                                                setShowTagNameSelector(false);
                                                                                setTagNameSearchTerm('');
                                                                                setRuleGridError(false);
                                                                            }
                                                                        }}
                                                                        className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
                                                                        disabled={!tempSelectedTagName}
                                                                    >
                                                                        <i className="fa fa-check-square-o mr-1"></i>
                                                                        {t("button.submit")}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setTempSelectedTagName('');
                                                                            setShowTagNameSelector(false);
                                                                            setTagNameSearchTerm('');
                                                                        }}
                                                                        className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
                                                                    >
                                                                        <i className="fa fa-times mr-1"></i>
                                                                        {t("button.cancel")}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Relational Operator Column */}
                                                    <div className="px-4 py-2 relative flex items-center">
                                                        <div className="flex-1 flex items-center justify-between">
                                                            <div className={`text-xs font-['verdana'] ${newRuleRelationalOp ? 'text-[#373737]' : 'text-gray-400 italic'}`}>
                                                                {newRuleRelationalOp || "Click to select"}
                                                            </div>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (showRelOpSelector) {
                                                                        setShowRelOpSelector(false);
                                                                        setRelOpSearchTerm('');
                                                                    } else {
                                                                        setShowRelOpSelector(true);
                                                                        setShowTagNameSelector(false);
                                                                        setRuleGridError(false);
                                                                    }
                                                                }}
                                                                className="gridcellpopuppenciltool ilat_tagvaluetooltip gridcellinlinedittool"
                                                                title={t("scheduler.selectrelationaloperator")}
                                                            >
                                                                <EditPencilIcon />
                                                            </button>
                                                        </div>

                                                        {/* Relational Operator Selector Dropdown - UPDATED TO MATCH TAG GRID STYLE */}
                                                        {/* Relational Operator Selector Dropdown */}
                                                        {showRelOpSelector && (
                                                            <div
                                                                ref={(el) => {
                                                                    if (el) {
                                                                        // const pencilButton = document.querySelector('[title="Select relational operator"]');
                                                                        const titleText = t("scheduler.selectrelationaloperator");
                                                                        const pencilButton = document.querySelector(`[title="${titleText}"]`);
                                                                        if (pencilButton) {
                                                                            const rect = pencilButton.getBoundingClientRect();
                                                                            el.style.position = 'fixed';
                                                                            el.style.left = `${rect.left - 264}px`;
                                                                            el.style.top = `${rect.top}px`;
                                                                        }
                                                                    }
                                                                }}
                                                                className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg w-[250px] h-[220px] flex flex-col"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {/* Search Input */}
                                                                <div className="p-0.5 border-gray-200">
                                                                    <div className="mb-0">
                                                                        <input
                                                                            type="text"
                                                                            placeholder={t("common.lookingfor")}
                                                                            value={relOpSearchTerm}
                                                                            onChange={(e) => setRelOpSearchTerm(e.target.value)}
                                                                            className="w-full h-6 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-roboto font-['verdana']"
                                                                            autoFocus
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Options List */}
                                                                <div className="flex-1 overflow-y-auto min-h-0">
                                                                    {relationalOperatorOptions
                                                                        .filter(op =>
                                                                            op.label.toLowerCase().includes(relOpSearchTerm.toLowerCase())
                                                                        )
                                                                        .map((op) => {
                                                                            const isSelected = tempSelectedRelOp === op.value;
                                                                            return (
                                                                                <div
                                                                                    key={op.value}
                                                                                    onClick={() => {
                                                                                        // Only set temporary selection for highlighting
                                                                                        setTempSelectedRelOp(op.value);
                                                                                    }}
                                                                                    onDoubleClick={() => {
                                                                                        // On double click, set actual value and close
                                                                                        setNewRuleRelationalOp(op.value);
                                                                                        setTempSelectedRelOp('');
                                                                                        setShowRelOpSelector(false);
                                                                                        setRelOpSearchTerm('');
                                                                                        setRuleGridError(false);
                                                                                    }}
                                                                                    className={`px-1 py-1.5 text-xs cursor-pointer hover:bg-gray-50 relative font-['verdana']
                                ${isSelected ? 'bg-[#f2f2f2]' : ''}
                                ${isSelected ? 'border-l-4 border-l-[#0e5bca] rounded' : ''}
                            `}
                                                                                >
                                                                                    <div className="flex items-center ml-1">
                                                                                        <span className={`${isSelected ? 'font-bold text-black' : 'text-[#0e0e0e]'}`}>
                                                                                            {op.label}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    }
                                                                </div>

                                                                {/* Footer with buttons */}
                                                                <div className="flex justify-end gap-2 p-1 border-t border-gray-200 bg-[#e4e4e4]">
                                                                    <button
                                                                        onClick={() => {
                                                                            if (tempSelectedRelOp) {
                                                                                // Set actual value from temp selection
                                                                                setNewRuleRelationalOp(tempSelectedRelOp);
                                                                                setTempSelectedRelOp('');
                                                                                setShowRelOpSelector(false);
                                                                                setRelOpSearchTerm('');
                                                                                setRuleGridError(false);
                                                                            }
                                                                        }}
                                                                        className="px-3 py-1.5 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1 bg-[#007bff] text-white hover:bg-[#0056b3]"
                                                                        disabled={!tempSelectedRelOp}
                                                                    >
                                                                        <i className="fa fa-check-square-o mr-1"></i>
                                                                        {t("button.submit")}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setTempSelectedRelOp('');
                                                                            setShowRelOpSelector(false);
                                                                            setRelOpSearchTerm('');
                                                                        }}
                                                                        className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
                                                                    >
                                                                        <i className="fa fa-times mr-1"></i>
                                                                        {t("button.cancel")}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                        {/* Add Button */}
                                        <div className="flex justify-end mb-6">
                                            <button
                                                onClick={handleAddRule}
                                                // disabled={isViewMode || isReadOnly}
                                                disabled={isFieldDisabled()}
                                                className={`px-4 py-2 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1.5
                ${isViewMode || isReadOnly
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-[#007bff] text-white hover:bg-[#0056b3]'
                                                    }
            `}
                                            >
                                                <i className="fa fa-plus"></i>
                                                {t("button.add")}
                                            </button>
                                        </div>

                                        {/* Rules Display Grid - Styled like TagGrid */}
                                        <div className="border border-[#f3f3f3] rounded overflow-hidden mb-4">
                                            {/* Header */}
                                            <div className="grid grid-cols-6 bg-[#fbfbfb] border-b border-[#f3f3f3]">
                                                {/* <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">Select</div> */}
                                                <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("scheduler.rulename")}</div>
                                                <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("scheduler.metadata")}</div>
                                                <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("common.tagName")}</div>
                                                <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("scheduler.relationaloperator")}</div>
                                                <div className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto">{t("scheduler.fieldvalue")}</div>
                                            </div>

                                            {/* Body */}
                                            <div className={`bg-white min-h-[250px] ${isViewMode || isReadOnly ? 'opacity-60 pointer-events-none' : ''}`}>
                                                {ruleGridData.length === 0 ? (
                                                    <div className="px-4 py-12 text-center text-xs text-[#4b4b4b] font-roboto">
                                                        {t("common.noTagValue")}
                                                    </div>
                                                ) : (
                                                    ruleGridData.map((rule) => {
                                                        const isSelected = selectedRowId === rule.id;
                                                        return (
                                                            <div
                                                                key={rule.id}
                                                                className={`grid grid-cols-6 border-b border-[#e7e6e6] last:border-b-1 min-h-[40px]
                                ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#378cfc]' : 'bg-white border-l-4 border-l-transparent'}
                                ${isViewMode || isReadOnly ? 'cursor-default' : 'cursor-pointer hover:bg-[#eef2f9]'}
                            `}
                                                                onClick={() => setSelectedRowId(rule.id)}
                                                            >
                                                                <div className={`px-4 text-xs flex items-center font-['verdana']
                                ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
                            `}>
                                                                    {rule.ruleNameDisplay || ruleNameOptions.find(r => r.RuleID === rule.ruleName?.toString())?.RuleName || rule.ruleName}
                                                                </div>
                                                                <div className={`px-4 text-xs flex items-center font-['verdana']
                                ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
                            `}>
                                                                    {rule.metadata}
                                                                </div>
                                                                <div className={`px-4 text-xs flex items-center font-['verdana']
                                ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
                            `}>
                                                                    {rule.tagName}
                                                                </div>
                                                                <div className={`px-4 text-xs flex items-center font-['verdana']
                                ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
                            `}>
                                                                    {rule.relationalOp}
                                                                </div>
                                                                <div className={`px-4 text-xs flex items-center font-['verdana']
                                ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}
                            `}>
                                                                    {rule.fieldValue}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleRemoveRule}
                                                // disabled={isViewMode || isReadOnly}
                                                disabled={isFieldDisabled()}
                                                className={`px-4 py-2 text-xs font-semibold rounded transition-colors font-roboto flex items-center gap-1.5
                ${isViewMode || isReadOnly
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-[#007bff] text-white hover:bg-[#0056b3]'
                                                    }
            `}
                                            >
                                                <i className="fa fa-minus"></i>
                                                {t("button.remove")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div >

            <Popup
                isOpen={isCheckPathModalOpen}
                onClose={() => {
                    setIsCheckPathModalOpen(false);
                    setClientPathErrorMessage('');
                    setUncPathErrorMessage('');
                }}
                title="Check Path"
                content={
                    <div className="space-y-6 p-4">
                        <div>
                            <label className="block text-[12px] font-roboto text-[#405F7D] font-semibold mb-3">{t("scheduler.sourcepath")}</label>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("label.client")}</span>
                                    <div
                                        onClick={() => {
                                            setCheckPathType('client');
                                            setUsernameError(false);
                                            setPasswordError(false);
                                        }}
                                        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${checkPathType === 'client' ? 'bg-blue-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checkPathType === 'client' ? 'translate-x-5' : 'translate-x-0'
                                            }`}></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-roboto text-[#405F7D] font-semibold">{t("label.server")}</span>
                                    <div
                                        onClick={() => {
                                            setCheckPathType('server');
                                            setUsernameError(false);
                                            setPasswordError(false);
                                        }}
                                        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${checkPathType === 'server' ? 'bg-blue-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checkPathType === 'server' ? 'translate-x-5' : 'translate-x-0'
                                            }`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-roboto text-[#405F7D] font-semibold mb-2">
                                {t("label.clientName")}
                            </label>
                            <AnimatedInput
                                label=""
                                name="clientNameDisplay"
                                value={clientOptions.find(c => c.L06ClientID === selectedClient)?.L06ClientName || ''}
                                disabled={true}
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-roboto text-[#405F7D] font-semibold mb-2">
                                {t("scheduler.clientusername")}
                                {checkPathType === 'client' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <AnimatedInput
                                label=""
                                name="clientUsername"
                                value={clientUsername}
                                onChange={(e) => {
                                    setClientUsername(e.target.value);
                                    setUsernameError(false);
                                    setClientPathErrorMessage('');
                                    setUncPathErrorMessage('');
                                }}
                                disabled={checkPathType === 'server'}
                                required={checkPathType === 'client'}
                                showError={usernameError}
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-roboto text-[#405F7D] font-semibold mb-2">
                                {t("scheduler.clientpassword")}
                                {checkPathType === 'client' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <AnimatedInput
                                label=""
                                name="clientPassword"
                                type="password"
                                value={clientPassword}
                                onChange={(e) => {
                                    setClientPassword(e.target.value);
                                    setPasswordError(false);
                                    setClientPathErrorMessage('');
                                    setUncPathErrorMessage('');
                                }}
                                disabled={checkPathType === 'server'}
                                required={checkPathType === 'client'}
                                showError={passwordError}
                            />
                        </div>
                        {clientPathErrorMessage && checkPathType === 'client' && !isUNCPathEnabled && (
                            <div className="bg-red-500 text-white px-3 py-2 rounded text-sm mt-2">
                                {clientPathErrorMessage}
                            </div>
                        )}

                        {uncPathErrorMessage && checkPathType === 'client' && isUNCPathEnabled && (
                            <div className="bg-red-500 text-white px-3 py-2 rounded text-sm mt-2">
                                {uncPathErrorMessage}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-8 pt-4">
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                            <button
                                onClick={submitCheckPath}
                                className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <div className="w-4 h-4 border-2 border-white rounded flex items-center justify-center">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                                <span>{t("button.submit")}</span>
                            </button>
                            <button
                                onClick={() => setIsCheckPathModalOpen(false)}
                                className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                {t("button.close")}
                            </button>
                        </div>
                    </div>
                }
            />


            {
                errorDialog.isOpen && (
                    <Errordialog
                        message={errorDialog.message}
                        type={errorDialog.type}
                        onClose={() => setErrorDialog({ isOpen: false, message: '', type: '' })}
                    />
                )
            }
            {
                showSubmitDialog && (
                    <Errordialog
                        message={submitDialogMessage || (isManualParsingInstrument
                            ? t("scheduler.lockInstrumentAndActivate")
                            : t("scheduler.confirmActivate"))}
                        subMessage={submitDialogSubMessage}
                        type="confirmation"
                        onClose={() => {
                            setShowSubmitDialog(false);
                            setSubmitDialogSubMessage("");
                            setSubmitDialogMessage("");
                        }
                        }
                        customButtons={isManualParsingInstrument
                            ? [
                                // Manual parsing instrument: 3 buttons
                                {
                                    text: t("button.save"),
                                    onClick: () => handleFinalSubmission('saveOnly'),
                                    className: "bg-gray-200 text-slate-700 border border-gray-300"
                                },
                                {
                                    text: t("button.activateandlock"),
                                    onClick: () => handleFinalSubmission('activateLock'),
                                    className: "bg-green-500 text-white"
                                },
                                {
                                    text: t("button.saveandactivate"),
                                    onClick: () => handleFinalSubmission('saveActivate'),
                                    className: "bg-blue-500 text-white"
                                }
                            ]
                            : [
                                // Automatic instrument: 2 buttons
                                {
                                    text: t("button.save"),
                                    onClick: () => handleFinalSubmission('saveOnly'),
                                    className: "bg-gray-200 text-slate-700 border border-gray-300"
                                },
                                {
                                    text: t("button.saveandactivate"),
                                    onClick: () => handleFinalSubmission('saveActivate'),
                                    className: "bg-blue-500 text-white"
                                }
                            ]
                        }
                    />
                )
            }

            <AuditTrail
                isOpen={showAuditTrail}
                onClose={handleAuditTrailClose}
                onAuthorized={handleAuditTrailAuthorized}
                actionLabel={auditAction === 'saveActivate' ? t("button.saveandactivate") : t("button.activateandlock")}
                defaultReason="Activated"
                showPasswordError={auditPasswordError}
            />
        </div >
    );
};

// Reusable Components
const SectionHeader = ({ title }) => (
    <div className="mb-3 pb-2">
        <h2 className="text-[14px] font-roboto font-bold text-[#2883FE]">{title}</h2>
    </div>
);

const NavItem = ({ label, active, onClick }) => (
    <div
        onClick={onClick}
        className={`relative h-full flex items-center px-2 cursor-pointer transition-colors group`}
    >
        <span className={`text-sm font-medium transition-colors ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-900'}`}>
            {label}
        </span>
        {active && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-md" />}
    </div>
);

const SquareCheckbox = ({ label, boldLabel, checked, onChange, disabled = false }) => (
    <div
        className={`flex items-center gap-3 group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={disabled ? undefined : onChange}
    >
        <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${disabled
            ? 'bg-gray-100 border-gray-300'
            : checked
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-300 group-hover:border-blue-400'
            }`}>
            {checked && <Check size={14} className={disabled ? 'text-gray-400' : 'text-white'} strokeWidth={3} />}
        </div>
        {label && <span className={`text-[12px] font-roboto text-[#405F7D] font-semibold`}>{label}</span>}
    </div>
);

const ToggleLabel = ({ label, checked }) => (
    <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${checked ? 'text-blue-600' : 'text-blue-800'}`}>{label}</span>
        <div className={`w-8 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </div>
    </div>
);


const DateInput = ({ value, disabled = false, onChange }) => (
    <div className="relative w-40">
        <input
            type="text"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-blue-400 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                }`}
        />
        <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
);

const TimeInput = ({ value, disabled = false }) => (
    <div className="relative w-32">
        <input
            type="text"
            value={value}
            disabled={disabled}
            className={`w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:border-blue-400 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                }`}
        />
        <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
);

const RadioToggle = ({ label, checked, onChange, disabled = false }) => (
    <div
        className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={disabled ? undefined : onChange}
    >
        <span className={`text-[12px] font-roboto text-[#405F7D] font-semibold`}>
            {label}
        </span>
        <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'
                }`}></div>
        </div>
    </div>
);

const RadioButton = ({ label, name, checked, onChange }) => (
    <label className="flex items-center cursor-pointer group">
        <input
            type="radio"
            name={name}
            className="hidden peer"
            checked={checked}
            onChange={onChange}
        />
        <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-white transition-colors relative">
            <div className={`w-2 h-2 bg-blue-500 rounded-full transition-transform ${checked ? 'scale-100' : 'scale-0'}`}></div>
        </div>
        <span className="ml-2 text-sm text-gray-700 font-bold group-hover:text-blue-600">{label}</span>
    </label>
);

const TimePicker = ({ value, onChange, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');
    const [seconds, setSeconds] = useState('00');
    const [inputValue, setInputValue] = useState(value || '00:00:00');
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (value) {
            setInputValue(value);
            const parts = value.split(':');
            if (parts.length === 3) {
                setHours(parts[0]);
                setMinutes(parts[1]);
                setSeconds(parts[2]);
            }
        }
    }, [value]);

    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure DOM is rendered
            setTimeout(() => {
                const hourElement = document.querySelector(`[data-hour="${hours}"]`);
                const minuteElement = document.querySelector(`[data-minute="${minutes}"]`);
                const secondElement = document.querySelector(`[data-second="${seconds}"]`);

                if (hourElement) {
                    hourElement.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
                if (minuteElement) {
                    minuteElement.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
                if (secondElement) {
                    secondElement.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            }, 50);
        }
    }, [isOpen, hours, minutes, seconds]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const validateTimeInput = (value, max) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 0) return '00';
        if (num > max) return max.toString().padStart(2, '0');
        return num.toString().padStart(2, '0');
    };

    const validateAndFormatTime = (timeString) => {
        const parts = timeString.split(':');
        if (parts.length !== 3) return value || '00:00:00';

        let h = parseInt(parts[0]) || 0;
        let m = parseInt(parts[1]) || 0;
        let s = parseInt(parts[2]) || 0;

        // Validate hours (0-23)
        if (h < 0) h = 0;
        if (h > 23) h = 23;

        // Validate minutes (0-59)
        if (m < 0) m = 0;
        if (m > 59) m = 59;

        // Validate seconds (0-59)
        if (s < 0) s = 0;
        if (s > 59) s = 59;

        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
    };

    const handleInputBlur = () => {
        const formatted = validateAndFormatTime(inputValue);
        setInputValue(formatted);
        if (onChange) {
            onChange(formatted);
        }
    };

    const handleTimeChange = (newHours, newMinutes, newSeconds) => {
        const validHours = validateTimeInput(newHours, 23);
        const validMinutes = validateTimeInput(newMinutes, 59);
        const validSeconds = validateTimeInput(newSeconds, 59);

        setHours(validHours);
        setMinutes(validMinutes);
        setSeconds(validSeconds);

        const timeString = `${validHours}:${validMinutes}:${validSeconds}`;
        setInputValue(timeString);

        if (onChange) {
            onChange(timeString);
        }
    };

    const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const secondOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <div className="relative" ref={dropdownRef}>
            <div className={`relative w-32 ${disabled ? 'cursor-not-allowed' : ''}`}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onFocus={() => !disabled && setIsOpen(true)}
                    disabled={disabled}
                    placeholder="HH:MM:SS"
                    className={`w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-blue-400 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                        }`}
                />
                <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3">
                    <div className="flex gap-2">
                        {/* Hours */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-600 mb-1 text-center font-semibold">{t("scheduler.hours")}</label>
                            <div className="h-32 w-16 overflow-y-auto border border-gray-200 rounded custom-scrollbar">
                                {hourOptions.map((hour) => (
                                    <div
                                        key={hour}
                                        data-hour={hour}
                                        onClick={() => {
                                            setHours(hour);
                                            handleTimeChange(hour, minutes, seconds);
                                        }}
                                        className={`px-3 py-1 text-sm text-center cursor-pointer hover:bg-blue-50 ${hours === hour ? 'bg-blue-100 font-semibold text-blue-600' : ''
                                            }`}
                                    >
                                        {hour}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-center text-xl font-bold text-gray-400 pt-6">:</div>

                        {/* Minutes */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-600 mb-1 text-center font-semibold">{t("scheduler.minutes")}</label>
                            <div className="h-32 w-16 overflow-y-auto border border-gray-200 rounded custom-scrollbar">
                                {minuteOptions.map((minute) => (
                                    <div
                                        key={minute}
                                        data-minute={minute}
                                        onClick={() => {
                                            setMinutes(minute);
                                            handleTimeChange(hours, minute, seconds);
                                        }}
                                        className={`px-3 py-1 text-sm text-center cursor-pointer hover:bg-blue-50 ${minutes === minute ? 'bg-blue-100 font-semibold text-blue-600' : ''
                                            }`}
                                    >
                                        {minute}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-center text-xl font-bold text-gray-400 pt-6">:</div>

                        {/* Seconds */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-600 mb-1 text-center font-semibold">{t("scheduler.seconds")}</label>
                            <div className="h-32 w-16 overflow-y-auto border border-gray-200 rounded custom-scrollbar">
                                {secondOptions.map((second) => (
                                    <div
                                        key={second}
                                        data-second={second}
                                        onClick={() => {
                                            setSeconds(second);
                                            handleTimeChange(hours, minutes, second);
                                        }}
                                        className={`px-3 py-1 text-sm text-center cursor-pointer hover:bg-blue-50 ${seconds === second ? 'bg-blue-100 font-semibold text-blue-600' : ''
                                            }`}
                                    >
                                        {second}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                            {t("button.done")}
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

const DatePickerInput = ({
    value,
    onChange,
    disabled = false,
    allowPast = true,
    allowFuture = true,
    validateAndFormatDate
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [inputValue, setInputValue] = useState(value || '');
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Always sync with parent value when not focused
        // This ensures corrected values from parent show up
        if (!isFocused && value !== undefined && value !== null) {
            console.log("DatePickerInput syncing with parent value:", value);
            setInputValue(value);

            // Also update selectedDate for calendar
            const parts = value.split('/');
            if (parts.length === 3) {
                const date = new Date(parts[2], parts[1] - 1, parts[0]);
                setSelectedDate(date);
            }
        }
    }, [value, isFocused]);



    useEffect(() => {
        if (value && !isFocused) {
            setInputValue(value);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
    };

    const handleInputBlur = () => {
        console.log("=== DatePickerInput handleInputBlur called ===");
        console.log("Input value:", inputValue);

        setIsFocused(false);

        const formatted = validateAndFormatDate(inputValue);
        console.log("Formatted value:", formatted);

        // Call onChange immediately - parent will handle validation and corrections
        if (onChange) {
            console.log("Calling onChange with:", formatted);
            onChange(formatted);
        }


    };
    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateClick = (day) => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day, 12, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const formattedDate = `${day.toString().padStart(2, '0')}/${(newDate.getMonth() + 1).toString().padStart(2, '0')}/${newDate.getFullYear()}`;

        setSelectedDate(newDate);
        setInputValue(formattedDate);

        // ALWAYS call onChange, even for past dates
        // Let the parent component decide what to do with it
        if (onChange) {
            onChange(formattedDate);
        }
        setIsOpen(false);
    };
    const changeMonth = (delta) => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1);
        setSelectedDate(newDate);
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const renderCalendar = () => {
        const days = [];
        const totalDays = daysInMonth(selectedDate);
        const firstDay = firstDayOfMonth(selectedDate);
        const currentDay = inputValue ? parseInt(inputValue.split('/')[0]) : null;
        const today = new Date();
        // today.setHours(0, 0, 0, 0);
        today.setUTCHours(0, 0, 0, 0);

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        // Days of month
        for (let day = 1; day <= totalDays; day++) {
            const dayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            const isSelected = day === currentDay;
            const isPast = dayDate < today;
            const isFuture = dayDate > today;
            const isToday = dayDate.getTime() === today.getTime();

            const isDisabled = (!allowPast && isPast) || (!allowFuture && isFuture);

            days.push(
                <div
                    key={day}
                    onClick={() => !isDisabled && handleDateClick(day)}
                    className={`p-2 text-center text-sm rounded transition-colors ${isDisabled
                        ? 'text-gray-300 opacity-40 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-blue-50'
                        } ${isSelected
                            ? 'bg-blue-500 text-white font-bold'
                            : isToday && !isDisabled
                                ? 'bg-blue-100 text-blue-600 font-bold'
                                : !isDisabled
                                    ? 'text-gray-900 font-bold'
                                    : 'text-gray-300'
                        }`}
                >
                    {day}
                </div>
            );
        }

        return days;
    };
    return (
        <div className="relative w-40" ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`relative ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    disabled={disabled}
                    placeholder="DD/MM/YYYY"
                    className={`w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-blue-400 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                        }`}
                />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3 w-64">
                    {/* Month/Year Header */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <ChevronDown size={16} className="rotate-90 text-gray-600" />
                        </button>
                        <div className="text-sm font-semibold text-gray-700">
                            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                        </div>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <ChevronDown size={16} className="-rotate-90 text-gray-600" />
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                            <div key={day} className="text-xs font-semibold text-gray-500 text-center p-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                    </div>
                </div>
            )}
        </div>
    );
};

const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "" }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold rounded whitespace-nowrap
            hover:scale-90 transition-all
            ${disabled
                ? "opacity-50 cursor-not-allowed"
                : "bg-[#E6F0FF] text-[#2883FE] hover:bg-[#d0e3ff]"
            }
            ${className}
        `}
    >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{label}</span>
    </button>
);

export default DataScheduler;
