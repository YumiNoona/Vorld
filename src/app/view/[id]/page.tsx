"use client";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  Stage, 
  useGLTF, 
  PerspectiveCamera,
  Environment,
  ContactShadows,
  BakeShadows
} from "@react-three/drei";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

function ViewerModel({ url, interactions }: { url: string, interactions: any }) {
  const { nodes } = useGLTF(url) as any;
  
  return (
    <group dispose={null} scale={2}>
      {Object.entries(nodes).map(([name, node]: [string, any]) => {
        if (node.isMesh) {
          return (
            <mesh
              key={name}
              geometry={node.geometry}
              material={node.material}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                // Handle interactions here later
                console.log("Clicked mesh:", name, interactions[name]);
              }}
            />
          );
        }
        return null;
      })}
    </group>
  );
}

export default function ViewPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError(error?.message || "Project not found or private");
      } else {
        setProject(data);
      }
      setLoading(false);
    }
    loadProject();
  }, [id, supabase]);

  const modelUrl = useMemo(() => {
    if (!project?.model_path) return null;
    return supabase.storage.from('models').getPublicUrl(project.model_path).data.publicUrl;
  }, [project, supabase]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-text-secondary max-w-md">
          This project might be private or doesn't exist. Please contact the owner for access.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0d0d0d] overflow-hidden relative">
      {/* Branding Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
             <span className="text-white font-bold text-sm italic">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight">{project.name}</span>
            <span className="text-[10px] text-text-tertiary uppercase tracking-widest">Built with Vorld</span>
          </div>
        </div>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera 
          makeDefault 
          position={project.settings?.camera?.position || [0, 2, 5]} 
          fov={45} 
        />
        <ambientLight intensity={0.5} />
        
        <Suspense fallback={null}>
          <Stage environment="studio" intensity={0.5} shadows={false} adjustCamera={false}>
            {modelUrl && <ViewerModel url={modelUrl} interactions={project.interactions || {}} />}
          </Stage>
          <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={10} blur={2.5} far={0.8} />
          <Environment preset="city" />
          <BakeShadows />
        </Suspense>

        <OrbitControls 
          makeDefault 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5} 
          target={project.settings?.camera?.target || [0, 0, 0]}
        />
      </Canvas>

      {/* Powered by tag */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/5 flex items-center gap-2">
         <span className="text-[10px] text-text-tertiary font-medium">Powered by</span>
         <span className="text-[10px] text-white font-bold tracking-tighter uppercase">Vorld 3D</span>
      </div>
    </div>
  );
}
