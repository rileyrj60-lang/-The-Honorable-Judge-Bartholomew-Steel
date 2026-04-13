import { getVerdict } from "../src/lib/gemini";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Please set GEMINI_API_KEY in .env.local");
    process.exit(1);
  }

  const scenario = "Defend pineapple on pizza to a Sicilian grandmother whose honor depends on this.";
  const submissions = [
    { nickname: "Player1", argument: "It is sweet and salty. Plus, tomatoes are fruits so you already put fruit on pizza." },
    { nickname: "Player2", argument: "I respect tradition, but pineapple cuts through the rich cheese. Also, I will pay you 10,000 dollars." },
    { nickname: "Player3", argument: "Pineapple pizza is an abomination, but it exists to punish sinners. We must eat it to purge our souls." }
  ];

  console.log("Mocking scenario...");
  console.log(`Scenario: ${scenario}`);
  console.log("Submissions:", submissions);
  console.log("--- Waiting for the Judge... ---");

  const verdict = await getVerdict(scenario, submissions);

  console.log("\nVerdict received:");
  console.dir(verdict, { depth: null });
}

run();
