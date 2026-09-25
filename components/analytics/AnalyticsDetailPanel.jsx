"use client";

import { useEffect, useRef } from "react";
import { seed } from "@/data/seed";

const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const closeLabel = date => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AnalyticsDetailPanel({ selection, model, onClose, onViewCompany, onViewDeal }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => { closeRef.current?.focus(); }, []);

  const company = selection.type === "company" ? model.accounts.find(account => account.id === selection.id) : null;
  const deal = selection.type === "deal" ? seed.deals.find(item => item.id === selection.id) : null;
  if (!company && !deal) return null;
  const companyForDeal = deal && model.accounts.find(account => account.id === deal.companyId);

  const keepFocus = event => {
    if (event.key !== "Tab") return;
    const controls = [...dialogRef.current.querySelectorAll("button")];
    if (event.shiftKey && document.activeElement === controls[0]) {
      event.preventDefault();
      controls.at(-1)?.focus();
    }
    if (!event.shiftKey && document.activeElement === controls.at(-1)) {
      event.preventDefault();
      controls[0]?.focus();
    }
  };

  return <div className="au-detail-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <aside ref={dialogRef} className="au-detail" role="dialog" aria-modal="true" aria-label={`${company?.name || deal?.name} details`} onKeyDown={keepFocus}>
      <div className="au-detail-top"><span>{company ? "COMPANY PROFILE" : "OPPORTUNITY"}</span><button ref={closeRef} aria-label="Close details" onClick={onClose}>×</button></div>
      <h2>{company?.name || deal?.name}</h2>
      <p className="au-detail-subtitle">{company ? `${company.industry} · ${company.city}` : deal.company}</p>
      <div className="au-detail-number"><strong>{money(company?.pipeline ?? deal.amount)}</strong><span>{company ? `${company.deals.length} opportunities` : deal.stage}</span></div>
      {company ? <>
        <h3>PIPELINE BY STAGE</h3>
        {model.stageRows.map(row => {
          const value = company.deals.filter(item => item.stage === row.stage).reduce((sum, item) => sum + item.amount, 0);
          return value ? <div className="au-detail-stage" key={row.stage}><div><span>{row.stage}</span><strong>{money(value)}</strong></div><i><b style={{ width: `${value / company.pipeline * 100}%` }} /></i></div> : null;
        })}
        <h3>DEALS</h3>
        <div className="au-detail-deals">{company.deals.map(item => <button key={item.id} onClick={() => onViewDeal(item)}><span><b>{item.name}</b><small>{item.stage} · Closes {closeLabel(item.close)}</small></span><strong>{money(item.amount)}</strong></button>)}</div>
        <div className="au-detail-facts"><span><b>{company.contacts}</b> contacts</span><span><b>{company.activity}</b> linked activities</span></div>
        <h3>RECENT ACTIVITY</h3>
        <div className="au-detail-activity">{company.recentActivity.map(item => <div key={item.id}><span><b>{item.title}</b><small>{item.description}</small></span><time dateTime={item.date}>{closeLabel(item.date)}</time></div>)}</div>
        <button className="au-detail-action" onClick={() => onViewCompany(company)}>View company ↗</button>
      </> : <>
        <h3>DEAL DETAILS</h3>
        <div className="au-detail-facts au-deal-facts"><span>Stage <b>{deal.stage}</b></span><span>Expected close <b>{closeLabel(deal.close)}</b></span><span>Company <b>{companyForDeal?.name}</b></span></div>
        <button className="au-detail-action" onClick={() => onViewDeal(deal)}>View deal ↗</button>
      </>}
    </aside>
  </div>;
}
