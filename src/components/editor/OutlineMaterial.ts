import * as THREE from 'three';

/**
 * Custom Inverted Hull Outline Material
 * Uses vertex normal expansion in model space to create a consistent border.
 * Optimized for hierarchical models in the Vorld editor.
 */
export function createOutlineMaterial(color: string = '#10b981', thickness: number = 0.02) {
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });

  // Inject vertex shader logic for consistent thickness
  material.onBeforeCompile = (shader) => {
    shader.uniforms.outlineThickness = { value: thickness };
    
    shader.vertexShader = `
      uniform float outlineThickness;
      ${shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         // Expand vertices along their normals in model space
         // To make it consistent across scales, we'd need world-space normals,
         // but for a premium 'software' feel, model-space expansion on the primitive is often preferred.
         transformed += normal * outlineThickness;
        `
      )}
    `;
  };

  return material;
}
