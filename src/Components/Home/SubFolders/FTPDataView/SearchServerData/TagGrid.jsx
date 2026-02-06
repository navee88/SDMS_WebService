import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Errordialog from "../../../../Layout/Common/Errordialog";

// Temporary icon components - replace with your actual icon imports
const InlineEditIcon = () => (
  <i className="fa fa-pencil-square-o text-xl mr-1"></i>
);
 
const EditPencilIcon = () => (
  <i className="fa fa-pencil text-xl mr-0.5"></i>
);

const TagGrid = React.memo(({ 
  tags, 
  onTagValueClick, 
  isLoadingTags, 
  isLocked, 
  lockedByOtherUser, 
  isAutoLocked, 
  onTagEditRequest, 
  onInlineEditSubmit, 
  t, 
  tagErrors,
  columns = [
    { key: 'tagName', label: 'Tag Name', width: '50%' },
    { key: 'value', label: 'Value', width: '50%' }
  ]
}) => {
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

  // Calculate column widths for grid
  const gridTemplateColumns = columns.map(col => col.width || '1fr').join(' ');
 
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
        {/* Header with dynamic columns */}
        <div 
          className="bg-[#fbfbfb] border-b border-[#f3f3f3]"
          style={{ 
            display: 'grid',
            gridTemplateColumns: gridTemplateColumns
          }}
        >
          {columns.map((column, index) => (
            <div 
              key={column.key}
              className="px-4 py-2.5 text-xs text-[#4b4b4b] font-bold font-roboto"
              style={{ 
                paddingLeft: index === 0 ? '1rem' : '0.25rem',
                paddingRight: index === columns.length - 1 ? '1rem' : '0.25rem'
              }}
            >
              {column.label}
            </div>
          ))}
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
                  className={`border-b border-[#e7e6e6] last:border-b-1 min-h-[40px]
                    ${isSelected ? 'bg-[#eef2f9] border-l-4 border-l-[#378cfc]' : 'bg-white border-l-4 border-l-transparent'}
                    ${hasError ? 'border-b-2 border-b-red-400' : ''}
                    ${tag.editable && !shouldDisableEdit ? 'cursor-pointer hover:bg-[#eef2f9]' : 'cursor-default'}`}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: gridTemplateColumns
                  }}
                  onClick={() => setSelectedTagIndex(idx)}
                >
                  {columns.map((column, colIndex) => {
                    // First column is always tagName
                    if (column.key === 'tagName') {
                      return (
                        <div 
                          key={`${idx}-${column.key}`}
                          className={`px-4 text-xs flex items-center font-['verdana']
                            ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}`}
                          style={{ 
                            paddingLeft: colIndex === 0 ? '1rem' : '0.25rem',
                            paddingRight: colIndex === columns.length - 1 ? '1rem' : '0.25rem'
                          }}
                        >
                          {tag.tagName}
                          {tag.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                      );
                    }
                    
                    // Value column with edit functionality
                    if (column.key === 'value') {
                      return (
                        <div 
                          key={`${idx}-${column.key}`}
                          className="px-0.5 py-0 text-xs flex items-center justify-between gap-0"
                          style={{ 
                            paddingLeft: colIndex === 0 ? '1rem' : '0.25rem',
                            paddingRight: colIndex === columns.length - 1 ? '1rem' : '0.25rem'
                          }}
                        >
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
                      );
                    }
                    
                    // For any additional custom columns
                    return (
                      <div 
                        key={`${idx}-${column.key}`}
                        className={`px-4 text-xs flex items-center font-['verdana']
                          ${isSelected ? 'font-bold text-[#373737]' : 'text-[#373737]'}`}
                        style={{ 
                          paddingLeft: colIndex === 0 ? '1rem' : '0.25rem',
                          paddingRight: colIndex === columns.length - 1 ? '1rem' : '0.25rem'
                        }}
                      >
                        {tag[column.key] || ''}
                      </div>
                    );
                  })}
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
              Submit
            </button>
            <button
              onClick={handleTooltipClose}
              className="px-3 py-1.5 bg-white border border-gray-300 text-[#405F7D] text-xs font-semibold rounded hover:bg-gray-50 transition-colors font-roboto flex items-center gap-1"
            >
              <i className="fa fa-times mr-1"></i>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
});
 
TagGrid.displayName = 'TagGrid';

export default TagGrid;