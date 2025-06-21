import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import { usePetContext } from "./PetContext.jsx";
import "./Pet.css";
import { databases } from "./appwriteConfig"; 

const DATABASE_ID = "6856988d0014123d37b0";
const COLLECTION_ID = "6856d3380009f1008909";

type PetData = {
  name: string;
  type: string;
  num: number;
};

function Pet() {
  const navigate = useNavigate();
  const { setSelectedPet } = usePetContext();

  const [petItems, setPetItems] = useState<PetData[]>([]);
  const mountRefs = useRef<React.RefObject<HTMLDivElement | null>[]>([]);

  const handlePetClick = (pet: PetData) => {
    setSelectedPet(pet);
    navigate("/animal");
  };

  const handleClose = () => {
    window.history.back();
  };

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        const items = response.documents
          .filter((doc) => doc.num > 0)
          .map((doc) => ({
            name: doc.animal,
            type: doc.Type.trim(),
            num: doc.num,
          }));
        console.log("Fetched pets:", items);
        setPetItems(items);
      } catch (err) {
        console.error("Failed to fetch pets:", err);
      }
    };

    fetchPets();
  }, []);

  useEffect(() => {
    // Initialize refs only once
    if (mountRefs.current.length !== petItems.length) {
      mountRefs.current = petItems.map(() => React.createRef<HTMLDivElement>());
    }

    const cleanups: (() => void)[] = [];

    petItems.forEach((pet, i) => {
      requestAnimationFrame(() => {
        const mountRef = mountRefs.current[i];
        if (!mountRef?.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        const container = mountRef.current;
        const size = Math.min(container.clientWidth, container.clientHeight);
        renderer.setSize(size, size);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

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

        const loader = new FBXLoader();
        const path = `/assets/Animal/${pet.type}.fbx`;
        console.log("Loading model from:", path);

        loader.load(
          path,
          (object) => {
            object.scale.setScalar(0.03);

            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.x = -center.x;
            object.position.y = -center.y;
            object.position.z = -center.z;

            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) child.material.needsUpdate = true;
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
          undefined,
          (error) => {
            console.error("Error loading FBX model:", error);
          }
        );

        const handleResize = () => {
          if (container) {
            const newSize = Math.min(container.clientWidth, container.clientHeight);
            renderer.setSize(newSize, newSize);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
          }
        };

        window.addEventListener("resize", handleResize);

        const cleanup = () => {
          window.removeEventListener("resize", handleResize);
          if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };

        cleanups.push(cleanup);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [petItems]);

  return (
    <div className="pet-container">
      <div className="pet-grid">
        {petItems.map((pet, i) => (
          <div key={i} className="pet-item" onClick={() => handlePetClick(pet)}>
            <div className="pet-title">{pet.name}</div>
            <div ref={mountRefs.current[i]} className="model-container"></div>
            <div className="quantity-badge">x{pet.num}</div>
            <div className="pet-type-badge">{pet.type}</div>
          </div>
        ))}
      </div>
      <button className="close-btn" onClick={handleClose}>
        &#10005;
      </button>
    </div>
  );
}

export default Pet;
