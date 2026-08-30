"use client";
import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Text, Line, Sphere, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const ISSUE_NODES = [
  { id: 1, position: [2, 1.5, 0] },
  { id: 2, position: [3, -1, 1] },
  { id: 3, position: [1.5, -2, -1] },
  { id: 4, position: [4, 0.5, -2] },
];

const RELATIONSHIPS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 3],
];

function Scene() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      // Subtle ambient rotation and parallax
      group.current.rotation.y = state.clock.elapsedTime * 0.05 + (state.pointer.x * 0.1);
      group.current.rotation.x = (state.pointer.y * 0.1);
    }
  });

  return (
    <group ref={group} position={[0, 0, -5]} scale={0.7}>
      {/* Crimson wireframe core - smaller and more subtle */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Icosahedron args={[2.5, 1]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#E3123F" wireframe transparent opacity={0.15} />
        </Icosahedron>
      </Float>

      {/* Glowing mesh - softer */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <Sphere args={[1.5, 32, 32]}>
          <MeshDistortMaterial color="#E3123F" emissive="#E3123F" emissiveIntensity={0.2} distort={0.6} speed={1.5} transparent opacity={0.1} />
        </Sphere>
      </Float>

      {/* Sparkles */}
      <Sparkles count={150} scale={15} size={3} speed={0.2} opacity={0.3} color="#E3123F" />

      {/* Issue Nodes */}
      {ISSUE_NODES.map((node) => (
        <Node key={node.id} position={node.position as [number, number, number]} />
      ))}

      {/* Relationship Lines */}
      {RELATIONSHIPS.map((rel, i) => {
        const start = ISSUE_NODES[rel[0]].position;
        const end = ISSUE_NODES[rel[1]].position;
        return (
          <Line
            key={i}
            points={[start as [number, number, number], end as [number, number, number]]}
            color="#E3123F"
            lineWidth={1}
            transparent
            opacity={0.15}
            dashed={false}
          />
        );
      })}
    </group>
  );
}

function Node({ position }: { position: [number, number, number] }) {
  return (
    <Sphere
      args={[0.1, 16, 16]}
      position={position}
    >
      <meshStandardMaterial color="#FF2C55" emissive="#FF2C55" emissiveIntensity={0.3} transparent opacity={0.4} />
    </Sphere>
  );
}

export default function DevTrack3DHero() {
  return (
    <div className="hidden md:block" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: -1 }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ pointerEvents: 'none' }}
        gl={{ alpha: true, antialias: true }}
        eventSource={typeof window !== 'undefined' ? document.body : undefined}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
        <Scene />
      </Canvas>
    </div>
  );
}
