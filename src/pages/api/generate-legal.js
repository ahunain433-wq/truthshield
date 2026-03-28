// src/pages/api/generate-legal.js
import { generateLegalContent } from '../../lib/legalService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, prompt, context } = req.body;

    if (!type || !prompt) {
      return res.status(400).json({ error: 'Type and prompt are required' });
    }

    const result = await generateLegalContent(type, prompt, context);

    res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Failed to generate legal content',
      details: error.message
    });
  }
}