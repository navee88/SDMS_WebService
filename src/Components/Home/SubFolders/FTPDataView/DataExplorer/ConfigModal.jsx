import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, CheckSquare } from 'lucide-react';

const CheckboxItem = React.memo(({ label, checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between py-2 hover:bg-slate-50 px-2 rounded cursor-pointer group transition-colors mr-2"
  >
    <span className="text-slate-700 font-medium text-sm select-none group-hover:text-blue-700">{label}</span>
    <input
      type="checkbox"
      checked={!!checked}
      onChange={() => {}}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
    />
  </div>
));

const CUSTOM_FILTERS = ["Instrument", "Workflow Status", "Task Status"];
const CUSTOM_COLUMNS = ["Parser Status"];

export default function ConfigModal({ onClose, currentVisibility, onSave, showDialog }) {
  const [tempVisibility, setTempVisibility] = useState({ ...currentVisibility });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const move = (e) => isDragging.current && setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    const up = () => isDragging.current = false;
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  const toggleVis = (key) => setTempVisibility(p => ({ ...p, [key]: !p[key] }));

  const handleSubmit = () => {
    onSave(tempVisibility);
    onClose();
    showDialog("Configuration Updated Successfully", "success");
  };

   const scrollbarStyles = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e1 #f1f5f9'
  };

  const lists = useMemo(() => ({
    filters: CUSTOM_FILTERS.map(i => <CheckboxItem key={i} label={i} checked={tempVisibility[i]} onChange={() => toggleVis(i)} />),
    columns: CUSTOM_COLUMNS.map(i => <CheckboxItem key={i} label={i} checked={tempVisibility[i]} onChange={() => toggleVis(i)} />),
    actions: [
      "Open", "File Download", "Restore", "Folder Download", "File Upload", "Folder Upload",
      "Version History", "Work Complete", "Workflow History", "Tag", "Audit Trail History",
      "Attribute", "Multi-File Select"
    ].map(i => <CheckboxItem key={i} label={i} checked={tempVisibility[i]} onChange={() => toggleVis(i)} />)
  }), [tempVisibility]);

  return (
    <>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          className="bg-white w-[650px] max-w-[95%] rounded-md shadow-2xl flex flex-col border border-slate-200"
        >
          <div
            onMouseDown={handleMouseDown}
            className="flex justify-between px-6 py-3 border-b border-slate-100 cursor-move bg-slate-50/50 rounded-t-md select-none"
          >
            <h2 className="text-xl font-semibold text-blue-700">Configuration</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div><h3 className="text-blue-800 font-bold mb-3">Custom Filter</h3>{lists.filters}</div>
              <div><h3 className="text-blue-800 font-bold mb-3">Custom Column</h3>{lists.columns}</div>
            </div>
            <div className="md:border-l md:border-slate-200 md:pl-8">
              <h3 className="text-blue-800 font-bold mb-3">Custom Actions</h3>
              <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar" style={scrollbarStyles}>{lists.actions}</div>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50/50 rounded-b-md">
            <button
              onClick={handleSubmit}
              className="px-3 py-2 bg-blue-600 text-white font-medium text-sm rounded hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
              {/* <CheckSquare className="w-2.5 h-2.5" />  */}
              Submit
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-white border text-sm border-slate-300 text-slate-600 font-medium rounded hover:bg-slate-50 shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
