import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import AnimatedInput from "../Layout/Common/AnimatedInput";
import { CF_sessionGet } from "../Common/CF_session"; 
import { CF_clearAuthData } from "../Common/CF_clearAuthData"; // Ensure you have this
import { useNavigate } from "react-router-dom"; // To handle Logout navigation

const ScreenLockContent = ({ onClose }) => {
  const navigate = useNavigate();
  // Get username from session or default to 'Administrator'
  const username = CF_sessionGet("sUsername", 1) || "Administrator";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);

  // Handle Unlock (Login)
  const handleLogin = (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setShowError(true);
      return;
    }

    // TODO: Add your API call here to verify password
    console.log("Unlocking screen for:", username, "Password:", password);
    
    // On success:
    onClose(); 
  };

  // Handle Logout
  const handleLogout = () => {
    // Clear session/auth data
    if (typeof CF_clearAuthData === 'function') {
        CF_clearAuthData();
    }
    // Close modal and navigate to login page
    onClose();
    navigate("/Login");
  };

  return (
    <div className="w-full">
      <form onSubmit={handleLogin} className="space-y-8 pt-4 pb-2 text-sm w-full">
        
        {/* Username (Read Only) */}
        <div className="w-full">
          <AnimatedInput
            label="Username"
            name="username"
            value={username}
            onChange={() => {}} // No-op
            disabled={true}
            required
          />
        </div>

        {/* Password Field */}
        <div className="w-full relative">
          <AnimatedInput
            label="Password"
            name="password"
            value={password}
            onChange={(e) => {
                setPassword(e.target.value);
                if(showError) setShowError(false);
            }}
            type={showPassword ? "text" : "password"}
            required
            showError={showError}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-7 text-gray-400 hover:text-gray-600 z-10"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Error Message */}
        {showError && (
            <div className="text-red-500 text-xs font-semibold px-1">
                Password is required to unlock.
            </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 mt-8">
          <button
            type="submit"
            className="btn-actionprimary transition-all hover:scale-95 hover:rounded-md flex items-center justify-center px-6 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded shadow-sm font-bold min-w-[100px]"
          >
            Login
          </button>
          
          <button
            type="button"
            onClick={handleLogout}
            className="btn-actionsecondary transition-all hover:scale-95 hover:rounded-md flex items-center justify-center px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded shadow-sm font-bold min-w-[100px]"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScreenLockContent;
