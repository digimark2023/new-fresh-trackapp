import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to <span className="text-blue-600">TrackIt</span>
      </h1>
      <p className="text-xl mb-8">Start tracking your expenses today!</p>
      <div className="flex space-x-4">
        <Link
          href="/add-expense"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Expense
        </Link>
        <Link
          href="/my-expenses"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          View Expenses
        </Link>
      </div>
    </div>
  );
}
