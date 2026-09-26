import React, { createContext, useCallback, useContext, useState } from 'react';
import caseData from './mock-data/caseData.json';
import { getTier } from './features/relationship-graph/graphLogic';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const clone = value => JSON.parse(JSON.stringify(value));

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Nivaran could not complete that step.');
  return payload;
};

const normalizeTask = task => ({
  id: task.id || `task-${Date.now()}`,
  title: task.title || 'Estate follow-up',
  description: task.description || task.reasoning || 'Review the next step for this financial item.',
  institution: task.institution || task.relatedEntityName || 'Case follow-up',
  requiredDocuments: Array.isArray(task.requiredDocuments) ? task.requiredDocuments : [],
  effort: ['quick', 'moderate', 'heavy'].includes(task.effort) ? task.effort : 'moderate',
  status: task.status === 'READY' ? 'NOT_STARTED' : task.status === 'BLOCKED' ? 'PENDING_APPROVAL' : task.status || 'NOT_STARTED',
  requiresApproval: Boolean(task.requiresApproval),
  assignee: task.assignee || null,
  submittedBy: task.submittedBy || null,
});

const normalizeLedgerItem = item => ({
  ...item,
  id: item.id || `ledger-${Date.now()}`,
  title: item.title || item.name || 'Financial item',
  category: item.category || item.type || 'Financial item',
  institution: item.institution || 'Institution not identified',
  amount: Number(String(item.amount ?? 0).replace(/[^0-9.]/g, '')) || 0,
  status: item.status === 'LIKELY' ? 'PARTIAL' : ['POSSIBLE', 'CONTRADICTED'].includes(item.status) ? 'MISSING' : item.status || 'MISSING',
  confidence: Number(item.confidence) || 0,
  missingInfo: item.missingInfo || item.missing || [],
  evidence: item.evidence || [],
  sourceDocument: item.sourceDocument || item.supportingDocuments?.[0] || null,
});

const CaseContext = createContext(null);

export const useCaseContext = () => {
  const context = useContext(CaseContext);
  if (!context) throw new Error('useCaseContext must be inside CaseProvider');
  return context;
};

export const CaseProvider = ({ children }) => {
  const [caseInfo, setCaseInfo] = useState(clone(caseData.caseInfo));
  const [caseStarted, setCaseStarted] = useState(false);
  const [documents, setDocuments] = useState(clone(caseData.documents));
  const [confidenceItems, setConfidenceItems] = useState(clone(caseData.confidenceLedger).map(normalizeLedgerItem));
  const [timelineEvents, setTimelineEvents] = useState(clone(caseData.tasks).map(normalizeTask));
  const [familyMembers, setFamilyMembers] = useState(clone(caseData.familyMembers));
  const [language, setLanguage] = useState(caseData.language || 'en');
  const [currentUserId, setCurrentUserId] = useState(caseData.currentUserId || 1);
  const [sharedLinks, setSharedLinks] = useState([]);
  const [aiStatus, setAiStatus] = useState('ready');
  const [aiError, setAiError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationMessage, setVerificationMessage] = useState('');

  const currentUser = familyMembers.find(member => member.id === currentUserId) || familyMembers[0] || null;

  const startCase = useCallback(info => {
    setCaseInfo(info);
    setCaseStarted(true);
  }, []);

  const addDocument = useCallback(file => {
    const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setDocuments(previous => [...previous, { id, file, name: file.name, size: file.size, type: file.type, status: 'uploaded', extractedData: null, analysisProgress: 0, addedToCase: false }]);
    return id;
  }, []);

  const verifyFamilyIdentity = useCallback(async ({ name, relationship, deceasedName, file }) => {
    setVerificationStatus('checking');
    setVerificationMessage('');
    setAiError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      setAiStatus('analyzing');
      const processed = await request('/api/process-document', { method: 'POST', body: formData });
      const evaluation = await request('/api/verify-relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, relationship }),
      });
      const document = { id: processed.id, file, name: file.name, size: file.size, type: file.type, status: 'analyzed', analysisProgress: 100, addedToCase: true, extractedData: { type: processed.documentType, fields: (processed.extractedFacts || []).map(fact => ({ label: fact.field, value: fact.value })), entities: processed.entities || [], rawAI: processed } };
      setDocuments(previous => [...previous, document]);
      if (!evaluation.verified) {
        setVerificationStatus('needs-document');
        setVerificationMessage('We could not confirm this relationship from the uploaded document. Try a nominee record, joint account statement, family certificate, or legal-heir document.');
        setAiStatus('ready');
        return { verified: false, evaluation };
      }
      const memberId = Date.now();
      const member = { id: memberId, name, relationship, tier: getTier(relationship), verified: true, confidence: evaluation.confidence || 90, evidence: evaluation.evidence || ['Relationship supported by the uploaded document.'], accessDescription: 'Full access to case details and financial information.' };
      setFamilyMembers(previous => [...previous, member]);
      setCurrentUserId(memberId);
      setCaseInfo(previous => ({ ...previous, name: deceasedName.trim() || previous.name }));
      setCaseStarted(true);
      setVerificationStatus('verified');
      setVerificationMessage('Your relationship was verified. Your case is ready.');
      setAiStatus('ready');
      return { verified: true, member };
    } catch (error) {
      setVerificationStatus('error');
      setVerificationMessage(error.message);
      setAiStatus('error');
      setAiError(error.message);
      return { verified: false, error };
    }
  }, []);

  const analyzeDocument = useCallback(async docId => {
    const document = documents.find(item => item.id === docId);
    if (!document?.file) return;
    setDocuments(previous => previous.map(item => item.id === docId ? { ...item, status: 'analyzing', analysisProgress: 30, error: '' } : item));
    setAiStatus('analyzing');
    setAiError('');
    try {
      const formData = new FormData();
      formData.append('file', document.file);
      const result = await request('/api/process-document', { method: 'POST', body: formData });
      setDocuments(previous => previous.map(item => item.id === docId ? {
        ...item,
        status: 'analyzed',
        analysisProgress: 100,
        extractedData: { type: result.documentType || 'Financial document', fields: (result.extractedFacts || []).map(fact => ({ label: fact.field, value: fact.value })), entities: result.entities || [], rawAI: result },
      } : item));
      setAiStatus('ready');
    } catch (error) {
      setAiStatus('error');
      setAiError(error.message);
      setDocuments(previous => previous.map(item => item.id === docId ? { ...item, status: 'uploaded', analysisProgress: 0, error: error.message } : item));
    }
  }, [documents]);

  const reconcileCase = useCallback(async () => {
    setAiStatus('reconciling');
    setAiError('');
    try {
      const result = await request('/api/reconcile-case', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ declaredFamily: familyMembers }) });
      if (result.ledgerItems?.length) setConfidenceItems(result.ledgerItems.map(normalizeLedgerItem));
      if (result.tasks?.length) setTimelineEvents(result.tasks.map(normalizeTask));
      if (result.family?.length) setFamilyMembers(previous => previous.map(member => result.family.find(updated => updated.id === member.id) || member));
      setAiStatus('ready');
      return result;
    } catch (error) {
      setAiStatus('error');
      setAiError(error.message);
      throw error;
    }
  }, [familyMembers]);

  const addToCase = useCallback(docId => {
    setDocuments(previous => previous.map(item => item.id === docId ? { ...item, addedToCase: true } : item));
    reconcileCase().catch(() => {});
  }, [reconcileCase]);

  const updateConfidenceItem = useCallback((id, status) => {
    setConfidenceItems(previous => previous.map(item => item.id === id ? { ...item, status, confidence: status === 'CONFIRMED' ? 100 : item.confidence } : item));
  }, []);

  const updateTask = useCallback((id, changes) => {
    setTimelineEvents(previous => previous.map(task => task.id === id ? { ...task, ...changes } : task));
  }, []);

  const submitTaskForApproval = useCallback((id, submittedBy) => updateTask(id, { status: 'PENDING_APPROVAL', submittedBy }), [updateTask]);
  const approveTask = useCallback(id => updateTask(id, { status: 'COMPLETED', approvedBy: currentUser?.name || null }), [currentUser, updateTask]);

  const addFamilyMember = useCallback(member => {
    const mentioned = caseData.documentMentionedNames.some(entry => entry.name.toLowerCase() === member.name.trim().toLowerCase());
    setFamilyMembers(previous => [...previous, { ...member, id: Date.now(), tier: getTier(member.relationship), verified: mentioned, confidence: mentioned ? 92 : 38, evidence: mentioned ? ['Name and role appear in the provided documents.'] : [], accessDescription: mentioned ? 'Can view case details and approve sensitive actions.' : 'Sensitive actions need approval from a verified Tier 1 family member.' }]);
  }, []);

  const askEstate = async question => {
    const result = await request('/api/ask-estate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
    return result.answer;
  };

  const getClaimPack = entityName => request('/api/claim-pack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entityName }) });
  const createShareLink = useCallback((createdBy, permissions) => {
    const link = { id: `share-${Date.now().toString(36)}`, createdBy, permissions, createdAt: new Date().toISOString(), active: true, caseInfo, ledgerItems: confidenceItems, tasks: timelineEvents };
    setSharedLinks(previous => [...previous, link]);
    request('/api/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: link.id, createdBy, permissions, caseInfo, ledgerItems: confidenceItems, tasks: timelineEvents }) }).catch(() => {});
    return link.id;
  }, [caseInfo, confidenceItems, timelineEvents]);
  const revokeShareLink = useCallback(id => {
    setSharedLinks(previous => previous.map(link => link.id === id ? { ...link, active: false } : link));
    request(`/api/share/${id}`, { method: 'DELETE' }).catch(() => {});
  }, []);

  const value = {
    caseInfo, caseStarted, startCase, documents, addDocument, analyzeDocument, addToCase, reconcileCase, verifyFamilyIdentity,
    confidenceItems, updateConfidenceItem, timelineEvents, updateTask, submitTaskForApproval, approveTask,
    familyMembers, setFamilyMembers, addFamilyMember, language, setLanguage, currentUser, currentUserId, setCurrentUserId,
    aiStatus, aiError, verificationStatus, verificationMessage, sharedLinks, createShareLink, revokeShareLink, askEstate, getClaimPack, DOCUMENT_TEMPLATES: {},
  };

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
};
