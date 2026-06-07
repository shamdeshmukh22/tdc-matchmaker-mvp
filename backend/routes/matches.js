// Matchmaking logic - scores potential matches based on compatibility factors like age, religion, hobbies, etc

const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/sentRequests.json');
// Initialize Groq client if API key is available

let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// Map professions to broader categories (tech, finance, healthcare, etc)
const professionCategories = {
  'Tech': ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Business Analyst'],
  'Finance': ['Investment Banker', 'Chartered Accountant', 'Consultant'],
  'Healthcare': ['Doctor', 'Dentist', 'Pharmacist', 'Research Scientist'],
  'Creative': ['Fashion Designer', 'Content Writer', 'Journalist', 'Architect'],
  'Corporate': ['Marketing Manager', 'HR Manager', 'Entrepreneur'],
  'Public': ['Lawyer', 'Government Officer', 'Teacher', 'Pilot'],
  'Engineering': ['Civil Engineer']
};

// Find which category a profession belongs to
function getProfessionCategory(profession) {
  for (const [category, profs] of Object.entries(professionCategories)) {
    if (profs.includes(profession)) return category;
  }
  return 'Other';
}

// Count how many items appear in both arrays (useful for shared hobbies, languages, etc)
function overlapCount(arr1, arr2) {
  if (!arr1 || !arr2) return 0;
  return arr1.filter(item => arr2.includes(item)).length;
}

// Get match suggestions for a customer based on gender-specific filtering rules

router.get('/customers/:id/matches', (req, res) => {
  const { customers, profiles } = req.app.locals;
  const customer = customers.find(c => c.id === req.params.id);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  let matches = [];

  if (customer.gender === 'Male') {
    // Different rules for male vs female clients
    // Males get younger, shorter women with lower income
    // Females get guys from similar profession, good height, right mindset
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
        // Score based on compatibility factors
        let score = 50; // Start at 50 and add bonuses for matches

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
    // For female clients, score based on profession match, height, relocation willingness, and values
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

// AI Compatibility Review

router.post('/matches/ai-review', async (req, res) => {
  const { client, match } = req.body;

  if (!client || !match) {
    return res.status(400).json({ error: 'Both client and match profiles are required' });
  }

  // Use Groq if available, otherwise send mock review
  if (!groq) {
    console.log('⚠️  Groq not configured — returning mock AI review');
    return res.json(generateMockReview(client, match));
  }

  try {
    const prompt = buildAIPrompt(client, match);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
    console.error('Groq API Error:', error.message);
    // Graceful fallback to mock review on API failure
    res.json(generateMockReview(client, match));
  }
});

// Build the AI prompt with both profiles
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

// Generate a mock review when OpenAI isn't available or fails

// Generate a mock review when OpenAI isn't available or fails
function generateMockReview(client, match) {
  // Calculate a basic compatibility score with shared attributes as bonuses with shared attributes as bonuses
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

// ENDPOINT: POST /api/matches/send
// Log a sent match proposal to the audit trail




// Get all sent match proposals from the audit trail
router.get('/matches/audit-trail', (req, res) => {
  const { sentRequests } = req.app.locals;

  // Return complete audit trail
  res.json({
    success: true,
    count: sentRequests.length,
    requests: sentRequests
  });
});



router.post('/matches/send', (req, res) => {
  const { sentBy, clientId, clientName, matchId, matchName } = req.body;

  // 1. Validate existence
  const { customers, profiles } = req.app.locals;
  const client = customers.find(c => c.id === clientId);
  const match = profiles.find(p => p.id === matchId);

  if (!client || !match) {
    return res.status(404).json({ error: "Client or Match profile not found" });
  }

  try {
    // 2. Load and Update
    const rawData = fs.readFileSync(filePath, 'utf8');
    const requests = JSON.parse(rawData);

    const newRequest = {
      requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      sentBy,
      clientId,
      clientName,
      matchId,
      matchName,
      dateSent: new Date().toISOString(),
      statusTag: 'Awaiting Family Review'
    };

    requests.unshift(newRequest); // Add to top
    
    // 3. Save
    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2));
    req.app.locals.sentRequests = requests; // Update memory

    res.status(201).json({ success: true, request: newRequest });
  } catch (err) {
    res.status(500).json({ error: "Server error while saving" });
  }
});

module.exports = router;
