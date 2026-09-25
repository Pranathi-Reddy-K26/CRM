import Header from "@/components/Header";
import DashboardPreview from "@/components/DashboardPreview";
import FeatureSection from "@/components/FeatureSection";
import WorkflowSection from "@/components/WorkflowSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return <><Header /><main id="top">
    <section className="hero section-shell"><div className="hero-copy">
      <p className="eyebrow"><span className="pulse" />Your customer universe, in focus</p>
      <h1>See the <em>whole picture.</em><br />Move with clarity.</h1>
      <p className="hero-text">Clario brings your leads, relationships, and revenue into one beautifully simple workspace — so your team can focus on what moves the business forward.</p>
      <div className="hero-actions"><a className="button" href="/signup">Start for free <span>↗</span></a><a className="play-link" href="#workflow"><span className="play">▶</span> See how Clario works</a></div>
      <div className="trust"><div className="avatars" aria-hidden="true"><span>J</span><span>M</span><span>A</span><span>+</span></div><p>Trusted by teams who<br /><strong>work better together.</strong></p></div>
    </div><DashboardPreview /></section>
    <section className="logo-strip" aria-label="Customer teams"><p>Built for teams that care about momentum</p><div><span>northstar</span><span>VANTAGE</span><span>arc / studio</span><span>◈ lattice</span><span>nomo</span></div></section>
    <FeatureSection /><WorkflowSection />
    <section className="cta section-shell" id="signup"><p className="eyebrow">Ready when you are</p><h2>Make room for<br /><em>what matters.</em></h2><p>Start building clearer customer relationships today.</p><a className="button" href="/signup">Create your free account <span>↗</span></a></section>
  </main><Footer /></>;
}
