"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppContext, Home, LibraryPage, Detail, More, Sheet, Memory, Row, Notes, Tracker } from "./Views";
import { STATIC_BOOK_CATALOG } from "../../lib/bookCatalog";
import documentCatalog from "../../lib/studyDocumentCatalog.json";
import { BIBLE_BOOKS } from "../../lib/bibleBooks";
import { useTheme } from "../../lib/useTheme";
import { DEVOTIONAL_SECTION_IDS, getDevotionalSectionProgress } from "../../lib/devotionalProgress";
import { isFavorite, setFavorite } from "../../lib/favorites";
import { DICTIONARY_ENTRIES } from "../../lib/studyToolsData";
import AdditionalViews from "./AdditionalViews";
import Plans from "./Plans";
import PersonalViews from "./PersonalViews";
import HistoryView from "./HistoryView";
import { BIBLE_PLANS } from "../../lib/biblePlansData";

const catalog = { books: STATIC_BOOK_CATALOG.filter(b => !b.coming_soon), documents: documentCatalog, bibleBooks: BIBLE_BOOKS, dictionary: DICTIONARY_ENTRIES, plans: BIBLE_PLANS };
const destinations = { home: "/", scripture: "/lexicon", notes: "/notes", devotional: "/family-worship", more: "/more", library: "/library", documents: "/learn", tracker: "/bible-tracker", plans: "/bible-plans", kids: "/kids-books", churches: "/church-directory", history: "/timeline" };
const dateKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };

/** @param {{screen?: string, params?: Record<string, unknown>, onRead?: ((chapter: number) => void) | null, children?: React.ReactNode, notes?: any[], onNoteAction?: Function, readChapters?: Record<string, boolean>, markChapter?: Function}} props */
export default function StudyScreen({ screen = "home", params = {}, onRead = null, children = null, notes = [], onNoteAction, readChapters = {}, markChapter }) {
  const router = useRouter();
  const themeState = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [progress, setProgress] = useState({});
  const [steps, setSteps] = useState([false,false,false,false]);
  const [modal, setModal] = useState(null);
  const [motionRequested, setMotionRequested] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [toast, setToast] = useState("");
  const [resume, setResume] = useState({book:43,name:"John",chapter:15});
  useEffect(() => {
    const update = () => {
      try {const position=JSON.parse(localStorage.getItem("ryc-last-position")||"null");const book=catalog.bibleBooks.find(b=>b.name===position?.bookName);if(book)setResume({book:book.num,name:book.name,chapter:Math.max(1,Math.min(book.chapters,position.chapter||1))});}catch{}
      const sections = getDevotionalSectionProgress(dateKey()).completedSections;
      setSteps(DEVOTIONAL_SECTION_IDS.map(id => sections.includes(id)));
      setFavorites([...catalog.books.filter(b=>isFavorite("book",b.slug)).map(b=>"book:"+b.slug), ...catalog.documents.filter(d=>isFavorite("learn",d.id)).map(d=>"doc:"+d.id)]);
      const next = {};
      for (const b of catalog.books) { try { const p = JSON.parse(localStorage.getItem("axiom-progress-"+b.slug)||"null"); if(p?.chapter) next["book:"+b.slug]=p.chapter; } catch {} }
      for (const d of catalog.documents) { try { const p=JSON.parse(localStorage.getItem("axiom_learn_"+d.id)||"[]");if(p.length)next["doc:"+d.id]=p.length; } catch {} }
      setProgress(next);
    };
    update();
    setMotionRequested(localStorage.getItem("tulip-interface-motion") !== "off");
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change();media.addEventListener("change",change);
    window.addEventListener("storage",update);
    window.addEventListener("tulip-sync-complete",update);
    return()=>{media.removeEventListener("change",change);window.removeEventListener("storage",update);window.removeEventListener("tulip-sync-complete",update);};
  },[]);
  useEffect(()=>{document.documentElement.dataset.motion=motionRequested&&!reduced?"on":"off";},[motionRequested,reduced]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),2600);return()=>clearTimeout(t);},[toast]);
  const go=useCallback((target,values={})=>{
    if(target==="reader"&&onRead){onRead(Number(values.chapter)||1);return;}
    if(target==="detail"||target==="reader"){
      router.push(values.kind==="doc"?`/learn?doc=${encodeURIComponent(values.id)}`:`/library/${encodeURIComponent(values.id)}`);return;
    }
    const path=destinations[target]||"/"+target;
    const query=new URLSearchParams(Object.entries(values).map(([k,v])=>[k,String(v)])).toString();
    router.push(path+(query?"?"+query:""));
  },[router,onRead]);
  const toggleFavorite=(key)=>{
    const split=key.indexOf(":"), kind=key.slice(0,split),id=key.slice(split+1),next=!favorites.includes(key);
    try {setFavorite(kind==="doc"?"learn":"book",id,next);setFavorites(next?[...favorites,key]:favorites.filter(x=>x!==key));}catch{setToast("Unable to save this favorite. Please try again.");}
  };
  const context={screen,catalog,params,notes,resume,readChapters,markChapter,daySteps:steps,favorites,progress,go,toggleFavorite,theme:themeState.theme==="white-noir"?"light":"dark",setTheme:(value)=>themeState.setTheme(value==="light"?"white-noir":"gold-navy"),motion:motionRequested&&!reduced,motionRequested,setMotionRequested:(next)=>{setMotionRequested(next);localStorage.setItem("tulip-interface-motion",next?"on":"off");},open:(type,data={})=>{if(type.startsWith("note-")&&onNoteAction){onNoteAction(type,data);return;}setModal({type,data});},close:()=>setModal(null),notify:setToast};
  return <AppContext.Provider value={context}><div className="study-design" data-study-screen={screen}>
    {children || (screen==="home"?<Home/>:screen==="library"?<LibraryPage/>:screen==="documents"?<LibraryPage documents/>:screen==="detail"?<Detail/>:screen==="more"?<More/>:screen==="notes"?<Notes/>:screen==="tracker"?<Tracker/>:screen==="plans"?<Plans/>:screen==="history"?<HistoryView/>:["profile","highlights"].includes(screen)?<PersonalViews/>:<AdditionalViews/>)}
    {toast&&<div className="toast" role="status">{toast}</div>}
    {modal&&<Sheet title={modal.type==="memory"?"Keep the Word close":modal.type==="video"?modal.data.title:"Reading options"} onClose={()=>setModal(null)}>
      {modal.type==="memory"?<Memory/>:modal.type==="video"?<video controls autoPlay playsInline src={modal.data.src}/>:<><Row title="Read now" onClick={()=>{setModal(null);go("reader",{kind:modal.data.kind,id:modal.data.item.slug||modal.data.item.id,chapter:1});}}/><Row title="Favorites" onClick={()=>toggleFavorite(modal.data.kind+":"+(modal.data.item.slug||modal.data.item.id))}/></>}
    </Sheet>}
  </div></AppContext.Provider>;
}
