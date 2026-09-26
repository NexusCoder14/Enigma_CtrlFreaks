import React, { useState } from 'react';
import { useCaseContext } from '../../CaseContext';
import { QRCodeSVG } from 'qrcode.react';

export const SecureShare = () => {
  const { familyMembers, createShareLink, sharedLinks, revokeShareLink } = useCaseContext();
  
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [permissions, setPermissions] = useState({
    caseDetails: true,
    financialSummary: false,
    timeline: false,
  });
  
  const selectedPerson = familyMembers.find(m => m.id === Number(selectedPersonId));
  const isTier1 = selectedPerson?.tier === 1 && selectedPerson?.verified;

  const handleGenerate = () => {
    if (!selectedPerson) return;
    createShareLink(selectedPerson, permissions);
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h2 className="page-title">Secure QR Share</h2>
        <p className="page-subtitle">Share case information securely via QR code.</p>
      </div>

      <div className="share-container">
        <div className="share-form-card">
          <h3>Create a new share link</h3>
          
          <div className="form-field" style={{ marginTop: '24px' }}>
            <label>Who is sharing this information?</label>
            <select value={selectedPersonId} onChange={e => setSelectedPersonId(e.target.value)}>
              <option value="">Select a family member...</option>
              {familyMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (Tier {m.tier} - {m.verified ? 'Verified' : 'Unverified'})
                </option>
              ))}
            </select>
          </div>

          {selectedPerson && !isTier1 && (
            <div className="share-warning">
              <span className="share-warning-icon">⚠</span>
              <p>As an unverified or Tier 2/3 member, you may only share basic case details. Sharing sensitive financial data requires approval from a verified Tier 1 member.</p>
            </div>
          )}

          {selectedPerson && (
            <div className="share-options" style={{ marginTop: '24px' }}>
              <label className="checkbox-label">
                <input type="checkbox" checked={permissions.caseDetails} onChange={() => togglePermission('caseDetails')} />
                <span>Basic Case Details (Name, Status)</span>
              </label>
              <label className={`checkbox-label ${!isTier1 ? 'checkbox-disabled' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={permissions.financialSummary} 
                  onChange={() => togglePermission('financialSummary')} 
                  disabled={!isTier1}
                />
                <span>Financial Summary (Ledger Items) {isTier1 ? '' : '🔒'}</span>
              </label>
              <label className={`checkbox-label ${!isTier1 ? 'checkbox-disabled' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={permissions.timeline} 
                  onChange={() => togglePermission('timeline')} 
                  disabled={!isTier1}
                />
                <span>Timeline & Deadlines {isTier1 ? '' : '🔒'}</span>
              </label>
            </div>
          )}

          <div style={{ marginTop: '32px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleGenerate} 
              disabled={!selectedPerson}
            >
              Generate QR Code
            </button>
          </div>
        </div>

        <div className="share-list">
          <h3>Active Share Links</h3>
          {sharedLinks.filter(l => l.active).map(link => {
            const baseUrl = (process.env.REACT_APP_PUBLIC_URL || window.location.origin).replace(/\/$/, '');
            const shareUrl = `${baseUrl}/shared/${link.id}`;
            return (
              <div key={link.id} className="share-item-card">
                <div className="share-item-header">
                  <div>
                    <p className="share-item-title">Shared by {link.createdBy.name}</p>
                    <p className="share-item-date">{new Date(link.createdAt).toLocaleString()}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => revokeShareLink(link.id)}>Revoke</button>
                </div>
                
                <div className="share-qr-preview">
                  <div className="qr-box">
                    <QRCodeSVG value={shareUrl} size={120} />
                  </div>
                  <div className="share-link-info">
                    <p className="text-muted" style={{ fontSize: '13px' }}>Scan to view shared info</p>
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-link" style={{ wordBreak: 'break-all' }}>
                      {shareUrl}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
          {sharedLinks.filter(l => l.active).length === 0 && (
            <p className="text-muted" style={{ marginTop: '16px' }}>No active share links.</p>
          )}
        </div>
      </div>
    </div>
  );
};
