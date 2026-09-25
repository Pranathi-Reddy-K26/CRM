"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CompanySelector from "./CompanySelector";
import { CONTACT_OPTIONS, validateContact, validateContactField } from "@/lib/contactValidation";

const initialForm = { first: "", last: "", email: "", phone: "", companyId: "", jobTitle: "", department: "", linkedinUrl: "", lifecycleStage: "Lead", leadStatus: "New", ownerId: "", leadSource: "", preferredContactMethod: "Email", emailConsent: false, phoneConsent: false, notes: "" };

function Field({ label, name, value, onChange, onBlur, error, required, placeholder, type = "text", wide }) {
  return <label className={`contact-form-field${wide ? " field-wide" : ""}`}><span>{label}{required ? <b>Required</b> : <small>Optional</small>}</span><input name={name} type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-contact-error` : undefined}/>{error && <em id={`${name}-contact-error`} role="alert">{error}</em>}</label>;
}
function SelectField({ label, name, value, options, onChange }) {
  return <label className="contact-form-field"><span>{label}<small>Optional</small></span><select name={name} value={value} onChange={onChange}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
function FormSection({ title, description, children }) { return <section className="contact-form-section"><header><h3>{title}</h3>{description && <p>{description}</p>}</header><div className="contact-field-grid">{children}</div></section>; }

export default function AddContactModal({ open, contacts, companies, owner, onClose, onCreate, onViewExisting }) {
  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [additional, setAdditional] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const modalRef = useRef(null), firstRef = useRef(null);
  const dirty = useMemo(() => Object.entries(values).some(([key, value]) => value !== initialForm[key]), [values]);
  const duplicate = useMemo(() => contacts.find((contact) => values.email.trim() && contact.email.toLowerCase() === values.email.trim().toLowerCase()), [contacts, values.email]);
  const company = companies.find((item) => item.id === values.companyId);
  const fullName = `${values.first} ${values.last}`.trim();
  const avatar = fullName ? `${values.first[0] || ""}${values.last[0] || ""}`.toUpperCase() : "CT";

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement, timer = setTimeout(() => firstRef.current?.focus(), 50);
    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); requestClose(); }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = [...modalRef.current.querySelectorAll("button,input,select,textarea")].filter((element) => !element.disabled);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown); document.body.classList.add("drawer-open");
    return () => { clearTimeout(timer); document.removeEventListener("keydown", keydown); document.body.classList.remove("drawer-open"); previous?.focus?.(); };
  }, [open, dirty]);
  if (!open) return null;

  function requestClose() { if (dirty) setConfirmDiscard(true); else onClose(); }
  function resetAndClose() { setValues(initialForm); setErrors({}); setAdditional(false); setConfirmDiscard(false); onClose(); }
  function update(event) { const { name, value, type, checked } = event.target; const next = type === "checkbox" ? checked : value; setValues((current) => ({ ...current, [name]: next })); if (errors[name]) setErrors((current) => ({ ...current, [name]: validateContactField(name, next) })); }
  function blur(event) { setErrors((current) => ({ ...current, [event.target.name]: validateContactField(event.target.name, event.target.value) })); }
  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateContact(values); setErrors(nextErrors);
    if (Object.keys(nextErrors).length || duplicate) { firstRef.current?.focus(); return; }
    setSaving(true);
    try { await onCreate({ ...values, company: company.name, domain: company.domain, role: values.jobTitle || "Contact", name: fullName, ownerId: values.ownerId || owner.email, sourceType: "clarion-ui", clarionFields: true }); setValues(initialForm); setErrors({}); setAdditional(false); }
    finally { setSaving(false); }
  }

  return <div className="contact-modal-layer" role="presentation"><button className="contact-modal-backdrop" aria-label="Close add contact dialog" onClick={requestClose}/><section className="add-contact-modal" role="dialog" aria-modal="true" aria-labelledby="add-contact-title" aria-describedby="add-contact-description" ref={modalRef}>
    <header><div className="contact-modal-icon">＋</div><div><h2 id="add-contact-title">Add contact</h2><p id="add-contact-description">Add a person to your customer relationships.</p></div><button type="button" onClick={requestClose} aria-label="Close dialog">×</button></header>
    <form onSubmit={submit} noValidate><div className="contact-modal-body">
      <div className="contact-live-preview"><b>{avatar}</b><span><strong>{fullName || "New contact"}</strong><small>{company?.name || values.jobTitle || "Contact identity preview"}</small></span><i>Live preview</i></div>
      <FormSection title="Contact information" description="The essential details your team will use every day."><label className="contact-form-field"><span>First name<b>Required</b></span><input ref={firstRef} name="first" value={values.first} onChange={update} onBlur={blur} placeholder="Maya" aria-invalid={Boolean(errors.first)}/>{errors.first && <em role="alert">{errors.first}</em>}</label><Field required label="Last name" name="last" value={values.last} onChange={update} onBlur={blur} error={errors.last} placeholder="Patel"/><Field required label="Work email" name="email" type="email" value={values.email} onChange={update} onBlur={blur} error={errors.email} placeholder="maya@company.com"/><Field label="Phone" name="phone" value={values.phone} onChange={update} onBlur={blur} error={errors.phone} placeholder="+91 98765 43210"/></FormSection>
      {duplicate && <div className="contact-duplicate" role="alert"><span><b>Contact already exists</b><small>A contact with this email is already in Clarion.</small></span><button type="button" onClick={() => onViewExisting(duplicate)}>View contact</button></div>}
      <FormSection title="Company relationship" description="Connect this person using the canonical company record."><div className="field-wide"><CompanySelector companies={companies} selectedId={values.companyId} onSelect={(companyId) => { setValues((current) => ({ ...current, companyId })); if (errors.companyId) setErrors((current) => ({ ...current, companyId: validateContactField("companyId", companyId) })); }} error={errors.companyId}/></div></FormSection>
      <FormSection title="Professional details"><Field label="Job title" name="jobTitle" value={values.jobTitle} onChange={update} onBlur={blur} placeholder="VP of Operations"/><SelectField label="Department" name="department" value={values.department} options={["", ...CONTACT_OPTIONS.departments]} onChange={update}/><Field wide label="LinkedIn" name="linkedinUrl" value={values.linkedinUrl} onChange={update} onBlur={blur} error={errors.linkedinUrl} placeholder="https://linkedin.com/in/..."/></FormSection>
      <button className="contact-additional-toggle" type="button" onClick={() => setAdditional((value) => !value)} aria-expanded={additional}><span><b>CRM details and preferences</b><small>Lifecycle, ownership, consent and notes</small></span><i>{additional ? "−" : "+"}</i></button>
      {additional && <div className="contact-additional"><FormSection title="CRM relationship"><SelectField label="Lifecycle stage" name="lifecycleStage" value={values.lifecycleStage} options={CONTACT_OPTIONS.lifecycles} onChange={update}/><SelectField label="Lead status" name="leadStatus" value={values.leadStatus} options={CONTACT_OPTIONS.statuses} onChange={update}/><label className="contact-form-field"><span>Contact owner<small>Clarion field</small></span><select name="ownerId" value={values.ownerId} onChange={update}><option value={owner.email}>{owner.name}</option></select></label><SelectField label="Lead source" name="leadSource" value={values.leadSource} options={["", ...CONTACT_OPTIONS.sources]} onChange={update}/></FormSection><FormSection title="Communication preferences"><SelectField label="Preferred contact" name="preferredContactMethod" value={values.preferredContactMethod} options={CONTACT_OPTIONS.contactMethods} onChange={update}/><div className="contact-consents"><label><input type="checkbox" name="emailConsent" checked={values.emailConsent} onChange={update}/> Email consent</label><label><input type="checkbox" name="phoneConsent" checked={values.phoneConsent} onChange={update}/> Phone consent</label></div><label className="contact-form-field field-wide"><span>Notes<small>{values.notes.length}/600</small></span><textarea name="notes" value={values.notes} onChange={update} maxLength={600} placeholder="Add context about this person, their role, or the relationship..."/></label></FormSection></div>}
    </div><footer><button type="button" onClick={requestClose}>Cancel</button><button className="contact-submit" type="submit" disabled={saving}>{saving ? <><span className="button-spinner"/>Creating contact…</> : "Create contact"}</button></footer></form>
    {confirmDiscard && <div className="contact-discard" role="alertdialog" aria-modal="true"><div><h3>Discard changes?</h3><p>You have unsaved contact information.</p><span><button onClick={() => setConfirmDiscard(false)}>Keep editing</button><button onClick={resetAndClose}>Discard</button></span></div></div>}
  </section></div>;
}
