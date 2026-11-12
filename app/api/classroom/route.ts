import { env } from "cloudflare:workers";
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))).map(v=>v.toString(16).padStart(2,"0")).join("");}
export async function POST(req:Request){
 try {
 const b:any=await req.json(); const db=env.DB!; const now=Date.now();
 if(b.action==="create"){
  const code=String(100000+crypto.getRandomValues(new Uint32Array(1))[0]%900000);
  const token=crypto.randomUUID()+crypto.randomUUID();
  await db.prepare("INSERT INTO rooms(code,secret,updated,created) VALUES(?,?,?,?)").bind(code,await hash(token),now,now).run();
  return json({code,token});
 }
 const room=await db.prepare("SELECT * FROM rooms WHERE code=? AND created>?").bind(String(b.code),now-180*86400000).first<any>();
 if(!room)return json({error:"きょうしつが みつかりません。コードを たしかめてね。"},404);
 let id=String(b.id||"");
 if(b.action==="join"){
  id=crypto.randomUUID();
  const label="参加端末";
  await db.prepare("INSERT INTO devices(id,room,label,seen) VALUES(?,?,?,?)").bind(id,room.code,label,now).run();
  return json({id});
 }
 const teacher=b.token && await hash(String(b.token))===room.secret;
 if(!teacher){
  const d=await db.prepare("SELECT * FROM devices WHERE id=? AND room=?").bind(id,room.code).first<any>();
  if(!d)return json({error:"もういちど さんかしてね。"},403);
  await db.prepare("UPDATE devices SET seen=? WHERE id=?").bind(now,id).run();
  if(b.action==="done" && (b.mission!==room.mission||b.round!==room.round||room.stage!=="mission"))return json({error:"ミッションが かわったよ。もういちど たしかめてね。"},409);
  if(b.action==="done" && room.stage==="mission")await db.prepare("UPDATE devices SET done=? WHERE id=?").bind(room.round,id).run();
 } else if(b.action==="complete"||b.action==="undoMedal"){
  const mission=Number(b.mission);
  if(!Number.isInteger(mission)||mission<1||mission>6||mission!==room.mission)return json({error:"現在のミッションを確認してください"},400);
  const bit=1 << (mission-1);
  await db.prepare(b.action==="complete" ? "UPDATE rooms SET completed=completed | ? WHERE code=? AND mission=?" : "UPDATE rooms SET completed=completed & ~? WHERE code=? AND mission=?").bind(bit,room.code,mission).run();
 } else if(b.action==="command"){
  if(!["waiting","notice","sos","guide","mission","arigato"].includes(b.stage))return json({error:"操作を確認してください"},400);
  const mission=Number(b.mission??room.mission);
  if(!Number.isInteger(mission)||mission<1||mission>6)return json({error:"ミッションは①〜⑥を選んでください"},400);
  if(mission>1&&["sos","guide","arigato"].includes(b.stage))return json({error:"このミッションは通知と実物活動で進めます。動画は①用です。"},400);
  const newRound=b.stage==="mission" && (room.stage!=="mission" || mission!==room.mission);
  await db.prepare("UPDATE rooms SET stage=?,seq=seq+1,updated=?,playing=?,position=?,round=round+?,mission=? WHERE code=?")
   .bind(b.stage,now,b.playing?1:0,Math.max(0,Math.min(180000,Number(b.position)||0)),newRound?1:0,mission,room.code).run();
 } else if(b.action!=="poll" && b.action!=="done")return json({error:"操作を確認してください"},400);
 const current=await db.prepare("SELECT stage,seq,updated,playing,position,round,mission,completed FROM rooms WHERE code=?").bind(room.code).first();
 const members=teacher?(await db.prepare("SELECT id,label,seen,done FROM devices WHERE room=? ORDER BY seen DESC").bind(room.code).all()).results:undefined;
 return json({state:current,members,serverTime:now});
 }catch{return json({error:"通信できませんでした。もういちど おしてね。"},500)}
}
