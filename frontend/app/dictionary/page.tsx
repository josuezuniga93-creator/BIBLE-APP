"use client";
import { Suspense } from "react";
import StudyScreen from "../components/study/StudyScreen";
export default function DictionaryPage() {
  return <Suspense><StudyScreen screen="dictionary" params={{}} /></Suspense>;
}
