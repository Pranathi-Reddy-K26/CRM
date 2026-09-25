"use client";

import { useEffect, useMemo, useState } from "react";
import { seed } from "@/data/seed";

const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const compact = value => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
const closeLabel = date => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const radii = [[172, 92], [296, 160], [427, 228]];
const positionsByStage = [[-45, 45, 135, 225], [-23, 23, 157, 203], [-38, 38, 142, 218]];

function stageForAccount(account, stageRows) {
  return stageRows.reduce((best, row) => {
    const value = account.deals.filter(deal => deal.stage === row.stage).reduce((sum, deal) => sum + deal.amount, 0);
    return value > best.value ? { stage: row.stage, value } : best;
  }, { stage: stageRows[0]?.stage, value: -1 }).stage;
}

function usePipelineCount(value, animate) {
  const [display, setDisplay] = useState(() => {
    if (!animate || (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return value;
    return 0;
  });
  useEffect(() => {
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let frame;
    const start = performance.now();
    const step = now => {
      const progress = Math.min((now - start) / 700, 1);
      setDisplay(progress === 1 ? value : Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [animate, value]);
  return display;
}

function StageRing({ row, highlightedStage, selectedStage, onToggle, onClearFocus }) {
  const [rx, ry] = radii[row.index];
  const labelY = [179, 112, 43][row.index];
  const isActive = highlightedStage === row.stage;
  const muted = !!highlightedStage && !isActive;
  const activate = event => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    if (event.type === "keydown") event.preventDefault();
    onToggle(row.stage);
  };
  return <g className={`au-stage-ring au-stage-ring-${row.index} ${isActive ? "is-active" : ""} ${muted ? "is-muted" : ""}`} style={{ "--au-stage": row.index }}>
    <ellipse className={`au-ring ${row.index === 2 ? "au-ring-outer" : ""}`} cx="500" cy="285" rx={rx} ry={ry} />
    <g role="button" tabIndex={0} aria-pressed={selectedStage === row.stage} aria-label={`${row.stage}, ${row.deals.length} deals, ${money(row.value)}. ${selectedStage === row.stage ? "Clear stage highlight" : "Highlight stage"}`} onMouseEnter={onClearFocus} onFocus={onClearFocus} onClick={activate} onKeyDown={activate}>
      <rect className="au-stage-hit" x="377" y={labelY - 16} width="246" height="26" rx="5" />
      <text className="au-ring-label" x="500" y={labelY} textAnchor="middle">0{row.index + 1}  /  {row.stage.toUpperCase()}</text>
    </g>
  </g>;
}

function PipelineCenter({ pipeline, dealCount, animate }) {
  const displayed = usePipelineCount(pipeline, animate);
  return <g className="au-center">
    <circle className="au-core-halo" cx="500" cy="285" r="83" />
    <circle className="au-core" cx="500" cy="285" r="70" />
    <text className="au-core-label" x="500" y="266" textAnchor="middle">TOTAL PIPELINE</text>
    <text className="au-core-value" x="500" y="301" textAnchor="middle">${compact(displayed)}</text>
    <text className="au-core-caption" x="500" y="322" textAnchor="middle">{dealCount} active deals</text>
  </g>;
}

function DealNode({ deal, company, x, y, radius, index, active, onFocusDeal, onSelect }) {
  const angle = ((index * 360 / company.deals.length) - 90) * Math.PI / 180;
  const distance = radius + 15;
  const dx = x + Math.cos(angle) * distance;
  const dy = y + Math.sin(angle) * distance;
  const activate = event => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    if (event.type === "keydown") event.preventDefault();
    onSelect({ type: "deal", id: deal.id });
  };
  return <g className={`au-deal-point ${active ? "is-active" : ""}`} role="button" tabIndex={0} aria-label={`${deal.name}, ${money(deal.amount)}, ${deal.stage}, ${company.name}, expected close ${closeLabel(deal.close)}`} onMouseEnter={() => onFocusDeal({ type: "deal", id: deal.id })} onFocus={() => onFocusDeal({ type: "deal", id: deal.id })} onClick={activate} onKeyDown={activate}>
    <line className="au-link" x1={x} y1={y} x2={dx} y2={dy} />
    <circle className="au-deal-hit" cx={dx} cy={dy} r="12" />
    <circle className="au-deal-dot" cx={dx} cy={dy} r={active ? 6 : 4} />
  </g>;
}

function CompanyNode({ position, active, faded, activeDealId, onFocus, onSelect, animate, order }) {
  const { account, x, y, radius, stageIndex } = position;
  const activate = event => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    if (event.type === "keydown") event.preventDefault();
    onSelect({ type: "company", id: account.id });
  };
  return <g className={`au-company ${active ? "is-active" : ""} ${faded ? "is-faded" : ""} ${animate ? "au-node-enter" : ""}`} style={{ "--au-order": order }}>
    {account.deals.map((deal, index) => <DealNode key={deal.id} deal={deal} company={account} x={x} y={y} radius={radius} index={index} active={activeDealId === deal.id} onFocusDeal={onFocus} onSelect={onSelect} />)}
    <g role="button" tabIndex={0} aria-label={`${account.name}, ${money(account.pipeline)} pipeline, ${account.deals.length} deals, ${position.stage}`} onMouseEnter={() => onFocus({ type: "company", id: account.id })} onFocus={() => onFocus({ type: "company", id: account.id })} onClick={activate} onKeyDown={activate}>
      <circle className={`au-node au-node-${stageIndex}`} cx={x} cy={y} r={radius} />
      <text className="au-node-monogram" x={x} y={y + 5} textAnchor="middle">{account.name.split(" ").map(part => part[0]).slice(0, 2).join("")}</text>
      <text className="au-node-label" x={x} y={y + radius + 31} textAnchor="middle">{account.name}</text>
    </g>
  </g>;
}

function UniverseLegend() {
  return <div className="au-universe-foot"><span><i className="au-legend-company" /> Company size = pipeline value</span><span><i className="au-legend-deal" /> Dot = individual deal</span><span>Click a company or deal to explore</span></div>;
}

export default function PipelineUniverse({ model, focused, selection, selectedStage, setFocused, onSelect, onToggleStage, animateEntrance }) {
  const positions = useMemo(() => {
    const max = Math.max(...model.accounts.map(account => account.pipeline), 1);
    return model.stageRows.flatMap(row => {
      const accounts = model.accounts.filter(account => stageForAccount(account, model.stageRows) === row.stage);
      return accounts.map((account, index) => {
        const angle = (positionsByStage[row.index][index] ?? (index * 360 / accounts.length - 90)) * Math.PI / 180;
        return { account, stage: row.stage, stageIndex: row.index, x: 500 + Math.cos(angle) * radii[row.index][0], y: 285 + Math.sin(angle) * radii[row.index][1], radius: 21 + Math.sqrt(account.pipeline / max) * 19 };
      });
    });
  }, [model.accounts, model.stageRows]);
  const activeItem = focused || selection;
  const activeDeal = activeItem?.type === "deal" ? seed.deals.find(deal => deal.id === activeItem.id) : null;
  const activeCompanyId = activeItem?.type === "company" ? activeItem.id : activeDeal?.companyId;
  const activeCompany = activeCompanyId ? model.accounts.find(account => account.id === activeCompanyId) : null;
  const highlightedStage = activeDeal?.stage || (activeCompany ? stageForAccount(activeCompany, model.stageRows) : selectedStage);
  const current = focused?.type === "company" ? model.accounts.find(account => account.id === focused.id) : focused?.type === "deal" ? seed.deals.find(deal => deal.id === focused.id) : null;
  return <div className={`au-universe ${animateEntrance ? "au-entering" : ""}`}>
    <div className="au-universe-canvas" onMouseLeave={() => setFocused(null)}>
      <svg viewBox="0 0 1000 570" role="group" aria-label="Pipeline Universe: three selectable stage rings with companies sized by pipeline and connected deal points" preserveAspectRatio="xMidYMid meet">
        {[...model.stageRows].reverse().map(row => <StageRing key={row.stage} row={row} highlightedStage={highlightedStage} selectedStage={selectedStage} onToggle={onToggleStage} onClearFocus={() => setFocused(null)} />)}
        <PipelineCenter pipeline={model.pipeline} dealCount={seed.deals.length} animate={animateEntrance} />
        {positions.map((position, order) => <CompanyNode key={position.account.id} position={position} order={order} animate={animateEntrance} active={position.account.id === activeCompanyId || (!activeCompanyId && selectedStage === position.stage)} faded={activeCompanyId ? position.account.id !== activeCompanyId : !!selectedStage && selectedStage !== position.stage} activeDealId={activeDeal?.id} onFocus={setFocused} onSelect={onSelect} />)}
      </svg>
      {current && <div className="au-hover-card" aria-live="polite"><span>{focused.type === "company" ? "COMPANY" : "OPPORTUNITY"}</span><strong>{current.name}</strong><p>{money(focused.type === "company" ? current.pipeline : current.amount)} · {focused.type === "company" ? `${current.deals.length} deals` : current.stage}</p>{focused.type === "deal" && <small>{current.company} · Closes {closeLabel(current.close)}</small>}</div>}
    </div>
    <div className="au-mobile-accounts" aria-label="Companies by pipeline stage">{model.stageRows.map(row => <section key={row.stage} className={selectedStage && selectedStage !== row.stage ? "is-faded" : ""}><button className="au-mobile-stage" aria-pressed={selectedStage === row.stage} onClick={() => onToggleStage(row.stage)}>{row.stage}<span>{row.deals.length} deals</span></button><div>{model.accounts.filter(account => stageForAccount(account, model.stageRows) === row.stage).map(account => <button key={account.id} className={activeCompanyId === account.id ? "is-active" : ""} onClick={() => onSelect({ type: "company", id: account.id })}><span>{account.name}<small>{account.deals.length} deals</small></span><strong>{money(account.pipeline)}</strong></button>)}</div></section>)}</div>
    <UniverseLegend />
  </div>;
}
