export const CONTACT_OPTIONS = {
  departments: ["Executive", "Sales", "Marketing", "Finance", "Operations", "Engineering", "Product", "Customer Success", "Human Resources", "Legal", "Procurement", "Other"],
  lifecycles: ["Lead", "Qualified", "Customer", "Partner", "Inactive"],
  statuses: ["New", "Working", "Connected", "Qualified", "Unqualified", "Converted"],
  sources: ["Website", "Referral", "Outbound", "Event", "Partner", "Import", "Other"],
  contactMethods: ["Email", "Phone", "Either"],
};

export function validateContactField(name, value) {
  const text = String(value ?? "").trim();
  if (name === "first" && !text) return "First name is required.";
  if (name === "last" && !text) return "Last name is required.";
  if (["first", "last"].includes(name) && text.length > 60) return "Keep this name under 60 characters.";
  if (name === "email") {
    if (!text) return "Work email is required.";
    if (!/^\S+@\S+\.\S+$/.test(text)) return "Enter a valid work email.";
  }
  if (name === "phone" && text && !/^[+()\d\s.-]{7,25}$/.test(text)) return "Enter a valid international phone number.";
  if (name === "linkedinUrl" && text) {
    try { const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`); if (!url.hostname.includes("linkedin.com")) return "Enter a valid LinkedIn URL."; }
    catch { return "Enter a valid LinkedIn URL."; }
  }
  if (name === "companyId" && !text) return "Select a company for this contact.";
  return "";
}

export function validateContact(values) {
  const errors = {};
  ["first", "last", "email", "phone", "linkedinUrl", "companyId"].forEach((field) => {
    const error = validateContactField(field, values[field]);
    if (error) errors[field] = error;
  });
  return errors;
}
