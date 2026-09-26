import React, { useState } from 'react';
import { useCaseContext } from '../../CaseContext';
import { canApprove, getTierLabel } from './graphLogic';
import { getText } from '../regional-language/translations';

const actions = ['Share bank account details', 'Share insurance policy information', 'Initiate loan closure', 'Download tax documents'];

export const ApprovalFlow = () => {
  const { currentUser, language } = useCaseContext();
  const text = getText(language);
  const [action, setAction] = useState(actions[0]);
  const eligible = canApprove(currentUser, { title: action });
  return <section className="af-container panel"><div className="panel-heading"><div><p className="eyebrow">{text.sensitive}</p><h3>{text.accessTitle}</h3></div><span className={eligible ? 'status-badge status-badge-completed' : 'status-badge status-badge-pending_approval'}>{eligible ? text.canApprove : text.approvalNeeded}</span></div><p className="detail-copy">This view changes with the person selected in the header.</p><label className="form-field">Action<select value={action} onChange={event => setAction(event.target.value)}>{actions.map(value => <option key={value}>{value}</option>)}</select></label><div className={`approval-result ${eligible ? 'approval-result-good' : ''}`}><strong>{currentUser?.name || 'No family member selected'}</strong><span>{currentUser ? `${getTierLabel(currentUser.tier)} · ${currentUser.verified ? text.verified : text.unverified}` : 'Add a family member to continue.'}</span><p>{eligible ? text.canApprove : text.approvalNeeded}</p></div></section>;
};
