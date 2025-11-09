"use client";

import Script from "next/script";

export default function HubSpotScript() {
  return (
    <Script
      id="hubspot-script"
      src="//js-eu1.hs-scripts.com/147219365.js"
      strategy="afterInteractive"
      async
      defer
    />
  );
}
