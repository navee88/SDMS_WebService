import React, { useState, useRef, useCallback } from 'react';
import { Upload, FolderUp } from 'lucide-react';

/**
 * Component for File Upload Logic
 */
const FileUploadContent = ({ onClose }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    console.log("Upload", selectedFile);
    // Add your API upload logic here
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Upload path :</label>
        <div className="text-xs text-slate-500 font-medium px-2 py-1.5 bg-slate-50 rounded border border-slate-100">
          /Root/Current/Folder/Path
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">
          File <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Choose files
          </button>
          <span className="text-xs text-slate-600 font-medium truncate max-w-[200px]">
            {selectedFile ? selectedFile.name : "No file chosen"}
          </span>
        </div>
        <p className="text-[10px] font-semibold text-slate-400 mt-1">
          NOTE:- Upload File should be less than 200 MB
        </p>
      </div>
      <div className="flex justify-end gap-3 pt-1 mt-4 border-t border-slate-100">
        <button
          onClick={handleUpload}
          className="flex items-center gap-2 px-2 py-2 bg-blue-600 hover:bg-blue-600 text-white text-[13px] font-bold rounded shadow-sm transition-all active:scale-95"
          disabled={!selectedFile}
        >
          <Upload className="w-4 h-4 stroke-[3]" /> Upload
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded shadow-sm transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/**
 * Component for Folder Upload Logic
 */
const FolderUploadContent = ({ onClose }) => (
  <div className="p-4 text-center text-slate-600">
    <FolderUp className="w-10 h-10 mx-auto mb-2 text-blue-500" />
    <p>Folder Upload Content Here</p>
    <div className="flex justify-center gap-3 mt-4">
      <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
        Upload Folder
      </button>
      <button onClick={onClose} className="px-4 py-2 border rounded text-sm">
        Close
      </button>
    </div>
  </div>
);


const TagContent = ({ onClose }) => (
  <div className="flex flex-col gap-4">
    <label className="text-sm font-bold text-slate-700">Add Tags</label>
    <input
      type="text"
      className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter tags (comma separated)..."
    />
    <div className="flex justify-end gap-2">
      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
        Save Tag
      </button>
      <button
        onClick={onClose}
        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-sm transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
);


const PopupContent = ({ type, onClose }) => {
  switch (type) {
    case "File Upload":
      return <FileUploadContent onClose={onClose} />;
    case "Folder Upload":
      return <FolderUploadContent onClose={onClose} />;
    case "Tag":
      return <TagContent onClose={onClose} />;
    default:
      return (
        <div className="p-4 text-slate-600">
          Content not available for this action
        </div>
      );
  }
};

export default PopupContent;
