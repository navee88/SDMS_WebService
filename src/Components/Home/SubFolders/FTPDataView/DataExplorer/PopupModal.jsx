import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineClear } from "react-icons/md";

const PopupModal = ({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  showCloseButton = true,
  closeOnOverlayClick = false, 
  width = '500px',
  height = 'auto',
  enableAnimation = true,   
  animationDuration = '0.4s' 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Helper to get X/Y from either Mouse or Touch event
  const getClientPos = (e) => {
    const event = e.touches ? e.touches[0] : e;
    return { x: event.clientX, y: event.clientY };
  };

  useEffect(() => {
    const move = (e) => {
      if (isDragging.current) {
        // Prevent scrolling on touch devices while dragging
        if(e.type === 'touchmove') {
            // e.preventDefault(); // Uncomment if you want to stop page scrolling while dragging
        }

        const { x, y } = getClientPos(e);
        setPosition({
          x: x - dragStart.current.x,
          y: y - dragStart.current.y
        });
      }
    };

    const up = () => {
      isDragging.current = false;
    };

    // Mouse Listeners
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    
    // Touch Listeners (For Tablets/Mobile)
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, []);

  if (!isOpen) return null;

  // Unified Handler for Start Drag
  const handleDragStart = (e) => {
    isDragging.current = true;
    const { x, y } = getClientPos(e);
    // Calculate the offset from the top-left corner of the modal
    dragStart.current = { x: x - position.x, y: y - position.y };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-10">
      <style>
        {`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(${position.y}px); }
          }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}
      </style>

      <div
        style={{ 
            transform: `translate(${position.x}px, ${position.y}px)`,
            width: width,
            height: height,
            animation: enableAnimation ? `slideDown ${animationDuration} ease-out` : 'none',
            touchAction: 'none' // Important: Prevents browser zooming/scrolling on the modal itself
        }}
        className="bg-white rounded-[5px] shadow-2xl max-w-[90%] max-h-[90vh] flex flex-col relative"
      >
        <div
          // Added onTouchStart here
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart} 
          className="flex justify-between items-center px-6 py-3 bg-slate-100 rounded-t-md cursor-move select-none shrink-0"
        >
          <h3 className="text-lg font-semibold text-blue-700">{title}</h3>
          {showCloseButton && (
            <button 
              onClick={onClose} 
              // Stop propagation so clicking close doesn't start a drag
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="p-1 text-slate-400 hover:scale-90 transition-all"
            >
              <MdOutlineClear className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div 
            className="px-6 py-5 custom-scrollbar flex-grow" 
            style={{ 
                overflowY: 'auto', 
                scrollbarWidth: 'thin', 
                scrollbarColor: '#cbd5e1 #f1f5f9' 
            }}
            // Prevent drag from propagating if user selects text in content
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
