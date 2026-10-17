"use client";

import type { ReactNode } from "react";
import StudyScreen from "./StudyScreen";
import { PageHeading } from "./Views";

export default function FeatureFrame({title,screen,children}: {title:string;screen:string;children:ReactNode}) {
  return <StudyScreen screen={screen}><PageHeading title={title} kicker="COMMUNITY"/><div className="page-pad">{children}</div></StudyScreen>;
}
