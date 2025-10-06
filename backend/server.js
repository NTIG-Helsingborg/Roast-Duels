import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/judge-roast', async (req, res) => {
  const { roastText } = req.body;

  if (!roastText) {
    return res.status(400).json({ error: 'Roast text is required' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a roast battle judge. Rate roasts from 0-100 based on creativity, humor, cleverness, and impact. Reply with ONLY the number, nothing else.'
          },
          {
            role: 'user',
            content: `Rate this roast: "${roastText}"`
          }
        ],
        temperature: 0.5,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'API request failed' });
    }

    const result = await response.json();
    const aiResponse = result.choices[0]?.message?.content?.trim() || '';
    
    const scoreMatch = aiResponse.match(/\b(\d+)\b/);
    if (scoreMatch) {
      const score = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
      return res.json({ score });
    }
    
    return res.status(500).json({ error: 'Could not parse score' });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

