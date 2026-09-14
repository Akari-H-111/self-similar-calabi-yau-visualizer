"use strict";

const statusElement = document.querySelector("#system-status");
const dataElement = document.querySelector("#system-data");
const rendererElement = document.querySelector("#base-renderer");
const pullbackElement = document.querySelector("#one-step-pullback");

const fields = {
  project: document.querySelector("#project-value"),
  version: document.querySelector("#version-value"),
  schemaVersion: document.querySelector("#schema-version-value"),
  D: document.querySelector("#d-value"),
  lambda: document.querySelector("#lambda-value"),
  kappa: document.querySelector("#kappa-value"),
  requestedDepth: document.querySelector("#depth-value"),
  metricScale: document.querySelector("#metric-scale-value"),
  sheetDegree: document.querySelector("#sheet-degree-value"),
  definingFunctionStatus: document.querySelector("#w-status-value")
};

function displayScene(scene) {
  const parameters = scene.mathematics.parameters;

  fields.project.textContent = scene.project;
  fields.version.textContent = scene.version;
  fields.schemaVersion.textContent = String(scene.schemaVersion);
  fields.D.textContent = String(parameters.D);
  fields.lambda.textContent = String(parameters.lambda);
  fields.kappa.textContent = String(parameters.kappa);
  fields.requestedDepth.textContent = String(scene.request.requestedDepth);
  fields.metricScale.textContent = String(scene.derived.metricScale);
  fields.sheetDegree.textContent = String(scene.derived.sheetDegree);
  fields.definingFunctionStatus.textContent = scene.mathematics.baseHypersurface.definingFunction.representation;
}

function resetRenderedState() {
  dataElement.hidden = true;
  rendererElement.hidden = true;
  rendererElement.textContent = "";
  delete rendererElement.dataset.state;
  delete rendererElement.dataset.geometryRendered;
  pullbackElement.hidden = true;
  pullbackElement.textContent = "";
  delete pullbackElement.dataset.state;
  delete pullbackElement.dataset.depth;
  delete pullbackElement.dataset.geometryRendered;
  delete pullbackElement.dataset.sheetsMaterialized;
}

async function loadSystemConfiguration() {
  try {
    const response = await fetch("data/system.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }

    const rawScene = await response.json();
    const scene = SceneSpec.validateAndNormalizeScene(rawScene);

    const baseModel = BaseRenderer.renderBaseScene(scene, rendererElement);
    OneStepPullback.renderOneStepPullback(scene, baseModel, pullbackElement);
    displayScene(scene);
    dataElement.hidden = false;
    statusElement.dataset.state = "ready";
    statusElement.textContent = "Loaded, validated, and initialized the base plus one-step pullback renderer successfully.";
  } catch (error) {
    console.error("Failed to load, validate, or render the one-step scene:", error);
    resetRenderedState();
    statusElement.dataset.state = "error";
    statusElement.textContent = `Failed to load, validate, or render data/system.json: ${error.message}`;
  }
}

loadSystemConfiguration();
