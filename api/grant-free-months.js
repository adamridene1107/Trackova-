import { createClient } from "@supabase/supabase-js"

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" })

  const { email, months } = req.body || {}
  if (!email || !months) return res.status(400).json({ error: "Email et mois requis" })

  // Vérif env vars serveur
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      error: "Variables d'environnement serveur manquantes. Ajoute SUPABASE_URL et SUPABASE_SERVICE_KEY sur Vercel."
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calculer la date d'expiration
    const expiry = new Date()
    expiry.setMonth(expiry.getMonth() + parseInt(months))
    const freeUntil = expiry.toISOString().split("T")[0] // format YYYY-MM-DD

    // Chercher l'utilisateur par email dans auth.users via admin API
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) return res.status(500).json({ error: "Erreur Supabase Auth: " + usersError.message })

    const user = usersData?.users?.find(u => u.email?.toLowerCase() === email.trim().toLowerCase())
    if (!user) return res.status(404).json({ error: `Aucun compte trouvé pour ${email}` })

    const userId = user.id

    // Chercher ou créer la ligne goal_data
    const { data: goalData, error: goalError } = await supabase
      .from("goal_data")
      .select("id, settings")
      .eq("user_id", userId)
      .single()

    if (goalError && goalError.code !== "PGRST116") {
      return res.status(500).json({ error: "Erreur lecture goal_data: " + goalError.message })
    }

    const newSettings = {
      ...(goalData?.settings || {}),
      freeUntil,
      giftedMonths: parseInt(months),
      subscribed: false, // pas abonné Stripe mais accès gratuit
    }

    if (goalData) {
      const { error: updateError } = await supabase
        .from("goal_data")
        .update({ settings: newSettings, updated_at: new Date().toISOString() })
        .eq("id", goalData.id)
      if (updateError) return res.status(500).json({ error: "Erreur mise à jour: " + updateError.message })
    } else {
      const { error: insertError } = await supabase
        .from("goal_data")
        .insert({ user_id: userId, settings: newSettings })
      if (insertError) return res.status(500).json({ error: "Erreur insertion: " + insertError.message })
    }

    // Stripe optionnel — ne bloque pas si non configuré
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (stripeKey) {
      try {
        const { default: Stripe } = await import("stripe")
        const stripe = new Stripe(stripeKey)
        const customers = await stripe.customers.list({ email: email.trim(), limit: 1 })
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id
          const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 })
          if (subs.data.length > 0) {
            await stripe.subscriptions.update(subs.data[0].id, {
              trial_end: Math.floor(expiry.getTime() / 1000),
            })
          }
        }
      } catch (stripeErr) {
        // Stripe a planté mais Supabase est OK → on continue
        console.warn("Stripe non mis à jour:", stripeErr.message)
      }
    }

    return res.status(200).json({
      success: true,
      email,
      months: parseInt(months),
      freeUntil,
      message: `✅ Accès gratuit accordé à ${email} jusqu'au ${new Date(freeUntil).toLocaleDateString("fr-FR")}`
    })

  } catch (err) {
    console.error("grant-free-months error:", err)
    return res.status(500).json({ error: err.message || "Erreur interne" })
  }
}
