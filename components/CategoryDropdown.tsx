import React, { useState } from "react";
import { categoryOptions } from "../utils/categoryOptions"; // Import category options with icons
import { FaChevronDown } from "react-icons/fa"; // Import Chevron icon for dropdown

// Define the props type for CategoryDropdown
interface CategoryDropdownProps {
  selectedCategory: string;
  handleCategoryChange: (value: string) => void;
  className?: string; // Allow className to be passed
}

// Custom Dropdown Component
const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  selectedCategory,
  handleCategoryChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle dropdown open/close
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle category selection
  const selectCategory = (categoryValue: string) => {
    handleCategoryChange(categoryValue);
    setIsOpen(false);
  };

  const selectedCategoryLabel = categoryOptions.find(
    (category) => category.value === selectedCategory
  )?.label;

  const selectedCategoryIcon = categoryOptions.find(
    (category) => category.value === selectedCategory
  )?.icon;

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown button */}
      <button
        onClick={toggleDropdown}
        className="w-full bg-white border-2 border-gray-400 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-300 flex items-center justify-between"
      >
        <div className="flex items-center">
          {selectedCategoryIcon && (
            <span className="mr-2">
              {React.createElement(selectedCategoryIcon)}
            </span>
          )}
          <span className="text-left">
            {selectedCategoryLabel || "All Categories"}
          </span>
        </div>
        <FaChevronDown className="ml-2" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border-2 border-gray-300 rounded-md shadow-lg">
          <li
            onClick={() => selectCategory("")}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
          >
            <span>All Categories</span>
          </li>
          {categoryOptions.map((category) => (
            <li
              key={category.value}
              onClick={() => selectCategory(category.value)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            >
              <span className="mr-2">{React.createElement(category.icon)}</span>
              <span>{category.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryDropdown;
