import "@/styles/globals.css";
import AuthWrapper from "../contexts/AuthWrapper";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <AuthWrapper>
      <Head>
        <title>드려유</title>
        <meta property="og:title" content="드려유" key="title" />
      </Head>

      <Component {...pageProps} />
    </AuthWrapper>
  );
}
