# C07 Safety & Authority Audit v0.01

Status: **repository implementation audited / local adversarial fixture passed**

This audit applies only to the experimental branch `infra-codespaces-webmcp-poc` and the bridge under `tools/codespace-webmcp/`. It does not modify or certify the canonical visualizer on `main`.

## Authority surface

The WebMCP page still declares exactly four tools:

- `bridge_status`
- `get_workspace_state`
- `run_node_verification`
- `run_lean_build`

The only executable actions remain the two fixed server mappings:

- `run_node_verification` -> eight canonical Node verifier files, fixed repository-root cwd
- `run_lean_build` -> `lake build`, fixed `formal/` cwd

There is no `run_command`, caller-supplied command, caller-supplied args, caller-supplied cwd, shell interpolation, source-write endpoint, or general filesystem API.

## C07 hardening

Verification child processes now run with:

- `execFile`, not shell command strings;
- explicit `shell: false`;
- fixed command and argument arrays;
- fixed working directories;
- credential-like environment variables stripped before spawning.

The credential filter removes common token, secret, password, credential, API-key, private/access-key, and auth-style environment names, including `GITHUB_TOKEN`, `GH_TOKEN`, `GIT_ASKPASS`, `SSH_ASKPASS`, and `SSH_AUTH_SOCK`.

This is defense in depth. It does not claim the child process is an operating-system sandbox.

## Automated adversarial audit

Run:

```bash
node tools/codespace-webmcp/verify_safety_authority_v0_01.mjs
```

The verifier performs static source checks plus isolated temporary-repository HTTP/fault-injection tests. It checks:

- exact two-action allowlist and unchanged four-tool authority surface;
- no `exec(...)`, no `shell: true`, and no request-derived command/cwd parsing;
- unknown paths and unsupported methods fail closed;
- action POSTs without the required header are rejected;
- CORS preflight is not opened and no permissive ACAO header is emitted;
- request body/query values shaped as `command`, `args`, and `cwd` do not expand authority;
- path-traversal-shaped action URLs do not resolve to an executable action;
- concurrent actions preserve the `busy` rejection contract;
- credential values placed in the server environment are absent from runtime, page, and verification-action outputs;
- stdout is tail-bounded and reports truncation metadata;
- timeout fault injection produces `failureKind: timeout` and stops early;
- output-buffer overflow remains bounded and structurally classified rather than leaking unbounded output.

The dynamic tests use copied bridge source in temporary Git fixtures, fake verifier programs, and a fake `lake` executable. Timeout testing shortens the timeout only inside the disposable fixture. No production command set is expanded for testing.

## Result boundary

The following statement is supported:

```text
C07 repository safety/authority implementation: VERIFIED
C07 local adversarial fixture: PASSED
```

The following is still not established:

```text
real ChatGPT Desktop -> private Codespaces forwarded page -> WebMCP execution: PASSED
```

C07 therefore does not claim end-to-end browser authentication, private-port visibility, OS sandboxing, malicious-repository containment, or full terminal access.

## Next decision point

The next planned milestone is **C08 — Repository Integration Decision**. Adoption into canonical `main` must remain conditional on real Codespace/ChatGPT Desktop runtime evidence; absent that evidence, the safe decision state is to keep this branch experimental.
