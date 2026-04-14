const Anthropic = require("@anthropic-ai/sdk");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { text, targetLang } = req.body;
  if (!text || !text.trim()) return res.json({ translated: text });

  const sysPrompt = targetLang === "en"
    ? "You are a technical translator for field service engineers. Translate the input to professional English. Keep bullet point format with • symbols. Use direct, technical, field-oriented language. No fluff. Return ONLY the translated text, nothing else."
    : "Tu es un traducteur technique pour ingénieurs de maintenance. Traduis en français professionnel. Garde le format avec • . Langage direct et technique. Retourne UNIQUEMENT le texte traduit, rien d'autre.";

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-haiku-20240307",
      max_tokens: 500,
      system: sysPrompt,
      messages: [{ role: "user", content: text }]
    });
    res.json({ translated: message.content[0].text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message, translated: text });
  }
};
