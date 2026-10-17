"use client";

import { useState } from "react";
import { CHURCH_HISTORY } from "../../lib/churchHistory";
import { PageHeading, Row, Sheet } from "./Views";

export default function HistoryView(){
  const [story,setStory]=useState(null);
  return <><PageHeading title="Church history" kicker="THROUGH THE YEARS"/><div className="page-pad">{CHURCH_HISTORY.map(item=><Row key={item.id} title={item.title} sub={item.year+" / "+item.verseReference} onClick={()=>setStory(item)}/>)}</div>{story&&<Sheet title={story.title} onClose={()=>setStory(null)}><div className="prose"><p className="eyebrow">{story.year} / {story.verseReference}</p>{story.fullStory.split(/\n\n/).map((p,i)=><p key={i}>{p}</p>)}<blockquote>{story.keyTakeaway}</blockquote></div></Sheet>}</>;
}
