"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../app/components/AuthProvider";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Hamburger from "hamburger-react";
import {
  FaPlusCircle,
  FaList,
  FaSignOutAlt,
  FaSignInAlt,
  FaTimes,
} from "react-icons/fa";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, displayName } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You have been successfully logged out. See you soon!");
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("An error occurred while logging out. Please try again.");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-[#197A56] shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-white text-2xl font-bold hover:text-[#00BE71] transition duration-300"
        >
          TrackIt
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated && (
            <>
              {displayName && (
                <span className="text-white">Welcome, {displayName}!</span>
              )}
              <Link
                href="/add-expense"
                className="text-white hover:text-[#00BE71] flex items-center transition duration-300"
              >
                <FaPlusCircle className="mr-2" />
                Add Expense
              </Link>
              <Link
                href="/my-expenses"
                className="text-white hover:text-[#00BE71] flex items-center transition duration-300"
              >
                <FaList className="mr-2" />
                My Expenses
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full flex items-center transition duration-300"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <Link
              href="/login"
              className="bg-[#00BE71] hover:bg-[#00a45f] text-white font-semibold py-2 px-4 rounded-full flex items-center transition duration-300"
            >
              <FaSignInAlt className="mr-2" />
              Login
            </Link>
          )}
        </div>
        <div className="md:hidden">
          <Hamburger
            toggled={isMenuOpen}
            toggle={setIsMenuOpen}
            color="white"
          />
        </div>
      </div>
      {/* Mobile menu */}
      <div
        className={`md:hidden fixed top-0 right-0 w-64 h-full bg-[#197A56] z-50 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-4 pt-8 pb-4 space-y-4 relative">
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 text-white focus:outline-none hover:text-[#00BE71] transition duration-300"
          >
            <FaTimes className="text-2xl" />
          </button>
          {isAuthenticated && (
            <>
              {displayName && (
                <span className="text-white block px-3 py-2 text-lg font-semibold">
                  Welcome, {displayName}!
                </span>
              )}
              <Link
                href="/add-expense"
                className="text-white block px-3 py-3 rounded-md text-base font-medium hover:bg-[#00a45f] transition duration-300"
                onClick={toggleMenu}
              >
                <FaPlusCircle className="mr-3 inline" />
                Add Expense
              </Link>
              <Link
                href="/my-expenses"
                className="text-white block px-3 py-3 rounded-md text-base font-medium hover:bg-[#00a45f] transition duration-300"
                onClick={toggleMenu}
              >
                <FaList className="mr-3 inline" />
                My Expenses
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="w-full text-left bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-md mt-4 transition duration-300 flex items-center"
              >
                <FaSignOutAlt className="mr-3" />
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <Link
              href="/login"
              className="bg-[#00BE71] hover:bg-[#00a45f] text-white font-semibold py-3 px-4 rounded-md inline-block text-center transition duration-300 w-full"
              onClick={toggleMenu}
            >
              <FaSignInAlt className="mr-3 inline" />
              Login
            </Link>
          )}
        </div>
      </div>
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
