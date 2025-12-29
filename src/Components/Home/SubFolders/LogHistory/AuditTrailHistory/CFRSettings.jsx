import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../../../Context/LanguageContext';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AuditTrail from '../../../../Layout/Common/AuditTrail';

function CFRSettings() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Activated');
  const [newReason, setNewReason] = useState('');
  const [showInputError, setShowInputError] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'add' or 'remove'
  // Initialize with all statuses in state
  const [allStatuses, setAllStatuses] = useState([
    t('statuses.activated'),
    t('statuses.approved'),
    t('statuses.checked'),
    t('statuses.created'),
    t('statuses.deactivated'),
    t('statuses.mapped'),
    t('statuses.modified'),
    t('statuses.notApproved'),
    t('statuses.retired'),
    t('statuses.reviewed'),
    t('statuses.started'),
    t('statuses.stopped'),
  ]);

  const filteredStatuses = allStatuses.filter(status =>
    status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "" }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-[Roboto] font-medium rounded whitespace-nowrap hover:scale-95 transition-all
      ${disabled
          ? "bg-slate-100 text-slate-300 cursor-not-allowed"
          : "bg-[#f1f5f9] text-[#1d8cf8] hover:bg-blue-100"
        }
      ${className}
    `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );

  return (
    <div className='px-6 py-4'>
      <div className="grid grid-cols-2 gap-8">
        {/* Left Side - General Settings */}
        <div>
          <span className='text-[#0049B0] font-bold font-[Roboto] text-sm '>{t("label.generalSettings")}</span><br />

          <label className="inline-flex items-center cursor-not-allowed mt-4">
            <input
              type="checkbox"
              checked
              disabled
              className="peer hidden"
            />
            <span className="w-[17.8px] h-[17.8px] border border-gray-400 bg-gray-300 flex items-center justify-center peer-checked:bg-gray-300 peer-checked:border-gray-400">
              <svg
                className="w-5 h-5 text-[#0049B0]"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </label>

          <span className='text-[#405F7D] text-xs font-bold ml-6 font-[Roboto]'>{t("label.enableAuditTrail")}</span>
          <span className='text-[#E4080A]'> * </span><br />

          <div className="mt-6">
            <span className='text-[#0049B0] font-bold text-sm block font-[Roboto]'>{t("label.enterReasonsToAdd")}</span>

            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <AnimatedInput
                  label=""
                  name="EnterReasonsToAdd"
                  value={newReason}
                  onChange={(e) => {
                    setNewReason(e.target.value);
                    if (showInputError) setShowInputError(false); // Clear error on type
                  }}
                  showError={showInputError}
                  required={true}
                  labelColor="text-[#0049B0]"
                  labelSize="text-sm"
                  labelWeight="font-bold"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 ml-auto">
                <ActionButton
                  icon={Plus}
                  label={t('button.add')}
                  onClick={() => {
                    if (!newReason.trim()) {
                      setShowInputError(true);
                      return;
                    }
                    setPendingAction('add');
                    setShowAuditTrail(true);
                  }}
                />
                <ActionButton
                  icon={Trash2}
                  label={t('button.remove')}
                  onClick={() => {
                    if (!selectedStatus) {
                      return;
                    }
                    setPendingAction('remove');
                    setShowAuditTrail(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Static Dropdown Display */}
        <div>
          <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            {/* Looking for input */}
            <div className="p-1 border-b border-gray-300 bg-white">
              <input
                type="text"
                placeholder="Looking for"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-1 py-1 text-sm text-gray-700 placeholder-gray-400 border border-gray-300 rounded focus:outline-none bg-white"
              />
            </div>

            {/* Status List */}
            <div className="h-[350px] overflow-y-auto bg-white">
              {filteredStatuses.map((status, index) => (
                <div
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 text-xs font- border-l-4 cursor-pointer font-['Verdana'] ${status === selectedStatus
                    ? 'bg-gray-200 border-blue-600 font-bold text-black'
                    : 'bg-white border-transparent text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {status}
                </div>
              ))}

              {filteredStatuses.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No results found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuditTrail
        isOpen={showAuditTrail}
        onClose={() => {
          setShowAuditTrail(false);
          setPendingAction(null);
        }}
        onAuthorized={(auditData) => {
          if (pendingAction === 'add') {
            setAllStatuses([...allStatuses, newReason.trim()]);
            setNewReason('');
            setShowInputError(false);
          } else if (pendingAction === 'remove') {
            setAllStatuses(allStatuses.filter(s => s !== selectedStatus));
            // Select first remaining status or empty
            setSelectedStatus(allStatuses.filter(s => s !== selectedStatus)[0] || '');
          }
          setShowAuditTrail(false);
          setPendingAction(null);
        }}
        actionLabel={pendingAction === 'add' ? 'Add Reason' : 'Remove Reason'}
      />
    </div>
  );
}

export default CFRSettings;