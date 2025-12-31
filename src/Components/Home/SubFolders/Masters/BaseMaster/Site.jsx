import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronDown, FileText, SquarePen, Plus, Edit, SquareCheckBig } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayoutTest';
import { useLanguage } from '../../../../../Context/LanguageContext';
import { useTranslation } from "react-i18next";
import AuditTrail from '../../../../Layout/Common/AuditTrail';
import CustomPopup from '../../../../Layout/Common/Popup';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';
import AnimatedTextarea from '../../../../Layout/Common/AnimatedTextarea';
import { CF_encrypt, CF_decrypt } from '../../../../../Components/Common/encryptiondecryption';
import useAxios from '../../../../../Services/servicecall';

const UsersPage = ({ onRowClick, userData, setUserData, selectedIndex, selectedRecord, gridRefreshKey }) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const [activePopup, setActivePopup] = useState(null);
    const { t } = useTranslation();

    const mockData = [
        {
            id: 101,
            siteCode: "MU-001",
            siteName: "Kolkata",
            live: true
        },
        {
            id: 10102,
            siteCode: "MU-002",
            siteName: "Chennai",
            live: true
        },
        {
            id: 103,
            siteCode: "MU-003",
            siteName: "Mumbai",
            live: true
        },
        {
            id: 104,
            siteCode: "MU-004",
            siteName: "Bangalore",
            live: true
        },
        {
            id: 105,
            siteCode: "MU-005",
            siteName: "Mumbai",
            live: true
        },
        {
            id: 106,
            siteCode: "MU-006",
            siteName: "Bangalore",
            live: true
        },
        {
            id: 107,
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

    // useEffect(() => {
    //     setLoading(true);
    //     setTimeout(() => {
    //         setUserData(mockData);
    //         setLoading(false);
    //         // Select first record after data is loaded
    //         if (mockData.length > 0 && onRowClick) {
    //             onRowClick(mockData[0]);
    //         }
    //     }, 300);
    // }, []);

    // useEffect(() => {
    //     setLoading(true);
    //     setTimeout(() => {
    //         setUserData(mockData);
    //         setLoading(false);
    //     }, 300);
    // }, []);

    useEffect(() => {
        // Data will be loaded by parent component's fetchSiteData()
        // Just manage loading state based on userData prop
        if (userData.length > 0) {
            setLoading(false);
        }
    }, [userData]);

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
    ], [t]);


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
                // key={gridRefreshKey}
                columns={userColumns}
                data={userData}
                renderDetailPanel={renderUserDetail}
                onRowClick={onRowClick}
                getRowId={(row) => row.siteCode}
                externalSelectedItem={selectedRecord}
            />
        </div>
    );
};


function Site() {
    const { currentLanguage, changeLanguage, languages } = useLanguage();
    const { t } = useTranslation();
    const { postData } = useAxios();
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

    const [validationErrors, setValidationErrors] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const [pendingFormData, setPendingFormData] = useState(null);
    const [userData, setUserData] = useState([]);
    const [passwordError, setPasswordError] = useState(false);
    //state for tracking pending selection
    const [selectedSiteCode, setSelectedSiteCode] = useState(null);
    const [gridRefreshKey, setGridRefreshKey] = useState(0);
    // const selectedRecord = useMemo(() => {
    //     return userData[selectedIndex] || null;
    // }, [userData, selectedIndex]);

    const selectedRecord = useMemo(() => {
        return userData.find(item => item.siteCode.trim() === selectedSiteCode?.trim()) || null;
    }, [userData, selectedSiteCode]);

    // useEffect(() => {
    //     if (selectedSiteCode && userData.length > 0) {
    //         const index = userData.findIndex(
    //             item => item.siteCode === selectedSiteCode
    //         );
    //         if (index !== -1) {
    //             setSelectedIndex(index);
    //         }
    //     } else if (userData.length > 0 && selectedIndex === -1) {
    //         // Select first row on initial load only
    //         setSelectedIndex(0);
    //         setSelectedSiteCode(userData[0].siteCode);
    //     }
    // }, [userData, selectedSiteCode]);

    // useEffect(() => {
    //     if (!userData || userData.length === 0) return;

    //     const trimmedSiteCode = selectedSiteCode?.trim();
    //     const index = userData.findIndex(item => item.siteCode.trim() === trimmedSiteCode);

    //     if (index !== -1) {
    //         setSelectedIndex(index);
    //     } else if (userData.length > 0) {
    //         setSelectedIndex(0);
    //         setSelectedSiteCode(userData[0].siteCode);
    //     }
    // }, [userData, selectedSiteCode]);
    useEffect(() => {
        if (!userData || userData.length === 0) return;

        // If we have a selected site code, find and select it
        if (selectedSiteCode) {
            const trimmedSiteCode = selectedSiteCode.trim();
            const index = userData.findIndex(item => item.siteCode.trim() === trimmedSiteCode);

            if (index !== -1) {
                setSelectedIndex(index);
                return; // CRITICAL: Exit early
            }
        }

        // ONLY select first row on initial load (no selection exists)
        if (!selectedSiteCode && userData.length > 0) {
            setSelectedIndex(0);
            setSelectedSiteCode(userData[0].siteCode);
        }
    }, [userData, selectedSiteCode]);



    const handleAddClick = () => {
        setActivePopup("Add Site"); // Change from setShowAddPopUp
        setFormData({}); // Reset form
    };

    // const handleEditClick = () => {
    //     if (selectedRecord) {
    //         setActivePopup("Edit Site");
    //         setFormData({
    //             siteCode: selectedRecord.siteCode,
    //             siteName: selectedRecord.siteName,
    //             siteAddress: selectedRecord.siteAddress || '',
    //             contactPerson: selectedRecord.contactPerson || '',
    //             mobileNo: selectedRecord.mobileNo || '',
    //             faxNo: selectedRecord.faxNo || '',
    //             email: selectedRecord.email || ''
    //         });
    //     }
    // };



    const handleEditClick = async () => {
        if (!selectedRecord) {
            alert("Please select a record to edit");
            return;
        }

        try {
            // Get user details from session
            const encryptedUserID = sessionStorage.getItem('sUserID');
            const encryptedSiteCode = sessionStorage.getItem('sSiteCode');

            const payload = {
                objdat: {
                    sSitecode: selectedRecord.siteCode,
                    sSitename: selectedRecord.siteName
                }
            };

            console.log("Edit Load Payload:", payload);

            // Call backend to get full site details
            const result = await postData('basemaster/SiteEditLoad', payload);

            console.log("Edit Load Result:", result);

            // Backend returns array, get first item
            const siteDetails = result.oResObj?.[0] || result[0] || {};

            // Pre-fill form with loaded data
            setFormData({
                siteCode: siteDetails.L85SiteCode?.trim() || selectedRecord.siteCode,
                siteName: siteDetails.L85SiteName || selectedRecord.siteName,
                siteAddress: siteDetails.L85SiteAddress || '',
                contactPerson: siteDetails.L85ContactPerson || '',
                mobileNo: siteDetails.L85PhoneNo || '',
                faxNo: siteDetails.L85FaxNo || '',
                email: siteDetails.L85Email || ''
            });

            // Show edit popup
            setActivePopup("Edit Site");

        } catch (error) {
            console.error('Error loading site details:', error);
            alert('Failed to load site details');
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

    // const handlePopupSubmit = () => {
    //     // Validate required fields
    //     const errors = {};
    //     if (!formData.siteCode || formData.siteCode.trim() === '') {
    //         errors.siteCode = true;
    //     }
    //     if (!formData.siteName || formData.siteName.trim() === '') {
    //         errors.siteName = true;
    //     }

    //     if (Object.keys(errors).length > 0) {
    //         setValidationErrors(errors);
    //         return;
    //     }

    //     // Store form data and show audit trail
    //     setPendingFormData(formData);
    //     setShowAuditTrail(true);
    // };


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

        // ADD SITE - Direct backend call without audit trail
        if (activePopup === "Add Site") {
            handleDirectSave(formData, "false");
            return;
        }

        // EDIT SITE - Show audit trail first
        if (activePopup === "Edit Site") {
            setPendingFormData(formData);
            setShowAuditTrail(true);
        }
    };

    // const handleDirectSave = async (siteData, addEditStatus) => {
    //     const payload = {
    //         sSitename: siteData.siteName,
    //         sSitecode: siteData.siteCode,
    //         sSiteaddress: siteData.siteAddress || '',
    //         sContactperson: siteData.contactPerson || '',
    //         sMobileno: siteData.mobileNo || '',
    //         sFaxno: siteData.faxNo || '',
    //         sEmail: siteData.email || '',
    //         sStatus: 1,
    //         addeditstatus: addEditStatus
    //     };

    //     try {
    //         console.log("ADD Site Payload:", payload); // Debug log

    //         // Use postData from useAxios (already handles encryption)
    //         const result = await postData('Login/SitecodeSubmit', payload);

    //         console.log("ADD Site Result:", result); // Debug log

    //         if (result.rtnmsg === "Success" || result.rtnmsg === "Site created successfully") {
    //             await fetchSiteData();
    //             setActivePopup(null);
    //             setValidationErrors({});
    //             setFormData({});
    //         } else {
    //             alert(result.rtnmsg || 'Failed to save site');
    //         }
    //     } catch (error) {
    //         console.error('Error saving site:', error);
    //         alert('Failed to save site. Please check console for details.');
    //     }
    // };

    const handleDirectSave = async (siteData, addEditStatus) => {
        // Get user details from session
        const encryptedUserID = sessionStorage.getItem('sUserID');
        const encryptedSiteCode = sessionStorage.getItem('sSiteCode');
        const encryptedTenantID = sessionStorage.getItem('sTenantID');
        const encryptedUsername = sessionStorage.getItem('sUsername');
        const encryptedDomain = sessionStorage.getItem('sDomainName');
        const encryptedCategories = sessionStorage.getItem('sCategories');
        const encryptedUserGroup = sessionStorage.getItem('sUserGroupID');
        const encryptedSessionID = sessionStorage.getItem('sSessionID');
        const encryptedTimeZone = sessionStorage.getItem('sTimeZoneID');
        const encryptedDBType = sessionStorage.getItem('sdbtype');

        const payload = {
            sSitename: siteData.siteName,
            sSitecode: siteData.siteCode,
            sSiteaddress: siteData.siteAddress || '',
            sContactperson: siteData.contactPerson || '',
            sMobileno: siteData.mobileNo || '',
            sFaxno: siteData.faxNo || '',
            sEmail: siteData.email || '',
            sStatus: 1,
            addeditstatus: addEditStatus,
            appname: "SDMS",
            ApplicationCode: "SDMS",
            ActiveUserDetails: {
                sUserID: encryptedUserID ? CF_decrypt(encryptedUserID) : '',
                sSiteCode: encryptedSiteCode ? CF_decrypt(encryptedSiteCode) : '',
                sTenantID: encryptedTenantID ? CF_decrypt(encryptedTenantID) : '',
                sUsername: encryptedUsername ? CF_decrypt(encryptedUsername) : '',
                sUserDomainName: encryptedDomain ? CF_decrypt(encryptedDomain) : '',
                sCategories: encryptedCategories ? CF_decrypt(encryptedCategories) : '',
                sUserGroupID: encryptedUserGroup ? CF_decrypt(encryptedUserGroup) : '',
                sSessionID: encryptedSessionID ? CF_decrypt(encryptedSessionID) : '',
                sTimeZoneID: encryptedTimeZone ? CF_decrypt(encryptedTimeZone) : '',
                sdbtype: encryptedDBType ? CF_decrypt(encryptedDBType) : '',
                sApplicationName: "SDMS",
                sUserStatus: ""
            }
        };

        try {
            console.log("ADD Site Payload:", payload);
            const result = await postData('Login/SitecodeSubmit', payload);
            console.log("ADD Site Result:", result);

            if (result.rtnmsg === "Success") {
                await fetchSiteData();
                setActivePopup(null);
                setValidationErrors({});
                setFormData({});
            } else {
                alert(result.rtnmsg || 'Failed to save site');
            }
        } catch (error) {
            console.error('Error saving site:', error);
            alert('Failed to save site. Please check console for details.');
        }
    };


    const handlePopupReset = () => {
        if (activePopup === "Edit Site" && selectedRecord) {
            // Reset to original values (keep siteCode)
            setFormData({
                siteCode: selectedRecord.siteCode,
                siteName: '',
                siteAddress: '',
                contactPerson: '',
                mobileNo: '',
                faxNo: '',
                email: ''
            });
        } else {
            // For Add Site clear everything
            setFormData({
                siteCode: '',
                siteName: '',
                siteAddress: '',
                contactPerson: '',
                mobileNo: '',
                faxNo: '',
                email: ''
            });
        }

        // Clear validation errors also
        setValidationErrors({});
    };






    // const handleRowClick = (record) => {
    //     const index = userData.findIndex(
    //         item => item.siteCode === record.siteCode
    //     );

    //     if (index !== -1) {
    //         setSelectedIndex(index);
    //         setSelectedSiteCode(record.siteCode);
    //     }
    // };

    const handleRowClick = (record) => {
        const index = userData.findIndex(
            item => item.siteCode === record.siteCode
        );

        if (index !== -1) {
            setSelectedIndex(index);
            setSelectedSiteCode(record.siteCode); // This triggers selectedRecord update
        }
    };

    // const handleAuditAuthorized = async (auditData) => {
    //     console.log("Audit Data:", auditData);
    //     console.log("Form Data to Save:", pendingFormData);

    //     const encryptedUserID = sessionStorage.getItem('sUserID');
    //     const encryptedSiteCode = sessionStorage.getItem('sSiteCode');
    //     const encryptedTenantID = sessionStorage.getItem('sTenantID');
    //     const encryptedUsername = sessionStorage.getItem('sUsername');
    //     const encryptedDomain = sessionStorage.getItem('sDomainName');
    //     const encryptedCategories = sessionStorage.getItem('sCategories');
    //     const encryptedUserGroup = sessionStorage.getItem('sUserGroupID');
    //     const encryptedSessionID = sessionStorage.getItem('sSessionID');
    //     const encryptedTimeZone = sessionStorage.getItem('sTimeZoneID');
    //     const encryptedDBType = sessionStorage.getItem('sdbtype');

    //     const payload = {
    //         sSitename: pendingFormData.siteName,
    //         sSitecode: pendingFormData.siteCode,
    //         sSiteaddress: pendingFormData.siteAddress || '',
    //         sContactperson: pendingFormData.contactPerson || '',
    //         sMobileno: pendingFormData.mobileNo || '',
    //         sFaxno: pendingFormData.faxNo || '',
    //         sEmail: pendingFormData.email || '',
    //         sStatus: 1,
    //         addeditstatus: "true",
    //         appname: "SDMS",
    //         ApplicationCode: "SDMS",
    //         AuditTrailValues: auditData.AuditTrailValues,
    //         ActiveUserDetails: {
    //             sUserID: encryptedUserID ? CF_decrypt(encryptedUserID) : '',
    //             sSiteCode: encryptedSiteCode ? CF_decrypt(encryptedSiteCode) : '',
    //             sTenantID: encryptedTenantID ? CF_decrypt(encryptedTenantID) : '',
    //             sUsername: encryptedUsername ? CF_decrypt(encryptedUsername) : '',
    //             sUserDomainName: encryptedDomain ? CF_decrypt(encryptedDomain) : '',
    //             sCategories: encryptedCategories ? CF_decrypt(encryptedCategories) : '',
    //             sUserGroupID: encryptedUserGroup ? CF_decrypt(encryptedUserGroup) : '',
    //             sSessionID: encryptedSessionID ? CF_decrypt(encryptedSessionID) : '',
    //             sTimeZoneID: encryptedTimeZone ? CF_decrypt(encryptedTimeZone) : '',
    //             sdbtype: encryptedDBType ? CF_decrypt(encryptedDBType) : '',
    //             sApplicationName: "SDMS",
    //             sUserStatus: ""
    //         }
    //     };

    //     try {
    //         console.log("EDIT Site Payload:", payload);
    //         const result = await postData('Login/SitecodeSubmit', payload);
    //         console.log("EDIT Site Result:", result);

    //         if (result.AuditTrailLogin === false) {
    //             setPasswordError(true);
    //             return;
    //         }

    //         if (result.rtnmsg === "Success" || result.rtnmsg === "Site updated successfully") {
    //             // Store which row to reselect
    //             //setSelectedSiteCode(selectedRecord.siteCode);
    //             // setSelectedSiteCode(pendingFormData.siteCode);


    //             // // Fetch fresh data from backend
    //             // await fetchSiteData();

    //             // 1. Remember selection
    //             setSelectedSiteCode(pendingFormData.siteCode);

    //             // 2. UPDATE UI INSTANTLY (optimistic update)
    //             setUserData(prev =>
    //                 prev.map(item =>
    //                     item.siteCode.trim() === pendingFormData.siteCode.trim()
    //                         ? { ...item, ...pendingFormData }
    //                         : item
    //                 )
    //             );

    //             setGridRefreshKey(prev => prev + 1);

    //             // 3. Fetch fresh data in background (sync with backend)
    //             setTimeout(() => {
    //                 fetchSiteData().catch(err => {
    //                     console.error("Background refresh failed", err);
    //                 });
    //             }, 300);


    //             // Force grid to remount and show new data
    //             // setGridRefreshKey(prev => prev + 1);

    //             // Clean up
    //             setShowAuditTrail(false);
    //             setActivePopup(null);
    //             setValidationErrors({});
    //             setPendingFormData(null);
    //             setPasswordError(false);
    //         } else {
    //             alert(result.rtnmsg || 'Failed to update site');
    //         }
    //     } catch (error) {
    //         console.error('Error updating site:', error);
    //         alert('Failed to update site. Please try again.');
    //     }
    // };


    const handleAuditAuthorized = async (auditData) => {
        console.log("Audit Data:", auditData);
        console.log("Form Data to Save:", pendingFormData);

        const encryptedUserID = sessionStorage.getItem('sUserID');
        const encryptedSiteCode = sessionStorage.getItem('sSiteCode');
        const encryptedTenantID = sessionStorage.getItem('sTenantID');
        const encryptedUsername = sessionStorage.getItem('sUsername');
        const encryptedDomain = sessionStorage.getItem('sDomainName');
        const encryptedCategories = sessionStorage.getItem('sCategories');
        const encryptedUserGroup = sessionStorage.getItem('sUserGroupID');
        const encryptedSessionID = sessionStorage.getItem('sSessionID');
        const encryptedTimeZone = sessionStorage.getItem('sTimeZoneID');
        const encryptedDBType = sessionStorage.getItem('sdbtype');

        const payload = {
            sSitename: pendingFormData.siteName,
            sSitecode: pendingFormData.siteCode,
            sSiteaddress: pendingFormData.siteAddress || '',
            sContactperson: pendingFormData.contactPerson || '',
            sMobileno: pendingFormData.mobileNo || '',
            sFaxno: pendingFormData.faxNo || '',
            sEmail: pendingFormData.email || '',
            sStatus: 1,
            addeditstatus: "true",
            appname: "SDMS",
            ApplicationCode: "SDMS",
            AuditTrailValues: auditData.AuditTrailValues,
            ActiveUserDetails: {
                sUserID: encryptedUserID ? CF_decrypt(encryptedUserID) : '',
                sSiteCode: encryptedSiteCode ? CF_decrypt(encryptedSiteCode) : '',
                sTenantID: encryptedTenantID ? CF_decrypt(encryptedTenantID) : '',
                sUsername: encryptedUsername ? CF_decrypt(encryptedUsername) : '',
                sUserDomainName: encryptedDomain ? CF_decrypt(encryptedDomain) : '',
                sCategories: encryptedCategories ? CF_decrypt(encryptedCategories) : '',
                sUserGroupID: encryptedUserGroup ? CF_decrypt(encryptedUserGroup) : '',
                sSessionID: encryptedSessionID ? CF_decrypt(encryptedSessionID) : '',
                sTimeZoneID: encryptedTimeZone ? CF_decrypt(encryptedTimeZone) : '',
                sdbtype: encryptedDBType ? CF_decrypt(encryptedDBType) : '',
                sApplicationName: "SDMS",
                sUserStatus: ""
            }
        };

        try {
            console.log("EDIT Site Payload:", payload);
            const result = await postData('Login/SitecodeSubmit', payload);
            console.log("EDIT Site Result:", result);

            if (result.AuditTrailLogin === false) {
                setPasswordError(true);
                return;
            }

            if (result.rtnmsg === "Success" || result.rtnmsg === "Site updated successfully") {
                // 1. Remember which site code to keep selected
                const editedSiteCode = pendingFormData.siteCode.trim();

                // 2. Update UI immediately with new data
                setUserData(prev =>
                    prev.map(item =>
                        item.siteCode.trim() === editedSiteCode
                            ? {
                                id: item.siteCode.trim(),
                                siteCode: item.siteCode.trim(),
                                siteName: pendingFormData.siteName?.trim() || item.siteName,
                                siteAddress: pendingFormData.siteAddress?.trim() || '',
                                contactPerson: pendingFormData.contactPerson?.trim() || '',
                                mobileNo: pendingFormData.mobileNo?.trim() || '',
                                faxNo: pendingFormData.faxNo?.trim() || '',
                                email: pendingFormData.email?.trim() || '',
                                live: item.live
                            }
                            : item
                    )
                );

                // 3. Force grid to remount (triggers UI update)
                setGridRefreshKey(prev => prev + 1);

                // 4. Keep selection - the useRef in GridLayout will restore it after remount
                setSelectedSiteCode(editedSiteCode);

                // 5. Close popups
                setShowAuditTrail(false);
                setActivePopup(null);
                setValidationErrors({});
                setPendingFormData(null);
                setPasswordError(false);

            } else {
                alert(result.rtnmsg || 'Failed to update site');
            }
        } catch (error) {
            console.error('Error updating site:', error);
            alert('Failed to update site. Please try again.');
        }
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

    // const fetchSiteData = async () => {
    //     try {
    //         // Get and decrypt session values
    //         const encryptedUserID = sessionStorage.getItem('sUserID');
    //         const encryptedSiteCode = sessionStorage.getItem('sSiteCode');
    //         const encryptedTenantID = sessionStorage.getItem('sTenantID');
    //         const encryptedUsername = sessionStorage.getItem('sUsername');
    //         const encryptedDomain = sessionStorage.getItem('sDomainName');
    //         const encryptedCategories = sessionStorage.getItem('sCategories');
    //         const encryptedUserGroup = sessionStorage.getItem('sUserGroupID');
    //         const encryptedSessionID = sessionStorage.getItem('sSessionID');
    //         const encryptedTimeZone = sessionStorage.getItem('sTimeZoneID');
    //         const encryptedDBType = sessionStorage.getItem('sdbtype');

    //         const payload = {
    //             sActionType: "View",
    //             sUserID: encryptedUserID ? CF_decrypt(encryptedUserID) : '',
    //             sSiteCode: encryptedSiteCode ? CF_decrypt(encryptedSiteCode) : '',
    //             ApplicationCode: "SDMS",
    //             ActiveUserDetails: {
    //                 sUserID: encryptedUserID ? CF_decrypt(encryptedUserID) : '',
    //                 sSiteCode: encryptedSiteCode ? CF_decrypt(encryptedSiteCode) : '',
    //                 sTenantID: encryptedTenantID ? CF_decrypt(encryptedTenantID) : '',
    //                 sUsername: encryptedUsername ? CF_decrypt(encryptedUsername) : '',
    //                 sUserDomainName: encryptedDomain ? CF_decrypt(encryptedDomain) : '',
    //                 sCategories: encryptedCategories ? CF_decrypt(encryptedCategories) : '',
    //                 sUserGroupID: encryptedUserGroup ? CF_decrypt(encryptedUserGroup) : '',
    //                 sSessionID: encryptedSessionID ? CF_decrypt(encryptedSessionID) : '',
    //                 sTimeZoneID: encryptedTimeZone ? CF_decrypt(encryptedTimeZone) : '',
    //                 sdbtype: encryptedDBType ? CF_decrypt(encryptedDBType) : '',
    //                 sApplicationName: "SDMS",
    //                 sUserStatus: ""
    //             }
    //         };

    //         console.log("Fetch Sites Payload:", payload);

    //         // Use postData from useAxios (already handles encryption)
    //         const result = await postData('basemaster/getSitemasterDetails', payload);

    //         console.log("Fetch Sites Result:", result);

    //         // Backend returns array directly with L85* field names
    //         // Map to frontend format
    //         const mappedData = (result || []).map(item => ({
    //             id: item.L85SiteCode?.trim() || Math.random(),
    //             siteCode: item.L85SiteCode?.trim() || '',
    //             siteName: item.L85SiteName || '',
    //             siteAddress: item.L85SiteAddress || '',
    //             contactPerson: item.L85ContactPerson || '',
    //             mobileNo: item.L85PhoneNo || '',
    //             faxNo: item.L85FaxNo || '',
    //             email: item.L85Email || ''
    //         }));

    //         console.log("Mapped Data:", mappedData);

    //         setUserData(mappedData);
    //     } catch (error) {
    //         console.error('Error fetching sites:', error);
    //     }
    // };

    const fetchSiteData = async () => {
        try {
            const encryptedUserID = sessionStorage.getItem('sUserID');
            const encryptedSiteCode = sessionStorage.getItem('sSiteCode');
            const encryptedTenantID = sessionStorage.getItem('sTenantID');
            const encryptedUsername = sessionStorage.getItem('sUsername');
            const encryptedDomain = sessionStorage.getItem('sDomainName');
            const encryptedCategories = sessionStorage.getItem('sCategories');
            const encryptedUserGroup = sessionStorage.getItem('sUserGroupID');
            const encryptedSessionID = sessionStorage.getItem('sSessionID');
            const encryptedTimeZone = sessionStorage.getItem('sTimeZoneID');
            const encryptedDBType = sessionStorage.getItem('sdbtype');

            const payload = {
                sActionType: "View",
                sUserID: encryptedUserID ? CF_decrypt(encryptedUserID) : '',
                sSiteCode: encryptedSiteCode ? CF_decrypt(encryptedSiteCode) : '',
                ApplicationCode: "SDMS",
                ActiveUserDetails: {
                    sUserID: encryptedUserID ? CF_decrypt(encryptedUserID) : '',
                    sSiteCode: encryptedSiteCode ? CF_decrypt(encryptedSiteCode) : '',
                    sTenantID: encryptedTenantID ? CF_decrypt(encryptedTenantID) : '',
                    sUsername: encryptedUsername ? CF_decrypt(encryptedUsername) : '',
                    sUserDomainName: encryptedDomain ? CF_decrypt(encryptedDomain) : '',
                    sCategories: encryptedCategories ? CF_decrypt(encryptedCategories) : '',
                    sUserGroupID: encryptedUserGroup ? CF_decrypt(encryptedUserGroup) : '',
                    sSessionID: encryptedSessionID ? CF_decrypt(encryptedSessionID) : '',
                    sTimeZoneID: encryptedTimeZone ? CF_decrypt(encryptedTimeZone) : '',
                    sdbtype: encryptedDBType ? CF_decrypt(encryptedDBType) : '',
                    sApplicationName: "SDMS",
                    sUserStatus: ""
                }
            };

            console.log("Fetch Sites Payload:", payload);

            const result = await postData('basemaster/getSitemasterDetails', payload);

            console.log("Fetch Sites Result:", result);

            // Create fresh mapped data with unique timestamp to ensure new reference
            const mappedData = (result || []).map((item, index) => ({
                id: item.L85SiteCode.trim(), // STABLE ID
                siteCode: item.L85SiteCode?.trim() || '',
                siteName: item.L85SiteName?.trim() || '',
                siteAddress: item.L85SiteAddress?.trim() || '',
                contactPerson: item.L85ContactPerson?.trim() || '',
                mobileNo: item.L85PhoneNo?.trim() || '',
                faxNo: item.L85FaxNo?.trim() || '',
                email: item.L85Email?.trim() || ''
            }));

            console.log("Mapped Data:", mappedData);

            // Set new array (this triggers React re-render)
            setUserData(mappedData);

        } catch (error) {
            console.error('Error fetching sites:', error);
        }
    };

    // Call this in useEffect
    useEffect(() => {
        fetchSiteData();
    }, []);


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
                        onClick={handlePopupReset}
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
                        onClick={handlePopupReset}
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
                <UsersPage gridRefreshKey={gridRefreshKey} onRowClick={handleRowClick} userData={userData} setUserData={setUserData} selectedIndex={selectedIndex} getRowId={(row) => row.siteCode} />
            </div>

            {/* CustomPopup */}
            <CustomPopup
                isOpen={!!activePopup}
                onClose={handlePopupClose}
                title={activePopup || ""}
                content={activePopup ? POPUP_CONTENTS[activePopup] : null}
            />

            {/* AuditTrail Popup */}
            {/* <AuditTrail
                isOpen={showAuditTrail}
                onClose={() => setShowAuditTrail(false)}
                onAuthorized={handleAuditAuthorized}
                actionLabel="Submit"
            /> */}

            <AuditTrail
                isOpen={showAuditTrail}
                onClose={() => {
                    setShowAuditTrail(false);
                    setPasswordError(false);
                }}
                onAuthorized={handleAuditAuthorized}
                actionLabel="Submit"
                showPasswordError={passwordError}
            />
        </div>
    );

}

export default Site