import React, { lazy, Suspense, useCallback, useMemo, useState, useEffect, useTransition } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Errordialog from "./Components/Layout/Common/Errordialog";
import ProtectedRoute from "./Components/Common/ProtectedRoute";
import Loginlayout from "./Components/Layout/Login/Loginlayout";
import { LanguageProvider } from "./Context/LanguageContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LogFiltersProvider } from "./Context/LogFiltersContext"; //Added by Kirubhakaran on 13-01-2026
import { SchedulerNavigationProvider } from "./Context/SchedulerNavigationContext";
const Home = lazy(() => import('./Pages/Home/Home'));


const PageWrapper = React.memo(({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -25 }}
    transition={{ duration: 0.35, ease: "easeInOut" }}
    className="min-h-screen w-full"
  >
    {children}
  </motion.div>
));

function AnimatedRouteWrapper({ element }) {
  return <PageWrapper>{element}</PageWrapper>;
}


function useHomeTransition() {
  const actualLocation = useLocation();
  const [displayLocation, setDisplayLocation] = useState(actualLocation);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (actualLocation.pathname === '/Home' || displayLocation.pathname === '/Home') {
      startTransition(() => {
        setDisplayLocation(actualLocation);
      });
    } else {
      setDisplayLocation(actualLocation);
    }
  }, [actualLocation]);

  return { location: displayLocation, isPending };
}

function AnimatedRoutes() {
  const { location, isPending } = useHomeTransition();
  
  const loadingFallback = useMemo(
    () => (
      <div className="flex items-center justify-center py-10">
        {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span> */}
      </div>
    ),
    []
  );

  return (
    <>

      {isPending && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse z-50" />
        // <div></div>
      )}
      
      <div 
        style={{
          opacity: isPending ? 0.6 : 1,
          transition: 'opacity 0.3s ease-in-out',
          pointerEvents: isPending ? 'none' : 'auto'
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/Login" element={<AnimatedRouteWrapper element={<Loginlayout />} />} />
            
            <Route
              path="/errordialog"
              element={<AnimatedRouteWrapper element={<Errordialog />} />}
            />
            
            <Route
              path="/Home"
              element={
                <Suspense fallback={loadingFallback}>
                  <ProtectedRoute>
                    <AnimatedRouteWrapper element={<Home />} />
                  </ProtectedRoute>
                </Suspense>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
      retry: 1, 
    },
  },
});

function App() {
  if (window.location.pathname === "/LogilabSDMS" || window.location.pathname === "/LogilabSDMS/") {
    window.location.replace("/LogilabSDMS/Login");
  }

  return (
    <>
    <QueryClientProvider client={queryClient}> 
      <LanguageProvider>
        <LogFiltersProvider>  {/*Added by Kirubhakaran on 13-01-2026 */}
          <SchedulerNavigationProvider> {/*Added by Kirubhakaran on 24-01-2026 */}
        <Router basename="/LogilabSDMS">
          <AnimatedRoutes />
        </Router>
        </SchedulerNavigationProvider> {/*Added by Kirubhakaran on 24-01-2026 */}
        </LogFiltersProvider> {/*Added by Kirubhakaran on 13-01-2026 */}
      </LanguageProvider>
     </QueryClientProvider>
    </>
  );
}

export default App;
