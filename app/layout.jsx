import "../styles.css";
import "./font-overrides.css";
import "./auth.css";
import "./dashboard.css";
import "./dashboard-theme.css";
import "./interactions.css";
import "./command-center.css";
import "./companies.css";
import "./contacts.css";
import "./contact-workspace.css";
import "./analytics.css";

export const metadata = { title: "Clario CRM — Customer relationships, made clear", description: "A modern CRM workspace for leads, relationships, and revenue." };

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
