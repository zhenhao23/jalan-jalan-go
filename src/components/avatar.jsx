// components/AvatarCanvas.jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useFBX } from '@react-three/drei'
import React from 'react'

function Avatar() {
  const fbx = useFBX('/people.fbx') // Make sure people.fbx is inside public/
  return <primitive object={fbx} scale={0.01} position={[0, -1, 0]} />
}

export default function AvatarCanvas() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3] }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 2, 2]} />
      <Avatar />
      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}
