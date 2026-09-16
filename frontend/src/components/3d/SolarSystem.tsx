import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Planet component with orbital motion
interface PlanetProps {
  distance: number;
  size: number;
  color: string;
  speed: number;
  name: string;
  hasRing?: boolean;
}

const Planet: React.FC<PlanetProps> = ({ distance, size, color, speed, name, hasRing }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = speed * state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = speed * state.clock.elapsedTime * 2;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} position={[distance, 0, 0]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.1}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      {hasRing && (
        <mesh position={[distance, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.5, size * 2, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.05}
            transparent 
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <Text
        position={[distance, size + 1, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
};

// Sun component
const Sun: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshStandardMaterial 
        color="#FDB813" 
        emissive="#FDB813" 
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  );
};

// Asteroid belt component
const AsteroidBelt: React.FC<{ innerRadius: number; outerRadius: number }> = ({ innerRadius, outerRadius }) => {
  const asteroids = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const height = (Math.random() - 0.5) * 0.5;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    return positions;
  }, [innerRadius, outerRadius]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={asteroids.length / 3}
          array={asteroids}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#8B7355" size={0.05} sizeAttenuation />
    </points>
  );
};

// Main Solar System component
const SolarSystem: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
      
      <Sun />
      
      {/* Mercury */}
      <Planet
        distance={5}
        size={0.4}
        color="#8C7853"
        speed={2}
        name="Mercury"
      />
      
      {/* Venus */}
      <Planet
        distance={7}
        size={0.9}
        color="#FFC649"
        speed={1.5}
        name="Venus"
      />
      
      {/* Earth */}
      <Planet
        distance={10}
        size={1}
        color="#4169E1"
        speed={1}
        name="Earth"
      />
      
      {/* Mars */}
      <Planet
        distance={13}
        size={0.5}
        color="#CD5C5C"
        speed={0.8}
        name="Mars"
      />
      
      {/* Asteroid Belt */}
      <AsteroidBelt innerRadius={15} outerRadius={17} />
      
      {/* Jupiter */}
      <Planet
        distance={20}
        size={2}
        color="#DAA520"
        speed={0.4}
        name="Jupiter"
      />
      
      {/* Saturn */}
      <Planet
        distance={25}
        size={1.7}
        color="#F4E99B"
        speed={0.3}
        name="Saturn"
        hasRing={true}
      />
      
      {/* Uranus */}
      <Planet
        distance={30}
        size={1.2}
        color="#4FD0E0"
        speed={0.2}
        name="Uranus"
      />
      
      {/* Neptune */}
      <Planet
        distance={35}
        size={1.1}
        color="#4169E1"
        speed={0.15}
        name="Neptune"
      />
    </>
  );
};

// Solar System Canvas wrapper
interface SolarSystemCanvasProps {
  className?: string;
}

const SolarSystemCanvas: React.FC<SolarSystemCanvasProps> = ({ className }) => {
  return (
    <div className={className} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <Canvas
        camera={{ position: [0, 20, 40], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000814']} />
        
        <SolarSystem />
        
        <Stars
          radius={300}
          depth={60}
          count={5000}
          factor={7}
          saturation={0}
          fade
          speed={1}
        />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={10}
          maxDistance={100}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default SolarSystemCanvas;
