"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { seed } from "@/data/seed";
import PipelineUniverse from "@/components/analytics/PipelineUniverse";
import AnalyticsDetailPanel from "@/components/analytics/AnalyticsDetailPanel";
import { ActivityAttention, AnalyticsHeader, AnalyticsSummary, LargestOpportunities, TopAccounts } from "@/components/analytics/AnalyticsSections";
import { getDealsByStage, getRevenueByMonth, getTopCompaniesByPipeline, getTotalPipeline } from "@/lib/calculations";

const stages = ["Appointment scheduled", "Qualified to buy", "Contract sent"];
const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const compact = value => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
const monthLabel = month => new Date(`${month}-01T12:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" });

function makeModel(tasks) {
  const stageDeals = getDealsByStage();
  const pipeline = getTotalPipeline();
  const accounts = getTopCompaniesByPipeline().map(company => {
    const companyDeals = seed.deals.filter(deal => deal.companyId === company.id);
    const companyContacts = seed.contacts.filter(contact => contact.companyId === company.id);
    const contactIds = new Set(companyContacts.map(contact => contact.id));
    const dealIds = new Set(companyDeals.map(deal => deal.id));
    const companyNotes = seed.notes.filter(note => note.companyId === company.id);
    const companyEmails = seed.emails.filter(email => contactIds.has(email.contactId));
    const companyCalls = seed.calls.filter(call => contactIds.has(call.contactId));
    const recentActivity = [
      ...companyNotes.map(note => ({ id: note.id, title: "Note added", description: note.body, date: note.date })),
      ...companyEmails.map(email => ({ id: email.id, title: "Email", description: email.subject, date: email.date })),
      ...companyCalls.map(call => ({ id: call.id, title: "Call", description: call.title, date: call.date })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    const activity = companyNotes.length + companyEmails.length + companyCalls.length
      + tasks.filter(task => dealIds.has(task.dealId)).length;
    return { ...company, deals: companyDeals, contacts: companyContacts.length, activity, recentActivity };
  });
  const stageRows = stages.map((stage, index) => {
    const rows = stageDeals[stage] || [];
    const value = rows.reduce((sum, deal) => sum + deal.amount, 0);
    return { stage, index, deals: rows, value, share: pipeline ? value / pipeline : 0 };
  });
  const closing = getRevenueByMonth().map(([month, value]) => ({ month, value, count: seed.deals.filter(deal => deal.close.startsWith(month)).length }));
  return { pipeline, accounts, stageRows, closing, biggest: [...seed.deals].sort((a, b) => b.amount - a.amount).slice(0, 5), open: tasks.filter(task => task.status !== "Completed").length, complete: tasks.filter(task => task.status === "Completed").length };
}

function Funnel({ model, select }) {
  const max = Math.max(...model.stageRows.map(row => row.value), 1);
  return <div className="au-funnel" aria-label="Distribution of current deals by stage"><p className="au-view-intro">A distribution of current opportunities, not a conversion funnel. Each dot is a deal.</p>{model.stageRows.map(row => <section className="au-funnel-row" key={row.stage}><div className="au-funnel-heading"><span className="au-stage-index">0{row.index + 1}</span><div><h3>{row.stage}</h3><small>{row.deals.length} deals · {(row.share * 100).toFixed(1)}% of pipeline</small></div><strong>{money(row.value)}</strong></div><div className="au-funnel-track"><div style={{ width: `${row.value / max * 100}%` }} />{row.deals.map(deal => <button key={deal.id} title={`${deal.name} · ${money(deal.amount)}`} aria-label={`${deal.name}, ${money(deal.amount)}, ${deal.company}`} onClick={() => select({ type: "deal", id: deal.id })} />)}</div></section>)}</div>;
}

function Trend({ model }) {
  const [metric, setMetric] = useState("value");
  const values = model.closing.map(row => row[metric]);
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => ({ x: 68 + index * (864 / Math.max(values.length - 1, 1)), y: 345 - value / max * 270 }));
  const line = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const area = `${line} L ${points.at(-1)?.x || 68} 345 L 68 345 Z`;
  return <div className="au-trend"><div className="au-trend-header"><p className="au-view-intro">When are current opportunities expected to close?</p><div className="au-metric-switch" aria-label="Trend metric"><button className={metric === "value" ? "active" : ""} onClick={() => setMetric("value")}>Pipeline value</button><button className={metric === "count" ? "active" : ""} onClick={() => setMetric("count")}>Number of deals</button></div></div><svg viewBox="0 0 1000 405" role="img" aria-label={`Pipeline by closing month, showing ${metric === "value" ? "pipeline value" : "deal count"}`}><line className="au-gridline" x1="68" x2="932" y1="345" y2="345" /><line className="au-gridline" x1="68" x2="932" y1="210" y2="210" /><line className="au-gridline" x1="68" x2="932" y1="75" y2="75" /><text className="au-axis" x="58" y="79" textAnchor="end">{metric === "value" ? compact(max) : max}</text><text className="au-axis" x="58" y="349" textAnchor="end">0</text><path className="au-area" d={area} /><path className="au-line" d={line} />{points.map((point, index) => <g key={model.closing[index].month}><circle className="au-trend-dot" cx={point.x} cy={point.y} r="7" /><text className="au-trend-value" x={point.x} y={point.y - 19} textAnchor="middle">{metric === "value" ? money(values[index]) : `${values[index]} deals`}</text><text className="au-axis" x={point.x} y="382" textAnchor="middle">{monthLabel(model.closing[index].month)}</text></g>)}</svg><div className="au-month-list">{model.closing.map(row => <div key={row.month}><span>{monthLabel(row.month)}</span><strong>{metric === "value" ? money(row.value) : `${row.count} deals`}</strong></div>)}</div></div>;
}

export default function AnalyticsWorkspace({ tasks, onViewCompany, onViewDeal }) {
  const model = useMemo(() => makeModel(tasks), [tasks]);
  const [view, setView] = useState("universe");
  const [focused, setFocused] = useState(null);
  const [selection, setSelection] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [animateUniverse, setAnimateUniverse] = useState(true);
  const returnFocusRef = useRef(null);
  const tabRefs = useRef({});

  const closeSelection = () => {
    setSelection(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };
  useEffect(() => {
    if (!selection) return;
    const onKeyDown = event => { if (event.key === "Escape") closeSelection(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selection]);

  const select = item => {
    if (!selection) returnFocusRef.current = document.activeElement;
    setSelection(item);
    setFocused(null);
  };
  const selectFromList = item => {
    setView("universe");
    select(item);
  };
  const changeView = next => {
    if (view === "universe" && next !== "universe") setAnimateUniverse(false);
    setView(next);
    setFocused(null);
    setSelectedStage(null);
  };
  const onTabKeyDown = (event, current) => {
    const views = ["universe", "funnel", "trend"];
    const index = views.indexOf(current);
    const next = event.key === "ArrowRight" ? views[(index + 1) % views.length]
      : event.key === "ArrowLeft" ? views[(index + views.length - 1) % views.length]
      : event.key === "Home" ? views[0] : event.key === "End" ? views.at(-1) : null;
    if (!next) return;
    event.preventDefault();
    changeView(next);
    tabRefs.current[next]?.focus();
  };
  const toggleStage = stage => {
    setSelectedStage(current => current === stage ? null : stage);
    setFocused(null);
  };

  return <div className="analytics-workspace">
    <AnalyticsHeader />
    <AnalyticsSummary model={model} taskCount={tasks.length} />
    <section className="au-hero" aria-labelledby="au-universe-title">
      <div className="au-hero-heading">
        <div><span className="au-eyebrow">01 / THE BIG PICTURE</span><h2 id="au-universe-title">Pipeline Universe</h2><p>Every company, opportunity, and stage in one connected view.</p></div>
        <div className="au-hero-controls">
          {view === "universe" && selectedStage && <button className="au-clear-stage" onClick={() => setSelectedStage(null)} aria-label={`Clear ${selectedStage} stage highlight`}>Highlighting {selectedStage} <span aria-hidden="true">?</span></button>}
          <div className="au-view-tabs" role="tablist" aria-label="Pipeline visualization">
            {["universe", "funnel", "trend"].map(item => <button key={item} ref={element => { tabRefs.current[item] = element; }} role="tab" id={`au-tab-${item}`} aria-controls="au-view-panel" aria-selected={view === item} tabIndex={view === item ? 0 : -1} className={view === item ? "active" : ""} onClick={() => changeView(item)} onKeyDown={event => onTabKeyDown(event, item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
          </div>
        </div>
      </div>
      <div key={view} id="au-view-panel" className="au-view-content" role="tabpanel" aria-labelledby={`au-tab-${view}`}>
        {view === "universe" ? <PipelineUniverse model={model} focused={focused} selection={selection} selectedStage={selectedStage} setFocused={setFocused} onSelect={select} onToggleStage={toggleStage} animateEntrance={animateUniverse} />
          : view === "funnel" ? <Funnel model={model} select={select} /> : <Trend model={model} />}
      </div>
    </section>
    <div className="au-section-grid">
      <TopAccounts model={model} focused={focused} selection={selection} onFocus={setFocused} onSelect={selectFromList} />
      <LargestOpportunities model={model} focused={focused} selection={selection} onFocus={setFocused} onSelect={selectFromList} />
    </div>
    <ActivityAttention model={model} tasks={tasks} />
    {selection && <AnalyticsDetailPanel selection={selection} model={model} onClose={closeSelection} onViewCompany={onViewCompany} onViewDeal={onViewDeal} />}
  </div>;
}
