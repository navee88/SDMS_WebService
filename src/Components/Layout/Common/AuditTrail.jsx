import React, { useState, useRef, useEffect } from 'react'
import AnimatedInput from './AnimatedInput';
import AnimatedDropdown from './AnimatedDropdown';
import AnimatedTextarea from './AnimatedTextarea';
import { CheckSquare } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../../Context/LanguageContext';
import CustomPopup from './Popup';
import { CF_decrypt } from '../../Common/encryptiondecryption';

const AuditTrail = ({
    isOpen,
    onClose,
    onAuthorized,
    actionLabel = "Submit",
    defaultReason = "Activated",
    disableReason = false,
    showPasswordError = false
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

    // Get username from session on open
    useEffect(() => {
        if (isOpen) {
            // Get username from session and decrypt
            const encryptedUsername = sessionStorage.getItem('sUsername');
            const decryptedUsername = encryptedUsername
                ? CF_decrypt(encryptedUsername)
                : 'Administrator';
            setUserName(decryptedUsername);

            if (passwordRef.current) {
                setTimeout(() => passwordRef.current.focus(), 100);
            }
        }
    }, [isOpen]);

    // Show password error from parent
    useEffect(() => {
        if (showPasswordError) {
            setPasswordError(true);
        }
    }, [showPasswordError]);

    if (!isOpen) return null;


    // const verifyPassword = (password) => {
    //     return password === "admin";
    // };






    // const handleReason = (value) => {
    //     const actualValue = value?.target?.value || value?.value || value;
    //     setReason(actualValue);
    // };

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


    const handleReason = (value) => {
        const actualValue = value?.target?.value || value?.value || value;
        setReason(actualValue);
    };

    const handleSubmit = async () => {
        if (!password || !comments.trim()) {
            setShowError(true);
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

        // Get and decrypt domain name
        const encryptedDomain = sessionStorage.getItem('sDomainName');
        const decryptedDomain = encryptedDomain ? CF_decrypt(encryptedDomain) : 'SDMS';

        onAuthorized({
            AuditTrailValues: {
                sUserName: userName, // Already decrypted in useEffect
                sUserPassword: password, // Raw password entered by user
                sReasonNo: reasonMap[reason] || 1,
                sReasonName: reason,
                sComments: comments,
                sUserDomainName: decryptedDomain // Decrypted domain
            }
        });

        // Cleanup
        setPassword("");
        setReason(defaultReason);
        setComments("");
        setShowError(false);
        setPasswordError(false);
    };

    // // Handler to close popup and show info dialog
    // const handlePopupClose = () => {
    //     setActivePopup(null);
    //     // Show info dialog after closing popup
    //     // showInfoDialog("Schedule mode popup closed", "success");
    // };
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
                                value={userName}
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
