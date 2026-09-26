import React, { useState } from 'react';
import { useCaseContext } from '../../CaseContext';
import { getText } from '../regional-language/translations';

// ConfidenceItem — An expandable card showing one financial item's analysis result.

const statusConfig = {
  CONFIRMED: { label: '✓ Confirmed', className: 'status-confirmed' },
  PARTIAL:   { label: '⚠ Needs review', className: 'status-partial' },
  MISSING:   { label: '○ Missing', className: 'status-missing' },
};

export const ConfidenceItem = ({ item }) => {
  const { getClaimPack, updateConfidenceItem, language } = useCaseContext();
  const text = getText(language);
  const [expanded, setExpanded] = useState(false);
  const [claimPack, setClaimPack] = useState(null);
  const [loading, setLoading] = useState(false);

  const config = statusConfig[item.status] || statusConfig.MISSING;
  const localizedStatus = item.status === 'CONFIRMED' ? text.confirmed : item.status === 'MISSING' ? text.needsVerification : text.needsVerification;

  const handleGenerate = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const pack = await getClaimPack(item.name || item.title);
      setClaimPack(pack);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className={`ci-card ${expanded ? 'ci-card-expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
      <div className="ci-header">
        <div className="ci-header-left">
          <span className={`badge ${config.className}`}>{item.status === 'CONFIRMED' ? '✓ ' : '⚠ '}{localizedStatus}</span>
          <span className="badge badge-neutral">{item.category}</span>
        </div>
        <span className="ci-expand-icon">{expanded ? '▾' : '▸'}</span>
      </div>

      <h4 className="ci-title">{item.title}</h4>
      <div className="ledger-meta"><span>{item.institution || 'Institution not identified'}</span><strong>{item.amount ? `₹${Number(item.amount).toLocaleString('en-IN')}` : 'Amount not found'}</strong></div>

      {item.confidence > 0 && (
        <div className="ci-confidence-row">
          <span className="ci-confidence-label">Confidence: {item.confidence}%</span>
          <div className="bar-track">
            <div className={`bar-fill ${config.className}`} style={{ width: `${item.confidence}%` }} />
          </div>
        </div>
      )}

      {expanded && (
        <div className="ci-details">
          {item.status !== 'CONFIRMED' && <div className="resolution-note"><strong>Why this needs a look</strong><p>{item.missingInfo?.[0] || 'The documents give us a useful lead, but not the full picture yet.'}</p><span>{item.suggestedAction}</span><div className="ledger-actions"><button className="btn btn-primary btn-sm" onClick={event => { event.stopPropagation(); updateConfidenceItem(item.id, 'CONFIRMED'); }}>Confirm this item</button><button className="btn btn-ghost btn-sm" onClick={event => { event.stopPropagation(); updateConfidenceItem(item.id, 'MISSING'); }}>This isn't right</button></div></div>}
          {item.sourceDocument && (
            <div className="ci-detail-section">
              <p className="detail-label">Source document</p>
              <p className="source-chip">📄 {item.sourceDocument}</p>
            </div>
          )}

          {item.evidence && item.evidence.length > 0 && (
            <div className="ci-detail-section">
              <p className="detail-label">Evidence found</p>
              <ul className="evidence-list">
                {item.evidence.map((e, i) => (
                  <li key={i} className="evidence-item evidence-found">✓ {e}</li>
                ))}
              </ul>
            </div>
          )}

          {item.missingInfo && item.missingInfo.length > 0 && (
            <div className="ci-detail-section">
              <p className="detail-label">Missing information</p>
              <ul className="evidence-list">
                {item.missingInfo.map((m, i) => (
                  <li key={i} className="evidence-item evidence-missing">⚠ {m}</li>
                ))}
              </ul>
            </div>
          )}

          {item.suggestedAction && (
            <div className="ci-detail-section ci-suggested-action">
              <p className="detail-label">Recommended action</p>
              <p className="ci-detail-value">{item.suggestedAction}</p>
            </div>
          )}

          <div className="ci-detail-section" style={{ marginTop: '16px' }}>
            {!claimPack ? (
              <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Claim Pack'}
              </button>
            ) : (
              <div style={{ background: 'var(--color-success-soft)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <h5 style={{ marginBottom: '12px' }}>CLAIM PACK GENERATED</h5>
                <p className="detail-label">Known Information</p>
                <ul className="evidence-list" style={{ marginBottom: '12px' }}>
                  {Object.entries(claimPack.knownInformation || {}).map(([k, v]) => (
                    <li key={k} className="evidence-item" style={{ fontSize: '13px' }}>{k}: {v}</li>
                  ))}
                </ul>
                <p className="detail-label">Already Available</p>
                <ul className="evidence-list" style={{ marginBottom: '12px' }}>
                  {(claimPack.alreadyAvailable || []).map((m, i) => (
                    <li key={i} className="evidence-item evidence-found">✓ {m}</li>
                  ))}
                </ul>
                <p className="detail-label">Still Needed / Action Required</p>
                <ul className="evidence-list">
                  {(claimPack.stillNeeded || []).map((m, i) => (
                    <li key={i} className="evidence-item evidence-missing">⚠ {m}</li>
                  ))}
                  {(claimPack.possiblyNeeded || []).map((m, i) => (
                    <li key={i} className="evidence-item" style={{ color: 'var(--color-warning)' }}>○ {m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
