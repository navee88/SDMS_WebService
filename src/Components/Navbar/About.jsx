import React, { useState, useMemo, useEffect } from "react";
import SDMS_Logo from "../../Assests/SDMS_Logo.webp";
import GridLayout from "../Layout/Common/Home/Grid/GridLayout";

const AboutContent = ({ onClose, updateTitle, updateWidth }) => { // Added updateWidth prop
  // State to toggle between "About" view and "Service Info" view
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [serviceData] = useState([]); 

  const serviceColumns = useMemo(() => [
    {
      key: 'clientName',
      label: 'Client Name',
      flex: 1,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.clientName}</span>
    },
    {
      key: 'roboticsFileMonitor',
      label: 'Robotics File Monitor',
      flex: 1,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.roboticsFileMonitor}</span>
    },
    {
      key: 'roboticsFileUpload',
      label: 'Robotics File Upload',
      flex: 1,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.roboticsFileUpload}</span>
    },
    {
      key: 'roboticsFileWatcher',
      label: 'Robotics File Watcher',
      flex: 1,
      enableSearch: true,
      render: (row) => <span className="text-gray-700">{row.roboticsFileWatcher}</span>
    },
  ], []);

  const getRowId = (row) => row.id || Math.random().toString(36).substr(2, 9);


  const handleShowMoreInfo = () => {
    setShowServiceInfo(true);
    if (updateTitle) updateTitle("Service Information");
    if (updateWidth) updateWidth("1200px"); 
  };


  const handleBackToAbout = () => {
    setShowServiceInfo(false);
    if (updateTitle) updateTitle("About Logilab SDMS");
    if (updateWidth) updateWidth("600px"); 
  };

  
  if (showServiceInfo) {
    return (
      <div className="w-full h-full flex flex-col">

        {/* Grid Container */}
        <div className="w-[100%]  p-2" style={{ minHeight: "300px" }}>
           <GridLayout
              columns={serviceColumns}
              data={serviceData}
              getRowId={getRowId}
              enableSelection={false}
              renderDetailPanel={null}
              height="350px"
              hidePagination={true}
              manualPagination={false}
           />
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-auto border-t border-gray-200 px-4 pb-2">
           {/* CHANGED: Clicking Close now goes back to About view */}
           <button
            onClick={handleBackToAbout} 
          className="btn-actionsecondary transition-all hover:scale-95 hover:rounded-md text-sm "
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: Main About Info ---
  return (
    <div className="w-full p-2">
      <div className="flex gap-6 items-start">
        <div className="flex-shrink-0">
          <img
            src={SDMS_Logo}
            alt="Logilab SDMS Logo"
            className="w-24 h-auto object-contain"
          />
        </div>

        <div className="flex flex-col space-y-3 text-sm text-gray-700">
          <h2 className="text-xl font-bold text-blue-900 leading-tight">
            Logilab Scientific Data Management System
          </h2>
          
          <div className="space-y-1">
            <p>
              <span className="font-semibold text-gray-600">Version : </span>
              <span className="font-bold">v7.2_20250520_01</span>
            </p>
            <p>
              <span className="font-semibold text-gray-600">Licensed By : </span>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Copyright: Agaram Technologies (P) Ltd. All rights reserved
            </p>
          </div>

          <button
  onClick={handleShowMoreInfo}
  className="transition-all hover:scale-95 hover:rounded-md text-blue-500 font-bold hover:text-blue-700 text-left w-fit mt-2 flex items-center group"
>
  <span className="group-hover:underline">More Service Information</span>
  <span className="ml-1 -mt-0.9 text-lg">»</span>
</button>

        </div>
      </div>

      <div className="flex justify-end pt-2 mt-1  border-gray-100">
        <button
          onClick={onClose} // This closes the modal completely
          className="btn-actionsecondary transition-all hover:scale-95 hover:rounded-md text-sm "
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AboutContent;
