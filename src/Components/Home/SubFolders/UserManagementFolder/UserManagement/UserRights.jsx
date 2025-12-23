import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Save, Printer } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import servicecall from '../../../../../Services/servicecall';
import { CF_encrypt, CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';

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

    // CORRECTED: Decrypt session values like Navbar does
    const getActiveUserDetails = useCallback(() => {
        // Helper function to safely decrypt session values
        const getDecryptedValue = (key) => {
            try {
                const encryptedValue = sessionStorage.getItem(key);
                if (!encryptedValue) return "";
                
                // If it looks encrypted (long string with special chars), decrypt it
                if (encryptedValue.length > 50 && encryptedValue.includes('==')) {
                    return CF_decrypt(encryptedValue);
                }
                // Otherwise return as-is (might already be plain text)
                return encryptedValue;
            } catch (error) {
                console.error(`Error decrypting ${key}:`, error);
                return "";
            }
        };

        // Get and decrypt all session values
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

        // Debug log to see what we're sending
        console.log('🔓 Decrypted session values for API:');
        console.log('- sSessionID:', sSessionID?.substring(0, 50) + (sSessionID?.length > 50 ? '...' : ''));
        console.log('- sUserID:', sUserID);
        console.log('- sUsername:', sUsername);
        console.log('- sSiteCode:', `"${sSiteCode}" (length: ${sSiteCode.length})`);
        console.log('- sUserGroupID:', `"${sUserGroupID}" (length: ${sUserGroupID.length})`);

        return {
            sUserDomainName: sDomainName,
            sSessionID: sSessionID || "",
            sUserID: sUserID,
            sTimeZoneID: sTimeZoneID,
            sApplicationName: "SDMS",
            sdbtype: sdbtype,
            sUsername: sUsername || "Administrator",
            sSiteCode: sSiteCode.padEnd(10, ' ').substring(0, 10), // Ensure 10 chars
            sCategories: sCategories,
            sUserGroupID: sUserGroupID.padEnd(10, ' ').substring(0, 10), // Ensure 10 chars
            sUserStatus: sUserStatus,
            sTenantID: sTenantID
        };
    }, []);

    const fetchUserRights = useCallback(async (groupID) => {
        if (!groupID) return;
        
        setLoading(true);
        try {
            console.log('📡 Fetching rights for group:', groupID);
            
            // Build request with proper structure
            const passObjDet = {
                sUserGroupFilterID: groupID.padEnd(10, ' ').substring(0, 10).trim(), // Ensure proper format
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            console.log('📊 Plain request for UserRightsGrid:', JSON.stringify(passObjDet, null, 2));
            
            // servicecall.js will automatically encrypt this
            const response = await postData("User/UserRightsGrid", passObjDet);
            
            console.log('✅ UserRightsGrid response:', response);
            
            if (!response) {
                console.warn('No response from UserRightsGrid');
                setRightsData([]);
                setFilteredData([]);
                showInfoDialog(t('usermanagement.failedtofetchuserrights') || 'Failed to fetch user rights', "error");
                return;
            }
            
            // Check if response is a string that needs decryption
            let data = response;
            if (typeof response === 'string' && response.length > 50) {
                console.log('🔄 Response is encrypted string, decrypting...');
                try {
                    const decrypted = CF_decrypt(response);
                    console.log('🔓 Decrypted response:', decrypted);
                    data = JSON.parse(decrypted);
                } catch (decryptError) {
                    console.error('Failed to decrypt response:', decryptError);
                }
            }
            
            // Check if it has oResObj like other APIs
            if (data && data.oResObj) {
                data = data.oResObj;
            }
            
            // Filter out unknown rights like jQuery does
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
            
            console.log('✅ Processed rights data:', dataWithIds.length, 'items');
            
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
            console.log('🔍 Fetching user groups...');
            
            // Build request with proper structure (matching your colleague's example)
            const passObjDet = {
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            console.log('📊 Plain request for UserRightsCombo:', JSON.stringify(passObjDet, null, 2));
            
            // servicecall.js will automatically encrypt this
            const response = await postData("User/UserRightsCombo", passObjDet);
            
            console.log('✅ UserRightsCombo response:', response);
            
            if (!response) {
                console.warn('No response from API');
                setUserGroups([]);
                showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups', "error");
                return;
            }
            
            // Check if response is a string that needs decryption
            let groupsData = response;
            if (typeof response === 'string' && response.length > 50) {
                console.log('🔄 Response is encrypted string, decrypting...');
                try {
                    const decrypted = CF_decrypt(response);
                    console.log('🔓 Decrypted response:', decrypted);
                    groupsData = JSON.parse(decrypted);
                } catch (decryptError) {
                    console.error('Failed to decrypt response:', decryptError);
                }
            }
            
            // Check if it has oResObj
            if (groupsData && groupsData.oResObj) {
                groupsData = groupsData.oResObj;
            }
            
            // Ensure it's an array
            if (!Array.isArray(groupsData)) {
                console.warn('Groups data is not an array:', groupsData);
                groupsData = [];
            }
            
            console.log('📊 Groups data found:', groupsData.length, 'items');
            
            if (groupsData.length > 0) {
                // Map to expected structure for dropdown
                const formattedGroups = groupsData.map((group) => {
                    // Use the exact field names from jQuery: L01UserGroupID and L01UserGroupName
                    return {
                        ...group,
                        L01UserGroupID: (group.L01UserGroupID || group.sUserGroupID || group.id || '').toString().trim(),
                        L01UserGroupName: (group.L01UserGroupName || group.sUserGroupName || group.name || '').toString().trim()
                    };
                }).filter(group => group.L01UserGroupID && group.L01UserGroupName);
                
                console.log('✅ Formatted groups:', formattedGroups);
                
                setUserGroups(formattedGroups);
                
                // Select first group if available
                if (formattedGroups.length > 0) {
                    const firstGroupID = formattedGroups[0].L01UserGroupID;
                    console.log('🎯 Selecting first group:', firstGroupID);
                    setSelectedGroup(firstGroupID);
                    await fetchUserRights(firstGroupID);
                }
            } else {
                console.warn('No user groups found in the system');
                
                // If we get an empty array, it means there are no user groups defined
                showInfoDialog(
                    t('usermanagement.nogroupsavailable') || 'No user groups found in the system. Please contact administrator to create user groups.',
                    "warning"
                );
                setUserGroups([]);
            }
        } catch (error) {
            console.error('❌ Error fetching groups:', error);
            console.error('Error details:', error.message);
            showInfoDialog(
                t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups. Please check with administrator.',
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, [postData, showInfoDialog, t, fetchUserRights, getActiveUserDetails]);

    useEffect(() => {
        // Check if user is logged in
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
        console.log('Changing group to:', groupID);
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
            
            // Prepare save data (remove id field like jQuery does)
            const saveData = rightsData.map(({ id, ...rest }) => rest);
            
            console.log('💾 Saving rights for group:', selectedGroup);
            
            // Build save request with proper structure
            const passObjDet = {
                sUserGroupFilterID: selectedGroup.padEnd(10, ' ').substring(0, 10).trim(),
                UserRights: saveData,
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            console.log('📊 Plain save request:', JSON.stringify(passObjDet, null, 2));
            
            // servicecall.js will automatically encrypt this
            const response = await postData("User/UserRightsSaveButtonclick", passObjDet);
            
            console.log('✅ Save response:', response);
            
            if (!response) {
                showInfoDialog(t('usermanagement.userrightssavefailed') || 'Failed to save user rights', "error");
                return;
            }
            
            // Check for audit trail login failure first
            if (response.AuditTrailLogin === false) {
                showInfoDialog(response.LoginFailedMsg || 'Authentication failed', "error");
                return;
            }
            
            // Get the user rights response
            const userRightsResponse = response.UserRights;
            
            if (userRightsResponse && Array.isArray(userRightsResponse)) {
                showInfoDialog(
                    t('usermanagement.userrightssavesuccess') || 'User rights saved successfully', 
                    "success"
                );
                
                // Update the rights data with the response
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
        width: 200,
        enableSearch: true,
        enableSort: false,
        render: (row, isSelected, index, rows) => {
            if (index === 0 || row.sModuleName !== rows[index - 1]?.sModuleName) {
                return (
                    <div style={{ 
                        fontSize: '12px', 
                        fontFamily: 'verdana',
                        fontWeight: 'bold',
                        color: '#8b4513',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {t(row.sModuleName) || row.sModuleName}
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
        render: (row) => (
            <div style={{ 
                fontSize: '12px', 
                fontFamily: 'verdana',
                color: '#8b4513',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
                {t(row.sDisplayTopic) || row.sDisplayTopic}
            </div>
        )
    },
    {
        key: 'sCreate',
        label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                <input
                    type="checkbox"
                    checked={createAll}
                    onChange={(e) => memoizedHandleCreateAll(e.target.checked)}
                    style={{ cursor: 'pointer', marginRight: '5px' }}
                />
                {t('usermanagement.create') || 'Create'}
            </div>
        ),
        width: 120,
        enableSearch: false,
        enableSort: false,
        render: (row) => { 
            if (row.sCreate === "NA") {
                return (
                    <div style={{ 
                        fontSize: '12px', 
                        fontFamily: 'verdana',
                        color: '#6b7280',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        NA
                    </div>
                );
            }
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        checked={row.sCreate === "1"}
                        onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sCreate', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            );
        }
    },
    {
        key: 'sEdit',
        label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                <input
                    type="checkbox"
                    checked={editAll}
                    onChange={(e) => memoizedHandleEditAll(e.target.checked)}
                    style={{ cursor: 'pointer', marginRight: '5px' }}
                />
                {t('usermanagement.edit') || 'Edit'}
            </div>
        ),
        width: 120,
        enableSearch: false,
        enableSort: false,
             render: (row) => {
            if (row.sEdit === "NA") {
                return (
                    <div style={{ 
                        fontSize: '12px', 
                        fontFamily: 'verdana',
                        color: '#6b7280',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        NA
                    </div>
                );
            }
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        checked={row.sEdit === "1"}
                        onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sEdit', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            );
        }
    },
    {
        key: 'sDelete',
        label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                <input
                    type="checkbox"
                    checked={deleteAll}
                    onChange={(e) => memoizedHandleDeleteAll(e.target.checked)}
                    style={{ cursor: 'pointer', marginRight: '5px' }}
                />
                {t('usermanagement.delete') || 'Delete'}
            </div>
        ),
        width: 120,
        enableSearch: false,
        enableSort: false,
        // REMOVED: isSelectionColumn: true,
        // REMOVED: getCheckValue: (row) => row.sDelete,
        // REMOVED: hideHeaderSelection: true,
        render: (row) => {
            if (row.sDelete === "NA") {
                return (
                    <div style={{ 
                        fontSize: '12px', 
                        fontFamily: 'verdana',
                        color: '#6b7280',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        NA
                    </div>
                );
            }
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        checked={row.sDelete === "1"}
                        onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sDelete', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                        // REMOVED: onClick={(e) => e.stopPropagation()}
                    />
                </div>
            );
        }
    },
    {
        key: 'sAllow',
        label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                <input
                    type="checkbox"
                    checked={allowAll}
                    onChange={(e) => memoizedHandleAllowAll(e.target.checked)}
                    style={{ cursor: 'pointer', marginRight: '5px' }}
                />
                {t('usermanagement.allow') || 'Allow'}
            </div>
        ),
        width: 120,
        enableSearch: false,
        enableSort: false,
        // REMOVED: isSelectionColumn: true,
        // REMOVED: getCheckValue: (row) => row.sAllow,
        // REMOVED: hideHeaderSelection: true,
        render: (row) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <input
                    type="checkbox"
                    checked={row.sAllow === "1"}
                    onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sAllow', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                    // REMOVED: onClick={(e) => e.stopPropagation()}
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
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '4px',
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                backgroundColor: disabled 
                    ? '#f8fafc' 
                    : variant === 'primary'
                        ? '#2883FE'
                        : '#f1f5f9',
                color: disabled 
                    ? '#cbd5e1' 
                    : variant === 'primary'
                        ? 'white'
                        : '#2883FE'
            }}
        >
            {Icon && <Icon style={{ width: '14px', height: '14px' }} />}
            <span>{label}</span>
        </button>
    );

    // Add debug button to test session
    const debugSession = () => {
        console.log('=== DEBUG SESSION DATA ===');
        const activeDetails = getActiveUserDetails();
        console.log('ActiveUserDetails:', activeDetails);
        console.log('Raw sessionStorage values:');
        ['sSessionID', 'sUserID', 'sUsername', 'sSiteCode', 'sUserGroupID'].forEach(key => {
            const value = sessionStorage.getItem(key);
            console.log(`${key}:`, value);
            console.log(`  Length: ${value?.length}`);
            if (value && value.length > 50) {
                try {
                    const decrypted = CF_decrypt(value);
                    console.log(`  🔓 Decrypted: ${decrypted}`);
                } catch (e) {
                    console.log(`  ❌ Could not decrypt: ${e.message}`);
                }
            }
        });
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                fontFamily: 'Roboto, sans-serif',
                backgroundColor: '#f9fafb'
            }}>
                <div style={{ 
                    color: '#6b7280',
                    fontSize: '16px',
                    marginBottom: '10px'
                }}>
                    {t('masters.loading') || 'Loading...'}
                </div>
                <div style={{ 
                    fontSize: '12px',
                    color: '#9ca3af'
                }}>
                    Fetching user rights data...
                </div>
            </div>
        );
    }

    if (!loading && userGroups.length === 0) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                fontFamily: 'Roboto, sans-serif',
                backgroundColor: '#f9fafb',
                gap: '20px',
                padding: '20px'
            }}>
                <div style={{ 
                    color: '#ef4444', 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    {t('usermanagement.nogroupsavailable') || 'No User Groups Available'}
                </div>
                <div style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    No user groups are defined in the system. Please contact administrator to create user groups first.
                </div>
                <button 
                    onClick={() => {
                        setLoading(true);
                        fetchUserGroups();
                    }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2883FE',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    {t('button.retry') || 'Retry'}
                </button>
            </div>
        );
    }

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            fontFamily: 'Roboto, sans-serif',
            backgroundColor: '#f9fafb',
            height: '100%',
            overflow: 'hidden'
        }}>
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

  

            <div style={{ 
                padding: '15px',
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                                {t('usermanagement.groupname') || 'Group Name'}:
                            </label>
                            <AnimatedDropdown
                                value={selectedGroup}
                                onChange={(e) => handleGroupChange(e.target.value)}
                                style={{
                                    width: '200px',
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">{t('usermanagement.selectgroup') || 'Select Group'}</option>
                                {userGroups.map(group => (
                                    <option key={group.L01UserGroupID} value={group.L01UserGroupID}>
                                        {t(group.L01UserGroupName) || group.L01UserGroupName}
                                    </option>
                                ))}
                            </AnimatedDropdown>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '30px' }}>
                            <input
                                type="checkbox"
                                id="selectAllCheckbox"
                                checked={selectAll}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                            />
                            <label 
                                htmlFor="selectAllCheckbox"
                                style={{ 
                                    fontSize: '12px', 
                                    color: '#374151',
                                    cursor: 'pointer',
                                    marginLeft: '5px',
                                    userSelect: 'none'
                                }}
                            >
                                {t('usermanagement.selectall') || 'Select All'}
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
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

            <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                {filteredData.length === 0 && !loading ? (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        color: '#6b7280',
                        fontSize: '14px',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <div>
                            {selectedGroup 
                                ? (t('usermanagement.norightsfound') || 'No rights found for this group')
                                : (t('usermanagement.selectgroupfirst') || 'Please select a group first')
                            }
                        </div>
                        {selectedGroup && (
                            <button 
                                onClick={() => fetchUserRights(selectedGroup)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#2883FE',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {t('button.refresh') || 'Refresh'}
                            </button>
                        )}
                    </div>
                ) : (
<GridLayout 
    key={`user-rights-grid-${selectedGroup}`}
    columns={columns}
    data={stableData}
    searchable={false}
    selectable={false}  // This should be false
    hidePagination={false}
    // Add this if GridLayout supports it:
    disableRowSelection={true}
    showCheckboxes={false}
/>
                )}
            </div>
        </div>
    );
};

export default UserRights;

