import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../app/components/AuthProvider";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="bottom-center" />
    </AuthProvider>
  );
}

export default MyApp;
