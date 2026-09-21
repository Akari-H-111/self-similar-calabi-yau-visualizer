import * as THREE from "./vendor/three/build/three.webgpu.min.js";
import { OrbitControls } from "./vendor/three/addons/controls/OrbitControls.js";

const CACHE_LIMIT = 8;
const DEFAULTS = Object.freeze({ lambda: 1, kappa: 1, resolution: 64, D: 2, depth: 1 });

function byId(id) { return document.getElementById(id); }
function phaseColor(value) { return new THREE.Color().setHSL(0.68 - value * 0.58, 0.9, 0.58); }
function bounded(value, lo, hi) { return Math.max(lo, Math.min(hi, value)); }

function renderFit(records, radius = 3.1, origin = [0, 0, 0], local = false) {
  let largest = local ? 0 : 1;
  records.forEach((values) => { for (let i = 0; i < values.length; i++) largest = Math.max(largest, Math.abs(values[i] - origin[i % 3])); });
  return radius / Math.max(largest, 1e-9);
}

function positionGeometry(points, phases, scale, origin = [0, 0, 0]) {
  const positions = new Float32Array(points.length);
  const colors = new Float32Array(points.length);
  for (let i = 0; i < points.length / 3; i += 1) {
    positions[i * 3] = (points[i * 3] - origin[0]) * scale;
    positions[i * 3 + 1] = (points[i * 3 + 1] - origin[1]) * scale;
    positions[i * 3 + 2] = (points[i * 3 + 2] - origin[2]) * scale;
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
    this.parameterText = { lambda: "1", kappa: "1" };
    this.scope = "finite-seed";
    this.localFit = false;
    this.simpleDepth = null;
    this.sliceRecord = null;
    this.selectedSliceVertex = null;
    this.localComparison = "raw_projected_patches";
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
    this.initialCameraDistance = this.camera.position.length();
    this.initialCameraPosition = this.camera.position.clone();
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points.threshold = 0.16;
    this.controls.addEventListener("change", () => { this.updateCameraState(); this.render(); });
    this.updateCameraState();
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
    this.starfield = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x8ea9ff, size: 0.024, transparent: true, opacity: 0.58, depthWrite: false }));
    this.scene.add(this.starfield);
  }

  updateCameraState() {
    const distance = this.camera.position.distanceTo(this.controls.target);
    this.root.dataset.cameraScale = String(this.initialCameraDistance / distance);
    this.root.dataset.cameraScaleSemantic = "visual_camera_dolly";
    const simpleStatus = this.root.querySelector("[data-simple-geometry-status]");
    if (simpleStatus && this.currentRecord) this.updateSimpleGuide(this.currentRecord);
    else if (simpleStatus) simpleStatus.textContent = `Visual camera · ${Number(this.root.dataset.cameraScale).toFixed(1)}×`;
  }

  setInput(name, value) {
    const input = this.root.querySelector(`[data-geometry-parameter='${name}']`);
    if (!input) return;
    input.value = String(value);
    this.parameters[name] = Number(value);
    if (name === "lambda" || name === "kappa") this.parameterText[name] = String(value);
    const output = this.root.querySelector(`[data-geometry-output='${name}']`);
    if (output) output.textContent = String(value);
  }

  applyUiMode(mode, { rebuild = true } = {}) {
    const simple = mode === "simple";
    this.root.dataset.presentationMode = simple ? "simple" : "expert";
    this.starfield.visible = !simple;
    if (simple) {
      this.mode = "slice";
      this.scope = "finite-seed";
      this.localFit = false;
      this.setInput("D", 2);
      this.setInput("depth", 1);
      this.root.querySelector("[data-geometry-scope]").value = "finite-seed";
      this.root.querySelector("[data-geometry-local-fit]").checked = false;
    } else if (this.mode === "localpatch") {
      this.mode = "slice";
      this.scope = "finite-seed";
      this.localFit = false;
      this.setInput("D", DEFAULTS.D);
      this.setInput("depth", DEFAULTS.depth);
      this.root.querySelector("[data-geometry-scope]").value = "finite-seed";
      this.root.querySelector("[data-geometry-local-fit]").checked = false;
    }
    if (rebuild && this.ready) this.rebuild();
  }

  adjustCamera(factor) {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const requested = bounded(offset.length() * factor, this.controls.minDistance, this.controls.maxDistance);
    offset.setLength(requested);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
    this.render();
  }

  fitCamera() {
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.render();
  }

  async initialize() {
    this.setState("loading", "Preparing renderer and declared mathematical inputs…");
    try {
      const [rawScene, config] = await Promise.all([fetch("data/system.v2.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error("system.v2 unavailable"))), fetch("data/base-geometric-render-config.v1.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error("sample config unavailable")))]);
      window.ConcreteRuntimeSchema.validateAndNormalizeV2(rawScene);
      this.sceneData = rawScene;
      this.config = config;
      this.pullbackConfig = await fetch("data/geometric-pullback-config.v1.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error("pullback config unavailable")));
      window.GeometricPullbackEngine.validateConfig(this.pullbackConfig);
      this.populateAncestors();
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
    this.applyUiMode(this.root.dataset.presentationMode || "simple", { rebuild: false });
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
      if (name === "lambda" || name === "kappa") this.parameterText[name] = input.value;
      const output = this.root.querySelector("[data-geometry-output='" + name + "']");
      if (output) output.textContent = String(this.parameters[name]);
      this.rebuild();
    }));
    this.root.querySelector("[data-geometry-scope]").addEventListener("change", (event) => { this.scope = event.target.value; this.rebuild(); });
    this.root.querySelector("[data-geometry-ancestor]").addEventListener("change", () => this.rebuild());
    this.root.querySelector("[data-geometry-local-fit]").addEventListener("change", (event) => { this.localFit = event.target.checked; this.rebuild(); });
    this.root.querySelector("[data-geometry-point-index]").addEventListener("input", () => this.updatePointInspector());
    this.root.querySelector("[data-geometry-action='singular']").addEventListener("click", () => {
      for (const [name, value] of Object.entries({ lambda: "2", kappa: "0.01024" })) {
        const input = this.root.querySelector(`[data-geometry-parameter='${name}']`);
        input.value = value;
        this.parameters[name] = Number(value);
        this.parameterText[name] = value;
        this.root.querySelector(`[data-geometry-output='${name}']`).textContent = value;
      }
      this.rebuild();
    });
    this.root.querySelector("[data-geometry-action='reset']")?.addEventListener("click", () => this.fitCamera());
    this.root.querySelectorAll("[data-simple-geometry-action]").forEach((button) => button.addEventListener("click", () => {
      const action = button.dataset.simpleGeometryAction;
      if (action === "explore" && this.mode === "slice") {
        this.mode = "localpatch";
        this.localComparison = "raw_projected_patches";
        this.rebuild();
      } else if (action === "comparison" && this.mode === "localpatch") {
        this.localComparison = this.localComparison === "raw_projected_patches" ? "normalized_log_comparison" : "raw_projected_patches";
        this.rebuild();
      } else if (action === "surface") {
        this.mode = "slice";
        this.rebuild();
      } else if (action === "zoom-in") this.adjustCamera(0.8);
      else if (action === "zoom-out") this.adjustCamera(1.25);
      else if (action === "fit") this.fitCamera();
    }));
    this.canvas.addEventListener("click", (event) => this.pickPoint(event));
    this.canvas.addEventListener("keydown", (event) => this.selectSliceVertexByKey(event));
    window.addEventListener("ui-presentation-mode", (event) => this.applyUiMode(event.detail));
  }

  populateAncestors() {
    const sample = window.BaseGeometricSampler.generateSamples(this.sceneData, this.config);
    const select = this.root.querySelector("[data-geometry-ancestor]");
    select.replaceChildren(...sample.samples.map((point, index) => new Option(`${index + 1}: ${point.sampleId}`, String(index))));
  }

  updatePointInspector() {
    const input = this.root.querySelector("[data-geometry-point-index]");
    const point = this.currentRecord?.kind === "finite_pullback_projection" ? this.currentRecord.points[Number(input.value)] : null;
    const target = this.root.querySelector("[data-geometry-point-evidence]");
    if (!point) { target.textContent = "Select an integer point index in range."; return; }
    target.textContent = `Point ${point.id}; ancestor ${point.ancestorSampleId}; parent ${point.parentId ?? "none at depth 0"}; root indices ${point.rootMultiIndex?.join(",") ?? "none at depth 0"}; parent power residual ${point.parentRelation?.maxResidualMagnitude ?? "n/a"}; inherited W-membership residual ${point.baseMembership.residualMagnitude}, threshold ${point.baseMembership.threshold}; source ${this.currentRecord.sourceSamplerId}, ${this.currentRecord.formulaId}, ${this.currentRecord.mapId}.`;
  }

  selectPoint(index) {
    const point = this.currentRecord?.kind === "finite_pullback_projection" ? this.currentRecord.points[index] : null;
    if (!point) return;
    const input = this.root.querySelector("[data-geometry-point-index]");
    input.value = String(index);
    this.updatePointInspector();
    this.drawSelection(index);
    const target = this.root.querySelector("[data-simple-geometry-selection]");
    if (target) target.textContent = `Selected computed point ${index + 1}. It maps to parent ${point.parentId ?? "the source sample"} under P_${this.currentRecord.D}; root indices: ${point.rootMultiIndex?.join(", ") ?? "none"}.`;
  }

  pickPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.raycaster.setFromCamera({ x: ((event.clientX - rect.left) / rect.width) * 2 - 1, y: -((event.clientY - rect.top) / rect.height) * 2 + 1 }, this.camera);
    if (this.currentRecord?.kind === "declared_parameter_subfamily" && this.sliceMeshes?.length) {
      const hit = this.raycaster.intersectObjects(this.sliceMeshes, false)[0];
      if (!hit || hit.faceIndex === undefined) return null;
      const index = hit.object.geometry.index;
      const candidates = [index.getX(hit.faceIndex * 3), index.getX(hit.faceIndex * 3 + 1), index.getX(hit.faceIndex * 3 + 2)];
      const local = hit.object.worldToLocal(hit.point.clone());
      const positions = hit.object.geometry.getAttribute("position");
      const vertexIndex = candidates.reduce((best, candidate) => {
        const distance = new THREE.Vector3(positions.getX(candidate), positions.getY(candidate), positions.getZ(candidate)).distanceToSquared(local);
        return distance < best.distance ? { candidate, distance } : best;
      }, { candidate: candidates[0], distance: Infinity }).candidate;
      this.selectSliceVertex(hit.object.userData.rootLabel, vertexIndex);
      return { branch: hit.object.userData.rootLabel, vertexIndex };
    }
    if (this.currentRecord?.kind !== "finite_pullback_projection" || !this.activePointCloud) return null;
    const hit = this.raycaster.intersectObject(this.activePointCloud, false)[0];
    if (!hit) return null;
    this.selectPoint(hit.index);
    return hit.index;
  }

  selectSliceVertexByKey(event) {
    if (this.currentRecord?.kind !== "declared_parameter_subfamily") return;
    const step = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[event.key];
    if (!step) return;
    const selected = this.selectedSliceVertex || { branch: 0, vertexIndex: Math.floor(this.sliceRecord.thetaSegments / 2) * (this.sliceRecord.phiSegments + 1) + Math.floor(this.sliceRecord.phiSegments / 2) };
    const row = this.sliceRecord.phiSegments + 1;
    const current = this.sliceRecord.branches[selected.branch]?.records[selected.vertexIndex];
    if (!current) return;
    const i = bounded(current.i + step[0], 0, this.sliceRecord.thetaSegments);
    const j = bounded(current.j + step[1], 0, this.sliceRecord.phiSegments);
    const nextIndex = i * row + j;
    const next = this.sliceRecord.branches[selected.branch].records[nextIndex];
    if (!next?.valid) return;
    event.preventDefault();
    this.selectSliceVertex(selected.branch, nextIndex);
  }

  pointScreenPosition(index) {
    const position = this.activePointGeometry?.getAttribute("position");
    if (!position || index < 0 || index >= position.count) return null;
    this.camera.updateMatrixWorld();
    this.activePointCloud.updateMatrixWorld();
    const vector = new THREE.Vector3(position.getX(index), position.getY(index), position.getZ(index));
    this.activePointCloud.localToWorld(vector);
    vector.project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    return { x: rect.left + (vector.x + 1) * rect.width / 2, y: rect.top + (1 - vector.y) * rect.height / 2 };
  }

  sliceVertexScreenPosition(branch, vertexIndex) {
    const mesh = this.sliceMeshes?.[branch];
    const positions = mesh?.geometry.getAttribute("position");
    if (!mesh || !positions || vertexIndex < 0 || vertexIndex >= positions.count) return null;
    this.camera.updateMatrixWorld(); mesh.updateMatrixWorld();
    const vector = new THREE.Vector3(positions.getX(vertexIndex), positions.getY(vertexIndex), positions.getZ(vertexIndex));
    mesh.localToWorld(vector); vector.project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    return { x: rect.left + (vector.x + 1) * rect.width / 2, y: rect.top + (1 - vector.y) * rect.height / 2 };
  }

  drawSelection(index) {
    this.selectionMarker?.removeFromParent();
    const position = this.activePointGeometry?.getAttribute("position");
    if (!position || index < 0 || index >= position.count) return;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([position.getX(index), position.getY(index), position.getZ(index)], 3));
    this.selectionMarker = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffe06d, size: 0.29, transparent: true, opacity: 1, sizeAttenuation: true, depthWrite: false }));
    this.group.add(this.selectionMarker);
    this.render();
  }

  selectSliceVertex(branch, vertexIndex) {
    const record = this.sliceRecord?.branches[branch]?.records[vertexIndex];
    if (!record?.valid) return;
    this.selectedSliceVertex = { branch, vertexIndex, id: record.id };
    this.drawSliceSelection();
    const target = this.root.querySelector("[data-simple-geometry-selection]");
    if (target) target.textContent = `Selected validated X₀ vertex ${record.id}. Press Explore this patch to compute one local P_${this.parameters.D} inverse branch.`;
    this.updateSimpleGuide(this.sliceRecord);
  }

  drawSliceSelection() {
    this.selectionMarker?.removeFromParent();
    const selected = this.selectedSliceVertex;
    const mesh = selected && this.sliceMeshes?.[selected.branch];
    if (!mesh) return;
    const positions = mesh.geometry.getAttribute("position");
    const index = selected.vertexIndex;
    if (index < 0 || index >= positions.count) return;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([positions.getX(index), positions.getY(index), positions.getZ(index)], 3));
    this.selectionMarker = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffe06d, size: .22, transparent: true, opacity: 1, sizeAttenuation: true, depthWrite: false }));
    this.group.add(this.selectionMarker);
    this.render();
  }

  sceneWithParameters() {
    return { ...this.sceneData, mathematics: { ...this.sceneData.mathematics, parameters: { ...this.sceneData.mathematics.parameters, lambda: this.parameters.lambda, kappa: this.parameters.kappa, D: this.parameters.D } } };
  }

  cacheKey() { return [this.mode, this.parameters.lambda, this.parameters.kappa, this.parameters.resolution,
    this.parameters.D, this.parameters.depth, this.scope, this.root.querySelector("[data-geometry-ancestor]").value,
    this.selectedSliceVertex?.branch ?? "", this.selectedSliceVertex?.vertexIndex ?? "", this.localComparison].join(":"); }
  setState(state, text) { this.root.dataset.state = state; this.status.textContent = text; }
  fail(text, error) {
    this.root.dataset.error = error?.message || "renderer failure";
    // Initialization can fail before applyUiMode() runs.  Keep the default
    // visitor-facing guide visible instead of leaving an empty dark stage.
    if (!this.root.dataset.presentationMode) this.root.dataset.presentationMode = "simple";
    this.setState("error", text);
    this.canvas.hidden = true;
    const simpleError = this.root.querySelector("[data-simple-geometry-error]");
    const caption = this.root.querySelector("[data-simple-geometry-caption]");
    const simpleStatus = this.root.querySelector("[data-simple-geometry-status]");
    if (simpleError) { simpleError.textContent = `Rendering unavailable: ${text}`; simpleError.hidden = false; }
    if (caption) caption.textContent = "The 3D view was not generated.";
    if (simpleStatus) simpleStatus.textContent = "No substitute graphic is shown.";
    console.error("Geometry explorer:", error);
  }

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
    if (this.mode === "localpatch") {
      const slice = this.sliceRecord || MathView.declaredSlice(scene, { thetaSegments: this.parameters.resolution, phiSegments: Math.max(24, Math.round(this.parameters.resolution * 0.72)) });
      const phiRow = slice.phiSegments + 1;
      const fallback = { branch: 0, vertexIndex: Math.floor(slice.thetaSegments / 2) * phiRow + Math.max(4, Math.min(slice.phiSegments - 4, Math.round(slice.phiSegments * 0.22))) };
      const selected = this.selectedSliceVertex || fallback;
      return window.GeometryExplorationContract.createLocalBranchPatch(scene, slice, this.pullbackConfig, { ...selected, radius: 4, D: this.parameters.D, depth: 1, rootMultiIndex: [0, 0, 0, 0] });
    }
    if (this.mode === "phase") return MathView.torusEmbedding(scene, this.config);
    if (this.mode === "cloud") return MathView.finiteSampleCloud(scene, this.config);
    if (this.mode === "pullback") return window.GeometryExplorationContract.createPullback(scene, this.config, this.pullbackConfig,
      { scope: this.scope, depth: this.parameters.depth, ancestorIndex: Number(this.root.querySelector("[data-geometry-ancestor]").value) });
    throw new Error("Unknown view mode.");
  }

  mount(record) {
    if (this.group) { this.scene.remove(this.group); dispose(this.group); }
    this.group = new THREE.Group();
    this.activePointCloud = null;
    this.activePointGeometry = null;
    this.selectionMarker = null;
    this.currentRecord = record;
    this.displayNormalizationFactor = null;
    if (record.kind === "declared_parameter_subfamily") this.mountSlice(record);
    else if (record.kind === "local_inverse_branch_patch") this.mountLocalPatch(record);
    else if (record.kind !== "pullback_preflight_refusal") this.mountPoints(record);
    this.scene.add(this.group);
    const detail = this.describe(record);
    this.detail.innerHTML = detail;
    this.root.dataset.mode = this.mode;
    this.root.dataset.cacheEntries = String(this.cache.size);
    this.root.dataset.backend = this.backend;
    this.root.dataset.formulaId = record.formulaId;
    this.root.dataset.pointCount = String(record.pointCount ?? record.points?.length ?? 0);
    this.root.dataset.requiredPointCount = record.preflight?.requiredPointCount ?? record.requiredPointCount ?? "";
    this.root.dataset.selectedAncestorId = record.selectedAncestorId ?? "";
    const pointInspector = this.root.querySelector("[data-geometry-point-inspector]");
    pointInspector.hidden = record.kind !== "finite_pullback_projection";
    if (!pointInspector.hidden) {
      const pointIndex = this.root.querySelector("[data-geometry-point-index]");
      pointIndex.max = String(record.pointCount - 1);
      pointIndex.value = "0";
      this.updatePointInspector();
    }
    const flags = record.truthFlags || window.GeometryExplorationContract.viewFlags(record.kind);
    for (const [name, value] of Object.entries(flags)) this.root.dataset[name] = String(value);
    const d = window.GeometryExplorationContract.discriminant(this.parameterText.lambda, this.parameterText.kappa);
    this.root.dataset.discriminant = d.status;
    const simpleQualification = this.root.querySelector("[data-simple-geometry-qualification]");
    if (simpleQualification) simpleQualification.textContent = `Parameter status: ${d.status}. This exact-input discriminant check does not prove smoothness or Calabi–Yau properties.`;
    this.root.querySelector("[data-geometry-discriminant]").textContent = `Discriminant: ${d.status} for the exact displayed decimal inputs. Source criterion: κ≠0 and λ⁵=5⁵κ. The renderer evaluates binary64 approximations. This is a parameter check, not a renderer proof of smoothness or Calabi–Yau status.`;
    this.root.querySelector("[data-geometry-truth]").textContent = `View: ${record.kind}; complete X₀=false; complete global Xₙ=false; finite sample=${flags.finiteSample}; two-parameter slice=${flags.twoParameterSlice}; projection=${flags.projectionApplied}; fractal boundary=false; geometric zoom=false.`;
    const normalization = record.kind === "local_inverse_branch_patch" ? (this.localComparison === "normalized_log_comparison" ? "local_log_recenter_normalization" : "raw_projected_panel_fit") :
      record.kind === "pullback_preflight_refusal" || record.kind === "local_branch_patch_refusal" ? "none" :
      this.localFit && record.kind === "finite_pullback_projection" && this.scope === "one-ancestor" ? "ancestor_recenter_fit" : "global_uniform_fit";
    const inverseBranchScaling = record.kind === "local_inverse_branch_patch" ? `local_log_1_over_${record.D}` : "unresolved";
    this.root.querySelector("[data-geometry-scale]").textContent = `Visual camera dolly only; display normalization=${normalization}; D² metric metadata=${this.parameters.D ** 2} (not applied); inverse branch scaling=${inverseBranchScaling}; geometricZoomApplied=false.`;
    this.root.dataset.displayNormalization = normalization;
    this.root.dataset.displayNormalizationFactor = String(this.displayNormalizationFactor ?? "");
    this.root.dataset.metricScaleD2Metadata = String(this.parameters.D ** 2);
    this.root.dataset.inverseBranchScaling = inverseBranchScaling;
    this.root.dataset.localChartNormalization = record.kind === "local_inverse_branch_patch" && this.localComparison === "normalized_log_comparison" ? "true" : "false";
    const refused = record.kind === "pullback_preflight_refusal" || record.kind === "local_branch_patch_refusal";
    this.setState(refused ? "refused" : "ready",
      refused ? record.reason : `${this.backend} · ${record.kind === "declared_parameter_subfamily" ? "two declared root-labelled parameter surfaces" : String(record.pointCount ?? record.points?.length ?? 0) + " finite points"} · cache ${this.cache.size}/${CACHE_LIMIT}.`);
    this.canvas.hidden = false;
    const simpleError = this.root.querySelector("[data-simple-geometry-error]");
    if (simpleError) { simpleError.hidden = true; simpleError.textContent = ""; }
    this.updateSimpleGuide(record);
    this.render();
  }

  updateSimpleGuide(record) {
    const caption = this.root.querySelector("[data-simple-geometry-caption]");
    const status = this.root.querySelector("[data-simple-geometry-status]");
    const explore = this.root.querySelector("[data-simple-geometry-action='explore']");
    const comparison = this.root.querySelector("[data-simple-geometry-action='comparison']");
    const surface = this.root.querySelector("[data-simple-geometry-action='surface']");
    if (!caption || !status || !explore || !comparison || !surface) return;
    if (record.kind === "local_branch_patch_refusal") {
      caption.textContent = `This local patch was not generated: ${record.reason}`;
      status.textContent = "Choose another visible surface vertex, or return to the sampled surface.";
      explore.hidden = true; comparison.hidden = true; surface.hidden = false;
      return;
    }
    if (record.kind === "declared_parameter_subfamily") {
      const selected = this.selectedSliceVertex;
      caption.textContent = `A 3D view of a sampled X₀ slice at λ=${this.parameters.lambda}, κ=${this.parameters.kappa}; π=(Re z₁, Im z₁, Re z₄). ${record.branches[0].records.length * 2} validated mesh vertices; selected ${selected ? selected.id : "a default interior vertex"}.`;
      status.textContent = `Visual camera · ${Number(this.root.dataset.cameraScale).toFixed(1)}× · click or use arrows to choose a local patch.`;
      explore.hidden = false; explore.disabled = false; explore.textContent = "Explore this patch";
      comparison.hidden = true; surface.hidden = true;
      return;
    }
    if (record.kind === "local_inverse_branch_patch") {
      caption.textContent = `${this.localComparison === "normalized_log_comparison" ? "Normalized local-log panels" : "Raw projected panels"}: left aqua is the X₀ parent patch; right violet is one X₁ inverse branch. ${record.pointCount} paired samples · D=${record.D} · root tuple (${record.rootMultiIndex.join(", ")}) · comparison error ${record.maxLocalScaleError.toExponential(2)}.`;
      status.textContent = `Visual camera · ${Number(this.root.dataset.cameraScale).toFixed(1)}× · ${this.localComparison === "raw_projected_patches" ? "raw projected parent and child patches" : "recentered local-log comparison; child offsets multiplied by D"}.`;
      explore.hidden = true; comparison.hidden = false; surface.hidden = false;
      comparison.textContent = this.localComparison === "raw_projected_patches" ? "Show local comparison" : "Show raw projections";
      return;
    }
  }

  mountSlice(record) {
    const scale = renderFit(record.branches.map((branch) => branch.positions));
    this.displayNormalizationFactor = scale;
    this.sliceRecord = record;
    this.sliceMeshes = [];
    record.branches.forEach((branch, index) => {
      const geometry = positionGeometry(branch.positions, branch.phases, scale);
      geometry.setIndex(new THREE.BufferAttribute(branch.indices, 1)); geometry.computeVertexNormals();
      const material = new THREE.MeshPhysicalMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.25, metalness: 0.18, transmission: 0.08, thickness: 0.18, transparent: true, opacity: index ? 0.66 : 0.82, emissive: 0x101522, emissiveIntensity: 0.48 });
      const mesh = new THREE.Mesh(geometry, material); mesh.userData = { role: "declared_parameter_subfamily", rootLabel: index, records: branch.records }; this.group.add(mesh); this.sliceMeshes.push(mesh);
      const halo = new THREE.Mesh(geometry.clone(), new THREE.MeshBasicMaterial({ color: index ? 0xd55fff : 0x3effdc, transparent: true, opacity: 0.055, side: THREE.BackSide, depthWrite: false })); halo.scale.setScalar(1.015); this.group.add(halo);
    });
    const row = record.phiSegments + 1;
    if (!this.selectedSliceVertex || !record.branches[this.selectedSliceVertex.branch]?.records[this.selectedSliceVertex.vertexIndex]) {
      const branch = 0, vertexIndex = Math.floor(record.thetaSegments / 2) * row + Math.max(4, Math.min(record.phiSegments - 4, Math.round(record.phiSegments * 0.22)));
      this.selectedSliceVertex = { branch, vertexIndex, id: record.branches[branch].records[vertexIndex]?.id };
    }
    this.drawSliceSelection();
  }

  mountLocalPatch(record) {
    const normalized = this.localComparison === "normalized_log_comparison";
    const parentPositions = record.parentPoints.flatMap((point) => normalized ? point.normalizedLocalPosition : point.rawPosition);
    const childPositions = record.children.flatMap((point) => normalized ? point.normalizedLocalPosition : point.rawPosition);
    const combined = [...parentPositions, ...childPositions];
    const scale = renderFit([combined], 2.25);
    this.displayNormalizationFactor = scale;
    const makePatch = (positions, color, shift) => {
      const geometry = positionGeometry(positions, new Array(positions.length / 3).fill(color === 0x42f5d1 ? 0.35 : 0.78), scale);
      geometry.setIndex(new THREE.BufferAttribute(record.indices, 1)); geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color, vertexColors: true, side: THREE.DoubleSide, roughness: .28, metalness: .12, transmission: .05, transparent: true, opacity: .82 }));
      mesh.position.x = shift; this.group.add(mesh);
      const dots = new THREE.Points(geometry.clone(), new THREE.PointsMaterial({ color, size: .09, transparent: true, opacity: .9, sizeAttenuation: true, depthWrite: false }));
      dots.position.x = shift; this.group.add(dots);
    };
    makePatch(parentPositions, 0x42f5d1, -3.2);
    makePatch(childPositions, 0xc77dff, 3.2);
  }

  mountPoints(record) {
    const flattened = [], phases = [];
    const simpleProjection = this.root.dataset.presentationMode === "simple" && record.kind === "finite_pullback_projection";
    record.points.forEach((point) => { flattened.push(...(simpleProjection ? point.simplePosition : point.position)); phases.push(point.phase); });
    const local = record.kind === "finite_pullback_projection" && record.scope === "one-ancestor" && this.localFit;
    const ancestorDisplayPosition = simpleProjection && record.ancestorCoordinates ? window.GeometryExplorationContract.simpleProjection(record.ancestorCoordinates) : record.ancestorPosition;
    const origin = local ? ancestorDisplayPosition : [0, 0, 0];
    const fitValues = record.kind === "finite_pullback_projection" && ancestorDisplayPosition ? [...flattened, ...ancestorDisplayPosition] : flattened;
    const scale = renderFit([fitValues], 3.1, origin, local);
    this.displayNormalizationFactor = scale;
    const geometry = positionGeometry(flattened, phases, scale, origin);
    const material = new THREE.PointsMaterial({ size: record.kind === "finite_pullback_projection" ? (simpleProjection ? 0.34 : 0.14) : record.kind === "phase_torus_display_embedding" ? 0.105 : 0.074, vertexColors: true, transparent: true, opacity: simpleProjection ? 1 : 0.86, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.activePointGeometry = geometry;
    this.activePointCloud = new THREE.Points(geometry, material);
    this.group.add(this.activePointCloud);
    if (record.kind === "finite_pullback_projection" && record.scope === "one-ancestor" && ancestorDisplayPosition) {
      const sourceGeometry = positionGeometry(ancestorDisplayPosition, [0.12], scale, origin);
      this.group.add(new THREE.Points(sourceGeometry, new THREE.PointsMaterial({ color: 0xffe06d, size: simpleProjection ? 0.38 : 0.27, transparent: true, opacity: 1, sizeAttenuation: true, depthWrite: false })));
      if (simpleProjection && record.depth === 1) {
        const source = [(ancestorDisplayPosition[0] - origin[0]) * scale, (ancestorDisplayPosition[1] - origin[1]) * scale, (ancestorDisplayPosition[2] - origin[2]) * scale];
        const segments = new Float32Array(record.points.length * 6);
        record.points.forEach((point, index) => {
          segments.set(source, index * 6);
          segments.set([(point.simplePosition[0] - origin[0]) * scale, (point.simplePosition[1] - origin[1]) * scale, (point.simplePosition[2] - origin[2]) * scale], index * 6 + 3);
        });
        const lines = new THREE.BufferGeometry(); lines.setAttribute("position", new THREE.BufferAttribute(segments, 3));
        this.group.add(new THREE.LineSegments(lines, new THREE.LineBasicMaterial({ color: 0x54e8d1, transparent: true, opacity: 0.45, depthWrite: false })));
      }
    }
  }

  describe(record) {
    const base = `<strong>Formula binding:</strong> <code>W_kappa_torus4_v1</code>, with runtime λ=${this.parameters.lambda}, κ=${this.parameters.kappa} embedded as real complex values. `;
    if (record.kind === "declared_parameter_subfamily") return base + `<strong>Declared parameter subfamily.</strong> Set z₁=eⁱθ, z₂=eⁱφ, z₃=1 and solve z₄²−(λ−z₁−z₂−1)z₄+κ/(z₁z₂)=0 for each (θ,φ)∈S¹×S¹. The rendered coordinates are π=(Re z₁, Im z₁, Re z₄), followed by a uniform display fit. z₃ is fixed; z₂ remains only as φ, and Im z₄ is omitted from the axes. Color is phase(z₄), an auxiliary domain-color encoding. The two colours are ordered quadratic-root labels only—not sheets, covering branches, components, or global topology. Max floating residual: ${record.maxResidual.toExponential(2)}.`;
    if (record.kind === "local_branch_patch_refusal") return `<strong>Local patch request refused before child generation.</strong> ${record.reason} The requested sampled contour is not treated as a geometric boundary.`;
    if (record.kind === "local_inverse_branch_patch") return base + `<strong>Local inverse-branch patch.</strong> ${record.pointCount} source points from ${record.sourcePatchId} and the selected root tuple (${record.rootMultiIndex.join(",")}) are compared under P<sub>${record.D}</sub>. The local-log comparison reports max D(w′−w′₀)−(w−w₀) error ${record.maxLocalScaleError.toExponential(2)}. Raw 3D panels remain projections; normalized panels are display coordinates, not a global metric theorem. Max power residual ${record.maxParentResidualMagnitude.toExponential(2)}; max inherited W residual ${record.maxMembershipResidualMagnitude.toExponential(2)}.`;
    if (record.kind === "phase_torus_display_embedding") return base + `<strong>Finite validated sample display embedding.</strong> ${record.sampleModel.sampleCount} deterministic X₀ samples are encoded by arg(z₁), arg(z₂), and clipped log|z₃| in a display torus. The torus is not X₀; periodic seam/overlap and density are display effects. Each point retains finite numerical membership only, never completeness.`;
    if (record.kind === "finite_validated_sample_cloud") return base + `<strong>Finite validated sample cloud.</strong> Each point is one deterministic accepted X₀ sample projected by π=(Re z₁, Im z₁, Re z₄), then uniformly display-fitted. Im z₄, z₂, and z₃ are discarded; projected overlap neither identifies source points nor establishes topology.`;
    if (record.kind === "pullback_preflight_refusal") return `<strong>Request refused before pullback generation.</strong> ${record.reason} Source: ${record.sourceSamplerId}; map: ${record.mapId}; D=${record.D}; n=${record.depth}; scope=${record.scope}.`;
    return base + `<strong>Finite pullback projection.</strong> P<sub>${record.D}</sub>(z)=(z₁<sup>${record.D}</sup>,…,z₄<sup>${record.D}</sup>); requested X<sub>${record.depth}</sub> over ${record.scope === "one-ancestor" ? "selected ancestor " + record.selectedAncestorId : "the finite X₀ seed"}. ${record.pointCount} points under cap ${record.preflight.cap}. Each point retains its parent ID, four root indices, parent power residual and base membership residual. Display π=(Re z₁, Im z₁, Re z₄); projection overlap is not source identity. Complete global Xₙ is not rendered. Max parent residual ${record.maxPowerResidualMagnitude.toExponential(2)}; max base residual ${record.maxBaseMembershipResidualMagnitude.toExponential(2)}.`;
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
  const hero = document.querySelector(".mode-hero");
  if (!root || !hero) return;
  hero.after(root);
  if (!window.GeometryExplorer) window.GeometryExplorer = new GeometryExplorer(root);
});
