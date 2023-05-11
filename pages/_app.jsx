import "@/styles/globals.css";
import AuthWrapper from "../contexts/AuthWrapper";
import Head from "next/head";
import { useEffect, useState } from "react";
import Router from "next/router";
import Loading from "@/components/Loading";
import * as gtag from "../lib/gtags";

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);

  gtag.useGtag();

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
      {process.env.NODE_ENV !== "development" && (
        <>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gtag.GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      {loading ? <Loading /> : ""}
      <Component {...pageProps} />
    </AuthWrapper>
  );
}
