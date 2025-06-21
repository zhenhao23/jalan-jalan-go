import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

const INITIAL_CENTER = [101.6068, 3.0686];
const INITIAL_ZOOM = 17.5;
const INITIAL_PITCH = 45;

// Helper to calculate distance between two [lng, lat] points in meters
function haversineDistance([lng1, lat1], [lng2, lat2]) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const watchIdRef = useRef();
  const markerRef = useRef();
  const prevLocationRef = useRef(null);

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiemhoaGhoMjMyMSIsImEiOiJjbWM1bTJmMXkwMDVwMmtwa2s1bGJjeGlqIn0.n9iwwJSR0JzFok_w3BwWGQ";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: zoom,
      pitch: INITIAL_PITCH,
      minZoom: INITIAL_ZOOM - 1,
      maxZoom: INITIAL_ZOOM + 1,
      interactive: false,
    });

    mapRef.current.on("load", () => {
      mapRef.current.dragRotate.enable();
      mapRef.current.touchZoomRotate.enableRotation();
    });

    // ...existing code...
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          const newCenter = [longitude, latitude];

          setUserLocation(newCenter);
          setCenter(newCenter);

          // Calculate distance walked
          if (prevLocationRef.current) {
            const d = haversineDistance(prevLocationRef.current, newCenter);
            setDistance((prev) => {
              const updated = prev + d;
              console.log("Distance updated:", updated); // <-- ADD HERE
              return updated;
            });
          }
          prevLocationRef.current = newCenter;

          mapRef.current.setCenter(newCenter);

          if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({ color: "red" })
              .setLngLat(newCenter)
              .addTo(mapRef.current);
          } else {
            markerRef.current.setLngLat(newCenter);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000, // Lower timeout for faster response
          maximumAge: 0, // No caching, always get fresh position
        }
      );
    }
    // ...existing code...

    return () => {
      mapRef.current.remove();
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, []);

  const handleButtonClick = () => {
    const targetCenter = userLocation || INITIAL_CENTER;
    mapRef.current.flyTo({
      center: targetCenter,
      zoom: INITIAL_ZOOM,
      pitch: INITIAL_PITCH,
    });
  };

  return (
    <>
      <div className="sidebar">
        {userLocation ? (
          <>
            Live Location - Longitude: {userLocation[0].toFixed(6)} | Latitude:{" "}
            {userLocation[1].toFixed(6)} | Zoom: {INITIAL_ZOOM} | Pitch:{" "}
            {INITIAL_PITCH}° | Distance: {(distance / 1000).toFixed(2)} km
          </>
        ) : (
          <>
            Fixed View - Longitude: {INITIAL_CENTER[0]} | Latitude:{" "}
            {INITIAL_CENTER[1]} | Zoom: {INITIAL_ZOOM} | Pitch: {INITIAL_PITCH}°
          </>
        )}
      </div>
      <button className="reset-button" onClick={handleButtonClick}>
        {userLocation ? "Center on Me" : "Reset"}
      </button>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
