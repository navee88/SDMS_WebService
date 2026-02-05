import React, { useState, useMemo, useEffect, useCallback } from 'react'; // Added useCallback
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import GridLayout from './Grid/GridLayout'; 
import { FaLock, FaUnlock, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import servicecall from "../../../../Services/servicecall";

const fetchUsersAPI = async ({ postData }) => {
   return new Promise((resolve) => {
     setTimeout(() => {
       const mockData = [
         { id: '1', username: 'jdoe1', fullName: 'John Doe', profileName: 'Admin Profile', userGroupName: 'Admins', createdOn: '2023-01-15', userStatus: 'Active', checkStatus: 0, email: 'jdoe@test.com', locktype: "Locked", Modulename: "DataExplore", TasksName: "Open", level: "process" },
         { id: '2', username: 'asmith2', fullName: 'Alex Smith', profileName: 'Editor Profile', userGroupName: 'Editors', createdOn: '2023-02-20', userStatus: 'Active', checkStatus: 0, email: 'alex@test.com', locktype: "Unlocked", Modulename: "DataExplore", TasksName: "Download", level: "process" },
         { id: '3', username: 'bwayne3', fullName: 'Bruce Wayne', profileName: 'Viewer Profile', userGroupName: 'Admin', createdOn: '2023-03-10', userStatus: 'Locked', checkStatus: 0, email: 'bwayne@test.com', locktype: "Locked", Modulename: "DataExplore", TasksName: "Restore", level: "queue" },
         { id: '4', username: 'ckent4', fullName: 'Clark Kent', profileName: 'Super User', userGroupName: 'Admins', createdOn: '2023-04-05', userStatus: 'Active', checkStatus: 'NA', email: 'clark@test.com', locktype: "Unlocked", Modulename: "DataExplore", TasksName: "File Upload", level: "queue" },
         { id: '3', username: 'bwayne5', fullName: 'Bruce Wayne', profileName: 'Admin', userGroupName: 'Viewers', createdOn: '2023-03-10', userStatus: 'Active', checkStatus: 0, email: 'bwayne@test.com', locktype: "Unlocked", Modulename: "Explore", TasksName: "Restore", level: "process" },
         { id: '4', username: 'ckent6', fullName: 'Clark Kent', profileName: 'User', userGroupName: 'Admins', createdOn: '2023-04-05', userStatus: 'Active', checkStatus: 0, email: 'clark@test.com', locktype: "Locked", Modulename: "Explore", TasksName: "File Upload", level: "queue" },
          { id: '5', username: 'jdoe7', fullName: 'John Doe', profileName: 'Admin Profile', userGroupName: 'Admins', createdOn: '2023-01-15', userStatus: 'Active', checkStatus: 0, email: 'jdoe@test.com', locktype: "Locked", Modulename: "DataExplore", TasksName: "Open", level: "process" },
         { id: '6', username: 'asmith8', fullName: 'Alex Smith', profileName: 'Editor Profile', userGroupName: 'Editors', createdOn: '2023-02-20', userStatus: 'Active', checkStatus: 0, email: 'alex@test.com', locktype: "Unlocked", Modulename: "DataExplore", TasksName: "Download", level: "process" },
         { id: '7', username: 'bwayne9', fullName: 'Bruce Wayne', profileName: 'Viewer Profile', userGroupName: 'Admin', createdOn: '2023-03-10', userStatus: 'Locked', checkStatus: 'NA', email: 'bwayne@test.com', locktype: "Locked", Modulename: "DataExplore", TasksName: "Restore", level: "queue" },
         { id: '8', username: 'ckent10', fullName: 'Clark Kent', profileName: 'Super User', userGroupName: 'Admins', createdOn: '2023-04-05', userStatus: 'Active', checkStatus: 'NA', email: 'clark@test.com', locktype: "Unlocked", Modulename: "DataExplore", TasksName: "File Upload", level: "queue" },
         { id: '9', username: 'bwayne11', fullName: 'Bruce Wayne', profileName: 'Admin', userGroupName: 'Viewers', createdOn: '2023-03-10', userStatus: 'Active', checkStatus: 0, email: 'bwayne@test.com', locktype: "Unlocked", Modulename: "Explore", TasksName: "Restore", level: "process" },
         { id: '10', username: 'ckent12', fullName: 'Clark Kent', profileName: 'User', userGroupName: 'Admins', createdOn: '2023-04-05', userStatus: 'Active', checkStatus: 0, email: 'clark@test.com', locktype: "Locked", Modulename: "Explore", TasksName: "File Upload", level: "queue" },
         
       ];
       resolve(mockData);
     }, 500);
   });
};

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [initialSelection, setInitialSelection] = useState([]);

  const shouldHidePagination = true; 

  const { postData } = servicecall();
  
  const { 
    data: allData, 
    isLoading: loading, 
    isError, 
    error
  } = useQuery({
    queryKey: ['users'], 
    queryFn: () => fetchUsersAPI({ postData }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, 
  });

  const { userData, totalRows } = useMemo(() => {
    const allUsers = allData || [];
    
    if (shouldHidePagination) {
      return {
        userData: allUsers, 
        totalRows: allUsers.length
      };
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      userData: allUsers.slice(startIndex, endIndex),
      totalRows: allUsers.length
    };
  }, [allData, page, pageSize, shouldHidePagination]); 

  const generateUniqueKey = useCallback((row) => {
    return `${row.id}-${row.level}-${row.Modulename}-${row.TasksName}`;
  }, []);

  useEffect(() => {
    if (userData.length > 0) {
      const preSelectedIds = userData
        .filter(u => u.checkStatus === 1)
        .map(u => generateUniqueKey(u)); 
      setInitialSelection(preSelectedIds);
    }
  }, [userData, generateUniqueKey]); 


  const handleSelectionChange = useCallback((ids) => {
    setSelectedIds(ids);
  }, []);

  const userColumns = useMemo(() => [
    {
      key: 'username',
      label: 'Username',
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className={`${isSelected ? 'text-red-900 font-bold' : 'text-gray-700'}`}>
          {row.username}
        </span>
      )
    },
    {
      key: 'profileName',
      label: 'Profile Name',
      width: 180,
      enableSearch: true,
      hideHeaderSelection: true,
      isSelectionColumn: true,
      enableSort: true, 
      render: (row, isSelected) => (
        <div className="flex w-full justify-start text-left">
          <span className={isSelected ? 'font-bold' : ''}>
            {row.profileName}
          </span>
        </div>
      ),
    },
    {
      key: 'userStatus',
      label: 'Status',
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => {
        const statusColor = row.userStatus === 'Active' ? 'text-green-600 font-bold' 
                          : row.userStatus === 'Locked' ? 'text-red-600' 
                          : 'text-gray-700';
        
        return (
          <span className={`font-medium  ${statusColor}`}>
            {row.userStatus}
          </span>
        );
      }
    },
    {
      key: 'locktype',
      label: 'Lock Type',
      width: 150,
      enableSearch: true,
      inputType: 'date', 
      isDate: true,   
      render: (row, isSelected) => {
        return (
          <div className="flex items-center justify-center gap-2">
            {row.locktype === 'Locked' ? (
              <span className="text-blue-500" title="Locked"><FaLock /></span>
            ) : row.locktype === 'Unlocked' ? (
               <span className="text-blue-500" title="Unlocked"><FaUnlock /></span>
            ) : (
              <span className="text-gray-400">-</span> 
            )}
          </div>
        );
      }
    },
    {
      key: 'level',
      label: 'Level',
      width: 150,
      render: (row, isSelected) => {
        return (
          <div className="flex items-center gap-2">
            {row.level === 'process' ? (
              <span className="text-green-600 text-lg" title="Process"><FaCheckCircle /> </span>
            ) : row.level === 'queue' ? (
               <span className="text-orange-500 text-lg" title="Queue"><FaHourglassHalf /> </span>
            ) : (<span className="text-gray-600 capitalize">-</span>)}
          </div>
        );
      }
    },
    {
      key: 'create',
      label: 'Create',
      width: 150,
      isSelectionColumn: true,
      getCheckValue: (row) => row.checkStatus, 
      render: (row, isSelected) => (
        <span className={isSelected ? 'font-bold text-center' : ''}></span>
      )
    },
    {
      key: 'Modulename',
      label: 'Module',
      width: 150,
      enableSearch: true,
        inputType: 'date', 
      isDate: true,  
      render: (row, isSelected, index, currentRows) => {
        const prevRow = currentRows[index - 1];
        if (index > 0 && prevRow && prevRow.Modulename === row.Modulename) {
           return null; 
        }
        return <span className="font-bold text-red-700">{row.Modulename}</span>;
      }
    },
    {
      key: 'TasksName',
      label: 'Task',
      width: 150,
      enableSearch: true,
      render: (row, isSelected) => (
        <span className="text-gray-700 pl-4 border-l-2 border-gray-100 block">
           {row.TasksName}
        </span>
      )
    },
  ], []);

  const renderUserDetail = (user) => (
    <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4 text-[13px]">
  <div className="font-semibold text-teal-700">User ID</div>
  <div>-</div>

  <div className="font-semibold text-teal-700">Email</div>
  <div>-</div>

  <div className="font-semibold text-teal-700">Profile Name</div>
  <div>-</div>
</div>

    </div>
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message || "Something went wrong"}</div>;

  return (
    <div className="">
      <h1>Hello World</h1>
      <GridLayout
  columns={userColumns}
  data={userData} 
  getRowId={generateUniqueKey} 
  renderDetailPanel={renderUserDetail}
  enableSelection={true} 
  onSelectionChange={handleSelectionChange}
  initialSelectedIds={initialSelection}
  
  // Add the width prop here
  detailPanelWidth="40%"  // You can use "300px", "50%", "30rem", etc.

  // hidePagination={shouldHidePagination}
  // height="400px"
  // hideFilterRow={true}

  manualPagination={!shouldHidePagination} 
  totalRows={totalRows}
  page={page}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
/>
<h1>Hello world</h1>
<h2>Hello Stream</h2>
    </div>
  );
};

export default UsersPage;
