const LS = { WEEK: "study.weekTemplate", OVERRIDES: "study.overridesByDate", PROGRESS: "study.progressByDate", STARTED: "study.startedAtByDate", UI: "study.uiState" };
export default LS;
export const loadJSON = <T,>(k:string, fb:T):T => { try{ const v=localStorage.getItem(k); return v? (JSON.parse(v) as T) : fb; }catch{return fb;} };
export const saveJSON = <T,>(k:string, v:T) => localStorage.setItem(k, JSON.stringify(v));
