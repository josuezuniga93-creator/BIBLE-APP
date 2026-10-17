"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, BookOpen, Check, CheckSquare, Italic, List } from "lucide-react";
import { Sheet, IconButton } from "./Views";
import { getNoteDisplayRef, type SermonNote } from "../../lib/notesData";
import { parsePassageInput } from "../../lib/passageParser";

export default function NoteComposer({initial,userId,onSave,onCancel,saveError}: {initial:SermonNote;userId:string;onSave:(note:SermonNote)=>Promise<boolean>;onCancel:()=>void;saveError?:string|null}) {
  const [title,setTitle]=useState(initial.title), [body,setBody]=useState(initial.notes);
  const [reference,setReference]=useState(initial.noteType==="general"?"":getNoteDisplayRef(initial));
  const [saving,setSaving]=useState(false), [status,setStatus]=useState("");
  const text=useRef<HTMLTextAreaElement>(null), referenceInput=useRef<HTMLInputElement>(null);
  const busy=useRef(false);
  useEffect(()=>{
    document.documentElement.setAttribute("data-app-reader-open","true");
    return()=>document.documentElement.removeAttribute("data-app-reader-open");
  },[]);
  useEffect(()=>{
    try {sessionStorage.setItem(`tulip-note-draft:${userId}`,JSON.stringify({...initial,title,notes:body,passage:reference}));}catch{}
  },[initial,title,body,reference,userId]);
  const save=async()=>{
    if(busy.current)return;
    const parsed=reference.trim()?parsePassageInput(reference,initial.bookNum):null;
    if(reference.trim()&&!parsed){setStatus("Enter a valid book and chapter, such as John 15.");return;}
    if(!title.trim()&&!body.trim()){setStatus("Add a title or a thought before saving.");return;}
    busy.current=true;setSaving(true);setStatus("Saving to your account");
    try {
      const note={...initial,title:title.trim()||"Untitled note",notes:body,updatedAt:new Date().toISOString(),noteType:parsed?"sermon" as const:"general" as const,passage:parsed?.displayRef||"",displayRef:parsed?.displayRef||"",...(parsed?{bookNum:parsed.bookNum,bookName:parsed.bookName,chapter:parsed.chapter,verseStart:parsed.verseStart,verseEnd:parsed.verseEnd}:{})};
      if(!await onSave(note))setStatus("Your draft is still here. Try saving again when connected.");
    } catch {setStatus("Your draft is still here. Please try again.");}
    finally{busy.current=false;setSaving(false);}
  };
  const insert=(marker:string)=>{
    const el=text.current;if(!el)return;
    const start=el.selectionStart,end=el.selectionEnd;
    setBody(body.slice(0,start)+marker+body.slice(start,end)+marker+body.slice(end));
    requestAnimationFrame(()=>{el.focus();el.setSelectionRange(start+marker.length,end+marker.length);});
  };
  return <div className="study-design"><Sheet title="Your notebook" full onClose={()=>{if(!saving)onCancel();}}><div className="note-editor">
    <div className="editor-meta"><span>{new Intl.DateTimeFormat("en",{month:"long",day:"numeric",year:"numeric"}).format(new Date())}</span><button className="save-command" disabled={saving} onClick={save}>{saving?<span className="save-spinner"/>:<Check size={17}/>}<span>{saving?"Saving":"Save note"}</span></button></div>
    <input className="note-title-input" aria-label="Note title" placeholder="An untitled thought" value={title} onChange={e=>setTitle(e.target.value)} autoFocus/>
    <label className="reference-input"><BookOpen size={15}/><input ref={referenceInput} aria-label="Scripture reference" placeholder="Link a passage, e.g. John 15" value={reference} onChange={e=>setReference(e.target.value)}/></label>
    <textarea ref={text} className="note-body-input" aria-label="Note content" placeholder="Let your thoughts take shape..." value={body} onChange={e=>setBody(e.target.value)}/>
    {(saveError||status)&&<p role="status" className="editor-status">{saveError||status}</p>}
    <div className="writing-tools"><IconButton icon={Bold} label="Bold" onClick={()=>insert("**")}/><IconButton icon={Italic} label="Italic" onClick={()=>insert("*")}/><IconButton icon={List} label="Bullet point" onClick={()=>setBody(body+"\n- ")}/><IconButton icon={CheckSquare} label="Checklist" onClick={()=>setBody(body+"\n- [ ] ")}/><IconButton icon={BookOpen} label="Add scripture reference" onClick={()=>referenceInput.current?.focus()}/></div>
  </div></Sheet></div>;
}
