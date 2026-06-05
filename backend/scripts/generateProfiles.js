/**
 * ──────────────────────────────────────────────────────────────
 * TDC Profile Generator
 * Generates 110 realistic Indian dummy profiles for the
 * matchmaking pool. Outputs to ../data/profiles.json
 * ──────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');

// ─── Seed Data ───────────────────────────────────────────────

const maleFirstNames = [
  'Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Ayaan','Krishna','Ishaan',
  'Shaurya','Atharv','Advait','Dhruv','Kabir','Ritvik','Aarush','Kian','Darsh','Ranveer',
  'Rohan','Vikram','Nikhil','Raj','Amit','Sahil','Kunal','Manish','Harsh','Pranav',
  'Dev','Aryan','Yash','Siddharth','Varun','Ankit','Rahul','Akash','Gaurav','Mohit',
  'Tushar','Abhishek','Kartik','Neeraj','Piyush','Tarun','Vishal','Chirag','Deepak','Ashwin'
];

const femaleFirstNames = [
  'Ananya','Diya','Aanya','Aadhya','Aarohi','Saanvi','Myra','Ishita','Kavya','Riya',
  'Priya','Neha','Shreya','Pooja','Megha','Nisha','Tanvi','Swati','Aditi','Kriti',
  'Simran','Jhanvi','Aisha','Zara','Kiara','Avni','Ira','Mira','Tara','Naina',
  'Sanya','Radhika','Meera','Anjali','Divya','Sakshi','Pallavi','Sneha','Nikita','Ritika',
  'Bhavna','Komal','Aakriti','Trisha','Parul','Mansi','Isha','Vrinda','Lavanya','Charvi'
];

const lastNames = [
  'Sharma','Verma','Gupta','Singh','Patel','Mehta','Reddy','Nair','Iyer','Joshi',
  'Kapoor','Malhotra','Chopra','Bhatia','Agarwal','Bansal','Saxena','Mishra','Tiwari','Pandey',
  'Rao','Deshmukh','Kulkarni','Desai','Shah','Menon','Pillai','Kumar','Chauhan','Thakur',
  'Srivastava','Dutta','Bose','Sen','Mukherjee','Chatterjee','Ghosh','Das','Roy','Choudhary'
];

const cities = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad',
  'Jaipur','Lucknow','Chandigarh','Indore','Bhopal','Nagpur','Kochi','Coimbatore',
  'Surat','Vadodara','Gurgaon','Noida'
];

const religions = ['Hindu','Muslim','Sikh','Christian','Jain','Buddhist'];
const castes = ['Brahmin','Kshatriya','Vaishya','Kayastha','Rajput','Maratha','Agarwal','Jat','Patel','General','OBC','Reddy','Nair','Iyer','Iyengar','Khatri','Arora','Open'];
const diets = ['Vegetarian','Non-Vegetarian','Eggetarian','Vegan','Jain Vegetarian'];
const maritalStatuses = ['Never Married','Divorced','Widowed'];
const familyValues = ['Traditional','Moderate','Liberal'];
const educations = ['B.Tech','MBA','B.Com','CA','MBBS','BBA','M.Tech','LLB','B.Arch','BDS','MCA','B.Sc','M.Sc','PhD','B.Des'];
const colleges = [
  'IIT Delhi','IIT Bombay','IIM Ahmedabad','BITS Pilani','NIT Trichy','Delhi University',
  'St. Xavier\'s College','Christ University','Symbiosis Pune','SRCC Delhi',
  'Amity University','VIT Vellore','Manipal University','Anna University','ISB Hyderabad',
  'NIFT Delhi','IIT Kanpur','IIT Madras','NMIMS Mumbai','SP Jain Mumbai'
];

const professions = [
  'Software Engineer','Data Scientist','Product Manager','Doctor','Lawyer','Chartered Accountant',
  'Investment Banker','Consultant','Architect','Civil Engineer','Marketing Manager','HR Manager',
  'UX Designer','Business Analyst','Entrepreneur','Teacher','Content Writer','Journalist',
  'Pilot','Fashion Designer','Dentist','Pharmacist','Research Scientist','Government Officer'
];

const companies = [
  'Google','Microsoft','Amazon','Infosys','TCS','Wipro','Goldman Sachs','McKinsey',
  'Deloitte','HDFC Bank','ICICI Bank','Reliance Industries','Tata Motors','Flipkart',
  'Zomato','Swiggy','Paytm','PhonePe','Mahindra','L&T','Apollo Hospitals',
  'Max Healthcare','Self-Employed','Government Sector','EY','PwC','KPMG','Accenture'
];

const languages = ['Hindi','English','Marathi','Tamil','Telugu','Kannada','Bengali','Gujarati','Punjabi','Malayalam','Urdu','Odia'];
const hobbies = ['Reading','Traveling','Cooking','Yoga','Photography','Music','Dancing','Painting','Gym','Hiking','Swimming','Meditation','Cricket','Gardening','Writing','Movies'];
const lifestyles = ['Early Riser','Night Owl','Fitness Enthusiast','Social Butterfly','Homebody','Adventurous','Spiritual','Workaholic','Balanced'];

const wantKidsOptions = ['Yes','No','Maybe'];
const relocateOptions = ['Yes','No','Maybe'];
const petsOptions = ['Yes','No','Maybe'];
const manglikOptions = ['Yes','No','Not Sure'];

// ─── Utility Functions ───────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, min, max) {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generateDOB(age) {
  const year = 2026 - age;
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateHeight(gender) {
  // Heights in cm — realistic Indian ranges
  if (gender === 'Male') return randomInt(165, 190);
  return randomInt(150, 175);
}

function generateIncome(education) {
  // Income in lakhs per annum
  const premiumEdu = ['IIT Delhi','IIT Bombay','IIM Ahmedabad','ISB Hyderabad','IIT Kanpur','IIT Madras'];
  const base = premiumEdu.some(c => education === c) ? 20 : 6;
  return randomInt(base, 60);
}

// ─── Profile Generator ──────────────────────────────────────

function generateProfile(id, gender) {
  const firstName = gender === 'Male' ? pick(maleFirstNames) : pick(femaleFirstNames);
  const lastName = pick(lastNames);
  const age = gender === 'Male' ? randomInt(25, 38) : randomInt(22, 35);
  const college = pick(colleges);

  return {
    id,
    firstName,
    lastName,
    gender,
    age,
    dob: generateDOB(age),
    city: pick(cities),
    height: generateHeight(gender),
    religion: pick(religions),
    caste: pick(castes),
    manglik: pick(manglikOptions),
    diet: pick(diets),
    education: pick(educations),
    college,
    profession: pick(professions),
    company: pick(companies),
    income: generateIncome(college),
    maritalStatus: pick(maritalStatuses),
    familyValues: pick(familyValues),
    wantKids: pick(wantKidsOptions),
    openToRelocate: pick(relocateOptions),
    openToPets: pick(petsOptions),
    languages: pickN(languages, 2, 4),
    siblings: randomInt(0, 3),
    lifestyle: pick(lifestyles),
    hobbies: pickN(hobbies, 2, 5),
    bio: generateBio(firstName, gender, age)
  };
}

function generateBio(name, gender, age) {
  const bios = [
    `${name} is a ${age}-year-old professional who values meaningful connections and personal growth.`,
    `A driven and compassionate individual, ${name} enjoys balancing career ambitions with a vibrant social life.`,
    `${name} believes in building a life filled with love, laughter, and shared adventures.`,
    `With a warm heart and an ambitious mind, ${name} is looking for a partner who shares similar values.`,
    `${name} is passionate about making a difference and finding someone to share life's beautiful journey.`,
    `A firm believer in kindness and integrity, ${name} seeks a genuine connection built on mutual respect.`,
    `${name} combines traditional values with a modern outlook, seeking a partner who appreciates both.`,
    `Life enthusiast and career-driven, ${name} is ready to find that special someone to share it all with.`
  ];
  return pick(bios);
}

// ─── Generate & Save ─────────────────────────────────────────

const profiles = [];
let id = 1;

// Generate 55 female profiles
for (let i = 0; i < 55; i++) {
  profiles.push(generateProfile(id++, 'Female'));
}

// Generate 55 male profiles
for (let i = 0; i < 55; i++) {
  profiles.push(generateProfile(id++, 'Male'));
}

const outputPath = path.join(__dirname, '..', 'data', 'profiles.json');
fs.writeFileSync(outputPath, JSON.stringify(profiles, null, 2), 'utf-8');
console.log(`✅ Generated ${profiles.length} profiles → ${outputPath}`);
