import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import People from "../People";

interface PeopleMarkerProps {
  lngLat: [number, number];
  map: mapboxgl.Map;
}

function PeopleMarker({ lngLat, map }: PeopleMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create a custom HTML element for the marker
    const el = document.createElement("div");
    el.style.width = "60px";
    el.style.height = "60px";
    el.style.position = "relative";
    el.style.zIndex = "1000";
    el.style.pointerEvents = "none";

    // Create React root and render People component
    const root = createRoot(el);
    root.render(<People />);

    // Create and add the marker to the map
    markerRef.current = new mapboxgl.Marker({
      element: el,
      anchor: "center",
    })
      .setLngLat(lngLat)
      .addTo(map);

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      root.unmount();
    };
  }, [map, lngLat]);

  // Update marker position when lngLat changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat(lngLat);
    }
  }, [lngLat]);

  return null; // This component doesn't render anything directly
}

export default PeopleMarker; 