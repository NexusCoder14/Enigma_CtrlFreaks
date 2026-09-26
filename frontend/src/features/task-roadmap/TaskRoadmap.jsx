import React, { useMemo, useState } from 'react';
import { useCaseContext } from '../../CaseContext';
import { getText } from '../regional-language/translations';

const effortRank = { quick: 0, moderate: 1, heavy: 2 };
const capacityLimit = { quick: 0, moderate: 1, heavy: 2 };
const statusKey = { NOT_STARTED: 'notStarted', IN_PROGRESS: 'inProgress', PENDING_APPROVAL: 'pendingApproval', COMPLETED: 'completed' };

export const TaskRoadmap = () => {
  const { timelineEvents: tasks, updateTask, submitTaskForApproval, approveTask, currentUser, language } = useCaseContext();
  const text = getText(language);
  const [capacity, setCapacity] = useState('quick');
  const [delegateTask, setDelegateTask] = useState(null);
  const [copied, setCopied] = useState(false);

  const visibleTasks = useMemo(() => tasks.filter(task => effortRank[task.effort] <= capacityLimit[capacity]).sort((a, b) => effortRank[a.effort] - effortRank[b.effort] || (a.status === 'COMPLETED' ? 1 : -1)), [capacity, tasks]);
  const draftFor = task => `Hi, could you help with “${task.title}” for ${task.institution}? ${task.description} We have ${(task.requiredDocuments || []).join(', ') || 'the case documents'} ready.`;
  const completeTask = task => {
    if (task.status === 'PENDING_APPROVAL' && currentUser?.tier === 1 && currentUser.verified) {
      approveTask(task.id);
    } else if (task.requiresApproval && (!currentUser?.verified || currentUser.tier > 1)) {
      submitTaskForApproval(task.id, currentUser?.name || 'Family member');
    } else {
      updateTask(task.id, { status: 'COMPLETED' });
    }
  };
  const copyMessage = async () => {
    try { await navigator.clipboard.writeText(draftFor(delegateTask)); } catch (error) { /* clipboard may be unavailable in a demo browser */ }
    setCopied(true);
  };

  return <div className="feature-page task-page">
    <div className="page-header compact-header"><p className="eyebrow">A little at a time</p><h2 className="page-title">{text.taskTitle}</h2><p className="page-subtitle">{text.taskCopy}</p></div>
    <div className="capacity-grid">
      {[['quick', text.quick, 'A small step is enough for today.', '◌'], ['moderate', text.moderate, 'Make steady progress.', '◒'], ['heavy', text.heavy, 'Show the full picture.', '◉']].map(([id, label, note, icon]) => <button key={id} className={`capacity-card ${capacity === id ? 'selected' : ''}`} onClick={() => setCapacity(id)}><span className="capacity-icon">{icon}</span><strong>{label}</strong><small>{note}</small></button>)}
    </div>
    <div className="task-list-header"><div><p className="eyebrow">{text.next}</p><h3>{visibleTasks.filter(task => task.status !== 'COMPLETED').length} {visibleTasks.length === 1 ? 'step' : 'steps'} in view</h3></div>{currentUser && <span className="soft-badge">{currentUser.name} · {text.tier} {currentUser.tier}</span>}</div>
    {visibleTasks.length === 0 ? <div className="empty-panel"><span className="empty-icon">◌</span><h3>{text.emptyTasks}</h3><p>Try a wider energy setting, or take a well-earned pause.</p></div> : <div className="task-list">{visibleTasks.map(task => <article className={`task-card status-${task.status.toLowerCase()}`} key={task.id}>
      <div className="task-card-main"><div className="task-marker">{task.status === 'COMPLETED' ? '✓' : task.status === 'PENDING_APPROVAL' ? '◐' : '·'}</div><div><div className="task-title-row"><h3>{task.title}</h3><span className="effort-label">{task.effort}</span></div><p>{task.description}</p><span className={`status-badge status-badge-${task.status.toLowerCase()}`}>{text[statusKey[task.status]] || task.status}</span>{task.submittedBy && <span className="task-assignee">Submitted by {task.submittedBy}</span>}</div></div>
      <div className="task-actions">{task.status !== 'COMPLETED' && <button className="text-button" onClick={() => completeTask(task)}>{task.status === 'PENDING_APPROVAL' && currentUser?.tier === 1 && currentUser.verified ? text.approve : task.requiresApproval && currentUser?.tier > 1 ? 'Submit for approval' : text.markComplete}</button>}<button className="text-button muted-action" onClick={() => { setDelegateTask(task); setCopied(false); }}>{text.delegate}</button></div>
    </article>)}</div>}
    {delegateTask && <div className="modal-backdrop" onClick={() => setDelegateTask(null)}><div className="delegate-modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setDelegateTask(null)} aria-label="Close">×</button><p className="eyebrow">A note you can share</p><h2>{text.delegate}</h2><p className="modal-subtitle">Send this message to someone who can take this step with you.</p><div className="message-draft">{draftFor(delegateTask)}</div><button className="btn btn-primary full-width" onClick={copyMessage}>{copied ? 'Message copied' : 'Copy message to send'}</button></div></div>}
  </div>;
};
