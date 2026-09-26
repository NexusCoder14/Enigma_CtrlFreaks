import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseContext } from '../CaseContext';
import { getText } from '../features/regional-language/translations';

export const Dashboard = () => {
  const { caseInfo, documents, confidenceItems, timelineEvents, familyMembers, currentUser, askEstate, language } = useCaseContext();
  const text = getText(language);
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const confirmed = confidenceItems.filter(item => item.status === 'CONFIRMED').length;
  const openTasks = timelineEvents.filter(task => task.status !== 'COMPLETED');
  const pendingApproval = timelineEvents.filter(task => task.status === 'PENDING_APPROVAL').length;
  const userFirstName = currentUser?.name?.split(' ')[0] || 'there';

  const ask = async event => {
    event.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    try { setAnswer(await askEstate(question)); } catch (error) { setAnswer('Nivaran could not reach the AI right now. Please try again shortly.'); }
    setAsking(false);
  };

  return (
    <div className="feature-page dashboard-page">
      <section className="welcome-panel animate-fade-up">
        <div className="welcome-panel-content">
          <p className="eyebrow animate-slide-right delay-100">{text.welcome}, {userFirstName}</p>
          <h2 className="animate-slide-right delay-200">{text.dashboard}</h2>
          <p className="animate-slide-right delay-300">For the {caseInfo?.referenceName || 'family case'} of {caseInfo?.name || 'your loved one'}.</p>
        </div>
        <button className="btn btn-light animate-scale-up delay-400" onClick={() => navigate('/tasks')}>
          See next steps <span>→</span>
        </button>
      </section>

      <div className="metric-grid">
        <button className="metric-card animate-fade-up delay-200" onClick={() => navigate('/documents')}>
          <div className="metric-icon-wrapper"><span className="metric-icon">▧</span></div>
          <div className="metric-info">
            <strong>{documents.length}</strong>
            <span>Documents</span>
          </div>
        </button>
        <button className="metric-card animate-fade-up delay-300" onClick={() => navigate('/confidence')}>
          <div className="metric-icon-wrapper"><span className="metric-icon">◒</span></div>
          <div className="metric-info">
            <strong>{confidenceItems.length}</strong>
            <span>Financial items</span>
          </div>
        </button>
        <button className="metric-card metric-card-green animate-fade-up delay-400" onClick={() => navigate('/confidence')}>
          <div className="metric-icon-wrapper"><span className="metric-icon">✓</span></div>
          <div className="metric-info">
            <strong>{confirmed}</strong>
            <span>{text.confirmed}</span>
          </div>
        </button>
        <button className="metric-card metric-card-amber animate-fade-up delay-500" onClick={() => navigate('/tasks')}>
          <div className="metric-icon-wrapper"><span className="metric-icon">◐</span></div>
          <div className="metric-info">
            <strong>{openTasks.length}</strong>
            <span>{pendingApproval ? `${pendingApproval} need approval` : 'Open next steps'}</span>
          </div>
        </button>
      </div>

      <div className="dashboard-columns">
        <section className="dashboard-section animate-fade-up delay-400">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{text.next}</p>
              <h3>Keep it simple</h3>
            </div>
            <button className="quiet-link" onClick={() => navigate('/tasks')}>View all →</button>
          </div>
          <div className="summary-list">
            {openTasks.slice(0, 3).map((task, i) => (
              <button 
                className={`summary-row animate-fade-up`} 
                style={{ animationDelay: `${500 + i * 100}ms` }}
                key={task.id} 
                onClick={() => navigate('/tasks')}
              >
                <div className="summary-icon-container">
                  <span className="summary-mark">{task.status === 'PENDING_APPROVAL' ? '◐' : '·'}</span>
                </div>
                <span>
                  <strong>{task.title}</strong>
                  <small>{task.institution} · {task.effort}</small>
                </span>
                <span className="row-arrow">→</span>
              </button>
            ))}
            {!openTasks.length && <div className="small-empty animate-fade-up delay-500">You have reached a natural stopping point.</div>}
          </div>
        </section>

        <section className="dashboard-section ai-question animate-fade-up delay-500">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{text.askTitle}</p>
              <h3>{text.askCopy}</h3>
            </div>
          </div>
          <form onSubmit={ask} className="ai-form">
            <input 
              value={question} 
              onChange={event => setQuestion(event.target.value)} 
              placeholder="e.g. What should I do first?" 
              className="ai-input"
            />
            <button className="btn btn-primary" disabled={asking}>
              {asking ? 'Thinking…' : text.ask}
            </button>
          </form>
          {answer && <div className="ai-answer animate-scale-up">{answer}</div>}
        </section>
      </div>

      <section className="family-strip animate-fade-up delay-600">
        <div className="family-strip-content">
          <p className="eyebrow">{text.familyTitle}</p>
          <h3>{familyMembers.filter(member => member.verified).length} verified family members</h3>
          <p>{currentUser ? `You are viewing as ${currentUser.name}, Tier ${currentUser.tier}.` : 'Add a trusted person to this case.'}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/family')}>Open family circle →</button>
      </section>
    </div>
  );
};
