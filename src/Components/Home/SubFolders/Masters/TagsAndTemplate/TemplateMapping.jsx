import React, { useState } from 'react';
import { Link, Folder, FolderOpen } from 'lucide-react';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown';

const MOCK_PROJECTS = [
  "Project Alpha",
  "Project Beta",
  "Project Gamma",
  "Website Revamp 2024",
  "Mobile App Redesign",
  "Internal Audit System",
  "Customer Portal v2"
];

// Convert to objects with `label` and `value` keys
const PROJECT_OPTIONS = MOCK_PROJECTS.map(project => ({ label: project, value: project }));

const TemplateMapping = () => {
  const [isMapped, setIsMapped] = useState(true);
  const [selectedProject, setSelectedProject] = useState(PROJECT_OPTIONS[0].value); // Initialize with a string value
  const [isTreeExpanded, setIsTreeExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      {/* Main Content Area */}
      <div className="p-8 max-w-5xl">
        <div className="grid grid-cols-12 gap-y-8 gap-x-4">

          {/* Row 1: Template Type */}
          <div className="col-span-3">
            <label className="text-blue-900 font-bold text-sm">Template Type</label>
          </div>
          <div className="col-span-9 flex items-center">
            <span className="text-gray-700 text-sm mr-3 font-medium">Mapped</span>
            {/* Custom Toggle Switch */}
            <button
              onClick={() => setIsMapped(!isMapped)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                isMapped ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  isMapped ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 2: Template Name */}
          <div className="col-span-3 flex items-center">
            <label className="text-blue-900 font-bold text-sm">Template Name</label>
          </div>
          <div className="col-span-9 flex items-center gap-6">
            <div className="w-64">
              <AnimatedDropdown
                label="Select Project"
                value={selectedProject} // Pass a string value
                options={PROJECT_OPTIONS} // Array of objects with `label` and `value`
                onChange={(e) => setSelectedProject(e.target.value)} // Update with the string value
                displayKey="label" // Specify the key for display
                valueKey="value" // Specify the key for value
                isSearchable
              />
            </div>

            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors">
              <Link className="w-4 h-4" />
              Mapping
            </button>
          </div>

          {/* Row 3: View Template Mapping (Tree View) */}
          <div className="col-span-3 pt-2">
            <label className="text-blue-900 font-bold text-sm">View Template Mapping</label>
          </div>
          <div className="col-span-9">
            <div className="border border-gray-200 rounded bg-white p-4 h-[500px] overflow-y-auto">
              {/* Tree Node Root */}
              <div className="flex flex-col gap-2">
                <div
                  onClick={() => setIsTreeExpanded(!isTreeExpanded)}
                  className="flex items-center gap-2 w-fit bg-blue-50 px-2 py-1 rounded text-blue-900 cursor-pointer select-none hover:bg-blue-100 transition-colors"
                >
                  {isTreeExpanded ? (
                    <FolderOpen className="w-5 h-5 text-blue-500 bg-transparent" />
                  ) : (
                    <Folder className="w-5 h-5 text-blue-500 fill-current bg-transparent" />
                  )}
                  <span className="text-sm font-medium">Project</span>
                </div>

                {/* Children - Only shown if expanded */}
                {isTreeExpanded && (
                  <div className="pl-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-gray-700 text-sm hover:text-blue-600 cursor-pointer">Project-001</span>
                    <span className="text-gray-700 text-sm hover:text-blue-600 cursor-pointer">Project-002</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMapping;
