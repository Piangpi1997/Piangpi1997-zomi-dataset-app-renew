import http from "node:http";import {randomUUID,timingSafeEqual} from "node:crypto";import {mkdir,writeFile,readFile} from "node:fs/promises";import path from "node:path";import Busboy from "busboy";
const PORT=Number(process.env.PORT||8787),ROOT=path.resolve(process.env.PRIVATE_DATA_DIR||"./private-data");
const TOKEN=process.env.API_ACCESS_TOKEN||"",ORIGIN=process.env.ALLOWED_ORIGIN||"";
if(!TOKEN||TOKEN.length<32)throw new Error("API_ACCESS_TOKEN must be at least 32 chars");
const limits={text:20*1024*1024,audio:200*1024*1024,video:500*1024*1024};
const allowed={text:["txt","csv","json","jsonl","xlsx"],audio:["mp3","wav","m4a","ogg","flac"],video:["mp4","mov","webm","mkv"]};
function reply(res,code,data){res.writeHead(code,{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...(ORIGIN?{"access-control-allow-origin":ORIGIN,"access-control-allow-credentials":"true","vary":"Origin"}:{})});res.end(JSON.stringify(data))}
function authorized(req){const given=req.headers.authorization?.replace(/^Bearer /,"")||"";const a=Buffer.from(given),b=Buffer.from(TOKEN);return a.length===b.length&&timingSafeEqual(a,b)}
function safeId(s){return typeof s==="string"&&/^[a-zA-Z0-9_-]{1,80}$/.test(s)}
async function saveUpload(req){return new Promise((resolve,reject)=>{let bb;try{bb=Busboy({headers:req.headers,limits:{files:1,fields:2,fileSize:500*1024*1024,parts:3}})}catch(e){reject(e);return}
let kind="",datasetId="",filename="",bytes=0,chunks=[],fileSeen=false,truncated=false;bb.on("field",(name,val)=>{if(name==="kind")kind=val;if(name==="datasetId")datasetId=val});
bb.on("file",(_,stream,info)=>{fileSeen=true;filename=info.filename;stream.on("data",chunk=>{bytes+=chunk.length;chunks.push(chunk)});stream.on("limit",()=>{truncated=true});stream.on("error",reject)});
bb.on("error",reject);bb.on("finish",async()=>{try{if(!safeId(datasetId)||!Object.hasOwn(limits,kind)||!fileSeen||!bytes||truncated||bytes>limits[kind])throw Error("Invalid dataset, type or size");const ext=filename.split(".").pop()?.toLowerCase();if(!allowed[kind].includes(ext))throw Error("Unsupported file extension");const id=randomUUID();const dir=path.join(ROOT,id);await mkdir(dir,{recursive:true,mode:0o700});const metadata={import_id:id,dataset_id:datasetId,kind,filename:path.basename(filename),status:"awaiting_processing",bytes,created_at:new Date().toISOString()};await writeFile(path.join(dir,"original.bin"),Buffer.concat(chunks),{mode:0o600,flag:"wx"});await writeFile(path.join(dir,"metadata.json"),JSON.stringify(metadata),{mode:0o600});resolve(metadata)}catch(e){reject(e)}});req.pipe(bb)})}
export function createServer(){return http.createServer(async(req,res)=>{if(req.method==="OPTIONS"){if(ORIGIN&&req.headers.origin===ORIGIN){res.writeHead(204,{"access-control-allow-origin":ORIGIN,"access-control-allow-methods":"GET, POST, OPTIONS","access-control-allow-headers":"Authorization, Content-Type","access-control-allow-credentials":"true"});res.end()}else reply(res,403,{error:"Origin not allowed"});return}
if(req.url==="/healthz"){reply(res,200,{status:"ok"});return}
if(!authorized(req)){reply(res,401,{error:"Unauthorized"});return}
if(ORIGIN&&req.headers.origin&&req.headers.origin!==ORIGIN){reply(res,403,{error:"Origin not allowed"});return}
try{if(req.method==="POST"&&req.url==="/api/imports"){if(!req.headers["content-type"]?.startsWith("multipart/form-data")){reply(res,415,{error:"multipart/form-data required"});return}const meta=await saveUpload(req);reply(res,202,meta);return}
const m=req.method==="GET"&&req.url?.match(/^\/api\/imports\/([0-9a-f-]{36})$/);if(m){try{const meta=JSON.parse(await readFile(path.join(ROOT,m[1],"metadata.json"),"utf8"));reply(res,200,meta)}catch{reply(res,404,{error:"Not found"})}return}
reply(res,404,{error:"Not implemented"})}catch(e){reply(res,400,{error:e.message||"Upload failed"})}})}
if(process.argv[1]&&import.meta.url===new URL("file://"+path.resolve(process.argv[1])).href){createServer().listen(PORT,"0.0.0.0",()=>console.log("Zomi private import API listening on",PORT))}
