import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfidenceItem } from './ConfidenceItem';
import { useCaseContext } from '../../CaseContext';
import { getText } from '../regional-language/translations';

export const ConfidenceLedger = () => {
  const { confidenceItems, language } = useCaseContext();
  const text = getText(language);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const categories = useMemo(() => ['ALL', ...new Set(confidenceItems.map(item => item.category))], [confidenceItems]);
  const filtered = confidenceItems.filter(item => (statusFilter === 'ALL' || item.status === statusFilter) && (categoryFilter === 'ALL' || item.category === categoryFilter));
  const confirmed = confidenceItems.filter(item => item.status === 'CONFIRMED').length;
  const needingReview = confidenceItems.filter(item => item.status !== 'CONFIRMED').length;
  const confidence = confidenceItems.length ? Math.round(confidenceItems.reduce((sum, item) => sum + item.confidence, 0) / confidenceItems.length) : 0;

  return <div className="feature-page ledger-page"><div className="page-header"><p className="eyebrow">A second pair of eyes</p><h2 className="page-title">{text.ledgerTitle}</h2><p className="page-subtitle">{text.ledgerCopy}</p></div>{confidenceItems.length === 0 ? <div className="empty-panel"><span className="empty-icon">◌</span><h3>No financial items yet</h3><p>Upload a statement or policy and Nivaran will build this picture for you.</p><Link className="btn btn-primary" to="/documents">{text.upload}</Link></div> : <><div className="ledger-overview"><div><span className="overview-label">Overall confidence</span><strong>{confidence}%</strong><div className="confidence-track"><span style={{ width: `${confidence}%` }} /></div></div><div className="ledger-counts"><span><b>{confirmed}</b> {text.confirmed}</span><span><b>{needingReview}</b> {text.needsVerification}</span></div></div><div className="filter-row">{['ALL', 'CONFIRMED', 'PARTIAL', 'MISSING'].map(status => <button key={status} className={`filter-chip ${statusFilter === status ? 'filter-chip-active' : ''}`} onClick={() => setStatusFilter(status)}>{status === 'ALL' ? text.all : status === 'CONFIRMED' ? text.confirmed : text.needsVerification}</button>)}</div>{categories.length > 2 && <div className="filter-row category-filter">{categories.map(category => <button key={category} className={`filter-chip ${categoryFilter === category ? 'filter-chip-active' : ''}`} onClick={() => setCategoryFilter(category)}>{category === 'ALL' ? text.all : category}</button>)}</div>}<div className="ledger-list">{filtered.length ? filtered.map(item => <ConfidenceItem key={item.id} item={item} />) : <div className="empty-panel compact-empty"><span className="empty-icon">⌕</span><p>No items match these filters.</p></div>}</div></>}</div>;
};
