"use client";
import React, { useState, useEffect, useRef } from "react";
import { addExpense, updateExpense } from "../utils/firebaseCrud";
import { useAuth } from "../app/components/AuthProvider";
import dynamic from "next/dynamic";
import { useRouter, ReadonlyURLSearchParams } from "next/navigation";
import {
  FaCalendarAlt,
  FaDollarSign,
  FaTags,
  FaFileAlt,
  FaExchangeAlt,
  FaList,
} from "react-icons/fa";
import Select, { StylesConfig } from "react-select";
import { categoryOptions } from "../utils/categoryOptions";
import Navbar from "../components/Navbar";
import { IconType } from "react-icons";
import { NumericFormat } from "react-number-format";

// Update the Expense type
type Expense = {
  id?: string;
  date: string;
  amount: string;
  expenseType: string;
  category: string;
  description: string;
  transactionType: string;
  userId: string;
};

interface AddExpenseFormProps {
  searchParams: ReadonlyURLSearchParams | null;
}

// Define the type for category options
type CategoryOption = { value: string; label: string; icon: IconType };

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ searchParams }) => {
  const { user } = useAuth();
  const router = useRouter();
  const initialExpenseRef = useRef<Expense | null>(null);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    selectedDate: getTodayDate(), // Sets the default date as today's date
    amount: "",
    expenseType: "expense",
    category: "Others",
    description: "",
    transactionType: "debit",
  });

  useEffect(() => {
    if (user && searchParams) {
      const id = searchParams.get("id");
      if (id) {
        const expenseData: Expense = {
          id,
          date: searchParams.get("date") || getTodayDate(), // Use today's date if not found
          amount: searchParams.get("amount") || "",
          expenseType: searchParams.get("expenseType") || "expense",
          category: searchParams.get("category") || "food",
          description: searchParams.get("description") || "",
          transactionType: searchParams.get("transactionType") || "debit",
          userId: user.uid,
        };

        initialExpenseRef.current = expenseData;
        setFormData({
          selectedDate: expenseData.date,
          amount: expenseData.amount,
          expenseType: expenseData.expenseType,
          category: expenseData.category,
          description: expenseData.description,
          transactionType: expenseData.transactionType,
        });
      }
      setIsLoading(false);
    }
  }, [user, searchParams]);

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error("User is not logged in");
      return;
    }

    const expenseData: Expense = {
      date: formData.selectedDate,
      amount: formData.amount, // Unformatted numeric value
      expenseType: formData.expenseType,
      category: formData.category || "Others",
      description: formData.description,
      transactionType: formData.transactionType,
      userId: user.uid,
    };

    try {
      if (initialExpenseRef.current?.id) {
        await updateExpense(initialExpenseRef.current.id, expenseData);
      } else {
        await addExpense(user.uid, expenseData);
      }

      router.push("/my-expenses");
    } catch (error) {
      console.error("Error saving expense:", error);
      // Handle error appropriately
    }
  };

  const customStyles: StylesConfig<CategoryOption, false> = {
    control: (provided) => ({
      ...provided,
      borderColor: "#e2e8f0",
      "&:hover": { borderColor: "#cbd5e0" },
      boxShadow: "none",
      paddingLeft: "2.5rem",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#a0aec0",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#2d3748",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#197A56"
        : state.isFocused
        ? "#e6fffa"
        : "white",
      color: state.isSelected ? "white" : "#2d3748",
    }),
    input: (provided) => ({
      ...provided,
      marginLeft: "2.5rem",
    }),
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto border-2 border-gray-400">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-primary text-center mb-8 relative group">
              {initialExpenseRef.current?.id
                ? "Edit Expense"
                : "Add New Expense^^"}
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </h2>
            <div className="mt-2 h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <label
                htmlFor="expense-date"
                className="block text-lg font-semibold text-gray-700"
              >
                Date:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="flex-grow sm:flex-grow-0 font-semibold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary bg-primary text-white hover:bg-primary-dark border-2 border-primary"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedDate: getYesterdayDate(),
                    }))
                  }
                >
                  Yesterday.
                </button>
                <button
                  type="button"
                  className="flex-grow sm:flex-grow-0 font-semibold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary bg-primary text-white hover:bg-primary-dark border-2 border-primary"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedDate: getTodayDate(),
                    }))
                  }
                >
                  Today
                </button>
                <button
                  type="button"
                  className="flex-grow sm:flex-grow-0 font-semibold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary bg-primary text-white hover:bg-primary-dark border-2 border-primary"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedDate: getTomorrowDate(),
                    }))
                  }
                >
                  Tomorrow
                </button>
                <div className="relative flex-grow">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
                  <input
                    id="expense-date"
                    type="date"
                    name="selectedDate"
                    value={formData.selectedDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label
                htmlFor="expense-amount"
                className="block text-lg font-semibold text-gray-700"
              >
                Amount:
              </label>
              <div className="relative">
                <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
                <NumericFormat
                  id="expense-amount"
                  name="amount"
                  value={formData.amount}
                  onValueChange={(values) => {
                    const { value } = values;
                    setFormData((prevData) => ({ ...prevData, amount: value }));
                  }}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition"
                  placeholder="Enter Amount"
                  required
                  thousandSeparator={true}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  allowNegative={false}
                />
              </div>
            </div>

            {/* Expense Type */}
            <div className="space-y-2">
              <label
                htmlFor="expense-type"
                className="block text-lg    font-semibold text-gray-700"
              >
                Expense Type:
              </label>
              <div className="relative">
                <FaList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
                <select
                  id="expense-type"
                  name="expenseType"
                  value={formData.expenseType}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition appearance-none"
                >
                  <option value="expense">Expense</option>
                  <option value="return">Return</option>
                </select>
              </div>
            </div>

            {/* Expense Category */}
            <div className="space-y-2">
              <label
                htmlFor="expense-category"
                className="block text-lg    font-semibold  text-gray-700"
              >
                Expense Category:
              </label>
              <div className="relative">
                <FaTags className="absolute left-3 top-3.5 text-tertiary" />
                <Select
                  id="expense-category"
                  name="category"
                  value={categoryOptions.find(
                    (option) => option.value === formData.category
                  )}
                  onChange={(newValue) => {
                    const selectedOption = newValue as CategoryOption;
                    setFormData((prev) => ({
                      ...prev,
                      category: selectedOption?.value || "", // Allow empty string here
                    }));
                  }}
                  options={categoryOptions}
                  placeholder="Select Category"
                  isSearchable
                  isClearable={true} // Allow clearing the selection
                  styles={{
                    ...customStyles,
                    control: (provided) => ({
                      ...provided,
                      borderRadius: "0.375rem",
                      borderWidth: "2px",
                      borderColor: "#9CA3AF",
                    }),
                  }}
                  className="w-full"
                  formatOptionLabel={(option: CategoryOption) => (
                    <div className="flex items-center">
                      {option.icon && <option.icon className="mr-2" />}
                      {option.label}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="expense-description"
                className="block text-lg    font-semibold text-gray-700"
              >
                Description:
              </label>
              <div className="relative">
                <FaFileAlt className="absolute left-3 top-3 text-tertiary" />
                <textarea
                  id="expense-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                  placeholder="Enter the purpose of the expense"
                  rows={1}
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="block text-lg    font-semibold text-gray-700">
                Transaction Type:
              </label>
              <div className="flex items-center space-x-4">
                <FaExchangeAlt className="text-tertiary" />
                <div className="flex space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="transactionType"
                      value="credit"
                      checked={formData.transactionType === "credit"}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">Credit</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="transactionType"
                      value="debit"
                      checked={formData.transactionType === "debit"}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">Debit</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                type="button"
                className="w-full sm:w-auto font-semibold py-2 px-6 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-tertiary bg-tertiary text-white border-2 border-tertiary hover:bg-tertiary-dark"
                onClick={() => {
                  setFormData({
                    selectedDate: getTodayDate(), // Reset the date to today
                    amount: "",
                    expenseType: "expense",
                    category: "food",
                    description: "",
                    transactionType: "debit",
                  });
                }}
              >
                Reset
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto font-semibold py-2 px-6 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary bg-primary text-white border-2 border-primary hover:bg-primary-dark"
              >
                {initialExpenseRef.current?.id
                  ? "Update Expense"
                  : "Add Expense"}
              </button>
              <button
                type="button"
                className="w-full sm:w-auto font-semibold py-2 px-6 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-secondary bg-secondary text-white border-2 border-secondary hover:bg-secondary-dark"
                onClick={() => {
                  router.push("/my-expenses");
                }}
              >
                View All Expenses
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddExpenseForm), { ssr: false });
