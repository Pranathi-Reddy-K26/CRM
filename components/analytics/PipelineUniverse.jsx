"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { seed } from "@/data/seed";

const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const compact = value => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 3 }).format(value);
const closeLabel = date => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const center = { x: 595, y: 355 };
const radii = [[245, 165], [385, 225], [540, 290]];
const orbitDurations = [20, 27, 35];
const stageLabelX = [240, 595, 950];

function stageForAccount(account, stageRows) {
  return stageRows.reduce((best, row) => {
    const value = account.deals.filter(deal => deal.stage === row.stage).reduce((sum, deal) => sum + deal.amount, 0);
    return value > best.value ? { stage: row.stage, value } : best;
  }, { stage: stageRows[0]?.stage, value: -1 }).stage;
}

function usePipelineCount(value, animate) {
  const [display, setDisplay] = useState(() => animate ? 0 : value);
  useEffect(() => {
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let interval;
    const delay = window.setTimeout(() => {
      const start = performance.now();
      interval = window.setInterval(() => {
        const progress = Math.min((performance.now() - start) / 700, 1);
        setDisplay(progress === 1 ? value : Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress === 1) window.clearInterval(interval);
      }, 40);
    }, 230);
    return () => { window.clearTimeout(delay); window.clearInterval(interval); };
  }, [animate, value]);
  return display;
}

function StageRing({ row, highlightedStage, selectedStage, highlightAll, onToggle, onClearFocus }) {
  const [rx, ry] = radii[row.index];
  const labelY = 31;
  const isActive = highlightAll || highlightedStage === row.stage;
  const muted = !!highlightedStage && !isActive;
  const activate = event => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    if (event.type === "keydown") event.preventDefault();
    onToggle(row.stage);
  };
  return <g className={`au-stage-ring au-stage-ring-${row.index} ${isActive ? "is-active" : ""} ${muted ? "is-muted" : ""}`} style={{ "--au-stage": row.index }}>
    <ellipse className={`au-ring ${row.index === 2 ? "au-ring-outer" : ""}`} cx={center.x} cy={center.y} rx={rx} ry={ry} />
    <g role="button" tabIndex={0} aria-pressed={selectedStage === row.stage} aria-label={`${row.stage}, ${row.deals.length} deals, ${money(row.value)}. ${selectedStage === row.stage ? "Clear stage highlight" : "Highlight stage"}`} onMouseEnter={onClearFocus} onFocus={onClearFocus} onClick={activate} onKeyDown={activate}>
      <rect className="au-stage-hit" x={stageLabelX[row.index] - 128} y={labelY - 17} width="256" height="26" rx="5" />
      <text className="au-ring-label" x={stageLabelX[row.index]} y={labelY} textAnchor="middle">0{row.index + 1}  /  {row.stage.toUpperCase()}</text>
    </g>
  </g>;
}

function PipelineCenter({ pipeline, dealCount, animate, active, onFocus, onMove, onBlur }) {
  const displayed = usePipelineCount(pipeline, animate);
  return <g className={`au-center ${active ? "is-active" : ""}`} role="button" tabIndex={0} aria-label={`Total pipeline, ${money(pipeline)}, ${dealCount} active deals`} onPointerEnter={event => onFocus({ type: "pipeline" }, event)} onPointerMove={onMove} onPointerLeave={onBlur} onFocus={event => onFocus({ type: "pipeline" }, event)} onBlur={onBlur}>
    <g className="au-core-rings" aria-hidden="true">
      <circle className="au-core-orbit au-core-orbit-outer" cx={center.x} cy={center.y} r="84" />
      <circle className="au-core-orbit au-core-orbit-inner" cx={center.x} cy={center.y} r="76" />
    </g>
    <circle className="au-core-halo" cx={center.x} cy={center.y} r="69" />
    <circle className="au-core" cx={center.x} cy={center.y} r="61" />
    <text className="au-core-label" x={center.x} y={center.y - 19} textAnchor="middle">TOTAL PIPELINE</text>
    <text className="au-core-value au-count-animated" x={center.x} y={center.y + 16} textAnchor="middle">${compact(displayed)}</text>
    <text className="au-core-value au-count-static" x={center.x} y={center.y + 16} textAnchor="middle">${compact(pipeline)}</text>
    <text className="au-core-caption" x={center.x} y={center.y + 37} textAnchor="middle">{dealCount} active deals</text>
  </g>;
}

function DealSatellite({ deal, company, radius, index, active, onFocusDeal, onMove, onBlur, onSelect }) {
  const angle = index * 360 / company.deals.length - 90;
  const distance = radius + 8;
  const activate = event => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    if (event.type === "keydown") event.preventDefault();
    event.stopPropagation();
    onSelect({ type: "deal", id: deal.id });
  };
  return <g className={`au-deal-point ${active ? "is-active" : ""}`} style={{ "--au-deal-angle": `${angle}deg`, "--au-deal-duration": `${7 + index * 1.15}s` }} role="button" tabIndex={0} aria-label={`${deal.name}, ${money(deal.amount)}, ${deal.stage}, ${company.name}, expected close ${closeLabel(deal.close)}`} onPointerEnter={event => onFocusDeal({ type: "deal", id: deal.id }, event)} onPointerMove={onMove} onPointerLeave={onBlur} onFocus={event => onFocusDeal({ type: "deal", id: deal.id }, event)} onBlur={onBlur} onClick={activate} onKeyDown={activate}>
    <line className="au-link" x1="0" y1="0" x2={distance} y2="0" />
    <circle className="au-deal-hit" cx={distance} cy="0" r="11" />
    <circle className="au-deal-dot" cx={distance} cy="0" r={active ? 5.5 : 3.5} />
  </g>;
}

function CompanyNode({ position, active, faded, activeDealId, onFocus, onMove, onBlur, onSelect, animate, order, reducedMotion }) {
  const { account, radius, stageIndex, startX, startY, delay, orbitPath } = position;
  const activate = event => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    if (event.type === "keydown") event.preventDefault();
    event.stopPropagation();
    onSelect({ type: "company", id: account.id });
  };
  return <g className={`au-company au-orbiting-company au-orbit-${stageIndex} ${active ? "is-active" : ""} ${faded ? "is-faded" : ""} ${animate ? "au-node-enter" : ""}`} style={{ "--au-order": order }} transform={reducedMotion ? `translate(${startX} ${startY})` : undefined}>
    {!reducedMotion && <animateMotion path={orbitPath} dur={`${orbitDurations[stageIndex]}s`} begin={`${delay}s`} repeatCount="indefinite" calcMode="linear" />}
    <g className="au-company-system">
      {account.deals.map((deal, index) => <DealSatellite key={deal.id} deal={deal} company={account} radius={radius} index={index} active={activeDealId === deal.id} onFocusDeal={onFocus} onMove={onMove} onBlur={onBlur} onSelect={onSelect} />)}
      <g className="au-company-control" role="button" tabIndex={0} aria-label={`${account.name}, ${money(account.pipeline)} pipeline, ${account.deals.length} deals, ${position.stage}`} onPointerEnter={event => onFocus({ type: "company", id: account.id }, event)} onPointerMove={onMove} onPointerLeave={onBlur} onFocus={event => onFocus({ type: "company", id: account.id }, event)} onBlur={onBlur} onClick={activate} onKeyDown={activate}>
        <circle className={`au-node au-node-${stageIndex}`} cx="0" cy="0" r={radius} />
        <text className="au-node-monogram" x="0" y="5" textAnchor="middle">{account.name.split(" ").map(part => part[0]).slice(0, 2).join("")}</text>
        <text className="au-node-label" x="0" y={radius + 27} textAnchor="middle">{account.name}</text>
      </g>
    </g>
  </g>;
}

function UniverseLegend() {
  return <div className="au-universe-foot"><span><i className="au-legend-company" /> Company size = pipeline value</span><span><i className="au-legend-deal" /> Dot = individual deal</span><span>Hover to inspect · Click to explore</span></div>;
}

export default function PipelineUniverse({ model, focused, selection, selectedStage, setFocused, onSelect, onToggleStage, animateEntrance }) {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useLayoutEffect(() => {
    if (motionPaused) svgRef.current?.pauseAnimations();
    else svgRef.current?.unpauseAnimations();
  }, [motionPaused]);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  const positions = useMemo(() => {
    const max = Math.max(...model.accounts.map(account => account.pipeline), 1);
    let order = 0;
    return model.stageRows.flatMap(row => {
      const accounts = model.accounts.filter(account => stageForAccount(account, model.stageRows) === row.stage);
      const prepared = accounts.map(account => {
        const radius = 17 + Math.sqrt(account.pipeline / max) * 9;
        const labelWidth = Math.min(112, account.name.length * 5.5 + 18);
        return { account, radius, spacing: Math.max(radius * 2 + 22, labelWidth) };
      });
      const totalSpacing = prepared.reduce((sum, item) => sum + item.spacing, 0);
      let usedSpacing = 0;
      return prepared.map(({ account, radius, spacing }) => {
        const angle = -64 + row.index * 49 + (usedSpacing + spacing / 2) / totalSpacing * 360;
        usedSpacing += spacing;
        const radians = angle * Math.PI / 180;
        const [rx, ry] = radii[row.index];
        const duration = orbitDurations[row.index];
        const normalizedAngle = ((angle % 360) + 360) % 360;
        const orbitPath = `M ${center.x + rx} ${center.y} A ${rx} ${ry} 0 1 1 ${center.x - rx} ${center.y} A ${rx} ${ry} 0 1 1 ${center.x + rx} ${center.y}`;
        const item = { account, stage: row.stage, stageIndex: row.index, radius, startX: center.x + Math.cos(radians) * rx, startY: center.y + Math.sin(radians) * ry, orbitPath, delay: -(normalizedAngle / 360 * duration), order };
        order += 1;
        return item;
      });
    });
  }, [model.accounts, model.stageRows]);
  const activeItem = selection || focused;
  const activeDeal = activeItem?.type === "deal" ? seed.deals.find(deal => deal.id === activeItem.id) : null;
  const activeCompanyId = activeItem?.type === "company" ? activeItem.id : activeDeal?.companyId;
  const activeCompany = activeCompanyId ? model.accounts.find(account => account.id === activeCompanyId) : null;
  const focusedStage = activeItem?.type === "stage" ? activeItem.id : null;
  const focusedMonth = activeItem?.type === "month" ? activeItem.id : null;
  const monthCompanyIds = focusedMonth
    ? new Set(seed.deals.filter(deal => deal.close.startsWith(focusedMonth)).map(deal => deal.companyId))
    : null;
  const centerFocused = focused?.type === "pipeline";
  const highlightedStage = activeDeal?.stage || (activeCompany ? stageForAccount(activeCompany, model.stageRows) : focusedStage || selectedStage);
  const current = focused?.type === "company" ? model.accounts.find(account => account.id === focused.id) : focused?.type === "deal" ? seed.deals.find(deal => deal.id === focused.id) : focused?.type === "pipeline" ? { name: "Total pipeline", pipeline: model.pipeline, deals: seed.deals } : null;
  const placeTooltip = event => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const target = event.currentTarget.getBoundingClientRect();
    const clientX = event.clientX || target.left + target.width / 2;
    const clientY = event.clientY || target.top + target.height / 2;
    const width = 226;
    const height = 104;
    const gap = 16;
    let x = clientX - bounds.left + gap;
    let y = clientY - bounds.top + gap;
    if (x + width > bounds.width - 12) x = clientX - bounds.left - width - gap;
    if (y + height > bounds.height - 12) y = clientY - bounds.top - height - gap;
    setTooltip({ x: Math.max(12, Math.min(x, bounds.width - width - 12)), y: Math.max(12, Math.min(y, bounds.height - height - 12)) });
  };
  const showFocus = (item, event) => {
    setMotionPaused(item.type === "company" || item.type === "deal");
    setFocused(item);
    placeTooltip(event);
  };
  const moveTooltip = event => placeTooltip(event);
  const clearFocus = () => { setMotionPaused(false); setFocused(null); setTooltip(null); };
  return <div className={`au-universe ${animateEntrance ? "au-entering" : ""} ${centerFocused ? "is-center-focused" : ""} ${motionPaused ? "is-motion-paused" : ""}`}>
    <div ref={canvasRef} className="au-universe-canvas" onPointerLeave={clearFocus}>
      <svg ref={svgRef} viewBox="0 0 1190 700" role="group" aria-label="Pipeline Universe: twelve companies orbiting the total pipeline on three selectable stage rings" preserveAspectRatio="xMidYMid meet" onClick={event => { if (event.target === event.currentTarget) { onSelect(null); if (selectedStage) onToggleStage(selectedStage); } }}>
        {[...model.stageRows].reverse().map(row => <StageRing key={row.stage} row={row} highlightedStage={highlightedStage} selectedStage={selectedStage} highlightAll={centerFocused} onToggle={onToggleStage} onClearFocus={() => setFocused(null)} />)}
        <PipelineCenter pipeline={model.pipeline} dealCount={seed.deals.length} animate={animateEntrance} active={centerFocused} onFocus={showFocus} onMove={moveTooltip} onBlur={clearFocus} />
        {positions.map(position => <CompanyNode key={position.account.id} position={position} order={position.order} animate={animateEntrance} reducedMotion={reducedMotion} active={position.account.id === activeCompanyId || (!activeCompanyId && (monthCompanyIds?.has(position.account.id) || highlightedStage === position.stage))} faded={activeCompanyId ? position.account.id !== activeCompanyId : monthCompanyIds ? !monthCompanyIds.has(position.account.id) : !!highlightedStage && highlightedStage !== position.stage} activeDealId={activeDeal?.id} onFocus={showFocus} onMove={moveTooltip} onBlur={clearFocus} onSelect={onSelect} />)}
      </svg>
      {current && tooltip && <div className="au-hover-card" style={{ left: tooltip.x, top: tooltip.y }} aria-live="polite"><span>{focused.type === "company" ? "COMPANY" : focused.type === "deal" ? "OPPORTUNITY" : "PIPELINE"}</span><strong>{current.name}</strong><p>{money(focused.type === "deal" ? current.amount : current.pipeline)} · {focused.type === "company" ? `${current.deals.length} deals` : focused.type === "deal" ? current.stage : `${seed.deals.length} active deals`}</p>{focused.type === "deal" && <small>{current.company} · Closes {closeLabel(current.close)}</small>}</div>}
    </div>
    <div className="au-mobile-accounts" aria-label="Companies by pipeline stage">{model.stageRows.map(row => <section key={row.stage} className={selectedStage && selectedStage !== row.stage ? "is-faded" : ""}><button className="au-mobile-stage" aria-pressed={selectedStage === row.stage} onClick={() => onToggleStage(row.stage)}>{row.stage}<span>{row.deals.length} deals</span></button><div>{model.accounts.filter(account => stageForAccount(account, model.stageRows) === row.stage).map(account => <button key={account.id} className={activeCompanyId === account.id ? "is-active" : ""} onClick={() => onSelect({ type: "company", id: account.id })}><span>{account.name}<small>{account.deals.length} deals</small></span><strong>{money(account.pipeline)}</strong></button>)}</div></section>)}</div>
    <UniverseLegend />
  </div>;
}
