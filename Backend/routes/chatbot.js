import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const faqsPath = path.resolve("faqs.json");

function stringSimilarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const common = a.split(" ").filter((word) => b.includes(word));
  return common.length / Math.max(a.split(" ").length, 1);
}

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ reply: "Invalid input." });
  }

  const userQuestion = message.toLowerCase().trim();

  try {
    const faqs = JSON.parse(fs.readFileSync(faqsPath, "utf8"));

    // Find best match (similarity-based)
    let bestMatch = null;
    let highestScore = 0;

    for (const faq of faqs) {
      const score = stringSimilarity(userQuestion, faq.question);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    if (highestScore > 0.3) {
      return res.json({ reply: bestMatch.answer });
    }

    // If no strong match found, find related topics
    const related = faqs
      .filter((faq) =>
        faq.question.split(" ").some((word) => userQuestion.includes(word))
      )
      .slice(0, 3)
      .map((f) => `• ${f.question}`);

    if (related.length > 0) {
      return res.json({
        reply:
          "I couldn't find an exact answer, but here are some related topics:\n" +
          related.join("\n"),
      });
    }

    return res.json({
      reply:
        "I'm sorry, I couldn’t find an answer to that. Please ask something related to your health consultation, appointments, or doctor support.",
    });
  } catch (err) {
    console.error("Chatbot error:", err);
    return res
      .status(500)
      .json({ reply: "Something went wrong while processing your request." });
  }
});

export default router;
