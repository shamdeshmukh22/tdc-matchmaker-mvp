/**
 * ──────────────────────────────────────────────────────────────
 * TDC Match Logic Router
 * ──────────────────────────────────────────────────────────────
 * Implements gender-specific matchmaking algorithms and
 * OpenAI-powered compatibility review.
 *
 * Endpoints:
 *   GET  /api/customers/:id/matches   → Algorithmic matches
 *   POST /api/matches/ai-review       → AI compatibility review
 * ──────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// ─── OpenAI Client Setup ─────────────────────────────────────

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Helper: Profession Categories ──────────────────────────

const professionCategories = {
  'Tech': ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Business Analyst'],
  'Finance': ['Investment Banker', 'Chartered Accountant', 'Consultant'],
  'Healthcare': ['Doctor', 'Dentist', 'Pharmacist', 'Research Scientist'],
  'Creative': ['Fashion Designer', 'Content Writer', 'Journalist', 'Architect'],
  'Corporate': ['Marketing Manager', 'HR Manager', 'Entrepreneur'],
  'Public': ['Lawyer', 'Government Officer', 'Teacher', 'Pilot'],
  'Engineering': ['Civil Engineer']
};

/**
 * Get the profession category for a given profession string
 */
function getProfessionCategory(profession) {
  for (const [category, profs] of Object.entries(professionCategories)) {
    if (profs.includes(profession)) return category;
  }
  return 'Other';
}

/**
 * Count overlapping values between two arrays
 */
function overlapCount(arr1, arr2) {
  if (!arr1 || !arr2) return 0;
  return arr1.filter(item => arr2.includes(item)).length;
}

// ══════════════════════════════════════════════════════════════
// ENDPOINT: GET /api/customers/:id/matches
// Gender-specific matchmaking with scoring
// ══════════════════════════════════════════════════════════════

router.get('/customers/:id/matches', (req, res) => {
  const { customers, profiles } = req.app.locals;
  const customer = customers.find(c => c.id === req.params.id);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  let matches = [];

  if (customer.gender === 'Male') {
    // ─── Male Client Matching Rules ────────────────────────
    // Filter for women who are: younger, shorter, lower income,
    // and have matching views on wanting children.
    matches = profiles
      .filter(p => p.gender === 'Female')
      .filter(p => {
        const isYounger = p.age < customer.age;
        const isShorter = p.height < customer.height;
        const isLowerIncome = p.income < customer.income;
        const kidsMatch = p.wantKids === customer.wantKids ||
                          p.wantKids === 'Maybe' ||
                          customer.wantKids === 'Maybe';
        return isYounger && isShorter && isLowerIncome && kidsMatch;
      })
      .map(p => {
        // Calculate a compatibility score for ranking
        let score = 50; // Base score for passing all filters

        // Religion match bonus
        if (p.religion === customer.religion) score += 15;

        // Diet compatibility
        if (p.diet === customer.diet) score += 10;

        // Family values alignment
        if (p.familyValues === customer.familyValues) score += 10;

        // Language overlap bonus
        const langOverlap = overlapCount(p.languages, customer.languages);
        score += langOverlap * 5;

        // Hobby overlap bonus
        const hobbyOverlap = overlapCount(p.hobbies, customer.hobbies);
        score += hobbyOverlap * 3;

        // City proximity bonus
        if (p.city === customer.city) score += 8;

        // Relocation openness
        if (p.openToRelocate === 'Yes' || customer.openToRelocate === 'Yes') score += 5;

        // Age gap sweetspot (2-5 years younger is ideal)
        const ageDiff = customer.age - p.age;
        if (ageDiff >= 2 && ageDiff <= 5) score += 8;

        return { ...p, compatibilityScore: Math.min(score, 99) };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 15); // Top 15 matches

  } else {
    // ─── Female Client Matching Rules ──────────────────────
    // Score based on: profession category overlap, relocation
    // openness, shared life values, and height preference.
    matches = profiles
      .filter(p => p.gender === 'Male')
      .map(p => {
        let score = 0;

        // Profession category overlap (same field)
        const clientCat = getProfessionCategory(customer.profession);
        const matchCat = getProfessionCategory(p.profession);
        if (clientCat === matchCat) score += 20;

        // Open mindset to relocation
        if (p.openToRelocate === 'Yes') score += 12;
        if (p.openToRelocate === 'Maybe') score += 6;

        // Shared life values (familyValues alignment)
        if (p.familyValues === customer.familyValues) score += 15;

        // Height preference (male should be taller)
        if (p.height > customer.height) score += 15;
        if (p.height > customer.height + 10) score += 5; // Bonus for notably taller

        // Want kids alignment
        if (p.wantKids === customer.wantKids) score += 12;
        if (p.wantKids === 'Maybe' || customer.wantKids === 'Maybe') score += 5;

        // Religion match
        if (p.religion === customer.religion) score += 10;

        // Diet compatibility
        if (p.diet === customer.diet) score += 8;

        // Language overlap
        const langOverlap = overlapCount(p.languages, customer.languages);
        score += langOverlap * 4;

        // Hobby overlap
        const hobbyOverlap = overlapCount(p.hobbies, customer.hobbies);
        score += hobbyOverlap * 3;

        // City match
        if (p.city === customer.city) score += 7;

        // Age compatibility (2-6 years older is preferred)
        const ageDiff = p.age - customer.age;
        if (ageDiff >= 1 && ageDiff <= 6) score += 10;

        // Income stability bonus
        if (p.income >= 20) score += 5;

        return { ...p, compatibilityScore: Math.min(score, 99) };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 15); // Top 15 matches
  }

  res.json({
    customer: { id: customer.id, firstName: customer.firstName, lastName: customer.lastName, gender: customer.gender },
    matchCount: matches.length,
    matches
  });
});

// ══════════════════════════════════════════════════════════════
// ENDPOINT: POST /api/matches/ai-review
// OpenAI-powered compatibility analysis
// ══════════════════════════════════════════════════════════════

router.post('/matches/ai-review', async (req, res) => {
  const { client, match } = req.body;

  if (!client || !match) {
    return res.status(400).json({ error: 'Both client and match profiles are required' });
  }

  // ─── Fallback if OpenAI is not configured ────────────────
  if (!openai) {
    console.log('⚠️  OpenAI not configured — returning mock AI review');
    return res.json(generateMockReview(client, match));
  }

  try {
    const prompt = buildAIPrompt(client, match);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert Indian matchmaker working for "The Date Crew" (TDC), a premium matrimonial service. You analyze compatibility between two profiles and provide warm, culturally sensitive insights. Always respond in valid JSON format.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    // Graceful fallback to mock review on API failure
    res.json(generateMockReview(client, match));
  }
});

// ─── AI Prompt Builder ───────────────────────────────────────

function buildAIPrompt(client, match) {
  return `
Analyze the compatibility between these two profiles for an Indian matrimonial match.

**CLIENT (seeking a match):**
- Name: ${client.firstName} ${client.lastName}
- Gender: ${client.gender}, Age: ${client.age}
- City: ${client.city}, Height: ${client.height} cm
- Religion: ${client.religion}, Caste: ${client.caste}
- Diet: ${client.diet}, Manglik: ${client.manglik}
- Education: ${client.education} from ${client.college}
- Profession: ${client.profession} at ${client.company}
- Income: ${client.income} LPA
- Family Values: ${client.familyValues}
- Want Kids: ${client.wantKids}
- Open to Relocate: ${client.openToRelocate}
- Hobbies: ${(client.hobbies || []).join(', ')}
- Lifestyle: ${client.lifestyle}

**POTENTIAL MATCH:**
- Name: ${match.firstName} ${match.lastName}
- Gender: ${match.gender}, Age: ${match.age}
- City: ${match.city}, Height: ${match.height} cm
- Religion: ${match.religion}, Caste: ${match.caste}
- Diet: ${match.diet}, Manglik: ${match.manglik}
- Education: ${match.education} from ${match.college}
- Profession: ${match.profession} at ${match.company}
- Income: ${match.income} LPA
- Family Values: ${match.familyValues}
- Want Kids: ${match.wantKids}
- Open to Relocate: ${match.openToRelocate}
- Hobbies: ${(match.hobbies || []).join(', ')}
- Lifestyle: ${match.lifestyle}

Respond with a JSON object containing:
{
  "compatibilityScore": <number 1-100>,
  "explanation": "<2-3 sentence natural language explanation of why they are compatible, mentioning specific shared values, lifestyle alignment, and cultural fit>",
  "icebreaker": "<A warm, personalized introductory email (3-4 sentences) from TDC to introduce these two people to each other. Make it professional yet warm, referencing specific shared interests or values.>"
}`;
}

// ─── Mock Review Generator (Fallback) ───────────────────────

function generateMockReview(client, match) {
  // Calculate a basic compatibility score
  let score = 60;
  if (client.religion === match.religion) score += 10;
  if (client.familyValues === match.familyValues) score += 8;
  if (client.wantKids === match.wantKids) score += 7;
  if (client.diet === match.diet) score += 5;
  const hobbyOverlap = overlapCount(client.hobbies, match.hobbies);
  score += hobbyOverlap * 3;
  score = Math.min(score, 95);

  const explanations = [
    `${client.firstName} and ${match.firstName} share a wonderful foundation of ${client.familyValues.toLowerCase()} family values and a mutual love for ${(client.hobbies || [])[0] || 'meaningful connections'}. Their complementary career paths in ${client.profession} and ${match.profession} suggest a dynamic partnership built on mutual respect and ambition.`,
    `With ${client.firstName}'s ${client.lifestyle.toLowerCase()} lifestyle perfectly complementing ${match.firstName}'s interests in ${(match.hobbies || []).slice(0, 2).join(' and ')}, this pairing shows strong potential. Both value ${client.familyValues.toLowerCase()} family dynamics and share aligned views on building a future together.`,
    `${match.firstName}'s background in ${match.profession} pairs beautifully with ${client.firstName}'s ${client.profession} career. Their shared ${client.religion} heritage and compatible outlook on family life create a strong cultural and emotional foundation for a lasting connection.`
  ];

  const icebreakers = [
    `Dear ${client.firstName} and ${match.firstName},\n\nWe at The Date Crew are excited to introduce you! ${client.firstName}, we noticed your passion for ${(client.hobbies || [])[0] || 'adventure'} — and ${match.firstName} shares that same enthusiasm along with a love for ${(match.hobbies || [])[0] || 'creativity'}. We believe your shared values and complementary personalities could make for a truly special connection. We'd love to facilitate a conversation when you're both ready!\n\nWarm regards,\nThe Date Crew Team`,
    `Dear ${client.firstName} and ${match.firstName},\n\nAt The Date Crew, we carefully curate connections that go beyond the surface — and yours stood out to us. ${match.firstName}'s ${match.lifestyle.toLowerCase()} approach to life beautifully complements ${client.firstName}'s energy. With your shared appreciation for ${client.familyValues.toLowerCase()} values, we see the spark of something meaningful here.\n\nLooking forward to making magic happen,\nThe Date Crew Team`
  ];

  return {
    compatibilityScore: score,
    explanation: explanations[Math.floor(Math.random() * explanations.length)],
    icebreaker: icebreakers[Math.floor(Math.random() * icebreakers.length)]
  };
}

module.exports = router;
