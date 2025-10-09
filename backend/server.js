import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { saveRoast, getTopAllTime, getTopPast7Days, getMostRecent } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/judge-roast', async (req, res) => {
  const { roastText, username } = req.body;

  if (!roastText || !username) {
    return res.status(400).json({ error: 'Roast text and username are required' });
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
            content: `You are an expert roast battle judge with deep understanding of comedy, wordplay, and comedic timing. Your task is to evaluate roasts across multiple dimensions and provide a single overall score.

EVALUATION CRITERIA:
1. CREATIVITY (25%): Originality, unexpected angles, unique wordplay, clever twists
2. HUMOR (25%): Funniness, comedic timing, punchline effectiveness, laugh factor
3. EDGE/DARKNESS (25%): Boldness, boundary-pushing, edgy content (appropriate for roasts)
4. DELIVERY (25%): Structure, flow, punch, memorability, impact

SCORING PHILOSOPHY:
- A roast is meant to be offensive, edgy, and push boundaries - this is GOOD
- Score based on EXECUTION QUALITY, not content appropriateness
- Use the FULL 0-100 spectrum naturally - no number bias
- Consider ALL numbers: 23, 34, 47, 56, 67, 78, 89, 91, etc.
- Vary your scoring patterns completely

SCORING RANGES:
- 0-25: Terrible execution, unfunny, poorly structured
- 26-45: Weak, not clever, poor delivery
- 46-65: Average, decent but forgettable
- 66-80: Good quality, funny and well-crafted
- 81-95: Excellent, hilarious and memorable
- 96-100: Legendary, perfect execution

RESPONSE: Provide ONLY the final numerical score (0-100), nothing else.`
          },
          {
            role: 'user',
            content: `Judge this roast: "${roastText}"`
          }
        ],
        temperature: 0.8,
        max_tokens: 10
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
      saveRoast(username, roastText, score);
      return res.json({ score });
    }
    
    return res.status(500).json({ error: 'Could not parse score' });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard/all-time', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const results = getTopAllTime(limit);
    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard/past-7-days', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const results = getTopPast7Days(limit);
    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const results = getMostRecent(limit);
    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

