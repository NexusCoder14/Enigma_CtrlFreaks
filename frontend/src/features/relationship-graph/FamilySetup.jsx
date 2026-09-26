import React from 'react';

export const FamilySetup = () => {
  return (
    <div>
      <h3>Family Setup</h3>
      <form>
        <label>Name:</label>
        <input type="text" placeholder="Full Name" />
        <br />
        <label>Relationship:</label>
        <select>
          <option>Spouse</option>
          <option>Child</option>
          <option>Parent</option>
          <option>Sibling</option>
        </select>
      </form>
    </div>
  );
};
