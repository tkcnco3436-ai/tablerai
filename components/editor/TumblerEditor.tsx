"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getSpecs, CONTACT_EMAIL } from "@/lib/specs";
import { useLang } from "@/lib/i18n";

const SWATCHES = [
  "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff", "#d1d5db", "#6b7280", "#1f2937", "#78350f", "#0c4a6e",
];
const TEX_SIZE = 1024;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// 방향 인덱스: 분할 시 머티리얼 배열 순서와 동일
const DIRS = [
  { key: "front", label: "앞면", labelEn: "Front" },
  { key: "back", label: "뒷면", labelEn: "Back" },
  { key: "right", label: "오른쪽면", labelEn: "Right" },
  { key: "left", label: "왼쪽면", labelEn: "Left" },
  { key: "top", label: "윗면", labelEn: "Top" },
  { key: "bottom", label: "아랫면", labelEn: "Bottom" },
] as const;
type DirKey = (typeof DIRS)[number]["key"];
const DIR_INDEX: Record<string, number> = {
  front: 0, back: 1, right: 2, left: 3, top: 4, bottom: 5,
};
const dirLabel = (key: string, lang: "ko" | "en"): string => {
  const d = DIRS.find((x) => x.key === key);
  return d ? (lang === "ko" ? d.label : d.labelEn) : key;
};

type Compose = { x: number; y: number; scale: number; rotation: number };
type LightCfg = {
  intensity: number;
  angle: number;
  height: number;
  color: string;
};
type Lights = {
  ambient: number;
  key: LightCfg;
  fill: LightCfg;
  back: LightCfg;
};
// 3점 조명 기본값: 키(주광) 45°, 필(보조) 반대측 낮게, 백(역광) 뒤 높게
const DEFAULT_LIGHTS: Lights = {
  ambient: 0.5,
  key: { intensity: 1.4, angle: 45, height: 6, color: "#ffffff" },
  fill: { intensity: 0.5, angle: 315, height: 3, color: "#ffffff" },
  back: { intensity: 0.8, angle: 180, height: 7, color: "#ffffff" },
};
const LIGHTS_KEY = "tabler-editor:lights:v2";

type TexMapKey = "none" | "grain" | "cell";
type Surface = {
  roughness: number;
  metalness: number;
  texMap: TexMapKey;
  bumpScale: number;
  envIntensity: number;
};
// 기본: 무광 플라스틱 (플라스틱 러프) + 미세 입자 범프
const DEFAULT_SURFACE: Surface = {
  roughness: 0.85,
  metalness: 0.05,
  texMap: "grain",
  bumpScale: 0.3,
  envIntensity: 0.6,
};
const SURFACE_KEY = "tabler-editor:surface:v2";
const TEX_MAPS: { key: TexMapKey; label: string; labelEn: string; url: string | null }[] = [
  { key: "none", label: "없음", labelEn: "None", url: null },
  { key: "grain", label: "미세 입자", labelEn: "Fine grain", url: "/img/txmap2.jpg" },
  { key: "cell", label: "셀 패턴", labelEn: "Cell pattern", url: "/img/txmap1.jpg" },
];
const SURFACE_PRESETS: { label: string; labelEn: string; value: Partial<Surface> & { roughness: number; metalness: number } }[] = [
  { label: "무광 플라스틱", labelEn: "Matte plastic", value: { roughness: 0.85, metalness: 0.05 } },
  { label: "광택 플라스틱", labelEn: "Glossy plastic", value: { roughness: 0.25, metalness: 0.05 } },
  { label: "새틴", labelEn: "Satin", value: { roughness: 0.55, metalness: 0.3 } },
  { label: "금속", labelEn: "Metal", value: { roughness: 0.35, metalness: 0.9 } },
];
const LIGHT_NAMES = [
  { key: "key", label: "키 라이트 (주광)", labelEn: "Key light (main)" },
  { key: "fill", label: "필 라이트 (보조광)", labelEn: "Fill light" },
  { key: "back", label: "백 라이트 (역광)", labelEn: "Back light (rim)" },
] as const;
const lightPos = (cfg: LightCfg): [number, number, number] => [
  7 * Math.cos((cfg.angle * Math.PI) / 180),
  cfg.height,
  7 * Math.sin((cfg.angle * Math.PI) / 180),
];
type SavedState = {
  hex?: string;
  compose?: Compose;
  targets?: string[];
  image?: string | null;
};

type Axis = "x" | "y" | "z";

// 단위 축 벡터의 지배 축/부호로 0..1 정규화 투영
function projOnAxis(
  p: THREE.Vector3,
  vec: THREE.Vector3,
  min: THREE.Vector3,
  max: THREE.Vector3,
  size: THREE.Vector3
) {
  const a: Axis =
    Math.abs(vec.x) > 0.5 ? "x" : Math.abs(vec.y) > 0.5 ? "y" : "z";
  const sz = size[a] || 1;
  return vec[a] >= 0 ? (p[a] - min[a]) / sz : (max[a] - p[a]) / sz;
}

// 삼각형 법선과 dirVecs 내적 최대값으로 6방향 분류 → 지오메트리 그룹 + 방향별 머티리얼 6개.
// UV는 모델 전체 월드 바운딩박스 기준 방향별 평면 투영 (메시 간 로고 위치 일관).
function splitMeshByDirection(
  mesh: THREE.Mesh,
  worldBox: THREE.Box3,
  dirVecs: THREE.Vector3[],
  uvDirs: { u: THREE.Vector3; v: THREE.Vector3 }[]
) {
  if (mesh.userData.__dirSplit) return;
  mesh.userData.__dirSplit = true;

  let geo = (mesh.geometry as THREE.BufferGeometry).clone();
  if (geo.index) geo = geo.toNonIndexed();

  mesh.updateWorldMatrix(true, false);
  const mw = mesh.matrixWorld;
  const nm = new THREE.Matrix3().getNormalMatrix(mw);

  const pos = geo.getAttribute("position");
  const triCount = pos.count / 3;
  const buckets = new Array<number>(triCount);
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let t = 0; t < triCount; t++) {
    va.fromBufferAttribute(pos, t * 3);
    vb.fromBufferAttribute(pos, t * 3 + 1);
    vc.fromBufferAttribute(pos, t * 3 + 2);
    ab.subVectors(vb, va);
    ac.subVectors(vc, va);
    n.crossVectors(ab, ac).applyMatrix3(nm);
    let best = 0;
    let bestDot = -Infinity;
    for (let d = 0; d < 6; d++) {
      const dot = n.dot(dirVecs[d]);
      if (dot > bestDot) {
        bestDot = dot;
        best = d;
      }
    }
    buckets[t] = best;
  }

  // 방향별로 삼각형 재배열 → 그룹 연속 구간 확보
  const order = Array.from({ length: triCount }, (_, i) => i).sort(
    (p, q) => buckets[p] - buckets[q]
  );

  const newGeo = new THREE.BufferGeometry();
  for (const name of Object.keys(geo.attributes)) {
    const src = geo.getAttribute(name) as THREE.BufferAttribute;
    const item = src.itemSize;
    const srcArr = src.array as Float32Array;
    const dst = new Float32Array(pos.count * item);
    order.forEach((t, ti) => {
      for (let v = 0; v < 3; v++) {
        for (let k = 0; k < item; k++) {
          dst[(ti * 3 + v) * item + k] = srcArr[(t * 3 + v) * item + k];
        }
      }
    });
    newGeo.setAttribute(name, new THREE.BufferAttribute(dst, item));
  }

  newGeo.clearGroups();
  let start = 0;
  for (let d = 0; d < 6; d++) {
    const count = buckets.filter((bk) => bk === d).length * 3;
    if (count) newGeo.addGroup(start, count, d);
    start += count;
  }

  // 방향별 평면 UV (월드 좌표, flipY=false 기준 캔버스 상단 = 면 위쪽)
  const size = new THREE.Vector3();
  worldBox.getSize(size);
  const min = worldBox.min;
  const max = worldBox.max;
  const posNew = newGeo.getAttribute("position");
  const uv = new Float32Array(posNew.count * 2);
  const wp = new THREE.Vector3();
  order.forEach((t, ti) => {
    const d = buckets[t];
    for (let v = 0; v < 3; v++) {
      const i = ti * 3 + v;
      wp.fromBufferAttribute(posNew as THREE.BufferAttribute, i).applyMatrix4(mw);
      uv[i * 2] = projOnAxis(wp, uvDirs[d].u, min, max, size);
      uv[i * 2 + 1] = projOnAxis(wp, uvDirs[d].v, min, max, size);
    }
  });
  newGeo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

  mesh.geometry = newGeo;
  const base = (
    Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  ) as THREE.MeshStandardMaterial;
  mesh.material = DIRS.map(() => base.clone());
}

// 제품 방향 감지 — fix 모델 기준으로 전 모델 통일:
// - 앞뒤 법선 = X축 고정. 박스의 가로로 긴 면(래치 있는 넓은 면)이 앞면.
//   (테이블이 X로 펼쳐지는 table/extention에서 bbox 비율로 축을 추정하면
//    fix와 반대로 뒤집혀서 고정축 사용)
// - hinge_bracket(테이블 접합부)이 있는 쪽 = 뒷면
function detectOrientation(scene: THREE.Object3D, worldBox: THREE.Box3) {
  const center = new THREE.Vector3();
  worldBox.getCenter(center);

  const frontAxis: Axis = "x";

  let backSign = 1; // 기본: fix 기준 +X가 뒷면 (힌지 쪽)
  for (const marker of ["hinge_bracket", "Tabler_table"]) {
    const markerBox = new THREE.Box3();
    let found = false;
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.name.includes(marker)) {
        markerBox.expandByObject(o);
        found = true;
      }
    });
    if (found) {
      const mc = new THREE.Vector3();
      markerBox.getCenter(mc);
      const off = mc[frontAxis] - center[frontAxis];
      if (Math.abs(off) > 1e-6) {
        backSign = Math.sign(off);
        break;
      }
    }
  }

  const axisVec = (a: Axis, s: number) =>
    new THREE.Vector3(a === "x" ? s : 0, a === "y" ? s : 0, a === "z" ? s : 0);

  const up = new THREE.Vector3(0, 1, 0);
  const front = axisVec(frontAxis, -backSign); // 앞면 = 테이블 반대쪽
  const back = front.clone().negate();
  const right = up.clone().cross(front); // 앞면을 바라봤을 때 화면 오른쪽
  const left = right.clone().negate();
  const down = up.clone().negate();

  // DIRS 순서: front, back, right, left, top, bottom
  const dirVecs = [front, back, right, left, up, down];
  const uvDirs = [
    { u: right.clone(), v: down.clone() }, // 앞면: 좌→우, 위→아래
    { u: left.clone(), v: down.clone() }, // 뒷면 (밖에서 보면 좌우 반전)
    { u: back.clone(), v: down.clone() }, // 오른쪽면
    { u: front.clone(), v: down.clone() }, // 왼쪽면
    { u: right.clone(), v: front.clone() }, // 윗면: 캔버스 아래 = 앞쪽
    { u: right.clone(), v: back.clone() }, // 아랫면
  ];
  return { dirVecs, uvDirs };
}

function GlBridge({
  glRef,
}: {
  glRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
}) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    glRef.current = gl;
  }, [gl, glRef]);
  return null;
}

function Model({
  url,
  onReady,
}: {
  url: string;
  onReady: (meshes: THREE.Mesh[]) => void;
}) {
  const { scene } = useGLTF(url);
  // Center가 측정하기 전에 끝나야 해서 layout effect 사용
  useLayoutEffect(() => {
    scene.updateWorldMatrix(true, true);
    const worldBox = new THREE.Box3().setFromObject(scene);
    const { dirVecs, uvDirs } = detectOrientation(scene, worldBox);
    const meshes: THREE.Mesh[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      splitMeshByDirection(mesh, worldBox, dirVecs, uvDirs);
      meshes.push(mesh);
    });
    // 크기 정규화: 최장축 2유닛 — 고정 카메라 거리에 맞춤
    // (모델 원본이 cm 단위라 87유닛 → 카메라가 모델 안에 파묻혀 빈 화면)
    const size = new THREE.Vector3();
    worldBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) scene.scale.multiplyScalar(2 / maxDim);
    onReady(meshes);
  }, [scene, onReady]);
  return <primitive object={scene} />;
}

export default function TumblerEditor() {
  const { lang, t } = useLang();
  // ----- UI state -----
  const [models, setModels] = useState<string[]>([]);
  const [modelUrl, setModelUrlState] = useState("");
  const [ready, setReady] = useState(false);
  const [target, setTargetState] = useState("all");
  const [tab, setTab] = useState<"color" | "image" | "light" | "surface">("color");
  const [lights, setLights] = useState(DEFAULT_LIGHTS);
  const [surface, setSurface] = useState<Surface>(DEFAULT_SURFACE);
  const surfaceRef = useRef<Surface>(DEFAULT_SURFACE);
  const [hex, setHexState] = useState("#3b82f6");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageApplied, setImageApplied] = useState(false);
  const [compose, setComposeState] = useState<Compose>({ x: 0.5, y: 0.5, scale: 0.4, rotation: 0 });
  const [dragover, setDragover] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ----- mutable refs (three.js side) -----
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const imageTargetsRef = useRef<Set<string>>(new Set());
  const composeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dataUrlRef = useRef<string | null>(null);
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const hexRef = useRef(hex);
  const composeRef = useRef(compose);
  const imageLoadedRef = useRef(false);
  const targetRef = useRef(target);
  const modelUrlRef = useRef(modelUrl);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const initializedRef = useRef(false);

  const setModelUrl = (u: string) => {
    modelUrlRef.current = u;
    setModelUrlState(u);
  };
  const setCompose = (updater: Compose | ((c: Compose) => Compose)) => {
    setComposeState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      composeRef.current = next;
      return next;
    });
  };

  // 해당 방향의 머티리얼들 (모든 메시의 material[dirIndex])
  const materialsFor = (dirKey: string): THREE.MeshStandardMaterial[] =>
    meshesRef.current
      .map((mesh) => (mesh.material as THREE.MeshStandardMaterial[])[DIR_INDEX[dirKey]])
      .filter(Boolean);

  const selectionKeys = (): string[] =>
    targetRef.current === "all" ? DIRS.map((d) => d.key) : [targetRef.current];

  // 부위 선택 + 해당 면 잠깐 하이라이트
  const selectTarget = (key: string) => {
    targetRef.current = key;
    setTargetState(key);
    const keys = key === "all" ? DIRS.map((d) => d.key) : [key];
    const mats = keys.flatMap((k) => materialsFor(k));
    mats.forEach((m) => m.emissive?.set("#10b981"));
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => {
      mats.forEach((m) => m.emissive?.set("#000000"));
    }, 500);
  };

  // ----- persistence (모델 공통 — 모델 바꿔도 같은 세팅 유지) -----
  const storageKey = () => "tabler-editor:shared:v1";

  const saveState = () => {
    const state: SavedState = {
      hex: hexRef.current,
      compose: composeRef.current,
      targets: [...imageTargetsRef.current],
      image: dataUrlRef.current,
    };
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state));
    } catch {
      // 용량 초과 시 이미지 빼고 저장
      try {
        localStorage.setItem(storageKey(), JSON.stringify({ ...state, image: null }));
      } catch {}
    }
  };

  const scheduleSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveState, 300);
  };

  // ----- composite canvas (texture source + preview) -----
  const drawComposite = useCallback(() => {
    const canvas = composeCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = hexRef.current;
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
    const img = imgRef.current;
    if (!imageLoadedRef.current || !img) return;
    const c = composeRef.current;
    const w = TEX_SIZE * c.scale;
    const h = w * (img.naturalHeight / img.naturalWidth);
    ctx.save();
    ctx.translate(c.x * TEX_SIZE, c.y * TEX_SIZE);
    ctx.rotate((c.rotation * Math.PI) / 180);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }, []);

  const bake = useCallback(() => {
    const canvas = composeCanvasRef.current;
    if (!canvas || !imageTargetsRef.current.size) return;
    drawComposite();
    if (!texRef.current) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      texRef.current = tex;
    }
    texRef.current.needsUpdate = true;
    imageTargetsRef.current.forEach((key) => {
      materialsFor(key).forEach((m) => {
        if (m.map !== texRef.current) {
          m.map = texRef.current;
          m.needsUpdate = true;
        }
        m.color.set("#ffffff");
      });
    });
  }, [drawComposite]);

  // ----- color (항상 전체 적용) -----
  const applyColor = (v: string) => {
    setHexState(v);
    if (!HEX_RE.test(v)) return;
    hexRef.current = v;
    DIRS.forEach((d) => {
      if (imageTargetsRef.current.has(d.key)) return;
      materialsFor(d.key).forEach((m) => m.color.set(v));
    });
    if (imageTargetsRef.current.size) bake();
    drawComposite();
    scheduleSave();
  };

  // ----- image -----
  const handleFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      dataUrlRef.current = url;
      const img = imgRef.current ?? new Image();
      imgRef.current = img;
      img.onload = () => {
        imageLoadedRef.current = true;
        setImageLoaded(true);
        drawComposite();
        if (imageTargetsRef.current.size) bake();
        scheduleSave();
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const clearImageFrom = (keys: string[]) => {
    keys.forEach((key) => {
      materialsFor(key).forEach((m) => {
        m.map = null;
        m.color.set(hexRef.current);
        m.needsUpdate = true;
      });
    });
  };

  const applyImage = () => {
    if (!imageLoadedRef.current) return;
    clearImageFrom([...imageTargetsRef.current]);
    imageTargetsRef.current = new Set(selectionKeys());
    bake();
    setImageApplied(true);
    scheduleSave();
  };

  const removeImage = () => {
    clearImageFrom([...imageTargetsRef.current]);
    imageTargetsRef.current.clear();
    setImageApplied(false);
    scheduleSave();
  };

  // ----- model load → state restore -----
  const restoreState = useCallback((): boolean => {
    let st: SavedState | null = null;
    try {
      st = JSON.parse(localStorage.getItem(storageKey()) || "null");
    } catch {}
    if (!st) return false;
    if (st.compose) {
      composeRef.current = st.compose;
      setComposeState(st.compose);
    }
    if (st.hex && HEX_RE.test(st.hex)) {
      hexRef.current = st.hex;
      setHexState(st.hex);
    }
    DIRS.forEach((d) =>
      materialsFor(d.key).forEach((m) => m.color.set(hexRef.current))
    );
    const validTargets = (st.targets ?? []).filter((k) => DIR_INDEX[k] !== undefined);
    if (st.image && validTargets.length) {
      dataUrlRef.current = st.image;
      const img = imgRef.current ?? new Image();
      imgRef.current = img;
      img.onload = () => {
        imageLoadedRef.current = true;
        setImageLoaded(true);
        imageTargetsRef.current = new Set(validTargets);
        setImageApplied(true);
        bake();
      };
      img.src = st.image;
    } else {
      drawComposite();
    }
    return true;
  }, [bake, drawComposite]);

  const handleReady = useCallback(
    (meshes: THREE.Mesh[]) => {
      meshesRef.current = meshes;
      void applySurfaceToMeshes(surfaceRef.current);
      setReady(true);
      // 최초 1회: 저장된 세팅 복원. 이후 모델 전환: 현재 세팅 그대로 재적용
      if (!initializedRef.current) {
        initializedRef.current = true;
        if (restoreState()) return;
      }
      DIRS.forEach((d) =>
        materialsFor(d.key).forEach((m) => m.color.set(hexRef.current))
      );
      if (imageLoadedRef.current && imageTargetsRef.current.size) {
        // 이미지 입혀진 면은 새 모델 머티리얼에 텍스처 재연결
        imageTargetsRef.current.forEach((key) =>
          materialsFor(key).forEach((m) => m.color.set("#ffffff"))
        );
        bake();
      } else {
        drawComposite();
      }
    },
    [restoreState, drawComposite, bake]
  );

  // ----- lights persistence -----
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LIGHTS_KEY) || "null");
      if (saved) {
        setLights({
          ambient: saved.ambient ?? DEFAULT_LIGHTS.ambient,
          key: { ...DEFAULT_LIGHTS.key, ...saved.key },
          fill: { ...DEFAULT_LIGHTS.fill, ...saved.fill },
          back: { ...DEFAULT_LIGHTS.back, ...saved.back },
        });
      }
    } catch {}
  }, []);

  const updateLights = (patch: Partial<Lights>) => {
    setLights((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(LIGHTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const updateLight = (which: "key" | "fill" | "back", patch: Partial<LightCfg>) =>
    updateLights({ [which]: { ...lights[which], ...patch } } as Partial<Lights>);

  // ----- surface (질감) -----
  const texCacheRef = useRef<Partial<Record<TexMapKey, THREE.Texture>>>({});

  const getBumpTex = (key: TexMapKey): Promise<THREE.Texture | null> => {
    if (key === "none") return Promise.resolve(null);
    const cached = texCacheRef.current[key];
    if (cached) return Promise.resolve(cached);
    const url = TEX_MAPS.find((t) => t.key === key)?.url;
    if (!url) return Promise.resolve(null);
    return new Promise((res) => {
      new THREE.TextureLoader().load(url, (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 3);
        texCacheRef.current[key] = tex;
        res(tex);
      });
    });
  };

  const applySurfaceToMeshes = async (s: Surface) => {
    const bump = await getBumpTex(s.texMap);
    meshesRef.current.forEach((mesh) =>
      (mesh.material as THREE.MeshStandardMaterial[]).forEach((m) => {
        m.roughness = s.roughness;
        m.metalness = s.metalness;
        m.bumpMap = bump;
        m.bumpScale = s.bumpScale;
        m.envMapIntensity = s.envIntensity;
        m.needsUpdate = true;
      })
    );
  };

  const updateSurface = (patch: Partial<Surface>) => {
    const next = { ...surfaceRef.current, ...patch };
    surfaceRef.current = next;
    setSurface(next);
    void applySurfaceToMeshes(next);
    try {
      localStorage.setItem(SURFACE_KEY, JSON.stringify(next));
    } catch {}
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SURFACE_KEY) || "null");
      if (saved) {
        const next = { ...DEFAULT_SURFACE, ...saved };
        surfaceRef.current = next;
        setSurface(next);
      }
    } catch {}
  }, []);

  // ----- effects -----
  useEffect(() => {
    fetch("/models/models.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((files: string[]) => {
        setModels(files);
        if (files.length) setModelUrl("/models/" + files[0]);
      })
      .catch(() => setModels([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 합성 캔버스 갱신: 위치/크기/회전/색 변경 시
  useEffect(() => {
    composeRef.current = compose;
    drawComposite();
    if (imageTargetsRef.current.size) bake();
    scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compose, hex, imageLoaded]);

  // 휠 = 크기 (passive:false 필요해서 직접 등록)
  useEffect(() => {
    const canvas = composeCanvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      if (!imageLoadedRef.current) return;
      e.preventDefault();
      setCompose((c) => ({
        ...c,
        scale: Math.min(1.5, Math.max(0.05, c.scale - e.deltaY * 0.0008)),
      }));
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- preview drag -----
  const dragTo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = composeCanvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setCompose((c) => ({ ...c, x, y }));
  };

  // ----- PDF export -----
  const exportPdf = async () => {
    const gl = glRef.current;
    if (!gl) return;
    setExporting(true);
    try {
      const shot = gl.domElement.toDataURL("image/png");
      const W = 1240;
      const H = 1754;
      const page = document.createElement("canvas");
      page.width = W;
      page.height = H;
      const ctx = page.getContext("2d")!;
      const F = (size: number, weight = 400) =>
        `${weight} ${size}px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif`;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // header
      ctx.fillStyle = "#10b981";
      ctx.font = F(26, 700);
      ctx.fillText(t("테블러 TABLER STUDIO", "TABLER STUDIO"), 80, 96);
      ctx.fillStyle = "#0f172a";
      ctx.font = F(54, 700);
      ctx.fillText(
        t("커스텀 텀블러 제작 제안서", "Custom Tumbler Production Proposal"),
        80,
        170
      );
      const today = new Date();
      const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
      ctx.fillStyle = "#64748b";
      ctx.font = F(24);
      ctx.textAlign = "right";
      ctx.fillText(dateStr, W - 80, 170);
      ctx.textAlign = "left";
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 210);
      ctx.lineTo(W - 80, 210);
      ctx.stroke();

      // 3D snapshot
      const boxX = 80, boxY = 250, boxW = W - 160, boxH = 660;
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      const img = new Image();
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("screenshot load failed"));
        img.src = shot;
      });
      const sc = Math.min(boxW / img.width, boxH / img.height);
      const dw = img.width * sc;
      const dh = img.height * sc;
      ctx.drawImage(img, boxX + (boxW - dw) / 2, boxY + (boxH - dh) / 2, dw, dh);

      // design info
      let y = boxY + boxH + 70;
      ctx.fillStyle = "#0f172a";
      ctx.font = F(30, 700);
      ctx.fillText(t("디자인 정보", "Design info"), 80, y);
      y += 44;
      ctx.fillStyle = HEX_RE.test(hexRef.current) ? hexRef.current : "#3b82f6";
      ctx.fillRect(80, y - 26, 34, 34);
      ctx.strokeStyle = "#cbd5e1";
      ctx.strokeRect(80, y - 26, 34, 34);
      const modelName = (modelUrlRef.current.split("/").pop() || "").replace(/\.(glb|gltf)$/i, "");
      const targetNames = [...imageTargetsRef.current]
        .map((k) => dirLabel(k, lang))
        .join(", ");
      ctx.fillStyle = "#334155";
      ctx.font = F(24);
      ctx.fillText(
        t(
          `컬러 ${hexRef.current.toUpperCase()}  ·  모델 ${modelName}  ·  로고 ${
            imageTargetsRef.current.size ? `적용 (${targetNames})` : "미적용"
          }`,
          `Color ${hexRef.current.toUpperCase()}  ·  Model ${modelName}  ·  Logo ${
            imageTargetsRef.current.size ? `applied (${targetNames})` : "not applied"
          }`
        ),
        134,
        y
      );

      // applied design thumbnail
      if (imageTargetsRef.current.size && composeCanvasRef.current) {
        ctx.drawImage(composeCanvasRef.current, W - 280, y - 26, 200, 200);
        ctx.strokeStyle = "#cbd5e1";
        ctx.strokeRect(W - 280, y - 26, 200, 200);
        ctx.fillStyle = "#94a3b8";
        ctx.font = F(18);
        ctx.fillText(t("적용 디자인", "Applied design"), W - 280, y + 200);
      }

      // specs
      y += 80;
      ctx.fillStyle = "#0f172a";
      ctx.font = F(30, 700);
      ctx.fillText(t("제작 사양", "Production specs"), 80, y);
      y += 16;
      getSpecs(lang).forEach(([k, v]) => {
        y += 46;
        ctx.fillStyle = "#94a3b8";
        ctx.font = F(22);
        ctx.fillText(k, 80, y);
        ctx.fillStyle = "#334155";
        ctx.fillText(v, 260, y);
      });

      // footer
      ctx.strokeStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.moveTo(80, H - 110);
      ctx.lineTo(W - 80, H - 110);
      ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.font = F(20);
      ctx.fillText(
        t(
          `문의 ${CONTACT_EMAIL}  ·  테블러 커스텀 텀블러 3D 목업 스튜디오`,
          `Contact ${CONTACT_EMAIL}  ·  TABLER Custom Tumbler 3D Mockup Studio`
        ),
        80,
        H - 64
      );

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      pdf.addImage(page.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297);
      pdf.save(
        t(
          `테블러_제안서_${dateStr.replaceAll(".", "-")}.pdf`,
          `TABLER_proposal_${dateStr.replaceAll(".", "-")}.pdf`
        )
      );
    } finally {
      setExporting(false);
    }
  };

  // ----- UI helpers -----
  const targetBtn = (sel: boolean) =>
    `rounded-lg border px-3 py-2 text-center text-[13px] transition ${
      sel
        ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-700"
        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
    }`;
  const tabBtn = (sel: boolean) =>
    `flex-1 border-b-2 pb-2.5 text-center text-sm transition ${
      sel
        ? "border-emerald-500 font-semibold text-emerald-600"
        : "border-transparent text-zinc-500 hover:text-zinc-700"
    }`;
  const label = "mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400";

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ===== 3D viewer ===== */}
        <div className="relative h-[380px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 lg:col-span-3 lg:h-[640px]">
          {modelUrl ? (
            <Canvas
              camera={{ position: [2.2, 1.6, 2.6], fov: 45 }}
              dpr={[1, 2]}
              gl={{ preserveDrawingBuffer: true, alpha: true }}
            >
              <GlBridge glRef={glRef} />
              {/* HDR 환경맵 — 재질 반사 (강도는 질감 탭 envIntensity로 조절) */}
              <Environment files="/img/startup.hdr" />
              <ambientLight intensity={lights.ambient} />
              <directionalLight
                position={lightPos(lights.key)}
                intensity={lights.key.intensity}
                color={lights.key.color}
              />
              <directionalLight
                position={lightPos(lights.fill)}
                intensity={lights.fill.intensity}
                color={lights.fill.color}
              />
              <directionalLight
                position={lightPos(lights.back)}
                intensity={lights.back.intensity}
                color={lights.back.color}
              />
              <Suspense fallback={null}>
                <Center key={modelUrl}>
                  <Model url={modelUrl} onReady={handleReady} />
                </Center>
              </Suspense>
              <OrbitControls makeDefault enableDamping />
            </Canvas>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              {t("3D 모델 로딩 중...", "Loading 3D model...")}
            </div>
          )}
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-white/80 px-2.5 py-1 text-xs text-zinc-500 backdrop-blur">
            {t(
              "드래그 회전 · 휠 줌 · 면 선택 시 초록색으로 표시",
              "Drag to rotate · scroll to zoom · selected faces flash green"
            )}
          </div>
        </div>

        {/* ===== side panel ===== */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* model select */}
          <div>
            <label className={label} htmlFor="model-select">{t("3D 모델", "3D Model")}</label>
            <select
              id="model-select"
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-emerald-500"
            >
              {models.length === 0 && (
                <option value="">{t("models 폴더에 .glb 없음", "No .glb in models folder")}</option>
              )}
              {models.map((f) => (
                <option key={f} value={"/models/" + f}>
                  {f.replace(/\.(glb|gltf)$/i, "")}
                </option>
              ))}
            </select>
          </div>

          {/* tabs */}
          <div className="flex border-b border-zinc-200">
            <button onClick={() => setTab("color")} className={tabBtn(tab === "color")}>
              {t("컬러", "Color")}
            </button>
            <button onClick={() => setTab("image")} className={tabBtn(tab === "image")}>
              {t("이미지", "Image")}
            </button>
            <button onClick={() => setTab("light")} className={tabBtn(tab === "light")}>
              {t("조명", "Light")}
            </button>
            <button onClick={() => setTab("surface")} className={tabBtn(tab === "surface")}>
              {t("질감", "Surface")}
            </button>
          </div>

          {/* color panel */}
          <div className={tab === "color" ? "flex flex-col gap-4" : "hidden"}>
            <div>
              <span className={label}>{t("색상 선택", "Pick a color")}</span>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={HEX_RE.test(hex) ? hex : hexRef.current}
                  onChange={(e) => applyColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-white p-1"
                />
                <input
                  type="text"
                  value={hex}
                  maxLength={7}
                  placeholder="#000000"
                  onChange={(e) => {
                    let v = e.target.value.trim();
                    if (v && !v.startsWith("#")) v = "#" + v;
                    applyColor(v);
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm text-zinc-700 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <span className={label}>{t("프리셋", "Presets")}</span>
              <div className="grid grid-cols-6 gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => applyColor(c)}
                    style={{ background: c }}
                    aria-label={c}
                    className={`aspect-square rounded-lg border-2 transition hover:scale-110 ${
                      hexRef.current.toLowerCase() === c ? "border-emerald-500" : "border-zinc-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* image panel (canvas는 항상 마운트 유지 — 텍스처 원본) */}
          <div className={tab === "image" ? "flex flex-col gap-3" : "hidden"}>
            {/* 이미지 적용 면 (방향 기준 6면) */}
            <div>
              <span className={label}>
                {t("이미지 적용 면", "Apply image to face")}{" "}
                <span className="normal-case text-zinc-300">
                  {t("— 선택 시 3D에서 초록 표시", "— selected face flashes green in 3D")}
                </span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => selectTarget("all")}
                  className={`${targetBtn(target === "all")} col-span-2`}
                  disabled={!ready}
                >
                  {t("전체", "All")}
                </button>
                {DIRS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => selectTarget(d.key)}
                    className={targetBtn(target === d.key)}
                    disabled={!ready}
                  >
                    {t(d.label, d.labelEn)}
                  </button>
                ))}
              </div>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragover(true);
              }}
              onDragLeave={() => setDragover(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragover(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center text-[13px] transition ${
                dragover
                  ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                  : "border-zinc-300 text-zinc-400 hover:border-emerald-400 hover:text-emerald-500"
              }`}
            >
              {t("클릭 또는 드래그로", "Click or drag & drop")}
              <br />
              {t("이미지 업로드 (PNG/JPG)", "to upload an image (PNG/JPG)")}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <canvas
              ref={composeCanvasRef}
              width={TEX_SIZE}
              height={TEX_SIZE}
              onPointerDown={(e) => {
                if (!imageLoadedRef.current) return;
                draggingRef.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                dragTo(e);
              }}
              onPointerMove={(e) => {
                if (draggingRef.current) dragTo(e);
              }}
              onPointerUp={() => {
                draggingRef.current = false;
              }}
              className="w-full cursor-grab touch-none rounded-xl border border-zinc-200 active:cursor-grabbing"
            />

            {imageLoaded && (
              <div className="flex flex-col gap-2.5">
                {(
                  [
                    [t("가로 위치", "Horizontal"), Math.round(compose.x * 100), 0, 100, "%", (v: number) => setCompose((c) => ({ ...c, x: v / 100 }))],
                    [t("세로 위치", "Vertical"), Math.round(compose.y * 100), 0, 100, "%", (v: number) => setCompose((c) => ({ ...c, y: v / 100 }))],
                    [t("크기", "Size"), Math.round(compose.scale * 100), 5, 150, "%", (v: number) => setCompose((c) => ({ ...c, scale: v / 100 }))],
                    [t("회전", "Rotation"), Math.round(compose.rotation), -180, 180, "°", (v: number) => setCompose((c) => ({ ...c, rotation: v }))],
                  ] as const
                ).map(([name, val, min, max, unit, set]) => (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-[13px] text-zinc-600">
                      <span>{name}</span>
                      <span className="font-mono text-xs text-zinc-400">
                        {val}
                        {unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={val}
                      onChange={(e) => set(Number(e.target.value))}
                      className="w-full cursor-pointer accent-emerald-500"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={applyImage}
              disabled={!imageLoaded}
              className="rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("모델에 적용", "Apply to model")}
            </button>
            <button
              onClick={removeImage}
              disabled={!imageApplied}
              className="rounded-lg bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("이미지 제거", "Remove image")}
            </button>
            <p className="text-xs leading-relaxed text-zinc-400">
              {t(
                "적용 면(앞/뒤/좌/우/위/아래)을 고르고 적용하면 그 방향 면에만 입혀짐. 미리보기 드래그 = 이동, 휠 = 크기. 적용 후에도 실시간 수정 가능.",
                "Pick a face (front/back/left/right/top/bottom) and apply — the image goes on that face only. Drag the preview to move, scroll to resize. Live-editable after applying."
              )}
            </p>
          </div>

          {/* light panel — 3점 조명 */}
          <div className={tab === "light" ? "flex flex-col gap-3" : "hidden"}>
            <div>
              <div className="mb-1 flex justify-between text-[13px] text-zinc-600">
                <span>{t("환경광 (전체 밝기)", "Ambient (overall brightness)")}</span>
                <span className="font-mono text-xs text-zinc-400">
                  {Math.round(lights.ambient * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={Math.round(lights.ambient * 100)}
                onChange={(e) => updateLights({ ambient: Number(e.target.value) / 100 })}
                className="w-full cursor-pointer accent-emerald-500"
              />
            </div>

            {LIGHT_NAMES.map(({ key: lk, label: lname, labelEn: lnameEn }) => {
              const cfg = lights[lk];
              const name_ = t(lname, lnameEn);
              return (
                <div key={lk} className="rounded-xl border border-zinc-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-zinc-700">{name_}</span>
                    <input
                      type="color"
                      value={cfg.color}
                      onChange={(e) => updateLight(lk, { color: e.target.value })}
                      className="h-7 w-9 cursor-pointer rounded-md border border-zinc-200 bg-white p-0.5"
                      aria-label={t(`${name_} 색상`, `${name_} color`)}
                    />
                  </div>
                  {(
                    [
                      [t("강도", "Intensity"), Math.round(cfg.intensity * 100), 0, 300, "%", (v: number) => updateLight(lk, { intensity: v / 100 })],
                      [t("방향", "Angle"), Math.round(cfg.angle), 0, 360, "°", (v: number) => updateLight(lk, { angle: v })],
                      [t("높이", "Height"), Math.round(cfg.height * 10) / 10, -5, 10, "", (v: number) => updateLight(lk, { height: v })],
                    ] as const
                  ).map(([name, val, min, max, unit, set]) => (
                    <div key={name} className="mb-1.5 last:mb-0">
                      <div className="mb-0.5 flex justify-between text-xs text-zinc-500">
                        <span>{name}</span>
                        <span className="font-mono text-[11px] text-zinc-400">
                          {val}
                          {unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={unit === "" ? 0.5 : 1}
                        value={val}
                        onChange={(e) => set(Number(e.target.value))}
                        className="w-full cursor-pointer accent-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              );
            })}

            <button
              onClick={() => updateLights(DEFAULT_LIGHTS)}
              className="rounded-lg bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-200"
            >
              {t("기본값으로 초기화", "Reset to defaults")}
            </button>
            <p className="text-xs leading-relaxed text-zinc-400">
              {t(
                "키 = 주광, 필 = 그림자 완화용 보조광, 백 = 윤곽 살리는 역광. 설정은 자동 저장되고 PDF 스냅샷에도 반영됨.",
                "Key = main light, fill = softens shadows, back = rim light for silhouette. Settings auto-save and apply to PDF snapshots."
              )}
            </p>
          </div>

          {/* surface panel — 질감 */}
          <div className={tab === "surface" ? "flex flex-col gap-3" : "hidden"}>
            <div>
              <span className={label}>{t("프리셋", "Presets")}</span>
              <div className="grid grid-cols-2 gap-1.5">
                {SURFACE_PRESETS.map((p) => {
                  const active =
                    Math.abs(surface.roughness - p.value.roughness) < 0.01 &&
                    Math.abs(surface.metalness - p.value.metalness) < 0.01;
                  return (
                    <button
                      key={p.label}
                      onClick={() => updateSurface(p.value)}
                      className={targetBtn(active)}
                    >
                      {t(p.label, p.labelEn)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className={label}>{t("표면 텍스처 (범프맵)", "Surface texture (bump map)")}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {TEX_MAPS.map((tm) => (
                  <button
                    key={tm.key}
                    onClick={() => updateSurface({ texMap: tm.key })}
                    className={targetBtn(surface.texMap === tm.key)}
                  >
                    {t(tm.label, tm.labelEn)}
                  </button>
                ))}
              </div>
            </div>

            {(
              [
                [t("거칠기 (러프니스)", "Roughness"), Math.round(surface.roughness * 100), t("매끈 ← → 거침", "smooth ← → rough"), (v: number) => updateSurface({ roughness: v / 100 })],
                [t("금속성 (메탈니스)", "Metalness"), Math.round(surface.metalness * 100), t("플라스틱 ← → 금속", "plastic ← → metal"), (v: number) => updateSurface({ metalness: v / 100 })],
                [t("텍스처 강도", "Texture strength"), Math.round(surface.bumpScale * 100), t("요철 깊이", "bump depth"), (v: number) => updateSurface({ bumpScale: v / 100 })],
                [t("환경 반사", "Env reflection"), Math.round(surface.envIntensity * 100), t("HDR 반사 강도 (startup.hdr)", "HDR reflection intensity (startup.hdr)"), (v: number) => updateSurface({ envIntensity: v / 100 })],
              ] as const
            ).map(([name, val, hint, set]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-[13px] text-zinc-600">
                  <span>{name}</span>
                  <span className="font-mono text-xs text-zinc-400">{val}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={(e) => set(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-500"
                />
                <div className="mt-0.5 text-[11px] text-zinc-300">{hint}</div>
              </div>
            ))}

            <button
              onClick={() => updateSurface(DEFAULT_SURFACE)}
              className="rounded-lg bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-200"
            >
              {t("기본값으로 초기화 (무광 플라스틱)", "Reset to default (matte plastic)")}
            </button>
            <p className="text-xs leading-relaxed text-zinc-400">
              {t(
                "모델 전체에 적용됨. 설정은 자동 저장되고 PDF 스냅샷에도 반영됨.",
                "Applies to the whole model. Settings auto-save and apply to PDF snapshots."
              )}
            </p>
          </div>

          {/* PDF export */}
          <button
            onClick={exportPdf}
            disabled={exporting || !modelUrl}
            className="mt-auto rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exporting
              ? t("PDF 생성 중...", "Generating PDF...")
              : t("📄 PDF로 내보내기", "📄 Export as PDF")}
          </button>
        </div>
      </div>
    </section>
  );
}
