import {useState} from "react";

type Preview={name:string;lines:number;bytes:number;sample:string[];blankLines:number;duplicateLines:number;invalidJsonLines:number;cleaned:string;cleanedCount:number;canExport:boolean;jsonlObjects:number;missingTextFields:number;};
function normalizeLines(content:string,ext:string){const seen=new Set<string>();let invalidJsonLines=0;const cleaned:string[]=[];for(const raw of content.split(/\r?\n/)){const line=raw.trim();if(!line)continue;if(ext==="jsonl"){try{JSON.parse(line)}catch{invalidJsonLines++;continue}}if(!seen.has(line)){seen.add(line);cleaned.push(line)}}return {cleaned,invalidJsonLines};}
const MAX_BYTES=1024*1024;
export default function LocalTextPreview(){
 const [preview,setPreview]=useState<Preview|null>(null);
 const [error,setError]=useState("");
 async function inspect(file?:File){
  setPreview(null);setError("");
  if(!file)return;
  const ext=file.name.split(".").pop()?.toLowerCase();
  if(!["txt","csv","json","jsonl"].includes(ext||"")){setError("Choose a TXT, CSV, JSON or JSONL file.");return;}
  if(file.size>MAX_BYTES){setError("Local preview limit is 1 MB.");return;}
  try{
   const content=await file.text();
   if(content.includes("\0"))throw new Error("Binary files are not supported.");
   if(ext==="json")JSON.parse(content);
   const {cleaned,invalidJsonLines}=normalizeLines(content,ext||"");
   let jsonlObjects=0,missingTextFields=0;
   if(ext==="jsonl")for(const line of cleaned){const value=JSON.parse(line);if(value&&typeof value==="object"&&!Array.isArray(value)){jsonlObjects++;if(!["zomi","text","source"].some(key=>typeof value[key]==="string"&&value[key].trim()))missingTextFields++;}}
   const lines=content.split(/\r?\n/);
   const populated=lines.map(x=>x.trim()).filter(Boolean);
   const duplicateLines=populated.length-new Set(populated).size;
   setPreview({name:file.name,bytes:file.size,lines:lines.length,blankLines:lines.length-populated.length,duplicateLines,invalidJsonLines,cleaned:cleaned.join("\n")+"\n",cleanedCount:cleaned.length,canExport:ext==="txt"||ext==="jsonl",jsonlObjects,missingTextFields,sample:lines.slice(0,5).map(x=>x.slice(0,180))});
  }catch{setError("Unable to read or validate this file.");}
 }
 function download(){if(!preview)return;const blob=new Blob([preview.cleaned],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="cleaned-"+preview.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section className="panel">
  <h2>Offline text inspection</h2>
  <p className="muted">Inspect a small public or non-sensitive text dataset locally in your browser. This does not upload, save, translate, or publish the file. Do not select private datasets on shared devices.</p>
  <label htmlFor="local-file">TXT / CSV / JSON / JSONL (max 1 MB)</label>
  <input id="local-file" type="file" accept=".txt,.csv,.json,.jsonl" onChange={e=>{void inspect(e.target.files?.[0]);e.target.value="";}}/>
  {error&&<p role="alert" className="error">{error}</p>}
  {preview&&<div role="status"><p><strong>{preview.name}</strong> — {preview.lines} lines, {preview.bytes} bytes</p><p>Blank lines: {preview.blankLines} • Duplicate non-empty lines: {preview.duplicateLines} • Invalid JSONL lines: {preview.invalidJsonLines}</p><p>JSONL object records: {preview.jsonlObjects} • Records without a non-empty zomi/text/source field: {preview.missingTextFields}</p><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",maxHeight:180,overflow:"auto"}}>{preview.sample.join("\n")}</pre><p className="muted">Showing first 5 lines only. Nothing was sent to the server.</p>{preview.canExport&&<button type="button" onClick={download}>Download cleaned text ({preview.cleanedCount} lines)</button>}<p className="muted">Export trims lines, removes blanks and exact duplicate trimmed lines. Invalid JSONL rows are excluded. Export is available for TXT and JSONL only; CSV and JSON are preview-only to avoid corrupting structured datasets. Review before use.</p></div>}
 </section>;
}
