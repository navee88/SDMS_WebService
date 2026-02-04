
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";

const AnimatedDropdown = ({
  label,
  name,
  value,
  options = [],
  onChange,
  displayKey = null,
  valueKey = null,
  direction = "down",
  isSearchable = false,
  allowFreeInput = false,
  disabled = false,
  required = false,
  showError = false,
  borderColor,           // ✅ NEW PROP
  type = "text",
  showRedAsterisk = false,  // ADD THIS
  labelClassName = "",        // Allow custom label styling
  inputClassName = "",        // Allow custom input styling
  disabledClassName = "",     // Allow custom disabled styling
  errorClassName = "",        // Allow custom error styling
  focusClassName = "",        // Allow custom focus styling
  isMulti = false,
  keepOpenOnSelect = false,
  handleSpecialNone = false,
  errorOnEmptyOnly = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsRefs = useRef([]);
  // const hasError = required && showError && !value;
  const hasError = errorOnEmptyOnly
    ? (required && showError && !value)  // Original behavior (only when empty)
    : showError;  // New behavior (whenever showError is true)
  //need to change
  const isNoneSelected =
    isMulti &&
    handleSpecialNone &&
    Array.isArray(value) &&
    value.some(v => String(v).toUpperCase() === "NONE");

  //need to change
  // const isSameValue = (val1, val2) => {
  //   // Handles both strict equality and type-coerced equality
  //   return val1 === val2 || String(val1) === String(val2);
  // };
  const isSameValue = (val1, val2) => {
    // String comparison
    if (String(val1) === String(val2)) return true;
    
    // Number comparison
    if (!isNaN(val1) && !isNaN(val2) && Number(val1) === Number(val2)) return true;
    
    return false;
};

  // const getValue = (opt) =>
  //   valueKey && typeof opt === "object" ? opt[valueKey] : opt;

  // const getLabel = (opt) =>
  //   displayKey && typeof opt === "object" ? opt[displayKey] : opt;

  // const getValue = (opt) => {
  //   // Handle {value, label} objects first
  //   if (opt && typeof opt === 'object' && 'value' in opt) {
  //     return String(opt.value || '');
  //   }
  //   // Fallback for other cases
  //   return valueKey && typeof opt === "object" ? String(opt[valueKey] || '') : String(opt || '');
  // };

  const getValue = (opt) => {
    // If opt is null/undefined, return empty string
    if (!opt) return '';

    // If opt is a primitive (string/number), return it as string
    if (typeof opt !== 'object') return String(opt);

    // If opt has a 'value' property
    if ('value' in opt) return String(opt.value);

    // If valueKey is provided and exists on the object
    if (valueKey && valueKey in opt) {
      return String(opt[valueKey]);
    }

    // If displayKey is provided and exists, use it as value
    if (displayKey && displayKey in opt) {
      return String(opt[displayKey]);
    }

    // Fallback: stringify the whole object
    return JSON.stringify(opt);
  };

  const getLabel = (opt) => {
    // Handle {value, label} objects first
    if (opt && typeof opt === 'object' && 'label' in opt) {
      return String(opt.label || '');
    }
    // Fallback for other cases
    return displayKey && typeof opt === "object" ? String(opt[displayKey] || '') : String(opt || '');
  };

  //Need to change
  // const getDisplayValue = () => {
  //   if (!value) return "";
  //   const selected = options.find((opt) => getValue(opt) === value);
  //   return selected ? getLabel(selected) : value;
  // };

  // const getDisplayValue = () => {
  //   if (!value) return "";

  //   if (isMulti && Array.isArray(value)) {
  //     return value
  //       .map(v => {
  //         const opt = options.find(o => isSameValue(getValue(o), v));  // ✅ CHANGE HERE
  //         return opt ? getLabel(opt) : v;
  //       })
  //       .join(", ");
  //   }

  //   const selected = options.find(opt => isSameValue(getValue(opt), value));  // ✅ CHANGE HERE
  //   return selected ? getLabel(selected) : value;
  // };

  //commented recently
  // const getDisplayValue = () => {

  //   if (!value && value !== 0) return ""; // Handle 0 as a valid value

  //   if (isMulti && Array.isArray(value)) {
  //     const displayValues = value
  //       .map(v => {
  //         const opt = options.find(o => {
  //           const optValue = getValue(o);
  //           console.log(`Comparing: v=${v} (${typeof v}) with optValue=${optValue} (${typeof optValue})`);
  //           return String(optValue) === String(v);
  //         });
  //         return opt ? getLabel(opt) : v;
  //       })
  //       .join(", ");
  //     console.log("Multi display value:", displayValues);
  //     return displayValues;
  //   }

  //   // For single select - IMPORTANT FIX HERE
  //   const selected = options.find(opt => {
  //     const optValue = getValue(opt);
  //     const isMatch = String(optValue) === String(value);
  //     console.log(`Single select check: optValue=${optValue}, value=${value}, match=${isMatch}`);
  //     return isMatch;
  //   });

  //   const result = selected ? getLabel(selected) : value;
  //   console.log("Single display value result:", result);
  //   return result;
  // };


  //recently commented 2
  // const getDisplayValue = () => {
  //   if (!value && value !== 0) return "";

  //   if (isMulti && Array.isArray(value)) {
  //     return value
  //       .map(v => {
  //         const opt = options.find(o =>
  //           String(getValue(o)).trim() === String(v).trim()
  //         );
  //         return opt ? getLabel(opt) : v;
  //       })
  //       .join(", ");
  //   }

  //   // FIXED VERSION - with trimming and better logging
  //   const selected = options.find(opt => {
  //     const optValue = String(getValue(opt) || '').trim();
  //     const currentValue = String(value || '').trim();
  //     return optValue === currentValue;
  //   });

  //   return selected ? getLabel(selected) : String(value);
  // };

  const getDisplayValue = () => {
    if (!value && value !== 0) return "";

    if (isMulti && Array.isArray(value)) {
        return value
            .map(v => {
                const opt = options.find(o => {
                    const optValue = getValue(o);
                    // ✅ FIXED: Handle number/string comparison
                    return String(optValue).trim() === String(v).trim() || 
                           Number(optValue) === Number(v);
                });
                return opt ? getLabel(opt) : v;
            })
            .join(", ");
    }

    // FIXED VERSION - Handle both string and number comparison
    const selected = options.find(opt => {
        const optValue = getValue(opt);
        const currentValue = value;
        
        // Try both string and number comparison
        const stringMatch = String(optValue || '').trim() === String(currentValue || '').trim();
        const numberMatch = !isNaN(optValue) && !isNaN(currentValue) && 
                           Number(optValue) === Number(currentValue);
        
        return stringMatch || numberMatch;
    });

    return selected ? getLabel(selected) : String(value);
};

  //need to change
  const visibleOptions = useMemo(() => {
    if (!isMulti || !handleSpecialNone) return options;

    if (!Array.isArray(value) || value.length === 0) {
      return options; // nothing selected → show all
    }

    // If NONE is selected → show ONLY NONE
    if (value.includes("NONE")) {
      return options.filter(
        opt => getValue(opt).toUpperCase() === "NONE"
      );
    }

    // If other values selected → hide NONE
    return options.filter(
      opt => getValue(opt).toUpperCase() !== "NONE"
    );
  }, [options, value, isMulti, handleSpecialNone]);


  //   const filteredOptions = useMemo(() => {
  //     //need to change
  //     // if ((!isSearchable && !allowFreeInput) || !searchTerm) return options;
  //     if ((!isSearchable && !allowFreeInput) || !searchTerm) return visibleOptions;

  // //need to change
  //     // return options.filter((opt) =>
  //     return visibleOptions.filter((opt) =>
  //       getLabel(opt)
  //         .toString()
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase())
  //     );
  //   }, [options, searchTerm, isSearchable, allowFreeInput]);

  const filteredOptions = useMemo(() => {
    if ((!isSearchable && !allowFreeInput) || !searchTerm) return options;

    return options.filter((opt) => {
      const label = getLabel(opt).toString().toLowerCase();

      // ALWAYS keep NONE visible
      if (label === "none") return true;

      return label.includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm, isSearchable, allowFreeInput]);


  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current && !disabled) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isSearchable, disabled]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (focusedIndex >= 0 && optionsRefs.current[focusedIndex]) {
      optionsRefs.current[focusedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);




  //need to change
  // const handleSelect = (opt) => {
  //   if (disabled) return;

  //   onChange({
  //     target: {
  //       name,
  //       value: getValue(opt),
  //     },
  //   });

  //   setIsOpen(false);
  //   setSearchTerm("");
  //   setFocusedIndex(-1);
  // };
  // const handleSelect = (opt) => {
  //   if (disabled) return;

  //   const selectedValue = getValue(opt);

  //   // SINGLE SELECT
  //   if (!isMulti) {
  //     onChange({ target: { name, value: selectedValue } });
  //     setIsOpen(false);
  //     setSearchTerm("");
  //     setFocusedIndex(-1);
  //     return;
  //   }

  //   // MULTI SELECT with NONE logic
  //   let newValues = Array.isArray(value) ? [...value] : [];

  //   if (handleSpecialNone && selectedValue.toUpperCase() === "NONE") {
  //     newValues = newValues.includes("NONE") ? [] : ["NONE"];
  //   } else {
  //     if (handleSpecialNone) {
  //       newValues = newValues.filter(v => v.toUpperCase() !== "NONE");
  //     }

  //     newValues = newValues.includes(selectedValue)
  //       ? newValues.filter(v => v !== selectedValue)
  //       : [...newValues, selectedValue];
  //   }

  //   onChange({ target: { name, value: newValues } });

  //   if (!keepOpenOnSelect) {
  //     setIsOpen(false);
  //     setSearchTerm("");
  //   }
  // };

  const handleSelect = (opt) => {
    if (disabled) return;

    const selectedValue = getValue(opt);

    // SINGLE SELECT
    if (!isMulti) {
      onChange({ target: { name, value: selectedValue } });
      setIsOpen(false);
      setSearchTerm("");
      setFocusedIndex(-1);
      return;
    }

    // MULTI SELECT with NONE logic
    let newValues = Array.isArray(value) ? [...value] : [];

    if (handleSpecialNone && String(selectedValue).toUpperCase() === "NONE") {
      newValues = newValues.some(v => String(v).toUpperCase() === "NONE") ? [] : [selectedValue];
    } else {
      if (handleSpecialNone) {
        newValues = newValues.filter(v => String(v).toUpperCase() !== "NONE");
      }

      newValues = newValues.some(v => isSameValue(v, selectedValue))  // ✅ CHANGE HERE
        ? newValues.filter(v => !isSameValue(v, selectedValue))      // ✅ CHANGE HERE
        : [...newValues, selectedValue];
    }

    onChange({ target: { name, value: newValues } });

    if (!keepOpenOnSelect) {
      setIsOpen(false);
      setSearchTerm("");
    }
  };


  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen && ["Enter", "ArrowDown"].includes(e.key)) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;

      case "Escape":
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  const containerClasses =
    direction === "up" ? "bottom-full mb-1" : "top-full mt-1";

  // Check if arrow should be shown (same as before)
  const showArrow = !allowFreeInput || (allowFreeInput && options.length > 0);

  return (
    <div
      className="relative mb-4"
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}
      </style>


      {label && (
        <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
          {label}
          {showRedAsterisk && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type} // Pass the type prop here (e.g., "password" or "text")
          disabled={disabled}
          readOnly={!allowFreeInput || disabled}
          value={isOpen && allowFreeInput ? searchTerm : getDisplayValue()}
          onFocus={() => {
            if (disabled) return;
            if (allowFreeInput) {
              setIsOpen(true);
              setSearchTerm("");
            }
          }}
          onClick={() => {
            if (disabled) return;
            // Only toggle open if it's NOT free input (standard dropdown behavior)
            // or if it IS free input but we have options to show
            if (!allowFreeInput || (allowFreeInput && options.length > 0)) {
              if (!allowFreeInput) setIsOpen(prev => !prev);
            }
          }}
          onChange={(e) => {
            if (disabled || !allowFreeInput) return;

            const val = e.target.value;
            setSearchTerm(val);
            setIsOpen(true);

            onChange({
              target: { name, value: val },
            });
          }}
          // className={`w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
          //   ${
          //     disabled
          //       ? "border-gray-200 text-gray-400 cursor-not-allowed"
          //       : hasError
          //       ? "border-red-500 text-red-600"
          //       : isOpen
          //       ? "border-blue-500 text-blue-600 cursor-pointer"
          //       : borderColor
          //       ? borderColor
          //       : "border-gray-300 cursor-pointer"
          //   }
          // `}
          className={`
    w-full border-b-2 bg-transparent pb-1 text-[12px] font-semibold outline-none font-['Verdana'] text-[#555]
    ${inputClassName}  // ADD THIS - allows override
    ${disabled
              ? disabledClassName || "border-gray-200 text-gray-400 cursor-not-allowed"  // Use custom or default
              : hasError
                ? errorClassName || "border-red-500 text-red-600"  // Use custom or default
                : isOpen
                  ? focusClassName || "border-blue-500 text-blue-600 cursor-pointer"  // Use custom or default
                  : borderColor
                    ? borderColor
                    : "border-gray-300 cursor-pointer"
            }
  `}
        />

        {showArrow && (
          <ChevronDown
            onClick={() => {
              if (!disabled) setIsOpen((prev) => !prev);
            }}
            className={`
            absolute right-0 top-1 h-4 w-4 transition-transform
            ${disabled
                ? "text-gray-300 cursor-not-allowed"
                : isOpen
                  ? "rotate-180 text-blue-500 cursor-pointer"
                  : "text-gray-400 cursor-pointer"
              }
          `}
          />
        )}
      </div>

      {isOpen && !disabled && options.length > 0 && (
        <div
          className={`
            absolute w-full bg-white shadow-xl rounded-md border
            max-h-52 flex flex-col ${containerClasses} z-50
          `}
        >
          {isSearchable && (
            <div className="border-b bg-slate-50 p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border py-1 pl-8 pr-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div
            className="overflow-y-auto custom-scrollbar flex-grow"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}
          >
            {/* need to change */}
            {/* {filteredOptions.map((opt, i) => {
              const isSelected = getValue(opt) === value;

              return (
                <div
                  key={i}
                  ref={(el) => (optionsRefs.current[i] = el)}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setFocusedIndex(i)}
                  className={`
                    flex cursor-pointer items-center border-l-4 px-3 py-2 text-xs transition-all
                    ${isSelected
                      ? "border-[#0e5bca] bg-blue-50 font-semibold text-[#000] rounded-[4px]"
                      : "border-transparent"
                    }
                    ${i === focusedIndex && !isSelected ? "bg-slate-100" : ""}
                  `}
                >
                  {getLabel(opt)}
                </div>
              );
            })} */}



            {/* {filteredOptions.map((opt, i) => {
  // 🔹 ADD HERE
  const optValue = getValue(opt);
  const isNoneOption = optValue?.toUpperCase() === "NONE";
  const isSelected = isMulti
    ? Array.isArray(value) && value.includes(optValue)
    : value === optValue;

  // 🔹 BLUR RULE
  const shouldBlur = isNoneSelected && !isNoneOption;

  return (
    <div
      key={i}
      ref={(el) => (optionsRefs.current[i] = el)}
      onClick={() => {
        if (!shouldBlur) handleSelect(opt);
      }}
      onMouseEnter={() => setFocusedIndex(i)}
      className={`
        flex items-center px-3 py-2 text-xs transition-all border-l-4
        ${isSelected
          ? "border-[#0e5bca] font-roboto bg-blue-50 font-semibold text-[#000] rounded-l-[4px]"
          : "border-transparent"
        }
        ${i === focusedIndex && !shouldBlur && !isSelected ? "bg-slate-100" : ""}
        ${shouldBlur ? "cursor-not-allowed" : "cursor-pointer"}
      `}
      style={
        shouldBlur
          // ? { filter: "blur(2px)", pointerEvents: "none" }
          ? { opacity: 0.5 }
          : undefined
      }
    >
      {getLabel(opt)}
    </div>
  );
})} */}


            {filteredOptions.map((opt, i) => {
              const optValue = getValue(opt);
              const isNoneOption = String(optValue).toUpperCase() === "NONE";
              // const isSelected = isMulti
              //   ? Array.isArray(value) && value.some(v => isSameValue(v, optValue))  //CHANGE HERE
              //   : isSameValue(value, optValue);  //CHANGE HERE
              const isSelected = isMulti
                ? Array.isArray(value) && value.some(v => String(v) === String(optValue))
                : String(value) === String(optValue);

              console.log(`Option ${i}: value=${optValue}, selected=${isSelected}, currentValue=${value}`);

              // BLUR RULE
              const shouldBlur = isNoneSelected && !isNoneOption;

              return (
                <div
                  key={i}
                  ref={(el) => (optionsRefs.current[i] = el)}
                  onClick={() => {
                    if (!shouldBlur) handleSelect(opt);
                  }}
                  onMouseEnter={() => setFocusedIndex(i)}
                  className={`
                flex items-center px-3 py-2 text-xs transition-all border-l-4
                ${isSelected
                      ? "border-[#0e5bca] font-roboto bg-blue-50 font-semibold text-[#000] rounded-l-[4px]"
                      : "border-transparent"
                    }
                ${i === focusedIndex && !shouldBlur && !isSelected ? "bg-slate-100" : ""}
                ${shouldBlur ? "cursor-not-allowed" : "cursor-pointer"}
            `}
                  style={shouldBlur ? { opacity: 0.5 } : undefined}
                >
                  {getLabel(opt)}
                </div>
              );
            })}


            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-center text-xs text-gray-400">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AnimatedDropdown);