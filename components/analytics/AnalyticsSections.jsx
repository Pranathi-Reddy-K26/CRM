"use client";

import { useState } from "react";
import { seed } from "@/data/seed";
import useOnceVisible from "./useOnceVisible";

const money = value => `$${Math.round(value || 0).toLocaleString()}`;
const compact = value =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
const monthLabel = value =>
  new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(`${value}-02T00:00:00`));
const moduleClass = visible => `av-module av-observe${visible ? " is-visible" : ""}`;

function ModuleHead({ number, title, question, actions }) {
  return (
    <header className="av-module-head">
      <div>
        <p className="av-eyebrow">{number}</p>
        <h2>{title}</h2>
        <p>{question}</p>
      </div>
      {actions}
    </header>
  );
}

export function AnalyticsHeader() {
  return <header className="au-page-head">
    <div><span className="au-eyebrow">CLARIO / INTELLIGENCE</span><h1>Analytics<span className="au-title-mark">.</span></h1><p>See the shape of your pipeline, then follow the relationships behind it.</p></div>
    <div className="au-head-aside"><span>LIVE FROM YOUR WORKSPACE</span><strong>{seed.companies.length} companies <i /> {seed.deals.length} opportunities</strong></div>
  </header>;
}

export function AnalyticsSummary({ model, taskCount }) {
  return <section className="au-summary" aria-label="Pipeline summary">
    <div className="au-summary-primary"><span>TOTAL PIPELINE</span><strong>{money(model.pipeline)}</strong><small>Across {seed.deals.length} active deals</small></div>
    <div><span>AVERAGE DEAL</span><strong>{money(model.pipeline / (seed.deals.length || 1))}</strong></div>
    <div><span>OPEN TASKS</span><strong>{model.open}</strong></div>
    <div><span>ACTIVITY RECORDS</span><strong>{seed.notes.length + seed.emails.length + seed.calls.length + taskCount}</strong></div>
  </section>;
}

export function PipelineMomentum({ model, onFocus }) {
  const [metric, setMetric] = useState("value");
  const [hovered, setHovered] = useState(null);
  const [ref, visible] = useOnceVisible();
  const rows = model.closing || [];
  const values = rows.map(row => metric === "value" ? row.value : row.count);
  const max = Math.max(...values, 1);
  const startX = 54;
  const endX = 716;
  const baseY = 238;
  const points = rows.map((row, index) => ({
    ...row,
    x: rows.length === 1 ? (startX + endX) / 2 : startX + index * ((endX - startX) / (rows.length - 1)),
    y: baseY - ((metric === "value" ? row.value : row.count) / max) * 168,
  }));
  const line = points.length
    ? `M ${points[0].x} ${points[0].y} ${points.slice(1).map((point, index) => {
        const previous = points[index];
        const center = (previous.x + point.x) / 2;
        return `C ${center} ${previous.y}, ${center} ${point.y}, ${point.x} ${point.y}`;
      }).join(" ")}`
    : "";
  const area = points.length ? `${line} L ${points.at(-1).x} ${baseY} L ${points[0].x} ${baseY} Z` : "";

  const focusPoint = (row, index) => {
    setHovered(index);
    onFocus?.({ type: "month", id: row.month });
  };
  const clearPoint = () => {
    setHovered(null);
    onFocus?.(null);
  };

  return (
    <section ref={ref} className={`${moduleClass(visible)} av-momentum`}>
      <ModuleHead
        number="01"
        title="Pipeline momentum"
        question="When is current pipeline expected to close?"
        actions={
          <div className="av-switch" aria-label="Momentum metric">
            <button type="button" aria-pressed={metric === "value"} onClick={() => setMetric("value")}>Value</button>
            <button type="button" aria-pressed={metric === "deals"} onClick={() => setMetric("deals")}>Deals</button>
          </div>
        }
      />
      {points.length ? (
        <div className="av-chart-wrap">
          <svg className="av-line-chart" viewBox="0 0 770 292" role="img" aria-label={`Pipeline by expected close month, shown by ${metric}`}>
            <defs>
              <linearGradient id="avMomentumArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#9f353d" stopOpacity=".22" />
                <stop offset="1" stopColor="#9f353d" stopOpacity=".01" />
              </linearGradient>
            </defs>
            {[70, 154, 238].map(y => <line key={y} className="av-chart-grid" x1="54" x2="716" y1={y} y2={y} />)}
            <path className="av-momentum-area" d={area} />
            <path className="av-momentum-line" d={line} pathLength="1" />
            {points.map((point, index) => {
              const active = hovered === index;
              const tooltipX = Math.max(48, Math.min(642, point.x - 64));
              return (
                <g
                  key={point.month}
                  className={`av-chart-point${active ? " is-active" : ""}`}
                  style={{ "--i": index }}
                  role="button"
                  tabIndex="0"
                  aria-label={`${monthLabel(point.month)}: ${metric === "value" ? money(point.value) : `${point.count} deals`}`}
                  onMouseEnter={() => focusPoint(point, index)}
                  onMouseLeave={clearPoint}
                  onFocus={() => focusPoint(point, index)}
                  onBlur={clearPoint}
                >
                  <circle className="av-point-hit" cx={point.x} cy={point.y} r="20" />
                  <circle className="av-point-dot" cx={point.x} cy={point.y} r={active ? 6 : 4} />
                  <text className="av-axis-label" x={point.x} y="270" textAnchor="middle">{monthLabel(point.month)}</text>
                  {active && (
                    <g className="av-chart-tooltip" aria-hidden="true">
                      <rect x={tooltipX} y={Math.max(8, point.y - 66)} width="128" height="48" rx="8" />
                      <text x={tooltipX + 12} y={Math.max(28, point.y - 46)}>{monthLabel(point.month)}</text>
                      <text className="av-tooltip-value" x={tooltipX + 12} y={Math.max(44, point.y - 30)}>
                        {metric === "value" ? money(point.value) : `${point.count} deals`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      ) : <p className="av-empty">Close dates will appear here as opportunities are added.</p>}
    </section>
  );
}

export function ActivityMix({ tasks, onSelectType }) {
  const [ref, visible] = useOnceVisible();
  const [active, setActive] = useState(null);
  const items = [
    { label: "Notes", value: seed.notes.length },
    { label: "Emails", value: seed.emails.length },
    { label: "Calls", value: seed.calls.length },
    { label: "Tasks", value: tasks.length },
  ];
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;
  const segments = items.map((item, index) => {
    const percentage = total ? (item.value / total) * 100 : 0;
    const segment = { ...item, index, percentage, offset };
    offset += percentage;
    return segment;
  });
  const selected = active === null ? null : items[active];

  return (
    <section ref={ref} className={`${moduleClass(visible)} av-activity`}>
      <ModuleHead number="02" title="Activity mix" question="How is the team engaging?" />
      {total ? (
        <div className="av-donut-layout">
          <div className="av-donut-shell">
            <svg viewBox="0 0 160 160" role="img" aria-label={`${total} total activities`}>
              <circle className="av-donut-track" cx="80" cy="80" r="54" />
              {segments.map(segment => (
                <circle
                  key={segment.label}
                  className={`av-donut-segment av-tone-${segment.index}${active === segment.index ? " is-active" : ""}`}
                  cx="80" cy="80" r="54" pathLength="100"
                  style={{ "--segment": segment.percentage, "--gap": 100 - segment.percentage, "--segment-offset": -segment.offset, "--i": segment.index }}
                  role="button" tabIndex="0"
                  aria-label={`${segment.label}: ${segment.value}`}
                  onMouseEnter={() => setActive(segment.index)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(segment.index)}
                  onBlur={() => setActive(null)}
                />
              ))}
            </svg>
            <div className="av-donut-center" aria-hidden="true">
              <strong>{selected ? selected.value : total}</strong>
              <span>{selected ? selected.label : "Total"}</span>
            </div>
          </div>
          <div className="av-legend">
            {items.map((item, index) => (
              <button key={item.label} type="button" className={active === index ? "is-active" : ""}
                onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(index)} onBlur={() => setActive(null)}
                onClick={() => (onSelectType || (type => window.dispatchEvent(new CustomEvent("clario-open-activity", { detail: type }))))(item.label === "Notes" ? "Note" : item.label === "Emails" ? "Email" : item.label === "Calls" ? "Call" : "Task")}>
                <i className={`av-tone-bg-${index}`} />
                <span>{item.label}</span><strong>{item.value}</strong>
              </button>
            ))}
          </div>
        </div>
      ) : <p className="av-empty">Activity totals will appear after the first interaction is logged.</p>}
    </section>
  );
}

export function PipelineStageFlow({ model, onFocus, onSelectStage, selectedStage }) {
  const [ref, visible] = useOnceVisible();
  const max = Math.max(...model.stageRows.map(row => row.value), 1);
  const clear = () => onFocus?.(null);
  return (
    <section ref={ref} className={`${moduleClass(visible)} av-stage-module`}>
      <ModuleHead number="03" title="Pipeline stage flow" question="How is value distributed across the journey?" />
      <div className="av-stage-flow" aria-label="Pipeline stages">
        {model.stageRows.map((row, index) => (
          <div className="av-stage-step-wrap" key={row.stage}>
            <button type="button" className={`av-stage-step${selectedStage === row.stage ? " is-selected" : ""}`}
              style={{ "--i": index, "--stage-scale": .72 + (row.value / max) * .28 }}
              aria-pressed={selectedStage === row.stage}
              onMouseEnter={() => onFocus?.({ type: "stage", id: row.stage })}
              onMouseLeave={clear}
              onFocus={() => onFocus?.({ type: "stage", id: row.stage })}
              onBlur={clear}
              onClick={() => onSelectStage?.(row.stage)}>
              <span className="av-stage-orbit"><b>{index + 1}</b></span>
              <strong>{row.stage}</strong>
              <small>{row.deals.length} deals · {money(row.value)}</small>
            </button>
            {index < model.stageRows.length - 1 && <span className="av-stage-connector" aria-hidden="true"><i /></span>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TaskHealth({ model }) {
  const [ref, visible] = useOnceVisible();
  const total = model.open + model.complete;
  const percent = total ? Math.round((model.complete / total) * 100) : 0;
  return (
    <section ref={ref} className={`${moduleClass(visible)} av-task-module`}>
      <ModuleHead number="04" title="Task health" question="Is the team closing the loop?" />
      <div className="av-task-health">
        <div className="av-task-ring">
          <svg viewBox="0 0 160 160" role="img" aria-label={`${percent}% of tasks completed`}>
            <circle className="av-task-track" cx="80" cy="80" r="57" pathLength="100" />
            <circle className="av-task-progress" style={{ "--target": 100 - percent }} cx="80" cy="80" r="57" pathLength="100" />
          </svg>
          <div><strong>{percent}%</strong><span>Completed</span></div>
        </div>
        <div className="av-task-counts">
          <div><i className="is-complete" /><span>Completed</span><strong>{model.complete}</strong></div>
          <div><i /><span>Open</span><strong>{model.open}</strong></div>
        </div>
      </div>
      {!total && <p className="av-empty">Task health will appear when tasks are created.</p>}
    </section>
  );
}

export function TopAccounts({ model, highlightedCompanyId, onFocus, onSelect }) {
  const [ref, visible] = useOnceVisible();
  const rows = model.accounts.slice(0, 6);
  const max = Math.max(...rows.map(row => row.pipeline), 1);
  return (
    <section ref={ref} className={`av-ranking av-observe${visible ? " is-visible" : ""}`}>
      <ModuleHead number="05" title="Top accounts" question="Where is pipeline value concentrated?" />
      {rows.length ? <div className="av-rank-list">
        {rows.map((account, index) => (
          <button key={account.id} type="button" className={`av-rank-row${highlightedCompanyId === account.id ? " is-active" : ""}`}
            style={{ "--i": index, "--width": `${(account.pipeline / max) * 100}%` }}
            onMouseEnter={() => onFocus?.({ type: "company", id: account.id })}
            onMouseLeave={() => onFocus?.(null)} onFocus={() => onFocus?.({ type: "company", id: account.id })}
            onBlur={() => onFocus?.(null)} onClick={() => onSelect?.({ type: "company", id: account.id })}>
            <span className="av-rank-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="av-rank-name"><strong>{account.name}</strong><small>{account.deals.length} opportunities</small></span>
            <span className="av-rank-bar"><i /></span>
            <strong className="av-rank-value">{money(account.pipeline)}</strong>
          </button>
        ))}
      </div> : <p className="av-empty">Account rankings will appear when pipeline is added.</p>}
    </section>
  );
}

export function LargestOpportunities({ model, highlightedDealId, onFocus, onSelect }) {
  const [ref, visible] = useOnceVisible();
  const rows = model.biggest;
  const max = Math.max(...rows.map(row => row.amount), 1);
  return (
    <section ref={ref} className={`av-ranking av-opportunities av-observe${visible ? " is-visible" : ""}`}>
      <ModuleHead number="06" title="Largest opportunities" question="Which deals have the greatest impact?" />
      {rows.length ? <div className="av-rank-list">
        {rows.map((deal, index) => (
          <button key={deal.id} type="button" className={`av-rank-row${highlightedDealId === deal.id ? " is-active" : ""}`}
            style={{ "--i": index, "--width": `${(deal.amount / max) * 100}%` }}
            onMouseEnter={() => onFocus?.({ type: "deal", id: deal.id })}
            onMouseLeave={() => onFocus?.(null)} onFocus={() => onFocus?.({ type: "deal", id: deal.id })}
            onBlur={() => onFocus?.(null)} onClick={() => onSelect?.({ type: "deal", id: deal.id })}>
            <span className="av-rank-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="av-rank-name"><strong>{deal.name}</strong><small>{deal.company} · {deal.stage}</small></span>
            <span className="av-rank-bar"><i /></span>
            <strong className="av-rank-value">{money(deal.amount)}</strong>
          </button>
        ))}
      </div> : <p className="av-empty">Opportunity rankings will appear when deals are added.</p>}
    </section>
  );
}
