import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, FileText, SquarePen, CheckSquare } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useLanguage } from '../../../../../Context/LanguageContext';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCallback } from 'react';
import Errordialog from "../../../../Layout/Common/Errordialog";
import CustomPopup from '../../../../Layout/Common/Popup';

const UsersPage = () => {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();
    // const navigate = useNavigate();

    const mockData = [
        {
            id: 1,
            clientName: "DESKTOP-CU9J5T2",
            instrument: "CU-Summary1 (CU-Summary1)",
            live: true
        },
        {
            id: 2,
            clientName: "DESKTOP-CU9J5T2",
            instrument: "CU-Summary1 (CU-Summary1)",
            live: true
        },
        {
            id: 3,
            clientName: "DESKTOP-CU9J5T2",
            instrument: "MU-Summary1 (MU-Summary1)",
            live: true
        },
        {
            id: 4,
            clientName: "DESKTOP-CU9J5T2",
            instrument: "AU-Summary1 (AU-Summary1)",
            live: true
        },
        {
            id: 5,
            clientName: "DESKTOP-CU9J5T2",
            instrument: "CU-Summary1 (CU-Summary1)",
            live: true
        },
        {
            id: 6,
            clientName: "DESKTOP-CU9J5T2",
            instrument: "CU-Summary1 (CU-Summary1)",
            live: true
        },
        {
            id: 7,
            clientName: "DESKTOP-CU9J5T2",
            instrument: "CU-Summary1 (CU-Summary1)",
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
            key: 'clientName',
            label: t("label.clientName"),
            width: 200,
            enableSearch: true,
            render: (row) => (
                <span className="text-gray-700">
                    {row.clientName}
                </span>
            )
        },
        {
            key: 'instrument',
            label: t("label.instrument"),
            width: 250,
            enableSearch: true,
            render: (row) => (
                <span className="text-gray-700">
                    {row.instrument}
                </span>
            )
        },
        {
            key: 'live',
            label: 'Live',
            width: 100,
            enableSearch: true,
            render: (row) => (
                <span className="text-lg">
                    {row.live ? "✓" : ""}
                </span>
            )
        }
    ], []);


    const renderUserDetail = (user) => (
        <div className="space-y-3 text-[12px]">

            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.storageName")}</div>
                <div className="col-span-2">{user.storageName}</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.taskStatus")}</div>
                <div className="col-span-2">{user.taskStatus}</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.scheduleId")}</div>
                <div className="col-span-2">{user.scheduleId}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.taskId")}</div>
                <div className="col-span-2">{user.taskId}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.sourcePath")}</div>
                <div className="col-span-2">{user.sourcePath}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-700 text-[#405F7D]">{t("label.queue")}</div>
                <div className="col-span-2">{user.queue}</div>
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


function UploadQueue() {
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();


    // Add state for information dialog
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });

    // popup state
    const [activePopup, setActivePopup] = useState(null);
    const [scheduleMode, setScheduleMode] = useState("");
    // Function to show information dialog
    const showInfoDialog = useCallback((message, type = "information") => {
        setInfoDialog({
            open: true,
            message,
            type
        });
    }, []);

    // Function to close information dialog
    const closeInfoDialog = useCallback(() => {
        setInfoDialog(prev => ({
            ...prev,
            open: false
        }));
    }, []);

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

    // Handler to open popup
    const handleUpdateScheduleMode = () => {
        setActivePopup("Update Schedule Mode");
    };

    // Handler to close popup and show info dialog
    const handlePopupClose = () => {
        setActivePopup(null);
        // Show info dialog after closing popup
        showInfoDialog("Schedule mode popup closed", "information");
    };

    // Handler to submit form
    const handlePopupSubmit = () => {
        if (!scheduleMode) {
            showInfoDialog("Please select a schedule mode", "information");
            return;
        }

        // Your update logic here
        console.log("Updating schedule mode:", scheduleMode);

        // Close popup
        setActivePopup(null);

        // Show success message
        showInfoDialog("Schedule mode updated successfully", "success");

        // Reset form
        setScheduleMode("");
    };

    const POPUP_CONTENTS = {
        "Update Schedule Mode": (
            <div className="flex flex-col gap-4 p-2">
                {/* Username Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Username <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value="Administrator"
                        disabled
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-gray-50"
                    />
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter password"
                    />
                </div>

                {/* Reason Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Reason <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={scheduleMode}
                        onChange={(e) => setScheduleMode(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">Select Reason</option>
                        <option value="Activated">Activated</option>
                        <option value="Deactivated">Deactivated</option>
                        <option value="Modified">Modified</option>
                    </select>
                </div>

                {/* Comments Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Comments <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows="3"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter comments"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                    <button
                        onClick={handlePopupSubmit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
                    >
                        <CheckSquare className="w-4 h-4" /> Submit
                    </button>
                    <button
                        onClick={handlePopupClose}
                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    };


    return (
        <div className="px-4 font-roboto h-[calc(100vh-150px)] flex flex-col">
            {/* Information Dialog */}
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

            {/* Top Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
                <ActionButton
                    icon={FileText}
                    label={t('button.viewDetails')}
                    onClick={() => showInfoDialog("Please select a record to view details", "information")}
                />
                <ActionButton
                    icon={SquarePen}
                    label={t('button.updateScheduleMode')}
                    onClick={handleUpdateScheduleMode}
                />
            </div>

            {/* UsersPage takes full width & height */}
            <div className="flex-1 overflow-hidden">
                <UsersPage />
            </div>

            {/* Add CustomPopup */}
            <CustomPopup
                isOpen={!!activePopup}
                onClose={handlePopupClose}
                title={activePopup || ""}
                content={activePopup ? POPUP_CONTENTS[activePopup] : null}
            />
        </div>
    );

}

export default UploadQueue
