export type SourceStatus='verified'|'unverified';
export interface DatasetRecord{id:string;zomi:string;myanmar:string;english:string;category:string;dialect:string;source:SourceStatus}
export const categories=['daily_conversation','family','church','education','travel','technology','other'];
