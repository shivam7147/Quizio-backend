import express from 'express';
import axios from 'axios';

const router = express.Router();

// POST /api/gemini/ask
router.post('/ask', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required.' });
  }
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key not configured.' });
    }
    // Example Gemini API endpoint (replace with actual endpoint if different)
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        params: { key: apiKey },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Gemini route error:', err);
    res.status(500).json({ message: 'Gemini API error', error: err.message });
  }
});

export default router;
