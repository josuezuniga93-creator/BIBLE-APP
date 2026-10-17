"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookOpen, Download, Heart, NotebookPen, UserRound, Trash2, ShieldCheck, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeading, Row, Empty, Action, Sheet, useApp } from "./Views";
import { getCloudUser, SYNC_COMPLETE_EVENT } from "../../lib/cloudSync";
import { loadNotes } from "../../lib/notesData";
import { collectUnifiedHighlights, deleteUnifiedHighlight } from "../../lib/unifiedHighlights";
import {getBookmarks,removeBookmark} from "../../lib/bookmarks";
import {parsePassageInput} from "../../lib/passageParser";
import { BADGE_DEFINITIONS, getEarnedBadgeDefinitions } from "../../lib/badges";
import { useLanguage } from "../../lib/useLanguage";

export default function PersonalViews(){
  const a=useApp(),router=useRouter();
  const {lang}=useLanguage();
  const [user,setUser]=useState(null),[notes,setNotes]=useState([]),[saved,setSaved]=useState([]),[ready,setReady]=useState(false);
  const [selected,setSelected]=useState(null);
  const [showBadges,setShowBadges]=useState(false),[earnedBadges,setEarnedBadges]=useState([]);
  useEffect(()=>{
    let active=true;
    const update=()=>{setNotes(loadNotes());setEarnedBadges(getEarnedBadgeDefinitions());setSaved([...collectUnifiedHighlights(),...getBookmarks().map(b=>{const p=parsePassageInput(b.ref,43);return {...b,id:"bookmark-"+b.id,bookmarkId:b.id,reference:b.ref,openHref:p?`/lexicon?book=${p.bookNum}&chapter=${p.chapter}${p.verseStart?"&select="+p.verseStart:""}`:"/lexicon"};})]);};update();
    getCloudUser().then(value=>{if(active){setUser(value);setReady(true);}}).catch(()=>{if(active)setReady(true);});
    window.addEventListener(SYNC_COMPLETE_EVENT,update);window.addEventListener("tulip-badges-change",update);return()=>{active=false;window.removeEventListener(SYNC_COMPLETE_EVENT,update);window.removeEventListener("tulip-badges-change",update);};
  },[]);
  if(a.screen==="highlights")return <><PageHeading title={<>Words to<br/>return to.</>} kicker="SAVED PASSAGES"/><div className="page-pad">{saved.length?saved.map(item=><Row key={item.id} icon={Bookmark} title={item.reference||item.title} sub="Saved passage" onClick={()=>a.params.view?setSelected(item):router.push(item.openHref)}/>):<Empty title="Keep a passage close">Your saved Scripture and book passages appear here.</Empty>}</div>{selected&&<Sheet title={selected.reference||selected.title} onClose={()=>setSelected(null)}><p className="body-copy">{selected.text}</p><Row icon={BookOpen} title="Open passage" onClick={()=>router.push(selected.openHref)}/><Action secondary icon={Trash2} onClick={()=>{if(selected.bookmarkId)removeBookmark(selected.bookmarkId);else deleteUnifiedHighlight(selected);setSaved(saved.filter(s=>s.id!==selected.id));setSelected(null);}}>Remove saved passage</Action></Sheet>}</>;
  const name=user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split("@")[0]||"Your study space";
  return <><PageHeading title={<>A place<br/>to grow.</>} kicker="YOUR STUDY SPACE"/><div className="page-pad">
    <div className="profile-name"><span className="avatar large-avatar"><UserRound size={28}/></span><h2>{name}</h2><span className="muted-copy">{!ready?"Loading account":user?"Your personal study notebook":"Sign in to keep your notes backed up"}</span></div>
    <div className="profile-stats"><div><strong>{notes.length}</strong><span>Notes</span></div><div><strong>{a.favorites.length}</strong><span>Favorites</span></div><div><strong>{saved.length}</strong><span>Saved</span></div></div>
    {!user&&ready&&<Action onClick={()=>router.push('/auth/login?next=%2Fprofile')}>Sign in</Action>}
    <Row icon={NotebookPen} title="Your notebook" onClick={()=>a.go("notes")}/><Row icon={Heart} title="Favorite books" onClick={()=>a.go("library")}/>
    <Row icon={ShieldCheck} title="Badges" sub={`${earnedBadges.length} of ${BADGE_DEFINITIONS.length} earned`} onClick={()=>setShowBadges(true)}/>
    <Row icon={Download} title="Export notes" onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(notes,null,2)],{type:"application/json"}));const link=document.createElement('a');link.href=url;link.download='tulip-notes.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}/>
    <Row icon={UserRound} title="Account and sync" sub="Profile, backup and sign out" onClick={()=>a.go("profile",{view:"account"})}/>
  </div>{showBadges&&<Sheet title="Your badges" full onClose={()=>setShowBadges(false)}><p className="body-copy">Quiet milestones from your reading, study, prayer, and devotional life.</p><div className="badge-list-neutral">{BADGE_DEFINITIONS.map(badge=>{const earned=earnedBadges.some(item=>item.id===badge.id);return <div className={"badge-row-neutral "+(earned?"earned":"locked")} key={badge.id}><span className="row-icon">{earned?<ShieldCheck size={21}/>:<LockKeyhole size={19}/>}</span><span><strong>{lang==="es"?badge.nameEs:badge.name}</strong><small>{lang==="es"?badge.reasonEs:badge.reason}</small></span><em>{earned?(lang==="es"?"Ganado":"Earned"):`${badge.threshold}`}</em></div>})}</div></Sheet>}</>;
}
