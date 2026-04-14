const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { email, name } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: process.env.NEXT_PUBLIC_URL + "/success?session_id={CHECKOUT_SESSION_ID}&name=" + encodeURIComponent(name||"") + "&email=" + encodeURIComponent(email||""),
      cancel_url: process.env.NEXT_PUBLIC_URL + "/",
      metadata: { name: name || "" },
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
