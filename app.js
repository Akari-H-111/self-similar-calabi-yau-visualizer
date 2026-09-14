"use strict";

const statusElement = document.querySelector("#system-status");
const dataElement = document.querySelector("#system-data");

const fields = {
  project: document.querySelector("#project-value"),
  version: document.querySelector("#version-value"),
  D: document.querySelector("#d-value"),
  lambda: document.querySelector("#lambda-value"),
  kappa: document.querySelector("#kappa-value"),
  initialDepth: document.querySelector("#depth-value")
};

async function loadSystemConfiguration() {
  try {
    const response = await fetch("data/system.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }

    const system = await response.json();

    for (const [key, element] of Object.entries(fields)) {
      element.textContent = String(system[key] ?? "—");
    }

    dataElement.hidden = false;
    statusElement.dataset.state = "ready";
    statusElement.textContent = "Loaded data/system.json successfully.";
  } catch (error) {
    console.error("Failed to load system configuration:", error);
    statusElement.dataset.state = "error";
    statusElement.textContent = `Failed to load data/system.json: ${error.message}`;
  }
}

loadSystemConfiguration();
