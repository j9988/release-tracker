import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabaseClient.js';
import './styles.css';

const DEFAULT_TYPES = ['Album','Single','EP','OST','Collaboration','Feat','Re-release','Mixtape','Other'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const WEEKDAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const STORAGE_KEY = 'release-tracker-v1';
const PUBLIC_DATA_ID = 'public';

const sampleArtists = [
  {id:'a-the-quiett', name:'The Quiett', label:'DAYTONA', note:'', color:'#f2df83'},
  {id:'a-zene', name:'ZENE THE ZILLA', label:'DAYTONA', note:'', color:'#d8b7ff'},
  {id:'a-leellamarz', name:'Leellamarz', label:'Ambition Musik', note:'', color:'#a8d7c2'},
  {id:'a-odee', name:'ODEE', label:'Vismajor Company', note:'', color:'#ffb58f'},
  {id:'a-view', name:'view', label:'', note:'', color:'#a9c9ff'},
  {id:'a-nosun', name:'Nosun', label:'', note:'', color:'#e7a8ba'},
  {id:'a-raewon', name:'래원', label:'', note:'', color:'#b7d7ef'},
  {id:'a-huh', name:'Huh', label:'', note:'', color:'#d4d0b4'},
  {id:'a-jaeha', name:'재하', label:'', note:'', color:'#d8a9a9'},
  {id:'a-hwang', name:'황세현', label:'', note:'', color:'#b4c4a8'},
  {id:'a-crucial', name:'CRUCiAL STAR', label:'', note:'', color:'#d7b2ff'},
  {id:'a-lovr', name:'Lov3rboi', label:'', note:'', color:'#c2d5e8'},
  {id:'a-hd', name:'HD BL4CK', label:'', note:'', color:'#d4b7a1'},
  {id:'a-fana', name:'FANA', label:'', note:'', color:'#c9c3de'},
  {id:'a-n-jinbo', name:'JINBO the SuperFreak', label:'', note:'', color:'#e8c58d'},
  {id:'a-kambo', name:'KAMBO', label:'', note:'', color:'#b8d8c6'},
  {id:'a-raphael', name:'Raphael', label:'', note:'', color:'#d8c2a9'},
  {id:'a-kor-kash', name:'KOR KASH', label:'', note:'', color:'#c6c0b2'},
  {id:'a-eptend', name:'EPTEND', label:'', note:'', color:'#b9c6df'},
  {id:'a-superbee', name:'SUPERBEE', label:'', note:'', color:'#d9b3bf'},
  {id:'a-mops', name:'Mopsycho', label:'', note:'', color:'#b4d0cc'},
  {id:'a-woo', name:'Wuulsime', label:'', note:'', color:'#d4c3a3'},
  {id:'a-owen', name:'Owen', label:'', note:'', color:'#b7c2d9'},
  {id:'a-trade', name:'TRADE L', label:'', note:'', color:'#d7c2c9'},
  {id:'a-coogie', name:'Coogie', label:'', note:'', color:'#d8bda5'},
  {id:'a-simon', name:'Simon Dominic', label:'', note:'', color:'#c3b8a8'},
];

const sampleTags = [
  {id:'tag-khiphop', name:'K-HipHop', group:'Genre', color:'#f2df83'},
  {id:'tag-daytona', name:'DAYTONA', group:'Label', color:'#d8b7ff'},
  {id:'tag-feat', name:'Feat', group:'Role', color:'#a8d7c2'},
  {id:'tag-trap', name:'Trap', group:'Genre', color:'#ffb58f'},
  {id:'tag-reissue', name:'Re-release', group:'Type', color:'#a9c9ff'},
  {id:'tag-favorite', name:'Favorite', group:'Custom', color:'#e7a8ba'},
];

const sampleLabels = [
  {id:'label-daytona', name:'DAYTONA', color:'#f2df83'},
  {id:'label-ambition', name:'Ambition Musik', color:'#d8b7ff'},
  {id:'label-vismajor', name:'Vismajor Company', color:'#a8d7c2'},
];

const sampleReleases = [
  r('2025-01-23','부스러기','래원','Feat',['The Quiett'],'',['K-HipHop','Feat']),
  r('2025-04-24','16bars','Huh','Feat',['The Quiett'],'',['K-HipHop','Feat']),
  r('2025-04-27','WE HERE','재하','Feat',['The Quiett','황세현'],'',['K-HipHop','DAYTONA','Feat']),
  r('2025-04-30','BABYFACE','Coogie','Feat',['The Quiett','Simon Dominic'],'',['K-HipHop','Feat']),
  r('2025-05-10','2024 DECEMBER FREESTYLE','Wuulsime','Feat',['The Quiett'],'',['K-HipHop','Feat']),
  r('2025-06-01','멍','Owen','Feat',['The Quiett'],'',['K-HipHop','Feat']),
  r('2025-06-07','Butterflies','view','Collaboration',['The Quiett'],'',['K-HipHop','DAYTONA']),
  r('2025-07-24','SUV','CRUCiAL STAR','Feat',['The Quiett','Lov3rboi'],'',['K-HipHop','Feat']),
  r('2025-08-07','S.O.S','ODEE','Feat',['The Quiett','Street Baby'],'',['K-HipHop','Feat']),
  r('2025-09-05','BURN','HD BL4CK','Feat',['The Quiett','Leellamarz','ZENE THE ZILLA'],'',['K-HipHop','Feat']),
  r('2025-09-16','수취인불명','ZENE THE ZILLA','Feat',['The Quiett','FANA'],'',['K-HipHop','DAYTONA','Feat']),
  r('2025-09-28','Cash In','Nosun','Feat',['The Quiett'],'',['K-HipHop','Feat']),
  r('2025-10-06','SEOULIN','TRADE L','Feat',['The Quiett'],'',['K-HipHop','Feat']),
  r('2025-10-07','Times Of Our Lives','JINBO the SuperFreak','Feat',['The Quiett'],'',['K-HipHop','Feat']),
  r('2025-10-30','We Love Hip Hop','KAMBO','Feat',['The Quiett','황세현','Raphael','KOR KASH','EPTEND','SUPERBEE'],'',['K-HipHop','Feat']),
  r('2025-11-14','Diamond','Mopsycho','Feat',['The Quiett'],'',['K-HipHop','Feat']),
  r('2025-10-25','Life 2 Live (10th Anniversary Remastered)','The Quiett','Re-release',[],'Life 2 Live',['K-HipHop','DAYTONA','Re-release']),
];

function r(date,title,primary,type,featured=[],album='',tags=[],coArtists=[]){return {id:crypto.randomUUID(),date,title,primaryArtist:primary,type,featuredArtists:featured,coArtists,album,label:'',tags,cover:'',links:{spotify:'',youtube:''},notes:''};}

function uid(prefix='id'){return `${prefix}-${Math.random().toString(36).slice(2,9)}-${Date.now().toString(36)}`}
// Guard against malformed release records (bad manual edits, older backups, etc.)
// so a single bad row can never crash the whole app with a blank page.
function toArr(v){return Array.isArray(v)?v:(v?[v]:[])}
function normalizeRelease(r){return {...r,featuredArtists:toArr(r.featuredArtists),coArtists:toArr(r.coArtists),tags:toArr(r.tags)}}
const LABEL_PALETTE=['#f2df83','#d8b7ff','#a8d7c2','#ffb58f','#a9c9ff','#e7a8ba'];
function deriveLabels(artists){const names=unique((artists||[]).map(a=>a.label).filter(Boolean));return names.map((name,i)=>({id:uid('label'),name,color:LABEL_PALETTE[i%LABEL_PALETTE.length]}))}
function normalizeData(data){return {...data,types:(data.types&&data.types.length?data.types:DEFAULT_TYPES),labels:(data.labels&&data.labels.length?data.labels:deriveLabels(data.artists)),releases:(data.releases||[]).map(normalizeRelease)}}
const sampleData = {artists:sampleArtists,tags:sampleTags,types:DEFAULT_TYPES,labels:sampleLabels,releases:sampleReleases};
// Data is now namespaced per logged-in user, so multiple accounts on the
// same browser (or a logged-out visitor) never see each other's cache.
function localKey(userId){return `${STORAGE_KEY}:${userId}`}
function loadLocalCache(userId){
  try { const raw=localStorage.getItem(localKey(userId)); if(raw) return normalizeData(JSON.parse(raw)); } catch(e) {}
  return sampleData;
}
function saveLocalCache(userId,data){ try{ localStorage.setItem(localKey(userId),JSON.stringify(data)); }catch(e){} }
function fmtDate(date){ if(!date) return ''; const [y,m,d]=date.split('-'); return `${m}.${d}`; }
function inRange(date,start,end){return date>=start && date<=end}
// For a "Feat" release, the primary artist is just the host of someone else's
// song — it shouldn't count as a credit/appearance for that primary artist's
// own tracking. Only the featured (and co-) artists get credit for Feat.
// Every other type counts the primary artist as usual.
function creditArtists(r){return r.type==='Feat' ? [...r.featuredArtists,...r.coArtists] : [r.primaryArtist,...r.featuredArtists,...r.coArtists]}
// Display string for a release's artist credit: "Primary x Co-artists feat. Featured".
// Co-artists (true collaborators) are joined to the primary with "x"; guests stay "feat.".
function creditLine(r){let s=r.primaryArtist;if(r.coArtists.length)s+=' x '+r.coArtists.join(', ');if(r.featuredArtists.length)s+=' feat. '+r.featuredArtists.join(', ');return s}
function unique(arr){return [...new Set(arr.filter(Boolean))]}
function slug(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
function download(name,content,type='application/json'){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

// ---- Public / Editor gate ----
// Visitors can read the shared public archive without signing in.
// Only authenticated editors get the data-management controls.
function AuthGate(){
  const [session,setSession]=useState(undefined);
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>setSession(data.session||null));
    const {data:sub}=supabase.auth.onAuthStateChange((_event,sess)=>setSession(sess));
    return ()=>sub.subscription.unsubscribe();
  },[]);
  if(session===undefined) return <div className="auth-screen"><div className="auth-loading">加载中…</div></div>;
  if(!session) return window.location.hash==='#login'?<Login/>:<PublicApp/>;
  return <App key={session.user.id} session={session}/>;
}

function PublicApp(){
  const [data,setData]=useState(sampleData);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [page,setPage]=useState('dashboard');
  const [selectedArtist,setSelectedArtist]=useState('');
  const [selectedTag,setSelectedTag]=useState('');
  const [selectedLabel,setSelectedLabel]=useState('');
  const [year,setYear]=useState(new Date().getFullYear());

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      const {data:row,error}=await supabase.from('public_data').select('payload').eq('id',PUBLIC_DATA_ID).maybeSingle();
      if(cancelled) return;
      if(error){ setError('公共数据暂时无法加载，请检查 Supabase RLS 设置。'); setLoading(false); return; }
      if(row?.payload) setData(normalizeData(row.payload));
      else setError('尚未发布公共数据。登录编辑端并保存一次后，访客即可看到最新内容。');
      setLoading(false);
    })();
    return ()=>{cancelled=true};
  },[]);

  return <div className="app">
    <Sidebar page={page} setPage={setPage} data={data} email="VISITOR · READ ONLY" syncState={loading?'loading':'synced'} readOnly onLogin={()=>{window.location.hash='login';window.location.reload()}} />
    <main className="main">
      <Topbar page={page} year={year} setYear={setYear} readOnly onLogin={()=>window.location.reload()} />
      {error&&<div className="public-notice">{error}</div>}
      {page==='dashboard' && <Dashboard data={data} year={year} setPage={setPage} selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} selectedTag={selectedTag} setSelectedTag={setSelectedTag} selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel} readOnly/>}
      {page==='releases' && <Releases data={data} readOnly/>}
      {page==='artists' && <Artists data={data} readOnly/>}
      {page==='labels' && <Labels data={data} readOnly/>}
      {page==='calendar' && <CalendarPage data={data} year={year} setYear={setYear}/>}
      {page==='summary' && <Summary data={data} year={year} selectedArtist={selectedArtist} selectedTag={selectedTag} setSelectedArtist={setSelectedArtist} setSelectedTag={setSelectedTag} selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel} readOnly/>}
    </main>
  </div>
}

function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const submit=async(e)=>{
    e.preventDefault(); setError(''); setLoading(true);
    const {error}=await supabase.auth.signInWithPassword({email,password});
    setLoading(false);
    if(error) setError(error.message);
  };
  return <div className="auth-screen">
    <form className="panel form-panel auth-panel" onSubmit={submit}>
      <div className="form-head"><div><span className="eyebrow">RELEASE TRACKER</span><h2>EDITOR LOGIN</h2><p className="settings-copy">访客可以直接查看；只有编辑者登录后才能修改数据。</p></div></div>
      <div className="form-grid">
        <label className="wide">邮箱<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="editor@example.com"/></label>
        <label className="wide">密码<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></label>
      </div>
      {error&&<div className="form-error">{error}</div>}
      <div className="form-actions" style={{justifyContent:'space-between',alignItems:'center'}}>
        <button type="button" className="text-btn" onClick={()=>{window.location.hash='';window.location.reload()}}>← 返回访客模式</button>
        <button className="primary-btn" disabled={loading}>{loading?'登录中…':'登录编辑端'}</button>
      </div>
    </form>
  </div>
}

function App({session}){
  const userId=session.user.id;
  const [data,setData]=useState(()=>loadLocalCache(userId));
  const [page,setPage]=useState('dashboard');
  const [selectedArtist,setSelectedArtist]=useState('');
  const [selectedTag,setSelectedTag]=useState('');
  const [selectedLabel,setSelectedLabel]=useState('');
  const [year,setYear]=useState(new Date().getFullYear());
  const [notice,setNotice]=useState('');
  const [syncState,setSyncState]=useState('loading'); // loading | synced | saving | offline
  const remoteLoaded=useRef(false);
  const saveTimer=useRef(null);

  // Pull the latest data from Supabase once when we log in / switch user.
  useEffect(()=>{
    remoteLoaded.current=false;
    let cancelled=false;
    (async()=>{
      const {data:row,error}=await supabase.from('app_data').select('payload').eq('user_id',userId).maybeSingle();
      if(cancelled) return;
      if(error){ setSyncState('offline'); remoteLoaded.current=true; return; }
      if(row&&row.payload){
        setData(normalizeData(row.payload));
      } else {
        // brand-new account: seed the cloud with sample data
        await supabase.from('app_data').upsert({user_id:userId,payload:sampleData,updated_at:new Date().toISOString()});
        setData(sampleData);
      }
      remoteLoaded.current=true;
      setSyncState('synced');
    })();
    return ()=>{cancelled=true};
  },[userId]);

  // Always cache locally (instant reloads / offline), and push to Supabase (debounced).
  useEffect(()=>{
    saveLocalCache(userId,data);
    if(!remoteLoaded.current) return; // don't push until the first remote fetch has resolved
    setSyncState('saving');
    if(saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      const now=new Date().toISOString();
      const {error}=await supabase.from('app_data').upsert({user_id:userId,payload:data,updated_at:now});
      // Mirror the editor's archive to the single public read-only dataset.
      // RLS should allow only the editor/owner to INSERT/UPDATE this row.
      const {error:publicError}=await supabase.from('public_data').upsert({id:PUBLIC_DATA_ID,owner_id:userId,payload:data,updated_at:now});
      setSyncState(error||publicError?'offline':'synced');
    },800);
    return ()=>{ if(saveTimer.current) clearTimeout(saveTimer.current) };
  },[data,userId]);

  useEffect(()=>{ if(notice){const t=setTimeout(()=>setNotice(''),2800);return()=>clearTimeout(t)}},[notice]);
  const update=(next)=>setData(prev=>({...prev,...next}));
  const addRelease=(release)=>{update({releases:[release,...data.releases]});setNotice('Release 已保存');setPage('releases')};
  const deleteRelease=(id)=>{if(confirm('确定删除这条 Release 吗？')) update({releases:data.releases.filter(x=>x.id!==id)})};
  const importJSON=(file)=>{const reader=new FileReader();reader.onload=()=>{try{const obj=JSON.parse(reader.result);if(!obj.releases||!obj.artists||!obj.tags)throw Error();update(normalizeData(obj));setNotice('数据已导入')}catch(e){alert('JSON 格式不正确')}};reader.readAsText(file)};
  const resetToSample=()=>{if(confirm('这会清空云端和本地的当前数据，恢复为示例数据，确定吗？')) update(sampleData)};
  const signOut=()=>supabase.auth.signOut();
  return <div className="app">
    <Sidebar page={page} setPage={setPage} data={data} email={session.user.email} syncState={syncState} onSignOut={signOut}/>
    <main className="main">
      <Topbar page={page} year={year} setYear={setYear} />
      {page==='dashboard' && <Dashboard data={data} year={year} setPage={setPage} selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} selectedTag={selectedTag} setSelectedTag={setSelectedTag} selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel}/>} 
      {page==='releases' && <Releases data={data} addRelease={addRelease} deleteRelease={deleteRelease} update={update}/>} 
      {page==='artists' && <Artists data={data} update={update}/>} 
      {page==='labels' && <Labels data={data} update={update}/>} 
      {page==='calendar' && <CalendarPage data={data} year={year} setYear={setYear}/>} 
      {page==='summary' && <Summary data={data} year={year} selectedArtist={selectedArtist} selectedTag={selectedTag} setSelectedArtist={setSelectedArtist} setSelectedTag={setSelectedTag} selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel}/>} 
      {page==='settings' && <Settings data={data} update={update} importJSON={importJSON} onReset={resetToSample} onSignOut={signOut} email={session.user.email}/>} 
      {notice && <div className="toast">{notice}</div>}
    </main>
  </div>
}

const SYNC_LABEL={loading:'⏳ 加载中…',saving:'⏳ 同步中…',synced:'☁ 已同步',offline:'⚠ 离线（仅本地）'};
function Sidebar({page,setPage,data,email,syncState,onSignOut,readOnly=false,onLogin}){const nav=[['dashboard','Overview','01'],['releases','Releases','02'],['artists','Artists','03'],['labels','Labels','04'],['calendar','Calendar','05'],['summary','Summary','06']];return <aside className="sidebar">
  <div className="brand"><div className="brand-mark">RT</div><div><strong>RELEASE<br/>TRACKER</strong><span>music archive</span></div></div>
  <div className="nav-label">WORKSPACE</div>
  <nav>{nav.map(([id,label,num])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><span>{num}</span>{label}</button>)}</nav>
  <div className="side-spacer"/>
  <div className="mini-stat"><span>RELEASES</span><b>{data.releases.length}</b></div>
  <div className="mini-stat"><span>ARTISTS</span><b>{data.artists.length}</b></div>
   {!readOnly&&<button className={page==='settings'?'settings-link active':''} onClick={()=>setPage('settings')}>⚙ Settings</button>}
  <div className="version">{email}</div>
  <div className="version">{SYNC_LABEL[syncState]||''}</div>
  {readOnly?<button className="settings-link login-link" onClick={onLogin}>↗ EDITOR LOGIN</button>:<button className="settings-link" onClick={onSignOut}>⎋ 退出登录</button>}
</aside>}

function Topbar({page,year,setYear,readOnly=false,onLogin}){const titles={dashboard:['Overview','Your music release archive'],releases:['Release Database','Track every drop'],artists:['Artists','People behind the releases'],labels:['Labels','Imprints and who\'s on them'],calendar:['Release Calendar','A date-based release map'],summary:['Summary Generator','Turn your archive into a report'],settings:['Settings & Data','Backup and customize']};const [title,sub]=titles[page];return <header className="topbar"><div><div className="eyebrow">{sub.toUpperCase()}</div><h1>{title}</h1></div><div className="top-actions">{readOnly&&<button className="public-login" onClick={()=>{window.location.hash='login';window.location.reload()}}>EDITOR LOGIN ↗</button>}<button className="year-pill" onClick={()=>setYear(y=>y-1)}>‹</button><span>{year}</span><button className="year-pill" onClick={()=>setYear(y=>y+1)}>›</button></div></header>}

function FilterBar({data,selectedArtist,setSelectedArtist,selectedTag,setSelectedTag,selectedLabel,setSelectedLabel}){return <div className="filterbar"><label>ARTIST<select value={selectedArtist} onChange={e=>setSelectedArtist(e.target.value)}><option value="">All artists</option>{data.artists.sort((a,b)=>a.name.localeCompare(b.name)).map(a=><option key={a.id} value={a.name}>{a.name}</option>)}</select></label><label>TAG<select value={selectedTag} onChange={e=>setSelectedTag(e.target.value)}><option value="">All tags</option>{data.tags.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}</select></label>{setSelectedLabel&&<label>LABEL<select value={selectedLabel} onChange={e=>setSelectedLabel(e.target.value)}><option value="">All labels</option>{data.labels.map(l=><option key={l.id} value={l.name}>{l.name}</option>)}</select></label>}</div>}

function Dashboard({data,year,setPage,selectedArtist,setSelectedArtist,selectedTag,setSelectedTag,selectedLabel,setSelectedLabel,readOnly=false}){
 const releases=data.releases.filter(r=>r.date.startsWith(String(year)) && (!selectedArtist || creditArtists(r).includes(selectedArtist)) && (!selectedTag || r.tags.includes(selectedTag)) && (!selectedLabel || r.label===selectedLabel));
 const monthly=MONTHS.map((_,i)=>releases.filter(r=>new Date(r.date).getMonth()===i).length);
 const max=Math.max(...monthly,1); const byType=data.types.map(type=>[type,releases.filter(r=>r.type===type).length]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);
 const artistCounts={};releases.forEach(r=>creditArtists(r).forEach(a=>artistCounts[a]=(artistCounts[a]||0)+1));const topArtists=Object.entries(artistCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);
 return <div className="content"><FilterBar {...{data,selectedArtist,setSelectedArtist,selectedTag,setSelectedTag,selectedLabel,setSelectedLabel}}/>
  <section className="hero-grid"><div className="hero-card"><div className="hero-small">{selectedArtist||selectedLabel||'ALL ARTISTS'} · {year}</div><div className="hero-number">{releases.length}</div><div className="hero-caption">TOTAL RELEASES IN SELECTED VIEW</div><div className="hero-rule"/><div className="hero-bottom"><span>BUSIEST MONTH</span><b>{MONTHS[monthly.indexOf(max)]} · {max}</b></div></div><div className="chart-card"><div className="card-head"><div><span className="eyebrow">MONTHLY ACTIVITY</span><h2>Release pulse</h2></div><button className="text-btn" onClick={()=>setPage('summary')}>Open summary →</button></div><div className="bars">{monthly.map((n,i)=><div className="bar-col" key={i}><div className="bar-value">{n||''}</div><div className="bar-track"><div className="bar" style={{height:`${Math.max(n/max*100,n?6:0)}%`}}/></div><span>{MONTHS[i]}</span></div>)}</div></div></section>
  <section className="three-grid"><div className="panel"><div className="card-head"><div><span className="eyebrow">BY TYPE</span><h2>Release mix</h2></div></div>{byType.length?byType.slice(0,6).map(([t,n])=><div className="stat-row" key={t}><span>{t}</span><div className="stat-line"><i style={{width:`${n/maxBy(byType)*100}%`}}/></div><b>{n}</b></div>):<Empty/>}</div>
  <div className="panel"><div className="card-head"><div><span className="eyebrow">ARTIST ACTIVITY</span><h2>Most involved</h2></div></div>{topArtists.length?topArtists.map(([a,n],i)=><div className="rank-row" key={a}><span className="rank">0{i+1}</span><span>{a}</span><b>{n}</b></div>):<Empty/>}</div>
  <div className="panel dark-panel"><div className="card-head"><div><span className="eyebrow">QUICK ACCESS</span><h2>Build something</h2></div></div>{!readOnly&&<button className="big-action" onClick={()=>setPage('releases')}>＋ Add release</button>}<button className="big-action" onClick={()=>setPage('calendar')}>▦ Open calendar</button><button className="big-action" onClick={()=>setPage('summary')}>✦ Generate summary</button></div></section>
  <section className="panel release-preview"><div className="card-head"><div><span className="eyebrow">LATEST</span><h2>Recent releases</h2></div><button className="text-btn" onClick={()=>setPage('releases')}>View all →</button></div><ReleaseTable releases={releases.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7)} compact/></section>
 </div>
}
function maxBy(arr){return Math.max(...arr.map(x=>x[1]),1)}
function Empty(){return <div className="empty">No data in this view.</div>}

function Releases({data,addRelease,deleteRelease,update,readOnly=false}){
 const [query,setQuery]=useState('');const [type,setType]=useState('');const [artist,setArtist]=useState('');const [editing,setEditing]=useState(null);const [showForm,setShowForm]=useState(false);
 const filtered=data.releases.filter(r=>(!query||`${r.title} ${r.primaryArtist} ${r.featuredArtists.join(' ')}`.toLowerCase().includes(query.toLowerCase()))&&(!type||r.type===type)&&(!artist||r.primaryArtist===artist)).sort((a,b)=>b.date.localeCompare(a.date));
 const save=(form)=>{if(editing){update({releases:data.releases.map(r=>r.id===editing.id?{...editing,...form}:r)});setEditing(null);setShowForm(false)}else{addRelease({...form,id:uid('rel')});setShowForm(false)}};
 return (
  <div className="content">
   <div className="page-toolbar">
    <div className="search"><span>⌕</span><input placeholder="Search title, artist, feature..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
    <select value={artist} onChange={e=>setArtist(e.target.value)}><option value="">All primary artists</option>{data.artists.map(a=><option key={a.id} value={a.name}>{a.name}</option>)}</select>
    <select value={type} onChange={e=>setType(e.target.value)}><option value="">All types</option>{data.types.map(t=><option key={t}>{t}</option>)}</select>
    {!readOnly && <button className="primary-btn" onClick={()=>{setEditing(null);setShowForm(true)}}>＋ Add release</button>}
   </div>
   {showForm && <ReleaseForm data={data} initial={editing} onSave={save} onCancel={()=>{setShowForm(false);setEditing(null)}}/>}
   <section className="panel">
    <div className="table-meta"><span>{filtered.length} releases</span><span>Local archive · auto-saved</span></div>
    <ReleaseTable readOnly={readOnly} releases={filtered} onEdit={r=>{setEditing(r);setShowForm(true)}} onDelete={deleteRelease}/>
   </section>
  </div>
 )
}

function ReleaseForm({data,initial,onSave,onCancel}){
 const labelOf=name=>data.artists.find(a=>a.name===name)?.label||'';
 const [f,setF]=useState(initial||{date:'',title:'',primaryArtist:data.artists[0]?.name||'',type:'Single',featuredArtists:[],coArtists:[],album:'',label:labelOf(data.artists[0]?.name||''),tags:[],cover:'',links:{spotify:'',youtube:''},notes:''});
 const [featuredText,setFeaturedText]=useState((f.featuredArtists||[]).join(', '));const [coText,setCoText]=useState((f.coArtists||[]).join(', '));const [tagsText,setTagsText]=useState((f.tags||[]).join(', '));
 const set=(k,v)=>setF(x=>({...x,[k]:v})); const setPrimaryArtist=name=>setF(x=>({...x,primaryArtist:name,label:labelOf(name)})); const submit=e=>{e.preventDefault();onSave({...f,featuredArtists:featuredText.split(',').map(s=>s.trim()).filter(Boolean),coArtists:coText.split(',').map(s=>s.trim()).filter(Boolean),tags:tagsText.split(',').map(s=>s.trim()).filter(Boolean),links:f.links||{spotify:'',youtube:''}})};
 return <form className="panel form-panel" onSubmit={submit}><div className="form-head"><div><span className="eyebrow">{initial?'EDIT RELEASE':'NEW RELEASE'}</span><h2>{initial?'Edit release':'Add a release'}</h2></div><button type="button" className="icon-btn" onClick={onCancel}>×</button></div><div className="form-grid"><label>Release date *<input type="date" required value={f.date} onChange={e=>set('date',e.target.value)}/></label><label>Title *<input required value={f.title} onChange={e=>set('title',e.target.value)} placeholder="Song / project title"/></label><label>Primary artist *<select required value={f.primaryArtist} onChange={e=>setPrimaryArtist(e.target.value)}>{data.artists.map(a=><option key={a.id}>{a.name}</option>)}</select></label><label>Release type *<select required value={f.type} onChange={e=>set('type',e.target.value)}>{data.types.map(t=><option key={t}>{t}</option>)}</select></label><label>Featured artists<input value={featuredText} onChange={e=>setFeaturedText(e.target.value)} placeholder="Artist A, Artist B"/></label><label>Co-artists<input value={coText} onChange={e=>setCoText(e.target.value)} placeholder="A, B"/></label><label>Album / EP<input value={f.album} onChange={e=>set('album',e.target.value)} placeholder="Optional project name"/></label><label>Label<select value={f.label} onChange={e=>set('label',e.target.value)}><option value="">Independent (no label)</option>{data.labels.map(l=><option key={l.id} value={l.name}>{l.name}</option>)}</select><small>自动带入所选歌手的 Label，如需要可手动改成其他厂牌。厂牌列表在 Labels 页面管理。</small></label><label className="wide">Tags<input value={tagsText} onChange={e=>setTagsText(e.target.value)} placeholder="K-HipHop, DAYTONA, Favorite"/><small>用逗号分隔；不存在的标签会在保存后自动成为可用标签。</small></label><label className="wide">Cover image URL<input value={f.cover} onChange={e=>set('cover',e.target.value)} placeholder="https://..."/></label><label className="wide">Notes<textarea value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Optional notes"/></label></div><div className="form-actions"><button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button><button className="primary-btn">Save release</button></div></form>
}

function ReleaseTable({releases,onEdit,onDelete,compact=false,readOnly=false}){if(!releases.length)return <Empty/>;return <div className="release-table"><div className="tr th"><span>DATE</span><span>RELEASE</span><span>ARTIST / CREDIT</span><span>TYPE</span><span>TAGS</span>{!compact&&<span/>}</div>{releases.map(r=><div className="tr" key={r.id}><span className="date-cell">{fmtDate(r.date)}<small>{r.date.slice(0,4)}</small></span><span className="title-cell"><strong>{r.title}</strong>{r.album&&<small>{r.album}</small>}</span><span><b>{r.primaryArtist}</b>{r.featuredArtists.length>0&&<small> feat. {r.featuredArtists.join(', ')}</small>}{r.coArtists.length>0&&<small> · {r.coArtists.join(', ')}</small>}</span><span><em className={`type type-${slug(r.type)}`}>{r.type}</em></span><span className="tag-list">{r.tags.slice(0,3).map(t=><i key={t}>#{t}</i>)}{r.tags.length>3&&<i>+{r.tags.length-3}</i>}</span>{!compact&&!readOnly&&<span className="row-actions"><button onClick={()=>onEdit?.(r)}>Edit</button><button onClick={()=>onDelete?.(r.id)}>Delete</button></span>}</div>)}</div>}

function Artists({data,update,readOnly=false}){
 const blank={name:'',label:'',color:'#f2df83'};
 const [form,setForm]=useState(blank);
 const [editingId,setEditingId]=useState(null);
 const set=(k,v)=>setForm(f=>({...f,[k]:v}));
 const startAdd=()=>{setEditingId(null);setForm(blank)};
 const startEdit=(a)=>{setEditingId(a.id);setForm({name:a.name,label:a.label||'',color:a.color||'#f2df83'})};
 const save=()=>{
  const name=form.name.trim();
  if(!name)return;
  if(editingId){
   const old=data.artists.find(a=>a.id===editingId);
   const renamed=old&&old.name!==name;
   const swap=arr=>arr.map(n=>n===old.name?name:n);
   update({
    artists:data.artists.map(a=>a.id===editingId?{...a,name,label:form.label.trim(),color:form.color}:a),
    releases:renamed?data.releases.map(r=>({...r,primaryArtist:r.primaryArtist===old.name?name:r.primaryArtist,featuredArtists:swap(r.featuredArtists),coArtists:swap(r.coArtists)})):data.releases
   });
  } else {
   update({artists:[...data.artists,{id:uid('artist'),name,label:form.label.trim(),note:'',color:form.color}]});
  }
  startAdd();
 };
 const remove=(id)=>{ if(!confirm('确定删除这位歌手吗？（不会删除已关联的 release 记录）'))return; update({artists:data.artists.filter(x=>x.id!==id)}); if(editingId===id)startAdd(); };
 return <div className="content"><section className="artist-layout"><div className="panel"><div className="card-head"><div><span className="eyebrow">ARTIST DIRECTORY</span><h2>{data.artists.length} artists</h2></div></div><div className="artist-grid">{data.artists.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(a=><div className={`artist-card${editingId===a.id?' editing':''}`} key={a.id}><div className="artist-avatar" style={{background:a.color||'#f2df83'}}>{a.name.slice(0,1)}</div><div><strong>{a.name}</strong><span>{a.label||'Independent'}</span><small>{data.releases.filter(r=>creditArtists(r).includes(a.name)).length} credits</small></div>{!readOnly&&<div className="artist-card-actions"><button className="icon-btn" onClick={()=>startEdit(a)}>✎</button><button className="icon-btn" onClick={()=>remove(a.id)}>×</button></div>}</div>)}</div></div>{!readOnly&&<div className="panel sticky-panel"><span className="eyebrow">{editingId?'EDIT ARTIST':'ADD ARTIST'}</span><h2>{editingId?'Update this artist':'Build your directory'}</h2><label>Name<input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Artist name"/></label><label>Label<select value={form.label} onChange={e=>set('label',e.target.value)}><option value="">Independent (no label)</option>{data.labels.map(l=><option key={l.id} value={l.name}>{l.name}</option>)}</select></label><label>Color<input type="color" value={form.color} onChange={e=>set('color',e.target.value)}/></label><div className="form-actions">{editingId&&<button type="button" className="secondary-btn" onClick={startAdd}>Cancel</button>}<button className="primary-btn full" onClick={save}>{editingId?'✓ Save changes':'＋ Add artist'}</button></div><p className="hint">重命名歌手会自动更新其名下所有 release 的署名；删除歌手不会删除已有 release 记录。厂牌列表在 Labels 页面管理。</p></div>}</section></div>
}

function Labels({data,update,readOnly=false}){
 const blank={name:'',color:'#f2df83'};
 const [form,setForm]=useState(blank);
 const [editingId,setEditingId]=useState(null);
 const set=(k,v)=>setForm(f=>({...f,[k]:v}));
 const startAdd=()=>{setEditingId(null);setForm(blank)};
 const startEdit=(l)=>{setEditingId(l.id);setForm({name:l.name,color:l.color||'#f2df83'})};
 const save=()=>{
  const name=form.name.trim();
  if(!name)return;
  if(editingId){
   const old=data.labels.find(l=>l.id===editingId);
   const renamed=old&&old.name!==name;
   if(renamed&&data.labels.some(l=>l.id!==editingId&&l.name===name)){alert('该厂牌已存在');return}
   update({
    labels:data.labels.map(l=>l.id===editingId?{...l,name,color:form.color}:l),
    artists:renamed?data.artists.map(a=>a.label===old.name?{...a,label:name}:a):data.artists,
    releases:renamed?data.releases.map(r=>r.label===old.name?{...r,label:name}:r):data.releases
   });
  } else {
   if(data.labels.some(l=>l.name===name)){alert('该厂牌已存在');return}
   update({labels:[...data.labels,{id:uid('label'),name,color:form.color}]});
  }
  startAdd();
 };
 const remove=(id)=>{
  const l=data.labels.find(x=>x.id===id);
  const artistCount=data.artists.filter(a=>a.label===l.name).length;
  if(!confirm(`确定删除「${l.name}」吗？${artistCount?`有 ${artistCount} 位歌手挂在这个厂牌下，删除后会变成 Independent。`:''}`))return;
  update({
   labels:data.labels.filter(x=>x.id!==id),
   artists:data.artists.map(a=>a.label===l.name?{...a,label:''}:a),
   releases:data.releases.map(r=>r.label===l.name?{...r,label:''}:r)
  });
  if(editingId===id)startAdd();
 };
 return <div className="content"><section className="artist-layout"><div className="panel"><div className="card-head"><div><span className="eyebrow">LABEL DIRECTORY</span><h2>{data.labels.length} labels</h2></div></div><div className="artist-grid">{data.labels.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(l=>{const artists=data.artists.filter(a=>a.label===l.name);return <div className={`artist-card${editingId===l.id?' editing':''}`} key={l.id}><div className="artist-avatar" style={{background:l.color||'#f2df83'}}>{l.name.slice(0,1)}</div><div><strong>{l.name}</strong><span>{artists.length} artist{artists.length===1?'':'s'}</span><small>{artists.length?artists.map(a=>a.name).join(', '):'暂无歌手'}</small></div>{!readOnly&&<div className="artist-card-actions"><button className="icon-btn" onClick={()=>startEdit(l)}>✎</button><button className="icon-btn" onClick={()=>remove(l.id)}>×</button></div>}</div>})}{!data.labels.length&&<Empty/>}</div></div>{!readOnly&&<div className="panel sticky-panel"><span className="eyebrow">{editingId?'EDIT LABEL':'ADD LABEL'}</span><h2>{editingId?'Update this label':'Build your label list'}</h2><label>Name<input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Label / imprint name"/></label><label>Color<input type="color" value={form.color} onChange={e=>set('color',e.target.value)}/></label><div className="form-actions">{editingId&&<button type="button" className="secondary-btn" onClick={startAdd}>Cancel</button>}<button className="primary-btn full" onClick={save}>{editingId?'✓ Save changes':'＋ Add label'}</button></div><p className="hint">重命名厂牌会自动更新旗下歌手与相关 release 的厂牌信息；删除厂牌不会删除歌手或 release，只会把他们变成 Independent。</p></div>}</section></div>
}

function CalendarPage({data,year,setYear}){const [month,setMonth]=useState(new Date().getFullYear()===year?new Date().getMonth():0);const [selected,setSelected]=useState(null);const first=new Date(year,month,1);const start=first.getDay();const days=new Date(year,month+1,0).getDate();const cells=[];for(let i=0;i<start;i++)cells.push(null);for(let d=1;d<=days;d++)cells.push(d);const monthReleases=data.releases.filter(r=>r.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`));return <div className="content"><div className="calendar-toolbar"><button className="year-pill" onClick={()=>setMonth(m=>m===0?11:m-1)}>←</button><h2>{MONTHS[month]} {year}</h2><button className="year-pill" onClick={()=>setMonth(m=>m===11?0:m+1)}>→</button><span className="calendar-count">{monthReleases.length} releases</span></div><section className="calendar-layout"><div className="calendar-grid panel"><div className="calendar-head">{WEEKDAYS.map(w=><span key={w}>{w}</span>)}</div><div className="days">{cells.map((d,i)=>{const date=d?`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`:'';const rs=d?data.releases.filter(r=>r.date===date):[];return <button disabled={!d} className={`day ${rs.length?'has-release':''} ${selected===date?'selected':''}`} key={i} onClick={()=>d&&setSelected(date)}><b>{d||''}</b>{rs.slice(0,3).map(r=><span key={r.id} title={r.title}>{r.title}</span>)}{rs.length>3&&<small>+{rs.length-3} more</small>}</button>})}</div></div><div className="panel day-detail">{selected?<><span className="eyebrow">{selected}</span><h2>Releases</h2>{data.releases.filter(r=>r.date===selected).map(r=><div className="detail-release" key={r.id}><b>{r.title}</b><span>{r.primaryArtist} · {r.type}</span>{r.featuredArtists.length>0&&<small>feat. {r.featuredArtists.join(', ')}</small>}</div>)}</>:<><div className="empty-icon">◌</div><h2>Select a date</h2><p>点击日历中的日期，查看当天所有 Release。</p></>}</div></section></div>}

function Summary({data,year,selectedArtist,selectedTag,setSelectedArtist,setSelectedTag,selectedLabel,setSelectedLabel}){const [start,setStart]=useState(`${year}-01-01`);const [end,setEnd]=useState(`${year}-12-31`);const [type,setType]=useState('');const canvasRef=useRef(null);const artists=selectedArtist? [selectedArtist]:data.artists.map(a=>a.name);const releases=data.releases.filter(r=>inRange(r.date,start,end)&&(!selectedArtist||creditArtists(r).includes(selectedArtist))&&(!selectedTag||r.tags.includes(selectedTag))&&(!selectedLabel||r.label===selectedLabel)&&(!type||r.type===type));const monthly=Array.from({length:12},(_,i)=>releases.filter(r=>new Date(r.date).getMonth()===i&&new Date(r.date).getFullYear()===year).length);const artistCounts={};releases.forEach(r=>creditArtists(r).forEach(a=>artistCounts[a]=(artistCounts[a]||0)+1));const ranked=Object.entries(artistCounts).sort((a,b)=>b[1]-a[1]);const typeCounts=data.types.map(t=>[t,releases.filter(r=>r.type===t).length]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);const grouped=useMemo(()=>{const g={};releases.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(r=>{g[r.type]??=[];g[r.type].push(r)});return g},[releases]);
 const generatePNG=()=>{const canvas=canvasRef.current;if(!canvas)return;const W=1400,H=Math.max(1100,520+releases.length*52);canvas.width=W;canvas.height=H;const c=canvas.getContext('2d');c.fillStyle='#090908';c.fillRect(0,0,W,H);c.fillStyle='#f2df83';c.font='700 76px Arial';c.fillText((selectedArtist||selectedLabel||selectedTag||'RELEASE TRACKER').toUpperCase(),72,100);c.fillStyle='#f5f1e7';c.font='700 28px Arial';c.fillText(`${start}  —  ${end}`,72,148);c.fillStyle='#88857b';c.font='500 18px Arial';c.fillText(`${releases.length} RELEASES · ${ranked.length} ARTISTS · GENERATED FROM YOUR ARCHIVE`,72,184);c.strokeStyle='#4a4943';c.beginPath();c.moveTo(72,210);c.lineTo(W-72,210);c.stroke();let y=260;Object.entries(grouped).forEach(([t,rs])=>{c.fillStyle='#f2df83';c.font='700 22px Arial';c.fillText(t.toUpperCase(),72,y);y+=38;rs.forEach(r=>{c.fillStyle='#f5f1e7';c.font='700 20px Arial';c.fillText(fmtDate(r.date),72,y);c.fillText(r.title.slice(0,58),190,y);c.fillStyle='#9c9a91';c.font='500 18px Arial';c.fillText(creditLine(r).slice(0,78),800,y);y+=42});y+=20});c.fillStyle='#77756d';c.font='500 16px Arial';c.fillText('RELEASE TRACKER · PERSONAL MUSIC ARCHIVE',72,H-36);const a=document.createElement('a');a.download=`release-summary-${start}-${end}.png`;a.href=canvas.toDataURL('image/png');a.click()};
 return <div className="content"><FilterBar data={data} selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} selectedTag={selectedTag} setSelectedTag={setSelectedTag} selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel}/><section className="panel summary-controls"><div><span className="eyebrow">DATE RANGE</span><h2>Define your report</h2></div><label>Start<input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End<input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></label><label>Type<select value={type} onChange={e=>setType(e.target.value)}><option value="">All types</option>{data.types.map(t=><option key={t}>{t}</option>)}</select></label><button className="primary-btn" onClick={generatePNG}>Export PNG</button></section><section className="summary-stats"><div><span>RELEASES</span><b>{releases.length}</b></div><div><span>ARTISTS / CREDITS</span><b>{ranked.length}</b></div><div><span>TOP MONTH</span><b>{MONTHS[monthly.indexOf(Math.max(...monthly))]}</b></div><div><span>TOP TYPE</span><b>{typeCounts[0]?.[0]||'—'}</b></div></section><section className="summary-grid"><div className="panel"><div className="card-head"><div><span className="eyebrow">MONTH BY MONTH</span><h2>Release volume</h2></div></div><div className="summary-bars">{monthly.map((n,i)=><div key={i}><span>{n}</span><i style={{height:`${Math.max(n/Math.max(...monthly,1)*170,n?8:0)}px`}}/><small>{MONTHS[i]}</small></div>)}</div></div><div className="panel"><div className="card-head"><div><span className="eyebrow">ARTIST RANKING</span><h2>Most releases / credits</h2></div></div>{ranked.slice(0,10).map(([a,n],i)=><div className="rank-row" key={a}><span className="rank">{String(i+1).padStart(2,'0')}</span><span>{a}</span><b>{n}</b></div>)}</div></section><section className="panel"><div className="card-head"><div><span className="eyebrow">GENERATED LIST</span><h2>{selectedArtist||selectedLabel||selectedTag||'Selected period'}</h2></div><span className="muted">{releases.length} releases</span></div><div className="summary-list">{Object.entries(grouped).map(([t,rs])=><div className="summary-group" key={t}><h3>{t}<span>{rs.length}</span></h3>{rs.map(r=><div className="summary-line" key={r.id}><b>{fmtDate(r.date)}</b><strong>{r.title}</strong><span>{creditLine(r)}</span></div>)}</div>)}</div></section><canvas ref={canvasRef} className="hidden-canvas"/></div>}

function TypesManager({data,update}){
 const [val,setVal]=useState('');
 const add=()=>{const v=val.trim();if(!v||data.types.includes(v))return;update({types:[...data.types,v]});setVal('')};
 const remove=(t)=>{const inUse=data.releases.filter(r=>r.type===t).length;if(inUse>0&&!confirm(`有 ${inUse} 条 release 正在使用「${t}」这个类型，删除后这些记录仍会保留原来的文字，只是下拉菜单里不会再出现。确定删除吗？`))return;update({types:data.types.filter(x=>x!==t)})};
 return <div className="panel"><span className="eyebrow">RELEASE TYPES</span><h2>管理发行类型</h2><p className="hint">新增 / 编辑 Release 时可选的类型列表。</p><div className="chip-list">{data.types.map(t=><span className="chip" key={t}>{t}<button onClick={()=>remove(t)}>×</button></span>)}</div><div className="inline-add"><input value={val} onChange={e=>setVal(e.target.value)} placeholder="新类型，例如 Livestream" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}}/><button className="secondary-btn" onClick={add}>＋ 添加</button></div></div>
}

function TagsManager({data,update}){
 const [val,setVal]=useState('');
 const add=()=>{const v=val.trim();if(!v||data.tags.some(t=>t.name===v))return;update({tags:[...data.tags,{id:uid('tag'),name:v,group:'Custom',color:['#f2df83','#d8b7ff','#a8d7c2','#ffb58f'][data.tags.length%4]}]});setVal('')};
 const remove=(t)=>{const inUse=data.releases.filter(r=>r.tags.includes(t.name)).length;if(inUse>0&&!confirm(`有 ${inUse} 条 release 使用了「${t.name}」这个标签，删除后会一并从这些记录里移除。确定删除吗？`))return;update({tags:data.tags.filter(x=>x.id!==t.id),releases:data.releases.map(r=>r.tags.includes(t.name)?{...r,tags:r.tags.filter(n=>n!==t.name)}:r)})};
 return <div className="panel"><span className="eyebrow">TAGS</span><h2>管理标签</h2><p className="hint">在 Release 表单里输入新标签也会自动创建；这里可以手动添加或删除。</p><div className="chip-list">{data.tags.map(t=><span className="chip" key={t.id}>{t.name}<button onClick={()=>remove(t)}>×</button></span>)}</div><div className="inline-add"><input value={val} onChange={e=>setVal(e.target.value)} placeholder="新标签，例如 Favorite" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}}/><button className="secondary-btn" onClick={add}>＋ 添加</button></div></div>
}

function Settings({data,update,importJSON,onReset,onSignOut,email}){const fileRef=useRef();const allTags=unique(data.releases.flatMap(r=>r.tags));useEffect(()=>{const existing=new Set(data.tags.map(t=>t.name));const missing=allTags.filter(t=>!existing.has(t));if(missing.length)update({tags:[...data.tags,...missing.map((name,i)=>({id:uid('tag'),name,group:'Custom',color:['#f2df83','#d8b7ff','#a8d7c2','#ffb58f'][i%4]}))]})},[allTags.join('|')]);return <div className="content"><section className="settings-grid"><div className="panel"><span className="eyebrow">ACCOUNT</span><h2>已登录</h2><p className="settings-copy">{email}<br/>数据保存在云端（Supabase），换设备用同一账号登录即可看到同一份数据；本地也会保留一份缓存，离线时仍可查看和编辑，联网后会自动同步。</p><div className="settings-actions"><button className="secondary-btn" onClick={onSignOut}>退出登录</button></div></div><div className="panel"><span className="eyebrow">DATA PORTABILITY</span><h2>Your archive is yours</h2><p className="settings-copy">建议定期导出 JSON 作为额外备份。</p><div className="settings-actions"><button className="primary-btn" onClick={()=>download(`release-tracker-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(data,null,2))}>↓ Export JSON</button><button className="secondary-btn" onClick={()=>fileRef.current?.click()}>↑ Import JSON</button><input ref={fileRef} type="file" accept="application/json" hidden onChange={e=>e.target.files[0]&&importJSON(e.target.files[0])}/></div></div><div className="panel"><span className="eyebrow">ARCHIVE INFO</span><h2>Current dataset</h2><div className="info-list"><div><span>Releases</span><b>{data.releases.length}</b></div><div><span>Artists</span><b>{data.artists.length}</b></div><div><span>Tags</span><b>{data.tags.length}</b></div><div><span>Years covered</span><b>{unique(data.releases.map(r=>r.date.slice(0,4))).sort().join(', ')||'—'}</b></div></div></div><TypesManager data={data} update={update}/><TagsManager data={data} update={update}/><div className="panel danger-panel"><span className="eyebrow">RESET</span><h2>Start over</h2><p>恢复内置示例数据。此操作会覆盖云端和本地保存的当前数据。</p><button className="danger-btn" onClick={onReset}>Reset to sample data</button></div></section></div>}

createRoot(document.getElementById('root')).render(<AuthGate/>);
