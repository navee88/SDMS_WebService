import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, FileText, SquarePen, Plus, Edit, SquareCheckBig } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useLanguage } from '../../../../../Context/LanguageContext';
import { useTranslation } from "react-i18next";
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AnimatedTextarea from '../../../../Layout/Common/AnimatedTextarea';

const UsersPage = ({ onRowClick, userData, setUserData }) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const [activePopup, setActivePopup] = useState(null);
    const { t } = useTranslation();

    const mockData = [
        {
            id: 1,
            siteCode: "MU-001",
            siteName: "Kolkata",
            live: true
        },
        {
            id: 2,
            siteCode: "MU-002",
            siteName: "Chennai",
            live: true
        },
        {
            id: 3,
            siteCode: "MU-003",
            siteName: "Mumbai",
            live: true
        },
        {
            id: 4,
            siteCode: "MU-004",
            siteName: "Bangalore",
            live: true
        },
        {
            id: 5,
            siteCode: "MU-005",
            siteName: "Mumbai",
            live: true
        },
        {
            id: 6,
            siteCode: "MU-006",
            siteName: "Bangalore",
            live: true
        },
        {
            id: 7,
            siteCode: "MU-007",
            siteName: "Chennai",
            live: true
        }
    ];



    //   useEffect(() => {
    //     const fetchUsers = async () => {
    //       try {
    //         setLoading(true);
    //         const response = await axios.get('http://localhost:5173/users');
    //         setUserData(response.data);
    //         setLoading(false);
    //       } catch (err) {
    //         console.error("Error fetching data:", err);
    //         setError(err.message || "Something went wrong");
    //         setLoading(false);
    //       }
    //     };

    //     fetchUsers();
    //   }, []);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setUserData(mockData);
            setLoading(false);
            // Select first record after data is loaded
            if (mockData.length > 0 && onRowClick) {
                onRowClick(mockData[0]);
            }
        }, 300);
    }, []);


    const userColumns = useMemo(() => [
        {
            key: 'siteCode',
            label: t('label.siteCode'),
            width: 250,
            enableSearch: true,
            render: (row) => (
                <span className="text-gray-700">
                    {row.siteCode}
                </span>
            )
        },
        {
            key: 'siteName',
            label: t('label.siteName'),
            width: 200,
            enableSearch: true,
            render: (row) => (
                <span className="text-gray-700">
                    {row.siteName}
                </span>
            )
        }
    ], []);


    const renderUserDetail = (user) => (
        <div className="space-y-3 text-[12px]">

            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.siteAddress")}</div>
                <div className="col-span-2">{user.siteAddress}</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.contactPerson")}</div>
                <div className="col-span-2">{user.contactPerson}</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.mobileNo")}</div>
                <div className="col-span-2">{user.mobileNo}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.faxNo")}</div>
                <div className="col-span-2">{user.faxNo}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.email")}</div>
                <div className="col-span-2">{user.email}</div>
            </div>
        </div>
    );


    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500"></div>;
    }


    return (
        <div className="flex flex-col">
            <GridLayout
                columns={userColumns}
                data={userData}
                renderDetailPanel={renderUserDetail}
                onRowClick={onRowClick}
            />
        </div>
    );
};


function Site() {
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();
    const [activePopup, setActivePopup] = useState(null);
    const [formData, setFormData] = useState({
        siteCode: '',
        siteName: '',
        siteAddress: '',
        contactPerson: '',
        mobileNo: '',
        faxNo: '',
        email: ''
    });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const [pendingFormData, setPendingFormData] = useState(null);
    const [userData, setUserData] = useState([]);


    const handleAddClick = () => {
        setActivePopup("Add Site"); // Change from setShowAddPopUp
        setFormData({}); // Reset form
    };

    const handleEditClick = () => {
        if (selectedRecord) {
            setActivePopup("Edit Site");
            setFormData({
                siteCode: selectedRecord.siteCode,
                siteName: selectedRecord.siteName,
                siteAddress: selectedRecord.siteAddress || '',
                contactPerson: selectedRecord.contactPerson || '',
                mobileNo: selectedRecord.mobileNo || '',
                faxNo: selectedRecord.faxNo || '',
                email: selectedRecord.email || ''
            });
        }
    };

    const openAddPopup = () => {
        console.log("Open ADD popup here");
        // setShowAddPopup(true);
    };

    const handlePopupClose = () => {
        setActivePopup(null);
        setValidationErrors({});
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user types
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: false
            }));
        }
    };

    const handlePopupSubmit = () => {
        // Validate required fields
        const errors = {};
        if (!formData.siteCode || formData.siteCode.trim() === '') {
            errors.siteCode = true;
        }
        if (!formData.siteName || formData.siteName.trim() === '') {
            errors.siteName = true;
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Store form data and show audit trail
        setPendingFormData(formData);
        setShowAuditTrail(true);
    };

    const handleRowClick = (record) => {
        setSelectedRecord(record);
    };

    const handleAuditAuthorized = (auditData) => {
        console.log("Audit Data:", auditData);
        console.log("Form Data to Save:", pendingFormData);

        // Update grid data
        setUserData(prevData =>
            prevData.map(item =>
                item.id === selectedRecord.id
                    ? { ...item, ...pendingFormData }
                    : item
            )
        );

        // Update selected record
        setSelectedRecord(prev => ({
            ...prev,
            ...pendingFormData
        }));

        // Close both popups
        setShowAuditTrail(false);
        setActivePopup(null);
        setValidationErrors({});
        setPendingFormData(null);
    };
    const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded whitespace-nowrap
      hover:scale-90 transition-all
      ${disabled
                    ? "bg-slate-100 text-[#2883FE] opacity-65 cursor-not-allowed"
                    : "bg-[#f1f5f9] text-[#2883FE] hover:bg-[#E6F0FF]"
                }
      ${className}
    `}
        >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{label}</span>
        </button>
    );

    const PrimaryButton = ({ icon: Icon, label, onClick }) => (
        <button
            onClick={onClick}
            className="flex items-center gap-1 px-2.5 py-2 hover:scale-90 transition-all bg-white text-[#2883FE] text-[11px] font-bold rounded shadow-sm border border-transparent hover:bg-blue-50  whitespace-nowrap"
        >
            <Icon className="w-4 h-4 stroke-[3]" />
            <span>{label}</span>
        </button>
    );
    const POPUP_CONTENTS = {
        "Add Site": (
            <div className="flex flex-col gap-3 p-2">
                {/* Row 1: Site Code & Mobile No */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.siteCode")}
                            name="siteCode"
                            value={formData.siteCode || ''}
                            required
                            showError={validationErrors.siteCode}
                            onChange={(e) => handleInputChange('siteCode', e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.mobileNo")}
                            name="mobileNo"
                            value={formData.mobileNo || ''}

                            onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 2: Site Name & Fax No */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.siteName")}
                            name="siteName"
                            value={formData.siteName || ''}
                            showError={validationErrors.siteName}
                            required
                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.faxNo")}
                            name="faxNo"
                            value={formData.faxNo || ''}
                            onChange={(e) => handleInputChange('faxNo', e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 3: Site Address & E-mail */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AnimatedTextarea
                            label={t("label.siteAddress")}
                            name="siteAddress"
                            value={formData.siteAddress || ''}
                            onChange={(e) => handleInputChange('siteAddress', e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.email")}
                            name="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 4: Contact Person (full width) */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.contactPerson")}
                            name="contactPerson"
                            value={formData.contactPerson || ''}
                            onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        />
                    </div>
                    <div className="flex-1"></div> {/* Empty div to maintain layout */}
                </div>

                <hr className="border-t border-gray-300 my-2 -mx-6" />

                <div className="flex justify-end gap-2 pt-1">
                    <button
                        onClick={handlePopupSubmit}
                        className="flex items-center gap-2 px-3 py-2 bg-[#2883FE] hover:bg-[#2883FE] text-white text-xs font-semibold rounded transition-colors"
                    >
                        <SquareCheckBig className="w-4 h-4" /> {t("button.save")}
                    </button>
                    <button
                        onClick={handlePopupSubmit}
                        className="flex items-center gap-2 px-3 py-2 bg-[#2883FE] hover:bg-[#2883FE] text-white text-xs font-semibold rounded transition-colors"
                    >
                        {t("button.reset")}
                    </button>
                    <button
                        onClick={handlePopupClose}
                        className="px-3 py-2 bg-white border border-gray-300 text-[#8092A4] hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors"
                    >
                        {t("button.close")}
                    </button>
                </div>
            </div>
        ),
        "Edit Site": (
            <div className="flex flex-col gap-3 p-2">
                {/* Row 1: Site Code & Mobile No */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.siteCode")}
                            name="siteCode"
                            value={formData.siteCode || ''}
                            required
                            disabled={true}
                            onChange={(e) => handleInputChange('siteCode', e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.mobileNo")}
                            name="mobileNo"
                            value={formData.mobileNo || ''}
                            onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 2: Site Name & Fax No */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.siteName")}
                            name="siteName"
                            value={formData.siteName || ''}
                            required
                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.faxNo")}
                            name="faxNo"
                            value={formData.faxNo || ''}
                            onChange={(e) => handleInputChange('faxNo', e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 3: Site Address & E-mail */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.siteAddress")}
                            name="siteAddress"
                            value={formData.siteAddress || ''}
                            onChange={(e) => handleInputChange('siteAddress', e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.email")}
                            name="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 4: Contact Person (full width) */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AnimatedInput
                            label={t("label.contactPerson")}
                            name="contactPerson"
                            value={formData.contactPerson || ''}
                            onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        />
                    </div>
                    <div className="flex-1"></div> {/* Empty div to maintain layout */}
                </div>

                <hr className="border-t border-gray-300 my-2 -mx-6" />

                <div className="flex justify-end gap-2 pt-1">
                    <button
                        onClick={handlePopupSubmit}
                        className="flex items-center gap-2 px-3 py-2 bg-[#2883FE] hover:bg-[#2883FE] text-white text-xs font-semibold rounded transition-colors"
                    >
                        <SquareCheckBig className="w-4 h-4" /> {t("button.save")}
                    </button>
                    <button
                        onClick={handlePopupSubmit}
                        className="flex items-center gap-2 px-3 py-2 bg-[#2883FE] hover:bg-[#2883FE] text-white text-xs font-semibold rounded transition-colors"
                    >
                        {t("button.reset")}
                    </button>
                    <button
                        onClick={handlePopupClose}
                        className="px-3 py-2 bg-white border border-gray-300 text-[#8092A4] hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors"
                    >
                        {t("button.close")}
                    </button>
                </div>
            </div>
        ),
    };

    return (
        <div className="px-4 font-roboto h-[calc(100vh-150px)] flex flex-col">

            {/* Top Action Buttons (same place) */}
            <div className="flex justify-end gap-2 mt-4">
                <ActionButton icon={Plus} label={t('button.add')} onClick={handleAddClick} />
                <ActionButton icon={Edit} label={t('button.edit')} onClick={handleEditClick} disabled={!selectedRecord} />
            </div>

            <div className="flex-1 overflow-hidden">
                <UsersPage onRowClick={handleRowClick} userData={userData} setUserData={setUserData} />
            </div>

            {/* CustomPopup */}
            <CustomPopup
                isOpen={!!activePopup}
                onClose={handlePopupClose}
                title={activePopup || ""}
                content={activePopup ? POPUP_CONTENTS[activePopup] : null}
            />

            {/* AuditTrail Popup */}
            <AuditTrail
                isOpen={showAuditTrail}
                onClose={() => setShowAuditTrail(false)}
                onAuthorized={handleAuditAuthorized}
                actionLabel="Submit"
            />

        </div>
    );

}

export default Site