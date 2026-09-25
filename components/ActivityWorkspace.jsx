"use client";

import { useMemo, useState } from "react";
import { calls, companies, contacts, deals, emails, notes } from "@/data/seed";

const types = ["All", "Email", "Call", "Task", "Note"];
const dayKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromKey = key => new Date(`${key}T12:00:00`);
const shiftDay = (date, amount) => { const next = new Date(date); next.setDate(next.getDate() + amount); return next; };
const dateLabel = key => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(fromKey(key));
const shortDateLabel = (key, today, yesterday) => {
  if (key === today) return "Today";
  if (key === yesterday) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: key.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric" }).format(fromKey(key));
};
const noteHeadline = body => {
  const sentence = body.trim().split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, "");
  return sentence.length > 100 ? `${sentence.slice(0, 97).replace(/\s+\S*$/, "")}…` : sentence;
};
const emailHeadline = email => {
  const subject = email.subject === "Follow-up on implementation proposal" ? "Proposal follow-up" : email.subject;
  const event = email.status === "Scheduled" ? "scheduled" : email.direction === "Incoming" ? "received" : email.status === "Sent" ? "sent" : "";
  return [subject, event].filter(Boolean).join(" ");
};

function ActivityIcon({ type }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (type === "Email") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
  if (type === "Call") return <svg {...common}><path d="M8.2 3.5 5.5 4.8a2 2 0 0 0-1 2.3c1.7 6 6.4 10.7 12.4 12.4a2 2 0 0 0 2.3-1l1.3-2.7-4.2-2.3-2.2 2.1a14 14 0 0 1-5.7-5.7l2.1-2.2-2.3-4.2Z"/></svg>;
  if (type === "Task") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16 9"/></svg>;
  return <svg {...common}><path d="M5 3.5h11l3 3V20H5z"/><path d="M16 3.5v3h3M8 11h8M8 15h6"/></svg>;
}

function buildActivities(tasks) {
  const companyById = new Map(companies.map(item => [item.id, item]));
  const contactById = new Map(contacts.map(item => [item.id, item]));
  const dealById = new Map(deals.map(item => [item.id, item]));
  const rows = [
    ...notes.map(note => {
      const deal = dealById.get(note.dealId);
      const company = companyById.get(note.companyId || deal?.companyId);
      return { id: `Note:${note.id}`, type: "Note", label: "Note added", title: note.body, headline: noteHeadline(note.body), description: note.body, date: note.date, company: company?.name, companyId: company?.id, deal: deal?.name, detail: [] };
    }),
    ...emails.map(email => {
      const contact = contactById.get(email.contactId);
      const company = companyById.get(contact?.companyId);
      return { id: `Email:${email.id}`, type: "Email", label: email.status === "Scheduled" ? "Email scheduled" : email.direction === "Incoming" ? "Email received" : "Email sent", title: email.subject, headline: emailHeadline(email), description: email.body, date: email.date, company: company?.name, companyId: company?.id, contact: contact?.name, detail: [["Subject", email.subject], ["Status", email.status], ["Direction", email.direction]] };
    }),
    ...calls.map(call => {
      const contact = contactById.get(call.contactId);
      const company = companyById.get(contact?.companyId);
      const headline = call.status === "Completed" ? `${call.title} completed` : call.status === "Busy" ? `${call.title} — busy` : call.title;
      return { id: `Call:${call.id}`, type: "Call", label: "Call logged", title: call.title, headline, description: call.notes, date: call.date, company: company?.name, companyId: company?.id, contact: contact?.name, detail: [["Status", call.status], ["Direction", call.direction], ["Source", call.source]] };
    }),
    ...tasks.map(task => {
      const deal = dealById.get(task.dealId);
      const contact = contactById.get(task.contactId);
      const company = companyById.get(task.companyId || deal?.companyId || contact?.companyId);
      const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(task.due || "") ? task.due : null;
      return { id: `Task:${task.id}`, type: "Task", label: task.status === "Completed" ? "Task completed" : "Follow-up task", title: task.title, headline: task.status === "Completed" ? `Completed: ${task.title}` : task.title, description: task.notes, date: null, dueDate, company: company?.name, companyId: company?.id, contact: contact?.name, deal: deal?.name, detail: [["Status", task.status], ["Priority", task.priority], ["Due time", task.dueTime]] };
    }),
  ];
  return rows.sort((a, b) => (b.date || "").localeCompare(a.date || "") || a.id.localeCompare(b.id));
}

function groupFor(date, today, yesterday, weekStart) {
  if (!date) return "Task records";
  if (date > today) return "Upcoming";
  if (date === today) return "Today";
  if (date === yesterday) return "Yesterday";
  if (date >= weekStart) return "Earlier this week";
  return "Older";
}

function ActivityEvent({ item, open, onToggle, latest, today, yesterday }) {
  const context = [item.company, item.contact || item.deal].filter(Boolean);
  const detailId = `details-${item.id.replaceAll(":", "-")}`;
  const fields = [
    ["Company", item.company], ["Contact", item.contact], ["Deal", item.deal],
    [item.type === "Task" ? "Due date" : "Date", item.dueDate ? dateLabel(item.dueDate) : item.date ? dateLabel(item.date) : null],
    ...item.detail,
  ].filter(([, value]) => value);

  return <article className={`activity-event${open ? " is-open" : ""}${latest ? " is-latest" : ""}`}>
    <span className="activity-event-rail"><span className="activity-event-icon"><ActivityIcon type={item.type}/></span></span>
    <div className="activity-event-content">
      <button type="button" className="activity-event-main" onClick={onToggle} aria-expanded={open} aria-controls={detailId}>
        <span className="activity-event-kind">{item.type}</span>
        <strong>{item.headline}</strong>
        {context.length > 0 && <span className="activity-event-context">{context.join(" · ")}</span>}
        <span className="activity-event-date">
          {item.date ? <time dateTime={item.date} title={dateLabel(item.date)}>{shortDateLabel(item.date, today, yesterday)}</time>
            : item.dueDate ? <time dateTime={item.dueDate} title={`Due ${dateLabel(item.dueDate)}`}>Due {shortDateLabel(item.dueDate, today, yesterday)}</time>
            : "Activity date unavailable"}
        </span>
        <span className="activity-event-chevron" aria-hidden="true">⌄</span>
      </button>
      <div className="activity-event-detail-wrap" id={detailId} hidden={!open}>
        <div className="activity-event-detail">
          <p>{item.description || item.title}</p>
          <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>
      </div>
    </div>
  </article>;
}

export default function ActivityWorkspace({ tasks }) {
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("Any date");
  const [companyId, setCompanyId] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const todayDate = new Date();
  const today = dayKey(todayDate);
  const yesterday = dayKey(shiftDay(todayDate, -1));
  const weekStartDate = shiftDay(todayDate, -(todayDate.getDay() + 6) % 7);
  const weekStart = dayKey(weekStartDate);
  const last30 = dayKey(shiftDay(todayDate, -29));
  const days = Array.from({ length: 7 }, (_, index) => shiftDay(weekStartDate, index));
  const activities = useMemo(() => buildActivities(tasks), [tasks]);
  const thisWeek = activities.filter(item => item.date && item.date >= weekStart && item.date <= today);
  const countByType = Object.fromEntries(types.slice(1).map(name => [name, thisWeek.filter(item => item.type === name).length]));
  const dayCounts = days.map(date => activities.filter(item => item.date === dayKey(date)).length);
  const maxCount = Math.max(1, ...dayCounts);
  const hasFilters = type !== "All" || search.trim() || dateRange !== "Any date" || companyId || selectedDay;

  const visible = activities.filter(item => {
    if (type !== "All" && item.type !== type) return false;
    if (selectedDay && item.date !== selectedDay) return false;
    if (dateRange === "This week" && (!item.date || item.date < weekStart || item.date > today)) return false;
    if (dateRange === "Last 30 days" && (!item.date || item.date < last30 || item.date > today)) return false;
    if (dateRange === "Older" && (!item.date || item.date >= last30)) return false;
    if (companyId && item.companyId !== companyId) return false;
    const needle = search.trim().toLowerCase();
    return !needle || [item.label, item.title, item.headline, item.description, item.company, item.contact, item.deal, item.dueDate, ...item.detail.flat()].filter(Boolean).join(" ").toLowerCase().includes(needle);
  });
  const groups = ["Today", "Yesterday", "Earlier this week", "Older", "Upcoming", "Task records"]
    .map(name => ({ name, items: visible.filter(item => groupFor(item.date, today, yesterday, weekStart) === name) }))
    .filter(group => group.items.length);
  const datedCount = visible.filter(item => item.date).length;
  const taskRecordCount = visible.length - datedCount;
  const countLabel = [
    datedCount || !taskRecordCount ? `${datedCount} ${datedCount === 1 ? "activity" : "activities"}` : null,
    taskRecordCount ? `${taskRecordCount} ${taskRecordCount === 1 ? "task" : "tasks"}` : null,
  ].filter(Boolean).join(" · ");
  const periodLabel = selectedDay ? dateLabel(selectedDay) : dateRange === "Any date" ? "All time" : dateRange === "Older" ? `Before ${dateLabel(last30)}` : dateRange;
  const latestId = visible.find(item => item.date && item.date <= today)?.id;

  function clearFilters() { setType("All"); setSearch(""); setDateRange("Any date"); setCompanyId(""); setSelectedDay(""); }
  const taskDateFilter = type === "Task" && (selectedDay || dateRange !== "Any date");
  const emptyTitle = !activities.length ? "No activity yet" : search.trim() ? "No matching activity" : taskDateFilter ? "No dated task activity" : selectedDay ? "No activity on this day" : "No activity for these filters";
  const emptyCopy = !activities.length ? "Customer interactions will appear here as your team logs notes, calls, emails and tasks." : search.trim() ? "Try another search term or clear your search." : taskDateFilter ? "Task creation and completion dates are not recorded. Clear the date filter to view task records." : selectedDay ? "Choose another day in the activity pulse or clear the day filter." : "Try another activity type, date range, or company.";

  return <div className="activity-workspace">
    <header className="activity-header"><span className="activity-eyebrow">RELATIONSHIPS / ACTIVITY</span><h1>Activity</h1><p>See what&apos;s happening across your customer relationships.</p></header>

    <section className="activity-overview" aria-label="Activity summary">
      <div className="activity-summary"><span className="activity-summary-label">THIS WEEK</span><strong>{thisWeek.length} customer {thisWeek.length === 1 ? "interaction" : "interactions"} this week</strong>{thisWeek.length > 0 && <p>{types.slice(1).filter(name => countByType[name]).map(name => `${countByType[name]} ${name.toLowerCase()}${countByType[name] === 1 ? "" : "s"}`).join(" · ")}</p>}</div>
      <div className="activity-pulse"><div className="activity-pulse-heading"><strong>Activity this week</strong>{selectedDay && <button type="button" onClick={() => setSelectedDay("")}>Clear day</button>}</div><div className="activity-pulse-days">{days.map((date, index) => { const key = dayKey(date); return <button type="button" key={key} className={selectedDay === key ? "is-selected" : ""} onClick={() => setSelectedDay(current => current === key ? "" : key)} aria-pressed={selectedDay === key} aria-label={`${dateLabel(key)}: ${dayCounts[index]} ${dayCounts[index] === 1 ? "activity" : "activities"}`} title={`${dateLabel(key)} · ${dayCounts[index]} activities`}><span className="activity-pulse-bar-track"><span className={`activity-pulse-bar${dayCounts[index] ? "" : " is-empty"}`} style={{ height: `${dayCounts[index] ? Math.max(16, dayCounts[index] / maxCount * 100) : 4}%` }}/></span><span>{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)}</span></button>; })}</div></div>
    </section>

    <section className="activity-controls" aria-label="Activity filters"><div className="activity-type-tabs" role="group" aria-label="Activity type">{types.map(name => <button type="button" key={name} className={type === name ? "is-active" : ""} onClick={() => setType(name)} aria-pressed={type === name}>{name === "All" ? "All" : `${name}s`}</button>)}</div><div className="activity-control-actions"><label className="activity-search"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search activity..." aria-label="Search activity"/>{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}</label><button type="button" className={`activity-filter-trigger${filterOpen || dateRange !== "Any date" || companyId ? " is-active" : ""}`} onClick={() => setFilterOpen(open => !open)} aria-expanded={filterOpen} aria-controls="activity-more-filters"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/></svg>Filter{(dateRange !== "Any date" || companyId) && <span className="activity-filter-dot"/>}</button></div></section>
    {filterOpen && <div className="activity-more-filters" id="activity-more-filters"><label>Date range<select value={dateRange} onChange={event => setDateRange(event.target.value)}><option>Any date</option><option>This week</option><option>Last 30 days</option><option>Older</option></select></label><label>Company<select value={companyId} onChange={event => setCompanyId(event.target.value)}><option value="">All companies</option>{companies.map(company => <option value={company.id} key={company.id}>{company.name}</option>)}</select></label><button type="button" onClick={() => { setDateRange("Any date"); setCompanyId(""); }}>Reset filters</button></div>}

    <div className="activity-results-heading"><div><span className="activity-section-kicker">CUSTOMER HISTORY</span><h2>Activity timeline</h2></div><div className="activity-results-meta"><span aria-live="polite">{hasFilters ? "Showing" : "Total"}: {countLabel}<small>{periodLabel}</small></span>{hasFilters && <button type="button" onClick={clearFilters}>Clear all filters</button>}</div></div>
    {groups.length ? <div className="activity-timeline">{groups.map(group => <section
      className={`activity-group${group.name === "Task records" ? " activity-task-records" : ""}${group.name === "Older" ? " is-older" : ""}`}
      key={group.name} aria-label={group.name === "Task records" ? "Tasks" : `${group.name} activities`}>
      <div className="activity-group-label">
        <h3>{group.name === "Task records" ? "Tasks" : group.name}</h3><span>{group.items.length}</span>
        {group.name === "Task records" && <p>Due dates shown; creation and completion dates are unavailable.</p>}
      </div>
      <div className="activity-group-items">{group.items.map(item => <ActivityEvent
        key={item.id} item={item} open={expanded === item.id} latest={item.id === latestId} today={today} yesterday={yesterday}
        onToggle={() => setExpanded(current => current === item.id ? null : item.id)}/>)}</div>
    </section>)}</div> : <div className="activity-empty"><span className="activity-empty-icon"><ActivityIcon type="Note"/></span><h3>{emptyTitle}</h3><p>{emptyCopy}</p>{hasFilters && <button type="button" onClick={clearFilters}>Clear filters</button>}</div>}
  </div>;
}
