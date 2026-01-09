import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Check } from 'lucide-react';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout'; 

const StorageMappingForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    storageName: '',
    groupName: '',
  });

  // Grid State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Mock User Data
  const [users, setUsers] = useState([
    { id: 1, name: 'User6(User6)', isMapped: false },
    { id: 2, name: 'User7(User7)', isMapped: false },
    { id: 3, name: 'user9(user9)', isMapped: false },
    { id: 4, name: 'Agar(AgaramTech)', isMapped: false },
    { id: 5, name: 'josephbesky j(jose)', isMapped: false },
    { id: 6, name: 'sreidharan s(sree)', isMapped: false },
    { id: 7, name: 'Admin(System)', isMapped: true },
    { id: 8, name: 'Guest(Guest)', isMapped: false },
  ]);

  useEffect(() => {
    if (initialData) {
        setFormData({
            storageName: initialData.storageName || '',
            groupName: initialData.groupName || ''
        });
    }
  }, [initialData]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Wrapped in useCallback to ensure column definition stability
  const handleUserToggle = useCallback((id) => {
    setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, isMapped: !u.isMapped } : u
    ));
  }, []);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setUsers(prev => prev.map(u => ({ ...u, isMapped: isChecked })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mappedUserIds = users.filter(u => u.isMapped).map(u => u.id);
    onSubmit({ ...formData, mappedUsers: mappedUserIds });
  };

  // --- GRID COLUMNS ---
  const gridColumns = useMemo(() => [
    { 
        key: 'name', 
        label: 'Users', 
        enableSearch: true, // Grid handles search automatically
        width: 100,
        render: (row) => <span className="text-gray-700">{row.name}</span>
    },
    { 
        key: 'isMapped', 
        label: 'Map', 
        enableSearch: false, 
        width: 50,
        render: (row) => (
            <input 
                type="checkbox" 
                checked={row.isMapped} 
                onChange={() => handleUserToggle(row.id)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
            />
        )
    }
  ], [handleUserToggle]); // Dependency ensures render function uses latest handler

  // Helper for Grid ID
  const getRowId = useCallback((row) => row.id, []);

  return (
    <form onSubmit={handleSubmit} className="pt-2 text-sm w-full flex flex-col h-[600px]">
      
      {/* 1. Storage Name */}
      <div className="w-full mb-5">
        <AnimatedDropdown
            label="Storage Name"
            name="storageName"
            value={formData.storageName}
            onChange={(e) => handleChange("storageName", e.target.value)}
            options={['File01', 'Backup_Storage', 'Archive_2023']} 
        />
      </div>

      {/* 2. Group Name */}
      <div className="w-full mb-6">
        <AnimatedDropdown
            label="Group Name"
            name="groupName"
            value={formData.groupName}
            onChange={(e) => handleChange("groupName", e.target.value)}
            options={['Administrator', 'Developers', 'Viewers']} 
        />
      </div>

      {/* 3. User Map Section Header with Global Checkbox */}
      <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold text-gray-700 text-sm">User Map</span>
          <div className="flex items-center gap-2">
            <input 
                type="checkbox" 
                onChange={handleSelectAll}
                checked={users.length > 0 && users.every(u => u.isMapped)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
            />
            <span className="text-gray-600 text-xs">Select All</span>
          </div>
      </div>

      {/* 4. User List Container replaced with GridLayout */}
      <div className="">
          <GridLayout
                columns={gridColumns}
                data={users}
                getRowId={getRowId}
                // Pagination props
                manualPagination={false} // Client-side pagination since we have full 'users' array
                totalRows={users.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                // Layout props
                height="300px"
                headerClassName="bg-gray-50 text-gray-700 font-semibold"
            />
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4 shrink-0">
        <button 
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
         Submit
        </button>
        <button 
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </form>
  );
};

export default StorageMappingForm;
