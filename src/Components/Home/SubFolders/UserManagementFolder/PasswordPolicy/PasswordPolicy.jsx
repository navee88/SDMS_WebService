import React, { useState, useEffect } from 'react';
import { CheckSquare, Database, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditTrail from '../../../../Layout/Common/AuditTrail';

// Mock utility functions
const CF_AlertSuccess = (message) => alert('Success: ' + message);
const CF_AlertWarning = (message) => alert('Warning: ' + message);

// Helper function for translations
const usePasswordPolicyTranslations = () => {
  const { t } = useTranslation();
  
  return {
    passwordpolicy: t('passwordpolicy', 'Password Policy'),
    save: t('button.save', 'Save'),
    databasebasedlogin: t('login.databasebased', 'Database Based Login'),
    minimumpasswordlength: t('password.minlength', 'Minimum Password Length'),
    maximumpasswordlength: t('password.maxlength', 'Maximum Password Length'),
    passwordhistory: t('password.history', 'Password History'),
    passwordexpiry: t('password.expiry', 'Password Expiry'),
    autolockpolicy: t('password.autolock', 'Autolock Policy'),
    complexpasswordpolicy: t('password.complex', 'Complex Password Policy'),
    complexpolicynote: t('password.complexNote', 'NOTE:'),
    minimumnumberofcapitalcharcter: t('password.minUppercase', 'Minimum number of Uppercase characters'),
    minimumnumberofsmallcharcter: t('password.minLowercase', 'Minimum number of Lowercase characters'),
    minimumnumberofnumericcharcter: t('password.minNumeric', 'Minimum number of Numeric characters'),
    minimumnumberofspecialcharcter: t('password.minSpecial', 'Minimum number of Special characters')
  };
};

// Custom Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );
};

// Compact Input Component
const CompactInput = ({ 
  id,
  label, 
  value, 
  onChange, 
  disabled = false,
  required = false,
  error = false,
  min,
  max,
  rangeText,
  className = ''
}) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue !== '' && !/^\d+$/.test(inputValue)) {
      return;
    }
    onChange(inputValue);
  };

  return (
    <div className={`mb-3 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[11px] text-[#505050] font-semibold uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {rangeText && (
          <span className="text-[10px] text-gray-500">
            {rangeText}
          </span>
        )}
      </div>
      <div className="flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`w-20 h-8 px-2 text-[12px] text-[#3f3f3f] font-medium bg-white border border-gray-300 rounded outline-none transition-all
            ${error ? 'border-red-400' : 'border-gray-300'}
            ${disabled ? 'cursor-not-allowed text-gray-400' : 'hover:border-gray-400 focus:border-blue-500'}
          `}
          style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
        />
        <div className="ml-2 text-[10px] text-gray-500">
          {id.includes('expiry') ? 'Days' : id.includes('Length') ? 'Characters' : 'Times'}
        </div>
      </div>
    </div>
  );
};

// Checkbox Component
const Checkbox = ({ 
  id, 
  label, 
  checked, 
  onChange, 
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
      />
      <label htmlFor={id} className="text-[13px] text-[#4b4b4b] font-semibold cursor-pointer">
        {label}
      </label>
    </div>
  );
};

// Complex Password Policy Section
const ComplexPasswordPolicy = ({ 
  enabled, 
  onToggle, 
  values, 
  onChange, 
  disabled = false,
  minPasswordLength,
  maxPasswordLength
}) => {
  const translations = usePasswordPolicyTranslations();

  const handleValueChange = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  return (
    <div className="">
      {/* Title and Checkbox in same row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] text-[#4b4b4b] font-bold">
          {translations.complexpasswordpolicy}
        </h3>
        <Checkbox
          id="complexpasswordcheckboxid"
          label={translations.complexpasswordpolicy}
          checked={enabled}
          onChange={onToggle}
          disabled={disabled}
        />
      </div>
      
      {enabled && (
        <div className="p-0 rounded-lg">
          {/* Note Section */}
          <div className="mb-3 p-2 bg-yellow-100 border border-yellow-200 rounded">
            <p className="text-[11px] text-[#856404] font-semibold leading-tight">
              <span className="font-bold">{translations.complexpolicynote}:</span>
              {' '}The total length of complex password must be greater than or equal to minimum password length and less than or equal to maximum password length.
            </p>
          </div>
          
          {/* Complex Password Requirements Grid */}
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] text-[#505050] font-semibold uppercase mb-1">
                {translations.minimumnumberofcapitalcharcter}
              </label>
              <input
                id="mincapitalchar"
                type="text"
                value={values.minCapitalChars}
                onChange={(e) => handleValueChange('minCapitalChars', e.target.value)}
                disabled={disabled}
                className="w-20 h-8 px-2 text-[12px] text-[#3f3f3f] font-medium bg-white border border-gray-300 rounded outline-none hover:border-gray-400 focus:border-blue-500"
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
              />
            </div>
            
            <div>
              <label className="block text-[11px] text-[#505050] font-semibold uppercase mb-1">
                {translations.minimumnumberofsmallcharcter}
              </label>
              <input
                id="minsmallchar"
                type="text"
                value={values.minSmallChars}
                onChange={(e) => handleValueChange('minSmallChars', e.target.value)}
                disabled={disabled}
                className="w-20 h-8 px-2 text-[12px] text-[#3f3f3f] font-medium bg-white border border-gray-300 rounded outline-none hover:border-gray-400 focus:border-blue-500"
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
              />
            </div>
            
            <div>
              <label className="block text-[11px] text-[#505050] font-semibold uppercase mb-1">
                {translations.minimumnumberofnumericcharcter}
              </label>
              <input
                id="minnumericchar"
                type="text"
                value={values.minNumericChars}
                onChange={(e) => handleValueChange('minNumericChars', e.target.value)}
                disabled={disabled}
                className="w-20 h-8 px-2 text-[12px] text-[#3f3f3f] font-medium bg-white border border-gray-300 rounded outline-none hover:border-gray-400 focus:border-blue-500"
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
              />
            </div>
            
            <div>
              <label className="block text-[11px] text-[#505050] font-semibold uppercase mb-1">
                {translations.minimumnumberofspecialcharcter}
              </label>
              <input
                id="minspecialchar"
                type="text"
                value={values.minSpecialChars}
                onChange={(e) => handleValueChange('minSpecialChars', e.target.value)}
                disabled={disabled}
                className="w-20 h-8 px-2 text-[12px] text-[#3f3f3f] font-medium bg-white border border-gray-300 rounded outline-none hover:border-gray-400 focus:border-blue-500"
                style={{ fontFamily: 'Verdana, Arial, sans-serif' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
const PasswordPolicy = () => {
  const translations = usePasswordPolicyTranslations();
  
  const [formData, setFormData] = useState({
    // Basic Policy
    minPasswordLength: '4',
    maxPasswordLength: '10',
    passwordHistory: '5',
    passwordExpiry: '90',
    autoLockPolicy: '3',
    loginType: 'database',
    
    // Complex Password Policy
    complexPasswordEnabled: false,
    complexPasswordValues: {
      minCapitalChars: '0',
      minSmallChars: '0',
      minNumericChars: '0',
      minSpecialChars: '0'
    }
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [userRights, setUserRights] = useState({
    canEdit: true,
    canSave: true
  });

  // Validation ranges
  const validationRanges = {
    passwordLength: { min: 4, max: 20 },
    historyLock: { min: 1, max: 5 },
    passwordExpiry: { min: 1, max: 180 }
  };

  // Load initial data
  useEffect(() => {
    loadPasswordPolicy();
  }, []);

  const loadPasswordPolicy = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setFormData({
          minPasswordLength: '4',
          maxPasswordLength: '10',
          passwordHistory: '5',
          passwordExpiry: '90',
          autoLockPolicy: '3',
          loginType: 'database',
          complexPasswordEnabled: false,
          complexPasswordValues: {
            minCapitalChars: '0',
            minSmallChars: '0',
            minNumericChars: '0',
            minSpecialChars: '0'
          }
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading password policy:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handleComplexPasswordToggle = (enabled) => {
    setFormData(prev => ({
      ...prev,
      complexPasswordEnabled: enabled
    }));
  };

  const handleComplexPasswordValueChange = (values) => {
    setFormData(prev => ({
      ...prev,
      complexPasswordValues: values
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Required fields validation
    const requiredFields = [
      'minPasswordLength',
      'maxPasswordLength',
      'passwordHistory',
      'passwordExpiry',
      'autoLockPolicy'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = true;
        isValid = false;
      }
    });

    // Numeric validation
    const minLength = parseInt(formData.minPasswordLength);
    const maxLength = parseInt(formData.maxPasswordLength);
    
    if (isNaN(minLength) || minLength < validationRanges.passwordLength.min || minLength > validationRanges.passwordLength.max) {
      newErrors.minPasswordLength = true;
      isValid = false;
    }
    
    if (isNaN(maxLength) || maxLength < validationRanges.passwordLength.min || maxLength > validationRanges.passwordLength.max) {
      newErrors.maxPasswordLength = true;
      isValid = false;
    }
    
    if (!isNaN(minLength) && !isNaN(maxLength) && minLength > maxLength) {
      newErrors.minPasswordLength = true;
      newErrors.maxPasswordLength = true;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) {
      CF_AlertWarning('Please fix validation errors');
      return;
    }

    // Show audit trail modal (simulating audit trail requirement)
    setShowAuditTrail(true);
  };

  const handleAuditTrailAuthorized = (auditData) => {
    // Audit trail successful, proceed with save
    savePasswordPolicy();
    setShowAuditTrail(false);
  };

  const savePasswordPolicy = () => {
    setIsLoading(true);
    
    // Prepare data for API call
    const pswdObj = {
      nMinPasswrdLength: parseInt(formData.minPasswordLength),
      nMaxPasswrdLength: parseInt(formData.maxPasswordLength),
      nPasswordHistory: parseInt(formData.passwordHistory),
      nPasswordExpiry: parseInt(formData.passwordExpiry),
      nLockPolicy: parseInt(formData.autoLockPolicy),
      nComplexPasswrd: formData.complexPasswordEnabled ? 1 : 0,
      nDBBased: formData.loginType === 'database' ? 1 : 0,
      nMinCapitalChar: parseInt(formData.complexPasswordValues.minCapitalChars),
      nMinSmallChar: parseInt(formData.complexPasswordValues.minSmallChars),
      nMinNumericChar: parseInt(formData.complexPasswordValues.minNumericChars),
      nMinSpecialChar: parseInt(formData.complexPasswordValues.minSpecialChars)
    };

    console.log('Saving password policy:', pswdObj);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      CF_AlertSuccess('Password policy saved successfully');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white">
        {/* Header with Save Button on right */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-[#4b4b4b]">
            {translations.passwordpolicy}
          </h1>
          
          <div className="flex items-center gap-4">
            {userRights.canSave && (
              <button
                onClick={handleSave}
                disabled={!userRights.canEdit || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#367eb9] text-white text-xs font-semibold rounded hover:bg-[#2c6da4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckSquare className="w-3 h-3" />
                <span>{translations.save}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Policy */}
          <div>
            {/* Database Based Login with Toggle */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  checked={formData.loginType === 'database'}
                  onChange={(checked) => {
                    handleInputChange('loginType', checked ? 'database' : 'domain');
                  }}
                  disabled={!userRights.canEdit}
                />
                <span className="text-[13px] text-[#4b4b4b] font-semibold">
                  {translations.databasebasedlogin}
                </span>
              </div>
            </div>

            {/* Basic Policy Fields */}
            <div className="space-y-0">
              <CompactInput
                id="minpaswrdlength"
                label={translations.minimumpasswordlength}
                value={formData.minPasswordLength}
                onChange={(value) => handleInputChange('minPasswordLength', value)}
                disabled={!userRights.canEdit}
                required
                error={errors.minPasswordLength}
                rangeText="(Between 4 and 20 Characters)"
              />
              
              <CompactInput
                id="maxpaswrdlength"
                label={translations.maximumpasswordlength}
                value={formData.maxPasswordLength}
                onChange={(value) => handleInputChange('maxPasswordLength', value)}
                disabled={!userRights.canEdit}
                required
                error={errors.maxPasswordLength}
                rangeText="(Between 4 and 20 Characters)"
              />
              
              <CompactInput
                id="passwrdhistory"
                label={translations.passwordhistory}
                value={formData.passwordHistory}
                onChange={(value) => handleInputChange('passwordHistory', value)}
                disabled={!userRights.canEdit}
                required
                error={errors.passwordHistory}
                rangeText="(Between 1 and 5 Times)"
              />
              
              <CompactInput
                id="passwrdexpiry"
                label={translations.passwordexpiry}
                value={formData.passwordExpiry}
                onChange={(value) => handleInputChange('passwordExpiry', value)}
                disabled={!userRights.canEdit}
                required
                error={errors.passwordExpiry}
                rangeText="(Between 1 and 180 Days)"
              />
              
              <CompactInput
                id="lockpolicy"
                label={translations.autolockpolicy}
                value={formData.autoLockPolicy}
                onChange={(value) => handleInputChange('autoLockPolicy', value)}
                disabled={!userRights.canEdit}
                required
                error={errors.autoLockPolicy}
                rangeText="(Between 1 and 5 Times)"
              />
            </div>
          </div>

          {/* Right Column - Complex Password Policy */}
          <div>
            <ComplexPasswordPolicy
              enabled={formData.complexPasswordEnabled}
              onToggle={handleComplexPasswordToggle}
              values={formData.complexPasswordValues}
              onChange={handleComplexPasswordValueChange}
              disabled={!userRights.canEdit}
              minPasswordLength={formData.minPasswordLength}
              maxPasswordLength={formData.maxPasswordLength}
            />
          </div>
        </div>

        {/* Audit Trail Modal */}
        <AuditTrail
          isOpen={showAuditTrail}
          onClose={() => setShowAuditTrail(false)}
          onAuthorized={handleAuditTrailAuthorized}
          actionLabel="Save"
        />
      </div>
    </div>
  );
};

export default PasswordPolicy;