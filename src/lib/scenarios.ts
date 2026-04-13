import type { Scenario, ScenarioCategory } from './types';

export const SCENARIOS: Scenario[] = [
  // ═══════════════════════════════════════
  // 🤪 ABSURD
  // ═══════════════════════════════════════
  { text: "Convince me you should be the last human on Earth.", category: "absurd", difficulty: 2 },
  { text: "Argue that the alphabet should be reorganized alphabetically.", category: "absurd", difficulty: 3 },
  { text: "Defend your belief that the moon landing was real, but the moon itself is fake.", category: "absurd", difficulty: 2 },
  { text: "Convince the court that you are a time traveler from the year 3000.", category: "absurd", difficulty: 2 },
  { text: "Justify why everyone should be required to communicate strictly in interpretive dance.", category: "absurd", difficulty: 3 },
  { text: "Argue that pigeons are secretly government surveillance drones.", category: "absurd", difficulty: 1 },
  { text: "Explain why gravity is just a suggestion.", category: "absurd", difficulty: 3 },
  { text: "Convince me that mirrors are portals to a parallel universe.", category: "absurd", difficulty: 2 },
  { text: "Argue that sleep is a government conspiracy to steal 8 hours of your day.", category: "absurd", difficulty: 1 },
  { text: "Defend the position that clouds are actually giant sky sheep.", category: "absurd", difficulty: 2 },
  { text: "Prove that Tuesday doesn't actually exist.", category: "absurd", difficulty: 3 },

  // ═══════════════════════════════════════
  // 🧠 PHILOSOPHICAL
  // ═══════════════════════════════════════
  { text: "Argue that nothing is real and we're all in a simulation, but that's actually a good thing.", category: "philosophical", difficulty: 3 },
  { text: "Convince me that math was invented by an evil wizard to torture children.", category: "philosophical", difficulty: 1 },
  { text: "Defend the idea that ignorance really IS bliss and everyone should know less.", category: "philosophical", difficulty: 2 },
  { text: "Argue that free will doesn't exist, therefore nothing is anyone's fault.", category: "philosophical", difficulty: 3 },
  { text: "Make the case that the meaning of life is to collect as many socks as possible.", category: "philosophical", difficulty: 2 },
  { text: "Argue that deja vu proves time travel exists and we've all already lived this life.", category: "philosophical", difficulty: 2 },
  { text: "Convince the court that dreams are actually memories from alternate timelines.", category: "philosophical", difficulty: 3 },

  // ═══════════════════════════════════════
  // 😅 PERSONAL
  // ═══════════════════════════════════════
  { text: "Justify why you listed 'expert procrastinator' on your resume.", category: "personal", difficulty: 1 },
  { text: "Explain why you deserve a refund for your college degree.", category: "personal", difficulty: 1 },
  { text: "Defend your life choices to a panel of judgmental cats.", category: "personal", difficulty: 2 },
  { text: "Convince your future self that everything you're doing right now makes total sense.", category: "personal", difficulty: 2 },
  { text: "Argue why your most embarrassing moment was actually a power move.", category: "personal", difficulty: 1 },
  { text: "Defend why you stayed up until 4 AM doing absolutely nothing productive.", category: "personal", difficulty: 1 },
  { text: "Explain to your childhood self why you turned out this way.", category: "personal", difficulty: 2 },
  { text: "Justify why your screen time report is actually a sign of intelligence.", category: "personal", difficulty: 1 },

  // ═══════════════════════════════════════
  // 🎬 POP CULTURE
  // ═══════════════════════════════════════
  { text: "Explain why reality TV is the peak of human culture.", category: "pop-culture", difficulty: 1 },
  { text: "Explain to aliens why humanity's greatest achievement is the meme.", category: "pop-culture", difficulty: 1 },
  { text: "Argue that every movie would be improved by adding a car chase scene.", category: "pop-culture", difficulty: 1 },
  { text: "Defend the claim that social media influencers should replace world leaders.", category: "pop-culture", difficulty: 2 },
  { text: "Convince the court that TikTok dances should be an Olympic sport.", category: "pop-culture", difficulty: 1 },
  { text: "Argue that auto-tune is the greatest musical innovation of all time.", category: "pop-culture", difficulty: 2 },
  { text: "Make the case that video game characters deserve human rights.", category: "pop-culture", difficulty: 2 },

  // ═══════════════════════════════════════
  // 💼 WORKPLACE
  // ═══════════════════════════════════════
  { text: "Defend your decision to replace all the water in the office cooler with espresso.", category: "workplace", difficulty: 1 },
  { text: "Justify why stealing office supplies is a valid form of protest.", category: "workplace", difficulty: 2 },
  { text: "Argue that naps should be a mandatory, federally protected human right.", category: "workplace", difficulty: 1 },
  { text: "Convince HR that wearing pajamas to the office boosts productivity by 300%.", category: "workplace", difficulty: 1 },
  { text: "Argue that all meetings should be replaced by group naps.", category: "workplace", difficulty: 1 },
  { text: "Defend bringing your entire extended family to a job interview.", category: "workplace", difficulty: 2 },
  { text: "Make the case that email should be abolished and replaced with carrier pigeons.", category: "workplace", difficulty: 2 },

  // ═══════════════════════════════════════
  // 🍕 FOOD
  // ═══════════════════════════════════════
  { text: "Defend pineapple on pizza to a Sicilian grandmother whose honor depends on this.", category: "food", difficulty: 1 },
  { text: "Argue that cereal is a soup.", category: "food", difficulty: 1 },
  { text: "Argue why hot dogs qualify as tacos.", category: "food", difficulty: 1 },
  { text: "Explain why mayonnaise is the superior beverage.", category: "food", difficulty: 2 },
  { text: "Explain why cheese should be recognized as a valid currency.", category: "food", difficulty: 2 },
  { text: "Defend eating ice cream for breakfast as a lifestyle choice.", category: "food", difficulty: 1 },
  { text: "Argue that ketchup on steak is not only acceptable but required by law.", category: "food", difficulty: 2 },
  { text: "Make the case that water is just boneless ice.", category: "food", difficulty: 1 },
  { text: "Convince the court that a salad is just a deconstructed smoothie.", category: "food", difficulty: 2 },

  // ═══════════════════════════════════════
  // 🐻 ANIMALS
  // ═══════════════════════════════════════
  { text: "Justify why your pet is legally a person.", category: "animals", difficulty: 1 },
  { text: "Convince the jury that the ghost in your attic should pay rent.", category: "animals", difficulty: 2 },
  { text: "Justify why you should be allowed to bring a live bear on a commercial flight.", category: "animals", difficulty: 2 },
  { text: "Argue that fish are just underwater birds and should be regulated by the FAA.", category: "animals", difficulty: 2 },
  { text: "Defend the rights of squirrels to run for public office.", category: "animals", difficulty: 2 },
  { text: "Make the case that cats are actually running a secret government.", category: "animals", difficulty: 1 },
  { text: "Argue that dogs should be allowed to vote in local elections.", category: "animals", difficulty: 1 },

  // ═══════════════════════════════════════
  // 💻 TECHNOLOGY
  // ═══════════════════════════════════════
  { text: "Justify why you should be allowed to legally marry your smartphone.", category: "technology", difficulty: 2 },
  { text: "Argue that WiFi should be classified as a basic human need above food and water.", category: "technology", difficulty: 1 },
  { text: "Defend the position that robots make better friends than humans.", category: "technology", difficulty: 2 },
  { text: "Convince the court that your AI assistant is sentient and deserves vacation days.", category: "technology", difficulty: 2 },
  { text: "Argue that autocorrect has done more damage than any natural disaster.", category: "technology", difficulty: 1 },
  { text: "Make the case that charging your phone to 100% is a basic moral obligation.", category: "technology", difficulty: 1 },

  // ═══════════════════════════════════════
  // 🌀 HYPOTHETICAL
  // ═══════════════════════════════════════
  { text: "Explain why you deserve to inherit a medieval king's throne despite being a commoner.", category: "hypothetical", difficulty: 2 },
  { text: "Convince me that 'finders keepers' is a valid legal defense for stealing a car.", category: "hypothetical", difficulty: 2 },
  { text: "Defend your choice to speak entirely in a fake British accent.", category: "hypothetical", difficulty: 1 },
  { text: "Defend your choice to wear socks with sandals at a high-fashion gala.", category: "hypothetical", difficulty: 1 },
  { text: "Defend the practice of clapping when an airplane lands.", category: "hypothetical", difficulty: 1 },
  { text: "Argue that if you close your eyes in a store, everything you grab is free.", category: "hypothetical", difficulty: 2 },
  { text: "Convince the court that singing in the shower should count as a professional performance.", category: "hypothetical", difficulty: 1 },
  { text: "Argue that jaywalking is actually pedestrian innovation.", category: "hypothetical", difficulty: 2 },
  { text: "Make the case that talking to yourself is the highest form of expert consultation.", category: "hypothetical", difficulty: 1 },
  { text: "Defend the claim that every person has the right to a personal theme song that plays everywhere they go.", category: "hypothetical", difficulty: 2 },
];

// ═══════════════════════════════════════
// REVERSE-TRIAL prompts (argue AGAINST yourself)
// ═══════════════════════════════════════
export const REVERSE_SCENARIOS: Scenario[] = [
  { text: "Explain why YOU specifically should NOT be trusted with scissors.", category: "personal", difficulty: 1 },
  { text: "Argue why you're the WORST person to be left in charge of anything.", category: "personal", difficulty: 1 },
  { text: "Convince the court that you are the least qualified person in this room.", category: "personal", difficulty: 2 },
  { text: "Present evidence that you are secretly a villain.", category: "personal", difficulty: 2 },
  { text: "Explain why no one should ever take your advice on anything.", category: "personal", difficulty: 1 },
  { text: "Make the strongest case for why you should be banned from cooking forever.", category: "personal", difficulty: 1 },
  { text: "Argue why you would be the WORST superhero of all time.", category: "personal", difficulty: 1 },
  { text: "Convince the jury that you are guilty of being the most boring person alive.", category: "personal", difficulty: 2 },
];

/**
 * Get a random scenario that hasn't been used yet in this game.
 * Falls back to any scenario if all have been used.
 */
export function getRandomScenario(usedScenarios: string[] = [], mode: string = 'classic'): Scenario {
  const pool = mode === 'reverse' ? REVERSE_SCENARIOS : SCENARIOS;
  const available = pool.filter(s => !usedScenarios.includes(s.text));
  const source = available.length > 0 ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * Get scenarios filtered by category
 */
export function getScenariosByCategory(category: ScenarioCategory): Scenario[] {
  return SCENARIOS.filter(s => s.category === category);
}

/**
 * Category display info
 */
export const CATEGORY_INFO: Record<ScenarioCategory, { emoji: string; label: string }> = {
  'absurd': { emoji: '🤪', label: 'Absurd' },
  'philosophical': { emoji: '🧠', label: 'Big Brain' },
  'personal': { emoji: '😅', label: 'Personal' },
  'pop-culture': { emoji: '🎬', label: 'Pop Culture' },
  'workplace': { emoji: '💼', label: 'Workplace' },
  'food': { emoji: '🍕', label: 'Food Fight' },
  'animals': { emoji: '🐻', label: 'Animals' },
  'technology': { emoji: '💻', label: 'Tech' },
  'hypothetical': { emoji: '🌀', label: 'What If?' },
};

export const DIFFICULTY_INFO: Record<number, { emoji: string; label: string; points: number }> = {
  1: { emoji: '🟢', label: 'Easy', points: 1 },
  2: { emoji: '🟡', label: 'Medium', points: 2 },
  3: { emoji: '🔴', label: 'Hard', points: 3 },
};
