import * as XLSX from 'xlsx';
import type { DatasetRecord, SourceStatus } from '../types/dataset';

const clean = (v: unknown) => String(v ?? '').trim();
const key = (r: Partial<DatasetRecord>) => [r.zomi,r.myanmar,r.english].map(x=>clean(x).toLocaleLowerCase().replace(/\s+/g,' ')).join('|');

export function normalizeRow(row: Record<string, unknown>, index: number): DatasetRecord {
  const pick=(...names:string[])=>{const hit=Object.keys(row).find(k=>names.includes(k.toLowerCase().trim()));return hit?row[hit]:''};
  const source=clean(pick('source','status')).toLowerCase();
  return {id:`import-${Date.now()}-${index}`,zomi:clean(pick('zomi','tedim')),myanmar:clean(pick('myanmar','burmese')),english:clean(pick('english','en')),category:clean(pick('category'))||'other',dialect:clean(pick('dialect'))||'Zomi',source:(source==='verified'?'verified':'unverified') as SourceStatus};
}

export async function importFile(file: File): Promise<DatasetRecord[]> {
  const ext=file.name.toLowerCase().split('.').pop();
  if(ext==='json') {
    const parsed=JSON.parse(await file.text());
    const arr=Array.isArray(parsed)?parsed:(parsed.records||parsed.data||[]);
    if(!Array.isArray(arr)) throw new Error('JSON must contain an array of records.');
    return arr.map(normalizeRow);
  }
  if(ext==='csv') return parseCsv(await file.text());
  if(ext==='xlsx'||ext==='xls') {
    const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});
    const sheet=wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json<Record<string,unknown>>(sheet,{defval:''}).map(normalizeRow);
  }
  throw new Error('Supported formats: CSV, Excel (.xlsx/.xls), JSON.');
}

function parseCsv(text:string):DatasetRecord[] {
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());
  if(!lines.length) return [];
  const parse=(line:string)=>{const out:string[]=[];let cur='',quote=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'){cur+='"';i++;continue}if(c==='"'){quote=!quote;continue}if(c===','&&!quote){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;};
  const headers=parse(lines[0]).map(x=>x.trim().toLowerCase());
  return lines.slice(1).map((line,i)=>{const vals=parse(line);const row:Record<string,string>={};headers.forEach((h,j)=>row[h]=vals[j]??'');return normalizeRow(row,i);});
}

export function duplicateKey(r:Partial<DatasetRecord>){return key(r)}
