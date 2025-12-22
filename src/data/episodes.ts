import { Episode } from "@/types/godcast";

export const episodes: Episode[] = [
  {
    id: "nature-of-reality",
    title: "The Nature of Reality",
    description: "What is real? Our guests explore perception, consciousness, and the fabric of existence itself.",
    topic: "What is the true nature of reality? Is there an objective reality, or is everything subjective perception?",
    participants: ["plato", "morpheus", "alan-watts", "buddha"],
    duration: "12 min",
    createdAt: "2024-01-15",
    isFeatured: true,
  },
  {
    id: "meaning-of-life",
    title: "The Meaning of Life",
    description: "Why are we here? Our philosophers tackle humanity's greatest question.",
    topic: "What gives life meaning? Is meaning found, created, or an illusion?",
    participants: ["nietzsche", "buddha", "confucius", "carl-jung"],
    duration: "15 min",
    createdAt: "2024-01-20",
    isFeatured: true,
  },
  {
    id: "free-will-vs-destiny",
    title: "Free Will vs Destiny",
    description: "Are we truly free to choose, or is everything predetermined?",
    topic: "Do humans have free will, or are our choices determined by prior causes?",
    participants: ["marcus-aurelius", "morpheus", "einstein", "lao-tzu"],
    duration: "14 min",
    createdAt: "2024-02-01",
  },
  {
    id: "consciousness-explored",
    title: "Consciousness Explored",
    description: "What is consciousness? Where does it come from? Can it exist beyond the body?",
    topic: "What is the nature of consciousness? Is it produced by the brain or something more fundamental?",
    participants: ["terence-mckenna", "carl-jung", "alan-watts", "buddha"],
    duration: "16 min",
    createdAt: "2024-02-10",
    isFeatured: true,
  },
  {
    id: "morality-modern-world",
    title: "Morality in the Modern World",
    description: "In an age of relativism, what does it mean to be good?",
    topic: "Are there universal moral truths, or is morality relative to culture and time?",
    participants: ["confucius", "nietzsche", "gandhi", "simone-de-beauvoir"],
    duration: "13 min",
    createdAt: "2024-02-15",
  },
  {
    id: "love-and-connection",
    title: "Love and Connection",
    description: "The greatest force in the universe—examined from every angle.",
    topic: "What is the nature of love? Is it biological, spiritual, or both?",
    participants: ["rumi", "plato", "carl-jung", "simone-de-beauvoir"],
    duration: "14 min",
    createdAt: "2024-02-20",
  },
  {
    id: "death-and-beyond",
    title: "Death and Beyond",
    description: "What happens when we die? Our guests share their perspectives on mortality.",
    topic: "What is death? Is there anything beyond it, or is it the final end?",
    participants: ["socrates", "buddha", "marcus-aurelius", "yoda"],
    duration: "15 min",
    createdAt: "2024-03-01",
  },
  {
    id: "power-of-mind",
    title: "The Power of the Mind",
    description: "Exploring the unlimited potential within human consciousness.",
    topic: "What are the limits of the human mind? Can consciousness shape reality?",
    participants: ["morpheus", "einstein", "yoda", "terence-mckenna"],
    duration: "14 min",
    createdAt: "2024-03-10",
  },
  {
    id: "wisdom-of-ages",
    title: "Wisdom of the Ages",
    description: "East meets West in this epic dialogue across civilizations.",
    topic: "What universal truths have humans discovered across different cultures and eras?",
    participants: ["lao-tzu", "socrates", "confucius", "rumi"],
    duration: "16 min",
    createdAt: "2024-03-15",
  },
  {
    id: "future-of-humanity",
    title: "The Future of Humanity",
    description: "Where is humanity headed? A prophetic discussion about our species' destiny.",
    topic: "What does the future hold for humanity? Will we transcend or destroy ourselves?",
    participants: ["nietzsche", "gandhi", "einstein", "alan-watts"],
    duration: "15 min",
    createdAt: "2024-03-20",
    isFeatured: true,
  },
];

export const getEpisodeById = (id: string): Episode | undefined => {
  return episodes.find((ep) => ep.id === id);
};

export const getFeaturedEpisodes = (): Episode[] => {
  return episodes.filter((ep) => ep.isFeatured);
};
