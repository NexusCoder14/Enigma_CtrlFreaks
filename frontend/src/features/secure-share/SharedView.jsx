import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCaseContext } from '../../CaseContext';
import { ConfidenceItem } from '../confidence-ledger/ConfidenceItem';
import { TimelineItem } from '../timeline/TimelineItem';

export const SharedView = () => {
  const { shareId } = useParams();
  const { sharedLinks, caseInfo: localCaseInfo, confidenceItems: localLedger, timelineEvents: localTasks } = useCaseContext();
  const localLink = sharedLinks.find(link => link.id === shareId && link.active);
  const [remoteShare, setRemoteShare] = useState(null);
  const [loading, setLoading] = useState(!localLink);

  useEffect(() => {
    if (localLink) return undefined;
    let cancelled = false;
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/share/${shareId}`)
      .then(response => { if (!response.ok) throw new Error('invalid'); return response.json(); })
      .then(data => { if (!cancelled) setRemoteShare(data); })
      .catch(() => { if (!cancelled) setRemoteShare(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [localLink, shareId]);

  if (loading) return <div className="empty-panel"><span className="empty-icon">◌</span><h3>Opening shared view</h3><p>Checking the secure link…</p></div>;
  if (!localLink && !remoteShare) return <div className="empty-panel"><span className="empty-icon">×</span><h3>Link unavailable</h3><p>This share link may have been revoked or has not reached the server yet.</p><Link to="/dashboard" className="btn btn-primary">Go to Nivaran</Link></div>;

  const link = localLink || remoteShare.link;
  const caseInfo = localLink?.caseInfo || remoteShare.caseInfo || localCaseInfo;
  const ledger = localLink?.ledgerItems || remoteShare.ledgerItems || localLedger;
  const tasks = localLink?.tasks || remoteShare.tasks || localTasks;
  const permissions = link.permissions || {};
  return <div className="feature-page shared-view-page"><div className="page-header"><p className="eyebrow">Authenticated share</p><h2>Shared case view</h2><p className="page-subtitle">Shared by {link.createdBy?.name || 'a family member'} on {new Date(link.createdAt).toLocaleDateString()}.</p></div>{permissions.caseDetails && <section className="panel share-section"><p className="eyebrow">Case details</p><h3>{caseInfo?.name || 'Family case'}</h3><p>{caseInfo?.referenceName || 'Financial closure case'}{caseInfo?.dateOfPassing ? ` · Date of passing ${caseInfo.dateOfPassing}` : ''}</p></section>}{permissions.financialSummary && <section className="share-section"><div className="section-heading"><div><p className="eyebrow">Financial summary</p><h3>{ledger.length} items in view</h3></div></div>{ledger.length ? <div className="ledger-list">{ledger.map(item => <ConfidenceItem key={item.id} item={item} />)}</div> : <div className="empty-panel"><p>No financial items were included.</p></div>}</section>}{permissions.timeline && <section className="share-section"><p className="eyebrow">Timeline</p>{tasks.length ? <div className="summary-list">{tasks.map(item => <TimelineItem key={item.id} item={item} onToggleComplete={() => {}} />)}</div> : <div className="empty-panel"><p>No timeline steps were included.</p></div>}</section>}</div>;
};
