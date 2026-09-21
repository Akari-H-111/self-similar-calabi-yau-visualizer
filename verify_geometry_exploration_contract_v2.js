"use strict";

const assert = require("node:assert/strict");
const Contract = require("./geometry-exploration-contract.js");
const Power = require("./torus-power-evaluator.js");
const Evaluator = require("./laurent-evaluator.js");
const scene = require("./data/system.v2.json");
const baseConfig = require("./data/base-geometric-render-config.v1.json");
const pullbackConfig = require("./data/geometric-pullback-config.v1.json");

const status = (lambda, kappa) => Contract.discriminant(lambda, kappa).status;
assert.equal(status("1", "1"), "regular");
assert.equal(status("2", "0.01024"), "singular");
assert.equal(status("2", "0"), "regular");
assert.equal(status("2", "0.010240000000001"), "numerical-inconclusive");
assert.equal(status("bad", "1"), "numerical-inconclusive");
assert.equal(Contract.discriminant("2", "0.01024").smoothnessTheoremClaimed, false);

for (const [kind, expected] of [
  ["declared_parameter_subfamily", { finiteSample: false, twoParameterSlice: true, projectionApplied: true }],
  ["finite_validated_sample_cloud", { finiteSample: true, twoParameterSlice: false, projectionApplied: true }],
  ["phase_torus_display_embedding", { finiteSample: true, twoParameterSlice: false, projectionApplied: false }]
]) {
  const flags = Contract.viewFlags(kind);
  for (const [key, value] of Object.entries(expected)) assert.equal(flags[key], value, kind + ":" + key);
  assert.equal(flags.completeX0Rendered, false);
  assert.equal(flags.completeGlobalXnRendered, false);
  assert.equal(flags.geometricZoomApplied, false);
}

function changedD(D) {
  const copy = structuredClone(scene);
  copy.mathematics.parameters.D = D;
  return copy;
}
function request(D, scope, depth, ancestorIndex = 0) {
  return Contract.createPullback(changedD(D), baseConfig, pullbackConfig, { scope, depth, ancestorIndex });
}

const global = request(2, "finite-seed", 1);
assert.equal(global.pointCount, 8192);
assert.equal(global.preflight.requiredPointCount, "8192");
assert.equal(global.truthFlags.completeFiberOverFiniteScope, true);
assert.equal(global.truthFlags.completeGlobalXnRendered, false);
assert.equal(global.truthFlags.geometricZoomApplied, false);
assert.equal(global.projectionId, Contract.PROJECTION_ID);
assert.equal(global.sourceSamplerId, pullbackConfig.sourceSamplerId);

const scoped = request(2, "one-ancestor", 2);
const replay = request(2, "one-ancestor", 2);
assert.equal(scoped.pointCount, 256);
assert.equal(scoped.simpleProjectionId, Contract.SIMPLE_PROJECTION_ID);
assert.equal(scoped.simpleProjectionCollisionReport.projectionId, Contract.SIMPLE_PROJECTION_ID);
assert.equal(scoped.simpleProjectionCollisionReport.distinctVisibleMarks + scoped.simpleProjectionCollisionReport.mergedSourcePointCount, scoped.pointCount);
assert.deepEqual(scoped.points[0].simplePosition, Contract.simpleProjection(scoped.points[0].source.coordinates));
assert.deepEqual(scoped.points.map((point) => point.id), replay.points.map((point) => point.id));
const depthOne = request(2, "one-ancestor", 1);
const parents = new Map(depthOne.points.map((point) => [point.id, point]));
for (const point of scoped.points) {
  const parent = parents.get(point.parentId);
  assert.ok(parent, "every depth-2 point must retain a depth-1 parent");
  assert.equal(point.rootMultiIndex.length, 4);
  assert.ok(point.rootMultiIndex.every((index) => Number.isInteger(index) && index >= 0 && index < 2));
  assert.equal(point.ancestorSampleId, scoped.selectedAncestorId);
  assert.equal(point.parentRelation.accepted, true);
  assert.equal(point.baseMembership.accepted, true);
  assert.ok(point.baseMembership.residualMagnitude <= point.baseMembership.threshold);
  const lifted = Power.coordinatePower(2, point.source.coordinates);
  for (let coordinate = 0; coordinate < 4; coordinate++) {
    assert.ok(Evaluator.abs(Evaluator.sub(lifted[coordinate], parent.source.coordinates[coordinate])) < 1e-10);
  }
}
assert.equal(request(3, "one-ancestor", 1).pointCount, 81);

for (const [D, scope, depth, count] of [
  [2, "finite-seed", 2, "131072"],
  [3, "finite-seed", 1, "41472"],
  [2, "one-ancestor", 4, "65536"],
  [4, "one-ancestor", 2, "65536"]
]) {
  const refused = request(D, scope, depth);
  assert.equal(refused.kind, "pullback_preflight_refusal");
  assert.equal(refused.preflight.requiredPointCount, count);
  assert.equal(refused.preflight.generatedPointCountOnRefusal, 0);
  assert.equal(refused.points.length, 0);
  assert.equal(refused.truthFlags.finiteSample, false);
  assert.equal(refused.truthFlags.geometricZoomApplied, false);
}
assert.throws(() => request(2, "one-ancestor", 1, 512), RangeError);
assert.throws(() => request(2, "unknown", 1), TypeError);
assert.throws(() => Contract.preflight(1, 1, 1, 10000), TypeError);

console.log("Geometry exploration contract v2: discriminant, view flags, finite fibers, replay, and preflight refusal passed");
