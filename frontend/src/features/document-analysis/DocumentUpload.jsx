import React, { useState, useRef, useCallback } from 'react';
import { useCaseContext } from '../../CaseContext';

const ANALYSIS_STEPS = [
  'Reading document',
  'Detecting document type',
  'Extracting names',
  'Extracting financial information',
  'Finding dates and deadlines',
  'Checking missing information',
];

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

const DocumentCard = ({ doc, onAnalyze, onViewExtracted, onAddToCase }) => {
  const stepsCompleted = Math.round((doc.analysisProgress / 100) * ANALYSIS_STEPS.length);

  return (
    <div className={`doc-card ${doc.status === 'analyzed' ? 'doc-card-analyzed' : ''}`}>
      <div className="doc-card-header">
        <div className="doc-card-icon">
          {doc.status === 'analyzed' ? '✓' : doc.status === 'analyzing' ? '◌' : '📄'}
        </div>
        <div className="doc-card-info">
          <span className="doc-card-name">{doc.name}</span>
          <span className="doc-card-meta">{formatSize(doc.size)}</span>
        </div>
        <div className="doc-card-status">
          {doc.status === 'uploaded' && <span className="badge badge-neutral">Uploaded</span>}
          {doc.status === 'analyzing' && <span className="badge badge-warning">Analyzing…</span>}
          {doc.status === 'analyzed' && !doc.addedToCase && <span className="badge badge-success">Analyzed</span>}
          {doc.addedToCase && <span className="badge badge-success">Added to case</span>}
        </div>
      </div>

      {doc.status === 'analyzing' && (
        <div className="doc-analysis-progress">
          <div className="analysis-bar-track">
            <div className="analysis-bar-fill" style={{ width: `${doc.analysisProgress}%` }} />
          </div>
          <div className="analysis-steps">
            {ANALYSIS_STEPS.map((step, i) => (
              <div key={i} className={`analysis-step ${i < stepsCompleted ? 'step-done' : ''}`}>
                <span className="step-icon">{i < stepsCompleted ? '✓' : '○'}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {doc.status === 'analyzed' && doc.extractedData && !doc.addedToCase && (
        <div className="doc-extracted-preview">
          <div className="extracted-type">
            <span className="text-muted">Document type</span>
            <span className="extracted-type-value">{doc.extractedData.type}</span>
          </div>
          <div className="extracted-fields">
            {doc.extractedData.fields.map((f, i) => (
              <div key={i} className="extracted-field">
                <span className="extracted-field-label">{f.label}</span>
                <span className="extracted-field-value">{f.value}</span>
              </div>
            ))}
          </div>
          <div className="extracted-confidence">
            <span className="text-muted">Confidence</span>
            <span className="extracted-confidence-value">
              {doc.extractedData.confidenceItems?.[0]?.confidence || 85}%
            </span>
          </div>
          <div className="doc-card-actions">
            <button className="btn btn-primary btn-sm" onClick={() => onAddToCase(doc.id)}>
              Add to case
            </button>
          </div>
        </div>
      )}

      {doc.status === 'uploaded' && (
        <div className="doc-card-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onAnalyze(doc.id)}>
            Analyze document
          </button>
        </div>
      )}
    </div>
  );
};

export const DocumentUpload = () => {
  const { documents, addDocument, analyzeDocument, addToCase, reconcileCase, aiError } = useCaseContext();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback((files) => {
    const fileList = Array.from(files);
    const docIds = [];
    fileList.forEach(file => {
      const id = addDocument(file);
      docIds.push(id);
    });
    // Auto-start analysis for each file with a small delay
    docIds.forEach((id, i) => {
      setTimeout(() => analyzeDocument(id), (i + 1) * 300);
    });
  }, [addDocument, analyzeDocument]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleBrowse = () => fileInputRef.current?.click();
  const handleFileChange = (e) => { if (e.target.files.length) handleFiles(e.target.files); };

  const analyzedCount = documents.filter(d => d.status === 'analyzed').length;
  const addedCount = documents.filter(d => d.addedToCase).length;

  return (
    <div className="documents-page">
      <div className="page-header">
        <h2 className="page-title">Documents</h2>
        <p className="page-subtitle">Upload the documents you'd like Nivaran to understand.</p>
      </div>

      {documents.length > 0 && (
        <div className="doc-summary-row">
          <span className="doc-summary-item">{documents.length} uploaded</span>
          <span className="doc-summary-dot">·</span>
          <span className="doc-summary-item">{analyzedCount} analyzed</span>
          <span className="doc-summary-dot">·</span>
          <span className="doc-summary-item">{addedCount} added to case</span>
          <button className="text-button" onClick={() => reconcileCase().catch(() => {})}>Refresh case picture</button>
        </div>
      )}

      {aiError && <div className="ai-error-banner"><strong>AI could not finish that step.</strong><span>{aiError}</span><small>Check that the backend is running and that GROQ_API_KEY is set in backend/.env.</small></div>}

      <div
        className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleBrowse}
      >
        <div className="upload-zone-content">
          <span className="upload-icon">+</span>
          <p className="upload-text">Drop documents here</p>
          <p className="upload-subtext">or click to browse</p>
          <p className="upload-formats">PDF, JPG, PNG</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {documents.length > 0 && (
        <div className="doc-list">
          <h3 className="section-label">Uploaded documents</h3>
          {documents.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onAnalyze={analyzeDocument}
              onAddToCase={addToCase}
            />
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No documents yet</p>
          <p className="empty-state-desc">
            Upload your first document to start building your financial picture.
          </p>
        </div>
      )}
    </div>
  );
};
