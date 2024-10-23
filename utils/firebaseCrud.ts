// utils/firebaseCrud.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";

export interface Expense {
  id?: string;
  date: string;
  amount: string;
  expenseType: string;
  category: string;
  description: string;
  transactionType: string;
  userId: string; // Ensure userId is always included
}

const getCollectionName = () => {
  const env = process.env.NEXT_PUBLIC_ENV || "dev";
  return `expenses_${env}`;
};

const COLLECTION_NAME = getCollectionName();

// Function to add an expense to Firestore
export const addExpense = async (userId: string, expenseData: Expense) => {
  try {
    const expensesRef = collection(db, COLLECTION_NAME);
    await addDoc(expensesRef, { ...expenseData, userId });
    console.log("Expense added successfully");
  } catch (error) {
    console.error("Error adding expense: ", error);
    throw error;
  }
};

// Make sure this function is exported
export const getExpenses = async (userId: string): Promise<Expense[]> => {
  try {
    const expensesRef = collection(db, COLLECTION_NAME);
    const q = query(expensesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Expense)
    );
  } catch (error) {
    console.error("Error getting expenses: ", error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  const expenseDocRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(expenseDocRef);
};

export const updateExpense = async (id: string, expenseData: Expense) => {
  try {
    const expenseDocRef = doc(db, COLLECTION_NAME, id);
    // Convert Expense to a plain object
    const plainExpenseData = {
      date: expenseData.date,
      amount: expenseData.amount,
      expenseType: expenseData.expenseType,
      category: expenseData.category,
      description: expenseData.description,
      transactionType: expenseData.transactionType,
      userId: expenseData.userId,
    };
    await updateDoc(expenseDocRef, plainExpenseData);
    console.log("Expense updated successfully:", id);
  } catch (error) {
    console.error("Error updating expense: ", error);
    throw error;
  }
};
