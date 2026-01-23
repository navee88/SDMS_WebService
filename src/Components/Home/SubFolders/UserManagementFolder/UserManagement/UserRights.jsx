import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import FullPageLoader from '../../../../Layout/Common/FullPageLoader';
import PrintTable from '../../../../Layout/Common/PrintTable';
import servicecall from '../../../../../Services/servicecall';
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';

const UserRights = () => {
    const [userGroups, setUserGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [rightsData, setRightsData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fullPageLoading, setFullPageLoading] = useState(false);
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });
    const [printDialog, setPrintDialog] = useState({
        open: false,
        title: '',
        subtitle: '',
        columns: [],
        rows: [],
        printRequest: null
    });
    const [selectAll, setSelectAll] = useState(false);
    const [createAll, setCreateAll] = useState(false);
    const [editAll, setEditAll] = useState(false);
    const [deleteAll, setDeleteAll] = useState(false);
    const [allowAll, setAllowAll] = useState(false);
    const { t } = useTranslation();
    const { postData } = servicecall();
    const isInitialMount = useRef(true);

    // Add this useEffect to fix styling issues
    useEffect(() => {
        // Create and inject custom CSS
        const style = document.createElement('style');
        style.textContent = `
            /* Fix GridLayout clipping */
            .grid-layout-container, [class*="Grid"], [class*="grid"] {
                overflow: visible !important;
                position: relative !important;
                z-index: 0 !important;
            }
            
            /* Fix AnimatedDropdown options */
            .animated-dropdown-container, [class*="Dropdown"], [class*="dropdown"] {
                position: relative !important;
                z-index: 1000 !important;
            }
            
            .dropdown-options, [class*="dropdown-menu"], [class*="options"] {
                z-index: 1001 !important;
                overflow: visible !important;
                position: absolute !important;
            }
            
            /* Center dropdown text */
            .dropdown-item, [class*="dropdown-item"] {
                display: flex !important;
                align-items: center !important;
                padding-top: 4px !important;
                padding-bottom: 4px !important;
                padding-left: 12px !important;
                min-height: 32px !important;
                text-align: center !important;
            }
            
            /* Ensure parent containers don't clip */
            .overflow-auto, .overflow-hidden {
                overflow: visible !important;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

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

    const closePrintDialog = useCallback(() => {
        setPrintDialog(prev => ({ ...prev, open: false }));
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

    // Use CF_activeUserdetails directly in API calls
    const fetchUserRights = useCallback(async (groupID) => {
        if (!groupID) return;
        
        setLoading(true);
        setFullPageLoading(true);
        try {
            // Get user details using CF_activeUserdetails
            const userDetails = CF_activeUserdetails();
            
            const passObjDet = {
                sUserGroupFilterID: groupID,
                ActiveUserDetails: userDetails.ActiveUserDetails,
                ApplicationCode: userDetails.ApplicationCode
            };
            
            console.log('Fetching rights for group ID:', groupID, 'Length:', groupID.length);
            
            const response = await postData("User/UserRightsGrid", passObjDet);
            
            if (!response) {
                setRightsData([]);
                setFilteredData([]);
                showInfoDialog(t('Auditpopup.somethingwentwrong') || 'Failed to fetch user rights', "error");
                return;
            }
            
            let data = response;
            if (typeof response === 'string' && response.length > 50) {
                try {
                    // If response is encrypted, try to decrypt it
                    const decrypted = atob(response);
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
            showInfoDialog(t('Auditpopup.somethingwentwrong') || 'Failed to fetch user rights', "error");
        } finally {
            setLoading(false);
            setFullPageLoading(false);
        }
    }, [postData, showInfoDialog, t, updateCheckboxStates]);

    const fetchUserGroups = useCallback(async () => {
        setLoading(true);
        setFullPageLoading(true);
        try {
            // Get user details using CF_activeUserdetails
            const userDetails = CF_activeUserdetails();
            
            const passObjDet = {
                ActiveUserDetails: userDetails.ActiveUserDetails,
                ApplicationCode: userDetails.ApplicationCode
            };
            
            const response = await postData("User/UserRightsCombo", passObjDet);
            
            if (!response) {
                setUserGroups([]);
                showInfoDialog(t('Auditpopup.somethingwentwrong') || 'Failed to fetch user groups', "error");
                return;
            }
            
            let groupsData = response;
            if (typeof response === 'string' && response.length > 50) {
                try {
                    // If response is encrypted, try to decrypt it
                    const decrypted = atob(response);
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
                // Format options for AnimatedDropdown
                const formattedGroups = groupsData.map((group) => ({
                    id: group.L01UserGroupID || '',
                    name: group.L01UserGroupName || ''
                })).filter(group => group.id && group.name);
                
                console.log('Formatted groups for dropdown:', formattedGroups);
                setUserGroups(formattedGroups);
                
                if (formattedGroups.length > 0) {
                    const firstGroupID = formattedGroups[0].id;
                    console.log('Setting first group ID:', firstGroupID, 'Length:', firstGroupID.length);
                    setSelectedGroup(firstGroupID);
                    await fetchUserRights(firstGroupID);
                }
            } else {
                setUserGroups([]);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            showInfoDialog(
                t('Auditpopup.somethingwentwrong') || 'Failed to fetch user groups.',
                "error"
            );
        } finally {
            setLoading(false);
            setFullPageLoading(false);
        }
    }, [postData, showInfoDialog, t, fetchUserRights]);

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

    const handleGroupChange = useCallback((event) => {
        const groupID = event.target.value;
        console.log('Group changed to:', groupID, 'Length:', groupID.length);
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
        
        setFullPageLoading(true);
        try {
            const saveData = rightsData.map(({ id, ...rest }) => rest);
            
            // Get user details using CF_activeUserdetails
            const userDetails = CF_activeUserdetails();
            
            const passObjDet = {
                sUserGroupFilterID: selectedGroup,
                UserRights: saveData,
                ActiveUserDetails: userDetails.ActiveUserDetails,
                ApplicationCode: userDetails.ApplicationCode
            };
            
            console.log('Saving with group ID:', selectedGroup, 'Length:', selectedGroup.length);
            
            const response = await postData("User/UserRightsSaveButtonclick", passObjDet);
            
            if (!response) {
                showInfoDialog(t('Auditpopup.somethingwentwrong') || 'Failed to save user rights', "error");
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
                    t('Auditpopup.somethingwentwrong') || 'Failed to save user rights', 
                    "error"
                );
            }
        } catch (error) {
            console.error('Error saving:', error);
            showInfoDialog(
                t('Auditpopup.somethingwentwrong') || 'Failed to save user rights', 
                "error"
            );
        } finally {
            setFullPageLoading(false);
        }
    }, [selectedGroup, rightsData, postData, showInfoDialog, t, updateCheckboxStates]);

    const handlePrint = useCallback(() => {
        if (rightsData.length === 0) {
            showInfoDialog(t('usermanagement.nodataprint') || 'No data available to print', "warning");
            return;
        }

        // Get selected group name
        const selectedGroupName = userGroups.find(group => group.id === selectedGroup)?.name || selectedGroup;

        // Prepare print data for PrintTable component
        const printColumns = [
            { key: 'moduleName', label: t('usermanagement.modulename') || 'Module Name' },
            { key: 'taskName', label: t('label.taskName') || 'Task Name' },
            { key: 'create', label: t('button.create') || 'Create' },
            { key: 'edit', label: t('button.edit') || 'Edit' },
            { key: 'delete', label: t('usermanagement.delete') || 'Delete' },
            { key: 'allow', label: t('usermanagement.allow') || 'Allow' }
        ];

        const printRows = filteredData.map(item => ({
            moduleName: item.sModuleName || '',
            taskName: item.sDisplayTopic || '',
            create: item.sCreate === "NA" ? "NA" : (item.sCreate === "1" ? "✓" : "✗"),
            edit: item.sEdit === "NA" ? "NA" : (item.sEdit === "1" ? "✓" : "✗"),
            delete: item.sDelete === "NA" ? "NA" : (item.sDelete === "1" ? "✓" : "✗"),
            allow: item.sAllow === "1" ? "✓" : "✗"
        }));

        // Get user details for print request
        const userDetails = CF_activeUserdetails();
        const printRequest = {
            ActiveUserDetails: userDetails.ActiveUserDetails,
            ApplicationCode: userDetails.ApplicationCode,
            sModuleName: "User Rights"
        };

        // Open print dialog
        setPrintDialog({
            open: true,
            title: t('usermanagement.userrights') || 'User Rights',
            subtitle: `${t('usermanagement.groupname') || 'Group Name'}: ${selectedGroupName}`,
            columns: printColumns,
            rows: printRows,
            printRequest: printRequest
        });
    }, [rightsData, filteredData, selectedGroup, userGroups, t, showInfoDialog]);

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
            label:(
            <div > 
             <span className="text-[12px] font-roboto text-[#353f49] font-bold">
                        {t('usermanagement.modulename') || 'Module Name'}
                    </span>
            </div>),
            width: 180,
            enableSearch: true,
            enableSort: undefined,
            fontFamily: 'Verdana, sans-serif',
            render: (row, isSelected, index, rows) => {
                if (index === 0 || row.sModuleName !== rows[index - 1]?.sModuleName) {
                    return (
                        <div className="text-[12px] font-['verdana'] font-medium text-[#A52A2A]">
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
            label:(
            <div > 
             <span className="text-[12px] text-[#353f49] font-roboto font-bold">
                        {t('label.taskName') || 'Task Name'}
                    </span>
            </div>),
            width: 200,
            enableSearch: true,
            render: (row, isSelected) => (
                <div className="text-[12px] font-['verdana'] font-medium truncate text-[#A52A2A]">
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
                        className="cursor-pointer w-[14px] h-[14px] accent-blue-600"
                    />
                    <span className="text-[12px] text-[#353f49] font-roboto font-bold">
                        {t('button.create') || 'Create'}
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
                            <span className={`text-[12px] font-['verdana'] text-black ${isSelected ? 'font-bold' : ''}`}>
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
                    <span className="text-[12px] text-[#353f49] font-roboto font-bold">
                        {t('button.edit') || 'Edit'}
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
                            <span className={`text-[12px] font-['verdana'] text-black ${isSelected ? 'font-bold' : ''}`}>
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
                    <span className="text-[12px] text-[#353f49] font-roboto font-bold">
                        {t('usermanagement.delete') || 'Delete'}
                    </span>
                </div>
            ),
            width: 120,
            enableSearch: false,
            enableSort: false,
            render: (row, isSelected) => {
                if (row.sDelete === "NA") {
                    return (
                        <div className="flex items-center justify-center">
                            <span className={`text-[12px] font-['verdana'] text-black ${isSelected ? 'font-bold' : ''}`}>
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
                    <span className="text-[12px] text-[#353f49] font-roboto font-bold">
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

    const ActionButton = ({ iconClass, label, disabled, onClick, variant = "default" }) => (
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
            {iconClass && <i className={`${iconClass} w-3.5 h-3.5`}></i>}
            <span>{label}</span>
        </button>
    );

    // Debug logging
    useEffect(() => {
        console.log('Current selectedGroup:', selectedGroup);
        console.log('Current userGroups:', userGroups);
        const matchingGroup = userGroups.find(g => g.id === selectedGroup);
        console.log('Matching group:', matchingGroup);
    }, [selectedGroup, userGroups]);

    if (loading && isInitialMount.current) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 font-roboto">
                <div className="text-gray-500 text-base mb-2.5">
                    {t('common.loading') || 'Loading...'}
                </div>
                
            </div>
        );
    }

    // if (!loading && userGroups.length === 0) {
    //     return (
    //         <div className="flex flex-col items-center justify-center h-screen bg-gray-50 font-roboto gap-5 p-5">
    //             <div className="text-red-500 text-lg font-bold text-center">
    //                 {t('Auditpopup.somethingwentwrong') || 'No User Groups Available'}
    //             </div>
                
    //             <button 
    //                 onClick={() => {
    //                     setLoading(true);
    //                     fetchUserGroups();
    //                 }}
    //                 className="px-5 py-2.5 bg-[#2883FE] text-white border-none rounded cursor-pointer text-sm font-bold hover:bg-[#1a6fd8]"
    //             >
    //                 {t('button.retry') || 'Retry'}
    //             </button>
    //         </div>
    //     );
    // }

    return (
        <div className="flex flex-col font-roboto bg-white w-full h-[80vh] overflow-hidden relative">
            {/* Full Page Loader */}
            <FullPageLoader 
                loading={fullPageLoading} 
                text={t('common.loading') || 'Loading...'} 
            />
            
            {/* Print Dialog */}
            {printDialog.open && (
                <PrintTable
                    columns={printDialog.columns}
                    rows={printDialog.rows}
                    title={printDialog.title}
                    subtitle={printDialog.subtitle}
                    printRequest={printDialog.printRequest}
                    onDone={closePrintDialog}
                />
            )}
            
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialog}
                />
            )}

            {/* Header Section - Fixed */}
            <div className="px-3.5 py-3 bg-white flex-shrink-0 top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-5">
                            <label className="text-[12px] font-semibold text-[#405F7D] font-roboto">
                                {t('usermanagement.groupname') || 'Group Name'}:
                            </label>
                            {/* Fixed Dropdown Container with Tailwind */}
                            <div className="w-64 relative z-[1000] overflow-visible">
                                <div className="relative">
                                    <AnimatedDropdown
                                        label=""
                                        name="groupSelect"
                                        value={selectedGroup}
                                        onChange={handleGroupChange}
                                        options={userGroups}
                                        displayKey="name"
                                        valueKey="id"
                                        isSearchable={false}
                                        allowFreeInput={false}
                                        disabled={loading}
                                        required={false}
                                        showError={false}
                                        borderColor="border-gray-300"
                                        className="text-[12px] relative z-[1000]"
                                        
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-7">
                            <input
                                type="checkbox"
                                id="selectAllCheckbox"
                                checked={selectAll}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="cursor-pointer w-4 h-4 ml-8 accent-blue-600"
                            />
                            <label 
                                htmlFor="selectAllCheckbox"
                                className="text-[12px] text-[#405F7D] font-bold cursor-pointer ml-1 select-none"
                            >
                                {t('usermanagement.selectall') || 'Select All'}
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2.5">
                        {/* Print button with glyphicon-print icon */}
                        <ActionButton
                            iconClass="fa fa-print"
                            label={t('button.print') || 'Print'}
                            onClick={handlePrint}
                            disabled={rightsData.length === 0 || loading}
                        />
                        
                        {/* Save button with fa-check-square-o icon */}
                        <ActionButton
                            iconClass="fa fa-check-square-o"
                            label={t('button.save') || 'Save'}
                            onClick={handleSave}
                            disabled={!selectedGroup || rightsData.length === 0 || loading}
                            variant="primary"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area - Takes remaining height and scrolls */}
            <div className="flex-1 overflow-auto min-h-0 w-full relative overflow-visible">
                {filteredData.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-[12px] gap-2">
                        <div>
                            {selectedGroup 
                                ? (t('usermanagement.norightsfound') || 'No rights found for this group')
                                : (t('Auditpopup.somethingwentwrong') || 'Please select a group first')
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
                    <div className="p-0 h-full flex flex-col overflow-visible">
                        {/* Grid container with explicit height */}
                      <div className="p-0 h-full flex flex-col relative z-0">
                          <div className="flex-1 min-h-[100px] overflow-hidden bg-white relative z-0">
                                <GridLayout 
                                    key={`user-rights-grid-${selectedGroup}`}
                                    columns={columns}
                                    data={stableData}
                                    searchable={false}
                                    selectable={false}
                                    hidePagination={true}
                                    enableSelection={false}
                                    height="100%"
                                    className="overflow-visible relative z-0"
                                    wrapperClassName="overflow-visible relative z-0"
                                    containerClassName="overflow-visible relative z-0"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRights;