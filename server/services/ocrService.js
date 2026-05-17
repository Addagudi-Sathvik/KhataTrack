import Tesseract from 'tesseract.js';
import { parseReceiptText } from './geminiService.js';

export async function scanReceiptBuffer(buffer) {
  const { data } = await Tesseract.recognize(buffer, 'eng');
  const parsed = await parseReceiptText(data.text || '');
  return { rawText: data.text, parsed };
}
