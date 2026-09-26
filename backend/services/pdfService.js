const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

async function extractTextFromFile(fileBuffer, mimeType) {
  if (mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(fileBuffer);
      return data.text;
    } catch (e) {
      console.error("PDF Parse error", e);
      return "Could not extract text from PDF.";
    }
  } else if (mimeType.startsWith('text/')) {
    return fileBuffer.toString('utf8');
  } else if (mimeType.startsWith('image/')) {
    try {
      console.log("Running Tesseract OCR on image...");
      const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
      return text;
    } catch (e) {
      console.error("Tesseract error", e);
      return "Could not extract text from Image.";
    }
  } else {
    return "Unsupported file type.";
  }
}

module.exports = {
  extractTextFromFile
};
