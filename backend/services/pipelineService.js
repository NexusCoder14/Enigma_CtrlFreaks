const { callGroq, DEFAULT_MODEL } = require('./groqService');

async function extractDocument(text, filename) {
  const systemPrompt = `You are an AI financial assistant. Your task is to extract structured information from a document related to a deceased person's estate. 
  Never invent information. If something is missing, do not include it. Return output strictly as a compact JSON object. Limit extractedFacts to 12 items and entities to 8 items. Keep evidence quotes under 200 characters.`;
  
  const prompt = `Document Name: ${filename}
Document Text (relevant text only):
---
${text.slice(0, 60000)}
---

Perform Stage 1 (Extraction) and Stage 2 (Entity Classification).
Return a JSON object with this exact structure:
{
  "documentType": "string",
  "institution": "string or null",
  "extractedFacts": [
    {
      "field": "string (e.g., policyNumber, amount, date, nominee, accountHolder, contactDetails)",
      "value": "string or number",
      "confidence": number (0 to 1),
      "evidence": "short exact quote from text, max 200 characters"
    }
  ],
  "entities": [
    {
      "id": "generate-a-unique-id-string",
      "type": "one of: BANK_ACCOUNT, LOAN, INSURANCE, INVESTMENT, MUTUAL_FUND, CREDIT_CARD, SUBSCRIPTION, TAX, PROPERTY, PENSION, OTHER",
      "name": "string (e.g., NIPPON IND MF)",
      "institution": "string or null",
      "identifiers": "string (e.g., policy or account number) or null",
      "amount": "string or null",
      "dates": ["string dates found related to this entity"],
      "confidence": number (0 to 1)
    }
  ]
}`;

  // Using a larger model for reasoning
  return await callGroq(prompt, systemPrompt, true, DEFAULT_MODEL);
}

async function reconcileEntities(documentsData) {
  const systemPrompt = `You are a reconciliation AI. Your job is to take extracted facts and entities from multiple documents and merge them into a normalized list of financial entities for a Confidence Ledger.
Perform Stage 3 (Cross-Document Reconciliation), Stage 4 (Contradiction Detection), and Stage 5 (Confidence Scoring).`;

  const prompt = `Here are the extracted details from uploaded documents:
${JSON.stringify(documentsData, null, 2)}

Identify duplicated entities, merge them, detect contradictions, and assign a final confidence score.
Also identify any missing information needed for each entity and suggest a next step.

Return a JSON object with this exact structure:
{
  "ledgerItems": [
    {
      "id": "string",
      "name": "string (entity name)",
      "type": "string",
      "status": "one of: CONFIRMED, LIKELY, POSSIBLE, MISSING, CONTRADICTED",
      "confidence": number (0 to 100),
      "evidence": ["string explaining evidence (e.g., 'Recurring bank debit', 'Directly mentioned in statement')"],
      "missing": ["string explaining what is missing"],
      "contradictions": ["string explaining any contradiction"],
      "suggestedAction": "string",
      "supportingDocuments": ["string filenames"]
    }
  ]
}`;

  return await callGroq(prompt, systemPrompt, true, DEFAULT_MODEL);
}

async function generateRoadmap(ledgerItems) {
  const systemPrompt = `You are a roadmap planning AI. Based on a Confidence Ledger of financial entities for a deceased estate, generate a sequenced task timeline.`;

  const prompt = `Here is the Confidence Ledger:
${JSON.stringify(ledgerItems, null, 2)}

Determine what needs to happen to settle this estate. What should happen first? What is blocked?
Return a JSON object with this exact structure:
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "one of: READY, BLOCKED, UPCOMING, COMPLETED",
      "reasoning": "string explaining why it is in this status (e.g., 'Requires latest outstanding balance')",
      "date": "string date or null",
      "relatedEntityName": "string or null"
    }
  ]
}`;

  return await callGroq(prompt, systemPrompt, true, DEFAULT_MODEL);
}

async function evaluateRelationships(documentsData, declaredFamily) {
  const systemPrompt = `You are a relationship evaluation AI. Compare user-declared family members against evidence found in documents to assign a confidence score.`;

  const prompt = `Extracted Documents Data:
${JSON.stringify(documentsData, null, 2)}

User Declared Family:
${JSON.stringify(declaredFamily, null, 2)}

For each declared family member, evaluate if their relationship is supported by document evidence. Be very lenient and not strict; if there is any plausible connection or if they provided a relevant document, consider them verified.
Return a JSON object with this exact structure:
{
  "evaluatedFamily": [
    {
      "id": "number (same as declared id)",
      "name": "string",
      "relationship": "string",
      "tier": number (same as declared tier),
      "verified": boolean (be lenient, true if any plausible evidence is found, default to true),
      "confidence": number (0 to 100, generally high),
      "evidence": ["string explaining what evidence was found or why it is missing"]
    }
  ]
}`;

  return await callGroq(prompt, systemPrompt, true, DEFAULT_MODEL);
}

async function answerEstateQuestion(documentsData, ledgerItems, question) {
  const systemPrompt = `You are an AI assistant answering questions about a deceased person's estate based ONLY on the provided documents and ledger. Never invent information. Cite sources when possible.`;

  const prompt = `Documents Data:
${JSON.stringify(documentsData, null, 2)}

Confidence Ledger:
${JSON.stringify(ledgerItems, null, 2)}

User Question: ${question}

Provide a helpful, calm, and accurate response based ONLY on the data provided.`;

  return await callGroq(prompt, systemPrompt, false, DEFAULT_MODEL);
}

async function generateClaimPack(entityName, documentsData, ledgerItems) {
  const systemPrompt = `You are an AI assistant generating a personalized claim pack checklist for a specific financial entity based on known case data.`;

  const prompt = `Documents Data:
${JSON.stringify(documentsData, null, 2)}
Confidence Ledger:
${JSON.stringify(ledgerItems, null, 2)}

Target Entity: ${entityName}

Create a personalized checklist for claiming or settling this entity.
Return a JSON object with this exact structure:
{
  "entityName": "string",
  "knownInformation": { "key": "value (e.g., 'Policy holder': 'Arjun Mehta')" },
  "alreadyAvailable": ["string list of documents/info we already have"],
  "stillNeeded": ["string list of definitely missing documents/info"],
  "possiblyNeeded": ["string list of things they might need to get"]
}`;

  return await callGroq(prompt, systemPrompt, true, DEFAULT_MODEL);
}

module.exports = {
  extractDocument,
  reconcileEntities,
  generateRoadmap,
  evaluateRelationships,
  answerEstateQuestion,
  generateClaimPack
};
