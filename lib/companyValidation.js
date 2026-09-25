export const COMPANY_OPTIONS = {
  industries: ["Technology", "SaaS", "Finance", "Healthcare", "Retail", "Manufacturing", "Education", "Logistics", "Professional Services", "Other"],
  sizes: ["1–10", "11–50", "51–200", "201–500", "501–1000", "1001–5000", "5000+"],
  types: ["Private", "Public", "Nonprofit", "Government", "Other"],
  lifecycles: ["Prospect", "Qualified", "Customer", "Partner", "Inactive"],
  sources: ["Website", "Referral", "Event", "Outbound", "Partner", "Import", "Other"],
  countries: ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Singapore", "United Arab Emirates", "Other"],
};

export function normalizeDomain(value = "") {
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "").toLowerCase();
}

function validUrl(value) {
  if (!value.trim()) return true;
  try {
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(candidate);
    return Boolean(url.hostname.includes("."));
  } catch { return false; }
}

export function validateCompanyField(name, value) {
  const text = String(value ?? "").trim();
  if (name === "name") {
    if (!text) return "Company name is required.";
    if (text.length > 100) return "Keep the company name under 100 characters.";
  }
  if (name === "email" && text && !/^\S+@\S+\.\S+$/.test(text)) return "Enter a valid company email address.";
  if (name === "website" && text && !validUrl(text)) return "Enter a valid website, for example https://company.com.";
  if (name === "linkedinUrl" && text && (!validUrl(text) || !text.toLowerCase().includes("linkedin.com"))) return "Enter a valid LinkedIn company URL.";
  if (name === "phone" && text && !/^[+()\d\s.-]{7,25}$/.test(text)) return "Enter a valid phone number, including country code if needed.";
  if (name === "annualRevenue" && text && (!/^\d+(\.\d{1,2})?$/.test(text) || Number(text) < 0)) return "Enter annual revenue as a positive number.";
  if (name === "postalCode" && text && !/^[\p{L}\d][\p{L}\d\s-]{1,14}$/u.test(text)) return "Enter a valid postal code.";
  return "";
}

export function validateCompany(values) {
  const errors = {};
  ["name", "email", "website", "linkedinUrl", "phone", "annualRevenue", "postalCode"].forEach((field) => {
    const error = validateCompanyField(field, values[field]);
    if (error) errors[field] = error;
  });
  return errors;
}
