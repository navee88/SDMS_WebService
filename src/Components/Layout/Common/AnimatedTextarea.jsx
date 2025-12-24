import React, { useState } from "react";

const AnimatedTextarea = ({
  label,
  name,
  value = "",
  onChange,
  rows = 3,
  placeholder = "",
  required = false,
  disabled = false,
  showError = false,
  borderColor,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = required && showError && !value.trim();

  return (
    <div className="relative mb-4">
      {label && (
        <label className="mb-1 block text-xs font-roboto font-semibold text-gray-600">
          {label}
          {required && <span className="ml-1 text-red-700">*</span>}
        </label>
      )}

      <textarea
        name={name}
        rows={rows}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
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
          resize-none
          bg-transparent
          border-0
          border-b-2
          px-1 py-2
          text-sm font-semibold
          outline-none
          transition-colors
          ${disabled
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : hasError
              ? "border-[#A94442] text-[#A94442]"
              : isFocused
                ? "border-[#66AFE9] text-[#353F49]"
                : borderColor
                  ? borderColor
                  : "border-gray-300"
          }
        `}
      />
    </div>
  );
};

export default React.memo(AnimatedTextarea);
