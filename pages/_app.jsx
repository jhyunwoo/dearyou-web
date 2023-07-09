import "@/styles/globals.css"
import { useEffect, useState } from "react"
import Head from "next/head"
import Router from "next/router"
import Script from "next/script"
import { RecoilRoot } from "recoil"
import * as gtag from "@/lib/gtags"
import { Analytics } from "@vercel/analytics/react"
import AuthWrapper from "@/contexts/AuthWrapper"
import Loading from "@/components/Loading"
// import { IBM_Plex_Sans_KR } from "next/font/google"
import Modal from "@/components/Modal"
import ProtectedPage from "@/components/ProtectedPage"
import errorTransmission from "@/lib/errorTransmission"

// const plex_sans = IBM_Plex_Sans_KR({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600"],
// })

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false)

  gtag.useGtag()

  useEffect(() => {
    try {
      const start = () => {
        // NProgress.start();
        setLoading(true)
      }
      const end = () => {
        // NProgress.done();
        setLoading(false)
      }

      Router.events.on("routeChangeStart", start)
      Router.events.on("routeChangeComplete", end)
      Router.events.on("routeChangeError", end)

      return () => {
        Router.events.off("routeChangeStart", start)
        Router.events.off("routeChangeComplete", end)
        Router.events.off("routeChangeError", end)
      }
    } catch (e) {
      errorTransmission(e)
    }
  }, [])

  return (
    <AuthWrapper>
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

      {/* <style jsx global>{`
        html {
          font-family: ${plex_sans.style.fontFamily};
        }
      `}</style> */}
      {loading ? <Loading /> : ""}
      <Analytics />
      <RecoilRoot>
        <Modal />
        <ProtectedPage>
          <Component {...pageProps} />
        </ProtectedPage>
      </RecoilRoot>
    </AuthWrapper>
  )
}
