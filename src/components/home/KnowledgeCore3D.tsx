'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface KnowledgeCore3DProps {
  className?: string;
}

const orbitDefinitions = [
  { radius: 1.28, color: 0xffc857, opacity: 0.7, rotation: [0.8, 0.15, 0.3] as const },
  { radius: 1.58, color: 0xff8b32, opacity: 0.5, rotation: [1.3, 0.2, -0.55] as const },
  { radius: 1.9, color: 0xffe5a1, opacity: 0.28, rotation: [0.35, 0.9, 0.75] as const },
];

export function KnowledgeCore3D({ className = '' }: KnowledgeCore3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 7.1);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const artwork = new THREE.Group();
    scene.add(artwork);

    scene.add(new THREE.AmbientLight(0xffd99b, 1.25));

    const keyLight = new THREE.PointLight(0xffb638, 38, 12);
    keyLight.position.set(-2.3, 2.5, 3.2);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xff6328, 28, 10);
    rimLight.position.set(2.8, -1.5, -2);
    scene.add(rimLight);

    const core = new THREE.Group();
    artwork.add(core);

    const crystal = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.73, 2),
      new THREE.MeshPhysicalMaterial({
        color: 0xffc45b,
        emissive: 0x9a3c08,
        emissiveIntensity: 0.65,
        metalness: 0.72,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.16,
      }),
    );
    core.add(crystal);

    const wireShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.94, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffdc91,
        wireframe: true,
        transparent: true,
        opacity: 0.17,
      }),
    );
    core.add(wireShell);

    const coreHalo = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff9b36,
        transparent: true,
        opacity: 0.045,
        side: THREE.BackSide,
      }),
    );
    core.add(coreHalo);

    const orbits: THREE.Group[] = [];
    orbitDefinitions.forEach((definition, orbitIndex) => {
      const orbit = new THREE.Group();
      orbit.rotation.set(definition.rotation[0], definition.rotation[1], definition.rotation[2]);
      artwork.add(orbit);
      orbits.push(orbit);

      const path = new THREE.Mesh(
        new THREE.TorusGeometry(definition.radius, 0.007, 8, 180),
        new THREE.MeshBasicMaterial({
          color: definition.color,
          transparent: true,
          opacity: definition.opacity,
        }),
      );
      orbit.add(path);

      const nodeCount = orbitIndex === 2 ? 3 : 4;
      for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
        const angle = (Math.PI * 2 * nodeIndex) / nodeCount + orbitIndex * 0.58;
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(orbitIndex === 0 && nodeIndex === 0 ? 0.085 : 0.052, 16, 16),
          new THREE.MeshStandardMaterial({
            color: nodeIndex % 2 === 0 ? 0xffe6a5 : 0xffa83e,
            emissive: 0xff8a1f,
            emissiveIntensity: 1.2,
            metalness: 0.25,
            roughness: 0.28,
          }),
        );
        node.position.set(Math.cos(angle) * definition.radius, Math.sin(angle) * definition.radius, 0);
        orbit.add(node);
      }
    });

    const dustPositions = new Float32Array(330);
    for (let index = 0; index < dustPositions.length; index += 3) {
      dustPositions[index] = (Math.random() - 0.5) * 5.8;
      dustPositions[index + 1] = (Math.random() - 0.5) * 5.8;
      dustPositions[index + 2] = (Math.random() - 0.5) * 2.4;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        color: 0xffd58a,
        size: 0.018,
        transparent: true,
        opacity: 0.48,
        sizeAttenuation: true,
      }),
    );
    artwork.add(dust);

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.position.z = width < 500 ? 8 : 7.1;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (reduceMotion && isVisible) renderer.render(scene, camera);
    });
    resizeObserver.observe(container);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId: number | null = null;
    let isVisible = false;
    const render = (time: number) => {
      if (!isVisible) {
        frameId = null;
        return;
      }

      const seconds = time * 0.001;
      if (!reduceMotion) {
        artwork.rotation.y = Math.sin(seconds * 0.16) * 0.16;
        artwork.rotation.x = Math.sin(seconds * 0.12) * 0.06;
        core.rotation.y = seconds * 0.2;
        core.rotation.x = Math.sin(seconds * 0.28) * 0.12;
        core.scale.setScalar(1 + Math.sin(seconds * 1.15) * 0.025);
        orbits.forEach((orbit, index) => {
          orbit.rotation.z += (index % 2 === 0 ? 1 : -1) * 0.0008 * (index + 1);
        });
        dust.rotation.z = seconds * 0.012;
      }
      renderer.render(scene, camera);
      if (!reduceMotion) frameId = window.requestAnimationFrame(render);
      else frameId = null;
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && frameId === null) {
        if (reduceMotion) render(0);
        else frameId = window.requestAnimationFrame(render);
      } else if (!isVisible && frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    });
    visibilityObserver.observe(container);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`} aria-hidden="true" />;
}