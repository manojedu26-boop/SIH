/* Civic Signal Atlas: role-gated investigator prototype; public transparency stays login-free. */
import { FormEvent, useMemo, useState } from 'react';
import { Bell, Camera, CheckCircle2, ChevronRight, Clock3, LockKeyhole, LogOut, MapPinned, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';

const demoQueue = [
  { id: 'MH-2024-1187', title: 'Community water infrastructure', place: 'Nashik / Maharashtra', score: 87, reason: 'Near-identical description found in two districts', category: 'Duplicate / ghost', status: 'New' },
  { id: 'RJ-2024-0412', title: 'Rural road improvement', place: 'Kota / Rajasthan', score: 76, reason: '95% funds used · 0% physical completion', category: 'Delay / execution', status: 'Under review' },
  { id: 'KA-2023-0920', title: 'Sanitation facility', place: 'Mysuru / Karnataka', score: 63, reason: 'Contractor footprint exceeds regional baseline', category: 'Agency graph', status: 'New' },
];

type InvestigatorPortalProps = { onClose: () => void };

export default function InvestigatorPortal({ onClose }: InvestigatorPortalProps) {
  const [signedIn, setSignedIn] = useState(() => new URLSearchParams(window.location.search).get('session') === 'active');
  const [email, setEmail] = useState('reviewer@district.gov.in');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [category, setCategory] = useState('All signals');
  const [showMfa, setShowMfa] = useState(false);

  const filteredQueue = useMemo(() => demoQueue.filter((item) => `${item.title} ${item.place} ${item.category}`.toLowerCase().includes(search.toLowerCase()) && (status === 'All statuses' || item.status === status) && (category === 'All signals' || item.category === category)), [category, search, status]);

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    if (!showMfa) { setShowMfa(true); return; }
    setSignedIn(true);
  };

  return <div className="portal-backdrop" role="dialog" aria-modal="true" aria-labelledby="portal-title">
    <section className="investigator-portal">
      <header className="portal-header"><div className="portal-brand"><span className="portal-mark"><ShieldCheck size={17} /></span><div><span className="eyebrow">RESTRICTED WORKSPACE / PROTOTYPE</span><strong id="portal-title">MPLAD Sentinel Investigator</strong></div></div><button className="portal-close" onClick={onClose} aria-label="Close investigator portal">Close ×</button></header>
      {!signedIn ? <div className="portal-login-layout"><div className="portal-login-copy"><span className="eyebrow">ACCESS IS GRANTED, NOT REQUESTED</span><h2>Review what the public view <em>cannot show.</em></h2><p>District Reviewers, MoSPI staff, and CAG-affiliated reviewers would enter through provisioned government identities. This front-end prototype demonstrates the flow; it does not send credentials or create an account.</p><div className="portal-trust"><LockKeyhole size={17} /><span>This portal contains restricted audit data. Access is logged and monitored.</span></div></div><form className="portal-login-form" onSubmit={handleLogin}><label>Official email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@district.gov.in" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Set at first login" required /></label>{showMfa && <label>One-time code<input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="6 digit OTP" pattern="[0-9]{6}" required /></label>}<button className="button-coral portal-submit" type="submit">{showMfa ? 'Enter scoped workspace' : 'Continue to MFA'}<ChevronRight size={16} /></button><small>Demo flow only · production requires invite-only provisioning, MFA, server-side RBAC, rate limiting, session timeout, and immutable audit logging.</small></form></div> : <div className="portal-dashboard"><div className="portal-scope"><div><span className="eyebrow">SIGNED IN AS / DISTRICT REVIEWER</span><h2 id="portal-dashboard-title">Bengaluru South <em>review queue.</em></h2><p>Jurisdiction scope: Karnataka · Bengaluru South constituency · eSAKSHI baseline from 01 Apr 2023.</p></div><div className="portal-session"><span className="console-dot" /> SESSION 14:32 LEFT<br /><small>reviewer@district.gov.in · MFA verified</small></div></div><div className="portal-summary"><div><span>NEW FLAGS</span><strong>08</strong><small>since last login</small></div><div><span>UNDER REVIEW</span><strong>14</strong><small>across assigned scope</small></div><div><span>RESOLVED</span><strong>06</strong><small>this month</small></div><div className="portal-alert"><Bell size={17} /><span>2 high-risk flags<br /><small>above 80 / 100</small></span></div></div><div className="portal-grid"><div className="portal-queue"><div className="portal-queue-head"><div><span className="eyebrow">PRIORITIZED QUEUE / DEMO DATA</span><h3>What needs verification first</h3></div><button className="portal-filter-button"><SlidersHorizontal size={15} /> Filters</button></div><div className="portal-filters"><label className="portal-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search project or district" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>New</option><option>Under review</option></select><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All signals</option><option>Duplicate / ghost</option><option>Delay / execution</option><option>Agency graph</option></select></div><div className="portal-queue-list">{filteredQueue.map((item) => <article className="portal-case" key={item.id}><div className="portal-score" data-score={item.score >= 80 ? 'high' : 'watch'}><strong>{item.score}</strong><span>/100</span></div><div className="portal-case-copy"><span className="eyebrow">{item.id} · {item.status.toUpperCase()}</span><h4>{item.title}</h4><p>{item.place} · {item.category}</p><small><span className="portal-reason-dot" />{item.reason}</small></div><button className="portal-case-action" aria-label={`Open ${item.id}`}>Review <ChevronRight size={15} /></button></article>)}</div></div><aside className="portal-map-panel"><div className="portal-map"><img src="/manus-storage/mplad-district-texture_d6fee9ee.jpg" alt="Illustrative jurisdiction map texture" /><i className="portal-map-spot spot-one" /><i className="portal-map-spot spot-two" /><div className="portal-map-label">KARNATAKA / BENGALURU SOUTH</div></div><div className="portal-map-foot"><MapPinned size={15} /> Scoped signal map · illustrative</div><button className="portal-upload"><Camera size={16} /> Attach field verification photo</button></aside></div><nav className="portal-mobile-nav" aria-label="Investigator navigation"><button className="active"><CheckCircle2 size={16} />Queue</button><button><MapPinned size={16} />Map</button><button><Search size={16} />Search</button><button><LogOut size={16} />Exit</button></nav></div>}
    </section>
  </div>;
}
