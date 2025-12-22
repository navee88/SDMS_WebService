import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Save, Printer } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import servicecall from '../../../../../Services/servicecall';

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

    const fetchUserRights = useCallback(async (groupID) => {
        if (!groupID) return;
        
        setLoading(true);
        try {
            console.log('📡 Fetching rights for group:', groupID);
            
            // Prepare ActiveUserDetails
            const activeUserDetails = {
                sUserDomainName: "SDMS",
                sSessionID: sessionStorage.getItem('sessionID') || "",
                sUserID: sessionStorage.getItem('userID') || "",
                sTimeZoneID: "Asia/Kolkata<~>true",
                sApplicationName: "SDMS",
                sdbtype: "MSSQL",
                sUsername: sessionStorage.getItem('username') || "",
                sSiteCode: sessionStorage.getItem('siteCode') || "",
                sCategories: "DB",
                sUserGroupID: sessionStorage.getItem('userGroupID') || "",
                sUserStatus: "",
                sTenantID: ""
            };
            
            console.log('ActiveUserDetails for rights:', activeUserDetails);
            
            const requestData = {
                sUserGroupFilterID: groupID.trim(),
                ActiveUserDetails: activeUserDetails,
                ApplicationCode: "SDMS"
            };
            
            console.log('Request data for UserRightsGrid:', requestData);
            
            const data = await postData("User/UserRightsGrid", requestData);
            
            console.log('✅ Rights data received:', data);
            
            const dataWithIds = Array.isArray(data) ? data.map((item, index) => ({
                ...item,
                id: `${groupID}-${index}`
            })) : [];
            
            setRightsData(dataWithIds);
            setFilteredData(dataWithIds);
            updateCheckboxStates(dataWithIds);
        } catch (error) {
            console.error('💥 Error fetching user rights:', error);
            showInfoDialog(t('usermanagement.failedtofetchuserrights') || 'Failed to fetch user rights', "error");
        } finally {
            setLoading(false);
        }
    }, [postData, showInfoDialog, t, updateCheckboxStates]);

    const fetchUserGroups = useCallback(async () => {
        setLoading(true);
        try {
            console.log('🔍 Starting fetchUserGroups...');
            
            // Prepare ActiveUserDetails
            const activeUserDetails = {
                sUserDomainName: "SDMS",
                sSessionID: sessionStorage.getItem('sessionID') || "",
                sUserID: sessionStorage.getItem('userID') || "",
                sTimeZoneID: "Asia/Kolkata<~>true",
                sApplicationName: "SDMS",
                sdbtype: "MSSQL",
                sUsername: sessionStorage.getItem('username') || "",
                sSiteCode: sessionStorage.getItem('siteCode') || "",
                sCategories: "DB",
                sUserGroupID: sessionStorage.getItem('userGroupID') || "",
                sUserStatus: "",
                sTenantID: ""
            };
            
            console.log('ActiveUserDetails for groups:', activeUserDetails);
            
            const requestData = {
                ActiveUserDetails: activeUserDetails,
                ApplicationCode: "SDMS"
            };
            
            console.log('Request data for UserRightsCombo:', requestData);
            
            const data = await postData("User/UserRightsCombo", requestData);
            
            console.log('✅ Raw API response:', data);
            console.log('✅ User groups received:', data);
            
            // Check if data is nested in a property
            let groupsData = data;
            
            // If data has a property that contains the array, extract it
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                // Try common property names
                const possibleKeys = ['data', 'result', 'items', 'UserGroups', 'Groups'];
                for (const key of possibleKeys) {
                    if (Array.isArray(data[key])) {
                        groupsData = data[key];
                        console.log(`Found groups in key "${key}":`, groupsData);
                        break;
                    }
                }
            }
            
            // Check if data is valid array
            if (Array.isArray(groupsData) && groupsData.length > 0) {
                // Trim whitespace from group IDs for consistency
                const formattedGroups = groupsData.map(group => ({
                    ...group,
                    L01UserGroupID: (group.L01UserGroupID || '').trim(),
                    L01UserGroupName: (group.L01UserGroupName || '').trim()
                }));
                
                console.log('📊 Formatted groups:', formattedGroups);
                setUserGroups(formattedGroups);
                
                // Select the first group
                const firstGroupID = formattedGroups[0].L01UserGroupID;
                console.log('🎯 Selecting first group:', firstGroupID);
                setSelectedGroup(firstGroupID);
                
                // Fetch rights for the first group
                await fetchUserRights(firstGroupID);
            } else {
                console.warn('⚠️ No user groups found or empty array:', groupsData);
                setUserGroups([]);
                
                // Try to test the API with a simpler request
                console.log('Testing API with minimal request...');
                try {
                    const testData = await postData("User/UserRightsCombo", {});
                    console.log('Test API response:', testData);
                } catch (testError) {
                    console.error('Test API error:', testError);
                }
                
                showInfoDialog(t('usermanagement.nogroupsavailable') || 'No user groups available', "warning");
            }
        } catch (error) {
            console.error('🌐 Network error fetching user groups:', error);
            console.error('Error details:', error.message, error.stack);
            showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups. Please check server connection.', "error");
        } finally {
            setLoading(false);
        }
    }, [postData, showInfoDialog, t, fetchUserRights]);

    useEffect(() => {
        // Check session storage first
        console.log('Session storage check:', {
            sessionID: sessionStorage.getItem('sessionID'),
            userID: sessionStorage.getItem('userID'),
            username: sessionStorage.getItem('username'),
            siteCode: sessionStorage.getItem('siteCode'),
            userGroupID: sessionStorage.getItem('userGroupID')
        });
        
        fetchUserGroups();
        isInitialMount.current = false;
    }, [fetchUserGroups]);

    const handleGroupChange = useCallback((groupID) => {
        console.log('🔄 Changing group to:', groupID);
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
        
        try {
            setLoading(true);
            
            const saveData = rightsData.map(({ id, ...rest }) => rest);
            
            console.log('💾 Saving rights for group:', selectedGroup);
            console.log('📝 Save data:', saveData);
            
            // Use postData for save
            await postData("User/SaveUserRights", {
                UserRightsData: saveData,
                ActiveUserDetails: {
                    sUserDomainName: "SDMS",
                    sSessionID: sessionStorage.getItem('sessionID') || "",
                    sUserID: sessionStorage.getItem('userID') || "",
                    sTimeZoneID: "Asia/Kolkata<~>true",
                    sApplicationName: "SDMS",
                    sdbtype: "MSSQL",
                    sUsername: sessionStorage.getItem('username') || "",
                    sSiteCode: sessionStorage.getItem('siteCode') || "",
                    sCategories: "DB",
                    sUserGroupID: sessionStorage.getItem('userGroupID') || "",
                    sUserStatus: "",
                    sTenantID: ""
                },
                ApplicationCode: "SDMS"
            });
            
            console.log('✅ Save successful');
            showInfoDialog(t('usermanagement.userrightssavesuccess') || 'User rights saved successfully', "success");
            fetchUserRights(selectedGroup);
        } catch (error) {
            console.error('💥 Error saving user rights:', error);
            showInfoDialog(t('usermanagement.userrightssavefailed') || 'Failed to save user rights', "error");
        } finally {
            setLoading(false);
        }
    }, [selectedGroup, rightsData, postData, showInfoDialog, t, fetchUserRights]);

    const handlePrint = useCallback(() => {
        if (rightsData.length === 0) {
            showInfoDialog(t('usermanagement.nodataprint') || 'No data available to print', "warning");
            return;
        }
        
        window.print();
    }, [rightsData, showInfoDialog, t]);

    // Memoize handlers to prevent column recreation
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
                            {row.sModuleName}
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
                <div style={{ 
                    fontSize: '12px', 
                    fontFamily: 'verdana',
                    color: '#8b4513',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {row.sDisplayTopic}
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
            isSelectionColumn: true,
            getCheckValue: (row) => row.sCreate,
            hideHeaderSelection: true,
            render: (row, isSelected) => {
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
                            onClick={(e) => e.stopPropagation()}
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
            isSelectionColumn: true,
            getCheckValue: (row) => row.sEdit,
            hideHeaderSelection: true,
            render: (row, isSelected) => {
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
                            onClick={(e) => e.stopPropagation()}
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
            isSelectionColumn: true,
            getCheckValue: (row) => row.sDelete,
            hideHeaderSelection: true,
            render: (row, isSelected) => {
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
                            onClick={(e) => e.stopPropagation()}
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
            isSelectionColumn: true,
            getCheckValue: (row) => row.sAllow,
            hideHeaderSelection: true,
            render: (row, isSelected) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        checked={row.sAllow === "1"}
                        onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sAllow', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )
        }
    ], [createAll, editAll, deleteAll, allowAll, t, 
        memoizedHandleCreateAll, memoizedHandleEditAll, 
        memoizedHandleDeleteAll, memoizedHandleAllowAll, 
        memoizedHandleCheckboxChange]);

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

    // Show empty state if no groups
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
                    {infoDialog.open ? infoDialog.message : (t('usermanagement.nogroupsavailable') || 'No User Groups Available')}
                </div>
                <div style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    Unable to fetch user groups from the server. Please check your connection and try again.
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
            {/* Error/Info Dialog */}
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

            {/* Header Section */}
            <div style={{ 
                padding: '15px',
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Group Selection and Select All */}
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
                                        {group.L01UserGroupName}
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

                    {/* Action Buttons */}
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

            {/* Main Grid */}
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
                        data={filteredData}
                        searchable={false}
                        selectable={false}
                        hidePagination={false}
                    />
                )}
            </div>
        </div>
    );
};

export default UserRights;








// import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// import { Save, Printer } from 'lucide-react';
// import { useNavigate } from 'react-router-dom'; // Add this import
// import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
// import { useTranslation } from 'react-i18next';
// import Errordialog from '../../../../Layout/Common/Errordialog';
// import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
// import servicecall from '../../../../../Services/servicecall';

// const UserRights = () => {
//     const navigate = useNavigate(); // Add navigate
//     const [userGroups, setUserGroups] = useState([]);
//     const [selectedGroup, setSelectedGroup] = useState('');
//     const [rightsData, setRightsData] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [infoDialog, setInfoDialog] = useState({
//         open: false,
//         message: "",
//         type: "information"
//     });
//     const [selectAll, setSelectAll] = useState(false);
//     const [createAll, setCreateAll] = useState(false);
//     const [editAll, setEditAll] = useState(false);
//     const [deleteAll, setDeleteAll] = useState(false);
//     const [allowAll, setAllowAll] = useState(false);
//     const { t } = useTranslation();
    
//     const { postData } = servicecall();
//     const isInitialMount = useRef(true);

//     const showInfoDialog = useCallback((message, type = "information") => {
//         setInfoDialog({
//             open: true,
//             message,
//             type
//         });
//     }, []);

//     const closeInfoDialog = useCallback(() => {
//         setInfoDialog(prev => ({ ...prev, open: false }));
//     }, []);

//     // Check if user is authenticated
//     const isAuthenticated = useCallback(() => {
//         const sessionID = sessionStorage.getItem('sessionID');
//         const username = sessionStorage.getItem('username');
//         return !!(sessionID && username);
//     }, []);

//     const getSessionValue = useCallback((key) => {
//         const value = sessionStorage.getItem(key) || '';
//         // For specific keys that need padding, add trailing spaces
//         if (key === 'siteCode' || key === 'userGroupID') {
//             return value.padEnd(10, ' '); // Pad to 10 characters with spaces
//         }
//         return value;
//     }, []);

//     const updateCheckboxStates = useCallback((data) => {
//         if (!data || data.length === 0) {
//             setCreateAll(false);
//             setEditAll(false);
//             setDeleteAll(false);
//             setAllowAll(false);
//             setSelectAll(false);
//             return;
//         }
        
//         const allCreateChecked = data.every(item => item.sCreate === "NA" || item.sCreate === "1");
//         const allEditChecked = data.every(item => item.sEdit === "NA" || item.sEdit === "1");
//         const allDeleteChecked = data.every(item => item.sDelete === "NA" || item.sDelete === "1");
//         const allAllowChecked = data.every(item => item.sAllow === "1");
//         const allChecked = data.every(item => 
//             (item.sCreate === "NA" || item.sCreate === "1") &&
//             (item.sEdit === "NA" || item.sEdit === "1") &&
//             (item.sDelete === "NA" || item.sDelete === "1") &&
//             item.sAllow === "1"
//         );
        
//         setCreateAll(allCreateChecked);
//         setEditAll(allEditChecked);
//         setDeleteAll(allDeleteChecked);
//         setAllowAll(allAllowChecked);
//         setSelectAll(allChecked);
//     }, []);

//     const fetchUserRights = useCallback(async (groupID) => {
//         if (!groupID) return;
        
//         setLoading(true);
//         try {
//             console.log('📡 Fetching rights for group:', groupID);
            
//             // Prepare ActiveUserDetails with proper padding
//             const activeUserDetails = {
//                 sUserDomainName: "SDMS",
//                 sSessionID: getSessionValue('sessionID'),
//                 sUserID: getSessionValue('userID'),
//                 sTimeZoneID: "Asia/Kolkata<~>true",
//                 sApplicationName: "SDMS",
//                 sdbtype: "MSSQL",
//                 sUsername: getSessionValue('username'),
//                 sSiteCode: getSessionValue('siteCode'),
//                 sCategories: "DB",
//                 sUserGroupID: getSessionValue('userGroupID'),
//                 sUserStatus: "",
//                 sTenantID: ""
//             };
            
//             console.log('ActiveUserDetails for rights:', activeUserDetails);
            
//             const requestData = {
//                 sUserGroupFilterID: groupID.padEnd(10, ' '), // Pad group ID
//                 ActiveUserDetails: activeUserDetails,
//                 ApplicationCode: "SDMS"
//             };
            
//             console.log('Request data for UserRightsGrid:', JSON.stringify(requestData, null, 2));
            
//             const data = await postData("User/UserRightsGrid", requestData);
            
//             console.log('✅ Rights data received:', data);
            
//             const dataWithIds = Array.isArray(data) ? data.map((item, index) => ({
//                 ...item,
//                 id: `${groupID}-${index}`
//             })) : [];
            
//             setRightsData(dataWithIds);
//             setFilteredData(dataWithIds);
//             updateCheckboxStates(dataWithIds);
//         } catch (error) {
//             console.error('💥 Error fetching user rights:', error);
//             showInfoDialog(t('usermanagement.failedtofetchuserrights') || 'Failed to fetch user rights', "error");
//         } finally {
//             setLoading(false);
//         }
//     }, [postData, showInfoDialog, t, updateCheckboxStates, getSessionValue]);

//     const fetchUserGroups = useCallback(async () => {
//         // Check authentication first
//         if (!isAuthenticated()) {
//             console.warn('⚠️ User not authenticated, redirecting to login...');
//             showInfoDialog('Please login first to access User Rights.', "error");
            
//             // Redirect to login after a delay
//             setTimeout(() => {
//                 navigate('/login');
//             }, 2000);
            
//             setLoading(false);
//             return;
//         }
        
//         setLoading(true);
//         try {
//             console.log('🔍 Starting fetchUserGroups...');
            
//             // First, check session storage
//             console.log('Session storage values:', {
//                 sessionID: sessionStorage.getItem('sessionID'),
//                 userID: sessionStorage.getItem('userID'),
//                 username: sessionStorage.getItem('username'),
//                 siteCode: sessionStorage.getItem('siteCode'),
//                 userGroupID: sessionStorage.getItem('userGroupID')
//             });
            
//             // Prepare ActiveUserDetails with proper padding
//             const activeUserDetails = {
//                 sUserDomainName: "SDMS",
//                 sSessionID: getSessionValue('sessionID'),
//                 sUserID: getSessionValue('userID'),
//                 sTimeZoneID: "Asia/Kolkata<~>true",
//                 sApplicationName: "SDMS",
//                 sdbtype: "MSSQL",
//                 sUsername: getSessionValue('username'),
//                 sSiteCode: getSessionValue('siteCode'),
//                 sCategories: "DB",
//                 sUserGroupID: getSessionValue('userGroupID'),
//                 sUserStatus: "",
//                 sTenantID: ""
//             };
            
//             console.log('ActiveUserDetails for groups:', activeUserDetails);
            
//             const requestData = {
//                 ActiveUserDetails: activeUserDetails,
//                 ApplicationCode: "SDMS"
//             };
            
//             console.log('Request data for UserRightsCombo:', JSON.stringify(requestData, null, 2));
            
//             const data = await postData("User/UserRightsCombo", requestData);
            
//             console.log('✅ Raw API response:', data);
            
//             // Try different ways to extract data
//             let groupsData = data;
            
//             // Check if data is directly the array
//             if (Array.isArray(groupsData)) {
//                 console.log('Data is directly an array');
//             } 
//             // Check if data is nested
//             else if (data && typeof data === 'object') {
//                 console.log('Data is an object, checking for nested array...');
                
//                 // Try to find the array in common property names
//                 const arrayProperties = Object.keys(data).filter(key => Array.isArray(data[key]));
//                 console.log('Array properties found:', arrayProperties);
                
//                 if (arrayProperties.length > 0) {
//                     groupsData = data[arrayProperties[0]];
//                     console.log(`Using data from property "${arrayProperties[0]}":`, groupsData);
//                 }
//             }
            
//             console.log('✅ Final groups data:', groupsData);
            
//             // Check if data is valid array
//             if (Array.isArray(groupsData) && groupsData.length > 0) {
//                 // Trim whitespace from group IDs for display
//                 const formattedGroups = groupsData.map(group => ({
//                     ...group,
//                     L01UserGroupID: (group.L01UserGroupID || '').trim(),
//                     L01UserGroupName: (group.L01UserGroupName || '').trim()
//                 }));
                
//                 console.log('📊 Formatted groups:', formattedGroups);
//                 setUserGroups(formattedGroups);
                
//                 // Select the first group
//                 const firstGroupID = formattedGroups[0].L01UserGroupID;
//                 console.log('🎯 Selecting first group:', firstGroupID);
//                 setSelectedGroup(firstGroupID);
                
//                 // Fetch rights for the first group
//                 await fetchUserRights(firstGroupID);
//             } else {
//                 console.warn('⚠️ No user groups found or empty array');
//                 setUserGroups([]);
                
//                 // TEMPORARY: Use mock data for development
//                 // useMockData();
//             }
//         } catch (error) {
//             console.error('🌐 Network error fetching user groups:', error);
//             console.error('Error details:', error.message);
            
//             // TEMPORARY: Use mock data for development
//             // useMockData();
//         } finally {
//             setLoading(false);
//         }
//     }, [postData, showInfoDialog, t, fetchUserRights, getSessionValue, isAuthenticated, navigate]);

//     // Function to use mock data for development
//     const useMockData = useCallback(() => {
//         console.log('🔧 Using mock data for development...');
        
//         const mockGroups = [
//             { L01UserGroupID: 'G1', L01UserGroupName: 'Administrator' },
//             { L01UserGroupID: 'G2', L01UserGroupName: 'SDMS' },
//             { L01UserGroupID: 'G3', L01UserGroupName: 'Managers' },
//             { L01UserGroupID: 'G4', L01UserGroupName: 'Operators' }
//         ];
        
//         const mockRights = [
//             {
//                 sUserGroupID: "G1        ",
//                 sModuleName: "Data Explorer",
//                 sDisplayTopic: "Open",
//                 sCreate: "NA",
//                 sEdit: "NA",
//                 sDelete: "NA",
//                 sAllow: "1",
//                 nOrder: 1
//             },
//             {
//                 sUserGroupID: "G1        ",
//                 sModuleName: "Data Explorer",
//                 sDisplayTopic: "Download",
//                 sCreate: "NA",
//                 sEdit: "NA",
//                 sDelete: "NA",
//                 sAllow: "1",
//                 nOrder: 2
//             },
//             {
//                 sUserGroupID: "G1        ",
//                 sModuleName: "Scheduler",
//                 sDisplayTopic: "Scheduler",
//                 sCreate: "1",
//                 sEdit: "1",
//                 sDelete: "NA",
//                 sAllow: "1",
//                 nOrder: 27
//             },
//             {
//                 sUserGroupID: "G1        ",
//                 sModuleName: "User Management",
//                 sDisplayTopic: "User Master",
//                 sCreate: "1",
//                 sEdit: "1",
//                 sDelete: "1",
//                 sAllow: "1",
//                 nOrder: 39
//             }
//         ].map((item, index) => ({ ...item, id: `G1-${index}` }));
        
//         setUserGroups(mockGroups);
//         setSelectedGroup('G1');
//         setRightsData(mockRights);
//         setFilteredData(mockRights);
//         updateCheckboxStates(mockRights);
        
//         showInfoDialog('Using demo data. Please login for real data.', "information");
//     }, [showInfoDialog, updateCheckboxStates]);

//     useEffect(() => {
//         // Check if user is logged in
//         if (!isAuthenticated()) {
//             console.log('🚫 User not authenticated');
            
//             // Ask user if they want to use demo data or login
//             const useDemo = window.confirm('You are not logged in. Would you like to use demo data for development?');
            
//             if (useDemo) {
//                 // useMockData();
//             } else {
//                 showInfoDialog('Please login first to access User Rights.', "error");
//                 setTimeout(() => {
//                     navigate('/login');
//                 }, 2000);
//             }
//             setLoading(false);
//             return;
//         }
        
//         console.log('✅ User is logged in');
//         fetchUserGroups();
//         isInitialMount.current = false;
//     }, [fetchUserGroups, showInfoDialog, navigate, isAuthenticated, useMockData]);

//     // [Keep all your other functions: handleGroupChange, handleSelectAll, handleCreateAll, etc.]
//     const handleGroupChange = useCallback((groupID) => {
//         console.log('🔄 Changing group to:', groupID);
//         setSelectedGroup(groupID);
//         setSelectAll(false);
//         setCreateAll(false);
//         setEditAll(false);
//         setDeleteAll(false);
//         setAllowAll(false);
        
//         if (groupID) {
//             fetchUserRights(groupID);
//         }
//     }, [fetchUserRights]);

//     const handleSelectAll = useCallback((checked) => {
//         setSelectAll(checked);
//         setCreateAll(checked);
//         setEditAll(checked);
//         setDeleteAll(checked);
//         setAllowAll(checked);
        
//         const updatedData = rightsData.map(item => {
//             const newItem = { ...item };
            
//             if (newItem.sCreate !== "NA") {
//                 newItem.sCreate = checked ? "1" : "0";
//             }
            
//             if (newItem.sEdit !== "NA") {
//                 newItem.sEdit = checked ? "1" : "0";
//             }
            
//             if (newItem.sDelete !== "NA") {
//                 newItem.sDelete = checked ? "1" : "0";
//             }
            
//             newItem.sAllow = checked ? "1" : "0";
            
//             return newItem;
//         });
        
//         setRightsData(updatedData);
//         setFilteredData(updatedData);
//     }, [rightsData]);

//     const handleCreateAll = useCallback((checked) => {
//         setCreateAll(checked);
        
//         const updatedData = rightsData.map(item => {
//             if (item.sCreate !== "NA") {
//                 return { ...item, sCreate: checked ? "1" : "0" };
//             }
//             return item;
//         });
        
//         setRightsData(updatedData);
//         setFilteredData(updatedData);
        
//         const allChecked = updatedData.every(item => 
//             (item.sCreate === "NA" || item.sCreate === "1") &&
//             (item.sEdit === "NA" || item.sEdit === "1") &&
//             (item.sDelete === "NA" || item.sDelete === "1") &&
//             item.sAllow === "1"
//         );
//         setSelectAll(allChecked);
//     }, [rightsData]);

//     const handleEditAll = useCallback((checked) => {
//         setEditAll(checked);
        
//         const updatedData = rightsData.map(item => {
//             if (item.sEdit !== "NA") {
//                 return { ...item, sEdit: checked ? "1" : "0" };
//             }
//             return item;
//         });
        
//         setRightsData(updatedData);
//         setFilteredData(updatedData);
        
//         const allChecked = updatedData.every(item => 
//             (item.sCreate === "NA" || item.sCreate === "1") &&
//             (item.sEdit === "NA" || item.sEdit === "1") &&
//             (item.sDelete === "NA" || item.sDelete === "1") &&
//             item.sAllow === "1"
//         );
//         setSelectAll(allChecked);
//     }, [rightsData]);

//     const handleDeleteAll = useCallback((checked) => {
//         setDeleteAll(checked);
        
//         const updatedData = rightsData.map(item => {
//             if (item.sDelete !== "NA") {
//                 return { ...item, sDelete: checked ? "1" : "0" };
//             }
//             return item;
//         });
        
//         setRightsData(updatedData);
//         setFilteredData(updatedData);
        
//         const allChecked = updatedData.every(item => 
//             (item.sCreate === "NA" || item.sCreate === "1") &&
//             (item.sEdit === "NA" || item.sEdit === "1") &&
//             (item.sDelete === "NA" || item.sDelete === "1") &&
//             item.sAllow === "1"
//         );
//         setSelectAll(allChecked);
//     }, [rightsData]);

//     const handleAllowAll = useCallback((checked) => {
//         setAllowAll(checked);
        
//         const updatedData = rightsData.map(item => ({
//             ...item,
//             sAllow: checked ? "1" : "0"
//         }));
        
//         setRightsData(updatedData);
//         setFilteredData(updatedData);
        
//         const allChecked = updatedData.every(item => 
//             (item.sCreate === "NA" || item.sCreate === "1") &&
//             (item.sEdit === "NA" || item.sEdit === "1") &&
//             (item.sDelete === "NA" || item.sDelete === "1") &&
//             item.sAllow === "1"
//         );
//         setSelectAll(allChecked);
//     }, [rightsData]);

//     const handleCheckboxChange = useCallback((rowId, field, value) => {
//         const updatedData = rightsData.map(item => {
//             if (item.id === rowId) {
//                 return { ...item, [field]: value ? "1" : "0" };
//             }
//             return item;
//         });
        
//         setRightsData(updatedData);
//         setFilteredData(updatedData);
        
//         const allCreateChecked = updatedData.every(item => 
//             item.sCreate === "NA" || item.sCreate === "1"
//         );
//         const allEditChecked = updatedData.every(item => 
//             item.sEdit === "NA" || item.sEdit === "1"
//         );
//         const allDeleteChecked = updatedData.every(item => 
//             item.sDelete === "NA" || item.sDelete === "1"
//         );
//         const allAllowChecked = updatedData.every(item => 
//             item.sAllow === "1"
//         );
//         const allChecked = updatedData.every(item => 
//             (item.sCreate === "NA" || item.sCreate === "1") &&
//             (item.sEdit === "NA" || item.sEdit === "1") &&
//             (item.sDelete === "NA" || item.sDelete === "1") &&
//             item.sAllow === "1"
//         );
        
//         setCreateAll(allCreateChecked);
//         setEditAll(allEditChecked);
//         setDeleteAll(allDeleteChecked);
//         setAllowAll(allAllowChecked);
//         setSelectAll(allChecked);
//     }, [rightsData]);

//     const handleSave = useCallback(async () => {
//         if (!selectedGroup) {
//             showInfoDialog(t('usermanagement.selectgrouptosave') || 'Please select a group to save', "warning");
//             return;
//         }
        
//         try {
//             setLoading(true);
            
//             const saveData = rightsData.map(({ id, ...rest }) => rest);
            
//             console.log('💾 Saving rights for group:', selectedGroup);
//             console.log('📝 Save data:', saveData);
            
//             // If using mock data, just show success message
//             if (!isAuthenticated()) {
//                 console.log('Demo mode: Simulating save');
//                 setTimeout(() => {
//                     showInfoDialog('Demo: User rights saved successfully (simulated)', "success");
//                     setLoading(false);
//                 }, 1000);
//                 return;
//             }
            
//             // Real save for authenticated users
//             await postData("User/SaveUserRights", {
//                 UserRightsData: saveData,
//                 ActiveUserDetails: {
//                     sUserDomainName: "SDMS",
//                     sSessionID: getSessionValue('sessionID'),
//                     sUserID: getSessionValue('userID'),
//                     sTimeZoneID: "Asia/Kolkata<~>true",
//                     sApplicationName: "SDMS",
//                     sdbtype: "MSSQL",
//                     sUsername: getSessionValue('username'),
//                     sSiteCode: getSessionValue('siteCode'),
//                     sCategories: "DB",
//                     sUserGroupID: getSessionValue('userGroupID'),
//                     sUserStatus: "",
//                     sTenantID: ""
//                 },
//                 ApplicationCode: "SDMS"
//             });
            
//             console.log('✅ Save successful');
//             showInfoDialog(t('usermanagement.userrightssavesuccess') || 'User rights saved successfully', "success");
//             fetchUserRights(selectedGroup);
//         } catch (error) {
//             console.error('💥 Error saving user rights:', error);
//             showInfoDialog(t('usermanagement.userrightssavefailed') || 'Failed to save user rights', "error");
//         } finally {
//             setLoading(false);
//         }
//     }, [selectedGroup, rightsData, postData, showInfoDialog, t, fetchUserRights, getSessionValue, isAuthenticated]);

//     const handlePrint = useCallback(() => {
//         if (rightsData.length === 0) {
//             showInfoDialog(t('usermanagement.nodataprint') || 'No data available to print', "warning");
//             return;
//         }
        
//         window.print();
//     }, [rightsData, showInfoDialog, t]);

//     // [Keep memoized handlers and columns useMemo - same as before]
//     const memoizedHandleCreateAll = useCallback((checked) => handleCreateAll(checked), [handleCreateAll]);
//     const memoizedHandleEditAll = useCallback((checked) => handleEditAll(checked), [handleEditAll]);
//     const memoizedHandleDeleteAll = useCallback((checked) => handleDeleteAll(checked), [handleDeleteAll]);
//     const memoizedHandleAllowAll = useCallback((checked) => handleAllowAll(checked), [handleAllowAll]);
//     const memoizedHandleCheckboxChange = useCallback((rowId, field, value) => 
//         handleCheckboxChange(rowId, field, value), [handleCheckboxChange]);

//     const columns = useMemo(() => [
//         {
//             key: 'sModuleName',
//             label: t('usermanagement.modulename') || 'Module Name',
//             width: 200,
//             enableSearch: true,
//             enableSort: false,
//             render: (row, isSelected, index, rows) => {
//                 if (index === 0 || row.sModuleName !== rows[index - 1]?.sModuleName) {
//                     return (
//                         <div style={{ 
//                             fontSize: '12px', 
//                             fontFamily: 'verdana',
//                             fontWeight: 'bold',
//                             color: '#8b4513',
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             whiteSpace: 'nowrap'
//                         }}>
//                             {row.sModuleName}
//                         </div>
//                     );
//                 }
//                 return <div></div>;
//             }
//         },
//         {
//             key: 'sDisplayTopic',
//             label: t('usermanagement.taskname') || 'Task Name',
//             width: 200,
//             enableSort: false,
//             enableSearch: true,
//             render: (row, isSelected) => (
//                 <div style={{ 
//                     fontSize: '12px', 
//                     fontFamily: 'verdana',
//                     color: '#8b4513',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap'
//                 }}>
//                     {row.sDisplayTopic}
//                 </div>
//             )
//         },
//         {
//             key: 'sCreate',
//             label: (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
//                     <input
//                         type="checkbox"
//                         checked={createAll}
//                         onChange={(e) => memoizedHandleCreateAll(e.target.checked)}
//                         style={{ cursor: 'pointer', marginRight: '5px' }}
//                     />
//                     {t('usermanagement.create') || 'Create'}
//                 </div>
//             ),
//             width: 120,
//             enableSearch: false,
//             enableSort: false,
//             isSelectionColumn: true,
//             getCheckValue: (row) => row.sCreate,
//             hideHeaderSelection: true,
//             render: (row, isSelected) => {
//                 if (row.sCreate === "NA") {
//                     return (
//                         <div style={{ 
//                             fontSize: '12px', 
//                             fontFamily: 'verdana',
//                             color: '#6b7280',
//                             fontWeight: 'bold',
//                             textAlign: 'center'
//                         }}>
//                             NA
//                         </div>
//                     );
//                 }
//                 return (
//                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         <input
//                             type="checkbox"
//                             checked={row.sCreate === "1"}
//                             onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sCreate', e.target.checked)}
//                             style={{ cursor: 'pointer' }}
//                             onClick={(e) => e.stopPropagation()}
//                         />
//                     </div>
//                 );
//             }
//         },
//         {
//             key: 'sEdit',
//             label: (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
//                     <input
//                         type="checkbox"
//                         checked={editAll}
//                         onChange={(e) => memoizedHandleEditAll(e.target.checked)}
//                         style={{ cursor: 'pointer', marginRight: '5px' }}
//                     />
//                     {t('usermanagement.edit') || 'Edit'}
//                 </div>
//             ),
//             width: 120,
//             enableSearch: false,
//             enableSort: false,
//             isSelectionColumn: true,
//             getCheckValue: (row) => row.sEdit,
//             hideHeaderSelection: true,
//             render: (row, isSelected) => {
//                 if (row.sEdit === "NA") {
//                     return (
//                         <div style={{ 
//                             fontSize: '12px', 
//                             fontFamily: 'verdana',
//                             color: '#6b7280',
//                             fontWeight: 'bold',
//                             textAlign: 'center'
//                         }}>
//                             NA
//                         </div>
//                     );
//                 }
//                 return (
//                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         <input
//                             type="checkbox"
//                             checked={row.sEdit === "1"}
//                             onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sEdit', e.target.checked)}
//                             style={{ cursor: 'pointer' }}
//                             onClick={(e) => e.stopPropagation()}
//                         />
//                     </div>
//                 );
//             }
//         },
//         {
//             key: 'sDelete',
//             label: (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
//                     <input
//                         type="checkbox"
//                         checked={deleteAll}
//                         onChange={(e) => memoizedHandleDeleteAll(e.target.checked)}
//                         style={{ cursor: 'pointer', marginRight: '5px' }}
//                     />
//                     {t('usermanagement.delete') || 'Delete'}
//                 </div>
//             ),
//             width: 120,
//             enableSearch: false,
//             enableSort: false,
//             isSelectionColumn: true,
//             getCheckValue: (row) => row.sDelete,
//             hideHeaderSelection: true,
//             render: (row, isSelected) => {
//                 if (row.sDelete === "NA") {
//                     return (
//                         <div style={{ 
//                             fontSize: '12px', 
//                             fontFamily: 'verdana',
//                             color: '#6b7280',
//                             fontWeight: 'bold',
//                             textAlign: 'center'
//                         }}>
//                             NA
//                         </div>
//                     );
//                 }
//                 return (
//                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         <input
//                             type="checkbox"
//                             checked={row.sDelete === "1"}
//                             onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sDelete', e.target.checked)}
//                             style={{ cursor: 'pointer' }}
//                             onClick={(e) => e.stopPropagation()}
//                         />
//                     </div>
//                 );
//             }
//         },
//         {
//             key: 'sAllow',
//             label: (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
//                     <input
//                         type="checkbox"
//                         checked={allowAll}
//                         onChange={(e) => memoizedHandleAllowAll(e.target.checked)}
//                         style={{ cursor: 'pointer', marginRight: '5px' }}
//                     />
//                     {t('usermanagement.allow') || 'Allow'}
//                 </div>
//             ),
//             width: 120,
//             enableSearch: false,
//             enableSort: false,
//             isSelectionColumn: true,
//             getCheckValue: (row) => row.sAllow,
//             hideHeaderSelection: true,
//             render: (row, isSelected) => (
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <input
//                         type="checkbox"
//                         checked={row.sAllow === "1"}
//                         onChange={(e) => memoizedHandleCheckboxChange(row.id, 'sAllow', e.target.checked)}
//                         style={{ cursor: 'pointer' }}
//                         onClick={(e) => e.stopPropagation()}
//                     />
//                 </div>
//             )
//         }
//     ], [createAll, editAll, deleteAll, allowAll, t, 
//         memoizedHandleCreateAll, memoizedHandleEditAll, 
//         memoizedHandleDeleteAll, memoizedHandleAllowAll, 
//         memoizedHandleCheckboxChange]);

//     if (loading) {
//         return (
//             <div style={{ 
//                 display: 'flex', 
//                 flexDirection: 'column',
//                 alignItems: 'center', 
//                 justifyContent: 'center', 
//                 height: '100vh',
//                 fontFamily: 'Roboto, sans-serif',
//                 backgroundColor: '#f9fafb'
//             }}>
//                 <div style={{ 
//                     color: '#6b7280',
//                     fontSize: '16px',
//                     marginBottom: '10px'
//                 }}>
//                     {t('masters.loading') || 'Loading...'}
//                 </div>
//                 <div style={{ 
//                     fontSize: '12px',
//                     color: '#9ca3af'
//                 }}>
//                     {isAuthenticated() ? 'Fetching user rights data...' : 'Checking authentication...'}
//                 </div>
//             </div>
//         );
//     }

//     const ActionButton = ({ icon: Icon, label, disabled, onClick, variant = "default" }) => (
//         <button
//             onClick={onClick}
//             disabled={disabled}
//             style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '6px',
//                 padding: '6px 10px',
//                 fontSize: '12px',
//                 fontWeight: 'bold',
//                 borderRadius: '4px',
//                 border: 'none',
//                 cursor: disabled ? 'not-allowed' : 'pointer',
//                 transition: 'all 0.2s ease',
//                 whiteSpace: 'nowrap',
//                 backgroundColor: disabled 
//                     ? '#f8fafc' 
//                     : variant === 'primary'
//                         ? '#2883FE'
//                         : '#f1f5f9',
//                 color: disabled 
//                     ? '#cbd5e1' 
//                     : variant === 'primary'
//                         ? 'white'
//                         : '#2883FE'
//             }}
//         >
//             {Icon && <Icon style={{ width: '14px', height: '14px' }} />}
//             <span>{label}</span>
//         </button>
//     );

//     // Show empty state if no groups
//     if (!loading && userGroups.length === 0 && isAuthenticated()) {
//         return (
//             <div style={{ 
//                 display: 'flex', 
//                 flexDirection: 'column',
//                 alignItems: 'center', 
//                 justifyContent: 'center', 
//                 height: '100vh',
//                 fontFamily: 'Roboto, sans-serif',
//                 backgroundColor: '#f9fafb',
//                 gap: '20px',
//                 padding: '20px'
//             }}>
//                 <div style={{ 
//                     color: '#ef4444', 
//                     fontSize: '18px', 
//                     fontWeight: 'bold',
//                     textAlign: 'center'
//                 }}>
//                     {infoDialog.open ? infoDialog.message : (t('usermanagement.nogroupsavailable') || 'No User Groups Available')}
//                 </div>
//                 <div style={{ 
//                     fontSize: '14px', 
//                     color: '#6b7280', 
//                     textAlign: 'center',
//                     maxWidth: '400px'
//                 }}>
//                     Unable to fetch user groups from the server. Please check your connection and try again.
//                 </div>
//                 <button 
//                     onClick={() => {
//                         setLoading(true);
//                         fetchUserGroups();
//                     }}
//                     style={{
//                         padding: '10px 20px',
//                         backgroundColor: '#2883FE',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         cursor: 'pointer',
//                         fontSize: '14px',
//                         fontWeight: 'bold'
//                     }}
//                 >
//                     {t('button.retry') || 'Retry'}
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div style={{ 
//             display: 'flex', 
//             flexDirection: 'column',
//             fontFamily: 'Roboto, sans-serif',
//             backgroundColor: '#f9fafb',
//             height: '100%',
//             overflow: 'hidden'
//         }}>
//             {/* Error/Info Dialog */}
//             {infoDialog.open && (
//                 <Errordialog
//                     message={infoDialog.message}
//                     type={infoDialog.type}
//                     onClose={closeInfoDialog}
//                 />
//             )}

//             {/* Header Section */}
//             <div style={{ 
//                 padding: '15px',
//                 background: 'white',
//                 borderBottom: '1px solid #e5e7eb',
//                 flexShrink: 0
//             }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     {/* Group Selection and Select All */}
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                             <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
//                                 {t('usermanagement.groupname') || 'Group Name'}:
//                             </label>
//                             <AnimatedDropdown
//                                 value={selectedGroup}
//                                 onChange={(e) => handleGroupChange(e.target.value)}
//                                 style={{
//                                     width: '200px',
//                                     padding: '6px 10px',
//                                     fontSize: '12px',
//                                     border: '1px solid #d1d5db',
//                                     borderRadius: '4px',
//                                     outline: 'none',
//                                     backgroundColor: 'white'
//                                 }}
//                             >
//                                 <option value="">{t('usermanagement.selectgroup') || 'Select Group'}</option>
//                                 {userGroups.map(group => (
//                                     <option key={group.L01UserGroupID} value={group.L01UserGroupID}>
//                                         {group.L01UserGroupName}
//                                     </option>
//                                 ))}
//                             </AnimatedDropdown>
//                         </div>
                        
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '30px' }}>
//                             <input
//                                 type="checkbox"
//                                 id="selectAllCheckbox"
//                                 checked={selectAll}
//                                 onChange={(e) => handleSelectAll(e.target.checked)}
//                                 style={{ cursor: 'pointer', width: '14px', height: '14px' }}
//                             />
//                             <label 
//                                 htmlFor="selectAllCheckbox"
//                                 style={{ 
//                                     fontSize: '12px', 
//                                     color: '#374151',
//                                     cursor: 'pointer',
//                                     marginLeft: '5px',
//                                     userSelect: 'none'
//                                 }}
//                             >
//                                 {t('usermanagement.selectall') || 'Select All'}
//                             </label>
//                         </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                         <ActionButton
//                             icon={Printer}
//                             label={t('usermanagement.print') || 'Print'}
//                             onClick={handlePrint}
//                             disabled={rightsData.length === 0}
//                         />
//                         <ActionButton
//                             icon={Save}
//                             label={t('button.save') || 'Save'}
//                             onClick={handleSave}
//                             disabled={!selectedGroup || rightsData.length === 0}
//                             variant="primary"
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Main Grid */}
//             <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
//                 {filteredData.length === 0 && !loading ? (
//                     <div style={{ 
//                         display: 'flex', 
//                         alignItems: 'center', 
//                         justifyContent: 'center', 
//                         height: '100%',
//                         color: '#6b7280',
//                         fontSize: '14px',
//                         flexDirection: 'column',
//                         gap: '10px'
//                     }}>
//                         <div>
//                             {selectedGroup 
//                                 ? (t('usermanagement.norightsfound') || 'No rights found for this group')
//                                 : (t('usermanagement.selectgroupfirst') || 'Please select a group first')
//                             }
//                         </div>
//                         {selectedGroup && (
//                             <button 
//                                 onClick={() => fetchUserRights(selectedGroup)}
//                                 style={{
//                                     padding: '8px 16px',
//                                     backgroundColor: '#f1f5f9',
//                                     color: '#2883FE',
//                                     border: '1px solid #d1d5db',
//                                     borderRadius: '4px',
//                                     cursor: 'pointer',
//                                     fontSize: '12px',
//                                     fontWeight: 'bold'
//                                 }}
//                             >
//                                 {t('button.refresh') || 'Refresh'}
//                             </button>
//                         )}
//                     </div>
//                 ) : (
//                     <GridLayout
//                         key={`user-rights-grid-${selectedGroup}`}
//                         columns={columns}
//                         data={filteredData}
//                         searchable={false}
//                         selectable={false}
//                         hidePagination={false}
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default UserRights;