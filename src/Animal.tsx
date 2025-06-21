import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";

function Animal() {
  const mountRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    window.history.back();
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    const container = mountRef.current;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Improved lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Increased from 0.8
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5); // Increased from 0.3
    directionalLight1.position.set(0, 10, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.25); // Increased from 0.15
    directionalLight2.position.set(-5, 5, 5);
    scene.add(directionalLight2);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.2); // Increased from 0.1
    topLight.position.set(0, 15, 0);
    scene.add(topLight);

    // Load FBX model
    const loader = new FBXLoader();
    loader.load(
      "/assets/Animal/Tribal_Tiger_Cub_0621030339_texture.fbx",
      (object) => {
        object.scale.setScalar(0.02);
        object.position.set(0, 0, 0);

        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.x = -center.x;
        object.position.y = -center.y;
        object.position.z = -center.z;

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

        const distance = 8;
        const angle = 4;
        camera.position.set(
          2, // X: centered
          4, // Y: slightly above (adjust as needed)
          distance // Z: distance from model
        );
        camera.lookAt(0, 0, 0);

        const animate = () => {
          requestAnimationFrame(animate);
          object.rotation.y += 0.0;
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

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        backgroundColor: "#f5f5f5",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          bottom: "30px",
          right: "30px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          fontSize: "24px",
          fontWeight: "bold",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "background-color 0.3s ease",
          userSelect: "none",
          zIndex: 10,
          lineHeight: 1,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#c82333")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#dc3545")
        }
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        &#10005;
      </button>
    </div>
  );
}

export default Animal;
