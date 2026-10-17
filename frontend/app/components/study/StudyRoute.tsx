"use client";

import { Suspense, type ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import StudyScreen from "./StudyScreen";

function Route({screen, legacy: Legacy}: {screen: string; legacy: ComponentType}) {
  const query = useSearchParams();
  return <StudyScreen screen={screen} params={Object.fromEntries(query.entries())}/>;
}

export default function StudyRoute(props: {screen: string; legacy: ComponentType}) {
  return <Suspense><Route {...props}/></Suspense>;
}
