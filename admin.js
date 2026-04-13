import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { adminPassword } = req.body;
  if (adminPassword !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [activeSubs, canceledSubs, customers] = await Promise.all([
      stripe.subscriptions.list({ status: "active", limit: 100 }),
      stripe.subscriptions.list({ status: "canceled", limit: 100 }),
      stripe.customers.list({ limit: 100 }),
    ]);

    const customerMap = {};
    customers.data.forEach(c => { customerMap[c.id] = c; });

    const mapSub = (sub) => {
      const c = customerMap[sub.customer] || {};
      return {
        id: sub.id,
        email: c.email || "—",
        name: c.name || sub.metadata?.name || "—",
        status: sub.status,
        start: new Date(sub.start_date * 1000).toLocaleDateString("fr-FR"),
        amount: (sub.items.data[0]?.price?.unit_amount / 100).toFixed(2) + "€",
        customerId: sub.customer,
      };
    };

    res.json({
      active: activeSubs.data.map(mapSub),
      canceled: canceledSubs.data.map(mapSub),
      revenue: (activeSubs.data.length * 3.99).toFixed(2),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
