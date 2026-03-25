import Stripe from "stripe";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email requis" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    // Chercher le customer par email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) return res.status(404).json({ error: "Aucun abonnement trouvé" });

    const customerId = customers.data[0].id;
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    if (!subs.data.length) return res.status(404).json({ error: "Aucun abonnement actif" });

    // Annuler à la fin de la période
    await stripe.subscriptions.update(subs.data[0].id, { cancel_at_period_end: true });
    const endDate = new Date(subs.data[0].current_period_end * 1000).toLocaleDateString("fr-FR");

    return res.status(200).json({ success: true, endDate });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
