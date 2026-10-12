export type ImportKind="text"|"audio"|"video";
export type ImportResult={import_id:string;dataset_id:string;status:string;kind:ImportKind;filename?:string};
const API_BASE=(import.meta.env.VITE_API_BASE_URL||"").replace(/\/$/,"");
async function parseResponse(res:Response){const raw=await res.text();let data:unknown;try{data=JSON.parse(raw)}catch{throw new Error("Invalid API response")}if(!res.ok)throw new Error((data as {error?:string})?.error||"Request failed: "+res.status);return data}
export async function uploadDatasetFile(file:File,kind:ImportKind,datasetId:string,onProgress?:(n:number)=>void):Promise<ImportResult>{
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(datasetId))throw new Error("Invalid dataset ID");
 const accept:Record<ImportKind,string[]>={text:["txt","csv","json","jsonl","xlsx"],audio:["mp3","wav","m4a","ogg","flac"],video:["mp4","mov","webm","mkv"]};
 const ext=file.name.split(".").pop()?.toLowerCase()||"";
 if(!accept[kind].includes(ext))throw new Error("Unsupported "+kind+" format");
 const limit=kind==="text"?20*1024*1024:kind==="audio"?200*1024*1024:500*1024*1024;
 if(!file.size||file.size>limit)throw new Error("File is empty or exceeds size limit");
 const form=new FormData();form.append("file",file,file.name);form.append("kind",kind);form.append("datasetId",datasetId);
 return new Promise((resolve,reject)=>{
  const xhr=new XMLHttpRequest();xhr.open("POST",API_BASE+"/api/imports");
  xhr.withCredentials=true;xhr.timeout=300000;
  xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress?.(Math.round(100*e.loaded/e.total))};
  xhr.onerror=()=>reject(new Error("Upload network error"));
  xhr.ontimeout=()=>reject(new Error("Upload timed out"));
  xhr.onload=()=>{try{const data=JSON.parse(xhr.responseText);if(xhr.status<200||xhr.status>=300)throw new Error(data.error||"Upload failed");resolve(data as ImportResult)}catch(e){reject(e)}};
  xhr.send(form);
 });
}
export async function getImportStatus(id:string){const r=await fetch(API_BASE+"/api/imports/"+encodeURIComponent(id),{credentials:"include"});return parseResponse(r)}
