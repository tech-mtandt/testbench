// Preload shim: payload/dist/bin/loadEnv.js default-imports '@next/env', which
// is CJS with named exports only (no default). Under Next's bundler that's
// polyfilled; under tsx/node it's undefined and crashes. Add the missing
// default so standalone Local-API scripts (the ETL) can boot Payload.
const Module = require('module')
const origLoad = Module._load
Module._load = function (request, parent, isMain) {
  const m = origLoad.apply(this, arguments)
  if (request === '@next/env' && m && typeof m === 'object' && m.default === undefined) {
    try { m.default = m } catch { /* frozen module — ignore */ }
  }
  return m
}
