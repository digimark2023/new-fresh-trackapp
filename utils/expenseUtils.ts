import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

export interface Expense {
  id: string;
  date: string;
  amount: number | string; // Change this line
  category: string;
  type: string;
  description?: string;
}

export const addExpense = async (expenseData: Omit<Expense, "id">) => {
  const expensesCollection = collection(db, "expenses");
  const docRef = await addDoc(expensesCollection, expenseData);
  return docRef.id;
};

export const getExpenses = async (): Promise<Expense[]> => {
  const expensesCollection = collection(db, "expenses");
  const expensesQuery = query(expensesCollection, orderBy("date", "desc"));
  const querySnapshot = await getDocs(expensesQuery);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Expense)
  );
};

export const deleteExpense = async (id: string) => {
  const expenseDoc = doc(db, "expenses", id);
  await deleteDoc(expenseDoc);
};
