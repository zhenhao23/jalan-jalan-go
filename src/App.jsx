import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

const INITIAL_CENTER = [101.6068, 3.0686];
const INITIAL_ZOOM = 17.5;
const INITIAL_PITCH = 45; // Add pitch constant (0-60 degrees)

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiemhoaGhoMjMyMSIsImEiOiJjbWM1bTJmMXkwMDVwMmtwa2s1bGJjeGlqIn0.n9iwwJSR0JzFok_w3BwWGQ";
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: zoom,
      pitch: INITIAL_PITCH, // Add pitch property
      interactive: false, // Disables all user interactions
    });

    mapRef.current.on("move", () => {
      // get the current center coordinates and zoom level from the map
      const mapCenter = mapRef.current.getCenter();
      const mapZoom = mapRef.current.getZoom();

      // update state
      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(mapZoom);
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const handleButtonClick = () => {
    mapRef.current.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: INITIAL_PITCH, // Include pitch in reset
    });
  };

  return (
    <>
      <div className="sidebar">
        Fixed View - Longitude: {INITIAL_CENTER[0]} | Latitude:{" "}
        {INITIAL_CENTER[1]} | Zoom: {INITIAL_ZOOM} | Pitch: {INITIAL_PITCH}°
      </div>
      <button className="reset-button" onClick={handleButtonClick}>
        Reset
      </button>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
