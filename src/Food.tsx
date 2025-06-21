import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import "./Food.css";

function Food() {
  const mountRef1 = useRef<HTMLDivElement>(null);
  const mountRef2 = useRef<HTMLDivElement>(null);
  const mountRef3 = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    window.history.back();
  };

  useEffect(() => {
    const loadFBXModel = (
      mountRef: React.RefObject<HTMLDivElement>,
      modelPath: string
    ) => {
      if (!mountRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        1, // Square aspect ratio
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });

      const container = mountRef.current;
      const size = Math.min(container.clientWidth, container.clientHeight);
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0); // Transparent background
      container.appendChild(renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Load FBX model
      const loader = new FBXLoader();
      loader.load(
        modelPath,
        (object) => {
          // Scale and position the model
          object.scale.setScalar(0.01); // Adjust scale as needed
          object.position.set(0, 0, 0);

          // Center the model
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          object.position.x = -center.x;
          object.position.y = -center.y;
          object.position.z = -center.z;

          scene.add(object);

          // Position camera
          camera.position.z = 5;
          camera.lookAt(0, 0, 0);

          // Animation loop
          const animate = () => {
            requestAnimationFrame(animate);
            object.rotation.y += 0.01; // Rotate the model
            renderer.render(scene, camera);
          };
          animate();
        },
        (progress) => {
          console.log("Loading progress:", progress);
        },
        (error) => {
          console.error("Error loading FBX model:", error);
        }
      );

      // Handle resize
      const handleResize = () => {
        if (container) {
          const newSize = Math.min(
            container.clientWidth,
            container.clientHeight
          );
          renderer.setSize(newSize, newSize);
          camera.aspect = 1;
          camera.updateProjectionMatrix();
        }
      };

      window.addEventListener("resize", handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener("resize", handleResize);
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    };

    // Load models using public URLs
    const cleanup1 = loadFBXModel(
      mountRef1 as React.RefObject<HTMLDivElement>,
      "/assets/Food/Nasi_Lemak_Dish_0621050817_texture.fbx"
    );
    const cleanup2 = loadFBXModel(
      mountRef2 as React.RefObject<HTMLDivElement>,
      "/assets/Food/Parotta_and_Curry_Del_0621052635_texture.fbx"
    );
    const cleanup3 = loadFBXModel(
      mountRef3 as React.RefObject<HTMLDivElement>,
      "/assets/Food/Steaming_Dumplings_0621053626_texture.fbx"
    );

    return () => {
      cleanup1?.();
      cleanup2?.();
      cleanup3?.();
    };
  }, []);

  return (
    <div className="food-container">
      <div className="food-grid">
        <div className="food-item" ref={mountRef1}></div>
        <div className="food-item" ref={mountRef2}></div>
        <div className="food-item" ref={mountRef3}></div>
        <div className="food-item">{/* Fourth item remains empty */}</div>
      </div>
      <button className="close-btn" onClick={handleClose}>
        &#10005;
      </button>
    </div>
  );
}

export default Food;
