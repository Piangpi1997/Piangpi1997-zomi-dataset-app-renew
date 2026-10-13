import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("all import modalities wired",()=>{const s=read("src/ImportPanel.tsx");for(const kind of ["text","audio","video"])assert.ok(s.includes('key:"'+kind+'"'));});
test("owner approve requires explicit confirmation",()=>{const s=read("src/App.tsx");assert.match(s,/!confirmed\|\|!requestId/);assert.match(s,/approve:true/);});
test("frontend never embeds GitHub token",()=>{for(const p of ["src/App.tsx","src/api.ts","src/ImportPanel.tsx"])assert.doesNotMatch(read(p),/GITHUB_TOKEN|ghp_[a-zA-Z0-9]+/);});
test("PWA never caches private API",()=>assert.match(read("public/sw.js"),/startsWith\("\/api\/"/));
test("Android build requires API base",()=>assert.match(read(".github/workflows/android-debug.yml"),/VITE_API_BASE_URL/));
