const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { extractTextFromFile } = require('./services/pdfService');
const { extractDocument, reconcileEntities, generateRoadmap, evaluateRelationships, answerEstateQuestion, generateClaimPack } = require('./services/pipelineService');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Set up Multer for file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Global state for hackathon demo (normally you'd use a DB)
let caseState = {
  documents: [],
  ledgerItems: [],
  tasks: [],
  family: [],
  sharedLinks: []
};

// 1. Process a single document
app.post('/api/process-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Extract text
    const text = await extractTextFromFile(req.file.buffer, req.file.mimetype);
    
    // Run Stage 1 & 2
    const aiData = await extractDocument(text, req.file.originalname);
    
    const docData = {
      id: `doc-${Date.now()}`,
      filename: req.file.originalname,
      ...aiData
    };

    caseState.documents.push(docData);
    
    res.json(docData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Verify a claimant against the documents already processed for this case.
app.post('/api/verify-relationship', async (req, res) => {
  try {
    const { name, relationship } = req.body;
    if (!name || !relationship) return res.status(400).json({ error: 'Name and relationship are required' });
    const familyData = await evaluateRelationships(caseState.documents, [{ id: `claimant-${Date.now()}`, name, relationship, tier: 3 }]);
    res.json(familyData.evaluatedFamily?.[0] || { name, relationship, verified: false, confidence: 0, evidence: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Reconcile Case (Runs the heavy pipeline)
app.post('/api/reconcile-case', async (req, res) => {
  try {
    const { declaredFamily } = req.body;

    // Run Stage 3, 4, 5
    const reconciliationData = await reconcileEntities(caseState.documents);
    caseState.ledgerItems = reconciliationData.ledgerItems || [];

    // Run Stage 6
    const roadmapData = await generateRoadmap(caseState.ledgerItems);
    caseState.tasks = roadmapData.tasks || [];

    // Run Relationship Evaluation
    if (declaredFamily && declaredFamily.length > 0) {
      const familyData = await evaluateRelationships(caseState.documents, declaredFamily);
      caseState.family = familyData.evaluatedFamily || [];
    }

    res.json({
      ledgerItems: caseState.ledgerItems,
      tasks: caseState.tasks,
      family: caseState.family
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Ask Your Estate
app.post('/api/ask-estate', async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await answerEstateQuestion(caseState.documents, caseState.ledgerItems, question);
    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Claim Pack
app.post('/api/claim-pack', async (req, res) => {
  try {
    const { entityName } = req.body;
    const pack = await generateClaimPack(entityName, caseState.documents, caseState.ledgerItems);
    res.json(pack);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Share metadata is kept server-side so a QR scan from another device resolves.
app.post('/api/share', (req, res) => {
  const { createdBy, permissions, caseInfo, ledgerItems, tasks } = req.body;
  if (!createdBy || !permissions) return res.status(400).json({ error: 'Share details are required' });
  const link = {
    id: req.body.id || `share-${Date.now().toString(36)}`,
    createdBy,
    permissions,
    createdAt: new Date().toISOString(),
    active: true,
    caseInfo,
    ledgerItems: ledgerItems || [],
    tasks: tasks || [],
  };
  caseState.sharedLinks.push(link);
  res.json(link);
});

app.get('/api/share/:shareId', (req, res) => {
  const link = caseState.sharedLinks.find(item => item.id === req.params.shareId);
  if (!link || !link.active) return res.status(404).json({ error: 'Share link is invalid or revoked' });
  res.json({ link, caseInfo: link.caseInfo, ledgerItems: link.ledgerItems, tasks: link.tasks });
});

app.delete('/api/share/:shareId', (req, res) => {
  const link = caseState.sharedLinks.find(item => item.id === req.params.shareId);
  if (!link) return res.status(404).json({ error: 'Share link not found' });
  link.active = false;
  res.json({ success: true });
});

// Get entire state
app.get('/api/state', (req, res) => {
  res.json(caseState);
});

// Reset state
app.post('/api/reset', (req, res) => {
  caseState = { documents: [], ledgerItems: [], tasks: [], family: [], sharedLinks: [] };
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
