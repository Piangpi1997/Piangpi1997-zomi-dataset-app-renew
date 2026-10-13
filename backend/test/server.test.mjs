import test from "node:test";import assert from "node:assert/strict";
process.env.API_ACCESS_TOKEN="this-is-a-test-secret-with-more-than-32-characters";
process.env.PRIVATE_DATA_DIR="/tmp/zomi-import-tests-"+process.pid;
const {createServer}=await import("../server.mjs");
test("health and authorization gates",async()=>{const server=createServer();await new Promise(r=>server.listen(0,"127.0.0.1",r));try{const base="http://127.0.0.1:"+server.address().port;let r=await fetch(base+"/healthz");assert.equal(r.status,200);r=await fetch(base+"/api/imports/00000000-0000-0000-0000-000000000000");assert.equal(r.status,401);r=await fetch(base+"/api/imports",{method:"POST",headers:{Authorization:"Bearer "+process.env.API_ACCESS_TOKEN}});assert.equal(r.status,415)}finally{server.close()}});
