import "@/styles/globals.css";
import AuthWrapper from "../contexts/AuthWrapper";
import Head from "next/head";
import { useEffect, useState } from "react";
import Router from "next/router";
import Loading from "@/components/Loading";

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => {
      // NProgress.start();
      setLoading(true);
    };
    const end = () => {
      // NProgress.done();
      setLoading(false);
    };

    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);

  return (
    <AuthWrapper>
      <Head>
        <title>드려유</title>
        <meta property="og:title" content="드려유" key="title" />
      </Head>

      {loading ? <Loading /> : ""}
      <Component {...pageProps} />
    </AuthWrapper>
  );
}
