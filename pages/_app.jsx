import "@/styles/globals.css";
import AuthWrapper from "../contexts/AuthWrapper";

export default function App({ Component, pageProps }) {
  return (
    <AuthWrapper>
      <Component {...pageProps} />
    </AuthWrapper>
  );
}
