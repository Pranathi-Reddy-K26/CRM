"use client";

import { useMemo, useState } from "react";
import AddContactModal from "./AddContactModal";

export default function ContactsWorkspace({ contacts, companies, user, globalQuery, onAdd, onSelect }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const shown = useMemo(() => { const query = `${globalQuery || ""} ${search}`.trim().toLowerCase(); return contacts.filter((contact) => !query || Object.values(contact).join(" ").toLowerCase().includes(query)); }, [contacts, globalQuery, search]);

  async function createContact(values) { const contact = await onAdd(values); setModalOpen(false); setSuccess(contact); setTimeout(() => setSuccess((current) => current?.id === contact.id ? null : current), 5000); }
  function viewContact(contact) { setModalOpen(false); setSuccess(null); onSelect({ ...contact, type: "Contact", name: contact.name || `${contact.first} ${contact.last}` }); }

  return <div className="contacts-workspace"><div className="page-hero"><div><small>Relationships</small><h1>People directory</h1><p>Understand the people behind every customer relationship.</p></div><button onClick={() => setModalOpen(true)}>＋ Add contact</button></div><div className="directory-tools contact-directory-tools"><label>⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people, roles, companies or email…" aria-label="Search contacts"/></label><span>{shown.length === contacts.length ? `${contacts.length} contacts` : `${shown.length} of ${contacts.length} contacts`}</span></div>
    {shown.length ? <section className="people-list">{shown.map((contact) => { const record = { ...contact, name: contact.name || `${contact.first} ${contact.last}`, type: "Contact" }; return <article key={contact.id} tabIndex={0} onClick={() => onSelect(record)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(record); } }}><b>{contact.first[0]}{contact.last[0]}</b><p><strong>{contact.first} {contact.last}</strong><small>{contact.role || contact.jobTitle || "Contact"}</small></p><p><strong>{contact.company}</strong><small>{contact.email}</small></p><a href={`mailto:${contact.email}`} onClick={(event) => event.stopPropagation()}>✉ Email</a><i>↗</i></article>; })}</section> : <div className="contact-empty"><b>No contacts match this search</b><p>Clear the search to return to the full directory.</p><button onClick={() => setSearch("")}>Clear search</button></div>}
    <AddContactModal open={modalOpen} contacts={contacts} companies={companies} owner={user} onClose={() => setModalOpen(false)} onCreate={createContact} onViewExisting={viewContact}/>
    {success && <div className="contact-success-toast" role="status"><b>✓ Contact created</b><span>{success.name} was added to your contacts.</span><button onClick={() => viewContact(success)}>View contact</button></div>}
  </div>;
}
