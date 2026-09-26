import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCaseContext } from '../../CaseContext';
import { getText } from '../regional-language/translations';
import { getTierLabel } from './graphLogic';

const relationships = ['Spouse', 'Child', 'Parent', 'Sibling', 'In-law', 'Cousin', 'Other'];

export const FamilySetup = () => {
  const { caseInfo, familyMembers, addFamilyMember, language } = useCaseContext();
  const text = getText(language);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', relationship: 'Spouse' });
  const [showForm, setShowForm] = useState(false);
  const deceasedName = caseInfo?.name || 'Your family member';

  const handleSubmit = event => {
    event.preventDefault();
    if (!formData.name.trim()) return;
    addFamilyMember(formData);
    setFormData({ name: '', relationship: 'Spouse' });
    setShowForm(false);
  };

  return <div className="feature-page family-page">
    <div className="page-header"><p className="eyebrow">Together, gently</p><h2 className="page-title">{text.familyTitle}</h2><p className="page-subtitle">{text.familyCopy}</p></div>
    <div className="family-circle" style={{ '--member-count': Math.max(familyMembers.length, 1) }}>
      <div className="family-orbit" />
      <div className="deceased-node"><span>{deceasedName.charAt(0)}</span><strong>{deceasedName}</strong><small>Deceased</small></div>
      {familyMembers.length === 0 ? <div className="empty-family-note"><span className="empty-icon">◌</span><p>{text.emptyFamily}</p></div> : familyMembers.map((member, index) => <button key={member.id} className={`family-node family-node-${index + 1}`} onClick={() => setSelectedMember(member)}><span className="member-avatar">{member.name.charAt(0)}</span><strong>{member.name}</strong><small>{member.relationship}</small><em className={member.verified ? 'verified-pill' : 'unverified-pill'}>{member.verified ? text.verified : text.unverified}</em></button>)}
    </div>
    {selectedMember && <div className="member-detail panel"><div className="panel-heading"><div><p className="eyebrow">Family member</p><h3>{selectedMember.name}</h3></div><button className="icon-button" onClick={() => setSelectedMember(null)} aria-label="Close">×</button></div><span className={selectedMember.verified ? 'status-badge status-badge-completed' : 'status-badge status-badge-pending_approval'}>{selectedMember.verified ? text.verified : text.unverified}</span><p className="detail-copy">{selectedMember.verified ? `Relationship supported with ${selectedMember.confidence}% confidence.` : 'We could not confirm this from the documents provided. Sensitive actions will need approval from a verified family member.'}</p><p className="member-access"><strong>{text.tier} {selectedMember.tier}</strong><br />{getTierLabel(selectedMember.tier)}</p><button className="btn btn-ghost" onClick={() => setSelectedMember(null)}>Close</button></div>}
    <div className="family-actions">{!showForm ? <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ {text.addFamily}</button> : <form className="panel family-form" onSubmit={handleSubmit}><div className="panel-heading"><h3>{text.addFamily}</h3><button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Close">×</button></div><label>Name<input value={formData.name} onChange={event => setFormData({ ...formData, name: event.target.value })} placeholder="Full name" required /></label><label>Relationship<select value={formData.relationship} onChange={event => setFormData({ ...formData, relationship: event.target.value })}>{relationships.map(value => <option key={value}>{value}</option>)}</select></label><div className="form-actions"><button className="btn btn-primary" type="submit">Add member</button><button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button></div></form>}<Link className="quiet-link" to="/documents">Review case documents →</Link></div>
  </div>;
};
