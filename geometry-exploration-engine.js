import * as THREE from "./vendor/three/build/three.webgpu.min.js";
import { OrbitControls } from "./vendor/three/addons/controls/OrbitControls.js";

const CACHE_LIMIT = 8;
const DEFAULTS = Object.freeze({ lambda: 1, kappa: 1, resolution: 64 });

function byId(id) { return document.getElementById(id); }
function phaseColor(value) { return new THREE.Color().setHSL(0.68 - value * 0.58, 0.9, 0.58); }
function bounded(value, lo, hi) { return Math.max(lo, Math.min(hi, value)); }

function renderFit(records, radius = 3.1) {
  let largest = 1;
  records.forEach((values) => { for (const value of values) largest = Math.max(largest, Math.abs(value)); });
  return radius / largest;
}

function positionGeometry(points, phases, scale) {
  const positions = new Float32Array(points.length);
  const colors = new Float32Array(points.length);
  for (let i = 0; i < points.length / 3; i += 1) {
    positions[i * 3] = points[i * 3] * scale;
    positions[i * 3 + 1] = points[i * 3 + 1] * scale;
    positions[i * 3 + 2] = points[i * 3 + 2] * scale;
    const c = phaseColor(phases[i] || 0.5);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function dispose(root) {
  root?.traverse((item) => {
    item.geometry?.dispose?.();
    (Array.isArray(item.material) ? item.material : [item.material]).forEach((material) => material?.dispose?.());
  });
}

function structuralGraph() {
  const group = new THREE.Group();
  const dots = [], colors = [], lines = [];
  const ringCounts = [1, 4, 16];
  let previous = [[0, 0, 0]];
  ringCounts.forEach((count, depth) => {
    const next = [];
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2 + depth * 0.31;
      const r = depth * 1.35;
      const p = [r * Math.cos(a), r * Math.sin(a), (depth - 1) * 0.85];
      next.push(p); dots.push(...p); const c = phaseColor(depth / 3); colors.push(c.r, c.g, c.b);
      if (depth) { const parent = previous[i % previous.length]; lines.push(...parent, ...p); }
    }
    previous = next;
  });
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(dots, 3));
  pointGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  group.add(new THREE.Points(pointGeometry, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.95 })));
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  group.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x5e8cff, transparent: true, opacity: 0.36 })));
  return group;
}

class GeometryExplorer {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector("canvas");
    this.status = root.querySelector("[data-geometry-status]");
    this.detail = root.querySelector("[data-geometry-detail]");
    this.mode = "slice";
    this.job = 0;
    this.cache = new Map();
    this.group = null;
    this.parameters = { ...DEFAULTS };
    this.sceneData = null;
    this.config = null;
    this.ready = false;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030614);
    this.scene.fog = new THREE.FogExp2(0x030614, 0.055);
    this.camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    this.camera.position.set(8.2, 7.1, 9.4);
    this.renderer = new THREE.WebGPURenderer({ canvas: this.canvas, antialias: true, alpha: false, forceWebGL: !navigator.gpu });
    this.backend = navigator.gpu ? "WebGPU" : "WebGL2 fallback";
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.controls.minDistance = 3.8;
    this.controls.maxDistance = 22;
    this.controls.addEventListener("change", () => this.render());
    this.addLighting();
    this.addStarfield();
    this.resizeObserver = new ResizeObserver(() => { this.resize(); this.render(); });
    this.resizeObserver.observe(root.querySelector(".geometry-explorer__stage"));
    this.bind();
    this.initialize();
  }

  addLighting() {
    this.scene.add(new THREE.HemisphereLight(0x8ab5ff, 0x11031f, 2.2));
    const key = new THREE.DirectionalLight(0xa7c6ff, 3.2); key.position.set(4, 7, 5); this.scene.add(key);
    const rim = new THREE.PointLight(0xe25cff, 80, 18, 2); rim.position.set(-4, -1, 5); this.scene.add(rim);
    const floor = new THREE.PointLight(0x27e4c5, 45, 14, 2); floor.position.set(2, -5, -3); this.scene.add(floor);
  }

  addStarfield() {
    const positions = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i += 1) {
      const a = (i * 2.3999632297) % (Math.PI * 2), r = 7 + ((i * 47) % 190) / 10, z = -5 + ((i * 31) % 100) / 10;
      positions.set([Math.cos(a) * r, Math.sin(a) * r, z], i * 3);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x8ea9ff, size: 0.024, transparent: true, opacity: 0.58, depthWrite: false })));
  }

  async initialize() {
    this.setState("loading", "Preparing renderer and declared mathematical inputs…");
    try {
      const [rawScene, config] = await Promise.all([fetch("data/system.v2.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error("system.v2 unavailable"))), fetch("data/base-geometric-render-config.v1.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error("sample config unavailable")))]);
      window.ConcreteRuntimeSchema.validateAndNormalizeV2(rawScene);
      this.sceneData = rawScene;
      this.config = config;
    } catch (error) {
      this.fail("The formula or finite-sample input could not be loaded. No geometry was generated.", error);
      return;
    }
    try {
      await this.renderer.init();
    } catch (_) {
      try {
        this.backend = "WebGL2 fallback";
        this.renderer.dispose();
        this.renderer = new THREE.WebGPURenderer({ canvas: this.canvas, antialias: true, alpha: false, forceWebGL: true });
        await this.renderer.init();
      } catch (fallbackError) {
        this.fail("No WebGPU/WebGL2 renderer could initialize. The mathematical contract and controls remain readable; no substitute geometry is shown.", fallbackError);
        return;
      }
    }
    this.backend = this.renderer.backend?.isWebGPUBackend ? "WebGPU" : "WebGL2 fallback";
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.ready = true;
    this.resize();
    this.rebuild();
  }

  bind() {
    this.root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-geometry-mode]");
      if (!button) return;
      this.mode = button.dataset.geometryMode;
      this.root.querySelectorAll("[data-geometry-mode]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      this.rebuild();
    });
    this.root.querySelectorAll("[data-geometry-parameter]").forEach((input) => input.addEventListener("input", () => {
      const name = input.dataset.geometryParameter;
      this.parameters[name] = Number(input.value);
      const output = this.root.querySelector("[data-geometry-output='" + name + "']");
      if (output) output.textContent = String(this.parameters[name]);
      this.rebuild();
    }));
    this.root.querySelector("[data-geometry-action='reset']")?.addEventListener("click", () => { this.camera.position.set(8.2, 7.1, 9.4); this.controls.target.set(0, 0, 0); this.controls.update(); this.render(); });
  }

  sceneWithParameters() {
    return { ...this.sceneData, mathematics: { ...this.sceneData.mathematics, parameters: { ...this.sceneData.mathematics.parameters, lambda: this.parameters.lambda, kappa: this.parameters.kappa } } };
  }

  cacheKey() { return this.mode + ":" + this.parameters.lambda + ":" + this.parameters.kappa + ":" + this.parameters.resolution; }
  setState(state, text) { this.root.dataset.state = state; this.status.textContent = text; }
  fail(text, error) { this.root.dataset.error = error?.message || "renderer failure"; this.setState("error", text); this.canvas.hidden = true; console.error("Geometry explorer:", error); }

  rebuild() {
    if (!this.ready) return;
    const token = ++this.job, key = this.cacheKey();
    this.setState("generating", "Recomputing declared map… previous request cancelled if still pending.");
    requestAnimationFrame(() => {
      if (token !== this.job) return;
      try {
        const record = this.cache.get(key) || this.generate();
        if (!this.cache.has(key)) { this.cache.set(key, record); if (this.cache.size > CACHE_LIMIT) this.cache.delete(this.cache.keys().next().value); }
        if (token !== this.job) return;
        this.mount(record);
      } catch (error) { this.fail("Declared geometry generation failed. No unrelated procedural fallback was substituted.", error); }
    });
  }

  generate() {
    const MathView = window.GeometryExplorationMath;
    if (!MathView) throw new Error("GeometryExplorationMath is unavailable.");
    const scene = this.sceneWithParameters();
    if (this.mode === "slice") return MathView.declaredSlice(scene, { thetaSegments: this.parameters.resolution, phiSegments: Math.max(24, Math.round(this.parameters.resolution * 0.72)) });
    if (this.mode === "phase") return MathView.torusEmbedding(scene, this.config);
    if (this.mode === "cloud") return MathView.finiteSampleCloud(scene, this.config);
    return { kind: "structural_pullback", formulaId: "not_applicable", graph: true };
  }

  mount(record) {
    if (this.group) { this.scene.remove(this.group); dispose(this.group); }
    this.group = new THREE.Group();
    if (record.kind === "declared_parameter_subfamily") this.mountSlice(record);
    else if (record.kind === "structural_pullback") this.group.add(structuralGraph());
    else this.mountPoints(record);
    this.scene.add(this.group);
    const detail = this.describe(record);
    this.detail.innerHTML = detail;
    this.root.dataset.mode = this.mode;
    this.root.dataset.cacheEntries = String(this.cache.size);
    this.root.dataset.backend = this.backend;
    this.root.dataset.formulaId = record.formulaId;
    this.setState("ready", `${this.backend} · ${this.mode === "slice" ? "two declared root-labelled parameter surfaces" : record.kind === "structural_pullback" ? "structural display only" : String(record.points.length) + " finite points"} · cache ${this.cache.size}/${CACHE_LIMIT}.`);
    this.render();
  }

  mountSlice(record) {
    const scale = renderFit(record.branches.map((branch) => branch.positions));
    record.branches.forEach((branch, index) => {
      const geometry = positionGeometry(branch.positions, branch.phases, scale);
      geometry.setIndex(new THREE.BufferAttribute(branch.indices, 1)); geometry.computeVertexNormals();
      const material = new THREE.MeshPhysicalMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.25, metalness: 0.18, transmission: 0.08, thickness: 0.18, transparent: true, opacity: index ? 0.66 : 0.82, emissive: 0x101522, emissiveIntensity: 0.48 });
      const mesh = new THREE.Mesh(geometry, material); mesh.userData = { role: "declared_parameter_subfamily", rootLabel: index }; this.group.add(mesh);
      const halo = new THREE.Mesh(geometry.clone(), new THREE.MeshBasicMaterial({ color: index ? 0xd55fff : 0x3effdc, transparent: true, opacity: 0.055, side: THREE.BackSide, depthWrite: false })); halo.scale.setScalar(1.015); this.group.add(halo);
    });
  }

  mountPoints(record) {
    const flattened = [], phases = [];
    record.points.forEach((point) => { flattened.push(...point.position); phases.push(point.phase); });
    const geometry = positionGeometry(flattened, phases, renderFit([flattened]));
    const material = new THREE.PointsMaterial({ size: record.kind === "phase_torus_display_embedding" ? 0.105 : 0.074, vertexColors: true, transparent: true, opacity: 0.86, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.group.add(new THREE.Points(geometry, material));
  }

  describe(record) {
    const base = `<strong>Formula binding:</strong> <code>W_kappa_torus4_v1</code>, with runtime λ=${this.parameters.lambda}, κ=${this.parameters.kappa} embedded as real complex values. `;
    if (record.kind === "declared_parameter_subfamily") return base + `<strong>Declared parameter subfamily.</strong> Set z₁=eⁱθ, z₂=eⁱφ, z₃=1 and solve z₄²−(λ−z₁−z₂−1)z₄+κ/(z₁z₂)=0 for each (θ,φ)∈S¹×S¹. The rendered coordinates are π=(Re z₁, Im z₁, Re z₄), followed by a uniform display fit. z₃ is fixed; z₂ remains only as φ, and Im z₄ is omitted from the axes. Color is phase(z₄), an auxiliary domain-color encoding. The two colours are ordered quadratic-root labels only—not sheets, covering branches, components, or global topology. Max floating residual: ${record.maxResidual.toExponential(2)}.`;
    if (record.kind === "phase_torus_display_embedding") return base + `<strong>Finite validated sample display embedding.</strong> ${record.sampleModel.sampleCount} deterministic X₀ samples are encoded by arg(z₁), arg(z₂), and clipped log|z₃| in a display torus. The torus is not X₀; periodic seam/overlap and density are display effects. Each point retains finite numerical membership only, never completeness.`;
    if (record.kind === "finite_validated_sample_cloud") return base + `<strong>Finite validated sample cloud.</strong> Each point is one deterministic accepted X₀ sample projected by π=(Re z₁, Im z₁, Re z₄), then uniformly display-fitted. Im z₄, z₂, and z₃ are discarded; projected overlap neither identifies source points nor establishes topology.`;
    return `<strong>Structural pullback.</strong> This is a readable organization graph of depth labels 0, 1, and 2 with D⁴-style relation counts; it has no W-coordinate positions, no geometric points, no sheets, and no covering interpretation.`;
  }

  resize() {
    if (!this.ready) return;
    const stage = this.root.querySelector(".geometry-explorer__stage"); const width = Math.max(1, stage.clientWidth), height = Math.max(1, stage.clientHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); this.renderer.setSize(width, height, false); this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
  }
  render() { if (this.ready) this.renderer.render(this.scene, this.camera); }
}

window.addEventListener("DOMContentLoaded", () => {
  const root = byId("geometry-explorer");
  if (root) window.GeometryExplorer = new GeometryExplorer(root);
});
