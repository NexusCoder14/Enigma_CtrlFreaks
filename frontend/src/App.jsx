import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { CaseProvider, useCaseContext } from './CaseContext';
import { CaseCreation } from './pages/CaseCreation';
import { Dashboard } from './pages/Dashboard';
import { DocumentUpload } from './features/document-analysis/DocumentUpload';
import { ConfidenceLedger } from './features/confidence-ledger/ConfidenceLedger';
import { Timeline } from './features/timeline/Timeline';
import { FamilySetup } from './features/relationship-graph/FamilySetup';
import { ApprovalFlow } from './features/relationship-graph/ApprovalFlow';
import { SecureShare } from './features/secure-share/SecureShare';
import { SharedView } from './features/secure-share/SharedView';
import { LoginPage } from './features/identity-verification/LoginPage';
import { TaskRoadmap } from './features/task-roadmap/TaskRoadmap';
import { LanguageSelector } from './features/regional-language/LanguageSelector';
import { getText } from './features/regional-language/translations';
import './App.css';

const Sidebar = () => {
  const location = useLocation();
  const { caseInfo, caseStarted, language } = useCaseContext();
  const text = getText(language);
  const isActive = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link';
  
  if (!caseStarted) return null;

  return (
    <aside className="sidebar fade-in-left">
      <div className="sidebar-brand">
        <h1>NIVARAN</h1>
        <p className="brand-tagline">Clarity for what comes next</p>
      </div>
      
      <div className="sidebar-context">
        <p className="context-label">Case</p>
        <p className="context-value">{caseInfo?.name || 'Loading...'}</p>
        <span className="status-indicator">● Active</span>
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className={isActive('/dashboard')}>{text.overview}</Link>
        <Link to="/tasks" className={isActive('/tasks')}>{text.tasks}</Link>
        <Link to="/confidence" className={isActive('/confidence')}>{text.ledger}</Link>
        <Link to="/family" className={isActive('/family')}>{text.family}</Link>
        <Link to="/documents" className={isActive('/documents')}>{text.documents}</Link>
        <Link to="/share" className={isActive('/share')}>Share</Link>
      </nav>

      <div className="sidebar-footer">
        <div className="case-status">
          <p className="privacy-indicator">🔒 Private workspace</p>
          <p className="text-muted" style={{fontSize: '11px', marginTop: '4px'}}>AI reads documents through your connected server.</p>
        </div>
      </div>
    </aside>
  );
};

const Topbar = () => {
  const location = useLocation();
  const { caseStarted, familyMembers, currentUserId, setCurrentUserId, aiStatus, aiError, language } = useCaseContext();
  const text = getText(language);
  
  if (!caseStarted) return null;

  const titleMap = {
    '/dashboard': text.overview,
    '/documents': text.documents,
    '/tasks': text.tasks,
    '/confidence': text.ledger,
    '/family': text.family,
    '/timeline': 'Timeline',
    '/share': 'Secure Share'
  };

  const userName = familyMembers.find(m => m.id === currentUserId)?.name || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="topbar slide-down">
      <h2>{titleMap[location.pathname] || ''}</h2>
      <div className="topbar-right">
        <span className={`ai-connection ai-connection-${aiStatus}`} title={aiError || 'Groq AI is ready'}><span className="ai-connection-dot" />{aiStatus === 'analyzing' ? 'Reading with AI' : aiStatus === 'reconciling' ? 'Updating case' : aiStatus === 'error' ? 'AI needs attention' : 'AI ready'}</span>
        <LanguageSelector />
        <label className="user-switcher"><span>Viewing as</span><select value={currentUserId} onChange={event => setCurrentUserId(Number(event.target.value))}>{familyMembers.map(member => <option key={member.id} value={member.id}>{member.name} · Tier {member.tier}</option>)}</select></label>
        <span className="profile-indicator">{initials}</span>
      </div>
    </header>
  );
};

// Family tab combines the graph and approval flow
const FamilyTab = () => (
  <div className="fade-in-up">
    <FamilySetup />
    <div className="dash-divider" />
    <ApprovalFlow />
  </div>
);

const AppContent = () => {
  const { caseStarted } = useCaseContext();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className={`main-wrapper ${!caseStarted ? 'full-width' : ''}`}>
        <Topbar />
        <main className={`main-content ${!caseStarted ? 'no-padding center-content' : ''}`}>
          <Routes>
            {!caseStarted ? (
              <>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/create" element={<CaseCreation onComplete={() => navigate('/family')} />} />
                <Route path="/shared/:shareId" element={<div className="fade-in-up" style={{width: '100%'}}><SharedView /></div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/dashboard" element={<div className="fade-in-up"><Dashboard /></div>} />
                <Route path="/documents" element={<div className="fade-in-up"><DocumentUpload /></div>} />
                <Route path="/tasks" element={<div className="fade-in-up"><TaskRoadmap /></div>} />
                <Route path="/confidence" element={<div className="fade-in-up"><ConfidenceLedger /></div>} />
                <Route path="/family" element={<FamilyTab />} />
                <Route path="/timeline" element={<div className="fade-in-up"><Timeline /></div>} />
                <Route path="/share" element={<div className="fade-in-up"><SecureShare /></div>} />
                <Route path="/shared/:shareId" element={<div className="fade-in-up"><SharedView /></div>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <CaseProvider>
      <Router>
        <AppContent />
      </Router>
    </CaseProvider>
  );
}

export default App;
