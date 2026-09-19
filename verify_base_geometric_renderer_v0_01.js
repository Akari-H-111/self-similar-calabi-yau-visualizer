"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const ConcreteRuntimeSchema = require("./concrete-runtime-schema.js");
const ProjectionSliceSemantics = require("./projection-slice-semantics.js");
const LaurentEvaluator = require("./laurent-evaluator.js");
const BaseGeometricSampler = require("./base-geometric-sampler.js");
const BaseGeometricRenderer = require("./base-geometric-renderer.js");
const scene = require("./data/system.v2.json");
const view = require("./data/geometric-view.v1.json");
const config = require("./data/base-geometric-render-config.v1.json");

const root = __dirname;
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}
function gitBlobSha(source) {
  const body = Buffer.from(source, "utf8");
  return crypto.createHash("sha1").update("blob " + String(body.length) + "\0").update(body).digest("hex");
}
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const normalized = ConcreteRuntimeSchema.validateAndNormalizeV2(scene);
assert.equal(normalized.mathematics.baseHypersurface.definingFunction.representation.formulaId, "W_kappa_torus4_v1");
assert.equal(normalized.mathematics.ambient.coordinateCount, 4);
assert.equal(normalized.mathematics.ambient.nonzeroCoordinates, true);
assert.equal(normalized.mathematics.parameterDomain.runtimeRepresentation, "real_slice");
assert.equal(normalized.mathematics.parameterDomain.embedding, "real_to_complex");
ProjectionSliceSemantics.validateViewAgainstScene(view, scene);

const context = LaurentEvaluator.createEvaluationContext(scene);
assert.equal(context.formulaId, "W_kappa_torus4_v1");
assert.deepEqual(context.kappa, {re: 1, im: 0});
assert.deepEqual(context.lambda, {re: 1, im: 0});

const exactFixtureScene = clone(scene);
exactFixtureScene.mathematics.parameters.lambda = 5;
const exactContext = LaurentEvaluator.createEvaluationContext(exactFixtureScene);
const one = LaurentEvaluator.complex(1, 0);
const exactEvaluation = LaurentEvaluator.evaluateResidual(exactContext, [one, one, one, one]);
assert.equal(exactEvaluation.value.re, 5);
assert.equal(exactEvaluation.value.im, 0);
assert.equal(exactEvaluation.residualMagnitude, 0);

const unknownFormulaScene = clone(scene);
unknownFormulaScene.mathematics.baseHypersurface.definingFunction.representation.formulaId = "unknown_formula";
assert.throws(() => LaurentEvaluator.createEvaluationContext(unknownFormulaScene));
assert.throws(() => LaurentEvaluator.evaluateW(context, [LaurentEvaluator.complex(0, 0), one, one, one]));
assert.throws(() => LaurentEvaluator.evaluateW(context, [{re: Number.NaN, im: 0}, one, one, one]));
assert.throws(() => LaurentEvaluator.evaluateW(context, [{re: Number.POSITIVE_INFINITY, im: 0}, one, one, one]));

const validatedConfig = BaseGeometricSampler.validateConfig(config);
assert.equal(validatedConfig.randomnessAllowed, false);
assert.equal(validatedConfig.membershipTolerance.kind, "combined_absolute_relative");
assert.equal(validatedConfig.membershipTolerance.version, "v0.01");
assert.equal(validatedConfig.membershipTolerance.absolute, 5e-12);
assert.equal(validatedConfig.membershipTolerance.relative, 5e-12);
assert.equal(validatedConfig.parameterTripleBudget, 256);
assert.equal(validatedConfig.sampleBudget, 512);

const sampleA = BaseGeometricSampler.generateSamples(scene, config);
const sampleB = BaseGeometricSampler.generateSamples(scene, config);
assert.deepEqual(sampleB, sampleA, "Repeated generation must be byte-structurally deterministic.");
assert.equal(sampleA.kind, "ordered_finite_validated_subset");
assert.equal(sampleA.sourceObject, "X_0");
assert.equal(sampleA.formulaId, "W_kappa_torus4_v1");
assert.equal(sampleA.viewId, view.viewId);
assert.equal(sampleA.sampleCount, 512);
assert.equal(sampleA.samples.length, 512);
assert.equal(sampleA.randomnessAllowed, false);
assert.equal(sampleA.completenessClaim, false);
assert.equal(sampleA.rejectionSummary.rejectedZero, 0);
assert.equal(sampleA.rejectionSummary.rejectedResidual, 0);
assert.ok(sampleA.maxResidualMagnitude < 1e-10);

for (const sample of sampleA.samples) {
  assert.equal(sample.coordinates.length, 4);
  assert.equal(sample.membership.accepted, true);
  assert.ok(Number.isFinite(sample.membership.residualMagnitude));
  assert.ok(sample.membership.residualMagnitude <= sample.membership.threshold);
  for (const coordinate of sample.coordinates) {
    assert.ok(Number.isFinite(coordinate.re) && Number.isFinite(coordinate.im));
    assert.notEqual(Math.hypot(coordinate.re, coordinate.im), 0);
  }
}
assert.ok(sampleA.samples.some((sample) => sample.coordinates.some((z) => z.im !== 0)), "Complex ambient samples must not collapse to a hidden real locus.");
assert.ok(new Set(sampleA.samples.map((sample) => String(sample.coordinates[1].re) + "," + String(sample.coordinates[1].im))).size > 1, "z2 must vary in the sampler.");
assert.ok(new Set(sampleA.samples.map((sample) => String(sample.coordinates[2].re) + "," + String(sample.coordinates[2].im))).size > 1, "z3 must vary in the sampler.");

const perturbed = sampleA.samples[0].coordinates.map((z) => ({re:z.re, im:z.im}));
perturbed[3].re += 1e-4;
const perturbedMembership = BaseGeometricSampler.validateMembership(context, perturbed, config);
assert.equal(perturbedMembership.accepted, false, "A deliberately perturbed point must fail the declared membership tolerance.");

const projected = BaseGeometricRenderer.createProjectedScene(scene, view, sampleA);
assert.equal(projected.sourceObject, "X_0");
assert.equal(projected.viewId, view.viewId);
assert.equal(projected.requiredLabel, "Sampled projection of X_0 onto the z_1 complex plane");
assert.equal(projected.marks.length, sampleA.sampleCount);
assert.equal(projected.truthfulness.geometryRendered, true);
assert.equal(projected.truthfulness.sheetsMaterialized, false);
assert.equal(projected.truthfulness.coveringStructureClaimed, false);
assert.equal(projected.truthfulness.geometricZoomApplied, false);
assert.equal(projected.overlapPolicy, "projected_sample_overlap_count_only_not_source_self_intersection");
for (let index = 0; index < projected.marks.length; index += 1) {
  const mark = projected.marks[index];
  const z1 = sampleA.samples[index].coordinates[0];
  assert.equal(mark.sourceSampleId, sampleA.samples[index].sampleId);
  assert.equal(mark.x, z1.re);
  assert.equal(mark.y, z1.im);
  assert.ok(Number.isFinite(mark.viewportX) && Number.isFinite(mark.viewportY));
  assert.ok(mark.projectedSampleOverlapCount >= 1);
}

const fakeTarget = {innerHTML:"", hidden:true, dataset:{}};
BaseGeometricRenderer.renderBaseGeometricScene(projected, fakeTarget);
assert.equal(fakeTarget.hidden, false);
assert.equal(fakeTarget.dataset.geometryRendered, "true");
assert.equal(fakeTarget.dataset.sheetsMaterialized, "false");
assert.equal(fakeTarget.dataset.coveringStructureClaimed, "false");
assert.equal(fakeTarget.dataset.geometricZoomApplied, "false");
assert.equal(fakeTarget.dataset.fallbackUsed, "false");
assert.equal(fakeTarget.dataset.sampleCount, "512");
const renderedMarkCount = (fakeTarget.innerHTML.match(/class="base-geometric-mark"/g) || []).length;
assert.equal(renderedMarkCount, projected.marks.length);
assert.ok(fakeTarget.innerHTML.includes('data-source-sample-id="x0-p0000-r0"'));
assert.ok(fakeTarget.innerHTML.includes('data-semantic-x="'));
assert.ok(fakeTarget.innerHTML.includes('data-semantic-y="'));

const alteredDepthScene = clone(scene);
alteredDepthScene.request.requestedDepth = 7;
const depthSamples = BaseGeometricSampler.generateSamples(alteredDepthScene, config);
assert.deepEqual(depthSamples.samples, sampleA.samples, "requestedDepth must not generate X_n geometry in Thread 24.");
const depthProjected = BaseGeometricRenderer.createProjectedScene(alteredDepthScene, view, depthSamples);
assert.equal(depthProjected.sourceObject, "X_0");
assert.equal(depthProjected.marks.length, projected.marks.length);

const badView = clone(view);
badView.projection.sourceCoordinate = "z2";
badView.projection.sourceIndex = 1;
assert.throws(() => BaseGeometricRenderer.createProjectedScene(scene, badView, sampleA));

for (const relativePath of ["laurent-evaluator.js","base-geometric-sampler.js","base-geometric-renderer.js","base-geometric-runtime.js"]) {
  const source = read(relativePath);
  assert.ok(!source.includes("Math.random"), relativePath + " must not use random sampling.");
  assert.ok(!source.includes("crypto.random"), relativePath + " must not use random sampling.");
  assert.ok(!source.includes("metricScale"), relativePath + " must not consume D² metadata.");
  assert.ok(!source.includes("sheetDegree"), relativePath + " must not consume D⁴ metadata.");
}

const protectedBlobs = {
  "app.js": "4b5767b5f5fae9fac25d042e777b150a2ef92c38",
  "style.css": "3d27767b8afa7ee72c1cd72e20112a0b855a8066",
  "base-renderer.js": "fea92139c2a8514f01b9bb187f27bf0131dd4114",
  "one-step-pullback.js": "5b819f1668524992b7e21e91e5cb9f59b1ec97bd",
  "recursive-lazy-expansion.js": "0978c7a96fb007cefa683d48974f8dc401d23916",
  "zoom-semantics.js": "9ff9eccba33a82f094074e6bf41fdff93547b3be",
  "sheet-branch-organization.js": "cecf0f06aa23404a65a6093f705a4fe56be65029",
  "arithmetic-overlays.js": "bfc7331e07b8e12d4b14790ae5a4bc096042544c",
  "structural-camera.js": "c3934ba920be79905d631ee8a886b59527b6b65c",
  "structural-visualization.js": "ce0cfdde97d9a78b4535f4cdfcc9a73961990ab6",
  "concrete-runtime-schema.js": "23cc1d78afa287162107a1b9e8742d74cbf09d0d",
  "data/system.v2.json": "0d598560134e45bd3ed2edec62120fa45649883c",
  "projection-slice-semantics.js": "96841a5ceeaebd09155d8ade7653057b76d65104",
  "data/geometric-view.v1.json": "b3d52865c1ab7b2761581a5ddc838488bb903842"
};
for (const [relativePath, expected] of Object.entries(protectedBlobs)) {
  assert.equal(gitBlobSha(read(relativePath)), expected, relativePath + " must remain protected and byte-identical.");
}

const indexSource = read("index.html");
assert.ok(indexSource.includes("Sampled projection of X_0 onto the z_1 complex plane"));
assert.ok(indexSource.includes('id="base-geometric-visualization"'));
assert.ok(indexSource.includes("base-geometric-runtime.js"));
assert.ok(indexSource.includes("base-geometric-renderer.css"));
assert.ok(indexSource.includes("structural diagram remains a separate structural representation"));

console.log("Base Geometric Renderer v0.01 verifier: passed");
console.log("W evaluator / deterministic quadratic sampler / sealed z1 projection / SVG renderer: passed");
console.log("canonical sample count: " + String(sampleA.sampleCount));
console.log("maximum residual: " + sampleA.maxResidualMagnitude.toExponential(6));
console.log("geometryRendered=true only for validated nonempty X_0 sample marks");
console.log("sheetsMaterialized=false; coveringStructureClaimed=false; geometricZoomApplied=false");
console.log("structural/runtime/formal protected boundaries: preserved");
