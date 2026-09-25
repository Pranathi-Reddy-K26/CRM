const features = [
  ["feature large", "⌁", "Your work, at a glance.", "See every opportunity, conversation, and next step without digging through tabs.", "bars"],
  ["feature red", "◌", "Relationships that grow.", "Keep every customer detail close and make every interaction feel personal.", "rings"],
  ["feature", "↗", "Momentum, measured.", "Know what's working with simple, live insights your whole team can use.", "spark"],
];
function Art({ type }) { if (type === "bars") return <div className="mini-bars"><i/><i/><i/><i/><i/></div>; if (type === "rings") return <div className="rings">◉</div>; return <div className="spark">╱╲╱╲</div>; }
export default function FeatureSection() {
  return <section className="section-shell feature-section" id="features"><div className="section-heading"><div><p className="eyebrow">Everything in one place</p><h2>A clearer way to<br/><em>work together.</em></h2></div><p>From first touch to final handshake, Clario helps your team turn scattered information into meaningful action.</p></div><div className="feature-grid">{features.map(([className,icon,title,text,art])=><article className={className} key={title}><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><Art type={art}/></article>)}</div></section>;
}
