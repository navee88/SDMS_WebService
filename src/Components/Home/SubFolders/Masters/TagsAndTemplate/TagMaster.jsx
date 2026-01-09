import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Tag, Check, Eraser, Search, Trash2, Network, Folder, FolderOpen, ChevronsRight, ChevronsLeft } from 'lucide-react';
import GridLayout from '../../../../Layout/Common/Home/Grid/GridLayout';
import PopupModal from '../../FTPDataView/DataExplorer/PopupModal';
import Errordialog from '../../../../Layout/Common/Errordialog';

const TagMaster = () => {
  // --- STATE MANAGEMENT ---
  const [showMapped, setShowMapped] = useState(true);
  const [showUnmapped, setShowUnmapped] = useState(false);

  // Left Grid (Tag Master)
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagName, setTagName] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  // Right List (Tag Value Master)
  const [isTagValueModalOpen, setIsTagValueModalOpen] = useState(false);

  // Edit Tag Value Modal
  const [isEditTagValueModalOpen, setIsEditTagValueModalOpen] = useState(false);
  const [editingTagValueId, setEditingTagValueId] = useState(null);
  const [editingTagValueName, setEditingTagValueName] = useState('');

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [availableTags, setAvailableTags] = useState([]); // Left list (Master)
  const [assignedTags, setAssignedTags] = useState([]);   // Right list (Hierarchy)
  const [selectedLeftItems, setSelectedLeftItems] = useState([]);   
  const [selectedRightItems, setSelectedRightItems] = useState([]); 
  
  // Template Edit State
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null); // For grid selection

  // Main screen search
  const [searchValue, setSearchValue] = useState('');
  const [selectedTagValueId, setSelectedTagValueId] = useState(1);

  // Persisted tag values (main layout)
  const [tagValues, setTagValues] = useState([
    { id: 1, name: 'asd' },
    { id: 2, name: 'hi' },
    { id: 3, name: 'sample' },
    { id: 4, name: 'test' },
    { id: 5, name: 'demo' },
  ]);

  // Tag Master Grid Data
  const [tagMasterData, setTagMasterData] = useState([
    { id: 1, name: 'DataFor', checkStatus: 1 },
    { id: 2, name: 'Trial', checkStatus: 0 },
    { id: 3, name: 'Result', checkStatus: 1 },
    { id: 4, name: 'ARNo', checkStatus: 0 },
    { id: 5, name: 'Test', checkStatus: 1 },
    { id: 6, name: 'Tablets', checkStatus: 1 },
    { id: 7, name: 'Abc', checkStatus: 1 },
    { id: 8, name: 'user1', checkStatus: 1 },
  ]);

  // Template Master Data
  const [templateMasterData, setTemplateMasterData] = useState([]);

  // --- MODAL (DRAFT) STATE ---
  const [newTagValue, setNewTagValue] = useState('');
  const [modalSearchValue, setModalSearchValue] = useState('');
  const [draftTagValues, setDraftTagValues] = useState([]);
  const [modalSelectedValueId, setModalSelectedValueId] = useState(null);
  const [modalBanner, setModalBanner] = useState({ show: false, message: '' });

  // --- MEMOS ---

  // Filter MAIN SCREEN list
  const filteredTagValues = useMemo(() => {
    if (!searchValue) return tagValues;
    return tagValues.filter((t) =>
      t.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, tagValues]);

  // Filter MODAL list
  const modalFilteredValues = useMemo(() => {
    if (!modalSearchValue) return draftTagValues;
    return draftTagValues.filter((t) =>
      t.name.toLowerCase().includes(modalSearchValue.toLowerCase())
    );
  }, [modalSearchValue, draftTagValues]);

  // Auto-select first tag
  useEffect(() => {
    if (!selectedTag && tagMasterData.length > 0) {
      setSelectedTag(tagMasterData[0]);
    }
  }, [selectedTag, tagMasterData]);

  useEffect(() => {
    if (tagValues.length > 0 && !selectedTagValueId) {
      setSelectedTagValueId(tagValues[0].id);
    }
  }, [tagValues]);

  // --- DIALOG HANDLING ---
  const [dialogData, setDialogData] = useState({
    open: false,
    message: '',
    type: '',
    showCancel: false,
    onCancel: null,
    onConfirm: null,
  });

  const showDialog = useCallback((message, type = 'error', options = {}) => {
    setDialogData({
      open: true,
      message,
      type,
      showCancel: !!options.showCancel,
      onCancel: options.onCancel || null,
      onConfirm: options.onConfirm || null,
    });
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogData({
      open: false,
      message: '',
      type: '',
      showCancel: false,
      onCancel: null,
      onConfirm: null,
    });
  }, []);
  
  const handleDialogConfirm = useCallback(() => {
    if (dialogData.onConfirm) {
      dialogData.onConfirm();
    }
    handleDialogClose();
  }, [dialogData, handleDialogClose]);

  // --- TAG MASTER HANDLERS ---
  const handleOpenTagAdd = () => {
    setSelectedTag(null);
    setTagName('');
    setIsTagModalOpen(true);
  };

  const handleOpenTagEdit = () => {
    if (!selectedTag) return;
    setTagName(selectedTag.name);
    setIsTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setIsTagModalOpen(false);
    setTagName('');
  };

  const handleSubmitTag = (e) => {
    e.preventDefault();
    const value = tagName.trim();
    if (!value) return;

    if (selectedTag) {
      setTagMasterData((prev) =>
        prev.map((t) => (t.id === selectedTag.id ? { ...t, name: value } : t))
      );
      setSelectedTag((prev) => (prev ? { ...prev, name: value } : prev));
    } else {
      const newTag = { id: Date.now(), name: value, checkStatus: 1 };
      setTagMasterData((prev) => [...prev, newTag]);
      setSelectedTag(newTag);
    }
    handleCloseTagModal();
  };

  // --- TAG VALUE ADD MODAL HANDLERS ---
  const handleOpenTagValueAdd = () => {
    if (!selectedTag) {
      showDialog('Please select a Tag first to add values.');
      return;
    }

    setDraftTagValues([]);
    setNewTagValue('');
    setModalSearchValue('');
    setModalSelectedValueId(null);
    setModalBanner({ show: false, message: '' });
    setIsTagValueModalOpen(true);
  };

  const handleCloseTagValueModal = () => {
    setIsTagValueModalOpen(false);
    setNewTagValue('');
    setModalSearchValue('');
    setDraftTagValues([]);
    setModalSelectedValueId(null);
    setModalBanner({ show: false, message: '' });
  };

  const showModalBanner = (message) => {
    setModalBanner({ show: true, message });
    setTimeout(() => setModalBanner({ show: false, message: '' }), 2500);
  };

  const handleAddTagValue = (e) => {
    if (e) e.preventDefault();
    const valToAdd = newTagValue.trim();
    if (!valToAdd) return;

    const existsInDraft = draftTagValues.some(
      (t) => t.name.toLowerCase() === valToAdd.toLowerCase()
    );

    const existsInMain = tagValues.some(
      (t) => t.name.toLowerCase() === valToAdd.toLowerCase()
    );

    if (existsInDraft || existsInMain) {
      showModalBanner('Tag Value already exists. Please enter a different Tag Value.');
      return;
    }

    setDraftTagValues((prev) => [...prev, { id: Date.now(), name: valToAdd }]);
    setNewTagValue('');
  };

  const handleRemoveDraftTagValue = (id) => {
    setDraftTagValues((prev) => prev.filter((t) => t.id !== id));
    if (modalSelectedValueId === id) setModalSelectedValueId(null);
  };

  const handleClearSelected = () => {
    if (!modalSelectedValueId) return;
    handleRemoveDraftTagValue(modalSelectedValueId);
  };

  const handleClearAllDraft = () => {
    setDraftTagValues([]);
    setModalSelectedValueId(null);
  };

  const handleSubmitTagValues = () => {
    setTagValues((prev) => [...draftTagValues, ...prev]);

    if (draftTagValues.length > 0) {
      setSelectedTagValueId(draftTagValues[0].id);
    }

    handleCloseTagValueModal();
  };

  // --- TAG VALUE EDIT MODAL HANDLERS ---
  const handleOpenEditTagValue = () => {
    if (!selectedTagValueId) {
      showDialog('Please select a Tag Value to edit.');
      return;
    }
    const valueToEdit = tagValues.find((t) => t.id === selectedTagValueId);
    if (!valueToEdit) return;

    setEditingTagValueId(valueToEdit.id);
    setEditingTagValueName(valueToEdit.name);
    setIsEditTagValueModalOpen(true);
  };

  const handleCloseEditTagValueModal = () => {
    setIsEditTagValueModalOpen(false);
    setEditingTagValueId(null);
    setEditingTagValueName('');
  };

  const handleSubmitEditTagValue = (e) => {
    e.preventDefault();
    const updatedName = editingTagValueName.trim();
    if (!updatedName) return;

    const exists = tagValues.some(
      (t) =>
        t.id !== editingTagValueId &&
        t.name.toLowerCase() === updatedName.toLowerCase()
    );

    if (exists) {
      showDialog('Tag Value already exists. Please enter a different name.');
      return;
    }

    setTagValues((prev) =>
      prev.map((t) =>
        t.id === editingTagValueId ? { ...t, name: updatedName } : t
      )
    );

    handleCloseEditTagValueModal();
  };

  // --- TEMPLATE HANDLERS ---
  const handleOpenTemplateAdd = () => {
    setEditingTemplateId(null);
    setTemplateName('');
    setAvailableTags([...tagMasterData]);
    setAssignedTags([]);
    setSelectedLeftItems([]);
    setSelectedRightItems([]);
    setIsTemplateModalOpen(true);
  };

  const handleOpenTemplateEdit = () => {
    if (!selectedTemplate) {
      showDialog('Please select a template to edit.');
      return;
    }
    
    setEditingTemplateId(selectedTemplate.id);
    setTemplateName(selectedTemplate.name);

    const assigned = [];
    const available = [];
    
    const assignedNames = new Set(selectedTemplate.tags);

    tagMasterData.forEach(tag => {
      if (assignedNames.has(tag.name)) {
        assigned.push(tag);
      } else {
        available.push(tag);
      }
    });

    setAssignedTags(assigned);
    setAvailableTags(available);
    setSelectedLeftItems([]);
    setSelectedRightItems([]);
    setIsTemplateModalOpen(true);
  };

  const handleToggleTemplateStatus = () => {
    if (!selectedTemplate) {
      showDialog('Please select a template to update status.');
      return;
    }

    const currentStatus = selectedTemplate.checkStatus;
    const newStatus = currentStatus === 1 ? 0 : 1;
    const actionText = currentStatus === 1 ? 'Deactivate' : 'Activate';

    showDialog(
      `Are you sure you want to ${actionText} the selected template?`,
      'confirmation',
      {
        showCancel: true,
        onConfirm: () => {
          setTemplateMasterData(prev => prev.map(t => 
            t.id === selectedTemplate.id 
              ? { ...t, checkStatus: newStatus } 
              : t
          ));
          
          setSelectedTemplate(prev => ({ ...prev, checkStatus: newStatus }));
        }
      }
    );
  };

  const handleCloseTemplateModal = () => {
    setIsTemplateModalOpen(false);
    setEditingTemplateId(null);
  };

  // --- TEMPLATE TRANSFER LOGIC ---
  const handleSelectLeft = (id) => {
    if (selectedLeftItems.includes(id)) {
      setSelectedLeftItems(prev => prev.filter(i => i !== id));
    } else {
      setSelectedLeftItems(prev => [...prev, id]);
    }
  };

  const handleSelectRight = (id) => {
    if (selectedRightItems.includes(id)) {
      setSelectedRightItems(prev => prev.filter(i => i !== id));
    } else {
      setSelectedRightItems(prev => [...prev, id]);
    }
  };

  const handleMoveRight = () => {
    const itemsToMove = availableTags.filter(t => selectedLeftItems.includes(t.id));
    setAssignedTags(prev => [...prev, ...itemsToMove]);
    setAvailableTags(prev => prev.filter(t => !selectedLeftItems.includes(t.id)));
    setSelectedLeftItems([]);
  };

  const handleMoveLeft = () => {
    const itemsToMove = assignedTags.filter(t => selectedRightItems.includes(t.id));
    setAvailableTags(prev => [...prev, ...itemsToMove]);
    setAssignedTags(prev => prev.filter(t => !selectedRightItems.includes(t.id)));
    setSelectedRightItems([]);
  };

  const handleSubmitTemplate = (e) => {
    e.preventDefault();
    if(!templateName.trim()) {
      showDialog('Template Name is required');
      return;
    }
    
    if (editingTemplateId) {
      const updatedTemplate = {
         id: editingTemplateId,
         name: templateName,
         tags: assignedTags.map(tag => tag.name),
         checkStatus: selectedTemplate.checkStatus
      };

      setTemplateMasterData(prev => prev.map(t => 
        t.id === editingTemplateId 
          ? updatedTemplate
          : t
      ));
      
      if(selectedTemplate && selectedTemplate.id === editingTemplateId) {
          setSelectedTemplate(prev => ({...prev, name: templateName, tags: assignedTags.map(tag => tag.name) }));
      }

      showDialog(`Template "${templateName}" updated successfully.`, 'success');
    } else {
      const newTemplate = {
        id: Date.now(),
        name: templateName,
        checkStatus: 1,
        tags: assignedTags.map(t => t.name)
      };
      setTemplateMasterData(prev => [...prev, newTemplate]);
      
      setSelectedTemplate(newTemplate);

      showDialog(`Template "${templateName}" created with ${assignedTags.length} tags.`, 'success');
    }
    
    handleCloseTemplateModal();
  };

  // --- COLUMNS ---
  const tagMasterColumns = useMemo(
    () => [
      { key: 'name', label: 'Tag Name', width: 200, enableSearch: true },
      {
        key: 'status',
        label: 'Status',
        width: 80,
        isSelectionColumn: true,
        getCheckValue: (row) => row.checkStatus,
        render: (row, isSelected) => <span className={isSelected ? 'font-bold' : ''} />,
      },
    ],
    []
  );

  const templateMasterColumns = useMemo(
    () => [
      { key: 'name', label: 'Template Name', width: 200 },
      {
        key: 'status',
        label: 'Status',
        width: 100,
        isSelectionColumn: true,
        getCheckValue: (row) => row.checkStatus,
      },
      {
        key: 'tags',
        label: 'Associated Tags',
        width: 250,
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.tags?.map((t, i) => (
              <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 rounded">
                {t}
              </span>
            ))}
          </div>
        ),
      },
    ],
    []
  );

  // --- MODAL CONTENTS ---
  const tagModalContent = (
    <form onSubmit={handleSubmitTag}>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        TagName <span className="text-red-500">*</span>
      </label>
      <input
        value={tagName}
        onChange={(e) => setTagName(e.target.value)}
        className="w-full border-b-2 border-gray-300 py-2 text-sm focus:border-b-blue-500 outline-none"
        placeholder="Enter Tag Name"
        required
      />
      <div className="flex justify-end gap-2 mt-6">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition">
          Submit
        </button>
        <button type="button" onClick={handleCloseTagModal} className="border border-gray-300 text-slate-700 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition">
          Close
        </button>
      </div>
    </form>
  );

  const editTagValueModalContent = (
    <form onSubmit={handleSubmitEditTagValue}>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Tag Value Name <span className="text-red-500">*</span>
      </label>
      <input
        value={editingTagValueName}
        onChange={(e) => setEditingTagValueName(e.target.value)}
        className="w-full border-b-2 border-gray-300 py-2 text-sm focus:border-b-blue-500 outline-none"
        placeholder="Enter Tag Value Name"
        required
      />
      <div className="flex justify-end gap-2 mt-6">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2">
          <Check size={16} /> Submit
        </button>
        <button type="button" onClick={handleCloseEditTagValueModal} className="border border-gray-300 text-slate-700 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition">
          Close
        </button>
      </div>
    </form>
  );

  const addTemplateModalContent = (
    <div className="w-full">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}
      </style>

      {/* Template Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-1">
          Template Name <span className="text-red-500">*</span>
        </label>
        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="w-full border-b border-gray-300 py-2 text-sm focus:border-blue-500 outline-none transition-colors"
          placeholder="Enter Template Name"
        />
        <div className="h-[2px] bg-gray-100 mt-0 w-full"></div>
      </div>

      {/* Transfer Lists Container */}
      <div className="flex items-start gap-4" style={{ height: '300px' }}>
        
        {/* LEFT LIST: Master Tag List */}
        <div className="flex-1 flex flex-col" style={{ height: '300px' }}>
          <h4 className="text-blue-800 font-bold text-sm mb-2">Master Tag List</h4>
          <div className="flex-1 border border-gray-200 rounded-md flex flex-col overflow-hidden">
            {/* List Header */}
            <div className="bg-slate-50 border-b border-gray-200 p-2 flex items-center gap-2 flex-shrink-0">
               {availableTags.length > 0 ? (
                 <FolderOpen size={16} className="text-blue-500" />
               ) : (
                 <Folder size={16} className="text-gray-400" />
               )}
               <span className="text-xs font-bold text-slate-700 bg-slate-200/50 px-2 py-0.5 rounded">TagName</span>
            </div>
            {/* List Body - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar" style={{ minHeight: 0 }}>
               {availableTags.map(tag => (
                 <div 
                   key={tag.id}
                   onClick={() => handleSelectLeft(tag.id)}
                   className={`px-3 py-1.5 text-sm cursor-pointer rounded mb-0.5 transition-colors ${
                     selectedLeftItems.includes(tag.id) 
                       ? 'bg-blue-100 text-blue-800 font-semibold' 
                       : 'text-slate-600 hover:bg-gray-50'
                   }`}
                 >
                   {tag.name}
                 </div>
               ))}
               {availableTags.length === 0 && (
                 <div className="text-center text-xs text-gray-400 mt-4">No tags available</div>
               )}
            </div>
          </div>
        </div>

        {/* MIDDLE BUTTONS */}
        <div className="flex flex-col gap-3" style={{ paddingTop: '28px' }}>
          <button 
            type="button"
            onClick={handleMoveRight}
            disabled={selectedLeftItems.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded shadow-sm border border-blue-100 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronsRight size={20} />
          </button>
          <button 
            type="button"
            onClick={handleMoveLeft}
            disabled={selectedRightItems.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded shadow-sm border border-blue-100 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronsLeft size={20} />
          </button>
        </div>

        {/* RIGHT LIST: Hierarchy List */}
        <div className="flex-1 flex flex-col" style={{ height: '300px' }}>
          <h4 className="text-blue-800 font-bold text-sm mb-2">Tag Hierarchy List</h4>
           <div className="flex-1 border border-gray-200 rounded-md flex flex-col overflow-hidden">
            {/* List Header */}
            <div className="bg-slate-50 border-b border-gray-200 p-2 flex items-center gap-2 flex-shrink-0">
               {assignedTags.length > 0 ? (
                 <FolderOpen size={16} className="text-blue-500" />
               ) : (
                 <Folder size={16} className="text-gray-400" />
               )}
               <span className="text-xs font-bold text-slate-700 bg-slate-200/50 px-2 py-0.5 rounded">TemplateHierarchy</span>
            </div>
            {/* List Body - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar" style={{ minHeight: 0 }}>
               {assignedTags.map(tag => (
                 <div 
                   key={tag.id}
                   onClick={() => handleSelectRight(tag.id)}
                   className={`px-3 py-1.5 text-sm cursor-pointer rounded mb-0.5 transition-colors ${
                     selectedRightItems.includes(tag.id) 
                       ? 'bg-blue-100 text-blue-800 font-semibold' 
                       : 'text-slate-600 hover:bg-gray-50'
                   }`}
                 >
                   {tag.name}
                 </div>
               ))}
               {assignedTags.length === 0 && (
                 <div className="text-center text-xs text-gray-400 mt-4">No tags selected</div>
               )}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2 border-gray-100 mt-3">
        <button 
          type="button"
          onClick={handleSubmitTemplate}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          {editingTemplateId ? 'Update' : 'Submit'}
        </button>
        <button 
          type="button"
          onClick={handleCloseTemplateModal}
          className="bg-white border border-gray-300 text-slate-600 px-4 py-1.5 rounded text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  );

  const tagValueModalContent = (
    <div className="w-full pt-1">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

          .custom-scrollbar-main::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar-main::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
          .custom-scrollbar-main::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          .custom-scrollbar-main::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}
      </style>

      {modalBanner.show && (
        <div className="mb-3 bg-orange-300 text-white text-xs font-semibold px-3 py-2 rounded shadow-sm">
          {modalBanner.message}
        </div>
      )}

      <label className="text-sm font-bold text-slate-700 block mb-3">
        TagValue <span className="text-red-500">*</span>
      </label>

      {/* ROW 1: Input + Add */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTagValue}
          onChange={(e) => setNewTagValue(e.target.value)}
          placeholder="Enter value to add..."
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 shadow-sm transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTagValue(e)}
          autoFocus
        />
        <button
          type="button"
          onClick={handleAddTagValue}
          disabled={!newTagValue.trim()}
          className="flex items-center gap-1 bg-blue-50 text-blue-600 px-4 py-2 rounded text-xs font-bold hover:bg-blue-100 transition whitespace-nowrap border border-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} strokeWidth={3} /> Add
        </button>
      </div>

      {/* ROW 2: List + Actions (UPDATED SELECTION STYLE) */}
      <div className="flex gap-3 h-[250px]">
        
        {/* List container */}
        <div className="flex-1 border border-gray-300 rounded bg-white overflow-hidden relative">
            <div className="sticky top-0 bg-white px-2 py-2 border-b border-gray-200 z-10">
               <input
                  type="text"
                  value={modalSearchValue}
                  onChange={(e) => setModalSearchValue(e.target.value)}
                  placeholder="Looking for..."
                  className="w-full border border-gray-300 px-2 py-1.5 rounded outline-none text-sm focus:border-blue-500 transition-colors"
               />
            </div>
            
            <div className="overflow-y-auto custom-scrollbar" style={{ height: "calc(100% - 46px)" }}>
                 <div className="py-2 font-verdana text-sm shadow-sm shadow-blue-500/40 min-h-full">
                    {modalFilteredValues.length > 0 ? (
                       modalFilteredValues.map((item) => {
                          const isSelected = modalSelectedValueId === item.id;
                          return (
                             <div
                                key={item.id}
                                onClick={() => setModalSelectedValueId(item.id)}
                                className={`flex items-center px-1.3 py-2 gap-2  rounded cursor-pointer transition-colors mb-0.5 ${
                                   isSelected
                                      ? 'px-1.5 border-b border-gray-100 border-l-4 border-l-blue-600 hover:bg-gray-50 bg-blue-50'
                                      : 'text-slate-600 hover:bg-gray-50 border border-transparent px-1.5'
                                }`}
                             >
                                {/* Checkbox Removed - Only Highlight Selection */}
                                {item.name}
                             </div>
                          );
                       })
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 pt-10">
                          <Search size={24} className="opacity-20" />
                          <span className="text-xs">No values found.</span>
                       </div>
                    )}
                 </div>
            </div>
        </div>

        {/* Actions */}
        <div className="w-28 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleClearSelected}
            disabled={!modalSelectedValueId}
            className="w-full flex items-center justify-center gap-1 bg-white text-slate-600 px-3 py-3 rounded border border-gray-200 text-xs font-bold hover:bg-gray-50 hover:text-blue-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eraser size={16} /> Clear
          </button>

          <button
            type="button"
            onClick={handleClearAllDraft}
            disabled={draftTagValues.length === 0}
            className="w-full flex items-center justify-center gap-1 bg-white text-red-500 px-3 py-3 rounded border border-gray-200 text-xs font-bold hover:bg-red-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-2 border-gray-100">
        <button
          type="button"
          onClick={handleSubmitTagValues}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleCloseTagValueModal}
          className="bg-white text-slate-600 border border-gray-300 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="text-slate-700">
      <PopupModal
        isOpen={isTagModalOpen}
        onClose={handleCloseTagModal}
        title={selectedTag ? 'Edit Tag' : 'Add Tag'}
        content={tagModalContent}
        showCloseButton={true}
        closeOnOverlayClick={true}
      />

      <PopupModal
        isOpen={isTagValueModalOpen}
        onClose={handleCloseTagValueModal}
        title={`Add Tag Value for ${selectedTag?.name || '...'}`}
        content={tagValueModalContent}
        showCloseButton={true}
        closeOnOverlayClick={false}
        width="520px"
      />

      <PopupModal
        isOpen={isEditTagValueModalOpen}
        onClose={handleCloseEditTagValueModal}
        title={`Edit Tag Value for ${selectedTag?.name || '...'}`}
        content={editTagValueModalContent}
        showCloseButton={true}
        closeOnOverlayClick={true}
        width="520px"
      />

      {/* ADD/EDIT TEMPLATE MODAL */}
      <PopupModal
        isOpen={isTemplateModalOpen}
        onClose={handleCloseTemplateModal}
        title={editingTemplateId ? "Edit Template" : "Add Template"}
        content={addTemplateModalContent}
        showCloseButton={true}
        closeOnOverlayClick={false}
        width="750px"
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Left Side (Tag Master) */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/80 p-4 rounded-sm shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-blue-700 font-semibold text-[21px]">Tag Master</h2>
              <div className="flex gap-2">
                <button onClick={handleOpenTagAdd} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100">
                  <Plus size={16} /> Add
                </button>
                <button onClick={handleOpenTagEdit} disabled={!selectedTag} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-40">
                  <Edit size={16} /> Edit
                </button>
                <button onClick={() => showDialog('Toggle Active/Inactive?', 'confirmation', { showCancel: true })} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100">
                  <Tag size={16} /> Active/Inactive
                </button>
              </div>
            </div>

            <GridLayout
              data={tagMasterData}
              columns={tagMasterColumns}
              getRowId={(row) => row.id}
              hidePagination={true}
              height="400px"
              onRowClick={setSelectedTag}
              selectedRowId={selectedTag?.id}
            />
          </div>

          <div className="bg-white/80 p-4 rounded-sm shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-blue-700 font-semibold text-[21px]">
                Tag Value Master</h2>
              <div className="flex gap-2">
                <button onClick={handleOpenTagValueAdd} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100">
                  <Plus size={16} /> Add
                </button>
                <button onClick={handleOpenEditTagValue} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100">
                  <Edit size={16} /> Edit
                </button>
              </div>
            </div>

            {/* Main Screen List (UPDATED SELECTION STYLE) */}
            <div className="border border-gray-300 rounded h-[360px] overflow-hidden bg-white relative">
               <div className="sticky top-0 bg-white px-2 py-2 border-b border-gray-200 z-10">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1.5 rounded outline-none text-sm focus:border-blue-500 transition-colors"
                    placeholder="Looking For..."
                  />
               </div>

               <div className="overflow-y-auto custom-scrollbar-main" style={{ height: "calc(100% - 46px)" }}>
                 <div className="py-2 font-verdana text-sm shadow-sm shadow-blue-500/40 min-h-full">
                    {filteredTagValues.length > 0 ? (
                       filteredTagValues.map((item) => {
                          const isSelected = selectedTagValueId === item.id;
                          return (
                             <div
                                key={item.id}
                                onClick={() => setSelectedTagValueId(item.id)}
                                className={`flex items-center gap-2 px-1.5 py-3 rounded cursor-pointer transition-colors mb-0.5 ${
                                   isSelected
                                      ? 'border-b border-gray-100 border-l-4 border-l-blue-600 hover:bg-gray-50 bg-blue-50'
                                      : 'text-slate-600 hover:bg-gray-50 border border-transparent'
                                }`}
                             >
                                {/* Checkbox Removed - Only Highlight Selection */}
                                {item.name}
                             </div>
                          );
                       })
                    ) : (
                       <div className="text-gray-400 text-xs text-center py-8">
                          No values found.
                       </div>
                    )}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side (Template Master) */}
        <div className="bg-white p-4 rounded-md border border-gray-100">
          <h2 className="text-blue-700 font-semibold text-[21px] mb-6">Create Template based on Hierarchy Structure</h2>
          <div className="bg-gray-50 border border-gray-100 rounded-sm p-3 flex flex-col sm:flex-row justify-between items-center mb-6">
            <span className="font-bold text-slate-700 text-sm">Template Type</span>
            <div className="flex items-center gap-8">
              <ToggleSwitch label="Mapped" isActive={showMapped} onToggle={() => { setShowMapped(true); setShowUnmapped(false); }} />
              <ToggleSwitch label="Unmapped" isActive={showUnmapped} onToggle={() => { setShowUnmapped(true); setShowMapped(false); }} />
            </div>
          </div>

          {/* Action Buttons for Template Master */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-blue-700 font-semibold text-[20px]">Template Master</h2>
            <div className="flex gap-2">
              <button onClick={handleOpenTemplateAdd} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100">
                <Plus size={16} /> Add
              </button>
              <button onClick={handleOpenTemplateEdit} disabled={!selectedTemplate} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50">
                <Edit size={16} /> Edit
              </button>
              <button onClick={handleToggleTemplateStatus} disabled={!selectedTemplate} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50">
                <Tag size={16} /> Active/Inactive
              </button>
              
            </div>
          </div>

          <GridLayout 
            data={templateMasterData} 
            columns={templateMasterColumns} 
            getRowId={(r) => r.id} 
            hidePagination={true} 
            height="550px" 
            onRowClick={setSelectedTemplate}
            selectedRowId={selectedTemplate?.id}
          />
        </div>
      </div>

      {/* Error/Confirmation dialog */}
      {dialogData.open && (
        <Errordialog
          message={dialogData.message}
          type={dialogData.type}
          onClose={handleDialogClose}
          showCancel={dialogData.showCancel}
          onCancel={handleDialogClose}
          onConfirm={handleDialogConfirm}
        />
      )}
    </div>
  );
};

const ToggleSwitch = ({ label, isActive, onToggle }) => (
  <div className="flex items-center gap-3 cursor-pointer group" onClick={onToggle}>
    <span className={`text-sm font-medium transition-colors ${isActive ? 'text-slate-700' : 'text-gray-400 group-hover:text-gray-500'}`}>
      {label}
    </span>
    <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors duration-200 ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}>
      {isActive ? (
        <div className="w-full flex justify-center">
          <Check size={14} className="text-white" strokeWidth={4} />
        </div>
      ) : (
        <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
      )}
    </div>
  </div>
);

export default TagMaster;
