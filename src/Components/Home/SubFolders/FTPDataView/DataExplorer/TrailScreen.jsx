import React, { useState, useRef, useEffect, useMemo } from 'react'
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import AnimatedTextarea from '../../../../Layout/Common/AnimatedTextarea';
import { CheckSquare } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../../../../Context/LanguageContext';
import CustomPopup from './PopupModal'; 
import { CF_decrypt } from '../../../../Common/encryptiondecryption';
import useAxios from '../../../../../Services/servicecall';

const TrailScreen = ({
    // Standard Modal Props (Matching ServerConfiguration)
    isOpen,
    onClose,
    width = "600px",
    showCloseButton = true,
    closeOnOverlayClick = true,
    title, // Optional override for the title

    // Logic Props
    onAuthorized,
    isLoading = false, // New: To handle mutation state from parent
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
    const [reasons, setReasons] = useState([]);
    const [loadingReasons, setLoadingReasons] = useState(false);
    const { postData } = useAxios();

    const passwordRef = useRef(null);

    const reasonOptions = useMemo(() => {
        return reasons.map(r => ({
            label: r.sComments,
            value: r.sComments,
            reasonNo: r.sSerialNo
        }));
    }, [reasons]);

    // Get username from session on open
    useEffect(() => {
        if (isOpen) {
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

    const fetchReasons = async () => {
        setLoadingReasons(true);
        try {
            const payload = {
                ActiveUserDetails: JSON.parse(sessionStorage.getItem("ActiveUserDetails") || "{}"),
                ApplicationCode: "SDMS"
            };

            const response = await postData("TrailScreen/getCFRReasons", payload);

            if (response?.Reasons) {
                setReasons(response.Reasons);
            }

        } catch (err) {
            console.error("Failed to fetch CFR reasons", err);
        } finally {
            setLoadingReasons(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchReasons();
        }
    }, [isOpen]);

    // Show password error from parent
    useEffect(() => {
        if (showPasswordError) {
            setPasswordError(true);
        }
    }, [showPasswordError]);

    useEffect(() => {
        if (!isOpen) {
            setPassword("");
            setComments("");
            setReason(defaultReason);
            setShowError(false);
            setPasswordError(false);
        }
    }, [isOpen, defaultReason]);

    if (!isOpen) return null;

    const handleReason = (value) => {
        const actualValue = value?.target?.value || value?.value || value;
        setReason(actualValue);
    };

    const handleSubmit = async () => {
        if (!password || !comments.trim()) {
            setShowError(true);
            return;
        }

        const selectedReason = reasons.find(r => r.sComments === reason);
        const encryptedDomain = sessionStorage.getItem('sDomainName');
        const decryptedDomain = encryptedDomain ? CF_decrypt(encryptedDomain) : 'SDMS';

        const auditPayload = {
            TrailScreenValues: {
                sUserName: userName,
                sUserPassword: password,
                sReasonNo: selectedReason?.sSerialNo,
                sReasonName: selectedReason?.sComments,
                sComments: comments,
                sUserDomainName: decryptedDomain
            }
        };

        onAuthorized(auditPayload);
    };

    const isSubmitting = isLoading || loadingReasons;

    return (
        <CustomPopup
            isOpen={isOpen}
            onClose={onClose}
            title={title || t("Auditpopup.audittrail")} // Use prop title if provided, else default
            width={width} // Pass dynamic width
            showCloseButton={showCloseButton} // Pass dynamic close button
            closeOnOverlayClick={closeOnOverlayClick} // Pass dynamic overlay click
            content={
                <div className="flex flex-col gap-4 p-2">
                    {/* Username Field */}
                    <div className="flex flex-col gap-2">
                        <AnimatedInput
                            label="Username"
                            name="username"
                            value={userName}
                            required
                            disabled={true} // Always disabled as per logic
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
                            disabled={isSubmitting} // Disable on loading
                            showError={showError}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (showError) setShowError(false);
                                if (passwordError) setPasswordError(false);
                            }}
                        />
                        {passwordError && (
                            <div className="bg-[#D9534F] text-white text-sm font-semibold px-1 -mt-3 -mb-2 rounded-sm">
                                Invalid password..
                            </div>
                        )}
                    </div>

                    {/* Reason Field */}
                    <div className="flex flex-col">
                        {loadingReasons ? (
                            <div className="text-sm text-gray-500 p-2 animate-pulse">Loading reasons...</div>
                        ) : (
                            <AnimatedDropdown
                                label={t("label.reason")}
                                value={reason}
                                options={reasonOptions.map(r => r.label)}
                                onChange={handleReason}
                                allowFreeInput={true}
                                required={true}
                                disabled={disableReason || isSubmitting} // Disable on loading
                            />
                        )}
                    </div>

                    {/* Comments Field */}
                    <div className="flex flex-col gap-2">
                        <AnimatedTextarea
                            label="Comments"
                            name="comments"
                            value={comments}
                            required
                            showError={showError}
                            disabled={isSubmitting} // Disable on loading
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-200">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2883FE] hover:bg-[#2070e0] disabled:bg-gray-400 text-white text-sm font-semibold rounded transition-colors"
                        >
                            <CheckSquare className="w-4 h-4" /> 
                            {isSubmitting ? "Processing..." : (actionLabel || t("button.submit"))}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-semibold rounded transition-colors"
                        >
                            {t("button.closed")}
                        </button>
                    </div>
                </div>
            }
        />
    )
}

export default TrailScreen
