import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  CAT_COLOR_HEX,
  COUNTRY_COORDS,
  COUNTRY_LABELS,
  COUNTRY_OPTIONS,
  type Country,
} from "../data";
import type { CountryStat } from "./useCountryNewsStats";

const DIM_COLOR = 0x3a4a52;
const TILT_X = 0.35;
const ROTATE_SPEED = 0.008;
const AUTO_ROTATE_SPEED = 0.0022; // ~1 turn per 90s at 60fps
const BUBBLE_WIDTH = 150;
const BUBBLE_HEIGHT = 76;
const BUBBLE_GAP = 8;
const BUBBLE_STEP = BUBBLE_HEIGHT + BUBBLE_GAP;
const EDGE_MARGIN = 4;

export type Bubble = {
  name: string;
  headline: string;
  x: number;
  y: number;
  flip: boolean;
};
type GlobeApi = {
  updateHighlight: (country: Country | "all", stats: CountryStat[]) => void;
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

// A bubble flips below its anchor when there isn't room to render above it.
function isFlipped(anchorY: number): boolean {
  return anchorY < BUBBLE_HEIGHT + BUBBLE_GAP;
}
// The actual vertical span a bubble occupies once rendered -- needed because two
// bubbles can flip in opposite directions, so comparing raw anchors isn't enough
// to tell whether their boxes actually overlap.
function bubbleSpan(anchorY: number): [top: number, bottom: number] {
  return isFlipped(anchorY)
    ? [anchorY + BUBBLE_GAP, anchorY + BUBBLE_GAP + BUBBLE_HEIGHT]
    : [anchorY - BUBBLE_GAP - BUBBLE_HEIGHT, anchorY - BUBBLE_GAP];
}

// Tries the marker's true projected position first, then alternates further up/down
// from it. The tooltip doesn't need to sit at the exact map coordinate, so once the
// upper half of the globe gets crowded this spills placements into the emptier lower
// half instead of pushing boxes past the container's top edge.
function findBubbleSlot(
  anchorY: number,
  x: number,
  ch: number,
  placed: Array<{ x: number; top: number; bottom: number }>,
): { anchorY: number; top: number; bottom: number } {
  const offsets = [0, 1, -1, 2, -2, 3, -3, 4, -4].map((n) => n * BUBBLE_STEP);
  for (const offset of offsets) {
    const candidateY = anchorY + offset;
    const [top, bottom] = bubbleSpan(candidateY);
    if (top < EDGE_MARGIN || bottom > ch - EDGE_MARGIN) continue;
    const collided = placed.some(
      (p) => Math.abs(p.x - x) < BUBBLE_WIDTH && top < p.bottom && bottom > p.top,
    );
    if (!collided) return { anchorY: candidateY, top, bottom };
  }
  // ponytail: more concurrently-visible bubbles than vertical slots fit in the
  // container -- pin to the top edge rather than overflow. Rare with <=4 countries.
  const pinnedY = EDGE_MARGIN + BUBBLE_GAP + BUBBLE_HEIGHT;
  const [top, bottom] = bubbleSpan(pinnedY);
  return { anchorY: pinnedY, top, bottom };
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
// Checked once per module load, not per mount -- WebGL support doesn't change at runtime.
export const webglSupported = hasWebGL();

// Builds and drives the three.js globe: scene setup, drag/auto rotation, marker
// highlighting, and headline bubble placement. Returns a ref to attach to the
// mount element plus the bubbles to render as overlay DOM elements.
export function useGlobeScene({
  countryFilter,
  stats,
  rotBarRef,
  onRotationChange,
}: {
  countryFilter: Country | "all";
  stats: CountryStat[];
  rotBarRef: React.RefObject<HTMLDivElement | null>;
  onRotationChange: (deg: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<GlobeApi | null>(null);
  const countryFilterRef = useRef(countryFilter);
  const statsRef = useRef(stats);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const rotBar = rotBarRef.current;
    if (!wrap || !rotBar || !webglSupported) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    const w = wrap.clientWidth || 440;
    const h = wrap.clientHeight || 440;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0, 3.1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    wrap.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = TILT_X;
    let rotationY = 0.5;
    group.rotation.y = rotationY;
    scene.add(group);

    group.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1, 28, 20),
        new THREE.MeshBasicMaterial({
          color: 0x2f4a5e,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        }),
      ),
    );

    const gridPositions: number[] = [];
    for (let lat = -80; lat <= 80; lat += 10) {
      for (let lon = 0; lon < 360; lon += 10) {
        const phi = ((90 - lat) * Math.PI) / 180;
        const theta = ((lon + 180) * Math.PI) / 180;
        gridPositions.push(
          -Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta),
        );
      }
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(gridPositions, 3),
    );
    group.add(
      new THREE.Points(
        dotGeo,
        new THREE.PointsMaterial({
          color: 0x5fb8d6,
          size: 0.012,
          transparent: true,
          opacity: 0.55,
        }),
      ),
    );

    const markerMeshes: Record<
      Country,
      THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
    > = {} as Record<Country, THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>>;
    COUNTRY_OPTIONS.forEach((country) => {
      const [lat, lon] = COUNTRY_COORDS[country];
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lon + 180) * Math.PI) / 180;
      const rad = 1.02;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 14, 14),
        new THREE.MeshBasicMaterial({ color: DIM_COLOR }),
      );
      mesh.position.set(
        -rad * Math.sin(phi) * Math.cos(theta),
        rad * Math.cos(phi),
        rad * Math.sin(phi) * Math.sin(theta),
      );
      group.add(mesh);
      markerMeshes[country] = mesh;
    });

    const renderThree = () => renderer.render(scene, camera);

    const computeBubbles = (activeCountry: Country | "all", activeStats: CountryStat[]) => {
      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;
      const next: Bubble[] = [];
      const visibleStats = activeStats.filter(
        (stat) => activeCountry === "all" || stat.country === activeCountry,
      );
      visibleStats.forEach((stat) => {
        const worldPos = new THREE.Vector3();
        markerMeshes[stat.country].getWorldPosition(worldPos);
        if (worldPos.z < 0.15) return;
        const proj = worldPos.clone().project(camera);
        if (proj.x < -0.92 || proj.x > 0.92 || proj.y < -0.92 || proj.y > 0.92)
          return;
        next.push({
          name: COUNTRY_LABELS[stat.country],
          headline: stat.headline,
          x: clamp((proj.x * 0.5 + 0.5) * cw, BUBBLE_WIDTH / 2 + EDGE_MARGIN, cw - BUBBLE_WIDTH / 2 - EDGE_MARGIN),
          y: (1 - (proj.y * 0.5 + 0.5)) * ch,
          flip: false,
        });
      });
      next.sort((a, b) => a.x - b.x);
      const placed: Array<{ x: number; top: number; bottom: number }> = [];
      next.forEach((b) => {
        const slot = findBubbleSlot(b.y, b.x, ch, placed);
        b.y = slot.anchorY;
        b.flip = isFlipped(slot.anchorY);
        placed.push({ x: b.x, top: slot.top, bottom: slot.bottom });
      });
      setBubbles(next);
    };

    const updateHighlight = (activeCountry: Country | "all", activeStats: CountryStat[]) => {
      const statByCountry = new Map(activeStats.map((s) => [s.country, s]));
      COUNTRY_OPTIONS.forEach((country) => {
        const mesh = markerMeshes[country];
        const stat = statByCountry.get(country);
        mesh.visible = !!stat;
        if (!stat) return;
        const countryActive = activeCountry === "all" || country === activeCountry;
        mesh.material.color.set(countryActive ? CAT_COLOR_HEX[stat.dominant] : DIM_COLOR);
        mesh.scale.setScalar(countryActive ? 1 : 0.6);
      });
      renderThree();
      computeBubbles(activeCountry, activeStats);
    };
    apiRef.current = { updateHighlight };

    const applyFrame = () => {
      group.rotation.y = rotationY;
      renderThree();
      computeBubbles(countryFilterRef.current, statsRef.current);
      onRotationChange(
        Math.round(((((rotationY * 180) / Math.PI) % 360) + 360) % 360),
      );
    };

    let dragging = false;
    let lastX = 0;
    let animId = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const spin = () => {
      if (!dragging) {
        rotationY += AUTO_ROTATE_SPEED;
        applyFrame();
      }
      animId = requestAnimationFrame(spin);
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      rotationY += dx * ROTATE_SPEED;
      applyFrame();
    };
    const onUp = () => {
      dragging = false;
    };
    wrap.addEventListener("pointerdown", onDown);
    rotBar.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const resizeObserver = new ResizeObserver(() => {
      const rw = wrap.clientWidth;
      const rh = wrap.clientHeight;
      if (!rw || !rh) return;
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh);
      renderThree();
      computeBubbles(countryFilterRef.current, statsRef.current);
    });
    resizeObserver.observe(wrap);

    renderThree();
    updateHighlight(countryFilterRef.current, statsRef.current);
    onRotationChange(
      Math.round(((((rotationY * 180) / Math.PI) % 360) + 360) % 360),
    );
    if (!reduceMotion) animId = requestAnimationFrame(spin);

    return () => {
      wrap.removeEventListener("pointerdown", onDown);
      rotBar.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      resizeObserver.disconnect();
      if (animId) cancelAnimationFrame(animId);
      renderer.dispose();
      if (renderer.domElement.parentNode === wrap)
        wrap.removeChild(renderer.domElement);
      apiRef.current = null;
    };
    // Scene is built once; countryFilter/stats are read via refs so drag/resize
    // handlers created here always see the latest value without re-mounting three.js.
    // rotBarRef/onRotationChange are expected to stay referentially stable across
    // renders (a useRef object and a useState setter, respectively).
  }, [rotBarRef, onRotationChange]);

  useEffect(() => {
    countryFilterRef.current = countryFilter;
    statsRef.current = stats;
    apiRef.current?.updateHighlight(countryFilter, stats);
  }, [countryFilter, stats]);

  return { wrapRef, bubbles };
}
