import React, { useState, useEffect, useRef } from "react";
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
import Activeuser from "../../Services/activeUserdetails"

function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const dropdownRef = useRef(null);

  const userdetails = Activeuser();

  console.log("User Details from the session: ", userdetails);

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

  return (
    <div className="flex items-center justify-between p-3 bg-white ps-8 border-b-1 border-black">
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
              <IoChevronUpCircleOutline
                size={20}
                className="text-gray-500"
              />
            ) : (
              <IoChevronDownCircleOutline
                size={20}
                className="text-gray-500"
              />
            )}
          </div>

          {open && (
            <div className="absolute -right-2 mt-2 w-48 bg-white border rounded-[5px] shadow-md pt-1 z-50 font-[500]">
              <div className="absolute -top-1.5 right-3.5 w-2.5 h-2.5 bg-white border-t border-l rotate-45"></div>

              <button className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95">
                Edit Profile
                <FaUserEdit className="text-blue-500/80 w-5 h-5" />
              </button>

              <button className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95">
                Change Password
                <FaKey className="text-blue-500/80 w-5 h-5" />
              </button>

              <button className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95">
                Screen Lock
                <FaLock className="text-blue-500/80 w-5 h-5" />
              </button>

              <button className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95">
                Help
                <IoHelp className="text-blue-500/80 w-5 h-5" />
              </button>

              <a
                href="http://localhost:9090/LogilabSDMS/Swagger-Ui.html"
                target="__blank"
                rel="noreferrer"
              >
                <button className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95">
                  API Docs
                  <FaRocket className="text-blue-500/80 w-5 h-5" />
                </button>
              </a>

              <button className="flex items-center justify-between w-full text-left px-2 py-2 border-b hover:bg-gray-100 hover:scale-95">
                About
                <FcAbout className="text-blue-500/80 w-5 h-5" />
              </button>

              <button className="flex items-center justify-between w-full text-left px-2 py-2 hover:text-red-600 hover:bg-gray-100 hover:scale-95">
                Logout
                <IoIosLogOut className="text-blue-500/80 w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Navbar);
