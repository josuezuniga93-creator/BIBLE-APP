"use client";

import {Suspense, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {BIBLE_BOOKS} from "../lib/bibleBooks";
import StudyScreen from "../components/study/StudyScreen";

function ScripturePage(){
  const query=useSearchParams();
  const [last,setLast]=useState({book:43,chapter:15});
  useEffect(()=>{try{const p=JSON.parse(localStorage.getItem("ryc-last-position")||"null");const book=BIBLE_BOOKS.find(b=>b.name===p?.bookName);if(book)setLast({book:book.num,chapter:Math.max(1,Math.min(book.chapters,Number(p.chapter)||1))});}catch{}},[]);
  const requested=query.get("book");
  const book=BIBLE_BOOKS.find(b=>b.num===Number(requested)||b.name.toLowerCase()===requested?.toLowerCase()) || BIBLE_BOOKS.find(b=>b.num===last.book)!;
  const chapter=Math.max(1,Math.min(book.chapters,Number(query.get("chapter"))||(requested?1:last.chapter)));
  return <StudyScreen screen="scripture" params={{book:book.num,chapter,select:query.get("select")||""}}/>;
}

export default function Page(){return <Suspense><ScripturePage/></Suspense>;}
