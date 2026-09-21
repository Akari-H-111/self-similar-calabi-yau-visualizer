"use strict";

const assert = require("node:assert/strict");
const MathView = require("./geometry-exploration-math.js");
const Contract = require("./geometry-exploration-contract.js");
const scene = require("./data/system.v2.json");
const pullbackConfig = require("./data/geometric-pullback-config.v1.json");

const thetaSegments = 64, phiSegments = 46, row = phiSegments + 1;
const slice = MathView.declaredSlice(scene, { thetaSegments, phiSegments });
assert.equal(slice.kind, "declared_parameter_subfamily");
assert.equal(slice.pointCount, slice.branches.reduce((count, branch) => count + branch.valid.filter(Boolean).length, 0));
assert.equal(slice.branches[0].records.length, (thetaSegments + 1) * (phiSegments + 1));
assert.ok(slice.branches[0].records.every((record) => record.coordinates.length === 4 && record.id.startsWith("slice-b0-")));

const request = { branch: 0, vertexIndex: 32 * row + 10, radius: 4, D: 2, rootMultiIndex: [0, 0, 0, 0] };
const options = { powerResidualTolerance: pullbackConfig.powerResidualTolerance };
const patch = Contract.createLocalBranchPatch(scene, slice, pullbackConfig, { ...request, depth: 1 });
const replay = Contract.createLocalBranchPatch(scene, slice, pullbackConfig, { ...request, depth: 1 });
assert.equal(patch.kind, "local_inverse_branch_patch");
assert.equal(patch.pointCount, 81);
assert.equal(patch.children.length, 81);
assert.equal(patch.indices.length, 8 * 8 * 6);
assert.deepEqual(patch.children.map((child) => child.id), replay.children.map((child) => child.id));
assert.equal(patch.selectedVertexId, request.branch === 0 ? "slice-b0-i32-j10" : "slice-b1-i32-j10");
assert.equal(patch.parentPoints[40].id, patch.selectedVertexId, "the displayed center must remain the selected source root");
assert.equal(patch.chart.selectedCenterId, patch.selectedVertexId);
assert.equal(patch.chart.pathConsistencyChecked, true);
assert.ok(patch.parentPoints.every((parent) => parent.coordinates.every((z) => Number.isFinite(z.re) && Number.isFinite(z.im) && Math.hypot(z.re, z.im) > 0)));
assert.ok(patch.children.every((child, index) => child.parentId === patch.parentPoints[index].id && child.parentRelation.accepted));
assert.ok(patch.children.every((child) => child.membershipResidualMagnitude < 1e-10));
assert.ok(patch.maxLocalScaleError <= 1e-12);
assert.equal(patch.truthFlags.completeX0Rendered, false);
assert.equal(patch.truthFlags.completeGlobalXnRendered, false);
assert.equal(patch.truthFlags.geometricZoomApplied, false);
assert.equal(patch.truthFlags.fractalBoundaryClaimed, false);
assert.equal(patch.preflight.requiredPointCount, "81");

const boundary = MathView.localBranchPatch(scene, slice, { ...request, vertexIndex: 0 }, options);
assert.equal(boundary.kind, "local_branch_patch_refusal");
assert.equal(boundary.points.length, 0);
const invalidRoot = MathView.localBranchPatch(scene, slice, { ...request, rootMultiIndex: [2, 0, 0, 0] }, options);
assert.equal(invalidRoot.kind, "local_branch_patch_refusal");
assert.equal(invalidRoot.points.length, 0);
const unresolved = MathView.localBranchPatch(scene, slice, { ...request, vertexIndex: 32 * row + 23 }, options);
assert.equal(unresolved.kind, "local_branch_patch_refusal");
assert.match(unresolved.reason, /roots are numerically unresolved/);
const overCap = MathView.localBranchPatch(scene, slice, request, { ...options, cap: 80 });
assert.equal(overCap.kind, "local_branch_patch_refusal");
assert.equal(overCap.generatedPointCountOnRefusal, 0);
assert.match(overCap.reason, /exceeds its materialization cap/);
const discontinuous = MathView.localBranchPatch(scene, slice, request, { ...options, argumentContinuityLimit: 0.01 });
assert.equal(discontinuous.kind, "local_branch_patch_refusal");
assert.equal(discontinuous.generatedPointCountOnRefusal, 0);
assert.match(discontinuous.reason, /argument-continuity bound/);

// Regression for the former row-order selection bug: this seed was silently
// replaced by the other quadratic root even though the local scale residual
// was zero.  A successful patch must keep its exact requested center.
const previouslyReplacedCenter = MathView.localBranchPatch(scene, slice, {
  ...request, vertexIndex: 8 * row + 16
}, options);
assert.equal(previouslyReplacedCenter.kind, "local_inverse_branch_patch");
assert.equal(previouslyReplacedCenter.selectedVertexId, "slice-b0-i8-j16");
assert.equal(previouslyReplacedCenter.parentPoints[40].id, "slice-b0-i8-j16");

// A closed-loop disagreement is not a valid local chart.  It must fail closed
// rather than selecting a branch according to traversal order.
const pathDependent = MathView.localBranchPatch(scene, slice, {
  ...request, vertexIndex: 12 * row + 8
}, options);
assert.equal(pathDependent.kind, "local_branch_patch_refusal");
assert.equal(pathDependent.generatedPointCountOnRefusal, 0);
assert.match(pathDependent.reason, /path-dependent/);

let anchoredAccepted = 0;
for (let branch = 0; branch < 2; branch += 1) for (let i = 4; i <= 60; i += 4) for (let j = 4; j <= 42; j += 4) {
  const candidate = MathView.localBranchPatch(scene, slice, { ...request, branch, vertexIndex: i * row + j }, options);
  if (candidate.kind !== "local_inverse_branch_patch") continue;
  anchoredAccepted += 1;
  assert.equal(candidate.parentPoints[40].id, candidate.selectedVertexId, `center changed at branch ${branch}, i=${i}, j=${j}`);
  assert.equal(candidate.chart.pathConsistencyChecked, true);
}
assert.ok(anchoredAccepted > 0, "the centered regression sweep must include admitted patches");

console.log("Local branch geometry view v1: center-anchored source records, path-consistent local chart, inverse branch, replay, and refusals passed");
