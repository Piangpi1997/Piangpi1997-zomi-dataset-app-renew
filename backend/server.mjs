import http from "node:http";import {randomUUID,timingSafeEqual} from "node:crypto";import {mkdir,writeFile,readFile,rename,rm} from "node:fs/promises";
import {createWriteStream} from "node:fs";
import {pipeline} from "node:stream/promises";import path from "node:path";import Busboy from "busboy";
const PORT=Number(process.env.PORT||8787),ROOT=path.resolve(process.env.PRIVATE_DATA_DIR||"./private-data");
const TOKEN=process.env.API_ACCESS_TOKEN||"",ORIGIN=process.env.ALLOWED_ORIGIN||"";
if(!TOKEN||TOKEN.length<32)throw new Error("API_ACCESS_TOKEN must be at least 32 chars");
const limits={text:20*1024*1024,audio:200*1024*1024,video:500*1024*1024};
const allowed={text:["txt","csv","json","jsonl","xlsx"],audio:["mp3","wav","m4a","ogg","flac"],video:["mp4","mov","webm","mkv"]};
function reply(res,code,data){res.writeHead(code,{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...(ORIGIN?{"access-control-allow-origin":ORIGIN,"access-control-allow-credentials":"true","vary":"Origin"}:{})});res.end(JSON.stringify(data))}
function authorized(req){const given=req.headers.authorization?.replace(/^Bearer /,"")||"";const a=Buffer.from(given),b=Buffer.from(TOKEN);return a.length===b.length&&timingSafeEqual(a,b)}
function safeId(s){return typeof s==="string"&&/^[a-zA-Z0-9_-]{1,80}$/.test(s)}
function matchesSignature(kind,ext,head){const ascii=head.toString("ascii");const hex=head.toString("hex");if(kind==="text"){if(ext==="xlsx")return hex.startsWith("504b0304");if(ext==="json"||ext==="jsonl"||ext==="csv"||ext==="txt")return !head.includes(0);return false}if(ext==="wav")return ascii.startsWith("RIFF")&&ascii.slice(8,12)==="WAVE";if(ext==="mp3")return ascii.startsWith("ID3")||hex.startsWith("fffb")||hex.startsWith("fff3")||hex.startsWith("fff2");if(ext==="flac")return ascii.startsWith("fLaC");if(ext==="ogg")return ascii.startsWith("OggS");if(ext==="m4a"||ext==="mp4"||ext==="mov")return ascii.slice(4,8)==="ftyp";if(ext==="webm"||ext==="mkv")return hex.startsWith("1a45dfa3");return false}
async function saveUpload(req){const id=randomUUID(),dir=path.join(ROOT,id),temp=path.join(dir,"upload.tmp");await mkdir(dir,{recursive:true,mode:0o700});let saved=false;
try{return await new Promise((resolve,reject)=>{let bb;try{bb=Busboy({headers:req.headers,limits:{files:1,fields:2,fileSize:500*1024*1024,parts:3,fieldSize:100}})}catch(e){reject(e);return}
let kind="",datasetId="",filename="",bytes=0,head=Buffer.alloc(0),fileSeen=false,truncated=false,writing=Promise.resolve();
bb.on("field",(name,val)=>{if(name==="kind")kind=val;if(name==="datasetId")datasetId=val});
bb.on("file",(_,stream,info)=>{fileSeen=true;filename=info.filename;const sink=createWriteStream(temp,{flags:"wx",mode:0o600});stream.on("data",chunk=>{bytes+=chunk.length;if(head.length<16)head=Buffer.concat([head,chunk.subarray(0,16-head.length)])});stream.on("limit",()=>{truncated=true});writing=pipeline(stream,sink);writing.catch(()=>{})});
bb.on("error",reject);bb.on("partsLimit",()=>reject(Error("Too many parts")));bb.on("filesLimit",()=>reject(Error("Too many files")));bb.on("fieldsLimit",()=>reject(Error("Too many fields")));
bb.on("finish",async()=>{try{await writing;if(!safeId(datasetId)||!Object.hasOwn(limits,kind)||!fileSeen||!bytes||truncated||bytes>limits[kind])throw Error("Invalid dataset, type or size");const ext=filename.split(".").pop()?.toLowerCase();if(!allowed[kind].includes(ext)||!matchesSignature(kind,ext,head))throw Error("File format mismatch");const metadata={import_id:id,dataset_id:datasetId,kind,filename:path.basename(filename),status:"awaiting_processing",bytes,created_at:new Date().toISOString()};await rename(temp,path.join(dir,"original.bin"));await writeFile(path.join(dir,"metadata.json"),JSON.stringify(metadata),{mode:0o600,flag:"wx"});saved=true;resolve(metadata)}catch(e){reject(e)}});req.pipe(bb)});}
catch(e){if(!saved)await rm(dir,{recursive:true,force:true}).catch(()=>{});throw e}}
export function createServer(){return http.createServer(async(req,res)=>{if(req.method==="OPTIONS"){if(ORIGIN&&req.headers.origin===ORIGIN){res.writeHead(204,{"access-control-allow-origin":ORIGIN,"access-control-allow-methods":"GET, POST, OPTIONS","access-control-allow-headers":"Authorization, Content-Type","access-control-allow-credentials":"true"});res.end()}else reply(res,403,{error:"Origin not allowed"});return}
if(req.url==="/healthz"){reply(res,200,{status:"ok"});return}
if(!authorized(req)){reply(res,401,{error:"Unauthorized"});return}
if(ORIGIN&&req.headers.origin&&req.headers.origin!==ORIGIN){reply(res,403,{error:"Origin not allowed"});return}
try{if(req.method==="POST"&&req.url==="/api/imports"){if(!req.headers["content-type"]?.startsWith("multipart/form-data")){reply(res,415,{error:"multipart/form-data required"});return}const meta=await saveUpload(req);reply(res,202,meta);return}
const m=req.method==="GET"&&req.url?.match(/^\/api\/imports\/([0-9a-f-]{36})$/);if(m){try{const meta=JSON.parse(await readFile(path.join(ROOT,m[1],"metadata.json"),"utf8"));reply(res,200,meta)}catch{reply(res,404,{error:"Not found"})}return}
reply(res,404,{error:"Not implemented"})}catch(e){reply(res,400,{error:e.message||"Upload failed"})}})}
if(process.argv[1]&&import.meta.url===new URL("file://"+path.resolve(process.argv[1])).href){createServer().listen(PORT,"0.0.0.0",()=>console.log("Zomi private import API listening on",PORT))}
