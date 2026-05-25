import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import DietPlan from '@/models/DietPlan';
import { getUserFromRequest } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function GET(req: Request) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const plan = await DietPlan.findOne({ userId: payload.userId });
    return NextResponse.json({ plan }, { status: 200 });
  } catch (error: any) {
    console.error('Diet GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { goal, weight, height, age } = user;

    // Calculate baseline calories
    // Approx BMR * Activity Multiplier
    // Weight Loss: Deficit (e.g. Weight * 24)
    // Muscle Gain: Surplus (e.g. Weight * 32)
    let targetCalories = 2000;
    if (goal === 'weight_loss') {
      targetCalories = Math.round(weight * 24);
    } else if (goal === 'muscle_gain') {
      targetCalories = Math.round(weight * 33);
    } else {
      targetCalories = Math.round(weight * 28);
    }

    let dietData;

    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `You are an expert sports nutritionist. Generate a healthy daily diet plan for a user with the following profile:
Goal: ${goal}
Weight: ${weight} kg
Height: ${height} cm
Age: ${age} years old
Target Calories: ${targetCalories} kcal

The diet plan should focus on Indian food preferences and have a balance of proteins, carbs, and fats.
Return a JSON object matching this structure:
{
  "targetCalories": ${targetCalories},
  "meals": {
    "breakfast": "Detailed breakfast description (e.g. Oats Chilla, Almonds)",
    "lunch": "Detailed lunch description (e.g. Brown Rice, Dal, Paneer/Chicken, Salad)",
    "snacks": "Detailed snack description (e.g. Whey Protein, Roasted Chana)",
    "dinner": "Detailed dinner description (e.g. Roti, Mix Veg, Curd, Grilled Fish)"
  },
  "waterTarget": 8
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        dietData = JSON.parse(text);
      } catch (geminiError) {
        console.error('Gemini generate diet error, using fallback:', geminiError);
      }
    }

    // Fallback if Gemini key is missing or failed
    if (!dietData) {
      dietData = getFallbackDiet(goal, targetCalories);
    }

    // Save or update plan in DB
    const plan = await DietPlan.findOneAndUpdate(
      { userId: user._id },
      {
        targetCalories: dietData.targetCalories || targetCalories,
        meals: dietData.meals,
        waterTarget: dietData.waterTarget || 8,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Diet plan generated successfully', plan }, { status: 200 });
  } catch (error: any) {
    console.error('Diet API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function getFallbackDiet(goal: string, targetCalories: number) {
  if (goal === 'weight_loss') {
    return {
      targetCalories,
      meals: {
        breakfast: 'Vegetable Oats Upma (1 bowl) + 4 Almonds + 1 cup Green Tea (approx. 300 kcal)',
        lunch: '2 Multigrain Rotis + 1 bowl Moong Dal + 1 bowl Mixed Vegetable Subzi + Salad (approx. 500 kcal)',
        snacks: '1 Apple + 1 cup Roasted Makhana (Foxnuts) (approx. 150 kcal)',
        dinner: '180g Grilled Paneer / Tofu or Chicken Breast + Steamed Broccoli + Cucumber Salad (approx. 450 kcal)'
      },
      waterTarget: 10
    };
  } else {
    // Muscle gain default
    return {
      targetCalories,
      meals: {
        breakfast: '3 Scrambled Eggs or Paneer Bhurji + 2 Slices of Whole Wheat Bread Toast + 1 Banana + Milk (approx. 550 kcal)',
        lunch: '1.5 bowl Brown Rice + 200g Grilled Chicken Breast / Soya Chunks Curry + 1 bowl Curd + Salad (approx. 700 kcal)',
        snacks: '1 scoop Whey Protein + 1 Tablespoon Peanut Butter + 2 slices brown bread (approx. 400 kcal)',
        dinner: '3 Rotis + 1 bowl Paneer Masala or Grilled Fish + 1 bowl Dal Tadka + Steamed Veggies (approx. 650 kcal)'
      },
      waterTarget: 8
    };
  }
}
