import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseContext } from '../../CaseContext';

const relationships = ['Spouse', 'Child', 'Parent', 'Sibling', 'In-law', 'Cousin', 'Other'];

export const LoginPage = () => {
  const { verifyFamilyIdentity, verificationStatus, verificationMessage } = useCaseContext();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [form, setForm] = useState({ name: '', relationship: 'Spouse', deceasedName: '' });
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState('');

  const submit = async event => {
    event.preventDefault();
    setLocalError('');
    if (!file) { setLocalError('Please upload a document that mentions your relationship.'); return; }
    const result = await verifyFamilyIdentity({ ...form, file });
    if (result.verified) navigate('/dashboard');
  };

  const checking = verificationStatus === 'checking';
  const needsDocument = verificationStatus === 'needs-document';
  return <main className="identity-page"><div className="identity-ornament" /><section className="identity-intro"><div className="identity-wordmark">NIVARAN <span>◌</span></div><p className="eyebrow">A private place for what comes next</p><h1>Let’s begin with your connection to the family.</h1><p>Tell us who you are and upload one document that helps us understand your relationship. Your information stays with this case.</p><div className="identity-trust"><span>01</span><div><strong>Tell us about yourself</strong><small>Name and relationship to your loved one</small></div><span>02</span><div><strong>Share one piece of evidence</strong><small>A nominee record, family certificate, or statement</small></div></div></section><section className="identity-card"><div className="identity-card-heading"><p className="eyebrow">Secure case access</p><h2>Who are you in this case?</h2><p>We’ll use this only to check your access level.</p></div><form onSubmit={submit}><label>Your full name<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Priya Sharma" required /></label><label>Relationship to the deceased<select value={form.relationship} onChange={event => setForm({ ...form, relationship: event.target.value })}>{relationships.map(value => <option key={value}>{value}</option>)}</select></label><label>Name of the deceased<input value={form.deceasedName} onChange={event => setForm({ ...form, deceasedName: event.target.value })} placeholder="e.g. Anil Sharma" required /></label><div className={`evidence-upload ${file ? 'has-file' : ''}`} onClick={() => fileInput.current?.click()}><input ref={fileInput} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={event => setFile(event.target.files?.[0] || null)} /><span className="upload-badge">{file ? '✓' : '+'}</span><div><strong>{file ? file.name : 'Upload a document to verify you'}</strong><small>{file ? 'Ready for AI review' : 'PDF, JPG, or PNG · nominee, family, or bank document'}</small></div>{file && <button type="button" className="remove-file" onClick={event => { event.stopPropagation(); setFile(null); }}>×</button>}</div>{(localError || verificationMessage) && <div className={`verification-message ${needsDocument || verificationStatus === 'error' ? 'verification-message-warning' : 'verification-message-good'}`}><strong>{needsDocument ? 'We need a little more evidence' : verificationStatus === 'error' ? 'We could not complete the check' : 'Relationship verified'}</strong><span>{localError || verificationMessage}</span></div>}<button className="btn btn-primary identity-submit" disabled={checking}>{checking ? 'Checking your document…' : 'Verify and continue →'}</button></form><p className="identity-footnote">Your access is based on the documents you share. You can add family members later.</p></section></main>;
};
