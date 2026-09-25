import { callId, companyId, contactId, dealId, emailId, noteId, taskId } from "./ids";

const companySource = [
  ["Northstar Systems","northstarsystems.com","San Francisco","Technology"],["Vertex Labs","vertexlabs.io","Seattle","SaaS"],
  ["Atlas Commerce","atlascommerce.com","Chicago","Retail"],["Lumina Health","luminahealth.com","Boston","Healthcare"],
  ["Pioneer Analytics","pioneeranalytics.com","Austin","Technology"],["Crescent Financial","crescentfinancial.com","New York","Finance"],
  ["Harbor Logistics","harborlogistics.com","Miami","Logistics"],["Forge Manufacturing","forgemfg.com","Detroit","Manufacturing"],
  ["Meridian Education","meridianedu.org","Denver","Education"],["Redwood Advisory","redwoodadvisory.com","Portland","Professional Services"],
  ["Bluepeak Energy","bluepeakenergy.com","Houston","Energy"],["Nimbus Cloudworks","nimbuscloudworks.com","Raleigh","SaaS"],
] as const;
export const companies = companySource.map(([name,domain,city,industry],i)=>({id:companyId(i+1),name,domain,city,industry,phone:`+1 555 ${String(2100+i*137).padStart(4,"0")}`}));

const people = [["Maya","Patel"],["Ethan","Brooks"],["Sofia","Chen"],["Noah","Williams"],["Amara","Okafor"],["Liam","Reed"],["Elena","Garcia"],["Oliver","Stone"],["Priya","Rao"],["Lucas","Martin"],["Ava","Thompson"],["Mateo","Silva"],["Nora","Kim"],["Henry","Davis"],["Zara","Ahmed"],["Theo","Wilson"],["Isla","Murphy"],["Caleb","Young"],["Mina","Park"],["Owen","Clark"],["Leila","Hassan"],["Jack","Evans"],["Ivy","Bennett"],["Sam","Rivera"]];
const roles=["VP of Operations","Product Director","Head of Revenue","IT Director","Finance Lead","Customer Success Director"];
export const contacts=people.map(([first,last],i)=>{const company=companies[Math.floor(i/2)];return {id:contactId(i+1),first,last,name:`${first} ${last}`,email:`${first.toLowerCase()}.${last.toLowerCase()}@${company.domain}`,companyId:company.id,company:company.name,domain:company.domain,phone:`+1 555 ${3000+i*41}`,favorite:["Coffee","Waffles","Tea","Pasta"][i%4],role:roles[i%roles.length]}});

const dealNames=["Enterprise Platform Expansion","Annual Analytics License","Customer Data Migration","Premium Support Upgrade","CRM Automation Rollout","Workflow Modernization","Security Review Package","Customer Portal Launch"];
// The seed follows a believable funnel: more early-stage opportunities and
// fewer, higher-value late-stage opportunities. The varied close months keep
// Overview charts useful without changing any normalized relationship keys.
const dealPlan = [
  ...[18000,24000,30000,36000,42000,48000,55000,62000,68000,75000,82000,90000].map(amount=>({stage:"Appointment scheduled",amount})),
  ...[45000,55000,65000,75000,85000,95000,105000,115000,125000,140000].map(amount=>({stage:"Qualified to buy",amount})),
  ...[90000,110000,130000,150000,175000,200000,225000,250000].map(amount=>({stage:"Contract sent",amount})),
];
export const deals=dealPlan.map(({stage,amount},i)=>{const company=companies[i%12];return {id:dealId(i+1),name:dealNames[i%8],companyId:company.id,company:company.name,domain:company.domain,pipeline:"Sales pipeline",stage,amount,close:new Date(2026,3+(i%6),8+((i*3)%20)).toISOString().slice(0,10)}});

const noteTexts=["Client requested a revised implementation timeline.","Decision makers want a deeper security review before moving forward.","Customer asked whether onboarding can be split across two phases.","Follow-up required with procurement team.","Technical team approved the proposed integration approach.","Budget review is scheduled with the finance lead."];
export const notes=Array.from({length:42},(_,i)=>{const deal=deals[i%30];return {id:noteId(i+1),companyId:deal.companyId,dealId:deal.id,company:deal.company,deal:deal.name,body:noteTexts[i%6],date:new Date(2026,8-(i%7),25-(i%20)).toISOString().slice(0,10)}});

const taskTitles=["Call decision makers","Email revised proposal","Review security questionnaire","Confirm implementation timeline","Schedule technical workshop","Send contract summary"];
export const initialTasks=Array.from({length:25},(_,i)=>({id:taskId(i+1),dealId:deals[i%30].id,title:taskTitles[i%6],notes:noteTexts[(i+2)%6],priority:["Low","Medium","High"][i%3],status:i%4===0?"Completed":"In Progress",type:i%2?"Email":"Call",due:new Date(2026,8,25+(i%14)).toISOString().slice(0,10)}));

const subjects=["Follow-up on implementation proposal","Contract review","Pricing clarification","Onboarding timeline","Security questionnaire","Next steps"];
export const emails=Array.from({length:36},(_,i)=>({id:emailId(i+1),contactId:contacts[i%24].id,subject:subjects[i%6],status:i%5===0?"Scheduled":"Sent",body:`Hi ${contacts[i%24].first}, ${noteTexts[i%6].toLowerCase()} Please let us know the best next step.`,direction:i%3===0?"Incoming":"Outgoing",date:new Date(2026,8-(i%5),24-(i%18)).toISOString().slice(0,10)}));
export const calls=Array.from({length:22},(_,i)=>({id:callId(i+1),contactId:contacts[i%24].id,title:i%2?"Follow-up call":"Discovery call",contact:contacts[i%24].name,direction:i%3?"Outbound":"Inbound",source:i%2?"VoIP":"Zoom",status:i%4?"Completed":"Busy",date:new Date(2026,8-(i%4),23-(i%17)).toISOString().slice(0,10),notes:noteTexts[i%6]}));

// No Products / Line Items source CSV was supplied, so these remain empty
// instead of inventing an unsupported source schema.
export const products: Array<never> = [];
export const lineItems: Array<never> = [];

export const seed={companies,contacts,deals,notes,tasks:initialTasks,emails,calls,products,lineItems};
