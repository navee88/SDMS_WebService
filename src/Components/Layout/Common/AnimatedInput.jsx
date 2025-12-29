import React, { useState, forwardRef } from "react";
import { Ban } from "lucide-react";

const AnimatedInput = forwardRef(({
  label,
  name,
  value = "",
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  showError = false,
  borderColor,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasError = required && showError && !value;

  return (
    <div className="relative mb-4">
      {/* Label – SAME AS AnimatedDropdown */}
      {label && (
        <label className="mb-1 block text-xs font-roboto font-semibold text-gray-600">
          {label}
          {required && <span className="ml-1 text-red-700">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          type={type}
          name={name}
          value={value}
          autoComplete="new-password"
          readOnly={type === "password"}
          onFocus={(e) => {
            if (type === "password") {
              e.target.removeAttribute("readonly");
            }
            setIsFocused(true);
          }}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={() => setIsFocused(false)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onChange={(e) => {
            if (disabled) return;

            onChange({
              target: {
                name,
                value: e.target.value,
              },
            });
          }}
          className={`
            w-full
            bg-transparent
            border-0
            border-b-2
            px-1 py-2
            text-sm font-semibold
            outline-none
            transition-colors
            ${disabled
              ? "bg-[#F7F7F7] border-gray-200 cursor-not-allowed"
              : hasError
                ? "border-[#A94442] text-[#A94442]"
                : isFocused
                  ? "border-[#2883FE] text-[#353F49]"
                  : borderColor
                    ? borderColor
                    : "border-gray-300 text-gray-700"
            }
          `}
        />

        {/* Disabled hover icon */}
        {disabled && isHovered && (
          <Ban className="absolute right-0 top-2 h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
});

export default React.memo(AnimatedInput);
