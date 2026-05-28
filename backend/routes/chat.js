import express from 'express';
import { protect } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `You are a premium AI fitness coach and sports nutritionist for the FitGen AI platform. 
Keep your answers professional, concise, scientific, and highly motivating. Use bullet points and paragraphs. 
Help the user with workout forms, dietary tips, habit building, and workout plans.
If they ask something completely unrelated to fitness or nutrition, guide them back to fitness nicely.`;

function getFallbackResponse(message) {
  let fallbackReply = "I am ready to help you crush your fitness goals! To get live personalized answers, please verify your network connection and GEMINI_API_KEY configuration.";
  
  const lowercaseMsg = message.toLowerCase();
  if (lowercaseMsg.includes('home') || lowercaseMsg.includes('workout')) {
    fallbackReply = `Here is a quick Home Core & Cardio routine:
• **Jumping Jacks**: 3 sets x 45 seconds (Warm up)
• **Bodyweight Squats**: 4 sets x 15 reps (Keep weight on heels)
• **Pushups**: 3 sets x max reps (Keep elbows at 45 degrees)
• **Plank**: 3 sets x 60 seconds (Squeeze core and glutes)
• **Burpees**: 3 sets x 10 reps (High intensity finish)`;
  } else if (lowercaseMsg.includes('protein') || lowercaseMsg.includes('food') || lowercaseMsg.includes('diet')) {
    fallbackReply = `Here are premium high-protein Indian options for your diet:
• **Vegetarian**: Paneer (18g protein/100g), Greek Yogurt/Curd (10g/100g), Soya Chunks (52g/100g), Moong Dal & Chickpeas.
• **Non-Vegetarian**: Chicken Breast (31g protein/100g), Whole Eggs (6g per egg), Fish (Salmon/Rohu, 22g/100g).
• **Tip**: Ensure you consume 1.6g to 2.2g of protein per kg of bodyweight for muscle building.`;
  } else if (lowercaseMsg.includes('squat') || lowercaseMsg.includes('form') || lowercaseMsg.includes('posture')) {
    fallbackReply = `To perform a perfect squat and satisfy the FitGen AI trainer:
1. **Stance**: Feet shoulder-width apart, toes pointing slightly out.
2. **Bracing**: Breathe in, tighten your core, and keep your chest upright.
3. **Depth**: Lower your hips until thighs are parallel or below parallel to the floor (aim for 90-100 degrees knee bend).
4. **Ascent**: Drive back up through your heels, exhaling at the top.
5. **Tip**: Avoid bending your knees inward. Keep your spine neutral.`;
  }

  return fallbackReply;
}

// @route   POST /api/chat/message
router.post('/message', protect, async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!GEMINI_API_KEY) {
      const fallbackReply = getFallbackResponse(message);
      return res.json({ reply: fallbackReply });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format chat history for Gemini API
    const formattedContents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        formattedContents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }
    
    // Add current message with system instructions
    formattedContents.push({
      role: 'user',
      parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser message: " + message }],
    });

    let replyText = "";
    try {
      const result = await model.generateContent({
        contents: formattedContents,
      });
      replyText = result.response.text();
    } catch (apiError) {
      console.error('Gemini API generate content failed, using fallback:', apiError);
      replyText = getFallbackResponse(message);
    }

    return res.json({ reply: replyText });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: error.message || 'Error generating AI response' });
  }
});

export default router;
