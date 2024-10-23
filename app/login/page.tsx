"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "../components/AuthProvider";
import {
  FaGoogle,
  FaMicrosoft,
  FaApple,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const { isAuthenticated, login, googleSignIn } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/add-expense");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password); // Use the actual password
      toast.success("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      toast.success("Google sign-in successful");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("An error occurred during Google sign-in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className=" max-w-sm space-y-8 bg-white shadow-lg rounded-xl p-6 border-2 border-primary">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Form Section */}
        <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {/* Password Field */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#197A56] flex justify-center py-2 px-4 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Continue"}
            </button>
          </div>
        </form>

        {/* OR Divider */}
        <div className="flex items-center mt-2 mb-2">
          <div className="flex-grow bg-gray-300 h-px"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-grow bg-gray-300 h-px"></div>
        </div>

        {/* Social Login Buttons */}
        {/* Social Login Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <FaGoogle className="mr-3 text-red-500 text-xl" />
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </button>

          <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200">
            <FaMicrosoft className="mr-2" style={{ color: "#2563EB" }} />{" "}
            {/* Blue color hex */}
            Continue with Microsoft Account
          </button>

          <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200">
            <FaApple className="mr-2" style={{ color: "black" }} />
            Continue with Apple
          </button>

          <div className="text-center mt-16 text-sm text-gray-500">
            <Link href="/terms" className="hover:underline">
              Terms of Use
            </Link>{" "}
            |{" "}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Footer Section */}
        {/* Footer Section */}

        {/* <div className="text-center mt-16 text-sm text-gray-500">
          <Link href="/terms" className="hover:underline">
            Terms of Use
          </Link>{" "}
          |{" "}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div> */}
      </div>
    </div>
  );
}
