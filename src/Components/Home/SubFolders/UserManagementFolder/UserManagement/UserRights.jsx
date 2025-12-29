import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Save, Printer } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';

const UserRights = () => {
    const [userGroups, setUserGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [rightsData, setRightsData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });
    const [selectAll, setSelectAll] = useState(false);
    const [createAll, setCreateAll] = useState(false);
    const [editAll, setEditAll] = useState(false);
    const [deleteAll, setDeleteAll] = useState(false);
    const [allowAll, setAllowAll] = useState(false);
    const { t } = useTranslation();
    
    const { postData } = servicecall();
    const isInitialMount = useRef(true);

    const showInfoDialog = useCallback((message, type = "information") => {
        setInfoDialog({
            open: true,
            message,
            type
        });
    }, []);

    const closeInfoDialog = useCallback(() => {
        setInfoDialog(prev => ({ ...prev, open: false }));
    }, []);

    const updateCheckboxStates = useCallback((data) => {
        if (!data || data.length === 0) {
            setCreateAll(false);
            setEditAll(false);
            setDeleteAll(false);
            setAllowAll(false);
            setSelectAll(false);
            return;
        }
        
        const allCreateChecked = data.every(item => item.sCreate === "NA" || item.sCreate === "1");
        const allEditChecked = data.every(item => item.sEdit === "NA" || item.sEdit === "1");
        const allDeleteChecked = data.every(item => item.sDelete === "NA" || item.sDelete === "1");
        const allAllowChecked = data.every(item => item.sAllow === "1");
        const allChecked = data.every(item => 
            (item.sCreate === "NA" || item.sCreate === "1") &&
            (item.sEdit === "NA" || item.sEdit === "1") &&
            (item.sDelete === "NA" || item.sDelete === "1") &&
            item.sAllow === "1"
        );
        
        setCreateAll(allCreateChecked);
        setEditAll(allEditChecked);
        setDeleteAll(allDeleteChecked);
        setAllowAll(allAllowChecked);
        setSelectAll(allChecked);
    }, []);

    const getActiveUserDetails = useCallback(() => {
        const getDecryptedValue = (key) => {
            try {
                const encryptedValue = sessionStorage.getItem(key);
                if (!encryptedValue) return "";
                
                if (encryptedValue.length > 50 && encryptedValue.includes('==')) {
                    return CF_decrypt(encryptedValue);
                }
                return encryptedValue;
            } catch (error) {
                console.error(`Error decrypting ${key}:`, error);
                return "";
            }
        };

        const sUsername = getDecryptedValue("sUsername");
        const sSiteCode = getDecryptedValue("sSiteCode") || "CH-7310   ";
        const sUserGroupID = getDecryptedValue("sUserGroupID") || "G1        ";
        const sUserID = getDecryptedValue("sUserID") || "U1";
        const sSessionID = getDecryptedValue("sSessionID");
        const sDomainName = getDecryptedValue("sDomainName") || "SDMS";
        const sTimeZoneID = getDecryptedValue("sTimeZoneID") || "Asia/Kolkata<~>true";
        const sdbtype = getDecryptedValue("sdbtype") || "MSSQL";
        const sCategories = getDecryptedValue("sCategories") || "DB";
        const sUserStatus = getDecryptedValue("sUserStatus") || "";
        const sTenantID = getDecryptedValue("sTenantID") || "";

        return {
            sUserDomainName: sDomainName,
            sSessionID: sSessionID || "",
            sUserID: sUserID,
            sTimeZoneID: sTimeZoneID,
            sApplicationName: "SDMS",
            sdbtype: sdbtype,
            sUsername: sUsername || "Administrator",
            sSiteCode: sSiteCode.padEnd(10, ' ').substring(0, 10),
            sCategories: sCategories,
            sUserGroupID: sUserGroupID.padEnd(10, ' ').substring(0, 10),
            sUserStatus: sUserStatus,
            sTenantID: sTenantID
        };
    }, []);

    const fetchUserRights = useCallback(async (groupID) => {
        if (!groupID) return;
        
        setLoading(true);
        try {
            const passObjDet = {
                sUserGroupFilterID: groupID.padEnd(10, ' ').substring(0, 10).trim(),
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            const response = await postData("User/UserRightsGrid", passObjDet);
            
            if (!response) {
                setRightsData([]);
                setFilteredData([]);
                showInfoDialog(t('usermanagement.failedtofetchuserrights') || 'Failed to fetch user rights', "error");
                return;
            }
            
            let data = response;
            if (typeof response === 'string' && response.length > 50) {
                try {
                    const decrypted = CF_decrypt(response);
                    data = JSON.parse(decrypted);
                } catch (decryptError) {
                    console.error('Failed to decrypt response:', decryptError);
                }
            }
            
            if (data && data.oResObj) {
                data = data.oResObj;
            }
            
            const filteredData = Array.isArray(data) ? data.filter(item => {
                const excludedModules = [
                    "Empower Data Explorer", 
                    "Empower Backup & Restore", 
                    "Connection Settings", 
                    "Database", 
                    "Services", 
                    "InterFacer", 
                    "LogiLAB ELN", 
                    "ELN Data Explorer"
                ];
                
                if (excludedModules.includes(item.sModuleName?.trim())) {
                    return false;
                }
                
                if (item.sModuleName?.trim() === "Data Explorer") {
                    const excludedTasks = ["Check In", "Check Out", "Property", "Copy Link"];
                    return !excludedTasks.includes(item.sDisplayTopic?.trim());
                }
                
                if (item.sModuleName?.trim() === "Workflow") {
                    return item.sDisplayTopic?.trim() !== "Workflow Creation";
                }
                
                if (item.sModuleName?.trim() === "InterFacer") {
                    return false;
                }
                
                return true;
            }) : [];
            
            const dataWithIds = Array.isArray(filteredData) ? filteredData.map((item, index) => ({
                ...item,
                id: `${groupID}-${index}`
            })) : [];
            
            setRightsData(dataWithIds);
            setFilteredData(dataWithIds);
            updateCheckboxStates(dataWithIds);
        } catch (error) {
            console.error('Error fetching rights:', error);
            showInfoDialog(t('usermanagement.failedtofetchuserrights') || 'Failed to fetch user rights', "error");
        } finally {
            setLoading(false);
        }
    }, [postData, showInfoDialog, t, updateCheckboxStates, getActiveUserDetails]);

    const fetchUserGroups = useCallback(async () => {
        setLoading(true);
        try {
            const passObjDet = {
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            const response = await postData("User/UserRightsCombo", passObjDet);
            
            if (!response) {
                setUserGroups([]);
                showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups', "error");
                return;
            }
            
            let groupsData = response;
            if (typeof response === 'string' && response.length > 50) {
                try {
                    const decrypted = CF_decrypt(response);
                    groupsData = JSON.parse(decrypted);
                } catch (decryptError) {
                    console.error('Failed to decrypt response:', decryptError);
                }
            }
            
            if (groupsData && groupsData.oResObj) {
                groupsData = groupsData.oResObj;
            }
            
            if (!Array.isArray(groupsData)) {
                groupsData = [];
            }
            
            if (groupsData.length > 0) {
                const formattedGroups = groupsData.map((group) => ({
                    ...group,
                    L01UserGroupID: (group.L01UserGroupID || group.sUserGroupID || group.id || '').toString().trim(),
                    L01UserGroupName: (group.L01UserGroupName || group.sUserGroupName || group.name || '').toString().trim()
                })).filter(group => group.L01UserGroupID && group.L01UserGroupName);
                
                setUserGroups(formattedGroups);
                
                if (formattedGroups.length > 0) {
                    const firstGroupID = formattedGroups[0].L01UserGroupID;
                    setSelectedGroup(firstGroupID);
                    await fetchUserRights(firstGroupID);
                }
            } else {
                setUserGroups([]);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            showInfoDialog(
                t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups.',
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, [postData, showInfoDialog, t, fetchUserRights, getActiveUserDetails]);

    useEffect(() => {
        const sessionID = sessionStorage.getItem('sSessionID');
        const userID = sessionStorage.getItem('sUserID');
        
        if (!sessionID || !userID) {
            showInfoDialog(t('usermanagement.sessionexpired') || 'Session expired. Please login again.', "error");
            return;
        }
        
        fetchUserGroups();
        isInitialMount.current = false;
    }, [fetchUserGroups, showInfoDialog, t]);

    const handleGroupChange = useCallback((groupID) => {
        setSelectedGroup(groupID);
        setSelectAll(false);
        setCreateAll(false);
        setEditAll(false);
        setDeleteAll(false);
        setAllowAll(false);
        
        if (groupID) {
            fetchUserRights(groupID);
        }
    }, [fetchUserRights]);

    const handleSelectAll = useCallback((checked) => {
        setSelectAll(checked);
        setCreateAll(checked);
        setEditAll(checked);
        setDeleteAll(checked);
        setAllowAll(checked);
        
        const updatedData = rightsData.map(item => {
            const newItem = { ...item };
            
            if (newItem.sCreate !== "NA") {
                newItem.sCreate = checked ? "1" : "0";
            }
            
            if (newItem.sEdit !== "NA") {
                newItem.sEdit = checked ? "1" : "0";
            }
            
            if (newItem.sDelete !== "NA") {
                newItem.sDelete = checked ? "1" : "0";
            }
            
            newItem.sAllow = checked ? "1" : "0";
            
            return newItem;
        });
        
        setRightsData(updatedData);
        setFilteredData(updatedData);
    }, [rightsData]);

    const handleCreateAll = useCallback((checked) => {
        setCreateAll(checked);
        
        const updatedData = rightsData.map(item => {
            if (item.sCreate !== "NA") {
                return { ...item, sCreate: checked ? "1" : "0" };
            }
            return item;
        });
        
        setRightsData(updatedData);
        setFilteredData(updatedData);
        
        const allChecked = updatedData.every(item => 
            (item.sCreate === "NA" || item.sCreate === "1") &&
            (item.sEdit === "NA" || item.sEdit === "1") &&
            (item.sDelete === "NA" || item.sDelete === "1") &&
            item.sAllow === "1"
        );
        setSelectAll(allChecked);
    }, [rightsData]);

    const handleEditAll = useCallback((checked) => {
        setEditAll(checked);
        
        const updatedData = rightsData.map(item => {
            if (item.sEdit !== "NA") {
                return { ...item, sEdit: checked ? "1" : "0" };
            }
            return item;
        });
        
        setRightsData(updatedData);
        setFilteredData(updatedData);
        
        const allChecked = updatedData.every(item => 
            (item.sCreate === "NA" || item.sCreate === "1") &&
            (item.sEdit === "NA" || item.sEdit === "1") &&
            (item.sDelete === "NA" || item.sDelete === "1") &&
            item.sAllow === "1"
        );
        setSelectAll(allChecked);
    }, [rightsData]);

    const handleDeleteAll = useCallback((checked) => {
        setDeleteAll(checked);
        
        const updatedData = rightsData.map(item => {
            if (item.sDelete !== "NA") {
                return { ...item, sDelete: checked ? "1" : "0" };
            }
            return item;
        });
        
        setRightsData(updatedData);
        setFilteredData(updatedData);
        
        const allChecked = updatedData.every(item => 
            (item.sCreate === "NA" || item.sCreate === "1") &&
            (item.sEdit === "NA" || item.sEdit === "1") &&
            (item.sDelete === "NA" || item.sDelete === "1") &&
            item.sAllow === "1"
        );
        setSelectAll(allChecked);
    }, [rightsData]);

    const handleAllowAll = useCallback((checked) => {
        setAllowAll(checked);
        
        const updatedData = rightsData.map(item => ({
            ...item,
            sAllow: checked ? "1" : "0"
        }));
        
        setRightsData(updatedData);
        setFilteredData(updatedData);
        
        const allChecked = updatedData.every(item => 
            (item.sCreate === "NA" || item.sCreate === "1") &&
            (item.sEdit === "NA" || item.sEdit === "1") &&
            (item.sDelete === "NA" || item.sDelete === "1") &&
            item.sAllow === "1"
        );
        setSelectAll(allChecked);
    }, [rightsData]);

    const handleCheckboxChange = useCallback((rowId, field, value) => {
        const updatedData = rightsData.map(item => {
            if (item.id === rowId) {
                return { ...item, [field]: value ? "1" : "0" };
            }
            return item;
        });
        
        setRightsData(updatedData);
        setFilteredData(updatedData);
        
        const allCreateChecked = updatedData.every(item => 
            item.sCreate === "NA" || item.sCreate === "1"
        );
        const allEditChecked = updatedData.every(item => 
            item.sEdit === "NA" || item.sEdit === "1"
        );
        const allDeleteChecked = updatedData.every(item => 
            item.sDelete === "NA" || item.sDelete === "1"
        );
        const allAllowChecked = updatedData.every(item => 
            item.sAllow === "1"
        );
        const allChecked = updatedData.every(item => 
            (item.sCreate === "NA" || item.sCreate === "1") &&
            (item.sEdit === "NA" || item.sEdit === "1") &&
            (item.sDelete === "NA" || item.sDelete === "1") &&
            item.sAllow === "1"
        );
        
        setCreateAll(allCreateChecked);
        setEditAll(allEditChecked);
        setDeleteAll(allDeleteChecked);
        setAllowAll(allAllowChecked);
        setSelectAll(allChecked);
    }, [rightsData]);

    const handleSave = useCallback(async () => {
        if (!selectedGroup) {
            showInfoDialog(t('usermanagement.selectgrouptosave') || 'Please select a group to save', "warning");
            return;
        }
        
        if (rightsData.length === 0) {
            showInfoDialog(t('usermanagement.norightstosave') || 'No rights data to save', "warning");
            return;
        }
        
        try {
            setLoading(true);
            
            const saveData = rightsData.map(({ id, ...rest }) => rest);
            
            const passObjDet = {
                sUserGroupFilterID: selectedGroup.padEnd(10, ' ').substring(0, 10).trim(),
                UserRights: saveData,
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            const response = await postData("User/UserRightsSaveButtonclick", passObjDet);
            
            if (!response) {
                showInfoDialog(t('usermanagement.userrightssavefailed') || 'Failed to save user rights', "error");
                return;
            }
            
            if (response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || 'Authentication failed', "error");
                return;
            }
            
            const userRightsResponse = response.UserRights;
            
            if (userRightsResponse && Array.isArray(userRightsResponse)) {
                showInfoDialog(
                    t('usermanagement.userrightssavesuccess') || 'User rights saved successfully', 
                    "success"
                );
                
                const updatedData = userRightsResponse.map((item, index) => ({
                    ...item,
                    id: `${selectedGroup}-${index}`
                }));
                
                setRightsData(updatedData);
                setFilteredData(updatedData);
                updateCheckboxStates(updatedData);
            } else {
                showInfoDialog(
                    t('usermanagement.userrightssavefailed') || 'Failed to save user rights', 
                    "error"
                );
            }
        } catch (error) {
            console.error('Error saving:', error);
            showInfoDialog(
                t('usermanagement.userrightssavefailed') || 'Failed to save user rights', 
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, [selectedGroup, rightsData, postData, showInfoDialog, t, updateCheckboxStates, getActiveUserDetails]);

    const handlePrint = useCallback(() => {
        if (rightsData.length === 0) {
            showInfoDialog(t('usermanagement.nodataprint') || 'No data available to print', "warning");
            return;
        }
        
        window.print();
    }, [rightsData, showInfoDialog, t]);

    const stableData = useMemo(() => filteredData, [JSON.stringify(filteredData)]);

    const memoizedHandleCreateAll = useCallback((checked) => handleCreateAll(checked), [handleCreateAll]);
    const memoizedHandleEditAll = useCallback((checked) => handleEditAll(checked), [handleEditAll]);
    const memoizedHandleDeleteAll = useCallback((checked) => handleDeleteAll(checked), [handleDeleteAll]);
    const memoizedHandleAllowAll = useCallback((checked) => handleAllowAll(checked), [handleAllowAll]);
    const memoizedHandleCheckboxChange = useCallback((rowId, field, value) => 
        handleCheckboxChange(rowId, field, value), [handleCheckboxChange]);

    const columns = useMemo(() => [
        {
            key: 'sModuleName',
            label: t('usermanagement.modulename') || 'Module Name',
            width: 180,
            enableSearch: true,
            enableSort: undefined,
            fontFamily: 'Verdana, sans-serif',
            render: (row, isSelected, index, rows) => {
                if (index === 0 || row.sModuleName !== rows[index - 1]?.sModuleName) {
                    return (
                        <div className="text-[12px] font-verdana font-medium text-[#A52A2A]">
                            <span className={isSelected ? 'font-bold' : ''}>
                                {t(row.sModuleName) || row.sModuleName}
                            </span>
                        </div>
                    );
                }
                return <div></div>;
            }
        },
        {
            key: 'sDisplayTopic',
            label: t('usermanagement.taskname') || 'Task Name',
            width: 200,
            enableSort: false,
            enableSearch: true,
            render: (row, isSelected) => (
                <div className="text-[12px] font-verdana font-medium truncate text-[#A52A2A]">
                    <span className={isSelected ? 'font-bold' : ''}>
                        {t(row.sDisplayTopic) || row.sDisplayTopic}
                    </span>
                </div>
            )
        },
        {
            key: 'sCreate',
            label: (
                <div className="flex items-center gap-3 ml-14 justify-center">
                    <input
                        type="checkbox"
                        checked={createAll}
                        onChange={(e) => memoizedHandleCreateAll(e.target.checked)}
                        className="cursor-pointer  w-[14px] h-[14px] accent-blue-600"
                    />
                    <span className="text-[12px] font-roboto font-bold">
                        {t('usermanagement.create') || 'Create'}
                    </span>
                </div>
            ),
            width: 120,
            enableSearch: false,
            enableSort: false,
            render: (row, isSelected) => { 
                if (row.sCreate === "NA") {
                    return (
                        <div className="flex items-center justify-center">
                            <span className={`text-[12px] font-verdana text-black ${isSelected ? 'font-bold' : ''}`}>
                                NA
                            </span>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={row.sCreate === "1"}
                            onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sCreate', e.target.checked)}
                            className="cursor-pointer w-[14px] h-[14px] accent-blue-600"
                        />
                    </div>
                );
            }
        },
        {
            key: 'sEdit',
            label: (
                <div className="flex items-center gap-1 ml-14 justify-center">
                    <input
                        type="checkbox"
                        checked={editAll}
                        onChange={(e) => memoizedHandleEditAll(e.target.checked)}
                        className="cursor-pointer mr-1 w-[14px] h-[14px] accent-blue-600"
                    />
                    <span className="text-[12px] font-roboto font-bold">
                        {t('usermanagement.edit') || 'Edit'}
                    </span>
                </div>
            ),
            width: 120,
            enableSearch: false,
            enableSort: false,
            render: (row, isSelected) => {
                if (row.sEdit === "NA") {
                    return (
                        <div className="flex items-center justify-center">
                            <span className={`text-[12px] font-verdana text-black ${isSelected ? 'font-bold' : ''}`}>
                                NA
                            </span>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={row.sEdit === "1"}
                            onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sEdit', e.target.checked)}
                            className="cursor-pointer w-[14px] h-[14px] accent-blue-600"
                        />
                    </div>
                );
            }
        },
        {
            key: 'sDelete',
            label: (
                <div className="flex items-center gap-1 ml-14 justify-center">
                    <input
                        type="checkbox"
                        checked={deleteAll}
                        onChange={(e) => memoizedHandleDeleteAll(e.target.checked)}
                        className="cursor-pointer mr-1 w-[14px] h-[14px] accent-blue-600"
                    />
                    <span className="text-[12px] font-roboto font-bold">
                        {t('usermanagement.delete') || 'Delete'}
                    </span>
                </div>
            ),
            width: 120,
            enableSearch: false,
            enableSort: true,
            render: (row, isSelected) => {
                if (row.sDelete === "NA") {
                    return (
                        <div className="flex items-center justify-center">
                            <span className={`text-[12px] font-verdana text-black ${isSelected ? 'font-bold' : ''}`}>
                                NA
                            </span>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={row.sDelete === "1"}
                            onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sDelete', e.target.checked)}
                            className="cursor-pointer w-[14px] h-[14px] accent-blue-600"
                        />
                    </div>
                );
            }
        },
        {
            key: 'sAllow',
            label: (
                <div className="flex items-center gap-1 ml-14 justify-center">
                    <input
                        type="checkbox"
                        checked={allowAll}
                        onChange={(e) => memoizedHandleAllowAll(e.target.checked)}
                        className="cursor-pointer mr-1 w-[14px] h-[14px] accent-blue-600"
                    />
                    <span className="text-[12px] font-roboto font-bold">
                        {t('usermanagement.allow') || 'Allow'}
                    </span>
                </div>
            ),
            width: 120,
            enableSearch: false,
            enableSort: false,
            render: (row, isSelected) => (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={row.sAllow === "1"}
                        onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sAllow', e.target.checked)}
                        className="cursor-pointer w-[14px] h-[14px] accent-blue-600"
                    />
                </div>
            )
        }
    ], [createAll, editAll, deleteAll, allowAll, t, 
        memoizedHandleCreateAll, memoizedHandleEditAll, 
        memoizedHandleDeleteAll, memoizedHandleAllowAll, 
        memoizedHandleCheckboxChange]);

    const ActionButton = ({ icon: Icon, label, disabled, onClick, variant = "default" }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-bold rounded border-none 
                transition-all duration-200 whitespace-nowrap
                ${disabled 
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                    : variant === 'primary'
                        ? 'bg-[#2883FE] text-white hover:bg-[#1a6fd8]'
                        : 'bg-[#F0F2F5] text-[#2883FE] hover:bg-gray-100'
                }
            `}
        >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{label}</span>
        </button>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 font-roboto">
                <div className="text-gray-500 text-base mb-2.5">
                    {t('masters.loading') || 'Loading...'}
                </div>
                <div className="text-gray-400 text-xs">
                    Fetching user rights data...
                </div>
            </div>
        );
    }

    if (!loading && userGroups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 font-roboto gap-5 p-5">
                <div className="text-red-500 text-lg font-bold text-center">
                    {t('usermanagement.nogroupsavailable') || 'No User Groups Available'}
                </div>
                <div className="text-gray-500 text-sm text-center max-w-md">
                    No user groups are defined in the system. Please contact administrator to create user groups first.
                </div>
                <button 
                    onClick={() => {
                        setLoading(true);
                        fetchUserGroups();
                    }}
                    className="px-5 py-2.5 bg-[#2883FE] text-white border-none rounded cursor-pointer text-sm font-bold hover:bg-[#1a6fd8]"
                >
                    {t('button.retry') || 'Retry'}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col font-roboto bg-white w-full h-screen overflow-hidden">
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

            {/* Header Section - Fixed */}
            <div className="px-3.5 py-1.5 bg-white flex-shrink-0 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2.5">
                            <label className="text-[12px] font-semibold text-gray-700">
                                {t('usermanagement.groupname') || 'Group Name'}:
                            </label>
                            <AnimatedDropdown
                                value={selectedGroup}
                                onChange={(e) => handleGroupChange(e.target.value)}
                                className="w-84 text-[12px] bg-white mt-2 mr-11" 
                            >
                                <option value="" className='pb-0'>{t('usermanagement.selectgroup') || 'Select Group'}</option>
                                {userGroups.map(group => (
                                    <option key={group.L01UserGroupID} value={group.L01UserGroupID}>
                                        {t(group.L01UserGroupName) || group.L01UserGroupName}
                                    </option>
                                ))}
                            </AnimatedDropdown>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-7">
                            <input
                                type="checkbox"
                                id="selectAllCheckbox"
                                checked={selectAll}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="cursor-pointer w-4 h-4 ml-8"
                            />
                            <label 
                                htmlFor="selectAllCheckbox"
                                className=" text-[12px] text-[#405F7D] font-bold cursor-pointer ml-1 select-none"
                            >
                                {t('usermanagement.selectall') || 'Select All'}
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2.5">
                        <ActionButton
                            icon={Printer}
                            label={t('usermanagement.print') || 'Print'}
                            onClick={handlePrint}
                            disabled={rightsData.length === 0}
                        />
                        <ActionButton
                            icon={Save}
                            label={t('button.save') || 'Save'}
                            onClick={handleSave}
                            disabled={!selectedGroup || rightsData.length === 0}
                            variant="primary"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area - Takes remaining height and scrolls */}
            <div className="flex-1 overflow-auto min-h-0 w-full relative">
                {filteredData.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500 text-[12px] gap-2.5">
                        <div>
                            {selectedGroup 
                                ? (t('usermanagement.norightsfound') || 'No rights found for this group')
                                : (t('usermanagement.selectgroupfirst') || 'Please select a group first')
                            }
                        </div>
                        {selectedGroup && (
                            <button 
                                onClick={() => fetchUserRights(selectedGroup)}
                                className="px-4 py-2 bg-gray-50 text-[#2883FE] rounded cursor-pointer text-[12px] font-bold hover:bg-gray-100"
                            >
                                {t('button.refresh') || 'Refresh'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="p-1 h-full flex flex-col">
                        {/* Grid container with explicit height */}
                        <div className="flex-1 min-h-[100px] overflow-hidden bg-white">
                            <GridLayout 
                                key={`user-rights-grid-${selectedGroup}`}
                                columns={columns}
                                data={stableData}
                                searchable={false}
                                selectable={false}
                                hidePagination={true}
                                enableSelection={false}
                                height="80%"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRights;