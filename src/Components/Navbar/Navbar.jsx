import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IoChevronUpCircleOutline,
  IoChevronDownCircleOutline,
} from "react-icons/io5";
import { FaUserEdit, FaLock, FaKey } from "react-icons/fa";
import { FcAbout } from "react-icons/fc";
import { IoIosLogOut } from "react-icons/io";
import { IoHelp } from "react-icons/io5";
import { FaRocket } from "react-icons/fa6";
import { CF_sessionGet } from "../Common/CF_session";
import { useTranslation } from "react-i18next";
import SDMS_Logo from "../../Assests/SDMS_Logo.webp";
import Activeuser from "../../Services/activeUserdetails";
import { useNavigate } from "react-router-dom";
import Errordialog from "../Layout/Common/Errordialog";
import { CF_clearAuthData } from "../Common/CF_clearAuthData";
import PopupModal from "../Home/SubFolders/FTPDataView/DataExplorer/PopupModal";


// Import the new component
import EditProfileContent from "./Profile"; 
import ChangePassword from "./ChangePassword";
import ScreenLockContent from "./ScreenLock";
import AboutContent from "./About";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const userdetails = Activeuser();

  // 1. UPDATED: Add animation fields to state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    title: "",
    enableAnimation: true, // Default
    animationDuration: "0.4s" // Default
  });

  const [formData, setFormData] = useState({
    sUsername: "",
    sSitename: "",
    sDomainname: "",
    sZonename: "",
    sGroupname: "",
  });

  const getSessionValues = () => {
    return {
      username: CF_sessionGet("sUsername", 1) || "",
      sitename: CF_sessionGet("sSiteName", 1) || "",
      domainname: CF_sessionGet("sDomainName", 1) || "",
      zonename: CF_sessionGet("sTimeZoneValue", 1) || "",
      groupname: CF_sessionGet("sUserGroupName", 1) || "",
    };
  };

  useEffect(() => {
    const { username, sitename, domainname, zonename, groupname } =
      getSessionValues();
    setFormData({
      sUsername: username,
      sSitename: sitename,
      sDomainname: domainname,
      sZonename: zonename,
      sGroupname: groupname,
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [dialogData, setDialogData] = useState({
    open: false,
    message: "",
    type: "",
    showCancel: false,
    reverseButtons: false,
  });

  const showDialog = useCallback(
    (message, type = "error", showCancel = false, reverseButtons = false) => {
      setDialogData({ open: true, message, type, showCancel, reverseButtons });
    },
    []
  );

  const handleDialogClose = useCallback(() => {
    setDialogData((prev) => ({ ...prev, open: false }));
  }, []);

  const handleDialogConfirm = useCallback(() => {
    if (dialogData.type === "confirmationlogout") {
      CF_clearAuthData();
      navigate("/Login");
    }
    handleDialogClose();
  }, [dialogData.type, navigate, handleDialogClose]);

  const logout = () => {
    setOpen(false);
    showDialog(
      "Are you sure you want to Logout?",
      "confirmationlogout",
      true,
      false
    );
  };

  const handleCloseDropdown = () => {
    setOpen(false);
  };

  // --- Handlers for Modal Opening ---

  // 2. UPDATED: Pass specific animation settings here
  const handleEditProfile = () => {
    setOpen(false); 
    setModalState({
      isOpen: true,
      type: "editProfile",
      title: "Edit Profile",
      enableAnimation: true,    // Enable animation for this one
      animationDuration: "0.5s" // Slower speed for profile
    });
  };

  // Example: Change Password might want to be instant (no animation)
  const handleChangePassword = () => {
    setOpen(false);
    setModalState({
      isOpen: true,
      type: "changePassword",
      title: "Change Password",
      enableAnimation: true,   // No animation here
      animationDuration: "0.5s"
    });
  };

  const handleScreenLock = () => {
  setOpen(false);
  setModalState({
    isOpen: true,
    type: "screenLock",
    title: "Screen Lock",
    enableAnimation: true,
    animationDuration: "0.3s"
  });
};

 const handleAbout = () => {
    setOpen(false);
    setModalState({
      isOpen: true,
      type: "about",
      title: "About Logilab SDMS", 
      enableAnimation: true,
      animationDuration: "0.3s",
      width: "600px"
    });
  };

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false, type: null }));
  };

   const updateModalWidth = (newWidth) => {
    setModalState((prev) => ({ ...prev, width: newWidth }));
  };

  const updateModalTitle = (newTitle) => {
    setModalState((prev) => ({ ...prev, title: newTitle }));
  };


  // --- Render Modal Content based on type ---
  const renderModalContent = () => {
    switch (modalState.type) {
      case "editProfile":
        return <EditProfileContent onClose={handleCloseModal} />;
      case "changePassword":
        return <ChangePassword onClose={handleCloseModal} />;
      case "screenLock":
        return <ScreenLockContent onClose={handleCloseModal} />;
      case "about":
        return (
            <AboutContent 
                onClose={handleCloseModal} 
                updateTitle={updateModalTitle}
                updateWidth={updateModalWidth}
            />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-white ps-8 border-b-1 border-black">
        {/* Logo Section */}
        <div className="flex items-center">
          <img
            src={SDMS_Logo}
            alt="SDMS_Logo"
            className="w-[100px] h-auto text-sm inline-block"
          />
          <p className="text-[10px] mt-[-10px] text-gray-500 ms-[5px] font-bold">
            v7.2_20250520_01
          </p>
        </div>

        {/* Info Section */}
        <div className="flex items-center ms-8 text-[12px]">
          <div className="flex gap-2 items-center me-4">
            <div>
              <label className="text-blue-900/80 font-semibold">
                {t("login.timezone")} :{" "}
              </label>
              <span className="font-semibold">
                {formData.sZonename || "N/A"}
              </span>
            </div>
            <div>
              <label className="text-blue-900/80 font-semibold">Domain: </label>
              <span className="font-semibold">
                {formData.sDomainname || "N/A"}
              </span>
            </div>
            <div>
              <label className="text-blue-900/80 font-semibold">Site: </label>
              <span className="font-semibold">
                {formData.sSitename || "Unknown"}
              </span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-gray-300"></div>

          {/* User Dropdown */}
          <div className="relative ms-4" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <div className="flex flex-col leading-tight select-none">
                <label className="font-semibold text-black">
                  <span className="font-semibold">
                    {formData.sUsername || "User"}
                  </span>
                </label>
                <span className="font-semibold text-gray-500 text-[11px]">
                  <span className="font-bold">
                    {formData.sGroupname || "User"}
                  </span>
                </span>
              </div>

              {open ? (
                <IoChevronUpCircleOutline size={20} className="text-gray-500" />
              ) : (
                <IoChevronDownCircleOutline size={20} className="text-gray-500" />
              )}
            </div>

            {open && (
              <div className="absolute -right-2 mt-2 w-48 bg-white border rounded-[5px] shadow-md pt-1 z-50 font-[500]">
                <div className="absolute -top-1.5 right-3.5 w-2.5 h-2.5 bg-white border-t border-l rotate-45"></div>

                <button
                  onClick={handleEditProfile}
                  className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95 hover:rounded-[10px]"
                >
                  Edit Profile
                  <FaUserEdit className="text-blue-500/80 w-5 h-5" />
                </button>

                <button
                  onClick={handleChangePassword} 
                  className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95 hover:rounded-[10px]"
                >
                  Change Password
                  <FaKey className="text-blue-500/80 w-5 h-5" />
                </button>

                <button
                   onClick={handleScreenLock}
                  className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95 hover:rounded-[10px]"
                >
                  Screen Lock
                  <FaLock className="text-blue-500/80 w-5 h-5" />
                </button>

                <button
                  onClick={handleCloseDropdown}
                  className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95 hover:rounded-[10px]"
                >
                  Help
                  <IoHelp className="text-blue-500/80 w-5 h-5" />
                </button>

                <a
                  href="http://localhost:9090/LogilabSDMS/Swagger-Ui.html"
                  target="__blank"
                  rel="noreferrer"
                  onClick={handleCloseDropdown}
                >
                  <button className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95 hover:rounded-[10px]">
                    API Docs
                    <FaRocket className="text-blue-500/80 w-5 h-5" />
                  </button>
                </a>

                <button
                  onClick={handleAbout}
                  className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95 hover:rounded-[10px]"
                >
                  About
                  <FcAbout className="text-blue-500/80 w-5 h-5" />
                </button>

                <button
                  onClick={logout}
                  className="flex items-center justify-between w-full text-left px-2 py-2 hover:text-red-600 hover:bg-gray-100 hover:scale-95 hover:rounded-[10px]"
                >
                  Logout
                  <IoIosLogOut className="text-blue-500/80 w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {dialogData.open && (
        <Errordialog
          message={dialogData.message}
          type={dialogData.type}
          onClose={handleDialogClose}
          showCancel={dialogData.showCancel}
          onCancel={handleDialogClose}
          onConfirm={handleDialogConfirm}
          reverseButtons={dialogData.reverseButtons}
        />
      )}

      {/* 3. UPDATED: Pass dynamic values from state */}
      {modalState.isOpen && (
        <PopupModal
          isOpen={modalState.isOpen}
           onClose={modalState.type === "screenLock" ? () => {} : handleCloseModal}
          title={modalState.title}
          content={renderModalContent()}
          showCloseButton={modalState.type !== "screenLock"}
          enableAnimation={modalState.enableAnimation}
          animationDuration={modalState.animationDuration}
          width={modalState.width || '500px'}
        />
      )}
    </>
  );
}

export default React.memo(Navbar);
