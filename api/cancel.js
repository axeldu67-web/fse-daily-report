const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { adminPassword, subscriptionId } = req.body;
  if (adminPassword !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
