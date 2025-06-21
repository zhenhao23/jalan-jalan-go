import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import "./Food.css";
import { databases } from "./appwriteConfig";
import { ID } from "appwrite";

const DATABASE_ID = "6856988d0014123d37b0";
const COLLECTION_ID = "6856c45200315cd8b059";

interface FoodItem {
  $id: string;
  title: string;
  path: string;
  quantity: number;
  ref: React.RefObject<HTMLDivElement | null>;
}

function Food() {
const mountRefs = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
const hasInitialized = useRef(false);

  const handleClose = () => {
    window.history.back();
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initialData = [
      {
        $id: "6856c4e30004b95c4d68",
        title: "Nasi Lemak",
        path: "/assets/Food/Nasi_Lemak_Dish_0621050817_texture.fbx",
      },
      {
        $id: "6856c50a0028cae93bb2",
        title: "Parotta & Curry",
        path: "/assets/Food/Parotta_and_Curry_Del_0621052635_texture.fbx",
      },
      {
        $id: "6856c51e00120d601129",
        title: "Steaming Dumplings",
        path: "/assets/Food/Steaming_Dumplings_0621053626_texture.fbx",
      },
    ];

    const updateAndFetch = async () => {
      const refs = initialData.map(() => React.createRef<HTMLDivElement>());
      
      const promises = initialData.map(async (item, index) => {
        const randomQty = Math.floor(Math.random() * 6);
        if (randomQty === 0) return null;

        try {
          const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, item.$id);
          const currentNum = doc.num ?? 0;
          const newTotal = currentNum + randomQty;

          await databases.updateDocument(DATABASE_ID, COLLECTION_ID, item.$id, {
            num: newTotal,
          });

          const updatedDoc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, item.$id);

          console.log(`Updated ${item.title}: ${currentNum} + ${randomQty} = ${updatedDoc.num}`);

          return {
            ...item,
            quantity: randomQty,
            ref: refs[index],
          };
        } catch (error) {
          console.error(`Error updating ${item.title}`, error);
          return null;
        }
      });

      const resolvedItems = await Promise.all(promises);
      const filteredItems = resolvedItems.filter(Boolean) as FoodItem[];

      setFoodItems(filteredItems);
    };

    updateAndFetch();
  }, []);

    useEffect(() => {
      foodItems.forEach((item, i) => {
        setTimeout(() => {
          loadFBXModel(item.ref, item.path);
        }, i * 300); // stagger by 300ms
      });
    }, [foodItems]);


  const loadFBXModel = (
    mountRef: React.RefObject<HTMLDivElement | null>,
    modelPath: string
  ) => {
    if (!mountRef.current) return;

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight1.position.set(0, 10, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-5, 5, 5);
    scene.add(directionalLight2);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
    topLight.position.set(0, 15, 0);
    scene.add(topLight);

    const loader = new FBXLoader();
    loader.load(
      modelPath,
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
      const newSize = Math.min(container.clientWidth, container.clientHeight);
      renderer.setSize(newSize, newSize);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
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

  return (
    <div className="food-container">
      <div className="food-grid">
        {foodItems.map((item, index) => (
          <div key={index} className="food-item">
            <div className="food-title">{item.title}</div>
            <div ref={item.ref} className="model-container"></div>
            <div className="quantity-badge">x{item.quantity}</div>
          </div>
        ))}
      </div>
      <button className="close-btn" onClick={handleClose}>
        &#10005;
      </button>
    </div>
  );
}

export default Food;
