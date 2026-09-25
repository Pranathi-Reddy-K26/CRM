"use client";

import { seed } from "@/data/seed";

const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

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

export function TopAccounts({ model, focused, selection, onFocus, onSelect }) {
  const topFiveValue = model.accounts.slice(0, 5).reduce((sum, account) => sum + account.pipeline, 0);
  const highlightedCompanyId = focused?.type === "company" ? focused.id : focused?.type === "deal" ? seed.deals.find(deal => deal.id === focused.id)?.companyId : selection?.type === "company" ? selection.id : selection?.type === "deal" ? seed.deals.find(deal => deal.id === selection.id)?.companyId : null;
  const max = model.accounts[0]?.pipeline || 1;
  return <section className="au-ranked-section">
    <div className="au-section-head"><div><span className="au-eyebrow">02 / WHERE IT SITS</span><h2>Top accounts by pipeline</h2></div><p>Top five hold {money(topFiveValue)} · {model.pipeline ? (topFiveValue / model.pipeline * 100).toFixed(1) : "0.0"}% of total</p></div>
    <div className="au-ranked-list">{model.accounts.map((account, index) => <button key={account.id} className={highlightedCompanyId === account.id ? "is-linked" : ""} onMouseEnter={() => onFocus({ type: "company", id: account.id })} onMouseLeave={() => onFocus(null)} onFocus={() => onFocus({ type: "company", id: account.id })} onBlur={() => onFocus(null)} onClick={() => onSelect({ type: "company", id: account.id })}>
      <span className="au-rank">{String(index + 1).padStart(2, "0")}</span>
      <span className="au-ranked-name"><b>{account.name}</b><small>{account.deals.length} deals</small></span>
      <span className="au-ranked-bar"><i style={{ width: `${account.pipeline / max * 100}%` }} /></span>
      <strong>{money(account.pipeline)}</strong><span className="au-row-arrow">↗</span>
    </button>)}</div>
  </section>;
}

export function LargestOpportunities({ model, focused, selection, onFocus, onSelect }) {
  const highlightedDealId = focused?.type === "deal" ? focused.id : selection?.type === "deal" ? selection.id : null;
  return <section className="au-opportunities">
    <div className="au-section-head"><div><span className="au-eyebrow">03 / WHAT MATTERS</span><h2>Largest opportunities</h2></div></div>
    <div className="au-opportunity-list">{model.biggest.map((deal, index) => <button key={deal.id} className={highlightedDealId === deal.id ? "is-linked" : ""} onMouseEnter={() => onFocus({ type: "deal", id: deal.id })} onMouseLeave={() => onFocus(null)} onFocus={() => onFocus({ type: "deal", id: deal.id })} onBlur={() => onFocus(null)} onClick={() => onSelect({ type: "deal", id: deal.id })}>
      <span className="au-rank">{String(index + 1).padStart(2, "0")}</span>
      <span><b>{deal.name}</b><small>{deal.company} · {deal.stage}</small></span>
      <strong>{money(deal.amount)}</strong><span className="au-row-arrow">↗</span>
    </button>)}</div>
  </section>;
}

export function ActivityAttention({ model, tasks }) {
  const taskCount = tasks.length;
  return <section className="au-signals">
    <div className="au-section-head"><div><span className="au-eyebrow">04 / MOMENTUM</span><h2>Activity &amp; attention</h2></div><p>Connected records across your workspace</p></div>
    <div className="au-signals-layout">
      <div className="au-activity-strip">{[["Notes", seed.notes.length], ["Emails", seed.emails.length], ["Tasks", taskCount], ["Calls", seed.calls.length]].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      <div className="au-task-health"><div><span>TASK HEALTH</span><strong>{model.open} open <i>/</i> {model.complete} completed</strong></div><div className="au-task-bar" role="img" aria-label={`${model.open} open tasks, ${model.complete} completed tasks`}><i style={{ width: `${model.open / (taskCount || 1) * 100}%` }} /><b style={{ width: `${model.complete / (taskCount || 1) * 100}%` }} /></div><small>Current task state from this workspace</small></div>
    </div>
  </section>;
}
