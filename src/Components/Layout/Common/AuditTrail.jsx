import React, { useState, useRef, useEffect } from 'react'
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
    const [passwordError, setPasswordError] = useState(false);
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();
    const [activePopup, setActivePopup] = useState(null);

    const passwordRef = useRef(null);

    // useEffect(() => {
    //     if (isOpen && passwordRef.current) {
    //         setTimeout(() => {
    //             passwordRef.current.focus();
    //         }, 100);
    //     }
    // }, [isOpen]);

    // UPDATE useEffect to get username from session:
    useEffect(() => {
        if (isOpen) {
            // Get username from session/localStorage/context
            const sessionUsername = sessionStorage.getItem('sUsername') || 'Administrator';
            setUserName(sessionUsername);

            if (passwordRef.current) {
                setTimeout(() => passwordRef.current.focus(), 100);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // const verifyPassword = async (password) => {
    //     try {
    //         const response = await fetch("/api/auth/verify-password", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             credentials: "include", // if session-based auth
    //             body: JSON.stringify({ password }),
    //         });

    //         if (!response.ok) return false;

    //         return true;
    //     } catch (error) {
    //         return false;
    //     }
    // };


    // const verifyPassword = (password) => {
    //     return password === "admin";
    // };

    // REPLACE verifyPassword function with:
    const verifyPassword = async (password) => {
        try {
            const response = await fetch('/User/VerifyPassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sUsername: userName,
                    sPassword: password
                })
            });

            const result = await response.json();
            return result.bValid === true;
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    };




    const handleReason = (value) => {
        const actualValue = value?.target?.value || value?.value || value;
        setReason(actualValue);
    };

    // const handleSubmit = async () => {
    //     //Validate required fields
    //     if (!password || !comments.trim()) {
    //         setShowError(true);
    //         return;
    //     }

    //     // Verify password
    //     const isValid = verifyPassword(password);

    //     if (!isValid) {
    //         setShowError(true);
    //         // Show error message for wrong password
    //         alert("Incorrect password!");
    //         return;
    //     }

    //     //  Password is correct! Tell parent component
    //     onAuthorized({
    //         password,
    //         reason,
    //         comments
    //     });

    //     // cleanup
    //     setPassword("");
    //     setReason(defaultReason);
    //     setComments("");
    //     setShowError(false);
    // };

    // const handleSubmit = async () => {
    //     // Validate required fields
    //     if (!password || !comments.trim()) {
    //         setShowError(true);
    //         return;
    //     }

    //     // Verify password
    //     const isValid = verifyPassword(password);

    //     if (!isValid) {
    //         setShowError(true);
    //         setPasswordError(true);
    //         return;
    //     }

    //     // Get reason number based on reason name
    //     const reasonMap = {
    //         "Activated": 1,
    //         "Deactivated": 2,
    //         "Modified": 3,
    //         "Reviewed": 4,
    //         "Archive Created": 5,
    //         "Archive Opened": 6
    //     };

    //     // Pass formatted object to parent with AuditTrailValues as key
    //     onAuthorized({
    //         AuditTrailValues: {
    //             sUserName: "Administrator",
    //             sUserPassword: password,
    //             sReasonNo: reasonMap[reason] || 1,
    //             sReasonName: reason,
    //             sComments: comments,
    //             sUserDomainName: "SDMS"
    //         }
    //     });

    //     // Cleanup
    //     setPassword("");
    //     setReason(defaultReason);
    //     setComments("");
    //     setShowError(false);
    //     setPasswordError(false);
    // };


    const handleSubmit = async () => {
        if (!password || !comments.trim()) {
            setShowError(true);
            return;
        }

        // Verify password with backend
        const isValid = await verifyPassword(password);

        if (!isValid) {
            setPasswordError(true);
            return;
        }

        // Format audit trail data
        const reasonMap = {
            "Activated": 1,
            "Deactivated": 2,
            "Modified": 3,
            "Reviewed": 4,
            "Archive Created": 5,
            "Archive Opened": 6
        };

        onAuthorized({
            AuditTrailValues: {
                sUserName: userName,
                sUserPassword: password,
                sReasonNo: reasonMap[reason] || 1,
                sReasonName: reason,
                sComments: comments,
                sUserDomainName: sessionStorage.getItem('sDomainName') || 'SDMS'
            }
        });

        // Cleanup
        setPassword("");
        setReason(defaultReason);
        setComments("");
        setShowError(false);
        setPasswordError(false);
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
                        <div className="flex flex-col">
                            <AnimatedInput
                                ref={passwordRef}
                                autoFocus
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
                                    if (passwordError) setPasswordError(false);
                                }}
                            />

                            {passwordError && (
                                <div className="bg-[#D9534F] text-white text-sm font-semibold px-1 -mt-3 -mb-2">
                                    Invalid password..
                                </div>
                            )}
                        </div>


                        {/* Reason Field */}
                        <div className="flex flex-col">
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
