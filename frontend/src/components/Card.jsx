import React from 'react';

// Placeholder for shared Card component
export const Card = ({ title, children }) => {
  return (
    <div className="app-card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
};
