import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXPENSE_CATEGORIES } from '../config/constants.js';

let model;

function getModel() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });
  }
  return model;
}

function parseJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in AI response');
  return JSON.parse(match[0]);
}

export async function categorizeExpenseText(rawText) {
  const categories = EXPENSE_CATEGORIES.join(', ');
  const prompt = `Parse this expense string into strict minified JSON only: {"amount":number,"category":"one of [${categories}]","merchant":"string","description":"string"}. Input: "${rawText}"`;

  const ai = getModel();
  if (!ai) {
    const amountMatch = rawText.match(/[\d,.]+/);
    return {
      amount: amountMatch ? Number(amountMatch[0].replace(/,/g, '')) : 0,
      category: 'Other',
      merchant: rawText.split(/\d/)[0]?.trim() || 'Unknown',
      description: rawText
    };
  }

  const result = await ai.generateContent(prompt);
  return parseJson(result.response.text());
}

export async function parseReceiptText(rawText) {
  const prompt = `Extract transaction fields from OCR receipt text. Return strict minified JSON only: {"amount":number,"date":"ISO date string or null","merchant":"string","description":"string"}. OCR text:\n${rawText}`;

  const ai = getModel();
  if (!ai) {
    const amountMatch = rawText.match(/[\d,.]+/);
    return {
      amount: amountMatch ? Number(amountMatch[0].replace(/,/g, '')) : 0,
      date: null,
      merchant: 'Receipt',
      description: rawText.slice(0, 180)
    };
  }

  const result = await ai.generateContent(prompt);
  return parseJson(result.response.text());
}

export async function chatWithContext(userPrompt, contextString) {
  const prompt = `You are KhataTrack AI, a personal finance assistant. Use the user's last 30 days of transactions for grounded answers. Be concise and actionable.\n\nTransactions:\n${contextString}\n\nUser: ${userPrompt}`;

  const ai = getModel();
  if (!ai) {
    return 'AI assistant is unavailable. Add GEMINI_API_KEY to enable KhataTrack insights.';
  }

  const result = await ai.generateContent(prompt);
  return result.response.text();
}
