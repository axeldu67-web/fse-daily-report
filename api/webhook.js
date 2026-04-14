const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  if (event.type === "checkout.session.completed") {
    console.log("New subscriber:", event.data.object.customer_email);
  }
  res.json({ received: true });
};
