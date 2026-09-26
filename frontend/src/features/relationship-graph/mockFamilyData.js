// mockFamilyData.js
// Extended mock data for the Relationship Confidence feature.
// Each family member now includes: verification status, confidence %,
// evidence documents, access level description, and tier information.

export const deceasedInfo = {
  name: 'Anil Sharma',
  dateOfDeath: '2023-08-15',
};

export const mockFamilyData = [
  {
    id: 1,
    name: 'Aarti Sharma',
    relationship: 'Spouse',
    tier: 1,
    verified: true,
    confidence: 96,
    evidence: [
      'Name matches nominee records across multiple accounts',
      'Listed as spouse in insurance policy',
      'Joint account holder — SBI Savings',
    ],
    accessLevel: 'Full access',
    accessDescription: 'Can view all case details and approve sensitive actions.',
  },
  {
    id: 2,
    name: 'Rohan Sharma',
    relationship: 'Son',
    tier: 1,
    verified: true,
    confidence: 94,
    evidence: [
      'Name found as nominee in PPF account',
      'Relationship supported by insurance nominee document',
      'Supporting information consistent across documents',
    ],
    accessLevel: 'Full access',
    accessDescription: 'Can view all case details and approve sensitive actions.',
  },
  {
    id: 3,
    name: 'Rajesh Sharma',
    relationship: 'Brother',
    tier: 2,
    verified: false,
    confidence: 48,
    evidence: [
      'Shares the family surname',
    ],
    accessLevel: 'Limited / View-only',
    accessDescription: 'Sensitive actions require confirmation from a verified Tier 1 family member.',
  },
  {
    id: 4,
    name: 'Priya Desai',
    relationship: 'Accountant',
    tier: 3,
    verified: false,
    confidence: 35,
    evidence: [
      'Name appears on ITR filing acknowledgement',
    ],
    accessLevel: 'Specific / Shared only',
    accessDescription: 'Access limited to shared documents. Sensitive actions require verified family confirmation.',
  },
];

// Mock sensitive actions used by ApprovalFlow
export const mockSensitiveActions = [
  {
    id: 'sa-1',
    title: 'Share bank account details',
    description: 'Allow viewing of SBI Savings Account details including balance and account number.',
    category: 'Bank Accounts',
  },
  {
    id: 'sa-2',
    title: 'Share insurance policy information',
    description: 'Allow viewing of LIC Term Life Policy including nominee and sum assured.',
    category: 'Insurance',
  },
  {
    id: 'sa-3',
    title: 'Initiate loan closure',
    description: 'Begin the process of settling the outstanding home loan with ICICI Bank.',
    category: 'Loans',
  },
  {
    id: 'sa-4',
    title: 'Download tax documents',
    description: 'Allow downloading of ITR acknowledgement and related tax documents.',
    category: 'Tax Documents',
  },
];
