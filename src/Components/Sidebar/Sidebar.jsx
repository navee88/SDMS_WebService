import React, { useRef, useCallback } from "react";
import { VscTriangleLeft } from "react-icons/vsc";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaUser } from "react-icons/fa";
import { useClickAway } from "@uidotdev/usehooks";

const SIDEBAR_WIDTH = 64;
const PANEL_WIDTH = 250;

function Sidebar({ menuItems, selectedIndex, selectedSub, setSelectedIndex, setSelectedSub }) {
  const [activeIndex, setActiveIndex] = React.useState(null);
  const sidebarRef = useRef();
  const panelRef = useRef();
  const toggleRef = useRef();


  useClickAway(() => setActiveIndex(null), [sidebarRef, panelRef, toggleRef]);

  const handleItemClick = useCallback((idx, item) => {
    setSelectedIndex(idx);
    setSelectedSub(0);
    if (item.subItems) {
      setActiveIndex(idx === activeIndex ? null : idx);
    } else {
      setActiveIndex(null);
    }
  }, [activeIndex, setSelectedIndex, setSelectedSub]);

  const handleToggle = useCallback(() => {
    setActiveIndex(activeIndex === null ? selectedIndex : null);
  }, [activeIndex, selectedIndex]);

  const handleSubClick = useCallback((subIdx) => {
    setSelectedSub(subIdx);
    setTimeout(() => setActiveIndex(null), 100);
  }, [setSelectedSub]);

  const panelStyle = {
    left: SIDEBAR_WIDTH,
    width: activeIndex !== null ? PANEL_WIDTH : 0,
    opacity: activeIndex !== null ? 1 : 0,
    overflow: "hidden",
    pointerEvents: activeIndex !== null ? "auto" : "none",
    transition: "width 0.3s ease, opacity 0.3s ease"
  };

  const toggleStyle = {
    top: '16px',
    left: activeIndex !== null ? SIDEBAR_WIDTH + PANEL_WIDTH : SIDEBAR_WIDTH - 8,
    transition: 'left 0.3s ease-in-out'
  };

  return (
    <div className="flex relative z-50">
      
      <div ref={sidebarRef} className="mt-[7px] w-16 flex flex-col items-center rounded-bl-3xl relative z-20">
        {menuItems.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => handleItemClick(idx, item)}
              className="relative group w-full cursor-pointer p-4 flex items-center justify-center transition-all"
            >
              <div className={`transition-all duration-200 group-hover:scale-75 text-[25px] 
                ${isSelected ? "text-white" : "text-gray-300"}`}>
                {item.icon}
              </div>
              <div className="absolute top-[42px] bg-blue-900 px-[4px] py-[2px] text-white rounded-sm 
                opacity-0 group-hover:opacity-100 transition-all duration-200 text-[11px] z-50 pointer-events-none">
                {item.label}
              </div>
              {isSelected && (
                <div className="absolute -right-[6.8px] top-[29px] -translate-y-1/2">
                  <VscTriangleLeft size={24} className="text-[#f0f2f5]" />
                </div>
              )}
            </div>
          );
        })}
        <div className="fixed bottom-0 text-white text-2xl p-4">
          <FaUser size={42} />
        </div>
      </div>

     
      <div
        ref={panelRef}
        className="bg-[#e6e9ec] min-h-screen shadow-lg p-6 absolute top-0 z-10 -ms-[1.6px] backdrop-blur-10"
        style={panelStyle}
      >
        {activeIndex !== null && (
          <>
            <h2 className="text-[17px] font-[600] text-[#141625] mb-4 whitespace-nowrap">
              {menuItems[activeIndex].label}
            </h2>
            <ul className="-ms-3 px-2 space-y-2">
              {menuItems[activeIndex].subItems.map((subItem, subIdx) => {
                const isActive = selectedIndex === activeIndex && selectedSub === subIdx;
                return (
                  <li
                    key={subIdx}
                    onClick={() => handleSubClick(subIdx)}
                    className={`flex items-center py-2 px-2 gap-1.5 cursor-pointer rounded-sm w-[200px]
                      ${isActive ? "bg-gray-300 text-[#154481]" : "hover:bg-gray-400/40"}`}
                  >
                    <span className={`w-2 h-2 rounded-full transition-all
                      ${isActive ? "bg-white" : "bg-blue-600 opacity-0 group-hover:opacity-100"}`} />
                    <button className="text-[14px] text-start font-semibold">
                      {subItem.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

     
      <div
        ref={toggleRef}
        className={`absolute bg-[#264ab2] py-3 px-1 rounded-r-[5px] shadow-lg text-white cursor-pointer z-30
          ${activeIndex === null ? "ms-1" : ""}`}
        style={toggleStyle}
        onClick={handleToggle}
      >
        {activeIndex !== null ? (
          <FaAngleDoubleLeft size={14} className="hover:ms-1 active:me-1 transition-all" />
        ) : (
          <FaAngleDoubleRight size={14} className="hover:ms-1 active:ms-1 transition-all" />
        )}
      </div>
    </div>
  );
}

export default React.memo(Sidebar);

