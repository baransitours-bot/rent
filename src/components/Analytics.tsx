"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AnalyticsProps {
  gaTrackingId?: string;
  userId?: string;
  propertyId?: string;
  page: "profile" | "property" | "marketplace" | "landing";
}

// Internal page view tracker
function trackView(userId: string, propertyId: string, page: string) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, propertyId, page }),
  }).catch(() => {});
}

export default function Analytics({ gaTrackingId, userId, propertyId, page }: AnalyticsProps) {
  useEffect(() => {
    if (userId) {
      trackView(userId, propertyId || "", page);
    }
  }, [userId, propertyId, page]);

  if (!gaTrackingId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaTrackingId}', {
            custom_map: {
              dimension1: 'tenant_id',
              dimension2: 'property_id',
              dimension3: 'page_type'
            }
          });
          ${userId ? `gtag('set', { 'tenant_id': '${userId}' });` : ""}
          ${propertyId ? `gtag('set', { 'property_id': '${propertyId}' });` : ""}
          gtag('set', { 'page_type': '${page}' });
        `}
      </Script>
    </>
  );
}
