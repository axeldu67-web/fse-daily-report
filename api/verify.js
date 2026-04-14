const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { email } = req.body;
  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) return res.json({ active: false });
    const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 1 });
    res.json({ active: subs.data.length > 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
