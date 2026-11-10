const encoder=new TextEncoder();
const message=(path,time)=>`bajaj-maintenance-sync-v1\nPOST\n${path}\n${time}`;
const key=secret=>crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
export async function syncHeaders(secret,path='/api/maintenance/sync',time=Math.floor(Date.now()/1000)){
 if(typeof secret!=='string'||secret.length<32)throw Error('A conexão da rotina não está configurada.');
 const signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(message(path,String(time))))),v=>v.toString(16).padStart(2,'0')).join('');return {'X-Bajaj-Maintenance-Time':String(time),'X-Bajaj-Maintenance-Signature':signature};
}
export async function verifySync(request,secret,time=Math.floor(Date.now()/1000)){
 const stamp=request.headers.get('X-Bajaj-Maintenance-Time')||'',signature=request.headers.get('X-Bajaj-Maintenance-Signature')||'';
 if(request.method!=='POST'||new URL(request.url).pathname!=='/api/maintenance/sync'||typeof secret!=='string'||secret.length<32||!/^\d{10,12}$/.test(stamp)||Math.abs(time-Number(stamp))>60||!/^[a-f0-9]{64}$/.test(signature))return false;
 return crypto.subtle.verify('HMAC',await key(secret),Uint8Array.from(signature.match(/../g),v=>parseInt(v,16)),encoder.encode(message('/api/maintenance/sync',stamp)));
}
