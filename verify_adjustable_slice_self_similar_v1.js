"use strict";

const assert = require("node:assert/strict");
const Registry = require("./slice-preset-registry.js");
const MathView = require("./geometry-exploration-math.js");
const scene = require("./data/system.v2.json");
const pullback = require("./data/geometric-pullback-config.v1.json");

const direct = MathView.declaredSlice(scene, { thetaSegments: 64, phiSegments: 46 });
const balanced = Registry.generateSlice(scene, "laurent-balanced", Registry.PRESETS["laurent-balanced"].parameters);
assert.deepEqual([...balanced.branches[0].positions], [...direct.branches[0].positions], "the Laurent adapter preserves the default mesh");
assert.deepEqual(balanced.branches[0].records.map((record) => record.id), direct.branches[0].records.map((record) => record.id), "the Laurent adapter preserves stable ids");

for (const [id, preset] of Object.entries(Registry.PRESETS)) {
  const slice = Registry.generateSlice(scene, id, preset.parameters);
  assert.equal(slice.slicePresetId, id);
  assert.equal(slice.truthFlags.globalSelfSimilarityClaimed, false);
  assert.equal(slice.truthFlags.fractalBoundaryClaimed, false);
  assert.ok(slice.sourceRecords.every((record) => record.coordinates.length === 4 && record.coordinates.every((z) => Number.isFinite(z.re) && Number.isFinite(z.im))));
  const demo = slice.sourceRecords.find((record) => record.id === slice.demonstrationSourceId);
  assert.ok(demo, id + " must name a deterministic demonstration source");
  const patch = Registry.generateLocalPatch(scene, slice, { branch: demo.branch, vertexIndex: demo.i * (slice.phiSegments + 1) + demo.j, radius: slice.demonstrationRadius, D: 2, depth: 1, rootMultiIndex: [0, 0, 0, 0] }, { cap: 10000, powerResidualTolerance: pullback.powerResidualTolerance });
  assert.equal(patch.kind, "local_inverse_branch_patch", id + " demonstration must be admitted");
  assert.equal(patch.truthFlags.slicePresetId, id);
  assert.equal(patch.truthFlags.localInverseSimilarityCompared, true);
  assert.ok(patch.parentPoints.every((point) => point.coordinates.every((z) => Math.hypot(z.re, z.im) > 0)));
  assert.ok(patch.children.every((child, index) => child.parentId === patch.parentPoints[index].id && child.parentRelation.accepted));
  assert.ok(patch.maxLocalScaleError <= 1e-12);
  assert.equal(patch.preflight.admitted, true);
}

const fermat = Registry.generateSlice(scene, "fermat-quintic", Registry.PRESETS["fermat-quintic"].parameters);
assert.equal(fermat.branches.length, 25);
assert.equal(new Set(fermat.phasePatchLabels).size, 25);
assert.equal(fermat.demonstrationSourceId, "fermat-k0-0-t12-x7");
assert.equal(fermat.demonstrationRadius, 4);
assert.ok(fermat.sourceRecords.every((record) => record.residualMagnitude <= record.residualTolerance), "every Fermat vertex is checked before triangulation");
assert.ok(fermat.sourceRecords.every((record) => record.coordinates[2].re === -1 && record.coordinates[3].re === -1));
const zero = fermat.sourceRecords.find((record) => record.coordinates.some((z) => Math.hypot(z.re, z.im) <= 1e-10));
const zeroRefusal = Registry.generateLocalPatch(scene, fermat, { branch: zero.branch, vertexIndex: zero.i * (fermat.phiSegments + 1) + zero.j, radius: 2, D: 2, depth: 1, rootMultiIndex: [0, 0, 0, 0] }, { cap: 10000, powerResidualTolerance: pullback.powerResidualTolerance });
assert.equal(zeroRefusal.kind, "local_branch_patch_refusal");
assert.equal(zeroRefusal.generatedPointCountOnRefusal, 0);
assert.match(zeroRefusal.reason, /ineligible/);
assert.ok(zeroRefusal.suggestedEligibleSourceId && fermat.localChartCandidates.includes(zeroRefusal.suggestedEligibleSourceId));
const demo = fermat.sourceRecords.find((record) => record.id === fermat.demonstrationSourceId);
const reviewed = Registry.generateLocalPatch(scene, fermat, { branch: demo.branch, vertexIndex: demo.i * (fermat.phiSegments + 1) + demo.j, radius: fermat.demonstrationRadius, D: 2, depth: 1, rootMultiIndex: [0, 0, 0, 0] }, { cap: 10000, powerResidualTolerance: pullback.powerResidualTolerance });
assert.equal(reviewed.pointCount, 81);
assert.equal(reviewed.sourcePatchId, "fermat-local-b0-v187-r4");
assert.deepEqual(reviewed.rootMultiIndex, [0, 0, 0, 0]);
assert.ok(reviewed.maxSourceResidualMagnitude <= 1e-12);
assert.ok(reviewed.maxParentResidualMagnitude <= 1e-12);
assert.ok(reviewed.maxMembershipResidualMagnitude <= 1e-10);
assert.equal(reviewed.maxLocalScaleError, 0);
assert.equal(reviewed.preflight.cap, 10000);
const capRefusal = Registry.generateLocalPatch(scene, fermat, { branch: demo.branch, vertexIndex: demo.i * (fermat.phiSegments + 1) + demo.j, radius: fermat.demonstrationRadius, D: 2, depth: 1, rootMultiIndex: [0, 0, 0, 0] }, { cap: 80, powerResidualTolerance: pullback.powerResidualTolerance });
assert.equal(capRefusal.kind, "local_branch_patch_refusal");
assert.equal(capRefusal.generatedPointCountOnRefusal, 0);
assert.equal(capRefusal.requiredPointCount, "81");

console.log("Adjustable slice registry v1: Laurent equivalence, 25 Fermat phases, local replay, and fail-closed refusals passed");
