import { useEffect } from "react"
import { useRouter } from "next/router"

export const GA_TRACKING_ID = "G-RYJQLR1GD3"

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  })
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (action, { event_category, event_label, value }) => {
  window.gtag("event", action, {
    event_category,
    event_label,
    value,
  })
}

// route가 변경될 때 gtag에서
export const useGtag = () => {
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return

    const handleRouteChange = (url) => {
      pageview(url)
    }

    router.events.on("routeChangeComplete", handleRouteChange)
    router.events.on("hashChangeComplete", handleRouteChange)
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
      router.events.off("hashChangeComplete", handleRouteChange)
    }
  }, [router.events])
}
