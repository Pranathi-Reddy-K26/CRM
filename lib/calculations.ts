import { seed } from "@/data/seed";
export const getTotalPipeline=()=>seed.deals.reduce((sum,x)=>sum+x.amount,0);
export const getActiveDealCount=()=>seed.deals.length;
export const getOpenTaskCount=()=>seed.tasks.filter(x=>x.status!=="Completed").length;
export const getDealsByStage=()=>Object.fromEntries([...new Set(seed.deals.map(x=>x.stage))].map(stage=>[stage,seed.deals.filter(x=>x.stage===stage)]));
export const getTopCompaniesByPipeline=()=>seed.companies.map(company=>({...company,pipeline:seed.deals.filter(x=>x.companyId===company.id).reduce((sum,x)=>sum+x.amount,0)})).sort((a,b)=>b.pipeline-a.pipeline);
export const getRevenueByMonth=()=>Object.entries(seed.deals.reduce<Record<string,number>>((out,x)=>{const month=x.close.slice(0,7);out[month]=(out[month]||0)+x.amount;return out},{})).sort(([a],[b])=>a.localeCompare(b));
