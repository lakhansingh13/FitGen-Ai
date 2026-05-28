import express from 'express';
import User from '../models/User.js';
import DietPlan from '../models/DietPlan.js';
import { protect } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// @route   GET /api/diet/generate
router.get('/generate', protect, async (req, res) => {
  try {
    const plan = await DietPlan.findOne({ userId: req.user.id });
    return res.json({ plan });
  } catch (error) {
    console.error('Diet GET Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @route   POST /api/diet/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { goal, weight, height } = user;
    const { preference, vegan, budget, allergies, cuisine, mealsPerDay } = req.body;

    let dietData;

    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `You are an expert sports nutritionist. Generate a detailed daily diet plan for a user with the following profile:
Goal: ${goal}
Weight: ${weight} kg
Height: ${height} cm
Dietary Preference: ${preference || 'any'}
Vegan: ${vegan ? 'Yes' : 'No'}
Budget Level: ${budget || 'moderate'}
Allergies: ${allergies || 'none'}
Cuisine Preference: ${cuisine || 'Indian'}
Meals Per Day: ${mealsPerDay || 4}

Return a JSON object matching this structure:
{
  "targetCalories": 2200,
  "meals": {
    "breakfast": "Oatmeal with almonds, banana, and protein scoop.",
    "lunch": "Grilled chicken breast (or paneer for veg) with brown rice and mixed green salad.",
    "snacks": "Roasted chickpeas or handful of walnuts.",
    "dinner": "Salmon fillet (or boiled dal/tofu for veg) with steamed broccoli and sweet potato."
  },
  "waterTarget": 8
}
Make sure to customize the meals according to the cuisine preference (such as North/South Indian staples: rotis, rice, dal, paneer, eggs, chicken tikka, etc.) and dietary allergies.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        dietData = JSON.parse(text);
      } catch (geminiError) {
        console.error('Gemini generate diet error, using fallback:', geminiError);
      }
    }

    // Fallback if Gemini key is missing or failed
    if (!dietData) {
      dietData = getFallbackDiet(goal, preference || 'vegetarian');
    }

    // Save or update plan in DB
    const plan = await DietPlan.findOneAndUpdate(
      { userId: user._id },
      {
        targetCalories: dietData.targetCalories,
        meals: dietData.meals,
        waterTarget: dietData.waterTarget || 8
      },
      { new: true, upsert: true }
    );

    return res.json({ message: 'Diet plan generated successfully', plan });
  } catch (error) {
    console.error('Diet API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

function getFallbackDiet(goal, preference) {
  const isLoss = goal === 'weight_loss';
  
  if (preference === 'vegetarian' || preference === 'veg') {
    return {
      targetCalories: isLoss ? 1600 : 2300,
      meals: {
        breakfast: "Moong dal cheela (2) with mint chutney or 1 cup oatmeal with skimmed milk and almonds.",
        lunch: "1 cup Dal tadka, 1 cup mixed vegetable dry, 2 multigrain rotis, and 100g low-fat curd.",
        snacks: "1 cup green tea with 30g roasted chana or a handful of mixed nuts (almonds, walnuts).",
        dinner: "150g grilled paneer tikka with bell peppers, onions, and a large bowl of green salad."
      },
      waterTarget: 8
    };
  } else {
    return {
      targetCalories: isLoss ? 1800 : 2500,
      meals: {
        breakfast: "3 scrambled egg whites, 1 whole egg on whole wheat toast with a cup of black coffee.",
        lunch: "150g grilled chicken breast, 1 cup brown rice, 1 cup stir-fried broccoli and carrots.",
        snacks: "1 scoop whey protein shake with water and 1 medium banana.",
        dinner: "150g baked Rohu fish or chicken breast with sautéed spinach and a cup of cooked quinoa."
      },
      waterTarget: 8
    };
  }
}

export default router;
