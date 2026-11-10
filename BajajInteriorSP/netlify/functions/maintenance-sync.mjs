import {syncHeaders} from '../../lib/maintenance-service-auth.mjs';
import {BACKEND_ORIGIN,GATEWAY_KEY} from '../../lib/netlify-gateway.mjs';
// 10:00 UTC = 07:00 America/Sao_Paulo. Runs only on published deploys.
export const config={schedule:'0 10 * * *'};
export default async()=>{
 const headers=await syncHeaders(Netlify.env.get(GATEWAY_KEY));
 const response=await fetch(BACKEND_ORIGIN+'/api/maintenance/sync',{method:'POST',headers,signal:AbortSignal.timeout(27000)});
 if(!response.ok)throw Error(`Maintenance sync HTTP ${response.status}`);
 const result=await response.json();console.log(JSON.stringify({status:result.status,checked:result.last_checked,pending:result.pending_count}));
 return new Response(null,{status:204});
};
