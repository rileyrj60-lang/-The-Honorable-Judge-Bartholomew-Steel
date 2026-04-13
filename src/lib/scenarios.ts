export const SCENARIOS = [
  "Convince me you should be the last human on Earth.",
  "Defend pineapple on pizza to a Sicilian grandmother whose honor depends on this.",
  "Explain why you deserve to inherit a medieval king's throne despite being a commoner.",
  "Justify why your pet is legally a person.",
  "Argue that cereal is a soup.",
  "Defend your choice to wear socks with sandals at a high-fashion gala.",
  "Convince the jury that the ghost in your attic should pay rent.",
  "Argue why hot dogs qualify as tacos.",
  "Explain to aliens why humanity's greatest achievement is the meme.",
  "Defend your decision to replace all the water in the office cooler with espresso.",
  "Justify why you should be allowed to legally marry your smartphone.",
  "Argue that naps should be a mandatory, federally protected human right.",
  "Explain why you deserve a refund for your college degree.",
  "Defend the practice of clapping when an airplane lands.",
  "Convince a judge that 'finders keepers' is a valid legal defense for stealing a car.",
  "Argue that pigeons are secretly government surveillance drones.",
  "Justify why you should be allowed to bring a live bear on a commercial flight.",
  "Explain why mayonnaise is the superior beverage.",
  "Defend your life choices to a panel of judgmental cats.",
  "Argue why the Earth is actually shaped like a donut.",
  "Convince me that math was invented by an evil wizard to torture children.",
  "Justify why you listed 'expert procrastinator' on your resume.",
  "Explain why reality TV is the peak of human culture.",
  "Defend your belief that the moon landing was real, but the moon itself is fake.",
  "Argue why everyone should be required to communicate strictly in interpretive dance.",
  "Convince the court that you are a time traveler from the year 3000.",
  "Justify why stealing office supplies is a valid form of protest.",
  "Explain why cheese should be recognized as a valid currency.",
  "Defend your choice to speak entirely in a fake British accent.",
  "Argue why the alphabet should be reorganized alphabetically."
];

export function getRandomScenario(): string {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}
