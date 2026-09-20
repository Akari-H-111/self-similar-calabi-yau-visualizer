"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const scene = JSON.parse(fs.readFileSync("data/system.v2.json", "utf8"));
const config = JSON.parse(fs.readFileSync("data/base-geometric-render-config.v1.json", "utf8"));
const MathView = require("./geometry-exploration-math.js");
const Evaluator = require("./laurent-evaluator.js");

const slice = MathView.declaredSlice(scene, { thetaSegments: 24, phiSegments: 16 });
assert.equal(slice.kind, "declared_parameter_subfamily");
assert.equal(slice.formulaId, "W_kappa_torus4_v1");
assert.equal(slice.ambientProjection, "(Re(z1), Im(z1), Re(z4))");
assert.deepEqual(slice.fixedCoordinates, ["z3=1"]);
assert.deepEqual(slice.omittedFromDisplayAxes, ["z2 (retained as the phi parameter)", "Im(z4)"]);
assert.equal(slice.branches.length, 2);
assert.ok(slice.maxResidual < 1e-9, "constructed points must satisfy the declared Laurent residual budget");
for (const branch of slice.branches) {
  assert.equal(branch.positions.length, 3 * 25 * 17);
  assert.ok(branch.indices.length > 0);
  assert.ok(branch.residuals.every((value) => Number.isFinite(value) && value < 1e-9));
}
const again = MathView.declaredSlice(scene, { thetaSegments: 24, phiSegments: 16 });
assert.deepEqual(Array.from(again.branches[0].positions), Array.from(slice.branches[0].positions), "slice construction must be deterministic");
const cloud = MathView.finiteSampleCloud(scene, config);
assert.equal(cloud.kind, "finite_validated_sample_cloud");
assert.equal(cloud.points.length, cloud.sampleModel.sampleCount);
assert.ok(cloud.points.every((point) => point.source.membership.accepted));
const phase = MathView.torusEmbedding(scene, config);
assert.equal(phase.kind, "phase_torus_display_embedding");
assert.equal(phase.points.length, cloud.points.length);
const engine = fs.readFileSync("geometry-exploration-engine.js", "utf8");
assert.ok(engine.includes("WebGL2 fallback"));
assert.match(engine, /not sheets, covering branches, components/);
assert.equal(Evaluator.FORMULA_ID, MathView.FORMULA_ID);
console.log("Geometry exploration engine v1: mathematical contract checks passed");
