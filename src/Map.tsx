import React from "react";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { FBXLoader } from "three-stdlib";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Map.css";

import Heritage from "./Heritage";

const INITIAL_CENTER = [101.6929, 3.1390] as [number, number];
const INITIAL_ZOOM = 17.5;
const INITIAL_PITCH = 45;

const LOCATIONS = [
  {
    lng: 101.6929,
    lat: 3.1390,
    label: "Sultan Abdul Samad Building",
  },
  {
    lng: 101.6934,
    lat: 3.1440,
    label: "Merdeka Square (Dataran Merdeka)",
  },
  {
    lng: 101.6984,
    lat: 3.1444,
    label: "National Textile Museum",
  },
  {
    lng: 101.6931,
    lat: 3.1398,
    label: "Kuala Lumpur City Gallery",
  },
  {
    lng: 101.6958,
    lat: 3.1424,
    label: "Jamek Mosque (Masjid Jamek)",
  },
  {
    lng: 101.6990,
    lat: 3.1409,
    label: "Central Market (Pasar Seni)",
  },
  {
    lng: 101.6936,
    lat: 3.1420,
    label: "Old KL Railway Station",
  },
  {
    lng: 101.6939,
    lat: 3.1389,
    label: "Masjid Negara (National Mosque)",
  },
  {
    lng: 101.6895,
    lat: 3.1358,
    label: "Islamic Arts Museum Malaysia",
  },
  {
    lng: 101.7023,
    lat: 3.1390,
    label: "Chan She Shu Yuen Clan Ancestral Hall",
  },
  {
    lng: 101.6967,
    lat: 3.1453,
    label: "Sin Sze Si Ya Temple",
  },
  {
    lng: 101.6985,
    lat: 3.1448,
    label: "Sri Mahamariamman Temple",
  },
  {
    lng: 101.6841,
    lat: 3.2353,
    label: "Batu Caves – Hindu Cultural Landmark",
  },
  {
    lng: 101.6987,
    lat: 3.1140,
    label: "Thean Hou Temple – Chinese Culture & Worship",
  },
  {
    lng: 101.7031,
    lat: 3.1615,
    label: "Kampung Baru – Malay Cultural Village",
  }
];

// Helper to calculate distance between two [lng, lat] points in meters
function haversineDistance(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
) {
  function toRad(x: number) {
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

function Map() {
  const [showHeritage, setShowHeritage] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = useState<typeof LOCATIONS[0] | null>(null);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const avatarContainerRef = useRef<HTMLDivElement | null>(null);
  // const watchIdRef = useRef<number | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  // const prevLocationRef = useRef<[number, number] | null>(null);

  const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  // Set userLocation to static initial location instead of null
  const [userLocation, setUserLocation] = useState<[number, number]>(
    INITIAL_CENTER
  );
  const [distance, setDistance] = useState(0);
  // Three.js setup for avatar and tiger
  useEffect(() => {
    if (!avatarContainerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      300 / 300, // Square aspect ratio for the avatar container
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    const container = avatarContainerRef.current;
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add additional directional light from the front
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 5, 10);
    scene.add(frontLight);

    // Add a fill light from the left
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);

    // Load GLB model for avatar
    const gltfLoader = new GLTFLoader();
    let avatarObject: THREE.Object3D | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();

    gltfLoader.load(
      "/assets/Avatar/Animation_Walking_withSkin.glb",
      (gltf) => {
        const object = gltf.scene;
        object.scale.setScalar(2); // Adjust scale as needed

        // Center the object
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.x = -center.x - 1.5; // Move avatar to the left
        object.position.y = -center.y;
        object.position.z = -center.z;

        // Rotate the avatar 180 degrees to face away
        object.rotation.y = Math.PI; // 180 degrees in radians

        // Enable shadows
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(object);
        avatarObject = object;

        // Setup animation mixer for animated GLB
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(object);

          // Play the first animation (running animation)
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();

          console.log("Available animations:", gltf.animations.length);
          gltf.animations.forEach((clip, index) => {
            console.log(`Animation ${index}:`, clip.name);
          });
        }

        // Position camera to show both avatar and tiger
        camera.position.set(0, 8, 10);
        camera.lookAt(0, 0, 0);
      },
      (progress) => {
        console.log("Loading avatar progress:", progress);
      },
      (error) => {
        console.error("Error loading avatar GLB model:", error);
      }
    );

    // Load FBX model for tiger
    const fbxLoader = new FBXLoader();
    let tigerObject: THREE.Object3D | null = null;

    fbxLoader.load(
      "/assets/Animal/Tribal_Tiger_Cub_0621030339_texture.fbx",
      (object) => {
        object.scale.setScalar(0.01);

        // Position tiger beside the avatar (to the right)
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.x = -center.x + 1.5; // Move tiger to the right
        object.position.y = -center.y;
        object.position.z = -center.z;

        // Rotate tiger to face the same direction as avatar
        object.rotation.y = Math.PI;

        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });

        scene.add(object);
        tigerObject = object;

        console.log("Tiger loaded successfully");
      },
      (progress) => {
        console.log("Loading tiger progress:", progress);
      },
      (error) => {
        console.error("Error loading tiger FBX model:", error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Update animation mixer for avatar
      if (mixer) {
        mixer.update(delta);
      }

      // Optional: Add slight movement to tiger
      if (tigerObject) {
        tigerObject.rotation.y += 0.01; // Very slow rotation
      }

      renderer.render(scene, camera);
    };
    animate();
    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      if (mixer) {
        mixer.stopAllAction();
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiemhoaGhoMjMyMSIsImEiOiJjbWM1bTJmMXkwMDVwMmtwa2s1bGJjeGlqIn0.n9iwwJSR0JzFok_w3BwWGQ";

    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: zoom,
      pitch: INITIAL_PITCH,
      minZoom: INITIAL_ZOOM - 1,
      maxZoom: INITIAL_ZOOM + 1,
      interactive: true,
    });

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;

      LOCATIONS.forEach((loc) => {
       const marker = new mapboxgl.Marker({
          element: (() => {
            const img = document.createElement('img');
            img.src = '/assets/icon.png'; // Make sure the image is in your `public/` folder
            img.style.width = '60px';
            img.style.height = '60px';
            return img;
          })(),
        })
        .setLngLat([loc.lng, loc.lat])
        .addTo(mapRef.current!);

        // Add click event to marker instead of popup
        marker.getElement().addEventListener('click', () => {
          setSelectedLocation(loc);
          setShowHeritage(true);
        });
      });

      // Add static user location marker
      markerRef.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat(INITIAL_CENTER)
        .addTo(mapRef.current);

      // Optional: enable any controls or interactions here too
    });

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;

      // Enable drag rotate (for mouse right-click drag)
      mapRef.current.dragRotate.enable();

      // Enable touch rotate (two-finger rotation)
      mapRef.current.touchZoomRotate.disableRotation();

      // Enable touch pitch (single touch drag up/down to change pitch/angle)
      mapRef.current.touchPitch.disable();

      // IMPORTANT: Enable drag pan for touch pitch to work
      mapRef.current.dragPan.disable();

      // But disable keyboard interactions to prevent unwanted behavior
      mapRef.current.keyboard.disable();
      mapRef.current.scrollZoom.disable();
      mapRef.current.boxZoom.disable();
      mapRef.current.doubleClickZoom.disable();
    });

    // COMMENTED OUT: Geolocation tracking functionality
    // if (navigator.geolocation) {
    //   watchIdRef.current = navigator.geolocation.watchPosition(
    //     (position) => {
    //       const { longitude, latitude } = position.coords;
    //       const newCenter: [number, number] = [longitude, latitude];

    //       setUserLocation(newCenter);
    //       setCenter(newCenter);

    //       // Calculate distance walked
    //       if (prevLocationRef.current) {
    //         const d = haversineDistance(prevLocationRef.current, newCenter);
    //         setDistance((prev) => {
    //           const updated = prev + d;
    //           console.log("Distance updated:", updated);
    //           return updated;
    //         });
    //       }
    //       prevLocationRef.current = newCenter;

    //       if (mapRef.current) {
    //         mapRef.current.setCenter(newCenter);

    //         if (!markerRef.current) {
    //           markerRef.current = new mapboxgl.Marker({ color: "red" })
    //             .setLngLat(newCenter)
    //             .addTo(mapRef.current);
    //         } else {
    //           markerRef.current.setLngLat(newCenter);
    //         }
    //       }
    //     },
    //     (error) => {
    //       console.error("Geolocation error:", error);
    //     },
    //     {
    //       enableHighAccuracy: true,
    //       timeout: 5000,
    //       maximumAge: 0,
    //     }
    //   );
    // }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      // COMMENTED OUT: Clear geolocation watch
      // if (watchIdRef.current) {
      //   navigator.geolocation.clearWatch(watchIdRef.current);
      // }
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, []);

  const handleButtonClick = () => {
    const targetCenter = userLocation || INITIAL_CENTER;
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: targetCenter,
        zoom: INITIAL_ZOOM,
        pitch: INITIAL_PITCH,
      });
    }
  };

  return (
    <>
      {showHeritage && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => setShowHeritage(false)} // Close when clicking overlay
        >
          <div 
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              overflow: 'auto' 
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {selectedLocation && (
              <Heritage
                onClose={() => setShowHeritage(false)}
                location={selectedLocation}
              />
            )}
          </div>
        </div>
      )}
      <div
        ref={avatarContainerRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "300px",
          height: "300px",
          zIndex: 999,
          pointerEvents: "none", // Allow map interactions through the avatar
        }}
      />

      <div className="sidebar">
        {/* Updated to show static location info */}
        Static Location - Longitude: {userLocation[0].toFixed(6)} | Latitude:{" "}
        {userLocation[1].toFixed(6)} | Zoom: {INITIAL_ZOOM} | Pitch:{" "}
        {INITIAL_PITCH}° | Distance: {distance.toFixed(0)} m
      </div>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default Map;