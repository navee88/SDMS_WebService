import React, { useState } from 'react'
import AnimatedInput from './AnimatedInput';
import AnimatedDropdown from './AnimatedDropdown';
import AnimatedTextarea from './AnimatedTextarea';
import { CheckSquare } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../../Context/LanguageContext';
import CustomPopup from './Popup';

const AuditTrail = ({
    isOpen,
    onClose,
    onAuthorized,
    actionLabel = "Submit",
    defaultReason = "Activated",
    disableReason = false
}) => {
    const [password, setPassword] = useState("");
    const [reason, setReason] = useState(defaultReason);
    const [comments, setComments] = useState("");
    const [showError, setShowError] = useState(false);
    const [userName, setUserName] = useState("");
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();
    const [activePopup, setActivePopup] = useState(null);

    if (!isOpen) return null;

    const verifyPassword = async (password) => {
        try {
            const response = await fetch("/api/auth/verify-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // if session-based auth
                body: JSON.stringify({ password }),
            });

            if (!response.ok) return false;

            return true;
        } catch (error) {
            return false;
        }
    };
    const handleReason = (value) => {
        const actualValue = value?.target?.value || value?.value || value;
        setReason(actualValue);
    };

    const handleSubmit = async () => {
        //Validate required fields
        if (!password || !comments.trim()) {
            setShowError(true);
            return;
        }

        // Verify password with backend API
        const isValid = await verifyPassword(password);

        if (!isValid) {
            setShowError(true);
            return;
        }

        //  Password is correct! Tell parent component
        onAuthorized({
            password,
            reason,
            comments
        });

        // cleanup
        setPassword("");
        setReason("");
        setComments("");
        setShowError(false);
    };

    // Handler to close popup and show info dialog
    const handlePopupClose = () => {
        setActivePopup(null);
        // Show info dialog after closing popup
        // showInfoDialog("Schedule mode popup closed", "success");
    };
    return (
        <>
            <CustomPopup
                isOpen={isOpen}
                onClose={onClose}
                title={t("Auditpopup.audittrail")}
                content={
                    <div className="flex flex-col gap-4 p-2">
                        {/* Username Field */}
                        <div className="flex flex-col gap-2">
                            <AnimatedInput
                                label="Username"
                                name="username"
                                value="Administrator"
                                required
                                disabled={true}
                                showError={showError}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <AnimatedInput
                                label="Password"
                                name="user_password_secure"
                                type="password"
                                value={password}
                                autoComplete="new-password"
                                required
                                showError={showError}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (showError) setShowError(false);
                                }}
                            />
                        </div>


                        {/* Reason Field */}
                        <div className="flex flex-col gap-2">
                            <AnimatedDropdown
                                label={t("label.reason")}
                                value={reason}
                                options={["Activated", "Deactivated", "Modified", "Reviewed"]}
                                onChange={handleReason}
                                allowFreeInput={true}
                                required={true}
                                disabled={disableReason}
                            />
                        </div>

                        {/* Comments Field */}
                        <div className="flex flex-col gap-2">
                            <AnimatedTextarea
                                label="Comments"
                                name="comments"
                                value={comments}
                                required
                                showError={showError}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-4 py-2 bg-[#2883FE] hover:bg-[#2883FE] text-white text-sm font-semibold rounded transition-colors"
                            >
                                <CheckSquare className="w-4 h-4" /> {t("button.submit")}
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors"
                            >
                                {t("button.close")}
                            </button>
                        </div>
                    </div>
                }
            />
        </>
    )
}

export default AuditTrail
