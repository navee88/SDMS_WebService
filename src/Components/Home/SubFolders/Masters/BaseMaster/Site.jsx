import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, FileText, SquarePen, Plus, Edit, SquareCheckBig } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useLanguage } from '../../../../../Context/LanguageContext';
import { useTranslation } from "react-i18next";
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AnimatedTextarea from '../../../../Layout/Common/AnimatedTextarea';

const UsersPage = () => {
    const [userData, setUserData] = useState([]);
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


    const handleAddClick = () => {
        setActivePopup("Add Site"); // Change from setShowAddPopUp
        setFormData({}); // Reset form
    };

    const handleEditClick = () => {
        setActivePopup("Edit Site");
        // If editing, you can pre-fill formData with selected row data
    };

    const openAddPopup = () => {
        console.log("Open ADD popup here");
        // setShowAddPopup(true);
    };

    // Handler to close popup
    const handlePopupClose = () => {
        setActivePopup(null); // Change from setShowAddPopUp(null)
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePopupSubmit = () => {
        console.log("Form Data:", formData);
        // Do your API call or validation here
        setActivePopup(null); // Close popup
    };


    const ActionButton = ({ icon: Icon, label, disabled, onClick, className = "" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2 py-2 text-[11px] font-bold rounded whitespace-nowrap
      hover:scale-90 transition-all
      ${disabled
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
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
            <div className="flex flex-col gap-4 p-2">
                {/* Row 1: Site Code & Mobile No */}
                <div className="flex gap-4">
                    <AnimatedInput
                        label={t("label.siteCode")}
                        name="siteCode"
                        value={formData.siteCode || ''}
                        required
                        onChange={(e) => handleInputChange('siteCode', e.target.value)}
                    />
                    <AnimatedInput
                        label={t("label.mobileNo")}
                        name="mobileNo"
                        value={formData.mobileNo || ''}
                        onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                    />
                </div>

                {/* Row 2: Site Name & Fax No */}
                <div className="flex gap-4">
                    <AnimatedInput
                        label={t("label.siteName")}
                        name="siteName"
                        value={formData.siteName || ''}
                        required
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                    />
                    <AnimatedInput
                        label={t("label.faxNo")}
                        name="faxNo"
                        value={formData.faxNo || ''}
                        onChange={(e) => handleInputChange('faxNo', e.target.value)}
                    />
                </div>

                {/* Row 3: Site Address & E-mail */}
                <div className="flex gap-4">
                    <AnimatedTextarea
                        label={t("label.siteAddress")}
                        name="siteAddress"
                        value={formData.siteAddress || ''}
                        onChange={(e) => handleInputChange('siteAddress', e.target.value)}
                    />
                    <AnimatedInput
                        label={t("label.email")}
                        name="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                </div>

                {/* Row 4: Contact Person (full width) */}
                <AnimatedInput
                    label={t("label.contactPerson")}
                    name="contactPerson"
                    value={formData.contactPerson || ''}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                />

                <div className="flex justify-end gap-3 pt-3">
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
            <div className="flex flex-col gap-4 p-2">
                <div className="flex flex-col gap-6">
                    <AnimatedInput
                        label={t("label.siteCode")}
                        name="siteCode"
                        value={formData.siteCode || ''}
                        required
                        onChange={(e) => handleInputChange('siteCode', e.target.value)}
                    />

                    <AnimatedInput
                        label={t("label.siteName")}
                        name="siteName"
                        value={formData.siteName || ''}
                        required
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                    />

                    <AnimatedInput
                        label={t("label.siteAddress")}
                        name="siteAddress"
                        value={formData.siteAddress || ''}
                        onChange={(e) => handleInputChange('siteAddress', e.target.value)}
                    />

                    <AnimatedInput
                        label={t("label.contactPerson")}
                        name="contactPerson"
                        value={formData.contactPerson || ''}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-6">

                    <AnimatedInput
                        label={t("label.mobileNo")}
                        name="mobileNo"
                        value={formData.mobileNo || ''}
                        onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                    />

                    <AnimatedInput
                        label={t("label.faxNo")}
                        name="faxNo"
                        value={formData.faxNo || ''}
                        onChange={(e) => handleInputChange('faxNo', e.target.value)}
                    />

                    <AnimatedInput
                        label={t("label.email")}
                        name="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-3">
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
        )
    };

    return (
        <div className="px-4 font-roboto h-[calc(100vh-150px)] flex flex-col">

            {/* Top Action Buttons (same place) */}
            <div className="flex justify-end gap-2 mt-4">
                <ActionButton icon={Plus} label={t('button.add')} onClick={handleAddClick} />
                <ActionButton icon={Edit} label={t('button.edit')} onClick={handleEditClick} />
            </div>

            {/* UsersPage takes full width & height */}
            <div className="flex-1 overflow-hidden">
                <UsersPage />
            </div>

            {/* CustomPopup */}
            <CustomPopup
                isOpen={!!activePopup}
                onClose={handlePopupClose}
                title={activePopup || ""}
                content={activePopup ? POPUP_CONTENTS[activePopup] : null}
            />

        </div>
    );

}

export default Site