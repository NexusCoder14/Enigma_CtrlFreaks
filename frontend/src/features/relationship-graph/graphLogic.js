// graphLogic.js
// Core logic for the Relationship Confidence feature.
// Determines relationship tiers and whether a person is eligible
// to approve sensitive actions based on their tier and verification status.

// Tier mapping: which relationships belong to which tier
const tierMap = {
  'Spouse': 1,
  'Child': 1,
  'Son': 1,
  'Daughter': 1,
  'Parent': 1,
  'Mother': 1,
  'Father': 1,
  'Sibling': 2,
  'Brother': 2,
  'Sister': 2,
  'Grandparent': 2,
  'Grandchild': 2,
  'Uncle': 2,
  'Aunt': 2,
  'Cousin': 2,
  'Friend': 3,
  'Lawyer': 3,
  'Accountant': 3,
  'Caregiver': 3,
  'Other': 3,
};

// Returns the tier (1, 2, or 3) for a given relationship string
export const getTier = (relationship) => {
  return tierMap[relationship] || 3;
};

// Determines whether a person can approve a sensitive action.
// Only verified Tier 1 members can approve.
export const canApprove = (person, action) => {
  if (!person) return false;
  // Must be verified AND Tier 1 to approve sensitive actions
  return person.verified === true && person.tier === 1;
};

// Returns a human-readable tier label
export const getTierLabel = (tier) => {
  switch (tier) {
    case 1: return 'Tier 1 — Close Family';
    case 2: return 'Tier 2 — Extended Family';
    case 3: return 'Tier 3 — Other / Declared';
    default: return 'Unknown';
  }
};

// Determines the verification result summary for a person
export const getVerificationResult = (person) => {
  if (person.verified) {
    return {
      label: '✓ Verified',
      className: 'rg-verified',
      message: `Relationship confirmed with ${person.confidence}% confidence.`,
    };
  }
  return {
    label: '⚠ Unverified',
    className: 'rg-unverified',
    message: 'We could not confidently confirm this relationship from the available documents.',
  };
};
