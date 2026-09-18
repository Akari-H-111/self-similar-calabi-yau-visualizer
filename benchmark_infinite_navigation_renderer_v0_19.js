"use strict";

const { performance } = require("node:perf_hooks");
const InfiniteNavigationRenderer = require("./infinite-navigation-renderer.js");

const HORIZONS = Object.freeze([100, 1000, 10000, 1000000]);
const TRANSITIONS = Object.freeze([0, 0.25, 0.5, 0.75, 1]);

function round(value, digits = 6) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

for (const horizon of HORIZONS) {
  const snapshot = InfiniteNavigationRenderer.createSnapshot({
    semanticMaterializedDepth: horizon,
    presentationVisibleDepth: horizon,
    selectedDepth: 0,
    focusedDepth: 0,
    collapsedDepth: null
  });

  let state = null;
  let maximumActive = 0;
  let maximumPool = 0;
  let recycled = 0;
  let cacheHits = 0;
  let cacheMisses = 0;
  let cacheEvictions = 0;
  let maximumCacheEntries = 0;
  const start = performance.now();

  for (const ratio of TRANSITIONS) {
    const anchorDepth = Math.floor(horizon * ratio);
    state = InfiniteNavigationRenderer.createStateFromSnapshot(snapshot, state, {anchorDepth});
    maximumActive = Math.max(maximumActive, state.activeRenderedDepthCount);
    maximumPool = Math.max(maximumPool, state.presentationPool.poolSize);
    recycled += state.presentationPool.recycledCount;
    cacheHits += state.virtualLayoutCache.hitCount;
    cacheMisses += state.virtualLayoutCache.missCount;
    cacheEvictions += state.virtualLayoutCache.evictedCount;
    maximumCacheEntries = Math.max(maximumCacheEntries, state.virtualLayoutCache.entryCount);
  }

  const elapsedMs = performance.now() - start;
  console.log("BENCHMARK " + JSON.stringify({
    semanticMaterializedDepth: horizon,
    transitions: TRANSITIONS.length,
    maximumActiveRenderedDepthCount: maximumActive,
    maximumPresentationPoolSize: maximumPool,
    configuredActiveBound: state.configuredActiveBound,
    recycledBindingCount: recycled,
    virtualLayoutCacheHits: cacheHits,
    virtualLayoutCacheMisses: cacheMisses,
    virtualLayoutCacheEvictions: cacheEvictions,
    maximumVirtualLayoutCacheEntries: maximumCacheEntries,
    virtualLayoutCacheCapacity: state.virtualLayoutCache.capacity,
    transitionElapsedMs: round(elapsedMs),
    activeCountDependsOnSemanticDepth: false,
    geometryRendered: false,
    sheetsMaterialized: false,
    coveringStructureClaimed: false,
    geometricZoomApplied: false
  }));
}

console.log("SUMMARY " + JSON.stringify({
  browserEvidence: "not_tested",
  timingAndHeapAreEnvironmentSensitive: true,
  benchmarkThresholdIsSemanticLimit: false,
  note: "This benchmark measures deterministic render-window/pool bookkeeping only; it does not replace the retained-semantic-state v0.10 benchmark."
}));
