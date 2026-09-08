const OK=['*'];const CAP=900,IP_DAY=25,DEV_DAY=25,IP_MIN=8,GAP=1200,RPM=15,NEWMAX=60;
const GM=['gemini-3.5-flash','gemini-3.5-flash-lite','gemini-3.8-flash'];
const GQ=['openai/gpt-oss-120b','qwen/qwen3.8-27b'];
const CF=['@cf/openai/gpt-oss-120b','@cf/meta/llama-3.1-8b-instruct-fp8-fast'];
const RAM={r:[],i:new Map()};
const T=()=>new Date().toISOString().slice(0,10);
const TTL=90000;
async function inc(kv,k,n){const v=(parseInt(await kv.get(k)||'0',10)||0)+n;if(n)await kv.put(k,String(v),{expirationTtl:TTL});return v}
async function get(kv,k){return parseInt(await kv.get(k)||'0',10)||0}
function fast(ip){const n=Date.now();
RAM.r=RAM.r.filter(t=>n-t<6e4);if(RAM.r.length>=RPM)return'سرویس شلوغ است — چند ثانیه دیگر امتحان کنید.';
let s=RAM.i.get(ip);if(!s){s={m:[],l:0};RAM.i.set(ip,s);if(RAM.i.size>5000)RAM.i.clear()}
if(n-s.l<GAP)return'کمی آرام‌تر — چند لحظه صبر کنید.';
s.m=s.m.filter(t=>n-t<6e4);if(s.m.length>=IP_MIN)return'پیام‌های زیادی فرستادید. کمی صبر کنید.';
s.l=n;s.m.push(n);RAM.r.push(n);return''}
function H(o){return{'Access-Control-Expose-Headers':'X-Left,X-Cap,X-Dev','Access-Control-Allow-Origin':OK[0]==='*'?(o||'*'):(OK.includes(o)?o:OK[0]),'Access-Control-Allow-Methods':'POST,GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type,X-Dev','Vary':'Origin'}}
function J(d,s,h){return new Response(JSON.stringify(d),{status:s,headers:{...h,'Content-Type':'application/json;charset=utf-8'}})}
const clean=s=>String(s||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,40);
export default{async fetch(r,e,ctx){
const u=new URL(r.url),o=r.headers.get('Origin')||'',h=H(o),kv=e.Q;
if(r.method==='OPTIONS')return new Response(null,{status:204,headers:h});
if(OK[0]!=='*'&&o&&!OK.includes(o))return J({error:{message:'دامنه مجاز نیست.'}},403,h);
if(!kv)return J({error:{message:'KV وصل نشده. در تنظیمات Worker یک KV با نام Q اضافه کنید.'}},500,h);
const d=T(),ip=r.headers.get('CF-Connecting-IP')||'x',dev=clean(r.headers.get('X-Dev'))||'-';
const kI='i:'+d+':'+ip,kD='d:'+d+':'+dev,kG='g:'+d,kN='n:'+d;
if(u.pathname==='/api/health'){const[g,a,b]=await Promise.all([get(kv,kG),get(kv,kI),dev!=='-'?get(kv,kD):0]);
const used=Math.max(a,b),left=Math.max(0,Math.min(IP_DAY-a,DEV_DAY-b));
return J({ok:1,date:d,globalUsed:g,globalCap:CAP,yourUsed:used,yourCap:IP_DAY,left:g>=CAP?0:left},200,h)}
if(u.pathname!=='/api/chat'&&u.pathname!=='/api/stt')return J({error:{message:'مسیر نامعتبر.'}},404,h);
if(r.method!=='POST')return J({error:{message:'مسیر نامعتبر.'}},404,h);
const f=fast(ip);if(f)return J({error:{message:f}},429,h);
const[g,a,b]=await Promise.all([get(kv,kG),get(kv,kI),dev!=='-'?get(kv,kD):0]);
if(g>=CAP)return J({error:{message:'ظرفیت امروز اپ تکمیل شده است. فردا سر بزنید.'}},503,h);
if(a>=IP_DAY||b>=DEV_DAY)return J({error:{message:'سهمیه امروز شما تمام شد. فردا دوباره امتحان کنید.'}},429,h);
if(dev==='-'){const nn=await get(kv,kN);if(nn>=NEWMAX)return J({error:{message:'ظرفیت کاربران جدید امروز پر شده. فردا سر بزنید.'}},429,h)}
const QH=()=>({...h,'X-Left':String(Math.max(0,Math.min(IP_DAY-a-1,DEV_DAY-b-1))),'X-Cap':String(IP_DAY)});
const bump=()=>{const p=[inc(kv,kI,1),inc(kv,kG,1)];if(dev!=='-')p.push(inc(kv,kD,1));else p.push(inc(kv,kN,1));ctx.waitUntil(Promise.all(p))};
try{let x,j;
if(u.pathname==='/api/stt'){if(!e.GROQ_KEY)return J({error:{message:'GROQ_KEY تنظیم نشده.'}},500,h);
const ab=await r.arrayBuffer();if(ab.byteLength>8e6)return J({error:{message:'فایل بزرگ است.'}},413,h);
const fd=new FormData();fd.append('file',new Blob([ab]),'a.webm');fd.append('model','whisper-large-v3-turbo');
x=await fetch('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+e.GROQ_KEY},body:fd});
j=await x.json().catch(()=>({}));if(x.ok)bump();return J(j,x.status,QH())}
let B;try{const t=await r.text();if(t.length>6e6)return J({error:{message:'حجم زیاد.'}},413,h);B=JSON.parse(t)}catch(_){return J({error:{message:'درخواست نامعتبر.'}},400,h)}
const p=B.provider||'gemini',m=B.model||'';
if(p==='gemini'){if(!GM.includes(m))return J({error:{message:'مدل مجاز نیست: '+m}},400,h);
if(!e.GEMINI_KEY)return J({error:{message:'GEMINI_KEY تنظیم نشده.'}},500,h);
const q={contents:B.contents||[],generationConfig:B.generationConfig||{}};if(B.system_instruction)q.system_instruction=B.system_instruction;
const gu='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(m)+':generateContent?key='+encodeURIComponent(e.GEMINI_KEY),go={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)};
x=await fetch(gu,go);if(x.status===429||x.status===503){await new Promise(z=>setTimeout(z,2500));x=await fetch(gu,go)}}
else if(p==='groq'){if(!GQ.includes(m))return J({error:{message:'مدل مجاز نیست: '+m}},400,h);
if(!e.GROQ_KEY)return J({error:{message:'GROQ_KEY تنظیم نشده.'}},500,h);
const q={model:m,messages:B.messages||[],temperature:B.temperature??0.7,max_tokens:Math.min(B.max_tokens||2500,4000)};if(B.reasoning_effort)q.reasoning_effort=B.reasoning_effort;
x=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+e.GROQ_KEY},body:JSON.stringify(q)})}
else if(p==='cf'){if(!CF.includes(m))return J({error:{message:'مدل مجاز نیست: '+m}},400,h);
if(!e.AI)return J({error:{message:'AI binding تنظیم نشده.'}},500,h);
try{const a=await e.AI.run(m,{messages:B.messages||[],max_tokens:Math.min(B.max_tokens||2500,4000),temperature:B.temperature??0.7});
const txt=a.choices?.[0]?.message?.content??a.response??a.result?.response??'';bump();
return J({choices:[{message:{role:'assistant',content:txt}}]},200,QH())}
catch(err){return J({error:{message:String(err.message||err)}},502,h)}}
else return J({error:{message:'سرویس ناشناخته.'}},400,h);
j=await x.json().catch(()=>({}));if(x.ok)bump();return J(j,x.status,QH())}
catch(err){return J({error:{message:String(err.message||err)}},502,h)}}};
