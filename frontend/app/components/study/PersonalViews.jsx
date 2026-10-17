"use client";

import { useEffect, useState } from "react";
import { Bookmark, Download, Heart, NotebookPen, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeading, Row, Empty, Action, useApp } from "./Views";
import { getCloudUser, SYNC_COMPLETE_EVENT } from "../../lib/cloudSync";
import { loadNotes } from "../../lib/notesData";
import { collectUnifiedHighlights } from "../../lib/unifiedHighlights";

export default function PersonalViews(){
  const a=useApp(),router=useRouter();
  const [user,setUser]=useState(null),[notes,setNotes]=useState([]),[saved,setSaved]=useState([]),[ready,setReady]=useState(false);
  useEffect(()=>{
    let active=true;
    const update=()=>{setNotes(loadNotes());setSaved(collectUnifiedHighlights());};update();
    getCloudUser().then(value=>{if(active){setUser(value);setReady(true);}}).catch(()=>{if(active)setReady(true);});
    window.addEventListener(SYNC_COMPLETE_EVENT,update);return()=>{active=false;window.removeEventListener(SYNC_COMPLETE_EVENT,update);};
  },[]);
  if(a.screen==="highlights")return <><PageHeading title={<>Words to<br/>return to.</>} kicker="SAVED PASSAGES"/><div className="page-pad">{saved.length?saved.map(item=><Row key={item.id} icon={Bookmark} title={item.reference||item.title} sub={item.text||item.sourceLabel} onClick={()=>router.push(item.openHref)}/>):<Empty title="Keep a passage close">Your saved Scripture and book passages appear here.</Empty>}<Row title="Manage saved passages" onClick={()=>a.go("highlights",{view:"manage"})}/></div></>;
  const name=user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split("@")[0]||"Your study space";
  return <><PageHeading title={<>A place<br/>to grow.</>} kicker="YOUR STUDY SPACE"/><div className="page-pad">
    <div className="profile-name"><span className="avatar large-avatar"><UserRound size={28}/></span><h2>{name}</h2><span className="muted-copy">{!ready?"Loading account":user?"Your personal study notebook":"Sign in to keep your notes backed up"}</span></div>
    <div className="profile-stats"><div><strong>{notes.length}</strong><span>Notes</span></div><div><strong>{a.favorites.length}</strong><span>Favorites</span></div><div><strong>{saved.length}</strong><span>Saved</span></div></div>
    {!user&&ready&&<Action onClick={()=>router.push('/auth/login?next=%2Fprofile')}>Sign in</Action>}
    <Row icon={NotebookPen} title="Your notebook" onClick={()=>a.go("notes")}/><Row icon={Heart} title="Favorite books" onClick={()=>a.go("library")}/>
    <Row icon={Download} title="Export notes" onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(notes,null,2)],{type:"application/json"}));const link=document.createElement('a');link.href=url;link.download='tulip-notes.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}/>
    <Row icon={UserRound} title="Account and sync" sub="Profile, backup and sign out" onClick={()=>a.go("profile",{view:"account"})}/>
  </div></>;
}
