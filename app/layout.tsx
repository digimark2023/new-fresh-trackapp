import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar"; // Updated import path

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TrackIt",
  description: "Expense tracking application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
          {/* <main className="container mx-auto mt-8 px-4">{children}</main> */}
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
