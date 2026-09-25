"use client";

import { useMemo, useState } from "react";
import AddCompanyDrawer from "./AddCompanyDrawer";

const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const initials = (name) => name.split(" ").map((part) => part[0]).slice(0, 2).join("");

export default function CompaniesWorkspace({ companies, contacts, deals, user, globalQuery, onAdd, onSelect }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [success, setSuccess] = useState(null);
  const industries = useMemo(() => ["All industries", ...new Set(companies.map((company) => company.industry).filter(Boolean))], [companies]);
  const shown = useMemo(() => {
    const query = `${globalQuery || ""} ${search}`.trim().toLowerCase();
    return companies.filter((company) => (!query || Object.values(company).join(" ").toLowerCase().includes(query)) && (industry === "All industries" || company.industry === industry));
  }, [companies, globalQuery, search, industry]);

  async function createCompany(values) {
    const company = await onAdd(values);
    setDrawerOpen(false);
    setSuccess(company);
    setTimeout(() => setSuccess((current) => current?.id === company.id ? null : current), 5000);
  }

  return <div className="companies-workspace">
    <div className="page-hero"><div><small>Relationships</small><h1>Company directory</h1><p>Explore every organization and its commercial context.</p></div><button onClick={() => setDrawerOpen(true)}>＋ Add company</button></div>
    <div className="directory-tools company-directory-tools"><label>⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search companies…" aria-label="Search companies"/></label><select value={industry} onChange={(event) => setIndustry(event.target.value)} aria-label="Filter companies by industry">{industries.map((option) => <option key={option}>{option}</option>)}</select><span>{shown.length === companies.length ? `${companies.length} companies` : `${shown.length} of ${companies.length} companies`}</span></div>
    {shown.length ? <div className="company-grid">{shown.map((company) => {
      const related = deals.filter((deal) => deal.companyId === company.id);
      const people = contacts.filter((contact) => contact.companyId === company.id);
      return <article key={company.id} role="button" tabIndex={0} onClick={() => onSelect({ ...company, type: "Company" })} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect({ ...company, type: "Company" }); } }}>
        <header><b>{initials(company.name)}</b><em>{company.lifecycleStatus || "Active"}</em></header><h2>{company.name}</h2><p>{[company.industry || "Industry not set", company.city || company.country || "Location not set"].join(" · ")}</p><hr/><div><span>Pipeline<strong>{money(related.reduce((sum, deal) => sum + deal.amount, 0))}</strong></span><span>Deals<strong>{related.length}</strong></span><span>People<strong>{people.length}</strong></span></div><button tabIndex={-1}>Open company ↗</button>
      </article>;
    })}</div> : <div className="company-empty"><b>No companies match these filters</b><p>Clear the search or choose another industry.</p><button onClick={() => { setSearch(""); setIndustry("All industries"); }}>Clear filters</button></div>}
    <AddCompanyDrawer open={drawerOpen} existingCompanies={companies} owner={user} onClose={() => setDrawerOpen(false)} onCreate={createCompany}/>
    {success && <div className="company-success-toast" role="status"><b>✓ Company created</b><span>{success.name} was added to your companies.</span><button onClick={() => { setSuccess(null); onSelect({ ...success, type: "Company" }); }}>View company</button></div>}
  </div>;
}
