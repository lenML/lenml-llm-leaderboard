import React, { useState, useRef, useEffect } from "react";

interface MenuItem {
  label: string;
  value: string;
  onClick?: () => void;
}

interface DropdownProps {
  items: MenuItem[];
  label: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  label,
  defaultValue,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize the default value
  useEffect(() => {
    if (defaultValue) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (item: MenuItem) => {
    setSelectedValue(item.value);
    setIsOpen(false);
    onChange?.(item.value);
    item.onClick?.(); // Invoke item's custom `onClick` if provided
  };

  const selectedItem = items.find((item) => item.value === selectedValue);

  return (
    <div
      className="relative inline-block text-left font-thin"
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-4 bg-gray-800 text-white hover:bg-gray-700 focus:outline-none"
      >
        {selectedItem ? selectedItem.label : label}
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 origin-top-right bg-black shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  item.value === selectedValue
                    ? "bg-gray-700 text-white"
                    : "text-gray-100 hover:bg-gray-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
