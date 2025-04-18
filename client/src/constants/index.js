import {
  benefitIcon1,
  benefitIcon2,
  benefitIcon3,
  benefitIcon4,
  benefitImage, 
  benefitImage2,
  chromecast,
  disc02,
  file02,
  homeSmile,
  instagram,
  plusSquare,
  recording01,
  recording03,
  searchMd,
  sliders04,
  yourlogo,
} from "../assets";


export const heroIcons = [homeSmile, file02, searchMd, plusSquare];


export const companyLogos = [yourlogo, yourlogo, yourlogo, yourlogo, yourlogo];

export const brainwaveServices = [
  "Photo generating",
  "Photo enhance",
  "Seamless Integration",
];

export const brainwaveServicesIcons = [
  recording03,
  recording01,
  disc02,
  chromecast,
  sliders04,
];
export const pricing = [
  {
    id: "0",
    title: "Basic",
    description: "AI chatbot, personalized recommendations",
    price: "0",
    features: [
      "An AI chatbot that can understand your queries",
      "Personalized recommendations based on your preferences",
      "Ability to explore the app and its features without any cost",
    ],
  },
  {
    id: "1",
    title: "Premium",
    description: "Advanced AI chatbot, priority support, analytics dashboard",
    price: "9.99",
    features: [
      "An advanced AI chatbot that can understand complex queries",
      "An analytics dashboard to track your conversations",
      "Priority support to solve issues quickly",
    ],
  },
  {
    id: "2",
    title: "Enterprise",
    description: "Custom AI chatbot, advanced analytics, dedicated account",
    price: null,
    features: [
      "An AI chatbot that can understand your queries",
      "Personalized recommendations based on your preferences",
      "Ability to explore the app and its features without any cost",
    ],
  },
];

export const benefits = [
  {
    id: "0",
    title: "Personalized AI Chatbot",
    text: "Experience a truly tailored therapeutic journey with our advanced AI chatbot that adapts to your communication style, preferences, and emotional needs for meaningful conversations.",
    backgroundUrl: "./src/assets/benefits/card-1.svg",
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: "1",
    title: "Facial Emotion Recognition",
    text: "Our cutting-edge technology analyses facial expressions during video sessions to better understand your emotional state, allowing for more responsive and empathetic AI support.",
    backgroundUrl: "./src/assets/benefits/card-2.svg",
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: "2",
    title: "Voice Calling Feature",
    text: "Connect through high-quality voice calls when you prefer speaking over typing, with advanced vocal tone analysis to provide nuanced emotional support during conversations.",
    backgroundUrl: "./src/assets/benefits/card-3.svg",
    iconUrl: benefitIcon3,
    imageUrl: benefitImage2,
  },
  {
    id: "3",
    title: "Interactive 3D Avatar",
    text: "Engage with a realistic 3D avatar that responds with appropriate facial expressions and body language, creating a more human-like therapeutic experience.",
    backgroundUrl: "./src/assets/benefits/card-4.svg",
    iconUrl: benefitIcon4,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: "4",
    title: "Emotional Landscape Dashboard",
    text: "Visualize your emotional journey through an intuitive dashboard that tracks patterns, progress, and insights, helping you understand your mental health trajectory over time.",
    backgroundUrl: "./src/assets/benefits/card-5.svg",
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: "5",
    title: "Self-Assessment & Community Forum",
    text: "Access powerful self-assessment tools and connect with others in a moderated community forum, combining AI-guided personal reflection with peer support in a safe environment.",
    backgroundUrl: "./src/assets/benefits/card-6.svg",
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
  },
];