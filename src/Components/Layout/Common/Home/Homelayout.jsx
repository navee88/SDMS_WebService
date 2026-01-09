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

import React, { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { menuConfig } from "./MenuConfig";
import Sidebar from "../../../Sidebar/Sidebar";
import Navbar from "../../../Navbar/Navbar";

const FTP_LABEL = "FTP Data View";

function Homelayout() {
  const SIDEBAR_WIDTH = 62;
  const NAVBAR_HEIGHT = 60;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSub, setSelectedSub] = useState(0);

  const ftpIndex = useMemo(
    () => menuConfig.findIndex(item => item.label === FTP_LABEL),
    []
  );

  const isFtpActive = selectedIndex === ftpIndex;

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
      <aside className="bg-[#1A57A6] z-50" style={{ gridArea: "sidebar" }}>
        <Sidebar
          menuItems={menuConfig}
          selectedIndex={selectedIndex}
          selectedSub={selectedSub}
          setSelectedIndex={setSelectedIndex}
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
        {/* FTP LAYER (Data Explorer loads immediately) */}
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

        {/* OTHER MENUS - Lazy loaded */}
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

// Loading fallback component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A57A6]"></div>
    </div>
  );
}

export default React.memo(Homelayout);


