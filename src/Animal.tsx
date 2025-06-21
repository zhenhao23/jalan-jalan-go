import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import { useFoodContext } from "./FoodContext.jsx";
import { usePetContext } from "./PetContext.jsx";
import "./Animal.css";

function Animal() {
  const mountRef = useRef<HTMLDivElement>(null);
  const foodButtonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { selectedFood } = useFoodContext();
  const { selectedPet } = usePetContext();

  const handleBackpackClick = () => {
    navigate("/bagpack");
  };

  const handleMapClick = () => {
    navigate("/");
  };

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let dragClone: THREE.Object3D | null = null;

    if (!mountRef.current || !foodButtonRef.current) return;

    // Main scene for the selected pet
    const scene = new THREE.Scene();

    // Load and set background texture - use public folder path
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load("/assets/grassbackground.jpg");
    scene.background = backgroundTexture;

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

    // Food button scene
    const foodScene = new THREE.Scene();
    const foodCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const foodRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    const foodContainer = foodButtonRef.current;
    const buttonSize = 100;
    foodRenderer.setSize(buttonSize, buttonSize);
    foodRenderer.setClearColor(0x000000, 0);
    foodContainer.appendChild(foodRenderer.domElement);

    // Improved lighting setup for main scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight1.position.set(0, 10, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight2.position.set(-5, 5, 5);
    scene.add(directionalLight2);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.2);
    topLight.position.set(0, 15, 0);
    scene.add(topLight);

    // Lighting for food scene
    const foodAmbientLight = new THREE.AmbientLight(0xffffff, 0.8);
    foodScene.add(foodAmbientLight);

    const foodDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    foodDirectionalLight.position.set(2, 2, 2);
    foodScene.add(foodDirectionalLight);

    // Variables to store loaded objects
    let petObject: THREE.Object3D | null = null;
    let foodObject: THREE.Object3D | null = null;

    // Load selected pet FBX model
    const loader = new FBXLoader();
    loader.load(
      selectedPet.path, // Use selectedPet.path instead of hardcoded tiger path
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
        petObject = object; // Changed from tigerObject to petObject

        const distance = 14;
        camera.position.set(2, 4, distance);
        camera.lookAt(0, 0, 0);

        // Start animation after pet loads
        startAnimation();
      },
      (progress) => {
        console.log("Loading pet progress:", progress);
      },
      (error) => {
        console.error("Error loading pet FBX model:", error);
      }
    );

    // Load selected food model for the button
    const loadSelectedFood = () => {
      // Clear previous food object
      if (foodObject) {
        foodScene.remove(foodObject);
        foodObject = null;
      }

      const foodLoader = new FBXLoader();
      foodLoader.load(
        selectedFood.path,
        (object) => {
          object.scale.setScalar(0.1);

          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          object.position.x = -center.x;
          object.position.y = -center.y;
          object.position.z = -center.z;

          object.userData.isDraggable = true;
          foodScene.add(object);
          foodObject = object;

          // Position camera further back for food scene
          foodCamera.position.set(0, 7, 20);
          foodCamera.lookAt(0, 0, 0);
        },
        (progress) => {
          console.log("Loading food progress:", progress);
        },
        (error) => {
          console.error("Error loading food FBX model:", error);
        }
      );
    };

    // Animation loop
    const startAnimation = () => {
      const animate = () => {
        requestAnimationFrame(animate);

        // Animate pet (if loaded)
        if (petObject) {
          petObject.rotation.y += 0.0;
        }

        // Animate food (if loaded)
        if (foodObject) {
          foodObject.rotation.y += 0.01;
        }

        // Render both scenes
        renderer.render(scene, camera);
        foodRenderer.render(foodScene, foodCamera);
      };
      animate();
    };

    loadSelectedFood();

    // ...existing mouse event handlers remain the same...

    const onMouseDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(foodScene.children, true);

      if (intersects.length > 0) {
        const target = intersects[0].object;
        const parent = target.parent;
        if (parent && parent.userData.isDraggable) {
          isDragging = true;

          // Clone food into main scene
          dragClone = parent.clone();
          dragClone.position.set(0, 0, 0);
          dragClone.scale.setScalar(0.01);
          dragClone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          scene.add(dragClone);
        }
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging && dragClone) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ, intersection);
        dragClone.position.copy(intersection);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      if (dragClone) {
        scene.remove(dragClone);

        if (dragClone instanceof THREE.Mesh) {
          dragClone.geometry.dispose();

          if (Array.isArray(dragClone.material)) {
            dragClone.material.forEach((m) => m.dispose?.());
          } else {
            dragClone.material?.dispose?.();
          }
        }

        dragClone = null;
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      // Clean up main renderer
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();

      // Clean up food renderer
      if (foodContainer && foodRenderer.domElement) {
        foodContainer.removeChild(foodRenderer.domElement);
      }
      foodRenderer.dispose();
    };
  }, [selectedFood, selectedPet]); // Add selectedPet as dependency

  return (
    <div className="animal-container">
      <div ref={mountRef} className="animal-canvas-wrapper" />

      {/* Map Button - Top Left */}
      <div onClick={handleMapClick} className="animal-map-button">
        <span className="animal-map-cross">×</span>
      </div>

      <div onClick={handleBackpackClick} className="animal-backpack-button">
        <img
          src="/src/assets/pngtree-handdrawing-school-backpack-png-image_6136819.png"
          alt="Backpack"
          className="animal-backpack-icon"
        />
      </div>
      <div className="animal-food-button">
        <div ref={foodButtonRef} className="animal-food-model" />
        {/* <div className="animal-food-label">{selectedFood.name}</div> */}
      </div>
    </div>
  );
}

export default Animal;
