import React, { useState, useMemo } from 'react';
import { TimelineItem } from './TimelineItem';
import { useCaseContext } from '../../CaseContext';

// Timeline — Vertical timeline view showing financial deadlines from analyzed documents.

export const Timeline = () => {
  const { timelineEvents, toggleTimelineEvent } = useCaseContext();
  const [filter, setFilter] = useState('ALL');

  const sortedItems = useMemo(() =>
    [...timelineEvents].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [timelineEvents]
  );

  const completed = sortedItems.filter(i => i.status === 'COMPLETED').length;
  const pending = sortedItems.filter(i => i.status !== 'COMPLETED').length;

  const filteredItems = filter === 'ALL'
    ? sortedItems
    : filter === 'COMPLETED'
      ? sortedItems.filter(i => i.status === 'COMPLETED')
      : sortedItems.filter(i => i.status !== 'COMPLETED');

  if (timelineEvents.length === 0) {
    return (
      <div className="feature-page">
        <div className="page-header">
          <h2 className="page-title">Timeline</h2>
          <p className="page-subtitle">Important dates and actions reconstructed from your documents.</p>
        </div>
        <div className="empty-state">
          <p className="empty-state-title">No timeline events yet</p>
          <p className="empty-state-desc">
            Upload and analyze documents to see important dates and deadlines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <div className="page-header">
        <h2 className="page-title">Timeline</h2>
        <p className="page-subtitle">Important dates and actions reconstructed from your documents.</p>
      </div>

      <div className="tl-summary">
        <div className="tl-summary-stat">
          <span className="tl-summary-count">{sortedItems.length}</span>
          <span className="tl-summary-label">Total</span>
        </div>
        <div className="tl-summary-stat">
          <span className="tl-summary-count tl-count-pending">{pending}</span>
          <span className="tl-summary-label">Pending</span>
        </div>
        <div className="tl-summary-stat">
          <span className="tl-summary-count tl-count-done">{completed}</span>
          <span className="tl-summary-label">Completed</span>
        </div>
      </div>

      <div className="cl-filter-row">
        <button className={`filter-chip ${filter === 'ALL' ? 'filter-chip-active' : ''}`} onClick={() => setFilter('ALL')}>All</button>
        <button className={`filter-chip ${filter === 'PENDING' ? 'filter-chip-active' : ''}`} onClick={() => setFilter('PENDING')}>Pending</button>
        <button className={`filter-chip ${filter === 'COMPLETED' ? 'filter-chip-active' : ''}`} onClick={() => setFilter('COMPLETED')}>Completed</button>
      </div>

      <div className="tl-timeline">
        {filteredItems.map(item => (
          <TimelineItem key={item.id} item={item} onToggleComplete={toggleTimelineEvent} />
        ))}
        {filteredItems.length === 0 && (
          <div className="empty-state">
            <p className="empty-state-desc">No tasks match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
