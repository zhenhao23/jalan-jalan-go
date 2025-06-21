import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import { usePetContext } from "./PetContext.jsx";
import "./Pet.css";

function Pet() {
  const mountRef1 = useRef<HTMLDivElement>(null);
  const mountRef2 = useRef<HTMLDivElement>(null);
  const mountRef3 = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setSelectedPet } = usePetContext();

  const petItems = [
    {
      name: "Monkey Joy",
      path: "/assets/Animal/Monkey_Joy_0621034810_texture.fbx",
    },
    {
      name: "Traditional Tapir",
      path: "/assets/Animal/Tapir_in_Traditional__0621034141_texture.fbx",
    },
    {
      name: "Tribal Tiger Cub",
      path: "/assets/Animal/Tribal_Tiger_Cub_0621030339_texture.fbx",
    },
  ];

  const handlePetClick = (pet: { name: string; path: string }) => {
    setSelectedPet(pet);
    navigate("/animal");
  };

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
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });

      const container = mountRef.current;
      const size = Math.min(container.clientWidth, container.clientHeight);
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Softer lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
      scene.add(ambientLight);

      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
      directionalLight1.position.set(0, 10, 5);
      directionalLight1.castShadow = true;
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.15);
      directionalLight2.position.set(-5, 5, 5);
      scene.add(directionalLight2);

      const topLight = new THREE.DirectionalLight(0xffffff, 0.1);
      topLight.position.set(0, 15, 0);
      scene.add(topLight);

      // Load FBX model
      const loader = new FBXLoader();
      loader.load(
        modelPath,
        (object) => {
          object.scale.setScalar(0.03);
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
          const angle = Math.PI / 4;
          camera.position.set(
            distance * Math.sin(angle),
            distance * Math.sin(angle),
            distance * Math.cos(angle)
          );
          camera.lookAt(0, 0, 0);

          const animate = () => {
            requestAnimationFrame(animate);
            object.rotation.y += 0.008;
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

      return () => {
        window.removeEventListener("resize", handleResize);
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    };

    const cleanup1 = loadFBXModel(
      mountRef1 as React.RefObject<HTMLDivElement>,
      "/assets/Animal/Monkey_Joy_0621034810_texture.fbx"
    );
    const cleanup2 = loadFBXModel(
      mountRef2 as React.RefObject<HTMLDivElement>,
      "/assets/Animal/Tapir_in_Traditional__0621034141_texture.fbx"
    );
    const cleanup3 = loadFBXModel(
      mountRef3 as React.RefObject<HTMLDivElement>,
      "/assets/Animal/Tribal_Tiger_Cub_0621030339_texture.fbx"
    );

    return () => {
      cleanup1?.();
      cleanup2?.();
      cleanup3?.();
    };
  }, []);

  return (
    <div className="pet-container">
      <div className="pet-grid">
        <div className="pet-item" onClick={() => handlePetClick(petItems[0])}>
          <div className="pet-title">Monkey Joy</div>
          <div ref={mountRef1} className="model-container"></div>
          <div className="quantity-badge">x1</div>
        </div>
        <div className="pet-item" onClick={() => handlePetClick(petItems[1])}>
          <div className="pet-title">Traditional Tapir</div>
          <div ref={mountRef2} className="model-container"></div>
          <div className="quantity-badge">x1</div>
        </div>
        <div className="pet-item" onClick={() => handlePetClick(petItems[2])}>
          <div className="pet-title">Tribal Tiger Cub</div>
          <div ref={mountRef3} className="model-container"></div>
          <div className="quantity-badge">x1</div>
        </div>
        {/* Fourth item remains empty */}
      </div>
      <button className="close-btn" onClick={handleClose}>
        &#10005;
      </button>
    </div>
  );
}

export default Pet;
