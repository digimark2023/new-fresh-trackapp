import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getFirebaseConfig = (env: string) => {
  const suffix = env.toUpperCase();
  return {
    apiKey: process.env[`NEXT_PUBLIC_FIREBASE_API_KEY_${suffix}`],
    authDomain: process.env[`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_${suffix}`],
    projectId: process.env[`NEXT_PUBLIC_FIREBASE_PROJECT_ID_${suffix}`],
    storageBucket: process.env[`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_${suffix}`],
    messagingSenderId:
      process.env[`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_${suffix}`],
    appId: process.env[`NEXT_PUBLIC_FIREBASE_APP_ID_${suffix}`],
    measurementId: process.env[`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_${suffix}`],
  };
};

const promptForUserId = (oldExpense: any): Promise<string | null> => {
  return new Promise((resolve) => {
    rl.question(
      `Enter user ID for expense (${oldExpense.id}) or press enter to skip: `,
      (answer) => {
        resolve(answer.trim() || null);
      }
    );
  });
};

const migrateExpenses = async (sourceEnv: string, targetEnv: string) => {
  const sourceApp = initializeApp(getFirebaseConfig(sourceEnv), "source");
  const targetApp = initializeApp(getFirebaseConfig(targetEnv), "target");

  const sourceDb = getFirestore(sourceApp);
  const targetDb = getFirestore(targetApp);

  const sourceCollection = `expenses_${sourceEnv}`;
  const targetCollection = `user_expenses_${targetEnv}`;

  const oldExpensesRef = collection(sourceDb, sourceCollection);
  const newExpensesRef = collection(targetDb, targetCollection);

  const querySnapshot = await getDocs(oldExpensesRef);

  for (const doc of querySnapshot.docs) {
    const oldExpense = { id: doc.id, ...doc.data() };
    const userId = await promptForUserId(oldExpense);

    if (userId) {
      await addDoc(newExpensesRef, { ...oldExpense, userId });
      console.log(
        `Migrated expense ${oldExpense.id} from ${sourceEnv} to ${targetEnv} for user ${userId}`
      );
    } else {
      console.log(`Skipped expense ${oldExpense.id}`);
    }
  }

  rl.close();
};

// Usage: node migrateExpenses.js <sourceEnv> <targetEnv>
const [sourceEnv, targetEnv] = process.argv.slice(2);
if (sourceEnv && targetEnv) {
  migrateExpenses(sourceEnv, targetEnv).then(() =>
    console.log("Migration complete")
  );
} else {
  console.log("Usage: node migrateExpenses.js <sourceEnv> <targetEnv>");
  process.exit(1);
}
