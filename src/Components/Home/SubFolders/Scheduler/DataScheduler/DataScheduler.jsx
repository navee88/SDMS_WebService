import React, { useState, useRef, useEffect } from 'react';
import {
    Check, ChevronDown, RefreshCw, Calendar, Clock, Pencil, Search
} from 'lucide-react';
import useAxios from '../../../../../Services/servicecall';
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';
import Popup from '../../../../Layout/Common/Popup';
import Errordialog from '../../../../Layout/Common/Errordialog';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';

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
            className="w-64 bg-white border border-gray-300 rounded-md overflow-hidden shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-300 bg-white">
                <div className="flex items-center gap-2">
                    <Search size={14} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Looking for"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full text-sm text-gray-700 placeholder-gray-400 border-none focus:outline-none bg-white"
                        autoFocus
                    />
                </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto bg-white custom-scrollbar">
                {/* {// In the SelectorDropdown component, update the option rendering:
                    filteredOptions.map((option) => {
                        const isSelected = selectedValues.includes(option);
                        const isDisabled = disabledOptions.includes(option);
                        const isNone = option.toUpperCase() === 'NONE';

                        return (
                            <div
                                key={option}
                                onClick={() => !isDisabled && onSelect(option)}
                                className={`flex items-center gap-3 px-3 py-2 border-l-4 font-['Verdana'] ${isDisabled
                                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50 blur-[0.3px]'
                                        : isSelected
                                            ? 'bg-blue-50 border-blue-500 text-black cursor-pointer'
                                            : 'bg-white border-transparent text-gray-900 hover:bg-gray-50 cursor-pointer'
                                    } ${isNone && isSelected ? 'border-l-4 border-blue-500' : ''
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${isDisabled
                                            ? 'bg-gray-100 border-gray-300'
                                            : isSelected
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'
                                        } ${isNone && isSelected ? 'bg-blue-500 border-blue-500' : ''}`}
                                >
                                    {isSelected && !isDisabled && (
                                        <Check size={12} className="text-white" strokeWidth={3} />
                                    )}
                                </div>
                                <span className="text-xs font-bold">{option}</span>
                            </div>
                        );
                    })} */}
                {filteredOptions.map((option) => {
                    const isSelected = selectedValues.includes(option);
                    const isDisabled = disabledOptions.includes(option);
                    const isNone = option.toUpperCase() === 'NONE';

                    return (
                        <div
                            key={option}
                            onClick={() => !isDisabled && onSelect(option)}
                            className={`flex items-center gap-3 px-3 py-2 border-l-4 font-['Verdana'] ${isDisabled
                                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50 blur-[0.3px]'
                                : isSelected
                                    ? 'bg-blue-50 border-blue-500 text-black cursor-pointer'
                                    : 'bg-white border-transparent text-gray-900 hover:bg-gray-50 cursor-pointer'
                                } ${isNone && isSelected ? 'border-l-4 border-blue-500' : ''
                                }`}
                        >
                            {/* <div
                                className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${isDisabled
                                    ? 'bg-gray-100 border-gray-300'
                                    : isSelected
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                                    } ${isNone && isSelected ? 'bg-blue-500 border-blue-500' : ''
                                    }`}
                            >
                                {isSelected && !isDisabled && (
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                )}
                            </div> */}
                            <div
                                className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${isDisabled && !isNone // Allow NONE even if it's in disabledOptions
                                    ? 'bg-gray-100 border-gray-300'
                                    : isSelected
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                                    } ${isNone && isSelected ? 'bg-blue-500 border-blue-500' : ''}`}
                            >
                                {/* Always show check for NONE when selected, even if disabled */}
                                {isSelected && (!isDisabled || isNone) && (
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                )}
                            </div>
                            <span className="text-xs font-bold">{option}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

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
    delimiterOptions
}) => {
    const [rowSourceFlag, setRowSourceFlag] = useState(tag.sSourceFlag || 'NONE');
    const [rowMetadata, setRowMetadata] = useState(tag.sTextData || '');
    const [rowError, setRowError] = useState(false);

    const [selectedParsedItem, setSelectedParsedItem] = useState(null);

    const handleRadioChange = (newValue) => {
        setRowSourceFlag(newValue);
        setRowMetadata('');
        setRowError(false);
    };

    // const handlePencilClick = (e) => {
    //     e.stopPropagation(); // Prevent event bubbling

    //     let hasError = false;

    //     if (rowSourceFlag === 'Filename') {
    //         if (!sampleFilename.trim()) {
    //             setSampleFilenameError(true);
    //             hasError = true;
    //         } else {
    //             const hasExtension = sampleFilename.includes('.') &&
    //                 sampleFilename.lastIndexOf('.') < sampleFilename.length - 1;
    //             if (!hasExtension) {
    //                 setSampleFilenameError(true);
    //                 hasError = true;
    //             } else {
    //                 setSampleFilenameError(false);
    //             }
    //         }

    //         if (!selectedDelimiters.length) {
    //             setDelimiterError(true);
    //             hasError = true;
    //         } else {
    //             setDelimiterError(false);
    //         }

    //         if (hasError) {
    //             setRowError(true);
    //             return;
    //         }
    //     }

    //     const concatenatedDelimiter = ConcatenateDelimeterfromlist(selectedDelimiters, delimiterOptions);
    //     const result = SplitFilenamewithExt(sampleFilename, concatenatedDelimiter);

    //     let parsedData = [...result.splitpath];
    //     if (result.lastDot > -1 && result.extension) {
    //         parsedData.push(result.extension);
    //     }

    //     setParsedMetadata(parsedData);
    //     setShowMetadataTooltip(index);
    //     setRowError(false);
    // };


    const handlePencilClick = (e) => {
        e.stopPropagation();

        let hasError = false;

        if (rowSourceFlag === 'Filename') {
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

        // NEW: Check if delimiters exist in filename (except for NONE)
        if (concatenatedDelimiter !== "None") {
            const delimiterChars = concatenatedDelimiter.split('');
            const hasDelimiterInFilename = delimiterChars.some(char => sampleFilename.includes(char));

            if (!hasDelimiterInFilename) {
                // No delimiter found in filename, show empty parsed data
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

    // const handleParsedItemClick = (item) => {
    //     setRowMetadata(item);
    //     setShowMetadataTooltip(null);
    // };

    const handleParsedItemClick = (item) => {
        setSelectedParsedItem(item);
        // Don't update rowMetadata yet - only on double click or submit
    };

    const handleSubmitParsedData = () => {
        if (selectedParsedItem) {
            setRowMetadata(selectedParsedItem);
        }
        setShowMetadataTooltip(null);
        setSelectedParsedItem(null);
    };

    const handleDoubleClick = (item) => {
        setRowMetadata(item);
        setShowMetadataTooltip(null);
        setSelectedParsedItem(null);
    };

    return (
        <tr key={tag.sTagID} className={index % 2 === 0 ? "bg-blue-50/30 border-b border-gray-100" : "bg-white border-b border-gray-100"}>
            {/* Tag Name */}
            <td className="px-6 py-4 font-medium text-gray-900">
                {tag.sTagName}
            </td>

            {/* Extract From */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="radio"
                            name={`extract_${tag.sTagID}`}
                            className="hidden peer"
                            checked={rowSourceFlag === 'NONE'}
                            onChange={() => handleRadioChange('NONE')}
                        />
                        <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-white transition-colors">
                            <div className={`w-2 h-2 bg-blue-500 rounded-full transition-transform ${rowSourceFlag === 'NONE' ? 'scale-100' : 'scale-0'}`}></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-700 font-bold group-hover:text-blue-600 select-none">NONE</span>
                    </label>

                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="radio"
                            name={`extract_${tag.sTagID}`}
                            className="hidden peer"
                            checked={rowSourceFlag === 'Folder'}
                            onChange={() => handleRadioChange('Folder')}
                        />
                        <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-white transition-colors">
                            <div className={`w-2 h-2 bg-blue-500 rounded-full transition-transform ${rowSourceFlag === 'Folder' ? 'scale-100' : 'scale-0'}`}></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-700 font-bold group-hover:text-blue-600 select-none">Folder</span>
                    </label>

                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="radio"
                            name={`extract_${tag.sTagID}`}
                            className="hidden peer"
                            checked={rowSourceFlag === 'Filename'}
                            onChange={() => handleRadioChange('Filename')}
                        />
                        <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-white transition-colors">
                            <div className={`w-2 h-2 bg-blue-500 rounded-full transition-transform ${rowSourceFlag === 'Filename' ? 'scale-100' : 'scale-0'}`}></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-700 font-bold group-hover:text-blue-600 select-none">Filename</span>
                    </label>
                </div>
            </td>

            {/* Metadata */}
            {/* <td className="px-6 py-4 relative">
                <div className="flex items-center gap-2"> */}
            {/* <input
                        type="text"
                        value={rowMetadata}
                        onChange={(e) => setRowMetadata(e.target.value)}
                        disabled={rowSourceFlag === 'NONE'}
                        className={`flex-1 py-1 text-sm focus:outline-none ${rowSourceFlag === 'NONE'
                            ? 'bg-transparent cursor-not-allowed'
                            : 'bg-white border-b-2 focus:border-blue-400'
                            } ${rowError ? 'border-red-500' : 'border-gray-200'}`} */}
            {/* <input
                        type="text"
                        value={rowMetadata}
                        onChange={(e) => setRowMetadata(e.target.value)}
                        className={`flex-1 py-1 text-sm focus:outline-none ${rowSourceFlag === 'NONE'
                            ? 'bg-transparent'
                            : 'bg-white border-b-2 focus:border-blue-400 border-gray-200'
                            }`}
                        // placeholder={rowSourceFlag === 'Filename' ? "Select from parsed data" : rowSourceFlag === 'Folder' ? "Enter folder level" : ""}
                    /> */}

            {/* Info icon for Folder */}
            {/* {rowSourceFlag === 'Folder' && (
                        <div className="relative group z-[99999]">
                            <svg
                                className="w-4 h-4 text-gray-400 cursor-help"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="absolute right-full mr-2 hidden group-hover:block z-[99999]"> top-1/2 -translate-y-1/2 */}
            {/* <div className="bg-white border border-gray-300 text-black text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
                                    For parent folder enter 0, Grand parent enter -1 and so on...
                                </div>
                            </div>
                        </div>
                    )} */}



            {/* Pencil icon for Filename */}
            {/* {rowSourceFlag === 'Filename' && (
                        <button
                            data-pencil-id={index}
                            onClick={handlePencilClick}
                            className="text-blue-600 hover:text-blue-800"
                            title="View parsed metadata"
                        >
                            <Pencil size={16} />
                        </button>
                    )} */}
            {/* </div> */}


            {/* Metadata */}
            <td className="px-6 py-4 relative">
                {rowSourceFlag === 'Filename' ? (
                    <div className="flex items-center justify-between">
                        {/* Show selected value or placeholder */}
                        <div className={`text-sm ${rowMetadata ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                            {rowMetadata || "Click pencil to select"}
                        </div>
                        <button
                            data-pencil-id={index}
                            onClick={handlePencilClick}
                            className="text-blue-600 hover:text-blue-800 ml-2"
                            title="Select from parsed data"
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={rowMetadata}
                            onChange={(e) => setRowMetadata(e.target.value)}
                            disabled={rowSourceFlag === 'NONE'}
                            className={`flex-1 py-1 text-sm focus:outline-none ${rowSourceFlag === 'NONE'
                                ? 'bg-transparent cursor-not-allowed'
                                : 'bg-white border-b-2 focus:border-blue-400 border-gray-200'
                                }`}
                        />
                        {/* Info icon for Folder */}
                        {rowSourceFlag === 'Folder' && (
                            <div className="relative group z-[99999]">
                                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="absolute right-full mr-2 hidden group-hover:block z-[99999]">
                                    <div className="bg-white border border-gray-300 text-black text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
                                        For parent folder enter 0, Grand parent enter -1 and so on...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* {showMetadataTooltip === index && rowSourceFlag === 'Filename' && (
                    <div
                        className="fixed z-[99999] bg-white border border-gray-300 rounded-md shadow-lg"
                        style={{
                            position: 'fixed',
                            width: '256px',
                            zIndex: 99999
                        }}
                        ref={(el) => {
                            if (el) {
                                const pencilButton = document.querySelector(`[data-pencil-id="${index}"]`);
                                if (pencilButton) {
                                    const rect = pencilButton.getBoundingClientRect();
                                    // Position to the left and above the pencil icon
                                    el.style.left = `${rect.left - 264}px`; // 256px width + 8px gap
                                    el.style.top = `${rect.top - el.offsetHeight - 8}px`;

                                    // If it goes off screen on the left, position to the right instead
                                    if (rect.left - 264 < 0) {
                                        el.style.left = `${rect.right + 8}px`;
                                    }

                                    // If it goes off screen on top, position below instead
                                    if (rect.top - el.offsetHeight - 8 < 0) {
                                        el.style.top = `${rect.bottom + 8}px`;
                                    }
                                }
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-2 border-b border-gray-300">
                            <label className="text-xs text-gray-600 font-semibold">Parsed Metadata:</label>
                        </div>

                        

                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                            {parsedMetadata.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-gray-500">
                                    No delimiter found in filename
                                </div>
                            ) : (
                                parsedMetadata.map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleParsedItemClick(item)}
                                        onDoubleClick={() => handleDoubleClick(item)}
                                        className={`px-3 py-2 text-sm cursor-pointer border-b last:border-b-0 transition-colors ${selectedParsedItem === item
                                            ? 'bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-500'
                                            : 'hover:bg-blue-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{item}</span>
                                            {selectedParsedItem === item && (
                                                <Check size={14} className="text-blue-500" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>


                        <div className="border-t border-gray-300">
                            <p className="text-xs text-gray-500 italic px-3 pt-2">
                                Single click to select, double-click to apply, or click Submit
                            </p>
                            
                            <div className="flex justify-end gap-2 p-2 border-t border-gray-300">
                                <button
                                    onClick={handleSubmitParsedData}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                                    disabled={!selectedParsedItem}
                                >
                                    Submit
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMetadataTooltip(null);
                                        setSelectedParsedItem(null);
                                    }}
                                    className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )} */}


                {showMetadataTooltip === index && rowSourceFlag === 'Filename' && (
                    <div
                        className="fixed z-[99999] bg-white border border-gray-300 rounded-md shadow-lg"
                        style={{
                            position: 'fixed',
                            width: '256px',
                            zIndex: 99999,
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            overflow: 'visible'
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
                        {/* Header with "Looking for" */}
                        <div className="p-2 border-b border-gray-300 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Looking for"
                                    className="w-full text-sm text-gray-700 placeholder-gray-400 border-none focus:outline-none bg-transparent"
                                />
                            </div>
                        </div>

                        {/* List of parsed data */}
                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                            {parsedMetadata.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-gray-500">
                                    No delimiter found in filename
                                </div>
                            ) : (
                                parsedMetadata.map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleParsedItemClick(item)}
                                        onDoubleClick={() => handleDoubleClick(item)}
                                        className={`px-3 py-2 text-sm cursor-pointer border-b last:border-b-0 transition-colors ${selectedParsedItem === item
                                            ? 'bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-500'
                                            : 'hover:bg-blue-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{item}</span>
                                            {selectedParsedItem === item && (
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
                                    onClick={handleSubmitParsedData}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                                    disabled={!selectedParsedItem}
                                >
                                    Submit
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMetadataTooltip(null);
                                        setSelectedParsedItem(null);
                                    }}
                                    className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </td>
        </tr >
    );
};

// Helper Functions - Add at the top of your file, before the component
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
    console.log("GetActiveMonthlyDays result:", result);
    return result;
};

const GetActiveWeekNO = (selectedWeeks, weekOptions) => {
    console.log("GetActiveWeekNO called with:", selectedWeeks);
    let result = "";
    weekOptions.forEach(week => {
        result += selectedWeeks.includes(week.weeks) ? "1" : "0";
    });
    console.log("GetActiveWeekNO result:", result);
    return result;
};

const GetActiveWeekDays = (selectedWeekdays, weekdayOptions) => {
    console.log("GetActiveWeekDays called with:", selectedWeekdays);
    let result = "";
    weekdayOptions.forEach(day => {
        result += selectedWeekdays.includes(day.days) ? "1" : "0";
    });
    console.log("GetActiveWeekDays result:", result);
    return result;
};



// Scroll to section helper
const scrollToSection = (ref, scrollContainerRef) => {
    if (ref.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const element = ref.current;
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetPosition = container.scrollTop + (elementRect.top - containerRect.top) - 20;

        container.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
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

// const SplitFilenamewithExt = (samplefilename, Delimeter) => {
//     console.log("Splitting filename:", samplefilename, "with delimiter:", Delimeter);

//     let lastDot = samplefilename.lastIndexOf('.');
//     let filename = "", extension = "";

//     if (lastDot > -1) {
//         filename = samplefilename.slice(0, lastDot);
//         extension = samplefilename.slice(lastDot + 1);
//         var splitpath = splitfilenamewithdelimeter(filename, Delimeter);
//     } else {
//         var splitpath = splitfilenamewithdelimeter(samplefilename, Delimeter);
//     }

//     return { "lastDot": lastDot, "splitpath": splitpath, "extension": extension };
// };

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

const SearchServerData = () => {
    const { t } = useTranslation();

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
    const [localDeleteMode, setLocalDeleteMode] = useState('automatic');
    const [filesOlderThanDate, setFilesOlderThanDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [filesOlderThanDateEnabled, setFilesOlderThanDateEnabled] = useState(false);

    // Trigger/Expiry states
    const [triggerDate, setTriggerDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [triggerTime, setTriggerTime] = useState(new Date().toLocaleTimeString('en-GB'));
    const [expiryEnabled, setExpiryEnabled] = useState(false);
    const [expiryDate, setExpiryDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [expiryTime, setExpiryTime] = useState(new Date().toLocaleTimeString('en-GB'));

    // File Delete Policy states
    const [applyDeletePolicy, setApplyDeletePolicy] = useState(false);
    const [serverDeleteMode, setServerDeleteMode] = useState('automatic');
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
    const [withoutVersioning, setWithoutVersioning] = useState(false);

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
    const [oneTimeDate, setOneTimeDate] = useState(new Date().toLocaleDateString('en-GB'));

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

    // const [hasShownTriggerError, setHasShownTriggerError] = useState(false);
    // const [hasShownExpiryError, setHasShownExpiryError] = useState(false);
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
    const [showMetadataTooltip, setShowMetadataTooltip] = useState(null); // null or row index
    const [parsedMetadata, setParsedMetadata] = useState([]);
    const [ruleNameOptions, setRuleNameOptions] = useState([]);

    const [selectedRuleName, setSelectedRuleName] = useState('');

    // Add these states
    const [ruleGridData, setRuleGridData] = useState([]);
    const [newRuleMetadata, setNewRuleMetadata] = useState('');
    const [newRuleTagName, setNewRuleTagName] = useState('');
    const [newRuleFieldValue, setNewRuleFieldValue] = useState('');
    const [showTagNameSelector, setShowTagNameSelector] = useState(false);
    const [showRelOpSelector, setShowRelOpSelector] = useState(false);
    const [ruleGridError, setRuleGridError] = useState(false);

    const [tagNameSearchTerm, setTagNameSearchTerm] = useState('');
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [newRuleRelationalOp, setNewRuleRelationalOp] = useState('');
    const [relOpSearchTerm, setRelOpSearchTerm] = useState('');

    // Ref for the scrollable container (The specific div that scrolls)
    const scrollContainerRef = useRef(null);

    // Refs for Sections
    const fileSettingsRef = useRef(null);
    const uploadPolicyRef = useRef(null);
    const triggerExpiryRef = useRef(null);
    const scheduleCaptureRef = useRef(null);
    const schedulerMetadataRef = useRef(null);

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

    const isFutureDate = (dateString) => {
        const parts = dateString.split('/');
        const date = new Date(parts[2], parts[1] - 1, parts[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    };

    const isPastDate = (dateString) => {
        const parts = dateString.split('/');
        const date = new Date(parts[2], parts[1] - 1, parts[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-GB');
    };

    const compareDates = (date1String, date2String) => {
        const parts1 = date1String.split('/');
        const parts2 = date2String.split('/');
        const date1 = new Date(parts1[2], parts1[1] - 1, parts1[0]);
        const date2 = new Date(parts2[2], parts2[1] - 1, parts2[0]);
        return date1 - date2;
    };

    const validateTime = (hours, minutes, seconds) => {
        const validHours = Math.min(Math.max(parseInt(hours) || 0, 0), 23);
        const validMinutes = Math.min(Math.max(parseInt(minutes) || 0, 0), 59);
        const validSeconds = Math.min(Math.max(parseInt(seconds) || 0, 0), 59);
        return {
            hours: validHours.toString().padStart(2, '0'),
            minutes: validMinutes.toString().padStart(2, '0'),
            seconds: validSeconds.toString().padStart(2, '0')
        };
    };

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

    // const handleAddRule = () => {
    //     // Check if all fields are empty
    //     const isEmpty = !newRuleMetadata.trim() && !newRuleTagName && !newRuleFieldValue.trim();

    //     if (isEmpty) {
    //         setRuleGridError(true);

    //         // Show error dialog
    //         // setErrorDialog({
    //         //     isOpen: true,
    //         //     message: 'Please fill at least one column in the rule grid',
    //         //     type: 'warning'
    //         // });
    //         return;
    //     }

    //     // Clear error if validation passes
    //     setRuleGridError(false);

    //     // Create new rule object
    //     const newRule = {
    //         id: Date.now(), // Unique ID
    //         ruleName: selectedRuleName,
    //         metadata: newRuleMetadata,
    //         tagName: newRuleTagName,
    //         relationalOp: newRuleRelationalOp,
    //         fieldValue: newRuleFieldValue
    //     };

    //     // Add to grid data
    //     setRuleGridData(prev => [...prev, newRule]);

    //     // Clear form fields
    //     setNewRuleMetadata('');
    //     setNewRuleTagName('');
    //     setNewRuleRelationalOp('=');
    //     setNewRuleFieldValue('');
    // };

    // const handleAddRule = () => {
    //     let hasError = false;

    //     // Validate that at least one field has data
    //     if (!newRuleMetadata.trim() && !newRuleTagName && !newRuleFieldValue.trim()) {
    //         hasError = true;
    //         // Show red border to whole grid
    //         setRuleGridError(true);
    //     }

    //     // Individual field validation - show error for each empty field
    //     const metadataError = !newRuleMetadata.trim();
    //     const tagNameError = !newRuleTagName;
    //     const fieldValueError = !newRuleFieldValue.trim();

    //     if (hasError) {
    //         setErrorDialog({
    //             isOpen: true,
    //             message: 'Please fill at least one column in the rule grid',
    //             type: 'warning'
    //         });
    //         return;
    //     }

    //     // If metadata is empty, don't add to grid and show error
    //     if (metadataError) {
    //         setErrorDialog({
    //             isOpen: true,
    //             message: 'Metadata is required. Please enter metadata value.',
    //             type: 'warning'
    //         });
    //         // Show red border only for metadata input
    //         setRuleGridError(true);
    //         return;
    //     }

    //     // Clear error if validation passes
    //     setRuleGridError(false);

    //     // Create new rule object
    //     const newRule = {
    //         id: Date.now(), // Unique ID
    //         ruleName: selectedRuleName,
    //         metadata: newRuleMetadata,
    //         tagName: newRuleTagName,
    //         relationalOp: newRuleRelationalOp,
    //         fieldValue: newRuleFieldValue
    //     };

    //     // Add to grid data
    //     setRuleGridData(prev => [...prev, newRule]);

    //     // Clear form fields
    //     setNewRuleMetadata('');
    //     setNewRuleTagName('');
    //     setNewRuleRelationalOp(''); // Reset to empty
    //     setNewRuleFieldValue('');
    // };

    const handleAddRule = () => {
        // Check if ALL fields are filled
        const allFieldsFilled =
            newRuleMetadata.trim() &&
            newRuleTagName &&
            newRuleFieldValue.trim() &&
            newRuleRelationalOp;

        if (!allFieldsFilled) {
            // Show red border to the whole grid
            setRuleGridError(true);
            // DON'T show error dialog box
            return;
        }

        // Clear error if validation passes
        setRuleGridError(false);

        // Create new rule object
        const newRule = {
            id: Date.now(),
            ruleName: selectedRuleName,
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
                message: 'No records to remove',
                type: 'warning'
            });
            return;
        }

        // If no row is selected, select the first one and show error
        if (selectedRowId === null) {
            if (ruleGridData.length > 0) {
                setSelectedRowId(ruleGridData[0].id);
                setErrorDialog({
                    isOpen: true,
                    message: 'Select an existing record.',
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
                            placeholder="Looking for"
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
                            No tags found
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
                            Submit
                        </button>
                        <button
                            onClick={onClose}
                            className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    // Load all combos on screen load
    const loadCombos = async () => {
        try {
            const requestData = CF_activeUserdetails();

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
        }
    };


    // Load instruments based on selected client
    const loadInstruments = async (clientId) => {
        try {
            const requestData = {
                sClientID: clientId,
                ...CF_activeUserdetails()
            };

            const response = await postData(
                'Scheduler/DataSchedulerInstrumentCombo',
                requestData
            );

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
        }
    };

    // Check if instrument is auto-locked
    const checkAutoLock = async (instrumentId) => {
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
                const message = `${response.InstrumentName} instrument has already scheduled with ${response.ScheduleTaskID} taskID by Autolock Mode. So, Retire the ${response.ScheduleTaskID} taskID, before creating a new schedule for this instrument`;

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
        }
    };

    // Load methods based on selected instrument
    const loadMethods = async (instrumentData) => {
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
                setMethodOptions(response.lstWebMethod);
                setIsMethodDisabled(false);
            } else {
                setMethodOptions([]);
                setIsMethodDisabled(true);
            }
        } catch (error) {
            console.error("Error loading methods:", error);
            setMethodOptions([]);
            setIsMethodDisabled(true);
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

    // // Check path validation
    // const validateAndShowCheckPathModal = () => {
    //     let hasError = false;

    //     // Validate client selection
    //     if (!selectedClient) {
    //         setClientError(true);
    //         hasError = true;
    //     } else {
    //         setClientError(false);
    //     }

    //     // Validate source path
    //     if (!sourcePath.trim()) {
    //         setSourcePathError(true);
    //         hasError = true;
    //     } else if (!CF_pathValidation(sourcePath)) {
    //         setSourcePathError(true);
    //         hasError = true;
    //     } else {
    //         setSourcePathError(false);
    //     }

    //     if (hasError) {
    //         return;
    //     }

    //     // Open check path modal
    //     // setIsCheckPathModalOpen(true);
    //     // setCheckPathType('client');
    //     // setClientUsername('');
    //     // setClientPassword('');
    //     // setUsernameError(false);
    //     // setPasswordError(false);

    //     // Clear first, then open modal
    //     setClientUsername('');
    //     setClientPassword('');
    //     setUsernameError(false);
    //     setPasswordError(false);

    //     // Small delay to ensure state is cleared before modal opens
    //     setTimeout(() => {
    //         setIsCheckPathModalOpen(true);
    //         setCheckPathType('client');
    //     }, 10);
    // };

    // const validateAndShowUNCPathModal = () => {
    //     let hasError = false;

    //     // Validate client selection
    //     if (!selectedClient) {
    //         setClientError(true);
    //         hasError = true;
    //     } else {
    //         setClientError(false);
    //     }

    //     // Validate UNC path
    //     if (!uncPath.trim()) {
    //         setUncPathError(true);
    //         hasError = true;
    //     } else if (!CF_UNCPathValidation(uncPath)) {
    //         setUncPathError(true);
    //         hasError = true;
    //     } else {
    //         setUncPathError(false);
    //     }

    //     if (hasError) {
    //         return;
    //     }

    //     // // Open check path modal for UNC
    //     // setIsCheckPathModalOpen(true);
    //     // setCheckPathType('client');
    //     // setClientUsername('');
    //     // setClientPassword('');
    //     // setUsernameError(false);
    //     // setPasswordError(false);

    //     // Clear first, then open modal
    //     setClientUsername('');
    //     setClientPassword('');
    //     setUsernameError(false);
    //     setPasswordError(false);

    //     // Small delay to ensure state is cleared before modal opens
    //     setTimeout(() => {
    //         setIsCheckPathModalOpen(true);
    //         setCheckPathType('client');
    //     }, 10);
    // };

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

            try {
                // ADD LOGGING HERE TO DEBUG
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
                        message: response.Message || 'Path is accessible',
                        type: 'success'
                    });
                } else {
                    // Set inline error message instead of dialog for client
                    if (isUNCPathEnabled) {
                        setUncPathErrorMessage(response.Message || 'Failed to connect');
                    } else {
                        setClientPathErrorMessage(response.Message || 'Failed to connect');
                    }
                    // Reopen modal to show inline error
                    setIsCheckPathModalOpen(true);
                }
            } catch (error) {
                console.error("Error checking client path:", error);
                setIsCheckPathModalOpen(false);
                setErrorDialog({
                    isOpen: true,
                    message: 'Error checking path',
                    type: 'error'
                });
            }
        } else {
            // Server path checking
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
                        message: response.OResObj || 'Path is accessible',
                        type: 'success'
                    });
                } else {
                    setErrorDialog({
                        isOpen: true,
                        message: response.OResObj || 'Path is not accessible',
                        type: 'warning'
                    });
                }
            } catch (error) {
                console.error("Error checking server path:", error);
                setIsCheckPathModalOpen(false);
                setErrorDialog({
                    isOpen: true,
                    message: 'Error checking path',
                    type: 'error'
                });
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
        setSelectedDomain(domainOptions.length > 0 ? domainOptions[0].L03DomainID : '');
        setSelectedDestination('');
        setFilter('*.*');

        // Reset Upload Policy
        setIncludeSubfolder(false);
        setCompleteTree(false);
        setLevelEnabled(false);
        setLevelValue('');
        setCopyFiles(true);
        setMoveFiles(false);
        setDeleteLocalCopy(false);
        setFilesOlderThanEnabled(false);
        setFilesOlderDays('');
        setFilesOlderDaysUnit('Days');
        setLocalDeleteMode('automatic');
        setFilesOlderThanDate(new Date().toLocaleDateString('en-GB'));
        setFilesOlderThanDateEnabled(false);

        // Reset Trigger/Expiry
        setTriggerDate(new Date().toLocaleDateString('en-GB'));
        setTriggerTime(new Date().toLocaleTimeString('en-GB'));
        setExpiryEnabled(false);
        setExpiryDate(new Date().toLocaleDateString('en-GB'));
        setExpiryTime(new Date().toLocaleTimeString('en-GB'));
        setShowExpiryWarning(false);

        // Reset Policies
        setApplyDeletePolicy(false);
        setServerDeleteMode('automatic');
        setEnableFileLink(false);
        setEnableFileAudit(false);
        setAuditFilter('*.*');
        setDataLogger(false);
        setArchivalDays('');

        // Reset Schedule Capture
        setLiveCapture(true);
        setLiveCaptureVersioning(true);
        setOneVersionPerDay(false);
        setWithoutVersioning(false);
        setOneTime(true);
        setDaily(false);
        setWeekly(false);
        setMonthly(false);
        setScheduleWithoutVersioning(false);
        setOneTimeDate(new Date().toLocaleDateString('en-GB'));

        // Reset Daily
        setDailyEveryDays('0');
        setDailyRepeatTask(false);
        setDailyEveryHours('0');
        setDailyEveryMinutes('0');

        // Reset Weekly
        setWeeklyDays({
            Sunday: false,
            Monday: false,
            Tuesday: false,
            Wednesday: false,
            Thursday: false,
            Friday: false,
            Saturday: false
        });

        // Reset Monthly
        setMonthlyDayToggle(false);
        setMonthlyOnToggle(true);
        setMonthlySearchTerm('');
        setMonthlySelectedDays([]);
        setMonthlyMonth('');
        setMonthlyWeek('');
        setMonthlyWeekdays('');
        setMonthlySelectedWeeks([]);
        setMonthlySelectedWeekdays([]);
        setMonthlySelectedMonths([]);
        setShowDaySelector(false);
        setShowWeekSelector(false);
        setShowWeekdaysSelector(false);
        setShowMonthSelector(false);

        // Reset Scheduler Metadata
        setIsSchedulerMetadataEnabled(false);
        setSelectedTemplate(templateOptions.length > 0 ? templateOptions[0].sTemplateID : '');
        setSelectedDelimiter('');
        setTagMasterData([]);

        // Reload combos
        loadCombos();
    };

    // Load Tag Master based on selected template
    const loadTagMaster = async (templateId) => {
        console.log("=== loadTagMaster called ===");
        console.log("templateId:", templateId);
        console.log("isSchedulerMetadataEnabled:", isSchedulerMetadataEnabled);

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

            setTagMasterData(response || []);
            // Auto-select first tag for Rule Name
            if (response && response.length > 0) {
                const firstTagId = response[0].sTagID;
                setSelectedRuleName(firstTagId);

                // Populate dropdown options
                const tagNames = response.map(tag => ({
                    RuleName: tag.sTagName,
                    RuleID: tag.sTagID
                }));
                setRuleNameOptions(tagNames);
            } else {
                setSelectedRuleName('');
                setRuleNameOptions([]);
            }
        } catch (error) {
            console.error("Tag master load failed:", error);
            setTagMasterData([]);
        }
    };


    // const handleTriggerDateChange = (date) => {
    //     console.log("=== handleTriggerDateChange called ===");
    //     console.log("Input date:", date);
    //     console.log("lastTriggerDateWasValid:", lastTriggerDateWasValid);

    //     const formattedDate = validateAndFormatDate(date);
    //     console.log("Formatted date:", formattedDate);

    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);

    //     const parts = formattedDate.split('/');

    //     if (parts.length === 3) {
    //         const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
    //         selectedDate.setHours(0, 0, 0, 0); // IMPORTANT: Set to start of day for accurate comparison

    //         console.log("Selected date:", selectedDate);
    //         console.log("Today:", today);
    //         console.log("Is past?", selectedDate < today);

    //         // CHANGED: Only treat as PAST if strictly less than today (not equal)
    //         if (selectedDate < today) {
    //             // Calculate yesterday
    //             const yesterday = new Date();
    //             yesterday.setTime(yesterday.getTime() - 86400000);
    //             yesterday.setHours(0, 0, 0, 0);
    //             const yesterdayFormatted = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;

    //             console.log("Setting to yesterday:", yesterdayFormatted);

    //             // Show error ONLY if last date was valid (current or future)
    //             if (lastTriggerDateWasValid) {
    //                 console.log("Showing error dialog - transitioning from valid to past date");
    //                 setErrorDialog({
    //                     isOpen: true,
    //                     message: 'Selected date earlier than the current date',
    //                     type: 'warning'
    //                 });
    //             } else {
    //                 console.log("No error dialog - already in past date state");
    //             }

    //             setTriggerDate(yesterdayFormatted);
    //             setShowTriggerWarning(false);
    //             setLastTriggerDateWasValid(false); // Mark as invalid state
    //             return;
    //         } else {
    //             // Valid date (today or future) - CHANGED: includes today
    //             console.log("Valid date (today or future), setting:", formattedDate);
    //             setTriggerDate(formattedDate);
    //             setShowTriggerWarning(false);
    //             setLastTriggerDateWasValid(true); // Mark as valid state
    //         }
    //     } else {
    //         setTriggerDate(formattedDate);
    //     }
    // };

    // const handleExpiryDateChange = (date) => {
    //     const formattedDate = validateAndFormatDate(date);
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);

    //     const parts = formattedDate.split('/');

    //     if (parts.length === 3) {
    //         const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
    //         selectedDate.setHours(0, 0, 0, 0); // IMPORTANT: Set to start of day

    //         // CHANGED: Only treat as PAST if strictly less than today (not equal)
    //         if (selectedDate < today) {
    //             // Calculate yesterday
    //             const yesterday = new Date();
    //             yesterday.setTime(yesterday.getTime() - 86400000);
    //             yesterday.setHours(0, 0, 0, 0);
    //             const yesterdayFormatted = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;

    //             // Show error ONLY if last date was valid (current or future)
    //             if (lastExpiryDateWasValid) {
    //                 setErrorDialog({
    //                     isOpen: true,
    //                     message: 'Selected date earlier than the current date',
    //                     type: 'warning'
    //                 });
    //             }

    //             setExpiryDate(yesterdayFormatted);
    //             setShowExpiryWarning(false);
    //             setLastExpiryDateWasValid(false); // Mark as invalid state
    //             return;
    //         } else {
    //             // Valid date (today or future) - CHANGED: includes today
    //             setExpiryDate(formattedDate);
    //             setShowExpiryWarning(false);
    //             setLastExpiryDateWasValid(true); // Mark as valid state
    //         }
    //     } else {
    //         setExpiryDate(formattedDate);
    //     }
    // };

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
                        message: 'Selected date earlier than the current date',
                        type: 'warning'
                    });
                } else {
                    console.log("No error dialog - already in past date state");
                }

                // IMPORTANT: Force update even if value is the same
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
                        message: 'Selected date earlier than the current date',
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

    // const handleOneTimeDateChange = (date) => {
    //     const formattedDate = validateAndFormatDate(date);
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);

    //     const parts = formattedDate.split('/');

    //     // Check if it's a valid date
    //     if (parts.length === 3) {
    //         const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);

    //         if (selectedDate < today) {
    //             // For One Time schedule, also show error and set to yesterday
    //             setErrorDialog({
    //                 isOpen: true,
    //                 message: 'Selected date earlier than the current date',
    //                 type: 'warning'
    //             });

    //             const yesterday = new Date();
    //             yesterday.setDate(yesterday.getDate() - 1);
    //             const yesterdayFormatted = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
    //             setOneTimeDate(yesterdayFormatted);
    //         } else {
    //             setOneTimeDate(formattedDate);
    //         }
    //     } else {
    //         setOneTimeDate(formattedDate);
    //     }
    // };


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
                    message: 'Selected date earlier than the current date',
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
    // useEffect(() => {
    //     if (tagMasterData && tagMasterData.length > 0) {
    //         // Extract tag names for rule name dropdown
    //         const tagNames = tagMasterData.map(tag => ({
    //             RuleName: tag.sTagName,
    //             RuleID: tag.sTagID
    //         }));
    //         // Update your rule name combo options
    //         // You'll need to create a state for this
    //         setRuleNameOptions(tagNames);
    //     }
    // }, [tagMasterData]);
    // In the useEffect that loads tagMasterData, or create a new one:
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
        if (tagMasterData.some(tag => tag.sSourceFlag === 'Filename')) {
            const hasFilenameError = !sampleFilename.trim() ||
                !sampleFilename.includes('.') ||
                sampleFilename.lastIndexOf('.') >= sampleFilename.length - 1;

            const hasDelimiterError = !selectedDelimiters.length;

            setSampleFilenameError(hasFilenameError);
            setDelimiterError(hasDelimiterError);
        }
    }, [sampleFilename, selectedDelimiters, tagMasterData]);

    useEffect(() => {
        loadCombos();
    }, []);

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

    // Scroll Handler (Manual Calculation to prevent Header movement)
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

    // const handleSubmit = () => {
    //     // Reset warning first
    //     setShowExpiryWarning(false);
    //     setShowTriggerWarning(false);

    //     // Validate that both trigger and expiry dates are not in the past
    //     const triggerParts = triggerDate.split('/');
    //     const triggerDateOnly = new Date(triggerParts[2], triggerParts[1] - 1, triggerParts[0]);
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);

    //     if (triggerDateOnly < today) {
    //         setShowTriggerWarning(true);
    //         // Scroll to the Trigger/Expiry section
    //         if (triggerExpiryRef.current && scrollContainerRef.current) {
    //             const container = scrollContainerRef.current;
    //             const element = triggerExpiryRef.current;
    //             const elementRect = element.getBoundingClientRect();
    //             const containerRect = container.getBoundingClientRect();
    //             const offsetPosition = container.scrollTop + (elementRect.top - containerRect.top) - 20;

    //             container.scrollTo({
    //                 top: offsetPosition,
    //                 behavior: 'smooth'
    //             });
    //         }
    //         return;
    //     }

    //     const triggerTimeParts = triggerTime.split(':');
    //     const triggerDateTime = new Date(
    //         parseInt(triggerParts[2]),
    //         parseInt(triggerParts[1]) - 1,
    //         parseInt(triggerParts[0]),
    //         parseInt(triggerTimeParts[0]),
    //         parseInt(triggerTimeParts[1]),
    //         parseInt(triggerTimeParts[2])
    //     );

    //     if (expiryEnabled) {
    //         const expiryParts = expiryDate.split('/');
    //         const expiryTimeParts = expiryTime.split(':');

    //         const expiryDateTime = new Date(
    //             parseInt(expiryParts[2]),
    //             parseInt(expiryParts[1]) - 1,
    //             parseInt(expiryParts[0]),
    //             parseInt(expiryTimeParts[0]),
    //             parseInt(expiryTimeParts[1]),
    //             parseInt(expiryTimeParts[2])
    //         );

    //         if (expiryDateTime <= triggerDateTime) {
    //             setShowExpiryWarning(true);
    //             // Scroll to the Trigger/Expiry section
    //             if (triggerExpiryRef.current && scrollContainerRef.current) {
    //                 const container = scrollContainerRef.current;
    //                 const element = triggerExpiryRef.current;
    //                 const elementRect = element.getBoundingClientRect();
    //                 const containerRect = container.getBoundingClientRect();
    //                 const offsetPosition = container.scrollTop + (elementRect.top - containerRect.top) - 20;

    //                 container.scrollTo({
    //                     top: offsetPosition,
    //                     behavior: 'smooth'
    //                 });
    //             }
    //             return;
    //         }
    //     }

    //     if (expiryEnabled) {
    //         const expiryParts = expiryDate.split('/');
    //         const expiryTimeParts = expiryTime.split(':');

    //         const expiryDateTime = new Date(
    //             parseInt(expiryParts[2]),
    //             parseInt(expiryParts[1]) - 1,
    //             parseInt(expiryParts[0]),
    //             parseInt(expiryTimeParts[0]),
    //             parseInt(expiryTimeParts[1]),
    //             parseInt(expiryTimeParts[2])
    //         );

    //         if (expiryDateTime <= triggerDateTime) {
    //             setShowExpiryWarning(true);
    //             // Scroll to the Trigger/Expiry section
    //             if (triggerExpiryRef.current && scrollContainerRef.current) {
    //                 const container = scrollContainerRef.current;
    //                 const element = triggerExpiryRef.current;
    //                 const elementRect = element.getBoundingClientRect();
    //                 const containerRect = container.getBoundingClientRect();
    //                 const offsetPosition = container.scrollTop + (elementRect.top - containerRect.top) - 20;

    //                 container.scrollTo({
    //                     top: offsetPosition,
    //                     behavior: 'smooth'
    //                 });
    //             }
    //             return; // Don't submit
    //         }
    //     }

    //     // Continue with your submission logic here
    //     console.log('Form submitted successfully');
    // };

    const handleSubmit = async () => {
        console.log("=== SUBMIT STARTED ===");

        // Initialize validation object
        let passObjDet = {};
        let IsEmpty = false;

        // ========== VALIDATION SECTION ==========
        console.log("--- Starting Validation ---");

        // 1. Client Validation
        if (!selectedClient) {
            console.log("Client validation failed");
            setClientError(true);
            IsEmpty = true;
            scrollToSection(fileSettingsRef, scrollContainerRef);
        } else {
            setClientError(false);
        }

        // 2. Instrument Validation
        if (!selectedInstrument) {
            console.log("Instrument validation failed");
            IsEmpty = true;
            scrollToSection(fileSettingsRef, scrollContainerRef);
        }

        // 3. Method Validation (only if not disabled)
        if (!isMethodDisabled) {
            const selectedMethodIndex = methodOptions.findIndex(m => m.InstMethodName === selectedMethod);

            if (selectedMethodIndex === -1 || !selectedMethod) {
                console.log("Method validation failed");
                IsEmpty = true;
                scrollToSection(fileSettingsRef, scrollContainerRef);
            } else {
                const selectedMethodItem = methodOptions[selectedMethodIndex];
                passObjDet["L13MethodName"] = selectedMethodItem.MethodName;
                passObjDet["L13ParserInstCode"] = selectedMethodItem.InstName;
                passObjDet["L13ParserMethodGroup"] = selectedMethodItem.MethodGroup;
            }
        } else {
            passObjDet["L13MethodName"] = "DEFAULT";
        }

        // 4. Path Validation (Local or UNC)
        const radLocalPath = !isUNCPathEnabled;
        const radUNCPath = isUNCPathEnabled;

        if (radLocalPath) {
            console.log("Validating Local Path:", sourcePath);

            if (!sourcePath.trim()) {
                console.log("Source path is empty");
                setSourcePathError(true);
                IsEmpty = true;
                scrollToSection(fileSettingsRef, scrollContainerRef);
            } else {
                const pathValidation = CF_pathValidation(sourcePath);
                const sourcepathParts = sourcePath.split("\\");

                console.log("Path validation result:", pathValidation);
                console.log("Source path parts:", sourcepathParts);

                if (pathValidation) {
                    if (sourcepathParts[1] === "") {
                        console.log("Source path invalid - second part is empty");
                        setSourcePathError(true);
                        IsEmpty = true;
                        scrollToSection(fileSettingsRef, scrollContainerRef);
                    } else {
                        setSourcePathError(false);
                        passObjDet["L13SourcePath"] = sourcePath;
                        passObjDet["L13UNCStatus"] = 0;
                    }
                } else {
                    console.log("Source path validation failed");
                    setSourcePathError(true);
                    IsEmpty = true;
                    scrollToSection(fileSettingsRef, scrollContainerRef);
                }
            }
        }

        if (radUNCPath) {
            console.log("Validating UNC Path");
            IsEmpty = false;

            const UNCPathValidation = CF_UNCPathValidation(uncPath.trim());
            console.log("UNC Path validation result:", UNCPathValidation);

            if (!UNCPathValidation) {
                console.log("UNC Path validation failed");
                setUncPathError(true);
                IsEmpty = true;
                scrollToSection(fileSettingsRef, scrollContainerRef);
            } else {
                setUncPathError(false);
            }

            if (!uncUsername.trim()) {
                console.log("UNC Username is empty");
                setUncUsernameError(true);
                IsEmpty = true;
                scrollToSection(fileSettingsRef, scrollContainerRef);
            } else {
                setUncUsernameError(false);
            }

            if (!uncPassword.trim()) {
                console.log("UNC Password is empty");
                setUncPasswordError(true);
                IsEmpty = true;
                scrollToSection(fileSettingsRef, scrollContainerRef);
            } else {
                setUncPasswordError(false);
            }

            if (!selectedDomain) {
                console.log("Domain not selected");
                IsEmpty = true;
                scrollToSection(fileSettingsRef, scrollContainerRef);
            }

            if (!IsEmpty) {
                passObjDet["L13SourcePath"] = uncPath.trim();
                passObjDet["L13UNCStatus"] = 1;
            }
        }

        // 5. Filter Validation
        if (!filter.trim()) {
            console.log("Filter is empty");
            IsEmpty = true;
            scrollToSection(fileSettingsRef, scrollContainerRef);
        }

        // 6. Destination Validation
        if (!selectedDestination) {
            console.log("Destination not selected");
            IsEmpty = true;
            scrollToSection(fileSettingsRef, scrollContainerRef);
        } else {
            const destinationItem = destinationOptions.find(d => d.L09FTPID === selectedDestination);
            if (destinationItem) {
                passObjDet["L13FTPText"] = destinationItem.L09FTPAliasName;
            }
        }

        // 7. Delete Local Copy Validation
        if (deleteLocalCopy) {
            console.log("Validating Delete Local Copy");

            if (filesOlderThanEnabled) {
                if (!filesOlderDays.trim()) {
                    console.log("Files older days is empty");
                    IsEmpty = true;
                    scrollToSection(uploadPolicyRef, scrollContainerRef);
                }
            }
        }

        // 8. Subfolder Level Validation
        if (includeSubfolder) {
            console.log("Validating Subfolder Level");

            if (levelEnabled) {
                if (!levelValue.trim()) {
                    console.log("Level value is empty");
                    IsEmpty = true;
                    scrollToSection(uploadPolicyRef, scrollContainerRef);
                }
            }
        }

        // 9. File Audit Validation
        if (enableFileAudit) {
            console.log("Validating File Audit");

            if (!auditFilter.trim()) {
                console.log("Audit filter is empty");
                IsEmpty = true;
            } else {
                passObjDet["L52EnableVerAudit"] = true;
                passObjDet["L52AuditFilter"] = auditFilter;
            }
        } else {
            passObjDet["L52EnableVerAudit"] = false;
            passObjDet["L52AuditFilter"] = "";
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
        }

        if (!liveCapture) {
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
            } else if (scheduleWithoutVersioning) {
                passObjDet["L13VersionPolicy"] = 0;
            } else {
                passObjDet["L13VersionPolicy"] = 2;
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
                message: 'Must choose trigger time',
                type: 'warning'
            });
            scrollToSection(triggerExpiryRef, scrollContainerRef);
            return;
        } else {
            const startdate = `${triggerDate} ${starttriggertime[0]}`;
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
                    message: 'Must choose end time',
                    type: 'warning'
                });
                scrollToSection(triggerExpiryRef, scrollContainerRef);
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
        const timeinput = triggerTime.split(' ');
        const triggertime = `${triggerDate} ${timeinput[0]}`;
        passObjDet["L13TriggerTime"] = triggertime;
        console.log("L13TriggerTime set to:", triggertime);

        // ========== ONE TIME DATE ==========
        if (passObjDet["L13ScheduleMode"] === "O") {
            console.log("Setting One Time Date:", oneTimeDate);
            passObjDet["L13OneTimeDate"] = oneTimeDate;
            passObjDet["L13TriggerTime"] = `${oneTimeDate} ${starttriggertime[0]}`;
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
                passObjDet["L13StatusMonthDaysOrWeek"] = "Days";
                passObjDet["L13ActiveMonthlydays"] = GetActiveMonthlyDays(monthlySelectedDays);
                console.log("Monthly Days:", passObjDet["L13ActiveMonthlydays"]);
            } else {
                passObjDet["L13ActiveMonthlydays"] = "";
            }

            if (monthlyOnToggle) {
                passObjDet["L13StatusMonthDaysOrWeek"] = "Week";
                passObjDet["L13ActiveWeekNoMonthly"] = GetActiveWeekNO(monthlySelectedWeeks, weekOptions);
                passObjDet["L13ActiveDayOfWeekMonthly"] = GetActiveWeekDays(monthlySelectedWeekdays, weekdayOptions);
                console.log("Monthly Week Data:", {
                    WeekNo: passObjDet["L13ActiveWeekNoMonthly"],
                    DayOfWeek: passObjDet["L13ActiveDayOfWeekMonthly"]
                });
            } else {
                passObjDet["L13StatusMonthDaysOrWeek"] = "Week";
                passObjDet["L13ActiveWeekNoMonthly"] = "";
                passObjDet["L13ActiveDayOfWeekMonthly"] = "";
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
            passObjDet["L13AutoLocalDeleteStatus"] = localDeleteMode;
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
        passObjDet["L13CreatedBy"] = userDetails.sUserID;
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
                    message: 'Trigger Date/time should not be less than expiry date/time',
                    type: 'warning'
                });
                scrollToSection(triggerExpiryRef, scrollContainerRef);
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

        // ========== SCHEDULER METADATA ==========
        console.log("--- Processing Scheduler Metadata ---");

        passObjDet["L13Active"] = isSchedulerMetadataEnabled ? 1 : 0;

        if (isSchedulerMetadataEnabled) {
            console.log("Scheduler Metadata is enabled - validating");

            // Template validation
            if (!selectedTemplate) {
                console.log("Template not selected");
                IsEmpty = true;
                scrollToSection(schedulerMetadataRef, scrollContainerRef);
            } else {
                passObjDet["L13TemplateID"] = selectedTemplate;
            }

            const samplefilename = sampleFilename;
            const Delimeter = selectedDelimiters.length > 0
                ? ConcatenateDelimeterfromlist(selectedDelimiters, delimiterOptions)
                : "";

            console.log("Sample Filename:", samplefilename);
            console.log("Delimiter:", Delimeter);

            let tagmetadatagridlst = [...tagMasterData];

            // Validate tags
            for (let i = 0; i < tagmetadatagridlst.length; i++) {
                const sValue = (tagmetadatagridlst[i]["sValue"] || "").trim();
                const sValueID = (tagmetadatagridlst[i]["sValueID"] || "").trim();
                const sSourceFlag = tagmetadatagridlst[i]["sSourceFlag"] || "NONE";

                console.log(`Validating tag ${i}:`, {
                    TagName: tagmetadatagridlst[i]["sTagName"],
                    SourceFlag: sSourceFlag,
                    Value: sValue,
                    ValueID: sValueID
                });

                if ((sValue === "" || sValueID === "") && sSourceFlag !== "NONE") {
                    console.log(`Tag ${i} validation failed - missing value or valueID`);
                    IsEmpty = true;
                    scrollToSection(schedulerMetadataRef, scrollContainerRef);
                }

                if (sSourceFlag === "Filename") {
                    if (Delimeter === "") {
                        console.log("Delimiter is empty for Filename source");
                        setDelimiterError(true);
                        IsEmpty = true;
                        scrollToSection(schedulerMetadataRef, scrollContainerRef);
                    } else {
                        setDelimiterError(false);
                    }

                    if (samplefilename === "") {
                        console.log("Sample filename is empty");
                        setSampleFilenameError(true);
                        IsEmpty = true;
                        scrollToSection(schedulerMetadataRef, scrollContainerRef);
                    }

                    const { splitpath } = SplitFilenamewithExt(samplefilename, Delimeter);
                    console.log("Split path result:", splitpath);

                    if (splitpath.length <= 1 && Delimeter !== "None") {
                        console.log("Split path validation failed");
                        IsEmpty = true;
                        setDelimiterError(true);
                        setSampleFilenameError(true);
                        scrollToSection(schedulerMetadataRef, scrollContainerRef);
                    }

                    if (parseInt(sValue) > splitpath.length) {
                        console.log("Value index exceeds split path length");
                        IsEmpty = true;
                        setDelimiterError(true);
                        setSampleFilenameError(true);
                        scrollToSection(schedulerMetadataRef, scrollContainerRef);
                    }

                    if (!IsEmpty) {
                        setSampleFilenameError(false);
                    }
                }

                // Transform data
                tagmetadatagridlst[i]["sTextData"] = "";
                if (sSourceFlag === "NONE") {
                    tagmetadatagridlst[i]["sTextData"] = sValueID;
                    tagmetadatagridlst[i]["sValue"] = "";
                    tagmetadatagridlst[i]["sValueID"] = "";
                }
            }

            const subfolderlevel = 0;

            if (Instrumentitem) {
                passObjDet["L13InstrumentID"] = Instrumentitem.L12InstrumentID;
            }

            passObjDet["L13FileDelimiter"] = Delimeter;
            passObjDet["L13Examplefilename"] = samplefilename;
            passObjDet["L13SubfolderLevel"] = subfolderlevel;
            passObjDet["SchedulerExtractionlst"] = tagmetadatagridlst;

            console.log("Scheduler Metadata Data:", {
                FileDelimiter: passObjDet["L13FileDelimiter"],
                Examplefilename: passObjDet["L13Examplefilename"],
                ExtractionList: passObjDet["SchedulerExtractionlst"]
            });
        }

        // // ========== SCHEDULER METADATA ==========
        // console.log("--- Processing Scheduler Metadata ---");

        // passObjDet["L13Active"] = isSchedulerMetadataEnabled ? 1 : 0;

        // if (isSchedulerMetadataEnabled) {
        //     console.log("Scheduler Metadata is enabled - validating");

        //     // Template validation
        //     if (!selectedTemplate) {
        //         console.log("Template not selected");
        //         IsEmpty = true;
        //         scrollToSection(schedulerMetadataRef, scrollContainerRef);
        //     } else {
        //         passObjDet["L13TemplateID"] = selectedTemplate;
        //     }

        //     const samplefilename = sampleFilename;
        //     const Delimeter = selectedDelimiters.length > 0
        //         ? ConcatenateDelimeterfromlist(selectedDelimiters, delimiterOptions)
        //         : "";

        //     console.log("Sample Filename:", samplefilename);
        //     console.log("Delimiter:", Delimeter);

        //     let tagmetadatagridlst = [...tagMasterData];

        //     // Validate tags
        //     for (let i = 0; i < tagmetadatagridlst.length; i++) {
        //         const sValue = (tagmetadatagridlst[i]["sValue"] || "").trim();
        //         const sValueID = (tagmetadatagridlst[i]["sValueID"] || "").trim();
        //         const sSourceFlag = tagmetadatagridlst[i]["sSourceFlag"] || "NONE";

        //         console.log(`Validating tag ${i}:`, {
        //             TagName: tagmetadatagridlst[i]["sTagName"],
        //             SourceFlag: sSourceFlag,
        //             Value: sValue,
        //             ValueID: sValueID
        //         });

        //         if ((sValue === "" || sValueID === "") && sSourceFlag !== "NONE") {
        //             console.log(`Tag ${i} validation failed - missing value or valueID`);
        //             IsEmpty = true;
        //             scrollToSection(schedulerMetadataRef, scrollContainerRef);
        //         }

        //         if (sSourceFlag === "Filename") {
        //             if (Delimeter === "") {
        //                 console.log("Delimiter is empty for Filename source");
        //                 setDelimiterError(true);
        //                 IsEmpty = true;
        //                 scrollToSection(schedulerMetadataRef, scrollContainerRef);
        //             } else {
        //                 setDelimiterError(false);
        //             }

        //             if (samplefilename === "") {
        //                 console.log("Sample filename is empty");
        //                 setSampleFilenameError(true);
        //                 IsEmpty = true;
        //                 scrollToSection(schedulerMetadataRef, scrollContainerRef
        //                 );
        //             }
        //             const { splitpath } = SplitFilenamewithExt(samplefilename, selectedDelimiters, delimiterOptions);
        //             console.log("Split path result:", splitpath);

        //             if (splitpath.length <= 1 && Delimeter !== "None") {
        //                 console.log("Split path validation failed");
        //                 IsEmpty = true;
        //                 setDelimiterError(true);
        //                 setSampleFilenameError(true);
        //                 scrollToSection(schedulerMetadataRef, scrollContainerRef);
        //             }

        //             if (parseInt(sValue) > splitpath.length) {
        //                 console.log("Value index exceeds split path length");
        //                 IsEmpty = true;
        //                 setDelimiterError(true);
        //                 setSampleFilenameError(true);
        //                 scrollToSection(schedulerMetadataRef, scrollContainerRef);
        //             }

        //             if (!IsEmpty) {
        //                 setSampleFilenameError(false);
        //             }
        //         }

        //         // Transform data
        //         tagmetadatagridlst[i]["sTextData"] = "";
        //         if (sSourceFlag === "NONE") {
        //             tagmetadatagridlst[i]["sTextData"] = sValueID;
        //             tagmetadatagridlst[i]["sValue"] = "";
        //             tagmetadatagridlst[i]["sValueID"] = "";
        //         }
        //     }

        //     const subfolderlevel = 0;

        //     if (Instrumentitem) {
        //         passObjDet["L13InstrumentID"] = Instrumentitem.L12InstrumentID;
        //     }

        //     passObjDet["L13FileDelimiter"] = Delimeter;
        //     passObjDet["L13Examplefilename"] = samplefilename;
        //     passObjDet["L13SubfolderLevel"] = subfolderlevel;
        //     passObjDet["SchedulerExtractionlst"] = tagmetadatagridlst;

        //     console.log("Scheduler Metadata Data:", {
        //         FileDelimiter: passObjDet["L13FileDelimiter"],
        //         Examplefilename: passObjDet["L13Examplefilename"],
        //         ExtractionList: passObjDet["SchedulerExtractionlst"]
        //     });

        //     // Path Extraction Rules (if needed)
        //     let pathextractionrule = [];
        //     // Add your path extraction rule logic here if you have a grid for it
        //     passObjDet["PathExtractionRule"] = pathextractionrule;
        // }

        // ========== FINAL VALIDATION CHECK ==========
        console.log("--- Final Validation Check ---");
        console.log("IsEmpty:", IsEmpty);

        if (IsEmpty) {
            console.log("Validation failed - showing error dialog");
            setErrorDialog({
                isOpen: true,
                message: 'Please fill in all required fields',
                type: 'warning'
            });
            return;
        }

        // ========== API SUBMISSION ==========
        console.log("--- Starting API Submission ---");
        console.log("Final passObjDet:", passObjDet);

        try {
            // Check if instrument needs parsing order validation
            const InstrumentOriginalItem = Instrumentitem;

            if (
                InstrumentOriginalItem &&
                InstrumentOriginalItem.L11InterfaceStatus === 1 &&
                InstrumentOriginalItem.L11ParserType > 0 &&
                InstrumentOriginalItem.L11LockType === "M"
            ) {
                console.log("Checking instrument parsing order");

                passObjDet["sInstrumentMappingID"] = InstrumentOriginalItem.L12InstrumentMappingID;

                const checkParsingOrderData = {
                    ...CF_activeUserdetails(),
                    passObjDet: passObjDet
                };

                const parsingOrderResponse = await postData(
                    'Scheduler/CheckInstrumentExistwithParsingOrder',
                    checkParsingOrderData
                );

                console.log("Parsing order response:", parsingOrderResponse);

                // Handle parsing order response
                if (parsingOrderResponse && parsingOrderResponse.success) {
                    // Proceed with final submission
                    await submitScheduler(passObjDet);
                } else {
                    // Show error if parsing order check failed
                    setErrorDialog({
                        isOpen: true,
                        message: parsingOrderResponse.message || 'Failed to validate instrument parsing order',
                        type: 'error'
                    });
                }
            } else {
                // No parsing order check needed - proceed directly
                await submitScheduler(passObjDet);
            }
        } catch (error) {
            console.error("API submission error:", error);
            setErrorDialog({
                isOpen: true,
                message: error.message || 'An error occurred while submitting the form',
                type: 'error'
            });
        }
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
                'Scheduler/CreateScheduler', // Replace with your actual API endpoint
                finalData
            );

            console.log("Scheduler creation response:", response);

            if (response && response.success) {
                setErrorDialog({
                    isOpen: true,
                    message: 'Scheduler created successfully',
                    type: 'success'
                });
                // Optionally reset form or navigate
                // handleReset();
            } else {
                setErrorDialog({
                    isOpen: true,
                    message: response.message || 'Failed to create scheduler',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error("Scheduler submission error:", error);
            setErrorDialog({
                isOpen: true,
                message: error.message || 'An error occurred while creating the scheduler',
                type: 'error'
            });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">

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
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-[5px] shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 transform active:scale-95">
                            <div className="w-4 h-4 border-2 border-white rounded flex items-center justify-center">
                                <Check size={10} strokeWidth={4} />
                            </div>
                            <span>Submit</span>
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 px-4 py-2.5 rounded-[5px] text-sm font-medium transition-all duration-200"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </header>

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
                                    <div className="relative group w-full">
                                        <label className="block text-gray-600 text-sm font-bold mb-2">
                                            Client Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
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
                                                className={`w-full bg-transparent border-b-2 py-2 pr-8 text-gray-700 text-sm focus:outline-none appearance-none cursor-pointer transition-colors ${clientError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'
                                                    }`}
                                            >
                                                <option value="" disabled hidden></option>
                                                {clientOptions.map((option, index) => (
                                                    <option key={index} value={option.L06ClientID}>
                                                        {option.L06ClientName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className="text-blue-500 fill-current" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group w-full">
                                        <label className="block text-gray-600 text-sm font-bold mb-2">
                                            Instrument <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
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
                                                            await loadMethods(selectedInstrData);
                                                        }
                                                    } else {
                                                        setSelectedInstrument('');
                                                        setMethodOptions([]);
                                                        setIsMethodDisabled(true);
                                                    }
                                                }}
                                                disabled={isInstrumentDisabled}
                                                className={`w-full bg-transparent border-b-2 py-2 pr-8 text-gray-700 text-sm focus:outline-none appearance-none transition-colors ${isInstrumentDisabled
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 border-[rgb(145,220,243)]'
                                                    : 'cursor-pointer border-[#e2e2e2] focus:border-blue-400'
                                                    }`}
                                            >
                                                <option value="" disabled hidden></option>
                                                {instrumentOptions.map((option, index) => (
                                                    <option key={index} value={option.L12InstrumentMappingID}>
                                                        {option.L11InstrumentName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className="text-blue-500 fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative group w-full">
                                        <label className="block text-gray-600 text-sm font-bold mb-2">
                                            Default Parser Method
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedMethod || ""}
                                                onChange={(e) => setSelectedMethod(e.target.value)}
                                                disabled={isMethodDisabled}
                                                className={`w-full bg-transparent border-b-2 py-2 pr-8 text-gray-700 text-sm focus:outline-none appearance-none transition-colors ${isMethodDisabled
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 border-[rgb(145,220,243)]'
                                                    : 'cursor-pointer border-[#e2e2e2] focus:border-blue-400'
                                                    }`}
                                            >
                                                <option value="" disabled hidden></option>
                                                {methodOptions.map((option, index) => (
                                                    <option key={index} value={option.InstMethodName}>
                                                        {option.InstMethodName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className="text-blue-500 fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <label className="block text-gray-600 text-sm font-bold">Path Type</label>
                                        <div
                                            className="flex items-center gap-3 pt-1 cursor-pointer"
                                            onClick={() => {
                                                if (isUNCPathEnabled) {
                                                    setIsUNCPathEnabled(false);
                                                    setUncPath('');
                                                    setUncUsername('');
                                                    setUncPassword('');
                                                    setUncPathError(false);
                                                    setUncUsernameError(false);
                                                    setUncPasswordError(false);
                                                }
                                            }}
                                        >
                                            <span className="text-gray-700 text-sm font-medium">Local Path</span>
                                            <div className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${!isUNCPathEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${!isUNCPathEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Source Path <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-end gap-3">
                                            <input
                                                type="text"
                                                value={sourcePath}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (CF_sourcePathValidation(value) && CF_textFieldValidation(value)) {
                                                        setSourcePath(value);
                                                        setSourcePathError(false);
                                                    }
                                                }}
                                                disabled={isUNCPathEnabled}
                                                className={`flex-1 bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none transition-colors ${isUNCPathEnabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                                    } ${sourcePathError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={validateAndShowCheckPathModal}
                                                disabled={isUNCPathEnabled}
                                                className={`bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors ${isUNCPathEnabled ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                <Check size={16} strokeWidth={3} /> Check
                                            </button>
                                        </div>
                                        <p className="text-gray-400 text-xs mt-3 font-medium">
                                            NOTE:- Browse is not supported. Manually copy the path
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-gray-600 font-bold text-base mb-8">UNC Credentials</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-10">
                                    <div className="space-y-8">
                                        <div
                                            className="flex items-center gap-4 cursor-pointer"
                                            onClick={() => {
                                                if (!isUNCPathEnabled) {
                                                    setIsUNCPathEnabled(true);
                                                    setSourcePath('');
                                                    setSourcePathError(false);
                                                }
                                            }}
                                        >
                                            <label className="text-gray-600 text-sm font-bold">UNC Path</label>
                                            <div className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${isUNCPathEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isUNCPathEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-end gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        UNC Path
                                                    </label>
                                                    {/* <input
                                                        type="text"
                                                        value={uncPath}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (CF_UNCPathValidation(value) && CF_sourcePathValidation(value) && CF_textFieldValidation(value)) {
                                                                setUncPath(value);
                                                                setUncPathError(false);
                                                            }
                                                        }}
                                                        disabled={!isUNCPathEnabled}
                                                        className={`w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none transition-colors ${!isUNCPathEnabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                                            } ${uncPathError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'}`}
                                                    /> */}
                                                    <input
                                                        type="text"
                                                        value={uncPath}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setUncPath(value);

                                                            setUncPathError(
                                                                !CF_UNCPathValidation(value) ||
                                                                !CF_sourcePathValidation(value) ||
                                                                !CF_textFieldValidation(value)
                                                            );
                                                        }}
                                                        disabled={!isUNCPathEnabled}
                                                        className={`w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none transition-colors
    ${!isUNCPathEnabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
    ${uncPathError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'}`}
                                                    />

                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={validateAndShowUNCPathModal}
                                                    disabled={!isUNCPathEnabled}
                                                    className={`bg-blue-50 text-blue-600 border-1 border-gray-500 hover:bg-blue-100 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors mb-1 ${!isUNCPathEnabled ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                >
                                                    <Check size={16} strokeWidth={3} /> Check
                                                </button>
                                            </div>
                                            <p className="text-gray-400 text-xs mt-3 font-medium">NOTE:- Browse is not supported. Manually copy the path</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="group w-full relative">
                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    value={uncUsername}
                                                    onChange={(e) => {
                                                        if (CF_textFieldValidation(e.target.value)) {
                                                            setUncUsername(e.target.value);
                                                            setUncUsernameError(false);
                                                        }
                                                    }}
                                                    disabled={!isUNCPathEnabled}
                                                    className={`w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none transition-colors ${!isUNCPathEnabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                                        } ${uncUsernameError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'}`}
                                                />
                                            </div>
                                            <div className="group w-full relative">
                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                    Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={uncPassword}
                                                    onChange={(e) => {
                                                        if (CF_textFieldValidation(e.target.value)) {
                                                            setUncPassword(e.target.value);
                                                            setUncPasswordError(false);
                                                        }
                                                    }}
                                                    disabled={!isUNCPathEnabled}
                                                    className={`w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none transition-colors ${!isUNCPathEnabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                                        } ${uncPasswordError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'}`}
                                                />
                                            </div>
                                        </div>
                                        <UnderlineSelect
                                            label="Domain"
                                            options={domainOptions}
                                            displayKey="L03DomainName"
                                            valueKey="L03DomainID"
                                            value={selectedDomain}
                                            onChange={(value) => setSelectedDomain(value)}
                                            disabled={!isUNCPathEnabled}
                                        />
                                    </div>
                                    <div className="space-y-10">
                                        <UnderlineSelect
                                            label="Destination"
                                            required
                                            options={destinationOptions}
                                            displayKey="L09FTPAliasName"
                                            valueKey="L09FTPID"
                                            value={selectedDestination}
                                            onChange={(value) => setSelectedDestination(value)}
                                        />
                                        <div className="group w-full relative">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                Filter
                                            </label>
                                            <input
                                                type="text"
                                                value={filter}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (CF_textFieldValidation(value) && CF_maxLengthValidation(value, 50)) {
                                                        setFilter(value);
                                                    }
                                                }}
                                                className="w-full bg-transparent border-b-2 border-gray-200 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400"
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
                            <SectionHeader title="Upload Policy" />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-12">
                                {/* Left Column */}
                                <div className="space-y-8">
                                    <SquareCheckbox
                                        label="Include Subfolder"
                                        checked={includeSubfolder}
                                        onChange={() => {
                                            const newValue = !includeSubfolder;
                                            setIncludeSubfolder(newValue);

                                            if (newValue) {
                                                setCompleteTree(true);  // Auto-enable Complete Tree
                                                setLevelEnabled(false); // Level enabled but OFF
                                            } else {
                                                setCompleteTree(false);
                                                setLevelEnabled(false);
                                                setLevelValue('');
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-800">Complete Tree</span>
                                            <div
                                                onClick={() => {
                                                    if (includeSubfolder) {
                                                        const newCompleteTree = !completeTree;
                                                        setCompleteTree(newCompleteTree);
                                                        // When Complete Tree is turned ON, turn OFF Level
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
                                                <span className="text-sm font-bold text-blue-800">Level</span>
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
                                            <input
                                                type="text"
                                                value={levelValue}
                                                onChange={(e) => {
                                                    if (CF_numberValidation(e.target.value, 5)) {
                                                        setLevelValue(e.target.value);
                                                    }
                                                }}
                                                disabled={!levelEnabled || !includeSubfolder}
                                                className={`w-24 border-b-2 px-2 py-1 text-sm ${(!levelEnabled || !includeSubfolder) ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-200 focus:border-blue-400 focus:outline-none'
                                                    }`}
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
                                            <span className={`text-sm font-bold ${copyFiles ? 'text-blue-600' : 'text-blue-800'}`}>Copy Files</span>
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
                                            <span className={`text-sm font-bold ${moveFiles ? 'text-blue-600' : 'text-blue-800'}`}>Move Files(Do not leave local copy)</span>
                                            <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${moveFiles ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${moveFiles ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
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
                                                    setFilesOlderDays('');
                                                    setFilesOlderThanDate(new Date().toLocaleDateString('en-GB'));
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
                                        <span className="text-sm text-blue-800 font-bold">Delete local copy</span>
                                    </div>

                                    {/* First Files older than (number) */}
                                    <div className="flex items-end gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-800">Files older than</span>
                                            {/* <div
                                                onClick={() => {
                                                    if (deleteLocalCopy && !moveFiles) { // Check moveFiles
                                                        if (!filesOlderThanEnabled) {
                                                            setFilesOlderThanEnabled(true);
                                                            setFilesOlderThanDateEnabled(false);
                                                        } else {
                                                            setFilesOlderThanEnabled(false);
                                                            setFilesOlderThanDateEnabled(true);
                                                        }
                                                    }
                                                }} */}
                                            <div
                                                onClick={() => {
                                                    if (deleteLocalCopy && !moveFiles) {
                                                        setFilesOlderThanEnabled(!filesOlderThanEnabled);
                                                        if (!filesOlderThanEnabled) {
                                                            // If turning ON first, turn OFF second
                                                            setFilesOlderThanDateEnabled(false);
                                                        }
                                                    }
                                                }}
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${(deleteLocalCopy && !moveFiles) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                                    } ${filesOlderThanEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${filesOlderThanEnabled ? 'translate-x-4' : 'translate-x-0'
                                                    }`}></div>
                                            </div>
                                        </div>

                                        <input
                                            type="text"
                                            value={filesOlderDays}
                                            onChange={(e) => {
                                                if (CF_numberValidation(e.target.value, 5)) {
                                                    setFilesOlderDays(e.target.value);
                                                }
                                            }}
                                            disabled={!filesOlderThanEnabled || !deleteLocalCopy || moveFiles}
                                            className={`w-16 border-b-2 px-1 py-1 text-sm ${(!filesOlderThanEnabled || !deleteLocalCopy || moveFiles)
                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                : 'border-gray-300'
                                                }`}
                                        />

                                        {/* Days dropdown */}
                                        <div className="w-24 relative">
                                            <select
                                                value={filesOlderDaysUnit}
                                                onChange={(e) => setFilesOlderDaysUnit(e.target.value)}
                                                disabled={!filesOlderThanEnabled || !deleteLocalCopy}
                                                className={`w-full bg-transparent border-b-2 py-1 pr-6 text-sm appearance-none focus:outline-none ${(!filesOlderThanEnabled || !deleteLocalCopy)
                                                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'text-gray-700 border-gray-300 focus:border-blue-400 cursor-pointer'
                                                    }`}
                                            >
                                                {daysCombo.map((item) => (
                                                    <option key={item.Number} value={item.Number}>
                                                        {item.Date}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className={(!filesOlderThanEnabled || !deleteLocalCopy) ? 'text-gray-300' : 'text-gray-400'} />
                                            </div>
                                        </div>

                                        {/* Automatic/Manual dropdown - SAME LINE */}
                                        <div className="w-32 relative">
                                            <select
                                                value={localDeleteMode}
                                                onChange={(e) => setLocalDeleteMode(e.target.value)}
                                                // disabled={(!filesOlderThanEnabled && !filesOlderThanDateEnabled) || !deleteLocalCopy || moveFiles}
                                                disabled={!deleteLocalCopy || moveFiles}
                                                className={`w-full bg-transparent border-b-2 py-1 pr-6 text-sm italic appearance-none focus:outline-none ${((!filesOlderThanEnabled && !filesOlderThanDateEnabled) || !deleteLocalCopy || moveFiles)
                                                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                                    : 'text-gray-600 border-gray-300 focus:border-blue-400 cursor-pointer'
                                                    }`}
                                            >
                                                {serverDeleteCombo.map((item) => (
                                                    <option key={item.ServerDeleteNo} value={item.ServerDeleteNo}>
                                                        {item.ServerDeleteName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown size={14} className={
                                                    ((!filesOlderThanEnabled && !filesOlderThanDateEnabled) || !deleteLocalCopy || moveFiles)
                                                        ? 'text-gray-200'
                                                        : 'text-gray-300'
                                                } />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Second Files older than (date) */}
                                    <div className="flex items-end gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-800">Files older than</span>
                                            <div
                                                // onClick={() => {
                                                //     if (deleteLocalCopy && !moveFiles && filesOlderThanEnabled) {
                                                //         // Enable BOTH first and second Files older than
                                                //         if (!filesOlderThanDateEnabled) {
                                                //             setFilesOlderThanDateEnabled(true);
                                                //             // Keep first one enabled too
                                                //         } else {
                                                //             setFilesOlderThanDateEnabled(false);
                                                //         }
                                                //     }
                                                // }}

                                                onClick={() => {
                                                    if (deleteLocalCopy && !moveFiles) {
                                                        setFilesOlderThanDateEnabled(!filesOlderThanDateEnabled);
                                                        if (!filesOlderThanDateEnabled) {
                                                            // If turning ON second, turn OFF first
                                                            setFilesOlderThanEnabled(false);
                                                        }
                                                    }
                                                }}
                                                // className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${(deleteLocalCopy && !moveFiles && filesOlderThanEnabled) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${(deleteLocalCopy && !moveFiles) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${filesOlderThanDateEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${filesOlderThanDateEnabled ? 'translate-x-4' : 'translate-x-0'
                                                    }`}></div>
                                            </div>
                                        </div>

                                        {/* <DatePickerInput
                                            value={filesOlderThanDate}
                                            onChange={(date) => setFilesOlderThanDate(date)}
                                            disabled={!filesOlderThanDateEnabled || !deleteLocalCopy || moveFiles}
                                            allowFuture={false}  // This means future dates are NOT allowed
                                            allowPast={true}     // Past dates ARE allowed
                                            validateAndFormatDate={validateAndFormatDate}
                                        /> */}

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
                            <SectionHeader title="Schedule Trigger/Expiry On" />
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <label className="text-gray-600 text-sm font-bold w-24">Trigger on</label>

                                    {/* 
                                    <DatePickerInput
                                        value={triggerDate}
                                        onChange={handleTriggerDateChange}
                                        onInputChange={(value) => {
                                            setIsManualTyping(true);
                                            handleTriggerDateChange(value);
                                        }}
                                        allowPast={false}
                                        allowFuture={true}
                                    /> */}

                                    {/* <DatePickerInput
                                        value={triggerDate}
                                        onChange={handleTriggerDateChange}
                                        onInputChange={(value) => {
                                            const formattedDate = validateAndFormatDate(value);
                                            handleTriggerDateChange(formattedDate);
                                        }}
                                        allowPast={false}
                                        allowFuture={true}
                                        validateAndFormatDate={validateAndFormatDate}
                                    /> */}

                                    {/* <DatePickerInput
                                        value={triggerDate}
                                        onChange={handleTriggerDateChange}
                                        onInputChange={(value) => {
                                            const formattedDate = validateAndFormatDate(value);
                                            // Check if the date is past BEFORE calling handleTriggerDateChange
                                            const parts = formattedDate.split('/');
                                            const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);

                                            if (selectedDate < today) {
                                                // Don't call handleTriggerDateChange here, let onBlur handle it
                                                // Just update the input display
                                                const formatted = validateAndFormatDate(value);
                                                setTriggerDate(formatted);
                                            } else {
                                                handleTriggerDateChange(formattedDate);
                                            }
                                        }}
                                        allowPast={false}
                                        allowFuture={true}
                                        validateAndFormatDate={validateAndFormatDate}
                                    /> */}


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
                                    <div className="-ml-24 flex items-center gap-4">
                                        <SquareCheckbox
                                            label="Expiry Date & Time"
                                            boldLabel
                                            checked={expiryEnabled}
                                            onChange={() => {
                                                setExpiryEnabled(!expiryEnabled);
                                                setShowExpiryWarning(false); // Clear warning when toggling
                                            }}
                                        />
                                        {/* <DatePickerInput
                                            value={expiryDate}
                                            // onChange={handleExpiryDateChange}
                                            onChange={(value) => {
                                                // setIsManualTyping(true);
                                                handleExpiryDateChange(value);
                                            }}
                                            disabled={!expiryEnabled}
                                            allowPast={false}
                                            // allowPast={true}
                                            allowFuture={true}
                                        /> */}
                                        {/* <DatePickerInput
                                            value={expiryDate}
                                            onChange={handleExpiryDateChange}
                                            onInputChange={(value) => {
                                                const formattedDate = validateAndFormatDate(value);
                                                handleExpiryDateChange(formattedDate);
                                            }}
                                            disabled={!expiryEnabled}
                                            allowPast={false}
                                            allowFuture={true}
                                            validateAndFormatDate={validateAndFormatDate}
                                        /> */}

                                        {/* <DatePickerInput
                                            value={expiryDate}
                                            onChange={handleExpiryDateChange}
                                            onInputChange={(value) => {
                                                const formattedDate = validateAndFormatDate(value);
                                                // Check if the date is past BEFORE calling handleExpiryDateChange
                                                const parts = formattedDate.split('/');
                                                const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);

                                                if (selectedDate < today) {
                                                    // Don't call handleExpiryDateChange here, let onBlur handle it
                                                    // Just update the input display
                                                    const formatted = validateAndFormatDate(value);
                                                    setExpiryDate(formatted);
                                                } else {
                                                    handleExpiryDateChange(formattedDate);
                                                }
                                            }}
                                            disabled={!expiryEnabled}
                                            allowPast={false}
                                            allowFuture={true}
                                            validateAndFormatDate={validateAndFormatDate}
                                        /> */}

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
                                                Trigger Date/time should not be less than expiry date/time
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
                                    <h3 className="text-blue-600 font-bold text-sm">File Delete Policy</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer group"
                                                onClick={() => {
                                                    if (!moveFiles) {
                                                        const newValue = !applyDeletePolicy;
                                                        setApplyDeletePolicy(newValue);
                                                    }
                                                }}
                                            >
                                                <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${moveFiles
                                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                                                    : applyDeletePolicy
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'bg-white border-gray-300 group-hover:border-blue-400'
                                                    }`}>
                                                    {applyDeletePolicy && <Check size={14} className={moveFiles ? 'text-gray-400' : 'text-white'} strokeWidth={3} />}
                                                </div>
                                                <label className="text-sm text-gray-800 font-medium whitespace-nowrap">
                                                    Apply Delete Policy for Server Files
                                                </label>
                                            </div>

                                            <div className="relative w-32">
                                                <select
                                                    value={serverDeleteMode}
                                                    onChange={(e) => setServerDeleteMode(e.target.value)}
                                                    disabled={!applyDeletePolicy}
                                                    className={`w-full bg-transparent border-b-2 py-1 pr-6 text-sm italic appearance-none focus:outline-none ${!applyDeletePolicy
                                                        ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                                        : 'text-gray-600 border-gray-300 focus:border-blue-400 cursor-pointer'
                                                        }`}
                                                >
                                                    {serverDeleteCombo.map((item) => (
                                                        <option key={item.ServerDeleteNo} value={item.ServerDeleteNo}>
                                                            {item.ServerDeleteName}
                                                        </option>
                                                    ))}
                                                </select>

                                                <ChevronDown
                                                    size={14}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                />
                                            </div>
                                        </div>
                                        <SquareCheckbox
                                            label="Enable file link"
                                            boldLabel
                                            checked={enableFileLink}
                                            onChange={() => setEnableFileLink(!enableFileLink)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-blue-600 font-bold text-sm">Compliance Policy</h3>
                                    <div className="space-y-6">
                                        <SquareCheckbox
                                            label="Enable File Audit"
                                            boldLabel
                                            checked={enableFileAudit}
                                            onChange={() => setEnableFileAudit(!enableFileAudit)}
                                        />
                                        <div className="flex items-center gap-4">
                                            <label className="text-gray-600 text-sm font-bold w-20">Audit Filter</label>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={auditFilter}
                                                    onChange={(e) => {
                                                        if (CF_textFieldValidation(e.target.value)) {
                                                            setAuditFilter(e.target.value);
                                                        }
                                                    }}
                                                    disabled={!enableFileAudit}
                                                    className={`w-full bg-transparent border-b pb-1 text-sm focus:outline-none ${enableFileAudit
                                                        ? 'border-gray-300 text-gray-700 focus:border-blue-400'
                                                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-blue-600 font-bold text-sm">Data Logger</h3>
                                    <div className="space-y-6">
                                        <SquareCheckbox
                                            label="Data Logger"
                                            boldLabel
                                            checked={dataLogger}
                                            onChange={() => setDataLogger(!dataLogger)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <label className="text-gray-600 text-sm font-bold w-16">Archival</label>
                                            <input
                                                type="text"
                                                value={archivalDays}
                                                onChange={(e) => {
                                                    if (CF_numberValidation(e.target.value, 5)) {
                                                        setArchivalDays(e.target.value);
                                                    }
                                                }}
                                                disabled={!dataLogger}
                                                className={`w-20 border-b h-6 text-sm focus:outline-none ${dataLogger
                                                    ? 'bg-white border-gray-300 text-gray-700'
                                                    : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            />
                                            <span className="text-gray-600 text-sm font-bold">Days Older</span>
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
                            <SectionHeader title="Schedule Capture" />
                            <div className="space-y-6">
                                <SquareCheckbox
                                    label="Live Capture"
                                    boldLabel
                                    checked={liveCapture}
                                    onChange={() => {
                                        const newValue = !liveCapture;
                                        setLiveCapture(newValue);

                                        if (newValue) {
                                            // Reset to default versioning options
                                            setLiveCaptureVersioning(true);
                                            setOneVersionPerDay(false);
                                            setWithoutVersioning(false);
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
                                                setWithoutVersioning(false);
                                            }
                                        }}>
                                            <span className={`text-sm font-bold ${liveCaptureVersioning ? 'text-blue-600' : 'text-blue-800'}`}>
                                                Live Capture Versioning
                                            </span>
                                            <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${liveCaptureVersioning ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${liveCaptureVersioning ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                            if (!oneVersionPerDay) {
                                                setOneVersionPerDay(true);
                                                setLiveCaptureVersioning(false);
                                                setWithoutVersioning(false);
                                            }
                                        }}>
                                            <span className={`text-sm font-bold ${oneVersionPerDay ? 'text-blue-600' : 'text-blue-800'}`}>
                                                One version per Day
                                            </span>
                                            <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${oneVersionPerDay ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${oneVersionPerDay ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={() => {
                                                if (!withoutVersioning) {
                                                    setWithoutVersioning(true);
                                                    setLiveCaptureVersioning(false);
                                                    setOneVersionPerDay(false);
                                                }
                                            }}
                                        >
                                            <span
                                                className={`text-sm font-bold ${withoutVersioning ? 'text-blue-600' : 'text-blue-800'
                                                    }`}
                                            >
                                                Without Versioning
                                            </span>

                                            <div
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${withoutVersioning ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <div
                                                    className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${withoutVersioning ? 'translate-x-4' : 'translate-x-0'
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
                                                label="One Time"
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
                                                label="Daily"
                                                checked={daily}
                                                onChange={() => {
                                                    setDaily(true);
                                                    setOneTime(false);
                                                    setWeekly(false);
                                                    setMonthly(false);
                                                }}
                                            />
                                            <RadioToggle
                                                label="Weekly"
                                                checked={weekly}
                                                onChange={() => {
                                                    setWeekly(true);
                                                    setOneTime(false);
                                                    setDaily(false);
                                                    setMonthly(false);
                                                }}
                                            />
                                            <RadioToggle
                                                label="Monthly"
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
                                                label={withoutVersioning ? "With Versioning" : "Without Versioning"}
                                                boldLabel
                                                checked={withoutVersioning}
                                                onChange={() => setWithoutVersioning(prev => !prev)}
                                                disabled={oneTime}
                                            />

                                        </div>

                                        {/* One Time Schedule UI */}
                                        {oneTime && (
                                            <div className="flex items-center gap-4 pl-4">
                                                <label className="text-gray-600 text-sm font-bold">Day</label>
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

                                        {/* Daily Schedule UI */}

                                        {daily && (
                                            <div className="flex gap-6 pl-4">
                                                {/* LEFT: Repeat checkbox */}
                                                <div className="flex items-center">
                                                    <SquareCheckbox
                                                        label="Repeat Task"
                                                        boldLabel
                                                        checked={dailyRepeatTask}
                                                        onChange={() => setDailyRepeatTask(!dailyRepeatTask)}
                                                    />
                                                </div>

                                                {/* RIGHT: Every fields */}
                                                <div className="space-y-4">
                                                    {/* Every Day */}
                                                    <div className="flex items-center gap-4">
                                                        <label className="text-gray-600 text-sm font-bold w-16">Every</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={dailyEveryDays}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                // Allow empty or valid positive numbers
                                                                if (value === '' || /^[0-9]+$/.test(value)) {
                                                                    setDailyEveryDays(value);
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '' || value === '0') {
                                                                    setDailyEveryDays('0');
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                // Prevent minus, plus, 'e', and decimal point
                                                                if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            className="w-32 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                                        />
                                                        <span className="text-gray-600 text-sm font-bold">Day</span>
                                                    </div>

                                                    {/* Every Hour & Minute */}
                                                    <div className="flex items-center gap-4">
                                                        <label className="text-gray-600 text-sm font-bold w-16">Every</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="24"
                                                                value={dailyEveryHours}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '') {
                                                                        setDailyEveryHours('');
                                                                        return;
                                                                    }
                                                                    const num = parseInt(value);
                                                                    if (!isNaN(num) && num >= 0) {
                                                                        setDailyEveryHours(value);
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '') {
                                                                        setDailyEveryHours('0');
                                                                    } else {
                                                                        const num = parseInt(value);
                                                                        if (num > 24) {
                                                                            setDailyEveryHours('24');
                                                                        }
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                className="w-32 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                                            />
                                                            {dailyEveryHours !== '' && parseInt(dailyEveryHours) > 24 && (
                                                                <div className="absolute left-0 -bottom-6 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                    Value must be less than or equal to 24
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-gray-600 text-sm font-bold">Hour</span>

                                                        <div className="relative group">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="59"
                                                                value={dailyEveryMinutes}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '') {
                                                                        setDailyEveryMinutes('');
                                                                        return;
                                                                    }
                                                                    const num = parseInt(value);
                                                                    if (!isNaN(num) && num >= 0) {
                                                                        setDailyEveryMinutes(value);
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '') {
                                                                        setDailyEveryMinutes('0');
                                                                    } else {
                                                                        const num = parseInt(value);
                                                                        if (num > 59) {
                                                                            setDailyEveryMinutes('59');
                                                                        }
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                className="w-32 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                                            />
                                                            {dailyEveryMinutes !== '' && parseInt(dailyEveryMinutes) > 59 && (
                                                                <div className="absolute left-0 -bottom-6 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                    Value must be less than or equal to 59
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-gray-600 text-sm font-bold">Minute</span>
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
                                                    <label className="text-gray-600 text-sm font-bold w-16">Month</label>
                                                    <input
                                                        type="text"
                                                        value={showMonthSelector ? tempSelectedMonths.join(', ') : monthlySelectedMonths.join(', ')}
                                                        readOnly
                                                        className="w-96 border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 cursor-not-allowed"
                                                    />
                                                    <div className="relative">
                                                        <ActionButton
                                                            label="Month"
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
                                                    <label className="text-gray-600 text-sm font-bold w-16 pt-2">Day</label>

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
                                                            label="Day"
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
                                                        <label className="text-gray-600 text-sm font-bold w-16 pt-2">On</label>

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
                                                            className="w-[28rem] border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 cursor-not-allowed"
                                                        />

                                                        {/* Week Button */}
                                                        <div className="relative">
                                                            <ActionButton
                                                                label="Week"
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
                                                            className="w-[28rem] border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 cursor-not-allowed"
                                                        />

                                                        {/* Weekdays Button */}
                                                        <div className="relative">
                                                            <ActionButton
                                                                label="Weekdays"
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
                                                                    // options={[
                                                                    //     'Sunday', 'Monday', 'Tuesday',
                                                                    //     'Wednesday', 'Thursday', 'Friday', 'Saturday'
                                                                    // ]}
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
                            <SectionHeader title="Scheduler Metadata" />
                            <div className="mb-8">
                                <SquareCheckbox
                                    label="Enable Scheduler Metadata"
                                    boldLabel
                                    checked={isSchedulerMetadataEnabled}
                                    onChange={() => setIsSchedulerMetadataEnabled(!isSchedulerMetadataEnabled)}
                                />
                            </div>

                            {isSchedulerMetadataEnabled && (
                                <div className="space-y-8">


                                    <div>
                                        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6 mb-6">
                                            
                                            <UnderlineSelect
                                                label="Template Master"
                                                options={templateOptions}
                                                displayKey="sTemplateName"
                                                valueKey="sTemplateID"
                                                value={selectedTemplate}
                                                onChange={(value) => {
                                                    console.log("Template changed to:", value);
                                                    setSelectedTemplate(value);
                                                    if (isSchedulerMetadataEnabled) {
                                                        loadTagMaster(value);
                                                    }
                                                }}

                                            />
                                            <UnderlineInput label="Sample Filename" />
                                            
                                            <UnderlineSelect
                                                label="Delimiter"
                                                options={delimiterOptions}
                                                displayKey="sDelimiterName"
                                                valueKey="sDelimiterID"
                                                value={selectedDelimiter}
                                                onChange={(value) => setSelectedDelimiter(value)}
                                            />
                                        </div> */}


                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6 mb-6">
                                            <UnderlineSelect
                                                label="Template Master"
                                                options={templateOptions}
                                                displayKey="sTemplateName"
                                                valueKey="sTemplateID"
                                                value={selectedTemplate}
                                                onChange={(value) => {
                                                    setSelectedTemplate(value);
                                                    if (isSchedulerMetadataEnabled) {
                                                        loadTagMaster(value);
                                                    }
                                                }}
                                            />

                                            {/* Sample Filename Input - UPDATED */}
                                            <div className="group w-full relative">
                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                    Sample Filename <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
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
                                                    onBlur={() => {
                                                        // Only validate if Filename radio is selected in any row
                                                        const hasFilenameRadio = tagMasterData.some(tag => tag.sSourceFlag === 'Filename');
                                                        if (hasFilenameRadio) {
                                                            const hasExtension = sampleFilename.includes('.') &&
                                                                sampleFilename.lastIndexOf('.') < sampleFilename.length - 1;
                                                            if (!sampleFilename.trim() || !hasExtension) {
                                                                setSampleFilenameError(true);
                                                            }
                                                        }
                                                    }}
                                                    className={`w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none transition-colors ${sampleFilenameError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'
                                                        }`}
                                                    placeholder="e.g., sample~data.pdf"
                                                />
                                                {sampleFilenameError && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        Please enter a valid filename with extension (e.g., file.pdf)
                                                    </p>
                                                )}
                                            </div>

                                            {/* Delimiter Multi-Select */}
                                            <div className="group w-full relative">
                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                    Delimiter <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={selectedDelimiters.map(d => {
                                                            const delimiterObj = delimiterOptions.find(opt => opt.sDelimiter === d);
                                                            return delimiterObj ? delimiterObj.sDelimiterName : d;
                                                        }).join(', ')}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Add this line
                                                            setTempSelectedDelimiters(selectedDelimiters);
                                                            setShowDelimiterSelector(true);
                                                        }}
                                                        readOnly
                                                        className={`w-full bg-white border-b-2 py-2 pr-8 text-gray-700 text-sm cursor-pointer ${delimiterError ? 'border-red-500' : 'border-gray-200 focus:border-blue-400'
                                                            }`}
                                                        placeholder="Click to select delimiters..."
                                                    />
                                                    <ChevronDown
                                                        size={14}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                    />
                                                </div>

                                                {/* Dropdown - RESTORED */}
                                                {/* {showDelimiterSelector && (
                                                    <div
                                                        className="absolute left-0"
                                                        style={{
                                                            position: 'fixed',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            zIndex: 99999
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    > */}
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
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 w-1/4">TagName</th>
                                                        <th scope="col" className="px-6 py-3 w-1/2">Extract From</th>
                                                        <th scope="col" className="px-6 py-3 w-1/4">Metadata</th>
                                                        <th scope="col" className="px-6 py-3 w-16"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
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
                                                            />
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                                                No tags found for selected template
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                                {/* <tbody>
                                                    {tagMasterData && tagMasterData.length > 0 ? (
                                                        tagMasterData.map((tag, index) => (
                                                            <tr
                                                                key={tag.sTagID}
                                                                className={index % 2 === 0
                                                                    ? "bg-blue-50/30 border-b border-gray-100"
                                                                    : "bg-white border-b border-gray-100"}
                                                            >
                                                                
                                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                                    {tag.sTagName}
                                                                </td>

                                                                
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <RadioButton
                                                                            label="NONE"
                                                                            name={`extract_${tag.sTagID}`}
                                                                            checked={!tag.sSourceFlag || tag.sSourceFlag === 'NONE'}
                                                                        />
                                                                        <RadioButton
                                                                            label="Folder"
                                                                            name={`extract_${tag.sTagID}`}
                                                                            checked={tag.sSourceFlag === 'Folder'}
                                                                        />
                                                                        <RadioButton
                                                                            label="Filename"
                                                                            name={`extract_${tag.sTagID}`}
                                                                            checked={tag.sSourceFlag === 'Filename'}
                                                                        />
                                                                    </div>
                                                                </td>

                                                               
                                                                <td className="px-6 py-4">
                                                                    {tag.sTextData || ''}
                                                                </td>

                                                                
                                                                <td className="px-6 py-4 text-right">
                                                                    <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                                                No tags found for selected template
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody> */}
                                            </table>
                                        </div>
                                    </div>


                                    {/* <div>
                                        <h3 className="text-blue-600 font-bold text-sm mb-4">Rule</h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-6 mb-6">
                                            <UnderlineSelect
                                                label="Rule Name"
                                                placeholder="Select Tag"
                                                options={ruleNameOptions.length > 0 ? ruleNameOptions : []}
                                                displayKey="RuleName"
                                                valueKey="RuleID"
                                                value={selectedRuleName}
                                                onChange={(value) => setSelectedRuleName(value)}
                                            />
                                            <UnderlineInput label="Metadata" />
                                        </div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3">TagName</th>
                                                        <th scope="col" className="px-6 py-3">Relational Operator</th>
                                                        <th scope="col" className="px-6 py-3">Field Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-blue-50/30 border-b border-gray-100">
                                                        <td className="px-6 py-4 font-medium text-gray-900"></td>
                                                        <td className="px-6 py-4">
                                                            <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex justify-end py-4">
                                            <ActionButton
                                                label="Add"
                                                className="bg-[#E6F0FF] text-[#2883FE] text-xs"
                                                onClick={() => {
                                                    // Add logic here
                                                    console.log('Add clicked');
                                                }}
                                            />
                                        </div>
                                    </div> */}

                                    <div className="mb-12">
                                        <h3 className="text-blue-600 font-bold text-sm mb-4">Rule</h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-6 mb-6">
                                            <UnderlineSelect
                                                label="Rule Name"
                                                placeholder="Select Tag"
                                                options={ruleNameOptions}
                                                displayKey="RuleName"
                                                valueKey="RuleID"
                                                value={selectedRuleName}
                                                onChange={(value) => setSelectedRuleName(value)}
                                            />



                                            {/* Metadata Input with error styling */}
                                            {/* <div className="group w-full relative">
                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                    Metadata
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newRuleMetadata}
                                                    onChange={(e) => {
                                                        setNewRuleMetadata(e.target.value);
                                                        setRuleGridError(false);
                                                    }}
                                                    className={`w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none ${ruleGridError && !newRuleMetadata.trim()
                                                        ? 'border-red-500'
                                                        : 'border-gray-200 focus:border-blue-400'
                                                        }`}
                                                    placeholder="Enter metadata"
                                                />
                                            </div> */}
                                            <div className="group w-full relative">
                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                    Metadata <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newRuleMetadata}
                                                    onChange={(e) => {
                                                        setNewRuleMetadata(e.target.value);
                                                        setRuleGridError(false); // Clear error when user types
                                                    }}
                                                    className="w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none border-gray-200 focus:border-blue-400"
                                                    placeholder="Enter metadata"
                                                />
                                            </div>
                                        </div>

                                        {/* Rule Grid Input Table */}
                                        {/* <div className={`border border-gray-200 rounded-lg overflow-hidden mb-4 ${ruleGridError ? 'border-red-500 border-2' : ''}`}> */}
                                        {/* Rule Grid Input Table - ALWAYS show red border if any field is empty */}
                                        <div className={`border rounded-lg overflow-hidden mb-4 transition-colors ${ruleGridError
                                            ? 'border-red-500 border-2'
                                            : 'border-gray-200'
                                            }`}>
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3">TagName</th>
                                                        <th scope="col" className="px-6 py-3">Relational Operator</th>
                                                        <th scope="col" className="px-6 py-3">Field Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-blue-50/30 border-b border-gray-100">
                                                        {/* Tag Name Column */}
                                                        <td className="px-6 py-4 relative">
                                                            <div className="flex items-center justify-between">
                                                                <div className={`text-sm ${newRuleTagName ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                                                                    {newRuleTagName || "Click pencil to select"}
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowTagNameSelector(true);
                                                                        setShowRelOpSelector(false);
                                                                        setRuleGridError(false); // Clear error when clicking pencil
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800 ml-2"
                                                                    title="Select tag name"
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>
                                                            </div>

                                                            {/* Tag Name Selector Dropdown */}
                                                            {showTagNameSelector && (
                                                                <div
                                                                    ref={(el) => {
                                                                        if (el) {
                                                                            const pencilButton = document.querySelector('[title="Select tag name"]');
                                                                            if (pencilButton) {
                                                                                const rect = pencilButton.getBoundingClientRect();

                                                                                // Position the dropdown
                                                                                el.style.position = 'fixed';
                                                                                el.style.left = `${rect.left}px`;
                                                                                el.style.top = `${rect.top - el.offsetHeight - 8}px`;

                                                                                // Adjust if goes off screen
                                                                                if (rect.top - el.offsetHeight - 8 < 0) {
                                                                                    el.style.top = `${rect.bottom + 8}px`;
                                                                                }
                                                                                if (rect.left + el.offsetWidth > window.innerWidth) {
                                                                                    el.style.left = `${window.innerWidth - el.offsetWidth - 16}px`;
                                                                                }
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="fixed z-[99999]"
                                                                >
                                                                    <div className="w-64 bg-white border border-gray-300 rounded-md shadow-lg">
                                                                        {/* Search Input */}
                                                                        <div className="p-2 border-b border-gray-300 bg-gray-50">
                                                                            <div className="flex items-center gap-2">
                                                                                <Search size={14} className="text-gray-400" />
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Looking for"
                                                                                    value={tagNameSearchTerm}
                                                                                    onChange={(e) => setTagNameSearchTerm(e.target.value)}
                                                                                    className="w-full text-sm text-gray-700 placeholder-gray-400 border-none focus:outline-none bg-transparent"
                                                                                    autoFocus
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Options List */}
                                                                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                                            {tagMasterData
                                                                                .filter(tag =>
                                                                                    tag.sTagName.toLowerCase().includes(tagNameSearchTerm.toLowerCase())
                                                                                )
                                                                                .map((tag) => (
                                                                                    <div
                                                                                        key={tag.sTagID}
                                                                                        onClick={() => {
                                                                                            setNewRuleTagName(tag.sTagName);
                                                                                            setShowTagNameSelector(false);
                                                                                            setTagNameSearchTerm('');
                                                                                            setRuleGridError(false); // Clear error when selecting
                                                                                        }}
                                                                                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 ${newRuleTagName === tag.sTagName ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                                                                                            }`}
                                                                                    >
                                                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${newRuleTagName === tag.sTagName
                                                                                                ? 'bg-blue-500 border-blue-500'
                                                                                                : 'bg-white border-gray-300'
                                                                                            }`}>
                                                                                            {newRuleTagName === tag.sTagName && (
                                                                                                <Check size={12} className="text-white" strokeWidth={3} />
                                                                                            )}
                                                                                        </div>
                                                                                        <span className="text-xs font-bold">{tag.sTagName}</span>
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Relational Operator Column */}
                                                        <td className="px-6 py-4 relative">
                                                            <div className="flex items-center justify-between">
                                                                <div className={`text-sm ${newRuleRelationalOp ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                                                                    {newRuleRelationalOp || "Click pencil to select"}
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowRelOpSelector(true);
                                                                        setShowTagNameSelector(false);
                                                                        setRuleGridError(false); // Clear error when clicking pencil
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800 ml-2"
                                                                    title="Select relational operator"
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>
                                                            </div>

                                                            {/* Relational Operator Selector Dropdown */}
                                                            {showRelOpSelector && (
                                                                <div
                                                                    ref={(el) => {
                                                                        if (el) {
                                                                            const pencilButton = document.querySelector('[title="Select relational operator"]');
                                                                            if (pencilButton) {
                                                                                const rect = pencilButton.getBoundingClientRect();

                                                                                // Position above the grid
                                                                                el.style.position = 'fixed';
                                                                                el.style.left = `${rect.left}px`;
                                                                                el.style.top = `${rect.top - el.offsetHeight - 8}px`;

                                                                                // Ensure it doesn't go off screen
                                                                                if (rect.top - el.offsetHeight - 8 < 0) {
                                                                                    el.style.top = `${rect.bottom + 8}px`;
                                                                                }
                                                                                if (rect.left + el.offsetWidth > window.innerWidth) {
                                                                                    el.style.left = `${window.innerWidth - el.offsetWidth - 16}px`;
                                                                                }
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="fixed z-[99999]"
                                                                >
                                                                    <div className="w-64 bg-white border border-gray-300 rounded-md shadow-lg">
                                                                        {/* Search Input */}
                                                                        <div className="p-2 border-b border-gray-300 bg-gray-50">
                                                                            <div className="flex items-center gap-2">
                                                                                <Search size={14} className="text-gray-400" />
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Looking for"
                                                                                    value={relOpSearchTerm}
                                                                                    onChange={(e) => setRelOpSearchTerm(e.target.value)}
                                                                                    className="w-full text-sm text-gray-700 placeholder-gray-400 border-none focus:outline-none bg-transparent"
                                                                                    autoFocus
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Options List */}
                                                                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                                            {relationalOperatorOptions
                                                                                .filter(op =>
                                                                                    op.label.toLowerCase().includes(relOpSearchTerm.toLowerCase())
                                                                                )
                                                                                .map((op) => (
                                                                                    <div
                                                                                        key={op.value}
                                                                                        onClick={() => {
                                                                                            setNewRuleRelationalOp(op.value);
                                                                                            setShowRelOpSelector(false);
                                                                                            setRelOpSearchTerm('');
                                                                                            setRuleGridError(false); // Clear error when selecting
                                                                                        }}
                                                                                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 ${newRuleRelationalOp === op.value ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                                                                                            }`}
                                                                                    >
                                                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${newRuleRelationalOp === op.value
                                                                                                ? 'bg-blue-500 border-blue-500'
                                                                                                : 'bg-white border-gray-300'
                                                                                            }`}>
                                                                                            {newRuleRelationalOp === op.value && (
                                                                                                <Check size={12} className="text-white" strokeWidth={3} />
                                                                                            )}
                                                                                        </div>
                                                                                        <span className="text-xs font-bold">{op.label}</span>
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>


                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                value={newRuleFieldValue}
                                                                onChange={(e) => {
                                                                    setNewRuleFieldValue(e.target.value);
                                                                    setRuleGridError(false); // Clear error when user types
                                                                }}
                                                                className="w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:outline-none border-gray-200 focus:border-blue-400"
                                                                placeholder="Enter field value"
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Add Button */}
                                        <div className="flex justify-end py-4">
                                            <ActionButton
                                                label="Add"
                                                className="bg-[#E6F0FF] text-[#2883FE] text-xs"
                                                onClick={handleAddRule}
                                            />
                                        </div>
                                    </div>

                                    {/* <div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-white border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Rule Name <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Metadata <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                TagName <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Relational Operator <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Field Value <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-white">
                                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                            No data to display
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex justify-end">
                                            <ActionButton
                                                label="Remove"
                                                className="bg-[#E6F0FF] text-[#2883FE] text-xs"
                                                onClick={() => {
                                                    // Add logic here
                                                    console.log('Remove clicked');
                                                }}
                                            />
                                        </div>
                                    </div> */}

                                    <div>
                                        {/* <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-white border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Rule Name <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Metadata <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                TagName <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Relational Operator <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Field Value <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ruleGridData.length === 0 ? (
                                                        <tr className="bg-white">
                                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                                No data to display
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        ruleGridData.map((rule) => (
                                                            <tr key={rule.id} className="bg-white border-b border-gray-100">
                                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                                    {ruleNameOptions.find(r => r.RuleID === rule.ruleName)?.RuleName || rule.ruleName}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">{rule.metadata}</td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">{rule.tagName}</td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">{rule.relationalOp}</td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">{rule.fieldValue}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div> */}

                                        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-white border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 w-16">
                                                            Select
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Rule Name <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Metadata <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                TagName <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Relational Operator <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Field Value <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ruleGridData.length === 0 ? (
                                                        <tr className="bg-white">
                                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                                No data to display
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        ruleGridData.map((rule) => (
                                                            <tr
                                                                key={rule.id}
                                                                className={`bg-white border-b border-gray-100 cursor-pointer ${selectedRowId === rule.id ? 'bg-blue-50' : ''
                                                                    }`}
                                                                onClick={() => setSelectedRowId(rule.id)}
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center justify-center">
                                                                        <div
                                                                            className={`w-5 h-5 border rounded-full flex items-center justify-center ${selectedRowId === rule.id
                                                                                ? 'border-blue-500 bg-blue-500'
                                                                                : 'border-gray-300'
                                                                                }`}
                                                                        >
                                                                            {selectedRowId === rule.id && (
                                                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                                    {ruleNameOptions.find(r => r.RuleID === rule.ruleName)?.RuleName || rule.ruleName}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">{rule.metadata}</td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">{rule.tagName}</td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">{rule.relationalOp}</td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">{rule.fieldValue}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Remove Button */}
                                        {/* <div className="flex justify-end">
                                            <ActionButton
                                                label="Remove"
                                                className="bg-[#E6F0FF] text-[#2883FE] text-xs"
                                                onClick={() => {
                                                    // Implement remove functionality - remove last or selected
                                                    if (ruleGridData.length > 0) {
                                                        setRuleGridData(prev => prev.slice(0, -1));
                                                    }
                                                }}
                                            />
                                        </div> */}
                                        <div className="flex justify-end">
                                            <ActionButton
                                                label="Remove"
                                                className="bg-[#E6F0FF] text-[#2883FE] text-xs"
                                                onClick={handleRemoveRule}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div >
            {/* <Popup
                isOpen={isCheckPathModalOpen}
                onClose={() => setIsCheckPathModalOpen(false)} */}
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
                            <label className="block text-gray-600 text-sm font-bold mb-3">Source Path</label>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Client</span>
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
                                    <span className="text-sm font-medium text-gray-700">Server</span>
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
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Client Name
                            </label>
                            <input
                                type="text"
                                value={clientOptions.find(c => c.L06ClientID === selectedClient)?.L06ClientName || ''}
                                disabled
                                className="w-full bg-gray-50 border-b-2 border-gray-300 px-2 py-2 text-sm text-gray-600 focus:outline-none cursor-not-allowed"
                            />
                        </div>

                        {/* <div>
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Client User Name
                                {checkPathType === 'client' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type="text"
                                value={clientUsername}
                                onChange={(e) => {
                                    setClientUsername(e.target.value);
                                    setUsernameError(false);
                                }}
                                disabled={checkPathType === 'server'}
                                className={`w-full bg-transparent border-b-2 px-2 py-2 text-sm focus:outline-none transition-colors ${checkPathType === 'server'
                                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                    : usernameError
                                        ? 'border-red-500'
                                        : 'border-gray-300 focus:border-blue-400'
                                    }`}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Client Password
                                {checkPathType === 'client' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type="password"
                                value={clientPassword}
                                onChange={(e) => {
                                    setClientPassword(e.target.value);
                                    setPasswordError(false);
                                }}
                                disabled={checkPathType === 'server'}
                                className={`w-full bg-transparent border-b-2 px-2 py-2 text-sm focus:outline-none transition-colors ${checkPathType === 'server'
                                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                    : passwordError
                                        ? 'border-red-500'
                                        : 'border-gray-300 focus:border-blue-400'
                                    }`}
                            />


                        </div> */}


                        <div>
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Client User Name
                                {checkPathType === 'client' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type="text"
                                value={clientUsername}
                                onChange={(e) => {
                                    setClientUsername(e.target.value);
                                    setUsernameError(false);
                                    setClientPathErrorMessage('');
                                    setUncPathErrorMessage('');
                                }}
                                disabled={checkPathType === 'server'}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                className={`w-full bg-transparent border-b-2 px-2 py-2 text-sm focus:outline-none transition-colors ${checkPathType === 'server'
                                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                    : usernameError
                                        ? 'border-red-500'
                                        : 'border-gray-300 focus:border-blue-400'
                                    }`}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Client Password
                                {checkPathType === 'client' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type="password"
                                value={clientPassword}
                                onChange={(e) => {
                                    setClientPassword(e.target.value);
                                    setPasswordError(false);
                                    setClientPathErrorMessage('');
                                    setUncPathErrorMessage('');
                                }}
                                disabled={checkPathType === 'server'}
                                autoComplete="new-password"
                                className={`w-full bg-transparent border-b-2 px-2 py-2 text-sm focus:outline-none transition-colors ${checkPathType === 'server'
                                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                    : passwordError
                                        ? 'border-red-500'
                                        : 'border-gray-300 focus:border-blue-400'
                                    }`}
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

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                            <button
                                onClick={submitCheckPath}
                                className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Check size={16} /> Submit
                            </button>
                            <button
                                onClick={() => setIsCheckPathModalOpen(false)}
                                className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Close
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
        </div >
    );
};

// Reusable Components
const SectionHeader = ({ title }) => (
    <div className="mb-6 border-b border-gray-100 pb-2">
        <h2 className="text-lg font-semibold text-blue-600">{title}</h2>
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

const UnderlineSelect = ({
    label,
    required,
    placeholder,
    options = [],
    value,
    onChange,
    displayKey = 'name',
    valueKey = 'id',
    disabled = false
}) => (
    <div className="relative group w-full">
        <label className="block text-gray-600 text-sm font-bold mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <select
                value={value || ""}
                onChange={(e) => onChange && onChange(e.target.value)}
                disabled={disabled}
                className={`w-full bg-transparent border-b-2 border-gray-200 py-2 pr-8 text-gray-700 text-sm focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                    }`}
            >
                <option value="" disabled hidden></option>
                {options.map((option, index) => (
                    <option key={index} value={option[valueKey]}>
                        {option[displayKey]}
                    </option>
                ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} className="text-blue-500 fill-current" />
            </div>
        </div>
    </div>
);

const UnderlineInput = ({ label, required, placeholder, defaultValue, type = "text", disabled = false, value, onChange }) => (
    <div className="group w-full relative">
        <label className="block text-gray-700 text-sm font-bold mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            disabled={disabled}
            className={`w-full bg-transparent border-b-2 py-2 text-gray-700 text-sm focus:border-blue-400 focus:outline-none transition-colors ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                }`}
        />
    </div>
);

const ToggleSwitch = ({ checked }) => (
    <div className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
);

// const SquareCheckbox = ({ label, boldLabel, checked, onChange }) => (
//     <div className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
//         <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${checked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
//             {checked && <Check size={14} className="text-white" strokeWidth={3} />}
//         </div>
//         {label && <span className={`text-sm text-blue-800 ${boldLabel ? 'font-bold' : 'font-medium'}`}>{label}</span>}
//     </div>
// );

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
        {label && <span className={`text-sm text-blue-800 ${boldLabel ? 'font-bold' : 'font-medium'}`}>{label}</span>}
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
        <span className={`text-sm font-bold ${checked ? 'text-blue-600' : 'text-blue-800'}`}>
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


// const TimePicker = ({ value, onChange, disabled = false }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [hours, setHours] = useState('00');
//     const [minutes, setMinutes] = useState('00');
//     const [seconds, setSeconds] = useState('00');
//     const [inputValue, setInputValue] = useState(value || '00:00:00');
//     const dropdownRef = useRef(null);

//     useEffect(() => {
//         if (value) {
//             setInputValue(value);
//             const parts = value.split(':');
//             if (parts.length === 3) {
//                 setHours(parts[0]);
//                 setMinutes(parts[1]);
//                 setSeconds(parts[2]);
//             }
//         }
//     }, [value]);


//     useEffect(() => {
//         if (isOpen) {
//             // Small delay to ensure DOM is rendered
//             setTimeout(() => {
//                 const hourElement = document.querySelector(`[data-hour="${hours}"]`);
//                 const minuteElement = document.querySelector(`[data-minute="${minutes}"]`);
//                 const secondElement = document.querySelector(`[data-second="${seconds}"]`);

//                 if (hourElement) {
//                     hourElement.scrollIntoView({ block: 'center', behavior: 'auto' });
//                 }
//                 if (minuteElement) {
//                     minuteElement.scrollIntoView({ block: 'center', behavior: 'auto' });
//                 }
//                 if (secondElement) {
//                     secondElement.scrollIntoView({ block: 'center', behavior: 'auto' });
//                 }
//             }, 50);
//         }
//     }, [isOpen, hours, minutes, seconds]);

//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//                 setIsOpen(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const validateTimeInput = (value, max) => {
//         const num = parseInt(value);
//         if (isNaN(num) || num < 0) return '00';
//         if (num > max) return max.toString().padStart(2, '0');
//         return num.toString().padStart(2, '0');
//     };

//     const validateAndFormatTime = (timeString) => {
//         const parts = timeString.split(':');
//         if (parts.length !== 3) return value || '00:00:00';

//         let h = parseInt(parts[0]) || 0;
//         let m = parseInt(parts[1]) || 0;
//         let s = parseInt(parts[2]) || 0;

//         // Validate hours (0-23)
//         if (h < 0) h = 0;
//         if (h > 23) h = 23;

//         // Validate minutes (0-59)
//         if (m < 0) m = 0;
//         if (m > 59) m = 59;

//         // Validate seconds (0-59)
//         if (s < 0) s = 0;
//         if (s > 59) s = 59;

//         return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
//     };

//     const handleInputChange = (e) => {
//         const newValue = e.target.value;
//         setInputValue(newValue);
//     };

//     const handleInputBlur = () => {
//         const formatted = validateAndFormatDate(inputValue);
//         const parts = formatted.split('/');
//         const formattedDate = new Date(parts[2], parts[1] - 1, parts[0]);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // Check if date is allowed based on allowPast/allowFuture
//         if (!allowFuture && formattedDate > today) {
//             // For past-only dates (Files older than) - set to yesterday
//             const yesterday = new Date();
//             yesterday.setDate(yesterday.getDate() - 1);
//             const yesterdayFormatted = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
//             setInputValue(yesterdayFormatted);
//             if (onChange) {
//                 onChange(yesterdayFormatted);
//             }
//         } else if (!allowPast && formattedDate < today) {
//             // For future-only dates (Trigger, Expiry, One Time)
//             // Keep the typed date and let parent component handle the error
//             setInputValue(formatted);
//             if (onChange) {
//                 onChange(formatted);
//             }
//         } else {
//             setInputValue(formatted);
//             if (onChange) {
//                 onChange(formatted);
//             }
//         }
//     };

//     const handleTimeChange = (newHours, newMinutes, newSeconds) => {
//         const validHours = validateTimeInput(newHours, 23);
//         const validMinutes = validateTimeInput(newMinutes, 59);
//         const validSeconds = validateTimeInput(newSeconds, 59);

//         setHours(validHours);
//         setMinutes(validMinutes);
//         setSeconds(validSeconds);

//         const timeString = `${validHours}:${validMinutes}:${validSeconds}`;
//         setInputValue(timeString);

//         if (onChange) {
//             onChange(timeString);
//         }
//     };

//     const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
//     const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
//     const secondOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

//     return (
//         <div className="relative" ref={dropdownRef}>
//             <div className={`relative w-32 ${disabled ? 'cursor-not-allowed' : ''}`}>
//                 <input
//                     type="text"
//                     value={inputValue}
//                     onChange={handleInputChange}
//                     onBlur={handleInputBlur}
//                     onFocus={() => !disabled && setIsOpen(true)}
//                     disabled={disabled}
//                     placeholder="HH:MM:SS"
//                     className={`w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-blue-400 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
//                         }`}
//                 />
//                 <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//             </div>

//             {isOpen && !disabled && (
//                 <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3">
//                     <div className="flex gap-2">
//                         {/* Hours */}
//                         <div className="flex flex-col">
//                             <label className="text-xs text-gray-600 mb-1 text-center font-semibold">Hours</label>
//                             <div className="h-32 w-16 overflow-y-auto border border-gray-200 rounded custom-scrollbar">
//                                 {hourOptions.map((hour) => (
//                                     <div
//                                         key={hour}
//                                         data-hour={hour}
//                                         onClick={() => {
//                                             setHours(hour);
//                                             handleTimeChange(hour, minutes, seconds);
//                                         }}
//                                         className={`px-3 py-1 text-sm text-center cursor-pointer hover:bg-blue-50 ${hours === hour ? 'bg-blue-100 font-semibold text-blue-600' : ''
//                                             }`}
//                                     >
//                                         {hour}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="flex items-center justify-center text-xl font-bold text-gray-400 pt-6">:</div>

//                         {/* Minutes */}
//                         <div className="flex flex-col">
//                             <label className="text-xs text-gray-600 mb-1 text-center font-semibold">Minutes</label>
//                             <div className="h-32 w-16 overflow-y-auto border border-gray-200 rounded custom-scrollbar">
//                                 {minuteOptions.map((minute) => (
//                                     <div
//                                         key={minute}
//                                         data-minute={minute}
//                                         onClick={() => {
//                                             setMinutes(minute);
//                                             handleTimeChange(hours, minute, seconds);
//                                         }}
//                                         className={`px-3 py-1 text-sm text-center cursor-pointer hover:bg-blue-50 ${minutes === minute ? 'bg-blue-100 font-semibold text-blue-600' : ''
//                                             }`}
//                                     >
//                                         {minute}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="flex items-center justify-center text-xl font-bold text-gray-400 pt-6">:</div>

//                         {/* Seconds */}
//                         <div className="flex flex-col">
//                             <label className="text-xs text-gray-600 mb-1 text-center font-semibold">Seconds</label>
//                             <div className="h-32 w-16 overflow-y-auto border border-gray-200 rounded custom-scrollbar">
//                                 {secondOptions.map((second) => (
//                                     <div
//                                         key={second}
//                                         data-second={second}
//                                         onClick={() => {
//                                             setSeconds(second);
//                                             handleTimeChange(hours, minutes, second);
//                                         }}
//                                         className={`px-3 py-1 text-sm text-center cursor-pointer hover:bg-blue-50 ${seconds === second ? 'bg-blue-100 font-semibold text-blue-600' : ''
//                                             }`}
//                                     >
//                                         {second}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                     <div className="mt-2 flex justify-end">
//                         <button
//                             onClick={() => setIsOpen(false)}
//                             className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
//                         >
//                             Done
//                         </button>
//                     </div>
//                 </div>
//             )}

//             <style jsx>{`
//                 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//                 .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
//                 .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
//                 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
//             `}</style>
//         </div>
//     );
// };


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
        // REMOVE THE DATE VALIDATION LOGIC FROM TIME PICKER
        // Just validate and format the time
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
                            <label className="text-xs text-gray-600 mb-1 text-center font-semibold">Hours</label>
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
                            <label className="text-xs text-gray-600 mb-1 text-center font-semibold">Minutes</label>
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
                            <label className="text-xs text-gray-600 mb-1 text-center font-semibold">Seconds</label>
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
                            Done
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

// const DatePickerInput = ({ value, onChange, disabled = false, allowPast = true, allowFuture = true, validateAndFormatDate }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [selectedDate, setSelectedDate] = useState(new Date());
//     const [inputValue, setInputValue] = useState(value || '');
//     const dropdownRef = useRef(null);

//     useEffect(() => {
//         if (value) {
//             setInputValue(value);
//             const parts = value.split('/');
//             if (parts.length === 3) {
//                 const date = new Date(parts[2], parts[1] - 1, parts[0]);
//                 setSelectedDate(date);
//             }
//         }
//     }, [value]);

//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//                 setIsOpen(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const handleInputChange = (e) => {
//         const newValue = e.target.value;
//         setInputValue(newValue);
//     };

//     const handleInputBlur = () => {
//         const formatted = validateAndFormatDate(inputValue);
//         const parts = formatted.split('/');
//         const formattedDate = new Date(parts[2], parts[1] - 1, parts[0]);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // Check if date is allowed based on allowPast/allowFuture
//         if (!allowFuture && formattedDate > today) {
//             // For past-only dates (Files older than)
//             const current = new Date();
//             const currentFormatted = `${current.getDate().toString().padStart(2, '0')}/${(current.getMonth() + 1).toString().padStart(2, '0')}/${current.getFullYear()}`;
//             setInputValue(currentFormatted);
//             if (onChange) {
//                 onChange(currentFormatted);
//             }
//         } else if (!allowPast && formattedDate < today) {
//             // For future-only dates (Trigger, Expiry, One Time)
//             // Keep the typed date and let parent component handle the error
//             setInputValue(formatted);
//             if (onChange) {
//                 onChange(formatted);
//             }
//         } else {
//             setInputValue(formatted);
//             if (onChange) {
//                 onChange(formatted);
//             }
//         }
//     };

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

    // useEffect(() => {
    //     if (value) {
    //         setInputValue(value);
    //         const parts = value.split('/');
    //         if (parts.length === 3) {
    //             const date = new Date(parts[2], parts[1] - 1, parts[0]);
    //             setSelectedDate(date);
    //         }
    //     }
    // }, [value]);

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

    // Add this useEffect instead
    // useEffect(() => {
    //     // Only update if not focused (user isn't typing)
    //     if (!isFocused) {
    //         setInputValue(value || '');
    //     }
    // }, [value, isFocused]);

    // Add this NEW useEffect to handle immediate sync after onChange
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

    // const handleInputChange = (e) => {
    //     const newValue = e.target.value;
    //     setInputValue(newValue);
    // };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
    };

    // const handleInputBlur = () => {
    //     console.log("=== handleInputBlur called ===");
    //     console.log("Input value:", inputValue);

    //     const formatted = validateAndFormatDate(inputValue);
    //     console.log("Formatted value:", formatted);

    //     // ALWAYS call onChange - let parent handle validation
    //     if (onChange) {
    //         console.log("Calling onChange with:", formatted);
    //         onChange(formatted);
    //     }

    //     setIsFocused(false);
    // };

    // const handleInputBlur = () => {
    //     console.log("=== handleInputBlur called ===");
    //     console.log("Input value:", inputValue);

    //     setIsFocused(false); // SET focused to false on blur

    //     const formatted = validateAndFormatDate(inputValue);
    //     console.log("Formatted value:", formatted);

    //     // ALWAYS call onChange - let parent handle validation
    //     if (onChange) {
    //         console.log("Calling onChange with:", formatted);
    //         onChange(formatted);
    //     }

    //     // Force sync with parent value after a short delay
    //     // This ensures the corrected value from parent shows in the input
    //     setTimeout(() => {
    //         console.log("Force syncing to parent value:", value);
    //         if (value) {
    //             setInputValue(value);
    //         }
    //     }, 10);
    // };

    // const handleInputBlur = () => {
    //     console.log("=== handleInputBlur called ===");
    //     console.log("Input value:", inputValue);

    //     setIsFocused(false);

    //     const formatted = validateAndFormatDate(inputValue);
    //     console.log("Formatted value:", formatted);

    //     // Call onChange immediately - parent will handle validation and corrections
    //     if (onChange) {
    //         console.log("Calling onChange with:", formatted);
    //         onChange(formatted);
    //     }

    //     // REMOVED: The setTimeout that was forcing sync
    //     // This was causing the input to show current date after correction
    // };

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

        // DON'T set inputValue here - let it sync from parent via useEffect
        // This allows parent to correct invalid dates
    };
    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };



    // const handleDateClick = (day) => {
    //     const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);

    //     // Check if date is allowed
    //     if (!allowFuture && newDate > today) {
    //         // For past-only dates (Files older than) - set to yesterday
    //         const yesterday = new Date();
    //         yesterday.setDate(yesterday.getDate() - 1);
    //         yesterday.setHours(0, 0, 0, 0);

    //         const formattedDate = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;

    //         setSelectedDate(yesterday);
    //         setInputValue(formattedDate);
    //         if (onChange) {
    //             onChange(formattedDate);
    //         }
    //         setIsOpen(false);
    //         return;
    //     }

    //     if (!allowPast && newDate < today) {
    //         // For future-only fields (Trigger, Expiry) - set to yesterday
    //         const yesterday = new Date();
    //         yesterday.setDate(yesterday.getDate() - 1);
    //         yesterday.setHours(0, 0, 0, 0);

    //         const formattedDate = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;

    //         setSelectedDate(yesterday);
    //         setInputValue(formattedDate);
    //         if (onChange) {
    //             onChange(formattedDate);  // This will trigger your handler!
    //         }
    //         setIsOpen(false);
    //         return;
    //     }

    //     const formattedDate = `${day.toString().padStart(2, '0')}/${(newDate.getMonth() + 1).toString().padStart(2, '0')}/${newDate.getFullYear()}`;

    //     setSelectedDate(newDate);
    //     setInputValue(formattedDate);
    //     if (onChange) {
    //         onChange(formattedDate);
    //     }
    //     setIsOpen(false);
    // };


    const handleDateClick = (day) => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
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

    // const renderCalendar = () => {
    //     const days = [];
    //     const totalDays = daysInMonth(selectedDate);
    //     const firstDay = firstDayOfMonth(selectedDate);
    //     const currentDay = inputValue ? parseInt(inputValue.split('/')[0]) : null;
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);

    //     // Empty cells before first day
    //     for (let i = 0; i < firstDay; i++) {
    //         days.push(<div key={`empty-${i}`} className="p-2"></div>);
    //     }

    //     // Days of month
    //     for (let day = 1; day <= totalDays; day++) {
    //         const dayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    //         const isSelected = day === currentDay;
    //         const isPast = dayDate < today;
    //         const isFuture = dayDate > today;
    //         const isToday = dayDate.getTime() === today.getTime();

    //         const isDisabled = (!allowPast && isPast) || (!allowFuture && isFuture);

    //         days.push(
    //             <div
    //                 key={day}
    //                 onClick={() => !isDisabled && handleDateClick(day)}
    //                 className={`p-2 text-center text-sm rounded transition-colors ${isDisabled
    //                     ? 'text-gray-300 opacity-40 cursor-not-allowed'
    //                     : 'cursor-pointer hover:bg-blue-50'
    //                     } ${isSelected
    //                         ? 'bg-blue-500 text-white font-bold'
    //                         : isToday && !isDisabled
    //                             ? 'bg-blue-100 text-blue-600 font-bold'
    //                             : !isDisabled
    //                                 ? 'text-gray-900 font-bold'
    //                                 : 'text-gray-300'
    //                     }`}
    //             >
    //                 {day}
    //             </div>
    //         );
    //     }

    //     return days;
    // };

    const renderCalendar = () => {
        const days = [];
        const totalDays = daysInMonth(selectedDate);
        const firstDay = firstDayOfMonth(selectedDate);
        const currentDay = inputValue ? parseInt(inputValue.split('/')[0]) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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
                ? "bg-[#E6F0FF] text-[#2883FE] pointer-events-none"
                : "bg-[#E6F0FF] text-[#2883FE] hover:bg-[#d0e3ff]"
            }
            ${className}
        `}
    >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{label}</span>
    </button>
);

export default SearchServerData;
