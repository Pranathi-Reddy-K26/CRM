import "../styles.css";
import "./font-overrides.css";
import "./auth.css";
import "./dashboard.css";
import "./dashboard-theme.css";
import "./interactions.css";
<<<<<<< HEAD
import "./deal-detail.css";
import "./profile.css";
import "./settings.css";
=======
import "./command-center.css";
import "./companies.css";
import "./contacts.css";
import "./contact-workspace.css";
>>>>>>> f60837678b379b007b1af026af16a847bb4fc568

export const metadata = { title: "Clario CRM — Customer relationships, made clear", description: "A modern CRM workspace for leads, relationships, and revenue." };

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
