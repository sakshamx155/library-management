export type ResourceType = 'Textbook' | 'Research Paper' | 'Study Guide' | 'Notes' | 'Video Lecture';
export type Subject = 'Computer Science' | 'Mathematics' | 'Physics' | 'Literature' | 'History' | 'Biology';

export interface Resource {
  id: string;
  title: string;
  author: string;
  subject: Subject;
  resource_type: ResourceType;
  file_url: string;
  downloads: number;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  thumbnail?: string;
  description: string;
  tags?: string[];
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  progress?: number; // Gamification metric (0 - 100)
}

export interface LeaderboardContributor {
  id: string;
  name: string;
  points: number;
  badges: string[];
  avatarFallback: string;
}

export const mockLeaderboard: LeaderboardContributor[] = [
  { id: "1", name: "Dr. Alan T.", points: 4850, badges: ["Research Ninja", "Topic Master"], avatarFallback: "AT" },
  { id: "2", name: "Marie Curie", points: 4120, badges: ["Topic Master", "Speed Reader"], avatarFallback: "MC" },
  { id: "3", name: "Grace Hopper", points: 3900, badges: ["Bug Hunter"], avatarFallback: "GH" },
  { id: "4", name: "Isaac N.", points: 2840, badges: ["Physics Whiz"], avatarFallback: "IN" },
  { id: "5", name: "Ada L.", points: 2100, badges: ["Early Adopter"], avatarFallback: "AL" },
];

export const mockResources: Resource[] = [
  {
    id: "1",
    title: "Introduction to Algorithm Analysis",
    author: "Dr. Elena Rostova",
    subject: "Computer Science",
    resource_type: "Textbook",
    file_url: "#",
    thumbnail: "/images/book_cover_algo_1775579636199.png",
    downloads: 12400,
    rating: 4.8,
    reviewsCount: 342,
    createdAt: "2024-01-15T10:00:00Z",
    description: "A comprehensive guide to understanding algorithmic complexity and data structures.",
    tags: ["Algorithms", "Big O", "Data Structures"],
    difficulty: "Intermediate",
    progress: 100,
  },
  {
    id: "2",
    title: "Quantum Mechanics Fundamentals",
    author: "James H. Clark",
    subject: "Physics",
    resource_type: "Study Guide",
    file_url: "#",
    thumbnail: "/images/book_cover_quantum_1775579655601.png",
    downloads: 8520,
    rating: 4.6,
    reviewsCount: 156,
    createdAt: "2024-02-12T14:30:00Z",
    description: "Essential study notes covering wave-particle duality and Schrödinger's equation.",
    tags: ["Physics", "Waves", "Atoms"],
    difficulty: "Advanced",
    progress: 45,
  },
  {
    id: "3",
    title: "Advanced Calculus: Real Analysis",
    author: "Prof. Alan Smith",
    subject: "Mathematics",
    resource_type: "Textbook",
    file_url: "#",
    thumbnail: "/images/book_cover_calculus_1775579673776.png",
    downloads: 15600,
    rating: 4.9,
    reviewsCount: 512,
    createdAt: "2023-11-05T09:15:00Z",
    description: "In-depth textbook on real analysis, limits, and measure theory.",
    tags: ["Math", "Integrals", "Limits"],
    difficulty: "Advanced",
  },
  {
    id: "4",
    title: "Machine Learning with Neural Networks",
    author: "Sarah Jenkins & Wei Lin",
    subject: "Computer Science",
    resource_type: "Research Paper",
    file_url: "#",
    thumbnail: "/images/book_cover_ml_1775579692553.png",
    downloads: 5300,
    rating: 4.7,
    reviewsCount: 89,
    createdAt: "2024-03-20T16:45:00Z",
    description: "Recent findings on optimizing deep neural networks for edge devices.",
    tags: ["AI", "Neural Networks", "Optimization"],
    difficulty: "Advanced",
  },
  {
    id: "5",
    title: "The Industrial Revolution in Europe",
    author: "Dr. Markus Weber",
    subject: "History",
    resource_type: "Notes",
    file_url: "#",
    thumbnail: "/images/book_cover_history_1775579710122.png",
    downloads: 3200,
    rating: 4.4,
    reviewsCount: 45,
    createdAt: "2024-04-01T11:20:00Z",
    description: "Handwritten transcriptions and notes summarizing key industrial milestones.",
    tags: ["Europe", "Revolution", "Steam"],
    difficulty: "Beginner",
    progress: 15,
  },
  {
    id: "6",
    title: "Cellular Biology: A Visual Approach",
    author: "Dr. Emily Chen",
    subject: "Biology",
    resource_type: "Textbook",
    file_url: "#",
    thumbnail: "/images/book_cover_biology_1775579728632.png",
    downloads: 9800,
    rating: 4.9,
    reviewsCount: 221,
    createdAt: "2023-09-18T08:00:00Z",
    description: "Highly visual textbook designed to explain cellular structures and processes.",
    tags: ["Cells", "DNA", "Genetics"],
    difficulty: "Beginner",
  }
];

// Authentication Mocks
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student' | 'educator';
}

export const mockUsers: User[] = [
  { id: '1', email: 'sakshamx155@gmail.com', role: 'admin' },
  { id: '2', email: 'student@example.com', role: 'student' }
];

// Simple in-memory cache for OTP checking: email -> { otp: string, expiresAt: number }
// Note: In Next.js App Router API dev environment, this memory cache might reset on hot-reloads,
// but it is perfect for testing the standard flow within a single session.
const globalAny: any = global;
if (!globalAny.otpCache) {
  globalAny.otpCache = {};
}
export const otpCache: Record<string, { otp: string, expiresAt: number }> = globalAny.otpCache;

// Gamification & Recommendation User State
export const activeUserProfile = {
  name: "Saksham",
  interests: ["Computer Science", "Physics"] as Subject[],
};

// --- HELPER ALGORITHMS ---

export const searchResources = (query: string, subjectFilter: string, typeFilter: string) => {
  let results = [...mockResources];
  
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(r => 
      r.title.toLowerCase().includes(q) || 
      r.author.toLowerCase().includes(q) ||
      r.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }
  
  if (subjectFilter) {
    results = results.filter(r => r.subject === subjectFilter);
  }
  
  if (typeFilter) {
    results = results.filter(r => r.resource_type === typeFilter);
  }
  
  return results;
};

// "For You" Feed heuristic logic
export const getForYouResources = () => {
  return mockResources
    .filter(r => activeUserProfile.interests.includes(r.subject))
    // Suggesting things you haven't inherently finished
    .filter(r => (r.progress || 0) < 100) 
    .sort((a, b) => b.rating - a.rating); // Best ones first
};

// Trending Logic based on raw download popularity
export const getTrendingResources = () => {
  return [...mockResources].sort((a, b) => b.downloads - a.downloads).slice(0, 4);
};
