import * as THREE from "./vendor/three/build/three.webgpu.min.js";
import { OrbitControls } from "./vendor/three/addons/controls/OrbitControls.js";

// This adapter deliberately consumes the existing structural projection. It never calls a
// geometric runtime or turns a descriptor into a point, sheet, covering, or hypersurface.
const STORAGE_KEY = "self-similar-cy-presentation-camera-pose-v1";
const DEFAULT_POSE = Object.freeze({ position: [8.4, 6.6, 10.8], target: [0, 0.9, 0] });

function assertStructuralModel(model) {
  if (!model || model.structuralOnly !== true || model.truthfulness?.geometryRendered !== false ||
      model.truthfulness?.sheetsMaterialized !== false || model.truthfulness?.coveringStructureClaimed !== false) {
    throw new TypeError("3D presentation accepts only the existing non-geometric structural visualization model.");
  }
}

function readPose() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(value?.position) && Array.isArray(value?.target) && value.position.length === 3 && value.target.length === 3 &&
        [...value.position, ...value.target].every(Number.isFinite)) return value;
  } catch (_) { /* Local UI preference is optional. */ }
  return null;
}

function createRenderer(canvas) {
  // Three's WebGPURenderer selects WebGPU when available and uses its WebGL backend otherwise.
  return new THREE.WebGPURenderer({ canvas, antialias: true, alpha: false, forceWebGL: !navigator.gpu });
}

function descriptorTower(model) {
  const group = new THREE.Group();
  const nodes = model.nodes;
  const nodeGeometry = new THREE.BoxGeometry(2.7, 0.42, 1.15);
  const edgeGeometry = new THREE.CylinderGeometry(0.055, 0.055, 1, 12);
  const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0x2764c7, roughness: 0.42, metalness: 0.08 });
  const selectedMaterial = new THREE.MeshStandardMaterial({ color: 0xed8a2d, roughness: 0.38, metalness: 0.08 });
  const focusedMaterial = new THREE.MeshStandardMaterial({ color: 0x34a879, roughness: 0.38, metalness: 0.08 });
  const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x9db4dd, roughness: 0.58 });

  nodes.forEach((node, index) => {
    const box = new THREE.Mesh(nodeGeometry, node.selected ? selectedMaterial : node.focused ? focusedMaterial : nodeMaterial);
    box.position.set(0, (nodes.length - 1) * 0.86 - index * 1.72, 0);
    box.userData = Object.freeze({ role: "structural_descriptor", depth: node.depth });
    group.add(box);
  });
  for (let index = 0; index + 1 < nodes.length; index += 1) {
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.position.set(0, (nodes.length - 1) * 0.86 - index * 1.72 - 0.86, 0);
    edge.userData = Object.freeze({ role: "structural_pullback_relation" });
    group.add(edge);
  }
  return group;
}

function disposeObject(object) {
  object.traverse((item) => {
    item.geometry?.dispose?.();
    const materials = Array.isArray(item.material) ? item.material : [item.material];
    materials.forEach((material) => material?.dispose?.());
  });
}

class Structural3DPresentation {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector("canvas");
    this.status = root.querySelector("[data-presentation-camera-status]");
    this.renderer = createRenderer(this.canvas);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4f8ff);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.controls = new OrbitControls(this.camera, this.canvas);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.controls.enableDamping = !reducedMotion;
    this.root.dataset.reducedMotion = String(reducedMotion);
    this.controls.enablePan = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;
    this.controls.target.set(...DEFAULT_POSE.target);
    this.camera.position.set(...DEFAULT_POSE.position);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x34476a, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 7, 5);
    this.scene.add(key);
    this.scene.add(new THREE.GridHelper(11, 11, 0xb7c9e8, 0xd9e4f5));
    this.modelGroup = null;
    this.backend = navigator.gpu ? "WebGPU" : "WebGL2 fallback";
    this.mode = "simple";
    const markReady = () => {
      this.root.dataset.state = "ready";
      this.root.dataset.renderer = this.backend;
      const activateControl = this.root.querySelector('[data-presentation-camera-action="activate"]');
      if (activateControl) {
        activateControl.dataset.presentationCameraAction = "reset";
        activateControl.textContent = "Return to a good view";
      }
      this.resize();
      this.render();
      this.setStatus();
    };
    this.renderer.init().then(markReady).catch(() => {
      // An advertised WebGPU device can still fail initialization. Retry the safe WebGL path.
      this.backend = "WebGL2 fallback";
      this.renderer.dispose();
      this.renderer = new THREE.WebGPURenderer({ canvas: this.canvas, antialias: true, alpha: false, forceWebGL: true });
      return this.renderer.init().then(markReady);
    });
    this.controls.addEventListener("change", () => { this.root.dataset.cameraTransformApplied = "true"; this.render(); this.setStatus(); });
    this.resizeObserver = new ResizeObserver(() => { this.resize(); this.render(); });
    this.resizeObserver.observe(root.querySelector(".presentation-camera__stage"));
  }

  setMode(mode) {
    this.mode = mode === "expert" ? "expert" : "simple";
    this.controls.enablePan = this.mode === "expert";
    this.root.dataset.mode = this.mode;
    this.setStatus();
  }

  update(model) {
    assertStructuralModel(model);
    if (this.modelGroup) { this.scene.remove(this.modelGroup); disposeObject(this.modelGroup); }
    this.modelGroup = descriptorTower(model);
    this.scene.add(this.modelGroup);
    this.root.dataset.geometryRendered = "false";
    this.root.dataset.sheetsMaterialized = "false";
    this.root.dataset.coveringStructureClaimed = "false";
    this.root.dataset.geometricZoomApplied = "false";
    this.root.dataset.nodeCount = String(model.nodes.length);
    this.render();
  }

  reset() { this.camera.position.set(...DEFAULT_POSE.position); this.controls.target.set(...DEFAULT_POSE.target); this.root.dataset.cameraTransformApplied = "false"; this.controls.update(); this.render(); this.setStatus(); }
  toggleProjection() { const orthographic = this.camera.isOrthographicCamera; const next = orthographic ? new THREE.PerspectiveCamera(42, 1, 0.1, 100) : new THREE.OrthographicCamera(-6, 6, 4, -4, 0.1, 100); next.position.copy(this.camera.position); next.quaternion.copy(this.camera.quaternion); this.camera = next; this.controls.object = next; this.resize(); this.render(); this.setStatus(); }
  savePose() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ position: this.camera.position.toArray(), target: this.controls.target.toArray() })); } catch (_) {} this.setStatus("Camera pose saved locally; it is not mathematical or provenance state."); }
  restorePose() { const pose = readPose(); if (pose) { this.camera.position.set(...pose.position); this.controls.target.set(...pose.target); this.controls.update(); this.render(); } this.setStatus(pose ? "Saved local camera pose restored." : "No saved local camera pose exists."); }
  resize() { const stage = this.root.querySelector(".presentation-camera__stage"); const width = Math.max(1, stage.clientWidth); const height = Math.max(1, stage.clientHeight); this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); this.renderer.setSize(width, height, false); if (this.camera.isPerspectiveCamera) this.camera.aspect = width / height; else { const ratio = width / height; this.camera.left = -6 * ratio; this.camera.right = 6 * ratio; this.camera.top = 6; this.camera.bottom = -6; } this.camera.updateProjectionMatrix(); }
  render() { if (this.root.dataset.state === "ready") this.renderer.render(this.scene, this.camera); }
  setStatus(message) { this.status.textContent = message || `${this.backend} · ${this.camera.isOrthographicCamera ? "orthographic" : "perspective"} projection · presentation-only camera · geometry generation: never.`; }
}

let presentation = null;
export function initializeStructural3DPresentation(root = document.querySelector("#structural-3d-presentation")) {
  if (!root) return;
  if (presentation) return presentation;
  presentation = new Structural3DPresentation(root);
  presentation.setMode(document.querySelector('[data-ui-mode="expert"]')?.getAttribute("aria-pressed") === "true" ? "expert" : "simple");
  root.addEventListener("click", (event) => {
    const action = event.target.closest("[data-presentation-camera-action]")?.dataset.presentationCameraAction;
    if (action === "reset") presentation.reset();
    if (action === "projection") presentation.toggleProjection();
    if (action === "save") presentation.savePose();
    if (action === "restore") presentation.restorePose();
  });
  window.addEventListener("structural-presentation-model", (event) => presentation.update(event.detail));
  window.addEventListener("ui-presentation-mode", (event) => presentation.setMode(event.detail));
  if (window.__structuralPresentationModel) presentation.update(window.__structuralPresentationModel);
  return presentation;
}

window.Structural3DPresentation = Object.freeze({ initializeStructural3DPresentation, get instance() { return presentation; }, STORAGE_KEY });
