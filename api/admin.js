const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { adminPassword } = req.body;
  if (adminPassword !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const [activeSubs, canceledSubs, customers] = await Promise.all([
      stripe.subscriptions.list({ status: "active", limit: 100 }),
      stripe.subscriptions.list({ status: "canceled", limit: 100 }),
      stripe.customers.list({ limit: 100 }),
    ]);
    const cm = {};
    customers.data.forEach(c => { cm[c.id] = c; });
    const mapSub = s => ({
      id: s.id,
      email: cm[s.customer]?.email || "—",
      name: cm[s.customer]?.name || s.metadata?.name || "—",
      status: s.status,
      start: new Date(s.start_date * 1000).toLocaleDateString("fr-FR"),
      amount: ((s.items.data[0]?.price?.unit_amount || 0) / 100).toFixed(2) + "€",
      customerId: s.customer,
    });
    res.json({
      active: activeSubs.data.map(mapSub),
      canceled: canceledSubs.data.map(mapSub),
      revenue: (activeSubs.data.length * 3.99).toFixed(2),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
