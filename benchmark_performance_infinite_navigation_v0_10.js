"use strict";

const { performance } = require("node:perf_hooks");
const rawSceneTemplate = require("./data/system.json");
const SceneSpec = require("./scene-spec.js");
const BaseRenderer = require("./base-renderer.js");
const OneStepPullback = require("./one-step-pullback.js");
const RecursiveLazyExpansion = require("./recursive-lazy-expansion.js");
const ZoomSemantics = require("./zoom-semantics.js");
const SheetBranchOrganization = require("./sheet-branch-organization.js");
const ArithmeticOverlays = require("./arithmetic-overlays.js");

const HORIZONS = Object.freeze([10, 100, 1000, 2500, 5000, 10000]);
const ADAPTIVE_STOP_MS = 2500;
const OVERLAY_REQUEST = Object.freeze([
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_CHANNELS,
  ArithmeticOverlays.OVERLAY_IDS.COORDINATE_ITERATE_RULE
]);

function cloneSceneWithDepth(requestedDepth) {
  const rawScene = JSON.parse(JSON.stringify(rawSceneTemplate));
  rawScene.request.requestedDepth = requestedDepth;
  return SceneSpec.validateAndNormalizeScene(rawScene);
}

function heapUsed() {
  return process.memoryUsage().heapUsed;
}

function maybeGc() {
  if (typeof global.gc === "function") {
    global.gc();
    return true;
  }
  return false;
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function bytesToMiB(value) {
  return round(value / (1024 * 1024));
}

function representativeStepIndexes(targetDepth) {
  if (targetDepth <= 1) {
    return new Set();
  }
  const totalCalls = targetDepth - 1;
  return new Set([
    1,
    Math.max(1, Math.floor(totalCalls * 0.25)),
    Math.max(1, Math.floor(totalCalls * 0.5)),
    Math.max(1, Math.floor(totalCalls * 0.75)),
    totalCalls
  ]);
}

function benchmarkHorizon(targetDepth) {
  const gcAvailable = maybeGc();
  const heapBefore = heapUsed();
  const scene = cloneSceneWithDepth(targetDepth);
  const baseModel = BaseRenderer.createBaseRenderModel(scene);
  const oneStepModel = OneStepPullback.createOneStepPullbackModel(scene, baseModel);
  let recursiveModel = RecursiveLazyExpansion.createRecursiveLazyExpansionModel(scene, baseModel, oneStepModel);

  const expansionCalls = Math.max(0, targetDepth - recursiveModel.materializedDepth);
  const sampleIndexes = representativeStepIndexes(targetDepth);
  const stepSamples = [];
  const expansionStart = performance.now();

  for (let callIndex = 1; callIndex <= expansionCalls; callIndex += 1) {
    const stepStart = performance.now();
    const previousDepth = recursiveModel.materializedDepth;
    recursiveModel = RecursiveLazyExpansion.expandOneLevel(recursiveModel);
    const stepElapsed = performance.now() - stepStart;

    if (recursiveModel.materializedDepth !== previousDepth + 1) {
      throw new Error(`Expansion contract failed at call ${String(callIndex)}.`);
    }
    if (sampleIndexes.has(callIndex)) {
      stepSamples.push(Object.freeze({
        callIndex,
        resultingDepth: recursiveModel.materializedDepth,
        elapsedMs: round(stepElapsed, 6)
      }));
    }
  }

  const cumulativeExpansionMs = performance.now() - expansionStart;
  const heapAfterExpansionBeforeGc = heapUsed();
  maybeGc();
  const heapAfterExpansionGc = heapUsed();

  if (recursiveModel.materializedDepth !== targetDepth || recursiveModel.levels.length !== targetDepth) {
    throw new Error(`Target depth ${String(targetDepth)} was not materialized exactly.`);
  }

  const focusStart = performance.now();
  const zoomModel = ZoomSemantics.createZoomFocusModel(scene, recursiveModel, targetDepth);
  const focusCreationMs = performance.now() - focusStart;

  const organizationStart = performance.now();
  const organizationModel = SheetBranchOrganization.createSheetBranchOrganizationModel(scene, recursiveModel, zoomModel);
  const organizationCreationMs = performance.now() - organizationStart;

  const overlayStart = performance.now();
  const overlayModel = ArithmeticOverlays.createArithmeticOverlayModel(
    scene,
    recursiveModel,
    zoomModel,
    organizationModel,
    OVERLAY_REQUEST
  );
  const overlayCreationMs = performance.now() - overlayStart;

  const heapAfterDerivedBeforeGc = heapUsed();
  maybeGc();
  const heapAfterDerivedGc = heapUsed();

  if (!zoomModel.focusAvailable || zoomModel.focusedDepth !== targetDepth || zoomModel.materializationTriggered) {
    throw new Error("Zoom semantic regression detected during benchmark.");
  }
  if (
    organizationModel.materializedDepth !== targetDepth ||
    organizationModel.levelOrganizations.length !== targetDepth ||
    organizationModel.materializationTriggered ||
    organizationModel.sheetsMaterialized ||
    organizationModel.geometryRendered
  ) {
    throw new Error("Sheet organization semantic regression detected during benchmark.");
  }
  if (
    overlayModel.materializedDepth !== targetDepth ||
    overlayModel.materializationTriggered ||
    overlayModel.recursionModified ||
    overlayModel.zoomModified ||
    overlayModel.sheetOrganizationModified ||
    overlayModel.geometryRendered
  ) {
    throw new Error("Arithmetic overlay semantic regression detected during benchmark.");
  }

  return Object.freeze({
    targetDepth,
    actualMaterializedDepth: recursiveModel.materializedDepth,
    expansionCalls,
    retainedLevelDescriptors: recursiveModel.levels.length,
    cumulativeExpansionMs: round(cumulativeExpansionMs),
    averageExpansionMs: round(expansionCalls === 0 ? 0 : cumulativeExpansionMs / expansionCalls, 6),
    representativeStepMs: stepSamples,
    heapObservation: Object.freeze({
      gcAvailable,
      beforeMiB: bytesToMiB(heapBefore),
      afterExpansionBeforeGcMiB: bytesToMiB(heapAfterExpansionBeforeGc),
      afterExpansionGcMiB: bytesToMiB(heapAfterExpansionGc),
      retainedExpansionDeltaMiB: bytesToMiB(heapAfterExpansionGc - heapBefore),
      temporaryExpansionApproxMiB: bytesToMiB(Math.max(0, heapAfterExpansionBeforeGc - heapAfterExpansionGc)),
      afterDerivedBeforeGcMiB: bytesToMiB(heapAfterDerivedBeforeGc),
      afterDerivedGcMiB: bytesToMiB(heapAfterDerivedGc),
      derivedRetainedDeltaMiB: bytesToMiB(heapAfterDerivedGc - heapAfterExpansionGc),
      derivedTemporaryApproxMiB: bytesToMiB(Math.max(0, heapAfterDerivedBeforeGc - heapAfterDerivedGc))
    }),
    derivedModelCreationMs: Object.freeze({
      focus: round(focusCreationMs, 6),
      organization: round(organizationCreationMs, 6),
      overlays: round(overlayCreationMs, 6)
    }),
    semanticResults: Object.freeze({
      focus: zoomModel.focusStatus,
      organization: organizationModel.organizationStatus,
      overlays: overlayModel.status,
      recursionModifiedByDerivedModels: false,
      geometryRendered: false,
      sheetsMaterialized: false
    })
  });
}

function estimateLargestPairScalingExponent(results) {
  if (results.length < 2) {
    return null;
  }
  const a = results[results.length - 2];
  const b = results[results.length - 1];
  if (a.cumulativeExpansionMs <= 0 || b.cumulativeExpansionMs <= 0) {
    return null;
  }
  return round(
    Math.log(b.cumulativeExpansionMs / a.cumulativeExpansionMs) /
      Math.log(b.targetDepth / a.targetDepth),
    3
  );
}

const results = [];
for (const horizon of HORIZONS) {
  const result = benchmarkHorizon(horizon);
  results.push(result);
  console.log(`BENCHMARK ${JSON.stringify(result)}`);

  if (result.cumulativeExpansionMs >= ADAPTIVE_STOP_MS) {
    console.log(
      `Adaptive stop: cumulative expansion at depth ${String(horizon)} reached ${String(result.cumulativeExpansionMs)} ms; deeper horizons are intentionally skipped.`
    );
    break;
  }
}

console.log(
  `SUMMARY ${JSON.stringify({
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    horizonsTested: results.map((result) => result.targetDepth),
    largestPairEmpiricalTimeExponent: estimateLargestPairScalingExponent(results),
    benchmarkThresholdIsSemanticLimit: false,
    browserEvidence: "not_tested",
    note: "Timing and heap values are environment-sensitive observations, not CI performance thresholds or mathematical depth limits."
  })}`
);
