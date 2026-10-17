"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown, Check, CheckCheck, ArrowRight, Play } from "lucide-react";
import StudyScreen from "./StudyScreen";
import { PageHeading, IconButton, Action, Loading, ErrorState, useResource, useApp } from "./Views";
import Markdown from "react-markdown";
import { DEVOTIONAL_SECTION_IDS, getDevotionalSectionProgress, markDevotionalSection } from "../../lib/devotionalProgress";
import { getHymnLyrics } from "../../lib/hymnLyrics";
import { useRouter } from "next/navigation";
import { parsePassageInput } from "../../lib/passageParser";
import { fetchChapter } from "../../lib/api";

export default function DailyDevotional(){return <StudyScreen screen="devotional"><DailyContent/></StudyScreen>;}

function DailyContent() {
  const a=useApp();
  const router = useRouter();
  const [day, setDay] = useState(0), [step, setStep] = useState(0), [timer, setTimer] = useState(null);
  const [completed, setCompleted] = useState([]), [prayer,setPrayer]=useState("");
  useEffect(()=>{const selected=Number(new URLSearchParams(window.location.search).get("step"));if(Number.isInteger(selected)&&selected>=0&&selected<4)setStep(selected);},[]);
  const date = new Date(); date.setDate(date.getDate() + day);
  const dateKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const dev = useResource(`/api/devotional?date=${dateKey}`);
  const entry = dev.data;
  const [passage, setPassage] = useState("");
  useEffect(() => {
    setPassage("");
    const reference = entry && parsePassageInput(entry.scripture.reference);
    if (!reference) return;
    let active = true;
    fetchChapter(reference.bookNum, reference.chapter, entry.scripture.translation.toLowerCase()).then(data => {
      const verses = data.verses.filter(v => !reference.verseStart || v.verse >= reference.verseStart && v.verse <= (reference.verseEnd || reference.verseStart));
      if (active) setPassage(verses.map(v=>`${v.verse} ${v.text}`).join(" "));
    }).catch(()=>{});
    return()=>{active=false;};
  }, [entry]);
  const hymn = entry ? getHymnLyrics(entry.hymn.title) : null;
  useEffect(() => { setCompleted(getDevotionalSectionProgress(dateKey).completedSections); }, [dateKey]);
  useEffect(() => { if(timer === null || timer <= 0) return; const id=setTimeout(()=>setTimer(timer-1),1000);return()=>clearTimeout(id); },[timer]);
  const complete = () => { markDevotionalSection(dateKey,DEVOTIONAL_SECTION_IDS[step]);setCompleted(getDevotionalSectionProgress(dateKey).completedSections);if(step<3)setStep(step+1); };
  useEffect(()=>{try{setPrayer(JSON.parse(localStorage.getItem("tulip-prayer-journal-v1")||"{}")[dateKey]||"");}catch{}},[dateKey]);
  const savePrayer=text=>{setPrayer(text);try{const entries=JSON.parse(localStorage.getItem("tulip-prayer-journal-v1")||"{}");entries[dateKey]=text;localStorage.setItem("tulip-prayer-journal-v1",JSON.stringify(entries));}catch{}};
  return <>
    <PageHeading back={false} kicker="DAILY DEVOTIONAL" action={<IconButton icon={CalendarDays} label="Choose devotional date" onClick={()=>a.open("date-picker",{day,onChange:setDay})}/>}/>
    <div className="page-pad devotional-heading">
      <div className="date-wheel">
        <IconButton icon={ChevronLeft} label="Previous day" onClick={()=>setDay(day-1)}/>
        <button onClick={()=>a.open("date-picker",{day,onChange:setDay})}>{new Intl.DateTimeFormat("en",{weekday:"long",month:"short",day:"numeric"}).format(date)}<ChevronDown size={13}/></button>
        <IconButton icon={ChevronRight} label="Next day" onClick={()=>setDay(day+1)}/>
      </div>
      {dev.loading ? <Loading/> : dev.error ? <ErrorState message={dev.error} retry={dev.retry}/> : entry && <>
        <p className="eyebrow">EXPOSITORY THOUGHTS / J.C. RYLE</p>
        <h1>{entry.theme}</h1>
        <div className="devotional-meta"><span>{entry.scripture.reference}</span><span>{entry.displayDate}</span></div>
        <div className="step-timeline" style={{"--step":step}}>{["Read","Reflect","Sing","Pray"].map((label,i)=><button aria-current={i===step?"step":undefined} key={label} onClick={()=>setStep(i)}><span>{completed.includes(DEVOTIONAL_SECTION_IDS[i])?<Check size={12}/>:String(i+1).padStart(2,"0")}</span><strong>{label}</strong></button>)}<i/></div>
        <div className="devotional-stage" key={`${dateKey}-${step}`}>
          {step===0 ? <><p className="eyebrow">THE PASSAGE</p><blockquote className="reading-serif">{passage || entry.scripture.text}</blockquote><p className="source-line">{entry.scripture.reference} / {entry.scripture.translation}</p><Action secondary onClick={()=>{const p=parsePassageInput(entry.scripture.reference);if(p)router.push(`/lexicon?book=${p.bookNum}&chapter=${p.chapter}`);}}>Open in Scripture</Action></>
          : step===1 ? <><p className="eyebrow">REFLECTION</p><div className="prose"><Markdown>{entry.devotional}</Markdown></div>{entry.fullDevotional&&<details className="prose"><summary>Full reading</summary><Markdown>{entry.fullDevotional}</Markdown></details>}</>
          : step===2 ? <><p className="eyebrow">HYMN / {entry.hymn.author}</p><h2 className="reading-serif hymn-title">{entry.hymn.title}</h2><div className="prose hymn">{(hymn?.verses || [entry.hymn.firstLine || "Lyrics are not available for this hymn."]).map((verse,i)=><p key={i} style={{whiteSpace:"pre-line"}}>{verse}</p>)}</div><span className="source-line">{entry.hymn.year} / Public domain</span></>
          : <><p className="eyebrow">A MOMENT OF PRAYER</p><div className={"prayer-timer "+(timer>0?"running":"")}><button className="prayer-ring" aria-label={timer===null?"Begin one-minute prayer":"Pause prayer timer"} onClick={()=>setTimer(timer===null?60:null)}><span>{timer===null?<Play size={24} strokeWidth={1.3}/>:timer===0?<Check size={26}/>:`${String(Math.floor(timer/60)).padStart(2,"0")}:${String(timer%60).padStart(2,"0")}`}</span></button></div><textarea className="prayer-input" aria-label="Prayer journal" placeholder="What is on your heart?" value={prayer} onChange={e=>savePrayer(e.target.value)}/></>}
        </div>
        <Action icon={completed.includes(DEVOTIONAL_SECTION_IDS[step])?CheckCheck:ArrowRight} onClick={complete}>{completed.includes(DEVOTIONAL_SECTION_IDS[step])?"Completed":step===3?"Complete devotional":"Continue"}</Action>
      </>}
    </div>
  </>;
}
