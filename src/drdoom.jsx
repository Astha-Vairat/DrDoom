import { useState, useEffect, useRef } from "react";

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  html,body,#root{background:#030303;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px 60px;font-family:'DM Sans',sans-serif}
  ::-webkit-scrollbar{display:none}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.85)}}
  @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
`;

const V = {
  doom:"#FF2D2D",dom:"#00E5A0",amb:"#FFB830",
  bg:"#080808",s1:"#111",s2:"#181818",s3:"#222",
  border:"rgba(255,255,255,0.07)",text:"#F0EDE8",
  muted:"rgba(240,237,232,0.4)",dimmed:"rgba(240,237,232,0.6)",
};

const TABS=[{id:"you",icon:"⚡",label:"You"},{id:"orbit",icon:"🌐",label:"Orbit"},{id:"community",icon:"👥",label:"Community"}];

const FRIENDS=[
  {name:"Marcus",emoji:"🏄",scrollTime:"3.1h",doom:18,status:"dom",live:"On track · 18 min deep work",liveColor:V.dom,bg:"rgba(0,229,160,0.08)",bc:"rgba(0,229,160,0.25)",scrolling:false,goal:"Hit the gym daily"},
  {name:"Priya",emoji:"🎨",scrollTime:"6.2h",doom:34,status:"dom",live:"Drifting · 22 min on Reels",liveColor:V.amb,bg:"rgba(255,184,48,0.08)",bc:"rgba(255,184,48,0.25)",scrolling:true,goal:"Finish design course"},
  {name:"Kai",emoji:"⚡",scrollTime:"9.4h",doom:51,status:"mid",live:"Deep scroll · 41 min on TikTok",liveColor:V.doom,bg:"rgba(255,45,45,0.08)",bc:"rgba(255,45,45,0.25)",scrolling:true,goal:"Read 2 books"},
  {name:"Jordan",emoji:"🎯",scrollTime:"16h",doom:81,status:"doom",live:"Off · Quiet mode",liveColor:V.muted,bg:V.s2,bc:V.border,scrolling:false,goal:"Sleep before midnight"},
];

const CHALLENGES=[
  {title:"No-scroll mornings",desc:"No social media before 10am for 5 days",pct:68,members:247,days:"3 days left"},
  {title:"Under 30 min/day",desc:"Keep daily scroll under 30 minutes all week",pct:41,members:189,days:"5 days left"},
  {title:"Deep work streak",desc:"3 uninterrupted 90-min focus blocks this week",pct:29,members:94,days:"4 days left"},
];

const LB=[
  {emoji:"🦅",name:"SilentEagle",score:8,streak:14},
  {emoji:"🌿",name:"GreenMind99",score:19,streak:9},
  {emoji:"⚔",name:"FocusBlade",score:23,streak:7},
  {emoji:"🎯",name:"You (anon)",score:73,streak:2,you:true},
];

const FEED_ITEMS=[
  {emoji:"🎉",text:"Day 7 clean — no TikTok all week. Feeling like a different person.",time:"2h ago"},
  {emoji:"💪",text:"Failed the morning challenge but back on track. Not giving up.",time:"4h ago"},
  {emoji:"🔥",text:"14 day streak. The first 3 days were the hardest.",time:"6h ago"},
];

const GOAL_PRESETS=["Read more","Exercise daily","Learn something new","Less phone time","Sleep better","Focus at work","Spend time with family","Practice a skill"];
const TL_SEGS=[{color:V.dom,flex:2},{color:V.amb,flex:1},{color:V.doom,flex:3},{color:V.dom,flex:1},{color:V.amb,flex:2},{color:V.doom,flex:4},{color:V.dom,flex:1}];

async function callClaude(system,userContent,maxTokens=300,history=null){
  const messages=history||[{role:"user",content:userContent}];
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-iab":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,system,messages}),
  });
  const data=await res.json();
  return data.content[0].text;
}

function Chip({children,type="doom"}){
  const s={doom:{bg:"rgba(255,45,45,.15)",color:V.doom,border:"rgba(255,45,45,.3)"},dom:{bg:"rgba(0,229,160,.12)",color:V.dom,border:"rgba(0,229,160,.25)"},amb:{bg:"rgba(255,184,48,.12)",color:V.amb,border:"rgba(255,184,48,.25)"}};
  const c=s[type];
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:100,fontSize:10,fontWeight:500,letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",background:c.bg,color:c.color,border:`.5px solid ${c.border}`}}>{children}</span>;
}

function Onboarding({onStart}){
  return(
    <div style={{position:"absolute",inset:0,background:V.bg,zIndex:400,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",textAlign:"center"}}>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:72,letterSpacing:".04em",color:V.text,lineHeight:1}}>DR<span style={{color:V.doom}}>DOOM</span></div>
      <div style={{fontSize:14,color:V.muted,lineHeight:1.6,margin:"12px 0 32px",maxWidth:280}}>AI-powered attention accountability. Fight back against the algorithm — with your people.</div>
      <button onClick={onStart} style={{background:V.doom,border:"none",borderRadius:100,padding:"14px 40px",fontSize:15,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Get started →</button>
    </div>
  );
}

function GoalsModal({onSave}){
  const [selected,setSelected]=useState(new Set());
  const [custom,setCustom]=useState("");
  const toggle=(g)=>setSelected(p=>{const n=new Set(p);n.has(g)?n.delete(g):n.add(g);return n;});
  const addCustom=()=>{if(!custom.trim())return;toggle(custom.trim());setCustom("");};
  return(
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
      <div style={{background:"#141414",borderRadius:"28px 28px 0 0",padding:"24px 20px 32px",width:"100%",maxHeight:"85%",overflowY:"auto"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:V.text,letterSpacing:".02em",marginBottom:4}}>Set your goals</div>
        <div style={{fontSize:13,color:V.muted,marginBottom:20}}>This week I want to...</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:20}}>
          {GOAL_PRESETS.map(g=>(
            <button key={g} onClick={()=>toggle(g)} style={{background:selected.has(g)?"rgba(0,229,160,.1)":V.s2,border:`.5px solid ${selected.has(g)?"rgba(0,229,160,.35)":V.border}`,borderRadius:100,padding:"6px 13px",fontSize:12,color:selected.has(g)?V.dom:V.dimmed,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>{g}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <input value={custom} onChange={e=>setCustom(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustom()} placeholder="Add your own goal..." style={{flex:1,background:V.s2,border:`.5px solid ${V.border}`,borderRadius:12,padding:"9px 13px",fontSize:13,color:V.text,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
          <button onClick={addCustom} style={{background:V.s2,border:`.5px solid ${V.border}`,borderRadius:12,padding:"9px 14px",fontSize:13,color:V.dimmed,cursor:"pointer"}}>Add</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:4}}>
          {[...selected].map(g=><div key={g} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(0,229,160,.07)",border:".5px solid rgba(0,229,160,.2)",borderRadius:10,fontSize:13,color:V.dom}}>✓ {g}</div>)}
        </div>
        <button onClick={()=>onSave(selected.size>0?[...selected]:["Focus more","Reduce scrolling"])} style={{width:"100%",background:V.doom,border:"none",borderRadius:16,padding:14,fontSize:15,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:8}}>Save goals &amp; start →</button>
      </div>
    </div>
  );
}

function YouScreen({goals,onCheckin,onEditGoals}){
  const [convs,setConvs]=useState(null);
  const [loading,setLoading]=useState(true);
  const statuses=[{color:V.dom,prog:"on track"},{color:V.amb,prog:"drifting"},{color:V.doom,prog:"off track"},{color:V.dom,prog:"on track"},{color:V.muted,prog:"not started"}];
  const onTrack=goals.filter((_,i)=>i%5===0||i%5===3).length;

  useEffect(()=>{genConversions();},[goals]);

  const genConversions=async()=>{
    setLoading(true);
    try{
      const txt=await callClaude(
        `You generate emotionally impactful real-world equivalents for wasted scrolling time. Given a user's personal goals, create 3 highly personalised conversions. Respond ONLY with valid JSON: {"conversions":[{"num":"X unit","text":"emotional description","type":"doom"},{"num":"X unit","text":"...","type":"doom"},{"num":"X unit","text":"...","type":"bright"}]}. Third (type:bright) should be positive. Keep num short. Text under 18 words. No quotes inside strings.`,
        `User scrolled 14 hours and 4.2km this week. Goals: ${goals.join(", ")}. Generate 3 personalised conversions.`,600
      );
      const json=JSON.parse(txt.replace(/```json|```/g,"").trim());
      setConvs(json.conversions);
    }catch{
      setConvs([
        {num:"4.2km scrolled",text:"A walk from Central Park to Brooklyn Bridge. You never left your couch.",type:"doom"},
        {num:"14 hours lost",text:"Every goal you set this week, practiced twice over.",type:"doom"},
        {num:"2h justified",text:"You told us it was intentional. We believe you. The other 12h? Doom.",type:"bright"},
      ]);
    }
    setLoading(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{paddingTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:V.text,letterSpacing:".02em",lineHeight:.95}}>DR<span style={{color:V.doom}}>DOOM</span></span>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <Chip type="doom">Week 12</Chip>
          <button onClick={onEditGoals} style={{background:V.s2,border:`.5px solid ${V.border}`,borderRadius:100,padding:"4px 10px",fontFamily:"'DM Mono',monospace",fontSize:9,color:V.muted,cursor:"pointer",textTransform:"uppercase",letterSpacing:".06em"}}>Edit goals</button>
        </div>
      </div>

      <div style={{background:V.s1,border:`.5px solid ${V.border}`,borderRadius:24,padding:22,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,right:-30,width:180,height:180,background:"radial-gradient(circle,rgba(255,45,45,0.1) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:V.muted,marginBottom:8}}>Your verdict · Week 12</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:80,lineHeight:.88,color:V.doom}}>DOOMED</div>
        <div style={{fontSize:13,color:V.muted,lineHeight:1.5,maxWidth:230,marginTop:10}}>You scrolled more than you slept. The algorithm won this week.</div>
        <div style={{marginTop:14,display:"flex",gap:8,alignItems:"center"}}>
          <Chip type="doom">Doom score: 73/100</Chip>
          <button onClick={onCheckin} style={{background:V.doom,border:"none",borderRadius:100,padding:"6px 14px",fontSize:12,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Justify →</button>
        </div>
      </div>

      <div style={{background:V.s1,border:`.5px solid ${V.border}`,borderRadius:20,padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em"}}>This week's goals</div>
          <Chip type="dom">{onTrack} / {goals.length} on track</Chip>
        </div>
        {goals.map((g,i)=>{
          const s=statuses[i%statuses.length];
          return(<div key={g} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<goals.length-1?`.5px solid ${V.border}`:"none"}}>
            <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:s.color}}/>
            <div style={{fontSize:13,color:V.text,flex:1}}>{g}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:V.muted}}>{s.prog}</div>
          </div>);
        })}
      </div>

      <div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>This week</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {label:"Total scroll",num:"4.2",suffix:" km",unit:"of thumb movement",color:V.doom},
            {label:"Time lost",num:"14",suffix:"h",unit:"across all apps"},
            {label:"Sessions",num:"87",unit:"avg 9.7 min each"},
            {label:"Intent drift",num:"6",suffix:"×",unit:"detected this week",color:V.amb},
          ].map(s=>(
            <div key={s.label} style={{background:V.s1,border:`.5px solid ${V.border}`,borderRadius:18,padding:16}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{s.label}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,lineHeight:1,color:s.color||V.text}}>{s.num}<span style={{fontSize:16}}>{s.suffix}</span></div>
              <div style={{fontSize:12,color:V.muted,lineHeight:1.4,marginTop:2}}>{s.unit}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Today's attention timeline</div>
        <div style={{background:V.s1,border:`.5px solid ${V.border}`,borderRadius:20,padding:18}}>
          <div style={{display:"flex",gap:3,height:28,borderRadius:8,overflow:"hidden"}}>
            {TL_SEGS.map((s,i)=><div key={i} style={{flex:s.flex,background:s.color,borderRadius:2,opacity:.85}}/>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            {["8am","12pm","6pm","now"].map(t=><span key={t} style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:V.muted}}>{t}</span>)}
          </div>
          <div style={{height:.5,background:V.border,margin:"10px 0"}}/>
          <div style={{fontSize:12,color:V.muted}}>⚠ Drift detected at <span style={{color:V.amb}}>7:42 PM</span> — Study → Reels</div>
        </div>
      </div>

      <div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
          What 14h could've been
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,padding:"2px 7px",borderRadius:100,background:"rgba(0,229,160,.1)",color:V.dom,border:".5px solid rgba(0,229,160,.2)"}}>AI personalised</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {loading?(
            <div style={{background:"rgba(255,45,45,.06)",border:".5px solid rgba(255,45,45,.18)",borderRadius:18,padding:"16px 18px",minHeight:72,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:V.muted}}>Generating based on your goals...</span>
            </div>
          ):convs?.map((c,i)=>{
            const d=c.type==="doom";
            return(<div key={i} style={{background:d?"rgba(255,45,45,.06)":"rgba(0,229,160,.06)",border:`.5px solid ${d?"rgba(255,45,45,.18)":"rgba(0,229,160,.18)"}`,borderRadius:18,padding:"16px 18px"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,letterSpacing:".02em",lineHeight:1.1,color:d?V.doom:V.dom}}>{c.num}</div>
              <div style={{fontSize:13,color:V.muted,marginTop:4,lineHeight:1.5}}>{c.text}</div>
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}

function CheckinScreen({goals,onBack}){
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState([]);
  const [qrs,setQrs]=useState(["I use Instagram for work","Most of it was just habit","Some of it was intentional","I think I need help"]);
  const bottomRef=useRef(null);
  useEffect(()=>{initChat();},[]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  const SYS="You are DrDoom AI, a sharp and caring weekly check-in assistant. Be direct, smart, occasionally witty — like a friend who genuinely cares but won't coddle. Keep responses under 60 words. Ask one question at a time. Don't be preachy.";

  const initChat=async()=>{
    const goalsStr=goals.length?goals.join(", "):"general productivity";
    const initContent=`Context: DrDoom user. This week: 14h scrolled, Instagram 6h12m, TikTok 5h48m, 4.2km scroll distance, 87 sessions avg 9.7min, doom score 73/100, 6 drift events. Goals: ${goalsStr}. Start weekly check-in. Be direct, a little edgy, like a sharp friend who cares. First message only.`;
    const initHistory=[{role:"user",content:initContent}];
    setLoading(true);
    try{
      const reply=await callClaude(SYS,null,300,initHistory);
      setMsgs([{role:"a",text:reply}]);
      setHistory([...initHistory,{role:"assistant",content:reply}]);
    }catch{
      setMsgs([{role:"a",text:"14 hours. Let's not sugarcoat it — that's a lot. What actually felt worth it this week?"}]);
    }
    setLoading(false);
  };

  const send=async(text)=>{
    if(!text?.trim()||loading)return;
    const t=text.trim();
    setInput("");
    setMsgs(p=>[...p,{role:"u",text:t}]);
    setLoading(true);
    const newHistory=[...history,{role:"user",content:t}];
    setHistory(newHistory);
    try{
      const reply=await callClaude(SYS,null,300,newHistory.slice(-8));
      setMsgs(p=>[...p,{role:"a",text:reply}]);
      setHistory(p=>[...p,{role:"assistant",content:reply}]);
    }catch{
      setMsgs(p=>[...p,{role:"a",text:"Having trouble connecting. What's one thing you'd do differently next week?"}]);
    }
    setLoading(false);
    const pools=[["2h was genuinely useful","It was mostly habit","I learned something","I was bored"],["Set a 45min daily limit","I disagree","How do my friends score?","Show me my worst day"],["I want to improve","This is fair","Can you adjust my score?","What should I focus on?"]];
    setQrs(pools[Math.floor(Math.random()*3)]);
  };

  return(
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",background:V.bg}}>
      <button onClick={onBack} style={{position:"absolute",top:14,right:20,background:"none",border:"none",fontFamily:"'DM Mono',monospace",fontSize:11,color:V.muted,cursor:"pointer",zIndex:160,textTransform:"uppercase",letterSpacing:".06em"}}>← Back</button>
      <div style={{flex:1,overflowY:"auto",padding:"62px 16px 16px",display:"flex",flexDirection:"column"}}>
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:V.text,letterSpacing:".02em"}}>CHECK-IN</div>
          <div style={{fontSize:12,color:V.muted,marginTop:2}}>Weekly justification · AI-powered</div>
        </div>
        <div style={{background:V.s1,border:`.5px solid ${V.border}`,borderRadius:18,padding:"14px 16px",display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:12,background:V.s2,border:".5px solid rgba(255,45,45,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🤖</div>
          <div>
            <div style={{fontWeight:500,fontSize:13,color:V.text}}>DrDoom AI</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:4,fontFamily:"'DM Mono',monospace",fontSize:9,padding:"2px 7px",borderRadius:100,background:"rgba(255,45,45,.1)",color:"rgba(255,45,45,.7)",border:".5px solid rgba(255,45,45,.2)",marginTop:2}}>
              <span style={{display:"inline-block",animation:"spin 1.5s linear infinite"}}>◐</span> Powered by Claude
            </div>
          </div>
          <div style={{marginLeft:"auto"}}><Chip type="doom">14h reviewed</Chip></div>
        </div>
        <div style={{display:"flex",flexDirection:"column"}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",maxWidth:"84%",gap:3,marginBottom:10,animation:"msgIn .25s ease forwards",alignSelf:m.role==="u"?"flex-end":"flex-start",alignItems:m.role==="u"?"flex-end":"flex-start"}}>
              <div style={{background:m.role==="u"?"rgba(255,45,45,.15)":V.s2,border:`.5px solid ${m.role==="u"?"rgba(255,45,45,.25)":V.border}`,borderRadius:m.role==="u"?"18px 18px 5px 18px":"18px 18px 18px 5px",padding:"10px 13px",fontSize:13.5,color:V.text,lineHeight:1.5}}>{m.text}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted}}>just now</div>
            </div>
          ))}
          {loading&&(
            <div style={{alignSelf:"flex-start",marginBottom:10}}>
              <div style={{background:V.s2,border:`.5px solid ${V.border}`,borderRadius:"18px 18px 18px 5px",padding:"12px 16px",display:"flex",gap:4}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:V.muted,animation:`pulse 1.2s ${i*0.18}s infinite`}}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
      </div>
      <div style={{background:"rgba(8,8,8,.98)",backdropFilter:"blur(20px)",borderTop:`.5px solid ${V.border}`}}>
        <div style={{display:"flex",gap:7,overflowX:"auto",padding:"0 14px 10px",scrollbarWidth:"none"}}>
          {qrs.map(r=><button key={r} onClick={()=>send(r)} style={{background:V.s2,border:`.5px solid ${V.border}`,borderRadius:100,padding:"7px 13px",fontSize:12,color:V.text,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>{r}</button>)}
        </div>
        <div style={{padding:"10px 14px 12px",display:"flex",gap:8,alignItems:"center"}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder="Tell DrDoom what was worth it..." style={{flex:1,background:V.s2,border:`.5px solid ${V.border}`,borderRadius:20,padding:"10px 15px",fontSize:13.5,color:V.text,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
          <button onClick={()=>send(input)} style={{width:36,height:36,borderRadius:"50%",background:V.doom,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff",flexShrink:0}}>➤</button>
        </div>
      </div>
    </div>
  );
}

function OrbitScreen(){
  const [pings,setPings]=useState({});
  const [toast,setToast]=useState(null);
  const [quietMode,setQuietMode]=useState(false);
  const sorted=[...FRIENDS].sort((a,b)=>a.doom-b.doom);

  const sendPing=async(i,name,goal)=>{
    if(pings[i]==="sent")return;
    setPings(p=>({...p,[i]:"loading"}));
    try{
      const msg=await callClaude("Generate a short, warm, witty ping to send to a friend who is doomscrolling. Reference their goal. Under 12 words. No quotes.",`Friend: ${name}. Goal: ${goal}. Scrolling 40+ mins. Write the ping.`,60);
      setPings(p=>({...p,[i]:"sent"}));
      setToast(`Ping to ${name}: "${msg.replace(/"/g,"")}"`);
    }catch{
      setPings(p=>({...p,[i]:"sent"}));
      setToast(`Pinged ${name} 👀`);
    }
    setTimeout(()=>setToast(null),3500);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{paddingTop:6}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:V.text,letterSpacing:".02em"}}>ORBIT</div>
        <div style={{fontSize:13,color:V.muted,marginTop:2}}>Your accountability network</div>
      </div>
      <div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Live right now</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {FRIENDS.map((f,i)=>(
            <div key={f.name} style={{background:V.s1,border:`.5px solid ${f.scrolling?f.bc:V.border}`,borderRadius:18,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,background:f.bg,border:`1.5px solid ${f.bc}`}}>{f.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:500,color:V.text}}>{f.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4,fontFamily:"'DM Mono',monospace",fontSize:10,textTransform:"uppercase",letterSpacing:".04em"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:f.liveColor,animation:"pulse 2s infinite",flexShrink:0}}/>
                  <span style={{color:f.liveColor}}>{f.live}</span>
                </div>
              </div>
              {f.scrolling&&<button onClick={()=>sendPing(i,f.name,f.goal)} style={{background:pings[i]==="sent"?"rgba(0,229,160,.08)":"none",border:`.5px solid ${pings[i]==="sent"?"rgba(0,229,160,.4)":V.border}`,borderRadius:100,padding:"6px 12px",fontSize:12,color:pings[i]==="sent"?V.dom:V.dimmed,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",flexShrink:0,transition:"all .2s"}}>{pings[i]==="loading"?"Writing...":pings[i]==="sent"?"Sent ✓":"Ping"}</button>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>This week's standings</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {sorted.map((f,i)=>(
            <div key={f.name} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:V.s2,borderRadius:14}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:i===0?V.amb:V.muted,width:20,textAlign:"center"}}>{i+1}</div>
              <div style={{width:34,height:34,borderRadius:"50%",background:V.s3,border:`.5px solid ${V.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{f.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:V.text}}>{f.name}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,marginTop:1}}>{f.scrollTime} · score {f.doom}</div>
              </div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:".04em",color:f.status==="dom"?V.dom:f.status==="mid"?V.amb:V.doom}}>{f.status.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:V.s1,border:`.5px solid ${V.border}`,borderRadius:20,padding:18,textAlign:"center"}}>
        <div style={{fontSize:12,color:V.muted,marginBottom:6}}>You are visible to your Orbit as</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:V.doom,letterSpacing:".02em"}}>DOOM · 14h scrolled</div>
        <div style={{fontSize:12,color:V.muted,marginTop:4}}>They can ping you anytime</div>
        <button onClick={()=>setQuietMode(true)} style={{marginTop:12,background:V.s2,border:`.5px solid ${quietMode?"rgba(255,184,48,.4)":V.border}`,borderRadius:100,padding:"8px 18px",fontSize:12,color:quietMode?V.amb:V.dimmed,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>{quietMode?"🔕 Quiet mode on":"Go quiet mode"}</button>
      </div>
      <div style={{background:V.s1,border:`.5px solid ${V.border}`,borderRadius:20,padding:18}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Invite to Orbit</div>
        <div style={{fontSize:13,color:V.muted,marginBottom:12}}>Add people who make you better.</div>
        <div style={{display:"flex",gap:8}}>
          <input placeholder="Name or @handle" style={{flex:1,background:V.s2,border:`.5px solid ${V.border}`,borderRadius:12,padding:"9px 13px",fontSize:13,color:V.text,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
          <button style={{background:V.dom,border:"none",borderRadius:12,padding:"9px 14px",fontSize:12,fontWeight:600,color:"#000",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Invite</button>
        </div>
      </div>
      {toast&&<div style={{position:"fixed",bottom:100,left:16,right:16,maxWidth:361,margin:"0 auto",background:"#1a1a1a",border:".5px solid rgba(0,229,160,.3)",borderRadius:14,padding:"12px 14px",fontSize:12,color:V.dom,zIndex:999,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>{toast}</div>}
    </div>
  );
}

function CommunityScreen(){
  const [challenges,setChallenges]=useState(CHALLENGES.map(c=>({...c,joined:false})));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{paddingTop:6}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:V.text,letterSpacing:".02em"}}>COMMUNITY</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
          <div style={{fontSize:13,color:V.muted}}>Anonymous · Challenge-driven</div>
          <Chip type="amb">🎭 Anon</Chip>
        </div>
      </div>
      <div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Active challenges</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {challenges.map((c,i)=>(
            <div key={c.title} style={{background:V.s1,border:`.5px solid ${V.border}`,borderRadius:20,padding:"16px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:V.text,lineHeight:1.3}}>{c.title}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,marginTop:2}}>{c.members} members · {c.days}</div>
                </div>
                <button onClick={()=>setChallenges(p=>p.map((x,j)=>j===i?{...x,joined:!x.joined}:x))} style={{background:c.joined?"rgba(0,229,160,.1)":"none",border:`.5px solid ${c.joined?"rgba(0,229,160,.35)":V.border}`,borderRadius:100,padding:"7px 16px",fontSize:12,fontWeight:500,color:c.joined?V.dom:V.text,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s",marginLeft:12,flexShrink:0}}>{c.joined?"Joined ✓":"Join"}</button>
              </div>
              <div style={{fontSize:12,color:V.muted,marginBottom:8}}>{c.desc}</div>
              <div style={{height:5,background:V.s3,borderRadius:3,overflow:"hidden",marginBottom:6}}>
                <div style={{height:"100%",borderRadius:3,background:V.dom,width:`${c.pct}%`,transition:"width .5s ease"}}/>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted}}>{c.pct}% of members on track today</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>This week's dominators</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {LB.map((r,i)=>(
            <div key={r.name} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:r.you?"rgba(255,45,45,.05)":V.s2,border:`.5px solid ${r.you?"rgba(255,45,45,.25)":"transparent"}`,borderRadius:14}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:i===0?V.amb:V.muted,width:22,textAlign:"center"}}>{i+1}</div>
              <div style={{width:32,height:32,borderRadius:"50%",background:V.s3,border:`.5px solid ${V.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{r.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:r.you?V.doom:V.text}}>{r.name}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,marginTop:1}}>🔥 {r.streak} day streak</div>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:r.score<40?V.dom:r.score<60?V.amb:V.doom}}>{r.score}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Community wins</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {FEED_ITEMS.map((f,i)=>(
            <div key={i} style={{background:V.s2,border:`.5px solid ${V.border}`,borderRadius:14,padding:"12px 14px",display:"flex",gap:10}}>
              <div style={{fontSize:18}}>{f.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:V.text,lineHeight:1.5}}>{f.text}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:V.muted,marginTop:4}}>{f.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DrDoom(){
  const [phase,setPhase]=useState("onboard");
  const [tab,setTab]=useState("you");
  const [goals,setGoals]=useState([]);
  const [clock,setClock]=useState(()=>{const d=new Date();return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;});
  useEffect(()=>{const id=setInterval(()=>{const d=new Date();setClock(`${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`);},30000);return()=>clearInterval(id);},[]);

  return(
    <>
      <style>{css}</style>
      <div style={{position:"relative"}}>
        <div style={{background:"#1c1c1e",borderRadius:54,padding:13,width:393,boxShadow:"0 0 0 1px rgba(255,255,255,0.1),0 60px 140px rgba(0,0,0,0.95),inset 0 1px 0 rgba(255,255,255,0.07)"}}>
          <div style={{background:V.bg,borderRadius:42,overflow:"hidden",height:800,position:"relative"}}>
            <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",width:126,height:34,background:"#0a0a0a",borderRadius:20,zIndex:200,border:"1px solid rgba(255,255,255,0.06)"}}/>
            <div style={{position:"absolute",top:0,left:0,right:0,height:54,padding:"14px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:150}}>
              <span style={{fontSize:15,fontWeight:600,color:V.text}}>{clock}</span>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:V.text,display:"flex",gap:5,alignItems:"center"}}><span>●●●</span><span style={{fontSize:10}}>▲</span><span>█▌</span></div>
            </div>

            {phase==="checkin"?(
              <CheckinScreen goals={goals} onBack={()=>setPhase("app")}/>
            ):(
              <div style={{position:"absolute",inset:0,top:0,bottom:80,overflowY:"auto",overflowX:"hidden",padding:"62px 20px 24px",scrollbarWidth:"none"}}>
                {phase==="app"&&tab==="you"&&<YouScreen goals={goals} onCheckin={()=>setPhase("checkin")} onEditGoals={()=>setPhase("goals")}/>}
                {phase==="app"&&tab==="orbit"&&<OrbitScreen/>}
                {phase==="app"&&tab==="community"&&<CommunityScreen/>}
              </div>
            )}

            {phase==="app"&&(
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"rgba(8,8,8,0.97)",backdropFilter:"blur(24px)",borderTop:`.5px solid ${V.border}`,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 4px 8px",zIndex:100}}>
                {TABS.map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:"10px 12px",borderRadius:14,flex:1}}>
                    <span style={{fontSize:18,lineHeight:1,transform:tab===t.id?"scale(1.15)":"scale(1)",transition:"transform .2s",display:"block"}}>{t.icon}</span>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:".06em",textTransform:"uppercase",color:tab===t.id?V.text:V.muted,transition:"color .2s"}}>{t.label}</span>
                  </button>
                ))}
              </div>
            )}

            {phase==="onboard"&&<Onboarding onStart={()=>setPhase("goals")}/>}
            {phase==="goals"&&<GoalsModal onSave={g=>{setGoals(g);setPhase("app");}}/>}
          </div>
        </div>
      </div>
    </>
  );
}
