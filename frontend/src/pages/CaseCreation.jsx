import React, { useState } from 'react';
import { useCaseContext } from '../CaseContext';

export const Landing = ({ onStart }) => {
  const [mode, setMode] = useState('landing'); // landing, login, signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    // Mock login success
    onStart();
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    // Mock signup success
    onStart();
  };

  if (mode === 'login') {
    return (
      <div className="landing-page">
        <div className="case-creation-card">
          <h2>Log in to Nivaran</h2>
          <form onSubmit={handleLogin} className="case-form">
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Log in</button>
            <button type="button" className="btn btn-ghost" onClick={() => setMode('signup')}>Need an account? Sign up</button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div className="landing-page">
        <div className="case-creation-card">
          <h2>Create an account</h2>
          <form onSubmit={handleSignup} className="case-form">
            <div className="form-field">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Sign up</button>
            <button type="button" className="btn btn-ghost" onClick={() => setMode('login')}>Already have an account? Log in</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-logo">NIVARAN</h1>
        <p className="landing-tagline">Bringing clarity to what comes next.</p>
        <p className="landing-desc">
          Understand your family's financial affairs, one document at a time.
        </p>
        <div style={{display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px'}}>
          <button className="btn btn-primary btn-lg" onClick={() => setMode('signup')}>
            Get Started
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => setMode('login')} style={{background: 'rgba(255,255,255,0.1)', color: 'white'}}>
            Log in
          </button>
        </div>
        <p className="landing-footer-text" style={{marginTop: '40px'}}>
          Private · Secure · No data leaves your device
        </p>
      </div>
    </div>
  );
};

export const CaseCreation = ({ onComplete }) => {
  const { startCase } = useCaseContext();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [refName, setRefName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    startCase({ name: name.trim(), dateOfPassing: date, referenceName: refName.trim() || name.trim() });
    if (onComplete) onComplete();
  };

  return (
    <div className="case-creation-page">
      <div className="case-creation-card">
        <h2>Start a new case</h2>
        <p className="text-secondary">
          Enter the basic details of the person whose financial affairs you need to manage.
        </p>
        <form onSubmit={handleSubmit} className="case-form">
          <div className="form-field">
            <label>Name of the deceased</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
          </div>
          <div className="form-field">
            <label>Date of passing <span className="text-muted">(optional)</span></label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Case reference name <span className="text-muted">(optional)</span></label>
            <input type="text" value={refName} onChange={e => setRefName(e.target.value)} placeholder="e.g. Papa's financial closure" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            Continue to documents →
          </button>
        </form>
      </div>
    </div>
  );
};
