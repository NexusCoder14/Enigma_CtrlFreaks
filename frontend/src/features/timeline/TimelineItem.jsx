import React, { useState } from 'react';

// TimelineItem — A single timeline node with expandable details.

const priorityConfig = {
  HIGH:   { label: 'High priority',   className: 'priority-high' },
  MEDIUM: { label: 'Medium priority', className: 'priority-medium' },
  LOW:    { label: 'Low priority',    className: 'priority-low' },
};

const getStatusInfo = (item) => {
  if (item.status === 'COMPLETED') return { label: 'Completed', className: 'tl-status-completed' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const itemDate = new Date(item.date); itemDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((itemDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)  return { label: 'Overdue',  className: 'tl-status-overdue' };
  if (diffDays <= 3) return { label: 'Due soon',  className: 'tl-status-due-soon' };
  return               { label: 'Upcoming', className: 'tl-status-upcoming' };
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleString('en-IN', { month: 'short' }).toUpperCase(),
    year: date.getFullYear(),
  };
};

export const TimelineItem = ({ item, onToggleComplete }) => {
  const [expanded, setExpanded] = useState(false);
  const pConfig = priorityConfig[item.priority] || priorityConfig.MEDIUM;
  const statusInfo = getStatusInfo(item);
  const { day, month } = formatDate(item.date);

  return (
    <div className={`tl-item ${item.status === 'COMPLETED' ? 'tl-item-completed' : ''}`}>
      <div className="tl-date-col">
        <span className="tl-date-day">{day}</span>
        <span className="tl-date-month">{month}</span>
      </div>

      <div className="tl-connector">
        <div className={`tl-dot ${statusInfo.className}`} />
        <div className="tl-line" />
      </div>

      <div className="tl-content" onClick={() => setExpanded(!expanded)}>
        <div className="tl-content-header">
          <h4 className="tl-title">{item.title}</h4>
          <span className="ci-expand-icon">{expanded ? '▾' : '▸'}</span>
        </div>

        <div className="tl-meta">
          <span className={`badge ${pConfig.className}`}>{pConfig.label}</span>
          <span className={`badge ${statusInfo.className}`}>{statusInfo.label}</span>
          {item.category && <span className="badge badge-neutral">{item.category}</span>}
        </div>

        {expanded && (
          <div className="tl-details">
            <p className="tl-description">{item.description}</p>

            {item.assignedTo && (
              <div className="tl-detail-row">
                <span className="detail-label">Assigned to</span>
                <span>{item.assignedTo}</span>
              </div>
            )}

            {item.sourceDocument && (
              <div className="tl-detail-row">
                <span className="detail-label">Source</span>
                <span className="source-chip">📄 {item.sourceDocument}</span>
              </div>
            )}

            {item.reasoning && (
              <div className="tl-reasoning-box">
                <p className="detail-label">Why is this here?</p>
                <p className="tl-reasoning">{item.reasoning}</p>
              </div>
            )}

            {item.status !== 'COMPLETED' && (
              <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); onToggleComplete(item.id); }}>
                ✓ Mark as completed
              </button>
            )}
            {item.status === 'COMPLETED' && (
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onToggleComplete(item.id); }}>
                ↩ Undo completion
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
