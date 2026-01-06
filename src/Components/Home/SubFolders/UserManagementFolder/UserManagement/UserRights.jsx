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
            // Use the exact group ID for API request
            const passObjDet = {
                sUserGroupFilterID: groupID, // Use the exact ID
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            console.log('Fetching rights for group ID:', groupID, 'Length:', groupID.length);
            
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
        
        try {
            setLoading(true);
            
            const saveData = rightsData.map(({ id, ...rest }) => rest);
            
            const passObjDet = {
                sUserGroupFilterID: selectedGroup, // Already padded from API
                UserRights: saveData,
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            console.log('Saving with group ID:', selectedGroup, 'Length:', selectedGroup.length);
            
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

    // Get selected group name
    const selectedGroupName = userGroups.find(group => group.id === selectedGroup)?.name || selectedGroup;

    // Prepare data for printing
    const printData = filteredData.map(item => ({
        moduleName: t(item.sModuleName) || item.sModuleName,
        taskName: t(item.sDisplayTopic) || item.sDisplayTopic,
        create: item.sCreate,
        edit: item.sEdit,
        delete: item.sDelete,
        allow: item.sAllow
    }));

    // Group data by module name
    const groupedData = printData.reduce((acc, item) => {
        if (!acc[item.moduleName]) {
            acc[item.moduleName] = [];
        }
        acc[item.moduleName].push(item);
        return acc;
    }, {});

    // Create print HTML
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>${t('usermanagement.userrights') || 'User Rights'}</title>
            <style>
                @media print {
                    body {
                        font-family: 'Verdana', sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 10px;
                    }
                    .print-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin: 0;
                        text-transform: uppercase;
                    }
                    .group-name {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    .print-date {
                        font-size: 12px;
                        color: #666;
                        margin: 5px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    th {
                        background-color: #f5f5f5;
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: center;
                        font-weight: bold;
                        color: #333;
                    }
                    td {
                        border: 1px solid #ddd;
                        padding: 6px;
                    }
                    .module-cell {
                        font-weight: bold;
                        color: #A52A2A;
                        background-color: #f9f9f9;
                    }
                    .task-cell {
                        color: #A52A2A;
                    }
                    .checkbox-cell {
                        text-align: center;
                        vertical-align: middle;
                    }
                    .checkbox-cell input[type="checkbox"] {
                        width: 14px;
                        height: 14px;
                        margin: 0;
                        vertical-align: middle;
                    }
                    .na-cell {
                        text-align: center;
                        color: #666;
                        font-style: italic;
                    }
                    .module-row {
                        page-break-inside: avoid;
                    }
                }
                @page {
                    size: auto;
                    margin: 0.5in;
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1 class="print-title">${t('usermanagement.userrights') || 'User Rights'}</h1>
                <div class="group-name">${t('usermanagement.groupname') || 'Group Name'}: ${selectedGroupName}</div>
                <div class="print-date">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 25%">${t('usermanagement.modulename') || 'Module Name'}</th>
                        <th style="width: 25%">${t('usermanagement.taskname') || 'Task Name'}</th>
                        <th style="width: 12.5%">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                                <input type="checkbox" ${createAll ? 'checked' : ''} disabled />
                                ${t('usermanagement.create') || 'Create'}
                            </div>
                        </th>
                        <th style="width: 12.5%">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                                <input type="checkbox" ${editAll ? 'checked' : ''} disabled />
                                ${t('usermanagement.edit') || 'Edit'}
                            </div>
                        </th>
                        <th style="width: 12.5%">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                                <input type="checkbox" ${deleteAll ? 'checked' : ''} disabled />
                                ${t('usermanagement.delete') || 'Delete'}
                            </div>
                        </th>
                        <th style="width: 12.5%">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                                <input type="checkbox" ${allowAll ? 'checked' : ''} disabled />
                                ${t('usermanagement.allow') || 'Allow'}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(groupedData).map(([moduleName, tasks]) => 
                        tasks.map((task, index) => `
                            <tr class="module-row">
                                ${index === 0 ? `<td rowspan="${tasks.length}" class="module-cell">${moduleName}</td>` : ''}
                                <td class="task-cell">${task.taskName}</td>
                                <td class="checkbox-cell">
                                    ${task.create === "NA" 
                                        ? '<span class="na-cell">NA</span>' 
                                        : `<input type="checkbox" ${task.create === "1" ? 'checked' : ''} disabled />`
                                    }
                                </td>
                                <td class="checkbox-cell">
                                    ${task.edit === "NA" 
                                        ? '<span class="na-cell">NA</span>' 
                                        : `<input type="checkbox" ${task.edit === "1" ? 'checked' : ''} disabled />`
                                    }
                                </td>
                                <td class="checkbox-cell">
                                    ${task.delete === "NA" 
                                        ? '<span class="na-cell">NA</span>' 
                                        : `<input type="checkbox" ${task.delete === "1" ? 'checked' : ''} disabled />`
                                    }
                                </td>
                                <td class="checkbox-cell">
                                    <input type="checkbox" ${task.allow === "1" ? 'checked' : ''} disabled />
                                </td>
                            </tr>
                        `).join('')
                    ).join('')}
                </tbody>
            </table>
            
            <script>
                // Function to automatically print when the page loads
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 100);
                    }, 500);
                }
            </script>
        </body>
        </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Log print activity (optional - similar to your reference code)
    const logPrintActivity = async () => {
        try {
            const passObjDet = {
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS",
                sModuleName: "User Rights"
            };
            
            await postData("basemaster/print", passObjDet);
        } catch (error) {
            console.error('Error logging print activity:', error);
        }
    };

    logPrintActivity();
}, [rightsData, filteredData, selectedGroup, userGroups, createAll, editAll, deleteAll, allowAll, t, showInfoDialog, postData, getActiveUserDetails]);

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
                        {t('usermanagement.taskname') || 'Task Name'}
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
            <div className="flex-1 overflow-auto min-h-0 w-full relative overflow-visible">
                {filteredData.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-[12px] gap-2">
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
                                    height="80%"
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