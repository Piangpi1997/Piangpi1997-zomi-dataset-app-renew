import type {DatasetRecord} from '../types/dataset';
export function validateRecord(r:Partial<DatasetRecord>){const e:string[]=[];for(const k of ['zomi','myanmar','english','category','dialect'] as const)if(!r[k]?.trim())e.push(`${k} is required`);if(r.source&&!['verified','unverified'].includes(r.source))e.push('invalid source');return e}
