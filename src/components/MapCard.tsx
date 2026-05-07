"use client";

import { useEffect, useRef } from "react";
import { business } from "@/lib/business";

// Geocoded coordinates for 13 Danbury Rd, Wilton, CT 06897
const LAT = 41.1622859;
const LON = -73.4193528;
const DEFAULT_ZOOM = 16;
const MIN_ZOOM = 13;
const MAX_ZOOM = 19;

/**
 * Locked-center store map.
 *
 * - Zoom in/out works (scroll wheel, +/- buttons, pinch on touch, double-click)
 * - Panning, dragging, and keyboard arrow movement are disabled
 * - Any zoom interaction snaps the view back to the store centre, so
 *   the user can never wander away from the marker.
 *
 * Built with Leaflet (free, no API key) using OpenStreetMap tiles.
 */
export default function MapCard({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const a = business.contact.address;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    (async () => {
      // Dynamic imports keep Leaflet out of the SSR bundle.
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      // Already initialised? (Strict-mode double-mount safety.)
      if ((containerRef.current as any)._leaflet_id) return;

      const map = L.map(containerRef.current, {
        center: [LAT, LON],
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        // Lock movement: only zoom is allowed
        dragging: false,
        keyboard: false,
        boxZoom: false,
        // Allow zoom interactions
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: "center", // pinch zoom always anchors at map centre
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: MAX_ZOOM,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Custom pin (HTML divIcon — picks up our brand colours)
      const icon = L.divIcon({
        className: "mm-map-pin",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:-8px;background:rgba(0,102,204,0.25);border-radius:9999px;filter:blur(6px);"></div>
            <div style="position:relative;display:grid;place-items:center;width:44px;height:44px;border-radius:9999px;background:#0066cc;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,0.25);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
          </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      L.marker([LAT, LON], { icon, interactive: false }).addTo(map);

      // After every zoom, snap the view back to the store centre.
      const recenter = () => map.panTo([LAT, LON], { animate: false });
      map.on("zoomend", recenter);
      map.on("moveend", recenter);

      // Cleanup
      return () => {
        cancelled = true;
        map.off("zoomend", recenter);
        map.off("moveend", recenter);
        map.remove();
      };
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border border-[var(--hairline)] bg-[var(--surface)] ${className}`}
    >
      <div
        ref={containerRef}
        className="h-[360px] w-full"
        // Leaflet renders inline styles; this is just the wrapper background.
        style={{ background: "var(--surface)" }}
      />

      {/* Address + CTA strip at the bottom */}
      <div className="border-t border-[var(--hairline)] bg-[var(--canvas)] px-5 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
            Visit us
          </div>
          <div className="mt-0.5 text-[14px] font-semibold text-[var(--ink)] truncate">
            {a.street}, {a.city}, {a.state} {a.zip}
          </div>
        </div>
        <a
          href={business.contact.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in Google Maps"
          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[var(--ink)] text-[var(--canvas)] text-[12px] font-medium px-4 py-2 hover:bg-[var(--primary)] hover:text-white transition-colors"
        >
          Open in Maps
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      </div>
    </div>
  );
}
