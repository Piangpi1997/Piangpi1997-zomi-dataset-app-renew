import type {DatasetRecord} from '../types/dataset';
export function validateRecord(r:Partial<DatasetRecord>){const e:string[]=[];for(const k of ['zomi','myanmar','english','category','dialect'] as const)if(!r[k]?.trim())e.push(`${k} is required`);if(r.source&&!['verified','unverified'].includes(r.source))e.push('invalid source');return e}
export function validateDataset(rows: DatasetRecord[]){
  const seen=new Set<string>(); let duplicates=0; const invalid:string[]=[];
  rows.forEach((r,i)=>{const errors=validateRecord(r);if(errors.length) invalid.push(`Row ${i+1}: ${errors.join(', ')}`);const k=[r.zomi,r.myanmar,r.english].map(x=>x.trim().toLowerCase().replace(/\s+/g,' ')).join('|');if(seen.has(k))duplicates++;else seen.add(k);});
  return {duplicates,invalid};
}
