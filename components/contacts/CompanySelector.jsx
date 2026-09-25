"use client";

import { useMemo, useState } from "react";

const initials = (name) => name.split(" ").map((part) => part[0]).slice(0, 2).join("");

export default function CompanySelector({ companies, selectedId, onSelect, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = companies.find((company) => company.id === selectedId);
  const matches = useMemo(() => companies.filter((company) => `${company.name} ${company.domain || ""}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6), [companies, query]);

  return <div className="contact-company-field"><span>Company <b>Required</b></span>{selected ? <div className="selected-company"><b>{initials(selected.name)}</b><span><strong>{selected.name}</strong><small>{selected.domain || `${selected.industry || "Company"} · ${selected.city || ""}`}</small></span><button type="button" onClick={() => { onSelect(""); setOpen(true); }} aria-label={`Remove ${selected.name}`}>×</button></div> : <div className="company-combobox"><input value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} placeholder="Search companies by name or domain…" role="combobox" aria-expanded={open} aria-controls="company-options" aria-invalid={Boolean(error)}/>{open && <div id="company-options" role="listbox">{matches.length ? matches.map((company) => <button type="button" role="option" key={company.id} onClick={() => { onSelect(company.id); setQuery(""); setOpen(false); }}><b>{initials(company.name)}</b><span><strong>{company.name}</strong><small>{company.domain || `${company.industry || "Company"} · ${company.city || ""}`}</small></span></button>) : <div className="no-company-match"><b>No matching companies</b><small>Create the company from the Companies page, then return here.</small></div>}</div>}</div>}{error && <em role="alert">{error}</em>}</div>;
}
