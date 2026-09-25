"use client";

import { useMemo, useState } from "react";
import { companies, deals, initialTasks } from "@/data/seed";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const money = (value) => currency.format(value);
const initials = (name) => name.split(" ").map((part) => part[0]).slice(0, 2).join("");
const percent = (value, total) => total ? `${((value / total) * 100).toFixed(1)}%` : "0%";
export const stageBarWidth = (stageValue, maxStageValue, minimum = 3) => {
  if (stageValue <= 0 || maxStageValue <= 0) return 0;
  return Math.min(100, Math.max(minimum, (stageValue / maxStageValue) * 100));
};
export const trendBarHeight = (monthValue, maxMonthValue, minimum = 8) => {
  if (monthValue <= 0 || maxMonthValue <= 0) return 0;
  return Math.min(100, Math.max(minimum, (monthValue / maxMonthValue) * 100));
};

function inRange(dateValue, range) {
  if (range === "all") return true;
  const date = new Date(`${dateValue}T12:00:00`);
  const anchor = new Date(2026, 8, 25, 12);
  const days = { today: 0, week: 7, month: 30, quarter: 90, half: 183 }[range];
  if (range === "today") return date.toDateString() === anchor.toDateString();
  const start = new Date(anchor);
  start.setDate(start.getDate() - days);
  return date >= start && date <= new Date(2026, 11, 31);
}

function Tooltip({ title, rows }) {
  return <span className="command-tooltip" role="tooltip">
    <b>{title}</b>
    {rows.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}
  </span>;
}

function MetricCard({ label, value, summary, tooltip, onClick }) {
  return <button className="command-metric" onClick={onClick} aria-label={`${label}: ${value}. Open related records`}>
    <span><span>{label}</span><i aria-hidden="true">▥</i></span>
    <strong>{value}</strong>
    <small>{summary}</small>
    <em>View records <span aria-hidden="true">→</span></em>
    <Tooltip title={label} rows={tooltip}/>
  </button>;
}

function PipelineOverview({ rows, onNavigate }) {
  const total = rows.reduce((sum, deal) => sum + deal.amount, 0);
  const stages = [...new Set(deals.map((deal) => deal.stage))].map((stage) => {
    const stageDeals = rows.filter((deal) => deal.stage === stage);
    return { stage, rows: stageDeals, value: stageDeals.reduce((sum, deal) => sum + deal.amount, 0) };
  });
  const maxStageValue = Math.max(...stages.map((stage) => stage.value), 0);

  return <section className="command-panel command-pipeline" aria-labelledby="pipeline-heading">
    <header><div><h2 id="pipeline-heading">Sales pipeline</h2><p>Deal volume and value by source stage</p></div><button onClick={() => onNavigate("deals", "")}>View all</button></header>
    <div className="command-pipeline-list">
      {stages.map(({ stage, rows: stageDeals, value }) => { const barWidth = stageBarWidth(value, maxStageValue); return <button
        key={stage}
        className="command-stage"
        onClick={() => onNavigate("deals", stage)}
        aria-label={`${stage}, ${stageDeals.length} deals, ${money(value)} pipeline value`}
      >
        <span className="stage-name"><b>{stage}</b><small>{stageDeals.length} deals</small></span>
        <span className="stage-track" role="meter" aria-label={`${stage} relative pipeline value`} aria-valuemin="0" aria-valuemax={maxStageValue} aria-valuenow={value}><i style={{ width: `${barWidth}%` }} data-width={barWidth.toFixed(2)}/></span>
        <strong>{money(value)}</strong>
        <Tooltip title={stage} rows={[
          ["Deals", stageDeals.length],
          ["Pipeline value", money(value)],
          ["Share of pipeline", percent(value, total)],
          ["Average deal", money(stageDeals.length ? value / stageDeals.length : 0)],
        ]}/>
      </button>})}
    </div>
  </section>;
}

function PipelineTrend({ rows, onNavigate }) {
  const months = useMemo(() => {
    const grouped = new Map();
    rows.forEach((deal) => {
      const date = new Date(`${deal.close}T12:00:00`);
      const key = deal.close.slice(0, 7);
      const item = grouped.get(key) || { key, label: date.toLocaleString("en-US", { month: "short" }), full: date.toLocaleString("en-US", { month: "long", year: "numeric" }), value: 0, count: 0 };
      item.value += deal.amount;
      item.count += 1;
      grouped.set(key, item);
    });
    return [...grouped.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-6);
  }, [rows]);
  const max = Math.max(...months.map((month) => month.value), 1);

  return <section className="command-panel command-trend" aria-labelledby="trend-heading">
    <header><div><h2 id="trend-heading">Pipeline trend</h2><p>Value by expected close month</p></div><span>{months.length} months</span></header>
    <div className="command-chart" aria-label="Pipeline value by month">
      {months.map((month) => { const barHeight = trendBarHeight(month.value, max); return <button key={month.key} onClick={() => onNavigate("deals", month.key)} aria-label={`${month.full}, ${money(month.value)}, ${month.count} deals`}>
        <span className="trend-bar-area"><span className="trend-value">{money(month.value)}</span><i style={{ height: `${barHeight}%` }} data-height={barHeight.toFixed(2)}/></span>
        <small>{month.label}</small>
        <Tooltip title={month.full} rows={[["Pipeline", money(month.value)], ["Deals", month.count], ["Average deal", money(month.count ? month.value / month.count : 0)]]}/>
      </button>})}
    </div>
  </section>;
}

function ActivityFeed({ tasks, onNavigate, onSelect }) {
  return <section className="command-panel command-activity" aria-labelledby="activity-heading">
    <header><div><h2 id="activity-heading">Recent activity</h2><p>Latest connected tasks and customer touchpoints</p></div><button onClick={() => onNavigate("activity", "")}>View all</button></header>
    <div>
      {tasks.slice(0, 5).map((task) => {
        const deal = deals.find((item) => item.id === task.dealId);
        const company = companies.find((item) => item.id === deal?.companyId);
        return <button key={task.id} className="command-activity-row" onClick={() => task.status === "Completed" && company ? onSelect({ ...company, type: "Company" }) : onNavigate("tasks", task.title)}>
          <b aria-hidden="true">{task.type === "Email" ? "E" : "C"}</b>
          <span><strong>{task.title}</strong><small>{company?.name || "Unlinked company"} · {task.status}</small></span>
          <time>{new Date(`${task.due}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time>
          <i aria-hidden="true">→</i>
        </button>;
      })}
    </div>
  </section>;
}

function TopCompanies({ rows, onSelect }) {
  const total = rows.reduce((sum, deal) => sum + deal.amount, 0);
  const ranked = companies.map((company) => {
    const companyDeals = rows.filter((deal) => deal.companyId === company.id);
    return { ...company, value: companyDeals.reduce((sum, deal) => sum + deal.amount, 0), count: companyDeals.length };
  }).filter((company) => company.count).sort((a, b) => b.value - a.value).slice(0, 5);
  const max = Math.max(...ranked.map((company) => company.value), 1);

  return <section className="command-panel command-companies" aria-labelledby="companies-heading">
    <header><div><h2 id="companies-heading">Top companies</h2><p>Ranked by connected pipeline</p></div></header>
    <div>{ranked.map((company, index) => <button key={company.id} onClick={() => onSelect({ ...company, type: "Company" })} aria-label={`Open ${company.name}, ${company.count} deals, ${money(company.value)} pipeline`}>
      <i>{index + 1}</i><b>{initials(company.name)}</b>
      <span><strong>{company.name}</strong><small>{company.industry} · {company.count} deals</small><em><u style={{ width: `${(company.value / max) * 100}%` }}/></em></span>
      <strong>{money(company.value)}</strong><mark aria-hidden="true">→</mark>
      <Tooltip title={company.name} rows={[["Active deals", company.count], ["Pipeline", money(company.value)], ["Share", percent(company.value, total)]]}/>
    </button>)}</div>
  </section>;
}

export default function OverviewCommandCenter({ user, tasks, companiesData = companies, onNavigate, onSelect }) {
  const [range, setRange] = useState("all");
  const filteredDeals = useMemo(() => deals.filter((deal) => inRange(deal.close, range)), [range]);
  const filteredTasks = useMemo(() => tasks.filter((task) => inRange(task.due, range)), [tasks, range]);
  const pipeline = filteredDeals.reduce((sum, deal) => sum + deal.amount, 0);
  const contractStage = [...new Set(deals.map((deal) => deal.stage))].find((stage) => stage.toLowerCase().includes("contract"));
  const contracted = filteredDeals.filter((deal) => deal.stage === contractStage);
  const contractedValue = contracted.reduce((sum, deal) => sum + deal.amount, 0);
  const openTasks = filteredTasks.filter((task) => task.status !== "Completed");
  const dueToday = openTasks.filter((task) => task.due === "2026-09-25").length;
  const overdue = openTasks.filter((task) => task.due < "2026-09-25").length;

  return <div className="command-center">
    <header className="command-hero">
      <div><h1>Good morning, {user.name.split(" ")[0]} ✦</h1><p>Here’s what needs attention across your customer relationships.</p></div>
      <label><span>Date range</span><select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Dashboard date range"><option value="today">Today</option><option value="week">This week</option><option value="month">Last 30 days</option><option value="quarter">Last 3 months</option><option value="half">Last 6 months</option><option value="all">All time</option></select></label>
    </header>

    <div className="command-metrics">
      <MetricCard label="Total pipeline" value={money(pipeline)} summary={`${filteredDeals.length} active deals`} onClick={() => onNavigate("deals", "")} tooltip={[["What it represents", "Value of active deals"], ["Active deals", filteredDeals.length], ["Average deal", money(filteredDeals.length ? pipeline / filteredDeals.length : 0)]]}/>
      <MetricCard label={contractStage || "Contract stage"} value={money(contractedValue)} summary={`${contracted.length} deals · ${percent(contractedValue, pipeline)}`} onClick={() => onNavigate("deals", contractStage || "")} tooltip={[["Deals", contracted.length], ["Share of pipeline", percent(contractedValue, pipeline)], ["Average deal", money(contracted.length ? contractedValue / contracted.length : 0)]]}/>
      <MetricCard label="Active deals" value={filteredDeals.length} summary={`${companiesData.length} connected companies`} onClick={() => onNavigate("deals", "")} tooltip={[["Pipeline value", money(pipeline)], ["Average deal", money(filteredDeals.length ? pipeline / filteredDeals.length : 0)], ["Companies", companiesData.length]]}/>
      <MetricCard label="Open tasks" value={openTasks.length} summary={`${filteredTasks.length - openTasks.length} completed`} onClick={() => onNavigate("tasks", "In Progress")} tooltip={[["Due today", dueToday], ["Overdue", overdue], ["Upcoming", Math.max(0, openTasks.length - dueToday - overdue)]]}/>
    </div>

    {filteredDeals.length || filteredTasks.length ? <div className="command-grid">
      <PipelineOverview rows={filteredDeals} onNavigate={onNavigate}/>
      <PipelineTrend rows={filteredDeals} onNavigate={onNavigate}/>
      <ActivityFeed tasks={filteredTasks} onNavigate={onNavigate} onSelect={onSelect}/>
      <TopCompanies rows={filteredDeals} onSelect={onSelect}/>
    </div> : <div className="command-empty"><strong>No records in this range</strong><p>Choose a wider date range to restore pipeline and activity data.</p><button onClick={() => setRange("all")}>Show all time</button></div>}
  </div>;
}
