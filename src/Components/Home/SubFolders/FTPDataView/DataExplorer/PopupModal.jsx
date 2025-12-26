import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineClear } from "react-icons/md";

const PopupModal = ({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  showCloseButton = true,
  closeOnOverlayClick = true 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     if (isOpen) {
//       setPosition({ x: 0, y: 0 });
//     }
//   }, [isOpen]);

  useEffect(() => {
    const move = (e) => {
      if (isDragging.current) {
        setPosition(prev => ({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y
        }));
      }
    };
    const up = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-10"
      onClick={closeOnOverlayClick ? handleOverlayClick : undefined}
    >
      <div
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        className="bg-white rounded-[5px] shadow-2xl w-[500px] max-w-[90%] max-h-[80vh] overflow-y-auto relative"
      >
        <div
          onMouseDown={handleMouseDown}
          className="flex justify-between items-center px-6 py-3 bg-slate-100 rounded-t-md cursor-move select-none"
        >
          <h3 className="text-lg font-semibold text-blue-700">{title}</h3>
          {showCloseButton && (
            <button 
              onClick={onClose} 
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              <MdOutlineClear className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="px-6 py-5">
          {content}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
