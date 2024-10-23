import React, { useState, useEffect } from "react";
import { useAuth } from "../app/components/AuthProvider";
import { getExpenses, Expense, deleteExpense } from "../utils/firebaseCrud";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import {
  FaChevronDown,
  FaPlus,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import { categoryOptions } from "../utils/categoryOptions";
import { IconType } from "react-icons";
import Select from "react-select";

// Utility functions to group expenses and calculate totals
const groupExpensesByDate = (
  expenses: Expense[]
): Record<string, Expense[]> => {
  return expenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
};

const calculateTotalSpent = (expenses: Expense[]): number => {
  return expenses.reduce(
    (total, expense) => total + parseFloat(expense.amount.toString()),
    0
  );
};

// Utility function to format amount
const formatAmount = (amount: number): string => {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Updated generateMonthOptions function
const generateMonthOptions = () => {
  const options = [];
  const currentDate = new Date(); // No adjustment

  const currentMonth = currentDate.getMonth(); // 0-11
  const currentYear = currentDate.getFullYear();

  // Generate options for the current month and next 3 months
  for (let i = 0; i < 4; i++) {
    const date = new Date(currentYear, currentMonth + i, 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const value = `${year}-${month}`;

    const label = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    options.push({ value, label });
  }

  return options;
};

const MyExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Set the default selected month to the current month
  useEffect(() => {
    const currentDate = new Date();
    const defaultMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
    console.log("Setting initial selected month:", defaultMonth);
    setSelectedMonth(defaultMonth);
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        if (user?.uid) {
          const userExpenses = await getExpenses(user.uid);
          const filteredExpenses = userExpenses.filter((expense) => {
            const expenseDate = new Date(expense.date);
            const expenseMonth = `${expenseDate.getFullYear()}-${String(
              expenseDate.getMonth() + 1
            ).padStart(2, "0")}`;
            return expenseMonth === selectedMonth;
          });

          // Sort expenses by date in descending order
          filteredExpenses.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setExpenses(filteredExpenses);

          // Extract unique categories from filtered expenses
          const categories = Array.from(
            new Set(filteredExpenses.map((expense) => expense.category))
          );
          setAvailableCategories(categories);
        } else {
          console.error("User is not logged in");
          setExpenses([]);
        }
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [selectedMonth, user]);

  const toggleExpand = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleEdit = (expense: Expense) => {
    const queryParams = new URLSearchParams({
      id: expense.id || "",
      date: expense.date,
      amount: expense.amount.toString(),
      expenseType: expense.expenseType,
      category: expense.category,
      description: expense.description || "",
      transactionType: expense.transactionType,
    }).toString();

    const editUrl = `/add-expense?${queryParams}`;
    router.push(editUrl);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        setExpenses(expenses.filter((expense) => expense.id !== id));
      } catch (error) {
        console.error("Failed to delete expense:", error);
      }
    }
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    // Reset selectedMonth to the current month
    const currentDate = new Date();
    const defaultMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
    setSelectedMonth(defaultMonth);
  };

  const handleAddExpense = () => {
    router.push("/add-expense");
  };

  const getCategoryIcon = (categoryValue: string): IconType | undefined => {
    const category = categoryOptions.find(
      (option) => option.value === categoryValue
    );
    return category ? category.icon : undefined;
  };

  const categorySelectOptions = [
    { value: "", label: "All Categories", icon: null },
    ...availableCategories.map((category) => ({
      value: category,
      label: category,
      icon: getCategoryIcon(category),
    })),
  ];

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      </>
    );
  }

  // Apply filters to expenses
  const filteredExpenses = expenses.filter((expense) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm =
      expense.description.toLowerCase().includes(searchTermLower) ||
      expense.category.toLowerCase().includes(searchTermLower);
    const matchesCategory =
      selectedCategory === "" || expense.category === selectedCategory;
    return matchesSearchTerm && matchesCategory;
  });

  // Group filtered expenses by date
  const groupedExpenses = groupExpensesByDate(filteredExpenses);

  const monthOptions = generateMonthOptions();
  const formatDateWithOrdinal = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const weekday = date.toLocaleString("default", { weekday: "short" });

    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinal(day)} ${month} ${year} (${weekday})`;
  };

  const calculateTotalMonthlyExpenses = (expenses: Expense[]): number => {
    return expenses.reduce(
      (total, expense) => total + parseFloat(expense.amount.toString()),
      0
    );
  };

  function getLuminance(hex: string) {
    const rgb = hexToRgb(hex);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance;
  }

  function hexToRgb(hex: string) {
    // Check if hex is a valid string and has a proper hex format
    if (!hex || typeof hex !== "string" || hex[0] !== "#") {
      console.error("Invalid hex color code:", hex);
      return { r: 0, g: 0, b: 0 }; // Return default black color or handle this case as needed
    }

    // Remove the hash if it's present
    hex = hex.replace(/^#/, "");

    // Parse the r, g, b values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
  }

  function getTextColorBasedOnBg(hex: string) {
    const luminance = getLuminance(hex);
    return luminance > 0.5 ? "#000000" : "#ffffff"; // If luminance is high (light background), return dark text, otherwise white text
  }
  const categoryColors: Record<string, string> = {
    "Rent/Home Loan EMI": "#b3d9ff", // Light blue
    "Property Maintenance": "#b3ffcc", // Light green
    "Property Tax": "#ffffb3", // Light yellow
    "Dairy Products": "#ffe680", // Light yellow-orange
    "Cooking Oil & Spices": "#ffcc99", // Light orange
    "Clothing & Footwear": "#99ff99", // Light green
    "Puja Materials": "#ffb3b3", // Light pink
    "Gifts for Relatives": "#ffccff", // Light purple
    "Temple Offerings": "#ffd9b3", // Light peach
    "Festive Clothing": "#ffb3e6", // Light magenta
    "Fixed Deposits (FD)": "#cce6ff", // Light cyan
    "Recurring Deposits (RD)": "#cce6ff", // Light cyan (similar to FD)
    "Mutual Funds": "#b3e6cc", // Light teal
    "Gold Savings": "#ffd700", // Gold
    Donations: "#ffc2c2", // Light salmon
    "Electricity Bill": "#ffff99", // Pale yellow
    "Water Bill": "#b3e0ff", // Pale sky blue
    Groceries: "#ff9999", // Light red
    "Vegetables & Fruits": "#c2f0c2", // Pale green
    "Snacks & Beverages": "#ffcc66", // Soft orange
    "Internet & Cable TV": "#e6b3cc", // Light mauve
    "Mobile Phone Bills": "#ff9999", // Light coral
    "Gas Cylinder": "#ff9966", // Light reddish-orange
    "School Fees": "#ffebcc", // Pale cream
    "Tuition Classes": "#e6b3ff", // Light lavender
    "Stationery & Books": "#ffb3ff", // Light pink-purple
    Fuel: "#b3b3ff", // Pale lavender blue
    "Public Transport": "#ccffcc", // Pale mint green
    "Vehicle Maintenance": "#ccccff", // Light periwinkle
    "Parking Fees": "#d9d9d9", // Light grey
    "Doctor Visits": "#ffcccc", // Light pinkish-red
    Medicines: "#ffb3cc", // Light soft pink
    "Health Insurance": "#b3ffff", // Pale cyan
    "Emergency Medical": "#ff9966", // Soft orange
    Toiletries: "#ffe6e6", // Soft pink
    "Salon Services": "#ffccff", // Light pastel purple
    Cosmetics: "#ffd1dc", // Light blush pink
    "Movie Outings": "#ff9999", // Light red
    "Family Outings": "#ffc299", // Light orange-tan
    Subscriptions: "#b3b3ff", // Pale blue-lavender
    "Dining Out": "#ffb84d", // Soft amber
    "Loan Repayments": "#d9b3ff", // Light lavender
    "Unexpected Repairs": "#ffcc99", // Light orange
    "Emergency Fund": "#ff9999", // Light coral
    "Household Items": "#ffebcc", // Pale cream
    "Pet Care": "#ffcc99", // Light orange
    "Home Renovations": "#ffb84d", // Soft amber
    "Personal Loans": "#ffb3ff", // Light pink-purple
    "Credit Card Payments": "#ff6666", // Soft red
    "Vacation Expenses": "#99ccff", // Light sky blue
    "Childcare Expenses": "#ffd966", // Pale yellow-orange
    "Gym Membership": "#e6b3cc", // Light mauve
    "Insurance Premiums": "#b3e6cc", // Light mint green
    "Laundry Services": "#ffcccc", // Light pink
    "Online Shopping": "#ffb3b3", // Light salmon
    "Fitness Equipment": "#b3e6ff", // Light sky blue
    "Home Appliances": "#ffcc99", // Light orange
    Gardening: "#99e699", // Light lime green
    "Charity Contributions": "#ffcc99", // Soft amber
    Others: "#cccccc", // Light grey
    Mahesh: "#ff99cc", // Light pink
    Food: "#ff9966", // Light reddish-orange
  };

  // Get unique categories for the category filter

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-primary text-center mb-8">
          My Expenses.
        </h1>

        <div className="bg-white shadow-lg rounded-xl p-6 max-w-4xl mx-auto border-2 border-primary">
          {/* Filters and Add Expense Button */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Search Input */}
              <div className="relative w-full sm:w-2/5">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by description or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition duration-300"
                />
              </div>

              {/* Category Dropdown */}
              <Select
                value={categorySelectOptions.find(
                  (option) => option.value === selectedCategory
                )}
                onChange={(selectedOption) =>
                  handleCategoryChange(selectedOption?.value || "")
                }
                options={categorySelectOptions}
                className="w-full sm:w-1/3"
                classNamePrefix="select"
                formatOptionLabel={({ label, icon }) => (
                  <div className="flex items-center">
                    {icon && React.createElement(icon, { className: "mr-2" })}
                    <span>{label}</span>
                  </div>
                )}
              />

              {/* Month Selection */}
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full sm:w-1/4 bg-white border-2 border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-300"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleClearFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Clear Filters
              </button>
              <button
                onClick={handleAddExpense}
                className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              >
                <FaPlus className="mr-2" /> Add Expense
              </button>
            </div>
          </div>

          {/* Total Monthly Expenses */}
          <div className="bg-green-50 rounded-lg p-6 mb-6 text-center border-2 border-primary shadow-md">
            <h2 className="text-xl font-semibold text-primary mb-2">
              Total Monthly Expenses
            </h2>
            <p className="text-3xl font-bold text-primary">
              ₹{formatAmount(calculateTotalMonthlyExpenses(expenses))}
            </p>
          </div>

          {/* Expenses List */}
          <div className="space-y-4">
            {Object.entries(groupedExpenses).length > 0 ? (
              Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
                <div
                  key={date}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <button
                    className={`w-full px-5 py-3 flex justify-between items-center cursor-pointer transition-all duration-300 ${
                      expandedDate === date
                        ? "bg-green-600 text-white"
                        : "bg-[#21674e] text-white hover:bg-green-700"
                    }`}
                    onClick={() => toggleExpand(date)}
                  >
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-xl text-white" />{" "}
                      {/* Smaller calendar icon */}
                      <span className="text-base font-medium">
                        {" "}
                        {/* Reduced text size */}
                        {formatDateWithOrdinal(date)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-base px-3 py-1 rounded-full bg-white text-green-800">
                        ₹{formatAmount(calculateTotalSpent(dateExpenses))}
                      </span>
                      <div
                        className={`transform transition-transform duration-300 ${
                          expandedDate === date ? "rotate-180" : ""
                        }`}
                      >
                        <FaChevronDown className="text-xl text-white" />
                      </div>
                    </div>
                  </button>

                  <div
                    className={`bg-white overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedDate === date
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {dateExpenses.map((expense, index) => (
                      <div
                        key={expense.id}
                        className={`px-5 py-3 hover:bg-gray-50 transition-all duration-300 ${
                          index !== dateExpenses.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-shrink-0 w-1/4">
                            <div className="font-semibold text-gray-800 text-lg sm:text-xl flex items-center">
                              <span className="text-base mr-1 text-gray-600">
                                ₹
                              </span>
                              <span>
                                {formatAmount(
                                  parseFloat(expense.amount.toString())
                                )}
                              </span>
                            </div>
                            {expense.description && (
                              <div className="text-sm text-gray-500 mt-1 truncate">
                                {expense.description}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow flex justify-end items-center space-x-4">
                            <div
                              className="text-sm font-medium px-3 py-1 rounded-full border flex items-center space-x-2 transition-all duration-300 hover:shadow-md"
                              style={{
                                backgroundColor:
                                  categoryColors[expense.category],
                                color: getTextColorBasedOnBg(
                                  categoryColors[expense.category]
                                ),
                              }}
                            >
                              {getCategoryIcon(expense.category) && (
                                <span>
                                  {React.createElement(
                                    getCategoryIcon(
                                      expense.category
                                    ) as IconType,
                                    { className: "text-sm" }
                                  )}
                                </span>
                              )}
                              <span>{expense.category}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(expense)}
                                className="text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-100 transition duration-300 transform hover:scale-105"
                                aria-label="Edit expense"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(expense.id)}
                                className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition duration-300 transform hover:scale-105"
                                aria-label="Delete expense"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No expenses found for the selected filters.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyExpensesPage;
