"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COMPANY_OPTIONS, normalizeDomain, validateCompany, validateCompanyField } from "@/lib/companyValidation";

const initialForm = {
  name: "", website: "", phone: "", email: "", linkedinUrl: "", address: "", city: "", state: "", country: "", postalCode: "",
  industry: "", companySize: "", annualRevenue: "", companyType: "", lifecycleStatus: "Prospect", ownerId: "", source: "", notes: "",
};
const steps = [
  { title: "Identity", description: "Company and contact information" },
  { title: "Details", description: "Location and business profile" },
  { title: "Relationship", description: "Ownership and CRM context" },
];
const stepFields = [["name", "website", "phone", "email", "linkedinUrl"], ["postalCode", "annualRevenue"], []];

function Field({ label, name, value, error, onChange, onBlur, required, type = "text", placeholder, wide, help, inputRef }) {
  const errorId = `${name}-error`;
  return <label className={`company-field${wide ? " field-wide" : ""}`}><span>{label}{required ? <b>Required</b> : <small>Optional</small>}</span><input ref={inputRef} name={name} type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}/>{error ? <em id={errorId} role="alert">{error}</em> : help ? <small className="field-help">{help}</small> : null}</label>;
}
function SelectField({ label, name, value, options, onChange }) {
  return <label className="company-field"><span>{label}<small>Optional</small></span><select name={name} value={value} onChange={onChange}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export default function AddCompanyDrawer({ open, existingCompanies, owner, onClose, onCreate }) {
  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const modalRef = useRef(null);
  const nameRef = useRef(null);
  const dirty = useMemo(() => Object.entries(values).some(([key, value]) => value !== initialForm[key]), [values]);
  const duplicate = useMemo(() => {
    const name = values.name.trim().toLowerCase(), domain = normalizeDomain(values.website);
    return existingCompanies.find((company) => (name && company.name.toLowerCase() === name) || (domain && normalizeDomain(company.domain || company.website) === domain));
  }, [values.name, values.website, existingCompanies]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const timer = setTimeout(() => nameRef.current?.focus(), 50);
    const onKey = (event) => {
      if (event.key === "Escape") { event.preventDefault(); requestClose(); }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = [...modalRef.current.querySelectorAll("button,input,select,textarea")].filter((element) => !element.disabled);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey); document.body.classList.add("drawer-open");
    return () => { clearTimeout(timer); document.removeEventListener("keydown", onKey); document.body.classList.remove("drawer-open"); previous?.focus?.(); };
  }, [open, dirty]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => step === 0 ? nameRef.current?.focus() : modalRef.current?.querySelector(".company-step-panel input, .company-step-panel select, .company-step-panel textarea")?.focus(), 30);
    return () => clearTimeout(timer);
  }, [step, open]);

  if (!open) return null;
  function requestClose() { if (dirty) setConfirmDiscard(true); else onClose(); }
  function resetAndClose() { setValues(initialForm); setErrors({}); setStep(0); setConfirmDiscard(false); setAllowDuplicate(false); onClose(); }
  function update(event) { const { name, value } = event.target; setValues((current) => ({ ...current, [name]: value })); if (errors[name]) setErrors((current) => ({ ...current, [name]: validateCompanyField(name, value) })); if (name === "name" || name === "website") setAllowDuplicate(false); }
  function blur(event) { setErrors((current) => ({ ...current, [event.target.name]: validateCompanyField(event.target.name, event.target.value) })); }
  function validateStep() {
    const all = validateCompany(values);
    const relevant = Object.fromEntries(Object.entries(all).filter(([field]) => stepFields[step].includes(field)));
    setErrors((current) => ({ ...current, ...relevant }));
    if (step === 0 && duplicate && !allowDuplicate) return false;
    if (Object.keys(relevant).length) { if (relevant.name) nameRef.current?.focus(); return false; }
    return true;
  }
  async function submit(event) {
    event.preventDefault();
    if (!validateStep()) return;
    if (step < steps.length - 1) { setStep((current) => current + 1); return; }
    setSaving(true);
    try { await onCreate({ ...values, domain: normalizeDomain(values.website), website: values.website.trim(), annualRevenue: values.annualRevenue ? Number(values.annualRevenue) : undefined, ownerId: values.ownerId || owner.email, clarionFields: true }); setValues(initialForm); setErrors({}); setStep(0); setAllowDuplicate(false); }
    finally { setSaving(false); }
  }
  const avatar = values.name.trim() ? values.name.trim().split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase() : "CO";

  return <div className="company-drawer-layer company-modal-layer" role="presentation"><button className="company-drawer-backdrop" aria-label="Close add company dialog" onClick={requestClose}/><section className="company-drawer company-create-modal" role="dialog" aria-modal="true" aria-labelledby="add-company-title" ref={modalRef}>
    <header><div className="drawer-title-icon">＋</div><div><h2 id="add-company-title">Add company</h2><p>Create a new customer relationship.</p></div><button className="drawer-close" type="button" onClick={requestClose} aria-label="Close dialog">×</button></header>
    <nav className="company-stepper" aria-label="Company creation progress">{steps.map((item, index) => <div className={`${index === step ? "active" : ""}${index < step ? " complete" : ""}`} key={item.title}><i>{index < step ? "✓" : index + 1}</i><span><b>{item.title}</b><small>{item.description}</small></span></div>)}</nav>
    <form onSubmit={submit} noValidate><div className="company-drawer-body company-step-body">
      {step === 0 && <div className="company-step-panel"><div className="company-live-preview"><b>{avatar}</b><span><strong>{values.name.trim() || "New company"}</strong><small>{normalizeDomain(values.website) || "Company identity preview"}</small></span><i>Live preview</i></div><div className="step-heading"><h3>Company identity</h3><p>Add the essentials your team will use most often.</p></div><div className="company-field-grid">
        <Field wide required inputRef={nameRef} label="Company name" name="name" value={values.name} error={errors.name} onChange={update} onBlur={blur} placeholder="Northstar Systems"/>
        <Field wide label="Website" name="website" value={values.website} error={errors.website} onChange={update} onBlur={blur} placeholder="https://northstarsystems.com" help="We’ll normalize this to a company domain."/>
        <Field label="Phone" name="phone" value={values.phone} error={errors.phone} onChange={update} onBlur={blur} placeholder="+1 555 0100"/>
        <Field label="Company email" name="email" type="email" value={values.email} error={errors.email} onChange={update} onBlur={blur} placeholder="hello@company.com"/>
        <Field wide label="LinkedIn" name="linkedinUrl" value={values.linkedinUrl} error={errors.linkedinUrl} onChange={update} onBlur={blur} placeholder="https://linkedin.com/company/..."/>
      </div>{duplicate && <div className="duplicate-warning" role="alert"><b>Possible duplicate</b><p>{duplicate.name} already uses this name or domain.</p><label><input type="checkbox" checked={allowDuplicate} onChange={(event) => setAllowDuplicate(event.target.checked)}/> Create this company anyway</label></div>}</div>}
      {step === 1 && <div className="company-step-panel"><div className="step-heading"><h3>Company details</h3><p>Build a useful profile without overwhelming the record.</p></div><div className="step-section"><h4>Location</h4><div className="company-field-grid">
        <Field wide label="Address" name="address" value={values.address} onChange={update} onBlur={blur} placeholder="Street and building"/><Field label="City" name="city" value={values.city} onChange={update} onBlur={blur} placeholder="City"/><Field label="State / region" name="state" value={values.state} onChange={update} onBlur={blur} placeholder="State or region"/><SelectField label="Country" name="country" value={values.country} options={COMPANY_OPTIONS.countries} onChange={update}/><Field label="Postal code" name="postalCode" value={values.postalCode} error={errors.postalCode} onChange={update} onBlur={blur} placeholder="Postal code"/>
      </div></div><div className="step-section"><h4>Business profile</h4><div className="company-field-grid"><SelectField label="Industry" name="industry" value={values.industry} options={COMPANY_OPTIONS.industries} onChange={update}/><SelectField label="Company size" name="companySize" value={values.companySize} options={COMPANY_OPTIONS.sizes} onChange={update}/><Field label="Annual revenue" name="annualRevenue" type="number" value={values.annualRevenue} error={errors.annualRevenue} onChange={update} onBlur={blur} placeholder="1000000"/><SelectField label="Company type" name="companyType" value={values.companyType} options={COMPANY_OPTIONS.types} onChange={update}/></div></div></div>}
      {step === 2 && <div className="company-step-panel"><div className="step-heading"><h3>CRM relationship</h3><p>Give the team enough context to take the next action.</p></div><div className="relationship-summary"><b>{avatar}</b><span><strong>{values.name}</strong><small>{normalizeDomain(values.website) || values.industry || "New company"}</small></span></div><div className="company-field-grid"><SelectField label="Lifecycle" name="lifecycleStatus" value={values.lifecycleStatus} options={COMPANY_OPTIONS.lifecycles} onChange={update}/><label className="company-field"><span>Account owner<small>Clarion field</small></span><select name="ownerId" value={values.ownerId} onChange={update}><option value={owner.email}>{owner.name}</option></select></label><SelectField label="Source" name="source" value={values.source} options={COMPANY_OPTIONS.sources} onChange={update}/><label className="company-field field-wide"><span>Notes<small>{values.notes.length}/600</small></span><textarea name="notes" value={values.notes} onChange={update} maxLength={600} placeholder="Add context about this company, relationship, or next step..."/></label></div></div>}
    </div><footer className="company-modal-footer"><button type="button" onClick={requestClose}>Cancel</button><span>{step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)}>Back</button>}<button className="drawer-submit" type="submit" disabled={saving}>{saving ? <><span className="button-spinner"/>Creating company…</> : step === 2 ? "Create company" : "Continue"}</button></span></footer></form>
    {confirmDiscard && <div className="discard-layer" role="alertdialog" aria-modal="true" aria-labelledby="discard-title"><div><h3 id="discard-title">Discard changes?</h3><p>You have unsaved company information.</p><span><button onClick={() => setConfirmDiscard(false)}>Keep editing</button><button className="discard-action" onClick={resetAndClose}>Discard</button></span></div></div>}
  </section></div>;
}
