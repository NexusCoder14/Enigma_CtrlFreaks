import React from 'react';

// Placeholder for shared Button component
export const Button = ({ children, onClick }) => {
  return <button className="app-button" onClick={onClick}>{children}</button>;
};
