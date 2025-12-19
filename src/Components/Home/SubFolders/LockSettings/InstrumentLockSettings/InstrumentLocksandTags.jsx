import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Lock, Unlock, ChevronDown, X, Edit, CheckSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Mock components for demonstration (replace with actual imports)
const AnimatedDropdown = ({ label, value, options, onChange, disabled, required, error, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`mb-7 ${className}`} ref={dropdownRef}>
      <label className="block text-[13px] text-[#4A6FA5] mb-0 font-semibold font-roboto">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full h-7 px-0 text-xs text-left bg-transparent border-0 border-b-2 flex items-center justify-between outline-none
            ${error ? 'border-red-400' : 'border-gray-300'}
            ${disabled ? 'cursor-not-allowed text-gray-400' : 'hover:border-gray-400 text-[#4b4b4b] font-semibold'}
          `}
          style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
        >
          <span className={`${selectedOption ? 'font-semibold ' : ''}`} style={{ fontFamily: 'Verdana, Arial, sans-serif' }}>
            {selectedOption?.label || ''}
          </span>
          <ChevronDown className={`w-4 h-4 text-[#3f3f3f] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-xs cursor-pointer ${value === option.value ? 'bg-[#fff] text-[#4b4b4b] font-medium' : 'hover:bg-gray-50 text-[#505050]'}`}
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AnimatedInput = ({ label, value, onChange, disabled, required, error, className = '' }) => (
  <div className={`mb-7 ${className}`}>
    <label className="block text-[#4A6FA5] mb-1 font-semibold text-[13px] font-roboto">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full h-7 px-0 text-xs bg-transparent border-0 border-b-2 outline-none
        ${error ? 'border-red-400' : 'border-gray-300'}
        ${disabled ? 'cursor-not-allowed text-gray-400' : 'hover:border-gray-400 focus:border-blue-500 text-[#4b4b4b]'}
      `}
      style={{ fontFamily: 'Verdana, Arial, sans-serif', fontWeight: 600 }}
    />
  </div>
);

// Merge File Count Row Component
const MergeFileCountRow = ({ mergeCount, currentCount, onMergeChange, disabled, showMergeFields, t }) => {
  if (!showMergeFields) return null;
  
  return (
    <div className="mb-6 mt-7">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#4A6FA5] min-w-[120px] font-semibold font-roboto">
            {t('instrumentlocktag.mergefilecount')}
          </label>
          <input
            type="number"
            value={mergeCount}
            onChange={(e) => onMergeChange(e.target.value)}
            disabled={disabled}
            min="0"
            max="10000"
            className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-white hover:border-gray-400 text-[#4A6FA5]"
            style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#4A6FA5] min-w-[150px] font-semibold font-roboto">
            {t('instrumentlocktag.currentuploadfilecount')}
          </label>
          <input
            type="number"
            value={currentCount}
            disabled={true}
            min="0"
            className="w-16 h-7 px-2 text-xs text-center border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-[#4A6FA5]"
            style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
          />
        </div>
      </div>
    </div>
  );
};

// Inline Checkbox
const InlineCheckbox = ({ label, checked, onChange, disabled }) => (
  <div className="flex items-center mb-3 gap-4">
    <label className="text-xs text-[#4A6FA5] min-w-[120px] font-semibold font-roboto">
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

// Tag Grid Component with Tooltip Popup
const TagGrid = ({ tags, onTagValueClick, isLocked, t }) => {
  const [tooltipState, setTooltipState] = useState({
    isOpen: false,
    tagIndex: null,
    position: { top: 0, left: 0 },
    searchTerm: '',
    selectedValue: '',
    options: []
  });

  const handleEditClick = (tag, index, event) => {
    if (!isLocked && tag.editable) {
      const rect = event.currentTarget.getBoundingClientRect();
      
      const options = tag.options && tag.options.length > 0 ? tag.options : [
        { value: 'Pantoprazole tablets IP', label: 'Pantoprazole tablets IP' },
        { value: 'Caffeine Oral Citrate', label: 'Caffeine Oral Citrate' },
        { value: 'Assay by HPLC', label: 'Assay by HPLC' },
        { value: 'Dissolution', label: 'Dissolution' }
      ];

      setTooltipState({
        isOpen: true,
        tagIndex: index,
        position: {
          top: rect.top - 200,
          left: rect.left - 255
        },
        searchTerm: '',
        selectedValue: tag.value || '',
        options: options
      });
    }
  };

  const handleTooltipSubmit = () => {
    if (tooltipState.tagIndex !== null && tooltipState.selectedValue) {
      onTagValueClick(tooltipState.tagIndex, tooltipState.selectedValue);
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
      <div className="border border-gray-300 rounded relative">
        <div className="grid grid-cols-2 bg-[#f7fafc] border-b border-gray-300">
          <div className="px-4 py-2.5 text-[13px] text-[#4b4b4b]  font-semibold font-verdana">
            {t('instrumentlocktag.tagName')}
          </div>
          <div className="px-4 py-2.5 text-[13px] text-[#4b4b4b] font-semibold font-verdana">
            {t('instrumentlocktag.tagValue')}
          </div>
        </div>
        
        <div className="bg-white min-h-[250px]">
          {tags.length === 0 ? (
            <div className="px-4 py-12 text-center text-[12px] text-[#4b4b4b] font-verdana">            
            {t('instrumentlocktag.noTagValue')}
</div>
          ) : (
            tags.map((tag, idx) => (
              <div 
                key={idx} 
                className={`grid grid-cols-2 border-b border-gray-200 last:border-b ${
                  tooltipState.isOpen && tooltipState.tagIndex === idx ? 'bg-blue-50' : 
                  !tag.value ? 'bg-[#fff]' : 'hover:bg-gray-50'
                }`}
              >
                <div className="px-4 py-15 text-[11px] font-semibold text-[#4b4b4b]  flex items-center" style={{ fontFamily: 'Verdana, Arial, sans-serif' }}>
                  {tag.tagName}
                  {tag.required && <span className="text-red-500 ml-1">*</span>}
                </div>
                <div className="px-4 py-3 text-[13px] font-semibold text-[#4b4b4b] flex items-center justify-between gap-2" style={{ fontFamily: 'Verdana, Arial, sans-serif' }}>
                  <span className="flex-1">{tag.value || ''}</span>
                  {tag.editable && !isLocked && (
                    <button
                      onClick={(e) => handleEditClick(tag, idx, e)}
                      className="ml-2 text-[#367eb9] font-semibold hover:text-[#3182ce]"
                      title="Edit tag value"
                    >
                      <Edit className="w-[18px] h-[18px]" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {tooltipState.isOpen && (
        <div 
          className="fixed z-[100] bg-white border border-gray-300 rounded shadow-xl w-[250px] h-[220px]"
          style={{
            top: `${Math.max(20, tooltipState.position.top)}px`,
            left: `${Math.max(20, tooltipState.position.left)}px`
          }}
        >
          <div className="p-1 ">
           
            <div className="mb-1">
              <input
                type="text"
                placeholder="Looking for"
                value={tooltipState.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-8 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-[#4A6FA5]"
                autoFocus
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto rounded mb-3">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500 font-roboto">No options available</div>
              ) : (
                filteredOptions.map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOptionClick(option.value)}
                    onDoubleClick={handleTooltipSubmit}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0 ${
                      tooltipState.selectedValue === option.value ? 'bg-[#cfcfcf] text-[#000] font-semibold' : 'text-[#000000]'
                    }`}
                    style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end gap-1">
              <button
                onClick={handleTooltipSubmit}
                disabled={!tooltipState.selectedValue}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-semibold flex items-center gap-1 font-roboto"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                {t('button.submit')}
              </button>
              <button
                onClick={handleTooltipClose}
                className="px-3 py-1.5 bg-white border border-gray-300 text-[#4A6FA5] text-xs font-semibold rounded hover:bg-gray-50 flex items-center gap-1 font-roboto"
              >
                <X className="w-3.5 h-3.5" />
                {t('button.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Audit Trail Modal
const AuditTrailModal = ({ isOpen, onClose, onSubmit, t }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!username || !password) {
      setError(t('login.enterusername') + ' and ' + t('login.password'));
      return;
    }
    onSubmit({ username, password, reason: reason || 'Instrument Lock/Unlock Operation' });
    setUsername('');
    setPassword('');
    setReason('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-20">
      <div className="bg-white rounded shadow-xl w-[400px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-[#4A6FA5] font-roboto">Audit Trail Verification</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          {error && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded font-roboto">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#4A6FA5] mb-1 font-semibold font-roboto">{t('login.username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-8 px-2 text-xs border border-gray-300 rounded text-[#4A6FA5]"
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
              />
            </div>
            
            <div>
              <label className="block text-xs text-[#4A6FA5] mb-1 font-semibold font-roboto">{t('login.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-8 px-2 text-xs border border-gray-300 rounded text-[#4A6FA5]"
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
              />
            </div>
            
            <div>
              <label className="block text-xs text-[#4A6FA5] mb-1 font-semibold font-roboto">Reason (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-20 px-2 py-1 text-xs border border-gray-300 rounded text-[#4A6FA5]"
                placeholder="Enter reason for this operation..."
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 flex items-center gap-2 font-roboto"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {t('button.submit')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-[#4A6FA5] text-xs font-semibold rounded hover:bg-gray-50 font-roboto"
          >
            {t('button.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const InstrumentLockTag = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    client: '',
    instrument: '',
    path: '',
    limsOrder: '',
    fileName: '',
    template: '',
    mergeFileCount: '1',
    currentFileCount: '0',
    unlockAfterCapture: false
  });

  const [errors, setErrors] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [showMergeFields] = useState(true);
  const [showUnlockOption] = useState(true);
  const [auditTrailModalOpen, setAuditTrailModalOpen] = useState(false);
  const [auditAction, setAuditAction] = useState(null);

  const [clientOptions] = useState([
    { value: 'client1', label: 'Client A' },
    { value: 'client2', label: 'Client B' },
    { value: 'client3', label: 'Client C' }
  ]);

  const [instrumentOptions] = useState([
    { value: 'inst1', label: 'HPLC-001 (Waters Alliance)' },
    { value: 'inst2', label: 'GC-002 (Agilent 7890)' },
    { value: 'inst3', label: 'MS-003 (Thermo Q-Exactive)' }
  ]);

  const [pathOptions] = useState([
    { value: 'path1', label: 'C:/Data/Instrument01/Raw' },
    { value: 'path2', label: 'C:/Data/Instrument02/Raw' },
    { value: 'path3', label: 'C:/Data/Instrument03/Raw' }
  ]);

  const [limsOrderOptions] = useState([
    { value: 'order1', label: 'LO-2024-001' },
    { value: 'order2', label: 'LO-2024-002' },
    { value: 'order3', label: 'LO-2024-003' }
  ]);

  const [templateOptions] = useState([
    { value: 'template1', label: 'Standard Analysis Template' },
    { value: 'template2', label: 'QC Template' },
    { value: 'template3', label: 'Custom Template' }
  ]);

  const [tags, setTags] = useState([
    { tagName: 'Sample', value: '', required: true, editable: true, options: [] },
    { tagName: 'Test', value: '', required: true, editable: true, options: [] }
  ]);

  const handleClientChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, client: value }));
  }, []);

  const handleInstrumentChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, instrument: value }));
    setErrors(prev => ({ ...prev, instrument: false }));
  }, []);

  const handlePathChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, path: value }));
    setErrors(prev => ({ ...prev, path: false }));
  }, []);

  const handleTemplateChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, template: value }));
    setErrors(prev => ({ ...prev, template: false }));
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
    setTags(prev => prev.map((t, idx) => 
      idx === index ? { ...t, value } : t
    ));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.instrument) newErrors.instrument = true;
    if (!formData.path) newErrors.path = true;
    if (!formData.template) newErrors.template = true;
    if (!formData.fileName) newErrors.fileName = true;
    
    const missingTags = tags.filter(tag => tag.required && !tag.value);
    if (missingTags.length > 0) {
      alert(`Select ${missingTags[0].tagName} value`);
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, tags, t]);

  const handleLock = useCallback(() => {
    if (!validateForm()) return;
    setAuditAction('lock');
    setAuditTrailModalOpen(true);
  }, [validateForm]);

  const handleUnlock = useCallback(() => {
    if (!window.confirm(`${t('instrumentlocktag.unlock')}?`)) return;
    setAuditAction('unlock');
    setAuditTrailModalOpen(true);
  }, [t]);

  const handleUpdate = useCallback(() => {
    if (!validateForm()) return;
    alert(t('instrumentlocktag.instrumentupdatedsuccessfully'));
  }, [validateForm, t]);

  const handleAuditTrailSubmit = useCallback((auditValues) => {
    console.log('Audit trail submitted:', auditValues);
    setAuditTrailModalOpen(false);

    if (auditAction === 'lock') {
      setIsLocked(true);
      alert(t('instrumentlocktag.instrumentlockedsuccessfully'));
    }

    if (auditAction === 'unlock') {
      setIsLocked(false);
      alert(t('instrumentlocktag.instrumentunlockedsuccessfully'));
    }

    setAuditAction(null);
  }, [auditAction, t]);

  const PrimaryButton = ({ icon: Icon, label, onClick, disabled }) => (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`flex items-center gap-1 px-2.5 py-2 transition-all text-[11px] font-semibold rounded shadow-xs whitespace-nowrap
        ${disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-[#edf5ff] text-[#1471fc] hover:bg-blue-50 hover:scale-90'}
      `}
      style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
    >
      <Icon className="w-4 h-4 stroke-[3]" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col w-full text-[#4A6FA5] rounded-md font-roboto">
      <div className="bg-white px-6 py-7">
        <div className="max-w-[1300px]">
          <div className="grid grid-cols-2">
            <div className="max-w-[400px] ">
              <AnimatedDropdown
                label={t('label.client')}
                value={formData.client}
                options={clientOptions}
                onChange={handleClientChange}
                disabled={isLocked}
              />

              <AnimatedDropdown 
                label={t('label.instrument')}
                value={formData.instrument}
                options={instrumentOptions}
                onChange={handleInstrumentChange}
                disabled={isLocked}
                required
                error={errors.instrument}
              />

              <AnimatedDropdown
                label={t('instrumentlocktag.path')}
                value={formData.path}
                options={pathOptions}
                onChange={handlePathChange}
                disabled={isLocked}
                required
                error={errors.path}
              />

              <AnimatedInput
                label={t('instrumentlocktag.limsorder')}
                value={formData.limsOrder}
                onChange={(value) => setFormData(prev => ({ ...prev, limsOrder: value }))}
                disabled={isLocked}
              />

              <AnimatedInput
                label={t('instrumentlocktag.filename')}
                value={formData.fileName}
                onChange={(value) => setFormData(prev => ({ ...prev, fileName: value }))}
                disabled={isLocked}
                required
                error={errors.fileName}
              />

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

              <AnimatedDropdown
                label={t('instrumentlocktag.template')}
                value={formData.template}
                options={templateOptions}
                onChange={handleTemplateChange}
                disabled={isLocked}
                required
                error={errors.template}
              />
              </div>
              <div className="mt-7 max-w-[1300px] ">
                <div className="max-w-[550px] ">

                <TagGrid
                  tags={tags}
                  onTagValueClick={handleTagValueClick}
                  isLocked={isLocked}
                  t={t}
                />
              </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-7 pt-5 border-t border-gray-200">
            <PrimaryButton
              icon={isLocked ? Edit : Lock}
              label={isLocked ? t('button.update') : t('instrumentlocktag.lock')}
              onClick={isLocked ? handleUpdate : handleLock}
            />

            <PrimaryButton
              icon={Unlock}
              label={t('instrumentlocktag.unlock')}
              onClick={isLocked ? handleUnlock : () => {
                alert(t('instrumentlocktag.instrumentisnotlocked'));
              }}
              disabled={!isLocked}
            />
          </div>
        </div>
      </div>

      <AuditTrailModal
        isOpen={auditTrailModalOpen}
        onClose={() => setAuditTrailModalOpen(false)}
        onSubmit={handleAuditTrailSubmit}
        t={t}
      />
    </div>
  );
};

export default InstrumentLockTag;