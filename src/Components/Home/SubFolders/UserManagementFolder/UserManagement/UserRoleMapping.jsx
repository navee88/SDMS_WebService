import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import { useTranslation } from 'react-i18next';
import Errordialog from '../../../../Layout/Common/Errordialog';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import servicecall from '../../../../../Services/servicecall';
import { CF_decrypt } from '../../../../../Components/Common/encryptiondecryption.js';

const UserRoleMapping = () => {
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
    const [usernames, setUsernames] = useState([]); // 5 usernames
    const [roles, setRoles] = useState([]); // 10 roles
    const [gridData, setGridData] = useState({}); // { "username-role": checked }
    const [roleSelectAll, setRoleSelectAll] = useState({}); // { "roleId": checked } for header checkboxes
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

    const transformDataForGrid = useCallback((responseData, existingMappings = []) => {
        if (!responseData) {
            setUsernames([]);
            setRoles([]);
            setGridData({});
            return;
        }

        // Extract users from response - limit to 5
        const usersList = Array.isArray(responseData.users) ? responseData.users.slice(0, 5) : [];
        
        // Extract roles from response - limit to 10
        const rolesList = Array.isArray(responseData.Roles) ? responseData.Roles.slice(0, 10) : [];
        
        // Extract usernames (using sUserName or sUserFullName)
        const uniqueUsernames = usersList.map(user => ({
            id: user.sUserID?.trim() || '',
            name: user.sUserName?.trim() || user.sUserFullName?.trim() || '',
            fullName: user.sUserFullName?.trim() || user.sUserName?.trim() || ''
        }));
        
        // Extract roles (using sUserGroupName or sUserGroupID)
        const uniqueRoles = rolesList.map(role => ({
            id: role.sUserGroupID?.trim() || '',
            name: role.sUserGroupName?.trim() || role.sUserGroupID?.trim() || ''
        }));
        
        setUsernames(uniqueUsernames);
        setRoles(uniqueRoles);
        
        // Create a map of existing mappings for quick lookup
        // Format: { "userId-roleId": isactive }
        const mappingsMap = {};
        if (Array.isArray(existingMappings) && existingMappings.length > 0) {
            existingMappings.forEach(mapping => {
                // Handle normalized format: {userid, roleid, sitecode, isactive}
                const userId = mapping.userid?.trim() || mapping.sUserID?.trim() || '';
                const roleId = mapping.roleid?.trim() || mapping.sUserGroupID?.trim() || '';
                // Check isactive field - can be 1, "1", true, or boolean
                const isActive = mapping.isactive === 1 || 
                                mapping.isactive === "1" || 
                                mapping.isActive === 1 || 
                                mapping.isActive === "1" ||
                                mapping.isactive === true ||
                                mapping.isActive === true;
                
                if (userId && roleId) {
                    const key = `${userId}-${roleId}`;
                    mappingsMap[key] = isActive;
                }
            });
        }
        
        // Create grid data structure: { "userId-roleId": checked }
        // Use existing mappings if available, otherwise default to false
        const newGridData = {};
        const newRoleSelectAll = {};
        
        uniqueUsernames.forEach(user => {
            uniqueRoles.forEach(role => {
                const key = `${user.id}-${role.id}`;
                // Use existing mapping if available, otherwise default to false
                newGridData[key] = mappingsMap[key] || false;
            });
        });
        
        // Update role header checkboxes based on existing data
        uniqueRoles.forEach(role => {
            const allUsersForRoleSelected = uniqueUsernames.every(user => {
                const key = `${user.id}-${role.id}`;
                return newGridData[key] || false;
            });
            newRoleSelectAll[role.id] = allUsersForRoleSelected;
        });
        
        // Update selectAll state
        const allSelected = uniqueUsernames.every(user => 
            uniqueRoles.every(role => {
                const key = `${user.id}-${role.id}`;
                return newGridData[key] || false;
            })
        );
        
        setGridData(newGridData);
        setRoleSelectAll(newRoleSelectAll);
        setSelectAll(allSelected);
    }, []);

    const handleGridCheckboxChange = useCallback((userId, roleId, checked) => {
        const key = `${userId}-${roleId}`;
        setGridData(prev => {
            const newGridData = {
                ...prev,
                [key]: checked
            };
            
            // Update role header checkbox state
            // Check if all users for this role are selected
            const allUsersForRoleSelected = usernames.every(user => {
                const userKey = `${user.id}-${roleId}`;
                return newGridData[userKey] || false;
            });
            
            setRoleSelectAll(prev => ({
                ...prev,
                [roleId]: allUsersForRoleSelected
            }));
            
            // Update selectAll state - check if all user-role combinations are selected
            const allSelected = usernames.every(user => 
                roles.every(role => {
                    const userRoleKey = `${user.id}-${role.id}`;
                    return newGridData[userRoleKey] || false;
                })
            );
            setSelectAll(allSelected);
            
            return newGridData;
        });
        
        // Update rightsData to track user-role mappings
        // You may need to maintain a separate mapping structure
        setRightsData(prev => {
            if (!prev || typeof prev !== 'object') return prev;
            // Store the mapping in a userRoleMappings property
            const mappings = prev.userRoleMappings || {};
            mappings[key] = checked;
            return {
                ...prev,
                userRoleMappings: mappings
            };
        });
    }, [usernames, roles]);

    // Transform data for GridLayout: each row is a username with role checkboxes
    const gridLayoutData = useMemo(() => {
        return usernames.map((user, index) => {
            const row = {
                id: user.id || `user-${index}`,
                username: user.name || user.fullName,
                userId: user.id,
                ...roles.reduce((acc, role) => {
                    const key = `${user.id}-${role.id}`;
                    acc[role.id] = gridData[key] || false;
                    return acc;
                }, {})
            };
            return row;
        });
    }, [usernames, roles, gridData]);

    // Handle role header checkbox change (select all users for a role)
    const handleRoleHeaderCheckboxChange = useCallback((roleId, checked) => {
        setRoleSelectAll(prev => ({
            ...prev,
            [roleId]: checked
        }));
        
        // Update all users for this role
        setGridData(prev => {
            const newGridData = { ...prev };
            usernames.forEach(user => {
                const key = `${user.id}-${roleId}`;
                newGridData[key] = checked;
            });
            
            // Update selectAll state - check if all user-role combinations are selected
            const allSelected = usernames.every(user => 
                roles.every(role => {
                    const userRoleKey = `${user.id}-${role.id}`;
                    return newGridData[userRoleKey] || false;
                })
            );
            setSelectAll(allSelected);
            
            return newGridData;
        });
    }, [usernames, roles]);

    // Create dynamic columns for GridLayout
    const gridColumns = useMemo(() => {
        const cols = [
            {
                key: 'username',
                label: (
                    <div>
                        <span className="text-[12px] font-roboto text-[#353f49] font-bold">
                            User Name
                        </span>
                    </div>
                ),
                width: 180,
                enableSearch: false,
                enableSort: false,
                fontFamily: 'Verdana, sans-serif',
                render: (row) => (
                    <div className="text-[12px] font-['verdana'] font-medium text-[#A52A2A]">
                        {t(row.username) || row.username}
                    </div>
                )
            }
        ];

        // Add a column for each role (10 roles)
        roles.forEach((role, index) => {
            cols.push({
                key: role.id,
                label: (
                    <div className="flex items-center justify-center gap-2">
                        <input
                            type="checkbox"
                            checked={roleSelectAll[role.id] || false}
                            onChange={(e) => handleRoleHeaderCheckboxChange(role.id, e.target.checked)}
                            className="cursor-pointer w-[14px] h-[14px] accent-blue-600"
                        />
                        <span className="text-[12px] text-[#353f49] font-roboto font-bold">
                            {t(role.name) || role.name}
                        </span>
                    </div>
                ),
                width: 120,
                enableSearch: false,
                enableSort: false,
                render: (row) => (
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={row[role.id] || false}
                            onChange={(e) => handleGridCheckboxChange(row.userId, role.id, e.target.checked)}
                            className="cursor-pointer w-[14px] h-[14px] accent-blue-600"
                        />
                    </div>
                )
            });
        });

        return cols;
    }, [roles, t, handleGridCheckboxChange, handleRoleHeaderCheckboxChange, roleSelectAll]);

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
        debugger
        if (!groupID) return;
        const activeUserDetails = getActiveUserDetails();
        // const sSiteCode = getDecryptedValue("sSiteCode") || "DFT   ";
        setLoading(true);
        try {
            // Use the exact group ID for API request
            const passObjDet = {
         
                ActiveUserDetails: getActiveUserDetails(),
                sSiteCode:groupID,
                ApplicationCode: "SDMS"
            };
            
            console.log('Fetching rights for group ID:', groupID, 'Length:', groupID.length);
            
            const response = await postData("User/getUsersandRoles", passObjDet);
            debugger
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
            
            // Store the full response data
            setRightsData(data || {});
            setFilteredData(data || {});
            
            // Fetch existing user-role mappings from database
            const existingMappings = await fetchUserRoleMapping(groupID);
            
            // Transform data for grid layout: 5 usernames x 10 roles
            // Pass existing mappings to populate checkboxes
            transformDataForGrid(data, existingMappings);
        } catch (error) {
            console.error('Error fetching rights:', error);
            showInfoDialog(t('usermanagement.failedtofetchuserrights') || 'Failed to fetch user rights', "error");
        } finally {
            setLoading(false);
        }
    }, [postData, showInfoDialog, t, updateCheckboxStates, getActiveUserDetails, transformDataForGrid]);

    const fetchUserGroups = useCallback(async () => {
        debugger
        setLoading(true);
        try {
            const passObjDet = {
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            const response = await postData("Login/LoadSite", passObjDet);
            debugger
            if (!response) {
                setUserGroups([]);
                showInfoDialog(t('usermanagement.failedtofetchusergroups') || 'Failed to fetch user groups', "error");
                return;
            }
            
            let groupsData = response;
    
            if (groupsData && groupsData.sitelist) {
                groupsData = groupsData.sitelist;
            }
            
            if (!Array.isArray(groupsData)) {
                groupsData = [];
            }
            
            if (groupsData.length > 0) {
                // Format options for AnimatedDropdown
                const formattedGroups = groupsData.map((group) => ({
                    sSiteCode: group.sSiteCode || '',
                    sSiteName: group.sSiteName || ''
                }))
                
                console.log('Formatted groups for dropdown:', formattedGroups);
                setUserGroups(formattedGroups);
                
                if (formattedGroups.length > 0) {
                    const firstGroupID = formattedGroups[0].sSiteCode;
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

    const fetchUserRoleMapping = useCallback(async (siteCode) => {
        if (!siteCode) {
            console.warn('No siteCode provided to fetchUserRoleMapping');
            return;
        }
        
        try {
            const passObjDet = {
                ActiveUserDetails: getActiveUserDetails(),
                sSiteCode: siteCode,
                ApplicationCode: "SDMS"
            };
            
            console.log('Fetching user role mappings for site:', siteCode);
            const response = await postData("Usm/LoadUserRoleMaping", passObjDet);
            debugger
            if (!response) {
                console.warn('No response from LoadUserRoleMaping');
                // Don't show error dialog, just return empty mappings
                return [];
            }
            
            let mappingsData = response;
            
            // Handle encrypted response
            if (typeof response === 'string' && response.length > 50) {
                try {
                    const decrypted = CF_decrypt(response);
                    mappingsData = JSON.parse(decrypted);
                } catch (decryptError) {
                    console.error('Failed to decrypt response:', decryptError);
                    return [];
                }
            }
            
            // Extract mappings from response
            // Response might be in different formats: array, object with array property, etc.
            let mappings = [];
            if (Array.isArray(mappingsData)) {
                mappings = mappingsData;
            } else if (mappingsData && Array.isArray(mappingsData.roleMapinglst)) {
                mappings = mappingsData.roleMapinglst;
            } else if (mappingsData && Array.isArray(mappingsData.UserRoleMappings)) {
                mappings = mappingsData.UserRoleMappings;
            } else if (mappingsData && mappingsData.oResObj) {
                if (Array.isArray(mappingsData.oResObj)) {
                    mappings = mappingsData.oResObj;
                } else if (Array.isArray(mappingsData.oResObj.roleMapinglst)) {
                    mappings = mappingsData.oResObj.roleMapinglst;
                } else if (Array.isArray(mappingsData.oResObj.UserRoleMappings)) {
                    mappings = mappingsData.oResObj.UserRoleMappings;
                }
            }
            
            // Normalize mapping format to handle different field names
            // Support both: {userid, roleid, sitecode, isactive} and {sUserID, sUserGroupID, sSiteCode, isActive}
            const normalizedMappings = mappings.map(mapping => {
                // Check if already in normalized format
                if (mapping.userid || mapping.roleid !== undefined) {
                    return {
                        userid: mapping.userid?.trim() || mapping.sUserID?.trim() || '',
                        roleid: mapping.roleid?.trim() || mapping.sUserGroupID?.trim() || '',
                        sitecode: mapping.sitecode?.trim() || mapping.sSiteCode?.trim() || '',
                        isactive: mapping.isactive === 1 || mapping.isactive === "1" || 
                                 mapping.isActive === 1 || mapping.isActive === "1" || 0
                    };
                }
                // Handle sUserID format
                return {
                    userid: mapping.sUserID?.trim() || '',
                    roleid: mapping.sUserGroupID?.trim() || '',
                    sitecode: mapping.sSiteCode?.trim() || '',
                    isactive: mapping.isActive === 1 || mapping.isActive === "1" || 
                             mapping.isactive === 1 || mapping.isactive === "1" || 0
                };
            });
            
            console.log('Fetched user role mappings:', normalizedMappings);
            return normalizedMappings;
        } catch (error) {
            console.error('Error fetching user role mappings:', error);
            // Don't show error dialog for fetch errors, just return empty array
            return [];
        }
    }, [postData, getActiveUserDetails]);
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
        
        // Select/deselect all user-role combinations
        const newGridData = { ...gridData };
        const newRoleSelectAll = {};
        
        usernames.forEach(user => {
            roles.forEach(role => {
                const key = `${user.id}-${role.id}`;
                newGridData[key] = checked;
                newRoleSelectAll[role.id] = checked;
            });
        });
        
        setGridData(newGridData);
        setRoleSelectAll(newRoleSelectAll);
    }, [gridData, usernames, roles]);

    // Get selected data in the format: [{userid, roleid, sitecode, isactive}]
    const getSelectedData = useCallback(() => {
        const selectedList = [];
        
        usernames.forEach(user => {
            roles.forEach(role => {
                const key = `${user.id}-${role.id}`;
                const isChecked = gridData[key] || false;
                
                selectedList.push({
                    userid: user.id,
                    roleid: role.id,
                    sitecode: selectedGroup || '',
                    isactive: isChecked ? 1 : 0
                });
            });
        });
        
        return selectedList;
    }, [usernames, roles, gridData, selectedGroup]);

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
        
        if (usernames.length === 0 || roles.length === 0) {
            showInfoDialog(t('usermanagement.norightstosave') || 'No data to save', "warning");
            return;
        }
        
        try {
            setLoading(true);
            
            // Get selected data in the format: [{userid, roleid, sitecode, isactive}]
            const selectedData = getSelectedData();
            console.log('Selected data:', selectedData);
            
            // Transform to API format if needed (keeping both formats available)
            const userRoleMappings = selectedData
                .filter(item => item.isactive === 1) // Only send active mappings to API
                .map(item => ({
                    sUserID: item.userid,
                    sUserGroupID: item.roleid,
                    sSiteCode: item.sitecode
                }));
            
            const roleMapinglst = {
                sSiteCode: selectedGroup,
                UserRoleMappings: userRoleMappings,
                // Include full selected data with isactive for reference
                roleMapinglst: selectedData,
                ActiveUserDetails: getActiveUserDetails(),
                ApplicationCode: "SDMS"
            };
            
            console.log('Saving user-role mappings:', roleMapinglst);
            debugger
            const response = await postData("Usm/SaveUserRoleMaping", roleMapinglst);
            debugger
            if (!response) {
                showInfoDialog(t('usermanagement.userrightssavefailed') || 'Failed to save user role mappings', "error");
                return;
            }

            
            if (response[0].Rtn != undefined && response[0].Rtn == "Success") {
                showInfoDialog(
                    t('usermanagement.userrightssavesuccess') || 'User role mappings saved successfully', 
                    "success"
                );
                // Refresh the data to reflect saved mappings
                await fetchUserRights(selectedGroup);
            } else {
                showInfoDialog(
                    response.Message || t('usermanagement.userrightssavefailed') || 'Failed to save user role mappings', 
                    "error"
                );
            }
        } catch (error) {
            console.error('Error saving:', error);
            showInfoDialog(
                t('usermanagement.userrightssavefailed') || 'Failed to save user role mappings', 
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, [selectedGroup, usernames, roles, gridData, postData, showInfoDialog, t, getActiveUserDetails, fetchUserRights, getSelectedData]);

    const handlePrint = useCallback(() => {
    if (rightsData.length === 0) {
        showInfoDialog(t('usermanagement.nodataprint') || 'No data available to print', "warning");
        return;
    }

    // Get selected group name
    const selectedGroupName = userGroups.find(group => group.sSiteCode === selectedGroup)?.sSiteName || selectedGroup;

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
                        {/* {t('usermanagement.modulename') || 'Module Name'} */}

                        User Name
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
            key: 'sAllow',
            label: (
             <div> 
               <span className="text-[12px] text-[#353f49] font-roboto font-bold">
                        {/* {t('usermanagement.taskname') || 'Task Name'} */}
                        Rolesname
                    </span></div>
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
        const matchingGroup = userGroups.find(g => g.sSiteCode === selectedGroup);
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
      <div className="flex flex-col font-roboto bg-white w-full h-[80vh] overflow-hidden">
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
                                {/* {t('usermanagement.groupname') || 'Group Name'}: */}
                                Sites
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
                                        displayKey="sSiteName"
                                        valueKey="sSiteCode"
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
                   
                        
                        {/* Save button with fa-check-square-o icon */}
                        <ActionButton
                            iconClass="fa fa-check-square-o"
                            label={t('button.save') || 'Save'}
                            onClick={handleSave}
                            disabled={!selectedGroup || usernames.length === 0 || roles.length === 0}
                            variant="primary"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area - Takes remaining height, no scroll */}
            <div className="flex-1 overflow-hidden min-h-0 w-full relative">
                {gridLayoutData.length === 0 && !loading ? (
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
                                    key={`user-role-grid-${selectedGroup}`}
                                    columns={gridColumns}
                                    data={gridLayoutData}
                                    hidePagination={true}
                                    enableSelection={false}
                                    height="100%"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRoleMapping;