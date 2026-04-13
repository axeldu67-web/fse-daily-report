import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const email = s.customer_email;
    const name = s.metadata?.name || "";
    const customerId = s.customer;

    // Store in KV (Vercel KV or just return — frontend handles via session)
    console.log(`New subscriber: ${email} | ${name} | ${customerId}`);
  }

  res.json({ received: true });
}
