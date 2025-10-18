// Comprehensive skill categories for the gig marketplace
export const SKILL_CATEGORIES = {
  "Art & Creative": [
    "Graphic Design",
    "Illustration",
    "Photography",
    "Videography",
    "Video Editing",
    "Animation",
    "3D Modeling",
    "UI/UX Design",
    "Logo Design",
    "Branding",
    "Drawing & Painting",
    "Crafts & Handmade",
    "Music Production",
    "Audio Editing",
    "Voice Over",
  ],
  "IT & Technology": [
    "Web Development",
    "Mobile App Development",
    "Software Development",
    "Database Management",
    "System Administration",
    "Network Setup",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "IT Support",
    "Computer Repair",
    "Data Analysis",
    "Machine Learning",
    "AI Development",
  ],
  "Writing & Content": [
    "Content Writing",
    "Copywriting",
    "Technical Writing",
    "Creative Writing",
    "Blogging",
    "Proofreading & Editing",
    "Translation",
    "Transcription",
    "Resume Writing",
    "Social Media Content",
    "SEO Writing",
    "Script Writing",
  ],
  "Business & Marketing": [
    "Digital Marketing",
    "Social Media Marketing",
    "Email Marketing",
    "SEO & SEM",
    "Content Marketing",
    "Brand Management",
    "Market Research",
    "Business Strategy",
    "Project Management",
    "Product Management",
    "Sales",
    "Customer Service",
    "Virtual Assistant",
    "Data Entry",
    "Administrative Support",
  ],
  "Education & Training": [
    "Tutoring - Math",
    "Tutoring - Science",
    "Tutoring - English",
    "Tutoring - Languages",
    "Music Lessons",
    "Art Lessons",
    "Fitness Training",
    "Coaching & Mentoring",
    "Curriculum Development",
    "Educational Content Creation",
  ],
  "Delivery & Logistics": [
    "Package Delivery",
    "Food Delivery",
    "Grocery Shopping & Delivery",
    "Courier Services",
    "Moving & Relocation",
    "Warehouse Management",
    "Inventory Management",
    "Supply Chain",
  ],
  "Home & Lifestyle": [
    "Cleaning Services",
    "Laundry Services",
    "Cooking & Catering",
    "Baking",
    "Gardening & Landscaping",
    "Home Repair",
    "Plumbing",
    "Electrical Work",
    "Carpentry",
    "Painting & Decorating",
    "Interior Design",
    "Pet Care",
    "Childcare & Babysitting",
    "Elderly Care",
  ],
  "Events & Entertainment": [
    "Event Planning",
    "Event Coordination",
    "MC/Host",
    "DJ Services",
    "Live Music",
    "Photography - Events",
    "Videography - Events",
    "Catering - Events",
    "Decoration",
    "Security - Events",
  ],
  "Fashion & Beauty": [
    "Makeup Artistry",
    "Hair Styling",
    "Nail Services",
    "Fashion Design",
    "Tailoring & Alterations",
    "Personal Styling",
    "Fashion Photography",
    "Modeling",
  ],
  "Automotive": [
    "Car Repair",
    "Car Detailing",
    "Car Wash",
    "Mechanic Services",
    "Tire Services",
    "Auto Painting",
    "Driver Services",
  ],
  "Health & Wellness": [
    "Personal Training",
    "Yoga Instruction",
    "Massage Therapy",
    "Nutrition Consulting",
    "Mental Health Support",
    "Physical Therapy",
    "Nursing Services",
  ],
  "Skilled Trades": [
    "Welding",
    "Metalwork",
    "Roofing",
    "Tiling",
    "HVAC Services",
    "Generator Repair",
    "Solar Installation",
    "Construction",
    "Bricklaying",
  ],
};

// Flatten all skills for easy access
export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

// Gig categories
export const GIG_CATEGORIES = [
  { value: "delivery", label: "Delivery & Logistics" },
  { value: "tutoring", label: "Education & Tutoring" },
  { value: "cleaning", label: "Cleaning & Home Services" },
  { value: "data-entry", label: "Data Entry & Admin" },
  { value: "social-media", label: "Social Media & Marketing" },
  { value: "photography", label: "Photography & Videography" },
  { value: "content-creation", label: "Content Creation & Writing" },
  { value: "customer-service", label: "Customer Service" },
  { value: "handyman", label: "Handyman & Repairs" },
  { value: "event-assistance", label: "Event Assistance" },
  { value: "it-tech", label: "IT & Technology" },
  { value: "art-design", label: "Art & Design" },
  { value: "business", label: "Business & Consulting" },
  { value: "health-wellness", label: "Health & Wellness" },
  { value: "fashion-beauty", label: "Fashion & Beauty" },
  { value: "automotive", label: "Automotive Services" },
  { value: "other", label: "Other Services" },
];

// Nigerian states grouped by geopolitical zones
export const NIGERIAN_STATES = {
  "North Central": [
    "Benue",
    "Kogi",
    "Kwara",
    "Nasarawa",
    "Niger",
    "Plateau",
    "Federal Capital Territory (Abuja)",
  ],
  "North East": [
    "Adamawa",
    "Bauchi",
    "Borno",
    "Gombe",
    "Taraba",
    "Yobe",
  ],
  "North West": [
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Sokoto",
    "Zamfara",
  ],
  "South East": [
    "Abia",
    "Anambra",
    "Ebonyi",
    "Enugu",
    "Imo",
  ],
  "South South": [
    "Akwa Ibom",
    "Bayelsa",
    "Cross River",
    "Delta",
    "Edo",
    "Rivers",
  ],
  "South West": [
    "Ekiti",
    "Lagos",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
  ],
};

// All states flattened
export const ALL_NIGERIAN_STATES = Object.values(NIGERIAN_STATES).flat();

// Countries with their states/regions
export interface LocationData {
  country: string;
  states: string[] | { [zone: string]: string[] };
}

export const COUNTRIES_WITH_STATES: LocationData[] = [
  {
    country: "Nigeria",
    states: NIGERIAN_STATES,
  },
  {
    country: "Ghana",
    states: [
      "Greater Accra",
      "Ashanti",
      "Western",
      "Central",
      "Eastern",
      "Volta",
      "Northern",
      "Upper East",
      "Upper West",
      "Brong-Ahafo",
    ],
  },
  {
    country: "Kenya",
    states: [
      "Nairobi",
      "Mombasa",
      "Kisumu",
      "Nakuru",
      "Eldoret",
      "Thika",
      "Malindi",
      "Kitale",
    ],
  },
  {
    country: "South Africa",
    states: [
      "Gauteng",
      "Western Cape",
      "Eastern Cape",
      "KwaZulu-Natal",
      "Free State",
      "Limpopo",
      "Mpumalanga",
      "North West",
      "Northern Cape",
    ],
  },
  {
    country: "Remote",
    states: ["Remote - Anywhere"],
  },
];

// Helper function to get states for a country
export function getStatesForCountry(country: string): string[] {
  const countryData = COUNTRIES_WITH_STATES.find((c) => c.country === country);
  if (!countryData) return [];

  if (Array.isArray(countryData.states)) {
    return countryData.states;
  } else {
    // Flatten grouped states (like Nigerian zones)
    return Object.values(countryData.states).flat();
  }
}

// Helper function to get grouped states (for countries like Nigeria with zones)
export function getGroupedStatesForCountry(country: string): { [zone: string]: string[] } | null {
  const countryData = COUNTRIES_WITH_STATES.find((c) => c.country === country);
  if (!countryData) return null;

  if (!Array.isArray(countryData.states)) {
    return countryData.states;
  }
  return null;
}

export const COUNTRIES = COUNTRIES_WITH_STATES.map((c) => c.country);
