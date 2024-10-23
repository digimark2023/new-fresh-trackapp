import React from "react";
import { useSearchParams } from "next/navigation";
import AddExpenseForm from "../components/AddExpenseForm";

const AddExpensePage: React.FC = () => {
  const searchParams = useSearchParams();

  return (
    <>
      <AddExpenseForm searchParams={searchParams} />
    </>
  );
};

export default AddExpensePage;
