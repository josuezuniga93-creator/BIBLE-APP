"use client";

import { Suspense, type ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import StudyScreen from "./StudyScreen";

function Route({screen, legacy: Legacy}: {screen: string; legacy: ComponentType}) {
  const query = useSearchParams();
  return query.get("view") ? <Legacy/> : <StudyScreen screen={screen}/>;
}

export default function StudyRoute(props: {screen: string; legacy: ComponentType}) {
  return <Suspense><Route {...props}/></Suspense>;
}
