import { useEffect } from "react";
import api from "../api";

// Injects Google Analytics 4 and/or Meta (Facebook) Pixel scripts, only if
// IDs are configured (via env vars or Admin > Settings, key "analytics").
// Runs once; safe no-op if nothing is configured.
export default function Analytics() {
  useEffect(() => {
    api.get("/admin-public/settings")
      .then((r) => {
        const { gaId, metaPixelId } = r.data?.analytics || {};

        if (gaId && !document.getElementById("ga4-script")) {
          const s1 = document.createElement("script");
          s1.id = "ga4-script";
          s1.async = true;
          s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          document.head.appendChild(s1);

          const s2 = document.createElement("script");
          s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
          document.head.appendChild(s2);
        }

        if (metaPixelId && !document.getElementById("meta-pixel-script")) {
          const s = document.createElement("script");
          s.id = "meta-pixel-script";
          s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`;
          document.head.appendChild(s);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
