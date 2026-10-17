"use client";
import React, {useState,useEffect} from "react";
import {Check,ChevronLeft,ChevronRight,ArrowUpRight} from "lucide-react";
import {useApp,PageHeading,IconButton,Row} from "./Views";
import {generateSchedule} from "../../lib/biblePlansData";
function usePlanChecks(){
 const [checks,setChecks]=useState({});
 useEffect(()=>{try{setChecks(JSON.parse(localStorage.getItem("tulip_plans_completion_v1")||"{}"));}catch{}},[]);
 return [checks,(next)=>{localStorage.setItem("tulip_plans_completion_v1",JSON.stringify(next));setChecks(next);}];
}
export default function Plans() {
  const a = useApp(),
    [selected, setSelected] = useState(a.catalog.plans[0].id),
    [checks, setChecks] = usePlanChecks(),
    [day, setDay] = useState(1);
  const plan =
    a.catalog.plans.find((p) => p.id === selected) || a.catalog.plans[0];
  const readings = Array.from(generateSchedule(plan, new Date(2024,0,1)).values())[day-1]?.readings || [];
  return (
    <>
      <PageHeading title={<>A daily<br/>commitment.</>} kicker="READING PLANS" />
      <div className="page-pad">
        <label className="select-label">
          YOUR PLAN
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setDay(1);
            }}
          >
            {a.catalog.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div className="plan-overview">
          <span className="eyebrow">{plan.totalDays} DAYS</span>
          <h2>{plan.name}</h2>
          <p>{plan.description}</p>
        </div>
        <div className="plan-day-control">
          <IconButton
            icon={ChevronLeft}
            label="Previous plan day"
            disabled={day === 1}
            onClick={() => setDay(day - 1)}
          />
          <div>
            <small>YOUR NEXT READING</small>
            <strong>
              Day <span key={day}>{String(day).padStart(2, "0")}</span>
            </strong>
          </div>
          <IconButton
            icon={ChevronRight}
            label="Next plan day"
            disabled={day >= plan.totalDays}
            onClick={() => setDay(day + 1)}
          />
        </div>
        <div className="plan-readings">
          {readings.map((r) => {
            const key =
              selected + ":" + day + ":" + r.bookName + ":" + r.chapter;
            return (
              <div className="plan-reading" key={key}>
                <button
                  className={"check-control " + (checks[key] ? "checked" : "")}
                  aria-label={
                    "Mark " + r.bookName + " " + r.chapter + " complete"
                  }
                  aria-pressed={!!checks[key]}
                  onClick={() => setChecks({ ...checks, [key]: !checks[key] })}
                >
                  {checks[key] && <Check size={15} />}
                </button>
                <button
                  onClick={() =>
                    a.go("scripture", { book: r.bookNum, chapter: r.chapter })
                  }
                >
                  <strong>
                    {r.bookName} {r.chapter}
                  </strong>
                  <span>Read the chapter</span>
                </button>
                <ArrowUpRight size={18} />
              </div>
            );
          })}
        </div>
        <div className="plan-days">
          {Array.from({ length: plan.totalDays }, (_, i) => (
            <button
              className={day === i + 1 ? "active" : ""}
              onClick={() => setDay(i + 1)}
              key={i}
            >
              <span>DAY</span>
              <strong>{String(i + 1).padStart(2, "0")}</strong>
              <i />
            </button>
          ))}
        </div>
        <Row title="Manage reading plans" sub="Start dates and active plans" onClick={()=>a.go("plans",{view:"manage"})}/>
      </div>
    </>
  );
}
