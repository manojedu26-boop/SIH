/* Civic Signal Atlas: 3-tier role-gated investigator portal with domain validation, MFA, onboarding, scoped dashboard & field evidence tools for SIH26102 MPLADS. */
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Clock3,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  Flame,
  HelpCircle,
  History,
  Info,
  KeyRound,
  Layers,
  LockKeyhole,
  LogOut,
  MapPin,
  MapPinned,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  UserCheck,
  UserCog,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';

type CaseStatus = 'New' | 'Under review' | 'Confirmed Fraud' | 'False Positive';
type AnomalyCategory = 'Duplicate / ghost' | 'Delay / execution' | 'Agency graph' | 'Financial mismatch' | 'Compliance breach';

interface QueueItem {
  id: string;
  title: string;
  place: string;
  cost: string;
  score: number;
  reason: string;
  category: AnomalyCategory;
  status: CaseStatus;
  lastUpdated: string;
  breakdown: {
    financial: number;
    duplicate: number;
    delay: number;
    compliance: number;
    graph: number;
  };
}

const initialDemoQueue: QueueItem[] = [
  {
    id: 'MH-2024-1187',
    title: 'Community Water Infrastructure & Borewell Installation',
    place: 'Nashik / Maharashtra',
    cost: '₹38.5 Lakhs',
    score: 87,
    reason: 'Near-identical project description and GPS radius overlap found in adjacent Gram Panchayat record.',
    category: 'Duplicate / ghost',
    status: 'New',
    lastUpdated: '10 mins ago',
    breakdown: { financial: 28, duplicate: 25, delay: 18, compliance: 10, graph: 6 }
  },
  {
    id: 'KA-2023-0920',
    title: 'High School Sanitation Facility Block Construction',
    place: 'Bengaluru South / Karnataka',
    cost: '₹18.2 Lakhs',
    score: 84,
    reason: 'Contractor agency network controls 78% of district sanction allocations across 3 MPs.',
    category: 'Agency graph',
    status: 'New',
    lastUpdated: '4 hours ago',
    breakdown: { financial: 24, duplicate: 15, delay: 15, compliance: 20, graph: 10 }
  },
  {
    id: 'RJ-2024-0412',
    title: 'Rural Connective Road Improvement (KM 4 to 9)',
    place: 'Kota / Rajasthan',
    cost: '₹72.0 Lakhs',
    score: 76,
    reason: '95% financial utilization disbursed with 0% physical progress photo verification.',
    category: 'Delay / execution',
    status: 'Under review',
    lastUpdated: '2 hours ago',
    breakdown: { financial: 30, duplicate: 10, delay: 20, compliance: 10, graph: 6 }
  },
  {
    id: 'UP-2024-3310',
    title: 'Primary Health Centre Solar Micro-Grid',
    place: 'Varanasi / Uttar Pradesh',
    cost: '₹45.0 Lakhs',
    score: 63,
    reason: 'Unit sanction price is 2.4x above national benchmark median for 10kW solar installations.',
    category: 'Financial mismatch',
    status: 'Under review',
    lastUpdated: '1 day ago',
    breakdown: { financial: 30, duplicate: 5, delay: 12, compliance: 10, graph: 6 }
  },
  {
    id: 'WB-2023-0804',
    title: 'Community Centre & Library Hall Construction',
    place: 'Asansol / West Bengal',
    cost: '₹55.0 Lakhs',
    score: 52,
    reason: 'SC/ST fund quota allocation shortfall detected for constituency expenditure mandate.',
    category: 'Compliance breach',
    status: 'New',
    lastUpdated: '2 days ago',
    breakdown: { financial: 12, duplicate: 10, delay: 10, compliance: 15, graph: 5 }
  }
];

const initialAuditTrail = [
  { id: 'LOG-109', time: '19:14', actor: 'S. Ramesh (Reviewer)', action: 'MFA 2-Factor OTP verified via SMS (+91 98765 49021)' },
  { id: 'LOG-108', time: '19:10', actor: 'System Sentinel', action: 'Jurisdiction scoped to Karnataka / Bengaluru South (PC-26)' },
  { id: 'LOG-107', time: '18:45', actor: 'A. Gupta (MoSPI Admin)', action: 'Provisioned new auditor identity GOV-KA-8831' }
];

type InvestigatorPortalProps = { onClose: () => void };

export default function InvestigatorPortal({ onClose }: InvestigatorPortalProps) {
  // Auth & Session States
  const [signedIn, setSignedIn] = useState(() => new URLSearchParams(window.location.search).get('session') === 'active');
  const [email, setEmail] = useState('s.ramesh@nic.in');
  const [password, setPassword] = useState('••••••••••••');
  const [otp, setOtp] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [mfaTimer, setMfaTimer] = useState(30);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(3);
  const [accountLocked, setAccountLocked] = useState(false);
  const [domainError, setDomainError] = useState(false);

  // Security & Password Reset Modals
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotMfaSent, setForgotMfaSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Step-Up Authentication Modal for High-Stakes Status (e.g. "Confirmed Fraud")
  const [pendingFraudCaseId, setPendingFraudCaseId] = useState<string | null>(null);
  const [stepUpPassword, setStepUpPassword] = useState('');
  const [stepUpError, setStepUpError] = useState('');

  // User Role & Tier
  const [userRole, setUserRole] = useState<'District Reviewer' | 'MoSPI Auditor' | 'System Admin'>('District Reviewer');

  // Onboarding Modal State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Mobile & Low Bandwidth Modes
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Queue & Data States
  const [queue, setQueue] = useState<QueueItem[]>(initialDemoQueue);
  const [auditLog, setAuditLog] = useState(initialAuditTrail);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All statuses');
  const [categoryFilter, setCategoryFilter] = useState<string>('All signals');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('KA-2023-0920');

  // Active Mobile View Tab
  const [mobileTab, setMobileTab] = useState<'queue' | 'map' | 'evidence' | 'log'>('queue');

  // Field Verification Attachment Simulation State
  const [fieldPhotos, setFieldPhotos] = useState<Array<{ name: string; timestamp: string; location: string }>>([
    { name: 'site_inspection_01.jpg', timestamp: '27-08-2026 14:20 IST', location: '12.9716° N, 77.5946° E (Bengaluru South)' }
  ]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Countdown timer simulation for session timeout (15 mins = 900 seconds)
  const [sessionSeconds, setSessionSeconds] = useState(900);

  useEffect(() => {
    if (!signedIn) return;
    const timer = setInterval(() => {
      setSessionSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSignedIn(false);
          setShowMfa(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [signedIn]);

  // MFA OTP timer countdown
  useEffect(() => {
    if (!showMfa || mfaTimer <= 0) return;
    const interval = setInterval(() => setMfaTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [showMfa, mfaTimer]);

  const formattedSessionTime = useMemo(() => {
    const m = Math.floor(sessionSeconds / 60);
    const s = sessionSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, [sessionSeconds]);

  // Domain validation check - robust handling for trailing whitespace & case-sensitivity
  const isGovDomain = useMemo(() => {
    const clean = email.trim().toLowerCase();
    if (!clean.includes('@')) return false;
    return (
      clean.endsWith('.gov.in') ||
      clean.endsWith('.nic.in') ||
      clean.endsWith('gov.in') ||
      clean.endsWith('nic.in') ||
      clean.endsWith('@mospi.gov.in') ||
      clean.includes('@nic.in') ||
      clean.includes('@gov.in')
    );
  }, [email]);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const clean = val.trim().toLowerCase();
    if (
      clean.length > 4 &&
      !clean.endsWith('.gov.in') &&
      !clean.endsWith('.nic.in') &&
      !clean.endsWith('gov.in') &&
      !clean.endsWith('nic.in') &&
      !clean.endsWith('@mospi.gov.in') &&
      !clean.includes('@nic.in') &&
      !clean.includes('@gov.in')
    ) {
      setDomainError(true);
    } else {
      setDomainError(false);
    }
  };

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const matchesSearch = `${item.id} ${item.title} ${item.place} ${item.category}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All statuses' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'All signals' || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [queue, search, statusFilter, categoryFilter]);

  const selectedCase = useMemo(() => {
    return queue.find((c) => c.id === selectedCaseId) || queue[0];
  }, [queue, selectedCaseId]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!isGovDomain) {
      setDomainError(true);
      return;
    }
    if (accountLocked) return;

    if (!showMfa) {
      setShowMfa(true);
      setMfaTimer(30);
      return;
    }

    // Check OTP validation
    if (otp !== '849201' && otp.length !== 6) {
      const remaining = otpAttemptsLeft - 1;
      setOtpAttemptsLeft(remaining);
      if (remaining <= 0) {
        setAccountLocked(true);
        setAuditLog((prev) => [
          { id: `LOG-${Date.now().toString().slice(-3)}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), actor: email, action: 'SECURITY ALERT: Account locked after 3 failed OTP attempts' },
          ...prev
        ]);
      }
      return;
    }

    setSignedIn(true);
    setShowOnboarding(true); // Trigger first-time orientation after login
    setAuditLog((prev) => [
      { id: `LOG-${Date.now().toString().slice(-3)}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), actor: `${email} (${userRole})`, action: 'MFA 2-Factor OTP verified via SMS (+91 98765 49021)' },
      ...prev
    ]);
  };

  const handleStatusChangeRequest = (caseId: string, newStatus: CaseStatus) => {
    if (newStatus === 'Confirmed Fraud') {
      // High-stakes status change requires Step-Up Re-Authentication!
      setPendingFraudCaseId(caseId);
      setStepUpPassword('');
      setStepUpError('');
      return;
    }
    applyStatusChange(caseId, newStatus);
  };

  const applyStatusChange = (caseId: string, newStatus: CaseStatus) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === caseId ? { ...item, status: newStatus, lastUpdated: 'Just now' } : item))
    );
    setAuditLog((prev) => [
      {
        id: `LOG-${Date.now().toString().slice(-3)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: `${userRole} (${email})`,
        action: `Case ${caseId} status updated to [${newStatus}]`
      },
      ...prev
    ]);
  };

  const confirmStepUpAuth = (e: FormEvent) => {
    e.preventDefault();
    if (!stepUpPassword || stepUpPassword.length < 4) {
      setStepUpError('Password required for high-stakes fraud declaration step-up re-authentication.');
      return;
    }
    if (pendingFraudCaseId) {
      applyStatusChange(pendingFraudCaseId, 'Confirmed Fraud');
      setPendingFraudCaseId(null);
    }
  };

  const handleSimulatedPhotoUpload = () => {
    const newPhoto = {
      name: `field_photo_${Date.now().toString().slice(-4)}.jpg`,
      timestamp: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`,
      location: '12.9716° N, 77.5946° E · GPS Stamped'
    };
    setFieldPhotos((prev) => [newPhoto, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);

    setAuditLog((prev) => [
      {
        id: `LOG-${Date.now().toString().slice(-3)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'S. Ramesh (Reviewer)',
        action: `Attached field verification photo with GPS stamp for ${selectedCase.id}`
      },
      ...prev
    ]);
  };

  const handleForgotPasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotMfaSent) {
      setForgotMfaSent(true);
    } else {
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotMfaSent(false);
        setResetSuccess(false);
      }, 2500);
    }
  };

  return (
    <div className="portal-backdrop" role="dialog" aria-modal="true" aria-labelledby="portal-title">
      <section className="investigator-portal">
        {/* Portal Header */}
        <header className="portal-header">
          <div className="portal-brand">
            <span className="portal-mark">
              <ShieldCheck size={17} />
            </span>
            <div>
              <span className="eyebrow">SIH26102 / RESTRICTED AUDIT PORTAL</span>
              <strong id="portal-title">MPLAD Sentinel Investigator Engine</strong>
            </div>
          </div>
          <div className="portal-header-actions">
            {signedIn && (
              <>
                <button
                  className={`portal-onboarding-trigger cursor-target ${lowBandwidthMode ? 'active' : ''}`}
                  onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
                  title="Toggle low-bandwidth mode for rural field officers"
                >
                  {lowBandwidthMode ? <WifiOff size={14} /> : <Wifi size={14} />} {lowBandwidthMode ? 'Low Bandwidth' : 'Standard Bandwidth'}
                </button>
                <button
                  className="portal-onboarding-trigger cursor-target"
                  onClick={() => {
                    setOnboardingStep(1);
                    setShowOnboarding(true);
                  }}
                  title="View onboarding guide"
                >
                  <HelpCircle size={15} /> Orientation Guide
                </button>
              </>
            )}
            <button className="portal-close cursor-target" onClick={onClose} aria-label="Close investigator portal">
              Close ×
            </button>
          </div>
        </header>

        {/* First-Time Investigator Onboarding Modal */}
        {showOnboarding && (
          <div className="onboarding-overlay">
            <div className="onboarding-card">
              <div className="onboarding-header">
                <span className="eyebrow">STEP {onboardingStep} OF 3 / AUDITOR ORIENTATION</span>
                <button onClick={() => setShowOnboarding(false)} className="onboarding-close">
                  <X size={16} />
                </button>
              </div>

              {onboardingStep === 1 && (
                <div className="onboarding-body">
                  <div className="onboarding-icon">
                    <UserCheck size={28} />
                  </div>
                  <h3>Jurisdiction Scope Confirmed</h3>
                  <p>Your provisioned identity has been assigned to the following audit scope:</p>
                  <div className="onboarding-scope-box">
                    <div>
                      <span>State:</span> <strong>Karnataka</strong>
                    </div>
                    <div>
                      <span>District:</span> <strong>Bengaluru Urban</strong>
                    </div>
                    <div>
                      <span>Constituency:</span> <strong>Bengaluru South (PC-26)</strong>
                    </div>
                    <div>
                      <span>Data Baseline:</span> <strong>eSAKSHI (01 Apr 2023 – Present)</strong>
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="onboarding-body">
                  <div className="onboarding-icon">
                    <FileCheck2 size={28} />
                  </div>
                  <h3>Explainable Risk Scoring</h3>
                  <p>Every flagged project displays a 0–100 risk score backed by five auditable detection engines:</p>
                  <ul className="onboarding-engine-list">
                    <li>
                      <strong>Financial Mismatch (30%):</strong> Benford's law & price benchmark outliers.
                    </li>
                    <li>
                      <strong>Duplicate/Ghost Works (25%):</strong> Description & geo-coordinate clustering.
                    </li>
                    <li>
                      <strong>Delay & SLA Breach (20%):</strong> Days elapsed since sanction vs. physical progress.
                    </li>
                    <li>
                      <strong>Compliance Check (15%):</strong> Mandatory SC/ST quota enforcement.
                    </li>
                    <li>
                      <strong>Agency Graph (10%):</strong> Contractor-vendor concentration networks.
                    </li>
                  </ul>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="onboarding-body">
                  <div className="onboarding-icon">
                    <QrCode size={28} />
                  </div>
                  <h3>Mandatory MFA & Audit Trail</h3>
                  <p>All case reviews, status transitions, and field evidence attachments are signed and logged:</p>
                  <div className="onboarding-mfa-preview">
                    <div className="qr-sim">
                      <QrCode size={48} />
                    </div>
                    <div>
                      <strong>TOTP Authenticator Paired</strong>
                      <p>SMS / Authenticator app OTP required on every login. Session auto-expires after 15 minutes of inactivity.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="onboarding-footer">
                <button
                  className="text-link cursor-target"
                  onClick={() => setShowOnboarding(false)}
                >
                  Skip Orientation
                </button>
                <div className="onboarding-nav-btns">
                  {onboardingStep > 1 && (
                    <button
                      className="portal-secondary-btn cursor-target"
                      onClick={() => setOnboardingStep((s) => s - 1)}
                    >
                      Back
                    </button>
                  )}
                  {onboardingStep < 3 ? (
                    <button
                      className="button-coral cursor-target"
                      onClick={() => setOnboardingStep((s) => s + 1)}
                    >
                      Next Step <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      className="button-coral cursor-target"
                      onClick={() => setShowOnboarding(false)}
                    >
                      Start Reviewing <CheckCircle2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step-Up Authentication Modal for High-Stakes Fraud Declaration */}
        {pendingFraudCaseId && (
          <div className="onboarding-overlay">
            <div className="onboarding-card step-up-card">
              <div className="onboarding-header">
                <span className="eyebrow">STEP-UP RE-AUTHENTICATION MANDATORY</span>
                <button onClick={() => setPendingFraudCaseId(null)} className="onboarding-close">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={confirmStepUpAuth} className="step-up-form">
                <div className="step-up-icon">
                  <ShieldAlert size={32} color="var(--coral)" />
                </div>
                <h3>Confirm High-Stakes Fraud Flag</h3>
                <p>
                  Declaring case <strong>{pendingFraudCaseId}</strong> as <em>"Confirmed Fraud"</em> generates a statutory escalation log for CAG / MoSPI investigation.
                  Re-enter your password to authorize this action.
                </p>

                <label className="step-up-label">
                  Re-Enter Password / Passcode
                  <input
                    type="password"
                    value={stepUpPassword}
                    onChange={(e) => setStepUpPassword(e.target.value)}
                    placeholder="Enter account password"
                    autoFocus
                    required
                  />
                </label>

                {stepUpError && <p className="step-up-error">{stepUpError}</p>}

                <div className="step-up-actions">
                  <button
                    type="button"
                    className="portal-secondary-btn cursor-target"
                    onClick={() => setPendingFraudCaseId(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button-coral cursor-target">
                    Authorize Fraud Flag <ShieldCheck size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="onboarding-overlay">
            <div className="onboarding-card">
              <div className="onboarding-header">
                <span className="eyebrow">PASSWORD RESET VIA MANDATORY OTP</span>
                <button onClick={() => setShowForgotPassword(false)} className="onboarding-close">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="onboarding-body">
                <h3>Forgot Password Recovery</h3>
                <p>Password reset requires 2-factor OTP verification to prevent unauthorized account access.</p>

                {resetSuccess ? (
                  <div className="mfa-step-container">
                    <CheckCircle2 size={32} color="var(--coral)" />
                    <p>Password reset link sent to official email! Follow instructions in message.</p>
                  </div>
                ) : (
                  <>
                    <label>
                      Official @gov.in / @nic.in Email
                      <input
                        type="email"
                        value={forgotEmail || email}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="s.ramesh@nic.in"
                        required
                      />
                    </label>

                    {forgotMfaSent && (
                      <label>
                        Enter 6-Digit Verification OTP
                        <input
                          inputMode="numeric"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value)}
                          placeholder="e.g. 849201"
                          maxLength={6}
                          required
                        />
                      </label>
                    )}

                    <div className="onboarding-footer" style={{ marginTop: '1.5rem', padding: 0 }}>
                      <button
                        type="button"
                        className="text-link cursor-target"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="button-coral cursor-target">
                        {forgotMfaSent ? 'Verify OTP & Send Reset Link' : 'Send Verification OTP'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

        {/* State A: Unauthenticated Login / Provisioning Flow */}
        {!signedIn ? (
          <div className="portal-login-layout">
            <div className="portal-login-copy">
              <span className="eyebrow">INVITE-ONLY GOVERNMENT PROVISIONING</span>
              <h2>
                Review what the public view <em>cannot show.</em>
              </h2>
              <p>
                District Reviewers, MoSPI Auditors, and CAG-affiliated officers enter through provisioned government identities.
                Public users access transparency analytics without login; investigator capabilities require auditable, role-gated access.
              </p>

              <div className="portal-tier-badge">
                <UserCog size={16} />
                <span>Selected Privilege Tier: <strong>{userRole} (Tier 2/3)</strong></span>
              </div>

              <div className="portal-trust">
                <LockKeyhole size={17} />
                <span>RESTRICTED AUDIT SYSTEM. All login attempts, failed attempts, and data queries are recorded in an append-only audit trail.</span>
              </div>

              <div className="portal-demo-creds">
                <span className="eyebrow">DEMO PROVISIONED IDENTITY</span>
                <p>Official Email: <code>s.ramesh@nic.in</code></p>
                <p>Role: <code>District Reviewer (Bengaluru South PC-26)</code></p>
                <p>MFA Target: <code>SMS to +91 ••••••9021 / TOTP Authenticator</code></p>
              </div>

              {/* SSO Placeholder Mention */}
              <div className="sso-placeholder-box">
                <BadgeCheck size={16} color="var(--ice)" />
                <span>Production Mode: Integrates with <strong>Parichay / Digital India Government SSO</strong></span>
              </div>
            </div>

            <form className="portal-login-form" onSubmit={handleLogin}>
              <div className="form-header">
                <h3>Investigator Authentication</h3>
                <small>Enter your provisioned @gov.in / @nic.in official email</small>
              </div>

              {/* Account Locked Alert */}
              {accountLocked && (
                <div className="alert-locked-box">
                  <AlertOctagon size={20} color="var(--coral)" />
                  <div>
                    <strong>ACCOUNT TEMPORARILY LOCKED</strong>
                    <p>3 failed OTP attempts detected. System Administrator notified of credential-stuffing attempt.</p>
                  </div>
                </div>
              )}

              {/* Invalid Domain Alert */}
              {domainError && (
                <div className="alert-domain-box">
                  <AlertTriangle size={18} color="var(--coral)" />
                  <span>Access Restricted: Only verified <strong>@gov.in</strong> / <strong>@nic.in</strong> / <strong>@mospi.gov.in</strong> email domains permitted.</span>
                </div>
              )}

              <label>
                Official Email Domain
                <div className="input-domain-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="name@district.gov.in"
                    required
                  />
                  {isGovDomain && <span className="domain-valid-check"><CheckCircle2 size={16} color="var(--coral)" /> Verified Domain</span>}
                </div>
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set during account activation"
                  required
                />
              </label>

              <label>
                Assigned Role / Privilege Scope
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="role-select"
                >
                  <option value="District Reviewer">District Reviewer (Read / Case Action / Field Evidence)</option>
                  <option value="MoSPI Auditor">MoSPI Auditor (Statewide / National Audit Review)</option>
                  <option value="System Admin">System Admin (Full Provisioning & Audit Log Management)</option>
                </select>
              </label>

              {/* MFA OTP Verification Step */}
              {showMfa && (
                <div className="mfa-step-container">
                  <div className="mfa-header">
                    <span className="eyebrow">STEP 2 / MANDATORY 2-FACTOR OTP</span>
                    <p>OTP sent via SMS to registered mobile ending in <strong>••••9021</strong></p>
                  </div>

                  <label>
                    Enter 6-Digit One-Time Password
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 849201"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                  </label>

                  {/* Demo OTP Quick Autofill Button */}
                  <div className="mfa-autofill-bar">
                    <button
                      type="button"
                      className="demo-autofill-btn cursor-target"
                      onClick={() => setOtp('849201')}
                    >
                      <Smartphone size={13} /> Auto-fill Demo OTP (849201)
                    </button>
                    <small className="attempts-text">{otpAttemptsLeft} attempts remaining</small>
                  </div>

                  <div className="mfa-timer-row">
                    <span>
                      <Clock size={13} /> Resend OTP in {mfaTimer}s
                    </span>
                    <button
                      type="button"
                      disabled={mfaTimer > 0}
                      onClick={() => setMfaTimer(30)}
                      className="resend-btn"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              )}

              {/* CAPTCHA & Security Badge */}
              <div className="captcha-badge-row">
                <div className="captcha-box">
                  <CheckCircle2 size={15} color="var(--coral)" />
                  <span>reCAPTCHA v3 Enterprise Passed</span>
                </div>
                <button
                  type="button"
                  className="forgot-pass-link cursor-target"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                className="button-coral portal-submit cursor-target"
                type="submit"
                disabled={!isGovDomain || accountLocked}
              >
                {showMfa ? 'Verify OTP & Access Dashboard' : 'Continue to Mandatory MFA'}
                <ChevronRight size={16} />
              </button>

              <div className="security-check-footer">
                <span>
                  <ShieldCheck size={13} /> RBAC & TLS 1.3 Secured
                </span>
                <span>Audit Trail: Active</span>
              </div>
            </form>
          </div>
        ) : (
          /* State B: Authenticated Post-Login Investigator Dashboard */
          <div className={`portal-dashboard ${lowBandwidthMode ? 'low-bandwidth' : ''}`}>
            {/* Scoped Identity Header */}
            <div className="portal-scope">
              <div>
                <span className="eyebrow">AUTHENTICATED SESSION / {userRole.toUpperCase()}</span>
                <h2 id="portal-dashboard-title">
                  Bengaluru South <em>review queue.</em>
                </h2>
                <p>
                  Jurisdiction Scope: Karnataka · Bengaluru South constituency (PC-26) · Officer: S. Ramesh (GOV-KA-8831)
                </p>
              </div>

              <div className="portal-session">
                <div className="session-time-badge">
                  <span className="console-dot" /> SESSION EXPIRES: {formattedSessionTime}
                </div>
                <small>s.ramesh@nic.in · MFA Verified · IP: 14.139.12.5</small>
              </div>
            </div>

            {/* Metric Summary Bar */}
            <div className="portal-summary">
              <div className="metric-box">
                <span>NEW FLAGS</span>
                <strong>08</strong>
                <small>since last login</small>
              </div>
              <div className="metric-box">
                <span>UNDER REVIEW</span>
                <strong>14</strong>
                <small>across assigned scope</small>
              </div>
              <div className="metric-box">
                <span>RESOLVED</span>
                <strong>06</strong>
                <small>this month</small>
              </div>
              <div className="portal-alert metric-box alert-box">
                <Bell size={17} />
                <span>
                  <strong>2 HIGH-RISK ALERTS</strong>
                  <br />
                  <small>score above 80/100 threshold</small>
                </span>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="portal-grid">
              {/* Left Main Column: Queue & Case Details */}
              <div className="portal-queue">
                <div className="portal-queue-head">
                  <div>
                    <span className="eyebrow">PRIORITIZED CASE QUEUE</span>
                    <h3>Flagged Projects in Jurisdiction</h3>
                  </div>
                  <button className="portal-filter-button cursor-target">
                    <SlidersHorizontal size={15} /> Active Scope Filters
                  </button>
                </div>

                {/* Filters */}
                <div className="portal-filters">
                  <label className="portal-search">
                    <Search size={14} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search ID, title, or district..."
                    />
                  </label>

                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option>All statuses</option>
                    <option>New</option>
                    <option>Under review</option>
                    <option>Confirmed Fraud</option>
                    <option>False Positive</option>
                  </select>

                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option>All signals</option>
                    <option>Duplicate / ghost</option>
                    <option>Delay / execution</option>
                    <option>Agency graph</option>
                    <option>Financial mismatch</option>
                    <option>Compliance breach</option>
                  </select>
                </div>

                {/* Queue List */}
                <div className="portal-queue-list">
                  {filteredQueue.map((item) => (
                    <article
                      className={`portal-case ${selectedCaseId === item.id ? 'active-case' : ''}`}
                      key={item.id}
                      onClick={() => setSelectedCaseId(item.id)}
                    >
                      <div className="portal-score" data-score={item.score >= 80 ? 'high' : 'watch'}>
                        <strong>{item.score}</strong>
                        <span>/100</span>
                      </div>

                      <div className="portal-case-copy">
                        <div className="case-meta-row">
                          <span className="eyebrow">{item.id}</span>
                          <span className={`status-pill status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {item.status}
                          </span>
                          <span className="cost-tag">{item.cost}</span>
                        </div>
                        <h4>{item.title}</h4>
                        <p>
                          {item.place} · <em>{item.category}</em>
                        </p>
                        <small>
                          <span className="portal-reason-dot" />
                          {item.reason}
                        </small>
                      </div>

                      <div className="case-action-column">
                        <select
                          className="status-dropdown"
                          value={item.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChangeRequest(item.id, e.target.value as CaseStatus);
                          }}
                        >
                          <option value="New">New</option>
                          <option value="Under review">Under Review</option>
                          <option value="Confirmed Fraud">Confirmed Fraud (Step-Up Auth)</option>
                          <option value="False Positive">False Positive</option>
                        </select>
                        <button className="portal-case-action" aria-label={`Inspect ${item.id}`}>
                          Inspect <ChevronRight size={15} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Right Column: Case Drilldown & Field Evidence Tool */}
              <aside className="portal-map-panel">
                {/* Active Case Breakdown Widget */}
                <div className="active-case-card">
                  <div className="active-case-header">
                    <span className="eyebrow">SELECTED CASE ANALYSIS</span>
                    <h4>{selectedCase.id}: {selectedCase.title}</h4>
                    <span className="case-place">{selectedCase.place}</span>
                  </div>

                  <div className="engine-breakdown">
                    <span className="eyebrow">5-ENGINE REASON BREAKDOWN</span>
                    <div className="breakdown-bar-list">
                      <div>
                        <span>Financial (30%)</span>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: `${(selectedCase.breakdown.financial / 30) * 100}%` }} /></div>
                        <small>{selectedCase.breakdown.financial}/30</small>
                      </div>
                      <div>
                        <span>Duplicate (25%)</span>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: `${(selectedCase.breakdown.duplicate / 25) * 100}%` }} /></div>
                        <small>{selectedCase.breakdown.duplicate}/25</small>
                      </div>
                      <div>
                        <span>Delay (20%)</span>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: `${(selectedCase.breakdown.delay / 20) * 100}%` }} /></div>
                        <small>{selectedCase.breakdown.delay}/20</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scoped Jurisdiction Map Widget */}
                <div className="portal-map">
                  <img src="/images/mplad-district-texture.jpg" alt="Jurisdiction map texture" />
                  <i className="portal-map-spot spot-one" />
                  <i className="portal-map-spot spot-two" />
                  <div className="portal-map-label">BENGALURU SOUTH / JURISDICTION MAP</div>
                </div>
                <div className="portal-map-foot">
                  <MapPinned size={15} /> Scoped Anomaly Heatmap · Bengaluru Urban (12.9716° N, 77.5946° E)
                </div>

                {/* Field Evidence Attachment Tool */}
                <div className="field-evidence-box">
                  <div className="evidence-head">
                    <Camera size={16} />
                    <span>Field Verification Evidence</span>
                  </div>

                  {uploadSuccess && (
                    <div className="upload-alert-success">
                      <CheckCircle2 size={14} /> Photo uploaded & GPS stamped!
                    </div>
                  )}

                  <button className="portal-upload cursor-target" onClick={handleSimulatedPhotoUpload}>
                    <Camera size={16} /> Upload Site Verification Photo
                  </button>

                  <div className="photo-list">
                    {fieldPhotos.map((photo, idx) => (
                      <div className="photo-item" key={idx}>
                        <div>
                          <strong>{photo.name}</strong>
                          <small>{photo.timestamp}</small>
                        </div>
                        <span className="gps-tag">
                          <MapPin size={11} /> {photo.location}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Immutable Audit Log Feed */}
                <div className="audit-log-box">
                  <div className="audit-head">
                    <History size={15} />
                    <span>Audit Trail Log</span>
                  </div>
                  <div className="audit-list">
                    {auditLog.slice(0, 4).map((log) => (
                      <div className="audit-item" key={log.id}>
                        <small>{log.time}</small>
                        <span>{log.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>

            {/* Mobile Bottom Tab Navigation */}
            <nav className="portal-mobile-nav" aria-label="Investigator navigation">
              <button
                className={mobileTab === 'queue' ? 'active' : ''}
                onClick={() => setMobileTab('queue')}
              >
                <CheckCircle2 size={16} /> Queue
              </button>
              <button
                className={mobileTab === 'map' ? 'active' : ''}
                onClick={() => setMobileTab('map')}
              >
                <MapPinned size={16} /> Map
              </button>
              <button
                className={mobileTab === 'evidence' ? 'active' : ''}
                onClick={() => setMobileTab('evidence')}
              >
                <Camera size={16} /> Evidence
              </button>
              <button
                className={mobileTab === 'log' ? 'active' : ''}
                onClick={() => setMobileTab('log')}
              >
                <History size={16} /> Audit Log
              </button>
              <button
                onClick={() => {
                  setSignedIn(false);
                  setShowMfa(false);
                }}
              >
                <LogOut size={16} /> Exit
              </button>
            </nav>
          </div>
        )}
      </section>
    </div>
  );
}
