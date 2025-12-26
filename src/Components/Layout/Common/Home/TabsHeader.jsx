// import React, { useState } from "react";
// import { motion } from "framer-motion";

// function TabsHeader({ tabs, selectedTab, setSelectedTab }) {
//   const [hoveredTab, setHoveredTab] = useState(null);

//   return (
//     <div className="flex gap-10 px-4 pt-4 bg-[#f0f4f8] border-b border-[#264ab2] h-[50px]">
//       {tabs.map((tab, index) => {
//         const isActive = selectedTab === index;
//         const isHovered = hoveredTab === index;

//         return (
//           <button
//             key={index}
//             onClick={() => setSelectedTab(index)}
//             onMouseEnter={() => setHoveredTab(index)}
//             onMouseLeave={() => setHoveredTab(null)}
//             className={`
//               relative px-5 py-2 pb-4 text-sm font-semibold transition-all duration-200 rounded-t-[5px] outline-none
//               ${isActive ? "text-[#fbfbfb] scale-110 -translate-y-[1px] z-10" : "text-gray-600 hover:text-[#264ab2] z-0"}
//             `}
//             style={{ minWidth: "90px" }}
//           >

//             {isActive && (
//               <motion.div
//                 layoutId="active-tab-bg"
//                 // className="absolute inset-0 bg-[#264ab2] border-x border-t border-[#264ab2] shadow-inner rounded-t-[5px]"
//                 className="absolute inset-0  text-gray-900 rounded-t-[5px] border-b-4 border-b-blue-900"
//                 initial={false}
//                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
//               />
//             )}

    
//             {/* {isHovered && !isActive && (
//               <motion.div
//                 layoutId="hover-tab-bg"
//                 className="absolute inset-0 bg-blue-300 rounded-t-[5px]"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.2 }}
//               />
//             )} */}

//             <span className="relative z-10 text-gray-950 text-md">{tab.label}</span>

//             {isActive && (
//               <motion.span
            
//                 // initial={{ scaleY: 0 }}
             
//                 // animate={{ scaleY: 1}}
                
//                 // style={{ transformOrigin: "bottom" }}
                
//                 // transition={{ duration: 0.4, ease: "easeInOut" }}
//                 // className="absolute  w-20   bottom-0 h-[3px] pointer-events-none z-20 bg-blue-800 border-b border-x border-blue-800"

//                 // className="absolute left-[2px] -ms-1 w-100 right-[-2px]  bottom-0 h-[4px] rounded-[2px] pointer-events-none z-20 bg-gray-200 border-b border-x border-blue-800"
//               />
//             )}
            
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// export default React.memo(TabsHeader);


import React, { useState } from "react";

function TabsHeader({ tabs, selectedTab, setSelectedTab }) {
  const [hoveredTab, setHoveredTab] = useState(null);

  return (
    <div className="flex gap-10 px-4 pt-4 bg-[#f0f4f8] border-b border-[#264ab2] h-[50px]">
      {tabs.map((tab, index) => {
        const isActive = selectedTab === index;

        return (
          <button
            key={index}
            onClick={() => setSelectedTab(index)}
            onMouseEnter={() => setHoveredTab(index)}
            onMouseLeave={() => setHoveredTab(null)}
            className={`
              relative px-5 py-2 pb-4 text-sm font-semibold outline-none
              transition-colors duration-150
              ${isActive
                ? "text-[#264ab2] border-b-4 border-[#264ab2]"
                : "text-gray-600 hover:text-[#264ab2] border-b-4 border-transparent"}
            `}
            style={{ minWidth: "90px" }}
          >
            <span className="relative z-10 text-md">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default React.memo(TabsHeader);
