export default function DashboardPreview() {
  return <div className="hero-visual" aria-label="Clario dashboard preview"><div className="glow" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
    <div className="dashboard-card"><div className="card-top"><span className="mini-logo">c</span><span>Overview</span><span className="dots">•••</span></div>
      <div className="welcome">Good morning, <strong>Alex</strong> <span>✦</span><small>Here&apos;s what&apos;s happening with your business today.</small></div>
      <div className="metric-grid"><div className="metric"><small>Total revenue</small><strong>$84,290</strong><span className="up">↑ 12.8%</span></div><div className="metric"><small>Active deals</small><strong>128</strong><span className="up">↑ 8.4%</span></div></div>
      <div className="chart"><div className="chart-label"><span>Revenue overview</span><small>Last 30 days⌄</small></div><svg viewBox="0 0 420 130" preserveAspectRatio="none" role="img" aria-label="Revenue trending upward"><path d="M0 105 C45 100 52 68 88 80 S125 91 155 65 S202 76 230 50 S275 62 305 36 S355 44 420 8" fill="none" stroke="#ef3e43" strokeWidth="4"/><path d="M0 105 C45 100 52 68 88 80 S125 91 155 65 S202 76 230 50 S275 62 305 36 S355 44 420 8 V130 H0Z" fill="url(#fade)" opacity=".45"/><defs><linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#ef3e43"/><stop offset="1" stopColor="#ef3e43" stopOpacity="0"/></linearGradient></defs></svg></div>
    </div></div>;
}
