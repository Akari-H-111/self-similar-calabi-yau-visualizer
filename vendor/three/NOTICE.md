# Three.js presentation dependency

This directory vendors the minimum browser modules used by the structural 3D
presentation adapter: Three.js `0.180.0` build modules and `OrbitControls`.
The source package is the npm registry distribution `three@0.180.0`
(`sha512-o+qycAMZrh+TsE01GqWUxUIKR1AL0S8pq7zDkYOQw8GqfX8b8VoCKYUoHbhiX5j+7hr8XsuHDVU6+gkQJQKg9w==`).
Three.js is MIT licensed; its upstream license text is retained in `LICENSE`.

Included browser payload: 1,023,019 bytes before HTTP compression
(`three.core.min.js`, `three.tsl.min.js`, `three.webgpu.min.js`, and
`OrbitControls.js`). `OrbitControls.js` has one local-only module-specifier
rewrite so it resolves the vendored WebGPU build instead of a package import.
