import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Plane } from '@react-three/drei';
import { SeismicEvent } from '../src/services/SeismicService';
import * as THREE from 'three';

interface Props {
  events: SeismicEvent[];
}

const EventPoint = ({ event, position, color, size, onHover }: any) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (mesh.current && hovered) {
      mesh.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 5) * 0.2);
    } else if (mesh.current) {
      mesh.current.scale.setScalar(1);
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); onHover(event); }}
      onPointerOut={() => { setHover(false); onHover(null); }}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.8} />
    </mesh>
  );
};

const Map3D = ({ centerLat, centerLon, scale }: { centerLat: number, centerLon: number, scale: number }) => {
    const [geoData, setGeoData] = useState<any>(null);

    useEffect(() => {
        // High-res world map
        fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
            .then(response => response.json())
            .then(data => {
                setGeoData(data);
            });
    }, []);

    const { shapes, lines } = useMemo(() => {
        if (!geoData) return { shapes: [], lines: [] };
        const allShapes: THREE.Shape[] = [];
        const allLines: THREE.Vector3[][] = [];

        // We'll render everything, but Three.js frustum culling will help.
        // To optimize, we could filter by distance to center, but let's try rendering all for a global view.
        geoData.features.forEach((feature: any) => {
            const processPolygon = (coords: any[]) => {
                const shape = new THREE.Shape();
                const points: THREE.Vector3[] = [];
                
                coords.forEach((coord: any, index: number) => {
                    const [lon, lat] = coord;
                    const x = (lon - centerLon) * scale;
                    const y = (lat - centerLat) * scale; // 2D shape Y maps to 3D Z later
                    
                    if (index === 0) {
                        shape.moveTo(x, y);
                    } else {
                        shape.lineTo(x, y);
                    }
                    
                    // For the outline
                    points.push(new THREE.Vector3(x, 0.21, -y));
                });
                allShapes.push(shape);
                allLines.push(points);
            };

            if (feature.geometry?.type === 'Polygon') {
                feature.geometry.coordinates.forEach(processPolygon);
            } else if (feature.geometry?.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach((polygon: any) => {
                    polygon.forEach(processPolygon);
                });
            }
        });

        return { shapes: allShapes, lines: allLines };
    }, [geoData, centerLat, centerLon, scale]);

    return (
        <group>
            {/* 3D Extruded Landmasses */}
            <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                {shapes.map((shape, i) => (
                    <mesh key={`shape-${i}`}>
                        <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: false }]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.8} />
                    </mesh>
                ))}
            </group>
            
            {/* Coastline Outlines */}
            {lines.map((points, i) => (
                <Line 
                    key={`line-${i}`} 
                    points={points} 
                    color="#334155" 
                    lineWidth={1} 
                    transparent
                    opacity={0.8}
                />
            ))}
        </group>
    );
};

const Seismic3DScene: React.FC<{ events: SeismicEvent[], setTooltip: (e: any) => void }> = ({ events, setTooltip }) => {
  const { points, centerLat, centerLon, scale } = useMemo(() => {
    if (events.length === 0) return { points: [], centerLat: 0, centerLon: 0, scale: 1 };

    const lats = events.map(e => e.lat);
    const lons = events.map(e => e.lon);
    
    // Default to roughly Caribbean center if no events, but here we have events
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    // Scale factors
    const scale = 10 / Math.max(maxLat - minLat, maxLon - minLon);

    const points = events.map(e => {
        const x = (e.lon - centerLon) * scale;
        const z = -(e.lat - centerLat) * scale;
        const y = -((e.depth || 0) * 0.05); // Depth exaggeration

        const mag = e.magnitude || 0;
        const size = Math.max(0.05, mag * 0.05);
        
        const color = mag >= 7 ? '#ef4444' : 
                      mag >= 5 ? '#f97316' : 
                      mag >= 3 ? '#fbbf24' : '#22c55e';

        return { position: [x, y, z] as [number, number, number], color, size, event: e };
    });

    return { points, centerLat, centerLon, scale };
  }, [events]);

  return (
    <group>
      {/* Map Layer */}
      <Map3D centerLat={centerLat} centerLon={centerLon} scale={scale} />

      {/* Water Surface */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.4} side={THREE.DoubleSide} />
      </Plane>
      
      {/* Events */}
      {points.map((p, i) => (
        <EventPoint 
            key={p.event.id} 
            {...p} 
            onHover={(e: SeismicEvent | null) => setTooltip(e ? { event: e, x: p.position[0], y: p.position[1] } : null)} 
        />
      ))}
      
      {/* Reference Grid (Sea Level) */}
      <gridHelper args={[50, 50, 0x1e293b, 0x0f172a]} position={[0, -0.01, 0]} />
      
      {/* Depth Axis Indicator */}
      <group position={[10, -5, 10]}>
         <Line points={[[0, 0, 0], [0, 10, 0]]} color="#334155" lineWidth={1} />
         {/* Ticks could go here */}
      </group>
    </group>
  );
};

// ... imports

// ... EventPoint component

// ... Map3D component

// ... Seismic3DScene component

const Seismic3DViewer: React.FC<Props> = ({ events }) => {
  const [tooltip, setTooltip] = useState<{ event: SeismicEvent, x: number, y: number } | null>(null);

  // Calculate Estimated Surface Intensity (Modified Mercalli Intensity - MMI)
  // This is a simplified attenuation model: I = c1 * M - c2 * log10(Depth) + c3
  // Generally, shallower earthquakes produce stronger shaking at the epicenter.
  const calculateIntensity = (mag: number, depth: number) => {
    // Prevent log(0) or negative depth issues
    const d = Math.max(depth, 1); 
    
    // Gutenberg-Richter / Esteva approximations (simplified for visualization)
    // Intensity decreases as depth increases.
    // Base intensity from magnitude
    let intensity = 1.5 * mag - 0.003 * d - 1.5 * Math.log10(d) + 1.5;
    
    // Clamp to 1-10 range (I to X+)
    return Math.min(Math.max(intensity, 1), 10);
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity < 2) return 'I - Not Felt';
    if (intensity < 3) return 'II - Weak';
    if (intensity < 4) return 'III - Weak';
    if (intensity < 5) return 'IV - Light';
    if (intensity < 6) return 'V - Moderate';
    if (intensity < 7) return 'VI - Strong';
    if (intensity < 8) return 'VII - Very Strong';
    if (intensity < 9) return 'VIII - Severe';
    return 'IX+ - Violent';
  };

  return (
    <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-slate-200 font-display font-medium">3D Hypocenter View</h3>
        <p className="text-slate-500 text-xs">Rotate to explore depth distribution</p>
      </div>

      <Canvas camera={{ position: [0, 10, 15], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 20, 10]} intensity={1} />
        <spotLight position={[-10, 10, -10]} angle={0.3} penumbra={1} intensity={0.5} castShadow />
        
        <Seismic3DScene events={events} setTooltip={setTooltip} />
        
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 1.5} />
      </Canvas>

      {tooltip && (
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur p-3 rounded-lg border border-slate-700 shadow-xl text-xs z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-2 w-64">
             <div className="font-bold text-slate-200 mb-1">{tooltip.event.location}</div>
             <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                <div>
                    <span className="text-slate-500 block">Magnitude</span>
                    <span className="font-mono font-bold text-orange-500">M{tooltip.event.magnitude?.toFixed(1)}</span>
                </div>
                <div>
                    <span className="text-slate-500 block">Depth</span>
                    <span className="font-mono font-bold text-blue-400">{tooltip.event.depth} km</span>
                </div>
             </div>
             
             <div className="border-t border-slate-700 pt-2 mt-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Est. Surface Intensity</span>
                    <span className="font-bold text-emerald-400">{calculateIntensity(tooltip.event.magnitude || 0, tooltip.event.depth || 0).toFixed(1)}</span>
                </div>
                <div className="text-[10px] text-slate-500 italic">
                    {getIntensityLabel(calculateIntensity(tooltip.event.magnitude || 0, tooltip.event.depth || 0))}
                </div>
                <div className="mt-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500" 
                        style={{ width: `${(calculateIntensity(tooltip.event.magnitude || 0, tooltip.event.depth || 0) / 10) * 100}%` }}
                    />
                </div>
                <p className="text-[9px] text-slate-600 mt-1">
                    *Shallower events generally cause stronger surface shaking than deeper ones of the same magnitude.
                </p>
             </div>
        </div>
      )}
    </div>
  );
};

export default Seismic3DViewer;
