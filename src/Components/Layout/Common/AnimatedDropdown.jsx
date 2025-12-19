
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
  borderColor
})=> {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
 
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsRefs = useRef([]);
  const hasError = required && showError && !value;
 
  const getValue = (opt) =>
    valueKey && typeof opt === "object" ? opt[valueKey] : opt;
 
  const getLabel = (opt) =>
    displayKey && typeof opt === "object" ? opt[displayKey] : opt;
 
  const getDisplayValue = () => {
    if (!value) return "";
    const selected = options.find(opt => getValue(opt) === value);
    return selected ? getLabel(selected) : value;
  };
 
  const filteredOptions = useMemo(() => {
    if ((!isSearchable && !allowFreeInput) || !searchTerm) return options;
 
    return options.filter(opt =>
      getLabel(opt)
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, isSearchable, allowFreeInput]);
 
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current && !disabled) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isSearchable, disabled]);
 
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  useEffect(() => {
    if (focusedIndex >= 0 && optionsRefs.current[focusedIndex]) {
      optionsRefs.current[focusedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [focusedIndex]);
 
  const handleSelect = (opt) => {
    if (disabled) return;
 
    onChange({
      target: {
        name,
        value: getValue(opt)
      }
    });
 
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
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
        setFocusedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
 
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev =>
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
 
  return (
    <div
      className="relative mb-4"
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-600">
          {label}
        </label>
      )}
 
      <div className="relative">
        <input
          type="text"
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
            if (!allowFreeInput) {
              setIsOpen(prev => !prev);
            }
          }}
          onChange={(e) => {
            if (disabled || !allowFreeInput) return;
 
            const val = e.target.value;
            setSearchTerm(val);
            setIsOpen(true);
 
            onChange({
              target: { name, value: val }
            });
          }}
          className={`
            w-full border-b-2 bg-transparent pb-1 text-sm font-semibold outline-none
            ${
              disabled
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : hasError
                  ? "border-red-500 text-red-600"
                  : isOpen
                  ? "border-blue-500 text-blue-600 cursor-pointer"
                  : borderColor
                    ? borderColor                   
                    : "border-gray-300 cursor-pointer"
            }
          `}
        />
 
        <ChevronDown
          onClick={() => {
            if (!disabled) setIsOpen(prev => !prev);
          }}
          className={`
            absolute right-0 top-1 h-4 w-4 transition-transform
            ${
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : isOpen
                  ? "rotate-180 text-blue-500 cursor-pointer"
                  : "text-gray-400 cursor-pointer"
            }
          `}
        />
      </div>
 
      {isOpen && !disabled && (
        <div
          className={`
            absolute z-50 w-full bg-white shadow-xl rounded-md border
            max-h-52 flex flex-col ${containerClasses}
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
 
          <div className="overflow-y-auto">
            {filteredOptions.map((opt, i) => {
              const isSelected = getValue(opt) === value;
 
              return (
                <div
                  key={i}
                  ref={(el) => (optionsRefs.current[i] = el)}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setFocusedIndex(i)}
                  className={`
                    flex cursor-pointer items-center border-l-4 px-3 py-2 text-sm transition-all
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 font-semibold text-blue-600"
                        : "border-transparent"
                    }
                    ${i === focusedIndex && !isSelected ? "bg-slate-100" : ""}
                  `}
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
 