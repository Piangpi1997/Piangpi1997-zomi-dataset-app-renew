import {useState} from "react";

type Preview={name:string;lines:number;bytes:number;sample:string[];blankLines:number;duplicateLines:number;invalidJsonLines:number};
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
   let invalidJsonLines=0;
   if(ext==="jsonl")for(const line of content.split(/\r?\n/)){if(line.trim()){try{JSON.parse(line)}catch{invalidJsonLines++}}}
   const lines=content.split(/\r?\n/);
   const populated=lines.map(x=>x.trim()).filter(Boolean);
   const duplicateLines=populated.length-new Set(populated).size;
   setPreview({name:file.name,bytes:file.size,lines:lines.length,blankLines:lines.length-populated.length,duplicateLines,invalidJsonLines,sample:lines.slice(0,5).map(x=>x.slice(0,180))});
  }catch{setError("Unable to read or validate this file.");}
 }
 return <section className="panel">
  <h2>Offline text inspection</h2>
  <p className="muted">Inspect a small public or non-sensitive text dataset locally in your browser. This does not upload, save, translate, or publish the file. Do not select private datasets on shared devices.</p>
  <label htmlFor="local-file">TXT / CSV / JSON / JSONL (max 1 MB)</label>
  <input id="local-file" type="file" accept=".txt,.csv,.json,.jsonl" onChange={e=>{void inspect(e.target.files?.[0]);e.target.value="";}}/>
  {error&&<p role="alert" className="error">{error}</p>}
  {preview&&<div role="status"><p><strong>{preview.name}</strong> — {preview.lines} lines, {preview.bytes} bytes</p><p>Blank lines: {preview.blankLines} • Duplicate non-empty lines: {preview.duplicateLines} • Invalid JSONL lines: {preview.invalidJsonLines}</p><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",maxHeight:180,overflow:"auto"}}>{preview.sample.join("\n")}</pre><p className="muted">Showing first 5 lines only. Nothing was sent to the server.</p></div>}
 </section>;
}
