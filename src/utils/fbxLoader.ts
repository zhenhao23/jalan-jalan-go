import * as THREE from "three";

let FBXLoaderClass: any = null;

export async function getFBXLoader(): Promise<any> {
  if (FBXLoaderClass) {
    return FBXLoaderClass;
  }

  // Check if FBXLoader is already available on THREE
  if ((THREE as any).FBXLoader) {
    FBXLoaderClass = (THREE as any).FBXLoader;
    return FBXLoaderClass;
  }

  // Dynamically load the FBXLoader script
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/node_modules/three/examples/js/loaders/FBXLoader.js';
    script.onload = () => {
      // Wait a bit for the script to execute
      setTimeout(() => {
        if ((THREE as any).FBXLoader) {
          FBXLoaderClass = (THREE as any).FBXLoader;
          resolve(FBXLoaderClass);
        } else {
          reject(new Error('FBXLoader not found after script load'));
        }
      }, 100);
    };
    script.onerror = () => {
      reject(new Error('Failed to load FBXLoader script'));
    };
    document.head.appendChild(script);
  });
} 