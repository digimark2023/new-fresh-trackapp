import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Welcome to TrackIt</h1>
      <p className="text-lg mb-8">Start tracking your expenses today!</p>
      <div className="flex space-x-4">
        <Link
          href="/add-expense"
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
        >
          Add Expense
        </Link>
        <Link
          href="/my-expenses"
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
        >
          View Expenses
        </Link>
      </div>
    </div>
  );
}
