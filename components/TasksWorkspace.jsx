"use client";

import { useMemo, useState } from "react";
import { companies, contacts, deals } from "@/data/seed";

const filters = ["All", "Today", "Upcoming", "Overdue", "Completed"];
const priorities = { High: 0, Medium: 1, Low: 2 };
const emptyDraft = () => ({ title: "", notes: "", due: "", dueTime: "", priority: "Medium", companyId: "", contactId: "", dealId: "" });
const localDay = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const dueKey = (due, today) => due === "Today" ? today : /^\d{4}-\d{2}-\d{2}$/.test(due || "") ? due : "";
const taskGroup = (task, today) => {
  const date = dueKey(task.due, today);
  if (!date) return "No date";
  if (date < today) return "Overdue";
  if (date === today) return "Today";
  return "Upcoming";
};
const dueLabel = (due, today, dueTime) => {
  const date = dueKey(due, today);
  if (!date) return "No due date";
  let label = date === today ? "Today" : "";
  const tomorrow = new Date(`${today}T12:00:00`);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (!label && date === `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`) label = "Tomorrow";
  if (!label) label = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: date.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric" }).format(new Date(`${date}T12:00:00`));
  if (dueTime && /^\d{2}:\d{2}$/.test(dueTime)) label += `, ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(`${date}T${dueTime}:00`))}`;
  return label;
};
const contextFor = (task) => {
  const deal = deals.find(item => item.id === task.dealId);
  const contact = contacts.find(item => item.id === task.contactId);
  const company = companies.find(item => item.id === (task.companyId || deal?.companyId || contact?.companyId));
  return [company?.name, deal?.name, contact?.name].filter(Boolean);
};
const sortTasks = (a, b, today) => {
  const aDate = dueKey(a.due, today) || "9999-12-31";
  const bDate = dueKey(b.due, today) || "9999-12-31";
  return aDate.localeCompare(bDate) || (a.dueTime || "99:99").localeCompare(b.dueTime || "99:99") || (priorities[a.priority] ?? 3) - (priorities[b.priority] ?? 3);
};

export default function TasksWorkspace({ tasks, onChange, query, onClearSearch, onToast }) {
  const [filter, setFilter] = useState("All");
  const [completedOpen, setCompletedOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [pinnedCompleted, setPinnedCompleted] = useState({});
  const today = localDay();

  const counts = useMemo(() => {
    const active = tasks.filter(task => task.status !== "Completed");
    return {
      Open: active.length,
      Today: active.filter(task => taskGroup(task, today) === "Today").length,
      Upcoming: active.filter(task => taskGroup(task, today) === "Upcoming").length,
      Overdue: active.filter(task => taskGroup(task, today) === "Overdue").length,
      Completed: tasks.length - active.length,
    };
  }, [tasks, today]);

  const matching = useMemo(() => {
    const text = query.trim().toLowerCase();
    return tasks.filter(task => !text || [task.title, task.notes, task.priority, task.due, task.dueTime, ...contextFor(task)].filter(Boolean).join(" ").toLowerCase().includes(text));
  }, [tasks, query]);

  const keepCompletedInPlace = filter === "All" && !completedOpen && !query.trim();
  const groups = ["Overdue", "Today", "Upcoming", "No date"].map(name => ({
    name,
    items: matching.filter(task => (task.status !== "Completed" || (keepCompletedInPlace && pinnedCompleted[task.id])) && taskGroup(task, today) === name && (filter === "All" || filter === name)).sort((a, b) => sortTasks(a, b, today)),
  })).filter(group => group.items.length);
  const completed = matching.filter(task => task.status === "Completed" && (filter === "Completed" || filter === "All")).sort((a, b) => sortTasks(a, b, today));
  const hasResults = groups.some(group => group.items.length) || completed.length;
  const attentionCount = counts.Today + counts.Overdue;

  function openNew() {
    setEditingId(null);
    setDraft(emptyDraft());
    setShowDetails(false);
    setComposerOpen(true);
  }

  function openEdit(task) {
    const deal = deals.find(item => item.id === task.dealId);
    const contact = contacts.find(item => item.id === task.contactId);
    setEditingId(task.id);
    setDraft({
      title: task.title || "", notes: task.notes || "", due: dueKey(task.due, today), dueTime: task.dueTime || "",
      priority: task.priority || "Medium", companyId: task.companyId || deal?.companyId || contact?.companyId || "",
      dealId: task.dealId || "", contactId: task.contactId || "",
    });
    setShowDetails(true);
    setComposerOpen(true);
    requestAnimationFrame(() => document.getElementById("task-composer-title")?.focus());
  }

  function toggle(task) {
    const completing = task.status !== "Completed";
    setPinnedCompleted(current => {
      const next = { ...current };
      if (completing && filter === "All" && !completedOpen && !query.trim()) next[task.id] = true;
      else delete next[task.id];
      return next;
    });
    onChange(current => current.map(item => item.id === task.id ? { ...item, status: completing ? "Completed" : "In Progress" } : item));
    onToast(completing ? "Task completed" : "Task reopened");
  }

  function save(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    const fields = {
      title, notes: draft.notes.trim(), due: draft.due, dueTime: draft.due ? draft.dueTime || undefined : undefined, priority: draft.priority,
      companyId: draft.companyId || undefined, contactId: draft.contactId || undefined, dealId: draft.dealId || undefined,
    };
    if (editingId) onChange(current => current.map(item => item.id === editingId ? { ...item, ...fields } : item));
    else onChange(current => [{ id: `task_${crypto.randomUUID()}`, status: "In Progress", type: "Task", ...fields }, ...current]);
    setComposerOpen(false);
    setEditingId(null);
    setFilter("All");
    onClearSearch();
    onToast(editingId ? "Task updated" : "Task added");
  }

  const selectedCompany = draft.companyId;
  const relatedContacts = contacts.filter(item => item.companyId === selectedCompany);
  const relatedDeals = deals.filter(item => item.companyId === selectedCompany);
  const empty = query.trim()
    ? ["No matching tasks", "Try another search term or clear your search."]
    : filter === "All" ? ["No tasks yet", "Create your first task and keep your next follow-up in sight."]
    : filter === "Today" ? ["Nothing due today", "You’re all caught up for today."]
    : filter === "Upcoming" ? ["No upcoming tasks", "Add a due date to keep future work in view."]
    : filter === "Overdue" ? ["No overdue tasks", "Everything is on track."]
    : ["No completed tasks", "Finish a task and it will appear here."];

  return <div className="todo-page">
    <header className="todo-header">
      <div><span className="todo-eyebrow">YOUR WORKSPACE</span><h1>Tasks</h1><p>Stay on top of follow-ups and keep your pipeline moving.</p></div>
      <button className="todo-add" onClick={openNew} type="button"><span aria-hidden="true">+</span> Add task</button>
    </header>

    <div className="todo-focus"><span aria-hidden="true" className="todo-focus-dot"/><p>{attentionCount ? <><strong>{attentionCount} {attentionCount === 1 ? "task needs" : "tasks need"}</strong> your attention today</> : <><strong>You’re all caught up</strong> for today</>}</p></div>
    <div className="todo-summary" aria-label="Task summary">
      <span><strong>{counts.Open}</strong> open</span>
      <span><strong>{counts.Today}</strong> due today</span>
      <span><strong>{counts.Overdue}</strong> overdue</span>
      <span><strong>{counts.Completed}</strong> completed</span>
    </div>

    {composerOpen && <form className="todo-composer" onSubmit={save}>
      <div className="todo-composer-top"><span className="todo-composer-icon" aria-hidden="true">+</span><label className="todo-sr-only" htmlFor="task-composer-title">Task title</label><input id="task-composer-title" autoFocus maxLength={180} required placeholder="What needs to be done?" value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))}/></div>
      <div className="todo-composer-options">
        <button type="button" className="todo-details-toggle" aria-expanded={showDetails} onClick={() => setShowDetails(value => !value)}>{showDetails ? "Hide details" : "+ Add details"}</button>
        <div><button type="button" className="todo-cancel" onClick={() => setComposerOpen(false)}>Cancel</button><button className="todo-save" type="submit">{editingId ? "Save changes" : "Add task"}</button></div>
      </div>
      {showDetails && <div className="todo-composer-details">
        <label className="todo-note-field">Description <textarea rows="2" placeholder="Add a short note (optional)" value={draft.notes} onChange={event => setDraft(current => ({ ...current, notes: event.target.value }))}/></label>
        <div className="todo-form-grid">
          <label>Due date <input type="date" value={draft.due} onChange={event => setDraft(current => ({ ...current, due: event.target.value, dueTime: event.target.value ? current.dueTime : "" }))}/></label>
          <label>Time <input type="time" value={draft.dueTime} disabled={!draft.due} onChange={event => setDraft(current => ({ ...current, dueTime: event.target.value }))}/></label>
          <label>Priority <select value={draft.priority} onChange={event => setDraft(current => ({ ...current, priority: event.target.value }))}><option>Low</option><option>Medium</option><option>High</option></select></label>
          <label>Company <select value={draft.companyId} onChange={event => setDraft(current => ({ ...current, companyId: event.target.value, contactId: "", dealId: "" }))}><option value="">None</option>{companies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Deal <select value={draft.dealId} disabled={!selectedCompany} onChange={event => setDraft(current => ({ ...current, dealId: event.target.value }))}><option value="">None</option>{relatedDeals.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Contact <select value={draft.contactId} disabled={!selectedCompany} onChange={event => setDraft(current => ({ ...current, contactId: event.target.value }))}><option value="">None</option>{relatedContacts.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
      </div>}
    </form>}

    <div className="todo-toolbar"><nav className="todo-filters" aria-label="Task filters">{filters.map(item => <button key={item} type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => { if (item !== "All") setPinnedCompleted({}); setFilter(item); }}>{item}</button>)}</nav>{query.trim() && <span className="todo-toolbar-hint">{matching.length} found</span>}</div>

    <div className="todo-list-surface">
      {!hasResults && <div className="todo-empty"><span aria-hidden="true">✓</span><h2>{empty[0]}</h2><p>{empty[1]}</p>{!query.trim() && filter === "All" && <button type="button" onClick={openNew}>+ Create task</button>}{query.trim() && <button type="button" onClick={onClearSearch}>Clear search</button>}</div>}
      {groups.map(group => <section className="todo-group" key={group.name} aria-label={`${group.name} tasks`}><div className="todo-group-heading"><h2>{group.name}</h2><span>{group.items.length}</span></div><ul>{group.items.map(task => <TaskRow key={task.id} task={task} today={today} onToggle={toggle} onEdit={openEdit}/>)}</ul></section>)}
      {filter === "Completed" && completed.length > 0 && <section className="todo-group" aria-label="Completed tasks"><div className="todo-group-heading"><h2>Completed</h2><span>{completed.length}</span></div><ul>{completed.map(task => <TaskRow key={task.id} task={task} today={today} onToggle={toggle} onEdit={openEdit}/>)}</ul></section>}
      {filter === "All" && completed.length > 0 && <section className="todo-group todo-completed" aria-label="Completed tasks"><button className="todo-completed-toggle" type="button" aria-expanded={completedOpen || !!query.trim()} onClick={() => { if (!completedOpen) setPinnedCompleted({}); setCompletedOpen(value => !value); }}><span aria-hidden="true">{completedOpen || query.trim() ? "⌄" : "›"}</span> Completed <small>{completed.length}</small></button>{(completedOpen || !!query.trim()) && <ul>{completed.map(task => <TaskRow key={task.id} task={task} today={today} onToggle={toggle} onEdit={openEdit}/>)}</ul>}</section>}
    </div>
  </div>;
}

function TaskRow({ task, today, onToggle, onEdit }) {
  const done = task.status === "Completed";
  const context = contextFor(task);
  const overdue = !done && taskGroup(task, today) === "Overdue";
  return <li className={`todo-row${done ? " is-done" : ""}`}>
    <input className="todo-check" type="checkbox" checked={done} onChange={() => onToggle(task)} aria-label={`${done ? "Reopen" : "Complete"} ${task.title}`}/>
    <div className="todo-row-body"><strong>{task.title}</strong>{task.notes && <p>{task.notes}</p>}<div className="todo-row-meta"><span className={overdue ? "todo-due is-overdue" : "todo-due"}>{dueLabel(task.due, today, task.dueTime)}</span>{task.priority && <span className={`todo-priority priority-${task.priority.toLowerCase()}`}>{task.priority} priority</span>}{context[0] && <span className="todo-context" title={context.join(" · ")}>{context[0]}</span>}</div></div>
    <details className="todo-row-menu"><summary aria-label={`Actions for ${task.title}`} title="Task actions">⋯</summary><button type="button" onClick={event => { event.currentTarget.closest("details").open = false; onEdit(task); }}>Edit task</button></details>
  </li>;
}
