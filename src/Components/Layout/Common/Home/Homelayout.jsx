// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { menuConfig } from "./MenuConfig";
// import Sidebar from "../../../Sidebar/Sidebar";
// import Navbar from "../../../Navbar/Navbar";

// function Homelayout() {
//   const SIDEBAR_WIDTH = 62;
//   const NAVBAR_HEIGHT = 60;

//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const [selectedSub, setSelectedSub] = useState(0);

//   const renderContent = () => {
//     const menu = menuConfig[selectedIndex];
//     if (!menu) return null;
//     const sub = menu.subItems[selectedSub];
//     if (!sub) return null;
//     return sub.content;
//   };

//   return (
//     <>
//     <div
//       className="h-screen w-full grid"
//       style={{
//         gridTemplateColumns: `${SIDEBAR_WIDTH}px 1fr`,
//         gridTemplateRows: `${NAVBAR_HEIGHT}px 1fr`,
//         gridTemplateAreas: `
//           "sidebar navbar"
//           "sidebar main"
//         `,
//       }}
//     >
//       <aside
//         className="bg-[#1A57A6] z-50"
//         style={{ gridArea: "sidebar" }}
//       >
//         <Sidebar
//           menuItems={menuConfig}
//           selectedIndex={selectedIndex}
//           selectedSub={selectedSub}
//           setSelectedIndex={setSelectedIndex}
//           setSelectedSub={setSelectedSub}
//         />
//       </aside>

//       <header
//         className="bg-white z-40"
//         style={{ gridArea: "navbar" }}
//       >
//         <Navbar />
//       </header>

//       <main
//         className="overflow-hidden bg-white"
//         style={{ gridArea: "main", height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
//       >
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={`${selectedIndex}-${selectedSub}`}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.1 }}
//           >
//             {renderContent()}
//           </motion.div>
//         </AnimatePresence>
//       </main>
//     </div>
//     </>
//   );
// }

// export default React.memo(Homelayout);

// import React, { useState, useMemo, Suspense } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { menuConfig } from "./MenuConfig";
// import Sidebar from "../../../Sidebar/Sidebar";
// import Navbar from "../../../Navbar/Navbar";
// import TabSwitchListener from '../../../../Context/TabSwitchListener';
// import { useSchedulerNavigation } from '../../../../Context/SchedulerNavigationContext'; // ✅ ADD THIS IMPORT


// const FTP_LABEL = "FTP Data View";

// function Homelayout() {
//   const SIDEBAR_WIDTH = 62;
//   const NAVBAR_HEIGHT = 60;

//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const [selectedSub, setSelectedSub] = useState(0);

//   const ftpIndex = useMemo(
//     () => menuConfig.findIndex(item => item.label === FTP_LABEL),
//     []
//   );

//   const isFtpActive = selectedIndex === ftpIndex;

// //   const handleTabSwitch = (parentTab, childTab) => {
// //     console.log('Tab switch requested:', { parentTab, childTab });
// //       // Check if we're already on the requested tab
// //     const currentParent = menuConfig[selectedIndex]?.label;
// //     const currentChild = menuConfig[selectedIndex]?.subItems[selectedSub]?.label;

// //     if (currentParent === parentTab && currentChild === childTab) {
// //         console.log('Already on the requested tab, skipping');
// //         return;
// //     }
// //     // parentTab should be "Scheduler"
// //     // childTab should be "View Edit Scheduler"

// //     const parentIndex = menuConfig.findIndex(item => item.label === parentTab);

// //     if (parentIndex !== -1) {
// //         console.log('Found parent menu at index:', parentIndex);
// //         setSelectedIndex(parentIndex);

// //         const childIndex = menuConfig[parentIndex].subItems.findIndex(
// //             sub => sub.label === childTab
// //         );

// //         if (childIndex !== -1) {
// //             console.log('Found child tab at index:', childIndex);
// //             setTimeout(() => {
// //                 setSelectedSub(childIndex);
// //             }, 100);
// //         } else {
// //             console.warn('Child tab not found:', childTab);
// //             console.log('Available children:', menuConfig[parentIndex].subItems.map(s => s.label));
// //         }
// //     } else {
// //         console.warn('Parent menu not found:', parentTab);
// //         console.log('Available parents:', menuConfig.map(m => m.label));
// //     }
// // };

// const handleTabSwitch = (parentTab, childTab) => {
//   console.log('Tab switch requested:', { parentTab, childTab });

//   const currentParent = menuConfig[selectedIndex]?.label;
//   const currentChild = menuConfig[selectedIndex]?.subItems[selectedSub]?.label;

//   // ✅ ONLY skip if we're on the same tab AND navigation state is clear
//   const { activeParentTab, activeChildTab } = useSchedulerNavigation?.() || {};

//   if (currentParent === parentTab && 
//       currentChild === childTab && 
//       !activeParentTab && 
//       !activeChildTab) {
//     console.log('Already on requested tab with clear state, skipping');
//     return;
//   }

//   const parentIndex = menuConfig.findIndex(item => item.label === parentTab);

//   if (parentIndex !== -1) {
//     console.log('Found parent menu at index:', parentIndex);
//     setSelectedIndex(parentIndex);

//     const childIndex = menuConfig[parentIndex].subItems.findIndex(
//       sub => sub.label === childTab
//     );

//     if (childIndex !== -1) {
//       console.log('Found child tab at index:', childIndex);
//       setTimeout(() => {
//         setSelectedSub(childIndex);
//       }, 100);
//     }
//   }
// };

//   const renderDynamicContent = () => {
//     if (isFtpActive) return null;

//     const menu = menuConfig[selectedIndex];
//     if (!menu) return null;

//     const subItem = menu.subItems[selectedSub];
//     if (!subItem) return null;

//     return React.createElement(subItem.content);
//   };

//   return (
//     <div
//       className="h-screen w-full grid"
//       style={{
//         gridTemplateColumns: `${SIDEBAR_WIDTH}px 1fr`,
//         gridTemplateRows: `${NAVBAR_HEIGHT}px 1fr`,
//         gridTemplateAreas: `
//           "sidebar navbar"
//           "sidebar main"
//         `,
//       }}
//     >
//       {/* ADD THIS - Place it at the top of the component */}
//       <TabSwitchListener onSwitchTab={handleTabSwitch} />
//       <aside className="bg-[#1A57A6] z-50" style={{ gridArea: "sidebar" }}>
//         <Sidebar
//           menuItems={menuConfig}
//           selectedIndex={selectedIndex}
//           selectedSub={selectedSub}
//           setSelectedIndex={setSelectedIndex}
//           setSelectedSub={setSelectedSub}
//         />
//       </aside>

//       <header className="bg-white" style={{ gridArea: "navbar" }}>
//         <Navbar />
//       </header>

//       <main
//         className="relative bg-white overflow-hidden"
//         style={{ gridArea: "main" }}
//       >
//         {/* FTP LAYER (Data Explorer loads immediately) */}
//         {ftpIndex !== -1 && (
//           <div
//             style={{
//               display: isFtpActive ? "block" : "none",
//               height: "100%",
//               width: "100%",
//             }}
//           >
//             <Suspense fallback={<LoadingSpinner />}>
//               {menuConfig[ftpIndex].subItems.map((sub, index) => {
//                 const Component = sub.content;
//                 return (
//                   <div
//                     key={sub.label}
//                     style={{
//                       display: selectedSub === index ? "block" : "none",
//                       height: "100%",
//                       width: "100%",
//                     }}
//                   >
//                     <Component />
//                   </div>
//                 );
//               })}
//             </Suspense>
//           </div>
//         )}

//         {/* OTHER MENUS - Lazy loaded */}
//         <AnimatePresence mode="wait">
//           {!isFtpActive && (
//             <motion.div
//               key={`${selectedIndex}-${selectedSub}`}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.5 }}
//               style={{ height: "100%", width: "100%" }}
//             >
//               <Suspense fallback={<LoadingSpinner />}>
//                 {renderDynamicContent()}
//               </Suspense>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// // Loading fallback component
// function LoadingSpinner() {
//   return (
//     <div className="flex items-center justify-center h-full">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A57A6]"></div>
//     </div>
//   );
// }

// export default React.memo(Homelayout);

//Kirubhakaran -------------------------------------------
// import React, { useState, useMemo, Suspense } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { menuConfig } from "./MenuConfig";
// import Sidebar from "../../../Sidebar/Sidebar";
// import Navbar from "../../../Navbar/Navbar";
// import TabSwitchListener from '../../../../Context/TabSwitchListener';
// import { useSchedulerNavigation } from '../../../../Context/SchedulerNavigationContext'; // ADD THIS IMPORT

// const FTP_LABEL = "FTP Data View";

// function Homelayout() {
//   const SIDEBAR_WIDTH = 62;
//   const NAVBAR_HEIGHT = 60;

//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const [selectedSub, setSelectedSub] = useState(0);

//   // MOVE HOOK TO TOP LEVEL
//   const { activeParentTab, activeChildTab } = useSchedulerNavigation();

//   const ftpIndex = useMemo(
//     () => menuConfig.findIndex(item => item.label === FTP_LABEL),
//     []
//   );

//   const isFtpActive = selectedIndex === ftpIndex;

//   const handleTabSwitch = (parentTab, childTab) => {
//     console.log('Tab switch requested:', { parentTab, childTab });

//     const currentParent = menuConfig[selectedIndex]?.label;
//     const currentChild = menuConfig[selectedIndex]?.subItems[selectedSub]?.label;

//     // USE HOOK VALUES THAT ARE ALREADY AVAILABLE
//     if (currentParent === parentTab && 
//         currentChild === childTab && 
//         !activeParentTab && 
//         !activeChildTab) {
//       console.log('Already on requested tab with clear state, skipping');
//       return;
//     }

//     const parentIndex = menuConfig.findIndex(item => item.label === parentTab);

//     if (parentIndex !== -1) {
//       console.log('Found parent menu at index:', parentIndex);
//       setSelectedIndex(parentIndex);

//       const childIndex = menuConfig[parentIndex].subItems.findIndex(
//         sub => sub.label === childTab
//       );

//       if (childIndex !== -1) {
//         console.log('Found child tab at index:', childIndex);
//         setTimeout(() => {
//           setSelectedSub(childIndex);
//         }, 100);
//       } else {
//         console.warn('Child tab not found:', childTab);
//         console.log('Available children:', menuConfig[parentIndex].subItems.map(s => s.label));
//       }
//     } else {
//       console.warn('Parent menu not found:', parentTab);
//       console.log('Available parents:', menuConfig.map(m => m.label));
//     }
//   };

//   const renderDynamicContent = () => {
//     if (isFtpActive) return null;

//     const menu = menuConfig[selectedIndex];
//     if (!menu) return null;

//     const subItem = menu.subItems[selectedSub];
//     if (!subItem) return null;

//     return React.createElement(subItem.content);
//   };

//   return (
//     <div
//       className="h-screen w-full grid"
//       style={{
//         gridTemplateColumns: `${SIDEBAR_WIDTH}px 1fr`,
//         gridTemplateRows: `${NAVBAR_HEIGHT}px 1fr`,
//         gridTemplateAreas: `
//           "sidebar navbar"
//           "sidebar main"
//         `,
//       }}
//     >
//       <TabSwitchListener onSwitchTab={handleTabSwitch} />

//       <aside className="bg-[#1A57A6] z-50" style={{ gridArea: "sidebar" }}>
//         <Sidebar
//           menuItems={menuConfig}
//           selectedIndex={selectedIndex}
//           selectedSub={selectedSub}
//           setSelectedIndex={setSelectedIndex}
//           setSelectedSub={setSelectedSub}
//         />
//       </aside>

//       <header className="bg-white" style={{ gridArea: "navbar" }}>
//         <Navbar />
//       </header>

//       <main
//         className="relative bg-white overflow-hidden"
//         style={{ gridArea: "main" }}
//       >
//         {/* FTP LAYER */}
//         {ftpIndex !== -1 && (
//           <div
//             style={{
//               display: isFtpActive ? "block" : "none",
//               height: "100%",
//               width: "100%",
//             }}
//           >
//             <Suspense fallback={<LoadingSpinner />}>
//               {menuConfig[ftpIndex].subItems.map((sub, index) => {
//                 const Component = sub.content;
//                 return (
//                   <div
//                     key={sub.label}
//                     style={{
//                       display: selectedSub === index ? "block" : "none",
//                       height: "100%",
//                       width: "100%",
//                     }}
//                   >
//                     <Component />
//                   </div>
//                 );
//               })}
//             </Suspense>
//           </div>
//         )}

//         {/* OTHER MENUS */}
//         <AnimatePresence mode="wait">
//           {!isFtpActive && (
//             <motion.div
//               key={`${selectedIndex}-${selectedSub}`}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.5 }}
//               style={{ height: "100%", width: "100%" }}
//             >
//               <Suspense fallback={<LoadingSpinner />}>
//                 {renderDynamicContent()}
//               </Suspense>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// function LoadingSpinner() {
//   return (
//     <div className="flex items-center justify-center h-full">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A57A6]"></div>
//     </div>
//   );
// }

// export default React.memo(Homelayout);

//-----------------------------------------------------------

// Athira


import React, { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { menuConfig } from "./MenuConfig";
import Sidebar from "../../../Sidebar/Sidebar";
import Navbar from "../../../Navbar/Navbar";
import TabSwitchListener from '../../../../Context/TabSwitchListener';
import { useSchedulerNavigation } from '../../../../Context/SchedulerNavigationContext'; // ADD THIS IMPORT

const FTP_LABEL = "FTP Data View";

function Homelayout() {
  const SIDEBAR_WIDTH = 62;
  const NAVBAR_HEIGHT = 60;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSub, setSelectedSub] = useState(0);

  // MOVE HOOK TO TOP LEVEL
  const { activeParentTab, activeChildTab } = useSchedulerNavigation();

  const ftpIndex = useMemo(
    () => menuConfig.findIndex(item => item.label === FTP_LABEL),
    []
  );

  const schedulerIndex = useMemo(
    () => menuConfig.findIndex(item => item.label === "Scheduler"),
    []
  );

  const isFtpActive = selectedIndex === ftpIndex;

  const handleSetSelectedIndex = (newIndex) => {
    setSelectedIndex(newIndex);

    // Determine the correct submenu index
    let targetSubIndex = 0;

    if (newIndex === schedulerIndex) {
      targetSubIndex = 1; // View Edit Scheduler
    } else {
      targetSubIndex = 0; // Default to first submenu for other menus
    }

    // Set the submenu with a small delay to ensure parent renders first
    setTimeout(() => {
      setSelectedSub(targetSubIndex);
    }, 50);
  };

  const handleTabSwitch = (parentTab, childTab) => {
    console.log('Tab switch requested:', { parentTab, childTab });

    const currentParent = menuConfig[selectedIndex]?.label;
    const currentChild = menuConfig[selectedIndex]?.subItems[selectedSub]?.label;

    if (currentParent === parentTab && currentChild === childTab) {
      console.log('Already on requested tab, skipping');
      return;
    }

    const parentIndex = menuConfig.findIndex(item => item.label === parentTab);

    if (parentIndex !== -1) {
      console.log('Found parent menu at index:', parentIndex);
      setSelectedIndex(parentIndex);

      const childIndex = menuConfig[parentIndex].subItems.findIndex(
        sub => sub.label === childTab
      );

      if (childIndex !== -1) {
        console.log('Found child tab at index:', childIndex);
        setTimeout(() => {
          setSelectedSub(childIndex);
        }, 100);
      } else {
        console.warn('Child tab not found:', childTab);
        // ADD THIS: Use default logic when child not found
        if (parentIndex === schedulerIndex) {
          setSelectedSub(1); // Default to View Edit Scheduler
        } else {
          setSelectedSub(0); // Default to first submenu
        }
      }
    } else {
      console.warn('Parent menu not found:', parentTab);
    }
  };

  const renderDynamicContent = () => {
    if (isFtpActive) return null;

    const menu = menuConfig[selectedIndex];
    if (!menu) return null;

    const subItem = menu.subItems[selectedSub];
    if (!subItem) return null;

    return React.createElement(subItem.content);
  };

  return (
    <div
      className="h-screen w-full grid"
      style={{
        gridTemplateColumns: `${SIDEBAR_WIDTH}px 1fr`,
        gridTemplateRows: `${NAVBAR_HEIGHT}px 1fr`,
        gridTemplateAreas: `
          "sidebar navbar"
          "sidebar main"
        `,
      }}
    >
      <TabSwitchListener onSwitchTab={handleTabSwitch} />

      <aside className="bg-[#1A57A6] z-50" style={{ gridArea: "sidebar" }}>
        <Sidebar
          menuItems={menuConfig}
          selectedIndex={selectedIndex}
          selectedSub={selectedSub}
          setSelectedIndex={handleSetSelectedIndex}
          setSelectedSub={setSelectedSub}
        />
      </aside>

      <header className="bg-white" style={{ gridArea: "navbar" }}>
        <Navbar />
      </header>

      <main
        className="relative bg-white overflow-hidden"
        style={{ gridArea: "main" }}
      >
        {/* FTP LAYER */}
        {ftpIndex !== -1 && (
          <div
            style={{
              display: isFtpActive ? "block" : "none",
              height: "100%",
              width: "100%",
            }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              {menuConfig[ftpIndex].subItems.map((sub, index) => {
                const Component = sub.content;
                return (
                  <div
                    key={sub.label}
                    style={{
                      display: selectedSub === index ? "block" : "none",
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <Component />
                  </div>
                );
              })}
            </Suspense>
          </div>
        )}

        {/* OTHER MENUS */}
        <AnimatePresence mode="wait">
          {!isFtpActive && (
            <motion.div
              key={`${selectedIndex}-${selectedSub}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ height: "100%", width: "100%" }}
            >
              <Suspense fallback={<LoadingSpinner />}>
                {renderDynamicContent()}
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A57A6]"></div>
    </div>
  );
}

export default React.memo(Homelayout);
